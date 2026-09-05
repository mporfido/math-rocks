> id: lavagna-delle-mosse
> title: La lavagna delle mosse
> description: Il blocco :::algebra — un'equazione che si trasforma una mossa per volta, dove il traguardo è una forma e non un valore.

---

> id: come-si-usa
> title: Come si usa

# La lavagna delle mosse

Qui sotto c'è un'equazione. Non si risolve scrivendo la risposta: si
**trasforma**, una mossa per volta, finché non ha la forma che serve.

Tre modi di dare una mossa, e fanno tutti la stessa cosa:

- **clicca un pezzo** della scrittura: compaiono le mosse che si possono fare
  su quel pezzo. Il termine si seleziona insieme al suo segno: in `x−5`
  scegli `−5`, anche cliccando sul meno. Per scegliere tutta la somma usa
  **Seleziona espressione contenitrice**;
- **i moduli in basso** (senza niente selezionato) applicano i due principi ai
  due membri: scegli l'operazione e scrivi per quanto;
- **trascina un termine**: attraverso l'uguale lo porti dall'altra parte, su un
  termine simile apri la somma, di lato lo sposti di posto.

Quando la mossa comporta un **calcolo**, il risultato lo scrivi tu: il motore
sa già quanto fa, ma quel conto è tuo. Quando non c'è niente da calcolare — i
principi, il trasporto, lo spostamento — lo scrive lui.

`Annulla` torna indietro di un passaggio. `Ci sono?` dice che cosa manca.

Prova qui: porta questa equazione alla forma `x = numero`.

:::algebra isola="x"
2x + 3 = 8
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::algebra isola="x"
2x + 3 = 8
:::
```

Una sola equazione per blocco, e un **traguardo** dichiarato: `isola="x"` vuole
la sola `x` a sinistra. Con un traguardo il blocco è un **goal**, e completarlo
dà la spunta allo step.

Riferimento completo: [docs/algebra.md](../../docs/algebra.md).
:::

---

> id: traguardi
> title: Il traguardo è una forma

# Fermarsi al punto giusto

La stessa equazione, un traguardo diverso. Qui basta arrivare ad `ax = b`, cioè
`2x = 5`: l'incognita da sola a sinistra **col suo coefficiente**, un numero a
destra. Non è un pezzo di strada verso `x = 5/2`, è una forma di arrivo.

:::algebra forma="ax=b"
2x + 3 = 8
:::

Quando in gioco c'è più di una lettera, il traguardo deve dire **qual è
l'incognita**: qui la `a` è un parametro, e l'arrivo è `5x = 5a`.

:::algebra forma="ax=b" incognita="x"
3x + 2x = 5a
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::algebra forma="ax=b"
2x + 3 = 8
:::

:::algebra forma="ax=b" incognita="x"
3x + 2x = 5a
:::
```

I traguardi sono `isola="x"`, `forma="ax=b"`, `forma="normale"`,
`forma="ridotta"` e il flag `libera`. Uno solo per blocco: dichiararne due (o
nessuno) ferma la build.

`incognita` serve solo con `forma="ax=b"` e solo quando le lettere sono più di
una — altrove ferma la build, invece di farsi scrivere e poi ignorare.
:::

---

> id: retta
> title: Da implicita a esplicita

# Isolare una lettera

Questa è l'equazione di una retta in forma implicita. Portala in forma
esplicita, cioè con la **y da sola a sinistra**.

Ci vogliono sette mosse: due trasporti, un termine nullo da buttare, un secondo
principio e i calcoli che ne restano. Se ti perdi, `Ci sono?` dice qual è la
cosa da sistemare per prima.

:::algebra isola="y"
2x + 3y - 6 = 0
:::

:::details.hint
<summary>💡 Da dove comincio?</summary>

Il `−6` e il `2x` sono i due termini che a sinistra non ci devono stare: mandali
dall'altra parte. Poi resta un `3y` da alleggerire, ed è lì che serve il secondo
principio.
:::

---

> id: normale
> title: La forma normale

# Tutto a sinistra

La **forma normale** di un'equazione di secondo grado vuole tutti i termini a
sinistra, ordinati per grado decrescente, e uno zero a destra.

:::algebra forma="normale"
x^2 + 3x = 4 - 2x
:::

Senza il segno di uguale il traguardo diventa `forma="ridotta"`: la stessa
richiesta — termini simili sommati, monomi in forma normale, grado decrescente —
applicata a una sola espressione.

:::algebra forma="ridotta"
3x + 2(x - 4) + 5
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::algebra forma="normale"
x^2 + 3x = 4 - 2x
:::

:::algebra forma="ridotta"
3x + 2(x - 4) + 5
:::
```

`forma="ridotta"` è l'unico traguardo che **non** vuole un'equazione: se il
corpo contiene un `=` la lavagna lo dice subito.

Il prodotto `2(x - 4)` si svolge con la mossa *Svolgi il prodotto*, e lo
sviluppo lo scrivi tu — vale anche per i prodotti notevoli.
:::

---

> id: notevoli
> title: I prodotti notevoli

# Svolgere un quadrato di binomio

I prodotti notevoli non hanno una mossa loro: si svolgono con **Svolgi il
prodotto**, come tutti gli altri. Clicca il prodotto — il `(x + 3)^2`, non
tutta l'espressione — e scrivi lo sviluppo per intero.

:::algebra forma="ridotta"
(x + 3)^2 - 9
:::

Prova apposta a **dimenticare il doppio prodotto**, o a sbagliarlo di metà: qui
la lavagna non si limita a dire che il conto non torna, ti dice *quale* dei tre
pezzi non torna.

Stessa cosa con la differenza di quadrati. Qui i due prodotti incrociati si
annullano fra loro, e se te ne resta uno per strada te lo sentirai dire.

:::algebra forma="ridotta"
(x - 5)(x + 5) + 25
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::algebra forma="ridotta"
(x + 3)^2 - 9
:::
```

Niente di speciale nel blocco: la mossa `espandi` è la stessa che svolge
`2(x - 4)`, e l'oracolo di equivalenza sviluppa da sé anche `(2a + b)^2` o
`(x + 1)^3`.

Quello che cambia è la **diagnosi**: quando il pezzo selezionato è un quadrato
di binomio o una differenza di quadrati, uno sviluppo sbagliato riceve un
messaggio che dice quale condizione cade, invece del generico «non vale quanto
il pezzo che stai sostituendo». Il valore giusto non lo scrive comunque:
quello resta il tuo conto.
:::

---

> id: mosse-scelte
> title: Solo certe mosse

# Una strada sola

Qui sono abilitate **solo** le mosse dei gesti: trasporto, somma dei simili,
spostamento, e i due ripuliti finali. Niente principi, niente ordinamento
automatico — l'equazione si muove solo trascinando (o con i bottoni gemelli,
che fanno la stessa cosa).

:::algebra forma="normale" mosse="trasporto;riduci-simili;sposta;sposta-sinistra;sposta-destra;calcola;elimina-nullo"
5x + 4 - 2x = 9
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::algebra forma="normale" mosse="trasporto;riduci-simili;sposta;sposta-sinistra;sposta-destra;calcola;elimina-nullo"
5x + 4 - 2x = 9
:::
```

`mosse="…"` è l'elenco degli id abilitati, separati da `;`. Omesso, sono
abilitate tutte. Un id inesistente **ferma la build**: una whitelist con un
refuso dentro è una scheda che nessuno può finire, e va scoperta prima della
lezione.

Prima di pubblicare un esercizio con una whitelist stretta, giocalo: è facile
togliere senza accorgersene la mossa che serviva a chiuderlo.
:::

---

> id: libera
> title: Lavagna libera

# Senza traguardo

Questa non ha un obiettivo e non è un esercizio: si può muovere all'infinito
senza che si chiuda niente. Serve alla lezione che vuole **far vedere** una
mossa invece di farla fare.

Prova a fare una mossa illecita: dividere per una lettera, o scrivere un
risultato sbagliato in un calcolo. Non succede, e la lavagna dice perché.

:::algebra libera
3(x + 2) - 4x = 5 - x
:::

Prova anche a moltiplicare termine a termine per `−1`: con **Semplifica**
puoi riscrivere `−1(3(x+2))` come `−3(x+2)`, mantenendo la parentesi.
Con **Svolgi il prodotto**, sullo stesso pezzo, puoi invece scrivere
`−1(3x+6)` oppure sviluppare tutto in `−3x−6`.
Selezionando `−(−1x)` selezioni anche il meno esterno: il risultato da
scrivere è `x`.

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::algebra libera
3(x + 2) - 4x = 5 - x
:::
```

`libera` è un flag e prende il posto del traguardo. Senza traguardo non c'è
niente da completare, quindi il blocco **non è un goal**: uno step fatto di sole
lavagne libere si chiude da sé.
:::
