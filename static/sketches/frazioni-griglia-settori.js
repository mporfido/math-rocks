/**
 * Sketch p5.js riutilizzabile "frazioni-griglia-settori".
 * Estratto dal blocco :::p5 inline di content/le-frazioni/content-2.md. Un file per sketch,
 * caricato al volo da <x-p5> (static/sketches/). Riceve p e ctx.
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};
  window.P5Sketches['frazioni-griglia-settori'] = function (p, ctx) {
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
  };
})();
