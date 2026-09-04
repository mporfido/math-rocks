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
    creaNodo, creaNumero, terminiDi, monomioNormale, parteLetterale,
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
    tipo: 'applicazione',
    bersaglio: 'equazione',
    parametri: ['operazione', 'valore'],
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

  function secondoPrincipio(id, etichetta, granularità) {
    return {
      id,
      etichetta,
      tipo: 'applicazione',
      bersaglio: 'equazione',
      parametri: ['operazione', 'valore'],
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
        const dividi = param.operazione === 'dividi';
        const fai = (membro) => {
          const applica = (pezzo) => (dividi
            ? op('/', pezzo, parse(param.valore))
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
    tipo: 'applicazione',
    bersaglio: 'nodo',
    parametri: [],
    applicabile(albero, id) {
      const scelto = bersaglio(albero, id, 'Scegli il termine da eliminare');
      if (scelto.errore) return scelto.errore;
      const nodo = scelto.nodo;
      if (!canonicalizza(nodo).èZero) return no('non-nullo', 'Questo termine non vale zero');
      if (!èTermineDiPrimoLivello(albero, id)) {
        return no('non-termine', 'Si eliminano solo i termini di una somma');
      }
      const membro = membroDi(albero, id);
      if (terminiDi(membro).length < 2) {
        return no('unico-termine', 'È rimasto solo questo: uno zero da solo si può scrivere');
      }
      return sì();
    },
    esegui(albero, id) {
      const membro = membroDi(albero, id);
      const rimasti = terminiDi(membro).filter((t) => t.nodo.id !== id);
      return sostituisci(albero, membro.id, costruisciSomma(rimasti));
    },
  };

  const ordina = {
    id: 'ordina',
    etichetta: 'Ordina per grado decrescente',
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
      if (nodo.type === 'num') return no('già-numero', 'Questo è già un numero');
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

  const riduciSimili = semplificazione({
    id: 'riduci-simili',
    etichetta: 'Somma i termini simili',
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
      if (terminiDi(scritto).length >= terminiDi(contesto.selezione).length) {
        return no('non-ridotto', 'I termini simili non sono ancora stati sommati');
      }
      return sì();
    },
  });

  const normalizzaMonomio = semplificazione({
    id: 'normalizza-monomio',
    etichetta: 'Scrivi il monomio in forma normale',
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

  const espandi = semplificazione({
    id: 'espandi',
    etichetta: 'Svolgi il prodotto',
    applicabile(albero, id) {
      const scelto = bersaglio(albero, id, 'Scegli il prodotto da svolgere');
      if (scelto.errore) return scelto.errore;
      const nodo = scelto.nodo;
      const haSomma = (n) => n && n.type === 'op' && (n.op === '+' || n.op === '-');
      const prodotto = nodo.type === 'op' && nodo.op === '*' && (haSomma(nodo.left) || haSomma(nodo.right));
      const potenza = nodo.type === 'op' && nodo.op === '^' && haSomma(nodo.left) && nodo.right.num >= 2;
      if (!prodotto && !potenza) return no('niente-da-svolgere', 'Qui non c\'è un prodotto da svolgere');
      return sì();
    },
    accetta(scritto, contesto) {
      if (terminiDi(scritto).length <= terminiDi(contesto.selezione).length) {
        return no('non-svolto', 'Il prodotto non è ancora stato svolto');
      }
      return sì();
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
    secondoPrincipio('secondo-principio', 'Moltiplica o dividi i due membri (termine a termine)', 'lavagna'),
    secondoPrincipio('secondo-principio-rigoroso', 'Moltiplica o dividi i due membri (per intero)', 'membro'),
    scambiaMembri, eliminaNullo, ordina,
    calcola, riduciSimili, normalizzaMonomio, espandi,
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
   * Le mosse che si possono fare adesso, fra quelle abilitate. Con un nodo
   * selezionato dà le mosse che agiscono su quel pezzo; senza, quelle che
   * agiscono sulla equazione intera. Tenerle separate non e pignoleria:
   * offrire "scambia i due membri" a ogni click su ogni cifra e rumore che
   * nasconde la mossa che serve davvero.
   */
  function mosseDisponibili(albero, id, whitelist) {
    const ammesse = whitelist ? whitelist.filter((k) => CATALOGO[k]) : Object.keys(CATALOGO);
    const voluto = id == null ? 'equazione' : 'nodo';
    return ammesse
      .map((k) => CATALOGO[k])
      .filter((m) => m.bersaglio === voluto)
      .filter((m) => {
        if (m.parametri.length) return false;
        // Rete: interrogare le mosse è un gesto continuo dell'interfaccia
        // (a ogni click, su ogni nodo). Se una di loro solleva, la risposta
        // giusta è "non si può fare", non una pagina bloccata.
        try { return m.applicabile(albero, id, {}).ok; } catch (e) { return false; }
      })
      .map((m) => ({ id: m.id, etichetta: m.etichetta, tipo: m.tipo }));
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
    if (whitelist && whitelist.indexOf(azione.mossa) === -1) {
      return no('mossa-non-abilitata', 'Questa mossa non è disponibile in questo esercizio');
    }

    const param = azione.parametri || {};
    const consentita = mossa.applicabile(albero, azione.nodo, param);
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

    const selezione = trovaNodo(albero, azione.nodo);
    if (!equivalenti(selezione, scritto)) {
      return no('non-equivalente', 'Quello che hai scritto non vale quanto il pezzo che stai sostituendo');
    }
    if (mossa.accetta) {
      const accettato = mossa.accetta(scritto, { selezione, albero });
      if (!accettato.ok) return accettato;
    }
    return sì({ albero: sostituisci(albero, azione.nodo, scritto) });
  }

  host.CATALOGO = CATALOGO;
  host.applicaMossa = applicaMossa;
  host.mosseDisponibili = mosseDisponibili;
  host.validaWhitelist = validaWhitelist;
  host.costruisciSomma = costruisciSomma;
  host.opposto = opposto;
})(
  typeof window !== 'undefined'
    ? (window.Algebra = window.Algebra || {})
    : Object.assign(module.exports, require('./algebra-forme.js')),
  typeof window !== 'undefined' ? window.Algebra : require('./algebra-forme.js')
);
