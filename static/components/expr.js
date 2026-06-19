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

  equals(o) { return this.num === o.num && this.den === o.den; }

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

/** Parsa l'input dello studente ("4", "-5", "4/3") in un Rational, o null. */
function parseValue(str) {
  const s = String(str).trim().replace(/−/g, '-').replace(/\s+/g, '');
  if (s === '') return null;
  let m = s.match(/^(-?\d+)\/(-?\d+)$/);
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
    this.showSteps = this.dataset.showSteps === 'true';

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
    }
  }

  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
  }

  /** row del nodo = 0 per le foglie, 1 + max(figli) per gli operatori. */
  assignLevels(node) {
    if (node.type === 'num') { node.level = 0; return 0; }
    const l = this.assignLevels(node.left);
    const r = this.assignLevels(node.right);
    node.level = Math.max(l, r) + 1;
    return node.level;
  }

  collectOps(node) {
    if (node.type === 'op') {
      this.opNodes.push(node);
      this.collectOps(node.left);
      this.collectOps(node.right);
    }
  }

  /** Una foglia/nodo è "valore" se risolto (operando pronto). */
  isResolved(node) {
    return node.type === 'num' || node.resolved;
  }

  /** Un operatore è riducibile ORA se entrambi i figli sono già valori. */
  isReducible(node) {
    return node.type === 'op' && !node.resolved
      && this.isResolved(node.left) && this.isResolved(node.right);
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
      MathJax.typesetPromise([this.tokensRow]).catch(() => {});
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
    if (this.activeNode) return; // un'operazione alla volta finché non si risolve

    if (!this.isReducible(node)) {
      this.flash('Non ancora: prima risolvi le operazioni interne (parentesi e precedenza).');
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

  /** LaTeX di un operando nel prompt: i negativi vanno tra parentesi
   *  (es. 5/2 · (-22/15)) per non confondere il segno con l'operatore. */
  operandLatex(value) {
    const tex = value.toLatex();
    return value.num < 0 ? `\\left(${tex}\\right)` : tex;
  }

  /** Mostra un campo per inserire il risultato dell'operazione `node`. */
  showInputFor(node) {
    const wrap = document.createElement('div');
    wrap.className = 'expr-input-wrap';
    const a = node.left.value.toString();
    const b = node.right.value.toString();
    // Prompt: per la potenza l'esponente è in apice (MathJax), per gli altri
    // operatori operandi in MathJax con operatore e "=" come testo (evita che
    // un eventuale `^` finisca dentro \(...\) come apice indesiderato).
    const prompt = node.op === '^'
      ? `<span class="expr-token">\\(${this.operandLatex(node.left.value)}^{${node.right.value.toLatex()}} =\\)</span>`
      : `<span class="expr-token">\\(${this.operandLatex(node.left.value)}\\)</span>
         <span class="expr-op-inline">${OP_GLYPH[node.op]}</span>
         <span class="expr-token">\\(${this.operandLatex(node.right.value)}\\)</span>
         <span class="expr-op-inline">=</span>`;
    wrap.innerHTML = `
      <span class="expr-input-prompt">${prompt}</span>
      <input type="text" class="expr-input" inputmode="text" placeholder="?" aria-label="Risultato di ${a} ${OP_GLYPH[node.op]} ${b}">
      <button type="button" class="expr-confirm">OK</button>
      <span class="expr-input-feedback"></span>
    `;
    this.nodeLayer.appendChild(wrap);

    // Posiziona il campo alla x/level del nodo.
    this.positionEl(wrap, node, true);

    const input = wrap.querySelector('input');
    const btn = wrap.querySelector('.expr-confirm');
    const fb = wrap.querySelector('.expr-input-feedback');
    node.inputWrap = wrap;

    const expected = applyOp(node.op, node.left.value, node.right.value);

    const submit = () => {
      const val = parseValue(input.value);
      if (!val) {
        fb.textContent = '✗';
        fb.className = 'expr-input-feedback error';
        return;
      }
      if (val.equals(expected)) {
        this.resolveNode(node, expected, wrap);
      } else {
        fb.textContent = '✗';
        fb.className = 'expr-input-feedback error';
        wrap.classList.add('shake');
        setTimeout(() => wrap.classList.remove('shake'), 500);
      }
    };

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    input.focus();

    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      MathJax.typesetPromise([wrap]).catch(() => {});
    }
  }

  /** Conferma il risultato: collassa il nodo, disegna le linee e il valore. */
  resolveNode(node, value, inputWrap) {
    node.value = value;
    node.resolved = true;
    if (inputWrap) inputWrap.remove();
    node.inputWrap = null;
    if (node.opEl) node.opEl.classList.remove('selected');
    this.activeNode = null;

    // Etichetta-valore del nodo nel layer.
    const label = document.createElement('span');
    label.className = 'expr-node-value';
    label.innerHTML = `\\(${value.toLatex()}\\)`;
    this.nodeLayer.appendChild(label);
    node.valueEl = label;

    this.layout(); // ridisegna linee + riposiziona valori

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

  /** Risolve l'intero albero senza interazione (restore / stato salvato). */
  solveAll() {
    let guard = 0;
    let progressed = true;
    while (!this.ast.resolved && progressed && guard++ < 1000) {
      progressed = false;
      for (const node of this.opNodes) {
        if (this.isReducible(node)) {
          const value = applyOp(node.op, node.left.value, node.right.value);
          node.value = value;
          node.resolved = true;
          const label = document.createElement('span');
          label.className = 'expr-node-value';
          label.innerHTML = `\\(${value.toLatex()}\\)`;
          this.nodeLayer.appendChild(label);
          node.valueEl = label;
          progressed = true;
        }
      }
    }
    this.layout();
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

  /** Y (px, relativa all'area albero) della riga di livello del nodo. */
  levelY(node) {
    // I nodi operatore scendono: row crescente → più in basso.
    return node.level * this.levelHeight - this.levelHeight + 28;
  }

  positionEl(el, node, isInput) {
    const x = this.nodeX(node);
    const y = this.levelY(node);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }

  layout() {
    if (!this.tree) return;
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
    for (let lvl = 1; lvl <= this.maxLevel; lvl++) {
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
    const childY = (child) => {
      if (child.type === 'num') return tokensBottom;          // parte dal token
      return child.level * this.levelHeight - this.levelHeight + 28; // dalla sua riga
    };

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
