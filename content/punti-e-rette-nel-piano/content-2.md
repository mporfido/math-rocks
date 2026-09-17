> id: il-club-dei-punti-in-fila
> title: Equazione della retta e coefficiente angolare
> description: Un'equazione è la regola per entrare in un club di punti. I soci del club stanno tutti su una retta. Due numeri bastano a descrivere la retta, cioè quanto sale e dove taglia l'asse y.

---

> id: il-club-segreto
> title: L'equazione come regola di appartenenza
> use-mathjs: true

# Chi entra e chi no

Ho un club segreto. Non ti dico la regola per entrare. Ti dico solo quali punti sono soci e quali punti sono rimasti fuori.

| Soci | Non soci |
| --- | --- |
| $(0; 1)$ | $(1; 4)$ |
| $(1; 3)$ | $(3; 5)$ |
| $(2; 5)$ | $(2; 6)$ |
| $(4; 9)$ | |

Il punto $(7; \ldots)$ vuole entrare nel club. Quale ordinata deve avere? [[15]]

:::details.hint
<summary>💡 Suggerimento</summary>

Guarda i primi tre soci nella tabella qui sotto. Le frecce a sinistra dicono che l'ascissa cresce di 1 da una riga all'altra. Di quanto cresce l'ordinata ogni volta?

:::table
| v $+1$ | ascissa | ordinata | v ? |
| --- | --- | --- | --- |
| | $0$ | $1$ |
| | $1$ | $3$ |
| | $2$ | $5$ |
:::

:::

Qual è la regola del club?

[[l'ordinata è dispari|l'ordinata è l'ascissa più 2|*l'ordinata è il doppio dell'ascissa, più 1]]

:::details.hint
<summary>💡 Suggerimento</summary>

Tutti i soci hanno l'ordinata dispari. Però anche il punto $(3; 5)$ ha l'ordinata dispari, e il punto $(3; 5)$ è rimasto fuori. Quindi la regola non può essere «l'ordinata è dispari».

:::

Adesso tocca a te. Inventa **due soci nuovi** che non sono già nella lista. Poi inventa **un punto che resta fuori**.

| | ascissa | ordinata |
| --- | --- | --- |
| Primo socio | ${sax}{sax||input} | ${say}{say||input} |
| Secondo socio | ${sbx}{sbx||input} | ${sby}{sby||input} |
| Escluso | ${ex}{ex||input} | ${ey}{ey||input} |

[Verifica]{check: say == 2*sax + 1 and sby == 2*sbx + 1 and sax != sbx and sax != 0 and sax != 1 and sax != 2 and sax != 4 and sbx != 0 and sbx != 1 and sbx != 2 and sbx != 4 and not isNaN(ex) and not isNaN(ey) and ey != 2*ex + 1}

:::details.hint
<summary>💡 Suggerimento</summary>

Per un socio nuovo, scegli un'ascissa che non c'è nella lista. Va bene anche un numero negativo. Poi calcola l'ordinata con la regola. Per il punto escluso, prendi un socio e cambia la sua ordinata.

:::

:::div.reveal
La regola è questa: **l'ordinata è il doppio dell'ascissa, più 1**. Chiamiamo $x$ l'ascissa e $y$ l'ordinata. Allora la regola si scrive così:

$$y = 2x + 1$$

Adesso chiunque può controllare se un punto è socio. Fai il conto con l'ascissa e guarda se ottieni l'ordinata del punto. Per $(7; 15)$ il conto è $2 \cdot 7 + 1 = 15$. Il risultato è uguale all'ordinata, quindi il punto è socio. Per $(3; 5)$ il conto è $2 \cdot 3 + 1 = 7$. Il risultato non è $5$, quindi il punto resta fuori.
:::

---

> id: un-altro-club
> title: I due numeri che descrivono la regola

# Un secondo club

Ecco un secondo club. I suoi soci sono $(0; -2)$, $(1; 1)$, $(2; 4)$ e $(-1; -5)$.

Qual è la regola di questo club?

[[$y = 2x - 2$|$y = 3x + 2$|*$y = 3x - 2$|$y = x - 2$]]

:::details.hint
<summary>💡 Suggerimento</summary>

Metti i soci in ordine di ascissa: $(-1; -5)$, $(0; -2)$, $(1; 1)$, $(2; 4)$. Poi guarda di quanto cresce l'ordinata a ogni passo. Infine prova ogni regola su due soci.

:::

Adesso confrontiamo i due club. Nelle tabelle i soci sono in fila, dall'ascissa più piccola alla più grande. Le frecce a sinistra dicono di quanto cresce l'ascissa. Le frecce a destra dicono di quanto cresce l'ordinata.

Questa è la tabella del primo club, $y = 2x + 1$:

:::table
| v $+1$ | $x$ | $y$ | v $+2$ |
| --- | --- | --- | --- |
| | $-1$ | $-1$ |
| | $0$ | $1$ |
| | $1$ | $3$ |
| | $2$ | $5$ |
:::

Questa è la tabella del secondo club, $y = 3x - 2$. Completa tu le frecce a destra.

:::table
| v $+1$ | $x$ | $y$ | v |
| --- | --- | --- | --- |
| | $-1$ | $-5$ | [[+3 || 3]] |
| | $0$ | $-2$ | [[+3 || 3]] |
| | $1$ | $1$ | [[+3 || 3]] |
| | $2$ | $4$ | |
:::

Guarda il socio che ha ascissa $0$. Nel primo club la sua ordinata è [[1]]. Nel secondo club la sua ordinata è [[-2 || −2]].

:::div.reveal
Guarda dove si trovano i numeri che hai trovato:

$$y = \mathbf{2}x + \mathbf{1} \qquad\qquad y = \mathbf{3}x - \mathbf{2}$$

Il numero che moltiplica la $x$ dice **di quanto cresce l'ordinata a ogni passo**. Il numero alla fine è **l'ordinata del socio che ha ascissa 0**. Questo succede sempre. Quando $x = 0$, la moltiplicazione dà zero e resta solo l'ultimo numero.

I due club hanno la stessa forma. Cambiano solo due numeri. Se conosci quei due numeri, conosci tutto il club.
:::

---

> id: la-regola-la-do-io
> title: Verificare se un punto appartiene

# Usare la regola

Questo club ha la regola $y = 4x - 3$. Questa volta non devi indovinare la regola. Devi usarla.

Metti ogni punto nel gruppo giusto.

:::smista goal categorie="socio;non socio"
(1;\ 1) -> socio
(2;\ 5) -> socio
(-1;\ -7) -> socio
(3;\ 8) -> non socio
(0;\ 3) -> non socio
(2;\ 4) -> non socio
:::

Il punto $(25; 97)$ è molto lontano e non lo puoi disegnare facilmente. È un socio? [[*sì|no]]

Adesso fai il contrario. Un socio ha ordinata $21$. Qual è la sua ascissa? [[6]]

:::details.hint
<summary>💡 Suggerimento</summary>

In questo caso conosci la $y$ e devi trovare la $x$. L'equazione è $4x - 3 = 21$. Cerca il numero che, moltiplicato per 4 e diminuito di 3, dà 21.

:::

:::div.reveal
Quando conosci la regola, controllare un punto è un semplice conto. Metti le coordinate del punto al posto di $x$ e di $y$. Poi guarda se i due lati dell'uguale danno lo stesso numero. Per $(25; 97)$ il conto è $4 \cdot 25 - 3 = 97$. I due lati sono uguali, quindi il punto è socio.

La regola funziona anche al contrario. Se conosci l'ordinata, ottieni un'equazione. Risolvi $4x - 3 = 21$ e trovi $x = 6$. Il socio è $(6; 21)$.
:::

---

> id: i-soci-in-fila
> title: Tabella dei valori e grafico della retta
> use-mathjs: true

# Finalmente un disegno

Vogliamo disegnare i soci del primo club, $y = 2x + 1$. I soci sono infiniti e non possiamo disegnarli tutti. Allora ne scegliamo alcuni. Il lavoro si fa in tre passi.

**Primo passo.** Scegli alcuni valori per la $x$. Qui prendiamo $-2$, $-1$, $0$, $1$ e $2$.

**Secondo passo.** Per ogni valore della $x$ calcola la $y$ con la regola. Scrivi i risultati nella tabella.

:::table
| $x$ | $y = 2x + 1$ |
| --- | --- |
| $-2$ | [[-3 || −3]] |
| $-1$ | [[-1 || −1]] |
| $0$ | [[1]] |
| $1$ | [[3]] |
| $2$ | [[5]] |
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Metti il valore della $x$ al posto della lettera. Con $x = -2$ il conto è $2 \cdot (-2) + 1 = -4 + 1 = -3$.

:::

**Terzo passo.** Ogni riga della tabella è un punto. La $x$ è l'ascissa e la $y$ è l'ordinata. Metti i cinque punti sul piano.

:::graph
snap: 1
verify: true
xrange: "-6,6"
yrange: "-6,6"
points:
  - target: "-2,-3"
  - target: "-1,-1"
  - target: "0,1"
  - target: "1,3"
  - target: "2,5"
:::

Come sono disposti i soci sul piano? [[sono sparsi, senza un ordine|stanno su una linea curva|*stanno in fila su una linea dritta]]

Adesso fai tu i tre passi con un altro club, $y = 3x - 4$. Questa volta i valori della $x$ li scegli tu. Mentre scrivi, i punti compaiono sul piano.

| Punto | $x$ | $y$ |
| --- | --- | --- |
| A | ${pax}{pax||input} | ${pay}{pay||input} |
| B | ${pbx}{pbx||input} | ${pby}{pby||input} |
| C | ${pcx}{pcx||input} | ${pcy}{pcy||input} |

:::graph
xrange: "-6,6"
yrange: "-6,6"
boundpoints:
  - {x: pax, y: pay, label: A}
  - {x: pbx, y: pby, label: B}
  - {x: pcx, y: pcy, label: C}
:::

[Verifica]{check: pay == 3*pax - 4 and pby == 3*pbx - 4 and pcy == 3*pcx - 4 and pax != pbx and pax != pcx and pbx != pcx}

:::details.hint
<summary>💡 Suggerimento</summary>

Scegli tre valori diversi della $x$. Numeri piccoli come $0$, $1$, $2$ e $3$ vanno bene, perché i punti restano dentro il disegno. Poi calcola la $y$ di ognuno. Con $x = 2$ il conto è $3 \cdot 2 - 4 = 2$.

:::

:::div.reveal
Per disegnare una retta si fa sempre così. Scegli alcuni valori della $x$. Calcola la $y$ di ognuno con l'equazione. Scrivi le coppie in una tabella. Ogni riga della tabella è un punto. Alla fine metti i punti sul piano.

I soci di un club **stanno tutti su una retta**. Anche ogni punto di quella retta è un socio. Quindi il club e la retta sono la stessa cosa. L'equazione $y = 2x + 1$ è la regola per entrare. La retta è il disegno di tutti i punti che rispettano la regola.

Conviene calcolare almeno tre punti. Se un punto non sta in fila con gli altri, c'è un errore nei conti.
:::

---

> id: di-quanto-sale
> title: Salita e passo, un rapporto costante

# Lo scalino

Qui vedi la retta $y = 2x + 1$ e due suoi soci, $A$ e $B$. Puoi trascinare i due punti. I punti si muovono **solo lungo la retta**, perché fuori dalla retta non sarebbero più soci. Tra $A$ e $B$ c'è uno scalino. Lo scalino mostra quanti quadretti ci sono in orizzontale e quanti in verticale.

:::p5 sketch=retta-nel-piano height=380 m=2 q=1 ax=-1 bx=0 xmin=-5 xmax=5 ymin=-6 ymax=8
:::

Nella tabella ci sono tre scalini sulla stessa retta. Il primo va di $1$ a destra. Il secondo va di $3$ a destra. Il terzo va di $5$ a **sinistra**. Scrivi nelle frecce a destra di quanto cambia l'ordinata.

:::table
| v | $x$ | $y$ | v |
| --- | --- | --- | --- |
| $+1$ | $-2$ | $-3$ | [[+2 || 2]] |
| $+3$ | $-1$ | $-1$ | [[+6 || 6]] |
| $-5$ | $2$ | $5$ | [[-10 || −10]] |
| | $-3$ | $-5$ | |
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Puoi costruire ogni scalino sulla figura. Per il secondo scalino, porta $A$ in $x = -1$ e $B$ in $x = 2$. Poi conta di quanti quadretti sale. Nel terzo scalino vai verso sinistra. Andando a sinistra la retta scende. Quindi l'ordinata diminuisce e il cambio è negativo.

:::

Adesso sposta lo scalino lungo la retta e prova ad allungarlo. Dividi la salita per il passo. Il risultato [[cambia se sposti lo scalino|cambia se allunghi lo scalino|*è sempre lo stesso]].

:::div.reveal
Su questa retta la salita è sempre **il doppio** del passo. Con il passo $1$ la salita è $2$. Con il passo $3$ la salita è $6$. Con il passo $-5$ la salita è $-10$. Il rapporto tra salita e passo non cambia mai, anche se sposti o allunghi lo scalino.

Il passo e la salita hanno un nome. Il passo si chiama $\Delta x$ e la salita si chiama $\Delta y$. Il simbolo $\Delta$ è una lettera greca e si legge «delta». $\Delta x$ dice di quanto cambia la $x$. $\Delta y$ dice di quanto cambia la $y$. Questi cambiamenti si chiamano anche **incrementi**. Per questo il rapporto tra salita e passo si chiama **rapporto incrementale**:

$$\text{rapporto incrementale} = \frac{\Delta y}{\Delta x} = \frac{\text{salita}}{\text{passo}}$$

Nel secondo scalino della tabella $\Delta x = 3$ e $\Delta y = 6$. Il rapporto incrementale è $\dfrac{6}{3} = 2$.

Questo rapporto è proprio il numero $2$ dell'equazione $y = 2x + 1$.
:::

---

> id: piu-ripida-meno-ripida
> title: Coefficiente angolare e ordinata all'origine

# Tre rette per lo stesso punto

Queste tre rette passano tutte per il punto $(0; 1)$: $y = 2x + 1$, $y = -2x + 1$ e $y = \tfrac12 x + 1$. La prima la conosci già. Le altre due le guardiamo una alla volta.

La seconda retta è $y = -2x + 1$. Questa volta il numero davanti alla $x$ è negativo. Trascina $A$ e $B$ e guarda lo scalino.

:::p5 sketch=retta-nel-piano height=340 m=-2 q=1 ax=0 bx=1 xmin=-5 xmax=5 ymin=-6 ymax=6
:::

Completa la tabella. Nelle frecce a destra scrivi quanto vale $\Delta y$.

:::table
| v | $x$ | $y = -2x + 1$ | v |
| --- | --- | --- | --- |
| $+1$ | $0$ | $1$ | [[-2 || −2]] |
| $+2$ | $1$ | $-1$ | [[-4 || −4]] |
| | $3$ | $-5$ | |
:::

Quando vai verso destra, questa retta [[sale|*scende]]. Il suo rapporto incrementale è $\dfrac{\Delta y}{\Delta x} =$ [[-2 || −2]].

:::details.hint
<summary>💡 Suggerimento</summary>

Nella prima riga $\Delta x = 1$ e $\Delta y = -2$. Il segno meno dice che l'ordinata diminuisce. Dividi $\Delta y$ per $\Delta x$ e tieni il segno.

:::

La terza retta invece sale piano. Qui la vedi con il suo scalino:

:::p5 sketch=retta-nel-piano height=340 m=0.5 q=1 ax=0 bx=4 nome="y = ½x + 1" xmin=-6 xmax=6 ymin=-4 ymax=6
:::

Completa anche la sua tabella:

:::table
| v | $x$ | $y = \tfrac12 x + 1$ | v |
| --- | --- | --- | --- |
| $+2$ | $0$ | $1$ | [[+1 || 1]] |
| $+1$ | $2$ | $2$ | [[+0,5 || 0,5 || +0.5 || 0.5 || 1/2 || +1/2 || ½]] |
| | $3$ | $2{,}5$ | |
:::

Adesso guarda le tre rette insieme. La retta $y = 2x + 1$ è rossa. La retta $y = -2x + 1$ è blu. La retta $y = \tfrac12 x + 1$ è verde.

:::graph
xrange: "-6,6"
yrange: "-6,6"
functions:
  - expr: "2*x + 1"
    color: "#D7263D"
  - expr: "-2*x + 1"
    color: "#1F6FB2"
  - expr: "0.5*x + 1"
    color: "#2E8B57"
:::

Quale retta è la meno ripida? [[$y = 2x + 1$|$y = -2x + 1$|*$y = \tfrac12 x + 1$]]

La retta rossa e la retta blu sono ripide [[*allo stesso modo|in modo diverso]].

:::div.reveal
Le tre rette hanno pendenze diverse. La retta $y = 2x + 1$ sale di 2 quadretti a ogni passo verso destra. La retta $y = \tfrac12 x + 1$ sale solo di mezzo quadretto. La retta $y = -2x + 1$ invece **scende** di 2 quadretti a ogni passo verso destra.

Il numero davanti alla $x$ è sempre il rapporto incrementale $\dfrac{\Delta y}{\Delta x}$. Il suo segno dice da che parte va la retta. Quando il numero è positivo, $\Delta y$ ha lo stesso segno di $\Delta x$. Allora andando verso destra la retta sale. Quando il numero è negativo, $\Delta y$ ha il segno opposto a $\Delta x$. Allora andando verso destra la retta scende.

Il numero senza il segno dice quanto è ripida la retta. Per questo $y = 2x + 1$ e $y = -2x + 1$ sono ripide allo stesso modo. La prima sale e la seconda scende.

I due numeri dell'equazione hanno un nome:

:::formula
y = @m{m}\,x + @q{q}

m -> m : coefficiente angolare
q -> q : ordinata all'origine
:::

Il **coefficiente angolare** $m$ è il rapporto incrementale $\dfrac{\Delta y}{\Delta x}$. Dice di quanto cambia la $y$ a ogni passo verso destra. Se $m$ è positivo, la retta sale. Se $m$ è negativo, la retta scende. L'**ordinata all'origine** $q$ dice in quale punto la retta taglia l'asse $y$.

Le tre rette di questo step hanno tutte $q = 1$. Per questo si incontrano tutte nel punto $(0; 1)$.
:::

---

> id: due-soci-bastano
> title: Il coefficiente angolare da due punti

# Un club intero da due soci

Di un club conosci solo due soci, $(2; 7)$ e $(6; 19)$.

Da un socio all'altro $\Delta x = 4$. Quanto vale $\Delta y$?

:::table
| v | $x$ | $y$ | v |
| --- | --- | --- | --- |
| $+4$ | $2$ | $7$ | [[+12 || 12]] |
| | $6$ | $19$ | |
:::

Adesso trova i due numeri del club. Il coefficiente angolare è $m =$ [[3]]. L'ordinata all'origine è $q =$ [[1]].

:::details.hint
<summary>💡 Suggerimento</summary>

Il coefficiente angolare è il rapporto incrementale. Qui $\Delta y = 12$ e $\Delta x = 4$. Per trovare $q$, parti da $(2; 7)$ e torna indietro fino all'ascissa 0. Devi fare 2 passi indietro. A ogni passo indietro l'ordinata scende di $m$.

:::

Ecco due soci di un altro club, $(-1; 5)$ e $(3; -7)$.

:::table
| v | $x$ | $y$ | v |
| --- | --- | --- | --- |
| $+4$ | $-1$ | $5$ | [[-12 || −12]] |
| | $3$ | $-7$ | |
:::

In questo club $m =$ [[-3 || −3]] e $q =$ [[2]].

:::details.hint
<summary>💡 Suggerimento</summary>

Da $(-1; 5)$ a $(3; -7)$ hai $\Delta x = 4$. L'ordinata diminuisce, quindi $\Delta y$ è negativo. Fai la divisione e tieni il segno. Per trovare $q$, parti da $(-1; 5)$. Basta un passo a destra per arrivare all'ascissa 0.

:::

:::div.reveal
Il primo club è $y = 3x + 1$. Il secondo club è $y = -3x + 2$. Il secondo club **scende**, come la retta $y = -2x + 1$ dello step precedente. Per questo il suo coefficiente angolare è negativo.

Quello che hai fatto vale per due punti qualsiasi. Se conosci due punti $A$ e $B$ di una retta, il coefficiente angolare si calcola così:

:::formula
m = \frac{@dy{\Delta y}}{@dx{\Delta x}} = \frac{@yy{y_B - y_A}}{@xx{x_B - x_A}}

dy -> yy : differenza tra le ordinate
dx -> xx : differenza tra le ascisse
:::

$\Delta y$ è la differenza tra le ordinate dei due punti. $\Delta x$ è la differenza tra le ascisse. Sono le stesse sottrazioni che hai usato per la distanza tra due punti. Per la distanza le elevi al quadrato. Qui invece le dividi. Il segno è importante, perché dice se la retta sale o scende.

Per due punti passa una sola retta. Adesso sai anche scrivere la sua equazione.
:::
