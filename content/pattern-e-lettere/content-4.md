> id: monomi
> title: Monomi
> description: Un pezzo solo, fatto di numeri e lettere moltiplicati fra loro — com'è fatto dentro, e quanto "pesa".

---

> id: raggruppa-a-modo-tuo
> title: Classificare le espressioni

# Sei scritture, tre mucchietti

Qui sotto ci sono sei espressioni. **Mettile in gruppi.**

Non ti dico quanti gruppi, non ti dico il criterio. I contenitori si chiamano A, B e C proprio perché il nome glielo dai tu.

:::smista verdetto=no categorie="Gruppo A;Gruppo B;Gruppo C" titolo="Raggruppale come ti sembra giusto"
3x^2
x^2 + 5
-4ab
2x^3 - x + 7
7
x + y + z
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Non c'è un solo modo giusto. Guarda quante **parti staccate** ha ogni scrittura, oppure quante lettere diverse ci compaiono, oppure se ci sono esponenti. Ogni domanda dà un raggruppamento diverso.

:::

## Che criterio hai usato?

Scegli quello più vicino a quello che hai fatto:

[[select: le ho messe a caso|*ho contato quante parti staccate ha ognuna|ho guardato quante lettere diverse ci sono|ho guardato se hanno esponenti]]

:::div.reveal
**Tutti quei criteri sono buoni**, e ognuno divide le sei scritture in modo diverso. Non c'è un raggruppamento "vero": c'è la domanda che decidi di fare.

In questa lezione ne seguiamo uno solo, il più semplice: **quante parti staccate ha una scrittura**. E cominciamo da quelle che ne hanno **una sola**.

$3x^2$, $-4ab$, $7$ sono di quel tipo. $x^2 + 5$ no: quel $+$ tiene insieme due pezzi.
:::

---

> id: un-pezzo-solo
> title: Monomi

# Una moltiplicazione, e basta

Guarda le scritture con un pezzo solo:

$$3x^2 \qquad -4ab \qquad 7 \qquad \tfrac{1}{2}xy^3$$

Dentro ognuna ci sono solo **moltiplicazioni** (e le potenze, che sono moltiplicazioni ripetute). Nessun $+$, nessun $-$ che separa, nessuna lettera sotto una linea di frazione.

Una scrittura fatta così si chiama **monomio**: *mono* vuol dire uno, come in *monopattino* o *monologo*.

Adesso smista tu. Attenzione: qualcuna è fatta apposta per confondere.

:::smista goal categorie="è un monomio;non è un monomio"
-2ab^2 -> è un monomio
3x + 1 -> non è un monomio
7 -> è un monomio
\frac{5}{x} -> non è un monomio
x -> è un monomio
a^2 - b^2 -> non è un monomio
\frac{xy}{3} -> è un monomio
:::

:::details.hint
<summary>💡 Suggerimento</summary>

La domanda da farsi è una sola: **c'è un $+$ o un $-$ che separa due pezzi?** Se sì, non è un monomio.

Sui due casi con la frazione ragiona così: in $\frac{5}{x}$ la lettera sta **sotto**, cioè si sta dividendo per la lettera. In $\frac{xy}{3}$ invece si divide per 3, che è un numero: è come scrivere $\frac{1}{3}xy$, cioè una moltiplicazione.

:::

:::div.reveal
**Un monomio è un prodotto: numeri e lettere moltiplicati fra loro, niente di più.**

$$-2ab^2 \qquad 7 \qquad x \qquad \tfrac{1}{3}xy$$

Tre casi da tenere a mente, perché sembrano eccezioni e non lo sono:

- **$x$ da solo è un monomio.** Il prodotto ha un fattore solo, e va bene lo stesso.
- **$7$ da solo è un monomio.** Di lettere non ne ha nessuna: è un caso limite, e più avanti in questa lezione vedremo che ha un nome.
- **$\frac{xy}{3}$ è un monomio**, perché dividere per 3 è moltiplicare per $\frac{1}{3}$. Ma $\frac{5}{x}$ **no**: la lettera sotto la linea non si può trasformare in una moltiplicazione.
:::

---

> id: anatomia
> title: Le due parti di un monomio

# Il numero davanti e le lettere dietro

Prendi $-3x^2y^3$ e guardalo a pezzi.

:::formula
@c{-3}@bx{x}^{@ex{2}}@by{y}^{@ey{3}}

c -> c : il numero davanti moltiplica tutte le lettere | sopra
bx -> ex : gli esponenti dicono quante volte ogni lettera si ripete
by -> ey : _
:::

Il numero davanti si chiama **coefficiente**. Tutto il resto — le lettere con i loro esponenti — si chiama **parte letterale**.

Qual è il coefficiente di $-3x^2y^3$? [[-3]]

E la sua parte letterale? [[$-3$|*$x^2y^3$|$x^2$|$y^3$]]

## Due che sembrano non averlo

Qual è il coefficiente di $x^2y$? [[1]]

:::details.hint
<summary>💡 Suggerimento</summary>

Nella lezione scorsa avevi visto che $x$ vuol dire $1 \cdot x$: l'uno non si scrive, ma c'è. Vale anche qui.

:::

E il coefficiente di $-xy$? [[-1]]

:::div.reveal
**Ogni monomio ha un coefficiente e una parte letterale**, anche quando uno dei due non si vede. Il coefficientente è detto anche **parte numerica**.

$$\underbrace{-3}_{\text{coefficiente}}\underbrace{x^2y^3}_{\text{parte letterale}}$$

Quando il coefficiente vale $1$ o $-1$ non lo scriviamo: $x^2y$ è $1 \cdot x^2y$, e $-xy$ è $(-1) \cdot xy$. È una comodità di scrittura, esattamente come il segno di moltiplicazione che sparisce.

E il monomio $7$? Ha coefficiente 7 e parte letterale **vuota**. Anche quello ci servirà fra poco.
:::

---

> id: il-grado
> title: Il grado di un monomio

# Contare i fattori

Due monomi possono avere le stesse lettere ed essere molto diversi:

$$xy \qquad\text{e}\qquad x^4y^3$$

Il secondo è "più grosso", e possiamo dire quanto: basta contare **quanti fattori letterali** ci sono in tutto. In $xy$ ce ne sono 2. In $x^4y^3$ ce ne sono $4 + 3 = 7$.

Questo numero si chiama **grado** del monomio.

Muovi gli slider e guarda la torre: ogni mattoncino è un fattore, l'altezza totale è il grado.

esponente di $x$: ${a}{a|2|0,5,1}

esponente di $y$: ${b}{b|1|0,5,1}

:::p5 sketch=monomio-costruisci lettere=x,y esponenti=a,b coefficiente=3 bind=a,b height=340
:::

Porta gli slider su $x^3y^2$. Che grado ha? [[5]]

## Adesso una sfida

Costruisci un monomio di **grado 5**. Ci sono più modi: te ne basta uno.

esponente di $x$: ${c}{c|1|0,5,1}

esponente di $y$: ${d}{d|1|0,5,1}

:::p5 goal sketch=monomio-costruisci lettere=x,y esponenti=c,d coefficiente=2 grado=5 bind=c,d height=340
:::

Quante coppie di esponenti diverse danno grado 5, contando anche quelle con un esponente uguale a 0? [[6]]

:::details.hint
<summary>💡 Suggerimento</summary>

Elencale: l'esponente di $x$ può valere $0, 1, 2, 3, 4, 5$ — e ogni volta quello di $y$ è quello che manca per arrivare a 5.

:::

:::div.reveal
**Il grado di un monomio è la somma degli esponenti della parte letterale.**

$$x^4y^3 \;\rightarrow\; 4 + 3 = 7$$

Nota due cose che la torre ti ha mostrato:

- **il coefficiente non conta.** $3x^2$ e $100x^2$ hanno lo stesso grado: 2. Il grado parla delle lettere, non dei numeri;
- **quando un esponente va a 0 la lettera sparisce**, e con lei il suo mattoncino. È coerente: $x^0 = 1$, e moltiplicare per 1 non cambia niente.
:::

---

> id: gradi-a-confronto
> title: Smistare per grado

# Lo stesso mazzo, un'altra domanda

All'inizio della lezione avevi raggruppato per "quanti pezzi". Adesso il criterio è un altro: **il grado**.

:::smista goal categorie="grado 1;grado 2;grado 3"
5x -> grado 1
7ab -> grado 2
4x^2y -> grado 3
-y -> grado 1
x^2 -> grado 2
2a^2b -> grado 3
xyz -> grado 3
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Attenzione a $4x^2y$: le lettere sono due, ma gli esponenti sono $2$ e $1$. Somma **gli esponenti**, non le lettere.

E in $xyz$ ogni lettera ha esponente 1, anche se non è scritto: $1 + 1 + 1$.

:::

:::div.reveal
**Contare le lettere e contare il grado sono due cose diverse.**

$$4x^2y \;\rightarrow\; 2 + 1 = 3 \qquad\qquad xyz \;\rightarrow\; 1 + 1 + 1 = 3$$

Questi due monomi hanno lo stesso grado e un aspetto completamente diverso: uno ha due lettere, l'altro tre. Il grado non dice quante lettere ci sono, dice quanti **fattori** in tutto.
:::

---

> id: i-casi-strani
> title: I casi di frontiera

# Tre monomi che mettono alla prova la regola

Le definizioni si capiscono davvero sui casi strani. Eccone tre.

## Primo: la lettera da sola

Che grado ha $x$? [[1]]

## Secondo: il numero da solo

Che grado ha $7$? [[0]]

:::details.hint
<summary>💡 Suggerimento</summary>

Il grado è la somma degli esponenti delle lettere. In $7$ di lettere non ce n'è nessuna: quante ne sommi?

:::

## Terzo: il coefficiente che cambia tutto

Fra $2x^3$ e $50x^3$, quale ha il grado più alto? [[*nessuno dei due, hanno lo stesso grado|$50x^3$, perché 50 è più grande|$2x^3$]]

:::div.reveal
**I casi di frontiera, spiegati.**

| Monomio | Grado | Perché |
| --- | --- | --- |
| $x$ | 1 | l'esponente non scritto vale 1 |
| $7$ | 0 | nessuna lettera, nessun esponente da sommare |
| $2x^3$ e $50x^3$ | 3 entrambi | il coefficiente non entra nel conto |

Un numero da solo è un **monomio di grado zero**. Ha senso perché se metto l'esponente $0$ su una lettera, il risultato è sempre $1$.

C'è un solo monomio che sfugge davvero: **lo zero**. Che grado dovrebbe avere $0$? Puoi scriverlo come $0x$, come $0x^2$, come $0x^{100}$ — sono tutti lo stesso monomio, e ognuno suggerirebbe un grado diverso. Per questo si dice che **il monomio nullo non ha grado**. 
:::

---

> id: monomi-di-famiglia
> title: Monomi della stessa famiglia

# Quelli che si assomigliano

Guarda questi due:

$$3x^2y \qquad\text{e}\qquad -7x^2y$$

Coefficienti diversi, ma la parte letterale è **identica**: $x^2y$ tutte e due.

Adesso questi:

$$3x^2y \qquad\text{e}\qquad 3xy^2$$

Stesso coefficiente, stesse lettere, stesso grado — eppure le parti letterali sono **diverse**: $x^2y$ e $xy^2$ non sono la stessa cosa.

Smista questi sette monomi mettendo insieme quelli che hanno la **stessa parte letterale**.

:::smista goal categorie="parte letterale $ab$;parte letterale $a^2b$;parte letterale $ab^2$"
5ab -> parte letterale $ab$
-2a^2b -> parte letterale $a^2b$
7ab^2 -> parte letterale $ab^2$
-ab -> parte letterale $ab$
\frac{1}{2}a^2b -> parte letterale $a^2b$
3ab -> parte letterale $ab$
-4ab^2 -> parte letterale $ab^2$
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Copri con un dito il numero davanti e guarda solo quello che resta. Due monomi vanno insieme se, coperto il coefficiente, vedi esattamente la stessa scrittura.

:::

:::div.reveal
**Due monomi con la stessa parte letterale si dicono simili.**

$$5ab, \quad -ab, \quad 3ab \qquad \text{sono simili fra loro}$$

Attenzione: *simili* non vuol dire "che si assomigliano". Vuol dire una cosa precisa: **stesse lettere, stessi esponenti**. $a^2b$ e $ab^2$ hanno lo stesso grado e le stesse lettere, ma non sono simili.

E perché ci interessa? Perché i monomi simili sono gli unici che si possono **mettere insieme**:

$$5ab - ab + 3ab = 7ab$$

Esattamente come 5 mele meno una mela più 3 mele fanno 7 mele — mentre 5 mele più 3 pere restano 5 mele e 3 pere.

**Nella prossima lezione:** cosa succede quando i pezzi sono più di uno e il $+$ non si può togliere.
:::
