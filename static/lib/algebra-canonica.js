/**
 * Forma canonica ed equivalenza — l'ORACOLO, non lo stato.
 *
 * Qui un'espressione diventa un polinomio: una mappa da monomio a coefficiente
 * razionale, senza ordine, senza parentesi, senza memoria di com'era scritta.
 * È l'esatto opposto dell'albero letterale di `algebra-parser.js`, e le due
 * cose non vanno mai confuse:
 *
 *   - l'ALBERO è lo stato: si vede, si tocca, si trascina, conserva `2x + 3x`
 *     non sommati e lo `0` residuo;
 *   - il POLINOMIO è solo un giudice: risponde a "queste due scritture valgono
 *     lo stesso?" e a "che forma ha questa roba?", e non arriva mai a schermo.
 *
 * Se un giorno il polinomio tornasse indietro a diventare stato, il componente
 * si metterebbe a riscrivere tutto in bella copia al posto dello studente: è
 * il modo tipico in cui questi strumenti si rovinano.
 *
 * Il dominio è chiuso: polinomi a coefficienti razionali, in quante variabili
 * si vuole. Fuori dal dominio (divisione per una lettera, esponente negativo
 * su una lettera) non si indovina: si solleva un errore che dice cosa manca.
 */

(function (host, base) {
  if (!base || !base.Rational) {
    throw new Error('algebra-canonica.js: static/lib/rational.js va caricato prima (vedi templates/_assets.html)');
  }
  const { Rational } = base;

  // Limiti: l'espressione può arrivare da una query string, e sviluppare
  // `(x+y)^4096` bloccherebbe la pagina prima di dire qualcosa di utile.
  const MAX_GRADO = 64;        // esponente sviluppabile su una base con lettere
  const MAX_TERMINI = 2000;    // termini di un polinomio intermedio

  const ZERO = new Rational(0);
  const UNO = new Rational(1);

  /** La chiave canonica di un monomio: `x^2*y`, oppure '' per la costante. */
  function chiave(esponenti) {
    const lettere = Object.keys(esponenti).filter((v) => esponenti[v] !== 0).sort();
    return lettere.map((v) => (esponenti[v] === 1 ? v : v + '^' + esponenti[v])).join('*');
  }

  /**
   * Polinomio in forma canonica. `termini` è una Map chiave → { esponenti,
   * coeff }; i termini a coefficiente nullo non ci sono proprio, così due
   * polinomi uguali hanno la stessa Map e il confronto è diretto.
   */
  class Poly {
    constructor(termini = new Map()) {
      this.termini = termini;
    }

    static costante(r) {
      const p = new Poly();
      if (r.num !== 0) p.termini.set('', { esponenti: {}, coeff: r });
      return p;
    }

    static variabile(nome) {
      const p = new Poly();
      p.termini.set(nome, { esponenti: { [nome]: 1 }, coeff: UNO });
      return p;
    }

    get èZero() { return this.termini.size === 0; }

    get èCostante() { return this.èZero || (this.termini.size === 1 && this.termini.has('')); }

    /** Il valore, se è una costante; altrimenti null. */
    get costante() {
      if (this.èZero) return ZERO;
      if (!this.èCostante) return null;
      return this.termini.get('').coeff;
    }

    /** Le lettere che compaiono davvero, in ordine alfabetico. */
    get variabili() {
      const viste = new Set();
      for (const t of this.termini.values()) {
        for (const v of Object.keys(t.esponenti)) if (t.esponenti[v] !== 0) viste.add(v);
      }
      return [...viste].sort();
    }

    /** Grado complessivo. Il polinomio nullo ha grado -1 (non zero: `0` e `5`
     *  sono cose diverse, e un predicato sulla forma deve poterle distinguere). */
    get grado() {
      let max = -1;
      for (const t of this.termini.values()) {
        let somma = 0;
        for (const v of Object.keys(t.esponenti)) somma += t.esponenti[v];
        if (somma > max) max = somma;
      }
      return max;
    }

    /** Grado rispetto a una sola lettera. */
    gradoIn(v) {
      let max = 0;
      for (const t of this.termini.values()) max = Math.max(max, t.esponenti[v] || 0);
      return max;
    }

    /** Il coefficiente di un monomio dato per esponenti, es. { x: 2 }. */
    coefficiente(esponenti) {
      const t = this.termini.get(chiave(esponenti));
      return t ? t.coeff : ZERO;
    }

    somma(altro) {
      const out = new Map(this.termini);
      for (const [k, t] of altro.termini) {
        const esistente = out.get(k);
        if (!esistente) { out.set(k, t); continue; }
        const c = esistente.coeff.add(t.coeff);
        if (c.num === 0) out.delete(k);
        else out.set(k, { esponenti: t.esponenti, coeff: c });
      }
      return sorvegliato(new Poly(out));
    }

    negato() {
      const out = new Map();
      for (const [k, t] of this.termini) {
        out.set(k, { esponenti: t.esponenti, coeff: t.coeff.mul(new Rational(-1)) });
      }
      return new Poly(out);
    }

    sottrai(altro) { return this.somma(altro.negato()); }

    moltiplica(altro) {
      const out = new Map();
      for (const a of this.termini.values()) {
        for (const b of altro.termini.values()) {
          const esponenti = { ...a.esponenti };
          for (const v of Object.keys(b.esponenti)) {
            esponenti[v] = (esponenti[v] || 0) + b.esponenti[v];
          }
          const k = chiave(esponenti);
          const precedente = out.get(k);
          const c = precedente ? precedente.coeff.add(a.coeff.mul(b.coeff)) : a.coeff.mul(b.coeff);
          if (c.num === 0) out.delete(k);
          else out.set(k, { esponenti, coeff: c });
        }
      }
      return sorvegliato(new Poly(out));
    }

    /** Potenza a esponente intero ≥ 0. */
    potenza(n) {
      if (!Number.isInteger(n) || n < 0) throw new Error('Esponente non intero o negativo');
      if (n > MAX_GRADO && !this.èCostante) throw new Error('Esponente troppo grande da sviluppare');
      let out = Poly.costante(UNO);
      for (let i = 0; i < n; i++) out = out.moltiplica(this);
      return out;
    }

    dividiPerCostante(r) {
      if (r.num === 0) throw new Error('Divisione per zero');
      const out = new Map();
      for (const [k, t] of this.termini) out.set(k, { esponenti: t.esponenti, coeff: t.coeff.div(r) });
      return new Poly(out);
    }

    uguale(altro) {
      if (this.termini.size !== altro.termini.size) return false;
      for (const [k, t] of this.termini) {
        const u = altro.termini.get(k);
        if (!u || !t.coeff.equals(u.coeff)) return false;
      }
      return true;
    }

    /** I termini ordinati: grado complessivo decrescente, poi alfabetico.
     *  Non è una scrittura da mostrare — serve ai predicati sulla forma e al
     *  debug. Quello che si vede a schermo è sempre l'albero. */
    get ordinati() {
      const grado = (t) => Object.keys(t.esponenti).reduce((s, v) => s + t.esponenti[v], 0);
      return [...this.termini.entries()]
        .sort((a, b) => grado(b[1]) - grado(a[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
        .map(([, t]) => t);
    }

    toString() {
      if (this.èZero) return '0';
      return this.ordinati
        .map((t) => {
          const k = chiave(t.esponenti);
          if (!k) return t.coeff.toString();
          return t.coeff.equals(UNO) ? k : t.coeff.toString() + '*' + k;
        })
        .join(' + ');
    }
  }

  function sorvegliato(p) {
    if (p.termini.size > MAX_TERMINI) throw new Error('Espressione troppo grande da sviluppare');
    return p;
  }

  // --- Dall'albero al polinomio ---------------------------------------------

  /**
   * Albero letterale → polinomio. Solleva se l'espressione esce dal dominio
   * (divisione per una lettera, esponente negativo su una lettera): fuori dai
   * polinomi questo componente non ha niente da dire, e dirlo è meglio che
   * restituire un giudizio inventato.
   */
  function canonicalizza(n) {
    switch (n.type) {
      case 'num':
        return Poly.costante(n.value);
      case 'var':
        return Poly.variabile(n.name);
      case 'neg':
        return canonicalizza(n.operand).negato();
      case 'eq':
        throw new Error('Un\'equazione non è un polinomio: canonicalizza i due membri separatamente');
      case 'op': {
        if (n.op === '+') return canonicalizza(n.left).somma(canonicalizza(n.right));
        if (n.op === '-') return canonicalizza(n.left).sottrai(canonicalizza(n.right));
        if (n.op === '*') return canonicalizza(n.left).moltiplica(canonicalizza(n.right));
        if (n.op === '/') {
          const divisore = canonicalizza(n.right).costante;
          if (divisore === null) {
            // È lo stesso confine del secondo principio: dividere per una
            // lettera vorrebbe dire assumerla diversa da zero, e le condizioni
            // di esistenza sono fuori da questo componente.
            throw new Error('Divisione per un\'espressione che contiene lettere: fuori dal dominio');
          }
          return canonicalizza(n.left).dividiPerCostante(divisore);
        }
        if (n.op === '^') {
          const esponente = n.right.value;
          if (!esponente.isInteger()) throw new Error('Esponente non intero');
          const base_ = canonicalizza(n.left);
          if (esponente.num < 0) {
            const c = base_.costante;
            if (c === null) {
              throw new Error('Esponente negativo su un\'espressione con lettere: fuori dal dominio');
            }
            return Poly.costante(c.pow(esponente.num));
          }
          return base_.potenza(esponente.num);
        }
        throw new Error('Operatore sconosciuto: ' + n.op);
      }
      default:
        throw new Error('Nodo sconosciuto: ' + n.type);
    }
  }

  /**
   * Due scritture valgono lo stesso? È il giudice che dice se ciò che lo
   * studente ha digitato può sostituire il sottoalbero che ha selezionato.
   *
   * Sulle equazioni confronta MEMBRO PER MEMBRO: è "la stessa equazione
   * scritta diversamente", non "le stesse soluzioni". `2x = 4` e `x = 2` hanno
   * le stesse soluzioni e qui risultano diverse — ed è giusto così, perché fra
   * le due c'è una mossa che lo studente deve fare.
   */
  function equivalenti(a, b) {
    if (a.type === 'eq' || b.type === 'eq') {
      if (a.type !== 'eq' || b.type !== 'eq') return false;
      return equivalenti(a.left, b.left) && equivalenti(a.right, b.right);
    }
    return canonicalizza(a).uguale(canonicalizza(b));
  }

  /**
   * L'albero sta dentro al dominio? Il parser accetta più di quanto la forma
   * canonica sappia trattare — `x/y` si scrive e si legge, ma non si sa dire di
   * che grado sia — e chi ha bisogno del polinomio deve poterlo CHIEDERE PRIMA
   * invece di scoprirlo con un'eccezione a metà lavoro.
   *
   * Sta qui, accanto a `canonicalizza`, perché il dominio è suo: le mosse e i
   * traguardi lo interrogano, non lo ridefiniscono ciascuno per conto proprio.
   */
  function nelDominio(n) {
    try {
      if (n.type === 'eq') {
        canonicalizza(n.left);
        canonicalizza(n.right);
      } else {
        canonicalizza(n);
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, codice: 'fuori-dominio', messaggio: e.message };
    }
  }

  /**
   * Valuta l'albero dando un valore alle lettere. Serve ai test come oracolo
   * indipendente dalla forma canonica (due implementazioni che sbagliano allo
   * stesso modo non si smentiscono a vicenda), e servirà al componente per i
   * controlli a campione.
   */
  function valuta(n, assegnazioni = {}) {
    const val = (v) => {
      const x = assegnazioni[v];
      if (x === undefined) throw new Error('Nessun valore per la lettera "' + v + '"');
      return x instanceof Rational ? x : new Rational(x);
    };
    switch (n.type) {
      case 'num': return n.value;
      case 'var': return val(n.name);
      case 'neg': return valuta(n.operand, assegnazioni).mul(new Rational(-1));
      case 'eq': throw new Error('Un\'equazione non si valuta: valuta i due membri');
      case 'op': {
        const a = valuta(n.left, assegnazioni);
        if (n.op === '^') return a.pow(n.right.value.num);
        const b = valuta(n.right, assegnazioni);
        if (n.op === '+') return a.add(b);
        if (n.op === '-') return a.sub(b);
        if (n.op === '*') return a.mul(b);
        if (n.op === '/') return a.div(b);
        throw new Error('Operatore sconosciuto: ' + n.op);
      }
      default:
        throw new Error('Nodo sconosciuto: ' + n.type);
    }
  }

  host.Poly = Poly;
  host.canonicalizza = canonicalizza;
  host.equivalenti = equivalenti;
  host.nelDominio = nelDominio;
  host.valuta = valuta;
})(
  typeof window !== 'undefined'
    ? (window.Algebra = window.Algebra || {})
    : Object.assign(module.exports, require('./rational.js'), require('./algebra-parser.js')),
  typeof window !== 'undefined' ? window.Algebra : require('./rational.js')
);
