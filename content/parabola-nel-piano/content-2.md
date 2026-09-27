> id: vertice-fuoco-asse-direttrice
> title: Vertice, fuoco, asse e direttrice di y = ax² + bx + c
> description: Il vertice esce dall'origine. Spostando la parabola, sviluppando e completando il quadrato si arriva alle formule che danno vertice, asse, fuoco e direttrice a partire da a, b e c.

---

> id: parabola-traslata
> title: Parabola con il vertice fuori dall'origine

# Un fuoco spostato

Il fuoco è $F(3; 1)$ e la direttrice è la retta $y = -3$. Trascina il punto lungo la parabola.

:::p5 sketch=parabola-luogo height=380 modo=scorri fx=3 fy=1 d=-3 px=6 xmin=-3 xmax=9 ymin=-4 ymax=4
:::

La distanza fra il fuoco e la direttrice è [[4]].

Il vertice sta a metà strada fra il fuoco e la direttrice. Il vertice è $V(3;$ [[-1 || −1]]$)$. L'asse della parabola è la retta $x =$ [[3]].

:::details.hint
<summary>💡 Suggerimento</summary>

Il fuoco ha ordinata $1$ e la direttrice ha ordinata $-3$. Il punto a metà strada ha come ordinata la media dei due numeri.

:::

:::div.reveal
Il fuoco sta 2 quadretti sopra il vertice. Nella lezione precedente la parabola con il fuoco 2 quadretti sopra il vertice era $y = \dfrac{x^2}{8}$, con il vertice nell'origine.

Questa parabola ha la stessa forma. È solo spostata: 3 quadretti a destra e 1 quadretto in basso. Per spostarla a destra di 3 si scrive $x - 3$ al posto di $x$. Per spostarla in basso di 1 si toglie 1 alla fine. L'equazione è

$$y = \frac{(x-3)^2}{8} - 1$$

:::div.highlight
Una parabola con il vertice $V(x_V; y_V)$ e l'asse verticale ha equazione

$$y = a\,(x - x_V)^2 + y_V$$

Il numero $a$ vale $\dfrac{1}{4p}$, dove $p$ è la distanza con segno dal vertice al fuoco.
:::
:::

---

> id: sviluppare-il-quadrato
> title: Dalla forma con il vertice alla forma y = ax² + bx + c

# Aprire le parentesi

Riprendiamo la parabola dello step precedente, con il fuoco $F(3; 1)$ e la direttrice $y = -3$.

:::p5 sketch=parabola-luogo height=380 modo=scorri fx=3 fy=1 d=-3 px=6 vertice=si xmin=-3 xmax=9 ymin=-4 ymax=4
:::

La sua equazione è $y = \dfrac{(x-3)^2}{8} - 1$. Sviluppa il quadrato e scrivila nella forma $y = ax^2 + bx + c$.

I coefficienti sono $a =$ [[1/8 || 0,125 || 0.125]], $b =$ [[-3/4 || −3/4 || -6/8 || −6/8 || -0,75 || -0.75 || −0,75]] e $c =$ [[1/8 || 0,125 || 0.125]].

:::details.hint
<summary>💡 Suggerimento</summary>

$(x-3)^2 = x^2 - 6x + 9$. Dividi ogni termine per 8, poi togli 1 al termine senza la $x$: $\dfrac98 - 1 = \dfrac18$.

:::

Adesso fai lo stesso con $y = 2(x-1)^2 + 3$. Viene $y = 2x^2 +$ [[-4 || −4]]$\,x +$ [[5]].

Guarda una parabola alla volta. Nella prima il numero davanti alla parentesi è $\frac18$. Nella seconda è $2$. Quando sviluppi il quadrato, questo numero diventa uno dei coefficienti. Quale? [[*a|b|c]]

:::div.reveal
Il numero davanti alla parentesi diventa il coefficiente $a$, senza cambiare. Nella prima parabola vale $\frac18$ prima e dopo lo sviluppo. Nella seconda vale $2$ prima e dopo. Le due parabole hanno valori di $a$ diversi, ma ciascuna tiene il suo. Il coefficiente $a$ dice quanto è aperta la parabola e da che parte è rivolta.

Il vertice invece sparisce dentro $b$ e $c$. Nella forma $y = ax^2 + bx + c$ non si legge più a colpo d'occhio. Nel prossimo step facciamo il percorso al contrario per ritrovarlo.
:::

---

> id: completare-il-quadrato
> title: Vertice e asse completando il quadrato

# Ritrovare il vertice

Qui ci sono due parabole. La blu è $y = x^2 - 4x + 5$. La rossa è $y = 2x^2 + 12x + 13$.

:::graph
xrange: "-8,6"
yrange: "-6,8"
functions:
  - expr: "x^2 - 4*x + 5"
    color: "#1F6FB2"
  - expr: "2*x^2 + 12*x + 13"
    color: "#D7263D"
:::

Completa il quadrato nella prima equazione. I primi due termini $x^2 - 4x$ sono l'inizio di $(x-2)^2 = x^2 - 4x + 4$. Allora

$y = (x -$ [[2]]$)^2 +$ [[1]].

Il vertice della parabola blu è $V(2; 1)$ e il suo asse è la retta $x = 2$.

Adesso la parabola rossa. Prima raccogli il 2: $y = 2(x^2 + 6x) + 13$. Poi completa il quadrato dentro la parentesi. Il vertice della parabola rossa è $V($[[-3 || −3]]$;$ [[-5 || −5]]$)$.

:::details.hint
<summary>💡 Suggerimento</summary>

$x^2 + 6x = (x+3)^2 - 9$. Quindi $y = 2\left[(x+3)^2 - 9\right] + 13 = 2(x+3)^2 - 18 + 13$.

:::

:::div.reveal
La parabola rossa è $y = 2(x+3)^2 - 5$. Scritta come $y = 2\big(x - (-3)\big)^2 + (-5)$ mostra il vertice $V(-3; -5)$.

Guarda il grafico. I due vertici sono proprio i punti più bassi delle due parabole.
:::

---

> id: fuoco-e-direttrice-dal-vertice
> title: Fuoco e direttrice dal vertice e da a

# Dove sta il fuoco?

La parabola è $y = x^2 - 4x + 5$. Nello step precedente hai trovato il vertice $V(2; 1)$. Il coefficiente di $x^2$ è $a = 1$.

:::graph
xrange: "-2,6"
yrange: "-1,6"
functions:
  - expr: "x^2 - 4*x + 5"
    color: "#1B2A4A"
boundpoints:
  - {x: 2, y: 1, label: V}
:::

Il fuoco sta sopra il vertice, alla distanza $p = \dfrac{1}{4a}$. Qui $p =$ [[1/4 || 0,25 || 0.25]].

L'ordinata del fuoco è [[5/4 || 1,25 || 1.25]]. La direttrice è la retta $y =$ [[3/4 || 0,75 || 0.75]].

:::details.hint
<summary>💡 Suggerimento</summary>

Il fuoco sta $\dfrac14$ sopra il vertice: $1 + \dfrac14 = \dfrac54$. La direttrice sta $\dfrac14$ sotto il vertice.

:::

:::div.reveal
Ecco la parabola con il suo fuoco e la sua direttrice. Il punto sulla curva sta sempre alla stessa distanza da $F$ e da $d$.

:::graph
xrange: "-2,6"
yrange: "-1,6"
functions:
  - expr: "x^2 - 4*x + 5"
    color: "#1B2A4A"
  - expr: "3/4"
    color: "#1F6FB2"
boundpoints:
  - {x: 2, y: 1, label: V}
  - {x: 2, y: 1.25, label: F}
:::

Per trovare il fuoco e la direttrice bastano due cose: il vertice e il numero $a$.
:::

---

> id: le-formule-generali
> title: Le formule di vertice, asse, fuoco e direttrice

# Una volta per tutte

Ora completa il quadrato con le lettere, nella parabola $y = ax^2 + bx + c$. Prima raccogli $a$ nei primi due termini:

$$y = a\left(x^2 + \frac{b}{a}\,x\right) + c$$

Dentro la parentesi il quadrato giusto è $\left(x + \square\right)^2$ con $\square =$ [[select: b/a|*b/(2a)|2b/a]].

Facendo i conti viene

$$y = a\left(x + \frac{b}{2a}\right)^2 - \frac{b^2 - 4ac}{4a}$$

Il numero $b^2 - 4ac$ si chiama **discriminante** e si scrive $\Delta$. Dalla forma con il vertice leggi l'ascissa del vertice: $x_V =$ [[select: b/(2a)|*−b/(2a)|−b/a]].

Muovi gli slider e guarda come si spostano il vertice $V$, il fuoco $F$ e la direttrice.

$a =$ ${a}{a|1|-2,2,0.5}  $b =$ ${b}{b|-4|-6,6,1}  $c =$ ${c}{c|5|-5,5,1}

:::graph
xrange: "-8,8"
yrange: "-7,9"
bind: [a, b, c]
functions:
  - expr: "a*x^2 + b*x + c"
    color: "#1B2A4A"
  - expr: "-(1 + b^2 - 4*a*c)/(4*a)"
    color: "#1F6FB2"
boundpoints:
  - {x: "-b/(2*a)", y: "-(b^2 - 4*a*c)/(4*a)", label: V}
  - {x: "-b/(2*a)", y: "(1 - (b^2 - 4*a*c))/(4*a)", label: F}
:::

Prova le formule sulla parabola $y = x^2 - 4x + 5$ dello step precedente. Qui $\Delta = b^2 - 4ac =$ [[-4 || −4]].

:::div.reveal
Ecco tutte le formule insieme. Il fuoco sta $\dfrac{1}{4a}$ sopra il vertice e la direttrice sta $\dfrac{1}{4a}$ sotto.

:::div.highlight
Per la parabola $y = ax^2 + bx + c$, con $\Delta = b^2 - 4ac$:

- vertice $V\left(-\dfrac{b}{2a};\ -\dfrac{\Delta}{4a}\right)$
- asse $x = -\dfrac{b}{2a}$
- fuoco $F\left(-\dfrac{b}{2a};\ \dfrac{1 - \Delta}{4a}\right)$
- direttrice $y = -\dfrac{1 + \Delta}{4a}$
:::

Con $\Delta = -4$ e $a = 1$ il fuoco ha ordinata $\dfrac{1 + 4}{4} = \dfrac54$. La direttrice è $y = -\dfrac{1 - 4}{4} = \dfrac34$. Sono gli stessi numeri dello step precedente.
:::

---

> id: il-segno-di-a
> title: Il segno di a e il verso della parabola

# Una parabola rovesciata

La parabola è $y = -x^2 + 2x + 3$. Trascina il punto lungo la curva.

:::p5 sketch=parabola-luogo height=380 modo=scorri fx=1 fy=3.75 d=4.25 px=3 xmin=-3 xmax=5 ymin=-3 ymax=6
:::

Il vertice è $V($[[1]]$;$ [[4]]$)$.

Il fuoco sta [[sopra|*sotto]] il vertice. La direttrice sta [[*sopra|sotto]] il vertice.

La direttrice è la retta $y =$ [[17/4 || 4,25 || 4.25]].

:::details.hint
<summary>💡 Suggerimento</summary>

Qui $a = -1$, $b = 2$ e $c = 3$. Il discriminante è $\Delta = 4 + 12 = 16$. Per la direttrice usa $y = -\dfrac{1 + \Delta}{4a}$ e fai attenzione al segno di $a$.

:::

:::div.reveal
Qui $a$ è negativo. Allora anche $\dfrac{1}{4a}$ è negativo. Il fuoco finisce sotto il vertice, in $F\left(1; \dfrac{15}{4}\right)$, e la direttrice finisce sopra. La parabola si apre verso il basso e il vertice diventa il suo punto più alto.

Le formule sono le stesse per tutte le parabole. Il segno di $a$ decide da che parte si apre la parabola.
:::
