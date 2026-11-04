/* ============================================================
   views/gallery.js — a station's picture made of real photographs, one per idea: the four kinds of pathogen, the ways a
   pathogen is transmitted, the five ways to control the spread.

   Each photograph carries its name ON it (memory name-it-on-the-picture); the credits are a folded list under the picture
   (plate.js `credits`), never on the photographs (Daniel, 4 Nov 2026: they covered them). Pressing one opens its
   card on the right; opening a card lights its photograph (the others dim). A row of buttons switches between modes when
   a station has more than one; a mode may group its photographs under headings (`bands`: "By direct contact",
   "Indirectly").

   spec: { kind:'gallery', parts:[…], modes:[{ id, name, cols, say, bands:[{ t, ids }],
           tiles:[{ id, img, name, sub, sup, pos, credit, alt }] }] }
   `img` is a base in assets/photos (its -900 and -1400, JPEG and WebP: the build checks); `pos` the part of the
   photograph to keep when it is cropped to its tile (CSS object-position).
   ============================================================ */
(function (global) {
  'use strict';
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var WEBP = (function () { try { var c = document.createElement('canvas'); c.width = c.height = 1; return c.toDataURL('image/webp').indexOf('data:image/webp') === 0; } catch (e) { return false; } })();

  function photo(t) {
    var base = 'assets/photos/' + t.img, big = !!(global.PHOTO_SIZE || {})[t.img + '-1400.jpg'], ext = WEBP ? '.webp' : '.jpg';
    var im = new Image();
    im.src = base + '-900' + ext;
    if (big) { im.srcset = base + '-900' + ext + ' 900w, ' + base + '-1400' + ext + ' 1400w'; im.sizes = '(max-width: 1000px) 46vw, 22vw'; }
    im.alt = t.alt || ''; im.decoding = 'async'; im.loading = 'lazy'; im.className = 'gal__img';
    if (t.pos) im.style.objectPosition = t.pos;
    return im;
  }

  function make(spec, ctx) {
    var root = h('div', 'gal');
    var bar = h('div', 'vbar gal__bar'); bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'What the picture shows');
    if (spec.modes.length < 2) bar.hidden = true;
    root.appendChild(bar);
    var cur = 0, lit = null, tileOf = {};
    var modes = spec.modes.map(function (m, k) {
      /* each mode its own colour, the colour of its block in What you need to know (app.js exam-part--k) */
      var b = h('button', 'gal__mode gal__mode--' + (k + 1), esc(m.name)); b.type = 'button';
      b.addEventListener('click', function () { show(k); });
      bar.appendChild(b);
      var grid = h('div', 'gal__grid'); grid.style.setProperty('--cols', m.cols || 2);
      var bandOf = {};
      (m.bands || []).forEach(function (bd, j) { bd.ids.forEach(function (id) { bandOf[id] = j; }); });
      var lastBand = -1;
      m.tiles.forEach(function (t) {
        var bj = bandOf[t.id];
        if (bj != null && bj !== lastBand) { grid.appendChild(h('p', 'gal__band', esc(m.bands[bj].t))); lastBand = bj; }
        var tile = h('button', 'gal__tile gal__tile--' + (k + 1)); tile.type = 'button';
        tile.setAttribute('aria-label', t.name + (t.sub ? ', ' + t.sub : '') + ': open its card');
        tile.appendChild(photo(t));
        tile.appendChild(h('span', 'gal__name', '<b>' + esc(t.name) + '</b>' + (t.sub ? '<span>' + esc(t.sub) + '</span>' : '') + (t.sup ? '<i class="gal__sup">S</i>' : '')));
        tile.addEventListener('click', function () { lit = t.id; paint(); ctx.pick(t.id, { stay: true }); });
        grid.appendChild(tile);
        tileOf[t.id] = { k: k, el: tile };
      });
      root.appendChild(grid);
      return { spec: m, btn: b, grid: grid };
    });
    function paint() {
      modes.forEach(function (M, k) {
        M.grid.hidden = k !== cur; M.btn.setAttribute('aria-pressed', k === cur ? 'true' : 'false');
      });
      Object.keys(tileOf).forEach(function (id) {
        var T = tileOf[id]; T.el.classList.toggle('is-lit', lit === id); T.el.classList.toggle('is-dim', !!lit && lit !== id && tileOf[lit] && tileOf[lit].k === T.k);
      });
      api.say = modes[cur].spec.say;
      api.credits = modes[cur].spec.tiles.filter(function (t) { return t.credit; }).map(function (t) { return [t.name + (t.sub ? ' (' + t.sub + ')' : ''), t.credit]; });
      ctx.caption();
    }
    function show(k) { cur = k; lit = null; paint(); }
    var api = {
      el: root, say: '', credits: null,
      labels: (function () { var o = {}; spec.modes.forEach(function (m) { m.tiles.forEach(function (t) { o[t.id] = t.name; }); }); return o; })(),
      focus: function (part) {
        lit = part || null;
        if (part && tileOf[part]) cur = tileOf[part].k;
        paint();
      },
      stop: function () {}
    };
    paint();
    return api;
  }
  global.Views.add('gallery', make);
})(window);
