<!-- Rette parallele: quello che si guadagna con l'assioma della parallela. -->

:::theorem id=somma-angoli-triangolo modi=leggi,ordina,giustifica,completa,costruisci

## ipotesi
- $ABC$ è un triangolo

## tesi
- $A\hat{B}C + B\hat{C}A + C\hat{A}B$ è un angolo piatto

## dimostrazione
- Si tracci la retta $r$ parallela a $BC$ passante per $A$ {costruzione, da: h1, per: assioma-parallela}
- $A\hat{B}C \cong \alpha_1$, l'angolo che $r$ forma con $AB$ {da: c1, per: angoli-alterni-interni}
- $B\hat{C}A \cong \alpha_2$, l'angolo che $r$ forma con $AC$ {da: c1, per: angoli-alterni-interni}
- $\alpha_1 + C\hat{A}B + \alpha_2$ è un angolo piatto {da: c1, per: assioma-angolo-piatto}
- {t1, da: p1,p2,p3, per: sostituzione}

## distrattori
- $\alpha_1$ è congruente all'angolo a lui opposto al vertice {per: angoli-opposti-al-vertice, tipo: inutile}
- $A\hat{B}C \cong \alpha_1$ {per: angoli-opposti-al-vertice, tipo: garanzia-sbagliata}
- $\alpha_1 \cong \alpha_2$ {per: angoli-alterni-interni, tipo: falso}
:::
