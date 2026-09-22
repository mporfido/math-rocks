/**
 * Sketch p5.js riutilizzabile "frazioni-pannelli-confronto".
 *
 * Più pannelli affiancati, tutti della stessa dimensione, ciascuno con la sua
 * griglia di settori. I settori attivi sono sparsi (non allineati): a occhio
 * non si decide quale pannello produce di più, bisogna passare dai numeri.
 *
 *   :::p5 sketch=frazioni-pannelli-confronto pannelli="DELTA 18/24 6, EPSILON 45/60 10" height=300
 *   :::
 *
 * Formato di un pannello: `NOME attivi/totali colonne`, separati da virgola.
 * La disposizione dei settori accesi è casuale ma sempre la stessa (generatore
 * con seme fisso): ricaricando la pagina il disegno non cambia.
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};
  window.P5Sketches['frazioni-pannelli-confronto'] = function (p, ctx) {
    const FRAME = 5, MARGIN = 12, GAP = 18, CAPTION = 30;
    const BG = '#1a1c2c', LIGHT = '#cbd3e0', SHADOW = '#11131f';
    const BLUE = '#41a6f6', BLUE_HI = '#7cc4ff', BLUE_LO = '#2a6cb0';
    const DARK = '#333c57', DARK_HI = '#46506e', DARK_LO = '#262d44';

    // "DELTA 18/24 6, EPSILON 45/60 10" -> [{nome, n, d, cols}, …]
    const panels = String(ctx.params.pannelli || 'ALFA 2/3 3')
      .split(',')
      .map((spec) => spec.trim().split(/\s+/))
      .filter((f) => f.length >= 2)
      .map(([nome, frazione, cols]) => {
        const [n, d] = frazione.split('/').map(Number);
        return { nome, n, d, cols: Number(cols) || d };
      });

    // Generatore pseudo-casuale con seme: la disposizione resta identica
    // a ogni ricarica, così la figura del testo è sempre quella.
    function accesi(n, d, seme) {
      let s = seme;
      const next = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
      const idx = Array.from({ length: d }, (_, i) => i);
      for (let i = d - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }
      return new Set(idx.slice(0, n));
    }

    panels.forEach((pan, i) => { pan.on = accesi(pan.n, pan.d, 7919 * (i + 1) + pan.d); });

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

    // Su schermo stretto i pannelli vanno a capo: al massimo quanti ne stanno.
    function layout() {
      const k = panels.length;
      const disponibile = p.width - 2 * MARGIN;
      let perRiga = k;
      while (perRiga > 1 && (disponibile - (perRiga - 1) * GAP) / perRiga < 120) perRiga--;
      const lato = Math.floor((disponibile - (perRiga - 1) * GAP) / perRiga);
      const righe = Math.ceil(k / perRiga);
      return { perRiga, lato, righe };
    }

    p.draw = () => {
      p.background(BG);
      const { perRiga, lato, righe } = layout();
      const altoRiga = lato + CAPTION + GAP;

      const needed = 2 * MARGIN + righe * altoRiga - GAP;
      if (Math.abs(needed - lastHeight) > 1) {
        lastHeight = needed;
        ctx.setHeight(needed);
      }

      panels.forEach((pan, i) => {
        const riga = Math.floor(i / perRiga), col = i % perRiga;
        const inRiga = Math.min(perRiga, panels.length - riga * perRiga);
        const larghezzaRiga = inRiga * lato + (inRiga - 1) * GAP;
        const px = (p.width - larghezzaRiga) / 2 + col * (lato + GAP);
        const py = MARGIN + riga * altoRiga;

        p.noStroke();
        p.fill(SHADOW); p.rect(px + 4, py + 4, lato, lato);
        p.fill(LIGHT); p.rect(px, py, lato, lato);

        const grid = lato - FRAME * 2;
        const rows = Math.ceil(pan.d / pan.cols);
        const cw = grid / pan.cols, ch = grid / rows;
        for (let j = 0; j < pan.d; j++) {
          const r = Math.floor(j / pan.cols), c = j % pan.cols;
          const on = pan.on.has(j);
          cell(px + FRAME + c * cw, py + FRAME + r * ch, cw, ch,
               on ? BLUE : DARK, on ? BLUE_HI : DARK_HI, on ? BLUE_LO : DARK_LO);
        }

        p.fill(LIGHT);
        p.textFont('monospace'); p.textStyle(p.BOLD);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(14);
        p.text(pan.nome, px + lato / 2, py + lato + 6);
      });
    };
  };
})();
