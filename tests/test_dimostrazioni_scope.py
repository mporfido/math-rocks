"""Il ragionamento ipotetico: assurdo e casi (DIMOSTRAZIONI.md §8).

Questi test guardano quasi tutti la **validazione in build**, non il caso
felice. È una scelta: una dimostrazione sbagliata che compila silenziosamente
finisce in una scheda che lo studente non può risolvere, e nessuno saprà mai
perché. La build deve fallire rumorosamente, e ogni regola del §8.6 ha qui la
riga che la tiene in piedi.

Ogni caso negativo parte da una dimostrazione VALIDA e ne rompe una cosa sola:
così quando un test diventa rosso si sa che cosa è cambiato.
"""
from pathlib import Path

import pytest

from parser.markdown_parser import CourseParser

RADICE = Path(__file__).resolve().parent.parent

# Una teoria minima: qui non interessa la geometria, interessa la struttura.
TEORIA = {
    'primo-criterio': {'nome': 'P', 'enunciato': 'p', 'tipo': 'assioma'},
    'confronto-segmenti': {'nome': 'C', 'enunciato': 'c', 'tipo': 'assioma'},
    'riduzione-all-assurdo': {'nome': 'R', 'enunciato': 'r', 'tipo': 'regola'},
    'esame-dei-casi': {'nome': 'E', 'enunciato': 'e', 'tipo': 'regola'},
}

TEOREMA = """:::theorem id=x titolo="T" modi={modi}

## ipotesi
- Ipotesi uno

## tesi
- La tesi

## dimostrazione
{dim}
:::
"""

# Un assurdo che si biforca in due casi, uno dei quali chiuso per analogia:
# la forma del secondo criterio, ridotta all'osso.
VALIDA = """- Non vale la tesi {assurdo: t1}
- Un passo {da: s1,h1, per: primo-criterio}
- O A o B {da: p1, per: confronto-segmenti}

### caso A {da: p2}
- Qualcosa {da: a1, per: primo-criterio}
- {contraddizione, da: a1,a2}

### caso B {da: p2}
- Si scambiano i ruoli {analogo: a1}

### quindi
- {contraddizione, da: a3,b2, per: esame-dei-casi}
- {t1, da: p3, per: riduzione-all-assurdo}"""


def compila(dim=VALIDA, modi='leggi'):
    """Compila un teorema e restituisce la struttura raccolta dal parser."""
    parser = CourseParser()
    parser.set_course_theory(dict(TEORIA), set(TEORIA))
    teoremi, _ = parser.parse_theorems(TEOREMA.format(modi=modi, dim=dim))
    return teoremi[0]


# --- Il caso felice ---------------------------------------------------------

def test_una_dimostrazione_per_assurdo_con_casi_compila():
    assert compila()['id'] == 'x'


def test_lo_scope_viene_dalla_posizione_non_dall_autore():
    """Lo statuto viene dalla sezione, lo scope dalla posizione: l'autore non
    scrive né l'uno né l'altro, e non può quindi sbagliarli."""
    passi = {p['id']: p for p in compila()['passi']}

    assert passi['h1']['scope'] is None
    assert passi['s1']['scope'] is None       # «supponiamo» sta FUORI da ciò che apre
    assert passi['p1']['scope'] == 's1'
    assert passi['a1']['scope'] == 's1'       # il caso sta nell'assurdo
    assert passi['a2']['scope'] == 'a1'       # i passi del ramo, nel ramo
    assert passi['p3']['scope'] == 's1'       # `### quindi` esce dai casi
    assert passi['t1']['scope'] is None       # lo scarico esce dall'assurdo


def test_gli_statuti_del_ragionamento_ipotetico():
    passi = {p['id']: p for p in compila()['passi']}

    assert (passi['s1']['statuto'], passi['s1']['sotto']) == ('assunzione', 'assurdo')
    assert (passi['a1']['statuto'], passi['a1']['sotto']) == ('assunzione', 'caso')
    assert passi['a3']['statuto'] == 'assurdo'
    assert passi['b2']['statuto'] == 'analogo'
    assert passi['t1']['statuto'] == 'tesi'


def test_i_rami_hanno_un_namespace_proprio():
    """Aggiungere un caso non deve rinumerare i passi già scritti: ogni ramo ha
    la sua lettera, e le costruzioni restano nel namespace globale."""
    ids = [p['id'] for p in compila()['passi']]
    assert ids == ['h1', 's1', 'p1', 'p2', 'a1', 'a2', 'a3', 'b1', 'b2', 'p3', 't1']


# --- Quello che la build deve rifiutare (§8.6) ------------------------------

ROTTURE = [
    pytest.param(
        VALIDA.replace('- {t1, da: p3,', '- {t1, da: p3,a2,'), 'leggi',
        'non è visibile',
        id='citazione fuori scope'),

    pytest.param(
        VALIDA.replace('- {t1, da: p3, per: riduzione-all-assurdo}',
                       '- {t1, da: p3, per: primo-criterio}'), 'leggi',
        'non è mai',
        id='assunzione mai scaricata'),

    pytest.param(
        VALIDA.replace('da: a3,b2, per: esame-dei-casi', 'da: a3, per: esame-dei-casi'),
        'leggi', 'non cita b2',
        id='un caso dimenticato'),

    pytest.param(
        VALIDA.replace('### quindi\n', ''), 'leggi', 'non è chiusa',
        id='casi mai richiusi'),

    pytest.param(
        VALIDA.replace('- Si scambiano i ruoli {analogo: a1}', '- {analogo: a1}'),
        'leggi', 'senza dire quale simmetria',
        id='analogo senza simmetria scritta'),

    pytest.param(
        VALIDA.replace('{analogo: a1}', '{analogo: p1}'), 'leggi',
        'non è un caso della stessa',
        id='analogo a qualcosa che non è un caso'),

    pytest.param(
        VALIDA.replace('- {contraddizione, da: a1,a2}', '- {contraddizione, da: a2}'),
        'leggi', 'una premessa',
        id='contraddizione con una premessa sola'),

    pytest.param(
        VALIDA.replace('{assurdo: t1}', '{assurdo: h1}'), 'leggi', 'non è una tesi',
        id='si nega qualcosa che non è la tesi'),

    pytest.param(
        VALIDA.replace('### caso A {da: p2}', '### caso A'), 'leggi', 'non dichiara',
        id='caso che nasce dal nulla'),

    pytest.param(
        '- Non vale la tesi {assurdo: t1}\n\n### quindi\n'
        '- {t1, da: s1, per: riduzione-all-assurdo}', 'leggi',
        'non chiude nessuna',
        id='quindi senza casi'),

    pytest.param(
        VALIDA, 'leggi,ordina', 'non regge',
        id='modalità che non regge uno scope'),
]


@pytest.mark.parametrize('dim, modi, atteso', ROTTURE)
def test_la_build_rifiuta(dim, modi, atteso):
    with pytest.raises(ValueError) as errore:
        compila(dim, modi)
    # Il messaggio è parte del contratto: deve dire QUALE passo non regge,
    # altrimenti l'autore sa solo che qualcosa non va.
    assert atteso in str(errore.value)


# --- Il corpus vero --------------------------------------------------------

def test_il_secondo_criterio_compila_davvero():
    """Il contenuto in `content/geometria` è la prova che la sintassi regge una
    dimostrazione intera, non solo lo scheletro dei test qui sopra."""
    from build_corpus import build_corpus

    # `build_corpus` compila e basta: a scrivere il JSON è `_scrivi`, che qui
    # non chiamiamo. Il test non tocca `tools_data/`.
    corpus = build_corpus('geometria', content_dir=str(RADICE / 'content'))
    teorema = next(t for t in corpus['teoremi'] if t['id'] == 'secondo-criterio')

    assert teorema['ha_dimostrazione']
    # Si dimostra dal primo criterio, che è un assioma: nessun arco entrante,
    # quindi il nodo sta al livello zero della mappa.
    assert teorema['usa'] == []
    assert 'riduzione-all-assurdo' in [f['id'] for f in teorema['fondamenti']]
