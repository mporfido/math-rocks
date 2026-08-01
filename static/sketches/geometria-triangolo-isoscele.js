/**
 * Sketch p5.js riutilizzabile "geometria-triangolo-isoscele".
 *
 * La figura del teorema degli angoli alla base: il triangolo isoscele $ABC$
 * sulla base $BC$, tagliato dalla bisettrice $AH$ dell'angolo al vertice.
 *
 * Qui la figura può essere corretta — al contrario di quella del secondo
 * criterio (DIMOSTRAZIONI.md §8) — e allora deve esserlo davvero: $AB$ e $AC$
 * sono disegnati congruenti, e $H$ cade dove la bisettrice incontra la base.
 * Ma proprio perché è corretta la figura ANTICIPA la tesi: gli angoli alla base
 * si vedono uguali prima che il testo lo dimostri. Per questo il fondo è muto —
 * nessuna tacca, nessun arco — e i segni di congruenza compaiono solo sul passo
 * che li afferma: è la catena a dire perché, il disegno mostra soltanto dove.
 *
 * Elementi con un nome, quelli che l'autore scrive nei `{fig: …}` dei passi:
 *
 *   triangolo     il triangolo $ABC$ con la base $BC$ marcata (ipotesi)
 *   angoli-base   gli angoli $A\hat{B}C$ e $A\hat{C}B$: la tesi
 *   bisettrice    $AH$ e il punto $H$ sulla base: la costruzione
 *   lati-obliqui  $AB$ e $AC$, con la tacca di congruenza
 *   angoli-al-vertice  i due angoli in cui $AH$ divide $B\hat{A}C$
 *   lato-comune   $AH$, il lato che i due triangoli condividono
 *   triangoli     i triangoli $ABH$ e $ACH$, congruenti per il primo criterio
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

  window.P5Sketches['geometria-triangolo-isoscele'] = function (p, ctx) {
    // Coordinate in uno spazio unitario con scala UNIFORME sui due assi: la
    // congruenza $AB \cong AC$ dev'essere vera anche a occhio, e due assi
    // scalati indipendentemente la distruggerebbero.
    //
    // Costruzione: base orizzontale lunga 0.50, vertice $A$ sulla verticale del
    // punto medio. Così $AB \cong AC$ e $H$ — piede della bisettrice — cade sul
    // punto medio *per costruzione del disegno*, che è ciò che il triangolo
    // isoscele afferma.
    const REL = {
      B: { x: 0.000, y: 0.420 },
      C: { x: 0.500, y: 0.420 },
      A: { x: 0.250, y: 0.000 },
      H: { x: 0.250, y: 0.420 },
    };

    const UX = 0.50;         // estensione dello spazio unitario
    const UY = 0.42;
    const PAD = 26;          // spazio per le lettere fuori dai vertici
    const MIN_H = 200;
    const MAX_H = 300;

    let COL_INK, COL_SOFT, COL_CARTA, COL_RED, COL_GRID;
    let V = {};
    let hover = null;

    function layout() {
      const W = ctx.width;
      const bw = W - 2 * PAD;
      let h = Math.round(bw * (UY / UX)) + 2 * PAD;
      h = Math.max(MIN_H, Math.min(MAX_H, h));
      ctx.setHeight(h);

      const bh = h - 2 * PAD;
      const s = Math.min(bw / UX, bh / UY);
      const ox = PAD + (bw - s * UX) / 2;
      const oy = PAD + (bh - s * UY) / 2;
      for (const k in REL) {
        V[k] = { x: ox + REL[k].x * s, y: oy + REL[k].y * s };
      }
    }

    // ---- Evidenziazione -------------------------------------------------------
    // Il ruolo arriva da chi possiede la figura: `fuoco` è il passo selezionato,
    // `premessa` ciò su cui quel passo si appoggia. Stessi ruoli della catena.
    function stile(id) {
      const ruolo = ctx.evidenziato(id);
      if (ruolo === 'fuoco') return { col: COL_RED, peso: 3.5 };
      if (ruolo) return { col: COL_INK, peso: 3 };
      return null;
    }

    /** Stile del solo passaggio del mouse: dice "questo si può cliccare". */
    function sfiorato() {
      return { col: COL_SOFT, peso: 2.5 };
    }

    function attivo(id) {
      return stile(id) || (hover === id ? sfiorato() : null);
    }

    // ---- Geometria per il click ----------------------------------------------
    function distSeg(m, a, b) {
      const vx = b.x - a.x, vy = b.y - a.y;
      const l2 = vx * vx + vy * vy;
      const t = l2 ? Math.max(0, Math.min(1, ((m.x - a.x) * vx + (m.y - a.y) * vy) / l2)) : 0;
      return Math.hypot(m.x - (a.x + t * vx), m.y - (a.y + t * vy));
    }

    function dentroTriangolo(m, a, b, c) {
      const seg = (q, r, s) => (q.x - s.x) * (r.y - s.y) - (r.x - s.x) * (q.y - s.y);
      const d1 = seg(m, a, b), d2 = seg(m, b, c), d3 = seg(m, c, a);
      const neg = d1 < 0 || d2 < 0 || d3 < 0;
      const pos = d1 > 0 || d2 > 0 || d3 > 0;
      return !(neg && pos);
    }

    /**
     * Che cosa c'è sotto il puntatore. L'ordine è una scala di specificità: gli
     * elementi piccoli vincono sui grandi, altrimenti sarebbero irraggiungibili.
     *
     * $AH$ porta due nomi — è la bisettrice tracciata e il lato che i due
     * triangoli hanno in comune. Il click sceglie la costruzione: è il passo che
     * quel segmento lo fa esistere, e senza il quale gli altri non stanno in
     * piedi. Dalla catena, invece, i due si accendono entrambi.
     */
    function elementoIn(m) {
      const B = V.B, C = V.C, A = V.A, H = V.H;

      if (Math.hypot(m.x - H.x, m.y - H.y) < 14) return 'bisettrice';
      if (Math.hypot(m.x - A.x, m.y - A.y) < 34) return 'angoli-al-vertice';
      if (Math.hypot(m.x - B.x, m.y - B.y) < 32
        || Math.hypot(m.x - C.x, m.y - C.y) < 32) return 'angoli-base';
      if (distSeg(m, A, H) < 9) return 'bisettrice';
      if (distSeg(m, B, C) < 10) return 'triangolo';
      if (distSeg(m, A, B) < 9 || distSeg(m, A, C) < 9) return 'lati-obliqui';
      if (dentroTriangolo(m, A, B, H) || dentroTriangolo(m, A, C, H)) return 'triangoli';
      return null;
    }

    p.mousePressed = () => {
      if (p.mouseX < 0 || p.mouseY < 0 || p.mouseX > p.width || p.mouseY > p.height) return;
      // Un click nel vuoto spegne: `null` chiede di deselezionare.
      ctx.evidenzia(elementoIn({ x: p.mouseX, y: p.mouseY }));
    };

    // ---- Disegno --------------------------------------------------------------
    p.setup = () => {
      COL_INK = cssVar('--ink', '#1B2A4A');
      COL_SOFT = cssVar('--ink-soft', '#5A6275');
      COL_CARTA = cssVar('--carta', '#FBFBF6');
      COL_RED = cssVar('--rossa', '#D7263D');
      COL_GRID = cssVar('--grid', '#D7E0EC');
      p.createCanvas(ctx.width, ctx.height);
      layout();
      p.textFont('IBM Plex Serif, serif');
    };

    p.draw = () => {
      layout();
      p.background(COL_CARTA);

      hover = elementoIn({ x: p.mouseX, y: p.mouseY });
      p.cursor(hover ? p.HAND : p.ARROW);

      disegnaBase();
      disegnaTriangoli();
      disegnaTriangolo();
      disegnaLatiObliqui();
      // La bisettrice prima del lato comune: sono lo stesso segmento $AH$, e
      // quando il passo in fuoco è $AH \cong AH$ la bisettrice gli fa da
      // premessa — chi dipinge per ultimo vince, e deve vincere il fuoco.
      disegnaBisettrice();
      disegnaLatoComune();
      disegnaAngoli();
      disegnaVertici();
    };

    /** Figura di fondo: c'è sempre, ma arretra quando qualcosa è in evidenza. */
    function disegnaBase() {
      const B = V.B, C = V.C, A = V.A, H = V.H;
      const acceso = ctx.evidenziato();
      p.push();
      p.noFill();
      p.stroke(acceso ? COL_GRID : COL_INK);
      p.strokeWeight(2);
      p.triangle(A.x, A.y, B.x, B.y, C.x, C.y);
      // La bisettrice $AH$: è la costruzione, e nel fondo resta più leggera del
      // contorno perché non fa parte dei dati del problema.
      p.stroke(COL_GRID);
      p.strokeWeight(acceso ? 1 : 1.5);
      p.line(A.x, A.y, H.x, H.y);
      p.pop();
    }

    /** L'ipotesi: il triangolo intero, con la base marcata. */
    function disegnaTriangolo() {
      const s = attivo('triangolo');
      if (!s) return;
      riempiTriangolo(V.A, V.B, V.C, s);
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso + 1);
      p.line(V.B.x, V.B.y, V.C.x, V.C.y);
      p.pop();
    }

    /** I due triangoli che il primo criterio dichiara congruenti. */
    function disegnaTriangoli() {
      const s = attivo('triangoli');
      if (!s) return;
      riempiTriangolo(V.A, V.B, V.H, s);
      riempiTriangolo(V.A, V.C, V.H, s);
    }

    function riempiTriangolo(a, b, c, s) {
      const riempi = p.color(s.col);
      riempi.setAlpha(46);
      p.push();
      p.fill(riempi);
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.triangle(a.x, a.y, b.x, b.y, c.x, c.y);
      p.pop();
    }

    /** $AB \cong AC$: la congruenza che viene dalla definizione di isoscele. */
    function disegnaLatiObliqui() {
      const s = attivo('lati-obliqui');
      if (!s) return;
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.line(V.A.x, V.A.y, V.B.x, V.B.y);
      p.line(V.A.x, V.A.y, V.C.x, V.C.y);
      p.pop();
      tacche(V.A, V.B, 1, s.col);
      tacche(V.A, V.C, 1, s.col);
    }

    /** $AH \cong AH$: il lato in comune, con due tacche perché non si confonda
     *  con la congruenza dei lati obliqui, che ne porta una. */
    function disegnaLatoComune() {
      const s = attivo('lato-comune');
      if (!s) return;
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.line(V.A.x, V.A.y, V.H.x, V.H.y);
      p.pop();
      tacche(V.A, V.H, 2, s.col);
    }

    /** La costruzione: il segmento tracciato e il punto $H$ che nasce con lui. */
    function disegnaBisettrice() {
      const s = attivo('bisettrice');
      if (!s) return;
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.line(V.A.x, V.A.y, V.H.x, V.H.y);
      p.noStroke();
      p.fill(s.col);
      p.circle(V.H.x, V.H.y, 9);
      p.pop();
    }

    function disegnaAngoli() {
      const B = V.B, C = V.C, A = V.A, H = V.H;

      const sb = attivo('angoli-base');
      if (sb) { arco(B, A, C, 30, sb.col); arco(C, A, B, 30, sb.col); }

      // I due angoli in cui $AH$ taglia quello al vertice: raggi diversi,
      // altrimenti i due archi si sovrappongono sulla bisettrice e si leggono
      // come un arco solo.
      const sv = attivo('angoli-al-vertice');
      if (sv) { arco(A, B, H, 34, sv.col); arco(A, H, C, 44, sv.col); }
    }

    function disegnaVertici() {
      // Il centro del triangolo: le lettere si scostano dal vertice andando via
      // dal centro, così non finiscono sopra ai lati. $H$ sta sulla base, e da
      // solo cadrebbe quasi sul centro: lo si spinge in giù, sotto la base.
      const cx = (V.A.x + V.B.x + V.C.x) / 3;
      const cy = (V.A.y + V.B.y + V.C.y) / 3;

      p.push();
      p.textSize(15);
      p.textAlign(p.CENTER, p.CENTER);
      for (const nome in V) {
        const v = V[nome];
        p.noStroke();
        p.fill(COL_INK);
        p.circle(v.x, v.y, 6);
        let dx = v.x - cx, dy = v.y - cy;
        if (nome === 'H') { dx = 0; dy = 1; }
        const l = Math.hypot(dx, dy) || 1;
        p.text(nome, v.x + (dx / l) * 17, v.y + (dy / l) * 15);
      }
      p.pop();
    }

    // ---- Primitive ------------------------------------------------------------

    /** Arco dell'angolo di vertice `v` fra le semirette verso `a` e verso `b`. */
    function arco(v, a, b, r, col) {
      const a1 = Math.atan2(a.y - v.y, a.x - v.x);
      const a2 = Math.atan2(b.y - v.y, b.x - v.x);
      let delta = a2 - a1;
      while (delta > Math.PI) delta -= 2 * Math.PI;
      while (delta < -Math.PI) delta += 2 * Math.PI;
      const start = delta > 0 ? a1 : a2;
      p.push();
      p.noFill();
      p.stroke(col);
      p.strokeWeight(2.5);
      p.arc(v.x, v.y, 2 * r, 2 * r, start, start + Math.abs(delta));
      p.pop();
    }

    /** `n` tacche al centro del segmento: il segno di congruenza. */
    function tacche(a, b, n, col) {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const l = Math.hypot(dx, dy) || 1;
      const ux = dx / l, uy = dy / l;
      p.push();
      p.stroke(col);
      p.strokeWeight(2);
      for (let i = 0; i < n; i++) {
        const off = (i - (n - 1) / 2) * 5;
        const cxi = mx + ux * off, cyi = my + uy * off;
        p.line(cxi - uy * 6, cyi + ux * 6, cxi + uy * 6, cyi - ux * 6);
      }
      p.pop();
    }
  };
})();
