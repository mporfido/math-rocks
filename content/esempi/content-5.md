> id: tabelle-e-formule
> title: Tabelle con frecce e formule commentate
> description: Quando quello che conta sta fra una riga e l'altra, o fra i due lati dell'uguale.

---

> id: tabella-scala
> title: Una scala che scende

# Le frecce stanno *fra* le righe

In una tabella normale ogni colonna contiene un dato. Ma a volte quello che
conta non è un dato in più: è **l'operazione che porta da una riga alla
successiva** — e quella sta *fra* due righe, non dentro una.

Il blocco `:::table` disegna quelle frecce. Qui la scala delle potenze di 2:
ogni gradino si ottiene dimezzando il precedente.

:::table
| Potenza  | Valore  | v : 2 |
| -------- | ------- | ----- |
| $2^3$    | 8       |
| $2^2$    | [[4]]   |
| $2^1$    | [[2]]   |
| $2^0$    | [[1]]   |
| $2^{-1}$ | [[1/2]] |
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::table
| Potenza  | Valore  | v : 2 |
| -------- | ------- | ----- |
| $2^3$    | 8       |
| $2^2$    | [[4]]   |
| $2^1$    | [[2]]   |
| $2^{-1}$ | [[1/2]] |
:::
```

Il **glifo di verso** `v` al posto di un'intestazione dichiara che quella
colonna non contiene dati ma frecce. Quello che segue (`: 2`) è l'etichetta di
default, valida per tutti i salti della corsia.

Dentro le celle il markdown funziona normalmente: `$2^3$` è una formula, `[[4]]`
è una casella da completare che conta come goal dello step.

📖 Riferimento: `docs/tabelle.md`

:::

:::div.reveal
Guarda la colonna delle potenze: l'esponente scende di 1 a ogni riga, e il
valore si dimezza. La riga $2^0 = 1$ non è una convenzione arbitraria — è
l'unico valore che rende continua la scala.
:::

---

> id: tabella-corsie
> title: Due corsie, e una freccia che scavalca

# Più corsie nella stessa tabella

Le corsie possono essere più d'una, a sinistra e a destra, e sono indipendenti
fra loro. Una cella `~` **prolunga** la freccia aperta sopra invece di aprirne
una nuova: serve per una freccia che scavalca più righe.

A sinistra una sola freccia che copre due gradini (quindi divide per 4), a
destra le due frecce singole:

:::table
| v : 4 | Potenza | Valore | v : 2 |
| ----- | ------- | ------ | ----- |
|       | $2^2$   | 4      |
| ~     | $2^1$   | [[2]]  |
|       | $2^0$   | [[1]]  |
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::table
| v : 4 | Potenza | Valore | v : 2 |
| ----- | ------- | ------ | ----- |
|       | $2^2$   | 4      |
| ~     | $2^1$   | [[2]]  |
|       | $2^0$   | [[1]]  |
:::
```

| Scrivi | Significato |
| --- | --- |
| `v : 2` | etichetta di default della corsia |
| `× 3` in una cella | etichetta di **quel** salto (vince sul default) |
| `-` | **rompe** la catena: qui nessuna freccia |
| `~` | **prolunga** la freccia aperta sopra |

L'etichetta di un salto si scrive nella cella da cui il salto **parte**.

📖 Riferimento: `docs/tabelle.md`

:::

:::div.reveal
Dividere due volte per 2 è dividere una volta per 4. La freccia lunga dice
esattamente questo, e lo dice senza una parola di spiegazione.
:::

---

> id: tabella-orizzontale
> title: Frecce orizzontali

# La stessa cosa, per righe

Il glifo `>` nella **prima cella di una riga** dichiara una corsia orizzontale.
Qui una tabella di proporzionalità diretta: ogni colonna si ottiene dalla
precedente moltiplicando per 3.

:::table
| > | × 3 | × 3   |
| x | 1   | 2     | 3     |
| y | 3   | [[6]] | [[9]] |
:::

E `-` rompe la catena, dove la regola cambia:

:::table
| Passo | Valore | v   |
| ----- | ------ | --- |
| a     | 3      | × 2 |
| b     | 6      | + 1 |
| c     | 7      | -   |
| d     | 12     |     |
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::table
| > | × 3 | × 3   |
| x | 1   | 2     | 3     |
| y | 3   | [[6]] | [[9]] |
:::
```

```md
:::table
| Passo | Valore | v   |
| ----- | ------ | --- |
| a     | 3      | × 2 |
| b     | 6      | + 1 |
| c     | 7      | -   |
| d     | 12     |     |
:::
```

I quattro marcatori: `v` (giù) e `^` (su) come intestazione di colonna, `>`
(destra) e `<` (sinistra) come prima cella di una riga.

Il blocco fallisce **rumorosamente** in build: un'etichetta sull'ultima riga di
una corsia, un `~` senza freccia sopra, una riga con una pipe di troppo fermano
la compilazione indicando la riga. Una freccia che non compare sarebbe una
scheda che lo studente non può leggere, e in silenzio non se ne accorgerebbe
nessuno.

📖 Riferimento: `docs/tabelle.md`

:::

:::div.reveal
Nella seconda tabella la regola cambia a metà: da "× 2" a "+ 1". Il `-`
sull'ultima riga dice che lì la catena si interrompe, invece di far comparire
una freccia senza senso.
:::

---

> id: formula-commentata
> title: Una formula che si commenta da sola

# Che cosa corrisponde a che cosa

Certe formule non si leggono da sinistra a destra. La regola dell'esponente
negativo si capisce solo vedendo **come si corrispondono i pezzi** dei due lati
dell'uguale: la base diventa il suo reciproco, l'esponente cambia segno.

Il blocco `:::formula` disegna proprio quei collegamenti. Passa col mouse (o col
dito, o col TAB) su una freccia:

:::formula
@b1{2}^{@e1{-n}} = \left(@b2{\tfrac{1}{2}}\right)^{@e2{n}}

b1 -> b2 : reciproco
e1 -> e2 : cambia segno
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::formula
@b1{2}^{@e1{-n}} = \left(@b2{\tfrac{1}{2}}\right)^{@e2{n}}

b1 -> b2 : reciproco
e1 -> e2 : cambia segno
:::
```

Tre pezzi: `@nome{…}` marca una sotto-espressione (è un estremo di freccia), una
**riga vuota** separa la formula dalle frecce, e ogni freccia si scrive
`da -> a : commento`.

A riposo tutte le frecce si vedono tenui; toccandone una restano a fuoco solo
lei, il suo commento e i suoi due estremi. Funziona anche al contrario, passando
su un simbolo della formula.

Il lato da cui passa la freccia è automatico (sopra se entrambi gli estremi sono
esponenti, altrimenti sotto); si può forzare con `… | sopra` o `… | sotto`.

**Non è un esercizio**: non conta come goal dello step.

📖 Riferimento: `docs/formula.md`

:::

Verifica di aver capito: se $2^{-3} = \left(\tfrac{1}{2}\right)^{3}$, allora
$2^{-3}$ vale [[1/8]].

:::div.reveal
Esatto. Le due frecce dicono tutta la regola: *ribalta la base, cambia il segno
dell'esponente*. Nessuna delle due cose da sola basta.
:::
