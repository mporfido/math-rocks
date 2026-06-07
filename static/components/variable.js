/**
 * <x-variable> - Slider interattivo per variabili
 *
 * Attributi:
 *   data-bind: nome variabile da modificare
 *   data-initial: valore iniziale
 *   data-min: valore minimo
 *   data-max: valore massimo
 *   data-step: incremento
 *
 * Eventi:
 *   variable-change: quando l'utente muove lo slider
 *   goal-complete: al primo movimento (segna come completato)
 */
class XVariable extends HTMLElement {
  connectedCallback() {
    const bind = this.dataset.bind;
    const initial = parseFloat(this.dataset.initial || 0);
    const min = parseFloat(this.dataset.min || -10);
    const max = parseFloat(this.dataset.max || 10);
    const step = parseFloat(this.dataset.step || 1);

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
}

customElements.define('x-variable', XVariable);
