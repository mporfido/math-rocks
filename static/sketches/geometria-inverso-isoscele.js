/**
 * Sketch p5.js riutilizzabile "geometria-inverso-isoscele".
 *
 * La figura dell'inverso del teorema dell'isoscele: il triangolo $ABC$ con gli
 * angoli alla base congruenti, tagliato dalle due bisettrici $BD$ e $CE$.
 *
 * Come nella figura del teorema diretto, il disegno è corretto — e quindi
 * ANTICIPA la tesi: $AB$ e $AC$ si vedono uguali prima che il testo lo
 * dimostri. Per questo il fondo è muto (nessuna tacca, nessun arco) e i segni
 * di congruenza compaiono solo sul passo che li afferma. Qui la cosa è più
 * insidiosa che nel diretto: la simmetria della figura rende *ovvia* ogni
 * congruenza della dimostrazione, mentre la dimostrazione non può usarla —
 * è precisamente ciò che deve concludere. Il disegno dice dove, non perché.
 *
 * $D$ ed $E$ non sono messi a mano: si calcolano dal teorema della bisettrice
 * ($AD:DC = BA:BC$), così cadono dove cadrebbero davvero.
 *
 * Elementi con un nome, quelli che l'autore scrive nei `{fig: …}` dei passi:
 *
 *   angoli-base           $A\hat{B}C$ e $A\hat{C}B$: l'ipotesi
 *   lati-obliqui          $AB$ e $AC$, con la tacca di congruenza: la tesi
 *   bisettrice-b          $BD$ e il punto $D$ su $AC$: la prima costruzione
 *   bisettrice-c          $CE$ e il punto $E$ su $AB$: la seconda
 *   mezzi-angoli          $D\hat{B}C$ e $E\hat{C}B$, le metà delle due ipotesi
 *   lato-comune           $BC$, il lato che i primi due triangoli condividono
 *   triangoli-uno         $BCD$ e $CBE$: primo uso del secondo criterio
 *   bisettrici-congruenti $BD$ e $CE$, con la tacca
 *   angoli-piede          $B\hat{D}C$ e $C\hat{E}B$
 *   angoli-supplementari  $A\hat{D}B$ e $A\hat{E}C$, coi loro adiacenti
 *   triangoli-due         $ABD$ e $ACE$: secondo uso del secondo criterio
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

  window.P5Sketches['geometria-inverso-isoscele'] = function (p, ctx) {
    // Spazio unitario a scala UNIFORME sui due assi: la figura è piena di
    // congruenze, e due assi scalati indipendentemente le distruggerebbero.
    // Il triangolo è più alto di quello del teorema diretto perché $D$ ed $E$
    // devono stare larghi abbastanza da poterci mettere due archi ciascuno.
    const REL = {
      B: { x: 0.000, y: 0.480 },
      C: { x: 0.500, y: 0.480 },
      A: { x: 0.250, y: 0.000 },
    };

    const UX = 0.50;         // estensione dello spazio unitario
    const UY = 0.48;
    const PAD = 28;          // spazio per le lettere fuori dai vertici
    const MIN_H = 220;
    const MAX_H = 330;

    let COL_INK, COL_SOFT, COL_CARTA, COL_RED, COL_GRID;
    let V = {};
    let hover = null;

    function dist(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }

    /**
     * Piede della bisettrice uscente da `v` sul lato `xy`: il punto che divide
     * $XY$ nel rapporto $VX : VY$. Calcolarlo invece di posarlo a occhio è ciò
     * che rende la figura *vera*: $BD$ è una bisettrice, non un segmento che
     * ci somiglia.
     */
    function piedeBisettrice(v, x, y) {
      const t = dist(v, x) / (dist(v, x) + dist(v, y));
      return { x: x.x + (y.x - x.x) * t, y: x.y + (y.y - x.y) * t };
    }

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
      V.D = piedeBisettrice(V.B, V.A, V.C);
      V.E = piedeBisettrice(V.C, V.A, V.B);
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
     * Diversi segmenti portano due nomi — $BD$ è la bisettrice tracciata e uno
     * dei due segmenti che il primo criterio dichiara congruenti; $B$ e $C$
     * ospitano l'angolo intero e la sua metà. Il click sceglie sempre l'atto
     * che fa esistere l'oggetto: la costruzione, e l'ipotesi. Dalla catena,
     * invece, si accendono entrambi.
     */
    function elementoIn(m) {
      const { A, B, C, D, E } = V;

      if (dist(m, D) < 13 || dist(m, E) < 13) return dist(m, D) < dist(m, E)
        ? 'bisettrice-b' : 'bisettrice-c';
      if (dist(m, A) < 30) return 'lati-obliqui';
      if (dist(m, B) < 34 || dist(m, C) < 34) return 'angoli-base';
      if (distSeg(m, B, D) < 9 || distSeg(m, C, E) < 9) {
        return distSeg(m, B, D) < distSeg(m, C, E) ? 'bisettrice-b' : 'bisettrice-c';
      }
      if (distSeg(m, B, C) < 10) return 'lato-comune';
      if (distSeg(m, A, B) < 9 || distSeg(m, A, C) < 9) return 'lati-obliqui';
      // Sotto le bisettrici, verso la base, ci sono i triangoli del primo uso
      // del criterio; sopra, quelli del secondo.
      if (dentroTriangolo(m, A, D, E)) return 'triangoli-due';
      if (dentroTriangolo(m, B, C, D) || dentroTriangolo(m, C, B, E)) return 'triangoli-uno';
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

      disegnaFondo();
      disegnaTriangoliUno();
      disegnaTriangoliDue();
      disegnaLatoComune();
      disegnaLatiObliqui();
      // Le bisettrici dopo i triangoli e prima delle loro congruenze: sono gli
      // stessi due segmenti, e quando il fuoco è su $BD \cong CE$ la
      // costruzione gli fa da premessa — chi dipinge per ultimo vince, e a
      // vincere dev'essere il fuoco.
      disegnaBisettrici();
      disegnaBisettriciCongruenti();
      disegnaAngoli();
      disegnaVertici();
    };

    /** Figura di fondo: c'è sempre, ma arretra quando qualcosa è in evidenza. */
    function disegnaFondo() {
      const { A, B, C, D, E } = V;
      const acceso = ctx.evidenziato();
      p.push();
      p.noFill();
      p.stroke(acceso ? COL_GRID : COL_INK);
      p.strokeWeight(2);
      p.triangle(A.x, A.y, B.x, B.y, C.x, C.y);
      // Le due bisettrici: sono costruzioni, e nel fondo restano più leggere
      // del contorno perché non fanno parte dei dati del problema.
      p.stroke(COL_GRID);
      p.strokeWeight(acceso ? 1 : 1.5);
      p.line(B.x, B.y, D.x, D.y);
      p.line(C.x, C.y, E.x, E.y);
      p.pop();
    }

    /** Primo uso del secondo criterio: $BCD$ e $CBE$, appoggiati alla base. */
    function disegnaTriangoliUno() {
      const s = attivo('triangoli-uno');
      if (!s) return;
      riempiTriangolo(V.B, V.C, V.D, s);
      riempiTriangolo(V.C, V.B, V.E, s);
    }

    /** Secondo uso: $ABD$ e $ACE$, che condividono il vertice $A$. */
    function disegnaTriangoliDue() {
      const s = attivo('triangoli-due');
      if (!s) return;
      riempiTriangolo(V.A, V.B, V.D, s);
      riempiTriangolo(V.A, V.C, V.E, s);
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

    /** La tesi: $AB \cong AC$, con la tacca di congruenza. */
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

    /** $BC \cong CB$: il lato in comune ai primi due triangoli. Due tacche,
     *  perché non si confonda con le altre congruenze della figura. */
    function disegnaLatoComune() {
      const s = attivo('lato-comune');
      if (!s) return;
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.line(V.B.x, V.B.y, V.C.x, V.C.y);
      p.pop();
      tacche(V.B, V.C, 2, s.col);
    }

    /** Le costruzioni: i due segmenti tracciati e i punti che nascono con loro. */
    function disegnaBisettrici() {
      disegnaBisettrice('bisettrice-b', V.B, V.D);
      disegnaBisettrice('bisettrice-c', V.C, V.E);
    }

    function disegnaBisettrice(id, v, piede) {
      const s = attivo(id);
      if (!s) return;
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.line(v.x, v.y, piede.x, piede.y);
      p.noStroke();
      p.fill(s.col);
      p.circle(piede.x, piede.y, 9);
      p.pop();
    }

    /** $BD \cong CE$: quello che il primo uso del criterio porta a casa. */
    function disegnaBisettriciCongruenti() {
      const s = attivo('bisettrici-congruenti');
      if (!s) return;
      p.push();
      p.stroke(s.col);
      p.strokeWeight(s.peso);
      p.line(V.B.x, V.B.y, V.D.x, V.D.y);
      p.line(V.C.x, V.C.y, V.E.x, V.E.y);
      p.pop();
      tacche(V.B, V.D, 3, s.col);
      tacche(V.C, V.E, 3, s.col);
    }

    function disegnaAngoli() {
      const { A, B, C, D, E } = V;

      // L'ipotesi: gli angoli interi in $B$ e in $C$.
      const sb = attivo('angoli-base');
      if (sb) { arco(B, A, C, 34, sb.col); arco(C, A, B, 34, sb.col); }

      // Le loro metà: raggio più corto, così l'arco della metà sta *dentro*
      // quello dell'angolo intero invece di sovrapporglisi.
      const sm = attivo('mezzi-angoli');
      if (sm) { arco(B, D, C, 24, sm.col); arco(C, E, B, 24, sm.col); }

      // Gli angoli nei piedi delle bisettrici, dalla parte della base…
      const sp = attivo('angoli-piede');
      if (sp) { arco(D, B, C, 20, sp.col); arco(E, C, B, 20, sp.col); }

      // …e i loro supplementari, dalla parte di $A$. Si disegnano entrambi:
      // il passo dice che sono supplementari di angoli congruenti, e la coppia
      // adiacente è ciò che va visto.
      const ss = attivo('angoli-supplementari');
      if (ss) {
        arco(D, B, A, 20, ss.col);
        arco(E, C, A, 20, ss.col);
        p.push();
        p.stroke(ss.col);
        p.strokeWeight(1.5);
        p.drawingContext.setLineDash([4, 4]);
        p.line(D.x, D.y, B.x, B.y);
        p.line(E.x, E.y, C.x, C.y);
        p.pop();
      }
    }

    function disegnaVertici() {
      // Le lettere si scostano dal vertice andando via dal centro, così non
      // finiscono sopra ai lati. $D$ ed $E$ stanno *su* un lato: scostarli dal
      // centro li porta esattamente fuori, che è dove servono.
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
        const dx = v.x - cx, dy = v.y - cy;
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
