/**
 * Sketch p5.js riutilizzabile "gettoni-interi".
 *
 * La "tasca dei gettoni": un mucchio fatto di gettoni BLU (valgono +1) e ROSSI
 * (valgono −1). Un blu e un rosso, insieme, valgono 0: nel disegno stanno
 * incolonnati uno sopra l'altro, così le coppie che si annullano si vedono a
 * colpo d'occhio e il valore del mucchio è ciò che "avanza".
 *
 * Lo stesso sketch copre i quattro momenti della lezione, tramite `modo`:
 *   annulla     il mucchio è dato: si tolgono le coppie che valgono 0 finché
 *               resta un solo colore (goal: mucchio ridotto)
 *   costruisci  si costruisce un mucchio di valore `valore` (ed eventualmente
 *               con esattamente `pezzi` gettoni)
 *   mossa       si esegue un'istruzione ("togli 3 rossi", "aggiungi 3 rossi"):
 *               per togliere ciò che non c'è si aggiungono prima coppie da 0
 *   libero      banco di prova senza goal
 *
 * Parametri (ctx.params):
 *   modo      'libero' (default) | 'annulla' | 'costruisci' | 'mossa'
 *   blu       gettoni blu iniziali (default 0)
 *   rossi     gettoni rossi iniziali (default 0)
 *   valore    (costruisci) valore che il mucchio deve avere
 *   pezzi     (costruisci) numero esatto di gettoni, opzionale
 *   azione    (mossa) 'togli' (default) | 'aggiungi'
 *   colore    (mossa) 'rosso' (default) | 'blu'
 *   quantita  (mossa) quanti gettoni togliere/aggiungere (default 1)
 *   coppie    'si' | 'no': mostra il bottone "coppia che vale 0"
 *             (default: sì in modo=libero e in modo=mossa con azione=togli)
 *   mostra    quando scrivere il valore del mucchio: 'si' (default) | 'no' |
 *             'fine' (solo a mucchio ridotto; default in modo=annulla)
 *   titolo    consegna mostrata in alto (default: dipende dal modo)
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

  // Segno meno tipografico: più leggibile del trattino del monospace.
  function fmt(v) {
    if (v === 0) return '0';
    return v < 0 ? '−' + Math.abs(v) : '+' + v;
  }

  function plurale(n, uno, molti) { return n === 1 ? uno : molti; }

  window.P5Sketches['gettoni-interi'] = function (p, ctx) {
    const P = ctx.params || {};
    const modo = String(P.modo || 'libero').toLowerCase();
    const bluIniz = Math.max(0, Math.round(Number(P.blu) || 0));
    const rossiIniz = Math.max(0, Math.round(Number(P.rossi) || 0));

    const valoreTarget = (P.valore != null && P.valore !== '')
      ? Math.round(Number(P.valore)) : null;
    const pezziTarget = (P.pezzi != null && P.pezzi !== '')
      ? Math.round(Number(P.pezzi)) : null;

    const azione = String(P.azione || 'togli').toLowerCase() === 'aggiungi'
      ? 'aggiungi' : 'togli';
    const coloreMossa = String(P.colore || 'rosso').toLowerCase() === 'blu'
      ? 'blu' : 'rosso';
    const quantita = Math.max(1, Math.round(Number(P.quantita) || 1));

    const coppieDefault = modo === 'libero' || (modo === 'mossa' && azione === 'togli');
    const coppieOn = P.coppie != null
      ? String(P.coppie).toLowerCase() === 'si'
      : coppieDefault;

    const mostra = String(P.mostra || (modo === 'annulla' ? 'fine' : 'si')).toLowerCase();

    const titoloDefault = () => {
      if (modo === 'annulla') return 'Togli le coppie che valgono 0';
      if (modo === 'costruisci') {
        let t = 'Costruisci un mucchio che vale ' + fmt(valoreTarget || 0);
        if (pezziTarget != null) t += ' con ' + pezziTarget + ' gettoni';
        return t;
      }
      if (modo === 'mossa') {
        const col = coloreMossa === 'blu'
          ? plurale(quantita, 'blu', 'blu')
          : plurale(quantita, 'rosso', 'rossi');
        return (azione === 'togli' ? 'Togli ' : 'Aggiungi ') + quantita + ' ' + col;
      }
      return 'Aggiungi e togli gettoni: quanto vale il mucchio?';
    };
    const title = P.titolo != null ? String(P.titolo) : titoloDefault();

    // ---- stato -------------------------------------------------------------
    let nBlu = bluIniz;
    let nRosso = rossiIniz;
    let fatti = 0;              // gettoni già tolti/aggiunti in modo=mossa
    let done = false;
    let msg = '';               // avviso breve (rosso) sotto la consegna
    let msgAt = -1e9;
    let puff = null;            // {x, y, t}: coppia appena annullata

    const isGoalMode = modo === 'annulla' || modo === 'costruisci' || modo === 'mossa';

    // Ripristino da storage: mostriamo direttamente lo stato finale.
    if (ctx.completed && isGoalMode) {
      done = true;
      if (modo === 'annulla') {
        const coppie = Math.min(nBlu, nRosso);
        nBlu -= coppie;
        nRosso -= coppie;
      } else if (modo === 'mossa') {
        fatti = quantita;
        const delta = azione === 'aggiungi' ? quantita : -quantita;
        if (coloreMossa === 'blu') nBlu = Math.max(0, nBlu + delta);
        else nRosso = Math.max(0, nRosso + delta);
      } else if (modo === 'costruisci' && valoreTarget != null) {
        const b = pezziTarget != null ? (pezziTarget + valoreTarget) / 2 : Math.max(valoreTarget, 0);
        nBlu = Math.max(0, Math.round(b));
        nRosso = Math.max(0, nBlu - valoreTarget);
      }
    }

    // ---- layout ------------------------------------------------------------
    const PAD = 14;
    const HEADER = 40;      // consegna + badge del valore
    const BTN_H = 30;
    const BTN_GAP = 8;
    const MIN_COLS = 8;     // colonne "virtuali": tiene stabile la dimensione
    const MAX_R = 22;

    let COL_INK, COL_INKSOFT, COL_GRID, COL_CARTA, COL_SURF, COL_GREEN, COL_ERR;
    const COL_BLU = '#2F6FD0';   // gettone positivo
    let COL_ROSSO;               // gettone negativo (penna rossa del tema)

    let cell, r, yBlu, yRosso, boxTop, boxH;
    let buttons = [];       // ricostruiti a ogni draw (servono le misure del testo)
    let btnRows = 1;        // righe di bottoni: su canvas stretti vanno a capo

    function valore() { return nBlu - nRosso; }
    function coppie() { return Math.min(nBlu, nRosso); }

    function layout() {
      const W = ctx.width;
      const cols = Math.max(MIN_COLS, nBlu, nRosso);
      cell = (W - 2 * PAD) / cols;
      r = Math.min(cell * 0.42, MAX_R);
      const rowH = 2 * r + 10;
      boxTop = HEADER;
      boxH = 2 * rowH + 14;
      yBlu = boxTop + 10 + rowH / 2;
      yRosso = yBlu + rowH;
      applyHeight();
    }

    // La toolbar cresce se i bottoni sono andati a capo: l'altezza si ricalcola
    // sia in layout() sia subito dopo buildButtons(), che è chi conta le righe.
    function applyHeight() {
      const toolbarH = 12 + btnRows * BTN_H + (btnRows - 1) * BTN_GAP;
      ctx.setHeight(HEADER + boxH + toolbarH);
    }

    function tokenX(i) { return PAD + cell * (i + 0.5); }

    // ---- regole ------------------------------------------------------------
    function avvisa(testo) { msg = testo; msgAt = p.millis(); }

    function verifica() {
      if (done || !isGoalMode) return;
      if (modo === 'annulla') {
        if (coppie() === 0) { done = true; ctx.complete(); }
      } else if (modo === 'costruisci') {
        const okValore = valoreTarget != null && valore() === valoreTarget;
        const okPezzi = pezziTarget == null || (nBlu + nRosso) === pezziTarget;
        if (okValore && okPezzi && nBlu + nRosso > 0) { done = true; ctx.complete(); }
      } else if (modo === 'mossa') {
        if (fatti >= quantita) { done = true; ctx.complete(); }
      }
    }

    // Aggiunge un gettone del colore indicato. Restituisce true se l'azione è
    // permessa nel modo corrente.
    function aggiungi(colore) {
      if (done) return false;
      if (modo === 'annulla') return false;
      if (modo === 'mossa') {
        if (azione !== 'aggiungi' || colore !== coloreMossa) return false;
        fatti += 1;
      }
      if (colore === 'blu') nBlu += 1; else nRosso += 1;
      verifica();
      return true;
    }

    function aggiungiCoppia() {
      if (done || !coppieOn) return false;
      nBlu += 1;
      nRosso += 1;
      verifica();               // in costruisci una coppia può completare `pezzi`
      return true;
    }

    function reset() {
      nBlu = bluIniz;
      nRosso = rossiIniz;
      fatti = 0;
      msg = '';
      // Si può rifare il ragionamento da capo; la spunta già presa non si
      // toglie (x-step non "de-completa" un goal), ctx.complete() è idempotente.
      done = false;
    }

    // Click su un gettone: in `annulla` toglie la coppia della colonna, altrove
    // toglie il singolo gettone (se il modo lo consente).
    function clickGettone(px, py) {
      const riga = Math.abs(py - yBlu) <= r + 4 ? 'blu'
        : (Math.abs(py - yRosso) <= r + 4 ? 'rosso' : null);
      // In `annulla` si clicca la COPPIA, non il singolo gettone: è sensibile
      // tutta la colonna, compreso lo spazio in mezzo dove sta scritto "0".
      const colonna = modo === 'annulla'
        && py >= yBlu - r - 4 && py <= yRosso + r + 4;
      if (!riga && !colonna) return false;
      const n = riga === 'blu' ? nBlu : (riga === 'rosso' ? nRosso : Math.max(nBlu, nRosso));
      const i = Math.floor((px - PAD) / cell);
      if (i < 0 || i >= n) return false;
      if (Math.abs(px - tokenX(i)) > r + 2) return false;

      if (done) return true;

      if (modo === 'annulla') {
        if (i >= coppie()) {
          avvisa('Questo gettone non ha compagno: da solo non vale 0');
          return true;
        }
        puff = { x: tokenX(i), y: (yBlu + yRosso) / 2, t: p.millis() };
        nBlu -= 1;
        nRosso -= 1;
        verifica();
        return true;
      }

      if (modo === 'mossa') {
        if (azione !== 'togli') { avvisa('Qui i gettoni si aggiungono, non si tolgono'); return true; }
        if (riga !== coloreMossa) {
          avvisa('Devi togliere solo i ' + (coloreMossa === 'blu' ? 'blu' : 'rossi'));
          return true;
        }
      }

      if (riga === 'blu') nBlu -= 1; else nRosso -= 1;
      if (modo === 'mossa') fatti += 1;
      verifica();
      return true;
    }

    function clickAt(px, py) {
      // Prima i bottoni: sono sopra la zona dei gettoni.
      for (const b of buttons) {
        if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
          if (b.disabled) return true;
          b.action();
          return true;
        }
      }
      return clickGettone(px, py);
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
      COL_ROSSO = cssVar('--rossa', '#D7263D');
      p.createCanvas(ctx.width, ctx.height);
      layout();
      p.textFont('IBM Plex Mono, monospace');
    };

    p.draw = () => {
      layout();               // idempotente: assorbe resize e rotazioni
      p.background(COL_CARTA);
      buildButtons();
      drawHeader();
      drawCoppie();
      drawGettoni();
      drawPuff();
      drawButtons();
    };

    // ---- disegno -----------------------------------------------------------
    function drawHeader() {
      const errore = p.millis() - msgAt < 1400 && msg;
      const badge = badgeInfo();
      const testo = done ? '✓ ' + testoFinale()
        : (errore ? msg : title + progresso());
      const tinta = done ? COL_GREEN : (errore ? COL_ERR : COL_INK);

      p.push();
      p.noStroke();
      p.textAlign(p.LEFT, p.CENTER);
      // Su canvas stretti la consegna si rimpicciolisce per non finire sotto
      // al badge del valore.
      const maxW = ctx.width - 2 * PAD - (badge ? badge.w + 10 : 0);
      let size = 14;
      p.textSize(size);
      while (size > 10 && p.textWidth(testo) > maxW) {
        size -= 1;
        p.textSize(size);
      }
      p.fill(tinta);
      p.text(testo, PAD, HEADER / 2);
      if (badge) drawBadge(badge);
      p.pop();
    }

    function progresso() {
      if (modo === 'mossa' && quantita > 1) return '  (' + fatti + '/' + quantita + ')';
      return '';
    }

    function testoFinale() {
      if (modo === 'annulla') {
        const v = valore();
        const resto = v === 0 ? 'non resta niente'
          : 'restano solo ' + (v > 0 ? 'blu' : 'rossi');
        return resto + ': il mucchio vale ' + fmt(v);
      }
      if (modo === 'costruisci') return 'fatto: vale ' + fmt(valore())
        + (pezziTarget != null ? ' con ' + (nBlu + nRosso) + ' gettoni' : '');
      if (modo === 'mossa') return 'fatto: ora il mucchio vale ' + fmt(valore());
      return 'fatto!';
    }

    // Badge con il valore corrente, in alto a destra. Misurato prima di
    // disegnare la consegna, che deve stargli a sinistra senza sovrapporsi.
    function badgeInfo() {
      const visibile = mostra === 'si' || (mostra === 'fine' && (done || coppie() === 0));
      if (!visibile) return null;
      const v = valore();
      const testo = 'vale ' + fmt(v);
      p.textSize(15);
      return { v, testo, w: p.textWidth(testo) + 18, h: 24 };
    }

    function drawBadge(badge) {
      const { v, testo, w, h } = badge;
      const x = ctx.width - PAD - w;
      const y = (HEADER - h) / 2;
      p.push();
      p.textSize(15);
      p.noStroke();
      p.fill(v === 0 ? COL_GRID : (v > 0 ? COL_BLU : COL_ROSSO));
      p.rect(x, y, w, h, 12);
      p.fill(v === 0 ? COL_INK : COL_SURF);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(testo, x + w / 2, y + h / 2 + 1);
      p.pop();
    }

    // Cornice tratteggiata attorno a ogni coppia blu+rosso: è il "vale 0".
    function drawCoppie() {
      const n = coppie();
      if (n === 0) return;
      p.push();
      p.noFill();
      p.stroke(COL_GRID);
      p.strokeWeight(2);
      for (let i = 0; i < n; i++) {
        const x = tokenX(i);
        p.rect(x - r - 3, yBlu - r - 5, 2 * r + 6, (yRosso - yBlu) + 2 * r + 10, 10);
      }
      // Etichetta "0" solo se le coppie sono ancora poche: altrimenti è rumore.
      if (n <= 8 && r > 12) {
        p.noStroke();
        p.fill(COL_INKSOFT);
        p.textSize(11);
        p.textAlign(p.CENTER, p.CENTER);
        for (let i = 0; i < n; i++) p.text('0', tokenX(i), (yBlu + yRosso) / 2);
      }
      p.pop();
    }

    function drawGettone(x, y, colore) {
      p.push();
      p.noStroke();
      p.fill(colore === 'blu' ? COL_BLU : COL_ROSSO);
      p.circle(x, y, 2 * r);
      p.stroke(COL_SURF);
      p.strokeWeight(Math.max(2, r * 0.16));
      const b = r * 0.45;
      p.line(x - b, y, x + b, y);                       // barra del + / −
      if (colore === 'blu') p.line(x, y - b, x, y + b);
      p.pop();
    }

    function drawGettoni() {
      for (let i = 0; i < nBlu; i++) drawGettone(tokenX(i), yBlu, 'blu');
      for (let i = 0; i < nRosso; i++) drawGettone(tokenX(i), yRosso, 'rosso');
      if (nBlu === 0 && nRosso === 0) {
        p.push();
        p.noStroke();
        p.fill(COL_INKSOFT);
        p.textSize(14);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('tasca vuota', ctx.width / 2, (yBlu + yRosso) / 2);
        p.pop();
      }
    }

    // Breve "puff" dove è sparita una coppia.
    function drawPuff() {
      if (!puff) return;
      const t = (p.millis() - puff.t) / 420;
      if (t >= 1) { puff = null; return; }
      p.push();
      p.noFill();
      p.stroke(COL_INKSOFT);
      p.strokeWeight(2 * (1 - t));
      p.circle(puff.x, puff.y, 2 * r + 40 * t);
      p.pop();
    }

    // ---- bottoni -----------------------------------------------------------
    function buildButtons() {
      buttons = [];
      const specs = [];
      const puoAggiungere = (colore) => modo === 'libero' || modo === 'costruisci'
        || (modo === 'mossa' && azione === 'aggiungi' && colore === coloreMossa);

      if (puoAggiungere('blu')) {
        specs.push({ label: '+ blu', colore: 'blu', action: () => aggiungi('blu') });
      }
      if (puoAggiungere('rosso')) {
        specs.push({ label: '+ rosso', colore: 'rosso', action: () => aggiungi('rosso') });
      }
      if (coppieOn) {
        specs.push({ label: '+ coppia che vale 0', action: aggiungiCoppia });
      }
      specs.push({ label: '↺', action: reset, small: true });

      p.textSize(13);
      const y0 = HEADER + boxH + 6;
      let x = PAD;
      let riga = 0;
      for (const s of specs) {
        const w = (s.small ? 24 : p.textWidth(s.label)) + 20;
        // A capo quando il bottone non ci sta più (canvas stretti, mobile).
        if (x > PAD && x + w > ctx.width - PAD) {
          riga += 1;
          x = PAD;
        }
        buttons.push({
          ...s,
          x,
          y: y0 + riga * (BTN_H + BTN_GAP),
          w,
          h: BTN_H,
          disabled: done && s.action !== reset,
        });
        x += w + BTN_GAP;
      }
      btnRows = riga + 1;
      applyHeight();
    }

    function drawButtons() {
      p.push();
      p.textSize(13);
      p.textAlign(p.CENTER, p.CENTER);
      for (const b of buttons) {
        const tinta = b.colore === 'blu' ? COL_BLU : (b.colore === 'rosso' ? COL_ROSSO : COL_INK);
        p.stroke(b.disabled ? COL_GRID : tinta);
        p.strokeWeight(2);
        p.fill(COL_SURF);
        p.rect(b.x, b.y, b.w, b.h, 8);
        p.noStroke();
        p.fill(b.disabled ? COL_GRID : tinta);
        p.text(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
      }
      p.pop();
    }
  };
})();
