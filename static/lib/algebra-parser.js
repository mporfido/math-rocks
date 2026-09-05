/**
 * Parser algebrico — dal testo all'albero LETTERALE.
 *
 * L'albero che esce di qui è lo *stato* del componente di manipolazione
 * algebrica: conserva com'è scritto, non com'è semplificato. `2x + 3x` resta
 * `2x + 3x`, lo `0` residuo resta, l'ordine dei termini è quello dello
 * studente. Nulla si riduce da solo: ridurre è una mossa, e le mosse le sceglie
 * lui. La forma canonica (l'oracolo di equivalenza) è un'altra cosa e vive
 * altrove: qui non se ne sa niente.
 *
 * Ogni nodo ha un `id` stabile: è l'aggancio della selezione, del click e del
 * trascinamento.
 *
 * Il linguaggio accettato — vale sia per l'autore sia per lo studente, che qui
 * digita il sottoalbero risultato di una mossa:
 *
 *   numeri      interi, es. `12`, `-3`
 *   frazioni    `a/b` fra due interi è un LETTERALE razionale atomico (`2/3`),
 *               come in <x-expr>. Fuori da quel caso `/` è una divisione:
 *               `2x/3` è il monomio `2x` diviso `3`, ed è proprio la scrittura
 *               che produce il secondo principio "da lavagna".
 *   lettere     UNA lettera = UNA variabile (`x`, `y`, `A`). Serve perché
 *               `xy` deve poter significare `x·y`: senza questo vincolo la
 *               moltiplicazione implicita è ambigua.
 *   prodotto    esplicito (`2*x`, `2·x`, `2×x`) o implicito (`2x`, `3xy`,
 *               `2(x+1)`, `(x+1)(x-2)`). L'albero ricorda quale dei due era.
 *   divisione   `/`, con `:` e `÷` accettati come sinonimi in ingresso
 *   potenza     `x^2`, esponente intero letterale (niente `2^(3-2)`: quello è
 *               il mestiere di <x-expr>, qui l'esponente non è un nodo da
 *               sciogliere)
 *   parentesi   `( )` `[ ]` `{ }`, equivalenti e annidabili
 *   uguale      al massimo uno, al livello più esterno: `2x + 3 = 8`
 *
 * Nodi prodotti:
 *   { id, type: 'num', num, den, value }   `value` è un Rational ridotto,
 *                                          `num`/`den` restano COME SCRITTI
 *                                          (`6/4` non diventa `3/2` da solo:
 *                                          semmai è una mossa)
 *   { id, type: 'var', name }
 *   { id, type: 'neg', operand }           meno unario, es. `-x`
 *   { id, type: 'op', op, left, right }    op: + - * / ^   (`implicit: true`
 *                                          sul prodotto scritto senza segno)
 *   { id, type: 'eq', left, right }        radice, solo se c'era un `=`
 */

(function (host, base) {
  // Senza il nucleo aritmetico il parser non tacerebbe: costruirebbe alberi
  // con `value` rotto e si scoprirebbe al primo click dello studente. Meglio
  // fermarsi al caricamento, dove l'errore ha ancora un colpevole.
  if (!base || !base.Rational) {
    throw new Error('algebra-parser.js: static/lib/rational.js va caricato prima (vedi templates/_assets.html)');
  }
  const { MAX_EXPR_LENGTH, MAX_DIGITS, Rational } = base;

  // --- Identità dei nodi -----------------------------------------------------
  // Un contatore globale, non per-albero: due nodi non hanno mai lo stesso id
  // nemmeno fra alberi diversi, così un id trascinato non può finire sul nodo
  // sbagliato dopo una mossa che ha ricostruito il ramo.
  let _nodeId = 0;
  const nodo = (props) => ({ id: _nodeId++, ...props });

  const APERTE = { '(': ')', '[': ']', '{': '}' };
  const CHIUSE = { ')': true, ']': true, '}': true };

  function numero(num, den = 1) {
    return nodo({ type: 'num', num, den, value: new Rational(num, den) });
  }

  /**
   * Una divisione fra due NUMERI è una frazione, sempre — non un'operazione in
   * attesa.
   *
   * Per chi studia le due cose non sono distinte, e non devono esserlo: a
   * schermo `5 / 2` e `5/2` sono la stessa frazione impilata, e chiedergli di
   * distinguerle vorrebbe dire insegnargli una differenza che in matematica
   * non c'è. Prima la distinzione esisteva solo nell'albero — con l'effetto
   * che `x = 5 / 2` sembrava finito e non lo era, e la diagnosi parlava di
   * monomi a chi vedeva già il risultato.
   *
   * La frazione che ne esce NON è ridotta: `6 / 2` diventa la frazione `6/2`,
   * che resta da semplificare. È l'unico criterio che rimane, ed è uno solo:
   * una frazione va scritta ai minimi termini.
   *
   * Con una lettera in mezzo (`2x / 3`, `(x + 1) / 3`) resta una divisione
   * vera: lì la barra raggruppa, e la mossa che serve è un'altra.
   */
  function dividi(sinistra, destra) {
    if (sinistra.type !== 'num' || destra.type !== 'num') {
      return nodo({ type: 'op', op: '/', left: sinistra, right: destra });
    }
    if (destra.num === 0) throw new Error('Denominatore zero');
    // (a/b) / (c/d) = ad/bc, senza ridurre: la riduzione è una mossa dello
    // studente, non un regalo del parser.
    let num = sinistra.num * destra.den;
    let den = sinistra.den * destra.num;
    if (den < 0) { num = -num; den = -den; }   // il meno sta davanti, non sotto
    try {
      return numero(num, den);
    } catch (e) {
      // Oltre il limite dell'aritmetica esatta: meglio una divisione scritta
      // che un numero sbagliato in silenzio.
      return nodo({ type: 'op', op: '/', left: sinistra, right: destra });
    }
  }

  // --- Tokenizer -------------------------------------------------------------

  function tokenizza(sorgente) {
    const src = String(sorgente)
      .replace(/×/g, '*').replace(/·/g, '*')
      .replace(/÷/g, ':').replace(/−/g, '-');
    const token = [];
    let i = 0;

    const fineCifre = (da) => {
      let j = da;
      while (j < src.length && src[j] >= '0' && src[j] <= '9') j++;
      if (j - da > MAX_DIGITS) throw new Error('Numero troppo grande');
      return j;
    };

    while (i < src.length) {
      const c = src[i];

      if (/\s/.test(c)) { i++; continue; }

      if (c >= '0' && c <= '9') {
        const fine = fineCifre(i);
        const intero = parseInt(src.slice(i, fine), 10);
        // `a/b` fra due interi è un letterale razionale atomico, non una
        // divisione: la stessa convenzione di <x-expr>, ed è quella che rende
        // `2/3 x` un monomio con coefficiente frazionario invece che una
        // divisione da sciogliere.
        if (src[fine] === '/' && src[fine + 1] >= '0' && src[fine + 1] <= '9') {
          const fineDen = fineCifre(fine + 1);
          const den = parseInt(src.slice(fine + 1, fineDen), 10);
          if (den === 0) throw new Error('Denominatore zero');
          token.push({ tipo: 'num', num: intero, den });
          i = fineDen;
        } else {
          token.push({ tipo: 'num', num: intero, den: 1 });
          i = fine;
        }
        continue;
      }

      if (/[a-zA-Z]/.test(c)) {
        token.push({ tipo: 'var', nome: c });
        i++;
        continue;
      }

      if ('+-*^='.indexOf(c) >= 0) { token.push({ tipo: 'op', op: c }); i++; continue; }
      if (c === '/' || c === ':') { token.push({ tipo: 'op', op: '/' }); i++; continue; }
      if (APERTE[c]) { token.push({ tipo: 'aperta', ch: c }); i++; continue; }
      if (CHIUSE[c]) { token.push({ tipo: 'chiusa', ch: c }); i++; continue; }

      throw new Error('Simbolo non riconosciuto: "' + c + '"');
    }
    return token;
  }

  // --- Parser a discesa ricorsiva -------------------------------------------

  function analizza(token) {
    let pos = 0;
    const guarda = () => token[pos];
    const avanti = () => token[pos++];
    const eOp = (t, ...ops) => !!t && t.tipo === 'op' && ops.indexOf(t.op) >= 0;

    /** Un token che può *iniziare* un fattore: serve al prodotto implicito. */
    const iniziaFattore = (t) =>
      !!t && (t.tipo === 'num' || t.tipo === 'var' || t.tipo === 'aperta');

    function equazione() {
      const sinistra = espressione();
      if (eOp(guarda(), '=')) {
        avanti();
        const destra = espressione();
        if (eOp(guarda(), '=')) throw new Error('Più di un segno di uguale');
        return nodo({ type: 'eq', left: sinistra, right: destra });
      }
      return sinistra;
    }

    function espressione() {
      let sinistra = termine();
      while (eOp(guarda(), '+', '-')) {
        const op = avanti().op;
        sinistra = nodo({ type: 'op', op, left: sinistra, right: termine() });
      }
      return sinistra;
    }

    // Il meno unario lega MENO stretto della moltiplicazione: `-x^2y^3` è
    // `-(x^2y^3)`, non `(-x^2)y^3`. Ma se il termine comincia con un numero il
    // segno entra in quel numero, perché `-5x` è il monomio di coefficiente
    // -5, non l'opposto di `5x`: sono due scritture della stessa cosa e questa
    // è quella che si porta in forma normale.
    function termine() {
      let segno = 1;
      while (eOp(guarda(), '-', '+')) {
        if (avanti().op === '-') segno = -segno;
      }
      const catena = catenaFattori();
      return segno < 0 ? applicaMeno(catena) : catena;
    }

    function applicaMeno(n) {
      let piùASinistra = n;
      while (piùASinistra.type === 'op' && (piùASinistra.op === '*' || piùASinistra.op === '/')) {
        piùASinistra = piùASinistra.left;
      }
      if (piùASinistra.type === 'num') {
        piùASinistra.num = -piùASinistra.num;
        piùASinistra.value = new Rational(piùASinistra.num, piùASinistra.den);
        return n;
      }
      return nodo({ type: 'neg', operand: n });
    }

    function catenaFattori() {
      let sinistra = fattore();
      for (;;) {
        const t = guarda();
        if (eOp(t, '*', '/')) {
          const op = avanti().op;
          const destra = fattore();
          // `5 / 2` scritto con gli spazi deve dare quello che dà `5/2`
          // attaccato: prima erano due alberi diversi per la stessa frazione.
          sinistra = op === '/'
            ? dividi(sinistra, destra)
            : nodo({ type: 'op', op, left: sinistra, right: destra });
          continue;
        }
        // Prodotto implicito: `2x`, `3xy`, `2(x+1)`, `(x+1)(x-2)`.
        if (iniziaFattore(t)) {
          // Due numeri accostati (`2 3`) sono quasi certamente un errore di
          // battitura, non un prodotto: meglio dirlo che calcolare 6.
          if (t.tipo === 'num' && sinistra.type === 'num') {
            throw new Error('Due numeri accostati: manca il segno di moltiplicazione');
          }
          sinistra = nodo({ type: 'op', op: '*', implicit: true, left: sinistra, right: fattore() });
          continue;
        }
        return sinistra;
      }
    }

    /** Un singolo fattore della catena. Il meno che compare qui è quello
     *  interno a un prodotto scritto col segno, es. `2 * -3`. */
    function fattore() {
      if (eOp(guarda(), '-')) {
        avanti();
        const operando = fattore();
        if (operando.type === 'num') return numero(-operando.num, operando.den);
        return nodo({ type: 'neg', operand: operando });
      }
      if (eOp(guarda(), '+')) { avanti(); return fattore(); }
      return potenza();
    }

    function potenza() {
      const base = primario();
      if (!eOp(guarda(), '^')) return base;
      avanti();
      const nodoPot = nodo({ type: 'op', op: '^', left: base, right: esponenteIntero() });
      if (eOp(guarda(), '^')) {
        throw new Error('Potenza di potenza: usa le parentesi, es. (x^2)^3');
      }
      return nodoPot;
    }

    /** L'esponente è un intero scritto, non un'espressione da sciogliere. */
    function esponenteIntero() {
      let segno = 1;
      while (eOp(guarda(), '-', '+')) {
        if (avanti().op === '-') segno = -segno;
      }
      const t = guarda();
      if (!t || t.tipo !== 'num' || t.den !== 1) {
        throw new Error('Esponente non valido: serve un numero intero');
      }
      avanti();
      return numero(segno * t.num);
    }

    function primario() {
      const t = guarda();
      if (!t) throw new Error('Espressione incompleta');

      if (t.tipo === 'num') { avanti(); return numero(t.num, t.den); }
      if (t.tipo === 'var') { avanti(); return nodo({ type: 'var', name: t.nome }); }

      if (t.tipo === 'aperta') {
        const apertura = avanti().ch;
        const dentro = espressione();
        const chiusura = guarda();
        if (!chiusura || chiusura.tipo !== 'chiusa') {
          throw new Error('Manca la parentesi di chiusura "' + APERTE[apertura] + '"');
        }
        if (chiusura.ch !== APERTE[apertura]) {
          throw new Error('Parentesi non corrispondenti: "' + apertura + '" chiusa con "' + chiusura.ch + '"');
        }
        avanti();
        return dentro;
      }

      if (t.tipo === 'chiusa') throw new Error('Parentesi "' + t.ch + '" chiusa senza aprirla');
      throw new Error('Non me lo aspettavo qui: "' + t.op + '"');
    }

    const albero = equazione();
    if (pos < token.length) {
      const r = token[pos];
      // Una chiusa avanzata non è "un simbolo di troppo": è una parentesi che
      // nessuno ha aperto, ed è l'errore di battitura più comune.
      if (r.tipo === 'chiusa') throw new Error('Parentesi "' + r.ch + '" chiusa senza aprirla');
      throw new Error('Non me lo aspettavo qui: "' + (r.op || r.nome || r.num) + '"');
    }
    return albero;
  }

  /** Testo → albero letterale. Solleva un Error con un messaggio in italiano. */
  function parse(sorgente) {
    const testo = String(sorgente == null ? '' : sorgente).trim();
    if (!testo) throw new Error('Espressione vuota');
    // L'espressione può arrivare da una query string, quindi non è input
    // fidato: il limite vale prima di qualunque lavoro.
    if (testo.length > MAX_EXPR_LENGTH) throw new Error('Espressione troppo lunga');
    return analizza(tokenizza(testo));
  }

  // --- Ritorno al testo ------------------------------------------------------
  // Serve al round-trip nei test, ai marker e al debug. NON è il rendering:
  // quello lavora sull'albero, per poterne agganciare i pezzi.

  const PRECEDENZA = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 };
  // Fra `+` (1) e `*` (2): il meno unario abbraccia tutto il prodotto, quindi
  // `-x^2y^3` si riscrive senza parentesi ma `2 * (-3)` con.
  const PREC_NEG = 1.5;

  function scrivi(n) {
    switch (n.type) {
      case 'num':
        return n.den === 1 ? String(n.num) : n.num + '/' + n.den;
      case 'var':
        return n.name;
      case 'neg':
        return '-' + conParentesi(n.operand, PREC_NEG, false);
      case 'eq':
        return scrivi(n.left) + ' = ' + scrivi(n.right);
      case 'op': {
        const p = PRECEDENZA[n.op];
        // Gli operatori binari qui sono tutti associativi a SINISTRA, quindi a
        // destra le parentesi servono anche a pari precedenza: `a - (b - c)`
        // non è `a - b - c`, e nemmeno `a + (b + c)` è `a + b + c` — sono
        // alberi diversi, e l'albero è lo stato. La potenza è il caso opposto:
        // è la sua base a dover essere protetta, `(x^2)^3` non è `x^2^3`.
        // A sinistra un coefficiente negativo si scrive senza parentesi
        // (`-2/3x`): rileggendolo, il meno unario torna dentro al numero. A
        // destra invece servono (`2 * (-3)`), e sotto una potenza pure,
        // perché `-3^2` è `-(3^2)`.
        const sx = conParentesi(n.left, n.op === '^' ? p + 1 : p, n.op !== '^');
        const dx = conParentesi(n.right, p + 1, false);
        if (n.op === '^') return sx + '^' + dx;
        // `implicit` è un desiderio, non un obbligo: se il fattore destro
        // comincia con una cifra il segno ci vuole per forza, altrimenti
        // `3 · 2` si riscriverebbe `32`. Il parser non produce mai un caso
        // simile, ma una mossa che moltiplica termine a termine sì.
        if (n.implicit && !/^[0-9]/.test(dx)) return sx + dx;
        return sx + ' ' + n.op + ' ' + dx;
      }
      default:
        throw new Error('Nodo sconosciuto: ' + n.type);
    }
  }

  function conParentesi(n, minima, negativoNudo) {
    // Un numero negativo scritto come letterale va fra parentesi appena non è
    // in cima a una somma: `2 * -3` si scrive `2 * (-3)`, e `2-3` non deve
    // diventare `2 + -3`.
    let primo = n;
    while (primo.type === 'op' && (primo.op === '*' || primo.op === '/')) primo = primo.left;
    if ((primo.type === 'neg' || (primo.type === 'num' && primo.num < 0)) && minima > 1 && !negativoNudo) {
      return '(' + scrivi(n) + ')';
    }
    const propria = n.type === 'op' ? PRECEDENZA[n.op] : (n.type === 'neg' ? PREC_NEG : 9);
    return propria < minima ? '(' + scrivi(n) + ')' : scrivi(n);
  }

  /** Percorre l'albero in profondità (radice per prima). */
  function visita(n, f) {
    f(n);
    if (n.left) visita(n.left, f);
    if (n.right) visita(n.right, f);
    if (n.operand) visita(n.operand, f);
  }

  /** Il nodo con quell'id, o null: è così che la selezione trova il bersaglio. */
  function trovaNodo(albero, id) {
    let esito = null;
    visita(albero, (n) => { if (n.id === id) esito = n; });
    return esito;
  }

  /**
   * Il CAMMINO dalla radice a un nodo (`['left', 'right']`), o null se il nodo
   * non c'è.
   *
   * Gli id vivono quanto la sessione: nascono da un contatore, e rileggere la
   * stessa scrittura ne produce di nuovi. Per la selezione vanno benissimo —
   * albero e schermo sono lì insieme — ma non per RICORDARE una mossa: una
   * sequenza salvata e poi rigiocata su un albero riletto troverebbe id che
   * non esistono più. Il cammino invece dice *dove* sta un pezzo nella
   * struttura, e vale ancora domani.
   */
  function percorsoDi(albero, id) {
    let esito = null;
    const cerca = (n, cammino) => {
      if (esito) return;
      if (n.id === id) { esito = cammino; return; }
      for (const campo of ['left', 'right', 'operand']) {
        if (n[campo]) cerca(n[campo], [...cammino, campo]);
      }
    };
    cerca(albero, []);
    return esito;
  }

  /** Il nodo in fondo a un cammino, o null se il cammino non porta da nessuna
   *  parte (l'albero è cambiato sotto: succede rigiocando una sequenza
   *  salvata da una versione precedente della lezione). */
  function nodoAlPercorso(albero, percorso) {
    if (!Array.isArray(percorso)) return null;
    let n = albero;
    for (const campo of percorso) {
      if (!n || !n[campo]) return null;
      n = n[campo];
    }
    return n;
  }

  /** Il genitore di un nodo, o null se è la radice: serve a togliere un
   *  termine da una somma, dove l'operazione da rifare è quella sopra. */
  function trovaGenitore(albero, id) {
    let esito = null;
    visita(albero, (n) => {
      for (const campo of ['left', 'right', 'operand']) {
        if (n[campo] && n[campo].id === id) esito = n;
      }
    });
    return esito;
  }

  /**
   * L'albero con il nodo `id` rimpiazzato da `nuovo`. Non muta niente: ricopia
   * solo il cammino dalla radice al nodo toccato, così le parti non coinvolte
   * restano gli stessi oggetti — e soprattutto gli **stessi id**, altrimenti
   * ogni mossa cambierebbe l'identità di tutto e la selezione dello studente,
   * o un trascinamento in corso, finirebbero nel vuoto.
   */
  function sostituisci(n, id, nuovo) {
    if (n.id === id) return nuovo;
    const copia = { ...n };
    let cambiato = false;
    for (const campo of ['left', 'right', 'operand']) {
      if (!n[campo]) continue;
      const rifatto = sostituisci(n[campo], id, nuovo);
      if (rifatto !== n[campo]) { copia[campo] = rifatto; cambiato = true; }
    }
    return cambiato ? copia : n;
  }

  host.parse = parse;
  host.scrivi = scrivi;
  host.visita = visita;
  host.trovaNodo = trovaNodo;
  host.trovaGenitore = trovaGenitore;
  host.percorsoDi = percorsoDi;
  host.nodoAlPercorso = nodoAlPercorso;
  host.sostituisci = sostituisci;
  // Le mosse costruiscono nodi nuovi e devono pescare gli id dallo stesso
  // contatore, altrimenti due nodi diversi potrebbero ritrovarsi con lo stesso.
  host.creaNodo = nodo;
  host.creaNumero = numero;
  host.dividi = dividi;
})(
  // Nel browser il namespace è uno solo e i file di static/lib/ lo estendono;
  // in Node ogni file è un modulo, quindi qui ci si tira dentro il nucleo
  // aritmetico per poter esportare un oggetto completo ai test.
  typeof window !== 'undefined'
    ? (window.Algebra = window.Algebra || {})
    : Object.assign(module.exports, require('./rational.js')),
  typeof window !== 'undefined' ? window.Algebra : require('./rational.js')
);
