"""Configurazione applicazione Flask"""
import os

class Config:
    """Configurazione base"""
    # In produzione imposta SECRET_KEY via variabile d'ambiente: il fallback
    # qui sotto è solo per lo sviluppo locale e NON va usato online.
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    CONTENT_DIR = 'content'
    COURSES_DATA_DIR = 'courses_data'

    # Testi configurabili del sito (override via variabili d'ambiente).
    # Il footer aggiunge "© <anno>" nel template, con anno dinamico.
    SITE_NAME = os.environ.get('SITE_NAME') or 'Math Rocks'
    SITE_TITLE = os.environ.get('SITE_TITLE') or 'Benvenuti ai Corsi Interattivi di Matematica'
    SITE_SUBTITLE = os.environ.get('SITE_SUBTITLE') or 'Lezioni di matematica interattive e coinvolgenti'
    FOOTER_TEXT = os.environ.get('FOOTER_TEXT') or 'Prof. Michele Porfido'

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
