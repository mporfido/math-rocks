/**
 * <x-formula> — la formula commentata
 * ===================================
 *
 * Una formula grande, composta da MathJax, con delle FRECCE COMMENTATE fra sue
 * sotto-parti: dalla base di sinistra a quella di destra "reciproco", dai due
 * esponenti "cambia segno". Serve a dire quello che la formula da sola non
 * dice: che cosa corrisponde a che cosa fra i due lati dell'uguale.
 *
 * Sintassi d'autore (vedi MARKDOWN_SYNTAX.md):
 *
 *     :::formula
 *     @b1{2}^{@e1{-2}} = \left(@b2{\tfrac{1}{2}}\right)^{@e2{2}}
 *
 *     b1 -> b2 : reciproco
 *     e1 -> e2 : cambia segno
 *     :::
 *
 * Il preprocessore traduce `@nome{...}` in `\class{fx-nome}{...}`: MathJax
 * (estensione html, caricata in _assets.html) mette quella classe
 * sull'elemento composto, e da lì si misura il rettangolo a cui agganciare la
 * freccia. Ecco perché è un componente e non uno sketch p5: gli estremi delle
 * frecce sono pezzi di formula renderizzati nel DOM, non disegnati a mano.
 *
 * A riposo tutte le frecce sono visibili ma tenui. Toccandone una (o passandoci
 * sopra, o arrivandoci col TAB) restano a fuoco solo lei, il suo commento e i
 * due estremi nella formula; le altre si smorzano — la stessa logica dei fili
 * di <x-theorem>. Non è un goal: è un elemento espositivo.
 */

// Distanza fra la formula e la prima corsia di frecce, e passo fra le corsie.
const FX_STACCO = 14;
const FX_CORSIA = 30;
// Aria fra il tratto in piano di una staffa e il suo commento.
const FX_ARIA = 8;

class XFormula extends HTMLElement {
  connectedCallback() {
    if (this._montato) return;
    this._montato = true;

    this.tex = this.dataset.tex || '';
    this.frecce = this.readJSON('arrows', []);
    this.attivo = null;      // indice della freccia a fuoco
    this.bloccato = false;   // a fuoco per click, non per passaggio del mouse

    this.buildDom();
    this.typeset();

    // Un click fuori rilascia il fuoco appiccicato (tocco su mobile).
    this._fuori = (e) => { if (!this.contains(e.target)) this.rilascia(); };
    document.addEventListener('click', this._fuori);
  }

  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
    document.removeEventListener('click', this._fuori);
  }

  /** Legge un attributo data-* JSON senza far esplodere la pagina se è rotto. */
  readJSON(name, fallback) {
    const raw = this.dataset[name];
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error(`x-formula: data-${name} non è JSON valido`, e);
      return fallback;
    }
  }

  // -- Costruzione DOM --------------------------------------------------------

  buildDom() {
    this.classList.add('fx');
    this.innerHTML = '';

    this.scena = document.createElement('div');
    this.scena.className = 'fx-scena';

    // Solo la formula, per ora: archi ed etichette entrano DOPO il typeset, così
    // MathJax non trova testo estraneo da comporre dentro il proprio contenitore.
    this.box = document.createElement('div');
    this.box.className = 'fx-math';
    this.box.innerHTML = `\\[ ${this.tex} \\]`;

    this.scena.appendChild(this.box);
    this.appendChild(this.scena);
  }

  /** Archi ed etichette: overlay ancorati al riquadro della formula. */
  buildOverlay() {
    if (this.svg) return;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'fx-archi no-math');
    this.svg.setAttribute('aria-hidden', 'true');

    this.etichette = document.createElement('div');
    this.etichette.className = 'fx-etichette no-math';

    this.frecce.forEach((freccia, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'fx-label';
      b.textContent = freccia.testo;
      b.dataset.i = String(i);
      b.addEventListener('pointerenter', () => this.accendi(i));
      b.addEventListener('pointerleave', () => this.spegni());
      b.addEventListener('focus', () => this.accendi(i));
      b.addEventListener('blur', () => this.spegni());
      b.addEventListener('click', (e) => { e.stopPropagation(); this.fissa(i); });
      this.etichette.appendChild(b);
    });

    this.box.appendChild(this.svg);
    this.box.appendChild(this.etichette);

    // Anche la formula è sensibile: passando su una base si accende la freccia
    // che la riguarda. È il verso naturale della lettura (dal simbolo al
    // commento), oltre a quello dal commento al simbolo.
    this.frecce.forEach((freccia, i) => {
      [freccia.da, freccia.a].forEach((nome) => {
        const el = this.ancora(nome);
        if (!el) return;
        el.classList.add('fx-ancora');
        el.addEventListener('pointerenter', () => this.accendi(i));
        el.addEventListener('pointerleave', () => this.spegni());
      });
    });
  }

  ancora(nome) {
    return this.box.querySelector(`.fx-${CSS.escape(nome)}`);
  }

  /**
   * Il componente si monta mentre la pagina è ancora in caricamento: a quel
   * punto `MathJax` esiste già (è l'oggetto di configurazione nel <head>) ma
   * `MathJax.typesetPromise` NO — lo aggiunge lo startup, che finisce dopo.
   * Chi si limita a controllare `typesetPromise` e rinunciare perde la corsa e
   * non aggancia mai le frecce: succede in modo intermittente, a seconda di
   * quanto è veloce ad arrivare la libreria dal CDN. Qui si aspetta lo startup.
   */
  typeset() {
    const avvia = () => {
      if (typeof MathJax === 'undefined' || !MathJax.typesetPromise) return false;
      // Prima si compone, poi si misura: il typeset cambia le dimensioni di tutto.
      MathJax.typesetPromise([this.box])
        .then(() => {
          this.buildOverlay();
          this.disegna();
          this.osserva();
        })
        .catch((err) => console.error('x-formula: MathJax', err));
      return true;
    };

    if (avvia()) return;

    const startup = typeof MathJax !== 'undefined' && MathJax.startup && MathJax.startup.promise;
    if (startup) {
      startup.then(avvia).catch((err) => console.error('x-formula: MathJax', err));
    } else {
      // Nessuno startup in vista: o la libreria arriva a pagina caricata, o la
      // pagina è senza MathJax e resta la formula grezza, senza frecce.
      window.addEventListener('load', () => avvia(), { once: true });
    }
  }

  /**
   * I rettangoli su cui poggiano gli archi cambiano dopo il render: i webfont
   * arrivano tardi, la colonna si restringe, un re-typeset globale ricompone la
   * formula. Senza riosservare, gli archi restano dov'erano.
   */
  osserva() {
    if (typeof ResizeObserver === 'undefined') return;
    if (!this._ro) this._ro = new ResizeObserver(() => this.disegna());
    this._ro.disconnect();
    this._ro.observe(this.box);
    this.frecce.forEach((f) => {
      [f.da, f.a].forEach((nome) => {
        const el = this.ancora(nome);
        if (el) this._ro.observe(el);
      });
    });
  }

  // -- Disegno ----------------------------------------------------------------

  /**
   * Geometria di una freccia, in coordinate relative al riquadro della formula
   * (y negativa = sopra la formula). Le corsie evitano che due archi dallo
   * stesso lato si accavallino.
   */
  disegna() {
    if (!this.svg) return;
    const base = this.box.getBoundingClientRect();
    if (!base.height) return;

    const geo = [];
    for (const freccia of this.frecce) {
      const a = this.ancora(freccia.da);
      const b = this.ancora(freccia.a);
      if (!a || !b) return;   // typeset non ancora fatto: si ridisegna dopo
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const box = (r) => ({
        cx: r.left + r.width / 2 - base.left,
        top: r.top - base.top,
        bottom: r.bottom - base.top,
      });
      geo.push({ freccia, a: box(ra), b: box(rb) });
    }

    // Lato: forzato dall'autore, oppure dedotto da dove stanno gli estremi.
    // Una freccia passa SOPRA solo se entrambi gli estremi stanno tutti nella
    // metà alta della formula — cioè se sono esponenti. Basta che uno dei due
    // poggi sulla riga di scrittura perché la freccia giri per di sotto: è da
    // lì che quel simbolo si affaccia.
    const mezzo = base.height / 2 + 2;
    geo.forEach((g) => {
      g.sopra = g.freccia.lato === 'auto'
        ? (g.a.bottom < mezzo && g.b.bottom < mezzo)
        : g.freccia.lato === 'sopra';
    });

    // Corsie: archi dello stesso lato che si sovrappongono in orizzontale
    // vengono impilati (il primo vicino alla formula).
    const occupate = { sopra: [], sotto: [] };
    geo.forEach((g, i) => {
      const x0 = Math.min(g.a.cx, g.b.cx);
      const x1 = Math.max(g.a.cx, g.b.cx);
      const lato = g.sopra ? occupate.sopra : occupate.sotto;
      let corsia = 0;
      while (lato[corsia] && lato[corsia].some(([p, q]) => x0 < q && x1 > p)) corsia++;
      (lato[corsia] = lato[corsia] || []).push([x0, x1]);
      g.corsia = corsia;
      const et = this.etichette.children[i];
      g.hEtichetta = et ? et.getBoundingClientRect().height : 0;
    });

    // Quanto dista una corsia dalla formula: la somma delle corsie sotto di lei,
    // ciascuna alta quanto il suo commento. Senza questo, l'arco di una corsia
    // esterna passerebbe attraverso l'etichetta di quella interna.
    const stacchi = { sopra: [FX_STACCO], sotto: [FX_STACCO] };
    ['sopra', 'sotto'].forEach((lato) => {
      const corsie = occupate[lato].length;
      for (let k = 1; k < corsie; k++) {
        const alte = geo.filter((g) => (g.sopra ? 'sopra' : 'sotto') === lato && g.corsia === k - 1);
        const h = Math.max(FX_CORSIA, ...alte.map((g) => g.hEtichetta + 12));
        stacchi[lato][k] = stacchi[lato][k - 1] + h;
      }
    });

    let sfondo = '';
    let tocchi = '';
    let minY = 0;
    let maxY = base.height;

    geo.forEach((g, i) => {
      const y0 = g.sopra ? g.a.top - 3 : g.a.bottom + 3;
      const y1 = g.sopra ? g.b.top - 3 : g.b.bottom + 3;
      // Le corsie si contano dal bordo della formula, non dai singoli estremi:
      // due staffe che partono da simboli a quote diverse (un esponente e un
      // pedice) resterebbero altrimenti a distanze diverse, e la seconda
      // finirebbe addosso al commento della prima.
      const partenza = g.sopra ? 0 : base.height;
      const v = g.sopra ? -1 : 1;
      const stacco = stacchi[g.sopra ? 'sopra' : 'sotto'][g.corsia];
      const apice = partenza + v * stacco;

      // Forma a staffa (sale, corre in piano, scende) e non arco morbido: il
      // tratto in piano sta tutto alla quota della sua corsia, così l'arco di
      // una corsia esterna non attraversa il commento di quella interna — cosa
      // che con una curva, che risale verso gli estremi, succede sempre.
      const dx = Math.sign(g.b.cx - g.a.cx) || 1;
      const r = Math.min(9, Math.abs(g.b.cx - g.a.cx) / 2, stacco / 2);
      const d = `M ${g.a.cx} ${y0} L ${g.a.cx} ${apice - v * r}`
        + ` Q ${g.a.cx} ${apice}, ${g.a.cx + dx * r} ${apice}`
        + ` L ${g.b.cx - dx * r} ${apice}`
        + ` Q ${g.b.cx} ${apice}, ${g.b.cx} ${apice - v * r}`
        + ` L ${g.b.cx} ${y1}`;

      // La punta è disegnata a mano invece che con un <marker>: i marker vanno
      // referenziati per id, e con più formule nella stessa pagina gli id si
      // ripetono. Qui la tangente in arrivo è verticale per costruzione (l'ultimo
      // punto di controllo ha la stessa x dell'estremo), quindi la punta guarda
      // sempre verso la formula.
      const punta = `M ${g.b.cx - 4} ${y1 + 6 * v} L ${g.b.cx + 4} ${y1 + 6 * v}`
        + ` L ${g.b.cx} ${y1} z`;

      sfondo += `<path class="fx-arco" data-i="${i}" d="${d}" fill="none"/>`
        + `<path class="fx-punta" data-i="${i}" d="${punta}"/>`;
      // Gemello spesso e trasparente: la freccia si tocca anche col dito.
      tocchi += `<path class="fx-tocco" data-i="${i}" d="${d}" fill="none"/>`;

      g.apice = apice;
      minY = Math.min(minY, apice);
      maxY = Math.max(maxY, apice);
    });

    // I bersagli per il tocco stanno sopra a tutto il resto.
    this.svg.innerHTML = sfondo + tocchi;

    this.svg.querySelectorAll('.fx-tocco').forEach((p) => {
      const i = Number(p.dataset.i);
      p.addEventListener('pointerenter', () => this.accendi(i));
      p.addEventListener('pointerleave', () => this.spegni());
      p.addEventListener('click', (e) => { e.stopPropagation(); this.fissa(i); });
    });

    // Etichette al centro del tratto in piano, appena oltre la staffa.
    geo.forEach((g, i) => {
      const el = this.etichette.children[i];
      if (!el) return;
      const v = g.sopra ? -1 : 1;
      el.style.left = `${(g.a.cx + g.b.cx) / 2}px`;
      el.style.top = `${g.apice + v * FX_ARIA}px`;
      el.style.transform = `translate(-50%, ${g.sopra ? '-100%' : '0'})`;
      const r = el.getBoundingClientRect();
      if (g.sopra) minY = Math.min(minY, g.apice - FX_ARIA - r.height);
      else maxY = Math.max(maxY, g.apice + FX_ARIA + r.height);
    });

    // Archi ed etichette sfondano il riquadro della formula: la scena si allarga
    // per far loro posto, invece di finire addosso al paragrafo vicino.
    this.scena.style.paddingTop = `${Math.max(0, -minY) + 4}px`;
    this.scena.style.paddingBottom = `${Math.max(0, maxY - base.height) + 4}px`;
  }

  // -- Fuoco ------------------------------------------------------------------

  /** Mette a fuoco una freccia: il resto è CSS, guidato da data-attivo. */
  accendi(i) {
    if (this.bloccato) return;
    this.applica(i);
  }

  spegni() {
    if (this.bloccato) return;
    this.applica(null);
  }

  /** Click/tocco: il fuoco resta finché non si tocca altrove. */
  fissa(i) {
    if (this.bloccato && this.attivo === i) {
      this.bloccato = false;
      this.applica(null);
      return;
    }
    this.bloccato = true;
    this.applica(i);
  }

  rilascia() {
    if (!this.bloccato) return;
    this.bloccato = false;
    this.applica(null);
  }

  applica(i) {
    if (this.attivo === i) return;
    this.attivo = i;

    if (i === null) delete this.dataset.attivo;
    else this.dataset.attivo = String(i);

    this.querySelectorAll('.fx-arco, .fx-punta, .fx-label').forEach((el) => {
      el.classList.toggle('is-attivo', i !== null && Number(el.dataset.i) === i);
    });

    this.box.querySelectorAll('.fx-acceso').forEach((el) => el.classList.remove('fx-acceso'));
    if (i !== null) {
      const f = this.frecce[i];
      [f.da, f.a].forEach((nome) => {
        const el = this.ancora(nome);
        if (el) el.classList.add('fx-acceso');
      });
    }
  }
}

customElements.define('x-formula', XFormula);
