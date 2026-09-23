"""Export statico dell'app per GitHub Pages (Frozen-Flask).

Congela l'app Flask in HTML/CSS/JS statici nella cartella `build/`, pronti per
essere serviti da GitHub Pages (o da qualsiasi hosting statico) anche sotto un
subpath tipo `USERNAME.github.io/REPO/`.

Prerequisito: i corsi devono essere già compilati in `courses_data/` con
`python build_courses.py`. I generators qui sotto enumerano gli URL leggendo
quei JSON (stesso formato letto da `routes/courses.py:load_course`).

Uso:
    python build_courses.py && python freeze.py
    python -m http.server 8000 --directory build   # anteprima locale
"""
import json
import warnings
from pathlib import Path

from flask_frozen import Freezer, MissingURLGeneratorWarning

from app import create_app
from routes.tools import load_corpus, load_tools

app = create_app('production')

# URL relativi + una pagina per cartella (index.html): il sito funziona sotto
# qualsiasi subpath senza hardcodare nome utente/repo.
app.config['FREEZER_DESTINATION'] = 'build'
app.config['FREEZER_RELATIVE_URLS'] = True
# Pulisce dalla build i file non più generati (es. corsi rimossi).
app.config['FREEZER_REMOVE_EXTRA_FILES'] = True

# `lesson_index` (/course/<id>/<lesson>/) è un redirect HTTP al primo step: in
# statico non c'è nessun server che lo esegua, quindi non lo congeliamo con
# Frozen-Flask (seguire il redirect copierebbe la pagina dello step a una
# profondità diversa, rompendo gli URL relativi verso static/). Al suo posto, a
# freeze finito, scriviamo una paginetta di rimbalzo lato browser: vedi
# `write_lesson_redirects`.
# Frozen-Flask avviserebbe che l'endpoint non ha generator: silenziamo solo quello.
warnings.filterwarnings(
    'ignore',
    message=r'.*courses\.lesson_index.*',
    category=MissingURLGeneratorWarning,
)

freezer = Freezer(app)

COURSES_DATA_DIR = Path('courses_data')


def _iter_courses():
    """Genera (course_id, course_data) per ogni JSON compilato."""
    for course_file in sorted(COURSES_DATA_DIR.glob('*.json')):
        with open(course_file, 'r', encoding='utf-8') as f:
            yield course_file.stem, json.load(f)


# I generators restituiscono (endpoint, values): gli endpoint sono nel
# blueprint `courses`, quindi vanno prefissati (course_index → courses.course_index).
# NB: la route `lesson_index` (/course/<id>/<lesson>/) NON viene congelata qui: la
# sua paginetta di rimbalzo la scrive `write_lesson_redirects` dopo il freeze.
@freezer.register_generator
def course_urls():
    """URL dei corsi: panoramica corso e singoli step."""
    for course_id, course in _iter_courses():
        yield 'courses.course_index', {'course_id': course_id}
        for lesson in course.get('lessons', []):
            for step in lesson.get('steps', []):
                yield 'courses.course_step', {
                    'course_id': course_id,
                    'lesson_id': lesson['id'],
                    'step_id': step['id'],
                }


@freezer.register_generator
def tool_urls():
    """URL delle pagine-strumento (elenco + una pagina per strumento).

    I parametri della scheda vivono nella query string e NON vengono congelati:
    la configurazione la legge il JS nel browser (vedi routes/tools.py).

    Gli strumenti con un corpus (`kind: theory`, vedi TEORIA.md) hanno invece
    una pagina PER VOCE, e quelle sì che si congelano: il path è l'indirizzo
    che si condivide con la classe, e deve restare valido anche in statico.
    """
    with app.app_context():
        tools = load_tools()
        if not tools:
            return
        yield 'tools.tools_index', {}
        for tool in tools:
            yield 'tools.tool_page', {'tool_id': tool['id']}
            corpus = load_corpus(tool)
            for teorema in (corpus or {}).get('teoremi', []):
                yield 'tools.tool_item', {'tool_id': tool['id'], 'item_id': teorema['id']}


# Paginetta di rimbalzo per /course/<corso>/<lezione>/: l'indirizzo di una lezione
# senza step è quello che viene naturale condividere, e su un hosting statico
# altrimenti darebbe 404. Il target è relativo (`<primo-step>/`), così funziona
# anche sotto un subpath tipo USERNAME.github.io/REPO/. `location.replace` non
# aggiunge una voce alla cronologia: il tasto "indietro" torna da dove si veniva e
# non rimbalza di nuovo qui. Il meta refresh copre il caso JS disattivato, il link
# in pagina è l'ultima rete di sicurezza.
LESSON_REDIRECT_HTML = """<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>{titolo}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="{target}">
<meta http-equiv="refresh" content="0; url={target}">
<script>location.replace("{target}" + location.search + location.hash);</script>
</head>
<body>
<p>Vai al <a href="{target}">primo step della lezione</a>.</p>
</body>
</html>
"""


def write_lesson_redirects(destination):
    """Scrive una pagina di rimbalzo al primo step per ogni lezione.

    Va chiamata DOPO `freezer.freeze()`: con FREEZER_REMOVE_EXTRA_FILES il freeze
    ripulisce la cartella di build, e questi file non li conosce.
    """
    count = 0
    for course_id, course in _iter_courses():
        for lesson in course.get('lessons', []):
            steps = lesson.get('steps')
            if not steps:
                continue
            page = destination / 'course' / course_id / lesson['id'] / 'index.html'
            page.parent.mkdir(parents=True, exist_ok=True)
            page.write_text(
                LESSON_REDIRECT_HTML.format(
                    titolo=lesson.get('title', lesson['id']),
                    target=f"{steps[0]['id']}/",
                ),
                encoding='utf-8',
            )
            count += 1
    return count


if __name__ == '__main__':
    freezer.freeze()

    destination = Path(app.config['FREEZER_DESTINATION'])
    print('Pagine di rimbalzo delle lezioni:', write_lesson_redirects(destination))

    # GitHub Pages usa Jekyll, che ignora file/cartelle che iniziano con `_`.
    # Un .nojekyll vuoto disattiva quel comportamento.
    (destination / '.nojekyll').touch()

    print('Export statico completato in', app.config['FREEZER_DESTINATION'])
