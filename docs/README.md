# Sintassi dei corsi — indice

Riferimento completo della sintassi markdown estesa con cui si scrivono i corsi.
Un file per argomento: apri solo quello che ti serve.

**Il corso `esempi`** (`content/esempi/`, visibile su `/course/esempi`) è la
vetrina eseguibile di tutto ciò che è documentato qui: ogni costrutto ha almeno
uno step che lo mostra dal vivo, con la sua sintassi in un pannello a scomparsa.
Ogni pagina di questo indice chiude indicando lo step corrispondente.

## Cosa cerchi → quale file

| Se vuoi… | Leggi |
| --- | --- |
| capire come si organizzano corso, lezioni e step | [struttura.md](struttura.md) |
| far scrivere una risposta o scegliere fra opzioni | [blanks.md](blanks.md) |
| uno slider, un campo numerico, un calcolo che si aggiorna | [variabili.md](variabili.md) |
| un piano cartesiano: curve, punti da trascinare, punti legati a variabili | [grafici.md](grafici.md) |
| un grafico già pronto da copiare per uno scenario tipico | [grafici-esempi.md](grafici-esempi.md) |
| una simulazione o una figura interattiva scritta a mano | [p5.md](p5.md) |
| far sciogliere un'espressione un'operazione per volta | [espressioni.md](espressioni.md) |
| una tabella in cui contano le frecce fra una riga e l'altra | [tabelle.md](tabelle.md) |
| commentare una formula collegandone i pezzi con delle frecce | [formula.md](formula.md) |
| box evidenziati, contenuto che appare a esercizio finito, suggerimenti | [blocchi.md](blocchi.md) |
| scrivere formule LaTeX inline o in display | [matematica.md](matematica.md) |
| titoli, liste, link, immagini ridimensionate, blocchi di codice | [markdown-base.md](markdown-base.md) |
| una lezione completa da cui partire, o capire perché qualcosa non funziona | [ricette.md](ricette.md) |

## Fuori da questo indice

Due componenti hanno una documentazione propria, perché non sono solo sintassi
ma un modello dati:

- **[DIMOSTRAZIONI.md](../DIMOSTRAZIONI.md)** — il blocco `:::theorem`: passi,
  statuti, modalità, ponte con la figura.
- **[TEORIA.md](../TEORIA.md)** — un *corpus* di teoria (`content/geometria/`)
  come strumento a pagina intera, con il suo grafo dei prerequisiti.

## In una riga

Un **corso** è una cartella in `content/`. Una **lezione** è un file
`content-N.md`. Uno **step** è un pezzo di lezione fra due `---`, con il suo
titolo e i suoi obiettivi: quando tutti gli elementi interattivi dello step sono
completati, i blocchi `:::div.reveal` diventano visibili e lo step è fatto.

Dopo ogni modifica ai sorgenti: `python build_courses.py` (in sviluppo la build
è automatica, vedi il README del progetto).
