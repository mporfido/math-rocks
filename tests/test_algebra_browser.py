"""Il collaudo di `<x-algebra>` in un browser vero, dentro `python -m pytest`.

La suite di `tests/js/` prova il MOTORE, che non ha un DOM: nessuno dei suoi
test tocca un click, uno span o un trascinamento. E il primo modo in cui il
componente si è rotto era esattamente lì — `data-nodo` è una stringa, gli id
dell'albero sono numeri, `trovaNodo` confronta con `===`: 174 test verdi e in
pagina ogni click era morto, senza un errore in console.

Quindi: si assembla una pagina con le librerie NELL'ORDINE in cui le mette
`templates/_assets.html`, la si apre in Chrome headless, e si legge il verdetto
che `tests/browser/collaudo-algebra.js` scrive in `#esito`. Senza Chrome il
test si salta, come fa `test_js_suite.py` senza Node.
"""
import html as html_lib
import os
import re
import shutil
import subprocess
from pathlib import Path

import pytest

RADICE = Path(__file__).resolve().parent.parent
STATIC = RADICE / 'static'
ASSETS = RADICE / 'templates' / '_assets.html'
COLLAUDO = Path(__file__).parent / 'browser' / 'collaudo-algebra.js'

# Le lavagne su cui gioca il collaudo. Gli id sono il suo appiglio: cambiarli
# qui vuol dire cambiarli anche là.
BLOCCHI = [
    ('a1', '2x + 3y - 6 = 0', '{"isola":"y"}'),
    ('g1', '2x + 3 = 8', '{"forma":"ax=b"}'),
    ('g2', '3 + 2x - y = 0', '{"forma":"normale"}'),
    ('g3', '2x + 4 + 5x = 0', '{"forma":"normale"}'),
    ('g4', '2x + 5x = 0', '{"forma":"normale"}'),
    # Dentro a una parentesi: i termini che nascono da un prodotto notevole.
    ('g5', 'x/2 + 9(4x^2 - 1/9 - (4x^2 - 4/3x + 1/9)) = 0', '{"forma":"normale"}'),
]

# Alta abbastanza da tenere tutte le lavagne dentro la finestra: il collaudo usa
# `elementFromPoint`, che fuori dal viewport non trova niente e farebbe fallire
# i gesti per un motivo che non c'entra con il componente.
FINESTRA = '1000,2400'


def _chrome():
    """Il primo Chrome che si trova, o None."""
    for nome in ('chrome', 'google-chrome', 'chromium', 'chromium-browser'):
        trovato = shutil.which(nome)
        if trovato:
            return trovato
    candidati = [
        Path(os.environ.get('PROGRAMFILES', r'C:\Program Files'))
        / 'Google' / 'Chrome' / 'Application' / 'chrome.exe',
        Path(os.environ.get('PROGRAMFILES(X86)', r'C:\Program Files (x86)'))
        / 'Google' / 'Chrome' / 'Application' / 'chrome.exe',
        Path('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
    ]
    for c in candidati:
        if c.exists():
            return str(c)
    return None


def _script_del_template():
    """Gli script che `_assets.html` mette in pagina, nell'ordine in cui li mette.

    Si legge dal template invece di riscriverne la lista: è proprio l'ordine la
    cosa che questo collaudo deve sorvegliare, e una lista copiata smette di
    dire il vero al primo file aggiunto.
    """
    testo = ASSETS.read_text(encoding='utf-8')
    macro = testo[testo.index('macro component_scripts()'):]
    macro = macro[:macro.index('endmacro')]
    return re.findall(r"filename='([^']+)'", macro)


def _pagina():
    """La pagina di collaudo: librerie, componente, fogli di stile, lavagne."""
    script = [f for f in _script_del_template()
              if f.startswith('lib/') or f == 'components/algebra.js']
    assert 'components/algebra.js' in script, '_assets.html non carica algebra.js'
    assert script[-1] == 'components/algebra.js', 'algebra.js deve venire dopo static/lib/'

    js = '\n'.join((STATIC / f).read_text(encoding='utf-8') for f in script)
    css = '\n'.join((STATIC / f).read_text(encoding='utf-8')
                    for f in ('theme.css', 'style.css', 'components.css'))
    corpo = '\n'.join(
        f'<x-algebra id="{i}" data-eq="{eq}" data-traguardo=\'{t}\'></x-algebra>'
        for i, eq, t in BLOCCHI
    )
    return (
        '<!doctype html><html lang="it"><head><meta charset="utf-8">'
        f'<title>collaudo x-algebra</title><style>{css}</style></head>'
        f'<body class="app"><main>{corpo}</main>'
        f'<script>{js}</script>'
        f'<script>{COLLAUDO.read_text(encoding="utf-8")}</script>'
        '</body></html>'
    )


def test_collaudo_nel_browser(tmp_path):
    """Il componente regge una partita intera, gesti compresi."""
    chrome = _chrome()
    if chrome is None:
        pytest.skip('Chrome non installato: il collaudo nel browser non può girare qui')

    pagina = tmp_path / 'collaudo.html'
    pagina.write_text(_pagina(), encoding='utf-8')

    esito = subprocess.run(
        [chrome, '--headless=old', '--disable-gpu', '--no-sandbox',
         f'--window-size={FINESTRA}', '--virtual-time-budget=5000',
         '--dump-dom', pagina.as_uri()],
        capture_output=True, text=True, timeout=120,
    )
    trovato = re.search(r'<pre id="esito">(.*?)</pre>', esito.stdout, re.S)
    if not trovato:
        pytest.fail(
            'il collaudo non ha lasciato un verdetto: la pagina si è rotta prima.\n\n'
            f'--- stdout (coda) ---\n{esito.stdout[-3000:]}\n'
            f'--- stderr ---\n{esito.stderr[-3000:]}'
        )

    righe = html_lib.unescape(trovato.group(1)).strip().splitlines()
    falliti = [r for r in righe if r.startswith('KO')]
    assert righe, 'nessuna prova eseguita'
    assert not falliti, 'il componente non regge in pagina:\n' + '\n'.join(righe)
