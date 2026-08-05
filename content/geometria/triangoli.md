<!-- Congruenza: i teoremi che si dimostrano con i criteri.
     Ogni blocco AGGIUNGE la dimostrazione a una voce di teoria.yaml. -->

:::theorem id=triangolo-isoscele-angoli-base modi=leggi,ordina,giustifica,completa,costruisci
figura: geometria-triangolo-isoscele

## ipotesi
- Il triangolo $ABC$ è isoscele sulla base $BC$ {fig: triangolo}

## tesi
- $A\hat{B}C \cong A\hat{C}B$ {fig: angoli-base}

## dimostrazione
- Si tracci la bisettrice $AH$ dell'angolo $B\hat{A}C$, con $H$ sulla base {costruzione, da: h1, fig: bisettrice}
- $AB \cong AC$ {da: h1, per: definizione-isoscele, fig: lati-obliqui}
- $B\hat{A}H \cong H\hat{A}C$ {da: c1, per: definizione-bisettrice, fig: angoli-al-vertice}
- $AH \cong AH$ {da: c1, per: proprieta-riflessiva, fig: lato-comune}
- Il triangolo $ABH \cong$ il triangolo $ACH$ {da: p1,p2,p3, per: primo-criterio, fig: triangoli}
- {t1, da: p4, per: elementi-corrispondenti, fig: angoli-base}

## distrattori
- $BH \cong HC$ {per: elementi-corrispondenti, tipo: inutile}
- Il triangolo $ABH \cong$ il triangolo $ACH$ {per: terzo-criterio, tipo: garanzia-sbagliata}
- $AB \cong BC$ {per: definizione-isoscele, tipo: falso}
:::

<!-- L'inverso, nella dimostrazione classica: due bisettrici e il secondo
     criterio applicato due volte. È più lunga della diretta perché non può
     usare la simmetria del triangolo — quella è ciò che deve concludere. -->
:::theorem id=triangolo-due-angoli-congruenti modi=leggi,ordina,giustifica,completa,costruisci
figura: geometria-inverso-isoscele

## ipotesi
- Nel triangolo $ABC$ gli angoli $A\hat{B}C$ e $A\hat{C}B$ sono congruenti {fig: angoli-base}

## tesi
- $AB \cong AC$: il triangolo è isoscele sulla base $BC$ {fig: lati-obliqui}

## dimostrazione
- Si tracci la bisettrice $BD$ dell'angolo $A\hat{B}C$, con $D$ su $AC$ {costruzione, da: h1, fig: bisettrice-b}
- Si tracci la bisettrice $CE$ dell'angolo $A\hat{C}B$, con $E$ su $AB$ {costruzione, da: h1, fig: bisettrice-c}
- $D\hat{B}C \cong E\hat{C}B$ {da: h1,c1,c2, per: meta-congruenti, fig: mezzi-angoli}
- $BC \cong CB$ {da: h1, per: proprieta-riflessiva, fig: lato-comune}
- Il triangolo $BCD \cong$ il triangolo $CBE$ {da: p2,p1,h1, per: secondo-criterio, fig: triangoli-uno}
- $BD \cong CE$ {da: p3, per: elementi-corrispondenti, fig: bisettrici-congruenti}
- $B\hat{D}C \cong C\hat{E}B$ {da: p3, per: elementi-corrispondenti, fig: angoli-piede}
- $A\hat{D}B \cong A\hat{E}C$ {da: c1,c2,p5, per: supplementari-di-congruenti, fig: angoli-supplementari}
- Il triangolo $ABD \cong$ il triangolo $ACE$ {da: p4,p1,p6, per: secondo-criterio, fig: triangoli-due}
- {t1, da: p7, per: elementi-corrispondenti, fig: lati-obliqui}

## distrattori
- $AD \cong AE$ {per: elementi-corrispondenti, tipo: inutile}
- Il triangolo $BCD \cong$ il triangolo $CBE$ {per: primo-criterio, tipo: garanzia-sbagliata}
- $BD \cong BC$ {per: definizione-bisettrice, tipo: falso}
:::
