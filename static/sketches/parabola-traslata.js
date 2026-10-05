/**
 * Sketch p5.js riutilizzabile "parabola-traslata".
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

  // -- Frazioni: i coefficienti si scrivono come sul quaderno, 1/4 e non 0,25 --

  function mcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  }

  function fr(n, d = 1) {
    if (d < 0) { n = -n; d = -d; }
    const g = mcd(n, d);
    return { n: n / g, d: d / g };
  }

  const piu = (r, s) => fr(r.n * s.d + s.n * r.d, r.d * s.d);
  const per = (r, s) => fr(r.n * s.n, r.d * s.d);
  const val = (r) => r.n / r.d;

  /** "1/4", "-2", 0.5 → frazione (i decimali al più con due cifre). */
  function leggiFrazione(v, def) {
    if (v === undefined || v === null || v === '') return def;
    const s = String(v).trim().replace('−', '-');
    const m = s.match(/^(-?\d+)\s*\/\s*(\d+)$/);
    if (m && Number(m[2]) !== 0) return fr(Number(m[1]), Number(m[2]));
    const x = Number(s.replace(',', '.'));
    if (!Number.isFinite(x) || x === 0) return def;
    return fr(Math.round(x * 100), 100);
  }

  /**
   * "parabola-traslata" — la parabola y = a·x² portata col vertice in V(h; k).
   *
   * Il vertice V si trascina e scatta sui nodi della griglia. La parabola lo
   * segue senza cambiare forma: in grigio resta quella di partenza, col vertice
   * nell'origine, e una freccia va dall'origine a V. Sopra il piano l'equazione
   * si riscrive a ogni spostamento, con i segni già sistemati: con V(−2; 3)
   * scrive y = (x + 2)² + 3, non (x − (−2))².
   *
   * Scrive nel modello, a fine trascinamento e all'avvio, `h k`: le coordinate
   * del vertice. Le domande del testo le controllano con `{check: h == … }`.
   *
   * Parametri (ctx.params):
   *   a             il coefficiente, intero o frazione scritta "1/4" (default 1)
   *   hx hy         posizione iniziale del vertice (default 0 0)
   *   forma         quale equazione scrivere sopra il piano:
   *                   "vertice"    y = a(x − h)² + k   (default)
   *                   "sviluppata" y = ax² + bx + c
   *                   "entrambe"   le due, una sotto l'altra
   *                   "nessuna"    nessuna: serve quando l'equazione è la domanda
   *   traccia       "si"|"no": la parabola di partenza e la freccia (default si)
   *   fuoco         "si"|"no": il fuoco F e la direttrice d (default no)
   *   asse          "si"|"no": l'asse di simmetria tratteggiato (default no)
   *   blocca        "si": V non si trascina (default no)
   *   xmin xmax     finestra orizzontale (default -6 6)
   *   ymin ymax     finestra verticale (default -4 6)
   */
  window.P5Sketches['parabola-traslata'] = function (p, ctx) {
    const P = ctx.params || {};

    const si = (v, def) => (v === undefined ? def : String(v) !== 'no');
    const num = (v, def) => (Number.isFinite(Number(v)) ? Number(v) : def);

    const A = leggiFrazione(P.a, fr(1));
    const XMIN = num(P.xmin, -6);
    const XMAX = num(P.xmax, 6);
    const YMIN = num(P.ymin, -4);
    const YMAX = num(P.ymax, 6);

    const FORMA = ['vertice', 'sviluppata', 'entrambe', 'nessuna'].includes(P.forma)
      ? P.forma : 'vertice';
    const MOSTRA_TRACCIA = si(P.traccia, true);
    const MOSTRA_FUOCO = si(P.fuoco, false);
    const MOSTRA_ASSE = si(P.asse, false);
    const BLOCCATO = P.blocca !== undefined && String(P.blocca) !== 'no';

    const V = { x: Math.round(num(P.hx, 0)), y: Math.round(num(P.hy, 0)) };
    // Distanza con segno dal vertice al fuoco: p = 1/(4a).
    const PF = 1 / (4 * val(A));

    let INK, INKSOFT, CARTA, ROSSA, BLU, LINE;
    let ox = 0, oy = 0, u = 20, footerY = 0, testaH = 0;
    let preso = false;

    function readTokens() {
      INK = cssVar('--ink', '#1B2A4A');
      INKSOFT = cssVar('--ink-soft', '#5A6275');
      CARTA = cssVar('--carta', '#FBFBF6');
      ROSSA = cssVar('--rossa', '#D7263D');
      BLU = cssVar('--blu', '#1F6FB2');
      LINE = cssVar('--line', '#DDE2D9');
    }

    // -- Geometria del piano ---------------------------------------------------

    function layout() {
      const margine = 12;
      testaH = FORMA === 'nessuna' ? 0 : (FORMA === 'entrambe' ? 84 : 46);
      footerY = ctx.height - (BLOCCATO ? 8 : 30);
      const largo = ctx.width - margine * 2;
      const alto = footerY - testaH - margine * 2;
      u = Math.max(6, Math.min(largo / (XMAX - XMIN), alto / (YMAX - YMIN)));
      ox = (ctx.width - (XMAX + XMIN) * u) / 2;
      oy = (testaH + footerY + (YMAX + YMIN) * u) / 2;
    }

    const X = (gx) => ox + gx * u;
    const Y = (gy) => oy - gy * u;
    const gX = (px) => (px - ox) / u;
    const gY = (py) => (oy - py) / u;

    const curvaY = (x, h, k) => val(A) * (x - h) ** 2 + k;

    /** Numero corto con la virgola: 0.25 → "0,25", −1 → "−1". */
    function fmt(v) {
      const r = Math.round(v * 100) / 100;
      return String(r).replace('.', ',').replace('-', '−');
    }

    // -- Ponte col modello della pagina ---------------------------------------

    function pubblica() {
      ctx.set('h', V.x);
      ctx.set('k', V.y);
    }

    // -- L'equazione, come sequenza di pezzi: testo e frazioni impilate --------

    const T = (s) => ({ t: 'testo', s });
    const F = (r) => ({ t: 'frazione', n: Math.abs(r.n), d: r.d });

    /** Il coefficiente davanti a qualcosa: 1 sparisce, −1 lascia il meno. */
    function coefficiente(r, primo) {
      const pezzi = [];
      const neg = r.n < 0;
      if (primo) { if (neg) pezzi.push(T('−')); } else pezzi.push(T(neg ? ' − ' : ' + '));
      if (Math.abs(r.n) === 1 && r.d === 1) return pezzi;
      pezzi.push(r.d === 1 ? T(String(Math.abs(r.n))) : F(r));
      return pezzi;
    }

    /** Termine noto: si scrive anche quando vale 1. */
    function termineNoto(r) {
      if (r.n === 0) return [];
      const pezzi = [T(r.n < 0 ? ' − ' : ' + ')];
      pezzi.push(r.d === 1 ? T(String(Math.abs(r.n))) : F(r));
      return pezzi;
    }

    function formaVertice() {
      const pezzi = [T('y = '), ...coefficiente(A, true)];
      if (V.x === 0) pezzi.push(T('x²'));
      else pezzi.push(T(`(x ${V.x > 0 ? '−' : '+'} ${Math.abs(V.x)})²`));
      return pezzi.concat(termineNoto(fr(V.y)));
    }

    function formaSviluppata() {
      const h = fr(V.x);
      const b = per(fr(-2), per(A, h));
      const c = piu(per(A, per(h, h)), fr(V.y));
      const pezzi = [T('y = '), ...coefficiente(A, true), T('x²')];
      if (b.n !== 0) pezzi.push(...coefficiente(b, false), T('x'));
      return pezzi.concat(termineNoto(c));
    }

    function larghezza(pezzi) {
      let w = 0;
      for (const z of pezzi) {
        if (z.t === 'testo') w += p.textWidth(z.s);
        else w += Math.max(p.textWidth(String(z.n)), p.textWidth(String(z.d))) * 0.8 + 6;
      }
      return w;
    }

    function scriviRiga(pezzi, cy, colore) {
      let corpo = 18;
      p.textSize(corpo);
      while (corpo > 11 && larghezza(pezzi) > ctx.width - 24) {
        corpo -= 1;
        p.textSize(corpo);
      }
      let x = (ctx.width - larghezza(pezzi)) / 2;
      p.noStroke();
      p.fill(colore);
      for (const z of pezzi) {
        if (z.t === 'testo') {
          p.textSize(corpo);
          p.textAlign(p.LEFT, p.CENTER);
          p.text(z.s, x, cy);
          x += p.textWidth(z.s);
        } else {
          p.textSize(corpo * 0.8);
          const w = Math.max(p.textWidth(String(z.n)), p.textWidth(String(z.d)));
          p.textAlign(p.CENTER, p.BOTTOM);
          p.text(String(z.n), x + 3 + w / 2, cy - 1);
          p.textAlign(p.CENTER, p.TOP);
          p.text(String(z.d), x + 3 + w / 2, cy + 2);
          p.stroke(colore);
          p.strokeWeight(1.2);
          p.line(x + 2, cy + 0.5, x + w + 4, cy + 0.5);
          p.noStroke();
          p.textSize(corpo);
          x += w + 6;
        }
      }
    }

    function testa() {
      if (FORMA === 'nessuna') return;
      if (FORMA === 'vertice') scriviRiga(formaVertice(), testaH / 2, INK);
      else if (FORMA === 'sviluppata') scriviRiga(formaSviluppata(), testaH / 2, INK);
      else {
        scriviRiga(formaVertice(), testaH * 0.27, INK);
        scriviRiga(formaSviluppata(), testaH * 0.72, BLU);
      }
    }

    // -- Disegno ---------------------------------------------------------------

    function grigliaEAssi() {
      p.strokeWeight(1);
      p.stroke(LINE);
      for (let gx = Math.ceil(XMIN); gx <= XMAX; gx++) p.line(X(gx), Y(YMIN), X(gx), Y(YMAX));
      for (let gy = Math.ceil(YMIN); gy <= YMAX; gy++) p.line(X(XMIN), Y(gy), X(XMAX), Y(gy));

      p.stroke(INKSOFT);
      p.strokeWeight(1.5);
      if (YMIN <= 0 && YMAX >= 0) p.line(X(XMIN), Y(0), X(XMAX), Y(0));
      if (XMIN <= 0 && XMAX >= 0) p.line(X(0), Y(YMIN), X(0), Y(YMAX));

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

    function tratteggio(x1, y1, x2, y2) {
      const lung = p.dist(x1, y1, x2, y2);
      const passo = 6;
      for (let t = 0; t < lung; t += passo * 2) {
        const t1 = t / lung;
        const t2 = Math.min(1, (t + passo) / lung);
        p.line(p.lerp(x1, x2, t1), p.lerp(y1, y2, t1), p.lerp(x1, x2, t2), p.lerp(y1, y2, t2));
      }
    }

    /** La curva, ritagliata sul piano: fuori dalla finestra non si disegna. */
    function curva(h, k, colore, spessore) {
      p.noFill();
      p.stroke(colore);
      p.strokeWeight(spessore);
      p.beginShape();
      let dentro = false;
      for (let px = X(XMIN); px <= X(XMAX); px += 2) {
        const gy = curvaY(gX(px), h, k);
        if (gy < YMIN || gy > YMAX) {
          if (dentro) { p.endShape(); p.beginShape(); dentro = false; }
          continue;
        }
        p.vertex(px, Y(gy));
        dentro = true;
      }
      p.endShape();
    }

    /** La freccia della traslazione, dall'origine al vertice. */
    function freccia() {
      if (V.x === 0 && V.y === 0) return;
      const x1 = X(0), y1 = Y(0), x2 = X(V.x), y2 = Y(V.y);
      const ang = Math.atan2(y2 - y1, x2 - x1);
      const lung = p.dist(x1, y1, x2, y2);
      if (lung < 18) return;
      // La punta si ferma prima del pallino del vertice.
      const ex = x2 - Math.cos(ang) * 9;
      const ey = y2 - Math.sin(ang) * 9;
      p.stroke(INKSOFT);
      p.strokeWeight(2);
      tratteggio(x1, y1, ex, ey);
      p.noStroke();
      p.fill(INKSOFT);
      p.push();
      p.translate(ex, ey);
      p.rotate(ang);
      p.triangle(0, 0, -10, -5, -10, 5);
      p.pop();
    }

    function fuocoEDirettrice() {
      const fy = V.y + PF;
      const dy = V.y - PF;
      if (dy >= YMIN && dy <= YMAX) {
        p.stroke(BLU);
        p.strokeWeight(2.5);
        p.line(X(XMIN), Y(dy), X(XMAX), Y(dy));
        p.noStroke();
        p.fill(BLU);
        p.textSize(13);
        p.textAlign(p.LEFT, PF > 0 ? p.TOP : p.BOTTOM);
        p.text('d', X(XMIN) + 4, Y(dy) + (PF > 0 ? 4 : -4));
      }
      if (fy >= YMIN && fy <= YMAX) {
        p.noStroke();
        p.fill(BLU);
        p.circle(X(V.x), Y(fy), 10);
        p.textSize(13);
        p.textAlign(p.LEFT, p.CENTER);
        p.text('F', X(V.x) + 9, Y(fy));
      }
    }

    function asse() {
      p.stroke(INKSOFT);
      p.strokeWeight(1.5);
      tratteggio(X(V.x), Y(YMIN), X(V.x), Y(YMAX));
    }

    function vertice() {
      p.noStroke();
      p.fill(BLOCCATO ? INK : ROSSA);
      p.circle(X(V.x), Y(V.y), preso ? 17 : 13);
      p.fill(INK);
      p.textSize(13);
      // L'etichetta sta dalla parte opposta alla concavità, fuori dalla curva.
      p.textAlign(p.LEFT, val(A) > 0 ? p.TOP : p.BOTTOM);
      p.text(`V(${fmt(V.x)}; ${fmt(V.y)})`, X(V.x) + 9, Y(V.y) + (val(A) > 0 ? 6 : -6));
    }

    function footer() {
      if (BLOCCATO) return;
      p.noStroke();
      p.fill(INKSOFT);
      p.textSize(12);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('Trascina il vertice V sulla griglia.', ctx.width / 2, footerY + 15);
    }

    p.setup = () => {
      p.createCanvas(ctx.width, ctx.height);
      p.textFont('IBM Plex Mono');
      readTokens();
      layout();
      // Alla riapertura il vertice torna dove l'aveva lasciato lo studente.
      const m = ctx.model;
      if (!BLOCCATO && Number.isFinite(m.h) && Number.isFinite(m.k)
          && m.h >= XMIN && m.h <= XMAX && m.k >= YMIN && m.k <= YMAX) {
        V.x = m.h;
        V.y = m.k;
      }
      pubblica();
    };

    p.draw = () => {
      layout();
      p.background(CARTA);
      grigliaEAssi();
      if (MOSTRA_TRACCIA) {
        // La parabola di partenza, grigia e trasparente: è il ricordo, non la protagonista.
        const ombra = p.color(INKSOFT);
        ombra.setAlpha(90);
        curva(0, 0, ombra, 2);
        freccia();
      }
      if (MOSTRA_ASSE) asse();
      curva(V.x, V.y, INK, 2.5);
      if (MOSTRA_FUOCO) fuocoEDirettrice();
      vertice();
      testa();
      footer();
    };

    // -- Interazione -----------------------------------------------------------

    function pStart() {
      if (BLOCCATO) return false;
      if (p.dist(p.mouseX, p.mouseY, X(V.x), Y(V.y)) > 24) return false;
      preso = true;
      return true;
    }

    function pMove() {
      if (!preso) return;
      V.x = p.constrain(Math.round(gX(p.mouseX)), Math.ceil(XMIN), Math.floor(XMAX));
      V.y = p.constrain(Math.round(gY(p.mouseY)), Math.ceil(YMIN), Math.floor(YMAX));
    }

    function pEnd() {
      if (!preso) return;
      preso = false;
      pubblica();
    }

    p.mousePressed = () => { pStart(); };
    p.mouseDragged = () => { pMove(); };
    p.mouseReleased = () => { pEnd(); };

    // Su touch lo scroll della pagina si blocca SOLO se il gesto ha preso V.
    p.touchStarted = () => !pStart();
    p.touchMoved = () => { if (!preso) return true; pMove(); return false; };
    p.touchEnded = () => { pEnd(); return true; };
  };
})();
