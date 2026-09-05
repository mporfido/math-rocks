const test = require('node:test');
const assert = require('node:assert/strict');
const A = require('../../static/lib/algebra-mosse.js');
const R = require('../../static/lib/algebra-rendering.js');

test('semplifica coefficienti e segni senza sviluppare le parentesi', () => {
  for (const [src, risultato] of [
    ['-1(3(x+2))', '-3(x+2)'], ['2(3(x-2))', '6(x-2)'],
    ['-1x', '-x'], ['-(-1x)', 'x'], ['a-(-b)', 'a+b'],
    ['2(3xy)', '6xy'], ['(2/3)(3/4)(x+2)', '1/2(x+2)'],
    ['1(x+2)', 'x+2'],
  ]) {
    const n = A.parse(src);
    const esito = A.applicaMossa(n, { mossa: 'semplifica', nodo: n.id, digitato: risultato });
    assert.ok(esito.ok, src + ': ' + esito.messaggio);
    assert.ok(A.equivalenti(n, esito.albero));
  }
  for (const digitato of ['-3x-6', '-1(3(x+2))', '3(x+2)']) {
    const n = A.parse('-1(3(x+2))');
    assert.equal(A.applicaMossa(n, { mossa: 'semplifica', nodo: n.id, digitato }).ok, false);
  }
  for (const src of ['2xy', '-3(x+2)', 'x-5']) {
    const n = A.parse(src);
    assert.equal(A.CATALOGO.semplifica.applicabile(n, n.id).ok, false, src);
  }
});

test('il termine riscritto sostituisce anche il segno esterno', () => {
  for (const [src, mossa, digitato, atteso] of [
    ['a-(-1x)', 'semplifica', '+x', 'a + x'],
    ['a-(2*3)', 'calcola', '-6', 'a - 6'],
    ['a-(2x+3x)', 'riduci-simili', '-5x', 'a - 5x'],
    // Uno sviluppo con il meno davanti è più di un termine, e i suoi termini
    // si agganciano alla somma che c'era: rimetterli come termine solo
    // scriverebbe `a + (-2x - 6)`, cioè la parentesi appena tolta.
    ['a-2(x+3)', 'espandi', '-2x-6', 'a - 2x - 6'],
  ]) {
    const n = A.parse(src);
    const esito = A.applicaMossa(n, {mossa, nodo: n.right.id, digitato, parametri: {conSegno: true}});
    assert.ok(esito.ok, src + ': ' + esito.messaggio);
    assert.equal(A.scrivi(esito.albero), atteso);
    assert.ok(A.equivalenti(n, esito.albero));
  }
  const n = A.parse('x-5');
  assert.equal(A.scrivi(A.pezzoConSegno(n, n.right.id)), '-5');
});

test('la lavagna moltiplicata per meno uno si semplifica termine per termine', () => {
  let n = A.applicaMossa(A.parse('3(x+2)-4x=5-x'), {
    mossa: 'secondo-principio', parametri: {operazione:'moltiplica', valore:'-1'},
  }).albero;
  assert.match(R.rendiHTML(n).replace(/<[^>]*>/g, ''), /−\(−1x\)/);
  for (const [membro, lato, digitato] of [
    ['left', 'left', '-3(x+2)'], ['left', 'right', '4x'],
    ['right', 'left', '-5'], ['right', 'right', 'x'],
  ]) {
    const esito = A.applicaMossa(n, {mossa:'semplifica', nodo:n[membro][lato].id, digitato});
    assert.ok(esito.ok, esito.messaggio);
    n = esito.albero;
  }
  assert.equal(A.scrivi(n), '-3(x + 2) + 4x = -5 + x');
});

test('le parentesi proteggono i prodotti negativi anche nel campo di risposta', () => {
  const somma = A.parse('a-(-1x)');
  const n = A.pezzoConSegno(somma, somma.right.id);
  assert.equal(A.scrivi(n), '-(-1x)');
  assert.equal(R.rendiHTML(n).replace(/<[^>]*>/g, ''), '−(−1x)');
});

test('il menu propone una sola semplificazione, con precedenza alle mosse specifiche', () => {
  const famiglia = ['calcola', 'normalizza-monomio', 'semplifica'];
  const offerte = (n, id, whitelist) => A.mosseDisponibili(n, id, whitelist)
    .map((m) => m.id).filter((id) => famiglia.includes(id));
  for (const [src, atteso] of [
    ['-1*5', 'calcola'], ['2*3x', 'normalizza-monomio'],
    ['2x/3', 'normalizza-monomio'], ['-1(3(x+2))', 'semplifica'],
    ['a-(-b)', 'semplifica'],
  ]) {
    const n = A.parse(src);
    assert.deepEqual(offerte(n, n.id), [atteso], src);
  }
  const n = A.parse('a-(-1x)');
  assert.deepEqual(offerte(n, n.right.id), ['normalizza-monomio']);
  assert.deepEqual(offerte(n, n.right.id, ['semplifica']), ['semplifica']);
  const numerico = A.parse('-1*5');
  assert.deepEqual(offerte(numerico, numerico.id, ['semplifica']), ['semplifica']);
  assert.deepEqual(offerte(numerico, numerico.id, ['semplifica', 'normalizza-monomio']), ['normalizza-monomio']);
  assert.deepEqual(offerte(numerico, numerico.id, ['semplifica', 'normalizza-monomio', 'calcola']), ['calcola']);
  assert.deepEqual(offerte(numerico, numerico.id, []), []);

  const prodotto = A.parse('1(x+2)');
  const mosse = A.mosseDisponibili(prodotto, prodotto.id).map((m) => m.id);
  assert.ok(mosse.includes('semplifica'));
  assert.ok(mosse.includes('espandi'), 'lo sviluppo è una scelta diversa e deve restare');
});

test('il menu e il calcolo considerano entrambi il meno esterno', () => {
  const n = A.parse('a-(-5)');
  const mosse = A.mosseDisponibili(n, n.right.id).map((m) => m.id);
  assert.ok(mosse.includes('calcola'));
  assert.ok(!mosse.includes('semplifica'));
  const esito = A.applicaMossa(n, {
    mossa: 'calcola', nodo: n.right.id, parametri: {conSegno: true}, digitato: '5',
  });
  assert.ok(esito.ok, esito.messaggio);
  assert.equal(A.scrivi(esito.albero), 'a + 5');
  // Le mosse nascoste restano eseguibili per le sequenze già salvate.
  const precedente = A.applicaMossa(n, {mossa: 'semplifica', nodo: n.right.id, digitato: '5'});
  assert.ok(precedente.ok, precedente.messaggio);
});
