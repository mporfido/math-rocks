/**
 * Sketch p5.js riutilizzabile "passo-girato".
 *
 * Un file per sketch in static/sketches/, caricato al volo da <x-p5>.
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
   * "passo-girato" — il passo di una retta che ruota attorno all'origine.
   *
   * Sul quadrettato c'è la retta y = mx per l'origine e il passo che dall'origine
   * porta al punto (ax; ay): il triangolino "vai a destra di ax, sali di ay" già
   * usato per il coefficiente angolare. Il passo si prende per la punta e si gira.
   * La retta rossa lo segue, l'arco conta i gradi, e a un quarto di giro esatto
   * l'angolo scatta: compare il quadratino dell'angolo retto e il passo è diventato
   * (−ay; ax). Il coefficiente angolare della perpendicolare non è una formula da
   * ricordare: è quello che si legge sul passo girato.
   *
   * Girare a sinistra o a destra porta a due passi opposti ma alla STESSA retta:
   * è il motivo per cui la rotazione è libera nei due versi e il goal scatta in
   * entrambi i casi.
   *
   * Scrive nel modello (a fine trascinamento) `rx ry gradi`: le due componenti
   * del passo girato, con segno, e l'ampiezza della rotazione in gradi.
   *
   * Parametri (ctx.params):
   *   ax ay         il passo di partenza, dall'origine (default 1 2)
   *   nome          come scrivere la retta di partenza (default: dal coefficiente)
   *   xmin xmax     finestra orizzontale (default -5 5)
   *   ymin ymax     finestra verticale (default -5 5)
   */
  window.P5Sketches['passo-girato'] = function (p, ctx) {
    const P = ctx.params || {};

    const num = (v, def) => (Number.isFinite(Number(v)) ? Number(v) : def);

    const XMIN = num(P.xmin, -5);
    const XMAX = num(P.xmax, 5);
    const YMIN = num(P.ymin, -5);
    const YMAX = num(P.ymax, 5);

    // Il passo di partenza. Se arriva nullo non c'è niente da girare: si ripiega
    // sul passo di default, che almeno una retta la descrive.
    const AX = num(P.ax, 1) || 1;
    const AY = num(P.ay, 2);

    const RETTO = Math.PI / 2;
    const AGGANCIO = 0.07;   // quanto vicino all'angolo retto scatta lo scatto

    let INK, INKSOFT, CARTA, ROSSA, LINE;
    let ox = 0, oy = 0, u = 20, footerY = 0;
    let theta = 0;           // rotazione corrente, in radianti, con segno
    let dragging = false;

    function readTokens() {
      INK = cssVar('--ink', '#1B2A4A');
      INKSOFT = cssVar('--ink-soft', '#5A6275');
      CARTA = cssVar('--carta', '#FBFBF6');
      ROSSA = cssVar('--rossa', '#D7263D');
      LINE = cssVar('--line', '#DDE2D9');
    }

    // -- Geometria del piano ---------------------------------------------------

    function layout() {
      const margine = 14;
      footerY = ctx.height - 32;
      const largo = ctx.width - margine * 2;
      const alto = footerY - margine * 2;
      u = Math.max(6, Math.min(largo / (XMAX - XMIN), alto / (YMAX - YMIN)));
      ox = (ctx.width - (XMAX + XMIN) * u) / 2;
      oy = (footerY + margine * 0.5 + (YMAX + YMIN) * u) / 2;
    }

    const X = (gx) => ox + gx * u;
    const Y = (gy) => oy - gy * u;

    /** Il passo girato di theta: rotazione attorno all'origine. */
    function girato() {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      return { x: AX * c - AY * s, y: AX * s + AY * c };
    }

    const aQuartoDiGiro = () => Math.abs(Math.abs(theta) - RETTO) < 1e-9;

    /** Numeri all'italiana: virgola decimale, meno tipografico. */
    function fmt(v) {
      const r = Math.round(v * 100) / 100;
      const s = String(Math.abs(r)).replace('.', ',');
      return r < 0 ? '−' + s : s;
    }

    function mcd(a, b) {
      a = Math.abs(a);
      b = Math.abs(b);
      while (b) { const t = b; b = a % b; a = t; }
      return a || 1;
    }

    /** Il coefficiente angolare come frazione ridotta: "2", "−1/2", "verticale". */
    function pendenza(dx, dy) {
      if (Math.abs(dx) < 1e-9) return 'verticale';
      if (Math.abs(dy) < 1e-9) return '0';
      const interi = Math.abs(dx - Math.round(dx)) < 1e-9 &&
        Math.abs(dy - Math.round(dy)) < 1e-9;
      if (!interi) return fmt(dy / dx);
      const segno = (dy / dx) < 0 ? '−' : '';
      const n = Math.abs(Math.round(dy));
      const d = Math.abs(Math.round(dx));
      const k = mcd(n, d);
      return d / k === 1 ? segno + (n / k) : `${segno}${n / k}/${d / k}`;
    }

    function nomeRetta() {
      if (P.nome) return String(P.nome);
      const m = pendenza(AX, AY);
      if (m === 'verticale') return 'x = 0';
      return m === '1' ? 'y = x' : `y = ${m}x`;
    }

    // -- Ponte col modello della pagina ---------------------------------------

    function pubblica() {
      const r = girato();
      const arrotonda = (v) => Math.round(v * 100) / 100;
      ctx.set('rx', arrotonda(r.x));
      ctx.set('ry', arrotonda(r.y));
      ctx.set('gradi', Math.round((theta * 180) / Math.PI));
    }

    // -- Disegno ---------------------------------------------------------------

    function grigliaEAssi() {
      p.strokeWeight(1);
      p.stroke(LINE);
      for (let gx = Math.ceil(XMIN); gx <= XMAX; gx++) p.line(X(gx), Y(YMIN), X(gx), Y(YMAX));
      for (let gy = Math.ceil(YMIN); gy <= YMAX; gy++) p.line(X(XMIN), Y(gy), X(XMAX), Y(gy));

      p.stroke(INKSOFT);
      p.strokeWeight(1.5);
      p.line(X(XMIN), Y(0), X(XMAX), Y(0));
      p.line(X(0), Y(YMIN), X(0), Y(YMAX));

      if (u < 22) return;
      p.noStroke();
      p.fill(INKSOFT);
      p.textSize(Math.min(11, u * 0.5));
      p.textAlign(p.CENTER, p.TOP);
      for (let gx = Math.ceil(XMIN); gx <= XMAX; gx++) {
        if (gx !== 0) p.text(gx, X(gx), Y(0) + 3);
      }
      p.textAlign(p.RIGHT, p.CENTER);
      for (let gy = Math.ceil(YMIN); gy <= YMAX; gy++) {
        if (gy !== 0) p.text(gy, X(0) - 4, Y(gy));
      }
    }

    /** Tutto quello che sta sul piano resta dentro il quadrettato. */
    function dentroIlPiano(disegna) {
      const g = p.drawingContext;
      g.save();
      g.beginPath();
      g.rect(X(XMIN), Y(YMAX), (XMAX - XMIN) * u, (YMAX - YMIN) * u);
      g.clip();
      disegna();
      g.restore();
    }

    /** La retta per l'origine che ha (dx, dy) come passo, tirata fino ai bordi. */
    function rettaPerOrigine(dx, dy, colore, spessore) {
      const k = (XMAX - XMIN) + (YMAX - YMIN);
      const n = Math.hypot(dx, dy) || 1;
      p.stroke(colore);
      p.strokeWeight(spessore);
      p.line(
        X((-dx / n) * k), Y((-dy / n) * k),
        X((dx / n) * k), Y((dy / n) * k)
      );
    }

    /** Freccia dall'origine a (dx, dy), con la punta sul posto. */
    function passo(dx, dy, colore) {
      p.stroke(colore);
      p.strokeWeight(3);
      p.line(X(0), Y(0), X(dx), Y(dy));

      const ang = Math.atan2(-dy, dx);
      const l = 10;
      p.noStroke();
      p.fill(colore);
      p.triangle(
        X(dx), Y(dy),
        X(dx) - l * Math.cos(ang - 0.42), Y(dy) - l * Math.sin(ang - 0.42),
        X(dx) - l * Math.cos(ang + 0.42), Y(dy) - l * Math.sin(ang + 0.42)
      );
    }

    /** L'arco fra il passo di partenza e quello girato, con i gradi. */
    function arco() {
      if (Math.abs(theta) < 0.02) return;
      const r = Math.min(Math.hypot(AX, AY) * u * 0.45, 46);
      const da = Math.atan2(-AY, AX);
      p.noFill();
      p.stroke(ROSSA);
      p.strokeWeight(1.5);
      p.arc(X(0), Y(0), r * 2, r * 2, Math.min(da, da - theta), Math.max(da, da - theta));

      const meta = da - theta / 2;
      p.noStroke();
      p.fill(ROSSA);
      p.textSize(12);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(
        `${Math.abs(Math.round((theta * 180) / Math.PI))}°`,
        X(0) + (r + 14) * Math.cos(meta),
        Y(0) + (r + 14) * Math.sin(meta)
      );
    }

    /** Il quadratino dell'angolo retto, appoggiato ai due passi. */
    function quadratino() {
      const r = girato();
      const na = Math.hypot(AX, AY) || 1;
      const nr = Math.hypot(r.x, r.y) || 1;
      const l = Math.min(0.55, na * 0.4);
      const ua = { x: (AX / na) * l, y: (AY / na) * l };
      const ur = { x: (r.x / nr) * l, y: (r.y / nr) * l };
      p.noFill();
      p.stroke(ROSSA);
      p.strokeWeight(1.5);
      p.beginShape();
      p.vertex(X(ua.x), Y(ua.y));
      p.vertex(X(ua.x + ur.x), Y(ua.y + ur.y));
      p.vertex(X(ur.x), Y(ur.y));
      p.endShape();
    }

    function etichetta(testo, x, y, colore, allineaX, allineaY) {
      p.noStroke();
      p.fill(colore);
      p.textSize(13);
      p.textAlign(allineaX, allineaY);
      p.text(testo, x, y);
    }

    /** La riga in fondo: stringe il corpo, poi va a capo, ma non esce mai. */
    function piede(testo, colore) {
      if (!testo) return;
      const largo = ctx.width - 16;
      p.noStroke();
      p.fill(colore);
      p.textAlign(p.CENTER, p.CENTER);

      let corpo = 12;
      p.textSize(corpo);
      while (corpo > 9 && p.textWidth(testo) > largo) {
        corpo -= 0.5;
        p.textSize(corpo);
      }
      if (p.textWidth(testo) <= largo) {
        p.text(testo, ctx.width / 2, footerY + 15);
        return;
      }
      const parole = testo.split(' ');
      let prima = '';
      while (parole.length && p.textWidth(prima + parole[0]) <= largo) {
        prima += parole.shift() + ' ';
      }
      p.text(prima.trim(), ctx.width / 2, footerY + 9);
      p.text(parole.join(' '), ctx.width / 2, footerY + 22);
    }

    function testoDelPiede() {
      const r = girato();
      if (aQuartoDiGiro()) {
        const verso = theta > 0 ? 'a sinistra' : 'a destra';
        return `Un quarto di giro ${verso}: il passo (${fmt(AX)}; ${fmt(AY)}) ` +
          `è diventato (${fmt(r.x)}; ${fmt(r.y)}). ` +
          `Da m = ${pendenza(AX, AY)} a m = ${pendenza(r.x, r.y)}.`;
      }
      if (Math.abs(theta) < 0.02) {
        return 'Prendi la punta rossa e gira il passo attorno all\'origine.';
      }
      return 'Continua a girare: ti serve un quarto di giro esatto, cioè 90°.';
    }

    p.setup = () => {
      p.createCanvas(ctx.width, ctx.height);
      p.textFont('IBM Plex Mono');
      readTokens();
      layout();
      pubblica();
    };

    p.draw = () => {
      layout();
      p.background(CARTA);
      grigliaEAssi();

      const r = girato();
      dentroIlPiano(() => {
        rettaPerOrigine(AX, AY, LINE, 2);
        rettaPerOrigine(r.x, r.y, ROSSA, 2.5);
        passo(AX, AY, INK);
        passo(r.x, r.y, ROSSA);
        arco();
        if (aQuartoDiGiro()) quadratino();
      });

      etichetta(nomeRetta(), X(XMIN) + 8, Y(YMAX) + 8, INKSOFT, p.LEFT, p.TOP);

      // La manopola: il pallino che dice dove si prende il passo.
      p.noStroke();
      p.fill(ROSSA);
      p.circle(X(r.x), Y(r.y), dragging ? 17 : 13);

      piede(testoDelPiede(), aQuartoDiGiro() ? INK : INKSOFT);
    };

    // -- Interazione -----------------------------------------------------------

    /** L'angolo del mouse rispetto all'origine, meno quello del passo iniziale. */
    function angoloDalMouse() {
      const a = Math.atan2(-(p.mouseY - oy), p.mouseX - ox);
      const b = Math.atan2(AY, AX);
      let d = a - b;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d <= -Math.PI) d += 2 * Math.PI;
      return d;
    }

    function pStart() {
      const r = girato();
      if (p.dist(p.mouseX, p.mouseY, X(r.x), Y(r.y)) > 24) return false;
      dragging = true;
      return true;
    }

    function pMove() {
      if (!dragging) return;
      const d = angoloDalMouse();
      // Vicino al quarto di giro l'angolo scatta: così le coordinate del passo
      // girato restano quelle intere che lo studente deve leggere.
      if (Math.abs(d - RETTO) < AGGANCIO) theta = RETTO;
      else if (Math.abs(d + RETTO) < AGGANCIO) theta = -RETTO;
      else theta = d;
    }

    function pEnd() {
      if (!dragging) return;
      dragging = false;
      pubblica();
      if (aQuartoDiGiro()) ctx.complete();
    }

    p.mousePressed = () => { pStart(); };
    p.mouseDragged = () => { pMove(); };
    p.mouseReleased = () => { pEnd(); };

    p.touchStarted = () => { const preso = pStart(); return !preso; };
    p.touchMoved = () => { if (!dragging) return true; pMove(); return false; };
    p.touchEnded = () => { pEnd(); return true; };
  };
})();
