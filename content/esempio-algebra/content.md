> id: intro
> title: Benvenuto all'Algebra

# Benvenuto all'Algebra!

L'algebra è un ramo della matematica che usa **lettere** e **simboli** per rappresentare numeri e relazioni. È uno strumento potente che ti permetterà di risolvere problemi complessi in modo elegante.

## Il tuo primo esercizio

Iniziamo con qualcosa di semplice. Se `2x = 10`, quale sarà il valore di `x`?

Risposta: `x =` [[5]]

:::div.reveal
Perfetto! Hai risolto la tua prima equazione. Quando `2x = 10`, dividiamo entrambi i lati per 2 e otteniamo `x = 5`.
:::

---

> id: equazioni-base
> title: Equazioni di Base

# Risolvere Equazioni

Un'equazione è come una bilancia: quello che fai da una parte, devi farlo anche dall'altra per mantenere l'equilibrio.

## Esercizio 1: Addizione

Risolvi: `x + 3 = 8`

Soluzione: `x =` [[5]]

## Esercizio 2: Sottrazione

Risolvi: `y - 4 = 10`

Soluzione: `y =` [[14]]

## Esercizio 3: Scelta multipla

Quale operazione useresti per risolvere `3x = 15`?

[[Addizione|Sottrazione|Moltiplicazione|*Divisione]]

:::div.reveal
Eccellente! Hai completato tutti gli esercizi di base. Ora sei pronto per qualcosa di più interattivo!
:::

---

> id: variabili-interattive
> title: Variabili Interattive

# Giocare con le Variabili

Ora esploriamo come le variabili cambiano le equazioni. Prova a muovere lo slider per modificare il valore di `a`:

Valore di `a`: ${a}{a|2|-5,5,1}

## L'equazione cambia!

Con il valore corrente di `a`, l'equazione diventa:

`x^2 + ${a}x + 4 = 0`

Osserva come cambia l'equazione quando modifichi il valore dello slider!

:::div.highlight
💡 **Suggerimento**: Questa è un'equazione quadratica. Le soluzioni dipendono dal valore di `a`!
:::

## Prova tu

Ora prova con un'altra variabile `b`:

Valore di `b`: ${b}{b|1|-3,3,0.5}

L'equazione lineare è: `2x + ${b} = 10`

:::div.reveal
Fantastico! Hai esplorato come le variabili rendono l'algebra dinamica e potente. Continua così!
:::

---

> id: sfida-finale
> title: Sfida Finale

# Metti alla Prova le tue Abilità

Ora combiniamo tutto quello che hai imparato!

## Problema 1

Se `5x - 3 = 17`, qual è il valore di `x`?

Risposta: `x =` [[4]]

## Problema 2

Quale delle seguenti è una soluzione di `x^2 = 16`?

[[2|3|*4|5]]

## Problema 3

Usa lo slider per trovare il valore di `k` che rende vera l'equazione `3k + 7 = 16`:

Valore di `k`: ${k}{k|0|0,10,1}

:::div.reveal
# 🎉 Congratulazioni!

Hai completato il corso di Introduzione all'Algebra! Ora conosci:

- Come risolvere equazioni semplici
- Il concetto di variabili
- Come lavorare con equazioni interattive

**Prossimi passi**: Esplora corsi più avanzati sulla geometria o il calcolo!
:::

---

> id: prova-frazioni
> title: Semplificare frazioni con mathjs
> use-mathjs: true

# Frazioni ridotte ai minimi termini

Numeratore: ${n}{n|4|1,20,1}
Denominatore: ${d}{d|8|1,20,1}

Frazione: ${n}/${d}

Frazione con latex: $\frac{${n}}{${d}}$

---

> id: grafico-funzione
> title: Grafico Interattivo

# Il Grafico di una Funzione

Muovi lo slider per cambiare il valore di `a` e osserva come cambia la forma del grafico di $\sin(a \cdot x)$ in tempo reale:

Valore di `a`: ${a}{a|1|0.5,4,0.5}

:::graph
type: function
expr: "sin(a*x)"
bind: a
xrange: "-7,7"
yrange: "-2,2"
:::

:::div.highlight
💡 Quando `a` cresce, la funzione oscilla più velocemente: il **periodo** della sinusoide diminuisce.
:::

---

> id: posiziona-punti
> title: Posiziona i Punti

# Trova le Coordinate

Trascina i tre punti **A**, **B**, **C** nelle posizioni indicate (i pallini verdi semitrasparenti):

- **A** = (3, 2)
- **B** = (−2, 4)
- **C** = (1, −3)

:::graph
type: points
snap: 1
verify: true
coords: false
xrange: "-6,6"
yrange: "-6,6"
points:
  - target: "3,2"
  - target: "-2,4"
  - target: "1,-3"
    snap: 0.5
:::

:::div.reveal
Ottimo! Hai posizionato tutti e tre i punti correttamente.
:::