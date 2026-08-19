> id: espressioni-algebriche
> title: Espressioni algebriche
> description: Leggere e scrivere con le lettere, e darle un valore quando serve.

---

> id: il-segno-che-non-si-scrive
> title: Il segno che sparisce

# Una moltiplicazione che non si vede

Nella prima lezione hai scritto $3n + 1$ e $5n - 2$. In mezzo a quelle scritture c'è una moltiplicazione, ma il suo segno non si vede: $3n$ vuol dire **3 moltiplicato n**.

Non è una furbizia da matematici pigri: con le lettere il segno si può togliere senza creare confusione, e la scrittura diventa più corta da leggere.

Che cosa vuol dire $4x$? [[select: 4 sommato a x|*4 moltiplicato x|4 diviso x]]

Scrivi in forma corta $7 \cdot y$: [[7y]]

## Vale anche fra due lettere

Anche fra due lettere il segno sparisce: $x \cdot y$ si scrive semplicemente $xy$.

## Ma fra due numeri no

E allora perché non scriviamo anche $2 \cdot 3$ come $23$?

[[select: perché 2 e 3 sono numeri piccoli|*perché 23 si legge già ventitré|perché la moltiplicazione fra numeri è diversa]]

:::div.reveal
**Ecco la regola, ed ecco il suo limite.**

Fra un numero e una lettera, o fra due lettere, il segno di moltiplicazione **non si scrive**:

$$3 \cdot n = 3n \qquad 7 \cdot y = 7y \qquad x \cdot y = xy$$

Fra due numeri invece resta, perché due cifre attaccate formano già un altro numero: $23$ è ventitré, non sei.

Un caso da tenere a mente: la lettera scritta da sola, $x$, vuol dire $1 \cdot x$. L'uno non si scrive, ma c'è.
:::

---

> id: dalle-parole-alla-scrittura
> title: Dalle parole alla scrittura

# Scrivere quello che si dice

Un'espressione con le lettere è quasi sempre la traduzione di una frase. Il lavoro è tutto qui: leggere la frase pezzo per pezzo e scriverla.

Traduci queste, usando le lettere che compaiono nella frase.

Il **doppio** di $x$: [[2x]]

$x$ **aumentato di** 5: [[x+5 || x + 5]]

Il **triplo** di $y$: [[3y]]

## Adesso una frase con due lettere

La **somma** di $x$ e il **triplo** di $y$: [[x+3y || x + 3y || 3y+x || 3y + x]]

:::details.hint
<summary>💡 Suggerimento</summary>

Spezza la frase: *la somma di* … *e* … dice che ci sarà un $+$. A sinistra c'è $x$. A destra c'è "il triplo di $y$", che da solo si scriverebbe $3y$.

:::

:::div.reveal
**Le parole hanno una traduzione fissa.** Vale la pena impararle:

| Si dice | Si scrive |
| --- | --- |
| il doppio di $x$ | $2x$ |
| il triplo di $y$ | $3y$ |
| la metà di $x$ | $\frac{x}{2}$ |
| $x$ aumentato di 5 | $x + 5$ |
| $x$ diminuito di 5 | $x - 5$ |
| la somma di $x$ e $y$ | $x + y$ |

E nota una cosa: $x + 3y$ resta così. Non c'è nient'altro da fare, non è un conto lasciato a metà. **È già la risposta.**
:::

---

> id: le-parentesi-cambiano-tutto
> title: Quando servono le parentesi

# Due frasi quasi uguali

Leggi queste due frasi. Cambia solo una virgola:

- *il doppio di $x$, più 3* 
- *il doppio di $x$ più 3* 

Per capire la differenza scriviamole in un altro modo:

- *il doppio di $x$... poi aumentato di 3* → si scrive $2x + 3$
- *il doppio della... somma di $x$ e 3* → si scrive $2(x + 3)$

Sembrano la stessa cosa, ma l'operazione da svolgere per prima è diversa. Il modo più sicuro per verificare è **provare un numero**.

Muovi lo slider e guarda i due risultati.

$x$ vale: ${x}{x|4|0,10,1}

$$2 \cdot ${x} + 3 = ${= 2*x+3} \qquad\qquad 2 \cdot (${x} + 3) = ${= 2*(x+3)}$$

Porta lo slider su $x = 4$.

Quanto vale $2x + 3$? [[11]]

Quanto vale $2(x + 3)$? [[14]]

## Provaci tu

Il **quintuplo della somma** di $y$ e 1: [[select: 5y+2|*5(y+1)|5y+5]]

:::div.reveal
**Le parentesi dicono in che ordine si fanno le cose.**

- In $2x + 3$ prima si moltiplica 2 per il valore di $x$, poi si aggiunge 3.
- In $2(x + 3)$ prima si somma dentro la parentesi, poi si moltiplica il risultato per 2.

Le parentesi servono proprio quando la frase dice "il doppio **di tutto quanto**".

E hai appena usato lo strumento più affidabile che esiste per controllare una scrittura con le lettere: **darle un numero e vedere che cosa succede**. Nella prima lezione lo avevi fatto per verificare $5n - 2$ sui passi che già conoscevi.
:::

---

> id: dalla-scrittura-alle-parole
> title: Dalla scrittura alle parole

# Leggere ad alta voce

Fin qui sei andato dalle parole alla scrittura. Adesso la direzione opposta: davanti a un'espressione, saper dire che cosa afferma.

Ti ricordi $5n - 2$? Era la figura della prima lezione. Come si legge?

[[select: 5 diminuito di n, per 2|il quintuplo della differenza "n meno 2"|*n moltiplicato 5, poi meno 2]]

## Attenzione a queste due

$n + 3$ e $3n$ si scrivono quasi uguali, ma dicono cose molto diverse.

Quale delle due dice "**il triplo** di $n$"? [[select: n+3|*3n]]

E quale dice "$n$ **aumentato di** 3"? [[select: *n+3|3n]]

:::details.hint
<summary>💡 Suggerimento</summary>

Prova con $n = 10$. Il triplo di 10 è 30. Dieci aumentato di 3 è 13. Quale delle due scritture dà 30?

:::

:::div.reveal
**Un numero attaccato a una lettera moltiplica. Un numero staccato da un $+$ si aggiunge.**

$$3n = n + n + n \qquad\qquad n + 3 = n \text{ e poi tre in più}$$

Con $n = 10$ la differenza è evidente: 30 contro 13. Con $n = 1$ invece darebbero 3 e 4, quasi uguali — ed è per questo che quando controlli una scrittura conviene **non** provare con 1 o con 0: sono i numeri che nascondono gli errori.
:::

---

> id: dare-un-valore
> title: Dare un valore alla lettera

# Metti un numero al posto della lettera

Dare un valore numerico ad una lettera si chiama **sostituire**.

Sostituire vuol dire cancellare la lettera e scrivere al suo posto un numero. Quello che resta è un'espressione con soli numeri, che quindi si può calcolare.

Ecco l'espressione $2x + 5$. Muovi lo slider e guarda la sostituzione avvenire.

$x$ vale: ${x}{x|3|0,10,1}

$$2x + 5 \;\longrightarrow\; 2 \cdot ${x} + 5 = ${= 2*x+5}$$

Adesso rispondi tu, senza guardare lo slider.

Quanto vale $2x + 5$ quando $x = 6$? [[17]]

E quando $x = 0$? [[5]]

## Al contrario

Porta lo slider sul valore di $x$ per cui $2x + 5$ fa esattamente **21**.

[Verifica]{check: x == 8}

:::div.reveal
**Sostituire è la cosa più semplice che si fa con le lettere, ed è anche la più utile.**

$$x = 6 \;\rightarrow\; 2 \cdot 6 + 5 = 17$$

Attenzione a un punto solo: quando sostituisci, il segno di moltiplicazione **torna**. $2x$ con $x = 6$ non diventa $26$: diventa $2 \cdot 6$, cioè 12.

E hai anche fatto il percorso inverso — dal risultato alla lettera. È una domanda diversa e molto più difficile, e più avanti avrà un nome tutto suo: *equazione*.
:::

---

> id: due-lettere
> title: Due lettere insieme

# Due lettere, due numeri

Un'espressione può avere più di una lettera. La regola non cambia: si sostituisce ogni lettera con il suo numero, e poi si calcola.

Riprendiamo $x + 3y$, quella che hai scritto poco fa.

$x$ vale: ${x}{x|2|0,10,1}

$y$ vale: ${y}{y|1|0,10,1}

$$${x} + 3 \cdot ${y} = ${= x + 3*y}$$

Le due lettere sono **indipendenti**: puoi muovere una senza toccare l'altra. Ma a ogni coppia di valori corrisponde **un solo** risultato.

Completa la tabella.

:::table
| $x$ | $y$ | $x + 3y$ |
| --- | --- | -------- |
| 2   | 1   | 5        |
| 0   | 4   | [[12]]   |
| 6   | 2   | [[12]]   |
| 5   | 0   | [[5]]    |
:::

:::div.reveal
**Guarda le due righe che danno 12.**

$x = 0, y = 4$ e $x = 6, y = 2$ sono coppie diverse, eppure il risultato è lo stesso. Non c'è niente di strano: due ingressi diversi possono dare la stessa uscita.

Quello che invece **non** può succedere è il contrario: la stessa coppia che dà due risultati diversi. Quando alla fine della prima lezione abbiamo chiamato *funzione* la macchina dei passi, era esattamente questo il punto.
:::

---

> id: il-perimetro-in-lettere
> title: Il perimetro in lettere

# Il giro della figura, scritto con le lettere

Un rettangolo può avere mille misure diverse. Se chiamiamo $b$ la base e $h$ l'altezza, però, li descriviamo **tutti in una volta** — proprio come $3n + 1$ descriveva tutti i passi del pattern.

:::p5 sketch=figura-rettangolo base=b altezza=h vertici=A,B,C,D segni=si height=250
:::

Il perimetro è il giro della figura: due lati lunghi $b$ e due lati lunghi $h$.

Come si scrive? [[select: b+h|*2b+2h|4bh]]

## Un altro modo di guardarlo

C'è chi fa il giro in un altro modo: prende **mezzo perimetro**, cioè $b + h$, e lo raddoppia. Viene $2(b + h)$.

Provale tutte e due con $b = 5$ e $h = 3$: quanto viene, in tutti e due i casi? [[16]]

## Il quadrato

Nel quadrato i quattro lati sono uguali. Se chiamiamo $l$ il lato, il perimetro si scrive [[4l]].

:::p5 sketch=figura-rettangolo base=l altezza=l segni=si height=230
:::

:::div.reveal
**Due scritture, la stessa figura.**

$$2b + 2h \qquad\text{e}\qquad 2(b + h)$$

Danno lo stesso numero per ogni coppia di misure: con $b = 5$ e $h = 3$ fanno 16 tutte e due. Nessuna delle due è "quella giusta" — è la stessa situazione di $3n + 1$ e $4 + 3(n-1)$ nella prima lezione.

E nota che nel quadrato non abbiamo scritto $l + l + l + l$: quattro lati uguali si contano una volta sola, e diventano $4l$. È lo stesso gesto con cui, davanti alla figura, avevi scritto $3n$ invece di contare colonna per colonna.
:::

---

> id: larea-in-lettere
> title: L'area in lettere

# Quanto spazio occupa

Il perimetro è il giro. L'**area** è quanto la figura copre, e per un rettangolo si trova moltiplicando la base per l'altezza.

Con le lettere: base $b$, altezza $h$, area $b \cdot h$.

E il segno di moltiplicazione? Sparisce, come nello step di apertura.

Come si scrive l'area del rettangolo? [[select: b+h|2bh|*bh]]

## Con i numeri

Qui la base è fissa e vale 6 cm, l'altezza la muovi tu. La figura mostra le misure e l'area.

altezza $h$: ${h}{h|3|1,6,1}

:::p5 sketch=figura-rettangolo base=6 altezza=h variabile=h bind=h mostra=entrambi area=si unita=cm height=280
:::

Quando $h = 4$, quanto vale l'area? [[24]]

E quando $h = 6$? [[36]]

:::div.reveal
**Perimetro e area sono due domande diverse sulla stessa figura.**

$$\text{perimetro} = 2b + 2h \qquad\qquad \text{area} = bh$$

Il perimetro somma, l'area moltiplica. Sono due macchine diverse che partono dalle stesse due misure.

Per il quadrato l'area sarebbe $l \cdot l$, cioè $ll$ — che però non si scrive così: un numero moltiplicato per se stesso si scrive come una potenza: $l^2$.
:::

---

> id: una-grandezza-in-funzione-di-unaltra
> title: Una grandezza che dipende da un'altra

# Quando una misura dipende da un'altra

In un triangolo equilatero i tre lati sono uguali. Basta conoscerne **uno** per sapere tutto il resto.

:::p5 sketch=figura-triangolo tipo=equilatero etichette-lati=x,x,x segni=si height=250
:::

Se il lato vale $x$, il perimetro si scrive [[3x]].

Non serve sapere quanto vale $x$: il perimetro **dipende** da $x$, e questa scrittura dice esattamente come.

## Adesso un rettangolo speciale

In questo rettangolo la base è sempre **il doppio** dell'altezza. Muovi lo slider: cambiano tutte e due insieme.

altezza $h$: ${h}{h|3|1,6,1}

:::p5 sketch=figura-rettangolo base=2h altezza=h variabile=h bind=h mostra=entrambi perimetro=si unita=cm height=290
:::

Se l'altezza è $h$, come si scrive la base? [[select: h+2|*2h|h/2]]

E quindi quanto vale **l'area**? Moltiplica base e altezza (entrambe si scrivono usando la lettera h)
[[*$2h^2$|$3h$|$4h^2$]]

:::details.hint
<summary>💡 Suggerimento</summary>

"Il doppio di $h$" si scrive $2h$. Si moltiplica per l'altezza: $2h \cdot h$... 

:::

:::div.reveal
# Questo si chiama **scrivere una grandezza in funzione di un'altra**

Quando scrivi

$$\text{base} = 2h \qquad\qquad \text{perimetro} = 3x$$

non stai calcolando niente: stai dicendo **da chi dipende** quella misura, e in che modo: la base si calcola raddoppiando l'altezza, il perimetro moltiplicando per tre il alto $x$,  l'area si ottiene facendo il quadrato dell'altezza e moltiplicandolo per 2...

Ed è la stessa cosa che avevi già in mano alla fine della prima lezione:

$$f(n) = 5n - 2$$

Lì entrava il numero del passo e usciva la quantità di quadratini. Qui entra il lato e esce il perimetro, entra l'altezza e esce la base. Cambia la storia, non la macchina.

**Nella prossima lezione:** cominceremo a lavorare *dentro* queste scritture — a confrontarle, a trasformarle, a scoprire quando due espressioni diverse sono in realtà la stessa.
:::
