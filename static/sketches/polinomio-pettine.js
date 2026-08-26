/**
 * Sketch p5.js riutilizzabile "polinomio-pettine".
 *
 * Un file per sketch in static/sketches/, caricato al volo da <x-p5>.
 * Contratto:  window.P5Sketches['<nome>'] = function (p, ctx) {...}
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};

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
   * "polinomio-pettine" — una fila di caselle, una per ogni grado da n a 0,
   * in cui i termini del polinomio vanno collocati.
   *
   * È il pettine che fa vedere due cose insieme, che di solito si insegnano
   * separate: **ordinare** un polinomio è riempire le caselle da sinistra, ed
   * essere **incompleto** vuol dire avere dei buchi in mezzo. Non sono due
   * proprietà da imparare a memoria: sono la stessa immagine.
   *
   * Tre modi:
   *   mostra    espositivo, i termini sono già al loro posto (non è un goal)
   *   ordina    i termini stanno nel mazzo in alto e vanno trascinati (goal)
   *   completa  i termini sono al loro posto e vanno riempiti i BUCHI: toccando
   *             una casella vuota ci compare `0x^k` (goal)
   *
   * Parametri (ctx.params):
   *   termini   i termini del polinomio, separati da `;` (es. "3;-x^2;5x^4;-x")
   *   lettera   la lettera del polinomio (default: dedotta dai termini, o "x")
   *   grado     grado massimo del pettine (default: il grado più alto presente)
   *   verso     decrescente (default) | crescente
   *   modo      mostra | ordina | completa
   */
  window.P5Sketches['polinomio-pettine'] = function (p, ctx) {
    const P = ctx.params || {};

    const modo = ['mostra', 'ordina', 'completa'].includes(String(P.modo))
      ? String(P.modo) : 'mostra';
    const crescente = String(P.verso || 'decrescente') === 'crescente';

    // -- Lettura dei termini -------------------------------------------------
    // Un termine è scritto come lo scriverebbe uno studente: `5x^4`, `-x`, `3`.
    // Ne servono coefficiente ed esponente, che sono tutto ciò che il pettine
    // usa: il coefficiente per scriverlo, l'esponente per sapere dove va.

    function leggiTermine(src) {
      const s = String(src).replace(/\s+/g, '');
      const m = s.match(/^([+-]?)(\d*)([a-zA-Z]?)(?:\^(\d+))?$/);
      if (!m) return null;
      const segno = m[1] === '-' ? -1 : 1;
      const lettera = m[3] || '';
      const cifre = m[2];
      // `x` da solo ha coefficiente 1; `3` da solo ha esponente 0.
      const coef = segno * (cifre === '' ? 1 : Number(cifre));
      const esp = lettera === '' ? 0 : (m[4] === undefined ? 1 : Number(m[4]));
      return { coef, esp, lettera, src: s };
    }

    const termini = String(P.termini || '')
      .split(';')
      .map((t) => t.trim())
      .filter(Boolean)
      .map(leggiTermine)
      .filter(Boolean);

    const LETTERA = String(P.lettera || '')
      || (termini.find((t) => t.lettera) || {}).lettera
      || 'x';

    const GRADO = Number.isFinite(Number(P.grado))
      ? Number(P.grado)
      : termini.reduce((g, t) => Math.max(g, t.esp), 0);

    // Le caselle del pettine, da sinistra a destra.
    const gradi = [];
    for (let k = GRADO; k >= 0; k--) gradi.push(k);
    if (crescente) gradi.reverse();

    // -- Stato ---------------------------------------------------------------
    // `dove[i]` = grado della casella in cui sta il termine i (null = nel mazzo).
    const dove = termini.map((t) => (modo === 'ordina' ? null : t.esp));
    // Caselle-buco riempite con `0x^k` (solo in modalità completa).
    const riempiti = new Set();

    let INK, INKSOFT, CARTA, ROSSA, SPUNTA, LINE;
    let celle = [];        // rettangoli delle caselle, ricalcolati a ogni draw
    let mazzoBox = null;
    let dragIdx = -1;
    let done = false;

    p.setup = () => {
      p.createCanvas(ctx.width, ctx.height);
      p.textFont('IBM Plex Mono');
      INK = cssVar('--ink', '#1B2A4A');
      INKSOFT = cssVar('--ink-soft', '#5A6275');
      CARTA = cssVar('--carta', '#FBFBF6');
      ROSSA = cssVar('--rossa', '#D7263D');
      SPUNTA = cssVar('--spunta', '#1F9D55');
      LINE = cssVar('--line', '#DDE2D9');
      if (ctx.completed) risolvi();
    };

    /** Stato finale, per il ripristino da storage. */
    function risolvi() {
      termini.forEach((t, i) => { dove[i] = t.esp; });
      gradi.forEach((k) => { if (!occupata(k)) riempiti.add(k); });
      done = true;
    }

    function occupata(k) {
      return termini.some((t, i) => dove[i] === k);
    }

    // -- Scrittura di un termine --------------------------------------------

    function testoCoef(t, dentroPettine) {
      // Dentro il pettine la casella dice già qual è la potenza: del termine
      // resta da scrivere il coefficiente, col suo segno.
      if (!dentroPettine) return t.src;
      if (t.esp === 0) return (t.coef > 0 ? '+' : '') + t.coef;
      if (t.coef === 1) return '+1';
      if (t.coef === -1) return '-1';
      return (t.coef > 0 ? '+' : '') + t.coef;
    }

    /** Disegna `base^esp` con l'esponente rialzato (in canvas non c'è LaTeX). */
    function drawPower(left, cy, base, esp, sz, col) {
      p.noStroke();
      p.fill(col);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(sz);
      const bw = p.textWidth(base);
      p.text(base, left, cy);
      if (esp === null) return bw;
      p.textSize(sz * 0.62);
      const ew = p.textWidth(String(esp));
      p.text(String(esp), left + bw + 1, cy - sz * 0.33);
      return bw + ew + 1;
    }

    function powerW(base, esp, sz) {
      p.textSize(sz);
      const bw = p.textWidth(base);
      if (esp === null) return bw;
      p.textSize(sz * 0.62);
      return bw + p.textWidth(String(esp)) + 1;
    }

    /** L'etichetta di una casella: x^4, x^3, …, x (grado 1), 1 (grado 0). */
    function etichettaW(k, sz) {
      if (k === 0) return powerW('1', null, sz);
      if (k === 1) return powerW(LETTERA, null, sz);
      return powerW(LETTERA, k, sz);
    }

    function drawEtichetta(left, cy, k, sz, col) {
      if (k === 0) return drawPower(left, cy, '1', null, sz, col);
      if (k === 1) return drawPower(left, cy, LETTERA, null, sz, col);
      return drawPower(left, cy, LETTERA, k, sz, col);
    }

    // -- Disegno -------------------------------------------------------------

    p.draw = () => {
      p.background(CARTA);
      const W = ctx.width;
      const H = ctx.height;

      const nCelle = gradi.length;
      const cellW = Math.min(96, (W - 40) / Math.max(nCelle, 1));
      const cellH = 74;
      const x0 = W / 2 - (nCelle * cellW) / 2;
      const yCelle = modo === 'ordina' ? H - 150 : H - 130;

      // --- Il mazzo (solo in modalità ordina) ---
      // Sparisce quando è vuoto — ma ricompare mentre si trascina, perché è lì
      // che si rimette un termine di cui ci si è pentiti.
      const mazzoServe = modo === 'ordina'
        && (dragIdx >= 0 || termini.some((t, i) => dove[i] === null));
      if (mazzoServe) {
        mazzoBox = { x: 20, y: 20, w: W - 40, h: 66 };
        p.noFill();
        p.stroke(LINE);
        p.strokeWeight(2);
        p.drawingContext.setLineDash([6, 5]);
        p.rect(mazzoBox.x, mazzoBox.y, mazzoBox.w, mazzoBox.h, 8);
        p.drawingContext.setLineDash([]);
        p.noStroke();
        p.fill(INKSOFT);
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(11);
        p.text('i termini, alla rinfusa', mazzoBox.x + 8, mazzoBox.y + 6);
        disegnaMazzo(mazzoBox);
      } else if (modo === 'ordina') {
        mazzoBox = null;
      } else {
        // Il polinomio scritto per esteso, in cima: è la scrittura di partenza
        // di cui il pettine è la radiografia.
        drawPolinomio(46, 30);
      }

      // --- Le caselle ---
      celle = [];
      gradi.forEach((k, n) => {
        const box = { k, x: x0 + n * cellW, y: yCelle, w: cellW, h: cellH };
        celle.push(box);

        const piena = occupata(k) || riempiti.has(k);
        const sotto = dragIdx >= 0 && dentro(p.mouseX, p.mouseY, box);

        p.stroke(piena ? INK : LINE);
        p.strokeWeight(sotto ? 3 : 2);
        p.fill(piena ? CARTA : 'rgba(0,0,0,0)');
        if (!piena) p.drawingContext.setLineDash([5, 4]);
        p.rect(box.x + 3, box.y, box.w - 6, box.h, 8);
        p.drawingContext.setLineDash([]);

        // L'etichetta della casella: quale potenza vive qui.
        const sz = Math.min(20, cellW * 0.34);
        const wEt = etichettaW(k, sz);
        drawEtichetta(box.x + box.w / 2 - wEt / 2, box.y + box.h - 18, k,
          sz, piena ? INKSOFT : LINE);

        // Il contenuto: il termine, oppure lo `0x^k` messo dallo studente.
        const idx = termini.findIndex((t, i) => dove[i] === k);
        if (idx >= 0 && idx !== dragIdx) {
          const t = termini[idx];
          const szT = Math.min(24, cellW * 0.4);
          const txt = testoCoef(t, true);
          p.textSize(szT);
          p.noStroke();
          p.fill(done ? SPUNTA : INK);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(txt, box.x + box.w / 2, box.y + 26);
        } else if (riempiti.has(k)) {
          p.noStroke();
          p.fill(ROSSA);
          p.textSize(Math.min(22, cellW * 0.36));
          p.textAlign(p.CENTER, p.CENTER);
          p.text('+0', box.x + box.w / 2, box.y + 26);
        } else if (modo === 'completa') {
          // Il buco si offre di essere riempito: è il gesto da fare.
          p.noStroke();
          p.fill(LINE);
          p.textSize(13);
          p.textAlign(p.CENTER, p.CENTER);
          p.text('?', box.x + box.w / 2, box.y + 26);
        }
      });

      // --- Il termine trascinato, sotto il dito ---
      if (dragIdx >= 0) {
        const t = termini[dragIdx];
        const w = termineW(t, 22) + 22;
        p.stroke(INK);
        p.strokeWeight(2);
        p.fill(CARTA);
        p.rect(p.mouseX - w / 2, p.mouseY - 20, w, 40, 6);
        drawTermine(p.mouseX - w / 2 + 11, p.mouseY, t, 22, INK);
      }

      disegnaVerdetto(yCelle + cellH + 14);
    };

    /** I termini ancora nel mazzo, in fila. */
    function disegnaMazzo(box) {
      const liberi = termini.map((t, i) => i).filter((i) => dove[i] === null);
      if (!liberi.length) return;
      const larghezze = liberi.map((i) => termineW(termini[i], 22) + 22);
      const tot = larghezze.reduce((s, w) => s + w + 10, -10);
      let x = box.x + box.w / 2 - tot / 2;
      liberi.forEach((i, n) => {
        if (i === dragIdx) { x += larghezze[n] + 10; return; }
        const w = larghezze[n];
        const y = box.y + box.h / 2 - 20;
        termini[i].box = { x, y, w, h: 40 };
        p.stroke(INK);
        p.strokeWeight(2);
        p.fill(CARTA);
        p.rect(x, y, w, 40, 6);
        drawTermine(x + 11, y + 20, termini[i], 22, INK);
        x += w + 10;
      });
    }

    /** Il polinomio scritto per esteso, nell'ordine in cui è dato. */
    function drawPolinomio(y, sz) {
      const pezzi = termini.map((t, i) => ({ t, i }));
      p.textSize(sz);
      const w = pezzi.reduce((s, q, n) => {
        const seg = n === 0 ? (q.t.coef < 0 ? '-' : '') : (q.t.coef < 0 ? ' - ' : ' + ');
        return s + p.textWidth(seg) + corpoW(q.t, sz);
      }, 0);
      let x = ctx.width / 2 - w / 2;
      pezzi.forEach((q, n) => {
        const seg = n === 0 ? (q.t.coef < 0 ? '-' : '') : (q.t.coef < 0 ? ' - ' : ' + ');
        p.noStroke();
        p.fill(INKSOFT);
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(sz);
        p.text(seg, x, y);
        x += p.textWidth(seg);
        x += drawCorpo(x, y, q.t, sz, INK);
      });
    }

    /** Il termine col suo segno, esponente rialzato: `-x²`, `5x⁴`, `3`. */
    function termineW(t, sz) {
      p.textSize(sz);
      return p.textWidth(t.coef < 0 ? '-' : '') + corpoW(t, sz);
    }

    function drawTermine(x, y, t, sz, col) {
      const seg = t.coef < 0 ? '-' : '';
      p.noStroke();
      p.fill(col);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(sz);
      p.text(seg, x, y);
      const w = p.textWidth(seg);
      return w + drawCorpo(x + w, y, t, sz, col);
    }

    /** Il termine senza segno: `5x^4`, `x`, `3`. */
    function corpoW(t, sz) {
      const c = Math.abs(t.coef);
      const num = (c === 1 && t.esp > 0) ? '' : String(c);
      if (t.esp === 0) return powerW(num, null, sz);
      return powerW(num + LETTERA, t.esp > 1 ? t.esp : null, sz);
    }

    function drawCorpo(x, y, t, sz, col) {
      const c = Math.abs(t.coef);
      const num = (c === 1 && t.esp > 0) ? '' : String(c);
      if (t.esp === 0) return drawPower(x, y, num, null, sz, col);
      return drawPower(x, y, num + LETTERA, t.esp > 1 ? t.esp : null, sz, col);
    }

    function disegnaVerdetto(y) {
      p.noStroke();
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(13);
      if (done) {
        p.fill(SPUNTA);
        p.text(modo === 'completa'
          ? '✓ nessun buco: il polinomio è completo'
          : '✓ in ordine, dal grado più alto al più basso', ctx.width / 2, y);
        return;
      }
      p.fill(INKSOFT);
      if (modo === 'ordina') {
        const n = dove.filter((d) => d === null).length;
        p.text(n
          ? `trascina ogni termine nella casella della sua potenza (ne restano ${n})`
          : 'controlla: ogni termine è nella casella giusta?', ctx.width / 2, y);
      } else if (modo === 'completa') {
        const buchi = gradi.filter((k) => !occupata(k) && !riempiti.has(k)).length;
        p.text(buchi
          ? `tocca le caselle vuote: ce ne sono ${buchi}`
          : 'fatto', ctx.width / 2, y);
      } else {
        const buchi = gradi.filter((k) => !occupata(k)).length;
        p.text(buchi
          ? `grado ${GRADO} · ${buchi} ${buchi === 1 ? 'casella vuota' : 'caselle vuote'}`
          : `grado ${GRADO} · nessuna casella vuota`, ctx.width / 2, y);
      }
    }

    // -- Interazione ---------------------------------------------------------

    function dentro(px, py, b) {
      return b && px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
    }

    function cellaIn(px, py) {
      return celle.find((c) => dentro(px, py, c)) || null;
    }

    function verifica() {
      if (modo === 'ordina') {
        const tutti = termini.every((t, i) => dove[i] === t.esp);
        if (tutti) { done = true; ctx.complete(); }
      } else if (modo === 'completa') {
        const buchi = gradi.filter((k) => !occupata(k) && !riempiti.has(k));
        if (!buchi.length) { done = true; ctx.complete(); }
      }
    }

    function pStart() {
      if (done) return false;

      if (modo === 'completa') {
        const c = cellaIn(p.mouseX, p.mouseY);
        if (c && !occupata(c.k)) {
          if (riempiti.has(c.k)) riempiti.delete(c.k);
          else riempiti.add(c.k);
          verifica();
          return true;
        }
        return false;
      }

      if (modo !== 'ordina') return false;

      // Un termine già in una casella si può riprendere: cambiare idea fa
      // parte dell'esercizio.
      const c = cellaIn(p.mouseX, p.mouseY);
      if (c) {
        const idx = termini.findIndex((t, i) => dove[i] === c.k);
        if (idx >= 0) { dragIdx = idx; return true; }
        return false;
      }
      const preso = termini.findIndex(
        (t, i) => dove[i] === null && dentro(p.mouseX, p.mouseY, t.box)
      );
      if (preso >= 0) { dragIdx = preso; return true; }
      return false;
    }

    function pEnd() {
      if (dragIdx < 0) return;
      const c = cellaIn(p.mouseX, p.mouseY);
      if (c) {
        // Una casella tiene un termine solo: quello che c'era torna nel mazzo.
        const gia = termini.findIndex((t, i) => dove[i] === c.k && i !== dragIdx);
        if (gia >= 0) dove[gia] = null;
        dove[dragIdx] = c.k;
      } else if (mazzoBox && dentro(p.mouseX, p.mouseY, mazzoBox)) {
        dove[dragIdx] = null;
      }
      dragIdx = -1;
      verifica();
    }

    p.mousePressed = () => { pStart(); };
    p.mouseReleased = () => { pEnd(); };
    // Su touch lo scroll della pagina si blocca SOLO se il gesto ha preso
    // davvero qualcosa: un tocco a vuoto deve continuare a far scorrere.
    p.touchStarted = () => { const preso = pStart(); return !preso; };
    p.touchMoved = () => (dragIdx >= 0 ? false : true);
    p.touchEnded = () => { pEnd(); return true; };
  };
})();
