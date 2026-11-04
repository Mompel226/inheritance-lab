/* ============================================================
   views/pedigree.js — station 11's picture: a family over three generations (js/inh-scenes.js FAM), drawn at the
   column's own pixel width, so each person's number is always as large as the page's words (new-lab.md §7: words inside
   a scaled drawing shrink with it). Press a person and their card opens; open a card and its persons are ringed.
   The key (male, female, shaded) is HTML under the drawing.
   spec: { kind: 'pedigree', parts: ['p1', …], key: [[swatch class, words], …], say }
   ============================================================ */
(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function make(spec, ctx) {
    var Sc = global.LabScenes, FAM = Sc.FAM;
    var root = h('div', 'pdv');
    var stage = h('div', 'pdv__stage'); root.appendChild(stage);
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'pdv__svg'); svg.setAttribute('role', 'group');
    svg.setAttribute('aria-label', 'A pedigree diagram of eight persons in three generations');
    stage.appendChild(svg);
    var key = h('ul', 'figkey');
    key.innerHTML = (spec.key || []).map(function (q) { return '<li><i class="figkey__sw ' + q[0] + '" aria-hidden="true"></i>' + q[1] + '</li>'; }).join('');
    root.appendChild(key);
    var lit = {};
    function draw() {
      var r = stage.getBoundingClientRect(), W = Math.max(260, r.width || 520);
      var s = W / 340, Hh = 260 * s;
      svg.setAttribute('viewBox', '0 0 340 260'); svg.setAttribute('width', W); svg.setAttribute('height', Hh);
      var out = Sc.pedigree(null).svg;
      /* the numbers at 15 px on screen, whatever the scale */
      out = out.replace(/<text class="pd__n"([^>]*)>/g, '<text class="pd__n"$1 font-size="' + (15 / s).toFixed(1) + '">');
      FAM.forEach(function (p) { if (lit['p' + p.n]) out = '<circle class="pd__lit" cx="' + p.x + '" cy="' + p.y + '" r="22"/>' + out; });
      svg.innerHTML = out;
      /* each person a button, over its symbol */
      FAM.forEach(function (p) {
        var g = document.createElementNS(NS, 'circle');
        g.setAttribute('cx', p.x); g.setAttribute('cy', p.y); g.setAttribute('r', 20); g.setAttribute('class', 'pd__hit');
        g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
        g.setAttribute('aria-label', 'Person ' + p.n + ': ' + (p.sex === 'm' ? 'male' : 'female') + ', ' + (p.has ? 'dry earwax' : 'wet earwax'));
        function go() { ctx.pick('p' + p.n); }
        g.addEventListener('click', go);
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        svg.appendChild(g);
      });
    }
    if (global.ResizeObserver) new global.ResizeObserver(draw).observe(stage);
    draw();
    var api = {
      el: root, say: spec.say || '', credit: '',
      labels: (function () { var o = {}; (spec.parts || []).forEach(function (p) { o[p] = 'person ' + p.slice(1); }); return o; })(),
      focus: function (part) {
        lit = {};
        [].concat(part || []).forEach(function (x) { lit[x] = 1; });
        draw();
      },
      stop: function () {}
    };
    return api;
  }
  global.Views.add('pedigree', make);
})(window);
