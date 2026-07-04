> id: potenze
> title: Potenze
> description: La notazione delle potenze e le loro proprietà.

---

> id: introduzione-potenze
> title: Che cos'è una potenza

# La potenza

A volte dobbiamo moltiplicare lo **stesso numero** per sé stesso tante volte.
Invece di scrivere una lunga moltiplicazione, usiamo una scrittura più corta: la
**potenza**.

$$2 \cdot 2 \cdot 2 = 2^3 = 8$$

In una potenza come $2^3$ ci sono due numeri con un nome preciso:

- la **base** è il numero che si ripete (qui $2$);
- l'**esponente** è il numero piccolo in alto e dice **quante volte** la base compare nella moltiplicazione (qui $3$).

Si legge "**2 elevato a 3**" oppure "2 alla terza". Quindi:

$$2^3 = \underbrace{2 \cdot 2 \cdot 2}_{3 \text{ volte}} = 8$$

:::div.highlight
💡 Due esponenti hanno un nome speciale: $a^2$ si legge "$a$ **al quadrato**" e
$a^3$ si legge "$a$ **al cubo**".
:::

## Casi particolari

- Esponente **1**: la base compare una sola volta, quindi $a^1 = a$ (es. $7^1 = 7$).
- Esponente **0**: per convenzione $a^0 = 1$ per ogni base diversa da zero
  (es. $9^0 = 1$).
- Base **1**: $1$ moltiplicato per sé stesso resta sempre $1$, quindi $1^n = 1$.

## Esercizio 1: riconosci base ed esponente

Nella potenza $4^3$:

- la **base** è [[4]]
- l'**esponente** è [[3]]

## Esercizio 2: calcola la potenza

Scrivi il risultato di ciascuna potenza:

- $2^3 =$ [[8]]
- $3^2 =$ [[9]]
- $5^2 =$ [[25]]
- $2^4 =$ [[16]]
- $10^3 =$ [[1000]]

## Esercizio 3: i casi particolari

- $6^1 =$ [[6]]
- $8^0 =$ [[1]]
- $1^4 =$ [[1]]

## Esercizio 4: che cosa significa?

La potenza $2^3$ è un modo breve per scrivere:

[[$2 + 2 + 2$|*$2 \cdot 2 \cdot 2$|$3 \cdot 3$]]

:::div.reveal
🎉 **Bravo!** Una potenza è una moltiplicazione ripetuta: la **base** è il numero
che si ripete, l'**esponente** dice quante volte. Ricorda i casi particolari:
$a^1 = a$, $a^0 = 1$ e $1^n = 1$.
:::

---

> id: prodotto-potenze
> title: Moltiplicare potenze con la stessa base

# Moltiplicare potenze con la stessa base

Cosa succede se moltiplichiamo **due potenze con la stessa base**, come
$2^3 \cdot 2^4$? Potremmo calcolare ogni potenza e poi moltiplicare… ma c'è una
scorciatoia. Per scoprirla, torniamo al significato di potenza: una
**moltiplicazione ripetuta**.

👇 **Tocca** ciascuna potenza qui sotto per "spacchettarla" nei suoi fattori, poi
**conta** quanti $2$ ottieni in tutto.

:::p5 goal height=250
// Prodotto di potenze con la stessa base: 2^3 · 2^4.
// Toccando una potenza, i suoi fattori 2 compaiono GIÀ nella posizione finale
// (2^3 a sinistra, 2^4 a destra). Il risultato 2^7 non è scritto: lo studente
// conta i fattori e ci arriva da solo.

let INK, INKSOFT, CARTA, ROSSA, SPUNTA, LINE;
let unpackedA = false;   // 2^3 spacchettata
let unpackedB = false;   // 2^4 spacchettata
let boxA = null, boxB = null;

function readTokens() {
  const cs = getComputedStyle(document.documentElement);
  const get = (n, fb) => (cs.getPropertyValue(n).trim() || fb);
  INK     = get('--ink', '#1B2A4A');
  INKSOFT = get('--ink-soft', '#5A6275');
  CARTA   = get('--carta', '#FBFBF6');
  ROSSA   = get('--rossa', '#D7263D');
  SPUNTA  = get('--spunta', '#1F9D55');
  LINE    = get('--line', '#DDE2D9');
}

p.setup = () => {
  p.createCanvas(ctx.width, ctx.height);
  p.textFont('IBM Plex Mono');
  readTokens();
  if (ctx.completed) { unpackedA = true; unpackedB = true; }
};

function inBox(px, py, b) {
  if (!b) return false;
  const m = 8;
  return px > b.x - m && px < b.x + b.w + m && py > b.y - m && py < b.y + b.h + m;
}

// Misura la larghezza di una potenza base^exp alla dimensione sz.
function powerW(base, exp, sz) {
  p.textSize(sz); const bw = p.textWidth('' + base);
  p.textSize(sz * 0.6); const ew = p.textWidth('' + exp);
  return bw + ew + 2;
}

// Disegna base^exp centrata in (cx, cy). hint = box pulsante "toccami".
function drawPower(cx, cy, base, exp, sz, col, hint) {
  p.textSize(sz); const bw = p.textWidth('' + base);
  p.textSize(sz * 0.6); const ew = p.textWidth('' + exp);
  const W = bw + ew + 2; const left = cx - W / 2;
  const box = { x: left - 12, y: cy - sz * 0.72, w: W + 24, h: sz * 1.44 };
  if (hint) {
    const a = 16 + 12 * Math.sin(p.frameCount * 0.09);
    p.push(); p.noStroke(); p.fill(ROSSA);
    p.drawingContext.globalAlpha = a / 255;
    p.rect(box.x, box.y, box.w, box.h, 9);
    p.drawingContext.globalAlpha = 1; p.pop();
  }
  p.noStroke(); p.fill(col);
  p.textAlign(p.LEFT, p.CENTER); p.textSize(sz);
  p.text('' + base, left, cy);
  p.textSize(sz * 0.6);
  p.text('' + exp, left + bw + 2, cy - sz * 0.32);
  p.textAlign(p.CENTER, p.CENTER);
  return box;
}

// Posizioni x finali dei `count` fattori di una riga "2 · 2 · ... · 2"
// centrata in cx. Non disegna nulla: serve a far comparire ogni gruppo
// direttamente al suo posto definitivo.
function runCenters(cx, count, sz) {
  p.textSize(sz);
  const wTwo = p.textWidth('2');
  const wSep = p.textWidth('  ·  ');
  const total = count * wTwo + (count - 1) * wSep;
  let x = cx - total / 2;
  const centers = [];
  for (let i = 0; i < count; i++) {
    centers.push(x + wTwo / 2); x += wTwo;
    if (i < count - 1) x += wSep;
  }
  return { centers, wTwo };
}

// Parentesi graffa orizzontale con etichetta sotto.
function drawBrace(x1, x2, y, label, col) {
  p.push();
  p.stroke(col); p.strokeWeight(1.5); p.noFill();
  const mid = (x1 + x2) / 2;
  p.line(x1, y, x1, y + 5); p.line(x1, y + 5, x2, y + 5); p.line(x2, y, x2, y + 5);
  p.line(mid, y + 5, mid, y + 9);
  p.noStroke(); p.fill(col); p.textSize(12); p.textAlign(p.CENTER, p.TOP);
  p.text(label, mid, y + 11);
  p.pop();
  p.textAlign(p.CENTER, p.CENTER);
}

p.draw = () => {
  p.background(CARTA);
  const W = ctx.width;
  const BOTH = unpackedA && unpackedB;

  // --- Riga 1: l'espressione originale (tessere cliccabili) ---
  const y1 = 50, sz1 = 40;
  p.textSize(sz1);
  const wA = powerW(2, 3, sz1), wB = powerW(2, 4, sz1);
  p.textSize(sz1); const wT = p.textWidth('·');
  const gap = 26;
  const tot = wA + gap + wT + gap + wB;
  let x = W / 2 - tot / 2;
  boxA = drawPower(x + wA / 2, y1, 2, 3, sz1, INK, !unpackedA);
  x += wA + gap;
  p.fill(INKSOFT); p.noStroke(); p.textSize(sz1); p.textAlign(p.CENTER, p.CENTER);
  p.text('·', x + wT / 2, y1);
  x += wT + gap;
  boxB = drawPower(x + wB / 2, y1, 2, 4, sz1, INK, !unpackedB);

  // --- Riga 2: gli sviluppi compaiono GIÀ al posto definitivo ---
  // I 7 fattori finali (3 dal 2^3 a sinistra, 4 dal 2^4 a destra) hanno
  // posizioni fisse: ogni gruppo appare lì non appena la sua potenza è toccata.
  const y2 = 156, sz2 = 26;
  const { centers, wTwo } = runCenters(W / 2, 7, sz2);
  const shown = (i) => (i < 3 && unpackedA) || (i >= 3 && unpackedB);
  p.textSize(sz2); p.textAlign(p.CENTER, p.CENTER);
  for (let i = 0; i < 7; i++) {
    if (!shown(i)) continue;
    p.fill(INK); p.noStroke(); p.text('2', centers[i], y2);
    if (i < 6 && shown(i + 1)) {
      p.fill(INKSOFT); p.text('·', (centers[i] + centers[i + 1]) / 2, y2);
    }
  }
  const half = wTwo / 2 + 6;
  if (unpackedA) drawBrace(centers[0] - half, centers[2] + half, y2 + 22, '3 volte', INKSOFT);
  if (unpackedB) drawBrace(centers[3] - half, centers[6] + half, y2 + 22, '4 volte', INKSOFT);

  // Didascalia: invita all'azione, poi a contare. Non rivela mai il risultato.
  p.fill(INKSOFT); p.textSize(13); p.textAlign(p.CENTER, p.CENTER);
  if (!BOTH) {
    p.text('Tocca ogni potenza per spacchettarla nei suoi fattori', W / 2, y1 + 46);
  } else {
    p.text('Ora conta quanti fattori 2 hai ottenuto in tutto.', W / 2, y2 + 64);
    ctx.complete();
  }
};

function handleTap(px, py) {
  if (!unpackedA && inBox(px, py, boxA)) { unpackedA = true; return; }
  if (!unpackedB && inBox(px, py, boxB)) { unpackedB = true; return; }
}
p.mousePressed = () => { handleTap(p.mouseX, p.mouseY); };
p.touchStarted = () => {
  let tx = p.mouseX, ty = p.mouseY;
  if (p.touches && p.touches.length) { tx = p.touches[0].x; ty = p.touches[0].y; }
  handleTap(tx, ty);
  // niente return false: lo swipe verticale resta scroll della pagina
};
p.mouseMoved = () => {};
:::

Ora rispondi:

- In tutto, quanti fattori $2$ hai contato? [[7]]


- Allora il prodotto si riscrive come una **sola** potenza: $2^3 \cdot 2^4$ è uguale a $2$ elevato a [[7]]

- Se le basi non sono le stesse, ad esempio $2^3 \cdot 3^4$ [[si può ripetere lo stesso ragionamento|*non si può ragionare così perché si ha una potenza solo se si moltiplica per se stesso sempre lo stesso numero]] 


## Regola (prima proprietà delle potenze)

Moltiplicando due [[select: numeri|*potenze|basi]] con [[select: *basi uguali|esponenti uguali]] si ottiene una potenza con [[select: la somma delle basi|il prodotto delle basi|*la stessa base]] e con esponente uguale [[select: *alla somma|al prodotto|alla differenza]] degli esponenti dei fattori.

:::div.reveal
🔑 **Prodotto di potenze con la stessa base**: si tiene la **stessa base** e si
**sommano gli esponenti**.

$$a^m \cdot a^n = a^{m+n}$$
:::

---

> id: quoziente-potenze
> title: Dividere potenze con la stessa base

# Dividere potenze con la stessa base

E per una **divisione** tra potenze con la stessa base, come $2^8 : 2^3$?
Spacchettiamo di nuovo tutto in fattori $2$, scrivendo la divisione per esteso:
$(2 \cdot 2 \cdots) : (2 \cdot 2 \cdots)$. Poi sfruttiamo un'idea semplice: ogni
coppia $2 : 2$ **vale 1**, quindi possiamo **eliminarla**.

👇 Tocca prima le due potenze per spacchettarle, poi **tocca la coppia $2:2$
centrale** per cancellarla, una alla volta.

:::p5 goal height=320
// Quoziente di potenze con la stessa base: 2^8 : 2^3.
// Tutto su una riga: (2·2·2·2·2·2·2·2) : (2·2·2). La coppia 2:2 CENTRALE
// (a cavallo dei due punti) al clic diventa 1 e sparisce; i fattori rimasti si
// avvicinano. Il risultato 2^5 non è scritto: lo conta lo studente.

let INK, INKSOFT, CARTA, ROSSA, SPUNTA, LINE, PAREN;
let unpackedTop = false, unpackedBot = false;
let leftF = [], rightF = [];  // fattori vivi { x, tx }  (dividendo : divisore)
let cancels = [];             // ghost delle coppie eliminate { x, t }
let cancelledPairs = 0;
let boxTop = null, boxBot = null;
let pairHit = null;           // regione cliccabile della coppia 2:2 centrale

function readTokens() {
  const cs = getComputedStyle(document.documentElement);
  const get = (n, fb) => (cs.getPropertyValue(n).trim() || fb);
  INK     = get('--ink', '#1B2A4A');
  INKSOFT = get('--ink-soft', '#5A6275');
  CARTA   = get('--carta', '#FBFBF6');
  ROSSA   = get('--rossa', '#D7263D');
  SPUNTA  = get('--spunta', '#1F9D55');
  LINE    = get('--line', '#DDE2D9');
  // parentesi più chiare dei numeri: inchiostro tenue schiarito verso la carta
  PAREN   = p.lerpColor(p.color(INKSOFT), p.color(CARTA), 0.45);
}

function cyLine() { return ctx.height * 0.46; }

function makeFactors(n) {
  const a = [];
  for (let i = 0; i < n; i++) a.push({ x: null, tx: 0 });
  return a;
}

// Dimensione del carattere che fa stare l'intera riga nella larghezza.
function lineSize() {
  const W = ctx.width;
  let sz = 24;
  for (let k = 0; k < 4; k++) {
    p.textSize(sz);
    const wTwo = p.textWidth('2'); const gap = sz * 0.55;
    const pitch = wTwo + gap;
    const wOpen = p.textWidth('('), wClose = p.textWidth(')'), wCol = p.textWidth(':');
    const grp = (n) => wOpen + (n - 1) * pitch + wTwo + wClose;
    const total = grp(8) + (gap * 1.5 + wCol + gap * 1.5) + grp(3);
    if (total <= W - 16) break;
    sz = sz * (W - 16) / total;
  }
  return p.constrain(sz, 11, 24);
}

p.setup = () => {
  p.createCanvas(ctx.width, ctx.height);
  p.textFont('IBM Plex Mono');
  readTokens();
  if (ctx.completed) {
    unpackedTop = true; unpackedBot = true;
    leftF = makeFactors(5); rightF = []; cancelledPairs = 3;
  }
};

function inBox(px, py, b) {
  if (!b) return false;
  const m = 8;
  return px > b.x - m && px < b.x + b.w + m && py > b.y - m && py < b.y + b.h + m;
}
function powerW(base, exp, sz) {
  p.textSize(sz); const bw = p.textWidth('' + base);
  p.textSize(sz * 0.6); const ew = p.textWidth('' + exp);
  return bw + ew + 2;
}
function drawPower(cx, cy, base, exp, sz, col, hint) {
  p.textSize(sz); const bw = p.textWidth('' + base);
  p.textSize(sz * 0.6); const ew = p.textWidth('' + exp);
  const W = bw + ew + 2; const left = cx - W / 2;
  const box = { x: left - 12, y: cy - sz * 0.72, w: W + 24, h: sz * 1.44 };
  if (hint) {
    const a = 16 + 12 * Math.sin(p.frameCount * 0.09);
    p.push(); p.noStroke(); p.fill(ROSSA);
    p.drawingContext.globalAlpha = a / 255;
    p.rect(box.x, box.y, box.w, box.h, 9);
    p.drawingContext.globalAlpha = 1; p.pop();
  }
  p.noStroke(); p.fill(col);
  p.textAlign(p.LEFT, p.CENTER); p.textSize(sz);
  p.text('' + base, left, cy);
  p.textSize(sz * 0.6);
  p.text('' + exp, left + bw + 2, cy - sz * 0.32);
  p.textAlign(p.CENTER, p.CENTER);
  return box;
}

p.draw = () => {
  p.background(CARTA);
  const W = ctx.width, H = ctx.height, CY = cyLine();

  // init pigro al primo spacchettamento di ciascun lato
  if (unpackedTop && leftF.length === 0 && cancelledPairs === 0) leftF = makeFactors(8);
  if (unpackedBot && rightF.length === 0 && cancelledPairs === 0) rightF = makeFactors(3);

  const sz = lineSize();
  p.textSize(sz);
  const wTwo = p.textWidth('2'); const gap = sz * 0.55;
  const pitch = wTwo + gap;
  const wOpen = p.textWidth('('), wClose = p.textWidth(')'), wCol = p.textWidth(':');
  const colGap = gap * 1.5;
  const tileSz = Math.min(sz + 8, 32);
  const grpW = (n) => wOpen + (n - 1) * pitch + wTwo + wClose;

  const rightIsTile = !unpackedBot;
  const rightHasGroup = unpackedBot && rightF.length > 0;
  const showRight = rightIsTile || rightHasGroup;
  const leftParens = showRight;   // nel risultato finale (destra vuota) niente parentesi

  const leftBlockW = unpackedTop
    ? (leftParens ? grpW(leftF.length) : (leftF.length - 1) * pitch + wTwo)
    : powerW(2, 8, tileSz);
  const rightBlockW = !showRight ? 0
    : (rightIsTile ? powerW(2, 3, tileSz) : grpW(rightF.length));

  const total = leftBlockW + (showRight ? (colGap + wCol + colGap + rightBlockW) : 0);
  const startX = W / 2 - total / 2;

  // ----- blocco sinistro: gruppo di fattori oppure tessera 2^8 -----
  if (unpackedTop) {
    const cL = startX + (leftParens ? wOpen : 0) + wTwo / 2;
    leftF.forEach((f, i) => f.tx = cL + i * pitch);
  } else {
    boxTop = drawPower(startX + leftBlockW / 2, CY, 2, 8, tileSz, INK, true);
  }
  const leftEnd = startX + leftBlockW;

  // ----- divisione ":" + blocco destro -----
  let colonX = null;
  if (showRight) {
    colonX = leftEnd + colGap + wCol / 2;
    const rightStart = leftEnd + colGap + wCol + colGap;
    if (rightIsTile) {
      boxBot = drawPower(rightStart + rightBlockW / 2, CY, 2, 3, tileSz, INK, true);
    } else {
      const cR = rightStart + wOpen + wTwo / 2;
      rightF.forEach((f, i) => f.tx = cR + i * pitch);
    }
  }

  // ----- easing delle posizioni dei fattori -----
  const ease = (f) => { f.x = (f.x === null) ? f.tx : f.x + (f.tx - f.x) * 0.25; };
  leftF.forEach(ease); rightF.forEach(ease);

  // ----- disegno di un gruppo (puntini, numeri, parentesi più chiare) -----
  const drawGroup = (arr, withParens) => {
    if (arr.length === 0) return;
    p.textAlign(p.CENTER, p.CENTER); p.textSize(sz);
    for (let i = 0; i < arr.length - 1; i++) {
      p.fill(INKSOFT); p.noStroke();
      p.text('·', (arr[i].x + arr[i + 1].x) / 2, CY);
    }
    for (const f of arr) { p.fill(INK); p.noStroke(); p.text('2', f.x, CY); }
    if (withParens) {
      p.fill(PAREN); p.noStroke(); p.textSize(sz * 1.12);
      p.text('(', arr[0].x - wTwo / 2 - wOpen / 2 - 1, CY);
      p.text(')', arr[arr.length - 1].x + wTwo / 2 + wClose / 2 + 1, CY);
      p.textSize(sz);
    }
  };
  if (unpackedTop) drawGroup(leftF, leftParens);
  if (rightHasGroup) drawGroup(rightF, true);

  if (showRight) {
    p.fill(INKSOFT); p.noStroke(); p.textSize(sz); p.textAlign(p.CENTER, p.CENTER);
    p.text(':', colonX, CY);
  }

  // ----- coppia centrale 2:2 cliccabile (evidenziata) -----
  pairHit = null;
  if (unpackedTop && rightHasGroup && leftF.length > 0) {
    const a = leftF[leftF.length - 1], b = rightF[0];
    const x1 = a.x - wTwo, x2 = b.x + wTwo;
    pairHit = { x: x1, y: CY - sz, w: x2 - x1, h: sz * 2 };
    const al = 0.10 + 0.06 * Math.sin(p.frameCount * 0.09);
    p.push(); p.noStroke(); p.fill(SPUNTA);
    p.drawingContext.globalAlpha = al;
    p.rect(x1, CY - sz * 0.95, x2 - x1, sz * 1.9, 8);
    p.drawingContext.globalAlpha = 1; p.pop();
  }

  // ----- ghost delle coppie eliminate (2:2 -> 1 -> sparisce) -----
  for (let i = cancels.length - 1; i >= 0; i--) {
    const c = cancels[i]; c.t++;
    const al = c.t < 14 ? 1 : Math.max(0, 1 - (c.t - 14) / 20);
    p.push(); p.drawingContext.globalAlpha = al;
    p.fill(SPUNTA); p.noStroke(); p.textSize(sz); p.textAlign(p.CENTER, p.CENTER);
    p.text('1', c.x, CY);
    p.drawingContext.globalAlpha = 1; p.pop();
    if (c.t > 34) cancels.splice(i, 1);
  }

  const DONE = unpackedTop && unpackedBot && rightF.length === 0 && cancels.length === 0;

  // ----- didascalie -----
  p.textAlign(p.CENTER, p.CENTER);
  if (unpackedTop && unpackedBot) {
    p.fill(INKSOFT); p.textSize(12);
    p.text('coppie 2:2 eliminate: ' + cancelledPairs, W / 2, 22);
  }
  if (!unpackedTop || !unpackedBot) {
    p.fill(INKSOFT); p.textSize(13);
    p.text('Tocca le potenze per spacchettarle', W / 2, H - 22);
  } else if (!DONE) {
    p.fill(INKSOFT); p.textSize(13);
    p.text('Tocca la coppia 2:2 centrale — vale 1, quindi sparisce', W / 2, H - 22);
  } else {
    p.fill(INKSOFT); p.textSize(13);
    p.text('Ora conta i fattori 2 rimasti.', W / 2, H - 22);
    ctx.complete();
  }
};

function cancelInnerPair() {
  if (leftF.length === 0 || rightF.length === 0) return;
  const a = leftF.pop();        // ultimo fattore a sinistra del ":"
  const b = rightF.shift();     // primo fattore a destra del ":"
  const ax = (a && a.x !== null) ? a.x : ctx.width / 2;
  const bx = (b && b.x !== null) ? b.x : ctx.width / 2;
  cancels.push({ x: (ax + bx) / 2, t: 0 });
  cancelledPairs++;
}

function handleTap(px, py) {
  if (!unpackedTop && inBox(px, py, boxTop)) { unpackedTop = true; return; }
  if (!unpackedBot && inBox(px, py, boxBot)) { unpackedBot = true; return; }
  if (pairHit && inBox(px, py, pairHit)) { cancelInnerPair(); return; }
}
p.mousePressed = () => { handleTap(p.mouseX, p.mouseY); };
p.touchStarted = () => {
  let tx = p.mouseX, ty = p.mouseY;
  if (p.touches && p.touches.length) { tx = p.touches[0].x; ty = p.touches[0].y; }
  handleTap(tx, ty);
  // niente return false: lo swipe verticale resta scroll della pagina
};
p.mouseMoved = () => {};
:::

Ora rispondi:

- Quante coppie $2:2$ hai eliminato? [[3]]


- Quanti fattori $2$ sono rimasti? [[5]]


- Allora la divisione si riscrive come una sola potenza: $2^8 : 2^3$ fa $2$ elevato a [[5]]

- Se le basi non sono le stesse, ad esempio $2^8 : 3^4$ [[si può ripetere lo stesso ragionamento|*non si può ragionare così perché $2:3$ non fa $1$ e quindi non si elimina]] 

## Regola (seconda proprietà delle potenze)

Dividendo due [[select: numeri|*potenze|basi]] con [[select: *basi uguali|esponenti uguali]] si ottiene una potenza con [[select: la somma delle basi|il quoziente delle basi|*la stessa base]] e con esponente uguale [[select: alla somma|al quoziente|*alla differenza]] degli esponenti dei fattori.

:::div.reveal
🔑 **Quoziente di potenze con la stessa base**: si tiene la **stessa base** e si
**sottraggono gli esponenti**.

$$a^m : a^n = a^{m-n} \quad (a \neq 0,\ m \geq n)$$
:::
