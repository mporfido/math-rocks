/**
 * Sketch p5.js riutilizzabile "frazioni-griglia-comune".
 *
 * Due (o più) pannelli della stessa dimensione, ridisegnati tutti con lo
 * STESSO numero di settori: è il denominatore comune visto sui pannelli.
 *
 *   :::p5 sketch=frazioni-griglia-comune pannelli="DELTA 3/4, ZETA 2/3" height=320 bind=t
 *   :::
 *
 * Il numero di settori arriva dallo slider (variabile `var`, default `t`)
 * oppure da un parametro fisso `t=12`, quando la griglia non si deve muovere.
 *
 * Se il numero di settori non è un multiplo del denominatore, i settori attivi
 * non vengono un numero intero: l'ultimo settore si accende solo a metà, in
 * arancione. È il segnale che quella griglia non va bene per quel pannello.
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};
  window.P5Sketches['frazioni-griglia-comune'] = function (p, ctx) {
    const FRAME = 5, MARGIN = 12, GAP = 18, CAPTION = 30, FOOTER = 26;
    const BG = '#1a1c2c', LIGHT = '#cbd3e0', SHADOW = '#11131f';
    const BLUE = '#41a6f6', BLUE_HI = '#7cc4ff', BLUE_LO = '#2a6cb0';
    const DARK = '#333c57', DARK_HI = '#46506e', DARK_LO = '#262d44';
    const ORANGE = '#ef7d57', ORANGE_HI = '#ffb380', ORANGE_LO = '#c25a3a';
    const GREEN = '#a7f070';

    const VAR = ctx.params.var || 't';
    const FISSO = Number(ctx.params.t) || 0;

    // "DELTA 3/4, ZETA 2/3" -> [{nome, n, d}, …]
    const panels = String(ctx.params.pannelli || 'ALFA 2/3')
      .split(',')
      .map((spec) => spec.trim().split(/\s+/))
      .filter((f) => f.length >= 2)
      .map(([nome, frazione]) => {
        const [n, d] = frazione.split('/').map(Number);
        return { nome, n, d };
      });

    // Colonne della griglia: il divisore di t più vicino alla radice, così il
    // pannello resta il più quadrato possibile (12 -> 4, 18 -> 6, 35 -> 7).
    function colonne(t) {
      for (let c = Math.ceil(Math.sqrt(t)); c <= t; c++) if (t % c === 0) return c;
      return t;
    }

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

    function layout() {
      const k = panels.length;
      const disponibile = p.width - 2 * MARGIN;
      let perRiga = k;
      while (perRiga > 1 && (disponibile - (perRiga - 1) * GAP) / perRiga < 130) perRiga--;
      const lato = Math.min(240, Math.floor((disponibile - (perRiga - 1) * GAP) / perRiga));
      return { perRiga, lato, righe: Math.ceil(k / perRiga) };
    }

    p.draw = () => {
      p.background(BG);
      const t = Math.max(1, Math.round(FISSO || ctx.model[VAR] || panels[0].d));
      const cols = colonne(t), rows = t / cols;
      const { perRiga, lato, righe } = layout();
      const altoRiga = lato + CAPTION + GAP;

      const needed = 2 * MARGIN + righe * altoRiga - GAP + FOOTER;
      if (Math.abs(needed - lastHeight) > 1) {
        lastHeight = needed;
        ctx.setHeight(needed);
      }

      let tutteIntere = true;

      panels.forEach((pan, i) => {
        const attivi = (pan.n * t) / pan.d;          // quanti settori servirebbero
        const pieni = Math.floor(attivi + 1e-9);
        const resto = attivi - pieni;                 // 0 se la griglia va bene
        if (resto > 1e-9) tutteIntere = false;

        const riga = Math.floor(i / perRiga), col = i % perRiga;
        const inRiga = Math.min(perRiga, panels.length - riga * perRiga);
        const larghezzaRiga = inRiga * lato + (inRiga - 1) * GAP;
        const px = (p.width - larghezzaRiga) / 2 + col * (lato + GAP);
        const py = MARGIN + riga * altoRiga;

        p.noStroke();
        p.fill(SHADOW); p.rect(px + 4, py + 4, lato, lato);
        p.fill(LIGHT); p.rect(px, py, lato, lato);

        const grid = lato - FRAME * 2;
        const cw = grid / cols, ch = grid / rows;
        for (let j = 0; j < t; j++) {
          const r = Math.floor(j / cols), c = j % cols;
          const x = px + FRAME + c * cw, y = py + FRAME + r * ch;
          if (j < pieni) cell(x, y, cw, ch, BLUE, BLUE_HI, BLUE_LO);
          else cell(x, y, cw, ch, DARK, DARK_HI, DARK_LO);
        }
        // il settore che resta acceso a metà: la griglia non torna
        if (resto > 1e-9 && pieni < t) {
          const r = Math.floor(pieni / cols), c = pieni % cols;
          cell(px + FRAME + c * cw, py + FRAME + r * ch, cw * resto, ch,
               ORANGE, ORANGE_HI, ORANGE_LO);
        }

        p.textFont('monospace'); p.textStyle(p.BOLD);
        p.textAlign(p.CENTER, p.TOP); p.textSize(13);
        p.fill(LIGHT);
        p.text(pan.nome + '  ' + pan.n + '/' + pan.d, px + lato / 2, py + lato + 5);
        if (resto > 1e-9) {
          p.fill(ORANGE);
          p.text('servirebbero ' + String(Math.round(attivi * 100) / 100).replace('.', ',') +
                 ' settori', px + lato / 2, py + lato + 21);
        } else {
          p.fill(BLUE_HI);
          p.text(attivi + ' attivi su ' + t, px + lato / 2, py + lato + 21);
        }
      });

      // riga di chiusura: la griglia comune, quando esiste
      p.textAlign(p.CENTER, p.TOP); p.textSize(14);
      const fy = MARGIN + righe * altoRiga - GAP + 6;
      if (tutteIntere) {
        p.fill(GREEN);
        p.text(panels.map((pan) => pan.n + '/' + pan.d + ' = ' +
               (pan.n * t) / pan.d + '/' + t).join('   '), p.width / 2, fy);
      } else {
        p.fill(ORANGE);
        p.text('con ' + t + ' settori non ci stanno tutti e due', p.width / 2, fy);
      }
    };
  };
})();
