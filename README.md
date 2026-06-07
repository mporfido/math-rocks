# Piattaforma Corsi Interattivi

Una piattaforma web per creare e pubblicare corsi interattivi di matematica (e altre materie) con esercizi, visualizzazioni dinamiche e validazione automatica.

## Caratteristiche

- ✅ **Markdown esteso** con sintassi custom per elementi interattivi
- ✅ **Web Components** per interattività (blanks, sliders, scelte multiple)
- ✅ **Goal tracking** automatico per monitorare i progressi
- ✅ **Rendering matematico** con MathJax 3
- ✅ **Reveal content** che appare al completamento degli obiettivi
- ✅ **Responsive design** ottimizzato per mobile

## Stack Tecnologico

**Backend:**
- Flask 3.0 (Python web framework)
- mistune 3.0 (Markdown parser)
- PyYAML (Metadata parsing)

**Frontend:**
- Web Components (vanilla JavaScript)
- MathJax 3 (rendering formule matematiche)
- CSS3 con design moderno

## Installazione

### Prerequisiti

- Python 3.8 o superiore
- pip (Python package manager)

### Setup

1. **Clona il repository**
```bash
git clone <repository-url>
cd math-rocks
```

2. **Crea virtual environment**
```bash
python -m venv venv

# Attiva (Windows)
venv\Scripts\activate

# Attiva (Linux/Mac)
source venv/bin/activate
```

3. **Installa dipendenze**
```bash
pip install -r requirements.txt
```

4. **Genera JSON dei corsi**
```bash
python build_courses.py
```

5. **Avvia server di sviluppo**
```bash
python app.py
```

6. **Apri il browser**
```
http://localhost:5000
```

## Struttura Progetto

```
math-rocks/
├── app.py                      # Applicazione Flask principale
├── config.py                   # Configurazione
├── build_courses.py            # Script per build corsi
├── requirements.txt            # Dipendenze Python
│
├── parser/
│   ├── markdown_parser.py      # Parser markdown custom
│   └── preprocessors.py        # Preprocessori sintassi
│
├── routes/
│   └── courses.py              # Routes Flask per corsi
│
├── templates/
│   ├── base.html               # Template base
│   ├── home.html               # Homepage
│   └── course.html             # Visualizzatore corso
│
├── static/
│   ├── components/
│   │   ├── blank.js            # Web Component input
│   │   ├── variable.js         # Web Component slider
│   │   └── step.js             # Web Component container
│   ├── style.css               # Stili globali
│   └── components.css          # Stili componenti
│
├── content/                    # Corsi sorgente (markdown)
│   └── esempio-algebra/
│       ├── content.md          # Contenuto corso
│       └── metadata.yaml       # Metadati
│
└── courses_data/               # JSON generati (auto-generated)
    └── esempio-algebra.json
```

## Creare un Nuovo Corso

### 1. Crea directory corso

```bash
mkdir content/nome-corso
```

### 2. Crea metadata.yaml

```yaml
title: Titolo del Corso
description: Breve descrizione del corso
level: beginner
duration: 30 minuti
```

### 3. Crea content.md

Vedi [MARKDOWN_SYNTAX.md](MARKDOWN_SYNTAX.md) per la sintassi completa.

**Esempio minimo:**

```markdown
> id: intro
> title: Introduzione

# Benvenuto!

Completa l'esercizio: 2 + 2 = [[4]]

---

> id: esercizi
> title: Esercizi

Muovi lo slider: ${a}{a|0|-10,10,1}

Il valore è ${a}.
```

### 4. Genera JSON

```bash
python build_courses.py nome-corso
```

### 5. Visualizza nel browser

Vai su `http://localhost:5000` e apri il corso.

## Sintassi Markdown Custom

### Blanks (Fill-in-the-blank)

**Input testuale:**
```markdown
Risposta: x = [[5]]
```

**Scelta multipla:**
```markdown
Scegli: [[opzione1|opzione2|opzione3]]
```

### Variables (Sliders)

```markdown
${a}{a|2|-5,5,1}
```
Formato: `${display}{bind|initial|min,max,step}`

### Blocchi Custom

```markdown
:::div.highlight
Contenuto evidenziato
:::
```

### Reveal Content

```markdown
:::div.reveal
Questo appare solo quando tutti i goals sono completati!
:::
```

### Formule Matematiche

```markdown
Inline: `x^2 + y^2 = r^2`
Display: $$\int_0^1 f(x) dx$$
```

Per la sintassi completa, vedi [MARKDOWN_SYNTAX.md](MARKDOWN_SYNTAX.md).

## Comandi Utili

### Build corsi

```bash
# Build tutti i corsi
python build_courses.py

# Build singolo corso
python build_courses.py nome-corso
```

### Avvia server

```bash
# Development (con auto-reload)
python app.py

# Production (con gunicorn)
gunicorn -w 4 -b 0.0.0.0:5000 'app:create_app()'
```

### Test parser

```bash
# Testa parser su file specifico
python parser/markdown_parser.py content/corso/content.md
```

## Sviluppo

### Modificare corsi

1. Modifica `content/corso/content.md`
2. Rigenera JSON: `python build_courses.py corso`
3. Ricarica pagina nel browser

### Modificare componenti

1. Modifica `static/components/*.js`
2. Ricarica pagina (no build necessario)

### Modificare stili

1. Modifica `static/*.css`
2. Ricarica pagina

## Roadmap MVP

- [x] Setup progetto base
- [x] Flask skeleton
- [x] Parser Core
- [x] Build Script
- [x] Course Routes
- [x] Componente Blank
- [x] Componente Variable
- [x] Componente Step
- [x] Navigation & Homepage
- [x] Corso esempio
- [x] CSS Polish
- [x] Testing & Documentation

## Future Enhancements

**Phase 2: Persistence**
- Database SQLite
- User authentication
- Progress saving

**Phase 3: Advanced Components**
- Gallery (image carousel)
- Video player
- Sortable (drag-and-drop)
- Graph visualizations

**Phase 4: Analytics**
- Completion tracking
- Time-on-step metrics
- User dashboard

## Licenza

MIT License

## Contribuire

1. Fork il progetto
2. Crea un branch per la tua feature
3. Commit le modifiche
4. Push al branch
5. Apri una Pull Request

## Supporto

Per problemi o domande, apri una issue su GitHub.
