/**
 * Sketch p5.js riutilizzabile "pattern-colonne".
 *
 * Uno sketch = un file in static/sketches/. Si registra nel registro globale
 * window.P5Sketches e viene caricato AL VOLO dal componente <x-p5> (p5.js) solo
 * nelle pagine che lo usano. La factory gira in p5 "instance mode" e riceve
 * `p` (istanza p5) e `ctx` (il ponte con la piattaforma); i parametri del
 * markdown arrivano in `ctx.params`.
 *
 * Contratto:  window.P5Sketches['<nome>'] = function (p, ctx) {...}
 */
(function () {
  window.P5Sketches = window.P5Sketches || {};

  // Legge un token CSS (--nome) dal :root, con fallback. Così i colori seguono
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
   * "pattern-colonne" — i primi passi di un pattern figurato che cresce in
   * modo lineare, disegnati affiancati.
   *
   * La figura del passo n è sempre della stessa forma: **n colonne alte
   * `altezza`, più o meno un pezzo fisso** di `fisso` elementi.
   *   - `fisso` positivo → i k elementi stanno in coda a destra, ATTACCATI alle
   *     colonne e riempiti dal basso: è "il pezzo che non cresce".
   *   - `fisso` negativo → all'ultima colonna MANCANO |k| elementi, tolti
   *     dall'alto; con `fantasmi=si` si vedono come sagome tratteggiate.
   * Totale al passo n: n × altezza + fisso  (3n+1, 5n−2, …).
   *
   * È espositivo: nessuna interazione, nessun goal. Serve a far vedere la
   * struttura prima ancora di contare.
   *
   * Parametri (ctx.params):
   *   passi      quali passi disegnare, separati da virgola (default 1,2,3,4)
   *   altezza    elementi per colonna (default 3)
   *   fisso      termine costante, anche negativo: fisso=-2 (default 0)
   *   forma      cerchio | quadrato | stella | triangolo (default cerchio)
   *   etichette  si|no — la scritta "passo N" sotto ogni figura (default si)
   *   conteggio  si|no — il totale sotto ogni figura (default no: prima si conta)
   *   evidenzia  si|no — il pezzo fisso con il colore d'accento (default no)
   *   fantasmi   si|no — con fisso negativo, mostra gli elementi mancanti (default no)
   *   variabile  nome di una variabile del modello: se c'è, `passi` è ignorato e
   *              viene disegnato UN SOLO passo, quello indicato dallo slider
   *              (nel markdown va accompagnata da bind=<nome>)
   */
  window.P5Sketches['pattern-colonne'] = function (p, ctx) {
    const P = ctx.params || {};

    // ---- Parametri (sempre difensivi: valori d'autore, non di sistema) ----
    const H = Math.max(1, Math.min(12, Math.round(Number(P.altezza) || 3)));

    // Il pezzo mancante non può svuotare l'ultima colonna: al passo 1 la figura
    // sparirebbe (e il pattern non avrebbe più senso).
    let K = Math.round(Number(P.fisso) || 0);
    if (K < 0) K = -Math.min(H - 1, -K);

    const forma = ['cerchio', 'quadrato', 'stella', 'triangolo']
      .includes(String(P.forma)) ? String(P.forma) : 'cerchio';

    function flag(v, def) {
      if (v == null || v === '') return def;
      return ['si', 'sì', 'yes', 'true', '1'].includes(String(v).toLowerCase());
    }
    const etichette = flag(P.etichette, true);
    const conteggio = flag(P.conteggio, false);
    const evidenzia = flag(P.evidenzia, false);
    const fantasmi = flag(P.fantasmi, false);

    const variabile = (P.variabile != null && P.variabile !== '')
      ? String(P.variabile) : null;

    // `passi=1,2,3,4` arriva come stringa (la coercizione a numero scatta solo
    // sui token tutti numerici, quindi `passi=5` arriva come numero: String() copre entrambi).
    const passiFissi = String(P.passi != null ? P.passi : '1,2,3,4')
      .split(',')
      .map((tok) => Math.round(Number(tok.trim())))
      .filter((v) => Number.isFinite(v) && v >= 1 && v <= 30);
    if (passiFissi.length === 0) passiFissi.push(1);

    // ---- Layout ----
    const PAD = 12;
    const GAP_FIG = 1.4;    // stacco fra due figure, in celle
    const MIN_CELL = 11;    // sotto questa soglia si va a capo invece di rimpicciolire
    const MAX_CELL = 30;
    const LABEL_H = (etichette ? 20 : 0) + (conteggio ? 18 : 0) + (etichette || conteggio ? 6 : 0);

    let cell = 20;
    let righe = [];         // [{ passi: [...], w }] — figure impaginate per riga

    // Colori (token "Quaderno", risolti in setup)
    let COL_INK, COL_INKSOFT, COL_CARTA, COL_ROSSA;

    const extraCols = K > 0 ? Math.ceil(K / H) : 0;

    // Larghezza della figura del passo n, in celle: le n colonne, più le
    // colonnine del pezzo fisso, attaccate in coda.
    function figWidth(n) {
      return n + extraCols;
    }

    function totale(n) {
      return n * H + K;
    }

    function passiCorrenti() {
      if (!variabile) return passiFissi;
      const v = Math.round(Number(ctx.model[variabile]));
      return [Math.max(1, Math.min(24, Number.isFinite(v) ? v : 1))];
    }

    // Idempotente: ricalcola celle e impaginazione a ogni frame, così resize e
    // rotazioni non hanno bisogno di un handler dedicato.
    function layout(lista) {
      const avail = Math.max(80, ctx.width - 2 * PAD);
      const widths = lista.map(figWidth);
      const totalCells = widths.reduce((a, b) => a + b, 0) + GAP_FIG * (lista.length - 1);

      cell = Math.min(MAX_CELL, avail / totalCells);
      if (cell < MIN_CELL) {
        // Tutto su una riga sarebbe illeggibile: si va a capo, e la cella si
        // ricalcola sulla figura più larga (che da sola deve starci).
        cell = Math.min(MAX_CELL, Math.max(8, avail / Math.max.apply(null, widths)));
      }

      righe = [];
      let cur = [];
      let curW = 0;
      lista.forEach((n, i) => {
        const w = widths[i] * cell;
        const add = cur.length ? GAP_FIG * cell + w : w;
        if (cur.length && curW + add > avail) {
          righe.push({ passi: cur, w: curW });
          cur = [n];
          curW = w;
        } else {
          cur.push(n);
          curW += add;
        }
      });
      if (cur.length) righe.push({ passi: cur, w: curW });

      const rowH = H * cell + LABEL_H;
      const totH = PAD + righe.length * rowH + (righe.length - 1) * (cell * 0.8) + PAD;
      ctx.setHeight(Math.max(80, Math.round(totH)));
    }

    // ---- Disegno ----
    function disegnaForma(cx, cy, r) {
      if (forma === 'quadrato') {
        p.rect(cx - r, cy - r, 2 * r, 2 * r, r * 0.28);
      } else if (forma === 'triangolo') {
        p.triangle(cx, cy - r, cx + r * 0.92, cy + r * 0.75, cx - r * 0.92, cy + r * 0.75);
      } else if (forma === 'stella') {
        p.beginShape();
        for (let i = 0; i < 10; i++) {
          const raggio = i % 2 === 0 ? r : r * 0.46;
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          p.vertex(cx + Math.cos(a) * raggio, cy + Math.sin(a) * raggio);
        }
        p.endShape(p.CLOSE);
      } else {
        p.circle(cx, cy, 2 * r);
      }
    }

    // tipo: 'base' | 'fisso' | 'fantasma'
    function disegnaElemento(cx, cy, tipo) {
      const r = cell * 0.36;
      p.push();
      if (tipo === 'fantasma') {
        const c = p.color(evidenzia ? COL_ROSSA : COL_INKSOFT);
        c.setAlpha(120);
        p.noFill();
        p.stroke(c);
        p.strokeWeight(1.6);
        p.drawingContext.setLineDash([4, 4]);
      } else {
        const base = p.color(tipo === 'fisso' && evidenzia ? COL_ROSSA : COL_INK);
        const dentro = p.color(tipo === 'fisso' && evidenzia ? COL_ROSSA : COL_INK);
        dentro.setAlpha(tipo === 'fisso' && evidenzia ? 60 : 30);
        p.fill(dentro);
        p.stroke(base);
        p.strokeWeight(tipo === 'fisso' && evidenzia ? 2 : 1.6);
      }
      disegnaForma(cx, cy, r);
      p.drawingContext.setLineDash([]);
      p.pop();
    }

    function disegnaFigura(n, fx, fy) {
      // Le n colonne che crescono
      for (let c = 0; c < n; c++) {
        for (let r = 0; r < H; r++) {
          const mancante = K < 0 && c === n - 1 && r < -K;
          const cx = fx + c * cell + cell / 2;
          const cy = fy + r * cell + cell / 2;
          if (mancante) {
            if (fantasmi) disegnaElemento(cx, cy, 'fantasma');
          } else {
            disegnaElemento(cx, cy, 'base');
          }
        }
      }

      // Il pezzo fisso positivo: in coda alle colonne, riempito dal basso
      for (let i = 0; i < K; i++) {
        const col = Math.floor(i / H);
        const r = H - 1 - (i % H);
        const cx = fx + (n + col) * cell + cell / 2;
        const cy = fy + r * cell + cell / 2;
        disegnaElemento(cx, cy, 'fisso');
      }

      if (!etichette && !conteggio) return;

      const cxFig = fx + (figWidth(n) * cell) / 2;
      let ty = fy + H * cell + 6;
      p.push();
      p.noStroke();
      p.textAlign(p.CENTER, p.TOP);
      if (etichette) {
        p.fill(COL_INKSOFT);
        p.textSize(Math.max(10, Math.min(14, cell * 0.52)));
        p.text('passo ' + n, cxFig, ty);
        ty += 20;
      }
      if (conteggio) {
        p.fill(COL_INK);
        p.textSize(Math.max(11, Math.min(15, cell * 0.58)));
        p.textStyle(p.BOLD);
        p.text(totale(n), cxFig, ty);
        p.textStyle(p.NORMAL);
      }
      p.pop();
    }

    p.setup = () => {
      COL_INK = cssVar('--ink', '#1B2A4A');
      COL_INKSOFT = cssVar('--ink-soft', '#5A6275');
      COL_CARTA = cssVar('--carta', '#FBFBF6');
      COL_ROSSA = cssVar('--rossa', '#D7263D');
      p.createCanvas(ctx.width, ctx.height);
      p.textFont('IBM Plex Mono, monospace');
      layout(passiCorrenti());
    };

    p.draw = () => {
      const lista = passiCorrenti();   // con `variabile` segue lo slider
      layout(lista);                   // riallinea a resize/rotazioni (idempotente)
      p.background(COL_CARTA);

      const rowH = H * cell + LABEL_H;
      let y = PAD;
      righe.forEach((riga) => {
        let x = Math.round((p.width - riga.w) / 2);
        riga.passi.forEach((n) => {
          disegnaFigura(n, x, y);
          x += figWidth(n) * cell + GAP_FIG * cell;
        });
        y += rowH + cell * 0.8;
      });
    };
  };
})();
