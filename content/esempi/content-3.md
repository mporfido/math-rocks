> id: sciogliamo-i-nodi
> title: Sciogliamo i nodi
> description: Risolvi le espressioni col metodo grafico ad albero, un'operazione per volta.

---

> id: il-metodo
> title: Il metodo

# Sciogliamo i nodi

Risolvere un'espressione non è altro che **sciogliere un nodo per volta**.

Ogni operazione è un **nodo**: due numeri (gli operandi) e l'operatore tra loro
confluiscono in un punto su una **linea di livello** più in basso. Si parte dalle
operazioni più "interne" — quelle dentro le parentesi e con la precedenza più alta —
e si scende, livello dopo livello, fino all'**ultimo nodo**, che è il risultato.

Le regole del gioco:

- **Un'operazione per volta**: puoi sciogliere solo i nodi *riducibili*, cioè quelli i
  cui due operandi sono già dei numeri.
- **Rispetta parentesi e precedenza**: prima le parentesi, poi le potenze, poi
  moltiplicazioni e divisioni, infine addizioni e sottrazioni.
- Ogni nodo sciolto **scende di un livello** e diventa a sua volta un operando.

Nelle pagine seguenti tocca a te: **clicca l'operatore** dell'operazione che vuoi
svolgere e **inserisci il risultato**.

---

> id: esempio-1
> title: Primo esercizio

# Primo esercizio

Comincia da un'espressione con sole parentesi tonde. Ricorda: clicca un operatore solo
quando entrambi i suoi numeri sono pronti.

:::expr
(4 + 5) * 4 - 8 : (2 + 6)
:::

:::div.reveal
**Bravo!** Hai sciolto tutti i nodi. Nota come la struttura ad albero rende visibile
l'ordine in cui le operazioni "scendono" fino al risultato.
:::

---

> id: esempio-2
> title: Cambia le parentesi

# Le parentesi cambiano l'albero

Stessi numeri, parentesi diverse: l'albero — e quindi l'ordine delle operazioni —
cambia completamente.

:::expr
4 + 5 * 4 - 8 : 2 + 6
:::

:::div.reveal
La precedenza fa il suo lavoro: `5 · 4` e `8 : 2` si sciolgono prima delle addizioni e
delle sottrazioni, anche senza parentesi.
:::

---

> id: esempio-potenze
> title: Con le potenze

# Espressioni con le potenze

Le **potenze** hanno la precedenza più alta dopo le parentesi: vanno sciolte prima di
moltiplicazioni, divisioni, addizioni e sottrazioni. Questa espressione mette insieme
potenze, numeri negativi e tutti i tipi di parentesi.

:::expr
{(-2)^3 + [2^2 + (5 + 4*3) - 4:2]} + (-2)
:::

:::div.reveal
**Perfetto!** Hai gestito le potenze al posto giusto nell'ordine: `(-2)^3 = -8` e
`2^2 = 4` si sciolgono prima delle somme che li contengono.
:::

---

> id: potenze2
> title: Ancora con le potenze

:::expr
(-2*3+5)^3-[(3-7)^2-2*6]^(3-2)
:::

---

> id: esempio-frazioni
> title: Con le frazioni

# Espressioni con le frazioni

Il metodo funziona allo stesso modo con i numeri razionali. Inserisci i risultati come
frazione (es. `7/4`) oppure come intero quando il risultato è intero.

:::expr
4/3 + 5/2 * (4/3 - (8/3 : 2/3) + 6/5)
:::

:::div.reveal
**Ottimo!** Hai sciolto un'espressione con le frazioni mantenendo i valori esatti, senza
mai passare per i numeri decimali.
:::
