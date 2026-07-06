/**
 * Sketch p5.js riutilizzabile "potenze-prodotto-base".
 * Estratto dal blocco :::p5 inline di content/numeri-naturali/content-2.md. Un file per sketch,
 * caricato al volo da <x-p5> (static/sketches/). Riceve p e ctx.
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};
  window.P5Sketches['potenze-prodotto-base'] = function (p, ctx) {
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
  };
})();
