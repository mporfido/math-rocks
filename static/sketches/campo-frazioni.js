/**
 * Sketch p5.js riutilizzabile "campo-frazioni".
 *
 * Mappa schematica di un terreno quadrato diviso in zone, appoggiata a una
 * griglia 4×4 di "mattoncini" (l'unità di misura della lezione le-frazioni).
 * Serve come figura di riferimento per contare i quadratini di ogni zona e,
 * con `modo=conta`, come esercizio-goal.
 *
 * Parametri (ctx.params):
 *   campo    'rossi' (zone A–F) | 'bianchi' (zone X, Y, Z, W). Default 'rossi'.
 *   modo     'mostra' (default, sola figura) | 'conta' (quadratini cliccabili)
 *   zona     lettera della zona da contare in modo=conta (es. zona=A)
 *   rivela   nome di una variabile del modello (es. rivela=g): la griglia dei
 *            mattoncini compare a scaglioni, tante righe quanto vale la
 *            variabile (0..4). Senza il parametro la griglia è sempre intera.
 *   titolo   testo dell'intestazione (default: nome del campo)
 *
 * Contratto:  window.P5Sketches['<nome>'] = function (p, ctx) {...}
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};

  // Legge un token CSS (--nome) dal :root, con fallback. Così i colori seguono
  // l'identità "Quaderno" senza cablare hex nello sketch.
  function cssVar(name, fallback) {
    try {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) {
      return fallback;
    }
  }

  const N = 4;  // lato della griglia: 4×4 = 16 mattoncini

  // Celle come [riga, colonna], riga 0 in alto. Le tinte richiamano le colture
  // della foto (verde, grano, arato) restando tenui come una matita colorata.
  const CAMPI = {
    rossi: [
      { id: 'A', col: '#7FB069', cells: [[0, 0], [0, 1], [1, 0], [1, 1]] },
      { id: 'C', col: '#4F8F4A', cells: [[0, 2], [1, 2]] },
      { id: 'B', col: '#E3B23C', cells: [[0, 3], [1, 3], [2, 3], [3, 3]] },
      { id: 'F', col: '#A9C48A', cells: [[2, 0], [2, 1], [3, 1]] },
      { id: 'E', col: '#B5764F', cells: [[3, 0]] },
      { id: 'D', col: '#C08B5C', cells: [[2, 2], [3, 2]] },
    ],
    bianchi: [
      { id: 'X', col: '#7FB069', cells: [[0, 0], [0, 1], [0, 2], [0, 3],
                                         [1, 0], [1, 1], [1, 2], [1, 3]] },
      { id: 'Y', col: '#E3B23C', cells: [[2, 0], [2, 1], [3, 0], [3, 1]] },
      { id: 'W', col: '#A9C48A', cells: [[2, 2], [3, 2]] },
      { id: 'Z', col: '#C08B5C', cells: [[2, 3], [3, 3]] },
    ],
  };

  window.P5Sketches['campo-frazioni'] = function (p, ctx) {
    const nomeCampo = String(ctx.params.campo || 'rossi').toLowerCase();
    const zone = CAMPI[nomeCampo] || CAMPI.rossi;
    const modo = String(ctx.params.modo || 'mostra').toLowerCase();
    const conta = modo === 'conta';
    const rivelaVar = ctx.params.rivela != null && ctx.params.rivela !== ''
      ? String(ctx.params.rivela)
      : null;

    // Zona bersaglio (modo=conta): l'insieme delle sue celle è il target.
    const zonaId = ctx.params.zona != null ? String(ctx.params.zona).toUpperCase() : null;
    const zonaTarget = zone.find((z) => z.id === zonaId) || null;

    const title = ctx.params.titolo != null
      ? String(ctx.params.titolo)
      : (conta && zonaTarget
        ? 'Clicca i quadratini della zona ' + zonaTarget.id
        : 'Il campo della famiglia ' + (nomeCampo === 'bianchi' ? 'Bianchi' : 'Rossi'));

    // Layout
    const PAD = 12;
    const HEADER = 34;
    const MAX_SIDE = 360;   // il campo non cresce oltre: resta leggibile
    const MIN_SIDE = 220;

    let COL_INK, COL_GRID, COL_CARTA, COL_GREEN, COL_INKSOFT;
    let side, cell, gx0, gy0;

    // Mappa cella → zona, per sapere dove passano i confini.
    const owner = {};
    zone.forEach((z) => z.cells.forEach(([r, c]) => { owner[r + ',' + c] = z.id; }));

    // Stato (modo=conta): celle selezionate, come chiavi "r,c".
    const selected = new Set();
    let done = false;
    if (ctx.completed && zonaTarget) {
      zonaTarget.cells.forEach(([r, c]) => selected.add(r + ',' + c));
      done = true;
    }

    function layout() {
      side = Math.max(MIN_SIDE, Math.min(ctx.width - 2 * PAD, MAX_SIDE));
      cell = side / N;
      gx0 = Math.round((ctx.width - side) / 2);
      gy0 = HEADER;
      ctx.setHeight(HEADER + side + PAD);
    }

    // Quante righe di griglia mostrare: tutte, o quelle "rivelate" dallo slider.
    function righeVisibili() {
      if (!rivelaVar) return N;
      const v = Number(ctx.model[rivelaVar]);
      if (!Number.isFinite(v)) return 0;
      return Math.max(0, Math.min(N, Math.round(v)));
    }

    function cellAt(px, py) {
      const c = Math.floor((px - gx0) / cell);
      const r = Math.floor((py - gy0) / cell);
      if (c < 0 || c >= N || r < 0 || r >= N) return null;
      return r + ',' + c;
    }

    function toggleAt(px, py) {
      if (!conta) return false;
      const key = cellAt(px, py);
      if (key == null) return false;
      if (selected.has(key)) selected.delete(key);
      else selected.add(key);
      checkComplete();
      return true;
    }

    // Completo quando le celle selezionate sono esattamente quelle della zona.
    function checkComplete() {
      if (done || !zonaTarget) return;
      if (selected.size !== zonaTarget.cells.length) return;
      for (const [r, c] of zonaTarget.cells) {
        if (!selected.has(r + ',' + c)) return;
      }
      done = true;
      ctx.complete();
    }

    p.mousePressed = () => { toggleAt(p.mouseX, p.mouseY); };
    // Su touch blocchiamo lo scroll SOLO se il tap cade dentro il campo.
    p.touchStarted = () => !toggleAt(p.mouseX, p.mouseY);

    p.setup = () => {
      COL_INK = cssVar('--ink', '#1B2A4A');
      COL_GRID = cssVar('--grid', '#D7E0EC');
      COL_CARTA = cssVar('--carta', '#FBFBF6');
      COL_GREEN = cssVar('--spunta', '#1F9D55');
      COL_INKSOFT = cssVar('--ink-soft', '#5A6275');
      p.createCanvas(ctx.width, ctx.height);
      layout();
      p.textFont('IBM Plex Mono, monospace');
    };

    p.draw = () => {
      layout();  // riallinea a eventuali resize/rotazioni (idempotente)
      p.background(COL_CARTA);
      drawHeader();
      drawZoneFills();
      drawUnitGrid();
      drawZoneBorders();
      if (conta) drawSelection();
      drawLabels();
    };

    function drawHeader() {
      p.push();
      p.noStroke();
      p.textSize(14);
      p.fill(done ? COL_GREEN : COL_INK);
      p.textAlign(p.LEFT, p.CENTER);
      p.text((done ? '✓ ' : '') + title, PAD, HEADER / 2);
      if (conta) {
        p.fill(COL_INKSOFT);
        p.textSize(13);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text('Selezionati: ' + selected.size, p.width - PAD, HEADER / 2);
      }
      p.pop();
    }

    function drawZoneFills() {
      p.push();
      p.noStroke();
      zone.forEach((z) => {
        const c = p.color(z.col);
        c.setAlpha(120);
        p.fill(c);
        z.cells.forEach(([r, col]) => {
          p.rect(gx0 + col * cell, gy0 + r * cell, cell, cell);
        });
      });
      p.pop();
    }

    // Reticolo dei mattoncini: tratteggio leggero, riga per riga se `rivela`.
    function drawUnitGrid() {
      const righe = righeVisibili();
      if (righe === 0) return;
      p.push();
      p.stroke(COL_GRID);
      p.strokeWeight(1.5);
      p.noFill();
      for (let r = 0; r < righe; r++) {
        for (let c = 0; c < N; c++) {
          p.rect(gx0 + c * cell, gy0 + r * cell, cell, cell);
        }
      }
      p.pop();
    }

    // Confini di zona: un lato si disegna solo se separa due zone diverse
    // (o se è il bordo esterno del campo).
    function drawZoneBorders() {
      p.push();
      p.stroke(COL_INK);
      p.strokeWeight(3);
      p.strokeCap(p.SQUARE);
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const me = owner[r + ',' + c];
          const x = gx0 + c * cell, y = gy0 + r * cell;
          if (owner[(r - 1) + ',' + c] !== me) p.line(x, y, x + cell, y);
          if (owner[(r + 1) + ',' + c] !== me) p.line(x, y + cell, x + cell, y + cell);
          if (owner[r + ',' + (c - 1)] !== me) p.line(x, y, x, y + cell);
          if (owner[r + ',' + (c + 1)] !== me) p.line(x + cell, y, x + cell, y + cell);
        }
      }
      p.pop();
    }

    function drawSelection() {
      p.push();
      const fillC = p.color(COL_GREEN);
      fillC.setAlpha(70);
      selected.forEach((key) => {
        const [r, c] = key.split(',').map(Number);
        p.fill(fillC);
        p.stroke(COL_GREEN);
        p.strokeWeight(2.5);
        p.rect(gx0 + c * cell + 3, gy0 + r * cell + 3, cell - 6, cell - 6, 4);
      });
      p.pop();
    }

    // Etichetta al centro (baricentro) delle celle della zona.
    function drawLabels() {
      p.push();
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(Math.max(14, Math.min(26, cell * 0.42)));
      p.textStyle(p.BOLD);
      zone.forEach((z) => {
        let sr = 0, sc = 0;
        z.cells.forEach(([r, c]) => { sr += r + 0.5; sc += c + 0.5; });
        const x = gx0 + (sc / z.cells.length) * cell;
        const y = gy0 + (sr / z.cells.length) * cell;
        // Alone di carta per staccare la lettera dal colore della zona.
        p.fill(COL_CARTA);
        for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) {
          p.text(z.id, x + dx, y + dy);
        }
        p.fill(COL_INK);
        p.text(z.id, x, y);
      });
      p.textStyle(p.NORMAL);
      p.pop();
    }
  };
})();
