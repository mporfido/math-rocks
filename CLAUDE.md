# CLAUDE.md

Piattaforma per creare corsi interattivi online scritto in python.

Segui queste ultime indicazioni preferibilmente (guida pratica), per ora il progetto è in fase embrionale.

## Direzione del progetto (leggere prima di decidere)

Qualsiasi decisione di **struttura** o di **filosofia di implementazione** deve
tenere conto della direzione del progetto: vedi la sezione **"Direzione e
Filosofia"** nel [README.md](README.md). In sintesi: è un SSG static-first per
corsi interattivi, con un confine netto tra *engine* (framework riutilizzabile)
e *istanza* (contenuti + config del sito); il backend è un livello futuro
opzionale. In caso di dubbio su dove collocare qualcosa o quale approccio
scegliere, fai riferimento a quella sezione del README.

## Struttura del Progetto

```
math-rocks/
├── app.py                      # Entry point Flask, server principale
├── config.py                   # Configurazione dell'app (engine)
├── site.yaml                   # Config di ISTANZA: testi sito, lingua, storage_prefix,
│                               # flag math, tema, preload font (vince sui default engine)
├── site_config.py              # Lettore di site.yaml (senza Flask: usato anche dalla build)
├── tools_config.py             # Lettore di content/tools.yaml (senza Flask: route + build)
├── build_courses.py            # Script per compilare corsi da markdown a JSON
├── build_corpus.py             # Compila i corpora degli strumenti (content/<corpus>/
│                               # → tools_data/): teoremi, grafo, livelli. Vedi TEORIA.md
├── requirements.txt            # Dipendenze Python
│
├── parser/                     # Parser markdown custom
│   ├── __init__.py
│   ├── markdown_parser.py      # Parser principale (converte MD → HTML)
│   └── preprocessors.py        # Pre-processori sintassi custom (blanks, variables, blocks)
│
├── routes/                     # Route Flask (blueprint)
│   ├── __init__.py
│   ├── courses.py              # Route per visualizzare corsi (/course/<id>)
│   └── tools.py                # Route pagine-strumento (/tools/<id>), whitelist dei kind
│
├── templates/                  # Template Jinja2
│   ├── base.html               # Template base (layout comune)
│   ├── _assets.html            # Macro: librerie esterne + script dei componenti,
│   │                           # condivisi da lesson.html e tool.html
│   ├── home.html               # Homepage con lista corsi
│   ├── course.html             # Panoramica corso (elenco lezioni)
│   ├── lesson.html             # Viewer step di lezione
│   ├── tools.html              # Elenco degli strumenti
│   ├── tool.html               # Pagina di un singolo strumento
│   ├── theory_map.html         # Mappa di un corpus (kind: theory)
│   └── theory_theorem.html     # Pagina di un teorema del corpus
│
├── static/                     # Asset statici (CSS, JS)
│   ├── style.css               # Stili strutturali engine (+ token di fallback neutro)
│   ├── theme.css               # Tema di ISTANZA: design token "Quaderno" + @font-face
│   ├── components.css          # Stili per web components
│   ├── components/             # Web Components JavaScript
│   │   ├── blank.js            # <x-blank>: input/scelta multipla
│   │   ├── step.js             # <x-step>: container step con goal tracking
│   │   ├── variable.js         # <x-variable>: slider interattivo
│   │   ├── formula.js          # <x-formula>: formula LaTeX con frecce commentate
│   │   │                       # fra sue sotto-parti (SVG in overlay su MathJax)
│   │   └── p5.js               # <x-p5>: sketch p5.js (inline o riusabile, lazy-load)
│   ├── sketches/               # Sketch p5 riusabili: un file per sketch, caricati
│   │                           # on-demand da <x-p5> (window.P5Sketches['<nome>'])
│   └── tools/                  # Implementazioni delle pagine-strumento: un file per
│                               # `kind` (expr.js), montato da tool.html
│
├── content/                    # Contenuti dei corsi (sorgente)
│   ├── tools.yaml              # Config di ISTANZA: quali strumenti espone il sito
│   ├── geometria/              # Un CORPUS = la teoria di uno strumento (TEORIA.md):
│   │                           # teoria.yaml (registro dei nodi), aree.yaml
│   │                           # (le colonne), *.md (le dimostrazioni)
│   └── esempi/                 # Un CORSO = una cartella
│       ├── metadata.yaml       # Metadati corso (titolo, descrizione, colore, progression)
│       ├── content-1.md        # Una LEZIONE = un file content-N.md (step separati da ---)
│       └── content-2.md
│
├── courses_data/               # Corsi compilati (generati da build_courses.py)
│   └── esempi.json             # JSON: { id, metadata, lessons: [ { steps... } ] }
│
├── tools_data/                 # Corpora compilati (generati da build_corpus.py)
│   └── geometria.json          # JSON: { id, aree, teoremi: [ { livello, usa... } ] }
│
├── tests/                      # `python -m pytest tests/`. Guardano soprattutto la
│                               # VALIDAZIONE in build: una dimostrazione sbagliata
│                               # che compila in silenzio diventa una scheda che lo
│                               # studente non può risolvere
│
├── docs/                       # Sintassi dei corsi: un file per argomento, tutti
│                               # sotto le 300 righe. Indice in docs/README.md.
│                               # Carica solo il file che ti serve (blanks.md,
│                               # variabili.md, grafici.md, tabelle.md, p5.md,
│                               # espressioni.md, formula.md, blocchi.md, …)
│
├── README.md                   # Introduzione e setup
├── GETTING_STARTED.md          # Guida rapida per iniziare
└── LICENSE                     # Licenza MIT

```

## File Principali

### Backend (Python/Flask)

- **app.py**: Server Flask principale, registra blueprint e serve l'app
- **config.py**: Configurazione (cartelle content, courses_data, ecc.)
- **build_courses.py**: Script CLI per compilare corsi da markdown
- **routes/tools.py**: Blueprint delle pagine-strumento:
  - `/tools/` → elenco degli strumenti esposti dall'istanza
  - `/tools/<tool_id>/` → strumento a pagina intera, configurato dai **parametri
    della query string** (letti dal JS, non dal server: il sito è statico).
    Per `kind: theory` è la mappa del corpus
  - `/tools/<tool_id>/<item_id>/` → una voce del corpus (un teorema): il path
    dice quale, la query string come presentarlo. Vedi `TEORIA.md`
- **routes/courses.py**: Blueprint con le route a 3 livelli:
  - `/course/<id>` → panoramica corso (elenco lezioni, template `course.html`)
  - `/course/<id>/<lesson_id>` → redirect al primo step della lezione
  - `/course/<id>/<lesson_id>/<step_id>` → viewer step (template `lesson.html`)

### Parser

- **parser/markdown_parser.py**: Converte markdown + sintassi custom → HTML
- **parser/preprocessors.py**: Pre-processori per:
  - `[[answer]]` → `<x-blank>` (input/scelta multipla)
  - `${var}{config}` → `<x-variable>` (slider)
  - `:::table` → tabella con frecce etichettate fra le righe (CSS Grid, niente
    JS: vedi docs/tabelle.md)
  - `:::formula` → `<x-formula>` (formula commentata: `@nome{…}` diventa
    `\class{fx-nome}{…}`, le righe `da -> a : commento` diventano frecce)
  - `:::div.class` → `<div class="class">` (blocchi custom)

### Frontend (JavaScript)

- **static/components/blank.js**: Web Component per:
  - Input testuale con validazione
  - Scelta multipla con bottoni
  - Sintassi: `[[risposta]]` o `[[opt1|*corretta|opt3]]`

- **static/components/variable.js**: Web Component per slider interattivi
  - Sintassi: `${display}{bind|initial|min,max,step}`

- **static/components/formula.js**: Formula grande con frecce commentate fra sue
  sotto-parti (base → base "reciproco", esponente → esponente "cambia segno").
  Misura i pezzi composti da MathJax e ci disegna sopra le staffe in SVG; toccare
  una freccia mette a fuoco lei e i suoi due estremi. Espositivo, non è un goal.
  - Sintassi: `:::formula` con `@nome{…}` e righe `da -> a : commento`

- **static/components/step.js**: Container step con:
  - Goal tracking (monitora completamento elementi interattivi)
  - Modello reattivo per variabili
  - Reveal content quando tutti i goal sono completati

### Contenuti

- **content/[corso-id]/content-N.md**: Lezione N (markdown sorgente). In cima un
  front-matter di lezione (righe `>` senza corpo + `---`) ne definisce titolo/id.
- **content/[corso-id]/metadata.yaml**: Metadati corso (title, description, color,
  `progression: free|sequential`).
- **courses_data/[corso-id].json**: Corso compilato (`{ id, metadata, lessons: [...] }`).

Vedi `docs/struttura.md` per la struttura completa corso → lezioni → step.

## Workflow

1. **Creazione contenuto**: Scrivi `content/[corso-id]/content-N.md` (una lezione per file) usando la sintassi custom
2. **Build**: Esegui `python build_courses.py` per compilare markdown → JSON
3. **Sviluppo**: `python app.py` avvia server Flask su http://localhost:5000.
   In sviluppo la build è automatica e selettiva (`dev_rebuild.py`): aprendo un
   corso, se i sorgenti sono più recenti del JSON viene ricompilato **solo quel
   corso** (idem per i corpora). Il passo 2 serve solo per la build completa /
   il deploy. Si disattiva con `AUTO_REBUILD=0`.
4. **Test**: `python -m pytest tests/`
5. **Produzione**: Deploy su Heroku/Render/altro con gunicorn

## Sintassi Custom

La documentazione sta in `docs/`, **un file per argomento**: carica solo quello
che ti serve, non tutta la cartella. L'indice `docs/README.md` mappa "cosa
cerchi → quale file". Il corso `content/esempi/` è la vetrina eseguibile: ogni
costrutto documentato ha almeno uno step che lo mostra dal vivo, e
`tests/test_docs_coverage.py` verifica che sia ancora vero.

Esempi:

```markdown
# Input testuale
Risposta: [[5]]

# Scelta multipla (usa * per indicare la risposta corretta)
Scegli: [[Opz1|*Corretta|Opz3]]

# Slider interattivo
Valore: ${a}{a|2|-5,5,1}

# Blocchi custom
:::div.highlight
Contenuto evidenziato
:::

# Reveal (appare quando tutti i goal sono completati)
:::div.reveal
Ottimo lavoro!
:::
```