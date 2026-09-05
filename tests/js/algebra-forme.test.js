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
  parse, monomioNormale, polinomioRidotto, traguardo, fattoriDi, terminiDi, canonicalizza,
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
  assert.strictEqual(primo(mono('2x/3')), 'coefficiente-sotto');
  // ...ed è proprio la scrittura che produce il secondo principio "da lavagna"
  assert.ok(mono('2/3x').ok);
});

/**
 * Fra numeri una divisione È una frazione (la fa `dividi`, in
 * algebra-parser.js): `5 / 2` e `5/2` sono lo stesso albero, e quello che
 * resta da giudicare è una cosa sola — se la frazione è ai minimi termini.
 * Prima erano due scritture gemelle, indistinguibili a schermo e diverse
 * nell'albero, e `x = 5/2` sembrava finito senza esserlo.
 *
 * Restano divisioni vere quelle con una lettera o una somma sopra la barra, e
 * lì la diagnosi deve mandare alla mossa giusta.
 */
test('una frazione si giudica su una cosa sola: se è ridotta', () => {
  assert.ok(mono('5 / 2').ok, '5 / 2 è la frazione 5/2, e va bene così');
  assert.ok(mono('5/2').ok);
  assert.strictEqual(primo(mono('6 / 2')), 'frazione-non-ridotta');
  assert.strictEqual(primo(mono('6/2')), 'frazione-non-ridotta');
});

test('una divisione rimasta dice quale mossa manca', () => {
  // con delle lettere: va riscritta col coefficiente davanti
  assert.strictEqual(primo(mono('2x / 3')), 'coefficiente-sotto');
  // una costante scritta come conto (quello che resta dopo un principio
  // applicato a un termine composto): la divisione è ancora da fare
  assert.strictEqual(primo(mono('(6 + 6) / 3')), 'divisione-da-fare');
  // una somma sotto la barra non è un monomio scritto male: è un'altra cosa
  assert.strictEqual(primo(mono('(x + 1) / 2')), 'fattore-non-monomio');
  // e fuori dominio non si inventa una diagnosi
  assert.strictEqual(primo(mono('x / y')), 'fattore-non-monomio');
});

test('dopo un secondo principio il traguardo dice il vero', () => {
  const { traguardo, parse } = require('../../static/lib/algebra-forme.js');
  // Il caso da cui è nata la regola: sullo schermo `x = 5/2` è finito, e ora
  // lo è anche nell'albero.
  assert.ok(traguardo(parse('x = 5 / 2'), { isola: 'x' }).ok);
  // Mentre una frazione da ridurre resta un lavoro, e si chiama col suo nome.
  const daRidurre = traguardo(parse('x = 6 / 2'), { isola: 'x' });
  assert.ok(!daRidurre.ok);
  assert.strictEqual(daRidurre.problemi[0].codice, 'frazione-non-ridotta');
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

// --- Che cosa vuol dire `ax=b` quando le lettere sono più d'una --------------
// `a` e `b` non devono contenere L'INCOGNITA — non "devono essere numeri". Con
// una lettera sola le due letture coincidono ed è per questo che la differenza
// era rimasta nascosta; con i parametri no, e va detto quale lettera è quella
// da isolare.

test('con una lettera sola l\'incognita si indovina, come sempre', () => {
  assert.ok(trag('6x = 12', { forma: 'ax=b' }).ok);
  assert.ok(trag('-3y = 5', { forma: 'ax=b' }).ok);
  // e dichiararla non cambia niente
  assert.ok(trag('6x = 12', { forma: 'ax=b', incognita: 'x' }).ok);
});

test('con più lettere il traguardo non indovina: lo chiede all\'autore', () => {
  // Prima pescava la prima in ordine alfabetico. Su `ax = b` giudicava rispetto
  // alla `a` e diceva che a destra "deve restare solo un numero": lo studente
  // andava a cercare un errore che non c'era.
  for (const src of ['xy = 1', '2xy = 4', 'ax = b']) {
    assert.strictEqual(primo(trag(src, { forma: 'ax=b' })), 'incognita-ambigua',
      'accettata senza incognita dichiarata: ' + src);
  }
  assert.match(trag('ax = b', { forma: 'ax=b' }).problemi[0].messaggio, /incognita/);
});

test('dichiarata l\'incognita, i coefficienti letterali sono leciti', () => {
  // È il traguardo delle equazioni letterali: `ax = b` È in forma `ax=b`, con
  // `a` e `b` parametri. Se qui si pretendesse un numero, quel tipo di
  // esercizio non si potrebbe proprio dichiarare.
  assert.ok(trag('ax = b', { forma: 'ax=b', incognita: 'x' }).ok);
  assert.ok(trag('2xy = 4', { forma: 'ax=b', incognita: 'x' }).ok);
  assert.ok(trag('xy = 1', { forma: 'ax=b', incognita: 'x' }).ok);
});

test('ma l\'incognita a destra resta un problema, e lo dice con la lettera giusta', () => {
  assert.strictEqual(primo(trag('ax = bx', { forma: 'ax=b', incognita: 'x' })), 'destra-non-costante');
  assert.match(trag('ax = bx', { forma: 'ax=b', incognita: 'x' }).problemi[0].messaggio, /la x/);
  // con una lettera sola il messaggio resta quello di prima, più diretto
  assert.match(trag('2x = 8 - 3', { forma: 'ax=b' }).problemi[0].messaggio, /solo un numero/);
});

test('un\'incognita che non compare: lo dice invece di giudicare a vuoto', () => {
  assert.strictEqual(primo(trag('ay = b', { forma: 'ax=b', incognita: 'x' })), 'senza-incognita');
  assert.strictEqual(primo(trag('2 = 2', { forma: 'ax=b' })), 'senza-incognita');
});

test('a sinistra il grado nell\'incognita resta 1: i parametri non lo alzano', () => {
  assert.strictEqual(primo(trag('ax^2 = b', { forma: 'ax=b', incognita: 'x' })), 'sinistra-non-monomio');
  assert.ok(trag('a^2x = b', { forma: 'ax=b', incognita: 'x' }).ok, 'a^2 è un parametro qualsiasi');
});

// --- Il traguardo si interroga a ogni passaggio: non deve sollevare ----------

test('uno stato fuori dominio non fa cadere il traguardo', () => {
  // `x/y` si scrive e si legge: è uno STATO che lo studente può raggiungere.
  // Il traguardo viene chiesto a ogni mossa per sapere se accendersi, e
  // sollevare lì vorrebbe dire far sparire l'esercizio a metà.
  for (const spec of [{ forma: 'ax=b' }, { forma: 'normale' }, { forma: 'ridotta' }, { isola: 'x' }]) {
    let esito;
    assert.doesNotThrow(() => { esito = traguardo(parse('x/y = 1'), spec); }, JSON.stringify(spec));
    assert.strictEqual(esito.ok, false);
    assert.strictEqual(esito.problemi[0].codice, 'fuori-dominio');
  }
  assert.strictEqual(primo(trag('x/y + 1', { forma: 'ridotta' })), 'fuori-dominio');
  assert.strictEqual(primo(trag('2/x = 3', { forma: 'normale' })), 'fuori-dominio');
});

test('ma un traguardo dichiarato male deve ancora fermare la build', () => {
  // La differenza è chi ha sbagliato: uno stato illeggibile è dello studente e
  // si racconta, una spec inventata è dell'autore e deve saltare fuori subito.
  assert.throws(() => trag('x = 1', { forma: 'boh' }), /Traguardo sconosciuto/);
  assert.throws(() => trag('x = 1', null), /Traguardo non dichiarato/);
});

// --- Il confine si sente anche da qui ---------------------------------------

test('un\'espansione che uscirebbe dai numeri esatti si ferma, e lo dice', () => {
  // Misurato: i coefficienti di `(2x + 3)^n` restano esatti fino a n = 23 e
  // sfondano a 24. Nessuna lezione ci arriva — ma la pagina-strumento prende
  // l'espressione dalla query string, e lì non la scrive l'autore.
  assert.doesNotThrow(() => canonicalizza(parse('(2x + 3)^20')));
  assert.throws(() => canonicalizza(parse('(2x + 3)^24')), /troppo grandi/);
});

test('e il traguardo lo racconta invece di cadere', () => {
  // Stessa ragione del fuori dominio: `traguardo` viene interrogato a ogni
  // passaggio, e non può essere lui a far sparire l'esercizio.
  let esito;
  assert.doesNotThrow(() => { esito = traguardo(parse('(2x + 3)^24 = 0'), { forma: 'normale' }); });
  assert.strictEqual(esito.ok, false);
  assert.strictEqual(esito.problemi[0].codice, 'fuori-dominio');
  assert.match(esito.problemi[0].messaggio, /troppo grandi/);
});
