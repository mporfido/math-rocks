---
name: valuta-lezione
description: Valuta la qualità didattica e tecnica di una o più lezioni (content/[corso]/content-N.md) secondo una griglia a 6 criteri, assegnando un punteggio in decimi e suggerimenti di miglioramento. Usare quando l'utente chiede di "valutare", "dare un punteggio a", "fare la review didattica di", "controllare la qualità di" una lezione o un corso.
---

# Valutazione lezione

Applica questa griglia leggendo direttamente il file `content-N.md` della
lezione (nessuno script di supporto: i conteggi richiesti sono semplici
abbastanza da farli leggendo il testo). Riferimento sintassi: `MARKDOWN_SYNTAX.md`.

Una lezione è una sequenza di **step** separati da `---`, ciascuno introdotto
da righe di metadata `> id: ...`, `> title: ...`. Il primo blocco `>` in cima
al file è il front-matter di lezione, non uno step.

## Griglia (6 criteri, 0–2 punti ciascuno, totale grezzo max 12)

Il totale grezzo su 12 va poi riportato in decimi:
`punteggio finale = totale_grezzo / 12 * 10`, arrotondato a un decimale.

### 1. Numero di step
Conta gli step (blocchi separati da `---`, escluso il front-matter iniziale).
- `< 4` → **0**
- `4–5` → **1**
- `6–8` → **2** (ideale)
- `> 8` → **1.5** (probabile bisogno di split in più lezioni)

### 2. Lunghezza degli step
Per ogni step conta le righe di contenuto non vuote (esclusi i metadata `>`).
- `< 10` righe → troppo corto
- `10–45` righe → adeguato
- `> 60` righe → troppo lungo
(soglie calibrate su `content/numeri-interi/content-1.md`, adattale con buon
senso se il contenuto di uno step è denso ma comunque compatto, es. una
tabella)

Punteggio = quota di step in fascia adeguata:
- `≥ 80%` → **2**
- `50–79%` → **1**
- `< 50%` → **0**

Riporta sempre quali step (per `id`) sono fuori fascia e in che senso.

### 3. Zona di sviluppo prossimale
Per ogni step, individua il/i concetto/i **nuovo/i** introdotto/i e
confrontalo con l'elenco cumulativo dei concetti già visti negli step
precedenti. Uno step è "problematico" se introduce più di un concetto nuovo,
o un concetto senza collegamento esplicito ai precedenti.

Segnali di allarme testuali (supporto alla lettura, non sostituto):
- terminologia o simboli mai visti prima senza frase-ponte ("come abbiamo
  visto", "ricordando che", "allo stesso modo di...")
- uno step che introduce insieme una nuova definizione E una nuova
  procedura/notazione

Punteggio:
- 0 step problematici → **2**
- 1 step problematico → **1**
- ≥ 2 step problematici → **0**

Cita sempre l'`id` dello step e in cosa consiste il salto concettuale.

### 4. `:::details.hint` prima di risposte difficili
Conta le occorrenze di `:::details.hint` e verifica che ciascuna preceda
(entro poche righe) un blank/scelta multipla (`[[...]]`) in uno step
"difficile" (nuovo concetto + blank, vedi criterio 3).

- Nessun hint E la lezione ha almeno uno step oggettivamente difficile →
  **0**
- Hint presente ma mal posizionato o generico/placeholder (es. testo tipo
  "Testo del suggerimento" non specifico) → **1**
- Almeno un hint pertinente e ben posizionato nei punti più difficili →
  **2**

Se la lezione non ha passaggi davvero difficili, l'assenza di hint non
penalizza: assegna **2** di default, annotando esplicitamente il motivo.

### 5. Interattività per step + bonus sketch p5
Per ogni step conta gli elementi interattivi: `[[...]]` (blank/scelta),
`${...}{...}` (variable/slider), `:::p5 ...` (sketch). Uno step senza
nessuno di questi è "passivo".

Base (max 1.5 pt):
- 0 step passivi → **1.5**
- 1 step passivo (tollerato se è lo step di apertura) → **1**
- ≥ 2 step passivi → **0**

Bonus sketch p5 (max 0.5 pt, si somma alla base, totale criterio cappato a 2):
- ≥ 2 occorrenze `:::p5` nell'intera lezione → **+0.5**
- 1 occorrenza → **+0.25**
- 0 occorrenze → **+0**

### 6. Verifica dei prerequisiti nei primi step

Guarda **solo i primi 1–2 step** dopo il front-matter. Cerca almeno un elemento
interattivo (`[[...]]`, `${...}{...}`, `:::p5`) che metta alla prova una
conoscenza **già posseduta** dallo studente e non introdotta dalla lezione
stessa. Non importa da dove venga il prerequisito — lezione precedente, altro
corso, anni scolastici precedenti, o intuizione di buon senso: quello che conta
è che sia il prerequisito **più utile per il seguito della lezione**.

Non conta come verifica di prerequisiti:
- una domanda su un concetto definito poche righe sopra nello stesso step (è
  consolidamento del nuovo, non richiamo del noto);
- un richiamo puramente testuale senza domanda ("ricordiamo che...") — serve un
  elemento interattivo che produca una risposta.

Punteggio:
- Nessuna verifica di prerequisiti nei primi 2 step → **0**
- Richiamo dei prerequisiti presente ma solo testuale, oppure verifica
  interattiva presente ma marginale rispetto a ciò che serve poi nella
  lezione → **1**
- Almeno una verifica interattiva pertinente, su un prerequisito effettivamente
  necessario agli step successivi → **2**

Indica sempre l'`id` dello step controllato, quale prerequisito viene (o non
viene) verificato e — se il punteggio è < 2 — quale prerequisito converrebbe
verificare, visto il contenuto degli step successivi.

## Formato di output (una lezione)

```
## Valutazione: <corso>/<file> (id: <lesson id>)

**Punteggio finale: X.X/10** (totale grezzo Y/12)

| Criterio | Punti | Osservazione |
|---|---|---|
| 1. Numero di step (N) | x/2 | ... |
| 2. Lunghezza step | x/2 | ... |
| 3. Zona sviluppo prossimale | x/2 | ... |
| 4. Hint prima di risposte difficili | x/2 | ... |
| 5. Interattività + sketch p5 | x/2 | ... |
| 6. Verifica prerequisiti | x/2 | ... |

### Suggerimenti di miglioramento
- [solo criteri con punteggio < 2]: suggerimento concreto e puntuale,
  riferito a step/id specifici quando possibile.
```

Il punteggio finale si calcola a mano: somma i 6 criteri (max 12), poi
`totale_grezzo / 12 * 10` arrotondato a un decimale. Riporta sempre entrambi i
valori.

Non generare un suggerimento per i criteri già al punteggio massimo.

## Modalità multi-lezione (valutazione in parallelo)

Quando l'utente chiede di valutare più lezioni o un intero corso:

1. Determina l'elenco delle lezioni target (file/corso indicati
   dall'utente, oppure tutto `content/` se richiesto esplicitamente).
2. Lancia un sub-agente per lezione, in parallelo nello stesso turno
   (Agent tool, subagent_type generico). Il prompt di ogni agente deve
   includere: il path del file da leggere, la griglia completa dei 6
   criteri con soglie (da questo file), la formula di normalizzazione, e
   l'istruzione di restituire **esclusivamente** il blocco di output nel
   formato sopra — con sia il punteggio in decimi sia il totale grezzo su
   12 — senza testo aggiuntivo.
3. Batch consigliato: non più di 8–10 agenti alla volta, per restare
   leggibile e gestibile.
4. Dopo che tutti gli agenti hanno risposto, aggrega i risultati in
   un'unica tabella riassuntiva (corso, lezione, punteggio) ordinata per
   punteggio crescente, seguita dai blocchi di dettaglio completi di
   ciascuna lezione.
