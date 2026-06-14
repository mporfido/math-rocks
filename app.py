"""Applicazione Flask principale"""
from flask import Flask, render_template
from config import config
import os

def create_app(config_name='default'):
    """Factory per creare l'applicazione Flask"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Registra blueprint routes
    from routes.courses import courses_bp
    app.register_blueprint(courses_bp)

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
    app = create_app('development')
    app.run(host='0.0.0.0', port=5000, debug=True)
