# Struttura: corso, lezione, step

Tre livelli, tre file diversi: una **cartella** è un corso, un **file** è una
lezione, un blocco fra due `---` è uno step.

## Corso = una cartella in `content/`

```
content/
├── esempi/
│   ├── metadata.yaml      # metadati del CORSO
│   ├── content-1.md       # lezione 1
│   └── content-2.md       # lezione 2
```

`metadata.yaml` del corso:

```yaml
title: Esempi
description: Raccolta di lezioni dimostrative.
level: beginner
color: "#c0562f"        # opzionale: accento grafico del corso
progression: free       # free (default) | sequential
```

- `progression: free` — le lezioni si aprono in qualsiasi ordine.
- `progression: sequential` — ogni lezione si sblocca completando la precedente.

L'ordine dei corsi in homepage si decide in `content/sections.yaml`: i corsi non
elencati finiscono in "Altri corsi".

> ℹ️ Solo i corsi dimostrativi (`content/esempi/` e `content/esempio-*/`) sono
> tracciati da git; gli altri corsi in `content/` restano locali (vedi `.gitignore`).

## Lezione = un file `content-N.md`

L'ordine segue il numero nel nome del file. In cima, un **front-matter di
lezione**: righe `>` *senza corpo*, seguite da `---`. Non è uno step.

```markdown
> id: algebra                       # opzionale; default = nome file ("content-1")
> title: Introduzione all'Algebra
> description: Le basi dell'algebra.

---

> id: intro
> title: Benvenuto

# Primo step della lezione…
```

## Step = un blocco fra due `---`

Ogni step comincia con i suoi metadata (righe `>`), poi il contenuto.

```markdown
> id: step1
> title: Primo Step

Contenuto…

---

> id: step2
> title: Secondo Step

Altro contenuto…
```

**Campi disponibili:**

| Campo | Significato |
| --- | --- |
| `id` | Identificativo univoco dello step (obbligatorio). Compare nell'URL: `/course/<corso>/<lezione>/<step>` |
| `title` | Titolo mostrato nella sidebar |
| `description` | Sottotitolo, opzionale |
| `use-mathjs: true` | Carica mathjs nello step: serve alle funzioni matematiche nei calcoli live e nelle condizioni di `check` (vedi [matematica.md](matematica.md)) |

Altri campi custom sono ammessi e restano nel JSON compilato.

> ⚠️ Una riga `---` isolata separa gli step **sempre**, anche dentro un blocco
> di codice. Se ti serve una linea orizzontale nel testo, usa `***`.

## Errori tipici

| Sintomo | Causa |
| --- | --- |
| Uno step non compare | Manca l'`id`, o la riga `---` non è isolata (deve avere righe vuote attorno) |
| I metadata finiscono nel testo | Le righe `>` devono stare **prima** del contenuto, senza righe vuote in mezzo |
| Il front-matter diventa uno step | Manca il `---` che lo chiude, oppure ha del corpo sotto le righe `>` |
| I progressi di uno step si azzerano | Hai cambiato l'`id` dello step, o aggiunto elementi interattivi prima di quelli esistenti: i progressi sono indicizzati per id |

---

**Vedi anche**: [ricette.md](ricette.md) per una lezione completa da copiare ·
[blocchi.md](blocchi.md) per il contenuto che appare a step completato.

**Nel corso demo**: ogni file di `content/esempi/` — il front-matter in cima e i
metadata di ciascuno step.
