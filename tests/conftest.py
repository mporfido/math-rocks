"""Rende importabili i moduli del progetto dai test.

pytest mette in `sys.path` la cartella del file di test, non la radice del
repo: senza questo, `from parser...` non si trova.
"""
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
if str(RADICE) not in sys.path:
    sys.path.insert(0, str(RADICE))


def rendi(sorgente):
    """Il markdown di uno step → l'HTML finale, esattamente come in build.

    Vive qui e non nei singoli file di test perché deve restare allineata a
    `CourseParser.parse_file`: quando cambia la pipeline (un preprocessore in
    più, un ripristino in più) il posto da aggiornare dev'essere uno solo,
    altrimenti i test continuano a passare su una pipeline che non esiste.
    """
    from parser.markdown_parser import CourseParser

    parser = CourseParser()
    contenuto, blocchi, formule = parser._preprocess(sorgente)
    html = parser._apply_block_replacements(parser.markdown(contenuto), blocchi)
    for marker, tex in formule.items():
        html = html.replace(marker, tex)
    return html
