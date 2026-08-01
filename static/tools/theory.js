/**
 * Strumento `theory` — la teoria di un corpus come mappa (vedi TEORIA.md).
 *
 * Un file per *tipo* di strumento, come per `expr`: lo stesso script serve le
 * due pagine del corpus e riconosce dal DOM su quale si trova.
 *
 *   /tools/<id>/            la mappa: griglia livello × area, archi al volo
 *   /tools/<id>/<teorema>/  la dimostrazione, configurata dalla query string
 *
 * Sulla pagina di un teorema lo script va caricato PRIMA dei componenti:
 * <x-theorem> legge i suoi attributi una volta sola quando si registra, e i
 * parametri dell'URL devono essere già lì.
 */
(function () {
  'use strict';

  // ==========================================================================
  // Pagina di un teorema: il path dice quale, la query string come
  // ==========================================================================

  /**
   * Applica `modi` e `distrattori` dell'URL a <x-theorem>.
   *
   * Precedenza (TEORIA.md §5.3): default della modalità → attributo del blocco
   * → parametro URL. Chi ha in mano il link è il docente, e vince.
   */
  function configuraTeorema() {
    const teorema = document.querySelector('.teorema-corpo x-theorem');
    if (!teorema) return;

    const params = new URLSearchParams(window.location.search);

    const modi = params.get('modi');
    if (modi) teorema.dataset.modi = modi;

    // `distrattori` è un numero: quanti mostrarne, non se mostrarli. Con 2-3
    // scritti dall'autore, `distrattori=1` è una difficoltà intermedia vera.
    const distrattori = params.get('distrattori');
    if (distrattori !== null && distrattori.trim() !== '') {
      const n = parseInt(distrattori, 10);
      if (Number.isFinite(n)) teorema.dataset.distrattoriN = String(Math.max(0, n));
    }
  }

  // ==========================================================================
  // Mappa: gli archi
  // ==========================================================================

  const RUOLI = { fuoco: 'fuoco', premessa: 'premessa', discende: 'discende' };

  /** Centro-alto e centro-basso di una card, in coordinate dell'overlay SVG. */
  function ancoraggi(card, origine) {
    const r = card.getBoundingClientRect();
    const o = origine.getBoundingClientRect();
    return {
      alto: { x: r.left - o.left + r.width / 2, y: r.top - o.top },
      basso: { x: r.left - o.left + r.width / 2, y: r.bottom - o.top },
    };
  }

  function creaMappa(mappa) {
    const svg = mappa.querySelector('[data-archi]');
    const cards = Array.from(mappa.querySelectorAll('.mappa-card'));
    if (!svg || !cards.length) return;

    const perId = {};
    cards.forEach(c => { perId[c.dataset.teorema] = c; });

    const archi = [];
    cards.forEach(card => {
      const usa = (card.dataset.usa || '').split(' ').filter(Boolean);
      usa.forEach(id => {
        if (perId[id]) archi.push({ da: perId[id], a: card, daId: id, aId: card.dataset.teorema });
      });
    });

    let selezionata = null;

    /**
     * Disegna tutti gli archi. A riposo sono tenui: con un arco per ogni
     * garanzia, accenderli tutti renderebbe la mappa un groviglio. Quando una
     * card è accesa si vede solo il suo cono — le premesse a monte, quello che
     * ne discende a valle — e il resto arretra.
     */
    function disegna() {
      const box = mappa.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      svg.setAttribute('width', box.width);
      svg.setAttribute('height', box.height);

      svg.innerHTML = archi.map(arco => {
        const da = ancoraggi(arco.da, mappa).basso;
        const a = ancoraggi(arco.a, mappa).alto;
        // Curva di Bézier verticale: le linee spezzate su griglia sparsa si
        // confondono con i bordi delle card.
        const dy = Math.max(24, (a.y - da.y) / 2);
        const d = `M ${da.x} ${da.y} C ${da.x} ${da.y + dy}, ${a.x} ${a.y - dy}, ${a.x} ${a.y}`;

        let classe = 'mappa-arco';
        if (selezionata) {
          if (arco.aId === selezionata) classe += ' mappa-arco--premessa';
          else if (arco.daId === selezionata) classe += ' mappa-arco--discende';
          else classe += ' mappa-arco--spento';
        }
        return `<path class="${classe}" d="${d}" />`;
      }).join('');
    }

    /**
     * Accende il cono di una card. I ruoli sono gli stessi della catena di una
     * dimostrazione (`fuoco`, `premessa`): testo e mappa dicono la stessa cosa
     * a due scale diverse.
     */
    function accendi(id) {
      selezionata = id;
      const premesse = new Set();
      const discendenti = new Set();
      if (id) {
        archi.forEach(a => {
          if (a.aId === id) premesse.add(a.daId);
          if (a.daId === id) discendenti.add(a.aId);
        });
      }

      cards.forEach(card => {
        const t = card.dataset.teorema;
        card.classList.toggle('mappa-card--' + RUOLI.fuoco, !!id && t === id);
        card.classList.toggle('mappa-card--' + RUOLI.premessa, premesse.has(t));
        card.classList.toggle('mappa-card--' + RUOLI.discende, discendenti.has(t));
        card.classList.toggle('mappa-card--spenta',
          !!id && t !== id && !premesse.has(t) && !discendenti.has(t));
      });

      mappa.classList.toggle('mappa--accesa', !!id);
      disegna();
    }

    cards.forEach(card => {
      const id = card.dataset.teorema;
      // Su desktop basta passarci sopra; il focus da tastiera fa lo stesso,
      // così il cono non è un'informazione riservata al mouse.
      card.addEventListener('mouseenter', () => accendi(id));
      card.addEventListener('focus', () => accendi(id));
      card.addEventListener('mouseleave', () => accendi(null));
      card.addEventListener('blur', () => accendi(null));
    });

    // Su touch l'hover non esiste e il primo tap seguirebbe il link: il primo
    // tap accende, il secondo apre. È la stessa regola sticky della catena.
    if (window.matchMedia('(hover: none)').matches) {
      cards.forEach(card => {
        card.addEventListener('click', e => {
          const id = card.dataset.teorema;
          if (selezionata !== id) {
            e.preventDefault();
            accendi(id);
          }
        });
      });
      mappa.addEventListener('click', e => {
        if (!e.target.closest('.mappa-card')) accendi(null);
      });
    }

    disegna();
    window.addEventListener('resize', disegna);
    // Le card cambiano altezza quando i font finiscono di caricare: senza
    // questo gli archi restano appesi dove le card erano prima.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(disegna);
  }

  // ==========================================================================

  configuraTeorema();

  const mappa = document.querySelector('[data-mappa]');
  if (mappa) creaMappa(mappa);
})();
