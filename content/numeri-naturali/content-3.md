> id: divisori-multipli
> title: Divisori e Multipli
> description: Divisori, multipli e criteri di divisibilità.

---

> id: rettangoli-divisori
> title: Contiamo i rettangoli

# Quanti rettangoli?

Quanti rettangoli composti da **6 quadratini** possiamo trovare? Consideriamo solo i rettangoli "diversi" anche se li ruotiamo: il rettangolo con base $6$ e altezza $1$ è uguale a quello con base $1$ e altezza $6$.

:::div.highlight
👆 **Prova a disegnare**: trascina il mouse (o il dito) sulla griglia per disegnare un
rettangolo. Un rettangolo `6×1` e uno `1×6` contano come lo **stesso** rettangolo.
:::

:::p5 sketch=rettangoli-divisori n=6 height=360
:::

Quanti rettangoli diversi hai trovato? [[2]]

:::div.reveal
**Esatto!**, ci sono solo 2 rettangoli diversi che posso creare con 6 quadratini! Andrà meglio con un numero maggiore?
:::

---

> id: rettangoli-divisori-primi
> title: Contiamo i rettangoli 2

# Aggiungiamo quadratini

Ora prova a contare quanti rettangoli diversi puoi fare con $12$ quadratini! Saranno di più o di meno?

:::p5 sketch=rettangoli-divisori n=12 height=360
:::

Quanti rettangoli diversi hai trovato con 12 quadratini? [[3]]

Adesso prova invece con $7$ quadratini!

:::p5 sketch=rettangoli-divisori n=7 height=360
:::

Quanti rettangoli diversi hai trovato questa volta? [[1]]

:::div.reveal
Con $7$ quadratini possiamo fare solo un rettangolo: banalmente solo quello `7×1`. Come mai? Riesci a pensare ad altri numeri per cui si può trovare solo un rettangolo?
:::

---

> id: divisori
> title: I divisori

# Che cosa abbiamo trovato?

Quando cerchi i rettangoli fatti da $n$ quadratini, in realtà stai cercando i modi di scrivere $n$ come **prodotto** di due numeri: un rettangolo $a\times b$ dice che $a\times b = n$.

Con $6$ quadratini avevi trovato:

$$6 = 6\times 1 \qquad\qquad 6 = 3\times 2$$

I numeri che compaiono a coppie — $1$ e $6$, $2$ e $3$ — sono i **divisori** di $6$.

:::div.highlight
Un **divisore** di $n$ è un numero che sta in $n$ un numero **esatto** di volte, senza avanzi. Ogni lato di un rettangolo di $n$ quadratini è un divisore di $n$!
:::

Con $12$ quadratini i rettangoli erano $12\times 1$, $6\times 2$ e $4\times 3$: ecco perché i divisori di $12$ sono $1, 2, 3, 4, 6, 12$.

:::div.highlight
👆 **Prova tu**: seleziona tutti i **divisori di $12$** (da $1$ a $12$).
:::

:::p5 goal sketch=griglia-numeri n=12 target=1,2,3,4,6,12
:::

:::div.reveal
**Bravo!** Trovare i rettangoli di $n$ quadratini equivale a trovare i divisori di $n$: ogni coppia di lati $a\times b = n$ è una coppia di divisori.
:::

---

> id: numeri-primi
> title: I numeri primi

# I numeri primi

Ricordi il caso di $7$ quadratini? Avevi trovato un solo rettangolo: $7\times 1$. I suoi unici divisori sono $1$ e $7$.

I numeri che hanno **soltanto due divisori** — $1$ e sé stessi — si chiamano numeri **primi**.

:::div.highlight
👆 **Prova tu**: seleziona tutti i **divisori di $7$** (da $1$ a $7$).
:::

:::p5 goal sketch=griglia-numeri n=7 target=1,7
:::

:::div.highlight
Un numero primo, come $7$, dà un solo rettangolo — proprio perché ha solo due divisori.
:::

Rispondi ora ad alcune domande per capire meglio i numeri primi.

$4$ ha i divisori $1, 2, 4$: è un numero primo? [[Sì|*No]]

$5$ ha i divisori $1, 5$: è un numero primo? [[*Sì|No]]

$1$ ha un solo divisore — sé stesso: è un numero primo? [[Sì|*No]]

:::div.reveal
**Esatto!** $4$ ha più di due divisori quindi non è primo; $5$ ha esattamente due divisori ($1$ e $5$) quindi è primo. Anche $1$ non è primo: ha un solo divisore, non due.
:::

---

> id: multipli
> title: I multipli

# I multipli

Abbiamo esplorato i **divisori**. Adesso guardiamo la stessa idea dall'altra parte: i **multipli**.

Un **multiplo** di un numero si ottiene **moltiplicandolo** per $1, 2, 3, 4, \dots$

Per esempio, i multipli di $4$ sono:

$$4,\quad 8,\quad 12,\quad 16,\quad 20,\quad \dots$$

cioè $4\times 1$, $4\times 2$, $4\times 3$, $4\times 4$, $4\times 5$, e così via: sono le **tabelline**! I multipli di un numero sono **infiniti**: possiamo sempre moltiplicare per un numero più grande.

:::div.highlight
**Divisori e multipli sono la stessa relazione vista dai due lati.** Se $4$ è un **divisore** di $12$, allora $12$ è un **multiplo** di $4$. In generale: se $a$ è un divisore di $b$, allora $b$ è un multiplo di $a$.
:::

:::div.highlight
👆 **Prova tu**: clicca tutti i numeri da $1$ a $20$ che sono **multipli di $4$**. Lo step si completa quando hai selezionato **tutti e soli** quelli giusti.
:::

:::p5 goal sketch=griglia-numeri n=20 target=4,8,12,16,20
:::

Adesso tocca ai **multipli di $3$**: seleziona tutti i multipli di $3$ che compaiono qui sotto.

:::p5 goal sketch=griglia-numeri n=30 target=3,6,9,12,15,18,21,24,27,30
:::

:::div.reveal
**Ottimo!** Avrai notato che i multipli di un numero sono sempre "distanziati" della stessa quantità: quelli di $4$ vanno di $4$ in $4$, quelli di $3$ di $3$ in $3$. È come **contare a salti**!
:::

---

> id: crivello-eratostene
> title: Il crivello di Eratostene

# Il crivello di Eratostene

Ora che conosci i numeri primi e i multipli, puoi trovare **tutti i numeri primi da $1$ a $50$** con un metodo antichissimo: il **crivello di Eratostene**.

L'idea è semplice: segna tutti i **multipli di $2$** (tranne $2$ stesso), poi tutti i multipli di $3$ (tranne $3$), poi quelli di $5$, poi di $7$... I numeri che restano non segnati sono i **numeri primi**!

:::div.highlight
👆 **Prova tu**: segna tutti i **numeri non primi** da $1$ a $50$, procedendo un passo alla volta — prima i multipli di $2$, poi quelli di $3$, poi di $5$, poi di $7$. Ricorda che anche $1$ non è un numero primo.
:::

:::p5 goal sketch=griglia-numeri n=50 target=1,4,6,8,9,10,12,14,15,16,18,20,21,22,24,25,26,27,28,30,32,33,34,35,36,38,39,40,42,44,45,46,48,49,50
:::

:::div.reveal
**Fantastico!** I numeri rimasti non segnati — $2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47$ — sono tutti i numeri primi minori di $50$. Eratostene inventò questo metodo più di duemila anni fa, e funziona ancora oggi! Prova su un quaderno a trovare tutti quelli minori di 100!
:::

---

> id: scomposizione-fattori-primi
> title: La scomposizione in fattori primi

# Spezzare un numero nei suoi primi

Abbiamo detto che i numeri primi sono i "mattoni" con cui si costruiscono tutti gli altri. Ogni numero che **non** è primo, infatti, si può scrivere come **prodotto di numeri primi**: è la sua **scomposizione in fattori primi**.

Per esempio $60 = 2\times 2\times 3\times 5$. Ma come si trovano questi fattori? Con il **metodo classico** a due colonne:

:::div.highlight
1. Scrivi il numero a **sinistra** di una riga verticale.
2. Dividilo per il **più piccolo numero primo** che lo divide, e scrivi quel primo a **destra**.
3. Il **quoziente** diventa il nuovo numero da dividere, nella riga sotto.
4. Vai avanti così finché non arrivi a **$1$**.
:::

La regola d'oro è **partire sempre dai divisori più piccoli**: prima provi con $2$, poi con $3$, poi con $5$, e così via. In questo modo i fattori escono ordinati dal più piccolo al più grande.

:::div.highlight
👆 **Prova tu**: scomponi $60$. Nella colonna di destra **digita** un divisore primo e premi **Invio**. Parti dai più piccoli: se scegli un divisore più grande del necessario, lo strumento ti avvisa di riprovare con uno più piccolo. Lo step si completa quando arrivi a $1$.
:::

:::p5 goal sketch=scomposizione-fattori n=60 height=360
:::

:::div.highlight
Quando lo **stesso** primo divide più volte, lo riscrivi ogni volta: $60$ si divide per $2$ **due** volte di fila. Per questo la scomposizione si può scrivere in forma compatta con le **potenze**: $60 = 2^2\times 3\times 5$.
:::

Adesso tocca a te, senza aiuti passo-passo dal testo: scomponi $\mathbf{90}$ partendo sempre dai fattori più piccoli.

:::p5 goal sketch=scomposizione-fattori n=90 height=360
:::

:::div.reveal
**Ottimo lavoro!** $90 = 2\times 3\times 3\times 5 = 2\times 3^2\times 5$. Qualunque numero tu scelga, se parti sempre dal più piccolo primo che lo divide, la scomposizione è **unica**: è sempre lo stesso insieme di mattoni primi.
:::

---

> id: criteri-divisibilita
> title: I criteri di divisibilità

# Scoprirlo senza fare la divisione

Per scomporre $60$ hai dovuto provare: "si divide per $2$? e per $3$?". Fare ogni volta la divisione è lento. Per fortuna esistono i **criteri di divisibilità**: piccole regole che guardano solo le **cifre** del numero e ti dicono subito la risposta.

## Divisibilità per 2

:::div.highlight
Un numero è divisibile per $2$ se la sua **ultima cifra** è **pari**: $0, 2, 4, 6, 8$.
:::

$3\,714$ finisce per $4$, che è pari: è divisibile per $2$. Invece $3\,715$ finisce per $5$ e non lo è.

$1\,286$ è divisibile per $2$? [[*Sì|No]]

## Divisibilità per 5

:::div.highlight
Un numero è divisibile per $5$ se la sua **ultima cifra** è $0$ oppure $5$.
:::

È lo stesso motivo del criterio del $2$: scriviamo i numeri in base dieci, e $10$ si divide sia per $2$ sia per $5$. Quindi tutto ciò che sta prima dell'ultima cifra (decine, centinaia, migliaia...) è già multiplo di $2$ e di $5$: basta guardare quello che avanza, cioè l'ultima cifra.

$4\,830$ è divisibile per $5$? [[*Sì|No]]

$4\,832$ è divisibile per $5$? [[Sì|*No]]

## Divisibilità per 3

:::div.highlight
Un numero è divisibile per $3$ se la **somma delle sue cifre** è divisibile per $3$.
:::

Prendiamo $258$: sommiamo le cifre, $2+5+8 = 15$. E $15$ è divisibile per $3$ ($15 = 3\times 5$), quindi anche $258$ lo è. Se la somma è ancora grande puoi ripetere il trucco: da $15$ ottieni $1+5=6$, che è multiplo di $3$.

Prova con $471$: quanto vale la somma delle cifre? [[12]]

Allora $471$ è divisibile per $3$? [[*Sì|No]]

## Divisibilità per 9

:::div.highlight
Un numero è divisibile per $9$ se la **somma delle sue cifre** è divisibile per $9$.
:::

È lo stesso criterio del $3$, ma più esigente: la somma deve arrivare a un multiplo di $9$. Per $471$ la somma era $12$, che **non** è multiplo di $9$: quindi $471$ è divisibile per $3$ ma **non** per $9$.

Invece $837$ dà $8+3+7 = 18$, che è $9\times 2$: allora $837$ è divisibile per $9$.

$5\,643$ ha come somma delle cifre [[18]]: è divisibile per $9$? [[*Sì|No]]

:::div.highlight
⚠️ **Attenzione**: ogni numero divisibile per $9$ è anche divisibile per $3$ (perché $9 = 3\times 3$), ma **non** vale il contrario!
:::

## Divisibilità per 11

:::div.highlight
Un numero è divisibile per $11$ se la **differenza** tra la somma delle cifre di posto **dispari** e la somma delle cifre di posto **pari** è $0$ oppure un multiplo di $11$.
:::

Contiamo le posizioni **da destra**. Prendiamo $9\,163$:

$$\text{posti dispari: } 3 + 1 = 4 \qquad\qquad \text{posti pari: } 6 + 9 = 15$$

La differenza è $15 - 4 = 11$: è un multiplo di $11$, quindi $9\,163$ è divisibile per $11$ (infatti $9\,163 = 11\times 833$).

Un caso facile: $253$ dà $3+2 = 5$ sui posti dispari e $5$ sul posto pari. La differenza è $5-5 = 0$, quindi $253$ è divisibile per $11$.

$8\,206$: sui posti dispari hai $6+2 = 8$ e sui posti pari $0+8 = 8$, quindi la differenza è $0$. È divisibile per $11$? [[*Sì|No]]

:::div.reveal
**Bravissimo!** Ora hai una cassetta degli attrezzi completa:

| Divisibile per | Criterio |
|---|---|
| $2$ | l'ultima cifra è pari |
| $3$ | la somma delle cifre è multiplo di $3$ |
| $5$ | l'ultima cifra è $0$ o $5$ |
| $9$ | la somma delle cifre è multiplo di $9$ |
| $11$ | la differenza tra le cifre di posto dispari e quelle di posto pari è $0$ o multiplo di $11$ |

Con questi criteri la scomposizione in fattori primi diventa molto più veloce: guardi le cifre e sai subito da dove partire!
:::

