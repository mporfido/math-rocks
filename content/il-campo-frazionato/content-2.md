> id: frazioni-equivalenti
> title: Frazioni equivalenti
> description: Scopriamo quando rapporti diversi rappresentano la stessa quantità

---

> id: frazioni-equivalenti-1
> title: I pannelli solari

Qui sono rappresentati 3 modelli di pannelli solari, i modelli Alfa, Beta e Gamma. Un pannello produce tanta più energia quanta più è la *superficie attiva*, che nel disegno è colorata in blu.

:::p5 width=600 height=260
// Tre pannelli solari, stessa superficie attiva (2/3) suddivisa diversamente.
const PANEL = 144, COLS = 3, FRAME = 6, GAP = 30;
const BG = '#1a1c2c', LIGHT = '#cbd3e0', SHADOW = '#11131f';
const BLUE = '#41a6f6', BLUE_HI = '#7cc4ff', BLUE_LO = '#2a6cb0';
const DARK = '#333c57', DARK_HI = '#46506e', DARK_LO = '#262d44';

// definizione dei pannelli: righe e celle attive ("r,c")
const active = (pairs) => new Set(pairs.map(([r, c]) => r + ',' + c));
const panels = [
  { name: 'ALFA',  rows: 1, on: active([[0,0],[0,1]]) },
  { name: 'BETA',  rows: 2, on: active([[0,0],[0,1],[1,0],[1,1]]) },
  { name: 'GAMMA', rows: 4, on: active([[0,0],[0,2],[1,1],[1,2],[2,0],[2,1],[3,1],[3,2]]) },
];

p.setup = () => {
  p.createCanvas(ctx.width, ctx.height);
  p.noSmooth();
  p.noLoop();
};

function cell(x, y, w, h, base, hi, lo) {
  p.noStroke();
  p.fill(base);
  p.rect(x, y, w, h);
  // bevel 16-bit: highlight in alto/sinistra, ombra in basso/destra
  p.fill(hi); p.rect(x, y, w, 2); p.rect(x, y, 2, h);
  p.fill(lo); p.rect(x, y + h - 2, w, 2); p.rect(x + w - 2, y, 2, h);
}

function panel(px, py, pan) {
  const outer = PANEL + FRAME * 2;
  // ombra portata
  p.noStroke(); p.fill(SHADOW);
  p.rect(px + 5, py + 5, outer, outer);
  // cornice grigio chiaro
  p.fill(LIGHT);
  p.rect(px, py, outer, outer);
  // griglia di celle, a filo (nessuno spazio)
  const gx = px + FRAME, gy = py + FRAME;
  const cw = PANEL / COLS, ch = PANEL / pan.rows;
  for (let r = 0; r < pan.rows; r++) {
    for (let c = 0; c < COLS; c++) {
      const on = pan.on.has(r + ',' + c);
      cell(gx + c * cw, gy + r * ch, cw, ch,
           on ? BLUE : DARK,
           on ? BLUE_HI : DARK_HI,
           on ? BLUE_LO : DARK_LO);
    }
  }
  // etichetta
  p.fill(LIGHT);
  p.textFont('monospace');
  p.textStyle(p.BOLD);
  p.textSize(16);
  p.textAlign(p.CENTER, p.TOP);
  p.text(pan.name, px + outer / 2, py + outer + 8);
}

p.draw = () => {
  p.background(BG);
  const outer = PANEL + FRAME * 2;
  const totalW = panels.length * outer + (panels.length - 1) * GAP;
  let x = (p.width - totalW) / 2;
  const y = 28;
  for (const pan of panels) { panel(x, y, pan); x += outer + GAP; }
};
:::

Un ingegnere sostiene che il Modello Gamma sia il più efficiente di tutti perché ha ben 8 settori attivi, mentre il Modello Alfa ne ha soltanto 2. Un secondo ingegnere, invece, sostiene che i tre pannelli producano esattamente la stessa energia.

Chi ha ragione?
[[Il primo ingegnere, 8 settori attivi producono più energia|*Il secondo, la superficie attiva nei tre pannelli è la stessa|Nessuno dei due, i pannelli ALFA e BETA sono equivalenti, il terzo non si può dire perché la disposizione è diversa]]

:::div.reveal
Perché la risposta corretta è questa? Non preoccuparti se non sei sicuro/a! Vediamolo nel prossimo step!
:::

---

> id: frazioni-equivalenti-2
> title: Verifichiamo la risposta

Concentriamoci sul Modello **Gamma**: i suoi 8 settori attivi sembrano sparsi un po' ovunque. Ma l'energia prodotta dipende solo da *quanta* superficie è attiva, non da *dove* si trova.

Trascina lo slider per far scivolare verso sinistra tutti i blocchi attivi di Gamma, poi confrontalo con Alfa e Beta:

Riordina Gamma: ${t}{t|0|0,100,1}

:::p5 width=600 height=260 bind=t
// Stesso disegno dello step precedente, ma i blocchi attivi di GAMMA
// scivolano a sinistra al variare dello slider t (0 = sparsi, 100 = allineati).
const PANEL = 144, COLS = 3, FRAME = 6, GAP = 30;
const BG = '#1a1c2c', LIGHT = '#cbd3e0', SHADOW = '#11131f';
const BLUE = '#41a6f6', BLUE_HI = '#7cc4ff', BLUE_LO = '#2a6cb0';
const DARK = '#333c57', DARK_HI = '#46506e', DARK_LO = '#262d44';
const OUTER = PANEL + FRAME * 2;

// blocchi attivi di GAMMA: colonna di partenza (sparsa) → di arrivo (2 col sx)
const gamma = [
  { r: 0, from: 0, to: 0 }, { r: 0, from: 2, to: 1 },
  { r: 1, from: 1, to: 0 }, { r: 1, from: 2, to: 1 },
  { r: 2, from: 0, to: 0 }, { r: 2, from: 1, to: 1 },
  { r: 3, from: 1, to: 0 }, { r: 3, from: 2, to: 1 },
];

p.setup = () => {
  p.createCanvas(ctx.width, ctx.height);
  p.noSmooth();
  p.noLoop();
};

function cell(x, y, w, h, base, hi, lo) {
  p.noStroke();
  p.fill(base); p.rect(x, y, w, h);
  // bevel 16-bit: highlight in alto/sinistra, ombra in basso/destra
  p.fill(hi); p.rect(x, y, w, 2); p.rect(x, y, 2, h);
  p.fill(lo); p.rect(x, y + h - 2, w, 2); p.rect(x + w - 2, y, 2, h);
}

function frame(px, py) {
  p.noStroke();
  p.fill(SHADOW); p.rect(px + 5, py + 5, OUTER, OUTER);
  p.fill(LIGHT);  p.rect(px, py, OUTER, OUTER);
}

function label(px, py, name) {
  p.fill(LIGHT);
  p.textFont('monospace'); p.textStyle(p.BOLD);
  p.textSize(16); p.textAlign(p.CENTER, p.TOP);
  p.text(name, px + OUTER / 2, py + OUTER + 8);
}

// pannello statico (ALFA/BETA): le 2 colonne di sinistra sono attive
function staticPanel(px, py, rows, name) {
  frame(px, py);
  const gx = px + FRAME, gy = py + FRAME, cw = PANEL / COLS, ch = PANEL / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      const on = c < 2;
      cell(gx + c * cw, gy + r * ch, cw, ch,
           on ? BLUE : DARK, on ? BLUE_HI : DARK_HI, on ? BLUE_LO : DARK_LO);
    }
  }
  label(px, py, name);
}

// GAMMA: griglia 4x3; gli 8 blocchi attivi scivolano a sinistra al variare di t
function gammaPanel(px, py, t) {
  frame(px, py);
  const gx = px + FRAME, gy = py + FRAME, cw = PANEL / COLS, ch = PANEL / 4;
  // sfondo: tutte le 12 celle in grigio scuro
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < COLS; c++)
      cell(gx + c * cw, gy + r * ch, cw, ch, DARK, DARK_HI, DARK_LO);
  // 8 blocchi blu in posizione interpolata (stessa riga, scorrimento orizzontale)
  for (const b of gamma) {
    const c = p.lerp(b.from, b.to, t);
    cell(gx + c * cw, gy + b.r * ch, cw, ch, BLUE, BLUE_HI, BLUE_LO);
  }
  label(px, py, 'GAMMA');
}

p.draw = () => {
  p.background(BG);
  const t = (ctx.model.t ?? 0) / 100;
  const totalW = 3 * OUTER + 2 * GAP;
  let x = (p.width - totalW) / 2;
  const y = 28;
  staticPanel(x, y, 1, 'ALFA'); x += OUTER + GAP;
  staticPanel(x, y, 2, 'BETA'); x += OUTER + GAP;
  gammaPanel(x, y, t);
};
:::

:::div.reveal
Spostando i blocchi — senza toglierne nemmeno uno — la superficie blu non cambia: Gamma finisce per ricoprire **esattamente** le stesse due colonne di sinistra di Alfa e Beta. I tre pannelli hanno la stessa superficie attiva: sono **equivalenti**. Aveva ragione il secondo ingegnere!
:::

---

> id: frazioni-equivalenti-3
> title: Confrontiamo le frazioni

Ora completa la tabella: scriviamo per ogni pannello il numero totale di sezioni e poi solo quello delle sezioni attive per costruire la frazione di area attiva.

|Pannello|Sezioni totali|Sezioni attive|Frazione|
|--------|--------------|--------------|--------|
|ALFA|${n_a}{n_a|1|input}|${d_a}{d_a|1|input}|$\frac{${d_a}}{${n_a}}$|
|BETA|${n_b}{n_b|1|input}|${d_b}{d_b|1|input}|$\frac{${d_b}}{${n_b}}$|
|GAMMA|${n_c}{n_c|1|input}|${d_c}{d_c|1|input}|$\frac{${d_c}}{${n_c}}$|

[Verifica]{check: d_a == 2 && n_a == 3 && d_b == 4 && n_b == 6 && d_c == 8 && n_c == 12}

:::div.reveal
Perfetto! Le tre frazioni — $\frac{2}{3}$, $\frac{4}{6}$ e $\frac{8}{12}$ — rappresentano tutte la stessa quantità: diciamo che sono frazioni **equivalenti**.
:::

---

> id: frazioni-equivalenti-4
> title: Il fattore di scala

L'azienda vuole produrre un **Modello Delta**: deve avere *esattamente la stessa superficie attiva* di Alfa, Beta e Gamma, ma la sua griglia è composta da **24 quadratini** in totale.

Trascina lo slider per accendere i settori, fermandoti dove la zona blu copre la **stessa porzione** (i 2/3 segnati dalla linea dorata).

Settori attivi: ${k}{k|0|0,24,1}

:::p5 width=600 height=300 bind=k
// Modello DELTA: griglia 6×4 = 24 settori. Lo slider k accende i primi k
// settori, colonna per colonna. La linea dorata segna i 2/3 della larghezza
// (= 16 settori, ovvero 4 colonne su 6).
const COLS = 6, ROWS = 4, PANEL = 216, FRAME = 6;
const BG = '#1a1c2c', LIGHT = '#cbd3e0', SHADOW = '#11131f';
const BLUE = '#41a6f6', BLUE_HI = '#7cc4ff', BLUE_LO = '#2a6cb0';
const DARK = '#333c57', DARK_HI = '#46506e', DARK_LO = '#262d44';
const GOLD = '#ffcd75';
const OUTER = PANEL + FRAME * 2;

p.setup = () => {
  p.createCanvas(ctx.width, ctx.height);
  p.noSmooth();
  p.noLoop();
};

function cell(x, y, w, h, base, hi, lo) {
  p.noStroke();
  p.fill(base); p.rect(x, y, w, h);
  p.fill(hi); p.rect(x, y, w, 2); p.rect(x, y, 2, h);
  p.fill(lo); p.rect(x, y + h - 2, w, 2); p.rect(x + w - 2, y, 2, h);
}

p.draw = () => {
  p.background(BG);
  const k = Math.round(ctx.model.k ?? 0);
  const px = (p.width - OUTER) / 2, py = 20;
  p.noStroke(); p.fill(SHADOW); p.rect(px + 5, py + 5, OUTER, OUTER);
  p.fill(LIGHT); p.rect(px, py, OUTER, OUTER);
  const gx = px + FRAME, gy = py + FRAME;
  const cw = PANEL / COLS, ch = PANEL / ROWS;
  // accende i primi k settori, colonna per colonna (alto -> basso)
  let n = 0;
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const on = n < k;
      cell(gx + c * cw, gy + r * ch, cw, ch,
           on ? BLUE : DARK, on ? BLUE_HI : DARK_HI, on ? BLUE_LO : DARK_LO);
      n++;
    }
  }
  // linea dorata ai 2/3 della larghezza (confine dei 16 settori = 4 colonne)
  const lineX = gx + cw * 4;
  p.fill(GOLD); p.rect(lineX - 1, py, 3, OUTER);
  // etichette
  p.fill(LIGHT);
  p.textFont('monospace'); p.textStyle(p.BOLD);
  p.textAlign(p.CENTER, p.TOP); p.textSize(16);
  p.text('DELTA', px + OUTER / 2, py + OUTER + 8);
  p.textSize(14);
  p.text(k + ' / 24 settori attivi', p.width / 2, py + OUTER + 30);
};
:::

[Verifica]{check: k == 16}

:::div.highlight
**Come trovarlo senza tentativi?** Passare da 3 a 24 settori totali significa moltiplicare per 8 ($24 \div 3 = 8$): ogni parte originale è stata divisa in 8. Allora anche i settori attivi si moltiplicano per 8: $2 \times 8 = 16$.
:::

:::div.reveal
**Esatto: 16 settori attivi.** Infatti $\frac{2}{3} = \frac{16}{24}$: è una frazione equivalente, la stessa efficienza con una griglia più fitta.
:::

---

> id: frazioni-equivalenti-5
> title: L'astrazione numerica

Un cliente ordina un pannello personalizzato con **90 micro-settori** in totale, sempre con la stessa efficienza dei modelli precedenti.

Disegnare 90 quadratini sarebbe lunghissimo. Ma non serve: possiamo lavorare **solo sui numeri**, cercando la frazione equivalente a $\frac{2}{3}$ con 90 al denominatore.

Per passare da 3 a 90 settori totali, per quale numero dobbiamo moltiplicare? $90 \div 3 =$ [[30]]

Allora i settori attivi (moltiplicando per lo stesso numero) passano da due a [[60]].

Qual è l'"operazione segreta" che hai fatto sui numeri?
[[Ho moltiplicato solo il totale per un numero|*Ho moltiplicato numeratore e denominatore per lo stesso numero|Ho sottratto lo stesso numero da numeratore e denominatore]]

:::div.reveal
**Bravo!** $\frac{2}{3} = \frac{2 \times 30}{3 \times 30} = \frac{60}{90}$. Moltiplicare numeratore e denominatore per **lo stesso numero** crea una frazione equivalente: serviranno **60 settori attivi**, senza disegnare nulla.
:::

---

> id: frazioni-equivalenti-6
> title: Si può sempre?

Ultima sfida: è possibile progettare un pannello equivalente ai precedenti diviso in **esattamente 10 settori** totali?

È possibile?
[[Sì, basta accendere 7 settori|*No: 10 non è divisibile per 3, quindi i 2/3 non danno un numero intero di settori|Sì, basta accendere 6 settori]]

:::p5 width=600 height=180
// 10 settori in fila: 2/3 di 10 = 6,67 -> 6 settori interi + 0,67 di settore.
// Il pezzetto arancione che avanza non è un settore intero: con 10 parti uguali
// la frazione 2/3 non si può ottenere.
const N = 10, CW = 44, CH = 60;
const BG = '#1a1c2c', LIGHT = '#cbd3e0';
const BLUE = '#41a6f6', BLUE_HI = '#7cc4ff', BLUE_LO = '#2a6cb0';
const DARK = '#333c57', DARK_HI = '#46506e', DARK_LO = '#262d44';
const GOLD = '#ef7d57', GOLD_HI = '#ffb380', GOLD_LO = '#c25a3a';

p.setup = () => {
  p.createCanvas(ctx.width, ctx.height);
  p.noSmooth();
  p.noLoop();
};

function cell(x, y, w, h, base, hi, lo) {
  p.noStroke();
  p.fill(base); p.rect(x, y, w, h);
  p.fill(hi); p.rect(x, y, w, 2); p.rect(x, y, 2, h);
  p.fill(lo); p.rect(x, y + h - 2, w, 2); p.rect(x + w - 2, y, 2, h);
}

p.draw = () => {
  p.background(BG);
  const totalW = N * CW;
  const x0 = (p.width - totalW) / 2, y = 36;
  for (let i = 0; i < N; i++) cell(x0 + i * CW, y, CW, CH, DARK, DARK_HI, DARK_LO);
  for (let i = 0; i < 6; i++) cell(x0 + i * CW, y, CW, CH, BLUE, BLUE_HI, BLUE_LO);
  // 7° settore riempito solo per 2/3: la parte che "avanza"
  cell(x0 + 6 * CW, y, CW * 2 / 3, CH, GOLD, GOLD_HI, GOLD_LO);
  p.fill(LIGHT);
  p.textFont('monospace'); p.textStyle(p.BOLD);
  p.textAlign(p.CENTER, p.TOP); p.textSize(15);
  p.text('2/3 di 10 = 6,67 settori', p.width / 2, y + CH + 18);
};
:::

Perché un pannello equivalente sia possibile, il numero totale di settori deve essere un **multiplo di** [[3]].

:::div.reveal
**Esatto, non si può creare un pannello equivalente.** $\frac{2}{3}$ di 10 fa $6{,}67$: dovremmo accendere "6 settori e due terzi", ma un settore o è acceso o è spento — non esistono mezzi settori. La frazione $\frac{2}{3}$ si può mantenere solo se il totale è un **multiplo di 3** (3, 6, 9, 12, 24, 90…), così la divisione dà un numero intero di settori attivi.
:::
