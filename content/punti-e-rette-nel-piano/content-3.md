> id: posizione-reciproca-di-due-rette
> title: Rette incidenti, parallele e perpendicolari
> description: Due rette nel piano hanno un punto in comune, nessuno oppure infiniti. A deciderlo sono i due coefficienti angolari, che dicono anche quando le rette si incontrano ad angolo retto.

---

> id: punto-comune-a-due-rette
> title: Il punto che appartiene a due rette
> use-mathjs: true

# Due droni sopra la città

Due droni volano sopra la città, ciascuno in linea retta. Il primo segue la regola $y = 2x + 1$. Il secondo segue la regola $y = -x + 7$.

La torre di controllo vuole sapere una cosa sola. Passano dallo stesso punto?

Un punto appartiene a una retta se le sue coordinate rispettano la regola di quella retta. Allora il punto che cerchi deve rispettare **tutte e due** le regole insieme. Completa la riga che manca.

| $x$ | primo drone: $y = 2x + 1$ | secondo drone: $y = -x + 7$ |
| --- | --- | --- |
| $0$ | $1$ | $7$ |
| $1$ | $3$ | $6$ |
| $2$ | [[5]] | [[5]] |
| $3$ | $7$ | $4$ |

:::details.hint
<summary>💡 Suggerimento</summary>

Per riempire la prima casella sostituisci $x = 2$ nella regola del primo drone: $2 \cdot 2 + 1$. Per la seconda sostituisci $x = 2$ nella regola del secondo drone: $-2 + 7$.

:::

Guarda adesso la tabella riga per riga. In una sola riga i due droni stanno alla stessa altezza.

Il punto in comune ha ascissa [[2]] e ordinata [[5]].

:::div.reveal
I due droni si incontrano in $(2; 5)$. È l'unico punto che rispetta tutte e due le regole.

:::graph
xrange: "-2,6"
yrange: "-2,10"
functions:
  - expr: "2*x + 1"
  - expr: "-x + 7"
boundpoints:
  - {x: 2, y: 5, label: "P"}
:::

Sul piano lo vedi subito. Le due rette si tagliano una sola volta, e il taglio cade proprio in $(2; 5)$. Due rette che hanno un punto in comune si chiamano **incidenti**, e quel punto si chiama **punto di intersezione**.
:::

---

> id: infinite-rette-per-un-punto
> title: Per uno stesso punto passano infinite rette
> use-mathjs: true

# Un punto molto frequentato

Arriva un terzo drone. La sua regola è $y = 5x - 5$.

Sostituisci $x = 2$ nella sua regola. Ottieni $y =$ [[5]].

Quindi anche il terzo drone passa per il punto $(2; 5)$? [[*Sì|No]]

Prova adesso a costruirne uno tuo. Scegli i due numeri della tua retta in modo che anche lei passi per $(2; 5)$, e scegline una diversa dalle tre che hai già visto.

| Coefficiente angolare $m$ | Ordinata all'origine $q$ |
| --- | --- |
| ${m}{m||input} | ${q}{q||input} |

[Verifica]{check: 2*m + q == 5 and m != 2 and m != -1 and m != 5}

:::details.hint
<summary>💡 Suggerimento</summary>

La tua retta è $y = mx + q$. Vuoi che il punto $(2; 5)$ rispetti la regola, cioè che $2m + q$ faccia $5$.

Allora scegli prima il coefficiente angolare che vuoi, per esempio $m = 4$. A quel punto $q$ non è più libero: ti serve $8 + q = 5$.

:::

:::graph
bind: [m, q]
xrange: "-2,6"
yrange: "-4,10"
functions:
  - expr: "2*x + 1"
    color: "#B9BDB4"
  - expr: "-x + 7"
    color: "#B9BDB4"
  - expr: "5*x - 5"
    color: "#B9BDB4"
  - expr: "m*x + q"
boundpoints:
  - {x: 2, y: 5, label: "P"}
:::

Quante rette passano per il punto $(2; 5)$? [[una sola|quattro|*infinite]]

:::div.reveal
Per un punto passano infinite rette. Basta scegliere un coefficiente angolare qualsiasi: l'ordinata all'origine si aggiusta da sé, perché il punto deve tornare.

Questo cambia la domanda di prima. Non ti stai chiedendo *se* due rette hanno un punto in comune perché sono passate vicino: ti stai chiedendo se esiste una coppia $(x; y)$ che rispetta le due regole nello stesso momento.
:::

---

> id: rette-parallele
> title: Due rette con lo stesso coefficiente angolare
> use-mathjs: true

# Il punto che non si trova

Adesso le due regole sono $y = 2x + 1$ e $y = 2x + 4$. Rispetto a prima è cambiato un numero solo.

Cerca come hai fatto prima il punto in comune. Completa l'ultima colonna: dice di quanto la seconda retta sta più in alto della prima.

| $x$ | $y = 2x + 1$ | $y = 2x + 4$ | differenza |
| --- | --- | --- | --- |
| $0$ | $1$ | $4$ | [[3]] |
| $3$ | $7$ | $10$ | [[3]] |
| $10$ | $21$ | $24$ | [[3]] |

La differenza non cambia mai. Vale $3$ per ogni ascissa che provi.

Quanti punti hanno in comune le due rette? [[uno|*nessuno|infiniti]]

:::details.hint
<summary>💡 Suggerimento</summary>

Perché le due rette abbiano un punto in comune, in quel punto la differenza fra le due ordinate deve essere zero. Qui la differenza vale sempre $3$, qualunque ascissa scegli.

:::

:::div.reveal
Non si incontrano mai. Due rette che non hanno nessun punto in comune si chiamano **parallele**.

:::graph
xrange: "-4,4"
yrange: "-4,8"
functions:
  - expr: "2*x + 1"
  - expr: "2*x + 4"
:::

Guarda perché succede. Le due rette hanno lo stesso coefficiente angolare: tutte e due salgono di $2$ ogni volta che vai a destra di $1$. Salgono alla stessa velocità, quindi la distanza fra loro resta sempre quella. Una non raggiunge mai l'altra.

L'ordinata all'origine invece è diversa: $1$ contro $4$. È quella che le tiene separate.
:::

---

> id: confronto-dei-coefficienti-angolari
> title: Riconoscere parallele e incidenti dai coefficienti angolari
> use-mathjs: true

# Senza fare nessun conto

La retta nera è $y = 2x + 1$ e non si muove. La retta rossa la comandi tu.

Coefficiente angolare della rossa: ${m}{m|1|-4,4,1}

Ordinata all'origine della rossa: ${q}{q|0|-5,5,1}

:::graph
bind: [m, q]
xrange: "-5,5"
yrange: "-6,8"
functions:
  - expr: "2*x + 1"
    color: "#1B2A4A"
  - expr: "m*x + q"
    color: "#D7263D"
:::

Porta la retta rossa a essere parallela alla nera, senza però farla finire sopra la nera.

[Verifica]{check: m == 2 and q != 1}

:::details.hint
<summary>💡 Suggerimento</summary>

Muovi prima il coefficiente angolare e guarda quando le due rette smettono di tagliarsi. Poi usa l'ordinata all'origine per tenerle staccate.

:::

Hai visto che decide tutto il coefficiente angolare. Adesso rispondi senza disegnare niente.

$y = 3x - 1$ e $y = 3x + 6$ sono [[select: incidenti|*parallele]].

$y = 4x$ e $y = -4x$ sono [[select: *incidenti|parallele]].

$y = 0,5x + 3$ e $y = x/2$ sono [[select: incidenti|*parallele]].

:::div.reveal
La regola è corta. Due rette con coefficienti angolari **diversi** sono incidenti e hanno esattamente un punto in comune. Due rette con lo stesso coefficiente angolare e ordinate all'origine diverse sono parallele e non hanno nessun punto in comune.

L'ultima coppia è una trappola utile: $0,5$ e $\frac{1}{2}$ sono lo stesso numero, scritto in due modi. Il coefficiente angolare va confrontato come numero, non come simbolo.
:::

---

> id: rette-coincidenti
> title: Rette coincidenti e i tre casi possibili
> use-mathjs: true

# La stessa retta travestita

Ecco due regole: $y = 2x + 1$ e $2y = 4x + 2$.

La seconda non è ancora scritta nella forma che conosci, perché a sinistra dell'uguale c'è $2y$ e non $y$. Finché la $y$ non è da sola non puoi leggere il coefficiente angolare.

Portala tu nella forma giusta: dividi per $2$ i due membri, poi sistema i conti che restano.

:::algebra isola="y"
2y = 4x + 2
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Senza selezionare niente, usa il secondo principio in basso: dividi per $2$. La lavagna divide ogni termine, quindi ti ritrovi $2y$ diviso $2$ da una parte, e $4x$ diviso $2$ più $2$ diviso $2$ dall'altra. A quel punto tocca a te: clicca un pezzo per volta e scrivi quanto fa.

:::

Quanti punti hanno in comune le due rette? [[uno|nessuno|*infiniti]]

:::div.reveal
Erano la stessa retta, scritta in due modi diversi. Ogni punto dell'una è anche un punto dell'altra. Due rette così si chiamano **coincidenti**.

Adesso hai il quadro completo. Due rette nel piano stanno insieme in uno di questi tre modi.

| Come stanno | Punti in comune | Come lo riconosci |
| --- | --- | --- |
| Incidenti | uno solo | coefficienti angolari diversi |
| Parallele | nessuno | stesso $m$, $q$ diversi |
| Coincidenti | infiniti | stesso $m$ e stesso $q$ |

Una cosa la hai fatta a mano e ha un nome. Quando hai cercato la coppia $(x; y)$ che rispetta due equazioni nello stesso momento, hai risolto un **sistema**. Qui lo hai risolto per tentativi e leggendo il grafico. Esiste un metodo per farlo con i conti, senza provare nessun valore, e lo vedrai in una lezione dedicata.
:::

---

> id: rotazione-del-passo
> title: La perpendicolare come passo girato di un quarto di giro

# Gira il passo

Manca il caso più interessante: due rette incidenti che si tagliano ad angolo retto. Due rette così si chiamano **perpendicolari**.

Parti dalla retta $y = 2x$, che passa per l'origine. Il suo passo va a destra di $1$ e sale di $2$: è la freccia nera.

Prendi la punta della freccia rossa e falla girare attorno all'origine, verso sinistra. Fermati quando l'angolo fra le due frecce è di $90°$.

:::p5 goal sketch=passo-girato height=400 ax=1 ay=2 xmin=-5 xmax=5 ymin=-5 ymax=5
:::

Il passo nero andava a destra di $1$ e saliva di $2$. Girato di un quarto di giro verso sinistra, adesso va a sinistra di [[2]] e sale di [[1]].

La retta rossa ha quindi coefficiente angolare [[-1/2 || −1/2 || -0,5 || −0,5]].

:::details.hint
<summary>💡 Suggerimento</summary>

Il coefficiente angolare è sempre il rapporto fra la salita e il passo. Qui la retta rossa sale di $1$ mentre va a sinistra di $2$, cioè mentre l'ascissa diminuisce di $2$: allora $\Delta y = 1$ e $\Delta x = -2$.

:::

:::div.reveal
Il passo $(1; 2)$ è diventato $(-2; 1)$. Le due componenti si sono scambiate di posto e una delle due ha cambiato segno.

Prova a girare il passo dall'altra parte. Ottieni $(2; -1)$, che è la freccia opposta, ma la retta rossa è esattamente la stessa. Le rette perpendicolari a una retta data hanno tutte lo stesso coefficiente angolare: la direzione perpendicolare è una sola.
:::

---

> id: prodotto-dei-coefficienti-angolari
> title: Il prodotto dei coefficienti angolari di due rette perpendicolari
> use-mathjs: true

# Sempre meno uno

Quello che hai fatto con la mano si può fare a mente. Gira ogni passo di un quarto di giro verso sinistra, poi scrivi il coefficiente angolare della perpendicolare.

| Retta | Il suo passo | Il passo girato | $m$ della perpendicolare |
| --- | --- | --- | --- |
| $y = 3x$ | $(1; 3)$ | $(-3; 1)$ | [[-1/3 || −1/3]] |
| $y = \frac{1}{2}x$ | $(2; 1)$ | $(-1; 2)$ | [[-2 || −2]] |
| $y = -4x$ | $(1; -4)$ | $(4; 1)$ | [[1/4 || 0,25]] |

Adesso guarda le coppie. Moltiplica il coefficiente angolare di ogni retta per quello della sua perpendicolare: $3 \cdot \left(-\frac{1}{3}\right)$, poi $\frac{1}{2} \cdot (-2)$, poi $-4 \cdot \frac{1}{4}$.

Il prodotto fa sempre [[-1 || −1]].

Usa la regola appena trovata. Una retta ha coefficiente angolare $\frac{5}{3}$. La sua perpendicolare ha coefficiente angolare [[-3/5 || −3/5]].

:::details.hint
<summary>💡 Suggerimento</summary>

Cerchi il numero che moltiplicato per $\frac{5}{3}$ dà $-1$. Capovolgi la frazione e cambia il segno.

:::

:::div.reveal
Due rette sono perpendicolari quando il prodotto dei loro coefficienti angolari vale $-1$.

$$m \cdot m' = -1 \qquad \text{cioè} \qquad m' = -\frac{1}{m}$$

Non è una regola da imparare a memoria: è il passo girato di un quarto di giro, scritto con i numeri. Le componenti si scambiano, una cambia segno, e il rapporto si capovolge insieme al segno.

Resta però una crepa. Se una retta è orizzontale il suo coefficiente angolare vale $0$, e nessun numero moltiplicato per $0$ può dare $-1$. La perpendicolare a una retta orizzontale però esiste eccome. Nello step successivo vai a vedere che cosa succede.
:::

---

> id: retta-verticale-senza-coefficiente-angolare
> title: La retta verticale non ha coefficiente angolare
> use-mathjs: true

# La crepa nella regola

Riprendi la crepa dello step precedente. La retta $y = 0$ è l'asse delle ascisse: è orizzontale e il suo coefficiente angolare vale $0$.

Il suo passo va a destra di $1$ e non sale per niente: è il passo $(1; 0)$. Girarlo di un quarto di giro si può, come tutti gli altri. Fallo.

:::p5 goal sketch=passo-girato height=400 ax=1 ay=0 xmin=-5 xmax=5 ymin=-5 ymax=5
:::

Girando a sinistra il passo $(1; 0)$ è diventato $(0;$ [[1]] $)$.

La retta rossa che ne esce è [[orizzontale|*verticale|obliqua]].

Adesso prova a calcolarne il coefficiente angolare. È il rapporto fra la salita e il passo orizzontale, cioè $\frac{\Delta y}{\Delta x}$. Qui la salita vale $1$, mentre il passo orizzontale vale [[0]].

Quindi la retta verticale ha coefficiente angolare [[uguale a zero|molto grande|*non ha coefficiente angolare]].

:::details.hint
<summary>💡 Suggerimento</summary>

Per trovare il coefficiente angolare devi dividere per il passo orizzontale. Quando il passo orizzontale è zero, quella divisione non si può fare: dividere per zero non è permesso.

Attenzione a non confondere i due casi. Una retta **orizzontale** ha coefficiente angolare $0$, che è un numero. Una retta **verticale** non ce l'ha proprio.

:::

Una retta verticale non si può scrivere come $y = mx + q$, perché quel coefficiente angolare non esiste. Si riconosce in un altro modo: tutti i suoi punti hanno la stessa ascissa.

Metti tre punti sulla retta verticale che passa per il punto $(3; 0)$.

:::graph
snap: 1
verify: true
xrange: "-5,6"
yrange: "-5,6"
points:
  - target: "3,-2"
  - target: "3,1"
  - target: "3,4"
:::

Quei tre punti hanno ordinate diverse ma la stessa ascissa. L'equazione di quella retta è $x =$ [[3]].

:::div.reveal
La regola del prodotto vale per tutte le coppie di rette perpendicolari, tranne una: quella formata da una retta orizzontale e una verticale. Lì non c'è nessun prodotto da fare, perché uno dei due coefficienti angolari non esiste.

Il quarto di giro invece funziona sempre, anche in questo caso. È il motivo per cui conviene tenerlo in mente: la formula è la traduzione in numeri di una rotazione, e la rotazione non si ferma mai.

| Retta | Equazione | Coefficiente angolare |
| --- | --- | --- |
| Obliqua | $y = mx + q$ | $m$, un numero diverso da zero |
| Orizzontale | $y = q$ | $0$ |
| Verticale | $x = k$ | non esiste |
:::
