/**
 * Il render — `static/lib/algebra-rendering.js`.
 *
 * Due cose vanno difese:
 *
 *  1. **ogni nodo dell'albero è raggiungibile nel DOM, una volta sola.** È il
 *     patto su cui si reggono selezione e trascinamento: se un id non compare,
 *     quel pezzo non si può toccare; se compare due volte, un click ne colpisce
 *     uno a caso.
 *  2. **le parentesi mostrate sono quelle che servono.** Una parentesi di
 *     troppo confonde, una di meno fa leggere allo studente un'espressione
 *     diversa da quella che sta manipolando.
 */
const test = require('node:test');
const assert = require('node:assert');

const { parse, visita, rendiHTML } = require('../../static/lib/algebra-rendering.js');

const html = (src) => rendiHTML(parse(src));

/** Il testo che si vedrebbe, senza tag: per controllare la resa a colpo d'occhio. */
const testo = (src) => html(src).replace(/<[^>]+>/g, '');

// --- Il patto sugli id ------------------------------------------------------

test('ogni nodo compare nel DOM esattamente una volta', () => {
  for (const src of [
    '2x + 3y - 6 = 0', '(2x + 3)^2 + 5 = 0', '3y / 3 = 6 / 3 - 2x / 3',
    '-2/3x + 2', '(x + 1)(x - 2) = 0', '2 · (-3)',
  ]) {
    const albero = parse(src);
    const reso = rendiHTML(albero);
    visita(albero, (n) => {
      const quante = reso.split('data-nodo="' + n.id + '"').length - 1;
      assert.strictEqual(quante, 1,
        'il nodo ' + n.id + ' di ' + src + ' compare ' + quante + ' volte');
    });
  }
});

// --- Tipografia -------------------------------------------------------------

test('le lettere sono in corsivo, gli esponenti in apice', () => {
  assert.match(html('x'), /<i class="alg-lettera">x<\/i>/);
  // L'esponente è un nodo suo dentro l'apice: deve restare selezionabile
  assert.match(html('x^2'), /<sup class="alg-esponente"><span class="alg-n alg-num" data-nodo="\d+">2<\/span><\/sup>/);
});

test('le frazioni sono impilate, numeratore sopra e denominatore sotto', () => {
  assert.match(html('2/3'), /alg-sopra">2<.*alg-sotto">3</);
  assert.match(html('2x/3'), /alg-frazione/);
});

test('il segno esce dalla frazione e usa il meno tipografico', () => {
  // Impilata, la frazione non ha una barra fra i caratteri: il meno sta prima
  // di tutta la frazione, non sopra al numeratore.
  assert.match(html('-2/3'), /−<span class="alg-frazione"/);
  assert.strictEqual(testo('2 - 3'), '2−3');
});

test('il prodotto implicito non mostra il punto, quello ambiguo sì', () => {
  assert.strictEqual(testo('2x'), '2x');
  assert.strictEqual(testo('3xy'), '3xy');
  assert.strictEqual(testo('2 * 3'), '2·3');
});

// --- Parentesi --------------------------------------------------------------

test('la barra di frazione raggruppa da sola: niente parentesi', () => {
  // È il guadagno vero del render grafico: la divisione "da lavagna" si legge
  // come sul quaderno invece che come `(2x + 6) / 3`.
  assert.strictEqual(testo('(2x + 6)/3'), '2x+63');
  assert.ok(!testo('(2x + 6)/3').includes('('));
});

test('le parentesi restano dove servono a leggere', () => {
  assert.strictEqual(testo('(x + 1)(x - 2)'), '(x+1)(x−2)');
  assert.strictEqual(testo('(x + 1)^2'), '(x+1)2');
  assert.strictEqual(testo('2 * (-3)'), '2·(−3)');
  assert.strictEqual(testo('2 - (3 - 1)'), '2−(3−1)');
});

test('un coefficiente negativo davanti non prende parentesi', () => {
  assert.ok(!testo('-2/3x + 2').includes('('));
  assert.match(html('-2/3x + 2'), /−<span class="alg-frazione"/);
});

test('una frazione elevata a potenza viene protetta', () => {
  assert.ok(testo('(2/3)^2').startsWith('('));
});

// --- L equazione ------------------------------------------------------------

test('i due membri e l uguale', () => {
  const markup = html('2x = 5');
  assert.match(markup, /alg-uguale">=</);
  assert.strictEqual(testo('2x = 5'), '2x=5');
});

test('niente HTML che non venga dall albero', () => {
  // Le lettere sono [a-zA-Z] e i numeri interi: non c è modo di far uscire
  // markup da un'espressione, nemmeno se arriva da una query string.
  const markup = html('2x + 3 = 8');
  assert.ok(!markup.includes('<script'));
  assert.strictEqual((markup.match(/</g) || []).length, (markup.match(/>/g) || []).length);
});
