# Proposta Architettura: Mathigon Studio Clone in Python

## Indice
1. [Analisi Architettura Mathigon Studio](#analisi-architettura-mathigon-studio)
2. [Equivalente Python - Stack Proposto](#equivalente-python---stack-proposto)
3. [Architettura Proposta](#architettura-proposta---python-mathigon-clone)
4. [Differenze Chiave](#differenze-chiave-e-considerazioni)
5. [Roadmap di Sviluppo](#roadmap-di-sviluppo-suggerita)
6. [Esempio Implementazione](#esempio-minimo---parser-custom)

---

## Analisi Architettura Mathigon Studio

### Componenti Chiave

#### 1. Pipeline di Parsing Markdown Custom
- Estende la sintassi markdown standard con elementi interattivi
- Gestisce math (AsciiMath/LaTeX), blanks `[[answer]]`, sliders `${var}{config}`, attributi custom
- Multi-stage: tokenizzazione → rendering → post-processing DOM → MathML
- **File chiave**: `build/markdown/parser.js`, `build/markdown/renderer.js`, `build/markdown/mathjax.js`

**Sintassi Custom Supportata:**
- **Blanks**: `[[answer]]` o `[[choice1|choice2|choice3]]` per fill-in-the-blank
- **Variables**: `${a}{a|2|-8,8,2}` crea slider interattivi
- **Equations**: `` `x^2 + y^2` `` → AsciiMath/LaTeX → MathML
- **Attributi**: `{.class1(attr="value")} content`
- **Block elements**: `:::div.class` / `:::`
- **Links speciali**: `[text](gloss:id)`, `[text](bio:id)`, `[text](action:fn())`

#### 2. Sistema di Componenti Interattivi
- Web components basati su pattern reattivo (Observable model)
- Sistema di "goals" (obiettivi) per tracciare progressi
- 21+ componenti specializzati: blank, slider, video, gallery, gesture, sortable, etc.
- **File chiave**: `frontend/components/step/step.ts`, `frontend/course.ts`

**Pattern Architetturale:**
```typescript
interface StepComponent {
  setup($step: Step, goal: string, initialData?: UserData): void;
}

// Observable model per reattività
$step.model = observe({});
$step.onScore('goal-id', () => revealContent());
```

#### 3. Build System
- Asset pipeline: TypeScript → JS (esbuild), SCSS → CSS (Sass + PostCSS), Markdown → JSON
- Supporto i18n con build separate per locale
- Watch mode per development
- **File chiave**: `build/index.js`, `build/assets.js`

**Pipeline di Build:**
```
Styles:  SCSS → Sass → PostCSS → Autoprefixer → RTLcss → Cssnano
Scripts: TS → esbuild → Bundle (con PUG templates inline)
Courses: MD → Parser → JSON (con MathJax per LaTeX → SVG)
Icons:   SVG → Sprite sheet con cache-busting
```

#### 4. Server & Persistence
- Express.js con TypeScript
- MongoDB per utenti, progressi, analytics (via Mongoose)
- OAuth authentication (Google, Microsoft, etc.)
- API REST per salvare progressi
- **File chiave**: `server/app.ts`, `server/models/*`, `server/utilities/*`

**Flusso Request:**
```
User Request
  ↓
Express Middleware (session, CSRF, security)
  ↓
Locale Detection (subdomain o ?hl=locale)
  ↓
Load Course JSON + User Progress
  ↓
Render Pug Template
  ↓
Return HTML con embedded course data
```

#### 5. Sistema di Contenuti
- Corsi divisi in sezioni e step (separati da `---`)
- Ogni step ha ID univoco collegato a funzioni TypeScript
- Metadata YAML integrati nel markdown (prefisso `>`)
- **Struttura**: `content/{course-id}/content.md`, `functions.ts`, `styles.scss`

---

## Equivalente Python - Stack Proposto

### 1. Parser Markdown Custom

**Librerie Consigliate:**
```python
# Parser base
markdown-it-py  # Port Python di markdown-it (estensibile)
# o mistune    # Alternativa veloce

# Math rendering
sympy          # Manipolazione simbolica matematica
latex2mathml   # Conversione LaTeX → MathML
mathjax-py     # Wrapper Python per MathJax (via Node)

# DOM manipulation
beautifulsoup4 # o lxml per post-processing HTML
```

**Architettura Implementazione:**
```python
from markdown_it import MarkdownIt
from markdown_it.renderer import Renderer

class MathigonRenderer(Renderer):
    """Renderer custom per sintassi estesa"""

    def render_blank(self, tokens, idx):
        # [[answer]] → <x-blank data-solution="answer"></x-blank>
        pass

    def render_variable(self, tokens, idx):
        # ${a}{a|2|-8,8,2} → <x-variable bind="a" ...></x-variable>
        pass

    def render_math_inline(self, tokens, idx):
        # `x^2` → <math>...</math> (MathML)
        pass

# Setup pipeline
md = MarkdownIt()
md.use(custom_syntax_plugin)  # Pre-processing
md.renderer = MathigonRenderer()

# Post-processing
from bs4 import BeautifulSoup
html = md.render(course_content)
soup = BeautifulSoup(html, 'lxml')
# Manipola DOM per attributi, goals, etc.
```

### 2. Build System

**Librerie Consigliate:**
```python
# Asset bundling
esbuild        # JS/TS bundling (via wrapper Python o subprocess)
libsass        # SCSS → CSS
rcssmin        # CSS minification
postcss-cli    # PostCSS (autoprefixer, etc.)

# Build orchestration
invoke         # Task runner (come Make/npm scripts)
watchdog       # File watching per rebuild automatico

# i18n
babel          # Gestione traduzioni
polib          # Parsing .po/.pot files
```

**Esempio `tasks.py` (invoke):**
```python
from invoke import task
import sass
import json
from pathlib import Path

@task
def build_styles(c, minify=False, watch=False):
    """Compila SCSS in CSS"""
    css = sass.compile(filename='frontend/course.scss')

    # Post-process con autoprefixer (via PostCSS)
    # c.run('postcss input.css -o output.css')

    if minify:
        import rcssmin
        css = rcssmin.cssmin(css)

    Path('public/styles').mkdir(exist_ok=True)
    with open('public/styles/course.css', 'w') as f:
        f.write(css)

@task
def build_scripts(c, minify=False):
    """Bundle TypeScript con esbuild"""
    cmd = 'esbuild frontend/course.ts --bundle --outfile=public/course.js'
    if minify:
        cmd += ' --minify'
    c.run(cmd)

@task
def build_courses(c, locale='en'):
    """Parsa markdown courses in JSON"""
    from .build.parser import parse_course

    for course_path in Path('content').glob('*/content.md'):
        course_id = course_path.parent.name
        course_data = parse_course(course_path, locale)

        output_dir = Path(f'public/content/{course_id}')
        output_dir.mkdir(parents=True, exist_ok=True)

        with open(output_dir / f'data_{locale}.json', 'w') as f:
            json.dump(course_data, f, ensure_ascii=False, indent=2)

@task
def build_all(c, minify=False, watch=False):
    """Build completo"""
    build_styles(c, minify=minify)
    build_scripts(c, minify=minify)
    build_courses(c)
    build_icons(c)

    if watch:
        from watchdog.observers import Observer
        from watchdog.events import FileSystemEventHandler
        # Setup file watcher per auto-rebuild
        pass

@task
def watch(c):
    """Watch mode per development"""
    build_all(c, watch=True)
```

### 3. Web Framework & Server

**Librerie Consigliate:**
```python
# Web framework
fastapi        # Moderno, async, OpenAPI integrata, performance eccellenti
# o flask     # Più tradizionale, semplice, ampia community

# Template engine
jinja2         # Simile a Pug/EJS, integrato con FastAPI/Flask
mako           # Alternativa più potente

# Authentication
authlib        # OAuth 1/2, OIDC completo
python-jose    # JWT tokens
passlib        # Password hashing (bcrypt, argon2)

# Database
motor          # MongoDB async driver (per FastAPI)
# o pymongo   # MongoDB sync (per Flask)
beanie         # ODM per MongoDB (equivalente Mongoose)
pydantic       # Validazione dati e serializzazione

# Session management
fastapi-sessions  # Session middleware per FastAPI
flask-session     # Per Flask
```

**Esempio Architettura FastAPI:**
```python
from fastapi import FastAPI, Depends, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from beanie import Document, init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional
import json

# ===== Models =====
class User(Document):
    email: str
    password_hash: str
    oauth_provider: Optional[str]
    oauth_id: Optional[str]
    progress: dict  # {course_id: {section_id: {goals: [...], score: int}}}

    class Settings:
        name = "users"

class Section(BaseModel):
    id: str
    title: str
    steps: list[dict]

class Course(BaseModel):
    id: str
    title: str
    sections: list[Section]
    locale: str
    glossary: Optional[dict]
    bios: Optional[dict]

# ===== App Setup =====
app = FastAPI(title="Mathigon Studio Python")
templates = Jinja2Templates(directory="server/templates")
app.mount("/public", StaticFiles(directory="public"), name="public")

@app.on_event("startup")
async def init_db():
    """Inizializza connessione MongoDB"""
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    await init_beanie(
        database=client.mathigon,
        document_models=[User]
    )

# ===== Utility Functions =====
def load_course(course_id: str, locale: str = 'en') -> Course:
    """Carica corso parsato da JSON"""
    with open(f'public/content/{course_id}/data_{locale}.json') as f:
        data = json.load(f)
    return Course(**data)

async def get_current_user(request: Request) -> Optional[User]:
    """Ottieni utente corrente da sessione"""
    user_id = request.session.get('user_id')
    if user_id:
        return await User.get(user_id)
    return None

# ===== Routes =====
@app.get("/")
async def home(request: Request):
    """Homepage"""
    return templates.TemplateResponse("home.html", {
        "request": request,
        "title": "Mathigon Studio"
    })

@app.get("/course/{course_id}/{section_id}")
async def serve_course(
    request: Request,
    course_id: str,
    section_id: str,
    user: Optional[User] = Depends(get_current_user)
):
    """Serve course page con progressi utente"""
    # Carica course data
    locale = request.query_params.get('hl', 'en')
    course = load_course(course_id, locale)

    # Trova sezione
    section = next((s for s in course.sections if s.id == section_id), None)
    if not section:
        return {"error": "Section not found"}, 404

    # Carica progressi utente
    user_progress = {}
    if user:
        user_progress = user.progress.get(course_id, {}).get(section_id, {})

    return templates.TemplateResponse("course.html", {
        "request": request,
        "course": course,
        "section": section,
        "progress": user_progress,
        "user": user
    })

@app.post("/api/course/{course_id}/{section_id}/progress")
async def save_progress(
    course_id: str,
    section_id: str,
    goals: list[str],
    score: int,
    user: User = Depends(get_current_user)
):
    """Salva progressi utente"""
    if not user:
        return {"error": "Not authenticated"}, 401

    # Update progress
    if course_id not in user.progress:
        user.progress[course_id] = {}

    user.progress[course_id][section_id] = {
        "goals": goals,
        "score": score,
        "updated_at": datetime.utcnow()
    }

    await user.save()

    return {"status": "ok", "progress": user.progress[course_id][section_id]}

@app.get("/api/course/{course_id}/{section_id}/progress")
async def get_progress(
    course_id: str,
    section_id: str,
    user: User = Depends(get_current_user)
):
    """Ottieni progressi utente"""
    if not user:
        return {}

    return user.progress.get(course_id, {}).get(section_id, {})

# ===== Authentication Routes =====
@app.post("/login")
async def login(email: str, password: str):
    """Login con email/password"""
    # Verifica credenziali con passlib
    pass

@app.get("/auth/google")
async def google_oauth():
    """Inizia OAuth flow con Google"""
    # Authlib OAuth client
    pass

@app.get("/auth/google/callback")
async def google_callback(code: str):
    """Callback OAuth Google"""
    # Scambia code per token, crea/aggiorna user
    pass

# ===== Run Server =====
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
```

### 4. Frontend - Componenti Interattivi

**Approcci Possibili:**

#### **A) Web Components puri (⭐ Consigliato - come Mathigon)**
```bash
# Mantieni JavaScript/TypeScript per frontend
npm install lit esbuild

# Build con esbuild (o via invoke task)
esbuild frontend/course.ts --bundle --outfile=public/course.js
```

**Pro:**
- Standard browser, zero dipendenze runtime
- Performance eccellenti
- Compatibile con qualsiasi framework
- Stesso approccio di Mathigon

**Contro:**
- Richiede Node.js per build (ma accettabile)

#### **B) Framework Python-first**
```python
# PyScript (Python nel browser via WASM)
# Pro: stesso linguaggio frontend/backend
# Contro: performance, dimensione bundle (~10MB), limitazioni

# HTMX + Alpine.js (⭐ Per app semplici)
# Server-rendered con interattività leggera
# Pro: semplice, SEO-friendly, poco JS
# Contro: limiti per interazioni complesse (math, drag-and-drop)

# PyWebIO o Streamlit
# Pro: tutto Python, rapid prototyping
# Contro: meno controllo UI, orientato a dashboard
```

#### **C) Ibrido (⭐ Bilanciato)**
```yaml
Backend: FastAPI (Python) - API + SSR
Frontend Build: esbuild + TypeScript
Componenti: Lit (Web Components leggeri)
Reattività: Signals/Observable pattern
Math: MathJax 3 o KaTeX (client-side)
```

**Esempio Componente Blank in Lit:**
```typescript
// frontend/components/blank.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('x-blank')
export class Blank extends LitElement {
  @property() solution: string = '';
  @property() choices: string = '';  // "a|b|c" per multiple choice
  @state() value: string = '';
  @state() status: 'pending' | 'valid' | 'invalid' = 'pending';

  static styles = css`
    :host {
      display: inline-block;
    }
    input {
      border: 2px solid #ccc;
      padding: 4px 8px;
      border-radius: 4px;
    }
    input.valid {
      border-color: green;
    }
    input.invalid {
      border-color: red;
    }
  `;

  validate() {
    const normalized = this.value.trim().toLowerCase();
    const solutions = this.solution.split('|').map(s => s.trim().toLowerCase());

    if (solutions.includes(normalized)) {
      this.status = 'valid';
      this.dispatchEvent(new CustomEvent('goal-complete', {
        bubbles: true,
        composed: true,
        detail: { goalId: this.id }
      }));
    } else if (this.value.length > 0) {
      this.status = 'invalid';
    }
  }

  render() {
    if (this.choices) {
      // Multiple choice
      const options = this.choices.split('|');
      return html`
        <div class="choices">
          ${options.map(opt => html`
            <button @click=${() => this.selectChoice(opt)}>
              ${opt}
            </button>
          `)}
        </div>
      `;
    }

    // Text input
    return html`
      <input
        type="text"
        class=${this.status}
        .value=${this.value}
        @input=${(e: Event) => {
          this.value = (e.target as HTMLInputElement).value;
          this.validate();
        }}
        placeholder="..."
      />
    `;
  }

  selectChoice(choice: string) {
    this.value = choice;
    this.validate();
  }
}
```

**Esempio Step Component:**
```typescript
// frontend/components/step.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Observable } from './observable';

@customElement('x-step')
export class Step extends LitElement {
  @property() stepId: string = '';
  @state() completedGoals: Set<string> = new Set();
  @state() allGoals: string[] = [];

  model: Observable = new Observable({});

  connectedCallback() {
    super.connectedCallback();

    // Extract goals from child components
    this.allGoals = this.extractGoals();

    // Listen for goal completions
    this.addEventListener('goal-complete', (e: CustomEvent) => {
      this.completeGoal(e.detail.goalId);
    });
  }

  extractGoals(): string[] {
    const blanks = this.querySelectorAll('x-blank');
    const variables = this.querySelectorAll('x-variable');
    return [
      ...Array.from(blanks).map(b => b.id),
      ...Array.from(variables).map(v => v.id)
    ].filter(Boolean);
  }

  completeGoal(goalId: string) {
    this.completedGoals.add(goalId);
    this.requestUpdate();

    // Check if all goals completed
    if (this.completedGoals.size === this.allGoals.length) {
      this.onAllGoalsComplete();
    }

    // Save progress to server
    this.saveProgress();
  }

  async saveProgress() {
    const [courseId, sectionId] = window.location.pathname.split('/').slice(2, 4);
    await fetch(`/api/course/${courseId}/${sectionId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goals: Array.from(this.completedGoals),
        score: this.completedGoals.size
      })
    });
  }

  onAllGoalsComplete() {
    // Reveal next content
    const reveals = this.querySelectorAll('.reveal');
    reveals.forEach(r => r.classList.add('active'));

    this.dispatchEvent(new CustomEvent('step-complete', {
      bubbles: true,
      detail: { stepId: this.stepId }
    }));
  }

  render() {
    return html`<slot></slot>`;
  }
}
```

### 5. Math Rendering

**Opzioni:**

#### **A) Server-side (nel parser)**
```python
# Sympy per parsing e conversione
from sympy import sympify, latex
from sympy.parsing.latex import parse_latex
import latex2mathml.converter

def parse_asciimath(expr: str) -> str:
    """AsciiMath → MathML server-side"""
    try:
        # Parse con sympy
        sym_expr = sympify(expr, evaluate=False)
        latex_str = latex(sym_expr)
        mathml = latex2mathml.converter.convert(latex_str)
        return f'<math display="inline">{mathml}</math>'
    except Exception as e:
        return f'<span class="math-error">{expr}</span>'

# Nel markdown renderer
def render_math_inline(content: str) -> str:
    # `x^2 + y^2` → <math>...</math>
    return parse_asciimath(content)
```

**Pro:** SEO-friendly, nessun flash di rendering
**Contro:** Build più lento, cache necessaria

#### **B) Client-side (⭐ Consigliato)**
```html
<!-- Include MathJax 3 -->
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
```

**Pro:** Veloce, nessun overhead server, supporto completo LaTeX
**Contro:** Flash di rendering iniziale (mitigabile con CSS)

#### **C) Ibrido**
- Server-side per math semplice (AsciiMath comune)
- Client-side fallback per LaTeX complesso
- Cache aggressiva per rendering server-side

---

## Architettura Proposta - Python Mathigon Clone

```
mathigon-py/
├── build/
│   ├── __init__.py
│   ├── parser.py              # Parser markdown custom
│   ├── renderer.py            # Renderer HTML con sintassi custom
│   ├── math_utils.py          # Math processing (AsciiMath, LaTeX)
│   ├── assets.py              # Asset bundling orchestration
│   └── preprocessors/
│       ├── blanks.py          # [[answer]] processing
│       ├── variables.py       # ${var} processing
│       └── attributes.py      # {.class(attr="val")} processing
│
├── server/
│   ├── __init__.py
│   ├── app.py                 # FastAPI app principale
│   ├── models.py              # Beanie/Pydantic models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── courses.py         # Course serving routes
│   │   ├── auth.py            # Authentication (OAuth, login)
│   │   ├── api.py             # REST API (progress, search)
│   │   └── dashboard.py       # User dashboard
│   ├── templates/             # Jinja2 templates
│   │   ├── base.html
│   │   ├── home.html
│   │   ├── course.html
│   │   └── dashboard.html
│   ├── middleware/
│   │   ├── session.py         # Session management
│   │   ├── locale.py          # i18n detection
│   │   └── security.py        # CSRF, headers
│   └── utils/
│       ├── i18n.py            # Translation utilities
│       ├── config.py          # Config loading (YAML)
│       └── course_loader.py   # Course JSON caching
│
├── frontend/
│   ├── components/            # Lit Web Components
│   │   ├── step.ts            # Step container con goals
│   │   ├── blank.ts           # Input con validazione
│   │   ├── blank-mc.ts        # Multiple choice
│   │   ├── variable.ts        # Reactive slider
│   │   ├── slider.ts          # Numeric range input
│   │   ├── gloss.ts           # Tooltip definitions
│   │   ├── video.ts           # Video player
│   │   ├── gallery.ts         # Image carousel
│   │   ├── gesture.ts         # Touch/mouse gestures
│   │   └── ...
│   ├── utils/
│   │   ├── observable.ts      # Observable/reactive model
│   │   └── goals.ts           # Goal tracking system
│   ├── course.ts              # Main course logic
│   ├── dashboard.ts           # User dashboard
│   ├── styles/
│   │   ├── course.scss
│   │   ├── main.scss
│   │   └── components/
│   └── assets/
│       ├── icons/             # SVG icons
│       └── images/
│
├── content/                   # Course content (git-ignored o separato)
│   ├── algebra/
│   │   ├── content.md         # Markdown del corso
│   │   ├── functions.ts       # Logic interattiva step-specific
│   │   ├── styles.scss        # Course-specific styles
│   │   ├── glossary.yaml      # Definitions
│   │   └── bios.yaml          # Biographies
│   ├── geometry/
│   └── ...
│
├── public/                    # Build output (git-ignored)
│   ├── content/               # Corsi parsati (JSON)
│   │   ├── algebra/
│   │   │   ├── data_en.json
│   │   │   ├── data_it.json
│   │   │   └── ...
│   │   └── ...
│   ├── styles/
│   │   ├── course.css
│   │   ├── course.rtl.css     # RTL per arabo/ebraico
│   │   └── main.css
│   ├── scripts/
│   │   ├── course.js
│   │   ├── course.en.js       # Con stringhe i18n
│   │   ├── dashboard.js
│   │   └── polyfill.js
│   ├── icons.{hash}.svg       # SVG sprite
│   └── sitemap.xml
│
├── translations/
│   ├── en/
│   │   ├── strings.yaml       # UI strings
│   │   └── courses/           # Translated course content
│   │       └── algebra/
│   │           └── content.md
│   ├── it/
│   └── ...
│
├── tests/
│   ├── test_parser.py         # Parser tests
│   ├── test_renderer.py
│   ├── test_api.py
│   └── fixtures/
│       └── markdown/
│
├── docs/
│   ├── setup.md
│   ├── markdown-syntax.md
│   └── components.md
│
├── tasks.py                   # Invoke build tasks
├── config.yaml                # Default configuration
├── pyproject.toml             # Python dependencies
├── package.json               # Node deps (esbuild, etc.)
├── .env.example
└── README.md
```

---

## Differenze Chiave e Considerazioni

### 1. Ecosistema Frontend
| Aspetto | Mathigon (Node) | Python Clone |
|---------|----------------|--------------|
| Linguaggio | TypeScript nativo | TypeScript (via Node/esbuild) |
| Bundling | esbuild | esbuild (subprocess o wrapper) |
| Template inline | PUG | PUG (compilato via Node) |
| Runtime | Node.js | Browser (Web Components standard) |

**Soluzione:** Mantieni TypeScript per frontend, usa Python solo per backend/build orchestration.

### 2. Performance Build
| Tool | Mathigon | Python |
|------|----------|--------|
| TS bundling | esbuild (~instant) | esbuild via subprocess (leggera latency) |
| SCSS | Sass (Node) | libsass (Python binding C) - comparabile |
| Markdown | markdown-it (JS) | markdown-it-py - performance simili |

**Soluzione:** Accettabile avere Node come dev dependency per esbuild. Alternativa: usare Rust-based bundlers (swc, rolldown) via PyO3 bindings.

### 3. Math Rendering
| Approccio | Pro | Contro |
|-----------|-----|--------|
| Server-side (Sympy + latex2mathml) | SEO, no flash | Build lento, cache complessa |
| Client-side (MathJax 3) | Fast build, supporto completo | Flash rendering, JS dependency |
| Ibrido | Best of both | Complessità |

**Raccomandazione:** Client-side MathJax 3 per MVP, server-side caching opzionale dopo.

### 4. Web Components
- **Nessuna differenza fondamentale**: Web Components sono standard browser
- Python serve HTML, JavaScript gestisce interattività
- Lit funziona identicamente indipendentemente dal backend

### 5. Database
| Mathigon | Python Equivalente |
|----------|-------------------|
| Mongoose (ODM) | Beanie (async ODM) o Motor (driver puro) |
| Express-session + connect-mongo | FastAPI-sessions + motor |

**Raccomandazione:** Beanie per semplicità, Motor per controllo granulare.

### 6. Deployment
| Stack | Opzioni |
|-------|---------|
| Node | PM2, Docker, Vercel, Netlify |
| Python | Gunicorn+Uvicorn, Docker, Railway, Heroku, Fly.io |

**Raccomandazione:** Docker per uniformità, Uvicorn workers per performance.

---

## Roadmap di Sviluppo Suggerita

### **Phase 1: Parser & Renderer (2-3 settimane)**
**Obiettivo:** Sistema di parsing markdown funzionante

1. ✅ Setup progetto base (pyproject.toml, structure)
2. ✅ Implementa parser markdown custom con markdown-it-py
3. ✅ Renderer per sintassi base:
   - Blanks: `[[answer]]`
   - Variables: `${var}{config}`
   - Math inline: `` `x^2` ``
4. ✅ Post-processing HTML (BeautifulSoup):
   - Attributi `{.class(attr="val")}`
   - Goals extraction
5. ✅ Testing su corsi di esempio
6. ✅ Documentazione sintassi markdown

**Deliverable:** Script CLI che converte `content.md` → JSON strutturato

---

### **Phase 2: Build System (1-2 settimane)**
**Obiettivo:** Pipeline di build automatizzata

7. ✅ Setup Invoke tasks (`tasks.py`)
8. ✅ Task: SCSS compilation (libsass)
9. ✅ Task: TypeScript bundling (esbuild)
10. ✅ Task: Course parsing (integra Phase 1)
11. ✅ Task: SVG icons sprite generation
12. ✅ Watch mode per development
13. ✅ Cache system (evita rebuild inutili)

**Deliverable:** `invoke build --all` genera `public/` completo

---

### **Phase 3: Server Base (2 settimane)**
**Obiettivo:** Server funzionante che serve corsi

14. ✅ Setup FastAPI app base
15. ✅ Jinja2 templates per course rendering
16. ✅ Route: `/course/{course_id}/{section_id}`
17. ✅ Course loader con caching
18. ✅ Static file serving (`/public`)
19. ✅ i18n detection (subdomain o query param)
20. ✅ Development server con auto-reload

**Deliverable:** Server che serve corsi HTML parsati, senza auth

---

### **Phase 4: Componenti Interattivi (3-4 settimane)**
**Obiettivo:** Frontend interattivo funzionante

21. ✅ Setup Lit + esbuild per componenti
22. ✅ Componente `x-step`:
    - Goal tracking
    - Observable model
    - Progress events
23. ✅ Componente `x-blank`:
    - Text input con validazione
    - Multiple choice variant
24. ✅ Componente `x-variable`:
    - Slider interattivo
    - Binding a model
25. ✅ Sistema di reveal (mostra contenuto al completamento goals)
26. ✅ MathJax integration (client-side)
27. ✅ Testing interazioni base

**Deliverable:** Corso navigabile con blanks e sliders funzionanti

---

### **Phase 5: Auth & Persistence (2 settimane)**
**Obiettivo:** User accounts e salvataggio progressi

28. ✅ MongoDB setup + Beanie models
29. ✅ User model (email, password, progress)
30. ✅ Password hashing (passlib + bcrypt)
31. ✅ Session management (fastapi-sessions)
32. ✅ Routes: `/login`, `/register`, `/logout`
33. ✅ OAuth con Authlib:
    - Google provider
    - GitHub provider (opzionale)
34. ✅ API: `POST /api/course/{id}/{section}/progress`
35. ✅ API: `GET /api/course/{id}/{section}/progress`
36. ✅ Frontend: salvataggio automatico progressi

**Deliverable:** Sistema auth completo con persistenza MongoDB

---

### **Phase 6: Advanced Features (2-3 settimane)**
**Obiettivo:** Feature avanzate

37. ✅ Full-text search:
    - Index generation da courses
    - Search API endpoint
    - Frontend search UI
38. ✅ Dashboard utente:
    - Lista corsi con progress
    - Statistics
39. ✅ Componenti aggiuntivi:
    - `x-gallery` (image carousel)
    - `x-video` (video player)
    - `x-sortable` (drag-and-drop)
40. ✅ Analytics tracking:
    - Goal completions
    - Time spent per step
41. ✅ Admin panel (opzionale):
    - User management
    - Course statistics

**Deliverable:** Piattaforma completa con funzionalità avanzate

---

### **Phase 7: Production Ready (1-2 settimane)**
**Obiettivo:** Deploy e optimizations

42. ✅ Docker setup (multi-stage build)
43. ✅ Production config (env vars, secrets)
44. ✅ CDN integration per assets statici
45. ✅ Performance optimizations:
    - Gzip/Brotli compression
    - Cache headers
    - Lazy loading images
46. ✅ Security hardening:
    - CSRF protection
    - Rate limiting
    - Input sanitization
47. ✅ Monitoring setup (Sentry, logs)
48. ✅ Deploy su cloud provider (Railway, Fly.io, AWS)

**Deliverable:** Sistema production-ready deployato

---

## Esempio Minimo - Parser Custom

```python
# build/parser.py
import re
from markdown_it import MarkdownIt
from markdown_it.token import Token
from bs4 import BeautifulSoup
import yaml
from typing import Dict, List, Any

class MathigonParser:
    """Parser per markdown con sintassi custom Mathigon"""

    def __init__(self):
        self.md = MarkdownIt('commonmark', {'html': True})
        self.blank_counter = 0
        self.variable_counter = 0

    def parse_course(self, content: str, locale: str = 'en') -> Dict[str, Any]:
        """
        Parsa un corso completo da markdown a JSON strutturato

        Args:
            content: Contenuto markdown del corso
            locale: Locale per i18n

        Returns:
            Dict con structure: {sections: [...], metadata: {...}}
        """
        # Reset counters
        self.blank_counter = 0
        self.variable_counter = 0

        # Split in steps (divisi da ---)
        steps_raw = re.split(r'\n---\n', content)
        steps = []

        for idx, step_content in enumerate(steps_raw):
            if not step_content.strip():
                continue

            # Parse YAML metadata (righe che iniziano con >)
            metadata = {}
            md_content = step_content

            if step_content.strip().startswith('>'):
                lines = step_content.split('\n')
                yaml_lines = []
                md_lines = []
                in_yaml = True

                for line in lines:
                    if in_yaml and line.startswith('>'):
                        yaml_lines.append(line[1:].strip())
                    else:
                        in_yaml = False
                        md_lines.append(line)

                if yaml_lines:
                    metadata = yaml.safe_load('\n'.join(yaml_lines)) or {}
                md_content = '\n'.join(md_lines)

            # Pre-process custom syntax
            md_content = self._preprocess_custom_syntax(md_content)

            # Render markdown to HTML
            html = self.md.render(md_content)

            # Post-process HTML
            html, goals = self._postprocess_html(html)

            step_id = metadata.get('id', f'step-{idx}')

            steps.append({
                'id': step_id,
                'html': html,
                'goals': goals,
                'metadata': metadata
            })

        return {
            'sections': [{
                'id': 'main',
                'title': 'Main Section',
                'steps': steps
            }],
            'locale': locale
        }

    def _preprocess_custom_syntax(self, content: str) -> str:
        """Pre-processa sintassi custom prima del rendering markdown"""
        # Blanks: [[answer]] o [[choice1|choice2]]
        content = self._parse_blanks(content)

        # Variables: ${a}{a|2|-8,8,2}
        content = self._parse_variables(content)

        # Block attributes: :::div.classname
        content = self._parse_block_syntax(content)

        return content

    def _parse_blanks(self, content: str) -> str:
        """
        Converte [[answer]] in <x-blank>

        Esempi:
        - [[answer]] → <x-blank id="blank-0" data-solution="answer"></x-blank>
        - [[a|b|c]] → <x-blank id="blank-1" data-choices="a|b|c"></x-blank>
        """
        def replace_blank(match):
            answers = match.group(1)
            blank_id = f'blank-{self.blank_counter}'
            self.blank_counter += 1

            if '|' in answers:
                # Multiple choice
                return f'<x-blank id="{blank_id}" data-choices="{answers}"></x-blank>'
            else:
                # Single answer
                return f'<x-blank id="{blank_id}" data-solution="{answers}"></x-blank>'

        return re.sub(r'\[\[([^\]]+)\]\]', replace_blank, content)

    def _parse_variables(self, content: str) -> str:
        """
        Converte ${a}{a|2|-8,8,2} in <x-variable>

        Formato: ${display}{bind|initial|min,max,step}
        """
        pattern = r'\$\{([^}]+)\}\{([^}]+)\}'

        def replace_variable(match):
            display = match.group(1)
            config = match.group(2)

            var_id = f'var-{self.variable_counter}'
            self.variable_counter += 1

            # Parse config: "a|2|-8,8,2"
            parts = config.split('|')
            bind = parts[0] if len(parts) > 0 else display
            initial = parts[1] if len(parts) > 1 else '0'
            range_str = parts[2] if len(parts) > 2 else '-10,10,1'

            min_val, max_val, step = range_str.split(',')

            return (
                f'<x-variable id="{var_id}" '
                f'bind="{bind}" '
                f'initial="{initial}" '
                f'min="{min_val}" '
                f'max="{max_val}" '
                f'step="{step}">'
                f'</x-variable>'
            )

        return re.sub(pattern, replace_variable, content)

    def _parse_block_syntax(self, content: str) -> str:
        """
        Converte :::div.class\ncontenuto\n::: in <div class="class">contenuto</div>
        """
        lines = content.split('\n')
        output_lines = []
        stack = []

        for line in lines:
            if line.startswith(':::'):
                if line.strip() == ':::':
                    # Chiusura
                    if stack:
                        tag = stack.pop()
                        output_lines.append(f'</{tag}>')
                else:
                    # Apertura: :::div.class1.class2(attr="val")
                    tag_spec = line[3:].strip()
                    tag_name, attrs = self._parse_tag_spec(tag_spec)
                    stack.append(tag_name)
                    output_lines.append(f'<{tag_name} {attrs}>'.strip())
            else:
                output_lines.append(line)

        return '\n'.join(output_lines)

    def _parse_tag_spec(self, spec: str) -> tuple[str, str]:
        """
        Parse tag specification: div.class1.class2(attr="val")
        Returns: (tag_name, attributes_string)
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

    def _postprocess_html(self, html: str) -> tuple[str, List[str]]:
        """
        Post-processa HTML per:
        - Aggiungere attributi inline: {.class(attr="val")}
        - Estrarre goals (ID di elementi interattivi)
        """
        soup = BeautifulSoup(html, 'html.parser')

        # Extract goals
        goals = []
        for blank in soup.find_all('x-blank'):
            if blank.get('id'):
                goals.append(blank['id'])
        for variable in soup.find_all('x-variable'):
            if variable.get('id'):
                goals.append(variable['id'])

        # Process inline attributes {.class(attr="val")} text
        # Questa è una semplificazione - implementazione completa richiede parsing più sofisticato
        html_str = str(soup)
        html_str = self._parse_inline_attributes(html_str)

        return html_str, goals

    def _parse_inline_attributes(self, html: str) -> str:
        """
        Parse inline attributes: {.class1.class2(attr="val")} text
        Converte in: <span class="class1 class2" attr="val">text</span>
        """
        pattern = r'\{([^}]+)\}\s*([^{<\n]+)'

        def replace_attr(match):
            attrs_spec = match.group(1)
            text = match.group(2).strip()

            # Parse classes
            classes = re.findall(r'\.([a-zA-Z0-9_-]+)', attrs_spec)

            # Parse attributes
            attr_match = re.search(r'\(([^)]+)\)', attrs_spec)

            attrs = []
            if classes:
                attrs.append(f'class="{" ".join(classes)}"')
            if attr_match:
                attrs.append(attr_match.group(1))

            attrs_str = ' '.join(attrs)
            return f'<span {attrs_str}>{text}</span>'

        return re.sub(pattern, replace_attr, html)


# ===== Usage Example =====
if __name__ == '__main__':
    parser = MathigonParser()

    sample_markdown = """
> id: intro
> title: Introduction to Algebra

# Welcome to Algebra

Fill in the blank: The value of `x` in `2x = 10` is [[5]].

Adjust the slider: ${a}{a|2|-5,5,1}

The equation is `x^2 + ${a}x + 1 = 0`.

---

> id: equations
> title: Solving Equations

Choose the correct answer: `2 + 2 =` [[3|4|5]]

:::div.highlight
This is a highlighted box.
:::
"""

    result = parser.parse_course(sample_markdown)

    import json
    print(json.dumps(result, indent=2, ensure_ascii=False))
```

**Output esempio:**
```json
{
  "sections": [
    {
      "id": "main",
      "title": "Main Section",
      "steps": [
        {
          "id": "intro",
          "html": "<h1>Welcome to Algebra</h1>\n<p>Fill in the blank: The value of <math>x</math> in <math>2x = 10</math> is <x-blank id=\"blank-0\" data-solution=\"5\"></x-blank>.</p>\n<p>Adjust the slider: <x-variable id=\"var-0\" bind=\"a\" initial=\"2\" min=\"-5\" max=\"5\" step=\"1\"></x-variable></p>\n<p>The equation is <math>x^2 + <x-variable bind=\"a\"></x-variable>x + 1 = 0</math>.</p>",
          "goals": ["blank-0", "var-0"],
          "metadata": {
            "id": "intro",
            "title": "Introduction to Algebra"
          }
        },
        {
          "id": "equations",
          "html": "<h1>Solving Equations</h1>\n<p>Choose the correct answer: <math>2 + 2 =</math> <x-blank id=\"blank-1\" data-choices=\"3|4|5\"></x-blank></p>\n<div class=\"highlight\">\n<p>This is a highlighted box.</p>\n</div>",
          "goals": ["blank-1"],
          "metadata": {
            "id": "equations",
            "title": "Solving Equations"
          }
        }
      ]
    }
  ],
  "locale": "en"
}
```

---

## Conclusioni

### Stack Finale Raccomandato

**Backend:**
- **Framework**: FastAPI (async, performance, OpenAPI)
- **Database**: MongoDB + Beanie (ODM)
- **Auth**: Authlib (OAuth 2.0) + passlib (bcrypt)
- **Template**: Jinja2

**Frontend:**
- **Componenti**: Lit (Web Components leggeri)
- **Build**: esbuild (bundling TS/JS)
- **Styles**: Sass + PostCSS
- **Math**: MathJax 3 (client-side)

**Build System:**
- **Orchestration**: Invoke (Python task runner)
- **Markdown**: markdown-it-py + custom renderer
- **Assets**: libsass, esbuild, image optimization

**Deployment:**
- **Container**: Docker (multi-stage)
- **Server**: Uvicorn + Gunicorn workers
- **Static**: CDN (CloudFlare, AWS CloudFront)
- **Platform**: Railway, Fly.io, o AWS ECS

### Vantaggi rispetto a Mathigon

1. **Unificazione linguaggio backend**: Python per tutto il backend (vs Node.js)
2. **FastAPI**: OpenAPI integrata, validazione Pydantic automatica
3. **Beanie ODM**: Type-safe, async-native
4. **Flessibilità deploy**: Python ha più opzioni cloud-native

### Svantaggi / Trade-offs

1. **Node dependency**: Necessario per esbuild (accettabile come dev dependency)
2. **Ecosistema frontend**: JavaScript rimane necessario per Web Components
3. **Math rendering**: Più complesso lato server (MathJax richiede Node o client-side)

### Prossimi Passi

1. **Prototipo Phase 1**: Implementa parser base + test su 1-2 corsi
2. **Valida approccio**: Verifica che soddisfi requisiti funzionali
3. **Iterazione incrementale**: Segui roadmap fase per fase
4. **Community**: Considera rilascio open-source quando stabile

---

**Domande? Approfondimenti su fasi specifiche?**
