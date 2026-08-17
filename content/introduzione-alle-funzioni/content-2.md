> id: la-funzione-disegnata
> title: La stessa funzione, disegnata
> description: "Dalle frecce ai punti: dominio, immagine e controimmagine letti su un grafico."

---

> id: dalle-frecce-ai-punti
> title: Dalle frecce ai punti

# Le frecce non scalano

Il diagramma a frecce funziona bene con cinque o sei elementi. Prova a immaginarlo con **cento** numeri di partenza: cento pallini in colonna e cento frecce incrociate. Illeggibile.

Serve un modo più compatto di dire la stessa cosa. E c'è, ed è vecchio di quattrocento anni.

Ogni freccia collega due numeri: quello che **entra** e quello che **esce**. Due numeri sono una **coppia**, e una coppia di numeri è un **punto**: il primo dice quanto andare a destra, il secondo quanto andare in alto.

## Prova con la macchina dei pattern

Torniamo a $f(n) = 5n - 2$. Le sue prime quattro coppie le conosci già:

:::table
| Entra: $n$ | Esce: $f(n)$ |
| ---------- | ------------ |
| 1          | 3            |
| 2          | 8            |
| 3          | 13           |
| 4          | 18           |
:::

Tocca il piano per mettere un punto su ogni coppia della tabella, poi premi "Verifica".

:::graph
xrange: "-1,6"
yrange: "-4,22"
aspect: free
xticks: 1
yticks: 2
snap: 1
tolerance: 0.4
verify: true
coords: true
points:
  - target: "1,3"
  - target: "2,8"
  - target: "3,13"
  - target: "4,18"
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Il primo numero della coppia si legge sull'asse orizzontale, il secondo su quello verticale. Il punto della prima riga va a destra di 1 e in alto di 3.

:::

:::div.reveal
**Una freccia è diventata un punto.**

Quello che nel diagramma era "dal passo 2 parte una freccia che arriva su 8", qui è il punto di coordinate $(2,\ 8)$ — e si legge in un colpo d'occhio.

Il vantaggio non è solo lo spazio. Nel diagramma a frecce l'ordine dei pallini era una nostra scelta; qui no: i numeri stanno sull'asse **nel loro ordine naturale**, e allora la disposizione dei punti dice qualcosa. Guarda i tuoi quattro: stanno in fila.

Quella non è una coincidenza, ed è una cosa che le frecce non ti avrebbero mai fatto vedere.
:::

---

> id: punti-o-linea
> title: Punti staccati o linea continua

# La stessa formula, due domini diversi

I quattro punti sono in fila. Verrebbe voglia di unirli con una riga e prolungarla. Ma **si può?**

Dipende da una cosa sola: qual è il dominio.

- come **macchina dei pattern**, $5n - 2$ accetta solo i passi: $1, 2, 3, 4, \dots$ Non esiste il passo $2,5$. Il disegno giusto sono quattro **punti staccati**.
- come **funzione numerica**, $5x - 2$ accetta qualsiasi numero, anche $2,5$, anche $-1,3$. E allora fra un punto e l'altro ce ne sono infiniti altri: il disegno diventa una **linea continua**.

:::graph
xrange: "-1,6"
yrange: "-4,22"
aspect: free
xticks: 1
yticks: 2
functions:
  - expr: "5*x-2"
boundpoints:
  - {x: 1, y: 3, label: "n=1"}
  - {x: 2, y: 8, label: "n=2"}
  - {x: 3, y: 13, label: "n=3"}
  - {x: 4, y: 18, label: "n=4"}
:::

Quanto vale $f(2{,}5)$? [[10,5 || 10.5]]

Quel punto appartiene alla linea? [[select: *sì|no]]

Appartiene alla macchina dei pattern? [[select: *no, non esiste il passo 2,5|sì, sta sulla linea]]

:::div.reveal
**Il grafico non dipende solo dalla formula.**

La stessa formula, con due domini diversi, dà due disegni diversi: quattro punti oppure una retta. Quando ti chiedono "disegna la funzione", la formula da sola non basta — devi sapere anche **che cosa può ricevere**.

Da qui in avanti lavoriamo con funzioni numeriche a dominio largo, quelle che danno linee. Ed è ora di ritrovarci sopra le quattro parole della lezione scorsa.
:::

---

> id: il-dominio-sul-grafico
> title: Il dominio, sul grafico

# Dove la curva esiste

Ecco la funzione $f(x) = \sqrt{x-1}$: prende un numero, gli toglie 1 e ne fa la radice quadrata.

:::graph
xrange: "-4,10"
yrange: "-2,4"
aspect: free
xticks: 1
yticks: 1
functions:
  - expr: "sqrt(x-1)"
:::

Guarda **dove c'è curva e dove non ce n'è**, poi rispondi.

Sopra $x = 0$ c'è un pezzo di curva? [[select: *no|sì]]

Qual è il numero più piccolo che questa funzione accetta? [[1]]

Perché sotto quel numero non c'è niente? [[select: *perché la radice quadrata di un numero negativo non esiste|perché il grafico è stato tagliato lì|perché la curva è troppo bassa per vedersi]]

:::div.reveal
**Il dominio si legge sull'asse orizzontale.**

Immagina di illuminare la curva dall'alto e di guardarne l'**ombra sull'asse $x$**: quell'ombra è il dominio. Dove c'è ombra, la funzione accetta il numero; dove non ce n'è, lo rifiuta.

Qui l'ombra comincia in $1$ e va avanti a destra senza fine: il dominio è **tutti i numeri da 1 in su**.

È la stessa cosa dello step con lo zero della lezione scorsa, solo vista da un'altra parte. Lì lo 0 era un pallino da cui non partiva nessuna freccia; qui è un tratto di asse sopra il quale non c'è curva.
:::

---

> id: limmagine-sul-grafico
> title: L'immagine, sul grafico

# Dove la curva arriva

Adesso $f(x) = x^2$, e stavolta gliela diamo con un dominio limitato: solo i numeri fra $-3$ e $3$. Per questo la curva comincia e finisce di colpo.

:::graph
xrange: "-5,5"
yrange: "-3,11"
aspect: free
xticks: 1
yticks: 1
functions:
  - expr: "x^2"
    xclip: "-3,3"
:::

Qual è il valore più **piccolo** che esce da questa funzione? [[0]]

E il più **grande**? [[9]]

Può uscire $-1$? [[select: *no, mai|sì, per x negativi]]

:::div.reveal
**L'immagine si legge sull'asse verticale.**

Se il dominio è l'ombra della curva sull'asse $x$, l'**immagine** è la sua ombra sull'asse $y$: tutte le altezze che la curva tocca davvero.

- dominio: da $-3$ a $3$ — l'ombra orizzontale
- immagine: da $0$ a $9$ — l'ombra verticale

E il **codominio**? Quello resta una nostra dichiarazione: possiamo dire "questa funzione restituisce numeri" e allora il codominio è tutti i numeri, immagine compresa e molto altro attorno. Il grafico ti mostra l'immagine; il codominio lo scegli tu.

Ecco perché $-1$ non esce mai: sta nel codominio, non nell'immagine. Nessun quadrato è negativo, e infatti sotto l'asse orizzontale la curva non scende mai.
:::

---

> id: la-controimmagine-sul-grafico
> title: La controimmagine, sul grafico

# Tagliare in orizzontale

La controimmagine si chiedeva così: **preso un valore in uscita, da dove può essere arrivato?**

Sul grafico si chiede con una riga orizzontale. Qui ne abbiamo disegnate due, all'altezza $4$ e all'altezza $-1$, sopra la stessa $x^2$ di prima.

:::graph
xrange: "-5,5"
yrange: "-3,11"
aspect: free
xticks: 1
yticks: 1
functions:
  - expr: "x^2"
    xclip: "-3,3"
  - expr: "4"
    color: "#999999"
  - expr: "-1"
    color: "#999999"
:::

In quanti punti la riga all'altezza $4$ tocca la curva? [[2]]

Quali sono le $x$ di quei due punti? [[select: *-2 e 2|2 e 4|-4 e 4]]

E la riga all'altezza $-1$, in quanti punti tocca la curva? [[0]]

:::div.reveal
**Una riga orizzontale, e leggi in basso.**

Per trovare la controimmagine di un valore $k$: tira la riga orizzontale all'altezza $k$, guarda dove taglia la curva, e **scendi sull'asse $x$**. Quelle sono le $x$ che ti servono.

- controimmagine di $4$: la riga taglia in due punti, sotto ci sono $-2$ e $2$
- controimmagine di $-1$: la riga non taglia niente, la controimmagine è vuota

Ritrovi anche il collegamento della lezione scorsa: un valore sta nell'**immagine** esattamente quando la sua riga orizzontale taglia la curva almeno una volta. Il $4$ sta nell'immagine, il $-1$ no.
:::

---

> id: la-prova-della-retta-verticale
> title: La prova della retta verticale

# Ogni disegno è una funzione?

Se le righe **orizzontali** rispondono alla domanda "da dove viene", quelle **verticali** rispondono alla domanda che conta di più: **questo disegno è il grafico di una funzione?**

Qui sotto c'è una circonferenza. Muovi lo slider: la coppia di punti si sposta e ti dice che cosa c'è sopra quella $x$.

Posizione: ${v}{v|1|-2,2,0.1}

:::graph
bind: v
xrange: "-3.5,3.5"
yrange: "-3,3"
functions:
  - expr: "sqrt(4-x^2)"
    xclip: "-2,2"
  - expr: "-sqrt(4-x^2)"
    xclip: "-2,2"
boundpoints:
  - {x: v, y: "sqrt(4-v^2)", label: "sopra"}
  - {x: v, y: "-sqrt(4-v^2)", label: "sotto"}
:::

Per quasi ogni $x$ fra $-2$ e $2$, quanti punti della circonferenza ci stanno sopra? [[2]]

Allora questo disegno è il grafico di una funzione? [[select: *no|sì]]

Che cosa sarebbe questa curva vista come macchina? [[select: *una macchina che a un ingresso dà due risposte|una macchina che rifiuta certi ingressi|una macchina che non restituisce niente]]

:::details.hint
<summary>💡 Suggerimento</summary>

Ripensa alla seconda macchina della lezione scorsa, quella da cui partivano due frecce dallo stesso pallino. Che cosa avevi detto?

:::

:::div.reveal
**È la regola delle frecce, vista di lato.**

Un disegno è il grafico di una funzione se **ogni retta verticale lo incontra al massimo in un punto**. Si chiama *prova della retta verticale*, e non è una regola nuova: è esattamente quella con cui hai cominciato.

| Con le frecce | Sul grafico |
| ------------- | ----------- |
| da ogni elemento del dominio parte **una sola** freccia | sopra ogni $x$ del dominio c'è **un solo** punto |
| da un elemento non parte niente | sopra quella $x$ non c'è curva: non sta nel dominio |
| da un elemento partono due frecce | sopra quella $x$ ci sono due punti: **non è una funzione** |

Guarda quanta strada. Hai cominciato contando cerchietti in una figura che cresceva, sei arrivato a una formula, poi a un diagramma di frecce, e adesso a una curva che porta scritte addosso tutte e quattro le parole: dominio nell'ombra orizzontale, immagine nell'ombra verticale, la controimmagine nei tagli orizzontali e la definizione stessa di funzione nei tagli verticali.

**Da qui in poi:** con questi strumenti si possono studiare funzioni molto meno docili di $5x - 2$. Il corso *La funzione esponenziale* comincia proprio da lì.
:::
