/**
 * I file di `static/lib/` devono valere in DUE ambienti: moduli CommonJS per
 * questi test, e script classici caricati con <script src> nella pagina. Il
 * secondo è quello che conta davvero per gli studenti, ed è anche quello che
 * nessun test toccherebbe — un errore nello shim finale (o un file caricato
 * nell'ordine sbagliato in `templates/_assets.html`) si vedrebbe solo aprendo
 * il browser.
 *
 * Qui la pagina si finge: un contesto con `window`, i file eseguiti nell'ordine
 * in cui li mette il template, e poi si controlla che `window.Algebra` sia
 * completo e funzionante.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const RADICE = path.join(__dirname, '..', '..');
const STATIC = path.join(RADICE, 'static');
const ASSETS = path.join(RADICE, 'templates', '_assets.html');

/**
 * Gli script che `_assets.html` mette nella pagina, NELL'ORDINE in cui li mette.
 * Si legge dal template invece di riscriverne la lista qui: una lista copiata
 * smette di dire il vero al primo file aggiunto, ed è proprio l'ordine la cosa
 * che questi test devono sorvegliare.
 */
function scriptDelTemplate() {
  const html = fs.readFileSync(ASSETS, 'utf8');
  const macro = html.slice(html.indexOf('macro component_scripts()'));
  const fine = macro.indexOf('endmacro');
  return [...macro.slice(0, fine).matchAll(/filename='([^']+)'/g)].map((m) => m[1]);
}

/**
 * Esegue i file dati, in ordine, in un contesto che ha `window` e non `module`.
 * I percorsi sono relativi a `static/`. Il contesto ha anche il minimo di DOM
 * che serve a un web component per REGISTRARSI (non per funzionare): senza,
 * `class X extends HTMLElement` non arriverebbe nemmeno a valutarsi.
 */
function comeNelBrowser(...file) {
  const window = {};
  const customElements = {
    _registro: new Map(),
    define(nome, classe) { this._registro.set(nome, classe); },
    get(nome) { return this._registro.get(nome); },
  };
  const contesto = vm.createContext({ window, customElements, HTMLElement: class {} });
  for (const nome of file) {
    const codice = fs.readFileSync(path.join(STATIC, nome), 'utf8');
    vm.runInContext(codice, contesto, { filename: nome });
  }
  return { ...window, customElements };
}

/** Scorciatoia: i file di `static/lib/` si nominano senza il prefisso. */
const lib = (...nomi) => comeNelBrowser(...nomi.map((n) => 'lib/' + n));

test('rational.js da solo popola window.Algebra', () => {
  const { Algebra } = lib('rational.js');
  assert.strictEqual(typeof Algebra.Rational, 'function');
  assert.strictEqual(typeof Algebra.gcd, 'function');
  assert.strictEqual(new Algebra.Rational(4, 8).toString(), '1/2');
});

test('algebra-parser.js ESTENDE il namespace invece di sostituirlo', () => {
  const { Algebra } = lib('rational.js', 'algebra-parser.js');
  // il nucleo aritmetico è ancora lì...
  assert.strictEqual(typeof Algebra.Rational, 'function');
  // ...e il parser si è aggiunto
  assert.strictEqual(typeof Algebra.parse, 'function');
  assert.strictEqual(Algebra.scrivi(Algebra.parse('2x+3=8')), '2x + 3 = 8');
});

test('la forma canonica si aggiunge a sua volta, e tutto convive', () => {
  const { Algebra } = lib(
    'rational.js', 'algebra-parser.js', 'algebra-canonica.js', 'algebra-forme.js',
    'algebra-mosse.js', 'algebra-rendering.js');
  for (const nome of ['Rational', 'parse', 'scrivi', 'Poly', 'canonicalizza', 'equivalenti',
    'valuta', 'monomioNormale', 'polinomioRidotto', 'traguardo',
    'applicaMossa', 'mosseDisponibili', 'validaWhitelist', 'rendiHTML']) {
    assert.strictEqual(typeof Algebra[nome], 'function', 'manca ' + nome);
  }
  assert.ok(Algebra.equivalenti(Algebra.parse('(2x + 3)^2'), Algebra.parse('4x^2 + 12x + 9')));
});

test('caricati senza il nucleo, si rompono subito e non a metà lezione', () => {
  assert.throws(() => lib('algebra-parser.js'), /rational\.js va caricato prima/);
  assert.throws(() => lib('algebra-canonica.js'), /rational\.js va caricato prima/);
  assert.throws(() => lib('algebra-forme.js'), /algebra-canonica\.js va caricato prima/);
  assert.throws(() => lib('algebra-mosse.js'), /algebra-forme\.js va caricato prima/);
});

/**
 * Il test che mancava, e da cui è passata una collisione vera: fino a qui si
 * caricava solo `static/lib/`, mai un componente che lo usa. Ma il namespace
 * non serve a sé stesso — serve a `expr.js`, che sta nella stessa pagina e
 * nello stesso scope lessicale globale. Un `const` fuori dalla IIFE in un file
 * di libreria fa fallire il PARSING del componente: `x-expr` non si registra e
 * la scheda resta muta, senza un errore che si veda in una lezione.
 */
test('con expr.js caricato dopo, il componente si registra davvero', () => {
  const ordine = scriptDelTemplate();
  const daEseguire = ordine.filter((f) => f.startsWith('lib/') || f === 'components/expr.js');

  // La lista arriva dal template, quindi il test si accorge anche del caso in
  // cui expr.js finisse PRIMA del nucleo che dichiara di volere.
  assert.ok(daEseguire.includes('lib/rational.js'), '_assets.html non carica più lib/rational.js');
  assert.strictEqual(daEseguire[daEseguire.length - 1], 'components/expr.js',
    'expr.js deve venire dopo tutto static/lib/');

  const { customElements, Algebra } = comeNelBrowser(...daEseguire);
  assert.strictEqual(typeof customElements.get('x-expr'), 'function', 'x-expr non si è registrato');
  assert.strictEqual(typeof Algebra.Rational, 'function');
});

/**
 * `toLatex()` finisce dentro `\(...\)` per MathJax: la barra rovescia va
 * raddoppiata nel template literal. Scritta singola, `\f` è un form feed e
 * ogni frazione arriva a schermo come `rac{1}{2}` — sbagliata in modo
 * silenzioso, che è il modo peggiore.
 */
test('toLatex produce una barra rovescia vera, non un carattere di controllo', () => {
  const { Algebra } = lib('rational.js');
  const tex = new Algebra.Rational(1, 2).toLatex();
  assert.strictEqual(tex, '\\frac{1}{2}');
  assert.strictEqual(tex.charCodeAt(0), 92, 'deve iniziare con una barra rovescia');
  assert.ok(!tex.includes('\f'), 'contiene un form feed: la barra non è raddoppiata');
});

/**
 * Stessa rete per `<x-algebra>`: è il componente che usa TUTTO il nucleo
 * (parser, forme, mosse, rendering) e sta in fondo alla catena. Se un file di
 * `static/lib/` finisse dopo di lui in `_assets.html`, o se una libreria
 * lasciasse un `const` fuori dalla sua IIFE, la lavagna resterebbe muta in
 * lezione senza un errore che si veda.
 */
test('anche x-algebra si registra, caricato come lo carica la pagina', () => {
  const ordine = scriptDelTemplate();
  const daEseguire = ordine.filter((f) => f.startsWith('lib/') || f === 'components/algebra.js');

  assert.strictEqual(daEseguire[daEseguire.length - 1], 'components/algebra.js',
    'algebra.js deve venire dopo tutto static/lib/');

  const { customElements, Algebra } = comeNelBrowser(...daEseguire);
  assert.strictEqual(typeof customElements.get('x-algebra'), 'function',
    'x-algebra non si è registrato');
  // Le funzioni che il componente chiama per nome: se una sparisse dal
  // namespace, il componente si romperebbe solo al primo click.
  for (const nome of ['parse', 'scrivi', 'rendiHTML', 'terminiDi', 'parteLetterale',
    'trovaNodo', 'percorsoDi', 'nodoAlPercorso', 'postoDelTermine',
    'applicaMossa', 'mosseDisponibili', 'traguardo']) {
    assert.strictEqual(typeof Algebra[nome], 'function', 'manca ' + nome);
  }
});
