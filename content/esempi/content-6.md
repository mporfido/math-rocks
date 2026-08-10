> id: dimostrazioni
> title: Dimostrazioni interattive
> description: Il blocco :::theorem — leggere, riordinare e giustificare una dimostrazione, con la figura agganciata ai passi.

---

> id: teorema-leggi
> title: Leggere una dimostrazione

# Una dimostrazione non è un testo

È una **catena**: ogni passo dichiara da quali passi precedenti discende (`da`)
e quale regola autorizza il salto (`per`). Il blocco `:::theorem` tiene insieme
le due cose, e la figura si illumina seguendo il passo su cui sei.

Passa sopra un passo, e guarda la figura.

:::theorem id=supplementari-di-congruenti modi=leggi
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
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

````md
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
:::
````

Lo **statuto** di ogni passo viene dalla sezione in cui è scritto: `## ipotesi`,
`## tesi`, `## dimostrazione`. Gli id sono impliciti e assegnati per posizione:
`h1, h2, …` per le ipotesi, `t1, …` per le tesi, `p1, p2, …` per i passi
dedotti, `c1, …` per le costruzioni.

Nelle graffe: `da:` le premesse, `per:` la garanzia (un id della *teoria del
corso*, in `content/esempi/teoria.yaml`), `fig:` l'elemento della figura da
evidenziare.

L'ultimo passo **non riscrive la tesi, la referenzia**: `{t1, da: p4, per: …}`.
Così la dimostrazione ha un nodo terminale verificabile, ed è completa quando
ogni passo di statuto `tesi` è raggiunto.

📖 Riferimento: `DIMOSTRAZIONI.md`

:::

:::div.highlight
💡 Il ponte con la figura funziona nei **due sensi**: puoi partire dal passo e
vedere la figura, o partire da un elemento della figura e trovare il passo che
lo nomina.
:::

---

> id: teorema-ordina
> title: Riordinare e giustificare

# Le modalità sono maschere sullo stesso dato

Lo stesso teorema, scritto una volta sola, diventa esercizi diversi a seconda di
cosa si nasconde: l'ordine dei passi (`ordina`), le garanzie (`giustifica`),
alcuni passi interi (`completa`).

Qui trovi il selettore delle modalità sopra la dimostrazione. Prova
**ordina**: i cartellini vanno messi in fila, e fra loro ci sono dei
**distrattori** che non servono.

:::theorem id=angoli-opposti-al-vertice modi=leggi,ordina,giustifica,completa
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

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

````md
:::theorem id=angoli-opposti-al-vertice modi=leggi,ordina,giustifica,completa
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
````

`modi=` elenca le maschere disponibili; `mancanti=2` regola quanti passi
nasconde `completa`.

Il flag **`costruzione`** è l'unico statuto che non viene dalla sezione. Una
dimostrazione non deduce soltanto: a un certo punto **traccia** (la bisettrice,
la parallela, l'angolo ausiliario). Quel gesto non è un'ipotesi — non è dato con
l'enunciato — e non è una deduzione — non asserisce nulla di vero o falso.

I **distrattori** hanno un `tipo` dichiarato, perché il feedback sia mirato:

| `tipo` | Significato |
| --- | --- |
| `inutile` | Vero, ma non avvicina alla tesi |
| `garanzia-sbagliata` | Conclusione giusta, regola invocata sbagliata |
| `falso` | Asserzione non vera |

Il secondo è il più formativo: costringe a distinguere *un argomento valido* da
*uno che sembra valido perché la conclusione è giusta*.

📖 Riferimento: `DIMOSTRAZIONI.md` · `TEORIA.md` per il corpus a pagina intera

:::

:::div.reveal
La correzione è **topologica**, non testuale: conta che ogni passo abbia le sue
premesse già disponibili e che la tesi sia raggiunta, non che l'ordine coincida
con quello scritto dall'autore. Se esiste un altro ordine valido, è accettato.
:::

---

> id: teorema-figura
> title: La figura è un componente

# Lo stesso sketch, da solo

La figura agganciata a una dimostrazione è uno **sketch p5 riusabile**: vive in
`static/sketches/<nome>.js` e si può usare anche da sola, fuori da un teorema.

:::p5 sketch=geometria-angoli-opposti-al-vertice height=300
:::

:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
:::p5 sketch=geometria-angoli-opposti-al-vertice height=300
:::
```

`sketch=nome` richiama `window.P5Sketches['nome']`; il corpo del blocco resta
vuoto. Il file è caricato al volo solo nelle pagine che lo usano.

Dentro un `:::theorem` lo stesso sketch riceve, dal componente, quale elemento
evidenziare: è il campo `fig:` dei passi. Il contratto è
`ctx.evidenzia(id)` / `ctx.evidenziato(id)` / `ctx.onHighlight(cb)`.

📖 Riferimento: `docs/p5.md` · `DIMOSTRAZIONI.md` §5

:::

Una figura senza il flag `goal` è pura visualizzazione: non blocca lo step.
Quanti angoli si formano quando due rette si incontrano? [[4]]

:::div.reveal
Quattro angoli, a due a due opposti al vertice e a due a due adiacenti. Il
teorema che hai riordinato dice che le due coppie di opposti sono congruenti.
:::
