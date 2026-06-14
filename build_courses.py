"""Script CLI per build corsi: markdown → JSON

Struttura sorgente attesa:
    content/<course_id>/
        metadata.yaml        # metadati del corso (title, description, progression, ...)
        content-1.md         # lezione 1 (step separati da ---)
        content-2.md         # lezione 2
        ...

Fallback retro-compatibile: una cartella col solo `content.md` viene compilata
come corso con una singola lezione (id "content").

Output: courses_data/<course_id>.json con forma
    { "id", "metadata", "lessons": [ { "id", "title", "metadata",
                                       "steps", "total_steps" } ] }
"""
import json
import re
from pathlib import Path
from parser.markdown_parser import CourseParser
import yaml


def _lesson_sort_key(path):
    """Ordina i file lezione per il numero nel nome (content-2 < content-10)."""
    match = re.search(r'(\d+)', path.stem)
    return (int(match.group(1)) if match else 0, path.stem)


def _find_lesson_files(course_dir):
    """Restituisce i file lezione ordinati: content-*.md, oppure content.md."""
    lesson_files = sorted(course_dir.glob('content-*.md'), key=_lesson_sort_key)
    if lesson_files:
        return lesson_files
    legacy = course_dir / 'content.md'
    return [legacy] if legacy.exists() else []


def _build_course(course_dir, parser):
    """Compila un singolo corso (cartella) → dict pronto per il dump JSON."""
    lesson_files = _find_lesson_files(course_dir)
    if not lesson_files:
        raise FileNotFoundError('nessun file lezione (content-*.md o content.md)')

    # Metadata del corso
    metadata = {}
    metadata_file = course_dir / 'metadata.yaml'
    if metadata_file.exists():
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = yaml.safe_load(f) or {}

    lessons = []
    for lesson_file in lesson_files:
        parsed = parser.parse_file(lesson_file)
        lesson_meta = parsed.get('lesson_metadata', {}) or {}
        lesson_id = lesson_meta.get('id', lesson_file.stem)
        lesson_title = lesson_meta.get(
            'title', lesson_id.replace('-', ' ').title()
        )
        lessons.append({
            'id': lesson_id,
            'title': lesson_title,
            'metadata': lesson_meta,
            'steps': parsed['steps'],
            'total_steps': parsed['total_steps'],
        })

    return {
        'id': course_dir.name,
        'metadata': metadata,
        'lessons': lessons,
    }


def _course_stats(course_data):
    """(numero lezioni, step totali) per i messaggi di log."""
    lessons = course_data['lessons']
    total_steps = sum(lesson['total_steps'] for lesson in lessons)
    return len(lessons), total_steps


def build_all_courses(content_dir='content', output_dir='courses_data'):
    """
    Parsa tutti i corsi nella directory content/ e genera JSON in courses_data/

    Args:
        content_dir: Directory contenente i corsi sorgente
        output_dir: Directory di output per i JSON generati
    """
    content_path = Path(content_dir)
    output_path = Path(output_dir)

    # Crea directory output se non esiste
    output_path.mkdir(exist_ok=True)

    parser = CourseParser()
    courses_built = 0
    courses_failed = 0

    print('Build corsi iniziato...\n')

    for course_dir in sorted(content_path.iterdir()):
        if not course_dir.is_dir():
            continue

        if not _find_lesson_files(course_dir):
            print(f'[!] Saltato {course_dir.name}: nessun file lezione trovato')
            continue

        print(f'Parsing {course_dir.name}...', end=' ')

        try:
            course_data = _build_course(course_dir, parser)

            # Salva JSON
            output_file = output_path / f'{course_dir.name}.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(course_data, f, ensure_ascii=False, indent=2)

            n_lessons, n_steps = _course_stats(course_data)
            print(f'OK ({n_lessons} lezioni, {n_steps} steps)')
            courses_built += 1

        except Exception as e:
            print(f'ERRORE: {e}')
            courses_failed += 1

    print(f'\nBuild completato!')
    print(f'   Corsi generati: {courses_built}')
    if courses_failed > 0:
        print(f'   Corsi falliti: {courses_failed}')


def build_single_course(course_id, content_dir='content', output_dir='courses_data'):
    """
    Parsa un singolo corso

    Args:
        course_id: ID del corso (nome directory)
        content_dir: Directory contenente i corsi sorgente
        output_dir: Directory di output per i JSON generati
    """
    content_path = Path(content_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    course_dir = content_path / course_id

    if not _find_lesson_files(course_dir):
        print(f'[X] Errore: nessun file lezione in {course_dir}')
        return False

    parser = CourseParser()

    print(f'Parsing {course_id}...')

    try:
        course_data = _build_course(course_dir, parser)

        # Salva JSON
        output_file = output_path / f'{course_id}.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(course_data, f, ensure_ascii=False, indent=2)

        n_lessons, n_steps = _course_stats(course_data)
        print(f'[OK] Corso generato: {output_file}')
        print(f'   Lezioni: {n_lessons}')
        print(f'   Steps: {n_steps}')

        return True

    except Exception as e:
        print(f'[X] Errore durante il parsing: {e}')
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1:
        # Build singolo corso
        course_id = sys.argv[1]
        build_single_course(course_id)
    else:
        # Build tutti i corsi
        build_all_courses()
