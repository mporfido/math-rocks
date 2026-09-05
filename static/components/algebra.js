/**
 * <x-algebra> — manipolare un'equazione (o un'espressione) applicando le regole.
 *
 * Lo scopo è SEMPLIFICARE, non risolvere: il traguardo è una forma — `y`
 * isolata, `ax² + bx + c = 0`, un polinomio ridotto — e ci si arriva con le
 * mosse, non scrivendo la risposta.
 *
 * L'invariante lo garantisce il motore (`static/lib/algebra-mosse.js`): gli
 * stati non equivalenti sono **irraggiungibili**, una mossa illecita non
 * avviene e dice perché. Qui c'è solo l'interfaccia, e il suo compito è uno:
 * far scegliere una mossa e un pezzo. Dove il conto c'è (le mosse di
 * SEMPLIFICAZIONE) il risultato lo digita lo studente; dove non c'è (i
 * principi, il trasporto, lo spostamento) lo scrive il motore — far ricopiare
 * un'equazione sarebbe fatica senza pensiero.
 *
 * Lo stato è **l'espressione iniziale più la sequenza delle mosse**: da lì
 * discendono gratis l'annulla, lo svolgimento classico e la ripresa da
 * `courseProgress`. Nella sequenza salvata i nodi sono indicati per CAMMINO e
 * non per id: gli id vivono quanto la pagina, il cammino vale anche domani.
 *
 * Sintassi markdown → `docs/algebra.md` (blocco `:::algebra`).
 *
 * Attributi (generati da parser/preprocessors.py::process_algebra):
 *   data-eq         l'equazione (o espressione) di partenza
 *   data-traguardo  JSON del traguardo: {"isola":"y"}, {"forma":"normale"},
 *                   {"forma":"ridotta"}, {"forma":"ax=b","incognita":"x"}.
 *                   Assente = lavagna libera, nessun goal
 *   data-mosse      JSON: gli id di mossa abilitati. Assente = tutte
 *   id              presente solo quando c'è un traguardo (è un goal)
 *
 * Eventi:
 *   goal-complete   quando la scrittura raggiunge il traguardo
 *
 * I GESTI e i loro gemelli a click — ogni gesto ne ha uno, sempre, perché da
 * tastiera non si trascina:
 *   attraverso l'uguale        → trasporto      → menu "Porta dall'altra parte"
 *   su un termine simile       → riduci-coppia  → menu "Somma i termini simili"
 *   di lato, fra due termini   → sposta         → menu "Sposta a sinistra/destra"
 *
 * Il gesto sui simili e il suo gemello a click NON chiedono lo stesso conto, ed
 * è voluto: portando un `3x` sopra un `2x` si è già pensato «cinque x», e da
 * riscrivere c'è quella somma lì (`riduci-coppia`); dal menu, senza un gesto
 * che dica quali due, il pezzo è il membro intero (`riduci-simili`).
 *
 * Il trascinamento è di POINTER e non di HTML5 drag-and-drop: quello nativo
 * non parte col dito (né sul telefono né sui portatili con schermo touch), e
 * qui dito, mouse e penna devono essere lo stesso gesto. Premere e lasciare
 * senza muoversi È la selezione: sotto la soglia il gesto sceglie, sopra
 * trascina — per questo non c'è un ascoltatore di `click` sulla lavagna.
 *
 * TRAPPOLA: durante la presa il puntatore è CATTURATO dalla lavagna (la
 * scrittura si ridisegna sotto le dita, e un elemento sparito non manda più
 * eventi), quindi `e.target` è sempre la lavagna: chi sta sotto lo dice
 * `document.elementFromPoint`. Perché quella risposta sia il termine e non la
 * zona di rilascio, le due zone stanno DIETRO (`z-index: -1`, con
 * `isolation: isolate` sulla lavagna) e sono solo un aiuto visivo: la metà
 * bersaglio si ricava dalla x del puntatore, non da chi riceve l'evento.
 *
 * ALTRA TRAPPOLA: gli ascoltatori sulla lavagna, che sopravvive al ridisegno,
 * si ASSEGNANO (`el.ondrop = …`). Aggiunti con addEventListener se ne
 * accumulerebbe uno per mossa, ognuno con lo stato vecchio dentro.
 */

/** Come si legge un'operazione nel menu: `aggiungi` è il valore, non l'invito. */
const ALG_VERBI = {
  aggiungi: 'aggiungi ai due membri',
  sottrai: 'togli dai due membri',
  moltiplica: 'moltiplica i due membri per',
  dividi: 'dividi i due membri per',
};

class XAlgebra extends HTMLElement {
  connectedCallback() {
    if (this.dataset.built) return;
    this.dataset.built = 'true';

    this.A = window.Algebra;
    if (!this.A || !this.A.applicaMossa) {
      console.warn('x-algebra: static/lib/algebra-*.js non caricati', this);
      return;
    }

    this.partenza = (this.dataset.eq || '').trim();
    this.traguardoSpec = this.leggiJSON('traguardo', null);
    this.whitelist = this.leggiJSON('mosse', null);

    try {
      this.storia = [{ albero: this.A.parse(this.partenza), etichetta: null }];
    } catch (err) {
      // textContent e non innerHTML: il messaggio riporta il pezzo incriminato,
      // e con `data-eq` che un giorno arriverà da una query string (pagina
      // strumento) quello è input non fidato.
      const p = document.createElement('p');
      p.className = 'alg-errore';
      p.textContent = 'Non riesco a leggere «' + this.partenza + '»: ' + err.message;
      this.replaceChildren(p);
      return;
    }

    this.azioni = [];
    this.selezione = null;
    this.trascinato = null;
    this.completato = false;
    // Mossa di semplificazione in attesa del risultato digitato: finché è qui,
    // la lavagna aspetta una scrittura e non un'altra mossa. I parametri sono
    // quelli che il gesto le ha già dato (per `riduci-coppia`, l'altro termine).
    this.daDigitare = null;
    this.parametriDaDigitare = null;

    this.costruisci();
    this.ripristina();
    this.disegna();
  }

  // -- Lettura degli attributi ----------------------------------------------

  leggiJSON(chiave, difetto) {
    const grezzo = this.dataset[chiave];
    if (!grezzo) return difetto;
    try {
      return JSON.parse(grezzo);
    } catch (e) {
      console.warn('x-algebra: data-' + chiave + ' non valido', grezzo);
      return difetto;
    }
  }

  get albero() {
    return this.storia[this.storia.length - 1].albero;
  }

  // -- Costruzione ----------------------------------------------------------

  costruisci() {
    const conTraguardo = Boolean(this.traguardoSpec);
    this.innerHTML = `
      <div class="alg-testata">
        <span class="alg-obiettivo">${conTraguardo ? this.escapeHtml(this.descriviTraguardo()) : ''}</span>
        <span class="alg-comandi">
          ${conTraguardo ? '<button type="button" class="alg-btn" data-cmd="aiuto">Ci sono?</button>' : ''}
          <button type="button" class="alg-btn" data-cmd="annulla" disabled>Annulla</button>
        </span>
      </div>
      <div class="alg-lavagna">
        <div class="alg-zona" data-meta="left"><span>a sinistra</span></div>
        <div class="alg-zona" data-meta="right"><span>a destra</span></div>
        <div class="alg-scrittura"></div>
      </div>
      <p class="alg-messaggio" role="status"></p>
      <div class="alg-menu">
        <div class="alg-mosse"></div>
        <form class="alg-digita" hidden>
          <label class="alg-digita-invito"></label>
          <input type="text" class="alg-digita-campo" autocomplete="off" spellcheck="false">
          <button type="submit" class="alg-btn alg-btn-primario">Scrivi</button>
          <button type="button" class="alg-btn" data-cmd="lascia">Lascia stare</button>
        </form>
      </div>
      <details class="alg-svolgimento" hidden>
        <summary>Lo svolgimento<span class="alg-passi-conto"></span></summary>
        <ul class="alg-passi"></ul>
      </details>
    `;

    this.lavagna = this.querySelector('.alg-lavagna');
    this.scrittura = this.querySelector('.alg-scrittura');
    this.messaggioEl = this.querySelector('.alg-messaggio');
    this.mosseEl = this.querySelector('.alg-mosse');
    this.digitaEl = this.querySelector('.alg-digita');
    this.campoEl = this.querySelector('.alg-digita-campo');
    this.invitoEl = this.querySelector('.alg-digita-invito');
    this.svolgimentoEl = this.querySelector('.alg-svolgimento');
    this.passiEl = this.querySelector('.alg-passi');
    this.annullaEl = this.querySelector('[data-cmd="annulla"]');

    this.collega();
  }

  /**
   * Tutti gli ascoltatori vivono sugli elementi che SOPRAVVIVONO al ridisegno
   * (la lavagna, il menu), non sui pezzi ridisegnati a ogni mossa: la
   * delegazione è quello che rende sicuro riscrivere `innerHTML` cento volte.
   */
  collega() {
    this.querySelector('.alg-testata').onclick = (e) => {
      const cmd = e.target.closest('[data-cmd]');
      if (!cmd) return;
      if (cmd.dataset.cmd === 'annulla') this.annulla();
      if (cmd.dataset.cmd === 'aiuto') this.aiuto();
    };

    this.mosseEl.onclick = (e) => {
      if (e.target.closest('[data-seleziona-genitore]')) {
        const padre = this.A.trovaGenitore(this.albero, this.selezione);
        if (padre && padre.type !== 'eq') this.seleziona(padre.id);
        return;
      }
      const bottone = e.target.closest('[data-mossa]');
      if (bottone) this.scegliMossa(bottone.dataset.mossa);
    };

    this.mosseEl.onsubmit = (e) => {
      const modulo = e.target.closest('[data-mossa-form]');
      if (!modulo) return;
      e.preventDefault();
      const dati = new FormData(modulo);
      this.gioca({
        mossa: modulo.dataset.mossaForm,
        nodo: null,
        parametri: {
          operazione: dati.get('operazione'),
          valore: String(dati.get('valore') || '').trim(),
        },
      });
    };

    this.digitaEl.onsubmit = (e) => {
      e.preventDefault();
      this.gioca({
        mossa: this.daDigitare,
        nodo: this.selezione,
        parametri: this.parametriDaDigitare || undefined,
        digitato: this.campoEl.value,
      });
    };
    this.digitaEl.onclick = (e) => {
      if (e.target.closest('[data-cmd="lascia"]')) {
        this.daDigitare = null;
        this.parametriDaDigitare = null;
        this.messaggio('');
        this.disegna();
      }
    };

    // Da tastiera i termini sono raggiungibili con Tab: Invio o Spazio li
    // sceglie. Tutte le mosse sono bottoni, quindi già raggiungibili.
    this.lavagna.onkeydown = (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const id = this.idSelezionabileDalDom(e.target);
      if (id === null) return;
      e.preventDefault();
      this.seleziona(id === this.selezione ? null : id);
    };

    // Il trascinamento e la SELEZIONE sono lo stesso gesto visto in due modi:
    // premi, e se ti muovi trascini, se non ti muovi scegli. Per questo il
    // click non serve — la scelta la decide `puntaSu`.
    this.lavagna.onpointerdown = (e) => this.puntaGiu(e);
    this.lavagna.onpointermove = (e) => this.puntaMuovi(e);
    this.lavagna.onpointerup = (e) => this.puntaSu(e);
    this.lavagna.onpointercancel = () => this.annullaLaPresa();
  }

  // -- Disegno ---------------------------------------------------------------

  disegna() {
    // Le zone "a sinistra/a destra" hanno senso solo per il trasporto
    // attraverso l'uguale: in un'espressione non c'è un'altra parte dove
    // portare un termine.
    this.lavagna.classList.toggle('alg-con-uguale', this.albero.type === 'eq');
    // Gli id dei nodi finiscono in `data-nodo`, e lo svolgimento contiene
    // vecchi alberi con gli stessi id: ogni ricerca è quindi ristretta alla
    // scrittura viva, mai fatta sul documento.
    this.scrittura.innerHTML = this.A.rendiHTML(this.albero);
    this.marcaTermini();
    this.A.visita(this.albero, (n) => {
      const padre = this.A.trovaGenitore(this.albero, n.id);
      const termine = padre && padre.type === 'op' && (padre.op === '+' || padre.op === '-');
      // Anche un termine interno già semplice deve poter essere selezionato
      // col proprio segno. Dal menu si risale poi alla somma da calcolare.
      if (!termine && !this.A.mosseDisponibili(this.albero, n.id, this.whitelist).length) return;
      const span = this.scrittura.querySelector('[data-nodo="' + n.id + '"]');
      if (!span) return;
      span.classList.add('alg-selezionabile');
      span.tabIndex = 0;
    });

    if (this.selezione) {
      const span = this.scrittura.querySelector('[data-nodo="' + this.selezione + '"]');
      if (span) span.classList.add('alg-scelto');
      else this.selezione = null;
    }

    // Una mossa può lavorare su DUE pezzi (il gesto sui simili): finché si
    // aspetta il risultato vanno evidenziati tutti e due, altrimenti il campo
    // chiederebbe una somma di cui se ne vede acceso solo un addendo.
    const altro = this.parametriDaDigitare && this.parametriDaDigitare.altro;
    if (altro != null) {
      const span = this.scrittura.querySelector('[data-nodo="' + altro + '"]');
      if (span) span.classList.add('alg-scelto');
    }

    this.disegnaMenu();
    this.disegnaSvolgimento();
    this.annullaEl.disabled = this.azioni.length === 0;
  }

  /** I termini di primo livello sono i pezzi che si trascinano: solo loro. */
  marcaTermini() {
    for (const termine of this.terminiDiPrimoLivello()) {
      const span = this.scrittura.querySelector('[data-nodo="' + termine.id + '"]');
      if (!span) continue;
      span.classList.add('alg-termine');
    }
  }

  /** I termini di primo livello dei due membri (o dell'unico, se non è
   *  un'equazione), nell'ordine in cui si leggono. */
  terminiDiPrimoLivello() {
    const membri = this.albero.type === 'eq'
      ? [this.albero.left, this.albero.right]
      : [this.albero];
    return membri.reduce(
      (tutti, m) => tutti.concat(this.A.terminiDi(m).map((t) => t.nodo)), []);
  }

  disegnaMenu() {
    if (this.daDigitare) {
      // Mentre si aspetta una scrittura il menu sparisce: l'unica cosa da fare
      // è finire il conto cominciato, o lasciar perdere.
      this.mosseEl.innerHTML = '';
      this.digitaEl.hidden = false;
      return;
    }
    this.digitaEl.hidden = true;

    const disponibili = this.A.mosseDisponibili(this.albero, this.selezione, this.whitelist);
    let bottoni = disponibili.map((m) => '<button type="button" class="alg-btn" data-mossa="'
      + m.id + '">' + this.escapeHtml(m.etichetta) + '</button>').join('');
    const padre = this.selezione && this.A.trovaGenitore(this.albero, this.selezione);
    if (padre && padre.type !== 'eq') {
      bottoni += '<button type="button" class="alg-btn" data-seleziona-genitore>Seleziona espressione contenitrice</button>';
    }

    // Le mosse con `opzioni` (i due principi) chiedono un parametro, quindi non
    // sono un bottone ma un modulo. Sono mosse sui DUE MEMBRI: si offrono
    // quando non c'è una selezione, come le altre mosse di quel bersaglio.
    const moduli = this.selezione ? '' : this.mosseConParametri().map((m) => `
      <form class="alg-modulo" data-mossa-form="${m.id}">
        <span class="alg-modulo-nome">${this.escapeHtml(m.breve || m.etichetta)}</span>
        <select name="operazione" aria-label="${this.escapeHtml(m.etichetta)}">
          ${m.opzioni.operazione.map((o) => '<option value="' + o + '">' + (ALG_VERBI[o] || o) + '</option>').join('')}
        </select>
        <input type="text" name="valore" size="6" autocomplete="off" spellcheck="false" placeholder="quanto">
        <button type="submit" class="alg-btn">Applica</button>
      </form>
    `).join('');

    const invito = (bottoni || moduli) ? ''
      : '<p class="alg-invito">Scegli un pezzo della scrittura per vedere che cosa puoi farci.</p>';

    this.mosseEl.innerHTML = bottoni + moduli + invito;
  }

  /** Le mosse abilitate che chiedono un parametro con opzioni dichiarate, e
   *  che si possono applicare adesso ai due membri. */
  mosseConParametri() {
    if (this.albero.type !== 'eq') return [];
    const ammesse = this.whitelist || Object.keys(this.A.CATALOGO);
    return ammesse
      .map((id) => this.A.CATALOGO[id])
      .filter((m) => m && m.opzioni && m.bersaglio === 'equazione');
  }

  disegnaSvolgimento() {
    if (this.storia.length < 2) {
      this.svolgimentoEl.hidden = true;
      return;
    }
    this.svolgimentoEl.hidden = false;
    // Il conto delle mosse sta nel sommario, non accanto a ogni riga: numerare i
    // passaggi metteva cifre di elenco a fianco delle cifre dell'equazione, e a
    // colpo d'occhio le due si confondevano.
    const mosse = this.storia.length - 1;
    this.querySelector('.alg-passi-conto').textContent =
      mosse === 1 ? ' — 1 passaggio' : ' — ' + mosse + ' passaggi';
    // La cella del nome si scrive sempre, anche vuota: le righe sono celle di
    // una griglia, e una cella in meno sfalserebbe tutte le righe dopo.
    this.passiEl.innerHTML = this.storia.map((passo) => '<li>'
      + '<span class="alg-passo-riga">' + this.A.rendiHTML(passo.albero) + '</span>'
      + '<span class="alg-passo-nome">' + this.escapeHtml(passo.etichetta || '') + '</span>'
      + '</li>').join('');
  }

  // -- Selezione -------------------------------------------------------------

  seleziona(id) {
    if (this.daDigitare) return;   // c'è un conto aperto: prima si chiude quello
    this.selezione = id;
    this.messaggio('');
    this.disegna();
  }

  // -- Le mosse --------------------------------------------------------------

  /**
   * Sceglie una mossa dal menu. Se è di semplificazione non la esegue: apre il
   * campo dove lo studente scriverà il risultato, perché quel conto è suo.
   */
  scegliMossa(id) {
    const mossa = this.A.CATALOGO[id];
    if (!mossa) return;
    if (mossa.tipo === 'semplificazione') {
      this.chiediIlRisultato(id, this.selezione);
      return;
    }
    this.gioca({ mossa: id, nodo: this.selezione });
  }

  chiediIlRisultato(idMossa, idNodo, parametri = null) {
    // Salvato anche nella cronologia: i passaggi precedenti a questa versione
    // continuano a riferirsi al solo nodo, quelli nuovi al termine col segno.
    parametri = { ...parametri, conSegno: true };
    const pezzo = this.pezzoDaRiscrivere(idMossa, idNodo, parametri);
    if (!pezzo) return;
    this.selezione = idNodo;
    this.daDigitare = idMossa;
    this.parametriDaDigitare = parametri;
    this.disegna();
    this.invitoEl.textContent = this.A.CATALOGO[idMossa].etichetta + ':';
    // Il campo parte dalla scrittura attuale invece che vuoto: la mossa cambia
    // un pezzo di una riga lunga, e ricopiare il resto a mano non è il conto
    // che si sta chiedendo.
    this.campoEl.value = this.A.scrivi(pezzo);
    this.campoEl.focus();
    this.campoEl.select();
  }

  /**
   * Il pezzo che quella mossa fa riscrivere: di norma il nodo scelto, ma una
   * mossa può comporselo (la somma di due termini lontani non è un nodo solo).
   * È lei a saperlo, e lo dice con `pezzo`.
   */
  pezzoDaRiscrivere(idMossa, idNodo, parametri) {
    const mossa = this.A.CATALOGO[idMossa];
    if (!mossa) return null;
    if (!mossa.pezzo) return parametri && parametri.conSegno
      ? this.A.pezzoConSegno(this.albero, idNodo) : this.A.trovaNodo(this.albero, idNodo);
    try {
      return mossa.pezzo(this.albero, idNodo, parametri || {});
    } catch (e) {
      return null;
    }
  }

  /** Esegue una mossa e, se riesce, la aggiunge alla sequenza. */
  gioca(azione) {
    const esito = this.A.applicaMossa(this.albero, azione, this.whitelist);
    if (!esito.ok) {
      this.messaggio(esito.messaggio);
      return false;
    }

    // Nella sequenza il nodo si ricorda per CAMMINO: gli id di questa pagina
    // non varranno più nulla alla prossima apertura.
    this.azioni.push({
      mossa: azione.mossa,
      percorso: azione.nodo ? this.A.percorsoDi(this.albero, azione.nodo) : null,
      parametri: this.parametriDaSalvare(azione),
      digitato: azione.digitato || null,
    });
    this.storia.push({
      albero: esito.albero,
      etichetta: this.A.CATALOGO[azione.mossa].etichetta,
    });

    this.selezione = null;
    this.daDigitare = null;
    this.parametriDaDigitare = null;
    this.messaggio('');
    this.disegna();
    this.verificaTraguardo();
    return true;
  }

  /**
   * I parametri come vanno SALVATI. Quelli che sono nodi (la mossa li dichiara
   * in `parametriNodo`) diventano cammini, per la stessa ragione del nodo
   * scelto: gli id vivono quanto la pagina, il cammino vale anche domani.
   */
  parametriDaSalvare(azione) {
    const param = azione.parametri;
    if (!param) return null;
    const mossa = this.A.CATALOGO[azione.mossa];
    const nodi = (mossa && mossa.parametriNodo) || [];
    const salvati = { ...param };
    for (const chiave of nodi) {
      if (salvati[chiave] == null) continue;
      salvati[chiave] = { percorso: this.A.percorsoDi(this.albero, salvati[chiave]) };
    }
    return salvati;
  }

  /** L'inverso, alla ripresa: i cammini tornano id di questa pagina. Null se
   *  uno non porta più da nessuna parte — l'albero è cambiato sotto. */
  parametriRipresi(idMossa, param) {
    if (!param) return undefined;
    const mossa = this.A.CATALOGO[idMossa];
    const nodi = (mossa && mossa.parametriNodo) || [];
    const vivi = { ...param };
    for (const chiave of nodi) {
      const salvato = vivi[chiave];
      if (salvato == null) continue;
      const nodo = salvato.percorso ? this.A.nodoAlPercorso(this.albero, salvato.percorso) : null;
      if (!nodo) return null;
      vivi[chiave] = nodo.id;
    }
    return vivi;
  }

  annulla() {
    if (this.azioni.length === 0) return;
    this.storia.pop();
    this.azioni.pop();
    this.selezione = null;
    this.daDigitare = null;
    this.parametriDaDigitare = null;
    this.disegna();
    this.messaggio('Passaggio annullato.');
  }

  // -- I gesti ---------------------------------------------------------------

  /** Quanto ci si deve muovere prima che «premere» diventi «trascinare»: sotto
   *  questa soglia il gesto resta una scelta, e il dito non è mai fermo. */
  static get SOGLIA() { return 8; }

  /**
   * Si preme. Non si decide ancora niente: si prende nota del pezzo e del
   * punto. La cattura del puntatore va sulla LAVAGNA perché la scrittura si
   * ridisegna sotto le dita, e un elemento sparito non manda più eventi; da
   * lì in poi chi sta sotto lo dice `document.elementFromPoint`, non il
   * bersaglio dell'evento (con la cattura è sempre la lavagna).
   */
  puntaGiu(e) {
    if (e.button > 0 || this.daDigitare) return;
    const termine = this.termineChiude(e.target);
    this.presa = {
      pointerId: e.pointerId,
      id: termine ? termine.id : null,
      scelto: this.idSelezionabileDalDom(e.target),
      x: e.clientX,
      y: e.clientY,
      partita: false,
    };
    // La cattura può rifiutarsi (un puntatore già rilasciato, un evento
    // sintetico del collaudo): senza di lei il trascinamento funziona lo
    // stesso finché il dito resta sulla lavagna, quindi non è un errore.
    try {
      if (termine) this.lavagna.setPointerCapture(e.pointerId);
    } catch (err) { /* si tira avanti senza cattura */ }
  }

  puntaMuovi(e) {
    const presa = this.presa;
    if (!presa || presa.pointerId !== e.pointerId || presa.id === null) return;
    if (!presa.partita) {
      const lontano = Math.abs(e.clientX - presa.x) > XAlgebra.SOGLIA
        || Math.abs(e.clientY - presa.y) > XAlgebra.SOGLIA;
      if (!lontano) return;
      presa.partita = true;
      this.trascinato = presa.id;
      if (this.selezione !== null) this.seleziona(null);
      this.lavagna.classList.add('alg-trascinando');
    }
    e.preventDefault();
    this.mostra(this.intento(this.punto(e)));
  }

  /**
   * Si lascia. Se il pezzo si era mosso è un rilascio, altrimenti il gesto era
   * una scelta: un tocco su un termine o sul suo segno sceglie il termine.
   * Il menu permette di risalire all'espressione che lo contiene.
   */
  puntaSu(e) {
    const presa = this.presa;
    if (!presa || presa.pointerId !== e.pointerId) return;
    this.presa = null;
    if (this.lavagna.hasPointerCapture(e.pointerId)) {
      this.lavagna.releasePointerCapture(e.pointerId);
    }
    if (!presa.partita) {
      const id = presa.scelto;
      this.seleziona(id === this.selezione ? null : id);
      return;
    }
    this.rilascia(this.punto(e));
  }

  /** Chi sta davvero sotto il puntatore. Con la cattura attiva `e.target` è
   *  sempre la lavagna, quindi il bersaglio si chiede al documento. */
  punto(e) {
    const sotto = document.elementFromPoint(e.clientX, e.clientY);
    return { clientX: e.clientX, clientY: e.clientY, target: sotto || this.lavagna };
  }

  /** Il sistema ha tolto il puntatore di mano (uno scroll che vince, una
   *  chiamata in arrivo): la presa finisce senza fare la mossa. */
  annullaLaPresa() {
    this.presa = null;
    this.fineTrascinamento();
  }

  rilascia(e) {
    if (!this.trascinato) return;
    const intento = this.intento(e);
    const preso = this.trascinato;
    this.fineTrascinamento();
    if (!intento) return;

    if (intento.tipo === 'trasporto') {
      this.gioca({ mossa: 'trasporto', nodo: preso });
    } else if (intento.tipo === 'simili') {
      // Sommare due termini simili è un CONTO: il gesto sceglie la mossa e i
      // due pezzi, il risultato lo scrive lo studente — e da riscrivere c'è
      // solo la loro somma, non tutto il membro. Si chiede prima al motore se
      // la mossa è ammessa qui, altrimenti si aprirebbe un campo che non può
      // accettare niente.
      const parametri = { altro: intento.bersaglio };
      const esito = this.A.applicaMossa(this.albero,
        { mossa: 'riduci-coppia', nodo: preso, parametri }, this.whitelist);
      if (!esito.ok && esito.codice !== 'serve-il-risultato') {
        this.messaggio(esito.messaggio);
        return;
      }
      this.chiediIlRisultato('riduci-coppia', preso, parametri);
    } else if (intento.tipo === 'sposta') {
      this.gioca({ mossa: 'sposta', nodo: preso, parametri: { posizione: intento.posizione } });
    }
  }

  fineTrascinamento() {
    this.trascinato = null;
    this.lavagna.classList.remove('alg-trascinando');
    this.mostra(null);
  }

  /**
   * Che cosa vuol dire questo rilascio. La metà bersaglio si ricava dalla **x
   * del puntatore** rispetto all'uguale, non da chi riceve l'evento: le zone
   * disegnate stanno dietro (vedi la trappola in cima al file) e sono solo un
   * aiuto per l'occhio.
   */
  intento(e) {
    const preso = this.A.trovaNodo(this.albero, this.trascinato);
    const posto = preso && this.A.postoDelTermine(this.albero, this.trascinato);
    if (!posto) return null;

    if (this.albero.type === 'eq') {
      const uguale = this.scrittura.querySelector('.alg-uguale');
      if (uguale) {
        const r = uguale.getBoundingClientRect();
        const meta = e.clientX < r.left + r.width / 2 ? 'left' : 'right';
        if (this.albero[meta].id !== posto.membro.id) return { tipo: 'trasporto', meta };
      }
    }

    // Stesso membro. Se sotto al puntatore c'è un termine SIMILE, il gesto è
    // «sommali»; altrimenti è «mettilo qui».
    const sotto = this.termineChiude(e.target);
    if (sotto && sotto.id !== this.trascinato) {
      const stessoMembro = posto.termini.some((t) => t.nodo.id === sotto.id);
      const suo = this.A.parteLetterale(sotto);
      const mio = this.A.parteLetterale(preso);
      if (stessoMembro && suo !== null && suo === mio) {
        return { tipo: 'simili', bersaglio: sotto.id };
      }
    }

    const posizione = this.posizioneDiInserimento(e.clientX, posto);
    if (posizione === posto.indice) return null;
    return { tipo: 'sposta', posizione };
  }

  /** Quanti termini (escluso quello in mano) stanno a sinistra del puntatore:
   *  è esattamente l'indice a cui il pezzo va inserito. */
  posizioneDiInserimento(x, posto) {
    let quanti = 0;
    for (const t of posto.termini) {
      if (t.nodo.id === this.trascinato) continue;
      const span = this.scrittura.querySelector('[data-nodo="' + t.nodo.id + '"]');
      if (!span) continue;
      const r = span.getBoundingClientRect();
      if (x > r.left + r.width / 2) quanti++;
    }
    return quanti;
  }

  /** Il feedback del trascinamento: dove finirà il pezzo se lo lascio qui. */
  mostra(intento) {
    this.lavagna.querySelectorAll('.alg-zona.attiva')
      .forEach((z) => z.classList.remove('attiva'));
    this.scrittura.querySelectorAll('.alg-simile, .alg-prima, .alg-dopo')
      .forEach((s) => s.classList.remove('alg-simile', 'alg-prima', 'alg-dopo'));
    if (!intento) return;

    if (intento.tipo === 'trasporto') {
      const zona = this.lavagna.querySelector('.alg-zona[data-meta="' + intento.meta + '"]');
      if (zona) zona.classList.add('attiva');
      return;
    }
    if (intento.tipo === 'simili') {
      const span = this.scrittura.querySelector('[data-nodo="' + intento.bersaglio + '"]');
      if (span) span.classList.add('alg-simile');
      return;
    }
    // Spostamento: il segno di inserimento va sul termine che si troverà
    // subito dopo il pezzo, o dopo l'ultimo se il pezzo finisce in coda.
    const posto = this.A.postoDelTermine(this.albero, this.trascinato);
    if (!posto) return;
    const altri = posto.termini.filter((t) => t.nodo.id !== this.trascinato);
    const dopoDiLui = altri[intento.posizione];
    const bersaglio = dopoDiLui || altri[altri.length - 1];
    if (!bersaglio) return;
    const span = this.scrittura.querySelector('[data-nodo="' + bersaglio.nodo.id + '"]');
    if (span) span.classList.add(dopoDiLui ? 'alg-prima' : 'alg-dopo');
  }

  /** Il termine di primo livello che contiene quell'elemento del DOM, o null:
   *  si afferra il `2` di `2x`, ma quel che si sposta è tutto `2x`. */
  termineChiude(elemento) {
    const id = this.idDalDom(elemento);
    if (id === null) return null;
    return this.terminiDiPrimoLivello()
      .find((t) => t.id === id || this.A.trovaNodo(t, id)) || null;
  }

  /** Un pezzo senza mosse lascia scegliere il primo antenato che ne ha.
   *  La presa dei termini usa invece il nodo originale, anche come bersaglio. */
  idSelezionabileDalDom(elemento) {
    const span = elemento && elemento.closest
      ? elemento.closest('.alg-selezionabile') : null;
    return span && this.scrittura.contains(span) ? this.idDalDom(span) : null;
  }

  /**
   * L'id VERO del nodo dietro a uno span, o null.
   *
   * `data-nodo` è una stringa — l'ha scritta l'HTML — mentre nell'albero gli id
   * sono numeri, e tutto il motore li confronta con `===`. Senza questa
   * conversione ogni click sceglieva un pezzo inesistente: nessun errore, solo
   * un menu vuoto. Si passa dall'albero e non da `Number()` perché così la
   * conversione resta vera anche se un giorno gli id cambiassero forma, e uno
   * span rimasto da un ridisegno vecchio dà null invece di un id fantasma.
   */
  idDalDom(elemento) {
    const span = elemento && elemento.closest ? elemento.closest('[data-nodo]') : null;
    if (!span) return null;
    let esito = null;
    this.A.visita(this.albero, (n) => {
      if (esito === null && String(n.id) === span.dataset.nodo) esito = n.id;
    });
    return esito;
  }

  // -- Il traguardo ----------------------------------------------------------

  descriviTraguardo() {
    const s = this.traguardoSpec || {};
    if (s.isola) return 'Obiettivo: isolare ' + s.isola;
    if (s.forma === 'normale') return 'Obiettivo: la forma normale (tutto a sinistra, zero a destra)';
    if (s.forma === 'ridotta') return 'Obiettivo: il polinomio ridotto e ordinato';
    if (s.forma === 'ax=b') {
      // NON è «l'incognita da sola»: quello è `isola`, e sta un passo più in
      // là. `ax = b` si ferma a `2x = 5`. Descriverlo male vuol dire far
      // credere che il traguardo si sia acceso per sbaglio — o, peggio, che
      // l'esercizio chieda qualcosa che non chiede.
      return 'Obiettivo: a sinistra solo il termine con '
        + (s.incognita || 'l\'incognita') + ', a destra solo un numero (come 2x = 5)';
    }
    return 'Obiettivo';
  }

  verificaTraguardo() {
    if (!this.traguardoSpec || this.completato || !this.id) return;
    const esito = this.giudica();
    if (!esito || !esito.ok) return;

    this.completato = true;
    this.setAttribute('data-completed', 'true');
    this.messaggio('Ci sei.');
    this.dispatchEvent(new CustomEvent('goal-complete', {
      bubbles: true,
      composed: true,
      // La risposta salvata è la SEQUENZA: riaprendo la lezione lo studente
      // ritrova il suo svolgimento, non solo la riga d'arrivo.
      detail: { goalId: this.id, value: JSON.stringify(this.azioni) },
    }));
  }

  /** Il traguardo, o null se è dichiarato male. Un traguardo sbagliato è un
   *  errore d'autore e solleva: non deve portarsi dietro la lezione. */
  giudica() {
    try {
      return this.A.traguardo(this.albero, this.traguardoSpec);
    } catch (e) {
      console.warn('x-algebra: traguardo non valido', e.message, this);
      return null;
    }
  }

  /** «Ci sono?»: il primo problema che resta, cioè quello da sistemare prima
   *  (il motore li ordina per urgenza). Dice che cosa manca, non che cosa
   *  fare. */
  aiuto() {
    if (!this.traguardoSpec) return;
    const esito = this.giudica();
    if (!esito) { this.messaggio('Non riesco a giudicare questo traguardo.'); return; }
    if (esito.ok) { this.messaggio('Ci sei.'); return; }

    const primo = esito.problemi[0];
    this.messaggio(primo.messaggio);
    if (primo.nodo) {
      const span = this.scrittura.querySelector('[data-nodo="' + primo.nodo + '"]');
      if (span) span.classList.add('alg-indicato');
    }
  }

  // -- Ripresa ---------------------------------------------------------------

  /**
   * Rigioca la sequenza salvata. Una mossa che non si può più rifare (la
   * lezione è cambiata sotto, il cammino non porta più da nessuna parte) ferma
   * la ripresa lì: meglio ripartire da un passaggio buono che da uno stato
   * inventato.
   */
  ripristina() {
    if (!this.id || !window.courseProgress) return;
    const salvato = window.courseProgress.getStepForElement(this);
    const grezzo = salvato && salvato.answers ? salvato.answers[this.id] : null;
    if (!grezzo) return;

    let azioni;
    try {
      azioni = JSON.parse(grezzo);
    } catch (e) {
      return;
    }
    if (!Array.isArray(azioni)) return;

    for (const az of azioni) {
      const nodo = az.percorso ? this.A.nodoAlPercorso(this.albero, az.percorso) : null;
      if (az.percorso && !nodo) break;
      const parametri = this.parametriRipresi(az.mossa, az.parametri);
      if (parametri === null) break;
      const esito = this.A.applicaMossa(this.albero, {
        mossa: az.mossa,
        nodo: nodo ? nodo.id : null,
        parametri: parametri || undefined,
        digitato: az.digitato || undefined,
      }, this.whitelist);
      if (!esito.ok) break;
      this.azioni.push(az);
      this.storia.push({
        albero: esito.albero,
        etichetta: this.A.CATALOGO[az.mossa].etichetta,
      });
    }

    // Il goal risulta già completato in `x-step` (lo legge da storage): qui si
    // segna soltanto lo stato, senza rilanciare l'evento.
    if (this.traguardoSpec && this.azioni.length) {
      const esito = this.giudica();
      if (esito && esito.ok) {
        this.completato = true;
        this.setAttribute('data-completed', 'true');
      }
    }
  }

  // -- Servizio --------------------------------------------------------------

  messaggio(testo) {
    this.messaggioEl.textContent = testo || '';
    this.messaggioEl.classList.toggle('visibile', Boolean(testo));
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

customElements.define('x-algebra', XAlgebra);
