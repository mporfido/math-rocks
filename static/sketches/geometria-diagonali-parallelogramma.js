/**
 * Sketch p5.js riutilizzabile "geometria-diagonali-parallelogramma".
 *
 * La figura del teorema "in un parallelogramma le diagonali si tagliano
 * scambievolmente per metà": il parallelogramma ABCD, le due diagonali e il
 * loro punto d'incontro M.
 *
 * È una FIGURA CON ELEMENTI CHE HANNO UN NOME: non disegna e basta, risponde a
 * `el.highlight({id: ruolo})` accendendo la parte di disegno che quel passo
 * della dimostrazione nomina (DIMOSTRAZIONI.md §5). Gli id sono quelli che
 * l'autore scrive nei `{fig: …}` dei passi:
 *
 *   quadrilatero   il contorno ABCD
 *   lati-opposti   i lati AB e DC (la coppia di paralleli che si usa)
 *   diagonali      AC e BD, col punto M
 *   angoli-alterni-1  gli angoli BÂM e DĈM
 *   angoli-alterni-2  gli angoli AB̂M e CD̂M
 *   triangoli      i triangoli ABM e CDM
 *   meta           i quattro semi-diagonali AM, MC, BM, MD, con i segni di
 *                  congruenza: è la tesi
 *
 * Il ponte è nei due sensi: un click su un elemento chiama `ctx.evidenzia(id)`,
 * e chi possiede la figura seleziona il passo che ne parla.
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

  window.P5Sketches['geometria-diagonali-parallelogramma'] = function (p, ctx) {
    // Vertici in coordinate normalizzate (0..1) sul riquadro utile. ABCD in
    // ordine: A in basso a sinistra, B in basso a destra, C in alto a destra,
    // D in alto a sinistra — così AB e DC sono la coppia di lati paralleli di
    // cui parla la dimostrazione.
    const REL = {
      A: { x: 0.02, y: 0.94 },
      B: { x: 0.70, y: 0.94 },
      C: { x: 0.98, y: 0.16 },
      D: { x: 0.30, y: 0.16 },
    };

    const PAD = 26;          // spazio per le lettere fuori dai vertici
    const RATIO = 0.78;      // altezza / larghezza del riquadro
    const MIN_H = 190;
    const MAX_H = 330;

    let COL_INK, COL_SOFT, COL_CARTA, COL_RED, COL_GRID;
    let V = {};              // vertici in pixel, + M
    let hover = null;        // id dell'elemento sotto il puntatore

    function layout() {
      const W = ctx.width;
      const h = Math.max(MIN_H, Math.min(MAX_H, Math.round(W * RATIO)));
      ctx.setHeight(h);

      const bw = W - 2 * PAD;
      const bh = h - 2 * PAD;
      for (const k in REL) {
        V[k] = { x: PAD + REL[k].x * bw, y: PAD + REL[k].y * bh };
      }
      // M è il punto d'incontro delle diagonali: in un parallelogramma cade nel
      // centro, ma lo calcoliamo come intersezione — è quello che la figura
      // sta affermando, non un'ipotesi da cablare.
      V.M = intersezione(V.A, V.C, V.B, V.D);
    }

    function intersezione(a, b, c, d) {
      const r = { x: b.x - a.x, y: b.y - a.y };
      const s = { x: d.x - c.x, y: d.y - c.y };
      const den = r.x * s.y - r.y * s.x;
      if (Math.abs(den) < 1e-9) return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const t = ((c.x - a.x) * s.y - (c.y - a.y) * s.x) / den;
      return { x: a.x + t * r.x, y: a.y + t * r.y };
    }

    // ---- Evidenziazione -------------------------------------------------------
    // Il ruolo arriva da chi possiede la figura: `fuoco` è il passo selezionato,
    // `premessa` ciò su cui quel passo si appoggia. Stessi ruoli della catena:
    // il testo e il disegno dicono la stessa cosa due volte.
    function stile(id) {
      const ruolo = ctx.evidenziato(id);
      if (ruolo === 'fuoco') return { col: COL_RED, peso: 3.5 };
      if (ruolo) return { col: COL_INK, peso: 3 };
      return null;
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
     * elementi piccoli (M, i vertici) vincono sui grandi, altrimenti sarebbero
     * irraggiungibili.
     */
    function elementoIn(m) {
      const { A, B, C, D, M } = V;
      if (Math.hypot(m.x - M.x, m.y - M.y) < 16) return 'diagonali';
      if (Math.hypot(m.x - A.x, m.y - A.y) < 30
        || Math.hypot(m.x - C.x, m.y - C.y) < 30) return 'angoli-alterni-1';
      if (Math.hypot(m.x - B.x, m.y - B.y) < 30
        || Math.hypot(m.x - D.x, m.y - D.y) < 30) return 'angoli-alterni-2';
      if (distSeg(m, A, B) < 10 || distSeg(m, D, C) < 10) return 'lati-opposti';
      if (distSeg(m, B, C) < 10 || distSeg(m, A, D) < 10) return 'quadrilatero';
      if (distSeg(m, A, M) < 9 || distSeg(m, M, C) < 9
        || distSeg(m, B, M) < 9 || distSeg(m, M, D) < 9) return 'meta';
      if (dentroTriangolo(m, A, B, M) || dentroTriangolo(m, C, D, M)) return 'triangoli';
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
      disegnaQuadrilatero();
      disegnaLatiOpposti();
      disegnaDiagonali();
      disegnaTriangoli();
      disegnaAngoli();
      disegnaMeta();
      disegnaVertici();
    };

    /** Figura di fondo: c'è sempre, ma si spegne quando qualcosa è in evidenza. */
    function disegnaBase() {
      const { A, B, C, D } = V;
      const acceso = ctx.evidenziato();
      p.push();
      p.noFill();
      p.stroke(acceso ? COL_GRID : COL_INK);
      p.strokeWeight(2);
      p.quad(A.x, A.y, B.x, B.y, C.x, C.y, D.x, D.y);
      p.stroke(COL_GRID);
      p.strokeWeight(acceso ? 1 : 1.5);
      p.line(A.x, A.y, C.x, C.y);
      p.line(B.x, B.y, D.x, D.y);
      p.pop();
    }

    function disegnaQuadrilatero() {
      const s = stile('quadrilatero') || (hover === 'quadrilatero' ? sfiorato() : null);
      if (!s) return;
      const { A, B, C, D } = V;
      p.push();
      p.noFill();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.quad(A.x, A.y, B.x, B.y, C.x, C.y, D.x, D.y);
      p.pop();
    }

    function disegnaLatiOpposti() {
      const s = stile('lati-opposti') || (hover === 'lati-opposti' ? sfiorato() : null);
      if (!s) return;
      const { A, B, C, D } = V;
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.line(A.x, A.y, B.x, B.y);
      p.line(D.x, D.y, C.x, C.y);
      // Le frecce del parallelismo: una su ciascuno dei due lati.
      freccia(A, B, s.col);
      freccia(D, C, s.col);
      p.pop();
    }

    function disegnaDiagonali() {
      const s = stile('diagonali') || (hover === 'diagonali' ? sfiorato() : null);
      if (!s) return;
      const { A, B, C, D, M } = V;
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.line(A.x, A.y, C.x, C.y);
      p.line(B.x, B.y, D.x, D.y);
      p.noStroke();
      p.fill(s.col);
      p.circle(M.x, M.y, 9);
      p.pop();
    }

    function disegnaTriangoli() {
      const s = stile('triangoli') || (hover === 'triangoli' ? sfiorato() : null);
      if (!s) return;
      const { A, B, C, D, M } = V;
      const riempi = p.color(s.col);
      riempi.setAlpha(46);
      p.push();
      p.fill(riempi);
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.triangle(A.x, A.y, B.x, B.y, M.x, M.y);
      p.triangle(C.x, C.y, D.x, D.y, M.x, M.y);
      p.pop();
    }

    function disegnaAngoli() {
      const { A, B, C, D, M } = V;
      const s1 = stile('angoli-alterni-1') || (hover === 'angoli-alterni-1' ? sfiorato() : null);
      if (s1) { arco(A, B, M, 30, s1.col); arco(C, D, M, 30, s1.col); }
      const s2 = stile('angoli-alterni-2') || (hover === 'angoli-alterni-2' ? sfiorato() : null);
      if (s2) { arco(B, A, M, 34, s2.col); arco(D, C, M, 34, s2.col); }
    }

    /** La tesi: le quattro metà, coi segni di congruenza a coppie. */
    function disegnaMeta() {
      const s = stile('meta') || (hover === 'meta' ? sfiorato() : null);
      if (!s) return;
      const { A, B, C, D, M } = V;
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.line(A.x, A.y, M.x, M.y);
      p.line(M.x, M.y, C.x, C.y);
      p.line(B.x, B.y, M.x, M.y);
      p.line(M.x, M.y, D.x, D.y);
      tacche(A, M, 1, s.col);
      tacche(M, C, 1, s.col);
      tacche(B, M, 2, s.col);
      tacche(M, D, 2, s.col);
      p.pop();
    }

    function disegnaVertici() {
      const etichette = { A: V.A, B: V.B, C: V.C, D: V.D, M: V.M };
      // Il centro della figura: le lettere si scostano dal vertice andando via
      // dal centro, così non finiscono mai sopra ai lati.
      const cx = (V.A.x + V.B.x + V.C.x + V.D.x) / 4;
      const cy = (V.A.y + V.B.y + V.C.y + V.D.y) / 4;
      p.push();
      p.textSize(15);
      p.textAlign(p.CENTER, p.CENTER);
      for (const nome in etichette) {
        const v = etichette[nome];
        p.noStroke();
        p.fill(COL_INK);
        p.circle(v.x, v.y, 6);
        if (nome === 'M') {
          // M sta dentro la figura: la lettera va scostata in su, non "via dal
          // centro" (ci coincide).
          p.text('M', v.x + 13, v.y - 11);
          continue;
        }
        const dx = v.x - cx, dy = v.y - cy;
        const l = Math.hypot(dx, dy) || 1;
        p.text(nome, v.x + (dx / l) * 16, v.y + (dy / l) * 16);
      }
      p.pop();
    }

    // ---- Primitive ------------------------------------------------------------

    /** Stile del solo passaggio del mouse: dice "questo si può cliccare". */
    function sfiorato() {
      return { col: COL_SOFT, peso: 2.5 };
    }

    /** Arco dell'angolo di vertice `v` fra le semirette verso `a` e verso `b`. */
    function arco(v, a, b, r, col) {
      let a1 = Math.atan2(a.y - v.y, a.x - v.x);
      let a2 = Math.atan2(b.y - v.y, b.x - v.x);
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

    /** Freccia di parallelismo al centro del segmento. */
    function freccia(a, b, col) {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const ux = (b.x - a.x) / l, uy = (b.y - a.y) / l;
      p.push();
      p.stroke(col);
      p.strokeWeight(2);
      p.line(mx - ux * 5 - uy * 5, my - uy * 5 + ux * 5, mx + ux * 4, my + uy * 4);
      p.line(mx - ux * 5 + uy * 5, my - uy * 5 - ux * 5, mx + ux * 4, my + uy * 4);
      p.pop();
    }
  };
})();
