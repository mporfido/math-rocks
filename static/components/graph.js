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
 *   data-bind: variabili che ridisegnano le curve, separate da virgola
 *
 * Layer curve:
 *   data-functions: JSON array di oggetti {expr, color?, xclip?}
 *     expr: espressione matematica (es: "sin(a*x)")
 *     xclip: "min,max" limita il dominio visualizzato della curva
 *
 * Layer punti obiettivo (trascinabili, goal tracking):
 *   data-points: JSON array di oggetti {target, snap?, tolerance?}
 *   data-snap: snap globale (sovrascritto dal valore per-punto)
 *   data-verify: "true" per il bottone Verifica (check esplicito)
 *   data-coords: "true" mostra le coordinate live accanto ai punti
 *   data-targets: "true" mostra i target in trasparenza
 *   id: identificativo per goal tracking (assegnato dal parser se c'è
 *     almeno un target)
 *
 * Layer punti bound al modello:
 *   data-boundpoints: JSON array di oggetti {x, y, label} dove x/y sono nomi
 *     di variabili del modello (es. da input editabili in una tabella). I
 *     punti si ridisegnano live quando le variabili cambiano. Non trascinabili.
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
      this.board = JXG.JSXGraph.initBoard(containerId, {
        boundingbox: [xmin, ymax, xmax, ymin],
        axis: true,
        showNavigation: true,
        showCopyright: false,
        keepaspectratio: true,
        // Ridisegna la board quando il contenitore cambia dimensione
        // (resize della finestra, rotazione del dispositivo su mobile).
        resize: { enabled: true, throttle: 200 },
        pan: { enabled: true },
        zoom: { enabled: true },
        defaultAxes: {
          x: { ticks: { ticksDistance: tickStep, insertTicks: false, minorTicks: 0 } },
          y: { ticks: { ticksDistance: tickStep, insertTicks: false, minorTicks: 0 } }
        }
      });

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

    const readVar = (name) => {
      const v = parseFloat(this.liveModel()[name]);
      return isNaN(v) ? NaN : v;
    };

    const jxgPoints = pointsData.map((cfg, index) => {
      const label = cfg.label || String.fromCharCode(65 + index); // A, B, C, ...
      return this.board.create('point', [
        () => readVar(cfg.x),
        () => readVar(cfg.y)
      ], {
        name: label,
        color: '#3498db',
        size: 5,
        fixed: true,         // guidati dagli input, non trascinabili
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

  // Aggiunge un pulsante "Verifica" sotto il grafico; chiama checkFn(btn) al click
  addVerifyButton(checkFn) {
    const btn = document.createElement('button');
    btn.textContent = 'Verifica';
    btn.className = 'graph-verify-btn';
    btn.addEventListener('click', () => checkFn(btn));
    this.appendChild(btn);
    return btn;
  }

  // Aggiunge un testo con le coordinate live accanto al punto
  addCoordsDisplay(point, label = '') {
    const prefix = label ? `${label} = ` : '';
    this.board.create('text', [
      () => point.X() + 0.3,
      () => point.Y() + 0.3,
      () => `${prefix}(${point.X().toFixed(1)}, ${point.Y().toFixed(1)})`
    ], { fontSize: 11, strokeColor: '#1f2937', highlight: false });
  }

  initPoints() {
    const pointsData = JSON.parse(this.dataset.points || '[]');
    const globalSnap = this.dataset.snap ? parseFloat(this.dataset.snap) : null;
    const showCoords = this.dataset.coords === 'true';
    const showTargets = this.dataset.targets === 'true';
    const verify = this.dataset.verify === 'true';
    const totalTargets = pointsData.filter(p => p.target).length;
    const completedSet = new Set();

    // Stato salvato: se questo grafico era già stato completato, ripristiniamo
    // i punti sui rispettivi target (le posizioni esatte coincidono coi target).
    const saved = window.courseProgress
      ? window.courseProgress.getStepForElement(this)
      : null;
    const savedDone = Boolean(saved && Array.isArray(saved.goals) && saved.goals.includes(this.id));

    // In verify mode: raccoglie {point, tx, ty, tolerance, index} per il check globale
    const verifyItems = [];

    pointsData.forEach((cfg, index) => {
      const label = String.fromCharCode(65 + index); // A, B, C, ...
      const targetStr = cfg.target || '';
      const hasTarget = Boolean(targetStr);
      const [tx, ty] = hasTarget ? targetStr.split(',').map(Number) : [0, 0];

      const snapStep = cfg.snap !== undefined ? parseFloat(cfg.snap) : globalSnap;
      const tolerance = cfg.tolerance !== undefined
        ? parseFloat(cfg.tolerance)
        : hasTarget ? (Math.abs(tx) + Math.abs(ty)) * 0.01 : 0;

      const point = this.board.create('point', [0, 0], {
        name: label,
        color: '#3498db',
        size: 5,
        snapToGrid: snapStep !== null,
        snapSizeX: snapStep ?? 1,
        snapSizeY: snapStep ?? 1,
        label: { offset: [10, 10] }
      });

      if (showCoords) this.addCoordsDisplay(point, label);

      if (hasTarget) {
        // Ripristino: posiziona il punto sul target e marcalo completato.
        if (savedDone) {
          point.setPosition(JXG.COORDS_BY_USER, [tx, ty]);
          point.setAttribute({ color: '#2ecc71' });
          completedSet.add(index);
        }

        if (showTargets) {
          this.board.create('point', [tx, ty], {
            name: label + '?',
            color: '#2ecc71',
            size: 6,
            fixed: true,
            opacity: 0.35,
            label: { offset: [10, 10] }
          });
        }

        if (verify) {
          verifyItems.push({ point, tx, ty, tolerance, index });
        } else {
          const check = () => {
            if (completedSet.has(index)) return;
            const dist = Math.sqrt((point.X() - tx) ** 2 + (point.Y() - ty) ** 2);
            if (dist <= tolerance) {
              completedSet.add(index);
              point.setAttribute({ color: '#2ecc71' });
              this.board.update();
              if (completedSet.size === totalTargets) {
                this.markComplete();
              }
            }
          };
          point.on('drag', check);
          point.on('up', check);
        }
      }
    });

    // Applica il ripristino dei punti completati e segna il goal come completato
    // senza dispatchare l'evento (x-step ricostruisce la contabilità da storage).
    if (savedDone) {
      this.setAttribute('data-completed', 'true');
      this.board.update();
    }

    if (verify && verifyItems.length > 0) {
      const verifyBtn = this.addVerifyButton((btn) => {
        // Tutti i punti devono essere corretti simultaneamente
        const allCorrect = verifyItems.every(({ point, tx, ty, tolerance }) => {
          const dist = Math.sqrt((point.X() - tx) ** 2 + (point.Y() - ty) ** 2);
          return dist <= tolerance;
        });

        if (allCorrect) {
          verifyItems.forEach(({ point }) => point.setAttribute({ color: '#2ecc71' }));
          this.board.update();
          btn.disabled = true;
          this.markComplete();
        } else {
          // Tutti lampeggiano rosso: nessuna info su quali sono giusti o sbagliati
          verifyItems.forEach(({ point }) => point.setAttribute({ color: '#ef4444' }));
          this.board.update();
          setTimeout(() => {
            verifyItems.forEach(({ point }) => point.setAttribute({ color: '#3498db' }));
            this.board.update();
          }, 900);
        }
      });

      // In ripristino, il check è già superato: disabilita il bottone.
      if (savedDone) {
        verifyBtn.disabled = true;
      }
    }
  }

  markComplete() {
    if (this.hasAttribute('data-completed')) return;
    this.setAttribute('data-completed', 'true');
    this.dispatchEvent(new CustomEvent('goal-complete', {
      bubbles: true,
      composed: true,
      detail: { goalId: this.id }
    }));
  }
}

customElements.define('x-graph', XGraph);
