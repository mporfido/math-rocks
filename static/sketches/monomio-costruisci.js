/**
 * Sketch p5.js riutilizzabile "monomio-costruisci".
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
   * "monomio-costruisci" — il GRADO come somma degli esponenti, resa visibile.
   *
   * Sopra: il monomio che si ricompone mentre si muovono gli slider della
   * pagina. Sotto: una torre di mattoncini, uno per ogni fattore letterale —
   * `x^3` sono tre mattoncini `x` impilati. L'altezza della torre È il grado,
   * e non c'è niente da ricordare: si conta.
   *
   * Il coefficiente sta di lato, staccato dalla torre: è la cosa che l'occhio
   * deve imparare a NON contare. Un `x^0` fa sparire la lettera dal monomio e
   * il suo mattoncino dalla torre, che è il modo più diretto di vedere perché
   * un numero da solo ha grado zero.
   *
   * Parametri (ctx.params):
   *   lettere      lettere del monomio, csv (default "x,y")
   *   esponenti    nomi delle variabili di pagina legate agli esponenti, csv
   *                nello stesso ordine delle lettere (default "a,b")
   *   coefficiente nome della variabile del coefficiente, oppure un numero
   *                fisso (default 3)
   *   grado        grado BERSAGLIO: col flag `goal` lo sketch si completa
   *                quando gli esponenti lo raggiungono
   *
   * Va usato con `bind=` che elenca le stesse variabili, altrimenti il disegno
   * non si aggiorna muovendo gli slider.
   */
  window.P5Sketches['monomio-costruisci'] = function (p, ctx) {
    const P = ctx.params || {};

    const lettere = String(P.lettere || 'x,y')
      .split(',').map((s) => s.trim()).filter(Boolean).slice(0, 4);
    const espVar = String(P.esponenti || 'a,b')
      .split(',').map((s) => s.trim()).filter(Boolean);

    // Il coefficiente è un numero fisso oppure il nome di una variabile.
    const coefRaw = P.coefficiente === undefined ? 3 : P.coefficiente;
    const coefFisso = Number.isFinite(Number(coefRaw)) ? Number(coefRaw) : null;
    const coefVar = coefFisso === null ? String(coefRaw) : null;

    const target = Number.isFinite(Number(P.grado)) ? Number(P.grado) : null;

    let INK, INKSOFT, CARTA, ROSSA, SPUNTA, LINE;

    function readTokens() {
      INK = cssVar('--ink', '#1B2A4A');
      INKSOFT = cssVar('--ink-soft', '#5A6275');
      CARTA = cssVar('--carta', '#FBFBF6');
      ROSSA = cssVar('--rossa', '#D7263D');
      SPUNTA = cssVar('--spunta', '#1F9D55');
      LINE = cssVar('--line', '#DDE2D9');
    }

    /** Esponente della lettera i-esima, letto dal modello della pagina. */
    function esp(i) {
      const nome = espVar[i];
      const v = nome === undefined ? 0 : ctx.model[nome];
      return Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0;
    }

    function coef() {
      if (coefFisso !== null) return coefFisso;
      const v = ctx.model[coefVar];
      return Number.isFinite(v) ? Math.round(v) : 1;
    }

    function grado() {
      return lettere.reduce((s, _l, i) => s + esp(i), 0);
    }

    p.setup = () => {
      p.createCanvas(ctx.width, ctx.height);
      p.textFont('IBM Plex Mono');
      readTokens();
    };

    // -- Disegno di un pezzo `lettera^esponente` -----------------------------
    // Stessa tecnica degli sketch sulle potenze: l'esponente è testo più
    // piccolo alzato di un terzo del corpo. In canvas non c'è LaTeX.

    function powerW(base, exp, sz) {
      p.textSize(sz);
      const bw = p.textWidth(String(base));
      if (exp === null) return bw;
      p.textSize(sz * 0.6);
      return bw + p.textWidth(String(exp)) + 2;
    }

    function drawPower(left, cy, base, exp, sz, col) {
      p.noStroke();
      p.fill(col);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(sz);
      const bw = p.textWidth(String(base));
      p.text(String(base), left, cy);
      if (exp !== null) {
        p.textSize(sz * 0.6);
        p.text(String(exp), left + bw + 2, cy - sz * 0.32);
      }
      return powerW(base, exp, sz);
    }

    // -- Il monomio, in alto -------------------------------------------------

    /**
     * I pezzi da scrivere. Un esponente 1 non si scrive (`x`, non `x^1`) e un
     * esponente 0 fa sparire del tutto la lettera: sono le due convenzioni che
     * lo studente deve vedere accadere, non imparare a memoria.
     */
    function pezzi() {
      const out = [];
      const c = coef();
      // Il coefficiente 1 davanti a una lettera non si scrive — a meno che di
      // lettere non ne sia rimasta nessuna, e allora il monomio È quel numero.
      const soloNumero = lettere.every((_l, i) => esp(i) === 0);
      if (c === -1 && !soloNumero) out.push({ base: '-', exp: null, coef: true });
      else if (c !== 1 || soloNumero) out.push({ base: String(c), exp: null, coef: true });

      lettere.forEach((l, i) => {
        const e = esp(i);
        if (e === 0) return;
        out.push({ base: l, exp: e === 1 ? null : e, coef: false, i });
      });
      return out;
    }

    function drawMonomio(cy, sz) {
      const parti = pezzi();
      const tot = parti.reduce((s, t) => s + powerW(t.base, t.exp, sz), 0);
      let x = ctx.width / 2 - tot / 2;
      parti.forEach((t) => {
        x += drawPower(x, cy, t.base, t.exp, sz, t.coef ? INKSOFT : INK);
      });
    }

    // -- La torre ------------------------------------------------------------

    function drawTorre(y0, hMax) {
      const g = grado();
      const nCol = lettere.length;
      const colW = Math.min(64, (ctx.width - 120) / Math.max(nCol, 1));
      const maxEsp = Math.max(1, ...lettere.map((_l, i) => esp(i)));
      const bh = Math.min(26, hMax / Math.max(maxEsp, 1));
      const x0 = ctx.width / 2 - (nCol * colW) / 2;

      lettere.forEach((l, i) => {
        const e = esp(i);
        const cx = x0 + i * colW + colW / 2;

        for (let k = 0; k < e; k++) {
          const y = y0 - (k + 1) * bh;
          p.noStroke();
          p.fill(target !== null && g === target ? SPUNTA : INK);
          p.rect(cx - colW * 0.34, y + 2, colW * 0.68, bh - 4, 4);
          p.fill(CARTA);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(Math.min(14, bh * 0.6));
          p.text(l, cx, y + bh / 2);
        }

        // La lettera sotto la colonna resta anche quando la colonna è vuota:
        // `x^0` non è "niente", è una colonna alta zero.
        p.noStroke();
        p.fill(e === 0 ? LINE : INKSOFT);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(13);
        p.text(`${l}: ${e}`, cx, y0 + 8);
      });

      // Il conto, scritto come somma: 2 + 3 = 5.
      const somma = lettere.map((_l, i) => esp(i)).join(' + ');
      p.fill(target !== null && g === target ? SPUNTA : INK);
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(16);
      p.text(`grado = ${somma} = ${g}`, ctx.width / 2, y0 + 30);
    }

    p.draw = () => {
      p.background(CARTA);
      const g = grado();

      drawMonomio(56, 44);

      // Riga di separazione: sopra la scrittura, sotto il conto.
      p.stroke(LINE);
      p.strokeWeight(1);
      p.line(30, 96, ctx.width - 30, 96);
      p.noStroke();

      // Il coefficiente sta FUORI dalla torre: è la cosa da non contare.
      if (!(coef() === 1 && g > 0)) {
        p.fill(INKSOFT);
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(12);
        p.text(`coefficiente ${coef()}\n(non conta nel grado)`, 22, 110);
      }

      const base = ctx.height - 62;
      drawTorre(base, base - 130);

      if (target !== null) {
        if (g === target) {
          p.fill(SPUNTA);
          p.textAlign(p.RIGHT, p.TOP);
          p.textSize(13);
          p.text('✓ grado ' + target, ctx.width - 22, 110);
          ctx.complete();
        } else {
          p.fill(ROSSA);
          p.textAlign(p.RIGHT, p.TOP);
          p.textSize(13);
          p.text('obiettivo: grado ' + target, ctx.width - 22, 110);
        }
      }
    };
  };
})();
