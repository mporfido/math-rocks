"""Configurazione applicazione Flask"""
import os

from site_config import load_site_config

# Config di istanza (site.yaml nella root): i testi e le scelte del *sito*
# vivono lì, l'engine tiene solo default neutri. Precedenza per ogni chiave:
# variabile d'ambiente > site.yaml > default neutro.
_site = load_site_config()

class Config:
    """Configurazione base"""
    # In produzione imposta SECRET_KEY via variabile d'ambiente: il fallback
    # qui sotto è solo per lo sviluppo locale e NON va usato online.
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    CONTENT_DIR = 'content'
    COURSES_DATA_DIR = 'courses_data'
    # Corpora degli strumenti compilati (build_corpus.py): un corpus non è un
    # corso e non ha lezioni, quindi non sta in COURSES_DATA_DIR.
    TOOLS_DATA_DIR = 'tools_data'

    # Testi configurabili del sito.
    # Il footer aggiunge "© <anno>" nel template, con anno dinamico.
    SITE_NAME = os.environ.get('SITE_NAME') or _site.get('site_name') or 'Corsi interattivi'
    SITE_TITLE = os.environ.get('SITE_TITLE') or _site.get('site_title') or 'Benvenuti'
    SITE_SUBTITLE = os.environ.get('SITE_SUBTITLE') or _site.get('site_subtitle') or ''
    FOOTER_TEXT = os.environ.get('FOOTER_TEXT') or _site.get('footer_text') or ''
    LANGUAGE = os.environ.get('SITE_LANGUAGE') or _site.get('language') or 'it'
    # Prefisso delle chiavi localStorage (progress.js lo legge da un meta tag).
    STORAGE_PREFIX = os.environ.get('STORAGE_PREFIX') or _site.get('storage_prefix') or 'corsi'

    # Tema dell'istanza: file CSS con i design token (caricato dopo i CSS
    # engine), colore del meta theme-color e font da precaricare.
    # Default globale del flag matematica (override per-corso in metadata.yaml):
    # governa il caricamento di MathJax; build_courses.py legge la stessa
    # chiave per l'auto-detect delle formule nei backtick.
    MATH_DEFAULT = bool(_site.get('math', False))

    THEME_FILE = _site.get('theme_file') or 'theme.css'
    THEME_COLOR = _site.get('theme_color') or '#FFFFFF'
    PRELOAD_FONTS = _site.get('preload_fonts') or []

class DevelopmentConfig(Config):
    """Configurazione per ambiente di sviluppo"""
    DEBUG = True
    FLASK_ENV = 'development'

class ProductionConfig(Config):
    """Configurazione per ambiente di produzione"""
    DEBUG = False
    FLASK_ENV = 'production'

# Configurazione di default
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
