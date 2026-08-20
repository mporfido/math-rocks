# Istruzioni per gli agenti

## Direzione del progetto

Prima di prendere decisioni di struttura o di filosofia di implementazione,
leggi la sezione **"Direzione e Filosofia"** in `README.md`.

Il progetto è un generatore di siti statici (SSG) per corsi interattivi:
Markdown → JSON con `build_courses.py`, poi HTML statico con `freeze.py`.
Mantieni sempre un confine netto tra:

- **Engine/framework:** `parser/`, `routes/`, `templates/`,
  `static/components/`, `build_courses.py`, `freeze.py`. Non deve contenere
  stringhe o scelte specifiche di questo sito.
- **Istanza del sito:** `content/`, `site.yaml`, `static/theme.css`. Qui vivono
  contenuti, configurazione e tema specifici del sito.

Preferisci soluzioni static-first, semplici, reversibili e con poche
dipendenze. Un backend è un'aggiunta futura opzionale, non una ragione per
riscrivere l'architettura attuale.

## Mappa rapida del codice

- `app.py`: entry point Flask e registrazione delle route.
- `parser/`: conversione da Markdown con sintassi custom a HTML.
- `routes/`: blueprint Flask per corsi e strumenti.
- `templates/`: template Jinja; `_assets.html` raccoglie gli asset condivisi.
- `static/components/`: Web Components vanilla per gli elementi interattivi.
- `static/sketches/`: sketch p5 riusabili, caricati su richiesta.
- `build_courses.py`: compila i corsi da Markdown a `courses_data/`.
- `build_corpus.py`: compila i corpora teorici in `tools_data/`.
- `freeze.py`: genera l'output HTML statico per la pubblicazione.

## Struttura e contenuti

- I contenuti sorgente sono in `content/<corso>/content-N.md`; i metadati del
  corso sono in `content/<corso>/metadata.yaml`.
- I file in `courses_data/` e `tools_data/` sono output generati: aggiorna i
  rispettivi sorgenti e rigenera l'output quando necessario.
- La sintassi Markdown custom è documentata in `docs/`. Consulta prima
  `docs/README.md`, poi leggi solo il documento pertinente alla modifica.
- `content/esempi/` è la vetrina eseguibile della sintassi documentata;
  `tests/test_docs_coverage.py` ne verifica la copertura.
- Per i corpora teorici, usa `TEORIA.md` e `build_corpus.py`.

## Workflow di verifica

Esegui la verifica proporzionata alla modifica:

```powershell
python build_courses.py
python build_corpus.py
python -m pytest tests/
```

In sviluppo, `python app.py` avvia Flask su `http://localhost:5000`.
La ricompilazione selettiva è automatica; impostare `AUTO_REBUILD=0` la
disabilita.

## Convenzioni

- Mantieni Flask, Jinja e Web Components vanilla: non introdurre framework o
  dipendenze nuove senza una necessità concreta.
- Per una modifica che tocca engine e istanza, verifica che i dettagli del sito
  restino nella configurazione, nei contenuti o nel tema, non nell'engine.
- Non modificare output generati manualmente se possono essere rigenerati dal
  relativo sorgente.
