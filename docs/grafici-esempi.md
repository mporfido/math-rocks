# Grafici — sei scenari pronti

Blocchi completi da copiare e adattare. La spiegazione delle chiavi è in
[grafici.md](grafici.md).

## 1. Funzione con slider — esplorare l'effetto di un parametro

```markdown
Modifica `a` per vedere come cambia il periodo:

Valore di `a`: ${a}{a|1|0.5,4,0.5}

:::graph
expr: "sin(a * x)"
bind: a
xrange: "-7,7"
yrange: "-2,2"
:::
```

## 2. Retta — due parametri

```markdown
Pendenza `m`: ${m}{m|1|-3,3,0.5}
Intercetta `b`: ${b}{b|0|-5,5,1}

:::graph
expr: "m * x + b"
bind: [m, b]
xrange: "-10,10"
yrange: "-10,10"
:::
```

## 3. Posizionare un punto su una coordinata

```markdown
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

## 4. Punti multipli con obiettivi visibili

`targets: true` mostra dove andare (pallini verdi); `verify: true` sposta il
controllo su un bottone, così lo studente decide quando dichiararsi pronto.

```markdown
Posiziona i punti dove indicato:

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

## 5. Prevedere come continua una funzione

`xclip` disegna la curva solo fino a dove vuoi mostrarla; i `points` chiedono
allo studente dove prosegue.

```markdown
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

## 6. Curva animata + punti da una tabella x-y

Due layer insieme: la retta segue lo slider, i punti seguono i campi della
tabella. `connect: true` li unisce con una spezzata.

```markdown
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

## 7. Un punto che scorre lungo la curva

Coordinata `y` come **espressione** della variabile: il punto resta incollato al
grafico mentre lo slider si muove.

```markdown
${a}{a|-2|-3,3,0.01}

:::graph
xrange: "-3,3"
yrange: "-1,8"
bind: a
functions:
  - expr: "2^x"
boundpoints:
  - {x: a, y: "2^a", label: "il tuo punto"}
:::
```

---

**Vedi anche**: [grafici.md](grafici.md) per il riferimento delle chiavi ·
[variabili.md](variabili.md) per slider e campi numerici.

**Nel corso demo**: `content/esempi/content-2.md` — lezione "Componenti grafici",
che percorre gli stessi scenari dal vivo.
