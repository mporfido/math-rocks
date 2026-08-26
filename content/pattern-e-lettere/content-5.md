> id: polinomi
> title: Polinomi
> description: Più pezzi tenuti insieme da un più o un meno — contarli, pesarli, metterli in fila e vedere che cosa manca.

---

> id: piu-di-un-pezzo
> title: Quando i pezzi sono più di uno

# Le scritture che ti porti dietro da tre lezioni

Guarda queste quattro. Le hai scritte tu, nelle lezioni precedenti:

$$5n - 2 \qquad 3n + 1 \qquad 2b + 2h \qquad 2h^2$$

Le prime tre hanno una cosa in comune che l'ultima non ha: un segno **in mezzo**, che tiene insieme due pezzi staccati.

Quanti pezzi staccati ha $2h^2$? [[1]]

E quanti ne ha $2b + 2h$? [[2]]

## La parola giusta

Ognuno di quei pezzi si chiama **termine**. In $2b + 2h$ i termini sono $2b$ e $2h$; in $5n - 2$ sono $5n$ e $-2$ — con il segno meno che appartiene al termine, non è un'operazione lasciata a metà.

Quanti termini ha $x^2 - 4x + 3$? [[3]]

:::details.hint
<summary>💡 Suggerimento</summary>

Pensa di tagliare l'espressione ad ogni $+$ e ad ogni $-$ che sta **in mezzo** ai termini: in quanti pezzi l'hai divisa?

:::

:::div.reveal
**Un termine è un monomio.** Ecco perché la lezione scorsa serviva a questa:

$$\underbrace{x^2}_{\text{1° termine}} \;\underbrace{-\;4x}_{\text{2° termine}} \;\underbrace{+\;3}_{\text{3° termine}}$$

Ogni pezzo, preso da solo, è un prodotto di numeri e lettere: esattamente la definizione di monomio. Un **polinomio** è una somma di monomi — *poli* vuol dire molti.

E il segno va letto con il termine: in $x^2 - 4x + 3$ il secondo termine è $-4x$, non $4x$. È una convenzione che sembra un dettaglio e invece è quella che rende tutto il resto coerente.
:::

---

> id: contare-i-termini
> title: Contare i termini

# Smistali per numero di pezzi

Smista queste espressioni nei contenitori. La domanda è: **quanti termini ha?**.

:::smista goal categorie="un termine;due termini;tre termini;quattro termini"
5a^2b -> un termine
x^2 + 5 -> due termini
2x^3 - x + 7 -> tre termini
xyz -> un termine
a^2 - b^2 -> due termini
x^4 - x^3 + x^2 - x -> quattro termini
-7 -> un termine
3n + 1 -> due termini
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Occhio a $xyz$: le lettere sono tre, ma sono **moltiplicate** fra loro. Non c'è nessun $+$ e nessun $-$ in mezzo, quindi il pezzo è uno solo.

:::

:::div.reveal
**Ogni mucchietto ha il suo nome.**

| Termini | Nome | Esempio |
| --- | --- | --- |
| 1 | monomio | $5a^2b$ |
| 2 | **binomio** | $x^2 + 5$ |
| 3 | **trinomio** | $2x^3 - x + 7$ |
| 4 o più | polinomio (e basta) | $x^4 - x^3 + x^2 - x$ |

Da quattro in poi i nomi si smettono di dare: si dice *polinomio* e si specifica quanti termini ha, se serve.

Un caso su cui vale la pena fermarsi: $2(x + 3)$. Quanti termini ha? La domanda, così com'è, non ha risposta: finché c'è quella parentesi la scrittura non è una somma di monomi. Bisogna prima svolgerla — e diventa $2x + 6$, un binomio. **Si contano i termini solo quando le parentesi sono sparite.**
:::

---

> id: il-grado-del-polinomio
> title: Il grado di un polinomio

# Il pezzo che pesa di più

Un polinomio è fatto di monomi, e ognuno ha il suo grado. Ci possiamo chiedere: cosa ha senso considerare come **grado del polinomio**?

Rappresentiamo il polinomio $5x^4 - x^2 + 3$ separando i termini: ogni casella è una potenza di $x$, e ogni termine sta nella casella del proprio grado.

:::p5 sketch=polinomio-pettine termini=5x^4;-x^2;3 modo=mostra height=280
:::

La casella più a sinistra è quella del grado più alto presente: 4.

Che grado ha $5x^4 - x^2 + 3$? [[4]]

## Provane un altro

E $2x^3 - x^7 + 4x$? Attenzione all'ordine in cui è scritto.

[[select: 3, perché è il primo|*7, perché è il più alto|10, perché si sommano]]

:::details.hint
<summary>💡 Suggerimento</summary>

Il grado del polinomio non dipende da dove i termini sono scritti. Guardali tutti e prendi il più grande.

:::

:::div.reveal
**Il grado di un polinomio è il grado del suo termine più alto.**

$$5x^4 - x^2 + 3 \;\rightarrow\; \text{grado } 4$$
$$2x^3 - x^7 + 4x \;\rightarrow\; \text{grado } 7$$

Non si sommano i gradi dei termini: si prende il massimo. Vedremo che è il termine di grado più alto quello che decide come si comporta tutta l'espressione per valori grandi di $x$. Gli altri, a confronto, contano sempre meno.

Nota una cosa: **fra la casella 4 e la casella 2 ce n'è una vuota**. Ci torniamo tra poco.
:::

---

> id: mettere-in-fila
> title: Polinomi ordinati

# Ogni termine nella sua casella

Ecco $3 - x^2 + 5x^4 - x$: gli stessi termini di prima, ma scritti alla rinfusa.

Trascina ogni termine nella casella della sua potenza.

:::p5 goal sketch=polinomio-pettine termini=3;-x^2;5x^4;-x modo=ordina height=330
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Guarda l'esponente di ogni termine, non il numero davanti. $5x^4$ va nella casella $x^4$; $3$ non ha lettere, quindi va nella casella $1$, quella del grado zero.

:::

Adesso leggi da sinistra a destra: com'è scritto il polinomio?

[[$3 - x^2 + 5x^4 - x$|*$5x^4 - x^2 - x + 3$|$5x^4 + 3 - x - x^2$]]

:::div.reveal
**Un polinomio è ordinato quando i suoi termini seguono i gradi.**

$$3 - x^2 + 5x^4 - x \qquad\longrightarrow\qquad 5x^4 - x^2 - x + 3$$

Sono lo **stesso** polinomio: nessun termine è cambiato, è cambiato l'ordine in cui sono scritti. Ma nella seconda scrittura il grado si legge a colpo d'occhio (è il primo termine), i termini simili di due polinomi diversi si trovano più facilmente, e quelli che mancano si vedono subito.

Ordinare non serve a essere ordinati. Serve a **leggere meglio il polinomio**.
:::

---

> id: crescente-o-decrescente
> title: Due modi di essere in ordine

# Da che parte si comincia?

Vediamo lo stesso polinomio ma scritto in due modi diversi.

**Dal grado più alto al più basso** (ordine decrescente):

:::p5 sketch=polinomio-pettine termini=5x^4;-x^2;-x;3 verso=decrescente modo=mostra height=280
:::

**Dal grado più basso al più alto** (ordine crescente):

:::p5 sketch=polinomio-pettine termini=5x^4;-x^2;-x;3 verso=crescente modo=mostra height=280
:::

Quale dei due è quello giusto?

[[select: il decrescente|il crescente|*tutti e due, sono due modi diversi di ordinare]]

:::div.reveal
**Nessuno dei due è "quello giusto".**

$$5x^4 - x^2 - x + 3 \qquad\text{e}\qquad 3 - x - x^2 + 5x^4$$

Sono lo stesso polinomio scritto in ordine decrescente e in ordine crescente. Il decrescente è quello che si usa quasi sempre, perché mette in prima posizione il termine che decide il grado.

È la stessa situazione di $2b + 2h$ e $2(b+h)$ della terza lezione, o di $3n+1$ e $4 + 3(n-1)$ della prima: **due scritture, la stessa cosa**. Ti sarà capitato spesso in questo corso, ed è una cosa normale.
:::

---

> id: completo-o-incompleto
> title: Polinomi completi

# Due polinomi dello stesso grado, molto diversi

Guarda questi due. Hanno tutti e due grado 4:

$$x^4 - x^3 + x^2 - x + 1 \qquad\text{e}\qquad x^4 + 2x - 5$$

Il primo ha **tutte** le potenze da $x^4$ fino al termine senza lettere. Il secondo ne salta due. Un polinomio del primo tipo si dice **completo**; uno del secondo tipo, **incompleto**.

Smista questi sei.

:::smista goal categorie="completo;incompleto"
x^2 + 3x + 1 -> completo
x^3 - 8 -> incompleto
2x + 5 -> completo
x^4 + x^2 + 1 -> incompleto
x^2 - 9 -> incompleto
x^3 + x^2 + x + 4 -> completo
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Parti dal grado del polinomio e scendi contando: $x^3$, $x^2$, $x$, il numero da solo. Ci sono tutti?

Ricorda che il termine senza lettere conta: è la potenza di grado zero.

:::

## Una regola per contare

Un polinomio completo di grado 3 ha [[4]] termini.

E uno completo di grado $n$? [[select: n termini|*n + 1 termini|2n termini]]

:::details.hint
<summary>💡 Suggerimento</summary>

Conta le caselle di grado 3: $x^3$, $x^2$, $x$, $1$. Non dimenticare quella del grado zero.

:::

:::div.reveal
**Completo vuol dire: nessuna casella vuota, dal grado massimo fino a zero.**

$$x^3 + x^2 + x + 4 \quad\text{completo} \qquad\qquad x^3 - 8 \quad\text{incompleto}$$

E il conto dei termini viene da sé: le caselle vanno da $n$ a $0$, e i numeri da $n$ a $0$ sono $n + 1$. Un polinomio completo di grado 5 ha 6 termini, uno di grado 10 ne ha 11.

Da qui si ricava anche una cosa che sembra un indovinello: **può esistere un polinomio completo di grado 5 con 3 termini?** No, e adesso sai dirlo senza provare: completo di grado 5 vuol dire 6 termini, non 3.
:::

---

> id: i-buchi-hanno-un-nome
> title: I buchi si possono riempire

# Che cosa c'è in una casella vuota?

Prendi $x^3 - 8$. Ci sono due caselle vuote: quella di $x^2$ e quella di $x$.

Vuote di che cosa? Non di *niente*: di un termine con **coefficiente zero**. Perché $0x^2$ vale zero, e sommare zero non cambia nulla — quindi non lo scriviamo mai. Ma c'è.

Tocca le caselle vuote per riempirle.

:::p5 goal sketch=polinomio-pettine termini=x^3;-8 modo=completa height=300
:::

Quindi $x^3 - 8$ si può scrivere anche come:

[[$x^3 - 8$ e basta|*$x^3 + 0x^2 + 0x - 8$|$x^3 + x^2 + x - 8$]]

:::div.reveal
**Ogni polinomio incompleto si può rendere completo, scrivendo i termini mancanti con coefficiente zero.**

$$x^3 - 8 \;=\; x^3 + 0x^2 + 0x - 8$$

Le due scritture valgono la stessa cosa per ogni valore di $x$ — prova con $x = 2$: la prima fa $8 - 8 = 0$, e la seconda $8 + 0 + 0 - 8 = 0$.

Sembra un gioco inutile, ed è invece il passaggio che sblocca tutto il capitolo successivo: quando due polinomi si dividono, o si scompongono, o si allineano in colonna per sommarli, i posti vuoti devono esserci. Una casella vuota non saltata è un errore in meno.
:::

---

> id: e-se
> title: E se…

# Tre domande di frontiera

Le definizioni si capiscono sui casi che le mettono alla prova. Eccone tre, sempre più difficili.

## Prima: un polinomio di grado 0

Che aspetto ha un polinomio di grado 0? Scegli l'esempio giusto:

[[select: x|*7|0x]]

## Seconda: un caso impossibile

Può esistere un polinomio **completo** di grado 4 con 3 termini?

[[select: sì, se i termini sono grandi|*no, ne servirebbero 5|no, ne servirebbero 4]]

## Terza: quella senza risposta comoda

E il polinomio $0$? Che grado ha?

Nella lezione scorsa lo avevi già incontrato come monomio nullo. Prova a rispondere prima di aprire il pannello — e nota che qui, per la prima volta in questo corso, la risposta non è un numero.

:::details.hint
<summary>💡 Suggerimento</summary>

Puoi scrivere $0$ come $0x$, come $0x^2$, come $0x^{100}$: sono tutti lo stesso polinomio. Se il grado fosse "l'esponente più alto", quale sceglieresti?

:::

Il polinomio nullo:

[[select: ha grado 0|ha grado 1|*non ha grado]]

:::div.reveal
**Le risposte, e perché sono queste.**

- **Grado 0**: un numero da solo, come $7$. Nessuna lettera, nessun esponente da guardare. E $0x$? Quello *è* il polinomio nullo, che è un caso a parte.
- **Completo di grado 4 con 3 termini**: impossibile. Completo di grado $n$ vuol dire $n+1$ termini, cioè 5. Non serve provare: il conto lo esclude.
- **Il polinomio nullo non ha grado.** Ogni scrittura $0x^k$ suggerirebbe un grado diverso, e non c'è modo di sceglierne una. Invece di forzare una risposta, la matematica ammette che la domanda non si applica — succede più spesso di quanto sembri, ed è un segno di serietà, non di rinuncia.

**Che cosa hai in mano adesso.** Sai guardare un'espressione con le lettere e dirne: quanti termini ha, che grado, se è ordinata, se è completa. Sono quattro domande, non una — e su ognuna hai un modo per rispondere.

**Nel prossimo capitolo:** i polinomi si sommano, si sottraggono e si moltiplicano. E lì i monomi simili della lezione scorsa e le caselle vuote di questa serviranno tutti e due.
:::
