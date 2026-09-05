/**
 * Forma canonica ed equivalenza — `static/lib/algebra-canonica.js`.
 *
 * Questo è il giudice: decide se ciò che lo studente ha digitato può prendere
 * il posto di ciò che aveva selezionato. Un giudice che sbaglia non fa un
 * errore visibile — accetta in silenzio un passaggio falso, oppure rifiuta un
 * passaggio giusto e lascia lo studente convinto di non saper fare i conti.
 * Per questo l'ultima prova qui sotto non si fida della forma canonica e la
 * mette contro un oracolo indipendente: la valutazione numerica dell'albero.
 */
const test = require('node:test');
const assert = require('node:assert');

const {
  parse, Poly, canonicalizza, equivalenti, valuta, Rational,
} = require('../../static/lib/algebra-canonica.js');

const can = (src) => canonicalizza(parse(src));
const eq = (a, b) => equivalenti(parse(a), parse(b));

// --- Le due scritture che devono coincidere --------------------------------

test('la forma canonica dimentica ordine, parentesi e scrittura', () => {
  assert.ok(can('2x + 3x').uguale(can('5x')));
  assert.ok(can('x + y').uguale(can('y + x')));
  assert.ok(can('2(x + 3)').uguale(can('2x + 6')));
  assert.ok(can('2x + 0').uguale(can('2x')));
  assert.ok(can('6/4x').uguale(can('3/2x')));
});

test('e non confonde cose diverse', () => {
  assert.ok(!can('2x').uguale(can('2y')));
  assert.ok(!can('x^2').uguale(can('x')));
  assert.ok(!can('x + 1').uguale(can('x - 1')));
});

test('i prodotti notevoli, in espansione e in contrazione', () => {
  assert.ok(eq('(2x + 3)^2', '4x^2 + 12x + 9'));
  assert.ok(eq('(x - 5)^2', 'x^2 - 10x + 25'));
  assert.ok(eq('(x + 3)(x - 3)', 'x^2 - 9'));
  assert.ok(eq('(a + b)^3', 'a^3 + 3a^2b + 3ab^2 + b^3'));
  // la trappola: quasi un quadrato di binomio, ma non lo è
  assert.ok(!eq('4x^2 + 12x + 8', '(2x + 3)^2'));
});

test('più lettere, e il termine misto non si perde', () => {
  const p = can('(x + y)^2');
  assert.deepStrictEqual(p.variabili, ['x', 'y']);
  assert.ok(p.coefficiente({ x: 1, y: 1 }).equals(new Rational(2)));
  assert.ok(p.coefficiente({ x: 2 }).equals(new Rational(1)));
});

test('i coefficienti restano razionali esatti, mai decimali', () => {
  const p = can('x/3 + x/6');
  assert.strictEqual(p.coefficiente({ x: 1 }).toString(), '1/2');
});

// --- Le equazioni -----------------------------------------------------------

test('le equazioni si confrontano membro per membro', () => {
  assert.ok(eq('2x + 3 = 8', '3 + 2x = 8'));
  assert.ok(!eq('2x + 3 = 8', '2x = 5'));
});

test('"stessa equazione", NON "stesse soluzioni"', () => {
  // fra queste due c'è una mossa che lo studente deve ancora fare: se il
  // giudice le dichiarasse uguali, quella mossa sparirebbe
  assert.ok(!eq('2x = 4', 'x = 2'));
});

test('un equazione e un espressione non sono confrontabili', () => {
  assert.ok(!eq('2x = 4', '2x'));
});

// --- Il confine del dominio -------------------------------------------------

test('dividere per una lettera è fuori dal dominio, e lo dice', () => {
  assert.throws(() => can('6/x'), /contiene lettere/);
  assert.throws(() => can('(x + 1)/x'), /contiene lettere/);
});

test('esponente negativo su una lettera: fuori dal dominio', () => {
  assert.throws(() => can('x^-1'), /fuori dal dominio/);
  // sui numeri invece va benissimo: è solo una frazione
  assert.ok(can('2^-1').uguale(can('1/2')));
});

test('dividere per zero non passa di nascosto', () => {
  assert.throws(() => can('x/(3 - 3)'), /Divisione per zero/);
});

test('sviluppi assurdi (input da URL) vengono fermati', () => {
  assert.throws(() => can('(x + y)^500'), /troppo grande/);
});

// --- Interrogare la forma (servirà ai predicati della fase 4) --------------

test('grado, grado in una lettera, costante', () => {
  assert.strictEqual(can('4x^2 + 12x + 9').grado, 2);
  assert.strictEqual(can('x^2y^3').grado, 5);
  assert.strictEqual(can('x^2y^3').gradoIn('y'), 3);
  assert.strictEqual(can('7').grado, 0);
  assert.ok(can('7').èCostante);
  assert.ok(!can('x').èCostante);
});

test('il polinomio nullo si distingue dalla costante', () => {
  const zero = can('x - x');
  assert.ok(zero.èZero);
  assert.strictEqual(zero.grado, -1);
  assert.strictEqual(can('5').grado, 0);
  assert.ok(zero.costante.equals(new Rational(0)));
});

test('i termini si possono avere ordinati per grado decrescente', () => {
  const p = can('9 + 4x^2 + 12x');
  assert.strictEqual(p.toString(), '4*x^2 + 12*x + 9');
});

// --- Valutazione ------------------------------------------------------------

test('valuta l albero dando un valore alle lettere', () => {
  assert.strictEqual(valuta(parse('2x + 3'), { x: 4 }).toString(), '11');
  assert.strictEqual(valuta(parse('x/2'), { x: 3 }).toString(), '3/2');
  assert.throws(() => valuta(parse('2x'), {}), /Nessun valore per la lettera/);
});

// --- L'oracolo indipendente -------------------------------------------------
// La forma canonica e la valutazione dell'albero sono due strade diverse per
// lo stesso numero. Se la canonicalizzazione ha un errore — un esponente
// sommato male, un segno perso in una sottrazione — le due strade divergono su
// qualche assegnazione a caso, e questo test lo trova senza che nessuno abbia
// dovuto immaginare il caso giusto.

/** Valuta un Poly: somma di coeff * prodotto delle lettere elevate. */
function valutaPoly(p, assegnazioni) {
  let out = new Rational(0);
  for (const t of p.termini.values()) {
    let pezzo = t.coeff;
    for (const v of Object.keys(t.esponenti)) {
      pezzo = pezzo.mul(new Rational(assegnazioni[v]).pow(t.esponenti[v]));
    }
    out = out.add(pezzo);
  }
  return out;
}

/** PRNG con seme: un fallimento deve poter essere rigiocato uguale. */
function rng(seme) {
  return function () {
    seme |= 0;
    seme = (seme + 0x6D2B79F5) | 0;
    let t = Math.imul(seme ^ (seme >>> 15), 1 | seme);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generaEspressione(r, profondita) {
  const scelta = (lista) => lista[Math.floor(r() * lista.length)];
  if (profondita <= 0) {
    return scelta([
      String(Math.floor(r() * 11) - 5),
      scelta(['x', 'y']),
      (Math.floor(r() * 9) - 4) + '/' + (Math.floor(r() * 4) + 2),
    ]);
  }
  const a = generaEspressione(r, profondita - 1);
  const b = generaEspressione(r, profondita - 1);
  switch (Math.floor(r() * 6)) {
    case 0: return '(' + a + ' + ' + b + ')';
    case 1: return '(' + a + ' - ' + b + ')';
    case 2: return '(' + a + ')(' + b + ')';
    case 3: return '(' + a + ')^' + (r() < 0.5 ? 2 : 3);
    case 4: return '-(' + a + ')';
    default: return '(' + a + ')/' + (Math.floor(r() * 4) + 2);
  }
}

test('forma canonica e valutazione dell albero concordano su espressioni a caso', () => {
  const r = rng(20260904);
  let provate = 0;
  for (let i = 0; i < 400; i++) {
    const src = generaEspressione(r, 3);
    const albero = parse(src);
    const p = canonicalizza(albero);
    for (const ass of [{ x: 2, y: -3 }, { x: -1, y: 4 }, { x: 5, y: 1 }]) {
      const daAlbero = valuta(albero, ass);
      const daCanonica = valutaPoly(p, ass);
      assert.ok(
        daAlbero.equals(daCanonica),
        src + ' con ' + JSON.stringify(ass) + ': albero ' + daAlbero + ' ≠ canonica ' + daCanonica
      );
    }
    provate++;
  }
  assert.ok(provate > 300, 'il generatore deve produrre abbastanza casi');
});

test('due scritture equivalenti a caso sono giudicate tali', () => {
  const r = rng(7);
  for (let i = 0; i < 100; i++) {
    const src = generaEspressione(r, 2);
    // `e` e `e + (x - x)` sono la stessa cosa scritta peggio: il giudice non
    // deve farsi ingannare da un pezzo che vale zero.
    assert.ok(eq(src, '(' + src + ') + (x - x)'), src);
    assert.ok(!eq(src, '(' + src + ') + 1'), src);
  }
});
