/* ============================================================
   views/pedigree.js — station 11's picture: a family over three generations (js/inh-scenes.js FAM), drawn at the
   column's own pixel width, so each person's number is always as large as the page's words (new-lab.md §7: words inside
   a scaled drawing shrink with it). Press a person and their card opens; open a card and every person it names is ringed.
   The drawing works the family out with the reader (Daniel, 28 Nov 2026: the station was "very hard to follow … the
   structure of the text is a bit too dense"): `steps` are the cards of the method, in order, each with the persons it names
   (`group`, as its card's) and the genotypes it proves (`show`); open a step and the genotypes of that step and of every step
   before it stand beside the persons' numbers, in the accent colour, until another step is opened. A genotype stands right
   of its number, or left of it for a person in `left` (person 1: the line down to his children passes on his right).
   The key (male, female, shaded, a genotype) is HTML under the drawing.
   spec: { kind: 'pedigree', parts: ['p1', …], key: [[swatch class, words], …], say, note,
           steps: [{ group: ['p2', …], show: { p2: 'ww', … } }, …], left: ['p1'] }
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
    var lit = {}, steps = spec.steps || [], left = {}, upto = -1;
    (spec.left || []).forEach(function (q) { left[q] = 1; });
    function sameSet(a, b) { return a.slice().sort().join(' ') === b.slice().sort().join(' '); }
    /* the genotypes found so far: every step up to the one last opened */
    function known() { var g = {}; for (var i = 0; i <= upto && i < steps.length; i++) Object.keys(steps[i].show || {}).forEach(function (q) { g[q] = steps[i].show[q]; }); return g; }
    function draw() {
      var r = stage.getBoundingClientRect(), W = Math.max(260, r.width || 520);
      var s = W / 340, Hh = 260 * s;
      svg.setAttribute('viewBox', '0 0 340 260'); svg.setAttribute('width', W); svg.setAttribute('height', Hh);
      var out = Sc.pedigree(null).svg;
      /* the numbers at 15 px on screen, whatever the scale */
      out = out.replace(/<text class="pd__n"([^>]*)>/g, '<text class="pd__n"$1 font-size="' + (15 / s).toFixed(1) + '">');
      FAM.forEach(function (p) { if (lit['p' + p.n]) out = '<circle class="pd__lit" cx="' + p.x + '" cy="' + p.y + '" r="22"/>' + out; });
      /* each genotype found so far, on the number's line: beside it, clear of the family's lines */
      var G = known(), fs = 15 / s;
      FAM.forEach(function (p) {
        var g = G['p' + p.n]; if (!g) return;
        var L = !!left['p' + p.n], gx = p.x + (L ? -1 : 1) * (String(p.n).length * fs * .32 + fs * .45);
        out += '<text class="pd__g" x="' + gx.toFixed(1) + '" y="' + (p.y + 29) + '" text-anchor="' + (L ? 'end' : 'start') + '" font-size="' + fs.toFixed(1) + '">' + g + '</text>';
      });
      svg.innerHTML = out;
      /* each person a button, over its symbol */
      FAM.forEach(function (p) {
        var g = document.createElementNS(NS, 'circle');
        g.setAttribute('cx', p.x); g.setAttribute('cy', p.y); g.setAttribute('r', 20); g.setAttribute('class', 'pd__hit');
        g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
        g.setAttribute('aria-label', 'Person ' + p.n + ': ' + (p.sex === 'm' ? 'male' : 'female') + ', ' + (p.has ? 'dry earwax' : 'wet earwax') + (G['p' + p.n] ? ', ' + G['p' + p.n] : ''));
        function go() { ctx.pick('p' + p.n); }
        g.addEventListener('click', go);
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        svg.appendChild(g);
      });
    }
    if (global.ResizeObserver) new global.ResizeObserver(draw).observe(stage);
    draw();
    var api = {
      el: root, say: spec.say || '', note: spec.note || '', credit: '',
      labels: (function () { var o = {}; (spec.parts || []).forEach(function (p) { o[p] = 'person ' + p.slice(1); }); return o; })(),
      focus: function (part) {
        lit = {};
        [].concat(part || []).forEach(function (x) { lit[x] = 1; });
        draw();
      },
      /* an open card's whole group (null: it closed): every person it names ringed; a step of the method shows its genotypes */
      group: function (ids) {
        if (!ids) { lit = {}; draw(); return; }
        lit = {}; ids.forEach(function (x) { lit[x] = 1; });
        for (var i = 0; i < steps.length; i++) if (sameSet(steps[i].group, ids)) upto = i;
        draw();
      },
      stop: function () {}
    };
    return api;
  }
  global.Views.add('pedigree', make);
})(window);
