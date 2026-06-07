"""Script CLI per build corsi: markdown → JSON"""
import json
from pathlib import Path
from parser.markdown_parser import CourseParser
import yaml


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

        content_file = course_dir / 'content.md'
        if not content_file.exists():
            print(f'[!] Saltato {course_dir.name}: content.md non trovato')
            continue

        print(f'Parsing {course_dir.name}...', end=' ')

        try:
            # Parsa il corso
            course_data = parser.parse_file(content_file)

            # Carica metadata se esiste
            metadata_file = course_dir / 'metadata.yaml'
            if metadata_file.exists():
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    metadata = yaml.safe_load(f) or {}

                # Aggiungi metadata al JSON
                course_data['metadata'] = metadata

            # Salva JSON
            output_file = output_path / f'{course_dir.name}.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(course_data, f, ensure_ascii=False, indent=2)

            print(f'OK ({course_data["total_steps"]} steps)')
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
    content_file = course_dir / 'content.md'

    if not content_file.exists():
        print(f'[X] Errore: {content_file} non trovato')
        return False

    parser = CourseParser()

    print(f'Parsing {course_id}...')

    try:
        # Parsa il corso
        course_data = parser.parse_file(content_file)

        # Carica metadata se esiste
        metadata_file = course_dir / 'metadata.yaml'
        if metadata_file.exists():
            with open(metadata_file, 'r', encoding='utf-8') as f:
                metadata = yaml.safe_load(f) or {}

            course_data['metadata'] = metadata

        # Salva JSON
        output_file = output_path / f'{course_id}.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(course_data, f, ensure_ascii=False, indent=2)

        print(f'[OK] Corso generato: {output_file}')
        print(f'   Steps: {course_data["total_steps"]}')
        print(f'   Goals totali: {sum(len(step["goals"]) for step in course_data["steps"])}')

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
