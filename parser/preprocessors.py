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
            attrs.append(f'data-{key}="{value}"')

        return f'<x-graph {" ".join(attrs)}></x-graph>'

    processed = graph_block_pattern.sub(replace_graph, content)
    return processed, graph_counter


def process_p5(content, p5_counter):
    """
    Converte blocchi :::p5 ... ::: in <x-p5> web component (sketch p5.js).

    Le opzioni vanno sulla riga di apertura (il corpo è codice JS al 100%, così
    non collide con il separatore di step `---`):
        :::p5 goal height=400 bind=a
        p.setup = () => { p.createCanvas(400, 400); };
        p.draw = () => {
          const a = ctx.model.a;       // valore live di slider/campi della pagina
          // ...disegno...
          if (a === 5) ctx.complete(); // criterio deciso dall'autore
        };
        :::

    Opzioni riconosciute sulla riga di apertura:
        goal           flag: rende lo sketch un goal (gli assegna un id)
        height=400     altezza del canvas (default 400)
        width=600      larghezza del canvas (opzionale)
        bind=a,b       variabili da osservare per ctx.onChange / redraw

    Lo sketch riceve `p` (istanza p5 in instance mode) e `ctx`:
        ctx.complete()    segnala il completamento del goal (idempotente)
        ctx.model         valori live di slider e campi numerici (${a}, ${ax}, …)
        ctx.onChange(cb)  registra una callback chiamata a ogni cambio di variabile

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
    # `^` ancora l'apertura a inizio riga: un eventuale `:::p5` citato a metà
    # frase (es. `` `:::p5` `` nel testo) non viene catturato. La chiusura è un
    # `:::` su riga propria.
    pattern = re.compile(r'^:::p5[ \t]*([^\n]*)\n(.*?)\n:::[ \t]*$', re.DOTALL | re.MULTILINE)
    replacements = {}

    def replace_p5(match):
        nonlocal p5_counter
        options_str = match.group(1).strip()
        code = match.group(2)

        # Parsing opzioni: token separati da spazi; `goal` è un flag,
        # gli altri sono coppie chiave=valore.
        opts = {}
        for token in options_str.split():
            if '=' in token:
                key, _, value = token.partition('=')
                opts[key.strip()] = value.strip()
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

        p5_counter += 1

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
        r'^:::expr[ \t]*(?P<opts>[^\n]*)\n(?P<body>.*?)\n:::[ \t]*$',
        re.DOTALL | re.MULTILINE,
    )
    replacements = {}

    def replace_expr(match):
        nonlocal expr_counter
        expr = match.group('body').strip()
        opts = match.group('opts').split()
        show_steps_attr = ' data-show-steps="true"' if 'show-steps' in opts else ''
        marker = f'XEXPRBLOCK{expr_counter}X'
        expr_attr = html_lib.escape(expr, quote=True)
        replacements[marker] = (
            f'<x-expr id="expr-{expr_counter}" data-expr="{expr_attr}"{show_steps_attr}></x-expr>'
        )
        expr_counter += 1
        return marker

    processed = pattern.sub(replace_expr, content)
    return processed, replacements, expr_counter


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
            return f'<x-blank id="{blank_id}" data-choices="{choices_attr}" data-solution="{solution}" data-display="dropdown"></x-blank>'
        elif '||' in answer:
            # Input testuale con più risposte accettate (es. "2/16 || 1/8")
            # Serializza come JSON HTML-escaped: niente '|' nell'attributo, così
            # il blank può stare dentro una cella di tabella markdown senza romperla.
            accepted = [a.strip() for a in answer.split('||') if a.strip()]
            solution = accepted[0]
            accept_attr = html_lib.escape(json.dumps(accepted))
            return f'<x-blank id="{blank_id}" data-solution="{solution}" data-accept="{accept_attr}"></x-blank>'
        elif '|' in answer:
            # Scelta multipla a bottoni. Le opzioni sono serializzate in JSON
            # HTML-escaped (come il dropdown) così il blank è sicuro anche in tabella.
            clean_choices, solution = parse_choices(answer)
            choices_attr = html_lib.escape(json.dumps(clean_choices))
            return f'<x-blank id="{blank_id}" data-choices="{choices_attr}" data-solution="{solution}"></x-blank>'
        else:
            # Single answer
            return f'<x-blank id="{blank_id}" data-solution="{answer}"></x-blank>'

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

        # Modalità input: ${display}{bind|initial|input} → campo numerico editabile
        # a mano (niente slider, niente range).
        if range_str.strip() == 'input':
            return (
                f'<x-variable id="{var_id}" '
                f'data-display="input" '
                f'data-bind="{bind}" '
                f'data-initial="{initial}">'
                f'</x-variable>'
            )

        try:
            min_val, max_val, step = range_str.split(',')
        except ValueError:
            min_val, max_val, step = '-10', '10', '1'

        return (
            f'<x-variable id="{var_id}" '
            f'data-bind="{bind}" '
            f'data-initial="{initial}" '
            f'data-min="{min_val}" '
            f'data-max="{max_val}" '
            f'data-step="{step}">'
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
        return f'<x-check id="{check_id}" data-condition="{condition}">{label}</x-check>'

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
