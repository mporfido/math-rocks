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

> id: calcolo-mcd-mcm-tabella
> title: Come calcolare MCD e mcm

# Come calcolare MCD e mcm?

:::p5 goal sketch=mcd-mcm-tabella a=84 b=90 modo=entrambi
:::