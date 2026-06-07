/**
 * Sistema modulare di semplificazione formule matematiche
 *
 * Livello 1: Regex (sempre attivo) - gestisce segni algebrici e spazi
 * Livello 2: mathjs (opzionale, caricato su richiesta) - semplificazioni avanzate
 */
class FormulaSimplifier {
  constructor() {
    this.mathjsLoaded = false;
    this.mathjsLoading = false;
  }

  /**
   * Semplifica una formula usando il miglior metodo disponibile
   * @param {string} formula - La formula da semplificare
   * @param {Object} options - Opzioni di semplificazione
   * @returns {Promise<string>|string} - Formula semplificata
   */
  async simplify(formula, options = {}) {
    const { useMathjs = false } = options;

    // Livello 2: mathjs (se richiesto e disponibile)
    if (useMathjs && typeof math !== 'undefined') {
      return this.simplifyWithMathjs(formula);
    }

    // Livello 1: Regex (fallback, sempre disponibile)
    return this.simplifyWithRegex(formula);
  }

  /**
   * Livello 1: Semplificazione regex (lightweight)
   * Gestisce: segni algebrici, spazi, normalizzazione
   * @param {string} formula - La formula da semplificare
   * @returns {string} - Formula semplificata
   */
  simplifyWithRegex(formula) {
    const placeholders = [];
    let placeholderIndex = 0;

    // Proteggi i delimitatori LaTeX display $$...$$ sostituendoli con placeholder
    formula = formula.replace(/\$\$([^$]+)\$\$/g, (match, content) => {
      const simplified = this._applyRegexRules(content);
      const placeholder = `__LATEX_DISPLAY_${placeholderIndex}__`;
      placeholders[placeholderIndex] = `$$${simplified}$$`;
      placeholderIndex++;
      return placeholder;
    });

    // Proteggi i delimitatori LaTeX inline $...$ sostituendoli con placeholder
    formula = formula.replace(/\$([^$]+)\$/g, (match, content) => {
      const simplified = this._applyRegexRules(content);
      const placeholder = `__LATEX_INLINE_${placeholderIndex}__`;
      placeholders[placeholderIndex] = `$${simplified}$`;
      placeholderIndex++;
      return placeholder;
    });

    // Applica le regole al resto (fuori dai delimitatori LaTeX)
    formula = this._applyRegexRules(formula);

    // Ripristina i placeholder
    formula = formula.replace(/__LATEX_(DISPLAY|INLINE)_(\d+)__/g, (match, type, index) => {
      return placeholders[parseInt(index)];
    });

    return formula;
  }

  /**
   * Applica le regole regex di base (segni algebrici e spazi)
   * @param {string} text - Testo da processare
   * @returns {string} - Testo processato
   */
  _applyRegexRules(text) {
    let result = text;

    // Regola 1: + -numero → -numero (addizione con negativo diventa sottrazione)
    result = result.replace(/\+\s*(-[\d.]+)/g, ' $1');

    // Regola 2: - -numero → + numero (sottrazione con negativo diventa addizione)
    result = result.replace(/-\s*(-[\d.]+)/g, (match, num) => {
      return '+ ' + num.substring(1);
    });

    // Regola 3: Normalizza spazi multipli
    result = result.replace(/\s+/g, ' ').trim();

    // Regola 4: Pulisci spazi attorno operatori (mantieni leggibilità)
    result = result.replace(/\s*([+\-*/^=])\s*/g, ' $1 ');

    // Regola 5: Rimuovi spazi extra all'inizio e alla fine
    result = result.trim();

    return result;
  }

  /**
   * Livello 2: Semplificazione mathjs (avanzata)
   * Gestisce: frazioni, algebra, espressioni complesse
   * @param {string} formula - La formula da semplificare
   * @returns {string} - Formula semplificata
   */
  simplifyWithMathjs(formula) {
    try {
      // Prima semplifica frazioni numeriche (anche dentro LaTeX)
      formula = this._simplifyNumericFractionsInFormula(formula);

      // Poi prova a semplificare con mathjs (per espressioni algebriche)
      // Solo se non contiene delimitatori LaTeX (mathjs non li gestisce)
      if (!formula.includes('$')) {
        try {
          const node = math.simplify(formula);
          return node.toString();
        } catch (e) {
          // Se mathjs fallisce, restituisci la formula con frazioni semplificate
          return formula;
        }
      }

      return formula;
    } catch (e) {
      console.warn('mathjs simplification failed, using regex fallback:', e);
      return this.simplifyWithRegex(formula);
    }
  }

  /**
   * Semplifica frazioni numeriche sia dentro che fuori dai delimitatori LaTeX
   * @param {string} formula - Formula che può contenere LaTeX
   * @returns {string} - Formula con frazioni semplificate
   */
  _simplifyNumericFractionsInFormula(formula) {
    const placeholders = [];
    let placeholderIndex = 0;

    // Proteggi i delimitatori LaTeX display $$...$$ sostituendoli con placeholder
    formula = formula.replace(/\$\$([^$]+)\$\$/g, (match, content) => {
      const simplified = this._simplifyNumericFractions(content);
      const placeholder = `__LATEX_DISPLAY_${placeholderIndex}__`;
      placeholders[placeholderIndex] = `$$${simplified}$$`;
      placeholderIndex++;
      return placeholder;
    });

    // Proteggi i delimitatori LaTeX inline $...$ sostituendoli con placeholder
    formula = formula.replace(/\$([^$]+)\$/g, (match, content) => {
      const simplified = this._simplifyNumericFractions(content);
      const placeholder = `__LATEX_INLINE_${placeholderIndex}__`;
      placeholders[placeholderIndex] = `$${simplified}$`;
      placeholderIndex++;
      return placeholder;
    });

    // Semplifica frazioni fuori dai delimitatori LaTeX
    formula = this._simplifyNumericFractions(formula);

    // Ripristina i placeholder
    formula = formula.replace(/__LATEX_(DISPLAY|INLINE)_(\d+)__/g, (match, type, index) => {
      return placeholders[parseInt(index)];
    });

    return formula;
  }

  /**
   * Semplifica frazioni numeriche usando mathjs
   * Esempio: "4/8" → "1/2", "6/9" → "2/3"
   * @param {string} formula - Formula contenente frazioni
   * @returns {string} - Formula con frazioni semplificate
   */
  _simplifyNumericFractions(formula) {
    // Pattern per identificare frazioni numeriche: numero/numero
    const fractionPattern = /(\d+)\s*\/\s*(\d+)/g;

    const result = formula.replace(fractionPattern, (match, numerator, denominator) => {
      try {
        const num = parseInt(numerator);
        const den = parseInt(denominator);

        // Calcola il massimo comun divisore
        const gcd = this._gcd(num, den);

        // Semplifica la frazione
        const simplifiedNum = num / gcd;
        const simplifiedDen = den / gcd;

        console.log(`Simplifying fraction ${num}/${den} → ${simplifiedNum}/${simplifiedDen} (gcd: ${gcd})`);

        // Se il denominatore diventa 1, restituisci solo il numeratore
        if (simplifiedDen === 1) {
          return simplifiedNum.toString();
        }

        return `${simplifiedNum}/${simplifiedDen}`;
      } catch (e) {
        // Se qualcosa va storto, restituisci la frazione originale
        console.error('Error simplifying fraction:', e);
        return match;
      }
    });

    return result;
  }

  /**
   * Calcola il massimo comun divisore (algoritmo di Euclide)
   * @param {number} a - Primo numero
   * @param {number} b - Secondo numero
   * @returns {number} - MCD
   */
  _gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  /**
   * Carica mathjs dinamicamente (solo quando serve)
   * @returns {Promise<boolean>} - true se caricato con successo
   */
  async loadMathjs() {
    if (this.mathjsLoaded) {
      return true;
    }

    if (this.mathjsLoading) {
      // Aspetta che finisca il caricamento in corso
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.mathjsLoaded) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);
      });
    }

    this.mathjsLoading = true;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.4.0/math.min.js';
      script.async = true;

      script.onload = () => {
        this.mathjsLoaded = true;
        this.mathjsLoading = false;
        console.log('mathjs loaded successfully');
        resolve(true);
      };

      script.onerror = () => {
        this.mathjsLoading = false;
        console.error('Failed to load mathjs');
        reject(new Error('mathjs load failed'));
      };

      document.head.appendChild(script);
    });
  }
}

// Singleton globale
window.formulaSimplifier = new FormulaSimplifier();
