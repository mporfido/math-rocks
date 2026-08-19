/**
 * Sketch p5.js riutilizzabile "figura-rettangolo".
 *
 * Un rettangolo (o un quadrato: è lo stesso disegno con i lati uguali e le
 * tacche) con le misure scritte sui lati — con le LETTERE, con i numeri, o con
 * tutti e due. Serve alle lezioni in cui una grandezza si descrive prima di
 * conoscerne il valore: `base=2h altezza=h` è una figura sola, ma vale per
 * infiniti rettangoli.
 *
 * Fa parte della famiglia `figura-*`: figure parametriche ed etichettabili,
 * diverse dai `geometria-*`, che sono figure cablate al servizio di un teorema.
 *
 * È espositivo: nessuna interazione, nessun goal.
 *
 * MISURE. `base` e `altezza` sono scritte in forma lineare — `x`, `2x`, `x+1`,
 * `2x-3`, `5` — e la lettera può essere qualsiasi. Il disegno rispetta le
 * proporzioni fra i lati: `base=2h altezza=h` si VEDE doppio.
 *   - con `variabile=h` (e `bind=h` nel markdown) la lettera h prende il valore
 *     dello slider, e la figura lo segue;
 *   - le lettere senza valore prendono un valore di comodo, solo per il
 *     disegno: la prima 4, la seconda 2.5. Così `base=b altezza=h` è un
 *     rettangolo e non un quadrato per caso.
 *
 * PERIMETRO E AREA si mostrano solo come NUMERO, mai come espressione
 * letterale: scriverla è il compito dello studente, non della figura.
 *
 * Parametri (ctx.params):
 *   base        misura del lato orizzontale (default b)
 *   altezza     misura del lato verticale (default h)
 *   variabile   nome della variabile del modello che dà valore alla lettera
 *   mostra      lettere | numeri | entrambi — cosa si scrive sui lati (default lettere)
 *   segni       si|no — tacche di congruenza + quadratini d'angolo retto (default no)
 *   vertici     A,B,C,D (dal basso a sinistra, in senso antiorario) | no (default no)
 *   perimetro   si|no — il perimetro numerico sotto la figura (default no)
 *   area        si|no — idem l'area (default no)
 *   evidenzia   base | altezza | no — il lato in colore d'accento (default no)
 *   unita       etichetta di misura, es. cm (default vuoto)
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

  // Min/max dello slider che guida `bindName`, letti dal vero <x-variable>
  // in pagina (stesso principio di cssVar: lo sketch legge dal DOM invece di
  // richiedere all'autore di ripetere l'informazione nei parametri).
  function sliderRange(bindName) {
    if (!bindName) return null;
    try {
      const el = document.querySelector(
        'x-variable[data-bind="' + bindName + '"] input[type="range"]'
      );
      if (!el) return null;
      const min = parseFloat(el.min);
      const max = parseFloat(el.max);
      if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
      return { min: min, max: max };
    } catch (e) {
      return null;
    }
  }

  /**
   * Legge una misura in forma lineare `coef·lettera + cost`.
   * Accetta: x · 2x · x+1 · 2x-3 · 5 · -x. Quello che non riconosce lo tratta
   * come una lettera muta (coef 1), così l'autore vede scritto ciò che ha
   * scritto invece di veder sparire la figura.
   */
  function parseMisura(raw, fallbackLabel) {
    const label = String(raw == null || raw === '' ? fallbackLabel : raw).trim();
    const s = label.replace(/\s+/g, '').replace(/·|\*/g, '');

    // solo numero
    if (/^-?\d+(\.\d+)?$/.test(s)) {
      return { coef: 0, cost: Number(s), letter: null, label: label };
    }
    // [-][coef]lettera[±cost]
    const m = s.match(/^(-)?(\d+(?:\.\d+)?)?([a-zA-Zα-ω])(?:([+-])(\d+(?:\.\d+)?))?$/);
    if (m) {
      const coef = (m[2] === undefined ? 1 : Number(m[2])) * (m[1] ? -1 : 1);
      const cost = m[4] ? Number(m[5]) * (m[4] === '-' ? -1 : 1) : 0;
      return { coef: coef, cost: cost, letter: m[3], label: label };
    }
    return { coef: 1, cost: 0, letter: label.slice(0, 1), label: label };
  }

  // 12 → "12", 7.5 → "7,5" (virgola decimale: è un corso italiano)
  function fmt(n) {
    if (!Number.isFinite(n)) return '?';
    const r = Math.round(n * 100) / 100;
    return String(r).replace('.', ',');
  }

  window.P5Sketches['figura-rettangolo'] = function (p, ctx) {
    const P = ctx.params || {};

    const mBase = parseMisura(P.base, 'b');
    const mAlt = parseMisura(P.altezza, 'h');

    const variabile = (P.variabile != null && P.variabile !== '')
      ? String(P.variabile) : null;

    const mostraRaw = String(P.mostra || 'lettere').toLowerCase();
    const mostra = ['lettere', 'numeri', 'entrambi'].includes(mostraRaw)
      ? mostraRaw : 'lettere';

    const segni = flag(P.segni, false);
    const conPerimetro = flag(P.perimetro, false);
    const conArea = flag(P.area, false);
    const unita = P.unita != null ? String(P.unita).trim() : '';

    const evid = String(P.evidenzia || 'no').toLowerCase();
    const evidBase = evid === 'base';
    const evidAlt = evid === 'altezza';

    const vertici = (function () {
      const v = P.vertici;
      if (v == null || v === '' || String(v).toLowerCase() === 'no') return null;
      const parts = String(v).split(',').map((s) => s.trim()).filter(Boolean);
      return parts.length >= 4 ? parts.slice(0, 4) : ['A', 'B', 'C', 'D'];
    })();

    // Valori di comodo per le lettere senza slider: la prima 4, la seconda 2.5.
    // Servono solo alle proporzioni del disegno, non compaiono mai scritti.
    const DEFAULTS = {};
    [mBase.letter, mAlt.letter].forEach(function (L) {
      if (L && DEFAULTS[L] === undefined) {
        DEFAULTS[L] = Object.keys(DEFAULTS).length === 0 ? 4 : 2.5;
      }
    });

    // Valore della lettera: dallo slider se è quella legata, altrimenti niente.
    function valoreLettera(L) {
      if (!L) return null;
      if (variabile && L === variabile) {
        const v = Number(ctx.model[variabile]);
        return Number.isFinite(v) ? v : null;
      }
      return null;
    }

    // Valore NOTO della misura: solo se la lettera ha davvero un valore.
    function valoreNoto(m) {
      if (!m.letter) return m.cost;
      const v = valoreLettera(m.letter);
      return v == null ? null : m.coef * v + m.cost;
    }

    // Valore per il DISEGNO: quello noto, o quello di comodo. Mai ≤ 0, o la
    // figura si chiuderebbe su se stessa mentre lo slider passa dallo zero.
    function valoreDisegno(m) {
      const noto = valoreNoto(m);
      const v = noto != null ? noto
        : (m.letter ? m.coef * DEFAULTS[m.letter] + m.cost : m.cost);
      return Math.max(0.35, v);
    }

    // Valore SOLO per calcolare il fattore di scala: se la misura è quella
    // guidata dallo slider, usa il caso peggiore del suo range invece del
    // valore corrente. Così la scala resta costante per tutta la corsa dello
    // slider, e il lato NON legato alla variabile (l'altro, letterale o con
    // lettera senza slider — già stabile) resta fermo in pixel invece di
    // ridimensionarsi ogni volta che l'altro lato cambia.
    function valoreScala(m) {
      if (m.letter && variabile && m.letter === variabile) {
        const range = sliderRange(variabile);
        if (range) {
          const a = m.coef * range.min + m.cost;
          const b = m.coef * range.max + m.cost;
          return Math.max(0.35, Math.max(Math.abs(a), Math.abs(b)));
        }
      }
      return valoreDisegno(m);
    }

    // Che cosa si scrive sul lato.
    function etichetta(m) {
      const noto = valoreNoto(m);
      const num = noto == null ? null : fmt(noto) + (unita ? ' ' + unita : '');
      // Una misura senza lettera è già un numero: "6 = 6 cm" non si scrive.
      if (!m.letter && num != null) return num;
      if (mostra === 'numeri' && num != null) return num;
      if (mostra === 'entrambi' && num != null) return m.label + ' = ' + num;
      return m.label;   // 'lettere', o numero non ancora noto
    }

    // ---- Layout ----
    const PAD = 14;
    const MAX_H = 190;      // altezza massima del disegno
    const MIN_LATO = 26;
    const LINE_H = 22;

    let COL_INK, COL_INKSOFT, COL_CARTA, COL_ROSSA;
    let x0 = 0, y0 = 0, w = 0, h = 0;   // rettangolo in pixel
    let righeSotto = [];

    function testoSotto() {
      const out = [];
      const bN = valoreNoto(mBase);
      const aN = valoreNoto(mAlt);
      if (conPerimetro) {
        out.push(bN != null && aN != null
          ? 'perimetro = ' + fmt(2 * bN + 2 * aN) + (unita ? ' ' + unita : '')
          : 'perimetro = ?');
      }
      if (conArea) {
        out.push(bN != null && aN != null
          ? 'area = ' + fmt(bN * aN) + (unita ? ' ' + unita + '²' : '')
          : 'area = ?');
      }
      return out;
    }

    // Idempotente: ricalcolato a ogni frame, così resize e slider non hanno
    // bisogno di un handler dedicato.
    function layout() {
      const uB = valoreDisegno(mBase);
      const uA = valoreDisegno(mAlt);

      righeSotto = testoSotto();

      p.textSize(14);
      const padSx = PAD + p.textWidth(etichetta(mAlt)) + 10;
      const padDx = PAD + (vertici ? 16 : 4);
      const padSopra = PAD + (vertici ? 16 : 4);
      const padSotto = PAD + 22 + (vertici ? 16 : 0)
        + righeSotto.length * LINE_H;

      const availW = Math.max(60, ctx.width - padSx - padDx);
      const s = Math.min(availW / valoreScala(mBase), MAX_H / valoreScala(mAlt));

      w = Math.max(MIN_LATO, uB * s);
      h = Math.max(MIN_LATO, uA * s);
      // Il clamp sul minimo può aver sforato in larghezza: si rientra.
      if (w > availW) { h *= availW / w; w = availW; }

      x0 = padSx + Math.max(0, (availW - w) / 2);
      y0 = padSopra;

      ctx.setHeight(Math.round(padSopra + h + padSotto));
    }

    // ---- Disegno ----

    // Tacche di congruenza: n trattini al centro del lato, perpendicolari.
    function tacche(ax, ay, bx, by, n) {
      const mx = (ax + bx) / 2;
      const my = (ay + by) / 2;
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;     // lungo il lato
      const nx = -uy, ny = ux;                // perpendicolare
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

    function quadratinoRetto(cx, cy, sx, sy) {
      const L = 11;
      p.push();
      p.noFill();
      p.stroke(COL_INKSOFT);
      p.strokeWeight(1.4);
      p.beginShape();
      p.vertex(cx + sx * L, cy);
      p.vertex(cx + sx * L, cy + sy * L);
      p.vertex(cx, cy + sy * L);
      p.endShape();
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

      const x1 = x0 + w;
      const y1 = y0 + h;

      // Il rettangolo
      const dentro = p.color(COL_INK);
      dentro.setAlpha(18);
      p.push();
      p.fill(dentro);
      p.stroke(COL_INK);
      p.strokeWeight(2);
      p.rect(x0, y0, w, h);
      p.pop();

      // I lati evidenziati si ridisegnano sopra
      if (evidBase || evidAlt) {
        p.push();
        p.stroke(COL_ROSSA);
        p.strokeWeight(3.2);
        if (evidBase) {
          p.line(x0, y1, x1, y1);
          p.line(x0, y0, x1, y0);
        }
        if (evidAlt) {
          p.line(x0, y0, x0, y1);
          p.line(x1, y0, x1, y1);
        }
        p.pop();
      }

      if (segni) {
        // Stessa misura scritta sui due lati → è un quadrato: una tacca per
        // lato. Altrimenti i lati opposti si marcano a coppie.
        const quadrato = mBase.label === mAlt.label;
        tacche(x0, y1, x1, y1, 1);
        tacche(x0, y0, x1, y0, 1);
        tacche(x0, y0, x0, y1, quadrato ? 1 : 2);
        tacche(x1, y0, x1, y1, quadrato ? 1 : 2);

        quadratinoRetto(x0, y0, 1, 1);
        quadratinoRetto(x1, y0, -1, 1);
        quadratinoRetto(x0, y1, 1, -1);
        quadratinoRetto(x1, y1, -1, -1);
      }

      // Etichette dei lati, sempre FUORI dalla figura
      p.push();
      p.noStroke();
      p.textSize(14);
      p.fill(evidBase ? COL_ROSSA : COL_INK);
      p.textAlign(p.CENTER, p.TOP);
      p.text(etichetta(mBase), x0 + w / 2, y1 + 8);
      p.fill(evidAlt ? COL_ROSSA : COL_INK);
      p.textAlign(p.RIGHT, p.CENTER);
      p.text(etichetta(mAlt), x0 - 10, y0 + h / 2);
      p.pop();

      // I vertici, in senso antiorario dal basso a sinistra
      if (vertici) {
        p.push();
        p.noStroke();
        p.fill(COL_INKSOFT);
        p.textSize(13);
        p.textAlign(p.RIGHT, p.TOP);
        p.text(vertici[0], x0 - 4, y1 + 2);
        p.textAlign(p.LEFT, p.TOP);
        p.text(vertici[1], x1 + 4, y1 + 2);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.text(vertici[2], x1 + 4, y0 - 2);
        p.textAlign(p.RIGHT, p.BOTTOM);
        p.text(vertici[3], x0 - 4, y0 - 2);
        p.pop();
      }

      // Perimetro e area: solo il numero
      if (righeSotto.length) {
        p.push();
        p.noStroke();
        p.fill(COL_INK);
        p.textSize(14);
        p.textAlign(p.CENTER, p.TOP);
        let ty = y1 + 30;
        righeSotto.forEach((riga) => {
          p.text(riga, p.width / 2, ty);
          ty += LINE_H;
        });
        p.pop();
      }
    };
  };
})();
