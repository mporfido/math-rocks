/**
 * <x-graph> - Grafico interattivo basato su JSXGraph
 *
 * Le capacità del grafico sono layer componibili, attivi in base alla
 * presenza degli attributi:
 *
 * Attributi comuni:
 *   data-xrange: "min,max" (default "-10,10")
 *   data-yrange: "min,max" (default "-7,7")
 *   data-ticks: passo delle tacche sugli assi
 *   data-xticks / data-yticks: passo per singolo asse (vince su data-ticks)
 *   data-aspect: "free" per assi con scale indipendenti (default: equiscalati)
 *   data-bind: variabili che ridisegnano le curve, separate da virgola
 *   data-navigate: "true" per riattivare pan, zoom e barra di navigazione
 *     (default: vista fissa sulla finestra dichiarata)
 *
 * Layer curve:
 *   data-functions: JSON array di oggetti {expr, color?, xclip?}
 *     expr: espressione matematica (es: "sin(a*x)")
 *     xclip: "min,max" limita il dominio visualizzato della curva
 *
 * Layer punti obiettivo (inseriti col clic, goal tracking):
 *   data-points: JSON array di oggetti {target, tolerance?}
 *     Il piano parte vuoto: lo studente tocca per aggiungere un punto, lo
 *     trascina per spostarlo, lo tocca di nuovo per toglierlo. I punti non
 *     hanno etichetta e sono intercambiabili: conta l'insieme delle posizioni,
 *     non l'ordine in cui sono stati messi.
 *   data-snap: griglia di scatto dei punti
 *   data-tolerance: raggio di tolleranza di default attorno ai target
 *   data-verify: "true" per il bottone Verifica (check esplicito)
 *   data-coords: "true" mostra le coordinate live accanto ai punti
 *   data-targets: "true" mostra i target in trasparenza
 *   id: identificativo per goal tracking (assegnato dal parser se c'è
 *     almeno un target)
 *
 * Layer punti bound al modello:
 *   data-boundpoints: JSON array di oggetti {x, y, label} dove x/y sono nomi
 *     di variabili del modello (es. da input editabili in una tabella). I
 *     punti si ridisegnano live quando le variabili cambiano.
 *     Con {drag: true, start: "x,y"} il punto diventa trascinabile e il legame
 *     col modello va nei due sensi: trascinarlo riscrive le sue due variabili
 *     (e quindi slider, formule live e [Verifica]{check: …} nel testo).
 *   data-connect: "true" per unire i punti con una spezzata
 *
 * Eventi:
 *   goal-complete: quando il/i punto/i sono posizionati correttamente
 */
class XGraph extends HTMLElement {
  connectedCallback() {
    const [xmin, xmax] = (this.dataset.xrange || '-10,10').split(',').map(Number);
    const [ymin, ymax] = (this.dataset.yrange || '-7,7').split(',').map(Number);

    if (typeof JXG === 'undefined') {
      this.innerHTML = '<p class="graph-error">JSXGraph non disponibile.</p>';
      return;
    }

    const containerId = `jxg-${this.id || Math.random().toString(36).slice(2, 8)}`;
    const container = document.createElement('div');
    container.id = containerId;
    container.className = 'jxgbox graph-container';
    this.appendChild(container);

    // Differisce l'inizializzazione al frame successivo: garantisce che step.js
    // sia già eseguito (e x-step inizializzato con il suo model) prima che
    // JSXGraph chiami la funzione per disegnare la curva.
    requestAnimationFrame(() => {
      const tickStep = parseFloat(this.dataset.ticks || 1);
      const xTick = parseFloat(this.dataset.xticks || tickStep);
      const yTick = parseFloat(this.dataset.yticks || tickStep);

      // Di default le unità dei due assi hanno la stessa lunghezza in pixel: le
      // forme sono oneste (un cerchio è rotondo, una pendenza è quella che
      // sembra), ma JSXGraph allarga la boundingbox richiesta pur di ottenerlo.
      // Con grandezze non omogenee sui due assi (mesi ed euro, anni e abitanti)
      // questo schiaccia il grafico: lì l'autore scrive `aspect: free` e la
      // boundingbox viene rispettata alla lettera.
      // Attenzione: con `aspect: free` le distanze sui due assi non sono più
      // confrontabili, quindi la tolleranza di default dei punti trascinabili
      // (soglia unica in unità del modello, vedi initPoints) diventa anisotropa:
      // chi combina `aspect: free` e `points` indichi una `tolerance` esplicita.
      const keepAspect = this.dataset.aspect !== 'free';

      // Di default la vista è ferma: la finestra è quella di xrange/yrange e le
      // domande possono contarci. Soprattutto su mobile, dove JSXGraph pana con
      // un dito solo (col mouse invece chiede Shift): uno swipe verticale che
      // parte dal grafico trascinava il piano invece di scrollare la pagina.
      // Chi ha bisogno di esplorare la vista scrive `navigate: true`.
      const navigate = this.dataset.navigate === 'true';

      this.board = JXG.JSXGraph.initBoard(containerId, {
        boundingbox: [xmin, ymax, xmax, ymin],
        axis: true,
        showNavigation: navigate,
        showCopyright: false,
        keepaspectratio: keepAspect,
        // Ridisegna la board quando il contenitore cambia dimensione
        // (resize della finestra, rotazione del dispositivo su mobile).
        resize: { enabled: true, throttle: 200 },
        // `browserPan` è ciò che convince JSXGraph a rimettere
        // touch-action: pan-x pan-y sul container, invece di 'none', a ogni
        // pointerdown: è così che lo scroll della pagina torna al browser.
        browserPan: !navigate,
        // needShift solo per la rotella: con `navigate` il drag pana subito
        // (è il gesto che uno si aspetta), mentre la rotella nuda resta scroll
        // della pagina e lo zoom chiede Shift.
        pan: { enabled: navigate, needShift: false },
        zoom: { enabled: navigate, wheel: navigate, pinch: navigate },
        defaultAxes: {
          x: { ticks: { ticksDistance: xTick, insertTicks: false, minorTicks: 0 } },
          y: { ticks: { ticksDistance: yTick, insertTicks: false, minorTicks: 0 } }
        }
      });

      // JSXGraph scrive touch-action: none *inline* sul container quando
      // registra i pointer handler, e lo riscrive a ogni pointerdown: una regola
      // in components.css non vincerebbe mai, e la riassegnazione di browserPan
      // arriva troppo tardi per il primo tocco dopo il caricamento. Qui lo
      // impostiamo subito, così anche il primo swipe scrolla.
      if (!navigate) this.board.containerObj.style.touchAction = 'pan-x pan-y';

      const step = this.closest('x-step');
      this.step = step;
      this.model = step?.model ?? {};

      // Ogni layer è indipendente e disegna sulla stessa board: possono
      // coesistere in qualsiasi combinazione.
      if (this.dataset.functions) this.initFunctions();
      if (this.dataset.points) this.initPoints();
      if (this.dataset.boundpoints) this.initBoundPoints();

      // Listener unico per i cambi di variabile: le curve si ridisegnano solo
      // per le variabili in bind, i punti bound per qualsiasi variabile.
      const bind = (this.dataset.bind || '').split(',').map(s => s.trim()).filter(Boolean);
      const hasBoundPoints = Boolean(this.dataset.boundpoints);
      if (step && (bind.length > 0 || hasBoundPoints)) {
        step.addEventListener('variable-change', (e) => {
          const isBound = bind.includes(e.detail.name);
          if (isBound) this.liveModel()[e.detail.name] = e.detail.value;
          if (isBound || hasBoundPoints) this.board.update();
        });
      }

      // Ridisegno differito: se al primo disegno il modello dello step non era
      // ancora pronto (race di upgrade dei custom element), qui i valori —
      // anche quelli ripristinati da storage — sono certamente disponibili.
      requestAnimationFrame(() => this.board.update());
    });
  }

  // Modello live dello step: l'upgrade dei custom element può non essere
  // ancora completato quando il grafico cattura `step.model`, quindi lo
  // risolviamo a ogni accesso (con fallback sul modello locale).
  liveModel() {
    return this.step?.model ?? this.model ?? {};
  }

  // Valuta un'espressione matematica con le variabili correnti del modello.
  // Le espressioni vengono dai file markdown dei corsi (input fidato, non utente).
  evalExpr(expr, x) {
    let code = expr;

    for (const [name, value] of Object.entries(this.liveModel())) {
      code = code.replace(new RegExp(`\\b${name}\\b`, 'g'), `(${value})`);
    }
    code = code.replace(/\bx\b/g, `(${x})`);
    code = code.replace(/\^/g, '**');
    code = code.replace(/\b(sin|cos|tan|asin|acos|atan|sqrt|abs|exp|log)\b/g, 'Math.$1');
    code = code.replace(/\bpi\b/g, 'Math.PI');

    try {
      // eslint-disable-next-line no-new-func
      return Function(`"use strict"; return (${code});`)();
    } catch {
      return NaN;
    }
  }

  // Disegna le curve di data-functions. Ogni voce supporta:
  //   expr: espressione matematica
  //   xclip: "min,max" limita il dominio visualizzato della curva
  //   color: colore della curva (default a rotazione)
  initFunctions() {
    const functionsData = JSON.parse(this.dataset.functions || '[]');
    const defaultColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];

    this.curves = functionsData.map((cfg, i) => {
      const expr = cfg.expr || 'x';
      const color = cfg.color || defaultColors[i % defaultColors.length];
      const xclip = cfg.xclip ? String(cfg.xclip).split(',').map(Number) : null;
      return this.board.create('functiongraph', [
        (x) => {
          if (xclip && (x < xclip[0] || x > xclip[1])) return NaN;
          return this.evalExpr(expr, x);
        }
      ], {
        strokeColor: color,
        strokeWidth: 2.5,
        highlight: false
      });
    });
  }

  // Disegna punti le cui coordinate provengono da variabili del modello (es. input
  // editabili in una tabella x-y). Le coordinate sono funzioni: JSXGraph le rivaluta
  // a ogni board.update(), che invochiamo quando una variabile cambia.
  initBoundPoints() {
    const pointsData = JSON.parse(this.dataset.boundpoints || '[]');
    const connect = this.dataset.connect === 'true';

    // Una coordinata è un numero fisso (ascisse decise dall'autore), il nome di
    // una variabile del modello, oppure un'espressione in quelle variabili
    // (es. "2^a": il punto che scorre sulla curva mentre lo slider si muove).
    // I nomi non sono mai numeri, quindi non c'è ambiguità fra i primi due casi.
    const readVar = (coord) => {
      if (typeof coord === 'number') return coord;
      const testo = String(coord).trim();
      const fisso = parseFloat(testo);
      if (!isNaN(fisso) && testo === String(fisso)) return fisso;
      if (/^[A-Za-z_]\w*$/.test(testo)) {
        const v = parseFloat(this.liveModel()[testo]);
        return isNaN(v) ? NaN : v;
      }
      // Espressione: la valutiamo col modello corrente. Se una variabile non è
      // ancora definita resta un nome nudo nel codice e evalExpr rende NaN,
      // cioè il punto non esiste — esattamente come per un campo vuoto.
      const v = this.evalExpr(testo, NaN);
      return typeof v === 'number' ? v : NaN;
    };

    // Lo snap dei punti trascinabili è lo stesso di quelli inseriti a mano.
    // initPoints() lo assegna solo se esiste il layer `points`: qui il layer
    // può essere l'unico della board, quindi lo si rilegge dall'attributo.
    const snap = this.dataset.snap ? parseFloat(this.dataset.snap) : null;
    this.snapStep = this.snapStep ?? snap;

    const jxgPoints = pointsData.map((cfg, index) => {
      const label = cfg.label || String.fromCharCode(65 + index); // A, B, C, ...
      if (cfg.drag) return this.createDragPoint(cfg, label, snap);
      return this.board.create('point', [
        () => readVar(cfg.x),
        () => readVar(cfg.y)
      ], {
        name: label,
        color: '#3498db',
        size: 5,
        fixed: true,         // guidati dagli input, non trascinabili
        // Un campo ancora vuoto vale NaN: il punto non esiste finché non c'è
        // un numero, invece di finire chissà dove (o in (0,0), che sarebbe una
        // risposta suggerita).
        visible: () => Number.isFinite(readVar(cfg.x)) && Number.isFinite(readVar(cfg.y)),
        label: { offset: [10, 10] }
      });
    });

    // Spezzata che unisce i punti consecutivi (segue i punti perché vi è ancorata)
    if (connect && jxgPoints.length > 1) {
      for (let i = 0; i < jxgPoints.length - 1; i++) {
        this.board.create('segment', [jxgPoints[i], jxgPoints[i + 1]], {
          strokeColor: '#3498db',
          strokeWidth: 2,
          highlight: false
        });
      }
    }

  }

  /**
   * Boundpoint trascinabile: il legame col modello va nei due sensi.
   *
   * A differenza degli altri boundpoint le coordinate NON sono funzioni del
   * modello — un punto le cui coordinate sono calcolate non si può muovere, il
   * primo board.update() lo rimetterebbe dov'era. Qui il punto ha coordinate
   * proprie, e le due direzioni sono cucite a mano:
   *   trascinamento → scrive le due variabili (come farebbe uno slider);
   *   variabile cambiata da fuori (slider, campo) → sposta il punto.
   * `_sincronizzando` rompe l'anello: senza, ogni scrittura tornerebbe indietro.
   */
  createDragPoint(cfg, label, snap) {
    const nomeX = String(cfg.x).trim();
    const nomeY = String(cfg.y).trim();
    const model = this.liveModel();

    // Il modello vince sullo `start` (uno slider dichiarato nel testo, o un
    // valore ripristinato da storage, sa dove eravamo rimasti).
    const [sx, sy] = String(cfg.start || '0,0').split(',').map(Number);
    const x0 = Number.isFinite(parseFloat(model[nomeX])) ? parseFloat(model[nomeX]) : sx;
    const y0 = Number.isFinite(parseFloat(model[nomeY])) ? parseFloat(model[nomeY]) : sy;

    const point = this.board.create('point', [x0, y0], {
      name: label,
      color: '#e67e22',       // arancio: "questo si tocca", contro il blu dei guidati
      size: 6,
      fixed: false,
      snapToGrid: snap !== null,
      snapSizeX: snap ?? 1,
      snapSizeY: snap ?? 1,
      label: { offset: [10, 10] }
    });

    const scrivi = (nome, valore) => {
      const step = this.step;
      if (!step || !step.model || step.model[nome] === valore) return;
      step.model[nome] = valore;
      this.dispatchEvent(new CustomEvent('variable-change', {
        bubbles: true,
        detail: { name: nome, value: valore }
      }));
    };

    point.on('drag', () => {
      this._sincronizzando = true;
      scrivi(nomeX, this.snapValue(point.X()));
      scrivi(nomeY, this.snapValue(point.Y()));
      this._sincronizzando = false;
    });

    // Il modello parte allineato al punto, così ${bx} nel testo mostra subito un
    // numero invece di un quadratino vuoto. Ma non adesso: step.js è caricato
    // DOPO graph.js (vedi _assets.html), e fra i due c'è JSXGraph da rete —
    // quando questa board nasce, <x-step> può non essere ancora stato aggiornato
    // e il suo `model` non esiste (aspettare "un frame" non basta, il frame
    // arriva prima). L'unico segnale affidabile è la definizione dell'elemento.
    // È anche il momento in cui i valori ripristinati da storage sono leggibili,
    // e allora vincono loro: il punto torna dove lo studente l'aveva lasciato.
    customElements.whenDefined('x-step').then(() => {
      // Dove eravamo rimasti. Il modello di <x-step> non basta: initializeModel()
      // ripristina da storage solo le variabili che esistono già nel modello,
      // cioè quelle dichiarate da uno slider o da un campo. Una variabile che
      // nasce da questo punto non è fra quelle, quindi la si rilegge da qui —
      // come fanno gli altri componenti nel loro connectedCallback.
      const salvato = (window.courseProgress
        && window.courseProgress.getStepForElement(this)
        && window.courseProgress.getStepForElement(this).model) || {};
      const m = this.liveModel();
      const px = parseFloat(m[nomeX] !== undefined ? m[nomeX] : salvato[nomeX]);
      const py = parseFloat(m[nomeY] !== undefined ? m[nomeY] : salvato[nomeY]);

      if (Number.isFinite(px) && Number.isFinite(py)) {
        point.setPosition(JXG.COORDS_BY_USER, [px, py]);
        this.board.update();
        scrivi(nomeX, px);
        scrivi(nomeY, py);
        return;
      }
      scrivi(nomeX, x0);
      scrivi(nomeY, y0);
    });

    if (this.step) {
      this.step.addEventListener('variable-change', (e) => {
        if (this._sincronizzando) return;
        if (e.detail.name !== nomeX && e.detail.name !== nomeY) return;
        const m = this.liveModel();
        const nx = parseFloat(m[nomeX]);
        const ny = parseFloat(m[nomeY]);
        if (!Number.isFinite(nx) || !Number.isFinite(ny)) return;
        point.setPosition(JXG.COORDS_BY_USER, [nx, ny]);
        this.board.update();
      });
    }

    return point;
  }

  // Aggiunge un pulsante "Verifica" sotto il grafico; chiama checkFn(btn) al click
  addVerifyButton(checkFn) {
    const btn = document.createElement('button');
    btn.textContent = 'Verifica';
    btn.className = 'graph-verify-btn';
    btn.addEventListener('click', () => checkFn(btn));
    this.appendChild(btn);
    return btn;
  }

  // Aggiunge un testo con le coordinate live accanto al punto. Le coordinate
  // sono l'unica cosa che distingue un punto da un altro: niente lettere.
  addCoordsDisplay(point) {
    return this.board.create('text', [
      () => point.X() + 0.3,
      () => point.Y() + 0.3,
      () => `(${formatCoord(point.X())}; ${formatCoord(point.Y())})`
    ], { fontSize: 11, strokeColor: '#1f2937', highlight: false });
  }

  initPoints() {
    const pointsData = JSON.parse(this.dataset.points || '[]');
    const showTargets = this.dataset.targets === 'true';
    const verify = this.dataset.verify === 'true';
    const defaultTolerance = this.dataset.tolerance
      ? parseFloat(this.dataset.tolerance)
      : null;

    this.snapStep = this.dataset.snap ? parseFloat(this.dataset.snap) : null;
    this.showCoords = this.dataset.coords === 'true';
    this.userPoints = [];

    // I target sono posizioni, non punti: nessuno di loro è "il punto A". Il
    // controllo è sull'insieme (vedi matchPoints), quindi l'ordine della lista
    // conta solo per l'autore della lezione.
    this.targets = pointsData
      .filter(cfg => cfg.target)
      .map((cfg) => {
        const [tx, ty] = String(cfg.target).split(',').map(Number);
        const tolerance = cfg.tolerance !== undefined
          ? parseFloat(cfg.tolerance)
          : defaultTolerance !== null
            ? defaultTolerance
            // Soglia minima assoluta: con target nell'origine ("0,0") o vicino,
            // la tolleranza proporzionale sarebbe ~0 e il goal risulterebbe di
            // fatto incompletabile senza snap. 0.15 garantisce sempre un margine.
            : Math.max(0.15, (Math.abs(tx) + Math.abs(ty)) * 0.01);
        return { tx, ty, tolerance };
      });

    this.verifyMode = verify && this.targets.length > 0;

    if (showTargets) {
      this.targets.forEach(({ tx, ty }) => {
        this.board.create('point', [tx, ty], {
          name: '',
          withLabel: false,
          color: '#2ecc71',
          size: 6,
          fixed: true,
          highlight: false,
          opacity: 0.35
        });
      });
    }

    this.hint = document.createElement('p');
    this.hint.className = 'graph-hint';
    this.appendChild(this.hint);

    if (this.verifyMode) {
      this.verifyBtn = this.addVerifyButton(btn => this.runVerify(btn));
    }

    this.enablePointPlacing();

    // Stato salvato: se questo grafico era già stato completato, ricreiamo i
    // punti sui target e segniamo il goal senza dispatchare l'evento (x-step
    // ricostruisce la contabilità da storage).
    const saved = window.courseProgress
      ? window.courseProgress.getStepForElement(this)
      : null;
    if (saved && Array.isArray(saved.goals) && saved.goals.includes(this.id)) {
      this.targets.forEach(({ tx, ty }) => this.addUserPoint(tx, ty));
      this.setAttribute('data-completed', 'true');
      this.freezePoints();
    }

    this.refreshPoints();
  }

  // Il piano parte vuoto: un tocco sul vuoto aggiunge un punto, un tocco su un
  // punto lo toglie, un trascinamento lo sposta.
  enablePointPlacing() {
    this.pointerClaimed = false;
    let downAt = null;

    this.board.on('down', (e) => {
      downAt = this.pointerPixels(e);
    });

    this.board.on('up', (e) => {
      const from = downAt;
      downAt = null;

      // Il down è stato preso da un punto esistente: quello è un trascinamento
      // o una rimozione, non un inserimento. JSXGraph avvisa gli elementi prima
      // della board sul down e dopo sull'up, quindi il flag lo alza il punto e
      // lo azzera qui, a gesto finito.
      if (this.pointerClaimed) {
        this.pointerClaimed = false;
        return;
      }

      if (this.hasAttribute('data-completed')) return;
      // Un gesto che ha spostato il puntatore è un pan (o uno swipe di scroll),
      // non un tocco: non deve lasciare punti per strada.
      const to = this.pointerPixels(e);
      if (from && to && Math.hypot(to[0] - from[0], to[1] - from[1]) > 6) return;
      // Più punti che target non è un disegno libero: è un modo per completare
      // l'esercizio cospargendo il piano. Per cambiarne uno si toglie il vecchio.
      if (this.targets.length && this.userPoints.length >= this.targets.length) return;

      const [x, y] = this.board.getUsrCoordsOfMouse(e);
      this.addUserPoint(this.snapValue(x), this.snapValue(y));
      this.refreshPoints(true);
    });
  }

  pointerPixels(e) {
    try {
      return this.board.getMousePosition(e);
    } catch {
      return null;
    }
  }

  snapValue(value) {
    const snap = this.snapStep;
    return snap ? Math.round(value / snap) * snap : value;
  }

  addUserPoint(x, y) {
    const snap = this.snapStep;
    const point = this.board.create('point', [x, y], {
      name: '',
      withLabel: false,
      color: '#3498db',
      size: 5,
      snapToGrid: snap !== null,
      snapSizeX: snap ?? 1,
      snapSizeY: snap ?? 1
    });

    // Tocco e trascinamento sono lo stesso gesto: quello che li distingue è se
    // il punto si è mosso. JSXGraph emette 'drag' solo quando si muove davvero,
    // quindi un tocco fermo (anche lungo) resta un tocco, e un trascinamento
    // che torna al punto di partenza resta un trascinamento.
    let moved = false;
    point.on('down', () => {
      this.pointerClaimed = true;
      moved = false;
    });
    // Durante il trascinamento si aggiorna solo il colore: il goal si decide a
    // punto fermo, così non si blocca un punto che il dito sta ancora muovendo.
    point.on('drag', () => {
      moved = true;
      this.refreshPoints();
    });
    point.on('up', () => {
      const tap = !moved;
      moved = false;
      if (this.hasAttribute('data-completed')) return;
      if (tap) this.removeUserPoint(point);
      else this.refreshPoints(true);
    });

    const text = this.showCoords ? this.addCoordsDisplay(point) : null;
    // Anche l'etichetta delle coordinate copre il punto: un tocco lì non deve
    // diventare l'inserimento di un punto nuovo.
    if (text) text.on('down', () => { this.pointerClaimed = true; });

    this.userPoints.push({ point, text });
    return point;
  }

  removeUserPoint(point) {
    const index = this.userPoints.findIndex(item => item.point === point);
    if (index === -1) return;
    const { text } = this.userPoints[index];
    this.userPoints.splice(index, 1);
    // Fuori dal listener che ci ha portati qui: la rimozione avviene mentre
    // JSXGraph sta ancora iterando gli oggetti coinvolti nel gesto.
    requestAnimationFrame(() => {
      // Il testo delle coordinate rilegge point.X()/Y() a ogni update: va tolto
      // insieme al punto, o resta appeso a un oggetto che non esiste più.
      if (text) this.board.removeObject(text);
      this.board.removeObject(point);
      this.refreshPoints(true);
    });
  }

  // Accoppia punti e target senza guardare l'ordine: restituisce gli indici dei
  // punti che coprono un target. Greedy dalla coppia più vicina — con dischi di
  // tolleranza disgiunti (l'unico caso sensato per un esercizio) coincide con
  // l'accoppiamento ottimo.
  matchPoints() {
    const pairs = [];
    this.targets.forEach((t, ti) => {
      this.userPoints.forEach(({ point }, pi) => {
        const dist = Math.hypot(point.X() - t.tx, point.Y() - t.ty);
        if (dist <= t.tolerance) pairs.push({ ti, pi, dist });
      });
    });
    pairs.sort((a, b) => a.dist - b.dist);

    const usedTargets = new Set();
    const usedPoints = new Set();
    for (const { ti, pi } of pairs) {
      if (usedTargets.has(ti) || usedPoints.has(pi)) continue;
      usedTargets.add(ti);
      usedPoints.add(pi);
    }
    return usedPoints;
  }

  // Un punto per target, e ogni punto su un target diverso: senza il vincolo
  // sul numero basterebbe riempire il piano di punti per completare il goal.
  isPointsComplete(matched = this.matchPoints()) {
    return this.targets.length > 0
      && matched.size === this.targets.length
      && this.userPoints.length === this.targets.length;
  }

  // Ricalcolata a ogni aggiunta, rimozione e trascinamento: il colore racconta
  // lo stato vivo, non un traguardo raggiunto una volta. `settled` distingue il
  // gesto finito (può chiudere il goal) dal trascinamento in corso.
  refreshPoints(settled = false) {
    const matched = this.matchPoints();
    if (settled && !this.verifyMode && this.isPointsComplete(matched)) this.markComplete();

    const done = this.hasAttribute('data-completed');
    this.userPoints.forEach(({ point }, index) => {
      // In verify mode il colore non anticipa la risposta: i punti restano
      // neutri finché non si preme il bottone.
      const right = done || (!this.verifyMode && matched.has(index));
      point.setAttribute({ color: right ? '#2ecc71' : '#3498db' });
    });
    this.board.update();

    if (this.verifyBtn) {
      this.verifyBtn.disabled = done || this.userPoints.length !== this.targets.length;
    }
    this.updateHint();
  }

  runVerify(btn) {
    if (this.isPointsComplete()) {
      btn.disabled = true;
      this.markComplete();
      this.updateHint();
      return;
    }

    // Tutti lampeggiano rosso: nessuna info su quali sono giusti o sbagliati
    this.userPoints.forEach(({ point }) => point.setAttribute({ color: '#ef4444' }));
    this.board.update();
    setTimeout(() => {
      this.userPoints.forEach(({ point }) => point.setAttribute({ color: '#3498db' }));
      this.board.update();
    }, 900);
  }

  // A goal raggiunto i punti si bloccano: un trascinamento non deve "scompletare"
  // visivamente un esercizio già chiuso.
  freezePoints() {
    this.userPoints.forEach(({ point }) => {
      point.setAttribute({ fixed: true, color: '#2ecc71' });
    });
    this.board.update();
  }

  updateHint() {
    if (!this.hint) return;
    if (this.hasAttribute('data-completed')) {
      this.hint.hidden = true;
      return;
    }
    const base = 'Tocca il piano per aggiungere un punto, tocca un punto per toglierlo';
    this.hint.textContent = this.targets.length
      ? `${base} — ${this.userPoints.length}/${this.targets.length}`
      : base;
  }

  markComplete() {
    if (this.hasAttribute('data-completed')) return;
    this.setAttribute('data-completed', 'true');
    if (this.userPoints) this.freezePoints();
    this.dispatchEvent(new CustomEvent('goal-complete', {
      bubbles: true,
      composed: true,
      detail: { goalId: this.id }
    }));
  }
}

// 3 -> "3", 2.5 -> "2,5": virgola decimale, e per questo le coordinate sono
// separate da punto e virgola.
function formatCoord(value) {
  return String(Math.round(value * 100) / 100).replace('.', ',');
}

customElements.define('x-graph', XGraph);
