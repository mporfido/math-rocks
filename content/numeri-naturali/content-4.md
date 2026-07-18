> id: mcd-mcm
> title: MCD e mcm
> description: Massimo Comun Divisore e minimo comune multiplo.

---

> id: massimo-comun-divisore
> title: Il massimo comun divisore

# Il massimo comun divisore

Nella lezione precedente abbiamo imparato a trovare i **divisori** di un numero. Se prendiamo **due** numeri, alcuni divisori possono essere **in comune**: sono i **divisori comuni**.

Il più grande dei divisori comuni si chiama **massimo comun divisore**, in breve **M.C.D.**

Proviamo con $12$ e $18$: prima segniamo i divisori di ciascuno, poi confrontiamo le due griglie.

:::div.highlight
👆 Seleziona tutti i **divisori di $12$** (da $1$ a $12$).
:::

:::p5 goal sketch=griglia-numeri n=12 target=1,2,3,4,6,12
:::

:::div.highlight
👆 Ora seleziona tutti i **divisori di $18$** (da $1$ a $18$).
:::

:::p5 goal sketch=griglia-numeri n=18 target=1,2,3,6,9,18
:::

Confronta le due griglie: quali numeri dividono **sia** $12$ **sia** $18$? 
:::p5 goal sketch=griglia-numeri n=18 target=1,2,3,6
:::

Qual è il **più grande**? Il **massimo comun divisore** di $12$ e $18$ è: [[6]]

:::div.reveal
**Esatto!** I divisori comuni di $12$ e $18$ sono $1, 2, 3, 6$, e il più grande è $6$: questo è il **M.C.D.** di $12$ e $18$.
:::

---

> id: minimo-comune-multiplo
> title: Il minimo comune multiplo

# Il minimo comune multiplo

Ogni numero ha infiniti multipli. Se prendiamo **due** numeri, alcuni dei loro multipli possono **coincidere**: sono i **multipli comuni**.

Il più piccolo dei multipli comuni (diverso da $0$) si chiama **minimo comune multiplo**, in breve **m.c.m.**

Proviamo con $4$ e $6$: prima segniamo i multipli di ciascuno, poi confrontiamo le due griglie.

:::div.highlight
👆 Seleziona tutti i **multipli di $4$** tra quelli qui sotto:
:::

:::p5 goal sketch=griglia-numeri n=40 target=4,8,12,16,20,24,28,32,36,40
:::

:::div.highlight
👆 Ora seleziona tutti i **multipli di $6$**:
:::

:::p5 goal sketch=griglia-numeri n=40 target=6,12,18,24,30,36
:::

Confronta le due griglie: quali numeri sono multipli **sia** di $4$ **sia** di $6$? (Ricorda che sono infiniti, qui vediamo solo i primi:

:::p5 goal sketch=griglia-numeri n=40 target=12,24,36
:::

Qual è il **primo** (il più piccolo) che compare in entrambe? Il **minimo comune multiplo** di $4$ e $6$ è: [[12]]

:::div.reveal
**Perfetto!** I multipli comuni di $4$ e $6$ sono $12, 24, 36, \dots$ e il più piccolo è $12$: questo è il **m.c.m.** di $4$ e $6$.

Attenzione a non confondere le due sigle: il **M.C.D.** si cerca fra i **divisori** (numeri più piccoli o uguali), il **m.c.m.** fra i **multipli** (numeri più grandi o uguali).
:::

---

> id: calcolo-mcd-tabella
> title: Come calcolare il MCD

# Calcolare il MCD con la scomposizione

Confrontare divisori e multipli uno per uno funziona con numeri piccoli, ma diventa lungo con numeri più grandi. C'è un metodo molto più veloce, che parte dalle **scomposizioni in fattori primi** dei due numeri.

Prendiamo $84$ e $90$. Il primo passo è proprio **scomporli entrambi** in fattori primi, come hai imparato nella lezione precedente.

:::p5 goal sketch=scomposizione-fattori n=84,90 height=360
:::

## Riporta le scomposizioni nella tabella

Ora sistemiamo le due scomposizioni in una **tabella**: così i fattori uguali finiscono **incolonnati** e confrontarli diventa facilissimo.

Ogni **colonna** è un fattore primo (il $2$, il $3$, il $5$, il $7$…). In ogni **riga** scrivi, per ciascun primo, **quante volte** compare in quel numero: è l'**esponente** della potenza.

Dalla scomposizione $84 = 2^2 \cdot 3 \cdot 7$, per esempio, nella riga di $84$ scrivi $2$ nella colonna del $2$, $1$ nella colonna del $3$ e $1$ nella colonna del $7$.

:::div.highlight
Se un primo **non compare** in un numero, il suo esponente è $0$: puoi scrivere $0$ oppure lasciare la casella vuota. Attenzione: un fattore scritto **senza esponente**, come il $3$ in $2^2 \cdot 3 \cdot 7$, ha esponente $1$.
:::

Compila prima le righe di $84$ e di $90$; solo dopo si sblocca la parte in basso per il calcolo.

## La regola del MCD

Con le scomposizioni incolonnate, il **massimo comun divisore** si legge quasi a colpo d'occhio.

:::div.highlight
Per il **MCD** prendi **solo i fattori comuni** — quelli che compaiono in **entrambi** i numeri — ciascuno con l'**esponente più piccolo** fra i due.
Un fattore che manca in uno dei due numeri (esponente $0$) **non entra** nel MCD.
:::

Nella riga **MCD** procedi colonna per colonna: confronta i due esponenti scritti sopra e riporta il **più piccolo**. Dove uno dei due è $0$, il minimo è $0$ e quel fattore sparisce dal prodotto. Alla fine moltiplica le potenze rimaste: quello è il MCD.

:::p5 goal sketch=mcd-mcm-tabella a=84 b=90 modo=mcd
:::

:::div.reveal
**Bravo!** I fattori comuni a $84$ e $90$ sono il $2$ e il $3$, presi con l'esponente più piccolo: $MCD = 2 \cdot 3 = 6$. Lo stesso metodo vale per il **m.c.m.**, ma prendendo **tutti** i fattori con l'esponente **più grande**.
:::

---

> id: calcolo-mcm-tabella
> title: Calcolare il mcm

# Calcolare il mcm con la scomposizione

Restiamo con gli stessi numeri, $84$ e $90$: le hai già scomposti, quindi non serve rifarlo. Teniamole a portata di mano:

:::div.highlight
$$84 = 2^2 \cdot 3 \cdot 7 \qquad 90 = 2 \cdot 3^2 \cdot 5$$
:::

Per il **minimo comune multiplo** la tabella è la stessa, cambia solo la regola con cui riempi l'ultima riga.

:::div.highlight
Per il **mcm** prendi **tutti i fattori** che compaiono — comuni e non — ciascuno con l'**esponente più grande** fra i due.
Nessun fattore viene escluso: se un primo manca in un numero, si usa comunque quello dell'altro.
:::

Nella riga **mcm** procedi colonna per colonna e riporta l'esponente **più grande** dei due scritti sopra. Poi moltiplica tutte le potenze: quello è il mcm.

:::p5 goal sketch=mcd-mcm-tabella a=84 b=90 modo=mcm
:::

:::div.reveal
**Perfetto!** Prendendo ogni fattore con l'esponente più grande: $mcm = 2^2 \cdot 3^2 \cdot 5 \cdot 7 = 1260$.

Nota il legame: $MCD \cdot mcm = 6 \cdot 1260 = 7560 = 84 \cdot 90$. Il prodotto del MCD e del mcm è sempre uguale al prodotto dei due numeri di partenza!
:::

---

> id: esercizi-mcd-mcm
> title: Mettiti alla prova

# Mettiti alla prova

Ora tocca a te, dall'inizio: **scomponi** i due numeri (a mente o su un foglio), riporta gli esponenti nella tabella e calcola **sia il MCD sia il mcm**. La tabella ti mostrerà i risultati quando avrai completato tutto.

## Esercizio 1 — $24$ e $36$

:::p5 goal sketch=mcd-mcm-tabella a=24 b=36 modo=entrambi
:::

## Esercizio 2 — $10$ e $21$

Attenzione a questo: cosa succede quando due numeri **non hanno fattori in comune**?

:::p5 goal sketch=mcd-mcm-tabella a=10 b=21 modo=entrambi
:::

:::div.reveal
**Ottimo lavoro!** Nel secondo esercizio $10 = 2 \cdot 5$ e $21 = 3 \cdot 7$ non hanno **nessun** fattore in comune: il loro $MCD$ è $1$ (si dicono **primi tra loro**) e il $mcm$ è il loro prodotto, $10 \cdot 21 = 210$.
:::