> id: introduzione
> title: Introduzione ai numeri interi
> description: Perché i numeri naturali non bastano e come nascono i numeri negativi.

---

> id: richiamo-naturali
> title: Ripasso della retta dei naturali

# Da dove partiamo

Prima di aggiungere numeri nuovi, ripassiamo quelli che conosci già: i
**numeri naturali** ($\mathbb{N}$), quelli che servono per contare.

Li possiamo disporre su una **semiretta**: si parte dallo 0 e si va sempre a
destra, un passo (l'**unità**) alla volta.

:::p5 sketch=semiretta-naturali height=200
:::

Passa il dito (o il mouse) sui pallini per rivedere precedente e successivo.

Rispondi usando la semiretta qui sopra:

Il più piccolo dei numeri naturali è: [[0]]

Il successivo di 4 è: [[5]]

Quante unità ci sono tra 0 e 3? [[3]]

Tra 7 e 9, il più grande è quello **più a destra**: [[9]]

:::div.reveal
Perfetto: sulla retta dei numeri, **più a destra = più grande**. Tieni a mente
questa regola, la useremo per tutta la lezione.
:::

---

> id: sotto-zero
> title: Quando lo zero non basta

# Numeri sotto zero

Sulla semiretta dei naturali lo 0 è il **capolinea**: a sinistra non c'è
niente. Ma alcune situazioni della vita reale hanno bisogno di andare
**sotto lo zero**:

- la temperatura scende sotto i 0 °C;
- un ascensore scende ai piani del garage, sotto il piano terra;
- un conto in banca va in rosso: si ha un **debito**.

In tutti questi casi lo 0 non è più "il più piccolo dei numeri": diventa un
**punto di riferimento**, con dei valori anche a sinistra di esso.

:::div.highlight
💡 Un edificio ha 3 piani sopra il piano terra e 2 piani di garage sotto
terra. Se il piano terra è lo **0**, che numero daresti al primo piano di
garage? E al secondo?
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Salendo scrivi 1, 2, 3. Scendendo devi scrivere numeri "dall'altra parte"
dello 0: si usa lo stesso numero con davanti un segno **meno**.

:::

Primo piano di garage: [[-1]]

Secondo piano di garage: [[-2]]

---

> id: gli-interi
> title: L'insieme dei numeri interi

# I numeri interi

I numeri con il segno meno davanti si chiamano **numeri negativi**. Insieme
allo 0 e ai naturali formano i **numeri interi**, che si indicano con
$\mathbb{Z} = \left\lbrace \dots, -3, -2, -1, 0, 1, 2, 3, \dots \right\rbrace$

La semiretta del primo step diventa così una **retta**: non ha più né inizio
né fine, si estende all'infinito in entrambe le direzioni. I passi da un'unità
sono gli stessi di prima, ma ora si contano anche **verso sinistra**.

Qui sotto solo lo 0 è scritto: per trovare gli altri numeri conta le unità a
partire da lui.

:::p5 goal sketch=retta-interi n=5 etichette=zero target=-2 height=180
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Il segno **meno** dice "a sinistra dello 0", il numero dice **quanti passi**.
Quindi -2 sta due tacche a sinistra dello zero.

:::

A sinistra dello zero i numeri sono [[positivi|*negativi]]

---

> id: opposti
> title: Numeri opposti

# Due numeri, la stessa distanza

Come abbiamo appena visto, ogni numero positivo ha un "gemello" a sinistra
dello zero. Il numero `n` e il numero `-n` si trovano alla **stessa distanza
da zero**, uno a destra e uno a sinistra: per questo si dicono **opposti**.

Clicca prima -4 e poi il suo opposto: vedrai che sono simmetrici rispetto
allo 0.

:::p5 goal sketch=retta-interi n=5 target=-4,4 height=180
:::

L'opposto di 5 è: [[-5]]

L'opposto di -3 è: [[3]]

:::details.hint
<summary>💡 Suggerimento</summary>

Per trovare l'opposto non cambia il numero, cambia solo da che parte dello 0
si trova: l'opposto di un negativo è **positivo**.

:::

E l'opposto di 0 qual è? [[0]]

:::div.reveal
Esatto: lo 0 è l'unico numero che coincide con il proprio opposto — sta
esattamente nel mezzo.
:::

---

> id: ordine
> title: Confrontare i numeri interi

# Chi è più grande?

Vale ancora la regola del primo step: **più a destra = più grande**. Con i
negativi però il risultato può sembrare strano, perché tra due numeri
negativi è più grande quello **più vicino allo zero**.

Ad esempio `-2 > -5`, perché -2 è più a destra sulla retta (più vicino allo
zero) di -5.

:::div.highlight
🌡️ Ieri notte la temperatura era di -8 °C, stanotte di -3 °C. Quale delle due
notti è stata più fredda?
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Non guardare il numero senza segno: immagina i due numeri sulla retta e
chiediti quale dei due sta **più a sinistra**. Quello è il più piccolo (e la
notte più fredda).

:::

Confronta: `-2` ... `-5` → usa `>` o `<`: [[>]]

Confronta: `-8` ... `-3` → usa `>` o `<`: [[<]]

Vero o falso? "-10 è più piccolo di -1" [[*Vero|Falso]]

Un numero negativo è sempre [[*minore|maggiore]] di ogni numero positivo.

:::div.reveal
Esatto! Sulla retta dei numeri, più un numero negativo è "lontano" dallo
zero, più è **piccolo**.
:::

---

> id: usi-reali
> title: Gli interi nel mondo reale

# Dove si incontrano

Applichiamo l'ordinamento appena visto a tre situazioni concrete, in cui lo
zero è un punto di riferimento scelto per comodità.

| Contesto | Lo zero è… | Sotto zero significa… |
| --- | --- | --- |
| Termometro | 0 °C (ghiaccio) | freddo pungente |
| Ascensore | piano terra | piani di garage |
| Livello del mare | riva | profondità |

:::details.hint
<summary>💡 Suggerimento</summary>

In tutte e tre le righe della tabella vale la stessa regola: più si scende
sotto lo zero, più il numero diventa **piccolo**. Chi è più vicino allo zero
ha il numero maggiore.

:::

Un termometro segna -6 °C e uno -2 °C: quello che segna la temperatura più
bassa è [[*-6|-2]]

Il piano -3 di un parcheggio è [[*più in basso|più in alto]] del piano -1.

Un sommozzatore a -20 m e uno a -5 m: quello più vicino alla superficie è
[[-5]]

:::div.reveal
Lo zero, qui, non è "il niente": è solo il punto da cui si comincia a
contare, scelto ogni volta in modo diverso.
:::

---

> id: esercizi
> title: Esercizi riassuntivi

# Mettiti alla prova

Un ascensore è al piano 2 e scende di 5 piani. A che piano arriva?

:::details.hint
<summary>💡 Suggerimento</summary>

Parti dal 2 sulla retta e fai 5 passi verso sinistra, contando le tacche una
a una: 1, 0, -1, …

:::

Piano di arrivo: [[-3]]

Un sommozzatore è a -12 metri e risale di 7 metri. A quale profondità si
trova ora?

Profondità: [[-5]]

Ordina dal più piccolo al più grande questi numeri: 3, -4, 0, -1, 2

Il più piccolo è: [[-4]]

Il secondo, subito dopo di lui, è: [[-1]]

Il più grande è: [[3]]

:::div.reveal
# 🎉 Ottimo lavoro!

Hai scoperto come e perché nascono i numeri interi. Nelle prossime lezioni
vedremo come si **sommano** e si **sottraggono**.
:::
