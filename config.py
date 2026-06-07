"""Configurazione applicazione Flask"""
import os

class Config:
    """Configurazione base"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    CONTENT_DIR = 'content'
    COURSES_DATA_DIR = 'courses_data'

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
