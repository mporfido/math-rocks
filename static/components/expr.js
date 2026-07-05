/**
 * <x-expr> - Risoluzione grafica di un'espressione aritmetica ("Sciogliamo i nodi")
 *
 * Lo studente risolve un'espressione un'operazione per volta: clicca l'operatore
 * di un'operazione *riducibile* (entrambi gli operandi già numerici, rispettando
 * parentesi e precedenza), inserisce il risultato e questo "scende" di un livello
 * generando un nodo dell'albero collegato da due linee oblique (resa fedele al
 * metodo del PDF "Sciogliamo i nodi"). A radice risolta emette goal-complete.
 *
 * Attributi:
 *   data-expr: l'espressione (input fidato dell'autore), es. "(4 + 5*4) - (8:2 + 6)"
 *   data-mode: "powers" attiva la modalità potenze (opt-in): le potenze
 *     base^esp restano simboliche e si riducono con le PROPRIETÀ delle potenze
 *     (stessa base, stesso esponente, potenza di potenza, cambio di base);
 *     una potenza resta cliccabile per valutarla. In default tutto è numerico
 *     come sempre. (show-steps non è supportato in modalità potenze.)
 *   data-no-eval: "true" (solo in modalità potenze) vieta la valutazione
 *     numerica delle potenze (R7): il click su una potenza permette solo il
 *     cambio di base (R6). Forza il percorso delle proprietà; da usare solo
 *     in esercizi risolvibili con le sole proprietà.
 *   id: identificativo per il goal tracking (assegnato dal parser)
 *
 * Linguaggio dell'espressione:
 *   operatori: + - * (moltiplicazione) : (divisione) ^ (potenza, esponente intero)
 *   frazioni:  a/b tra interi è un LETTERALE razionale atomico (non una divisione)
 *   parentesi: ( ) [ ] { } (equivalenti, annidabili)
 *   negativi:  meno unario, es. (-2)^3
 *
 * Eventi:
 *   goal-complete: quando l'intera espressione è risolta
 */

// ---------------------------------------------------------------------------
// Aritmetica razionale esatta
// ---------------------------------------------------------------------------

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

/** Numero razionale esatto. Il denominatore è sempre > 0 e la frazione ridotta. */
class Rational {
  constructor(num, den = 1) {
    if (den === 0) throw new Error('Divisione per zero');
    if (den < 0) {
      num = -num;
      den = -den;
    }
    const g = gcd(num, den);
    this.num = num / g;
    this.den = den / g;
  }

  add(o) { return new Rational(this.num * o.den + o.num * this.den, this.den * o.den); }
  sub(o) { return new Rational(this.num * o.den - o.num * this.den, this.den * o.den); }
  mul(o) { return new Rational(this.num * o.num, this.den * o.den); }
  div(o) {
    if (o.num === 0) throw new Error('Divisione per zero');
    return new Rational(this.num * o.den, this.den * o.num);
  }

  /** Potenza a esponente intero (anche negativo). */
  pow(exp) {
    if (!Number.isInteger(exp)) throw new Error('Esponente non intero');
    if (exp < 0) return new Rational(1).div(this.pow(-exp));
    let result = new Rational(1);
    for (let i = 0; i < exp; i++) result = result.mul(this);
    return result;
  }

  equals(o) { return o instanceof Rational && this.num === o.num && this.den === o.den; }

  isInteger() { return this.den === 1; }

  /** Rappresentazione LaTeX: intero oppure \frac{}{} (segno fuori dalla frazione). */
  toLatex() {
    if (this.den === 1) return String(this.num);
    const sign = this.num < 0 ? '-' : '';
    return `${sign}\\frac{${Math.abs(this.num)}}{${this.den}}`;
  }

  /** Rappresentazione testuale lineare (per i marker / debug). */
  toString() {
    return this.den === 1 ? String(this.num) : `${this.num}/${this.den}`;
  }
}

/**
 * Potenza non valutata base^exp (esponente intero, base razionale). Usata solo
 * in modalità potenze (data-mode="powers"): rappresenta `base^exp` in forma
 * simbolica, così le proprietà delle potenze possono applicarsi senza calcolare.
 * Uno scalare NON è una Power con exp=1: kind distinti (non si mostra `7^1`).
 */
class Power {
  constructor(base, exp) {
    if (!exp.isInteger()) throw new Error('Esponente non intero');
    this.base = base; // Rational
    this.exp = exp;   // Rational con den === 1
  }

  /** Uguaglianza STRUTTURALE (2^6 ≠ 4^3 ≠ 64): è la semantica della validazione. */
  equals(o) {
    return o instanceof Power && this.base.equals(o.base) && this.exp.equals(o.exp);
  }

  /** Valutazione esatta in Rational (regola R7). */
  evaluate() { return this.base.pow(this.exp.num); }

  toLatex() {
    const b = (this.base.num < 0 || this.base.den !== 1)
      ? `\\left(${this.base.toLatex()}\\right)`
      : this.base.toLatex();
    return `${b}^{${this.exp.toLatex()}}`;
  }

  /** STABILE: finisce nel progresso salvato e in goal-complete.detail.value. */
  toString() { return `${this.base.toString()}^${this.exp.toString()}`; }
}

/** Valutazione con guardia overflow: null se il risultato esce dai double esatti. */
function safeEvaluate(p) {
  const v = p.evaluate();
  return (Number.isSafeInteger(v.num) && Number.isSafeInteger(v.den)) ? v : null;
}

/** d ≥ 1 tale che b^d === a, altrimenti null (a, b interi ≥ 2). */
function integerLog(b, a) {
  if (b < 2 || a < 2) return null;
  let d = 0, v = 1;
  while (v < a) { v *= b; d++; }
  return v === a ? d : null;
}

/**
 * R6 (cambio di base): `cand` è una riscrittura valida della potenza `orig`?
 * Controllo strutturale, mai numerico (niente numeri grandi, niente
 * fattorizzazione). Valido sse esiste d intero con:
 *   orig.base = cand.base^d  e  cand.exp = d · orig.exp   (es. 9^3 → 3^6)
 * o, in direzione inversa (es. 3^6 → 9^3):
 *   cand.base = orig.base^d  e  orig.exp = d · cand.exp
 * Basi intere ≥ 2 e diverse tra loro (vieta il no-op).
 */
function isEquivalentPower(cand, orig) {
  if (!cand.base.isInteger() || !orig.base.isInteger()) return false;
  const cb = cand.base.num, ob = orig.base.num;
  if (cb === ob) return false;
  let d = integerLog(cb, ob);
  if (d && cand.exp.equals(orig.exp.mul(new Rational(d)))) return true;
  d = integerLog(ob, cb);
  if (d && cand.exp.mul(new Rational(d)).equals(orig.exp)) return true;
  return false;
}

/** Riscrive a^m alla base intera minima (9^3 → 3^6), o null se non riducibile.
 *  Usata solo dal restore (solveAll) per sbloccare i casi tipo 9^3 : 3^5. */
function canonicalRebase(p) {
  if (!p.base.isInteger() || p.base.num < 4) return null;
  for (let b = 2; b * b <= p.base.num; b++) {
    const d = integerLog(b, p.base.num);
    if (d) return new Power(new Rational(b), p.exp.mul(new Rational(d)));
  }
  return null;
}

/** Parsa l'input dello studente ("4", "-5", "4/3", "3^6") in un valore, o null. */
function parseValue(str) {
  const s = String(str).trim().replace(/−/g, '-').replace(/\s+/g, '');
  if (s === '') return null;
  // Potenza: "3^6", "(-2)^3" — base intera (parentesi opzionali), esponente intero.
  let m = s.match(/^\((-?\d+)\)\^(-?\d+)$/) || s.match(/^(-?\d+)\^(-?\d+)$/);
  if (m) return new Power(new Rational(parseInt(m[1], 10), 1), new Rational(parseInt(m[2], 10), 1));
  m = s.match(/^(-?\d+)\/(-?\d+)$/);
  if (m) {
    const den = parseInt(m[2], 10);
    if (den === 0) return null;
    return new Rational(parseInt(m[1], 10), den);
  }
  m = s.match(/^-?\d+$/);
  if (m) return new Rational(parseInt(s, 10), 1);
  return null;
}

// ---------------------------------------------------------------------------
// Tokenizer + parser → AST
// ---------------------------------------------------------------------------

const OPEN = { '(': ')', '[': ']', '{': '}' };
const CLOSE = { ')': '(', ']': '[', '}': '{' };

/**
 * Tokenizza un'espressione. `a/b` tra interi è un singolo token numerico
 * razionale (letterale frazione); `:` è la divisione, `*` la moltiplicazione.
 */
function tokenize(input) {
  const src = input.replace(/×/g, '*').replace(/÷/g, ':').replace(/−/g, '-');
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/\d/.test(c)) {
      let j = i;
      while (j < src.length && /\d/.test(src[j])) j++;
      // Letterale frazione int/int (la barra non è seguita/preceduta da altro)
      if (src[j] === '/' && /\d/.test(src[j + 1] || '')) {
        let k = j + 1;
        while (k < src.length && /\d/.test(src[k])) k++;
        tokens.push({ type: 'num', value: new Rational(parseInt(src.slice(i, j), 10), parseInt(src.slice(j + 1, k), 10)) });
        i = k;
      } else {
        tokens.push({ type: 'num', value: new Rational(parseInt(src.slice(i, j), 10), 1) });
        i = j;
      }
      continue;
    }
    if (OPEN[c]) { tokens.push({ type: 'open', value: c }); i++; continue; }
    if (CLOSE[c]) { tokens.push({ type: 'close', value: c }); i++; continue; }
    if ('+-*:^'.includes(c)) { tokens.push({ type: 'op', value: c }); i++; continue; }
    throw new Error(`Carattere non valido nell'espressione: "${c}"`);
  }
  return tokens;
}

let _nodeId = 0;

/**
 * Parser a discesa ricorsiva con precedenza:
 *   espressione := termine (('+'|'-') termine)*
 *   termine     := potenza (('*'|':') potenza)*
 *   potenza     := unario ('^' potenza)?        (assoc. a destra)
 *   unario      := '-' unario | primario
 *   primario    := num | '(' espressione ')'
 * Ritorna un AST con nodi: {type:'num', value} | {type:'op', op, left, right}.
 * Ogni nodo riceve un id univoco e (per gli operatori) la precedenza/posizione.
 */
function parse(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function makeOp(op, left, right) {
    return { id: _nodeId++, type: 'op', op, left, right, value: null, resolved: false };
  }

  function parseExpr() {
    let node = parseTerm();
    while (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
      const op = next().value;
      node = makeOp(op, node, parseTerm());
    }
    return node;
  }

  function parseTerm() {
    let node = parsePower();
    while (peek() && peek().type === 'op' && (peek().value === '*' || peek().value === ':')) {
      const op = next().value;
      node = makeOp(op, node, parsePower());
    }
    return node;
  }

  function parsePower() {
    const base = parseUnary();
    if (peek() && peek().type === 'op' && peek().value === '^') {
      next();
      return makeOp('^', base, parsePower()); // assoc. a destra
    }
    return base;
  }

  function parseUnary() {
    if (peek() && peek().type === 'op' && peek().value === '-') {
      next();
      const operand = parseUnary();
      // Meno unario su letterale: lo incorporiamo nel numero (resta una foglia).
      if (operand.type === 'num') {
        return { id: _nodeId++, type: 'num', value: operand.value.mul(new Rational(-1)), resolved: true };
      }
      // Meno unario su sotto-espressione: 0 - x (operazione esplicita).
      const zero = { id: _nodeId++, type: 'num', value: new Rational(0), resolved: true };
      return makeOp('-', zero, operand);
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const t = peek();
    if (!t) throw new Error('Espressione incompleta');
    if (t.type === 'num') {
      next();
      return { id: _nodeId++, type: 'num', value: t.value, resolved: true };
    }
    if (t.type === 'open') {
      const opener = next().value;
      const node = parseExpr();
      const closer = peek();
      if (!closer || closer.type !== 'close' || CLOSE[closer.value] !== opener) {
        throw new Error('Parentesi non bilanciate');
      }
      next();
      // Ricorda il tipo di parentesi del sorgente per riprodurlo a video
      // ( ) [ ] { }. (Le parentesi su numeri-foglia sono ignorate in render:
      // i negativi sono già parentesizzati da operandLatex.)
      node.bracket = opener;
      return node;
    }
    throw new Error(`Token inatteso: "${t.value}"`);
  }

  const ast = parseExpr();
  if (pos !== tokens.length) throw new Error('Token in eccesso nell\'espressione');
  return ast;
}

/** Applica un'operazione binaria su due Rational. */
function applyOp(op, a, b) {
  switch (op) {
    case '+': return a.add(b);
    case '-': return a.sub(b);
    case '*': return a.mul(b);
    case ':': return a.div(b);
    case '^': {
      if (!b.isInteger()) throw new Error('Esponente non intero');
      return a.pow(b.num);
    }
    default: throw new Error(`Operatore sconosciuto: ${op}`);
  }
}

/**
 * Insieme dei risultati validi per (op, a, b): array di { rule, value }.
 * a, b sono Rational o Power. La validazione è APPARTENENZA all'insieme: così
 * `2^3 · 2^3` accetta sia `2^6` (R1, stessa base) sia `4^3` (R4, stesso
 * esponente) e il nodo collassa nella forma digitata dallo studente.
 * In modalità default arriva sempre (num, num): solo R0, comportamento storico.
 */
function applicableResults(op, a, b, powersMode) {
  const results = [];
  const powA = a instanceof Power, powB = b instanceof Power;

  if (!powA && !powB) {
    // R0 — aritmetica numerica. Il try protegge dai soli input d'autore
    // invalidi (divisione per zero, esponente non intero): l'operazione
    // risulta non riducibile invece di rompere il componente.
    try {
      results.push({ rule: 'R0', value: applyOp(op, a, b) });
    } catch (err) { /* nessuna regola */ }
    return results;
  }
  if (!powersMode) return results; // in default `Power` non esiste mai

  // Numero uguale alla base letto come potenza a esponente 1 (a · a^n, a^n : a).
  const pa = powA ? a : (powB && b.base.equals(a) ? new Power(a, new Rational(1)) : null);
  const pb = powB ? b : (powA && a.base.equals(b) ? new Power(b, new Rational(1)) : null);

  if (pa && pb) {
    if (pa.base.equals(pb.base)) {
      if (op === '*') results.push({ rule: 'R1', value: new Power(pa.base, pa.exp.add(pb.exp)) });
      if (op === ':') results.push({ rule: 'R2', value: new Power(pa.base, pa.exp.sub(pb.exp)) });
    }
    if (pa.exp.equals(pb.exp)) {
      if (op === '*') results.push({ rule: 'R4', value: new Power(pa.base.mul(pb.base), pa.exp) });
      if (op === ':') results.push({ rule: 'R5', value: new Power(pa.base.div(pb.base), pa.exp) });
    }
  }
  if (powA && !powB && op === '^') {
    // R3 — potenza di potenza: (a^m)^n = a^(m·n)
    if (b.isInteger()) results.push({ rule: 'R3', value: new Power(a.base, a.exp.mul(b)) });
  }
  return results;
}

const OP_GLYPH = { '+': '+', '-': '−', '*': '·', ':': ':', '^': '^' };

// Operatori in LaTeX, per lo svolgimento classico (show-steps) reso da MathJax.
const OP_LATEX = { '+': '+', '-': '-', '*': '\\cdot', ':': ':', '^': '^' };

// Delimitatori LaTeX per le parentesi del sorgente ( ) [ ] { }.
const BRACKET_LATEX = { '(': ['(', ')'], '[': ['[', ']'], '{': ['\\{', '\\}'] };

// ---------------------------------------------------------------------------
// Web Component
// ---------------------------------------------------------------------------

class XExpr extends HTMLElement {
  connectedCallback() {
    const exprStr = this.dataset.expr || '';
    // Modalità potenze (opt-in): le potenze-letterali restano simboliche e le
    // proprietà delle potenze diventano regole di riduzione. Va letta PRIMA di
    // parse/assignLevels (isPowLiteral ne dipende).
    this.powersMode = this.dataset.mode === 'powers';
    // no-eval (solo in modalità potenze): niente valutazione numerica delle
    // potenze (R7), si accettano solo proprietà e cambio di base.
    this.noEval = this.powersMode && this.dataset.noEval === 'true';
    // show-steps non è supportato in modalità potenze (i livelli sono dinamici
    // e romperebbero l'indicizzazione delle righe dello svolgimento).
    this.showSteps = this.dataset.showSteps === 'true' && !this.powersMode;

    try {
      this.ast = parse(tokenize(exprStr));
    } catch (err) {
      this.innerHTML = `<p class="expr-error">Espressione non valida: ${err.message}</p>`;
      return;
    }

    // Assegna livelli (altezza nel sotto-albero: foglie row 0, radice in basso).
    this.maxLevel = this.assignLevels(this.ast);

    // Indice nodi-operatore per id, per lookup rapido sui click.
    this.opNodes = [];
    this.collectOps(this.ast);

    // Storico dei passaggi dello studente (per il bottone "annulla l'ultimo
    // passaggio" in modalità potenze). Il restore non vi partecipa.
    this.history = [];

    // Stato salvato: se il goal era già completato, risolveremo subito tutto.
    const saved = window.courseProgress
      ? window.courseProgress.getStepForElement(this)
      : null;
    this.savedDone = Boolean(saved && Array.isArray(saved.goals) && saved.goals.includes(this.id));

    this.buildDom();

    // Layout differito: serve che gli span siano nel DOM e (idealmente) typeset.
    requestAnimationFrame(() => {
      this.layout();
      if (this.savedDone) this.solveAll();
    });

    // Ridisegno su resize (le linee oblique seguono le posizioni dei token).
    if ('ResizeObserver' in window) {
      this._ro = new ResizeObserver(() => this.layout());
      this._ro.observe(this);
      // Il typeset MathJax cambia la larghezza dei token (testo grezzo
      // `\(...\)` → CHTML) senza toccare la dimensione del componente: senza
      // osservarli, le linee disegnate dal restore pre-typeset resterebbero
      // alle coordinate vecchie.
      this.tokensRow.querySelectorAll('.expr-token')
        .forEach((el) => this._ro.observe(el));
    }
  }

  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
  }

  /** row del nodo = 0 per le foglie, 1 + max(figli) per gli operatori.
   *  In modalità potenze anche una potenza-letterale non sciolta è una foglia
   *  (vive nella riga token come operando); se lo studente la scioglie
   *  esplicitamente (R6/R7) smette di essere letterale e i livelli vengono
   *  ricalcolati (resolveNode). */
  assignLevels(node) {
    if (node.type === 'num' || this.isPowLiteral(node)) { node.level = 0; return 0; }
    const l = this.assignLevels(node.left);
    const r = this.assignLevels(node.right);
    node.level = Math.max(l, r) + 1;
    return node.level;
  }

  collectOps(node) {
    if (node.type === 'op') {
      this.opNodes.push(node);
      node.left.parentOp = node;
      node.right.parentOp = node;
      this.collectOps(node.left);
      this.collectOps(node.right);
    }
  }

  /** true se un antenato del nodo è già risolto (il suo valore non serve più). */
  hasResolvedAncestor(node) {
    for (let p = node.parentOp; p; p = p.parentOp) {
      if (p.resolved) return true;
    }
    return false;
  }

  /** Una foglia/nodo è "valore" se risolto (operando pronto). */
  isResolved(node) {
    return node.type === 'num' || node.resolved;
  }

  /** Potenza-letterale: nodo ^ con base ed esponente numerici, non ancora
   *  sciolto esplicitamente (R6/R7). Esiste solo in modalità potenze: è un
   *  operando già pronto, con valore virtuale Power (vedi valueOf). */
  isPowLiteral(node) {
    return this.powersMode && node.type === 'op' && node.op === '^'
      && !node.resolved
      && node.left.type === 'num' && node.right.type === 'num';
  }

  /** Valore (eventualmente virtuale) di un nodo, o null se non pronto. */
  valueOf(node) {
    if (node.type === 'num' || node.resolved) return node.value;
    if (this.isPowLiteral(node)) return new Power(node.left.value, node.right.value);
    return null;
  }

  /** Un operatore è riducibile ORA se esiste almeno una regola applicabile
   *  ai valori (anche virtuali) dei figli. Una potenza-letterale è sempre
   *  cliccabile: valutarla (R7) o cambiarle base (R6). */
  isReducible(node) {
    if (node.type !== 'op' || node.resolved) return false;
    if (this.isPowLiteral(node)) return true;
    const a = this.valueOf(node.left);
    const b = this.valueOf(node.right);
    if (a == null || b == null) return false;
    return applicableResults(node.op, a, b, this.powersMode).length > 0;
  }

  // -- Costruzione DOM ------------------------------------------------------

  buildDom() {
    this.classList.add('expr-widget');
    this.innerHTML = '';

    // Riga superiore: token dell'espressione (operandi + operatori cliccabili).
    this.tokensRow = document.createElement('div');
    this.tokensRow.className = 'expr-tokens';

    // Area albero: SVG (linee) + layer dei nodi (valori/input), in overlay.
    this.tree = document.createElement('div');
    this.tree.className = 'expr-tree';
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'expr-svg');
    this.nodeLayer = document.createElement('div');
    this.nodeLayer.className = 'expr-nodes';
    this.tree.appendChild(this.svg);
    this.tree.appendChild(this.nodeLayer);

    // Altezza dell'area albero proporzionale al numero di livelli.
    this.levelHeight = 64;
    this.tree.style.height = `${this.maxLevel * this.levelHeight + 24}px`;

    this.feedback = document.createElement('div');
    this.feedback.className = 'expr-feedback';

    // Il feedback sta SOPRA l'espressione: così i messaggi ("Non ancora…",
    // "Risolto!") non vengono attraversati dalle linee oblique dell'albero.
    this.appendChild(this.feedback);
    this.appendChild(this.tokensRow);
    this.appendChild(this.tree);

    // Renderizza i token in-order. Le foglie sono span ancora; gli operatori
    // sono span cliccabili. Memorizziamo il riferimento DOM su ogni nodo.
    this.renderTokens(this.ast);

    // Area opzionale dello svolgimento classico (show-steps), sotto l'albero.
    if (this.showSteps) this.buildSteps();

    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      // Dopo il typeset i token cambiano larghezza: le linee vanno ridisegnate.
      MathJax.typesetPromise([this.tokensRow]).then(() => this.layout()).catch(() => {});
    }
  }

  // -- Svolgimento classico (show-steps) ------------------------------------

  /** Crea l'area dello svolgimento con la prima riga = espressione di partenza. */
  buildSteps() {
    this.stepsWrap = document.createElement('div');
    this.stepsWrap.className = 'expr-steps';
    this.appendChild(this.stepsWrap);

    // Le righe sono indicizzate per livello: stepsLines[0] = espressione di
    // partenza, stepsLines[L] = stato dopo aver risolto tutti i nodi fino al
    // livello L. stepsMaxLevel è la riga più profonda creata finora.
    this.stepsMaxLevel = 0;
    const first = this.makeStepLine(false);
    first.querySelector('.expr-step-math').innerHTML = `\\(${this.renderState(this.ast, null, 0)}\\)`;
    this.stepsLines = [first];

    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      MathJax.typesetPromise([this.stepsWrap]).catch(() => {});
    }
  }

  /** Una riga dello svolgimento: prefisso "=" opzionale + corpo MathJax. */
  makeStepLine(withEquals) {
    const line = document.createElement('div');
    line.className = 'expr-step-line';
    const eq = document.createElement('span');
    eq.className = 'expr-step-eq';
    eq.textContent = withEquals ? '=' : '';
    const math = document.createElement('span');
    math.className = 'expr-step-math';
    line.appendChild(eq);
    line.appendChild(math);
    this.stepsWrap.appendChild(line);
    return line;
  }

  /**
   * Aggiorna lo svolgimento dopo aver risolto `node` (livello `k`). Ogni riga di
   * livello L rappresenta lo stato con tutti i nodi fino a L risolti, quindi il
   * nodo appena sciolto compare in TUTTE le righe con L ≥ k: vanno aggiornate
   * tutte (così la riga di 1° livello mostra tutte le operazioni di 1° livello,
   * anche se sciolte dopo essere scesi più in basso). Il lampeggio resta solo
   * sulla riga del livello proprio del nodo.
   */
  pushStep(node) {
    if (!this.showSteps) return;
    const k = node.level;
    if (k > this.stepsMaxLevel) {
      // Apri la riga del nuovo livello (le righe nascono in ordine: per sciogliere
      // un nodo di livello k serve già un figlio di livello k-1 risolto).
      this.stepsLines[k] = this.makeStepLine(true);
      this.stepsMaxLevel = k;
    }
    const toTypeset = [];
    for (let L = k; L <= this.stepsMaxLevel; L++) {
      const line = this.stepsLines[L];
      const flash = L === k ? node : null;
      line.querySelector('.expr-step-math').innerHTML = `\\(${this.renderState(this.ast, flash, L)}\\)`;
      toTypeset.push(line);
    }
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      MathJax.typesetPromise(toTypeset).catch(() => {});
    }
  }

  /**
   * LaTeX dell'espressione nello stato corrente (nodi risolti → valore, nodi
   * aperti → operandi + operatore). Se `flashNode` è dato, il suo valore è
   * avvolto in \class{expr-step-flash}{…} per l'evidenziazione one-shot.
   */
  renderState(node, flashNode, cutoff) {
    // Un nodo si mostra come valore se è una foglia o un operatore risolto; con
    // `cutoff` (restore) solo se il suo livello non supera quello richiesto.
    const shown = node.type === 'num'
      || (node.resolved && (cutoff === undefined || node.level <= cutoff));
    if (shown) {
      const tex = this.operandLatex(node.value);
      return node === flashNode ? `\\class{expr-step-flash}{${tex}}` : tex;
    }
    // Potenza: esponente sempre in apice tra braces (numerico → toLatex come in
    // renderTokens; espressione → reso ricorsivamente).
    let body;
    if (node.op === '^') {
      const exp = node.right.type === 'num'
        ? node.right.value.toLatex()
        : this.renderState(node.right, flashNode, cutoff);
      body = `${this.renderState(node.left, flashNode, cutoff)}^{${exp}}`;
    } else {
      body = `${this.renderState(node.left, flashNode, cutoff)} ${OP_LATEX[node.op]} ${this.renderState(node.right, flashNode, cutoff)}`;
    }
    const br = BRACKET_LATEX[node.bracket];
    return br ? `\\left${br[0]}${body}\\right${br[1]}` : body;
  }

  /**
   * Render in-order dei token. Le parentesi mostrate sono ESATTAMENTE quelle
   * scritte dall'autore nel sorgente — tonde ( ), quadre [ ] o graffe { } —
   * ricordate su node.bracket dal parser: nessuna parentesi automatica.
   */
  renderTokens(node) {
    if (node.type === 'num') {
      // I numeri negativi vanno tra parentesi (coerente col box di inserimento):
      // "-2^3" e "(-2)^3" non sono la stessa cosa con esponente pari.
      const span = this.spanFor(this.operandLatex(node.value));
      span.classList.add('expr-operand');
      node.tokenEl = span;
      this.tokensRow.appendChild(span);
      return;
    }

    // Parentesi del sorgente attorno a questo nodo (se c'erano).
    const openGlyph = node.bracket && OPEN[node.bracket] ? node.bracket : null;
    const closeGlyph = openGlyph ? OPEN[node.bracket] : null;
    if (openGlyph) this.tokensRow.appendChild(this.plain(openGlyph));

    // Potenza con esponente NUMERICO (letterale): resa "a esponente" (in apice)
    // invece che con l'operatore `^`. L'apice stesso è il bersaglio cliccabile
    // della potenza (clicchi l'esponente per scioglierla).
    //
    // Se invece l'esponente è un'ESPRESSIONE (es. `^(3-2)`) si ricade di
    // proposito sul ramo generico qui sotto: l'operatore `^` resta un cursore
    // cliccabile e l'esponente è un nodo come gli altri. Lo studente lo scioglie
    // prima (3-2 → 1), poi la potenza diventa riducibile. È la scelta più fedele
    // al metodo ad albero (ogni operazione è un nodo uniforme) e non muta la
    // "traccia" in alto. Il box di inserimento mostra comunque l'apice una volta
    // che gli operandi sono numeri (vedi showInputFor: caso `node.op === '^'`).
    if (node.op === '^' && node.right.type === 'num') {
      this.renderTokens(node.left); // la base mostra le proprie parentesi, se le ha
      const expSpan = this.spanFor(node.right.value.toLatex());
      expSpan.classList.add('expr-exp', 'expr-op');
      expSpan.dataset.nodeId = String(node.id);
      expSpan.addEventListener('click', () => this.onOpClick(node));
      node.right.tokenEl = expSpan;
      node.opEl = expSpan;
      this.tokensRow.appendChild(expSpan);
      if (closeGlyph) this.tokensRow.appendChild(this.plain(closeGlyph));
      return;
    }

    this.renderTokens(node.left);
    const opSpan = document.createElement('span');
    opSpan.className = 'expr-op';
    opSpan.dataset.nodeId = String(node.id);
    // Operatore reso come testo semplice (non MathJax): hover/click coerenti e
    // niente ambiguità di `^` (apice) dentro \(...\). Le frazioni operando sono
    // comunque renderizzate da MathJax negli span .expr-token.
    opSpan.textContent = OP_GLYPH[node.op];
    opSpan.addEventListener('click', () => this.onOpClick(node));
    node.opEl = opSpan;
    this.tokensRow.appendChild(opSpan);
    this.renderTokens(node.right);
    if (closeGlyph) this.tokensRow.appendChild(this.plain(closeGlyph));
  }

  spanFor(latex) {
    const span = document.createElement('span');
    span.className = 'expr-token';
    span.innerHTML = `\\(${latex}\\)`;
    return span;
  }

  plain(text) {
    const span = document.createElement('span');
    span.className = 'expr-paren';
    span.textContent = text;
    return span;
  }

  // -- Interazione ----------------------------------------------------------

  onOpClick(node) {
    if (this.savedDone) return;
    if (node.resolved) return;
    if (this.hasResolvedAncestor(node)) return; // termine già usato da un antenato
    if (this.activeNode) return; // un'operazione alla volta finché non si risolve

    if (!this.isReducible(node)) {
      this.flashWithUndo(this.blockedMessage(node));
      if (node.opEl) {
        node.opEl.classList.add('shake');
        setTimeout(() => node.opEl && node.opEl.classList.remove('shake'), 500);
      }
      return;
    }

    this.activeNode = node;
    if (node.opEl) node.opEl.classList.add('selected');
    this.showInputFor(node);
  }

  /**
   * Click sull'etichetta-valore di un nodo risolto a una POTENZA: come per le
   * letterali, la si può valutare (R7) o riscrivere (R6). Senza questo, un
   * percorso tipo `2 · 2^3 + 3^2` → `2^4 + 3^2` sarebbe un vicolo cieco: il
   * `+` non ha proprietà e la potenza non avrebbe più un esponente cliccabile.
   */
  onValueClick(node) {
    if (this.savedDone) return;
    if (this.activeNode) return;
    if (!(node.value instanceof Power)) return;
    if (this.ast.resolved) return;
    if (this.hasResolvedAncestor(node)) return;
    this.activeNode = node;
    this.showInputFor(node);
  }

  /** Aggiorna l'affordance di click dei bersagli "spesi": una potenza-letterale
   *  (o un'etichetta-potenza) sotto un antenato risolto non serve più. La
   *  guardia logica è in onOpClick/onValueClick; qui si allinea il cursore. */
  refreshSpentState() {
    for (const node of this.opNodes) {
      const spent = this.hasResolvedAncestor(node);
      if (node.opEl && this.isPowLiteral(node)) node.opEl.classList.toggle('expr-spent', spent);
      if (node.valueEl && node.valueEl.classList.contains('expr-value-clickable')) {
        node.valueEl.classList.toggle('expr-spent', spent);
      }
    }
  }

  /** Messaggio quando si clicca un'operazione non (ancora) riducibile. */
  blockedMessage(node) {
    if (this.powersMode) {
      const a = this.valueOf(node.left);
      const b = this.valueOf(node.right);
      const powA = a instanceof Power, powB = b instanceof Power;
      // Basi diverse ma riconducibili (9^3 : 3^5): suggerisci il cambio di base.
      if (powA && powB && (node.op === '*' || node.op === ':')
          && a.base.isInteger() && b.base.isInteger() && !a.base.equals(b.base)
          && (integerLog(a.base.num, b.base.num) || integerLog(b.base.num, a.base.num))) {
        return 'Le basi sono diverse… ma una si può riscrivere con la base dell\'altra: clicca il suo esponente.';
      }
      if (a != null && b != null && (powA || powB)) {
        return this.noEval
          ? 'Nessuna proprietà delle potenze si applica qui.'
          : 'Nessuna proprietà delle potenze si applica qui: puoi calcolare le potenze (clicca l\'esponente o il valore).';
      }
    }
    return 'Non ancora: prima risolvi le operazioni interne (parentesi e precedenza).';
  }

  /** LaTeX di un operando nel prompt: i negativi vanno tra parentesi
   *  (es. 5/2 · (-22/15)) per non confondere il segno con l'operatore;
   *  le potenze simboliche usano il proprio rendering (parentesi già gestite). */
  operandLatex(value) {
    if (value instanceof Power) return value.toLatex();
    const tex = value.toLatex();
    return value.num < 0 ? `\\left(${tex}\\right)` : tex;
  }

  /** Mostra un campo per inserire il risultato dell'operazione `node`. */
  showInputFor(node) {
    const wrap = document.createElement('div');
    wrap.className = 'expr-input-wrap';
    // Caso "potenza stessa": potenza-letterale (non sciolta) o nodo già
    // risolto a una potenza (rivalutazione via onValueClick). Il prompt è la
    // potenza, le regole sono R7 (valuta) e R6 (cambio di base).
    const isLiteral = this.isPowLiteral(node);
    const isRevalue = node.resolved && node.value instanceof Power;
    const isSelf = isLiteral || isRevalue;
    const selfPow = isSelf ? this.valueOf(node) : null;
    const aVal = isSelf ? null : this.valueOf(node.left);
    const bVal = isSelf ? null : this.valueOf(node.right);
    // Prompt: per la potenza l'esponente è in apice (MathJax), per gli altri
    // operatori operandi in MathJax con operatore e "=" come testo (evita che
    // un eventuale `^` finisca dentro \(...\) come apice indesiderato).
    // Una base che è essa stessa una potenza (caso R3) va tra parentesi.
    let prompt;
    if (isSelf) {
      prompt = `<span class="expr-token">\\(${selfPow.toLatex()} =\\)</span>`;
    } else if (node.op === '^') {
      const baseTex = aVal instanceof Power
        ? `\\left(${aVal.toLatex()}\\right)`
        : this.operandLatex(aVal);
      prompt = `<span class="expr-token">\\(${baseTex}^{${bVal.toLatex()}} =\\)</span>`;
    } else {
      prompt = `<span class="expr-token">\\(${this.operandLatex(aVal)}\\)</span>
         <span class="expr-op-inline">${OP_GLYPH[node.op]}</span>
         <span class="expr-token">\\(${this.operandLatex(bVal)}\\)</span>
         <span class="expr-op-inline">=</span>`;
    }
    const ariaLabel = isSelf
      ? `Risultato di ${selfPow.toString()}`
      : `Risultato di ${aVal.toString()} ${OP_GLYPH[node.op]} ${bVal.toString()}`;
    wrap.innerHTML = `
      <span class="expr-input-prompt">${prompt}</span>
      <input type="text" class="expr-input" inputmode="text" placeholder="?" aria-label="${ariaLabel}">
      <button type="button" class="expr-confirm">OK</button>
      <button type="button" class="expr-cancel" aria-label="Annulla" title="Annulla">✕</button>
      <span class="expr-input-feedback"></span>
    `;
    this.nodeLayer.appendChild(wrap);

    // Posiziona il campo alla x/level del nodo.
    this.positionEl(wrap, node, true);

    const input = wrap.querySelector('input');
    const btn = wrap.querySelector('.expr-confirm');
    const fb = wrap.querySelector('.expr-input-feedback');
    node.inputWrap = wrap;

    // Insieme dei risultati validi (la validazione è appartenenza). Per una
    // potenza "stessa": il valore calcolato (R7, se resta nei double esatti);
    // il cambio di base (R6) non è enumerabile e si valida come predicato.
    let expectedSet;
    if (isSelf) {
      expectedSet = [];
      const evaluated = this.noEval ? null : safeEvaluate(selfPow);
      if (evaluated) expectedSet.push({ rule: 'R7', value: evaluated });
    } else {
      expectedSet = applicableResults(node.op, aVal, bVal, this.powersMode);
    }

    const submit = () => {
      const val = parseValue(input.value);
      if (!val) {
        fb.textContent = '✗';
        fb.className = 'expr-input-feedback error';
        return;
      }
      let hit = expectedSet.find((r) => r.value.equals(val));
      if (!hit && isSelf && val instanceof Power && isEquivalentPower(val, selfPow)) {
        hit = { rule: 'R6', value: val };
      }
      if (hit) {
        if (isRevalue) this.updateResolvedValue(node, hit.value, wrap);
        else this.resolveNode(node, hit.value, wrap);
        // Valutazione accettata ma c'era una proprietà a disposizione:
        // suggerisci la via comoda (con l'annullo). Non blocca nulla.
        if (hit.rule === 'R7' && !this.ast.resolved) {
          this.hintPropertyAfterEval(node, selfPow);
        }
        return;
      }
      // Nudge: valore numerico esatto di una proprietà → si chiede comunque
      // la forma di potenza (il percorso "calcola" esplicito è R7).
      if (val instanceof Rational
          && expectedSet.some((r) => r.value instanceof Power && val.equals(safeEvaluate(r.value)))) {
        this.flashWithUndo('Il valore è giusto! Ma qui applichiamo le proprietà: scrivi il risultato come potenza (base^esponente).');
      } else if (isSelf && this.noEval
          && val instanceof Rational && val.equals(safeEvaluate(selfPow))) {
        // no-eval: il valore calcolato è giusto ma la valutazione è vietata.
        this.flashWithUndo('Qui non si calcola: puoi solo riscrivere la potenza con un\'altra base.');
      }
      fb.textContent = '✗';
      fb.className = 'expr-input-feedback error';
      wrap.classList.add('shake');
      setTimeout(() => wrap.classList.remove('shake'), 500);
    };

    btn.addEventListener('click', submit);
    wrap.querySelector('.expr-cancel').addEventListener('click', () => this.cancelInput(node, wrap));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
      if (e.key === 'Escape') { e.preventDefault(); this.cancelInput(node, wrap); }
    });
    input.focus();

    // In modalità potenze il campo può cadere su una riga oltre l'altezza
    // corrente dell'albero (letterale a livello 0): layout() la estende.
    if (this.powersMode) this.layout();

    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      MathJax.typesetPromise([wrap]).catch(() => {});
    }
  }

  /** Chiude il prompt senza rispondere (tasto ✕ o Esc): l'operazione torna
   *  cliccabile. Utile soprattutto con no-eval, dove si può aprire una potenza
   *  senza avere in mente una riscrittura valida. */
  cancelInput(node, wrap) {
    wrap.remove();
    node.inputWrap = null;
    if (node.opEl) node.opEl.classList.remove('selected');
    this.activeNode = null;
    // Dopo un annullo, offri di tornare indietro: chi ha valutato una potenza
    // e si ritrova con numeri scomodi può riprendere la via delle proprietà.
    if (this.powersMode && this.history.length) {
      this.flashWithUndo('Se vuoi cambiare strada, puoi annullare l\'ultimo passaggio.');
    } else {
      this.clearFlash();
    }
    this.layout(); // l'altezza dell'albero può rientrare (input su letterale)
  }

  /** Conferma il risultato: collassa il nodo, disegna le linee e il valore. */
  resolveNode(node, value, inputWrap) {
    this.history.push({ type: 'resolve', node });
    node.value = value;
    node.resolved = true;
    if (inputWrap) inputWrap.remove();
    node.inputWrap = null;
    if (node.opEl) node.opEl.classList.remove('selected');
    this.activeNode = null;

    // Etichetta-valore del nodo nel layer. Se il valore è una potenza (e il
    // nodo non è la radice), resta cliccabile: valutala (R7) o riscrivila (R6).
    const label = document.createElement('span');
    label.className = 'expr-node-value';
    label.innerHTML = `\\(${value.toLatex()}\\)`;
    if (this.powersMode && value instanceof Power && node !== this.ast) {
      label.classList.add('expr-value-clickable');
      label.addEventListener('click', () => this.onValueClick(node));
    }
    this.nodeLayer.appendChild(label);
    node.valueEl = label;

    // In modalità potenze i livelli sono dinamici: una letterale sciolta
    // esplicitamente (R6/R7) smette di essere foglia e occupa una riga.
    if (this.powersMode) this.maxLevel = this.assignLevels(this.ast);
    this.layout(); // ridisegna linee + riposiziona valori
    if (this.powersMode) this.refreshSpentState();

    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      MathJax.typesetPromise([label]).catch(() => {});
    }

    // Svolgimento classico: aggiorna/aggiunge la riga corrispondente.
    this.pushStep(node);

    if (this.ast.resolved) {
      this.flash(`Risolto! Risultato: ${this.ast.value.toString()}`, true);
      this.markComplete();
    } else {
      this.clearFlash();
    }
  }

  /** Sostituisce il valore di un nodo GIÀ risolto (R7/R6 su etichetta-valore):
   *  nessun nuovo nodo, si aggiorna l'etichetta e il padre vede il nuovo valore. */
  updateResolvedValue(node, value, inputWrap) {
    this.history.push({ type: 'revalue', node, prev: node.value });
    node.value = value;
    if (inputWrap) inputWrap.remove();
    node.inputWrap = null;
    this.activeNode = null;
    if (node.valueEl) {
      node.valueEl.innerHTML = `\\(${value.toLatex()}\\)`;
      if (!(value instanceof Power)) node.valueEl.classList.remove('expr-value-clickable');
      if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
        MathJax.typesetPromise([node.valueEl]).catch(() => {});
      }
    }
    this.layout();
    this.clearFlash();
  }

  /** Risolve l'intero albero senza interazione (restore / stato salvato). */
  solveAll() {
    const resolveWithLabel = (node, value) => {
      node.value = value;
      node.resolved = true;
      const label = document.createElement('span');
      label.className = 'expr-node-value';
      label.innerHTML = `\\(${value.toLatex()}\\)`;
      this.nodeLayer.appendChild(label);
      node.valueEl = label;
    };

    let guard = 0;
    let progressed = true;
    while (!this.ast.resolved && progressed && guard++ < 1000) {
      progressed = false;
      for (const node of this.opNodes) {
        // Le potenze-letterali restano operandi (valore virtuale): si sciolgono
        // solo nello stall-breaker qui sotto, se indispensabile.
        if (node.resolved || this.isPowLiteral(node)) continue;
        const a = this.valueOf(node.left);
        const b = this.valueOf(node.right);
        if (a == null || b == null) continue;
        const results = applicableResults(node.op, a, b, this.powersMode);
        if (!results.length) continue;
        // Forma canonica del restore: la prima regola in tabella (R1 prima di R4).
        resolveWithLabel(node, results[0].value);
        progressed = true;
      }
      // Stallo (es. 9^3 : 3^5, o + - tra potenze). Due tentativi, nell'ordine:
      // 1) riscrittura canonica di una letterale alla base minima (può
      //    sbloccare una proprietà); 2) valutazione di una potenza — letterale
      //    o valore di un nodo già risolto (percorso R7 su etichetta). Si
      //    saltano i nodi sotto un antenato risolto: il valore non serve più.
      if (!progressed && !this.ast.resolved && this.powersMode) {
        for (const node of this.opNodes) {
          if (!this.isPowLiteral(node) || this.hasResolvedAncestor(node)) continue;
          const rb = canonicalRebase(this.valueOf(node));
          if (!rb) continue;
          resolveWithLabel(node, rb);
          progressed = true;
          break;
        }
        if (!progressed) {
          for (const node of this.opNodes) {
            if (this.hasResolvedAncestor(node)) continue;
            if (this.isPowLiteral(node)) {
              resolveWithLabel(node, this.valueOf(node).evaluate());
              progressed = true;
              break;
            }
            if (node.resolved && node.value instanceof Power && node !== this.ast) {
              node.value = node.value.evaluate();
              if (node.valueEl) node.valueEl.innerHTML = `\\(${node.value.toLatex()}\\)`;
              progressed = true;
              break;
            }
          }
        }
      }
    }
    if (this.powersMode) this.maxLevel = this.assignLevels(this.ast);
    this.layout();
    if (this.powersMode) this.refreshSpentState();
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      MathJax.typesetPromise([this.nodeLayer]).catch(() => {});
    }
    if (this.ast.resolved) {
      this.setAttribute('data-completed', 'true');
      this.flash(`Risultato: ${this.ast.value.toString()}`, true);
    }

    // Svolgimento classico (restore): tutte le righe già complete, senza flash.
    // La riga 0 (espressione di partenza) è già in this.stepsLines.
    if (this.showSteps && this.stepsWrap) {
      for (let lvl = 1; lvl <= this.maxLevel; lvl++) {
        const line = this.makeStepLine(true);
        line.querySelector('.expr-step-math').innerHTML = `\\(${this.renderState(this.ast, null, lvl)}\\)`;
        this.stepsLines[lvl] = line;
      }
      this.stepsMaxLevel = this.maxLevel;
      if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
        MathJax.typesetPromise([this.stepsWrap]).catch(() => {});
      }
    }
  }

  // -- Layout / disegno -----------------------------------------------------

  /** Centro orizzontale (relativo al componente) di un nodo risolto. */
  nodeX(node) {
    if (node.type === 'num' && node.tokenEl) {
      return this.centerX(node.tokenEl);
    }
    if (node.resolved && node._x != null) return node._x;
    // Nodo operatore: punto medio dei due figli.
    return (this.nodeX(node.left) + this.nodeX(node.right)) / 2;
  }

  centerX(el) {
    const a = this.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return r.left + r.width / 2 - a.left;
  }

  /** Y (px, relativa all'area albero) della riga di livello del nodo.
   *  Minimo riga 1: una potenza-letterale (livello 0) riceve l'input — e poi
   *  l'etichetta — sulla prima riga dell'albero. */
  levelY(node) {
    // I nodi operatore scendono: row crescente → più in basso.
    const lvl = Math.max(node.level, 1);
    return lvl * this.levelHeight - this.levelHeight + 28;
  }

  positionEl(el, node, isInput) {
    const x = this.nodeX(node);
    const y = this.levelY(node);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }

  layout() {
    if (!this.tree) return;
    // Altezza dell'area albero: dinamica (in modalità potenze i livelli possono
    // crescere quando una letterale viene sciolta); include la riga di un
    // eventuale campo input attivo su una letterale a livello 0.
    const rows = Math.max(this.maxLevel,
      this.activeNode ? Math.max(this.activeNode.level, 1) : 0);
    this.tree.style.height = `${rows * this.levelHeight + 24}px`;
    const a = this.getBoundingClientRect();
    const treeRect = this.tree.getBoundingClientRect();
    const w = a.width;
    const h = this.tree.clientHeight;
    this.svg.setAttribute('width', String(w));
    this.svg.setAttribute('height', String(h));
    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);

    // Offset verticale tra la riga token (sopra l'area albero) e l'area albero.
    const tokensBottom = this.tokensRow.getBoundingClientRect().bottom - treeRect.top;

    // Linee di livello orizzontali (una per livello occupato da operatori).
    for (let lvl = 1; lvl <= rows; lvl++) {
      const y = lvl * this.levelHeight - this.levelHeight + 28;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('x2', String(w));
      line.setAttribute('y1', String(y));
      line.setAttribute('y2', String(y));
      line.setAttribute('class', 'expr-level-line');
      this.svg.appendChild(line);
    }

    // Cache delle x dei nodi risolti (per i nodi padre).
    const computeX = (node) => {
      if (node.type === 'num') { node._x = this.centerX(node.tokenEl); return node._x; }
      const lx = computeX(node.left);
      const rx = computeX(node.right);
      node._x = node.resolved ? (lx + rx) / 2 : (lx + rx) / 2;
      return node._x;
    };
    computeX(this.ast);

    // Per ogni nodo risolto, disegna le due linee oblique dai figli al nodo.
    // Livello 0 = foglia numerica O potenza-letterale non sciolta: la linea
    // parte dalla riga token (il nodo può risolversi prima dei propri figli).
    const childY = (child) => child.level === 0
      ? tokensBottom
      : child.level * this.levelHeight - this.levelHeight + 28; // dalla sua riga

    for (const node of this.opNodes) {
      if (!node.resolved) continue;
      const ny = node.level * this.levelHeight - this.levelHeight + 28;
      const nx = node._x;
      for (const child of [node.left, node.right]) {
        const cx = child._x;
        const cy = childY(child);
        const seg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        seg.setAttribute('x1', String(cx));
        seg.setAttribute('y1', String(cy));
        seg.setAttribute('x2', String(nx));
        seg.setAttribute('y2', String(ny));
        seg.setAttribute('class', 'expr-edge');
        this.svg.appendChild(seg);
      }
      // Punto-nodo
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', String(nx));
      dot.setAttribute('cy', String(ny));
      dot.setAttribute('r', '3.5');
      dot.setAttribute('class', 'expr-node-dot');
      this.svg.appendChild(dot);

      // Posiziona l'etichetta-valore appena sotto il nodo.
      if (node.valueEl) {
        node.valueEl.style.left = `${nx}px`;
        node.valueEl.style.top = `${ny + 6}px`;
      }
    }

    // Riposiziona l'eventuale campo input attivo.
    if (this.activeNode && this.activeNode.inputWrap) {
      this.positionEl(this.activeNode.inputWrap, this.activeNode, true);
    }
  }

  // -- Feedback / goal ------------------------------------------------------

  flash(msg, success = false) {
    this.feedback.textContent = msg;
    this.feedback.className = `expr-feedback ${success ? 'success' : 'info'}`;
  }

  clearFlash() {
    this.feedback.textContent = '';
    this.feedback.className = 'expr-feedback';
  }

  /** Dopo una valutazione accettata (R7): se sull'operazione sovrastante era
   *  disponibile una proprietà delle potenze — direttamente o previo cambio
   *  di base — suggerisci la via comoda, con il bottone di annullo. Il
   *  percorso numerico resta comunque valido: è solo un invito. */
  hintPropertyAfterEval(node, selfPow) {
    const parent = node.parentOp;
    if (!parent || parent.resolved) return;
    const sibling = parent.left === node ? parent.right : parent.left;
    const sibVal = this.valueOf(sibling);
    if (sibVal == null) return;
    const [a, b] = parent.left === node ? [selfPow, sibVal] : [sibVal, selfPow];
    let property = applicableResults(parent.op, a, b, true).length > 0;
    // ...oppure proprietà raggiungibile riscrivendo una base (es. 9^3 : 3^5).
    if (!property && sibVal instanceof Power && (parent.op === '*' || parent.op === ':')
        && selfPow.base.isInteger() && sibVal.base.isInteger()
        && !selfPow.base.equals(sibVal.base)
        && (integerLog(selfPow.base.num, sibVal.base.num) || integerLog(sibVal.base.num, selfPow.base.num))) {
      property = true;
    }
    if (property) {
      this.flashWithUndo('Vero! Però qui puoi usare una proprietà delle potenze ed evitare i numeri grandi: se preferisci, annulla l\'ultimo passaggio.');
    }
  }

  /** Messaggio informativo + bottone "annulla l'ultimo passaggio" (modalità
   *  potenze, se c'è uno storico): lo studente che ha imboccato la strada
   *  scomoda (es. potenze valutate in numeri enormi) può tornare indietro. */
  flashWithUndo(msg) {
    this.flash(msg);
    if (!this.powersMode || this.history.length === 0) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'expr-undo';
    btn.textContent = '↩ annulla l\'ultimo passaggio';
    btn.addEventListener('click', () => this.undoLast());
    this.feedback.appendChild(btn);
  }

  /** Annulla l'ultimo passaggio dello studente. LIFO: un nodo padre risolto
   *  dopo un figlio viene annullato prima, quindi l'albero resta coerente. */
  undoLast() {
    const act = this.history.pop();
    if (!act) return;
    // Un prompt aperto può riferirsi a operandi che stanno per cambiare.
    if (this.activeNode && this.activeNode.inputWrap) {
      this.cancelInput(this.activeNode, this.activeNode.inputWrap);
    }
    const node = act.node;
    if (act.type === 'revalue') {
      // Ripristina il valore precedente (sempre una Power: la rivalutazione
      // parte solo da etichette-potenza).
      node.value = act.prev;
      if (node.valueEl) {
        node.valueEl.innerHTML = `\\(${act.prev.toLatex()}\\)`;
        node.valueEl.classList.add('expr-value-clickable');
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
          MathJax.typesetPromise([node.valueEl]).catch(() => {});
        }
      }
    } else {
      node.resolved = false;
      node.value = null;
      if (node.valueEl) { node.valueEl.remove(); node.valueEl = null; }
    }
    if (this.powersMode) this.maxLevel = this.assignLevels(this.ast);
    this.layout();
    if (this.powersMode) this.refreshSpentState();
    if (this.history.length) {
      this.flashWithUndo('Passaggio annullato.');
    } else {
      this.flash('Passaggio annullato.');
    }
  }

  markComplete() {
    if (this.hasAttribute('data-completed')) return;
    this.setAttribute('data-completed', 'true');
    this.dispatchEvent(new CustomEvent('goal-complete', {
      bubbles: true,
      composed: true,
      detail: { goalId: this.id, value: this.ast.value.toString() }
    }));
  }
}

customElements.define('x-expr', XExpr);
