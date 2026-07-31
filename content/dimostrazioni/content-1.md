> id: costruire-una-dimostrazione
> title: Costruire una dimostrazione
> description: Un passo è premesse + garanzia + conclusione. Da qui nascono tutti gli esercizi.

---

> id: un-passo
> title: Che cos'è un passo

# Una dimostrazione non è un tema

Quando dimostri, non stai raccontando: stai **incatenando**. Ogni passo che
scrivi è fatto sempre di tre cose, e se ne manca una il passo non regge.

| Pezzo | Che cos'è | Esempio |
| ----- | --------- | ------- |
| **premesse** | ciò che hai già: le ipotesi, o passi precedenti | *AB è parallelo a DC* |
| **garanzia** | la regola che ti autorizza a concludere | *gli angoli alterni interni sono congruenti* |
| **conclusione** | l'asserzione nuova che guadagni | *l'angolo BAM è congruente all'angolo DCM* |

La garanzia non te la inventi al momento: la prendi da una **teoria**, cioè
dall'elenco di definizioni, assiomi e teoremi che in quel momento hai il
diritto di usare. È il motivo per cui la stessa frase può essere una
dimostrazione in quarta e non esserlo in prima.

Nel passo *"il triangolo ABM è congruente al triangolo CDM, per il secondo
criterio"*, «per il secondo criterio» è la [[select: premessa|conclusione|*garanzia]].

:::div.reveal
Tienilo a mente nella prossima pagina: quando un passo non funziona, quasi
sempre è perché usa una premessa che **non hai ancora**, oppure perché invoca
una garanzia che **non dà** quella conclusione.
:::

---

> id: diagonali-parallelogramma
> title: Le diagonali del parallelogramma

Qui sotto c'è lo stesso teorema in cinque vesti. Comincia da **Leggi**: clicca
un passo e guarda due cose insieme — i fili a sinistra, che ti dicono da dove
nasce e dove verrà riusato, e la figura, dove si accende in rosso di che cosa
sta parlando (in blu ciò su cui si appoggia). Funziona anche al contrario:
clicca un pezzo del disegno e trovi il passo che lo nomina. Poi passa a
**Ordina**, e vai avanti finché non arrivi a **Costruisci**, dove hai solo le
ipotesi.

:::theorem id=diag-par titolo="In un parallelogramma le diagonali si tagliano scambievolmente per metà" modi=leggi,ordina,giustifica,completa,costruisci mancanti=2
figura: parallelogramma-diagonali

## ipotesi
- $ABCD$ è un parallelogramma {fig: quadrilatero}
- Le diagonali $AC$ e $BD$ si incontrano in $M$ {fig: diagonali}

## tesi
- $AM \cong MC$ e $BM \cong MD$ {fig: meta}

## dimostrazione
- $AB$ è parallelo a $DC$ {da: h1, per: def-par, fig: lati-opposti}
- $AB \cong DC$ {da: h1, per: lati-opp, fig: lati-opposti}
- L'angolo $B\hat{A}M \cong$ l'angolo $D\hat{C}M$ {da: p1, per: alt-int, fig: angoli-alterni-1}
- L'angolo $A\hat{B}M \cong$ l'angolo $C\hat{D}M$ {da: p1, per: alt-int, fig: angoli-alterni-2}
- Il triangolo $ABM \cong$ il triangolo $CDM$ {da: p2,p3,p4, per: crit2, fig: triangoli}
- {t1, da: p5, per: corr}

## distrattori
- L'angolo $B\hat{A}D \cong$ l'angolo $B\hat{C}D$ {per: ang-opp, tipo: inutile}
- Il triangolo $ABM \cong$ il triangolo $CDM$ {per: crit1, tipo: garanzia-sbagliata}
- $AC \cong BD$ {per: diag-rett, tipo: falso}
:::

:::div.reveal
Nota una cosa: non c'è **un** ordine giusto. I passi 2, 3 e 4 puoi scriverli
in qualunque sequenza, purché ognuno venga dopo quello che usa. Una
dimostrazione non è una fila, è una **rete**.
:::

---

> id: la-teoria-cresce
> title: La teoria cresce

Il teorema che hai appena dimostrato adesso è **tuo**: da qui in poi puoi
usarlo come garanzia, senza rifare la dimostrazione. È così che la matematica
si costruisce, ed è per questo che l'ordine degli argomenti non è un dettaglio.

Guarda la cassetta degli attrezzi qui sotto: c'è una voce nuova.

:::theorem id=diag-rombo titolo="In un rombo le diagonali si tagliano scambievolmente per metà" modi=leggi,giustifica

## ipotesi
- $ABCD$ è un rombo
- Le diagonali $AC$ e $BD$ si incontrano in $M$

## tesi
- $AM \cong MC$ e $BM \cong MD$

## dimostrazione
- $ABCD$ è un parallelogramma {da: h1, per: rombo-par}
- {t1, da: p1,h2, per: diag-par}
:::

Due righe, invece di sei. Non perché il rombo sia più facile, ma perché il
lavoro l'avevi già fatto.
