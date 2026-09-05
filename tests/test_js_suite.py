"""Esegue la suite JavaScript dentro `python -m pytest`.

Metà della piattaforma è JavaScript, e finora non c'era modo di provarla: i
componenti si potevano rompere in silenzio e i test restavano verdi. Il runner
è quello integrato in Node (`node --test`), così non entra nessuna dipendenza
nuova nel progetto — niente package.json, niente node_modules.

Il wrapper esiste perché il comando dei test resti UNO SOLO: chi lancia
`python -m pytest tests/` deve vedere anche i fallimenti JS, senza doversi
ricordare di un secondo comando che prima o poi nessuno lancia più.
"""
import shutil
import subprocess
from pathlib import Path

import pytest

RADICE = Path(__file__).resolve().parent.parent

# Node vuole il glob, non la cartella: passando `tests/js` prova a caricarla
# come modulo e fallisce (Node 24 su Windows). Lo espande Node stesso, quindi
# va passato come stringa singola senza farlo toccare alla shell.
GLOB = 'tests/js/*.test.js'


def test_suite_javascript():
    """La suite JS passa (`node --test tests/js/*.test.js`)."""
    node = shutil.which('node')
    if node is None:
        pytest.skip('Node non installato: la suite JS non può girare qui')

    esito = subprocess.run(
        [node, '--test', GLOB],
        cwd=RADICE,
        capture_output=True,
        text=True,
    )
    if esito.returncode != 0:
        pytest.fail(
            'La suite JavaScript ha fallito.\n\n'
            f'--- stdout ---\n{esito.stdout}\n'
            f'--- stderr ---\n{esito.stderr}'
        )
