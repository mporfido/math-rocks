> id: scala-delle-potenze
> title: La scala delle potenze
> description: Dalla scala che scende agli esponenti negativi, ai gradini a metà, fino a una curva senza buchi.

---

> id: la-scala
> title: Esponenti negativi

# La calcolatrice sa una cosa che noi non sappiamo

Digita sulla calcolatrice scientifica $2^{\pi}$. Risponde: **8,82497782...**.

Ma $2^3$ vuol dire "2 moltiplicato per sé stesso 3 volte". E allora $2^{3,14}$ che cosa sarebbe? 2 moltiplicato per sé stesso **tre virgola quattordici volte**? Non ha senso — eppure la calcolatrice una risposta ce l'ha, e non è a caso.

Per capire che cosa sta calcolando, cominciamo da una scala.

:::table
| Potenza | Valore |
| ------- | ------ |
| $2^4$   | 16     |
| $2^3$   | 8      |
| $2^2$   | 4      |
| $2^1$   | 2      |
:::

Guarda la colonna dei valori dall'alto verso il basso: da un gradino al successivo il valore [[select: si raddoppia|*si dimezza|si abbassa di 2|si divide per l'esponente]].

Dimezzare vuol dire **dividere per 2**. Segniamo questa operazione con una freccia a lato: dice che cosa fare a un gradino per ottenere quello **sotto**.

## Continua a scendere

Non fermarti a $2^1$: **la regola vale ancora**. Segui le frecce e completa i gradini che mancano.

*(Scrivi i valori come frazione, per esempio `1/8`.)*

:::table
| Potenza  | Valore  | v : 2 |
| -------- | ------- | ----- |
| $2^1$    | 2       |
| $2^0$    | [[1]]   |
| $2^{-1}$ | [[1/2]] |
| $2^{-2}$ | [[1/4]] |
| $2^{-3}$ | [[1/8]] |
:::

:::div.reveal
**Guarda che cosa è successo.**

Nessuno ha *deciso* che $2^0 = 1$: è l'unico valore che permette alla regola di continuare. Lo stesso vale per gli esponenti negativi, che pure non contano più nessuna moltiplicazione ripetuta:

$$2^{-n} = \frac{1}{2^n}$$

Un **esponente negativo** non è un mostro: è semplicemente il posto che quel gradino occupa **sotto** $2^0$, se vogliamo che la scala scenda sempre con lo stesso passo.

Tieni a mente questo criterio, perché lo useremo per tutto il resto della lezione: *ogni nuovo esponente prende il valore che tiene in piedi la regola*.
:::

---

> id: altre-basi
> title: Cambiamo la base

# La scala non è una proprietà del 2

Se questa cosa funziona solo con la base 2, allora non è molto interessante. Proviamo a vedere con altre basi.

## Base 3

Qui, scendendo di un gradino, il valore si divide per [[3]].

*(Scrivi sempre i valori come frazione, per esempio `1/8`.)*

:::table
| Potenza  | Valore  | v : 3 |
| -------- | ------- | ----- |
| $3^2$    | 9       |
| $3^1$    | 3       |
| $3^0$    | [[1]]   |
| $3^{-1}$ | [[1/3]] |
| $3^{-2}$ | [[1/9]] |
:::

## Base 10

Senza scrivere la tabella: $10^{-3} =$ [[1/1000]]

## Base $\frac{1}{2}$

E se la base è **più piccola di 1**? Qui scendendo di un gradino si divide per $\frac{1}{2}$, cioè si [[select: dimezza|*raddoppia|toglie 2]].

:::table
| Potenza                         | Valore | v : 1/2 |
| ------------------------------- | ------ | ------- |
| $\left(\frac{1}{2}\right)^{2}$  | 1/4    |
| $\left(\frac{1}{2}\right)^{1}$  | 1/2    |
| $\left(\frac{1}{2}\right)^{0}$  | [[1]]  |
| $\left(\frac{1}{2}\right)^{-1}$ | [[2]]  |
| $\left(\frac{1}{2}\right)^{-2}$ | [[4]]  |
:::

Guarda le frecce delle tre tabelle: portano sempre **la base**. Scendere di un gradino vuol dire dividere per la base — anche quando la base è minore di 1 e dividere, invece di rimpicciolire, ingrandisce.

:::div.reveal
**Due cose da portare via.**

1. La scala di $\frac{1}{2}$ è **la scala di 2 capovolta**: dove una sale, l'altra scende. In formula:

:::formula
@b1{2}^{@e1{-n}} = \left(@b2{\tfrac{1}{2}}\right)^{@e2{n}}

b1 -> b2 : reciproco
e1 -> e2 : cambia segno
:::

2. Qualunque sia la base $a$ (purché non sia zero), $a^0 = 1$ e 

:::formula
@b1{a}^{@e1{-n}} = \left(@b2{\tfrac{1}{a}}\right)^{@e2{n}} = \frac{1}{a^n}

b1 -> b2 : reciproco
e1 -> e2 : cambia segno
:::

Non l'ha deciso nessuno: è l'unico modo di far funzionare la scala.

Cambiare la base con il suo reciproco equivale a cambiare segno all'esponente. Ce ne ricorderemo alla fine, quando queste scale diventeranno delle curve.
:::

---

> id: mezzo-gradino
> title: Esponenti razionali

# Infilare un gradino in mezzo

Finora la scala ha gradini solo sugli esponenti interi. Tra $2^0 = 1$ e $2^1 = 2$ **non c'è niente**: è un salto.

Proviamo a metterci in mezzo un gradino nuovo. Non uno qualsiasi: perché resti una scala, tutte le frecce devono portare **la stessa etichetta** — si scende ogni volta dividendo per lo stesso fattore. Chiamiamolo $k$.

:::table
| v : 2 | Potenza          | Valore | v : $k$ |
| ----- | ---------------- | ------ | ------- |
|       | $2^1$            | 2      |
| ~     | il gradino nuovo | ?      |
|       | $2^0$            | 1      |
:::

A sinistra c'è la freccia che conosci già: il gradino intero da $2^1$ a $2^0$ divide per 2. A destra ci sono i due mezzi gradini nuovi, che devono dividere per $k$ ciascuno.

:::div.highlight
Le due frecce di destra insieme devono fare quello che fa la freccia di sinistra: partendo da 2 e dividendo **due volte** per $k$ devi arrivare a 1.

$$2 : k : k = 1 \qquad \text{cioè} \qquad \frac{2}{k^2} = 1 \qquad \text{cioè} \qquad k^2 = 2$$

Attenzione: qui $k$ non è più 2. Scendere di **mezzo** gradino divide per meno di quanto divida un gradino intero.
:::

Trova tu il fattore. Scrivi un numero: il suo quadrato si aggiorna mentre digiti, senza bisogno di verificare niente. Guarda quanto dista da 2 e correggi.

Il mio fattore: ${k}{k|1|input}

$$k \cdot k = ${k} \cdot ${k} = ${= k*k}$$

Quando il quadrato è abbastanza vicino a 2, fissa il risultato.

[Controlla il fattore]{check: (k*k - 2)*(k*k - 2) < 0.000025}

:::details.hint
<summary>💡 Suggerimento</summary>

Con una cifra decimale non ci arrivi: $1{,}4 \cdot 1{,}4 = 1{,}96$, troppo poco, mentre $1{,}5 \cdot 1{,}5 = 2{,}25$, troppo. Il numero che cerchi sta in mezzo — servono **tre** cifre decimali.

:::

Questo numero ha un nome che conosci già: è [[$1{,}5$|*$\sqrt{2}$|$\frac{2}{2}$|$2^2$]]

:::div.reveal
**Il gradino di mezzo è $\sqrt{2} \approx 1{,}414$.**

E che etichetta gli diamo? Se lo chiamiamo $2^{?}$, il suo esponente deve stare **a metà** tra 0 e 1, esattamente come il gradino sta a metà tra $2^0$ e $2^1$:

$$2^{\frac{1}{2}} = \sqrt{2}$$

Ecco la tabella completata:

:::table
| v : 2 | Potenza           | Valore                     | v : $\sqrt{2}$ |
| ----- | ----------------- | -------------------------- | -------------- |
|       | $2^1$             | 2                          |
| ~     | $2^{\frac{1}{2}}$ | $\sqrt{2} \approx 1{,}414$ |
|       | $2^0$             | 1                          |
:::

Ecco la seconda scoperta della lezione: **un esponente frazionario è una radice**. E non perché qualcuno l'abbia deciso, ma perché $2^{\frac12}$ è l'unico numero che, moltiplicato per sé stesso, dà $2^1$:

$$2^{\frac12} \cdot 2^{\frac12} = 2^{\frac12 + \frac12} = 2^1$$

La regola delle potenze — "si moltiplica, si sommano gli esponenti" — continua a funzionare. È sempre lei che comanda.
:::

---

> id: gradini-piu-fitti
> title: Gradini più fitti

# Dimezzare ancora

Se ha funzionato una volta, funziona sempre: infiliamo un gradino a metà tra $2^0$ e $2^{\frac12}$, poi a metà ancora, e la scala si infittisce.

Il gradino a metà tra $2^0$ e $2^{\frac12}$ porta l'etichetta $2^{\frac14}$, e il suo valore è [[$\sqrt{2}$|*$\sqrt{\sqrt{2}}$|$\frac{\sqrt{2}}{2}$]]
cioè $\sqrt[4]{2}$

Con lo stesso ragionamento, per un esponente frazionario qualsiasi:

:::formula
@b1{a}^{\frac{@n1{m}}{@d1{n}}} = \sqrt[@d2{n}]{@b2{a}^{@n2{m}}}

b1 -> b2 : base
n1 -> n2 : numeratore | sopra
d1 -> d2 : denominatore
:::

## Prova a usarla

Il denominatore dell'esponente dice **che radice**, il numeratore dice **che potenza**. E gli esponenti negativi continuano a significare "reciproco".

:::formula
@b1{2}^{\frac{@n1{3}}{@d1{2}}} = \sqrt[@d2{\,}]{@b2{2}^{@n2{3}}}

b1 -> b2 : base
n1 -> n2 : numeratore | sopra
d1 -> d2 : denominatore
:::

| Potenza | Vale |
| ------- | ---- |
| $2^{\frac{3}{2}}$ | [[*$\sqrt{8}$|$\sqrt{3}$|$3\sqrt{2}$]] |
| $9^{\frac{1}{2}}$ | [[9|*3|4,5|81]] |
| $8^{\frac{1}{3}}$ | [[8/3|*2|4|24]] |
| $2^{-\frac{1}{2}}$ | [[$-\sqrt{2}$|*$\frac{1}{\sqrt{2}}$|$\sqrt{-2}$]] |

:::div.reveal
**La scala adesso è fitta.**

Con gli esponenti frazionari possiamo mettere un gradino su **ogni numero razionale**: $\frac12$, $\frac14$, $\frac{3}{2}$, $-\frac{5}{7}$, $\frac{127}{1000}$…

E i razionali sono **densi**: tra due qualsiasi di essi ce n'è sempre un altro. Non esiste più il "gradino successivo" — per quanto due gradini siano vicini, tra loro ce ne stanno infiniti altri.

La scala sta diventando qualcos'altro. Ma prima di dirlo, conviene controllare che non stia crollando.
:::

---

> id: verifica-coerenza
> title: Il sistema regge?

# Tre strade, un solo risultato

Abbiamo allargato il significato di "potenza" due volte (esponenti negativi, poi frazionari) tenendo ferme le regole. Se il risultato dipendesse dalla strada scelta per calcolarlo, avremmo costruito una cosa inutile.

Mettiamolo alla prova con $8^{\frac{2}{3}}$, per tre vie diverse:

- **prima la radice, poi il quadrato:** $\left(\sqrt[3]{8}\right)^2 = 2^2 = \ldots$
- **prima il quadrato, poi la radice:** $\sqrt[3]{8^2} = \sqrt[3]{64} = \ldots$
- **riscrivendo la base:** $8 = 2^3$, quindi $8^{\frac23} = \left(2^3\right)^{\frac23} = 2^{3 \cdot \frac23} = 2^2 = \ldots$

Le tre strade danno tutte: [[4]]

## Altri controlli

| Espressione | Valore |
| ----------- | ------ |
| $4^{\frac{1}{2}}$ (e $4 = 2^2$, quindi deve fare $2^1$) | [[2]] |
| $16^{\frac{3}{4}}$ | [[8]] |
| $9^{-\frac{3}{2}}$ | [[1/27]] |

:::div.reveal
**Regge.**

Non è un caso fortunato: è la conseguenza del fatto che abbiamo esteso le potenze **imponendo** che le loro proprietà restassero vere. Ogni volta che una definizione si allarga in matematica, la domanda giusta è esattamente questa: *le regole di prima valgono ancora, e il risultato è lo stesso comunque lo si calcoli?*

Qui la risposta è sì. Restano fuori due casi, e ce ne occupiamo tra poco.
:::

---

> id: esponente-irrazionale
> title: Un esponente che non è una frazione

# E allora $2^{\sqrt{2}}$?

$\sqrt{2}$ non è una frazione: il suo sviluppo decimale $1{,}41421356\ldots$ non finisce e non si ripete. Nessuna delle regole di prima ci dice quanto vale $2^{\sqrt{2}}$: non c'è una radice da estrarre, non c'è una potenza da fare.

Però possiamo **avvicinarci approssimando**. Ognuno di questi esponenti è un decimale finito, quindi una frazione, quindi lo sappiamo calcolare:

| Potenza | Valore |
| ------- | ------ |
| $2^{1{,}4} = 2^{\frac{14}{10}} = \sqrt[10]{2^{14}}$ | 2,63901… |
| $2^{1{,}41} = 2^{\frac{141}{100}} = \sqrt[100]{2^{141}}$ | 2,65737… |
| $2^{1{,}414} = 2^{\frac{1414}{1000}} = \ldots$ | 2,66474… |
| $2^{1{,}4142} = \ldots$ | 2,66511… |
| $2^{1{,}41421} = \ldots$ | 2,665137… |

I valori sono in ordine [[*crescente|decrescente|casuale]], e si stringono attorno a un unico numero.

Fissiamo un valore per $2^{\sqrt{2}}$: quale, tra questi, è l'unico compatibile con la tabella?

[[2,5|2,66|*2,665144…|2,83]]

## Torniamo alla calcolatrice

Ora la domanda dell'inizio: quanto vale $2^{\pi}$? Non c'è modo di calcolarlo di colpo, ma possiamo **incastrarlo**. Di $\pi = 3{,}14159\ldots$ conosciamo quante cifre vogliamo, e ogni troncatura è un decimale finito: una potenza che sappiamo fare.

Siccome le potenze di base 2 crescono, se $\pi$ sta fra due esponenti allora $2^{\pi}$ sta fra le due potenze corrispondenti. Stringiamo l'intervallo un decimale alla volta: con la calcolatrice, riga per riga.

:::div.highlight
**Come scrivere i valori:** sempre con **quattro cifre dopo la virgola**, in tutte le caselle. Per esempio `8,5742`. La prima riga è l'unica con risultati interi.
:::

:::table
| $\pi$ è compreso fra    | $2^{\pi}$ è più di…                                                  | …ed è meno di                                                        |
| ----------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| $3$ e $4$               | $2^{3} =$ [[8]]                                                      | $2^{4} =$ [[16]]                                                     |
| $3{,}1$ e $3{,}2$       | $2^{3{,}1} \approx$ [[8,5742 || 8.5742 || 8,5741 || 8.5741]]          | $2^{3{,}2} \approx$ [[9,1896 || 9.1896 || 9,1895 || 9.1895]]          |
| $3{,}14$ e $3{,}15$     | $2^{3{,}14} \approx$ [[8,8152 || 8.8152]]                            | $2^{3{,}15} \approx$ [[8,8766 || 8.8766 || 8,8765 || 8.8765]]         |
| $3{,}141$ e $3{,}142$   | $2^{3{,}141} \approx$ [[8,8214 || 8.8214 || 8,8213 || 8.8213]]        | $2^{3{,}142} \approx$ [[8,8275 || 8.8275 || 8,8274 || 8.8274]]        |
| $3{,}1415$ e $3{,}1416$ | $2^{3{,}1415} \approx$ [[8,8244 || 8.8244]]                          | $2^{3{,}1416} \approx$ [[8,8250 || 8.8250 || 8,825 || 8.825]]         |
:::

La colonna di sinistra [[select: *sale|scende|resta ferma]], quella di destra [[select: sale|*scende|resta ferma]], e la forbice si chiude.

Dopo l'ultima riga sappiamo che $8{,}8244 < 2^{\pi} < 8{,}8250$: le cifre che le due colonne hanno ormai in comune, e che nessuna riga successiva potrà più cambiare, sono [[8,8|*8,82|8,824|8,8249]].

E la calcolatrice, all'inizio, che cosa aveva risposto? $2^{\pi} = 8{,}82497\ldots$ — un numero che cade [[select: *dentro l'ultimo intervallo|sopra l'ultimo intervallo|sotto l'ultimo intervallo]]. Non è una coincidenza: la calcolatrice non conosce nessun trucco che noi non abbiamo usato. Fa esattamente questo, solo con più cifre.

:::div.reveal
**Che cos'è, allora, $2^{\sqrt{2}}$?**

Non è il risultato di una moltiplicazione ripetuta, e non è nemmeno una radice. È **il numero a cui si avvicinano le potenze a esponente razionale** man mano che l'esponente si avvicina a $\sqrt{2}$.

Questa è l'idea più importante della lezione, e la ritroverai identica in analisi: quando una definizione non si può *estendere* per calcolo diretto, la si estende **per approssimazione**, chiedendo che il risultato non faccia salti.

Da qui in poi: $2^x$ ha un valore per **ogni** numero reale $x$.
:::

---

> id: base-negativa
> title: Dove la scala si rompe

# I casi da buttare

Abbiamo costruito $a^x$ per ogni $x$ reale. Ma per **quali basi** $a$? Finora ne abbiamo usate solo di positive. Vediamo che succede alle altre.

## Base negativa

Prendiamo $a = -8$.

- $(-8)^{\frac{1}{3}} = \sqrt[3]{-8} =$ [[-2]] ← questa sembra funzionare
- $(-8)^{\frac{1}{2}} = \sqrt{-8}$: nessun numero reale al quadrato dà $-8$. [[*Non esiste|Fa -4|Fa 4]]

Già così è un disastro: la scala con base $-8$ avrebbe dei **buchi**, gradini presenti su alcuni esponenti e assenti su altri. Ma c'è di peggio. La frazione $\frac13$ si può scrivere anche $\frac{2}{6}$, e le due strade devono dare lo stesso risultato:

$$(-8)^{\frac{2}{6}} = \sqrt[6]{(-8)^2} = \sqrt[6]{64} = 2 \qquad \text{ma} \qquad (-8)^{\frac{1}{3}} = -2$$

Stesso esponente, due risultati diversi: [[select: è solo un caso strano|*la definizione si contraddice|dipende dalla calcolatrice]].

## Base 1 e base 0

- Con $a = 1$ la scala è piatta: $1^x =$ [[1]] per ogni $x$. Non è sbagliata, è **inutile**: non descrive nessuna crescita.
- Con $a = 0$: $0^{-1}$ vorrebbe dire $\frac{1}{0}$, e $0^0$ non ha nemmeno un valore sensato.

:::div.reveal
Ecco perché la **definizione di esponenziale** porta delle condizioni.

$$y = a^x \qquad \text{con } a > 0 \text{ e } a \neq 1$$

Quelle condizioni non sono messe lì per complicare le cose: sono **le garanzie per evitare che si rompa qualcosa**.

- $a > 0$ la base deve essere positiva perché con base negativa la definizione si contraddice da sola;
- $a \neq 1$ perché la base 1 dà una funzione costante, che non ha niente di esponenziale.

E il caso $a = 0$ non serve nemmeno escluderlo a parte: è già fuori da $a > 0$.

Riepilogo di quello che ora sai giustificare, non solo ricordare:

| Passaggio | Perché |
| --------- | ------ |
| $a^0 = 1$ | è l'unico valore che continua la scala |
| $a^{-n} = \frac{1}{a^n}$ | scendere di un gradino vuol dire dividere per $a$ |
| $a^{\frac{m}{n}} = \sqrt[n]{a^m}$ | il gradino di mezzo va moltiplicato per sé stesso $n$ volte |
| $a^x$ con $x$ irrazionale | è il numero verso cui si stringono i gradini razionali vicini |
| $a > 0$, $a \neq 1$ | senza queste, la definizione si contraddice o si appiattisce |
:::