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
    let initial = parseFloat(this.dataset.initial || 0);
    const min = parseFloat(this.dataset.min || -10);
    const max = parseFloat(this.dataset.max || 10);
    const step = parseFloat(this.dataset.step || 1);

    // Stato salvato: ripristina la posizione dello slider e lo stato di goal.
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
}

customElements.define('x-variable', XVariable);
