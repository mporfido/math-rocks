# La lavagna delle mosse — `:::algebra`

Un'equazione (o un'espressione) che lo studente **trasforma una mossa per
volta**, applicando i principi di equivalenza e le loro conseguenze, finché non
ha la forma richiesta. Non si risolve scrivendo la risposta: si manipola.

```markdown
:::algebra isola="x"
2x + 3 = 8
:::
```

Due cose lo distinguono da [`:::expr`](espressioni.md):

- **il traguardo è una forma, non un valore.** `x = 5/2` non è "il risultato":
  è la scrittura di arrivo che l'esercizio chiedeva. Un altro esercizio sulla
  stessa equazione può fermarsi a `2x = 5`;
- **gli stati sbagliati sono irraggiungibili.** Una mossa che non conserva
  l'equivalenza non avviene e dice perché. Le mosse inutili ma lecite, invece,
  si possono fare: girare in tondo è permesso, sbagliare no.

Con un traguardo il blocco **è un goal**: completato, dà la spunta allo step.

## Il traguardo

Va dichiarato, e uno solo per blocco. Senza, la build si ferma.

| Opzione | Forma di arrivo |
| --- | --- |
| `isola="x"` | la sola `x` a sinistra, e a destra un polinomio ridotto e ordinato |
| `forma="ax=b"` | l'incognita da sola a sinistra **col suo coefficiente**, un termine solo a destra (`2x = 5`) |
| `forma="normale"` | `ax² + bx + c = 0`: tutti i termini a sinistra, ordinati per grado decrescente, `0` scritto a destra |
| `forma="ridotta"` | un polinomio ridotto e ordinato, **senza uguale**: per le espressioni |
| `libera` | flag: nessun traguardo e nessun goal |

`isola` e `forma="ax=b"` si somigliano ma non sono la stessa cosa, ed è la
distinzione che regge mezza lezione: `2x = 5` è in forma `ax=b` ma la `x` non è
ancora isolata.

Con **più di una lettera** in gioco, `forma="ax=b"` non sa da sola quale sia
l'incognita e va detto:

```markdown
:::algebra forma="ax=b" incognita="x"
3x + 2x = 5a
:::
```

`incognita` vale solo con `forma="ax=b"`: altrove la build si ferma, invece di
accettarla e ignorarla in silenzio.

Il flag `libera` serve alle lezioni che vogliono **far vedere** una mossa
invece di farla fare: la lavagna si muove all'infinito e non si chiude niente.

## Il linguaggio dell'equazione

Lo scrive l'autore ed è input fidato, ma è **lo stesso** che lo studente usa
per digitare i risultati delle mosse.

| Scrittura | Significato |
| --- | --- |
| `12`, `-3` | numeri interi |
| `2/3` | frazione fra interi: un numero, non una divisione |
| `x`, `y`, `A` | **una lettera = una variabile** (serve perché `xy` possa valere `x·y`) |
| `2x`, `3xy`, `2(x+1)` | prodotto implicito |
| `2*x`, `2·x`, `2×x` | prodotto esplicito |
| `2x/3` | divisione (con `:` e `÷` come sinonimi in ingresso) |
| `x^2` | potenza a esponente intero scritto |
| `( )` `[ ]` `{ }` | parentesi equivalenti e annidabili |
| `=` | al massimo uno, al livello più esterno |

> **Fra due numeri, la barra è sempre una frazione.** `6/2` è la frazione
> `6/2` — non ridotta, quindi ancora da sistemare con *Calcola*. Restano
> divisioni vere solo quelle con lettere o somme sopra la barra, dove la barra
> raggruppa da sola e le parentesi non servono.

> **Il dominio è chiuso**: polinomi a coefficienti razionali. I coefficienti
> frazionari sono dentro (`2/3 x`), le equazioni fratte no: dividere per una
> lettera aprirebbe le condizioni di esistenza, e il motore lo vieta dicendolo.
> Un esponente non è un nodo da sciogliere: `2^(3-2)` è il mestiere di
> [`:::expr`](espressioni.md).

## Le tre vie per dare una mossa

Fanno tutte la stessa cosa — ogni gesto ha il suo gemello a click.

- **cliccare un pezzo** della scrittura apre le mosse che agiscono su *quel*
  pezzo. Cliccando un `+` o un `−` si sceglie tutta la somma;
- **i moduli in basso**, senza niente selezionato, applicano i due principi ai
  due membri: si sceglie l'operazione e si scrive per quanto;
- **trascinare un termine**: attraverso l'uguale lo porta dall'altra parte
  (trasporto), su un termine simile apre la somma, di lato lo sposta di posto.
  Si trascina **col dito come col mouse** (schermi touch compresi); lo swipe
  verticale resta al browser e continua a scorrere la pagina.

Il gesto sui simili e il suo gemello a click non chiedono lo stesso conto, ed è
voluto. Portando un `3x` sopra un `2x` si è già pensato «cinque x»: da riscrivere
c'è quella somma sola (`riduci-coppia`), e gli altri termini li ricopia il
motore — i due non devono nemmeno essere vicini, e il risultato torna al posto
del primo dei due. Dal menu, invece, senza un gesto che dica *quali* due, il
pezzo è la somma selezionata per intero (`riduci-simili`).

`Annulla` torna indietro di un passaggio. `Ci sono?` dice, fra le cose che
mancano al traguardo, **quella da sistemare per prima**.

## Chi scrive il risultato

È la regola che il componente insegna, e vale la pena dirla in classe:

- le **mosse di applicazione** (i principi, il trasporto, lo spostamento) non
  comportano un calcolo: le scrive il motore, meccanicamente e senza
  semplificare. Il primo principio su `2x + 3 = 8` scrive `2x + 3 - 3 = 8 - 3`,
  e lì si ferma;
- le **mosse di semplificazione** comportano un calcolo, e **il calcolo è dello
  studente**: il motore sa già quanto fa — deve saperlo, per giudicare — ma non
  lo scrive al posto suo.

## Le mosse

| Id | Che cosa fa | Il risultato |
| --- | --- | --- |
| `primo-principio` | aggiungi o sottrai la stessa quantità ai due membri | motore |
| `secondo-principio` | moltiplica o dividi i due membri, **termine a termine** (come sul quaderno) | motore |
| `secondo-principio-rigoroso` | moltiplica o dividi il **membro intero**, lasciando la distribuzione a dopo | motore |
| `trasporto` | porta un termine dall'altra parte cambiandogli segno | motore |
| `scambia-membri` | scambia destra e sinistra | motore |
| `sposta` | sposta un termine di posto nella somma (è il gesto) | motore |
| `sposta-sinistra`, `sposta-destra` | gli stessi spostamenti a click | motore |
| `ordina` | ordina i termini per grado decrescente | motore |
| `elimina-nullo` | toglie un termine che vale zero | motore |
| `calcola` | svolge un pezzo interamente numerico, o riduce una frazione | **studente** |
| `riduci-simili` | somma i termini con la stessa parte letterale, in tutta la somma scelta | **studente** |
| `riduci-coppia` | somma **due** termini simili, e fa riscrivere solo la loro somma (è il gesto) | **studente** |
| `normalizza-monomio` | riscrive un monomio in forma normale (`2x/3` → `2/3 x`) | **studente** |
| `espandi` | svolge un prodotto, prodotti notevoli compresi | **studente** |

### I prodotti notevoli

Non hanno una mossa loro: si svolgono con `espandi`, selezionando **il
prodotto** — il nodo `(x+3)^2`, non il membro intero — e digitando lo sviluppo
per intero. L'oracolo di equivalenza sviluppa da sé, quindi `(2a+b)^2` e
`(x+1)^3` funzionano come `(x+3)^2`.

Quando il pezzo selezionato **è** un quadrato di binomio o una differenza di
quadrati, uno sviluppo sbagliato non riceve il solito «non vale quanto il pezzo
che stai sostituendo»: la lavagna dice *quale condizione cade*, senza scrivere
il pezzo giusto.

| Digitato su `(x + 3)^2` | Risposta |
| --- | --- |
| `x^2 + 9` | Ci sono i due quadrati, ma manca il doppio prodotto. |
| `x^2 + 3x + 9` | I due quadrati ci sono: è il doppio prodotto che non torna. |
| `x^2 + 6x + 6` | Il doppio prodotto torna, ma uno dei due quadrati no. |

Su `(x - 3)(x + 3)`, allo stesso modo, `x^2 + 9` si sente dire che il secondo
quadrato va sottratto e non sommato, e `x^2 + 3x - 9` che i due prodotti
incrociati si annullano fra loro. Fuori da queste due forme — o quando
l'errore è di un altro genere — resta il messaggio generico, che è sempre vero:
meglio nessuna diagnosi che una diagnosi che indica il pezzo sbagliato.

Un passaggio intermedio si può fare, ma solo se **aumenta i termini**:
`(x+3)(x+3)` → `x(x+3) + 3(x+3)` è accettato, mentre `(x+3)^2` →
`(x+3)(x+3)` no («Il prodotto non è ancora stato svolto»), perché resta un
termine solo.

Il **trasporto non è una regola nuova**: il motore lo esegue davvero come primo
principio più riduzione dei termini simili, e una lezione può introdurlo al
rallentatore facendo prima i due passaggi separati.

Il **secondo principio divide solo per numeri**: per una lettera aprirebbe le
condizioni di esistenza, che sono fuori dominio, e la lavagna lo dice.

> **Monomio in forma normale**: il coefficiente razionale una volta sola e
> davanti, `1` omesso e `-1` scritto come segno, ogni lettera una volta con il
> suo esponente, l'esponente `1` omesso, e la **frazione ridotta ai minimi
> termini**. L'ordine delle lettere non conta.

## Scegliere le mosse — `mosse="…"`

Un elenco di id separati da `;`. Omesso, sono abilitate tutte.

```markdown
:::algebra forma="normale" mosse="trasporto;riduci-simili;calcola;elimina-nullo"
5x + 4 - 2x = 9
:::
```

Serve a far praticare una strada sola: qui l'equazione si muove solo per
trasporto, e i principi non compaiono nemmeno nel menu.

`riduci-simili` **abilita anche `riduci-coppia`**: sono la stessa algebra viste
da due gesti, e chi scrive «somma i termini simili» in una lezione non intendeva
togliere il trascinamento. Il contrario no — `riduci-coppia` da solo lascia
soltanto il gesto sui due.

Un id che non esiste **ferma la build**. È voluto: una whitelist con un refuso
dentro è una scheda che lo studente non può finire, e va scoperta in build, non
in classe. L'elenco degli id vive in `static/lib/algebra-mosse.json`.

> **Prima di pubblicare un esercizio, giocalo.** Con una whitelist stretta è
> facile togliere senza accorgersene la mossa che serviva a chiudere — tipico:
> l'esercizio finisce con un `2x/2` e manca `normalizza-monomio`.

## Errori tipici

| Sintomo | Causa |
| --- | --- |
| La build si ferma: «manca il traguardo» | Nessuna fra `isola`, `forma`, `libera` nella riga di apertura |
| La build si ferma: «un traguardo solo per blocco» | `isola` e `forma` insieme |
| La build si ferma: «mossa sconosciuta» | Un refuso in `mosse="…"` |
| La build si ferma: «una sola equazione per blocco» | Più di una riga nel corpo |
| Lo studente arriva a una forma giusta e il traguardo non si accende | Quasi sempre una frazione non ridotta, o i termini non ordinati per grado |
| «Non riesco a leggere…» sotto al blocco | L'equazione di partenza è fuori dalla grammatica: spesso una variabile di due lettere (`ab` è `a·b`) |
| L'esercizio si blocca a metà | Una mossa che serviva non è nella whitelist |

---

**Vedi anche**: [espressioni.md](espressioni.md) per sciogliere un'espressione
aritmetica un'operazione per volta · [blocchi.md](blocchi.md) per il reveal a
esercizio finito.

**Nel corso demo**: `content/esempi/content-8.md` — lezione "La lavagna delle
mosse".
