> id: funzione-esponenziale
> title: La funzione esponenziale
> description: Rappresentiamo nel piano cartesiano, poi ritroviamo la curva dove non ce l'aspettavamo — in banca.

---

> id: grafico-per-punti
> title: Il grafico, un punto alla volta

# Da scala a curva

Ricapitoliamo che cosa abbiamo fatto nella lezione precedente: siamo partiti da quattro gradini **interi**, li abbiamo prolungati sotto lo zero (**esponenti negativi**), poi ne abbiamo infilati altri a metà, a un quarto, su ogni razionale (**esponenti frazionari**), e infine anche sugli irrazionali.

Su un piano cartesiano, mettiamo l'esponente sulle $x$ e il valore della potenza sulle $y$, i gradini diventano **punti**. E i punti, ormai fitti su ogni numero reale, sono diventati una **curva senza buchi** (abbiamo definito la potenza per ogni possibile esponente reale).

## La scala, di nuovo — ma stavolta disegnamola

Ecco la stessa tabella della lezione scorsa, con la stessa freccia a lato: scendendo di
un gradino si divide per 2. Completala (inserisci numeri con la virgola se servono).

:::table
| Esponente | Potenza  | Valore             | v : 2 |
| --------- | -------- | ------------------ | ----- |
| $3$       | $2^3$    | ${y3}{y3||input}   |
| $2$       | $2^2$    | ${y2}{y2||input}   |
| $1$       | $2^1$    | ${y1}{y1||input}   |
| $0$       | $2^0$    | ${y0}{y0||input}   |
| $-1$      | $2^{-1}$ | ${ym1}{ym1||input} |
:::

Ogni valore che scrivi diventa **subito un punto** nel grafico qui sotto: l'esponente
sulle $x$, il valore della potenza sulle $y$. Il grafico disegna quello che scrivi —
anche se è sbagliato.

## E i gradini in mezzo?

Questi tre esponenti non stanno sulla catena del $\div 2$: stanno **fra** un gradino e
l'altro. Sono quelli che nella lezione scorsa abbiamo dovuto inventare.

Prima di' che cosa vuol dire ciascuno, poi scrivine il valore con due cifre decimali.

:::table
| Esponente   | Potenza    | Vuol dire                                            | Valore |
| ----------- | ---------- | ---------------------------------------------------- | ------ |
| $\frac12$   | $2^{1/2}$  | [[*$\sqrt{2}$|$2 \cdot \frac12$|$1$]]             | ${yh}{yh||input} |
| $\frac14$   | $2^{1/4}$  | [[$\sqrt{2}$|*$\sqrt[4]{2}$|$\frac{2}{4}$]]       | ${yq}{yq||input} |
| $-\frac12$  | $2^{-1/2}$ | [[$-\sqrt{2}$|*$\frac{1}{\sqrt{2}}$|$\sqrt{-2}$]] | ${ymh}{ymh||input} |
:::

Ricorda: $2^{\frac12}$ è **il numero che moltiplicato per sé stesso fa 2** — è
esattamente il $k$ che hai cercato a mano nella lezione scorsa.

## Guarda dove sono finiti

:::graph
xrange: "-3,4"
yrange: "-1,9"
boundpoints:
  - {x: -1, y: ym1, label: "-1"}
  - {x: -0.5, y: ymh, label: "-1/2"}
  - {x: 0, y: y0, label: "0"}
  - {x: 0.25, y: yq, label: "1/4"}
  - {x: 0.5, y: yh, label: "1/2"}
  - {x: 1, y: y1, label: "1"}
  - {x: 2, y: y2, label: "2"}
  - {x: 3, y: y3, label: "3"}
:::

Otto punti, nessuno fuori posto? Un valore sbagliato si vede: rompe l'andamento degli
altri.

[Verifica i tuoi punti]{check: (y3-8)*(y3-8) < 0.0004 && (y2-4)*(y2-4) < 0.0004 && (y1-2)*(y1-2) < 0.0004 && (y0-1)*(y0-1) < 0.0004 && (ym1-0.5)*(ym1-0.5) < 0.0004 && (yh-1.4142136)*(yh-1.4142136) < 0.0004 && (yq-1.1892071)*(yq-1.1892071) < 0.0004 && (ymh-0.7071068)*(ymh-0.7071068) < 0.0004}

:::div.reveal
**Erano i tuoi gradini, disegnati.**

Ecco la curva che li unisce tutti: è il grafico di $y = 2^x$.

:::graph
expr: "2^x"
xrange: "-3,4"
yrange: "-1,9"
boundpoints:
  - {x: -1, y: ym1, label: "-1"}
  - {x: -0.5, y: ymh, label: "-1/2"}
  - {x: 0, y: y0, label: "0"}
  - {x: 0.25, y: yq, label: "1/4"}
  - {x: 0.5, y: yh, label: "1/2"}
  - {x: 1, y: y1, label: "1"}
  - {x: 2, y: y2, label: "2"}
  - {x: 3, y: y3, label: "3"}
  - {x: a, y: "2^a", label: "punto di prova"}
:::

Sono gli **stessi punti** che hai scritto tu, e stanno tutti sulla curva. Tra un gradino intero e l'altro non c'è nessuno strappo: la curva passa da tutti i punti che hai messo, e anche da tutti quelli che non hai messo: prova a cambiare la $x$:

$x = $ ${a}{a|-2|-3,3,0.01}

:::table
|x|y|
|-|-|
|$ ${a}$|$2^ {${a}} = ${= 2**a}$|
:::

:::

---

> id: grafico-esponenziale
> title: Il grafico della funzione esponenziale

# Cambia la base

Muovi la base e osserva la famiglia intera. Ricorda le condizioni: $a > 0$, $a \neq 1$.

Base: ${a}{a|2|0.2,4,0.1}

$$y = ${a}^{x}$$

:::graph
expr: "a^x"
bind: a
xrange: "-3,4"
yrange: "-1,9"
:::

Rispondi guardando il grafico.

- Tutte le curve passano per lo stesso punto. Quale? 

[[*$(0;1)$|$(1;0)$|$(1;1)$]]

- Con base $a$ maggiore di 1 la curva [[select: *cresce|decresce|resta piatta]]; con base tra 0 e 1 [[select: cresce|*decresce|resta piatta]].

- Quando la base è $\frac12$ il grafico è quello di base 2 [[select: *ribaltato a specchio|traslato in alto|identico]] — proprio come le due scale capovolte del secondo step.

- La curva tocca l'asse delle $x$? [[Sì, in x=0|*No, mai: $a^x$ è sempre positivo|Sì, per x molto grandi]]

:::div.reveal
**Non hai guardato quattro dettagli: hai guardato una sola forma.**

Tutto quello che hai letto sul grafico era già scritto nella scala della lezione
scorsa — il grafico si limita a farlo vedere tutto insieme.

- **Passano tutte per $(0;1)$**, perché $a^0 = 1$ per qualunque base: è il gradino
  da cui parte ogni scala, prima ancora di sapere quale sia la base.
- **Con $a > 1$ la curva sale, con $0 < a < 1$ scende**: salire di un gradino
  significa moltiplicare per $a$, e moltiplicare per un numero maggiore di 1
  fa crescere, per un numero minore di 1 fa calare.
- **Base $\frac12$ è base $2$ a specchio**, perché $\left(\frac12\right)^x = 2^{-x}$:
  cambiare la base nel suo reciproco equivale a cambiare segno all'esponente, cioè
  a scambiare destra e sinistra. È la stessa formula del secondo step della lezione
  scorsa, letta su un grafico.
- **Non tocca mai l'asse $x$**: dividere per 2 all'infinito rende il valore piccolo
  quanto vuoi, ma un numero positivo diviso 2 resta positivo. La curva si avvicina
  all'asse senza raggiungerlo — l'asse $x$ è un **asintoto orizzontale**.

:::graph
xrange: "-3,4"
yrange: "-1,9"
functions:
  - expr: "2^x"
  - expr: "(1/2)^x"
:::

Ecco perché le condizioni sulla base sono quelle che sono: con $a = 1$ la curva
sarebbe la retta piatta $y = 1$ (moltiplicare per 1 non muove niente), e con
$a < 0$ non ci sarebbe nemmeno una curva, perché già $a^{\frac12}$ chiederebbe la
radice quadrata di un numero negativo.

In sintesi, per $a > 0$ e $a \neq 1$ la funzione $y = a^x$:

- è definita per **ogni** $x$ reale (l'abbiamo costruita apposta, gradino dopo gradino);
- assume **solo valori positivi**: $y > 0$, e tutti i positivi vengono assunti una volta sola;
- è sempre crescente oppure sempre decrescente, **mai entrambe le cose**.

:::

---

> id: interesse-composto
> title: Interese composto
> use-mathjs: true

# Quale delle due?

Hai 1000 €, e due offerte:

:::div.highlight
**Banca A** — ti do il **12% all'anno** di interesse.

**Banca B** — ti do l'**1% al mese** di interesse.
:::

Scegli adesso, di pancia, senza calcolare niente — poi tieni a mente la tua risposta.

Se hai pensato "è la stessa cosa", allora hai in mente **l'interesse semplice**: l'1% di 1000€ è 10€ e ad ogni mese guadagniamo quella cifra fissa di interesse:

:::table
|v     | Mese | Capitale                  | v $+10$      |
| ---- | ---- | ------------------------- | ------------ |
|      | $0$  | 1000                      |              |
|      | $1$  | 1010                      |              |
|      | $2$  | ${is2}{is2|1020|input}    |              |
| $+9$ | $3$  | ${is3}{is3|1030|input}    | $+10\cdot 9$ |
|      | $12$ | ${is12}{is12|1120|input}  |              |
:::

:::graph
expr: "1000+10*x"
xrange: "-1,13"
yrange: "900,1500"
aspect: free
xticks: 1
yticks: 30
boundpoints:
  - {x: 0, y: 1000, label: "iniziale"}
  - {x: 1, y: 1010, label: "1 mese"}
  - {x: 2, y: is2, label: "2 mesi"}
  - {x: 3, y: is3, label: "3 mesi"}
  - {x: 12, y: is12, label: "12 mesi"}
:::

Verifica che tutti i punti stiano sulla retta: la crescita è **lineare**. Scopriamo invece come funziona l'**interesse composto**.

## Un anno alla volta, composto

Mettiamo 1000 € al 10% annuo e non tocchiamo più niente. Ogni anno la banca aggiunge
il 10% di **quello che c'è in quel momento** — non di quello che avevi all'inizio.

Per aggiungere il 10% si può moltiplicare per $ 1{,}1$: $1$ per riottenere il 100%, più $0{,}10$ per aggiungere un decimo.

*(Scrivi solo il numero, senza il simbolo dell'euro.)*

:::table
| Anno | Capitale        | v $\times\ 1{,}10$ |
| ---- | --------------- | ------------------- |
| $0$  | 1000            |
| $1$  | [[1100]]        |
| $2$  | [[1210]]        |
| $3$  | [[1331]]        |
:::

Al primo anno l'interesse è 100 €, al secondo è [[110]] €, al terzo è [[121]] €:
l'interesse **cresce da solo**, perché ogni anno si calcola su un capitale più grande.

Ma la freccia a lato è sempre la stessa: aggiungere il 10% vuol dire moltiplicare per
$1{,}10$. È la scala esponenziale delle prime lezioni, con un'etichetta nuova sulla freccia.

Quindi dopo $n$ anni:

:::formula
@c1{1000} \cdot @b1{1{,}10}^{@n1{n}}

c1 -> c1 : il capitale iniziale è solo un fattore | sopra
b1 -> n1 : la base è "1 + il tasso", l'esponente conta gli anni
:::

## Quanti anni per raddoppiare?

Muovi gli anni e guarda il capitale.

Anni: ${n}{n|1|0,20,1}

$$1000 \cdot 1{,}10^{${n}} = ${= 1000*1.1^n}$$

Fermati sul **primo** anno in cui hai più di 2000 €.

[Verifica l'anno del raddoppio]{check: 1000*1.1^n >= 2000 and 1000*1.1^(n-1) < 2000}

E se fossi partito da 100 € invece che da 1000? Il raddoppio arriverebbe
[[select: molto più tardi|prima|*nello stesso anno]].

:::div.reveal
**Questa non è una formula nuova: è l'esponenziale $y = a^x$ moltiplicata per il capitale iniziale.**

:::formula
@c1{C_0} \cdot \left(1 + @i1{i}\right)^{@n1{n}}

c1 -> c1 : il capitale iniziale | sopra
i1 -> i1 : il tasso di crescita | sotto
n1 -> n1 : il numero di anni | sopra
:::

È la **formula del capitale composto**, e ogni pezzo ha un ruolo che riconosci:

- la **base** $1 + i$ è il fattore della freccia: $> 1$ perché $i = 0{,}10$ e il capitale cresce;
- l'**esponente** $n$ è il numero di gradini, cioè gli anni;
- il **capitale iniziale** $C_0$ moltiplica tutto, e per questo non sposta il tempo di
  raddoppio: raddoppiare dipende solo da quando $1{,}10^n$ arriva a 2, e lì $C_0$ non
  compare.

E la curva è una vecchia conoscenza: è $y = 1{,}10^x$, cioè la famiglia di esponenziali con la base (un po') maggiore di 1.

:::graph
functions:
  - expr: "1000*1.1^x"
  - expr: "1000 + 100*x"
xrange: "-1,11"
yrange: "900,3400"
aspect: free
xticks: 1
yticks: 100
boundpoints:
  - {x: 0, y: 1000, label: "iniziale"}
  - {x: 3, y: 1331, label: "3 anni"}
  - {x: 8, y: 2143, label: "8 anni: raddoppio"}
  - {x: 8, y: 1800, label: "con interesse semplice"}
:::

Attenzione all'errore più comune: **non** è $1000 + 100n$ (quella è la formula per l'interesse semplice: è lineare). Al primo anno le due danno lo stesso numero — ed è proprio per questo che ci si confonde!
:::

---

> id: spezzettare-anno
> title: Il numero di Nepero

# Lo stesso tasso, versato più spesso

Torniamo alle due banche in cui investiamo 1000€. La banca A ti offre il 12%, tutto insieme a fine anno, la banca B a fettine più piccole e più frequenti: 1% ogni mese.

Dopo un anno la banca A ti darà [[1120,00 || 1120]] €.

Per calcolare quanto vale l'investimento nella banca B dopo 12 mesi usiamo la formula dell'interesse composto, solo che ora contiamo il tempo in mesi: calcola con la calcolatrice

:::formula
C (12) = @c1{C_0} \cdot \left(1 + @i1{i}\right)^{@n1{n}}

c1 -> c1 : 1000 € | sopra
i1 -> i1 : 1% cioè 0,01 | sotto
n1 -> n1 : 12 mesi | sopra
:::

Allora in banca B ritireremo (inserisci fino ai centesimi di euro) [[1126,83]] €. Ti aspettavi questo risultato?

**Vince la Banca B**, quella dell'1% al mese. La risposta non era "sono uguali".

Ma non è che aumentando la frequenza del calcolo degli interessi possiamo ottenere sempre di più? Facciamo un calcolo con numeri semplici: diciamo di investire 1€ (se vuoi pensa che sia un milione 😀) e che **il tasso di interesse annuo sia del 100%** (ogni anno raddoppia).

Possiamo scegliere se ottenere gli interessi $2$ volte l'anno con il 50% cioè $i = 0{,}5 = \frac{1}{2}$ , oppure 4 volte l'anno al 25% cioè $i= 0{,}25 = \frac{1}{4}$... Se otteniamo gli interessi $n$ volte in un anno allora l'interesse si spezzetta in $n$ interessi da $\frac{1}{n}$

:::formula
@cn{C} = @c0{1} \cdot \left(1 + @i{\frac{1}{n}}\right)^{@n{n}}

cn -> cn : capitale dopo 1 anno
c0 -> c0 : 1 € | sopra
i  -> i  : interesse spezzettato | sotto
n  -> n :  volte in cui percepiamo l'interesse | sopra
:::

*(Quattro cifre dopo la virgola.)*

:::table
| Ogni quanto | $n$       | $\left(1 + \frac{1}{k}\right)^{k}$ |
| ----------- | --------- | ---------------------------------- |
| ogni anno   | $1$       | $2^1 =$ [[2]]                      |
| ogni 6 mesi | $2$       | $1{,}5^2 =$ [[2,25 || 2.25 || 2,2500 || 2.2500]] |
| ogni 3 mesi | $4$       | $1{,}25^4 =$ [[2,4414 || 2.4414 || 2,4414... || 2,44140625]] |
| ogni mese   | $12$      | 2,6130                             |
| ogni giorno | $365$     | 2,7146                             |
| ogni secondo| $31{\,}536{\,}000$ | 2,7183                    |
:::

Raddoppiare la frequenza all'inizio guadagna 0,25; dalle ultime due righe si guadagna
[[select: ancora tanto|*quasi niente|niente del tutto]], pur passando da 365 a trenta
milioni di volte.

I valori si stringono attorno a un unico numero. Quale?

[[$2{,}5$|$2{,}72$ esatto|*$2{,}718281828\ldots$|$3$]]

:::div.reveal
**È lo stesso ragionamento di $2^{\sqrt{2}}$.**

Anche lì avevamo una colonna di numeri che cresceva sempre di meno e si stringeva su
un valore che non potevamo calcolare in un colpo solo. Qui succede identico, e il
numero che ne esce ha un nome:

$$e = 2{,}718281828\ldots$$

Si chiama **numero di Nepero**, ed è irrazionale come $\pi$: le cifre non finiscono e
non si ripetono. Nessuno l'ha scelto — è il valore a cui è **costretto** a fermarsi
l'interesse spezzettato all'infinito.

Il caso $k$ enorme si chiama **capitalizzazione continua**, e la formula generale
diventa:

$$C = C_0 \cdot e^{i \cdot n}$$

Da qui in poi, ogni volta che qualcosa cresce **senza aspettare la fine dell'anno** —
una popolazione, un batterio che si divide, una sostanza che decade — la base naturale
non è 2 e non è 10: è il numero di Nepero $e$. 

E $y = e^x$ è una curva della famiglia che hai già studiato, con la base fra 2 e 3:

Base: ${b}{b|2|2,3,0.01}

$$y = ${b}^{x}$$

:::graph
functions:
  - expr: "b^x"
  - expr: "exp(x)"
bind: b
xrange: "-3,4"
yrange: "-1,9"
:::

Sta esattamente dove ti aspetti: fra $y = 2^x$ e $y = 3^x$, e passa per $(0;1)$ come
tutte le altre. Non è una curva speciale per forma — lo diventerà per un altro motivo,
quando studierai le derivate.
:::