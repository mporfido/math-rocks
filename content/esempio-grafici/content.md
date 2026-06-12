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

---

> id: prevedi-continuazione
> title: Prevedi come continua la funzione

Inserisci correttamente i punti di ordinata 3, 4 e 5

:::graph
type: points
expr: "x^2"
xclip: "-5,3"
xrange: "-6,8"
yrange: "-2,25"
snap: 1
verify: true
points:
- target: "3,9"
- target: "4,16"
- target: "5,25"
:::


:::div.reveal
Ottimo!
:::

---

> id: doppio-slider-check
> title: Trova il punto di intersezione

# Trova il punto di intersezione

Muovi gli slider in modo che le due rette $y = ax + b$ e $y = cx + d$ si incontrino nel punto $(1, 3)$.

Retta 1 — $a$: ${a}{a|1|-4,4,0.5} &nbsp; $b$: ${b}{b|0|-4,4,0.5}

Retta 2 — $c$: ${c}{c|-1|-4,4,0.5} &nbsp; $d$: ${d}{d|2|-4,4,0.5}

:::graph
type: functions
bind: a,b,c,d
xrange: "-10,10"
yrange: "-6,6"
functions:
  - expr: "a*x + b"
  - expr: "c*x + d"
:::

[Verifica]{check: a + b == 3 && c + d == 3}

:::div.reveal
Esatto! Entrambe le rette passano per il punto $(1, 3)$: sostituendo $x = 1$ ottieni $a + b = 3$ e $c + d = 3$.
:::

---

> id: tabella-xy
> title: Tabella di punti x-y

# Dalla tabella al piano cartesiano

Inserisci le coordinate dei tre punti nella tabella: vedrai ciascun punto comparire e spostarsi in tempo reale sul piano. La spezzata blu li unisce nell'ordine A → B → C.

| Punto | x | y |
| ----- | - | - |
| **A** | ${ax}{ax|1|input} | ${ay}{ay|1|input} |
| **B** | ${bx}{bx|3|input} | ${by}{by|4|input} |
| **C** | ${cx}{cx|-2|input} | ${cy}{cy|2|input} |

:::graph
type: boundpoints
xrange: "-6,6"
yrange: "-6,6"
connect: true
points:
  - {x: ax, y: ay, label: A}
  - {x: bx, y: by, label: B}
  - {x: cx, y: cy, label: C}
:::

:::div.highlight
💡 Prova a cambiare i valori: cambiando le coordinate cambi la posizione dei punti e la forma della spezzata che li collega.
:::