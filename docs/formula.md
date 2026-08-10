# Formula commentata — `:::formula`

Una formula LaTeX in cui `@nome{…}` marca i pezzi da collegare, una riga vuota,
poi una riga per freccia. Serve quando una formula non si spiega leggendola da
sinistra a destra, ma mostrando **che cosa corrisponde a che cosa** fra i due
lati dell'uguale.

```markdown
:::formula
@b1{2}^{@e1{-n}} = \left(@b2{\tfrac{1}{2}}\right)^{@e2{n}}

b1 -> b2 : reciproco
e1 -> e2 : cambia segno
:::
```

A riposo le frecce e i commenti si vedono tutti, tenui. Toccandone uno (o
passandoci sopra, o arrivandoci col TAB) restano a fuoco solo quella freccia, il
suo commento e i suoi due estremi nella formula; gli altri si smorzano. Funziona
anche al contrario: si può passare su un simbolo della formula.

**Non è un esercizio**: non ha id e non conta come goal dello step.

## I pezzi

| Pezzo | Significato |
| --- | --- |
| `@nome{…}` | marca una sotto-espressione: è un estremo di freccia. Le graffe possono essere annidate (`@b{\frac{1}{2}}`) |
| `da -> a : commento` | una freccia dall'ancoraggio `da` a quello `a`, con la sua etichetta |
| `… \| sopra` / `… \| sotto` | forza il lato da cui passa la freccia |

Senza indicazione il lato è automatico: la freccia passa **sopra** solo se
entrambi gli estremi stanno nella metà alta della formula (cioè se sono
esponenti), altrimenti **sotto**. Frecce dello stesso lato che si sovrappongono
finiscono su corsie diverse, distanziate quanto basta ai loro commenti.

## Struttura del blocco

1. La formula, anche su più righe (vengono unite con uno spazio).
2. Una **riga vuota** — obbligatoria.
3. Una freccia per riga.

> ⚠️ Nel blocco non può comparire una riga `---` (separerebbe gli step), e la
> riga vuota fra formula e frecce è obbligatoria: senza, la build si ferma. Si
> ferma anche se una freccia cita un ancoraggio che non esiste o se due
> ancoraggi hanno lo stesso nome — sono i modi tipici di ritrovarsi una freccia
> mancante senza accorgersene.

## Errori di build

| Errore | Perché |
| --- | --- |
| `manca la riga vuota` | Formula e frecce non sono separate |
| `ancoraggio non trovato` | Una freccia cita un `@nome` che non esiste (o è scritto diverso) |
| `ancoraggio duplicato` | Due `@nome{…}` con lo stesso nome: non si saprebbe a quale attaccare la freccia |
| `graffa non chiusa` | Le graffe di `@nome{…}` devono bilanciarsi, comprese quelle annidate |

---

**Vedi anche**: [matematica.md](matematica.md) per il LaTeX di base ·
[espressioni.md](espressioni.md) se invece la formula va *risolta* e non
commentata.

**Nel corso demo**: `content/esempi/content-5.md` — step `formula-commentata`.
