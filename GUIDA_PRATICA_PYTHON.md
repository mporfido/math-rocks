# Guida Pratica: Piattaforma Corsi Interattivi con Python/Flask

## Cos'è Questo Documento

Questa è una guida completa per costruire una piattaforma per **corsi interattivi di matematica** (o qualsiasi materia) usando Python/Flask, ispirata a Mathigon Studio.

**Obiettivo finale:**
- Scrivere corsi in markdown con sintassi speciale per elementi interattivi
- Parser Python che converte markdown → HTML interattivo
- Web components JavaScript per l'interattività (blanks, sliders, etc.)
- Backend Flask per autenticazione e salvataggio progressi
- Database SQL per utenti e progressi

**Questo documento è pensato per essere portato in un nuovo progetto e seguito passo-passo.**

---

## Indice

1. [Panoramica Sistema](#panoramica-sistema)
2. [Decisione Chiave: JavaScript Vanilla vs TypeScript](#decisione-chiave-javascript)
3. [Stack Tecnologico Raccomandato](#stack-tecnologico)
4. [Architettura del Progetto](#architettura)
5. [Esempi di Codice Completi](#esempi-di-codice)
6. [Roadmap di Implementazione](#roadmap)
7. [Setup Iniziale Passo-Passo](#setup-iniziale)

---

## Panoramica Sistema

### Come Funziona (Vista dall'Alto)

```
┌─────────────────────────────────────────────────────────────┐
│  1. AUTORE                                                   │
│     Scrive corso in Markdown                                 │
│     content/algebra/content.md                              │
│                                                              │
│     Esempio:                                                 │
│     "Risolvi: 2x = 10, quindi x = [[5]]"                    │
│     "Muovi lo slider: ${a}{a|2|-5,5,1}"                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  2. BUILD PROCESS (Python)                                   │
│     Parser Python legge markdown                             │
│     Converte sintassi custom in HTML + Web Components       │
│                                                              │
│     [[5]] → <x-blank id="blank-0" data-solution="5">        │
│     ${a}{...} → <x-variable id="var-0" ...>                 │
│                                                              │
│     Output: JSON strutturato con HTML                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  3. SERVER (Flask)                                           │
│     Route: /course/algebra/section-1                         │
│     - Carica JSON del corso                                  │
│     - Carica progressi utente da database SQL               │
│     - Renderizza template Jinja2                            │
│     - Serve pagina HTML                                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  4. BROWSER (Utente)                                         │
│     Riceve HTML con componenti custom:                       │
│     <x-blank>, <x-variable>, <x-step>                       │
│                                                              │
│     JavaScript carica i Web Components                       │
│     Componenti si "attivano" e diventano interattivi        │
│                                                              │
│     Utente:                                                  │
│     - Compila blank → validazione                           │
│     - Muove slider → aggiorna valori                        │
│     - Completa goals → sblocca contenuto                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  5. SALVATAGGIO PROGRESSI                                   │
│     JavaScript invia POST a Flask API:                       │
│     POST /api/progress                                       │
│     { course_id, section_id, goals: [...], score: 5 }       │
│                                                              │
│     Flask salva in database SQL:                             │
│     INSERT INTO progress (user_id, course_id, ...)          │
└─────────────────────────────────────────────────────────────┘
```

### Sintassi Markdown Custom - Esempi

```markdown
# Introduzione all'Algebra

> id: intro
> title: Primi Passi

Benvenuto! Completa l'esercizio: Se `2x = 10`, allora `x =` [[5]].

Bene! Ora prova con una scelta multipla: `2 + 2 =` [[3|4|5]]

---

> id: variabili
> title: Variabili Interattive

Muovi lo slider per cambiare il valore di `a`: ${a}{a|2|-5,5,1}

L'equazione diventa: `x^2 + ${a}x + 1 = 0`

:::div.highlight
Questo è un box evidenziato!
:::
```

**Si trasforma in:**
- `[[5]]` → campo di input che valida la risposta
- `[[3|4|5]]` → bottoni per scelta multipla
- `${a}{a|2|-5,5,1}` → slider interattivo (variabile `a`, valore iniziale `2`, range `-5` a `5`, step `1`)
- `` `2x` `` → formula matematica renderizzata
- `:::div.class` → blocchi HTML con classi CSS

---

<a name="decisione-chiave-javascript"></a>
## Decisione Chiave: JavaScript Vanilla vs TypeScript

### Il Dilemma

Per i componenti interattivi devi scrivere JavaScript. Hai due opzioni:

### Opzione A: **JavaScript Vanilla (Moderno)**

**Cosa significa:**
- Scrivi file `.js` normali
- Nessun build process
- Nessun Node.js necessario
- Modifichi file → ricarichi pagina → funziona

**Pro:**
- ✅ Semplicità totale: zero configurazione
- ✅ Apri file, capisci cosa fa, modifichi
- ✅ Tra 2 anni riapri progetto e funziona ancora
- ✅ Nessun `node_modules` da 500MB
- ✅ Deploy: copi file e basta

**Contro:**
- ❌ Nessun autocomplete avanzato nell'editor
- ❌ Errori di tipo solo a runtime
- ❌ Refactoring più manuale

**Quando sceglierla:**
- Progetti piccoli/medi (< 20 componenti)
- Modificherai poco il JavaScript dopo
- Vuoi massima semplicità

### Opzione B: **TypeScript + Build Minimo**

**Cosa significa:**
- Scrivi file `.ts` (TypeScript)
- Serve Node.js installato (solo per build)
- Quando modifichi: `npm run build` → compila `.ts` in `.js`
- Deploy: copi solo i file `.js` compilati

**Pro:**
- ✅ Autocomplete intelligente nell'editor
- ✅ Errori di tipo PRIMA di eseguire
- ✅ Refactoring più sicuro
- ✅ Codice "auto-documentato" (tipi espliciti)

**Contro:**
- ❌ Serve Node.js installato (ma solo per sviluppo)
- ❌ Build step ogni volta che modifichi
- ❌ Configurazione iniziale (tsconfig.json)

**Quando sceglierla:**
- Progetti grandi (20+ componenti)
- Vuoi sicurezza dei tipi
- Non ti spaventa un build step

### Confronto Pratico - Stesso Componente

#### Vanilla JavaScript:
```javascript
// static/components/blank.js
class XBlank extends HTMLElement {
  connectedCallback() {
    const solution = this.dataset.solution;

    this.innerHTML = `
      <input type="text" placeholder="...">
      <span class="feedback"></span>
    `;

    this.querySelector('input').addEventListener('input', (e) => {
      if (e.target.value.trim() === solution) {
        this.classList.add('correct');
        this.dispatchEvent(new CustomEvent('goal-complete', {
          bubbles: true,
          detail: { goalId: this.id }
        }));
      }
    });
  }
}

customElements.define('x-blank', XBlank);
```

**Uso in HTML:**
```html
<script src="/static/components/blank.js"></script>
<x-blank id="blank-0" data-solution="5"></x-blank>
```

#### TypeScript + Lit:
```typescript
// frontend/components/blank.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('x-blank')
export class XBlank extends LitElement {
  @property() solution: string = '';
  @state() value: string = '';
  @state() isCorrect: boolean = false;

  static styles = css`
    :host { display: inline-block; }
    input { padding: 4px; border: 2px solid #ccc; }
    input.correct { border-color: green; }
  `;

  private handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.value = target.value.trim();
    this.isCorrect = this.value === this.solution;

    if (this.isCorrect) {
      this.dispatchEvent(new CustomEvent('goal-complete', {
        bubbles: true,
        detail: { goalId: this.id }
      }));
    }
  }

  render() {
    return html`
      <input
        type="text"
        .value=${this.value}
        class=${this.isCorrect ? 'correct' : ''}
        @input=${this.handleInput}
        placeholder="...">
      <span class="feedback">${this.isCorrect ? '✓' : ''}</span>
    `;
  }
}
```

**Deve essere compilato:**
```bash
npm run build  # TypeScript + Lit → JavaScript normale
```

### 🎯 Raccomandazione

**Per iniziare: JavaScript Vanilla**

Motivi:
1. Valida l'idea senza overhead
2. Se funziona con 5-10 componenti, puoi sempre migrare dopo
3. Migrazione Vanilla → TypeScript richiede 1-2 ore, non è irreversibile

**Passare a TypeScript quando:**
- Hai 15+ componenti
- La logica diventa complessa (animazioni, grafici, simulazioni)
- Vuoi più sicurezza nel refactoring

---

<a name="stack-tecnologico"></a>
## Stack Tecnologico Raccomandato

### Backend (100% Python)

| Componente | Libreria | Scopo |
|------------|----------|-------|
| **Web Framework** | **Flask** | Server web, routing, template |
| **Database** | **SQLAlchemy** + **SQLite/PostgreSQL** | ORM per database relazionale |
| **Auth** | **Flask-Login** + **Authlib** | Autenticazione + OAuth (Google, GitHub) |
| **Password** | **Werkzeug** (built-in Flask) | Hashing bcrypt |
| **Template** | **Jinja2** (built-in Flask) | HTML template engine |
| **Markdown** | **mistune** o **markdown-it-py** | Parser markdown base |
| **Math (opzionale)** | **latex2mathml** | LaTeX → MathML server-side |

### Frontend

| Componente | Libreria | Scopo |
|------------|----------|-------|
| **Componenti** | **Web Components API** (browser nativo) | Custom elements (`<x-blank>`, etc.) |
| **Math Rendering** | **MathJax 3** (CDN) | Formule matematiche nel browser |
| **CSS** | **CSS normale** o **SCSS** | Styling |
| **Build (opzionale)** | **esbuild** (se vuoi TypeScript) | Compilazione TS → JS |

### Database Schema (SQL)

```sql
-- Tabella utenti
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),  -- NULL se OAuth
    oauth_provider VARCHAR(50),  -- 'google', 'github', NULL
    oauth_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella progressi
CREATE TABLE progress (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    course_id VARCHAR(100),
    section_id VARCHAR(100),
    goals_completed TEXT,  -- JSON array: ["blank-0", "var-1"]
    score INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id, section_id)
);

-- Tabella corsi (opzionale - potresti usare solo JSON files)
CREATE TABLE courses (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    content_json TEXT,  -- JSON completo del corso
    created_at TIMESTAMP
);
```

---

<a name="architettura"></a>
## Architettura del Progetto

### Struttura Directory (Vanilla JS - Semplice)

```
math-courses/
├── app.py                      # Flask app principale
├── config.py                   # Configurazione (DB, secret keys)
├── requirements.txt            # Dipendenze Python
│
├── models.py                   # SQLAlchemy models (User, Progress)
├── auth.py                     # Blueprint autenticazione
├── courses.py                  # Blueprint corsi
│
├── parser/
│   ├── __init__.py
│   ├── markdown_parser.py      # Parser markdown custom
│   └── preprocessors.py        # Logica per [[blank]], ${var}, etc.
│
├── templates/                  # Jinja2 templates
│   ├── base.html               # Layout base
│   ├── home.html               # Homepage
│   ├── course.html             # Template corso
│   ├── login.html
│   └── dashboard.html
│
├── static/
│   ├── components/             # Web Components JavaScript
│   │   ├── blank.js            # Componente <x-blank>
│   │   ├── variable.js         # Componente <x-variable>
│   │   ├── step.js             # Componente <x-step>
│   │   └── ...
│   ├── course.js               # Logica principale corso
│   ├── style.css               # CSS globale
│   └── components.css          # CSS componenti
│
├── content/                    # Corsi in markdown
│   ├── algebra/
│   │   ├── content.md          # Contenuto corso
│   │   └── metadata.yaml       # Metadati (titolo, descrizione)
│   ├── geometry/
│   │   └── content.md
│   └── ...
│
├── courses_data/               # Corsi parsati (generati da build)
│   ├── algebra.json            # Output parser
│   ├── geometry.json
│   └── ...
│
└── instance/
    └── courses.db              # Database SQLite
```

### Struttura Directory (TypeScript - Con Build)

```
math-courses/
├── app.py
├── models.py
├── parser/
│   └── ...
├── templates/
│   └── ...
│
├── frontend/                   # Sorgenti TypeScript (da compilare)
│   ├── components/
│   │   ├── blank.ts
│   │   ├── variable.ts
│   │   └── step.ts
│   ├── course.ts
│   └── styles/
│       └── course.scss
│
├── static/                     # Output compilato (generato)
│   ├── course.js               # ← generato da frontend/course.ts
│   ├── course.css
│   └── ...
│
├── content/
│   └── ...
│
├── package.json                # Dipendenze Node (esbuild)
├── tsconfig.json               # Config TypeScript
└── build.py                    # Script Python per build
```

---

<a name="esempi-di-codice"></a>
## Esempi di Codice Completi

### 1. Parser Markdown (Python)

```python
# parser/markdown_parser.py
import re
import json
import mistune
from pathlib import Path

class CourseParser:
    """Parser per corsi con sintassi markdown custom"""

    def __init__(self):
        self.markdown = mistune.create_markdown()
        self.blank_counter = 0
        self.variable_counter = 0

    def parse_file(self, filepath: str) -> dict:
        """Parsa un file markdown e restituisce JSON strutturato"""
        content = Path(filepath).read_text(encoding='utf-8')

        # Reset counters
        self.blank_counter = 0
        self.variable_counter = 0

        # Split in steps (separati da ---)
        steps_raw = re.split(r'\n---\n', content)
        steps = []

        for idx, step_content in enumerate(steps_raw):
            if not step_content.strip():
                continue

            # Parsing metadata YAML (righe che iniziano con >)
            metadata, md_content = self._extract_metadata(step_content)

            # Pre-processing: converti sintassi custom
            md_content = self._preprocess(md_content)

            # Rendering markdown → HTML
            html = self.markdown(md_content)

            # Estrai goals (elementi interattivi)
            goals = self._extract_goals(html)

            steps.append({
                'id': metadata.get('id', f'step-{idx}'),
                'title': metadata.get('title', ''),
                'html': html,
                'goals': goals,
                'metadata': metadata
            })

        return {
            'steps': steps,
            'total_steps': len(steps)
        }

    def _extract_metadata(self, content: str) -> tuple[dict, str]:
        """Estrae metadata YAML (righe con >) e restituisce (metadata, contenuto)"""
        lines = content.split('\n')
        metadata_lines = []
        content_lines = []
        in_metadata = True

        for line in lines:
            if in_metadata and line.strip().startswith('>'):
                # Rimuovi '>' e aggiungi a metadata
                metadata_lines.append(line.strip()[1:].strip())
            else:
                in_metadata = False
                content_lines.append(line)

        metadata = {}
        if metadata_lines:
            import yaml
            metadata = yaml.safe_load('\n'.join(metadata_lines)) or {}

        return metadata, '\n'.join(content_lines)

    def _preprocess(self, content: str) -> str:
        """Pre-processa sintassi custom prima del markdown rendering"""
        # [[answer]] → <x-blank>
        content = self._process_blanks(content)

        # ${var}{config} → <x-variable>
        content = self._process_variables(content)

        # :::div.class → <div class="class">
        content = self._process_blocks(content)

        return content

    def _process_blanks(self, content: str) -> str:
        """[[answer]] → <x-blank id="blank-0" data-solution="answer"></x-blank>"""
        def replace(match):
            answer = match.group(1)
            blank_id = f'blank-{self.blank_counter}'
            self.blank_counter += 1

            if '|' in answer:
                # Multiple choice
                return f'<x-blank id="{blank_id}" data-choices="{answer}"></x-blank>'
            else:
                # Single answer
                return f'<x-blank id="{blank_id}" data-solution="{answer}"></x-blank>'

        return re.sub(r'\[\[([^\]]+)\]\]', replace, content)

    def _process_variables(self, content: str) -> str:
        """${a}{a|2|-5,5,1} → <x-variable ...></x-variable>"""
        pattern = r'\$\{([^}]+)\}\{([^}]+)\}'

        def replace(match):
            display = match.group(1)
            config = match.group(2)

            var_id = f'var-{self.variable_counter}'
            self.variable_counter += 1

            # Parse config: "a|2|-5,5,1"
            parts = config.split('|')
            bind = parts[0] if len(parts) > 0 else display
            initial = parts[1] if len(parts) > 1 else '0'
            range_str = parts[2] if len(parts) > 2 else '-10,10,1'

            min_val, max_val, step = range_str.split(',')

            return (
                f'<x-variable id="{var_id}" '
                f'data-bind="{bind}" '
                f'data-initial="{initial}" '
                f'data-min="{min_val}" '
                f'data-max="{max_val}" '
                f'data-step="{step}">'
                f'</x-variable>'
            )

        return re.sub(pattern, replace, content)

    def _process_blocks(self, content: str) -> str:
        """:::div.class → <div class="class">"""
        lines = content.split('\n')
        output = []
        stack = []

        for line in lines:
            if line.strip().startswith(':::'):
                if line.strip() == ':::':
                    # Chiusura
                    if stack:
                        tag = stack.pop()
                        output.append(f'</{tag}>')
                else:
                    # Apertura: :::div.class1.class2
                    spec = line.strip()[3:].strip()
                    tag, attrs = self._parse_tag_spec(spec)
                    stack.append(tag)
                    output.append(f'<{tag} {attrs}>'.strip())
            else:
                output.append(line)

        return '\n'.join(output)

    def _parse_tag_spec(self, spec: str) -> tuple[str, str]:
        """Parsa 'div.class1.class2' → ('div', 'class="class1 class2"')"""
        parts = spec.split('.')
        tag = parts[0] if parts[0] else 'div'
        classes = parts[1:] if len(parts) > 1 else []

        if classes:
            return tag, f'class="{" ".join(classes)}"'
        return tag, ''

    def _extract_goals(self, html: str) -> list[str]:
        """Estrae ID di elementi interattivi (goals)"""
        goals = []

        # Trova tutti <x-blank id="...">
        goals.extend(re.findall(r'<x-blank id="([^"]+)"', html))

        # Trova tutti <x-variable id="...">
        goals.extend(re.findall(r'<x-variable id="([^"]+)"', html))

        return goals


# Script CLI per build
if __name__ == '__main__':
    import sys
    from pathlib import Path

    parser = CourseParser()

    # Parsa tutti i corsi in content/
    content_dir = Path('content')
    output_dir = Path('courses_data')
    output_dir.mkdir(exist_ok=True)

    for course_dir in content_dir.iterdir():
        if not course_dir.is_dir():
            continue

        content_file = course_dir / 'content.md'
        if not content_file.exists():
            continue

        print(f'Parsing {course_dir.name}...')
        course_data = parser.parse_file(content_file)

        # Salva JSON
        output_file = output_dir / f'{course_dir.name}.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(course_data, f, ensure_ascii=False, indent=2)

        print(f'  → {output_file}')

    print('Done!')
```

### 2. Flask App (Backend)

```python
# app.py
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import json
from pathlib import Path

from models import db, User, Progress

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///instance/courses.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Init database
db.init_app(app)

# Init login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Create tables
with app.app_context():
    db.create_all()

# ===== Utility Functions =====

def load_course(course_id: str) -> dict:
    """Carica corso parsato da JSON"""
    course_file = Path('courses_data') / f'{course_id}.json'

    if not course_file.exists():
        return None

    with open(course_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_user_progress(user_id: int, course_id: str, section_id: str = None) -> dict:
    """Ottieni progressi utente"""
    if section_id:
        progress = Progress.query.filter_by(
            user_id=user_id,
            course_id=course_id,
            section_id=section_id
        ).first()

        if progress:
            return {
                'goals_completed': json.loads(progress.goals_completed or '[]'),
                'score': progress.score
            }

    # Tutti i progressi del corso
    all_progress = Progress.query.filter_by(
        user_id=user_id,
        course_id=course_id
    ).all()

    return {
        section.section_id: {
            'goals_completed': json.loads(section.goals_completed or '[]'),
            'score': section.score
        }
        for section in all_progress
    }

# ===== Routes =====

@app.route('/')
def home():
    """Homepage con lista corsi"""
    courses_dir = Path('content')
    courses = []

    for course_dir in courses_dir.iterdir():
        if course_dir.is_dir():
            # Carica metadata se esiste
            metadata_file = course_dir / 'metadata.yaml'
            if metadata_file.exists():
                import yaml
                metadata = yaml.safe_load(metadata_file.read_text())
            else:
                metadata = {'title': course_dir.name.title()}

            courses.append({
                'id': course_dir.name,
                'title': metadata.get('title', course_dir.name),
                'description': metadata.get('description', '')
            })

    return render_template('home.html', courses=courses)

@app.route('/course/<course_id>')
def course_index(course_id):
    """Redirect al primo step del corso"""
    course = load_course(course_id)
    if not course or not course['steps']:
        return "Course not found", 404

    first_step_id = course['steps'][0]['id']
    return redirect(url_for('course_step', course_id=course_id, step_id=first_step_id))

@app.route('/course/<course_id>/<step_id>')
def course_step(course_id, step_id):
    """Renderizza uno step del corso"""
    course = load_course(course_id)

    if not course:
        return "Course not found", 404

    # Trova step
    step = next((s for s in course['steps'] if s['id'] == step_id), None)
    if not step:
        return "Step not found", 404

    # Carica progressi se utente autenticato
    user_progress = {}
    if current_user.is_authenticated:
        user_progress = get_user_progress(current_user.id, course_id, step_id)

    # Step index per navigazione
    step_index = next(i for i, s in enumerate(course['steps']) if s['id'] == step_id)

    return render_template('course.html',
                          course_id=course_id,
                          course=course,
                          step=step,
                          step_index=step_index,
                          progress=user_progress)

# ===== API Routes =====

@app.route('/api/progress/<course_id>/<step_id>', methods=['GET', 'POST'])
@login_required
def api_progress(course_id, step_id):
    """Get/Set user progress"""

    if request.method == 'GET':
        # Ottieni progressi
        progress = get_user_progress(current_user.id, course_id, step_id)
        return jsonify(progress)

    elif request.method == 'POST':
        # Salva progressi
        data = request.get_json()
        goals = data.get('goals', [])
        score = data.get('score', 0)

        # Cerca record esistente
        progress = Progress.query.filter_by(
            user_id=current_user.id,
            course_id=course_id,
            section_id=step_id
        ).first()

        if progress:
            # Update
            progress.goals_completed = json.dumps(goals)
            progress.score = score
        else:
            # Create
            progress = Progress(
                user_id=current_user.id,
                course_id=course_id,
                section_id=step_id,
                goals_completed=json.dumps(goals),
                score=score
            )
            db.session.add(progress)

        db.session.commit()

        return jsonify({'status': 'ok', 'score': score})

# ===== Auth Routes =====

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('home'))

        return render_template('login.html', error='Invalid credentials')

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if User.query.filter_by(email=email).first():
            return render_template('register.html', error='Email already exists')

        user = User(
            email=email,
            password_hash=generate_password_hash(password)
        )
        db.session.add(user)
        db.session.commit()

        login_user(user)
        return redirect(url_for('home'))

    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)
```

### 3. Models (Database)

```python
# models.py
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))  # NULL se OAuth
    oauth_provider = db.Column(db.String(50))  # 'google', 'github', NULL
    oauth_id = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relazione con progressi
    progress = db.relationship('Progress', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.email}>'

class Progress(db.Model):
    __tablename__ = 'progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.String(100), nullable=False)
    section_id = db.Column(db.String(100), nullable=False)
    goals_completed = db.Column(db.Text)  # JSON array: ["blank-0", "var-1"]
    score = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'course_id', 'section_id', name='_user_course_section_uc'),
    )

    def __repr__(self):
        return f'<Progress user={self.user_id} course={self.course_id} section={self.section_id}>'
```

### 4. Web Components (JavaScript Vanilla)

#### Componente Blank

```javascript
// static/components/blank.js

/**
 * <x-blank> - Campo di input con validazione
 *
 * Attributi:
 *   data-solution: risposta corretta (singola)
 *   data-choices: scelte multiple separate da | (es: "a|b|c")
 *   id: identificativo univoco per goal tracking
 *
 * Eventi:
 *   goal-complete: quando l'utente risponde correttamente
 */
class XBlank extends HTMLElement {
  connectedCallback() {
    const solution = this.dataset.solution;
    const choices = this.dataset.choices;

    if (choices) {
      this.renderMultipleChoice(choices.split('|'), solution);
    } else {
      this.renderTextInput(solution);
    }
  }

  renderTextInput(solution) {
    this.innerHTML = `
      <span class="blank-wrapper">
        <input type="text" class="blank-input" placeholder="...">
        <span class="blank-feedback"></span>
      </span>
    `;

    const input = this.querySelector('input');
    const feedback = this.querySelector('.blank-feedback');

    input.addEventListener('input', () => {
      const value = input.value.trim().toLowerCase();
      const correctAnswer = solution.trim().toLowerCase();

      if (value === correctAnswer) {
        this.classList.add('correct');
        this.classList.remove('incorrect');
        feedback.textContent = '✓';
        feedback.className = 'blank-feedback success';

        // Emetti evento per goal tracking
        this.markComplete();
      } else if (value.length > 0) {
        this.classList.add('incorrect');
        this.classList.remove('correct');
        feedback.textContent = '✗';
        feedback.className = 'blank-feedback error';
      } else {
        this.classList.remove('correct', 'incorrect');
        feedback.textContent = '';
      }
    });
  }

  renderMultipleChoice(choices, solution) {
    this.innerHTML = `
      <span class="blank-choices">
        ${choices.map(choice => `
          <button class="choice-btn" data-value="${choice.trim()}">
            ${choice.trim()}
          </button>
        `).join('')}
      </span>
    `;

    this.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.value;
        const isCorrect = value === solution.trim();

        // Reset altri bottoni
        this.querySelectorAll('button').forEach(b => {
          b.classList.remove('selected', 'correct', 'incorrect');
        });

        // Marca bottone cliccato
        btn.classList.add('selected');

        if (isCorrect) {
          btn.classList.add('correct');
          this.classList.add('correct');
          this.markComplete();
        } else {
          btn.classList.add('incorrect');
          this.classList.add('incorrect');
        }
      });
    });
  }

  markComplete() {
    // Emetti evento una volta sola
    if (this.hasAttribute('data-completed')) {
      return;
    }

    this.setAttribute('data-completed', 'true');

    this.dispatchEvent(new CustomEvent('goal-complete', {
      bubbles: true,
      composed: true,
      detail: { goalId: this.id }
    }));
  }
}

customElements.define('x-blank', XBlank);
```

#### Componente Variable (Slider)

```javascript
// static/components/variable.js

/**
 * <x-variable> - Slider interattivo per variabili
 *
 * Attributi:
 *   data-bind: nome variabile da modificare
 *   data-initial: valore iniziale
 *   data-min: valore minimo
 *   data-max: valore massimo
 *   data-step: incremento
 */
class XVariable extends HTMLElement {
  connectedCallback() {
    const bind = this.dataset.bind;
    const initial = parseFloat(this.dataset.initial || 0);
    const min = parseFloat(this.dataset.min || -10);
    const max = parseFloat(this.dataset.max || 10);
    const step = parseFloat(this.dataset.step || 1);

    this.innerHTML = `
      <span class="variable-control">
        <span class="variable-value">${initial}</span>
        <input type="range"
               class="variable-slider"
               value="${initial}"
               min="${min}"
               max="${max}"
               step="${step}">
      </span>
    `;

    const slider = this.querySelector('input');
    const display = this.querySelector('.variable-value');

    // Update display e model
    slider.addEventListener('input', () => {
      const value = parseFloat(slider.value);
      display.textContent = value;

      // Aggiorna modello dello step
      const step = this.closest('x-step');
      if (step && step.model) {
        step.model[bind] = value;
      }

      // Emetti evento per aggiornamenti custom
      this.dispatchEvent(new CustomEvent('variable-change', {
        bubbles: true,
        detail: { name: bind, value }
      }));
    });

    // Marca come completato al primo movimento
    slider.addEventListener('change', () => {
      if (!this.hasAttribute('data-completed')) {
        this.setAttribute('data-completed', 'true');
        this.dispatchEvent(new CustomEvent('goal-complete', {
          bubbles: true,
          detail: { goalId: this.id }
        }));
      }
    }, { once: true });
  }
}

customElements.define('x-variable', XVariable);
```

#### Componente Step (Container)

```javascript
// static/components/step.js

/**
 * <x-step> - Container per uno step del corso
 *
 * Funzionalità:
 * - Goal tracking (monitora completamento elementi interattivi)
 * - Modello reattivo per variabili
 * - Salvataggio automatico progressi
 */
class XStep extends HTMLElement {
  constructor() {
    super();
    this.model = {};  // Modello reattivo per variabili
    this.completedGoals = new Set();
    this.allGoals = [];
  }

  connectedCallback() {
    // Estrai goals da elementi interattivi
    this.allGoals = this.extractGoals();

    // Carica progressi salvati
    this.loadProgress();

    // Listener per goal completions
    this.addEventListener('goal-complete', (e) => {
      this.handleGoalComplete(e.detail.goalId);
    });

    // Listener per cambiamenti variabili
    this.addEventListener('variable-change', (e) => {
      this.updateVariableDisplays(e.detail.name, e.detail.value);
    });
  }

  extractGoals() {
    const goals = [];

    // Goals da blanks
    this.querySelectorAll('x-blank[id]').forEach(blank => {
      goals.push(blank.id);
    });

    // Goals da variables
    this.querySelectorAll('x-variable[id]').forEach(variable => {
      goals.push(variable.id);
    });

    return goals;
  }

  handleGoalComplete(goalId) {
    if (this.completedGoals.has(goalId)) {
      return;  // Già completato
    }

    this.completedGoals.add(goalId);

    console.log(`Goal completed: ${goalId} (${this.completedGoals.size}/${this.allGoals.length})`);

    // Controlla se tutti i goals sono completati
    if (this.completedGoals.size === this.allGoals.length && this.allGoals.length > 0) {
      this.onAllGoalsComplete();
    }

    // Salva progressi
    this.saveProgress();
  }

  onAllGoalsComplete() {
    console.log('All goals completed!');

    // Mostra elementi "reveal" (nascosti fino a completamento)
    this.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('active');
    });

    // Emetti evento
    this.dispatchEvent(new CustomEvent('step-complete', {
      bubbles: true,
      detail: { stepId: this.dataset.stepId }
    }));
  }

  updateVariableDisplays(varName, value) {
    // Aggiorna tutti i display della variabile nel testo
    // Cerca elementi con data-var="varName"
    this.querySelectorAll(`[data-var="${varName}"]`).forEach(el => {
      el.textContent = value;
    });
  }

  async loadProgress() {
    const courseId = this.dataset.courseId;
    const stepId = this.dataset.stepId;

    if (!courseId || !stepId) return;

    try {
      const response = await fetch(`/api/progress/${courseId}/${stepId}`);
      if (response.ok) {
        const data = await response.json();

        // Ripristina goals completati
        if (data.goals_completed) {
          data.goals_completed.forEach(goalId => {
            this.completedGoals.add(goalId);

            // Marca elemento come completato
            const element = document.getElementById(goalId);
            if (element) {
              element.setAttribute('data-completed', 'true');
              element.classList.add('correct');
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }

  async saveProgress() {
    const courseId = this.dataset.courseId;
    const stepId = this.dataset.stepId;

    if (!courseId || !stepId) return;

    try {
      await fetch(`/api/progress/${courseId}/${stepId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          goals: Array.from(this.completedGoals),
          score: this.completedGoals.size
        })
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }
}

customElements.define('x-step', XStep);
```

### 5. Template HTML (Jinja2)

#### Base Template

```html
<!-- templates/base.html -->
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Math Courses{% endblock %}</title>

    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
    <link rel="stylesheet" href="{{ url_for('static', filename='components.css') }}">

    {% block extra_css %}{% endblock %}
</head>
<body>
    <header>
        <nav>
            <a href="{{ url_for('home') }}" class="logo">📚 Math Courses</a>
            <div class="nav-links">
                {% if current_user.is_authenticated %}
                    <span>{{ current_user.email }}</span>
                    <a href="{{ url_for('logout') }}">Logout</a>
                {% else %}
                    <a href="{{ url_for('login') }}">Login</a>
                    <a href="{{ url_for('register') }}">Register</a>
                {% endif %}
            </div>
        </nav>
    </header>

    <main>
        {% block content %}{% endblock %}
    </main>

    <footer>
        <p>Math Courses Platform - 2025</p>
    </footer>

    {% block scripts %}{% endblock %}
</body>
</html>
```

#### Course Template

```html
<!-- templates/course.html -->
{% extends "base.html" %}

{% block title %}{{ step.title }} - {{ course_id }}{% endblock %}

{% block extra_css %}
<!-- MathJax per rendering formule -->
<script>
  MathJax = {
    tex: {
      inlineMath: [['`', '`']],
      displayMath: [['$$', '$$']]
    },
    startup: {
      typeset: true
    }
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
{% endblock %}

{% block content %}
<div class="course-container">
    <!-- Sidebar navigazione -->
    <aside class="course-sidebar">
        <h3>{{ course_id|title }}</h3>
        <nav class="steps-nav">
            {% for s in course.steps %}
            <a href="{{ url_for('course_step', course_id=course_id, step_id=s.id) }}"
               class="step-link {% if s.id == step.id %}active{% endif %}">
                {{ loop.index }}. {{ s.title or s.id }}
            </a>
            {% endfor %}
        </nav>
    </aside>

    <!-- Contenuto step -->
    <article class="course-content">
        <x-step data-course-id="{{ course_id }}"
                data-step-id="{{ step.id }}">

            {{ step.html|safe }}

        </x-step>

        <!-- Navigazione step -->
        <div class="step-navigation">
            {% if step_index > 0 %}
            <a href="{{ url_for('course_step', course_id=course_id, step_id=course.steps[step_index - 1].id) }}"
               class="btn btn-secondary">← Precedente</a>
            {% endif %}

            {% if step_index < course.steps|length - 1 %}
            <a href="{{ url_for('course_step', course_id=course_id, step_id=course.steps[step_index + 1].id) }}"
               class="btn btn-primary">Successivo →</a>
            {% endif %}
        </div>
    </article>
</div>
{% endblock %}

{% block scripts %}
<!-- Carica Web Components -->
<script src="{{ url_for('static', filename='components/blank.js') }}"></script>
<script src="{{ url_for('static', filename='components/variable.js') }}"></script>
<script src="{{ url_for('static', filename='components/step.js') }}"></script>
{% endblock %}
```

### 6. CSS Base

```css
/* static/components.css */

/* Blank Component */
.blank-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 4px;
}

.blank-input {
  min-width: 80px;
  padding: 4px 8px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
  transition: border-color 0.3s;
}

x-blank.correct .blank-input {
  border-color: #22c55e;
  background-color: #f0fdf4;
}

x-blank.incorrect .blank-input {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.blank-feedback {
  font-weight: bold;
  min-width: 20px;
}

.blank-feedback.success {
  color: #22c55e;
}

.blank-feedback.error {
  color: #ef4444;
}

/* Multiple Choice */
.blank-choices {
  display: inline-flex;
  gap: 8px;
  margin: 0 4px;
}

.choice-btn {
  padding: 6px 12px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.choice-btn:hover {
  background: #f3f4f6;
}

.choice-btn.correct {
  border-color: #22c55e;
  background: #f0fdf4;
  color: #22c55e;
}

.choice-btn.incorrect {
  border-color: #ef4444;
  background: #fef2f2;
  color: #ef4444;
}

/* Variable Component */
.variable-control {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  margin: 0 4px;
}

.variable-value {
  font-weight: bold;
  min-width: 30px;
  text-align: center;
  color: #3b82f6;
}

.variable-slider {
  min-width: 120px;
}

/* Step Container */
x-step {
  display: block;
}

/* Reveal (nascosto fino a completamento goals) */
.reveal {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: opacity 0.5s, max-height 0.5s;
}

.reveal.active {
  opacity: 1;
  max-height: 1000px;
}

/* Highlight blocks */
.highlight {
  padding: 16px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 4px;
  margin: 16px 0;
}
```

---

<a name="roadmap"></a>
## Roadmap di Implementazione

### Fase 1: Setup Base (1 giorno)
**Obiettivo:** Progetto Flask funzionante con una pagina statica

- [ ] Crea virtualenv Python e installa Flask
- [ ] Struttura directory base
- [ ] Flask app con route `/` che mostra "Hello World"
- [ ] Template Jinja2 base con header/footer
- [ ] CSS base per layout

**Output:** Server Flask che risponde su `http://localhost:5000`

---

### Fase 2: Parser Markdown (2-3 giorni)
**Obiettivo:** Convertire markdown custom in HTML interattivo

- [ ] Installa `mistune` e `pyyaml`
- [ ] Implementa `CourseParser` base (split steps, metadata)
- [ ] Pre-processor per `[[blanks]]`
- [ ] Pre-processor per `${variables}`
- [ ] Pre-processor per `:::blocks:::`
- [ ] Script CLI: `python parser/markdown_parser.py`
- [ ] Testa con corso di esempio

**Output:** File JSON con steps parsati in `courses_data/`

---

### Fase 3: Database & Auth (2 giorni)
**Obiettivo:** Utenti possono registrarsi e fare login

- [ ] Installa `flask-sqlalchemy` e `flask-login`
- [ ] Definisci models (User, Progress)
- [ ] Route `/register` e `/login`
- [ ] Template login/register form
- [ ] Test: crea utente, fai login, logout

**Output:** Sistema auth funzionante

---

### Fase 4: Servire Corsi (1 giorno)
**Obiettivo:** Vedere corsi parsati nel browser

- [ ] Route `/course/<course_id>/<step_id>`
- [ ] Template `course.html`
- [ ] Carica JSON e mostra HTML dello step
- [ ] Sidebar con navigazione steps
- [ ] CSS per layout corso

**Output:** Corsi visibili (senza interattività)

---

### Fase 5: Web Components - Blank (2 giorni)
**Obiettivo:** Primo componente interattivo funzionante

- [ ] File `static/components/blank.js`
- [ ] Implementa text input con validazione
- [ ] Implementa multiple choice
- [ ] Emissione evento `goal-complete`
- [ ] CSS per styling
- [ ] Testa in corso reale

**Output:** `<x-blank>` funzionante

---

### Fase 6: Web Components - Variable & Step (2 giorni)
**Obiettivo:** Slider e goal tracking

- [ ] File `static/components/variable.js`
- [ ] Slider con modello reattivo
- [ ] File `static/components/step.js`
- [ ] Goal tracking system
- [ ] Reveal system (mostra contenuto al completamento)
- [ ] Testa workflow completo

**Output:** Step interattivo completo con goals

---

### Fase 7: Salvataggio Progressi (1 giorno)
**Obiettivo:** Progressi salvati su database

- [ ] API route `POST /api/progress/<course_id>/<step_id>`
- [ ] API route `GET /api/progress/<course_id>/<step_id>`
- [ ] JavaScript in `step.js`: salvataggio automatico
- [ ] Caricamento progressi all'apertura step
- [ ] Test: completa goals, ricarica, verifica stato salvato

**Output:** Progressi persistiti

---

### Fase 8: Math Rendering (1 giorno)
**Obiettivo:** Formule matematiche renderizzate

- [ ] Includi MathJax 3 da CDN in template
- [ ] Configura per usare `` ` `` per inline math
- [ ] Testa con formule di esempio
- [ ] (Opzionale) Server-side con `latex2mathml`

**Output:** Formule matematiche visibili

---

### Fase 9: Polish & UX (2-3 giorni)
**Obiettivo:** Piattaforma utilizzabile

- [ ] Homepage con lista corsi
- [ ] Dashboard utente con progressi
- [ ] CSS migliorato (responsive)
- [ ] Feedback visivi (loading, successo, errore)
- [ ] Gestione errori (404, 500)
- [ ] Testing completo

**Output:** Piattaforma completa e funzionale

---

### Fase 10: Features Avanzate (opzionali)
**Da aggiungere dopo se necessario:**

- [ ] OAuth (Google/GitHub) con Authlib
- [ ] Search full-text nei corsi
- [ ] Analytics (tempo speso, tassi completamento)
- [ ] Componenti aggiuntivi (gallery, video, sortable)
- [ ] i18n/l10n per multilingua
- [ ] Admin panel

---

<a name="setup-iniziale"></a>
## Setup Iniziale Passo-Passo

### 1. Prerequisiti

```bash
# Verifica Python 3.8+
python --version

# (Opzionale) Verifica Node.js se vuoi TypeScript dopo
node --version
```

### 2. Crea Progetto

```bash
# Crea directory
mkdir math-courses
cd math-courses

# Virtualenv
python -m venv venv

# Attiva (Windows)
venv\Scripts\activate

# Attiva (Linux/Mac)
source venv/bin/activate
```

### 3. Installa Dipendenze

```bash
# requirements.txt
cat > requirements.txt << EOF
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-Login==0.6.3
mistune==3.0.2
PyYAML==6.0.1
EOF

# Installa
pip install -r requirements.txt
```

### 4. Struttura Iniziale

```bash
# Crea directory
mkdir -p templates static/components content/algebra courses_data parser

# File base
touch app.py models.py parser/markdown_parser.py
touch templates/base.html templates/home.html templates/course.html
touch static/style.css static/components.css
touch static/components/blank.js static/components/variable.js static/components/step.js
```

### 5. Primo Corso di Esempio

```markdown
# content/algebra/content.md
> id: intro
> title: Introduzione

# Benvenuto all'Algebra!

Completa questo semplice esercizio: `2 + 2 =` [[4]]

Bene! Ora prova: `3 × 5 =` [[15]]

---

> id: variabili
> title: Variabili

Muovi lo slider: ${a}{a|2|-5,5,1}

Il valore di `a` è ${a}.
```

### 6. Primo Run

```bash
# Parsa corso
python parser/markdown_parser.py

# Avvia server
python app.py

# Apri browser: http://localhost:5000
```

---

## Prossimi Passi

### Decisione 1: JavaScript

**Consiglio:** Inizia con **Vanilla JS**

Se dopo 2-3 settimane il progetto funziona e vuoi TypeScript:
```bash
npm init -y
npm install esbuild lit

# Crea build.py
python build.py  # Compila TS → JS
```

### Decisione 2: Database

**Consiglio:** Inizia con **SQLite**

Se il progetto cresce:
```python
# Cambio in config.py
SQLALCHEMY_DATABASE_URI = 'postgresql://user:pass@localhost/mathcourses'
```

### Decisione 3: Deploy

**Opzioni semplici:**
1. **Railway** (gratis per iniziare, deploy git-based)
2. **PythonAnywhere** (hosting Python gratuito)
3. **Heroku** (piano gratuito limitato)
4. **VPS** (DigitalOcean, Linode) se vuoi controllo totale

---

## Domande Frequenti

### Q: Serve davvero Node.js?

**A:** No per MVP. Sì se vuoi TypeScript/Lit. Anche in quel caso, serve solo per build, non in produzione.

### Q: Posso usare React invece di Web Components?

**A:** Sì, ma è overkill per questo progetto. Web Components sono standard, leggeri, e sufficienti.

### Q: MongoDB o SQL?

**A:** SQL è più che sufficiente. MongoDB in Mathigon è una scelta storica, non tecnica.

### Q: E se volessi fare un'app mobile?

**A:** Web Components funzionano anche in app ibride (Capacitor/Cordova). Oppure crea API REST e fai app nativa separata.

### Q: Quanto tempo per MVP funzionante?

**A:** Con le fasi 1-8: **10-14 giorni** di lavoro part-time (2-3 ore/giorno).

---

## Risorse Utili

### Documentazione
- Flask: https://flask.palletsprojects.com/
- Web Components: https://developer.mozilla.org/en-US/docs/Web/API/Web_components
- MathJax: https://docs.mathjax.org/en/latest/
- mistune: https://mistune.lepture.com/

### Esempi Codice
- Flask Tutorial: https://flask.palletsprojects.com/en/latest/tutorial/
- Web Components Tutorial: https://web.dev/articles/custom-elements-v1

### Community
- r/flask (Reddit)
- Flask Discord
- Stack Overflow (tag: flask, web-components)

---

## Conclusioni

**Questo progetto è fattibile al 100% con Python/Flask + JavaScript vanilla.**

Stack finale raccomandato per iniziare:
- ✅ **Backend:** Flask + SQLAlchemy + SQLite
- ✅ **Parser:** mistune + regex Python
- ✅ **Frontend:** Web Components vanilla JS
- ✅ **Math:** MathJax 3 (CDN)
- ✅ **Deploy:** Railway o PythonAnywhere

**Tempo stimato MVP:** 2 settimane part-time

**Prossimo step:** Inizia con Fase 1 (Setup Base) e valida l'architettura.

Buon coding! 🚀
