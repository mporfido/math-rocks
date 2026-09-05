/**
 * Parser algebrico — `static/lib/algebra-parser.js`.
 *
 * Due cose vanno difese qui, perché il resto del componente ci si appoggia:
 *
 *  1. L'albero è LETTERALE. Niente si riduce, si riordina o si somma da solo:
 *     se il parser semplificasse, lo studente si troverebbe passaggi già fatti
 *     e la mossa corrispondente non avrebbe più niente da fare.
 *  2. `a/b` fra interi è un numero, non una divisione — ma `2x/3` è una
 *     divisione. È la distinzione su cui poggiano il coefficiente frazionario
 *     e il secondo principio "da lavagna".
 */
const test = require('node:test');
const assert = require('node:assert');

const {
  parse, scrivi, visita, trovaNodo, percorsoDi, nodoAlPercorso,
} = require('../../static/lib/algebra-parser.js');

/** L'albero senza gli id: due parse dello stesso testo devono coincidere. */
function forma(n) {
  if (n === null || typeof n !== 'object') return n;
  const out = {};
  for (const k of Object.keys(n).sort()) {
    if (k === 'id' || k === 'value') continue;
    out[k] = forma(n[k]);
  }
  return out;
}

const testo = (src) => scrivi(parse(src));

// --- Numeri, frazioni, e la differenza fra le due barre ---------------------

test('un intero', () => {
  assert.strictEqual(testo('12'), '12');
});

test('a/b fra interi è UN numero, non una divisione', () => {
  const n = parse('2/3');
  assert.strictEqual(n.type, 'num');
  assert.deepStrictEqual([n.num, n.den], [2, 3]);
});

test('la frazione scritta non si riduce da sola (6/4 resta 6/4)', () => {
  const n = parse('6/4');
  assert.deepStrictEqual([n.num, n.den], [6, 4]);
  // il valore però è ridotto: serve ai confronti, non alla scrittura
  assert.deepStrictEqual([n.value.num, n.value.den], [3, 2]);
});

test('2x/3 è una divisione, non un numero', () => {
  const n = parse('2x/3');
  assert.strictEqual(n.type, 'op');
  assert.strictEqual(n.op, '/');
  assert.strictEqual(scrivi(n.left), '2x');
});

test('2/3x è (2/3)·x, perché 2/3 è già un numero solo', () => {
  const n = parse('2/3x');
  assert.strictEqual(n.type, 'op');
  assert.strictEqual(n.op, '*');
  assert.strictEqual(n.left.type, 'num');
  assert.deepStrictEqual([n.left.num, n.left.den], [2, 3]);
  assert.strictEqual(n.right.name, 'x');
});

test('denominatore zero rifiutato', () => {
  assert.throws(() => parse('2/0'), /Denominatore zero/);
});

// --- Lettere e prodotto implicito ------------------------------------------

test('una lettera è una variabile, e xy è un prodotto', () => {
  const n = parse('xy');
  assert.strictEqual(n.op, '*');
  assert.strictEqual(n.implicit, true);
  assert.deepStrictEqual([n.left.name, n.right.name], ['x', 'y']);
});

test('l albero ricorda se il prodotto era scritto col segno', () => {
  assert.strictEqual(parse('2x').implicit, true);
  assert.strictEqual(parse('2*x').implicit, undefined);
  assert.strictEqual(testo('2x'), '2x');
  assert.strictEqual(testo('2*x'), '2 * x');
});

test('prodotto implicito con le parentesi', () => {
  assert.strictEqual(testo('2(x+1)'), '2(x + 1)');
  assert.strictEqual(testo('(x+1)(x-2)'), '(x + 1)(x - 2)');
});

test('due numeri accostati sono un errore, non un prodotto', () => {
  assert.throws(() => parse('2 3'), /manca il segno di moltiplicazione/);
});

// --- Meno unario ------------------------------------------------------------

test('il meno davanti a un numero entra nel numero', () => {
  const n = parse('-5x');
  assert.strictEqual(n.op, '*');
  assert.strictEqual(n.left.type, 'num');
  assert.strictEqual(n.left.num, -5);
});

test('il meno davanti a tutto il resto resta un nodo', () => {
  const n = parse('-x');
  assert.strictEqual(n.type, 'neg');
  assert.strictEqual(n.operand.name, 'x');
  assert.strictEqual(testo('-(x+1)'), '-(x + 1)');
});

test('-x^2 è -(x^2), non (-x)^2', () => {
  const n = parse('-x^2');
  assert.strictEqual(n.type, 'neg');
  assert.strictEqual(n.operand.op, '^');
});

test('una sottrazione non diventa una somma con un negativo', () => {
  const n = parse('2 - 3');
  assert.strictEqual(n.op, '-');
  assert.strictEqual(testo('2 - 3'), '2 - 3');
});

// --- Potenze ----------------------------------------------------------------

test('esponente intero', () => {
  const n = parse('x^2');
  assert.strictEqual(n.op, '^');
  assert.strictEqual(n.right.num, 2);
});

test('esponente non intero o non scritto: rifiutato', () => {
  assert.throws(() => parse('2^(3-2)'), /Esponente non valido/);
  assert.throws(() => parse('x^y'), /Esponente non valido/);
  assert.throws(() => parse('x^1/2'), /Esponente non valido/);
});

test('potenza di potenza senza parentesi: rifiutata con un consiglio', () => {
  assert.throws(() => parse('2^3^2'), /usa le parentesi/);
  assert.strictEqual(testo('(x^2)^3'), '(x^2)^3');
});

// --- Precedenze e parentesi -------------------------------------------------

test('le precedenze sono quelle di sempre', () => {
  assert.strictEqual(testo('2 + 3x'), '2 + 3x');
  assert.strictEqual(testo('(2 + 3)x'), '(2 + 3)x');
  assert.strictEqual(testo('2x^2'), '2x^2');
});

test('le parentesi ridondanti spariscono, quelle necessarie no', () => {
  assert.strictEqual(testo('(2x) + 3'), '2x + 3');
  assert.strictEqual(testo('2 - (3 - 1)'), '2 - (3 - 1)');
  assert.strictEqual(testo('12 / (2 * 3)'), '12 / (2 * 3)');
});

test('parentesi quadre e graffe valgono come le tonde', () => {
  assert.strictEqual(testo('[2 + {3 - 1}]x'), '(2 + (3 - 1))x');
});

test('parentesi sbagliate: messaggi distinti', () => {
  assert.throws(() => parse('(2x + 3'), /Manca la parentesi di chiusura/);
  assert.throws(() => parse('(2x + 3]'), /non corrispondenti/);
  assert.throws(() => parse('2x + 3)'), /chiusa senza aprirla/);
});

// --- Equazioni --------------------------------------------------------------

test('un uguale produce la radice eq', () => {
  const n = parse('2x + 3 = 8');
  assert.strictEqual(n.type, 'eq');
  assert.strictEqual(scrivi(n.left), '2x + 3');
  assert.strictEqual(scrivi(n.right), '8');
});

test('più di un uguale: rifiutato', () => {
  assert.throws(() => parse('1 = 2 = 3'), /Più di un segno di uguale/);
});

test('senza uguale è un espressione, e va bene lo stesso', () => {
  assert.strictEqual(parse('2x + 3').type, 'op');
});

// --- Round-trip -------------------------------------------------------------

test('scrivi e rileggi non cambia la struttura', () => {
  const casi = [
    '2x + 3 = 8',
    '2x + 3y - 6 = 0',
    'y = -2/3x + 2',
    '(2x + 3)^2 + 5 = 0',
    '2x/3 + 6/3 = 12/3',
    '2x + 3 - 3 = 8 - 3',
    '4x^2 + 12x + 9',
    '-x - (2 - y)',
    '(x + 1)(x - 2) = 0',
    // Alberi che a pari precedenza NON sono quelli associati a sinistra: se le
    // parentesi si perdono qui, lo stato dello studente cambia di nascosto.
    '2 + (3 - 1)',
    '2 * (3 * x)',
    '(x^2)^3',
  ];
  for (const caso of casi) {
    const uno = parse(caso);
    const due = parse(scrivi(uno));
    assert.deepStrictEqual(forma(due), forma(uno), 'round-trip di ' + caso);
  }
});

// --- Identità dei nodi ------------------------------------------------------

test('ogni nodo ha un id, e sono tutti diversi', () => {
  const albero = parse('2x + 3y - 6 = 0');
  const visti = new Set();
  let quanti = 0;
  visita(albero, (n) => {
    assert.strictEqual(typeof n.id, 'number');
    visti.add(n.id);
    quanti++;
  });
  assert.strictEqual(visti.size, quanti);
});

test('gli id non si ripetono nemmeno fra alberi diversi', () => {
  const a = new Set();
  const b = new Set();
  visita(parse('x + 1'), (n) => a.add(n.id));
  visita(parse('x + 1'), (n) => b.add(n.id));
  for (const id of a) assert.ok(!b.has(id), 'id ' + id + ' riusato in un altro albero');
});

test('trovaNodo pesca il bersaglio della selezione', () => {
  const albero = parse('2x + 3');
  const cercato = albero.left;
  assert.strictEqual(trovaNodo(albero, cercato.id), cercato);
  assert.strictEqual(trovaNodo(albero, -1), null);
});

// --- Input non fidato (arriva anche da una query string) --------------------

test('vuoto, troppo lungo, simboli estranei', () => {
  assert.throws(() => parse(''), /Espressione vuota/);
  assert.throws(() => parse('   '), /Espressione vuota/);
  assert.throws(() => parse('1 + '.repeat(200) + '1'), /troppo lunga/);
  assert.throws(() => parse('2 § 3'), /Simbolo non riconosciuto/);
  assert.throws(() => parse('1234567890123456789'), /Numero troppo grande/);
});

// --- Indirizzare un nodo senza il suo id -------------------------------------

test('il cammino ritrova lo stesso pezzo in un albero riletto da zero', () => {
  const prima = parse('2x + 3 = 8');
  const tre = trovaNodo(prima, prima.left.right.id);
  const cammino = percorsoDi(prima, tre.id);
  assert.deepStrictEqual(cammino, ['left', 'right']);

  // La rilettura è il caso vero: una sequenza di mosse salvata ieri va
  // rigiocata su un albero i cui id sono tutti diversi.
  const dopo = parse('2x + 3 = 8');
  assert.notStrictEqual(dopo.left.right.id, tre.id, 'gli id dovrebbero essere nuovi');
  assert.strictEqual(scrivi(nodoAlPercorso(dopo, cammino)), '3');
});

test('il cammino della radice è vuoto, e quello di un nodo estraneo è null', () => {
  const albero = parse('x + 1');
  assert.deepStrictEqual(percorsoDi(albero, albero.id), []);
  assert.strictEqual(percorsoDi(albero, 'nessuno'), null);
});

test('un cammino che non porta da nessuna parte dà null, non solleva', () => {
  // Succede per davvero: la lezione cambia, la sequenza salvata resta.
  const albero = parse('x + 1');
  assert.strictEqual(nodoAlPercorso(albero, ['left', 'left', 'left']), null);
  assert.strictEqual(nodoAlPercorso(albero, null), null);
  assert.strictEqual(nodoAlPercorso(albero, ['operand']), null);
});
