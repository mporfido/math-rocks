/**
 * Sketch p5.js riutilizzabile "parabola-luogo".
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
   * "parabola-luogo" — un punto F, una retta orizzontale d e un punto P, con i
   * due tratti che misurano la distanza di P da F e da d.
   *
   *   modo=cerca   P si trascina e scatta sui nodi della griglia. Quando le due
   *                distanze sono uguali i tratti diventano verdi e il punto resta
   *                segnato sul piano. Col flag `goal` lo step si completa quando
   *                i punti segnati sono `n`. La curva NON c'è: è la scoperta.
   *
   *   modo=scorri  P scorre lungo la parabola (si trascina in orizzontale,
   *                l'ordinata la decide la curva). Le due distanze restano uguali
   *                in ogni posizione: è la definizione vista all'opera.
   *
   * La parabola è l'insieme dei punti con PF = Pd, cioè
   *   y = ((x − fx)² + fy² − d²) / (2 (fy − d)),
   * che vale anche quando il fuoco sta sotto la direttrice (parabola rivolta in
   * basso). Il fuoco non deve stare sulla direttrice.
   *
   * Scrive nel modello, a fine trascinamento, `px py`: le coordinate di P.
   *
   * Parametri (ctx.params):
   *   modo          "cerca" (default) | "scorri"
   *   fx fy         il fuoco (default 0 2)
   *   d             l'ordinata della direttrice y = d (default 0)
   *   px py         posizione iniziale di P (default 1 4; in modo=scorri conta
   *                 solo px)
   *   nomi          "faro" → i due oggetti si chiamano faro e costa;
   *                 "fuoco" (default) → F e d
   *   misure        "si"|"no": le due lunghezze scritte accanto ai tratti
   *                 (default si). Con "no" le misure le calcola lo studente
   *   curva         "si"|"no": la parabola disegnata (default: si in modo=scorri,
   *                 no in modo=cerca)
   *   vertice       "si"|"no": il vertice V e l'asse di simmetria (default no)
   *   blocca        "si": P non si trascina (default no). Serve quando il testo
   *                 fa domande su QUEL punto
   *   n             in modo=cerca col flag `goal`, quanti punti trovare (default 5)
   *   xmin xmax     finestra orizzontale (default -6 6)
   *   ymin ymax     finestra verticale (default -1 7)
   */
  window.P5Sketches['parabola-luogo'] = function (p, ctx) {
    const P = ctx.params || {};

    const si = (v, def) => (v === undefined ? def : String(v) !== 'no');
    const num = (v, def) => (Number.isFinite(Number(v)) ? Number(v) : def);

    const MODO = P.modo === 'scorri' ? 'scorri' : 'cerca';
    const XMIN = num(P.xmin, -6);
    const XMAX = num(P.xmax, 6);
    const YMIN = num(P.ymin, -1);
    const YMAX = num(P.ymax, 7);

    const F = { x: num(P.fx, 0), y: num(P.fy, 2) };
    const D = num(P.d, 0);
    const FARO = P.nomi === 'faro';

    const MOSTRA_MISURE = si(P.misure, true);
    const MOSTRA_CURVA = si(P.curva, MODO === 'scorri');
    const MOSTRA_VERTICE = si(P.vertice, false);
    const BLOCCATO = P.blocca !== undefined && String(P.blocca) !== 'no';
    const N = Math.max(1, Math.round(num(P.n, 5)));

    // L'ordinata della parabola in x: la definizione PF = Pd risolta per y.
    const curvaY = (x) => ((x - F.x) ** 2 + F.y ** 2 - D ** 2) / (2 * (F.y - D));
    const V = { x: F.x, y: (F.y + D) / 2 };

    const Pt = { x: num(P.px, 1), y: num(P.py, 4) };
    if (MODO === 'scorri') Pt.y = curvaY(Pt.x);

    // Punti già trovati in modo=cerca, come chiavi "x;y".
    const trovati = new Set();

    let INK, INKSOFT, CARTA, ROSSA, BLU, SPUNTA, LINE;
    let ox = 0, oy = 0, u = 20, footerY = 0;
    let preso = false;
    let fatto = false;

    function readTokens() {
      INK = cssVar('--ink', '#1B2A4A');
      INKSOFT = cssVar('--ink-soft', '#5A6275');
      CARTA = cssVar('--carta', '#FBFBF6');
      ROSSA = cssVar('--rossa', '#D7263D');
      BLU = cssVar('--blu', '#1F6FB2');
      SPUNTA = cssVar('--spunta', '#1F9D55');
      LINE = cssVar('--line', '#DDE2D9');
    }

    // -- Geometria del piano ---------------------------------------------------

    function layout() {
      const margine = 14;
      footerY = ctx.height - 32;
      const largo = ctx.width - margine * 2;
      const alto = footerY - margine * 2;
      // Un solo `u` per i due assi: le due distanze da confrontare, una
      // obliqua e una verticale, devono essere misurate con lo stesso metro.
      u = Math.max(6, Math.min(largo / (XMAX - XMIN), alto / (YMAX - YMIN)));
      ox = (ctx.width - (XMAX + XMIN) * u) / 2;
      oy = (footerY + margine * 0.5 + (YMAX + YMIN) * u) / 2;
    }

    const X = (gx) => ox + gx * u;
    const Y = (gy) => oy - gy * u;
    const gX = (px) => (px - ox) / u;
    const gY = (py) => (oy - py) / u;

    const distF = () => Math.hypot(Pt.x - F.x, Pt.y - F.y);
    const distD = () => Math.abs(Pt.y - D);
    // Sui nodi della griglia il confronto si fa sui quadrati, che sono interi:
    // niente radici approssimate che fanno sembrare uguali due numeri diversi.
    const equidistante = () =>
      Math.abs((Pt.x - F.x) ** 2 + (Pt.y - F.y) ** 2 - (Pt.y - D) ** 2) < 1e-9;

    /** Numero corto: 5 resta 5, √5 diventa 2,24 (virgola decimale). */
    function fmt(v) {
      const arrotondato = Math.round(v * 100) / 100;
      const s = Number.isInteger(arrotondato) ? String(arrotondato) : arrotondato.toFixed(2);
      return s.replace('.', ',').replace('-', '−');
    }

    // -- Ponte col modello della pagina ---------------------------------------

    function pubblica() {
      ctx.set('px', Math.round(Pt.x * 100) / 100);
      ctx.set('py', Math.round(Pt.y * 100) / 100);
    }

    function registra() {
      if (MODO !== 'cerca' || !equidistante()) return;
      trovati.add(`${Pt.x};${Pt.y}`);
      if (!fatto && trovati.size >= N) {
        fatto = true;
        ctx.complete();
      }
    }

    /** A step già completato si mostrano tutti i punti giusti della finestra. */
    function ripristina() {
      for (let gx = Math.ceil(XMIN); gx <= XMAX; gx++) {
        const gy = curvaY(gx);
        if (Number.isInteger(gy) && gy >= YMIN && gy <= YMAX) trovati.add(`${gx};${gy}`);
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

    function direttrice() {
      p.stroke(BLU);
      p.strokeWeight(3);
      p.line(X(XMIN), Y(D), X(XMAX), Y(D));
      p.noStroke();
      p.fill(BLU);
      p.textSize(13);
      p.textAlign(p.LEFT, p.TOP);
      p.text(FARO ? 'costa' : 'd', X(XMIN) + 4, Y(D) + 4);
    }

    function fuoco() {
      p.noStroke();
      p.fill(INK);
      p.circle(X(F.x), Y(F.y), 11);
      p.textSize(13);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(FARO ? 'faro' : 'F', X(F.x) + 9, Y(F.y));
    }

    function curva() {
      p.noFill();
      p.stroke(INK);
      p.strokeWeight(2);
      p.beginShape();
      let dentro = false;
      for (let px = X(XMIN); px <= X(XMAX); px += 2) {
        const gy = curvaY(gX(px));
        if (gy < YMIN - 1 || gy > YMAX + 1) {
          if (dentro) { p.endShape(); p.beginShape(); dentro = false; }
          continue;
        }
        p.vertex(px, Y(gy));
        dentro = true;
      }
      p.endShape();
    }

    function verticeEAsse() {
      p.stroke(INKSOFT);
      p.strokeWeight(1.5);
      tratteggio(X(V.x), Y(YMIN), X(V.x), Y(YMAX));
      p.noStroke();
      p.fill(INK);
      p.circle(X(V.x), Y(V.y), 9);
      p.textSize(13);
      p.textAlign(p.RIGHT, p.CENTER);
      p.text('V', X(V.x) - 8, Y(V.y));
    }

    /** I due tratti: P→F (rosso) e P→H sulla direttrice (blu), verdi se uguali. */
    function distanze() {
      const uguali = MODO === 'scorri' || equidistante();
      const cF = uguali ? SPUNTA : ROSSA;
      const cD = uguali ? SPUNTA : BLU;

      p.strokeWeight(2.5);
      p.stroke(cF);
      p.line(X(Pt.x), Y(Pt.y), X(F.x), Y(F.y));
      p.stroke(cD);
      tratteggio(X(Pt.x), Y(Pt.y), X(Pt.x), Y(D));

      // L'angolo retto in H: la distanza da una retta si misura in perpendicolare.
      if (Math.abs(Pt.y - D) * u > 14) {
        const verso = Pt.y > D ? -1 : 1;
        const s = 8;
        p.strokeWeight(1.5);
        p.noFill();
        p.line(X(Pt.x), Y(D) + verso * s, X(Pt.x) + s, Y(D) + verso * s);
        p.line(X(Pt.x) + s, Y(D) + verso * s, X(Pt.x) + s, Y(D));
      }

      if (!MOSTRA_MISURE) return;
      p.noStroke();
      p.textSize(13);
      p.fill(cF);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.text(fmt(distF()), (X(Pt.x) + X(F.x)) / 2 - 8, (Y(Pt.y) + Y(F.y)) / 2 - 6);
      p.fill(cD);
      p.textAlign(Pt.x >= F.x ? p.LEFT : p.RIGHT, p.CENTER);
      const lato = Pt.x >= F.x ? 10 : -10;
      p.text(fmt(distD()), X(Pt.x) + lato, (Y(Pt.y) + Y(D)) / 2);
    }

    function segnati() {
      p.noStroke();
      p.fill(SPUNTA);
      trovati.forEach((k) => {
        const [gx, gy] = k.split(';').map(Number);
        p.circle(X(gx), Y(gy), 10);
      });
    }

    function puntoP() {
      p.noStroke();
      p.fill(BLOCCATO ? INKSOFT : ROSSA);
      p.circle(X(Pt.x), Y(Pt.y), preso ? 16 : 12);
      p.fill(INK);
      p.textSize(13);
      p.textAlign(p.LEFT, p.BOTTOM);
      const nome = FARO ? 'barca' : 'P';
      p.text(`${nome}(${fmt(Pt.x)}; ${fmt(Pt.y)})`, X(Pt.x) + 9, Y(Pt.y) - 6);
    }

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

    function footer() {
      let testo = '';
      if (MODO === 'cerca' && !BLOCCATO) {
        if (fatto) testo = `Fatto: hai trovato ${trovati.size} punti.`;
        else testo = `Trascina il punto sulla griglia. Punti trovati: ${trovati.size} su ${N}.`;
      } else if (MODO === 'scorri' && !BLOCCATO) {
        testo = 'Trascina il punto lungo la curva e guarda le due distanze.';
      }
      piede(testo, fatto ? SPUNTA : INKSOFT);
    }

    p.setup = () => {
      p.createCanvas(ctx.width, ctx.height);
      p.textFont('IBM Plex Mono');
      readTokens();
      layout();
      fatto = Boolean(ctx.completed);
      if (fatto && MODO === 'cerca') ripristina();
      pubblica();
    };

    p.draw = () => {
      layout();
      p.background(CARTA);
      grigliaEAssi();
      if (MOSTRA_VERTICE) verticeEAsse();
      if (MOSTRA_CURVA) curva();
      direttrice();
      segnati();
      distanze();
      fuoco();
      puntoP();
      footer();
    };

    // -- Interazione -----------------------------------------------------------

    function pStart() {
      if (BLOCCATO) return false;
      if (p.dist(p.mouseX, p.mouseY, X(Pt.x), Y(Pt.y)) > 22) return false;
      preso = true;
      return true;
    }

    function pMove() {
      if (!preso) return;
      if (MODO === 'cerca') {
        const nx = p.constrain(Math.round(gX(p.mouseX)), Math.ceil(XMIN), Math.floor(XMAX));
        const ny = p.constrain(Math.round(gY(p.mouseY)), Math.ceil(YMIN), Math.floor(YMAX));
        // Il punto non può stare sul faro: lì la "distanza dal faro" è zero.
        if (nx === F.x && ny === F.y) return;
        Pt.x = nx;
        Pt.y = ny;
      } else {
        // Passo di un decimo: le coordinate scritte restano leggibili.
        const nx = Math.round(gX(p.mouseX) * 10) / 10;
        const ny = curvaY(nx);
        if (nx < XMIN || nx > XMAX || ny < YMIN || ny > YMAX) return;
        Pt.x = nx;
        Pt.y = ny;
      }
    }

    function pEnd() {
      if (!preso) return;
      preso = false;
      pubblica();
      registra();
    }

    p.mousePressed = () => { pStart(); };
    p.mouseDragged = () => { pMove(); };
    p.mouseReleased = () => { pEnd(); };

    // Su touch lo scroll della pagina si blocca SOLO se il gesto ha preso P.
    p.touchStarted = () => !pStart();
    p.touchMoved = () => { if (!preso) return true; pMove(); return false; };
    p.touchEnded = () => { pEnd(); return true; };
  };
})();
