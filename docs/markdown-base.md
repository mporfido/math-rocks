# Markdown standard

Tutto il markdown consueto funziona. Qui solo ciò che ha una particolarità in
questa piattaforma.

## Titoli, testo, liste

```markdown
# H1 — titolo dello step
## H2 — sottotitolo
### H3 — sezione

**grassetto**  *corsivo*  ***entrambi***  ~~barrato~~  `codice inline`

- Item
- Item
  - Sub-item

1. Primo
2. Secondo
```

> ⚠️ Non usare `---` per una linea orizzontale: separa gli step. Usa `***`.

## Link

```markdown
[Testo link](https://example.com)
```

I link interni al sito seguono la struttura delle route:
`/course/<corso>/<lezione>/<step>`.

## Immagini

```markdown
![Alt text](path/to/image.png)
```

**Ridimensionamento** (sintassi Obsidian) — una pipe dopo l'alt:

```markdown
![Alt|400](image.png)        <!-- larghezza 400px, altezza proporzionale -->
![Alt|400x300](image.png)    <!-- larghezza 400px, altezza 300px -->
```

## Citazioni

```markdown
> Questa è una citazione
> su più righe
```

Attenzione: in **cima a uno step** le righe `>` sono i metadata, non una
citazione (vedi [struttura.md](struttura.md)). Per citare in apertura, metti
prima una riga di testo.

## Blocchi di codice

````markdown
```python
def hello():
    print("Hello World!")
```
````

I blocchi di codice — e il codice inline non matematico — sono **letterali**: la
sintassi custom al loro interno (`[[5]]`, `${a}{…}`, `:::graph`) non viene
convertita in componenti. È quello che permette di documentare la sintassi
dentro un corso.

> ⚠️ Non inserire una riga `---` isolata dentro un blocco di codice: verrebbe
> comunque interpretata come separatore di step.

Per mostrare un fence dentro un fence, usa più backtick all'esterno (quattro o
cinque): è così che sono scritti i pannelli `:::details.syntax-doc`.

## Tabelle

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

Dentro le celle funzionano i blank testuali `[[5]]` e le variabili
`${x}{x|1|input}`, **ma non** le scelte multiple `[[a|*b|c]]`: le loro pipe
verrebbero lette come divisori di cella. Per quelle — e per le frecce fra una
riga e l'altra — serve [tabelle.md](tabelle.md).

## HTML

I tag HTML passano attraverso il parser. Serve soprattutto per `<summary>` nei
blocchi `details` (vedi [blocchi.md](blocchi.md)) e per i casi che il markdown
non copre.

---

**Vedi anche**: [matematica.md](matematica.md) per le formule ·
[tabelle.md](tabelle.md) per le tabelle con frecce · [blocchi.md](blocchi.md)
per i box e i pannelli a scomparsa.

**Nel corso demo**: `content/esempi/content-7.md` — step `media-e-suggerimenti`.
