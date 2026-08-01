<!-- Angoli: i teoremi che vengono prima dei criteri, e che servono a tutto il
     resto. Si dimostrano con i soli assiomi e le definizioni.
     Ogni blocco AGGIUNGE la dimostrazione a una voce di teoria.yaml. -->

:::theorem id=supplementari-di-congruenti modi=leggi,ordina,giustifica,completa,costruisci
figura: geometria-angoli-supplementari

## ipotesi
- $\alpha \cong \beta$ {fig: congruenti}
- $\alpha'$ è supplementare di $\alpha$ {fig: alfa-primo}
- $\beta'$ è supplementare di $\beta$ {fig: beta-primo}

## tesi
- $\alpha' \cong \beta'$ {fig: tesi}

## dimostrazione
- $\alpha + \alpha'$ è un angolo piatto {da: h2, per: definizione-angoli-supplementari, fig: piatto-1}
- $\beta + \beta'$ è un angolo piatto {da: h3, per: definizione-angoli-supplementari, fig: piatto-2}
- $\alpha + \alpha' \cong \beta + \beta'$ {da: p1,p2, per: proprieta-transitiva, fig: piatti}
- $\beta + \alpha' \cong \beta + \beta'$ {da: p3,h1, per: sostituzione}
- {t1, da: p4, per: differenze-congruenti}

## distrattori
- $\alpha' \cong \alpha'$ {per: proprieta-riflessiva, tipo: inutile}
- $\alpha + \alpha' \cong \beta + \alpha'$ {per: proprieta-transitiva, tipo: garanzia-sbagliata}
- $\alpha' \cong \alpha$ {per: definizione-angoli-supplementari, tipo: falso}
:::


:::theorem id=angoli-opposti-al-vertice modi=leggi,ordina,giustifica,completa,costruisci
figura: geometria-angoli-opposti-al-vertice

## ipotesi
- $\alpha$ e $\beta$ sono angoli opposti al vertice {fig: opposti}

## tesi
- $\alpha \cong \beta$ {fig: tesi}

## dimostrazione
- I lati di $\alpha$ sono i prolungamenti dei lati di $\beta$ {da: h1, per: definizione-angoli-opposti-al-vertice, fig: prolungamenti}
- Sia $\gamma$ l'angolo adiacente sia ad $\alpha$ sia a $\beta$ {costruzione, da: p1, fig: gamma}
- $\alpha + \gamma$ è un angolo piatto {da: p1,c1, per: assioma-angolo-piatto, fig: piatto-alfa-gamma}
- $\beta + \gamma$ è un angolo piatto {da: p1,c1, per: assioma-angolo-piatto, fig: piatto-beta-gamma}
- $\alpha + \gamma \cong \beta + \gamma$ {da: p2,p3, per: proprieta-transitiva, fig: piatti}
- {t1, da: p4, per: differenze-congruenti}

## distrattori
- $\gamma \cong \gamma$ {per: proprieta-riflessiva, tipo: inutile}
- $\alpha$ e il quarto angolo $\delta$ formano un angolo piatto {per: definizione-angoli-opposti-al-vertice, tipo: garanzia-sbagliata}
- $\alpha \cong \gamma$ {per: definizione-angoli-supplementari, tipo: falso}
:::
