/**
 * Sketch p5.js riutilizzabile "geometria-angoli-supplementari".
 *
 * La figura del teorema "angoli supplementari di angoli congruenti sono
 * congruenti": due angoli piatti affiancati, ciascuno diviso in due da una
 * semiretta. A sinistra $\alpha$ e $\alpha'$, a destra $\beta$ e $\beta'$.
 *
 * Le due coppie sono disegnate su rette INCLINATE DIVERSAMENTE, di proposito:
 * l'ipotesi è che $\alpha \cong \beta$, non che le due figure siano la stessa
 * figura. Se fossero sovrapponibili a occhio il teorema sembrerebbe ovvio per
 * il motivo sbagliato.
 *
 * Elementi nominabili nei `{fig: …}` dei passi (DIMOSTRAZIONI.md §5):
 *
 *   alfa          l'angolo α (a sinistra, fra la semiretta e il lato destro)
 *   alfa-primo    il suo supplementare α'
 *   beta          l'angolo β (a destra)
 *   beta-primo    il suo supplementare β'
 *   congruenti    α e β insieme, con una tacca: è l'ipotesi
 *   piatto-1      l'angolo piatto α + α', con la retta che lo porta
 *   piatto-2      l'angolo piatto β + β'
 *   piatti        i due angoli piatti insieme: sono congruenti fra loro
 *   tesi          α' e β' insieme, con due tacche
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

  window.P5Sketches['geometria-angoli-supplementari'] = function (p, ctx) {
    const THETA = p.radians(58);     // l'ampiezza di α, e quindi di β
    const BASE_1 = p.radians(0);     // inclinazione della prima retta
    const BASE_2 = p.radians(-17);   // …e della seconda: diversa, vedi sopra

    const RATIO = 0.52;
    const MIN_H = 170;
    const MAX_H = 260;

    let COL_INK, COL_SOFT, COL_CARTA, COL_RED, COL_GRID;
    let G = [];              // le due coppie, in pixel
    let hover = null;

    /** Punto a distanza `r` dal centro `o`, all'angolo matematico `a` (y in su). */
    function polare(o, a, r) {
      return { x: o.x + r * Math.cos(a), y: o.y - r * Math.sin(a) };
    }

    function layout() {
      const W = ctx.width;
      const h = Math.max(MIN_H, Math.min(MAX_H, Math.round(W * RATIO)));
      ctx.setHeight(h);

      // Il braccio è tarato sulla metà-larghezza: le due coppie non si toccano
      // mai, qualunque sia la larghezza della colonna.
      const L = Math.min(W * 0.20, h * 0.42);
      const y = h * 0.62;
      G = [
        { O: { x: W * 0.27, y: y }, base: BASE_1, L: L, pref: '' },
        { O: { x: W * 0.73, y: y }, base: BASE_2, L: L, pref: '' },
      ];
      for (const g of G) {
        g.destra = polare(g.O, g.base, g.L);
        g.sinistra = polare(g.O, g.base + Math.PI, g.L);
        g.raggio = polare(g.O, g.base + THETA, g.L);
      }
    }

    // ---- Evidenziazione -------------------------------------------------------
    // `fuoco` è il passo selezionato, `premessa` ciò su cui si appoggia: gli
    // stessi ruoli della catena, così testo e disegno dicono la stessa cosa.
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

    /** `a` normalizzato in [0, 2π): serve per dire "il puntatore è nel settore". */
    function norm(a) {
      const due = 2 * Math.PI;
      return ((a % due) + due) % due;
    }

    /**
     * Che cosa c'è sotto il puntatore. La retta vince sui settori: è sottile, e
     * senza precedenza sarebbe irraggiungibile.
     *
     * Cliccare α o β restituisce `congruenti`, non `alfa`/`beta`: nel senso
     * inverso del ponte l'id serve a ritrovare il PASSO che ne parla, e di quei
     * due angoli parla l'ipotesi, che li nomina insieme. `alfa` e `beta` restano
     * disponibili a chi scrive i passi, ma non sono un bersaglio del click.
     */
    function elementoIn(m) {
      for (let i = 0; i < G.length; i++) {
        const g = G[i];
        const d = Math.hypot(m.x - g.O.x, m.y - g.O.y);
        if (d > g.L * 1.05) continue;
        if (distSeg(m, g.sinistra, g.destra) < 9) return i === 0 ? 'piatto-1' : 'piatto-2';
        const a = norm(Math.atan2(g.O.y - m.y, m.x - g.O.x) - g.base);
        if (a < THETA) return 'congruenti';
        if (a < Math.PI) return i === 0 ? 'alfa-primo' : 'beta-primo';
      }
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
      disegnaPiatti();
      disegnaAngoli();
      disegnaEtichette();
    };

    /** Figura di fondo: c'è sempre, ma arretra quando qualcosa è in evidenza. */
    function disegnaBase() {
      const acceso = ctx.evidenziato() || hover;
      p.push();
      p.stroke(acceso ? COL_GRID : COL_INK);
      p.strokeWeight(2);
      for (const g of G) {
        p.line(g.sinistra.x, g.sinistra.y, g.destra.x, g.destra.y);
        p.line(g.O.x, g.O.y, g.raggio.x, g.raggio.y);
      }
      p.noStroke();
      p.fill(acceso ? COL_GRID : COL_INK);
      for (const g of G) p.circle(g.O.x, g.O.y, 6);
      p.pop();
    }

    /** L'angolo piatto: la retta intera, più il semicerchio che la percorre. */
    function disegnaPiatti() {
      const stili = [
        stile('piatto-1', 'piatti'),
        stile('piatto-2', 'piatti'),
      ];
      for (let i = 0; i < G.length; i++) {
        const s = stili[i];
        if (!s) continue;
        const g = G[i];
        p.push();
        p.stroke(s.col);
        p.strokeWeight(s.peso);
        p.line(g.sinistra.x, g.sinistra.y, g.destra.x, g.destra.y);
        p.pop();
        arco(g.O, g.base, g.base + Math.PI, g.L * 0.62, s.col, 2);
      }
    }

    function disegnaAngoli() {
      const g1 = G[0], g2 = G[1];
      const rInt = 0.34, rEst = 0.46;   // frazioni del braccio: α dentro, α' fuori

      // α e β: l'ipotesi li fa nascere insieme, con una tacca a testa.
      const sA = stile('alfa', 'congruenti');
      if (sA) settore(g1, g1.base, g1.base + THETA, g1.L * rInt, sA, attivo('congruenti') ? 1 : 0);
      const sB = stile('beta', 'congruenti');
      if (sB) settore(g2, g2.base, g2.base + THETA, g2.L * rInt, sB, attivo('congruenti') ? 1 : 0);

      // α' e β': la tesi, due tacche.
      const sA1 = stile('alfa-primo', 'tesi');
      if (sA1) settore(g1, g1.base + THETA, g1.base + Math.PI, g1.L * rEst, sA1, attivo('tesi') ? 2 : 0);
      const sB1 = stile('beta-primo', 'tesi');
      if (sB1) settore(g2, g2.base + THETA, g2.base + Math.PI, g2.L * rEst, sB1, attivo('tesi') ? 2 : 0);
    }

    function disegnaEtichette() {
      const testi = [
        [G[0], G[0].base + THETA / 2, 0.52, 'α'],
        [G[0], G[0].base + (THETA + Math.PI) / 2, 0.64, 'α′'],
        [G[1], G[1].base + THETA / 2, 0.52, 'β'],
        [G[1], G[1].base + (THETA + Math.PI) / 2, 0.64, 'β′'],
      ];
      p.push();
      p.noStroke();
      p.fill(COL_INK);
      p.textSize(16);
      p.textAlign(p.CENTER, p.CENTER);
      for (const [g, a, r, t] of testi) {
        const q = polare(g.O, a, g.L * r);
        p.text(t, q.x, q.y);
      }
      p.pop();
    }

    // ---- Primitive ------------------------------------------------------------

    /** Settore pieno + arco fra due angoli matematici, con `tacche` segni sopra. */
    function settore(g, da, a, r, s, tacche) {
      const riempi = p.color(s.col);
      riempi.setAlpha(40);
      p.push();
      p.noStroke();
      p.fill(riempi);
      p.arc(g.O.x, g.O.y, 2 * r, 2 * r, -a, -da, p.PIE);
      p.pop();
      arco(g.O, da, a, r, s.col, s.peso);
      if (tacche) segniArco(g.O, (da + a) / 2, r, tacche, s.col);
    }

    /** Arco fra due angoli matematici (y in su): p5 misura gli angoli in giù. */
    function arco(o, da, a, r, col, peso) {
      p.push();
      p.noFill();
      p.stroke(col);
      p.strokeWeight(peso);
      p.arc(o.x, o.y, 2 * r, 2 * r, -a, -da);
      p.pop();
    }

    /** `n` trattini radiali sull'arco: il segno di congruenza degli angoli. */
    function segniArco(o, a, r, n, col) {
      p.push();
      p.stroke(col);
      p.strokeWeight(2);
      for (let i = 0; i < n; i++) {
        const off = (i - (n - 1) / 2) * 0.10;
        const b = a + off;
        const p1 = polare(o, b, r - 5);
        const p2 = polare(o, b, r + 5);
        p.line(p1.x, p1.y, p2.x, p2.y);
      }
      p.pop();
    }
  };
})();
