"""La pagina-strumento `kind: algebra` in un browser vero, dentro pytest.

`test_algebra_browser.py` collauda il COMPONENTE; qui si collauda il pezzo che
in una lezione non esiste: la scheda nasce da un indirizzo, e l'indirizzo se lo
fabbrica chiunque. Quello che nel markdown garantisce la build — equazione
leggibile, traguardo esistente, id di mossa esistenti — qui deve garantirlo
`static/tools/algebra.js` nel browser, e senza portare giù la pagina.

La pagina si assembla come la costruisce `templates/tool.html` (le stesse
librerie, nello stesso ordine, poi l'implementazione dello strumento) e si apre
tre volte con tre indirizzi diversi: il link condiviso, la pagina della classe
(`noeditor`), la pagina aperta a mano. Il verdetto lo scrive
`tests/browser/collaudo-tool-algebra.js` in `#esito`.
"""
import html as html_lib
import json
import re
import subprocess
from pathlib import Path

import pytest

from test_algebra_browser import FINESTRA, STATIC, _chrome, _script_del_template

COLLAUDO = Path(__file__).parent / 'browser' / 'collaudo-tool-algebra.js'

# I `defaults` dell'istanza, come li passa tool.html in `data-defaults`. Il
# traguardo qui è `normale` apposta: il caso "nudo" deve vedere QUESTO e non
# quello che gli indirizzi degli altri casi portano nella query string.
DEFAULTS = {
    'eq': ['2x + 3 = 8', '5x + 4 - 2x = 9'],
    'forma': 'normale',
}

# Gli indirizzi da provare. Il `caso` lo legge solo il collaudo, per sapere che
# cosa aspettarsi; lo strumento lo ignora, come ogni parametro che non conosce.
CASI = {
    'link': (
        '?caso=link&eq=2x%2B3%3D8&eq=5x%2B4-2x%3D9&eq=2x%20%2B*%203'
        '&forma=ax%3Db&mosse=trasporto%3Bnon-esiste%3Bcalcola&titolo=Prova'
    ),
    'studente': '?caso=studente&eq=2x%2B3%3D8&libera=1&noeditor=1',
    'nudo': '?caso=nudo',
}


def _pagina():
    """La pagina dello strumento: librerie, componente, tools/algebra.js."""
    script = [f for f in _script_del_template()
              if f.startswith('lib/') or f == 'components/algebra.js']
    assert script[-1] == 'components/algebra.js', 'algebra.js deve venire dopo static/lib/'

    js = '\n'.join((STATIC / f).read_text(encoding='utf-8') for f in script)
    # Come tool.html: l'implementazione dello strumento viene DOPO i componenti
    # (cerca `.tool-root` e monta `<x-algebra>` appena caricata).
    tool = (STATIC / 'tools' / 'algebra.js').read_text(encoding='utf-8')
    css = '\n'.join((STATIC / f).read_text(encoding='utf-8')
                    for f in ('theme.css', 'style.css', 'components.css'))
    radice = (
        '<div class="tool-root" data-tool-id="equazioni" data-kind="algebra" '
        + 'data-defaults=\'' + json.dumps(DEFAULTS) + '\'></div>'
    )
    return (
        '<!doctype html><html lang="it"><head><meta charset="utf-8">'
        f'<title>collaudo strumento algebra</title><style>{css}</style></head>'
        f'<body class="app"><main class="tool-container">{radice}</main>'
        f'<script>{js}</script>'
        f'<script>{tool}</script>'
        f'<script>{COLLAUDO.read_text(encoding="utf-8")}</script>'
        '</body></html>'
    )


@pytest.mark.parametrize('caso', sorted(CASI))
def test_strumento_nel_browser(tmp_path, caso):
    """La scheda regge l'indirizzo che le arriva, buono o storto che sia."""
    chrome = _chrome()
    if chrome is None:
        pytest.skip('Chrome non installato: il collaudo nel browser non può girare qui')

    pagina = tmp_path / 'strumento.html'
    pagina.write_text(_pagina(), encoding='utf-8')

    esito = subprocess.run(
        [chrome, '--headless=old', '--disable-gpu', '--no-sandbox',
         f'--window-size={FINESTRA}', '--virtual-time-budget=5000',
         '--dump-dom', pagina.as_uri() + CASI[caso]],
        capture_output=True, text=True, timeout=120,
        # Il DOM riversato contiene le librerie inline, accenti compresi: senza
        # dirlo, su Windows la lettura passerebbe da cp1252 e morirebbe lì.
        encoding='utf-8', errors='replace',
    )
    trovato = re.search(r'<pre id="esito">(.*?)</pre>', esito.stdout, re.S)
    if not trovato:
        pytest.fail(
            f'il collaudo «{caso}» non ha lasciato un verdetto: la pagina si è '
            'rotta prima.\n\n'
            f'--- stdout (coda) ---\n{esito.stdout[-3000:]}\n'
            f'--- stderr ---\n{esito.stderr[-3000:]}'
        )

    righe = html_lib.unescape(trovato.group(1)).strip().splitlines()
    falliti = [r for r in righe if r.startswith('KO')]
    assert righe, f'nessuna prova eseguita nel caso «{caso}»'
    assert not falliti, f'lo strumento non regge nel caso «{caso}»:\n' + '\n'.join(righe)
