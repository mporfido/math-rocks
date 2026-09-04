/**
 * Forme e diagnosi — `static/lib/algebra-forme.js`.
 *
 * Due cose vanno difese, e sono diverse fra loro:
 *
 *  1. che il traguardo si accenda quando deve e SOLO quando deve — un
 *     traguardo generoso regala l'esercizio, uno severo lascia lo studente
 *     davanti a una scheda giusta che non si chiude;
 *  2. che quando non si accende, il PRIMO problema dell'elenco sia quello
 *     giusto da mostrare. È il messaggio che lo studente legge: mandarlo a
 *     ordinare i termini mentre ne ha ancora due da sommare è peggio che
 *     tacere.
 */
const test = require('node:test');
const assert = require('node:assert');

const {
  parse, monomioNormale, polinomioRidotto, traguardo, fattoriDi, terminiDi,
} = require('../../static/lib/algebra-forme.js');

const mono = (src) => monomioNormale(parse(src));
const poli = (src) => polinomioRidotto(parse(src));
const trag = (src, spec) => traguardo(parse(src), spec);

/** Il codice del primo problema: quello che lo studente vedrebbe. */
const primo = (r) => (r.problemi.length ? r.problemi[0].codice : null);
const codici = (r) => r.problemi.map((p) => p.codice);

// --- Scomposizione ----------------------------------------------------------

test('fattori e termini si leggono come sono scritti', () => {
  assert.strictEqual(fattoriDi(parse('2xy')).length, 3);
  assert.strictEqual(fattoriDi(parse('2(x + 1)')).length, 2);
  const t = terminiDi(parse('2x - 3y + 0'));
  assert.deepStrictEqual(t.map((x) => x.segno), [1, -1, 1]);
});

// --- Monomio in forma normale ----------------------------------------------

test('i monomi già normali passano', () => {
  for (const src of ['x', '-x', '7', '-5x', '2/3x', 'x^2', '3x^2y', '-x^2y^3', '1']) {
    assert.ok(mono(src).ok, src + ' dovrebbe essere normale: ' + codici(mono(src)));
  }
});

test('l ordine delle lettere è tollerante, come deciso', () => {
  assert.ok(mono('3y^3x^2').ok);
});

test('il coefficiente va davanti', () => {
  assert.strictEqual(primo(mono('x2')), 'coefficiente-non-davanti');
  assert.strictEqual(primo(mono('xy3')), 'coefficiente-non-davanti');
});

test('un solo coefficiente', () => {
  assert.ok(codici(mono('2x3')).includes('coefficienti-multipli'));
});

test('la frazione va ridotta ai minimi termini', () => {
  assert.strictEqual(primo(mono('6/4x')), 'frazione-non-ridotta');
  assert.ok(mono('3/2x').ok);
});

test('1 e -1 non si scrivono', () => {
  assert.strictEqual(primo(mono('1x')), 'coefficiente-uno');
  assert.strictEqual(primo(mono('-1x')), 'coefficiente-meno-uno');
  // ma il monomio che È il numero 1 va benissimo
  assert.ok(mono('1').ok);
  assert.ok(mono('-1').ok);
});

test('il meno abbraccia tutto il monomio, ma entra nel coefficiente se c è', () => {
  assert.ok(mono('-x').ok);
  assert.ok(mono('-x^2y').ok);
  assert.ok(mono('-5x').ok);
  // `-(2x)` e `-2x` sono LO STESSO albero: le parentesi non si memorizzano,
  // e il segno entra nel coefficiente già in fase di lettura.
  assert.ok(mono('-(2x)').ok);
});

test('il meno fuori da un coefficiente viene comunque riconosciuto', () => {
  // Il parser non produce più questa forma, ma una mossa può costruirla:
  // il predicato deve saperla giudicare lo stesso.
  const dueX = parse('2x');
  const negato = { id: 9999, type: 'neg', operand: dueX };
  assert.strictEqual(primo(monomioNormale(negato)), 'meno-fuori');
});

test('ogni lettera una volta sola, con il suo esponente', () => {
  assert.strictEqual(primo(mono('xx')), 'lettera-ripetuta');
  assert.ok(codici(mono('x x^2')).includes('lettera-ripetuta'));
});

test('esponenti 0 e 1 non si scrivono', () => {
  assert.strictEqual(primo(mono('x^1')), 'esponente-uno');
  assert.strictEqual(primo(mono('x^0')), 'esponente-zero');
});

test('2x/3 non è un monomio normale: il coefficiente va scritto davanti', () => {
  assert.ok(!mono('2x/3').ok);
  assert.strictEqual(primo(mono('2x/3')), 'fattore-non-monomio');
  // ...ed è proprio la scrittura che produce il secondo principio "da lavagna"
  assert.ok(mono('2/3x').ok);
});

test('una somma non è un monomio', () => {
  assert.strictEqual(primo(mono('x + 1')), 'fattore-non-monomio');
});

// --- Polinomio ridotto ------------------------------------------------------

test('i polinomi già ridotti e ordinati passano', () => {
  for (const src of ['4x^2 + 12x + 9', '2x - 3', '-x^2 + 1', '0', 'x^2y + xy + 1']) {
    assert.ok(poli(src).ok, src + ': ' + codici(poli(src)));
  }
});

test('termini simili ancora da sommare', () => {
  assert.strictEqual(primo(poli('2x + 3x')), 'termini-simili');
  assert.strictEqual(primo(poli('x^2 + 5 - 2x^2')), 'termini-simili');
});

test('il termine nullo residuo va tolto — ma lo zero da solo va bene', () => {
  assert.strictEqual(primo(poli('2x + 0')), 'termine-nullo');
  assert.ok(poli('0').ok);
});

test('l ordine è per grado decrescente', () => {
  assert.strictEqual(primo(poli('9 + 4x^2')), 'ordine');
  assert.ok(poli('4x^2 + 9').ok);
});

test('un termine scritto male viene segnalato dentro al polinomio', () => {
  assert.ok(codici(poli('x2 + 1')).includes('coefficiente-non-davanti'));
});

// --- Traguardo: espressione ridotta ----------------------------------------

test('forma ridotta', () => {
  assert.ok(trag('4x^2 + 12x + 9', { forma: 'ridotta' }).ok);
  assert.strictEqual(primo(trag('2x + 3x', { forma: 'ridotta' })), 'termini-simili');
  assert.strictEqual(primo(trag('2x = 3', { forma: 'ridotta' })), 'non-espressione');
});

// --- Traguardo: ax = b ------------------------------------------------------

test('ax = b: le forme che hai approvato', () => {
  assert.ok(trag('6x = 12', { forma: 'ax=b' }).ok);
  assert.ok(trag('-3x = 5', { forma: 'ax=b' }).ok);
  assert.ok(trag('x = 2', { forma: 'ax=b' }).ok);
  assert.ok(trag('2/3x = 5', { forma: 'ax=b' }).ok);
});

test('ax = b: e quelle che hai rifiutato', () => {
  // fattori scambiati dentro al monomio
  assert.strictEqual(primo(trag('x6 = 12', { forma: 'ax=b' })), 'coefficiente-non-davanti');
  // zero residuo
  assert.strictEqual(primo(trag('6x + 0 = 12', { forma: 'ax=b' })), 'sinistra-non-monomio');
  // membri scambiati: ha un messaggio suo, perché ha una mossa sua
  assert.strictEqual(primo(trag('12 = 6x', { forma: 'ax=b' })), 'membri-scambiati');
});

test('ax = b: resta qualcosa da spostare', () => {
  assert.strictEqual(primo(trag('2x + 3 = 8', { forma: 'ax=b' })), 'sinistra-non-monomio');
  assert.strictEqual(primo(trag('2x = 8 - 3', { forma: 'ax=b' })), 'destra-non-costante');
});

test('ax = b: il coefficiente a destra va ridotto', () => {
  assert.strictEqual(primo(trag('x = 6/4', { forma: 'ax=b' })), 'frazione-non-ridotta');
  assert.ok(trag('x = 3/2', { forma: 'ax=b' }).ok);
});

// --- Traguardo: forma normale ----------------------------------------------

test('forma normale: tutto a sinistra, ordinato', () => {
  assert.ok(trag('4x^2 - 9 = 0', { forma: 'normale' }).ok);
  assert.ok(trag('x^2 + 2x + 1 = 0', { forma: 'normale' }).ok);
});

test('forma normale: x^2 = 4 non basta, e il messaggio lo dice', () => {
  const r = trag('x^2 = 4', { forma: 'normale' });
  assert.ok(!r.ok);
  assert.strictEqual(primo(r), 'destra-non-zero');
  assert.match(r.problemi[0].messaggio, /portati tutti a sinistra/);
});

test('forma normale: prima si somma, poi si ordina', () => {
  // ha DUE difetti: termini simili e ordine. Deve vincere il primo, perché
  // ordinare adesso vorrebbe dire rifarlo dopo.
  const r = trag('2x + 3x + 1 = 0', { forma: 'normale' });
  assert.strictEqual(primo(r), 'termini-simili');
  const s = trag('1 + 2x + 3x = 0', { forma: 'normale' });
  assert.strictEqual(primo(s), 'termini-simili');
  assert.ok(codici(s).includes('ordine'));
});

test('forma normale: quando resta solo l ordine, lo dice', () => {
  assert.strictEqual(primo(trag('9 + 4x^2 = 0', { forma: 'normale' })), 'ordine');
});

// --- Traguardo: isola una lettera ------------------------------------------

test('la retta da implicita a esplicita', () => {
  assert.ok(trag('y = -2/3x + 2', { isola: 'y' }).ok);
  const r = trag('2x + 3y - 6 = 0', { isola: 'y' });
  assert.strictEqual(primo(r), 'non-isolata');
});

test('isola: la lettera non deve restare a destra', () => {
  assert.ok(codici(trag('y = 2y + 1', { isola: 'y' })).includes('lettera-a-destra'));
});

test('isola: membri scambiati', () => {
  assert.strictEqual(primo(trag('-2/3x + 2 = y', { isola: 'y' })), 'membri-scambiati');
});

test('isola: a destra vale comunque la forma ridotta e ordinata', () => {
  assert.strictEqual(primo(trag('y = 2 - 2/3x', { isola: 'y' })), 'ordine');
  assert.strictEqual(primo(trag('y = x + 2x', { isola: 'y' })), 'termini-simili');
});

test('isolare la x È risolvere: non serve un traguardo a parte', () => {
  assert.ok(trag('x = 2', { isola: 'x' }).ok);
  assert.strictEqual(primo(trag('2x = 4', { isola: 'x' })), 'non-isolata');
});

// --- Robustezza -------------------------------------------------------------

test('un traguardo non dichiarato o sconosciuto è un errore d autore', () => {
  assert.throws(() => traguardo(parse('x'), null), /non dichiarato/);
  assert.throws(() => traguardo(parse('x'), { forma: 'boh' }), /sconosciuto/);
});

test('i problemi indicano il nodo, così l interfaccia può puntarlo', () => {
  const albero = parse('9 + 4x^2 = 0');
  const r = traguardo(albero, { forma: 'normale' });
  assert.strictEqual(typeof r.problemi[0].nodo, 'number');
});
