/**
 * Compatibilita' con i browser datati delle LIM.
 *
 * Le lavagne della scuola montano Chrome 81 (aprile 2020, Android 9): il sito
 * gira, ma tre cose arrivate dopo mancano. Questo file le colma PRIMA che
 * qualunque altro script parta, quindi va caricato nel <head> di base.html,
 * sincrono e per primo.
 *
 * Tutto qui dentro e' scritto in ES5: se il browser non capisse la sintassi di
 * questo file, il file che cura l'incompatibilita' sarebbe la prima vittima.
 *
 * I polyfill si installano solo se la cosa manca davvero: su un browser
 * aggiornato questo file non fa niente.
 */
(function () {
  'use strict';

  // --- 1. CanvasRenderingContext2D.roundRect (nativo da Chrome 99) ----------
  //
  // p5 >= 1.11 disegna ogni rect() con raggio chiamando direttamente
  // ctx.roundRect(). Dove manca, la chiamata lancia e l'eccezione interrompe
  // draw() a meta': sullo schermo resta solo quello che era gia' stato
  // disegnato — di norma lo sfondo e la cornice — e lo sketch sembra morto.
  // Riguarda 17 sketch su 37, fra cui la bilancia delle equazioni.
  //
  // p5 chiama sempre la forma con l'array di quattro raggi, gia' clampati;
  // gestiamo comunque tutte le forme previste dalla specifica.
  var C2D = (typeof CanvasRenderingContext2D !== 'undefined')
    && CanvasRenderingContext2D.prototype;
  if (C2D && !C2D.roundRect) {
    C2D.roundRect = function (x, y, w, h, r) {
      var radii = (r === undefined) ? [0] : (Object.prototype.toString.call(r) === '[object Array]' ? r : [r]);
      if (radii.length === 1) radii = [radii[0], radii[0], radii[0], radii[0]];
      else if (radii.length === 2) radii = [radii[0], radii[1], radii[0], radii[1]];
      else if (radii.length === 3) radii = [radii[0], radii[1], radii[2], radii[1]];
      radii = [0, 1, 2, 3].map(function (i) {
        var v = radii[i];
        // La specifica ammette anche {x, y}: teniamo il lato piu' piccolo.
        if (v && typeof v === 'object') v = Math.min(Number(v.x) || 0, Number(v.y) || 0);
        v = Number(v);
        return (isFinite(v) && v > 0) ? v : 0;
      });

      // Larghezza o altezza negative: il rettangolo si disegna dall'altro
      // verso e i raggi seguono lo specchio.
      if (w < 0) { x += w; w = -w; radii = [radii[1], radii[0], radii[3], radii[2]]; }
      if (h < 0) { y += h; h = -h; radii = [radii[3], radii[2], radii[1], radii[0]]; }

      // Nessun raggio puo' superare meta' del lato piu' corto.
      var max = Math.min(w / 2, h / 2);
      var tl = Math.min(radii[0], max), tr = Math.min(radii[1], max);
      var br = Math.min(radii[2], max), bl = Math.min(radii[3], max);

      this.moveTo(x + tl, y);
      this.lineTo(x + w - tr, y);
      if (tr) this.arcTo(x + w, y, x + w, y + tr, tr);
      this.lineTo(x + w, y + h - br);
      if (br) this.arcTo(x + w, y + h, x + w - br, y + h, br);
      this.lineTo(x + bl, y + h);
      if (bl) this.arcTo(x, y + h, x, y + h - bl, bl);
      this.lineTo(x, y + tl);
      if (tl) this.arcTo(x, y, x + tl, y, tl);
      this.closePath();
    };
  }

  // --- 2. Element.replaceChildren (nativo da Chrome 86) ---------------------
  //
  // Usata da <x-expr> e <x-algebra> per mostrare il messaggio "espressione non
  // valida". Senza, un'espressione sbagliata nel markdown produce un errore
  // molto piu' rumoroso di quello che voleva segnalare.
  ['Document', 'DocumentFragment', 'Element'].forEach(function (nome) {
    var proto = window[nome] && window[nome].prototype;
    if (!proto || proto.replaceChildren) return;
    proto.replaceChildren = function () {
      while (this.firstChild) this.removeChild(this.firstChild);
      for (var i = 0; i < arguments.length; i++) {
        var nodo = arguments[i];
        this.appendChild(typeof nodo === 'string' ? document.createTextNode(nodo) : nodo);
      }
    };
  });

  // --- 3. gap dentro flexbox (nativo da Chrome 84) --------------------------
  //
  // In Chrome 81 `gap` vale per grid ma viene ignorato nei contenitori flex:
  // bottoni, voci di menu e righe di controlli si appiccicano. Non si puo'
  // distinguere il caso con @supports (per grid `gap` risulta supportato),
  // quindi lo misuriamo: due figli alti zero in un flex column con gap 1px
  // danno altezza 1 se il gap funziona, 0 se no.
  //
  // L'esito diventa la classe `senza-flex-gap` su <html>, su cui compat.css
  // appende i margini di ripiego.
  function flexGapSupportato() {
    try {
      var f = document.createElement('div');
      f.style.cssText = 'display:flex;flex-direction:column;row-gap:1px;'
        + 'position:absolute;visibility:hidden';
      f.appendChild(document.createElement('div'));
      f.appendChild(document.createElement('div'));
      document.body.appendChild(f);
      var ok = f.scrollHeight === 1;
      f.parentNode.removeChild(f);
      return ok;
    } catch (e) {
      // Nel dubbio diamo per buono il browser: i margini di ripiego su un
      // browser che ha gia' il gap raddoppierebbero le spaziature.
      return true;
    }
  }

  // Serve <body>: se lo script gira nel <head> aspettiamo il DOM.
  function marcaFlexGap() {
    if (!flexGapSupportato()) {
      document.documentElement.className += ' senza-flex-gap';
    }
  }
  if (document.body) marcaFlexGap();
  else document.addEventListener('DOMContentLoaded', marcaFlexGap);
})();
