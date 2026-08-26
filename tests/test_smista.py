"""Lo smistamento in categorie `:::smista` (vedi docs/smista.md).

Il blocco è un esercizio *chiuso*: c'è una risposta giusta e lo step non si apre
finché non la si trova. Il modo in cui un blocco così si rompe non è un errore a
video ma un esercizio **irrisolvibile**: una categoria scritta in due modi
diversi fra intestazione e corpo, un cartellino senza soluzione in un blocco che
pretende la verifica, un `goal` messo insieme a `verdetto=no`. In tutti e tre i
casi la lezione compila in silenzio e lo studente resta bloccato su uno step che
non può chiudere.

Questi test fanno fallire la build, rumorosamente, prima che accada.
"""
import html as html_lib
import json
import re

import pytest

from parser.preprocessors import process_smista


def smista(sorgente):
    """L'HTML del primo <x-smista> prodotto da un frammento."""
    _content, replacements, _n = process_smista(sorgente, 0)
    assert replacements, 'nessun blocco :::smista riconosciuto'
    return list(replacements.values())[0]


def attr(html, nome):
    """Il valore JSON di un attributo data-*, deserializzato."""
    grezzo = re.search(rf'data-{nome}="([^"]*)"', html).group(1)
    return json.loads(html_lib.unescape(grezzo))


# -- Il caso normale -------------------------------------------------------

def test_carte_e_categorie():
    html = smista(
        ':::smista goal categorie="monomio;binomio"\n'
        '3x^2y -> monomio\n'
        '2a + b -> binomio\n'
        ':::'
    )

    assert attr(html, 'categorie') == ['monomio', 'binomio']
    assert attr(html, 'carte') == [
        {'tex': '3x^2y', 'cat': 'monomio'},
        {'tex': '2a + b', 'cat': 'binomio'},
    ]
    assert 'id="smista-0"' in html


def test_categorie_con_spazi_fra_virgolette():
    """`categorie="grado 1;grado 2"`: le etichette le legge uno studente, non
    un parser — devono poter contenere spazi."""
    html = smista(
        ':::smista goal categorie="grado 1;grado 2"\n'
        'x -> grado 1\n'
        'x^2 -> grado 2\n'
        ':::'
    )

    assert attr(html, 'categorie') == ['grado 1', 'grado 2']


def test_categorie_dedotte_dal_corpo_nellordine_di_apparizione():
    html = smista(
        ':::smista goal\n'
        'x^2 + 1 -> binomio\n'
        '5 -> monomio\n'
        ':::'
    )

    assert attr(html, 'categorie') == ['binomio', 'monomio']


def test_categoria_vuota_dichiarata_nellintestazione():
    """Un contenitore che deve restare vuoto è una domanda a sé: «ce n'è
    davvero nessuno di grado 3?». Va dichiarato, e sopravvive alla build."""
    html = smista(
        ':::smista goal categorie="grado 1;grado 2;grado 3"\n'
        'x -> grado 1\n'
        'x^2 -> grado 2\n'
        ':::'
    )

    assert attr(html, 'categorie') == ['grado 1', 'grado 2', 'grado 3']


def test_smistamento_libero_non_e_un_goal():
    """`verdetto=no`: il gesto di apertura, quando i gruppi non hanno ancora un
    nome. Nessun id, quindi non blocca lo step."""
    html = smista(
        ':::smista verdetto=no categorie="A;B;C"\n'
        '3x\n'
        'x + 1\n'
        ':::'
    )

    assert 'id=' not in html
    assert 'data-verdetto="no"' in html
    assert attr(html, 'carte') == [
        {'tex': '3x', 'cat': None},
        {'tex': 'x + 1', 'cat': None},
    ]


def test_mescola_no():
    html = smista(
        ':::smista verdetto=no mescola=no categorie="A;B"\n'
        'x\n'
        ':::'
    )

    assert 'data-mescola="no"' in html


def test_il_latex_arriva_intatto():
    """Il corpo non passa da mistune: `\\frac`, `^`, `_` restano quello che sono."""
    html = smista(
        ':::smista goal categorie="frazionario;intero"\n'
        r'\frac{a^2}{3} -> frazionario' '\n'
        r'-2ab^3 -> intero' '\n'
        ':::'
    )

    assert attr(html, 'carte')[0]['tex'] == r'\frac{a^2}{3}'
    assert attr(html, 'carte')[1]['tex'] == r'-2ab^3'


# -- Gli errori che vanno fermati in build ---------------------------------

def test_categoria_sconosciuta():
    """Il refuso che rende l'esercizio irrisolvibile: il cartellino aspetta un
    contenitore che a video non esiste."""
    with pytest.raises(ValueError, match='categoria sconosciuta'):
        smista(
            ':::smista goal categorie="monomio;binomio"\n'
            '3x -> monomi\n'
            ':::'
        )


def test_goal_senza_soluzione():
    with pytest.raises(ValueError, match='manca la categoria'):
        smista(
            ':::smista goal categorie="monomio;binomio"\n'
            '3x -> monomio\n'
            'x + 1\n'
            ':::'
        )


def test_goal_con_verdetto_no():
    """Un goal che non verifica niente non si completerebbe mai."""
    with pytest.raises(ValueError, match='si escludono'):
        smista(
            ':::smista goal verdetto=no categorie="A;B"\n'
            'x -> A\n'
            ':::'
        )


def test_una_sola_categoria():
    with pytest.raises(ValueError, match='almeno due categorie'):
        smista(
            ':::smista goal\n'
            '3x -> monomio\n'
            '5 -> monomio\n'
            ':::'
        )


def test_corpo_vuoto():
    with pytest.raises(ValueError, match='nessun cartellino'):
        smista(':::smista goal categorie="A;B"\n\n:::')
