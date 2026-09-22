/**
 * Sketch p5.js riutilizzabile "frazioni-raggruppa".
 *
 * Un pannello di `d` settori, di cui `n` attivi, disposti su `cols` colonne.
 * Lo slider (variabile `var`, default `g`) raggruppa i settori a g a g,
 * seguendo l'ordine di lettura: le barre dorate separano un gruppo dall'altro.
 *
 *   :::p5 sketch=frazioni-raggruppa n=6 d=8 cols=4 nome=ZETA height=260 bind=g
 *   :::
 *
 * Il raggruppamento "funziona" solo quando g divide sia n sia d: allora i
 * gruppi sono tutti pieni o tutti spenti e la frazione si riscrive con numeri
 * più piccoli. Se g non divide n, almeno un gruppo resta mezzo acceso: quei
 * gruppi sono marcati in arancione. È la semplificazione vista sui settori.
 *
 * `cols` conviene sceglierlo multiplo dei raggruppamenti interessanti (8 su 4
 * colonne, 18 su 6, 48 su 12), così ogni gruppo sta dentro una riga sola.
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};
  window.P5Sketches['frazioni-raggruppa'] = function (p, ctx) {
    const N = Number(ctx.params.n) || 6;
    const D = Number(ctx.params.d) || 8;
    const COLS = Number(ctx.params.cols) || D;
    const VAR = ctx.params.var || 'g';
    const NOME = ctx.params.nome || '';

    const ROWS = Math.ceil(D / COLS);
    const FRAME = 6, MARGIN = 12, CAPTION = 52;
    const BG = '#1a1c2c', LIGHT = '#cbd3e0', SHADOW = '#11131f';
    const BLUE = '#41a6f6', BLUE_HI = '#7cc4ff', BLUE_LO = '#2a6cb0';
    const DARK = '#333c57', DARK_HI = '#46506e', DARK_LO = '#262d44';
    const GOLD = '#ffcd75', ORANGE = '#ef7d57', GREEN = '#a7f070';

    let lastHeight = 0;

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

    // Dimensione di un settore: sta nella larghezza disponibile, con una
    // altezza massima che tiene il pannello dentro il canvas anche su telefono.
    function cellSize() {
      const wMax = (p.width - 2 * MARGIN - 2 * FRAME) / COLS;
      const hMax = (p.height - CAPTION - 2 * MARGIN - 2 * FRAME) / ROWS;
      return Math.max(10, Math.floor(Math.min(wMax, hMax, 54)));
    }

    p.draw = () => {
      p.background(BG);
      const g = Math.max(1, Math.round(ctx.model[VAR] ?? 1));
      const cs = cellSize();
      const gridW = COLS * cs, gridH = ROWS * cs;
      const outerW = gridW + FRAME * 2, outerH = gridH + FRAME * 2;

      // altezza del canvas: quella che serve davvero a questo pannello
      const needed = outerH + 2 * MARGIN + CAPTION;
      if (Math.abs(needed - lastHeight) > 1) {
        lastHeight = needed;
        ctx.setHeight(needed);
      }

      const px = (p.width - outerW) / 2, py = MARGIN;
      p.noStroke();
      p.fill(SHADOW); p.rect(px + 5, py + 5, outerW, outerH);
      p.fill(LIGHT); p.rect(px, py, outerW, outerH);

      const gx = px + FRAME, gy = py + FRAME;

      // un gruppo è "misto" se contiene sia settori attivi sia spenti
      const misto = (gi) => {
        const start = gi * g, end = Math.min(start + g, D);
        return start < N && end > N;
      };

      for (let i = 0; i < D; i++) {
        const r = Math.floor(i / COLS), c = i % COLS;
        const x = gx + c * cs, y = gy + r * cs;
        const on = i < N;
        cell(x, y, cs, cs, on ? BLUE : DARK, on ? BLUE_HI : DARK_HI, on ? BLUE_LO : DARK_LO);
        // il gruppo mezzo acceso si vede: cornice arancione sui suoi settori
        if (misto(Math.floor(i / g))) {
          p.noFill(); p.stroke(ORANGE); p.strokeWeight(2);
          p.rect(x + 1, y + 1, cs - 2, cs - 2);
          p.noStroke();
        }
      }

      // barre dorate fra un gruppo e l'altro (solo dentro la riga)
      p.fill(GOLD);
      for (let i = 1; i < D; i++) {
        if (i % g !== 0 || i % COLS === 0) continue;
        const r = Math.floor(i / COLS), c = i % COLS;
        p.rect(gx + c * cs - 1, gy + r * cs, 3, cs);
      }
      // e fra una riga e l'altra, quando il gruppo finisce a fine riga
      for (let r = 1; r < ROWS; r++) {
        if ((r * COLS) % g === 0) p.rect(gx, gy + r * cs - 1, gridW, 3);
      }

      // didascalia
      const funziona = D % g === 0 && N % g === 0;
      p.textFont('monospace'); p.textStyle(p.BOLD);
      p.textAlign(p.CENTER, p.TOP);
      const ty = py + outerH + 10;
      p.fill(LIGHT); p.textSize(14);
      p.text((NOME ? NOME + ' — ' : '') + 'gruppi da ' + g, p.width / 2, ty);
      p.textSize(15);
      if (g === 1) {
        p.fill(LIGHT);
        p.text(N + ' settori attivi su ' + D, p.width / 2, ty + 20);
      } else if (funziona) {
        p.fill(GREEN);
        p.text(N + '/' + D + ' = ' + (N / g) + '/' + (D / g), p.width / 2, ty + 20);
      } else {
        p.fill(ORANGE);
        p.text(D % g === 0 ? 'un gruppo resta mezzo acceso'
                           : 'i gruppi non sono tutti uguali', p.width / 2, ty + 20);
      }
    };
  };
})();
