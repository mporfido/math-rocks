# Tabelle con frecce — Sintassi e Riferimento

Il blocco `:::table` disegna una tabella in cui, fra una riga e l'altra (o fra
una colonna e l'altra), corrono **frecce etichettate**.

Serve quando quello che conta non è una colonna in più, ma **l'operazione che
porta da un passaggio al successivo**: sta *fra* due righe, non dentro una.

```markdown
:::table
| Potenza  | Valore  | v : 2 |
| -------- | ------- | ----- |
| $2^1$    | 2       |
| $2^0$    | [[1]]   |
| $2^{-1}$ | [[1/2]] |
| $2^{-2}$ | [[1/4]] |
:::
```

Il corpo è una normale tabella a pipe. L'unica cosa nuova è il **glifo di
verso** al posto di un'intestazione: dichiara che quella colonna non contiene
dati ma frecce.

---

## La regola, in una riga

> Una **corsia** è una colonna (o una riga) marcata da un glifo di verso.
> L'etichetta di un salto si scrive nella cella da cui il salto **parte**.

---

## I marcatori

| Scrivi | Dove | Ottieni |
|---|---|---|
| `v` (o `↓`) | come intestazione di colonna | corsia di frecce verso il **basso** |
| `^` (o `↑`) | come intestazione di colonna | corsia di frecce verso l'**alto** |
| `>` (o `→`) | come **prima cella** di una riga | corsia di frecce verso **destra** |
| `<` (o `←`) | come **prima cella** di una riga | corsia di frecce verso **sinistra** |

Il glifo deve stare da solo o essere seguito da uno spazio: `v` e `v : 2` sono
corsie, `valore` è un'intestazione come tutte le altre.

Le corsie possono essere più d'una, a sinistra e a destra (o sopra e sotto), e
sono indipendenti fra loro.

## Le etichette

| Scrivi | Significato |
|---|---|
| `v : 2` | etichetta di **default**: vale per tutti i salti della corsia |
| `× 3` in una cella | etichetta di **quel** salto (vince sul default) |
| cella vuota | usa il default; se non c'è default, nessuna freccia |
| `-` | **rompe** la catena: qui nessuna freccia, neanche col default |
| `~` | **prolunga** la freccia aperta sopra, invece di aprirne una nuova |

L'etichetta è markdown: `: 2`, `× $k$`, `$\sqrt{2}$`, `**per due**`.

## Le celle

Il contenuto di una cella è markdown normale, quindi dentro una cella
funzionano le formule e **tutti gli elementi interattivi**:

```markdown
| $2^0$ | [[1]] | | ← una casella da completare, contata come goal dello step
| $x$   | [[*sale|scende]] | | ← una scelta multipla
| $3$   | ${y}{y||input} | | ← un campo numerico legato al modello dello step
```

> Una scelta multipla `[[a|*b|c]]` e la config di una variabile
> `${y}{y|1|input}` **funzionano** dentro `:::table`, mentre in una tabella
> markdown normale la prima no: lì le sue pipe verrebbero lette come divisori
> di cella. Dentro `[[…]]` e dentro `${…}{…}` le pipe sono sintassi; altrove
> in una cella, una pipe letterale si scrive `\|`.

Un campo con iniziale **vuoto** (`${y}{y||input}`) parte vuoto e mette `NaN`
nel modello: "non ancora inserito" non è zero. Serve per le tabelle x-y i cui
valori diventano punti su un grafico (vedi `boundpoints` in `GRAFICI.md`), dove
un punto in $(x, 0)$ sarebbe una risposta suggerita.

> **Attenzione:** dentro `[[…]]` non può esserci una parentesi quadra chiusa,
> quindi niente `\sqrt[4]{2}` fra le opzioni di una scelta multipla.

## L'intestazione

Come in markdown, la prima riga è un'**intestazione** solo se è seguita dalla
riga separatrice `| --- |`. Senza separatore è una riga di dati come le altre
(ma resta la riga che dichiara quali colonne sono corsie).

## Celle che si possono omettere

In una riga di **dati** si possono omettere le celle di corsia finali:

```markdown
| $2^1$    | 2       |          ← la cella della corsia non serve scriverla
```

In una riga di **corsia** si possono omettere le ultime celle: sono etichette, e
quei salti semplicemente non ne hanno.

---

## Esempi

### Una scala che scende, con caselle da completare

```markdown
:::table
| Potenza  | Valore  | v : 2 |
| -------- | ------- | ----- |
| $2^1$    | 2       |
| $2^0$    | [[1]]   |
| $2^{-1}$ | [[1/2]] |
:::
```

### Due corsie, e una freccia che scavalca

A sinistra **una** freccia che copre due passi (`~`), a destra **due** frecce:

```markdown
:::table
| v : 2 | Potenza          | Valore | v : $k$ |
| ----- | ---------------- | ------ | ------- |
|       | $2^1$            | 2      |
| ~     | il gradino nuovo | ?      |
|       | $2^0$            | 1      |
:::
```

### Frecce orizzontali (proporzionalità)

La prima cella è occupata dal marcatore, quindi il primo salto può essere
etichettato solo dal default:

```markdown
:::table
| > | × 3 | × 3   |
| x | 1   | 2     | 3     |
| y | 3   | [[6]] | [[9]] |
:::
```

### Etichette diverse, e una catena spezzata

```markdown
:::table
| Passo | Valore | v   |
| ----- | ------ | --- |
| a     | 3      | × 2 |
| b     | 6      | + 1 |
| c     | 7      | -   |
| d     | 12     |     |
:::
```

### Senza frecce

Una `:::table` senza corsie è una tabella normale: si può usare per uniformare
l'aspetto delle tabelle di uno step in cui ce n'è una con le frecce.

---

## Errori di build

Il blocco fallisce **rumorosamente**, indicando la riga del file: una freccia
che non compare (o che collega le righe sbagliate) è una scheda che lo studente
non può leggere, e in silenzio non se ne accorgerebbe nessuno.

| Errore | Perché |
|---|---|
| riga con più celle della prima | quasi sempre una pipe di troppo |
| riga di dati a cui manca una colonna di dati | si possono omettere solo le corsie finali |
| etichetta sull'ultima riga (colonna) di una corsia | il salto partirebbe dall'ultima riga: la freccia non comparirebbe |
| `~` senza una freccia aperta sopra | non c'è niente da prolungare |
| `~` sull'ultima riga | la freccia non avrebbe dove arrivare |
| corsia con meno di due righe (colonne) di dati | una freccia collega due righe |
| cella non vuota all'incrocio fra due corsie | non ha significato |
| tabella fatta di sole corsie | non ci sono dati da collegare |
| riga che non comincia con `|` | dentro `:::table` ogni riga è una riga di tabella (o manca la chiusura) |
| `:::table` senza `:::` | senza questo controllo diventerebbe un `<table>` aperto e mai chiuso |

---

## Note di implementazione

- **Nessun JavaScript.** Il layout è CSS Grid: le frecce sono elementi della
  griglia posizionati per linee. Ogni riga di dati occupa **due** tracce, così
  una freccia va dal centro di una riga al centro della successiva senza che
  nulla debba essere misurato a runtime. Quando MathJax compone le formule e le
  righe si alzano, la griglia rifluisce e le frecce restano agganciate da sole;
  lo stesso vale per il resize, lo zoom e la stampa.
- Ogni freccia è un **archetto**, non una linea dritta: un SVG che il CSS stira
  sull'altezza della freccia (`preserveAspectRatio="none"`) tenendo il tratto a
  spessore costante (`vector-effect="non-scaling-stroke"`), più una punta fatta
  di bordi CSS. L'arco si gonfia verso l'esterno della tabella: le corsie a
  sinistra (e quelle sopra) ricevono la classe `tbl-freccia--specchio`, che
  ribalta l'arco intero — punta compresa.
- L'etichetta sta **accanto** all'arco (`[arco][etichetta]`, rovesciato nelle
  corsie a sinistra), non sopra: interrompere la curva per farci stare
  l'etichetta la spezzava in due tronconi che non si leggevano più come una
  freccia sola.
- L'arco è **mezza ellisse**: parte dal bordo della tabella all'altezza di una
  riga, si gonfia verso l'esterno e torna sul bordo all'altezza della riga
  successiva. Stirata resta mezza ellisse, cioè un arco semplice **senza
  flessi**: una curva a S si salderebbe con quella sotto e la corsia si
  leggerebbe come un serpentone unico invece che come tanti salti distinti (per
  la stessa ragione ogni arco ha un margine di 5px, che stacca la punta di uno
  dalla partenza del successivo).
- Le tangenti agli estremi sono **parallele al lato della tabella**, ed è
  l'unica direzione che lo stiramento non cambia. Serve perché la punta è un
  triangolo CSS, che non si può ruotare di un angolo dipendente dall'altezza
  della riga: così punta e curva restano allineate a ogni altezza, e la punta
  guarda dentro la tabella, verso la riga a cui la freccia arriva. Gli estremi
  della curva cadono **dentro** il triangolo, che è ancorato al bordo: la
  curva ci finisce sotto invece di sbucarne oltre il vertice.
- Le celle sono renderizzate in build da `_render_inline` (lo stesso callback
  usato dai passi di `:::theorem`), che condivide i contatori del parser: gli id
  dei blank restano unici e finiscono nei goal dello step senza codice
  dedicato.
- Su schermo stretto la tabella si stringe e, se non basta, **scorre in
  orizzontale**. Non diventa un elenco di schede: una scala con le frecce *è*
  una tabella, e spezzarla ne distruggerebbe il senso.
- Gli id dei blank dentro una `:::table` sono assegnati prima di quelli del
  testo che la precede (il preprocessore gira presto). È indifferente, tranne
  per una cosa: i progressi salvati nel browser sono indicizzati per id, quindi
  **aggiungere una tabella a uno step già usato dagli studenti ne azzera i
  progressi**. Vale già oggi per `:::theorem`.
