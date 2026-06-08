# Grafici Interattivi — Sintassi e Riferimento

Il componente `<x-graph>` permette di inserire grafici interattivi nei corsi. Si usa nel markdown con il blocco `:::graph ... :::` in formato YAML.

## Struttura base

```
:::graph
type: function        # oppure: point, points
xrange: "-10,10"      # asse X (default: -10,10)
yrange: "-7,7"        # asse Y (default: -7,7)
# ... altri attributi in base al type
:::
```

---

## Tipi di grafico

### `type: function` — Curva matematica

Disegna una funzione `y = f(x)` come linea rossa sul piano cartesiano. Il grafico è esplorativo (pan e zoom abilitati).

| Attributo | Tipo   | Obbligatorio | Descrizione |
|-----------|--------|:------------:|-------------|
| `expr`    | stringa | sì           | Espressione matematica in `x` (es. `"sin(x)"`, `"x^2 - 3"`) |
| `bind`    | stringa / lista | no | Variabile/i slider da collegare (es. `a` oppure `[a, b]`) |
| `xrange`  | `"min,max"` | no | Intervallo asse X (default `-10,10`) |
| `yrange`  | `"min,max"` | no | Intervallo asse Y (default `-7,7`) |

**Esempio — curva semplice:**

```
:::graph
type: function
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
type: function
expr: "sin(a * x)"
bind: a
xrange: "-7,7"
yrange: "-2,2"
:::
```

Con più slider:

```
Parametri: ${a}{a|1|0,3,0.5} e ${b}{b|0|-5,5,1}

:::graph
type: function
expr: "a * x + b"
bind: [a, b]
xrange: "-10,10"
yrange: "-10,10"
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

### `type: point` — Punto singolo trascinabile

Un singolo punto che lo studente può trascinare. Quando raggiunge la posizione corretta (`target`), emette l'evento `goal-complete` e sblocca i blocchi `:::div.reveal`.

| Attributo   | Tipo        | Obbligatorio | Descrizione |
|-------------|-------------|:------------:|-------------|
| `target`    | `"x,y"`     | no           | Coordinata obiettivo |
| `snap`      | numero      | no           | Griglia di scatto (es. `1` = interi, `0.5` = mezzi) |
| `tolerance` | numero      | no           | Raggio di tolleranza attorno al target (default: 1% della somma delle coordinate) |
| `coords`    | bool        | no           | Mostra le coordinate live accanto al punto (default: `false`) |
| `verify`    | bool        | no           | Richiede click su "Verifica" invece di controllo automatico al trascinamento |
| `xrange`    | `"min,max"` | no           | Intervallo asse X |
| `yrange`    | `"min,max"` | no           | Intervallo asse Y |

**Esempio — punto con target e snap:**

```
:::graph
type: point
target: "3,4"
snap: 1
xrange: "-6,6"
yrange: "-6,6"
:::
```

---

### `type: points` — Punti multipli trascinabili

Più punti da posizionare contemporaneamente. I punti vengono etichettati automaticamente A, B, C, …

| Attributo   | Tipo        | Obbligatorio | Descrizione |
|-------------|-------------|:------------:|-------------|
| `points`    | lista YAML  | sì           | Lista di punti, ognuno con le sue opzioni (vedi sotto) |
| `snap`      | numero      | no           | Snap globale per tutti i punti (sovrascrivibile per-punto) |
| `verify`    | bool        | no           | Modalità verifica: richiede click su "Verifica" |
| `coords`    | bool        | no           | Mostra coordinate live su tutti i punti (default: `false`) |
| `targets`   | bool        | no           | Mostra i punti obiettivo come pallini verdi semitrasparenti (default: `false`) |
| `expr`      | stringa     | no           | Curva di sfondo (stessa sintassi di `type: function`) |
| `xclip`     | `"min,max"` | no           | Limita il dominio della curva di sfondo |
| `xrange`    | `"min,max"` | no           | Intervallo asse X |
| `yrange`    | `"min,max"` | no           | Intervallo asse Y |

**Struttura di ogni elemento in `points`:**

```yaml
points:
  - target: "x,y"       # coordinata obiettivo (opzionale)
    snap: 0.5            # snap per questo punto (sovrascrive quello globale)
    tolerance: 0.3       # tolleranza personalizzata
```

**Esempio — tre punti con verifica esplicita:**

```
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
```

**Esempio — punti su una curva di sfondo:**

Utile per chiedere allo studente di prevedere dove si trovano punti della curva:

```
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
```

---

## Comportamento degli obiettivi (goal tracking)

I grafici `type: point` e `type: points` si integrano con il sistema di goal di `<x-step>`:

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

---

## Attributi visivi del piano cartesiano

Tutti i tipi di grafico supportano:

- **Pan**: trascina il piano per spostarlo.
- **Zoom**: usa la rotella del mouse o i controlli di navigazione.
- Gli assi e la griglia sono sempre visibili.
- Il copyright JSXGraph è nascosto automaticamente.

---

## Esempi completi per scenari comuni

### Funzione con slider — esplorare l'effetto di un parametro

```
Modifica `a` per vedere come cambia il periodo:

Valore di `a`: ${a}{a|1|0.5,4,0.5}

:::graph
type: function
expr: "sin(a * x)"
bind: a
xrange: "-7,7"
yrange: "-2,2"
:::
```

### Retta passante per l'origine — due parametri

```
Pendenza `m`: ${m}{m|1|-3,3,0.5}
Intercetta `b`: ${b}{b|0|-5,5,1}

:::graph
type: function
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
type: point
target: "2,3"
snap: 1
coords: true
xrange: "-5,5"
yrange: "-5,5"
:::
```

### Punti multipli con obiettivi visibili

```
Posiziona i punti dove indicato (pallini verdi):

:::graph
type: points
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
type: points
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
