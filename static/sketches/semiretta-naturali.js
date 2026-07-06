/**
 * Sketch p5.js riutilizzabile "semiretta-naturali".
 * Estratto dal blocco :::p5 inline di content/numeri-naturali/content-1.md. Un file per sketch,
 * caricato al volo da <x-p5> (static/sketches/). Riceve p e ctx.
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};
  window.P5Sketches['semiretta-naturali'] = function (p, ctx) {
// Semiretta dei numeri naturali: punti 0..5, poi tratteggio "continua".
// Pura visualizzazione interattiva (hover desktop + tap mobile).

const N = 5;                 // ultimo numero "etichettato"
const dotR = 9;              // raggio dei pallini
const hitR = 22;            // raggio di "aggancio" per hover/tap
let x0, y0, unit;            // origine (0) e passo tra interi
let active = null;          // { type: 'dot'|'unit', n } elemento evidenziato
let touchPos = null;        // ultima posizione da tocco (mobile)

// Colori
const COL_AXIS = '#37474F';
const COL_DOT = '#4CAF50';
const COL_DOT_HI = '#1B5E20';
const COL_UNIT = '#FF7043';   // segmento unità 0-1, colore diverso
const COL_TXT = '#263238';

function layout() {
  const marginL = 48;
  const marginR = 56;          // spazio per il tratteggio dopo il 5
  y0 = ctx.height * 0.55;
  x0 = marginL;
  unit = (ctx.width - marginL - marginR) / (N + 1); // un passo extra per il tratto
}

function numX(n) { return x0 + n * unit; }

p.setup = () => {
  p.createCanvas(ctx.width, ctx.height);
  layout();
  p.textFont('sans-serif');
};

// Trova l'elemento sotto la posizione (px, py)
function pick(px, py) {
  // Pallini 0..N
  for (let n = 0; n <= N; n++) {
    if (p.dist(px, py, numX(n), y0) < hitR) return { type: 'dot', n };
  }
  // Segmento unità tra 0 e 1 (vicino all'asse)
  if (px > numX(0) && px < numX(1) && Math.abs(py - y0) < 16) {
    return { type: 'unit' };
  }
  return null;
}

function drawArrowTip(x, y) {
  p.push();
  p.stroke(COL_AXIS);
  p.strokeWeight(2);
  p.line(x, y, x - 9, y - 5);
  p.line(x, y, x - 9, y + 5);
  p.pop();
}

// Fumetto con testo, ancorato sopra (ax, ay), con clamp ai bordi
function drawBalloon(ax, ay, lines) {
  p.push();
  p.textSize(13);
  let w = 0;
  for (const ln of lines) w = Math.max(w, p.textWidth(ln));
  const padX = 12, padY = 9, lh = 17;
  const bw = w + padX * 2;
  const bh = lines.length * lh + padY * 2 - 3;
  let bx = ax - bw / 2;
  let by = ay - bh - 16;
  bx = p.constrain(bx, 6, ctx.width - bw - 6);
  if (by < 6) by = ay + 18; // se non c'è spazio sopra, sotto
  // codina
  p.noStroke();
  p.fill('#263238');
  p.rect(bx, by, bw, bh, 8);
  p.triangle(ax - 6, by + bh, ax + 6, by + bh, ax, by + bh + 9);
  p.fill('#FFFFFF');
  p.textAlign(p.LEFT, p.TOP);
  lines.forEach((ln, i) => p.text(ln, bx + padX, by + padY + i * lh));
  p.pop();
}

function balloonFor(a) {
  if (a.type === 'unit') {
    return [
      "Unità di misura",
      "La distanza da 0 a 1 è l'unità.",
      "Ripetendola trovi tutti i numeri.",
    ];
  }
  const n = a.n;
  if (n === 0) {
    return [
      "Il numero 0",
      "È il più piccolo: non ha precedente.",
      "Successivo: 1",
    ];
  }
  return [
    "Il numero " + n,
    "Precedente: " + (n - 1),
    "Successivo: " + (n + 1),
  ];
}

p.draw = () => {
  p.background('#F7FBF7');
  layout();

  // Posizione del puntatore: tocco (se presente) o mouse
  const px = touchPos ? touchPos.x : p.mouseX;
  const py = touchPos ? touchPos.y : p.mouseY;
  const inside = px >= 0 && px <= ctx.width && py >= 0 && py <= ctx.height;
  active = inside ? pick(px, py) : null;

  // Asse principale 0 -> 5
  p.stroke(COL_AXIS);
  p.strokeWeight(3);
  p.line(numX(0), y0, numX(N), y0);

  // Tratteggio dopo il 5 (la semiretta continua)
  p.push();
  p.strokeWeight(3);
  p.stroke(COL_AXIS);
  p.drawingContext.setLineDash([6, 6]);
  p.line(numX(N), y0, numX(N) + unit, y0);
  p.drawingContext.setLineDash([]);
  p.pop();
  drawArrowTip(numX(N) + unit, y0);
  p.noStroke();
  p.fill(COL_TXT);
  p.textSize(16);
  p.textAlign(p.LEFT, p.CENTER);
  p.text('…', numX(N) + unit + 8, y0 - 2);

  // Segmento unità 0-1 evidenziato
  const unitHot = active && active.type === 'unit';
  p.stroke(COL_UNIT);
  p.strokeWeight(unitHot ? 7 : 5);
  p.line(numX(0), y0, numX(1), y0);
  // graffa/etichetta "1 unità"
  p.noStroke();
  p.fill(COL_UNIT);
  p.textSize(11);
  p.textAlign(p.CENTER, p.BOTTOM);
  p.text('unità', (numX(0) + numX(1)) / 2, y0 - 12);

  // Pallini ed etichette 0..N
  for (let n = 0; n <= N; n++) {
    const x = numX(n);
    const hot = active && active.type === 'dot' && active.n === n;
    // tacca
    p.stroke(COL_AXIS);
    p.strokeWeight(2);
    p.line(x, y0 - 6, x, y0 + 6);
    // pallino
    p.noStroke();
    if (hot) {
      p.fill(COL_DOT_HI);
      p.circle(x, y0, dotR * 2 + 8); // alone
    }
    p.fill(hot ? COL_DOT_HI : COL_DOT);
    p.circle(x, y0, dotR * 2);
    // numero
    p.fill(COL_TXT);
    p.textSize(15);
    p.textAlign(p.CENTER, p.TOP);
    p.textStyle(hot ? p.BOLD : p.NORMAL);
    p.text(n, x, y0 + 14);
    p.textStyle(p.NORMAL);
  }

  // Balloon dell'elemento attivo
  if (active) {
    const ax = active.type === 'unit' ? (numX(0) + numX(1)) / 2 : numX(active.n);
    drawBalloon(ax, y0 - dotR - 4, balloonFor(active));
  }
};

// Touch: aggiorna la posizione attiva. Niente `return false`: lasciamo che il
// browser gestisca lo swipe verticale come scroll della pagina (vedi
// `touch-action: pan-y` sul canvas); i gesti orizzontali e i tap restano qui.
p.touchStarted = () => {
  if (p.touches && p.touches.length) touchPos = { x: p.touches[0].x, y: p.touches[0].y };
  else touchPos = { x: p.mouseX, y: p.mouseY };
};
p.touchMoved = () => {
  if (p.touches && p.touches.length) touchPos = { x: p.touches[0].x, y: p.touches[0].y };
};
// Tornato il mouse in uso: abbandona la posizione "bloccata" dal tocco così
// l'hover col mouse torna a funzionare dopo aver toccato lo schermo.
p.mouseMoved = () => { touchPos = null; };
  };
})();
