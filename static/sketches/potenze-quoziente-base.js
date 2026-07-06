/**
 * Sketch p5.js riutilizzabile "potenze-quoziente-base".
 * Estratto dal blocco :::p5 inline di content/numeri-naturali/content-2.md. Un file per sketch,
 * caricato al volo da <x-p5> (static/sketches/). Riceve p e ctx.
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};
  window.P5Sketches['potenze-quoziente-base'] = function (p, ctx) {
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
  };
})();
