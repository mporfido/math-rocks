/**
 * Collaudo della PAGINA-STRUMENTO `kind: algebra` — lo lancia
 * `tests/test_tool_algebra_browser.py`, che assembla la pagina (come fa
 * `templates/tool.html`), la apre con una query string e legge `#esito`.
 *
 * Qui non si prova il componente (per quello c'è `collaudo-algebra.js`) ma il
 * pezzo che nella lezione non esiste: la scheda nasce da un INDIRIZZO, e
 * l'indirizzo se lo fabbrica chiunque. Le tre cose che devono reggere sono
 * quelle che in una lezione garantirebbe la build — equazione leggibile,
 * traguardo esistente, mosse esistenti — più il confine `noeditor`, che decide
 * se la pagina è del docente o della classe.
 *
 * La pagina si carica da `file:`, dove la query string arriva comunque a
 * `location.search`. Lo scenario lo dice il parametro `caso`: la stessa pagina,
 * aperta tre volte con indirizzi diversi.
 */
(function () {
  const esiti = [];
  const ok = (nome) => esiti.push('OK   ' + nome);
  const ko = (nome, dettaglio) => esiti.push('KO   ' + nome + ' -- ' + dettaglio);
  const asserisci = (c, m) => { if (!c) throw new Error(m); };

  function prova(nome, f) {
    try {
      f();
      ok(nome);
    } catch (e) {
      ko(nome, e && e.message ? e.message : String(e));
    }
  }

  const caso = new URLSearchParams(location.search).get('caso');
  const radice = document.querySelector('.tool-root');
  const lavagna = () => document.querySelector('x-algebra');
  const avvisi = () => Array.from(document.querySelectorAll('.tool-warning li'))
    .map((li) => li.textContent);

  if (caso === 'link') {
    // ?eq=<buona>&eq=<buona>&eq=<illeggibile>&forma=ax=b&mosse=<due buone;una falsa>
    prova('la scheda monta la prima equazione del link', () => {
      asserisci(lavagna(), 'nessuna lavagna in pagina');
      asserisci(lavagna().dataset.eq === '2x+3=8',
        'data-eq: ' + lavagna().dataset.eq);
    });

    prova('il traguardo del link arriva al componente', () => {
      asserisci(lavagna().dataset.traguardo === '{"forma":"ax=b"}',
        'data-traguardo: ' + lavagna().dataset.traguardo);
      asserisci(/2x = 5/.test(document.querySelector('.alg-obiettivo').textContent),
        'obiettivo scritto: ' + document.querySelector('.alg-obiettivo').textContent);
    });

    prova('le mosse del link passano ripulite dagli id inventati', () => {
      asserisci(lavagna().dataset.mosse === '["trasporto","calcola"]',
        'data-mosse: ' + lavagna().dataset.mosse);
    });

    prova('un\'equazione illeggibile non porta giù la scheda, e si dice', () => {
      const detti = avvisi().join(' | ');
      asserisci(document.querySelectorAll('x-algebra').length === 1,
        'lavagne in pagina: ' + document.querySelectorAll('x-algebra').length);
      asserisci(/2x \+\* 3/.test(detti), 'nessun avviso sull\'equazione: ' + detti);
      asserisci(/non-esiste/.test(detti), 'nessun avviso sulla mossa: ' + detti);
    });

    prova('gli esercizi buoni restano due, e si naviga', () => {
      const pallini = document.querySelectorAll('.tool-dot');
      asserisci(pallini.length === 2, 'pallini: ' + pallini.length);
      pallini[1].click();
      asserisci(lavagna().dataset.eq === '5x+4-2x=9',
        'dopo il pallino: ' + lavagna().dataset.eq);
    });

    prova('il titolo del link è quello della scheda', () => {
      const h = document.querySelector('.tool-sheet-title');
      asserisci(h && h.textContent === 'Prova', 'titolo: ' + (h && h.textContent));
    });

    prova('il costruttore c\'è, e chiuso: il link portava già una scheda', () => {
      const b = document.querySelector('.tool-builder');
      asserisci(b, 'nessun costruttore');
      asserisci(!b.open, 'il costruttore si è aperto da solo');
    });
  }

  if (caso === 'studente') {
    // ?eq=…&libera=1&noeditor=1 — la pagina che riceve la classe
    prova('con noeditor il costruttore non esiste proprio', () => {
      asserisci(!document.querySelector('.tool-builder'),
        'il costruttore è in pagina');
      asserisci(document.querySelector('.tool-sheet'), 'nessuna scheda');
    });

    prova('libera batte il traguardo dell\'istanza', () => {
      asserisci(lavagna(), 'nessuna lavagna');
      asserisci(!lavagna().dataset.traguardo,
        'traguardo di troppo: ' + lavagna().dataset.traguardo);
      asserisci(!document.querySelector('.alg-obiettivo').textContent.trim(),
        'obiettivo scritto su una lavagna libera');
    });
  }

  if (caso === 'nudo') {
    // Nessun parametro: valgono i `defaults` dell'istanza (data-defaults).
    prova('senza parametri vale la configurazione dell\'istanza', () => {
      asserisci(lavagna().dataset.eq === '2x + 3 = 8',
        'data-eq: ' + lavagna().dataset.eq);
      asserisci(lavagna().dataset.traguardo === '{"forma":"normale"}',
        'data-traguardo: ' + lavagna().dataset.traguardo);
      asserisci(!avvisi().length, 'avvisi su una pagina senza link: ' + avvisi());
    });

    prova('il costruttore si apre da sé: è la cosa da fare', () => {
      const b = document.querySelector('.tool-builder');
      asserisci(b && b.open, 'costruttore chiuso');
    });

    prova('le mosse si elencano tutte, ma solo su richiesta', () => {
      const elenco = document.querySelector('.tool-moves');
      asserisci(elenco.hidden, 'l\'elenco delle mosse è in vista senza averlo chiesto');
      asserisci(elenco.querySelectorAll('input').length
        === Object.keys(window.Algebra.CATALOGO).length,
        'caselle: ' + elenco.querySelectorAll('input').length);
      // Il quadratino "Limita le mosse" sta appena prima dell'elenco.
      const limita = elenco.previousElementSibling.querySelector('input');
      limita.checked = true;
      limita.dispatchEvent(new Event('change'));
      asserisci(!elenco.hidden, 'l\'elenco non è comparso');
      asserisci(/mosse=/.test(document.querySelector('.tool-link').value),
        'link senza le mosse: ' + document.querySelector('.tool-link').value);
      limita.checked = false;
      limita.dispatchEvent(new Event('change'));
    });

    prova('il link proposto è quello per gli studenti', () => {
      const link = document.querySelector('.tool-link').value;
      asserisci(/noeditor=1/.test(link), 'link senza noeditor: ' + link);
      asserisci(/forma=normale/.test(link), 'link senza traguardo: ' + link);
      asserisci(/eq=2x\+%2B\+3\+%3D\+8/.test(link), 'link senza equazione: ' + link);
      asserisci(!/mosse=/.test(link), 'mosse limitate senza averlo chiesto: ' + link);
    });

    prova('cambiare traguardo cambia il link, e la lettera compare', () => {
      const select = document.querySelector('.tool-builder select');
      const campo = select.closest('.tool-builder-body').querySelectorAll('.tool-field')[3];
      select.value = 'forma:normale';
      select.dispatchEvent(new Event('change'));
      asserisci(campo.hidden, 'la lettera resta chiesta a un traguardo che non la vuole');
      select.value = 'isola';
      select.dispatchEvent(new Event('change'));
      asserisci(!campo.hidden, 'il campo della lettera è restato nascosto');
      // Senza la lettera il traguardo è incompleto: niente link da condividere.
      asserisci(document.querySelector('.tool-link').value === '',
        'link dato con un traguardo incompleto');
      const input = campo.querySelector('input');
      input.value = 'y';
      input.dispatchEvent(new Event('input'));
      asserisci(/isola=y/.test(document.querySelector('.tool-link').value),
        'link: ' + document.querySelector('.tool-link').value);
    });

    prova('Prova la scheda rimonta la lavagna col traguardo nuovo', () => {
      const bottoni = document.querySelectorAll('.tool-link-row .btn');
      bottoni[bottoni.length - 1].click();
      asserisci(lavagna().dataset.traguardo === '{"isola":"y"}',
        'data-traguardo: ' + lavagna().dataset.traguardo);
    });
  }

  asserisci(radice, 'la pagina non ha la radice dello strumento');

  const pre = document.createElement('pre');
  pre.id = 'esito';
  pre.textContent = esiti.join('\n');
  document.body.appendChild(pre);
})();
