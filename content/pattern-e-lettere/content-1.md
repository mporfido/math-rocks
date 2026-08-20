> id: dal-pattern-alla-formula
> title: Dal pattern alla formula
> description: Una figura che cresce di passo in passo, e la lettera che permette di descriverla tutta insieme.

---

> id: il-passo-successivo
> title: Una figura che cresce

# Qualcosa cresce, un passo alla volta

**Pattern** è una parola inglese che indica uno schema che si ripete, come succede nella figura qui sotto: da un passo al successivo aumenta il numero di cerchietti. La regola per disegnare il passo successivo è sempre la stessa: cerca di capire qual è.

:::p5 sketch=pattern-colonne passi=1,2,3,4 altezza=3 fisso=1 height=200
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Prova a riconoscere la forma generale e come cambia di passo in passo. Oppure prova a **contare** quanti cerchietti ci sono ad ogni passo.
:::

## Prima cosa: contare

Ad ogni passo il numero di cerchietti aumenta di [[3]].

Quanti ce ne sono al **passo 4**? [[13]]

E al **passo 5**, che non è disegnato? [[16]]

## Seconda cosa: disegnarlo

Adesso costruiscilo davvero. Tocca le caselle della griglia per mettere i cerchietti al posto giusto: deve venire il **passo 5** della stessa figura.

*(Conta la disposizione, non il punto della griglia in cui la disegni.)*

:::p5 goal sketch=pattern-costruisci passo=5 altezza=3 fisso=1 height=240
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Guarda il passo 4 e chiediti: che cosa devo **aggiungere** per ottenere il passo 5? E quel cerchietto solo in fondo a destra, cambia mai?

:::

:::div.reveal
**Bene!** Hai già scoperto due cose che ci serviranno per tutta la lezione:

- da un passo al successivo si aggiunge sempre **una colonna da 3**;
- il cerchietto solo in fondo a destra **non cambia mai**: è fisso in ogni passo.

Adesso proviamo a mettere il numero dei cerchietti in una tabella.
:::

---

> id: una-tabella-per-vedere
> title: Dalla figura alla tabella

# Mettiamo in fila quello che sappiamo

Una tabella ci aiuta a vedere **che cosa succede fra un passo e il successivo**. Le frecce a lato dicono proprio quello.

Completa i due gradini che mancano.

:::table
| Passo | Cerchietti | v + 3 |
| ----- | ---------- | ------- |
| 1     | 4          |
| 2     | 7          |
| 3     | 10         |
| 4     | 13         |
| 5     | [[16]]     |
| 6     | [[19]]     |
:::

## Una domanda meno ovvia

Per andare dal **passo 1** al **passo 6**, quante volte hai aggiunto 3? [[5]]

:::details.hint
<summary>💡 Suggerimento</summary>

Non contare i passi: conta le **frecce**. Da 1 a 6 i passi sono sei, ma i salti sono un altro numero.

:::

:::div.reveal
**Attenzione a questa differenza.** I passi da 1 a 6 sono sei, ma i salti fra un passo e l'altro sono **cinque**: il passo 1 è il punto di partenza, non un salto.

Vuol dire che per arrivare al passo 6 fai $4 + 3 + 3 + 3 + 3 + 3$, cioè $4 + 5 \times 3 = 19$.

:::

---

> id: senza-disegnare
> title: Quando la tabella non basta più

# E se il passo è lontano?

La tabella funziona, ma è lenta: per ogni passo devi passare da tutti quelli prima.

Prova lo stesso a rispondere.

Quanti cerchietti al **passo 10**? [[31]]

Quanti al **passo 20**? [[61]]

## Ora il passo 67

Se volessi arrivare al **passo 67** partendo dal passo 1 e aggiungendo 3 ogni volta, quante volte dovresti aggiungere 3? [[66]]

:::div.reveal
**Sessantasei addizioni.** Si può fare, ma è un procedimento lungo e noioso.

Non è il modo più comodo di lavorare: la figura ci offre una scorciatoia. Finché leggiamo la figura come "quella di prima più 3", per sapere quanti sono al passo 67 dobbiamo passare per tutti i 66 passi precedenti.

Serve un modo di guardare che salti direttamente al passo che ci interessa. Torniamo alla figura.
:::

---

> id: guardare-la-figura
> title: Torniamo alla figura

# La figura è già fatta di pezzi

Ecco tre passi diversi della stessa figura. Il pezzo che **non cresce mai** (un cerchietto) è colorato di rosso. La parte che cresce invece aggiunge una colonna di tre cerchietti ad ogni passo.

:::p5 sketch=pattern-colonne passi=2,4,6 altezza=3 fisso=1 evidenzia=si conteggio=si height=240
:::

Guarda il **passo 6** e rispondi senza contare i cerchietti uno a uno.

Quante colonne da 3 ci sono? [[6]]

Quanti cerchietti in più, oltre alle colonne (quelli rossi)? [[1]]

Quindi al passo 6: $6 \times 3 + 1 = 19$. Lo stesso numero della tabella, ma trovato **in un colpo solo**.

## Adesso il passo 67

Al passo 67 le colonne da 3 sono 67, e il pezzo rosso è sempre uno solo.

Quanti cerchietti in tutto? [[202]]

:::div.reveal
**Ecco la scorciatoia.** Non è una regola nuova: è la stessa figura, guardata come è fatta invece che come cresce.

$$\text{cerchietti} = \text{numero del passo} \times 3 + 1$$

Funziona per il passo 6, per il passo 67 e per il passo 1000, e non ha bisogno di nessuno dei passi precedenti.

C'è chi la scrive in un altro modo: $4 + 3 \times (\text{passo} - 1)$, cioè "parto da 4 e aggiungo 3 tante volte quanti sono i salti". È un altro modo di guardare la stessa figura, e dà sempre lo stesso risultato.
:::

---

> id: la-lettera-n
> title: Una lettera al posto del numero

# Scriverlo una volta sola

"Numero del passo per 3, più 1" è una frase giusta ma lunga. E soprattutto: **è sempre la stessa frase**, cambia solo il numero del passo.

Allora chiamiamo quel numero con una lettera. Di solito si usa $n$, che sta per "numero del passo".

Muovi lo slider e guarda la figura cambiare.

Passo: ${n}{n|4|1,12,1}

:::p5 sketch=pattern-colonne variabile=n altezza=3 fisso=1 evidenzia=si conteggio=si bind=n height=200
:::

$$3 \times ${n} + 1 = ${= 3*n+1}$$

## La scrittura corta

:::table
| Passo | Colonne da 3 | Cerchietto singolo | Formula        |
| ----- | ------------ | ------------------ | -------------- |
| 1     | 1            | 1                  | $3\cdot 1 + 1$ |
| 2     | 2            | 1                  | $3\cdot 2 + 1$ |
| 6     | 7            | 1                  | $3\cdot 6 + 1$ |
| 67    | 67           | 1                  | $3\cdot 67+ 1$ |
| ...   | ...          | ...                | ...            |
| $n$   | $n$          | 1                  | ?              |
:::

Quale formula descrive questa figura? [[select: 3n+1|n+3|3(n+1)|4n]]

Quando un numero moltiplica una lettera, di solito non scriviamo il segno di molpitplicazione: $3 \cdot n$ diventa semplicemente $3n$. Continua a significare "n gruppi da tre".


## Prova a usarla

Porta lo slider sul passo in cui i cerchietti sono esattamente **25**.

[Verifica]{check: n == 8}

:::div.reveal
**Questa è la prima formula che hai scritto.**

$$3n + 1$$

$3n$ conta i cerchietti nelle colonne da 3, $+1$ conta il cerchietto singolo. Qui $n$ non è un numero misterioso da trovare: indica il numero del passo scelto — lo puoi sostituire con il numero del passo che ti interessa.

- passo $n=8$ → $3 \cdot 8 + 1 = 25$
- passo $n=67$ → $3 \cdot 67 + 1 = 202$
- passo $n=1000$ → $3 \cdot 1000 + 1 = 3001$

Una sola formula permette di trovare il numero di cerchietti per qualsiasi $n=1,2,3\ldots$
:::

---

> id: un-altro-pattern
> title: Se alla figura manca qualcosa

# Cambiamo figura

In queste figure fatte di quadratini il **pattern** di crescita è diverso. Guardala bene e nota le differenze col pattern di prima.

:::p5 sketch=pattern-colonne passi=1,2,3,4 altezza=5 fisso=-2 forma=quadrato height=230
:::

Completa la tabella seguendo le frecce.

:::table
| Passo | Quadratini | v + 5 |
| ----- | ---------- | ----- |
| 1     | 3          |
| 2     | 8          |
| 3     | 13         |
| 4     | 18         |
| 5     | [[23]]     |
| 6     | [[28]]     |
:::

## Costruisci il passo 5

Come prima: disegnalo sulla griglia, con le colonne dell'altezza giusta e il pezzo che manca al posto giusto.

:::p5 goal sketch=pattern-costruisci passo=5 altezza=5 fisso=-2 forma=quadrato height=290
:::

:::div.reveal
**Il salto è costante anche qui**, solo che vale 5 invece di 3: ogni passo aggiunge una colonna, e la colonna è alta 5.

Ma allora perché al passo 1 i cerchietti sono 3 e non 5? Guarda l'ultima colonna a destra: è sempre **incompleta**. È lei la chiave della formula.
:::

---

> id: cinque-per-n-meno-due
> title: Quello che c'è, meno quello che manca

# Quello che manca conta quanto quello che c'è

Ecco il passo 3 e il passo 5, con i quadratini **mancanti** disegnati tratteggiati.

:::p5 sketch=pattern-colonne passi=1,3,5 altezza=5 fisso=-2 forma=quadrato fantasmi=si evidenzia=si conteggio=si height=250
:::

Se le colonne fossero tutte piene, al passo 5 sarebbero $5 \times 5 = 25$ quadratini.

Quanti ne mancano, in tutto? [[2]]

E al passo 3? Ne mancano sempre [[2]].

## La formula

:::table
| Passo | Colonne da 5 | Quadratini tolti   | Formula        |
| ----- | ------------ | ------------------ | -------------- |
| 1     | 1            | -2                 | $5\cdot 1 - 2$ |
| 3     | 2            | -2                 | $5\cdot 3 - 2$ |
| 5     | 7            | -2                 | $5\cdot 7 - 2$ |
| ...   | ...          | ...                | ...            |
| $n$   | $n$          | -2                 | ?              |
:::


Al passo $n$ ci sono $n$ colonne da 5, meno i due che mancano sempre. Come si scrive?

[[select: 5n-2|5n+2|5(n-2)|2n-5]]

Adesso il passo 67: quanti quadratini? [[333]]

:::div.highlight
💡 C'è chi guarda la stessa figura in un altro modo: **le prime $n-1$ colonne sono piene** (5 ciascuna) e **l'ultima ne ha 3**. Viene $5(n-1) + 3$.

Provala sul passo 5: $5 \times 4 + 3 = 23$. Ed è esattamente quello che dà anche $5n - 2$. 

E al passo $n=1$ che succede? ci sono $n-1$ cioé nessuna colonna completa e poi $+3$ dell'ultima.

Due scritture diverse, la stessa figura, gli stessi risultati: le formule sono entrambe corrette, puoi scegliere di vederla nella maniera che preferisci.
:::

:::div.reveal
$5n - 2$ dice: "prendi $n$ colonne piene da 5, poi togli 2 per avere l'ultima colonnina incompleta da 3".

$$5n - 2$$

- passo 1 → $5 - 2 = 3$ ✓
- passo 4 → $20 - 2 = 18$ ✓
- passo 67 → $335 - 2 = 333$ ✓

Verificare sui passi che già conosci ti aiuta a capire se la formula che hai scritto è quella giusta.
:::

---

> id: la-macchina
> title: Una funzione è una macchina

# Un nome per quello che hai costruito

Guarda che cosa fa $5n - 2$: alla formula diamo un numero di passo e la formula restituisce il numero di quadratini. Il risultato è sempre lo stesso, se gli dai lo stesso numero di passo.

È come una **macchina**: entra il passo, esce la quantità di quadratini.

:::table
| Entra: il passo $n$ | Esce: i quadratini |
| ------------------- | ------------------ |
| 1                   | 3                  |
| 4                   | 18                 |
| 10                  | [[48]]             |
| 20                  | [[98]]             |
:::

## La domanda che dà il nome

Se ti dico il numero del passo, quante risposte diverse puoi darmi sul numero di quadratini? [[select: una sola|due|dipende dal passo]]

:::div.reveal
# Questa macchina si chiama **funzione**

A ogni ingresso corrisponde **una e una sola** uscita: è proprio questo che rende la macchina utile. Se al passo 67 potesse rispondere sia 333 sia 340, non sapremmo quale usare.

Alla macchina si dà un nome (di solito $f$ di *funzione*) e si scrive così:

$$f(n) = 5n - 2$$

Si legge "**f di n**", e vuol dire: *ecco che cosa esce, quando entra $n$*.

$$f(1) = 3 \qquad f(10) = 48 \qquad f(67) = 333$$

Hai cominciato contando cerchietti uno a uno, e sei arrivato a una scrittura che risponde per **qualsiasi** passo, anche senza bisogno di disegnarli.
:::
