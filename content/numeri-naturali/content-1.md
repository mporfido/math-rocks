> id: introduzione
> title: Introduzione ai numeri naturali
> description: Cosa sono i numeri naturali e a cosa servono.

---

> id: la-semiretta
> title: I numeri naturali sulla retta

# I numeri naturali

I **numeri naturali** sono i numeri che usiamo per contare: 0, 1, 2, 3, … Partono
da **zero** e proseguono **all'infinito**. Possiamo immaginarli come punti ordinati
su una **semiretta**: una linea che ha un inizio (lo 0) ma non ha fine.

L'insieme dei numeri naturali si indica con il simbolo $\mathbb{N} = \left\lbrace 0, 1, 2, 3, 4, \dots \right\rbrace$

:::div.highlight
👆 **Esplora la semiretta**: passa il mouse (o tocca con il dito) sui pallini per
scoprire il **precedente** e il **successivo** di ogni numero. Poi prova a toccare
il segmento colorato tra **0 e 1**.
:::

:::p5 height=260
// Semiretta dei numeri naturali: punti 0..5, poi tratteggio "continua".
// Pura visualizzazione interattiva (hover desktop + tap mobile).

const N = 5;                 // ultimo numero "etichettato"
const dotR = 9;              // raggio dei pallini
const hitR = 22;            // raggio di "aggancio" per hover/tap
let x0, y0, unit;            // origine (0) e passo tra interi
let active = null;          // { type: 'dot'|'unit', n } elemento evidenziato
let touchPos = null;        // ultima posizione da tocco (mobile)

// Colori
const COL_AXIS = '#37474F';
const COL_DOT = '#4CAF50';
const COL_DOT_HI = '#1B5E20';
const COL_UNIT = '#FF7043';   // segmento unità 0-1, colore diverso
const COL_TXT = '#263238';

function layout() {
  const marginL = 48;
  const marginR = 56;          // spazio per il tratteggio dopo il 5
  y0 = ctx.height * 0.55;
  x0 = marginL;
  unit = (ctx.width - marginL - marginR) / (N + 1); // un passo extra per il tratto
}

function numX(n) { return x0 + n * unit; }

p.setup = () => {
  p.createCanvas(ctx.width, ctx.height);
  layout();
  p.textFont('sans-serif');
};

// Trova l'elemento sotto la posizione (px, py)
function pick(px, py) {
  // Pallini 0..N
  for (let n = 0; n <= N; n++) {
    if (p.dist(px, py, numX(n), y0) < hitR) return { type: 'dot', n };
  }
  // Segmento unità tra 0 e 1 (vicino all'asse)
  if (px > numX(0) && px < numX(1) && Math.abs(py - y0) < 16) {
    return { type: 'unit' };
  }
  return null;
}

function drawArrowTip(x, y) {
  p.push();
  p.stroke(COL_AXIS);
  p.strokeWeight(2);
  p.line(x, y, x - 9, y - 5);
  p.line(x, y, x - 9, y + 5);
  p.pop();
}

// Fumetto con testo, ancorato sopra (ax, ay), con clamp ai bordi
function drawBalloon(ax, ay, lines) {
  p.push();
  p.textSize(13);
  let w = 0;
  for (const ln of lines) w = Math.max(w, p.textWidth(ln));
  const padX = 12, padY = 9, lh = 17;
  const bw = w + padX * 2;
  const bh = lines.length * lh + padY * 2 - 3;
  let bx = ax - bw / 2;
  let by = ay - bh - 16;
  bx = p.constrain(bx, 6, ctx.width - bw - 6);
  if (by < 6) by = ay + 18; // se non c'è spazio sopra, sotto
  // codina
  p.noStroke();
  p.fill('#263238');
  p.rect(bx, by, bw, bh, 8);
  p.triangle(ax - 6, by + bh, ax + 6, by + bh, ax, by + bh + 9);
  p.fill('#FFFFFF');
  p.textAlign(p.LEFT, p.TOP);
  lines.forEach((ln, i) => p.text(ln, bx + padX, by + padY + i * lh));
  p.pop();
}

function balloonFor(a) {
  if (a.type === 'unit') {
    return [
      "Unità di misura",
      "La distanza da 0 a 1 è l'unità.",
      "Ripetendola trovi tutti i numeri.",
    ];
  }
  const n = a.n;
  if (n === 0) {
    return [
      "Il numero 0",
      "È il più piccolo: non ha precedente.",
      "Successivo: 1",
    ];
  }
  return [
    "Il numero " + n,
    "Precedente: " + (n - 1),
    "Successivo: " + (n + 1),
  ];
}

p.draw = () => {
  p.background('#F7FBF7');
  layout();

  // Posizione del puntatore: tocco (se presente) o mouse
  const px = touchPos ? touchPos.x : p.mouseX;
  const py = touchPos ? touchPos.y : p.mouseY;
  const inside = px >= 0 && px <= ctx.width && py >= 0 && py <= ctx.height;
  active = inside ? pick(px, py) : null;

  // Asse principale 0 -> 5
  p.stroke(COL_AXIS);
  p.strokeWeight(3);
  p.line(numX(0), y0, numX(N), y0);

  // Tratteggio dopo il 5 (la semiretta continua)
  p.push();
  p.strokeWeight(3);
  p.stroke(COL_AXIS);
  p.drawingContext.setLineDash([6, 6]);
  p.line(numX(N), y0, numX(N) + unit, y0);
  p.drawingContext.setLineDash([]);
  p.pop();
  drawArrowTip(numX(N) + unit, y0);
  p.noStroke();
  p.fill(COL_TXT);
  p.textSize(16);
  p.textAlign(p.LEFT, p.CENTER);
  p.text('…', numX(N) + unit + 8, y0 - 2);

  // Segmento unità 0-1 evidenziato
  const unitHot = active && active.type === 'unit';
  p.stroke(COL_UNIT);
  p.strokeWeight(unitHot ? 7 : 5);
  p.line(numX(0), y0, numX(1), y0);
  // graffa/etichetta "1 unità"
  p.noStroke();
  p.fill(COL_UNIT);
  p.textSize(11);
  p.textAlign(p.CENTER, p.BOTTOM);
  p.text('unità', (numX(0) + numX(1)) / 2, y0 - 12);

  // Pallini ed etichette 0..N
  for (let n = 0; n <= N; n++) {
    const x = numX(n);
    const hot = active && active.type === 'dot' && active.n === n;
    // tacca
    p.stroke(COL_AXIS);
    p.strokeWeight(2);
    p.line(x, y0 - 6, x, y0 + 6);
    // pallino
    p.noStroke();
    if (hot) {
      p.fill(COL_DOT_HI);
      p.circle(x, y0, dotR * 2 + 8); // alone
    }
    p.fill(hot ? COL_DOT_HI : COL_DOT);
    p.circle(x, y0, dotR * 2);
    // numero
    p.fill(COL_TXT);
    p.textSize(15);
    p.textAlign(p.CENTER, p.TOP);
    p.textStyle(hot ? p.BOLD : p.NORMAL);
    p.text(n, x, y0 + 14);
    p.textStyle(p.NORMAL);
  }

  // Balloon dell'elemento attivo
  if (active) {
    const ax = active.type === 'unit' ? (numX(0) + numX(1)) / 2 : numX(active.n);
    drawBalloon(ax, y0 - dotR - 4, balloonFor(active));
  }
};

// Touch: aggiorna la posizione attiva e impedisce lo scroll sul canvas
p.touchStarted = () => {
  if (p.touches && p.touches.length) touchPos = { x: p.touches[0].x, y: p.touches[0].y };
  else touchPos = { x: p.mouseX, y: p.mouseY };
  return false;
};
p.touchMoved = () => {
  if (p.touches && p.touches.length) touchPos = { x: p.touches[0].x, y: p.touches[0].y };
  return false;
};
// Tornato il mouse in uso: abbandona la posizione "bloccata" dal tocco così
// l'hover col mouse torna a funzionare dopo aver toccato lo schermo.
p.mouseMoved = () => { touchPos = null; };
:::

---

> id: ordine
> title: L'ordine dei numeri naturali

# I numeri naturali sono ordinati

Sulla retta ogni numero ha una **posizione precisa**: più ci spostiamo verso
**destra**, più i numeri **crescono**; più andiamo verso **sinistra**, più
**diminuiscono**. Per questo diciamo che l'insieme $\mathbb{N}$ è **ordinato**:
presi due numeri qualsiasi, possiamo sempre dire quale viene prima.

Per confrontarli usiamo due simboli:

- il simbolo **minore** `<` : `3 < 5` si legge "3 è **minore** di 5";
- il simbolo **maggiore** `>` : `8 > 2` si legge "8 è **maggiore** di 2".

:::div.highlight
💡 **Trucco**: il simbolo si apre sempre verso il numero **più grande** e si
chiude (la punta) verso quello **più piccolo**.
:::

## Esercizio 1: inserisci il simbolo giusto

Scegli dal menu il simbolo corretto (`<` o `>`) tra i due numeri:

- `4` [[select: <|*>]] `1`
- `2` [[select: *<|>]] `7`
- `9` [[select: <|*>]] `6`
- `0` [[select: *<|>]] `5`

## Esercizio 2: il successivo

Il **successivo** di un numero è quello che lo segue subito sulla retta (cioè
il numero $+1$).

- Il successivo di `6` è [[7]]
- Il successivo di `9` è [[10]]
- Il successivo di `0` è [[1]]

## Esercizio 3: il precedente

Il **precedente** di un numero è quello che lo precede subito sulla retta (cioè
il numero $-1$). Ricorda: lo **0 non ha precedente**!

- Il precedente di `4` è [[3]]
- Il precedente di `10` è [[9]]
- Il precedente di `1` è [[0]]

:::div.reveal
🎉 **Ottimo!** Hai capito che i numeri naturali sono ordinati: ognuno ha un
successivo, e tutti tranne lo 0 hanno un precedente. Con i simboli `<` e `>`
puoi confrontare due numeri qualsiasi.
:::

---

> id: ordine-operazioni
> title: L'ordine delle operazioni

# In che ordine si calcola?

Quando in un'espressione ci sono **più operazioni**, l'ordine in cui le svolgiamo
**cambia il risultato**. Prendiamo:

$$2 + 3 \times 4$$

- Se calcoliamo **da sinistra** facendo prima la somma: $2 + 3 = 5$ e poi
  $5 \times 4 = 20$.
- Se facciamo prima la **moltiplicazione**: $3 \times 4 = 12$ e poi $2 + 12 = 14$.

Due risultati diversi per la **stessa** espressione! Per non fare confusione, i
matematici si sono messi d'accordo su una **regola valida per tutti**:

:::div.highlight
🔑 **La regola della precedenza**: prima si svolgono le **moltiplicazioni** ($\times$)
e le **divisioni** ($\div$), poi le **addizioni** ($+$) e le **sottrazioni** ($-$).

Quindi $2 + 3 \times 4 = 14$ è il risultato corretto.
:::

Ora prova tu con il metodo "a nodi": **clicca l'operazione** che si può svolgere
(quella con la precedenza più alta) e inserisci il risultato. Il nodo "scende" di un livello e
diventa un nuovo operando.

:::div.highlight
ℹ️ Nel riquadro la moltiplicazione è scritta con un puntino `·` (quindi `3 · 4`
vuol dire $3 \times 4$) e la divisione con i due punti `:` (quindi `6 : 2` vuol
dire $6 \div 2$).
:::

Comincia: la moltiplicazione va risolta **prima** della somma.

:::expr
2 + 3 * 4
:::

Anche qui la moltiplicazione viene prima della sottrazione:

:::expr
10 - 2 * 3
:::

E la divisione viene prima dell'addizione:

:::expr
4 + 6 : 2
:::

Adesso ce ne sono due ad alta precedenza: svolgi prima `5 · 2` e `8 : 4`, poi la
somma.

:::expr
5 * 2 + 8 : 4
:::

:::div.reveal
🎉 **Bravo!** Hai applicato la regola della precedenza: prima `×` e `÷`, poi `+` e
`−`. Così tutti, calcolando la stessa espressione, ottengono lo **stesso** risultato.
:::

---

> id: stessa-precedenza
> title: Operazioni con la stessa precedenza

# E se hanno la stessa precedenza?

La regola di prima dice cosa fare quando le operazioni sono **diverse**. Ma se in
fila ci sono operazioni con la **stessa** precedenza — per esempio due sottrazioni?

$$9 - 4 - 2$$

- Partendo **da sinistra**: $9 - 4 = 5$ e poi $5 - 2 = 3$.
- Partendo **da destra**: $4 - 2 = 2$ e poi $9 - 2 = 7$.

Ancora due risultati diversi! Serve una seconda regola:

:::div.highlight
🔑 **Stessa precedenza, da sinistra a destra**: quando le operazioni hanno la
stessa precedenza (somme e sottrazioni tra loro, oppure moltiplicazioni e
divisioni tra loro), si svolgono **nell'ordine in cui sono scritte**, da sinistra
verso destra.

Quindi $9 - 4 - 2 = 3$ è il risultato corretto.
:::

Prova: nel riquadro puoi svolgere solo l'operazione **più a sinistra**.

:::expr
9 - 4 - 2
:::

Somma e sottrazione hanno la stessa precedenza: vai sempre da sinistra.

:::expr
10 - 4 + 3
:::

Vale lo stesso per le divisioni in fila:

:::expr
24 : 4 : 2
:::

Un altro con divisione e moltiplicazione: risolvi `20 : 5` e poi il resto.

:::expr
20 : 5 * 2
:::

:::div.reveal
🎉 **Perfetto!** A parità di precedenza si procede **da sinistra verso destra**.
Insieme alla regola precedente, ora sai mettere in ordine qualsiasi catena di
operazioni.
:::

---

> id: parentesi
> title: Le parentesi

# Le parentesi comandano

E se volessimo davvero fare **prima** la somma e **poi** la moltiplicazione? Esiste
un modo per "scavalcare" la precedenza: le **parentesi**.

Quello che sta **dentro le parentesi** si calcola **per primo**. Guarda la
differenza:

- Senza parentesi: $2 + 3 \times 4 = 2 + 12 = 14$.
- Con le parentesi: $(2 + 3) \times 4 = 5 \times 4 = 20$.

:::div.highlight
🔑 **Le parentesi prima di tutto**: si svolgono per prime le operazioni racchiuse
tra parentesi, poi si applicano le regole di precedenza e da sinistra a destra.
:::

Nel riquadro l'unica operazione "pronta" è quella dentro le parentesi: risolvi
prima `2 + 3`.

:::expr
(2 + 3) * 4
:::

Qui le parentesi cambiano il segno del risultato rispetto a `10 - 4 + 3`:

:::expr
10 - (4 + 3)
:::

Prima la parentesi, poi la divisione:

:::expr
(12 - 2) : 5
:::

Quando ci sono **due** parentesi, sciogli prima entrambe e poi l'operazione che le
collega.

:::expr
(6 - 1) * (2 + 2)
:::

:::div.reveal
🎉 **Ottimo lavoro!** Ora conosci le tre regole per calcolare un'espressione:
**prima le parentesi**, poi **moltiplicazioni e divisioni**, infine **addizioni e
sottrazioni** — e a parità di precedenza si va **da sinistra a destra**.
:::

---

> id: sfide
> title: Le sfide

# Mettiti alla prova

Hai imparato tutte le regole: ora qualche **sfida**, con espressioni un po' più
lunghe. Fin qui hai risolto le espressioni "a nodi", ma esiste anche il modo
**classico**, quello che userai sul quaderno: si svolge **un'operazione alla
volta** e si **riscrive l'espressione più corta** dopo ogni passo, finché resta
un solo numero.

I due metodi vanno **di pari passo**: ogni nodo che risolvi è esattamente
un'operazione del calcolo scritto in colonna.

:::div.highlight
👇 In queste sfide, **sotto** ogni albero compare lo **svolgimento classico**:
risolvi le operazioni sui nodi e guarda l'espressione che si **semplifica riga
per riga**, con il segno `=` incolonnato come sul quaderno.
:::

Comincia con un ripasso: prima la moltiplicazione, poi somma e sottrazione da
sinistra a destra.

:::expr show-steps
8 + 4 * 3 - 5
:::

Qui la parentesi viene prima di tutto, poi la moltiplicazione e infine la
sottrazione.

:::expr show-steps
2 * (3 + 5) - 9
:::

# Le parentesi quadre

A volte un'espressione ha **più livelli** di raggruppamento. Dopo le parentesi
tonde si usano le **parentesi quadre** `[ ]`, che racchiudono gruppi in cui ci
sono già delle tonde.

:::div.highlight
🔑 **Da dentro verso fuori**: si svolge prima ciò che è tra le **tonde**, poi ciò
che è tra le **quadre**. Le quadre, insomma, "aspettano" che le tonde al loro
interno siano già risolte.
:::

Risolvi prima la tonda, poi quello che resta dentro le quadre, e infine la
divisione finale.

:::expr show-steps
[ (8 - 3) * 2 + 4 ] : 7
:::

Anche qui: svuota prima le quadre (partendo dalla tonda dentro di esse), poi fai
la sottrazione esterna.

:::expr show-steps
20 - [ (2 + 3) * 2 + 6 ]
:::

# Le parentesi graffe

Quando i livelli sono **tre**, il più esterno usa le **parentesi graffe** `{ }`.
L'ordine di annidamento, dal di dentro al di fuori, è sempre lo stesso:

:::div.highlight
🔑 **Tonde → quadre → graffe**, cioè $\{\,[\,(\ \dots\ )\,]\,\}$: si svolgono prima
le **tonde**, poi le **quadre**, infine le **graffe**, e solo alla fine le
operazioni rimaste fuori da tutto.
:::

Procedi un livello alla volta, dal più interno al più esterno.

:::expr show-steps
{ [ (3 + 2) * 4 - 5 ] : 3 + 1 } * 2
:::

Ultima sfida: tonde, quadre e graffe tutte insieme. Vai con calma, da dentro
verso fuori.

:::expr show-steps
{ 10 + [ (6 - 2) * 3 - 4 ] } : 2
:::

:::div.reveal
🎉 **Sfida superata!** Ora sai svolgere anche le espressioni a più livelli con
tonde, quadre e graffe — sia con il metodo a nodi, sia con lo svolgimento
classico passo dopo passo. Sono lo stesso ragionamento, scritto in due modi.
:::
