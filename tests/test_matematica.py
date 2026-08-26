"""La matematica non deve passare da mistune (vedi docs/matematica.md).

LaTeX e markdown si contendono gli stessi caratteri, e per anni ha vinto il
markdown senza che nessuno se ne accorgesse — perché finché in una formula ci
sono solo `\\frac`, `\\cdot` e apici va tutto bene. Il giorno che qualcuno
scrive un pedice, no:

    $$\\underbrace{-3}_{\\text{coefficiente}}\\underbrace{x^2y^3}_{\\text{…}}$$

I due `_` sono una coppia di enfasi perfettamente legittima, mistune ci mette
un `<em>` in mezzo, e a MathJax arriva una formula che non compila: a video
resta il sorgente grezzo. Lo stesso vale per `\\;` (letto come escape di `;`),
per `a*b` e per `\\(…\\)`.

Questi test guardano il punto di consegna: quello che esce dal parser dev'essere
il LaTeX **identico** a quello che ha scritto l'autore.
"""
from conftest import rendi
from parser.markdown_parser import CourseParser


# -- I caratteri che il markdown reclamava -------------------------------

def test_i_pedici_non_diventano_corsivo():
    """Il caso che ha fatto scoprire il problema."""
    sorgente = r'$$\underbrace{-3}_{\text{coefficiente}}\underbrace{x^2y^3}_{\text{parte letterale}}$$'
    html = rendi(sorgente)

    assert '<em>' not in html
    assert r'_{\text{coefficiente}}' in html
    assert r'_{\text{parte letterale}}' in html


def test_un_pedice_semplice_sopravvive():
    html = rendi('La successione $a_1, a_2, a_n$ cresce.')

    assert '$a_1, a_2, a_n$' in html
    assert '<em>' not in html


def test_il_backslash_di_spaziatura_non_viene_mangiato():
    """`\\;` è uno spazio LaTeX: mistune lo leggerebbe come escape di `;`."""
    html = rendi(r'$$x \; + \; y$$')

    assert r'\;' in html


def test_gli_asterischi_dentro_una_formula_non_aprono_un_corsivo():
    html = rendi(r'$$a * b * c$$')

    assert '<em>' not in html
    assert '$$a * b * c$$' in html


def test_le_parentesi_matematiche_backslash_sopravvivono():
    """`\\(…\\)` è una delimitazione MathJax: senza protezione mistune la
    riduce a `(…)` e la formula smette di essere una formula."""
    html = rendi(r'Inline: \(x_1 + x_2\).')

    assert r'\(x_1 + x_2\)' in html


# -- Quello che NON deve cambiare ----------------------------------------

def test_la_formula_resta_dentro_il_suo_paragrafo():
    """Un marker di blocco che sta da solo si mangia il <p> attorno; una
    formula no — è testo, e il paragrafo se lo tiene."""
    html = rendi('$$x^2 + 1$$')

    assert '<p>$$x^2 + 1$$</p>' in html


def test_una_formula_dentro_un_code_fence_resta_sorgente(tmp_path):
    """Gli step `:::details.syntax-doc` mostrano la sintassi dentro un fence:
    lì il `$…$` non è una formula da rendere, è un esempio da leggere. Deve
    uscirne intatto e ancora dentro il suo <code>."""
    lezione = tmp_path / 'content-1.md'
    lezione.write_text(
        '> id: prova\n> title: Prova\n\n'
        'Si scrive così:\n\n'
        '```md\n$x_1 + x_2$\n```\n',
        encoding='utf-8',
    )
    html = CourseParser().parse_file(lezione)['steps'][0]['html']

    assert '<code' in html
    assert '$x_1 + x_2$' in html
    assert '<em>' not in html


def test_il_markdown_attorno_alla_formula_funziona_ancora():
    html = rendi('Il **doppio** di $x$ è *sempre* $2x$.')

    assert '<strong>doppio</strong>' in html
    assert '<em>sempre</em>' in html
    assert '$x$' in html and '$2x$' in html


def test_una_variabile_dentro_una_formula_resta_viva():
    """`${x}` e `${= …}` diventano marker PRIMA della protezione, quindi la
    formula continua ad aggiornarsi muovendo lo slider. È il motivo per cui
    la matematica va estratta per ultima e non per prima."""
    html = rendi('${x}{x|3|0,10,1}\n\n$$2 \\cdot ${x} = ${= 2*x}$$')

    assert '{{VAR:x:3}}' in html
    assert '{{CALC:' in html


def test_la_matematica_di_una_cella_di_tabella_e_protetta(tmp_path):
    """Le celle passano da `_render_inline`, che è una pipeline a parte: la
    protezione serve anche lì, o la tabella si rompe da sola."""
    lezione = tmp_path / 'content-1.md'
    lezione.write_text(
        '> id: prova\n> title: Prova\n\n'
        ':::table\n'
        '| termine | grado |\n'
        '| --- | --- |\n'
        '| $a_1x^2$ | 2 |\n'
        '| $a_2x$ | 1 |\n'
        ':::\n',
        encoding='utf-8',
    )
    html = CourseParser().parse_file(lezione)['steps'][0]['html']

    assert '$a_1x^2$' in html
    assert '$a_2x$' in html
    assert '<em>' not in html
