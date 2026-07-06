/**
 * Sketch p5.js riutilizzabile "rettangoli-divisori".
 *
 * Uno sketch = un file in static/sketches/. Si registra nel registro globale
 * window.P5Sketches e viene caricato AL VOLO dal componente <x-p5> (p5.js) solo
 * nelle pagine che lo usano (`:::p5 sketch=rettangoli-divisori n=6`). La factory
 * gira in p5 "instance mode" e riceve `p` (istanza p5) e `ctx` (il ponte con la
 * piattaforma); i parametri del markdown arrivano in `ctx.params`.
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

  /**
   * "rettangoli-divisori" — l'utente disegna tutti i rettangoli fatti da `n`
   * quadratini. Trascinando dal quadratino del press a quello sotto il puntatore
   * si forma un rettangolo (vertici opposti): è VERDE quando la sua area vale n,
   * BLU (inchiostro) altrimenti. Al rilascio su un'area giusta la coppia a×b
   * viene registrata; a×b e b×a sono equivalenti (una sola voce) e la seconda
   * volta scatta "Già trovato". Contatore ed elenco sono disegnati nel canvas.
   * Non è un goal: non c'è riconoscimento di "trovati tutti" (lasciato a una
   * domanda a parte).
   *
   * Parametri (ctx.params):
   *   n   area bersaglio in quadratini (default 6)
   */
  window.P5Sketches['rettangoli-divisori'] = function (p, ctx) {
    const n = Math.max(1, Math.round(Number(ctx.params.n) || 6));

    // Celle sul lato lungo/corto della griglia. Sul lato lungo serve n (per il
    // rettangolo n×1); sul lato corto basta ceil(sqrt(n)), perché per ogni
    // coppia di divisori a·b = n vale min(a,b) ≤ sqrt(n). +2 di respiro.
    const LONG = n + 1;
    const SHORT = Math.ceil(Math.sqrt(n)) + 2;
    const MIN_CELL = 30;   // sotto questa cella (in orizzontale) si passa a portrait
    const MAX_CELL = 66;   // cap: niente celle enormi su colonne larghe
    const PAD = 12;        // margine interno del canvas
    const HEADER = 66;     // striscia superiore: titolo + contatore + coppie trovate

    // Colori (token "Quaderno", risolti in setup)
    let COL_INK, COL_GRID, COL_CARTA, COL_GREEN, COL_INKSOFT, COL_RED;

    // Layout
    let cols, rows, cell, gx0, gy0, portrait;
    // Stato interazione
    let start = null;   // {c, r} cella di partenza del drag
    let cur = null;     // {c, r} cella corrente
    let dragging = false;
    // Coppie trovate
    const foundKeys = new Set();  // "min×max" già registrati
    const found = [];             // [{a, b}] in ordine di scoperta (a ≤ b)
    let toast = null;             // {text, kind:'ok'|'warn', until}

    function layout() {
      const W = ctx.width;
      // Orizzontale se c'è spazio per il lato lungo a celle decenti; altrimenti
      // portrait (assi scambiati) per restare usabile su mobile.
      portrait = W < LONG * MIN_CELL;
      cols = portrait ? SHORT : LONG;
      rows = portrait ? LONG : SHORT;

      cell = Math.floor((W - 2 * PAD) / cols);
      cell = Math.max(1, Math.min(cell, MAX_CELL));

      const gridW = cols * cell;
      const gridH = rows * cell;
      gx0 = Math.round((W - gridW) / 2);
      gy0 = HEADER;

      // Il canvas si dimensiona esattamente su header + griglia (ctx.setHeight è
      // idempotente: no-op se l'altezza non cambia).
      ctx.setHeight(HEADER + gridH + PAD);
    }

    function cellAt(px, py) {
      const c = Math.floor((px - gx0) / cell);
      const r = Math.floor((py - gy0) / cell);
      if (c < 0 || c >= cols || r < 0 || r >= rows) return null;
      return { c, r };
    }

    function clampCell(px, py) {
      let c = Math.floor((px - gx0) / cell);
      let r = Math.floor((py - gy0) / cell);
      c = Math.max(0, Math.min(cols - 1, c));
      r = Math.max(0, Math.min(rows - 1, r));
      return { c, r };
    }

    function rectFromCells(a, b) {
      const c0 = Math.min(a.c, b.c), c1 = Math.max(a.c, b.c);
      const r0 = Math.min(a.r, b.r), r1 = Math.max(a.r, b.r);
      return { c0, r0, w: c1 - c0 + 1, h: r1 - r0 + 1 };
    }

    function showToast(text, kind) {
      toast = { text, kind, until: p.millis() + 1900 };
    }

    // ---- Input: mouse e touch condividono gli stessi handler ----
    function pStart() {
      const s = cellAt(p.mouseX, p.mouseY);
      if (!s) return;
      start = s; cur = s; dragging = true;
    }
    function pMove() {
      if (!dragging) return;
      cur = clampCell(p.mouseX, p.mouseY);
    }
    function pEnd() {
      if (dragging && start && cur) {
        const rect = rectFromCells(start, cur);
        if (rect.w * rect.h === n) {
          const lo = Math.min(rect.w, rect.h);
          const hi = Math.max(rect.w, rect.h);
          const key = lo + '×' + hi;
          if (foundKeys.has(key)) {
            showToast('Già trovato: ' + rect.w + '×' + rect.h, 'warn');
          } else {
            foundKeys.add(key);
            found.push({ a: lo, b: hi });
            showToast('Trovato ' + rect.w + '×' + rect.h + '!', 'ok');
          }
        }
      }
      dragging = false; start = null; cur = null;
    }

    p.mousePressed = () => { pStart(); };
    p.mouseDragged = () => { pMove(); };
    p.mouseReleased = () => { pEnd(); };
    // Su touch blocchiamo lo scroll della pagina SOLO mentre si sta disegnando
    // (tocco iniziato dentro la griglia): un tocco sull'header o fuori lascia
    // scorrere la pagina — importante col canvas alto in portrait su mobile.
    p.touchStarted = () => { pStart(); return !dragging; };
    p.touchMoved = () => { if (dragging) { pMove(); return false; } return true; };
    p.touchEnded = () => { pEnd(); return true; };

    p.setup = () => {
      COL_INK = cssVar('--ink', '#1B2A4A');
      COL_GRID = cssVar('--grid', '#D7E0EC');
      COL_CARTA = cssVar('--carta', '#FBFBF6');
      COL_GREEN = cssVar('--spunta', '#1F9D55');
      COL_INKSOFT = cssVar('--ink-soft', '#5A6275');
      COL_RED = cssVar('--rossa', '#D7263D');
      p.createCanvas(ctx.width, ctx.height);
      layout();
      p.textFont('IBM Plex Mono, monospace');
    };

    p.draw = () => {
      layout();  // riallinea a eventuali resize/rotazioni (idempotente)
      p.background(COL_CARTA);
      drawHeader();
      drawGrid();
      drawSelection();
      drawToast();
    };

    function drawHeader() {
      const W = p.width;
      p.push();
      // Titolo (sinistra) e contatore (destra)
      p.noStroke();
      p.textSize(15);
      p.fill(COL_INK);
      p.textAlign(p.LEFT, p.TOP);
      p.text('Rettangoli di ' + n + ' quadratini', PAD, 8);
      p.fill(COL_INKSOFT);
      p.textAlign(p.RIGHT, p.TOP);
      p.text('Trovati: ' + found.length, W - PAD, 8);

      // Chip delle coppie trovate (una riga; se sfora la larghezza si tronca)
      let x = PAD;
      const y = 34, chipH = 24;
      p.textSize(13);
      p.textAlign(p.CENTER, p.CENTER);
      for (const f of found) {
        const label = f.a + '×' + f.b;
        const w = p.textWidth(label) + 18;
        if (x + w > W - PAD) break;
        p.stroke(COL_GREEN);
        p.strokeWeight(1.5);
        p.fill(COL_CARTA);
        p.rect(x, y, w, chipH, 6);
        p.noStroke();
        p.fill(COL_GREEN);
        p.text(label, x + w / 2, y + chipH / 2 + 1);
        x += w + 8;
      }
      p.pop();
    }

    function drawGrid() {
      p.push();
      // Celle
      p.stroke(COL_GRID);
      p.strokeWeight(1);
      p.noFill();
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          p.rect(gx0 + c * cell, gy0 + r * cell, cell, cell);
        }
      }
      // Bordo esterno della griglia (inchiostro)
      p.stroke(COL_INK);
      p.strokeWeight(2);
      p.rect(gx0, gy0, cols * cell, rows * cell);
      p.pop();

      // Suggerimento iniziale, finché non si è disegnato/trovato nulla
      if (!dragging && found.length === 0) {
        p.push();
        p.noStroke();
        p.fill(COL_INKSOFT);
        p.textSize(14);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('Trascina per disegnare un rettangolo',
          gx0 + (cols * cell) / 2, gy0 + (rows * cell) / 2);
        p.pop();
      }
    }

    function drawSelection() {
      if (!dragging || !start || !cur) return;
      const rect = rectFromCells(start, cur);
      const area = rect.w * rect.h;
      const ok = area === n;
      const base = ok ? COL_GREEN : COL_INK;   // verde se area giusta, blu (inchiostro) altrimenti

      const x = gx0 + rect.c0 * cell;
      const y = gy0 + rect.r0 * cell;
      const w = rect.w * cell;
      const h = rect.h * cell;

      p.push();
      const fillC = p.color(base);
      fillC.setAlpha(70);
      p.fill(fillC);
      p.stroke(base);
      p.strokeWeight(3);
      p.rect(x, y, w, h);

      // Etichetta dimensioni al centro del rettangolo
      p.noStroke();
      p.fill(base);
      p.textSize(Math.max(13, Math.min(20, cell * 0.5)));
      p.textAlign(p.CENTER, p.CENTER);
      p.text(rect.w + '×' + rect.h + ' = ' + area, x + w / 2, y + h / 2);
      p.pop();
    }

    function drawToast() {
      if (!toast) return;
      if (p.millis() > toast.until) { toast = null; return; }
      const col = toast.kind === 'ok' ? COL_GREEN : COL_RED;
      p.push();
      p.textSize(14);
      p.textAlign(p.CENTER, p.CENTER);
      const tw = p.textWidth(toast.text) + 24;
      const th = 28;
      const x = (p.width - tw) / 2;
      const y = gy0 + 8;   // sopra la griglia
      p.stroke(col);
      p.strokeWeight(2);
      p.fill(COL_CARTA);
      p.rect(x, y, tw, th, 8);
      p.noStroke();
      p.fill(col);
      p.text(toast.text, p.width / 2, y + th / 2 + 1);
      p.pop();
    }
  };
})();
