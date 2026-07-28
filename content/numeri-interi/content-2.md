> id: somma-sottrazione
> title: Somma e sottrazione con i gettoni
> description: Dai gettoni blu e rossi alle regole per sommare e sottrarre numeri interi.

---

> id: la-tasca
> title: La tasca dei gettoni

# Un blu e un rosso spariscono

Prima di cominciare, un richiamo dalla lezione scorsa: due numeri **opposti**
stanno alla stessa distanza dallo zero, uno a destra e uno a sinistra.

L'opposto di `-5` è: [[5 || +5]]

Tieni da parte questa parola, **opposto**: è la chiave di tutta la lezione.

Ora guarda che cosa ho in tasca. Due tipi di gettoni:

- un gettone **blu** vale `+1`
- un gettone **rosso** vale `-1`

E c'è una sola regola: **un blu e un rosso, insieme, valgono 0**. Se stanno uno
sopra l'altro, puoi toglierli entrambi senza che il mucchio cambi valore.

Qui sotto il mucchio è già incolonnato: clicca una coppia per farla sparire e
continua finché puoi.

:::p5 goal sketch=gettoni-interi modo=annulla blu=6 rossi=4 height=220
:::

Quanto vale il mucchio quando non ci sono più coppie da togliere? [[2 || +2]]

Proviamo con un altro mucchio:

:::p5 goal sketch=gettoni-interi modo=annulla blu=3 rossi=7 height=220
:::

Quanto vale questo? [[-4]]

:::details.hint
<summary>💡 Suggerimento</summary>

Le coppie non contano niente: quello che decide il valore è **ciò che avanza**.
Se avanzano gettoni rossi, il valore è negativo.

:::

:::div.reveal
Hai appena fatto due **somme** di numeri interi senza saperlo:

$$(+6) + (-4) = +2 \qquad\qquad (+3) + (-7) = -4$$

I gettoni blu sono il numero positivo, i rossi quello negativo. Le coppie che
si annullano sono la parte in comune tra i due numeri: quello che avanza dà al
risultato sia il **valore** sia il **segno**.
:::

---

> id: tanti-modi
> title: Lo stesso valore, mucchi diversi

# Quanti gettoni ho in tasca?

Ti dico che il mio mucchio **vale 3**. Quanti gettoni ho in tasca?

Non c'è una sola risposta: costruisci un mucchio che valga `+3` come preferisci
(il valore aggiornato è scritto in alto a destra).

:::p5 goal sketch=gettoni-interi modo=costruisci valore=3 height=220
:::

Ora premi ↺ e prova a rifarlo in un modo **diverso**: aggiungendo una coppia
blu-rosso il valore [[*non cambia|aumenta|diminuisce]]

E se il mucchio dovesse valere `-4`?

:::p5 goal sketch=gettoni-interi modo=costruisci valore=-4 height=220
:::

:::div.reveal
Con i gettoni non esiste "il" mucchio che vale 3: ne esistono infiniti, perché
puoi sempre aggiungere coppie che valgono 0. Quello che li accomuna è la
**differenza** tra blu e rossi.

Con i numeri: una coppia è `(+1) + (-1) = 0`, e sommare 0 non cambia niente.

$$a + 0 = a \qquad\text{quindi}\qquad +3 = (+4) + (-1) = (+5) + (-2) = \dots$$
:::

---

> id: pezzi-contati
> title: Sei gettoni, valore 2

# Ora i gettoni li conto

Questa volta i vincoli sono due: il mucchio deve valere `+2` **e** deve essere
fatto da esattamente **6 gettoni**.

:::p5 goal sketch=gettoni-interi modo=costruisci valore=2 pezzi=6 height=220
:::

Quanti blu hai usato? [[4]]

Quanti rossi? [[2]]

:::details.hint
<summary>💡 Suggerimento</summary>

I gettoni rossi sono sempre in coppia con altrettanti blu (le coppie che valgono
0), e i blu che avanzano sono il valore. Quindi 6 gettoni = 2 che avanzano + 4
che si annullano a due a due.

:::

:::div.reveal
Con le lettere: se in tasca ci sono `b` gettoni blu e `r` rossi, allora

$$\text{valore} = b - r \qquad\qquad \text{numero di gettoni} = b + r$$

Qui servivano `b - r = 2` e `b + r = 6`: l'unica soluzione è `b = 4`, `r = 2`.
Ecco anche perché con 6 gettoni il valore può essere solo **pari**: le coppie
da 0 consumano i gettoni due alla volta.
:::

---

> id: aggiungere-rossi
> title: Aggiungere gettoni rossi

# Che cosa succede se aggiungo?

Nella tasca ci sono **5 gettoni blu**: il mucchio vale `+5`.

Ci aggiungo **3 gettoni rossi**: fallo tu, poi guarda il valore.

:::p5 goal sketch=gettoni-interi modo=mossa azione=aggiungi colore=rosso quantita=3 blu=5 height=220
:::

Il mucchio ora vale: [[2 || +2]]

Aggiungere un gettone rosso fa [[aumentare|*diminuire]] il valore di 1.

:::div.highlight
Quello che hai fatto si scrive così:

$$(+5) + (-3) = +2$$

**Sommare un numero negativo** vuol dire aggiungere gettoni rossi: il valore
scende. Con le lettere, per qualsiasi `a` e qualsiasi `b` positivo:

$$a + (-b) = a - b$$
:::

---

> id: togliere-rossi
> title: Togliere gettoni rossi

# E se invece li tolgo?

Nella tasca ci sono **8 blu e 3 rossi**: il mucchio vale `+5` (le 3 coppie
valgono 0).

Adesso **tolgo 3 rossi**. Prima di farlo, prova a indovinare: il valore salirà
o scenderà? Poi clicca i gettoni rossi per toglierli.

:::p5 goal sketch=gettoni-interi modo=mossa azione=togli colore=rosso quantita=3 blu=8 rossi=3 coppie=no height=220
:::

Il mucchio ora vale: [[8 || +8]]

Togliere un gettone rosso fa [[*aumentare|diminuire]] il valore di 1.

:::div.reveal
Sorpresa: **togliere** ha fatto **crescere** il mucchio. È logico — hai tolto
gettoni che pesavano verso il basso.

$$(+5) - (-3) = +8$$

Con le lettere, per qualsiasi `a` e qualsiasi `b` positivo:

$$a - (-b) = a + b$$
:::

---

> id: togliere-quel-che-non-ce
> title: Togliere quello che non c'è

# Il caso difficile

Nella tasca ci sono **solo 5 gettoni blu**: il mucchio vale ancora `+5`. Ma
l'istruzione è sempre la stessa: **togli 3 rossi**.

Rossi non ce ne sono. Come fai, senza cambiare il valore del mucchio?

:::details.hint
<summary>💡 Suggerimento</summary>

Hai a disposizione il bottone **"+ coppia che vale 0"**: aggiungere un blu e un
rosso insieme non cambia il valore del mucchio, ma mette in tasca dei rossi da
togliere.

:::

:::p5 goal sketch=gettoni-interi modo=mossa azione=togli colore=rosso quantita=3 blu=5 height=220
:::

Quante coppie hai dovuto aggiungere? [[3]]

Alla fine il mucchio vale: [[8 || +8]]

:::div.reveal
Il risultato è lo stesso di prima: `+8`. Ma ora si vede **perché**: per togliere
3 rossi hai dovuto mettere in tasca 3 blu (i compagni delle coppie), e sono
quelli che restano.

$$(+5) - (-3) = (+5) + (+3) = +8$$

**Togliere 3 rossi** e **aggiungere 3 blu** sono due istruzioni diverse che
fanno la stessa identica cosa a qualsiasi mucchio. Con le lettere, le coppie
aggiunte sono lo 0 che si può sempre sommare:

$$a - (-b) = a + \underbrace{\big[(+b) + (-b)\big]}_{=\ 0} - (-b) = a + b$$
:::

---

> id: togliere-blu
> title: Togliere gettoni blu

# L'ultimo caso

Finora hai sempre spostato gettoni **rossi**: adesso tocca ai **blu**.

In tasca ci sono **2 blu**: il mucchio vale `+2`. L'istruzione è **togli 6 blu**.

Ne mancano quattro, ma ormai sai come procurarteli senza cambiare il valore
del mucchio.

:::p5 goal sketch=gettoni-interi modo=mossa azione=togli colore=blu quantita=6 blu=2 height=220
:::

Quante coppie hai dovuto aggiungere? [[4]]

Il mucchio ora vale: [[-4]]

:::details.hint
<summary>💡 Suggerimento</summary>

Ogni coppia porta in tasca **un blu da togliere** e lascia lì un rosso: sono i
rossi rimasti a rendere negativo il risultato.

:::

:::div.reveal
Togliere blu fa **scendere** il valore, esattamente come aggiungere rossi:

$$(+2) - (+6) = (+2) + (-6) = -4$$

Con le lettere, per qualsiasi `a` e qualsiasi `b` positivo:

$$a - (+b) = a - b$$
:::

---

> id: le-regole
> title: Le regole, in breve

# Dai gettoni alle regole

Tutto quello che hai scoperto sta in due righe.

| Con i gettoni | Con i numeri | Effetto |
| --- | --- | --- |
| aggiungo blu | `+ (+n)` | il valore **sale** di `n` |
| aggiungo rossi | `+ (-n)` | il valore **scende** di `n` |
| tolgo rossi | `- (-n)` | il valore **sale** di `n` |
| tolgo blu | `- (+n)` | il valore **scende** di `n` |

Le due righe centrali dicono la stessa cosa delle due esterne: **sottrarre un
numero equivale a sommare il suo opposto**.

$$a - b = a + (-b)$$

Completa usando la tabella:

`(+7) + (-2) =` [[5 || +5]]

`(-4) + (-3) =` [[-7]]

`(+9) - (+3) =` [[6 || +6]]

`(-1) - (-5) =` [[4 || +4]]

:::details.hint
<summary>💡 Suggerimento</summary>

Riscrivi prima ogni sottrazione come somma dell'opposto, poi immagina i gettoni:
i due segni uguali si sommano, i due segni diversi si annullano a coppie e
sopravvive il colore più numeroso.

:::

:::div.reveal
Riassunto in una frase: **due segni uguali sommano, due segni diversi
sottraggono e vince il più forte** (cioè il colore che avanza).
:::

---

> id: esercizi
> title: Esercizi

# Mettiti alla prova

Sciogli l'espressione un'operazione alla volta:

:::expr show-steps
(-8) + 5 - (-4)
:::

Un'altra, con le parentesi:

:::expr
[(-3) - (-7)] + [2 - 9]
:::

Ora tocca a te, senza gettoni:

`(-12) - (-12) =` [[0]]

`(+2) - (+6) =` [[-4]]

Un ascensore è al piano `-3` e sale di 5 piani. A che piano arriva? [[2 || +2]]

Stanotte la temperatura è scesa da `-2` °C a `-9` °C: di quanti gradi è scesa?
[[7 || -7 || +7]]

:::div.reveal
# 🎉 Ottimo lavoro!

Sai sommare e sottrarre numeri interi — e soprattutto sai **perché** funziona:
dietro ogni regola sui segni ci sono dei gettoni che si annullano a coppie.
:::
