"""Pre-processori per sintassi markdown custom"""
import re
import json
import html as html_lib
import yaml


def process_graphs(content, graph_counter):
    """
    Converte blocchi :::graph YAML ::: in <x-graph> web component

    Sintassi (layer componibili, tutti opzionali e combinabili):
        :::graph
        xrange: "-6,6"
        bind: a
        functions:
          - expr: "sin(a * x)"
        points:
          - target: "3,2"
        boundpoints:
          - {x: ax, y: ay, label: A}
        :::

    `expr` top-level è una scorciatoia per una singola curva (con eventuale
    `xclip`); equivale a functions: [{expr, xclip}].

    Il grafico riceve un id per il goal tracking solo se almeno un punto
    di `points` ha un `target` (gli altri layer sono solo esplorativi).

    Args:
        content: Contenuto markdown
        graph_counter: Contatore per ID univoci

    Returns:
        Tuple (contenuto processato, nuovo valore counter)
    """
    graph_block_pattern = re.compile(
        r':::graph[ \t]*\n(.*?)\n:::',
        re.DOTALL
    )

    def replace_graph(match):
        nonlocal graph_counter
        # Sostituisce tab con spazi prima del parsing: YAML non accetta tab
        # come indentazione, ma alcuni editor li inseriscono automaticamente
        yaml_content = match.group(1).expandtabs(4)

        try:
            config = yaml.safe_load(yaml_content) or {}
        except yaml.YAMLError:
            config = {}

        if 'type' in config:
            # La sintassi legacy `type:` non è più supportata: meglio fallire
            # rumorosamente in build che produrre un grafico sbagliato in pagina.
            raise ValueError(
                f"Blocco :::graph con 'type: {config['type']}' non supportato: "
                "usa le chiavi componibili functions/points/boundpoints "
                "(vedi GRAFICI.md)"
            )

        # Scorciatoia: expr top-level = singola curva (con eventuale xclip)
        if 'expr' in config:
            entry = {'expr': config.pop('expr')}
            if 'xclip' in config:
                entry['xclip'] = config.pop('xclip')
            config.setdefault('functions', []).append(entry)

        graph_counter += 1

        attrs = []

        # Goal tracciabile solo se c'è almeno un punto con obiettivo
        points = config.get('points') or []
        has_target = isinstance(points, list) and any(
            isinstance(p, dict) and p.get('target') for p in points
        )
        if has_target:
            attrs.append(f'id="graph-{graph_counter - 1}"')

        for key, value in config.items():
            if isinstance(value, bool):
                # bool Python → "true"/"false" minuscolo per JS
                value = str(value).lower()
            elif key == 'bind' and isinstance(value, list):
                value = ','.join(str(v) for v in value)
            elif key in ('points', 'functions', 'boundpoints') and isinstance(value, list):
                # Serializza la lista come JSON e HTML-escapa le virgolette
                attrs.append(f'data-{key}="{html_lib.escape(json.dumps(value))}"')
                continue
            attrs.append(f'data-{key}="{html_lib.escape(str(value), quote=True)}"')

        return f'<x-graph {" ".join(attrs)}></x-graph>'

    processed = graph_block_pattern.sub(replace_graph, content)
    return processed, graph_counter


def process_p5(content, p5_counter):
    """
    Converte blocchi :::p5 ... ::: in <x-p5> web component (sketch p5.js).

    Due modalità:

    1. Sketch INLINE: il codice JS dello sketch è nel corpo del blocco (il corpo
       è codice al 100%, così non collide con il separatore di step `---`):
        :::p5 goal height=400 bind=a
        p.setup = () => { p.createCanvas(400, 400); };
        p.draw = () => {
          const a = ctx.model.a;       // valore live di slider/campi della pagina
          // ...disegno...
          if (a === 5) ctx.complete(); // criterio deciso dall'autore
        };
        :::

    2. Sketch RIUSABILE per nome: il codice vive in static/components/p5-sketches.js
       (registro window.P5Sketches) e il markdown lo richiama con `sketch=<nome>`
       passando i parametri sulla riga di apertura. Il corpo è vuoto:
        :::p5 sketch=rettangoli-divisori n=6 height=360
        :::

    Opzioni riconosciute sulla riga di apertura:
        goal           flag: rende lo sketch un goal (gli assegna un id)
        height=400     altezza del canvas (default 400)
        width=600      larghezza del canvas (opzionale)
        bind=a,b       variabili da osservare per ctx.onChange / redraw
        sketch=nome    usa lo sketch registrato `nome` (niente corpo JS)
    Ogni altra coppia `chiave=valore` è un PARAMETRO dello sketch: viene raccolto
    e serializzato in data-params (JSON), disponibile allo sketch come ctx.params.
    I valori numerici (`n=6`) sono convertiti in numeri.

    Lo sketch riceve `p` (istanza p5 in instance mode) e `ctx`:
        ctx.complete()    segnala il completamento del goal (idempotente)
        ctx.model         valori live di slider e campi numerici (${a}, ${ax}, …)
        ctx.onChange(cb)  registra una callback chiamata a ogni cambio di variabile
        ctx.params        parametri passati dal markdown (solo sketch riusabili)

    Lo sketch conta come goal (riceve un id) SOLO con il flag `goal`; altrimenti
    è pura visualizzazione e non blocca lo step.

    Il corpo JS può contenere qualsiasi carattere (incluso `` ` ``, `${`, `[[`),
    quindi il blocco viene estratto in un marker e l'HTML finale (con il codice
    dentro uno <script type="application/x-p5-sketch"> non eseguibile) viene
    restituito come replacement da applicare DOPO il rendering markdown: così né
    mistune né gli altri preprocessori toccano lo sketch.

    Args:
        content: Contenuto markdown
        p5_counter: Contatore per ID univoci

    Returns:
        Tuple (contenuto con marker, dict marker→HTML, nuovo valore counter)
    """
    # Opzioni con un significato speciale: NON diventano parametri dello sketch.
    RESERVED_OPTS = {'goal', 'height', 'width', 'bind', 'sketch'}

    # `^` ancora l'apertura a inizio riga: un eventuale `:::p5` citato a metà
    # frase (es. `` `:::p5` `` nel testo) non viene catturato. La chiusura è un
    # `:::` su riga propria. Il `\n?` prima di `:::` rende il corpo opzionale
    # (uno sketch riusabile `sketch=...` non ha corpo JS).
    pattern = re.compile(r'^:::p5[ \t]*([^\n]*)\n(.*?)\n?:::[ \t]*$', re.DOTALL | re.MULTILINE)
    replacements = {}

    def coerce(value):
        """Converte i parametri numerici in int/float; il resto resta stringa."""
        try:
            return int(value)
        except ValueError:
            pass
        try:
            return float(value)
        except ValueError:
            return value

    def replace_p5(match):
        nonlocal p5_counter
        options_str = match.group(1).strip()
        code = match.group(2)

        # Parsing opzioni: token separati da spazi; `goal` è un flag,
        # gli altri sono coppie chiave=valore. Le chiavi non riservate sono
        # parametri dello sketch.
        opts = {}
        params = {}
        for token in options_str.split():
            if '=' in token:
                key, _, value = token.partition('=')
                key = key.strip()
                value = value.strip()
                if key in RESERVED_OPTS:
                    opts[key] = value
                else:
                    params[key] = coerce(value)
            else:
                opts[token] = True

        marker = f'XP5BLOCK{p5_counter}X'

        attrs = []
        # Id (quindi goal tracking) solo se richiesto col flag `goal`
        if opts.get('goal'):
            attrs.append(f'id="p5-{p5_counter}"')

        attrs.append(f'data-height="{opts.get("height", 400)}"')
        if opts.get('width'):
            attrs.append(f'data-width="{opts["width"]}"')
        if opts.get('bind'):
            attrs.append(f'data-bind="{opts["bind"]}"')
        if opts.get('sketch'):
            attrs.append(f'data-sketch="{html_lib.escape(opts["sketch"], quote=True)}"')
        if params:
            attrs.append(f'data-params="{html_lib.escape(json.dumps(params))}"')

        p5_counter += 1

        # Sketch riusabile (sketch=…): niente <script>, il codice è nel registro.
        if opts.get('sketch'):
            replacements[marker] = f'<x-p5 {" ".join(attrs)}></x-p5>'
        else:
            script = f'<script type="application/x-p5-sketch">\n{code}\n</script>'
            replacements[marker] = f'<x-p5 {" ".join(attrs)}>{script}</x-p5>'
        return marker

    processed = pattern.sub(replace_p5, content)
    return processed, replacements, p5_counter


def process_expr(content, expr_counter):
    """
    Converte blocchi :::expr ... ::: in <x-expr> web component
    (risoluzione grafica di un'espressione, metodo "Sciogliamo i nodi").

    Sintassi (una sola espressione per blocco):
        :::expr
        (4 + 5*4) - (8:2 + 6)
        :::

    Flag opzionali sulla riga di apertura del fence (separati da spazi):
        :::expr show-steps
        (4 + 5*4) - (8:2 + 6)
        :::
    `show-steps` mostra sotto l'albero lo svolgimento classico passo-passo.
    `powers` attiva la modalità potenze: le potenze restano simboliche e si
    riducono con le proprietà (stessa base, stesso esponente, potenza di
    potenza, cambio di base). `:::powers` è un alias di `:::expr powers`:
    stesso componente, zucchero sintattico. Con `powers` le righe dello
    svolgimento sono cronologiche (una per passaggio) invece che per livello.
    `no-eval` (solo con powers) vieta la valutazione numerica delle potenze:
    forza il percorso delle proprietà; l'esercizio deve essere risolvibile
    con le sole proprietà.

    Linguaggio dell'espressione (input fidato dell'autore):
        operatori: + - * (moltiplicazione) : (divisione) ^ (potenza)
        frazioni:  a/b tra interi è un letterale razionale atomico
        parentesi: ( ) [ ] { } (equivalenti, annidabili)

    Come :::p5, il corpo può contenere caratteri che mistune o gli altri
    preprocessori interpreterebbero (`*`, `[`, `]`, `{`, `}`): viene quindi
    estratto in un marker e l'HTML finale (con l'espressione in un attributo
    HTML-escaped) è restituito come replacement da applicare DOPO il rendering
    markdown. Il componente riceve sempre un id (è sempre un goal).

    Args:
        content: Contenuto markdown
        expr_counter: Contatore per ID univoci

    Returns:
        Tuple (contenuto con marker, dict marker→HTML, nuovo valore counter)
    """
    pattern = re.compile(
        r'^:::(?P<tag>expr|powers)[ \t]*(?P<opts>[^\n]*)\n(?P<body>.*?)\n:::[ \t]*$',
        re.DOTALL | re.MULTILINE,
    )
    replacements = {}

    def replace_expr(match):
        nonlocal expr_counter
        expr = match.group('body').strip()
        opts = match.group('opts').split()
        powers = match.group('tag') == 'powers' or 'powers' in opts
        show_steps_attr = ' data-show-steps="true"' if 'show-steps' in opts else ''
        mode_attr = ' data-mode="powers"' if powers else ''
        no_eval_attr = ' data-no-eval="true"' if powers and 'no-eval' in opts else ''
        marker = f'XEXPRBLOCK{expr_counter}X'
        expr_attr = html_lib.escape(expr, quote=True)
        replacements[marker] = (
            f'<x-expr id="expr-{expr_counter}" data-expr="{expr_attr}"'
            f'{show_steps_attr}{mode_attr}{no_eval_attr}></x-expr>'
        )
        expr_counter += 1
        return marker

    processed = pattern.sub(replace_expr, content)
    return processed, replacements, expr_counter


# Sezione del blocco :::theorem → statuto dei passi che contiene.
# I nomi delle sezioni sono SINTASSI (fissi); le etichette mostrate a schermo
# sono invece attributi con default (vedi DIMOSTRAZIONI.md §3).
THEOREM_SECTIONS = {
    'ipotesi': 'ipotesi',
    'tesi': 'tesi',
    'dimostrazione': 'dedotto',
    'distrattori': None,      # non sono passi: non hanno statuto
}

# Prefisso degli id impliciti, per sezione
THEOREM_PREFIXES = {
    'ipotesi': 'h',
    'tesi': 't',
    'dimostrazione': 'p',
    'distrattori': 'd',
}

THEOREM_LABELS = {
    'ipotesi': 'Ipotesi',
    'tesi': 'Tesi',
    'dimostrazione': 'Dimostrazione',
}

DISTRACTOR_TYPES = ('inutile', 'garanzia-sbagliata', 'falso')


def _parse_theorem_attrs(line):
    """
    Parsa gli attributi della riga di apertura `:::theorem ...`.

    Accetta `chiave=valore` e `chiave="valore con spazi"`.
    """
    attrs = {}
    for match in re.finditer(r'([\w-]+)=(?:"([^"]*)"|(\S+))', line):
        key = match.group(1).lower()
        attrs[key] = match.group(2) if match.group(2) is not None else match.group(3)
    return attrs


def _parse_annotation(raw):
    """
    Parsa l'annotazione in coda a una riga: `{t1, da: p2,p3, per: crit2}`.

    Restituisce (riferimento, campi):
    - `riferimento` è il token nudo iniziale (l'id di una tesi referenziata),
      `None` se assente;
    - i valori sono stringhe; le liste (`da: p2,p3`) restano da splittare.

    Le virgole separano i campi, ma compaiono anche DENTRO un valore
    (`da: p2,p3,p4`): un frammento senza `:` è la continuazione del campo
    precedente, non un campo nuovo.
    """
    ref = None
    fields = {}
    key = None
    for part in raw.split(','):
        part = part.strip()
        if not part:
            continue
        if ':' in part:
            name, _, value = part.partition(':')
            key = name.strip().lower()
            fields[key] = value.strip()
        elif key is None:
            ref = part
        else:
            fields[key] = f'{fields[key]},{part}' if fields[key] else part
    return ref, fields


def _split_theorem_sections(body):
    """
    Divide il corpo del blocco in sezioni `## nome`.

    Restituisce (sezioni, preambolo): `sezioni` è {nome: [righe grezze]},
    `preambolo` sono le righe `chiave: valore` prima della prima sezione
    (oggi solo `figura:`).
    """
    sections = {}
    preamble = {}
    current = None

    for line in body.split('\n'):
        stripped = line.strip()
        if not stripped:
            continue
        heading = re.match(r'^#{1,6}\s+(.+)$', stripped)
        if heading:
            name = heading.group(1).strip().lower()
            if name not in THEOREM_SECTIONS:
                raise ValueError(
                    f"sezione '{name}' non riconosciuta in :::theorem "
                    f"(ammesse: {', '.join(THEOREM_SECTIONS)})"
                )
            current = name
            sections.setdefault(current, [])
            continue
        if current is None:
            key, sep, value = stripped.partition(':')
            if sep and re.fullmatch(r'[\w-]+', key.strip()):
                preamble[key.strip().lower()] = value.strip()
            continue
        sections[current].append(stripped)

    return sections, preamble


def _parse_theorem_item(line, section, index):
    """
    Parsa una riga `- testo {da: …, per: …}` di una sezione.

    Restituisce un dict con id, testo, ref (tesi referenziata) e i campi
    dell'annotazione già normalizzati.
    """
    item_match = re.match(r'^-\s*(.*)$', line)
    if not item_match:
        raise ValueError(f"riga non riconosciuta nella sezione '{section}': {line}")

    rest = item_match.group(1).strip()

    # L'annotazione è l'ULTIMO gruppo tra graffe a fine riga: così un `${a}` o
    # un `\{` nel testo non viene scambiato per annotazione.
    ann_match = re.search(r'\{([^{}]*)\}\s*$', rest)
    ref, fields = (None, {})
    if ann_match:
        ref, fields = _parse_annotation(ann_match.group(1))
        rest = rest[:ann_match.start()].strip()

    # `per` è la sintassi d'autore, `perche` il nome del campo nel modello:
    # accettiamo entrambi in scrittura.
    warrant = fields.get('per') or fields.get('perche')
    premises = [p.strip() for p in fields.get('da', '').split(',') if p.strip()]

    return {
        'id': fields.get('id') or f'{THEOREM_PREFIXES[section]}{index}',
        'testo': rest,
        'ref': ref,
        'da': premises,
        'perche': warrant,
        'fig': fields.get('fig'),
        'tipo': fields.get('tipo'),
    }


def _check_theorem_cycles(steps, where):
    """Solleva ValueError se il grafo delle premesse contiene un ciclo."""
    graph = {s['id']: s['da'] for s in steps}
    state = {}  # id → 1 in visita, 2 chiuso

    def visit(node, path):
        if state.get(node) == 2:
            return
        if state.get(node) == 1:
            ciclo = ' → '.join(path[path.index(node):] + [node])
            raise ValueError(f'{where}: ciclo nelle premesse ({ciclo})')
        state[node] = 1
        for premise in graph.get(node, []):
            visit(premise, path + [node])
        state[node] = 2

    for step_id in graph:
        visit(step_id, [])


def _check_theorem_warrant(warrant, teoria, course_theorems, where):
    """
    Verifica che la garanzia citata esista nella teoria del corso.

    `teoria` contiene le voci di `teoria.yaml` PIÙ i teoremi già dimostrati
    fino a questo punto del corso: citare un teorema dimostrato più avanti
    significa non trovarlo qui, ed è un errore di progressione.
    """
    if teoria is None or warrant is None or warrant in teoria:
        return
    if course_theorems and warrant in course_theorems:
        raise ValueError(
            f"{where}: la garanzia '{warrant}' è un teorema dimostrato più "
            'avanti nel corso (dipendenza circolare nella progressione)'
        )
    raise ValueError(f"{where}: la garanzia '{warrant}' non esiste nella teoria del corso")


def process_theorem(content, theorem_counter, render_text=None,
                    teoria=None, course_theorems=None, collect=None, titoli=None):
    """
    Converte blocchi :::theorem ... ::: in <x-theorem> web component.

    Sintassi (vedi DIMOSTRAZIONI.md per il modello dati completo):

        :::theorem id=diag-par titolo="In un parallelogramma le diagonali…" modi=leggi,ordina
        figura: parallelogramma-diagonali

        ## ipotesi
        - ABCD è un parallelogramma {fig: quadrilatero}

        ## tesi
        - $AM \\cong MC$

        ## dimostrazione
        - AB è parallelo a DC {da: h1, per: def-par}
        - {t1, da: p1, per: corr}

        ## distrattori
        - $AC \\cong BD$ {per: diag-rett, tipo: falso}
        :::

    **Sezioni in scrittura, lista piatta in memoria**: lo `statuto` di ogni
    passo è derivato dalla sezione che lo contiene (`ipotesi`/`dedotto`/`tesi`),
    e ipotesi e tesi non sono duplicate nell'intestazione: quella è
    renderizzata dai passi stessi. L'ultimo passo non riscrive la tesi, la
    **referenzia** (`- {t1, da: p5, per: corr}`): il testo viene da `t1` e la
    catena ha un nodo terminale verificabile.

    Attributi della riga di apertura: `id` (registra il teorema nella teoria del
    corso), `titolo`, `modi` (default `leggi`), `mancanti` (default 2), `figura`
    (sketch mostrato accanto ai passi: i `fig:` ne nominano gli elementi);
    `ipotesi`/`tesi`/`dimostrazione` ridefiniscono le etichette mostrate
    (in fisica: Dati / Richiesto / Soluzione).

    Validazione in build (fallisce rumorosamente, DIMOSTRAZIONI.md §6): garanzia
    inesistente nella teoria o dimostrata più avanti nel corso, `da:` che punta a
    un id inesistente, cicli nel grafo delle premesse, tesi non raggiunta.

    Come :::p5 e :::expr il blocco viene estratto in un marker: il corpo contiene
    heading, liste e graffe che mistune e gli altri preprocessori
    interpreterebbero.

    Args:
        content: Contenuto markdown
        theorem_counter: Contatore per ID univoci
        render_text: Callable opzionale che renderizza il markdown inline del
            testo di ogni passo (`$…$`, grassetto, [[blank]])
        teoria: Dict della teoria del corso (id → {nome, enunciato, tipo}).
            Viene ARRICCHITO in loco con i teoremi dimostrati: un blocco con
            `id=` entra nella teoria e i teoremi successivi possono citarlo.
            Se None, la validazione delle garanzie è saltata.
        course_theorems: Insieme degli id di TUTTI i teoremi del corso, per
            distinguere "garanzia inesistente" da "dimostrata più avanti"
        collect: Lista opzionale a cui appendere la struttura di ogni teorema
            (id, titolo, passi, distrattori, figura, modi, html). Serve a chi
            compila un CORPUS e deve leggere le garanzie per costruire il grafo
            (build_corpus.py): l'HTML da solo obbligherebbe a rifare il parsing
            all'indietro dagli attributi.

    Returns:
        Tuple (contenuto con marker, dict marker→HTML, nuovo valore counter)
    """
    pattern = re.compile(r'^:::theorem[ \t]*([^\n]*)\n(.*?)\n:::[ \t]*$',
                         re.DOTALL | re.MULTILINE)
    replacements = {}
    render = render_text or (lambda text: text)

    def replace_theorem(match):
        nonlocal theorem_counter

        attrs = _parse_theorem_attrs(match.group(1))
        sections, preamble = _split_theorem_sections(match.group(2))
        # Le righe `chiave: valore` nel corpo (oggi `figura:`) non sovrascrivono
        # un attributo esplicito sulla riga di apertura.
        for key, value in preamble.items():
            attrs.setdefault(key, value)

        # L'enunciato può venire da fuori (in un corpus è teoria.yaml a
        # possederlo): l'attributo `titolo=` serve solo a chi scrive un teorema
        # che vive dentro una lezione e non ha un registro alle spalle.
        titolo = attrs.get('titolo') or (titoli or {}).get(attrs.get('id'), '')
        where = f"teorema '{attrs.get('id') or titolo or theorem_counter}'"

        # --- Parsing delle sezioni in liste di voci ---------------------------
        items = {}
        for section in THEOREM_SECTIONS:
            items[section] = [
                _parse_theorem_item(line, section, i)
                for i, line in enumerate(sections.get(section, []), start=1)
            ]

        if not items['tesi']:
            raise ValueError(f'{where}: manca la sezione "## tesi"')

        tesi_by_id = {item['id']: item for item in items['tesi']}

        # --- Lista piatta: ipotesi + passi della dimostrazione ----------------
        passi = []
        for item in items['ipotesi']:
            if item['perche']:
                raise ValueError(
                    f"{where}: l'ipotesi '{item['id']}' ha una garanzia; "
                    'le ipotesi valgono per ipotesi'
                )
            passi.append({
                'id': item['id'], 'testo': item['testo'],
                'statuto': 'ipotesi', 'da': [], 'perche': None, 'fig': item['fig'],
            })

        raggiunte = set()
        for item in items['dimostrazione']:
            if item['ref']:
                # Passo che referenzia una tesi: il testo viene da lì.
                tesi = tesi_by_id.get(item['ref'])
                if tesi is None:
                    raise ValueError(
                        f"{where}: il passo referenzia la tesi '{item['ref']}', "
                        'che non esiste'
                    )
                if item['testo']:
                    raise ValueError(
                        f"{where}: il passo che referenzia '{item['ref']}' non "
                        'deve riscrivere il testo della tesi'
                    )
                raggiunte.add(item['ref'])
                passi.append({
                    'id': tesi['id'], 'testo': tesi['testo'], 'statuto': 'tesi',
                    'da': item['da'], 'perche': item['perche'],
                    'fig': item['fig'] or tesi['fig'],
                })
            else:
                passi.append({
                    'id': item['id'], 'testo': item['testo'], 'statuto': 'dedotto',
                    'da': item['da'], 'perche': item['perche'], 'fig': item['fig'],
                })

        # --- Validazione (DIMOSTRAZIONI.md §6) -------------------------------
        ids = set()
        for passo in passi:
            if passo['id'] in ids:
                raise ValueError(f"{where}: id di passo duplicato '{passo['id']}'")
            ids.add(passo['id'])

        for passo in passi:
            for premise in passo['da']:
                if premise not in ids:
                    raise ValueError(
                        f"{where}: il passo '{passo['id']}' cita la premessa "
                        f"'{premise}', che non esiste"
                    )
            _check_theorem_warrant(passo['perche'], teoria, course_theorems,
                                   f"{where}, passo '{passo['id']}'")

        _check_theorem_cycles(passi, where)

        non_raggiunte = [t['id'] for t in items['tesi'] if t['id'] not in raggiunte]
        if non_raggiunte:
            raise ValueError(
                f"{where}: nessun passo raggiunge la tesi "
                f"{', '.join(non_raggiunte)} (serve una riga "
                f"`- {{{non_raggiunte[0]}, da: …, per: …}}`)"
            )

        distrattori = []
        for item in items['distrattori']:
            tipo = item['tipo'] or 'inutile'
            if tipo not in DISTRACTOR_TYPES:
                raise ValueError(
                    f"{where}: distrattore '{item['id']}' con tipo '{tipo}' "
                    f"non riconosciuto (ammessi: {', '.join(DISTRACTOR_TYPES)})"
                )
            _check_theorem_warrant(item['perche'], teoria, course_theorems,
                                   f"{where}, distrattore '{item['id']}'")
            distrattori.append({
                'id': item['id'], 'testo': item['testo'],
                'perche': item['perche'], 'tipo': tipo,
            })

        # --- Il teorema dimostrato entra nella teoria del corso ---------------
        if teoria is not None and attrs.get('id'):
            teoria.setdefault(attrs['id'], {
                'nome': titolo or attrs['id'],
                'enunciato': titolo or attrs['id'],
                'tipo': 'teorema',
            })

        # --- Serializzazione --------------------------------------------------
        for passo in passi:
            passo['testo'] = render(passo['testo'])
        for distrattore in distrattori:
            distrattore['testo'] = render(distrattore['testo'])

        # Nel componente la teoria serve come menu delle garanzie: ne bastano le
        # voci citate (dai passi e dai distrattori), non l'intero corso.
        citate = [p['perche'] for p in passi] + [d['perche'] for d in distrattori]
        teoria_usata = {
            key: value for key, value in (teoria or {}).items()
            if key in set(filter(None, citate))
        }

        etichette = {
            key: attrs.get(key, default) for key, default in THEOREM_LABELS.items()
        }

        html_attrs = [f'id="theorem-{theorem_counter}"']
        if attrs.get('id'):
            html_attrs.append(f'data-theorem-id="{html_lib.escape(attrs["id"], quote=True)}"')
        html_attrs.append(f'data-titolo="{html_lib.escape(render(titolo), quote=True)}"')
        html_attrs.append(f'data-modi="{html_lib.escape(attrs.get("modi", "leggi"), quote=True)}"')
        html_attrs.append(f'data-mancanti="{html_lib.escape(str(attrs.get("mancanti", 2)), quote=True)}"')
        if attrs.get('figura'):
            html_attrs.append(f'data-figura="{html_lib.escape(attrs["figura"], quote=True)}"')
            # Altezza SUGGERITA del canvas: uno sketch che si dimensiona da sé
            # (ctx.setHeight) la ignora.
            if attrs.get('figura-altezza'):
                html_attrs.append(
                    f'data-figura-altezza="{html_lib.escape(attrs["figura-altezza"], quote=True)}"')
        html_attrs.append(f'data-etichette="{html_lib.escape(json.dumps(etichette, ensure_ascii=False))}"')
        html_attrs.append(f'data-passi="{html_lib.escape(json.dumps(passi, ensure_ascii=False))}"')
        # Le tesi in ordine di dichiarazione: l'intestazione le mostra così,
        # a prescindere da dove la dimostrazione le raggiunge.
        html_attrs.append(f'data-tesi="{html_lib.escape(json.dumps([t["id"] for t in items["tesi"]]))}"')
        if distrattori:
            html_attrs.append(f'data-distrattori="{html_lib.escape(json.dumps(distrattori, ensure_ascii=False))}"')
        if teoria_usata:
            html_attrs.append(f'data-teoria="{html_lib.escape(json.dumps(teoria_usata, ensure_ascii=False))}"')

        marker = f'XTHEOREMBLOCK{theorem_counter}X'
        html = f'<x-theorem {" ".join(html_attrs)}></x-theorem>'
        replacements[marker] = html

        if collect is not None:
            collect.append({
                'id': attrs.get('id'),
                'titolo': titolo,
                'passi': passi,
                'tesi': [t['id'] for t in items['tesi']],
                'distrattori': distrattori,
                'figura': attrs.get('figura'),
                'modi': attrs.get('modi', 'leggi'),
                'html': html,
            })

        theorem_counter += 1
        return marker

    processed = pattern.sub(replace_theorem, content)
    return processed, replacements, theorem_counter


def process_math(content):
    """
    Converte backtick contenenti espressioni matematiche in delimitatori LaTeX

    Rileva espressioni matematiche comuni nei backtick e le converte in $...$
    per il rendering con MathJax.

    Esempi:
        `x = 5` -> $x = 5$
        `x^2 + 3x + 1` -> $x^2 + 3x + 1$
        `2x = 10` -> $2x = 10$

    Args:
        content: Contenuto markdown

    Returns:
        Contenuto processato
    """
    # Pattern per backtick singoli (inline code)
    # Rileva se contiene caratteri matematici comuni
    def replace_math_backtick(match):
        inner = match.group(1)

        # Lista di pattern che indicano espressioni matematiche
        math_indicators = [
            r'[a-zA-Z]\s*[=+\-*/^]',  # Variabile seguita da operatore
            r'[+\-*/^]\s*[a-zA-Z]',    # Operatore seguito da variabile
            r'\^[0-9]',                 # Esponenti
            r'[a-zA-Z]_[0-9a-zA-Z]',    # Pedici
            r'\\[a-zA-Z]+',             # Comandi LaTeX
            r'[0-9]+[a-zA-Z]',          # Coefficienti (es: 2x)
            r'[a-zA-Z]+\s*[=<>]',       # Variabili con relazioni
        ]

        # Controlla se contiene pattern matematici
        is_math = any(re.search(pattern, inner) for pattern in math_indicators)

        if is_math:
            # Converti in delimitatore LaTeX
            return f'${inner}$'
        else:
            # Lascia come backtick normale
            return match.group(0)

    # Processa backtick singoli (non tripli)
    # Usa negative lookahead/lookbehind per evitare blocchi di codice ```
    pattern = r'(?<!`)`([^`\n]+)`(?!`)'
    processed = re.sub(pattern, replace_math_backtick, content)

    return processed


def process_blanks(content, blank_counter):
    """
    Converte [[answer]] in <x-blank> web component

    Esempi:
        [[5]] -> <x-blank id="blank-0" data-solution="5"></x-blank>
        [[a|*b|c]] -> <x-blank id="blank-1" data-choices='["a", "b", "c"]' data-solution="b"></x-blank>
        [[select: a|*b|c]] -> <x-blank id="blank-2" data-choices='[...]' data-solution="b" data-display="dropdown"></x-blank>
        [[2/16 || 1/8]] -> <x-blank id="blank-3" data-solution="2/16" data-accept='["2/16", "1/8"]'></x-blank>

    La soluzione corretta nelle scelte multiple è indicata con *
    Se nessuna scelta ha *, la prima opzione è considerata corretta
    Il prefisso "select:" rende la scelta multipla come menu a tendina inline
    La doppia pipe || crea un input testuale che accetta più risposte corrette

    Args:
        content: Contenuto markdown
        blank_counter: Contatore per ID univoci

    Returns:
        Tuple (contenuto processato, nuovo valore counter)
    """
    def parse_choices(raw):
        """Parsa "a|*b|c" -> (clean_choices, solution). La corretta è marcata con *."""
        solution = None
        clean_choices = []
        for choice in raw.split('|'):
            choice = choice.strip()
            if choice.startswith('*'):
                solution = choice[1:].strip()
                clean_choices.append(solution)
            else:
                clean_choices.append(choice)
        if solution is None:
            solution = clean_choices[0]
        return clean_choices, solution

    def replace_blank(match):
        nonlocal blank_counter
        answer = match.group(1)
        blank_id = f'blank-{blank_counter}'
        blank_counter += 1

        if answer.strip().lower().startswith('select:'):
            # Scelta multipla resa come menu a tendina inline
            raw = answer.strip()[len('select:'):]
            clean_choices, solution = parse_choices(raw)
            choices_attr = html_lib.escape(json.dumps(clean_choices))
            solution_attr = html_lib.escape(solution, quote=True)
            return f'<x-blank id="{blank_id}" data-choices="{choices_attr}" data-solution="{solution_attr}" data-display="dropdown"></x-blank>'
        elif '||' in answer:
            # Input testuale con più risposte accettate (es. "2/16 || 1/8")
            # Serializza come JSON HTML-escaped: niente '|' nell'attributo, così
            # il blank può stare dentro una cella di tabella markdown senza romperla.
            accepted = [a.strip() for a in answer.split('||') if a.strip()]
            solution = accepted[0]
            accept_attr = html_lib.escape(json.dumps(accepted))
            solution_attr = html_lib.escape(solution, quote=True)
            return f'<x-blank id="{blank_id}" data-solution="{solution_attr}" data-accept="{accept_attr}"></x-blank>'
        elif '|' in answer:
            # Scelta multipla a bottoni. Le opzioni sono serializzate in JSON
            # HTML-escaped (come il dropdown) così il blank è sicuro anche in tabella.
            clean_choices, solution = parse_choices(answer)
            choices_attr = html_lib.escape(json.dumps(clean_choices))
            solution_attr = html_lib.escape(solution, quote=True)
            return f'<x-blank id="{blank_id}" data-choices="{choices_attr}" data-solution="{solution_attr}"></x-blank>'
        else:
            # Single answer
            solution_attr = html_lib.escape(answer, quote=True)
            return f'<x-blank id="{blank_id}" data-solution="{solution_attr}"></x-blank>'

    processed = re.sub(r'\[\[([^\]]+)\]\]', replace_blank, content)
    return processed, blank_counter


def process_variables(content, variable_counter):
    """
    Converte ${a}{a|2|-5,5,1} in <x-variable> web component
    e converte riferimenti ${a} nel testo in placeholder {{VAR:a:initial}}
    che verrà gestito dinamicamente da JavaScript

    Formato: ${display}{bind|initial|min,max,step}

    Args:
        content: Contenuto markdown
        variable_counter: Contatore per ID univoci

    Returns:
        Tuple (contenuto processato, nuovo valore counter)
    """
    # Dizionario per tracciare variabili e i loro valori iniziali
    variables = {}

    # Pattern per definizioni complete: ${a}{a|2|-5,5,1}
    definition_pattern = r'\$\{([^}]+)\}\{([^}]+)\}'

    def replace_variable_definition(match):
        nonlocal variable_counter
        display = match.group(1)
        config = match.group(2)

        var_id = f'var-{variable_counter}'
        variable_counter += 1

        # Parse config: "a|2|-5,5,1"
        parts = config.split('|')
        bind = parts[0] if len(parts) > 0 else display
        initial = parts[1] if len(parts) > 1 else '0'
        range_str = parts[2] if len(parts) > 2 else '-10,10,1'

        # Salva il valore iniziale per questa variabile
        variables[bind] = initial

        # Escaping dei valori interpolati negli attributi HTML (input d'autore)
        bind_attr = html_lib.escape(bind, quote=True)
        initial_attr = html_lib.escape(initial, quote=True)

        # Modalità input: ${display}{bind|initial|input} → campo numerico editabile
        # a mano (niente slider, niente range).
        if range_str.strip() == 'input':
            return (
                f'<x-variable id="{var_id}" '
                f'data-display="input" '
                f'data-bind="{bind_attr}" '
                f'data-initial="{initial_attr}">'
                f'</x-variable>'
            )

        try:
            min_val, max_val, step = range_str.split(',')
        except ValueError:
            min_val, max_val, step = '-10', '10', '1'

        return (
            f'<x-variable id="{var_id}" '
            f'data-bind="{bind_attr}" '
            f'data-initial="{initial_attr}" '
            f'data-min="{html_lib.escape(min_val, quote=True)}" '
            f'data-max="{html_lib.escape(max_val, quote=True)}" '
            f'data-step="{html_lib.escape(step, quote=True)}">'
            f'</x-variable>'
        )

    # Prima passata: converti definizioni e raccogli variabili
    processed = re.sub(definition_pattern, replace_variable_definition, content)

    # Seconda passata: converti riferimenti semplici ${varName}
    # Pattern per riferimenti semplici (solo ${a}, non seguiti da {config})
    reference_pattern = r'\$\{([^}]+)\}(?!\{)'

    def replace_variable_reference(match):
        var_name = match.group(1)
        # Usa il valore iniziale se disponibile, altrimenti 0
        initial_value = variables.get(var_name, '0')
        # Usa un marker speciale che JavaScript sostituirà dinamicamente
        # Il marker include il valore iniziale per il primo rendering
        return f'{{{{VAR:{var_name}:{initial_value}}}}}'

    processed = re.sub(reference_pattern, replace_variable_reference, processed)

    return processed, variable_counter


def process_checks(content, check_counter):
    """
    Converte [Testo]{check: condizione} in <x-check> web component

    Esempi:
        [Verifica]{check: m == 4} -> <x-check id="check-0" data-condition="m == 4">Verifica</x-check>

    Args:
        content: Contenuto markdown
        check_counter: Contatore per ID univoci

    Returns:
        Tuple (contenuto processato, nuovo valore counter)
    """
    def replace_check(match):
        nonlocal check_counter
        label = match.group(1)
        condition = match.group(2).strip()
        check_id = f'check-{check_counter}'
        check_counter += 1
        condition_attr = html_lib.escape(condition, quote=True)
        return f'<x-check id="{check_id}" data-condition="{condition_attr}">{label}</x-check>'

    pattern = r'\[([^\]]+)\]\{check:\s*([^}]+)\}'
    processed = re.sub(pattern, replace_check, content)
    return processed, check_counter


def process_blocks(content):
    """
    Converte :::div.class in placeholder marker unici.

    I marker vengono sostituiti con i tag HTML reali DOPO il rendering markdown,
    così il contenuto interno (bold, heading, ecc.) viene processato da mistune.

    Sintassi:
        :::div.class1.class2
        contenuto
        :::

    Args:
        content: Contenuto markdown

    Returns:
        Tuple (contenuto processato, dict marker→tag HTML)
    """
    lines = content.split('\n')
    output = []
    stack = []
    replacements = {}
    counter = 0

    for line in lines:
        if line.strip().startswith(':::'):
            if line.strip() == ':::':
                # Chiusura
                if stack:
                    tag = stack.pop()
                    marker = f'XBLOCK{counter}X'
                    replacements[marker] = f'</{tag}>'
                    counter += 1
                    output.append(marker)
            else:
                # Apertura: :::div.class1.class2
                spec = line.strip()[3:].strip()
                tag, attrs = parse_tag_spec(spec)
                stack.append(tag)
                marker = f'XBLOCK{counter}X'
                replacements[marker] = f'<{tag} {attrs}>' if attrs else f'<{tag}>'
                counter += 1
                output.append(marker)
        else:
            output.append(line)

    return '\n'.join(output), replacements


def process_images(content):
    """
    Converte sintassi Obsidian per il resize delle immagini.

    Esempi:
        ![Alt|400](img.png)      → <img src="img.png" alt="Alt" style="width:400px; height:auto;">
        ![Alt|400x300](img.png)  → <img src="img.png" alt="Alt" style="width:400px; height:300px;">
    """
    pattern = r'!\[([^\]|]*)\|(\d+)(?:x(\d+))?\]\(([^)]+)\)'

    def replace_img(match):
        alt, width, height, src = match.groups()
        if height:
            style = f'width:{width}px; height:{height}px'
        else:
            style = f'width:{width}px; height:auto'
        return f'<img src="{src}" alt="{alt}" style="{style}">'

    return re.sub(pattern, replace_img, content)


def parse_tag_spec(spec):
    """
    Parse tag specification: div.class1.class2(attr="val")

    Args:
        spec: Specifica tag (es: "div.highlight.box")

    Returns:
        Tuple (tag_name, attributes_string)
    """
    # Extract tag name
    match = re.match(r'^(\w+)', spec)
    tag_name = match.group(1) if match else 'div'

    # Extract classes
    classes = re.findall(r'\.([a-zA-Z0-9_-]+)', spec)

    # Extract attributes
    attr_match = re.search(r'\(([^)]+)\)', spec)
    attrs = []

    if classes:
        attrs.append(f'class="{" ".join(classes)}"')

    if attr_match:
        attrs.append(attr_match.group(1))

    return tag_name, ' '.join(attrs)
