<!-- Quadrilateri: qui la teoria comincia a poggiare su se stessa — il teorema
     sulle diagonali usa quello sui lati opposti, che è dimostrato qui sopra. -->

:::theorem id=lati-opposti-parallelogramma modi=leggi,ordina,giustifica,completa,costruisci

## ipotesi
- $ABCD$ è un parallelogramma
- $AC$ è una sua diagonale

## tesi
- $AB \cong CD$ e $BC \cong AD$

## dimostrazione
- $AB$ è parallelo a $DC$, e $BC$ è parallelo a $AD$ {da: h1, per: definizione-parallelogramma}
- $B\hat{A}C \cong A\hat{C}D$ {da: p1, per: angoli-alterni-interni}
- $B\hat{C}A \cong C\hat{A}D$ {da: p1, per: angoli-alterni-interni}
- $AC \cong AC$ {per: proprieta-riflessiva}
- Il triangolo $ABC \cong$ il triangolo $CDA$ {da: p2,p3,p4, per: secondo-criterio}
- {t1, da: p5, per: elementi-corrispondenti}

## distrattori
- La diagonale $AC$ divide il quadrilatero in due triangoli {per: definizione-parallelogramma, tipo: inutile}
- Il triangolo $ABC \cong$ il triangolo $CDA$ {per: primo-criterio, tipo: garanzia-sbagliata}
- $AC \cong BD$ {per: diagonali-rettangolo, tipo: falso}
:::

:::theorem id=diagonali-parallelogramma modi=leggi,ordina,giustifica,completa,costruisci mancanti=2
figura: geometria-diagonali-parallelogramma

## ipotesi
- $ABCD$ è un parallelogramma {fig: quadrilatero}
- Le diagonali $AC$ e $BD$ si incontrano in $M$ {fig: diagonali}

## tesi
- $AM \cong MC$ e $BM \cong MD$ {fig: meta}

## dimostrazione
- $AB$ è parallelo a $DC$ {da: h1, per: definizione-parallelogramma, fig: lati-opposti}
- $AB \cong DC$ {da: h1, per: lati-opposti-parallelogramma, fig: lati-opposti}
- L'angolo $B\hat{A}M \cong$ l'angolo $D\hat{C}M$ {da: p1, per: angoli-alterni-interni, fig: angoli-alterni-1}
- L'angolo $A\hat{B}M \cong$ l'angolo $C\hat{D}M$ {da: p1, per: angoli-alterni-interni, fig: angoli-alterni-2}
- Il triangolo $ABM \cong$ il triangolo $CDM$ {da: p2,p3,p4, per: secondo-criterio, fig: triangoli}
- {t1, da: p5, per: elementi-corrispondenti}

## distrattori
- L'angolo $B\hat{A}D \cong$ l'angolo $B\hat{C}D$ {per: angoli-opposti-parallelogramma, tipo: inutile}
- Il triangolo $ABM \cong$ il triangolo $CDM$ {per: primo-criterio, tipo: garanzia-sbagliata}
- $AC \cong BD$ {per: diagonali-rettangolo, tipo: falso}
:::

:::theorem id=diagonali-rombo modi=leggi,giustifica

## ipotesi
- $ABCD$ è un rombo
- Le diagonali $AC$ e $BD$ si incontrano in $M$

## tesi
- $AM \cong MC$ e $BM \cong MD$

## dimostrazione
- $ABCD$ è un parallelogramma {da: h1, per: rombo-e-parallelogramma}
- {t1, da: p1,h2, per: diagonali-parallelogramma}

## distrattori
- Le diagonali $AC$ e $BD$ sono perpendicolari {per: definizione-rombo, tipo: inutile}
- $ABCD$ è un parallelogramma {per: definizione-parallelogramma, tipo: garanzia-sbagliata}
- $AC \cong BD$ {per: diagonali-rettangolo, tipo: falso}
:::
