/**
 * <x-variable> - Controllo interattivo per variabili
 *
 * Attributi:
 *   data-bind: nome variabile da modificare
 *   data-initial: valore iniziale
 *   data-display: "input" per un campo numerico editabile a mano (default: slider)
 *   data-min: valore minimo (solo slider)
 *   data-max: valore massimo (solo slider)
 *   data-step: incremento (solo slider)
 *
 * Eventi:
 *   variable-change: quando l'utente cambia il valore
 *   goal-complete: al primo cambiamento (segna come completato)
 */
class XVariable extends HTMLElement {
  connectedCallback() {
    const bind = this.dataset.bind;
    let initial = parseFloat(this.dataset.initial || 0);
    const min = parseFloat(this.dataset.min || -10);
    const max = parseFloat(this.dataset.max || 10);
    const step = parseFloat(this.dataset.step || 1);

    // Stato salvato: ripristina il valore corrente e lo stato di goal.
    const saved = window.courseProgress
      ? window.courseProgress.getStepForElement(this)
      : null;
    if (saved && saved.model && saved.model[bind] !== undefined) {
      const savedValue = parseFloat(saved.model[bind]);
      if (!isNaN(savedValue)) {
        initial = savedValue;
      }
    }
    const savedDone = Boolean(saved && Array.isArray(saved.goals) && saved.goals.includes(this.id));

    // Modalità campo numerico editabile a mano (senza slider)
    if (this.dataset.display === 'input') {
      this.renderNumberInput(bind, initial, savedDone);
      return;
    }

    this.innerHTML = `
      <span class="variable-control">
        <span class="variable-value">${initial}</span>
        <input type="range"
               class="variable-slider"
               value="${initial}"
               min="${min}"
               max="${max}"
               step="${step}">
      </span>
    `;

    const slider = this.querySelector('input');
    const display = this.querySelector('.variable-value');

    // Se questo slider era già stato mosso, marcalo completato senza evento
    // (la contabilità dei goal la ricostruisce x-step da storage).
    if (savedDone) {
      this.setAttribute('data-completed', 'true');
    }

    // Update display e model
    slider.addEventListener('input', () => {
      const value = parseFloat(slider.value);
      display.textContent = value;

      // Aggiorna modello dello step
      const step = this.closest('x-step');
      if (step && step.model) {
        step.model[bind] = value;
      }

      // Emetti evento per aggiornamenti custom
      this.dispatchEvent(new CustomEvent('variable-change', {
        bubbles: true,
        detail: { name: bind, value }
      }));
    });

    // Marca come completato al primo movimento
    let firstChange = true;
    slider.addEventListener('change', () => {
      if (firstChange && !this.hasAttribute('data-completed')) {
        firstChange = false;
        this.setAttribute('data-completed', 'true');
        this.dispatchEvent(new CustomEvent('goal-complete', {
          bubbles: true,
          detail: { goalId: this.id }
        }));
      }
    });
  }

  // Campo numerico editabile a mano: stessa logica di model/evento/persistenza
  // dello slider, cambia solo il markup (utile nelle celle di tabella x-y).
  renderNumberInput(bind, initial, savedDone) {
    this.innerHTML = `
      <input type="number" class="variable-input" value="${initial}" step="any">
    `;

    const input = this.querySelector('input');

    if (savedDone) {
      this.setAttribute('data-completed', 'true');
    }

    // Aggiorna model dello step ed emetti variable-change a ogni digitazione
    input.addEventListener('input', () => {
      const value = parseFloat(input.value);

      const step = this.closest('x-step');
      if (step && step.model) {
        step.model[bind] = value;
      }

      this.dispatchEvent(new CustomEvent('variable-change', {
        bubbles: true,
        detail: { name: bind, value }
      }));
    });

    // Marca come completato al primo valore inserito (commit del campo)
    let firstChange = true;
    input.addEventListener('change', () => {
      if (firstChange && !this.hasAttribute('data-completed')) {
        firstChange = false;
        this.setAttribute('data-completed', 'true');
        this.dispatchEvent(new CustomEvent('goal-complete', {
          bubbles: true,
          detail: { goalId: this.id }
        }));
      }
    });
  }
}

customElements.define('x-variable', XVariable);
