/**
 * Sketch p5.js riutilizzabile "punto-medio".
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
   * "punto-medio" — il punto in mezzo, e le due medie che lo fanno.
   *
   * A, B e M sul quadrettato. La cosa che lo sketch mostra e che un segmento da
   * solo non mostra sono le PROIEZIONI sui due assi: sull'asse x l'ombra di M
   * cade fra quella di A e quella di B, alla stessa distanza da entrambe; e sopra
   * l'asse y succede lo stesso, indipendentemente. Il punto medio non è una
   * formula in due pezzi: sono due volte la stessa cosa, una per asse.
   *
   * Due modi:
   *   modo=trova   M parte fuori posto e si trascina. Il commento dice solo
   *                "più vicino ad A" o "più vicino a B": mai le coordinate
   *                giuste, che sono quello che c'è da capire. Col flag `goal`
   *                lo sketch si completa quando M è al centro.
   *   modo=mostra  M è calcolato e segue A e B: serve dopo la scoperta, per
   *                far vedere che la cosa vale sempre.
   *
   * Scrive nel modello della pagina `ax ay bx by mx my` a fine trascinamento.
   *
   * Parametri (ctx.params):
   *   ax ay bx by   posizioni iniziali di A e B (default -3 1 5 5)
   *   mx my         posizione iniziale di M in modo=trova (default: un punto
   *                 sul segmento ma decentrato, così non parte già risolto)
   *   xmin xmax     finestra orizzontale (default -6 6)
   *   ymin ymax     finestra verticale (default -6 6)
   *   modo          "trova" (default) | "mostra"
   *   proiezioni    "si"|"no": le ombre sugli assi (default si)
   *   estremi       "si"|"no": A e B trascinabili (default si)
   */
  window.P5Sketches['punto-medio'] = function (p, ctx) {
    const P = ctx.params || {};

    const si = (v, def) => (v === undefined ? def : String(v) !== 'no');
    const num = (v, def) => (Number.isFinite(Number(v)) ? Number(v) : def);

    const XMIN = num(P.xmin, -6);
    const XMAX = num(P.xmax, 6);
    const YMIN = num(P.ymin, -6);
    const YMAX = num(P.ymax, 6);

    const MODO = String(P.modo || 'trova').toLowerCase();
    const TROVA = MODO === 'trova';
    const PROIEZIONI = si(P.proiezioni, true);
    const ESTREMI_MOBILI = si(P.estremi, true);

    const A = { x: num(P.ax, -3), y: num(P.ay, 1), nome: 'A' };
    const B = { x: num(P.bx, 5), y: num(P.by, 5), nome: 'B' };
    // M parte a un quarto del cammino: sul segmento (così l'errore da correggere
    // è "quanto", non "dove"), ma lontano abbastanza da non sembrare già giusto.
    const M = {
      x: num(P.mx, Math.round(A.x + (B.x - A.x) * 0.25)),
      y: num(P.my, Math.round(A.y + (B.y - A.y) * 0.25)),
      nome: 'M'
    };

    let INK, INKSOFT, CARTA, ROSSA, SPUNTA, LINE;
    let ox = 0, oy = 0, u = 20, footerY = 0;
    let dragPt = null;
    let fatto = false;

    function readTokens() {
      INK = cssVar('--ink', '#1B2A4A');
      INKSOFT = cssVar('--ink-soft', '#5A6275');
      CARTA = cssVar('--carta', '#FBFBF6');
      ROSSA = cssVar('--rossa', '#D7263D');
      SPUNTA = cssVar('--spunta', '#1F9D55');
      LINE = cssVar('--line', '#DDE2D9');
    }

    // -- Geometria del piano ---------------------------------------------------

    function layout() {
      const margine = 14;
      // La banda in fondo tiene due righe: il testo lungo va a capo invece di
      // essere tagliato (vedi piede()).
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
    const gY = (py) => (oy - py) / u;

    const centro = () => ({ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 });

    /** In modo=mostra M non è un punto: è il risultato, e si ricalcola sempre. */
    function emme() {
      return TROVA ? M : centro();
    }

    function fmt(v) {
      const r = Math.round(v * 100) / 100;
      return Number.isInteger(r) ? String(r) : String(r);
    }

    // -- Ponte col modello della pagina ---------------------------------------

    function pubblica() {
      const m = emme();
      ctx.set('ax', A.x);
      ctx.set('ay', A.y);
      ctx.set('bx', B.x);
      ctx.set('by', B.y);
      ctx.set('mx', m.x);
      ctx.set('my', m.y);
    }

    function verifica() {
      if (fatto || !TROVA) return;
      const c = centro();
      if (M.x === c.x && M.y === c.y) {
        fatto = true;
        ctx.complete();
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

    function tratteggio(x1, y1, x2, y2) {
      const lung = p.dist(x1, y1, x2, y2);
      const passo = 6;
      for (let d = 0; d < lung; d += passo * 2) {
        const t1 = d / lung;
        const t2 = Math.min(1, (d + passo) / lung);
        p.line(
          p.lerp(x1, x2, t1), p.lerp(y1, y2, t1),
          p.lerp(x1, x2, t2), p.lerp(y1, y2, t2)
        );
      }
    }

    /**
     * Le ombre sui due assi: da ogni punto scende (o va di lato) un tratteggio
     * fino all'asse, e sull'asse i due tratti A→M e M→B sono marcati con la loro
     * lunghezza. Quando M è al centro i due numeri sono uguali — su entrambi gli
     * assi, e questa è la scoperta.
     */
    function proiezioni() {
      const m = emme();
      const asseY = Y(0);
      const asseX = X(0);

      // Le ombre degli estremi restano sullo sfondo: servono da riferimento,
      // non sono il soggetto.
      p.stroke(LINE);
      p.strokeWeight(1.5);
      [A, B].forEach((pt) => {
        tratteggio(X(pt.x), Y(pt.y), X(pt.x), asseY);
        tratteggio(X(pt.x), Y(pt.y), asseX, Y(pt.y));
      });

      // Quelle di M sì. Vanno tenute distinte dalla griglia, che è disegnata
      // con lo stesso token LINE e altrimenti se le mangia: prendono il colore
      // di M, smorzato quanto basta per restare dietro al segmento AB senza
      // sparire. Sono la riga che collega il punto ai due numeri sugli assi.
      const suo = p.color(fatto ? SPUNTA : ROSSA);
      suo.setAlpha(120);
      p.stroke(suo);
      p.strokeWeight(2);
      tratteggio(X(m.x), Y(m.y), X(m.x), asseY);
      tratteggio(X(m.x), Y(m.y), asseX, Y(m.y));

      const meta = (v1, v2, verso) => {
        const q = Math.abs(v2 - v1);
        if (q === 0) return;
        p.stroke(fatto ? SPUNTA : INKSOFT);
        p.strokeWeight(3);
        if (verso === 'x') {
          p.line(X(v1), asseY, X(v2), asseY);
          p.noStroke();
          p.fill(fatto ? SPUNTA : INKSOFT);
          p.textSize(11);
          p.textAlign(p.CENTER, p.TOP);
          p.text(fmt(q), X((v1 + v2) / 2), asseY + 12);
        } else {
          p.line(asseX, Y(v1), asseX, Y(v2));
          p.noStroke();
          p.fill(fatto ? SPUNTA : INKSOFT);
          p.textSize(11);
          p.textAlign(p.LEFT, p.CENTER);
          p.text(fmt(q), asseX + 8, Y((v1 + v2) / 2));
        }
      };

      meta(A.x, m.x, 'x');
      meta(m.x, B.x, 'x');
      meta(A.y, m.y, 'y');
      meta(m.y, B.y, 'y');
    }

    function punto(pt, colore, evidenziato) {
      const px = X(pt.x);
      const py = Y(pt.y);
      p.noStroke();
      p.fill(colore);
      p.circle(px, py, evidenziato ? 15 : 11);
      p.fill(INK);
      p.textSize(14);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text(`${pt.nome}(${fmt(pt.x)}; ${fmt(pt.y)})`, px + 9, py - 6);
    }

    /**
     * La riga in fondo. Il testo non esce mai dal canvas: prima si stringe il
     * corpo, poi si va a capo. Un footer tagliato è peggio di uno piccolo —
     * mostra metà frase e non fa nemmeno capire che ne manca un pezzo.
     */
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

      // Due righe, spezzate sull'ultimo spazio che ci sta.
      const parole = testo.split(' ');
      let prima = '';
      while (parole.length && p.textWidth(prima + parole[0]) <= largo) {
        prima += parole.shift() + ' ';
      }
      p.text(prima.trim(), ctx.width / 2, footerY + 9);
      p.text(parole.join(' '), ctx.width / 2, footerY + 22);
    }

    function footer() {
      let testo = '';
      if (!TROVA) {
        testo = 'Trascina A e B: M li segue.';
      } else if (fatto) {
        testo = 'M è a metà su tutti e due gli assi.';
      } else {
        // Il commento dice da che parte sbilanciare, mai di quanto: il "quanto"
        // è l'esercizio. Si misura sul segmento, non su un asse solo.
        const dA = p.dist(M.x, M.y, A.x, A.y);
        const dB = p.dist(M.x, M.y, B.x, B.y);
        if (dA === dB) testo = 'Stessa distanza — ma sei sul segmento AB?';
        else testo = dA < dB ? 'Adesso M è più vicino ad A.' : 'Adesso M è più vicino a B.';
      }
      piede(testo, INKSOFT);
    }

    p.setup = () => {
      p.createCanvas(ctx.width, ctx.height);
      p.textFont('IBM Plex Mono');
      readTokens();
      layout();
      fatto = Boolean(ctx.completed);
      if (fatto && TROVA) {
        const c = centro();
        M.x = c.x;
        M.y = c.y;
      }
      pubblica();
    };

    p.draw = () => {
      layout();
      p.background(CARTA);
      grigliaEAssi();
      if (PROIEZIONI) proiezioni();

      p.stroke(INK);
      p.strokeWeight(2.5);
      p.line(X(A.x), Y(A.y), X(B.x), Y(B.y));

      punto(A, INKSOFT, dragPt === A);
      punto(B, INKSOFT, dragPt === B);
      const m = emme();
      punto({ ...m, nome: 'M' }, fatto ? SPUNTA : ROSSA, dragPt === M);
      footer();
    };

    // -- Interazione -----------------------------------------------------------

    function trascinabili() {
      const lista = [];
      if (TROVA && !fatto) lista.push(M);
      if (ESTREMI_MOBILI && !fatto) lista.push(A, B);
      return lista;
    }

    function pStart() {
      // M per primo: se sta sopra un estremo, è comunque lui che si vuole
      // muovere (gli estremi si spostano di rado, M di continuo).
      const preso = trascinabili().find(
        (pt) => p.dist(p.mouseX, p.mouseY, X(pt.x), Y(pt.y)) < 20
      );
      if (!preso) return false;
      dragPt = preso;
      return true;
    }

    function pMove() {
      if (!dragPt) return;
      // Mezzo quadretto: il punto medio di due interi è spesso un mezzo, e non
      // poterci arrivare renderebbe l'esercizio impossibile a caso.
      const passo = dragPt === M ? 0.5 : 1;
      const arrotonda = (v) => Math.round(v / passo) * passo;
      dragPt.x = p.constrain(arrotonda(gX(p.mouseX)), XMIN, XMAX);
      dragPt.y = p.constrain(arrotonda(gY(p.mouseY)), YMIN, YMAX);
    }

    function pEnd() {
      if (!dragPt) return;
      dragPt = null;
      pubblica();
      verifica();
    }

    p.mousePressed = () => { pStart(); };
    p.mouseDragged = () => { pMove(); };
    p.mouseReleased = () => { pEnd(); };

    p.touchStarted = () => { const preso = pStart(); return !preso; };
    p.touchMoved = () => { if (!dragPt) return true; pMove(); return false; };
    p.touchEnded = () => { pEnd(); return true; };
  };
})();
