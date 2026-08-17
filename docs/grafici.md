# Grafici interattivi — `:::graph`

Un piano cartesiano nel markdown, configurato in YAML. Le capacità sono **layer
componibili**: ogni layer si attiva con la presenza della sua chiave, e tutti
possono coesistere nello stesso piano. Non si dichiara un "tipo" di grafico.

```
:::graph
xrange: "-10,10"      # asse X (default: -10,10)
yrange: "-7,7"        # asse Y (default: -7,7)
ticks: 1              # passo delle tacche (default: 1)
xticks: 1             # passo solo sull'asse X (vince su ticks)
yticks: 100           # passo solo sull'asse Y (vince su ticks)
aspect: free          # assi con scale indipendenti (default: equiscalati)
bind: a               # variabili del modello che ridisegnano il grafico

functions:            # layer curve
  - expr: "sin(a*x)"

points:               # layer punti obiettivo trascinabili
  - target: "3,2"

boundpoints:          # layer punti legati a variabili del modello
  - {x: ax, y: ay, label: A}
:::
```

I tre layer in una riga:

| Layer | Cos'è | Goal? |
| --- | --- | :---: |
| `functions` | curve `y = f(x)`, anche animate da uno slider | no |
| `points` | punti che lo studente trascina su una coordinata obiettivo | sì |
| `boundpoints` | punti le cui coordinate vengono dal modello, non trascinabili | no |

---

## Layer `functions` — curve

**Chiavi di ogni elemento:**

| Chiave | Tipo | Obbl. | Descrizione |
| --- | --- | :---: | --- |
| `expr` | stringa | sì | Espressione in `x` (es. `"sin(x)"`, `"x^2 - 3"`) |
| `xclip` | `"min,max"` | no | Limita il dominio disegnato della curva |
| `color` | stringa | no | Colore (default: rotazione rosso, blu, verde, arancio) |

**Chiavi top-level collegate:**

| Chiave | Tipo | Descrizione |
| --- | --- | --- |
| `bind` | stringa / lista | Variabile/i da osservare (`a` oppure `[a, b]`): al loro cambio la curva si ridisegna |
| `expr` | stringa | Scorciatoia per una sola curva: equivale a `functions: [{expr: …}]` (accetta anche `xclip` top-level) |

Curva collegata a uno slider — prima si definisce la variabile nel testo dello
step (vedi [variabili.md](variabili.md)), poi la si dichiara in `bind`:

```markdown
Valore di `a`: ${a}{a|1|0.5,4,0.5}

:::graph
expr: "sin(a * x)"
bind: a
xrange: "-7,7"
yrange: "-2,2"
:::
```

Più curve, più slider:

```
:::graph
bind: [a, b]
functions:
  - expr: "a * x + b"
  - expr: "x^2"
    color: "#999999"
:::
```

**Funzioni disponibili nelle espressioni:**

| Sintassi | Significato | | Sintassi | Significato |
| --- | --- | --- | --- | --- |
| `x^2` | potenza | | `sin` `cos` `tan` | trigonometriche |
| `sqrt(x)` | radice quadrata | | `asin` `acos` `atan` | inverse |
| `abs(x)` | valore assoluto | | `exp(x)` | esponenziale eˣ |
| `pi` | π | | `log(x)` | logaritmo naturale |

---

## Layer `points` — punti obiettivo trascinabili

Punti che lo studente trascina nelle posizioni indicate, etichettati
automaticamente A, B, C, … Quando tutti quelli con `target` sono corretti il
grafico emette `goal-complete`.

**Chiavi di ogni elemento:**

| Chiave | Tipo | Descrizione |
| --- | --- | --- |
| `target` | `"x,y"` | Coordinata obiettivo (i punti senza `target` restano liberi) |
| `snap` | numero | Snap di questo punto (sovrascrive quello globale) |
| `tolerance` | numero | Raggio di tolleranza attorno al target (default: 1% della somma delle coordinate) |

**Chiavi top-level collegate:**

| Chiave | Tipo | Descrizione |
| --- | --- | --- |
| `snap` | numero | Griglia di scatto globale (`1` = interi, `0.5` = mezzi) |
| `verify` | bool | Richiede un click su "Verifica" invece del controllo automatico |
| `coords` | bool | Mostra le coordinate live accanto ai punti (default `false`) |
| `targets` | bool | Mostra gli obiettivi come pallini verdi semitrasparenti (default `false`) |

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

---

## Layer `boundpoints` — punti legati al modello

Coordinate che vengono da variabili dello step (campi di una tabella, slider).
Si ridisegnano in tempo reale, non sono trascinabili, non generano goal.

**Chiavi di ogni elemento:**

| Chiave | Tipo | Obbl. | Descrizione |
| --- | --- | :---: | --- |
| `x` | nome di variabile, numero **o espressione** | sì | Ascissa |
| `y` | nome di variabile, numero **o espressione** | sì | Ordinata |
| `label` | stringa | no | Etichetta (default: A, B, C, …) |

Una coordinata **fissa** serve quando è l'autore a decidere dove sta il punto su
un asse e lo studente riempie solo l'altro: in una tabella "esponente → valore"
le ascisse sono già scritte nella prima colonna.

Un'**espressione** (stessa sintassi di `expr`) serve quando una coordinata si
calcola dall'altra, tipicamente per far scorrere un punto lungo una curva:

```markdown
${a}{a|-2|-3,3,0.01}

:::graph
functions:
  - expr: "2^x"
boundpoints:
  - {x: a, y: "2^a", label: "il tuo punto"}
:::
```

Scrivi l'espressione **fra virgolette**: `2^a` senza virgolette è comunque letto
come stringa, ma `{y: 1/n}` no.

Finché la variabile è vuota (`${y}{y||input}`, campo mai compilato) il punto
**non viene disegnato**: non finisce in $(x, 0)$, che sarebbe un suggerimento.

**Chiave top-level collegata:**

| Chiave | Tipo | Descrizione |
| --- | --- | --- |
| `connect` | bool | Unisce i punti consecutivi con una spezzata |

---

## Combinare i layer

I layer sono indipendenti e si usano insieme nello stesso blocco:

- `functions` + `points` — posizionare punti su una curva, anche animata da uno slider;
- `functions` + `boundpoints` — una retta che si muove e i punti di una tabella
  x-y (esempio completo in [grafici-esempi.md](grafici-esempi.md));
- `points` + `boundpoints` — confrontare punti calcolati con punti da posizionare.

## Obiettivi (goal tracking)

- Ogni grafico con almeno un `target` genera automaticamente **un** goal.
- Quando tutti i suoi punti sono corretti emette `goal-complete`; completati
  tutti i goal dello step, i blocchi `:::div.reveal` diventano visibili.
- Con **`verify: true`**: appare un pulsante "Verifica", tutti i punti devono
  essere corretti simultaneamente al click, e se qualcuno sbaglia lampeggiano
  *tutti* in rosso — senza rivelare quali erano giusti.
- In **modalità automatica** (default): il controllo avviene a ogni
  trascinamento e ogni punto diventa verde appena è a posto.

`functions` e `boundpoints` sono esplorativi. Per farne un esercizio usa
`[Testo]{check: condizione}` (vedi [variabili.md](variabili.md)).

## Il piano cartesiano

La vista è **ferma**: la finestra visibile è quella di `xrange`/`yrange`, e le
domande possono contarci ("sopra $x = 0$ c'è un pezzo di curva?"). Assi e griglia
sono sempre visibili. Su mobile uno swipe verticale che parte dal grafico scrolla
la pagina; il trascinamento dei punti di `points` funziona comunque.

| Chiave | Tipo | Default | Descrizione |
| --- | --- | --- | --- |
| `ticks` | numero | `1` | Passo delle tacche su entrambi gli assi |
| `xticks` | numero | come `ticks` | Passo solo sull'asse X |
| `yticks` | numero | come `ticks` | Passo solo sull'asse Y |
| `aspect` | `free` | equiscalati | Libera le scale dei due assi |
| `navigate` | `true` | vista ferma | Riattiva pan (trascinando), zoom (Shift+rotella, pinch) e la barra di navigazione in basso a destra |

### Quando serve `navigate: true`

Solo se **esplorare la vista è il compito**: cercare un'intersezione fuori dalla
finestra, zoomare per contare le oscillazioni. Il prezzo si paga su mobile,
dove quel grafico ricomincia a catturare lo swipe verticale: se lo studente deve
solo *leggere* il piano, lascialo fermo e scegli meglio `xrange`/`yrange`.

### Quando serve `aspect: free`

Di default l'unità sull'asse $x$ e quella sull'asse $y$ hanno la **stessa
lunghezza in pixel**: un cerchio è rotondo e una pendenza è quella che sembra.
Per ottenerlo JSXGraph non si limita alla boundingbox richiesta, la **allarga**
finché le proporzioni tornano.

Va benissimo finché le due grandezze sono omogenee. Non va più bene quando sui
due assi ci sono cose diverse — mesi ed euro, anni e abitanti: chiedere
`xrange: "-0.5,5"` con `yrange: "-1,1100"` significa chiedere un rapporto di 1 a
200, e il grafico si schiaccia in una linea piatta contro l'asse.

Lì si dichiara `aspect: free`: la boundingbox viene rispettata alla lettera.
Quasi sempre serve anche un passo di tacche diverso per asse, altrimenti un asse
$y$ da 0 a 1100 con passo 1 produce un migliaio di etichette.

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

> ⚠️ Con `aspect: free` una distanza sull'asse $x$ e la stessa distanza
> sull'asse $y$ non si somigliano più, quindi la `tolerance` di default (una
> soglia unica, in unità del modello) risulta generosa su un asse e severa
> sull'altro. Se combini `aspect: free` e punti trascinabili, indica una
> `tolerance` esplicita.

---

**Vedi anche**: [grafici-esempi.md](grafici-esempi.md) per sei scenari pronti da
copiare · [variabili.md](variabili.md) per gli slider e i campi che alimentano
`bind` e `boundpoints`.

**Nel corso demo**: `content/esempi/content-2.md` — step `grafico-funzione`,
`posiziona-punti`, `prevedi-continuazione`, `tabella-xy`, `punti-su-retta`.
