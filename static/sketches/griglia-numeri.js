/**
 * Sketch p5.js riutilizzabile "griglia-numeri".
 *
 * Uno sketch = un file in static/sketches/. Si registra nel registro globale
 * window.P5Sketches e viene caricato AL VOLO dal componente <x-p5> (p5.js) solo
 * nelle pagine che lo usano (`:::p5 goal sketch=griglia-numeri n=12 target=...`).
 * La factory gira in p5 "instance mode" e riceve `p` (istanza p5) e `ctx` (il
 * ponte con la piattaforma); i parametri del markdown arrivano in `ctx.params`.
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
   * "griglia-numeri" — mostra i numeri da 1 a n in quadratini adiacenti disposti
   * su righe da 10 (n=17 → una riga da 10 e sotto una riga da 7). Ogni numero si
   * clicca per selezionarlo/deselezionarlo. Con il flag `goal`, lo step è completo
   * quando i numeri selezionati coincidono ESATTAMENTE con il `target` d'autore
   * (tutti e soli). Feedback neutro: nessun rosso, ci si accorge da soli.
   *
   * Parametri (ctx.params):
   *   n       ultimo numero mostrato, interi 1..n (default 12)
   *   target  numeri "giusti" separati da virgola, es. target=1,2,3,4,6,12.
   *           Senza target lo sketch resta interattivo ma non completa mai.
   *   titolo  testo dell'intestazione (default "Seleziona i numeri")
   */
  window.P5Sketches['griglia-numeri'] = function (p, ctx) {
    const n = Math.max(1, Math.round(Number(ctx.params.n) || 12));
    const COLS = 10;                       // righe da 10: colonne fisse
    const rowsCount = Math.ceil(n / COLS); // numero di righe
    const title = ctx.params.titolo != null
      ? String(ctx.params.titolo)
      : 'Seleziona i numeri';

    // Target: lista d'autore normalizzata a un Set di interi in [1, n]. Arriva
    // come stringa "1,2,3" (o come numero se è un solo valore). Valori fuori
    // intervallo o non interi vengono scartati.
    const target = new Set();
    if (ctx.params.target != null && ctx.params.target !== '') {
      String(ctx.params.target).split(',').forEach((tok) => {
        const v = parseInt(tok.trim(), 10);
        if (Number.isInteger(v) && v >= 1 && v <= n) target.add(v);
      });
    }

    // Layout
    const MIN_CELL = 26;   // cella minima: 10 colonne stanno anche su mobile stretto
    const MAX_CELL = 66;   // cap: niente celle enormi su colonne larghe
    const PAD = 12;        // margine interno del canvas
    const HEADER = 40;     // striscia superiore: titolo + contatore

    // Colori (token "Quaderno", risolti in setup)
    let COL_INK, COL_GRID, COL_CARTA, COL_GREEN, COL_INKSOFT;

    let cell, gx0, gy0;    // dimensione cella e origine della griglia

    // Stato: numeri selezionati. Se il goal risulta già completato da storage,
    // pre-seleziona il target così al reload la griglia mostra lo stato "fatto"
    // (lo storage salva solo l'id del goal, non i singoli quadretti).
    const selected = new Set();
    let done = false;
    if (ctx.completed && target.size > 0) {
      target.forEach((v) => selected.add(v));
      done = true;
    }

    function layout() {
      const W = ctx.width;
      cell = Math.floor((W - 2 * PAD) / COLS);
      cell = Math.max(MIN_CELL, Math.min(cell, MAX_CELL));

      const gridW = COLS * cell;
      const gridH = rowsCount * cell;
      gx0 = Math.round((W - gridW) / 2);
      gy0 = HEADER;

      // Il canvas si dimensiona esattamente su header + griglia (idempotente).
      ctx.setHeight(HEADER + gridH + PAD);
    }

    // Cella (riga, col) sotto il punto, oppure null se fuori dalla griglia o su
    // una posizione senza numero (coda dell'ultima riga oltre n).
    function numberAt(px, py) {
      const c = Math.floor((px - gx0) / cell);
      const r = Math.floor((py - gy0) / cell);
      if (c < 0 || c >= COLS || r < 0 || r >= rowsCount) return null;
      const num = r * COLS + c + 1;
      return num <= n ? num : null;
    }

    // Coordinate (x, y) dell'angolo alto-sinistro del quadretto del numero.
    function cellXY(num) {
      const idx = num - 1;
      const c = idx % COLS;
      const r = Math.floor(idx / COLS);
      return { x: gx0 + c * cell, y: gy0 + r * cell };
    }

    function toggleAt(px, py) {
      const num = numberAt(px, py);
      if (num == null) return false;
      if (selected.has(num)) selected.delete(num);
      else selected.add(num);
      checkComplete();
      return true;
    }

    // Completo quando i selezionati sono esattamente il target (tutti e soli).
    function checkComplete() {
      if (done || target.size === 0) return;
      if (selected.size !== target.size) return;
      for (const v of selected) {
        if (!target.has(v)) return;
      }
      done = true;
      ctx.complete();
    }

    // ---- Input: mouse e touch ----
    p.mousePressed = () => { toggleAt(p.mouseX, p.mouseY); };
    // Su touch blocchiamo lo scroll SOLO se il tap è dentro un quadretto: un tocco
    // fuori dalla griglia lascia scorrere la pagina (canvas alto su mobile).
    p.touchStarted = () => {
      const hit = toggleAt(p.mouseX, p.mouseY);
      return !hit;
    };

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
      drawGrid();
    };

    function drawHeader() {
      const W = p.width;
      p.push();
      p.noStroke();
      p.textSize(15);
      // Titolo (sinistra): verde a completamento, inchiostro altrimenti.
      p.fill(done ? COL_GREEN : COL_INK);
      p.textAlign(p.LEFT, p.CENTER);
      p.text((done ? '✓ ' : '') + title, PAD, HEADER / 2);
      // Contatore neutro (destra): quanti selezionati, senza rivelare il target.
      p.fill(COL_INKSOFT);
      p.textSize(13);
      p.textAlign(p.RIGHT, p.CENTER);
      p.text('Selezionati: ' + selected.size, W - PAD, HEADER / 2);
      p.pop();
    }

    function drawGrid() {
      p.push();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(Math.max(13, Math.min(22, cell * 0.42)));
      for (let num = 1; num <= n; num++) {
        const { x, y } = cellXY(num);
        const isSel = selected.has(num);

        // Quadretto: riempimento verde tenue se selezionato, carta altrimenti.
        if (isSel) {
          const fillC = p.color(COL_GREEN);
          fillC.setAlpha(48);
          p.fill(fillC);
          p.stroke(COL_GREEN);
          p.strokeWeight(2.5);
        } else {
          p.fill(COL_CARTA);
          p.stroke(COL_GRID);
          p.strokeWeight(1.5);
        }
        p.rect(x, y, cell, cell, 4);

        // Numero
        p.noStroke();
        p.fill(isSel ? COL_GREEN : COL_INK);
        p.textStyle(isSel ? p.BOLD : p.NORMAL);
        p.text(num, x + cell / 2, y + cell / 2 + 1);
      }
      p.textStyle(p.NORMAL);
      p.pop();
    }
  };
})();
