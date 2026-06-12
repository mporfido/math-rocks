/**
 * <x-step> - Container per uno step del corso
 *
 * Funzionalità:
 * - Goal tracking (monitora completamento elementi interattivi)
 * - Modello reattivo per variabili
 * - Reveal content quando tutti i goals sono completati
 */
class XStep extends HTMLElement {
  constructor() {
    super();
    this.model = {};  // Modello reattivo per variabili
    this.completedGoals = new Set();
    this.allGoals = [];
  }

  async connectedCallback() {
    // Controlla se questa pagina richiede mathjs per semplificazioni avanzate
    this.needsMathjs = this.hasAttribute('data-use-mathjs');

    console.log('Step connected. needsMathjs:', this.needsMathjs);

    // Stato persistito (risposte, goal, modello) — null se assente/non disponibile
    this.courseId = this.dataset.courseId;
    this.stepId = this.dataset.stepId;
    this.savedState = window.courseProgress
      ? window.courseProgress.getStep(this.courseId, this.stepId)
      : null;

    // Inizializza il modello con i valori iniziali delle variabili
    this.initializeModel();

    // Salva i template originali degli elementi con variabili dinamiche
    this.saveTemplates();

    // Se mathjs è necessario, caricalo prima di inizializzare le visualizzazioni
    if (this.needsMathjs && window.formulaSimplifier) {
      console.log('Loading mathjs before initialization...');
      try {
        await window.formulaSimplifier.loadMathjs();
        console.log('mathjs ready, initializing displays...');
      } catch (err) {
        console.warn('mathjs not available, using regex fallback:', err);
      }
    }

    // Sostituisci i marker con i valori iniziali
    this.initializeVariableDisplays();

    // Estrai goals da elementi interattivi
    this.allGoals = this.extractGoals();

    console.log(`Step initialized with ${this.allGoals.length} goals:`, this.allGoals);

    // Ripristina i goal salvati (filtrando quelli non più esistenti): i singoli
    // componenti hanno già ripristinato la propria UI nei loro connectedCallback,
    // qui si ricostruisce la contabilità centrale senza dispatchare eventi.
    if (this.savedState && Array.isArray(this.savedState.goals)) {
      this.savedState.goals
        .filter(g => this.allGoals.includes(g))
        .forEach(g => this.completedGoals.add(g));

      if (this.completedGoals.size === this.allGoals.length && this.allGoals.length > 0) {
        this.onAllGoalsComplete();
      }
    }

    // Step informativi (nessun elemento interattivo): completati alla
    // visualizzazione. Con un solo step per pagina, aprire la pagina equivale
    // a "vedere" lo step, quindi riceve subito la spunta nella navigazione.
    if (this.allGoals.length === 0) {
      this.onAllGoalsComplete();
    }

    // Listener per goal completions
    this.addEventListener('goal-complete', (e) => {
      this.handleGoalComplete(e.detail.goalId, e.detail.value);
    });

    // Listener per cambiamenti variabili
    this.addEventListener('variable-change', (e) => {
      // Aggiorna il modello reattivo
      this.model[e.detail.name] = e.detail.value;

      // Aggiorna le visualizzazioni
      this.updateVariableDisplays(e.detail.name, e.detail.value);

      // Persisti i valori degli slider (pochi numeri: nessun throttling)
      if (window.courseProgress) {
        window.courseProgress.saveModel(this.courseId, this.stepId, this.model);
      }
    });
  }

  initializeModel() {
    // Trova tutte le variabili e popola il modello con i valori iniziali
    this.querySelectorAll('x-variable').forEach(variable => {
      const bind = variable.dataset.bind;
      const initial = parseFloat(variable.dataset.initial || 0);
      if (bind) {
        this.model[bind] = initial;
      }
    });

    // Sovrascrivi con i valori salvati: le formule dinamiche ripartono dai
    // valori ripristinati senza altre modifiche.
    if (this.savedState && this.savedState.model) {
      Object.entries(this.savedState.model).forEach(([name, value]) => {
        if (this.model[name] !== undefined) {
          this.model[name] = value;
        }
      });
    }

    console.log('Model initialized:', this.model);
  }

  extractGoals() {
    const goals = [];

    // Goals di verifica: blanks, check, grafici interattivi (solo questi hanno id)
    this.querySelectorAll('x-blank[id]').forEach(blank => {
      goals.push(blank.id);
    });

    this.querySelectorAll('x-check[id]').forEach(check => {
      goals.push(check.id);
    });

    this.querySelectorAll('x-graph[id]').forEach(graph => {
      goals.push(graph.id);
    });

    // Gli slider contano come goal SOLO se non c'è verifica esplicita:
    // negli step di sola esplorazione muovere lo slider È il criterio di
    // completamento; quando un check/blank/grafico verifica la risposta,
    // gli slider sono solo strumenti e non devono bloccare la spunta.
    if (goals.length === 0) {
      this.querySelectorAll('x-variable[id]').forEach(variable => {
        goals.push(variable.id);
      });
    }

    return goals;
  }

  handleGoalComplete(goalId, value) {
    if (!this.allGoals.includes(goalId)) {
      return;  // Goal non tracciato (es. slider in uno step con verifica)
    }

    if (this.completedGoals.has(goalId)) {
      return;  // Già completato
    }

    this.completedGoals.add(goalId);

    // Persisti il goal (e l'eventuale risposta) appena completato
    if (window.courseProgress) {
      window.courseProgress.saveGoal(this.courseId, this.stepId, goalId, value);
    }

    console.log(`Goal completed: ${goalId} (${this.completedGoals.size}/${this.allGoals.length})`);

    // Controlla se tutti i goals sono completati
    if (this.completedGoals.size === this.allGoals.length && this.allGoals.length > 0) {
      this.onAllGoalsComplete();
    }
  }

  onAllGoalsComplete() {
    console.log('All goals completed! Revealing content...');

    // Mostra elementi "reveal" (nascosti fino a completamento)
    this.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('active');
    });

    // Persisti il completamento dello step (checkmark in sidebar)
    if (window.courseProgress) {
      window.courseProgress.markStepCompleted(this.courseId, this.stepId);
    }

    // Emetti evento
    this.dispatchEvent(new CustomEvent('step-complete', {
      bubbles: true,
      detail: { stepId: this.dataset.stepId }
    }));
  }

  saveTemplates() {
    // Salva il contenuto originale di elementi che contengono marker {{VAR:...}}
    // Questi saranno usati come template per aggiornamenti dinamici
    this.templates = new Map();

    const varPattern = /\{\{VAR:([^:]+):([^}]+)\}\}/;

    this.querySelectorAll('p, div, span, li').forEach((el, index) => {
      const html = el.innerHTML;
      if (varPattern.test(html)) {
        const templateId = `template-${index}`;
        el.setAttribute('data-template-id', templateId);
        this.templates.set(templateId, html);
      }
    });

    console.log(`Saved ${this.templates.size} templates with dynamic variables`);
  }

  initializeVariableDisplays() {
    // Sostituisce tutti i marker {{VAR:name:initial}} con i valori iniziali
    // prima del primo rendering di MathJax
    this.querySelectorAll('[data-template-id]').forEach(el => {
      const templateId = el.getAttribute('data-template-id');
      const template = this.templates.get(templateId);

      if (template) {
        // Sostituisci ogni marker con il suo valore iniziale (formattato)
        let newHtml = template.replace(
          /\{\{VAR:([^:]+):([^}]+)\}\}/g,
          (match, varName, initialValue) => {
            // Usa il valore dal modello se disponibile, altrimenti usa il valore iniziale dal marker
            const value = this.model[varName] !== undefined ? this.model[varName] : initialValue;
            return this.formatValueForMath(value);
          }
        );

        // Semplifica la formula (rimuove parentesi non necessarie, normalizza segni)
        newHtml = this.simplifyFormula(newHtml);

        el.innerHTML = newHtml;
      }
    });

    console.log('Variable displays initialized with initial values');
  }

  formatValueForMath(value) {
    // Formatta il valore per l'inserimento in formule matematiche
    // Restituisce il valore numerico raw (senza parentesi)
    // La semplificazione algebrica è gestita da simplifyFormula()
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return value.toString();
    }

    // Restituisci il valore raw (positivo o negativo)
    return numValue.toString();
  }

  updateVariableDisplays(varName, value) {
    // Aggiorna gli elementi che contengono marker per questa variabile
    const varPattern = new RegExp(`\\{\\{VAR:${varName}:[^}]+\\}\\}`, 'g');
    const elementsToUpdate = [];

    // Trova tutti gli elementi con template che contengono questa variabile
    this.querySelectorAll('[data-template-id]').forEach(el => {
      const templateId = el.getAttribute('data-template-id');
      const template = this.templates.get(templateId);

      // Aggiorna solo gli elementi che contengono questa variabile
      if (template && varPattern.test(template)) {
        // Sostituisci TUTTI i marker nel template (non solo quello corrente)
        // usando i valori aggiornati dal modello
        let newHtml = template.replace(
          /\{\{VAR:([^:]+):([^}]+)\}\}/g,
          (match, otherVarName, initialValue) => {
            // Usa il valore dal modello se disponibile, altrimenti usa il valore iniziale
            const value = this.model[otherVarName] !== undefined
              ? this.model[otherVarName]
              : initialValue;
            return this.formatValueForMath(value);
          }
        );

        // Semplifica la formula (gestisce segni algebrici)
        newHtml = this.simplifyFormula(newHtml);

        el.innerHTML = newHtml;
        elementsToUpdate.push(el);
      }
    });

    // Re-renderizza con MathJax
    if (elementsToUpdate.length > 0 && typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      MathJax.typesetClear(elementsToUpdate);
      MathJax.typesetPromise(elementsToUpdate).catch(err => {
        console.error('MathJax re-render error:', err);
      });
    }
  }

  /**
   * Semplifica una formula matematica rimuovendo parentesi non necessarie
   * e normalizzando i segni algebrici. Usa mathjs se disponibile e abilitato.
   * @param {string} formula - La formula da semplificare
   * @returns {string} - Formula semplificata
   */
  simplifyFormula(formula) {
    // Se il simplifier non è disponibile, restituisci la formula così com'è
    if (!window.formulaSimplifier) {
      console.warn('formulaSimplifier not available');
      return formula;
    }

    // Se mathjs è richiesto e disponibile, usalo (include semplificazione frazioni)
    if (this.needsMathjs && typeof math !== 'undefined') {
      console.log('Using mathjs simplification for:', formula);
      const result = window.formulaSimplifier.simplifyWithMathjs(formula);
      console.log('Result:', result);
      return result;
    }

    // Altrimenti usa semplificazione regex (solo segni algebrici)
    console.log('Using regex simplification for:', formula);
    return window.formulaSimplifier.simplifyWithRegex(formula);
  }
}

customElements.define('x-step', XStep);
