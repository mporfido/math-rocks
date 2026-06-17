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

app = create_app('production')

# URL relativi + una pagina per cartella (index.html): il sito funziona sotto
# qualsiasi subpath senza hardcodare nome utente/repo.
app.config['FREEZER_DESTINATION'] = 'build'
app.config['FREEZER_RELATIVE_URLS'] = True
# Pulisce dalla build i file non più generati (es. corsi rimossi).
app.config['FREEZER_REMOVE_EXTRA_FILES'] = True

# `lesson_index` (/course/<id>/<lesson>/) è un redirect HTTP al primo step e non va
# congelato: le lesson-card linkano già direttamente al primo step (course.html).
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
# NB: la route `lesson_index` (/course/<id>/<lesson>/) è un redirect HTTP al primo
# step e NON viene congelata: le lesson-card linkano già direttamente al primo step
# (vedi templates/course.html), quindi in statico non serve.
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


if __name__ == '__main__':
    freezer.freeze()

    # GitHub Pages usa Jekyll, che ignora file/cartelle che iniziano con `_`.
    # Un .nojekyll vuoto disattiva quel comportamento.
    (Path(app.config['FREEZER_DESTINATION']) / '.nojekyll').touch()

    print('Export statico completato in', app.config['FREEZER_DESTINATION'])
