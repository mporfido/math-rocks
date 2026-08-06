"""Pre-processori per sintassi markdown custom"""
import re
import json
import html as html_lib
from urllib.parse import quote as url_quote
import yaml


def process_graphs(content, graph_counter):
    """
    Converte blocchi :::graph YAML ::: in <x-graph> web component

    Sintassi (layer componibili, tutti opzionali e combinabili):
        :::graph
        xrange: "-6,6"
        bind: a
        functions:
          - expr: "sin(a * x)"
        points:
          - target: "3,2"
        boundpoints:
          - {x: ax, y: ay, label: A}
        :::

    `expr` top-level è una scorciatoia per una singola curva (con eventuale
    `xclip`); equivale a functions: [{expr, xclip}].

    Il grafico riceve un id per il goal tracking solo se almeno un punto
    di `points` ha un `target` (gli altri layer sono solo esplorativi).

    Args:
        content: Contenuto markdown
        graph_counter: Contatore per ID univoci

    Returns:
        Tuple (contenuto processato, nuovo valore counter)
    """
    graph_block_pattern = re.compile(
        r':::graph[ \t]*\n(.*?)\n:::',
        re.DOTALL
    )

    def replace_graph(match):
        nonlocal graph_counter
        # Sostituisce tab con spazi prima del parsing: YAML non accetta tab
        # come indentazione, ma alcuni editor li inseriscono automaticamente
        yaml_content = match.group(1).expandtabs(4)

        try:
            config = yaml.safe_load(yaml_content) or {}
        except yaml.YAMLError:
            config = {}

        if 'type' in config:
            # La sintassi legacy `type:` non è più supportata: meglio fallire
            # rumorosamente in build che produrre un grafico sbagliato in pagina.
            raise ValueError(
                f"Blocco :::graph con 'type: {config['type']}' non supportato: "
                "usa le chiavi componibili functions/points/boundpoints "
                "(vedi GRAFICI.md)"
            )

        # Scorciatoia: expr top-level = singola curva (con eventuale xclip)
        if 'expr' in config:
            entry = {'expr': config.pop('expr')}
            if 'xclip' in config:
                entry['xclip'] = config.pop('xclip')
            config.setdefault('functions', []).append(entry)

        graph_counter += 1

        attrs = []

        # Goal tracciabile solo se c'è almeno un punto con obiettivo
        points = config.get('points') or []
        has_target = isinstance(points, list) and any(
            isinstance(p, dict) and p.get('target') for p in points
        )
        if has_target:
            attrs.append(f'id="graph-{graph_counter - 1}"')

        for key, value in config.items():
            if isinstance(value, bool):
                # bool Python → "true"/"false" minuscolo per JS
                value = str(value).lower()
            elif key == 'bind' and isinstance(value, list):
                value = ','.join(str(v) for v in value)
            elif key in ('points', 'functions', 'boundpoints') and isinstance(value, list):
                # Serializza la lista come JSON e HTML-escapa le virgolette
                attrs.append(f'data-{key}="{html_lib.escape(json.dumps(value))}"')
                continue
            attrs.append(f'data-{key}="{html_lib.escape(str(value), quote=True)}"')

        return f'<x-graph {" ".join(attrs)}></x-graph>'

    processed = graph_block_pattern.sub(replace_graph, content)
    return processed, graph_counter


# ---------------------------------------------------------------------------
# :::table — tabelle con frecce etichettate
# ---------------------------------------------------------------------------
# In una tabella didattica quello che conta spesso non è una colonna in più, ma
# l'operazione che porta da una riga alla successiva: sta FRA due righe, non
# dentro una. Qui una CORSIA (una colonna, o una riga) dichiarata da un glifo di
# verso al posto dell'intestazione ospita quelle frecce. Non ci sono chiavi da
# ricordare: il corpo resta una normale tabella a pipe.
#
# L'etichetta di un salto si scrive nella cella da cui il salto PARTE; il glifo
# può portare un'etichetta di default valida per tutti i salti della corsia.
# `-` rompe la catena, `~` prolunga la freccia aperta sopra (freccia che
# scavalca più righe). Vedi TABELLE.md.

# Glifo del marcatore → verso della freccia.
CORSIA_VERTICALE = {'v': 'giu', '↓': 'giu', '^': 'su', '↑': 'su'}
CORSIA_ORIZZONTALE = {'>': 'destra', '→': 'destra', '<': 'sinistra', '←': 'sinistra'}

# Come si legge una freccia ad alta voce (aria-label): il verso è informazione,
# non decorazione — "risalendo × 2" non è "poi × 2".
VERSO_PARLATO = {
    'giu': 'poi', 'su': 'risalendo',
    'destra': 'poi', 'sinistra': 'tornando indietro',
}

# Le corsie sono strette: la traccia si allarga solo se l'etichetta lo richiede.
TRACCIA_CORSIA = 'minmax(2.6rem, auto)'

# L'archetto. È un SVG stirato dal CSS sull'altezza (o sulla larghezza) della
# freccia: `preserveAspectRatio="none"` lo fa aderire alla griglia senza che
# nessuno debba misurare niente, e `vector-effect="non-scaling-stroke"` tiene
# il tratto a spessore costante nonostante lo stiramento. `currentColor` lo
# lascia al colore del testo, quindi ai token del tema.
#
# La curva è mezza ELLISSE (due cubiche, una per quarto): parte dal bordo della
# tabella all'altezza di una riga, si gonfia verso l'esterno e torna sul bordo
# all'altezza della riga successiva. Stirata resta mezza ellisse, cioè un arco
# semplice, con la curvatura sempre dallo stesso lato: nessun flesso. Una curva
# a S, invece, in catena si salda con quella sotto e le frecce si leggono come
# un serpentone unico, non come tanti salti distinti.
#
# Le tangenti agli estremi sono ORIZZONTALI (verticali nelle corsie
# orizzontali), ed è l'unica direzione che lo stiramento non cambia. Serve
# perché la punta è un triangolo CSS, che non si può ruotare di un angolo
# dipendente dall'altezza della riga: così punta e curva restano allineate a
# ogni altezza, e la punta guarda DENTRO la tabella, verso la riga d'arrivo.
def _arco(viewbox, d):
    return (
        f'<span class="tbl-arco"><svg viewBox="{viewbox}" '
        'preserveAspectRatio="none" aria-hidden="true" focusable="false">'
        f'<path d="{d}" fill="none" stroke="currentColor" stroke-width="2" '
        'stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg></span>'
    )


# Gli estremi (3px fuori dal bordo della tabella) cadono DENTRO il triangolo
# della punta, che è ancorato al bordo ed è profondo 7px: la curva ci finisce
# sotto invece di sbucarne oltre il vertice.
ARCO_VERTICALE = _arco(
    '0 0 20 100', 'M6 0 C12.1 0, 17 22.4, 17 50 C17 77.6, 12.1 100, 6 100')
ARCO_ORIZZONTALE = _arco(
    '0 0 100 20', 'M0 6 C0 12.1, 22.4 17, 50 17 C77.6 17, 100 12.1, 100 6')


def _celle_tabella(riga):
    """
    `| a | b |` → ['a', 'b'].

    Divisore proprio invece di uno `split('|')`: dentro una cella può esserci
    una scelta multipla `[[a|*b|c]]`, che una tabella markdown normale spezza in
    tre celle (è il motivo per cui oggi le scelte multiple nelle tabelle non si
    possono usare). `\\|` resta una pipe letterale.
    """
    riga = riga.strip()
    if riga.startswith('|'):
        riga = riga[1:]
    if riga.endswith('|') and not riga.endswith('\\|'):
        riga = riga[:-1]

    celle, buf, dentro, i = [], [], 0, 0
    while i < len(riga):
        due = riga[i:i + 2]
        if due == '\\|':
            buf.append('|')
            i += 2
            continue
        if due == '[[':
            dentro += 1
            buf.append(due)
            i += 2
            continue
        if due == ']]' and dentro:
            dentro -= 1
            buf.append(due)
            i += 2
            continue
        if riga[i] == '|' and dentro == 0:
            celle.append(''.join(buf).strip())
            buf = []
        else:
            buf.append(riga[i])
        i += 1
    celle.append(''.join(buf).strip())
    return celle


def _marcatore(cella, mappa):
    """
    ('giu', ': 2') se la cella è un marcatore di corsia, altrimenti None.

    Il glifo deve stare da solo o essere seguito da uno spazio: `v` e `v : 2`
    sono corsie, `valore` è un'intestazione come un'altra.
    """
    if not cella:
        return None
    verso = mappa.get(cella[0])
    if verso is None:
        return None
    resto = cella[1:]
    if resto and not resto[0].isspace():
        return None
    return verso, resto.strip()


def _parlato(etichetta):
    """
    L'etichetta come si legge ad alta voce (aria-label).

    La freccia è `role="img"`: il suo contenuto non arriva alla sintesi vocale,
    ci arriva solo questa stringa. Senza ripulitura un'etichetta come `: $k$`
    verrebbe letta con tutto il LaTeX addosso.
    """
    testo = re.sub(r'\\sqrt\{([^{}]*)\}', r'radice di \1', etichetta)
    testo = re.sub(r'\\frac\{([^{}]*)\}\{([^{}]*)\}', r'\1 fratto \2', testo)
    return testo.replace('$', '').strip()


def _e_separatore(celle):
    """La riga `| --- | :---: |` di una tabella markdown: facoltativa."""
    return bool(celle) and all(re.fullmatch(r':?-+:?', c) for c in celle)


def _catena(etichette, verso, default, dove, orientamento, numeri=None):
    """
    Le celle di una corsia → l'elenco delle frecce.

    `etichette[i]` etichetta il salto dall'elemento i all'elemento i+1: l'ultima
    cella non ha nulla sotto di sé e deve restare vuota. `-` rompe la catena,
    `~` prolunga la freccia aperta invece di aprirne una nuova.
    """
    frecce, aperta = [], None
    ultimo = 'colonna' if orientamento == 'orizzontale' else 'riga'

    def dove_i(i):
        return f'riga {numeri[i]}' if numeri else dove

    for i, grezza in enumerate(etichette):
        if i == len(etichette) - 1:
            if grezza == '~':
                raise ValueError(
                    f"{dove_i(i)}: '~' sull'ultima {ultimo} della corsia: non "
                    "c'è niente oltre, la freccia non avrebbe dove arrivare"
                )
            if grezza and grezza != '-':
                raise ValueError(
                    f"{dove_i(i)}: etichetta '{grezza}' sull'ultima {ultimo} "
                    f'della corsia: il salto partirebbe dall\'ultima {ultimo} '
                    'e la freccia non comparirebbe'
                )
            break

        if grezza == '~':
            if aperta is None:
                raise ValueError(
                    f"{dove_i(i)}: '~' senza una freccia da prolungare (serve "
                    f'una freccia aperta nella {ultimo} precedente)'
                )
            aperta['a'] = i + 1
            continue

        if grezza == '-':
            aperta = None
            continue

        etichetta = grezza or default
        if not etichetta:
            aperta = None
            continue

        aperta = {'da': i, 'a': i + 1, 'etichetta': etichetta, 'verso': verso}
        frecce.append(aperta)

    return frecce


def _linee(tipi, dimezza):
    """
    Il numero di linea della griglia da cui comincia ogni riga (o colonna).

    Una riga (o colonna) di DATI occupa due tracce invece di una quando esiste
    una corsia nell'altro senso: è il trucco che permette a una freccia di
    partire dal CENTRO di una riga e arrivare al CENTRO della successiva senza
    misurare niente in JavaScript (metà bassa della prima + metà alta della
    seconda). Le corsie occupano sempre una traccia sola.
    """
    linee, cur = [], 1
    for t in tipi:
        linee.append(cur)
        cur += 2 if (t == 'dati' and dimezza) else 1
    return linee


def _stile(coppie):
    """Le dichiarazioni CSS inline, compatte e in ordine stabile."""
    return ';'.join(f'{k}:{v}' for k, v in coppie)


def _render_tabella(corpo, riga0, render_text):
    """
    Il corpo di un blocco :::table → l'HTML della griglia. Vedi TABELLE.md.

    `riga0` è il numero di riga della `:::table` nel file: serve solo a far
    puntare gli errori al punto giusto.
    """
    rendi = render_text or (lambda t: html_lib.escape(t))
    dove = f'riga {riga0}'

    # (numero di riga NEL FILE, celle): gli errori devono indicare il punto in
    # cui l'autore deve mettere le mani, non una posizione dentro al blocco.
    righe = [(riga0 + n, testo.strip())
             for n, testo in enumerate(corpo.split('\n'), start=1)
             if testo.strip()]
    if not righe:
        raise ValueError(f'{dove}: blocco :::table vuoto')
    for numero, testo in righe:
        if not testo.startswith('|'):
            raise ValueError(
                f"riga {numero}: {testo!r} non comincia con '|': dentro "
                ':::table ogni riga è una riga di tabella (o manca la riga '
                '":::" che chiude il blocco?)'
            )

    numeri = [n for n, _ in righe]
    grezze = [_celle_tabella(testo) for _, testo in righe]

    # Classificazione delle righe. Una riga è una CORSIA se la sua prima cella
    # è un marcatore orizzontale: la corsia non contiene dati, solo frecce.
    tipi_riga = []
    for celle in grezze:
        if _e_separatore(celle):
            tipi_riga.append('sep')
        elif _marcatore(celle[0], CORSIA_ORIZZONTALE):
            tipi_riga.append('corsia')
        else:
            tipi_riga.append('dati')

    if 'dati' not in tipi_riga:
        raise ValueError(f'{dove}: la tabella non ha nessuna riga di dati')

    # La prima riga di dati dichiara i tipi delle colonne; è anche
    # l'INTESTAZIONE se subito dopo c'è la riga separatrice `| --- |`, come in
    # markdown. Senza separatore è una riga di dati come le altre.
    i_dich = tipi_riga.index('dati')
    dopo = tipi_riga[i_dich + 1:i_dich + 2]
    ha_intestazione = dopo == ['sep']

    tipi_col, versi_col, default_col = [], [], []
    for cella in grezze[i_dich]:
        m = _marcatore(cella, CORSIA_VERTICALE)
        if m:
            tipi_col.append('corsia')
            versi_col.append(m[0])
            default_col.append(m[1])
        else:
            tipi_col.append('dati')
            versi_col.append(None)
            default_col.append('')

    n_col = len(tipi_col)
    idx_col_dati = [c for c, t in enumerate(tipi_col) if t == 'dati']
    if not idx_col_dati:
        raise ValueError(f'{dove}: la tabella è fatta di sole corsie')

    def allinea(celle, numero, tipo):
        """
        Pareggia una riga a n_col celle.

        In una riga di dati si possono omettere solo le celle di corsia finali
        (una cella di dati mancante è quasi sempre una pipe dimenticata); in una
        riga di corsia le celle sono etichette, e le ultime possono mancare
        semplicemente perché quei salti non hanno etichetta.
        """
        if len(celle) > n_col:
            raise ValueError(
                f'riga {numero}: {len(celle)} celle contro le {n_col} della '
                'prima riga della tabella'
            )
        if tipo == 'dati' and any(t != 'corsia' for t in tipi_col[len(celle):]):
            raise ValueError(
                f'riga {numero}: {len(celle)} celle contro le {n_col} della '
                'prima riga della tabella (in una riga di dati si possono '
                'omettere solo le corsie finali)'
            )
        return celle + [''] * (n_col - len(celle))

    # La sequenza delle righe della griglia (via i separatori), e i valori delle
    # sole righe di dati. Nella riga che dichiara le colonne le celle di corsia
    # sono occupate dal marcatore: per le catene contano come vuote.
    sequenza, valori, numeri_dati = [], [], []
    for i, (celle, tipo) in enumerate(zip(grezze, tipi_riga)):
        if tipo == 'sep':
            continue
        n = numeri[i]
        piena = allinea(celle, n, tipo)
        if tipo == 'corsia':
            sequenza.append({'tipo': 'corsia', 'celle': piena, 'numero': n})
            continue
        if i == i_dich:
            piena = [
                '' if tipi_col[c] == 'corsia' else v for c, v in enumerate(piena)
            ]
            if ha_intestazione:
                sequenza.append({'tipo': 'intestazione', 'celle': piena,
                                 'numero': n})
                continue
        sequenza.append({'tipo': 'dati', 'celle': piena, 'numero': n,
                         'i': len(valori)})
        valori.append(piena)
        numeri_dati.append(n)

    n_righe_dati = len(valori)
    corsie_v = [c for c, t in enumerate(tipi_col) if t == 'corsia']
    corsie_h = [r for r in sequenza if r['tipo'] == 'corsia']

    if corsie_v and n_righe_dati < 2:
        raise ValueError(
            f'{dove}: una corsia verticale ha bisogno di almeno due righe di '
            'dati (una freccia collega due righe)'
        )
    if corsie_h and len(idx_col_dati) < 2:
        raise ValueError(
            f'{dove}: una corsia orizzontale ha bisogno di almeno due colonne '
            'di dati (una freccia collega due colonne)'
        )

    # Le frecce verticali: una catena per corsia, sulle righe di dati.
    frecce = []
    for c in corsie_v:
        for f in _catena([v[c] for v in valori], versi_col[c], default_col[c],
                         dove, 'verticale', numeri_dati):
            frecce.append({**f, 'orientamento': 'verticale', 'corsia': c})

    # Le frecce orizzontali: la prima cella della riga è occupata dal marcatore,
    # quindi il primo salto può essere etichettato solo dal default.
    for r in corsie_h:
        verso, default = _marcatore(r['celle'][0], CORSIA_ORIZZONTALE)
        for c in corsie_v:
            if r['celle'][c] and c != 0:
                raise ValueError(
                    f"riga {r['numero']}: la cella all'incrocio fra una corsia "
                    'orizzontale e una verticale non ha significato'
                )
        etichette = [r['celle'][c] for c in idx_col_dati]
        if idx_col_dati[0] == 0:
            etichette[0] = ''
        for f in _catena(etichette, verso, default, f"riga {r['numero']}",
                         'orizzontale'):
            frecce.append({**f, 'orientamento': 'orizzontale', 'corsia': r})

    # Geometria della griglia. Le righe (colonne) di dati si sdoppiano solo se
    # esiste una corsia che le attraversa: senza frecce niente tracce inutili.
    dimezza_righe = bool(corsie_v)
    dimezza_col = bool(corsie_h)
    R = _linee(
        [('dati' if r['tipo'] == 'dati' else 'corsia') for r in sequenza],
        dimezza_righe,
    )
    C = _linee(tipi_col, dimezza_col)
    passo_riga = 2 if dimezza_righe else 1
    passo_col = 2 if dimezza_col else 1

    tracce = [
        TRACCIA_CORSIA if t == 'corsia' else ('auto ' * passo_col).strip()
        for t in tipi_col
    ]

    # Il riquadro: un solo elemento dietro le celle, così il bordo arrotondato
    # non va ricomposto cella per cella. Copre l'area dei dati; le corsie
    # esterne restano nel margine.
    righe_riquadro = [i for i, r in enumerate(sequenza) if r['tipo'] != 'corsia']
    r0, r1 = righe_riquadro[0], righe_riquadro[-1]
    fine_r1 = R[r1] + (passo_riga if sequenza[r1]['tipo'] == 'dati' else 1)
    c0, c1 = idx_col_dati[0], idx_col_dati[-1]
    parti = [
        '<div class="tbl-riquadro" aria-hidden="true" style="{}"></div>'.format(
            _stile([
                ('grid-row', f'{R[r0]}/{fine_r1}'),
                ('grid-column', f'{C[c0]}/{C[c1] + passo_col}'),
            ])
        )
    ]

    # Celle e frecce nell'ordine di lettura: le frecce che partono da una riga
    # subito dopo le celle di quella riga (la posizione sulla griglia è
    # esplicita, quindi l'ordine nel DOM serve solo a chi legge l'HTML).
    for i, riga in enumerate(sequenza):
        if riga['tipo'] != 'corsia':
            ultima = (i == r1)
            for c in idx_col_dati:
                classi = ['tbl-cella']
                if riga['tipo'] == 'intestazione':
                    classi.append('tbl-cella--intestazione')
                    if c == c0:
                        classi.append('tbl-cella--angolo-sx')
                    if c == c1:
                        classi.append('tbl-cella--angolo-dx')
                elif ultima:
                    classi.append('tbl-cella--ultima')
                span_r = passo_riga if riga['tipo'] == 'dati' else 1
                parti.append('<div class="{}" style="{}">{}</div>'.format(
                    ' '.join(classi),
                    _stile([
                        ('grid-row', f'{R[i]}/span {span_r}'),
                        ('grid-column', f'{C[c]}/span {passo_col}'),
                    ]),
                    rendi(riga['celle'][c]),
                ))

        for f in frecce:
            if f['orientamento'] == 'verticale':
                if riga['tipo'] != 'dati' or f['da'] != riga['i']:
                    continue
                r_da = next(j for j, s in enumerate(sequenza)
                            if s['tipo'] == 'dati' and s['i'] == f['da'])
                r_a = next(j for j, s in enumerate(sequenza)
                           if s['tipo'] == 'dati' and s['i'] == f['a'])
                posizione = [
                    ('grid-row', f'{R[r_da] + 1}/{R[r_a] + 1}'),
                    ('grid-column', str(C[f['corsia']])),
                ]
                # L'archetto si incurva verso l'ESTERNO della tabella: una
                # corsia a sinistra lo vuole specchiato.
                specchio = f['corsia'] < c0
            else:
                if f['corsia'] is not riga:
                    continue
                posizione = [
                    ('grid-row', str(R[i])),
                    ('grid-column',
                     f"{C[idx_col_dati[f['da']]] + 1}/{C[idx_col_dati[f['a']]] + 1}"),
                ]
                specchio = i < r0
            classi = f"tbl-freccia tbl-freccia--{f['verso']}"
            if specchio:
                classi += ' tbl-freccia--specchio'
            parti.append(
                '<div class="{}" role="img" aria-label="{}" style="{}">'
                '{}<span class="tbl-etichetta">{}</span></div>'.format(
                    classi,
                    html_lib.escape(
                        f"{VERSO_PARLATO[f['verso']]} {_parlato(f['etichetta'])}",
                        quote=True,
                    ),
                    _stile(posizione),
                    ARCO_ORIZZONTALE if f['orientamento'] == 'orizzontale'
                    else ARCO_VERTICALE,
                    rendi(f['etichetta']),
                )
            )

    return (
        '<div class="tbl-scroll"><div class="tbl" style="{}">{}</div></div>'
    ).format(
        _stile([('grid-template-columns', ' '.join(tracce))]),
        ''.join(parti),
    )


def process_tables(content, table_counter, render_text=None):
    """
    Converte blocchi :::table ... ::: in una griglia con frecce etichettate.

    Sintassi (vedi TABELLE.md per il riferimento completo):

        :::table
        | Potenza  | Valore  | v : 2 |
        | -------- | ------- | ----- |
        | $2^1$    | 2       |
        | $2^0$    | [[1]]   |
        | $2^{-1}$ | [[1/2]] |
        :::

    Il glifo al posto dell'intestazione dichiara una CORSIA: `v`/`^` una colonna
    di frecce verticali, `>`/`<` (in prima cella di riga) una riga di frecce
    orizzontali. L'etichetta dopo il glifo vale per tutti i salti; una cella la
    sovrascrive per il proprio salto; `-` rompe la catena e `~` prolunga la
    freccia aperta sopra.

    Il contenuto delle celle è markdown normale e viene renderizzato da
    `render_text` (il callback del parser, che condivide i contatori): dentro
    una cella `[[1/2]]` è un blank vero, e finisce nei goal dello step senza
    che qui ci sia niente da fare.

    Il blocco viene estratto in un marker e reinserito DOPO il rendering
    markdown, come :::p5 e :::theorem: le pipe non devono arrivare a mistune,
    che spezzerebbe le scelte multiple e non capirebbe le corsie.

    Args:
        content: Contenuto markdown
        table_counter: Contatore per marker univoci
        render_text: Callback markdown-inline per il contenuto delle celle

    Returns:
        Tuple (contenuto con marker, dict marker→HTML, nuovo valore counter)
    """
    pattern = re.compile(r'^:::table[ \t]*\n(.*?)\n:::[ \t]*$',
                         re.DOTALL | re.MULTILINE)
    replacements = {}

    def replace_table(match):
        nonlocal table_counter
        riga0 = content[:match.start()].count('\n') + 1
        marker = f'XTABLEBLOCK{table_counter}X'
        replacements[marker] = _render_tabella(match.group(1), riga0, render_text)
        table_counter += 1
        return marker

    processed = pattern.sub(replace_table, content)

    # Un :::table rimasto è un blocco non chiuso: senza questo controllo lo
    # raccoglierebbe process_blocks, che lo trasformerebbe in un <table> aperto
    # e mai chiuso — in silenzio, e con mezza lezione dentro.
    resto = re.search(r'^:::table\b', processed, re.MULTILINE)
    if resto:
        riga = processed[:resto.start()].count('\n') + 1
        raise ValueError(
            f'riga {riga}: blocco :::table senza la riga ":::" che lo chiude'
        )

    return processed, replacements, table_counter


def process_p5(content, p5_counter):
    """
    Converte blocchi :::p5 ... ::: in <x-p5> web component (sketch p5.js).

    Due modalità:

    1. Sketch INLINE: il codice JS dello sketch è nel corpo del blocco (il corpo
       è codice al 100%, così non collide con il separatore di step `---`):
        :::p5 goal height=400 bind=a
        p.setup = () => { p.createCanvas(400, 400); };
        p.draw = () => {
          const a = ctx.model.a;       // valore live di slider/campi della pagina
          // ...disegno...
          if (a === 5) ctx.complete(); // criterio deciso dall'autore
        };
        :::

    2. Sketch RIUSABILE per nome: il codice vive in static/components/p5-sketches.js
       (registro window.P5Sketches) e il markdown lo richiama con `sketch=<nome>`
       passando i parametri sulla riga di apertura. Il corpo è vuoto:
        :::p5 sketch=rettangoli-divisori n=6 height=360
        :::

    Opzioni riconosciute sulla riga di apertura:
        goal           flag: rende lo sketch un goal (gli assegna un id)
        height=400     altezza del canvas (default 400)
        width=600      larghezza del canvas (opzionale)
        bind=a,b       variabili da osservare per ctx.onChange / redraw
        sketch=nome    usa lo sketch registrato `nome` (niente corpo JS)
    Ogni altra coppia `chiave=valore` è un PARAMETRO dello sketch: viene raccolto
    e serializzato in data-params (JSON), disponibile allo sketch come ctx.params.
    I valori numerici (`n=6`) sono convertiti in numeri.

    Lo sketch riceve `p` (istanza p5 in instance mode) e `ctx`:
        ctx.complete()    segnala il completamento del goal (idempotente)
        ctx.model         valori live di slider e campi numerici (${a}, ${ax}, …)
        ctx.onChange(cb)  registra una callback chiamata a ogni cambio di variabile
        ctx.params        parametri passati dal markdown (solo sketch riusabili)

    Lo sketch conta come goal (riceve un id) SOLO con il flag `goal`; altrimenti
    è pura visualizzazione e non blocca lo step.

    Il corpo JS può contenere qualsiasi carattere (incluso `` ` ``, `${`, `[[`),
    quindi il blocco viene estratto in un marker e l'HTML finale (con il codice
    dentro uno <script type="application/x-p5-sketch"> non eseguibile) viene
    restituito come replacement da applicare DOPO il rendering markdown: così né
    mistune né gli altri preprocessori toccano lo sketch.

    Args:
        content: Contenuto markdown
        p5_counter: Contatore per ID univoci

    Returns:
        Tuple (contenuto con marker, dict marker→HTML, nuovo valore counter)
    """
    # Opzioni con un significato speciale: NON diventano parametri dello sketch.
    RESERVED_OPTS = {'goal', 'height', 'width', 'bind', 'sketch'}

    # `^` ancora l'apertura a inizio riga: un eventuale `:::p5` citato a metà
    # frase (es. `` `:::p5` `` nel testo) non viene catturato. La chiusura è un
    # `:::` su riga propria. Il `\n?` prima di `:::` rende il corpo opzionale
    # (uno sketch riusabile `sketch=...` non ha corpo JS).
    pattern = re.compile(r'^:::p5[ \t]*([^\n]*)\n(.*?)\n?:::[ \t]*$', re.DOTALL | re.MULTILINE)
    replacements = {}

    def coerce(value):
        """Converte i parametri numerici in int/float; il resto resta stringa."""
        try:
            return int(value)
        except ValueError:
            pass
        try:
            return float(value)
        except ValueError:
            return value

    def replace_p5(match):
        nonlocal p5_counter
        options_str = match.group(1).strip()
        code = match.group(2)

        # Parsing opzioni: token separati da spazi; `goal` è un flag,
        # gli altri sono coppie chiave=valore. Le chiavi non riservate sono
        # parametri dello sketch.
        opts = {}
        params = {}
        for token in options_str.split():
            if '=' in token:
                key, _, value = token.partition('=')
                key = key.strip()
                value = value.strip()
                if key in RESERVED_OPTS:
                    opts[key] = value
                else:
                    params[key] = coerce(value)
            else:
                opts[token] = True

        marker = f'XP5BLOCK{p5_counter}X'

        attrs = []
        # Id (quindi goal tracking) solo se richiesto col flag `goal`
        if opts.get('goal'):
            attrs.append(f'id="p5-{p5_counter}"')

        attrs.append(f'data-height="{opts.get("height", 400)}"')
        if opts.get('width'):
            attrs.append(f'data-width="{opts["width"]}"')
        if opts.get('bind'):
            attrs.append(f'data-bind="{opts["bind"]}"')
        if opts.get('sketch'):
            attrs.append(f'data-sketch="{html_lib.escape(opts["sketch"], quote=True)}"')
        if params:
            attrs.append(f'data-params="{html_lib.escape(json.dumps(params))}"')

        p5_counter += 1

        # Sketch riusabile (sketch=…): niente <script>, il codice è nel registro.
        if opts.get('sketch'):
            replacements[marker] = f'<x-p5 {" ".join(attrs)}></x-p5>'
        else:
            script = f'<script type="application/x-p5-sketch">\n{code}\n</script>'
            replacements[marker] = f'<x-p5 {" ".join(attrs)}>{script}</x-p5>'
        return marker

    processed = pattern.sub(replace_p5, content)
    return processed, replacements, p5_counter


def process_expr(content, expr_counter):
    """
    Converte blocchi :::expr ... ::: in <x-expr> web component
    (risoluzione grafica di un'espressione, metodo "Sciogliamo i nodi").

    Sintassi (una sola espressione per blocco):
        :::expr
        (4 + 5*4) - (8:2 + 6)
        :::

    Flag opzionali sulla riga di apertura del fence (separati da spazi):
        :::expr show-steps
        (4 + 5*4) - (8:2 + 6)
        :::
    `show-steps` mostra sotto l'albero lo svolgimento classico passo-passo.
    `powers` attiva la modalità potenze: le potenze restano simboliche e si
    riducono con le proprietà (stessa base, stesso esponente, potenza di
    potenza, cambio di base). `:::powers` è un alias di `:::expr powers`:
    stesso componente, zucchero sintattico. Con `powers` le righe dello
    svolgimento sono cronologiche (una per passaggio) invece che per livello.
    `no-eval` (solo con powers) vieta la valutazione numerica delle potenze:
    forza il percorso delle proprietà; l'esercizio deve essere risolvibile
    con le sole proprietà.

    Linguaggio dell'espressione (input fidato dell'autore):
        operatori: + - * (moltiplicazione) : (divisione) ^ (potenza)
        frazioni:  a/b tra interi è un letterale razionale atomico
        parentesi: ( ) [ ] { } (equivalenti, annidabili)

    Come :::p5, il corpo può contenere caratteri che mistune o gli altri
    preprocessori interpreterebbero (`*`, `[`, `]`, `{`, `}`): viene quindi
    estratto in un marker e l'HTML finale (con l'espressione in un attributo
    HTML-escaped) è restituito come replacement da applicare DOPO il rendering
    markdown. Il componente riceve sempre un id (è sempre un goal).

    Args:
        content: Contenuto markdown
        expr_counter: Contatore per ID univoci

    Returns:
        Tuple (contenuto con marker, dict marker→HTML, nuovo valore counter)
    """
    pattern = re.compile(
        r'^:::(?P<tag>expr|powers)[ \t]*(?P<opts>[^\n]*)\n(?P<body>.*?)\n:::[ \t]*$',
        re.DOTALL | re.MULTILINE,
    )
    replacements = {}

    def replace_expr(match):
        nonlocal expr_counter
        expr = match.group('body').strip()
        opts = match.group('opts').split()
        powers = match.group('tag') == 'powers' or 'powers' in opts
        show_steps_attr = ' data-show-steps="true"' if 'show-steps' in opts else ''
        mode_attr = ' data-mode="powers"' if powers else ''
        no_eval_attr = ' data-no-eval="true"' if powers and 'no-eval' in opts else ''
        marker = f'XEXPRBLOCK{expr_counter}X'
        expr_attr = html_lib.escape(expr, quote=True)
        replacements[marker] = (
            f'<x-expr id="expr-{expr_counter}" data-expr="{expr_attr}"'
            f'{show_steps_attr}{mode_attr}{no_eval_attr}></x-expr>'
        )
        expr_counter += 1
        return marker

    processed = pattern.sub(replace_expr, content)
    return processed, replacements, expr_counter


def expand_formula_anchors(tex):
    """
    Riscrive gli ancoraggi `@nome{...}` in `\\class{fx-nome}{...}`.

    `\\class` è l'estensione html di MathJax (caricata in _assets.html): la
    classe finisce sull'elemento composto, quindi il componente può misurarne
    il rettangolo e agganciarci una freccia. `@nome{...}` è solo zucchero: chi
    scrive la lezione non deve sapere come MathJax marca le sotto-espressioni.

    Lo scanner conta le graffe invece di usare una regex: il corpo di un
    ancoraggio ne contiene spesso di annidate (`@b{\\frac{1}{2}}`).

    Args:
        tex: Sorgente LaTeX con gli ancoraggi dell'autore

    Returns:
        Tuple (tex espanso, lista dei nomi nell'ordine in cui compaiono)

    Raises:
        ValueError: se una graffa non viene mai chiusa o un nome è ripetuto
    """
    pattern = re.compile(r'@([A-Za-z][A-Za-z0-9_-]*)\{')
    out = []
    names = []
    pos = 0

    while True:
        match = pattern.search(tex, pos)
        if not match:
            out.append(tex[pos:])
            break

        name = match.group(1)
        if name in names:
            raise ValueError(f":::formula: l'ancoraggio '@{name}' è ripetuto")

        # Scansione a graffe bilanciate dal `{` di apertura. `\{` e `\}` sono
        # graffe letterali in LaTeX: non contano.
        depth = 1
        i = match.end()
        while i < len(tex) and depth > 0:
            ch = tex[i]
            if ch == '\\':
                i += 2
                continue
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
            i += 1
        if depth != 0:
            raise ValueError(f":::formula: graffa non chiusa dopo '@{name}{{'")

        body = tex[match.end():i - 1]
        out.append(tex[pos:match.start()])
        out.append(f'\\class{{fx-{name}}}{{{body}}}')
        names.append(name)
        pos = i

    return ''.join(out), names


# Una riga freccia di un blocco :::formula: `da -> a : commento [| lato]`.
FORMULA_ARROW_RE = re.compile(
    r'^(?P<da>[A-Za-z][A-Za-z0-9_-]*)\s*->\s*(?P<a>[A-Za-z][A-Za-z0-9_-]*)'
    r'\s*:\s*(?P<resto>.+)$'
)


def parse_formula_arrows(lines, names):
    """
    Legge le righe `da -> a : commento [| sopra|sotto]` di un blocco :::formula.

    Args:
        lines: Righe non vuote sotto la formula
        names: Ancoraggi dichiarati nella formula (per la validazione)

    Returns:
        Lista di dict {da, a, testo, lato} (lato: 'sopra' | 'sotto' | 'auto')

    Raises:
        ValueError: riga malformata, ancoraggio inesistente o lato sconosciuto
    """
    arrows = []

    for line in lines:
        match = FORMULA_ARROW_RE.match(line.strip())
        if not match:
            raise ValueError(
                f":::formula: riga freccia non valida: {line.strip()!r}. "
                "Forma attesa: `da -> a : commento` (opzionale `| sopra` o `| sotto`)"
            )

        resto = match.group('resto')
        lato = 'auto'
        if '|' in resto:
            resto, _, lato_raw = resto.rpartition('|')
            lato = lato_raw.strip().lower()
            if lato not in ('sopra', 'sotto'):
                raise ValueError(
                    f":::formula: lato sconosciuto {lato!r} (usa `sopra` o `sotto`)"
                )

        for nome in (match.group('da'), match.group('a')):
            if nome not in names:
                raise ValueError(
                    f":::formula: la freccia cita '{nome}', che non è un "
                    f"ancoraggio della formula (dichiarati: {', '.join(names) or 'nessuno'})"
                )

        arrows.append({
            'da': match.group('da'),
            'a': match.group('a'),
            'testo': resto.strip(),
            'lato': lato,
        })

    if not arrows:
        raise ValueError(':::formula: nessuna freccia (una formula senza commenti è solo una formula)')

    return arrows


def process_formula(content, formula_counter):
    """
    Converte blocchi :::formula ... ::: in <x-formula> web component
    (una formula grande con frecce commentate fra sue sotto-parti).

    Sintassi:
        :::formula
        @b1{2}^{@e1{-2}} = \\left(@b2{\\tfrac{1}{2}}\\right)^{@e2{2}}

        b1 -> b2 : reciproco
        e1 -> e2 : cambia segno
        :::

    Il corpo è diviso dalla PRIMA RIGA VUOTA: sopra la formula (una o più
    righe, concatenate con uno spazio), sotto le frecce, una per riga.
    Attenzione: nel corpo non può comparire una riga `---`, che separa gli
    step della lezione.

    Come :::expr, il corpo è LaTeX pieno di `\\`, `{`, `_`, `*`: viene estratto
    in un marker e l'HTML finale è restituito come replacement da applicare
    DOPO il rendering markdown. Il componente NON riceve id: è espositivo, non
    è un goal.

    Args:
        content: Contenuto markdown
        formula_counter: Contatore per ID univoci

    Returns:
        Tuple (contenuto con marker, dict marker→HTML, nuovo valore counter)

    Raises:
        ValueError: formula mancante, ancoraggi malformati o frecce non valide
    """
    pattern = re.compile(
        r'^:::formula[ \t]*[^\n]*\n(?P<body>.*?)\n:::[ \t]*$',
        re.DOTALL | re.MULTILINE,
    )
    replacements = {}

    def replace_formula(match):
        nonlocal formula_counter
        body = match.group('body').strip('\n')

        # Prima riga vuota = confine fra formula e frecce.
        parts = re.split(r'\n[ \t]*\n', body, maxsplit=1)
        tex_lines = [l.strip() for l in parts[0].strip().splitlines() if l.strip()]
        arrow_lines = [l for l in parts[1].splitlines() if l.strip()] if len(parts) > 1 else []

        # Dimenticare la riga vuota è l'errore di distrazione più facile: senza
        # questo controllo le frecce finirebbero dentro la formula, in silenzio.
        if not arrow_lines and any(FORMULA_ARROW_RE.match(l) for l in tex_lines):
            raise ValueError(
                ':::formula: manca la riga vuota fra la formula e le frecce'
            )

        tex_src = ' '.join(tex_lines)
        if not tex_src:
            raise ValueError(':::formula: manca la formula')

        tex, names = expand_formula_anchors(tex_src)
        arrows = parse_formula_arrows(arrow_lines, names)

        marker = f'XFORMULABLOCK{formula_counter}X'
        replacements[marker] = (
            f'<x-formula data-tex="{html_lib.escape(tex, quote=True)}"'
            f' data-arrows="{html_lib.escape(json.dumps(arrows, ensure_ascii=False), quote=True)}">'
            f'</x-formula>'
        )
        formula_counter += 1
        return marker

    processed = pattern.sub(replace_formula, content)
    return processed, replacements, formula_counter


# Sezione del blocco :::theorem → statuto dei passi che contiene.
# I nomi delle sezioni sono SINTASSI (fissi); le etichette mostrate a schermo
# sono invece attributi con default (vedi DIMOSTRAZIONI.md §3).
THEOREM_SECTIONS = {
    'ipotesi': 'ipotesi',
    'tesi': 'tesi',
    'dimostrazione': 'dedotto',
    'distrattori': None,      # non sono passi: non hanno statuto
}

# Prefisso degli id impliciti, per sezione
THEOREM_PREFIXES = {
    'ipotesi': 'h',
    'tesi': 't',
    'dimostrazione': 'p',
    'distrattori': 'd',
}

# Parola riservata nell'annotazione: marca un passo di COSTRUZIONE, che non
# asserisce ma introduce un oggetto (DIMOSTRAZIONI.md §2.5). Sta nella
# dimostrazione, dove l'atto avviene, ma ha un suo namespace di id (`c1, c2…`)
# perché non è un anello della catena deduttiva come gli altri.
THEOREM_COSTRUZIONE = 'costruzione'
THEOREM_COSTRUZIONE_PREFIX = 'c'

THEOREM_LABELS = {
    'ipotesi': 'Ipotesi',
    'tesi': 'Tesi',
    'dimostrazione': 'Dimostrazione',
}

DISTRACTOR_TYPES = ('inutile', 'garanzia-sbagliata', 'falso')


def _parse_theorem_attrs(line):
    """
    Parsa gli attributi della riga di apertura `:::theorem ...`.

    Accetta `chiave=valore` e `chiave="valore con spazi"`.
    """
    attrs = {}
    for match in re.finditer(r'([\w-]+)=(?:"([^"]*)"|(\S+))', line):
        key = match.group(1).lower()
        attrs[key] = match.group(2) if match.group(2) is not None else match.group(3)
    return attrs


def _parse_annotation(raw):
    """
    Parsa l'annotazione in coda a una riga: `{t1, da: p2,p3, per: crit2}`.

    Restituisce (riferimento, campi):
    - `riferimento` è il token nudo iniziale (l'id di una tesi referenziata),
      `None` se assente;
    - i valori sono stringhe; le liste (`da: p2,p3`) restano da splittare.

    Le virgole separano i campi, ma compaiono anche DENTRO un valore
    (`da: p2,p3,p4`): un frammento senza `:` è la continuazione del campo
    precedente, non un campo nuovo.
    """
    ref = None
    fields = {}
    key = None
    for part in raw.split(','):
        part = part.strip()
        if not part:
            continue
        if ':' in part:
            name, _, value = part.partition(':')
            key = name.strip().lower()
            fields[key] = value.strip()
        elif key is None:
            ref = part
        else:
            fields[key] = f'{fields[key]},{part}' if fields[key] else part
    return ref, fields


def _split_theorem_sections(body):
    """
    Divide il corpo del blocco in sezioni `## nome`.

    Restituisce (sezioni, preambolo): `sezioni` è {nome: [righe grezze]},
    `preambolo` sono le righe `chiave: valore` prima della prima sezione
    (oggi solo `figura:`).
    """
    sections = {}
    preamble = {}
    current = None

    for line in body.split('\n'):
        stripped = line.strip()
        if not stripped:
            continue
        heading = re.match(r'^#{1,6}\s+(.+)$', stripped)
        if heading:
            name = heading.group(1).strip().lower()
            if name not in THEOREM_SECTIONS:
                raise ValueError(
                    f"sezione '{name}' non riconosciuta in :::theorem "
                    f"(ammesse: {', '.join(THEOREM_SECTIONS)})"
                )
            current = name
            sections.setdefault(current, [])
            continue
        if current is None:
            key, sep, value = stripped.partition(':')
            if sep and re.fullmatch(r'[\w-]+', key.strip()):
                preamble[key.strip().lower()] = value.strip()
            continue
        sections[current].append(stripped)

    return sections, preamble


def _parse_theorem_item(line, section, counters, where):
    """
    Parsa una riga `- testo {da: …, per: …}` di una sezione.

    Restituisce un dict con id, testo, ref (tesi referenziata) e i campi
    dell'annotazione già normalizzati.

    `counters` è il contatore degli id impliciti della sezione, per prefisso:
    le costruzioni hanno un namespace tutto loro (`c1, c2…`), così aggiungerne
    una non rinumera i passi dedotti già scritti.
    """
    item_match = re.match(r'^-\s*(.*)$', line)
    if not item_match:
        raise ValueError(f"riga non riconosciuta nella sezione '{section}': {line}")

    rest = item_match.group(1).strip()

    # L'annotazione è l'ULTIMO gruppo tra graffe a fine riga: così un `${a}` o
    # un `\{` nel testo non viene scambiato per annotazione.
    ann_match = re.search(r'\{([^{}]*)\}\s*$', rest)
    ref, fields = (None, {})
    if ann_match:
        ref, fields = _parse_annotation(ann_match.group(1))
        rest = rest[:ann_match.start()].strip()

    # Il token nudo è di norma la tesi referenziata; `costruzione` è la sola
    # parola riservata, e marca il passo che introduce un oggetto.
    costruzione = ref == THEOREM_COSTRUZIONE
    if costruzione:
        ref = None
        if section != 'dimostrazione':
            raise ValueError(
                f"{where}: `costruzione` compare nella sezione '{section}'; "
                'una costruzione è un atto della dimostrazione, non un dato'
            )

    # `per` è la sintassi d'autore, `perche` il nome del campo nel modello:
    # accettiamo entrambi in scrittura.
    warrant = fields.get('per') or fields.get('perche')
    premises = [p.strip() for p in fields.get('da', '').split(',') if p.strip()]

    prefisso = (THEOREM_COSTRUZIONE_PREFIX if costruzione
                else THEOREM_PREFIXES[section])
    counters[prefisso] = counters.get(prefisso, 0) + 1

    return {
        'id': fields.get('id') or f'{prefisso}{counters[prefisso]}',
        'testo': rest,
        'ref': ref,
        'costruzione': costruzione,
        'da': premises,
        'perche': warrant,
        'fig': fields.get('fig'),
        'tipo': fields.get('tipo'),
    }


def _check_theorem_cycles(steps, where):
    """Solleva ValueError se il grafo delle premesse contiene un ciclo."""
    graph = {s['id']: s['da'] for s in steps}
    state = {}  # id → 1 in visita, 2 chiuso

    def visit(node, path):
        if state.get(node) == 2:
            return
        if state.get(node) == 1:
            ciclo = ' → '.join(path[path.index(node):] + [node])
            raise ValueError(f'{where}: ciclo nelle premesse ({ciclo})')
        state[node] = 1
        for premise in graph.get(node, []):
            visit(premise, path + [node])
        state[node] = 2

    for step_id in graph:
        visit(step_id, [])


def _check_theorem_warrant(warrant, teoria, course_theorems, where):
    """
    Verifica che la garanzia citata esista nella teoria del corso.

    `teoria` contiene le voci di `teoria.yaml` PIÙ i teoremi già dimostrati
    fino a questo punto del corso: citare un teorema dimostrato più avanti
    significa non trovarlo qui, ed è un errore di progressione.
    """
    if teoria is None or warrant is None or warrant in teoria:
        return
    if course_theorems and warrant in course_theorems:
        raise ValueError(
            f"{where}: la garanzia '{warrant}' è un teorema dimostrato più "
            'avanti nel corso (dipendenza circolare nella progressione)'
        )
    raise ValueError(f"{where}: la garanzia '{warrant}' non esiste nella teoria del corso")


def process_theorem(content, theorem_counter, render_text=None,
                    teoria=None, course_theorems=None, collect=None, titoli=None):
    """
    Converte blocchi :::theorem ... ::: in <x-theorem> web component.

    Sintassi (vedi DIMOSTRAZIONI.md per il modello dati completo):

        :::theorem id=diag-par titolo="In un parallelogramma le diagonali…" modi=leggi,ordina
        figura: parallelogramma-diagonali

        ## ipotesi
        - ABCD è un parallelogramma {fig: quadrilatero}

        ## tesi
        - $AM \\cong MC$

        ## dimostrazione
        - Si tracci la diagonale AC {costruzione, da: h1}
        - AB è parallelo a DC {da: h1, per: def-par}
        - {t1, da: p1,c1, per: corr}

        ## distrattori
        - $AC \\cong BD$ {per: diag-rett, tipo: falso}
        :::

    **Sezioni in scrittura, lista piatta in memoria**: lo `statuto` di ogni
    passo è derivato dalla sezione che lo contiene (`ipotesi`/`dedotto`/`tesi`),
    e ipotesi e tesi non sono duplicate nell'intestazione: quella è
    renderizzata dai passi stessi. L'ultimo passo non riscrive la tesi, la
    **referenzia** (`- {t1, da: p5, per: corr}`): il testo viene da `t1` e la
    catena ha un nodo terminale verificabile.

    L'unica eccezione alla regola "statuto = sezione" è la **costruzione**
    (`{costruzione, …}`, id `c1, c2…`): un passo che non asserisce ma introduce
    un oggetto. Sta nella dimostrazione perché è lì che l'atto avviene — e non
    fra le ipotesi, dove finirebbe per far credere che l'oggetto fosse dato.

    Attributi della riga di apertura: `id` (registra il teorema nella teoria del
    corso), `titolo`, `modi` (default `leggi`), `mancanti` (default 2), `figura`
    (sketch mostrato accanto ai passi: i `fig:` ne nominano gli elementi);
    `ipotesi`/`tesi`/`dimostrazione` ridefiniscono le etichette mostrate
    (in fisica: Dati / Richiesto / Soluzione).

    Validazione in build (fallisce rumorosamente, DIMOSTRAZIONI.md §6): garanzia
    inesistente nella teoria o dimostrata più avanti nel corso, `da:` che punta a
    un id inesistente, cicli nel grafo delle premesse, tesi non raggiunta.

    Come :::p5 e :::expr il blocco viene estratto in un marker: il corpo contiene
    heading, liste e graffe che mistune e gli altri preprocessori
    interpreterebbero.

    Args:
        content: Contenuto markdown
        theorem_counter: Contatore per ID univoci
        render_text: Callable opzionale che renderizza il markdown inline del
            testo di ogni passo (`$…$`, grassetto, [[blank]])
        teoria: Dict della teoria del corso (id → {nome, enunciato, tipo}).
            Viene ARRICCHITO in loco con i teoremi dimostrati: un blocco con
            `id=` entra nella teoria e i teoremi successivi possono citarlo.
            Se None, la validazione delle garanzie è saltata.
        course_theorems: Insieme degli id di TUTTI i teoremi del corso, per
            distinguere "garanzia inesistente" da "dimostrata più avanti"
        collect: Lista opzionale a cui appendere la struttura di ogni teorema
            (id, titolo, passi, distrattori, figura, modi, html). Serve a chi
            compila un CORPUS e deve leggere le garanzie per costruire il grafo
            (build_corpus.py): l'HTML da solo obbligherebbe a rifare il parsing
            all'indietro dagli attributi.

    Returns:
        Tuple (contenuto con marker, dict marker→HTML, nuovo valore counter)
    """
    pattern = re.compile(r'^:::theorem[ \t]*([^\n]*)\n(.*?)\n:::[ \t]*$',
                         re.DOTALL | re.MULTILINE)
    replacements = {}
    render = render_text or (lambda text: text)

    def replace_theorem(match):
        nonlocal theorem_counter

        attrs = _parse_theorem_attrs(match.group(1))
        sections, preamble = _split_theorem_sections(match.group(2))
        # Le righe `chiave: valore` nel corpo (oggi `figura:`) non sovrascrivono
        # un attributo esplicito sulla riga di apertura.
        for key, value in preamble.items():
            attrs.setdefault(key, value)

        # L'enunciato può venire da fuori (in un corpus è teoria.yaml a
        # possederlo): l'attributo `titolo=` serve solo a chi scrive un teorema
        # che vive dentro una lezione e non ha un registro alle spalle.
        titolo = attrs.get('titolo') or (titoli or {}).get(attrs.get('id'), '')
        where = f"teorema '{attrs.get('id') or titolo or theorem_counter}'"

        # --- Parsing delle sezioni in liste di voci ---------------------------
        items = {}
        for section in THEOREM_SECTIONS:
            counters = {}
            items[section] = [
                _parse_theorem_item(line, section, counters, where)
                for line in sections.get(section, [])
            ]

        if not items['tesi']:
            raise ValueError(f'{where}: manca la sezione "## tesi"')

        tesi_by_id = {item['id']: item for item in items['tesi']}

        # --- Lista piatta: ipotesi + passi della dimostrazione ----------------
        passi = []
        for item in items['ipotesi']:
            if item['perche']:
                raise ValueError(
                    f"{where}: l'ipotesi '{item['id']}' ha una garanzia; "
                    'le ipotesi valgono per ipotesi'
                )
            passi.append({
                'id': item['id'], 'testo': item['testo'],
                'statuto': 'ipotesi', 'da': [], 'perche': None, 'fig': item['fig'],
            })

        raggiunte = set()
        for item in items['dimostrazione']:
            if item['ref']:
                # Passo che referenzia una tesi: il testo viene da lì.
                tesi = tesi_by_id.get(item['ref'])
                if tesi is None:
                    raise ValueError(
                        f"{where}: il passo referenzia la tesi '{item['ref']}', "
                        'che non esiste'
                    )
                if item['testo']:
                    raise ValueError(
                        f"{where}: il passo che referenzia '{item['ref']}' non "
                        'deve riscrivere il testo della tesi'
                    )
                raggiunte.add(item['ref'])
                passi.append({
                    'id': tesi['id'], 'testo': tesi['testo'], 'statuto': 'tesi',
                    'da': item['da'], 'perche': item['perche'],
                    'fig': item['fig'] or tesi['fig'],
                })
            else:
                # Una costruzione non asserisce, introduce: se ne può dichiarare
                # la garanzia (l'assioma che ne assicura l'esistenza), ma quando
                # manca vale "per costruzione" e non è un buco da riempire.
                passi.append({
                    'id': item['id'], 'testo': item['testo'],
                    'statuto': 'costruzione' if item['costruzione'] else 'dedotto',
                    'da': item['da'], 'perche': item['perche'], 'fig': item['fig'],
                })

        # --- Validazione (DIMOSTRAZIONI.md §6) -------------------------------
        ids = set()
        for passo in passi:
            if passo['id'] in ids:
                raise ValueError(f"{where}: id di passo duplicato '{passo['id']}'")
            ids.add(passo['id'])

        for passo in passi:
            for premise in passo['da']:
                if premise not in ids:
                    raise ValueError(
                        f"{where}: il passo '{passo['id']}' cita la premessa "
                        f"'{premise}', che non esiste"
                    )
            _check_theorem_warrant(passo['perche'], teoria, course_theorems,
                                   f"{where}, passo '{passo['id']}'")

        _check_theorem_cycles(passi, where)

        non_raggiunte = [t['id'] for t in items['tesi'] if t['id'] not in raggiunte]
        if non_raggiunte:
            raise ValueError(
                f"{where}: nessun passo raggiunge la tesi "
                f"{', '.join(non_raggiunte)} (serve una riga "
                f"`- {{{non_raggiunte[0]}, da: …, per: …}}`)"
            )

        distrattori = []
        for item in items['distrattori']:
            tipo = item['tipo'] or 'inutile'
            if tipo not in DISTRACTOR_TYPES:
                raise ValueError(
                    f"{where}: distrattore '{item['id']}' con tipo '{tipo}' "
                    f"non riconosciuto (ammessi: {', '.join(DISTRACTOR_TYPES)})"
                )
            _check_theorem_warrant(item['perche'], teoria, course_theorems,
                                   f"{where}, distrattore '{item['id']}'")
            distrattori.append({
                'id': item['id'], 'testo': item['testo'],
                'perche': item['perche'], 'tipo': tipo,
            })

        # --- Il teorema dimostrato entra nella teoria del corso ---------------
        if teoria is not None and attrs.get('id'):
            teoria.setdefault(attrs['id'], {
                'nome': titolo or attrs['id'],
                'enunciato': titolo or attrs['id'],
                'tipo': 'teorema',
            })

        # --- Serializzazione --------------------------------------------------
        for passo in passi:
            passo['testo'] = render(passo['testo'])
        for distrattore in distrattori:
            distrattore['testo'] = render(distrattore['testo'])

        # Nel componente la teoria serve come menu delle garanzie: ne bastano le
        # voci citate (dai passi e dai distrattori), non l'intero corso.
        citate = [p['perche'] for p in passi] + [d['perche'] for d in distrattori]
        teoria_usata = {
            key: value for key, value in (teoria or {}).items()
            if key in set(filter(None, citate))
        }

        etichette = {
            key: attrs.get(key, default) for key, default in THEOREM_LABELS.items()
        }

        html_attrs = [f'id="theorem-{theorem_counter}"']
        if attrs.get('id'):
            html_attrs.append(f'data-theorem-id="{html_lib.escape(attrs["id"], quote=True)}"')
        html_attrs.append(f'data-titolo="{html_lib.escape(render(titolo), quote=True)}"')
        html_attrs.append(f'data-modi="{html_lib.escape(attrs.get("modi", "leggi"), quote=True)}"')
        html_attrs.append(f'data-mancanti="{html_lib.escape(str(attrs.get("mancanti", 2)), quote=True)}"')
        if attrs.get('figura'):
            html_attrs.append(f'data-figura="{html_lib.escape(attrs["figura"], quote=True)}"')
            # Altezza SUGGERITA del canvas: uno sketch che si dimensiona da sé
            # (ctx.setHeight) la ignora.
            if attrs.get('figura-altezza'):
                html_attrs.append(
                    f'data-figura-altezza="{html_lib.escape(attrs["figura-altezza"], quote=True)}"')
        html_attrs.append(f'data-etichette="{html_lib.escape(json.dumps(etichette, ensure_ascii=False))}"')
        html_attrs.append(f'data-passi="{html_lib.escape(json.dumps(passi, ensure_ascii=False))}"')
        # Le tesi in ordine di dichiarazione: l'intestazione le mostra così,
        # a prescindere da dove la dimostrazione le raggiunge.
        html_attrs.append(f'data-tesi="{html_lib.escape(json.dumps([t["id"] for t in items["tesi"]]))}"')
        if distrattori:
            html_attrs.append(f'data-distrattori="{html_lib.escape(json.dumps(distrattori, ensure_ascii=False))}"')
        if teoria_usata:
            html_attrs.append(f'data-teoria="{html_lib.escape(json.dumps(teoria_usata, ensure_ascii=False))}"')

        marker = f'XTHEOREMBLOCK{theorem_counter}X'
        html = f'<x-theorem {" ".join(html_attrs)}></x-theorem>'
        replacements[marker] = html

        if collect is not None:
            collect.append({
                'id': attrs.get('id'),
                'titolo': titolo,
                'passi': passi,
                'tesi': [t['id'] for t in items['tesi']],
                'distrattori': distrattori,
                'figura': attrs.get('figura'),
                'modi': attrs.get('modi', 'leggi'),
                'html': html,
            })

        theorem_counter += 1
        return marker

    processed = pattern.sub(replace_theorem, content)
    return processed, replacements, theorem_counter


def process_math(content):
    """
    Converte backtick contenenti espressioni matematiche in delimitatori LaTeX

    Rileva espressioni matematiche comuni nei backtick e le converte in $...$
    per il rendering con MathJax.

    Esempi:
        `x = 5` -> $x = 5$
        `x^2 + 3x + 1` -> $x^2 + 3x + 1$
        `2x = 10` -> $2x = 10$

    Args:
        content: Contenuto markdown

    Returns:
        Contenuto processato
    """
    # Pattern per backtick singoli (inline code)
    # Rileva se contiene caratteri matematici comuni
    def replace_math_backtick(match):
        inner = match.group(1)

        # Lista di pattern che indicano espressioni matematiche
        math_indicators = [
            r'[a-zA-Z]\s*[=+\-*/^]',  # Variabile seguita da operatore
            r'[+\-*/^]\s*[a-zA-Z]',    # Operatore seguito da variabile
            r'\^[0-9]',                 # Esponenti
            r'[a-zA-Z]_[0-9a-zA-Z]',    # Pedici
            r'\\[a-zA-Z]+',             # Comandi LaTeX
            r'[0-9]+[a-zA-Z]',          # Coefficienti (es: 2x)
            r'[a-zA-Z]+\s*[=<>]',       # Variabili con relazioni
        ]

        # Controlla se contiene pattern matematici
        is_math = any(re.search(pattern, inner) for pattern in math_indicators)

        if is_math:
            # Converti in delimitatore LaTeX
            return f'${inner}$'
        else:
            # Lascia come backtick normale
            return match.group(0)

    # Processa backtick singoli (non tripli)
    # Usa negative lookahead/lookbehind per evitare blocchi di codice ```
    pattern = r'(?<!`)`([^`\n]+)`(?!`)'
    processed = re.sub(pattern, replace_math_backtick, content)

    return processed


def process_blanks(content, blank_counter):
    """
    Converte [[answer]] in <x-blank> web component

    Esempi:
        [[5]] -> <x-blank id="blank-0" data-solution="5"></x-blank>
        [[a|*b|c]] -> <x-blank id="blank-1" data-choices='["a", "b", "c"]' data-solution="b"></x-blank>
        [[select: a|*b|c]] -> <x-blank id="blank-2" data-choices='[...]' data-solution="b" data-display="dropdown"></x-blank>
        [[2/16 || 1/8]] -> <x-blank id="blank-3" data-solution="2/16" data-accept='["2/16", "1/8"]'></x-blank>

    La soluzione corretta nelle scelte multiple è indicata con *
    Se nessuna scelta ha *, la prima opzione è considerata corretta
    Il prefisso "select:" rende la scelta multipla come menu a tendina inline
    La doppia pipe || crea un input testuale che accetta più risposte corrette

    Args:
        content: Contenuto markdown
        blank_counter: Contatore per ID univoci

    Returns:
        Tuple (contenuto processato, nuovo valore counter)
    """
    def parse_choices(raw):
        """Parsa "a|*b|c" -> (clean_choices, solution). La corretta è marcata con *."""
        solution = None
        clean_choices = []
        for choice in raw.split('|'):
            choice = choice.strip()
            if choice.startswith('*'):
                solution = choice[1:].strip()
                clean_choices.append(solution)
            else:
                clean_choices.append(choice)
        if solution is None:
            solution = clean_choices[0]
        return clean_choices, solution

    def replace_blank(match):
        nonlocal blank_counter
        answer = match.group(1)
        blank_id = f'blank-{blank_counter}'
        blank_counter += 1

        if answer.strip().lower().startswith('select:'):
            # Scelta multipla resa come menu a tendina inline
            raw = answer.strip()[len('select:'):]
            clean_choices, solution = parse_choices(raw)
            choices_attr = html_lib.escape(json.dumps(clean_choices))
            solution_attr = html_lib.escape(solution, quote=True)
            return f'<x-blank id="{blank_id}" data-choices="{choices_attr}" data-solution="{solution_attr}" data-display="dropdown"></x-blank>'
        elif '||' in answer:
            # Input testuale con più risposte accettate (es. "2/16 || 1/8")
            # Serializza come JSON HTML-escaped: niente '|' nell'attributo, così
            # il blank può stare dentro una cella di tabella markdown senza romperla.
            accepted = [a.strip() for a in answer.split('||') if a.strip()]
            solution = accepted[0]
            accept_attr = html_lib.escape(json.dumps(accepted))
            solution_attr = html_lib.escape(solution, quote=True)
            return f'<x-blank id="{blank_id}" data-solution="{solution_attr}" data-accept="{accept_attr}"></x-blank>'
        elif '|' in answer:
            # Scelta multipla a bottoni. Le opzioni sono serializzate in JSON
            # HTML-escaped (come il dropdown) così il blank è sicuro anche in tabella.
            clean_choices, solution = parse_choices(answer)
            choices_attr = html_lib.escape(json.dumps(clean_choices))
            solution_attr = html_lib.escape(solution, quote=True)
            return f'<x-blank id="{blank_id}" data-choices="{choices_attr}" data-solution="{solution_attr}"></x-blank>'
        else:
            # Single answer
            solution_attr = html_lib.escape(answer, quote=True)
            return f'<x-blank id="{blank_id}" data-solution="{solution_attr}"></x-blank>'

    # Dentro un blank ci può stare del LaTeX con le sue parentesi quadre
    # (`$\sqrt[4]{2}$`): il corpo accetta quindi anche un `]`, purché non sia il
    # primo dei due che chiudono. Con un semplice `[^\]]+` la radice quarta
    # faceva fallire l'intero match e il `[[...]]` restava a video com'era.
    processed = re.sub(r'\[\[((?:[^\]]|\](?!\]))+)\]\]', replace_blank, content)
    return processed, blank_counter


def process_variables(content, variable_counter):
    """
    Converte ${a}{a|2|-5,5,1} in <x-variable> web component
    e converte riferimenti ${a} nel testo in placeholder {{VAR:a:initial}}
    che verrà gestito dinamicamente da JavaScript

    Formato: ${display}{bind|initial|min,max,step}

    Un riferimento che comincia per `=` è un **calcolo** sulle variabili del
    modello — ${= k*k} — e diventa il placeholder {{CALC:...}}, ricalcolato da
    x-step a ogni variable-change. L'espressione viene percent-encoded: nel
    marker resta testo che attraversa mistune senza che `*` o `_` diventino
    corsivo (x-step la decodifica con decodeURIComponent).

    Args:
        content: Contenuto markdown
        variable_counter: Contatore per ID univoci

    Returns:
        Tuple (contenuto processato, nuovo valore counter)
    """
    # Dizionario per tracciare variabili e i loro valori iniziali
    variables = {}

    # Pattern per definizioni complete: ${a}{a|2|-5,5,1}
    definition_pattern = r'\$\{([^}]+)\}\{([^}]+)\}'

    def replace_variable_definition(match):
        nonlocal variable_counter
        display = match.group(1)
        config = match.group(2)

        var_id = f'var-{variable_counter}'
        variable_counter += 1

        # Parse config: "a|2|-5,5,1"
        parts = config.split('|')
        bind = parts[0] if len(parts) > 0 else display
        initial = parts[1] if len(parts) > 1 else '0'
        range_str = parts[2] if len(parts) > 2 else '-10,10,1'

        # Salva il valore iniziale per questa variabile
        variables[bind] = initial

        # Escaping dei valori interpolati negli attributi HTML (input d'autore)
        bind_attr = html_lib.escape(bind, quote=True)
        initial_attr = html_lib.escape(initial, quote=True)

        # Modalità input: ${display}{bind|initial|input} → campo numerico editabile
        # a mano (niente slider, niente range).
        if range_str.strip() == 'input':
            return (
                f'<x-variable id="{var_id}" '
                f'data-display="input" '
                f'data-bind="{bind_attr}" '
                f'data-initial="{initial_attr}">'
                f'</x-variable>'
            )

        try:
            min_val, max_val, step = range_str.split(',')
        except ValueError:
            min_val, max_val, step = '-10', '10', '1'

        return (
            f'<x-variable id="{var_id}" '
            f'data-bind="{bind_attr}" '
            f'data-initial="{initial_attr}" '
            f'data-min="{html_lib.escape(min_val, quote=True)}" '
            f'data-max="{html_lib.escape(max_val, quote=True)}" '
            f'data-step="{html_lib.escape(step, quote=True)}">'
            f'</x-variable>'
        )

    # Prima passata: converti definizioni e raccogli variabili
    processed = re.sub(definition_pattern, replace_variable_definition, content)

    # Seconda passata: converti riferimenti semplici ${varName}
    # Pattern per riferimenti semplici (solo ${a}, non seguiti da {config})
    reference_pattern = r'\$\{([^}]+)\}(?!\{)'

    def replace_variable_reference(match):
        var_name = match.group(1).strip()

        # ${= espressione} → calcolo live sulle variabili del modello
        if var_name.startswith('='):
            expression = var_name[1:].strip()
            return f'{{{{CALC:{url_quote(expression, safe="")}}}}}'

        # Usa il valore iniziale se disponibile, altrimenti 0
        initial_value = variables.get(var_name, '0')
        # Usa un marker speciale che JavaScript sostituirà dinamicamente
        # Il marker include il valore iniziale per il primo rendering
        return f'{{{{VAR:{var_name}:{initial_value}}}}}'

    processed = re.sub(reference_pattern, replace_variable_reference, processed)

    return processed, variable_counter


def process_checks(content, check_counter):
    """
    Converte [Testo]{check: condizione} in <x-check> web component

    Esempi:
        [Verifica]{check: m == 4} -> <x-check id="check-0" data-condition="m == 4">Verifica</x-check>

    Args:
        content: Contenuto markdown
        check_counter: Contatore per ID univoci

    Returns:
        Tuple (contenuto processato, nuovo valore counter)
    """
    def replace_check(match):
        nonlocal check_counter
        label = match.group(1)
        condition = match.group(2).strip()
        check_id = f'check-{check_counter}'
        check_counter += 1
        condition_attr = html_lib.escape(condition, quote=True)
        return f'<x-check id="{check_id}" data-condition="{condition_attr}">{label}</x-check>'

    pattern = r'\[([^\]]+)\]\{check:\s*([^}]+)\}'
    processed = re.sub(pattern, replace_check, content)
    return processed, check_counter


def process_blocks(content):
    """
    Converte :::div.class in placeholder marker unici.

    I marker vengono sostituiti con i tag HTML reali DOPO il rendering markdown,
    così il contenuto interno (bold, heading, ecc.) viene processato da mistune.

    Sintassi:
        :::div.class1.class2
        contenuto
        :::

    Args:
        content: Contenuto markdown

    Returns:
        Tuple (contenuto processato, dict marker→tag HTML)
    """
    lines = content.split('\n')
    output = []
    stack = []
    replacements = {}
    counter = 0

    for line in lines:
        if line.strip().startswith(':::'):
            if line.strip() == ':::':
                # Chiusura
                if stack:
                    tag = stack.pop()
                    marker = f'XBLOCK{counter}X'
                    replacements[marker] = f'</{tag}>'
                    counter += 1
                    output.append(marker)
            else:
                # Apertura: :::div.class1.class2
                spec = line.strip()[3:].strip()
                tag, attrs = parse_tag_spec(spec)
                stack.append(tag)
                marker = f'XBLOCK{counter}X'
                replacements[marker] = f'<{tag} {attrs}>' if attrs else f'<{tag}>'
                counter += 1
                output.append(marker)
        else:
            output.append(line)

    return '\n'.join(output), replacements


def process_images(content):
    """
    Converte sintassi Obsidian per il resize delle immagini.

    Esempi:
        ![Alt|400](img.png)      → <img src="img.png" alt="Alt" style="width:400px; height:auto;">
        ![Alt|400x300](img.png)  → <img src="img.png" alt="Alt" style="width:400px; height:300px;">
    """
    pattern = r'!\[([^\]|]*)\|(\d+)(?:x(\d+))?\]\(([^)]+)\)'

    def replace_img(match):
        alt, width, height, src = match.groups()
        if height:
            style = f'width:{width}px; height:{height}px'
        else:
            style = f'width:{width}px; height:auto'
        return f'<img src="{src}" alt="{alt}" style="{style}">'

    return re.sub(pattern, replace_img, content)


def parse_tag_spec(spec):
    """
    Parse tag specification: div.class1.class2(attr="val")

    Args:
        spec: Specifica tag (es: "div.highlight.box")

    Returns:
        Tuple (tag_name, attributes_string)
    """
    # Extract tag name
    match = re.match(r'^(\w+)', spec)
    tag_name = match.group(1) if match else 'div'

    # Extract classes
    classes = re.findall(r'\.([a-zA-Z0-9_-]+)', spec)

    # Extract attributes
    attr_match = re.search(r'\(([^)]+)\)', spec)
    attrs = []

    if classes:
        attrs.append(f'class="{" ".join(classes)}"')

    if attr_match:
        attrs.append(attr_match.group(1))

    return tag_name, ' '.join(attrs)
