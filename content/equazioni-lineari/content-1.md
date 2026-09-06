> id: equilibrio-equivalenza
> title: L'equilibrio e l'equivalenza
> description: Un mattone pesa un chilo più mezzo mattone. Quanto pesa il mattone?

---

> id: il-mattone
> title: Il problema del mattone

# Un mattone e mezzo mattone

:::div.highlight
🧱 **Un mattone pesa un chilo più mezzo mattone.**

Quanto pesa il mattone?
:::

Non rispondere di getto: la prima risposta che viene in mente, a questo
problema, quasi sempre è sbagliata. Conviene prima *vedere* la frase, e poi
risolverla.

Mettiamola su una bilancia a due piatti. Su un piatto il mattone intero; su
quell'altro mezzo mattone e un peso da un chilo. La frase del problema dice
esattamente questo: i due piatti **pesano uguale**, la bilancia è in
**equilibrio**.

:::p5 goal sketch=bilancia-mattone modo=libero height=360
:::

Adesso rovinala pure: i bottoni sotto ogni piatto aggiungono e tolgono pezzi da
**quel piatto soltanto**. Falli fuori uno alla volta e guarda da che parte va
giù. Poi prova a riportarla in equilibrio in una situazione
diversa da quella di partenza — te ne servono due diverse per andare avanti.

Rispondi guardando la bilancia:

Se aggiungo un peso da un chilo solo sul piatto di sinistra, la bilancia
[[resta in equilibrio|*pende a sinistra|pende a destra]]

Se poi ne aggiungo uno uguale anche sul piatto di destra, la bilancia
[[*torna in equilibrio|resta giù a sinistra|va giù a destra]]

Quindi la bilancia resta in equilibrio se faccio
[[select: una mossa qualsiasi|una mossa su un piatto solo|*la stessa mossa su tutti e due i piatti]].

:::div.reveal
Ecco la regola che useremo per tutta la lezione: **quello che fai da una parte
devi farlo anche dall'altra**. Se aggiungi un chilo a sinistra e un chilo a
destra, i due piatti cambiano tutti e due allo stesso modo e restano uguali fra
loro.

Attenzione a una cosa: la bilancia non ti dice *quanto* pesa un pezzo. Ti dice
solo se le due parti pesano uguale oppure no. Con questa sola informazione,
nello step successivo, arriviamo alla risposta.
:::

---

> id: mosse-gemelle
> title: Le mosse gemelle

# Una mossa, tutti e due i piatti

Da qui in avanti non puoi più agire su un piatto solo: ogni mossa vale
**contemporaneamente sui due piatti**. Togli mezzo mattone? Lo togli da tutte e
due le parti. Aggiungi un chilo? Lo aggiungi da tutte e due le parti. C'è anche
il tasto `×2`, che raddoppia tutto quello che sta sui due piatti.

Due tasti non spostano niente: `spezza` taglia in due metà ogni mattone intero,
`unisci` rimette insieme le metà. Il peso sui piatti non cambia — è lo stesso
mattone, raccontato in un altro modo.

Così l'equilibrio non si rompe mai — e siccome non si rompe mai, tutto quello
che leggi alla fine è vero quanto quello che c'era scritto all'inizio.

:::div.highlight
🎯 **Obiettivo:** far restare a sinistra **un solo mattone intero** e a destra
**soltanto pesi da un chilo**. A quel punto la bilancia ti avrà detto quanto
pesa il mattone.
:::

:::details.hint
<summary>💡 Suggerimento</summary>

A destra c'è mezzo mattone, a sinistra un mattone intero: per togliere la
stessa identica cosa da tutte e due le parti, prima devi vedere anche il
mattone intero come **due metà**. Il tasto `spezza` fa esattamente questo.

:::

:::p5 goal sketch=bilancia-mattone modo=doppia height=380
:::

Quando hai finito, rispondi:

Mezzo mattone pesa [[1]] chilo.

Un mattone intero pesa [[2]] chili.

:::div.reveal
Torniamo alla frase di partenza: 2 chili sono davvero *un chilo più mezzo
mattone*, cioè un chilo più un chilo. Torna.

Nota bene come ci sei arrivato. Non hai mai pesato niente: hai solo continuato
a fare la stessa cosa da tutte e due le parti, passando da una situazione
all'altra. Situazioni fatte di pezzi diversi, che però pesano uguale: è tutto
quello che serve per rispondere a una domanda come questa.

Dal prossimo step la stessa cosa la scriviamo, e i mattoni li mettiamo via.
:::

---

> id: dalla-bilancia-allequazione
> title: Dalla bilancia all'equazione

# Se chiamo x il peso del mattone

Sui piatti abbiamo pesato tutto in chili tranne una cosa: il mattone. Diamogli
un nome. Chiamiamo $x$ il peso di un mattone, in chili. Non sappiamo quanto
vale — è esattamente quello che stiamo cercando — ma possiamo già scriverci
sopra. Una lettera messa al posto di un numero che non si conosce si chiama
**incognita**.

Adesso i due piatti si sanno scrivere:

- a sinistra c'era un mattone intero, cioè $x$;
- a destra mezzo mattone e un peso da un chilo, cioè $\frac{x}{2} + 1$.

E la bilancia era **in equilibrio**: i due piatti pesano uguale. Questo si
scrive con il segno di uguale:

$$x = \frac{x}{2} + 1$$

:::div.highlight
📐 Una scrittura come questa si chiama **equazione**. Un'equazione *è* una
bilancia in equilibrio: due scritture separate da un uguale, che valgono la
stessa cosa.

I due piatti hanno un nome: si chiamano **membri**. A sinistra il **primo
membro**, a destra il **secondo membro**. Ciascuno dei due è un'**espressione
algebrica**, cioè un conto in cui compaiono anche delle lettere.
:::

## Le mosse di prima, scritte

Non c'è niente di nuovo da imparare: le tre mosse che hai fatto sulla bilancia
si riscrivono una per una.

**Spezza il mattone in due metà.** Il piatto sinistro non cambia peso, cambia
solo come lo scrivo: un mattone sono due mezzi mattoni.

$$\frac{x}{2} + \frac{x}{2} = \frac{x}{2} + 1$$

**Togli mezzo mattone da tutti e due i piatti.**

$$\frac{x}{2} + \frac{x}{2} - \frac{x}{2} = \frac{x}{2} + 1 - \frac{x}{2}$$

Da una parte e dall'altra restano:

$$\frac{x}{2} = 1$$

**Raddoppia quello che sta sui due piatti.**

$$2 \cdot \frac{x}{2} = 2 \cdot 1$$

cioè

$$x = 2$$

Il mattone pesa 2 chili — la stessa risposta di prima, ottenuta senza mai
guardare la bilancia.

Rispondi tu, adesso. Nell'equazione $2x + 1 = 9$ il **primo membro** è
[[*2x + 1|9|x]]

e il **secondo membro** è [[*9|2x + 1|2]]

Scrivere un'equazione vuol dire dire che i due membri
[[select: sono scritti allo stesso modo|*valgono la stessa cosa|hanno la stessa lettera]].

:::div.reveal
Attenzione a una differenza: i due membri **non** sono scritti allo stesso
modo — $x$ e $\frac{x}{2} + 1$ sono scritture diverse. È il loro **valore** a
essere lo stesso, esattamente come due piatti pieni di cose diverse che pesano
uguale.

Nota anche un'altra cosa: riscrivendo le mosse hai prodotto una fila di
equazioni diverse, una per mossa, fino a $x = 2$. Che cosa hanno in comune fra
loro, e perché era lecito passare dall'una all'altra, è la domanda dello step
che segue.
:::

---

> id: la-soluzione
> title: Che cos'è una soluzione

# Il valore che tiene in piedi l'uguaglianza

Nell'equazione del mattone

$$x = \frac{x}{2} + 1$$

la $x$ non sta per un numero qualunque: sta per **quel** numero che rende vera
l'uguaglianza fra i due membri. E adesso che un candidato ce l'abbiamo, lo
possiamo mettere alla prova.

Abbiamo trovato 2. Mettiamo 2 al posto di ogni $x$ e facciamo i conti nei due
membri, separatamente:

- primo membro: $x$ diventa $2$;
- secondo membro: $\frac{x}{2} + 1$ diventa $\frac{2}{2} + 1 = 1 + 1 = 2$.

I due membri danno lo stesso numero, quindi l'uguaglianza è **vera**: il 2
funziona.

:::div.highlight
🔑 Una **soluzione** di un'equazione è un valore che, messo al posto
dell'incognita, rende **vera** l'uguaglianza fra i due membri.

**Risolvere** un'equazione vuol dire trovarne le soluzioni.
:::

Un numero che non funziona si smaschera allo stesso modo. Prova con 4, sempre
nell'equazione $x = \frac{x}{2} + 1$:

il primo membro diventa [[4]]

il secondo membro diventa $\frac{4}{2} + 1$, cioè [[3]]

I due membri danno numeri diversi, quindi 4
[[select: è|*non è]] una soluzione di quell'equazione.

Un'ultima verifica, su una delle scritture che hai incontrato strada facendo:
la soluzione di $\frac{x}{2} = 1$ è [[2]]

:::div.reveal
Fermati un attimo su quest'ultima risposta. $x = \frac{x}{2} + 1$,
$\frac{x}{2} = 1$ e $x = 2$ sono tre equazioni scritte in modo diverso, ma
hanno **la stessa soluzione**: il 2.

Non è una coincidenza. Ogni mossa fatta su tutti e due i piatti lascia vere
esattamente le stesse sostituzioni — ed è per questo che alla fine della fila
la risposta è ancora quella di partenza. Nel prossimo step diamo un nome a
questa proprietà, e le regole per usarla.
:::

---

> id: primo-principio
> title: Il primo principio di equivalenza

# Aggiungi o togli, ma da tutte e due le parti

Due equazioni che hanno **le stesse soluzioni** si dicono **equivalenti**. È il
nome di quello che hai appena visto: $x = \frac{x}{2} + 1$, $\frac{x}{2} = 1$ e
$x = 2$ sono tre equazioni equivalenti fra loro.

Risolvere un'equazione, allora, vuol dire trasformarla in una equivalente più
semplice, e quella in un'altra ancora, finché la soluzione non si legge da sé.
Le regole che garantiscono di non cambiare le soluzioni per strada sono due, e
si chiamano **principi di equivalenza**. Eccone uno.

:::div.highlight
⚖️ **Primo principio di equivalenza.** Se ai due membri di un'equazione si
aggiunge, oppure si toglie, **la stessa quantità**, si ottiene un'equazione
**equivalente** a quella di partenza.
:::

È la mossa che hai già fatto con le mani: togliere mezzo mattone da tutti e due
i piatti.

Qui sotto c'è una **lavagna**: l'equazione non si risolve scrivendo la
risposta, si trasforma una mossa per volta. In questi due esercizi l'unico
principio disponibile è il primo — le altre voci del menu servono solo a fare i
conti che restano.

Il modulo in basso applica il principio ai due membri: scegli se aggiungere o
togliere e scrivi che cosa. Poi tocca i pezzi della scrittura per sistemare i
conti. Il traguardo è arrivare a $x = $ un numero.

:::algebra isola="x" mosse="primo-principio;calcola;riduci-simili;elimina-nullo"
x + 3 = 8
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Guarda il primo membro: c'è $x + 3$, ma tu vuoi restare con la sola $x$. Quel
$3$ è di troppo, e c'è un modo solo per farlo sparire da una somma: **toglierne
altrettanto**, perché $3 - 3$ fa $0$.

Il punto è che non lo puoi togliere di nascosto da una parte sola — sbilanceresti
la bilancia. Il principio serve proprio a questo: togli $3$ a **tutti e due** i
membri, e l'uguaglianza resta vera.

Nel modulo in basso scegli *togli* e scrivi $3$.

:::

Adesso uno in cui la quantità va aggiunta invece che tolta:

:::algebra isola="x" mosse="primo-principio;calcola;riduci-simili;elimina-nullo"
x - 4 = 6
:::

:::div.reveal
Hai notato che cosa fa il principio? Sceglie una quantità e la scrive **da
tutte e due le parti**, senza fare nessun conto: $x + 3 - 3 = 8 - 3$. I conti
vengono dopo, e sono tuoi.

E hai scelto ogni volta la quantità che **fa sparire** il termine di troppo
accanto alla $x$: quella è tutta la strategia.
:::

---

> id: secondo-principio
> title: Il secondo principio di equivalenza

# Moltiplica o dividi, ma tutti e due i membri

:::div.highlight
⚖️ **Secondo principio di equivalenza.** Se i due membri di un'equazione si
moltiplicano, oppure si dividono, per **uno stesso numero diverso da zero**, si
ottiene un'equazione **equivalente** a quella di partenza.
:::

È il tasto `×2` della bilancia: raddoppiare quello che sta sui due piatti non
rompe l'equilibrio. E si può fare anche al contrario, dimezzando.

Il "diverso da zero" non è un capriccio: moltiplicare per zero svuoterebbe tutti
e due i piatti, e una bilancia vuota è in equilibrio qualunque cosa valesse $x$.

Qui il primo principio non c'è: si passa solo per il secondo.

:::algebra isola="x" mosse="secondo-principio;calcola;semplifica;normalizza-monomio"
3x = 12
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Anche qui c'è un $3$ di troppo accanto alla $x$ — ma non è lo stesso $3$ di
prima. Lì era **sommato**: $x + 3$, due termini messi uno accanto all'altro.
Qui è **moltiplicato**: $3x$ vuol dire $3 \cdot x$, e quel $3$ è *attaccato*
alla $x$.

Ed è per questo che togliere $3$ non servirebbe a niente: $3x - 3$ non diventa
$x$, diventa solo una scrittura più lunga — ed è il motivo per cui qui il primo
principio non te lo do.

Per staccare un fattore ci vuole l'operazione contraria della moltiplicazione:
la **divisione**. Dividi tutti e due i membri per $3$ — è il secondo principio,
e stavolta è l'unico modulo che hai.

:::

E adesso al contrario, con l'incognita divisa a metà:

:::algebra isola="x" mosse="secondo-principio;calcola;semplifica;normalizza-monomio"
x/2 = 5
:::

:::div.reveal
Due regole in tutto, ed è tutto quello che serve: il primo principio toglie di
mezzo quello che sta **sommato** all'incognita, il secondo quello che le sta
**moltiplicato** attorno.

L'ultimo esercizio è esattamente l'ultima mossa del mattone: da
$\frac{x}{2} = 1$, moltiplicando i due membri per 2, si arriva a $x = 2$. Nello
step che segue rifai tutto il problema dall'inizio, con i due principi in mano.
:::

---

> id: il-mattone-sulla-lavagna
> title: Il mattone, senza più bilancia

# Il problema di partenza, dall'inizio

Eccola di nuovo, l'equazione da cui è cominciata la lezione:

$$x = \frac{x}{2} + 1$$

Adesso hai tutto quello che serve per risolverla senza bilance e senza disegni:
i due principi di equivalenza, più i conti che restano da fare. Nessuna mossa
nuova.

:::details.hint
<summary>💡 Da dove comincio</summary>

Il fastidio più grosso è quella metà: finché c'è, ogni conto è un conto con le
frazioni. Comincia dal **secondo** principio e moltiplica tutti e due i membri
per $2$: la metà sparisce, e ti restano due mattoni da una parte e un mattone
più due chili dall'altra.

A quel punto l'incognita è rimasta in tutti e due i membri: **toglila da tutti
e due** con il primo principio, come toglievi mezzo mattone dai due piatti.
Quello che avanza sono conti.

:::

:::details.hint
<summary>🖐 Non trovo «somma i termini simili»</summary>

Quella mossa agisce su **tutta** una somma, non su un termine solo: se tocchi
un termine soltanto, nel menu non compare.

Per prendere tutto il membro: tocca uno dei suoi termini e poi il rimando
**↑ scegli l'espressione che lo contiene**, appena sotto le mosse. Adesso la
somma è scelta per intero, e la mossa c'è.

:::

:::algebra isola="x" mosse="primo-principio;secondo-principio;calcola;semplifica;riduci-simili;normalizza-monomio;elimina-nullo"
x = x/2 + 1
:::

:::div.reveal
$x = 2$: il mattone pesa due chili. Stessa risposta della bilancia, ottenuta
con due sole regole scritte.

E guarda che strada hai fatto: prima il secondo principio, per toglierti di
mezzo la frazione, poi il primo, per radunare l'incognita da una parte sola.
Quasi tutte le equazioni che incontrerai si risolvono così, in quest'ordine.

Adesso rileggi la frase da cui sei partito — *un mattone pesa un chilo più
mezzo mattone*. La frase e l'equazione dicono la stessa identica cosa. La
differenza è che l'equazione, in mano, si può muovere.
:::
