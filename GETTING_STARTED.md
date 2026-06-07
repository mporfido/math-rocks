# Getting Started - Guida Rapida

Benvenuto! Questa guida ti aiuterà ad avviare la piattaforma in 5 minuti.

## ✅ Setup Completato

L'MVP della piattaforma è già configurato e pronto all'uso!

## 🚀 Avvio Rapido

### 1. Attiva Virtual Environment

```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Avvia il Server

```bash
python app.py
```

Il server sarà disponibile su: **http://localhost:5000**

### 3. Apri nel Browser

Visita http://localhost:5000 e vedrai:
- Homepage con lista corsi
- Corso esempio "Introduzione all'Algebra"

### 4. Esplora il Corso

Clicca su "Inizia il corso" per provare:
- ✅ Input interattivi (blanks)
- ✅ Slider variabili
- ✅ Rendering formule matematiche
- ✅ Reveal content al completamento goals
- ✅ Navigazione tra step

## 📝 Creare un Nuovo Corso

### 1. Crea Directory

```bash
mkdir content/nome-corso
```

### 2. Aggiungi Metadata

Crea `content/nome-corso/metadata.yaml`:

```yaml
title: Il Mio Corso
description: Descrizione del corso
level: beginner
duration: 30 minuti
```

### 3. Scrivi il Contenuto

Crea `content/nome-corso/content.md`:

```markdown
> id: intro
> title: Introduzione

# Benvenuto!

Quanto fa 2 + 2? [[4]]

---

> id: variabili
> title: Variabili

Muovi lo slider: ${x}{x|0|-10,10,1}

Il valore è ${x}.

:::div.reveal
Ottimo lavoro!
:::
```

### 4. Genera JSON

```bash
python build_courses.py nome-corso
```

### 5. Visualizza

Ricarica http://localhost:5000 e vedrai il nuovo corso!

## 🎨 Sintassi Markdown

### Blanks (Input)

```markdown
Risposta: [[soluzione]]
Scelta multipla: [[a|b|c]]
```

### Variables (Slider)

```markdown
${a}{a|valore_iniziale|min,max,step}

Esempio: ${x}{x|5|0,10,1}
```

### Math

```markdown
Inline: `x^2 + y^2 = r^2`
Display: $$\int_0^1 f(x) dx$$
```

### Reveal Content

```markdown
:::div.reveal
Appare dopo completamento goals
:::
```

### Highlight

```markdown
:::div.highlight
Box evidenziato
:::
```

Per la sintassi completa: **[MARKDOWN_SYNTAX.md](MARKDOWN_SYNTAX.md)**

## 📂 Struttura File

```
math-rocks/
├── content/              ← Aggiungi corsi qui (markdown)
├── courses_data/         ← JSON generati automaticamente
├── static/               ← CSS e JavaScript
│   └── components/       ← Web Components
├── templates/            ← Template HTML
└── app.py               ← Avvia server
```

## 🔧 Comandi Utili

```bash
# Build tutti i corsi
python build_courses.py

# Build singolo corso
python build_courses.py nome-corso

# Avvia server
python app.py

# Test parser
python parser/markdown_parser.py content/corso/content.md
```

## 🎯 Prossimi Passi

### Personalizza il Corso Esempio

1. Modifica `content/esempio-algebra/content.md`
2. Rigenera: `python build_courses.py esempio-algebra`
3. Ricarica pagina

### Crea il Tuo Primo Corso

1. Segui la sezione "Creare un Nuovo Corso" sopra
2. Sperimenta con blanks e sliders
3. Aggiungi formule matematiche

### Esplora Funzionalità Avanzate

- Leggi [MARKDOWN_SYNTAX.md](MARKDOWN_SYNTAX.md) per sintassi completa
- Leggi [README.md](README.md) per documentazione dettagliata
- Personalizza stili in `static/style.css`

## ❓ Problemi Comuni

### Server non si avvia

```bash
# Verifica che il virtualenv sia attivo
which python  # Dovrebbe puntare a venv/

# Reinstalla dipendenze
pip install -r requirements.txt
```

### Corso non appare

```bash
# Rigenera JSON
python build_courses.py

# Verifica che il JSON esista
ls courses_data/
```

### Componenti non funzionano

- Apri Developer Console nel browser (F12)
- Controlla errori JavaScript
- Verifica che i file .js siano caricati

### Math non renderizza

- Attendi qualche secondo (MathJax carica da CDN)
- Controlla sintassi LaTeX
- Verifica connessione internet

## 📚 Risorse

- **README.md** - Documentazione completa
- **MARKDOWN_SYNTAX.md** - Guida sintassi
- **CLAUDE.md** - Istruzioni progetto
- **GUIDA_PRATICA_PYTHON.md** - Guida tecnica dettagliata

## 💡 Suggerimenti

1. **Inizia Semplice**: Crea un corso con 2-3 step base
2. **Testa Spesso**: Rigenera JSON dopo ogni modifica
3. **Usa Console**: F12 nel browser per vedere errori
4. **Leggi Esempi**: Studia `esempio-algebra/content.md`

## 🎉 Sei Pronto!

Hai tutto quello che serve per creare corsi interattivi fantastici.

**Inizia ora:**
1. Avvia il server: `python app.py`
2. Apri http://localhost:5000
3. Prova il corso esempio
4. Crea il tuo primo corso!

Buon divertimento! 🚀
