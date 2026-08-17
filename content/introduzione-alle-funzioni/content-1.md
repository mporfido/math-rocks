> id: frecce-fra-due-insiemi
> title: Frecce fra due insiemi
> description: Che cosa rende affidabile una macchina, che cosa accetta di ricevere e che cosa riesce a restituire.

---

> id: dalle-tabelle-alle-frecce
> title: La stessa macchina, disegnata

# Una macchina, due modi di guardarla

Nella lezione sui pattern hai costruito questa macchina:

$$f(n) = 5n - 2$$

Le dai il numero del passo, ti restituisce il numero dei quadratini. Fin qui l'hai vista come una **tabella**: una riga per ogni passo.

C'è un altro modo di disegnarla, e serve a vedere una cosa che la tabella nasconde: da una parte tutti i numeri che puoi darle, dall'altra tutti quelli che potrebbe restituirti. In mezzo, una **freccia** per ogni coppia.

## Disegnala tu

Trascina da un numero di sinistra a un numero di destra per tracciare una freccia. Se sbagli, toccala e sparisce.

:::p5 goal sketch=funzione-frecce partenza=1,2,3,4 arrivo=3,8,13,18,20 nomea=passo nomeb=quadratini obiettivo=1>3,2>8,3>13,4>18 height=300
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Calcola $5 \times 1 - 2$, poi $5 \times 2 - 2$, e così via. Il numero 20 non serve a niente: è lì apposta.

:::

:::div.reveal
**Le stesse informazioni, un disegno diverso.**

I due gruppi di numeri hanno un nome: quello di sinistra è l'**insieme di partenza**, quello di destra l'**insieme di arrivo**.

E hai già visto una cosa che la tabella non diceva: nell'insieme di arrivo c'era **20**, e su di lui non è arrivata nessuna freccia. Stava lì fra i possibili, ma la macchina non lo produce mai.

Tienilo da parte: fra tre step avrà un nome anche quello.
:::

---

> id: quando-non-e-una-funzione
> title: Di quali macchine ti fidi

# Tre diagrammi, uno solo è affidabile

Qui sotto ci sono tre macchine disegnate con le frecce. Guardale una per volta e decidi: **se ti do un numero di sinistra, la macchina sa dirmi una risposta sola?**

## Prima macchina

:::p5 sketch=funzione-frecce partenza=1,2,3 arrivo=4,5,6 frecce=1>4,2>4,3>6 modifica=no verdetto=no height=200
:::

Ti fidi di questa? [[select: *sì|no]]

## Seconda macchina

:::p5 sketch=funzione-frecce partenza=1,2,3 arrivo=4,5,6 frecce=1>4,2>5,2>6,3>4 modifica=no verdetto=no height=200
:::

E di questa? [[select: sì|*no]]

## Terza macchina

:::p5 sketch=funzione-frecce partenza=1,2,3 arrivo=4,5,6 frecce=1>4,3>6 modifica=no verdetto=no height=200
:::

E di questa? [[select: sì|*no]]

## Adesso disegnane una tu

Una qualsiasi, purché ci si possa fare affidamento. Non c'è una risposta sola.

:::p5 goal sketch=funzione-frecce partenza=1,2,3 arrivo=4,5,6 obiettivo=funzione height=240
:::

:::div.reveal
**Guarda dove sta la differenza.**

Nella prima macchina su **4** arrivano due frecce: partendo da 1 e partendo da 2 finisci nello stesso posto. Non è un problema — la macchina risponde lo stesso, e risponde una cosa sola.

Nella seconda da **2** partono due frecce: le chiedi 2 e non sai se ti dirà 5 o 6. Inservibile.

Nella terza da **2** non parte niente: le chiedi 2 e non ti risponde.

Una macchina così si chiama **funzione**, ed è la regola che avevi già trovato con i pattern, scritta con le frecce:

> Da **ogni** elemento dell'insieme di partenza deve partire **una e una sola** freccia.

Nota bene l'asimmetria: la regola parla solo delle frecce che **partono**. Quante ne **arrivano** su un elemento di destra — due, una, nessuna — non c'entra niente.
:::

---

> id: il-dominio
> title: Che cosa può ricevere

# Non tutto si può dare in pasto

Torniamo a $f(n) = 5n - 2$. Che cosa succede se le chiedi il **passo 0,5**?

Niente: non esiste mezzo passo. La figura ha un passo 1, un passo 2, un passo 3 — non un passo e mezzo. Quella macchina accetta solo i numeri naturali a partire da 1.

Non è un difetto: **ogni macchina ha i suoi ingressi ammessi**, e sapere quali sono fa parte del sapere che cos'è la macchina.

## Una macchina che rifiuta un numero

Questa fa "**10 diviso il numero che le dai**". Guarda che cosa succede sull'insieme di partenza che le abbiamo messo davanti.

:::p5 sketch=funzione-frecce partenza=0,1,2,5,10 arrivo=1,2,5,10 frecce=1>10,2>5,5>2,10>1 nomea=x nomeb=risultato modifica=no height=270
:::

Perché da **0** non parte nessuna freccia? [[select: *perché 10 diviso 0 non è un numero|perché 0 è troppo piccolo|perché 10 non è divisibile per 0 esattamente]]

## Sistemiamola

Il modo di aggiustare le cose **non** è inventare una freccia per lo 0: è togliere lo 0 dall'insieme di partenza. Ecco l'insieme giusto — ridisegna le frecce.

:::p5 goal sketch=funzione-frecce partenza=1,2,5,10 arrivo=1,2,5,10 nomea=x nomeb=risultato obiettivo=1>10,2>5,5>2,10>1 height=270
:::

:::div.reveal
**L'insieme di partenza giusto ha un nome: si chiama dominio.**

Il **dominio** di una funzione è l'insieme di tutti i valori che la macchina accetta davvero — quelli per cui sa rispondere, e rispondere una cosa sola.

- il dominio di $f(n) = 5n - 2$, come macchina dei passi, sono i numeri naturali $1, 2, 3, \dots$
- il dominio di "10 diviso $x$" è tutto tranne lo zero

Dire "questa funzione ha dominio…" non è un dettaglio burocratico: senza, la regola dello step precedente non si può nemmeno controllare. Da **ogni** elemento del dominio parte una freccia — ma prima devi sapere quali sono.
:::

---

> id: codominio-e-immagine
> title: Quello che esce davvero

# Il posto dove potrebbe finire, e dove finisce

Questa macchina fa il **quadrato**: le dai un numero, ti restituisce quel numero moltiplicato per sé stesso.

A destra abbiamo messo un insieme di arrivo abbastanza largo da contenere tutte le risposte. Disegna le frecce: mano a mano che le tracci, i numeri di destra che vengono raggiunti si colorano.

:::p5 goal sketch=funzione-frecce partenza=-3,-2,-1,0,1,2,3 arrivo=0,1,4,9,16,25 nomea=partenza nomeb=arrivo evidenzia=immagine obiettivo=-3>9,-2>4,-1>1,0>0,1>1,2>4,3>9 height=380
:::

## Guarda chi è rimasto spento

Quanti numeri dell'insieme di arrivo **non** vengono raggiunti da nessuna freccia? [[2]]

Quali sono? [[select: *16 e 25|9 e 16|0 e 25]]

Perché il 25 non esce mai, se $5 \times 5 = 25$? [[select: *perché 5 non sta nell'insieme di partenza|perché 25 è troppo grande|perché il quadrato di 5 non è 25]]

:::div.reveal
**Due insiemi diversi, due nomi diversi.**

- il **codominio** è l'insieme di arrivo che hai dichiarato: il recipiente, quello che hai deciso di mettere a destra. Qui sono sei numeri: $0, 1, 4, 9, 16, 25$.
- l'**immagine** è quello che la macchina produce davvero: solo i numeri su cui arriva almeno una freccia. Qui sono quattro: $0, 1, 4, 9$.

L'immagine sta sempre **dentro** il codominio, e può essere più piccola. Il 25 sta nel codominio perché lo abbiamo scritto noi, ma non nell'immagine: con questo dominio non c'è nessun numero che elevato al quadrato faccia 25.

Ti ricordi il **20** del primo step, quello su cui non arrivava niente? Ecco: stava nel codominio e non nell'immagine.
:::

---

> id: la-controimmagine
> title: Al contrario

# Da dove viene una risposta

Finora hai sempre guardato le frecce nel verso in cui vanno: dò un numero, ottengo una risposta. Adesso girati e guardale al contrario: **presa una risposta, da dove può essere arrivata?**

Tocca un numero dell'insieme di arrivo: si accendono solo le frecce che finiscono lì.

:::p5 sketch=funzione-frecce partenza=-3,-2,-1,0,1,2,3 arrivo=0,1,4,9,16,25 frecce=-3>9,-2>4,-1>1,0>0,1>1,2>4,3>9 nomea=partenza nomeb=arrivo evidenzia=controimmagine modifica=no verdetto=no height=340
:::

Quanti numeri di partenza finiscono su **9**? [[2]]

Quanti finiscono su **0**? [[1]]

Quanti finiscono su **16**? [[0]]

:::div.highlight
💡 Attenzione a non confondere le due regole. Da **9** tornano indietro due frecce, e va benissimo: la funzione resta una funzione. Se invece fossero **partite** due frecce da $-3$, la macchina sarebbe rotta.

Indietro: quante vuoi. In avanti: una e una sola.
:::

:::div.reveal
**Questo insieme si chiama controimmagine.**

La **controimmagine** di un elemento dell'insieme di arrivo è l'insieme di **tutti** i valori di partenza che finiscono lì.

- la controimmagine di $9$ è $\{-3,\ 3\}$: due elementi
- la controimmagine di $0$ è $\{0\}$: un elemento solo
- la controimmagine di $16$ è vuota: nessun elemento

Zero, uno o molti: tutti e tre i casi sono legittimi. E c'è un collegamento con lo step precedente che vale la pena di notare — un elemento sta nell'**immagine** esattamente quando la sua controimmagine **non** è vuota.
:::

---

> id: non-servono-i-numeri
> title: Non servono i numeri

# Una macchina che non calcola niente

Una funzione non è per forza un conto. Questa prende una **parola** e restituisce **quante lettere ha**.

Disegna le frecce.

:::p5 goal sketch=funzione-frecce partenza=sole,mare,albero,tre arrivo=3,4,6,7 nomea=parole nomeb=lettere obiettivo=sole>4,mare>4,albero>6,tre>3 height=270
:::

È una funzione? [[select: *sì: ogni parola ha un numero di lettere solo|no: su 4 arrivano due frecce|no: il 7 non viene raggiunto]]

:::div.reveal
**Funziona esattamente come prima.**

Le parole non sono numeri, ma tutte le domande che ti sei fatto hanno ancora senso, e la risposta si legge nel diagramma come prima:

- il **dominio** è $\{$sole, mare, albero, tre$\}$
- il **codominio** è $\{3, 4, 6, 7\}$, l'**immagine** è $\{3, 4, 6\}$
- la **controimmagine** di $4$ è $\{$sole, mare$\}$

Da qui in avanti, però, torniamo ai numeri: guarderemo solo le **funzioni numeriche**, quelle in cui sia il dominio sia il codominio sono fatti di numeri.

Non è per comodità. È perché una coppia di numeri si può disegnare come un **punto**, e allora tutte queste frecce diventano un'unica figura da guardare in un colpo solo.

**Nella prossima lezione:** la stessa funzione, disegnata sul piano cartesiano.
:::

---

> id: ricapitolazione
> title: Le quattro parole

# Tutto su un diagramma solo

Questa macchina prende un numero e restituisce la sua **distanza da zero**: a $-2$ e a $2$ risponde lo stesso, perché sono tutti e due a due passi dallo zero.

:::p5 sketch=funzione-frecce partenza=-2,-1,0,1,2 arrivo=0,1,2,3,4 frecce=-2>2,-1>1,0>0,1>1,2>2 nomea=partenza nomeb=arrivo modifica=no verdetto=no height=270
:::

Quanti elementi ha il **dominio**? [[5]]

Quanti ne ha il **codominio**? [[5]]

Quanti ne ha l'**immagine**? [[3]]

Quanti elementi ha la **controimmagine di 1**? [[2]]

:::details.hint
<summary>💡 Suggerimento</summary>

Per l'immagine conta solo i numeri di destra su cui **arriva** almeno una freccia. Per la controimmagine di 1, conta le frecce che ci finiscono dentro e guarda da dove partono.

:::

:::div.reveal
**Quattro parole, e sono tutte diverse.**

| Parola | Che cos'è | Qui |
| ------ | --------- | --- |
| dominio | i valori che la macchina accetta | $\{-2,-1,0,1,2\}$ |
| codominio | l'insieme di arrivo dichiarato | $\{0,1,2,3,4\}$ |
| immagine | i valori che escono davvero | $\{0,1,2\}$ |
| controimmagine di $1$ | i valori che finiscono su $1$ | $\{-1,1\}$ |

Le prime due le decidi tu quando descrivi la macchina. Le altre due te le dice la macchina, e per conoscerle devi guardare le frecce.

E la regola che tiene in piedi tutto è sempre quella: **da ogni elemento del dominio parte una freccia, e una sola**.
:::
