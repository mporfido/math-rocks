# Formule matematiche

Il rendering è affidato a **MathJax**. Tre modi di scrivere una formula, dal più
leggero al più esplicito.

## 1. Backtick — matematica automatica

Un codice inline fra backtick singoli viene convertito in formula **se sembra
matematica**:

```markdown
L'equazione `x^2 + y^2 = r^2` descrive un cerchio.
Se `2x = 10`, allora `x = 5`.
```

Il riconoscimento scatta quando il contenuto ha almeno uno di questi tratti:

| Tratto | Esempio |
| --- | --- |
| variabile accanto a un operatore | `a + b`, `x^2` |
| esponente numerico | `2^3` |
| pedice | `x_1` |
| comando LaTeX | `\frac{1}{2}` |
| coefficiente attaccato a una lettera | `2x` |
| variabile in una relazione | `x =`, `n < 10` |

Altrimenti resta codice: `` `metadata.yaml` `` non diventa una formula. È una
comodità di scrittura — quando il risultato non è quello che volevi, passa alla
forma esplicita.

## 2. `$…$` — inline esplicito

```markdown
Il valore di $\sqrt{2}$ è irrazionale.
```

Da preferire nei contesti densi (celle di tabella, passi di una dimostrazione),
dove l'euristica dei backtick è meno prevedibile.

## 3. `$$…$$` — display

Formula centrata, su una riga sua:

```markdown
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

## Sintassi supportata

MathJax accetta sia **LaTeX** che **AsciiMath**:

| LaTeX | AsciiMath | Risultato |
| --- | --- | --- |
| `\frac{a}{b}` | `a/b` | frazione |
| `\sqrt{x}` | `sqrt(x)` | radice quadrata |
| `\sum_{i=1}^n` | `sum_(i=1)^n` | sommatoria |
| `\int_a^b` | `int_a^b` | integrale |
| `x^2` | `x^2` | esponente |

## Variabili dentro le formule

`${nome}` funziona anche dentro il LaTeX: il valore si aggiorna muovendo lo
slider (vedi [variabili.md](variabili.md)).

```markdown
Numeratore: ${n}{n|1|1,10,1}

$$\frac{${n}}{4} = ${= n/4}$$
```

## `use-mathjs` — calcolare, non solo mostrare

MathJax **disegna** le formule; non le calcola. Per valutare espressioni a
runtime — nei calcoli live `${= …}` e nelle condizioni di `[…]{check: …}` —
serve la libreria **mathjs**, che si attiva per step:

```markdown
> id: prova-frazioni
> title: Semplificare frazioni
> use-mathjs: true
```

Senza, l'espressione è valutata in JavaScript puro: vede le variabili del
modello e gli operatori aritmetici, ma non `sqrt`, `sin`, `simplify`, …

Attivalo solo dove serve: è una libreria, e viene caricata per intero.

## Dentro una formula il markdown non entra

Quello che sta fra `$…$`, `$$…$$`, `\(…\)` o `\[…\]` arriva a MathJax
**letterale**: il parser lo mette da parte prima del rendering markdown e ce lo
rimette dopo. Serve perché LaTeX e markdown si contendono gli stessi caratteri,
e senza la protezione vincerebbe il markdown:

| Nella formula | Cosa ne farebbe il markdown |
| --- | --- |
| `x_1`, `\underbrace{…}_{…}`, `\sum_{i=1}` | due `_` = corsivo, e in mezzo ci finisce un `<em>` |
| `a * b * c` | due `*` = corsivo |
| `\;`, `\,`, `\(` | il `\` letto come escape del carattere dopo |

Quindi pedici, spaziature e asterischi si scrivono normalmente, senza
accorgimenti. L'unica cosa che **non** viene protetta è ciò che sta dentro i
backtick o dentro un blocco di codice: lì un `$x_1$` resta sorgente da leggere,
che è esattamente quello che serve quando si mostra la sintassi.

I riferimenti alle variabili continuano a funzionare dentro le formule
(`$$2 \cdot ${x}$$`): diventano marker *prima* della protezione.

## Errori tipici

| Sintomo | Causa |
| --- | --- |
| La formula compare come testo grezzo | Sintassi LaTeX non valida: provala su [MathJax Live Demo](https://www.mathjax.org/#demo) |
| Un `` `nome_file` `` è diventato una formula | Il pedice `_` ha innescato l'euristica: usa `<code>nome_file</code>` o rinomina |
| MathJax non compare dentro un menu a tendina | Voluto: le opzioni di `[[select: …]]` sono testo semplice |
| `${= sqrt(4)}` mostra `□` | Manca `> use-mathjs: true` |

---

**Vedi anche**: [formula.md](formula.md) per commentare una formula con delle
frecce · [variabili.md](variabili.md) per i calcoli live.

**Nel corso demo**: `content/esempi/content-7.md` — step `matematica` e
`calcoli-live`; `content/esempi/content-1.md` — step `prova-frazioni`.
