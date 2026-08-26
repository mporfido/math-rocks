# Smistare in categorie — `:::smista`

Un mazzo di cartellini e dei contenitori in cui metterli. È il gesto di chi ha
in mano un gruppo di oggetti matematici e li raggruppa: *quali di queste sono
monomi?*, *raggruppale per grado*, *quali frazioni sono equivalenti?*.

```markdown
:::smista goal categorie="monomio;binomio;trinomio"
3x^2y       -> monomio
2a + b      -> binomio
x^2 + x + 1 -> trinomio
-5          -> monomio
:::
```

Il corpo è **LaTeX**, una riga per cartellino; dopo la freccia sta il
contenitore in cui il cartellino deve finire.

Con il flag `goal` è un **esercizio**: lo step non si chiude finché ogni
cartellino non è al suo posto. Senza `goal` (e con `verdetto=no`) è uno
smistamento **libero**, che non blocca niente.

## Le opzioni

| Opzione | Significato |
| --- | --- |
| `goal` | Flag: rende lo smistamento un goal dello step |
| `categorie="a;b;c"` | Contenitori e loro **ordine**. Se manca, si deducono dal corpo nell'ordine di apparizione |
| `verdetto=no` | Nessun controllo: smistamento libero. Non è mai un goal |
| `mescola=no` | I cartellini restano nell'ordine del markdown (default: mescolati) |
| `titolo="..."` | Intestazione sopra il mazzo |

Le etichette dei contenitori sono testo (possono contenere `$…$`) e si separano
con `;`. Se contengono spazi vanno fra virgolette — che è quasi sempre il caso:
`categorie="grado 1;grado 2"`.

## Le due modalità

### Con verifica (`goal`)

C'è un bottone **Controlla**, che resta spento finché il mazzo non è vuoto (e
intanto dice quanti cartellini mancano). Alla verifica i cartellini al posto
giusto restano dove sono; gli altri **tornano nel mazzo**.

Il feedback è deliberatamente neutro — niente rosso, nessun cartellino additato:
si legge *quanti* sono a posto, non *quali* no. È la stessa scelta degli sketch
p5 della piattaforma, e il motivo è didattico: chi vede segnati i propri errori
smette di guardare il criterio e comincia a tirare a indovinare.

### Libero (`verdetto=no`)

Nessun bottone, nessuna soluzione, nessun goal: i cartellini si spostano e basta.
Serve **in apertura di lezione**, quando i gruppi non hanno ancora un nome:

```markdown
:::smista verdetto=no categorie="Gruppo A;Gruppo B;Gruppo C" titolo="Raggruppale come ti sembra giusto"
3x^2
x^2 + 5
2x^3 - x + 7
:::
```

Il criterio lo trova lo studente, e la domanda che segue (di solito un
`[[select: …]]`) gliene chiede conto. Quello step ha bisogno di **un altro goal**
per potersi chiudere: uno smistamento libero da solo non ne è uno.

## Contenitori vuoti

Una categoria dichiarata in `categorie=` ma che nessun cartellino richiede resta
lì, vuota. Non è un errore: è una domanda in più — *ce n'è davvero nessuno di
grado 3?* — e va dichiarata esplicitamente, perché dal corpo non si dedurrebbe.

## Come si muove un cartellino

Tre strade, sempre tutte e tre attive:

1. **trascinandolo** (mouse o dito: un solo gesto per entrambi);
2. **toccandolo e poi toccando il contenitore** — la via comoda su telefono,
   dove trascinare dentro un riquadro stretto non è pratico. Toccare il mazzo
   rimanda indietro il cartellino selezionato;
3. **da tastiera**: TAB fino al cartellino, `Invio` per prenderlo, i tasti
   `1`…`9` per metterlo nel contenitore n-esimo (il numero è scritto sulla sua
   intestazione), `0` o `Esc` per rimandarlo nel mazzo.

Su schermo stretto i contenitori si impilano in colonna.

## Errori di build

| Messaggio | Causa |
| --- | --- |
| `categoria sconosciuta` | Un cartellino cita un contenitore assente da `categorie=` (di solito un refuso: `monomi` per `monomio`). Senza il controllo l'esercizio sarebbe irrisolvibile |
| `manca la categoria` | Con `goal`, un cartellino senza `-> categoria` |
| `si escludono` | `goal` insieme a `verdetto=no`: un goal che non verifica niente non si completerebbe mai |
| `almeno due categorie` | Un solo contenitore non è una classificazione |
| `nessun cartellino` | Corpo vuoto |

> ⚠️ Nel blocco non può comparire una riga `---`: separerebbe gli step.

---

**Vedi anche**: [blanks.md](blanks.md) quando la domanda ha una risposta sola ·
[tabelle.md](tabelle.md) se le categorie sono colonne di una tabella da
compilare · [blocchi.md](blocchi.md) per il `.reveal` che si apre a smistamento
finito.

**Nel corso demo**: `content/esempi/content-1.md` — step `smistamento`.
