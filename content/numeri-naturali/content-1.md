> id: introduzione
> title: Introduzione ai numeri naturali
> description: Cosa sono i numeri naturali e a cosa servono.

---

> id: la-semiretta
> title: I numeri naturali sulla retta

# I numeri naturali

I **numeri naturali** sono i numeri che usiamo per contare: 0, 1, 2, 3, … Partono
da **zero** e proseguono **all'infinito**. Possiamo immaginarli come punti ordinati
su una **semiretta**: una linea che ha un inizio (lo 0) ma non ha fine.

L'insieme dei numeri naturali si indica con il simbolo $\mathbb{N} = \left\lbrace 0, 1, 2, 3, 4, \dots \right\rbrace$

:::div.highlight
👆 **Esplora la semiretta**: passa il mouse (o tocca con il dito) sui pallini per
scoprire il **precedente** e il **successivo** di ogni numero. Poi prova a toccare
il segmento colorato tra **0 e 1**.
:::

:::p5 sketch=semiretta-naturali height=260
:::

---

> id: ordine
> title: L'ordine dei numeri naturali

# I numeri naturali sono ordinati

Sulla retta ogni numero ha una **posizione precisa**: più ci spostiamo verso
**destra**, più i numeri **crescono**; più andiamo verso **sinistra**, più
**diminuiscono**. Per questo diciamo che l'insieme $\mathbb{N}$ è **ordinato**:
presi due numeri qualsiasi, possiamo sempre dire quale viene prima.

Per confrontarli usiamo due simboli:

- il simbolo **minore** `<` : `3 < 5` si legge "3 è **minore** di 5";
- il simbolo **maggiore** `>` : `8 > 2` si legge "8 è **maggiore** di 2".

:::div.highlight
💡 **Trucco**: il simbolo si apre sempre verso il numero **più grande** e si
chiude (la punta) verso quello **più piccolo**.
:::

## Esercizio 1: inserisci il simbolo giusto

Scegli dal menu il simbolo corretto (`<` o `>`) tra i due numeri:

- `4` [[select: <|*>]] `1`
- `2` [[select: *<|>]] `7`
- `9` [[select: <|*>]] `6`
- `0` [[select: *<|>]] `5`

## Esercizio 2: il successivo

Il **successivo** di un numero è quello che lo segue subito sulla retta (cioè
il numero $+1$).

- Il successivo di `6` è [[7]]
- Il successivo di `9` è [[10]]
- Il successivo di `0` è [[1]]

## Esercizio 3: il precedente

Il **precedente** di un numero è quello che lo precede subito sulla retta (cioè
il numero $-1$). Ricorda: lo **0 non ha precedente**!

- Il precedente di `4` è [[3]]
- Il precedente di `10` è [[9]]
- Il precedente di `1` è [[0]]

:::div.reveal
🎉 **Ottimo!** Hai capito che i numeri naturali sono ordinati: ognuno ha un
successivo, e tutti tranne lo 0 hanno un precedente. Con i simboli `<` e `>`
puoi confrontare due numeri qualsiasi.
:::

---

> id: ordine-operazioni
> title: L'ordine delle operazioni

# In che ordine si calcola?

Quando in un'espressione ci sono **più operazioni**, l'ordine in cui le svolgiamo
**cambia il risultato**. Prendiamo:

$$2 + 3 \times 4$$

- Se calcoliamo **da sinistra** facendo prima la somma: $2 + 3 = 5$ e poi
  $5 \times 4 = 20$.
- Se facciamo prima la **moltiplicazione**: $3 \times 4 = 12$ e poi $2 + 12 = 14$.

Due risultati diversi per la **stessa** espressione! Per non fare confusione, i
matematici si sono messi d'accordo su una **regola valida per tutti**:

:::div.highlight
🔑 **La regola della precedenza**: prima si svolgono le **moltiplicazioni** ($\times$)
e le **divisioni** ($\div$), poi le **addizioni** ($+$) e le **sottrazioni** ($-$).

Quindi $2 + 3 \times 4 = 14$ è il risultato corretto.
:::

Ora prova tu con il metodo "a nodi": **clicca l'operazione** che si può svolgere
(quella con la precedenza più alta) e inserisci il risultato. Il nodo "scende" di un livello e
diventa un nuovo operando.

:::div.highlight
ℹ️ Nel riquadro la moltiplicazione è scritta con un puntino `·` (quindi `3 · 4`
vuol dire $3 \times 4$) e la divisione con i due punti `:` (quindi `6 : 2` vuol
dire $6 \div 2$).
:::

Comincia: la moltiplicazione va risolta **prima** della somma.

:::expr
2 + 3 * 4
:::

Anche qui la moltiplicazione viene prima della sottrazione:

:::expr
10 - 2 * 3
:::

E la divisione viene prima dell'addizione:

:::expr
4 + 6 : 2
:::

Adesso ce ne sono due ad alta precedenza: svolgi prima `5 · 2` e `8 : 4`, poi la
somma.

:::expr
5 * 2 + 8 : 4
:::

:::div.reveal
🎉 **Bravo!** Hai applicato la regola della precedenza: prima `×` e `÷`, poi `+` e
`−`. Così tutti, calcolando la stessa espressione, ottengono lo **stesso** risultato.
:::

---

> id: stessa-precedenza
> title: Operazioni con la stessa precedenza

# E se hanno la stessa precedenza?

La regola di prima dice cosa fare quando le operazioni sono **diverse**. Ma se in
fila ci sono operazioni con la **stessa** precedenza — per esempio due sottrazioni?

$$9 - 4 - 2$$

- Partendo **da sinistra**: $9 - 4 = 5$ e poi $5 - 2 = 3$.
- Partendo **da destra**: $4 - 2 = 2$ e poi $9 - 2 = 7$.

Ancora due risultati diversi! Serve una seconda regola:

:::div.highlight
🔑 **Stessa precedenza, da sinistra a destra**: quando le operazioni hanno la
stessa precedenza (somme e sottrazioni tra loro, oppure moltiplicazioni e
divisioni tra loro), si svolgono **nell'ordine in cui sono scritte**, da sinistra
verso destra.

Quindi $9 - 4 - 2 = 3$ è il risultato corretto.
:::

Prova: nel riquadro puoi svolgere solo l'operazione **più a sinistra**.

:::expr
9 - 4 - 2
:::

Somma e sottrazione hanno la stessa precedenza: vai sempre da sinistra.

:::expr
10 - 4 + 3
:::

Vale lo stesso per le divisioni in fila:

:::expr
24 : 4 : 2
:::

Un altro con divisione e moltiplicazione: risolvi `20 : 5` e poi il resto.

:::expr
20 : 5 * 2
:::

:::div.reveal
🎉 **Perfetto!** A parità di precedenza si procede **da sinistra verso destra**.
Insieme alla regola precedente, ora sai mettere in ordine qualsiasi catena di
operazioni.
:::

---

> id: parentesi
> title: Le parentesi

# Le parentesi comandano

E se volessimo davvero fare **prima** la somma e **poi** la moltiplicazione? Esiste
un modo per "scavalcare" la precedenza: le **parentesi**.

Quello che sta **dentro le parentesi** si calcola **per primo**. Guarda la
differenza:

- Senza parentesi: $2 + 3 \times 4 = 2 + 12 = 14$.
- Con le parentesi: $(2 + 3) \times 4 = 5 \times 4 = 20$.

:::div.highlight
🔑 **Le parentesi prima di tutto**: si svolgono per prime le operazioni racchiuse
tra parentesi, poi si applicano le regole di precedenza e da sinistra a destra.
:::

Nel riquadro l'unica operazione "pronta" è quella dentro le parentesi: risolvi
prima `2 + 3`.

:::expr
(2 + 3) * 4
:::

Qui le parentesi cambiano il segno del risultato rispetto a `10 - 4 + 3`:

:::expr
10 - (4 + 3)
:::

Prima la parentesi, poi la divisione:

:::expr
(12 - 2) : 5
:::

Quando ci sono **due** parentesi, sciogli prima entrambe e poi l'operazione che le
collega.

:::expr
(6 - 1) * (2 + 2)
:::

:::div.reveal
🎉 **Ottimo lavoro!** Ora conosci le tre regole per calcolare un'espressione:
**prima le parentesi**, poi **moltiplicazioni e divisioni**, infine **addizioni e
sottrazioni** — e a parità di precedenza si va **da sinistra a destra**.
:::

---

> id: sfide
> title: Le sfide

# Mettiti alla prova

Hai imparato tutte le regole: ora qualche **sfida**, con espressioni un po' più
lunghe. Fin qui hai risolto le espressioni "a nodi", ma esiste anche il modo
**classico**, quello che userai sul quaderno: si svolge **un'operazione alla
volta** e si **riscrive l'espressione più corta** dopo ogni passo, finché resta
un solo numero.

I due metodi vanno **di pari passo**: ogni nodo che risolvi è esattamente
un'operazione del calcolo scritto in colonna.

:::div.highlight
👇 In queste sfide, **sotto** ogni albero compare lo **svolgimento classico**:
risolvi le operazioni sui nodi e guarda l'espressione che si **semplifica riga
per riga**, con il segno `=` incolonnato come sul quaderno.
:::

Comincia con un ripasso: prima la moltiplicazione, poi somma e sottrazione da
sinistra a destra.

:::expr show-steps
8 + 4 * 3 - 5
:::

Qui la parentesi viene prima di tutto, poi la moltiplicazione e infine la
sottrazione.

:::expr show-steps
2 * (3 + 5) - 9
:::

# Le parentesi quadre

A volte un'espressione ha **più livelli** di raggruppamento. Dopo le parentesi
tonde si usano le **parentesi quadre** `[ ]`, che racchiudono gruppi in cui ci
sono già delle tonde.

:::div.highlight
🔑 **Da dentro verso fuori**: si svolge prima ciò che è tra le **tonde**, poi ciò
che è tra le **quadre**. Le quadre, insomma, "aspettano" che le tonde al loro
interno siano già risolte.
:::

Risolvi prima la tonda, poi quello che resta dentro le quadre, e infine la
divisione finale.

:::expr show-steps
[ (8 - 3) * 2 + 4 ] : 7
:::

Anche qui: svuota prima le quadre (partendo dalla tonda dentro di esse), poi fai
la sottrazione esterna.

:::expr show-steps
20 - [ (2 + 3) * 2 + 6 ]
:::

# Le parentesi graffe

Quando i livelli sono **tre**, il più esterno usa le **parentesi graffe** `{ }`.
L'ordine di annidamento, dal di dentro al di fuori, è sempre lo stesso:

:::div.highlight
🔑 **Tonde → quadre → graffe**, cioè $\lbrace\,[\,(\ \dots\ )\,]\,\rbrace$: si svolgono prima
le **tonde**, poi le **quadre**, infine le **graffe**, e solo alla fine le
operazioni rimaste fuori da tutto.
:::

Procedi un livello alla volta, dal più interno al più esterno.

:::expr show-steps
{ [ (3 + 2) * 4 - 5 ] : 3 + 1 } * 2
:::

Ultima sfida: tonde, quadre e graffe tutte insieme. Vai con calma, da dentro
verso fuori.

:::expr show-steps
{ 10 + [ (6 - 2) * 3 - 4 ] } : 2
:::

:::div.reveal
🎉 **Sfida superata!** Ora sai svolgere anche le espressioni a più livelli con
tonde, quadre e graffe — sia con il metodo a nodi, sia con lo svolgimento
classico passo dopo passo. Sono lo stesso ragionamento, scritto in due modi.
:::

---

> id: approfondimento
> title: Si può dividere per zero?

# Approfondimento: Perché non si può dividere per zero?

Alcune operazioni non si possono eseguire all'interno dei numeri naturali, come ad esempio $3 - 5$. Noi sappiamo che il risultato è $-2$, ma quello è un numero negativo (fa parte dei numeri *interi* o *relativi*) e non è un numero naturale.

Anche $1 : 2$ non ha un risultato nei numeri naturali, ma i numeri *razionali* esistono per permettere anche queste divisioni (sappiamo che il risultato è $\frac{1}{2}$ o $0,5$). Studieremo nel dettaglio anche questi numeri.

Ci sono però alcune operazioni che **non hanno proprio senso**, non solo nei numeri naturali, ma in qualsiasi insieme numerico. Ad esempio $1 : 0$ è una operazione che non ammette alcun risultato per definizione. Cerchiamo di capire perchè.

## Le operazioni inverse

La **sottrazione** non è una operazione indipendente ma è inversa dell'addizione: che vuol dire? Vuol dire che $7$ meno $4$ fa $3$ **perché $3$ più $4$ fa $7$**. Posso spiegare come funziona la sottrazione usando solo un'altra operazione: l'addizione.

Adesso possiamo capire meglio perche $3-5$ non si può fare nei numeri naturali: 

[[perché non posso togliere cinque oggetti se ne ho solo tre|*perché nessun numero naturale, aggiunto a 5, può dare 3 come risultato|perché 3-5 è un numero negativo]]

Ora passiamo alla divisione, che invece è l'operazione inversa della moltiplicazione: $15:3$ fa $5$ perché $5 \cdot 3 = 15$. Ancora una volta, il funzionamento della divisione si spiega usando un'altra operazione: la moltiplicazione.

Quanto fa $0:5$?

[[non si può fare perché nessun numero naturale moltiplicato per $5$ fa $0$|*fa $0$ perché $0 \cdot 5 = 0$|fa $5$ perché $0 \cdot 5 = 5$]]

Ora pensaci bene: quanto fa $5:0$?
[[*non si può fare perché nessun numero naturale moltiplicato per $0$ fa $5$|fa $0$ perché $0 \cdot 5 = 0$|fa $5$ perché $0 \cdot 5 = 5$]]

:::div.reveal
Il punto è proprio quello! Qualsiasi numero, **moltiplicato per zero fa zero** e non può dare nessun altro risultato, nemmeno un numero negativo o con la virgola...

**BONUS: quanto fa $0:0$?**

Questa volta ci rendiamo conto che qualsiasi numero $n$, moltiplicato per zero, farà sempre zero! E quindi qualsiasi numero può essere soluzione di questa operazione. Motivo per cui non diciamo che è impossibile, ma che è **indeterminata**
:::