/**
 * Sketch p5.js riutilizzabile "bilancia-mattone".
 *
 * Una bilancia a due piatti per il problema del mattone: "un mattone pesa un
 * chilo piu' mezzo mattone". Sui piatti stanno tre pezzi:
 *   M  mattone intero   (rettangolo rosso-mattone)
 *   m  mezzo mattone    (lo stesso rettangolo largo la meta', con il ½ sopra)
 *   k  peso da un chilo (triangolo grigio con l'1 sopra)
 * Il braccio pende dalla parte piu' pesante: il peso vero dei pezzi serve solo
 * a decidere l'inclinazione, non viene mai scritto.
 *
 * Due modi, per i due momenti della lezione:
 *   libero  le mosse si fanno su UN piatto alla volta: sotto ciascun piatto
 *           una fila per aggiungere e una per togliere. Goal: trovare
 *           `equilibri` nuove situazioni di equilibrio — che si raggiungono
 *           solo facendo la stessa cosa da tutte e due le parti.
 *   doppia  ogni mossa agisce sui DUE piatti insieme: togli, aggiungi,
 *           raddoppia, piu' "spezza" (ogni mattone intero diventa due meta')
 *           e "unisci" (due meta' tornano un mattone), che non cambiano il
 *           peso ma rendono confrontabili i due piatti. Goal: un solo mattone
 *           intero a sinistra e soli pesi da un chilo a destra.
 *
 * Ogni azione ha il suo bottone: il tocco diretto sui pezzi resta come
 * scorciatoia, ma non e' mai l'unica strada (su un telefono i pezzi sono
 * bersagli piccoli, e la bilancia che si inclina se li porta via).
 *
 * Parametri (ctx.params):
 *   modo       'libero' (default) | 'doppia'
 *   sinistra   pezzi iniziali del piatto sinistro, es. "M"   (default "M")
 *   destra     pezzi iniziali del piatto destro,   es. "mk"  (default "mk")
 *   equilibri  (libero) quanti equilibri nuovi servono per il goal (default 2)
 *   titolo     consegna mostrata in alto (default: dipende dal modo)
 *
 * Contratto:  window.P5Sketches['<nome>'] = function (p, ctx) {...}
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};

  // Legge un token CSS (--nome) dal :root, con fallback: i colori seguono
  // l'identita' "Quaderno" senza cablare hex nello sketch.
  function cssVar(name, fallback) {
    try {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) {
      return fallback;
    }
  }

  // Il peso dei pezzi. Serve SOLO a far pendere il braccio dalla parte giusta:
  // e' il mondo fisico del problema, non un'informazione data allo studente.
  const PESO = { M: 2, m: 1, k: 1 };
  const TIPI = ['M', 'm', 'k'];
  const NOME = { M: 'mattone', m: 'mezzo mattone', k: 'peso da un chilo' };

  function leggiPiatto(s) {
    const c = { M: 0, m: 0, k: 0 };
    String(s == null ? '' : s).split('').forEach((ch) => {
      const t = ch === '1' ? 'k' : ch;
      if (c[t] != null) c[t] += 1;
    });
    return c;
  }

  function copia(c) { return { M: c.M, m: c.m, k: c.k }; }
  function pezzi(c) { return c.M + c.m + c.k; }
  function peso(c) { return PESO.M * c.M + PESO.m * c.m + PESO.k * c.k; }
  function chiave(a, b) {
    return a.M + ',' + a.m + ',' + a.k + '|' + b.M + ',' + b.m + ',' + b.k;
  }

  window.P5Sketches['bilancia-mattone'] = function (p, ctx) {
    const P = ctx.params || {};
    const modo = String(P.modo || 'libero').toLowerCase() === 'doppia' ? 'doppia' : 'libero';
    const inizS = leggiPiatto(P.sinistra != null ? P.sinistra : 'M');
    const inizD = leggiPiatto(P.destra != null ? P.destra : 'mk');
    const daTrovare = Math.max(1, Math.round(Number(P.equilibri) || 2));

    const titoloDefault = modo === 'doppia'
      ? 'Lascia un solo mattone intero a sinistra e soli pesi da un chilo a destra'
      : 'Trova ' + daTrovare + ' nuove situazioni di equilibrio';
    const title = P.titolo != null ? String(P.titolo) : titoloDefault;

    const hintTesto = modo === 'doppia'
      ? 'ogni mossa vale sui due piatti insieme'
      : 'i bottoni sotto ogni piatto valgono solo per quel piatto';

    // ---- stato -------------------------------------------------------------
    let S = copia(inizS);
    let D = copia(inizD);
    const chiaveIniziale = chiave(inizS, inizD);
    const trovati = new Set();       // equilibri nuovi gia' visti (modo libero)
    let done = false;
    let msg = '';                    // avviso breve sotto/al posto della consegna
    let msgAt = -1e9;
    let ang = 0;                     // inclinazione corrente, inseguita a molla

    const MAX_PEZZI = 8;             // oltre, il piatto diventa illeggibile

    if (ctx.completed) {
      done = true;
      if (modo === 'doppia') { S = { M: 1, m: 0, k: 0 }; D = { M: 0, m: 0, k: 2 }; }
    }

    // ---- layout ------------------------------------------------------------
    const PAD = 14;
    const GAP = 5;                   // spazio fra pezzi sullo stesso piatto
    const FULCRO_H = 46;
    const BTN_H = 30;
    const BTN_GAP = 6;

    let COL_INK, COL_INKSOFT, COL_GRID, COL_CARTA, COL_SURF, COL_GREEN, COL_ERR, COL_PESO;
    const COL_MATTONE = '#B05A2E';
    const COL_MATTONE_SCURO = '#7C3C1C';

    let W, cx, trayW, bw, bh, rowH, L, tilt;
    let headerRighe = [], headerSize = 13, headerH = 0;
    let hintRighe = [], yBase = 0, yPivot = 0, yStatus = 0, yHintTop = 0, yToolbar = 0;
    let toolbarH = BTN_H;
    let buttons = [];
    let hits = [];                   // rettangoli dei pezzi, per il tocco

    function angoloTarget() {
      const d = peso(D) - peso(S);          // destra piu' pesante -> destra giu'
      return Math.max(-0.20, Math.min(0.20, d * 0.05));
    }

    function aCapo(testo, maxW) {
      const parole = String(testo).split(' ');
      const righe = [];
      let cur = '';
      for (const w of parole) {
        const t = cur ? cur + ' ' + w : w;
        if (p.textWidth(t) > maxW && cur) { righe.push(cur); cur = w; } else { cur = t; }
      }
      if (cur) righe.push(cur);
      return righe;
    }

    function righeDisposizione(c) {
      const items = [];
      TIPI.forEach((t) => { for (let i = 0; i < c[t]; i++) items.push(t); });
      const righe = [[]];
      let largh = 0;
      for (const t of items) {
        const w = larghezza(t) + GAP;
        if (largh + w > trayW && righe[righe.length - 1].length) { righe.push([]); largh = 0; }
        righe[righe.length - 1].push(t);
        largh += w;
      }
      return righe;
    }

    function larghezza(t) { return t === 'M' ? bw : (t === 'm' ? bw * 0.5 : bw * 0.62); }

    function layout() {
      W = ctx.width;
      cx = W / 2;
      trayW = Math.min(190, (W - 2 * PAD) * 0.44);
      bw = trayW * 0.40;
      bh = bw * 0.52;
      rowH = bh + 5;
      L = (W - 2 * PAD - trayW) / 2;
      tilt = Math.ceil(L * 0.21);

      // Consegna: due righe al massimo, altrimenti si rimpicciolisce.
      headerSize = 13;
      p.textSize(headerSize);
      headerRighe = aCapo(testoHeader(), W - 2 * PAD);
      if (headerRighe.length > 2) {
        headerSize = 11;
        p.textSize(headerSize);
        headerRighe = aCapo(testoHeader(), W - 2 * PAD);
      }
      headerH = headerRighe.length * (headerSize + 5) + 10;

      const nRighe = Math.max(1, righeDisposizione(S).length, righeDisposizione(D).length);
      yPivot = headerH + nRighe * rowH + 20 + tilt;
      yBase = yPivot + FULCRO_H;
      yStatus = yBase + 16;
      yHintTop = yBase + 32;

      p.textSize(11);
      hintRighe = aCapo(hintTesto, W - 2 * PAD);
      yToolbar = yHintTop + hintRighe.length * 14 + 6;

      buildButtons();
      ctx.setHeight(yToolbar + toolbarH + PAD);
    }

    // ---- regole ------------------------------------------------------------
    function avvisa(testo) { msg = testo; msgAt = p.millis(); }

    function inEquilibrio() { return peso(S) === peso(D); }

    function verifica() {
      if (modo === 'doppia') {
        if (done) return;
        const ok = S.M === 1 && S.m === 0 && S.k === 0
          && D.M === 0 && D.m === 0 && D.k > 0;
        if (ok) { done = true; ctx.complete(); }
        return;
      }
      // libero: contano gli equilibri NUOVI, cioe' diversi da quello di
      // partenza. Ci si arriva solo agendo su tutti e due i piatti.
      if (!inEquilibrio()) return;
      if (pezzi(S) === 0 && pezzi(D) === 0) return;
      const k = chiave(S, D);
      if (k === chiaveIniziale) return;
      trovati.add(k);
      if (!done && trovati.size >= daTrovare) { done = true; ctx.complete(); }
    }

    function piatto(lato) { return lato === 'sin' ? S : D; }

    function aggiungi(lato, tipo) {
      const c = piatto(lato);
      if (pezzi(c) >= MAX_PEZZI) { avvisa('Il piatto è pieno'); return; }
      c[tipo] += 1;
      verifica();
    }

    function togliPezzo(lato, tipo) {
      const c = piatto(lato);
      if (c[tipo] <= 0) return;
      c[tipo] -= 1;
      verifica();
    }

    function togli(lato, tipo) {
      const c = piatto(lato);
      if (c[tipo] <= 0) {
        avvisa('Su quel piatto non c\'è un ' + NOME[tipo] + ' da togliere');
        return;
      }
      togliPezzo(lato, tipo);
    }

    // Spezzare e riunire non spostano peso: sono lo stesso mattone raccontato
    // in un altro modo. Agiscono su tutti e due i piatti, come ogni mossa qui.
    function spezzaTutti() {
      if (done) return;
      if (S.M === 0 && D.M === 0) {
        avvisa('Non c\'è nessun mattone intero da spezzare'); return;
      }
      if (pezzi(S) + S.M > MAX_PEZZI || pezzi(D) + D.M > MAX_PEZZI) {
        avvisa('Spezzandoli non ci starebbero tutti sui piatti'); return;
      }
      [S, D].forEach((c) => { c.m += 2 * c.M; c.M = 0; });
      verifica();
    }

    function unisciTutte() {
      if (done) return;
      if (S.m < 2 && D.m < 2) {
        avvisa('Non ci sono due metà da rimettere insieme'); return;
      }
      [S, D].forEach((c) => {
        const interi = Math.floor(c.m / 2);
        c.m -= 2 * interi;
        c.M += interi;
      });
      verifica();
    }

    function mossaDoppia(azione, tipo) {
      if (done) return;
      if (azione === 'togli') {
        if (S[tipo] <= 0 || D[tipo] <= 0) {
          const dove = S[tipo] <= 0 ? 'A sinistra' : 'A destra';
          avvisa(dove + ' non c\'è un ' + NOME[tipo] + ' da togliere');
          return;
        }
        S[tipo] -= 1;
        D[tipo] -= 1;
      } else {
        if (pezzi(S) >= MAX_PEZZI || pezzi(D) >= MAX_PEZZI) {
          avvisa('I piatti sono pieni'); return;
        }
        S[tipo] += 1;
        D[tipo] += 1;
      }
      verifica();
    }

    function raddoppia() {
      if (done) return;
      if (pezzi(S) * 2 > MAX_PEZZI || pezzi(D) * 2 > MAX_PEZZI) {
        avvisa('Raddoppiando non ci starebbe tutto sui piatti'); return;
      }
      TIPI.forEach((t) => { S[t] *= 2; D[t] *= 2; });
      verifica();
    }

    function reset() {
      S = copia(inizS);
      D = copia(inizD);
      msg = '';
      // Si puo' rifare il ragionamento da capo; la spunta gia' presa non si
      // toglie (x-step non "de-completa" un goal), ctx.complete() e' idempotente.
      done = false;
    }

    // Tocco su un pezzo: in `libero` lo toglie, in `doppia` spezza il mattone
    // in due meta' e riunisce due meta' in un mattone (il peso non cambia:
    // e' lo stesso mattone, raccontato in un altro modo).
    function clickPezzo(px, py) {
      for (const h of hits) {
        if (px < h.x || px > h.x + h.w || py < h.y || py > h.y + h.h) continue;
        if (done) return true;
        if (modo === 'libero') { togliPezzo(h.lato, h.tipo); return true; }
        const c = piatto(h.lato);
        if (h.tipo === 'M') {
          if (pezzi(c) + 1 > MAX_PEZZI) { avvisa('Il piatto è pieno'); return true; }
          c.M -= 1; c.m += 2;
        } else if (h.tipo === 'm') {
          if (c.m < 2) { avvisa('Serve un\'altra metà per rifare un mattone intero'); return true; }
          c.m -= 2; c.M += 1;
        } else {
          avvisa('Il peso da un chilo non si spezza');
          return true;
        }
        verifica();
        return true;
      }
      return false;
    }

    function clickAt(px, py) {
      for (const b of buttons) {
        if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
          if (!b.disabled) b.action();
          return true;
        }
      }
      return clickPezzo(px, py);
    }

    p.mousePressed = () => { clickAt(p.mouseX, p.mouseY); };
    // Su touch blocchiamo lo scroll solo se il tap ha colpito qualcosa.
    p.touchStarted = () => !clickAt(p.mouseX, p.mouseY);

    p.setup = () => {
      COL_INK = cssVar('--ink', '#1B2A4A');
      COL_INKSOFT = cssVar('--ink-soft', '#5A6275');
      COL_GRID = cssVar('--grid', '#D7E0EC');
      COL_CARTA = cssVar('--carta', '#FBFBF6');
      COL_SURF = cssVar('--surface', '#FFFFFF');
      COL_GREEN = cssVar('--spunta', '#1F9D55');
      COL_ERR = cssVar('--error', '#D7263D');
      COL_PESO = cssVar('--grafite', '#5A5E66');
      p.createCanvas(ctx.width, ctx.height);
      p.textFont('IBM Plex Mono, monospace');
      ang = angoloTarget();
      layout();
    };

    p.draw = () => {
      layout();                       // idempotente: assorbe resize e rotazioni
      p.background(COL_CARTA);
      ang += (angoloTarget() - ang) * 0.18;
      drawHeader();
      hits = [];
      drawBilancia();
      drawStato();
      drawHint();
      drawButtons();
    };

    // ---- disegno -----------------------------------------------------------
    function testoHeader() {
      if (done) {
        return modo === 'doppia'
          ? '✓ un mattone pesa 2 chili'
          : '✓ la bilancia resta in equilibrio se fai la stessa cosa da tutte e due le parti';
      }
      if (modo === 'libero') return title + '  (' + trovati.size + '/' + daTrovare + ')';
      return title;
    }

    function drawHeader() {
      const errore = p.millis() - msgAt < 1600 && msg;
      const righe = errore ? aCapo(msg, W - 2 * PAD) : headerRighe;
      p.push();
      p.noStroke();
      p.textSize(headerSize);
      p.textAlign(p.LEFT, p.CENTER);
      p.fill(errore ? COL_ERR : (done ? COL_GREEN : COL_INK));
      righe.forEach((r, i) => p.text(r, PAD, 12 + i * (headerSize + 5)));
      p.pop();
    }

    function drawBilancia() {
      const dx = L * Math.cos(ang);
      const dy = L * Math.sin(ang);
      const sinX = cx - dx, sinY = yPivot - dy;
      const desX = cx + dx, desY = yPivot + dy;

      // colonna e fulcro
      p.push();
      p.noStroke();
      p.fill(COL_INKSOFT);
      p.triangle(cx - 20, yBase, cx + 20, yBase, cx, yPivot);
      p.rect(cx - 34, yBase, 68, 5, 2);
      p.pop();

      // braccio
      p.push();
      p.translate(cx, yPivot);
      p.rotate(ang);
      p.noStroke();
      p.fill(COL_INK);
      p.rect(-L - 8, -4, 2 * L + 16, 8, 4);
      p.pop();
      p.push();
      p.noStroke();
      p.fill(COL_INK);
      p.circle(cx, yPivot, 12);
      p.pop();

      drawPiatto('sin', sinX, sinY, S);
      drawPiatto('des', desX, desY, D);
    }

    function drawPiatto(lato, x, y, c) {
      // montante + vassoio: il vassoio resta orizzontale, i pezzi ci stanno sopra
      p.push();
      p.stroke(COL_INK);
      p.strokeWeight(3);
      p.line(x, y, x, y - 12);
      p.noStroke();
      p.fill(COL_INK);
      p.rect(x - trayW / 2, y - 20, trayW, 8, 4);
      p.pop();

      const trayTop = y - 20;
      const righe = righeDisposizione(c);
      righe.forEach((riga, ri) => {
        const largh = riga.reduce((s, t) => s + larghezza(t), 0) + GAP * (riga.length - 1);
        let px = x - largh / 2;
        const yBot = trayTop - ri * rowH;
        riga.forEach((t) => {
          const w = larghezza(t);
          drawPezzo(t, px, yBot, w, bh);
          hits.push({ lato, tipo: t, x: px, y: yBot - bh, w, h: bh });
          px += w + GAP;
        });
      });

      if (pezzi(c) === 0) {
        p.push();
        p.noStroke();
        p.fill(COL_GRID);
        p.textSize(11);
        p.textAlign(p.CENTER, p.BOTTOM);
        p.text('vuoto', x, trayTop - 6);
        p.pop();
      }
    }

    function drawPezzo(tipo, x, yBot, w, h) {
      p.push();
      if (tipo === 'k') {
        p.noStroke();
        p.fill(COL_PESO);
        p.triangle(x, yBot, x + w, yBot, x + w / 2, yBot - h);
        if (h >= 18) {
          p.fill(COL_SURF);
          p.textSize(Math.min(13, h * 0.40));
          p.textAlign(p.CENTER, p.CENTER);
          p.text('1', x + w / 2, yBot - h * 0.30);
        }
      } else {
        p.stroke(COL_MATTONE_SCURO);
        p.strokeWeight(1.5);
        p.fill(COL_MATTONE);
        p.rect(x, yBot - h, w, h, 3);
        if (tipo === 'M') {
          p.strokeWeight(1);
          p.line(x + 3, yBot - h / 2, x + w - 3, yBot - h / 2);
        } else if (h >= 18) {
          p.noStroke();
          p.fill(COL_SURF);
          p.textSize(Math.min(13, h * 0.45));
          p.textAlign(p.CENTER, p.CENTER);
          p.text('½', x + w / 2, yBot - h / 2);
        }
      }
      p.pop();
    }

    function drawStato() {
      const eq = inEquilibrio();
      p.push();
      p.noStroke();
      p.textSize(13);
      p.textAlign(p.CENTER, p.CENTER);
      p.fill(eq ? COL_GREEN : COL_INKSOFT);
      p.text(eq ? 'in equilibrio'
        : 'pende a ' + (peso(S) > peso(D) ? 'sinistra' : 'destra'), cx, yStatus);
      p.pop();
    }

    function drawHint() {
      p.push();
      p.noStroke();
      p.textSize(11);
      p.textAlign(p.CENTER, p.CENTER);
      p.fill(COL_INKSOFT);
      hintRighe.forEach((r, i) => p.text(r, cx, yHintTop + i * 14));
      p.pop();
    }

    // ---- bottoni -----------------------------------------------------------
    function buildButtons() {
      buttons = [];
      if (modo === 'libero') buildLibero(); else buildDoppia();
    }

    // Sotto ogni piatto due file: una per aggiungere, una per togliere. Tutto
    // quello che si puo' fare ha un bottone: il tocco sui pezzi resta come
    // scorciatoia, ma su un telefono non ci si puo' contare.
    function buildLibero() {
      const w = Math.min(46, (trayW - 2 * BTN_GAP) / 3);
      const tot = 3 * w + 2 * BTN_GAP;
      [['sin', cx - L], ['des', cx + L]].forEach(([lato, centro]) => {
        [['+', 0], ['−', 1]].forEach(([segno, riga]) => {
          let x = centro - tot / 2;
          TIPI.forEach((t) => {
            buttons.push({
              x, y: yToolbar + riga * (BTN_H + BTN_GAP), w, h: BTN_H, segno, tipo: t,
              action: () => (segno === '+' ? aggiungi(lato, t) : togli(lato, t)),
            });
            x += w + BTN_GAP;
          });
        });
      });
      buttons.push({
        x: cx - 18, y: yToolbar + 2 * (BTN_H + BTN_GAP), w: 36, h: BTN_H,
        label: '↺', action: reset,
      });
      toolbarH = 3 * BTN_H + 2 * BTN_GAP;
    }

    // Tre file fisse: togli da entrambi, aggiungi a entrambi, poi le mosse che
    // riguardano tutta la bilancia. Righe fisse e non a flusso: la posizione
    // dei bottoni non balla passando da un telefono a uno schermo largo.
    function buildDoppia() {
      const w = Math.min(46, (trayW - 2 * BTN_GAP) / 3);
      [['−', 0], ['+', 1]].forEach(([segno, riga]) => {
        const tot = 3 * w + 2 * BTN_GAP;
        let x = cx - tot / 2;
        TIPI.forEach((t) => {
          buttons.push({
            x, y: yToolbar + riga * (BTN_H + BTN_GAP), w, h: BTN_H, segno, tipo: t,
            disabled: done,
            action: () => mossaDoppia(segno === '−' ? 'togli' : 'aggiungi', t),
          });
          x += w + BTN_GAP;
        });
      });

      p.textSize(13);
      const ultima = [
        { label: 'spezza', action: spezzaTutti },
        { label: 'unisci', action: unisciTutte },
        { label: '×2', action: raddoppia },
        { label: '↺', action: reset },
      ].map((b) => ({ ...b, w: Math.max(36, p.textWidth(b.label) + 18) }));
      const tot = ultima.reduce((a, b) => a + b.w, 0) + BTN_GAP * (ultima.length - 1);
      let x = cx - tot / 2;
      ultima.forEach((b) => {
        buttons.push({
          ...b, x, y: yToolbar + 2 * (BTN_H + BTN_GAP), h: BTN_H,
          disabled: done && b.action !== reset,
        });
        x += b.w + BTN_GAP;
      });
      toolbarH = 3 * BTN_H + 2 * BTN_GAP;
    }

    function drawButtons() {
      p.push();
      for (const b of buttons) {
        const tinta = b.disabled ? COL_GRID : COL_INK;
        p.stroke(tinta);
        p.strokeWeight(2);
        p.fill(COL_SURF);
        p.rect(b.x, b.y, b.w, b.h, 8);
        p.noStroke();
        p.fill(tinta);
        if (b.label) {
          p.textSize(13);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
        } else {
          p.textSize(14);
          p.textAlign(p.LEFT, p.CENTER);
          p.text(b.segno, b.x + 7, b.y + b.h / 2 + 1);
          drawIcona(b.tipo, b.x + b.w - 16, b.y + b.h / 2, b.disabled);
        }
      }
      p.pop();
    }

    // Icona minuscola del pezzo dentro al bottone (centrata in x, y).
    function drawIcona(tipo, x, y, spento) {
      const h = 14;
      p.push();
      if (tipo === 'k') {
        p.noStroke();
        p.fill(spento ? COL_GRID : COL_PESO);
        p.triangle(x - h * 0.5, y + h / 2, x + h * 0.5, y + h / 2, x, y - h / 2);
      } else {
        const w = tipo === 'M' ? h * 1.5 : h * 0.75;
        p.stroke(spento ? COL_GRID : COL_MATTONE_SCURO);
        p.strokeWeight(1.5);
        p.fill(spento ? COL_SURF : COL_MATTONE);
        p.rect(x - w / 2, y - h / 2, w, h, 2);
      }
      p.pop();
    }
  };
})();
