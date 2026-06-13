/**
 * <x-blank> - Campo di input con validazione
 *
 * Attributi:
 *   data-solution: risposta corretta (singola)
 *   data-choices: scelte multiple come array JSON (es: '["a","b","c"]')
 *   data-display: "dropdown" per il menu a tendina inline (altrimenti bottoni)
 *   data-accept: array JSON di risposte accettate per l'input testuale
 *   id: identificativo univoco per goal tracking
 *
 * Eventi:
 *   goal-complete: quando l'utente risponde correttamente
 */
class XBlank extends HTMLElement {
  connectedCallback() {
    const solution = this.dataset.solution;
    const choicesAttr = this.dataset.choices;

    // Stato salvato: se questo goal è già stato completato, lo ripristiniamo.
    const saved = window.courseProgress
      ? window.courseProgress.getStepForElement(this)
      : null;
    this.savedDone = Boolean(saved && Array.isArray(saved.goals) && saved.goals.includes(this.id));
    this.savedAnswer = saved && saved.answers ? saved.answers[this.id] : undefined;

    if (choicesAttr) {
      // data-choices è un array JSON; fallback su split('|') per robustezza.
      let choices;
      try {
        choices = JSON.parse(choicesAttr);
      } catch (e) {
        choices = choicesAttr.split('|');
      }
      if (this.dataset.display === 'dropdown') {
        this.renderDropdown(choices, solution);
      } else {
        this.renderMultipleChoice(choices, solution);
      }
    } else {
      this.renderTextInput(solution);
    }
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  renderTextInput(solution) {
    this.innerHTML = `
      <span class="blank-wrapper">
        <input type="text" class="blank-input" placeholder="...">
        <span class="blank-feedback"></span>
      </span>
    `;

    const input = this.querySelector('input');
    const feedback = this.querySelector('.blank-feedback');

    // Risposte accettate: lista JSON da data-accept, oppure la singola solution.
    // Normalizzate (trim + lowercase) per il confronto.
    let acceptList = [solution || ''];
    if (this.dataset.accept) {
      try {
        acceptList = JSON.parse(this.dataset.accept);
      } catch (e) {
        console.warn('x-blank: data-accept non valido', this.dataset.accept);
      }
    }
    const accepted = acceptList
      .map(s => String(s).trim().toLowerCase())
      .filter(Boolean);

    // Ripristino: riempi l'input e mostra il feedback senza dispatchare
    // goal-complete (la contabilità la fa x-step leggendo da storage).
    if (this.savedDone) {
      input.value = this.savedAnswer !== undefined ? this.savedAnswer : (solution || '');
      this.classList.add('correct');
      feedback.textContent = '✓';
      feedback.className = 'blank-feedback success';
      this.setAttribute('data-completed', 'true');
    }

    input.addEventListener('input', () => {
      const value = input.value.trim().toLowerCase();

      if (accepted.includes(value)) {
        this.classList.add('correct');
        this.classList.remove('incorrect');
        feedback.textContent = '✓';
        feedback.className = 'blank-feedback success';

        // Emetti evento per goal tracking
        this.markComplete(input.value.trim());
      } else if (value.length > 0) {
        this.classList.add('incorrect');
        this.classList.remove('correct');
        feedback.textContent = '✗';
        feedback.className = 'blank-feedback error';
      } else {
        this.classList.remove('correct', 'incorrect');
        feedback.textContent = '';
      }
    });
  }

  renderMultipleChoice(choices, solution) {
    this.innerHTML = `
      <span class="blank-choices">
        ${choices.map(choice => `
          <button class="choice-btn" data-value="${choice.trim()}">
            ${choice.trim()}
          </button>
        `).join('')}
      </span>
    `;

    const correctAnswer = solution ? solution.trim() : choices[0].trim();

    // Ripristino: marca il bottone corretto come selezionato senza eventi.
    if (this.savedDone) {
      const correctBtn = Array.from(this.querySelectorAll('button'))
        .find(b => b.dataset.value === correctAnswer);
      if (correctBtn) {
        correctBtn.classList.add('selected', 'correct');
      }
      this.classList.add('correct');
      this.setAttribute('data-completed', 'true');
    }

    this.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.value;
        const isCorrect = value === correctAnswer;

        // Reset altri bottoni
        this.querySelectorAll('button').forEach(b => {
          b.classList.remove('selected', 'correct', 'incorrect');
        });

        // Marca bottone cliccato
        btn.classList.add('selected');

        if (isCorrect) {
          btn.classList.add('correct');
          this.classList.add('correct');
          this.markComplete(value);
        } else {
          btn.classList.add('incorrect');
          this.classList.add('incorrect');
        }
      });
    });
  }

  renderDropdown(choices, solution) {
    const correctAnswer = solution ? solution.trim() : String(choices[0] || '').trim();

    const options = ['<option value="" disabled selected>— scegli —</option>']
      .concat(choices.map(choice => {
        const text = String(choice).trim();
        return `<option>${this.escapeHtml(text)}</option>`;
      }));

    this.innerHTML = `
      <span class="blank-select-wrapper">
        <select class="blank-select">${options.join('')}</select>
        <span class="blank-feedback"></span>
      </span>
    `;

    const select = this.querySelector('select');
    const feedback = this.querySelector('.blank-feedback');

    // Ripristino: imposta la selezione salvata (o la corretta) e marca ✓ senza eventi.
    if (this.savedDone) {
      select.value = this.savedAnswer !== undefined ? this.savedAnswer : correctAnswer;
      this.classList.add('correct');
      feedback.textContent = '✓';
      feedback.className = 'blank-feedback success';
      this.setAttribute('data-completed', 'true');
    }

    select.addEventListener('change', () => {
      const value = select.value;

      if (value === correctAnswer) {
        this.classList.add('correct');
        this.classList.remove('incorrect');
        feedback.textContent = '✓';
        feedback.className = 'blank-feedback success';
        this.markComplete(value);
      } else {
        this.classList.add('incorrect');
        this.classList.remove('correct');
        feedback.textContent = '✗';
        feedback.className = 'blank-feedback error';
      }
    });
  }

  markComplete(value) {
    // Emetti evento una volta sola
    if (this.hasAttribute('data-completed')) {
      return;
    }

    this.setAttribute('data-completed', 'true');

    this.dispatchEvent(new CustomEvent('goal-complete', {
      bubbles: true,
      composed: true,
      detail: { goalId: this.id, value }
    }));
  }
}

customElements.define('x-blank', XBlank);
