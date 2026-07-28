> id: frazioni-equivalenti
> title: Frazioni equivalenti
> description: Scopriamo quando rapporti diversi rappresentano la stessa quantità

---

> id: frazioni-equivalenti-1
> title: I pannelli solari

Qui sono rappresentati 3 modelli di pannelli solari, i modelli Alfa, Beta e Gamma. Un pannello produce tanta più energia quanta più è la *superficie attiva*, che nel disegno è colorata in blu.

:::p5 sketch=frazioni-pannelli-suddivisioni width=600 height=260
:::

Un ingegnere sostiene che il Modello Gamma sia il più efficiente di tutti perché ha ben 8 settori attivi, mentre il Modello Alfa ne ha soltanto 2. Un secondo ingegnere, invece, sostiene che i tre pannelli producano esattamente la stessa energia.

Chi ha ragione?
[[Il primo ingegnere, 8 settori attivi producono più energia|*Il secondo, la superficie attiva nei tre pannelli è la stessa|Nessuno dei due, i pannelli ALFA e BETA sono equivalenti, il terzo non si può dire perché la disposizione è diversa]]

:::div.reveal
Perché la risposta corretta è questa? Non preoccuparti se non sei sicuro/a! Vediamolo nel prossimo step!
:::

---

> id: frazioni-equivalenti-2
> title: Verifichiamo la risposta

Concentriamoci sul Modello **Gamma**: i suoi 8 settori attivi sembrano sparsi un po' ovunque. Ma l'energia prodotta dipende solo da *quanta* superficie è attiva, non da *dove* si trova.

Trascina lo slider per far scivolare verso sinistra tutti i blocchi attivi di Gamma, poi confrontalo con Alfa e Beta:

Riordina Gamma: ${t}{t|0|0,100,1}

:::p5 sketch=frazioni-pannelli-allineamento width=600 height=260 bind=t
:::

:::div.reveal
Spostando i blocchi — senza toglierne nemmeno uno — la superficie blu non cambia: Gamma finisce per ricoprire **esattamente** le stesse due colonne di sinistra di Alfa e Beta. I tre pannelli hanno la stessa superficie attiva: sono **equivalenti**. Aveva ragione il secondo ingegnere!
:::

---

> id: frazioni-equivalenti-3
> title: Confrontiamo le frazioni

Ora completa la tabella: scriviamo per ogni pannello il numero totale di sezioni e poi solo quello delle sezioni attive per costruire la frazione di area attiva.

|Pannello|Sezioni totali|Sezioni attive|Frazione|
|--------|--------------|--------------|--------|
|ALFA|${n_a}{n_a|1|input}|${d_a}{d_a|1|input}|$\frac{${d_a}}{${n_a}}$|
|BETA|${n_b}{n_b|1|input}|${d_b}{d_b|1|input}|$\frac{${d_b}}{${n_b}}$|
|GAMMA|${n_c}{n_c|1|input}|${d_c}{d_c|1|input}|$\frac{${d_c}}{${n_c}}$|

[Verifica]{check: d_a == 2 && n_a == 3 && d_b == 4 && n_b == 6 && d_c == 8 && n_c == 12}

:::div.reveal
Perfetto! Le tre frazioni — $\frac{2}{3}$, $\frac{4}{6}$ e $\frac{8}{12}$ — rappresentano tutte la stessa quantità: diciamo che sono frazioni **equivalenti**.

*Attenzione a non confondere due parole vicine:* nella lezione scorsa erano due **figure** con la stessa area a dirsi *equiestese*; qui invece parliamo di **frazioni** — cioè di numeri — che indicano la stessa quantità, e si dicono *equivalenti*.
:::

---

> id: frazioni-equivalenti-4
> title: Il fattore di scala

L'azienda vuole produrre un **Modello Delta**: deve avere *esattamente la stessa superficie attiva* di Alfa, Beta e Gamma, ma la sua griglia è composta da **24 quadratini** in totale.

Trascina lo slider per accendere i settori, fermandoti dove la zona blu copre la **stessa porzione** (i 2/3 segnati dalla linea dorata).

Settori attivi: ${k}{k|0|0,24,1}

:::p5 sketch=frazioni-griglia-settori width=600 height=300 bind=k
:::

[Verifica]{check: k == 16}

:::div.highlight
**Come trovarlo senza tentativi?** Passare da 3 a 24 settori totali significa moltiplicare per 8 ($24 \div 3 = 8$): ogni parte originale è stata divisa in 8. Allora anche i settori attivi si moltiplicano per 8: $2 \times 8 = 16$.
:::

:::div.reveal
**Esatto: 16 settori attivi.** Infatti $\frac{2}{3} = \frac{16}{24}$: è una frazione equivalente, la stessa efficienza con una griglia più fitta.
:::

---

> id: frazioni-equivalenti-5
> title: L'astrazione numerica

Un cliente ordina un pannello personalizzato con **90 micro-settori** in totale, sempre con la stessa efficienza dei modelli precedenti.

Disegnare 90 quadratini sarebbe lunghissimo. Ma non serve: possiamo lavorare **solo sui numeri**, cercando la frazione equivalente a $\frac{2}{3}$ con 90 al denominatore.

Per passare da 3 a 90 settori totali, per quale numero dobbiamo moltiplicare? $90 \div 3 =$ [[30]]

Allora i settori attivi (moltiplicando per lo stesso numero) passano da due a [[60]].

Qual è l'"operazione segreta" che hai fatto sui numeri?
[[Ho moltiplicato solo il totale per un numero|*Ho moltiplicato numeratore e denominatore per lo stesso numero|Ho sottratto lo stesso numero da numeratore e denominatore]]

:::div.reveal
**Bravo!** $\frac{2}{3} = \frac{2 \times 30}{3 \times 30} = \frac{60}{90}$. Moltiplicare numeratore e denominatore per **lo stesso numero** crea una frazione equivalente: serviranno **60 settori attivi**, senza disegnare nulla.
:::

---

> id: semplificare
> title: Tornare indietro

# Si può percorrere la strada al contrario?

Finora abbiamo sempre reso la griglia **più fitta**: da 3 settori a 6, a 12, a 24, a 90, moltiplicando numeratore e denominatore per lo stesso numero.

Ma la stessa strada si può percorrere **all'indietro**. Riprendiamo il Modello **Gamma**: 12 settori totali, 8 attivi, cioè $\frac{8}{12}$.

:::p5 sketch=frazioni-pannelli-suddivisioni width=600 height=260
:::

Invece di dividere i settori, questa volta **raggruppiamoli a quattro a quattro**.

Quanti gruppi vengono fuori dai 12 settori totali? [[3]]

E quanti di quei gruppi sono fatti di settori attivi? [[2]]

Quindi lo stesso pannello si può descrivere anche così: $\frac{8}{12} = \frac{2}{3}$.

## L'operazione sui numeri

Guarda che cosa è successo ai due numeri della frazione: $8 \div 4 = 2$ e $12 \div 4 = 3$.

Qual è stata l'"operazione segreta"?

[[Ho diviso solo il denominatore per 4|*Ho diviso numeratore e denominatore per lo stesso numero|Ho sottratto 4 da numeratore e denominatore]]

:::div.reveal
**Esatto.** È la stessa regola di prima, letta al contrario: **dividere** numeratore e denominatore per lo stesso numero dà ancora una frazione **equivalente**. Questa operazione si chiama **semplificare** una frazione.

Quando non si può più semplificare — come $\frac{2}{3}$, perché nessun numero divide sia 2 sia 3 — si dice che la frazione è **ridotta ai minimi termini**.
:::

## Ti ricordi il campo dei Rossi?

Nella lezione scorsa avevamo raggruppato i 16 mattoncini **a coppie**, e la zona D era passata da $\frac{2}{16}$ a $\frac{1}{8}$. Era una semplificazione, solo che non ne conoscevamo ancora il nome:

$$\frac{2}{16} = \frac{2 \div 2}{16 \div 2} = \frac{1}{8}$$

Prova ora con la zona **A**, che valeva $\frac{4}{16}$: semplificala dividendo entrambi i numeri per **4**.

$\frac{4}{16} =$ [[1/4]]

:::div.reveal
$\frac{4}{16} = \frac{4 \div 4}{16 \div 4} = \frac{1}{4}$, ed è ridotta ai minimi termini.

Ecco perché una stessa zona di terreno poteva avere due nomi: $\frac{4}{16}$ e $\frac{1}{4}$ sono frazioni **equivalenti**.
:::

---

> id: frazioni-equivalenti-6
> title: Si può sempre?

Ultima sfida: è possibile progettare un pannello equivalente ai precedenti diviso in **esattamente 10 settori** totali?

È possibile?
[[Sì, basta accendere 7 settori|*No: 10 non è divisibile per 3, quindi i 2/3 non danno un numero intero di settori|Sì, basta accendere 6 settori]]

:::p5 sketch=frazioni-dieci-settori width=600 height=180
:::

Perché un pannello equivalente sia possibile, il numero totale di settori deve essere un **multiplo di** [[3]].

:::div.reveal
**Esatto, non si può creare un pannello equivalente.** $\frac{2}{3}$ di 10 fa $6{,}67$: dovremmo accendere "6 settori e due terzi", ma un settore o è acceso o è spento — non esistono mezzi settori. La frazione $\frac{2}{3}$ si può mantenere solo se il totale è un **multiplo di 3** (3, 6, 9, 12, 24, 90…), così la divisione dà un numero intero di settori attivi.
:::

---

> id: recap
> title: "Recap: Frazioni Equivalenti"

# Recap: Frazioni Equivalenti

Fissiamo le idee di questa lezione completando ogni definizione con il termine giusto.

## Definizione

Due frazioni si dicono **equivalenti** quando rappresentano la stessa [[select: forma|*quantità|quantità di numeri]], anche se sono scritte con numeri diversi: $\frac{2}{3}$, $\frac{4}{6}$, $\frac{8}{12}$ e $\frac{60}{90}$ sono tutte equivalenti fra loro.

Nel pannello Gamma, spostare i settori attivi da una parte all'altra [[select: aumenta|*non cambia|riduce]] la superficie attiva: ciò che conta è **quanta** superficie è accesa, non **dove** si trova.

## Regole

**Regola 1 — Amplificare (griglia più fitta).** Moltiplicando numeratore e denominatore per [[select: numeri diversi|*lo stesso numero|il solo numeratore]] si ottiene una frazione equivalente: $\frac{2}{3} = \frac{2 \times 30}{3 \times 30} = \frac{60}{90}$.

**Regola 2 — Semplificare (griglia più larga).** La stessa cosa vale all'indietro: [[select: sottraendo|*dividendo]] numeratore e denominatore per lo stesso numero, $\frac{8}{12}$ diventa $\frac{2}{3}$. Quando non si può più semplificare, la frazione è **ridotta ai [[select: massimi|*minimi]] termini**.

**Regola 3 — Non sempre si può.** Per scrivere $\frac{2}{3}$ con un altro denominatore, quel denominatore deve essere un [[select: divisore|*multiplo]] di 3: con 10 settori totali non esiste nessun pannello equivalente.

:::div.reveal
**Le regole d'oro delle frazioni equivalenti:**

- Frazioni **equivalenti** → stessa quantità, scrittura diversa.
- $\times$ lo stesso numero sopra e sotto → **amplificare** ($\frac{2}{3} = \frac{60}{90}$).
- $\div$ lo stesso numero sopra e sotto → **semplificare** ($\frac{8}{12} = \frac{2}{3}$).
- Nessuna delle due operazioni **cambia il valore** della frazione: cambia solo in quante parti hai diviso l'intero.
- Una frazione che non si può più semplificare è **ridotta ai minimi termini**.

Ora sai perché la zona D del campo dei Rossi poteva chiamarsi sia $\frac{2}{16}$ sia $\frac{1}{8}$! 🎉
:::
