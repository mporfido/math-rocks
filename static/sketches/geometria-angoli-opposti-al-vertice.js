/**
 * Sketch p5.js riutilizzabile "geometria-angoli-opposti-al-vertice".
 *
 * La figura del teorema "due angoli opposti al vertice sono congruenti": le
 * rette $r$ ed $s$ che si incontrano in $O$, e i quattro angoli che formano.
 * $\alpha$ e $\beta$ sono la coppia opposta al vertice, $\gamma$ è quello
 * adiacente a entrambi — il tramite di tutta la dimostrazione — e $\delta$ è il
 * quarto, che c'è ma non serve (ed è per questo che compare fra i distrattori).
 *
 * Elementi nominabili nei `{fig: …}` dei passi (DIMOSTRAZIONI.md §5):
 *
 *   rette              r ed s, col punto O
 *   prolungamenti      le quattro semirette, appaiate: ogni lato di α ha il suo
 *                      prolungamento fra i lati di β
 *   alfa, beta         la coppia opposta al vertice, presi uno per volta
 *   gamma, delta       i due angoli adiacenti a entrambi
 *   opposti            α e β insieme: è l'ipotesi
 *   piatto-alfa-gamma  α + γ come angolo piatto sulla retta r
 *   piatto-beta-gamma  β + γ come angolo piatto sulla retta s
 *   piatti             i due angoli piatti insieme: sono congruenti fra loro
 *   supplementari      le coppie (α,γ) e (β,γ) come settori, senza le rette
 *   tesi               α e β con le tacche di congruenza
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

  window.P5Sketches['geometria-angoli-opposti-al-vertice'] = function (p, ctx) {
    // Le quattro semirette, in angoli matematici (y in su). r è la coppia
    // 0/2, s la coppia 1/3: ciascuna semiretta è il prolungamento della sua
    // opposta, ed è esattamente ciò che il teorema usa.
    const A = [
      p.radians(12),    // r+
      p.radians(112),   // s+
      p.radians(192),   // r-
      p.radians(292),   // s-
    ];

    const RATIO = 0.80;
    const MIN_H = 210;
    const MAX_H = 320;

    let COL_INK, COL_SOFT, COL_CARTA, COL_RED, COL_GRID;
    let O = { x: 0, y: 0 };
    let L = 100;
    let P = [];              // gli estremi delle quattro semirette, in pixel
    let hover = null;

    /** Punto a distanza `r` dal centro `o`, all'angolo matematico `a` (y in su). */
    function polare(o, a, r) {
      return { x: o.x + r * Math.cos(a), y: o.y - r * Math.sin(a) };
    }

    function layout() {
      const W = ctx.width;
      const h = Math.max(MIN_H, Math.min(MAX_H, Math.round(W * RATIO)));
      ctx.setHeight(h);

      O = { x: W * 0.5, y: h * 0.5 };
      L = Math.min(W * 0.42, h * 0.42);   // spazio ai bordi per le lettere r, s
      P = A.map(a => polare(O, a, L));
    }

    // ---- Evidenziazione -------------------------------------------------------
    // `fuoco` è il passo selezionato, `premessa` ciò su cui si appoggia.
    function stile(...ids) {
      for (const id of ids) {
        const ruolo = ctx.evidenziato(id);
        if (ruolo === 'fuoco') return { col: COL_RED, peso: 3.5 };
        if (ruolo) return { col: COL_INK, peso: 3 };
      }
      for (const id of ids) if (hover === id) return sfiorato();
      return null;
    }

    function attivo(...ids) {
      return ids.some(id => !!ctx.evidenziato(id) || hover === id);
    }

    /** Stile del solo passaggio del mouse: dice "questo si può cliccare". */
    function sfiorato() {
      return { col: COL_SOFT, peso: 2.5 };
    }

    // ---- Geometria per il click ----------------------------------------------
    function distSeg(m, a, b) {
      const vx = b.x - a.x, vy = b.y - a.y;
      const l2 = vx * vx + vy * vy;
      const t = l2 ? Math.max(0, Math.min(1, ((m.x - a.x) * vx + (m.y - a.y) * vy) / l2)) : 0;
      return Math.hypot(m.x - (a.x + t * vx), m.y - (a.y + t * vy));
    }

    function norm(a) {
      const due = 2 * Math.PI;
      return ((a % due) + due) % due;
    }

    /**
     * Che cosa c'è sotto il puntatore. Le rette vincono sui settori: sono
     * sottili, e senza precedenza sarebbero irraggiungibili.
     *
     * Cliccare α o β restituisce `opposti`, non `alfa`/`beta`: nel senso inverso
     * del ponte l'id serve a ritrovare il PASSO che ne parla, e di quei due
     * angoli parla l'ipotesi, che li nomina insieme. `alfa` e `beta` restano
     * disponibili a chi scrive i passi, ma non sono un bersaglio del click.
     */
    function elementoIn(m) {
      if (Math.hypot(m.x - O.x, m.y - O.y) > L * 1.02) return null;
      if (distSeg(m, P[0], P[2]) < 9 || distSeg(m, P[1], P[3]) < 9) return 'rette';
      const a = norm(Math.atan2(O.y - m.y, m.x - O.x) - A[0]);
      if (a < norm(A[1] - A[0])) return 'opposti';
      if (a < norm(A[2] - A[0])) return 'gamma';
      if (a < norm(A[3] - A[0])) return 'opposti';
      return 'delta';
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
      disegnaRette();
      disegnaProlungamenti();
      disegnaPiatti();
      disegnaSettori();
      disegnaEtichette();
    };

    /** Figura di fondo: c'è sempre, ma arretra quando qualcosa è in evidenza. */
    function disegnaBase() {
      const acceso = ctx.evidenziato() || hover;
      p.push();
      p.stroke(acceso ? COL_GRID : COL_INK);
      p.strokeWeight(2);
      p.line(P[0].x, P[0].y, P[2].x, P[2].y);
      p.line(P[1].x, P[1].y, P[3].x, P[3].y);
      p.noStroke();
      p.fill(acceso ? COL_GRID : COL_INK);
      p.circle(O.x, O.y, 6);
      p.pop();
    }

    function disegnaRette() {
      const s = stile('rette');
      if (!s) return;
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.line(P[0].x, P[0].y, P[2].x, P[2].y);
      p.line(P[1].x, P[1].y, P[3].x, P[3].y);
      p.noStroke();
      p.fill(s.col);
      p.circle(O.x, O.y, 9);
      p.pop();
    }

    /**
     * I lati appaiati: una tacca sulle due semirette di r, due su quelle di s.
     * È il passo che dice "ogni lato di α è il prolungamento di un lato di β",
     * e senza il segno che le appaia resta una frase.
     */
    function disegnaProlungamenti() {
      const s = stile('prolungamenti');
      if (!s) return;
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      for (const q of P) p.line(O.x, O.y, q.x, q.y);
      p.pop();
      for (let i = 0; i < 4; i++) tacche(O, P[i], i % 2 ? 2 : 1, s.col);
    }

    /** L'angolo piatto: la retta che lo porta, il semicerchio, il lato comune. */
    function disegnaPiatti() {
      const casi = [
        // [id, semiretta iniziale, semiretta finale, lato in comune]
        ['piatto-alfa-gamma', 0, 2, 1],
        ['piatto-beta-gamma', 1, 3, 2],
      ];
      for (const [id, da, a, comune] of casi) {
        const s = stile(id, 'piatti');
        if (!s) continue;
        p.push();
        p.stroke(s.col);
        p.strokeWeight(s.peso);
        p.line(P[da].x, P[da].y, P[a].x, P[a].y);
        p.pop();
        arco(A[da], A[da] + Math.PI, L * 0.66, s.col, 2);
        // Il lato comune: tratteggiato, perché è quello che divide il piatto
        // nei due angoli di cui parla il passo, non un lato del piatto.
        tratteggio(O, P[comune], s.col, s.peso);
      }
    }

    function disegnaSettori() {
      // [id proprio, semiretta iniziale, semiretta finale, raggio]
      const settori = [
        ['alfa', 0, 1, 0.36],
        ['gamma', 1, 2, 0.48],
        ['beta', 2, 3, 0.36],
        ['delta', 3, 0, 0.48],
      ];
      const inTesi = attivo('tesi');
      for (const [id, da, a, r] of settori) {
        const gruppi = { alfa: ['opposti', 'tesi', 'supplementari'],
                         beta: ['opposti', 'tesi', 'supplementari'],
                         gamma: ['supplementari'],
                         delta: [] }[id];
        const s = stile(id, ...gruppi);
        if (!s) continue;
        // Le tacche solo sulla coppia della tesi: sono l'asserzione, non
        // decorazione, e su γ direbbero una cosa falsa.
        const n = (inTesi && (id === 'alfa' || id === 'beta')) ? 1 : 0;
        settore(A[da], A[a], L * r, s, n);
      }
    }

    function disegnaEtichette() {
      p.push();
      p.noStroke();
      p.fill(COL_INK);
      p.textSize(16);
      p.textAlign(p.CENTER, p.CENTER);
      // Le lettere degli angoli, al centro del proprio settore.
      const ang = [['α', 0, 1, 0.52], ['γ', 1, 2, 0.64],
                   ['β', 2, 3, 0.52], ['δ', 3, 0, 0.64]];
      for (const [t, da, a, r] of ang) {
        const meta = A[da] + norm(A[a] - A[da]) / 2;
        const q = polare(O, meta, L * r);
        p.text(t, q.x, q.y);
      }
      // I nomi delle rette, poco oltre l'estremo di una semiretta ciascuna.
      p.fill(COL_SOFT);
      p.textSize(14);
      p.text('r', polare(O, A[0], L + 14).x, polare(O, A[0], L + 14).y);
      p.text('s', polare(O, A[1], L + 14).x, polare(O, A[1], L + 14).y);
      // O sta al centro: la lettera si scosta verso il settore di δ, che è
      // l'unico di cui la dimostrazione non parla mai.
      p.fill(COL_INK);
      p.textSize(15);
      const qO = polare(O, (A[3] + A[0] + 2 * Math.PI) / 2, 16);
      p.text('O', qO.x, qO.y);
      p.pop();
    }

    // ---- Primitive ------------------------------------------------------------

    /** Settore pieno + arco fra due angoli matematici, con `n` tacche sopra. */
    function settore(da, a, r, s, n) {
      const fine = da + norm(a - da);
      const riempi = p.color(s.col);
      riempi.setAlpha(40);
      p.push();
      p.noStroke();
      p.fill(riempi);
      p.arc(O.x, O.y, 2 * r, 2 * r, -fine, -da, p.PIE);
      p.pop();
      arco(da, fine, r, s.col, s.peso);
      if (n) segniArco((da + fine) / 2, r, n, s.col);
    }

    /** Arco fra due angoli matematici (y in su): p5 misura gli angoli in giù. */
    function arco(da, a, r, col, peso) {
      p.push();
      p.noFill();
      p.stroke(col);
      p.strokeWeight(peso);
      p.arc(O.x, O.y, 2 * r, 2 * r, -a, -da);
      p.pop();
    }

    /** `n` trattini radiali sull'arco: il segno di congruenza degli angoli. */
    function segniArco(a, r, n, col) {
      p.push();
      p.stroke(col);
      p.strokeWeight(2);
      for (let i = 0; i < n; i++) {
        const b = a + (i - (n - 1) / 2) * 0.10;
        const p1 = polare(O, b, r - 5);
        const p2 = polare(O, b, r + 5);
        p.line(p1.x, p1.y, p2.x, p2.y);
      }
      p.pop();
    }

    /** `n` tacche a due terzi del segmento: qui appaiano le semirette. */
    function tacche(a, b, n, col) {
      const t = 0.72;
      const mx = a.x + (b.x - a.x) * t, my = a.y + (b.y - a.y) * t;
      const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const ux = (b.x - a.x) / l, uy = (b.y - a.y) / l;
      p.push();
      p.stroke(col);
      p.strokeWeight(2);
      for (let i = 0; i < n; i++) {
        const off = (i - (n - 1) / 2) * 5;
        const cx = mx + ux * off, cy = my + uy * off;
        p.line(cx - uy * 6, cy + ux * 6, cx + uy * 6, cy - ux * 6);
      }
      p.pop();
    }

    function tratteggio(a, b, col, peso) {
      const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const ux = (b.x - a.x) / l, uy = (b.y - a.y) / l;
      p.push();
      p.stroke(col);
      p.strokeWeight(peso);
      for (let d = 0; d < l; d += 10) {
        const e = Math.min(d + 6, l);
        p.line(a.x + ux * d, a.y + uy * d, a.x + ux * e, a.y + uy * e);
      }
      p.pop();
    }
  };
})();
