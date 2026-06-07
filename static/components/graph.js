/**
 * <x-graph> - Grafico interattivo basato su JSXGraph
 *
 * Attributi comuni:
 *   data-type: "function" | "point" | "points"
 *   data-xrange: "min,max" (default "-10,10")
 *   data-yrange: "min,max" (default "-7,7")
 *
 * type=function:
 *   data-expr: espressione matematica (es: "sin(a*x)")
 *   data-bind: variabili collegate allo slider, separate da virgola
 *
 * type=point:
 *   data-target: "x,y" coordinata obiettivo
 *   data-snap: step griglia (opzionale)
 *   id: identificativo per goal tracking
 *
 * type=points:
 *   data-points: JSON array di oggetti {target, snap, tolerance}
 *   data-snap: snap globale (sovrascritto dal valore per-punto)
 *   id: identificativo per goal tracking
 *
 * Eventi:
 *   goal-complete: quando il/i punto/i sono posizionati correttamente
 */
class XGraph extends HTMLElement {
  connectedCallback() {
    const type = this.dataset.type || 'function';
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
      this.board = JXG.JSXGraph.initBoard(containerId, {
        boundingbox: [xmin, ymax, xmax, ymin],
        axis: true,
        showNavigation: true,
        showCopyright: false,
        keepaspectratio: false,
        pan: { enabled: true },
        zoom: { enabled: true }
      });

      const step = this.closest('x-step');
      this.model = step?.model ?? {};

      if (type === 'function') {
        this.initFunction(step);
      } else if (type === 'point') {
        this.initPoint();
      } else if (type === 'points') {
        this.initPoints();
      }
    });
  }

  // Valuta un'espressione matematica con le variabili correnti del modello.
  // Le espressioni vengono dai file markdown dei corsi (input fidato, non utente).
  evalExpr(expr, x) {
    let code = expr;

    for (const [name, value] of Object.entries(this.model)) {
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

  initFunction(step) {
    const expr = this.dataset.expr || 'x';
    const bind = (this.dataset.bind || '').split(',').map(s => s.trim()).filter(Boolean);

    this.curve = this.board.create('functiongraph', [
      (x) => this.evalExpr(expr, x)
    ], {
      strokeColor: '#e74c3c',
      strokeWidth: 2.5,
      highlight: false
    });

    if (bind.length > 0 && step) {
      step.addEventListener('variable-change', (e) => {
        if (bind.includes(e.detail.name)) {
          this.model[e.detail.name] = e.detail.value;
          this.board.update();
        }
      });
    }
  }

  initPoint() {
    const targetStr = this.dataset.target || '';
    const hasTarget = Boolean(targetStr);

    const [tx, ty] = hasTarget ? targetStr.split(',').map(Number) : [0, 0];

    // Tolleranza esplicita nel markdown, oppure 1% della somma dei valori assoluti:
    // es. target (3,2) → (3+2)*0.01 = 0.05
    const tolerance = this.dataset.tolerance !== undefined
      ? parseFloat(this.dataset.tolerance)
      : (Math.abs(tx) + Math.abs(ty)) * 0.01;

    const snapStep = this.dataset.snap ? parseFloat(this.dataset.snap) : null;

    const point = this.board.create('point', [0, 0], {
      name: 'P',
      color: '#3498db',
      size: 5,
      snapToGrid: snapStep !== null,
      snapSizeX: snapStep ?? 1,
      snapSizeY: snapStep ?? 1,
      label: { offset: [10, 10] }
    });

    if (hasTarget) {
      this.board.create('point', [tx, ty], {
        name: '✓',
        color: '#2ecc71',
        size: 6,
        fixed: true,
        opacity: 0.35,
        label: { offset: [10, 10] }
      });

      let completed = false;
      point.on('drag', () => {
        const dist = Math.sqrt((point.X() - tx) ** 2 + (point.Y() - ty) ** 2);
        if (!completed && dist <= tolerance) {
          completed = true;
          point.setAttribute({ color: '#2ecc71' });
          this.board.update();
          this.markComplete();
        }
      });
    }
  }

  initPoints() {
    const pointsData = JSON.parse(this.dataset.points || '[]');
    const globalSnap = this.dataset.snap ? parseFloat(this.dataset.snap) : null;
    const totalTargets = pointsData.filter(p => p.target).length;
    const completedSet = new Set();

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

      if (hasTarget) {
        this.board.create('point', [tx, ty], {
          name: label + '?',
          color: '#2ecc71',
          size: 6,
          fixed: true,
          opacity: 0.35,
          label: { offset: [10, 10] }
        });

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
    });
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
