const test = require('node:test');
const assert = require('node:assert/strict');
const A = require('../../static/lib/algebra-mosse.js');

function svolgi(src, digitato) {
  const n = A.parse(src);
  return A.applicaMossa(n, {mossa: 'espandi', nodo: n.id, digitato});
}

test('la distributiva accetta sviluppi interni, parziali e completi', () => {
  for (const [src, digitato] of [
    ['-1(3(x+2))', '-1(3x+6)'],
    ['-1(3(x+2))', '-3x-6'],
    ['-1(3(x-2))', '-1(3x-6)'],
    ['-1(3(x-2))', '-3x+6'],
    ['2(3(4(x+1)))', '2(3(4x+4))'],
    ['2(3(4(x+1)))', '2(12x+12)'],
    ['(x+3)(x+3)', 'x(x+3)+3(x+3)'],
    ['(x+3)(x+3)', '3(x+3)+x(x+3)'],
    ['(x+3)^2', 'x(x+3)+3(x+3)'],
    ['(x+3)^3', 'x(x+3)^2+3(x+3)^2'],
    ['2(x+1)(x+2)', '2x(x+2)+2(x+2)'],
    ['(x+1)(x+2)(x+3)', 'x(x+2)(x+3)+(x+2)(x+3)'],
    ['a+2(x+1)+3(y+2)', 'a+2x+2+3(y+2)'],
    ['(2/3)(3(x+2))', '(2/3)(3x+6)'],
    ['(x-x)(x+2)', '0'],
  ]) {
    const esito = svolgi(src, digitato);
    assert.ok(esito.ok, src + ' → ' + digitato + ': ' + esito.messaggio);
    assert.ok(A.equivalenti(A.parse(src), esito.albero));
  }
});

test('equivalenza, coefficienti e termini aggiunti non bastano come distributiva', () => {
  for (const [src, digitato] of [
    ['-1(3(x+2))', '-3(x+2)'],
    ['-1(3(x+2))', '-6(1/2x+1)'],
    ['-1(3(x+2))', '-1(3(x+2))'],
    ['-1(3(x+2))', '0-1(3(x+2))'],
    ['-1(3(x+2))', '-1(3(x+2))+x-x'],
    ['(x+3)^2', '(x+3)(x+3)'],
    ['(x+1)(x+2)', '(x+1)(x+2)+0'],
  ]) {
    assert.ok(A.equivalenti(A.parse(src), A.parse(digitato)), 'il caso deve essere equivalente');
    assert.equal(svolgi(src, digitato).codice, 'non-svolto', src + ' → ' + digitato);
  }
  for (const digitato of ['-3x+6', '-1(3x-6)', '-1(3x+2)']) {
    assert.equal(svolgi('-1(3(x+2))', digitato).codice, 'non-equivalente');
  }
});

test('il menu mantiene semplificazione e distributiva come scelte diverse', () => {
  const n = A.parse('-1(3(x+2))');
  const ids = A.mosseDisponibili(n, n.id).map((m) => m.id);
  assert.ok(ids.includes('semplifica'));
  assert.ok(ids.includes('espandi'));
  assert.deepEqual(A.mosseDisponibili(n, n.id, ['semplifica']).map((m) => m.id), ['semplifica']);
  assert.deepEqual(A.mosseDisponibili(n, n.id, ['espandi']).map((m) => m.id), ['espandi']);
  assert.equal(A.applicaMossa(n, {mossa:'semplifica', nodo:n.id, digitato:'-3x-6'}).ok, false);
});

test('lo sviluppo annidato conserva il segno esterno del termine selezionato', () => {
  const n = A.parse('a-2(3(x+1))');
  for (const digitato of ['-2(3x+3)', '-6x-6']) {
    const esito = A.applicaMossa(n, {
      mossa: 'espandi', nodo: n.right.id, parametri: {conSegno:true}, digitato,
    });
    assert.ok(esito.ok, esito.messaggio);
    assert.ok(A.equivalenti(n, esito.albero));
  }
});
