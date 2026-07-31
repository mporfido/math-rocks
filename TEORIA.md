# Teoria — Il corpus di geometria come strumento

**Stato: implementato.** Questo documento fissa il corpus di teoremi, il grafo
che lo mostra e gli URL che lo rendono condivisibile. Si appoggia interamente al
modello dati di [DIMOSTRAZIONI.md](DIMOSTRAZIONI.md): qui non si inventa
nessuna entità nuova per il singolo teorema, si decide dove vivono i teoremi
tutti insieme e come si naviga fra loro.

Il codice: `build_corpus.py` (compilazione e grafo), `tools_config.py` (il
manifest, letto anche dalla build), `routes/tools.py` (le due route),
`templates/theory_map.html` e `theory_theorem.html`, `static/tools/theory.js`,
gli stili `.mappa-*` e `.teorema-*` in `static/style.css`. Il corpus d'esempio è
`content/geometria/`.

Ne discende una modifica a `DIMOSTRAZIONI.md` §7 ("Confine con le pagine
strumento"), che oggi dice che un teorema non diventa uno strumento: diventa uno
strumento, ma con un corpus in `content/`, non con una query string.

---

## 1. L'idea in una riga

> Il grafo dei teoremi **non è un dato nuovo**: è già scritto nei `perche:` dei
> passi, e va solo disegnato.

Un passo cita la sua garanzia (`per: alt-int`); se quella garanzia è a sua volta
un teorema del corpus, quello è un arco. Il grafo si aggiorna scrivendo
dimostrazioni, non manutenendo un elenco di prerequisiti — che è l'unica
versione che sopravvive a sessanta teoremi.

La conseguenza pratica: **il corpus è utile anche quando è vuoto per tre quarti**.
Una voce di teoria con solo `nome` e `enunciato` è già un nodo del grafo, con i
suoi archi entranti, e diventa una pagina quando qualcuno ne scrive la
dimostrazione.

---

## 2. Il corpus

### 2.1 Struttura

```
content/geometria/
├── teoria.yaml        # le voci: enunciati, tipo, area  (§2.2)
├── aree.yaml          # ordine e colore delle aree      (§2.3)
├── triangoli.md       # uno o più :::theorem per file
├── parallele.md
└── quadrilateri.md
```

I file `.md` contengono blocchi `:::theorem` con la sintassi di
`DIMOSTRAZIONI.md` §3, invariata. Il raggruppamento in file è **solo comodità
d'autore**: non ha effetto sulla presentazione, che è governata da `area:` e dal
livello calcolato. Un file per area è la scelta ovvia, ma niente la impone.

### 2.2 `teoria.yaml` — la stessa cassetta degli attrezzi, con un campo in più

Identico a `DIMOSTRAZIONI.md` §2.1, con l'aggiunta di `area`:

```yaml
alt-int:
  nome: Angoli alterni interni
  enunciato: due parallele tagliate da una trasversale formano angoli alterni interni congruenti
  tipo: teorema
  area: parallelismo
diagonali-parallelogramma:
  nome: Diagonali del parallelogramma
  enunciato: in un parallelogramma le diagonali si tagliano scambievolmente per metà
  area: quadrilateri
```

| Campo       | Obbligatorio | Descrizione |
|-------------|:------------:|-------------|
| `nome`      | sì           | Nome breve: il titolo della card sulla mappa |
| `enunciato` | sì           | Formulazione estesa |
| `tipo`      | no           | `definizione` \| `assioma` \| `teorema` (default: `teorema`) |
| `area`      | no\*         | Id di un'area dichiarata in `aree.yaml`. \*Obbligatorio per i `tipo: teorema` di un corpus: senza, la card non ha colonna |
| `usa`       | no           | Prerequisiti dichiarati a mano, **solo per i teoremi non ancora dimostrati** (§2.4) |

Una voce può esistere **senza dimostrazione**: nessun `:::theorem` la definisce,
e resta un nodo con il solo enunciato (§4.3).

L'`enunciato` è scritto in minuscolo perché si legge di seguito al nome
(*Lati opposti: in un parallelogramma…*); dove fa da titolo di pagina la build
gli mette la maiuscola. È anche l'unica fonte del titolo del teorema: i blocchi
`:::theorem` di un corpus **non** hanno `titolo=`.

### 2.4 `usa` — l'impalcatura provvisoria

Gli archi li danno i `per:` dei passi, e un teorema senza dimostrazione non ne
ha nessuno: finirebbe a livello 0 anche quando il suo posto è in fondo. Con
sessanta enunciati e sei dimostrazioni scritte, la mappa sarebbe piatta e
falsa proprio nella fase in cui serve di più.

`usa:` è la stampella per quel caso: i prerequisiti noti, dichiarati a mano,
che tengono il nodo al livello giusto finché la dimostrazione non arriva.

È un elenco di prerequisiti mantenuto a mano — cioè esattamente la cosa che
questo documento evita ovunque — e regge solo perché **si auto-elimina**:
quando la dimostrazione arriva, `usa:` viene ignorato (gli archi veri
vincono) e la build lo segnala come da cancellare. Non può divergere in
silenzio, perché non sopravvive al suo scopo.

### 2.3 `aree.yaml` — l'ordine è una decisione d'autore

L'area dà al grafo il suo secondo asse. L'ordine delle colonne è didattico e non
si deduce dai dati, quindi si dichiara:

```yaml
aree:
  - id: congruenza
    nome: Congruenza
    colore: "#26518A"
  - id: parallelismo
    nome: Rette parallele
    colore: "#2E7D6B"
  - id: quadrilateri
    nome: Quadrilateri
    colore: "#8A5A26"
```

L'ordine di dichiarazione è l'ordine da sinistra a destra. Il colore entra nella
card e nella banda di intestazione della colonna: su una LIM, a tre metri, il
colore è ciò che si legge prima del testo.

---

## 3. Il grafo

### 3.1 Archi

C'è un arco `A → B` quando un passo di `B` cita `A` come garanzia (`per: A`) e
`A` è una voce di `tipo: teorema`. Contano **solo i passi**: le garanzie dei
*distrattori* sono sbagliate o irrilevanti per costruzione, e portarle nel
grafo significherebbe disegnare relazioni che la teoria non ha (un distrattore
può citare di proposito un teorema che viene dopo).

Le garanzie di tipo `definizione` e `assioma` **non generano archi**: sono la parte di teoria che è vera ovunque e che, se
disegnata, renderebbe il grafo un pettine illeggibile.

Non spariscono però dalla vista: ogni card e ogni pagina-teorema elenca in un
box richiudibile le definizioni e gli assiomi che la dimostrazione usa. Senza,
una card in cima al grafo sembrerebbe arrivata dal nulla, mentre il punto è che
poggia direttamente sugli assiomi — che è un'informazione, non un vuoto.

### 3.2 Livelli

```
livello(T) = 0                                  se T non ha prerequisiti-teorema
livello(T) = 1 + max(livello(P) per P in prereq) altrimenti
```

Il livello è la profondità del cammino più lungo: un teorema sta **almeno** un
livello sotto ognuno di quelli che usa, che è la regola voluta. È ben definito
perché il grafo è aciclico, e questo il compilatore già lo verifica
(`_check_theorem_cycles`, `DIMOSTRAZIONI.md` §6).

Il livello si calcola **in build**: il grafo non cambia fra un caricamento e
l'altro, quindi non c'è motivo di far girare un algoritmo di layout nel
browser, né di aggiungere una libreria per farlo.

La build produce `(livello, area, indice)` — riga, colonna, e posto dentro la
cella quando più teoremi la condividono. Non produce coordinate in pixel: le
card hanno l'altezza che il loro testo richiede, e la griglia CSS le sistema
meglio di qualunque calcolo fatto prima. Gli **archi** li misura quindi il JS
sul DOM (`static/tools/theory.js`), ridisegnandoli al resize e quando i font
finiscono di caricare.

### 3.3 Layout

Livello in verticale, area in orizzontale. La griglia è **sparsa**: al livello 3
può esserci solo *congruenza*, e le altre colonne restano vuote. È corretto che
si veda — le celle vuote raccontano dove ogni capitolo comincia e quanto in
profondità arriva.

Gli archi lunghi (un teorema di livello 0 usato al livello 6) sono la norma, non
l'eccezione, e disegnarli tutti sempre accesi rende la mappa illeggibile. Regola:

- **a riposo** gli archi sono tenui, o assenti sopra una certa densità;
- **al passaggio o al tap su una card** si accende il suo cono — i prerequisiti a
  monte, gli utilizzi a valle — e tutto il resto arretra.

Sono i ruoli `fuoco` e `premessa` di `DIMOSTRAZIONI.md` §5, applicati alla mappa
invece che alla figura: la stessa grammatica visiva a due scale diverse.

---

## 4. Le pagine e gli URL

### 4.1 Path = quale teorema, query = come

```
/tools/geometria/                                    la mappa
/tools/geometria/diagonali-parallelogramma/          un teorema
/tools/geometria/diagonali-parallelogramma/?modi=ordina&distrattori=2
```

Il path è congelabile e stabile: è quello che si condivide, si stampa in calce a
una scheda, si scrive alla lavagna. La query è configurazione, letta dal JS come
per gli altri strumenti (il sito è statico, il server non la vede).

Ne segue una decisione da prendere una volta sola: **gli id del corpus sono URL
pubblici**. Vanno scritti per esteso e leggibili (`diagonali-parallelogramma`,
non `diag-par`) e considerati permanenti, perché cambiarli rompe i link già
distribuiti agli studenti.

### 4.2 Parametri

| Parametro     | Valore | Effetto |
|---------------|--------|---------|
| `modi`        | lista  | Modalità offerte, in ordine. Restringe o amplia quelle dichiarate dall'autore |
| `distrattori` | intero | Quanti distrattori mostrare (§5). `0` = nessuno |

### 4.3 Un teorema senza dimostrazione ha comunque una pagina

Enunciato, e ipotesi/tesi se dichiarate; nessuna modalità, e un rimando alla
mappa. Meglio di un 404, e rende il corpus pubblicabile a qualsiasi stadio di
riempimento. Sulla mappa la card è visibilmente diversa e non porta alle
modalità, ma resta un nodo con i suoi archi entranti: altri teoremi la citano
già.

### 4.4 Nessuna fetch a runtime

Avere route vere invece di una query string ha un effetto collaterale gradito:
ogni pagina può portare **solo il suo peso**, renderizzato da Jinja.

- la mappa incorpora l'indice leggero: `{id, nome, enunciato, area, livello,
  posizione, archi, ha_dimostrazione}`;
- ogni pagina-teorema incorpora la propria dimostrazione, negli stessi
  attributi `data-*` che `<x-theorem>` già riceve dal parser.

Zero fetch, zero JSON caricato per intero, comportamento identico su Flask e su
GitHub Pages.

---

## 5. I distrattori sono un asse, non una proprietà della modalità

In `DIMOSTRAZIONI.md` §4 i distrattori sono legati alla modalità (`completa` e
`costruisci` sì, le altre no). Quella colonna diventa un **default**, e la
manopola passa al docente: `ordina` con distrattori è un ordina difficile,
`costruisci` senza è un costruisci morbido. Stessa dimostrazione, due schede per
due classi diverse.

### 5.1 La manopola è numerica

`distrattori=N` dice **quanti** mostrarne, scelti deterministicamente con lo
stesso seed che governa i passi da togliere in `completa` (seed dall'id del
teorema). Il determinismo non è un dettaglio: un link dato per compito deve
produrre lo stesso esercizio per tutta la classe, altrimenti in classe non se ne
può parlare.

`0` disattiva; il parametro assente lascia il default della modalità. Sul
componente l'attributo è `data-distrattori-n` (`data-distrattori` è già il JSON
dei cartellini), e `static/tools/theory.js` lo scrive **prima** che
`theorem.js` sia caricato: `<x-theorem>` legge i suoi attributi una volta sola,
quando si registra.

### 5.2 Dove la manopola ha senso

| Modalità | Manopola | Perché |
|--------------|:--------:|--------|
| `leggi`      | ignorata | Nessun mucchio di cartellini: i passi sono già in catena |
| `ordina`     | **sì**   | I distrattori entrano nel mucchio da ordinare |
| `giustifica` | ignorata | Si scelgono garanzie, non passi |
| `completa`   | **sì**   | Default: attivi |
| `costruisci` | **sì**   | Default: attivi |

Nelle due modalità dove è ignorata non è un errore: il parametro si applica a un
mucchio che lì non esiste.

### 5.3 Precedenza

```
default della modalità  →  attributo del blocco  →  parametro URL
```

L'autore può dire che *questo* teorema in `ordina` i distrattori li vuole; il
docente, che è chi ha in mano il link, vince sempre.

### 5.4 `garanzia-sbagliata` in `ordina` va spiegato bene

Un distrattore di tipo `garanzia-sbagliata` ha lo stesso testo di un passo vero e
differisce solo per la garanzia citata — che in `ordina` è visibile. Nel mucchio
compaiono quindi due cartellini quasi identici: è la trappola più formativa del
modello, il momento in cui si distingue un argomento valido da uno che sembra
valido perché la conclusione è giusta.

La correzione topologica non ha problemi (lavora sugli id), ma il messaggio deve
indicare **quale** differenza conta, non limitarsi a "c'è un intruso": due
cartellini con lo stesso testo e un feedback generico si leggono come un bug.

---

## 6. LIM e mobile sono due layout

Non un breakpoint: due destinazioni d'uso diverse.

**LIM** (1920, touch, tre metri di distanza) è il caso di progetto della mappa:
spazio, testo grande, bersagli da dito, nessun hover — la selezione della card è
un tap sticky, come già fa la catena su touch (`DIMOSTRAZIONI.md` §5).

**Mobile**: la mappa **degrada a lista per livelli** — livello 1, livello 2, …
con le card in colonna e la relazione espressa a parole ("serve: *Angoli alterni
interni*"). Niente pan/zoom su un grafo pensato per lo schermo grande: è la cosa
che si implementa sempre e non usa nessuno.

Il degrado è accettabile perché **lo studente sul telefono di norma non passa
dalla mappa**: arriva al teorema da un link diretto. La pagina-teorema è quella
che deve essere ottima in verticale — e lì il modello di interazione già regge,
perché l'ordinamento è a click sul cartellino, non drag-and-drop
(`static/components/theorem.js`).

---

## 7. Build, route, freeze

### 7.1 Un corpus non è un corso

`build_courses.py` produce `courses_data/<id>.json` con `lessons` e `steps`; un
corpus non ha né lezioni né step e non va forzato dentro quel formato. Output
separato:

```
content/geometria/  →  tools_data/geometria.json
```

Stesso preprocessore (`process_theorem()`), stessa validazione di
`DIMOSTRAZIONI.md` §6 — che su un corpus intero serve **più** che su un corso:
cicli e garanzie inesistenti, su sessanta teoremi, sono probabili davvero. Al
JSON si aggiungono i livelli, le posizioni e gli archi calcolati in §3.

`build_courses.py` lo invoca a fine build: i corpora sono contenuti quanto i
corsi, e due comandi separati significano prima o poi pubblicare un sito con la
mappa vecchia. Restano comunque due moduli, e `python build_corpus.py
<corpus>` compila un corpus da solo.

Warning, non errori: una modalità che attiva i distrattori per default offerta
su un teorema che non ne ha (degrada, ma l'autore lo scoprirebbe solo aprendo
la pagina); un `usa:` rimasto su un teorema ormai dimostrato; testo scritto
fuori dai blocchi `:::theorem`, che in un corpus non viene renderizzato da
nessuna parte e sparirebbe in silenzio.

### 7.2 Route

`TOOL_KINDS` guadagna `theory`. In `content/tools.yaml`:

```yaml
  - id: geometria
    kind: theory
    corpus: geometria          # cartella in content/ e JSON in tools_data/
    title: Geometria euclidea
    description: >-
      La teoria come grafo: ogni teorema al suo posto, dai primi alle
      conseguenze, e ogni dimostrazione da esercitare.
    icon: "📐"
```

Le route diventano due:

- `/tools/<tool_id>/` — per `kind: theory` è la mappa;
- `/tools/<tool_id>/<item_id>/` — la pagina di un teorema, 404 se l'id non è nel
  corpus.

### 7.3 Freeze

Un generator in `freeze.py` enumera `/tools/<id>/<teorema>/` leggendo
`tools_data/`, gemello di `course_urls()`.

---

## 8. Confine engine / istanza

Coerente con il README ("Direzione e Filosofia"), con un allargamento
dichiarato del contratto delle pagine-strumento: **uno strumento può avere un
corpus**.

- **Engine**: le route, i template della mappa e della pagina-teorema,
  `static/tools/theory.js`, il calcolo di livelli e posizioni in build. Nessuna
  conoscenza della geometria euclidea.
- **Istanza**: `content/geometria/` (teoremi, teoria, aree) e la voce in
  `content/tools.yaml`. Un altro sito userebbe lo stesso engine per un corpus di
  logica o di fisica.

### 8.1 Il corpus è l'autorità sulla teoria

> **Non ancora implementato** (§8.1 e §8.2). Oggi il corpus funziona da solo e
> `content/dimostrazioni/` resta un corso separato con la sua `teoria.yaml`:
> finché nessuna lezione cita il corpus non c'è divergenza, ma appena una lo
> farà servono il campo `teoria:` e l'inclusione `ref=` descritti qui sotto.

Oggi `teoria.yaml` è un'entità di corso. Con un corpus condiviso quel file
esisterebbe in due posti e le voci divergerebbero in due settimane. Quindi: **un
corpus è una teoria**, e un corso può dichiarare di usarla in `metadata.yaml`:

```yaml
teoria: geometria
```

Il campo è opzionale: un corso che non condivide teoria con nessuno (aritmetica,
fisica) tiene la sua `teoria.yaml` locale come oggi.

### 8.2 La lezione include il teorema per riferimento

Se un teorema sta nel corpus **e** dentro una lezione, il markdown non va
scritto due volte. La fonte è il corpus, la lezione lo cita:

```
:::theorem ref=diagonali-parallelogramma modi=ordina
:::
```

Gli attributi accanto a `ref` sovrascrivono quelli del corpus, così la stessa
dimostrazione entra in una lezione con la modalità che serve lì. È la stessa
regola di una-sola-fonte che governa già ipotesi e tesi
(`DIMOSTRAZIONI.md` §2.3).

---

## 9. Punti aperti

**Il menu delle garanzie in `giustifica`.** Oggi le garanzie sbagliate fra cui
scegliere vengono dalla teoria; su un corpus di sessanta voci quel menu diventa
illeggibile ben prima che difficile. Va limitato — plausibilmente alle garanzie
del teorema più N pescate dalla stessa `area`, con lo stesso seed deterministico
— ma la regola giusta si vede meglio con il corpus in mano che adesso.

**Progresso sulla mappa.** Una mappa invita a segnare cosa si è completato
(`storage_prefix` c'è già, `progress.js` pure). Utile, ma trasforma il grafo in
una skill tree, con quello che ne consegue in classe. Opzionale e spento di
default; da valutare dopo il collaudo su LIM.

**Densità.** Il layout di §3.3 è progettato su una decina di teoremi. A sessanta,
con archi lunghi, potrebbe servire un filtro per area (mostra una colonna e i
suoi prerequisiti) o un livello di zoom semantico. Non si progetta adesso: si
guarda quando il corpus sarà cresciuto abbastanza da far male.
