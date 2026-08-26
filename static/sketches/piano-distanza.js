/**
 * Sketch p5.js riutilizzabile "piano-distanza".
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
   * "piano-distanza" — due punti sul quadrettato, e il triangolo che li unisce.
   *
   * A e B si trascinano e scattano sui nodi della griglia. Fra loro lo sketch
   * disegna il cateto orizzontale e quello verticale, con i quadretti CONTATI
   * sopra: il numero non è una sottrazione da eseguire, è una cosa che si vede.
   * È il motivo per cui questa figura è uno sketch e non un `:::graph` —
   * JSXGraph disegna il segmento, non i quadretti.
   *
   * I cateti si accendono uno alla volta (`gambe`, `misure`, `ipotenusa`): la
   * stessa figura fa da gancio muto all'inizio della lezione e da strumento di
   * misura dopo la scoperta, senza cambiare sketch.
   *
   * Scrive nel modello della pagina — via ctx.set, solo a fine trascinamento —
   * `ax ay bx by dx dy`, con dx e dy LUNGHEZZE dei cateti (mai negative). Così
   * il testo accanto può mostrare `${dx}`, `${= sqrt(dx^2+dy^2)}` e verificare
   * con `[Verifica]{check: dx == 3 and dy == 4}`.
   *
   * Parametri (ctx.params):
   *   ax ay bx by   posizioni iniziali dei due punti (default 1 1 4 5)
   *   xmin xmax     finestra orizzontale (default -6 6)
   *   ymin ymax     finestra verticale (default -6 6)
   *   gambe         "si"|"no": i due cateti (default si)
   *   misure        "si"|"no": i quadretti contati sui cateti (default si)
   *   ipotenusa     "si"|"no": il segmento AB (default si)
   *   valore        "si"|"no": scrive la lunghezza di AB accanto al segmento
   *                 (default no — di norma è la risposta, non il dato)
   *   blocca        quali punti NON si trascinano: "a", "b" o "a,b" (default:
   *                 nessuno). Con "a,b" la figura è ferma — serve quando il
   *                 testo fa domande su QUELLA distanza: se i punti si
   *                 muovessero, le risposte diventerebbero false
   *   target        col flag `goal`, i due cateti da ottenere: "3,4". L'ordine
   *                 non conta, un 3×4 vale come un 4×3
   *
   * Non serve `bind=`: lo sketch è la sorgente dei numeri, non il loro lettore.
   */
  window.P5Sketches['piano-distanza'] = function (p, ctx) {
    const P = ctx.params || {};

    const si = (v, def) => (v === undefined ? def : String(v) !== 'no');
    const num = (v, def) => (Number.isFinite(Number(v)) ? Number(v) : def);

    const XMIN = num(P.xmin, -6);
    const XMAX = num(P.xmax, 6);
    const YMIN = num(P.ymin, -6);
    const YMAX = num(P.ymax, 6);

    const MOSTRA_GAMBE = si(P.gambe, true);
    const MOSTRA_MISURE = si(P.misure, true);
    const MOSTRA_IPOTENUSA = si(P.ipotenusa, true);
    const MOSTRA_VALORE = si(P.valore, false);

    const BLOCCA = new Set(
      String(P.blocca || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)
    );

    // Bersaglio come coppia ordinata dal più piccolo: un 3×4 e un 4×3 sono lo
    // stesso triangolo girato, e pretendere l'orientamento sarebbe pedanteria.
    const TARGET = (() => {
      if (P.target === undefined) return null;
      const parti = String(P.target).split(',').map(Number).filter(Number.isFinite);
      return parti.length === 2 ? parti.sort((a, b) => a - b) : null;
    })();

    const A = { x: num(P.ax, 1), y: num(P.ay, 1), nome: 'A', mobile: !BLOCCA.has('a') };
    const B = { x: num(P.bx, 4), y: num(P.by, 5), nome: 'B', mobile: !BLOCCA.has('b') };
    const punti = [A, B];

    let INK, INKSOFT, CARTA, ROSSA, SPUNTA, LINE;
    let ox = 0, oy = 0, u = 20, footerY = 0;
    let dragIdx = -1;
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

    /** Lato del quadretto e origine, ricalcolati a ogni resize del container. */
    function layout() {
      const margine = 14;
      // La banda in fondo tiene due righe: il testo lungo va a capo invece di
      // essere tagliato (vedi piede()).
      footerY = ctx.height - 32;
      const largo = ctx.width - margine * 2;
      const alto = footerY - margine * 2;
      // Un solo `u` per i due assi: un quadretto deve essere quadrato, o la
      // distanza "in obliquo" mentirebbe all'occhio.
      u = Math.max(6, Math.min(largo / (XMAX - XMIN), alto / (YMAX - YMIN)));
      ox = (ctx.width - (XMAX + XMIN) * u) / 2;
      oy = (footerY + margine * 0.5 + (YMAX + YMIN) * u) / 2;
    }

    const X = (gx) => ox + gx * u;
    const Y = (gy) => oy - gy * u;
    const gX = (px) => (px - ox) / u;
    const gY = (py) => (oy - py) / u;

    const dx = () => Math.abs(B.x - A.x);
    const dy = () => Math.abs(B.y - A.y);
    const dist = () => Math.hypot(dx(), dy());

    /** Numero corto: 5 resta 5, √34 diventa 5.83. */
    function fmt(v) {
      const arrotondato = Math.round(v * 100) / 100;
      return Number.isInteger(arrotondato) ? String(arrotondato) : arrotondato.toFixed(2);
    }

    // -- Ponte col modello della pagina ---------------------------------------

    function pubblica() {
      ctx.set('ax', A.x);
      ctx.set('ay', A.y);
      ctx.set('bx', B.x);
      ctx.set('by', B.y);
      ctx.set('dx', dx());
      ctx.set('dy', dy());
    }

    function verifica() {
      if (fatto || !TARGET) return;
      const attuale = [dx(), dy()].sort((a, b) => a - b);
      if (attuale[0] === TARGET[0] && attuale[1] === TARGET[1]) {
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

      // Numeri sugli assi solo se c'è spazio: sotto i 22px si sovrappongono.
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

    /** Linea tratteggiata: p5 non ne ha una, e i cateti devono restare secondari. */
    function tratteggio(x1, y1, x2, y2) {
      const lung = p.dist(x1, y1, x2, y2);
      const passo = 7;
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
     * Un cateto: il tratteggio, le tacche fra un quadretto e l'altro, il numero.
     * Le tacche sono il punto: dicono che quel numero si è ottenuto contando.
     */
    function cateto(x1, y1, x2, y2, quanti, orizzontale) {
      p.stroke(INKSOFT);
      p.strokeWeight(1.5);
      tratteggio(x1, y1, x2, y2);

      if (!MOSTRA_MISURE || quanti === 0) return;

      p.strokeWeight(1);
      for (let i = 1; i < quanti; i++) {
        const t = i / quanti;
        const tx = p.lerp(x1, x2, t);
        const ty = p.lerp(y1, y2, t);
        if (orizzontale) p.line(tx, ty - 4, tx, ty + 4);
        else p.line(tx - 4, ty, tx + 4, ty);
      }

      p.noStroke();
      p.fill(INK);
      p.textSize(13);
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      if (orizzontale) {
        p.textAlign(p.CENTER, y2 > Y(0) ? p.TOP : p.BOTTOM);
        p.text(quanti, mx, my + (y2 > Y(0) ? 8 : -8));
      } else {
        p.textAlign(p.LEFT, p.CENTER);
        p.text(quanti, mx + 8, my);
      }
    }

    function punto(pt, evidenziato) {
      const px = X(pt.x);
      const py = Y(pt.y);
      p.noStroke();
      p.fill(pt.mobile ? (fatto ? SPUNTA : ROSSA) : INKSOFT);
      p.circle(px, py, evidenziato ? 15 : 11);
      p.fill(INK);
      p.textSize(14);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text(`${pt.nome}(${pt.x}; ${pt.y})`, px + 9, py - 6);
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
      let testo;
      if (fatto) testo = 'Fatto: il triangolo è quello giusto.';
      else if (TARGET) testo = `Servono cateti di ${TARGET[0]} e ${TARGET[1]} quadretti.`;
      else if (punti.some((q) => q.mobile)) testo = 'Trascina i punti sulla griglia.';
      else testo = '';
      piede(testo, INKSOFT);
    }

    p.setup = () => {
      p.createCanvas(ctx.width, ctx.height);
      p.textFont('IBM Plex Mono');
      readTokens();
      layout();
      fatto = Boolean(ctx.completed);
      pubblica();
    };

    p.draw = () => {
      layout();
      p.background(CARTA);
      grigliaEAssi();

      if (MOSTRA_GAMBE && (dx() > 0 || dy() > 0)) {
        // L'angolo retto sta sopra A in verticale e sotto B in orizzontale:
        // il vertice è (B.x, A.y), lo stesso che serve per Pitagora.
        const vx = X(B.x);
        const vy = Y(A.y);
        cateto(X(A.x), Y(A.y), vx, vy, dx(), true);
        cateto(vx, vy, X(B.x), Y(B.y), dy(), false);
      }

      if (MOSTRA_IPOTENUSA) {
        p.stroke(fatto ? SPUNTA : ROSSA);
        p.strokeWeight(2.5);
        p.line(X(A.x), Y(A.y), X(B.x), Y(B.y));

        if (MOSTRA_VALORE && dist() > 0) {
          p.noStroke();
          p.fill(ROSSA);
          p.textSize(13);
          p.textAlign(p.CENTER, p.BOTTOM);
          p.text(fmt(dist()), (X(A.x) + X(B.x)) / 2 - 10, (Y(A.y) + Y(B.y)) / 2 - 6);
        }
      }

      punti.forEach((pt, i) => punto(pt, i === dragIdx));
      footer();
    };

    // -- Interazione -----------------------------------------------------------

    function pStart() {
      if (fatto) return false;
      const idx = punti.findIndex(
        (pt) => pt.mobile && p.dist(p.mouseX, p.mouseY, X(pt.x), Y(pt.y)) < 20
      );
      if (idx < 0) return false;
      dragIdx = idx;
      return true;
    }

    function pMove() {
      if (dragIdx < 0) return;
      const pt = punti[dragIdx];
      const nx = p.constrain(Math.round(gX(p.mouseX)), Math.ceil(XMIN), Math.floor(XMAX));
      const ny = p.constrain(Math.round(gY(p.mouseY)), Math.ceil(YMIN), Math.floor(YMAX));
      // Due punti sovrapposti non hanno un triangolo: l'ultimo passo si rifiuta.
      const altro = punti[1 - dragIdx];
      if (nx === altro.x && ny === altro.y) return;
      pt.x = nx;
      pt.y = ny;
    }

    function pEnd() {
      if (dragIdx < 0) return;
      dragIdx = -1;
      // Il modello si aggiorna a gesto finito, non a ogni frame: altrimenti
      // ogni pixel di trascinamento scriverebbe su localStorage.
      pubblica();
      verifica();
    }

    p.mousePressed = () => { pStart(); };
    p.mouseDragged = () => { pMove(); };
    p.mouseReleased = () => { pEnd(); };

    // Su touch lo scroll della pagina si blocca SOLO se il gesto ha preso
    // davvero un punto: un tocco a vuoto deve continuare a far scorrere.
    p.touchStarted = () => { const preso = pStart(); return !preso; };
    p.touchMoved = () => { if (dragIdx < 0) return true; pMove(); return false; };
    p.touchEnded = () => { pEnd(); return true; };
  };
})();
