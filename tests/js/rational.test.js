/**
 * Aritmetica razionale esatta — `static/lib/rational.js`.
 *
 * Sono test di CARATTERIZZAZIONE: fissano il comportamento che `<x-expr>` ha
 * sempre avuto, prima che questo codice uscisse da `components/expr.js` per
 * diventare condiviso. Servono a due cose — che l'estrazione non abbia
 * cambiato nulla, e che il prossimo componente ci si possa appoggiare sapendo
 * cosa promette.
 */
const test = require('node:test');
const assert = require('node:assert');

const { Rational, gcd, MAX_EXPONENT } = require('../../static/lib/rational.js');

const r = (n, d) => new Rational(n, d);

test('gcd è sempre positivo e non torna mai 0', () => {
  assert.strictEqual(gcd(12, 18), 6);
  assert.strictEqual(gcd(-12, 18), 6);
  assert.strictEqual(gcd(7, 13), 1);
  // gcd(0, 0) = 1: serve a ridurre 0/den senza dividere per zero.
  assert.strictEqual(gcd(0, 0), 1);
  assert.strictEqual(gcd(0, 5), 5);
});

test('la frazione nasce già ridotta', () => {
  assert.deepStrictEqual([r(4, 8).num, r(4, 8).den], [1, 2]);
  assert.deepStrictEqual([r(0, 5).num, r(0, 5).den], [0, 1]);
  assert.deepStrictEqual([r(9, 3).num, r(9, 3).den], [3, 1]);
});

test('il segno sta sempre sul numeratore, il denominatore resta > 0', () => {
  assert.deepStrictEqual([r(1, -2).num, r(1, -2).den], [-1, 2]);
  assert.deepStrictEqual([r(-1, -2).num, r(-1, -2).den], [1, 2]);
});

test('denominatore zero: errore, non NaN', () => {
  assert.throws(() => r(1, 0), /Divisione per zero/);
});

test('somma e sottrazione', () => {
  assert.ok(r(1, 2).add(r(1, 3)).equals(r(5, 6)));
  assert.ok(r(1, 2).sub(r(1, 2)).equals(r(0, 1)));
  assert.ok(r(1, 3).sub(r(2, 3)).equals(r(-1, 3)));
});

test('prodotto e quoziente', () => {
  assert.ok(r(2, 3).mul(r(3, 4)).equals(r(1, 2)));
  assert.ok(r(2, 3).div(r(4, 9)).equals(r(3, 2)));
  assert.ok(r(-1, 2).mul(r(2, 1)).equals(r(-1, 1)));
});

test('divisione per zero: errore anche quando lo zero è una frazione', () => {
  assert.throws(() => r(1, 2).div(r(0, 7)), /Divisione per zero/);
});

test('potenza a esponente intero, anche negativo', () => {
  assert.ok(r(2, 3).pow(0).equals(r(1, 1)));
  assert.ok(r(2, 3).pow(3).equals(r(8, 27)));
  assert.ok(r(2, 3).pow(-2).equals(r(9, 4)));
  assert.ok(r(-2, 1).pow(3).equals(r(-8, 1)));
  assert.ok(r(-2, 1).pow(2).equals(r(4, 1)));
});

test('potenza: esponente non intero rifiutato', () => {
  assert.throws(() => r(4, 1).pow(0.5), /Esponente non intero/);
});

test('potenza: esponente oltre il limite rifiutato (input non fidato da URL)', () => {
  assert.throws(() => r(2, 1).pow(MAX_EXPONENT + 1), /Esponente troppo grande/);
  assert.throws(() => r(2, 1).pow(-(MAX_EXPONENT + 1)), /Esponente troppo grande/);
});

test('zero elevato a esponente negativo: errore, non Infinity', () => {
  assert.throws(() => r(0, 1).pow(-1), /Divisione per zero/);
});

test('equals confronta il valore, e rifiuta ciò che non è un Rational', () => {
  assert.ok(r(2, 4).equals(r(1, 2)));
  assert.ok(!r(1, 2).equals(r(1, 3)));
  assert.ok(!r(1, 2).equals(0.5));
  assert.ok(!r(1, 2).equals(null));
});

test('isInteger', () => {
  assert.ok(r(4, 2).isInteger());
  assert.ok(!r(1, 2).isInteger());
});

test('toLatex: il segno esce dalla frazione', () => {
  assert.strictEqual(r(3, 1).toLatex(), '3');
  assert.strictEqual(r(-3, 1).toLatex(), '-3');
  assert.strictEqual(r(1, 2).toLatex(), '\\frac{1}{2}');
  assert.strictEqual(r(-1, 2).toLatex(), '-\\frac{1}{2}');
});

test('toString: forma lineare a/b', () => {
  assert.strictEqual(r(3, 1).toString(), '3');
  assert.strictEqual(r(-1, 2).toString(), '-1/2');
});
