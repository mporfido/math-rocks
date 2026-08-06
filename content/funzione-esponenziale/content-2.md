> id: funzione-esponenziale
> title: La funzione esponenziale
> description: Rappresentiamo nel piano cartesiano.

---

> id: grafico-per-punti
> title: Il grafico, un punto alla volta

# Da scala a curva

Ricapitoliamo che cosa abbiamo fatto nella lezione precedente: siamo partiti da quattro gradini **interi**, li abbiamo prolungati sotto lo zero (**esponenti negativi**), poi ne abbiamo infilati altri a metà, a un quarto, su ogni razionale (**esponenti frazionari**), e infine anche sugli irrazionali.

Su un piano cartesiano, mettiamo l'esponente sulle $x$ e il valore della potenza sulle $y$, i gradini diventano **punti**. E i punti, ormai fitti su ogni numero reale, sono diventati una **curva senza buchi** (abbiamo definito la potenza per ogni possibile esponente reale).

## La scala, di nuovo — ma stavolta disegna

Ecco la stessa tabella della lezione scorsa, con la stessa freccia a lato: scendendo di
un gradino si divide per 2. Completala.

*(Scrivi i valori in decimale, con il **punto**: per esempio 0.5, non 0,5.)*

:::table
| Esponente | Potenza  | Valore             | v : 2 |
| --------- | -------- | ------------------ | ----- |
| $3$       | $2^3$    | ${y3}{y3||input}   |
| $2$       | $2^2$    | ${y2}{y2||input}   |
| $1$       | $2^1$    | ${y1}{y1||input}   |
| $0$       | $2^0$    | ${y0}{y0||input}   |
| $-1$      | $2^{-1}$ | ${ym1}{ym1||input} |
:::

Ogni valore che scrivi diventa **subito un punto** nel grafico qui sotto: l'esponente
sulle $x$, il valore della potenza sulle $y$. Il grafico disegna quello che scrivi —
anche se è sbagliato.

## E i gradini in mezzo?

Questi tre esponenti non stanno sulla catena del $\div 2$: stanno **fra** un gradino e
l'altro. Sono quelli che nella lezione scorsa abbiamo dovuto inventare.

Prima di' che cosa vuol dire ciascuno, poi scrivine il valore con due cifre decimali.

:::table
| Esponente   | Potenza    | Vuol dire                                            | Valore |
| ----------- | ---------- | ---------------------------------------------------- | ------ |
| $\frac12$   | $2^{1/2}$  | [[*$\sqrt{2}$|$2 \cdot \frac12$|$1$]]             | ${yh}{yh||input} |
| $\frac14$   | $2^{1/4}$  | [[$\sqrt{2}$|*$\sqrt[4]{2}$|$\frac{2}{4}$]]       | ${yq}{yq||input} |
| $-\frac12$  | $2^{-1/2}$ | [[$-\sqrt{2}$|*$\frac{1}{\sqrt{2}}$|$\sqrt{-2}$]] | ${ymh}{ymh||input} |
:::

Ricorda: $2^{\frac12}$ è **il numero che moltiplicato per sé stesso fa 2** — è
esattamente il $k$ che hai cercato a mano nella lezione scorsa.

## Guarda dove sono finiti

:::graph
xrange: "-3,4"
yrange: "-1,9"
boundpoints:
  - {x: -1, y: ym1, label: "-1"}
  - {x: -0.5, y: ymh, label: "-1/2"}
  - {x: 0, y: y0, label: "0"}
  - {x: 0.25, y: yq, label: "1/4"}
  - {x: 0.5, y: yh, label: "1/2"}
  - {x: 1, y: y1, label: "1"}
  - {x: 2, y: y2, label: "2"}
  - {x: 3, y: y3, label: "3"}
:::

Otto punti, nessuno fuori posto? Un valore sbagliato si vede: rompe l'andamento degli
altri.

[Verifica i tuoi punti]{check: (y3-8)*(y3-8) < 0.0004 && (y2-4)*(y2-4) < 0.0004 && (y1-2)*(y1-2) < 0.0004 && (y0-1)*(y0-1) < 0.0004 && (ym1-0.5)*(ym1-0.5) < 0.0004 && (yh-1.4142136)*(yh-1.4142136) < 0.0004 && (yq-1.1892071)*(yq-1.1892071) < 0.0004 && (ymh-0.7071068)*(ymh-0.7071068) < 0.0004}

:::div.reveal
**Erano i tuoi gradini, disegnati.**

Ecco la curva che li unisce tutti: è il grafico di $y = 2^x$.

:::graph
expr: "2^x"
xrange: "-3,4"
yrange: "-1,9"
boundpoints:
  - {x: -1, y: ym1, label: "-1"}
  - {x: -0.5, y: ymh, label: "-1/2"}
  - {x: 0, y: y0, label: "0"}
  - {x: 0.25, y: yq, label: "1/4"}
  - {x: 0.5, y: yh, label: "1/2"}
  - {x: 1, y: y1, label: "1"}
  - {x: 2, y: y2, label: "2"}
  - {x: 3, y: y3, label: "3"}
:::

Sono gli **stessi punti** che hai scritto tu, e stanno tutti sulla curva. Tra un gradino intero e l'altro non c'è nessuno strappo: la curva passa da tutti i punti che hai messo, e anche da tutti quelli che non hai messo.
:::

---

> id: grafico-esponenziale
> title: Il grafico della funzione esponenziale

# Cambia la base

Muovi la base e osserva la famiglia intera. Ricorda le condizioni: $a > 0$, $a \neq 1$.

Base: ${a}{a|2|0.2,4,0.1}

$$y = ${a}^{x}$$

:::graph
expr: "a^x"
bind: a
xrange: "-3,4"
yrange: "-1,9"
:::

Rispondi guardando il grafico.

- Tutte le curve passano per lo stesso punto. Quale? [[*$(0;1)$|$(1;0)$|$(1;1)$]]
- Con base $a$ maggiore di 1 la curva [[*cresce|decresce|resta piatta]]; con base tra 0 e 1 [[cresce|*decresce|resta piatta]].
- Quando la base è $\frac12$ il grafico è quello di base 2 [[*ribaltato a specchio|traslato in alto|identico]] — proprio come le due scale capovolte del secondo step.
- La curva tocca l'asse delle $x$? [[Sì, in x=0|*No, mai: $a^x$ è sempre positivo|Sì, per x molto grandi]]

:::div.reveal
# 🎉 Hai costruito la funzione esponenziale

Non l'hai ricevuta come definizione: l'hai ottenuta **allargando** una scala di potenze finché non ha più avuto buchi, e tenendo ferme le regole a ogni allargamento.

Riepilogo di quello che ora sai giustificare, non solo ricordare:

| Passaggio | Perché |
| --------- | ------ |
| $a^0 = 1$ | è l'unico valore che continua la scala |
| $a^{-n} = \frac{1}{a^n}$ | scendere di un gradino vuol dire dividere per $a$ |
| $a^{\frac{m}{n}} = \sqrt[n]{a^m}$ | il gradino di mezzo va moltiplicato per sé stesso $n$ volte |
| $a^x$ con $x$ irrazionale | è il numero verso cui si stringono i gradini razionali vicini |
| $a > 0$, $a \neq 1$ | senza queste, la definizione si contraddice o si appiattisce |

**Nella prossima lezione:** questa curva non torna mai indietro e non si ripete mai — quindi si può *invertire*. Chiedersi "a quale esponente devo elevare 2 per ottenere 8?" è la domanda che apre i **logaritmi**.
:::