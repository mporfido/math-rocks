/**
 * Sketch p5.js riutilizzabile "riga-e-compasso".
 *
 * Un foglio su cui valgono SOLO le due mosse della geometria euclidea:
 *   riga      tira la retta che passa per due punti già esistenti
 *   compasso  traccia la circonferenza di centro un punto già esistente,
 *             passante per un altro punto già esistente
 *
 * Non si misura e non si va a occhio: si può partire solo da punti che
 * esistono davvero. Ogni volta che due oggetti si incrociano, i loro punti di
 * intersezione diventano nuovi punti utilizzabili — è così che una costruzione
 * "produce" i punti che le servono.
 *
 * Il foglio è una finestra su un piano infinito: quando una costruzione porta i
 * suoi punti oltre il bordo, la vista si allarga da sola (fino al doppio) per
 * non lasciarli irraggiungibili.
 *
 * Parametri (ctx.params):
 *   figura      'due-punti' (default, A e B) | 'segmento' (A, B e il segmento
 *               AB) | 'retta-e-punto' (retta r e un punto P fuori da r) |
 *               'angolo' (vertice V e due semirette per S e T)
 *   obiettivo   criterio del goal (senza `goal` nel markdown resta un banco di
 *               prova):
 *                 'libero'        nessun obiettivo (default)
 *                 'mosse'         almeno una retta e una circonferenza
 *                 'equidistanti'  `quanti` punti equidistanti da A e B
 *                 'asse'          la retta dei punti equidistanti da A e B
 *                 'punto-medio'   il punto medio di AB
 *                 'perpendicolare' la perpendicolare a r passante per P
 *                 'equilatero'    il triangolo equilatero di lato AB
 *                 'bisettrice'    la retta che dimezza l'angolo in V
 *   quanti      (equidistanti) quanti punti servono (default 1)
 *   liberi      'si' | 'no' (default): con 'si' un click nel vuoto crea un
 *               punto qualsiasi. Serve solo per esplorare: negli obiettivi va
 *               lasciato spento, altrimenti si "risolve" andando a occhio.
 *   lato        larghezza massima del foglio in px (default 420)
 *   titolo      consegna mostrata in alto (default: dipende dall'obiettivo)
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

  // ---- mini-libreria di geometria ------------------------------------------
  // Tutto il calcolo vive in coordinate "mondo" (unità = lato del foglio):
  // è indipendente dalla dimensione del canvas, quindi una costruzione resta
  // valida anche se la pagina viene ridimensionata o ruotata.
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
  const cross = (a, b) => a.x * b.y - a.y * b.x;
  const dot = (a, b) => a.x * b.x + a.y * b.y;
  const unit = (a) => {
    const l = Math.hypot(a.x, a.y) || 1;
    return { x: a.x / l, y: a.y / l };
  };

  const EPS = 1e-9;
  const SLACK = 1e-6;   // tolleranza sui parametri di segmenti e semirette

  // ---- figure di partenza ---------------------------------------------------
  // Coordinate mondo: u orizzontale in [0,1], v verticale in [0, ratio]. La
  // scala è la stessa sui due assi, quindi le circonferenze restano tali.
  // Le coordinate sono scelte perché i punti che servono alle costruzioni
  // cadano dentro il foglio (fuori sarebbero irraggiungibili).
  const FIGURE = {
    'due-punti': {
      ratio: 0.74,
      punti: [{ id: 'A', x: 0.34, y: 0.38 }, { id: 'B', x: 0.66, y: 0.38 }],
      oggetti: [],
    },
    'segmento': {
      ratio: 0.74,
      punti: [{ id: 'A', x: 0.34, y: 0.38 }, { id: 'B', x: 0.66, y: 0.38 }],
      oggetti: [{ k: 'r', p: 'A', q: 'B', tipo: 'segmento' }],
    },
    'retta-e-punto': {
      ratio: 0.86,
      // R e S stanno vicini al piede della perpendicolare apposta: così la
      // circonferenza di centro P taglia r in due punti ravvicinati e il loro
      // asse — il passaggio chiave — nasce dentro il foglio.
      punti: [
        { id: 'R', x: 0.20, y: 0.46 },
        { id: 'S', x: 0.80, y: 0.46 },
        { id: 'P', x: 0.42, y: 0.18 },
      ],
      oggetti: [{ k: 'r', p: 'R', q: 'S', tipo: 'retta', nome: 'r' }],
    },
    'angolo': {
      ratio: 0.76,
      punti: [
        { id: 'V', x: 0.16, y: 0.62 },
        { id: 'S', x: 0.66, y: 0.62 },
        { id: 'T', x: 0.468, y: 0.226 },
      ],
      oggetti: [
        { k: 'r', p: 'V', q: 'S', tipo: 'semiretta' },
        { k: 'r', p: 'V', q: 'T', tipo: 'semiretta' },
      ],
    },
  };

  window.P5Sketches['riga-e-compasso'] = function (p, ctx) {
    const PAR = ctx.params || {};
    const figNome = String(PAR.figura || 'due-punti').toLowerCase();
    const fig = FIGURE[figNome] || FIGURE['due-punti'];
    const obiettivo = String(PAR.obiettivo || 'libero').toLowerCase();
    const quanti = Math.max(1, Math.round(Number(PAR.quanti) || 1));
    const liberi = String(PAR.liberi || 'no').toLowerCase() === 'si';
    const MAX_SIDE = Math.max(240, Math.round(Number(PAR.lato) || 420));

    const consegnaDefault = () => {
      switch (obiettivo) {
        case 'mosse': return 'Traccia almeno una retta e una circonferenza';
        case 'equidistanti': return quanti === 1
          ? 'Trova un punto alla stessa distanza da A e da B'
          : 'Trova ' + quanti + ' punti alla stessa distanza da A e da B';
        case 'asse': return 'Traccia la retta dei punti equidistanti da A e B';
        case 'punto-medio': return 'Trova il punto medio del segmento AB';
        case 'perpendicolare': return 'Traccia la perpendicolare a r per P';
        case 'equilatero': return 'Costruisci il triangolo equilatero di lato AB';
        case 'bisettrice': return "Taglia l'angolo esattamente a metà";
        default: return 'Banco di prova: riga e compasso';
      }
    };
    const title = PAR.titolo != null ? String(PAR.titolo) : consegnaDefault();

    // ---- stato ------------------------------------------------------------
    // Gli oggetti della figura di partenza stanno in testa e non si cancellano.
    const datiIniziali = (fig.oggetti || []).map((o) => ({ ...o, dato: true }));
    let objs = datiIniziali.slice();
    let liberiPts = [];       // punti "a caso" (solo con liberi=si)
    let pts = [];             // punti utilizzabili, ricalcolati da rebuild()
    let ptIndex = {};         // id → punto
    let pending = null;       // id del primo punto della mossa in corso
    let tool = 'riga';
    let done = Boolean(ctx.completed);
    let msg = '';
    let msgAt = -1e9;

    // ---- layout -----------------------------------------------------------
    const PAD = 10;
    const HEADER = 36;
    const BTN_H = 30;
    const BTN_GAP = 8;
    const SNAP_PX = 15;

    let COL_INK, COL_INKSOFT, COL_CARTA, COL_SURF, COL_LINE, COL_GRAF, COL_ROSSA, COL_GREEN;
    let side, areaH, ox, oy;
    let buttons = [];
    let btnRows = 1;

    function layout() {
      side = Math.max(240, Math.min(ctx.width - 2 * PAD, MAX_SIDE));
      areaH = side * fig.ratio;
      ox = Math.round((ctx.width - side) / 2);
      oy = HEADER;
      applyHeight();
    }

    function applyHeight() {
      const toolbar = 10 + btnRows * BTN_H + (btnRows - 1) * BTN_GAP;
      ctx.setHeight(HEADER + areaH + toolbar + 6);
    }

    // ---- vista ------------------------------------------------------------
    // Il foglio è una finestra su un piano infinito, e una costruzione onesta
    // può benissimo portare i suoi punti oltre il bordo (l'asse di un segmento
    // lungo, per dirne una, nasce sopra e sotto di parecchio). Se la finestra
    // fosse fissa quei punti diventerebbero incliccabili e la costruzione un
    // vicolo cieco: quindi la vista si allarga da sola, restando centrata sulla
    // figura di partenza. Non insegue i punti oltre `LIMIT` — gli incroci
    // lontanissimi con una retta data non servono a nessuna costruzione e
    // rimpicciolirebbero tutto il resto per niente.
    const BASE_SPAN = 1;      // la vista "naturale": esattamente il foglio
    const MAX_SPAN = 2.0;
    const LIMIT = 0.95;       // semi-ampiezza oltre cui un punto viene ignorato
    const MARGIN = 0.04;      // aria fra il punto più esterno e il bordo
    const CX = 0.5;
    const CY = fig.ratio / 2;
    let spanTarget = BASE_SPAN;
    let spanShown = BASE_SPAN;

    const X = (u) => ox + side / 2 + (u - CX) * (side / spanShown);   // mondo → px
    const Y = (v) => oy + areaH / 2 + (v - CY) * (side / spanShown);
    const U = (px) => CX + (px - ox - side / 2) * spanShown / side;   // px → mondo
    const Vy = (py) => CY + (py - oy - areaH / 2) * spanShown / side;

    function fitSpan() {
      let need = BASE_SPAN;
      for (const pt of pts) {
        const du = Math.abs(pt.x - CX);
        const dv = Math.abs(pt.y - CY);
        if (du > LIMIT || dv > LIMIT * fig.ratio) continue;
        need = Math.max(need, 2 * (du + MARGIN), 2 * (dv + MARGIN) / fig.ratio);
      }
      // Sotto questa soglia il rimpicciolimento non servirebbe a vedere niente
      // di nuovo: meglio la vista naturale che un tremolio a ogni mossa.
      if (need < 1.08) need = BASE_SPAN;
      return Math.min(need, MAX_SPAN);
    }

    // Un punto è utilizzabile solo se si vede: fuori dalla finestra non si
    // disegna e non si può cliccare.
    function dentro(pt) {
      return Math.abs(pt.x - CX) <= spanShown / 2 + 0.004
        && Math.abs(pt.y - CY) <= spanShown * fig.ratio / 2 + 0.004;
    }

    // ---- costruzione dei punti --------------------------------------------
    // Due punti più vicini di così sono lo stesso punto. È una soglia in
    // coordinate mondo, non in pixel, apposta: se dipendesse dallo zoom
    // l'elenco dei punti (e quindi i loro id) cambierebbe allargando la vista.
    const DEDUP = 0.013;

    // Tolleranza delle verifiche, sempre in coordinate mondo (≈5 px a vista
    // naturale). Le costruzioni esatte ci cadono dentro con enorme margine:
    // serve solo a coprire l'errore in virgola mobile.
    const TOL = 0.012;

    function aggiungiPunto(pt) {
      if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return;
      for (const e of pts) if (dist(e, pt) < DEDUP) return;
      pts.push(pt);
      ptIndex[pt.id] = pt;
    }

    // Ricalcola l'elenco dei punti: dati della figura, punti liberi e tutte le
    // intersezioni fra gli oggetti presenti.
    //
    // L'ordine dei confronti non è casuale: si procede per `j` crescente
    // (l'oggetto più recente della coppia), così quando si tocca l'oggetto j i
    // punti che lo definiscono — nati da coppie con indici minori — sono già
    // stati calcolati. Gli id sono deterministici, quindi un oggetto continua a
    // riferirsi allo stesso punto anche dopo un redraw.
    function rebuild() {
      pts = [];
      ptIndex = {};
      fig.punti.forEach((pt) => aggiungiPunto({
        id: pt.id, x: pt.x, y: pt.y, kind: 'dato', label: pt.label || pt.id,
      }));
      liberiPts.forEach((pt, i) => aggiungiPunto({
        id: 'L' + i, x: pt.x, y: pt.y, kind: 'libero',
      }));
      for (let j = 1; j < objs.length; j++) {
        for (let i = 0; i < j; i++) {
          const found = interseca(objs[i], objs[j]);
          found.forEach((q, k) => aggiungiPunto({
            id: 'X' + i + '_' + j + '_' + k, x: q.x, y: q.y, kind: 'incrocio',
          }));
        }
      }
      spanTarget = fitSpan();
    }

    function estremi(o) {
      const a = ptIndex[o.p];
      const b = ptIndex[o.q];
      if (!a || !b || dist(a, b) < EPS) return null;
      return { a, b };
    }

    function inRange(o, t) {
      if (o.k !== 'r') return true;
      if (o.tipo === 'segmento') return t > -SLACK && t < 1 + SLACK;
      if (o.tipo === 'semiretta') return t > -SLACK;
      return true;
    }

    function interseca(o1, o2) {
      const e1 = estremi(o1);
      const e2 = estremi(o2);
      if (!e1 || !e2) return [];
      if (o1.k === 'r' && o2.k === 'r') return rettaRetta(o1, e1, o2, e2);
      if (o1.k === 'r') return rettaCerchio(o1, e1, e2);
      if (o2.k === 'r') return rettaCerchio(o2, e2, e1);
      return cerchioCerchio(e1, e2);
    }

    function rettaRetta(o1, e1, o2, e2) {
      const d1 = sub(e1.b, e1.a);
      const d2 = sub(e2.b, e2.a);
      const den = cross(d1, d2);
      if (Math.abs(den) < EPS) return [];       // parallele o coincidenti
      const w = sub(e2.a, e1.a);
      const t1 = cross(w, d2) / den;
      const t2 = cross(w, d1) / den;
      if (!inRange(o1, t1) || !inRange(o2, t2)) return [];
      return [{ x: e1.a.x + d1.x * t1, y: e1.a.y + d1.y * t1 }];
    }

    function rettaCerchio(o, e, ec) {
      const c = ec.a;
      const r = dist(ec.a, ec.b);
      const d = sub(e.b, e.a);
      const f = sub(e.a, c);
      const A = dot(d, d);
      const B = 2 * dot(f, d);
      const C = dot(f, f) - r * r;
      const disc = B * B - 4 * A * C;
      if (disc < 0) return [];
      const s = Math.sqrt(disc);
      const ts = s < EPS ? [-B / (2 * A)] : [(-B - s) / (2 * A), (-B + s) / (2 * A)];
      return ts
        .filter((t) => inRange(o, t))
        .map((t) => ({ x: e.a.x + d.x * t, y: e.a.y + d.y * t }));
    }

    function cerchioCerchio(e1, e2) {
      const c1 = e1.a;
      const c2 = e2.a;
      const r1 = dist(e1.a, e1.b);
      const r2 = dist(e2.a, e2.b);
      const d = dist(c1, c2);
      if (d < EPS || d > r1 + r2 || d < Math.abs(r1 - r2)) return [];
      const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
      const h2 = r1 * r1 - a * a;
      const h = h2 > 0 ? Math.sqrt(h2) : 0;
      const mx = c1.x + (c2.x - c1.x) * a / d;
      const my = c1.y + (c2.y - c1.y) * a / d;
      if (h < EPS) return [{ x: mx, y: my }];
      const rx = -(c2.y - c1.y) * (h / d);
      const ry = (c2.x - c1.x) * (h / d);
      return [{ x: mx + rx, y: my + ry }, { x: mx - rx, y: my - ry }];
    }

    // ---- verifica dell'obiettivo ------------------------------------------
    function distPuntoRetta(pt, o) {
      const e = estremi(o);
      if (!e) return Infinity;
      return Math.abs(cross(unit(sub(e.b, e.a)), sub(pt, e.a)));
    }

    function direzione(o) {
      const e = estremi(o);
      return e ? unit(sub(e.b, e.a)) : null;
    }

    const mie = (k) => objs.filter((o) => !o.dato && o.k === k);
    const costruiti = () => pts.filter((pt) => pt.kind !== 'dato');

    // Esiste una retta tracciata dallo studente che passa per due punti dati?
    function rettaPer(p1, p2, tol) {
      return mie('r').some((o) => distPuntoRetta(p1, o) < tol && distPuntoRetta(p2, o) < tol);
    }

    function contaEquidistanti(tol) {
      const A = ptIndex.A;
      const B = ptIndex.B;
      if (!A || !B) return 0;
      return costruiti().filter((pt) => Math.abs(dist(pt, A) - dist(pt, B)) < tol).length;
    }

    function raggiunto() {
      const tol = TOL;
      const COS = 0.05;   // ≈3° di tolleranza sulle direzioni
      const A = ptIndex.A;
      const B = ptIndex.B;
      const M = A && B ? { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 } : null;

      switch (obiettivo) {
        case 'mosse':
          return mie('r').length >= 1 && mie('c').length >= 1;

        case 'equidistanti':
          return contaEquidistanti(tol) >= quanti;

        case 'asse': {
          if (!M) return false;
          const dirAB = unit(sub(B, A));
          return mie('r').some((o) => {
            const d = direzione(o);
            return d && distPuntoRetta(M, o) < tol && Math.abs(dot(d, dirAB)) < COS;
          });
        }

        case 'punto-medio':
          return Boolean(M) && costruiti().some((pt) => dist(pt, M) < tol);

        case 'perpendicolare': {
          const P0 = ptIndex.P;
          const r = objs.find((o) => o.dato && o.k === 'r');
          if (!P0 || !r) return false;
          const dirR = direzione(r);
          return mie('r').some((o) => {
            const d = direzione(o);
            return d && distPuntoRetta(P0, o) < tol && Math.abs(dot(d, dirR)) < COS;
          });
        }

        case 'equilatero': {
          if (!A || !B) return false;
          const lato = dist(A, B);
          return costruiti().some((C) => (
            Math.abs(dist(C, A) - lato) < tol
            && Math.abs(dist(C, B) - lato) < tol
            && rettaPer(A, C, tol) && rettaPer(B, C, tol)
          ));
        }

        case 'bisettrice': {
          const Vp = ptIndex.V;
          const S = ptIndex.S;
          const T = ptIndex.T;
          if (!Vp || !S || !T) return false;
          const bis = unit({
            x: unit(sub(S, Vp)).x + unit(sub(T, Vp)).x,
            y: unit(sub(S, Vp)).y + unit(sub(T, Vp)).y,
          });
          return mie('r').some((o) => {
            const d = direzione(o);
            return d && distPuntoRetta(Vp, o) < tol && Math.abs(cross(d, bis)) < COS;
          });
        }

        default:
          return false;
      }
    }

    function verifica() {
      if (done || obiettivo === 'libero') return;
      if (raggiunto()) {
        done = true;
        ctx.complete();
      }
    }

    // ---- azioni -----------------------------------------------------------
    function avvisa(testo) { msg = testo; msgAt = p.millis(); }

    function puntoVicino(px, py) {
      let best = null;
      let bestD = SNAP_PX;
      for (const pt of pts) {
        if (!dentro(pt)) continue;
        const d = Math.hypot(X(pt.x) - px, Y(pt.y) - py);
        if (d < bestD) { bestD = d; best = pt; }
      }
      return best;
    }

    function usaPunto(pt) {
      if (pending == null) {
        pending = pt.id;
        return;
      }
      if (pending === pt.id) { pending = null; return; }   // secondo click: annulla
      objs.push({ k: tool === 'riga' ? 'r' : 'c', p: pending, q: pt.id, tipo: 'retta' });
      pending = null;
      rebuild();
      verifica();
    }

    function annulla() {
      pending = null;
      if (objs.length > datiIniziali.length) objs.pop();
      else if (liberiPts.length) liberiPts.pop();
      rebuild();
    }

    function ricomincia() {
      objs = datiIniziali.slice();
      liberiPts = [];
      pending = null;
      rebuild();
    }

    function clickAt(px, py) {
      for (const b of buttons) {
        if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
          b.action();
          return true;
        }
      }
      if (py < oy || py > oy + areaH) return false;
      const pt = puntoVicino(px, py);
      if (pt) { usaPunto(pt); return true; }
      if (liberi) {
        const nuovo = { x: U(px), y: Vy(py) };
        if (!dentro(nuovo)) return false;
        liberiPts.push(nuovo);
        rebuild();
        const creato = ptIndex['L' + (liberiPts.length - 1)];
        if (creato) usaPunto(creato);
        return true;
      }
      avvisa('Solo punti che esistono già: niente a occhio');
      return true;
    }

    p.mousePressed = () => { clickAt(p.mouseX, p.mouseY); };
    // Su touch blocchiamo lo scroll solo se il tap ha colpito qualcosa.
    p.touchStarted = () => !clickAt(p.mouseX, p.mouseY);

    // ---- setup / draw -----------------------------------------------------
    p.setup = () => {
      COL_INK = cssVar('--ink', '#1B2A4A');
      COL_INKSOFT = cssVar('--ink-soft', '#5A6275');
      COL_CARTA = cssVar('--carta', '#FBFBF6');
      COL_SURF = cssVar('--surface', '#FFFFFF');
      COL_LINE = cssVar('--line', '#DDE2D9');
      COL_GRAF = cssVar('--grafite', '#5A5E66');
      COL_ROSSA = cssVar('--rossa', '#D7263D');
      COL_GREEN = cssVar('--spunta', '#1F9D55');
      p.createCanvas(ctx.width, ctx.height);
      layout();
      rebuild();
      p.textFont('IBM Plex Mono, monospace');
    };

    p.draw = () => {
      layout();                 // idempotente: assorbe resize e rotazioni
      // La vista raggiunge la sua ampiezza scivolando: un salto secco farebbe
      // perdere di vista dove sono finiti i punti.
      spanShown += (spanTarget - spanShown) * 0.2;
      if (Math.abs(spanTarget - spanShown) < 0.002) spanShown = spanTarget;
      p.background(COL_CARTA);
      buildButtons();
      drawHeader();
      drawFoglio();
      drawButtons();
    };

    function drawHeader() {
      const errore = p.millis() - msgAt < 1600 && msg;
      const testo = done ? '✓ ' + testoFinale() : (errore ? msg : title + progresso());
      const tinta = done ? COL_GREEN : (errore ? COL_ROSSA : COL_INK);
      const badge = 'mosse: ' + (objs.length - datiIniziali.length);

      p.push();
      p.noStroke();
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(15);
      const badgeW = p.textWidth(badge) + 6;
      const maxW = ctx.width - 2 * PAD - badgeW - 10;
      let size = 14;
      p.textSize(size);
      while (size > 10 && p.textWidth(testo) > maxW) {
        size -= 1;
        p.textSize(size);
      }
      p.fill(tinta);
      p.text(testo, PAD, HEADER / 2);
      p.textSize(13);
      p.fill(COL_INKSOFT);
      p.textAlign(p.RIGHT, p.CENTER);
      p.text(badge, ctx.width - PAD, HEADER / 2);
      p.pop();
    }

    function progresso() {
      if (obiettivo === 'equidistanti' && quanti > 1) {
        const n = Math.min(quanti, contaEquidistanti(TOL));
        return '  (' + n + '/' + quanti + ')';
      }
      return '';
    }

    function testoFinale() {
      switch (obiettivo) {
        case 'mosse': return 'hai usato tutte e due le mosse';
        case 'equidistanti': return quanti === 1
          ? 'trovato: è alla stessa distanza da A e da B'
          : 'trovati: sono tutti alla stessa distanza da A e da B';
        case 'asse': return "è l'asse di AB";
        case 'punto-medio': return 'quello è il punto medio, esatto';
        case 'perpendicolare': return 'perpendicolare a r, passante per P';
        case 'equilatero': return 'triangolo equilatero costruito';
        case 'bisettrice': return "l'angolo è diviso in due parti uguali";
        default: return 'fatto';
      }
    }

    // Il "foglio": tutto ciò che si disegna è ritagliato dentro questo rettangolo.
    function drawFoglio() {
      p.push();
      p.noStroke();
      p.fill(COL_SURF);
      p.rect(ox, oy, side, areaH, 8);
      p.drawingContext.save();
      p.drawingContext.beginPath();
      p.drawingContext.rect(ox, oy, side, areaH);
      p.drawingContext.clip();

      drawOggetti();
      drawAnteprima();
      drawPunti();
      drawVista();

      p.drawingContext.restore();
      p.noFill();
      p.stroke(COL_LINE);
      p.strokeWeight(1.5);
      p.rect(ox, oy, side, areaH, 8);
      p.pop();
    }

    // Avviso discreto quando la vista si è allargata: senza, il foglio sembra
    // solo "rimpicciolito" senza motivo.
    function drawVista() {
      if (spanShown < 1.05) return;
      p.push();
      p.noStroke();
      p.fill(COL_INKSOFT);
      p.textSize(11);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text('vista allargata: la costruzione esce dal foglio', ox + 10, oy + areaH - 8);
      p.pop();
    }

    // Estende la retta per a,b fino ai bordi della finestra (metodo delle
    // "fette": si restringe l'intervallo del parametro t finché il punto resta
    // dentro).
    function estendi(a, b) {
      const d = sub(b, a);
      let t0 = -1e6;
      let t1 = 1e6;
      const uMin = CX - spanShown / 2;
      const uMax = CX + spanShown / 2;
      const vMin = CY - spanShown * fig.ratio / 2;
      const vMax = CY + spanShown * fig.ratio / 2;
      const slabs = [
        [-d.x, a.x - uMin], [d.x, uMax - a.x],
        [-d.y, a.y - vMin], [d.y, vMax - a.y],
      ];
      for (const [den, num] of slabs) {
        if (Math.abs(den) < EPS) {
          if (num < 0) return null;
        } else {
          const t = num / den;
          if (den < 0) t0 = Math.max(t0, t);
          else t1 = Math.min(t1, t);
        }
      }
      if (t0 > t1) return null;
      return [
        { x: a.x + d.x * t0, y: a.y + d.y * t0 },
        { x: a.x + d.x * t1, y: a.y + d.y * t1 },
      ];
    }

    function drawOggetto(o, colore, peso) {
      const e = estremi(o);
      if (!e) return;
      p.stroke(colore);
      p.strokeWeight(peso);
      p.noFill();
      if (o.k === 'c') {
        const r = dist(e.a, e.b) * side / spanShown;
        p.circle(X(e.a.x), Y(e.a.y), 2 * r);
        return;
      }
      if (o.tipo === 'segmento') {
        p.line(X(e.a.x), Y(e.a.y), X(e.b.x), Y(e.b.y));
        return;
      }
      const ext = estendi(e.a, e.b);
      if (!ext) return;
      // Una semiretta parte dal suo primo punto, non dal bordo del foglio.
      const from = o.tipo === 'semiretta' ? e.a : ext[0];
      const to = o.tipo === 'semiretta'
        ? (dot(sub(ext[1], e.a), sub(e.b, e.a)) > 0 ? ext[1] : ext[0])
        : ext[1];
      p.line(X(from.x), Y(from.y), X(to.x), Y(to.y));
    }

    function drawOggetti() {
      objs.forEach((o) => {
        if (o.dato) drawOggetto(o, COL_INK, 2.5);
        else drawOggetto(o, COL_GRAF, 1.6);
      });
      // Etichetta della retta data (es. la "r" di figura=retta-e-punto).
      objs.filter((o) => o.dato && o.nome).forEach((o) => {
        const e = estremi(o);
        if (!e) return;
        const d = unit(sub(e.b, e.a));
        p.push();
        p.noStroke();
        p.fill(COL_INK);
        p.textSize(14);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.text(o.nome, X(e.a.x + d.x * 0.04) + 4, Y(e.a.y + d.y * 0.04) - 4);
        p.pop();
      });
    }

    function drawAnteprima() {
      if (pending == null) return;
      const a = ptIndex[pending];
      if (!a) { pending = null; return; }
      const target = puntoVicino(p.mouseX, p.mouseY);
      const b = target && target.id !== pending
        ? target
        : { x: U(p.mouseX), y: Vy(p.mouseY) };
      if (dist(a, b) < EPS) return;

      p.push();
      p.drawingContext.setLineDash([5, 5]);
      p.stroke(COL_ROSSA);
      p.strokeWeight(1.4);
      p.noFill();
      if (tool === 'compasso') {
        p.circle(X(a.x), Y(a.y), 2 * dist(a, b) * side / spanShown);
      } else {
        const ext = estendi(a, b);
        if (ext) p.line(X(ext[0].x), Y(ext[0].y), X(ext[1].x), Y(ext[1].y));
      }
      p.drawingContext.setLineDash([]);
      p.pop();
    }

    function drawPunti() {
      const hover = puntoVicino(p.mouseX, p.mouseY);
      p.push();
      pts.forEach((pt) => {
        if (!dentro(pt)) return;
        const x = X(pt.x);
        const y = Y(pt.y);
        const attivo = pending === pt.id;
        if (pt.kind === 'dato') {
          p.noStroke();
          p.fill(COL_INK);
          p.circle(x, y, 9);
        } else if (pt.kind === 'libero') {
          p.noStroke();
          p.fill(COL_GRAF);
          p.circle(x, y, 7);
        } else {
          p.stroke(COL_GRAF);
          p.strokeWeight(1.8);
          p.fill(COL_SURF);
          p.circle(x, y, 7);
        }
        if (attivo || (hover && hover.id === pt.id)) {
          p.noFill();
          p.stroke(attivo ? COL_ROSSA : COL_INKSOFT);
          p.strokeWeight(2);
          p.circle(x, y, 18);
        }
      });
      // Etichette dei punti dati, con alone di carta per staccarle dai tratti.
      p.noStroke();
      p.textSize(15);
      p.textAlign(p.CENTER, p.CENTER);
      pts.filter((pt) => pt.kind === 'dato' && dentro(pt)).forEach((pt) => {
        const x = X(pt.x);
        const y = Y(pt.y) - 16;
        p.fill(COL_SURF);
        for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) {
          p.text(pt.label, x + dx, y + dy);
        }
        p.fill(COL_INK);
        p.text(pt.label, x, y);
      });
      p.pop();
    }

    // ---- bottoni ----------------------------------------------------------
    function buildButtons() {
      const specs = [
        { label: 'riga', action: () => { tool = 'riga'; pending = null; }, on: () => tool === 'riga' },
        { label: 'compasso', action: () => { tool = 'compasso'; pending = null; }, on: () => tool === 'compasso' },
        { label: '↶', action: annulla, small: true },
        { label: '↺', action: ricomincia, small: true },
      ];
      buttons = [];
      p.textSize(13);
      const y0 = HEADER + areaH + 10;
      let x = PAD;
      let riga = 0;
      for (const s of specs) {
        const w = (s.small ? 22 : p.textWidth(s.label)) + 24;
        if (x > PAD && x + w > ctx.width - PAD) { riga += 1; x = PAD; }
        buttons.push({ ...s, x, y: y0 + riga * (BTN_H + BTN_GAP), w, h: BTN_H });
        x += w + BTN_GAP;
      }
      btnRows = riga + 1;
      applyHeight();
    }

    function drawButtons() {
      p.push();
      p.textSize(13);
      p.textAlign(p.CENTER, p.CENTER);
      for (const b of buttons) {
        const attivo = b.on ? b.on() : false;
        p.stroke(COL_INK);
        p.strokeWeight(2);
        p.fill(attivo ? COL_INK : COL_SURF);
        p.rect(b.x, b.y, b.w, b.h, 8);
        p.noStroke();
        p.fill(attivo ? COL_SURF : COL_INK);
        p.text(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
      }
      p.pop();
    }
  };
})();
