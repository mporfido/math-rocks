"""Il blocco `:::algebra` (vedi docs/algebra.md).

Il blocco è un esercizio *chiuso*: c'è una forma d'arrivo e lo step non si apre
finché la scrittura non ci arriva. I modi in cui un blocco così si rompe non
danno un errore a video ma un esercizio **irrisolvibile**, e vanno fermati in
build:

  - un traguardo assente: non ci sarebbe niente da completare;
  - una mossa scritta male nella whitelist: la mossa che serve non compare nel
    menu, e lo studente resta davanti a un'equazione che non sa più muovere;
  - `incognita` messa dove nessuno la legge: si crede di aver detto una cosa che
    il motore non riceve.

L'elenco degli id di mossa lo legge la build da `static/lib/algebra-mosse.json`:
è l'unica cosa che Python sa del catalogo, che vive in JavaScript. Che
quell'elenco combaci con le mosse vere lo sorveglia `tests/js/algebra-mosse.test.js`.
"""
import html as html_lib
import json
import re

import pytest

from parser.preprocessors import process_algebra


def algebra(sorgente):
    """L'HTML del primo <x-algebra> prodotto da un frammento."""
    _content, replacements, _n = process_algebra(sorgente, 0)
    assert replacements, 'nessun blocco :::algebra riconosciuto'
    return list(replacements.values())[0]


def attr(html, nome):
    """Il valore JSON di un attributo data-*, deserializzato."""
    grezzo = re.search(rf'data-{nome}="([^"]*)"', html).group(1)
    return json.loads(html_lib.unescape(grezzo))


# -- Il caso normale -------------------------------------------------------

def test_equazione_traguardo_e_mosse():
    html = algebra(
        ':::algebra isola="y" mosse="trasporto;secondo-principio"\n'
        '2x + 3y - 6 = 0\n'
        ':::'
    )

    assert 'data-eq="2x + 3y - 6 = 0"' in html
    assert attr(html, 'traguardo') == {'isola': 'y'}
    assert attr(html, 'mosse') == ['trasporto', 'secondo-principio']
    assert 'id="algebra-0"' in html


def test_senza_whitelist_le_mosse_sono_tutte():
    """Nessun `data-mosse` = nessun limite: è il componente a saperlo."""
    html = algebra(':::algebra forma="normale"\nx^2 = 4 - 3x\n:::')
    assert 'data-mosse' not in html


def test_le_forme_del_traguardo():
    for forma in ('normale', 'ridotta', 'ax=b'):
        html = algebra(f':::algebra forma="{forma}"\n2x + 3 = 8\n:::')
        assert attr(html, 'traguardo') == {'forma': forma}


def test_incognita_accompagna_ax_uguale_b():
    html = algebra(':::algebra forma="ax=b" incognita="t"\n2t + 3 = 8\n:::')
    assert attr(html, 'traguardo') == {'forma': 'ax=b', 'incognita': 't'}


def test_lavagna_libera_non_e_un_goal():
    """Senza traguardo non c'è niente da completare: niente id, o lo step
    resterebbe chiuso per sempre."""
    html = algebra(':::algebra libera\n2x + 3 = 8\n:::')
    assert 'id=' not in html
    assert 'data-traguardo' not in html


def test_contatore_e_marker_distinti():
    sorgente = (
        ':::algebra libera\nx + 1\n:::\n\n'
        ':::algebra forma="ridotta"\n2x + 3x\n:::'
    )
    contenuto, replacements, contatore = process_algebra(sorgente, 0)
    assert contatore == 2
    assert len(replacements) == 2
    assert 'XALGEBRABLOCK0X' in contenuto and 'XALGEBRABLOCK1X' in contenuto
    assert 'id="algebra-1"' in replacements['XALGEBRABLOCK1X']


# -- Quello che deve fermare la build --------------------------------------

def test_senza_traguardo_e_senza_libera_si_ferma():
    with pytest.raises(ValueError, match='manca il traguardo'):
        algebra(':::algebra\n2x + 3 = 8\n:::')


def test_due_traguardi_insieme_si_fermano():
    with pytest.raises(ValueError, match='un traguardo solo'):
        algebra(':::algebra isola="y" forma="normale"\n2x + 3y = 0\n:::')
    with pytest.raises(ValueError, match='un traguardo solo'):
        algebra(':::algebra libera isola="y"\n2x + 3y = 0\n:::')


def test_forma_sconosciuta_si_ferma():
    with pytest.raises(ValueError, match='forma sconosciuta'):
        algebra(':::algebra forma="risolvi"\n2x + 3 = 8\n:::')


def test_mossa_inesistente_si_ferma():
    """Il caso vero: un id battuto a memoria, e la mossa che serve non compare
    nel menu. La build lo sa, perché l'elenco degli id ce l'ha."""
    with pytest.raises(ValueError, match='mossa sconosciuta'):
        algebra(':::algebra isola="y" mosse="trasporta;calcola"\n2x + 3y = 0\n:::')


def test_incognita_fuori_posto_si_ferma():
    with pytest.raises(ValueError, match='`incognita` vale solo'):
        algebra(':::algebra forma="normale" incognita="x"\n2x + 3 = 8\n:::')


def test_corpo_vuoto_o_doppio_si_ferma():
    with pytest.raises(ValueError, match='manca l\'equazione'):
        algebra(':::algebra libera\n\n:::')
    with pytest.raises(ValueError, match='una sola equazione'):
        algebra(':::algebra libera\nx + 1 = 0\n2y = 4\n:::')


# -- Il patto con il motore ------------------------------------------------

def test_l_elenco_delle_mosse_e_quello_del_catalogo():
    """La build valida contro `static/lib/algebra-mosse.json`. Se quel file
    sparisse o cambiasse chiave, ogni whitelist diventerebbe un errore: meglio
    accorgersene qui."""
    from parser.preprocessors import _mosse_note

    note = _mosse_note()
    assert 'trasporto' in note
    assert 'sposta-sinistra' in note, 'i gemelli a click dei gesti devono esistere'
    assert 'risolvi' not in note


# -- La pipeline intera ----------------------------------------------------

def test_il_blocco_sopravvive_a_mistune(tmp_path):
    """Il corpo è un'equazione: `2x^2 + 3*y_1` ha dentro `^`, `*` e `_`, che
    mistune leggerebbe come enfasi. Per questo il blocco viaggia come marker e
    torna dopo il rendering — ma il marker deve poi essere davvero rimesso, e
    fuori dal <p>, come per gli altri blocchi."""
    from parser.markdown_parser import CourseParser

    lezione = tmp_path / 'content-1.md'
    lezione.write_text(
        '> id: prova\n> title: Prova\n\n'
        'Prima.\n\n'
        ':::algebra isola="y" mosse="trasporto"\n'
        '2x + 3*y_1 - 6 = 0\n'
        ':::\n\n'
        'Dopo.\n',
        encoding='utf-8',
    )
    html = CourseParser().parse_file(lezione)['steps'][0]['html']

    assert '<x-algebra' in html
    assert 'XALGEBRABLOCK' not in html, 'il marker non è stato ripristinato'
    assert 'data-eq="2x + 3*y_1 - 6 = 0"' in html, 'mistune ha mangiato il corpo'
    assert '<em>' not in html
    assert '<p><x-algebra' not in html, 'il blocco non va incapsulato in un <p>'
