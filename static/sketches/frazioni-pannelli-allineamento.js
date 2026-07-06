/**
 * Sketch p5.js riutilizzabile "frazioni-pannelli-allineamento".
 * Estratto dal blocco :::p5 inline di content/le-frazioni/content-2.md. Un file per sketch,
 * caricato al volo da <x-p5> (static/sketches/). Riceve p e ctx.
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};
  window.P5Sketches['frazioni-pannelli-allineamento'] = function (p, ctx) {
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
  };
})();
