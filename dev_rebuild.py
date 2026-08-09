"""Rebuild automatico in sviluppo: il sorgente cambia, la pagina è aggiornata.

Scrivere una lezione vuol dire salvare il .md e ricaricare il browser. Senza
questo modulo in mezzo c'è un `python build_courses.py` da ricordarsi ogni
volta — e quando lo si dimentica si legge la versione precedente convinti di
guardare quella nuova, che è il modo più efficace di perdere mezz'ora.

Come funziona: non c'è nessun watcher e nessun thread. Alla richiesta di un
corso si confronta la data del JSON compilato con quella dei suoi sorgenti; se
è vecchia si ricompila **solo quel corso**, poi la richiesta prosegue. È
selettivo per costruzione: si ricompila la cosa che si sta guardando, non
tutto il sito.

Nel confronto entrano anche i file dell'engine (parser, script di build,
site.yaml): toccando un preprocessore cambia l'HTML di tutte le lezioni, e un
JSON compilato con il parser di prima è vecchio esattamente come uno compilato
da un markdown di prima.

Attivo solo con `AUTO_REBUILD` (config di sviluppo): in produzione e durante il
freeze i JSON sono un artefatto di build, non qualcosa da rigenerare a runtime.
"""
from pathlib import Path

# File dell'engine che cambiano l'esito della compilazione: se sono più recenti
# del JSON, il JSON è vecchio anche se il markdown non è stato toccato.
_ENGINE_GLOBS = (
    'parser/*.py',
    'build_courses.py',
    'build_corpus.py',
    'site_config.py',
    'tools_config.py',
    'site.yaml',
)

# Estensioni che contano come sorgente dentro la cartella di un corso/corpus.
_SOURCE_SUFFIXES = {'.md', '.yaml', '.yml'}


def _latest_mtime(paths):
    """La data di modifica più recente fra i path esistenti (0 se nessuno)."""
    return max((p.stat().st_mtime for p in paths if p.is_file()), default=0)


def _engine_mtime(root=Path('.')):
    """Data dell'ultima modifica ai file dell'engine che influenzano la build."""
    return _latest_mtime(p for glob in _ENGINE_GLOBS for p in root.glob(glob))


def _is_stale(source_dir, output_file):
    """True se `output_file` manca o è più vecchio dei suoi sorgenti."""
    if not output_file.exists():
        return True
    if not source_dir.is_dir():
        return False  # niente sorgenti: non c'è nulla da ricompilare
    built_at = output_file.stat().st_mtime
    sources = (p for p in source_dir.rglob('*') if p.suffix in _SOURCE_SUFFIXES)
    return _latest_mtime(sources) > built_at or _engine_mtime() > built_at


def rebuild_course_if_stale(course_id, content_dir='content', output_dir='courses_data'):
    """Ricompila il corso se i suoi sorgenti sono più recenti del JSON.

    Non solleva mai: un markdown a metà frase non deve diventare un 500 mentre
    lo si sta scrivendo. In quel caso l'errore finisce sul terminale e la
    pagina continua a servire l'ultima versione buona — come già succede in
    build (vedi il riepilogo di `build_courses.py`).
    """
    source_dir = Path(content_dir) / course_id
    output_file = Path(output_dir) / f'{course_id}.json'
    if not _is_stale(source_dir, output_file):
        return

    from build_courses import build_single_course
    print(f'[auto-build] {course_id}: sorgenti modificati, ricompilo...')
    try:
        build_single_course(course_id, content_dir, output_dir)
    except Exception as e:  # noqa: BLE001 — in sviluppo si segnala, non si muore
        print(f'[auto-build] {course_id}: ERRORE {e}')


def rebuild_corpus_if_stale(corpus_id, content_dir='content', output_dir='tools_data'):
    """Come `rebuild_course_if_stale`, per un corpus di teoremi (vedi TEORIA.md)."""
    source_dir = Path(content_dir) / corpus_id
    output_file = Path(output_dir) / f'{corpus_id}.json'
    if not _is_stale(source_dir, output_file):
        return

    from build_corpus import build_corpus, _scrivi
    from site_config import load_site_config
    print(f'[auto-build] {corpus_id}: sorgenti modificati, ricompilo...')
    try:
        math_default = bool(load_site_config().get('math', False))
        corpus_data = build_corpus(corpus_id, content_dir, output_dir, math_default)
        _scrivi(corpus_data, output_dir)
        for avviso in corpus_data['avvisi']:
            print(f'    [!] {avviso}')
        print(f'[auto-build] {corpus_id}: OK ({len(corpus_data["teoremi"])} teoremi)')
    except Exception as e:  # noqa: BLE001
        print(f'[auto-build] {corpus_id}: ERRORE {e}')
