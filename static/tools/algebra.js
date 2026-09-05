/**
 * Strumento "algebra" — <x-algebra> a pagina intera, configurabile via URL.
 *
 * Monta una SCHEDA di esercizi dentro `.tool-root` leggendo i parametri della
 * query string, come fa `tools/expr.js`: il sito è statico (Frozen-Flask
 * congela i percorsi, non le query string), quindi la pagina è sempre la stessa
 * e la scheda nasce qui, nel browser. Un link è già una scheda pronta.
 *
 * Parametri:
 *   eq        equazione o espressione di partenza (ripetibile: ?eq=…&eq=… ;
 *             accettato anche un solo parametro con più voci separate da "|")
 *   isola     lettera da isolare (traguardo)
 *   forma     "ax=b" | "normale" | "ridotta" (traguardo)
 *   incognita lettera, solo con forma=ax=b e solo se ce n'è più d'una in gioco
 *   libera    "1" → nessun traguardo: la lavagna si muove e non si chiude
 *   mosse     id di mossa separati da ";" (omesso = tutte)
 *   titolo    titolo della scheda
 *   noeditor  "1" → pagina "per gli studenti": si vede solo la scheda, il
 *             costruttore di link non viene montato. È il parametro che il
 *             costruttore aggiunge da sé al link da copiare (non è una
 *             protezione: l'indirizzo dello strumento resta pubblico).
 *
 * **Il traguardo è della scheda, non del singolo esercizio.** Una scheda è un
 * compito solo ("porta in forma normale queste cinque equazioni"), e mescolare
 * traguardi vorrebbe dire una sintassi per attaccarne uno a ogni riga: in una
 * lezione quel bisogno si copre già con più blocchi `:::algebra`.
 *
 * Senza parametri si usano i `defaults` dell'istanza (content/tools.yaml) e il
 * costruttore si apre già espanso.
 *
 * NB: qui l'equazione NON è più "input fidato dell'autore" come nel markdown di
 * un corso — chiunque può fabbricare un link. Prima del mount si controllano
 * lunghezze, alfabeto e parentesi, e poi si prova a leggerla davvero con
 * `Algebra.parse`: l'oracolo è già in pagina, e un messaggio del parser dice
 * molto più di una regex. Lo stesso vale per il traguardo e per gli id di
 * mossa, che in una lezione li validerebbe la build.
 */
(function () {
  'use strict';

  const root = document.querySelector('.tool-root[data-kind="algebra"]');
  if (!root) return;

  const A = window.Algebra || {};

  // -- Limiti (difesa contro link malformati o ostili) -----------------------
  const MAX_EQ_LEN = 200;      // caratteri per equazione
  const MAX_EXERCISES = 50;    // esercizi per scheda
  const MAX_DIGITS = 12;       // cifre di un singolo numero
  const MAX_TITLE_LEN = 120;

  // Alfabeto: cifre, lettere (una lettera = una variabile), operatori,
  // parentesi, l'uguale, e i glifi unicode che il parser già normalizza.
  const ALLOWED = /^[0-9A-Za-z\s+\-*:^/()[\]{}=×÷−·]+$/;
  const OPEN = { '(': ')', '[': ']', '{': '}' };
  const CLOSE = { ')': '(', ']': '[', '}': '{' };
  const LETTERA = /^[A-Za-z]$/;

  // Le forme che il motore sa giudicare (`traguardo` in algebra-forme.js).
  const FORME = {
    'ax=b': 'l\'incognita da sola a sinistra, col suo coefficiente (2x = 5)',
    'normale': 'la forma normale: ax² + bx + c = 0',
    'ridotta': 'un polinomio ridotto e ordinato (senza uguale)',
  };

  /**
   * Valida un'equazione arrivata dall'URL o dal costruttore.
   * Ritorna { ok: true, value } oppure { ok: false, error }.
   */
  function validateEq(raw) {
    const value = String(raw == null ? '' : raw).trim();
    if (!value) return { ok: false, error: 'equazione vuota' };
    if (value.length > MAX_EQ_LEN) {
      return { ok: false, error: `troppo lunga (max ${MAX_EQ_LEN} caratteri)` };
    }
    if (!ALLOWED.test(value)) {
      return { ok: false, error: 'contiene caratteri non ammessi' };
    }
    const longNumber = value.match(new RegExp(`\\d{${MAX_DIGITS + 1},}`));
    if (longNumber) {
      return { ok: false, error: `numero troppo grande (max ${MAX_DIGITS} cifre)` };
    }
    if ((value.match(/=/g) || []).length > 1) {
      return { ok: false, error: 'più di un uguale' };
    }
    const stack = [];
    for (const c of value) {
      if (OPEN[c]) stack.push(c);
      else if (CLOSE[c] && stack.pop() !== CLOSE[c]) {
        return { ok: false, error: 'parentesi non bilanciate' };
      }
    }
    if (stack.length) return { ok: false, error: 'parentesi non bilanciate' };
    // L'ultima parola è del parser: la grammatica la conosce lui (`ab` è a·b,
    // l'esponente è un intero scritto, le fratte sono fuori dominio).
    if (A.parse) {
      try {
        A.parse(value);
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }
    return { ok: true, value };
  }

  /**
   * Il traguardo dichiarato nei parametri → la spec di `data-traguardo`.
   * `value: null` è la lavagna libera, che è un esito legittimo e non un errore.
   */
  function validateTarget(spec) {
    const isola = String(spec.isola || '').trim();
    const forma = String(spec.forma || '').trim();
    const incognita = String(spec.incognita || '').trim();

    if (isola && forma) {
      return { ok: false, error: 'un traguardo solo per scheda: isola oppure forma' };
    }
    if (isola) {
      if (!LETTERA.test(isola)) {
        return { ok: false, error: `"${isola}" non è una variabile: isola vuole una lettera sola` };
      }
      return { ok: true, value: { isola } };
    }
    if (forma) {
      if (!Object.prototype.hasOwnProperty.call(FORME, forma)) {
        return {
          ok: false,
          error: `forma sconosciuta "${forma}" (${Object.keys(FORME).join(', ')})`,
        };
      }
      const value = { forma };
      if (incognita && forma !== 'ax=b') {
        // Il traguardo resta valido: si perde solo l'incognita, e va detto —
        // in una lezione questo caso ferma la build.
        return { ok: true, value, warn: 'incognita vale solo con forma=ax=b: ignorata' };
      }
      if (incognita) {
        if (!LETTERA.test(incognita)) {
          return { ok: false, error: `"${incognita}" non è una variabile: incognita vuole una lettera sola` };
        }
        value.incognita = incognita;
      }
      return { ok: true, value };
    }
    return { ok: true, value: null };
  }

  /** Gli id di mossa che esistono davvero, nell'ordine del catalogo. */
  function catalogo() {
    return A.CATALOGO || {};
  }

  /** Whitelist ripulita: { moves, rejected }. Gli id ignoti si scartano. */
  function validateMoves(ids) {
    const noti = catalogo();
    const moves = [];
    const rejected = [];
    (ids || []).forEach((raw) => {
      const id = String(raw).trim();
      if (!id) return;
      if (noti[id]) { if (moves.indexOf(id) === -1) moves.push(id); }
      else rejected.push(id);
    });
    return { moves, rejected };
  }

  // -- Stato -----------------------------------------------------------------

  let defaults = {};
  try {
    defaults = JSON.parse(root.dataset.defaults || '{}') || {};
  } catch (err) {
    defaults = {};
  }

  /** Un campo dei defaults che può essere una lista o una stringa. */
  function comeLista(valore, separatore) {
    if (Array.isArray(valore)) return valore.map(String);
    if (valore == null || valore === '') return [];
    return String(valore).split(separatore);
  }

  function readState() {
    const params = new URLSearchParams(window.location.search);
    const flag = (name) => params.has(name) && params.get(name) !== '0';

    // Il traguardo dell'URL sostituisce quello dell'istanza per intero: preso a
    // pezzi, un `?isola=y` su un default `forma=normale` diventerebbe "due
    // traguardi" e la scheda non partirebbe.
    const daUrl = params.has('isola') || params.has('forma') || params.has('libera');
    const spec = flag('libera') ? {}
      : daUrl ? {
        isola: params.get('isola'),
        forma: params.get('forma'),
        incognita: params.get('incognita'),
      } : {
        isola: defaults.isola,
        forma: defaults.forma,
        incognita: defaults.incognita,
      };

    const eqUrl = params.getAll('eq');
    const raw = (eqUrl.length
      ? eqUrl.reduce((acc, v) => acc.concat(String(v).split('|')), [])
      : comeLista(defaults.eq, '|')).slice(0, MAX_EXERCISES);

    const mosse = params.has('mosse')
      ? comeLista(params.get('mosse'), ';')
      : comeLista(defaults.mosse, ';');

    return {
      // `fromUrl` distingue "link condiviso" da "pagina aperta a mano": nel
      // secondo caso il costruttore si apre già espanso.
      fromUrl: params.has('eq') || daUrl,
      raw,
      target: spec,
      moves: mosse,
      noEditor: flag('noeditor'),
      title: String(params.get('titolo') || defaults.titolo || '').slice(0, MAX_TITLE_LEN),
      index: 0,
    };
  }

  const state = readState();
  const completed = new Set();   // indici risolti in questa sessione

  /** Equazioni valide + scarti, per il messaggio d'errore. */
  function partition() {
    const valid = [];
    const rejected = [];
    state.raw.forEach((raw) => {
      const res = validateEq(raw);
      if (res.ok) valid.push(res.value);
      else rejected.push({ raw: String(raw), error: res.error });
    });
    return { valid, rejected };
  }

  // -- URL condivisibile -----------------------------------------------------

  /** URL della scheda descritta da `eqs` + opzioni (assoluto, condivisibile). */
  function buildUrl(eqs, opts) {
    const params = new URLSearchParams();
    // URLSearchParams codifica "+" come %2B e "=" come %3D: senza, `?eq=2x+3=8`
    // arriverebbe come "2x 3" con un uguale di troppo nella query.
    eqs.forEach((e) => params.append('eq', e));
    const t = opts.target;
    if (t && t.isola) params.set('isola', t.isola);
    if (t && t.forma) {
      params.set('forma', t.forma);
      if (t.incognita) params.set('incognita', t.incognita);
    }
    // Esplicito: senza, i `defaults` dell'istanza rimetterebbero il loro
    // traguardo a chi apre il link.
    if (!t) params.set('libera', '1');
    if (opts.moves && opts.moves.length) params.set('mosse', opts.moves.join(';'));
    if (opts.title) params.set('titolo', opts.title);
    if (opts.noEditor) params.set('noeditor', '1');
    const base = window.location.origin + window.location.pathname;
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  // -- Rendering della scheda ------------------------------------------------

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  const sheet = el('section', 'tool-sheet');
  const builderWrap = el('details', 'tool-builder');
  root.textContent = '';
  root.appendChild(sheet);
  // Con `noeditor` la pagina è quella dello studente: esiste solo la scheda.
  if (!state.noEditor) root.appendChild(builderWrap);

  function renderSheet() {
    const { valid, rejected } = partition();
    const target = validateTarget(state.target);
    const mosse = validateMoves(state.moves);
    sheet.textContent = '';

    const avvisi = [];
    rejected.forEach((r) => avvisi.push(`"${r.raw.slice(0, 80)}" — ${r.error}`));
    if (!target.ok) avvisi.push(`Traguardo ignorato — ${target.error}`);
    else if (target.warn) avvisi.push(target.warn);
    mosse.rejected.forEach((id) => avvisi.push(`Mossa sconosciuta "${id}": ignorata`));

    if (avvisi.length) {
      const warn = el('div', 'tool-warning');
      warn.appendChild(el('p', null, avvisi.length === 1
        ? 'Una parte del link è stata ignorata:'
        : `${avvisi.length} parti del link sono state ignorate:`));
      const list = el('ul');
      // textContent ovunque: il contenuto arriva dall'URL, mai innerHTML.
      avvisi.forEach((riga) => list.appendChild(el('li', null, riga)));
      warn.appendChild(list);
      sheet.appendChild(warn);
    }

    if (!valid.length) {
      const empty = el('div', 'tool-empty');
      empty.appendChild(el('p', null, 'Nessun esercizio in questa scheda.'));
      empty.appendChild(el('p', 'hint', state.noEditor
        ? 'Il link potrebbe essere incompleto: chiedi all\'insegnante di rimandartelo.'
        : 'Componi la tua scheda qui sotto: otterrai un link da condividere.'));
      sheet.appendChild(empty);
      if (!state.noEditor) builderWrap.open = true;
      return;
    }

    if (state.index >= valid.length) state.index = valid.length - 1;
    if (state.index < 0) state.index = 0;

    if (state.title) sheet.appendChild(el('h2', 'tool-sheet-title', state.title));

    // Barra di avanzamento: un pallino per esercizio, cliccabile.
    const bar = el('div', 'tool-progress');
    bar.appendChild(el('span', 'tool-counter',
      `Esercizio ${state.index + 1} di ${valid.length}`));
    if (valid.length > 1) {
      const dots = el('div', 'tool-dots');
      valid.forEach((_, i) => {
        const dot = el('button', 'tool-dot', String(i + 1));
        dot.type = 'button';
        dot.setAttribute('aria-label', `Vai all'esercizio ${i + 1}`);
        if (i === state.index) dot.classList.add('current');
        if (completed.has(i)) dot.classList.add('done');
        dot.addEventListener('click', () => { state.index = i; renderSheet(); });
        dots.appendChild(dot);
      });
      bar.appendChild(dots);
    }
    sheet.appendChild(bar);

    // La lavagna corrente. Ogni render crea un <x-algebra> nuovo: il componente
    // costruisce il proprio stato in connectedCallback, quindi rimontarlo è
    // anche il modo naturale di ricominciare da capo.
    const card = el('div', 'tool-exercise');
    const alg = document.createElement('x-algebra');
    alg.id = `tool-algebra-${state.index}`;
    alg.dataset.eq = valid[state.index];
    if (target.ok && target.value) {
      alg.dataset.traguardo = JSON.stringify(target.value);
    }
    if (mosse.moves.length) alg.dataset.mosse = JSON.stringify(mosse.moves);
    card.appendChild(alg);
    sheet.appendChild(card);

    const idx = state.index;
    alg.addEventListener('goal-complete', () => {
      completed.add(idx);
      const dot = sheet.querySelectorAll('.tool-dot')[idx];
      if (dot) dot.classList.add('done');
      // Esercizio risolto: "Successivo" diventa l'azione principale.
      const nextBtn = sheet.querySelector('.tool-next');
      if (nextBtn && !nextBtn.disabled) nextBtn.classList.add('btn-primary');
    });

    // Navigazione
    const nav = el('div', 'tool-nav');
    const prev = el('button', 'btn btn-secondary', '← Precedente');
    prev.type = 'button';
    prev.disabled = state.index === 0;
    prev.addEventListener('click', () => { state.index -= 1; renderSheet(); });

    const restart = el('button', 'btn btn-secondary', '↻ Ricomincia');
    restart.type = 'button';
    restart.addEventListener('click', () => { completed.delete(state.index); renderSheet(); });

    const next = el('button', 'btn btn-secondary tool-next', 'Successivo →');
    next.type = 'button';
    next.disabled = state.index >= valid.length - 1;
    if (completed.has(state.index) && !next.disabled) next.classList.add('btn-primary');
    next.addEventListener('click', () => { state.index += 1; renderSheet(); });

    nav.appendChild(prev);
    nav.appendChild(restart);
    nav.appendChild(next);
    sheet.appendChild(nav);
  }

  // -- Costruttore di link ---------------------------------------------------

  function renderBuilder() {
    builderWrap.textContent = '';
    builderWrap.appendChild(el('summary', null, 'Componi una scheda e ottieni il link'));

    const form = el('div', 'tool-builder-body');

    const titleField = el('label', 'tool-field');
    titleField.appendChild(el('span', null, 'Titolo della scheda (facoltativo)'));
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.maxLength = MAX_TITLE_LEN;
    titleInput.value = state.title;
    titleInput.placeholder = 'Es. Equazioni per giovedì';
    titleField.appendChild(titleInput);
    form.appendChild(titleField);

    const eqField = el('label', 'tool-field');
    eqField.appendChild(el('span', null, 'Equazioni — una per riga'));
    const textarea = document.createElement('textarea');
    textarea.rows = 6;
    textarea.spellcheck = false;
    textarea.value = state.raw.join('\n');
    textarea.placeholder = '2x + 3 = 8\n5x + 4 - 2x = 9';
    eqField.appendChild(textarea);
    form.appendChild(eqField);

    form.appendChild(el('p', 'tool-hint',
      'Una lettera = una variabile (xy è x·y). Operatori: + − * (per) / (diviso) '
      + '^ (potenza), parentesi ( ) [ ] { }, al massimo un =. Fra due numeri la '
      + 'barra è una frazione: 5/2 è un numero.'));

    // -- Traguardo
    const goalField = el('label', 'tool-field');
    goalField.appendChild(el('span', null, 'Traguardo della scheda'));
    const goalSelect = document.createElement('select');
    const voci = [['', 'Lavagna libera (nessun traguardo)'], ['isola', 'Isolare una variabile']]
      .concat(Object.keys(FORME).map((f) => [`forma:${f}`, FORME[f]]));
    voci.forEach(([valore, testo]) => {
      const opt = document.createElement('option');
      opt.value = valore;
      opt.textContent = testo;
      goalSelect.appendChild(opt);
    });
    const iniziale = validateTarget(state.target);
    const t0 = iniziale.ok ? iniziale.value : null;
    goalSelect.value = t0 ? (t0.isola ? 'isola' : `forma:${t0.forma}`) : '';
    goalField.appendChild(goalSelect);
    form.appendChild(goalField);

    const letterField = el('label', 'tool-field');
    const letterLabel = el('span', null, 'Variabile');
    letterField.appendChild(letterLabel);
    const letterInput = document.createElement('input');
    letterInput.type = 'text';
    letterInput.maxLength = 1;
    letterInput.size = 2;
    letterInput.value = (t0 && (t0.isola || t0.incognita)) || '';
    letterInput.placeholder = 'x';
    letterField.appendChild(letterInput);
    form.appendChild(letterField);

    // -- Mosse
    const limitBox = el('label', 'tool-check');
    const limitInput = document.createElement('input');
    limitInput.type = 'checkbox';
    limitInput.checked = validateMoves(state.moves).moves.length > 0;
    limitBox.appendChild(limitInput);
    limitBox.appendChild(el('span', null, 'Limita le mosse a disposizione'));
    form.appendChild(limitBox);

    const movesBox = el('div', 'tool-moves');
    const attive = validateMoves(state.moves).moves;
    const moveInputs = Object.keys(catalogo()).map((id) => {
      const mossa = catalogo()[id];
      const label = el('label', 'tool-check');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = id;
      input.checked = !attive.length || attive.indexOf(id) !== -1;
      label.appendChild(input);
      label.appendChild(el('span', null, mossa.etichetta || id));
      movesBox.appendChild(label);
      return input;
    });
    form.appendChild(movesBox);
    const movesHint = el('p', 'tool-hint',
      'Prima di condividere una scheda con le mosse limitate, giocala: è facile '
      + 'togliere senza accorgersene la mossa che serviva a chiudere.');
    form.appendChild(movesHint);

    const errors = el('div', 'tool-builder-errors');
    form.appendChild(errors);

    const linkRow = el('div', 'tool-link-row');
    const linkInput = document.createElement('input');
    linkInput.type = 'text';
    linkInput.readOnly = true;
    linkInput.className = 'tool-link';
    linkInput.setAttribute('aria-label', 'Link della scheda');
    const copyBtn = el('button', 'btn btn-secondary', 'Copia');
    copyBtn.type = 'button';
    const applyBtn = el('button', 'btn btn-primary', 'Prova la scheda');
    applyBtn.type = 'button';
    linkRow.appendChild(linkInput);
    linkRow.appendChild(copyBtn);
    linkRow.appendChild(applyBtn);
    form.appendChild(linkRow);

    form.appendChild(el('p', 'tool-hint',
      'Chi apre il link vede solo la scheda: gli esercizi non si possono cambiare.'));

    /** La lettera serve a `isola` (obbligatoria) e a `ax=b` (facoltativa). */
    function syncOptions() {
      const scelta = goalSelect.value;
      const serve = scelta === 'isola' || scelta === 'forma:ax=b';
      letterField.hidden = !serve;
      letterLabel.textContent = scelta === 'isola'
        ? 'Variabile da isolare'
        : 'Incognita (serve solo se in gioco c\'è più di una lettera)';
      movesBox.hidden = !limitInput.checked;
      movesHint.hidden = !limitInput.checked;
    }

    /** Legge il form → { eqs, options } e aggiorna link ed errori. */
    function collect() {
      syncOptions();
      const lines = textarea.value.split('\n').map((l) => l.trim()).filter(Boolean);
      const eqs = [];
      const problemi = [];
      lines.slice(0, MAX_EXERCISES).forEach((line) => {
        const res = validateEq(line);
        if (res.ok) eqs.push(res.value);
        else problemi.push(`"${line.slice(0, 60)}" — ${res.error}`);
      });
      if (lines.length > MAX_EXERCISES) {
        problemi.unshift(`Massimo ${MAX_EXERCISES} esercizi per scheda: le righe in più sono ignorate.`);
      }

      const scelta = goalSelect.value;
      const lettera = letterInput.value.trim();
      const spec = scelta === 'isola' ? { isola: lettera }
        : scelta ? { forma: scelta.slice('forma:'.length), incognita: lettera }
          : {};
      const target = validateTarget(spec);
      const traguardoKo = (scelta === 'isola' && !lettera) || !target.ok;
      if (scelta === 'isola' && !lettera) {
        problemi.push('Isolare una variabile: manca la lettera.');
      } else if (!target.ok) {
        problemi.push(target.error);
      }

      const moves = limitInput.checked
        ? moveInputs.filter((i) => i.checked).map((i) => i.value)
        : [];
      if (limitInput.checked && !moves.length) {
        problemi.push('Con le mosse limitate, almeno una va lasciata.');
      }

      errors.textContent = '';
      problemi.forEach((p) => errors.appendChild(el('p', null, p)));

      const options = {
        target: target.ok ? target.value : null,
        moves,
        title: titleInput.value.trim().slice(0, MAX_TITLE_LEN),
      };
      // Il link da condividere è quello "per gli studenti": porta la scheda,
      // non il costruttore. Qui invece (`Prova la scheda`) l'editor resta.
      // Con un traguardo incompleto il link non si dà: sarebbe una lavagna
      // libera spedita alla classe al posto dell'esercizio.
      linkInput.value = traguardoKo
        ? '' : buildUrl(eqs, Object.assign({ noEditor: true }, options));
      applyBtn.disabled = eqs.length === 0 || traguardoKo;
      return { eqs, options };
    }

    [textarea, titleInput, letterInput].forEach((n) => n.addEventListener('input', collect));
    [goalSelect, limitInput].forEach((n) => n.addEventListener('change', collect));
    moveInputs.forEach((n) => n.addEventListener('change', collect));

    copyBtn.addEventListener('click', () => {
      collect();
      const done = () => {
        copyBtn.textContent = 'Copiato ✓';
        setTimeout(() => { copyBtn.textContent = 'Copia'; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(linkInput.value).then(done, () => {
          linkInput.select();
          copyBtn.textContent = 'Copia con Ctrl+C';
        });
      } else {
        linkInput.select();
        copyBtn.textContent = 'Copia con Ctrl+C';
      }
    });

    applyBtn.addEventListener('click', () => {
      const { eqs, options } = collect();
      if (!eqs.length) return;
      state.raw = eqs;
      state.target = options.target || {};
      state.moves = options.moves;
      state.title = options.title;
      state.index = 0;
      completed.clear();
      // L'indirizzo della pagina diventa quello della scheda: ricaricare o
      // condividere la pagina dà lo stesso risultato di "Copia".
      window.history.replaceState(null, '', buildUrl(eqs, options));
      renderSheet();
      sheet.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    collect();
    builderWrap.appendChild(form);
  }

  renderSheet();
  if (!state.noEditor) {
    renderBuilder();
    // Pagina aperta senza parametri: il costruttore è la cosa da fare.
    if (!state.fromUrl) builderWrap.open = true;
  }
})();
