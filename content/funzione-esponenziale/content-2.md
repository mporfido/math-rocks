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

$x = $ ${a}{a|-2|-3,3,0.05}

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

Muovi la base e osserva come cambia la curva. Ricorda le condizioni: $a > 0$, $a \neq 1$.

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

---

> id: equazioni-esponenziali
> title: Equazioni esponenziali
> use-mathjs: true

# La domanda al contrario

Finora abbiamo sempre chiesto la stessa cosa: *scelgo l'esponente, quanto vale la
potenza?* Scegli $x$, leggi $y$. È il verso in cui abbiamo costruito la curva,
gradino dopo gradino.

Adesso giriamo la domanda:

:::div.highlight
Il capitale è arrivato a **8 volte** quello di partenza. **Dopo quanti raddoppi?**

$$2^x = 8$$
:::

Sul grafico questa domanda ha una forma precisa. "Il valore vale 8" vuol dire
"sono all'altezza 8", cioè sulla **retta orizzontale** $y = 8$. E allora la
domanda diventa: *dove la retta incontra la curva?*

## Cercalo a mano

Muovi l'esponente e guarda il punto salire lungo la curva. Fermati quando atterra
sulla retta.

Esponente: ${t}{t|0|-1,4,0.25}

:::graph
xrange: "-1,4"
yrange: "-1,10"
bind: t
functions:
  - expr: "2^x"
  - expr: "8"
boundpoints:
  - {x: t, y: "2^t", label: "il tuo punto"}
:::

[Verifica il punto di incontro]{check: abs(2^t - 8) < 0.01}

Quante volte, in tutto, quella retta taglia la curva?

[[*Una sola volta|Due volte|Nessuna]]

Non poteva andare diversamente: la curva **sale sempre**, non torna mai indietro
sui suoi passi. Una volta superata l'altezza 8, non ci ripassa più. Lo avevi già
scritto due step fa: ogni valore positivo viene assunto **una volta sola**.

## E senza grafico?

Per confrontare i due membri serve la **stessa base** a destra e a sinistra.
Scritto come potenza di 2, $8$ è [[$2^3$|$3^2$|$2^4$]]

L'equazione diventa allora $2^x = 2^3$: due potenze con la stessa base sono
uguali soltanto se hanno lo stesso esponente. Quindi $x =$ [[3]]

:::div.reveal
**Il grafico e il conto dicono la stessa cosa.**

:::formula
@a1{a}^{@f1{f(x)}} = @a2{a}^{@g1{g(x)}} \quad \Longrightarrow \quad @f2{f(x)} = @g2{g(x)}

a1 -> a2 : deve essere la stessa base | sotto
f1 -> f2 : primo esponente | sopra
g1 -> g2 : secondo esponente | sopra
:::

Questo passaggio — buttare via la base e tenere gli esponenti — non è una
scorciatoia: è esattamente la proprietà che hai letto sul grafico. Se a due
esponenti diversi corrispondessero valori uguali, la curva dovrebbe tornare
all'altezza da cui era partita, cioè scendere e risalire. Ma non lo fa mai.

Ecco perché una retta orizzontale la taglia **al massimo in un punto**, e perché
un'equazione esponenziale immediata ha **al massimo una soluzione**:

:::graph
xrange: "-1,4"
yrange: "-1,10"
functions:
  - expr: "2^x"
  - expr: "8"
boundpoints:
  - {x: 3, y: 8, label: "l'unica soluzione"}
:::
:::

---

> id: stessa-base
> title: Ridurre alla stessa base

# Una sola mossa, sempre quella

Risolvere un'equazione esponenziale immediata vuol dire fare una cosa sola:
**scrivere i due membri come potenze della stessa base**. Da lì in poi gli
esponenti si confrontano da soli.

Il bello è che gli strumenti per riscrivere li hai già tutti: esponenti negativi,
esponente zero, esponenti frazionari, la scala capovolta.

*(Dove serve, scrivi il risultato come frazione: per esempio `1/2`.)*

| Equazione | La chiave per riscrivere | $x =$ |
| --------- | ------------------------ | ----- |
| $3^x = 81$ | $81 = 3^4$ | [[4]] |
| $2^x = \frac{1}{8}$ | un esponente negativo | [[-3]] |
| $5^x = 1$ | il gradino da cui parte ogni scala | [[0]] |
| $9^x = 3$ | $9 = 3^2$, e l'esponente diventa una frazione | [[1/2]] |
| $2^{x+1} = 16$ | l'esponente non deve essere per forza la sola $x$ | [[3]] |
| $\left(\frac{1}{2}\right)^x = 8$ | la scala capovolta della prima lezione | [[-3]] |

## Quando la retta non tocca mai

Proviamo a chiedere qualcosa di diverso: $2^x = -4$. Traccia la retta $y = -4$ e
guarda dove incontra la curva.

:::graph
xrange: "-1,4"
yrange: "-5,10"
functions:
  - expr: "2^x"
  - expr: "-4"
:::

La retta passa tutta [[select: *sotto la curva|sopra la curva|a cavallo della curva]],
e allora l'equazione ha [[select: *nessuna soluzione|una soluzione|due soluzioni]].

Stessa sorte per $2^x = 0$: lì la retta è l'asse delle $x$, e l'asse delle $x$ è
l'**asintoto** — la curva ci si avvicina quanto vuoi ma non lo tocca mai.

:::div.reveal
**Non c'è niente da calcolare: basta guardare l'altezza.**

L'esponenziale assume **tutti e soli** i valori positivi. Quindi:

$$a^x = b \quad \text{ha soluzione se e solo se } b > 0 \quad \text{(e allora è unica)}$$

Non è una regola in più da ricordare: è la stessa frase di prima — la curva sta
tutta sopra l'asse — detta in forma di equazione.

## Un caso che resta aperto

E $2^x = 5$? Qui $5$ è positivo, quindi la retta la curva **la taglia**: la
soluzione esiste, ed è una sola. Sta fra 2 e 3, perché $2^2 = 4$ e $2^3 = 8$.

:::graph
xrange: "-1,4"
yrange: "-1,10"
functions:
  - expr: "2^x"
  - expr: "5"
boundpoints:
  - {x: "log(5)/log(2)", y: 5, label: "esiste — ma come si scrive?"}
:::

Solo che $5$ non è una potenza comoda di $2$: per quanto lo rigiri, non c'è modo
di riscrivere i due membri con la stessa base. Il punto sul grafico c'è, ma il
suo esponente non sappiamo **nominarlo**.

Ci vuole uno strumento nuovo, che serve esattamente a questo: dare un nome
all'esponente. Si chiama **logaritmo**, ed è la prossima lezione.
:::

---

> id: disequazioni-esponenziali
> title: Disequazioni esponenziali
> use-mathjs: true

# Non "dove incontra", ma "dove sta sopra"

Cambiamo di nuovo la domanda, di pochissimo:

$$2^x > 8$$

Non chiediamo più *dove* la curva incontra la retta $y = 8$, ma **per quali $x$
le sta sopra**. La retta è la stessa, la curva è la stessa: cambia solo che cosa
stiamo guardando.

## Guarda il punto, non il conto

Esponente: ${t}{t|0|-1,4,0.25}

$$ 2^{${t}} = ${= 2^t} $$

:::graph
xrange: "-1,4"
yrange: "-1,10"
bind: t
functions:
  - expr: "2^x"
  - expr: "8"
boundpoints:
  - {x: t, y: "2^t", label: "il tuo punto"}
:::

Il punto sta sopra la retta [[select: *quando l'esponente supera 3|quando l'esponente è minore di 3|sempre]].

Quindi la soluzione della disequazione è $x >$ [[3]]

## Le soluzioni, disegnate

Il tratto in verde è la parte di curva che sta sopra la retta; sotto, sull'asse
delle $x$, ci sono gli esponenti che la producono — cioè **l'insieme delle
soluzioni**.

:::graph
xrange: "-1,4.5"
yrange: "-1,10"
functions:
  - expr: "2^x"
  - expr: "8"
  - expr: "2^x"
    xclip: "3,4.5"
    color: "#2ecc71"
  - expr: "0"
    xclip: "3,4.5"
    color: "#2ecc71"
boundpoints:
  - {x: 3, y: 8, label: "3"}
:::

Il punto di incontro fa da **confine**: prima la curva sta sotto, dopo sta sopra.
Risolvere l'equazione e risolvere la disequazione sono lo stesso lavoro — la
disequazione in più deve solo decidere **da che parte** del confine stare.

## Prova tu

- $3^x < 27$, cioè $3^x < 3^3$, quindi $x <$ [[3]]
- $2^x \ge 1$, cioè $2^x \ge 2^0$, quindi $x \ge$ [[0]]

E due casi in cui non c'è nessun confine da trovare:

- $2^x > -1$ è [[select: *sempre vera|mai vera|vera solo per x maggiore di 0]]
- $2^x < 0$ è [[select: sempre vera|*mai vera|vera solo per x minore di 0]]

Ancora la stessa ragione di prima: la curva sta **tutta** sopra l'asse.

:::div.reveal
**Con la base maggiore di 1, il verso non cambia.**

$$a^{f(x)} > a^{g(x)} \iff f(x) > g(x) \qquad \text{(per } a > 1\text{)}$$

Su una curva che sale sempre, "stare più a destra" e "stare più in alto" sono la
stessa cosa: a un esponente più grande corrisponde sempre un valore più grande,
senza eccezioni. Passare dagli esponenziali agli esponenti conserva l'ordine.

Sarà ancora vero se la curva, invece di salire, scende?
:::

---

> id: verso-che-si-inverte
> title: Il verso che si inverte

# Quando la scala scende

Stessa disequazione di prima, ma con la base minore di 1:

$$\left(\frac{1}{2}\right)^x > 2$$

Prima di rispondere, guarda. La curva è quella di base $\frac12$ — la scala
capovolta — e la retta è $y = 2$.

:::graph
xrange: "-3,3"
yrange: "-1,9"
functions:
  - expr: "(1/2)^x"
  - expr: "2"
boundpoints:
  - {x: -1, y: 2, label: "-1"}
:::

La curva sta sopra la retta [[select: *a sinistra di -1|a destra di -1|dappertutto]],
quindi la soluzione è $x <$ [[-1]]

Attenzione a che cosa è appena successo: il confine si trova sempre allo stesso
modo ($2 = \left(\frac12\right)^{-1}$, quindi il punto di incontro è $-1$), ma la
disequazione era "maggiore" e la soluzione è venuta "minore". **Il verso si è
capovolto.**

## Le due curve insieme

Ecco perché, in un colpo solo. Stessa retta $y = 2$, due curve: una che sale e
una che scende.

:::graph
xrange: "-3,3"
yrange: "-1,9"
functions:
  - expr: "2^x"
  - expr: "(1/2)^x"
  - expr: "2"
:::

Sopra la retta ci finiscono i punti a **destra** di 1 per la curva che sale, e
quelli a **sinistra** di $-1$ per la curva che scende. Le due curve sono l'una il
riflesso dell'altra: quello che una fa andando avanti, l'altra lo fa andando
indietro.

## Prova tu

- $\left(\frac{1}{3}\right)^x < 3$: il confine è $-1$ (perché $3 = \left(\frac13\right)^{-1}$), quindi $x >$ [[-1]]
- $\left(\frac{1}{2}\right)^x \le \frac{1}{4}$: il confine è $2$, quindi $x \ge$ [[2]]

E una domanda di metodo: davanti a una disequazione esponenziale, la prima cosa
da guardare è [[select: *se la base è maggiore o minore di 1|il segno dell'esponente|quanto è grande il numero a destra]].

:::div.reveal
**Solo due cose da ricordare.**

| | $a^{f(x)} = a^{g(x)}$ | $a^{f(x)} > a^{g(x)}$ |
| --- | --- | --- |
| $a > 1$ — la curva sale | $f(x) = g(x)$ | $f(x) > g(x)$ — verso conservato |
| $0 < a < 1$ — la curva scende | $f(x) = g(x)$ | $f(x) < g(x)$ — verso invertito |

L'**equazione** non si accorge della base: non ha nessun verso da conservare, e
il punto di incontro è uno solo comunque vada. È la **disequazione** che deve
sapere in che direzione va la curva.

Nelle prossime lezioni vedremo cosa succede quando i due membri **non** si
riducono alla stessa base, come in $2^x = 5$. Lì la soluzione esiste, si vede sul
grafico, ma per scriverla serve introdurre il concetto di logaritmo.
:::