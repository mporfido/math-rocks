> id: il-club-che-non-si-scrive
> title: Il club che non si scrive
> description: Una retta verticale non si può scrivere nella forma y = mx + q. Per scriverla serve un'altra forma, ax + by + c = 0. In questa forma si possono scrivere tutte le rette.

---

> id: due-club-strani
> title: Rette orizzontali e rette verticali

# Due club strani

Il primo club ha questi soci: $(1; 4)$, $(3; 4)$, $(-7; 4)$ e $(100; 4)$.

Il secondo club ha questi soci: $(2; 0)$, $(2; 9)$ e $(2; -3)$.

:::graph
xrange: "-8,8"
yrange: "-4,10"
boundpoints:
  - {x: 1, y: 4, label: " "}
  - {x: 3, y: 4, label: " "}
  - {x: -7, y: 4, label: " "}
  - {x: 2, y: 0, label: " "}
  - {x: 2, y: 9, label: " "}
  - {x: 2, y: -3, label: " "}
:::

Metti in fila due soci del primo club. Di quanto cambia l'ordinata?

:::table
| v | $x$ | $y$ | v |
| --- | --- | --- | --- |
| $+2$ | $1$ | $4$ | [[0 || +0]] |
| | $3$ | $4$ | |
:::

Il socio del primo club con ascissa $0$ ha ordinata [[4]].

Quindi la regola del primo club è [[$x = 4$|*$y = 4$|$y = 4x$]].

Adesso guarda il secondo club. Il socio con ascissa $0$ [[è $(0; 2)$|è $(0; 0)$|*non esiste]]. I soci con ascissa $2$ [[sono uno solo|*sono infiniti]].

Quale regola dice chi è socio del secondo club? [[$y = 2$|*$x = 2$|$y = 2x$]]

:::details.hint
<summary>💡 Suggerimento</summary>

Guarda che cosa hanno in comune tutti i soci di un club. Guarda anche che cosa cambia da un socio all'altro. La regola parla solo della cosa che resta uguale.

:::

:::div.reveal
Il primo club è una retta **orizzontale**. La retta non sale mai, quindi $m = 0$. L'equazione $y = 0 \cdot x + 4$ diventa semplicemente $y = 4$. Tutti i soci hanno ordinata 4. L'ascissa invece può essere qualsiasi numero.

Il secondo club è una retta **verticale**. Questa retta non si può scrivere nella forma $y = mx + q$. Con quella forma, a ogni ascissa corrisponde un solo socio. Qui invece con ascissa 2 ci sono infiniti soci. Con le altre ascisse non c'è nessun socio. Non riusciamo nemmeno a calcolare $m$, perché lo scalino ha passo zero:

:::table
| v | $x$ | $y$ | v |
| --- | --- | --- | --- |
| $+0$ | $2$ | $0$ | $+9$ |
| | $2$ | $9$ | |
:::

La salita è 9 e il passo è 0. Non possiamo dividere per zero.

La regola del secondo club esiste, ed è $x = 2$. Però non si può scrivere nella forma «$y = \ldots$». Ci serve un altro modo di scrivere le rette.
:::

---

> id: quattro-carte
> title: Equazioni diverse della stessa retta

# La stessa retta?

Ecco quattro equazioni, scritte su quattro carte. Descrivono tutte la stessa retta?

$$y = 3x - 6 \qquad 3x - y - 6 = 0 \qquad 6x - 2y = 12 \qquad 3x + y - 6 = 0$$

Proviamo con un punto. Il punto $(2; 0)$ appartiene alla retta $y = 3x - 6$, perché $3 \cdot 2 - 6 = 0$.

Prova il punto $(2; 0)$ anche nell'ultima carta: $3 \cdot 2 + 0 - 6 =$ [[0]]. Il risultato è 0, quindi il punto appartiene anche a questa retta.

Adesso prova un altro punto di $y = 3x - 6$, il punto $(4; 6)$. Mettilo nell'ultima carta: $3 \cdot 4 + 6 - 6 =$ [[12]].

Quindi il punto $(4; 6)$ [[appartiene|*non appartiene]] alla retta dell'ultima carta.

Adesso smista tutte le carte. Ogni carta descrive la stessa retta di $y = 3x - 6$ oppure una retta diversa?

:::smista goal categorie="stessa retta;retta diversa"
3x - y - 6 = 0 -> stessa retta
6x - 2y = 12 -> stessa retta
-3x + y + 6 = 0 -> stessa retta
3x + y - 6 = 0 -> retta diversa
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Prova su ogni carta i due punti $(2; 0)$ e $(4; 6)$. Se funzionano tutti e due, la carta descrive la stessa retta. Infatti per due punti passa una sola retta.

:::

In quale carta leggi subito il coefficiente angolare e l'ordinata all'origine? [[$6x - 2y = 12$|*$y = 3x - 6$|$3x - y - 6 = 0$]]

:::div.reveal
Un punto solo non basta per decidere. Il punto $(2; 0)$ appartiene a tutte le carte, perché è il punto dove le due rette si incrociano. Con due punti invece sei sicuro, perché per due punti passa una sola retta.

Il controllo di un punto funziona allo stesso modo su tutte le carte. Metti le coordinate al posto delle lettere e guarda se l'uguaglianza è vera. Invece il coefficiente angolare e l'ordinata all'origine si leggono subito solo su $y = 3x - 6$. Le altre carte descrivono la stessa retta, ma la scrivono in un altro modo. Per esempio, parti da $3x - y - 6 = 0$ e aggiungi $y$ a tutti e due i membri. Ottieni $3x - 6 = y$, cioè la prima carta.

La carta diversa è $3x + y - 6 = 0$. Se ricavi la $y$, ottieni $y = -3x + 6$. Questa retta scende.
:::

---

> id: una-scrittura-per-tutte
> title: Forma implicita e forma esplicita

# La retta verticale, scritta come le carte

Nelle carte tutti i termini stanno a sinistra. A destra dell'uguale c'è solo 0. Prova a scrivere così la retta verticale del primo step, $x = 2$. Diventa [[$x + y - 2 = 0$|*$x - 2 = 0$|$y - 2 = 0$]].

In questa scrittura, il numero davanti alla $y$ è [[0]].

:::details.hint
<summary>💡 Suggerimento</summary>

Porta il 2 a sinistra dell'uguale. La $y$ non compare. È come se ci fosse $0y$.

:::

Adesso guarda una carta nuova, $5x + 2y - 8 = 0$. Non devi disegnare la retta. Vuoi sapere quanto sale e dove taglia l'asse $y$. Per saperlo ti serve la $y$ da sola a sinistra. Ricavala qui sotto.

:::algebra isola="y"
5x + 2y - 8 = 0
:::

La retta ha ordinata all'origine $q =$ [[4]]. Il suo coefficiente angolare è $m =$ [[-5/2 || −5/2 || -2,5 || −2,5 || -2.5 || −2.5]].

:::div.reveal
La scrittura con 0 a destra, $ax + by + c = 0$, si chiama **forma implicita**. La scrittura con la $y$ da sola, $y = mx + q$, si chiama **forma esplicita**.

Nella forma implicita puoi scrivere tutte le rette, anche quelle verticali. Per una retta verticale basta che $b$ sia 0. La forma esplicita invece si legge più facilmente. Quando ti servono $m$ e $q$, ricavi la $y$ come hai appena fatto.
:::

---

> id: tre-manopole
> title: Il ruolo di a, b e c nella forma implicita
> use-mathjs: true

# I numeri a, b e c

Ogni retta del piano si può scrivere come $ax + by + c = 0$. Qui puoi cambiare i tre numeri con i cursori. La retta si ridisegna mentre li muovi.

$a$: ${a}{a|2|-5,5,1}

$b$: ${b}{b|1|-5,5,1}

$c$: ${c}{c|-4|-10,10,1}

:::p5 sketch=retta-nel-piano modo=implicita bind=a,b,c a=2 b=1 c=-4 height=380
:::

Muovi solo $c$. La retta [[gira|*si sposta e resta parallela|non cambia]].

Adesso muovi solo $a$. La retta [[si sposta e resta parallela|*gira intorno al punto dove taglia l'asse y|non cambia]].

Porta $b$ a 0. La retta diventa [[orizzontale|*verticale|una retta qualsiasi]].

Adesso sistema i cursori in modo da ottenere di nuovo la retta verticale $x = 2$.

[Verifica]{check: b == 0 and a != 0 and 2*a + c == 0}

:::details.hint
<summary>💡 Suggerimento</summary>

La retta $x = 2$ si scrive $1x + 0y - 2 = 0$. Va bene anche se moltiplichi tutti i numeri per 2 o per 3. Ottieni sempre la stessa retta.

:::

:::div.reveal
Adesso sai perché nella forma implicita ci stanno tutte le rette. Il numero $c$ sposta la retta senza farla girare. Il numero $a$ fa girare la retta. Quando $b = 0$, la $y$ sparisce e resta $ax + c = 0$. Questa è una retta verticale, come $x = 2$.

Quando $b$ non è zero, puoi ricavare la $y$ come hai fatto con $5x + 2y - 8 = 0$. Ottieni sempre questi due numeri:

$$m = -\frac{a}{b} \qquad\qquad q = -\frac{c}{b}$$

Che cosa succede se $a$ e $b$ sono tutti e due zero? Prova con i cursori: la retta sparisce. Per avere una retta, almeno uno tra $a$ e $b$ deve essere diverso da zero.
:::
