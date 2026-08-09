# Grafici Interattivi — Sintassi e Riferimento

Il componente `<x-graph>` permette di inserire grafici interattivi nei corsi. Si usa nel markdown con il blocco `:::graph ... :::` in formato YAML.

Le capacità del grafico sono **layer componibili**: ogni layer si attiva con la presenza della rispettiva chiave e tutti possono coesistere nello stesso piano cartesiano.

## Struttura base

```
:::graph
xrange: "-10,10"      # asse X (default: -10,10)
yrange: "-7,7"        # asse Y (default: -7,7)
ticks: 1              # passo delle tacche sugli assi (default: 1)
xticks: 1             # passo solo sull'asse X (vince su ticks)
yticks: 100           # passo solo sull'asse Y (vince su ticks)
aspect: free          # assi con scale indipendenti (default: equiscalati)
bind: a               # variabili slider che ridisegnano le curve

functions:            # layer curve
  - expr: "sin(a*x)"

points:               # layer punti obiettivo trascinabili
  - target: "3,2"

boundpoints:          # layer punti legati a variabili del modello
  - {x: ax, y: ay, label: A}
:::
```

---

## Layer `functions` — Curve matematiche

Disegna una o più funzioni `y = f(x)` sul piano cartesiano. Il grafico è esplorativo (pan e zoom abilitati).

**Struttura di ogni elemento in `functions`:**

| Chiave  | Tipo        | Obbligatorio | Descrizione |
|---------|-------------|:------------:|-------------|
| `expr`  | stringa     | sì           | Espressione matematica in `x` (es. `"sin(x)"`, `"x^2 - 3"`) |
| `xclip` | `"min,max"` | no           | Limita il dominio visualizzato della curva |
| `color` | stringa     | no           | Colore della curva (default: rotazione rosso, blu, verde, arancio) |

**Attributi top-level collegati:**

| Attributo | Tipo            | Descrizione |
|-----------|-----------------|-------------|
| `bind`    | stringa / lista | Variabile/i slider da collegare (es. `a` oppure `[a, b]`): al cambio dello slider le curve si ridisegnano |
| `expr`    | stringa         | Scorciatoia per una singola curva: equivale a `functions: [{expr: ...}]` (accetta anche `xclip` top-level) |

**Esempio — curva semplice:**

```
:::graph
expr: "x^2 - 4"
xrange: "-5,5"
yrange: "-6,10"
:::
```

**Esempio — curva collegata a uno slider:**

Prima definisci lo slider nel testo dello step:

```
Valore di `a`: ${a}{a|1|0.5,4,0.5}
```

Poi usa `bind` per aggiornare il grafico in tempo reale:

```
:::graph
expr: "sin(a * x)"
bind: a
xrange: "-7,7"
yrange: "-2,2"
:::
```

**Esempio — più curve, più slider:**

```
Parametri: ${a}{a|1|0,3,0.5} e ${b}{b|0|-5,5,1}

:::graph
bind: [a, b]
xrange: "-10,10"
yrange: "-10,10"
functions:
  - expr: "a * x + b"
  - expr: "x^2"
    color: "#999999"
:::
```

**Funzioni matematiche supportate nell'espressione:**

| Sintassi     | Significato       |
|--------------|-------------------|
| `x^2`        | Potenza (`x²`)    |
| `sqrt(x)`    | Radice quadrata   |
| `abs(x)`     | Valore assoluto   |
| `sin(x)`     | Seno              |
| `cos(x)`     | Coseno            |
| `tan(x)`     | Tangente          |
| `asin(x)`    | Arcoseno          |
| `acos(x)`    | Arcocoseno        |
| `atan(x)`    | Arcotangente      |
| `exp(x)`     | Esponenziale eˣ   |
| `log(x)`     | Logaritmo naturale|
| `pi`         | π (3.14159…)      |

---

## Layer `points` — Punti obiettivo trascinabili

Punti che lo studente trascina nelle posizioni indicate. I punti vengono etichettati automaticamente A, B, C, … Quando tutti i punti con `target` sono posizionati correttamente, il grafico emette `goal-complete` e sblocca i blocchi `:::div.reveal`.

**Struttura di ogni elemento in `points`:**

| Chiave      | Tipo    | Descrizione |
|-------------|---------|-------------|
| `target`    | `"x,y"` | Coordinata obiettivo (i punti senza target sono liberi) |
| `snap`      | numero  | Snap per questo punto (sovrascrive quello globale) |
| `tolerance` | numero  | Raggio di tolleranza attorno al target (default: 1% della somma delle coordinate) |

**Attributi top-level collegati:**

| Attributo | Tipo   | Descrizione |
|-----------|--------|-------------|
| `snap`    | numero | Griglia di scatto globale (es. `1` = interi, `0.5` = mezzi) |
| `verify`  | bool   | Richiede click su "Verifica" invece del controllo automatico al trascinamento |
| `coords`  | bool   | Mostra le coordinate live accanto ai punti (default: `false`) |
| `targets` | bool   | Mostra i punti obiettivo come pallini verdi semitrasparenti (default: `false`) |

**Esempio — tre punti con verifica esplicita:**

```
:::graph
snap: 1
verify: true
xrange: "-6,6"
yrange: "-6,6"
points:
  - target: "3,2"
  - target: "-2,4"
  - target: "1,-3"
    snap: 0.5
:::
```

**Esempio — punti su una curva di sfondo:**

Utile per chiedere allo studente di prevedere dove si trovano punti della curva:

```
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

---

## Layer `boundpoints` — Punti legati a variabili del modello

Punti le cui coordinate provengono da variabili dello step (es. input editabili in una tabella, slider). Si ridisegnano in tempo reale quando le variabili cambiano. Non sono trascinabili e non generano goal.

**Struttura di ogni elemento in `boundpoints`:**

| Chiave  | Tipo    | Obbligatorio | Descrizione |
|---------|---------|:------------:|-------------|
| `x`     | stringa o numero | sì  | Nome della variabile per l'ascissa, un numero fisso, **oppure** un'espressione |
| `y`     | stringa o numero | sì  | Nome della variabile per l'ordinata, un numero fisso, **oppure** un'espressione |
| `label` | stringa | no           | Etichetta del punto (default: A, B, C, …) |

Una coordinata fissa serve quando è l'autore a decidere dove sta il punto su un
asse e lo studente riempie solo l'altro: una tabella "esponente → valore" ha le
ascisse già scritte nella prima colonna.

Un'**espressione** (stessa sintassi di `expr`: `^`, `sqrt`, `sin`, …) serve
quando una coordinata si calcola dall'altra, tipicamente per far scorrere un
punto lungo una curva al muoversi di uno slider:

```
${a}{a|-2|-3,3,0.01}

:::graph
functions:
  - expr: "2^x"
boundpoints:
  - {x: a, y: "2^a", label: "il tuo punto"}
:::
```

Attenzione a scrivere l'espressione **fra virgolette**: `2^a` senza virgolette
è comunque letto come stringa, ma per esempio `{y: 1/n}` no.

Finché la variabile è vuota (`${y}{y||input}`, campo mai compilato) il punto
**non viene disegnato**: non finisce in $(x, 0)$, che sarebbe una risposta
suggerita.

**Attributi top-level collegati:**

| Attributo | Tipo | Descrizione |
|-----------|------|-------------|
| `connect` | bool | Unisce i punti consecutivi con una spezzata |

**Esempio — tabella x-y → piano cartesiano:**

```
| Punto | x | y |
| ----- | - | - |
| **A** | ${ax}{ax|1|input} | ${ay}{ay|1|input} |
| **B** | ${bx}{bx|3|input} | ${by}{by|4|input} |

:::graph
xrange: "-6,6"
yrange: "-6,6"
connect: true
boundpoints:
  - {x: ax, y: ay, label: A}
  - {x: bx, y: by, label: B}
:::
```

---

## Combinare i layer

I layer sono indipendenti e si possono usare insieme nello stesso blocco. Esempio: una retta animata da uno slider e punti che seguono una tabella:

```
Pendenza `m`: ${m}{m|1|-3,3,0.5}

| Punto | x | y |
| ----- | - | - |
| **P** | ${px}{px|2|input} | ${py}{py|1|input} |

:::graph
xrange: "-6,6"
yrange: "-6,6"
bind: m
functions:
  - expr: "m*x"
boundpoints:
  - {x: px, y: py, label: P}
:::
```

Altre combinazioni utili:
- `functions` + `points`: posizionare punti su una curva (anche animata con `bind`)
- `points` + `boundpoints`: confrontare punti calcolati con punti da posizionare

---

## Comportamento degli obiettivi (goal tracking)

Il layer `points` si integra con il sistema di goal di `<x-step>`:

- Ogni grafico con almeno un `target` genera automaticamente un **goal**.
- Quando tutti i punti sono posizionati correttamente, viene emesso `goal-complete`.
- Se tutti i goal dello step sono completati, i blocchi `:::div.reveal` diventano visibili.

In modalità **`verify: true`**:
- Appare un pulsante **"Verifica"** sotto il grafico.
- Tutti i punti devono essere corretti simultaneamente al momento del click.
- Se uno o più punti sono sbagliati, tutti lampeggiano in rosso senza rivelare quali sono corretti.

In modalità **automatica** (default, senza `verify`):
- Il controllo avviene ad ogni trascinamento e al rilascio del punto.
- Ogni punto diventa verde non appena viene posizionato correttamente.

I layer `functions` e `boundpoints` sono solo esplorativi e non generano goal: per verificare valori legati a variabili usa `[Testo]{check: condizione}`.

---

## Attributi visivi del piano cartesiano

Tutti i grafici supportano:

- **Pan**: trascina il piano per spostarlo.
- **Zoom**: usa la rotella del mouse o i controlli di navigazione.
- Gli assi e la griglia sono sempre visibili.
- Il copyright JSXGraph è nascosto automaticamente.

| Attributo | Tipo | Default | Descrizione |
|-----------|------|---------|-------------|
| `ticks`   | numero | `1` | Passo delle tacche su entrambi gli assi |
| `xticks`  | numero | valore di `ticks` | Passo solo sull'asse X |
| `yticks`  | numero | valore di `ticks` | Passo solo sull'asse Y |
| `aspect`  | `free` | assi equiscalati | `free` libera le scale dei due assi |

### Quando serve `aspect: free`

Di default l'unità sull'asse $x$ e l'unità sull'asse $y$ hanno la **stessa
lunghezza in pixel**: un cerchio è rotondo e una pendenza è quella che sembra.
Per ottenerlo JSXGraph non si limita a usare la boundingbox richiesta, la
**allarga** finché le proporzioni tornano.

Va benissimo finché le due grandezze sono omogenee. Non va più bene quando sui
due assi ci sono cose diverse — mesi ed euro, anni e abitanti: chiedere
`xrange: "-0.5,5"` con `yrange: "-1,1100"` significa chiedere un rapporto di
1 a 200, e il grafico si schiaccia in una linea piatta contro l'asse.

In quel caso si dichiara `aspect: free`: la boundingbox viene rispettata alla
lettera. Quasi sempre serve anche un passo di tacche diverso per asse,
altrimenti un asse $y$ da 0 a 1100 con passo 1 produce un migliaio di etichette.

```
:::graph
expr: "1000+10*x"     # interesse semplice: +10 € al mese
xrange: "-0.5,5"      # i mesi
yrange: "-1,1100"     # gli euro
aspect: free
xticks: 1
yticks: 100
:::
```

**Attenzione con il layer `points`:** con `aspect: free` una distanza sull'asse
$x$ e la stessa distanza sull'asse $y$ non si somigliano più, quindi la
`tolerance` di default (una soglia unica, espressa in unità del modello) risulta
generosa su un asse e severa sull'altro. Se combini `aspect: free` e punti
trascinabili, indica una `tolerance` esplicita.

---

## Esempi completi per scenari comuni

### Funzione con slider — esplorare l'effetto di un parametro

```
Modifica `a` per vedere come cambia il periodo:

Valore di `a`: ${a}{a|1|0.5,4,0.5}

:::graph
expr: "sin(a * x)"
bind: a
xrange: "-7,7"
yrange: "-2,2"
:::
```

### Retta — due parametri

```
Pendenza `m`: ${m}{m|1|-3,3,0.5}
Intercetta `b`: ${b}{b|0|-5,5,1}

:::graph
expr: "m * x + b"
bind: [m, b]
xrange: "-10,10"
yrange: "-10,10"
:::
```

### Posizionare un punto su una coordinata

```
Trascina il punto in (2, 3):

:::graph
snap: 1
coords: true
xrange: "-5,5"
yrange: "-5,5"
points:
  - target: "2,3"
:::
```

### Punti multipli con obiettivi visibili

```
Posiziona i punti dove indicato (pallini verdi):

:::graph
snap: 1
verify: true
targets: true
coords: true
xrange: "-5,5"
yrange: "-5,5"
points:
  - target: "1,2"
  - target: "-3,1"
  - target: "2,-2"
:::
```

### Previsione dei valori di una funzione

```
La parabola è mostrata fino a x=2. Dove si trovano i punti per x=3, 4, 5?

:::graph
expr: "x^2"
xclip: "-5,2"
snap: 1
verify: true
xrange: "-6,8"
yrange: "-2,30"
points:
  - target: "3,9"
  - target: "4,16"
  - target: "5,25"
:::
```

### Curva animata + punti da tabella

```
Pendenza `m`: ${m}{m|1|-3,3,0.5}

| Punto | x | y |
| ----- | - | - |
| **P** | ${px}{px|2|input} | ${py}{py|1|input} |
| **Q** | ${qx}{qx|-3|input} | ${qy}{qy|2|input} |

:::graph
xrange: "-6,6"
yrange: "-6,6"
bind: m
connect: true
functions:
  - expr: "m*x"
boundpoints:
  - {x: px, y: py, label: P}
  - {x: qx, y: qy, label: Q}
:::
```
