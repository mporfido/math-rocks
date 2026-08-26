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
      // Iniziale vuoto (`${y}{y||input}`) = "valore non ancora inserito", non
      // zero: il campo parte vuoto e il modello deve dire la stessa cosa, o un
      // grafico legato a quella variabile disegnerebbe un punto mai chiesto.
      const raw = variable.dataset.initial;
      const initial = (raw === undefined || raw.trim() === '') ? NaN : parseFloat(raw);
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

    this.querySelectorAll('x-p5[id]').forEach(p5 => {
      goals.push(p5.id);
    });

    this.querySelectorAll('x-smista[id]').forEach(smista => {
      goals.push(smista.id);
    });

    this.querySelectorAll('x-expr[id]').forEach(expr => {
      goals.push(expr.id);
    });

    this.querySelectorAll('x-theorem[id]').forEach(theorem => {
      goals.push(theorem.id);
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
    // Salva il contenuto originale di elementi che contengono marker
    // {{VAR:...}} o {{CALC:...}}: saranno i template degli aggiornamenti dinamici
    this.templates = new Map();

    const varPattern = /\{\{(VAR|CALC):[^}]+\}\}/;

    // Solo l'elemento PIÙ INTERNO che contiene un marker diventa template. Un
    // contenitore (per esempio un `:::div.reveal` che ospita sia una formula
    // con variabile sia un grafico) contiene il marker dei suoi figli, ma
    // rigenerarne l'innerHTML distruggerebbe i componenti vivi che ci stanno
    // dentro: un <x-graph> già inizializzato tornerebbe in pagina come stringa
    // congelata, e il suo contenitore JSXGraph resterebbe lì vuoto accanto al
    // grafico vero.
    const candidates = [...this.querySelectorAll('p, div, span, li, td, th')];
    const matching = candidates.filter(el => varPattern.test(el.innerHTML));

    matching.forEach((el, index) => {
      // Salta se ogni marker sta dentro un discendente che è già un template:
      // via i sottoalberi coperti, se non resta nessun marker "proprio" allora
      // qui non c'è niente da rigenerare.
      if (matching.some(other => other !== el && el.contains(other))) {
        const own = el.cloneNode(true);
        own.querySelectorAll('p, div, span, li, td, th').forEach(node => {
          if (varPattern.test(node.innerHTML)) node.remove();
        });
        if (!varPattern.test(own.innerHTML)) return;
      }

      const templateId = `template-${index}`;
      el.setAttribute('data-template-id', templateId);
      this.templates.set(templateId, el.innerHTML);
    });

    console.log(`Saved ${this.templates.size} templates with dynamic variables`);
  }

  initializeVariableDisplays() {
    // Sostituisce tutti i marker con i valori iniziali del modello
    // prima del primo rendering di MathJax
    this.querySelectorAll('[data-template-id]').forEach(el => {
      const templateId = el.getAttribute('data-template-id');
      const template = this.templates.get(templateId);

      if (template) {
        el.innerHTML = this.renderTemplate(template);
      }
    });

    console.log('Variable displays initialized with initial values');
  }

  /**
   * Espande i marker di un template con i valori correnti del modello:
   * {{VAR:nome:iniziale}} → valore, {{CALC:espressione}} → risultato del calcolo.
   * @param {string} template - HTML originale dell'elemento
   * @returns {string} - HTML con i marker sostituiti e la formula semplificata
   */
  renderTemplate(template) {
    // Un solo passaggio per VAR e CALC: gli offset dei marker vanno confrontati
    // con le zone matematiche del template ORIGINALE, e una prima sostituzione
    // le sposterebbe.
    const mathRanges = this.mathRanges(template);

    const html = template.replace(
      /\{\{VAR:([^:]+):([^}]+)\}\}|\{\{CALC:([^}]+)\}\}/g,
      (match, varName, initialValue, encodedExpression, offset) => {
        const inMath = mathRanges.some(([start, end]) => offset >= start && offset < end);

        if (encodedExpression !== undefined) {
          return this.toDecimalComma(this.evaluateExpression(encodedExpression), inMath);
        }

        // Usa il valore dal modello se disponibile, altrimenti quello del marker
        const value = this.model[varName] !== undefined ? this.model[varName] : initialValue;
        return this.toDecimalComma(this.formatValueForMath(value), inMath);
      }
    );

    // Semplifica la formula (rimuove parentesi non necessarie, normalizza segni)
    return this.simplifyFormula(html);
  }

  /**
   * Intervalli [inizio, fine) del testo racchiusi fra delimitatori LaTeX.
   * @param {string} text - HTML del template
   * @returns {Array<[number, number]>} - Zone matematiche
   */
  mathRanges(text) {
    const ranges = [];
    const pattern = /\$\$[\s\S]*?\$\$|\$[^$\n]*\$/g;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      ranges.push([match.index, match.index + match[0].length]);
    }
    return ranges;
  }

  /**
   * Separatore decimale all'italiana. In matematica si scrive `{,}`: una
   * virgola nuda in LaTeX è un separatore di lista e si porta dietro uno spazio
   * sottile ($2,6$ verrebbe composto come "2, 6"). Fuori dai delimitatori il
   * valore è testo normale, e lì la virgola si scrive com'è.
   * @param {string} rendered - Valore già formattato (può essere \square)
   * @param {boolean} inMath - true se il marker sta dentro $...$ o $$...$$
   * @returns {string} - Valore con la virgola al posto del punto decimale
   */
  toDecimalComma(rendered, inMath) {
    return rendered.replace(/(\d)\.(\d)/g, inMath ? '$1{,}$2' : '$1,$2');
  }

  /**
   * Calcola un'espressione ${= ...} sulle variabili del modello.
   * L'espressione arriva percent-encoded dal preprocessore (vedi
   * process_variables): così `*` e `_` attraversano il markdown senza
   * diventare corsivo.
   * @param {string} encodedExpression - Espressione percent-encoded
   * @returns {string} - Il risultato formattato, o \square se non calcolabile
   */
  evaluateExpression(encodedExpression) {
    let expression;
    try {
      expression = decodeURIComponent(encodedExpression);
    } catch (e) {
      expression = encodedExpression;
    }

    const model = { ...this.model };

    // Un campo svuotato mette NaN nel modello: meglio la casella vuota di un
    // "NaN" stampato dentro la formula.
    if (Object.values(model).some(value => typeof value === 'number' && isNaN(value))) {
      return '\\square';
    }

    try {
      let result;
      if (window.math && typeof window.math.evaluate === 'function') {
        result = window.math.evaluate(expression, model);
      } else {
        // Fallback: l'espressione vede solo le variabili del modello
        const varNames = Object.keys(model);
        const varValues = varNames.map(name => model[name]);
        // eslint-disable-next-line no-new-func
        result = new Function(...varNames, `return (${expression});`)(...varValues);
      }
      return this.formatComputedValue(result);
    } catch (e) {
      console.error('x-step: errore nel calcolo di', expression, e);
      return '\\square';
    }
  }

  /**
   * Formatta il risultato di un calcolo: arrotonda alla sesta cifra decimale
   * (0.1*0.1 non deve stampare 0.010000000000000002) senza lasciare zeri finali.
   * @param {*} value - Risultato della valutazione
   * @returns {string} - Numero formattato, o \square se non è un numero
   */
  formatComputedValue(value) {
    const numValue = typeof value === 'number' ? value : parseFloat(value);

    if (!isFinite(numValue)) {
      return '\\square';
    }

    return String(parseFloat(numValue.toFixed(6)));
  }

  formatValueForMath(value) {
    // Formatta il valore per l'inserimento in formule matematiche
    // Restituisce il valore numerico raw (senza parentesi)
    // La semplificazione algebrica è gestita da simplifyFormula()
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      // Campo svuotato (parseFloat('') → NaN) o valore non numerico: invece di
      // stampare "NaN" nella formula, mostra un segnaposto a casella (\square).
      // Una stringa non numerica reale (rara) viene comunque restituita com'è.
      const str = (value === null || value === undefined) ? '' : String(value).trim();
      return (str === '' || str.toLowerCase() === 'nan') ? '\\square' : str;
    }

    // Restituisci il valore raw (positivo o negativo)
    return numValue.toString();
  }

  updateVariableDisplays(varName, value) {
    // Aggiorna gli elementi che contengono marker per questa variabile, più
    // quelli con un calcolo (che può dipendere da qualsiasi variabile).
    // NB: niente flag 'g' — il pattern è usato con .test() dentro un forEach e
    // con 'g' .test() è stateful (lastIndex avanza), saltando elementi alternati.
    const varPattern = new RegExp(`\\{\\{VAR:${varName}:[^}]+\\}\\}|\\{\\{CALC:`);
    const elementsToUpdate = [];

    // Trova tutti gli elementi con template che contengono questa variabile
    this.querySelectorAll('[data-template-id]').forEach(el => {
      const templateId = el.getAttribute('data-template-id');
      const template = this.templates.get(templateId);

      // Aggiorna solo gli elementi che contengono questa variabile
      if (template && varPattern.test(template)) {
        // Sostituisci TUTTI i marker nel template (non solo quello corrente)
        // usando i valori aggiornati dal modello
        el.innerHTML = this.renderTemplate(template);
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
