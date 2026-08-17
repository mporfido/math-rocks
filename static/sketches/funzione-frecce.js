/**
 * Sketch p5.js riutilizzabile "funzione-frecce".
 *
 * Uno sketch = un file in static/sketches/, caricato al volo da <x-p5>.
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
   * "funzione-frecce" — due insiemi affiancati e le frecce che li collegano.
   * Si trascina da un elemento di A a uno di B per disegnare una freccia, si
   * tocca una freccia per cancellarla, "Cancella tutto" azzera.
   *
   * IL VERDETTO — è il cuore didattico, e va letto prima di toccare il codice.
   * "È una funzione" si decide guardando SOLO le frecce che ESCONO da A:
   * ognuno degli elementi di A ne deve avere esattamente una. Le frecce che
   * ARRIVANO su B non c'entrano: un elemento di B può riceverne due (la
   * controimmagine ha più elementi) o nessuna (sta nel codominio ma non
   * nell'immagine), e la funzione resta una funzione. È l'asimmetria che
   * l'intera lezione insegna: non "correggerla" aggiungendo controlli su B.
   *
   * Le frecce entranti si contano solo per gli obiettivi `iniettiva`,
   * `suriettiva` e `biunivoca`, che stanno un livello sopra e non toccano il
   * verdetto qui descritto.
   *
   * Parametri (ctx.params):
   *   partenza   etichette dell'insieme A, separate da virgola (default 1,2,3)
   *   arrivo     etichette dell'insieme B (default 1,2,3)
   *   nomea      nome dell'insieme di partenza (default A)
   *   nomeb      nome dell'insieme di arrivo (default B)
   *   frecce     frecce già disegnate: `1>3,2>8` (per etichetta)
   *   modifica   si | no — `no` rende il diagramma di sola lettura (default si)
   *   verdetto   si | no — mostra la riga di giudizio (default si)
   *   evidenzia  no | immagine | controimmagine (default no)
   *   obiettivo  funzione | <lista frecce> | immagine:<lista> |
   *              iniettiva | suriettiva | biunivoca — richiede il flag `goal`
   *   termini    si | no — usa i nomi tecnici nel verdetto (default no)
   *   titolo     testo dell'header
   */
  window.P5Sketches['funzione-frecce'] = function (p, ctx) {
    const P = ctx.params || {};

    // ---- Parametri ----
    // `coerce()` del preprocessore converte i valori numerici in numeri:
    // `partenza=5` arriva come 5, non come "5". Sempre String() prima di split.
    function lista(v, def) {
      const s = v == null || v === '' ? def : String(v);
      return s.split(',').map((t) => t.trim()).filter((t) => t.length);
    }

    function flag(v, def) {
      if (v == null || v === '') return def;
      return ['si', 'sì', 'yes', 'true', '1'].includes(String(v).toLowerCase());
    }

    const A = lista(P.partenza, '1,2,3');
    const B = lista(P.arrivo, '1,2,3');
    const NOME_A = P.nomea != null ? String(P.nomea) : 'A';
    const NOME_B = P.nomeb != null ? String(P.nomeb) : 'B';

    const editabile = flag(P.modifica, true);
    const mostraVerdetto = flag(P.verdetto, true);
    const usaTermini = flag(P.termini, false);

    const evidenzia = ['immagine', 'controimmagine']
      .includes(String(P.evidenzia)) ? String(P.evidenzia) : 'no';

    const title = P.titolo != null ? String(P.titolo) : '';

    // ---- Le frecce sono chiavi "iA>iB": indici, non etichette ----
    // Le etichette possono ripetersi (due parole diverse lunghe uguali), gli
    // indici no.
    function chiave(ia, ib) { return ia + '>' + ib; }

    /** Traduce "3>9,−1>1" in chiavi di indici. Etichette ignote: scartate. */
    function parseFrecce(v) {
      const out = new Set();
      lista(v, '').forEach((tok) => {
        const i = tok.indexOf('>');
        if (i < 0) return;
        const ia = A.indexOf(tok.slice(0, i).trim());
        const ib = B.indexOf(tok.slice(i + 1).trim());
        if (ia >= 0 && ib >= 0) out.add(chiave(ia, ib));
      });
      return out;
    }

    // ---- L'obiettivo ----
    const OB = (function leggiObiettivo() {
      const raw = P.obiettivo == null ? '' : String(P.obiettivo).trim();
      if (!raw) return null;
      if (['funzione', 'iniettiva', 'suriettiva', 'biunivoca'].includes(raw)) {
        return { tipo: raw };
      }
      if (raw.startsWith('immagine:')) {
        const etichette = lista(raw.slice('immagine:'.length), '');
        return {
          tipo: 'immagine',
          indici: new Set(etichette.map((e) => B.indexOf(e)).filter((i) => i >= 0)),
          quante: etichette.length,
        };
      }
      return { tipo: 'lista', frecce: parseFrecce(raw) };
    })();

    // Un obiettivo può essere impossibile con gli insiemi dati: meglio dirlo
    // subito nel footer che lasciare lo studente contro un goal che non si
    // chiude mai. È un errore di chi scrive la lezione, non di chi la fa.
    const IMPOSSIBILE = (function verificaFattibilita() {
      if (!OB) return '';
      const conti = ' (' + NOME_A + ' ha ' + A.length + ' elementi, '
        + NOME_B + ' ne ha ' + B.length + ')';
      if (OB.tipo === 'iniettiva' && A.length > B.length) {
        return 'Obiettivo impossibile con questi insiemi' + conti + '.';
      }
      if (OB.tipo === 'suriettiva' && A.length < B.length) {
        return 'Obiettivo impossibile con questi insiemi' + conti + '.';
      }
      if (OB.tipo === 'biunivoca' && A.length !== B.length) {
        return 'Obiettivo impossibile con questi insiemi' + conti + '.';
      }
      if (OB.tipo === 'immagine') {
        if (OB.indici.size !== OB.quante) {
          return 'Obiettivo mal scritto: qualche elemento non sta in ' + NOME_B + '.';
        }
        if (OB.indici.size > A.length) {
          return 'Obiettivo impossibile con questi insiemi' + conti + '.';
        }
      }
      if (OB.tipo === 'lista' && OB.frecce.size === 0) {
        return 'Obiettivo mal scritto: nessuna freccia riconosciuta.';
      }
      return '';
    })();

    // ---- Layout ----
    const PAD = 12;
    const HEADER = 34;
    const FOOTER = 30;
    const BTN_H = 28;
    const NODE_R = 7;         // il pallino
    const HIT_R = 18;         // l'area sensibile attorno (dita, non pixel)
    const NODE_GAP = 36;      // distanza verticale fra due pallini
    const OVAL_PADY = 16;

    let ovalW = 90;
    let ax = 0;               // x dei pallini di A
    let bx = 0;               // x dei pallini di B
    let y0 = 0;               // y del primo pallino
    let ovalTop = 0;
    let ovalH = 0;

    // Colori (token "Quaderno", risolti in setup)
    let COL_INK, COL_INKSOFT, COL_CARTA, COL_GRID, COL_GREEN, COL_RED, COL_SURF;

    // ---- Stato ----
    let frecce = parseFrecce(P.frecce);
    let done = false;
    let dragging = false;
    let daIdx = -1;           // elemento di A da cui parte il trascinamento
    let focusB = -1;          // elemento di B messo a fuoco (controimmagine)
    let buttons = [];

    /**
     * Una relazione canonica che soddisfa l'obiettivo: serve al ripristino da
     * storage, che salva solo l'id del goal e non le singole frecce.
     */
    function relazioneCanonica() {
      const out = new Set();
      if (!OB || !B.length) return out;
      if (OB.tipo === 'lista') return new Set(OB.frecce);
      if (OB.tipo === 'immagine') {
        const bersagli = Array.from(OB.indici);
        A.forEach((_, i) => {
          out.add(chiave(i, bersagli[Math.min(i, bersagli.length - 1)]));
        });
        return out;
      }
      // funzione / iniettiva / suriettiva / biunivoca: l'i-esimo con l'i-esimo,
      // e gli elementi di A in eccesso tutti sull'ultimo di B.
      A.forEach((_, i) => out.add(chiave(i, Math.min(i, B.length - 1))));
      return out;
    }

    if (ctx.completed && OB) {
      frecce = relazioneCanonica();
      done = true;
    }

    // ---- Conteggi: la base di ogni verdetto ----
    function uscenti() {
      const n = A.map(() => 0);
      frecce.forEach((k) => { n[Number(k.split('>')[0])] += 1; });
      return n;
    }

    function entranti() {
      const n = B.map(() => 0);
      frecce.forEach((k) => { n[Number(k.split('>')[1])] += 1; });
      return n;
    }

    function eFunzione() {
      return uscenti().every((c) => c === 1);
    }

    function stessoInsieme(a, b) {
      if (a.size !== b.size) return false;
      for (const k of a) if (!b.has(k)) return false;
      return true;
    }

    // ---- Il verdetto ----
    /** @returns {{testo: string, ok: boolean}} */
    function verdetto() {
      const out = uscenti();

      // Prima l'ingresso con più frecce: è l'errore che la lezione insegna.
      const doppio = out.findIndex((c) => c >= 2);
      if (doppio >= 0) {
        const q = out[doppio] === 2 ? 'partono due frecce' : 'partono ' + out[doppio] + ' frecce';
        return { testo: 'Non è una funzione: da ' + A[doppio] + ' ' + q + '.', ok: false };
      }
      const vuoto = out.indexOf(0);
      if (vuoto >= 0) {
        return {
          testo: 'Non è una funzione: da ' + A[vuoto] + ' non parte nessuna freccia.',
          ok: false,
        };
      }

      // Da qui in poi è una funzione. Gli obiettivi sulle frecce entranti sono
      // un livello sopra: parlano di B, non cambiano il verdetto appena dato.
      if (OB && ['iniettiva', 'suriettiva', 'biunivoca'].includes(OB.tipo)) {
        const inb = entranti();
        if (OB.tipo !== 'suriettiva') {
          const molti = inb.findIndex((c) => c >= 2);
          if (molti >= 0) {
            return { testo: manca('iniettiva', 'su ' + B[molti] + ' arrivano due frecce'), ok: false };
          }
        }
        if (OB.tipo !== 'iniettiva') {
          const zero = inb.indexOf(0);
          if (zero >= 0) {
            return { testo: manca('suriettiva', 'su ' + B[zero] + ' non arriva niente'), ok: false };
          }
        }
        return {
          testo: usaTermini
            ? 'È una funzione ' + OB.tipo + '.'
            : 'Ci sei: ogni elemento di ' + NOME_B + ' riceve esattamente una freccia.',
          ok: true,
        };
      }

      return {
        testo: 'È una funzione: da ogni elemento parte esattamente una freccia.',
        ok: true,
      };
    }

    /** Il termine tecnico solo se richiesto: altrove è fuori programma. */
    function manca(termine, motivo) {
      return usaTermini
        ? 'È una funzione, ma non è ' + termine + ': ' + motivo + '.'
        : 'Manca qualcosa: ' + motivo + '.';
    }

    // ---- Il goal ----
    function obiettivoRaggiunto() {
      if (!OB || IMPOSSIBILE) return false;
      if (OB.tipo === 'lista') return stessoInsieme(frecce, OB.frecce);
      if (!eFunzione()) return false;
      if (OB.tipo === 'funzione') return true;
      if (OB.tipo === 'immagine') {
        const raggiunti = new Set();
        frecce.forEach((k) => raggiunti.add(Number(k.split('>')[1])));
        return stessoInsieme(raggiunti, OB.indici);
      }
      const inb = entranti();
      if (OB.tipo === 'iniettiva') return inb.every((c) => c <= 1);
      if (OB.tipo === 'suriettiva') return inb.every((c) => c >= 1);
      return inb.every((c) => c === 1);   // biunivoca
    }

    function verifica() {
      if (done) return;
      if (!obiettivoRaggiunto()) return;
      done = true;
      ctx.complete();
    }

    // ---- Geometria ----
    function layout() {
      const W = ctx.width;
      const nMax = Math.max(A.length, B.length, 1);

      // L'ovale deve contenere l'etichetta più lunga più il pallino.
      p.textSize(14);
      let maxLab = 0;
      A.concat(B).forEach((t) => { maxLab = Math.max(maxLab, p.textWidth(t)); });
      const minCorridoio = 56;   // spazio centrale per le frecce
      ovalW = Math.max(64, Math.min(maxLab + 46, (W - 2 * PAD - minCorridoio) / 2));

      ax = PAD + ovalW - 18;
      bx = W - PAD - ovalW + 18;

      ovalH = (nMax - 1) * NODE_GAP + 2 * NODE_R + 2 * OVAL_PADY;
      ovalTop = HEADER;
      y0 = ovalTop + OVAL_PADY + NODE_R;

      const hBottoni = mostraBottone() ? BTN_H + 10 : 0;
      ctx.setHeight(HEADER + ovalH + hBottoni + FOOTER + PAD);
    }

    function mostraBottone() {
      return editabile && !done;
    }

    /** y del pallino i-esimo, centrato verticalmente nell'ovale. */
    function nodeY(i, n) {
      const alt = (n - 1) * NODE_GAP;
      const cima = ovalTop + (ovalH - alt) / 2;
      return cima + i * NODE_GAP;
    }

    function posA(i) { return { x: ax, y: nodeY(i, A.length) }; }
    function posB(i) { return { x: bx, y: nodeY(i, B.length) }; }

    function nodoIn(px, py, quale) {
      const lista_ = quale === 'A' ? A : B;
      for (let i = 0; i < lista_.length; i++) {
        const q = quale === 'A' ? posA(i) : posB(i);
        if (Math.hypot(px - q.x, py - q.y) <= HIT_R) return i;
      }
      return -1;
    }

    /** Distanza punto-segmento: serve a capire quale freccia hai toccato. */
    function distSegmento(px, py, x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const l2 = dx * dx + dy * dy;
      if (l2 === 0) return Math.hypot(px - x1, py - y1);
      let t = ((px - x1) * dx + (py - y1) * dy) / l2;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    }

    function frecciaIn(px, py) {
      for (const k of frecce) {
        const [ia, ib] = k.split('>').map(Number);
        const a = posA(ia);
        const b = posB(ib);
        if (distSegmento(px, py, a.x, a.y, b.x, b.y) <= 8) return k;
      }
      return null;
    }

    // ---- Bottoni ----
    function buildButtons() {
      buttons = [];
      if (!mostraBottone()) return;
      p.textSize(13);
      const label = 'Cancella tutto';
      const w = p.textWidth(label) + 22;
      buttons.push({
        label,
        x: PAD,
        y: ovalTop + ovalH + 6,
        w,
        h: BTN_H,
        action: () => { frecce = new Set(); focusB = -1; },
      });
    }

    function bottoneIn(px, py) {
      for (const b of buttons) {
        if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return b;
      }
      return null;
    }

    // ---- Input: mouse e touch condividono gli stessi handler ----
    function pStart() {
      // Prima i bottoni: stanno sopra il diagramma.
      const b = bottoneIn(p.mouseX, p.mouseY);
      if (b) { b.action(); return true; }

      // Mettere a fuoco un elemento di B funziona anche in sola lettura: è
      // l'interazione con cui si legge la controimmagine.
      if (evidenzia === 'controimmagine') {
        const ib = nodoIn(p.mouseX, p.mouseY, 'B');
        if (ib >= 0) { focusB = focusB === ib ? -1 : ib; return true; }
      }

      if (!editabile || done) return false;

      const k = frecciaIn(p.mouseX, p.mouseY);
      if (k) { frecce.delete(k); return true; }

      const ia = nodoIn(p.mouseX, p.mouseY, 'A');
      if (ia >= 0) { dragging = true; daIdx = ia; return true; }
      return false;
    }

    function pEnd() {
      if (dragging) {
        const ib = nodoIn(p.mouseX, p.mouseY, 'B');
        if (ib >= 0) {
          const k = chiave(daIdx, ib);
          if (frecce.has(k)) frecce.delete(k);
          else frecce.add(k);
          verifica();
        }
      }
      dragging = false;
      daIdx = -1;
    }

    p.mousePressed = () => { pStart(); };
    p.mouseReleased = () => { pEnd(); };
    // Su touch blocchiamo lo scroll della pagina SOLO se il gesto ha davvero
    // preso qualcosa: un tocco sul vuoto deve continuare a far scorrere la
    // pagina, altrimenti il diagramma diventa una trappola su mobile.
    p.touchStarted = () => { const preso = pStart(); return !preso; };
    p.touchMoved = () => (dragging ? false : true);
    p.touchEnded = () => { pEnd(); return true; };

    // ---- Disegno ----
    p.setup = () => {
      COL_INK = cssVar('--ink', '#1B2A4A');
      COL_INKSOFT = cssVar('--ink-soft', '#5A6275');
      COL_CARTA = cssVar('--carta', '#FBFBF6');
      COL_GRID = cssVar('--grid', '#D7E0EC');
      COL_GREEN = cssVar('--spunta', '#1F9D55');
      COL_RED = cssVar('--rossa', '#D7263D');
      COL_SURF = cssVar('--surface', '#FFFFFF');
      p.createCanvas(ctx.width, ctx.height);
      // Il font prima del layout: la larghezza degli ovali si misura sulle
      // etichette, e p.textWidth risponde in base al font corrente.
      p.textFont('IBM Plex Mono, monospace');
      layout();
    };

    p.draw = () => {
      layout();        // riallinea a resize/rotazioni (idempotente)
      buildButtons();
      p.background(COL_CARTA);
      p.cursor(editabile && !done ? p.HAND : p.ARROW);
      drawHeader();
      drawOvali();
      drawFrecce();
      drawNodi();
      drawButtons();
      drawFooter();
    };

    function drawHeader() {
      p.push();
      p.noStroke();
      p.textAlign(p.LEFT, p.CENTER);
      if (title) {
        p.textSize(15);
        p.fill(done ? COL_GREEN : COL_INK);
        p.text((done ? '✓ ' : '') + title, PAD, HEADER / 2);
      }
      if (editabile) {
        p.fill(COL_INKSOFT);
        p.textSize(13);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text('Frecce: ' + frecce.size, p.width - PAD, HEADER / 2);
      }
      p.pop();
    }

    function drawOvali() {
      p.push();
      p.noFill();
      p.stroke(COL_GRID);
      p.strokeWeight(2);
      const r = Math.min(ovalW, ovalH) / 2;
      p.rect(PAD, ovalTop, ovalW, ovalH, r);
      p.rect(p.width - PAD - ovalW, ovalTop, ovalW, ovalH, r);

      p.noStroke();
      p.fill(COL_INKSOFT);
      p.textSize(12);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.text(NOME_A, PAD + ovalW / 2, ovalTop - 4);
      p.text(NOME_B, p.width - PAD - ovalW / 2, ovalTop - 4);
      p.pop();
    }

    function drawFrecce() {
      const inFuoco = evidenzia === 'controimmagine' && focusB >= 0;
      p.push();
      frecce.forEach((k) => {
        const [ia, ib] = k.split('>').map(Number);
        const a = posA(ia);
        const b = posB(ib);
        const acceso = !inFuoco || ib === focusB;
        const c = p.color(done ? COL_GREEN : COL_INK);
        if (!acceso) c.setAlpha(45);
        freccia(a.x + NODE_R + 2, a.y, b.x - NODE_R - 2, b.y, c, acceso ? 2 : 1.5);
      });
      // La freccia in costruzione segue il dito.
      if (dragging && daIdx >= 0) {
        const a = posA(daIdx);
        const c = p.color(COL_INKSOFT);
        c.setAlpha(150);
        freccia(a.x + NODE_R + 2, a.y, p.mouseX, p.mouseY, c, 2);
      }
      p.pop();
    }

    /** Freccia con punta: versore (ux,uy) e la sua perpendicolare (-uy,ux). */
    function freccia(x1, y1, x2, y2, col, peso) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const l = Math.hypot(dx, dy) || 1;
      const ux = dx / l;
      const uy = dy / l;
      const hx = -uy;
      const hy = ux;
      const H = 9;
      const L = 4.2;
      p.push();
      p.stroke(col);
      p.strokeWeight(peso);
      p.line(x1, y1, x2, y2);
      p.fill(col);
      p.noStroke();
      p.triangle(
        x2, y2,
        x2 - ux * H + hx * L, y2 - uy * H + hy * L,
        x2 - ux * H - hx * L, y2 - uy * H - hy * L,
      );
      p.pop();
    }

    function drawNodi() {
      const raggiunti = new Set();
      frecce.forEach((k) => raggiunti.add(Number(k.split('>')[1])));

      p.push();
      p.textSize(14);

      A.forEach((lab, i) => {
        const q = posA(i);
        p.stroke(done ? COL_GREEN : COL_INK);
        p.strokeWeight(2);
        p.fill(done ? COL_GREEN : COL_INK);
        p.circle(q.x, q.y, 2 * NODE_R);
        p.noStroke();
        p.fill(COL_INK);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(lab, q.x - NODE_R - 6, q.y + 1);
      });

      B.forEach((lab, i) => {
        const q = posB(i);
        // Con `evidenzia=immagine` i raggiunti sono pieni, gli altri vuoti:
        // l'immagine è la parte piena del codominio.
        const pieno = evidenzia === 'immagine' ? raggiunti.has(i) : true;
        const tinta = done ? COL_GREEN
          : (evidenzia === 'immagine' && pieno ? COL_GREEN : COL_INK);
        p.stroke(pieno ? tinta : COL_GRID);
        p.strokeWeight(2);
        if (pieno) p.fill(tinta); else p.noFill();
        p.circle(q.x, q.y, 2 * NODE_R);

        if (evidenzia === 'controimmagine' && focusB === i) {
          p.noFill();
          p.stroke(COL_INK);
          p.strokeWeight(2);
          p.circle(q.x, q.y, 2 * NODE_R + 12);
        }

        p.noStroke();
        p.fill(pieno ? COL_INK : COL_INKSOFT);
        p.textAlign(p.LEFT, p.CENTER);
        p.text(lab, q.x + NODE_R + 6, q.y + 1);
      });
      p.pop();
    }

    function drawButtons() {
      p.push();
      p.textSize(13);
      p.textAlign(p.CENTER, p.CENTER);
      for (const b of buttons) {
        p.stroke(COL_INK);
        p.strokeWeight(2);
        p.fill(COL_SURF);
        p.rect(b.x, b.y, b.w, b.h, 8);
        p.noStroke();
        p.fill(COL_INK);
        p.text(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
      }
      p.pop();
    }

    function drawFooter() {
      let testo = '';
      let colore = COL_INKSOFT;

      if (IMPOSSIBILE) {
        testo = IMPOSSIBILE;
        colore = COL_RED;
      } else if (done) {
        // Con `obiettivo=<lista>` il bersaglio può NON essere una funzione (è il
        // caso in cui la lezione fa vedere una macchina rotta): allora il
        // verdetto direbbe "non è una funzione" in verde. Meglio tacere.
        const v = verdetto();
        testo = v.ok ? v.testo : 'Il diagramma è quello giusto.';
        colore = COL_GREEN;
      } else if (mostraVerdetto && frecce.size > 0) {
        const v = verdetto();
        testo = v.testo;
        colore = v.ok ? COL_GREEN : COL_RED;
      } else if (editabile && frecce.size === 0) {
        testo = 'Trascina da un elemento di ' + NOME_A + ' a uno di ' + NOME_B + '.';
      } else if (evidenzia === 'controimmagine' && focusB < 0) {
        testo = 'Tocca un elemento di ' + NOME_B + '.';
      }
      if (!testo) return;

      p.push();
      p.noStroke();
      p.fill(colore);
      p.textSize(13);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(testo, p.width / 2, p.height - FOOTER / 2 - PAD / 2);
      p.pop();
    }
  };
})();
