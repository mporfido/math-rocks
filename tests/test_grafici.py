"""Il piano cartesiano `:::graph`, e i suoi punti trascinabili (docs/grafici.md).

Un `boundpoint` normale è di sola lettura: sbagliarlo produce un punto che non
compare, e si vede subito. Un `boundpoint` con `drag: true` no — quello promette
allo studente che trascinandolo cambierà qualcosa. Se le sue coordinate non sono
riscrivibili (un numero, un'espressione) o se manca la posizione di partenza, la
promessa è vuota: il punto torna dove stava, oppure non nasce affatto, e la
lezione compila in silenzio.

Questi test fanno fallire la build prima che accada, e verificano che le chiavi
nuove arrivino intatte fino al componente.
"""
import html as html_lib
import json
import re

import pytest

from parser.preprocessors import process_graphs


def grafico(sorgente):
    """L'HTML del primo <x-graph> prodotto da un frammento."""
    contenuto, _n = process_graphs(sorgente, 0)
    trovato = re.search(r'<x-graph[^>]*>', contenuto)
    assert trovato, 'nessun blocco :::graph riconosciuto'
    return trovato.group(0)


def attr(html, nome):
    """Il valore JSON di un attributo data-*, deserializzato."""
    grezzo = re.search(rf'data-{nome}="([^"]*)"', html).group(1)
    return json.loads(html_lib.unescape(grezzo))


VALIDO = """:::graph
xrange: "-1,12"
snap: 1
boundpoints:
  - {x: 1, y: 4, label: A}
  - {x: bx, y: by, label: B, drag: true, start: "8,3"}
:::"""


# -- Il caso normale -------------------------------------------------------

def test_il_punto_trascinabile_arriva_intatto_al_componente():
    punti = attr(grafico(VALIDO), 'boundpoints')
    assert punti[1] == {
        'x': 'bx', 'y': 'by', 'label': 'B', 'drag': True, 'start': '8,3'
    }


def test_i_punti_guidati_convivono_con_quelli_trascinabili():
    punti = attr(grafico(VALIDO), 'boundpoints')
    assert punti[0] == {'x': 1, 'y': 4, 'label': 'A'}
    assert 'drag' not in punti[0]


def test_il_punto_trascinabile_non_genera_un_goal():
    # I boundpoints restano esplorativi: il goal lo fa un [Verifica]{check: …}.
    # Solo un `points` con target merita un id.
    assert 'id=' not in grafico(VALIDO)


def test_i_boundpoints_di_sola_lettura_non_chiedono_start():
    sorgente = """:::graph
boundpoints:
  - {x: a, y: "2^a", label: P}
:::"""
    assert attr(grafico(sorgente), 'boundpoints')[0]['y'] == '2^a'


# -- Gli errori che vanno fermati in build ---------------------------------

def test_drag_su_una_coordinata_numerica():
    rotto = VALIDO.replace('{x: bx, y: by', '{x: 3, y: by')
    with pytest.raises(ValueError, match='nome di una variabile'):
        process_graphs(rotto, 0)


def test_drag_su_unespressione():
    rotto = VALIDO.replace('y: by', 'y: "2*bx"')
    with pytest.raises(ValueError, match='nome di una variabile'):
        process_graphs(rotto, 0)


def test_drag_senza_start():
    rotto = VALIDO.replace(', start: "8,3"', '')
    with pytest.raises(ValueError, match='start'):
        process_graphs(rotto, 0)


def test_start_con_un_solo_numero():
    rotto = VALIDO.replace('start: "8,3"', 'start: "8"')
    with pytest.raises(ValueError, match='start'):
        process_graphs(rotto, 0)


def test_start_che_non_sono_numeri():
    rotto = VALIDO.replace('start: "8,3"', 'start: "otto,tre"')
    with pytest.raises(ValueError, match='due numeri'):
        process_graphs(rotto, 0)


def test_lerrore_dice_di_quale_punto_si_parla():
    # Con tre punti nel blocco, "uno dei boundpoints è sbagliato" non basta
    # per trovarlo: il messaggio deve nominarlo.
    rotto = VALIDO.replace('{x: bx, y: by, label: B', '{x: 3, y: by, label: B')
    with pytest.raises(ValueError, match='B'):
        process_graphs(rotto, 0)
