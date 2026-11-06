/* ============================================================
   inh-films.js — the films of the stations' pictures (the divisions session, 5 Nov 2026). A station's picture plays its
   division as one film, again and again (Daniel, 5 Nov 2026: the mitosis picture "should be animated to make it nicer";
   meiosis "is not animated and should be animated"; "it can be just a single animation that shows everything").
     mitosis   the IGCSE step animation's own frames (js/w-divide.js), faster and without words: one cell divides into two;
               the top one then grows into the next cell, as cells do between divisions, and the other leaves the picture
     meiosis   the same for meiosis: one cell gives four gametes; then the first cell again
     uses      "What mitosis is for" (js/inh-uses.js adds it)
   The engine (InhFilms): a film draws its frames into its picture; the picture's view (js/views/figure.js) asks film.pts()
   for the names that stand at this moment (a part's name only while the part is at rest) and gives the film
   attach({ img, shown(), redraw(), lit() }) (the labels session's hook). A card that lights a part holds the film on that
   part (`hold`), or plays that part's story again and again (`loops`). Reduced motion: the film rests on its last frame
   (or the lit part's). A film marked `self`, whose names never move, also finds its pictures itself.
   InhFilms.seek(name, s) draws a moment (tools/bounds.mjs, the contact sheet); InhFilms.info(name) its times.
   ============================================================ */
(function (global) {
  'use strict';
  var D = global.InhDraw, V = global.InhDivide; if (!D) return;
  var n1 = D.n1, mix = D.mix;
  function ease(k) { return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  var Films = (function () {
    var F = {}, forced = {}, RM = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null, ticking = false;
    function add(name, o) {
      o.name = name; o.insts = []; o.cur = null;
      o.attach = function (api) { if (!api || !api.img || api.img.__film) return; api.img.__film = true; o.insts.push(api); kick(); };
      o.pts = function () { return (o.cur && o.cur.pts) || o.frame(o.still, 0).pts; };
      F[name] = o;
      return o;
    }
    function kick() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }
    function draw(o, a, s) {
      var fr = o.frame(s, a.ph == null ? 0 : a.ph);
      a.img.innerHTML = '<g class="film" data-film="' + o.name + '">' + fr.svg + '</g>';
      o.cur = { s: s, pts: fr.pts };
      var key = JSON.stringify(fr.pts);
      if (key !== a.key) { a.key = key; if (a.redraw) a.redraw(); }
    }
    var last = 0;
    function tick(now) {
      ticking = false;
      var any = false, fast = now - last >= 30;
      Object.keys(F).forEach(function (k) {
        var o = F[k];
        o.insts = o.insts.filter(function (a) { return a.img && a.img.isConnected; });
        o.insts.forEach(function (a) {
          if (!a.shown()) { a.t0 = null; return; }
          any = true;
          var lit = a.lit ? a.lit() : null, s, lp = lit && o.loops && o.loops[lit];
          if (forced[k] != null) s = forced[k];
          else if (lit && o.hold && o.hold[lit] != null) { s = o.hold[lit]; a.t0 = null; a.s = s; }
          /* a film of several stories (js/inh-uses.js) plays the lit one again and again */
          else if (lp) { if (RM && RM.matches) s = lp[1] - .05; else { if (a.litWas !== lit || a.lt0 == null) a.lt0 = now; s = lp[0] + ((now - a.lt0) / 1000) % (lp[1] - lp[0]); } a.t0 = null; a.s = lp[0]; }
          else if (RM && RM.matches) s = o.still;
          else { if (a.t0 == null) a.t0 = now - (a.s || 0) * 1000; s = ((now - a.t0) / 1000) % o.dur; a.s = s; }
          a.litWas = lit;   /* never a.lit: that is the view's lit() */
          /* about 30 frames a second while it plays; a held frame is drawn once */
          if (s === a.lastS || (!fast && a.lastS != null && Math.abs(s - a.lastS) < .5)) return;
          a.ph = o.wiggle ? o.wiggle(s) : 0; a.lastS = s; draw(o, a, s);
        });
      });
      if (fast) last = now;
      if (any) kick(); else setTimeout(kick, 500);
    }
    /* a film whose names never move finds its pictures itself (no hook needed) */
    function scan() {
      Object.keys(F).forEach(function (k) {
        if (!F[k].self) return;
        Array.prototype.forEach.call(document.querySelectorAll('[data-film="' + k + '"]'), function (el) {
          var host = el.parentNode;
          if (!host || host.__film) return;
          F[k].attach({ img: host, shown: function () { var r = host.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < (global.innerHeight || 900); }, redraw: null, lit: null });
        });
      });
    }
    if (global.setInterval) setInterval(scan, 700);
    return {
      add: add,
      get: function (name) { return F[name]; },
      scene: function (name) {
        var o = F[name]; if (!o) return null;
        var fr = o.frame(o.still, 0);
        return { w: o.W, h: o.H, svg: '<g class="film" data-film="' + name + '">' + fr.svg + '</g>', pts: o.allPts, alts: o.alts || {}, spots: o.spots, film: o };
      },
      seek: function (name, s) {
        var o = F[name]; if (!o) return 0;
        forced[name] = s;
        Array.prototype.forEach.call(document.querySelectorAll('[data-film="' + name + '"]'), function (el) {
          var a = o.insts.filter(function (x) { return x.img === el.parentNode; })[0] || { img: el.parentNode };
          a.ph = o.wiggle ? o.wiggle(s) : 0; a.lastS = s; draw(o, a, s);
        });
        return o.dur;
      },
      play: function (name) { delete forced[name]; },
      info: function (name) { var o = F[name]; return o ? { dur: o.dur, still: o.still, hold: o.hold, loops: o.loops, marks: o.marks || [] } : null; }
    };
  })();

  global.InhFilms = Films;
  if (!V) return;
  var MI = V.MI, ME = V.ME, mitRender = V.mitRender, meiRender = V.meiRender, terr = V.terr, chrom = V.chrom, thr = V.thr, leftOf = V.leftOf, nuc = V.nuc, FOUR = D.FOUR;
  /* a film of a step animation: rest on its first frame, play its model from m0 to m1 at `pace`, rest on its last frame,
     then `back` seconds to return to the first (grow: a function drawing the way back; otherwise a cross-fade) */
  function filmOf(o) {
    var r0 = 3.5, play = (o.m1 - o.m0) / o.pace, r1 = 4, back = o.back || 1.6;
    var A = r0, B = r0 + play, C = B + r1, E = C + back;
    o.dur = E; o.still = B + r1 / 2;
    o.hold = o.holdOf(r0 / 2, B + r1 / 2);
    o.marks = [r0 / 2, A + play * .25, A + play * .5, A + play * .75, B + r1 / 2, C + back / 2];
    /* the threads lie still (the audit, 6 Nov 2026: names stood on threads that wriggled), as in the step animations */
    o.wiggle = function () { return 3; };
    o.frame = function (s, ph) {
      var svg, pts = {};
      if (s < A) { svg = o.render(o.m0 * s / A, ph); pts = o.first(ph); }
      else if (s < B) svg = o.render(o.m0 + (s - A) * o.pace, ph);
      else if (s < C) { svg = o.render(o.m1, ph); pts = o.last(ph); }
      else {
        var k = ease((s - C) / back);
        /* without a way back, the last frame moves off to the left and the first cell comes in from the right: the next
           cell, never the division running backwards (a cross-fade: the review, 5 Nov 2026) and never an empty picture
           between them (the audit, 6 Nov 2026) */
        svg = o.grow ? o.grow(k, ph) : slide(o.W, o.render(o.m1 - .01, ph), o.render(0, ph), k);   /* m1 − .01: nothing waiting outside the picture (the egg cell) slides into view */
      }
      return { svg: svg, pts: pts };
    };
    return o;
  }
  function pt(p, side) { return [n1(p[0]), n1(p[1]), side]; }
  /* the way back of a film without its own: the old picture out to the left, the new one in from the right, both whole */
  function slide(W, a, b, k) { var d = 1.1 * W; return '<g transform="translate(' + n1(-d * k) + ' 0)">' + a + '</g><g transform="translate(' + n1(d * (1 - k)) + ' 0)">' + b + '</g>'; }
  /* the mitosis picture: one cell divides into two; the top one then grows into the next cell, as cells do between
     divisions, and the other leaves the picture */
  Films.add('mitosis', filmOf({
    W: MI.W, H: MI.H, m0: 2, m1: 52, pace: 1.25, back: 3.5,
    render: function (t, ph) { return mitRender(t, ph); },
    first: function (ph) { var l = leftOf(thr(terr(FOUR, MI.NU)[0], ph)); return { parent: pt([26, 240], 'L'), chromosome: pt(l, 'L') }; },
    last: function () { return { daughter: pt([288, 128], 'R'), daughter2: pt([288, 352], 'R') }; },
    holdOf: function (a, b) { return { parent: a, chromosome: a, daughter: b, daughter2: b }; },
    grow: function (k, ph) {
      var cy = lerp(128, 240, k), N1 = nuc(160, lerp(MI.D1.cy, MI.NU.cy, k), lerp(MI.D1.rx, MI.NU.rx, k), lerp(MI.D1.ry, MI.NU.ry, k)), out = '';
      out += D.cell(160, cy, lerp(128, 134, k), lerp(108, 196, k)) + D.envelope(N1.cx, N1.cy, N1.rx, N1.ry, lerp(14, 18, k) | 0);
      terr(FOUR, N1).forEach(function (T) { out += chrom(T, ph, -1); });
      var dy = 300 * k, N2 = MI.D2;
      out += '<g transform="translate(0 ' + n1(dy) + ')">' + D.cell(160, 352, 128, 108) + D.envelope(N2.cx, N2.cy, N2.rx, N2.ry, 14);
      terr(FOUR, N2).forEach(function (T) { out += chrom(T, ph, -1); });
      return out + '</g>';
    },
    allPts: { parent: [26, 240, 'L'], chromosome: [100, 190, 'L'], daughter: [288, 128, 'R'], daughter2: [288, 352, 'R'] },
    spots: { parent: [160, 240, 134, 196], chromosome: [124, 205, 40, 40], daughter: [160, 128, 128, 108], daughter2: [160, 352, 128, 108] }
  }));
  /* the meiosis picture: one cell gives four gametes; then the first cell again */
  Films.add('meiosis', filmOf({
    W: ME.W, H: ME.H, m0: 2, m1: 57, pace: 1.25, back: 2.4,
    render: function (t, ph) { return meiRender(t, ph); },
    first: function () { return { parent: pt([26, 250], 'L') }; },
    last: function () { return { gamete: pt([294, 134], 'R'), gamete2: pt([294, 366], 'R') }; },
    holdOf: function (a, b) { return { parent: a, gamete: b, gamete2: b }; },
    allPts: { parent: [26, 250, 'L'], gamete: [294, 134, 'R'], gamete2: [294, 366, 'R'] },
    spots: { parent: [160, 250, 134, 196], gamete: [228, 134, 66, 100], gamete2: [228, 366, 66, 100] }
  }));
  /* "A line or a cross?" (station `genes`): the mother's and the father's chromosome, from lines to crosses and back to
     lines in two new cells (the step animation's own frames). It rests three times, each with its names: the lines, the
     crosses (the membrane in pieces), the two new cells */
  (function () {
    var LC = V.LC, LZ = V.LZ, PAIR = V.PAIR, lc = V.lcRender, rightOf = V.rightOf, ends = V.ends, pace = 1.25;
    var S = [[0, 3.5, 'rest', 0, 2], [3.5, 0, 'play', 2, 22.6], [0, 4, 'rest', 22.6, 22.6], [0, 0, 'play', 22.6, 50], [0, 4, 'rest', 50, 50], [0, 2.4, 'back', 50, 0]];
    var t0 = 0;
    S.forEach(function (q) { q[0] = t0; if (q[2] === 'play') q[1] = (q[4] - q[3]) / pace; t0 += q[1]; });
    function T0() { return D.terr(PAIR, LC.NU, LZ); }
    function T1() { return D.terr(PAIR, LC.D1, LZ); }
    function T2() { return D.terr(PAIR, LC.D2, LZ); }
    function pts(i, ph) {
      if (i === 0) { var l = leftOf(thr(T0()[0], ph)); return { line: pt(l, 'L') }; }
      /* on the short arm's plain orange, a sixth of the way along, well away from the gene band (the audit, G1-18) */
      if (i === 2) { var e = leftOf([D.rodAt(D.crossRod(T0()[0], 0), .16), D.rodAt(D.crossRod(T0()[0], 1), .16)]); return { cross: pt(e, 'L') }; }
      if (i === 4) { var a = leftOf(thr(T1()[0], ph)), b = rightOf(thr(T2()[0], ph)); return { lines: pt(a, 'L'), lines2: pt(b, 'R') }; }
      return {};
    }
    var o = Films.add('linecross', {
      W: LC.W, H: LC.H, dur: t0,
      frame: function (s, ph) {
        for (var i = 0; i < S.length; i++) {
          var q = S[i], k = q[1] ? Math.min(1, (s - q[0]) / q[1]) : 1;
          if (s >= q[0] + q[1] && i + 1 < S.length) continue;
          if (q[2] === 'back') return { svg: slide(LC.W, lc(50, ph), lc(0, ph), ease(k)), pts: {} };
          return { svg: lc(lerp(q[3], q[4], k), ph), pts: q[2] === 'rest' ? pts(i, ph) : {} };
        }
      },
      wiggle: function () { return 3; }
    });
    var A = S[0][0] + S[0][1] / 2, B = S[2][0] + S[2][1] / 2, C = S[4][0] + S[4][1] / 2;
    o.still = C; o.hold = { line: A, cross: B, lines: C, lines2: C };
    o.allPts = Object.assign({}, pts(0, 0), pts(2, 0), pts(4, 0));
    var t = T0()[0], c = D.crossRod(T0()[0], 0), d1 = T1()[0], d2 = T2()[0];
    o.spots = { line: [n1(t.c[0]), n1(t.c[1]), n1(t.R + 6), n1(t.R + 6)], cross: [n1(t.c[0]), n1(t.c[1]), 54, 34],
                lines: [n1(d1.c[0]), n1(d1.c[1]), n1(d1.R + 5), n1(d1.R + 5)], lines2: [n1(d2.c[0]), n1(d2.c[1]), n1(d2.R + 5), n1(d2.R + 5)] };
    o.marks = [A, B, C];
  })();
  Films.get('mitosis').allPts.chromosome = (function () { var l = leftOf(thr(terr(FOUR, MI.NU)[0], 0)); return [n1(l[0]), n1(l[1]), 'L']; })();
})(window);
