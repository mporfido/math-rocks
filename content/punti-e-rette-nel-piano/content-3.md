> id: il-club-che-non-si-scrive
> title: Il club che non si scrive
> description: Una retta verticale non entra nella forma y = mx + q. Serve una scrittura più capiente, ax + by + c = 0, dove entrano tutte le rette.

---

> id: due-club-strani
> title: Due club strani

# Due club strani

Il primo club: $(1; 4)$, $(3; 4)$, $(-7; 4)$, $(100; 4)$.

Il secondo: $(2; 0)$, $(2; 9)$, $(2; -3)$.

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

Nel primo club, a ogni passo verso destra l'ordinata sale di [[0]], e il socio con ascissa $0$ ha ordinata [[4]].

Quindi la sua regola è [[$x = 4$|*$y = 4$|$y = 4x$]].

Nel secondo club, il socio con ascissa $0$ [[è $(0; 2)$|è $(0; 0)$|*non c'è]], e quelli con ascissa $2$ [[sono uno solo|*sono infiniti]].

Quale regola dice chi è socio del secondo club? [[$y = 2$|*$x = 2$|$y = 2x$]]

:::details.hint
<summary>💡 Suggerimento</summary>

Guarda che cosa hanno in comune tutti i soci di un club, e che cosa invece cambia da un socio all'altro. La regola dice solo la cosa che non cambia.

:::

:::div.reveal
Il primo club è una retta **orizzontale**. Non sale mai, quindi $m = 0$, e $y = 0 \cdot x + 4$ si riduce a $y = 4$: tutti i soci hanno ordinata $4$, l'ascissa è libera.

Il secondo è una retta **verticale**, e qui la forma $y = mx + q$ si inceppa. Quella forma, data un'ascissa, ti dà *un* socio. Qui con ascissa $2$ ce ne sono infiniti, e con qualsiasi altra ascissa nessuno. Non c'è $m$ che tenga: lo scalino ha passo zero, e per zero non si divide.

La regola c'è, $x = 2$, ma nella forma «$y = \ldots$» non si riesce a scrivere. Serve un'altra scrittura.
:::

---

> id: quattro-carte
> title: Quattro carte

# Lo stesso club?

Queste quattro carte descrivono tutte lo stesso club?

$$y = 3x - 6 \qquad 3x - y - 6 = 0 \qquad 6x - 2y = 12 \qquad 3x + y - 6 = 0$$

Mettiamole alla prova con un punto. $(2; 0)$ è socio di $y = 3x - 6$, perché $3 \cdot 2 - 6 = 0$.

Provalo nell'ultima carta: $3 \cdot 2 + 0 - 6 =$ [[0]]. Regge anche lì.

Adesso prova un altro socio di $y = 3x - 6$, cioè $(4; 6)$, sempre nell'ultima carta: $3 \cdot 4 + 6 - 6 =$ [[12]].

Quindi $(4; 6)$ [[è socio|*non è socio]] del club dell'ultima carta.

Adesso smista tutte le carte: descrivono lo stesso club di $y = 3x - 6$ o un altro?

:::smista goal categorie="stesso club;un altro club"
3x - y - 6 = 0 -> stesso club
6x - 2y = 12 -> stesso club
-3x + y + 6 = 0 -> stesso club
3x + y - 6 = 0 -> un altro club
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Prova su ogni carta i due soci $(2; 0)$ e $(4; 6)$. Se reggono tutti e due, la carta è la stessa retta: per due punti ne passa una sola.

:::

Su quale carta leggi a occhio coefficiente angolare e ordinata all'origine? [[$6x - 2y = 12$|*$y = 3x - 6$|$3x - y - 6 = 0$]]

:::div.reveal
Un punto solo non basta: $(2; 0)$ sta su tutte le carte, perché è il punto dove le due rette si incrociano. Con due punti invece sei sicuro, perché per due punti passa una retta sola.

Il test d'ingresso funziona allo stesso modo su tutte le scritture: sostituisci e guarda se l'uguaglianza regge. Coefficiente angolare e ordinata all'origine, invece, si leggono al volo solo su $y = 3x - 6$. Le altre sono la stessa retta travestita: parti da $3x - y - 6 = 0$, aggiungi $y$ a tutti e due i membri e torni a $3x - 6 = y$.

L'intrusa, $3x + y - 6 = 0$, è $y = -3x + 6$: scende.
:::

---

> id: una-scrittura-per-tutte
> title: Una scrittura per tutte

# Il club impossibile, alla maniera delle carte

Le carte mettono tutto a sinistra e lasciano $0$ a destra. Il club verticale del primo step, $x = 2$, scritto così diventa [[$x + y - 2 = 0$|*$x - 2 = 0$|$y - 2 = 0$]].

In questa scrittura il numero davanti alla $y$ vale [[0]].

:::details.hint
<summary>💡 Suggerimento</summary>

Porta il $2$ a sinistra. E la $y$? Non c'è: è come se ci fosse $0y$.

:::

Adesso una carta nuova, $5x + 2y - 8 = 0$, da leggere **senza disegnare**. Per sapere di quanto sale e dove taglia l'asse verticale ti serve la $y$ da sola: ricavala qui sotto.

:::algebra isola="y"
5x + 2y - 8 = 0
:::

Quindi la retta ha ordinata all'origine $q =$ [[4]] e coefficiente angolare $m =$ [[-5/2 || −5/2 || -2,5 || −2,5 || -2.5 || −2.5]].

:::div.reveal
La scrittura con lo zero a destra, $ax + by + c = 0$, si chiama **forma implicita**. Quella con la $y$ da sola, $y = mx + q$, è la **forma esplicita**.

L'implicita è più capiente: ci entrano anche le rette verticali, basta che $b$ valga $0$. L'esplicita in cambio si legge al volo. Quando ti servono $m$ e $q$ ricavi la $y$, come hai appena fatto: è uno strumento da usare quando serve.
:::

---

> id: tre-manopole
> title: Tre manopole
> use-mathjs: true

# a, b, c

Ogni retta del piano si scrive $ax + by + c = 0$. Qui i tre numeri sono tre manopole: la retta si ridisegna mentre le giri.

$a$: ${a}{a|2|-5,5,1}

$b$: ${b}{b|1|-5,5,1}

$c$: ${c}{c|-4|-10,10,1}

:::p5 sketch=retta-nel-piano modo=implicita bind=a,b,c a=2 b=1 c=-4 height=380
:::

Muovi solo $c$. La retta [[gira|*si sposta restando parallela|non cambia]].

Adesso muovi solo $a$. La retta [[si sposta restando parallela|*gira attorno al punto in cui taglia l'asse verticale|non cambia]].

Porta $b$ a $0$. La retta diventa [[orizzontale|*verticale|una retta qualsiasi]].

Ultima cosa: sistema le manopole in modo da riottenere il club impossibile, $x = 2$.

[Verifica]{check: b == 0 and a != 0 and 2*a + c == 0}

:::details.hint
<summary>💡 Suggerimento</summary>

$x = 2$ si scrive $1x + 0y - 2 = 0$. Ma va bene anche il doppio di tutto, o il triplo: sono carte dello stesso club.

:::

:::div.reveal
Ecco perché nella forma implicita entrano tutte le rette. $c$ sposta la retta senza girarla, $a$ la fa girare, e con $b = 0$ la $y$ sparisce: resta $ax + c = 0$, una retta verticale. Il club impossibile era proprio questo.

Quando $b$ non è zero, ricavando la $y$ come hai fatto con $5x + 2y - 8 = 0$ trovi sempre

$$m = -\frac{a}{b} \qquad\qquad q = -\frac{c}{b}$$

E se $a$ e $b$ valgono tutti e due zero? Provalo: la retta sparisce. Per avere una retta serve almeno una delle due lettere.
:::
