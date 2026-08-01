<!-- Congruenza: i teoremi che si dimostrano con i criteri.
     Ogni blocco AGGIUNGE la dimostrazione a una voce di teoria.yaml. -->

<!-- Il secondo criterio si dimostra dal primo per assurdo, e la dimostrazione
     si biforca: è l'esempio di riferimento del ragionamento ipotetico
     (DIMOSTRAZIONI.md §8). Niente `ordina`/`costruisci`: uno scope non è
     esprimibile in una catena da riordinare. -->
:::theorem id=secondo-criterio modi=leggi,giustifica
figura: geometria-secondo-criterio

## ipotesi
- $BC \cong B'C'$ {fig: lati}
- $A\hat{B}C \cong A'\hat{B'}C'$ {fig: angoli-b}
- $A\hat{C}B \cong A'\hat{C'}B'$ {fig: angoli-c}

## tesi
- Il triangolo $ABC \cong$ il triangolo $A'B'C'$ {fig: triangoli}

## dimostrazione
- I due triangoli **non** sono congruenti {assurdo: t1}
- Non può essere $AB \cong A'B'$ {da: s1,h1,h2, per: primo-criterio}
- Dunque $AB > A'B'$ oppure $AB < A'B'$ {da: p1, per: confronto-segmenti}

### caso $AB > A'B'$ {da: p2, fig: lati-ab}
- Si prenda su $AB$ il punto $P$ tale che $BP \cong B'A'$ {costruzione, da: a1, per: assioma-trasporto, fig: punto-p}
- Il triangolo $PBC \cong$ il triangolo $A'B'C'$ {da: c1,h1,h2, per: primo-criterio, fig: triangolo-p}
- $P\hat{C}B \cong A'\hat{C'}B'$ {da: a2, per: elementi-corrispondenti, fig: angolo-pcb}
- $P\hat{C}B \cong A\hat{C}B$ {da: a3,h3, per: proprieta-transitiva}
- $P\hat{C}B < A\hat{C}B$ {da: c1, per: parte-minore-del-tutto, fig: confronto-angoli}
- {contraddizione, da: a4,a5}

### caso $AB < A'B'$ {da: p2}
- Si scambiano i ruoli dei due triangoli: il punto si prende su $A'B'$ e si ritrova lo stesso assurdo sull'angolo in $C'$ {analogo: a1}

### quindi
- {contraddizione, da: a6,b2, per: esame-dei-casi}
- {t1, da: p3, per: riduzione-all-assurdo}

## distrattori
- $AB \cong A'B'$ {per: elementi-corrispondenti, tipo: falso}
:::

:::theorem id=triangolo-isoscele-angoli-base modi=leggi,ordina,giustifica,completa,costruisci

## ipotesi
- Il triangolo $ABC$ è isoscele sulla base $BC$

## tesi
- $A\hat{B}C \cong A\hat{C}B$

## dimostrazione
- Si tracci la bisettrice $AH$ dell'angolo $B\hat{A}C$, con $H$ sulla base {costruzione, da: h1}
- $AB \cong AC$ {da: h1, per: definizione-isoscele}
- $B\hat{A}H \cong H\hat{A}C$ {da: c1, per: definizione-bisettrice}
- $AH \cong AH$ {da: c1, per: proprieta-riflessiva}
- Il triangolo $ABH \cong$ il triangolo $ACH$ {da: p1,p2,p3, per: primo-criterio}
- {t1, da: p4, per: elementi-corrispondenti}

## distrattori
- $BH \cong HC$ {per: elementi-corrispondenti, tipo: inutile}
- Il triangolo $ABH \cong$ il triangolo $ACH$ {per: terzo-criterio, tipo: garanzia-sbagliata}
- $AB \cong BC$ {per: definizione-isoscele, tipo: falso}
:::
