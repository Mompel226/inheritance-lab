/* ============================================================
   views/figure.js — a station's labelled picture: one drawing or photograph, or several ways of seeing one thing.

   The Cells Lab's cell view (3 Nov 2026), made general: the names come from the station, not from a list of cell parts.
   A row of buttons switches between the modes when there is more than one. Each mode names its parts on ruled level
   lines that end ON the part (memory label-lines-never-cross, no dots). Opening a card on the right shows its part: if
   this mode cannot show it, the picture changes to the first mode that can, and says why when the station gives a
   reason (`cannot`).

   spec: { kind:'figure', parts:[…], names:{ part: 'its name on the picture' }, beyond:{ part: 1 },
           modes:[{ id, name, img, iw, ih, x0, y0, w, h, pts:{ part:[x, y, side?, r?] }, alts:{ part:[[x, y], …] },
                    names, say, alt, credit, cannot:{ part: 'why' }, heads:[{ x, t, y? }], narrow:{ … } }] }
   `img` is a file in assets/photos: a photograph or one of the lab's own drawings (an SVG). Points are in the picture's
   own pixels or viewBox units. `alts` are other points ON a part, where its name may stand when names crowd, so every
   line stays level; `beyond` names a part beyond 0610, left out first on a phone too narrow for every name.
   `narrow` is the same picture arranged for a stage under 520 px. `key` ([[swatch class, words], …], on a mode or the
   whole view) is the drawing's key, in HTML under the picture, so it is never smaller than the page's words.
   ============================================================ */
(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  /* the longest line of a label once it wraps at W letters, the way CircLearn.labels wraps it */
  function lineMax(text, W) {
    var cap = W * 0.56 / 0.52, n = 0, cur = '';
    String(text).split(' ').forEach(function (wd) { var tr = cur ? cur + ' ' + wd : wd; if (tr.length > cap && cur) { n = Math.max(n, cur.length); cur = wd; } else cur = tr; });
    return Math.max(n, cur.length);
  }

  function make(spec, ctx) {
    /* a part's name on the picture: the mode's own, then the station's, then its id (each view keeps its own) */
    var NAMES = spec.names || {}, BEYOND = spec.beyond || {};
    function labelOf(m, p) { return (m.names && m.names[p]) || NAMES[p] || p; }
    var root = h('div', 'cellv');
    var bar = h('div', 'vbar cellv__bar');
    bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Ways of seeing this picture');
    if (spec.modes.length < 2) bar.hidden = true;
    var note = h('p', 'cellv__note');
    note.setAttribute('aria-live', 'polite'); note.hidden = true;
    var stage = h('div', 'cellv__stage');
    /* a drawing's key, in HTML under it (never words inside the scaled drawing): `key: [[swatch class, words], …]` */
    var keyEl = h('ul', 'figkey'); keyEl.hidden = true;
    root.appendChild(bar); root.appendChild(stage); root.appendChild(keyEl); root.appendChild(note);
    var uid = 'cv' + Math.random().toString(36).slice(2, 7);

    /* a mode that names a drawn scene (js/inh-scenes.js) takes its size, its picture and its points from it */
    spec.modes.forEach(function (m) {
      if (!m.draw || !global.LabScenes) return;
      var sc = global.LabScenes.get(m.draw); if (!sc) return;
      m.w = m.w || sc.w; m.h = m.h || sc.h; m.scene = sc.svg;
      if (!m.pts || !Object.keys(m.pts).length) m.pts = sc.pts;
      m.alts = Object.assign({}, sc.alts || {}, m.alts || {});
    });
    var modes = spec.modes.map(function (m, k) {
      /* a mode shares its colour with the block of What you need to know named as it (app.js exam-part--k) */
      var b = h('button', 'cellv__mode' + (spec.modes.length > 1 ? ' cellv__mode--' + (k + 1) : ''), m.name); b.type = 'button';
      b.setAttribute('aria-pressed', k === 0 ? 'true' : 'false');
      b.addEventListener('click', function () { show(k, null); });
      bar.appendChild(b);
      var svg = el('svg', { class: 'cellv__svg', role: 'img', 'aria-label': m.alt || m.name });
      var defs = el('defs', {}, svg);
      var f = el('filter', { id: uid + 'f' + k, x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
      el('feGaussianBlur', { stdDeviation: String(Math.max(m.w, m.h) / 40) }, f);
      var mask = el('mask', { id: uid + 'm' + k, maskUnits: 'userSpaceOnUse', x: m.x0 || 0, y: m.y0 || 0, width: m.w, height: m.h }, defs);
      el('rect', { x: m.x0 || 0, y: m.y0 || 0, width: m.w, height: m.h, fill: '#fff' }, mask);
      var hole = el('ellipse', { cx: 0, cy: 0, rx: 0, ry: 0, fill: '#000', filter: 'url(#' + uid + 'f' + k + ')' }, mask);
      /* the picture at its full size, CLIPPED to the crop x0, y0, w, h (a drawing's own viewBox units): without the clip
         the rest of the photograph shows in the label margins and above and below the crop (8 Oct 2026 review) */
      var clip = el('clipPath', { id: uid + 'c' + k }, defs);
      var clipR = el('rect', { x: m.x0 || 0, y: m.y0 || 0, width: m.w, height: m.h }, clip);
      var img;
      if (m.scene) { img = el('g', { 'clip-path': 'url(#' + uid + 'c' + k + ')' }, svg); img.innerHTML = m.scene; }
      else img = el('image', { href: 'assets/photos/' + (m.svg || m.img), x: 0, y: 0, width: m.iw || m.w, height: m.ih || m.h, preserveAspectRatio: 'none',
        'clip-path': 'url(#' + uid + 'c' + k + ')' }, svg);
      var veil = el('rect', { x: m.x0 || 0, y: m.y0 || 0, width: m.w, height: m.h, class: 'cellv__veil', mask: 'url(#' + uid + 'm' + k + ')' }, svg);
      var labG = el('g', {}, svg);
      svg.style.display = k === 0 ? '' : 'none';
      stage.appendChild(svg);
      return { spec: m, cur: m, narrowSpec: m.narrow ? Object.assign({}, m, m.narrow) : null, btn: b, svg: svg, labG: labG, hole: hole, veil: veil,
        img: img, clipR: clipR, mask: mask, maskR: mask.firstChild, blur: f.firstChild, font: 0 };
    });
    /* the arrangement of this picture for the stage's width; swapped in place when it changes */
    function variant(M, r) {
      var want = r.width < 520 && M.narrowSpec ? M.narrowSpec : M.spec;
      if (M.cur === want) return;
      M.cur = want;
      var m = want, box = { x: m.x0 || 0, y: m.y0 || 0, width: m.w, height: m.h };
      if (!m.scene) {
        M.img.setAttribute('href', 'assets/photos/' + (m.svg || m.img));
        M.img.setAttribute('width', m.iw || m.w); M.img.setAttribute('height', m.ih || m.h);
      }
      [M.clipR, M.mask, M.maskR, M.veil].forEach(function (e) { Object.keys(box).forEach(function (a) { e.setAttribute(a, box[a]); }); });
      M.blur.setAttribute('stdDeviation', String(Math.max(m.w, m.h) / 40));
      M.svg.setAttribute('aria-label', m.alt || m.name);
    }

    var cur = 0, lit = null;
    /* labels at about 14 px on any screen: the font, and the margins it needs, in the picture's own units */
    function fit(M) {
      var r = M.svg.getBoundingClientRect(); if (!r.width || !r.height) return;
      variant(M, r);
      var m = M.cur;
      /* labels wrap at about ten letters (never inside a word), so a wide photograph keeps most of the width; where the
         height limits the picture anyway, they take the spare width and wrap less (8 Oct 2026 review: a long name in
         five one-word lines) */
      var nameOf = function (p) { return labelOf(m, p); };
      var keys = Object.keys(m.pts);
      var W0 = keys.reduce(function (n, p) { return Math.max(n, nameOf(p).split(' ').reduce(function (k, w) { return Math.max(k, w.length); }, 0)); }, 10);
      var W1 = Math.min(18, keys.reduce(function (n, p) { return Math.max(n, nameOf(p).length); }, 0));
      function sizes(W) {
        /* each margin as wide as ITS OWN longest line (a short word on one side leaves the picture more room) */
        var widest = function (side) { return keys.filter(function (p) { return sideOf(M, p) === side; })
          .reduce(function (n, p) { return Math.max(n, lineMax(nameOf(p), W)); }, 0); };
        var wl = widest('L'), wr = widest('R'), f = 40, L, R, ppu;
        /* 0.6 of the font a letter: a name of wide letters ("chromosome") needs more than the average 0.56 */
        for (var n = 0; n < 4; n++) {
          L = wl ? f * 0.6 * wl + 30 : 10; R = wr ? f * 0.6 * wr + 30 : 10;
          ppu = Math.min(r.width / (m.w + L + R), r.height / (m.h + 20 + headU(m, f)));
          f = Math.max(12, Math.min(m.w / 6, 14 / ppu));
        }
        L = wl ? f * 0.6 * wl + 30 : 10; R = wr ? f * 0.6 * wr + 30 : 10;
        return { W: W, f: f, L: L, R: R, roomy: r.width / (m.w + L + R) >= r.height / (m.h + 20 + headU(m, f)) };
      }
      var s = sizes(W0);
      for (var W = W1; W > W0; W--) { var t = sizes(W); if (t.roomy) { s = t; break; } }
      M.wrap = s.W;
      /* words in the margins would leave the picture under 60 % of the width (a wide micrograph, or a photograph on a
         phone): numbered pins in narrow margins and a key under the picture instead (8 Oct 2026 review: the electron
         micrograph was a strip a third of the stage wide; on a phone, 110 px) */
      var pLab = Math.min(r.width / (m.w + s.L + s.R), r.height / (m.h + 20 + headU(m, s.f)));
      /* on a phone pins whenever they make the picture clearly larger; on a wide screen only for a very wide picture,
         because words beside the parts teach the names best */
      var narrow = r.width < 520, share = m.w * pLab / r.width;
      if ((narrow ? share < 0.75 : (share < 0.6 && m.w / m.h > 1.8)) && fitPins(M, r, keys, pLab, narrow ? 1.2 : 1.3)) return;
      M.pins = null;
      var hu = headU(m, s.f);
      M.svg.setAttribute('viewBox', ((m.x0 || 0) - s.L).toFixed(1) + ' ' + ((m.y0 || 0) - 10 - hu).toFixed(1) + ' ' + (m.w + s.L + s.R).toFixed(1) + ' ' + (m.h + 20 + hu).toFixed(1));
      M.font = s.f;
    }
    function headU(m, f) { return (m.heads || []).some(function (hd) { return hd.y == null; }) ? f * 1.7 : 0; }   /* room above, for headings above the picture */
    /* the pins' key goes beside the picture or under it (one or two columns), whichever leaves the picture larger;
       a long name wraps ("capsule" / "(beyond 0610)"). Everything is about 13 px on screen. */
    function wrapWords(text, n) {
      var out = [], cur = '';
      String(text).split(' ').forEach(function (wd) { var tr = cur ? cur + ' ' + wd : wd; if (tr.length > n && cur) { out.push(cur); cur = wd; } else cur = tr; });
      if (cur) out.push(cur);
      return out;
    }
    function fitPins(M, r, keys, pLab, gain) {
      var m = M.cur, PX = 13, lh = PX * 1.3, gap = PX * 0.35;
      var nl = keys.filter(function (p) { return sideOf(M, p) === 'L'; }).length, nr = keys.length - nl;
      var KW = keys.reduce(function (n, p) { return Math.max(n, labelOf(m, p).split(' ').reduce(function (k, w) { return Math.max(k, w.length); }, 0)); }, 12);
      var lines = keys.map(function (p) { return wrapWords(labelOf(m, p), KW); });
      var itemW = PX * (1.64 + 0.56 * lines.reduce(function (n, ls) { return Math.max(n, ls.reduce(function (k, l) { return Math.max(k, l.length); }, 0)); }, 0));
      function colH(ls) { return ls.reduce(function (h, x, i) { return h + x.length * lh + (i ? gap : 0); }, 0); }
      var sidesPx = (nl ? 18.7 : 0) + (nr ? 18.7 : 0), sidesU = (nl ? 16 : 10) + (nr ? 16 : 10);
      var best = null, hB = colH(lines);
      if (hB <= r.height - 10) {
        var pb = Math.min((r.width - sidesPx - itemW - PX) / (m.w + sidesU), (r.height - (m.heads ? PX * 1.7 : 0)) / (m.h + 20));
        if (pb > 0) best = { p: pb, where: 'beside', cols: 1, h: hB };
      }
      [1, 2].forEach(function (cols) {
        if (cols * itemW > r.width) return;
        /* the key is drawn in pin order, not in this order: size it for the tallest names sharing one column */
        var per = Math.ceil(lines.length / cols);
        var hh = colH(lines.slice().sort(function (x, y) { return y.length - x.length; }).slice(0, per));
        var pp = Math.min((r.width - sidesPx) / (m.w + sidesU), (r.height - hh - PX - (m.heads ? PX * 1.7 : 0)) / (m.h + 20));
        if (pp > 0 && (!best || pp > best.p)) best = { p: pp, where: 'below', cols: cols, h: hh };
      });
      if (!best || best.p < pLab * gain) return false;   /* words beside the parts teach the names best: pins only when they make the picture far larger */
      var f = PX / best.p, colL = nl ? 16 + 1.44 * f : 10, colR = nr ? 16 + 1.44 * f : 10, x0 = m.x0 || 0, y0 = m.y0 || 0;
      var hu = headU(m, f), vw = m.w + colL + colR, vh = m.h + 20 + hu;
      if (best.where === 'beside') vw += (itemW + PX) / best.p; else vh += (best.h + PX) / best.p;
      M.pins = { f: f, colL: colL, colR: colR, where: best.where, cols: best.cols, lines: lines, keys: keys, hU: best.h / best.p, vw: vw };
      M.font = f;
      M.svg.setAttribute('viewBox', (x0 - colL).toFixed(1) + ' ' + (y0 - 10 - hu).toFixed(1) + ' ' + vw.toFixed(1) + ' ' + vh.toFixed(1));
      return true;
    }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    /* the pins' key: each name after its number; a name opens its card too */
    function pinKey(M, order) {
      var m = M.cur, P = M.pins, f = P.f, x0 = m.x0 || 0, y0 = m.y0 || 0, out = '', rr = f * 0.62, lh = f * 1.3, gap = f * 0.35;
      var linesOf = {}; P.keys.forEach(function (k, i) { linesOf[k] = P.lines[i]; });
      var per = Math.ceil(order.length / P.cols), colW = (m.w + P.colL + P.colR) / P.cols;
      var bx0 = P.where === 'beside' ? x0 + m.w + P.colR + f * 0.5 : x0 - P.colL + f * 0.5;
      var by0 = P.where === 'beside' ? y0 + Math.max(0, (m.h - P.hU) / 2) : y0 + m.h + 10 + f * 0.6;
      var yAt = [by0];
      order.forEach(function (it, i) {
        var c = Math.floor(i / per), k = i % per, ls = linesOf[it.id] || [it.text];
        if (k === 0) yAt[c] = by0;
        var bx = bx0 + c * colW, top = yAt[c], cy = top + lh / 2;
        yAt[c] = top + ls.length * lh + gap;
        out += '<g class="lb lb--key ' + (it.cls || '') + '" data-lab="' + it.id + '">' +
          '<circle class="lb__pin" cx="' + (bx + rr).toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + rr.toFixed(1) + '"/>' +
          '<text class="lb__pinn" x="' + (bx + rr).toFixed(1) + '" y="' + (cy + f * 0.28).toFixed(1) + '" text-anchor="middle" style="font-size:' + (f * 0.78).toFixed(1) + 'px">' + it.n + '</text>' +
          '<text class="lb__txt" style="font-size:' + f.toFixed(1) + 'px">' + ls.map(function (l, j) {
            return '<tspan x="' + (bx + 2 * rr + f * 0.45).toFixed(1) + '" y="' + (cy + f * 0.35 + j * lh).toFixed(1) + '">' + esc(l) + '</tspan>'; }).join('') + '</text></g>';
      });
      return out;
    }
    function sideOf(M, p) { var m = M.cur, pt = m.pts[p]; return pt[2] || (pt[0] < (m.x0 || 0) + m.w / 2 ? 'L' : 'R'); }
    function draw(M) {
      fit(M);
      var m = M.cur, f = M.font || 40;
      var items = Object.keys(m.pts).map(function (p) {
        /* `alts`: other points ON the part, where its name may stand when names crowd (a drawing's are found from the
           drawing itself by the station's master; `off`: a first point not on its part, never used) */
        return { id: p, text: labelOf(m, p), x: m.pts[p][0], y: m.pts[p][1], side: sideOf(M, p), alts: (m.alts || {})[p],
          off: (m.off || []).indexOf(p) >= 0, opt: !!BEYOND[p], cls: lit === p ? 'is-lit' : (lit ? 'is-dim' : '') };
      });
      if (M.pins) {
        var pl = global.CircLearn.pinLabels({ items: items, left: (m.x0 || 0) - 4, right: (m.x0 || 0) + m.w + 4, font: f, top: m.y0 || 0, bottom: (m.y0 || 0) + m.h, gap: f * 0.25 });
        var idOf = {}; items.forEach(function (i) { idOf[i.text] = i.id; });
        M.labG.innerHTML = pl.svg + pinKey(M, pl.order.map(function (o) { return { n: o.n, text: o.text, cls: o.cls, id: idOf[o.text] }; }));
      } else {
        var opt = { left: (m.x0 || 0) - 8, right: (m.x0 || 0) + m.w + 8, font: f, top: m.y0 || 0, bottom: (m.y0 || 0) + m.h, gap: f * 0.3, width: f * 0.56 * (M.wrap || 15) };
        M.labG.innerHTML = global.CircLearn.labels(Object.assign({}, opt, { items: items }));
      }
      if (m.heads) M.labG.innerHTML += m.heads.map(function (hd) {
        var hy = hd.y != null ? hd.y : (m.y0 || 0) - f * 0.55;
        return '<text class="cellv__head" x="' + hd.x + '" y="' + (+hy).toFixed(1) + '" text-anchor="middle" style="font-size:' + f.toFixed(1) + 'px">' + esc(hd.t) + '</text>';
      }).join('');
      Array.prototype.forEach.call(M.labG.querySelectorAll('.lb'), function (g) {
        var k = g.getAttribute('data-lab');
        g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0');
        g.setAttribute('aria-label', items.filter(function (i) { return i.id === k; })[0].text + ': open its card');
        g.addEventListener('click', function () { ctx.pick(k); });
        g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ctx.pick(k); } });
      });
      var pt = lit && m.pts[lit];
      if (pt) {
        var rad = pt[3] || Math.max(m.w, m.h) / 9;
        M.hole.setAttribute('cx', pt[0]); M.hole.setAttribute('cy', pt[1]); M.hole.setAttribute('rx', rad); M.hole.setAttribute('ry', rad);
        M.veil.classList.add('is-on');
      } else M.veil.classList.remove('is-on');
    }
    function show(k, why) {
      cur = k;
      modes.forEach(function (M, j) { M.svg.style.display = j === k ? '' : 'none'; M.btn.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
      draw(modes[k]);
      var ky = modes[k].spec.key || spec.key || null;
      keyEl.hidden = !ky;
      keyEl.innerHTML = ky ? ky.map(function (q) { return '<li><i class="figkey__sw ' + q[0] + '" aria-hidden="true"></i>' + q[1] + '</li>'; }).join('') : '';
      note.hidden = !why; note.textContent = why || '';
      api.say = modes[k].spec.say; api.credit = modes[k].spec.credit;
      ctx.caption();
    }
    if (global.ResizeObserver) new global.ResizeObserver(function () { draw(modes[cur]); }).observe(stage);

    var api = {
      el: root, say: modes[0].spec.say, credit: modes[0].spec.credit,
      labels: (function () { var o = {}; (spec.parts || []).forEach(function (p) { o[p] = NAMES[p] || p; }); return o; })(),
      focus: function (part) {
        lit = part || null;
        var M = modes[cur];
        if (!part || M.spec.pts[part]) { show(cur, null); return; }
        /* this way of seeing cannot show it: change to the first that can, and say why */
        var why = (M.spec.cannot || {})[part] || '';
        for (var k = 0; k < modes.length; k++) if (modes[k].spec.pts[part]) { show(k, why ? why + ' Here it is in the ' + modes[k].spec.name.toLowerCase() + '.' : null); return; }
        show(cur, why || null);
      },
      stop: function () {}
    };
    show(0, null);
    return api;
  }
  global.Views.add('figure', make);
})(window);
