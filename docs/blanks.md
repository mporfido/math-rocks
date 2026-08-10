# Blanks — caselle da completare

Doppie quadre nel testo: `[[…]]`. Sono lo strumento base per far rispondere lo
studente. Ogni blank è un **goal** dello step: finché non è corretto, i blocchi
`:::div.reveal` restano nascosti.

Quattro forme, distinte da come è scritto il contenuto fra le quadre.

## 1. Input testuale — una sola risposta

```markdown
Quanto fa 2 + 2? [[4]]
```

- Validazione case-insensitive, spazi ai bordi ignorati.
- Feedback visivo immediato (verde / rosso).

## 2. Input testuale — più risposte accettate

Doppia pipe `||`:

```markdown
Frazione semplificata: [[2/16 || 1/8]]
```

Resta un campo di testo (non bottoni), ma accetta come corretta **qualsiasi**
delle risposte elencate. Solo quelle: non c'è equivalenza numerica automatica,
quindi `0.5` non passa se hai scritto `1/2`.

## 3. Scelta multipla — bottoni

Pipe singola `|`, la risposta corretta marcata con `*`:

```markdown
Quale è il risultato? [[2|3|*4|5]]
```

Se nessuna opzione ha l'asterisco, la **prima** è considerata corretta — comodo
per un vero/falso, ma marcarla esplicitamente è più chiaro:

```markdown
Quale operazione? [[Addizione|*Moltiplicazione|Divisione]]
Vero o falso? [[*Vero|Falso]]
```

L'ordine dei bottoni è quello scritto: mescolalo tu, non viene randomizzato.

## 4. Menu a tendina inline (cloze)

Prefisso `select:` — la stessa scelta multipla, ma come `<select>` in mezzo alla
frase invece che come fila di bottoni:

```markdown
Per isolare `x` devi [[select: sommare|*sottrarre|moltiplicare]] 3 a entrambi i membri.
```

È la forma giusta per i completamenti dentro un periodo, dove i bottoni
spezzerebbero la lettura.

> ⚠️ Le opzioni di un menu a tendina sono **testo semplice**: MathJax non viene
> reso dentro un `<select>`. Per le frazioni usa la forma piana (`1/2`, non
> `$\frac12$`).

## Dove funzionano

| Contesto | Testo `[[5]]` | Scelta `[[a\|*b]]` |
| --- | :---: | :---: |
| testo normale dello step | sì | sì |
| cella di una tabella markdown a pipe | sì | **no** — le pipe verrebbero lette come divisori di cella |
| cella di una `:::table` | sì | sì |
| passo di un `:::theorem` | sì | sì |
| blocco di codice | no (letterale, per documentare la sintassi) | no |

## Limiti

- Dentro `[[…]]` **non può esserci una parentesi quadra chiusa**: niente
  `\sqrt[4]{2}` fra le opzioni. Una `]` singola è tollerata nel testo attorno,
  quindi `$\sqrt[4]{2}$` fuori dal blank va bene.
- Aggiungere un blank *prima* di quelli esistenti in uno step già pubblicato ne
  azzera i progressi salvati: gli id sono assegnati in ordine di comparsa.
- Ideale 2-4 blank per step. Otto caselle di fila diventano un modulo da
  compilare, non un esercizio.

---

**Vedi anche**: [variabili.md](variabili.md) per i valori che si muovono invece
di essere digitati · [tabelle.md](tabelle.md) per i blank nelle celle ·
[blocchi.md](blocchi.md) per il reveal che si sblocca completandoli.

**Nel corso demo**: `content/esempi/content-1.md` — step `equazioni-base`
(testo e scelta multipla) e `sfida-finale` (menu a tendina).
