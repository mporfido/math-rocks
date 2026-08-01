"""Script CLI per build corpora: content/<corpus>/ → tools_data/<corpus>.json

Un *corpus* è una teoria intera esposta come strumento (vedi TEORIA.md): una
mappa a livelli dove ogni card apre la sua dimostrazione. Non è un corso — non
ha lezioni né step — quindi non passa da `build_courses.py` e non finisce in
`courses_data/`.

Struttura sorgente attesa:
    content/<corpus>/
        teoria.yaml      # il REGISTRO: ogni nodo della mappa sta qui
        aree.yaml        # le colonne, in ordine
        *.md             # blocchi :::theorem che aggiungono le dimostrazioni

Quali cartelle siano corpora lo dice `content/tools.yaml` (voci con
`kind: theory`), non una convenzione sul nome: la stessa lista serve alle route.

Il grafo NON è un dato nuovo: c'è un arco A → B quando un passo di B cita A come
garanzia (`per: A`) e A è un teorema. Le garanzie dei *distrattori* non fanno
archi — sono sbagliate o irrilevanti per costruzione, e metterle nel grafo
significherebbe disegnare relazioni che la teoria non ha.

Uso:
    python build_corpus.py           # tutti i corpora
    python build_corpus.py geometria # uno solo
"""
import json
import re
from pathlib import Path

import yaml

from parser.markdown_parser import CourseParser
from site_config import load_site_config
from tools_config import corpus_tools

# Le voci di teoria che non sono teoremi non sono nodi della mappa: non
# generano archi e compaiono nel box richiudibile di chi le usa.
#
# `regola` sono le regole logiche (riduzione all'assurdo, esame dei casi,
# DIMOSTRAZIONI.md §8.7): sono garanzie a tutti gli effetti — in `giustifica`
# vanno scelte — ma non teoremi di geometria, e come card sulla mappa sarebbero
# nodi da dimostrare che nessuno dimostrerà.
NON_TEOREMI = ('definizione', 'assioma', 'regola')

# Modalità che di default mostrano i distrattori (DIMOSTRAZIONI.md §4): su un
# teorema che non ne ha, degradano invece di rompersi — ma l'autore va avvisato.
MODI_CON_DISTRATTORI = ('completa', 'costruisci')


class CorpusError(ValueError):
    """Errore d'autore in un corpus: la build fallisce rumorosamente."""


def _load_yaml(path, what):
    if not path.exists():
        raise CorpusError(f'manca {path.name} ({what})')
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f) or {}


def _load_aree(corpus_dir):
    """Le colonne della mappa, nell'ordine dichiarato dall'autore."""
    data = _load_yaml(corpus_dir / 'aree.yaml', 'le colonne della mappa')
    aree = []
    for entry in data.get('aree', []):
        if not isinstance(entry, dict) or not entry.get('id'):
            raise CorpusError('ogni voce di aree.yaml deve avere un `id`')
        aree.append({
            'id': str(entry['id']),
            'nome': entry.get('nome') or str(entry['id']).capitalize(),
            'colore': entry.get('colore', ''),
            'descrizione': entry.get('descrizione', ''),
        })
    if not aree:
        raise CorpusError('aree.yaml non dichiara nessuna area')
    return aree


def _load_registro(corpus_dir):
    """teoria.yaml: il registro completo, teoremi dimostrati e non."""
    data = _load_yaml(corpus_dir / 'teoria.yaml', 'il registro della teoria')
    registro = {}
    for key, value in data.items():
        if not isinstance(value, dict):
            raise CorpusError(f"la voce '{key}' di teoria.yaml non è un blocco di campi")
        voce = dict(value)
        voce.setdefault('tipo', 'teorema')
        voce.setdefault('nome', key)
        voce.setdefault('enunciato', voce['nome'])
        registro[str(key)] = voce
    if not registro:
        raise CorpusError('teoria.yaml è vuoto')
    return registro


def _validate_registro(registro, aree):
    """Un teorema senza area non ha colonna: è un errore, non un default."""
    area_ids = {a['id'] for a in aree}
    for key, voce in registro.items():
        if voce['tipo'] in NON_TEOREMI:
            continue
        area = voce.get('area')
        if not area:
            raise CorpusError(
                f"il teorema '{key}' non dichiara `area`: senza, non ha una "
                'colonna sulla mappa'
            )
        if area not in area_ids:
            raise CorpusError(
                f"il teorema '{key}' dichiara l'area '{area}', che aree.yaml "
                f"non conosce (dichiarate: {', '.join(sorted(area_ids))})"
            )
        for prereq in voce.get('usa') or []:
            if prereq not in registro:
                raise CorpusError(
                    f"il teorema '{key}' dichiara `usa: {prereq}`, che non "
                    'esiste nella teoria'
                )


def _parse_dimostrazioni(corpus_dir, registro, math_default, warn):
    """Legge i .md del corpus → {id teorema: struttura raccolta dal parser}.

    La teoria passata al parser è il registro COMPLETO: in un corpus ogni
    teorema ha già la sua voce, quindi l'ordine dei file non conta e un teorema
    può citarne uno scritto in un altro file (il controllo che conta — niente
    cicli — lo fa `_livelli`).
    """
    parser = CourseParser()
    parser.math_backticks = bool(math_default)
    parser.set_course_theory(dict(registro), set(registro))

    # L'enunciato lo possiede il registro: i .md non lo riscrivono. In
    # teoria.yaml è scritto in minuscolo perché si legge di seguito al nome
    # ("Lati opposti: in un parallelogramma…"); come titolo di una pagina è
    # una frase e comincia con la maiuscola.
    titoli = {k: v['enunciato'][:1].upper() + v['enunciato'][1:]
              for k, v in registro.items()}

    dimostrazioni = {}
    for md_file in sorted(corpus_dir.glob('*.md')):
        testo = md_file.read_text(encoding='utf-8')
        teoremi, residuo = parser.parse_theorems(testo, titoli=titoli)

        if residuo:
            prima_riga = residuo.split('\n')[0][:60]
            warn(f'{md_file.name}: testo fuori dai blocchi :::theorem, ignorato '
                 f'(«{prima_riga}…»)')

        for teorema in teoremi:
            tid = teorema['id']
            if not tid:
                raise CorpusError(
                    f"{md_file.name}: un blocco :::theorem è senza `id=`; in un "
                    'corpus ogni teorema è indirizzabile e deve averlo'
                )
            if tid not in registro:
                raise CorpusError(
                    f"{md_file.name}: il teorema '{tid}' non ha una voce in "
                    'teoria.yaml (servono almeno `nome`, `enunciato`, `area`)'
                )
            if registro[tid]['tipo'] in NON_TEOREMI:
                raise CorpusError(
                    f"{md_file.name}: '{tid}' è dichiarato "
                    f"`tipo: {registro[tid]['tipo']}` in teoria.yaml, ma ha una "
                    'dimostrazione'
                )
            if tid in dimostrazioni:
                raise CorpusError(f"il teorema '{tid}' è dimostrato due volte")
            teorema['file'] = md_file.name
            dimostrazioni[tid] = teorema

            modi = [m.strip() for m in (teorema['modi'] or '').split(',')]
            if not teorema['distrattori']:
                con_distrattori = [m for m in modi if m in MODI_CON_DISTRATTORI]
                if con_distrattori:
                    warn(f"'{tid}': la modalità {', '.join(con_distrattori)} mostra "
                         'i distrattori, ma il teorema non ne ha (la scheda '
                         'funziona lo stesso, senza intrusi)')

    return dimostrazioni


def _prerequisiti(tid, registro, dimostrazioni, teoremi_ids, warn):
    """Gli archi entranti di un teorema: quali TEOREMI gli servono.

    Da una dimostrazione, sono le garanzie dei passi. Senza dimostrazione, è
    il `usa:` dichiarato in teoria.yaml — un'impalcatura provvisoria che serve
    a tenere il nodo al livello giusto finché la dimostrazione non arriva.
    """
    voce = registro[tid]
    dimostrazione = dimostrazioni.get(tid)

    if dimostrazione is None:
        return [p for p in (voce.get('usa') or []) if p in teoremi_ids]

    if voce.get('usa'):
        warn(f"'{tid}': `usa:` in teoria.yaml è ignorato, il teorema ha una "
             'dimostrazione (gli archi vengono dai `per:` dei passi). Cancellalo.')

    # Solo i passi: le garanzie dei distrattori sono sbagliate per costruzione
    # e non sono relazioni della teoria.
    visti = []
    for passo in dimostrazione['passi']:
        garanzia = passo.get('perche')
        if garanzia in teoremi_ids and garanzia not in visti:
            visti.append(garanzia)
    return visti


def _fondamenti(tid, registro, dimostrazioni, teoremi_ids):
    """Definizioni e assiomi usati: fuori dal grafo, dentro il box della card.

    Sono la parte di teoria vera ovunque; disegnarne gli archi farebbe della
    mappa un pettine. Ma toglierle del tutto farebbe sembrare che una card in
    cima al grafo sia arrivata dal nulla, mentre poggia sugli assiomi.
    """
    dimostrazione = dimostrazioni.get(tid)
    citate = ((p.get('perche') for p in dimostrazione['passi'])
              if dimostrazione else iter(registro[tid].get('usa') or []))

    fondamenti = []
    for garanzia in citate:
        if not garanzia or garanzia in teoremi_ids or garanzia not in registro:
            continue
        if garanzia in [f['id'] for f in fondamenti]:
            continue
        voce = registro[garanzia]
        fondamenti.append({
            'id': garanzia, 'nome': voce['nome'],
            'enunciato': voce['enunciato'], 'tipo': voce['tipo'],
        })
    return fondamenti


def _livelli(archi):
    """Livello = cammino più lungo verso l'alto: `1 + max(livello dei prereq)`.

    Un teorema sta così ALMENO un livello sotto ognuno di quelli che usa, che è
    la regola della mappa. È ben definito perché il grafo è aciclico: il ciclo
    lo intercetta questa stessa visita.
    """
    livelli = {}
    in_visita = set()

    def livello(tid, path):
        if tid in livelli:
            return livelli[tid]
        if tid in in_visita:
            ciclo = ' → '.join(path[path.index(tid):] + [tid])
            raise CorpusError(f'ciclo nella teoria ({ciclo}): un teorema non può '
                              'servire, per vie traverse, a dimostrare se stesso')
        in_visita.add(tid)
        prereq = archi.get(tid, [])
        livelli[tid] = 1 + max((livello(p, path + [tid]) for p in prereq), default=-1)
        in_visita.discard(tid)
        return livelli[tid]

    for tid in archi:
        livello(tid, [])
    return livelli


def build_corpus(corpus_id, content_dir='content', output_dir='tools_data',
                 math_default=False):
    """Compila un corpus → dict pronto per il dump JSON."""
    corpus_dir = Path(content_dir) / corpus_id
    if not corpus_dir.is_dir():
        raise CorpusError(f'la cartella {corpus_dir} non esiste')

    avvisi = []
    warn = avvisi.append

    aree = _load_aree(corpus_dir)
    registro = _load_registro(corpus_dir)
    _validate_registro(registro, aree)

    # I nodi della mappa, nell'ordine di dichiarazione in teoria.yaml: è
    # l'ordine d'autore, e diventa l'ordine dentro la cella della griglia.
    teoremi_ids = [k for k, v in registro.items() if v['tipo'] not in NON_TEOREMI]

    dimostrazioni = _parse_dimostrazioni(corpus_dir, registro, math_default, warn)

    archi = {
        tid: _prerequisiti(tid, registro, dimostrazioni, set(teoremi_ids), warn)
        for tid in teoremi_ids
    }
    livelli = _livelli(archi)

    usato_da = {tid: [] for tid in teoremi_ids}
    for tid, prereq in archi.items():
        for p in prereq:
            usato_da[p].append(tid)

    # Indice dentro la cella (livello × area): serve solo a rendere stabile
    # l'ordine delle card quando più teoremi condividono la stessa casella.
    indici = {}
    teoremi = []
    for tid in teoremi_ids:
        voce = registro[tid]
        cella = (livelli[tid], voce['area'])
        indici[cella] = indici.get(cella, -1) + 1
        dimostrazione = dimostrazioni.get(tid)
        teoremi.append({
            'id': tid,
            'nome': voce['nome'],
            'enunciato': voce['enunciato'],
            'area': voce['area'],
            'livello': livelli[tid],
            'indice': indici[cella],
            'usa': archi[tid],
            # I nomi, non solo gli id: dove gli archi non si possono disegnare
            # (mobile, stampa) la relazione va detta a parole.
            'usa_nomi': [registro[i]['nome'] for i in archi[tid]],
            'usato_da': usato_da[tid],
            'fondamenti': _fondamenti(tid, registro, dimostrazioni, set(teoremi_ids)),
            'ha_dimostrazione': dimostrazione is not None,
            'modi': (dimostrazione or {}).get('modi', ''),
            'figura': (dimostrazione or {}).get('figura'),
            'html': (dimostrazione or {}).get('html', ''),
        })

    return {
        'id': corpus_id,
        'aree': aree,
        'livelli': (max(livelli.values()) + 1) if livelli else 0,
        'teoremi': teoremi,
        # Definizioni e assiomi del corpus: non sono nodi, ma sono la base su
        # cui poggia tutta la mappa e vanno consultabili da qualche parte.
        'fondamenti': [
            {'id': k, 'nome': v['nome'], 'enunciato': v['enunciato'], 'tipo': v['tipo']}
            for k, v in registro.items() if v['tipo'] in NON_TEOREMI
        ],
        'avvisi': avvisi,
    }


def _scrivi(corpus_data, output_dir):
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    output_file = output_path / f"{corpus_data['id']}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(corpus_data, f, ensure_ascii=False, indent=2)
    return output_file


def build_all_corpora(content_dir='content', output_dir='tools_data'):
    """Compila tutti i corpora dichiarati in content/tools.yaml.

    Restituisce (compilati, falliti). Non solleva: come per i corsi, un corpus
    rotto non deve impedire la build degli altri — ma l'errore si vede.
    """
    corpora = corpus_tools(content_dir)
    if not corpora:
        return 0, 0

    math_default = bool(load_site_config().get('math', False))
    costruiti = falliti = 0

    print('\nBuild corpora...\n')
    for tool in corpora:
        corpus_id = tool['corpus']
        print(f'Parsing {corpus_id}...', end=' ')
        try:
            corpus_data = build_corpus(corpus_id, content_dir, output_dir, math_default)
            _scrivi(corpus_data, output_dir)
            dimostrati = sum(1 for t in corpus_data['teoremi'] if t['ha_dimostrazione'])
            print(f"OK ({len(corpus_data['teoremi'])} teoremi, {dimostrati} dimostrati, "
                  f"{corpus_data['livelli']} livelli)")
            for avviso in corpus_data['avvisi']:
                print(f'    [!] {avviso}')
            costruiti += 1
        except Exception as e:
            print(f'ERRORE: {e}')
            falliti += 1

    return costruiti, falliti


if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1:
        math = bool(load_site_config().get('math', False))
        try:
            dati = build_corpus(sys.argv[1], math_default=math)
            print(f'[OK] Corpus generato: {_scrivi(dati, "tools_data")}')
            for avviso in dati['avvisi']:
                print(f'    [!] {avviso}')
        except Exception as e:
            print(f'[X] Errore: {e}')
            raise SystemExit(1)
    else:
        costruiti, falliti = build_all_corpora()
        print(f'\nCorpora generati: {costruiti}')
        if falliti:
            print(f'   Corpora falliti: {falliti}')
            raise SystemExit(1)
