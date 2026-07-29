> id: riga-e-compasso
> title: Le due mosse
> description: Punto, retta, circonferenza e le costruzioni esatte con riga e compasso.

---

> id: due-mosse
> title: Le regole del gioco

# I righelli hanno perso i numeri

Da oggi, in questa pagina, **è vietato misurare** e **è vietato andare a
occhio**. Hai a disposizione due soli strumenti, e ognuno sa fare una cosa sola:

- la **riga**: tira la retta che passa per due punti;
- il **compasso**: traccia la circonferenza che ha il centro in un punto e
  passa per un altro punto.

Nient'altro. Provale: clicca in un punto qualsiasi del foglio per segnarlo,
poi scegli lo strumento e clicca i due punti su cui vuoi usarlo.

:::p5 goal sketch=riga-e-compasso obiettivo=mosse liberi=si
:::

Guarda bene il disegno che hai ottenuto: la riga ha tracciato una linea che
**finisce dentro il foglio** oppure che [[select: si ferma sui due punti|*prosegue oltre i due punti]]?

Adesso guarda il compasso. Hai puntato in un punto e sei passato per un altro:
prendi un punto qualsiasi della circonferenza che hai tracciato, anche dalla
parte opposta. La sua distanza dal centro è [[select: più piccola se sta in basso|impossibile da sapere|*sempre la stessa]].

:::div.reveal
Questo è il vocabolario che useremo, e sono tutti oggetti che hai appena visto:

| Ente | Che cos'è |
| ---- | --------- |
| **punto** | una posizione, senza dimensioni: non ha lunghezza né spessore |
| **retta** | infinita nei due sensi: la riga ne mostra solo il pezzo che sta nel foglio |
| **piano** | la superficie piatta su cui stai disegnando, ma senza bordi |
| **segmento** | la parte di retta *compresa* fra due punti |
| **semiretta** | parte da un punto e prosegue all'infinito da una parte sola |
| **circonferenza** | tutti i punti che stanno a una **certa distanza** da un centro |

Sul **piano** vale la pena fermarsi un attimo, perché è l'unico che non hai
disegnato: è il posto dove tutto il resto succede. Immagina di poter trascinare
il foglio in ogni direzione quanto vuoi, senza mai arrivare a un margine: quel
foglio infinito e perfettamente piatto è il piano. Ogni punto che segnerai e
ogni retta che tirerai stanno lì dentro, e proprio perché non finisce mai due
rette non parallele prima o poi si incontrano — anche se il pezzo di piano che
vedi nello schermo è troppo piccolo per mostrartelo.

Punto, retta e piano sono gli **enti fondamentali**: non si definiscono a
partire da qualcos'altro, sono il materiale di partenza. Tutto il resto — e da
qui in poi ogni figura che costruirai — nasce da loro e dalle due mosse.

E tieni da conto la risposta che hai dato sul compasso: **tutti i punti di una
circonferenza distano dal centro esattamente uguale**. È l'unica proprietà che
serve per tutto il resto di questa lezione.
:::

---

> id: equidistante
> title: Un punto in mezzo

# Alla stessa distanza da tutti e due

Sul foglio ci sono due punti, `A` e `B`. Da qui in avanti cade anche la
possibilità di segnare punti a caso: **puoi usare solo punti che esistono già**.

Il tuo compito: trovare un punto che stia **esattamente** alla stessa distanza
da `A` e da `B`. Non "circa": esattamente.

:::p5 goal sketch=riga-e-compasso obiettivo=equidistanti quanti=1
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Il compasso è l'unico strumento che sa **tenere una distanza**. Tutti i punti
della circonferenza di centro `A` che passa per `B` distano da `A` quanto…
`B`.

Se ora tracci anche la circonferenza di centro `B` che passa per `A`, i due
disegni si incrociano. Che cosa hanno di speciale i punti di incrocio?

:::

Il punto che hai trovato sta su due circonferenze che hanno lo **stesso raggio**:
la sua distanza da `A` e la sua distanza da `B` sono [[select: *uguali|impossibili da confrontare|una il doppio dell'altra]].

:::div.reveal
Nota il punto chiave: non hai *misurato* niente. Il compasso non ti ha detto
quanto vale la distanza `AB`, e non ti serviva saperlo. Ti è bastato
**riportarla uguale** due volte, ed è l'incrocio a fare il lavoro.

Una costruzione con riga e compasso non produce un disegno "preciso": produce
un punto **esatto**, cioè uno di cui puoi dire *perché* è al posto giusto.
:::

---

> id: tanti-punti
> title: E se non fosse l'unico?

# Uno, due… quanti?

Il punto che hai trovato è *un* punto equidistante da `A` e `B`. Ma è **l'unico**?

Qui sotto ne servono **tre**, tutti distinti e tutti alla stessa distanza da
`A` e da `B`. In alto a destra c'è il contatore.

:::p5 goal sketch=riga-e-compasso obiettivo=equidistanti quanti=3
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Due li ottieni come prima: le due circonferenze si incrociano in **due** punti,
uno sopra e uno sotto.

Per il terzo, prova a guardare quei due punti e a chiederti: se ci faccio
passare la riga, dove passa quella retta? E che cosa succede quando incontra
la retta `AB`?

:::

I punti equidistanti da `A` e `B` che hai trovato sono [[select: sparsi a caso|tutti dalla stessa parte|*allineati]].

:::div.reveal
Non sono tre: sono **infiniti**, e stanno tutti su una stessa retta.

Quella retta ha un nome: è l'**asse del segmento AB**. E la sua definizione non
parla di come si disegna, ma di *chi ci sta sopra*:

> l'asse di `AB` è l'insieme di **tutti e soli** i punti equidistanti da `A` e da `B`.

Un insieme di punti definito da una proprietà si chiama **luogo geometrico**.
Anche la circonferenza lo è: il luogo dei punti che stanno a distanza fissa dal
centro. Le due mosse, in fondo, disegnano luoghi — e le costruzioni nascono da
dove due luoghi si incontrano.
:::

---

> id: punto-medio
> title: Il centro esatto

# Tagliare un segmento a metà

Ora sul foglio c'è anche il **segmento** `AB` disegnato. Trova il suo **punto
medio**: il punto che lo divide in due parti uguali.

Ricorda: la riga non ha numeri, quindi "misuro e divido per due" non è una
mossa disponibile.

:::p5 goal sketch=riga-e-compasso obiettivo=punto-medio figura=segmento
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Il punto medio è alla stessa distanza da `A` e da `B`: quindi sta sull'asse.
Ma sta anche **sul segmento** `AB`.

Due condizioni insieme, due luoghi che si incrociano: costruisci l'asse e
guarda dove taglia il segmento.

:::

Il punto medio è l'unico punto che sta contemporaneamente su [[select: due circonferenze|*asse e segmento|due segmenti]].

:::div.reveal
Hai appena eseguito la prima costruzione classica di Euclide: **il punto medio
di un segmento**. Il metodo vale per qualunque segmento, lungo o corto, e non
richiede mai di sapere quanto misura.

E hai anche scoperto che l'asse taglia `AB` **a metà** e **ad angolo retto**:
per questo si chiama anche *asse perpendicolare*. Segnati questa parola:
serve alla prossima pagina.
:::

---

> id: perpendicolare
> title: Fuori dalla retta

# Scendere in perpendicolare

Cambia la figura: adesso c'è una retta `r` e un punto `P` che **non** le
appartiene.

Traccia la retta che passa per `P` ed è **perpendicolare** a `r`.

:::p5 goal sketch=riga-e-compasso obiettivo=perpendicolare figura=retta-e-punto
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Ti serve un asse, ma il segmento da dimezzare non è ancora disegnato:
**fabbricatelo**.

Punta il compasso in `P` e traccia una circonferenza che tagli `r`: ottieni due
punti su `r` che distano da `P` la stessa identica quantità. Adesso hai un
segmento con cui lavorare — e `P` ha già la proprietà giusta per starci sopra.

:::

Perché `P` sta sull'asse dei due punti che hai ottenuto su `r`? Perché
`P` è [[select: *equidistante da entrambi|il punto medio di r|il centro di r]].

:::div.reveal
Stessa idea di prima, oggetto diverso: hai riusato l'asse in una situazione in
cui il segmento non c'era e te lo sei costruito tu.

Da qui in poi hai una mossa in più nel repertorio: **la perpendicolare a una
retta per un punto dato**. È il mattone con cui si costruiscono i quadrati, le
altezze dei triangoli e le distanze fra punto e retta.
:::

---

> id: equilatero
> title: Il triangolo che nasce da due cerchi

# Tre lati uguali

Torniamo ad `A` e `B`. Costruisci un **triangolo equilatero** che abbia il
segmento `AB` come lato: il terzo vertice va trovato, e poi i due lati vanno
tracciati con la riga.

:::p5 goal sketch=riga-e-compasso obiettivo=equilatero figura=segmento
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Il terzo vertice deve distare da `A` esattamente quanto è lungo `AB`, e deve
distare **la stessa cosa** da `B`. Sono le due circonferenze della seconda
pagina: le hai già disegnate una volta.

:::

Il terzo vertice sta sull'incrocio di due circonferenze che hanno lo stesso
raggio `AB`: allora i tre lati sono [[select: uguali due a due|di lunghezza qualsiasi|*tutti uguali ad AB]].

Al minimo, quante mosse servono? Due circonferenze più i due lati da tracciare: [[4]]

:::div.reveal
Questa è la **Proposizione 1 del Libro I degli Elementi** di Euclide: la
primissima cosa che viene costruita in tutta l'opera, con due circonferenze e
due tratti di riga.

E nota che la costruzione non "assomiglia" a un triangolo equilatero: **è**
equilatera, perché i due lati nuovi sono raggi di circonferenze di raggio `AB`.
La figura non ti convince perché è bella: ti convince perché sai da dove viene
ogni punto.
:::

---

> id: bisettrice
> title: La stessa idea, su un angolo

# Dividere un angolo a metà

Sul foglio c'è un **angolo**: il vertice `V` e due semirette che passano per
`S` e per `T`. I due punti sono alla stessa distanza da `V`.

Traccia la retta che divide l'angolo in due parti uguali.

:::p5 goal sketch=riga-e-compasso obiettivo=bisettrice figura=angolo
:::

:::details.hint
<summary>💡 Suggerimento</summary>

Non pensare all'angolo: pensa ai due punti `S` e `T`.

Se costruisci l'asse del segmento `ST`, quella retta passa anche per `V`? Prova
a rispondere prima di disegnare: `V` è equidistante da `S` e da `T`?

:::

L'asse di `ST` passa per `V` perché [[select: V è il punto medio di ST|*V è equidistante da S e T|tutte le rette passano per V]].

:::div.reveal
La retta che hai tracciato si chiama **bisettrice** dell'angolo, e anche lei è
un luogo geometrico: l'insieme dei punti equidistanti dai **due lati**
dell'angolo.

Guarda che cosa è successo in queste quattro pagine: hai imparato **una** idea
— il luogo dei punti equidistanti — e l'hai riusata per il punto medio, per la
perpendicolare e ora per la bisettrice. In geometria si va avanti così: poche
costruzioni di base, ricombinate.
:::

---

> id: e-se
> title: E se…?

# Le regole cambiano il gioco

Un'ultima domanda, e stavolta non c'è una spunta da prendere.

Hai diviso un **segmento** in due parti uguali, e hai diviso un **angolo** in
due parti uguali. Sembra naturale chiedersi: e in **tre** parti uguali?

Per il segmento si può fare (lo vedremo). Per l'angolo, prova pure: il foglio
qui sotto è libero, con l'angolo di prima.

:::p5 sketch=riga-e-compasso figura=angolo liberi=si lato=380
:::

:::div.highlight
🧭 Non è colpa tua se non ci riesci. Nel 1837 Pierre Wantzel ha **dimostrato**
che con la sola riga e il solo compasso trisecare un angolo qualsiasi è
**impossibile**: non "difficile", proprio impossibile. Con altri strumenti,
invece, si fa.
:::

Quindi le due mosse non sono un limite del disegno: sono una **scelta**, e sono
loro a decidere quali figure esistono in questa geometria. Cambiando le regole,
cambia il mondo delle figure costruibili.

Ripasso finale: un insieme di punti definito da una proprietà (come l'asse o la
circonferenza) si chiama [[select: ente fondamentale|costruzione|*luogo geometrico]].

E gli enti che non si definiscono, ma da cui parte tutto, sono il punto, la
retta e il [[piano]].

:::div.reveal
🎉 Hai finito la prima lezione.

Il tuo repertorio adesso contiene: **asse di un segmento**, **punto medio**,
**perpendicolare per un punto**, **triangolo equilatero**, **bisettrice di un
angolo**.

Nella prossima lezione useremo questi mattoni per costruire figure più grandi —
e per rispondere alla domanda che Euclide si pone subito dopo: dati tre
segmenti qualsiasi, esiste sempre un triangolo che li ha come lati?
:::
