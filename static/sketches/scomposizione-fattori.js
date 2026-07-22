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
   * Il parametro `n` può essere una LISTA di numeri separati da virgola: in quel
   * caso si disegnano più scale affiancate (una per numero, es. `n=84,90`), da
   * scomporre IN PARALLELO. Con la tastiera fisica si scrive su UNA scala per
   * volta: si clicca/tocca la scala su cui lavorare (l'attiva ha il cursore
   * lampeggiante), Invio conferma il fattore su quella scala, Tab passa alla
   * successiva ancora da completare. Ogni scala ha la propria scomposizione e la
   * propria riga risultato; con `goal` lo step è completo quando TUTTE le scale
   * arrivano a 1. Con un solo numero il layout è centrato come da versione base.
   *
   * Parametri (ctx.params):
   *   n       numero (o lista `a,b`) da scomporre, interi >= 2 (default 60)
   *   titolo  testo dell'intestazione (default "Scomponi in fattori primi")
   */
  window.P5Sketches['scomposizione-fattori'] = function (p, ctx) {
    // `n` è una lista separata da virgola (una o due scale). Il coerce del parser
    // lascia "84,90" come stringa: qui la splittiamo e normalizziamo ogni numero.
    const nums = String(ctx.params.n != null ? ctx.params.n : 60)
      .split(',')
      .map((tok) => Math.max(2, Math.round(Number(tok) || 60)))
      .slice(0, 2);   // al massimo due scale affiancate
    const title = ctx.params.titolo != null
      ? String(ctx.params.titolo)
      : 'Scomponi in fattori primi';

    // Layout
    const PAD = 14;         // margine interno del canvas
    const HEADER = 40;      // striscia superiore: titolo
    const ROW_H = 34;       // altezza di una riga della scala
    const COL_GAP = 18;     // spazio ai lati della linea divisoria
    const MSG_H = 26;       // riga del messaggio di feedback
    const RESULT_TOP = 4;   // stacco sopra il blocco risultati
    const RESULT_LH = 24;   // altezza di UNA riga di risultato (il blocco può
                            // avere più righe quando la forma per esteso non
                            // ci sta nella larghezza della scala, es. su mobile)

    // Colori (token "Quaderno", risolti in setup)
    let COL_INK, COL_INKSOFT, COL_CARTA, COL_GRID, COL_GREEN, COL_WARN;

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

    // ---- Stato per-scala ----
    // Ogni "ladder" (scala) incapsula lo stato di una scomposizione: la colonna
    // sinistra (num → … → ultimo > 1; l'ultima riga è attiva), i fattori accettati,
    // il buffer digitato e il flag di completamento.
    function makeLadder(num) {
      return {
        num,
        rows: [num],           // colonna sinistra: num → … → ultimo (>1)
        factors: [],           // fattori primi accettati, in ordine
        typed: '',             // buffer digitato nella cella attiva
        done: false,
        maxlen: String(num).length,   // cifre max digitabili (il fattore è <= num)
        divX: 0,               // x della linea divisoria (calcolata in layout)
      };
    }
    const ladders = nums.map(makeLadder);

    let active = 0;         // indice della scala attiva (quella su cui si scrive)

    // ---- Stato condiviso ----
    let message = '';
    let messageKind = 'neutral';  // 'neutral' | 'warn'
    let messageAt = 0;
    const MSG_TTL = 3500;   // durata del messaggio in ms

    // Ripristino: se il goal risulta già completato da storage, ricostruisci ogni
    // scala e i suoi fattori dalla scomposizione del numero (lo storage salva solo
    // l'id).
    if (ctx.completed) {
      ladders.forEach((l) => {
        factorize(l.num).forEach((d) => {
          l.factors.push(d);
          l.rows.push(l.rows[l.rows.length - 1] / d);
        });
        l.done = true;
      });
    }

    // Goal complessivo: tutte le scale arrivate a 1.
    function allDone() {
      return ladders.every((l) => l.done);
    }

    function setMessage(text, kind) {
      message = text;
      messageKind = kind || 'neutral';
      messageAt = p.millis();
    }

    // Prima scala non ancora completata a partire da `from` (esclusa), a rotazione.
    function nextOpenLadder(from) {
      for (let k = 1; k <= ladders.length; k++) {
        const i = (from + k) % ladders.length;
        if (!ladders[i].done) return i;
      }
      return from;
    }

    // Prova a confermare il numero digitato come fattore del numero attivo della
    // scala attiva.
    function submit() {
      const l = ladders[active];
      if (l.done) return;
      const m = l.rows[l.rows.length - 1];
      const v = parseInt(l.typed, 10);
      if (!l.typed || Number.isNaN(v)) return;

      if (v < 2) {
        setMessage('Inserisci un numero ≥ 2.', 'neutral');
        l.typed = '';
        return;
      }
      if (m % v !== 0) {
        setMessage(v + ' non divide ' + m + '.', 'neutral');
        l.typed = '';
        return;
      }
      // Divide ma non è primo: si scompone solo in fattori primi.
      if (!isPrime(v)) {
        setMessage(v + ' divide ' + m
          + ', ma non è un numero primo: usa solo fattori primi.', 'warn');
        l.typed = '';
        return;
      }
      // È primo e divide, ma non è il più piccolo primo che divide m.
      if (v !== smallestPrimeFactor(m)) {
        setMessage(v + ' divide ' + m
          + ', ma prova prima con un divisore più piccolo.', 'warn');
        l.typed = '';
        return;
      }
      // Accetta: registra il fattore e scala al quoziente.
      l.factors.push(v);
      const q = m / v;
      l.rows.push(q);
      l.typed = '';
      message = '';
      if (q === 1) {
        l.done = true;
        // Passa da sé a una scala ancora aperta (comodo con più scale).
        if (!allDone()) active = nextOpenLadder(active);
        else ctx.complete();
      }
    }

    // ---- Input: tastiera fisica ----
    p.keyPressed = () => {
      if (allDone()) return undefined;
      if (p.keyCode === p.ENTER) { submit(); return false; }
      if (p.keyCode === p.TAB) {
        // Tab: passa alla prossima scala ancora da completare (utile con due scale).
        if (ladders.length > 1) active = nextOpenLadder(active);
        return false;   // non spostare il focus fuori dal canvas
      }
      const l = ladders[active];
      if (l.done) return undefined;
      if (p.keyCode === p.BACKSPACE) { l.typed = l.typed.slice(0, -1); return false; }
      if (p.key >= '0' && p.key <= '9') {
        if (l.typed.length < l.maxlen) l.typed += p.key;
        return false;
      }
      return undefined;
    };

    // ---- Input: mouse e touch (scelta della scala attiva) ----
    // Restituisce l'indice della scala nella cui regione orizzontale cade px, o -1.
    function ladderAt(px) {
      if (px < PAD || px > ctx.width - PAD) return -1;
      const regionW = ctx.width / ladders.length;
      const i = Math.floor(px / regionW);
      return (i >= 0 && i < ladders.length) ? i : -1;
    }
    function press(px, py) {
      if (allDone()) return false;
      const scaleTop = HEADER;
      const scaleBottom = HEADER + scaleAreaH();
      if (py < scaleTop || py > scaleBottom) return false;  // tap fuori dalle scale
      const i = ladderAt(px);
      if (i < 0 || ladders[i].done) return false;
      active = i;
      return true;
    }
    p.mousePressed = () => { press(p.mouseX, p.mouseY); };
    // Su touch blocchiamo lo scroll SOLO se il tap sceglie una scala: un tocco
    // fuori dall'area lascia scorrere la pagina (canvas alto su mobile).
    p.touchStarted = () => !press(p.mouseX, p.mouseY);

    // Altezza dell'area delle scale (la scala più lunga comanda).
    function scaleAreaH() {
      const maxRows = ladders.reduce((mx, l) => Math.max(mx, l.rows.length), 1);
      return maxRows * ROW_H;
    }

    // Righe di risultato di una scala. Se la forma su una riga sola ci sta nella
    // larghezza della scala, resta una riga; altrimenti (colonne strette, mobile)
    // si spezza in: numero, "= fattori per esteso", "= forma con le potenze".
    // Ogni voce è { txt, size, col }.
    function resultLines(l) {
      if (l.factors.length === 0) {
        return [{ txt: 'Digita un divisore e premi Invio.', size: 13, col: COL_INKSOFT }];
      }
      const expanded = l.factors.join(' × ');
      const compact = l.done ? powersForm(l.factors) : null;
      const col = l.done ? COL_GREEN : COL_INK;

      const oneLine = l.num + ' = ' + expanded
        + (compact && compact !== expanded ? '  =  ' + compact : '');
      const avail = (ladders.length > 1 ? ctx.width / ladders.length : ctx.width)
        - 2 * COL_GAP;

      p.push();
      p.textSize(15);
      const fits = p.textWidth(oneLine) <= avail;
      p.pop();
      if (fits) return [{ txt: oneLine, size: 15, col }];

      // Multiriga.
      const lines = [
        { txt: String(l.num), size: 15, col },
        { txt: '= ' + expanded, size: 15, col },
      ];
      if (compact && compact !== expanded) lines.push({ txt: '= ' + compact, size: 15, col });
      return lines;
    }

    // Altezza del blocco risultati: la scala con più righe di risultato comanda.
    function resultBlockH() {
      const maxLines = ladders.reduce((mx, l) => Math.max(mx, resultLines(l).length), 1);
      return RESULT_TOP + maxLines * RESULT_LH;
    }

    function layout() {
      const W = ctx.width;
      const regionW = W / ladders.length;
      ladders.forEach((l, i) => {
        l.divX = Math.round(regionW * (i + 0.5));   // centro della regione della scala
      });
      const total = HEADER + scaleAreaH() + MSG_H + resultBlockH() + PAD;
      ctx.setHeight(total);
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
      ladders.forEach((l, i) => drawScale(l, i));
      drawMessage();
      drawResults();
    };

    function drawHeader() {
      p.push();
      p.noStroke();
      p.textSize(15);
      p.fill(allDone() ? COL_GREEN : COL_INK);
      p.textAlign(p.LEFT, p.CENTER);
      p.text((allDone() ? '✓ ' : '') + title, PAD, HEADER / 2);
      p.pop();
    }

    function drawScale(l, li) {
      const y0 = HEADER;
      const scaleH = l.rows.length * ROW_H;
      const lastIdx = l.rows.length - 1;
      // Solo la scala attiva (e finché lo step non è concluso) evidenzia la cella.
      const isActive = li === active && !allDone();

      p.push();
      // Linea divisoria centrale tra le due colonne. L'attiva è marcata, le altre
      // più tenui: così si vede su quale scala si sta scrivendo.
      p.stroke(isActive ? COL_INK : COL_INKSOFT);
      p.strokeWeight(isActive ? 2 : 1.5);
      p.line(l.divX, y0 + 2, l.divX, y0 + scaleH - 2);

      p.textSize(18);
      for (let i = 0; i < l.rows.length; i++) {
        const cy = y0 + i * ROW_H + ROW_H / 2;

        // Colonna sinistra: il numero da dividere.
        p.noStroke();
        p.fill(l.rows[i] === 1 ? COL_INKSOFT : COL_INK);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(l.rows[i], l.divX - COL_GAP, cy);

        // Colonna destra: il fattore scelto per questa riga (l'ultima riga, se non
        // completata, mostra il buffer digitato; il cursore lampeggia solo se la
        // scala è quella attiva).
        p.textAlign(p.LEFT, p.CENTER);
        if (i < l.factors.length) {
          p.fill(COL_GREEN);
          p.text(l.factors[i], l.divX + COL_GAP, cy);
        } else if (i === lastIdx && !l.done) {
          const blink = isActive && p.frameCount % 60 < 30;
          p.fill(COL_INK);
          const cursor = blink ? '❘' : '';   // barra verticale sottile
          p.text(l.typed + cursor, l.divX + COL_GAP, cy);
          // Suggerimento leggero quando la cella è vuota.
          if (!l.typed && !blink) {
            p.fill(COL_INKSOFT);
            p.text('?', l.divX + COL_GAP, cy);
          }
        }
      }
      p.pop();
    }

    function drawMessage() {
      if (!message) return;
      const age = p.millis() - messageAt;
      if (age > MSG_TTL) { message = ''; return; }

      const y = HEADER + scaleAreaH() + MSG_H / 2;
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

    // Forma compatta con le potenze (es. 2² × 3 × 5) dai fattori di una scala.
    function powersForm(factors) {
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
      return powers.join(' × ');
    }

    function drawResults() {
      // Blocco risultati sotto il messaggio: ogni scala mostra il suo risultato
      // (una o più righe) centrato sotto di sé; con una scala sola è centrato.
      const y0 = HEADER + scaleAreaH() + MSG_H + RESULT_TOP;
      p.push();
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);

      ladders.forEach((l) => {
        const x = ladders.length > 1 ? l.divX : ctx.width / 2;
        resultLines(l).forEach((line, k) => {
          p.fill(line.col);
          p.textSize(line.size);
          p.text(line.txt, x, y0 + k * RESULT_LH + RESULT_LH / 2);
        });
      });
      p.pop();
    }
  };
})();
