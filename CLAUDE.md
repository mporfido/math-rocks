# CLAUDE.md

Piattaforma per creare corsi interattivi online scritto in python.

Segui queste ultime indicazioni preferibilmente (guida pratica), per ora il progetto è in fase embrionale.

## Struttura del Progetto

```
math-rocks/
├── app.py                      # Entry point Flask, server principale
├── config.py                   # Configurazione globale dell'app
├── build_courses.py            # Script per compilare corsi da markdown a JSON
├── requirements.txt            # Dipendenze Python
│
├── parser/                     # Parser markdown custom
│   ├── __init__.py
│   ├── markdown_parser.py      # Parser principale (converte MD → HTML)
│   └── preprocessors.py        # Pre-processori sintassi custom (blanks, variables, blocks)
│
├── routes/                     # Route Flask (blueprint)
│   ├── __init__.py
│   └── courses.py              # Route per visualizzare corsi (/course/<id>)
│
├── templates/                  # Template Jinja2
│   ├── base.html               # Template base (layout comune)
│   ├── home.html               # Homepage con lista corsi
│   └── course.html             # Viewer corso singolo
│
├── static/                     # Asset statici (CSS, JS)
│   ├── style.css               # Stili globali
│   ├── components.css          # Stili per web components
│   └── components/             # Web Components JavaScript
│       ├── blank.js            # <x-blank>: input/scelta multipla
│       ├── step.js             # <x-step>: container step con goal tracking
│       └── variable.js         # <x-variable>: slider interattivo
│
├── content/                    # Contenuti dei corsi (sorgente)
│   └── esempi/                 # Un CORSO = una cartella
│       ├── metadata.yaml       # Metadati corso (titolo, descrizione, colore, progression)
│       ├── content-1.md        # Una LEZIONE = un file content-N.md (step separati da ---)
│       └── content-2.md
│
├── courses_data/               # Corsi compilati (generati da build_courses.py)
│   └── esempi.json             # JSON: { id, metadata, lessons: [ { steps... } ] }
│
├── README.md                   # Introduzione e setup
├── GETTING_STARTED.md          # Guida rapida per iniziare
├── MARKDOWN_SYNTAX.md          # Sintassi markdown estesa
└── LICENSE                     # Licenza MIT

```

## File Principali

### Backend (Python/Flask)

- **app.py**: Server Flask principale, registra blueprint e serve l'app
- **config.py**: Configurazione (cartelle content, courses_data, ecc.)
- **build_courses.py**: Script CLI per compilare corsi da markdown
- **routes/courses.py**: Blueprint con le route a 3 livelli:
  - `/course/<id>` → panoramica corso (elenco lezioni, template `course.html`)
  - `/course/<id>/<lesson_id>` → redirect al primo step della lezione
  - `/course/<id>/<lesson_id>/<step_id>` → viewer step (template `lesson.html`)

### Parser

- **parser/markdown_parser.py**: Converte markdown + sintassi custom → HTML
- **parser/preprocessors.py**: Pre-processori per:
  - `[[answer]]` → `<x-blank>` (input/scelta multipla)
  - `${var}{config}` → `<x-variable>` (slider)
  - `:::div.class` → `<div class="class">` (blocchi custom)

### Frontend (JavaScript)

- **static/components/blank.js**: Web Component per:
  - Input testuale con validazione
  - Scelta multipla con bottoni
  - Sintassi: `[[risposta]]` o `[[opt1|*corretta|opt3]]`

- **static/components/variable.js**: Web Component per slider interattivi
  - Sintassi: `${display}{bind|initial|min,max,step}`

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

Vedi `MARKDOWN_SYNTAX.md` per la struttura completa corso → lezioni → step.

## Workflow

1. **Creazione contenuto**: Scrivi `content/[corso-id]/content-N.md` (una lezione per file) usando la sintassi custom
2. **Build**: Esegui `python build_courses.py` per compilare markdown → JSON
3. **Sviluppo**: `python app.py` avvia server Flask su http://localhost:5000
4. **Produzione**: Deploy su Heroku/Render/altro con gunicorn

## Sintassi Custom

Vedi `MARKDOWN_SYNTAX.md` per la documentazione completa. Esempi:

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