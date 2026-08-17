/**
 * Sketch p5.js riutilizzabile "pattern-costruisci".
 *
 * Uno sketch = un file in static/sketches/, caricato al volo da <x-p5>.
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

  /**
   * "pattern-costruisci" — una griglia vuota su cui lo studente DISEGNA il
   * passo successivo di un pattern figurato, un elemento per cella (click o tap
   * per accendere/spegnere).
   *
   * Il bersaglio è descritto con lo stesso linguaggio di "pattern-colonne":
   * `passo` colonne alte `altezza`, più o meno un pezzo fisso di `fisso`
   * elementi (in coda a destra se positivo, tolto dall'alto dell'ultima
   * colonna se negativo).
   *
   * VERIFICA: forma esatta, posizione libera. Le celle accese vengono traslate
   * in alto a sinistra e confrontate con il bersaglio traslato allo stesso
   * modo: conta la DISPOSIZIONE, non dove l'hai disegnata sulla griglia.
   * Con il flag `goal` lo step si completa quando la forma coincide.
   *
   * Feedback neutro: nessun rosso. L'unico messaggio compare quando il numero
   * di elementi è giusto ma la disposizione no — ricorda la regola, non dà la
   * risposta.
   *
   * Parametri (ctx.params):
   *   passo     quale passo va costruito (default 5)
   *   altezza   elementi per colonna (default 3)
   *   fisso     termine costante, anche negativo: fisso=-2 (default 0)
   *   forma     cerchio | quadrato | stella | triangolo (default cerchio)
   *   righe     righe della griglia (default: altezza + 1)
   *   colonne   colonne della griglia (default: larghezza del bersaglio + 2)
   */
  window.P5Sketches['pattern-costruisci'] = function (p, ctx) {
    const P = ctx.params || {};

    // ---- Parametri ----
    const N = Math.max(1, Math.min(12, Math.round(Number(P.passo) || 5)));
    const H = Math.max(1, Math.min(10, Math.round(Number(P.altezza) || 3)));

    // Il pezzo mancante non può svuotare l'ultima colonna.
    let K = Math.round(Number(P.fisso) || 0);
    if (K < 0) K = -Math.min(H - 1, -K);

    const forma = ['cerchio', 'quadrato', 'stella', 'triangolo']
      .includes(String(P.forma)) ? String(P.forma) : 'cerchio';

    // ---- Il bersaglio, generato dalla stessa regola della figura ----
    function bersaglio() {
      const celle = [];
      for (let c = 0; c < N; c++) {
        for (let r = 0; r < H; r++) {
          if (K < 0 && c === N - 1 && r < -K) continue;   // tolti dall'alto
          celle.push([r, c]);
        }
      }
      for (let i = 0; i < K; i++) {                        // pezzo fisso, in coda
        const col = Math.floor(i / H);
        celle.push([H - 1 - (i % H), N + col]);
      }
      return celle;
    }

    const TARGET = bersaglio();
    const TARGET_W = TARGET.reduce((m, rc) => Math.max(m, rc[1]), 0) + 1;
    const TARGET_N = TARGET.length;

    // Insieme normalizzato: traslato in alto a sinistra, quindi confrontabile
    // con qualunque disposizione uguale disegnata altrove sulla griglia.
    function normalizza(celle) {
      if (!celle.length) return new Set();
      let minR = Infinity;
      let minC = Infinity;
      celle.forEach((rc) => {
        if (rc[0] < minR) minR = rc[0];
        if (rc[1] < minC) minC = rc[1];
      });
      return new Set(celle.map((rc) => (rc[0] - minR) + ',' + (rc[1] - minC)));
    }
    const TARGET_NORM = normalizza(TARGET);

    const COLS = Math.max(TARGET_W, Math.min(18,
      Math.round(Number(P.colonne) || TARGET_W + 2)));
    const ROWS = Math.max(H, Math.min(12,
      Math.round(Number(P.righe) || H + 1)));

    const title = P.titolo != null ? String(P.titolo) : 'Costruisci il passo ' + N;

    // ---- Layout ----
    const PAD = 12;
    const HEADER = 40;
    const FOOTER = 26;
    const MIN_CELL = 18;
    const MAX_CELL = 46;

    let cell = 30;
    let gx0 = PAD;
    let gy0 = HEADER;

    // Colori (token "Quaderno", risolti in setup)
    let COL_INK, COL_INKSOFT, COL_CARTA, COL_GRID, COL_GREEN;

    // ---- Stato ----
    const accese = new Set();     // chiavi "r,c"
    let done = false;

    let message = '';
    let messageAt = 0;
    const MSG_TTL = 4000;

    // Se il goal risulta già completato da storage, ridisegna il bersaglio:
    // lo storage salva solo l'id del goal, non le singole celle.
    if (ctx.completed) {
      const r0 = Math.max(0, ROWS - H);
      const c0 = Math.max(0, Math.floor((COLS - TARGET_W) / 2));
      TARGET.forEach((rc) => accese.add((rc[0] + r0) + ',' + (rc[1] + c0)));
      done = true;
    }

    function setMessage(text) {
      message = text;
      messageAt = p.millis();
    }

    function layout() {
      const W = ctx.width;
      cell = Math.floor((W - 2 * PAD) / COLS);
      cell = Math.max(MIN_CELL, Math.min(cell, MAX_CELL));
      gx0 = Math.round((W - COLS * cell) / 2);
      gy0 = HEADER;
      ctx.setHeight(HEADER + ROWS * cell + FOOTER + PAD);
    }

    function cellaIn(px, py) {
      const c = Math.floor((px - gx0) / cell);
      const r = Math.floor((py - gy0) / cell);
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return null;
      return r + ',' + c;
    }

    function toggleAt(px, py) {
      if (done) return false;
      const key = cellaIn(px, py);
      if (key == null) return false;
      if (accese.has(key)) accese.delete(key);
      else accese.add(key);
      verifica();
      return true;
    }

    // Forma esatta, posizione libera.
    function verifica() {
      if (done) return;
      if (accese.size !== TARGET_N) return;
      const celle = Array.from(accese).map((k) => k.split(',').map(Number));
      const norm = normalizza(celle);
      for (const k of TARGET_NORM) {
        if (!norm.has(k)) {
          setMessage('Il numero ci siamo. Guarda come erano disposti i passi precedenti.');
          return;
        }
      }
      done = true;
      message = '';
      ctx.complete();
    }

    // ---- Input: mouse e touch ----
    p.mousePressed = () => { toggleAt(p.mouseX, p.mouseY); };
    // Su touch blocchiamo lo scroll SOLO se il tap è dentro la griglia: un tocco
    // fuori lascia scorrere la pagina.
    p.touchStarted = () => {
      const hit = toggleAt(p.mouseX, p.mouseY);
      return !hit;
    };

    // ---- Disegno ----
    function disegnaForma(cx, cy, r) {
      if (forma === 'quadrato') {
        p.rect(cx - r, cy - r, 2 * r, 2 * r, r * 0.28);
      } else if (forma === 'triangolo') {
        p.triangle(cx, cy - r, cx + r * 0.92, cy + r * 0.75, cx - r * 0.92, cy + r * 0.75);
      } else if (forma === 'stella') {
        p.beginShape();
        for (let i = 0; i < 10; i++) {
          const raggio = i % 2 === 0 ? r : r * 0.46;
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          p.vertex(cx + Math.cos(a) * raggio, cy + Math.sin(a) * raggio);
        }
        p.endShape(p.CLOSE);
      } else {
        p.circle(cx, cy, 2 * r);
      }
    }

    p.setup = () => {
      COL_INK = cssVar('--ink', '#1B2A4A');
      COL_INKSOFT = cssVar('--ink-soft', '#5A6275');
      COL_CARTA = cssVar('--carta', '#FBFBF6');
      COL_GRID = cssVar('--grid', '#D7E0EC');
      COL_GREEN = cssVar('--spunta', '#1F9D55');
      p.createCanvas(ctx.width, ctx.height);
      layout();
      p.textFont('IBM Plex Mono, monospace');
    };

    p.draw = () => {
      layout();   // riallinea a resize/rotazioni (idempotente)
      p.background(COL_CARTA);
      p.cursor(done ? p.ARROW : p.HAND);
      drawHeader();
      drawGriglia();
      drawFooter();
    };

    function drawHeader() {
      p.push();
      p.noStroke();
      p.textSize(15);
      p.fill(done ? COL_GREEN : COL_INK);
      p.textAlign(p.LEFT, p.CENTER);
      p.text((done ? '✓ ' : '') + title, PAD, HEADER / 2);
      // Contatore neutro: dice quanti ne hai messi, non quanti ne servono.
      p.fill(COL_INKSOFT);
      p.textSize(13);
      p.textAlign(p.RIGHT, p.CENTER);
      p.text('Elementi: ' + accese.size, p.width - PAD, HEADER / 2);
      p.pop();
    }

    function drawGriglia() {
      p.push();
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const x = gx0 + c * cell;
          const y = gy0 + r * cell;
          p.noFill();
          p.stroke(COL_GRID);
          p.strokeWeight(1);
          p.rect(x, y, cell, cell);

          if (accese.has(r + ',' + c)) {
            const bordo = p.color(done ? COL_GREEN : COL_INK);
            const dentro = p.color(done ? COL_GREEN : COL_INK);
            dentro.setAlpha(done ? 55 : 32);
            p.fill(dentro);
            p.stroke(bordo);
            p.strokeWeight(done ? 2.4 : 1.8);
            disegnaForma(x + cell / 2, y + cell / 2, cell * 0.34);
          }
        }
      }
      p.pop();
    }

    function drawFooter() {
      let testo = '';
      let colore = COL_INKSOFT;
      let alpha = 255;

      if (done) {
        testo = 'Disposizione corretta.';
        colore = COL_GREEN;
      } else if (message) {
        const age = p.millis() - messageAt;
        if (age > MSG_TTL) {
          message = '';
        } else {
          testo = message;
          alpha = age > MSG_TTL * 0.66
            ? p.map(age, MSG_TTL * 0.66, MSG_TTL, 255, 0) : 255;
        }
      }
      if (!testo && !done && accese.size === 0) {
        testo = 'Tocca la griglia per disegnare il passo.';
      }
      if (!testo) return;

      const c = p.color(colore);
      c.setAlpha(alpha);
      p.push();
      p.noStroke();
      p.fill(c);
      p.textSize(13);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(testo, p.width / 2, gy0 + ROWS * cell + FOOTER / 2);
      p.pop();
    }
  };
})();
