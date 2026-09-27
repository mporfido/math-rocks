> id: la-parabola-come-luogo
> title: La parabola come luogo di punti
> description: Una barca vuole restare alla stessa distanza da un faro e dalla costa. Le posizioni possibili formano una curva, e dalla regola della barca si ricava la sua equazione.

---

> id: il-faro-e-la-costa
> title: Punti equidistanti da un punto e da una retta

# Un faro e una costa

In mare c'è un faro nel punto $(0; 2)$. La costa è dritta e coincide con l'asse $x$. Un quadretto è un chilometro.

Una barca vuole restare sempre **alla stessa distanza dal faro e dalla costa**. Dove può trovarsi?

La distanza della barca dal faro si misura in linea retta. La distanza dalla costa si misura in verticale, perché il tratto verticale è il più corto. Nella figura il tratto rosso va verso il faro e il tratto blu va verso la costa. Quando le due distanze sono uguali, i tratti diventano verdi e il punto resta segnato.

:::p5 goal sketch=parabola-luogo height=380 modo=cerca nomi=faro fx=0 fy=2 d=0 px=3 py=4 n=5 xmin=-6 xmax=6 ymin=-1 ymax=7
:::

Trova **cinque** posizioni della barca, sui nodi della griglia.

:::details.hint
<summary>💡 Suggerimento</summary>

Comincia dall'asse $y$, proprio sotto il faro. Lì la barca deve stare a metà strada fra il faro e la costa. Poi prova a spostarti di due quadretti a destra.

:::

:::div.reveal
Le cinque posizioni sono $(0; 1)$, $(2; 2)$, $(-2; 2)$, $(4; 5)$ e $(-4; 5)$.

Queste però sono solo le posizioni sui nodi della griglia. La barca può stare anche fra un nodo e l'altro. Nei prossimi step cerchiamo **tutte** le posizioni possibili.
:::

---

> id: il-punto-lontano
> title: Distanza dal fuoco con il teorema di Pitagora

# Controllare senza fidarsi

La figura di prima faceva i conti da sola. Adesso li fai tu. La barca è nel punto $(4; 5)$.

:::p5 sketch=parabola-luogo height=380 modo=cerca nomi=faro fx=0 fy=2 d=0 px=4 py=5 misure=no blocca=si xmin=-6 xmax=6 ymin=-1 ymax=7
:::

La distanza della barca dalla costa è [[5]] chilometri.

Per la distanza dal faro serve un triangolo rettangolo. Il cateto orizzontale va da $x = 0$ a $x = 4$ ed è lungo [[4]]. Il cateto verticale va da $y = 2$ a $y = 5$ ed è lungo [[3]].

Con il teorema di Pitagora la distanza dal faro è [[5]] chilometri.

:::div.reveal
Le due distanze sono uguali. Il punto $(4; 5)$ va bene davvero.
:::

---

> id: punto-su-una-retta-verticale
> title: Un punto equidistante su una retta verticale

# Più in alto

Adesso la barca si sposta sulla retta verticale $x = 6$. Nella figura la barca parte da $(6; 6)$. Puoi trascinarla solo in su e in giù, lungo la retta tratteggiata.

:::p5 sketch=parabola-luogo height=420 modo=cerca nomi=faro fx=0 fy=2 d=0 verticale=6 py=6 xmin=-7 xmax=7 ymin=-1 ymax=11
:::

Su questa retta c'è una sola posizione buona. La sua ordinata è $y =$ [[10]].

:::details.hint
<summary>💡 Suggerimento</summary>

Se la barca è nel punto $(6; y)$, la distanza dalla costa è $y$. I cateti del triangolo verso il faro sono lunghi $6$ e $y - 2$. Prova con $y = 8$, $y = 9$ e $y = 10$, e confronta le due distanze.

:::

:::div.reveal
Nel punto $(6; 10)$ la distanza dalla costa è 10. I cateti verso il faro sono lunghi 6 e 8, e $\sqrt{36 + 64} = 10$.

Per trovarlo hai fatto dei tentativi. Fra poco troveremo una regola che dà subito l'ordinata giusta.
:::

---

> id: vertice-e-asse
> title: Vertice, asse di simmetria, fuoco e direttrice

# Tutte le posizioni insieme

Qui ci sono tutte le posizioni possibili della barca, anche quelle fra un nodo e l'altro. Trascina la barca lungo la curva. Le due distanze restano sempre uguali.

:::p5 sketch=parabola-luogo height=380 modo=scorri nomi=faro fx=0 fy=2 d=0 px=4 xmin=-6 xmax=6 ymin=-1 ymax=7
:::

Il punto più basso della curva è $(0;$ [[1]]$)$.

Il punto più basso sta esattamente a metà strada fra il faro e la costa? [[*sì|no]]

La curva è simmetrica rispetto a una retta verticale. Questa retta ha equazione $x =$ [[0]].

Il punto $(4; 5)$ sta sulla curva. Il suo simmetrico è il punto $($[[-4 || −4]]$; 5)$.

:::div.reveal
Questa curva si chiama **parabola**. Il faro e la costa hanno un nome matematico.

:::div.highlight
Dati un punto $F$ e una retta $d$, la **parabola** è l'insieme dei punti del piano che hanno la stessa distanza da $F$ e da $d$.

Il punto $F$ si chiama **fuoco**. La retta $d$ si chiama **direttrice**.
:::

Il punto più basso della parabola si chiama **vertice**. Il vertice sta a metà strada fra il fuoco e la direttrice. La retta verticale che passa per il fuoco e per il vertice si chiama **asse** della parabola. La parabola è simmetrica rispetto al suo asse.
:::

---

> id: equazione-dalla-definizione
> title: L'equazione della parabola dalla definizione

# Una regola per tutti i punti

Prendi un punto qualunque $P(x; y)$ della parabola. Il fuoco è $F(0; 2)$ e la direttrice è l'asse $x$. Nella figura vedi anche il vertice $V$ e l'asse della parabola, tratteggiato.

:::p5 sketch=parabola-luogo height=380 modo=scorri fx=0 fy=2 d=0 px=3 vertice=si xmin=-6 xmax=6 ymin=-1 ymax=7
:::

La parabola sta tutta sopra l'asse $x$. Per questo la distanza di $P$ dalla direttrice è semplicemente $y$. La distanza di $P$ dal fuoco si calcola con il teorema di Pitagora. La definizione dice che le due distanze sono uguali:

:::formula
@pf{\sqrt{x^2 + (y-2)^2}} = @pd{y}

pf -> pd : distanza dal fuoco = distanza dalla direttrice
:::

Eleva al quadrato tutti e due i membri. La radice sparisce:

$$x^2 + (y-2)^2 = y^2$$

Sviluppa il quadrato $(y-2)^2$. Poi togli $y^2$ da tutti e due i membri. Rimane

$x^2 -$ [[4]]$\,y +$ [[4]] $= 0$.

Adesso ricava la $y$. Nell'equazione $y = \dfrac{x^2}{k} + q$ il numero $k$ vale [[4]] e il numero $q$ vale [[1]].

:::details.hint
<summary>💡 Suggerimento</summary>

$(y-2)^2 = y^2 - 4y + 4$. Dopo aver tolto $y^2$ resta $x^2 - 4y + 4 = 0$. Porta $4y$ dall'altra parte e dividi tutto per 4.

:::

:::div.reveal
L'equazione della parabola è

$$y = \frac{x^2}{4} + 1$$

Controlla con i punti che hai trovato. Per $x = 4$ viene $y = \frac{16}{4} + 1 = 5$. Per $x = 6$ viene $y = \frac{36}{4} + 1 = 10$. Sono proprio le posizioni della barca.

Ogni punto che soddisfa l'equazione sta alla stessa distanza dal fuoco e dalla direttrice. Ogni punto con questa proprietà soddisfa l'equazione.
:::

---

> id: il-fuoco-si-allontana
> title: Distanza fra fuoco e direttrice e apertura della parabola

# Il faro più lontano

Adesso il fuoco è $F(0; 4)$. La direttrice è ancora l'asse $x$.

:::p5 sketch=parabola-luogo height=380 modo=scorri fx=0 fy=4 d=0 px=4 xmin=-7 xmax=7 ymin=-1 ymax=8
:::

Rifai il conto dello step precedente. La definizione dà $\sqrt{x^2 + (y-4)^2} = y$. Dopo aver elevato al quadrato e semplificato, resta

$x^2 -$ [[8]]$\,y +$ [[16]] $= 0$.

Il vertice della nuova parabola è $(0;$ [[2]]$)$.

Qui sotto trovi due parabole con la stessa direttrice. La rossa ha il fuoco in $(0; 2)$. La blu ha il fuoco in $(0; 4)$.

:::graph
xrange: "-8,8"
yrange: "-1,9"
functions:
  - expr: "x^2/4 + 1"
    color: "#D7263D"
  - expr: "x^2/8 + 2"
    color: "#1F6FB2"
boundpoints:
  - {x: 0, y: 2, label: "F₁"}
  - {x: 0, y: 4, label: "F₂"}
:::

Quale parabola è più aperta? [[*quella con il fuoco più lontano dalla direttrice|quella con il fuoco più vicino alla direttrice]]

:::div.reveal
La nuova equazione è

$$y = \frac{x^2}{8} + 2$$

Il vertice sta ancora a metà strada fra il fuoco e la direttrice. Il fuoco adesso è più lontano dalla direttrice. Il numero sotto $x^2$ è diventato più grande e la parabola si è aperta.
:::

---

> id: fuoco-e-direttrice-simmetrici
> title: Fuoco (0; p) e direttrice y = −p

# Il vertice nell'origine

Mettiamo il vertice nell'origine. Il fuoco è $F(0; p)$ e la direttrice è la retta $y = -p$. Il numero $p$ è positivo. Muovi lo slider di $p$.

$p =$ ${p}{p|1|0.25,3,0.25}

:::graph
xrange: "-8,8"
yrange: "-4,8"
bind: p
functions:
  - expr: "x^2/(4*p)"
    color: "#1B2A4A"
  - expr: "-p"
    color: "#1F6FB2"
boundpoints:
  - {x: 0, y: p, label: F}
:::

Per un punto $P(x; y)$ della parabola la distanza dalla direttrice è $y + p$. La definizione dà

$$\sqrt{x^2 + (y-p)^2} = y + p$$

Eleva al quadrato e sviluppa i due quadrati. I termini $y^2$ e $p^2$ si cancellano. Rimane $x^2 =$ [[4]]$\,p\,y$.

Quando $p$ diventa più grande, la parabola diventa più [[*aperta|stretta]].

:::details.hint
<summary>💡 Suggerimento</summary>

A sinistra hai $x^2 + y^2 - 2py + p^2$. A destra hai $y^2 + 2py + p^2$. Togli da tutti e due i membri quello che hanno in comune.

:::

:::div.reveal
L'equazione della parabola con fuoco $F(0; p)$ e direttrice $y = -p$ è

:::formula
y = @a{\frac{1}{4p}}\, x^2

a -> a : il coefficiente a dipende solo da p
:::

Il numero davanti a $x^2$ si chiama $a$. Vale $a = \dfrac{1}{4p}$. Più il fuoco è lontano dal vertice, più $a$ è piccolo e più la parabola è aperta.
:::

---

> id: fuoco-da-y-uguale-a-x-quadro
> title: Fuoco e direttrice di y = ax²

# Dall'equazione alla figura

Adesso fai il percorso al contrario. Conosci l'equazione $y = ax^2$ e cerchi il fuoco e la direttrice. Da $a = \dfrac{1}{4p}$ si ricava $p = \dfrac{1}{4a}$. Il fuoco è $F(0; p)$ e la direttrice è $y = -p$.

$a =$ ${a}{a|3|-3,3,0.25}

:::graph
xrange: "-5,5"
yrange: "-5,5"
bind: a
functions:
  - expr: "a*x^2"
    color: "#1B2A4A"
  - expr: "-1/(4*a)"
    color: "#1F6FB2"
boundpoints:
  - {x: 0, y: "1/(4*a)", label: F}
:::

La parabola $y = 3x^2$ ha il fuoco nel punto $F(0; p)$ con $p =$ [[1/12]].

La parabola $y = \dfrac{x^2}{8}$ ha il fuoco in $(0;$ [[2]]$)$ e la direttrice $y =$ [[-2 || −2]].

Adesso porta lo slider su $a = -1$. La parabola $y = -x^2$ è rivolta verso [[l'alto|*il basso]]. Il suo fuoco sta [[sopra|*sotto]] il vertice.

:::details.hint
<summary>💡 Suggerimento</summary>

Per $y = 3x^2$ calcola $p = \dfrac{1}{4 \cdot 3}$. Per $y = \dfrac{x^2}{8}$ il coefficiente è $a = \dfrac18$, quindi $4a = \dfrac12$.

:::

:::div.reveal
Quando $a$ è negativo, anche $p = \dfrac{1}{4a}$ è negativo. Il fuoco $F(0; p)$ finisce sotto l'asse $x$ e la direttrice $y = -p$ finisce sopra. La parabola allora si apre verso il basso.

:::div.highlight
La parabola $y = ax^2$ ha il vertice nell'origine e l'asse coincide con l'asse $y$.

Il fuoco è $F\left(0; \dfrac{1}{4a}\right)$ e la direttrice è la retta $y = -\dfrac{1}{4a}$.
:::

Nella prossima lezione spostiamo il vertice fuori dall'origine.
:::
