/**
 * Il catalogo delle mosse — cosa si può fare, e cosa succede se lo si fa.
 *
 * L'invariante di tutto il componente è che **gli stati non equivalenti sono
 * irraggiungibili**: una mossa illecita non avviene, e dice perché. Una mossa
 * inutile ma lecita invece si fa: sbagliare strada è permesso, sbagliare
 * algebra no.
 *
 * Le mosse sono di due specie, e la differenza è *dove sta il lavoro mentale*:
 *
 *   APPLICAZIONE   lo studente sceglie la mossa e il parametro, e il motore
 *                  scrive la conseguenza meccanica sui due membri senza
 *                  semplificare niente. Nei principi non c'è nulla da
 *                  calcolare: far ricopiare l'equazione sarebbe fatica senza
 *                  pensiero.
 *   SEMPLIFICAZIONE lo studente **digita** il risultato, e solo sul sottoalbero
 *                  che ha selezionato. Lì il conto c'è, ed è suo.
 *
 * Le mosse-scorciatoia (il trasporto) non sono regole nuove: sono composizioni
 * di primitive. L'equivalenza è garantita per costruzione, abilitarle è un
 * flag, e la lezione che le introduce può mostrarne l'espansione.
 *
 * Qui non c'è nessuna interfaccia: si gioca un esercizio intero passando le
 * mosse a `applicaMossa`, ed è così che lo provano i test.
 */

(function (host, base) {
  if (!base || !base.traguardo) {
    throw new Error('algebra-mosse.js: static/lib/algebra-forme.js va caricato prima (vedi templates/_assets.html)');
  }
  const {
    parse, scrivi, canonicalizza, equivalenti, nelDominio, sostituisci, trovaNodo, trovaGenitore,
    creaNodo, creaNumero, dividi, terminiDi, monomioNormale, parteLetterale,
    frazioneRidotta,
  } = base;

  const no = (codice, messaggio) => ({ ok: false, codice, messaggio });
  const sì = (extra = {}) => ({ ok: true, ...extra });

  // --- Costruire pezzi di albero --------------------------------------------

  const op = (o, left, right, extra = {}) => creaNodo({ type: 'op', op: o, left, right, ...extra });

  /** L'opposto *scritto*: `-x` diventa `x`, `2x` diventa `-2x`, e non `0 - 2x`. */
  function opposto(n) {
    if (n.type === 'num') return creaNumero(-n.num, n.den);
    if (n.type === 'neg') return n.operand;
    let piùASinistra = n;
    while (piùASinistra.type === 'op' && (piùASinistra.op === '*' || piùASinistra.op === '/')) {
      piùASinistra = piùASinistra.left;
    }
    if (piùASinistra.type === 'num') {
      return sostituisci(n, piùASinistra.id, creaNumero(-piùASinistra.num, piùASinistra.den));
    }
    return creaNodo({ type: 'neg', operand: n });
  }

  /**
   * Il segno con cui un termine e SCRITTO: -1 se il meno ce l'ha gia dentro
   * (`-2x`, `-x`, `-3/4`), +1 altrimenti.
   *
   * Non basta il segno che il termine ha NELLA SOMMA: dopo una mossa che
   * ricostruisce il membro, un `0 - 2x` diventa `-2x`, cioe un termine di
   * segno + con il meno dentro al coefficiente. Chi guarda solo uno dei due
   * posti finisce per scrivere `3 - -2x`.
   */
  function segnoScritto(n) {
    if (n.type === 'neg') return -1;
    let piuASinistra = n;
    while (piuASinistra.type === 'op' && (piuASinistra.op === '*' || piuASinistra.op === '/')) {
      piuASinistra = piuASinistra.left;
    }
    return piuASinistra.type === 'num' && piuASinistra.num < 0 ? -1 : 1;
  }

  /** Il termine e il segno con cui va davvero sommato: `{ segno, nudo }`. */
  function scomponiSegno(termine) {
    const scritto = segnoScritto(termine.nodo);
    return {
      segno: termine.segno * scritto,
      nudo: scritto < 0 ? opposto(termine.nodo) : termine.nodo,
    };
  }

  /**
   * Rimonta una somma da una lista di termini con segno. Il primo termine
   * porta il segno dentro di sé (`-2/3x + 2`, non `- 2/3x + 2`); gli altri
   * diventano `+` o `-` fra i termini, come si scrive a mano.
   */
  function costruisciSomma(termini) {
    if (termini.length === 0) return creaNumero(0);
    let somma = termini[0].segno < 0 ? opposto(termini[0].nodo) : termini[0].nodo;
    for (let i = 1; i < termini.length; i++) {
      // Dal secondo in poi il segno lo porta il collegamento, quindi il termine
      // va scritto nudo: `+ 2x`, mai `+ -2x`.
      const { segno, nudo } = scomponiSegno(termini[i]);
      somma = op(segno < 0 ? '-' : '+', somma, nudo);
    }
    return somma;
  }

  // --- Interrogare lo stato -------------------------------------------------

  const èEquazione = (albero) => albero.type === 'eq';

  /** Il membro (sinistro o destro) che contiene quel nodo, o null. */
  function membroDi(albero, id) {
    if (!èEquazione(albero)) return albero;
    if (trovaNodo(albero.left, id)) return albero.left;
    if (trovaNodo(albero.right, id)) return albero.right;
    return null;
  }

  /** Il nodo è uno dei termini di primo livello del suo membro? */
  function èTermineDiPrimoLivello(albero, id) {
    const membro = membroDi(albero, id);
    if (!membro) return false;
    return terminiDi(membro).some((t) => t.nodo.id === id);
  }

  /**
   * Il nodo scelto, o il motivo per cui non va bene. Sta qui e non in ogni
   * mossa perché l'equazione intera NON è un bersaglio: `canonicalizza` su un
   * nodo `eq` solleva, e senza questo filtro un click vicino all'uguale
   * farebbe cadere l'intera interfaccia. Per la stessa ragione qui si controlla
   * anche il dominio: chi passa da `bersaglio` ha già la garanzia di poter
   * canonicalizzare il pezzo senza rete.
   */
  function bersaglio(albero, id, invito) {
    const nodo = id == null ? null : trovaNodo(albero, id);
    if (!nodo) return { errore: no('serve-selezione', invito) };
    if (nodo.type === 'eq') {
      return { errore: no('serve-un-pezzo', 'Scegli un pezzo, non l\'equazione intera') };
    }
    const dominio = nelDominio(nodo);
    if (!dominio.ok) return { errore: dominio };
    return { nodo };
  }

  /** La selezione visiva comprende il meno che collega il termine alla somma.
   * Il nodo originale conserva il suo id per gesti, cronologia e ripristino. */
  function pezzoConSegno(albero, id) {
    const n = trovaNodo(albero, id);
    const p = trovaGenitore(albero, id);
    if (!n || !p || p.type !== 'op' || p.op !== '-' || p.right.id !== id) return n;
    // Un coefficiente positivo porta il meno come nella scrittura visibile.
    // Un meno già presente, invece, resta da semplificare dallo studente.
    return segnoScritto(n) > 0 ? opposto(n) : creaNodo({ type: 'neg', operand: n });
  }

  function sostituisciConSegno(albero, id, scritto) {
    const p = trovaGenitore(albero, id);
    if (p && p.type === 'op' && (p.op === '+' || p.op === '-') && p.right.id === id) {
      const { segno, nudo } = scomponiSegno({ segno: 1, nodo: scritto });
      return sostituisci(albero, p.id, op(segno < 0 ? '-' : '+', p.left, nudo));
    }
    return sostituisci(albero, id, scritto);
  }

  /**
   * Il parametro `operazione` è uno dei due valori previsti? Senza questo
   * controllo un valore ignoto scivolava nel ramo `else` di un ternario e
   * diventava in silenzio un'addizione: la mossa si faceva, ma non quella
   * chiesta, e l'equazione restava equivalente — quindi nessuno se ne
   * accorgeva.
   */
  function operazioneFraDue(param, ammesse) {
    const scelta = param && param.operazione;
    if (ammesse.indexOf(scelta) === -1) {
      return no('operazione-non-valida',
        'Operazione non valida: scegli fra ' + ammesse.join(' e '));
    }
    return sì();
  }

  function costante(testo) {
    let albero;
    try { albero = parse(testo); } catch (e) { return { errore: e.message }; }
    if (albero.type === 'eq') return { errore: 'Serve un numero, non un\'equazione' };
    // Anche qui il dominio va chiesto prima: `x/y` si parsa benissimo, ed è
    // solo canonicalizzandolo che si scopre di non saperlo trattare.
    let c;
    try { c = canonicalizza(albero).costante; } catch (e) { return { errore: e.message }; }
    if (c === null) return { errore: 'Serve un numero: qui c\'è una lettera' };
    return { valore: c, albero };
  }

  // --- Mosse di APPLICAZIONE ------------------------------------------------

  /**
   * Primo principio: si aggiunge (o si toglie) la stessa cosa ai due membri.
   * Non semplifica: lascia `2x + 3 - 3 = 8 - 3`, che è esattamente il passaggio
   * intermedio da cui si vede *perché* il trasporto funziona.
   */
  const primoPrincipio = {
    id: 'primo-principio',
    etichetta: 'Aggiungi o togli la stessa quantità ai due membri',
    breve: 'primo principio',
    tipo: 'applicazione',
    bersaglio: 'equazione',
    parametri: ['operazione', 'valore'],
    // `opzioni` e per l'interfaccia, non per il motore: dice quali valori
    // ammette un parametro, cosi il menu costruisce il campo da solo invece di
    // ricopiare qui la lista. Una mossa con parametri MA SENZA opzioni (come
    // `sposta`) e per definizione una mossa da gesto: il parametro glielo da
    // il trascinamento, e a click ci arrivano i suoi gemelli.
    opzioni: { operazione: ['aggiungi', 'sottrai'] },
    applicabile(albero, id, param) {
      if (!èEquazione(albero)) return no('serve-equazione', 'Il primo principio vale per le equazioni');
      const quale = operazioneFraDue(param, ['aggiungi', 'sottrai']);
      if (!quale.ok) return quale;
      if (!param.valore) return no('serve-valore', 'Scrivi che cosa aggiungere o togliere');
      try {
        if (parse(param.valore).type === 'eq') {
          return no('valore-non-valido', 'Serve un\'espressione, non un\'equazione');
        }
      } catch (e) {
        return no('valore-non-valido', e.message);
      }
      // Un valore fuori dominio non solleverebbe qui, ma alla prima mossa
      // che prova a giudicare il risultato: meglio dirlo mentre lo si scrive.
      const dominio = nelDominio(parse(param.valore));
      if (!dominio.ok) return no('valore-non-valido', dominio.messaggio);
      return sì();
    },
    esegui(albero, id, param) {
      const segno = param.operazione === 'sottrai' ? '-' : '+';
      // Due parse distinti: i due membri devono avere nodi con id diversi,
      // altrimenti selezionarne uno selezionerebbe anche l'altro.
      return creaNodo({
        type: 'eq',
        left: op(segno, albero.left, parse(param.valore)),
        right: op(segno, albero.right, parse(param.valore)),
      });
    },
  };

  /** Distribuisce l'operazione su ogni termine: è la divisione "da lavagna". */
  function terminePerTermine(n, fai) {
    if (n.type === 'op' && (n.op === '+' || n.op === '-')) {
      return op(n.op, terminePerTermine(n.left, fai), terminePerTermine(n.right, fai));
    }
    return fai(n);
  }

  function secondoPrincipio(id, etichetta, breve, granularità) {
    return {
      id,
      etichetta,
      // Il nome corto e per il menu: due moduli con lo stesso verbo nella
      // tendina sarebbero indistinguibili, ed e proprio la granularita a
      // distinguerli.
      breve,
      tipo: 'applicazione',
      bersaglio: 'equazione',
      parametri: ['operazione', 'valore'],
      opzioni: { operazione: ['moltiplica', 'dividi'] },
      applicabile(albero, sel, param) {
        if (!èEquazione(albero)) return no('serve-equazione', 'Il secondo principio vale per le equazioni');
        const quale = operazioneFraDue(param, ['moltiplica', 'dividi']);
        if (!quale.ok) return quale;
        if (!param.valore) return no('serve-valore', 'Scrivi per quanto moltiplicare o dividere');
        const c = costante(param.valore);
        if (c.errore) {
          // È lo stesso confine di tutto il componente: dividere per una
          // lettera vorrebbe dire sapere che non è zero.
          return no('valore-non-costante', c.errore);
        }
        if (c.valore.num === 0) return no('valore-zero', 'Non si può moltiplicare o dividere per zero');
        return sì();
      },
      esegui(albero, sel, param) {
        const divide = param.operazione === 'dividi';
        const fai = (membro) => {
          const applica = (pezzo) => (divide
            // `dividi` (dal parser) e non un nodo `/` a mano: fra due numeri
            // la divisione È una frazione, e deve esserlo da qualunque parte
            // arrivi — altrimenti `6 / 3` scritto dalla mossa e `6/3` scritto
            // dall'autore sarebbero due cose diverse sullo stesso schermo.
            ? dividi(pezzo, parse(param.valore))
            : op('*', parse(param.valore), pezzo, { implicit: true }));
          return granularità === 'lavagna' ? terminePerTermine(membro, applica) : applica(membro);
        };
        return creaNodo({ type: 'eq', left: fai(albero.left), right: fai(albero.right) });
      },
    };
  }

  const scambiaMembri = {
    id: 'scambia-membri',
    etichetta: 'Scambia i due membri',
    breve: 'Scambia i membri',
    tipo: 'applicazione',
    bersaglio: 'equazione',
    parametri: [],
    applicabile(albero) {
      if (!èEquazione(albero)) return no('serve-equazione', 'Non c\'è niente da scambiare');
      return sì();
    },
    esegui(albero) {
      return creaNodo({ type: 'eq', left: albero.right, right: albero.left });
    },
  };

  const eliminaNullo = {
    id: 'elimina-nullo',
    etichetta: 'Elimina il termine nullo',
    breve: 'Elimina lo zero',
    tipo: 'applicazione',
    bersaglio: 'nodo',
    parametri: [],
    applicabile(albero, id) {
      const scelto = bersaglio(albero, id, 'Scegli il termine da eliminare');
      if (scelto.errore) return scelto.errore;
      const nodo = scelto.nodo;
      if (!canonicalizza(nodo).èZero) return no('non-nullo', 'Questo termine non vale zero');
      // La somma, non il membro: uno zero nato dentro a una parentesi si
      // cancella lì, senza aspettare che la parentesi sparisca.
      const posto = postoDelTermine(albero, id);
      if (!posto) return no('non-termine', 'Si eliminano solo i termini di una somma');
      if (posto.termini.length < 2) {
        return no('unico-termine', 'È rimasto solo questo: uno zero da solo si può scrivere');
      }
      return sì();
    },
    esegui(albero, id) {
      const posto = postoDelTermine(albero, id);
      const rimasti = posto.termini.filter((t) => t.nodo.id !== id);
      return sostituisci(albero, posto.membro.id, costruisciSomma(rimasti));
    },
  };

  /**
   * Dove sta un termine dentro al suo membro: `{ membro, termini, indice }`,
   * oppure null se quel nodo non è un termine di primo livello. Lo condividono
   * tutte le mosse che rimescolano una somma.
   */
  /**
   * La somma di cui quel nodo è un termine — non per forza il membro.
   *
   * Si sale finché il genitore è ancora un `+` o un `-`, e ci si ferma davanti
   * a un prodotto, una barra o una potenza: quella è la parentesi. In
   * `9(4x² - 1/9 - (4x² - 4/3x + 1/9))` la somma da rimescolare è quella
   * dentro le graffe, non il membro — cercare i termini solo nel membro
   * lasciava senza nessuna mossa ogni termine scritto dentro a una parentesi,
   * e sono quasi tutti quelli che nascono da un prodotto notevole.
   */
  function sommaDelTermine(albero, id) {
    const nodo = trovaNodo(albero, id);
    if (!nodo) return null;
    let corrente = nodo;
    for (;;) {
      const p = trovaGenitore(albero, corrente.id);
      if (!p || p.type !== 'op' || (p.op !== '+' && p.op !== '-')) break;
      corrente = p;
    }
    if (corrente !== nodo) return corrente;
    // Nessuna somma sopra: è un termine solo se è tutto il membro. Un fattore
    // dentro a un prodotto non lo è, e non deve diventarlo.
    const membro = membroDi(albero, id);
    return membro && membro.id === id ? membro : null;
  }

  function postoDelTermine(albero, id) {
    const membro = sommaDelTermine(albero, id);
    if (!membro) return null;
    const termini = terminiDi(membro);
    const indice = termini.findIndex((t) => t.nodo.id === id);
    return indice === -1 ? null : { membro, termini, indice };
  }

  /** La somma riscritta con quel termine spostato in quella posizione. */
  function riordina(albero, posto, destinazione) {
    const rimasti = [...posto.termini];
    const [preso] = rimasti.splice(posto.indice, 1);
    rimasti.splice(destinazione, 0, preso);
    return sostituisci(albero, posto.membro.id, costruisciSomma(rimasti));
  }

  /**
   * Cambiare posto a un addendo è la proprietà commutativa, e non c'è niente
   * da calcolare: è una mossa di applicazione, il motore la scrive. Serve
   * perché l'ordine dei termini fa parte di quasi tutti i traguardi, e
   * `ordina` (tutto il membro, per grado) è una scorciatoia che non insegna
   * il gesto — sul quaderno un termine si sposta uno alla volta.
   *
   * Il parametro `posizione` glielo dà il trascinamento; a click le due mosse
   * gemelle qui sotto spostano di un posto per volta.
   */
  const sposta = {
    id: 'sposta',
    etichetta: 'Sposta il termine',
    tipo: 'applicazione',
    bersaglio: 'nodo',
    parametri: ['posizione'],
    applicabile(albero, id, param) {
      const scelto = bersaglio(albero, id, 'Scegli il termine da spostare');
      if (scelto.errore) return scelto.errore;
      const posto = postoDelTermine(albero, id);
      if (!posto) return no('non-termine', 'Si spostano i termini di una somma');
      if (posto.termini.length < 2) return no('unico-termine', 'C\'è un solo termine');
      const destinazione = param && param.posizione;
      if (!Number.isInteger(destinazione) || destinazione < 0
          || destinazione >= posto.termini.length) {
        return no('posizione-non-valida', 'Posizione non valida');
      }
      if (destinazione === posto.indice) return no('già-lì', 'Il termine è già in quel posto');
      return sì();
    },
    esegui(albero, id, param) {
      return riordina(albero, postoDelTermine(albero, id), param.posizione);
    },
  };

  /** Il gemello a click di `sposta`: un posto per volta, senza parametri, così
   *  compare da solo nel menu delle mosse disponibili. */
  function spostaDiUno(id, etichetta, breve, passo) {
    return {
      id,
      etichetta,
      breve,
      tipo: 'applicazione',
      bersaglio: 'nodo',
      parametri: [],
      applicabile(albero, sel) {
        const scelto = bersaglio(albero, sel, 'Scegli il termine da spostare');
        if (scelto.errore) return scelto.errore;
        const posto = postoDelTermine(albero, sel);
        if (!posto) return no('non-termine', 'Si spostano i termini di una somma');
        const destinazione = posto.indice + passo;
        if (destinazione < 0 || destinazione >= posto.termini.length) {
          return no('niente-oltre', passo < 0
            ? 'Questo termine è già il primo'
            : 'Questo termine è già l\'ultimo');
        }
        return sì();
      },
      esegui(albero, sel) {
        const posto = postoDelTermine(albero, sel);
        return riordina(albero, posto, posto.indice + passo);
      },
    };
  }

  const ordina = {
    id: 'ordina',
    etichetta: 'Ordina per grado decrescente',
    breve: 'Ordina per grado',
    tipo: 'applicazione',
    bersaglio: 'nodo',
    parametri: [],
    applicabile(albero, id) {
      const nodo = id == null ? albero : trovaNodo(albero, id);
      if (!nodo || nodo.type === 'eq') return no('serve-selezione', 'Scegli il membro da ordinare');
      if (terminiDi(nodo).length < 2) return no('niente-da-ordinare', 'C\'è un solo termine');
      // Ordinare vuol dire confrontare i gradi, e il grado lo sa dire solo la
      // forma canonica: senza questo controllo la mossa veniva offerta su
      // `x/y + 1` e poi sollevava al momento di eseguirla.
      const dominio = nelDominio(nodo);
      if (!dominio.ok) return dominio;
      return sì();
    },
    esegui(albero, id) {
      const nodo = id == null ? albero : trovaNodo(albero, id);
      const termini = [...terminiDi(nodo)]
        .sort((a, b) => canonicalizza(b.nodo).grado - canonicalizza(a.nodo).grado);
      return sostituisci(albero, nodo.id, costruisciSomma(termini));
    },
  };

  // --- Mosse di SEMPLIFICAZIONE ---------------------------------------------
  // Qui lo studente digita. Il motore sa già il risultato — deve saperlo, per
  // giudicare — ma non lo scrive al posto suo: la differenza fra le due cose è
  // tutto ciò che questo componente insegna.

  function semplificazione(spec) {
    // Una semplificazione agisce sempre sul pezzo selezionato: semplificare
    // tutta insieme una equazione non vuole dire niente.
    return { tipo: 'semplificazione', bersaglio: 'nodo', parametri: [], ...spec };
  }

  const calcola = semplificazione({
    id: 'calcola',
    etichetta: 'Calcola',
    applicabile(albero, id) {
      const scelto = bersaglio(albero, id, 'Scegli che cosa calcolare');
      if (scelto.errore) return scelto.errore;
      const nodo = scelto.nodo;
      // Un numero già scritto ai minimi termini non ha più niente da dare; una
      // frazione non ridotta invece sì, ed è la stessa mossa: `12/3` si
      // calcola come `8 - 3`. Da quando una divisione fra numeri è una
      // frazione, questo è l'unico modo per finirla.
      if (nodo.type === 'num' && frazioneRidotta(nodo)) {
        return no('già-numero', 'Questo numero è già scritto ai minimi termini');
      }
      if (canonicalizza(nodo).costante === null) {
        return no('non-numerico', 'Qui non si può ancora calcolare: ci sono delle lettere');
      }
      return sì();
    },
    accetta(scritto) {
      if (scritto.type !== 'num') return no('non-un-numero', 'Il risultato di un calcolo è un numero');
      if (scritto.num !== scritto.value.num || scritto.den !== scritto.value.den) {
        return no('frazione-non-ridotta', 'La frazione va ridotta ai minimi termini');
      }
      return sì();
    },
  });

  // Normalizzazione locale: segni, coefficienti e fattori neutri. Le somme
  // restano somme e i fattori simbolici non vengono sviluppati né riordinati.
  function semplificaScrittura(n) {
    if (n.type === 'neg' || (n.type === 'op' && n.op === '*')) {
      let coeff = new base.Rational(1);
      const fattori = [];
      const raccogli = (f) => {
        if (f.type === 'neg') { coeff = coeff.mul(new base.Rational(-1)); raccogli(f.operand); }
        else if (f.type === 'op' && f.op === '*') { raccogli(f.left); raccogli(f.right); }
        else if (f.type === 'num') coeff = coeff.mul(f.value);
        // Una barra con un numero sotto è un fattore numerico come gli altri,
        // solo scritto al contrario: `12((5x+1)/6)` è il passaggio che nasce
        // sempre dal minimo comune multiplo, e sul quaderno lì si semplifica
        // il 12 col 6 e resta `2(5x+1)`. Senza questo caso quel termine non
        // aveva nessuna mossa: la somma sotto la barra non è un fattore, e
        // quindi nemmeno `Svolgi il prodotto` la vedeva.
        else if (f.type === 'op' && f.op === '/' && f.right.type === 'num' && f.right.num !== 0) {
          coeff = coeff.div(f.right.value);
          raccogli(f.left);
        } else fattori.push(f);
      };
      raccogli(n);
      if (!fattori.length || coeff.num === 0) return creaNumero(coeff.num, coeff.den);
      const unitario = Math.abs(coeff.num) === coeff.den;
      const prodotto = fattori.reduce((a, b) => a ? op('*', a, b, { implicit: true }) : b,
        unitario ? null : creaNumero(coeff.num, coeff.den));
      return unitario && coeff.num < 0 ? creaNodo({ type: 'neg', operand: prodotto }) : prodotto;
    }
    if (n.type === 'op' && (n.op === '+' || n.op === '-')) {
      const left = semplificaScrittura(n.left);
      const right = semplificaScrittura(n.right);
      const { segno, nudo } = scomponiSegno({ segno: n.op === '-' ? -1 : 1, nodo: right });
      return op(segno < 0 ? '-' : '+', left, nudo);
    }
    return n;
  }

  // Ignora id e notazione del prodotto, non la struttura matematica.
  function formaScritta(n) {
    if (n.type === 'num') return ['num', n.num, n.den];
    if (n.type === 'var') return ['var', n.name];
    if (n.type === 'neg') return ['neg', formaScritta(n.operand)];
    return [n.op, formaScritta(n.left), formaScritta(n.right)];
  }
  const stessaScrittura = (a, b) => JSON.stringify(formaScritta(a)) === JSON.stringify(formaScritta(b));

  const semplifica = semplificazione({
    id: 'semplifica',
    etichetta: 'Semplifica',
    applicabile(albero, id) {
      const scelto = bersaglio(albero, id, 'Scegli il pezzo da semplificare');
      if (scelto.errore) return scelto.errore;
      const pezzo = pezzoConSegno(albero, id);
      return stessaScrittura(pezzo, semplificaScrittura(pezzo))
        ? no('già-semplice', 'Non ci sono segni o fattori da semplificare') : sì();
    },
    pezzo: pezzoConSegno,
    rimpiazza: (albero, id, param, scritto) => sostituisciConSegno(albero, id, scritto),
    accetta(scritto, contesto) {
      return stessaScrittura(scritto, semplificaScrittura(contesto.selezione))
        ? sì() : no('non-semplificato', 'Semplifica i segni e i fattori numerici, mantenendo le somme e i fattori letterali');
    },
  });

  const riduciSimili = semplificazione({
    id: 'riduci-simili',
    etichetta: 'Somma i termini simili',
    breve: 'Somma i simili',
    applicabile(albero, id) {
      const scelto = bersaglio(albero, id, 'Scegli la somma da ridurre');
      if (scelto.errore) return scelto.errore;
      const termini = terminiDi(scelto.nodo);
      if (termini.length < 2) return no('non-somma', 'Qui non c\'è una somma');
      const viste = new Set();
      for (const t of termini) {
        const k = parteLetterale(t.nodo);
        if (k !== null && viste.has(k)) return sì();
        if (k !== null) viste.add(k);
      }
      return no('niente-di-simile', 'Non ci sono termini simili da sommare');
    },
    accetta(scritto, contesto) {
      const selezione = contesto.selezione.type === 'neg' ? contesto.selezione.operand : contesto.selezione;
      if (terminiDi(scritto).length >= terminiDi(selezione).length) {
        return no('non-ridotto', 'I termini simili non sono ancora stati sommati');
      }
      return sì();
    },
  });

  /**
   * Sommare DUE termini simili, e riscrivere solo la loro somma.
   *
   * È la stessa algebra di `riduci-simili`, ma il conto che chiede è quello che
   * lo studente ha davvero in testa: portando un `3x` sopra un `2x` pensa
   * «cinque x», non «riscrivo il membro». Far ricopiare gli altri termini è
   * fatica senza pensiero — la stessa ragione per cui le mosse di applicazione
   * le scrive il motore — e in una riga lunga è anche l'occasione di sbagliare
   * a copiare un pezzo che non c'entrava niente.
   *
   * I due termini NON devono essere vicini: il pezzo da riscrivere è la loro
   * somma (`3x - 2x`), e il risultato torna al posto del più a sinistra dei
   * due. Il riordino implicito è commutativa, quindi lecito, e non è una mossa
   * che si insegna qui: chi vuole vedere lo spostamento lo fa prima, a mano.
   *
   * Il parametro `altro` è l'altro termine, e glielo dà il trascinamento: a
   * click resta `riduci-simili`, che è la sua gemella e la abilita.
   */
  const riduciCoppia = semplificazione({
    id: 'riduci-coppia',
    etichetta: 'Somma questi due termini',
    parametri: ['altro'],
    // Un parametro che è un NODO va salvato per cammino, non per id: lo dice
    // qui, e l'interfaccia converte da sola invece di sapere quale mossa sia.
    parametriNodo: ['altro'],
    // Abilitata da chi la contiene: una whitelist che dà «somma i termini
    // simili» non intendeva togliere il gesto che fa la stessa cosa su due.
    gemella: 'riduci-simili',
    applicabile(albero, id, param) {
      const coppia = coppiaSimile(albero, id, param);
      return coppia.errore ? coppia.errore : sì();
    },
    /** Il pezzo che si sta riscrivendo: la somma dei due, e nient'altro. */
    pezzo(albero, id, param) {
      const coppia = coppiaSimile(albero, id, param);
      if (coppia.errore) return null;
      return costruisciSomma([coppia.termini[coppia.primo], coppia.termini[coppia.secondo]]);
    },
    /** Il membro rimontato: al posto del primo dei due c'è il risultato. */
    rimpiazza(albero, id, param, scritto) {
      const coppia = coppiaSimile(albero, id, param);
      const rimasti = coppia.termini
        .filter((t, i) => i !== coppia.primo && i !== coppia.secondo);
      // Segno `+`: quello vero lo porta la scrittura dello studente, e
      // `costruisciSomma` lo legge da lì (un `-3x` digitato diventa `- 3x`).
      rimasti.splice(coppia.primo, 0, { segno: 1, nodo: scritto });
      return sostituisci(albero, coppia.membro.id, costruisciSomma(rimasti));
    },
    accetta(scritto) {
      if (terminiDi(scritto).length >= 2) {
        return no('non-ridotto', 'I due termini non sono ancora stati sommati');
      }
      return sì();
    },
  });

  /**
   * I due termini simili di una coppia: `{ membro, termini, primo, secondo }`
   * con gli indici già in ordine di lettura, oppure `{ errore }`.
   */
  function coppiaSimile(albero, id, param) {
    const scelto = bersaglio(albero, id, 'Scegli il termine da sommare');
    if (scelto.errore) return { errore: scelto.errore };
    const altro = param && param.altro;
    if (altro == null) return { errore: no('serve-l-altro', 'Scegli l\'altro termine') };
    if (altro === id) return { errore: no('stesso-termine', 'Sono lo stesso termine') };
    const altroScelto = bersaglio(albero, altro, 'Scegli l\'altro termine');
    if (altroScelto.errore) return { errore: altroScelto.errore };

    const qui = postoDelTermine(albero, id);
    const lì = postoDelTermine(albero, altro);
    if (!qui || !lì) return { errore: no('non-termine', 'Si sommano i termini di una somma') };
    if (qui.membro.id !== lì.membro.id) {
      // Non più solo «due membri diversi»: da quando i termini si contano
      // nella somma che li contiene, due termini possono stare anche in due
      // parentesi diverse dello stesso membro.
      return { errore: no('somme-diverse', 'I due termini non stanno nella stessa somma') };
    }
    const mia = parteLetterale(scelto.nodo);
    const sua = parteLetterale(altroScelto.nodo);
    if (mia === null || sua === null || mia !== sua) {
      return { errore: no('non-simili', 'Questi due termini non sono simili') };
    }
    return {
      membro: qui.membro,
      termini: qui.termini,
      primo: Math.min(qui.indice, lì.indice),
      secondo: Math.max(qui.indice, lì.indice),
    };
  }

  const normalizzaMonomio = semplificazione({
    id: 'normalizza-monomio',
    etichetta: 'Scrivi il monomio in forma normale',
    breve: 'Forma normale',
    applicabile(albero, id) {
      const scelto = bersaglio(albero, id, 'Scegli il monomio');
      if (scelto.errore) return scelto.errore;
      const nodo = scelto.nodo;
      // Servono due controlli, come per il traguardo `ax=b`: `0 + 6` vale un
      // monomio ma SCRITTO è una somma, e chiamarlo "monomio da normalizzare"
      // manderebbe lo studente a fare la mossa sbagliata (quella giusta lì è
      // il calcolo).
      if (terminiDi(nodo).length > 1 || canonicalizza(nodo).termini.size > 1) {
        return no('non-monomio', 'Questo non è un monomio');
      }
      // Un numero da solo è un monomio, ma la mossa che lo sistema si chiama
      // Calcola: offrirle tutte e due vorrebbe dire due bottoni per la stessa
      // cosa, e chi legge il menu penserebbe di doverle fare entrambe.
      if (nodo.type === 'num') {
        return no('è-un-numero', 'Un numero da solo si sistema con Calcola');
      }
      if (monomioNormale(nodo).ok) return no('già-normale', 'Questo monomio è già in forma normale');
      return sì();
    },
    accetta(scritto) {
      const esito = monomioNormale(scritto);
      if (!esito.ok) {
        // Equivalente ma scritto male: è un fallimento diverso da "non
        // equivalente", e lo studente deve poter capire quale dei due è.
        return no('non-normale', esito.problemi[0].messaggio);
      }
      return sì();
    },
  });

  // --- I prodotti notevoli: dire QUALE pezzo non torna -----------------------
  // «Non vale quanto il pezzo che stai sostituendo» è vero e inutile: dice che
  // c'è un errore, non quale, ed è la stessa frase per un segno sbagliato e per
  // il doppio prodotto dimenticato — che è l'errore che si ripete in ogni
  // classe. Quando il pezzo da svolgere è un prodotto notevole si può fare di
  // meglio, senza però scrivere la risposta: si dice quale delle condizioni
  // cade, e il conto resta dello studente.

  const DUE = canonicalizza(creaNumero(2));

  /** Il termine di una somma come polinomio, segno compreso. */
  function polyDelTermine(t) {
    const p = canonicalizza(t.nodo);
    return t.segno < 0 ? p.negato() : p;
  }

  /**
   * Il prodotto notevole che il pezzo selezionato è — letto dalla SCRITTURA,
   * non dalla forma canonica: `(x+3)^2` e `(x-3)(x+3)` si riconoscono da come
   * sono scritti, che è anche il modo in cui lo studente li vede. Torna
   * `{ tipo, a, b }` con i due termini del binomio già canonici e col segno,
   * oppure null se non è nessuno dei due.
   */
  function prodottoNotevole(nodo) {
    if (!nodo || nodo.type !== 'op') return null;

    if (nodo.op === '^' && nodo.right.type === 'num'
        && nodo.right.den === 1 && nodo.right.num === 2) {
      const t = terminiDi(nodo.left);
      if (t.length !== 2) return null;
      return { tipo: 'quadrato', a: polyDelTermine(t[0]), b: polyDelTermine(t[1]) };
    }

    if (nodo.op === '*') {
      const sx = terminiDi(nodo.left);
      const dx = terminiDi(nodo.right);
      if (sx.length !== 2 || dx.length !== 2) return null;
      const [p, q] = sx.map(polyDelTermine);
      const [r, s] = dx.map(polyDelTermine);
      // `(a+b)(a-b)` si può scrivere in quattro ordini, e sono lo stesso
      // esercizio: quale dei due binomi porti il meno non cambia niente.
      for (const [a, b, c, d] of [[p, q, r, s], [p, q, s, r], [q, p, r, s], [q, p, s, r]]) {
        if (a.uguale(c) && b.uguale(d.negato())) return { tipo: 'differenza', a, b };
      }
    }
    return null;
  }

  /** Ogni monomio di `atteso` c'è in `dato` con lo stesso coefficiente? */
  function tornano(atteso, dato) {
    for (const [k, t] of atteso.termini) {
      const u = dato.termini.get(k);
      if (!u || !u.coeff.equals(t.coeff)) return false;
    }
    return true;
  }

  /** `dato` porta monomi che nel risultato giusto non esistono proprio? */
  function haEstranei(dato, atteso) {
    for (const k of dato.termini.keys()) if (!atteso.termini.has(k)) return true;
    return false;
  }

  /** I due gruppi di monomi si sovrappongono? (`(x+x)^2` e simili degeneri:
   *  lì non c'è più un "pezzo" da indicare, e il messaggio generico è più
   *  onesto di una diagnosi inventata.) */
  function sisovrappongono(p, q) {
    for (const k of p.termini.keys()) if (q.termini.has(k)) return true;
    return false;
  }

  /**
   * Che cosa non torna, in una frase, o null se non si sa dire meglio del
   * messaggio generico. Non rivela mai il valore giusto.
   */
  function diagnosticaNotevole(selezione, scritto) {
    const notevole = prodottoNotevole(selezione);
    if (!notevole) return null;

    let dato;
    let quadA;
    let quadB;
    let incrociato;
    try {
      dato = canonicalizza(scritto);
      quadA = notevole.a.moltiplica(notevole.a);
      quadB = notevole.b.moltiplica(notevole.b);
      incrociato = notevole.a.moltiplica(notevole.b);
    } catch (e) {
      return null;  // troppo grande da sviluppare: la diagnosi non vale un errore
    }

    if (notevole.tipo === 'quadrato') {
      const quadrati = quadA.somma(quadB);
      const doppio = incrociato.moltiplica(DUE);
      if (sisovrappongono(quadrati, doppio)) return null;

      if (dato.uguale(quadrati)) {
        return 'Ci sono i due quadrati, ma manca il doppio prodotto.';
      }
      const atteso = quadrati.somma(doppio);
      if (haEstranei(dato, atteso)) return null;
      if (tornano(quadrati, dato) && !tornano(doppio, dato)) {
        return 'I due quadrati ci sono: è il doppio prodotto che non torna.';
      }
      if (tornano(doppio, dato) && !tornano(quadrati, dato)) {
        return 'Il doppio prodotto torna, ma uno dei due quadrati no.';
      }
      return null;
    }

    // Differenza di quadrati: i due prodotti incrociati si annullano, e i due
    // errori tipici sono non farli annullare e sommare invece di sottrarre.
    const atteso = quadA.sottrai(quadB);
    if (dato.uguale(quadA.somma(quadB))) {
      return 'I due quadrati ci sono, ma il secondo va sottratto, non sommato.';
    }
    if (tornano(atteso, dato) && !sisovrappongono(atteso, incrociato)
        && !haEstranei(dato, atteso.somma(incrociato))) {
      return 'I due prodotti incrociati si annullano fra loro: quel termine non deve restare.';
    }
    return null;
  }

  const èSomma = (n) => n && n.type === 'op' && (n.op === '+' || n.op === '-');

  function haProdottoDaSvolgere(n) {
    if (!n) return false;
    if (n.type === 'op' && n.op === '*' && (èSomma(n.left) || èSomma(n.right))) return true;
    if (n.type === 'op' && n.op === '^' && èSomma(n.left) && n.right.num >= 2) return true;
    if (n.type === 'neg' && èSomma(n.operand)) return true;
    return ['left', 'right', 'operand'].some((campo) => haProdottoDaSvolgere(n[campo]));
  }

  /** Una distributiva, senza sviluppare gli altri fattori. Le alternative
   * sono solo i fattori che sono somme: nessuna ricerca di tutte le sequenze. */
  function* distribuzioniImmediate(n) {
    let fattori;
    if (n.type === 'op' && n.op === '*') fattori = base.fattoriDi(n);
    else if (n.type === 'neg') fattori = [creaNumero(-1), n.operand];
    else if (n.type === 'op' && n.op === '^' && èSomma(n.left) && n.right.num >= 2) {
      fattori = [n.left, n.right.num === 2 ? n.left : op('^', n.left, creaNumero(n.right.num - 1))];
    } else return;
    for (let i = 0; i < fattori.length; i++) {
      if (!èSomma(fattori[i])) continue;
      yield terminiDi(fattori[i]).map((t) => ({
        segno: t.segno,
        nodo: fattori.map((f, j) => j === i ? t.nodo : f)
          .reduce((a, b) => op('*', a, b, { implicit: true })),
      }));
    }
  }

  /** L'equivalenza da sola non prova una distributiva. Cerchiamo un riscontro:
   * uno sviluppo completo, gli addendi di una distributiva, oppure un passo
   * interno con lo stesso contesto. Calcolare solo i coefficienti, aggiungere
   * uno zero o riscrivere una potenza come prodotto non sono riscontri. */
  function avanzaDistribuzione(prima, dopo) {
    const cache = new WeakMap();
    const poly = (n) => {
      if (!cache.has(n)) cache.set(n, canonicalizza(n));
      return cache.get(n);
    };
    const uguali = (a, b) => poly(a).uguale(poly(b));
    const contieneSomma = (n) => Boolean(n && (èSomma(n)
      || ['left', 'right', 'operand'].some((campo) => contieneSomma(n[campo]))));
    const verifica = (a, b) => {
      if (!haProdottoDaSvolgere(a) || !uguali(a, b)) return false;
      if (terminiDi(b).every((t) => !contieneSomma(t.nodo))) return true;

      // Il prodotto esterno può restare: -1(3(x+2)) → -1(3x+6).
      if (a.type === b.type && a.op === b.op) {
        const campi = ['left', 'right', 'operand'].filter((campo) => a[campo] || b[campo]);
        if (campi.length && campi.every((campo) => a[campo] && b[campo] && uguali(a[campo], b[campo]))
            && campi.some((campo) => verifica(a[campo], b[campo]))) return true;
      }

      // Confronto degli addendi, inclusi segni e molteplicità. Il loro ordine
      // non conta e i conti interni possono essere già stati svolti.
      const dati = terminiDi(b).map(polyDelTermine);
      for (const termini of distribuzioniImmediate(a)) {
        if (termini.length !== dati.length) continue;
        const rimasti = dati.slice();
        const corrispondono = termini.every((t) => {
          const atteso = polyDelTermine(t);
          const i = rimasti.findIndex((p) => p.uguale(atteso));
          if (i < 0) return false;
          rimasti.splice(i, 1);
          return true;
        });
        if (corrispondono) return true;
      }
      return false;
    };
    return verifica(prima, dopo);
  }

  const espandi = semplificazione({
    id: 'espandi',
    etichetta: 'Svolgi il prodotto',
    applicabile(albero, id) {
      const scelto = bersaglio(albero, id, 'Scegli il prodotto da svolgere');
      if (scelto.errore) return scelto.errore;
      if (!haProdottoDaSvolgere(scelto.nodo)) return no('niente-da-svolgere', 'Qui non c\'è un prodotto da svolgere');
      return sì();
    },
    /**
     * Lo sviluppo torna al suo posto DENTRO alla somma che lo conteneva.
     * Togliere il meno davanti a una parentesi dà più di un termine, e
     * rimetterli come termine solo scriverebbe `4x² - 1/9 + (-4x² + 4/3x -
     * 1/9)`: le parentesi che lo studente ha appena tolto, con dentro i segni
     * già cambiati.
     */
    rimpiazza(albero, id, param, scritto) {
      const p = param && param.conSegno ? trovaGenitore(albero, id) : null;
      if (!p || p.type !== 'op' || (p.op !== '+' && p.op !== '-') || p.right.id !== id) {
        return sostituisci(albero, id, scritto);
      }
      // `scritto` è il pezzo COL segno: i suoi termini si agganciano a quello
      // che c'era prima della parentesi, ciascuno con il segno che ha adesso.
      return sostituisci(albero, p.id,
        costruisciSomma([{ segno: 1, nodo: p.left }, ...terminiDi(scritto)]));
    },
    accetta(scritto, contesto) {
      if (!avanzaDistribuzione(contesto.selezione, scritto)) {
        return no('non-svolto', 'Il prodotto non è ancora stato svolto');
      }
      return sì();
    },
    diagnostica(scritto, contesto) {
      return diagnosticaNotevole(contesto.selezione, scritto);
    },
  });

  // --- Mosse MACRO ----------------------------------------------------------

  /**
   * Il trasporto NON è una regola nuova: è primo principio, più la
   * cancellazione dei due termini opposti che ne nascono. Lo esegue davvero
   * così, componendo le primitive — l'equivalenza è garantita da loro, e la
   * lezione che introduce la scorciatoia può far vedere i passaggi che salta.
   */
  const trasporto = {
    id: 'trasporto',
    bersaglio: 'nodo',
    etichetta: 'Porta il termine dall\'altra parte',
    breve: 'Portalo di là',
    tipo: 'applicazione',
    parametri: [],
    composta: ['primo-principio', 'riduci-simili'],
    applicabile(albero, id) {
      if (!èEquazione(albero)) return no('serve-equazione', 'Si trasporta fra i due membri di un\'equazione');
      const scelto = bersaglio(albero, id, 'Scegli il termine da trasportare');
      if (scelto.errore) return scelto.errore;
      if (!èTermineDiPrimoLivello(albero, id)) {
        return no('non-termine', 'Si trasportano i termini di una somma, non i pezzi dentro a un termine');
      }
      return sì();
    },
    esegui(albero, id) {
      const membro = membroDi(albero, id);
      const daSpostare = terminiDi(membro).find((t) => t.nodo.id === id);
      const rimasti = terminiDi(membro).filter((t) => t.nodo.id !== id);
      const membroSvuotato = costruisciSomma(rimasti);

      // Il segno si ribalta passando dall'altra parte: un `+ 3` arriva come
      // `- 3`, un `- 6` arriva come `+ 6`. Conta il segno EFFETTIVO, che sta
      // nella somma e insieme dentro al termine: `-2x` con segno + vale meno,
      // e deve arrivare come `+ 2x`.
      const { segno, nudo } = scomponiSegno(daSpostare);
      const altro = membro === albero.left ? albero.right : albero.left;
      const altroConTermine = op(segno < 0 ? '+' : '-', altro, nudo);

      return membro === albero.left
        ? creaNodo({ type: 'eq', left: membroSvuotato, right: altroConTermine })
        : creaNodo({ type: 'eq', left: altroConTermine, right: membroSvuotato });
    },
  };

  // --- Il catalogo ----------------------------------------------------------

  const CATALOGO = {};
  for (const m of [
    primoPrincipio,
    secondoPrincipio('secondo-principio', 'Moltiplica o dividi i due membri (termine a termine)',
      'secondo principio, termine a termine', 'lavagna'),
    secondoPrincipio('secondo-principio-rigoroso', 'Moltiplica o dividi i due membri (per intero)',
      'secondo principio, sul membro intero', 'membro'),
    scambiaMembri, eliminaNullo, ordina,
    sposta,
    spostaDiUno('sposta-sinistra', 'Sposta il termine a sinistra', 'Spostalo a sinistra', -1),
    spostaDiUno('sposta-destra', 'Sposta il termine a destra', 'Spostalo a destra', +1),
    calcola, semplifica, riduciSimili, riduciCoppia, normalizzaMonomio, espandi,
    trasporto,
  ]) CATALOGO[m.id] = m;

  /** Gli id di mossa esistono davvero? Un id sbagliato nella whitelist di una
   *  lezione è una scheda che lo studente non può risolvere, e deve fermare la
   *  build invece di scoprirsi in classe. */
  function validaWhitelist(ids) {
    const ignoti = (ids || []).filter((id) => !CATALOGO[id]);
    if (ignoti.length) throw new Error('Mosse sconosciute: ' + ignoti.join(', '));
    return true;
  }

  /**
   * Questa mossa è abilitata da questa whitelist? Non basta cercarla
   * nell'elenco: una mossa da gesto può dichiarare la sua `gemella` a click, e
   * chi ha scritto `riduci-simili` in una lezione non intendeva togliere il
   * trascinamento che fa la stessa cosa su due termini soli.
   */
  function abilitata(id, whitelist) {
    if (!whitelist) return true;
    if (whitelist.indexOf(id) !== -1) return true;
    const m = CATALOGO[id];
    return Boolean(m && m.gemella && whitelist.indexOf(m.gemella) !== -1);
  }

  /**
   * Le mosse che si possono fare adesso, fra quelle abilitate. Con un nodo
   * selezionato dà le mosse che agiscono su quel pezzo; senza, quelle che
   * agiscono sulla equazione intera. Tenerle separate non e pignoleria:
   * offrire "scambia i due membri" a ogni click su ogni cifra e rumore che
   * nasconde la mossa che serve davvero.
   */
  function mosseDisponibili(albero, id, whitelist) {
    const ammesse = whitelist ? whitelist.filter((k) => CATALOGO[k]) : Object.keys(CATALOGO);
    const voluto = id == null ? 'equazione' : 'nodo';
    const disponibili = ammesse
      .map((k) => CATALOGO[k])
      .filter((m) => m.bersaglio === voluto)
      .filter((m) => {
        if (m.parametri.length) return false;
        // Rete: interrogare le mosse è un gesto continuo dell'interfaccia
        // (a ogni click, su ogni nodo). Se una di loro solleva, la risposta
        // giusta è "non si può fare", non una pagina bloccata.
        try { return applicabileAllaSelezione(m, albero, id, { conSegno: true }).ok; } catch (e) { return false; }
      });
    // Fra le mosse effettivamente disponibili, un solo comando per lo stesso
    // lavoro. Le altre trasformazioni (sviluppo, somma, trasporto) restano.
    const priorità = ['calcola', 'normalizza-monomio', 'semplifica'];
    const preferita = priorità.find((id) => disponibili.some((m) => m.id === id));
    return disponibili
      .filter((m) => !priorità.includes(m.id) || m.id === preferita)
      // `breve` è il nome sul bottone, `etichetta` la frase intera: la prima
      // sta su un telefono, la seconda dice che cosa hai fatto nello
      // svolgimento e la legge chi usa uno screen reader.
      .map((m) => ({ id: m.id, etichetta: m.etichetta, breve: m.breve || null, tipo: m.tipo }));
  }

  function applicabileAllaSelezione(mossa, albero, id, param) {
    if (param.conSegno && (mossa.id === 'calcola' || mossa.id === 'normalizza-monomio' || mossa.id === 'espandi')) {
      const pezzo = pezzoConSegno(albero, id);
      if (pezzo) return mossa.applicabile(pezzo, pezzo.id, param);
    }
    return mossa.applicabile(albero, id, param);
  }

  /**
   * Esegue una mossa. Torna il nuovo albero, oppure il motivo per cui non si
   * può fare — mai uno stato a metà, e mai uno stato non equivalente.
   *
   *   azione = { mossa, nodo, parametri, digitato }
   */
  function applicaMossa(albero, azione, whitelist) {
    // Ogni `applicabile` dichiara il proprio dominio, quindi qui non si
    // dovrebbe sollevare mai. Ma «non si dovrebbe» non è una garanzia, e il
    // prezzo di sbagliarsi è l'interfaccia che sparisce a metà esercizio con
    // il lavoro dello studente dentro: una mossa che non si può fare deve
    // restare un esito come gli altri, mai un'eccezione che risale.
    try {
      return eseguiMossa(albero, azione, whitelist);
    } catch (e) {
      return no('mossa-fallita', e.message);
    }
  }

  function eseguiMossa(albero, azione, whitelist) {
    const mossa = CATALOGO[azione.mossa];
    if (!mossa) return no('mossa-sconosciuta', 'Mossa sconosciuta: ' + azione.mossa);
    if (!abilitata(azione.mossa, whitelist)) {
      return no('mossa-non-abilitata', 'Questa mossa non è disponibile in questo esercizio');
    }

    const param = azione.parametri || {};
    const consentita = applicabileAllaSelezione(mossa, albero, azione.nodo, param);
    if (!consentita.ok) return consentita;

    if (mossa.tipo === 'applicazione') {
      return sì({ albero: mossa.esegui(albero, azione.nodo, param) });
    }

    // Semplificazione: il risultato lo scrive lo studente.
    if (azione.digitato == null || String(azione.digitato).trim() === '') {
      return no('serve-il-risultato', 'Scrivi il risultato');
    }
    let scritto;
    try {
      scritto = parse(azione.digitato);
    } catch (e) {
      return no('non-si-legge', e.message);
    }
    // Quello che lo studente digita è input quanto il resto: `x/y` si legge
    // benissimo, e sarebbe `equivalenti` a sollevare, due righe più sotto.
    const dominioScritto = nelDominio(scritto);
    if (!dominioScritto.ok) return dominioScritto;

    // Di norma il pezzo che si riscrive È il nodo selezionato. Una mossa può
    // però lavorare su un pezzo che nell'albero non è un nodo solo — la somma
    // di due termini lontani — e allora se lo costruisce lei, e sa anche come
    // rimontare il risultato al suo posto.
    const selezione = mossa.pezzo ? mossa.pezzo(albero, azione.nodo, param)
      : param.conSegno ? pezzoConSegno(albero, azione.nodo) : trovaNodo(albero, azione.nodo);
    if (!selezione) return no('serve-selezione', 'Scegli il pezzo da riscrivere');
    if (!equivalenti(selezione, scritto)) {
      // Una mossa che sa riconoscere la forma su cui sta lavorando può dire
      // *quale* condizione cade, invece del solo «non vale quanto»: vedi
      // `diagnosticaNotevole`. Se non sa dire di meglio, torna null e resta il
      // messaggio generico — che è sempre vero, e non è mai una diagnosi
      // sbagliata.
      let dettaglio = null;
      try {
        if (mossa.diagnostica) dettaglio = mossa.diagnostica(scritto, { selezione, albero });
      } catch (e) { dettaglio = null; }
      return no('non-equivalente',
        dettaglio || 'Quello che hai scritto non vale quanto il pezzo che stai sostituendo');
    }
    if (mossa.accetta) {
      const accettato = mossa.accetta(scritto, { selezione, albero });
      if (!accettato.ok) return accettato;
    }
    return sì({
      albero: mossa.rimpiazza
        ? mossa.rimpiazza(albero, azione.nodo, param, scritto)
        : param.conSegno ? sostituisciConSegno(albero, azione.nodo, scritto)
          : sostituisci(albero, azione.nodo, scritto),
    });
  }

  host.CATALOGO = CATALOGO;
  host.applicaMossa = applicaMossa;
  host.mosseDisponibili = mosseDisponibili;
  host.abilitata = abilitata;
  host.validaWhitelist = validaWhitelist;
  host.costruisciSomma = costruisciSomma;
  host.opposto = opposto;
  host.postoDelTermine = postoDelTermine;
  host.pezzoConSegno = pezzoConSegno;
})(
  typeof window !== 'undefined'
    ? (window.Algebra = window.Algebra || {})
    : Object.assign(module.exports, require('./algebra-forme.js')),
  typeof window !== 'undefined' ? window.Algebra : require('./algebra-forme.js')
);
