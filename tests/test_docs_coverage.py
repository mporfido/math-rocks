"""Il patto fra docs/ e il corso dimostrativo `esempi`.

La documentazione della sintassi sta in `docs/`, un file per argomento; il corso
`content/esempi/` ne è la vetrina eseguibile. È un patto che si rompe in
silenzio: la sintassi si evolve, il corso resta indietro, e la pagina di
riferimento comincia a descrivere qualcosa che nessuno può più vedere
funzionare. Era già successo — la vecchia guida rimandava a due corsi
(`esempio-algebra`, `esempio-grafici`) cancellati da tempo.

Questi test pinzano tre cose:

1. ogni file di `docs/` esiste ed è **sotto la soglia** di righe, cioè resta
   caricabile da solo senza portarsi dietro il resto;
2. ogni costrutto documentato **compare almeno una volta** nel corso demo;
3. i link relativi fra i file di `docs/` puntano a file che esistono.
"""
from pathlib import Path

import pytest

DOCS = Path(__file__).resolve().parent.parent / 'docs'
DEMO = Path(__file__).resolve().parent.parent / 'content' / 'esempi'

# Oltre questa lunghezza un file di riferimento smette di essere consultabile a
# pezzo singolo: è la ragione per cui la vecchia MARKDOWN_SYNTAX.md (1025
# righe) è stata spezzata.
MAX_RIGHE = 300

# Un costrutto per riga: (pagina di docs/, marcatore che deve comparire nel
# corso demo). Il marcatore è cercato nel sorgente markdown delle lezioni.
COPERTURA = [
    ('struttura.md', '> use-mathjs: true'),
    ('blanks.md', '[[select:'),
    ('blanks.md', '[[Addizione|'),
    ('smista.md', ':::smista'),
    ('smista.md', 'verdetto=no'),
    ('variabili.md', '|input}'),
    ('variabili.md', '${= '),
    ('variabili.md', '{check:'),
    ('grafici.md', ':::graph'),
    ('grafici.md', 'boundpoints:'),
    ('grafici.md', 'points:'),
    ('grafici.md', 'navigate: true'),
    ('grafici.md', 'targets: true'),
    ('grafici.md', 'tolerance:'),
    ('grafici-esempi.md', 'xclip:'),
    ('p5.md', ':::p5'),
    ('p5.md', 'sketch='),
    ('espressioni.md', ':::expr'),
    ('espressioni.md', ':::powers'),
    ('espressioni.md', 'no-eval'),
    ('espressioni.md', 'show-steps'),
    ('tabelle.md', ':::table'),
    ('formula.md', ':::formula'),
    ('blocchi.md', ':::div.reveal'),
    ('blocchi.md', ':::div.highlight'),
    ('blocchi.md', ':::details.syntax-doc'),
    ('blocchi.md', ':::details.hint'),
    ('matematica.md', '$$'),
    ('markdown-base.md', '![Diagramma|400]'),
    ('ricette.md', ':::div.reveal'),
]

# I file che l'indice deve elencare: se ne nasce uno e non entra nell'indice,
# esiste solo per chi già sapeva che c'era.
PAGINE = sorted({pagina for pagina, _ in COPERTURA})


def _lezioni():
    return sorted(DEMO.glob('content-*.md'))


def _sorgente_demo():
    return '\n'.join(f.read_text(encoding='utf-8') for f in _lezioni())


def test_la_cartella_docs_esiste():
    assert DOCS.is_dir(), 'la documentazione della sintassi vive in docs/'


@pytest.mark.parametrize('nome', PAGINE)
def test_ogni_pagina_esiste(nome):
    assert (DOCS / nome).is_file(), f'docs/{nome} è citato dalla copertura ma non esiste'


@pytest.mark.parametrize('percorso', sorted(DOCS.glob('*.md')), ids=lambda p: p.name)
def test_nessuna_pagina_supera_la_soglia(percorso):
    righe = len(percorso.read_text(encoding='utf-8').splitlines())
    assert righe < MAX_RIGHE, (
        f'docs/{percorso.name} ha {righe} righe (soglia {MAX_RIGHE}): '
        'spezzalo, invece di farlo ricrescere'
    )


@pytest.mark.parametrize('nome', PAGINE)
def test_lindice_elenca_ogni_pagina(nome):
    indice = (DOCS / 'README.md').read_text(encoding='utf-8')
    assert f']({nome})' in indice, f'docs/{nome} non è raggiungibile dall\'indice'


@pytest.mark.parametrize('pagina,marcatore', COPERTURA,
                         ids=[f'{p}:{m}' for p, m in COPERTURA])
def test_il_corso_demo_mostra_ogni_costrutto(pagina, marcatore):
    assert marcatore in _sorgente_demo(), (
        f'{marcatore!r} è documentato in docs/{pagina} ma non compare in '
        'nessuna lezione di content/esempi/: la vetrina non lo mostra più'
    )


@pytest.mark.parametrize('percorso', sorted(DOCS.glob('*.md')), ids=lambda p: p.name)
def test_i_link_fra_le_pagine_puntano_a_file_esistenti(percorso):
    import re

    rotti = []
    for bersaglio in re.findall(r'\]\(([^)#:]+\.md)[^)]*\)', percorso.read_text(encoding='utf-8')):
        if not (percorso.parent / bersaglio).resolve().is_file():
            rotti.append(bersaglio)
    assert not rotti, f'docs/{percorso.name} linka file inesistenti: {rotti}'
