> id: il-club-dei-punti-in-fila
> title: Il club dei punti in fila
> description: Un'equazione è la regola d'ingresso di un club di punti. I soci stanno tutti su una retta, e due numeri bastano a descriverla, di quanto sale e da dove parte.

---

> id: il-club-segreto
> title: Il club segreto
> use-mathjs: true

# Chi entra e chi no

Ho un club, e la regola per entrare non te la dico. Ti dico solo chi c'è dentro e chi è rimasto fuori.

| Soci | Non soci |
| --- | --- |
| $(0; 1)$ | $(1; 4)$ |
| $(1; 3)$ | $(3; 5)$ |
| $(2; 5)$ | $(2; 6)$ |
| $(4; 9)$ | |

Il punto $(7; \ldots)$ vuole entrare. Che ordinata deve avere? [[15]]

:::details.hint
<summary>💡 Suggerimento</summary>

Guarda i primi tre soci, in fila: l'ascissa cresce di 1 alla volta. E l'ordinata, di quanto cresce ogni volta?

:::

Qual è la regola del club?

[[l'ordinata è dispari|l'ordinata è l'ascissa più 2|*l'ordinata è il doppio dell'ascissa, più 1]]

:::details.hint
<summary>💡 Suggerimento</summary>

«Dispari» sembra funzionare con tutti i soci, ma guarda $(3; 5)$: ha l'ordinata dispari ed è rimasto fuori.

:::

Adesso tocca a te: inventa **due soci nuovi**, che non siano già nella lista, e **un punto che resta fuori**.

| | ascissa | ordinata |
| --- | --- | --- |
| Primo socio | ${sax}{sax||input} | ${say}{say||input} |
| Secondo socio | ${sbx}{sbx||input} | ${sby}{sby||input} |
| Escluso | ${ex}{ex||input} | ${ey}{ey||input} |

[Verifica]{check: say == 2*sax + 1 and sby == 2*sbx + 1 and sax != sbx and sax != 0 and sax != 1 and sax != 2 and sax != 4 and sbx != 0 and sbx != 1 and sbx != 2 and sbx != 4 and not isNaN(ex) and not isNaN(ey) and ey != 2*ex + 1}

:::details.hint
<summary>💡 Suggerimento</summary>

Per un socio scegli un'ascissa che nella lista non c'è — va bene anche negativa — e calcola la sua ordinata con la regola. Per l'escluso, prendi un socio e sbaglia apposta l'ordinata.

:::

:::div.reveal
La regola sta in una frase: **l'ordinata è il doppio dell'ascissa, più 1**. Con le lettere, chiamando $x$ l'ascissa e $y$ l'ordinata:

$$y = 2x + 1$$

Da adesso nessuno ha più bisogno di chiedere a me se è socio. Si fa il conto sull'ascissa e si guarda se torna l'ordinata: per $(7; 15)$ viene $2 \cdot 7 + 1 = 15$, dentro. Per $(3; 5)$ viene $2 \cdot 3 + 1 = 7$, non $5$: fuori.
:::

---

> id: un-altro-club
> title: Un altro club

# Stesso gioco, altro club

Un secondo club. I suoi soci: $(0; -2)$, $(1; 1)$, $(2; 4)$, $(-1; -5)$.

Qual è la sua regola?

[[$y = 2x - 2$|$y = 3x + 2$|*$y = 3x - 2$|$y = x - 2$]]

:::details.hint
<summary>💡 Suggerimento</summary>

Metti i soci in ordine di ascissa: $(-1; -5)$, $(0; -2)$, $(1; 1)$, $(2; 4)$. Di quanto cresce l'ordinata a ogni passo? Poi prova ogni regola su un paio di soci.

:::

Adesso mettili a confronto: il primo club è $y = 2x + 1$, il secondo $y = 3x - 2$.

Quando l'ascissa cresce di 1, l'ordinata cresce di [[2]] nel primo club e di [[3]] nel secondo.

Il socio con ascissa $0$ ha ordinata [[1]] nel primo club e [[-2 || −2]] nel secondo.

:::div.reveal
Guarda dove sono finiti i numeri che hai trovato:

$$y = \mathbf{2}x + \mathbf{1} \qquad\qquad y = \mathbf{3}x - \mathbf{2}$$

Il numero che moltiplica la $x$ dice **di quanto cresce l'ordinata a ogni passo**. Il numero in fondo è **l'ordinata del socio che ha ascissa 0**, e non per caso: con $x = 0$ la moltiplicazione vale zero, e resta solo lui.

I due club hanno la stessa forma e cambiano solo due numeri. E due numeri bastano: dimmi quei due, e ti costruisco il club intero.
:::

---

> id: la-regola-la-do-io
> title: La regola la do io

# Adesso la regola ce l'hai

Il club è $y = 4x - 3$. Stavolta non c'è niente da indovinare: la regola va usata.

Metti ogni punto dalla sua parte.

:::smista goal categorie="socio;non socio"
(1;\ 1) -> socio
(2;\ 5) -> socio
(-1;\ -7) -> socio
(3;\ 8) -> non socio
(0;\ 3) -> non socio
(2;\ 4) -> non socio
:::

Un punto lontano, dove col disegno non arriveresti: $(25; 97)$ è socio? [[*sì|no]]

E al contrario: il socio che ha ordinata $21$, che ascissa ha? [[6]]

:::details.hint
<summary>💡 Suggerimento</summary>

Stavolta conosci la $y$ e ti manca la $x$: $4x - 3 = 21$. Quale numero, moltiplicato per 4 e diminuito di 3, dà 21?

:::

:::div.reveal
Con la regola in mano, **stabilire se un punto è socio è un conto**: metti le sue coordinate al posto di $x$ e $y$ e guarda se l'uguaglianza regge. $4 \cdot 25 - 3 = 97$: regge, $(25; 97)$ è dentro.

E la regola funziona anche nell'altro verso. Se conosci l'ordinata, diventa un'equazione da risolvere: $4x - 3 = 21$, quindi $x = 6$. Il socio è $(6; 21)$.
:::

---

> id: i-soci-in-fila
> title: I soci in fila

# Finalmente, un disegno

Torna il primo club, $y = 2x + 1$. Metti sul piano i suoi soci con ascissa $-2$, $-1$, $0$, $1$ e $2$.

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

:::details.hint
<summary>💡 Suggerimento</summary>

Prima calcola le ordinate, poi disegna. Con $x = -2$ viene $2 \cdot (-2) + 1 = -3$: il primo punto è $(-2; -3)$.

:::

Come stanno i soci, sul piano? [[sparsi, senza un ordine|su una linea che si piega|*in fila, su una linea dritta]]

Adesso un secondo club, $y = 2x - 4$: **stesso primo numero**, secondo numero diverso. Il primo club è già disegnato in grigio. Metti i soci del secondo con ascissa $0$, $1$, $2$, $3$ e $4$.

:::graph
snap: 1
verify: true
xrange: "-6,6"
yrange: "-6,6"
functions:
  - expr: "2*x + 1"
    color: "#5A6275"
points:
  - target: "0,-4"
  - target: "1,-2"
  - target: "2,0"
  - target: "3,2"
  - target: "4,4"
:::

Le due file sono [[*parallele|incidenti, si incontrano in un punto|la stessa fila]].

Nei due club il primo numero è uguale e il secondo cambia. Quindi il primo numero decide [[select: *quanto è inclinata la fila|a che altezza passa la fila]], il secondo [[select: quanto è inclinata la fila|*a che altezza passa la fila]].

:::div.reveal
I soci di un club **stanno tutti su una retta**, e ogni punto di quella retta è un socio. Il club e la retta sono la stessa cosa detta in due modi: $y = 2x + 1$ è la regola d'ingresso, la retta è il disegno di tutti quelli che la rispettano.

Le due rette hanno lo stesso primo numero e sono **parallele**: salgono allo stesso modo. Il secondo numero le sposta su o giù senza girarle: da $+1$ a $-4$, la retta si è abbassata di 5 quadretti.
:::

---

> id: di-quanto-sale
> title: Di quanto sale

# Lo scalino

Qui c'è la retta $y = 2x + 1$ con due suoi soci, $A$ e $B$. Trascinali: scorrono **solo lungo la retta**, perché fuori non sarebbero più soci. Fra i due c'è uno scalino, con i quadretti contati: quanti in orizzontale, quanti in verticale.

:::p5 sketch=retta-nel-piano height=380 m=2 q=1 ax=-1 bx=0 xmin=-5 xmax=5 ymin=-6 ymax=8
:::

Sulla retta $y = 2x + 1$, se mi sposto di $1$ a destra devo salire di [[2]] per restare socio.

Se mi sposto di $3$ a destra, di [[6]].

Se mi sposto di $5$ a **sinistra**, l'ordinata cambia di [[-10 || −10]].

:::details.hint
<summary>💡 Suggerimento</summary>

Metti $A$ e $B$ a 3 quadretti di distanza e leggi lo scalino, poi a 5, con $B$ a sinistra di $A$. Andando verso sinistra la retta scende: l'ordinata diminuisce, e il cambio è negativo.

:::

Sposta lo scalino lungo la retta e allungalo. Se divido la salita per il passo, il risultato [[dipende da dove metto lo scalino|dipende da quanto è lungo lo scalino|*è sempre lo stesso]].

:::div.reveal
Qualunque scalino tu prenda su questa retta, la salita è **il doppio** del passo: $2$ su $1$, $6$ su $3$, $-10$ su $-5$. Il rapporto fra i due non cambia mai, dovunque lo misuri e comunque lo allunghi.

Ed è proprio il $2$ di $y = 2x + 1$.
:::

---

> id: piu-ripida-meno-ripida
> title: Più ripida, meno ripida

# Tre rette per lo stesso punto

Tre rette che passano tutte per $(0; 1)$: $y = 2x + 1$, che ormai conosci, poi $y = 5x + 1$ e $y = \tfrac12 x + 1$.

La seconda è troppo ripida per starci in un disegno, quindi fai i conti. Su $y = 5x + 1$, spostandoti di $1$ a destra sali di [[5]]; di $3$ a destra, sali di [[15]].

:::details.hint
<summary>💡 Suggerimento</summary>

Prendi due soci e confronta le ordinate: con $x = 0$ viene $1$, con $x = 3$ viene $5 \cdot 3 + 1 = 16$.

:::

La terza invece è dolce. Eccola, con il suo scalino:

:::p5 sketch=retta-nel-piano height=340 m=0.5 q=1 ax=0 bx=4 nome="y = ½x + 1" xmin=-6 xmax=6 ymin=-4 ymax=6
:::

Su $y = \tfrac12 x + 1$, spostandoti di $2$ a destra sali di [[1]]; di $1$ a destra, di [[0,5 || 0.5 || 1/2 || ½]].

:::div.reveal
Tre rette e tre pendenze: la più ripida sale di 5 a ogni passo, la più dolce di mezzo quadretto. Il numero che dice *quanto* è sempre quello davanti alla $x$, ed è un rapporto, salita diviso passo: $\tfrac12$ vuol dire proprio «1 in su ogni 2 a destra».

I due numeri di un club hanno un nome:

:::formula
y = @m{m}\,x + @q{q}

m -> m : il coefficiente angolare, di quanto sale a ogni passo verso destra
q -> q : l'ordinata all'origine, dove la retta taglia l'asse y
:::

Le tre rette di questo step hanno tutte $q = 1$, e infatti si incontrano tutte in $(0; 1)$.
:::

---

> id: due-soci-bastano
> title: Due soci bastano

# Un club intero da due soci

Di un club conosci solo due soci: $(2; 7)$ e $(6; 19)$.

Da un socio all'altro ti sposti di [[4]] a destra e sali di [[12]].

Quindi il coefficiente angolare è $m =$ [[3]], e l'ordinata all'origine è $q =$ [[1]].

:::details.hint
<summary>💡 Suggerimento</summary>

Dodici quadretti di salita su quattro di passo: su un passo solo, quanto si sale? Per $q$, parti da $(2; 7)$ e torna indietro di 2 passi fino all'ascissa 0: a ogni passo indietro scendi di $m$.

:::

Altri due soci, di un altro club: $(-1; 5)$ e $(3; -7)$.

Qui $m =$ [[-3 || −3]] e $q =$ [[2]].

:::details.hint
<summary>💡 Suggerimento</summary>

Da $(-1; 5)$ a $(3; -7)$ ti sposti di 4 a destra, ma l'ordinata sale o scende? Dividi tenendo il segno. Poi da $(-1; 5)$ basta un passo a destra per arrivare all'ascissa 0.

:::

:::div.reveal
Il primo club è $y = 3x + 1$, il secondo $y = -3x + 2$. E il secondo **scende**: andando verso destra l'ordinata diminuisce, e il coefficiente angolare è negativo.

Quello che hai fatto si scrive una volta per tutte. Da due soci $A$ e $B$:

$$m = \frac{y_B - y_A}{x_B - x_A}$$

La salita diviso il passo. Sono le stesse due sottrazioni della distanza, solo che qui non si elevano al quadrato: si dividono. E il segno conta, perché dice se la retta sale o scende.

Per due punti passa una retta sola, e adesso sai anche scriverne l'equazione.
:::
