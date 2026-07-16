> id: potenze
> title: Potenze
> description: La notazione delle potenze e le loro proprietà.

---

> id: introduzione-potenze
> title: Che cos'è una potenza

# La potenza

A volte dobbiamo moltiplicare lo **stesso numero** per sé stesso tante volte.
Invece di scrivere una lunga moltiplicazione, usiamo una scrittura più corta: la
**potenza**.

$$2 \cdot 2 \cdot 2 = 2^3 = 8$$

In una potenza come $2^3$ ci sono due numeri con un nome preciso:

- la **base** è il numero che si ripete (qui $2$);
- l'**esponente** è il numero piccolo in alto e dice **quante volte** la base compare nella moltiplicazione (qui $3$).

Si legge "**2 elevato a 3**" oppure "2 alla terza". Quindi:

$$2^3 = \underbrace{2 \cdot 2 \cdot 2}_{3 \text{ volte}} = 8$$

:::div.highlight
💡 Due esponenti hanno un nome speciale: $a^2$ si legge "$a$ **al quadrato**" e
$a^3$ si legge "$a$ **al cubo**".
:::

## Casi particolari

- Esponente **1**: la base compare una sola volta, quindi $a^1 = a$ (es. $7^1 = 7$).
- Esponente **0**: per convenzione $a^0 = 1$ per ogni base diversa da zero
  (es. $9^0 = 1$).
- Base **1**: $1$ moltiplicato per sé stesso resta sempre $1$, quindi $1^n = 1$.

## Esercizio 1: riconosci base ed esponente

Nella potenza $4^3$:

- la **base** è [[4]]
- l'**esponente** è [[3]]

## Esercizio 2: calcola la potenza

Scrivi il risultato di ciascuna potenza:

- $2^3 =$ [[8]]
- $3^2 =$ [[9]]
- $5^2 =$ [[25]]
- $2^4 =$ [[16]]
- $10^3 =$ [[1000]]

## Esercizio 3: i casi particolari

- $6^1 =$ [[6]]
- $8^0 =$ [[1]]
- $1^4 =$ [[1]]

## Esercizio 4: che cosa significa?

La potenza $2^3$ è un modo breve per scrivere:

[[$2 + 2 + 2$|*$2 \cdot 2 \cdot 2$|$3 \cdot 3$]]

:::div.reveal
🎉 **Bravo!** Una potenza è una moltiplicazione ripetuta: la **base** è il numero
che si ripete, l'**esponente** dice quante volte. Ricorda i casi particolari:
$a^1 = a$, $a^0 = 1$ e $1^n = 1$.
:::

---

> id: prodotto-potenze
> title: Moltiplicare potenze con la stessa base

# Moltiplicare potenze con la stessa base

Cosa succede se moltiplichiamo **due potenze con la stessa base**, come
$2^3 \cdot 2^4$? Potremmo calcolare ogni potenza e poi moltiplicare… ma c'è una
scorciatoia. Per scoprirla, torniamo al significato di potenza: una
**moltiplicazione ripetuta**.

👇 **Tocca** ciascuna potenza qui sotto per "spacchettarla" nei suoi fattori, poi
**conta** quanti $2$ ottieni in tutto.

:::p5 sketch=potenze-prodotto-base goal height=250
:::

Ora rispondi:

- In tutto, quanti fattori $2$ hai contato? [[7]]


- Allora il prodotto si riscrive come una **sola** potenza: $2^3 \cdot 2^4$ è uguale a $2$ elevato a [[7]]

- Se le basi non sono le stesse, ad esempio $2^3 \cdot 3^4$ [[si può ripetere lo stesso ragionamento|*non si può ragionare così perché si ha una potenza solo se si moltiplica per se stesso sempre lo stesso numero]] 


## Regola (prima proprietà delle potenze)

Moltiplicando due [[select: numeri|*potenze|basi]] con [[select: *basi uguali|esponenti uguali]] si ottiene una potenza con [[select: la somma delle basi|il prodotto delle basi|*la stessa base]] e con esponente uguale [[select: *alla somma|al prodotto|alla differenza]] degli esponenti dei fattori.

:::div.reveal
🔑 **Prodotto di potenze con la stessa base**: si tiene la **stessa base** e si
**sommano gli esponenti**.

$$a^m \cdot a^n = a^{m+n}$$

**Esempio**

$$4^3 \cdot 4^5 = 4^{(3+5)} = 4^8$$
:::

---

> id: quoziente-potenze
> title: Dividere potenze con la stessa base

# Dividere potenze con la stessa base

E per una **divisione** tra potenze con la stessa base, come $2^8 : 2^3$?
Spacchettiamo di nuovo tutto in fattori $2$, scrivendo la divisione per esteso:
$(2 \cdot 2 \cdots) : (2 \cdot 2 \cdots)$. Poi sfruttiamo un'idea semplice: ogni
coppia $2 : 2$ **vale 1**, quindi possiamo **eliminarla**.

👇 Tocca prima le due potenze per spacchettarle, poi **tocca la coppia $2:2$
centrale** per cancellarla, una alla volta.

:::p5 sketch=potenze-quoziente-base goal height=320
:::

Ora rispondi:

- Quante coppie $2:2$ hai eliminato? [[3]]


- Quanti fattori $2$ sono rimasti? [[5]]


- Allora la divisione si riscrive come una sola potenza: $2^8 : 2^3$ fa $2$ elevato a [[5]]

- Se le basi non sono le stesse, ad esempio $2^8 : 3^4$ [[si può ripetere lo stesso ragionamento|*non si può ragionare così perché $2:3$ non fa $1$ e quindi non si elimina]] 

## Regola (seconda proprietà delle potenze)

Dividendo due [[select: numeri|*potenze|basi]] con [[select: *basi uguali|esponenti uguali]] si ottiene una potenza con [[select: la somma delle basi|il quoziente delle basi|*la stessa base]] e con esponente uguale [[select: alla somma|al quoziente|*alla differenza]] degli esponenti dei fattori.

:::div.reveal
🔑 **Quoziente di potenze con la stessa base**: si tiene la **stessa base** e si
**sottraggono gli esponenti**.

$$a^m : a^n = a^{m-n} \quad (a \neq 0,\ m \geq n)$$

**Esempio**

$$3^6 : 3^2 = 3^{(6-2)} = 3^4$$
:::

---

> id: prime-espressioni-potenze
> title: Applichiamo le prime proprietà

# Quando usiamo le proprietà delle potenze?

Perchè usare le proprietà delle potenze quando possiamo calcolare le potenze e poi fare le divisione e moltiplicazioni?

Il vantaggio principale è quello di evitare di scrivere numeri molto grandi, che ci può portare a fare errori, o che addirittura la calcolatrice non riesce a gestire.

:::div.highlight
Prova a fare questo calcolo sulla tua calcolatrice: `10`  `^`  `400` 

(Alcune calcolatrici hanno un tasto $x^y$ per la potenza, invece dell'apice `^`)

Potresti ottenere un errore anche sulle calcolatrici digitali sul tuo telefono (il numero è troppo grande per la memoria della calcolatrice) a meno che non siano calcolatrici particolari. In ogni caso è un numero con $400$ zeri: non ha senso scriverlo.

Invece un calcolo come $10^{400} : 10^{398}$ lo possiamo svolgere facilmente con la seconda proprietà delle potenze senza calcolare esplicitamente le potenze:
$$10^{400} : 10^{398} = 10^{400-398} = 10^2 = 100$$
:::

Ora prova tu: risolvi questa espressione. Per inserire una potenza usa l'apice `^`: ad esempio `2` `^` `3`,

:::powers no-eval
7^15 : 7^12 * 7
:::

Se provi a risolvere anche calcolando le potenze $7^{15} = 4747561509943$ e $7^{12} = 13841287201$ ti renderai conto che è molto più facile usare invece le proprietà delle potenze!

Adesso prova a risolvere questa espressione usando le proprietà delle potenze. Quando non ci sono più proprietà da applicare, allora puoi calcolare le potenze e procedere normalmente.

:::powers
6*6^3:6^2*6^0-6^5:6^3
:::

:::div.reveal
Bene! Adesso sai perché è meglio applicare subito le proprietà delle potenze quando è possibile!
:::

---

> id: potenza-di-potenza
> title: Potenza di una potenza

# La potenza di una potenza

A volte una potenza è a sua volta elevata a un esponente, come $(3^2)^4$. Che
cosa significa? L'esponente **esterno** dice **quante volte** ripetiamo la base —
e qui la "base" è tutta la potenza $3^2$:

$$(3^2)^4 = \underbrace{3^2 \cdot 3^2 \cdot 3^2 \cdot 3^2}_{4 \text{ volte}}$$

Ma così otteniamo un **prodotto di potenze con la stessa base**: possiamo usare la
**prima proprietà**!

👇 **Tocca** la potenza qui sotto per spacchettarla, poi guarda quante volte
compare $3^2$.

:::p5 sketch=potenze-potenza-di-potenza goal height=250
:::

Ora rispondi:

- Quante volte compare la potenza $3^2$? [[4]]


- Applico la prima proprietà e **sommo gli esponenti**: $2+2+2+2 =$ [[8]]


- Allora $(3^2)^4$ è uguale a $3$ elevato a [[8]]

- Sommare quattro volte il $2$ è come fare [[select: *2 · 4|2 + 4|2 - 4]], cioè moltiplicare i due esponenti.

Ora prova tu: riscrivi questa potenza di potenza come una sola potenza, senza calcolarla.

:::powers no-eval
(2^3)^2
:::

## Regola (terza proprietà delle potenze)

La potenza di una [[select: *potenza|base|somma]] si riscrive con la [[select: *stessa base|somma delle basi]] e con esponente uguale [[select: alla somma|*al prodotto|alla differenza]] dei due esponenti.

:::div.reveal
🔑 **Potenza di potenza**: si tiene la **stessa base** e si **moltiplicano gli
esponenti**.

$$(a^m)^n = a^{m \cdot n}$$

**Esempio**

$$(2^3)^2 = 2^{(3 \cdot 2)} = 2^6$$
:::

---

> id: potenze-parole
> title: Dalle parole alle espressioni

# Dalle parole alle espressioni con le potenze

A volte esprimiamo con parole dei calcoli semplici:

|A parole|Espressione|
|-|-|
|Il *doppio* di $a$|$2 \cdot a$|
|La *metà* di $a$|$a : 2$|
|Il *triplo* di $a$|$3 \cdot a$|
|Un *terzo* o la *terza parte* di $a$|$a : 3$|
|Il *quadruplo*, il *quintuplo*... di $a$|$4 \cdot a$,$5 \cdot a$,...|
|Un *quarto*, la *quarta parte*... di $a$|$a:4$...|
|Il *quadrato* di $a$|$a^2$|
|Il *cubo* di $a$|$a^3$|

Quanto vale la metà di $2^{66}$?

[[*$2^{65}$|$2^{33}$|$1^{66}$|$1^{33}$]]

Quanto vale il triplo di $3^{10}$?

[[$3^{30}$|$9^{10}$|*$3^{11}$|$9^{30}$]]

La quinta parte di $5^5$ vale

[[*$5^4$|$1^5$|$5^1$|$1^1$]]

:::div.reveal
Esatto!
- la metà di $2^{66}$ è $2^{66} : 2 = 2^{66-1} = 2^{65}$
- il triplo di $3^{10}$ è $3 \cdot 3^{10} = 3^{10+1} = 3^{11}$
- la quinta parte di $5^5$ è $5^5:5 = 5^{5-1} = 5^4$
:::

---

> id: proprietà-basi-diverse
> title: Usare le proprietà delle potenze anche con basi diverse

# Basi diverse ma...

Quanto vale il triplo di $9^{11}$? Ricordando che il triplo significa moltiplicare per $3$ dovrei scrivere

$$3 \cdot 9^{11}$$

ed essere costretto a calcolare "a mano" la potenza grande perché le basi sono diverse. Però c'è un trucco: $9$ è a sua volta **una potenza di $3$** e posso scriverlo come $3^2$. Quindi $9^{11} = (3^2)^{11} = $ [[3^22]] (scrivi base `^` esponente).


Nella seguente espressione tocca l'esponente di $9^{11}$ per trasformarlo in una potenza con base $3$.

:::powers
3*9^11
:::

## Ora prova tu

Stessa strategia: guarda se una base è **potenza di un'altra**, riscrivila per
avere la **stessa base**, poi applica le proprietà che già conosci (prodotto e
quoziente con stessa base, potenza di potenza). Ricorda: l'esponente si tocca per
riscrivere la potenza, l'operatore per applicare una proprietà.

Una sola base da riscrivere:

:::powers no-eval
9^4 * 3^5
:::

Adesso con una divisione:

:::powers no-eval
8^3 : 2^5
:::

Qui **due** basi vanno ricondotte alla stessa (sono entrambe potenze di $3$):

:::powers no-eval
27^4 : 9^3
:::

L'ultima mette insieme più proprietà (occhio anche alla potenza di potenza):

:::powers no-eval
(2^3)^2 * 4^2
:::

:::div.reveal
🔑 **Il trucco delle basi diverse**: se una base è potenza dell'altra, riscrivi la
potenza in quella base (l'esponente cambia di conseguenza), così ottieni la
**stessa base** e puoi applicare prodotto, quoziente e potenza di potenza.

- $9^4 \cdot 3^5 = 3^8 \cdot 3^5 = 3^{13}$
- $8^3 : 2^5 = 2^9 : 2^5 = 2^4$
- $27^4 : 9^3 = 3^{12} : 3^6 = 3^6$
- $(2^3)^2 \cdot 4^2 = 2^6 \cdot 2^4 = 2^{10}$
:::


---

> id: prodotto-stesso-esponente
> title: Moltiplicare potenze con lo stesso esponente

# Moltiplicare potenze con lo stesso esponente

E se le basi sono **diverse** ma l'esponente è **lo stesso**, come $7^3 \cdot 2^3$?
La prima proprietà qui non serve (le basi non sono uguali), ma c'è un'altra
scorciatoia. Torniamo di nuovo al significato di potenza e proviamo a
**riordinare** i fattori.

👇 **Tocca** ciascuna potenza per spacchettarla, poi **tocca** per accoppiare ogni
$7$ con un $2$.

:::p5 sketch=potenze-prodotto-esponente goal height=260
:::

Ora rispondi:

- Quante coppie $(7 \cdot 2)$ hai ottenuto? [[3]]


- Quanto vale ogni coppia $7 \cdot 2$? [[14]]


- Allora $7^3 \cdot 2^3$ è uguale a $14$ elevato a [[3]]

- Se invece gli esponenti sono diversi, ad esempio $7^3 \cdot 2^4$ [[si può accoppiare allo stesso modo|*non si può, perché resterebbe un fattore senza compagno con cui fare la coppia]]

Ora prova ad applicare la proprietà:

:::powers no-eval
3^6 * 4^6
:::

## Regola (quarta proprietà delle potenze)

Moltiplicando due [[select: numeri|*potenze|basi]] con lo [[select: *stesso esponente|stessa base]] si ottiene una potenza con [[select: la somma delle basi|*il prodotto delle basi|la stessa base]] e con [[select: *lo stesso esponente|la somma degli esponenti]].

:::div.reveal
🔑 **Prodotto di potenze con lo stesso esponente**: si **moltiplicano le basi** e
si tiene lo **stesso esponente**.

$$a^n \cdot b^n = (a \cdot b)^n$$

**Esempio**

$$5^4 \cdot 2^4 = (5 \cdot 2)^4 = 10^4$$
:::

---

> id: quoziente-stesso-esponente
> title: Dividere potenze con lo stesso esponente

# Dividere potenze con lo stesso esponente

E se le due potenze hanno **basi diverse ma lo stesso esponente** e le dividiamo,
come $10^3 : 5^3$?

Per ragionare su questo caso ci basta ricordare che la **divisione è l'operazione
inversa della moltiplicazione **e usare la proprietà appena vista.**

Dividere $10^3 : 5^3$ significa cercare quel numero che, **moltiplicato** per $5^3$,
dà $10^3$. Questo deve essere necessariamente $2^3$, perché moltiplicandolo per $5^3$ si ottiene $10^3$ (usando la proprietà precedente! $2^3 * 5^3 = 10^3$).

In pratica: si **dividono le basi** ($10 : 5 = 2$) e si tiene lo **stesso esponente**.

Rispondi:

- Le basi si dividono: $10 : 5 =$ [[2]]

- L'esponente invece resta [[3]]

- Se gli esponenti fossero diversi, ad esempio $10^3 : 5^2$, questa scorciatoia [[si può usare lo stesso|*non si può usare, perché serve lo stesso esponente in entrambe le potenze]]

Ora prova tu con le proprietà. Ricorda: per inserire una potenza usa l'apice `^`.

:::powers no-eval
15^4 : 3^4
:::

## Regola (quinta proprietà delle potenze)

Dividendo due [[select: numeri|*potenze|basi]] con lo [[select: *stesso esponente|stessa base]] si ottiene una potenza che ha per base [[select: la somma delle basi|il prodotto delle basi|*il quoziente delle basi]] e con [[select: *lo stesso esponente|la differenza degli esponenti]].

:::div.reveal
🔑 **Quoziente di potenze con lo stesso esponente**: si **dividono le basi** e si
tiene lo **stesso esponente**.

$$a^n : b^n = (a : b)^n \quad (b \neq 0)$$

**Esempio**

$$10^3 : 5^3 = (10 : 5)^3 = 2^3$$
:::

---

> id: riepilogo-potenze
> title: Riepilogo delle proprietà

# Tutte le proprietà in un colpo d'occhio

Hai incontrato **cinque proprietà** delle potenze, ognuna nata da un caso diverso.
Eccole tutte insieme: questa tabella è la tua "mappa" per scegliere ogni volta la
scorciatoia giusta.

| Proprietà | In simboli | Esempio |
|---|---|---|
| Prodotto, stessa base | $a^m \cdot a^n = a^{m+n}$ | $2^3 \cdot 2^4 = 2^7$ |
| Quoziente, stessa base | $a^m : a^n = a^{m-n}$ | $3^6 : 3^2 = 3^4$ |
| Potenza di potenza | $(a^m)^n = a^{m \cdot n}$ | $(2^3)^2 = 2^6$ |
| Prodotto, stesso esponente | $a^n \cdot b^n = (a \cdot b)^n$ | $5^4 \cdot 2^4 = 10^4$ |
| Quoziente, stesso esponente | $a^n : b^n = (a : b)^n$ | $10^3 : 5^3 = 2^3$ |

:::div.highlight
💡 **Non dimenticare i casi particolari:**

- $a^1 = a$ (esponente $1$: la base compare una volta sola);
- $a^0 = 1$ per ogni base $a \neq 0$;
- $1^n = 1$ (la base $1$ resta sempre $1$).
:::

## Domande di riepilogo

Applica la proprietà giusta e completa (inserici la potenza come base `^` esponente):

- $6^4 \cdot 6^3 = $ [[6^7]]

- $8^9 : 8^4 = $ [[8^5]]

- $(5^2)^3 = $ [[5^6]]

- $3^4 \cdot 2^4 = $ [[6^4]]

- $12^5 : 4^5 = $ [[3^5]]

Un ripasso sui casi particolari:

- $7^0 + 1^{100} =$ [[2]]

E quando le basi sembrano diverse? In $9^3 : 3^5$ prima conviene
[[select: *riscrivere le basi con lo stesso valore|calcolare subito le potenze]],
perché $9$ è a sua volta una potenza di $3$.

## Espressioni di riepilogo

Ora tocca a te: in ognuna scegli la proprietà da applicare guardando **basi** ed
**esponenti**. Ricorda: per inserire una potenza usa l'apice `^`.

Stessa base, quoziente e prodotto insieme:

:::powers no-eval
2^6 : 2^2 * 2^3
:::

Prima una potenza di potenza, poi un quoziente:

:::powers no-eval
(3^2)^3 : 3^4
:::

Basi diverse ma **stesso esponente**:

:::powers no-eval
10^5 : 5^5
:::

Qui una base va ricondotta all'altra ($9$ è una potenza di $3$):

:::powers no-eval
9^3 : 3^4
:::

Nell'ultima applica prima le proprietà **dove puoi**, poi — quando non ce ne sono
più — calcola pure le potenze rimaste:

:::powers
5^4 : 5^2 * 2^2
:::

:::div.reveal
🎉 **Lezione completata!** Hai imparato a maneggiare le potenze e le loro cinque
proprietà. La strategia è sempre la stessa: **guarda basi ed esponenti** per capire
quale proprietà usare, riscrivi le basi quando serve per renderle uguali, e **solo
alla fine** calcola i numeri rimasti. Così eviti numeroni enormi e fai molti meno
errori!
:::