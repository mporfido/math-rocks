"""Pre-processori per sintassi markdown custom"""
import re
import json
import html as html_lib
import yaml


def normalize_graph_config(config):
    """
    Normalizza la configurazione di un grafico nello schema unificato a layer.

    Schema unificato: le capacità del grafico sono layer componibili decisi
    dalla presenza delle chiavi, non da `type`:
        functions:   lista di curve {expr, color?, xclip?}
        points:      lista di punti trascinabili con obiettivo {target, snap?, tolerance?}
        boundpoints: lista di punti legati a variabili del modello {x, y, label?}

    La sintassi legacy con `type:` viene riscritta nello schema unificato:
        type: function    expr/xclip top-level → functions: [{expr, xclip}]
        type: functions   già lista functions (expr top-level eventuale → in coda)
        type: point       target/tolerance top-level → points: [{target, tolerance}]
        type: points      points invariata; expr/xclip di sfondo → functions
        type: boundpoints points → rinominata in boundpoints

    Senza `type`, le chiavi vengono usate così come sono (expr top-level
    resta una scorciatoia per una singola curva).

    Args:
        config: Dict dalla configurazione YAML del blocco

    Returns:
        Dict normalizzato (senza chiave `type`)
    """
    config = dict(config)
    gtype = str(config.pop('type', '')) or None

    if gtype == 'boundpoints':
        # Legacy: i punti bound usavano la chiave `points`
        if 'points' in config and 'boundpoints' not in config:
            config['boundpoints'] = config.pop('points')
    elif gtype in ('point',):
        entry = {}
        for key in ('target', 'tolerance', 'snap'):
            if key in config:
                entry[key] = config.pop(key)
        config.setdefault('points', [entry])

    # expr top-level → voce di functions (vale per function/functions/points
    # con curva di sfondo e per lo schema unificato senza type)
    if 'expr' in config:
        entry = {'expr': config.pop('expr')}
        if 'xclip' in config:
            entry['xclip'] = config.pop('xclip')
        config.setdefault('functions', [])
        config['functions'].append(entry)

    return config


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

    La sintassi legacy con `type:` resta accettata e viene normalizzata
    (vedi normalize_graph_config).

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

        config = normalize_graph_config(config)
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
        [[a|*b|c]] -> <x-blank id="blank-1" data-choices="a|b|c" data-solution="b"></x-blank>

    La soluzione corretta nelle scelte multiple è indicata con *
    Se nessuna scelta ha *, la prima opzione è considerata corretta

    Args:
        content: Contenuto markdown
        blank_counter: Contatore per ID univoci

    Returns:
        Tuple (contenuto processato, nuovo valore counter)
    """
    def replace_blank(match):
        nonlocal blank_counter
        answer = match.group(1)
        blank_id = f'blank-{blank_counter}'
        blank_counter += 1

        if '|' in answer:
            # Multiple choice
            choices = answer.split('|')
            solution = None
            clean_choices = []

            for choice in choices:
                choice = choice.strip()
                if choice.startswith('*'):
                    # Questa è la risposta corretta
                    solution = choice[1:].strip()
                    clean_choices.append(solution)
                else:
                    clean_choices.append(choice)

            # Se nessuna soluzione specificata, usa la prima opzione
            if solution is None:
                solution = clean_choices[0]

            choices_str = '|'.join(clean_choices)
            return f'<x-blank id="{blank_id}" data-choices="{choices_str}" data-solution="{solution}"></x-blank>'
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
