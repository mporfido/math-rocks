> id: le-frazioni
> title: Le frazioni come aree
> description: Le frazioni viste come parti di area reale del terreno della Famiglia Rossi.

---

> id: intro
> title: Il Terreno della Famiglia Rossi

# Il Campo Frazionato

La famiglia Rossi possiede un grande **terreno quadrato** diviso in sei zone: A, B, C, D, E, F. Ogni zona ha una forma diversa, ma insieme ricoprono esattamente tutto il campo.

![Il campo diviso in zone A-F|500](/static/images/il-campo-frazionato/campi-frazioni.png)

Il tuo obiettivo è scoprire **che frazione del terreno totale** rappresenta ciascuna zona — e poi usare quelle frazioni per calcolare il valore economico di ogni pezzo.

Prima di tuffarti nel problema, però, assicuriamoci di avere gli attrezzi giusti.

## Domanda 1

Vuoi confrontare due aiuole. La prima la ricopri con **6** piastrelle quadrate; la seconda con **9** piastrelle **identiche alle prime**. Quale aiuola è più grande?

[[A) La prima|*B) La seconda|C) Non si può dire: dipende dalla forma delle aiuole]]

## Domanda 2

Il campo dei Rossi viene diviso tra **4 eredi** e ognuno dice di possedere $\frac{1}{4}$ del terreno. È sempre vero?

[[*Falso — solo se le 4 parti hanno la stessa area|Vero — sono 4 parti, quindi $\frac{1}{4}$ ciascuno]]

## Domanda 3

Le sei zone A, B, C, D, E, F ricoprono tutto il campo senza sovrapporsi. Se sommi le sei frazioni, quanto ottieni?

[[Mezzo campo|*Tutto il campo, cioè 1|Dipende dalle forme delle zone]]

:::div.reveal
**Bene, hai gli attrezzi giusti!**

- Per misurare una superficie la si **ricopre con un'unità sempre uguale** e si contano le unità: 9 piastrelle > 6 piastrelle, qualunque forma abbiano le aiuole.
- Una frazione descrive parti **uguali** di un intero: se i 4 lotti hanno aree diverse, nessuno può dire di avere $\frac{1}{4}$.
- Le parti in cui è diviso l'intero, sommate, ridanno **l'intero**.

Adesso ci serve solo una cosa: trovare l'unità giusta per misurare il campo dei Rossi.
:::

---

> id: unita-misura
> title: L'Unità di Misura

# Trovare l'Unità di Misura Comune

Guarda bene la foto dello step precedente: i pezzi sembrano tutti diversi e non ci sono metri scritti da nessuna parte. Eppure c'è un segreto — **il pezzo E è il più piccolo di tutti.**

Immagina di usare la zona **E** come un "mattoncino" per coprire tutto il campo quadrato.

:::div.highlight
**Ragionamento guidato:**
- Per coprire la zona **D** servono esattamente **2** mattoncini grandi come E.
- Tracciando una griglia invisibile con quadratini grandi come E su tutto il campo…
:::

Muovi il cursore per far comparire quella griglia, una riga di mattoncini alla volta:

Righe scoperte: ${g}{g|0|0,4,1}

:::p5 sketch=campo-frazioni campo=rossi rivela=g bind=g width=520 height=420
:::

Quanti mattoncini E servirebbero per coprire l'**intero** terreno quadrato?

:::details.hint
<summary>💡 Suggerimento</summary>

Il campo è largo **4** mattoncini e alto **4** mattoncini. Puoi contare una riga alla volta con il cursore, oppure moltiplicare $4 \times 4$.

:::

Risposta: servirebbero in totale **[[16]]** mattoncini uguali a E.

:::div.reveal
Esatto! Il campo si divide in **16 quadratini** uguali a E.

Di conseguenza la zona E vale: $\frac{1}{16}$ del terreno totale.

Ora possiamo misurare tutte le altre zone usando E come unità.
:::

---

> id: scopri-frazioni
> title: Scopriamo le Frazioni

# Scopriamo le Altre Frazioni

Adesso usiamo il nostro "mattoncino E" per misurare le altre zone. Ecco il campo ridisegnato sulla griglia dei 16 mattoncini.

## Domanda 4

**Clicca sulla mappa tutti i quadratini che compongono la zona A** (in alto a sinistra).

:::p5 goal sketch=campo-frazioni campo=rossi modo=conta zona=A width=520 height=420
:::

Quanti mattoncini da $\frac{1}{16}$ ti sono serviti? ${m}{m|0|0,10,1}

[Verifica]{check: m == 4}

Quindi la zona A corrisponde alla frazione $\frac{${m}}{16}$.

## Domanda 5

Confronta la **zona A** e la **zona B**. Quale affermazione è VERA?

[[A) La zona B è più grande perché è più lunga|B) La zona A e la zona B hanno superfici diverse|*C) A e B occupano la stessa superficie: sono fatte entrambe di 4 quadratini, cioè 4/16]]

:::div.reveal
**Perfetto!**

- Zona **A**: 4 quadratini → $\frac{4}{16}$
- Zona **B**: 4 quadratini → $\frac{4}{16}$
- Zona **C**: 2 quadratini → $\frac{2}{16}$

La forma inganna: B è lunga e stretta, A è un quadrato tozzo, eppure coprono **la stessa** superficie. E C, che assomiglia a B, ne copre solo la metà. Conta il numero di mattoncini, non la lunghezza dei lati!

Due figure come A e B, con **forme diverse** ma **stessa area**, hanno un nome: si dicono **equiestese**.
:::

---

> id: tabella
> title: Completa la Tabella

# Completa la Tabella

:::p5 sketch=campo-frazioni campo=rossi width=520 height=420
:::

Contando i quadratini come hai fatto per A, completa la tabella **in sedicesimi** per le zone D e F.

*(Scrivi le frazioni nella forma num/den, es. 1/16)*

| Zona | N° quadratini | Frazione |
| ---- | ------------- | -------- |
| **A** | 4 | $\frac{4}{16}$ |
| **B** | 4 | $\frac{4}{16}$ |
| **C** | 2 | $\frac{2}{16}$ |
| **D** | 2 | [[2/16]] |
| **E** | 1 | $\frac{1}{16}$ |
| **F** | 3 | [[3/16]] |

## Lo stesso pezzo, un nome più corto

Torniamo alla zona **D**: sono 2 quadratini su 16. Ma i mattoncini possiamo anche raggrupparli **a coppie**: allora il campo diventa **8** coppie, e D ne occupa esattamente **una**.

Il terreno non è cambiato, è cambiato solo il modo di contarlo. La stessa zona ha ora **due nomi**: $\frac{2}{16}$ e $\frac{1}{8}$.

Prova tu con la zona **A**, raggruppando i 16 mattoncini **a quattro a quattro**.

:::details.hint
<summary>💡 Suggerimento</summary>

Quanti gruppi da 4 mattoncini vengono fuori dai 16 del campo? E quanti di quei gruppi occupa la zona A, che è fatta di 4 quadratini?

:::

$\frac{4}{16} =$ [[1/4]]

:::div.reveal
**Tabella completata:**

- Zona **D**: 2 quadratini → $\frac{2}{16}$, che a coppie diventa $\frac{1}{8}$
- Zona **A**: 4 quadratini → $\frac{4}{16}$, che a gruppi di 4 diventa $\frac{1}{4}$
- Zona **F**: 3 quadratini → $\frac{3}{16}$. Prova a raggruppare a coppie: i 3 quadratini di F non formano un numero esatto di coppie, quindi per ora il suo unico nome resta $\frac{3}{16}$.

Non è un caso che una stessa zona possa avere due nomi diversi: è una cosa importante, e la esploreremo per bene nella **prossima lezione**.
:::

---

> id: unione-zone
> title: Unire due Zone

# Unire due Zone

I proprietari delle zone **C** e **D** decidono di **unire i loro terreni** in un unico appezzamento.

Contiamo i mattoncini, come abbiamo sempre fatto:

- Zona **C** → 2 quadratini, cioè $\frac{2}{16}$
- Zona **D** → 2 quadratini, cioè $\frac{2}{16}$
- Insieme: $2 + 2 =$ **[[4]]** quadratini su 16

La frazione che rappresenta la loro unione è quindi:

$$\frac{2}{16} + \frac{2}{16} = \frac{4}{16}$$

Quando due frazioni hanno lo **stesso denominatore**, per sommarle basta sommare i [[select: *numeratori|denominatori|numeratori e i denominatori]]: il denominatore resta 16 perché il campo continua a essere diviso negli stessi 16 mattoncini.

E ora una curiosità: l'unione di C e D è equiestesa alla zona [[select: *A|E|F]], che vale anch'essa $\frac{4}{16}$.

:::div.reveal
**Esatto!** $\frac{2}{16} + \frac{2}{16} = \frac{4}{16}$: si sommano solo i numeratori.

C e D insieme occupano tanto terreno quanto la zona A (o la zona B). E raggruppando i mattoncini a quattro a quattro, quel $\frac{4}{16}$ si chiama anche $\frac{1}{4}$: un quarto dell'intero campo.
:::

---

> id: valore-economico
> title: Dal Terreno al Prezzo

# Dal Terreno al Prezzo

Finora abbiamo contato mattoncini. Ora usiamo le stesse frazioni per rispondere a una domanda concreta: **quanto vale** ogni zona?

L'intero terreno dei Rossi vale **160.000 €**, e ogni quadratino vale la stessa cifra.

Quanto vale un singolo quadratino (la zona E, cioè $\frac{1}{16}$)?

:::details.hint
<summary>💡 Suggerimento</summary>

Il valore totale va spartito in parti **uguali**, tante quanti sono i quadratini: 16.

:::

$160.000 \div 16 =$ **[[10000]]** €

Quanto vale allora la **zona F** (3 quadratini)? **[[30000]]** €

E l'unione di **C e D** dello step precedente (4 quadratini, cioè $\frac{4}{16}$)? **[[40000]]** €

:::div.reveal
**Riepilogo economico:**

| Zona | Quadratini | Frazione | Valore |
| ---- | ---------- | -------- | ------ |
| E | 1 | 1/16 | 10.000 € |
| C o D | 2 | 2/16 = 1/8 | 20.000 € |
| F | 3 | 3/16 | 30.000 € |
| A o B | 4 | 4/16 = 1/4 | 40.000 € |
| C + D uniti | 4 | 4/16 = 1/4 | 40.000 € |

La regola, in breve: **valore della zona = valore totale × frazione della zona**. Per la zona F: $160.000 \times \frac{3}{16} = 30.000$ €.

Ottimo lavoro! Sei pronto per la sfida finale.
:::

---

> id: sfida-finale
> title: La Famiglia Bianchi

# Mettiti alla Prova!

La famiglia Bianchi possiede un terreno quadrato della **stessa superficie** di quello dei Rossi (16 quadratini). Lo ha diviso in 4 zone: **X, Y, Z, W**.

:::div.highlight
**Descrizione delle zone:**
- **Zona X:** Occupa tutta la **metà superiore** del quadrato.
- **Zona Y:** È un quadrato perfetto nell'**angolo in basso a sinistra**.
- **Zona Z:** È un rettangolo verticale stretto nell'**angolo in basso a destra**.
- **Zona W:** È lo **spazio rimanente**.
:::

Ecco il campo dei Bianchi disegnato sulla stessa griglia da 16 mattoncini:

:::p5 sketch=campo-frazioni campo=bianchi width=520 height=420
:::

## Determina le frazioni

Conta i quadratini di ogni zona, esattamente come hai fatto con il campo dei Rossi.

:::details.hint
<summary>💡 Suggerimento</summary>

Parti da **X**: la metà superiore sono 2 righe intere, e ogni riga ha 4 quadratini. Poi vai a scalare con le altre zone — alla fine i quattro numeri devono sommare a 16.

:::

- **X** = [[8/16 || 1/2]]
- **Y** = [[4/16 || 1/4]]
- **Z** = [[2/16 || 1/8]]
- **W** = [[2/16 || 1/8]]

## Calcola il valore

Attenzione: il campo dei Bianchi ha la stessa superficie di quello dei Rossi, ma **non** lo stesso prezzo. Vale **120.000 €**.

Qual è il valore della **zona W**?

:::details.hint
<summary>💡 Suggerimento</summary>

Non riusare i 10.000 € del campo dei Rossi! Qui il totale è diverso, quindi ricalcola quanto vale **un** quadratino: $120.000 \div 16$. Poi moltiplica per i quadratini di W. Oppure, più veloce, usa direttamente la frazione di W.

:::

$120.000 \times \frac{1}{8} =$ **[[15000]]** €

:::div.reveal
# Complimenti!

**Soluzioni:**
- X = $\frac{8}{16} = \frac{1}{2}$ → 8 quadratini (metà superiore)
- Y = $\frac{4}{16} = \frac{1}{4}$ → 4 quadratini (quadrato 2×2 in basso a sinistra)
- Z = $\frac{2}{16} = \frac{1}{8}$ → 2 quadratini (rettangolo 1×2 in basso a destra)
- W = $\frac{2}{16} = \frac{1}{8}$ → 2 quadratini (spazio rimanente)

**Valore di W:** un quadratino vale $120.000 \div 16 = 7.500$ €, e W ne ha 2 → $15.000$ €. Stesso risultato della via breve: $120.000 \times \frac{1}{8} = 15.000$ €.

Hai padroneggiato le frazioni come parti di area reale!
:::

---

> id: recap
> title: "Recap: Definizioni e Regole"

# Recap: Definizioni e Regole

Prima di chiudere, fissiamo le idee chiave. Completa ogni definizione e regola scegliendo il termine giusto dal menu a tendina.

## Definizioni

Una **frazione** rappresenta una o più parti [[select: qualsiasi|*uguali|diverse]] di un intero.

Due figure si dicono **equiestese** quando hanno la stessa [[select: forma|*area|lunghezza dei lati]], anche se la loro forma è diversa.

In una frazione come $\frac{3}{16}$, il **denominatore** (il numero in basso) dice in quante parti uguali è diviso l'intero, mentre il **numeratore** (il numero in alto) dice quante di quelle parti [[select: *consideriamo|scartiamo|coloriamo a caso]].

## Regole

**Regola 1 — Misurare con un'unità comune.** Per misurare ogni zona abbiamo usato come unità il mattoncino più [[select: grande|*piccolo|allungato]] (la zona E): l'intero campo vale 16 mattoncini, quindi E corrisponde a $\frac{1}{16}$.

**Regola 2 — Conta l'area, non i lati.** Per confrontare due zone si conta il numero di [[select: lati|*quadratini|angoli]] che le compongono, non quanto sembrano lunghe.

**Regola 3 — Due nomi per la stessa quantità.** Raggruppando i 16 mattoncini a coppie, la zona D passa da $\frac{2}{16}$ a $\frac{1}{8}$: il terreno che occupa [[select: diminuisce|*resta lo stesso|aumenta]], perché a cambiare è soltanto [[select: la forma della zona|*l'unità con cui contiamo|l'area della zona]].

**Regola 4 — Sommare zone confinanti.** Due frazioni con lo **stesso** denominatore si sommano sommando i [[select: *numeratori|denominatori|numeratori e i denominatori]] e lasciando invariato il denominatore: $\frac{2}{16} + \frac{2}{16} = \frac{4}{16}$.

**Regola 5 — Dal terreno al prezzo.** Se conosciamo il valore dell'intero terreno, il valore di una zona si ottiene [[select: dividendo per il numeratore|*moltiplicando il totale per la sua frazione|sommando la sua frazione]].

:::div.reveal
**Le regole d'oro delle frazioni:**

- Una frazione conta parti **uguali** di un intero.
- Figure **equiestese** → stessa **area**, anche con forme diverse.
- Si misura tutto con un'**unità comune** (qui E $= \frac{1}{16}$).
- Si confronta l'**area** (i quadratini), non la lunghezza dei lati.
- Una stessa zona può avere **due nomi** ($\frac{2}{16}$ e $\frac{1}{8}$): cambia l'unità con cui conti, non il terreno.
- Si **somma** a parità di denominatore sommando i numeratori: $\frac{2}{16} + \frac{2}{16} = \frac{4}{16}$.
- Il **valore** di una zona $=$ valore totale $\times$ frazione della zona.

E quei "due nomi per la stessa quantità"? È il punto di partenza della prossima lezione. 🎉
:::
