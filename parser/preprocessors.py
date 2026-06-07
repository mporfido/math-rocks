"""Pre-processori per sintassi markdown custom"""
import re
import json
import html as html_lib
import yaml


def process_graphs(content, graph_counter):
    """
    Converte blocchi :::graph YAML ::: in <x-graph> web component

    Sintassi:
        :::graph
        type: function
        expr: "sin(a * x)"
        bind: a
        xrange: "-6.28,6.28"
        yrange: "-2,2"
        :::

    Per type=point aggiunge id per il goal tracking. Per type=function
    non assegna id (il grafico è solo esplorativo).

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
        yaml_content = match.group(1)

        try:
            config = yaml.safe_load(yaml_content) or {}
        except yaml.YAMLError:
            config = {}

        gtype = str(config.get('type', 'function'))
        graph_counter += 1

        attrs = [f'data-type="{gtype}"']

        # point e points sono goal tracciabili
        if gtype in ('point', 'points'):
            attrs.insert(0, f'id="graph-{graph_counter - 1}"')

        for key, value in config.items():
            if key == 'type':
                continue
            if key == 'bind' and isinstance(value, list):
                value = ','.join(str(v) for v in value)
            elif key == 'points' and isinstance(value, list):
                # Serializza la lista come JSON e HTML-escapa le virgolette
                attrs.append(f'data-points="{html_lib.escape(json.dumps(value))}"')
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


def process_blocks(content):
    """
    Converte :::div.class in <div class="class">

    Sintassi:
        :::div.class1.class2
        contenuto
        :::

    Args:
        content: Contenuto markdown

    Returns:
        Contenuto processato
    """
    lines = content.split('\n')
    output = []
    stack = []

    for line in lines:
        if line.strip().startswith(':::'):
            if line.strip() == ':::':
                # Chiusura
                if stack:
                    tag = stack.pop()
                    output.append(f'</{tag}>')
            else:
                # Apertura: :::div.class1.class2
                spec = line.strip()[3:].strip()
                tag, attrs = parse_tag_spec(spec)
                stack.append(tag)
                if attrs:
                    output.append(f'<{tag} {attrs}>')
                else:
                    output.append(f'<{tag}>')
        else:
            output.append(line)

    return '\n'.join(output)


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
