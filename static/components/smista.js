/**
 * <x-smista> — cartellini da assegnare a categorie.
 *
 * Il gesto è quello di chi ha in mano un mazzo di espressioni e le mette in
 * mucchietti: «quali di queste sono monomi?», «raggruppale per grado». È il
 * modo di far *classificare* prima di dare i nomi.
 *
 * Sintassi markdown → `docs/smista.md` (blocco `:::smista`).
 *
 * Attributi (generati da parser/preprocessors.py::process_smista):
 *   data-categorie  array JSON di etichette, nell'ordine dei contenitori
 *   data-carte      array JSON di { tex, cat } — `cat` è la soluzione (o null)
 *   data-verdetto   "no" → smistamento libero, nessun controllo, nessun goal
 *   data-mescola    "no" → i cartellini restano nell'ordine del markdown
 *   data-titolo     intestazione sopra il mazzo
 *   id              presente solo con il flag `goal`
 *
 * Eventi:
 *   goal-complete   quando ogni cartellino è nel contenitore giusto
 *
 * Tre modi di muovere un cartellino, tutti e tre sempre attivi:
 *   1. trascinandolo (Pointer Events: mouse e dito con lo stesso handler);
 *   2. toccandolo e poi toccando il contenitore (l'unico comodo su telefono);
 *   3. da tastiera: Invio lo prende, i tasti 1..9 lo mettono nel contenitore
 *      n-esimo, 0 lo rimanda nel mazzo.
 *
 * Il feedback è NEUTRO, come negli sketch della piattaforma: niente rosso. Chi
 * sbaglia non vede un errore, vede il cartellino tornare nel mazzo.
 */
class XSmista extends HTMLElement {
  connectedCallback() {
    if (this.dataset.built) return;
    this.dataset.built = 'true';

    this.categorie = this.readJSON('categorie', []);
    this.carte = this.readJSON('carte', []);
    this.conVerdetto = this.dataset.verdetto !== 'no';

    if (!this.categorie.length || !this.carte.length) {
      console.warn('x-smista: categorie o carte mancanti', this);
      return;
    }

    // Stato salvato: se questo goal è già stato completato lo ripristiniamo,
    // come fa <x-blank>. `answers[id]` è la mappa indice-carta → categoria.
    const saved = window.courseProgress
      ? window.courseProgress.getStepForElement(this)
      : null;
    this.savedDone = Boolean(
      saved && Array.isArray(saved.goals) && this.id && saved.goals.includes(this.id)
    );
    this.savedPos = (saved && saved.answers ? saved.answers[this.id] : null) || null;

    this.render();
    this.wire();

    if (this.savedDone) this.restore();
  }

  readJSON(key, fallback) {
    const raw = this.dataset[key];
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`x-smista: data-${key} non valido`, raw);
      return fallback;
    }
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // -- Costruzione ----------------------------------------------------------

  render() {
    // Ordine dei cartellini: mescolato, salvo `mescola=no`. Un mazzo già
    // ordinato per categoria regalerebbe la risposta senza farla pensare.
    const ordine = this.carte.map((_, i) => i);
    if (this.dataset.mescola !== 'no') this.shuffle(ordine);

    const titolo = this.dataset.titolo
      ? `<div class="smista-titolo">${this.escapeHtml(this.dataset.titolo)}</div>`
      : '';

    const carte = ordine.map((i) => {
      const tex = this.carte[i].tex;
      return `<button type="button" class="smista-card" data-i="${i}">`
        + `\\(${this.escapeHtml(tex)}\\)</button>`;
    }).join('');

    // Il numero sul contenitore non è decorazione: è il tasto che lo sceglie.
    const bins = this.categorie.map((cat, n) => `
      <div class="smista-bin" data-cat="${this.escapeHtml(cat)}">
        <div class="smista-bin-label">
          <span class="smista-bin-num">${n + 1}</span>
          <span class="smista-bin-nome">${cat}</span>
        </div>
        <div class="smista-bin-drop"></div>
      </div>
    `).join('');

    const azioni = this.conVerdetto ? `
      <div class="smista-actions">
        <button type="button" class="smista-btn">Controlla</button>
        <span class="smista-feedback"></span>
      </div>
    ` : '';

    this.innerHTML = `
      ${titolo}
      <div class="smista-pool" data-pool="true">${carte}</div>
      <div class="smista-bins">${bins}</div>
      ${azioni}
    `;

    this.pool = this.querySelector('.smista-pool');
    this.bins = Array.from(this.querySelectorAll('.smista-bin'));
    this.btn = this.querySelector('.smista-btn');
    this.feedback = this.querySelector('.smista-feedback');

    this.querySelectorAll('.smista-card').forEach((c) => {
      c.setAttribute('aria-label', `cartellino ${this.carte[c.dataset.i].tex}`);
    });

    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      MathJax.typesetPromise([this]).catch(() => {});
    }

    this.aggiornaBottone();
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // -- Interazione ----------------------------------------------------------

  wire() {
    this.selected = null;
    this.drag = null;

    this.addEventListener('pointerdown', (e) => {
      const card = e.target.closest('.smista-card');
      if (!card || this.classList.contains('is-done')) return;
      // Il flag anti-click del drag precedente non deve sopravvivere fin qui:
      // se a un trascinamento non segue nessun click (capita quando il dito si
      // stacca fuori dal componente), resterebbe appeso a mangiarsi il PROSSIMO
      // tocco buono. Al più tardi, muore quando ne comincia un altro.
      this.mossoDaDrag = false;
      this.startDrag(card, e);
    });

    // Click su un contenitore (o sul mazzo): ci finisce il cartellino
    // selezionato. È il percorso del tocco su telefono, dove trascinare
    // qualcosa dentro un riquadro piccolo è scomodo.
    this.addEventListener('click', (e) => {
      if (this.classList.contains('is-done')) return;
      if (this.mossoDaDrag) { this.mossoDaDrag = false; return; }

      const card = e.target.closest('.smista-card');
      if (card) {
        this.seleziona(this.selected === card ? null : card);
        return;
      }
      const bin = e.target.closest('.smista-bin');
      const pool = e.target.closest('.smista-pool');
      if ((bin || pool) && this.selected) {
        this.sposta(this.selected, bin || null);
        this.seleziona(null);
      }
    });

    this.addEventListener('keydown', (e) => {
      const card = e.target.closest('.smista-card');
      if (!card || this.classList.contains('is-done')) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.seleziona(this.selected === card ? null : card);
      } else if (/^[1-9]$/.test(e.key)) {
        const bin = this.bins[Number(e.key) - 1];
        if (bin) {
          e.preventDefault();
          this.sposta(card, bin);
          card.focus();
        }
      } else if (e.key === '0' || e.key === 'Escape') {
        e.preventDefault();
        this.sposta(card, null);
        card.focus();
      }
    });

    if (this.btn) this.btn.addEventListener('click', () => this.verifica());
  }

  seleziona(card) {
    this.querySelectorAll('.smista-card.is-selected')
      .forEach((c) => c.classList.remove('is-selected'));
    this.selected = card || null;
    if (card) card.classList.add('is-selected');
  }

  /**
   * Drag con Pointer Events: un solo handler per mouse e dito. Il cartellino
   * segue il puntatore con una `transform`, e il bersaglio si trova con
   * elementFromPoint — così non serve sapere dove sono i contenitori.
   *
   * Sotto la soglia di 6px il gesto NON è un drag: è un tap, e lo lasciamo
   * gestire al click (selezione). Senza questa soglia ogni tocco un po' mosso
   * su un telefono diventerebbe un trascinamento a vuoto.
   */
  startDrag(card, e) {
    this.drag = { card, x0: e.clientX, y0: e.clientY, mosso: false };

    const move = (ev) => {
      if (!this.drag) return;
      const dx = ev.clientX - this.drag.x0;
      const dy = ev.clientY - this.drag.y0;
      if (!this.drag.mosso && Math.hypot(dx, dy) < 6) return;

      if (!this.drag.mosso) {
        this.drag.mosso = true;
        card.classList.add('is-dragging');
        card.setPointerCapture && card.setPointerCapture(ev.pointerId);
        this.seleziona(null);
      }
      card.style.transform = `translate(${dx}px, ${dy}px)`;
      this.evidenziaBersaglio(ev.clientX, ev.clientY);
      ev.preventDefault();
    };

    const up = (ev) => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      if (!this.drag) return;

      const mosso = this.drag.mosso;
      card.classList.remove('is-dragging');
      card.style.transform = '';
      this.bins.forEach((b) => b.classList.remove('is-over'));
      this.pool.classList.remove('is-over');

      if (mosso) {
        const sotto = this.bersaglio(ev.clientX, ev.clientY);
        if (sotto !== undefined) this.sposta(card, sotto);
        // Il click che segue il drag non deve riaprire la selezione.
        this.mossoDaDrag = true;
      }
      this.drag = null;
    };

    document.addEventListener('pointermove', move, { passive: false });
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
  }

  /** Contenitore sotto il punto: un `.smista-bin`, `null` per il mazzo,
   *  `undefined` se il puntatore è fuori dal componente (drag annullato). */
  bersaglio(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el || !this.contains(el)) return undefined;
    const bin = el.closest('.smista-bin');
    if (bin) return bin;
    if (el.closest('.smista-pool')) return null;
    return undefined;
  }

  evidenziaBersaglio(x, y) {
    const sotto = this.bersaglio(x, y);
    this.bins.forEach((b) => b.classList.toggle('is-over', b === sotto));
    this.pool.classList.toggle('is-over', sotto === null);
  }

  /** Sposta un cartellino in un contenitore (`bin`) o nel mazzo (`null`). */
  sposta(card, bin) {
    const dest = bin ? bin.querySelector('.smista-bin-drop') : this.pool;
    if (card.parentElement === dest) return;
    dest.appendChild(card);
    card.classList.toggle('is-placed', Boolean(bin));
    card.classList.remove('is-right');
    if (this.feedback) this.feedback.textContent = '';
    this.aggiornaBottone();
  }

  /** Categoria in cui si trova ora un cartellino (null = ancora nel mazzo). */
  posizione(card) {
    const bin = card.closest('.smista-bin');
    return bin ? bin.dataset.cat : null;
  }

  rimasti() {
    return this.querySelectorAll('.smista-pool .smista-card').length;
  }

  aggiornaBottone() {
    if (!this.btn) return;
    const n = this.rimasti();
    this.btn.disabled = n > 0;
    this.btn.textContent = n > 0
      ? (n === 1 ? 'Resta 1 cartellino' : `Restano ${n} cartellini`)
      : 'Controlla';
  }

  // -- Verdetto -------------------------------------------------------------

  verifica() {
    const carte = Array.from(this.querySelectorAll('.smista-card'));
    const sbagliate = [];

    carte.forEach((card) => {
      const attesa = this.carte[card.dataset.i].cat;
      if (this.posizione(card) === attesa) {
        card.classList.add('is-right');
      } else {
        sbagliate.push(card);
      }
    });

    if (!sbagliate.length) {
      this.classList.add('is-done');
      this.btn.disabled = true;
      this.btn.textContent = 'Fatto';
      this.feedback.textContent = '✓ Ogni cartellino al suo posto';
      this.feedback.className = 'smista-feedback success';
      this.markComplete();
      return;
    }

    // Feedback neutro: le sbagliate tornano nel mazzo senza essere additate.
    // Chi guarda impara *quante* ne ha sistemate, non quali ha sbagliato.
    sbagliate.forEach((card) => this.sposta(card, null));
    const giuste = carte.length - sbagliate.length;
    this.feedback.textContent = giuste === 0
      ? 'Nessuna al posto giusto per ora: riprova.'
      : `${giuste} su ${carte.length} al posto giusto. Le altre sono tornate nel mazzo.`;
    this.feedback.className = 'smista-feedback';
    this.aggiornaBottone();
  }

  /** Ripristino da storage: ogni cartellino al suo posto, già verificato. */
  restore() {
    this.querySelectorAll('.smista-card').forEach((card) => {
      const cat = (this.savedPos && this.savedPos[card.dataset.i])
        || this.carte[card.dataset.i].cat;
      const bin = this.bins.find((b) => b.dataset.cat === cat);
      if (bin) {
        bin.querySelector('.smista-bin-drop').appendChild(card);
        card.classList.add('is-placed', 'is-right');
      }
    });
    this.classList.add('is-done');
    this.setAttribute('data-completed', 'true');
    if (this.btn) {
      this.btn.disabled = true;
      this.btn.textContent = 'Fatto';
    }
    if (this.feedback) {
      this.feedback.textContent = '✓ Ogni cartellino al suo posto';
      this.feedback.className = 'smista-feedback success';
    }
  }

  markComplete() {
    if (!this.id || this.hasAttribute('data-completed')) return;
    this.setAttribute('data-completed', 'true');

    // Il valore salvato è la disposizione finale: al ripristino le carte
    // tornano dove le aveva messe lo studente, non dove dice la soluzione.
    const value = {};
    this.querySelectorAll('.smista-card').forEach((card) => {
      value[card.dataset.i] = this.posizione(card);
    });

    this.dispatchEvent(new CustomEvent('goal-complete', {
      bubbles: true,
      composed: true,
      detail: { goalId: this.id, value }
    }));
  }
}

customElements.define('x-smista', XSmista);
