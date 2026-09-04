/**
 * Le forme e la diagnosi — "ci sono arrivato?" e, se no, "cosa manca".
 *
 * Il traguardo di questo componente è una FORMA, non un valore: non si tratta
 * di risolvere ma di scrivere bene. Quindi il giudizio è **sintattico**, si dà
 * sull'albero letterale e non sulla forma canonica: `12 = 6x` e `6x = 12`
 * valgono lo stesso ma solo il secondo è in forma normale, e la differenza fra
 * i due è una mossa che lo studente deve fare.
 *
 * Nessun predicato qui torna un semplice sì/no. Torna sempre l'elenco di ciò
 * che non va, in ordine di cosa conviene sistemare prima: è quello che diventa
 * il messaggio ("nessuna riduzione possibile: resta da portare tutto a
 * sinistra"), e senza di quello lo studente resta fermo davanti a un traguardo
 * che non si accende, senza sapere perché.
 *
 * Il traguardo è dichiarato dall'autore, non cablato qui dentro:
 *
 *   { forma: 'ridotta' }   un'espressione (niente `=`) ridotta e ordinata
 *   { forma: 'ax=b' }      equazione lineare: `6x = 12`, `-3x = 5`
 *   { forma: 'normale' }   tutti i termini a sinistra: `4x^2 - 9 = 0`
 *   { isola: 'y' }         `y = ...`, con la y sparita da destra
 *
 * `{ isola: 'x' }` è anche "risolvi l'equazione": non serve un caso a parte.
 */

(function (host, base) {
  if (!base || !base.canonicalizza) {
    throw new Error('algebra-forme.js: static/lib/algebra-canonica.js va caricato prima (vedi templates/_assets.html)');
  }
  const { canonicalizza } = base;

  const problema = (codice, messaggio, nodo) => ({ codice, messaggio, nodo: nodo ? nodo.id : null });
  const esito = (problemi) => ({ ok: problemi.length === 0, problemi });

  // --- Scomporre l'albero come è scritto ------------------------------------

  /**
   * I fattori di un prodotto, nell'ordine in cui sono scritti: `2xy` → [2, x, y].
   * Non attraversa le parentesi di una somma: `2(x+1)` → [2, (x+1)].
   */
  function fattoriDi(n) {
    if (n.type === 'op' && n.op === '*') return [...fattoriDi(n.left), ...fattoriDi(n.right)];
    return [n];
  }

  /**
   * I termini di una somma, con il segno con cui compaiono:
   * `2x - 3y + 0` → [ {segno:+1, nodo:2x}, {segno:-1, nodo:3y}, {segno:+1, nodo:0} ].
   */
  function terminiDi(n, segno = 1) {
    if (n.type === 'op' && (n.op === '+' || n.op === '-')) {
      return [
        ...terminiDi(n.left, segno),
        ...terminiDi(n.right, n.op === '-' ? -segno : segno),
      ];
    }
    return [{ segno, nodo: n }];
  }

  /** La parte letterale come chiave canonica: `-3x^2y` → `x^2*y`. '' = costante. */
  function parteLetterale(n) {
    const p = canonicalizza(n);
    if (p.termini.size === 0) return '';
    if (p.termini.size > 1) return null;
    return [...p.termini.keys()][0];
  }

  // --- Il monomio -----------------------------------------------------------

  /** Il numero è scritto ai minimi termini? (`6/4` no, `3/2` sì) */
  function frazioneRidotta(n) {
    return n.num === n.value.num && n.den === n.value.den;
  }

  /**
   * Il monomio è scritto in forma normale?
   *
   * Le regole, fissate una volta sola: un solo coefficiente razionale ridotto e
   * davanti; `1` omesso e `-1` reso come segno; ogni lettera una volta sola con
   * il suo esponente; esponente `1` omesso. L'ordine delle lettere è
   * **tollerante**: `y^3x^2` passa, perché è una convenzione tipografica e non
   * un errore di algebra.
   */
  function monomioNormale(n) {
    const problemi = [];

    // `-x` è la scrittura giusta del coefficiente -1; `-(2x)` no, quello ha un
    // coefficiente da portare dentro.
    if (n.type === 'neg') {
      const dentro = monomioNormale(n.operand);
      if (!dentro.ok) return dentro;
      if (fattoriDi(n.operand).some((f) => f.type === 'num')) {
        return esito([problema('meno-fuori',
          'Il segno meno va scritto insieme al coefficiente: -2x, non -(2x)', n)]);
      }
      return esito([]);
    }

    const fattori = fattoriDi(n);
    const lettereViste = new Map();
    let coefficienti = 0;

    fattori.forEach((f, i) => {
      if (f.type === 'num') {
        coefficienti++;
        if (i !== 0) {
          problemi.push(problema('coefficiente-non-davanti',
            'Il coefficiente va scritto davanti alla parte letterale', f));
        }
        if (coefficienti > 1) {
          problemi.push(problema('coefficienti-multipli',
            'C\'è più di un coefficiente: vanno moltiplicati fra loro', f));
        }
        if (!frazioneRidotta(f)) {
          problemi.push(problema('frazione-non-ridotta',
            'Il coefficiente non è ridotto ai minimi termini', f));
        }
        // Un `1` o un `-1` scritti si omettono, ma solo se c'è una parte
        // letterale: il monomio `1` è il numero 1, e va benissimo così.
        if (fattori.length > 1 && f.den === 1 && Math.abs(f.num) === 1) {
          problemi.push(problema(f.num === 1 ? 'coefficiente-uno' : 'coefficiente-meno-uno',
            f.num === 1 ? 'Il coefficiente 1 non si scrive: x, non 1x'
                        : 'Il coefficiente -1 si scrive come segno: -x, non -1x', f));
        }
        return;
      }

      let lettera = null;
      if (f.type === 'var') {
        lettera = f.name;
      } else if (f.type === 'op' && f.op === '^' && f.left.type === 'var') {
        lettera = f.left.name;
        const e = f.right.num;
        if (e === 0) {
          problemi.push(problema('esponente-zero',
            'Una lettera elevata a 0 vale 1: va tolta', f));
        } else if (e === 1) {
          problemi.push(problema('esponente-uno', 'L\'esponente 1 non si scrive: x, non x^1', f));
        } else if (e < 0) {
          problemi.push(problema('esponente-negativo',
            'Esponente negativo: qui non è un monomio', f));
        }
      } else {
        problemi.push(problema('fattore-non-monomio',
          'Questo non è un fattore di un monomio: un monomio è un numero per delle lettere', f));
        return;
      }

      if (lettereViste.has(lettera)) {
        problemi.push(problema('lettera-ripetuta',
          'La lettera ' + lettera + ' compare più volte: va scritta una volta sola con il suo esponente', f));
      }
      lettereViste.set(lettera, true);
    });

    return esito(problemi);
  }

  // --- Il polinomio ---------------------------------------------------------

  /**
   * Il polinomio è ridotto e ordinato? Cioè: ogni termine è un monomio in forma
   * normale, non ci sono più termini simili da sommare né termini nulli da
   * togliere, e l'ordine è per grado complessivo decrescente.
   */
  function polinomioRidotto(n) {
    const problemi = [];
    const termini = terminiDi(n);

    // Lo zero da solo è una scrittura legittima (`x - x` finisce lì); uno zero
    // in mezzo agli altri termini è un residuo da eliminare.
    const soloZero = termini.length === 1 && canonicalizza(termini[0].nodo).èZero;

    const chiavi = [];
    for (const t of termini) {
      const dentro = monomioNormale(t.nodo);
      problemi.push(...dentro.problemi);

      if (!soloZero && canonicalizza(t.nodo).èZero) {
        problemi.push(problema('termine-nullo',
          'C\'è un termine nullo: si può eliminare', t.nodo));
      }
      chiavi.push({ chiave: parteLetterale(t.nodo), nodo: t.nodo });
    }

    // Termini simili: stessa parte letterale, quindi ancora da sommare.
    const viste = new Map();
    for (const c of chiavi) {
      if (c.chiave === null) continue;
      if (viste.has(c.chiave)) {
        problemi.push(problema('termini-simili',
          'Ci sono ancora termini simili da sommare', c.nodo));
      }
      viste.set(c.chiave, true);
    }

    // Ordine per grado complessivo decrescente.
    if (!soloZero) {
      const gradi = termini.map((t) => canonicalizza(t.nodo).grado);
      for (let i = 1; i < gradi.length; i++) {
        if (gradi[i] > gradi[i - 1]) {
          problemi.push(problema('ordine',
            'I termini non sono ordinati per grado decrescente', termini[i].nodo));
          break;
        }
      }
    }

    return esito(problemi);
  }

  // --- I traguardi ----------------------------------------------------------

  const NON_EQUAZIONE = () => esito([problema('non-equazione',
    'Qui serve un\'equazione, con il segno di uguale', null)]);

  /** Le lettere che compaiono in un albero, in ordine alfabetico. */
  function lettereDi(n) {
    if (n.type === 'eq') return [...new Set([...lettereDi(n.left), ...lettereDi(n.right)])].sort();
    return canonicalizza(n).variabili;
  }

  function traguardoRidotta(albero) {
    if (albero.type === 'eq') {
      return esito([problema('non-espressione',
        'Qui serve un\'espressione, senza il segno di uguale', null)]);
    }
    return polinomioRidotto(albero);
  }

  function traguardoNormale(albero) {
    if (albero.type !== 'eq') return NON_EQUAZIONE();
    const problemi = [];
    const destra = canonicalizza(albero.right);
    if (!destra.èZero) {
      problemi.push(problema('destra-non-zero',
        'Restano termini a destra: vanno portati tutti a sinistra', albero.right));
    } else if (albero.right.type !== 'num') {
      problemi.push(problema('destra-non-scritta-zero',
        'Il membro destro vale zero ma non è ancora scritto 0', albero.right));
    }
    problemi.push(...polinomioRidotto(albero.left).problemi);
    return esito(problemi);
  }

  function traguardoLineare(albero, incognita) {
    if (albero.type !== 'eq') return NON_EQUAZIONE();
    const lettere = lettereDi(albero);
    const x = incognita || lettere[0];
    if (!x) {
      return esito([problema('senza-incognita', 'Non c\'è nessuna incognita', null)]);
    }

    const sinistra = canonicalizza(albero.left);
    const destra = canonicalizza(albero.right);

    // I membri scambiati sono un caso a sé: c'è una mossa apposta, e dirlo è
    // più utile che ripetere che a sinistra manca l'incognita.
    if (sinistra.èCostante && destra.gradoIn(x) === 1) {
      return esito([problema('membri-scambiati',
        'I membri sono scambiati: l\'incognita va a sinistra', albero)]);
    }

    // I due controlli sono distinti e servono entrambi: quello sul VALORE
    // (`èCostante`) e quello sulla SCRITTURA (`terminiDi`). `8 - 3` vale una
    // costante ma è ancora una somma da fare, e `6x + 0` è un monomio solo per
    // la forma canonica: sullo schermo ci sono ancora due termini.
    const problemi = [];
    if (terminiDi(albero.right).length > 1 || !destra.èCostante) {
      problemi.push(problema('destra-non-costante',
        'A destra deve restare solo un numero', albero.right));
    } else {
      problemi.push(...monomioNormale(albero.right).problemi);
    }
    if (terminiDi(albero.left).length > 1 || sinistra.gradoIn(x) !== 1 || sinistra.termini.size !== 1) {
      problemi.push(problema('sinistra-non-monomio',
        'A sinistra deve restare solo il termine con l\'incognita', albero.left));
    } else {
      problemi.push(...monomioNormale(albero.left).problemi);
    }
    return esito(problemi);
  }

  function traguardoIsola(albero, lettera) {
    if (albero.type !== 'eq') return NON_EQUAZIONE();

    const isolataASinistra = albero.left.type === 'var' && albero.left.name === lettera;
    const isolataADestra = albero.right.type === 'var' && albero.right.name === lettera;
    if (!isolataASinistra && isolataADestra) {
      return esito([problema('membri-scambiati',
        'I membri sono scambiati: la ' + lettera + ' va a sinistra', albero)]);
    }

    const problemi = [];
    if (!isolataASinistra) {
      problemi.push(problema('non-isolata',
        'A sinistra deve restare la sola ' + lettera, albero.left));
    }
    if (canonicalizza(albero.right).gradoIn(lettera) > 0) {
      problemi.push(problema('lettera-a-destra',
        'La ' + lettera + ' compare ancora a destra', albero.right));
    }
    problemi.push(...polinomioRidotto(albero.right).problemi);
    return esito(problemi);
  }

  /**
   * Ci siamo? Torna `{ ok, problemi }`, con i problemi in ordine di cosa
   * conviene sistemare prima. Il primo è quello da mostrare.
   */
  function traguardo(albero, spec) {
    if (!spec || typeof spec !== 'object') throw new Error('Traguardo non dichiarato');

    let risultato;
    if (spec.isola) risultato = traguardoIsola(albero, spec.isola);
    else if (spec.forma === 'ridotta') risultato = traguardoRidotta(albero);
    else if (spec.forma === 'normale') risultato = traguardoNormale(albero);
    else if (spec.forma === 'ax=b') risultato = traguardoLineare(albero, spec.incognita);
    else throw new Error('Traguardo sconosciuto: ' + JSON.stringify(spec));

    return esito(ordinaPerUrgenza(risultato.problemi));
  }

  // Cosa conviene fare prima. Prima si sistema la struttura dei due membri,
  // poi si riduce, e solo alla fine si ordina e si limano le scritture: dire
  // "ordina per grado" a chi ha ancora termini simili da sommare manderebbe
  // avanti nell'ordine sbagliato.
  const URGENZA = [
    'non-equazione', 'non-espressione', 'senza-incognita', 'membri-scambiati',
    'destra-non-zero', 'destra-non-costante', 'non-isolata', 'lettera-a-destra',
    'sinistra-non-monomio', 'fattore-non-monomio', 'esponente-negativo',
    'termini-simili', 'termine-nullo', 'esponente-zero',
    'coefficienti-multipli', 'lettera-ripetuta', 'meno-fuori',
    'coefficiente-non-davanti', 'frazione-non-ridotta',
    'coefficiente-uno', 'coefficiente-meno-uno', 'esponente-uno',
    'destra-non-scritta-zero', 'ordine',
  ];

  function ordinaPerUrgenza(problemi) {
    const peso = (p) => {
      const i = URGENZA.indexOf(p.codice);
      return i === -1 ? URGENZA.length : i;
    };
    return [...problemi].sort((a, b) => peso(a) - peso(b));
  }

  host.fattoriDi = fattoriDi;
  host.terminiDi = terminiDi;
  host.parteLetterale = parteLetterale;
  host.monomioNormale = monomioNormale;
  host.polinomioRidotto = polinomioRidotto;
  host.traguardo = traguardo;
})(
  typeof window !== 'undefined'
    ? (window.Algebra = window.Algebra || {})
    : Object.assign(module.exports, require('./algebra-canonica.js')),
  typeof window !== 'undefined' ? window.Algebra : require('./algebra-canonica.js')
);
