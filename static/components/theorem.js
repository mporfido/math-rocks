/**
 * <x-theorem> - Dimostrazione manipolabile
 *
 * Presenta un teorema (enunciato, ipotesi, tesi, dimostrazione) e lo rende
 * manipolabile: gli stessi dati generano cinque esercizi diversi. Le modalità
 * NON sono contenuti alternativi, sono maschere sulla stessa lista di passi
 * (vedi DIMOSTRAZIONI.md §4).
 *
 * Un passo è premesse + garanzia + conclusione (Toulmin), e la garanzia vive
 * nella teoria del corso (Mariotti): entrambe arrivano dal parser negli
 * attributi data-*, prodotti da process_theorem().
 *
 * Attributi (tutti generati da parser/preprocessors.py):
 *   data-passi        JSON: [{id, testo, statuto, da, perche, fig, scope}] — lista
 *                     piatta. `statuto`: ipotesi | costruzione | dedotto | tesi |
 *                     assunzione | assurdo | analogo. La costruzione non asserisce,
 *                     introduce un oggetto: sta nella catena (si può usare come
 *                     premessa) ma vale "per costruzione" se non dichiara una
 *                     garanzia. `scope` è l'id dell'assunzione che governa il
 *                     passo, `null` al livello esterno (DIMOSTRAZIONI.md §8): la
 *                     lista resta piatta, il rientro si ricostruisce da qui
 *   data-tesi         JSON: id delle tesi, in ordine di dichiarazione
 *   data-distrattori  JSON: [{id, testo, perche, tipo}] (opzionale)
 *   data-teoria       JSON: {id: {nome, enunciato, tipo}} — le garanzie citate
 *   data-etichette    JSON: {ipotesi, tesi, dimostrazione} — etichette a schermo
 *   data-titolo       enunciato del teorema
 *   data-modi         modalità offerte, in ordine, separate da virgola
 *   data-mancanti     quanti passi togliere in modalità `completa`
 *   data-distrattori-n  quanti intrusi mostrare, se imposto da fuori (TEORIA.md
 *                     §5): i distrattori sono un asse indipendente dalla
 *                     modalità. Ignorato dove non c'è un mucchio di cartellini.
 *   data-theorem-id   id nella teoria del corso (seed del caso deterministico)
 *   data-figura       nome dello sketch da mostrare accanto alla dimostrazione;
 *                     i `fig` dei passi sono id di elementi DENTRO quello sketch
 *   data-figura-altezza  altezza del canvas della figura (default 300)
 *
 * Emette:
 *   goal-complete: alla prima verifica superata. Se l'unica modalità è `leggi`
 *     (niente da verificare) il goal si completa quando ogni passo dedotto è
 *     stato ispezionato almeno una volta.
 */

/** Le cinque maschere. `partenza`: quali passi sono già nella catena. */
const THEOREM_MODI = {
  leggi: {
    nome: 'Leggi',
    consegna: 'La dimostrazione è già fatta. Clicca un passo per vedere da quali passi precedenti nasce, e dove viene riusato.',
    partenza: 'tutti', garanzieVisibili: true, distrattori: false, soloLettura: true,
  },
  ordina: {
    nome: 'Ordina',
    consegna: 'Ci sono tutti i passi, ma sono mescolati. Rimettili in un ordine che funzioni: ogni passo deve venire dopo quelli che usa.',
    partenza: 'ipotesi', garanzieVisibili: true, distrattori: false,
  },
  giustifica: {
    nome: 'Giustifica',
    consegna: 'L’ordine è già dato. Per ogni passo scegli dalla cassetta degli attrezzi il teorema che ti autorizza a farlo.',
    partenza: 'tutti', garanzieVisibili: false, distrattori: false,
  },
  completa: {
    nome: 'Completa',
    consegna: 'Mancano alcuni passi. Nel mucchio ci sono anche cartellini che non servono: riconoscili.',
    partenza: 'meno-mancanti', garanzieVisibili: true, distrattori: true,
  },
  costruisci: {
    nome: 'Costruisci',
    consegna: 'Hai solo le ipotesi. Costruisci tutta la catena fino alla tesi e giustifica ogni passo.',
    partenza: 'ipotesi', garanzieVisibili: false, distrattori: true,
  },
};

/** Il tipo del distrattore è dichiarato dall'autore: il feedback è mirato. */
const THEOREM_DISTRATTORI = {
  'inutile': 'È vero, ma non ti avvicina alla tesi.',
  'garanzia-sbagliata': 'La conclusione è giusta, ma quel teorema non te la dà.',
  'falso': 'Questo non è vero.',
};

/** Hash + PRNG deterministici: stesso teorema, stesso mescolamento. */
function theoremSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function theoremRandom(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class XTheorem extends HTMLElement {
  connectedCallback() {
    if (this.dataset.mounted) return;
    this.dataset.mounted = '1';

    this.passi = this.readJSON('passi', []);
    this.tesiIds = this.readJSON('tesi', []);
    this.distrattori = this.readJSON('distrattori', []);
    this.teoria = this.readJSON('teoria', {});
    this.etichette = Object.assign(
      { ipotesi: 'Ipotesi', tesi: 'Tesi', dimostrazione: 'Dimostrazione' },
      this.readJSON('etichette', {})
    );
    this.mancanti = parseInt(this.dataset.mancanti || '2', 10);
    this.seme = this.dataset.theoremId || this.id || 'teorema';

    // Quanti distrattori mostrare, se qualcuno lo impone (TEORIA.md §5): i
    // distrattori sono un ASSE indipendente dalla modalità, non una sua
    // proprietà. `null` = lascia decidere alla maschera. Vale solo dove c'è un
    // mucchio di cartellini: in `leggi` e `giustifica` non c'è dove metterli.
    const nDistrattori = parseInt(this.dataset.distrattoriN, 10);
    this.nDistrattori = Number.isFinite(nDistrattori)
      ? Math.max(0, nDistrattori) : null;

    this.modi = (this.dataset.modi || 'leggi')
      .split(',').map(m => m.trim()).filter(m => THEOREM_MODI[m]);
    if (!this.modi.length) this.modi = ['leggi'];

    this.perId = {};
    this.passi.forEach(p => { this.perId[p.id] = p; });
    this.distrattori.forEach(d => { this.perId[d.id] = d; });

    this.completato = false;
    this.ispezionati = new Set();

    // Stato salvato: il goal era già completato, non lo ri-annunciamo (la
    // contabilità centrale la fa x-step leggendo lo storage).
    const saved = window.courseProgress
      ? window.courseProgress.getStepForElement(this)
      : null;
    if (saved && Array.isArray(saved.goals) && saved.goals.includes(this.id)) {
      this.completato = true;
    }

    this.costruisciGuscio();
    this.collegaEventi();
    this.caricaModalita(this.modi[0]);
  }

  readJSON(name, fallback) {
    const raw = this.dataset[name];
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error(`x-theorem: data-${name} non è JSON valido`, e);
      return fallback;
    }
  }

  // -- Guscio ----------------------------------------------------------------

  /**
   * Ipotesi e tesi nell'intestazione non sono riscritte: sono renderizzate
   * dai passi stessi, che ne sono l'unica fonte.
   */
  costruisciGuscio() {
    const ipotesi = this.passi.filter(p => p.statuto === 'ipotesi');
    const tesi = this.tesiIds.map(id => this.perId[id]).filter(Boolean);
    // La figura vive nella colonna laterale, sopra la cassetta degli attrezzi:
    // è il posto dove resta visibile mentre si lavora sulla catena.
    const figura = this.dataset.figura
      ? `<figure class="thm-figura">
           <x-p5 data-sketch="${this.dataset.figura}"
                 data-height="${this.dataset.figuraAltezza || '300'}"></x-p5>
           <figcaption>Clicca un passo per vederlo nella figura — o un elemento
             della figura per trovare il passo che ne parla.</figcaption>
         </figure>`
      : '';

    const navigazione = this.modi.length > 1
      ? `<nav class="thm-modi" aria-label="Modalità">${this.modi.map((m, i) =>
          `<button type="button" data-modo="${m}" aria-pressed="${i === 0}">${THEOREM_MODI[m].nome}</button>`
        ).join('')}</nav>`
      : '';

    this.innerHTML = `
      <div class="thm${figura ? ' thm--con-figura' : ''}">
        <header class="thm-testata">
          <p class="thm-occhiello">Teorema</p>
          <h3 class="thm-titolo">${this.dataset.titolo || ''}</h3>
          <div class="thm-dati">
            <div><b>${this.etichette.ipotesi}</b><ul class="thm-elenco">${
              ipotesi.map(p => `<li>${p.testo}</li>`).join('')}</ul></div>
            <div><b>${this.etichette.tesi}</b><ul class="thm-elenco">${
              tesi.map(p => `<li>${p.testo}</li>`).join('')}</ul></div>
          </div>
        </header>
        ${navigazione}
        <p class="thm-consegna"></p>
        <section class="thm-lavoro">
          <p class="thm-titoletto">${this.etichette.dimostrazione}</p>
          <div class="thm-catena"><svg class="thm-fili" aria-hidden="true"></svg></div>
          <div class="thm-banco">
            <p class="thm-titoletto">Cartellini da collocare</p>
            <div class="thm-cartellini"></div>
          </div>
          <div class="thm-azioni">
            <button type="button" class="thm-verifica">Verifica</button>
            <button type="button" class="thm-ricomincia">Ricomincia</button>
          </div>
          <div class="thm-esito" role="status"></div>
        </section>
        <div class="thm-colonna">
          ${figura}
          <aside class="thm-attrezzi-box">
            <p class="thm-titoletto">Cassetta degli attrezzi</p>
            <ul class="thm-attrezzi">${Object.values(this.teoria).map(t =>
              // Un teorema dimostrato entra nella teoria col proprio enunciato
              // come nome: lì non c'è una seconda riga da mostrare.
              `<li><b>${t.nome}</b>${t.enunciato && t.enunciato !== t.nome
                ? `<span>${t.enunciato}</span>` : ''}</li>`).join('')}</ul>
          </aside>
        </div>
      </div>
    `;

    this.elCatena = this.querySelector('.thm-catena');
    this.elCartellini = this.querySelector('.thm-cartellini');
    this.elBanco = this.querySelector('.thm-banco');
    this.elConsegna = this.querySelector('.thm-consegna');
    this.elEsito = this.querySelector('.thm-esito');
    this.elVerifica = this.querySelector('.thm-verifica');
    this.elAzioni = this.querySelector('.thm-azioni');
    this.elFigura = this.querySelector('.thm-figura x-p5');
  }

  // -- Modalità --------------------------------------------------------------

  /** Quali passi partono già in catena, secondo la maschera. */
  passiDiPartenza(modo) {
    if (modo.partenza === 'tutti') return this.passi.map(p => p.id);
    if (modo.partenza === 'ipotesi') {
      return this.passi.filter(p => p.statuto === 'ipotesi').map(p => p.id);
    }
    // `completa`: i passi da togliere sono scelti deterministicamente (seed
    // dall'id del teorema), non elencati a mano dall'autore.
    const togliibili = this.passi.filter(p => p.statuto !== 'ipotesi').map(p => p.id);
    const rand = theoremRandom(theoremSeed(this.seme + ':completa'));
    const tolti = new Set();
    while (tolti.size < Math.min(this.mancanti, togliibili.length)) {
      tolti.add(togliibili[Math.floor(rand() * togliibili.length)]);
    }
    return this.passi.map(p => p.id).filter(id => !tolti.has(id));
  }

  /**
   * Gli intrusi da mettere nel mucchio, in numero deciso dalla maschera o
   * imposto da chi ha costruito la scheda.
   *
   * La scelta è deterministica e seminata dall'id del teorema, NON dalla
   * modalità: un link dato per compito deve produrre lo stesso esercizio per
   * tutta la classe, altrimenti in classe non se ne può parlare.
   *
   * Un `garanzia-sbagliata` non entra dove le garanzie non si vedono. Quel
   * distrattore È la sua garanzia: la conclusione, per definizione del tipo, è
   * giusta. Tolta la garanzia dal cartellino resta il gemello identico di un
   * passo vero, e sceglierne uno diventa un sorteggio — con in più il caso
   * assurdo dello studente che gli assegna la garanzia GIUSTA e si sente dire
   * che è un intruso. Non è un intruso: è un clone, e va tenuto fuori.
   */
  distrattoriDaMostrare(modo) {
    const conBanco = modo.partenza !== 'tutti';
    const utili = this.distrattori.filter(
      d => modo.garanzieVisibili || d.tipo !== 'garanzia-sbagliata');
    let quanti = modo.distrattori ? utili.length : 0;
    if (conBanco && this.nDistrattori !== null) quanti = this.nDistrattori;
    quanti = Math.min(quanti, utili.length);
    if (quanti <= 0) return [];
    return this.mescola(utili.map(d => d.id), 'distrattori').slice(0, quanti);
  }

  mescola(ids, chiave) {
    const rand = theoremRandom(theoremSeed(this.seme + ':' + chiave));
    const out = ids.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  caricaModalita(nome) {
    this.modo = THEOREM_MODI[nome];
    this.modoNome = nome;

    const partenza = this.passiDiPartenza(this.modo);
    const restanti = this.passi.map(p => p.id).filter(id => !partenza.includes(id));
    const intrusi = this.distrattoriDaMostrare(this.modo);

    this.catena = partenza.slice();
    this.fissi = new Set(partenza);
    this.banco = this.mescola(restanti.concat(intrusi), nome);
    this.scelte = {};
    this.errori = [];
    this.evidenziato = null;
    this.ispezionati = new Set();

    // Con le garanzie visibili la scelta è già data: il campo non si tocca.
    if (this.modo.garanzieVisibili) {
      this.passi.forEach(p => { if (p.perche) this.scelte[p.id] = p.perche; });
    }

    let consegna = this.modo.consegna;
    if (nome === 'completa') {
      const n = this.passi.length - partenza.length;
      consegna = `Mancano ${n === 1 ? 'un passo' : n + ' passi'}.`;
    }
    // Gli intrusi sono un numero variabile (possono essere zero anche in una
    // modalità che di solito li mostra): l'avviso segue quello che c'è davvero.
    if (intrusi.length) {
      consegna += intrusi.length === 1
        ? ' Attenzione: nel mucchio c\'è anche un cartellino che non serve.'
        : ` Attenzione: nel mucchio ci sono anche ${intrusi.length} cartellini che non servono.`;
    }
    this.elConsegna.textContent = consegna;

    this.elAzioni.hidden = this.modo.soloLettura;
    this.elEsito.className = 'thm-esito';
    this.elEsito.textContent = '';

    this.render();
  }

  // -- Render ----------------------------------------------------------------

  /**
   * Gli scope che contengono un passo, dal più esterno al più interno
   * (DIMOSTRAZIONI.md §8.5). La lista dei passi resta piatta: il rientro a
   * schermo è ricostruito da qui, non è un dato in più da tenere in sincrono.
   */
  catenaScope(scope) {
    const out = [];
    while (scope) {
      out.unshift(scope);
      scope = (this.perId[scope] || {}).scope || null;
    }
    return out;
  }

  /**
   * Il testo della riga «perché…» quando non c'è nessuna garanzia da scegliere.
   *
   * Un'assunzione, una contraddizione e un ramo chiuso per analogia non hanno
   * un teorema che li autorizzi: non sono caselle vuote da riempire, esattamente
   * come una costruzione (§2.5, §8.7). Mostrare lì un menu insegnerebbe la cosa
   * sbagliata, cioè che ogni riga di una dimostrazione invoca un teorema.
   */
  garanziaImplicita(p) {
    if (p.statuto === 'ipotesi') return 'per ipotesi';
    if (p.statuto === 'assunzione') {
      return p.sotto === 'assurdo'
        ? 'si suppone, per vedere dove porta'
        : 'si suppone che valga questo caso';
    }
    if (p.statuto === 'analogo') {
      const caso = this.perId[p.analogo];
      return caso ? `per analogia col caso ${caso.testo}` : 'per analogia';
    }
    if (p.perche) return null;
    if (p.statuto === 'costruzione') return 'per costruzione';
    if (p.statuto === 'assurdo') return 'le due cose non possono valere insieme';
    return null;
  }

  /**
   * L'occhiello di una riga che non è una deduzione. Un passo ipotetico va
   * riconosciuto PRIMA di leggerlo: senza, «i due triangoli non sono
   * congruenti» si legge come un'affermazione del teorema, cioè al contrario.
   */
  etichettaStatuto(p) {
    if (p.statuto === 'assunzione') {
      return p.sotto === 'assurdo' ? 'per assurdo' : 'caso';
    }
    if (p.statuto === 'analogo') return 'analogo';
    return '';   // la costruzione si riconosce dal bordo e dal «per costruzione»
  }

  render() {
    const evidenziato = this.evidenziato;
    const passoEvidenziato = evidenziato !== null ? this.perId[evidenziato] : null;

    this.elCatena.innerHTML = '<svg class="thm-fili" aria-hidden="true"></svg>';

    // Le scatole degli scope aperti, dall'esterno: una riga entra nell'ultima.
    const pila = [];
    const scatole = {};

    this.catena.forEach((id, i) => {
      const p = this.perId[id];

      // Un'assunzione sta FUORI dalla scatola che apre: «supponiamo che…» si
      // legge al livello di prima, e il rientro comincia dopo.
      const voluti = this.catenaScope(p.scope || null);
      let k = 0;
      while (k < pila.length && k < voluti.length && pila[k] === voluti[k]) k++;
      pila.length = k;
      while (pila.length < voluti.length) {
        const s = voluti[pila.length];
        const box = document.createElement('div');
        box.className = 'thm-scope';
        box.dataset.scope = s;
        (pila.length ? scatole[pila[pila.length - 1]] : this.elCatena).appendChild(box);
        scatole[s] = box;
        pila.push(s);
      }

      const riga = document.createElement('div');
      riga.className = 'thm-riga';
      riga.dataset.pos = i;
      riga.dataset.id = id;
      if (p.statuto === 'ipotesi') riga.classList.add('thm-riga--ipotesi');
      if (p.statuto === 'costruzione') riga.classList.add('thm-riga--costruzione');
      if (p.statuto === 'tesi') riga.classList.add('thm-riga--tesi');
      if (p.statuto === 'assunzione') riga.classList.add('thm-riga--assunzione');
      if (p.statuto === 'assurdo') riga.classList.add('thm-riga--assurdo');
      if (p.statuto === 'analogo') riga.classList.add('thm-riga--analogo');
      if (this.errori.includes(i)) riga.classList.add('thm-riga--errore');

      // Evidenziazione bidirezionale: dal passo alle sue premesse, e da un
      // passo a tutti quelli che lo usano. È lì che si vede che un'ipotesi
      // serve davvero, tre volte.
      if (evidenziato !== null) {
        if (id === evidenziato) riga.classList.add('thm-riga--fuoco');
        else if (passoEvidenziato && (passoEvidenziato.da || []).includes(id)) {
          riga.classList.add('thm-riga--premessa');
        } else if ((p.da || []).includes(evidenziato)) {
          riga.classList.add('thm-riga--uso');
        } else {
          // Tutto il resto arretra: con poco spazio e una struttura a colonna,
          // il senso si legge solo se il contesto si spegne.
          riga.classList.add('thm-riga--spenta');
        }
      }

      let perche;
      const implicita = this.garanziaImplicita(p);
      if (implicita) {
        perche = `<div class="thm-perche">${implicita}</div>`;
      } else if (this.modo.garanzieVisibili) {
        const t = this.teoria[p.perche];
        perche = t
          ? `<div class="thm-perche">perché <b>${t.nome}</b>: ${t.enunciato}</div>`
          : '';
      } else {
        const opzioni = Object.keys(this.teoria).map(k =>
          `<option value="${k}"${this.scelte[id] === k ? ' selected' : ''}>${this.teoria[k].nome}</option>`
        ).join('');
        perche = `<select data-id="${id}" aria-label="Teorema che giustifica il passo ${i + 1}">` +
          `<option value="">scegli il teorema…</option>${opzioni}</select>`;
      }

      const comandi = (!this.modo.soloLettura && !this.fissi.has(id))
        ? `<div class="thm-comandi">
             <button type="button" data-az="su" data-pos="${i}" aria-label="Sposta su">↑</button>
             <button type="button" data-az="giu" data-pos="${i}" aria-label="Sposta giù">↓</button>
             <button type="button" data-az="via" data-pos="${i}" aria-label="Togli dalla catena">×</button>
           </div>`
        : '';

      // Spia: questo passo ha un corrispettivo nella figura. Senza, non c'è
      // modo di sapere quali passi vale la pena aprire per vederci qualcosa.
      const spia = (this.elFigura && p.fig)
        ? '<span class="thm-spia-fig" aria-hidden="true"></span>' : '';

      // Una contraddizione non ha testo d'autore: la conclusione è ⊥, e
      // scriverla ogni volta sarebbe copiare a mano quello che lo statuto
      // già dice.
      const testo = p.testo || (p.statuto === 'assurdo' ? 'Assurdo.' : '');
      const etichetta = this.etichettaStatuto(p);
      const tag = etichetta ? `<span class="thm-tag">${etichetta}</span>` : '';

      riga.innerHTML = `<span class="thm-n">${i + 1}</span>
        <div class="thm-corpo-riga">
          ${tag}
          <button type="button" class="thm-testo" aria-expanded="${id === evidenziato}"${
            p.fig ? ' title="Si vede nella figura"' : ''}>${testo}${spia}</button>
          ${perche}
        </div>${comandi}`;
      (pila.length ? scatole[pila[pila.length - 1]] : this.elCatena).appendChild(riga);
    });

    // Il banco sparisce quando non c'è (e non può tornarci) nulla da collocare:
    // in `giustifica` la catena è completa e nessuna riga è rimovibile.
    const nullaDaCollocare = !this.banco.length && this.catena.every(id => this.fissi.has(id));
    this.elBanco.hidden = this.modo.soloLettura || nullaDaCollocare;

    this.elCartellini.innerHTML = '';
    if (!this.banco.length) {
      this.elCartellini.innerHTML = '<p class="thm-vuoto">Nessun cartellino rimasto.</p>';
    }
    this.banco.forEach(id => {
      const p = this.perId[id];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'thm-cartellino';
      b.dataset.aggiungi = id;
      const garanzia = (this.modo.garanzieVisibili && p.perche && this.teoria[p.perche])
        ? `<span class="thm-perche">${this.teoria[p.perche].nome}</span>` : '';
      // Una costruzione va riconosciuta già nel mucchio: è un atto, non
      // un'asserzione, e cercargli una garanzia sarebbe cercare la cosa
      // sbagliata.
      if (p.statuto === 'costruzione') b.classList.add('thm-cartellino--costruzione');
      const tag = p.statuto === 'costruzione'
        ? '<span class="thm-tag">costruzione</span>' : '';
      b.innerHTML = `${tag}<span class="thm-testo-cartellino">${p.testo}</span>${garanzia}`;
      this.elCartellini.appendChild(b);
    });

    this.aggiornaFigura();
    this.disegnaFili();
    this.osservaAltezze();
    this.typeset();
  }

  /**
   * Il ponte con la figura (DIMOSTRAZIONI.md §5): il passo selezionato accende
   * il suo elemento, le sue premesse accendono i loro. Stessi ruoli della
   * catena — `fuoco` e `premessa` — così quello che si legge nel testo e quello
   * che si vede nel disegno sono la stessa cosa detta due volte.
   *
   * Un passo senza `fig` spegne la figura invece di lasciarla accesa su qualcosa
   * di cui non si sta più parlando.
   */
  aggiornaFigura() {
    if (!this.elFigura) return;
    // L'ordine di caricamento degli script non è garantito: se <x-p5> non è
    // ancora stato definito l'elemento non ha il metodo. Riproviamo appena c'è.
    if (typeof this.elFigura.highlight !== 'function') {
      if (!this._attesaFigura) {
        this._attesaFigura = true;
        customElements.whenDefined('x-p5').then(() => this.aggiornaFigura());
      }
      return;
    }

    const evidenza = {};
    const passo = this.evidenziato !== null ? this.perId[this.evidenziato] : null;
    if (passo) {
      if (passo.fig) evidenza[passo.fig] = 'fuoco';
      // Solo le premesse che sono davvero nella catena: in `ordina` e
      // `costruisci` un passo può citarne una che lo studente non ha ancora
      // messo, e la figura non deve anticipargliela.
      (passo.da || []).forEach(id => {
        const premessa = this.perId[id];
        if (premessa && premessa.fig && !evidenza[premessa.fig]
            && this.catena.includes(id)) {
          evidenza[premessa.fig] = 'premessa';
        }
      });
    }
    this.elFigura.highlight(evidenza);
  }

  /**
   * I fili poggiano su coordinate reali, ma le righe cambiano altezza DOPO il
   * render: MathJax compone le formule, i font si caricano, il testo va a capo
   * su una colonna più stretta. Senza riosservare, lo sfasamento si accumula
   * riga dopo riga verso il basso.
   */
  osservaAltezze() {
    if (typeof ResizeObserver === 'undefined') return;
    if (!this._ro) this._ro = new ResizeObserver(() => this.disegnaFili());
    // Le righe sono ricreate a ogni render: vanno riosservate.
    this._ro.disconnect();
    this.elCatena.querySelectorAll('.thm-riga').forEach(r => this._ro.observe(r));
  }

  /**
   * Il filo che collega un passo alle sue premesse: la dimostrazione si vede
   * diventare un grafo, non una lista. Un filo che risale (premessa più in
   * basso della conclusione) è rosso: è l'errore, visibile prima di leggerlo.
   */
  disegnaFili() {
    const svg = this.elCatena.querySelector('svg.thm-fili');
    if (!svg) return;
    const base = this.elCatena.getBoundingClientRect();
    const centri = {};
    this.elCatena.querySelectorAll('.thm-riga').forEach(r => {
      const b = r.getBoundingClientRect();
      centri[r.dataset.id] = { y: b.top - base.top + b.height / 2, pos: +r.dataset.pos };
    });

    // Con un passo selezionato restano leggibili solo i suoi fili: gli altri
    // quasi spariscono, invece di sommarsi in un groviglio.
    const sel = this.evidenziato;
    let sfondo = '', primoPiano = '';

    this.catena.forEach(id => {
      const p = this.perId[id];
      (p.da || []).forEach(premessa => {
        const a = centri[premessa], b = centri[id];
        if (!a || !b) return;
        const risale = a.pos > b.pos;
        const attivo = sel !== null && (id === sel || premessa === sel);
        const colore = risale ? 'var(--error)' : 'var(--ink)';
        const spessore = risale ? 2 : (attivo ? 2.4 : 1.2);
        const opacita = (sel !== null && !attivo) ? 0.07 : (attivo || risale ? 1 : 0.5);

        const filo = `<path d="M28 ${b.y} C 6 ${b.y}, 6 ${a.y}, 28 ${a.y}" fill="none"` +
          ` stroke="${colore}" stroke-width="${spessore}" opacity="${opacita}"/>` +
          `<circle cx="28" cy="${a.y}" r="${attivo ? 3.6 : 2.6}" fill="${colore}" opacity="${opacita}"/>`;
        // I fili attivi sono disegnati per ultimi: restano sopra agli altri.
        if (attivo) primoPiano += filo; else sfondo += filo;
      });
    });
    svg.innerHTML = sfondo + primoPiano;
  }

  typeset() {
    if (typeof MathJax === 'undefined' || !MathJax.typesetPromise) return;
    // Comporre le formule cambia l'altezza delle righe: i fili si ridisegnano
    // dopo, non prima.
    MathJax.typesetPromise([this])
      .then(() => this.disegnaFili())
      .catch(err => console.error('x-theorem: MathJax', err));
  }

  // -- Correzione ------------------------------------------------------------

  /**
   * La correzione è topologica: non si confronta la risposta con "la" soluzione
   * dell'autore, perché le soluzioni giuste sono tante. Un ordine è valido se
   * ogni passo viene dopo le sue premesse (DIMOSTRAZIONI.md §6).
   */
  verifica() {
    this.errori = [];
    const no = (testo, righe) => {
      this.errori = righe || [];
      this.elEsito.className = 'thm-esito thm-esito--no';
      this.elEsito.textContent = testo;
      this.render();
    };

    // 1. Intrusi: il feedback dipende dal tipo dichiarato dall'autore
    const intruso = this.catena.findIndex(id => this.distrattori.some(d => d.id === id));
    if (intruso !== -1) {
      const d = this.perId[this.catena[intruso]];
      let perche = THEOREM_DISTRATTORI[d.tipo] || '';
      // Con le garanzie in chiaro, un distrattore `garanzia-sbagliata` ha lo
      // stesso testo di un passo vero: nel mucchio ci sono due cartellini
      // quasi identici, e un messaggio generico si legge come un bug. Va detto
      // QUALE differenza conta — che è poi tutto il punto dell'esercizio.
      if (d.tipo === 'garanzia-sbagliata' && this.modo.garanzieVisibili && d.perche) {
        const nome = (this.teoria[d.perche] || {}).nome || d.perche;
        perche = `L'asserzione è giusta, ma «${nome}» non te la dà: ` +
          'guarda la garanzia, non la conclusione.';
      }
      return no(`Il passo ${intruso + 1} non fa parte di questa dimostrazione. ` +
        perche, [intruso]);
    }

    // 2. Completezza: ogni tesi va raggiunta
    const nonRaggiunte = this.tesiIds.filter(id => !this.catena.includes(id));
    if (nonRaggiunte.length) {
      return no('La catena non arriva ancora fino in fondo: la tesi non è dimostrata.');
    }

    // 3. Ordine: nessun passo usa una premessa che a quel punto non ha ancora
    for (let i = 0; i < this.catena.length; i++) {
      const p = this.perId[this.catena[i]];
      const assente = (p.da || []).find(pr => !this.catena.includes(pr));
      if (assente) {
        return no(`Il passo ${i + 1} si appoggia a un passaggio che non hai messo nella catena.`, [i]);
      }
      const dopo = (p.da || []).some(pr => this.catena.indexOf(pr) >= i);
      if (dopo) {
        return no(`Il passo ${i + 1} usa qualcosa che a quel punto non hai ancora. Guarda il filo rosso a sinistra.`, [i]);
      }
    }

    // 4. Garanzie: solo dove non sono visibili
    if (!this.modo.garanzieVisibili) {
      for (let i = 0; i < this.catena.length; i++) {
        const id = this.catena[i], p = this.perId[id];
        if (p.perche && this.scelte[id] !== p.perche) {
          return no(`L’ordine è giusto, ma la giustificazione del passo ${i + 1} non regge.`, [i]);
        }
      }
    }

    this.elEsito.className = 'thm-esito thm-esito--ok';
    this.elEsito.textContent = 'Dimostrazione corretta. Ogni passo poggia su qualcosa che avevi già.';
    this.render();
    this.completa();
  }

  completa() {
    if (this.completato) return;
    this.completato = true;
    this.dispatchEvent(new CustomEvent('goal-complete', {
      bubbles: true,
      detail: { goalId: this.id, value: this.modoNome },
    }));
  }

  /**
   * In sola lettura non c'è niente da verificare: il goal si completa quando
   * ogni passo dedotto è stato aperto almeno una volta. Vale solo se `leggi` è
   * l'unica modalità offerta; altrimenti a completare è la verifica.
   */
  registraIspezione(id) {
    if (this.modi.length > 1) return;
    this.ispezionati.add(id);
    const daLeggere = this.passi.filter(p => p.statuto !== 'ipotesi');
    if (daLeggere.every(p => this.ispezionati.has(p.id))) this.completa();
  }

  // -- Eventi ----------------------------------------------------------------

  collegaEventi() {
    const nav = this.querySelector('.thm-modi');
    if (nav) {
      nav.addEventListener('click', e => {
        const b = e.target.closest('button[data-modo]');
        if (!b) return;
        nav.querySelectorAll('button').forEach(x =>
          x.setAttribute('aria-pressed', x === b));
        this.caricaModalita(b.dataset.modo);
      });
    }

    this.elCatena.addEventListener('click', e => {
      const comando = e.target.closest('button[data-az]');
      if (comando) {
        const i = +comando.dataset.pos;
        if (comando.dataset.az === 'via') this.banco.push(this.catena.splice(i, 1)[0]);
        if (comando.dataset.az === 'su' && i > 0) {
          [this.catena[i - 1], this.catena[i]] = [this.catena[i], this.catena[i - 1]];
        }
        if (comando.dataset.az === 'giu' && i < this.catena.length - 1) {
          [this.catena[i + 1], this.catena[i]] = [this.catena[i], this.catena[i + 1]];
        }
        this.errori = [];
        this.render();
        return;
      }

      // Ogni riferimento è un <button>: funziona da tastiera e, su touch dove
      // l'hover non esiste, con tap sticky.
      const testo = e.target.closest('.thm-testo');
      if (testo) {
        const id = testo.closest('.thm-riga').dataset.id;
        this.evidenziato = (this.evidenziato === id) ? null : id;
        if (this.evidenziato) this.registraIspezione(id);
        this.render();
      }
    });

    this.elCatena.addEventListener('change', e => {
      if (e.target.matches('select')) {
        this.scelte[e.target.dataset.id] = e.target.value;
      }
    });

    this.elCartellini.addEventListener('click', e => {
      const b = e.target.closest('[data-aggiungi]');
      if (!b) return;
      const id = b.dataset.aggiungi;
      this.banco.splice(this.banco.indexOf(id), 1);
      this.catena.push(id);
      this.errori = [];
      this.elEsito.className = 'thm-esito';
      this.elEsito.textContent = '';
      this.render();
    });

    // Senso inverso del ponte: la figura chiede di evidenziare un suo elemento
    // (click su un triangolo) e noi selezioniamo il passo che ne parla. Se i
    // passi sono più d'uno vince il primo della catena, che è quello che lo
    // introduce.
    if (this.elFigura) {
      this.elFigura.addEventListener('figure-highlight', e => {
        const figId = e.detail && e.detail.id;
        const passo = figId
          ? this.catena.find(id => this.perId[id] && this.perId[id].fig === figId)
          : null;
        this.evidenziato = (passo && passo !== this.evidenziato) ? passo : null;
        if (this.evidenziato) this.registraIspezione(this.evidenziato);
        this.render();
      });
    }

    this.elVerifica.addEventListener('click', () => this.verifica());
    this.querySelector('.thm-ricomincia').addEventListener('click', () =>
      this.caricaModalita(this.modoNome));

    // I fili sono disegnati su coordinate reali: vanno rifatti quando le righe
    // cambiano altezza (riflusso del testo su schermi stretti).
    this._onResize = () => this.disegnaFili();
    window.addEventListener('resize', this._onResize);
  }

  disconnectedCallback() {
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    if (this._ro) this._ro.disconnect();
  }
}

customElements.define('x-theorem', XTheorem);
