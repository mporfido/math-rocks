"""Blueprint per le pagine-strumento (`/tools/...`).

Uno *strumento* è un componente della piattaforma esposto da solo, fuori da un
corso: si apre a pagina intera e si configura con i **parametri della query
string** (es. `/tools/espressioni/?ex=(4+5*4)-(8:2+6)&mode=powers`), così un
docente può costruire una scheda di esercizi e condividerne il link.

Uno strumento può anche avere un **corpus** di contenuti (`kind: theory`, vedi
TEORIA.md): in quel caso `/tools/<id>/` è una mappa e ogni voce del corpus ha
la sua pagina, `/tools/<id>/<voce>/`. Il path dice quale voce — è l'indirizzo
che si condivide — e la query string come presentarla.

Confine engine/istanza (vedi README, "Direzione e Filosofia"):
  - ENGINE: queste route, i template `tool.html` / `theory_*.html`, e le
    implementazioni in `static/tools/<kind>.js` — un file per *tipo*.
  - ISTANZA: `content/tools.yaml`, che decide QUALI strumenti il sito espone,
    con quale titolo/descrizione e con quali valori di partenza, e i corpora
    in `content/<corpus>/`.

I parametri della scheda NON vengono letti qui: il sito è congelato in statico
(Frozen-Flask congela i percorsi, non le query string), quindi `/tools/<id>/`
è una pagina sola e i parametri li interpreta il JS nel browser. È anche il
motivo per cui gli strumenti funzionano identici su Flask e su GitHub Pages.
"""
import json
from pathlib import Path

from flask import Blueprint, abort, current_app, render_template

import tools_config

tools_bp = Blueprint('tools', __name__)


def load_tools():
    """Elenco degli strumenti esposti dal sito (da content/tools.yaml).

    Lettura e normalizzazione stanno in `tools_config` (senza Flask), perché
    lo stesso manifest lo legge anche la build: qui si aggiunge solo il
    CONTENT_DIR dell'app.
    """
    return tools_config.load_tools(current_app.config['CONTENT_DIR'])


def find_tool(tool_id):
    """Strumento per id, o None."""
    return tools_config.find_tool(tool_id, current_app.config['CONTENT_DIR'])


def load_corpus(tool):
    """Corpus compilato di uno strumento (tools_data/<corpus>.json), o None.

    Se manca vuol dire che `build_corpus.py` non è stato eseguito: lo strumento
    non ha nulla da mostrare e le sue route rispondono 404, invece di andare in
    errore a metà pagina.
    """
    if not tool or not tool.get('corpus'):
        return None
    corpus_file = Path(current_app.config['TOOLS_DATA_DIR']) / f"{tool['corpus']}.json"
    if not corpus_file.exists():
        return None
    with open(corpus_file, 'r', encoding='utf-8') as f:
        return json.load(f)


def find_theorem(corpus, item_id):
    """Teorema per id dentro un corpus, o None."""
    if not corpus:
        return None
    return next((t for t in corpus['teoremi'] if t['id'] == item_id), None)


@tools_bp.route('/tools/')
def tools_index():
    """Elenco degli strumenti disponibili."""
    tools = load_tools()
    if not tools:
        abort(404)
    return render_template('tools.html', tools=tools)


def _griglia(corpus):
    """Il corpus come righe di livello × colonne di area, per il template.

    La griglia è SPARSA di proposito: una cella vuota dice che a quel livello
    quell'area non ha ancora nulla, ed è un'informazione (dove comincia un
    capitolo, quanto in profondità arriva). Le posizioni sono queste, non
    coordinate in pixel: gli archi li misura il JS sul DOM, perché devono
    seguire il layout anche quando cambia larghezza.
    """
    return [
        {
            'livello': livello,
            'celle': [
                {
                    'area': area,
                    'teoremi': sorted(
                        (t for t in corpus['teoremi']
                         if t['livello'] == livello and t['area'] == area['id']),
                        key=lambda t: t['indice'],
                    ),
                }
                for area in corpus['aree']
            ],
        }
        for livello in range(corpus['livelli'])
    ]


@tools_bp.route('/tools/<tool_id>/')
def tool_page(tool_id):
    """Pagina di un singolo strumento (configurabile via query string).

    Per gli strumenti con un corpus (`kind: theory`) questa è la MAPPA, e le
    singole voci hanno una route propria: vedi `tool_item`.
    """
    tool = find_tool(tool_id)
    if not tool:
        abort(404)

    if tool['kind'] == 'theory':
        corpus = load_corpus(tool)
        if not corpus:
            abort(404)
        return render_template('theory_map.html', tool=tool, corpus=corpus,
                               griglia=_griglia(corpus))

    return render_template('tool.html', tool=tool)


@tools_bp.route('/tools/<tool_id>/<item_id>/')
def tool_item(tool_id, item_id):
    """Una voce del corpus di uno strumento: qui, la pagina di un teorema.

    Il path dice QUALE teorema (è l'indirizzo che si condivide con la classe e
    va tenuto stabile), la query string COME presentarlo — `modi`,
    `distrattori` — e la legge il JS, perché in statico il server non la vede.
    """
    tool = find_tool(tool_id)
    corpus = load_corpus(tool)
    teorema = find_theorem(corpus, item_id)
    if not teorema:
        abort(404)

    per_id = {t['id']: t for t in corpus['teoremi']}
    return render_template(
        'theory_theorem.html', tool=tool, corpus=corpus, teorema=teorema,
        # Il vicinato, risolto qui: la pagina di un teorema è anche un modo di
        # muoversi nella teoria, non un vicolo cieco.
        usa=[per_id[i] for i in teorema['usa'] if i in per_id],
        usato_da=[per_id[i] for i in teorema['usato_da'] if i in per_id],
        area=next((a for a in corpus['aree'] if a['id'] == teorema['area']), None),
    )
