/**
 * Sketch p5.js riutilizzabile "figura-triangolo".
 *
 * Un triangolo QUALSIASI, con le sue parti etichettabili: lati, vertici,
 * angoli, altezza — con numeri, con lettere, o con tutti e due. È il compagno
 * di `figura-rettangolo`: stessa famiglia `figura-*`, figure parametriche al
 * servizio del testo, diverse dai `geometria-*` che sono cablati su un teorema.
 *
 * È espositivo: nessuna interazione, nessun goal.
 *
 * NOMI E POSIZIONE. Vale la convenzione classica: i vertici sono A, B, C e il
 * lato `a` è quello OPPOSTO ad A, cioè BC. Il lato a è la base, disegnata
 * orizzontale in basso (B a sinistra, C a destra), con A in alto. Ogni elenco
 * di tre valori — `lati`, `angoli`, `etichette-lati` — segue quest'ordine.
 *
 * FORMA. Vince il primo parametro presente:
 *   lati=3,4,5      le tre misure (SSS). Se non rispettano la disuguaglianza
 *                   triangolare, si torna alla forma di default con un warning
 *   angoli=90,60,30 le tre ampiezze in gradi (normalizzate a 180)
 *   tipo=isoscele   scorciatoia, per quando le misure precise non contano:
 *                   equilatero | isoscele | scaleno | rettangolo |
 *                   rettangolo-isoscele | ottusangolo
 *   (niente)        uno scaleno acutangolo
 * Solo con `lati` le misure sono VERE: perimetro e etichette numeriche
 * compaiono soltanto in quel caso.
 *
 * Parametri (ctx.params):
 *   lati              tre misure separate da virgola (a,b,c)
 *   angoli            tre ampiezze in gradi (in A,B,C)
 *   tipo              scorciatoia di forma (vedi sopra)
 *   etichette-lati    cosa scrivere sui lati a,b,c — es. y,x,x — oppure `no`
 *   etichette-vertici A,B,C (default) oppure `no`
 *   etichette-angoli  α,β,γ, oppure `si` (le ampiezze in gradi), oppure `no` (default)
 *   mostra            lettere | numeri | entrambi (default lettere)
 *   altezza           A | B | C — traccia l'altezza da quel vertice (default no)
 *   etichetta-altezza cosa scrivere accanto all'altezza (default h)
 *   segni             si|no — tacche sui lati congruenti, archi sugli angoli
 *                     congruenti, quadratino sull'angolo retto (default no)
 *   evidenzia         lati/parti in colore d'accento: es. a,c oppure b,altezza
 *   perimetro         si|no — il perimetro numerico sotto la figura (default no)
 *   ribalta           si|no — specchia orizzontalmente (default no)
 *   unita             etichetta di misura, es. cm (default vuoto)
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

  function flag(v, def) {
    if (v == null || v === '') return def;
    return ['si', 'sì', 'yes', 'true', '1'].includes(String(v).toLowerCase());
  }

  function spento(v) {
    return v != null && ['no', 'nessuno', 'false', '0'].includes(String(v).toLowerCase());
  }

  function lista(v) {
    if (v == null || v === '') return null;
    const out = String(v).split(',').map((s) => s.trim()).filter((s) => s !== '');
    return out.length ? out : null;
  }

  function numeri(v) {
    const l = lista(v);
    if (!l) return null;
    const out = l.map(Number);
    return out.length === 3 && out.every((n) => Number.isFinite(n) && n > 0)
      ? out : null;
  }

  // 12 → "12", 4.36 → "4,36" (virgola decimale: è un corso italiano)
  function fmt(n) {
    if (!Number.isFinite(n)) return '?';
    const r = Math.round(n * 100) / 100;
    return String(r).replace('.', ',');
  }

  // Terne [a, b, c] di comodo per le forme senza misure. Non sono misure vere:
  // servono solo a far vedere la forma giusta.
  const TIPI = {
    'equilatero': [1, 1, 1],
    'isoscele': [1, 1.3, 1.3],
    'scaleno': [1, 0.86, 0.72],
    'rettangolo': [4, 5, 3],                 // angolo retto in B (3-4-5)
    'rettangolo-isoscele': [1, Math.SQRT2, 1],
    'ottusangolo': [3, 4.3589, 2],           // angolo ottuso in B (120°)
  };

  function valido(l) {
    return l && l[0] + l[1] > l[2] + 1e-9
      && l[0] + l[2] > l[1] + 1e-9
      && l[1] + l[2] > l[0] + 1e-9;
  }

  window.P5Sketches['figura-triangolo'] = function (p, ctx) {
    const P = ctx.params || {};

    // ---- Forma ----
    let misureNote = false;
    let lati = null;

    const datiLati = numeri(P.lati);
    if (datiLati) {
      if (valido(datiLati)) {
        lati = datiLati;
        misureNote = true;
      } else if (typeof console !== 'undefined' && console.warn) {
        console.warn('[figura-triangolo] lati=' + P.lati
          + ' non rispettano la disuguaglianza triangolare: uso la forma di default');
      }
    }

    if (!lati) {
      const datiAngoli = numeri(P.angoli);
      if (datiAngoli) {
        // Normalizza a 180° e ricava i lati con il teorema dei seni.
        const somma = datiAngoli.reduce((s, v) => s + v, 0);
        const g = datiAngoli.map((v) => (v * 180) / somma);
        const cand = g.map((v) => Math.sin((v * Math.PI) / 180));
        if (valido(cand) && cand.every((v) => v > 1e-6)) lati = cand;
      }
    }

    if (!lati && P.tipo != null) {
      const t = String(P.tipo).toLowerCase();
      if (TIPI[t]) lati = TIPI[t].slice();
      else if (typeof console !== 'undefined' && console.warn) {
        console.warn('[figura-triangolo] tipo=' + P.tipo + ' sconosciuto');
      }
    }

    if (!lati) lati = TIPI['scaleno'].slice();

    const [LA, LB, LC] = lati;

    // Ampiezze (in gradi) dei tre angoli, dal teorema del coseno.
    function angoloDa(opposto, m, n) {
      const cos = (m * m + n * n - opposto * opposto) / (2 * m * n);
      return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
    }
    const ampiezze = [
      angoloDa(LA, LB, LC),   // in A
      angoloDa(LB, LA, LC),   // in B
      angoloDa(LC, LA, LB),   // in C
    ];

    // ---- Etichette ----
    const mostraRaw = String(P.mostra || 'lettere').toLowerCase();
    const mostra = ['lettere', 'numeri', 'entrambi'].includes(mostraRaw)
      ? mostraRaw : 'lettere';
    const unita = P.unita != null ? String(P.unita).trim() : '';

    const etLatiRaw = P['etichette-lati'];
    const etLati = spento(etLatiRaw) ? null : lista(etLatiRaw);

    const etVerticiRaw = P['etichette-vertici'];
    const etVertici = spento(etVerticiRaw)
      ? null : (lista(etVerticiRaw) || ['A', 'B', 'C']);

    const etAngoliRaw = P['etichette-angoli'];
    const etAngoli = (function () {
      if (etAngoliRaw == null || etAngoliRaw === '' || spento(etAngoliRaw)) return null;
      if (flag(etAngoliRaw, false)) return 'gradi';
      return lista(etAngoliRaw);
    })();

    // Testo su un lato: la lettera, il numero, o "lettera = numero".
    function etichettaLato(i) {
      const letra = etLati && etLati[i] ? etLati[i] : null;
      const num = misureNote ? fmt(lati[i]) + (unita ? ' ' + unita : '') : null;
      if (mostra === 'numeri') return num || letra || '';
      if (mostra === 'entrambi' && letra && num) return letra + ' = ' + num;
      return letra || num || '';
    }

    function etichettaAngolo(i) {
      if (!etAngoli) return '';
      if (etAngoli === 'gradi') return fmt(ampiezze[i]) + '°';
      return etAngoli[i] || '';
    }

    // ---- Parti costruite ----
    const vertAltezza = (function () {
      const v = P.altezza;
      if (v == null || v === '' || spento(v)) return -1;
      return ['A', 'B', 'C'].indexOf(String(v).trim().toUpperCase());
    })();
    const etAltezza = P['etichetta-altezza'] != null && P['etichetta-altezza'] !== ''
      ? String(P['etichetta-altezza']) : 'h';

    const segni = flag(P.segni, false);
    const conPerimetro = flag(P.perimetro, false);
    const ribalta = flag(P.ribalta, false);

    const evidenziati = (function () {
      const l = lista(P.evidenzia);
      if (!l) return {};
      const set = {};
      l.forEach((k) => { set[k.toLowerCase()] = true; });
      return set;
    })();

    // Gruppi di lati congruenti → quante tacche mettere su ciascuno.
    const tacchePerLato = (function () {
      if (!segni) return [0, 0, 0];
      const out = [0, 0, 0];
      let gruppo = 0;
      const visti = [false, false, false];
      for (let i = 0; i < 3; i++) {
        if (visti[i]) continue;
        const pari = [i];
        for (let j = i + 1; j < 3; j++) {
          if (!visti[j] && Math.abs(lati[i] - lati[j]) < 1e-6 * Math.max(1, lati[i])) {
            pari.push(j);
          }
        }
        if (pari.length > 1) {
          gruppo += 1;
          pari.forEach((k) => { out[k] = gruppo; visti[k] = true; });
        } else {
          visti[i] = true;
        }
      }
      return out;
    })();

    // Angoli congruenti: stessa logica, un arco in più per gruppo.
    const archiPerAngolo = (function () {
      if (!segni) return [0, 0, 0];
      const out = [0, 0, 0];
      let gruppo = 0;
      const visti = [false, false, false];
      for (let i = 0; i < 3; i++) {
        if (visti[i]) continue;
        const pari = [i];
        for (let j = i + 1; j < 3; j++) {
          if (!visti[j] && Math.abs(ampiezze[i] - ampiezze[j]) < 0.01) pari.push(j);
        }
        if (pari.length > 1) {
          gruppo += 1;
          pari.forEach((k) => { out[k] = gruppo; visti[k] = true; });
        } else {
          visti[i] = true;
        }
      }
      return out;
    })();

    function retto(i) {
      return Math.abs(ampiezze[i] - 90) < 0.01;
    }

    // ---- Geometria (coordinate matematiche, y verso l'alto) ----
    // B nell'origine, C sull'asse x, A in alto: il lato a = BC è la base.
    const xA = (LC * LC + LA * LA - LB * LB) / (2 * LA);
    const yA = Math.sqrt(Math.max(0, LC * LC - xA * xA));
    const MAT = [
      { x: xA, y: yA },     // A
      { x: 0, y: 0 },       // B
      { x: LA, y: 0 },      // C
    ];
    if (ribalta) MAT.forEach((q) => { q.x = LA - q.x; });

    // Piede dell'altezza dal vertice v sul lato opposto (può cadere FUORI dal
    // segmento: negli ottusangoli è il caso normale, non un errore).
    function piede(v) {
      const V = MAT[v];
      const Q = MAT[(v + 1) % 3];
      const R = MAT[(v + 2) % 3];
      const dx = R.x - Q.x;
      const dy = R.y - Q.y;
      const len2 = dx * dx + dy * dy || 1;
      const t = ((V.x - Q.x) * dx + (V.y - Q.y) * dy) / len2;
      return { x: Q.x + dx * t, y: Q.y + dy * t, t: t, Q: Q, R: R };
    }
    const F = vertAltezza >= 0 ? piede(vertAltezza) : null;

    // ---- Layout ----
    const PAD = 34;          // spazio per lettere e archi fuori dalla figura
    const MAX_H = 210;
    const LINE_H = 22;

    let COL_INK, COL_INKSOFT, COL_CARTA, COL_ROSSA;
    let SC = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];   // vertici in pixel
    let FS = null;                                              // piede in pixel
    let righeSotto = [];

    function layout() {
      righeSotto = (conPerimetro && misureNote)
        ? ['perimetro = ' + fmt(LA + LB + LC) + (unita ? ' ' + unita : '')]
        : [];

      const punti = MAT.slice();
      if (F) punti.push({ x: F.x, y: F.y });   // il piede può stare fuori dalla base
      const minX = Math.min.apply(null, punti.map((q) => q.x));
      const maxX = Math.max.apply(null, punti.map((q) => q.x));
      const minY = Math.min.apply(null, punti.map((q) => q.y));
      const maxY = Math.max.apply(null, punti.map((q) => q.y));

      const bw = Math.max(1e-6, maxX - minX);
      const bh = Math.max(1e-6, maxY - minY);

      const availW = Math.max(60, ctx.width - 2 * PAD);
      const s = Math.min(availW / bw, MAX_H / bh);
      const dw = bw * s;
      const dh = bh * s;

      const ox = PAD + (availW - dw) / 2;
      const oy = PAD;

      const proj = (q) => ({ x: ox + (q.x - minX) * s, y: oy + (maxY - q.y) * s });
      SC = MAT.map(proj);
      FS = F ? proj(F) : null;

      // Sotto la figura sta prima l'etichetta della base, poi il perimetro:
      // la riga in più vale LINE_H più lo scarto dall'etichetta.
      ctx.setHeight(Math.round(PAD + dh + PAD
        + (righeSotto.length ? 26 + righeSotto.length * LINE_H : 0)));
    }

    // ---- Disegno ----
    const centro = () => ({
      x: (SC[0].x + SC[1].x + SC[2].x) / 3,
      y: (SC[0].y + SC[1].y + SC[2].y) / 3,
    });

    function tacche(A, B, n) {
      if (!n) return;
      const mx = (A.x + B.x) / 2;
      const my = (A.y + B.y) / 2;
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const nx = -uy, ny = ux;
      const R = 6;
      p.push();
      p.stroke(COL_INK);
      p.strokeWeight(1.8);
      for (let i = 0; i < n; i++) {
        const off = (i - (n - 1) / 2) * 5;
        const cx = mx + ux * off;
        const cy = my + uy * off;
        p.line(cx - nx * R, cy - ny * R, cx + nx * R, cy + ny * R);
      }
      p.pop();
    }

    // Quadratino di perpendicolarità in V, fra le direzioni u1 e u2.
    function quadratino(V, u1, u2) {
      const L = 11;
      p.push();
      p.noFill();
      p.stroke(COL_INKSOFT);
      p.strokeWeight(1.4);
      p.beginShape();
      p.vertex(V.x + u1.x * L, V.y + u1.y * L);
      p.vertex(V.x + (u1.x + u2.x) * L, V.y + (u1.y + u2.y) * L);
      p.vertex(V.x + u2.x * L, V.y + u2.y * L);
      p.endShape();
      p.pop();
    }

    function versore(da, a) {
      const dx = a.x - da.x;
      const dy = a.y - da.y;
      const len = Math.hypot(dx, dy) || 1;
      return { x: dx / len, y: dy / len };
    }

    // Archi dell'angolo nel vertice i, verso gli altri due vertici.
    function archi(i, n) {
      if (!n) return;
      const V = SC[i];
      const u1 = versore(V, SC[(i + 1) % 3]);
      const u2 = versore(V, SC[(i + 2) % 3]);
      if (retto(i)) {
        quadratino(V, u1, u2);
        return;
      }
      let a1 = Math.atan2(u1.y, u1.x);
      let a2 = Math.atan2(u2.y, u2.x);
      let diff = a2 - a1;
      while (diff <= -Math.PI) diff += 2 * Math.PI;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      if (diff < 0) { const t = a1; a1 = a2; a2 = t; diff = -diff; }
      p.push();
      p.noFill();
      p.stroke(COL_INKSOFT);
      p.strokeWeight(1.6);
      for (let k = 0; k < n; k++) {
        const d = 34 + k * 9;
        p.arc(V.x, V.y, d, d, a1, a1 + diff);
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
      layout();
    };

    p.draw = () => {
      layout();
      p.background(COL_CARTA);

      const G = centro();

      // Il triangolo
      const dentro = p.color(COL_INK);
      dentro.setAlpha(18);
      p.push();
      p.fill(dentro);
      p.stroke(COL_INK);
      p.strokeWeight(2);
      p.triangle(SC[0].x, SC[0].y, SC[1].x, SC[1].y, SC[2].x, SC[2].y);
      p.pop();

      // Lati evidenziati, ridisegnati sopra. Il lato i è opposto al vertice i.
      const NOMI = ['a', 'b', 'c'];
      p.push();
      p.stroke(COL_ROSSA);
      p.strokeWeight(3.2);
      NOMI.forEach((nome, i) => {
        if (!evidenziati[nome]) return;
        const Q = SC[(i + 1) % 3];
        const R = SC[(i + 2) % 3];
        p.line(Q.x, Q.y, R.x, R.y);
      });
      p.pop();

      // L'altezza: tratteggiata, col quadratino sul piede. Se il piede cade
      // fuori dal lato, il lato si prolunga (puntinato) fino a raggiungerlo.
      if (FS) {
        const V = SC[vertAltezza];
        const Q = SC[(vertAltezza + 1) % 3];
        const R = SC[(vertAltezza + 2) % 3];
        const fuori = F.t < 0 || F.t > 1;
        const rossa = !!evidenziati['altezza'];

        p.push();
        if (fuori) {
          p.stroke(COL_INKSOFT);
          p.strokeWeight(1.2);
          p.drawingContext.setLineDash([2, 4]);
          const est = F.t < 0 ? Q : R;
          p.line(est.x, est.y, FS.x, FS.y);
          p.drawingContext.setLineDash([]);
        }
        p.stroke(rossa ? COL_ROSSA : COL_INK);
        p.strokeWeight(rossa ? 2.6 : 1.8);
        p.drawingContext.setLineDash([6, 5]);
        p.line(V.x, V.y, FS.x, FS.y);
        p.drawingContext.setLineDash([]);
        p.pop();

        quadratino(FS, versore(FS, V), versore(FS, F.t < 0 ? R : Q));

        // L'etichetta sta accanto all'altezza, nella metà più larga: fuori
        // finirebbe addosso all'etichetta di un lato.
        if (etAltezza) {
          const mx = (V.x + FS.x) / 2;
          const my = (V.y + FS.y) / 2;
          const lontano = Math.hypot(FS.x - Q.x, FS.y - Q.y) > Math.hypot(FS.x - R.x, FS.y - R.y)
            ? Q : R;
          const dir = versore(FS, lontano);
          p.push();
          p.noStroke();
          p.fill(rossa ? COL_ROSSA : COL_INK);
          p.textSize(13);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(etAltezza, mx + dir.x * 14, my + dir.y * 14);
          p.pop();
        }
      }

      // Tacche e archi di congruenza
      for (let i = 0; i < 3; i++) {
        tacche(SC[(i + 1) % 3], SC[(i + 2) % 3], tacchePerLato[i]);
      }
      for (let i = 0; i < 3; i++) {
        if (archiPerAngolo[i]) archi(i, archiPerAngolo[i]);
        else if (segni && retto(i)) archi(i, 1);
      }

      // Etichette dei lati: al centro del lato, spinte verso l'esterno
      p.push();
      p.noStroke();
      p.textSize(14);
      p.textAlign(p.CENTER, p.CENTER);
      for (let i = 0; i < 3; i++) {
        const testo = etichettaLato(i);
        if (!testo) continue;
        const Q = SC[(i + 1) % 3];
        const R = SC[(i + 2) % 3];
        const mx = (Q.x + R.x) / 2;
        const my = (Q.y + R.y) / 2;
        const dir = versore(G, { x: mx, y: my });
        p.fill(evidenziati[NOMI[i]] ? COL_ROSSA : COL_INK);
        p.text(testo, mx + dir.x * 20, my + dir.y * 20);
      }
      p.pop();

      // Etichette dei vertici: fuori, sul prolungamento dal centro
      if (etVertici) {
        p.push();
        p.noStroke();
        p.fill(COL_INKSOFT);
        p.textSize(13);
        p.textAlign(p.CENTER, p.CENTER);
        for (let i = 0; i < 3; i++) {
          if (!etVertici[i]) continue;
          const dir = versore(G, SC[i]);
          p.text(etVertici[i], SC[i].x + dir.x * 15, SC[i].y + dir.y * 15);
        }
        p.pop();
      }

      // Etichette degli angoli: dentro, lungo la bisettrice
      if (etAngoli) {
        p.push();
        p.noStroke();
        p.fill(COL_INKSOFT);
        p.textSize(12);
        p.textAlign(p.CENTER, p.CENTER);
        for (let i = 0; i < 3; i++) {
          const testo = etichettaAngolo(i);
          if (!testo) continue;
          const u1 = versore(SC[i], SC[(i + 1) % 3]);
          const u2 = versore(SC[i], SC[(i + 2) % 3]);
          const bx = u1.x + u2.x;
          const by = u1.y + u2.y;
          const len = Math.hypot(bx, by) || 1;
          const d = archiPerAngolo[i] ? 30 + archiPerAngolo[i] * 8 : 28;
          p.text(testo, SC[i].x + (bx / len) * d, SC[i].y + (by / len) * d);
        }
        p.pop();
      }

      // Il perimetro: solo il numero, e solo se le misure sono vere
      if (righeSotto.length) {
        p.push();
        p.noStroke();
        p.fill(COL_INK);
        p.textSize(14);
        p.textAlign(p.CENTER, p.TOP);
        let ty = Math.max(SC[0].y, SC[1].y, SC[2].y) + 44;
        righeSotto.forEach((riga) => {
          p.text(riga, p.width / 2, ty);
          ty += LINE_H;
        });
        p.pop();
      }
    };
  };
})();
