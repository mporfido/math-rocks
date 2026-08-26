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
navigate: true
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
navigate: true
:::
```

`bind` collega il grafico alla variabile dello slider: la curva si ridisegna a ogni movimento. `expr` a livello top è la scorciatoia per una singola curva (equivale a una voce in `functions`).

`navigate: true` sblocca la vista (trascinamento, Shift+rotella, barra in basso a destra): qui serve per allargare la finestra e contare più oscillazioni. Senza questa chiave — il default — la vista resta ferma su `xrange`/`yrange` e su mobile lo swipe sul grafico scrolla la pagina.

📖 Riferimento: `docs/grafici.md` · `docs/variabili.md`

:::

:::div.highlight
💡 Quando `a` cresce, la funzione oscilla più velocemente: il **periodo** della sinusoide diminuisce.
:::

---

> id: posiziona-punti
> title: Posiziona i Punti

# Trova le Coordinate

Tocca il piano per mettere un punto su ciascuna delle posizioni indicate (i pallini verdi semitrasparenti). In che ordine li metti non conta; se sbagli, tocca il punto per toglierlo.

- (3, 2)
- (−2, 4)
- (1, −3)

:::graph
snap: 1
verify: true
targets: true
coords: true
tolerance: 0.3
xrange: "-6,6"
yrange: "-6,6"
points:
  - target: "3,2"
  - target: "-2,4"
  - target: "1,-3"
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::graph
snap: 1
verify: true
targets: true
coords: true
tolerance: 0.3
xrange: "-6,6"
yrange: "-6,6"
points:
  - target: "3,2"
  - target: "-2,4"
  - target: "1,-3"
:::
```

Ogni voce di `points` è una posizione da coprire, e insieme fanno un goal: i punti non hanno nome e valgono uno per l'altro. `snap` arrotonda alla griglia, `tolerance` allarga il margine attorno a ogni obiettivo, `verify` sposta il controllo su un bottone, `coords: true` scrive le coordinate accanto ai punti.

📖 Riferimento: `docs/grafici.md` — layer `points`

:::

:::div.reveal
Ottimo! Hai coperto tutte e tre le posizioni.
:::

---

> id: prevedi-continuazione
> title: Prevedi come continua la funzione

La parabola è disegnata fino a $x = 3$. Tocca il piano per aggiungere i punti di ascissa 3, 4 e 5.

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

📖 Riferimento: `docs/grafici.md` · `docs/grafici-esempi.md` §5

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

📖 Riferimento: `docs/grafici.md` · `docs/variabili.md` per `check`

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

📖 Riferimento: `docs/grafici.md` — layer `boundpoints`

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

📖 Riferimento: `docs/grafici-esempi.md` §6

:::

:::div.reveal
Perfetto! Un punto $(x, y)$ appartiene alla retta $y = 2x$ proprio quando $y = 2x$: la verifica algebrica e quella grafica coincidono.
:::

---

> id: sketch-p5
> title: Sketch interattivo (p5.js)

# Centra il bersaglio

Con un blocco `:::p5` puoi inserire una simulazione o visualizzazione scritta in **p5.js**. Lo sketch può leggere gli slider e i campi della pagina (`ctx.model`) e segnalare il completamento del goal quando vuole, chiamando `ctx.complete()`.

Muovi lo slider per portare la pallina **dentro** il bersaglio verde:

Posizione: ${a}{a|0|0,10,1}

:::p5 goal height=240 bind=a
const target = 7;
p.setup = () => { p.createCanvas(ctx.width, ctx.height); };
p.draw = () => {
  p.background(245);
  const a = ctx.model.a ?? 0;
  const cy = p.height / 2;
  const tx = p.map(target, 0, 10, 40, p.width - 40);
  const x = p.map(a, 0, 10, 40, p.width - 40);
  const hit = Math.abs(a - target) < 0.001;

  // bersaglio
  p.noStroke();
  p.fill(46, 204, 113, 60);
  p.circle(tx, cy, 80);

  // pallina
  p.fill(hit ? '#2ecc71' : '#3498db');
  p.circle(x, cy, 38);

  if (hit) ctx.complete();
};
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
Posizione: ${a}{a|0|0,10,1}

:::p5 goal height=240 bind=a
const target = 7;
p.setup = () => { p.createCanvas(ctx.width, ctx.height); };
p.draw = () => {
  const a = ctx.model.a ?? 0;       // legge lo slider della pagina
  // ...disegno con p5...
  if (Math.abs(a - target) < 0.001) ctx.complete();  // criterio del goal
};
:::
```

Le opzioni vanno sulla riga di apertura: `goal` rende lo sketch un goal, `height`/`width` dimensionano il canvas, `bind` elenca le variabili da osservare. Lo sketch riceve `p` (istanza p5) e `ctx` (`ctx.model`, `ctx.complete()`, `ctx.onChange()`).

📖 Riferimento: `docs/p5.md`

:::

:::div.reveal
Ottimo! Lo sketch ha verificato da solo il criterio (`a == 7`) ed emesso il completamento del goal: esattamente come blank, slider e grafici, anche una mini-app p5 può sbloccare lo step.
:::
---

> id: punto-trascinabile
> title: Punto trascinabile legato al modello
> use-mathjs: true

# Trascinalo tu

Un `boundpoint` con `drag: true` è **trascinabile**, e trascinandolo riscrive le sue due variabili: il legame col modello va nei due sensi. Il punto arancione si tocca, quelli blu no.

Muovi $P$ e guarda lo slider seguirlo — e viceversa.

Ascissa di $P$: ${px}{px|3|-6,6,1}

:::graph
xrange: "-6,6"
yrange: "-6,6"
snap: 1
boundpoints:
  - {x: 0, y: 0, label: O}
  - {x: px, y: py, label: P, drag: true, start: "3,2"}
connect: true
:::

Le coordinate di $P$ sono $(${px}; ${py})$, e la sua distanza dall'origine vale ${= sqrt(px^2 + py^2)}.

Portalo in $(-4; 3)$:

[Verifica]{check: px == -4 and py == 3}

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
Ascissa di $P$: ${px}{px|3|-6,6,1}

:::graph
xrange: "-6,6"
yrange: "-6,6"
snap: 1
boundpoints:
  - {x: 0, y: 0, label: O}
  - {x: px, y: py, label: P, drag: true, start: "3,2"}
connect: true
:::

[Verifica]{check: px == -4 and py == 3}
```

Con `drag: true` le coordinate devono essere **nomi di variabile** (non numeri né espressioni: non sarebbero riscrivibili) e serve `start: "x,y"`, la posizione da cui parte la prima volta. Poi vince quella salvata nei progressi. Il punto resta esplorativo: il goal lo fa il `{check: …}`.

📖 Riferimento: `docs/grafici.md` §boundpoints · `docs/grafici-esempi.md` §8

:::

:::div.reveal
Il punto e lo slider sono due facce della stessa variabile: chiunque dei due si muova, l'altro lo segue e le formule si ricalcolano.
:::

---

> id: sketch-che-scrive
> title: Uno sketch che riempie il testo
> use-mathjs: true

# La figura che detta i numeri

`ctx.model` fa leggere alla figura le variabili della pagina. `ctx.set(nome, valore)` fa il contrario: la **figura** diventa la sorgente, e il testo accanto si compila da solo — in MathJax vero, non in testo disegnato sul canvas.

Trascina i due punti sul quadrettato:

:::p5 sketch=piano-distanza height=320 ax=-3 ay=-2 bx=1 by=1
:::

$$\Delta x = ${dx} \qquad \Delta y = ${dy} \qquad \overline{AB} = ${= sqrt(dx^2 + dy^2)}$$

Portali a distanza esattamente $10$:

[Verifica]{check: sqrt(dx^2 + dy^2) == 10}

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
> use-mathjs: true

:::p5 sketch=piano-distanza height=320 ax=-3 ay=-2 bx=1 by=1
:::

$$\Delta x = ${dx} \qquad \overline{AB} = ${= sqrt(dx^2 + dy^2)}$$

[Verifica]{check: sqrt(dx^2 + dy^2) == 10}
```

Nello sketch basta `ctx.set('dx', valore)`: da lì in poi la variabile si comporta come se venisse da uno slider — riferimenti `${…}`, calcoli live, condizioni `{check: …}`, salvataggio nei progressi.

Va chiamato **quando il valore cambia davvero** (fine trascinamento, click, `setup()`), mai dentro `draw()`: a 60 fotogrammi al secondo scriverebbe 60 volte nei progressi.

📖 Riferimento: `docs/p5.md` §ctx.set

:::

:::div.reveal
Testo e figura non sono più due mondi separati: la figura produce i numeri, il testo li spiega.
:::
