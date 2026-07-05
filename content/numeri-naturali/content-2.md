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

**Esempio**

$$4^3 \cdot 4^5 = 4^{(3+5)} = 4^8$$
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

**Esempio**

$$3^6 : 3^2 = 3^{(6-2)} = 3^4$$
:::

---

> id: prime-espressioni-potenze
> title: Applichiamo le prime proprietà

# Quando usiamo le proprietà delle potenze?

Perchè usare le proprietà delle potenze quando possiamo calcolare le potenze e poi fare le divisione e moltiplicazioni?

Il vantaggio principale è quello di evitare di scrivere numeri molto grandi, che ci può portare a fare errori, o che addirittura la calcolatrice non riesce a gestire.

:::div.highlight
Prova a fare questo calcolo sulla tua calcolatrice: `10`  `^`  `400` 

(Alcune calcolatrici hanno un tasto $x^y$ per la potenza, invece dell'apice `^`)

Potresti ottenere un errore anche sulle calcolatrici digitali sul tuo telefono (il numero è troppo grande per la memoria della calcolatrice) a meno che non siano calcolatrici particolari. In ogni caso è un numero con $400$ zeri: non ha senso scriverlo.

Invece un calcolo come $10^{400} : 10^{398}$ lo possiamo svolgere facilmente con la seconda proprietà delle potenze senza calcolare esplicitamente le potenze:
$$10^{400} : 10^{398} = 10^{400-398} = 10^2 = 100$$
:::

Ora prova tu: risolvi questa espressione. Per inserire una potenza usa l'apice `^`: ad esempio `2` `^` `3`,

:::powers no-eval
7^15 : 7^12 * 7
:::

Se provi a risolvere anche calcolando le potenze $7^{15} = 4747561509943$ e $7^{12} = 13841287201$ ti renderai conto che è molto più facile usare invece le proprietà delle potenze!

Adesso prova a risolvere questa espressione usando le proprietà delle potenze. Quando non ci sono più proprietà da applicare, allora puoi calcolare le potenze e procedere normalmente.

:::powers
6*6^3:6^2*6^0-6^5:6^3
:::

:::div.reveal
Bene! Adesso sai perché è meglio applicare subito le proprietà delle potenze quando è possibile!
:::

---

> id: potenza-di-potenza
> title: Potenza di una potenza

# La potenza di una potenza

A volte una potenza è a sua volta elevata a un esponente, come $(3^2)^4$. Che
cosa significa? L'esponente **esterno** dice **quante volte** ripetiamo la base —
e qui la "base" è tutta la potenza $3^2$:

$$(3^2)^4 = \underbrace{3^2 \cdot 3^2 \cdot 3^2 \cdot 3^2}_{4 \text{ volte}}$$

Ma così otteniamo un **prodotto di potenze con la stessa base**: possiamo usare la
**prima proprietà**!

👇 **Tocca** la potenza qui sotto per spacchettarla, poi guarda quante volte
compare $3^2$.

:::p5 goal height=250
// Potenza di potenza: (3^2)^4.
// Toccando la tessera (3^2)^4 compaiono le 4 copie di 3^2 già in posizione
// finale, con la graffa "4 volte". Il risultato 3^8 non è scritto: lo studente
// somma gli esponenti (2+2+2+2) e ci arriva da solo.

let INK, INKSOFT, CARTA, ROSSA, SPUNTA, LINE;
let unpacked = false;
let box0 = null;

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
  if (ctx.completed) unpacked = true;
};

function inBox(px, py, b) {
  if (!b) return false;
  const m = 8;
  return px > b.x - m && px < b.x + b.w + m && py > b.y - m && py < b.y + b.h + m;
}

// Larghezza di base^exp alla dimensione sz.
function powerW(base, exp, sz) {
  p.textSize(sz); const bw = p.textWidth('' + base);
  p.textSize(sz * 0.6); const ew = p.textWidth('' + exp);
  return bw + ew + 2;
}

// Disegna base^exp centrata in (cx, cy).
function drawPower(cx, cy, base, exp, sz, col) {
  p.textSize(sz); const bw = p.textWidth('' + base);
  p.textSize(sz * 0.6); const ew = p.textWidth('' + exp);
  const W = bw + ew + 2; const left = cx - W / 2;
  p.noStroke(); p.fill(col);
  p.textAlign(p.LEFT, p.CENTER); p.textSize(sz);
  p.text('' + base, left, cy);
  p.textSize(sz * 0.6);
  p.text('' + exp, left + bw + 2, cy - sz * 0.32);
  p.textAlign(p.CENTER, p.CENTER);
}

// Larghezza di (base^inner)^outer.
function powerOfPowerW(base, inner, outer, sz) {
  p.textSize(sz);
  const wOpen = p.textWidth('('), wBase = p.textWidth('' + base), wClose = p.textWidth(')');
  p.textSize(sz * 0.6);
  const wInner = p.textWidth('' + inner), wOuter = p.textWidth('' + outer);
  return wOpen + wBase + wInner + 2 + wClose + wOuter + 2;
}

// Disegna (base^inner)^outer centrata in (cx, cy). Restituisce il box del tap.
function drawPowerOfPower(cx, cy, base, inner, outer, sz, col, hint) {
  const W = powerOfPowerW(base, inner, outer, sz);
  const left = cx - W / 2;
  const box = { x: left - 12, y: cy - sz * 0.72, w: W + 24, h: sz * 1.44 };
  if (hint) {
    const a = 16 + 12 * Math.sin(p.frameCount * 0.09);
    p.push(); p.noStroke(); p.fill(ROSSA);
    p.drawingContext.globalAlpha = a / 255;
    p.rect(box.x, box.y, box.w, box.h, 9);
    p.drawingContext.globalAlpha = 1; p.pop();
  }
  p.noStroke(); p.fill(col); p.textAlign(p.LEFT, p.CENTER);
  let x = left;
  p.textSize(sz); p.text('(', x, cy); x += p.textWidth('(');
  const bw = p.textWidth('' + base); p.text('' + base, x, cy); x += bw;
  p.textSize(sz * 0.6); const iw = p.textWidth('' + inner);
  p.text('' + inner, x + 2, cy - sz * 0.32); x += 2 + iw + 2;
  p.textSize(sz); p.text(')', x, cy); x += p.textWidth(')');
  p.textSize(sz * 0.6); p.text('' + outer, x + 2, cy - sz * 0.32);
  p.textAlign(p.CENTER, p.CENTER);
  return box;
}

// Centri x dei `count` fattori "3^2 · 3^2 · ..." centrati in cx.
function powerRowCenters(cx, count, base, exp, sz) {
  const wP = powerW(base, exp, sz);
  p.textSize(sz); const wSep = p.textWidth(' · ');
  const total = count * wP + (count - 1) * wSep;
  let x = cx - total / 2;
  const centers = [];
  for (let i = 0; i < count; i++) {
    centers.push(x + wP / 2); x += wP;
    if (i < count - 1) x += wSep;
  }
  return { centers, wP, wSep };
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

  // --- Riga 1: la tessera (3^2)^4 cliccabile ---
  const y1 = 58, sz1 = 40;
  box0 = drawPowerOfPower(W / 2, y1, 3, 2, 4, sz1, INK, !unpacked);

  // --- Riga 2: le 4 copie di 3^2 (compaiono già in posizione) ---
  const y2 = 152;
  if (unpacked) {
    // riduci la dimensione se la riga non ci sta in larghezza
    let sz2 = 30;
    const wP0 = powerW(3, 2, sz2);
    p.textSize(sz2); const wSep0 = p.textWidth(' · ');
    const total0 = 4 * wP0 + 3 * wSep0;
    if (total0 > W - 20) sz2 = sz2 * (W - 20) / total0;
    sz2 = p.constrain(sz2, 16, 30);

    const { centers, wP } = powerRowCenters(W / 2, 4, 3, 2, sz2);
    p.textAlign(p.CENTER, p.CENTER);
    for (let i = 0; i < 4; i++) {
      drawPower(centers[i], y2, 3, 2, sz2, INK);
      if (i < 3) {
        p.fill(INKSOFT); p.noStroke(); p.textSize(sz2);
        p.text('·', (centers[i] + centers[i + 1]) / 2, y2);
      }
    }
    drawBrace(centers[0] - wP / 2 - 4, centers[3] + wP / 2 + 4, y2 + 24, '4 volte', INKSOFT);
  }

  // --- Didascalia ---
  p.fill(INKSOFT); p.textSize(13); p.textAlign(p.CENTER, p.CENTER);
  if (!unpacked) {
    p.text('Tocca la potenza per spacchettarla', W / 2, y1 + 46);
  } else {
    p.text('Stessa base: ora somma i quattro esponenti 2.', W / 2, y2 + 62);
    ctx.complete();
  }
};

function handleTap(px, py) {
  if (!unpacked && inBox(px, py, box0)) { unpacked = true; return; }
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

- Quante volte compare la potenza $3^2$? [[4]]


- Applico la prima proprietà e **sommo gli esponenti**: $2+2+2+2 =$ [[8]]


- Allora $(3^2)^4$ è uguale a $3$ elevato a [[8]]

- Sommare quattro volte il $2$ è come fare [[select: *2 · 4|2 + 4|2 - 4]], cioè moltiplicare i due esponenti.

Ora prova tu: riscrivi questa potenza di potenza come una sola potenza, senza calcolarla.

:::powers no-eval
(2^3)^2
:::

## Regola (terza proprietà delle potenze)

La potenza di una [[select: *potenza|base|somma]] si riscrive con la [[select: *stessa base|somma delle basi]] e con esponente uguale [[select: alla somma|*al prodotto|alla differenza]] dei due esponenti.

:::div.reveal
🔑 **Potenza di potenza**: si tiene la **stessa base** e si **moltiplicano gli
esponenti**.

$$(a^m)^n = a^{m \cdot n}$$

**Esempio**

$$(2^3)^2 = 2^{(3 \cdot 2)} = 2^6$$
:::

---

> id: potenze-parole
> title: Dalle parole alle espressioni

# Dalle parole alle espressioni con le potenze

A volte esprimiamo con parole dei calcoli semplici:

|A parole|Espressione|
|-|-|
|Il *doppio* di $a$|$2 \cdot a$|
|La *metà* di $a$|$a : 2$|
|Il *triplo* di $a$|$3 \cdot a$|
|Un *terzo* o la *terza parte* di $a$|$a : 3$|
|Il *quadruplo*, il *quintuplo*... di $a$|$4 \cdot a$,$5 \cdot a$,...|
|Un *quarto*, la *quarta parte*... di $a$|$a:4$...|
|Il *quadrato* di $a$|$a^2$|
|Il *cubo* di $a$|$a^3$|

Quanto vale la metà di $2^{66}$?

[[*$2^{65}$|$2^{33}$|$1^{66}$|$1^{33}$]]

Quanto vale il triplo di $3^{10}$?

[[$3^{30}$|$9^{10}$|*$3^{11}$|$9^{30}$]]

La quinta parte di $5^5$ vale

[[*$5^4$|$1^5$|$5^1$|$1^1$]]

:::div.reveal
Esatto!
- la metà di $2^{66}$ è $2^{66} : 2 = 2^{66-1} = 2^{65}$
- il triplo di $3^{10}$ è $3 \cdot 3^{10} = 3^{10+1} = 3^{11}$
- la quinta parte di $5^5$ è $5^5:5 = 5^{5-1} = 5^4$
:::

---

> id: proprietà-basi-diverse
> title: Usare le proprietà delle potenze anche con basi diverse

# Basi diverse ma...

Quanto vale il triplo di $9^{11}$? Ricordando che il triplo significa moltiplicare per $3$ dovrei scrivere

$$3 \cdot 9^{11}$$

ed essere costretto a calcolare "a mano" la potenza grande perché le basi sono diverse. Però c'è un trucco: $9$ è a sua volta **una potenza di $3$** e posso scriverlo come $3^2$. Quindi $9^{11} = (3^2)^{11} = $ [[3^22]] (scrivi base `^` esponente).


Nella seguente espressione tocca l'esponente di $9^{11}$ per trasformarlo in una potenza con base $3$.

:::powers
3*9^11
:::

## Ora prova tu

Stessa strategia: guarda se una base è **potenza di un'altra**, riscrivila per
avere la **stessa base**, poi applica le proprietà che già conosci (prodotto e
quoziente con stessa base, potenza di potenza). Ricorda: l'esponente si tocca per
riscrivere la potenza, l'operatore per applicare una proprietà.

Una sola base da riscrivere:

:::powers no-eval
9^4 * 3^5
:::

Adesso con una divisione:

:::powers no-eval
8^3 : 2^5
:::

Qui **due** basi vanno ricondotte alla stessa (sono entrambe potenze di $3$):

:::powers no-eval
27^4 : 9^3
:::

L'ultima mette insieme più proprietà (occhio anche alla potenza di potenza):

:::powers no-eval
(2^3)^2 * 4^2
:::

:::div.reveal
🔑 **Il trucco delle basi diverse**: se una base è potenza dell'altra, riscrivi la
potenza in quella base (l'esponente cambia di conseguenza), così ottieni la
**stessa base** e puoi applicare prodotto, quoziente e potenza di potenza.

- $9^4 \cdot 3^5 = 3^8 \cdot 3^5 = 3^{13}$
- $8^3 : 2^5 = 2^9 : 2^5 = 2^4$
- $27^4 : 9^3 = 3^{12} : 3^6 = 3^6$
- $(2^3)^2 \cdot 4^2 = 2^6 \cdot 2^4 = 2^{10}$
:::


---

> id: prodotto-stesso-esponente
> title: Moltiplicare potenze con lo stesso esponente

# Moltiplicare potenze con lo stesso esponente

E se le basi sono **diverse** ma l'esponente è **lo stesso**, come $7^3 \cdot 2^3$?
La prima proprietà qui non serve (le basi non sono uguali), ma c'è un'altra
scorciatoia. Torniamo di nuovo al significato di potenza e proviamo a
**riordinare** i fattori.

👇 **Tocca** ciascuna potenza per spacchettarla, poi **tocca** per accoppiare ogni
$7$ con un $2$.

:::p5 goal height=260
// Prodotto di potenze con lo stesso esponente: 7^3 · 2^3.
// 1) tap su 7^3 e 2^3  ->  (7·7·7) · (2·2·2)
// 2) tap "accoppia"    ->  i fattori si riordinano in (7·2)·(7·2)·(7·2)
// Il risultato 14^3 non è scritto: 3 coppie che valgono 7·2 = 14 ciascuna.

let INK, INKSOFT, CARTA, ROSSA, SPUNTA, LINE, PAREN;
let unpackedA = false, unpackedB = false, paired = false;
let leftF = [], rightF = [];      // fattori 7 (sx) e 2 (dx): { x, tx, v }
let boxA = null, boxB = null, pairHit = null;

function readTokens() {
  const cs = getComputedStyle(document.documentElement);
  const get = (n, fb) => (cs.getPropertyValue(n).trim() || fb);
  INK     = get('--ink', '#1B2A4A');
  INKSOFT = get('--ink-soft', '#5A6275');
  CARTA   = get('--carta', '#FBFBF6');
  ROSSA   = get('--rossa', '#D7263D');
  SPUNTA  = get('--spunta', '#1F9D55');
  LINE    = get('--line', '#DDE2D9');
  PAREN   = p.lerpColor(p.color(INKSOFT), p.color(CARTA), 0.45);
}

function cyLine() { return ctx.height * 0.42; }

function makeFactors(n, val) {
  const a = [];
  for (let i = 0; i < n; i++) a.push({ x: null, tx: 0, v: val });
  return a;
}

p.setup = () => {
  p.createCanvas(ctx.width, ctx.height);
  p.textFont('IBM Plex Mono');
  readTokens();
  if (ctx.completed) {
    unpackedA = true; unpackedB = true; paired = true;
    leftF = makeFactors(3, 7); rightF = makeFactors(3, 2);
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

// Dimensione del carattere che fa stare la disposizione a 3 coppie in larghezza.
function lineSize() {
  const W = ctx.width; let sz = 26;
  for (let k = 0; k < 4; k++) {
    p.textSize(sz);
    const wNum = p.textWidth('7'); const gap = sz * 0.5;
    const wOpen = p.textWidth('('), wClose = p.textWidth(')'), wOp = p.textWidth('·');
    const grp2 = wOpen + 2 * wNum + gap + wClose;   // una coppia (7·2)
    const opGap = gap * 1.1;
    const total = 3 * grp2 + 2 * (opGap + wOp + opGap);
    if (total <= W - 16) break;
    sz = sz * (W - 16) / total;
  }
  return p.constrain(sz, 11, 26);
}

p.draw = () => {
  p.background(CARTA);
  const W = ctx.width, H = ctx.height, CY = cyLine();

  // init pigro dei fattori al primo spacchettamento
  if (unpackedA && leftF.length === 0) leftF = makeFactors(3, 7);
  if (unpackedB && rightF.length === 0) rightF = makeFactors(3, 2);

  const sz = lineSize();
  p.textSize(sz);
  const wNum = p.textWidth('7'); const gap = sz * 0.5; const pitch = wNum + gap;
  const wOpen = p.textWidth('('), wClose = p.textWidth(')'), wOp = p.textWidth('·');
  const opGap = gap * 1.1;
  const tileSz = Math.min(sz + 8, 34);
  const grpW = (n) => wOpen + n * wNum + (n - 1) * gap + wClose;

  const ease = (f) => { f.x = (f.x === null) ? f.tx : f.x + (f.tx - f.x) * 0.25; };
  const drawGroup = (arr) => {
    if (!arr.length) return;
    p.textAlign(p.CENTER, p.CENTER); p.textSize(sz);
    for (let i = 0; i < arr.length - 1; i++) {
      p.fill(INKSOFT); p.noStroke();
      p.text('·', (arr[i].x + arr[i + 1].x) / 2, CY);
    }
    for (const f of arr) { p.fill(INK); p.noStroke(); p.text('' + f.v, f.x, CY); }
    p.fill(PAREN); p.noStroke(); p.textSize(sz * 1.12);
    p.text('(', arr[0].x - wNum / 2 - wOpen / 2 - 1, CY);
    p.text(')', arr[arr.length - 1].x + wNum / 2 + wClose / 2 + 1, CY);
    p.textSize(sz);
  };

  pairHit = null;

  if (!paired) {
    // ----- fase A: tessere e/o gruppi (7·7·7) · (2·2·2) -----
    const leftIsGroup = unpackedA, rightIsGroup = unpackedB;
    const leftW = leftIsGroup ? grpW(3) : powerW(7, 3, tileSz);
    const rightW = rightIsGroup ? grpW(3) : powerW(2, 3, tileSz);
    const total = leftW + opGap + wOp + opGap + rightW;
    const startX = W / 2 - total / 2;

    if (leftIsGroup) {
      const c0 = startX + wOpen + wNum / 2;
      leftF.forEach((f, i) => f.tx = c0 + i * pitch);
    } else {
      boxA = drawPower(startX + leftW / 2, CY, 7, 3, tileSz, INK, true);
    }
    const opX = startX + leftW + opGap + wOp / 2;
    const rightStart = startX + leftW + opGap + wOp + opGap;
    if (rightIsGroup) {
      const c0 = rightStart + wOpen + wNum / 2;
      rightF.forEach((f, i) => f.tx = c0 + i * pitch);
    } else {
      boxB = drawPower(rightStart + rightW / 2, CY, 2, 3, tileSz, INK, true);
    }

    if (leftIsGroup) leftF.forEach(ease);
    if (rightIsGroup) rightF.forEach(ease);

    // evidenzia la zona "accoppia" quando entrambe sono spacchettate
    if (leftIsGroup && rightIsGroup && leftF.length && rightF.length) {
      const x1 = leftF[0].x - wNum, x2 = rightF[rightF.length - 1].x + wNum;
      pairHit = { x: x1, y: CY - sz, w: x2 - x1, h: sz * 2 };
      const al = 0.10 + 0.06 * Math.sin(p.frameCount * 0.09);
      p.push(); p.noStroke(); p.fill(SPUNTA); p.drawingContext.globalAlpha = al;
      p.rect(x1, CY - sz * 0.95, x2 - x1, sz * 1.9, 8);
      p.drawingContext.globalAlpha = 1; p.pop();
    }

    if (leftIsGroup) drawGroup(leftF);
    if (rightIsGroup) drawGroup(rightF);
    p.fill(INKSOFT); p.noStroke(); p.textSize(sz); p.textAlign(p.CENTER, p.CENTER);
    p.text('·', opX, CY);
  } else {
    // ----- fase B: 3 coppie (7·2)·(7·2)·(7·2) -----
    const pairs = [
      [leftF[0], rightF[0]],
      [leftF[1], rightF[1]],
      [leftF[2], rightF[2]],
    ];
    const grp2 = grpW(2);
    const total = 3 * grp2 + 2 * (opGap + wOp + opGap);
    let x = W / 2 - total / 2;
    const opXs = [];
    pairs.forEach((pr, gi) => {
      const c0 = x + wOpen + wNum / 2;
      pr[0].tx = c0; pr[1].tx = c0 + pitch;
      x += grp2;
      if (gi < 2) { opXs.push(x + opGap + wOp / 2); x += opGap + wOp + opGap; }
    });
    leftF.forEach(ease); rightF.forEach(ease);
    pairs.forEach((pr) => drawGroup(pr));
    p.fill(INKSOFT); p.noStroke(); p.textSize(sz); p.textAlign(p.CENTER, p.CENTER);
    opXs.forEach((ox) => p.text('·', ox, CY));
  }

  // ----- didascalie -----
  p.textAlign(p.CENTER, p.CENTER);
  if (!unpackedA || !unpackedB) {
    p.fill(INKSOFT); p.textSize(13);
    p.text('Tocca le potenze per spacchettarle', W / 2, H - 22);
  } else if (!paired) {
    p.fill(INKSOFT); p.textSize(13);
    p.text('Tocca per accoppiare ogni 7 con un 2', W / 2, H - 22);
  } else {
    p.fill(INKSOFT); p.textSize(13);
    p.text('Ogni coppia vale 7·2 = 14. Ora conta le coppie.', W / 2, H - 22);
    ctx.complete();
  }
};

function handleTap(px, py) {
  if (!unpackedA && inBox(px, py, boxA)) { unpackedA = true; return; }
  if (!unpackedB && inBox(px, py, boxB)) { unpackedB = true; return; }
  if (pairHit && inBox(px, py, pairHit)) { paired = true; return; }
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

- Quante coppie $(7 \cdot 2)$ hai ottenuto? [[3]]


- Quanto vale ogni coppia $7 \cdot 2$? [[14]]


- Allora $7^3 \cdot 2^3$ è uguale a $14$ elevato a [[3]]

- Se invece gli esponenti sono diversi, ad esempio $7^3 \cdot 2^4$ [[si può accoppiare allo stesso modo|*non si può, perché resterebbe un fattore senza compagno con cui fare la coppia]]

Ora prova ad applicare la proprietà:

:::powers no-eval
3^6 * 4^6
:::

## Regola (quarta proprietà delle potenze)

Moltiplicando due [[select: numeri|*potenze|basi]] con lo [[select: *stesso esponente|stessa base]] si ottiene una potenza con [[select: la somma delle basi|*il prodotto delle basi|la stessa base]] e con [[select: *lo stesso esponente|la somma degli esponenti]].

:::div.reveal
🔑 **Prodotto di potenze con lo stesso esponente**: si **moltiplicano le basi** e
si tiene lo **stesso esponente**.

$$a^n \cdot b^n = (a \cdot b)^n$$

**Esempio**

$$5^4 \cdot 2^4 = (5 \cdot 2)^4 = 10^4$$
:::

---

> id: quoziente-stesso-esponente
> title: Dividere potenze con lo stesso esponente

# Dividere potenze con lo stesso esponente

E se le due potenze hanno **basi diverse ma lo stesso esponente** e le dividiamo,
come $10^3 : 5^3$?

Per ragionare su questo caso ci basta ricordare che la **divisione è l'operazione
inversa della moltiplicazione **e usare la proprietà appena vista.**

Dividere $10^3 : 5^3$ significa cercare quel numero che, **moltiplicato** per $5^3$,
dà $10^3$. Questo deve essere necessariamente $2^3$, perché moltiplicandolo per $5^3$ si ottiene $10^3$ (usando la proprietà precedente! $2^3 * 5^3 = 10^3$).

In pratica: si **dividono le basi** ($10 : 5 = 2$) e si tiene lo **stesso esponente**.

Rispondi:

- Le basi si dividono: $10 : 5 =$ [[2]]

- L'esponente invece resta [[3]]

- Se gli esponenti fossero diversi, ad esempio $10^3 : 5^2$, questa scorciatoia [[si può usare lo stesso|*non si può usare, perché serve lo stesso esponente in entrambe le potenze]]

Ora prova tu con le proprietà. Ricorda: per inserire una potenza usa l'apice `^`.

:::powers no-eval
15^4 : 3^4
:::

## Regola (quinta proprietà delle potenze)

Dividendo due [[select: numeri|*potenze|basi]] con lo [[select: *stesso esponente|stessa base]] si ottiene una potenza che ha per base [[select: la somma delle basi|il prodotto delle basi|*il quoziente delle basi]] e con [[select: *lo stesso esponente|la differenza degli esponenti]].

:::div.reveal
🔑 **Quoziente di potenze con lo stesso esponente**: si **dividono le basi** e si
tiene lo **stesso esponente**.

$$a^n : b^n = (a : b)^n \quad (b \neq 0)$$

**Esempio**

$$10^3 : 5^3 = (10 : 5)^3 = 2^3$$
:::

---

> id: riepilogo-potenze
> title: Riepilogo delle proprietà

# Tutte le proprietà in un colpo d'occhio

Hai incontrato **cinque proprietà** delle potenze, ognuna nata da un caso diverso.
Eccole tutte insieme: questa tabella è la tua "mappa" per scegliere ogni volta la
scorciatoia giusta.

| Proprietà | In simboli | Esempio |
|---|---|---|
| Prodotto, stessa base | $a^m \cdot a^n = a^{m+n}$ | $2^3 \cdot 2^4 = 2^7$ |
| Quoziente, stessa base | $a^m : a^n = a^{m-n}$ | $3^6 : 3^2 = 3^4$ |
| Potenza di potenza | $(a^m)^n = a^{m \cdot n}$ | $(2^3)^2 = 2^6$ |
| Prodotto, stesso esponente | $a^n \cdot b^n = (a \cdot b)^n$ | $5^4 \cdot 2^4 = 10^4$ |
| Quoziente, stesso esponente | $a^n : b^n = (a : b)^n$ | $10^3 : 5^3 = 2^3$ |

:::div.highlight
💡 **Non dimenticare i casi particolari:**

- $a^1 = a$ (esponente $1$: la base compare una volta sola);
- $a^0 = 1$ per ogni base $a \neq 0$;
- $1^n = 1$ (la base $1$ resta sempre $1$).
:::

## Domande di riepilogo

Applica la proprietà giusta e completa (inserici la potenza come base `^` esponente):

- $6^4 \cdot 6^3 = $ [[6^7]]

- $8^9 : 8^4 = $ [[8^5]]

- $(5^2)^3 = $ [[5^6]]

- $3^4 \cdot 2^4 = $ [[6^4]]

- $12^5 : 4^5 = $ [[3^5]]

Un ripasso sui casi particolari:

- $7^0 + 1^{100} =$ [[2]]

E quando le basi sembrano diverse? In $9^3 : 3^5$ prima conviene
[[select: *riscrivere le basi con lo stesso valore|calcolare subito le potenze]],
perché $9$ è a sua volta una potenza di $3$.

## Espressioni di riepilogo

Ora tocca a te: in ognuna scegli la proprietà da applicare guardando **basi** ed
**esponenti**. Ricorda: per inserire una potenza usa l'apice `^`.

Stessa base, quoziente e prodotto insieme:

:::powers no-eval
2^6 : 2^2 * 2^3
:::

Prima una potenza di potenza, poi un quoziente:

:::powers no-eval
(3^2)^3 : 3^4
:::

Basi diverse ma **stesso esponente**:

:::powers no-eval
10^5 : 5^5
:::

Qui una base va ricondotta all'altra ($9$ è una potenza di $3$):

:::powers no-eval
9^3 : 3^4
:::

Nell'ultima applica prima le proprietà **dove puoi**, poi — quando non ce ne sono
più — calcola pure le potenze rimaste:

:::powers
5^4 : 5^2 * 2^2
:::

:::div.reveal
🎉 **Lezione completata!** Hai imparato a maneggiare le potenze e le loro cinque
proprietà. La strategia è sempre la stessa: **guarda basi ed esponenti** per capire
quale proprietà usare, riscrivi le basi quando serve per renderle uguali, e **solo
alla fine** calcola i numeri rimasti. Così eviti numeroni enormi e fai molti meno
errori!
:::