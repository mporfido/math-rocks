/**
 * Sketch p5.js riutilizzabile "frazioni-dieci-settori".
 * Estratto dal blocco :::p5 inline di content/le-frazioni/content-2.md. Un file per sketch,
 * caricato al volo da <x-p5> (static/sketches/). Riceve p e ctx.
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};
  window.P5Sketches['frazioni-dieci-settori'] = function (p, ctx) {
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
  };
})();
