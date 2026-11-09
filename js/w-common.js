/* ============================================================
   w-common.js — what this lab's animations share.

   CircLearn.stepper(opts)  the controls every step animation uses, the Plants Lab's pollen-tube
                            pattern: each step PLAYS, then HOLDS on its last frame until the reader
                            presses "Next step" (a continuous run was faster than an EAL reader can
                            read — Daniel, Sept 2026); "Play all" runs straight through for revision;
                            with Reduce motion nothing moves and nothing is lost (Daniel, 9 Nov 2026: "Nothing
                            should disappear"): each press shows that step's ONE still, holding every part and name
                            the step shows while it moves, and Play all shows the stills in turn, each for its band.
       opts.steps   [{ t, h, p, tag? }]   start time (s), heading, one short paragraph
       opts.end     the last moment (s)
       opts.render  render(t) — must be a pure function of t, so any moment can be drawn on demand; with Reduce
                    motion render(t, { step, from, to }): the still of that step, which a widget may give the names that
                    came and went between from and to
       opts.stills  optional, with Reduce motion: each step's still time (an array, or a function of the step), a
                    moment at which every part and name of the step shows; else where the step stops
       opts.rate    optional: a function returning how fast time runs (1 normal, 2 twice as fast)
       opts.flow    optional: flow(t) → the time Play all goes on from (a step's reading hold is skipped, so Play all
                    runs straight through: Daniel, 4 Nov 2026, "the whole animation should flow … I can always press
                    pause to read")
       returns { bar, list, now, paint(t), seek(t), stop(), playAll(), isStill(), compact(on) }
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
  /* A step's words in parts, each marked with its level (Daniel, 8 Nov 2026: "make sure that in the step message that you
     show, exactly what is IGCSE and what is IB and what is beyond … It needs to be very, very clear"): p is a string, or
     [[lv, text], …] with lv 'ig' (in the 0610 syllabus: learn it), 'ib' (not in the 0610 syllabus; in IB Biology),
     'ibhl' (the same, IB Higher Level only) or 'bey' (in neither syllabus) */
  var LV = { ig: 'IGCSE', ib: 'IB', ibhl: 'IB HL', bey: 'Beyond' };
  function stepWords(p) {
    if (!Array.isArray(p)) return stepText(p);
    return p.map(function (q) { return '<span class="sp__lv sp__lv--' + q[0] + '"><b class="sp__lvt">' + LV[q[0]] + '</b> ' + stepText(q[1]) + '</span>'; }).join('');
  }
  function stepper(opts) {
    var STEPS = opts.steps, END = opts.end, render = opts.render;
    var bar = h('div', 'sp__bar');
    var play = h('button', 'sp__play'); play.type = 'button';
    var all = h('button', 'sp__all', '<span class="sp__ico" aria-hidden="true">▶▶</span> Play all'); all.type = 'button';
    var prog = h('div', 'sp__prog'); prog.setAttribute('aria-hidden', 'true');
    function stepEnd(i) { return i + 1 < STEPS.length ? STEPS[i + 1].t : END; }
    /* each band as wide as the time its step lasts (Daniel, 8 Nov 2026: "make sure that the size of the band indicates
       the time that it's there"); a step's times come from its widget (WKit.timeline) */
    STEPS.forEach(function (st, i) {
      var sg = h('span', 'sp__seg', '<i></i>');
      sg.style.flexGrow = Math.max(.3, stepEnd(i) - st.t).toFixed(2);
      sg.addEventListener('click', function () { goStep(i); });
      prog.appendChild(sg);
    });
    var count = h('span', 'sp__count');
    bar.appendChild(play); bar.appendChild(all); bar.appendChild(prog); bar.appendChild(count);

    var list = h('ol', 'sp__steps');
    /* a step with no IGCSE line says so on its button, in its level's colour, before it is opened */
    function onlyLv(st) { return Array.isArray(st.p) && !st.p.some(function (q) { return q[0] === 'ig'; }) ? st.p[0][0] : null; }
    STEPS.forEach(function (st, i) {
      var li = h('li', 'sp__step'), ol = onlyLv(st);
      if (ol) li.classList.add('sp__step--' + ol);
      var b = h('button', 'sp__stepb', '<span class="sp__num">' + (i + 1) + '</span><span class="sp__txt"><b>' + esc(st.h) + '</b>' +
        (ol ? ' <span class="sp__only sp__lv--' + ol + '">' + LV[ol] + ' only</span>' : '') +
        (st.tag ? ' <span class="sp__tag">' + esc(st.tag) + '</span>' : '') + '<span class="sp__p">' + stepWords(st.p) + '</span></span>');
      b.type = 'button';
      b.addEventListener('click', function () { goStep(i); });
      li.appendChild(b); list.appendChild(li);
    });
    var now = h('p', 'sp__now'); now.setAttribute('aria-live', 'polite');
    /* steps in level-marked parts: the key to the marks this animation uses, once, above the steps */
    var used = {}; STEPS.forEach(function (st) { if (Array.isArray(st.p)) st.p.forEach(function (q) { used[q[0] === 'ibhl' ? 'ib' : q[0]] = 1; }); });
    var hl = STEPS.some(function (st) { return Array.isArray(st.p) && st.p.some(function (q) { return q[0] === 'ibhl'; }); });
    var legend = Object.keys(used).length ? h('p', 'sp__legend',
      (used.ig ? '<span class="sp__lv sp__lv--ig"><b class="sp__lvt">IGCSE</b> in the 0610 syllabus: learn these lines</span>' : '') +
      (used.ib ? '<span class="sp__lv sp__lv--ib"><b class="sp__lvt">IB</b> not in the 0610 syllabus; in IB Biology' + (hl ? ' (IB HL: Higher Level only)' : '') + '</span>' : '') +
      (used.bey ? '<span class="sp__lv sp__lv--bey"><b class="sp__lvt">Beyond</b> in neither syllabus</span>' : '')) : null;

    var T = 0, playing = false, raf = null, last = null, started = false, stopAt = null;
    /* Reduce motion: the step whose still is drawn (-1: none, the time T itself), and Play all's timer */
    var stillK = -1, slideT = null, allMode = false;
    function stillT(i) { var s = opts.stills, v = typeof s === 'function' ? s(i) : s ? s[i] : null; return v == null ? segEnd(i) : v; }
    function stepAt(t) { var k = 0; for (var i = 0; i < STEPS.length; i++) if (t >= STEPS[i].t - 1e-6) k = i; return k; }
    function segEnd(i) { return opts.flow && opts.flow.endOf ? Math.min(i + 1 < STEPS.length ? STEPS[i + 1].t - .02 : END, opts.flow.endOf(i)) : i + 1 < STEPS.length ? STEPS[i + 1].t - .02 : END; }
    function atStepEnd() { return started && !playing && stopAt != null && T >= stopAt - 1e-3; }
    /* the animation is over once the last step's motion has run (a single step stops there; Play all reads its names) */
    function over(t) { return t >= segEnd(STEPS.length - 1) - 1e-3; }
    function paint(t) {
      if (stillK > -1) render(stillT(stillK), { step: stillK, from: STEPS[stillK].t, to: segEnd(stillK), prev: stillK ? stillT(stillK - 1) : null }); else render(t);
      var k = stepAt(t), done = over(t);
      /* whoever shows what belongs to a step (an animation's key) hears the step: api.onStep(k) */
      if (api && api.onStep) api.onStep(k);
      Array.prototype.forEach.call(list.children, function (li, i) {
        li.classList.toggle('is-on', started && i === k);
        li.classList.toggle('is-done', started && (i < k || (done && i === k)));
      });
      Array.prototype.forEach.call(prog.children, function (sg, i) {
        /* full when the step's motion has run, where a single step stops (Daniel, 8 Nov 2026: the band stopped half full,
           "this makes me feel that something is missing in the animation"); in Play all it stays full while the names are read */
        var a = STEPS[i].t, b = segEnd(i);
        sg.firstChild.style.width = (started ? clamp01((t - a) / Math.max(.001, b - a)) * 100 : 0).toFixed(1) + '%';
        sg.classList.toggle('is-on', started && i === k);
      });
      count.textContent = started ? 'Step ' + (k + 1) + ' of ' + STEPS.length : STEPS.length + ' steps';
      /* the step's words under the drawing: read aloud to a screen reader, and shown when the
         step list is stacked below the drawing (a narrow widget), so they are never a scroll away */
      var nt = started ? '<b class="sp__nowh">Step ' + (k + 1) + ' of ' + STEPS.length + ' · ' + esc(STEPS[k].h) + '</b>' +
        (STEPS[k].tag ? '<span class="sp__tag sp__nowtag">' + esc(STEPS[k].tag) + '</span> ' : ' ') + stepWords(STEPS[k].p) : '<b class="sp__nowh">Press Play</b> to start. Each step stops until you press Next step.';
      if (now.getAttribute('data-k') !== String(started ? k : -1)) { now.innerHTML = nt; now.setAttribute('data-k', String(started ? k : -1)); }
      sync();
    }
    function sync() {
      var ended = over(T) && !playing, next = atStepEnd() && !ended;
      play.innerHTML = playing ? '<span class="sp__ico" aria-hidden="true">❚❚</span> Pause'
        : ended ? '<span class="sp__ico" aria-hidden="true">↻</span> Play again'
        : !started ? '<span class="sp__ico" aria-hidden="true">▶</span> Play'
        : next ? '<span class="sp__ico" aria-hidden="true">▶</span> Next step'
        : '<span class="sp__ico" aria-hidden="true">▶</span> Resume';
      play.classList.toggle('is-playing', playing);
      play.classList.toggle('is-next', next);
    }
    function stop() { playing = false; if (raf) cancelAnimationFrame(raf); raf = null; if (slideT) { clearTimeout(slideT); slideT = null; } }
    /* Play all with Reduce motion: each step's still in turn, held for its band's time; no motion inside a still */
    function slides(i) {
      stillK = i; T = segEnd(i); playing = true; paint(T);
      slideT = setTimeout(function () {
        slideT = null;
        if (!bar.isConnected) { stop(); return; }
        if (i + 1 < STEPS.length) slides(i + 1); else { playing = false; paint(T); }
      }, Math.max(1500, (stepEnd(i) - STEPS[i].t) * 1000));
    }
    function frame(ts) {
      if (!bar.isConnected) { stop(); return; }
      if (last == null) last = ts;
      var lim = stopAt == null ? END : stopAt;
      T = Math.min(lim, T + Math.min(.1, (ts - last) / 1000) * (opts.rate ? opts.rate() : 1)); last = ts;
      if (opts.flow && stopAt === END) T = Math.min(lim, Math.max(T, opts.flow(T)));
      if (T >= lim) { playing = false; raf = null; paint(T); if (opts.onHold) opts.onHold(stepAt(T)); return; }
      paint(T);
      raf = requestAnimationFrame(frame);
    }
    function run(from, to, whole) {
      stop(); started = true; stopAt = to; allMode = !!whole;
      if (opts.onStart) opts.onStart();
      /* Reduce motion: no movement, but the step's still (or, for Play all, every step's still in turn) */
      if (still()) { if (whole) slides(stepAt(from)); else { T = to; stillK = stepAt(to); paint(T); } return; }
      stillK = -1;
      T = from; playing = true; last = null; paint(T);
      raf = requestAnimationFrame(frame);
    }
    function goStep(i) { run(STEPS[i].t, segEnd(i)); }
    play.addEventListener('click', function () {
      if (playing) { stop(); paint(T); return; }
      if (!started || over(T)) { goStep(0); return; }
      if (atStepEnd()) { goStep(stepAt(T) + 1); return; }
      run(T, stopAt == null ? segEnd(stepAt(T)) : stopAt, allMode);
    });
    all.addEventListener('click', function () {
      var from = !started || over(T) ? 0 : atStepEnd() ? STEPS[stepAt(T) + 1].t : T;
      run(from, END, true);
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
    var api = {
      bar: bar, list: list, now: now, legend: legend, paint: paint, stop: stop, isStill: still, compact: compact,
      playAll: function () { run(0, END); }, playing: function () { return playing; },
      time: function () { return T; },
      seek: function (t) { stop(); stillK = -1; started = t > 0; stopAt = null; T = Math.max(0, Math.min(END, t)); paint(T); return STEPS.map(function (s) { return s.t; }); },
      onStep: null, steps: STEPS.length, flow: opts.flow || null, end: END
    };
    return api;
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
    /* a still (Reduce motion) keeps every name: level rows when they all fit, else every name nudged apart, never one left
       out (Daniel, 9 Nov 2026: "Nothing should disappear") */
    if (it.some(function (x) { return x.all; })) {
      var all = bestRows(it, top, bot, gap);
      if (!all) return null;
      levelRows(all.order, top, bot, gap, true);
      return all.order.slice().sort(function (p, q) { return p.ly - q.ly; });
    }
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
        return { x: x.x, y: x.y, ly: x.y, lines: lines, h: lines.length * lh, id: x.id, cls: x.cls || '', op: x.op == null ? 1 : x.op, alts: x.alts, off: x.off, opt: x.opt, all: x.all };
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
    return out + bandSvg(o, 'T') + bandSvg(o, 'B');
  }
  function f2(v) { return Math.round(v * 100) / 100; }

  /* ---------- names above or below the drawing: an item's side 'T' or 'B' (opt-in, 5 Nov 2026) ----------
     Where a level line from either side would run across other parts (a row of chromosome pairs, the columns of a table),
     the name stands in a band above ('T') or below ('B') the drawing, over its own part, joined to it by ONE upright line
     that ends ON the part (Daniel, 5 Nov 2026: "put it at the top if you need it … They can be on the top"). Upright
     lines at different x cannot cross; each name stands over its own line, and names in a band keep a clear gap, so two
     never read as one phrase. An item may give `mid`, where its name would like its middle (a pair named from one
     chromosome's tip, its name centred over the pair). A band never moves a line: `alts` are not used here. Nothing
     changes for a call that passes only 'L' and 'R' items; 'T' and 'B' items are drawn only when the call gives the
     band's place: o.bandT (the y where the top band's lines end, its names above it), o.bandB (the same below), and
     o.bandL … o.bandR (the band's width; the margins' inner edges when not given). */
  var CH = .58;   /* a letter's width, as a share of the font: the measure the bands keep names apart by */
  function wrapCh(t, n) {
    var lines = [], cur = '';
    String(t).split(' ').forEach(function (wd) { var tr = cur ? cur + ' ' + wd : wd; if (tr.length > n && cur) { lines.push(cur); cur = wd; } else cur = tr; });
    if (cur) lines.push(cur);
    return lines;
  }
  /* boxes of widths w, as near their preferred middles p (in order) as a clear gap allows, inside lo … hi: the
     least-squares choice (pool-adjacent-violators), then pushed inside the band. Returns the middles, or null. */
  function spread(p, w, gap, lo, hi) {
    var n = p.length, S = [0], i, blocks = [], c = [], k = 0;
    for (i = 1; i < n; i++) S[i] = S[i - 1] + (w[i - 1] + w[i]) / 2 + gap;
    for (i = 0; i < n; i++) {
      blocks.push({ v: p[i] - S[i], n: 1 });
      while (blocks.length > 1 && blocks[blocks.length - 2].v > blocks[blocks.length - 1].v) {
        var b = blocks.pop(), a = blocks[blocks.length - 1];
        a.v = (a.v * a.n + b.v * b.n) / (a.n + b.n); a.n += b.n;
      }
    }
    blocks.forEach(function (bl) { for (var j = 0; j < bl.n; j++, k++) c[k] = bl.v + S[k]; });
    for (i = 0; i < n; i++) c[i] = Math.max(c[i], lo + w[i] / 2, i ? c[i - 1] + (w[i - 1] + w[i]) / 2 + gap : -Infinity);
    for (i = n - 1; i >= 0; i--) c[i] = Math.min(c[i], hi - w[i] / 2, i < n - 1 ? c[i + 1] - (w[i] + w[i + 1]) / 2 - gap : Infinity);
    for (i = 0; i < n; i++) if (c[i] - w[i] / 2 < lo - 1e-6 || (i && c[i] - c[i - 1] < (w[i - 1] + w[i]) / 2 + gap - 1e-6)) return null;
    return c;
  }
  /* one band's names: each wrapped as wide as the band allows (fewest lines), its middle as near its part as the others
     allow, and its own line under it. Returns { at: [{ it, lines, c, w }], lines (the most of any name), fits }; when no
     wrapping fits, a name beyond 0610 (`opt`) is left out first, and failing that the narrowest wrapping is returned with
     fits false (the figure then uses numbered pins). */
  function band(items, o) {
    var font = o.font || 16, gap = o.gap == null ? font * 1.2 : o.gap;
    var lo = o.bandL == null ? o.left : o.bandL, hi = o.bandR == null ? o.right : o.bandR;
    var it = items.slice().sort(function (a, b) { return (a.mid != null ? a.mid : a.x) - (b.mid != null ? b.mid : b.x); });
    if (!it.length) return { at: [], lines: 0, fits: true };
    var longest = it.reduce(function (n, x) { return Math.max(n, String(x.text).split(' ').reduce(function (k, wd) { return Math.max(k, wd.length); }, 0)); }, 1);
    function tryWrap(n) {
      var L = it.map(function (x) { return wrapCh(x.text, n); });
      var w = L.map(function (ls) { return ls.reduce(function (k, s) { return Math.max(k, s.length); }, 0) * font * CH; });
      var c = spread(it.map(function (x) { return x.mid != null ? x.mid : x.x; }), w, gap, lo, hi);
      var ok = !!c && it.every(function (x, i) { var e = Math.min(w[i] / 2, font * .45); return x.x >= c[i] - w[i] / 2 + e - 1e-6 && x.x <= c[i] + w[i] / 2 - e + 1e-6; });
      return { at: it.map(function (x, i) { return { it: x, lines: L[i], c: c ? c[i] : (x.mid != null ? x.mid : x.x), w: w[i] }; }),
               lines: L.reduce(function (k, ls) { return Math.max(k, ls.length); }, 0), fits: ok };
    }
    for (var n = Math.max(longest, o.letters || 22); n >= longest; n--) { var t = tryWrap(n); if (t.fits) return t; }
    var opt = it.filter(function (x) { return x.opt; });
    if (opt.length) { var r = band(it.filter(function (x) { return x !== opt[opt.length - 1]; }), o); if (r.fits) return r; }
    return tryWrap(longest);
  }
  function bandSvg(o, side) {
    var y = side === 'T' ? o.bandT : o.bandB;
    if (y == null) return '';
    var items = o.items.filter(function (x) { return x.side === side && !x.hidden; });
    if (!items.length) return '';
    var font = o.font || 16, lh = font * 1.18, out = '';
    /* the band's own gap between names (o.gap is the margins' gap between rows) */
    var B = band(items, { font: font, bandL: o.bandL, bandR: o.bandR, left: o.left, right: o.right });
    B.at.forEach(function (a) {
      var x = a.it, nl = a.lines.length;
      var top = side === 'T' ? y - font * .25 - nl * lh : y + font * .25, b0 = top + font * .84;
      var d = 'M' + f2(x.x) + ' ' + f2(x.y) + 'L' + f2(x.x) + ' ' + f2(y);
      out += '<g class="lb lb--band ' + (x.cls || '') + '" data-lab="' + esc(x.id || '') + '" opacity="' + (x.op == null ? 1 : x.op) + '">' +
        '<path class="lb__halo" d="' + d + '"/><path class="lb__lead" d="' + d + '"/>' +
        '<text class="lb__txt" x="' + f2(a.c) + '" y="' + f2(b0) + '" text-anchor="middle" style="font-size:' + font + 'px">' +
        a.lines.map(function (ln, k) { return '<tspan x="' + f2(a.c) + '" dy="' + (k ? f2(lh) : 0) + '">' + esc(ln) + '</tspan>'; }).join('') + '</text></g>';
    });
    return out;
  }
  /* the pins of a band: each disc over its own line (it may stand a little to one side, never off it) */
  function pinBandSvg(o, side, r, order) {
    var y = side === 'T' ? o.bandT : o.bandB;
    if (y == null) return '';
    var it = o.items.filter(function (x) { return x.side === side && !x.hidden; }).sort(function (a, b) { return a.x - b.x; });
    if (!it.length) return '';
    var lo = o.bandL == null ? o.left : o.bandL, hi = o.bandR == null ? o.right : o.bandR, font = o.font || 18;
    var c = spread(it.map(function (x) { return x.x; }), it.map(function () { return 2 * r; }), 3, lo, hi) || it.map(function (x) { return x.x; });
    var out = '';
    it.forEach(function (x, i) {
      var n = order.length + 1, dx = Math.max(-r * .6, Math.min(r * .6, x.x - c[i])), cx = x.x - dx;
      var cy = side === 'T' ? y - r : y + r, ey = side === 'T' ? cy + Math.sqrt(r * r - dx * dx) : cy - Math.sqrt(r * r - dx * dx);
      var d = 'M' + f2(x.x) + ' ' + f2(x.y) + 'L' + f2(x.x) + ' ' + f2(ey);
      out += '<g class="lb lb--pin ' + (x.cls || '') + '" data-lab="' + esc(x.id || '') + '" opacity="' + (x.op == null ? 1 : x.op) + '">' +
        '<path class="lb__halo" d="' + d + '"/><path class="lb__lead" d="' + d + '"/>' +
        '<circle class="lb__pin" cx="' + f2(cx) + '" cy="' + f2(cy) + '" r="' + f2(r) + '"/>' +
        '<text class="lb__pinn" x="' + f2(cx) + '" y="' + f2(cy + font * .3) + '" text-anchor="middle" style="font-size:' + f2(font * .82) + 'px">' + n + '</text></g>';
      order.push({ n: n, text: x.text, cls: x.cls, id: x.id, y: cy });
    });
    return out;
  }

  /* ---------- the same labels on a phone: numbered pins, words in a band ----------
     Below about 520 px a column of words beside the drawing shrinks to a few pixels. So each
     label becomes a numbered disc in a narrow margin, joined to its part by the same ruled
     horizontal leader (so leaders still never cross), and the words go in a numbered list in a
     band above the drawing — the Plants Lab's rule for its animations on a phone.
     pinLabels(o): o as for labels(), with left/right the inner edges of the two pin columns.
       returns { svg, order: [{ n, text, cls, id, y }] } — number 1 is the top of the left column (the top band's first, when
       there is one). `id` names the part, since two parts may share their words ("divided: two single lines"); `y` is where
       its disc stands (a key beside the picture puts each name level with it). */
  function pinLabels(o) {
    var font = o.font || 18, r = font * .72, gap = o.gap == null ? 4 : o.gap, out = '', order = [];
    /* a band's pins (sides 'T', 'B', opt-in): the top band is numbered first, left to right; the bottom band last */
    out += pinBandSvg(o, 'T', r, order);
    ['L', 'R'].forEach(function (side) {
      var it = o.items.filter(function (x) { return x.side === side && !x.hidden; }).map(function (x) {
        return { x: x.x, y: x.y, ly: x.y, h: 2 * r, id: x.id, text: x.text, cls: x.cls || '', op: x.op == null ? 1 : x.op, alts: x.alts, off: x.off, opt: x.opt, all: x.all };
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
        order.push({ n: n, text: x.text, cls: x.cls, id: x.id, y: x.ly });
      });
    });
    out += pinBandSvg(o, 'B', r, order);
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
  L.labelBand = band;
  L.pinLabels = pinLabels;
  L.pinBand = pinBand;
  L.clamp01 = clamp01;
  /* Reduce motion (Daniel, 9 Nov 2026: "Nothing should disappear"): a step's still names everything the moving step names.
       still   the stepper's { step, from, to } (render's second argument with Reduce motion)
       itemsAt itemsAt(t): the names drawn at the reader's time t, each { id, text, x, y, … } as the widget's labeller takes them
       now     the names of the still itself, drawn at its own time `at`
       memo    an object the widget keeps, and `key` what the names' places depend on (the layout), so a resize does not
               sample the step again
     A name that came and went during the step, and is not in the still, is added where it stood nearest the still's own
     moment (its id made its own, so a widget's one-name-per-kind filter keeps it); a name that its own part changed during
     the step ("weakened pathogen" → "destroyed": the same id) joins that part's label ("weakened pathogen, then destroyed"), and
     so does the name of a part that became another (a still's name with `was: <its id>`: the egg cell, then the zygote).
     A name already on the step's first frame came from the step before, whose still holds it (still.prev: that still's
     moment). Every name of a still is marked `all`, so the labeller keeps them all. */
  function stillItems(still, itemsAt, now, at, memo, key) {
    if (!still) return now;
    var k = still.step + '|' + still.from + '|' + (key || ''), add;
    function nm(q) { return String(q.text); }
    if (memo && memo.k === k) add = memo.v;
    else {
      var have = {}, carried = {}, near = {};
      now.forEach(function (q) { have[nm(q)] = 1; });
      if (still.prev != null) { var inPrev = {}; itemsAt(still.prev).forEach(function (q) { inPrev[nm(q)] = 1; });
        itemsAt(still.from).forEach(function (q) { if (inPrev[nm(q)]) carried[nm(q)] = 1; }); }
      for (var t = still.from; t <= still.to + 1e-9; t += .05) itemsAt(t).forEach(function (q) {
        var n = nm(q); if (have[n] || carried[n]) return;
        var d = Math.abs(t - at);
        if (!near[n]) near[n] = { d: d, q: q, t0: t }; else if (d < near[n].d) { near[n].d = d; near[n].q = q; }
      });
      add = Object.keys(near).map(function (n) { return { q: near[n].q, t0: near[n].t0 }; });
      if (memo) { memo.k = k; memo.v = add; }
    }
    /* a part whose name changed during the step (a pathogen, then destroyed) keeps ONE label in the still, with each of
       its names in the order they came, so no name is crowded out by its own part's other name */
    var out = now.map(function (q) { var o = {}; for (var p in q) o[p] = q[p]; return o; }), byId = {};
    out.forEach(function (q) { if (!byId[q.id]) byId[q.id] = q; });
    /* `was`: a name of the still that a part of the step became (the zygote was the egg cell) takes that part's name too */
    var byWas = {}; out.forEach(function (q) { if (q.was) byWas[q.was] = q; });
    var later = {};
    add.forEach(function (a) {
      var q = a.q; if (out.some(function (o) { return nm(o) === nm(q) || nm(o).indexOf(nm(q) + ', then ') === 0; })) return;
      /* the same part: the same id, pointing at much the same place (a widget may give several parts one id) */
      var same = byId[q.id];
      if (same && Math.abs(same.x - q.x) + Math.abs(same.y - q.y) < 30) { (later[q.id] = later[q.id] || []).push(a); return; }
      if (byWas[q.id]) { (later[byWas[q.id].id] = later[byWas[q.id].id] || []).push(a); return; }
      var o = {}; for (var p in q) o[p] = q[p]; o.id = q.id + '~' + q.text; out.push(o); if (!byId[o.id]) byId[o.id] = o;
    });
    Object.keys(later).forEach(function (id) {
      var q = byId[id], seq = later[id].sort(function (x, y) { return x.t0 - y.t0; });
      var before = seq.filter(function (a) { return a.t0 < at; }).map(function (a) { return nm(a.q); });
      var after = seq.filter(function (a) { return a.t0 >= at; }).map(function (a) { return nm(a.q); });
      q.text = before.concat([nm(q)], after).join(', then ');
    });
    /* `all`: the labeller keeps every name of a still, never leaving one out for want of a row (labels, pinLabels) */
    out.forEach(function (q) { q.all = true; });
    return out;
  }
  L.still = still;
  L.stillItems = stillItems;
})(window);
