"""I calcoli live `${= espressione}` (vedi docs/variabili.md).

Il marker `{{CALC:...}}` deve arrivare intatto fino al browser: è x-step che lo
sostituisce col risultato a ogni battuta di tasto. Il pericolo è a monte, in
build — l'espressione attraversa mistune, e un `*` non protetto la trasformerebbe
in corsivo. Quello che allo studente arriverebbe non è un errore: è una formula
che non si aggiorna, e nessuno se ne accorge finché non la usa in classe.
"""
from urllib.parse import quote

from conftest import rendi


def test_il_marker_del_calcolo_sopravvive_al_markdown():
    html = rendi('Il quadrato: ${= k*k}')

    assert f'{{{{CALC:{quote("k*k", safe="")}}}}}' in html


def test_gli_asterischi_non_diventano_corsivo():
    """Tre fattori, due asterischi: senza encoding mistune apre un <em>."""
    html = rendi('Il prodotto: ${= a*b*c}')

    assert '<em>' not in html
    assert quote('a*b*c', safe='') in html


def test_il_calcolo_convive_col_riferimento_alla_variabile():
    html = rendi('Il fattore: ${k}{k|1|input}\n\nQuadrato: ${k} per ${k} fa ${= k*k}')

    assert '<x-variable' in html
    assert '{{VAR:k:1}}' in html
    assert f'{{{{CALC:{quote("k*k", safe="")}}}}}' in html


def test_una_variabile_normale_resta_un_riferimento():
    """Il ramo nuovo non deve rubare i riferimenti semplici."""
    html = rendi('Base: ${a}{a|2|0,4,0.1}\n\nVale ${a}.')

    assert '{{VAR:a:2}}' in html
    assert 'CALC' not in html
