/**
 * Aritmetica razionale esatta — nucleo condiviso dei componenti algebrici.
 *
 * Vive qui e non dentro un componente perché serve a più di uno: `<x-expr>`
 * (espressioni e potenze) e il futuro componente di manipolazione algebrica
 * devono contare allo stesso modo, altrimenti due schede sulla stessa frazione
 * danno due risposte diverse.
 *
 * Il file vale in due ambienti:
 *   - nel browser è uno script classico e popola il namespace `window.Algebra`,
 *     che i file successivi di `static/lib/` estendono (non lo sostituiscono);
 *   - in Node è un modulo CommonJS, così `tests/js/` lo può provare senza DOM.
 *
 * Tutto sta dentro una IIFE, come gli altri file di `static/lib/`. Non è
 * cosmesi: fra due `<script>` classici lo scope lessicale globale è UNO, quindi
 * un `const Rational` qui fuori collide con il `const { Rational } = ...` di
 * `components/expr.js` e il browser rifiuta di parsare il secondo file — il
 * componente non si registra e la scheda resta muta, senza niente a schermo che
 * dica perché. Fuori di qui passa solo il namespace.
 *
 * L'aritmetica è ESATTA: le frazioni non diventano mai decimali. È un vincolo
 * didattico, non un vezzo — `1/3` deve restare `1/3` fino in fondo.
 *
 * Esatta però FIN DOVE: `num` e `den` sono `Number`, cioè float a 64 bit, che
 * rappresentano gli interi senza perderne un pezzo solo fino a 2^53. Oltre, il
 * risultato viene arrotondato in silenzio — `3^40` diventa un intero plausibile
 * e sbagliato di 199 — e, peggio, `2^60` e `2^60 + 1` diventano lo STESSO
 * numero. Siccome `equivalenti()` confronta proprio questi due campi, lassù
 * l'oracolo direbbe "sì, equivalente" a due scritture che non lo sono, e
 * l'invariante del componente («gli stati non equivalenti sono irraggiungibili»)
 * cadrebbe senza che nulla lo segnali.
 *
 * Quindi il confine si dichiara invece di scoprirlo: fuori si solleva. Non
 * allarga ciò che si sa calcolare — lo rende onesto. È la stessa scelta che
 * `safeEvaluate()` in `components/expr.js` fa già per le potenze, dove un
 * risultato che non entra nei numeri esatti resta in forma simbolica.
 */

(function () {
// Limiti di sicurezza sull'input. In una lezione l'espressione la scrive
// l'autore, ma la stessa espressione può arrivare dai parametri di un URL
// (pagina-strumento), quindi non è più input fidato: senza questi limiti un
// link con `9^999999999` o un numero di 300 cifre bloccherebbe il browser.
const MAX_EXPR_LENGTH = 500;   // caratteri dell'espressione
const MAX_EXPONENT = 4096;     // valore assoluto dell'esponente calcolabile
const MAX_DIGITS = 15;         // cifre di un singolo numero letterale

/**
 * L'intero è ancora nella zona in cui i conti sono esatti?
 *
 * Basta controllare il RISULTATO. Gli operandi sono sempre `Rational` già
 * validati, quindi sicuri; e il prodotto (o la somma) di due interi sicuri, se
 * viene arrotondato, finisce sempre oltre 2^53 in valore assoluto. Non è
 * un'euristica che prende quasi tutto: è tutto ciò che può capitare qui.
 */
function esigiEsatto(n) {
  if (!Number.isSafeInteger(n)) {
    throw new Error('Numeri troppo grandi: oltre 2^53 i conti non sarebbero più esatti');
  }
  return n;
}

/** Massimo comun divisore, sempre > 0 (gcd(0, 0) vale 1: usato per ridurre). */
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

/** Numero razionale esatto. Il denominatore è sempre > 0 e la frazione ridotta. */
class Rational {
  constructor(num, den = 1) {
    // Il controllo sta QUI e non nelle quattro operazioni perché ogni
    // operazione finisce a costruire un Rational: un posto solo, e nessuna
    // strada che lo aggiri. Va prima di `gcd`, che su un valore già arrotondato
    // (o su un Infinity) non ridurrebbe niente di sensato.
    esigiEsatto(num);
    esigiEsatto(den);
    if (den === 0) throw new Error('Divisione per zero');
    if (den < 0) {
      num = -num;
      den = -den;
    }
    const g = gcd(num, den);
    this.num = num / g;
    this.den = den / g;
  }

  add(o) { return new Rational(this.num * o.den + o.num * this.den, this.den * o.den); }
  sub(o) { return new Rational(this.num * o.den - o.num * this.den, this.den * o.den); }
  mul(o) { return new Rational(this.num * o.num, this.den * o.den); }
  div(o) {
    if (o.num === 0) throw new Error('Divisione per zero');
    return new Rational(this.num * o.den, this.den * o.num);
  }

  /** Potenza a esponente intero (anche negativo). */
  pow(exp) {
    if (!Number.isInteger(exp)) throw new Error('Esponente non intero');
    // Guardia: il calcolo è un ciclo di moltiplicazioni, quindi un esponente
    // enorme bloccherebbe la pagina. Oltre il limite il risultato uscirebbe
    // comunque dai double esatti: meglio dichiararlo subito. Serve soprattutto
    // fuori dai corsi, dove l'espressione può arrivare da un URL.
    if (Math.abs(exp) > MAX_EXPONENT) throw new Error('Esponente troppo grande');
    if (exp < 0) return new Rational(1).div(this.pow(-exp));
    let result = new Rational(1);
    for (let i = 0; i < exp; i++) result = result.mul(this);
    return result;
  }

  equals(o) { return o instanceof Rational && this.num === o.num && this.den === o.den; }

  isInteger() { return this.den === 1; }

  /** Rappresentazione LaTeX: intero oppure \frac{}{} (segno fuori dalla frazione). */
  toLatex() {
    if (this.den === 1) return String(this.num);
    const sign = this.num < 0 ? '-' : '';
    return `${sign}\\frac{${Math.abs(this.num)}}{${this.den}}`;
  }

  /** Rappresentazione testuale lineare (per i marker / debug). */
  toString() {
    return this.den === 1 ? String(this.num) : `${this.num}/${this.den}`;
  }
}

// --- Esportazione nei due ambienti ------------------------------------------
// Il namespace si ESTENDE, non si sostituisce: gli altri file di static/lib/
// aggiungono le loro cose allo stesso oggetto, in qualunque ordine siano
// caricati.
const Algebra = { MAX_EXPR_LENGTH, MAX_EXPONENT, MAX_DIGITS, gcd, esigiEsatto, Rational };

if (typeof window !== 'undefined') {
  window.Algebra = Object.assign(window.Algebra || {}, Algebra);
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Algebra;
}
})();
