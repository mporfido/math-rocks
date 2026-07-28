/**
 * Sketch p5.js riutilizzabile "retta-interi".
 *
 * Uno sketch = un file in static/sketches/. Si registra nel registro globale
 * window.P5Sketches e viene caricato AL VOLO da <x-p5> solo nelle pagine che lo
 * usano (`:::p5 goal sketch=retta-interi target=-3,3`). Gira in p5 "instance
 * mode": riceve `p` (istanza p5) e `ctx` (ponte con la piattaforma); i parametri
 * del markdown arrivano in `ctx.params`.
 *
 * Contratto:  window.P5Sketches['<nome>'] = function (p, ctx) {...}
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};

  // Legge un token CSS (--nome) dal :root, con fallback: i colori seguono
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
   * "retta-interi" — la retta dei numeri interi da -n a +n, con lo zero al
   * centro e le frecce a entrambe le estremità. Lo studente clicca le tacche:
   * con il flag `goal` lo step è completo quando ha cliccato, nell'ordine, tutti
   * i numeri richiesti dal parametro `target`.
   *
   * Parametri (ctx.params):
   *   n          estremo della retta: si mostra da -n a +n (default 5)
   *   target     numeri da cliccare, in ordine, separati da virgola
   *              (es. target=-3,3). Senza target lo sketch resta una
   *              visualizzazione esplorabile e non completa mai.
   *   etichette  "tutte" (default) oppure "zero": con "zero" solo lo 0 è
   *              scritto sotto l'asse, così per trovare un numero bisogna
   *              contare le unità a destra o a sinistra.
   *   titolo     consegna mostrata in alto (default "Clicca il numero")
   */
  window.P5Sketches['retta-interi'] = function (p, ctx) {
    const n = Math.max(2, Math.round(Number(ctx.params.n) || 5));
    const soloZero = String(ctx.params.etichette || 'tutte') === 'zero';
    const title = ctx.params.titolo != null
      ? String(ctx.params.titolo)
      : 'Clicca il numero';

    // Sequenza d'autore, normalizzata a interi dentro [-n, n].
    const targets = [];
    if (ctx.params.target != null && ctx.params.target !== '') {
      String(ctx.params.target).split(',').forEach((tok) => {
        const v = parseInt(tok.trim(), 10);
        if (Number.isInteger(v) && v >= -n && v <= n) targets.push(v);
      });
    }

    // Layout
    const PAD = 14;        // margine laterale
    const TIP = 16;        // spazio per le punte delle frecce
    const HEADER = 38;     // striscia superiore: consegna + avanzamento
    const AXIS_Y = 42;     // distanza dell'asse dalla base dell'header
    const BOTTOM = 44;     // spazio sotto l'asse per le etichette

    let COL_INK, COL_GRID, COL_CARTA, COL_GREEN, COL_INKSOFT, COL_ERR;
    let unit, x0, y0;

    // Stato: numeri già trovati e indice del prossimo target. Se il goal è già
    // completato (ripristino da storage) mostriamo direttamente lo stato finale.
    const trovati = new Set();
    let idx = 0;
    let done = false;
    if (ctx.completed && targets.length > 0) {
      targets.forEach((v) => trovati.add(v));
      idx = targets.length;
      done = true;
    }
    let erroreAt = -1e9;   // istante dell'ultimo click sbagliato (feedback breve)

    function layout() {
      const W = ctx.width;
      unit = (W - 2 * PAD - 2 * TIP) / (2 * n);
      x0 = W / 2;
      y0 = HEADER + AXIS_Y;
      ctx.setHeight(HEADER + AXIS_Y + BOTTOM);
    }

    function numX(v) { return x0 + v * unit; }

    // Numero intero sotto il punto (px, py), oppure null.
    function numeroAt(px, py) {
      if (Math.abs(py - y0) > 30) return null;
      const v = Math.round((px - x0) / unit);
      if (v < -n || v > n) return null;
      const raggio = Math.max(13, Math.min(24, unit * 0.7));
      return Math.abs(px - numX(v)) <= raggio ? v : null;
    }

    function clickAt(px, py) {
      if (done || targets.length === 0) return false;
      const v = numeroAt(px, py);
      if (v == null) return false;
      if (v === targets[idx]) {
        trovati.add(v);
        idx += 1;
        if (idx >= targets.length) {
          done = true;
          ctx.complete();
        }
      } else {
        erroreAt = p.millis();
      }
      return true;
    }

    p.mousePressed = () => { clickAt(p.mouseX, p.mouseY); };
    // Su touch blocchiamo lo scroll solo se il tap ha colpito una tacca: fuori
    // dall'asse la pagina continua a scorrere normalmente.
    p.touchStarted = () => !clickAt(p.mouseX, p.mouseY);

    p.setup = () => {
      COL_INK = cssVar('--ink', '#1B2A4A');
      COL_GRID = cssVar('--grid', '#D7E0EC');
      COL_CARTA = cssVar('--carta', '#FBFBF6');
      COL_GREEN = cssVar('--spunta', '#1F9D55');
      COL_INKSOFT = cssVar('--ink-soft', '#5A6275');
      COL_ERR = cssVar('--error', '#D7263D');
      p.createCanvas(ctx.width, ctx.height);
      layout();
      p.textFont('IBM Plex Mono, monospace');
    };

    p.draw = () => {
      layout();               // idempotente: assorbe resize e rotazioni
      p.background(COL_CARTA);
      drawHeader();
      drawAsse();
      drawTacche();
    };

    function drawHeader() {
      const sbagliato = p.millis() - erroreAt < 900;
      p.push();
      p.noStroke();
      p.textSize(15);
      p.textAlign(p.LEFT, p.CENTER);
      if (targets.length === 0) {
        p.fill(COL_INKSOFT);
        p.text(title, PAD, HEADER / 2);
      } else if (done) {
        p.fill(COL_GREEN);
        p.text('✓ ' + targets.map(fmt).join(', ') + ' — fatto!', PAD, HEADER / 2);
      } else {
        p.fill(sbagliato ? COL_ERR : COL_INK);
        const consegna = sbagliato
          ? 'Non è questo: conta le unità dallo 0'
          : title + ' ' + fmt(targets[idx]);
        p.text(consegna, PAD, HEADER / 2);
      }
      // Avanzamento (destra), solo se c'è più di un numero da trovare.
      if (targets.length > 1) {
        p.fill(COL_INKSOFT);
        p.textSize(13);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(idx + ' / ' + targets.length, ctx.width - PAD, HEADER / 2);
      }
      p.pop();
    }

    // Segno meno tipografico: più leggibile del trattino del monospace.
    function fmt(v) { return v < 0 ? '−' + Math.abs(v) : String(v); }

    function puntaFreccia(x, y, verso) {
      p.push();
      p.stroke(COL_INK);
      p.strokeWeight(2.5);
      p.line(x, y, x - verso * 10, y - 6);
      p.line(x, y, x - verso * 10, y + 6);
      p.pop();
    }

    function drawAsse() {
      const xa = numX(-n) - TIP;
      const xb = numX(n) + TIP;
      p.push();
      p.stroke(COL_INK);
      p.strokeWeight(2.5);
      p.line(xa, y0, xb, y0);
      p.pop();
      puntaFreccia(xa, y0, -1);
      puntaFreccia(xb, y0, 1);
    }

    function drawTacche() {
      p.push();
      p.textAlign(p.CENTER, p.TOP);
      for (let v = -n; v <= n; v++) {
        const x = numX(v);
        const trovato = trovati.has(v);
        const zero = v === 0;

        // Tacca: più lunga sullo zero, che resta il punto di riferimento.
        p.stroke(zero ? COL_INK : COL_GRID);
        p.strokeWeight(zero ? 2.5 : 2);
        p.line(x, y0 - (zero ? 12 : 8), x, y0 + (zero ? 12 : 8));

        // Pallino verde sui numeri già trovati.
        if (trovato) {
          p.noStroke();
          p.fill(COL_GREEN);
          p.circle(x, y0, 15);
        }

        // Etichetta sotto l'asse.
        const mostra = !soloZero || zero || trovato;
        if (mostra) {
          p.noStroke();
          p.fill(trovato ? COL_GREEN : COL_INK);
          p.textSize(zero ? 16 : 14);
          p.textStyle(trovato || zero ? p.BOLD : p.NORMAL);
          p.text(fmt(v), x, y0 + 18);
          p.textStyle(p.NORMAL);
        }
      }
      p.pop();
    }
  };
})();
