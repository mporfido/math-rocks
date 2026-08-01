"""Rende importabili i moduli del progetto dai test.

pytest mette in `sys.path` la cartella del file di test, non la radice del
repo: senza questo, `from parser...` non si trova.
"""
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
if str(RADICE) not in sys.path:
    sys.path.insert(0, str(RADICE))
