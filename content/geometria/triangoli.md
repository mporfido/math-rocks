<!-- Congruenza: i teoremi che si dimostrano con i criteri.
     Ogni blocco AGGIUNGE la dimostrazione a una voce di teoria.yaml. -->

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
