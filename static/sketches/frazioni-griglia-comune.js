/**
 * Sketch p5.js riutilizzabile "frazioni-griglia-comune".
 *
 * Due (o più) pannelli della stessa dimensione, con la loro zona attiva
 * **ferma**: la superficie accesa non cambia mai, cambiano solo le linee che
 * la suddividono. Lo slider sceglie in quanti settori è diviso ogni pannello:
 * è il denominatore comune visto sui pannelli.
 *
 *   :::p5 sketch=frazioni-griglia-comune pannelli="DELTA 3/4, ZETA 2/3" height=320 bind=t
 *   :::
 *
 * Il numero di settori arriva dallo slider (variabile `var`, default `t`)
 * oppure da un parametro fisso `t=12`, quando la griglia non si deve muovere.
 *
 * La griglia è una sola, identica su tutti i pannelli: a parità di settori i
 * pezzi devono avere la stessa forma, altrimenti confrontarli non vuol dire
 * niente.
 *
 * Se il numero di settori non è un multiplo del denominatore, nessuna linea
 * cade sul bordo della zona attiva: il bordo taglia una colonna di settori a
 * metà, e quei settori si accendono in arancione. È il segnale che con quel
 * numero la zona attiva non si può contare in settori interi.
 *
 * Le frazioni vanno passate già ridotte ai minimi termini (3/4, non 18/24).
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};
  window.P5Sketches['frazioni-griglia-comune'] = function (p, ctx) {
    const FRAME = 5, MARGIN = 12, GAP = 16, CAPTION = 42, FOOTER = 24;
    const BG = '#1a1c2c', LIGHT = '#cbd3e0', SHADOW = '#11131f';
    const BLUE = '#41a6f6', DARK = '#333c57';
    const ORANGE = '#ef7d57', GOLD = '#ffcd75', GREEN = '#a7f070';

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

    function mcd(a, b) { return b ? mcd(b, a % b) : a; }

    // La griglia è una sola, uguale per tutti i pannelli: i settori devono
    // avere la stessa forma, altrimenti confrontarli non vuol dire niente.
    // Fra i modi di dividere il pannello in t settori si sceglie quello in cui
    // il bordo della zona attiva cade su una linea per tutti i pannelli che ce
    // la possono fare, cioè quelli il cui denominatore divide t: le colonne
    // devono essere un multiplo del minimo comune multiplo di quei denominatori.
    function griglia(t) {
      let comune = 1;
      panels.forEach((pan) => {
        if (t % pan.d === 0) comune = (comune / mcd(comune, pan.d)) * pan.d;
      });
      const buone = [];
      for (let c = 1; c <= t; c++) if (t % c === 0 && c % comune === 0) buone.push(c);
      // il pannello più quadrato possibile; a parità si preferiscono più
      // colonne, perché il bordo della zona attiva è verticale e su colonne
      // strette si legge meglio
      const quadrato = Math.sqrt(t);
      const scarto = (c) => Math.abs(Math.log(c / quadrato));
      const cols = buone.reduce((best, c) =>
        scarto(c) <= scarto(best) + 1e-9 ? c : best, buone[0]);
      return { cols, rows: t / cols };
    }

    // Testo che si restringe finché non sta nella larghezza data.
    function testoAdattato(txt, cx, y, maxW, dimMax) {
      let dim = dimMax;
      p.textSize(dim);
      while (dim > 9 && p.textWidth(txt) > maxW) { dim -= 1; p.textSize(dim); }
      p.text(txt, cx, y);
    }

    let lastHeight = 0;

    p.setup = () => {
      p.createCanvas(ctx.width, ctx.height);
      p.noSmooth();
      p.noLoop();
    };

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
      const { perRiga, lato, righe } = layout();
      const altoRiga = lato + CAPTION + GAP;

      const needed = 2 * MARGIN + righe * altoRiga - GAP + FOOTER;
      if (Math.abs(needed - lastHeight) > 1) {
        lastHeight = needed;
        ctx.setHeight(needed);
      }

      const { cols, rows } = griglia(t);
      let tutteAllineate = true;

      panels.forEach((pan, i) => {
        const allineata = cols % pan.d === 0;
        if (!allineata) tutteAllineate = false;

        const riga = Math.floor(i / perRiga), col = i % perRiga;
        const inRiga = Math.min(perRiga, panels.length - riga * perRiga);
        const larghezzaRiga = inRiga * lato + (inRiga - 1) * GAP;
        const px = (p.width - larghezzaRiga) / 2 + col * (lato + GAP);
        const py = MARGIN + riga * altoRiga;

        // cornice
        p.noStroke();
        p.fill(SHADOW); p.rect(px + 4, py + 4, lato, lato);
        p.fill(LIGHT); p.rect(px, py, lato, lato);

        // la zona attiva: sempre la stessa porzione del pannello, qualunque
        // sia il numero di settori scelto sullo slider
        const gx = px + FRAME, gy = py + FRAME, g = lato - FRAME * 2;
        const bordo = g * pan.n / pan.d;
        p.fill(DARK); p.rect(gx, gy, g, g);
        p.fill(BLUE); p.rect(gx, gy, bordo, g);

        // la colonna tagliata in due dal bordo, quando la griglia non ci cade
        const cw = g / cols, ch = g / rows;
        if (!allineata) {
          const cTagliata = Math.floor((bordo / cw) + 1e-9);
          p.fill(ORANGE);
          p.rect(gx + cTagliata * cw, gy, cw, g);
          p.fill(BLUE);
          p.rect(gx + cTagliata * cw, gy, bordo - cTagliata * cw, g);
        }

        // le suddivisioni: solo linee sopra al disegno
        p.fill(LIGHT);
        for (let c = 1; c < cols; c++) p.rect(gx + c * cw - 1, gy, 2, g);
        for (let r = 1; r < rows; r++) p.rect(gx, gy + r * ch - 1, g, 2);

        // il bordo della zona attiva, evidenziato
        p.fill(allineata ? GOLD : ORANGE);
        p.rect(gx + bordo - 2, gy, 4, g);

        // didascalie sotto al pannello
        p.textFont('monospace'); p.textStyle(p.BOLD);
        p.textAlign(p.CENTER, p.TOP);
        p.fill(LIGHT);
        testoAdattato(pan.nome + '  ' + pan.n + '/' + pan.d, px + lato / 2, py + lato + 6, lato, 14);
        if (allineata) {
          p.fill(GREEN);
          testoAdattato((pan.n * t / pan.d) + ' settori accesi su ' + t,
                        px + lato / 2, py + lato + 24, lato, 13);
        } else {
          p.fill(ORANGE);
          testoAdattato('il bordo taglia un settore', px + lato / 2, py + lato + 24, lato, 13);
        }
      });

      // riga di chiusura: la griglia comune, quando esiste
      p.textAlign(p.CENTER, p.TOP);
      const fy = MARGIN + righe * altoRiga - GAP + 8;
      if (tutteAllineate) {
        p.fill(GREEN);
        testoAdattato(panels.map((pan) => pan.n + '/' + pan.d + ' = ' +
                      (pan.n * t / pan.d) + '/' + t).join('   '),
                      p.width / 2, fy, p.width - 2 * MARGIN, 15);
      } else {
        p.fill(ORANGE);
        testoAdattato(t + ' settori: non va bene per tutti e due',
                      p.width / 2, fy, p.width - 2 * MARGIN, 15);
      }
    };
  };
})();
