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
        """Homepage con lista corsi"""
        from pathlib import Path
        import yaml

        courses = []
        content_dir = Path(app.config['CONTENT_DIR'])

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

                courses.append({
                    'id': course_dir.name,
                    'title': metadata.get('title', course_dir.name.replace('-', ' ').title()),
                    'description': metadata.get('description', ''),
                    'lessons': len(lesson_files),
                    'color': metadata.get('color')
                })

        return render_template('home.html', title='Piattaforma Corsi Interattivi', courses=courses)

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
