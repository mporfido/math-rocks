/**
 * Sketch p5.js riutilizzabile "potenze-prodotto-esponente".
 * Estratto dal blocco :::p5 inline di content/numeri-naturali/content-2.md. Un file per sketch,
 * caricato al volo da <x-p5> (static/sketches/). Riceve p e ctx.
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};
  window.P5Sketches['potenze-prodotto-esponente'] = function (p, ctx) {
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
  };
})();
