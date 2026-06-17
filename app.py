"""Applicazione Flask principale"""
from flask import Flask, render_template
from config import config
import os

def create_app(config_name=None):
    """Factory per creare l'applicazione Flask.

    config_name: 'development' | 'production'. Se omesso, usa la variabile
    d'ambiente FLASK_CONFIG e in mancanza ricade su 'production' (default
    sicuro: debugger disattivato). Per gunicorn basta `app:create_app()`.
    """
    config_name = config_name or os.environ.get('FLASK_CONFIG', 'production')
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Registra blueprint routes
    from routes.courses import courses_bp
    app.register_blueprint(courses_bp)

    @app.context_processor
    def inject_site_config():
        """Espone i testi configurabili del sito a tutti i template."""
        from datetime import date
        return {
            'site_name': app.config['SITE_NAME'],
            'site_title': app.config['SITE_TITLE'],
            'site_subtitle': app.config['SITE_SUBTITLE'],
            'footer_text': app.config['FOOTER_TEXT'],
            'current_year': date.today().year,
        }

    @app.route('/')
    def home():
        """Homepage con i corsi raggruppati in sezioni.

        L'ordine delle sezioni e dei corsi è definito in content/sections.yaml.
        I corsi non elencati nel manifest finiscono in "Altri corsi"; se il
        manifest manca, si ricade su un'unica lista piatta (senza titolo).
        """
        from pathlib import Path
        import yaml

        content_dir = Path(app.config['CONTENT_DIR'])

        # Scansione cartelle corso → mappa id → dict (ordine alfabetico stabile)
        courses_by_id = {}
        if content_dir.exists():
            for course_dir in sorted(content_dir.iterdir()):
                if not course_dir.is_dir():
                    continue

                # Conta le lezioni (content-*.md, con fallback su content.md)
                lesson_files = list(course_dir.glob('content-*.md'))
                if not lesson_files and (course_dir / 'content.md').exists():
                    lesson_files = [course_dir / 'content.md']
                if not lesson_files:
                    continue  # cartella senza contenuti: non è un corso

                # Carica metadata se esiste
                metadata_file = course_dir / 'metadata.yaml'
                if metadata_file.exists():
                    with open(metadata_file, 'r', encoding='utf-8') as f:
                        metadata = yaml.safe_load(f) or {}
                else:
                    metadata = {}

                courses_by_id[course_dir.name] = {
                    'id': course_dir.name,
                    'title': metadata.get('title', course_dir.name.replace('-', ' ').title()),
                    'description': metadata.get('description', ''),
                    'lessons': len(lesson_files),
                    'color': metadata.get('color')
                }

        # Carica il manifest delle sezioni (se presente)
        sections_file = content_dir / 'sections.yaml'
        manifest = {}
        if sections_file.exists():
            with open(sections_file, 'r', encoding='utf-8') as f:
                manifest = yaml.safe_load(f) or {}

        sections = []
        grouped_ids = set()
        for section in manifest.get('sections', []):
            # Risolve gli id in dict-corso, preservando l'ordine e saltando
            # quelli inesistenti su disco.
            section_courses = []
            for course_id in section.get('courses', []):
                course = courses_by_id.get(course_id)
                if course is not None:
                    section_courses.append(course)
                    grouped_ids.add(course_id)
            if section_courses:  # niente intestazioni vuote
                sections.append({
                    'id': section.get('id'),
                    'title': section.get('title'),
                    'courses': section_courses,
                })

        # Corsi non citati nel manifest → "Altri corsi" (ordine alfabetico)
        ungrouped = [c for cid, c in courses_by_id.items() if cid not in grouped_ids]
        if manifest and sections and ungrouped:
            sections.append({'id': 'altri', 'title': 'Altri corsi', 'courses': ungrouped})

        # Fallback: nessun manifest (o nessuna sezione valida) → lista piatta
        # in un'unica sezione senza titolo, comportamento identico a prima.
        if not sections and courses_by_id:
            sections = [{'id': None, 'title': None, 'courses': list(courses_by_id.values())}]

        return render_template('home.html', title='Piattaforma Corsi Interattivi', sections=sections)

    return app

if __name__ == '__main__':
    # Avvio locale: usa la config di sviluppo (auto-reload + debugger).
    # debug deriva dalla config; host/porta sono sovrascrivibili via ambiente.
    # Default host 127.0.0.1: il server di sviluppo NON va esposto sulla rete.
    app = create_app('development')
    app.run(
        host=os.environ.get('HOST', '127.0.0.1'),
        port=int(os.environ.get('PORT', 5000)),
        debug=app.config['DEBUG'],
    )
