/**
 * Il catalogo delle mosse — `static/lib/algebra-mosse.js`.
 *
 * La prova che conta è l'ultima: un esercizio giocato dall'inizio alla fine
 * senza una riga di interfaccia. Se quella passa, il modello regge — e lo
 * sappiamo prima di aver disegnato un pixel, dove correggerlo costa poco.
 *
 * L'invariante lo controlliamo dove vive davvero: una mossa non deve
 * conservare la *scrittura* dei membri (il secondo principio la cambia
 * apposta), deve conservare le SOLUZIONI. Quindi a ogni passaggio si prende
 * una soluzione nota dell'equazione di partenza e si verifica che continui a
 * soddisfare i due membri.
 */
const test = require('node:test');
const assert = require('node:assert');

const {
  parse, scrivi, visita, valuta, traguardo, equivalenti,
  applicaMossa, mosseDisponibili, validaWhitelist, CATALOGO,
} = require('../../static/lib/algebra-mosse.js');

/** Il primo nodo che si scrive così: rende leggibili le selezioni nei test. */
function nodoScritto(albero, testo) {
  let trovato = null;
  visita(albero, (n) => {
    if (trovato === null && n.type !== 'eq' && scrivi(n) === testo) trovato = n;
  });
  assert.ok(trovato, 'nessun nodo scritto "' + testo + '" in ' + scrivi(albero));
  return trovato;
}

/** Applica una mossa e pretende che riesca. */
function gioca(albero, azione) {
  const esito = applicaMossa(albero, azione);
  assert.ok(esito.ok, 'la mossa ' + azione.mossa + ' è stata rifiutata: ' + esito.messaggio);
  return esito.albero;
}

/** I due membri valgono lo stesso, per questa assegnazione? */
function soddisfa(albero, assegnazioni) {
  return valuta(albero.left, assegnazioni).equals(valuta(albero.right, assegnazioni));
}

// --- Mosse di applicazione: il motore scrive, non semplifica ---------------

test('primo principio: scrive sui due membri e non tocca altro', () => {
  const dopo = gioca(parse('2x + 3 = 8'),
    { mossa: 'primo-principio', parametri: { operazione: 'sottrai', valore: '3' } });
  assert.strictEqual(scrivi(dopo), '2x + 3 - 3 = 8 - 3');
});

test('secondo principio: da lavagna il divisore va sotto ogni termine', () => {
  const dopo = gioca(parse('2x + 6 = 12'),
    { mossa: 'secondo-principio', parametri: { operazione: 'dividi', valore: '3' } });
  assert.strictEqual(scrivi(dopo), '2x / 3 + 6 / 3 = 12 / 3');
});

test('secondo principio rigoroso: il divisore sta sotto il membro intero', () => {
  const dopo = gioca(parse('2x + 6 = 12'),
    { mossa: 'secondo-principio-rigoroso', parametri: { operazione: 'dividi', valore: '3' } });
  assert.strictEqual(scrivi(dopo), '(2x + 6) / 3 = 12 / 3');
});

test('moltiplicare non produce scritture ambigue', () => {
  const dopo = gioca(parse('x + 2 = 5'),
    { mossa: 'secondo-principio', parametri: { operazione: 'moltiplica', valore: '3' } });
  // `3` per il termine `2` non può diventare `32`
  assert.strictEqual(scrivi(dopo), '3x + 3 * 2 = 3 * 5');
});

test('dividere per una lettera non si può, e il messaggio dice perché', () => {
  const esito = applicaMossa(parse('2x = 6'),
    { mossa: 'secondo-principio', parametri: { operazione: 'dividi', valore: 'x' } });
  assert.strictEqual(esito.codice, 'valore-non-costante');
  assert.match(esito.messaggio, /lettera/);
});

test('dividere per zero non si può', () => {
  const esito = applicaMossa(parse('2x = 6'),
    { mossa: 'secondo-principio', parametri: { operazione: 'dividi', valore: '3 - 3' } });
  assert.strictEqual(esito.codice, 'valore-zero');
});

test('scambia i membri', () => {
  const dopo = gioca(parse('12 = 6x'), { mossa: 'scambia-membri' });
  assert.strictEqual(scrivi(dopo), '6x = 12');
});

test('elimina il termine nullo, ma non l ultimo rimasto', () => {
  const albero = parse('2x + 0 = 5');
  const dopo = gioca(albero, { mossa: 'elimina-nullo', nodo: nodoScritto(albero, '0').id });
  assert.strictEqual(scrivi(dopo), '2x = 5');

  const solo = parse('x = 0');
  const esito = applicaMossa(solo, { mossa: 'elimina-nullo', nodo: solo.right.id });
  assert.strictEqual(esito.codice, 'unico-termine');
});

test('ordina per grado decrescente, portando il segno nel primo termine', () => {
  const albero = parse('y = 2 - 2/3x');
  const dopo = gioca(albero, { mossa: 'ordina', nodo: albero.right.id });
  assert.strictEqual(scrivi(dopo), 'y = -2/3x + 2');
});

// --- Mosse di semplificazione: digita lo studente --------------------------

test('calcola: il risultato lo scrive lo studente', () => {
  const albero = parse('2x = 8 - 3');
  const dopo = gioca(albero, { mossa: 'calcola', nodo: albero.right.id, digitato: '5' });
  assert.strictEqual(scrivi(dopo), '2x = 5');
});

test('senza il risultato non succede niente', () => {
  const albero = parse('2x = 8 - 3');
  const esito = applicaMossa(albero, { mossa: 'calcola', nodo: albero.right.id });
  assert.strictEqual(esito.codice, 'serve-il-risultato');
});

test('un risultato sbagliato non entra nello stato', () => {
  const albero = parse('2x = 8 - 3');
  const esito = applicaMossa(albero, { mossa: 'calcola', nodo: albero.right.id, digitato: '6' });
  assert.strictEqual(esito.codice, 'non-equivalente');
});

test('equivalente ma scritto male è un rifiuto DIVERSO da sbagliato', () => {
  const albero = parse('2x = 8 - 3');
  // 5 scritto come 10/2: vale, ma un calcolo finisce in una frazione ridotta
  const esito = applicaMossa(albero, { mossa: 'calcola', nodo: albero.right.id, digitato: '10/2' });
  assert.strictEqual(esito.codice, 'frazione-non-ridotta');

  const mono = parse('y = 3x/3');
  const male = applicaMossa(mono,
    { mossa: 'normalizza-monomio', nodo: mono.right.id, digitato: 'x1' });
  assert.strictEqual(male.codice, 'non-normale');
});

test('riduci i termini simili', () => {
  const albero = parse('2x + 3x = 10');
  const dopo = gioca(albero, { mossa: 'riduci-simili', nodo: albero.left.id, digitato: '5x' });
  assert.strictEqual(scrivi(dopo), '5x = 10');
});

test('riscrivere la stessa cosa non è ridurre', () => {
  const albero = parse('2x + 3x = 10');
  const esito = applicaMossa(albero,
    { mossa: 'riduci-simili', nodo: albero.left.id, digitato: '2x + 3x' });
  assert.strictEqual(esito.codice, 'non-ridotto');
});

test('una somma non è un monomio da normalizzare, nemmeno se vale un numero', () => {
  const albero = parse('2x + 3y = 0 + 6');
  const offerte = mosseDisponibili(albero, albero.right.id).map((m) => m.id);
  assert.ok(!offerte.includes('normalizza-monomio'), 'offerte: ' + offerte.join(', '));
  assert.ok(offerte.includes('calcola'), 'lì la mossa giusta è il calcolo');
});

test('normalizza il monomio: 2x/3 diventa 2/3x', () => {
  const albero = parse('y = 2x/3');
  const dopo = gioca(albero, { mossa: 'normalizza-monomio', nodo: albero.right.id, digitato: '2/3x' });
  assert.strictEqual(scrivi(dopo), 'y = 2/3x');
});

test('svolgi il prodotto', () => {
  const albero = parse('(x + 1)(x + 2) = 0');
  const dopo = gioca(albero,
    { mossa: 'espandi', nodo: albero.left.id, digitato: 'x^2 + 3x + 2' });
  assert.strictEqual(scrivi(dopo), 'x^2 + 3x + 2 = 0');
});

test('non si semplifica quello che non c è da semplificare', () => {
  const albero = parse('2x + 3y = 5');
  assert.strictEqual(
    applicaMossa(albero, { mossa: 'riduci-simili', nodo: albero.left.id, digitato: '5xy' }).codice,
    'niente-di-simile');
  assert.strictEqual(
    applicaMossa(albero, { mossa: 'calcola', nodo: albero.left.id, digitato: '5' }).codice,
    'non-numerico');
});

// --- Il trasporto è una composizione, non una regola nuova -----------------

test('il trasporto porta il termine di là cambiandogli segno', () => {
  const a = parse('2x + 3 = 8');
  assert.strictEqual(scrivi(gioca(a, { mossa: 'trasporto', nodo: nodoScritto(a, '3').id })),
    '2x = 8 - 3');

  const b = parse('2x - 6 = 0');
  assert.strictEqual(scrivi(gioca(b, { mossa: 'trasporto', nodo: nodoScritto(b, '6').id })),
    '2x = 0 + 6');
});

test('un termine col meno gia dentro torna indietro col segno giusto', () => {
  // Il meno di un termine puo stare in due posti: nella somma (`- 2x`) oppure
  // dentro al coefficiente (`-2x`). Dopo `elimina-nullo` sta nel secondo, e
  // guardare solo il primo faceva scrivere `3 - -2x`.
  let s = parse('2x + 3 = 0');
  s = gioca(s, { mossa: 'trasporto', nodo: nodoScritto(s, '2x').id });
  assert.strictEqual(scrivi(s), '3 = 0 - 2x');
  s = gioca(s, { mossa: 'elimina-nullo', nodo: nodoScritto(s, '0').id });
  assert.strictEqual(scrivi(s), '3 = -2x');
  s = gioca(s, { mossa: 'trasporto', nodo: nodoScritto(s, '-2x').id });
  assert.strictEqual(scrivi(s), '3 + 2x = 0');

  // e l'andata e ritorno riporta dove si era partiti, a meno dell'ordine
  assert.ok(equivalenti(parse('3 + 2x'), parse('2x + 3')));
});

test('rimontando una somma il meno non si scrive mai due volte', () => {
  // `2 - 3x` puo perdere e riprendere dei termini: il segno lo porta il
  // collegamento, e il termine resta nudo.
  const s = parse('2 - 3x + 0');
  const dopo = gioca(s, { mossa: 'elimina-nullo', nodo: nodoScritto(s, '0').id });
  assert.strictEqual(scrivi(dopo), '2 - 3x');
  assert.ok(!scrivi(dopo).includes('- -'));
});

test('il trasporto FA quello che fanno le sue primitive, passo per passo', () => {
  // la scorciatoia...
  const prima = parse('2x + 3 = 8');
  const scorciatoia = gioca(prima, { mossa: 'trasporto', nodo: nodoScritto(prima, '3').id });

  // ...e la strada lunga: primo principio, poi somma dei termini simili
  let lungo = gioca(parse('2x + 3 = 8'),
    { mossa: 'primo-principio', parametri: { operazione: 'sottrai', valore: '3' } });
  assert.strictEqual(scrivi(lungo), '2x + 3 - 3 = 8 - 3');
  lungo = gioca(lungo, { mossa: 'riduci-simili', nodo: lungo.left.id, digitato: '2x' });

  assert.strictEqual(scrivi(scorciatoia), scrivi(lungo));
  assert.deepStrictEqual(CATALOGO['trasporto'].composta, ['primo-principio', 'riduci-simili']);
});

// --- La whitelist -----------------------------------------------------------

test('un id di mossa inventato deve fermare la build, non la lezione', () => {
  assert.throws(() => validaWhitelist(['trasporto', 'vola-via']), /Mosse sconosciute: vola-via/);
  assert.ok(validaWhitelist(['primo-principio', 'calcola']));
});

test('una mossa fuori whitelist non si fa, anche se sarebbe lecita', () => {
  const albero = parse('2x + 3 = 8');
  const soloPrincipi = ['primo-principio', 'secondo-principio', 'riduci-simili'];
  const esito = applicaMossa(albero,
    { mossa: 'trasporto', nodo: nodoScritto(albero, '3').id }, soloPrincipi);
  assert.strictEqual(esito.codice, 'mossa-non-abilitata');
  // ...e la strada lunga resta aperta: è il livello "prima delle scorciatoie"
  assert.ok(applicaMossa(albero,
    { mossa: 'primo-principio', parametri: { operazione: 'sottrai', valore: '3' } },
    soloPrincipi).ok);
});

test('le mosse disponibili su un nodo sono solo quelle che si possono fare', () => {
  const albero = parse('2x + 0 = 5');
  const ids = mosseDisponibili(albero, nodoScritto(albero, '0').id).map((m) => m.id);
  assert.ok(ids.includes('elimina-nullo'));
  assert.ok(!ids.includes('calcola'), 'uno zero non è un calcolo da fare');
  // Le mosse sull'equazione intera non si offrono su ogni singola cifra:
  // sarebbero rumore a ogni click.
  assert.ok(!ids.includes('scambia-membri'));
  const suEquazione = mosseDisponibili(albero, null).map((m) => m.id);
  assert.deepStrictEqual(suEquazione, ['scambia-membri']);
});

test('la radice-equazione non è un bersaglio, e non fa cadere niente', () => {
  const albero = parse('2x + 3 = 8');
  // Un click vicino all'uguale colpisce la radice: deve dare un rifiuto
  // ordinato, non un'eccezione.
  const esito = applicaMossa(albero, { mossa: 'calcola', nodo: albero.id, digitato: '5' });
  assert.strictEqual(esito.codice, 'serve-un-pezzo');
  assert.doesNotThrow(() => mosseDisponibili(albero, albero.id));
});

// --- L'esercizio giocato per intero ----------------------------------------

test('dalla forma implicita alla forma esplicita, mossa per mossa', () => {
  // Due soluzioni note della retta di partenza: devono restare soluzioni di
  // OGNI passaggio. È l'invariante vero — le mosse conservano le soluzioni,
  // non la scrittura.
  const soluzioni = [{ x: 3, y: 0 }, { x: 0, y: 2 }];
  const passaggi = [];

  let s = parse('2x + 3y - 6 = 0');
  const controlla = () => {
    passaggi.push(scrivi(s));
    for (const sol of soluzioni) {
      assert.ok(soddisfa(s, sol),
        scrivi(s) + ' non è più soddisfatta da ' + JSON.stringify(sol));
    }
  };
  controlla();

  s = gioca(s, { mossa: 'trasporto', nodo: nodoScritto(s, '6').id });
  controlla();
  s = gioca(s, { mossa: 'calcola', nodo: s.right.id, digitato: '6' });
  controlla();
  s = gioca(s, { mossa: 'trasporto', nodo: nodoScritto(s, '2x').id });
  controlla();
  s = gioca(s, { mossa: 'secondo-principio', parametri: { operazione: 'dividi', valore: '3' } });
  controlla();
  s = gioca(s, { mossa: 'normalizza-monomio', nodo: s.left.id, digitato: 'y' });
  controlla();
  s = gioca(s, { mossa: 'calcola', nodo: nodoScritto(s, '6 / 3').id, digitato: '2' });
  controlla();
  s = gioca(s, { mossa: 'normalizza-monomio', nodo: nodoScritto(s, '2x / 3').id, digitato: '2/3x' });
  controlla();
  s = gioca(s, { mossa: 'ordina', nodo: s.right.id });
  controlla();

  assert.strictEqual(scrivi(s), 'y = -2/3x + 2');
  const arrivo = traguardo(s, { isola: 'y' });
  assert.ok(arrivo.ok, 'traguardo non raggiunto: ' + JSON.stringify(arrivo.problemi));

  // Il traguardo non si era acceso prima del tempo.
  for (const passaggio of passaggi.slice(0, -1)) {
    assert.ok(!traguardo(parse(passaggio), { isola: 'y' }).ok,
      'il traguardo si accendeva già su ' + passaggio);
  }
});

test('e la lineare classica, fino a x = k', () => {
  let s = parse('2x + 3 = 8');
  s = gioca(s, { mossa: 'trasporto', nodo: nodoScritto(s, '3').id });
  s = gioca(s, { mossa: 'calcola', nodo: s.right.id, digitato: '5' });
  assert.ok(traguardo(s, { forma: 'ax=b' }).ok, 'ax=b non raggiunta su ' + scrivi(s));

  s = gioca(s, { mossa: 'secondo-principio', parametri: { operazione: 'dividi', valore: '2' } });
  s = gioca(s, { mossa: 'normalizza-monomio', nodo: s.left.id, digitato: 'x' });
  s = gioca(s, { mossa: 'calcola', nodo: s.right.id, digitato: '5/2' });
  assert.strictEqual(scrivi(s), 'x = 5/2');
  assert.ok(traguardo(s, { isola: 'x' }).ok);
});
