/**
 * Collaudo di <x-algebra> in un browser VERO — lo lancia
 * `tests/test_algebra_browser.py`, che assembla la pagina e legge `#esito`.
 *
 * Perché non basta la suite di `tests/js/`: quella prova il motore, che non ha
 * un DOM. La prima versione del componente aveva 174 test verdi e in pagina
 * ogni click era morto — `data-nodo` restituisce una STRINGA, gli id
 * dell'albero sono numeri, e `trovaNodo` confronta con `===`. Nessun errore in
 * console: solo un menu vuoto. Un bug così si vede solo qui.
 *
 * Quindi qui non si chiama mai il motore per fare una mossa: si clicca sui
 * pezzi, si premono i bottoni, si scrive nel campo, si trascina. Il motore
 * serve solo a LEGGERE lo stato per giudicare (`A.scrivi`, `A.visita`).
 *
 * I gesti sono sintetici (`new PointerEvent`): provano i gesti e i loro esiti,
 * non la macchina del browser. Il componente non usa il drag-and-drop nativo —
 * col dito non parte — ma pointerdown/move/up, e la stessa pressione vale come
 * scelta se non ci si muove: per questo anche `scegli` è un premi-e-lascia.
 * Che sotto il puntatore si trovi il termine e non la zona di rilascio dipende
 * dal fatto che le zone stanno dietro (vedi il commento in cima a
 * static/components/algebra.js).
 */
(function () {
  const esiti = [];
  const ok = (nome) => esiti.push('OK   ' + nome);
  const ko = (nome, dettaglio) => esiti.push('KO   ' + nome + ' -- ' + dettaglio);

  function prova(nome, f) {
    try {
      f();
      ok(nome);
    } catch (e) {
      ko(nome, e && e.message ? e.message : String(e));
    }
  }

  const A = window.Algebra;
  const asserisci = (c, m) => { if (!c) throw new Error(m); };

  // -- attrezzi ------------------------------------------------------------

  const comp = () => document.getElementById('a1');

  /** Il nodo scritto così, dentro l'albero corrente. */
  function nodoScritto(c, testo) {
    let trovato = null;
    A.visita(c.albero, (n) => {
      if (trovato === null && n.type !== 'eq' && A.scrivi(n) === testo) trovato = n;
    });
    asserisci(trovato, 'nessun nodo scritto "' + testo + '" in ' + A.scrivi(c.albero));
    return trovato;
  }

  function spanDi(c, id) {
    const s = c.scrittura.querySelector('[data-nodo="' + id + '"]');
    asserisci(s, 'nessuno span per il nodo ' + id);
    return s;
  }

  /** Un evento di puntatore, come lo manda un dito o un mouse. */
  function punta(el, tipo, x, y) {
    el.dispatchEvent(new PointerEvent(tipo, {
      bubbles: true, cancelable: true, pointerId: 1, isPrimary: true,
      pointerType: 'touch', clientX: x, clientY: y,
    }));
  }

  /** Tocca il pezzo senza muoversi: per il componente è una scelta. */
  function toccaSpan(span) {
    const p = centro(span);
    punta(span, 'pointerdown', p.x, p.y);
    punta(span, 'pointerup', p.x, p.y);
  }

  /** Sceglie il pezzo scritto così (come farebbe uno studente). */
  function scegli(c, testo) {
    toccaSpan(spanDi(c, nodoScritto(c, testo).id));
  }

  function scegliNodo(c, nodo) {
    toccaSpan(spanDi(c, nodo.id));
  }

  /** Preme il bottone di mossa con quell'etichetta. Sul bottone c'è il nome
   *  corto, ma l'`aria-label` porta sempre la frase intera del catalogo: il
   *  collaudo nomina quella, così accorciare un'etichetta è una scelta di
   *  grafica e non rompe le prove. */
  function premi(c, etichetta) {
    const nome = (x) => x.getAttribute('aria-label') || x.textContent.trim();
    const b = [...c.querySelectorAll('.alg-mosse [data-mossa]')].find((x) => nome(x) === etichetta);
    asserisci(b, 'nessun bottone «' + etichetta + '» fra ['
      + [...c.querySelectorAll('.alg-mosse [data-mossa]')].map(nome) + ']');
    b.click();
  }

  /** Scrive il risultato nel campo aperto da una mossa di semplificazione. */
  function scrivi(c, testo) {
    asserisci(!c.digitaEl.hidden, 'il campo per digitare non è aperto');
    c.campoEl.value = testo;
    c.digitaEl.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }

  /** Compila e invia il modulo di un principio. */
  function applica(c, idMossa, operazione, valore) {
    const form = c.querySelector('[data-mossa-form="' + idMossa + '"]');
    asserisci(form, 'nessun modulo per ' + idMossa);
    form.querySelector('[name="operazione"]').value = operazione;
    form.querySelector('[name="valore"]').value = valore;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }

  /**
   * Un trascinamento: dal pezzo scritto `testo` al punto (x, y).
   *
   * Il primo spostamento è uno strappo di 30px che serve solo a superare la
   * soglia oltre la quale premere diventa trascinare; conta l'ULTIMO. Da lì in
   * poi gli eventi vanno alla lavagna e non allo span di partenza: il
   * trascinamento ridisegna la scrittura, e uno span staccato dal documento
   * non fa più bollire niente.
   */
  function trascina(c, testo, x, y) {
    const sorgente = spanDi(c, nodoScritto(c, testo).id);
    const da = centro(sorgente);
    punta(sorgente, 'pointerdown', da.x, da.y);
    punta(c.lavagna, 'pointermove', da.x + 30, da.y);
    punta(c.lavagna, 'pointermove', x, y);
    punta(c.lavagna, 'pointerup', x, y);
  }

  const centro = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  // -- 1. l'esercizio intero, a click --------------------------------------

  let completato = null;
  document.addEventListener('goal-complete', (e) => { completato = e.detail; });

  prova('l\'esercizio si gioca fino in fondo attraverso l\'interfaccia', () => {
    const c = comp();
    asserisci(A.scrivi(c.albero) === '2x + 3y - 6 = 0', 'partenza sbagliata: ' + A.scrivi(c.albero));

    scegli(c, '6');
    premi(c, 'Porta il termine dall\'altra parte');
    asserisci(A.scrivi(c.albero) === '2x + 3y = 0 + 6', 'dopo il trasporto: ' + A.scrivi(c.albero));

    scegliNodo(c, c.albero.right);
    premi(c, 'Calcola');
    scrivi(c, '6');

    scegli(c, '2x');
    premi(c, 'Porta il termine dall\'altra parte');

    applica(c, 'secondo-principio', 'dividi', '3');

    scegliNodo(c, c.albero.left);
    premi(c, 'Scrivi il monomio in forma normale');
    scrivi(c, 'y');

    scegli(c, '6/3');
    premi(c, 'Calcola');
    scrivi(c, '2');

    scegli(c, '2x / 3');
    premi(c, 'Scrivi il monomio in forma normale');
    asserisci(c.campoEl.value.startsWith('-'), 'il campo deve includere il segno del termine');
    scrivi(c, '-2/3x');

    scegliNodo(c, c.albero.right);
    premi(c, 'Ordina per grado decrescente');

    asserisci(A.scrivi(c.albero) === 'y = -2/3x + 2', 'arrivo: ' + A.scrivi(c.albero));
    asserisci(completato && completato.goalId === 'a1', 'goal-complete non è arrivato');
    asserisci(c.hasAttribute('data-completed'), 'manca data-completed');
    asserisci(c.azioni.length === 8, 'mosse registrate: ' + c.azioni.length);
  });

  // La sequenza salvata serve al prossimo test (la ripresa).
  const sequenza = comp() ? JSON.stringify(comp().azioni) : '[]';

  prova('lo svolgimento ha una riga per passaggio, più la partenza', () => {
    const c = comp();
    asserisci(!c.svolgimentoEl.hidden, 'lo svolgimento è nascosto');
    asserisci(c.passiEl.children.length === 9,
      'righe di svolgimento: ' + c.passiEl.children.length);
  });

  prova('annulla torna indietro di un passaggio solo', () => {
    const c = comp();
    const prima = A.scrivi(c.albero);
    c.querySelector('[data-cmd="annulla"]').click();
    asserisci(A.scrivi(c.albero) !== prima, 'non è tornato indietro');
    asserisci(c.azioni.length === 7, 'mosse dopo l\'annulla: ' + c.azioni.length);
    asserisci(A.scrivi(c.albero) === 'y = 2 - 2/3x', 'stato dopo l\'annulla: ' + A.scrivi(c.albero));
  });

  // -- 2. i gesti -----------------------------------------------------------

  prova('gesto: attraverso l\'uguale è un trasporto', () => {
    const c = document.getElementById('g1');
    const uguale = c.scrittura.querySelector('.alg-uguale');
    const r = uguale.getBoundingClientRect();
    trascina(c, '3', r.right + 40, centro(c.lavagna).y);
    asserisci(A.scrivi(c.albero) === '2x = 8 - 3', 'dopo il gesto: ' + A.scrivi(c.albero));
    asserisci(c.azioni[0].mossa === 'trasporto', 'mossa registrata: ' + c.azioni[0].mossa);
  });

  prova('gesto: di lato riordina, e il segno segue il termine', () => {
    const c = document.getElementById('g2');
    const primo = spanDi(c, nodoScritto(c, '3').id);
    trascina(c, '2x', primo.getBoundingClientRect().left - 6, centro(primo).y);
    asserisci(A.scrivi(c.albero) === '2x + 3 - y = 0', 'dopo il gesto: ' + A.scrivi(c.albero));
  });

  prova('gesto: su un termine simile apre il conto, non lo fa', () => {
    const c = document.getElementById('g3');
    const bersaglio = spanDi(c, nodoScritto(c, '2x').id);
    const p = centro(bersaglio);
    trascina(c, '5x', p.x, p.y);
    asserisci(!c.digitaEl.hidden, 'il campo per digitare non si è aperto');
    asserisci(c.daDigitare === 'riduci-coppia', 'mossa in attesa: ' + c.daDigitare);
    asserisci(c.azioni.length === 0, 'la somma l\'ha fatta il motore: mosse ' + c.azioni.length);
    // Da riscrivere c'è la somma dei DUE, non il membro: il `4` in mezzo lo
    // ricopia il motore, e il conto che resta è quello che si è già fatto.
    asserisci(c.campoEl.value === '2x + 5x', 'il campo propone: «' + c.campoEl.value + '»');
    scrivi(c, '7x');
    asserisci(A.scrivi(c.albero) === '7x + 4 = 0', 'dopo la somma: ' + A.scrivi(c.albero));
  });

  /**
   * Dentro a una parentesi si gioca come fuori.
   *
   * Il caso è quello vero: `9[(2x−1/3)(2x+1/3) − (2x−1/3)²]` svolto diventa
   * `9(4x² − 1/9 − (4x² − 4/3x + 1/9))`, e lì lo studente vuole togliere il
   * meno davanti alla parentesi e sommare i due `4x²`. Il motore lo sapeva
   * fare, ma i pezzi non erano nemmeno afferrabili: il componente marcava
   * come termini solo quelli del MEMBRO, e la parentesi ne è fuori.
   */
  prova('dentro a una parentesi: si toglie il meno e si sommano i simili', () => {
    const c = document.getElementById('g5');

    scegli(c, '4x^2 - 4/3x + 1/9');
    premi(c, 'Svolgi il prodotto');
    // Il campo parte dal pezzo COL suo meno: è quello che si sta riscrivendo.
    asserisci(c.campoEl.value === '-(4x^2 - 4/3x + 1/9)',
      'il campo propone: «' + c.campoEl.value + '»');
    scrivi(c, '-4x^2 + 4/3x - 1/9');
    asserisci(A.scrivi(c.albero) === 'x / 2 + 9(4x^2 - 1/9 - 4x^2 + 4/3x - 1/9) = 0',
      'dopo lo sviluppo: ' + A.scrivi(c.albero));

    // I due 4x², dentro alla parentesi: si prendono in mano e si sommano.
    const quadrati = [];
    A.visita(c.albero, (n) => { if (A.scrivi(n) === '4x^2') quadrati.push(n); });
    asserisci(quadrati.length === 2, 'quadrati trovati: ' + quadrati.length);
    for (const q of quadrati) {
      asserisci(spanDi(c, q.id).classList.contains('alg-termine'),
        'un 4x² dentro alla parentesi non è afferrabile');
    }
    const bersaglio = centro(spanDi(c, quadrati[0].id));
    const preso = spanDi(c, quadrati[1].id);
    const da = centro(preso);
    punta(preso, 'pointerdown', da.x, da.y);
    punta(c.lavagna, 'pointermove', da.x + 30, da.y);
    punta(c.lavagna, 'pointermove', bersaglio.x, bersaglio.y);
    punta(c.lavagna, 'pointerup', bersaglio.x, bersaglio.y);
    asserisci(c.daDigitare === 'riduci-coppia', 'mossa in attesa: ' + c.daDigitare);
    scrivi(c, '0');
    asserisci(A.scrivi(c.albero) === 'x / 2 + 9(0 - 1/9 + 4/3x - 1/9) = 0',
      'dopo la somma: ' + A.scrivi(c.albero));

    // Lo zero si cancella lì, senza aspettare che la parentesi sparisca.
    scegli(c, '0');
    premi(c, 'Elimina il termine nullo');
    asserisci(A.scrivi(c.albero) === 'x / 2 + 9(-1/9 + 4/3x - 1/9) = 0',
      'dopo la cancellazione: ' + A.scrivi(c.albero));

    // Il 9 è un fattore, non un termine: non si prende in mano.
    asserisci(!spanDi(c, nodoScritto(c, '9').id).classList.contains('alg-termine'),
      'il fattore 9 è afferrabile come un termine');
  });

  prova('un risultato sbagliato non entra, e dice perché', () => {
    const c = document.getElementById('g4');
    scegliNodo(c, c.albero.left);
    premi(c, 'Somma i termini simili');
    scrivi(c, '8x');
    asserisci(A.scrivi(c.albero) === '2x + 5x = 0', 'ha accettato: ' + A.scrivi(c.albero));
    asserisci(/non vale quanto/.test(c.messaggioEl.textContent),
      'messaggio: «' + c.messaggioEl.textContent + '»');
  });

  prova('i due 2 senza mosse selezionano la frazione, anche dopo annulla', () => {
    const c = document.createElement('x-algebra');
    c.dataset.eq = '2x / 2';
    document.body.prepend(c);
    try {
      const frazione = c.albero;
      for (const numero of [frazione.left.left, frazione.right]) {
        asserisci(spanDi(c, numero.id).tabIndex === -1, 'numero raggiungibile con Tab');
        scegliNodo(c, numero);
        asserisci(c.selezione === frazione.id, 'non ha selezionato la frazione');
        asserisci(c.mosseEl.querySelector('[data-mossa]'), 'menu vuoto');
        // Il secondo tocco sullo stesso bersaglio toglie la selezione.
        scegliNodo(c, numero);
        asserisci(c.selezione === null, 'selezione non rimossa');
      }
      const span = spanDi(c, frazione.id);
      asserisci(span.tabIndex === 0, 'frazione non raggiungibile con Tab');
      span.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      asserisci(c.selezione === frazione.id, 'tastiera non seleziona la frazione');
      premi(c, 'Scrivi il monomio in forma normale');
      scrivi(c, 'x');
      asserisci(A.scrivi(c.albero) === 'x', 'semplificazione fallita');
      scegliNodo(c, c.albero);
      asserisci(c.selezione === null, 'x senza mosse selezionabile');
      asserisci(!c.scrittura.querySelector('[tabindex="0"]'), 'Tab su pezzi senza mosse');
      c.querySelector('[data-cmd="annulla"]').click();
      scegliNodo(c, c.albero.right);
      asserisci(c.selezione === c.albero.id, 'annulla non ripristina la selezione utile');
    } finally {
      c.remove();
    }
  });

  prova('la selezione rispetta le mosse abilitate e mantiene i figli con azioni', () => {
    const c = document.createElement('x-algebra');
    c.dataset.eq = '(2 + 3)x / 2';
    c.dataset.mosse = '["calcola"]';
    document.body.prepend(c);
    try {
      scegliNodo(c, c.albero.right);
      asserisci(c.selezione === null, 'selezionata una frazione senza mosse abilitate');
      const somma = c.albero.left.left;
      scegliNodo(c, somma.left);
      asserisci(c.selezione === somma.left.id, 'non seleziona il termine interno');
      c.querySelector('[data-seleziona-genitore]').click();
      asserisci(c.selezione === somma.id, 'non si risale alla somma interna calcolabile');
      premi(c, 'Calcola');
      scrivi(c, '5');
      asserisci(!c.scrittura.querySelector('.alg-selezionabile'), 'restano pezzi senza azioni selezionabili');
    } finally {
      c.remove();
    }
  });

  prova('il meno appartiene alla selezione, al trasporto e alle somme interne', () => {
    const c = document.createElement('x-algebra');
    c.dataset.eq = 'x-5=0';
    document.body.prepend(c);
    try {
      scegli(c, '5');
      asserisci(c.scrittura.querySelector('.alg-scelto').textContent === '−5', 'selezionato il numero senza meno');
      premi(c, 'Porta il termine dall\'altra parte');
      asserisci(A.scrivi(c.albero) === 'x = 0 + 5', 'trasporto senza il segno');
      c.querySelector('[data-cmd="annulla"]').click();
      const meno = spanDi(c, c.albero.left.right.id).querySelector('.alg-operatore');
      toccaSpan(meno);
      asserisci(c.selezione === c.albero.left.right.id, 'il click sul meno non seleziona il termine');
      c.querySelector('[data-seleziona-genitore]').click();
      asserisci(c.selezione === c.albero.left.id, 'non si può risalire alla somma');
    } finally { c.remove(); }

    const d = document.createElement('x-algebra');
    d.dataset.eq = 'x-3(2+1)=0';
    document.body.prepend(d);
    try {
      scegli(d, '2 + 1');
      premi(d, 'Calcola');
      asserisci(d.campoEl.value === '2 + 1', 'la selezione interna ha assorbito un meno esterno');
      scrivi(d, '3');
      asserisci(A.scrivi(d.albero) === 'x - 3(3) = 0' || A.scrivi(d.albero) === 'x - 3 * 3 = 0', 'calcolo interno sbagliato: ' + A.scrivi(d.albero));
    } finally { d.remove(); }
  });

  prova('lavagna libera: semplificazione dello screenshot, annulla e ripresa', () => {
    const c = document.createElement('x-algebra');
    c.dataset.eq = '3(x+2)-4x=5-x';
    document.body.prepend(c);
    const progress = window.courseProgress;
    try {
      applica(c, 'secondo-principio', 'moltiplica', '-1');
      const termine = c.albero.right.right;
      const span = spanDi(c, termine.id);
      asserisci(span.textContent === '−(−1x)', 'il segno esterno non è nello stesso elemento del termine');
      span.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true}));
      premi(c, 'Scrivi il monomio in forma normale');
      asserisci(c.campoEl.value === '-(-1x)', 'campo diverso dalla selezione: ' + c.campoEl.value);
      scrivi(c, '-x');
      asserisci(c.azioni.length === 1, 'accettato il segno sbagliato');
      scrivi(c, '+x');
      asserisci(A.scrivi(c.albero.right) === '-1 * 5 + x', 'meno residuo dopo la semplificazione');
      for (const [lato, posizione, risultato, mossa] of [
        ['left','left','-3(x+2)', 'Semplifica'],
        ['left','right','4x', 'Scrivi il monomio in forma normale'],
        ['right','left','-5', 'Calcola'],
      ]) {
        scegliNodo(c, c.albero[lato][posizione]);
        const alternative = [...c.querySelectorAll('[data-mossa]')]
          .filter((b) => ['semplifica', 'calcola', 'normalizza-monomio'].includes(b.dataset.mossa));
        asserisci(alternative.length === 1, 'più comandi per la stessa semplificazione');
        premi(c, mossa);
        scrivi(c, risultato);
      }
      const atteso = '-3(x + 2) + 4x = -5 + x';
      asserisci(A.scrivi(c.albero) === atteso, 'percorso incompleto: ' + A.scrivi(c.albero));
      const salvata = JSON.stringify(c.azioni);
      c.querySelector('[data-cmd="annulla"]').click();
      asserisci(A.scrivi(c.albero.right) === '-1 * 5 + x', 'annulla non ripristina il prodotto');
      window.courseProgress = {getStepForElement: () => ({goals:['segni'], answers:{segni:salvata}})};
      const ripreso = document.createElement('x-algebra');
      ripreso.id = 'segni';
      ripreso.dataset.eq = c.dataset.eq;
      document.body.prepend(ripreso);
      try { asserisci(A.scrivi(ripreso.albero) === atteso, 'ripristino dei segni fallito'); }
      finally { ripreso.remove(); }
    } finally { window.courseProgress = progress; c.remove(); }
  });

  prova('la distributiva sul prodotto esterno accetta un passo interno e lo sviluppo completo', () => {
    const c = document.createElement('x-algebra');
    c.dataset.eq = '3(x+2)-4x=5-x';
    document.body.prepend(c);
    try {
      applica(c, 'secondo-principio', 'moltiplica', '-1');
      scegliNodo(c, c.albero.left.left);
      asserisci(c.querySelector('[data-mossa="semplifica"]'), 'manca la scelta sui coefficienti');
      premi(c, 'Svolgi il prodotto');
      scrivi(c, '-3(x+2)');
      asserisci(c.azioni.length === 1, 'la sola semplificazione è passata per distributiva');
      scrivi(c, '-1(3x-6)');
      asserisci(c.azioni.length === 1, 'accettato uno sviluppo non equivalente');
      scrivi(c, '-1(3x+6)');
      asserisci(c.azioni.length === 2, 'rifiutato lo sviluppo interno');
      asserisci(A.scrivi(c.albero.left.left) === '-1(3x + 6)', 'passo interno diverso da quello digitato');
      c.querySelector('[data-cmd="annulla"]').click();
      asserisci(A.scrivi(c.albero.left.left) === '-1(3(x + 2))', 'annulla non ripristina le parentesi');
      scegliNodo(c, c.albero.left.left);
      premi(c, 'Svolgi il prodotto');
      scrivi(c, '-3x-6');
      asserisci(c.azioni.length === 2, 'rifiutato lo sviluppo completo');
      asserisci(A.scrivi(c.albero.left.left) === '-3x - 6', 'sviluppo completo errato');
    } finally { c.remove(); }
  });

  // -- 3. la ripresa --------------------------------------------------------

  prova('la sequenza salvata si rigioca su un albero riletto da zero', () => {
    window.courseProgress = {
      getStepForElement: () => ({ goals: ['r1'], answers: { r1: sequenza } }),
    };
    const c = document.createElement('x-algebra');
    c.id = 'r1';
    c.dataset.eq = '2x + 3y - 6 = 0';
    c.dataset.traguardo = '{"isola":"y"}';
    document.body.appendChild(c);
    asserisci(A.scrivi(c.albero) === 'y = -2/3x + 2', 'ripreso a: ' + A.scrivi(c.albero));
    asserisci(c.hasAttribute('data-completed'), 'ripreso senza il traguardo acceso');
    asserisci(c.passiEl.children.length === 9, 'svolgimento ripreso: ' + c.passiEl.children.length);
  });

  /**
   * La coppia porta nei parametri un NODO, e i nodi si salvano per cammino: un
   * id di questa pagina, rigiocato domani, non troverebbe niente — e il
   * passaggio sparirebbe in silenzio dallo svolgimento dello studente.
   */
  prova('anche la somma di due termini si rigioca dopo il salvataggio', () => {
    const c = document.getElementById('g3');
    asserisci(c.azioni.length === 1 && c.azioni[0].mossa === 'riduci-coppia',
      'il gesto sui simili non è nella sequenza');
    asserisci(c.azioni[0].parametri && Array.isArray(c.azioni[0].parametri.altro.percorso),
      'l\'altro termine non è salvato per cammino');
    const salvata = JSON.stringify(c.azioni);

    window.courseProgress = {
      getStepForElement: () => ({ goals: ['r2'], answers: { r2: salvata } }),
    };
    const ripreso = document.createElement('x-algebra');
    ripreso.id = 'r2';
    ripreso.dataset.eq = '2x + 4 + 5x = 0';
    ripreso.dataset.traguardo = '{"forma":"normale"}';
    document.body.appendChild(ripreso);
    try {
      asserisci(A.scrivi(ripreso.albero) === '7x + 4 = 0',
        'ripreso a: ' + A.scrivi(ripreso.albero));
    } finally {
      ripreso.remove();
    }
  });

  prova('una scrittura che il parser non legge non porta giù la lezione', () => {
    const c = document.createElement('x-algebra');
    c.dataset.eq = '2x +* 3';
    document.body.appendChild(c);
    asserisci(c.querySelector('.alg-errore'), 'nessun messaggio d\'errore');
  });

  const pre = document.createElement('pre');
  pre.id = 'esito';
  pre.textContent = esiti.join('\n');
  document.body.appendChild(pre);
})();
