# Ricette — una lezione da cui partire

Uno scheletro completo, le abitudini che funzionano, e cosa guardare quando
qualcosa non va.

## Una lezione completa

`content/algebra-base/content-1.md`:

````markdown
> id: equazioni
> title: Le equazioni di primo grado
> description: Dalla bilancia in equilibrio alla soluzione.

---

> id: intro
> title: Introduzione

# Benvenuto all'Algebra

L'algebra usa lettere per rappresentare numeri.

Primo esercizio: `x + 3 = 7`, quindi `x =` [[4]]

:::div.reveal
Perfetto. Hai capito il concetto base: quello che togli da una parte, lo togli
anche dall'altra.
:::

---

> id: risolvere
> title: Risolvere equazioni

# Un'equazione è una bilancia

Per isolare `x` devi [[select: sommare|*sottrarre|moltiplicare]] 3 a entrambi i
membri.

## Esercizio 1

Risolvi `2x = 8`: `x =` [[4]]

## Esercizio 2

Risolvi `3y + 5 = 14`: `y =` [[3]]

:::details.hint
<summary>💡 Suggerimento</summary>

Porta prima il termine noto dall'altra parte, poi dividi.

:::

:::div.reveal
Eccellente. Ora vediamo cosa succede quando i coefficienti si muovono.
:::

---

> id: esplorare
> title: Esplorare con gli slider

# La pendenza di una retta

Modifica il valore di `m`: ${m}{m|1|-3,3,0.5}

L'equazione della retta è `y = ${m}x + 2`.

:::graph
expr: "m * x + 2"
bind: m
xrange: "-6,6"
yrange: "-6,6"
:::

:::div.highlight
💡 Osserva come cambia l'inclinazione al variare di `m`. Per `m` negativo la
retta scende.
:::

Porta la retta a pendenza 2: [Verifica]{check: m == 2}

:::div.reveal
# 🎉 Lezione completata

**Prossimi passi:** le equazioni di secondo grado.
:::
````

Poi `content/algebra-base/metadata.yaml`:

```yaml
title: Algebra di base
description: Equazioni di primo grado, dalla bilancia al piano cartesiano.
level: beginner
progression: sequential
```

E infine `python build_courses.py`.

## Abitudini che funzionano

**Goal bilanciati.** Da due a quattro per step. Otto caselle di fila diventano
un modulo da compilare, non un esercizio.

```markdown
<!-- ✓ -->  Esercizio 1: [[risposta1]]
            Esercizio 2: [[risposta2]]
<!-- ✗ -->  [[a]] [[b]] [[c]] [[d]] [[e]] [[f]] [[g]] [[h]]
```

**Il `.reveal` chiude lo step.** Non è un premio: è il posto dove dici *perché*
la risposta era quella, o dove lanci il passo successivo.

**Slider con range sensati.** Uno slider si esplora muovendolo: se servono
duecento scatti per attraversarlo, nessuno lo attraverserà.

```markdown
<!-- ✓ -->  Probabilità: ${p}{p|0.5|0,1,0.1}
<!-- ✗ -->  Numero: ${n}{n|0|-1000000,1000000,0.00001}
```

**Metadata parlanti.** `id` e `title` finiscono nell'URL e nella sidebar:
`> id: introduzione-algebra` si legge, `> id: step1` no.

**Documenta la sintassi accanto al componente.** Nei corsi dimostrativi, un
`:::details.syntax-doc` sotto ogni componente vale più di una pagina di
riferimento: vedi [blocchi.md](blocchi.md).

**Cambia gli id solo se necessario.** I progressi salvati nel browser sono
indicizzati per id di step e di elemento: rinominare uno step pubblicato azzera
i progressi di chi lo stava facendo.

## Troubleshooting

| Sintomo | Da guardare |
| --- | --- |
| Uno step non compare | `id` mancante, o `---` non isolato da righe vuote ([struttura.md](struttura.md)) |
| Il `.reveal` non appare mai | Un goal dello step non è completabile: controlla blank, grafici con `target`, sketch con `goal` |
| Il `.reveal` è visibile subito | Lo step non ha nessun goal |
| Una formula resta testo grezzo | Sintassi LaTeX ([matematica.md](matematica.md)) |
| `${= …}` mostra sempre `□` | Manca `> use-mathjs: true`, o una variabile è vuota |
| Una scelta multipla si spezza in colonne | È dentro una tabella markdown: serve `:::table` ([tabelle.md](tabelle.md)) |
| La build si ferma su un blocco | I blocchi `:::table`, `:::formula`, `:::theorem` validano in build e indicano la riga: leggi il messaggio, dice quale regola è saltata |
| Il corso non si aggiorna nel browser | `python build_courses.py`; in sviluppo la ricompilazione è automatica salvo `AUTO_REBUILD=0` |
| I progressi si sono azzerati | È cambiato un id: di step, o di un elemento interattivo che ne precede altri |

## Riferimenti esterni

- [MathJax](https://docs.mathjax.org/)
- [Markdown Guide](https://www.markdownguide.org/)
- [p5.js](https://p5js.org/reference/)
- [JSXGraph](https://jsxgraph.org/docs/) (motore dei grafici)

---

**Vedi anche**: l'[indice](README.md) per il riferimento di ogni singolo
costrutto.

**Nel corso demo**: `content/esempi/` per intero — sette lezioni, una per
famiglia di componenti.
