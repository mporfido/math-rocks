# Espressioni "Sciogliamo i nodi" — `:::expr`

Una sola espressione aritmetica, che lo studente risolve graficamente
un'operazione per volta: clicca l'operatore di un'operazione *riducibile*
(entrambi gli operandi già numerici, rispettando parentesi e precedenza),
inserisce il risultato, e questo "scende" di un livello generando un nodo
dell'albero. A espressione risolta lo step riceve la spunta: **è sempre un goal**.

```markdown
:::expr
(4 + 5*4) - (8:2 + 6)
:::
```

## Il linguaggio dell'espressione

La scrive l'autore, è input fidato.

| Simbolo | Significato |
| --- | --- |
| `+` `-` | addizione, sottrazione |
| `*` (o `×`) | moltiplicazione |
| `:` (o `÷`) | **divisione** |
| `^` | potenza a esponente intero, es. `2^3`, `(-2)^3` |
| `a/b` | **letterale frazione** fra interi (es. `4/3`): un numero atomico, non una divisione |
| `( )` `[ ]` `{ }` | parentesi equivalenti, annidabili |
| `-x` | meno unario / numeri negativi |

> La distinzione fra `:` (divisione) e `a/b` (frazione) è voluta e fedele al
> metodo: la barra è un valore razionale, i `÷`/`:` sono operazioni-nodo.
> L'aritmetica è **esatta**: le frazioni non diventano mai decimali. Lo studente
> inserisce il risultato come intero (`12`) o come frazione (`7/4`).

> **Esponenti.** Un esponente *numerico* è mostrato in apice ed è cliccabile
> (`2³`). Se invece l'esponente è un'**espressione** (es. `2^(3-2)`) si risolve
> come nodo a sé: prima si scioglie l'esponente, poi si clicca `^`.

Esempi:

```markdown
:::expr
(4 + 5) * 4 - 8 : (2 + 6)
:::

:::expr
{(-2)^3 + [2^2 + (5 + 4*3) - 4:2]} + (-2)
:::

:::expr
4/3 + 5/2 * (4/3 - (8/3 : 2/3) + 6/5)
:::
```

## Flag `show-steps` — lo svolgimento classico

Mostra sotto l'albero anche lo svolgimento passo-passo: si parte
dall'espressione intera e, a ogni nodo sciolto, la riga si semplifica
evidenziando brevemente la zona risolta; scendendo di un livello si aggiunge una
riga nuova, con il `=` incolonnato come sul quaderno.

```markdown
:::expr show-steps
(4 + 5) * 4 - 8 : (2 + 6)
:::
```

In modalità potenze lo svolgimento funziona allo stesso modo, ma le righe sono
**cronologiche**: una riga per ogni passaggio dello studente (e *annulla
l'ultimo passaggio* toglie anche l'ultima riga). Lì i livelli dell'albero non
sono fissi — una potenza resta una foglia finché è simbolica — e la catena di
uguaglianze una-per-mossa è comunque il modo in cui le proprietà delle potenze
si scrivono a mano.

## Modalità potenze — `:::powers`

Flag `powers`, oppure l'alias `:::powers`: stesso componente. Le potenze
`base^esp` restano **simboliche** (niente numeroni calcolati) e le operazioni
fra potenze si riducono applicando le **proprietà**.

```markdown
:::powers
7^15 : 7^12
:::
```

| Proprietà | Esempio | Risposta attesa |
| --- | --- | --- |
| prodotto, stessa base | `2^3 * 2^4` | `2^7` |
| quoziente, stessa base | `7^15 : 7^12` | `7^3` |
| potenza di potenza | `(2^3)^2` | `2^6` |
| prodotto, stesso esponente | `2^3 * 5^3` | `10^3` |
| quoziente, stesso esponente | `10^3 : 5^3` | `2^3` |
| numero come potenza | `2 * 2^3` | `2^4` |

Lo studente digita il risultato **in forma di potenza** (`base^esponente`). Se
una forma è ambigua (es. `2^3 * 2^3`) sono accettate tutte le risposte valide
(`2^6` e `4^3`).

Cliccare l'**esponente** di una singola potenza — o l'**etichetta-valore** di un
nodo già risolto in forma di potenza — permette invece di:

- **valutarla** (`2^3` → `8`): è il percorso per i casi senza proprietà;
- **cambiarle base** (`9^3` → `3^6`): serve nei casi a basi riconducibili come
  `9^3 : 3^5`, dove la proprietà scatta solo dopo la riscrittura.

### Flag `no-eval`

Con `:::powers no-eval` la valutazione numerica è **vietata**: resta solo il
cambio di base, e l'esercizio va risolto con le sole proprietà. Serve a
impedire il percorso "calcola tutto" — ma usalo solo su espressioni interamente
risolvibili con le proprietà (niente `+`/`-` fra potenze, che senza valutazione
non si sbloccherebbero mai).

> **Vincoli d'autore in modalità potenze.** La valutazione diretta di una
> potenza è disponibile solo finché il valore resta un intero "esatto" in doppia
> precisione (fino a ~9·10^15: `7^15` sì, `2^60` no); oltre, la potenza si può
> solo riscrivere. Nei corsi sui naturali cura che nei quozienti l'esponente del
> dividendo sia ≥ di quello del divisore.

## Errori tipici

| Sintomo | Causa |
| --- | --- |
| La build si ferma sul blocco | Più di un'espressione nel corpo, o un simbolo fuori dalla tabella qui sopra |
| Un'operazione non è cliccabile | Non è ancora *riducibile*: un operando non è numerico, o ci sono parentesi più interne da sciogliere prima |
| Lo studente resta bloccato con `no-eval` | L'espressione contiene `+`/`-` fra potenze: senza valutazione non si sbloccano |
| `4/3` viene trattato come una divisione | Non succede: la barra è una frazione atomica. Per la divisione usa `:` |

---

**Vedi anche**: [formula.md](formula.md) per commentare una formula già scritta
· [blocchi.md](blocchi.md) per il reveal a esercizio finito.

**Nel corso demo**: `content/esempi/content-3.md` — lezione "Sciogliamo i nodi";
`content/esempi/content-4.md` — lezione "Le proprietà delle potenze".
