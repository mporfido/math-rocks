"""Le tabelle con frecce (:::table, vedi docs/tabelle.md).

Come per le dimostrazioni, la maggior parte di questi test guarda la
**validazione in build**: una freccia che non compare — o che compare fra le
righe sbagliate — è una scheda che lo studente non può leggere, e nessuno se ne
accorge finché non la usa in classe. La build deve fallire rumorosamente.

I casi negativi partono tutti da una tabella VALIDA e ne rompono una cosa sola.

C'è poi un secondo gruppo di test, sul caso felice, che pinza la **geometria**:
le frecce vanno dal centro di una riga al centro della successiva, e questo si
regge tutto sui numeri di traccia calcolati in build. Se qualcuno cambia il
modo di contare le tracce senza volerlo, questi test lo dicono.
"""
import re

import pytest

from parser.markdown_parser import CourseParser
from parser.preprocessors import ARCO_VERTICALE


# La tabella di riferimento: la scala delle potenze della prima lezione.
# Cinque righe di dati, una corsia a destra, due celle da completare.
VALIDA = """:::table
| Potenza  | Valore  | v : 2 |
| -------- | ------- | ----- |
| $2^1$    | 2       |
| $2^0$    | [[1]]   |
| $2^{-1}$ | [[1/2]] |
:::"""


def rendi(sorgente):
    """Il markdown di uno step → l'HTML finale, come in build."""
    parser = CourseParser()
    contenuto, blocchi = parser._preprocess(sorgente)
    return parser._apply_block_replacements(parser.markdown(contenuto), blocchi)


def frecce(html):
    """[(classe di verso, posizione sulla griglia, etichetta)] in ordine."""
    trovate = []
    for pezzo in re.findall(r'<div class="tbl-freccia[^>]*>.*?</div>', html):
        verso = re.search(r'tbl-freccia--(\w+)', pezzo).group(1)
        stile = re.search(r'style="([^"]*)"', pezzo).group(1)
        etichetta = re.search(
            r'<span class="tbl-etichetta">(.*?)</span>', pezzo).group(1)
        trovate.append((verso, stile, etichetta))
    return trovate


# --- Il caso felice: la geometria -------------------------------------------

def test_una_freccia_per_salto_fra_i_centri_delle_righe():
    """Con l'intestazione a 1 traccia e le righe di dati a 2, le frecce cadono
    sulle linee dispari: sono le mezzerie delle righe."""
    trovate = frecce(rendi(VALIDA))

    assert [(v, e) for v, _, e in trovate] == [
        ('giu', ': 2'), ('giu', ': 2')
    ]
    assert [s for _, s, _ in trovate] == [
        'grid-row:3/5;grid-column:3',
        'grid-row:5/7;grid-column:3',
    ]


def test_le_righe_di_dati_occupano_due_tracce_solo_se_c_e_una_corsia():
    con_corsia = rendi(VALIDA)
    assert 'grid-row:2/span 2' in con_corsia

    senza_corsia = rendi(VALIDA.replace('| v : 2 |', '|').replace('| ----- |', '|'))
    assert 'tbl-freccia' not in senza_corsia
    assert 'grid-row:2/span 1' in senza_corsia


def test_la_freccia_e_un_archetto_che_si_incurva_verso_l_esterno():
    """L'arco è un SVG stirato dal CSS: il tratto resta di spessore costante
    (`non-scaling-stroke`) e si incurva verso il lato esterno della tabella."""
    destra = rendi(VALIDA)
    assert 'vector-effect="non-scaling-stroke"' in destra
    assert 'tbl-freccia--specchio' not in destra          # corsia a destra

    # L'etichetta sta ACCANTO all'arco, non dentro: interromperlo lo spezzava
    # in due tronconi che non si leggevano più come una freccia sola.
    assert re.search(r'<span class="tbl-arco">.*?</span>'
                     r'<span class="tbl-etichetta">', destra)

    sinistra = rendi(""":::table
| v : 2 | Potenza | Valore |
| ----- | ------- | ------ |
|       | $2^1$   | 2      |
|       | $2^0$   | 1      |
:::""")
    assert 'tbl-freccia--specchio' in sinistra            # corsia a sinistra


def test_l_archetto_e_mezza_ellisse_senza_flessi():
    """Tre proprietà della mezza ellisse, che vanno insieme:

    - è **simmetrica**: ribaltata sull'asse orizzontale ricade su sé stessa,
      così in catena gli archetti non fanno zigzag;
    - **non ha flessi**: si gonfia da una parte sola. Una curva a S si salda
      con quella sotto e la corsia si legge come un serpentone unico invece
      che come tanti salti distinti;
    - **arriva parallela** al lato della tabella (tangente orizzontale ai due
      estremi), perché la punta è un triangolo CSS che non si può ruotare di
      un angolo dipendente dall'altezza della riga — e l'orizzontale è l'unica
      direzione che lo stiramento verticale non cambia.
    """
    d = re.search(r'<path d="([^"]+)"', ARCO_VERTICALE).group(1)
    punti = [tuple(map(float, p)) for p in
             re.findall(r'(-?[\d.]+)\s+(-?[\d.]+)', d)]

    assert len(punti) == 7                       # M + 2 cubiche (3 punti l'una)
    specchiati = [(x, 100 - y) for x, y in reversed(punti)]
    assert all(abs(a - c) < 1e-9 and abs(b - e) < 1e-9
               for (a, b), (c, e) in zip(punti, specchiati))

    assert punti[0][1] == punti[1][1]            # tangente orizzontale in partenza
    assert punti[-1][1] == punti[-2][1]          # e in arrivo

    # Niente flessi: il poligono di controllo è convesso, cioè scende sempre
    # (le y non tornano mai indietro) e si allontana dalla tabella una volta
    # sola (le x salgono fino al colmo e poi rientrano).
    xs = [x for x, _ in punti]
    ys = [y for _, y in punti]
    assert ys == sorted(ys)
    colmo = xs.index(max(xs))
    assert xs[:colmo + 1] == sorted(xs[:colmo + 1])
    assert xs[colmo:] == sorted(xs[colmo:], reverse=True)


def test_il_verso_lo_dice_il_glifo():
    trovate = frecce(rendi(VALIDA.replace('v : 2', '^ × 2')))
    assert [(v, e) for v, _, e in trovate] == [('su', '× 2'), ('su', '× 2')]


def test_tilde_prolunga_la_freccia_invece_di_aprirne_una_nuova():
    """Il mezzo gradino: a sinistra UNA freccia che scavalca due mezzi passi,
    a destra DUE frecce, una per mezzo passo."""
    trovate = frecce(rendi(""":::table
| v : 2 | Potenza          | Valore | v : k |
| ----- | ---------------- | ------ | ----- |
|       | $2^1$            | 2      |
| ~     | il gradino nuovo | ?      |
|       | $2^0$            | 1      |
:::"""))

    sinistra = [s for _, s, _ in trovate if s.endswith('column:1')]
    destra = [s for _, s, _ in trovate if s.endswith('column:4')]
    assert sinistra == ['grid-row:3/7;grid-column:1']       # scavalca
    assert destra == ['grid-row:3/5;grid-column:4',
                      'grid-row:5/7;grid-column:4']


def test_etichette_diverse_e_catena_spezzata():
    trovate = frecce(rendi(""":::table
| Passo | Valore | v   |
| ----- | ------ | --- |
| a     | 3      | × 2 |
| b     | 6      | + 1 |
| c     | 7      | -   |
| d     | 12     |     |
:::"""))

    # Il `-` rompe la catena: fra c e d non c'è freccia.
    assert [e for _, _, e in trovate] == ['× 2', '+ 1']


def test_corsia_orizzontale_fra_le_colonne():
    trovate = frecce(rendi(""":::table
| > | × 3 | × 3 |
| x | 1   | 2   | 3 |
| y | 3   | 6   | 9 |
:::"""))

    # Il primo salto non ha etichetta (la cella è occupata dal marcatore) e
    # nessun default: niente freccia fra la colonna delle etichette e la prima
    # colonna di dati.
    assert [s for _, s, _ in trovate] == [
        'grid-row:1;grid-column:4/6',
        'grid-row:1;grid-column:6/8',
    ]


def test_intestazione_solo_con_la_riga_separatrice():
    assert 'tbl-cella--intestazione' in rendi(VALIDA)

    senza = rendi(VALIDA.replace('| -------- | ------- | ----- |\n', ''))
    assert 'tbl-cella--intestazione' not in senza


# --- Il caso felice: il contenuto delle celle -------------------------------

def test_una_cella_e_markdown_e_un_blank_e_un_goal_vero(tmp_path):
    lezione = tmp_path / 'content-1.md'
    lezione.write_text(
        '> id: prova\n> title: Prova\n\nPrima della tabella: [[7]]\n\n'
        + VALIDA + '\n',
        encoding='utf-8',
    )
    step = CourseParser().parse_file(lezione)['steps'][0]

    # I due blank nelle celle e quello nel testo: tre goal distinti, nessuna
    # collisione di id (i contatori sono condivisi col resto dello step).
    assert len(step['goals']) == 3
    assert len(set(step['goals'])) == 3
    assert '<x-blank id=' in step['html']


def test_scelta_multipla_dentro_una_cella():
    """La pipe della scelta multipla non è il divisore delle celle: in una
    tabella markdown normale questo non si può scrivere."""
    html = rendi(""":::table
| Base | Scendendo si          |
| ---- | --------------------- |
| 2    | [[*dimezza|raddoppia]] |
:::""")

    assert html.count('<x-blank') == 1
    assert 'data-choices="[&quot;dimezza&quot;, &quot;raddoppia&quot;]"' in html


def test_variabile_dentro_una_cella():
    """Anche le pipe della config di `${…}{…}` sono sintassi, non divisori:
    servono per le tabelle x-y i cui valori diventano punti su un grafico."""
    html = rendi(""":::table
| Esponente | Valore             |
| --------- | ------------------ |
| $3$       | ${y3}{y3||input}   |
| $-1$      | ${ym1}{ym1|0.5|input} |
:::""")

    assert html.count('<x-variable') == 2
    assert 'data-bind="y3" data-initial=""' in html
    assert 'data-bind="ym1" data-initial="0.5"' in html
    # Due colonne: se le pipe avessero spezzato le celle sarebbero di più
    assert 'grid-template-columns:auto auto"' in html


def test_variabile_e_scelta_multipla_nella_stessa_riga():
    html = rendi(""":::table
| Vuol dire                    | Valore           |
| ---------------------------- | ---------------- |
| [[*$\\sqrt{2}$|$1$]]          | ${yh}{yh||input} |
:::""")

    assert html.count('<x-blank') == 1
    assert html.count('<x-variable') == 1
    assert 'grid-template-columns:auto auto"' in html


def test_l_etichetta_letta_ad_alta_voce_non_ha_il_latex_addosso():
    """La freccia è role="img": alla sintesi vocale arriva solo l'aria-label."""
    html = rendi(VALIDA.replace('v : 2', r'v : $\sqrt{2}$'))
    assert 'aria-label="poi : radice di 2"' in html


def test_un_etichetta_non_diventa_un_elenco_puntato():
    """`+ 1` a inizio cella è un'etichetta, non un bullet."""
    html = rendi(VALIDA.replace('v : 2', 'v + 1'))
    assert '<ul>' not in html
    assert '<span class="tbl-etichetta">+ 1</span>' in html


# --- Validazione in build ---------------------------------------------------

def test_riga_con_troppe_celle():
    with pytest.raises(ValueError, match='celle contro le'):
        rendi(VALIDA.replace('| $2^0$    | [[1]]   |',
                             '| $2^0$    | [[1]]   | : 2 | in più |'))


def test_riga_di_dati_a_cui_manca_una_colonna_di_dati():
    with pytest.raises(ValueError, match='solo le corsie finali'):
        rendi(VALIDA.replace('| $2^0$    | [[1]]   |', '| $2^0$ |'))


def test_etichetta_sull_ultima_riga_della_corsia():
    """Il salto partirebbe dall'ultima riga: la freccia non comparirebbe."""
    with pytest.raises(ValueError, match="ultima riga della corsia"):
        rendi(VALIDA.replace('| $2^{-1}$ | [[1/2]] |',
                             '| $2^{-1}$ | [[1/2]] | : 2 |'))


def test_tilde_senza_una_freccia_da_prolungare():
    with pytest.raises(ValueError, match='senza una freccia da prolungare'):
        rendi(""":::table
| v   | Potenza | Valore |
| --- | ------- | ------ |
| ~   | $2^1$   | 2      |
|     | $2^0$   | 1      |
:::""")


def test_corsia_con_una_sola_riga_di_dati():
    with pytest.raises(ValueError, match='almeno due righe'):
        rendi(""":::table
| Potenza | Valore | v : 2 |
| ------- | ------ | ----- |
| $2^1$   | 2      |
:::""")


def test_riga_che_non_comincia_con_la_pipe():
    with pytest.raises(ValueError, match="non comincia con"):
        rendi(VALIDA.replace('| $2^0$    | [[1]]   |', 'due punto zero'))


def test_blocco_senza_chiusura():
    with pytest.raises(ValueError, match='senza la riga ":::"'):
        rendi(VALIDA.replace('\n:::', ''))


def test_incrocio_fra_due_corsie():
    with pytest.raises(ValueError, match="incrocio"):
        rendi(""":::table
| > | × 3 | × 3 | qui |
| x | 1   | 2   | v   |
| y | 3   | 6   |     |
:::""")


def test_tabella_di_sole_corsie():
    with pytest.raises(ValueError, match='sole corsie'):
        rendi(""":::table
| v : 2 | v : 3 |
| ----- | ----- |
|       |       |
|       |       |
:::""")


def test_gli_errori_indicano_la_riga_nel_file():
    """Il numero di riga è quello del FILE, non quello dentro al blocco: sei
    righe di testo, poi `:::table` (7), intestazione (8), separatore (9) e le
    tre righe di dati (10, 11, 12). L'etichetta di troppo è sulla 12."""
    with pytest.raises(ValueError, match='riga 12'):
        rendi('testo\n\n' * 3 + VALIDA.replace(
            '| $2^{-1}$ | [[1/2]] |', '| $2^{-1}$ | [[1/2]] | : 2 |'))
