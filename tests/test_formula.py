"""La formula commentata (:::formula, vedi docs/formula.md).

Come per le tabelle e le dimostrazioni, quasi tutti i test guardano la
**validazione in build**. Qui il modo tipico di sbagliare è un nome: si marca
`@b1{2}` e poi si scrive la freccia da `b2`. Senza validazione il blocco
compila, la pagina si apre, e la freccia semplicemente non c'è — e non se ne
accorge nessuno finché non lo si proietta in classe.

I casi negativi partono tutti dallo stesso blocco VALIDO e ne rompono una cosa
sola.
"""
import json
import re

import pytest

from parser.markdown_parser import CourseParser
from parser.preprocessors import expand_formula_anchors


# Il blocco di riferimento: l'esponente negativo della lezione sulle potenze.
VALIDO = """:::formula
@b1{2}^{@e1{-2}} = \\left(@b2{\\tfrac{1}{2}}\\right)^{@e2{2}}

b1 -> b2 : reciproco
e1 -> e2 : cambia segno
:::"""


def rendi(sorgente):
    """Il markdown di uno step → l'HTML finale, come in build."""
    parser = CourseParser()
    contenuto, blocchi = parser._preprocess(sorgente)
    return parser._apply_block_replacements(parser.markdown(contenuto), blocchi)


def attributi(html):
    """(tex, frecce) letti dal tag <x-formula> generato."""
    tag = re.search(r'<x-formula[^>]*>', html).group(0)
    tex = re.search(r'data-tex="([^"]*)"', tag).group(1)
    frecce = re.search(r'data-arrows="([^"]*)"', tag).group(1)
    smonta = {'&quot;': '"', '&lt;': '<', '&gt;': '>', '&#x27;': "'", '&amp;': '&'}
    for entita, carattere in smonta.items():
        tex = tex.replace(entita, carattere)
        frecce = frecce.replace(entita, carattere)
    return tex, json.loads(frecce)


# --- Il caso felice ---------------------------------------------------------

def test_gli_ancoraggi_diventano_class_di_mathjax():
    """`@nome{...}` → `\\class{fx-nome}{...}`: è la classe che il componente
    cerca nel DOM per misurare dove agganciare la freccia."""
    tex, _ = attributi(rendi(VALIDO))

    assert '\\class{fx-b1}{2}' in tex
    assert '\\class{fx-e1}{-2}' in tex
    assert '@' not in tex


def test_ancoraggio_con_graffe_annidate():
    """Il corpo di un ancoraggio ne contiene spesso altre: serve uno scanner a
    graffe bilanciate, non una regex fino alla prima chiusa."""
    tex, nomi = expand_formula_anchors(r'@b{\frac{1}{2}} + @c{3}')

    assert tex == r'\class{fx-b}{\frac{1}{2}} + \class{fx-c}{3}'
    assert nomi == ['b', 'c']


def test_le_frecce_finiscono_nel_json_col_lato_auto():
    _, frecce = attributi(rendi(VALIDO))

    assert frecce == [
        {'da': 'b1', 'a': 'b2', 'testo': 'reciproco', 'lato': 'auto'},
        {'da': 'e1', 'a': 'e2', 'testo': 'cambia segno', 'lato': 'auto'},
    ]


def test_il_lato_si_puo_forzare():
    _, frecce = attributi(rendi(VALIDO.replace(
        'b1 -> b2 : reciproco', 'b1 -> b2 : reciproco | sotto')))

    assert frecce[0]['lato'] == 'sotto'
    assert frecce[0]['testo'] == 'reciproco'


def test_il_latex_non_passa_da_mistune():
    """Il corpo è pieno di `\\`, `{`, `_`, `*`: se arrivasse a mistune tornerebbe
    con enfasi e backslash mangiati. Passa da un marker, come :::expr."""
    html = rendi(VALIDO)

    assert '<em>' not in html
    assert '\\tfrac{1}{2}' in html.replace('&quot;', '"')
    # Ed è un elemento espositivo: niente id, quindi niente goal tracking.
    assert 'id=' not in re.search(r'<x-formula[^>]*>', html).group(0)


def test_due_blocchi_convivono():
    html = rendi(VALIDO + '\n\nE poi:\n\n' + VALIDO)

    assert html.count('<x-formula') == 2


# --- Quello che deve rompere la build ---------------------------------------

def test_freccia_verso_un_ancoraggio_inesistente():
    rotto = VALIDO.replace('b1 -> b2', 'b1 -> b9')

    with pytest.raises(ValueError, match='b9'):
        rendi(rotto)


def test_riga_freccia_malformata():
    rotto = VALIDO.replace('b1 -> b2 : reciproco', 'b1 e b2 sono reciproci')

    with pytest.raises(ValueError, match='riga freccia'):
        rendi(rotto)


def test_lato_sconosciuto():
    rotto = VALIDO.replace('reciproco', 'reciproco | destra')

    with pytest.raises(ValueError, match='lato sconosciuto'):
        rendi(rotto)


def test_ancoraggio_ripetuto():
    """Due `@b1` renderebbero ambiguo l'estremo della freccia: il componente
    aggancerebbe il primo, l'autore penserebbe al secondo."""
    rotto = VALIDO.replace('@b2{', '@b1{')

    with pytest.raises(ValueError, match='ripetuto'):
        rendi(rotto)


def test_graffa_non_chiusa():
    with pytest.raises(ValueError, match='graffa non chiusa'):
        expand_formula_anchors('@b{2 + 3')


def test_formula_senza_frecce():
    """Senza commenti non serve il componente: basta scrivere la formula."""
    with pytest.raises(ValueError, match='nessuna freccia'):
        rendi(':::formula\n@b1{2}^{2}\n:::')


def test_blocco_vuoto():
    with pytest.raises(ValueError, match='manca la formula'):
        rendi(':::formula\n\n:::')


def test_riga_vuota_dimenticata():
    """Senza la riga vuota le frecce sarebbero lette come parte della formula:
    il blocco compilerebbe in silenzio e la scheda non avrebbe commenti."""
    rotto = VALIDO.replace('\n\nb1', '\nb1')

    with pytest.raises(ValueError, match='riga vuota'):
        rendi(rotto)
