"""I blank `[[...]]` (vedi docs/blanks.md).

Il caso che questi test proteggono è quello che ha rotto la lezione sulla
funzione esponenziale: dentro un blank c'era `$\\sqrt[4]{2}$`, e le parentesi
quadre della radice chiudevano il corpo prima del tempo. Il match falliva del
tutto e a video restava il markup grezzo `[[...]]` — una scelta multipla che lo
studente non poteva usare, senza che la build dicesse niente.
"""
import html as html_lib
import json
import re

from parser.preprocessors import process_blanks


def blanks(sorgente):
    """[(attributi del tag, ...)] dei blank prodotti da un frammento."""
    html, _ = process_blanks(sorgente, 0)
    return html


def scelte(html):
    """Le opzioni di scelta multipla del primo blank, deserializzate."""
    grezzo = re.search(r"data-choices=\"([^\"]*)\"", html).group(1)
    return json.loads(html_lib.unescape(grezzo))


def test_latex_con_parentesi_quadre_dentro_una_scelta_multipla():
    """`\\sqrt[4]{2}`: la quadra della radice non chiude il blank."""
    html = blanks(r'[[$\sqrt{2}$|*$\sqrt[4]{2}$|$\frac{2}{4}$]]')

    assert '<x-blank' in html
    assert '[[' not in html
    assert scelte(html) == [r'$\sqrt{2}$', r'$\sqrt[4]{2}$', r'$\frac{2}{4}$']
    assert r'data-solution="$\sqrt[4]{2}$"' in html


def test_latex_con_parentesi_quadre_in_una_risposta_singola():
    html = blanks(r'Il valore è [[$\sqrt[3]{8}$]].')

    assert html.count('<x-blank') == 1
    assert r'data-solution="$\sqrt[3]{8}$"' in html


def test_due_blank_sulla_stessa_riga_restano_due():
    """Il corpo accetta `]`, ma non deve mangiarsi la chiusura e proseguire
    fino al blank successivo."""
    html = blanks('Prima [[5]] e poi [[7]].')

    assert html.count('<x-blank') == 2
    assert 'data-solution="5"' in html
    assert 'data-solution="7"' in html


def test_due_blank_con_quadre_sulla_stessa_riga():
    html = blanks(r'[[$\sqrt[4]{2}$]] e [[$\sqrt[3]{8}$]]')

    assert html.count('<x-blank') == 2
    assert r'data-solution="$\sqrt[4]{2}$"' in html
    assert r'data-solution="$\sqrt[3]{8}$"' in html
