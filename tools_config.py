"""Lettore di `content/tools.yaml` — quali strumenti espone il sito.

Senza Flask, come `site_config.py`: lo stesso manifest serve a due padroni che
non condividono un app context.

  - `routes/tools.py` lo legge a runtime per costruire l'elenco e le pagine;
  - `build_corpus.py` lo legge in build per sapere quali strumenti hanno un
    corpus di contenuti da compilare.

Tenere qui la normalizzazione (e la whitelist dei `kind`) evita che le due
letture divergano: un campo nuovo si aggiunge una volta sola.
"""
from pathlib import Path

import yaml

# Tipi di strumento noti all'engine. Il valore è il nome del file JS che lo
# implementa (`static/tools/<kind>.js`): la whitelist evita che un id scritto
# male (o malevolo) in tools.yaml diventi un path arbitrario.
#
#   expr    un widget configurato dalla query string, senza contenuto
#   theory  un CORPUS di teoremi in content/<corpus>/, compilato in
#           tools_data/<corpus>.json: mappa a livelli + una pagina per teorema
#           (vedi TEORIA.md)
TOOL_KINDS = {'expr', 'theory'}

# I `kind` che portano con sé un corpus di contenuti da compilare in build.
CORPUS_KINDS = {'theory'}

TOOLS_MANIFEST = 'tools.yaml'


def load_tools(content_dir='content'):
    """Elenco normalizzato degli strumenti esposti dal sito.

    Ritorna una lista di dict:
        {id, kind, title, description, icon, math, defaults, corpus}
    `corpus` è valorizzato solo per i kind che ne hanno uno (default: l'id
    dello strumento), altrimenti è None.

    Lista vuota se il manifest manca: in quel caso il sito non mostra affatto
    la sezione strumenti. Un file di config dell'istanza non deve poter rompere
    la pagina, quindi le voci con `kind` sconosciuto vengono ignorate.
    """
    manifest_file = Path(content_dir) / TOOLS_MANIFEST
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
        tool_id = str(tool_id)
        tools.append({
            'id': tool_id,
            'kind': kind,
            'title': entry.get('title') or tool_id.replace('-', ' ').capitalize(),
            'description': entry.get('description', ''),
            'icon': entry.get('icon', ''),
            # MathJax: gli strumenti matematici lo vogliono quasi sempre, ma
            # l'istanza può disattivarlo per uno strumento che non ha formule.
            'math': bool(entry.get('math', True)),
            # Valori di partenza della scheda, usati quando l'URL non porta
            # parametri. Il formato dipende dal tipo di strumento e viene
            # passato tale e quale al JS (data-defaults).
            'defaults': entry.get('defaults') or {},
            # Cartella del corpus in content/ (e nome del JSON compilato in
            # tools_data/). Il default è l'id dello strumento: dichiararlo
            # serve solo quando i due nomi devono differire.
            'corpus': (str(entry.get('corpus') or tool_id)
                       if kind in CORPUS_KINDS else None),
        })
    return tools


def find_tool(tool_id, content_dir='content'):
    """Strumento per id, o None."""
    return next((t for t in load_tools(content_dir) if t['id'] == tool_id), None)


def corpus_tools(content_dir='content'):
    """Solo gli strumenti che hanno un corpus da compilare in build."""
    return [t for t in load_tools(content_dir) if t['kind'] in CORPUS_KINDS]
