# Markdown Syntax - Piattaforma Corsi

Guida completa alla sintassi markdown estesa per creare corsi interattivi.

## Struttura Base

### Metadata Step

Ogni step inizia con metadata YAML (righe con `>`):

```markdown
> id: nome-step
> title: Titolo Step

Contenuto dello step...
```

**Campi metadata disponibili:**
- `id`: Identificativo univoco dello step (obbligatorio)
- `title`: Titolo visualizzato nella sidebar
- Altri campi custom a piacere

### Separatore Step

Gli step sono separati da `---` su riga singola:

```markdown
> id: step1
> title: Primo Step

Contenuto...

---

> id: step2
> title: Secondo Step

Altro contenuto...
```

## Elementi Interattivi

### 1. Blanks (Fill-in-the-blank)

#### Input Testuale

Sintassi: `[[risposta]]`

```markdown
Quanto fa 2 + 2? [[4]]
```

**Caratteristiche:**
- Validazione case-insensitive
- Feedback visivo (verde/rosso)
- Conta come goal per il tracking

#### Scelta Multipla

Sintassi: `[[opzione1|*opzione_corretta|opzione3]]`

```markdown
Quale è il risultato? [[2|3|*4|5]]
```

**Caratteristiche:**
- Bottoni cliccabili
- Risposta corretta indicata con `*` (se omesso, la prima opzione è corretta)
- Feedback immediato
- Validazione automatica

**Esempi:**

```markdown
<!-- Con asterisco (consigliato) -->
Quale operazione? [[Addizione|*Moltiplicazione|Divisione]]

<!-- Senza asterisco (prima opzione corretta) -->
Vero o falso? [[Vero|Falso]]
```

**Esempio completo:**

```markdown
> id: esercizi-base
> title: Esercizi Base

# Algebra Base

Risolvi: Se `2x = 10`, allora `x =` [[5]]

Scelta multipla: `3 × 4 =` [[10|11|*12|13]]

:::div.reveal
Ottimo lavoro! Hai completato gli esercizi.
:::
```

### 2. Variables (Sliders Interattivi)

Sintassi: `${display}{bind|initial|min,max,step}`

**Parametri:**
- `display`: Testo visualizzato
- `bind`: Nome variabile nel modello
- `initial`: Valore iniziale
- `min,max,step`: Range e incremento

```markdown
Muovi lo slider: ${a}{a|2|-5,5,1}

Il valore corrente è ${a}.
```

**Esempi:**

```markdown
# Slider da 0 a 10
Valore intero: ${n}{n|0|0,10,1}

# Slider decimale
Valore decimale: ${x}{x|0.5|0,1,0.1}

# Slider negativo-positivo
Da negativo a positivo: ${k}{k|0|-100,100,5}
```

**Uso in formule:**

```markdown
Modifica `a`: ${a}{a|2|-5,5,1}

L'equazione diventa: `x^2 + ${a}x + 1 = 0`
```

**Input editabile a mano (senza slider):**

Usa la parola chiave `input` al posto del range per ottenere un campo numerico
digitabile invece dello slider. Utile nelle celle di tabella (es. coordinate x-y).

```markdown
Sintassi: ${display}{bind|initial|input}

| Punto | x | y |
| ----- | - | - |
| A | ${ax}{ax|1|input} | ${ay}{ay|1|input} |
```

L'input scrive nel modello e aggiorna i grafici collegati esattamente come lo slider.

### 3. Check (Verifica Condizioni)

Sintassi: `[Etichetta]{check: condizione}`

Crea un bottone che verifica una condizione sulle variabili del modello (slider). Conta come goal per il tracking.

**Parametri:**
- `Etichetta`: Testo del bottone (es. "Verifica")
- `condizione`: Espressione booleana sulle variabili (es. `m == 4`, `a + b == 6`)

```markdown
Porta lo slider su 4: ${m}{m|1|0,10,1}

[Verifica]{check: m == 4}
```

**Caratteristiche:**
- Feedback immediato ("Esatto! ✓" / "Riprova!")
- Emette `goal-complete` quando la condizione è verificata
- Supporta espressioni con più variabili: `[Controlla]{check: a + b == 6}`

### 4. Grafici Interattivi

Sintassi: blocco `:::graph` con configurazione YAML.

```markdown
:::graph
type: function
expr: "sin(a * x)"
bind: a
xrange: "-7,7"
yrange: "-2,2"
:::
```

**Tipi disponibili:**
- `type: function` - Curva `y = f(x)`, opzionalmente collegata a slider con `bind`
- `type: point` - Punto singolo trascinabile con coordinata obiettivo (`target`)
- `type: points` - Punti multipli trascinabili, con snap, verifica esplicita e curva di sfondo
- `type: boundpoints` - Punti le cui coordinate provengono da variabili del modello
  (es. input editabili in una tabella). Si ridisegnano live; `connect: true` li unisce
  con una spezzata. Non trascinabili.

I grafici con `target` generano automaticamente un goal per il tracking.

**Esempio `boundpoints` (tabella x-y → piano cartesiano):**

```markdown
| Punto | x | y |
| ----- | - | - |
| A | ${ax}{ax|1|input} | ${ay}{ay|1|input} |
| B | ${bx}{bx|3|input} | ${by}{by|4|input} |

:::graph
type: boundpoints
xrange: "-6,6"
yrange: "-6,6"
connect: true
points:
  - {x: ax, y: ay, label: A}
  - {x: bx, y: by, label: B}
:::
```

📖 **Documentazione completa**: vedi [GRAFICI.md](GRAFICI.md) per tutti gli attributi ed esempi.

### 5. Blocchi Custom

Sintassi: `:::tag.class1.class2`

```markdown
:::div.highlight
Questo è un blocco evidenziato
:::
```

**Classi predefinite:**
- `.highlight` - Box evidenziato giallo
- `.reveal` - Nascosto fino a completamento goals

**Esempi:**

```markdown
# Box evidenziato
:::div.highlight
💡 **Suggerimento**: Usa questa formula!
:::

# Contenuto reveal
:::div.reveal
🎉 Congratulazioni! Hai completato tutto!
:::

# Blocchi annidati
:::div.container
  :::div.highlight
  Contenuto interno
  :::
:::
```

### 6. Reveal Content

Il contenuto con classe `.reveal` appare solo quando tutti i goals dello step sono completati.

```markdown
> id: esercizio
> title: Esercizio

Completa: 2 + 2 = [[4]]
Completa: 3 × 3 = [[9]]

:::div.reveal
# Ottimo lavoro!

Hai completato entrambi gli esercizi. Ora puoi procedere!
:::
```

## Formule Matematiche

### Inline Math

Sintassi: `` `formula` ``

```markdown
L'equazione `x^2 + y^2 = r^2` descrive un cerchio.
```

### Display Math

Sintassi: `$$formula$$`

```markdown
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

### Sintassi Supportata

MathJax supporta sia LaTeX che AsciiMath:

**LaTeX:**
```markdown
`\frac{a}{b}` → a/b (frazione)
`\sum_{i=1}^n` → sommatoria
`\int_a^b` → integrale
`\sqrt{x}` → radice quadrata
```

**AsciiMath (più semplice):**
```markdown
`x^2` → x al quadrato
`sqrt(x)` → radice quadrata
`sum_(i=1)^n` → sommatoria
```

### Esempi Completi

```markdown
# Teorema di Pitagora

In un triangolo rettangolo, `a^2 + b^2 = c^2`.

Qual è `c` se `a = 3` e `b = 4`? [[5]]

## Formula Quadratica

La formula risolutiva è:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

Trova le radici di `x^2 - 5x + 6 = 0`:

Prima radice: [[2]]
Seconda radice: [[3]]
```

## Markdown Standard

Tutti gli elementi markdown standard sono supportati:

### Titoli

```markdown
# H1 - Titolo Principale
## H2 - Sottotitolo
### H3 - Sezione
```

### Testo

```markdown
**grassetto**
*corsivo*
***grassetto e corsivo***
~~barrato~~
`codice inline`
```

### Liste

```markdown
# Lista non ordinata
- Item 1
- Item 2
  - Sub-item

# Lista ordinata
1. Primo
2. Secondo
3. Terzo
```

### Link

```markdown
[Testo link](https://example.com)
```

### Immagini

```markdown
![Alt text](path/to/image.png)
```

**Resize (sintassi Obsidian):**

```markdown
![Alt|400](image.png)        <!-- larghezza 400px, altezza proporzionale -->
![Alt|400x300](image.png)    <!-- larghezza 400px, altezza 300px -->
```

### Citazioni

```markdown
> Questa è una citazione
> su più righe
```

### Codice

````markdown
```python
def hello():
    print("Hello World!")
```
````

### Tabelle

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

## Esempi Completi

### Corso Algebra Base

```markdown
> id: intro
> title: Introduzione

# Benvenuto all'Algebra!

L'algebra usa lettere per rappresentare numeri. Semplice, vero?

Primo esercizio: `x + 3 = 7`, quindi `x =` [[4]]

:::div.reveal
Perfetto! Hai capito il concetto base.
:::

---

> id: equazioni-lineari
> title: Equazioni Lineari

# Risolvere Equazioni

Un'equazione è come una bilancia in equilibrio.

## Esercizio 1

Risolvi: `2x = 8`

Risposta: `x =` [[4]]

## Esercizio 2

Risolvi: `3y + 5 = 14`

Risposta: `y =` [[3]]

:::div.reveal
Eccellente! Hai imparato a risolvere equazioni lineari.
:::

---

> id: variabili-dinamiche
> title: Variabili Dinamiche

# Esplorare con Sliders

Modifica il valore di `m`: ${m}{m|1|-3,3,0.5}

L'equazione della retta è: `y = ${m}x + 2`

:::div.highlight
💡 Osserva come cambia la pendenza al variare di `m`!
:::

---

> id: sfida-finale
> title: Sfida Finale

# Metti alla Prova le tue Abilità

Sistema di equazioni:
- `x + y = 10`
- `x - y = 2`

Trova `x`: [[6]]
Trova `y`: [[4]]

Modifica `k`: ${k}{k|1|1,5,1}

Verifica: `k × 6 = ` [[risultato-dipende-da-k]]

:::div.reveal
# 🎉 Completato!

Hai finito il corso di Algebra Base!

**Prossimi passi:**
- Equazioni quadratiche
- Sistemi di equazioni
- Geometria analitica
:::
```

## Best Practices

### 1. Goals Bilanciati

Non troppi goal per step (ideale: 2-4):

```markdown
<!-- ✓ BUONO -->
Esercizio 1: [[risposta1]]
Esercizio 2: [[risposta2]]

<!-- ✗ TROPPI -->
[[a]] [[b]] [[c]] [[d]] [[e]] [[f]] [[g]] [[h]]
```

### 2. Feedback Progressivo

Usa reveal per dare feedback:

```markdown
Risolvi: [[risposta]]

:::div.reveal
Ottimo! Ora prova questo: [[prossimo]]
:::
```

### 3. Sliders Significativi

Usa range sensati:

```markdown
<!-- ✓ BUONO -->
Probabilità (0-1): ${p}{p|0.5|0,1,0.1}

<!-- ✗ TROPPO AMPIO -->
Numero: ${n}{n|0|-1000000,1000000,0.00001}
```

### 4. Metadata Descrittivi

Usa titoli chiari:

```markdown
<!-- ✓ BUONO -->
> id: introduzione-algebra
> title: Introduzione all'Algebra

<!-- ✗ VAGO -->
> id: step1
> title: Step 1
```

## Troubleshooting

### Goals Non Rilevati

Assicurati che gli elementi abbiano ID univoci (generati automaticamente).

### Reveal Non Appare

Controlla che tutti i goals dello step siano completati.

### Math Non Renderizza

Verifica la sintassi LaTeX. Usa [MathJax Live Demo](https://www.mathjax.org/#demo) per testare.

### Metadata Non Parsato

Le righe metadata devono:
- Iniziare con `>`
- Essere all'inizio dello step (prima del contenuto)
- Avere YAML valido

## Riferimenti

- [MathJax Documentation](https://docs.mathjax.org/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Web Components Guide](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
