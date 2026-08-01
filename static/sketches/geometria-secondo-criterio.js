/**
 * Sketch p5.js riutilizzabile "geometria-secondo-criterio".
 *
 * La figura del secondo criterio dimostrato dal primo per assurdo
 * (DIMOSTRAZIONI.md §8): a sinistra il triangolo $ABC$ col punto $P$ preso su
 * $AB$, a destra il triangolo $A'B'C'$.
 *
 * ATTENZIONE, ed è il punto: questa figura NON può essere corretta. Le ipotesi
 * dicono $BC \cong B'C'$ e i due angoli adiacenti congruenti — che è appunto la
 * situazione in cui i triangoli sono congruenti. Disegnare insieme le ipotesi e
 * la supposizione «non sono congruenti» è impossibile, e lo è per il teorema
 * stesso. Il disegno è quindi costruito così: $A'B'C'$ è tracciato congruente a
 * $PBC$, cioè come lo vuole il primo criterio; l'unica ipotesi che il disegno
 * non rispetta è $A\hat{C}B \cong A'\hat{C'}B'$ — e la si VEDE non rispettata,
 * perché $P\hat{C}B$ sta dentro $A\hat{C}B$. La contraddizione non è nascosta
 * nel testo: è la figura.
 *
 * Elementi con un nome, quelli che l'autore scrive nei `{fig: …}` dei passi:
 *
 *   lati             $BC$ e $B'C'$, con la tacca di congruenza (ipotesi)
 *   angoli-b         gli angoli in $B$ e in $B'$ (ipotesi)
 *   angoli-c         gli angoli in $C$ e in $C'$ (ipotesi: quella che salta)
 *   triangoli        i due triangoli interi, $ABC$ e $A'B'C'$
 *   lati-ab          $AB$ e $A'B'$: il confronto da cui nascono i casi
 *   punto-p          $P$ e il segmento $BP$, congruente a $B'A'$
 *   triangolo-p      i triangoli $PBC$ e $A'B'C'$, congruenti per il primo criterio
 *   angolo-pcb       $P\hat{C}B$ e $A'\hat{C'}B'$
 *   confronto-angoli $P\hat{C}B$ dentro $A\hat{C}B$: l'assurdo, in due archi
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

  window.P5Sketches['geometria-secondo-criterio'] = function (p, ctx) {
    // Coordinate in uno spazio unitario con scala UNIFORME sui due assi: qui la
    // congruenza dev'essere vera anche a occhio, e i due assi scalati
    // indipendentemente la distruggerebbero.
    //
    // Costruzione: $BC$ e $B'C'$ lunghi 0.40 e orizzontali; $BA$ e $B'A'$
    // partono con lo stesso angolo; $P$ sta su $BA$ alla distanza di $B'A'$.
    // Così $PBC \cong A'B'C'$ *per costruzione del disegno* — che è esattamente
    // ciò che il primo criterio afferma nel passo `a2`.
    const REL = {
      B: { x: 0.000, y: 0.600 },
      C: { x: 0.400, y: 0.600 },
      A: { x: 0.262, y: 0.038 },
      P: { x: 0.144, y: 0.292 },
      // Il secondo triangolo sta staccato di 0.24: meno, e le lettere $C$ e
      // $B'$ si toccano sulla riga di base.
      'B\'': { x: 0.640, y: 0.600 },
      'C\'': { x: 1.040, y: 0.600 },
      'A\'': { x: 0.784, y: 0.292 },
    };

    const UX = 1.04;         // estensione dello spazio unitario
    const UY = 0.62;
    const PAD = 24;          // spazio per le lettere fuori dai vertici
    const MIN_H = 190;
    const MAX_H = 320;

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
     */
    function elementoIn(m) {
      const B = V.B, C = V.C, A = V.A, P = V.P;
      const B1 = V['B\''], C1 = V['C\''], A1 = V['A\''];

      if (Math.hypot(m.x - P.x, m.y - P.y) < 15) return 'punto-p';
      // Vicino a C (e a C'): è lì che si consuma l'assurdo, e i due archi
      // vincono sul resto.
      if (Math.hypot(m.x - C.x, m.y - C.y) < 34
        || Math.hypot(m.x - C1.x, m.y - C1.y) < 34) return 'confronto-angoli';
      if (Math.hypot(m.x - B.x, m.y - B.y) < 32
        || Math.hypot(m.x - B1.x, m.y - B1.y) < 32) return 'angoli-b';
      if (distSeg(m, B, C) < 10 || distSeg(m, B1, C1) < 10) return 'lati';
      if (distSeg(m, B, P) < 9 || distSeg(m, B1, A1) < 9) return 'punto-p';
      if (distSeg(m, P, A) < 9) return 'lati-ab';
      if (distSeg(m, C, P) < 9 || distSeg(m, C1, A1) < 9) return 'triangolo-p';
      if (dentroTriangolo(m, B, C, P) || dentroTriangolo(m, B1, C1, A1)) return 'triangolo-p';
      if (dentroTriangolo(m, A, B, C)) return 'triangoli';
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
      disegnaTriangoloP();
      disegnaLati();
      disegnaLatiAB();
      disegnaPuntoP();
      disegnaAngoli();
      disegnaVertici();
    };

    /** Figura di fondo: c'è sempre, ma arretra quando qualcosa è in evidenza. */
    function disegnaBase() {
      const B = V.B, C = V.C, A = V.A, P = V.P;
      const B1 = V['B\''], C1 = V['C\''], A1 = V['A\''];
      const acceso = ctx.evidenziato();
      p.push();
      p.noFill();
      p.stroke(acceso ? COL_GRID : COL_INK);
      p.strokeWeight(2);
      p.triangle(A.x, A.y, B.x, B.y, C.x, C.y);
      p.triangle(A1.x, A1.y, B1.x, B1.y, C1.x, C1.y);
      // La ceviana $CP$: è la costruzione, e nel fondo resta più leggera del
      // contorno perché non fa parte dei dati del problema.
      p.stroke(COL_GRID);
      p.strokeWeight(acceso ? 1 : 1.5);
      p.line(C.x, C.y, P.x, P.y);
      p.pop();
    }

    function disegnaTriangoli() {
      const s = attivo('triangoli');
      if (!s) return;
      const B = V.B, C = V.C, A = V.A;
      const B1 = V['B\''], C1 = V['C\''], A1 = V['A\''];
      riempiTriangolo(A, B, C, s);
      riempiTriangolo(A1, B1, C1, s);
    }

    function disegnaTriangoloP() {
      const s = attivo('triangolo-p');
      if (!s) return;
      const B = V.B, C = V.C, P = V.P;
      const B1 = V['B\''], C1 = V['C\''], A1 = V['A\''];
      riempiTriangolo(P, B, C, s);
      riempiTriangolo(A1, B1, C1, s);
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

    function disegnaLati() {
      const s = attivo('lati');
      if (!s) return;
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.line(V.B.x, V.B.y, V.C.x, V.C.y);
      p.line(V['B\''].x, V['B\''].y, V['C\''].x, V['C\''].y);
      p.pop();
      tacche(V.B, V.C, 1, s.col);
      tacche(V['B\''], V['C\''], 1, s.col);
    }

    /** $AB$ e $A'B'$: il confronto da cui nasce la biforcazione in due casi. */
    function disegnaLatiAB() {
      const s = attivo('lati-ab');
      if (!s) return;
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.line(V.B.x, V.B.y, V.A.x, V.A.y);
      p.line(V['B\''].x, V['B\''].y, V['A\''].x, V['A\''].y);
      p.pop();
    }

    /** $P$ e $BP \cong B'A'$: la costruzione, con due tacche perché non si
     *  confonda con la congruenza $BC \cong B'C'$, che ne porta una. */
    function disegnaPuntoP() {
      const s = attivo('punto-p');
      if (!s) return;
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.line(V.B.x, V.B.y, V.P.x, V.P.y);
      p.line(V['B\''].x, V['B\''].y, V['A\''].x, V['A\''].y);
      p.noStroke();
      p.fill(s.col);
      p.circle(V.P.x, V.P.y, 9);
      p.pop();
      tacche(V.B, V.P, 2, s.col);
      tacche(V['B\''], V['A\''], 2, s.col);
    }

    function disegnaAngoli() {
      const B = V.B, C = V.C, A = V.A, P = V.P;
      const B1 = V['B\''], C1 = V['C\''], A1 = V['A\''];

      const sb = attivo('angoli-b');
      if (sb) { arco(B, A, C, 30, sb.col); arco(B1, A1, C1, 30, sb.col); }

      const sc = attivo('angoli-c');
      if (sc) { arco(C, A, B, 34, sc.col); arco(C1, A1, B1, 34, sc.col); }

      const sp = attivo('angolo-pcb');
      if (sp) { arco(C, P, B, 26, sp.col); arco(C1, A1, B1, 26, sp.col); }

      // L'assurdo in due archi. Il TUTTO ($A\hat{C}B$) resta smorzato e la
      // PARTE ($P\hat{C}B$) prende il colore acceso: due archi dello stesso
      // colore si leggono come una cosa sola, e qui è la differenza fra i due
      // che la disuguaglianza afferma.
      const sf = attivo('confronto-angoli');
      if (sf) {
        arco(C, A, B, 40, COL_SOFT);
        arco(C, P, B, 24, sf.col);
      }
    }

    function disegnaVertici() {
      // Il centro di ciascun triangolo: le lettere si scostano dal vertice
      // andando via dal proprio centro, così non finiscono sopra ai lati.
      const cx = (V.A.x + V.B.x + V.C.x) / 3;
      const cy = (V.A.y + V.B.y + V.C.y) / 3;
      const cx1 = (V['A\''].x + V['B\''].x + V['C\''].x) / 3;
      const cy1 = (V['A\''].y + V['B\''].y + V['C\''].y) / 3;

      p.push();
      p.textSize(15);
      p.textAlign(p.CENTER, p.CENTER);
      for (const nome in V) {
        const v = V[nome];
        const primo = nome.length > 1;
        const ox = primo ? cx1 : cx, oy = primo ? cy1 : cy;
        p.noStroke();
        p.fill(COL_INK);
        p.circle(v.x, v.y, 6);
        const dx = v.x - ox, dy = v.y - oy;
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
