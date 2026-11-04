/* ============================================================
   w-kit.js — what this lab's step animations share (the Circulation Lab's w-defence.js helpers, 3 Nov 2026).

   frameOf   fits a model window into the svg with a margin each side for the names, at a readable size
   fitType   the font and the margins, so names stay about 13 px on any screen
   readerClock / readerSteps   each step lasts at least one second for every 3.2 words of its caption
   drawLabels  the names in both margins on ruled level lines (CircLearn.labels), each ending ON its part
   shell / mount  the widget's head, step bar, drawing and step list; on a wide screen the drawing stands in the
             picture's column and the steps stay beside it (memory animations-beside-their-buttons)
   Every frame is a pure function of the time t, and box.__seek(t) draws any moment (memory headless-raf-animations).
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn;
  if (!L || !L.stepper || !L.labels) return;
  var h = L.h;
  var NS = 'http://www.w3.org/2000/svg';
  function n1(v) { return Math.round(v * 10) / 10; }
  function seg(t, a, b) { return t <= a ? 0 : t >= b ? 1 : (t - a) / (b - a); }
  function ease(k) { return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function clamp01(k) { return k < 0 ? 0 : k > 1 ? 1 : k; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function len(x, y) { return Math.sqrt(x * x + y * y); }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
  function fitType(D, bw, cL, cR, mL0, mR0, px) {
    var f = px * (bw + mL0 + mR0) / D, mL = mL0, mR = mR0;
    for (var i = 0; i < 10; i++) { mL = Math.max(mL0, cL * .55 * f + 20); mR = Math.max(mR0, cR * .55 * f + 20); f = px * (bw + mL + mR) / D; }
    return { f: f, mL: mL, mR: mR };
  }

  /* Reading time. Each step's animation is written in its own time (the model's); the reader's
     time stretches it so that a step lasts at least 1 second for every 3.2 words of its caption
     (the lab's rule is 4). R = when each step starts for the reader, M = in the model. */
  function readerClock(R, M) {
    return function (t) {
      for (var i = 0; i + 1 < R.length; i++) if (t < R[i + 1] || i + 2 === R.length) return M[i] + (Math.min(t, R[i + 1]) - R[i]) * (M[i + 1] - M[i]) / (R[i + 1] - R[i]);
      return M[M.length - 1];
    };
  }
  function readerSteps(steps, R) { return steps.map(function (s, i) { var o = {}; for (var k in s) o[k] = s[k]; o.t = R[i]; return o; }); }

  /* px: the size the names are drawn at on screen (13 by default; this lab's animations ask for 14.5) */
  function frameOf(svg, bg, model, clipRect, win, tall, D, cL, cR, mL0, mR0, px) {
    var bw = tall ? win.y1 - win.y0 : win.x1 - win.x0, bh = tall ? win.x1 - win.x0 : win.y1 - win.y0;
    var ft = fitType(D, bw, cL, cR, mL0, mR0, px || 13), padT = 12, padB = 12;
    var vb = { x: -ft.mL, y: -padT, w: bw + ft.mL + ft.mR, h: bh + padT + padB, bw: bw, bh: bh };
    svg.setAttribute('viewBox', n1(vb.x) + ' ' + n1(vb.y) + ' ' + n1(vb.w) + ' ' + n1(vb.h));
    bg.setAttribute('x', n1(vb.x)); bg.setAttribute('y', n1(vb.y)); bg.setAttribute('width', n1(vb.w)); bg.setAttribute('height', n1(vb.h)); bg.setAttribute('rx', 18);
    clipRect.setAttribute('x', win.x0); clipRect.setAttribute('y', win.y0); clipRect.setAttribute('width', win.x1 - win.x0); clipRect.setAttribute('height', win.y1 - win.y0);
    model.setAttribute('transform', tall ? 'matrix(0 1 1 0 ' + (-win.y0) + ' ' + (-win.x0) + ')' : 'translate(' + (-win.x0) + ' ' + (-win.y0) + ')');
    return { tall: tall, win: win, f: ft.f, mL: ft.mL, mR: ft.mR, vb: vb,
             to: function (x, y) { return tall ? [y - win.y0, x - win.x0] : [x - win.x0, y - win.y0]; } };
  }
  function drawLabels(lay, items, tiny, gap) {
    var vb = lay.vb, o = { left: -8, right: vb.bw + 8, font: lay.f, top: vb.y + 6, bottom: vb.y + vb.h - 6, gap: gap == null ? 5 : gap };
    var out = L.labels(Object.assign({}, o, { items: items.filter(function (q) { return q.side === 'L'; }), width: lay.mL - 26 })) +
              L.labels(Object.assign({}, o, { items: items.filter(function (q) { return q.side === 'R'; }), width: lay.mR - 26 }));
    /* a part smaller than the usual dot (a platelet, a molecule) gets a smaller dot, so it still shows round it */
    if (tiny) out = out.split('<g class="lb').map(function (chunk) {
      var m = chunk.match(/data-lab="([^"]*)"/);
      return m && tiny[m[1]] ? chunk.replace(/(<circle class="lb__dot"[^>]*? r=")[\d.]+"/, '$1' + tiny[m[1]] + '"') : chunk;
    }).join('<g class="lb');
    return out;
  }
  /* On a phone (a widget under 440 px wide) a column of words beside the drawing would leave the drawing a few pixels
     wide: each name becomes a numbered pin on the same ruled level line, and the numbered words stand in a key under the
     drawing (the Plants and Circulation Labs' rule for animations on a phone, CircLearn.pinLabels). */
  function pinKey(S) { var ol = h('ol', 'pinkey'); ol.hidden = true; S.fig.appendChild(ol); return ol; }
  function names(lay, items, narrow, key, tiny, gap) {
    if (!narrow) { if (key) key.hidden = true; return drawLabels(lay, items, tiny, gap); }
    var vb = lay.vb, P = L.pinLabels({ items: items, left: -4, right: vb.bw + 4, font: lay.f, top: vb.y + 6, bottom: vb.y + vb.h - 6, gap: 4 });
    if (key) { key.hidden = !P.order.length; key.innerHTML = P.order.map(function (o) { return '<li><b>' + o.n + '</b> ' + L.esc(o.text) + '</li>'; }).join(''); }
    return P.svg;
  }
  /* the margins a frame needs: words beside the drawing, or on a phone only a column of pins. A pin stands 1.44 fonts
     and 12 units out from the drawing's edge (pinLabels), so its margin is counted as 2.7 characters of the font
     (fitType gives 2.7 × .55 × f + 20), never a fixed width that a large font would overrun */
  function margins(narrow, cL, cR, mL0, mR0) { return narrow ? [2.7, 2.7, 24, 24] : [cL, cR, mL0, mR0]; }
  /* the shared shell of a step widget: head, step bar, read-outs, the figure, the step list */
  function shell(spec, cls, title, aria, pills) {
    var box = h('div', 'widget ' + cls);
    box.appendChild(L.head(spec.title || title, spec.ask, 'Press play'));
    var read = h('div', cls + '__read', pills.map(function (p) { return '<span class="' + cls + '__pill" data-k="' + p[0] + '"><b>' + p[1] + '</b> <i></i></span>'; }).join(''));
    var fig = h('figure', cls + '__fig');
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', cls + '__svg'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', aria);
    fig.appendChild(svg);
    return { box: box, read: read, fig: fig, svg: svg, spec: spec, title: spec.title || title,
             pill: function (k, text, tone) { var p = read.querySelector('[data-k="' + k + '"]'), i = p.querySelector('i'); if (i.textContent !== text) i.textContent = text; p.className = cls + '__pill is-' + tone; } };
  }
  function mount(S, sp, cls, notes, setLayout) {
    S.box.appendChild(sp.bar);
    var wrap = h('div', cls + '__wrap');
    /* on a wide screen the drawing stands in the plate's column; its read-outs and the steps stay here
       (Daniel, 26 Sep: "any animations move them to the left and then the text and the buttons on the right") */
    var pack = h('div', cls + '__pack');
    var packT = h('p', 'stg__title', L.esc(S.title)); packT.hidden = true;
    pack.appendChild(packT); pack.appendChild(S.fig);
    var left = h('div', cls + '__left'); left.appendChild(S.read); left.appendChild(pack);
    S.fig.appendChild(sp.now);
    wrap.appendChild(left); wrap.appendChild(sp.list);
    S.box.appendChild(wrap);
    notes.forEach(function (n) { S.box.appendChild(h('p', 'widget__note' + (n[1] ? ' ' + n[1] : ''), n[0])); });
    var lastD = 0, lastN = false;
    function fit() {
      var ww = wrap.getBoundingClientRect().width; if (!ww) return;
      wrap.classList.toggle(cls + '--side', ww >= 980);
      var D = S.fig.getBoundingClientRect().width, narrow = ww < 440;
      if (!D || (Math.abs(D - lastD) < 2 && narrow === lastN)) return;
      lastD = D; lastN = narrow; setLayout(D, narrow); sp.paint(sp.time());
    }
    setLayout(700, false);
    var ro = global.ResizeObserver ? new ResizeObserver(function () { if (!S.box.isConnected) { ro.disconnect(); return; } fit(); }) : null;
    if (ro) { ro.observe(wrap); ro.observe(S.fig); }
    var stg = L.stage ? L.stage({ box: S.box, spec: S.spec, pack: pack, home: left, watch: function () { return S.box; },
      onPlace: function (inColumn) { packT.hidden = !inColumn; S.box.classList.toggle(cls + '--staged', inColumn); sp.compact(inColumn); lastD = 0; fit(); } }) : null;
    S.box.__onMove = function () { if (stg) stg.mount(); };
    S.box.__onReset = function () { sp.stop(); if (ro) ro.disconnect(); if (stg) stg.detach(); };
    S.box.__seek = function (t) { fit(); return sp.seek(t); };
    sp.paint(0);
    return S.box;
  }


  global.WKit = { pinKey: pinKey, names: names, margins: margins, n1: n1, seg: seg, ease: ease, clamp01: clamp01, lerp: lerp, len: len, rng: rng, fitType: fitType,
                  readerClock: readerClock, readerSteps: readerSteps, frameOf: frameOf, drawLabels: drawLabels, shell: shell,
                  mount: mount, NS: NS };
})(window);
