> id: distanza-e-punto-medio
> title: Distanza e punto medio
> description: Due punti sono due coppie di numeri. Da quelle quattro cifre si ricava quanto distano e chi sta esattamente in mezzo.

---

> id: il-volo-del-drone
> title: Quanto è lungo il volo?

# Un drone da A a B

Un drone deve volare da $A$ a $B$ **in linea retta**. Un quadretto è un chilometro.

:::p5 sketch=piano-distanza height=340 ax=1 ay=1 bx=4 by=5 gambe=no misure=no blocca=a,b
:::

Non puoi usare un righello. Guarda la figura e rispondi facendo una stima:

Il volo è più lungo o più corto di **4 chilometri**? [[più corto|*più lungo]]

E di **10 chilometri**? [[*più corto|più lungo]]

:::details.hint
<summary>💡 Suggerimento</summary>

Non serve calcolare niente. Confronta il segmento rosso con un lato dei quadretti: quante volte ci sta dentro, più o meno?

:::

:::div.reveal
Quindi la risposta sta **fra 4 e 10**. Restringere il campo delle possibili lunghezze pu essere importante, unsando il quadretto come unità di misura.

Adesso però la domanda vera: **quanto esattamente?** E soprattutto, come si fa a esserne sicuri senza misurare?

Cominciamo da due casi più facili.
:::

---

> id: stessa-riga-stessa-colonna
> title: Sulla stessa riga

# Quando è facile

Qui $A(2; 1)$ e $B(7; 1)$ stanno **sulla stessa riga orizzontale**.

:::graph
xrange: "-1,9"
yrange: "-2,4"
boundpoints:
  - {x: 2, y: 1, label: A}
  - {x: 7, y: 1, label: B}
connect: true
:::

Quanti chilometri da $A$ a $B$? [[5]]

Adesso prova senza figura, contando a mente:

Da $C(1; 3)$ a $D(6; 3)$: [[5]]

Attenzione a questi punti: ora sono sulla **stessa verticale**:

Da $E(2; 1)$ a $F(2; 9)$: [[8]]

:::details.hint
<summary>💡 Suggerimento</summary>

In ognuna di queste coppie **una** delle due coordinate è uguale nei due punti: quella non conta, il punto non si è mosso in quella direzione. Guarda solo l'altra.
:::

:::div.reveal
Hai contato i quadretti, ma dalla terza coppia probabilmente hai smesso di contare e hai **sottratto**: $9 - 1 = 8$.

È la stessa cosa, più veloce. E funziona perché la coordinata che cambia dice esattamente *di quanto* ci si è spostati:

$$\overline{CD} = 6 - 1 = 5$$
:::

---

> id: quando-ci-sono-i-segni
> title: Quando ci sono i segni

# Attenzione alla sottrazione

Adesso $A(-3; 2)$ e $B(4; 2)$: sempre sulla stessa riga, ma uno dei due è a sinistra dello zero.

:::p5 sketch=piano-distanza height=340 ax=-3 ay=2 bx=4 by=2 ipotenusa=si blocca=a,b misure=no
:::

Quanti quadretti da $A$ a $B$? [[7]]

Abbiamo visto che se il segmento è orizzontale, allora facciamo la sottrazione tra le coordinate $x$ dei suoi punti estremi. Che calcolo faccio per trovare la lunghezza?

[[$4-3$|$-3 - 4$|*$4-(-3)$]]

:::details.hint
<summary>💡 Suggerimento</summary>

Conta prima i quadretti: da $-3$ a $0$ e poi da $0$ a $4$. Poi cerca la sottrazione che dà quel risultato. Sottrarre un numero negativo aggiunge.

:::

:::div.reveal
$4 - (-3) = 4 + 3 = 7$. **Sottrarre un negativo somma**, e infatti i due punti stanno da parti opposte dello zero: le due distanze si sommano.

Un'ultima cosa, che eviterà un errore fra poco. Se avessi fatto la sottrazione al contrario avresti ottenuto $-3 - 4 = -7$. Ma una distanza **non è mai negativa**: quando l'ordine ti tradisce, tieni il numero e butta il segno: fai cioè il **valore assoluto**

Quando due punti $A(x,y_A)$ e $B(x,y_B)$ hanno la stessa coordinata x, allora la loro distanza si calcola facendo il **valore assoluto** della differenza delle coordinate y:

$$\overline{AB} = \lvert y_A - y_B\rvert$$

In questo modo se calcoli $y_A - y_B$ oppue $y_B - y_A$ ottieni sempre lo stesso risultato, dopo aver preso il valore assoluto.
:::

---

> id: il-triangolo-nascosto
> title: Il triangolo nascosto

# E se il volo è in obliquo?

Torniamo al drone. Prova a trascinare $A$ e $B$: adesso fra i due punti compaiono **due strade tratteggiate**, una orizzontale e una verticale, con i quadretti contati sopra.

Portali a formare un triangolo con i cateti di **3** e **4** quadretti.

:::p5 goal sketch=piano-distanza height=360 ax=2 ay=-1 bx=5 by=1 target="3,4"
:::

:::details.hint
<summary>💡 Suggerimento</summary>

I due numeri sui tratteggi ti dicono già a che punto sei. Muovi un solo punto alla volta e guarda quale dei due numeri cambia.

:::

Fatto? Allora guarda bene la figura: i due tratteggi e il segmento verde formano una figura che conosci.

Quanto è lungo il segmento verde? [[5]]

:::details.hint
<summary>💡 Suggerimento</summary>

Che figura è quella con due lati perpendicolari e uno in obliquo? E che cosa sai dire dei suoi tre lati?

:::

:::div.reveal
Un **triangolo rettangolo**. I due tratteggi sono i cateti, il volo del drone è l'**ipotenusa** — e dell'ipotenusa sai già tutto:

$$\overline{AB}^{\,2} = 3^2 + 4^2 = 9 + 16 = 25 \qquad \overline{AB} = 5$$

Ricordi che all'inizio avevi stimato "fra 4 e 10" la lunghezza di un segmento? Anche in quel caso i cateti erano 3 e 4.

**Il punto è questo:** fra due punti qualsiasi c'è sempre un triangolo rettangolo nascosto, e i suoi cateti sono sempre orizzontali o verticali e quindi sai già trovare le loro lunghezze.
:::

---

> id: la-formula
> title: La formula

# Scriviamola una volta per tutte

I due cateti sono le differenze delle coordinate, una per asse. Usando il teorema di Pitagora:

:::formula
@lato{\overline{AB}} = \sqrt{@dx{(x_B - x_A)}^{2} + @dy{(y_B - y_A)}^{2}}

dx -> dx : il cateto orizzontale, i quadretti in larghezza
dy -> dy : il cateto verticale, i quadretti in altezza
:::

Non è una formula nuova: è il teorema di Pitagora con dentro le due sottrazioni dello step precedente.

:::p5 sketch=piano-distanza height=340 ax=-2 ay=-1 bx=3 by=4 ipotenusa=si blocca=a,b misure=si
:::

Provala su $A(-2; -1)$ e $B(3; 4)$, un pezzo alla volta.

Cateto orizzontale: $3 - (-2) =$ [[5]]

Cateto verticale: $4 - (-1) =$ [[5]]

Quindi $\overline{AB} = \sqrt{25 + 25} = \sqrt{50}$, che vale circa: [[select: 5|*7,07|25|50]]

:::details.hint
<summary>💡 Suggerimento</summary>

$\sqrt{50}$ sta fra $\sqrt{49} = 7$ e $\sqrt{64} = 8$, e molto più vicino al primo.

:::

:::div.reveal
$\sqrt{50}$ non è un numero intero, e va benissimo così: **quella radice è la risposta esatta**, $7{,}07$ è solo la sua approssimazione.

Non sempre le distanze vengono "belle". Anzi: quasi mai.
:::

---

> id: provala-tu
> title: Costruisci tu il triangolo
> use-mathjs: true

# I numeri si compilano da soli

Muovi $A$ e $B$ e guarda i numeri qui sotto cambiare insieme alla figura.

:::p5 sketch=piano-distanza height=360 ax=-4 ay=-3 bx=-1 by=1 valore=no
:::

$$\Delta x = ${dx} \qquad \Delta y = ${dy} \qquad \overline{AB} = \sqrt{${dx}^2 + ${dy}^2} = ${= sqrt(dx^2 + dy^2)}$$

Adesso una sfida: sistema i due punti in modo che la distanza sia **esattamente 13**.

[Verifica]{check: sqrt(dx^2 + dy^2) == 13}

:::details.hint
<summary>💡 Suggerimento</summary>

Ti serve una coppia di cateti i cui quadrati sommino a $169$. Prova con numeri che conosci: $25 + 144$ funziona?

:::

:::div.reveal
$5$ e $12$: $25 + 144 = 169 = 13^2$.

Coppie così — $3,4,5$ · $5,12,13$ · $8,15,17$ — si chiamano **terne pitagoriche**, e sono i pochi casi in cui la distanza viene un numero intero. Fuori da lì, la radice resta.
:::

---

> id: il-ripetitore-a-meta-strada
> title: Il punto medio

# Dove va il ripetitore?

Fra le antenne $A$ e $B$ va installato un ripetitore **esattamente a metà strada**. Trascina $M$ al posto giusto.

:::p5 goal sketch=punto-medio height=380 ax=-3 ay=-2 bx=5 by=4 xmin=-4 xmax=6 ymin=-3 ymax=5
:::

:::details.hint
<summary>💡 Suggerimento</summary>

I numeri sugli assi ti dicono di quanto sei sbilanciato, un asse alla volta. Sistemane prima uno, poi l'altro: non devi risolverli insieme.

:::

:::div.reveal
Guarda i due assi separatamente, perché è lì che sta tutto.

Sull'asse $x$: $A$ è in $-3$, $B$ è in $5$, e $M$ è finito in $1$. Ma $1$ è esattamente la **media** fra $-3$ e $5$:

$$\frac{-3 + 5}{2} = \frac{2}{2} = 1$$

Sull'asse $y$ succede la stessa identica cosa: $\dfrac{-2 + 4}{2} = 1$.

$$M\left(\frac{x_A + x_B}{2};\ \frac{y_A + y_B}{2}\right)$$

**Il punto medio non è una formula in due pezzi**: è una sola idea — la media — applicata due volte, una per coordinata. Sull'asse $x$ non interessa dove sta $y$, e viceversa.
:::

---

> id: torna-indietro
> title: Trovare un estremo conoscendo M
> use-mathjs: true

# Conosco il centro, mi manca un estremo

Stavolta il ripetitore c'è già: sta in $M(5; 6)$. Una delle due antenne è in $A(1; 4)$.

**Dov'è l'altra?** Trascina il punto arancione $B$ dove pensi che sia.

:::graph
xrange: "-1,12"
yrange: "-1,10"
snap: 1
boundpoints:
  - {x: 1, y: 4, label: A}
  - {x: 5, y: 6, label: M}
  - {x: bx, y: by, label: B, drag: true, start: "8,3"}
:::

[Verifica]{check: bx == 9 and by == 8}

:::details.hint
<summary>💡 Suggerimento</summary>

Da $A$ a $M$ ti sposti di un tanto in orizzontale e di un tanto in verticale. Se $M$ è a metà strada, da $M$ a $B$ ti devi spostare... di quanto?

:::

:::div.reveal
Da $A(1; 4)$ a $M(5; 6)$ ci si sposta di $+4$ in orizzontale e $+2$ in verticale. Se $M$ è a metà, **la seconda metà è identica alla prima**: altri $+4$ e altri $+2$, e si arriva in $B(9; 8)$.

Controprova con la media: $\dfrac{1 + 9}{2} = 5$ ✓ e $\dfrac{4 + 8}{2} = 6$ ✓.

Sapere una formula significa anche saperla percorrere al contrario.
:::

