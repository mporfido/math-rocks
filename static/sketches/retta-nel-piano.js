/**
 * Sketch p5.js riutilizzabile "retta-nel-piano".
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
   * "retta-nel-piano" — una retta sul quadrettato, in due modi.
   *
   *   modo=scalino    la retta y = mx + q, con due punti A e B che scorrono
   *                   SOLO lungo di essa (si trascinano in orizzontale, l'ordinata
   *                   la decide la retta). Fra i due lo "scalino": il tratto
   *                   orizzontale e quello verticale, con i quadretti contati.
   *                   Spostando lo scalino lungo la retta, o allungandolo, si vede
   *                   che la salita cresce insieme al passo e il loro rapporto non
   *                   cambia mai: è il coefficiente angolare, prima di chiamarlo così.
   *                   Il rapporto NON è scritto da nessuna parte — è la scoperta.
   *
   *   modo=implicita  la retta ax + by + c = 0, con a, b, c letti dal modello
   *                   della pagina (tre slider). La disegna anche quando b = 0,
   *                   cioè verticale: è il caso che un `:::graph` non sa fare,
   *                   perché disegna solo curve y = f(x). Segna dove taglia l'asse
   *                   verticale e scrive l'equazione in fondo, con i coefficienti
   *                   nulli in vista: "2x + 0y − 4 = 0" dice perché la y è sparita.
   *
   * Scrive nel modello (modo=scalino, a fine trascinamento) `dx dy`: lo
   * spostamento orizzontale e la variazione dell'ordinata da A a B, CON SEGNO.
   *
   * Parametri (ctx.params):
   *   modo          "scalino" (default) | "implicita"
   *   m q           la retta y = mx + q in modo=scalino (default 2 1)
   *   ax bx         ascisse iniziali di A e B in modo=scalino (default 0 1)
   *   nome          come scrivere la retta sul piano (default: dai coefficienti;
   *                 serve per le frazioni, "y = ½x + 1")
   *   misure        "si"|"no": i quadretti contati sullo scalino (default si)
   *   blocca        quali punti NON si trascinano: "a", "b" o "a,b" (default nessuno)
   *   a b c         coefficienti di riserva in modo=implicita, se il modello non
   *                 li ha (di norma arrivano dagli slider: serve `bind=a,b,c`)
   *   xmin xmax     finestra orizzontale (default -6 6)
   *   ymin ymax     finestra verticale (default -6 6)
   */
  window.P5Sketches['retta-nel-piano'] = function (p, ctx) {
    const P = ctx.params || {};

    const si = (v, def) => (v === undefined ? def : String(v) !== 'no');
    const num = (v, def) => (Number.isFinite(Number(v)) ? Number(v) : def);

    const XMIN = num(P.xmin, -6);
    const XMAX = num(P.xmax, 6);
    const YMIN = num(P.ymin, -6);
    const YMAX = num(P.ymax, 6);

    const IMPLICITA = String(P.modo || 'scalino').toLowerCase() === 'implicita';
    const MISURE = si(P.misure, true);
    const BLOCCA = new Set(
      String(P.blocca || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)
    );

    const M = num(P.m, 2);
    const Q = num(P.q, 1);
    const retta = (x) => M * x + Q;

    const A = { x: num(P.ax, 0), nome: 'A' };
    const B = { x: num(P.bx, 1), nome: 'B' };

    let INK, INKSOFT, CARTA, ROSSA, LINE;
    let ox = 0, oy = 0, u = 20, footerY = 0;
    let dragPt = null;

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
    const gX = (px) => (px - ox) / u;

    /** Numeri all'italiana: virgola decimale, meno tipografico. */
    function fmt(v) {
      const r = Math.round(v * 100) / 100;
      const s = String(Math.abs(r)).replace('.', ',');
      return r < 0 ? '−' + s : s;
    }

    /** Un termine "coefficiente·lettera" dentro una somma: "+ 2x", "− x", "+ 0y". */
    function termine(k, lettera, primo) {
      const segno = k < 0 ? '−' : '+';
      const ass = Math.abs(k);
      const corpo = lettera && ass === 1 ? lettera : fmt(ass) + lettera;
      if (primo) return (k < 0 ? '−' : '') + corpo;
      return ` ${segno} ${corpo}`;
    }

    function nomeEsplicita() {
      if (P.nome) return String(P.nome);
      if (M === 0) return `y = ${fmt(Q)}`;
      let s = 'y = ' + termine(M, 'x', true);
      if (Q !== 0) s += termine(Q, '', false);
      return s;
    }

    // -- Ponte col modello della pagina ---------------------------------------

    function pubblica() {
      if (IMPLICITA) return;
      ctx.set('dx', B.x - A.x);
      ctx.set('dy', retta(B.x) - retta(A.x));
    }

    function coefficienti() {
      const mod = ctx.model || {};
      const leggi = (nome) => {
        const v = Number(mod[nome]);
        return Number.isFinite(v) ? v : num(P[nome], 0);
      };
      return { a: leggi('a'), b: leggi('b'), c: leggi('c') };
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

    function tratto(x1, y1, x2, y2, colore) {
      p.stroke(colore);
      p.strokeWeight(2.5);
      p.line(X(x1), Y(y1), X(x2), Y(y2));
    }

    /** Punta di freccia in (x, y) del piano, rivolta nel verso (vx, vy). */
    function punta(x, y, vx, vy, colore) {
      const px = X(x);
      const py = Y(y);
      const ang = Math.atan2(-vy, vx);
      const l = 8;
      p.noStroke();
      p.fill(colore);
      p.triangle(
        px, py,
        px - l * Math.cos(ang - 0.45), py - l * Math.sin(ang - 0.45),
        px - l * Math.cos(ang + 0.45), py - l * Math.sin(ang + 0.45)
      );
    }

    function etichetta(testo, x, y, colore, allineaX, allineaY) {
      p.noStroke();
      p.fill(colore);
      p.textSize(13);
      p.textAlign(allineaX, allineaY);
      p.text(testo, x, y);
    }

    function punto(x, y, nome, colore, grande) {
      p.noStroke();
      p.fill(colore);
      p.circle(X(x), Y(y), grande ? 15 : 11);
      if (!nome) return;
      etichetta(`${nome}(${fmt(x)}; ${fmt(y)})`, X(x) + 9, Y(y) - 6, INK, p.LEFT, p.BOTTOM);
    }

    /**
     * Lo scalino da A a B: prima il passo orizzontale (inchiostro), poi la
     * salita (penna rossa). Le frecce dicono il verso — a sinistra, in giù —
     * e i numeri contano i quadretti, senza segno: il segno lo dice la freccia,
     * e la frase in fondo lo dice a parole.
     */
    function scalino() {
      const ya = retta(A.x);
      const yb = retta(B.x);
      const dx = B.x - A.x;
      const dy = yb - ya;
      if (dx === 0) return;

      p.drawingContext.setLineDash([6, 5]);
      tratto(A.x, ya, B.x, ya, INK);
      if (dy !== 0) tratto(B.x, ya, B.x, yb, ROSSA);
      p.drawingContext.setLineDash([]);
      punta(B.x, ya, Math.sign(dx), 0, INK);
      if (dy !== 0) punta(B.x, yb, 0, Math.sign(dy), ROSSA);

      if (!MISURE) return;
      // Il numero del passo sta dalla parte opposta alla salita, così i due
      // tratti non si contendono lo stesso angolo.
      const sotto = dy >= 0;
      etichetta(
        fmt(Math.abs(dx)), X((A.x + B.x) / 2), Y(ya) + (sotto ? 6 : -6), INK,
        p.CENTER, sotto ? p.TOP : p.BOTTOM
      );
      if (dy !== 0) {
        const aDestra = dx > 0;
        etichetta(
          fmt(Math.abs(dy)), X(B.x) + (aDestra ? 7 : -7), Y((ya + yb) / 2), ROSSA,
          aDestra ? p.LEFT : p.RIGHT, p.CENTER
        );
      }
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

    function disegnaScalino() {
      dentroIlPiano(() => {
        p.stroke(INK);
        p.strokeWeight(2.5);
        p.line(X(XMIN), Y(retta(XMIN)), X(XMAX), Y(retta(XMAX)));
        scalino();
      });

      etichetta(nomeEsplicita(), X(XMIN) + 8, Y(YMAX) + 8, INK, p.LEFT, p.TOP);

      punto(A.x, retta(A.x), 'A', INKSOFT, dragPt === A);
      punto(B.x, retta(B.x), 'B', INKSOFT, dragPt === B);

      const dx = B.x - A.x;
      const dy = retta(B.x) - retta(A.x);
      let testo;
      if (dx === 0) {
        testo = 'A e B sono nello stesso punto. Allontanali lungo la retta.';
      } else if (!MISURE) {
        testo = 'Conta i quadretti dello scalino. Prima in orizzontale, poi in verticale.';
      } else {
        const passo = `${fmt(Math.abs(dx))} a ${dx > 0 ? 'destra' : 'sinistra'}`;
        const salita = dy === 0
          ? 'resti alla stessa altezza'
          : `${dy > 0 ? 'sali' : 'scendi'} di ${fmt(Math.abs(dy))}`;
        testo = `Da A a B vai ${passo} e ${salita}.`;
      }
      piede(testo, INKSOFT);
    }

    function disegnaImplicita() {
      const { a, b, c } = coefficienti();
      const equazione = termine(a, 'x', true) + termine(b, 'y', false) +
        (c !== 0 ? termine(c, '', false) : '') + ' = 0';

      if (a === 0 && b === 0) {
        piede(`${equazione}. Se a e b sono tutti e due zero, non c'è nessuna retta.`, ROSSA);
        return;
      }

      dentroIlPiano(() => {
        p.stroke(ROSSA);
        p.strokeWeight(3);
        if (b !== 0) {
          const y = (x) => (-a * x - c) / b;
          p.line(X(XMIN), Y(y(XMIN)), X(XMAX), Y(y(XMAX)));
        } else {
          const x0 = -c / a;
          p.line(X(x0), Y(YMIN), X(x0), Y(YMAX));
        }
      });

      // Dove taglia l'asse verticale: il socio con ascissa 0, se c'è.
      if (b !== 0) {
        const q = -c / b;
        if (q >= YMIN && q <= YMAX) punto(0, q, ' ', INK, false);
      }

      piede(equazione, INK);
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
      if (IMPLICITA) disegnaImplicita();
      else disegnaScalino();
    };

    // -- Interazione (solo modo=scalino) ---------------------------------------

    /** Le ascisse intere a cui il punto resta dentro la finestra. */
    function ascissaAmmessa(x) {
      let lo = Math.ceil(XMIN);
      let hi = Math.floor(XMAX);
      if (M !== 0) {
        const x1 = (YMIN - Q) / M;
        const x2 = (YMAX - Q) / M;
        lo = Math.max(lo, Math.ceil(Math.min(x1, x2)));
        hi = Math.min(hi, Math.floor(Math.max(x1, x2)));
      }
      return p.constrain(Math.round(x), lo, hi);
    }

    function trascinabili() {
      if (IMPLICITA) return [];
      const lista = [];
      if (!BLOCCA.has('b')) lista.push(B);
      if (!BLOCCA.has('a')) lista.push(A);
      return lista;
    }

    function pStart() {
      const preso = trascinabili().find(
        (pt) => p.dist(p.mouseX, p.mouseY, X(pt.x), Y(retta(pt.x))) < 20
      );
      if (!preso) return false;
      dragPt = preso;
      return true;
    }

    function pMove() {
      if (!dragPt) return;
      dragPt.x = ascissaAmmessa(gX(p.mouseX));
    }

    function pEnd() {
      if (!dragPt) return;
      dragPt = null;
      pubblica();
    }

    p.mousePressed = () => { pStart(); };
    p.mouseDragged = () => { pMove(); };
    p.mouseReleased = () => { pEnd(); };

    p.touchStarted = () => { const preso = pStart(); return !preso; };
    p.touchMoved = () => { if (!dragPt) return true; pMove(); return false; };
    p.touchEnded = () => { pEnd(); return true; };
  };
})();
