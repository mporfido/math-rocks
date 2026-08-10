# Variabili — slider, campi numerici, calcoli live

Ogni step ha un **modello**: un insieme di variabili con nome. Uno slider o un
campo numerico ci scrive dentro; il testo, le formule, i grafici e gli sketch lo
leggono e si aggiornano da soli.

## Definire una variabile

```
${display}{bind|initial|min,max,step}
```

| Parametro | Significato |
| --- | --- |
| `display` | Testo mostrato accanto al controllo |
| `bind` | Nome della variabile nel modello |
| `initial` | Valore iniziale (default `0`; **vuoto** = "non ancora inserito") |
| `min,max,step` | Estremi e incremento (default `-10,10,1`) |

```markdown
Muovi lo slider: ${a}{a|2|-5,5,1}

Il valore corrente è ${a}.
```

Esempi di range:

```markdown
Valore intero:    ${n}{n|0|0,10,1}
Valore decimale:  ${x}{x|0.5|0,1,0.1}
Da negativo a positivo: ${k}{k|0|-100,100,5}
```

## Campo numerico digitabile

La parola chiave `input` al posto del range dà un campo da compilare a mano
invece dello slider — utile nelle celle di una tabella x-y:

```markdown
| Punto | x | y |
| ----- | - | - |
| A | ${ax}{ax|1|input} | ${ay}{ay|1|input} |
```

Scrive nel modello e aggiorna i grafici collegati esattamente come lo slider.

Con **iniziale vuoto** (`${y}{y||input}`) il campo parte vuoto e la variabile
vale `NaN`: "non ancora inserito" non è zero. Serve quando il valore diventa un
punto su un grafico, dove un punto in $(x, 0)$ sarebbe una risposta suggerita.

## Leggere una variabile

`${nome}` da solo (senza il secondo gruppo di graffe) stampa il valore corrente,
ricalcolato a ogni movimento. Funziona anche dentro il LaTeX:

```markdown
Modifica `a`: ${a}{a|2|-5,5,1}

L'equazione diventa: `x^2 + ${a}x + 1 = 0`

$$\frac{${n}}{${d}}$$
```

## Calcolo live: `${= espressione}`

Un riferimento che comincia per `=` non stampa una variabile ma il **risultato
di un'espressione** su di esse, ricalcolato a ogni modifica. Niente bottoni di
verifica: è pensato per far vedere una relazione, non per correggerla.

```markdown
Il mio fattore: ${k}{k|1|input}

$$k \cdot k = ${k} \cdot ${k} = ${= k*k}$$
```

- Il risultato è arrotondato alla sesta cifra decimale (niente
  `0.010000000000000002`).
- Finché un campo è vuoto — o l'espressione non è calcolabile — al suo posto
  compare la casella `\square`.
- Le funzioni matematiche (`sqrt`, `sin`, …) richiedono mathjs sulla pagina:
  aggiungi `> use-mathjs: true` ai metadata dello step. Senza, l'espressione è
  valutata in JavaScript puro e vede solo le variabili del modello e gli
  operatori aritmetici.

## Verificare una condizione: `[Etichetta]{check: …}`

Un bottone che controlla una condizione sulle variabili. **È un goal** dello
step (a differenza del calcolo live, che non lo è).

```markdown
Porta lo slider su 4: ${m}{m|1|0,10,1}

[Verifica]{check: m == 4}
```

- Feedback immediato ("Esatto! ✓" / "Riprova!").
- Emette `goal-complete` quando la condizione è vera.
- Regge più variabili: `[Controlla]{check: a + b == 6}`.
- Con `use-mathjs: true` la condizione può usare le funzioni di mathjs.

È il modo di trasformare in esercizio ciò che altrimenti resterebbe
esplorativo: curve, `boundpoints`, calcoli live non generano goal da soli.

## Errori tipici

| Sintomo | Causa |
| --- | --- |
| Lo slider compare come testo `${a}{a\|2\|…}` | Il blocco è dentro un fence di codice (comportamento voluto: serve a documentare) |
| `${a}` stampa sempre il valore iniziale | Hai definito la variabile due volte con `bind` diverso |
| `${= sqrt(x)}` mostra `□` | Manca `> use-mathjs: true` nei metadata dello step |
| Il `check` non scatta mai | Confronto fra decimali: usa `abs(a - 4) < 0.001` invece di `a == 4` |

Usa range sensati: `${p}{p|0.5|0,1,0.1}` si esplora, `${n}{n|0|-1000000,1000000,0.00001}` no.

---

**Vedi anche**: [grafici.md](grafici.md) per `bind` e `boundpoints` ·
[tabelle.md](tabelle.md) per i campi nelle celle · [p5.md](p5.md) per leggere il
modello da uno sketch.

**Nel corso demo**: `content/esempi/content-1.md` — step `variabili-interattive`
e `prova-frazioni`; `content/esempi/content-2.md` — step `doppio-slider-check`
e `tabella-xy`.
