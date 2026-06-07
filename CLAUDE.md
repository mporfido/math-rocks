# CLAUDE.md

Piattaforma per creare corsi interattivi online. Clone di Mathigon ma scritto in python.

Leggi i file se necessario:
- PYTHON_PORT_PROPOSAL.md contiene una proposta per ricostruire la piattaforma in python
- GUIDA_PRATICA_PYTHON.md contiene una proposta semplificata usando Flask e javascript vanilla e lasciando l'uso di Node.js solo se il numero di componenti dovesse crescere.

Segui queste ultime indicazioni preferibilmente (guida pratica), per ora il progetto è in fase embrionale.

Nel codice e nel resto dei file non menzionare mai Mathigon.

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
│   └── esempio-algebra/
│       ├── content.md          # Contenuto markdown con sintassi custom
│       └── metadata.yaml       # Metadati corso (titolo, descrizione, colore)
│
├── courses_data/               # Corsi compilati (generati da build_courses.py)
│   └── esempio-algebra.json    # JSON con steps HTML processati
│
└── docs/                       # Documentazione
    ├── README.md               # Introduzione e setup
    ├── GETTING_STARTED.md      # Guida rapida per iniziare
    ├── MARKDOWN_SYNTAX.md      # Sintassi markdown estesa
    ├── GUIDA_PRATICA_PYTHON.md # Proposta architettura Flask
    └── PYTHON_PORT_PROPOSAL.md # Proposta originale port Python
```

## File Principali

### Backend (Python/Flask)

- **app.py**: Server Flask principale, registra blueprint e serve l'app
- **config.py**: Configurazione (cartelle content, courses_data, ecc.)
- **build_courses.py**: Script CLI per compilare corsi da markdown
- **routes/courses.py**: Blueprint con route `/` (home) e `/course/<id>` (viewer)

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

- **content/[corso-id]/content.md**: Markdown sorgente con sintassi custom
- **content/[corso-id]/metadata.yaml**: Metadati corso (title, description, color, etc.)
- **courses_data/[corso-id].json**: Corso compilato (HTML processato + metadata)

## Workflow

1. **Creazione contenuto**: Scrivi `content/[corso-id]/content.md` usando la sintassi custom
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