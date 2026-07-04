> id: proprieta-potenze
> title: Le proprietà delle potenze
> description: La modalità potenze di "Sciogliamo i nodi" - le potenze restano simboliche e si riducono con le proprietà.

---

> id: modalita-potenze
> title: La modalità potenze

# La modalità potenze

Con il blocco `:::powers` (alias di `:::expr powers`) le potenze **restano
simboliche**: niente numeroni calcolati, le operazioni tra potenze si riducono
applicando le **proprietà**. Qui il quoziente di potenze con la **stessa
base**: clicca il `:` e scrivi il risultato in forma di potenza (es. `7^3`) —
lì il valore numerico del quoziente riceve solo un suggerimento. Resta invece
percorribile la via "calcola tutto": cliccare gli esponenti, valutare le due
potenze e dividere i numeri — ma quando c'era una proprietà a disposizione un
messaggio te lo fa notare, con un bottone per **annullare l'ultimo passaggio**.

:::powers
7^15 : 7^12
:::

:::div.reveal
**Bravo!** Hai applicato la proprietà senza calcolare `7^15` (che fa quasi
cinque **mila miliardi**): è esattamente il punto delle proprietà delle potenze.
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::powers
7^15 : 7^12
:::
```

Cliccando l'**esponente** di una singola potenza la si può comunque
**valutare** (es. `2^3` → `8`): è il percorso per i casi in cui nessuna
proprietà si applica.

:::

---

> id: prodotto-e-ambiguita
> title: Prodotto e forme equivalenti

# Prodotto con la stessa base

Risposta attesa: `2^7`. In alternativa puoi valutare le due potenze (click
sugli esponenti: `8` e `16`) e poi moltiplicare: `128`.

:::powers
2^3 * 2^4
:::

# Quando due forme sono giuste entrambe

`2^3 · 2^3` soddisfa **due** proprietà: stessa base (→ `2^6`) e stesso
esponente (→ `4^3`). Sono accettate entrambe le risposte.

:::powers
2^3 * 2^3
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::powers
2^3 * 2^4
:::

:::powers
2^3 * 2^3
:::
```

La validazione è per **insieme di risultati validi**: dove più proprietà si
applicano, ogni forma corretta è accettata e il nodo collassa nella forma
digitata.

:::

---

> id: cambio-di-base
> title: Basi riconducibili

# Il cambio di base

Le basi sono diverse… ma `9 = 3^2`! Clicca la potenza `9^3` e **riscrivila**
come `3^6` (oppure valutala: `729`). Poi il quoziente con la stessa base
scatta normalmente. Se clicchi subito il `:`, un messaggio ti suggerisce la
riscrittura.

:::powers
9^3 : 3^5
:::

:::div.reveal
**Perfetto!** Il cambio di base è il ponte tra basi riconducibili: una volta
riscritte, le proprietà fanno il resto.
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::powers
9^3 : 3^5
:::
```

Il click sull'esponente di una potenza accetta **sia** il valore calcolato
**sia** una potenza equivalente con altra base (es. `9^3` → `3^6`, validata
strutturalmente: niente riscritture "a caso").

:::

---

> id: potenza-di-potenza
> title: Potenza di potenza e stesso esponente

# Potenza di potenza

Risposta attesa: `2^6`. Il prompt mostra la base tra parentesi: `(2^3)^2`.

:::powers
(2^3)^2
:::

# Stesso esponente

Basi diverse, esponente uguale: `2^3 · 5^3 = 10^3`.

:::powers
2^3 * 5^3
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::powers
(2^3)^2
:::

:::powers
2^3 * 5^3
:::
```

:::

---

> id: misti-e-no-eval
> title: Espressioni miste e no-eval

# Espressione mista

`2 · 2^3` accetta `2^4` (un numero uguale alla base vale come potenza con
esponente 1). Il `+` fra potenze invece **non ha proprietà**: il messaggio
invita a calcolarle. Puoi valutare una potenza anche **dopo** averla ottenuta
da una proprietà, cliccando la sua etichetta nell'albero.

:::powers
2 * 2^3 + 3^2
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::powers
2 * 2^3 + 3^2
:::
```

:::

# Il flag `no-eval`

Con `no-eval` la valutazione numerica è **vietata**: l'unico percorso è la
proprietà (qui `5^3` sul `:`). Da usare solo su espressioni interamente
risolvibili con le proprietà. Il tasto ✕ (o Esc) chiude un prompt aperto per
sbaglio.

:::powers no-eval
5^9 : 5^6
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::powers no-eval
5^9 : 5^6
:::
```

:::
