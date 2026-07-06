/**
 * Sketch p5.js riutilizzabile "frazioni-pannelli-suddivisioni".
 * Estratto dal blocco :::p5 inline di content/le-frazioni/content-2.md. Un file per sketch,
 * caricato al volo da <x-p5> (static/sketches/). Riceve p e ctx.
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};
  window.P5Sketches['frazioni-pannelli-suddivisioni'] = function (p, ctx) {
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
  };
})();
