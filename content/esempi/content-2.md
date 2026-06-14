> id: grafici
> title: Componenti grafici
> description: Esempi di integrazione di grafici interattivi nelle pagine.

---

> id: grafico-funzione
> title: Grafico Interattivo

# Il Grafico di una Funzione

Muovi lo slider per cambiare il valore di `a` e osserva come cambia la forma del grafico di $\sin(a \cdot x)$ in tempo reale:

Valore di `a`: ${a}{a|1|0.5,4,0.5}

:::graph
expr: "sin(a*x)"
bind: a
xrange: "-7,7"
yrange: "-2,2"
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
Valore di `a`: ${a}{a|1|0.5,4,0.5}

:::graph
expr: "sin(a*x)"
bind: a
xrange: "-7,7"
yrange: "-2,2"
:::
```

`bind` collega il grafico alla variabile dello slider: la curva si ridisegna a ogni movimento. `expr` a livello top è la scorciatoia per una singola curva (equivale a una voce in `functions`).

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

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::graph
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
```

Ogni voce di `points` con un `target` crea un punto trascinabile e un goal da completare. `snap` arrotonda alla griglia (sovrascrivibile per singolo punto), `verify` attiva il controllo automatico, `coords: false` nasconde le coordinate.

:::

:::div.reveal
Ottimo! Hai posizionato tutti e tre i punti correttamente.
:::

---

> id: prevedi-continuazione
> title: Prevedi come continua la funzione

Inserisci correttamente i punti di ordinata 3, 4 e 5

:::graph
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

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::graph
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
```

I layer si combinano: qui una curva (`expr` con `xclip` che ne limita il disegno a un intervallo) convive con i punti da posizionare.

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
bind: a,b,c,d
xrange: "-10,10"
yrange: "-6,6"
functions:
  - expr: "a*x + b"
  - expr: "c*x + d"
:::

[Verifica]{check: a + b == 3 && c + d == 3}

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
Retta 1 — $a$: ${a}{a|1|-4,4,0.5} &nbsp; $b$: ${b}{b|0|-4,4,0.5}

Retta 2 — $c$: ${c}{c|-1|-4,4,0.5} &nbsp; $d$: ${d}{d|2|-4,4,0.5}

:::graph
bind: a,b,c,d
xrange: "-10,10"
yrange: "-6,6"
functions:
  - expr: "a*x + b"
  - expr: "c*x + d"
:::

[Verifica]{check: a + b == 3 && c + d == 3}
```

Il layer `functions` accetta più curve; `bind` può elencare più variabili separate da virgola. Il bottone di verifica valuta una condizione sulle variabili dello step.

:::

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
xrange: "-6,6"
yrange: "-6,6"
connect: true
boundpoints:
  - {x: ax, y: ay, label: A}
  - {x: bx, y: by, label: B}
  - {x: cx, y: cy, label: C}
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
| Punto | x | y |
| ----- | - | - |
| **A** | ${ax}{ax|1|input} | ${ay}{ay|1|input} |
| **B** | ${bx}{bx|3|input} | ${by}{by|4|input} |
| **C** | ${cx}{cx|-2|input} | ${cy}{cy|2|input} |

:::graph
xrange: "-6,6"
yrange: "-6,6"
connect: true
boundpoints:
  - {x: ax, y: ay, label: A}
  - {x: bx, y: by, label: B}
  - {x: cx, y: cy, label: C}
:::
```

La modalità **input** al posto del range crea un campo numerico editabile invece dello slider. Il layer `boundpoints` aggancia ogni punto a una coppia di variabili; `connect: true` unisce i punti con una spezzata.

:::

:::div.highlight
💡 Prova a cambiare i valori: cambiando le coordinate cambi la posizione dei punti e la forma della spezzata che li collega.
:::

---

> id: punti-su-retta
> title: Punti su una retta

# Porta i punti sulla retta

I layer dei grafici si possono combinare: qui una retta $y = mx$ animata dallo slider e due punti legati alla tabella convivono nello stesso piano.

Pendenza $m$: ${m}{m|1|-3,3,0.5}

| Punto | x | y |
| ----- | - | - |
| **P** | ${px}{px|2|input} | ${py}{py|1|input} |
| **Q** | ${qx}{qx|-3|input} | ${qy}{qy|2|input} |

:::graph
xrange: "-6,6"
yrange: "-6,6"
bind: m
functions:
  - expr: "m*x"
boundpoints:
  - {x: px, y: py, label: P}
  - {x: qx, y: qy, label: Q}
:::

Scegli le coordinate di **P** e **Q** in modo che entrambi i punti stiano sulla retta con $m = 2$.

[Verifica]{check: m == 2 && py == 2 * px && qy == 2 * qx}

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
Pendenza $m$: ${m}{m|1|-3,3,0.5}

| Punto | x | y |
| ----- | - | - |
| **P** | ${px}{px|2|input} | ${py}{py|1|input} |
| **Q** | ${qx}{qx|-3|input} | ${qy}{qy|2|input} |

:::graph
xrange: "-6,6"
yrange: "-6,6"
bind: m
functions:
  - expr: "m*x"
boundpoints:
  - {x: px, y: py, label: P}
  - {x: qx, y: qy, label: Q}
:::

[Verifica]{check: m == 2 && py == 2 * px && qy == 2 * qx}
```

Tutti i layer convivono nello stesso piano: `functions` animato dallo slider, `boundpoints` legato alla tabella e la verifica finale sulle variabili.

:::

:::div.reveal
Perfetto! Un punto $(x, y)$ appartiene alla retta $y = 2x$ proprio quando $y = 2x$: la verifica algebrica e quella grafica coincidono.
:::