# Dimostrazioni — Modello dati e sintassi

**Stato: implementato, ponte con la figura compreso.** Questo documento fissa il
modello dati e la sintassi d'autore del componente `<x-theorem>`: la sintassi è
la cosa che poi non si cambia più senza riscrivere i contenuti. Il parser è in
`process_theorem()` (`parser/preprocessors.py`), il componente in
`static/components/theorem.js`, il contratto di evidenziazione in
`static/components/p5.js`, l'esempio in `content/geometria/quadrilateri.md` con
la figura `static/sketches/geometria-diagonali-parallelogramma.js`.

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
| `id`      | sì (implicito) | `h1…`, `t1…`, `p1…`, `c1…` — assegnato per posizione, sovrascrivibile |
| `testo`   | sì\*         | L'asserzione. \*Assente nel passo che referenzia la tesi (§2.3) |
| `statuto` | sì (derivato)| `ipotesi` \| `costruzione` \| `dedotto` \| `tesi` — **dalla sezione in cui è scritto** (unica eccezione: §2.5) |
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

### 2.5 `costruzione` — l'unico statuto che non viene dalla sezione

Una dimostrazione non deduce soltanto: a un certo punto **traccia**. La
bisettrice, la parallela per un punto, la diagonale, l'angolo ausiliario. Quel
gesto non è un'ipotesi — non è dato con l'enunciato — e non è una deduzione —
non asserisce nulla di vero o falso: *istituisce un oggetto*.

Senza uno statuto suo, quel gesto finisce fra le ipotesi, ed è lì che il modello
si rompe in tre punti:

- l'enunciato dice il falso: «dato un triangolo **e data** la sua bisettrice»
  non è il teorema dell'isoscele;
- l'ipotesi resta senza `da:` che la citi, cioè appare inutile — proprio mentre
  il teorema accanto insegna a riconoscere i passi `tipo: inutile` (§2.4);
- in `costruisci` lo studente riceve gratis la mossa più difficile della
  dimostrazione, che è appunto sapere che cosa tracciare.

Si marca col token nudo `costruzione` in testa all'annotazione, dentro
`## dimostrazione`, dove l'atto avviene:

```
- Si tracci la bisettrice $AH$ dell'angolo $B\hat{A}C$ {costruzione, da: h1}
- Si tracci la parallela a $BC$ per $A$ {costruzione, da: h1, per: assioma-parallela}
```

| Aspetto | Comportamento |
|---------|---------------|
| **Id**  | Namespace proprio, `c1, c2…`: aggiungere una costruzione non rinumera i passi dedotti già scritti |
| **`da:`** | Come ogni passo: una costruzione poggia su ciò che le dà gli oggetti da cui parte, e a sua volta è citabile (`da: p1,c1`) |
| **`per:`** | **Facoltativo.** C'è quando è un assioma di esistenza ad autorizzare il gesto (`assioma-parallela`); quando manca la riga legge *per costruzione*, che non è una casella vuota da riempire |
| **`fig:`** | Come ogni passo — ed è il caso in cui il ponte con la figura (§5) dice più cose: una costruzione è *insieme* un atto logico e un tratto di disegno |
| **Modalità** | Non parte in catena con le ipotesi: in `ordina` e `costruisci` è un cartellino da collocare, marcato «costruzione» perché non se ne cerchi la garanzia |

`costruzione` è quindi l'**unica parola riservata** dell'annotazione: ovunque
altro il token nudo è l'id di una tesi referenziata (§2.3).

Proprio per questo `garanzia-sbagliata` vive **solo dove le garanzie si vedono**
(§4): la sua conclusione è giusta per definizione del tipo, quindi il testo
coincide con quello di un passo vero. Con la garanzia in chiaro i due cartellini
si distinguono, ed è tutto l'esercizio; senza, sono cloni e sceglierne uno è un
sorteggio. In `costruisci` il componente li tiene fuori dal mucchio da sé:
l'autore può scriverli senza pensarci.

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
  `t1…` per le tesi, `p1, p2…` per i passi, `c1, c2…` per le costruzioni
  (§2.5). Override con `{id: nome, …}` quando serve un riferimento stabile.
- **Riferimenti sempre prefissati** (`h1`, `t1`, `p2`, `c1`): mai il numero
  nudo. Namespace distinti, zero ambiguità, riferimenti greppabili nei contenuti.
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
| `costruisci` | solo ipotesi | da scegliere | sì, ma non i `garanzia-sbagliata` (§2.4) | Tutto insieme |

«Solo ipotesi» è alla lettera: le **costruzioni** (§2.5) restano nel mucchio da
collocare. Tracciare la parallela giusta è la mossa che decide la dimostrazione,
e regalarla in partenza svuoterebbe `costruisci` di ciò che esercita.

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

Un teorema **non sta in una query string** come ci sta un'espressione: il
contenuto vive in `content/`, e l'URL porta al massimo la configurazione.

Su questa base i teoremi sono diventati uno strumento — un **corpus** esposto
come mappa a livelli, con una pagina per teorema: vedi [TEORIA.md](TEORIA.md).
Il path dice quale teorema (ed è l'indirizzo che si condivide), la query string
dice come presentarlo (`modi`, `distrattori`).

Due conseguenze su quanto scritto qui sopra:

- la **teoria** può essere di corpus e non di corso (§2.1): un corpus ha il suo
  `teoria.yaml`, che è il registro di tutti i nodi della mappa, dimostrati e non;
- i **distrattori** sono un asse indipendente dalla modalità (§4): la tabella
  di §4 resta il default, ma quante ne mostra lo decide chi costruisce la
  scheda, con `data-distrattori-n`.

---

## 8. Assurdo e casi — il ragionamento ipotetico

**Stato: implementato per `leggi` e `giustifica`.** Le modalità col mucchio di
cartellini (`ordina`, `completa`, `costruisci`) non accettano ancora un teorema
con scope: la build lo rifiuta con un messaggio esplicito invece di produrre un
esercizio che non si può risolvere.

### 8.1 Sono la stessa cosa

Dimostrazione per assurdo e discussione dei casi sembrano due funzionalità.
Sono **un solo primitivo**: uno *scope ipotetico*. Si suppone qualcosa che non è
né dato né dedotto, si ragiona lì dentro, e alla fine si **scarica**
l'assunzione ottenendo una conclusione che non ne dipende più.

| | Cosa si assume | Come si scarica |
|---|---|---|
| Assurdo | la negazione della tesi | una **contraddizione** → l'assunzione è falsa → la tesi |
| Casi | un disgiunto di una disgiunzione già dimostrata | tutti i rami danno la stessa conclusione → **esame dei casi** |

È lo stesso argomento del §2.5 per la costruzione, ripetuto: un gesto che non è
ipotesi e non è deduzione merita uno statuto proprio. Qui è più grave che con la
costruzione — un'assunzione per assurdo messa fra le ipotesi rende l'enunciato
del teorema *letteralmente falso*.

### 8.2 Quattro parole nuove, non quattro funzionalità

| Sintassi | Statuto | Id | Che cos'è |
|----------|---------|-----|-----------|
| `{assurdo: t1}` | `assunzione` | `s1, s2…` | Si suppone il contrario di `t1`. **Apre** uno scope |
| `### caso <testo> {da: p2}` | `assunzione` | `a1, b1…` | Si suppone un disgiunto. **Apre** uno scope |
| `{contraddizione, da: p4,p5}` | `assurdo` | prefisso corrente | Un passo la cui conclusione è ⊥ |
| `{analogo: a1}` | `analogo` | prefisso corrente | Chiude un ramo per simmetria |

Ogni riga resta **premesse + garanzia + conclusione**: la contraddizione è un
passo normale la cui conclusione è ⊥ e le cui premesse sono le due asserzioni
incompatibili. Non serve una struttura nuova, serve un vocabolario.

### 8.3 Il secondo criterio, per intero

```
:::theorem id=secondo-criterio modi=leggi,giustifica

## ipotesi
- $BC \cong B'C'$
- $A\hat{B}C \cong A'\hat{B'}C'$
- $A\hat{C}B \cong A'\hat{C'}B'$

## tesi
- Il triangolo $ABC \cong$ il triangolo $A'B'C'$

## dimostrazione
- I due triangoli non sono congruenti {assurdo: t1}
- Non può essere $AB \cong A'B'$ {da: s1,h1,h2, per: primo-criterio}
- Dunque $AB > A'B'$ oppure $AB < A'B'$ {da: p1, per: confronto-grandezze}

### caso $AB > A'B'$ {da: p2}
- Si prenda $P$ su $AB$ con $BP \cong B'A'$ {costruzione, da: a1, per: assioma-trasporto}
- Il triangolo $PBC \cong$ il triangolo $A'B'C'$ {da: c1,h1,h2, per: primo-criterio}
- $P\hat{C}B \cong A\hat{C}B$ {da: a2,h3, per: proprieta-transitiva}
- $P\hat{C}B < A\hat{C}B$ {da: c1, per: parte-minore-del-tutto}
- {contraddizione, da: a3,a4}

### caso $AB < A'B'$ {da: p2}
- Si scambiano i ruoli di $ABC$ e $A'B'C'$ {analogo: a1}

### quindi
- {contraddizione, da: a5,b2, per: esame-dei-casi}
- {t1, da: p3, per: riduzione-all-assurdo}
:::
```

### 8.4 Le regole

**`{assurdo: t1}` dichiara che cosa nega.** Il testo lo scrive l'autore — la
negazione in italiano non è meccanizzabile — ma il legame è dichiarato, come per
la tesi referenziata (§2.3). Serve all'intestazione («supponiamo per assurdo
che…») e soprattutto a verificare che lo scarico chiuda la cosa giusta.

**Un ramo è una sezione, e ha il suo namespace.** `### caso` prende la lettera
successiva libera (`a`, `b`, `e`, `f`, …: `c`, `d`, `h`, `p`, `s`, `t` sono già
prefissi). L'intestazione **è** il primo passo del ramo — `a1` — con statuto
`assunzione`; i passi che seguono sono `a2, a3…`. Aggiungere un caso non
rinumera niente. Le costruzioni dentro un ramo restano nel namespace globale
`c1, c2…`: un oggetto tracciato è tracciato.

**`### quindi` esce dai casi.** È l'unica sotto-sezione riservata oltre a
`### caso`, e serve perché dopo l'ultimo ramo il testo deve poter tornare fuori.
I passi lì dentro riprendono il prefisso `p`.

**Dall'assurdo si esce solo scaricandolo.** Non serve una sotto-sezione: un
passo con `per: riduzione-all-assurdo` chiude lo scope per definizione, ed è
l'unico modo di uscirne. Deve citare un passo di statuto `assurdo` interno allo
scope, e la tesi che referenzia dev'essere quella che l'assunzione negava.

**«L'altro caso è analogo» è un terminatore, non un buco.** Chiudere un ramo con
`{analogo: a1}` lo tiene *dentro il grafo* — altrimenti l'esame dei casi
risulterebbe incompleto e la verifica del §6 non potrebbe funzionare — e
obbliga l'autore a scrivere **quale** simmetria, che è esattamente ciò che i
libri omettono. Il testo della riga è la simmetria, ed è obbligatorio.

Da non confondere con il *senza perdita di generalità*, che è un'altra mossa: la
simmetria lì si invoca **prima** dello split, per dimezzare i casi. Non è
implementato.

### 8.5 La regola di visibilità

Ogni passo porta uno `scope`: l'id dell'assunzione che lo governa, `null` al
livello esterno. Da qui la regola che il §6 non poteva avere:

> Un passo può citare in `da:` solo passi del proprio scope o di uno che lo
> contiene. Fanno eccezione i due **scarichi**, che citano dentro lo scope che
> chiudono.

Citare `a3` dal ramo `b`, o dal seguito dopo lo scarico, è *l'*errore classico
sull'assurdo — «l'ho dimostrato dentro l'assurdo e lo uso fuori» — e ora è
diagnosticabile con precisione invece che invisibile.

A schermo lo scope è un **rientro**: i passi di un ramo stanno in una scatola
che dice da quale supposizione dipendono. È la stessa cosa detta due volte,
come per il ponte con la figura (§5).

### 8.6 Che cosa controlla la build

Oltre ai controlli del §6:

- `{assurdo: X}` con `X` che non è una tesi;
- un'assunzione mai scaricata, o scaricata due volte;
- uno scarico `riduzione-all-assurdo` che non cita nessun `assurdo` interno;
- un `esame-dei-casi` che non cita il terminatore di **ogni** ramo del gruppo;
- una citazione che viola la regola di visibilità (§8.5);
- un `{analogo: X}` che non punta a un caso dello stesso gruppo, o senza testo;
- un `contraddizione` con meno di due premesse;
- `modi` che includono `ordina`, `completa` o `costruisci` su un teorema con
  scope.

### 8.7 Le regole logiche non sono nodi della mappa

`riduzione-all-assurdo` ed `esame-dei-casi` sono garanzie a tutti gli effetti —
in `giustifica` vanno scelte, e riconoscere «qui si ragiona per casi» è una
competenza vera. Ma non sono teoremi di geometria: se entrassero in
`teoria.yaml` come tali diventerebbero card da dimostrare sulla mappa.

Perciò un `tipo` nuovo, **`regola`**, trattato come `definizione` e `assioma`:
niente area, niente arco, niente nodo. Compare nel box dei fondamenti di chi la
usa.

La contraddizione «foglia» non ha invece nessuna garanzia da scegliere: legge
*per contraddizione*, come una costruzione legge *per costruzione* (§2.5). Non è
una casella vuota da riempire.
