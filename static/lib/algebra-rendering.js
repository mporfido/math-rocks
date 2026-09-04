/**
 * Dall'albero al DOM — la scrittura che si tocca.
 *
 * Ogni nodo diventa uno `<span data-nodo="id">`: è così che un click sa cosa ha
 * colpito e un trascinamento sa che cosa sta spostando. Nessun MathJax
 * sull'equazione viva: `<x-expr>` ha già scelto questa strada (span propri,
 * operatori in testo semplice) proprio per avere hover e click coerenti, e qui
 * serve di più, perché i pezzi non si cliccano soltanto — si spostano.
 *
 * Per i polinomi la tipografia che serve è poca: apici per gli esponenti,
 * frazioni impilate, corsivo per le lettere. In cambio si guadagna una cosa che
 * la scrittura lineare non ha: **la barra di frazione raggruppa da sola**.
 * `(2x + 6) / 3` a schermo non ha bisogno di parentesi, e la divisione "da
 * lavagna" si legge come sul quaderno.
 *
 * Produce una stringa di HTML invece di elementi: così si prova senza un
 * browser. Chi la usa fa `elemento.innerHTML = rendiHTML(albero)`.
 */

(function (host, base) {
  if (!base || !base.parse) {
    throw new Error('algebra-rendering.js: static/lib/algebra-parser.js va caricato prima (vedi templates/_assets.html)');
  }

  // Precedenze per decidere le parentesi. Diverse da quelle della scrittura
  // lineare, ed è il punto: frazione e potenza qui si raggruppano da sole
  // (barra e apice), quindi valgono come atomi e non chiedono parentesi.
  const PREC = { '+': 1, '-': 1, '*': 2, '/': 9, '^': 9 };
  const PREC_NEG = 1.5;
  const MENO = '−';   // meno tipografico, non il trattino
  const PER = '·';

  const prec = (n) => {
    if (n.type === 'op') return PREC[n.op];
    if (n.type === 'neg') return PREC_NEG;
    return 9;
  };

  const apri = (n, dentro) =>
    '<span class="alg-n alg-' + n.type + '" data-nodo="' + n.id + '">' + dentro + '</span>';

  const parentesi = (dentro) =>
    '<span class="alg-par">(</span>' + dentro + '<span class="alg-par">)</span>';

  /** Un intero, col segno tipografico giusto. */
  const intero = (v) => (v < 0 ? MENO + Math.abs(v) : String(v));

  function frazione(sopra, sotto) {
    return '<span class="alg-frazione">'
      + '<span class="alg-sopra">' + sopra + '</span>'
      + '<span class="alg-sotto">' + sotto + '</span>'
      + '</span>';
  }

  function rendiNodo(n) {
    switch (n.type) {
      case 'num': {
        if (n.den === 1) return apri(n, intero(n.num));
        // Il segno esce dalla frazione: `−2/3`, non una frazione col meno sopra.
        const segno = n.num < 0 ? MENO : '';
        return apri(n, segno + frazione(String(Math.abs(n.num)), String(n.den)));
      }

      case 'var':
        return apri(n, '<i class="alg-lettera">' + n.name + '</i>');

      case 'neg':
        return apri(n, MENO + operando(n.operand, PREC_NEG, false));

      case 'eq':
        return apri(n, rendiNodo(n.left)
          + '<span class="alg-uguale">=</span>'
          + rendiNodo(n.right));

      case 'op': {
        if (n.op === '/') {
          // Dentro la barra non servono parentesi: raggruppa la barra.
          return apri(n, frazione(rendiNodo(n.left), rendiNodo(n.right)));
        }
        if (n.op === '^') {
          // La base va protetta se non è già un pezzo compatto: `(x + 1)^2`,
          // ma anche una frazione elevata a potenza.
          const nuda = n.left.type === 'var'
            || (n.left.type === 'num' && n.left.den === 1 && n.left.num >= 0);
          const base = nuda ? rendiNodo(n.left) : parentesi(rendiNodo(n.left));
          // L'esponente è un nodo come gli altri e deve restare selezionabile:
          // si rende, non si stampa.
          return apri(n, base + '<sup class="alg-esponente">' + rendiNodo(n.right) + '</sup>');
        }
        const p = PREC[n.op];
        const sx = operando(n.left, n.op === '^' ? p + 1 : p, true);
        const dx = operando(n.right, p + 1, false);
        if (n.op === '*') {
          // Il punto si mette solo quando serve a leggere: `2x` no, `2 · 3` sì.
          const serve = !n.implicit || n.right.type === 'num';
          return apri(n, sx + (serve ? '<span class="alg-operatore">' + PER + '</span>' : '') + dx);
        }
        return apri(n, sx + '<span class="alg-operatore">' + (n.op === '-' ? MENO : '+') + '</span>' + dx);
      }

      default:
        throw new Error('Nodo sconosciuto: ' + n.type);
    }
  }

  function operando(n, minima, negativoNudo) {
    // Un numero negativo a destra di un operatore va protetto, come nella
    // scrittura lineare: `2 · (−3)`.
    if (n.type === 'num' && n.num < 0 && minima > 1 && !negativoNudo) {
      return parentesi(rendiNodo(n));
    }
    return prec(n) < minima ? parentesi(rendiNodo(n)) : rendiNodo(n);
  }

  /**
   * L'albero come HTML. La selezione non si passa qui: chi monta la trova con
   * `querySelector('[data-nodo="…"]')` e le mette la classe che vuole, così il
   * render resta una funzione pura dell'albero e si può confrontare nei test.
   */
  function rendiHTML(albero) {
    return '<span class="alg-radice">' + rendiNodo(albero) + '</span>';
  }

  host.rendiHTML = rendiHTML;
})(
  typeof window !== 'undefined'
    ? (window.Algebra = window.Algebra || {})
    : Object.assign(module.exports, require('./algebra-parser.js')),
  typeof window !== 'undefined' ? window.Algebra : require('./algebra-parser.js')
);
