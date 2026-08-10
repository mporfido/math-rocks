# Blocchi custom — `:::tag.classe`

Il blocco generico: apre un tag HTML con delle classi, lo chiude con `:::`.

```markdown
:::div.highlight
Questo è un blocco evidenziato
:::
```

Forma completa della riga di apertura:

```
:::tag.classe1.classe2(attributo="valore")
```

- Il **tag** è opzionale: senza, è un `div`. `:::details.hint` apre un
  `<details class="hint">`.
- Ogni `.nome` diventa una classe.
- Il contenuto delle parentesi è iniettato come attributi, così com'è.

I blocchi si **annidano**:

```markdown
:::div.container
  :::div.highlight
  Contenuto interno
  :::
:::
```

## Le classi che fanno qualcosa

| Classe | Effetto |
| --- | --- |
| `.highlight` | Box evidenziato: un richiamo, un'osservazione a margine |
| `.reveal` | Nascosto finché tutti i goal dello step non sono completati |
| `.syntax-doc` | (su `details`) pannello a scomparsa che documenta la sintassi — per gli autori |
| `.hint` | (su `details`) suggerimento a scomparsa — per lo studente |

Tutte le altre classi sono libere: servono a te per agganciare del CSS.

## `.reveal` — contenuto a esercizio finito

Il contenuto con classe `.reveal` appare solo quando **tutti** i goal dello step
sono completati. È il modo di chiudere uno step: la conferma, la conclusione,
l'esercizio successivo.

```markdown
> id: esercizio
> title: Esercizio

Completa: 2 + 2 = [[4]]
Completa: 3 × 3 = [[9]]

:::div.reveal
# Ottimo lavoro!

Hai completato entrambi gli esercizi. Ora puoi procedere!
:::
```

Contano come goal: i blank, le scelte multiple, i bottoni `check`, i grafici con
un `target`, i blocchi `:::expr`, gli sketch p5 con il flag `goal`, i
`:::theorem`. **Non** contano: le curve, i `boundpoints`, i calcoli live, le
`:::formula`.

## `details` — pannelli a scomparsa

Stesso meccanismo, due classi con due destinatari diversi.

**`.syntax-doc`** — documentazione vivente: mostra la sintassi di un componente
subito sotto al componente stesso. Serve agli autori che leggono il corso demo.

`````markdown
:::details.syntax-doc
<summary>📝 Mostra la sintassi</summary>

```md
Risposta: `x =` [[5]]
```

Eventuale spiegazione aggiuntiva.

:::
`````

**`.hint`** — un suggerimento rivolto allo **studente**. Ha uno stile distinto
(accento "penna rossa") proprio per non confondersi con i box di documentazione:

```markdown
:::details.hint
<summary>💡 Suggerimento</summary>

Prova a isolare `x` portando i termini noti dall'altra parte dell'uguale.

:::
```

In entrambi i casi il `<summary>` va sulla prima riga del blocco, seguito da una
riga vuota.

## Errori tipici

| Sintomo | Causa |
| --- | --- |
| Il blocco non si chiude e si mangia il resto dello step | Manca un `:::`, o ne manca uno in un blocco annidato |
| Il `.reveal` non appare mai | Un goal dello step non è completabile (controlla i blank e i grafici) |
| Il `.reveal` è visibile subito | Lo step non ha nessun goal: senza obiettivi, non c'è niente da attendere |
| Il `<summary>` compare come testo | Manca la riga vuota dopo di esso |

---

**Vedi anche**: [blanks.md](blanks.md) e [variabili.md](variabili.md) per gli
elementi che generano i goal · [struttura.md](struttura.md) per gli step.

**Nel corso demo**: presenti in quasi ogni step; `.hint` e i blocchi annidati in
`content/esempi/content-7.md` — step `media-e-suggerimenti`.
