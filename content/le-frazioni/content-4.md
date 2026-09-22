> id: denominatore-comune
> title: Denominatore comune, somma e sottrazione
> description: Portiamo due frazioni sulla stessa griglia, poi le sommiamo

---

> id: due-griglie-diverse
> title: Confrontare frazioni con denominatori diversi

# Chi produce più energia?

Riprendiamo i due modelli rimasti in sospeso alla fine della lezione scorsa. Li avevi ridotti ai minimi termini: **DELTA** vale $\frac{3}{4}$ e **ZETA** vale $\frac{2}{3}$.

:::p5 sketch=frazioni-pannelli-confronto pannelli="DELTA 18/24 6, ZETA 20/30 6" height=300
:::

I due pannelli sono grandi uguali, ma le loro griglie no: DELTA è diviso in quarti, ZETA in terzi. Un quarto di pannello e un terzo di pannello sono pezzi di **dimensioni diverse**, quindi contare quanti pezzi sono accesi non basta.

Secondo te, quale modello produce più energia?

[[*DELTA|ZETA|Producono la stessa energia|Non si può decidere: i pezzi sono diversi]]

:::div.reveal
Per deciderlo con sicurezza c'è un modo solo: **ridisegnare i due pannelli con la stessa griglia**. Se i pezzi hanno la stessa dimensione, allora basta contarli.
:::

---

> id: griglia-comune
> title: Il denominatore comune

# La stessa griglia per tutti e due

Proviamo a ridisegnare DELTA e ZETA con lo stesso numero di settori. Muovi lo slider: il numero che scegli è il numero di settori di **tutti e due** i pannelli.

Settori per pannello: ${settori}{t|4|3,16,1}

:::p5 sketch=frazioni-griglia-comune pannelli="DELTA 3/4, ZETA 2/3" height=340 bind=t
:::

Quando il numero non va bene, l'ultimo settore si accende solo a metà: vuol dire che quella griglia non riesce a rappresentare la frazione.

Per DELTA, che vale $\frac{3}{4}$, vanno bene i numeri che sono multipli di [[4]].

Per ZETA, che vale $\frac{2}{3}$, vanno bene i multipli di [[3]].

C'è un solo numero, fra 3 e 16, che va bene per tutti e due: [[12]].

Portalo sullo slider e leggi i due pannelli: $\frac{3}{4} =$ [[9/12]] e $\frac{2}{3} =$ [[8/12]].

Adesso i pezzi sono uguali e si contano: produce più energia il modello [[select: ZETA|*DELTA]].

:::div.reveal
**Ecco la risposta.** $\frac{9}{12}$ contro $\frac{8}{12}$: un dodicesimo di differenza a favore di DELTA.

:::div.highlight
Portare due frazioni **allo stesso denominatore** vuol dire riscriverle con lo stesso numero di parti. Quel denominatore si chiama **denominatore comune**, e deve essere un **multiplo di tutti e due** i denominatori di partenza.
:::

Si fa amplificando, come nella seconda lezione: $\frac{3}{4} = \frac{3 \cdot 3}{4 \cdot 3} = \frac{9}{12}$ e $\frac{2}{3} = \frac{2 \cdot 4}{3 \cdot 4} = \frac{8}{12}$. Nessuna delle due frazioni è cambiata di valore: è cambiata solo la griglia.

Il 12 non è l'unico: anche 24, 36, 48 vanno bene per tutti e due. Sono più scomodi, ma non sono sbagliati.
:::

---

> id: mcm-denominatore-comune
> title: Il mcm come denominatore comune più piccolo

# Il più piccolo che va bene per tutti e due

Due nuovi modelli: **OMEGA** vale $\frac{5}{6}$ e **SIGMA** vale $\frac{7}{9}$.

Settori per pannello: ${settori}{t|6|6,54,3}

:::p5 sketch=frazioni-griglia-comune pannelli="OMEGA 5/6, SIGMA 7/9" height=340 bind=t
:::

Il primo tentativo di tutti è moltiplicare i due denominatori: $6 \cdot 9 = 54$. E in effetti con 54 settori funziona. Ma è davvero il più piccolo?

Muovi lo slider e trova i numeri che vanno bene per tutti e due: sono [[18]], 36 e 54.

Quei numeri hanno un nome che conosci già: sono i **multipli comuni** di 6 e 9. Il più piccolo di tutti si chiama [[select: massimo comun divisore|*minimo comune multiplo|numero primo comune]].

Calcolalo con la tabella delle scomposizioni:

:::p5 goal sketch=mcd-mcm-tabella a=6 b=9 modo=mcm
:::

Porta lo slider su 18 e riscrivi le due frazioni: $\frac{5}{6} =$ [[15/18]] e $\frac{7}{9} =$ [[14/18]].

Quindi produce più energia il modello [[select: SIGMA|*OMEGA]].

:::div.reveal
**Esatto.** $mcm(6, 9) = 18$: la griglia più comoda ha 18 settori, tre volte più fitta di quella di OMEGA e due volte più fitta di quella di SIGMA.

:::div.highlight
Il **denominatore comune più piccolo** fra due frazioni è il **mcm** dei loro denominatori.
:::

Con 54 i conti tornano lo stesso, ma i numeri diventano inutilmente grandi: $\frac{45}{54}$ e $\frac{42}{54}$. Alla fine dovresti comunque semplificare per tornare a numeri leggibili.
:::

---

> id: quando-serve-il-prodotto
> title: Quando il denominatore comune è il prodotto

# Il prodotto serve sempre?

Confrontiamo $\frac{3}{8}$ e $\frac{5}{12}$. Moltiplicando i denominatori verrebbe $8 \cdot 12 = 96$ settori: tantissimi. Il mcm dice quanti ne bastano davvero.

:::p5 goal sketch=mcd-mcm-tabella a=8 b=12 modo=mcm
:::

Quindi il denominatore comune più piccolo è [[24]], che è **molto** più piccolo di 96. Riscriviamo: $\frac{3}{8} =$ [[9/24]] e $\frac{5}{12} =$ [[10/24]].

Adesso una coppia diversa: $\frac{2}{5}$ e $\frac{3}{7}$. Prova a scomporre 5 e 7: sono tutti e due numeri primi e non hanno nessun fattore in comune, cioè sono [[select: numeri pari|*primi tra loro|numeri uguali]].

In questo caso il mcm di 5 e 7 vale [[35]], che è proprio il loro prodotto.

:::div.reveal
**Bene.** Ecco la differenza fra i due casi:

- $8$ e $12$ hanno fattori in comune (il 4 li divide entrambi), quindi il mcm è **più piccolo** del prodotto: 24 invece di 96.
- $5$ e $7$ non hanno nessun fattore in comune, quindi il mcm **coincide** con il prodotto: 35.

:::div.highlight
Moltiplicare i due denominatori dà **sempre** un denominatore comune valido: non è mai un errore, ma spesso è più grande del necessario. Il mcm è la scelta economica.
:::
:::

---

> id: somma-denominatori-diversi
> title: Somma di frazioni con denominatori diversi

# Due terreni da unire

Nella prima lezione hai sommato due zone del campo dei Rossi: erano contate **con gli stessi mattoncini**, quindi bastava sommare i numeratori.

Adesso è diverso. Due vicini possiedono due pezzi della stessa tenuta: Aldo ne possiede $\frac{1}{4}$ e Bruno $\frac{1}{6}$. Quanta tenuta possiedono insieme?

I quarti e i sesti sono pezzi di dimensioni diverse, quindi non si possono sommare così come sono: $\frac{1}{4} + \frac{1}{6}$ non fa $\frac{2}{10}$.

Prima si porta tutto sulla stessa griglia. Il denominatore comune è il mcm di 4 e 6, cioè [[12]].

:::p5 sketch=frazioni-griglia-comune pannelli="ALDO 1/4, BRUNO 1/6" t=12 height=320
:::

Sulla griglia da 12 parti: $\frac{1}{4} =$ [[3/12]] e $\frac{1}{6} =$ [[2/12]].

Adesso i pezzi sono uguali e la somma si fa come già sai, sommando solo i numeratori: insieme possiedono [[5/12]] della tenuta.

:::div.reveal
**Perfetto.** $\frac{1}{4} + \frac{1}{6} = \frac{3}{12} + \frac{2}{12} = \frac{5}{12}$.

:::div.highlight
Per sommare due frazioni con denominatori diversi: **denominatore comune** (il mcm), **amplifica** tutte e due, poi **somma i numeratori** e tieni il denominatore.
:::

Il denominatore non si somma mai: dice in quante parti è diviso l'intero, e su una griglia sola quel numero è uno solo.
:::

---

> id: sottrazione-denominatori-diversi
> title: Sottrazione di frazioni con denominatori diversi

# Quanto ne resta

La sottrazione segue la stessa strada. Un serbatoio è pieno per $\frac{5}{6}$; durante la giornata se ne consuma $\frac{3}{4}$ del totale. Quanto ne resta?

Il denominatore comune è il mcm di 6 e 4, cioè [[12]].

:::p5 sketch=frazioni-griglia-comune pannelli="PIENO 5/6, CONSUMATO 3/4" t=12 height=320
:::

Sulla griglia da 12: $\frac{5}{6} =$ [[10/12]] e $\frac{3}{4} =$ [[9/12]].

Ne resta quindi [[1/12]] del serbatoio.

## Un risultato da semplificare

Ancora una somma, con un finale che riguarda la lezione scorsa: $\frac{1}{6} + \frac{1}{3}$.

Il denominatore comune è [[6]], perché 6 è già multiplo di 3. La somma diventa $\frac{1}{6} + \frac{2}{6} =$ [[3/6]].

Ridotta ai minimi termini, quella frazione si scrive [[1/2]].

:::div.reveal
**Ottimo.** Due cose da portarsi via:

- La sottrazione funziona come la somma: griglia comune, poi si sottraggono i **numeratori**. $\frac{5}{6} - \frac{3}{4} = \frac{10}{12} - \frac{9}{12} = \frac{1}{12}$.
- Quando un denominatore è già multiplo dell'altro, il mcm è il più grande dei due: fra 6 e 3 il denominatore comune è 6, e la seconda frazione è l'unica da amplificare.

E il risultato va sempre guardato alla fine: $\frac{3}{6}$ non è sbagliato, ma il suo nome più corto è $\frac{1}{2}$. Mezza tenuta. 🌗
:::

---

> id: recap-denominatore-comune
> title: "Recap: denominatore comune, somma e sottrazione"

# Recap: portare allo stesso denominatore

Completa le regole, poi prova gli esercizi.

## Le regole

Due frazioni si possono confrontare, sommare o sottrarre solo quando hanno lo stesso [[select: numeratore|*denominatore|numero di cifre]]: solo allora le parti hanno la stessa dimensione e si contano fra loro.

Un denominatore comune deve essere un [[select: divisore|*multiplo]] di tutti e due i denominatori di partenza. Il più piccolo che si può scegliere è il loro [[select: MCD|*mcm|prodotto]].

Per portare una frazione al nuovo denominatore si **amplifica**: si moltiplicano numeratore e denominatore per [[select: numeri diversi|*lo stesso numero|il solo numeratore]].

Fatto questo, si sommano o si sottraggono i [[select: denominatori|*numeratori]], mentre il denominatore comune resta com'è.

## Calcola tu

Scrivi i risultati nella forma num/den, già ridotti ai minimi termini:

$\frac{2}{5} + \frac{1}{3} =$ [[11/15]] &nbsp;&nbsp; $\frac{1}{4} + \frac{1}{6} =$ [[5/12]] &nbsp;&nbsp; $\frac{7}{10} - \frac{1}{5} =$ [[1/2]]

:::details.hint
<summary>💡 Suggerimento sull'ultima</summary>

Fra 10 e 5 il denominatore comune è 10, perché 10 è già multiplo di 5. Fai la sottrazione e poi guarda se il risultato si può semplificare.

:::

:::div.reveal
**Bravo!**

- $\frac{2}{5} + \frac{1}{3}$: $mcm(5, 3) = 15$, quindi $\frac{6}{15} + \frac{5}{15} = \frac{11}{15}$. I denominatori sono primi tra loro, e infatti il mcm è il loro prodotto.
- $\frac{1}{4} + \frac{1}{6}$: $mcm(4, 6) = 12$, quindi $\frac{3}{12} + \frac{2}{12} = \frac{5}{12}$.
- $\frac{7}{10} - \frac{1}{5}$: $mcm(10, 5) = 10$, quindi $\frac{7}{10} - \frac{2}{10} = \frac{5}{10}$, che ridotto ai minimi termini fa $\frac{1}{2}$.

**Le regole d'oro:**

- Denominatori diversi → parti di dimensioni diverse → prima si cambia griglia.
- La griglia comune più comoda è il **mcm** dei denominatori.
- Si amplifica ogni frazione, poi si sommano (o si sottraggono) **solo i numeratori**.
- Alla fine, controlla sempre se il risultato si semplifica. 🎉
:::
