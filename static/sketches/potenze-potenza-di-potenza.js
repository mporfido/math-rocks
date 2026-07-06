/**
 * Sketch p5.js riutilizzabile "potenze-potenza-di-potenza".
 * Estratto dal blocco :::p5 inline di content/numeri-naturali/content-2.md. Un file per sketch,
 * caricato al volo da <x-p5> (static/sketches/). Riceve p e ctx.
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};
  window.P5Sketches['potenze-potenza-di-potenza'] = function (p, ctx) {
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
  };
})();
