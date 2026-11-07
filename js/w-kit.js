/* ============================================================
   w-kit.js — what this lab's step animations share (the Circulation Lab's w-defence.js helpers, 3 Nov 2026).

   frameOf   fits a model window into the svg with a margin each side for the names, at a readable size
   fitType   the font and the margins, so names stay about 13 px on any screen
   readerClock / readerSteps   each step lasts at least one second for every 3.2 words of its caption; its motion runs
             1.6 times faster than written and then holds (Play all skips the hold)
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

  /* Reading time. Each step's animation is written in its own time (the model's), and a step lasts at least 1 second
     for every 3.2 words of its caption (the lab's rule is 4). R = when each step starts for the reader, M = in the
     model. The motion is never stretched to fill the reading time (Daniel, 4 Nov 2026: "very slow"): it runs PACE
     times faster than written, then the step holds its last frame until the reader's time is up. */
  var PACE = 1.6;
  /* P: the pace of each step (an array), or one pace for all; PACE when not given */
  function paceOf(P, i) { return P == null ? PACE : typeof P === 'number' ? P : (P[i] || PACE); }
  function readerClock(R, M, P) {
    return function (t) {
      for (var i = 0; i + 1 < R.length; i++) if (t < R[i + 1] || i + 2 === R.length) {
        var run = Math.min((M[i + 1] - M[i]) / paceOf(P, i), R[i + 1] - R[i]), k = Math.min(1, Math.max(0, (Math.min(t, R[i + 1]) - R[i]) / run));
        return M[i] + k * (M[i + 1] - M[i]) - (k === 1 && i + 2 < R.length ? .001 : 0);
      }
      return M[M.length - 1];
    };
  }
  /* Play all skips each step's reading hold: once a step's motion has run, it waits only while the names that came with
     it are read, then goes on with the next step's motion. f.need() (set by mount) reads the names on the picture once
     the step's last frame is drawn; with none, a short beat (.35 s) so the eye sees the step change (Daniel, 5 Nov 2026:
     "when you play it all, sometimes some sections go so fast, the labels that appear, you can barely read them") */
  /* MOTION[title] (optional): how long each step's motion really runs, in the model's seconds (tools/flow-still.mjs
     --write measures it into the widget's file; without --write it checks that nothing moves after it): Play all waits only for the names after that, and a single step stops there, so a
     step whose drawing has stopped never holds the reader up (Daniel, 6 Nov 2026: "I have to wait like very long time to
     see anything happen") */
  function readerFlow(R, M, P, MOTION, title) {
    var held = {}, seen = {}, ME = MOTION && title ? MOTION[title] : null;
    function runOf(i) { var d = M[i + 1] - M[i], me = ME && ME[i] != null ? Math.min(d, ME[i] + .15) : d; return Math.min(me / paceOf(P, i), R[i + 1] - R[i]); }
    function f(t) {
      for (var i = 0; i + 1 < R.length; i++) if (t < R[i + 1]) {
        var end = R[i] + runOf(i);
        if (t <= end) return t;
        if (held[i] == null) { if (!seen[i]) { seen[i] = 1; return t; } held[i] = f.need ? f.need(i) : .35; }
        return t > end + held[i] ? R[i + 1] : t;
      }
      return t;
    }
    f.need = null;
    /* the wait Play all gave step i for its names, once it has reached it (tools/flow-still.mjs allows a still that long) */
    f.hold = function (i) { return held[i]; };
    /* where a single step (Play, Next step) stops: as soon as its motion has run, with its names on; it then holds until
       the reader presses Next step, never making them wait out a reading time first (Daniel, 6 Nov 2026: "allow you to
       read things, but they don't make you wait there for ages") */
    f.endOf = function (i) { return i + 1 < R.length ? Math.min(R[i + 1] - .02, R[i] + runOf(i)) : R[R.length - 1]; };
    f.R = R; f.M = M; f.pace = function (i) { return paceOf(P, i); }; f.title = title || null;
    return f;
  }
  /* the time to read the names new in a step: 0.5 s to find the first, 0.3 s more for each other, and 1 s for every 4 of
     their words (Daniel, 7 Nov 2026); .35 s with none. Play all waits this long (mount's need), and a step with many
     names lasts at least its motion and this (w-protein.js R) */
  function namesWait(texts, before) {
    var fresh = texts.filter(function (x) { return (before || []).indexOf(x) < 0; });
    if (!fresh.length) return .35;
    return .5 + .3 * (fresh.length - 1) + fresh.reduce(function (a, x) { return a + x.split(' ').length; }, 0) / 4;
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
  /* the key of an animation is DRAWN: a small sample of each part, in its picture's own classes, beside its name (Daniel,
     5 Nov 2026: "Why don't you show them instead of writing about them?"). A note { key: [[kind, name, steps, letters], …] }
     is one: `steps` the steps (from 0) whose picture shows that part, none for every step; kind 'bases' takes its letters */
  var SW = {
    mum: '<path class="ak__rod ak--mum" d="M5 7H23"/>',
    dad: '<path class="ak__rod ak--dad" d="M5 7H23"/>',
    other: '<path class="ak__rod ak--other" d="M5 7H23"/>',
    mix: '<path class="ak__rod ak--mum" d="M5 7H23"/><path class="ak__rod ak__butt ak--dad" d="M14 7H23"/>',
    gene: '<path class="ak__rod ak--other" d="M5 7H23"/><path class="ak__band" d="M12 7H17"/>',
    dnagene: '<path class="ak__dna" d="M1 4C8 4 8 10 14 10S20 4 27 4M1 10C8 10 8 4 14 4S20 10 27 10"/><path class="ak__band ak__glow" d="M8 7H20"/>',
    dna: '<path class="ak__dna" d="M1 4C8 4 8 10 14 10S20 4 27 4M1 10C8 10 8 4 14 4S20 10 27 10"/>',
    hist: '<path class="ak__dna" d="M0 7H28"/><circle class="zm__hist" cx="8" cy="7" r="4.6"/><circle class="zm__hist" cx="20" cy="7" r="4.6"/>',
    strand: '<path class="ak__line ak--new" d="M3 7H25"/>',
    mrna: '<path class="ak__line ak--mrna" d="M2 9C7 3 11 3 14 7S21 11 26 5"/>',
    enz: '<ellipse class="zm__enz" cx="14" cy="7" rx="10" ry="5.6"/>',
    fibre: '<path class="ak__fib" d="M3 7L25 2M3 7L25 7M3 7L25 12"/>',
    vesicle: '<circle class="vesicle" cx="7" cy="7" r="2.6"/><circle class="vesicle" cx="14" cy="5" r="2.6"/><circle class="vesicle" cx="21" cy="8" r="2.6"/>',
    cent: '<g transform="translate(14 7) scale(.72)"><circle class="cent__pcm" r="9"/><rect class="cent" x="-5.6" y="-4.6" width="9" height="3.6" rx="1"/><rect class="cent" x="2.4" y="-1.6" width="3.6" height="8.4" rx="1"/></g>',
    mito: '<ellipse class="mito" cx="14" cy="7" rx="10" ry="5"/>',
    chiasma: '<path class="ak__rod ak__thin ak--mum" d="M6 2L22 12"/><path class="ak__rod ak__thin ak--dad" d="M6 12L22 2"/><circle class="chiasma" cx="14" cy="7" r="5.6"/>',
    cring: '<g class="cring"><circle cx="8" cy="7" r="3.2"/><circle cx="14" cy="7" r="3.2"/><circle cx="20" cy="7" r="3.2"/></g>',
    rib: '<ellipse class="pt__ls" cx="14" cy="5.4" rx="10" ry="4.4"/><ellipse class="pt__ss" cx="14" cy="10.6" rx="7" ry="3"/>',
    trna: '<path class="pt__trna" d="M8 1.5H20V6H16.5V12.5H11.5V6H8Z"/>',
    aa: '<circle class="aa aa1" cx="6" cy="7" r="4"/><circle class="aa aa2" cx="14" cy="7" r="4"/><circle class="aa aa3" cx="22" cy="7" r="4"/>',
    /* one amino acid, in its colour (the code's key: "GCU = alanine") */
    aa1: '<circle class="aa aa1" cx="14" cy="7" r="4.6"/>', aa2: '<circle class="aa aa2" cx="14" cy="7" r="4.6"/>',
    aa3: '<circle class="aa aa3" cx="14" cy="7" r="4.6"/>', aa4: '<circle class="aa aa4" cx="14" cy="7" r="4.6"/>'
  };
  function keyOf(items) {
    var ul = h('ul', 'figkey anikey');
    ul.innerHTML = items.map(function (q) {
      var sw = q[0] === 'bases' ? '<span class="ak__bases" aria-hidden="true">' + q[3].split('').map(function (b) { return '<i class="ak__b ak__b--' + b + '">' + b + '</i>'; }).join('') + '</span>'
        : '<svg class="anikey__sw" viewBox="0 0 28 14" aria-hidden="true">' + SW[q[0]] + '</svg>';
      return '<li data-k="' + q[0] + '"' + (q[2] ? ' data-at=",' + q[2].join(',') + ',"' : '') + '>' + sw + L.esc(q[1]) + '</li>';
    }).join('');
    return ul;
  }
  function note(n) { return n.key ? keyOf(n.key) : h('p', 'widget__note' + (n[1] ? ' ' + n[1] : ''), n[0]); }
  function mount(S, sp, cls, notes, setLayout) {
    S.box.appendChild(sp.bar);
    var wrap = h('div', cls + '__wrap');
    /* on a wide screen the drawing stands in the plate's column; its read-outs and the steps stay here
       (Daniel, 26 Sep: "any animations move them to the left and then the text and the buttons on the right") */
    var pack = h('div', cls + '__pack');
    var packT = h('p', 'stg__title', L.esc(S.title)); packT.hidden = true;
    pack.appendChild(packT); pack.appendChild(S.fig);
    var left = h('div', cls + '__left'); left.appendChild(S.read); left.appendChild(pack);
    /* under the drawing, inside its figure (so it goes with it into the picture's column): the key, showing only what
       this step's picture shows, and any short line; nothing under the steps (Daniel, 5 Nov 2026: "put the keys on the
       left and show them when they need to be shown … Otherwise, the students are going to be like, well, what do you
       mean from the mother?") */
    var keys = [], keyK = -2;
    notes.forEach(function (n) { var el = note(n); S.fig.appendChild(el); if (n.key) keys.push(el); });
    function showKey(k) {
      if (k === keyK) return; keyK = k;
      keys.forEach(function (ul) {
        Array.prototype.forEach.call(ul.children, function (li) { var at = li.getAttribute('data-at'); li.hidden = !!at && at.indexOf(',' + k + ',') < 0; });
      });
    }
    /* the key keeps the height of its fullest step, so the words under it never jump when a step changes it */
    function sizeKey() {
      if (!keys.length) return;
      var k0 = keyK, mx = keys.map(function () { return 0; });
      keys.forEach(function (ul) { ul.style.minHeight = ''; });
      for (var k = 0; k < (sp.steps || 1); k++) { showKey(k); keys.forEach(function (ul, j) { mx[j] = Math.max(mx[j], ul.offsetHeight); }); }
      keys.forEach(function (ul, j) { ul.style.minHeight = mx[j] + 'px'; });
      showKey(k0 < 0 ? 0 : k0);
    }
    sp.onStep = showKey;
    S.fig.appendChild(sp.now);
    wrap.appendChild(left); wrap.appendChild(sp.list);
    S.box.appendChild(wrap);
    var lastD = 0, lastN = false;
    function fit() {
      var ww = wrap.getBoundingClientRect().width; if (!ww) return;
      wrap.classList.toggle(cls + '--side', ww >= 980);
      var D = S.fig.getBoundingClientRect().width, narrow = ww < 440;
      if (!D || (Math.abs(D - lastD) < 2 && narrow === lastN)) return;
      lastD = D; lastN = narrow; setLayout(D, narrow); sp.paint(sp.time()); sizeKey();
    }
    setLayout(700, false);
    var ro = global.ResizeObserver ? new ResizeObserver(function () { if (!S.box.isConnected) { ro.disconnect(); return; } fit(); }) : null;
    if (ro) { ro.observe(wrap); ro.observe(S.fig); }
    var stg = L.stage ? L.stage({ box: S.box, spec: S.spec, pack: pack, home: left, watch: function () { return S.box; },
      onPlace: function (inColumn) { packT.hidden = !inColumn; S.box.classList.toggle(cls + '--staged', inColumn); sp.compact(inColumn); lastD = 0; fit(); } }) : null;
    S.box.__onMove = function () { if (stg) stg.mount(); };
    S.box.__onReset = function () { sp.stop(); if (ro) ro.disconnect(); if (stg) stg.detach(); };
    S.box.__seek = function (t) { fit(); return sp.seek(t); };
    /* Play all's own clock, for the tools that time it (tools/flow-names.mjs) */
    S.box.__flow = sp.flow; S.box.__playEnd = sp.end;
    /* how long Play all waits on a step's names: the names NEW in it (one kept from the step before was read there),
       0.5 s to find the first, 0.3 s more for each other, and 1 s for every 4 of their words, with no upper limit (Daniel,
       5 Nov 2026: first "you can barely read them", then a middle pace; 7 Nov 2026: "consider how many labels you're
       putting, because that's how … much time the reader is going to take to read and process the information … rather
       than the person having to pause": the wait was at most 4 s, for any number of names). Next step still waits for as
       long as the reader likes */
    var namesAt = {};
    if (sp.flow) sp.flow.need = function (i) {
      var pk = S.fig.querySelector('.pinkey'), texts = [];
      if (pk && !pk.hidden) Array.prototype.forEach.call(pk.children, function (li) { texts.push(li.textContent.replace(/^\s*\d+\s*/, '')); });
      /* a widget with no drawing of names (the crosses' diagram, HTML) has none to wait for: without this test Play all
         stopped with an error at the end of its first step (6 Nov 2026) */
      else if (S.svg) Array.prototype.forEach.call(S.svg.querySelectorAll('.lb__txt'), function (tx) { var sp2 = tx.querySelectorAll('tspan'); texts.push(sp2.length ? Array.prototype.map.call(sp2, function (q) { return q.textContent; }).join(' ') : tx.textContent); });
      texts = texts.map(function (x) { return x.replace(/\s+/g, ' ').trim(); }).filter(function (x) { return x; });
      namesAt[i] = texts;
      return namesWait(texts, namesAt[i - 1]);
    };
    /* in a card, the animation plays all its steps as soon as its card opens (Daniel, 4 Nov 2026: "as soon as you open
       that, the full animation should play … if the user wants to go one by one or stop it, it just has to scroll
       down"); it pauses when the card closes or the widget is hidden (the IGCSE / IB switch), and plays again when
       shown in an open card. Reduced motion shows the last frame (the stepper's rule). */
    var waits = 0, card = null, wasOn = false;
    function shownOpen() { return !!card && card.classList.contains('is-open') && !S.box.hidden; }
    function react() {
      var on = shownOpen();
      if (on && !wasOn) sp.playAll();
      else if (!on && wasOn) { sp.stop(); sp.paint(sp.time()); }
      wasOn = on;
    }
    function watchCard() {
      if (!S.box.isConnected) { if (++waits < 240) requestAnimationFrame(watchCard); return; }
      card = S.box.closest ? S.box.closest('.xcard') : null;
      if (!card || !global.MutationObserver) return;
      var mo = new MutationObserver(function () { if (!S.box.isConnected) { mo.disconnect(); return; } react(); });
      mo.observe(card, { attributes: true, attributeFilter: ['class'] });
      mo.observe(S.box, { attributes: true, attributeFilter: ['hidden'] });
      react();
    }
    requestAnimationFrame(watchCard);
    sp.paint(0);
    return S.box;
  }


  global.WKit = { pinKey: pinKey, names: names, margins: margins, n1: n1, seg: seg, ease: ease, clamp01: clamp01, lerp: lerp, len: len, rng: rng, fitType: fitType,
                  readerClock: readerClock, readerFlow: readerFlow, readerSteps: readerSteps, namesWait: namesWait, frameOf: frameOf, drawLabels: drawLabels, shell: shell,
                  mount: mount, NS: NS };
})(window);
