/**
 * <x-p5> - Sketch / simulazione / visualizzazione interattiva con p5.js
 *
 * Lo sketch può arrivare in due modi:
 *   - INLINE: il codice è scritto nel markdown dentro un blocco :::p5 e arriva
 *     qui come testo di uno <script type="application/x-p5-sketch"> (non
 *     eseguibile dal browser).
 *   - RIUSABILE: il blocco usa `sketch=<nome>` (attributo data-sketch) e il
 *     codice vive in static/sketches/<nome>.js (un file per sketch, che si
 *     registra in window.P5Sketches). Il file viene caricato AL VOLO solo quando
 *     serve, come p5 dal CDN. I parametri del markdown arrivano in data-params
 *     (JSON) e sono esposti allo sketch come ctx.params.
 * In entrambi i casi lo sketch gira in p5 "instance mode" e riceve `p`
 * (l'istanza p5) e `ctx` (il ponte con la piattaforma).
 *
 * Attributi:
 *   id           presente solo se il blocco ha il flag `goal`: rende lo sketch
 *                un goal tracciato da <x-step>
 *   data-height  altezza suggerita del canvas (default 400)
 *   data-width   larghezza suggerita del canvas (opzionale)
 *   data-bind    variabili osservate (per ctx.onChange e per il redraw degli
 *                sketch con noLoop), separate da virgola
 *   data-sketch  nome dello sketch registrato in window.P5Sketches (riusabile)
 *   data-params  JSON dei parametri passati dal markdown (→ ctx.params)
 *
 * Oggetto ctx passato allo sketch:
 *   ctx.complete()    segnala il completamento del goal (idempotente; no-op se
 *                     lo sketch non è un goal)
 *   ctx.completed     true se il goal è già stato completato (anche da storage)
 *   ctx.model         valori live di slider e campi numerici della pagina
 *                     (es. ctx.model.a, ctx.model.ax): stesso modello di x-graph
 *   ctx.onChange(cb)  registra cb(nome, valore) chiamata a ogni variable-change
 *   ctx.width/height  dimensioni suggerite (da usare in p.createCanvas)
 *   ctx.setHeight(h)  cambia l'altezza del canvas a runtime (es. per passare a
 *                     un layout portrait su mobile); il ResizeObserver la rispetta
 *   ctx.params        parametri del markdown (solo sketch riusabili)
 *
 * Eventi:
 *   goal-complete: quando lo sketch chiama ctx.complete() (solo se ha id)
 *
 * p5.js viene caricato dal CDN al volo, solo nelle pagine che contengono almeno
 * uno sketch (lazy load con guard "una volta sola", come mathjs).
 */

const P5_CDN = 'https://cdn.jsdelivr.net/npm/p5@1.11.0/lib/p5.min.js';

// URL di QUESTO script, catturato a load-time (document.currentScript è valido
// solo durante l'esecuzione sincrona iniziale, non nelle callback async). Serve
// a risolvere i file degli sketch riusabili come fratelli di p5.js, così i path
// restano corretti anche sotto un subpath (GitHub Pages, Frozen-Flask).
const SELF_URL =
  (document.currentScript && document.currentScript.src) ||
  (document.querySelector('script[src*="/components/p5.js"]') || {}).src ||
  '';

// .../static/components/p5.js  →  .../static/sketches/<nome>.js
function sketchUrl(name) {
  return SELF_URL.replace(/components\/p5\.js(\?.*)?$/, `sketches/${name}.js`);
}

class XP5 extends HTMLElement {
  async connectedCallback() {
    const scriptEl = this.querySelector('script[type="application/x-p5-sketch"]');
    const code = scriptEl ? scriptEl.textContent : '';

    const sketchName = this.dataset.sketch || null;
    // Parametri del markdown (solo sketch riusabili). Input d'autore, ma
    // difendiamoci comunque da un JSON malformato.
    let params = {};
    if (this.dataset.params) {
      try {
        params = JSON.parse(this.dataset.params);
      } catch (e) {
        console.error('data-params non è JSON valido:', e);
      }
    }

    // Altezza mutabile: uno sketch può chiamare ctx.setHeight(h) per cambiare
    // layout a runtime (es. passare a portrait su mobile).
    let height = parseInt(this.dataset.height || '400', 10);
    const widthAttr = this.dataset.width ? parseInt(this.dataset.width, 10) : null;

    const container = document.createElement('div');
    container.className = 'p5-container';
    // Senza una larghezza esplicita lo sketch è responsive: rendiamo il
    // container block così riempie la colonna di testo e possiamo misurarne la
    // larghezza reale. Un inline-block vuoto misurerebbe 0 → il canvas verrebbe
    // creato a una larghezza di ripiego (troppo larga) e poi schiacciato dal
    // CSS in orizzontale (cerchi che diventano ellissi, testo illeggibile).
    if (!widthAttr) {
      container.style.display = 'block';
    } else {
      // Larghezza fissa: block + cap a maxWidth (NON inline-block, che come
      // shrink-to-fit collassa insieme al canvas max-width:100% e viene
      // ritagliato da overflow:hidden). Su colonne strette scala in proporzione.
      container.style.display = 'block';
      container.style.maxWidth = widthAttr + 'px';
    }
    this.appendChild(container);

    // Carica p5.js al volo (no-op se già presente/caricato)
    try {
      await XP5.loadP5();
    } catch {
      container.innerHTML = '<p class="p5-error">p5.js non disponibile.</p>';
      return;
    }

    const step = this.closest('x-step');
    this.step = step;

    // Ripristino: se questo sketch (goal) risultava già completato, lo sketch
    // può disegnare lo stato "fatto" leggendo ctx.completed. Non ri-emettiamo
    // l'evento: x-step ricostruisce la contabilità dei goal da storage.
    const saved = window.courseProgress
      ? window.courseProgress.getStepForElement(this)
      : null;
    const savedDone = Boolean(
      this.id && saved && Array.isArray(saved.goals) && saved.goals.includes(this.id)
    );
    if (savedDone) this.setAttribute('data-completed', 'true');

    const changeCallbacks = [];
    const self = this;
    // Larghezza iniziale: quella imposta dall'autore, altrimenti la larghezza
    // reale del container (sketch responsive). Fallback prudente se la misura
    // non è ancora disponibile.
    const initialWidth = widthAttr || container.clientWidth || 600;
    const ctx = {
      completed: savedDone,
      // Modello live: risolto a ogni accesso perché l'upgrade dei custom
      // element può non essere completo quando lo sketch parte (come x-graph).
      get model() {
        return (self.step && self.step.model) ? self.step.model : {};
      },
      complete() {
        ctx.completed = true;
        self.markComplete();
      },
      onChange(cb) {
        if (typeof cb === 'function') changeCallbacks.push(cb);
      },
      // Larghezza:
      //  - fissa (widthAttr): sempre il valore d'autore. Fondamentale perché p5
      //    esegue setup() in modo asincrono, DOPO che this.p5Instance è già
      //    assegnato: se leggessimo self.p5Instance.width, createCanvas()
      //    riceverebbe la larghezza di default di p5 (100) invece di widthAttr.
      //    Gli sketch responsive vengono salvati dal ResizeObserver, quelli a
      //    larghezza fissa no → resterebbero 100×100 (bug dei pannelli solari).
      //  - responsive (no widthAttr): larghezza live dell'istanza, così la
      //    layout() dello sketch segue i ridimensionamenti (rotazione, resize);
      //    prima dell'avvio vale initialWidth (larghezza reale del container).
      get width() { return widthAttr || (self.p5Instance ? self.p5Instance.width : initialWidth); },
      // Altezza: normalmente quella d'autore, ma uno sketch può cambiarla con
      // ctx.setHeight() (es. layout portrait su mobile). `height` è una `let`
      // catturata nella closure: il getter e il ResizeObserver ne leggono il
      // valore live.
      get height() { return height; },
      setHeight(h) {
        // Confrontiamo con l'altezza REALE del canvas (non con la sola variabile
        // `height`): così, se la prima chiamata avviene prima che p5Instance sia
        // assegnato, un draw successivo applica comunque il resize invece di
        // saltarlo per via di un guard su un valore già aggiornato.
        height = Math.max(1, Math.round(h));
        const inst = self.p5Instance;
        if (inst && typeof inst.resizeCanvas === 'function'
            && Math.abs(inst.height - height) > 0) {
          inst.resizeCanvas(inst.width, height);
        }
      },
      // Parametri passati dal markdown (data-params). Vuoto per gli sketch inline.
      params,
    };

    // Risolve la funzione dello sketch:
    //  - riusabile (data-sketch): dal registro globale window.P5Sketches;
    //  - inline: compilando il codice del <script> (input fidato dell'autore,
    //    come le espressioni di x-graph).
    let sketchFn;
    if (sketchName) {
      // Carica al volo static/sketches/<nome>.js (no-op se già presente) e poi
      // pesca la factory dal registro.
      try {
        await XP5.loadSketch(sketchName);
      } catch (e) {
        console.error(`Impossibile caricare lo sketch p5 "${sketchName}":`, e);
        container.innerHTML = `<p class="p5-error">Sketch p5 "${sketchName}" non caricato.</p>`;
        return;
      }
      const registry = window.P5Sketches || {};
      sketchFn = registry[sketchName];
      if (typeof sketchFn !== 'function') {
        console.error(`Sketch p5 "${sketchName}" non trovato nel registro window.P5Sketches.`);
        container.innerHTML = `<p class="p5-error">Sketch p5 "${sketchName}" non trovato.</p>`;
        return;
      }
    } else {
      try {
        // eslint-disable-next-line no-new-func
        sketchFn = new Function('p', 'ctx', code);
      } catch (e) {
        console.error('Errore di sintassi nello sketch p5:', e);
        container.innerHTML = '<p class="p5-error">Errore nello sketch p5.</p>';
        return;
      }
    }

    try {
      // p5 instance mode: la closure assegna p.setup/p.draw e attacca il canvas
      // dentro `container`.
      this.p5Instance = new p5((p) => sketchFn(p, ctx), container);
    } catch (e) {
      console.error('Errore di esecuzione dello sketch p5:', e);
      container.innerHTML = '<p class="p5-error">Errore nello sketch p5.</p>';
      return;
    }

    // Sketch responsive (senza width fissa): ridimensiona il canvas quando la
    // colonna di testo cambia larghezza (rotazione del device, resize della
    // finestra, cambio device negli strumenti di sviluppo). La layout() dello
    // sketch usa ctx.width/height, quindi si riadatta da sola al frame
    // successivo. Niente loop: la larghezza del canvas segue il container, non
    // viceversa.
    if (!widthAttr && this.p5Instance && typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        const w = container.clientWidth;
        const inst = this.p5Instance;
        if (w && inst && typeof inst.resizeCanvas === 'function'
            && Math.abs(w - inst.width) > 1) {
          inst.resizeCanvas(w, height);
        }
      });
      this._resizeObserver.observe(container);
    }

    // Reattività agli slider/campi numerici della pagina: inoltra i cambi alle
    // callback registrate e ridisegna gli sketch che usano noLoop.
    if (step) {
      step.addEventListener('variable-change', (e) => {
        changeCallbacks.forEach((cb) => {
          try { cb(e.detail.name, e.detail.value); } catch (err) { console.error(err); }
        });
        const inst = this.p5Instance;
        if (inst && typeof inst.isLooping === 'function' && !inst.isLooping()) {
          inst.redraw();
        }
      });
    }
  }

  disconnectedCallback() {
    // Ferma l'osservazione del resize prima di smontare lo sketch.
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    // Libera il canvas e il loop di p5 quando lo step viene rimosso dal DOM.
    if (this.p5Instance && typeof this.p5Instance.remove === 'function') {
      this.p5Instance.remove();
      this.p5Instance = null;
    }
  }

  markComplete() {
    if (this.hasAttribute('data-completed')) return;
    this.setAttribute('data-completed', 'true');
    // Sketch di sola visualizzazione (senza flag `goal`): niente id, niente goal.
    if (!this.id) return;
    this.dispatchEvent(new CustomEvent('goal-complete', {
      bubbles: true,
      composed: true,
      detail: { goalId: this.id },
    }));
  }

  // Carica p5.js una sola volta per pagina; le chiamate concorrenti
  // condividono la stessa promise.
  static loadP5() {
    if (typeof window.p5 !== 'undefined') return Promise.resolve();
    if (XP5._loadPromise) return XP5._loadPromise;

    XP5._loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = P5_CDN;
      script.onload = () => resolve();
      script.onerror = () => {
        XP5._loadPromise = null;
        reject(new Error('p5.js load failed'));
      };
      document.head.appendChild(script);
    });
    return XP5._loadPromise;
  }

  // Carica lo sketch riusabile `name` da static/sketches/<name>.js, una sola
  // volta per pagina; le chiamate concorrenti condividono la stessa promise.
  // Ogni file registra la sua factory in window.P5Sketches.
  static loadSketch(name) {
    if (window.P5Sketches && typeof window.P5Sketches[name] === 'function') {
      return Promise.resolve();
    }
    XP5._sketchPromises = XP5._sketchPromises || {};
    if (XP5._sketchPromises[name]) return XP5._sketchPromises[name];

    XP5._sketchPromises[name] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = sketchUrl(name);
      script.onload = () => resolve();
      script.onerror = () => {
        XP5._sketchPromises[name] = null;
        reject(new Error(`sketch load failed: ${name}`));
      };
      document.head.appendChild(script);
    });
    return XP5._sketchPromises[name];
  }
}

XP5._loadPromise = null;
XP5._sketchPromises = {};

customElements.define('x-p5', XP5);
