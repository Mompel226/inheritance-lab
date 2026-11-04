/* ============================================================
   w-common.js — what this lab's animations share.

   CircLearn.stepper(opts)  the controls every step animation uses, the Plants Lab's pollen-tube
                            pattern: each step PLAYS, then HOLDS on its last frame until the reader
                            presses "Next step" (a continuous run was faster than an EAL reader can
                            read — Daniel, Sept 2026); "Play all" runs straight through for revision;
                            with reduced motion each press shows the next step's last frame, no timer.
       opts.steps   [{ t, h, p, tag? }]   start time (s), heading, one short paragraph
       opts.end     the last moment (s)
       opts.render  render(t) — must be a pure function of t, so any moment can be drawn on demand
       opts.rate    optional: a function returning how fast time runs (1 normal, 2 twice as fast)
       returns { bar, list, now, paint(t), seek(t), stop(), isStill(), compact(on) }
       compact(true): the steps become small chips, and the step's words stand in a panel right under
       them, for a widget whose drawing stands in the plate's column (Daniel, 26 Sep: "make the different
       stages smaller, and more compacted ... you can still click them. But you see the text on the right")

   CircLearn.labels(opts)   labels in two margins, each at its own part's height, joined to it by a
                            ruled horizontal leader. Horizontal leaders at different heights cannot
                            cross (Daniel: "never ever cross the labelling lines"), and each is ONE level
                            line: when two names would sit closer than a row, a name moves to another
                            point on its own part (`alts`), so its line stays level (18 Oct 2026); on a
                            phone too narrow for every name, a name beyond 0610 is left out first. Only a
                            picture that gives no other points still nudges its names, with a short jog.
   CircLearn.pinLabels(o)   the same labels on a phone: numbered discs on ruled leaders; and
   CircLearn.pinBand(...)   the numbered words, in a band above the drawing.
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn;
  var h = L.h, esc = L.esc;

  function clamp01(k) { return k < 0 ? 0 : k > 1 ? 1 : k; }
  function still() { return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  /* A step's words: **word** is an exam keyword, in bold (Daniel, 27 Sep: "bolden the keywords required for any
     IGCSE explanations"); the rest is marked as every sentence in the lab is (syllabus underlines, glossary). */
  function stepText(t) {
    return String(t).split(/\*\*([^*]+)\*\*/).map(function (seg, i) { return i % 2 ? '<b class="sp__kw">' + esc(seg) + '</b>' : L.mk(seg); }).join('');
  }
  function stepper(opts) {
    var STEPS = opts.steps, END = opts.end, render = opts.render;
    var bar = h('div', 'sp__bar');
    var play = h('button', 'sp__play'); play.type = 'button';
    var all = h('button', 'sp__all', '<span class="sp__ico" aria-hidden="true">▶▶</span> Play all'); all.type = 'button';
    var prog = h('div', 'sp__prog'); prog.setAttribute('aria-hidden', 'true');
    function stepEnd(i) { return i + 1 < STEPS.length ? STEPS[i + 1].t : END; }
    STEPS.forEach(function (st, i) {
      var sg = h('span', 'sp__seg', '<i></i>');
      sg.style.flexGrow = Math.max(.5, stepEnd(i) - st.t).toFixed(2);
      sg.addEventListener('click', function () { goStep(i); });
      prog.appendChild(sg);
    });
    var count = h('span', 'sp__count');
    bar.appendChild(play); bar.appendChild(all); bar.appendChild(prog); bar.appendChild(count);

    var list = h('ol', 'sp__steps');
    STEPS.forEach(function (st, i) {
      var li = h('li', 'sp__step');
      var b = h('button', 'sp__stepb', '<span class="sp__num">' + (i + 1) + '</span><span class="sp__txt"><b>' + esc(st.h) + '</b>' +
        (st.tag ? ' <span class="sp__tag">' + esc(st.tag) + '</span>' : '') + '<span class="sp__p">' + stepText(st.p) + '</span></span>');
      b.type = 'button';
      b.addEventListener('click', function () { goStep(i); });
      li.appendChild(b); list.appendChild(li);
    });
    var now = h('p', 'sp__now'); now.setAttribute('aria-live', 'polite');

    var T = 0, playing = false, raf = null, last = null, started = false, stopAt = null;
    function stepAt(t) { var k = 0; for (var i = 0; i < STEPS.length; i++) if (t >= STEPS[i].t - 1e-6) k = i; return k; }
    function segEnd(i) { return i + 1 < STEPS.length ? STEPS[i + 1].t - .02 : END; }
    function atStepEnd() { return started && !playing && stopAt != null && T >= stopAt - 1e-3; }
    function paint(t) {
      render(t);
      var k = stepAt(t), done = t >= END - 1e-6;
      Array.prototype.forEach.call(list.children, function (li, i) {
        li.classList.toggle('is-on', started && i === k);
        li.classList.toggle('is-done', started && (i < k || (done && i === k)));
      });
      Array.prototype.forEach.call(prog.children, function (sg, i) {
        var a = STEPS[i].t, b = stepEnd(i);
        sg.firstChild.style.width = (started ? clamp01((t - a) / Math.max(.001, b - a)) * 100 : 0).toFixed(1) + '%';
        sg.classList.toggle('is-on', started && i === k);
      });
      count.textContent = started ? 'Step ' + (k + 1) + ' of ' + STEPS.length : STEPS.length + ' steps';
      /* the step's words under the drawing: read aloud to a screen reader, and shown when the
         step list is stacked below the drawing (a narrow widget), so they are never a scroll away */
      var nt = started ? '<b class="sp__nowh">Step ' + (k + 1) + ' of ' + STEPS.length + ' · ' + esc(STEPS[k].h) + '</b>' +
        (STEPS[k].tag ? '<span class="sp__tag sp__nowtag">' + esc(STEPS[k].tag) + '</span> ' : ' ') + stepText(STEPS[k].p) : '<b class="sp__nowh">Press Play</b> to start. Each step stops until you press Next step.';
      if (now.getAttribute('data-k') !== String(started ? k : -1)) { now.innerHTML = nt; now.setAttribute('data-k', String(started ? k : -1)); }
      sync();
    }
    function sync() {
      var ended = T >= END - 1e-3, next = atStepEnd() && !ended;
      play.innerHTML = playing ? '<span class="sp__ico" aria-hidden="true">❚❚</span> Pause'
        : ended ? '<span class="sp__ico" aria-hidden="true">↻</span> Play again'
        : !started ? '<span class="sp__ico" aria-hidden="true">▶</span> Play'
        : next ? '<span class="sp__ico" aria-hidden="true">▶</span> Next step'
        : '<span class="sp__ico" aria-hidden="true">▶</span> Resume';
      play.classList.toggle('is-playing', playing);
      play.classList.toggle('is-next', next);
      all.hidden = still();
    }
    function stop() { playing = false; if (raf) cancelAnimationFrame(raf); raf = null; }
    function frame(ts) {
      if (!bar.isConnected) { stop(); return; }
      if (last == null) last = ts;
      var lim = stopAt == null ? END : stopAt;
      T = Math.min(lim, T + Math.min(.1, (ts - last) / 1000) * (opts.rate ? opts.rate() : 1)); last = ts;
      if (T >= lim) { playing = false; raf = null; paint(T); if (opts.onHold) opts.onHold(stepAt(T)); return; }
      paint(T);
      raf = requestAnimationFrame(frame);
    }
    function run(from, to) {
      stop(); started = true; stopAt = to;
      if (opts.onStart) opts.onStart();
      if (still()) { T = to; paint(T); return; }
      T = from; playing = true; last = null; paint(T);
      raf = requestAnimationFrame(frame);
    }
    function goStep(i) { run(STEPS[i].t, segEnd(i)); }
    play.addEventListener('click', function () {
      if (playing) { stop(); paint(T); return; }
      if (!started || T >= END - 1e-3) { goStep(0); return; }
      if (atStepEnd()) { goStep(stepAt(T) + 1); return; }
      run(T, stopAt == null ? segEnd(stepAt(T)) : stopAt);
    });
    all.addEventListener('click', function () {
      var from = !started || T >= END - 1e-3 ? 0 : atStepEnd() ? STEPS[stepAt(T) + 1].t : T;
      run(from, END);
    });
    /* the words go under the chips, and come back to wherever the widget put them */
    var nowHome = null, nowNext = null;
    function compact(on) {
      on = !!on;
      list.classList.toggle('sp__steps--chips', on);
      now.classList.toggle('sp__now--panel', on);
      if (on) {
        if (!nowHome && now.parentNode) { nowHome = now.parentNode; nowNext = now.nextSibling; }
        if (list.parentNode && list.nextSibling !== now) list.parentNode.insertBefore(now, list.nextSibling);
      } else if (nowHome) {
        nowHome.insertBefore(now, nowNext && nowNext.parentNode === nowHome ? nowNext : null);
        nowHome = null; nowNext = null;
      }
    }
    return {
      bar: bar, list: list, now: now, paint: paint, stop: stop, isStill: still, compact: compact,
      time: function () { return T; },
      seek: function (t) { stop(); started = t > 0; stopAt = null; T = Math.max(0, Math.min(END, t)); paint(T); return STEPS.map(function (s) { return s.t; }); }
    };
  }

  /* ---------- each name a full row from the next, every line level ----------
     it: one margin's names, top to bottom, each { x, y, h, alts?, off? }. `alts` are other points ON
     the same part (for the three drawings, found from the drawing itself: labs/cells-lab-source/label-points.mjs);
     `off` says the item's own point is not on its part, so it is never used. Each name keeps its own point when the
     names fit; otherwise the choice of points that moves the names least, in the order given, each a full row
     (h/2 + gap + h/2) from the next and inside top…bottom. Returns that choice's cost, or -1 when no choice fits;
     with `apply`, sets each item's x, y and ly to its point. */
  function levelRows(it, top, bot, gap, apply) {
    var n = it.length, i, j, k;
    if (!n) return 0;
    var C = it.map(function (x) {
      var c = x.off ? [] : [{ x: x.x, y: x.y, c: 0 }];
      (x.alts || []).forEach(function (p) { c.push({ x: p[0], y: p[1], c: Math.abs(p[1] - x.y) + 0.5 }); });
      return c.filter(function (p) { return p.y - x.h / 2 >= top - 1e-6 && p.y + x.h / 2 <= bot + 1e-6; })
              .sort(function (a, b) { return a.y - b.y; });
    });
    var best = [], from = [];
    for (i = 0; i < n; i++) {
      if (!C[i].length) return -1;
      best[i] = []; from[i] = [];
      var P = C[i - 1], s = i ? it[i - 1].h / 2 + gap + it[i].h / 2 : 0, m = Infinity, mk = -1;
      k = 0;
      for (j = 0; j < C[i].length; j++) {
        if (!i) { best[i][j] = C[i][j].c; from[i][j] = -1; continue; }
        while (k < P.length && P[k].y <= C[i][j].y - s + 1e-6) { if (best[i - 1][k] < m) { m = best[i - 1][k]; mk = k; } k++; }
        best[i][j] = m + C[i][j].c; from[i][j] = mk;
      }
    }
    var jb = -1;
    for (j = 0; j < C[n - 1].length; j++) if (best[n - 1][j] < Infinity && (jb < 0 || best[n - 1][j] < best[n - 1][jb])) jb = j;
    if (jb < 0) return -1;
    var cost = best[n - 1][jb];
    if (apply) for (i = n - 1; i >= 0; i--) { var pt = C[i][jb]; it[i].x = pt.x; it[i].y = it[i].ly = pt.y; jb = from[i][jb]; }
    return cost;
  }
  /* The cheapest way to stand these names on level lines: in their parts' order first; when that cannot fit, in any
     order (level lines never cross, so the order is free; up to 7 names, every order is tried). Returns { cost, order }
     or null. */
  function bestRows(it, top, bot, gap) {
    var c = levelRows(it, top, bot, gap, false);
    if (c >= 0) return { cost: c, order: it };
    if (it.length > 7) return null;
    var a = it.slice(), n = a.length, ix = [], i = 1, best = null, t;
    function look() { var k = levelRows(a, top, bot, gap, false); if (k >= 0 && (!best || k < best.cost)) best = { cost: k, order: a.slice() }; }
    for (t = 0; t < n; t++) ix[t] = 0;
    look();
    while (i < n) {   /* Heap's algorithm: every order of the names, one swap at a time */
      if (ix[i] < i) { t = i % 2 ? ix[i] : 0; var sw = a[t]; a[t] = a[i]; a[i] = sw; look(); ix[i]++; i = 1; }
      else { ix[i] = 0; i++; }
    }
    return best;
  }
  /* The names of one margin, each on a level line: all of them when some choice of points fits, otherwise fewer.
     Daniel's rule for a crowded picture (the Circulation Lab plate, 25 Sep 2026): "a name that finds no free row is
     left out, not squeezed in": the fewest names are left out, those beyond 0610 (`opt`) first, so a very narrow
     phone shows the bacterium's cell wall rather than its capsule. Returns the names to draw, top to bottom, or null
     when the picture gives no other points (or would lose half its names): those are nudged apart as before, with a
     jog. */
  function placeRows(it, top, bot, gap) {
    if (!it.some(function (x) { return x.off || (x.alts && x.alts.length); })) return null;
    var cur = it.slice();
    while (cur.length * 2 >= it.length) {
      var fit = bestRows(cur, top, bot, gap);
      if (fit) {
        levelRows(fit.order, top, bot, gap, true);
        return fit.order.slice().sort(function (p, q) { return p.ly - q.ly; });
      }
      var pool = cur.filter(function (x) { return x.opt; });
      if (!pool.length) pool = cur;
      var out = null, oc = Infinity;
      pool.forEach(function (x) {
        var f = bestRows(cur.filter(function (y) { return y !== x; }), top, bot, gap);
        if (f && f.cost < oc) { oc = f.cost; out = x; }
      });
      cur = cur.filter(function (y) { return y !== (out || pool[pool.length - 1]); });
    }
    return null;
  }

  /* ---------- labels in two margins, leaders ruled level ----------
     opts: { items: [{ id, text, x, y, side: 'L'|'R', alts?, off?, opt? }], left: x of the left margin's inner edge,
             right: x of the right margin's inner edge, font, top, bottom, gap }
     returns the SVG markup. Text wraps to `width` units. */
  function labels(o) {
    var font = o.font || 16, lh = font * 1.18, gap = o.gap == null ? 5 : o.gap, out = '';
    function wrap(t, w) {
      var words = String(t).split(' '), lines = [], cur = '';
      words.forEach(function (wd) { var tr = cur ? cur + ' ' + wd : wd; if (tr.length * font * .52 > w && cur) { lines.push(cur); cur = wd; } else cur = tr; });
      if (cur) lines.push(cur);
      return lines;
    }
    ['L', 'R'].forEach(function (side) {
      var it = o.items.filter(function (x) { return x.side === side && !x.hidden; }).map(function (x) {
        var lines = wrap(x.text, o.width || 110);
        return { x: x.x, y: x.y, ly: x.y, lines: lines, h: lines.length * lh, id: x.id, cls: x.cls || '', op: x.op == null ? 1 : x.op, alts: x.alts, off: x.off, opt: x.opt };
      }).sort(function (a, b) { return a.y - b.y; });
      var i;
      var top = o.top == null ? -1e9 : o.top, bot = o.bottom == null ? 1e9 : o.bottom;
      var kept = placeRows(it, top, bot, gap);
      if (kept) it = kept;
      else {
        /* no level arrangement (a picture that gives no other points, or would lose half its names): the names are
           nudged apart in their parts' order, each with a short jog */
        if (it.length && it[0].ly - it[0].h / 2 < top) it[0].ly = top + it[0].h / 2;
        for (i = 1; i < it.length; i++) { var lo = it[i - 1].ly + it[i - 1].h / 2 + gap + it[i].h / 2; if (it[i].ly < lo) it[i].ly = lo; }
        for (i = it.length - 1; i >= 0; i--) {
          var hi = i === it.length - 1 ? bot - it[i].h / 2 : it[i + 1].ly - it[i + 1].h / 2 - gap - it[i].h / 2;
          if (it[i].ly > hi) it[i].ly = hi;
        }
      }
      it.forEach(function (x) {
        var edge = side === 'L' ? o.left : o.right, dir = side === 'L' ? -1 : 1;
        var jog = Math.abs(x.ly - x.y) > .5;
        var d = 'M' + f2(x.x) + ' ' + f2(x.y) + 'L' + f2(edge) + ' ' + f2(x.y) + (jog ? 'L' + f2(edge + dir * 6) + ' ' + f2(x.ly) : '') + 'L' + f2(edge + dir * 9) + ' ' + f2(x.ly);
        var tx = edge + dir * 13, anchor = side === 'L' ? 'end' : 'start', y0 = x.ly - x.h / 2 + font * .84;
        out += '<g class="lb ' + x.cls + '" data-lab="' + esc(x.id || '') + '" opacity="' + x.op + '">' +
          '<path class="lb__halo" d="' + d + '"/><path class="lb__lead" d="' + d + '"/><circle class="lb__dot" cx="' + f2(x.x) + '" cy="' + f2(x.y) + '" r="' + (font * .16).toFixed(2) + '"/>' +
          '<text class="lb__txt" x="' + f2(tx) + '" y="' + f2(y0) + '" text-anchor="' + anchor + '" style="font-size:' + font + 'px">' +
          x.lines.map(function (ln, k) { return '<tspan x="' + f2(tx) + '" dy="' + (k ? f2(lh) : 0) + '">' + esc(ln) + '</tspan>'; }).join('') + '</text></g>';
      });
    });
    return out;
  }
  function f2(v) { return Math.round(v * 100) / 100; }

  /* ---------- the same labels on a phone: numbered pins, words in a band ----------
     Below about 520 px a column of words beside the drawing shrinks to a few pixels. So each
     label becomes a numbered disc in a narrow margin, joined to its part by the same ruled
     horizontal leader (so leaders still never cross), and the words go in a numbered list in a
     band above the drawing — the Plants Lab's rule for its animations on a phone.
     pinLabels(o): o as for labels(), with left/right the inner edges of the two pin columns.
       returns { svg, order: [{ n, text, cls }] } — number 1 is the top of the left column. */
  function pinLabels(o) {
    var font = o.font || 18, r = font * .72, gap = o.gap == null ? 4 : o.gap, out = '', order = [];
    ['L', 'R'].forEach(function (side) {
      var it = o.items.filter(function (x) { return x.side === side && !x.hidden; }).map(function (x) {
        return { x: x.x, y: x.y, ly: x.y, h: 2 * r, id: x.id, text: x.text, cls: x.cls || '', op: x.op == null ? 1 : x.op, alts: x.alts, off: x.off, opt: x.opt };
      }).sort(function (a, b) { return a.y - b.y; });
      var i, top = o.top == null ? -1e9 : o.top, bot = o.bottom == null ? 1e9 : o.bottom;
      var kept = placeRows(it, top, bot, gap);
      if (kept) it = kept;
      else {
        /* no level arrangement (a picture that gives no other points, or would lose half its names): the pins are
           nudged apart in their parts' order, each with a short jog */
        if (it.length && it[0].ly - r < top) it[0].ly = top + r;
        for (i = 1; i < it.length; i++) { var lo = it[i - 1].ly + 2 * r + gap; if (it[i].ly < lo) it[i].ly = lo; }
        for (i = it.length - 1; i >= 0; i--) { var hi = i === it.length - 1 ? bot - r : it[i + 1].ly - 2 * r - gap; if (it[i].ly > hi) it[i].ly = hi; }
      }
      it.forEach(function (x) {
        var n = order.length + 1, edge = side === 'L' ? o.left : o.right, dir = side === 'L' ? -1 : 1;
        var jog = Math.abs(x.ly - x.y) > .5, cx = edge + dir * (r + 8);
        var d = 'M' + f2(x.x) + ' ' + f2(x.y) + 'L' + f2(edge) + ' ' + f2(x.y) + (jog ? 'L' + f2(edge + dir * 5) + ' ' + f2(x.ly) : '') + 'L' + f2(cx - dir * r) + ' ' + f2(x.ly);
        out += '<g class="lb lb--pin ' + x.cls + '" data-lab="' + esc(x.id || '') + '" opacity="' + x.op + '">' +
          '<path class="lb__halo" d="' + d + '"/><path class="lb__lead" d="' + d + '"/><circle class="lb__dot" cx="' + f2(x.x) + '" cy="' + f2(x.y) + '" r="' + (font * .16).toFixed(2) + '"/>' +
          '<circle class="lb__pin" cx="' + f2(cx) + '" cy="' + f2(x.ly) + '" r="' + f2(r) + '"/>' +
          '<text class="lb__pinn" x="' + f2(cx) + '" y="' + f2(x.ly + font * .3) + '" text-anchor="middle" style="font-size:' + f2(font * .82) + 'px">' + n + '</text></g>';
        order.push({ n: n, text: x.text, cls: x.cls });
      });
    });
    return { svg: out, order: order };
  }
  /* the numbered words, in columns, from (x, y) down, inside width w. Returns { svg, h }. */
  function pinBand(order, x, y, w, font, cols) {
    cols = cols || 2;
    var lh = font * 1.25, colW = w / cols, per = Math.ceil(order.length / cols), out = '';
    order.forEach(function (it, i) {
      var c = Math.floor(i / per), k = i % per;
      out += '<text class="lb__band ' + (it.cls || '') + '" x="' + f2(x + c * colW) + '" y="' + f2(y + font + k * lh) + '" style="font-size:' + font + 'px">' +
        '<tspan class="lb__bandn">' + it.n + '</tspan> ' + esc(it.text) + '</text>';
    });
    return { svg: out, h: per * lh + font * .6 };
  }

  L.stepper = stepper;
  L.labels = labels;
  L.pinLabels = pinLabels;
  L.pinBand = pinBand;
  L.clamp01 = clamp01;
  L.still = still;
})(window);
