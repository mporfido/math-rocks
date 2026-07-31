# Dimostrazioni — Modello dati e sintassi

**Stato: implementato, ponte con la figura compreso.** Questo documento fissa il
modello dati e la sintassi d'autore del componente `<x-theorem>`: la sintassi è
la cosa che poi non si cambia più senza riscrivere i contenuti. Il parser è in
`process_theorem()` (`parser/preprocessors.py`), il componente in
`static/components/theorem.js`, il contratto di evidenziazione in
`static/components/p5.js`, l'esempio in `content/dimostrazioni/` con la figura
`static/sketches/parallelogramma-diagonali.js`.

Il componente presenta un teorema — enunciato, ipotesi, tesi, dimostrazione — e
lo rende **manipolabile**: gli stessi dati generano una lettura guidata, un
riordino, una giustificazione e una costruzione da zero.

---

## 1. L'idea in una riga

> Un passo di dimostrazione è **premesse + garanzia + conclusione**, e la
> garanzia vive in una **teoria** che è del corso, non del singolo teorema.

Da questo discendono tutte le decisioni che seguono. La struttura del passo è il
modello di Toulmin (*data / warrant / claim*); l'idea che un teorema esista solo
dentro una teoria di riferimento è la lettura di Mariotti del teorema come
terna *enunciato – dimostrazione – teoria*.

La conseguenza pratica è che **l'autore scrive il contenuto una volta sola** e
ne ottiene cinque esercizi diversi: le modalità non sono contenuti alternativi,
sono maschere sulla stessa struttura.

---

## 2. Le quattro entità

### 2.1 `teoria` — la cassetta degli attrezzi (di corso)

La teoria è un'entità **di corso**, non del singolo teorema: il secondo criterio
di congruenza serve in dodici dimostrazioni e va scritto una volta.

`content/<corso>/teoria.yaml`:

```yaml
def-par:
  nome: Definizione di parallelogramma
  enunciato: ha i lati opposti paralleli
lati-opp:
  nome: Lati opposti
  enunciato: in un parallelogramma i lati opposti sono congruenti
alt-int:
  nome: Angoli alterni interni
  enunciato: due parallele tagliate da una trasversale formano angoli alterni interni congruenti
crit2:
  nome: Secondo criterio di congruenza
  enunciato: un lato e i due angoli adiacenti congruenti
corr:
  nome: Elementi corrispondenti
  enunciato: in triangoli congruenti gli elementi corrispondenti sono congruenti
```

| Campo       | Obbligatorio | Descrizione |
|-------------|:------------:|-------------|
| `nome`      | sì           | Nome breve, quello che lo studente sceglie dal menu |
| `enunciato` | sì           | Formulazione estesa, mostrata come promemoria |
| `tipo`      | no           | `definizione` \| `assioma` \| `teorema` (default: `teorema`) — solo presentazione |

**Un teorema dimostrato entra nella teoria.** Un blocco con `id=diag-par`
registra automaticamente una voce omonima: da quel momento le dimostrazioni
successive possono citarlo come garanzia. È il modo in cui la matematica si
costruisce davvero, ed è verificabile in build (vedi §6): un passo non può
usare come garanzia un teorema dimostrato più avanti nel corso.

### 2.2 `passi` — la lista piatta

In memoria la dimostrazione è **una sola lista** di passi. Ogni passo:

| Campo     | Obbligatorio | Descrizione |
|-----------|:------------:|-------------|
| `id`      | sì (implicito) | `h1…`, `t1…`, `p1…` — assegnato per posizione, sovrascrivibile |
| `testo`   | sì\*         | L'asserzione. \*Assente nel passo che referenzia la tesi (§2.3) |
| `statuto` | sì (derivato)| `ipotesi` \| `dedotto` \| `tesi` — **dalla sezione in cui è scritto** |
| `da`      | no           | Premesse: id di altri passi. Vuoto per le ipotesi |
| `perche`  | no           | Id nella teoria. Assente per le ipotesi (valgono *per ipotesi*) |
| `fig`     | no           | Id di un elemento della figura da evidenziare (§5) |

`fig` vale per **ogni** passo, non solo per le ipotesi: evidenziare i due
triangoli quando il mouse passa sul passo che li dichiara congruenti è il
momento in cui la dimostrazione si vede.

### 2.3 Ipotesi e tesi non sono duplicate

Ipotesi e tesi **sono passi**, con statuto derivato dalla sezione. L'intestazione
del teorema è renderizzata da loro, non riscritta a mano: una sola fonte.

L'ultimo passo della dimostrazione **non riscrive la tesi, la referenzia**:

```
- {t1, da: p5, per: corr}
```

Il testo viene da `t1`. Oltre a togliere la duplicazione, questo dà alla catena
un **nodo terminale verificabile**: la dimostrazione è completa quando ogni
passo di statuto `tesi` è raggiunto, non solo quando non manca nulla nel mucchio.

### 2.4 `distrattori` — i cartellini che non servono

Sono la parte più istruttiva dell'esercizio, e il loro **tipo è dichiarato**
dall'autore perché il feedback sia mirato e non generico:

| `tipo`               | Significato | Messaggio |
|----------------------|-------------|-----------|
| `inutile`            | Vero, ma non porta alla tesi | *"È vero, ma non ti avvicina alla tesi."* |
| `garanzia-sbagliata` | Conclusione giusta, regola invocata sbagliata | *"La conclusione è giusta, ma quel teorema non te la dà."* |
| `falso`              | Asserzione non vera | *"Questo non è vero."* |

Il secondo è il più formativo: costringe a distinguere *un argomento valido* da
*uno che sembra valido perché la conclusione è giusta*.

---

## 3. Sintassi d'autore

**Sezioni in scrittura, lista piatta in memoria.** L'autore scrive per sezioni
— che è come si scrive una dimostrazione — e lo `statuto` di ogni passo è
derivato dalla sezione che lo contiene.

```
:::theorem id=diag-par titolo="In un parallelogramma le diagonali si tagliano scambievolmente per metà" modi=leggi,ordina,giustifica
figura: parallelogramma-diagonali

## ipotesi
- ABCD è un parallelogramma {fig: quadrilatero}
- Le diagonali AC e BD si incontrano in M {fig: diagonali}

## tesi
- $AM \cong MC$ e $BM \cong MD$ {fig: meta}

## dimostrazione
- AB è parallelo a DC {da: h1, per: def-par, fig: lati-opposti}
- $AB \cong DC$ {da: h1, per: lati-opp}
- L'angolo BAM $\cong$ l'angolo DCM {da: p1, per: alt-int}
- L'angolo ABM $\cong$ l'angolo CDM {da: p1, per: alt-int}
- Il triangolo ABM $\cong$ il triangolo CDM {da: p2,p3,p4, per: crit2, fig: triangoli}
- {t1, da: p5, per: corr}

## distrattori
- L'angolo BAD $\cong$ l'angolo BCD {per: ang-opp, tipo: inutile}
- Il triangolo ABM $\cong$ il triangolo CDM {per: crit1, tipo: garanzia-sbagliata}
- $AC \cong BD$ {per: diag-rett, tipo: falso}
:::
```

### Regole

- **Un'annotazione per riga**, in coda, tra graffe: `{da: …, per: …, fig: …}`.
  Coerente con la sintassi già in casa (`[Testo]{check: …}`, `${a}{a|2|-5,5,1}`).
- **Id impliciti** dalla posizione nella sezione: `h1, h2…` per le ipotesi,
  `t1…` per le tesi, `p1, p2…` per i passi. Override con `{id: nome, …}` quando
  serve un riferimento stabile.
- **Riferimenti sempre prefissati** (`h1`, `t1`, `p2`): mai il numero nudo. Tre
  namespace distinti, zero ambiguità, riferimenti greppabili nei contenuti.
- Il corpo di ogni riga è **markdown normale**: `$…$`, grassetto, e anche
  `[[blank]]` continuano a funzionare.

### Attributi sulla riga di apertura

| Attributo | Default | Descrizione |
|-----------|---------|-------------|
| `id`      | —       | Se presente, il teorema entra nella teoria del corso con questo id |
| `titolo`  | —       | Enunciato, mostrato come titolo |
| `modi`    | `leggi` | Modalità offerte, in ordine; più di una fa comparire la navigazione |
| `mancanti`| `2`     | Quanti passi togliere in modalità `completa` |
| `figura`  | —       | Sketch associato (riga `figura:` nel corpo, vedi §5): i `fig:` dei passi ne nominano gli elementi |
| `figura-altezza` | `300` | Altezza suggerita del canvas; uno sketch che si dimensiona da sé la ignora |

### Etichette configurabili

Le etichette **Ipotesi / Tesi / Dimostrazione** sono attributi con default, non
stringhe fisse nell'engine: in fisica diventano *Dati / Richiesto / Soluzione*.
I nomi delle sezioni nel markdown restano invece fissi (sono sintassi, non
presentazione).

---

## 4. Le modalità sono maschere

Nessuna modalità contiene contenuto: ognuna è una configurazione sulla stessa
lista di passi.

| Modalità     | `partenza` | Garanzie | Distrattori | Cosa esercita |
|--------------|------------|----------|-------------|---------------|
| `leggi`      | tutti      | visibili | no          | Leggere la struttura: da dove nasce ogni passo |
| `ordina`     | solo ipotesi | visibili | no        | La dipendenza logica |
| `giustifica` | tutti      | **da scegliere** | no  | Quale teorema autorizza questo passo |
| `completa`   | tutti meno `mancanti` | visibili | sì | Riconoscere il passo che manca, e gli intrusi |
| `costruisci` | solo ipotesi | da scegliere | sì | Tutto insieme |

In `completa` i passi da togliere sono scelti **deterministicamente** (seed
dall'id del teorema), non elencati a mano dall'autore: un elenco di id nel
sorgente sarebbe di nuovo bookkeeping.

---

## 5. Ponte con la figura

L'attributo `figura` nomina uno sketch riusabile (`static/sketches/<nome>.js`),
che `<x-theorem>` monta accanto alla dimostrazione. I `fig:` dei passi sono id
di **elementi dentro quello sketch**: selezionare un passo li accende.

### Il contratto

Non è il ctx a decidere: è **chi possiede la figura** a dirle cosa evidenziare.
Il metodo sta quindi sull'elemento, non nel ctx dello sketch:

```js
elementoXP5.highlight({ triangoli: 'fuoco', quadrilatero: 'premessa' });
```

e lo sketch, dentro `draw()`, chiede il ruolo di ciò che sta per disegnare:

```js
const ruolo = ctx.evidenziato('triangoli');   // 'fuoco' | 'premessa' | null
if (ctx.evidenziato()) { /* qualcosa è acceso: il resto arretra */ }
ctx.onHighlight(cb)                           // per gli sketch che non rileggono
                                              // lo stato a ogni frame
```

I ruoli sono gli **stessi della catena** — `fuoco` è il passo selezionato,
`premessa` ciò su cui si appoggia — così il testo e il disegno dicono la stessa
cosa due volte. Uno sketch che non implementa nulla resta un disegno muto: il
contratto è opzionale e non rompe niente. Il metodo è oggi su `<x-p5>`;
`<x-graph>` può adottarlo con la stessa firma quando servirà.

### Nei due sensi

L'evidenziazione è **bidirezionale** su due assi:

- *dentro la catena*: dal passo alle sue premesse, e da un passo a tutti quelli
  che lo usano. È lì che lo studente vede che un'ipotesi serve davvero, tre volte;
- *fra catena e figura*: dal passo agli elementi del disegno, e dal disegno al
  passo — un click su un triangolo chiama `ctx.evidenzia(id)`, che emette
  `figure-highlight`, e il componente seleziona il passo che quell'elemento lo
  nomina. Un click nel vuoto (`id` nullo) spegne tutto.

Una premessa viene accesa solo se è **davvero nella catena**: in `ordina` e
`costruisci` un passo può citarne una che lo studente non ha ancora messo, e la
figura non deve anticipargliela.

Ogni riferimento è un `<button>`: funziona da tastiera e, su touch dove l'hover
non esiste, con tap sticky. Nella catena, i passi che hanno un `fig:` portano una
piccola spia: senza, non c'è modo di sapere quali vale la pena aprire.

---

## 6. Correzione e validazione

### A runtime — la correzione è topologica

Non si confronta la risposta con "la" soluzione dell'autore: **le soluzioni
giuste sono tante**. Un ordine è valido se ogni passo viene dopo le sue
premesse. Controlli, nell'ordine:

1. **Intrusi** — nella catena c'è un distrattore → messaggio secondo il `tipo`
2. **Completezza** — ogni passo di statuto `tesi` è raggiunto
3. **Ordine** — nessun passo usa una premessa che a quel punto non ha ancora
4. **Garanzie** — solo dove non sono visibili: la garanzia scelta è quella giusta

Il feedback indica **quale** passo non regge, non solo che qualcosa non va.

### In build — la teoria è verificabile

Il compilatore fallisce rumorosamente se:

- un passo cita una garanzia che non esiste nella teoria del corso;
- un passo cita una garanzia dimostrata **più avanti** nel corso (dipendenza
  circolare nella progressione);
- un `da:` punta a un id inesistente;
- il grafo delle premesse contiene un ciclo;
- nessun passo raggiunge una delle tesi.

---

## 7. Confine con le pagine-strumento

Un teorema **non sta in una query string** come ci sta un'espressione. Se
servirà come strumento condivisibile (`/tools/…`), la strada è il contenuto in
`content/` o un markdown incollato in un textarea, non i parametri URL.
