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
from site_config import load_site_config
from tools_config import corpus_tools
from build_corpus import build_all_corpora
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


def _load_theory(course_dir):
    """
    Legge content/<corso>/teoria.yaml: la cassetta degli attrezzi del corso.

    La teoria è un'entità DI CORSO, non del singolo teorema (il secondo criterio
    di congruenza serve in dodici dimostrazioni e va scritto una volta sola).
    Restituisce un dict vuoto se il file non c'è: un corso senza dimostrazioni
    non ha teoria da dichiarare.
    """
    theory_file = course_dir / 'teoria.yaml'
    if not theory_file.exists():
        return {}
    with open(theory_file, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f) or {}


def _scan_theorem_ids(lesson_files):
    """
    Id di tutti i teoremi del corso, nell'ordine in cui sono dimostrati.

    Serve a distinguere una garanzia che non esiste da una dimostrata più
    avanti nel corso: la seconda è una dipendenza circolare nella progressione
    e va segnalata come tale.
    """
    pattern = re.compile(r'^:::theorem[ \t]+([^\n]*)$', re.MULTILINE)
    ids = []
    for lesson_file in lesson_files:
        text = lesson_file.read_text(encoding='utf-8')
        for opening in pattern.findall(text):
            match = re.search(r'(?:^|\s)id=(?:"([^"]*)"|(\S+))', opening)
            if match:
                ids.append(match.group(1) or match.group(2))
    return ids


def _build_course(course_dir, parser, math_default=False):
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

    # Flag matematica: metadata.yaml del corso > default globale (site.yaml).
    # Il parser è riusato tra corsi, quindi va risettato per OGNI corso.
    parser.math_backticks = bool(metadata.get('math', math_default))

    # Teoria del corso per i blocchi :::theorem. Come il flag math, va risettata
    # per OGNI corso: il parser è riusato, e la teoria si arricchisce lezione
    # dopo lezione con i teoremi dimostrati.
    parser.set_course_theory(_load_theory(course_dir), _scan_theorem_ids(lesson_files))

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


def _riepilogo(costruiti, falliti, saltati, corpora_built, corpora_failed):
    """
    Stampa il riepilogo finale della build. Restituisce True se è andato tutto bene.

    Il riepilogo è l'unica parte che si legge davvero: la riga d'errore di un
    corso scorre via in mezzo alle altre, e un corso fallito NON riscrive il suo
    JSON — il sito continua a servire la versione precedente, cioè sembra che
    non sia successo niente. Qui quindi gli errori vengono ripetuti in fondo, e
    detto a chiare lettere che cosa vedrà chi apre il sito.
    """
    print('\n' + '-' * 60)
    print('Riepilogo build')

    def conta(n_ok, n_ko):
        parti = [f'{n_ok} compilat{"o" if n_ok == 1 else "i"}']
        if n_ko:
            parti.append(f'{n_ko} FALLIT{"O" if n_ko == 1 else "I"}')
        return ', '.join(parti)

    print(f'   Corsi:   {conta(costruiti, len(falliti))}')
    if corpora_built or corpora_failed:
        print(f'   Corpora: {conta(corpora_built, corpora_failed)}')
    for nome, motivo in saltati:
        print(f'   [!] Saltato {nome}: {motivo}')

    for nome, errore, json_vecchio in falliti:
        print(f'\n[X] {nome}')
        print(f'    {errore}')
        if json_vecchio:
            print(f'    Il JSON compilato non è stato riscritto: il sito continua '
                  f'a servire\n    la versione PRECEDENTE di "{nome}".')
        else:
            print(f'    Nessun JSON compilato: il corso "{nome}" non comparirà nel sito.')

    if falliti or corpora_failed:
        print('\nBuild FALLITA.')
        return False

    print('\nBuild completata.')
    return True


def build_all_courses(content_dir='content', output_dir='courses_data'):
    """
    Parsa tutti i corsi nella directory content/ e genera JSON in courses_data/

    Un corso rotto non ferma gli altri (li si vuole vedere tutti in un giro
    solo), ma la funzione restituisce False: chi chiama decide, e il main esce
    con codice != 0 perché la CI non pubblichi una build a metà.

    Args:
        content_dir: Directory contenente i corsi sorgente
        output_dir: Directory di output per i JSON generati

    Returns:
        True se corsi e corpora sono stati compilati tutti, False altrimenti
    """
    content_path = Path(content_dir)
    output_path = Path(output_dir)

    # Crea directory output se non esiste
    output_path.mkdir(exist_ok=True)

    parser = CourseParser()
    math_default = bool(load_site_config().get('math', False))
    courses_built = 0
    falliti = []   # (nome, messaggio d'errore, aveva già un JSON compilato)
    saltati = []   # (nome, motivo)

    print('Build corsi iniziato...\n')

    # I corpora degli strumenti (content/<corpus>/, vedi TEORIA.md) vivono
    # accanto ai corsi ma non sono corsi: li compila build_corpus.py, e qui
    # vanno saltati senza far rumore.
    corpora = {t['corpus'] for t in corpus_tools(content_dir)}

    for course_dir in sorted(content_path.iterdir()):
        if not course_dir.is_dir() or course_dir.name in corpora:
            continue

        if not _find_lesson_files(course_dir):
            print(f'[!] Saltato {course_dir.name}: nessun file lezione trovato')
            saltati.append((course_dir.name, 'nessun file lezione trovato'))
            continue

        print(f'Parsing {course_dir.name}...', end=' ')
        output_file = output_path / f'{course_dir.name}.json'

        try:
            course_data = _build_course(course_dir, parser, math_default)

            # Salva JSON
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(course_data, f, ensure_ascii=False, indent=2)

            n_lessons, n_steps = _course_stats(course_data)
            print(f'OK ({n_lessons} lezioni, {n_steps} steps)')
            courses_built += 1

        except Exception as e:
            print(f'ERRORE: {e}')
            falliti.append((course_dir.name, str(e), output_file.exists()))

    # I corpora sono contenuti quanto i corsi: un solo comando li compila
    # entrambi, altrimenti si pubblica un sito con la mappa vecchia.
    corpora_built, corpora_failed = build_all_corpora(content_dir)

    return _riepilogo(courses_built, falliti, saltati, corpora_built, corpora_failed)


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
    math_default = bool(load_site_config().get('math', False))

    print(f'Parsing {course_id}...')
    output_file = output_path / f'{course_id}.json'

    try:
        course_data = _build_course(course_dir, parser, math_default)

        # Salva JSON
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
        if output_file.exists():
            print(f'\n    Il JSON compilato non è stato riscritto: il sito continua '
                  f'a servire\n    la versione PRECEDENTE di "{course_id}".')
        return False


if __name__ == '__main__':
    import sys

    # Gli errori di parsing sono in italiano, con accenti e virgolette tipografiche.
    # Quando l'output finisce in una pipe (CI, tee, editor) Python userebbe la
    # codifica locale — su Windows cp1252 — e il messaggio arriverebbe illeggibile
    # proprio nel momento in cui va letto.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            stream.reconfigure(encoding='utf-8', errors='replace')

    if len(sys.argv) > 1:
        # Build singolo corso
        ok = build_single_course(sys.argv[1])
    else:
        # Build tutti i corsi
        ok = build_all_courses()

    # Exit code != 0: senza, la CI pubblica felicemente un sito in cui il corso
    # rotto è rimasto alla versione precedente.
    raise SystemExit(0 if ok else 1)
