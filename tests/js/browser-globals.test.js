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

const LIB = path.join(__dirname, '..', '..', 'static', 'lib');

/** Esegue i file dati, in ordine, in un contesto che ha `window` e non `module`. */
function comeNelBrowser(...file) {
  const window = {};
  const contesto = vm.createContext({ window });
  for (const nome of file) {
    const codice = fs.readFileSync(path.join(LIB, nome), 'utf8');
    vm.runInContext(codice, contesto, { filename: nome });
  }
  return window;
}

test('rational.js da solo popola window.Algebra', () => {
  const { Algebra } = comeNelBrowser('rational.js');
  assert.strictEqual(typeof Algebra.Rational, 'function');
  assert.strictEqual(typeof Algebra.gcd, 'function');
  assert.strictEqual(new Algebra.Rational(4, 8).toString(), '1/2');
});

test('algebra-parser.js ESTENDE il namespace invece di sostituirlo', () => {
  const { Algebra } = comeNelBrowser('rational.js', 'algebra-parser.js');
  // il nucleo aritmetico è ancora lì...
  assert.strictEqual(typeof Algebra.Rational, 'function');
  // ...e il parser si è aggiunto
  assert.strictEqual(typeof Algebra.parse, 'function');
  assert.strictEqual(Algebra.scrivi(Algebra.parse('2x+3=8')), '2x + 3 = 8');
});

test('la forma canonica si aggiunge a sua volta, e tutto convive', () => {
  const { Algebra } = comeNelBrowser(
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
  assert.throws(() => comeNelBrowser('algebra-parser.js'), /rational\.js va caricato prima/);
  assert.throws(() => comeNelBrowser('algebra-canonica.js'), /rational\.js va caricato prima/);
  assert.throws(() => comeNelBrowser('algebra-forme.js'), /algebra-canonica\.js va caricato prima/);
  assert.throws(() => comeNelBrowser('algebra-mosse.js'), /algebra-forme\.js va caricato prima/);
});
