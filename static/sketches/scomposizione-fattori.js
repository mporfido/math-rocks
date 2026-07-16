/**
 * Sketch p5.js riutilizzabile "scomposizione-fattori".
 *
 * Uno sketch = un file in static/sketches/. Si registra nel registro globale
 * window.P5Sketches e viene caricato AL VOLO dal componente <x-p5> (p5.js) solo
 * nelle pagine che lo usano (`:::p5 goal sketch=scomposizione-fattori n=60`).
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

  // Apici Unicode per la forma con le potenze (es. 2² × 3): copre esponenti 0..12,
  // più che sufficienti per i numeri didattici (2^12 = 4096).
  const SUP = ['⁰', '¹', '²', '³', '⁴',
    '⁵', '⁶', '⁷', '⁸', '⁹'];
  function superscript(k) {
    return String(k).split('').map((d) => SUP[Number(d)]).join('');
  }

  /**
   * "scomposizione-fattori" — scomposizione in fattori primi col metodo classico
   * a due colonne. A sinistra il numero da dividere, a destra il fattore primo
   * che lo studente digita da tastiera e conferma con Invio. Regola didattica:
   * si inseriscono PRIMA i divisori più piccoli. Se il numero digitato divide ma
   * non è il più piccolo divisore possibile (quindi anche i composti), l'avviso
   * invita a provare con un divisore più piccolo, senza rivelare quello giusto.
   * Un numero che non divide riceve un feedback neutro. In basso compare la
   * scomposizione che si va formando (n = 2 × 2 × 3 × 5) e, a completamento, la
   * forma con le potenze (= 2² × 3 × 5). Con il flag `goal` lo step è completo
   * quando il numero attivo arriva a 1.
   *
   * Parametri (ctx.params):
   *   n       numero da scomporre, intero >= 2 (default 60)
   *   titolo  testo dell'intestazione (default "Scomponi in fattori primi")
   */
  window.P5Sketches['scomposizione-fattori'] = function (p, ctx) {
    const n = Math.max(2, Math.round(Number(ctx.params.n) || 60));
    const title = ctx.params.titolo != null
      ? String(ctx.params.titolo)
      : 'Scomponi in fattori primi';
    const MAXLEN = String(n).length;   // cifre max digitabili (il fattore è <= n)

    // Layout
    const PAD = 14;         // margine interno del canvas
    const HEADER = 40;      // striscia superiore: titolo
    const ROW_H = 34;       // altezza di una riga della scala
    const COL_GAP = 18;     // spazio ai lati della linea divisoria
    const MSG_H = 26;       // riga del messaggio di feedback
    const RESULT_H = 30;    // riga della scomposizione

    // Colori (token "Quaderno", risolti in setup)
    let COL_INK, COL_INKSOFT, COL_CARTA, COL_GRID, COL_GREEN, COL_WARN;

    let divX;               // x della linea divisoria (calcolata in layout)

    // ---- Stato ----
    const rows = [n];       // colonna sinistra: n → … → ultimo (>1); rows[last] è attivo
    const factors = [];     // fattori primi accettati, in ordine
    let typed = '';         // buffer digitato nella cella attiva
    let done = false;
    let message = '';
    let messageKind = 'neutral';  // 'neutral' | 'warn'
    let messageAt = 0;
    const MSG_TTL = 3500;   // durata del messaggio in ms

    // Più piccolo divisore > 1 di m (è sempre primo). Se non ne trova, m è primo.
    function smallestPrimeFactor(m) {
      if (m % 2 === 0) return 2;
      for (let d = 3; d * d <= m; d += 2) {
        if (m % d === 0) return d;
      }
      return m;
    }

    // v è primo? (v >= 2 garantito dai controlli a monte)
    function isPrime(v) {
      return smallestPrimeFactor(v) === v;
    }

    // Fattorizzazione completa di x (per il ripristino da storage).
    function factorize(x) {
      const out = [];
      let m = x;
      while (m > 1) {
        const d = smallestPrimeFactor(m);
        out.push(d);
        m = m / d;
      }
      return out;
    }

    // Ripristino: se il goal risulta già completato da storage, ricostruisci la
    // scala e i fattori dalla scomposizione di n (lo storage salva solo l'id).
    if (ctx.completed) {
      factorize(n).forEach((d) => {
        factors.push(d);
        rows.push(rows[rows.length - 1] / d);
      });
      done = true;
    }

    function setMessage(text, kind) {
      message = text;
      messageKind = kind || 'neutral';
      messageAt = p.millis();
    }

    // Prova a confermare il numero digitato come fattore del numero attivo.
    function submit() {
      if (done) return;
      const m = rows[rows.length - 1];
      const v = parseInt(typed, 10);
      if (!typed || Number.isNaN(v)) return;

      if (v < 2) {
        setMessage('Inserisci un numero ≥ 2.', 'neutral');
        typed = '';
        return;
      }
      if (m % v !== 0) {
        setMessage(v + ' non divide ' + m + '.', 'neutral');
        typed = '';
        return;
      }
      // Divide ma non è primo: si scompone solo in fattori primi.
      if (!isPrime(v)) {
        setMessage(v + ' divide ' + m
          + ', ma non è un numero primo: usa solo fattori primi.', 'warn');
        typed = '';
        return;
      }
      // È primo e divide, ma non è il più piccolo primo che divide m.
      if (v !== smallestPrimeFactor(m)) {
        setMessage(v + ' divide ' + m
          + ', ma prova prima con un divisore più piccolo.', 'warn');
        typed = '';
        return;
      }
      // Accetta: registra il fattore e scala al quoziente.
      factors.push(v);
      const q = m / v;
      rows.push(q);
      typed = '';
      message = '';
      if (q === 1) {
        done = true;
        ctx.complete();
      }
    }

    // ---- Input: tastiera fisica ----
    p.keyPressed = () => {
      if (done) return undefined;
      if (p.keyCode === p.ENTER) { submit(); return false; }
      if (p.keyCode === p.BACKSPACE) { typed = typed.slice(0, -1); return false; }
      if (p.key >= '0' && p.key <= '9') {
        if (typed.length < MAXLEN) typed += p.key;
        return false;
      }
      return undefined;
    };

    function layout() {
      const W = ctx.width;
      divX = Math.round(W / 2);
      const scaleH = rows.length * ROW_H;
      ctx.setHeight(HEADER + scaleH + MSG_H + RESULT_H + PAD);
    }

    p.setup = () => {
      COL_INK = cssVar('--ink', '#1B2A4A');
      COL_INKSOFT = cssVar('--ink-soft', '#5A6275');
      COL_CARTA = cssVar('--carta', '#FBFBF6');
      COL_GRID = cssVar('--grid', '#D7E0EC');
      COL_GREEN = cssVar('--spunta', '#1F9D55');
      COL_WARN = cssVar('--rossa', cssVar('--error', '#D7263D'));
      p.createCanvas(ctx.width, ctx.height);
      layout();
      p.textFont('IBM Plex Mono, monospace');
    };

    p.draw = () => {
      layout();  // riallinea a resize/rotazioni e a nuove righe (idempotente)
      p.background(COL_CARTA);
      drawHeader();
      drawScale();
      drawMessage();
      drawResult();
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

    function drawScale() {
      const y0 = HEADER;
      const scaleH = rows.length * ROW_H;
      const lastIdx = rows.length - 1;

      p.push();
      // Linea divisoria centrale tra le due colonne.
      p.stroke(COL_INK);
      p.strokeWeight(2);
      p.line(divX, y0 + 2, divX, y0 + scaleH - 2);

      p.textSize(18);
      for (let i = 0; i < rows.length; i++) {
        const cy = y0 + i * ROW_H + ROW_H / 2;

        // Colonna sinistra: il numero da dividere.
        p.noStroke();
        p.fill(rows[i] === 1 ? COL_INKSOFT : COL_INK);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(rows[i], divX - COL_GAP, cy);

        // Colonna destra: il fattore scelto per questa riga (l'ultima riga, se
        // non completata, mostra il buffer digitato con il cursore lampeggiante).
        p.textAlign(p.LEFT, p.CENTER);
        if (i < factors.length) {
          p.fill(COL_GREEN);
          p.text(factors[i], divX + COL_GAP, cy);
        } else if (i === lastIdx && !done) {
          const blink = p.frameCount % 60 < 30;
          p.fill(COL_INK);
          const cursor = blink ? '❘' : '';   // barra verticale sottile
          p.text(typed + cursor, divX + COL_GAP, cy);
          // Suggerimento leggero quando la cella è vuota.
          if (!typed && !blink) {
            p.fill(COL_INKSOFT);
            p.text('?', divX + COL_GAP, cy);
          }
        }
      }
      p.pop();
    }

    function drawMessage() {
      if (!message) return;
      const age = p.millis() - messageAt;
      if (age > MSG_TTL) { message = ''; return; }

      const y = HEADER + rows.length * ROW_H + MSG_H / 2;
      // Dissolvenza nell'ultimo terzo di vita.
      const fade = age > MSG_TTL * 0.66
        ? p.map(age, MSG_TTL * 0.66, MSG_TTL, 255, 0)
        : 255;
      const base = messageKind === 'warn' ? COL_WARN : COL_INKSOFT;
      const c = p.color(base);
      c.setAlpha(fade);

      p.push();
      p.noStroke();
      p.fill(c);
      p.textSize(13);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(message, ctx.width / 2, y);
      p.pop();
    }

    function drawResult() {
      const y = HEADER + rows.length * ROW_H + MSG_H + RESULT_H / 2;
      p.push();
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);

      if (factors.length === 0) {
        p.fill(COL_INKSOFT);
        p.textSize(13);
        p.text('Digita un divisore e premi Invio.', ctx.width / 2, y);
        p.pop();
        return;
      }

      let txt = n + ' = ' + factors.join(' × ');
      // A completamento aggiungi la forma compatta con le potenze.
      if (done) {
        const powers = [];
        let prev = null;
        let count = 0;
        factors.forEach((f) => {
          if (f === prev) { count++; } else {
            if (prev !== null) powers.push(count > 1 ? prev + superscript(count) : String(prev));
            prev = f; count = 1;
          }
        });
        if (prev !== null) powers.push(count > 1 ? prev + superscript(count) : String(prev));
        const compact = powers.join(' × ');
        if (compact !== factors.join(' × ')) txt += '  =  ' + compact;
      }

      p.fill(done ? COL_GREEN : COL_INK);
      p.textSize(15);
      p.text(txt, ctx.width / 2, y);
      p.pop();
    }
  };
})();
