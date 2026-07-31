"""Blueprint per le pagine-strumento (`/tools/...`).

Uno *strumento* è un componente della piattaforma esposto da solo, fuori da un
corso: si apre a pagina intera e si configura con i **parametri della query
string** (es. `/tools/espressioni/?ex=(4+5*4)-(8:2+6)&mode=powers`), così un
docente può costruire una scheda di esercizi e condividerne il link.

Confine engine/istanza (vedi README, "Direzione e Filosofia"):
  - ENGINE: queste route, il template `tool.html`, e le implementazioni in
    `static/tools/<kind>.js` — un file per *tipo* di strumento.
  - ISTANZA: `content/tools.yaml`, che decide QUALI strumenti il sito espone,
    con quale titolo/descrizione e con quali valori di partenza.

I parametri della scheda NON vengono letti qui: il sito è congelato in statico
(Frozen-Flask congela i percorsi, non le query string), quindi `/tools/<id>/`
è una pagina sola e i parametri li interpreta il JS nel browser. È anche il
motivo per cui gli strumenti funzionano identici su Flask e su GitHub Pages.
"""
from pathlib import Path

import yaml
from flask import Blueprint, abort, current_app, render_template

tools_bp = Blueprint('tools', __name__)

# Tipi di strumento noti all'engine. Il valore è il nome del file JS che
# implementa lo strumento (`static/tools/<kind>.js`): la whitelist evita che
# un id scritto male (o malevolo) in tools.yaml diventi un path arbitrario.
TOOL_KINDS = {'expr'}

# Un file di config dell'istanza non deve poter rompere la pagina: gli
# strumenti con `kind` sconosciuto vengono semplicemente ignorati.
TOOLS_MANIFEST = 'tools.yaml'


def load_tools():
    """Elenco degli strumenti esposti dal sito (da content/tools.yaml).

    Ritorna una lista di dict normalizzati:
        {id, kind, title, description, icon, math, defaults}
    Lista vuota se il manifest manca: in quel caso il sito non mostra affatto
    la sezione strumenti (nessuna route rotta, nessun link nel menu).
    """
    manifest_file = Path(current_app.config['CONTENT_DIR']) / TOOLS_MANIFEST
    if not manifest_file.exists():
        return []

    with open(manifest_file, 'r', encoding='utf-8') as f:
        manifest = yaml.safe_load(f) or {}

    tools = []
    for entry in manifest.get('tools', []):
        if not isinstance(entry, dict):
            continue
        tool_id = entry.get('id')
        kind = entry.get('kind')
        if not tool_id or kind not in TOOL_KINDS:
            continue
        tools.append({
            'id': str(tool_id),
            'kind': kind,
            'title': entry.get('title') or str(tool_id).replace('-', ' ').capitalize(),
            'description': entry.get('description', ''),
            'icon': entry.get('icon', ''),
            # MathJax: gli strumenti matematici lo vogliono quasi sempre, ma
            # l'istanza può disattivarlo per uno strumento che non ha formule.
            'math': bool(entry.get('math', True)),
            # Valori di partenza della scheda, usati quando l'URL non porta
            # parametri. Il formato dipende dal tipo di strumento e viene
            # passato tale e quale al JS (data-defaults).
            'defaults': entry.get('defaults') or {},
        })
    return tools


def find_tool(tool_id):
    """Strumento per id, o None."""
    return next((t for t in load_tools() if t['id'] == tool_id), None)


@tools_bp.route('/tools/')
def tools_index():
    """Elenco degli strumenti disponibili."""
    tools = load_tools()
    if not tools:
        abort(404)
    return render_template('tools.html', tools=tools)


@tools_bp.route('/tools/<tool_id>/')
def tool_page(tool_id):
    """Pagina di un singolo strumento (configurabile via query string)."""
    tool = find_tool(tool_id)
    if not tool:
        abort(404)
    return render_template('tool.html', tool=tool)
