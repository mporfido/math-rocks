> id: testo-e-media
> title: Testo, matematica e media
> description: Le formule, i calcoli che si aggiornano da soli, le immagini e i suggerimenti a scomparsa.

---

> id: matematica
> title: Scrivere una formula

# Tre modi, dal più leggero al più esplicito

**1. Backtick.** Un codice inline diventa una formula *se sembra matematica*:
`x^2 + y^2 = r^2` descrive un cerchio, e se `2x = 10` allora `x = 5`.

Non tutto diventa formula: `metadata.yaml` resta codice, perché non ha nessuno
dei tratti che innescano il riconoscimento.

**2. Dollari singoli.** $\sqrt{2}$ è irrazionale. Da preferire nei contesti
densi — celle di tabella, passi di una dimostrazione — dove l'euristica dei
backtick è meno prevedibile.

**3. Doppi dollari**, per una formula centrata su una riga sua:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

Applicala a `x^2 - 5x + 6 = 0`. La radice minore è [[2]], la maggiore [[3]].

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
Inline automatico:  `x^2 + y^2 = r^2`
Inline esplicito:   $\sqrt{2}$
Display:            $$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$$
```

Il riconoscimento automatico dei backtick scatta su: variabile accanto a un
operatore, esponente numerico, pedice, comando LaTeX, coefficiente attaccato a
una lettera, variabile in una relazione.

MathJax accetta sia LaTeX (`\frac{a}{b}`, `\sqrt{x}`, `\sum_{i=1}^n`) sia
AsciiMath (`a/b`, `sqrt(x)`, `sum_(i=1)^n`).

📖 Riferimento: `docs/matematica.md`

:::

:::div.reveal
Le due radici sono 2 e 3: la loro somma fa 5 (il coefficiente di `x` cambiato di
segno) e il loro prodotto fa 6 (il termine noto).
:::

---

> id: calcoli-live
> title: Calcoli che si aggiornano da soli
> use-mathjs: true

# `${= espressione}`

Un riferimento che comincia per `=` non stampa una variabile: stampa il
**risultato di un'espressione** su di esse, ricalcolato a ogni modifica. Non ha
bottoni di verifica — serve a *far vedere* una relazione, non a correggerla.

Lato del quadrato: ${l}{l|3|1,10,1}

$$\text{perimetro} = 4 \cdot ${l} = ${= 4*l} \qquad \text{area} = ${l}^2 = ${= l*l}$$

Muovi lo slider e guarda le due quantità: il perimetro cresce in modo regolare,
l'area no.

Prova a scrivere tu un valore. Raggio: ${r}{r|2|input}

$$\text{area del cerchio} = \pi r^2 \approx ${= 3.14159*r*r}$$

E con una funzione di mathjs — disponibile perché lo step dichiara
`use-mathjs: true`:

$$\sqrt{${r}} \approx ${= sqrt(r)}$$

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
> use-mathjs: true

Lato: ${l}{l|3|1,10,1}
Raggio: ${r}{r|2|input}

$$\text{perimetro} = 4 \cdot ${l} = ${= 4*l}$$
$$\sqrt{${r}} \approx ${= sqrt(r)}$$
```

Tre forme diverse, da non confondere:

| Scrivi | Ottieni |
| --- | --- |
| `${l}{l\|3\|1,10,1}` | definisce lo **slider** `l` |
| `${l}{l\|3\|input}` | definisce un **campo numerico** digitabile |
| `${l}` | **legge** il valore corrente |
| `${= 4*l}` | **calcola** e mostra il risultato |

Il risultato è arrotondato alla sesta cifra decimale. Finché un campo è vuoto —
o l'espressione non è calcolabile — al suo posto compare la casella `□`.

Le funzioni matematiche (`sqrt`, `sin`, …) richiedono `> use-mathjs: true` nei
metadata dello step: senza, l'espressione vede solo le variabili del modello e
gli operatori aritmetici.

📖 Riferimento: `docs/variabili.md`

:::

Porta il lato a 5: [Verifica]{check: l == 5}

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
Porta il lato a 5: [Verifica]{check: l == 5}
```

A differenza del calcolo live, il bottone `check` **è un goal**: è il modo di
trasformare in esercizio ciò che altrimenti resterebbe esplorativo. Regge più
variabili (`{check: a + b == 6}`) e, con mathjs, le sue funzioni.

📖 Riferimento: `docs/variabili.md`

:::

:::div.reveal
Con lato 5 il perimetro è 20 e l'area 25. Da qui in poi l'area supera il
perimetro, e la distanza fra le due cresce sempre più in fretta.
:::

---

> id: media-e-suggerimenti
> title: Immagini, suggerimenti, blocchi

# Il markdown di tutti i giorni

Titoli, **grassetto**, *corsivo*, ~~barrato~~, `codice inline`, liste:

- Un item
- Un altro
  - Annidato

1. Primo
2. Secondo

E [i link](https://www.markdownguide.org/) come al solito.

## Immagini ridimensionate

Una pipe dopo il testo alternativo fissa la larghezza in pixel (sintassi
Obsidian), utile per non lasciare che uno screenshot occupi tutta la pagina:

```md
![Diagramma|400](immagini/schema.png)        <!-- larghezza 400px -->
![Diagramma|400x300](immagini/schema.png)    <!-- 400×300 -->
```

## Due pannelli a scomparsa, due destinatari

Il pannello che stai aprendo in tutto questo corso — `:::details.syntax-doc` —
parla agli **autori**. Ce n'è un secondo che parla allo **studente**, con uno
stile distinto proprio per non confondersi:

Risolvi: `4x - 7 = 13`, quindi `x =` [[5]]

:::details.hint
<summary>💡 Suggerimento</summary>

Porta prima il termine noto dall'altra parte dell'uguale: `4x = 20`. Poi dividi.

:::

## Blocchi annidati

I blocchi `:::` si annidano: qui un `highlight` dentro un `reveal`, che quindi
compare solo a esercizio risolto.

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

`````md
:::details.hint
<summary>💡 Suggerimento</summary>

Porta prima il termine noto dall'altra parte.

:::

:::div.reveal
  :::div.highlight
  Un blocco dentro l'altro.
  :::
:::
`````

La riga di apertura ha forma `:::tag.classe1.classe2(attributo="valore")`: senza
tag è un `div`, ogni `.nome` diventa una classe. Le classi che fanno qualcosa
sono `.highlight`, `.reveal`, `.syntax-doc` e `.hint`; tutte le altre servono ad
agganciare del CSS tuo.

Nei blocchi di codice la sintassi custom è **letterale** — `[[5]]` e `${a}{…}`
non diventano componenti. È esattamente ciò che permette a questo corso di
documentare sé stesso.

📖 Riferimento: `docs/blocchi.md` · `docs/markdown-base.md`

:::

:::div.reveal
:::div.highlight
🎉 Hai visto tutta la sintassi della piattaforma: strutture, caselle, variabili,
grafici, sketch, espressioni, tabelle, formule, dimostrazioni e testo.

Il riferimento completo è in `docs/` — un file per argomento. Da qui, il posto
da cui partire per un corso tuo è `docs/ricette.md`.
:::
:::
