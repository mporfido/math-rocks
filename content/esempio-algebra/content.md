> id: intro
> title: Benvenuto all'Algebra

# Benvenuto all'Algebra!

L'algebra è un ramo della matematica che usa **lettere** e **simboli** per rappresentare numeri e relazioni. È uno strumento potente che ti permetterà di risolvere problemi complessi in modo elegante.

## Il tuo primo esercizio

Iniziamo con qualcosa di semplice. Se `2x = 10`, quale sarà il valore di `x`?

Risposta: `x =` [[5]]

:::div.reveal
Perfetto! Hai risolto la tua prima equazione. Quando `2x = 10`, dividiamo entrambi i lati per 2 e otteniamo `x = 5`.
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
Risposta: `x =` [[5]]

:::div.reveal
Questo contenuto appare quando tutti i goal dello step sono completati.
:::
```

:::

---

> id: equazioni-base
> title: Equazioni di Base

# Risolvere Equazioni

Un'equazione è come una bilancia: quello che fai da una parte, devi farlo anche dall'altra per mantenere l'equilibrio.

## Esercizio 1: Addizione

Risolvi: `x + 3 = 8`

Soluzione: `x =` [[5]]

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
Soluzione: `x =` [[5]]
```

:::

## Esercizio 2: Sottrazione

Risolvi: `y - 4 = 10`

Soluzione: `y =` [[14]]

## Esercizio 3: Scelta multipla

Quale operazione useresti per risolvere `3x = 15`?

[[Addizione|Sottrazione|Moltiplicazione|*Divisione]]

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
[[Addizione|Sottrazione|Moltiplicazione|*Divisione]]
```

La risposta corretta è indicata con `*`; senza asterisco vale la prima opzione.

:::

## Esercizio 4: Completamento inline (menu a tendina)

Completa la frase scegliendo dal menu: per isolare `x` in `x + 3 = 10` devi [[select: sommare|*sottrarre|moltiplicare]] 3 a entrambi i membri.

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
... devi [[select: sommare|*sottrarre|moltiplicare]] 3 ...
```

Il prefisso `select:` rende la scelta multipla come **menu a tendina inline** nel testo, invece dei bottoni. La corretta si marca con `*` come al solito. Le opzioni sono testo semplice (niente formule LaTeX dentro il menu).

:::

:::div.reveal
Eccellente! Hai completato tutti gli esercizi di base. Ora sei pronto per qualcosa di più interattivo!
:::

---

> id: variabili-interattive
> title: Variabili Interattive

# Giocare con le Variabili

Ora esploriamo come le variabili cambiano le equazioni. Prova a muovere lo slider per modificare il valore di `a`:

Valore di `a`: ${a}{a|2|-5,5,1}

## L'equazione cambia!

Con il valore corrente di `a`, l'equazione diventa:

`x^2 + ${a}x + 4 = 0`

Osserva come cambia l'equazione quando modifichi il valore dello slider!

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
Valore di `a`: ${a}{a|2|-5,5,1}

`x^2 + ${a}x + 4 = 0`
```

Formato slider: `${display}{bind|iniziale|min,max,step}`. Un semplice `${a}` nel testo è un riferimento che si aggiorna in tempo reale.

:::

:::div.highlight
💡 **Suggerimento**: Questa è un'equazione quadratica. Le soluzioni dipendono dal valore di `a`!
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::div.highlight
💡 **Suggerimento**: Questa è un'equazione quadratica. Le soluzioni dipendono dal valore di `a`!
:::
```

:::

## Prova tu

Ora prova con un'altra variabile `b`:

Valore di `b`: ${b}{b|1|-3,3,0.5}

L'equazione lineare è: `2x + ${b} = 10`

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
Valore di `b`: ${b}{b|1|-3,3,0.5}

L'equazione lineare è: `2x + ${b} = 10`
```

Lo step dello slider può essere decimale (qui `0.5`).

:::

:::div.reveal
Fantastico! Hai esplorato come le variabili rendono l'algebra dinamica e potente. Continua così!
:::

---

> id: sfida-finale
> title: Sfida Finale

# Metti alla Prova le tue Abilità

Ora combiniamo tutto quello che hai imparato!

## Problema 1

Se `5x - 3 = 17`, qual è il valore di `x`?

Risposta: `x =` [[4]]

## Problema 2

Quale delle seguenti è una soluzione di `x^2 = 16`?

[[2|3|*4|5]]

## Problema 3

Usa lo slider per trovare il valore di `k` che rende vera l'equazione `3k + 7 = 16`:

Valore di `k`: ${k}{k|0|0,10,1}

:::details.syntax-doc
<summary>📝 Mostra la sintassi dello step</summary>

```md
Risposta: `x =` [[4]]

[[2|3|*4|5]]

Valore di `k`: ${k}{k|0|0,10,1}
```

:::

:::div.reveal
# 🎉 Congratulazioni!

Hai completato il corso di Introduzione all'Algebra! Ora conosci:

- Come risolvere equazioni semplici
- Il concetto di variabili
- Come lavorare con equazioni interattive

**Prossimi passi**: Esplora corsi più avanzati sulla geometria o il calcolo!
:::

---

> id: prova-frazioni
> title: Semplificare frazioni con mathjs
> use-mathjs: true

# Frazioni ridotte ai minimi termini

Numeratore: ${n}{n|4|1,20,1}
Denominatore: ${d}{d|8|1,20,1}

Frazione: ${n}/${d}

Frazione con latex: $\frac{${n}}{${d}}$

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
> id: prova-frazioni
> title: Semplificare frazioni con mathjs
> use-mathjs: true

Numeratore: ${n}{n|4|1,20,1}
Denominatore: ${d}{d|8|1,20,1}

Frazione: ${n}/${d}

Frazione con latex: $\frac{${n}}{${d}}$
```

Il metadato **use-mathjs: true** abilita la valutazione delle espressioni con mathjs; i riferimenti `${n}` funzionano anche dentro le formule LaTeX.

:::

