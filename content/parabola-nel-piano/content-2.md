> id: la-parabola-traslata
> title: La parabola con il vertice fuori dall'origine
> description: Il vertice della parabola y = ax² si sposta nel piano. Dall'equazione con il vertice si arriva alla forma y = ax² + bx + c, e si impara a passare dai coefficienti al vertice, al fuoco e alla direttrice, e viceversa.

---

> id: traslare-il-vertice
> title: Traslare il vertice della parabola y = x²

# Spostare il vertice

Nella lezione precedente il vertice della parabola stava sempre nell'origine. Adesso lo spostiamo.

Nella figura c'è la parabola $y = x^2$. Trascina il vertice $V$. La parabola lo segue e non cambia forma. In grigio resta la parabola di partenza. Sopra il piano leggi l'equazione della parabola spostata.

:::p5 sketch=parabola-traslata height=440 a=1 hx=0 hy=0 xmin=-6 xmax=6 ymin=-4 ymax=7
:::

Porta il vertice in $V(3; 0)$. La parabola si è spostata verso [[select: sinistra|*destra]]. Dentro la parentesi però compare il segno [[select: più|*meno]].

Porta il vertice in $V(0; 2)$. La parabola si è spostata verso l'alto. Il numero dopo $x^2$ ha il segno [[select: *più|meno]].

Adesso fai il percorso al contrario. Dove sta il vertice della parabola $y = (x + 4)^2 - 1$? Porta $V$ nel punto giusto e premi il bottone.

[Verifica]{check: h == -4 && k == -1}

:::div.reveal
Il vertice è $V(-4; -1)$. La parabola $y = x^2$ si è spostata di 4 quadretti a sinistra e di 1 quadretto in basso.

Lo spostamento orizzontale si legge dentro la parentesi, con il segno cambiato. Lo spostamento verticale si legge fuori, con il suo segno.

:::div.highlight
Se il vertice della parabola $y = ax^2$ si sposta nel punto $V(h; k)$, l'equazione diventa

$$y = a\,(x - h)^2 + k$$

Il coefficiente $a$ resta lo stesso. La parabola cambia posto, ma non cambia forma.
:::

Nel prossimo step vediamo perché nella parentesi c'è il segno meno.
:::

---

> id: perche-il-meno
> title: Il segno meno nella parentesi (x − h)

# Tre quadretti a destra

Qui sotto ci sono due parabole. La grigia è $y = x^2$. La rossa è $y = (x - 3)^2$.

:::graph
xrange: "-4,8"
yrange: "-1,10"
functions:
  - expr: "x^2"
    color: "#9AA0AC"
  - expr: "(x-3)^2"
    color: "#D7263D"
:::

Completa la tabella. Calcola i valori di $(x - 3)^2$ per le $x$ che mancano.

:::table
| $x$  | $x^2$ | $(x - 3)^2$ |
| ---- | ----- | ----------- |
| $-1$ | 1     | 16          |
| $0$  | 0     | 9           |
| $1$  | 1     | 4           |
| $2$  | 4     | 1           |
| $3$  | 9     | [[0]]       |
| $4$  | 16    | [[1]]       |
| $5$  | 25    | [[4]]       |
| $6$  | 36    | 9           |
:::

La parabola grigia vale $0$ in $x = 0$. La parabola rossa vale $0$ in $x =$ [[3]].

:::div.reveal
Guarda la colonna di $x^2$ e la colonna di $(x - 3)^2$. I numeri sono gli stessi, ma nella colonna di $(x - 3)^2$ arrivano 3 righe più in basso.

La parabola rossa in $x = 3$ fa quello che la grigia faceva in $x = 0$. In $x = 4$ fa quello che la grigia faceva in $x = 1$. Per sapere quanto vale la parabola rossa in un punto, bisogna togliere 3 alla $x$ e poi fare il quadrato. Per questo nella parentesi c'è $x - 3$.

Lo spostamento in verticale invece è più semplice. In $y = x^2 + 2$ ogni valore di $x^2$ aumenta di 2. Tutta la parabola sale di 2 quadretti.
:::

---

> id: fuoco-e-direttrice-traslati
> title: Asse, fuoco e direttrice della parabola traslata

# Il fuoco viaggia con il vertice

Adesso la parabola di partenza è $y = \dfrac14 x^2$. Dalla lezione precedente sai che il fuoco è $F(0; 1)$ e la direttrice è la retta $y = -1$. Infatti $\dfrac{1}{4a} = \dfrac{1}{4 \cdot \frac14} = 1$.

Nella figura il fuoco $F$ e la direttrice $d$ sono blu. Trascina il vertice e guarda dove vanno.

:::p5 sketch=parabola-traslata height=440 a=1/4 fuoco=si asse=si hx=0 hy=0 xmin=-6 xmax=6 ymin=-4 ymax=7
:::

Il fuoco resta sempre [[select: *1 quadretto sopra il vertice|nello stesso posto|sull'asse x]].

Prendi la parabola con il vertice in $V(2; 3)$. Il fuoco è $F(2;$ [[4]]$)$ e la direttrice è la retta $y =$ [[2]]. L'asse della parabola è la retta $x =$ [[2]].

:::details.hint
<summary>💡 Suggerimento</summary>

Porta il vertice in $V(2; 3)$. Il fuoco sta 1 quadretto sopra il vertice. La direttrice sta 1 quadretto sotto il vertice. L'asse è la retta verticale che passa per il vertice.

:::

:::div.reveal
Quando il vertice si sposta, il fuoco e la direttrice si spostano con lui. La distanza fra il vertice e il fuoco resta $\dfrac{1}{4a}$.

:::div.highlight
La parabola $y = a\,(x - h)^2 + k$ ha il vertice $V(h; k)$ e l'asse $x = h$.

Il fuoco è $F\left(h;\; k + \dfrac{1}{4a}\right)$ e la direttrice è la retta $y = k - \dfrac{1}{4a}$.
:::

Se $a$ è negativo, anche $\dfrac{1}{4a}$ è negativo. Il fuoco finisce sotto il vertice, la direttrice sopra, e la parabola è rivolta verso il basso.
:::

---

> id: sviluppare-il-quadrato
> title: Dalla forma y = a(x − h)² + k alla forma y = ax² + bx + c

# Aprire la parentesi

Questa è la parabola $y = 2(x - 1)^2 + 3$. Il suo vertice è $V(1; 3)$.

:::p5 sketch=parabola-traslata height=400 a=2 hx=1 hy=3 blocca=si traccia=no asse=si xmin=-4 xmax=6 ymin=-1 ymax=9
:::

Sulla lavagna sviluppa il quadrato e riduci i termini simili. Devi arrivare a scrivere l'equazione nella forma $y = ax^2 + bx + c$. Per sviluppare il quadrato tocca $(x-1)^2$ e scegli «Svolgi il prodotto».

:::algebra isola="y"
y = 2(x-1)^2 + 3
:::

:::details.hint
<summary>💡 Suggerimento</summary>

$(x-1)^2 = x^2 - 2x + 1$. Poi moltiplica ogni termine per 2 e somma 3 al termine senza la $x$.

:::

Adesso guarda il caso generale $y = a\,(x - h)^2 + k$. Il quadrato si sviluppa allo stesso modo: $(x - h)^2 = x^2 - 2hx + h^2$. Poi si moltiplica tutto per $a$ e si aggiunge $k$.

Il coefficiente di $x$ è $b =$ [[select: *−2ah|−2h|2ah]]. Il termine noto è $c =$ [[select: ah²|*ah² + k|h² + k]].

:::div.reveal
L'equazione diventa $y = 2x^2 - 4x + 5$.

:::div.highlight
Sviluppando $y = a\,(x - h)^2 + k$ si ottiene $y = ax^2 + bx + c$ con

$$b = -2ah \qquad c = ah^2 + k$$
:::

Il coefficiente $a$ resta lo stesso, prima e dopo lo sviluppo. Il vertice invece si nasconde dentro $b$ e $c$. Nella forma $y = ax^2 + bx + c$ non si legge più a colpo d'occhio. Nel prossimo step lo ritroviamo.
:::

---

> id: vertice-dai-coefficienti
> title: Vertice e asse dai coefficienti a, b, c

# Ritrovare il vertice

Nella figura l'equazione è scritta in due modi. In nero c'è la forma con il vertice. In blu c'è la forma $y = ax^2 + bx + c$. Trascina il vertice e guarda come cambiano $b$ e $c$.

:::p5 sketch=parabola-traslata height=470 a=1 forma=entrambe hx=0 hy=0 xmin=-6 xmax=6 ymin=-5 ymax=6
:::

Il coefficiente davanti a $x^2$ cambia quando sposti il vertice? [[sì|*no]]

Cerca la posizione del vertice che dà in blu l'equazione $y = x^2 - 6x + 5$. Poi premi il bottone.

[Verifica]{check: h == 3 && k == -4}

:::div.reveal
Il vertice è $V(3; -4)$. Si può trovare anche senza figura.

Nello step precedente hai visto che $b = -2ah$. Da questa uguaglianza si ricava $h = -\dfrac{b}{2a}$. Per $y = x^2 - 6x + 5$ viene $h = -\dfrac{-6}{2 \cdot 1} = 3$.

L'ordinata del vertice è il valore della $y$ quando $x = 3$. Si sostituisce 3 al posto della $x$: $\;k = 9 - 18 + 5 = -4$.

:::div.highlight
Nella parabola $y = ax^2 + bx + c$ il vertice ha ascissa

$$x_V = -\frac{b}{2a}$$

L'ordinata $y_V$ si trova sostituendo $x_V$ al posto della $x$ nell'equazione. L'asse della parabola è la retta $x = x_V$.
:::

C'è anche una formula per l'ordinata. Con $\Delta = b^2 - 4ac$ vale $y_V = -\dfrac{\Delta}{4a}$. Il fuoco e la direttrice allora diventano

$$F\left(-\frac{b}{2a};\; \frac{1 - \Delta}{4a}\right) \qquad d\colon\; y = -\frac{1 + \Delta}{4a}$$

Non serve impararle a memoria. Basta trovare il vertice e poi aggiungere o togliere $\dfrac{1}{4a}$, come nel terzo step.
:::

---

> id: esempi-dall-equazione
> title: Vertice, fuoco e direttrice di y = ax² + bx + c

# Dall'equazione alla figura

Questa è la parabola $y = \dfrac14 x^2 - x + 3$.

:::graph
xrange: "-4,8"
yrange: "-1,8"
functions:
  - expr: "x^2/4 - x + 3"
    color: "#1B2A4A"
:::

Qui $a = \dfrac14$ e $b = -1$. L'ascissa del vertice è $x_V =$ [[2]]. L'ordinata del vertice è $y_V =$ [[2]].

Per questa parabola $\dfrac{1}{4a} = 1$. Il fuoco è $F(2;$ [[3]]$)$ e la direttrice è la retta $y =$ [[1]].

:::details.hint
<summary>💡 Suggerimento</summary>

$x_V = -\dfrac{-1}{2 \cdot \frac14} = \dfrac{1}{\frac12} = 2$. Poi sostituisci 2 al posto della $x$: $\dfrac14 \cdot 4 - 2 + 3$.

:::

Adesso prendi $y = -\dfrac14 x^2 + x + 1$. Il vertice è ancora $V(2; 2)$, ma $a$ è negativo. Il fuoco sta [[select: sopra|*sotto]] il vertice, nel punto $F(2;$ [[1]]$)$.

:::graph
xrange: "-4,8"
yrange: "-5,4"
functions:
  - expr: "-x^2/4 + x + 1"
    color: "#1B2A4A"
:::

:::div.reveal
La prima parabola ha il vertice $V(2; 2)$, il fuoco $F(2; 3)$ e la direttrice $y = 1$. L'asse è la retta $x = 2$.

La seconda parabola ha lo stesso vertice e lo stesso asse. Qui però $\dfrac{1}{4a} = -1$. Il fuoco è $F(2; 1)$, sotto il vertice, e la direttrice è $y = 3$, sopra il vertice. La parabola è rivolta verso il basso.
:::

---

> id: equazione-da-fuoco-e-direttrice
> title: L'equazione della parabola dal vertice, dal fuoco e dalla direttrice

# Dalla figura all'equazione

Adesso il percorso va al contrario. Conosci alcuni punti e rette della parabola e cerchi l'equazione.

Una parabola ha il vertice $V(1; -2)$ e il fuoco $F(1; 0)$. Il fuoco sta 2 quadretti sopra il vertice, quindi $\dfrac{1}{4a} = 2$. Il coefficiente è $a =$ [[1/8 || 0,125 || 0.125]].

:::details.hint
<summary>💡 Suggerimento</summary>

Se $\dfrac{1}{4a} = 2$, allora $4a = \dfrac12$. Dividi per 4.

:::

Un'altra parabola ha il fuoco $F(-2; 2)$ e la direttrice $y = 4$. Il vertice sta a metà strada fra il fuoco e la direttrice. Nella figura la parabola ha già la forma giusta. Trascina il vertice finché il fuoco e la direttrice vanno al loro posto, poi premi il bottone.

:::p5 sketch=parabola-traslata height=440 a=-1/4 forma=nessuna fuoco=si hx=0 hy=0 xmin=-6 xmax=6 ymin=-4 ymax=7
:::

[Verifica]{check: h == -2 && k == 3}

Il fuoco sta 1 quadretto sotto il vertice, quindi $\dfrac{1}{4a} = -1$. Il coefficiente è $a =$ [[-1/4 || −1/4 || -0,25 || −0,25 || -0.25]].

:::div.reveal
La prima parabola ha equazione

$$y = \frac18\,(x - 1)^2 - 2$$

La seconda ha il vertice $V(-2; 3)$ e $a = -\dfrac14$. La sua equazione è

$$y = -\frac14\,(x + 2)^2 + 3$$

:::div.highlight
Per scrivere l'equazione di una parabola con l'asse verticale servono il vertice $V(h; k)$ e il coefficiente $a$.

Se conosci il fuoco e la direttrice, il vertice sta a metà strada fra loro. Il numero $\dfrac{1}{4a}$ è la distanza con segno dal vertice al fuoco: positiva se il fuoco sta sopra, negativa se sta sotto.
:::
:::
