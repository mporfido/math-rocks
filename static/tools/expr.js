/**
 * Strumento "espressioni" — <x-expr> a pagina intera, configurabile via URL.
 *
 * Monta una SCHEDA di esercizi dentro `.tool-root` leggendo i parametri della
 * query string. Il sito è statico (Frozen-Flask congela i percorsi, non le
 * query string): la pagina è sempre la stessa e la scheda nasce qui, nel
 * browser. Un link è quindi già un esercizio pronto da condividere.
 *
 * Parametri:
 *   ex      espressione (ripetibile: ?ex=...&ex=... ; accettato anche un solo
 *           parametro con più espressioni separate da "|")
 *   mode    "powers" → proprietà delle potenze (le potenze restano simboliche)
 *   noeval  "1" → in modalità potenze vieta la valutazione numerica
 *   steps   "1" → mostra anche lo svolgimento classico
 *   titolo  titolo della scheda
 *   noeditor "1" → pagina "per gli studenti": si vede solo la scheda, il
 *           costruttore di link non viene montato. È il parametro che il
 *           costruttore aggiunge da sé al link da copiare, così chi lo riceve
 *           svolge gli esercizi e basta (non è una protezione: chi conosce
 *           l'indirizzo può sempre aprire lo strumento senza parametri).
 *
 * Senza parametri si usano i `defaults` dell'istanza (content/tools.yaml) e il
 * costruttore di link si apre già espanso.
 *
 * NB: qui l'espressione NON è più "input fidato dell'autore" come nel markdown
 * di un corso — chiunque può fabbricare un link. Le espressioni vengono quindi
 * validate (caratteri ammessi, parentesi bilanciate, lunghezze) prima di
 * arrivare al componente, che ha comunque i suoi limiti interni.
 */
(function () {
  'use strict';

  const root = document.querySelector('.tool-root[data-kind="expr"]');
  if (!root) return;

  // -- Limiti (difesa contro link malformati o ostili) -----------------------
  const MAX_EXPR_LEN = 200;    // caratteri per espressione
  const MAX_EXERCISES = 50;    // esercizi per scheda
  const MAX_DIGITS = 12;       // cifre di un singolo numero
  const MAX_TITLE_LEN = 120;

  // Alfabeto dell'espressione: cifre, spazi, operatori, parentesi (+ i glifi
  // unicode che il tokenizer di x-expr già normalizza).
  const ALLOWED = /^[0-9\s+\-*:^/()[\]{}×÷−]+$/;
  const OPEN = { '(': ')', '[': ']', '{': '}' };
  const CLOSE = { ')': '(', ']': '[', '}': '{' };

  /**
   * Valida un'espressione arrivata dall'URL o dal costruttore.
   * Ritorna { ok: true, value } oppure { ok: false, error }.
   */
  function validateExpr(raw) {
    // I caratteri di controllo non passano comunque da ALLOWED, qui basta trim.
    const value = String(raw == null ? '' : raw).trim();
    if (!value) return { ok: false, error: 'espressione vuota' };
    if (value.length > MAX_EXPR_LEN) {
      return { ok: false, error: `troppo lunga (max ${MAX_EXPR_LEN} caratteri)` };
    }
    if (!ALLOWED.test(value)) {
      return { ok: false, error: 'contiene caratteri non ammessi' };
    }
    const longNumber = value.match(new RegExp(`\\d{${MAX_DIGITS + 1},}`));
    if (longNumber) {
      return { ok: false, error: `numero troppo grande (max ${MAX_DIGITS} cifre)` };
    }
    // Parentesi bilanciate e dello stesso tipo (il parser lo verificherebbe
    // comunque, ma così il messaggio è nostro e arriva prima del mount).
    const stack = [];
    for (const c of value) {
      if (OPEN[c]) stack.push(c);
      else if (CLOSE[c] && stack.pop() !== CLOSE[c]) {
        return { ok: false, error: 'parentesi non bilanciate' };
      }
    }
    if (stack.length) return { ok: false, error: 'parentesi non bilanciate' };
    return { ok: true, value };
  }

  // -- Stato -----------------------------------------------------------------

  let defaults = {};
  try {
    defaults = JSON.parse(root.dataset.defaults || '{}') || {};
  } catch (err) {
    defaults = {};
  }

  /** Espressioni dai parametri: `ex` ripetuto e/o separato da "|". */
  function readExpressions(params) {
    const raw = params.getAll('ex');
    const fromUrl = raw.length
      ? raw.reduce((acc, v) => acc.concat(String(v).split('|')), [])
      : (Array.isArray(defaults.ex) ? defaults.ex : (defaults.ex ? [defaults.ex] : []));
    return fromUrl.slice(0, MAX_EXERCISES);
  }

  function readState() {
    const params = new URLSearchParams(window.location.search);
    const hasParams = params.has('ex') || params.has('mode');
    const flag = (name, fallback) =>
      params.has(name) ? params.get(name) === '1' : Boolean(fallback);

    const mode = params.has('mode') ? params.get('mode') : (defaults.mode || '');
    const powers = mode === 'powers';
    return {
      // `fromUrl` distingue "link condiviso" da "pagina aperta a mano":
      // nel secondo caso il costruttore si apre già espanso.
      fromUrl: hasParams,
      raw: readExpressions(params),
      powers,
      showSteps: flag('steps', defaults.steps),
      noEval: powers && flag('noeval', defaults.noeval),
      noEditor: flag('noeditor', defaults.noeditor),
      title: String(params.get('titolo') || defaults.titolo || '').slice(0, MAX_TITLE_LEN),
      index: 0,
    };
  }

  const state = readState();
  const completed = new Set();   // indici risolti in questa sessione

  /** Espressioni valide + eventuali scarti, per il messaggio d'errore. */
  function partition() {
    const valid = [];
    const rejected = [];
    state.raw.forEach((raw) => {
      const res = validateExpr(raw);
      if (res.ok) valid.push(res.value);
      else rejected.push({ raw: String(raw), error: res.error });
    });
    return { valid, rejected };
  }

  // -- URL condivisibile -----------------------------------------------------

  /** URL della scheda descritta da `exprs` + opzioni (assoluto, condivisibile). */
  function buildUrl(exprs, opts) {
    const params = new URLSearchParams();
    // URLSearchParams codifica "+" come %2B: senza questo `?ex=2+3` arriverebbe
    // al browser come "2 3" (in query string il più è uno spazio).
    exprs.forEach((e) => params.append('ex', e));
    if (opts.powers) params.set('mode', 'powers');
    if (opts.powers && opts.noEval) params.set('noeval', '1');
    if (opts.showSteps) params.set('steps', '1');
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
    sheet.textContent = '';

    if (rejected.length) {
      const warn = el('div', 'tool-warning');
      warn.appendChild(el('p', null,
        rejected.length === 1
          ? 'Un\'espressione del link è stata ignorata:'
          : `${rejected.length} espressioni del link sono state ignorate:`));
      const list = el('ul');
      rejected.forEach((r) => {
        // textContent ovunque: il contenuto arriva dall'URL, mai innerHTML.
        list.appendChild(el('li', null, `"${r.raw.slice(0, 80)}" — ${r.error}`));
      });
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
    const counter = el('span', 'tool-counter', `Esercizio ${state.index + 1} di ${valid.length}`);
    bar.appendChild(counter);
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

    // L'esercizio corrente. Ogni render crea un <x-expr> nuovo: il componente
    // costruisce il proprio stato in connectedCallback, quindi rimontarlo è
    // anche il modo naturale di ricominciare da capo.
    const card = el('div', 'tool-exercise');
    const expr = document.createElement('x-expr');
    expr.id = `tool-expr-${state.index}`;
    expr.dataset.expr = valid[state.index];
    if (state.powers) expr.dataset.mode = 'powers';
    if (state.noEval) expr.dataset.noEval = 'true';
    if (state.showSteps) expr.dataset.showSteps = 'true';
    card.appendChild(expr);
    sheet.appendChild(card);

    const idx = state.index;
    expr.addEventListener('goal-complete', () => {
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

    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      MathJax.typesetPromise([sheet]).catch(() => {});
    }
  }

  // -- Costruttore di link ---------------------------------------------------

  function renderBuilder() {
    builderWrap.textContent = '';
    const summary = el('summary', null, 'Componi una scheda e ottieni il link');
    builderWrap.appendChild(summary);

    const form = el('div', 'tool-builder-body');

    const titleField = el('label', 'tool-field');
    titleField.appendChild(el('span', null, 'Titolo della scheda (facoltativo)'));
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.maxLength = MAX_TITLE_LEN;
    titleInput.value = state.title;
    titleInput.placeholder = 'Es. Esercizi per giovedì';
    titleField.appendChild(titleInput);
    form.appendChild(titleField);

    const exField = el('label', 'tool-field');
    exField.appendChild(el('span', null, 'Espressioni — una per riga'));
    const textarea = document.createElement('textarea');
    textarea.rows = 6;
    textarea.spellcheck = false;
    textarea.value = state.raw.join('\n');
    textarea.placeholder = '(4 + 5*4) - (8:2 + 6)\n12 : (2 + 2) + 3*(7 - 5)';
    exField.appendChild(textarea);
    form.appendChild(exField);

    form.appendChild(el('p', 'tool-hint',
      'Operatori: + − * (per) : (diviso) ^ (potenza). Parentesi ( ) [ ] { }. '
      + 'Una frazione tra interi si scrive 3/4 ed è un numero, non una divisione.'));

    const opts = el('div', 'tool-options');

    function checkbox(labelText, checked) {
      const label = el('label', 'tool-check');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = checked;
      label.appendChild(input);
      label.appendChild(el('span', null, labelText));
      opts.appendChild(label);
      return input;
    }

    const powersBox = checkbox('Proprietà delle potenze', state.powers);
    const noEvalBox = checkbox('Vieta il calcolo delle potenze', state.noEval);
    const stepsBox = checkbox('Mostra anche lo svolgimento classico', state.showSteps);
    form.appendChild(opts);

    // `noeval` ha senso solo con le potenze.
    function syncOptions() {
      noEvalBox.disabled = !powersBox.checked;
      if (!powersBox.checked) noEvalBox.checked = false;
    }
    powersBox.addEventListener('change', syncOptions);
    syncOptions();

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

    /** Legge il form → { exprs, opts, rejected } e aggiorna link ed errori. */
    function collect() {
      const lines = textarea.value.split('\n').map((l) => l.trim()).filter(Boolean);
      const exprs = [];
      const rejected = [];
      lines.slice(0, MAX_EXERCISES).forEach((line) => {
        const res = validateExpr(line);
        if (res.ok) exprs.push(res.value);
        else rejected.push({ raw: line, error: res.error });
      });

      errors.textContent = '';
      if (lines.length > MAX_EXERCISES) {
        errors.appendChild(el('p', null, `Massimo ${MAX_EXERCISES} esercizi per scheda: le righe in più sono ignorate.`));
      }
      rejected.forEach((r) => {
        errors.appendChild(el('p', null, `"${r.raw.slice(0, 60)}" — ${r.error}`));
      });

      const options = {
        powers: powersBox.checked,
        noEval: noEvalBox.checked,
        showSteps: stepsBox.checked,
        title: titleInput.value.trim().slice(0, MAX_TITLE_LEN),
      };
      // Il link da condividere è quello "per gli studenti": porta la scheda,
      // non il costruttore. Qui invece (`Prova la scheda`) l'editor resta.
      linkInput.value = buildUrl(exprs, Object.assign({ noEditor: true }, options));
      applyBtn.disabled = exprs.length === 0;
      return { exprs, options };
    }

    [textarea, titleInput].forEach((node) => node.addEventListener('input', collect));
    [powersBox, noEvalBox, stepsBox].forEach((node) => node.addEventListener('change', collect));

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
      const { exprs, options } = collect();
      if (!exprs.length) return;
      state.raw = exprs;
      state.powers = options.powers;
      state.noEval = options.powers && options.noEval;
      state.showSteps = options.showSteps;
      state.title = options.title;
      state.index = 0;
      completed.clear();
      // L'indirizzo della pagina diventa quello della scheda: ricaricare o
      // condividere la pagina dà lo stesso risultato di "Copia".
      window.history.replaceState(null, '', buildUrl(exprs, options));
      renderSheet();
      sheet.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    collect();
    builderWrap.appendChild(form);
  }

  renderSheet();
  renderBuilder();
  // Pagina aperta senza parametri: il costruttore è la cosa da fare.
  if (!state.fromUrl) builderWrap.open = true;
})();
