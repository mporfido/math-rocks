/**
 * <x-p5> - Sketch / simulazione / visualizzazione interattiva con p5.js
 *
 * Il codice dello sketch è scritto nel markdown dentro un blocco :::p5 e
 * arriva qui come testo di uno <script type="application/x-p5-sketch"> (non
 * eseguibile dal browser). Lo eseguiamo in p5 "instance mode": lo sketch
 * riceve `p` (l'istanza p5) e `ctx` (il ponte con la piattaforma).
 *
 * Attributi:
 *   id           presente solo se il blocco ha il flag `goal`: rende lo sketch
 *                un goal tracciato da <x-step>
 *   data-height  altezza suggerita del canvas (default 400)
 *   data-width   larghezza suggerita del canvas (opzionale)
 *   data-bind    variabili osservate (per ctx.onChange e per il redraw degli
 *                sketch con noLoop), separate da virgola
 *
 * Oggetto ctx passato allo sketch:
 *   ctx.complete()    segnala il completamento del goal (idempotente; no-op se
 *                     lo sketch non è un goal)
 *   ctx.completed     true se il goal è già stato completato (anche da storage)
 *   ctx.model         valori live di slider e campi numerici della pagina
 *                     (es. ctx.model.a, ctx.model.ax): stesso modello di x-graph
 *   ctx.onChange(cb)  registra cb(nome, valore) chiamata a ogni variable-change
 *   ctx.width/height  dimensioni suggerite (da usare in p.createCanvas)
 *
 * Eventi:
 *   goal-complete: quando lo sketch chiama ctx.complete() (solo se ha id)
 *
 * p5.js viene caricato dal CDN al volo, solo nelle pagine che contengono almeno
 * uno sketch (lazy load con guard "una volta sola", come mathjs).
 */

const P5_CDN = 'https://cdn.jsdelivr.net/npm/p5@1.11.0/lib/p5.min.js';

class XP5 extends HTMLElement {
  async connectedCallback() {
    const scriptEl = this.querySelector('script[type="application/x-p5-sketch"]');
    const code = scriptEl ? scriptEl.textContent : '';

    const height = parseInt(this.dataset.height || '400', 10);
    const widthAttr = this.dataset.width ? parseInt(this.dataset.width, 10) : null;

    const container = document.createElement('div');
    container.className = 'p5-container';
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
      width: widthAttr || container.clientWidth || 600,
      height,
    };

    // Lo sketch viene dai file del corso (input fidato, non utente), come le
    // espressioni di x-graph.
    let sketchFn;
    try {
      // eslint-disable-next-line no-new-func
      sketchFn = new Function('p', 'ctx', code);
    } catch (e) {
      console.error('Errore di sintassi nello sketch p5:', e);
      container.innerHTML = '<p class="p5-error">Errore nello sketch p5.</p>';
      return;
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
}

XP5._loadPromise = null;

customElements.define('x-p5', XP5);
