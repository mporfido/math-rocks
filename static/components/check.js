/**
 * <x-check> - Bottone di verifica per condizioni su variabili del modello
 *
 * Attributi:
 *   data-condition: espressione da valutare (es. "m == 4", "a + b == 6")
 *
 * Contenuto testuale: label del bottone (es. "Verifica")
 *
 * Emette:
 *   goal-complete: quando la condizione è verificata (una sola volta)
 */
class XCheck extends HTMLElement {
  connectedCallback() {
    const condition = this.dataset.condition;
    const label = this.textContent.trim() || 'Verifica';

    this.innerHTML = `
      <span class="check-wrapper">
        <button class="check-btn">${label}</button>
        <span class="check-feedback"></span>
      </span>
    `;

    const btn = this.querySelector('.check-btn');
    const feedback = this.querySelector('.check-feedback');
    let completed = false;

    btn.addEventListener('click', () => {
      if (completed) return;

      const step = this.closest('x-step');
      const model = (step && step.model) ? { ...step.model } : {};

      let result = false;
      try {
        if (window.math && typeof window.math.evaluate === 'function') {
          result = Boolean(window.math.evaluate(condition, model));
        } else {
          // Fallback sicuro: la condizione accede solo alle variabili del modello
          const varNames = Object.keys(model);
          const varValues = varNames.map(k => model[k]);
          // eslint-disable-next-line no-new-func
          result = Boolean(new Function(...varNames, `return !!(${condition});`)(...varValues));
        }
      } catch (e) {
        console.error('x-check: errore nella valutazione della condizione:', e);
        result = false;
      }

      if (result) {
        completed = true;
        btn.disabled = true;
        btn.classList.add('correct');
        feedback.textContent = 'Esatto! ✓';
        feedback.className = 'check-feedback correct';
        this.dispatchEvent(new CustomEvent('goal-complete', {
          bubbles: true,
          detail: { goalId: this.id }
        }));
      } else {
        feedback.textContent = 'Riprova!';
        feedback.className = 'check-feedback incorrect';
        setTimeout(() => {
          feedback.textContent = '';
          feedback.className = 'check-feedback';
        }, 1500);
      }
    });
  }
}

customElements.define('x-check', XCheck);
