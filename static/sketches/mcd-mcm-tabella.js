/**
 * Sketch p5.js riutilizzabile "mcd-mcm-tabella".
 *
 * Uno sketch = un file in static/sketches/. Si registra nel registro globale
 * window.P5Sketches e viene caricato AL VOLO dal componente <x-p5> (p5.js) solo
 * nelle pagine che lo usano (`:::p5 goal sketch=mcd-mcm-tabella a=60 b=90`).
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

  // Apici Unicode per la forma con le potenze (es. 2² × 3): copre esponenti 0..99,
  // più che sufficienti per i numeri didattici.
  const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  function superscript(k) {
    return String(k).split('').map((d) => SUP[Number(d)]).join('');
  }

  /**
   * "mcd-mcm-tabella" — procedura guidata per MCD e mcm con la regola classica a
   * partire dalle scomposizioni in fattori primi (che si assume lo studente abbia
   * già svolto). Le colonne sono i primi che compaiono in `a` o `b`. Nelle due
   * righe in alto lo studente scrive l'esponente con cui ogni primo compare in `a`
   * e in `b` (0 dove non compare): la base è l'intestazione di colonna, la cella
   * rende la potenza (2², 3, …). Nella sezione "calcolo" indica, per ogni fattore,
   * l'esponente da usare: il PIÙ PICCOLO per il MCD, il PIÙ GRANDE per il mcm (0
   * esclude il fattore). Le celle corrette diventano verdi; un esponente sbagliato
   * riceve un avviso mirato che ricorda la regola senza dare la risposta. Man mano
   * che una riga di calcolo è completa compare il prodotto (MCD = 2¹ × 3¹ = 6).
   * Con il flag `goal` lo step è completo quando tutte le celle richieste sono
   * corrette.
   *
   * Parametri (ctx.params):
   *   a, b    i due numeri interi >= 2 (default 60, 90)
   *   modo    'mcd' | 'mcm' | 'entrambi' (default 'entrambi')
   *   titolo  testo dell'intestazione (default "MCD e mcm con le scomposizioni")
   */
  window.P5Sketches['mcd-mcm-tabella'] = function (p, ctx) {
    const A = Math.max(2, Math.round(Number(ctx.params.a) || 60));
    const B = Math.max(2, Math.round(Number(ctx.params.b) || 90));
    const modo = ['mcd', 'mcm', 'entrambi']
      .includes(String(ctx.params.modo)) ? String(ctx.params.modo) : 'entrambi';
    const wantMcd = modo === 'mcd' || modo === 'entrambi';
    const wantMcm = modo === 'mcm' || modo === 'entrambi';
    const title = ctx.params.titolo != null
      ? String(ctx.params.titolo)
      : 'MCD e mcm con le scomposizioni';

    // ---- Matematica (interna) ----
    function smallestPrimeFactor(m) {
      if (m % 2 === 0) return 2;
      for (let d = 3; d * d <= m; d += 2) {
        if (m % d === 0) return d;
      }
      return m;
    }
    // Esponente (molteplicità) del primo pr in num; 0 se non lo divide.
    function expOf(pr, num) {
      let e = 0;
      let m = num;
      while (m % pr === 0) { e++; m /= pr; }
      return e;
    }
    // Unione ordinata dei primi che dividono A o B.
    function primeSet(num) {
      const out = [];
      let m = num;
      while (m > 1) {
        const d = smallestPrimeFactor(m);
        out.push(d);
        while (m % d === 0) m /= d;
      }
      return out;
    }
    const primes = Array.from(new Set([...primeSet(A), ...primeSet(B)]))
      .sort((x, y) => x - y);
    const K = primes.length;

    // Esponenti attesi per ogni riga.
    const expA = primes.map((pr) => expOf(pr, A));
    const expB = primes.map((pr) => expOf(pr, B));
    const expMcd = primes.map((_, i) => Math.min(expA[i], expB[i])); // minimo
    const expMcm = primes.map((_, i) => Math.max(expA[i], expB[i])); // massimo

    // ---- Celle editabili ----
    // Ogni cella: riga logica ('a'|'b'|'mcd'|'mcm'), indice colonna i, valore
    // atteso e valore inserito (null = vuoto). Una sola cella è "attiva" e usa il
    // buffer `typed`; le altre mostrano il valore confermato.
    const rows = [
      { key: 'a', label: String(A), exp: expA },
      { key: 'b', label: String(B), exp: expB },
    ];
    const calcRows = [];
    if (wantMcd) calcRows.push({ key: 'mcd', label: 'MCD', exp: expMcd });
    if (wantMcm) calcRows.push({ key: 'mcm', label: 'mcm', exp: expMcm });

    const cells = [];
    [...rows, ...calcRows].forEach((r) => {
      for (let i = 0; i < K; i++) {
        cells.push({ rowKey: r.key, i, exp: r.exp[i], value: null });
      }
    });

    let active = -1;      // indice in `cells` della cella attiva (-1 = nessuna)
    let typed = '';       // buffer digitato nella cella attiva
    let done = false;

    // Ripristino da storage: se il goal risulta già completato, pre-compila tutte
    // le celle col valore corretto e mostra lo stato "fatto".
    if (ctx.completed) {
      cells.forEach((c) => { c.value = c.exp; });
      done = true;
    }

    // Una cella è "a posto": valore uguale all'atteso; per l'esponente 0 va bene
    // anche lasciarla vuota (lo 0 è sottinteso).
    function satisfied(c) {
      return c.value === c.exp || (c.exp === 0 && c.value == null);
    }
    // La scomposizione (righe a/b) è completa quando tutte le sue celle sono a posto.
    function tableComplete() {
      return cells.every((c) =>
        (c.rowKey !== 'a' && c.rowKey !== 'b') || satisfied(c));
    }
    // Le celle della sezione calcolo restano bloccate finché la scomposizione non
    // è completa: prima si trascrivono le scomposizioni, poi si sceglie min/max.
    function cellEditable(c) {
      return c.rowKey === 'a' || c.rowKey === 'b' || tableComplete();
    }
    // Prossima cella modificabile dopo `from` (per l'avanzamento con Invio/Tab).
    function nextEditable(from) {
      for (let i = from + 1; i < cells.length; i++) {
        if (cellEditable(cells[i])) return i;
      }
      return -1;
    }

    // Messaggi di feedback (avvisi guidati), con TTL come in scomposizione-fattori.
    let message = '';
    let messageKind = 'neutral';  // 'neutral' | 'warn'
    let messageAt = 0;
    const MSG_TTL = 4000;
    function setMessage(text, kind) {
      message = text;
      messageKind = kind || 'neutral';
      messageAt = p.millis();
    }

    // Colori (token "Quaderno", risolti in setup)
    let COL_INK, COL_INKSOFT, COL_CARTA, COL_GRID, COL_GREEN, COL_WARN, COL_GREENSOFT, COL_LOCKED;

    // Layout
    const PAD = 14;
    const HEADER = 40;      // titolo
    const COLHEAD_H = 30;   // riga intestazioni colonne (i primi)
    const ROW_H = 42;       // altezza riga (tabella e calcolo)
    const GAP = 18;         // stacco tra tabella e sezione calcolo
    const CALCLABEL_H = 24; // etichetta "Esponenti per il calcolo"
    const MSG_H = 24;
    const RESULT_H = 28;
    const CELL_INSET = 4;   // margine interno del riquadro nella cella
    const MINCOL = 44;
    const MAXCOL = 96;

    let labelW, colW, gridX0;
    const rowY = {};        // y in alto di ogni riga logica (per chiave)
    let yColHead, yCalcLabel, yMsg, yResult0, yDivider;

    function layout() {
      const W = ctx.width;
      labelW = 58;
      colW = (W - 2 * PAD - labelW) / K;
      colW = Math.max(MINCOL, Math.min(colW, MAXCOL));
      gridX0 = PAD + labelW;

      yColHead = HEADER;
      rowY.a = yColHead + COLHEAD_H;
      rowY.b = rowY.a + ROW_H;
      const tableBottom = rowY.b + ROW_H;
      yDivider = tableBottom + GAP / 2;
      yCalcLabel = tableBottom + GAP;
      const calcStart = yCalcLabel + CALCLABEL_H;
      calcRows.forEach((r, j) => { rowY[r.key] = calcStart + j * ROW_H; });
      const calcBottom = calcStart + calcRows.length * ROW_H;
      yMsg = calcBottom;
      yResult0 = yMsg + MSG_H;

      const total = yResult0 + calcRows.length * RESULT_H + PAD;
      ctx.setHeight(total);
    }

    // Geometria del riquadro (box) di una cella.
    function cellBox(c) {
      const x = gridX0 + c.i * colW + CELL_INSET;
      const y = rowY[c.rowKey] + CELL_INSET;
      return { x, y, w: colW - 2 * CELL_INSET, h: ROW_H - 2 * CELL_INSET };
    }

    function cellAt(px, py) {
      for (let idx = 0; idx < cells.length; idx++) {
        const b = cellBox(cells[idx]);
        if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return idx;
      }
      return -1;
    }

    // Conferma il buffer nella cella attiva e valuta il feedback.
    function commit() {
      if (active < 0) return;
      const c = cells[active];
      if (typed === '') { c.value = null; return; }
      const v = parseInt(typed, 10);
      c.value = Number.isNaN(v) ? null : v;
      if (c.value == null) return;

      if (c.value === c.exp) {
        message = '';
      } else {
        const pr = primes[c.i];
        if (c.rowKey === 'a' || c.rowKey === 'b') {
          const num = c.rowKey === 'a' ? A : B;
          setMessage('Controlla la scomposizione di ' + num
            + ': con quale esponente compare il fattore ' + pr + '?', 'warn');
        } else if (c.rowKey === 'mcd') {
          setMessage('Per il MCD, di ogni fattore prendi l\'esponente PIÙ PICCOLO '
            + '(0 se non è comune).', 'warn');
        } else {
          setMessage('Per il mcm, di ogni fattore prendi l\'esponente PIÙ GRANDE.', 'warn');
        }
      }
      checkComplete();
    }

    // Attiva una cella, portando dentro il buffer il suo valore attuale.
    function activate(idx) {
      commit();
      active = idx;
      typed = (idx >= 0 && cells[idx].value != null) ? String(cells[idx].value) : '';
    }

    function checkComplete() {
      if (done) return;
      for (const c of cells) {
        if (!satisfied(c)) return;
      }
      done = true;
      active = -1;
      ctx.complete();
    }

    // ---- Input: tastiera ----
    p.keyPressed = () => {
      if (done || active < 0) return undefined;
      if (p.keyCode === p.ENTER || p.keyCode === p.TAB) {
        commit();
        const nx = nextEditable(active);
        if (nx >= 0) activate(nx);
        else active = -1;
        return false;   // TAB: non spostare il focus fuori dal canvas
      }
      if (p.keyCode === p.BACKSPACE) { typed = typed.slice(0, -1); return false; }
      if (p.key >= '0' && p.key <= '9') {
        if (typed.length < 2) typed += p.key;   // esponenti a una-due cifre
        return false;
      }
      return undefined;
    };

    // ---- Input: mouse e touch ----
    function press(px, py) {
      if (done) return false;
      const idx = cellAt(px, py);
      if (idx >= 0 && !cellEditable(cells[idx])) {
        commit();
        active = -1;
        setMessage('Prima completa la scomposizione di ' + A + ' e ' + B
          + ' qui sopra.', 'neutral');
        return true;           // tap su cella (bloccata): resta dentro l'area
      }
      activate(idx);           // idx == -1 conferma e deseleziona
      return idx >= 0;
    }
    p.mousePressed = () => { press(p.mouseX, p.mouseY); };
    // Su touch blocchiamo lo scroll SOLO se il tap è dentro una cella: un tocco
    // fuori dalla tabella lascia scorrere la pagina (canvas alto su mobile).
    p.touchStarted = () => !press(p.mouseX, p.mouseY);

    p.setup = () => {
      COL_INK = cssVar('--ink', '#1B2A4A');
      COL_INKSOFT = cssVar('--ink-soft', '#5A6275');
      COL_CARTA = cssVar('--carta', '#FBFBF6');
      COL_GRID = cssVar('--grid', '#D7E0EC');
      COL_GREEN = cssVar('--spunta', '#1F9D55');
      COL_GREENSOFT = cssVar('--spunta-soft', '#EAF7EF');
      COL_WARN = cssVar('--rossa', cssVar('--error', '#D7263D'));
      COL_LOCKED = cssVar('--locked', '#A7AEBE');
      p.createCanvas(ctx.width, ctx.height);
      layout();
      p.textFont('IBM Plex Mono, monospace');
    };

    p.draw = () => {
      layout();   // riallinea a resize/rotazioni (idempotente)
      p.background(COL_CARTA);
      drawHeader();
      drawColHeaders();
      drawRows();
      drawCalcSection();
      drawMessage();
      drawResults();
    };

    function drawHeader() {
      p.push();
      p.noStroke();
      p.textSize(15);
      p.fill(done ? COL_GREEN : COL_INK);
      p.textAlign(p.LEFT, p.CENTER);
      p.text((done ? '✓ ' : '') + title, PAD, HEADER / 2);
      p.pop();
    }

    function drawColHeaders() {
      p.push();
      p.noStroke();
      p.fill(COL_INKSOFT);
      p.textSize(16);
      p.textAlign(p.CENTER, p.CENTER);
      const cy = yColHead + COLHEAD_H / 2;
      for (let i = 0; i < K; i++) {
        p.text(primes[i], gridX0 + i * colW + colW / 2, cy);
      }
      p.pop();
    }

    // Rende il contenuto di una cella (potenza) dato il valore v e la colonna i.
    // 0 → "0" (fattore assente/escluso), 1 → base, >=2 → base^esponente.
    function powerLabel(v, i) {
      // Sempre base + esponente in apice, anche per 2¹ e 5⁰: così è chiaro che lo
      // zero è un ESPONENTE (5⁰), non un fattore 0 che compare nella scomposizione.
      return primes[i] + superscript(v);
    }

    function drawCell(c) {
      const b = cellBox(c);
      const locked = !done && !cellEditable(c);
      const isActive = cells[active] === c && !done;
      const isCorrect = c.value != null && c.value === c.exp;

      p.push();
      // Riquadro
      if (locked) {
        p.fill(COL_CARTA);
        p.stroke(COL_LOCKED);
        p.strokeWeight(1.5);
      } else if (isCorrect) {
        p.fill(COL_GREENSOFT);
        p.stroke(COL_GREEN);
        p.strokeWeight(2);
      } else if (isActive) {
        p.fill(COL_CARTA);
        p.stroke(COL_INK);
        p.strokeWeight(2);
      } else {
        p.fill(COL_CARTA);
        p.stroke(COL_GRID);
        p.strokeWeight(1.5);
      }
      p.rect(b.x, b.y, b.w, b.h, 5);

      // Contenuto
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(17);
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      if (locked) {
        p.fill(COL_LOCKED);
        p.text('?', cx, cy);
      } else if (isActive) {
        const blink = p.frameCount % 60 < 30;
        p.fill(COL_INK);
        if (typed !== '') {
          p.text(typed + (blink ? '❘' : ''), cx, cy);
        } else {
          p.fill(blink ? COL_INK : COL_INKSOFT);
          p.text(blink ? '❘' : '?', cx, cy);
        }
      } else if (c.value != null) {
        p.fill(isCorrect ? COL_GREEN : COL_INK);
        p.text(powerLabel(c.value, c.i), cx, cy);   // valore 0 → "0"
      } else if (c.exp === 0 && done) {
        // A esercizio concluso le celle a esponente 0 lasciate vuote mostrano l'apice.
        p.fill(COL_GREEN);
        p.text(powerLabel(0, c.i), cx, cy);
      } else {
        // Cella vuota da compilare: '?' non rivela dove va lo zero.
        p.fill(COL_INKSOFT);
        p.text('?', cx, cy);
      }
      p.pop();
    }

    function drawRowLabel(label, y, col) {
      p.push();
      p.noStroke();
      p.fill(col);
      p.textSize(15);
      p.textAlign(p.RIGHT, p.CENTER);
      p.text(label, PAD + labelW - 10, y + ROW_H / 2);
      p.pop();
    }

    // Puntino di moltiplicazione tra una colonna e l'altra: la riga si legge come
    // un prodotto di potenze (2² · 3¹ · 0 · 7¹).
    function drawMultDots(y) {
      if (K < 2) return;
      p.push();
      p.noStroke();
      p.fill(COL_INKSOFT);
      p.textSize(16);
      p.textAlign(p.CENTER, p.CENTER);
      const cy = y + ROW_H / 2;
      for (let i = 0; i < K - 1; i++) {
        p.text('·', gridX0 + (i + 1) * colW, cy);
      }
      p.pop();
    }

    function drawRows() {
      rows.forEach((r) => {
        drawRowLabel(r.label, rowY[r.key], COL_INK);
        drawMultDots(rowY[r.key]);
      });
      cells.filter((c) => c.rowKey === 'a' || c.rowKey === 'b').forEach(drawCell);
    }

    function drawCalcSection() {
      const locked = !done && !tableComplete();
      // Divisore tra tabella e sezione calcolo.
      p.push();
      p.stroke(COL_GRID);
      p.strokeWeight(1.5);
      p.line(PAD, yDivider, ctx.width - PAD, yDivider);
      // Etichetta della sezione (grigia e con avviso finché la tabella è incompleta).
      p.noStroke();
      p.fill(locked ? COL_LOCKED : COL_INKSOFT);
      p.textSize(13);
      p.textAlign(p.LEFT, p.CENTER);
      const label = locked
        ? 'Esponente per il calcolo — prima completa la tabella qui sopra'
        : 'Esponente da usare per il calcolo:';
      p.text(label, PAD, yCalcLabel + CALCLABEL_H / 2);
      p.pop();

      calcRows.forEach((r) => {
        const rowDone = cells
          .filter((c) => c.rowKey === r.key)
          .every(satisfied);
        const col = locked ? COL_LOCKED : (rowDone ? COL_INK : COL_INKSOFT);
        drawRowLabel(r.label, rowY[r.key], col);
        if (!locked) drawMultDots(rowY[r.key]);
      });
      cells
        .filter((c) => c.rowKey === 'mcd' || c.rowKey === 'mcm')
        .forEach(drawCell);
    }

    function drawMessage() {
      if (!message) return;
      const age = p.millis() - messageAt;
      if (age > MSG_TTL) { message = ''; return; }
      const fade = age > MSG_TTL * 0.75
        ? p.map(age, MSG_TTL * 0.75, MSG_TTL, 255, 0)
        : 255;
      const c = p.color(messageKind === 'warn' ? COL_WARN : COL_INKSOFT);
      c.setAlpha(fade);
      p.push();
      p.noStroke();
      p.fill(c);
      p.textSize(12.5);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(message, ctx.width / 2, yMsg + MSG_H / 2);
      p.pop();
    }

    // Costruisce "prodotto = valore" dai (correct) esponenti di una riga di calcolo.
    function formula(expArr) {
      const parts = [];
      let prod = 1;
      for (let i = 0; i < K; i++) {
        const e = expArr[i];
        if (e > 0) {
          parts.push(primes[i] + superscript(e));   // sempre con esponente (2¹)
          prod *= Math.pow(primes[i], e);
        }
      }
      if (parts.length === 0) return { txt: '1', val: 1 };
      return { txt: parts.join(' × '), val: prod };
    }

    function drawResults() {
      const tc = tableComplete();
      p.push();
      p.noStroke();
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(15);
      calcRows.forEach((r, j) => {
        const y = yResult0 + j * RESULT_H + RESULT_H / 2;
        const rowDone = tc && cells
          .filter((c) => c.rowKey === r.key)
          .every(satisfied);
        if (rowDone) {
          const f = formula(r.exp);
          p.fill(COL_GREEN);
          p.text(r.label + ' = ' + f.txt + ' = ' + f.val, PAD, y);
        } else {
          p.fill(COL_INKSOFT);
          p.text(r.label + ' = …', PAD, y);
        }
      });
      p.pop();
    }
  };
})();
