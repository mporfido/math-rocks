> id: minimi-termini
> title: Ridurre ai minimi termini
> description: Diamo a ogni frazione il suo nome più corto, con il MCD

---

> id: tre-pannelli
> title: Frazioni diverse, stessa superficie?

# Tre pannelli da confrontare

La fabbrica di pannelli solari ha messo in produzione tre nuovi modelli. Hanno tutti la stessa dimensione, ma sono divisi in un numero diverso di settori.

:::p5 sketch=frazioni-pannelli-confronto pannelli="DELTA 18/24 6, EPSILON 45/60 10, ZETA 20/30 6" height=300
:::

- Il modello **DELTA** ha 24 settori, di cui 18 attivi: $\frac{18}{24}$.
- Il modello **EPSILON** ha 60 settori, di cui 45 attivi: $\frac{45}{60}$.
- Il modello **ZETA** ha 30 settori, di cui 20 attivi: $\frac{20}{30}$.

I settori attivi sono sparsi qua e là, quindi a occhio non si capisce niente. E i sei numeri in gioco sono tutti diversi fra loro.

Secondo te, quali modelli hanno la **stessa superficie attiva**?

[[Tutti e tre: hanno la stessa dimensione|*DELTA ed EPSILON|DELTA e ZETA|Nessuno: i numeri sono tutti diversi]]

:::div.reveal
Per deciderlo non servono occhi buoni: serve dare a ogni frazione il suo **nome più corto**. È quello che impariamo in questa lezione, e alla fine torniamo qui a controllare.
:::

---

> id: raggruppare-i-settori
> title: Semplificare raggruppando i settori

# Settori più grandi, stessa superficie

Nella lezione scorsa hai visto che i settori si possono **raggruppare**: il pannello non cambia, cambia solo il modo di contarlo. Sui numeri quel raggruppamento è una divisione, e l'operazione si chiama **semplificare** la frazione.

Ecco il modello **MINI**: 8 settori in tutto, 6 attivi, cioè $\frac{6}{8}$. Muovi lo slider per raggruppare i settori.

Settori per gruppo: ${gruppi}{g|1|1,4,1}

:::p5 sketch=frazioni-raggruppa n=6 d=8 cols=4 nome=MINI height=280 bind=g
:::

Porta lo slider su **2**. I settori sono raggruppati a coppie.

Quanti gruppi ci sono in tutto? [[4]]

Quanti di quei gruppi sono fatti di settori attivi? [[3]]

Ora porta lo slider su **4**. I gruppi sono due, grandi uguali, ma uno dei due diventa arancione. Che cosa è andato storto?

[[I due gruppi hanno dimensioni diverse|*Un gruppo è mezzo acceso e mezzo spento, quindi non si può contare né fra gli attivi né fra gli spenti|I settori attivi sono troppo pochi]]

:::div.reveal
**Esatto.** Con i gruppi da 2 il pannello si legge come $\frac{3}{4}$: tre gruppi attivi su quattro. La superficie non è cambiata, è cambiata solo la taglia dei settori.

Sui numeri è la divisione che già conosci: $6 : 2 = 3$ e $8 : 2 = 4$.

:::formula
\frac{@n0{6}}{@d0{8}} = \frac{@n1{3}}{@d1{4}}

n0 -> n1 : diviso 2
d0 -> d1 : diviso 2
:::

Il raggruppamento funziona solo se il numero scelto **divide sia il numeratore sia il denominatore**. Il 4 divide l'8, e infatti i due gruppi sono grandi uguali; ma non divide il 6, e allora i settori attivi non riempiono un numero intero di gruppi.

Prova anche il raggruppamento a **3**: lì non torna nemmeno il totale, perché 8 settori non si dividono in gruppi da 3 e l'ultimo gruppo resta spaiato.
:::

---

> id: strade-diverse
> title: Semplificare in più passaggi

# Più strade, stesso arrivo

Il modello **MIDI** ha 18 settori, di cui 12 attivi: $\frac{12}{18}$. Qui i raggruppamenti che funzionano sono più di uno.

Settori per gruppo: ${gruppi}{g|1|1,6,1}

:::p5 sketch=frazioni-raggruppa n=12 d=18 cols=6 nome=MIDI height=300 bind=g
:::

Prova tutti i valori dello slider e completa: con i gruppi da **2** la frazione diventa [[6/9]], con i gruppi da **3** diventa [[4/6]], con i gruppi da **6** diventa [[2/3]].

I gruppi da **4** e da **5**, invece, [[select: funzionano lo stesso|*non funzionano|danno un altro risultato]].

Fra i tre risultati, quale non si può più semplificare? [[6/9|4/6|*2/3]]

:::div.reveal
**Bene.** Tre strade diverse, e la più corta le riassume tutte.

Se parti da $\frac{6}{9}$ puoi continuare: $6$ e $9$ si dividono ancora per $3$, e arrivi a $\frac{2}{3}$. Se parti da $\frac{4}{6}$ dividi per $2$ e arrivi di nuovo a $\frac{2}{3}$.

Comunque tu proceda, il punto di arrivo è sempre lo stesso: $\frac{2}{3}$ è la frazione **ridotta ai minimi termini**, quella in cui nessun numero (a parte l'1) divide sia sopra sia sotto.

$$\frac{12}{18} = \frac{6}{9} = \frac{4}{6} = \frac{2}{3}$$
:::

---

> id: semplificare-con-il-mcd
> title: Il MCD semplifica in un passo solo

# Arrivare in fondo senza tante tappe

Il modello **MAXI** ha 48 settori, di cui 36 attivi: $\frac{36}{48}$.

Un tecnico semplifica dividendo per 2 ogni volta che può:

$$\frac{36}{48} \rightarrow \frac{18}{24} \rightarrow \frac{9}{12} \rightarrow \frac{3}{4}$$

L'ultimo passaggio non è più per 2: $9$ e $12$ sono dispari e pari, e si dividono per $3$. Sono serviti **tre passaggi**.

La sua collega, invece, ci arriva con **una sola divisione**. Per farlo deve trovare il numero più grande che divide sia 36 sia 48, cioè il [[select: minimo comune multiplo|*massimo comun divisore|numero primo più grande]] dei due.

Calcolalo con la tabella delle scomposizioni, come hai imparato nel corso sui numeri naturali:

:::p5 goal sketch=mcd-mcm-tabella a=36 b=48 modo=mcd
:::

Adesso dividi tutti e due i numeri della frazione per quel valore: $36 : 12 =$ [[3]] e $48 : 12 =$ [[4]].

:::div.reveal
**Esatto.** $MCD(36, 48) = 12$, e una sola divisione porta direttamente al risultato:

:::formula
\frac{@n0{36}}{@d0{48}} = \frac{@n1{3}}{@d1{4}}

n0 -> n1 : diviso 12
d0 -> d1 : diviso 12
:::

Ecco la strada più veloce per ridurre una frazione ai minimi termini: **dividi numeratore e denominatore per il loro MCD**. Un passaggio solo, e sei sicuro di essere arrivato in fondo — perché dopo aver tolto il divisore più grande non ne resta nessun altro.

Dividere più volte per numeri più piccoli non è sbagliato: è solo più lungo.
:::

---

> id: frazioni-gia-ridotte
> title: Le frazioni già ridotte ai minimi termini

# Quando non c'è niente da semplificare

Non tutte le frazioni si possono accorciare. Guarda queste tre e decidi, una per volta.

**$\frac{35}{49}$** — scomponi: $35 = 5 \cdot 7$ e $49 = 7 \cdot 7$. Hanno in comune il fattore [[7]], quindi la frazione si semplifica e diventa [[5/7]].

**$\frac{15}{28}$** — scomponi: $15 = 3 \cdot 5$ e $28 = 2 \cdot 2 \cdot 7$. Questa frazione [[select: si semplifica per 3|si semplifica per 5|*non si può semplificare]].

**$\frac{17}{51}$** — attenzione a questa: 17 è un numero primo, ma $51 = 3 \cdot 17$. La frazione ridotta ai minimi termini è [[1/3]].

:::div.reveal
**Ottimo.** Il secondo caso è quello interessante: $15$ e $28$ si scompongono tutti e due, ma **non hanno nessun fattore in comune**. Il loro MCD è 1, e dividere per 1 non cambia niente: $\frac{15}{28}$ è **già ridotta ai minimi termini**.

Due numeri con MCD uguale a 1 li hai già incontrati: si dicono **primi tra loro**.

:::div.highlight
Una frazione è ridotta ai minimi termini quando numeratore e denominatore sono **primi tra loro**.
:::

E il terzo caso avverte di non fidarsi dell'aspetto: un numeratore primo non vuol dire che la frazione sia già ridotta. Basta che quel primo compaia anche nel denominatore, come il 17 dentro il 51.
:::

---

> id: riconoscere-equivalenti
> title: Riconoscere due frazioni equivalenti

# Torniamo ai tre modelli

Adesso hai tutto quello che serve per decidere la domanda di apertura.

:::p5 sketch=frazioni-pannelli-confronto pannelli="DELTA 18/24 6, EPSILON 45/60 10, ZETA 20/30 6" height=300
:::

Riduci ai minimi termini le tre frazioni, dividendo ciascuna per il MCD dei suoi due numeri.

| Modello | Frazione | MCD | Ridotta ai minimi termini |
| ------- | -------- | --- | ------------------------- |
| **DELTA** | $\frac{18}{24}$ | [[6]] | [[3/4]] |
| **EPSILON** | $\frac{45}{60}$ | [[15]] | [[3/4]] |
| **ZETA** | $\frac{20}{30}$ | [[10]] | [[2/3]] |

Quindi i modelli con la stessa superficie attiva sono [[select: DELTA e ZETA|*DELTA ed EPSILON|EPSILON e ZETA]].

:::div.reveal
**Proprio così.** DELTA ed EPSILON sono scritti con numeri completamente diversi, ma sono lo stesso pannello: tutti e due valgono $\frac{3}{4}$. ZETA invece vale $\frac{2}{3}$ ed è un modello diverso.

:::div.highlight
Due frazioni sono **equivalenti** quando, ridotte ai minimi termini, diventano identiche. La forma ridotta è il "nome ufficiale" di una frazione: ogni frazione ne ha uno solo.
:::

Resta però una domanda aperta: fra $\frac{3}{4}$ e $\frac{2}{3}$, quale pannello produce **più energia**? I due numeri non si possono confrontare così, perché i settori delle due griglie non hanno la stessa dimensione. Per rispondere serve un'idea nuova, ed è quella della prossima lezione. 🔋
:::

---

> id: recap-minimi-termini
> title: "Recap: ridurre ai minimi termini"

# Recap: ridurre ai minimi termini

Fissiamo le regole completando le frasi, poi due esercizi per allenarti.

## Le regole

Per **semplificare** una frazione si dividono numeratore e denominatore per [[select: numeri diversi|*lo stesso numero|il solo numeratore]]: la frazione che ottieni è equivalente a quella di partenza, cioè vale [[select: di meno|di più|*la stessa quantità]].

Una frazione è **ridotta ai minimi termini** quando numeratore e denominatore sono [[select: numeri primi|*primi tra loro|numeri pari]], cioè quando il loro MCD vale [[1]].

Per arrivarci in un passo solo, dividi numeratore e denominatore per il loro [[select: mcm|*MCD|prodotto]].

## Riduci tu

Riduci ai minimi termini, scrivendo il risultato nella forma num/den:

$\frac{24}{36} =$ [[2/3]] &nbsp;&nbsp; $\frac{30}{42} =$ [[5/7]] &nbsp;&nbsp; $\frac{16}{25} =$ [[16/25]]

:::details.hint
<summary>💡 Suggerimento sull'ultima</summary>

Scomponi i due numeri: $16 = 2 \cdot 2 \cdot 2 \cdot 2$ e $25 = 5 \cdot 5$. Hanno qualche fattore in comune?

:::

:::div.reveal
**Bravo!**

- $\frac{24}{36}$: $MCD(24, 36) = 12$, quindi $\frac{24}{36} = \frac{2}{3}$.
- $\frac{30}{42}$: $MCD(30, 42) = 6$, quindi $\frac{30}{42} = \frac{5}{7}$.
- $\frac{16}{25}$: il 16 è fatto solo di 2 e il 25 solo di 5, nessun fattore in comune. Il MCD è 1 e la frazione era **già ridotta**: la risposta giusta era lasciarla com'è.

**Le regole d'oro della semplificazione:**

- Semplificare = raggruppare i settori, cioè dividere sopra e sotto per lo stesso numero.
- Il valore della frazione **non cambia**: cambia solo in quante parti è diviso l'intero.
- Dividere per il **MCD** porta ai minimi termini in un colpo solo.
- MCD uguale a 1 → la frazione è **già ridotta**.
- Stessa forma ridotta → le frazioni sono **equivalenti**. 🎉
:::
