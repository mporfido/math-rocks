# Piattaforma Corsi Interattivi

Una piattaforma web per creare e pubblicare corsi interattivi di matematica (e altre materie) con esercizi, visualizzazioni dinamiche e validazione automatica.

## Direzione e Filosofia

> Questa sezione è il riferimento per ogni decisione di struttura o di
> filosofia di implementazione. In caso di dubbio su "dove va una cosa" o "che
> approccio scegliere", la risposta si deriva da qui.

**Cos'è il progetto.** Concettualmente è un **generatore di siti statici (SSG)
per corsi interattivi**: i contenuti in markdown vengono compilati
(`build_courses.py` → JSON) e l'app Flask viene congelata in HTML statico
(`freeze.py`, Frozen-Flask) e pubblicata su GitHub Pages. Stesso modello mentale
di Hugo / Jekyll / MkDocs.

**Il confine che tiene tutto in ordine: engine vs istanza.**
- **Engine / framework** (ciò che un domani diventerà open source): `parser/`,
  `routes/`, `templates/`, `static/components/`, `build_courses.py`,
  `freeze.py`. Codice che *non* sa nulla di un sito specifico.
- **Istanza / il "tuo" sito**: `content/` (i contenuti) + `site.yaml` (nome,
  titolo, footer, lingua, prefisso storage, flag `math`, font) + il tema
  `static/theme.css` (design token: colori, tipografia, forma).
  Sono i dati che *tu* fornisci all'engine.
- **Output**: sito statico pubblicato.

La regola pratica: il codice engine non deve mai contenere stringhe o scelte
specifiche di *questo* sito; quelle vivono nell'istanza.

**Principi.**
1. **Static-first, backend additivo.** Restare statici non chiude porte: un
   eventuale backend (vedi *Future Enhancements*) è un *livello opzionale
   futuro*, non una riscrittura.
2. **Progressi lato client.** Oggi i progressi possono stare nel `localStorage`
   del browser (vedi `progress.js`): tracciamento con zero backend e compatibile
   con GitHub Pages. Il backend serve solo quando si vorranno progressi
   condivisi multi-dispositivo / multi-utente.
3. **Decisioni reversibili e a basso costo.** Si preferisce la soluzione più
   semplice che non pregiudica l'evoluzione, rimandando complessità e dipendenze
   a quando servono davvero.

**Fase attuale.** Priorità su **creazione di contenuti** e piccole migliorie
della piattaforma; i contenuti sono committati e pubblicati su GitHub Pages.
L'apertura open source come framework e l'eventuale backend (auth, salvataggio
progressi, analytics) sono obiettivi *futuri*, non vincoli di oggi.

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
├── config.py                   # Configurazione (engine)
├── site.yaml                   # Config di istanza (testi sito, tema, math)
├── site_config.py              # Lettore di site.yaml (usato anche dalla build)
├── build_courses.py            # Script per build corsi
├── requirements.txt            # Dipendenze Python
│
├── parser/
│   ├── markdown_parser.py      # Parser markdown custom
│   └── preprocessors.py        # Preprocessori sintassi
│
├── routes/
│   ├── courses.py              # Routes Flask per corsi
│   └── tools.py                # Routes per le pagine-strumento (/tools/...)
│
├── templates/
│   ├── base.html               # Template base
│   ├── _assets.html            # Macro asset condivisi (librerie + componenti)
│   ├── home.html               # Homepage
│   ├── course.html             # Visualizzatore corso
│   ├── lesson.html             # Visualizzatore step
│   ├── tools.html              # Elenco strumenti
│   └── tool.html               # Pagina di uno strumento
│
├── static/
│   ├── components/
│   │   ├── blank.js            # Web Component input
│   │   ├── variable.js         # Web Component slider
│   │   └── step.js             # Web Component container
│   ├── tools/
│   │   ├── expr.js             # Implementazione della pagina-strumento `expr`
│   │   └── algebra.js          # …e della pagina-strumento `algebra`
│   ├── style.css               # Stili globali
│   └── components.css          # Stili componenti
│
├── docs/                       # Sintassi dei corsi, un file per argomento
│   └── README.md               # Indice: "cosa cerchi → quale file"
│
├── content/                    # Corsi sorgente (markdown)
│   ├── tools.yaml              # Strumenti esposti dal sito (istanza)
│   └── esempi/
│       ├── content-1.md        # Una lezione per file
│       └── metadata.yaml       # Metadati
│
└── courses_data/               # JSON generati (auto-generated)
    └── esempi.json
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

### 3. Crea content-1.md

Vedi [docs/](docs/README.md) per la sintassi completa.

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

Un assaggio:

```markdown
Risposta: `x =` [[5]]                      <!-- casella da completare -->
Scegli: [[opzione1|*corretta|opzione3]]    <!-- scelta multipla -->
Muovi: ${a}{a|2|-5,5,1}                    <!-- slider, valore in ${a} -->

:::div.reveal
Appare quando tutti gli esercizi dello step sono completati.
:::
```

**Il riferimento completo è in [`docs/`](docs/README.md)**: un file per
argomento, tutti sotto le 300 righe, così si apre solo quello che serve.

| | |
| --- | --- |
| [struttura](docs/struttura.md) | corso, lezione, step |
| [blanks](docs/blanks.md) | caselle e scelte multiple |
| [variabili](docs/variabili.md) | slider, campi numerici, calcoli live |
| [grafici](docs/grafici.md) · [esempi](docs/grafici-esempi.md) | piano cartesiano |
| [p5](docs/p5.md) | sketch e simulazioni |
| [espressioni](docs/espressioni.md) | "Sciogliamo i nodi", proprietà delle potenze |
| [tabelle](docs/tabelle.md) | tabelle con frecce |
| [formula](docs/formula.md) | formula commentata |
| [blocchi](docs/blocchi.md) | box, reveal, suggerimenti |
| [matematica](docs/matematica.md) · [markdown](docs/markdown-base.md) | formule e testo |
| [ricette](docs/ricette.md) | lezione completa, buone abitudini, troubleshooting |

Il corso **`esempi`** (`/course/esempi`) è la vetrina eseguibile: ogni costrutto
documentato ha almeno uno step che lo mostra dal vivo, con la sua sintassi in un
pannello a scomparsa.

## Strumenti (componenti a pagina intera)

Alcuni componenti sono utili anche **fuori da un corso**: `/tools/<id>/` li apre
a pagina intera e li configura con i **parametri dell'indirizzo**, così un link
è già una scheda di esercizi pronta da condividere con la classe.

```
/tools/espressioni/?ex=(4%20%2B%205*4)%20-%20(8%3A2%20%2B%206)&ex=2%2B2&titolo=Compiti
/tools/potenze/?ex=2%5E3*2%5E4&mode=powers&noeval=1
/tools/equazioni/?eq=2x%2B3%3D8&eq=5x%2B4-2x%3D9&forma=ax%3Db
```

Non serve costruire quegli indirizzi a mano: **ogni pagina-strumento contiene un
costruttore** ("Componi una scheda e ottieni il link") con un campo per le
espressioni, le opzioni e il bottone *Copia*.

Il link copiato è quello **per gli studenti**: porta il parametro `noeditor=1`,
quindi chi lo apre trova solo la scheda da svolgere, senza il costruttore. Non è
una protezione (l'indirizzo dello strumento resta pubblico), è un modo di non
mettere davanti alla classe un pannello che non le serve.

Parametri dello strumento `espressioni` / `potenze` (kind `expr`):

| Parametro | Significato |
|---|---|
| `ex` | un'espressione; ripetibile (`?ex=…&ex=…`) o con più voci separate da `\|` |
| `mode=powers` | le potenze restano simboliche e si riducono con le loro proprietà |
| `noeval=1` | (solo con `mode=powers`) vieta la valutazione numerica delle potenze |
| `steps=1` | mostra anche lo svolgimento classico |
| `titolo` | titolo della scheda |
| `noeditor=1` | pagina "per gli studenti": mostra solo la scheda, nasconde il costruttore |

Parametri dello strumento `equazioni` (kind `algebra`, la lavagna delle mosse —
[docs/algebra.md](docs/algebra.md) per il dettaglio):

| Parametro | Significato |
|---|---|
| `eq` | un'equazione; ripetibile o con più voci separate da `\|` |
| `isola`, `forma`, `incognita` | il traguardo della scheda (`forma`: `ax=b`, `normale`, `ridotta`) |
| `libera=1` | nessun traguardo: la lavagna si muove e non si chiude |
| `mosse` | gli id di mossa abilitati, separati da `;` |
| `titolo`, `noeditor=1` | come sopra |

**Quali strumenti compaiono** lo decide l'istanza in `content/tools.yaml` (id,
titolo, descrizione, valori di partenza). L'engine fornisce le route, il
template `tool.html` e un'implementazione per `kind` in `static/tools/<kind>.js`;
i `kind` ammessi sono in whitelist in `tools_config.py`. Se `content/tools.yaml`
manca, la sezione — e la voce di menu — semplicemente non esiste.

Due conseguenze del modello static-first:

- I parametri li legge il **browser**, non Flask: Frozen-Flask congela i
  percorsi, non le query string. Le pagine-strumento funzionano identiche in
  locale e su GitHub Pages.
- Una pagina-strumento **non carica `progress.js`**: una scheda condivisa via
  link non tocca i progressi salvati dei corsi.

Poiché l'espressione può arrivare da un link (e non più solo dal markdown di un
autore), viene validata prima di essere montata — caratteri ammessi, parentesi
bilanciate, lunghezze — e il componente ha comunque i propri limiti interni su
cifre ed esponenti.

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
# Imposta SECRET_KEY prima di avviare; create_app() usa di default la
# config di produzione (debugger disattivato).
export SECRET_KEY="una-chiave-lunga-e-casuale"
gunicorn -w 4 -b 0.0.0.0:5000 'app:create_app()'
```

### Test parser

```bash
# Testa parser su file specifico
python parser/markdown_parser.py content/corso/content.md
```

## Pubblicazione su GitHub Pages

L'app è read-only (tutta l'interattività gira nel browser), quindi può essere
esportata come sito statico e pubblicata gratis su GitHub Pages.

Il deploy è **automatico**: ad ogni push su `master`, il workflow
`.github/workflows/pages.yml` compila i corsi, congela l'app con
[Frozen-Flask](https://pypi.org/project/Frozen-Flask/) e pubblica il risultato.

**Passo manuale una-tantum** (nelle impostazioni del repo su GitHub):
*Settings → Pages → Build and deployment → Source = "GitHub Actions"*.
Senza questo, il deploy del workflow fallisce.

**Anteprima locale** (opzionale, prima di pubblicare):

```bash
python build_courses.py && python freeze.py
python -m http.server 8000 --directory build
# apri http://localhost:8000/
```

L'output statico finisce in `build/` (gitignorato: lo rigenera la CI, non va
committato). Vengono pubblicati solo i corsi tracciati dal repo.

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
