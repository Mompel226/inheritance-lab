/* ============================================================
   inh-draw.js — the things this lab draws, as SVG strings: only abstract shapes, with flat fills, every one in a key
   (new-lab.md §7: "Draw only abstract shapes … flat fills, every symbol in a key"; Daniel's approval of the plan, 4 Nov 2026).

   chromo     a chromosome: one rod, or after replication two identical copies joined at one point. Its colour says
              which parent it came from (--mum, --dad: the key "from the mother / from the father" goes with every
              drawing that uses them). A gene is a band across it, at the same place on both chromosomes of a pair.
   cell, nucleus   a cell's membrane and its nucleus
   helix      a length of DNA: two strands and the bases between them
   allele     an allele or a genotype written with real raised letters (js/genes.js tokens)
   person     a pedigree symbol: a square (male) or a circle (female), shaded when it has the characteristic
   threads    the lab's four chromosomes in a nucleus that is not dividing: long thin lines, each in its own part of the
              nucleus, so that no two ever cross (the Opus review of the divisions, 4 Nov 2026)
   territory, coiled, envelope, duplex, beads   a chromosome's life and its DNA, the same in every animation (below)
   Every function is pure: the same arguments give the same drawing (memory headless-raf-animations).
   ============================================================ */
(function (global) {
  'use strict';
  function n1(v) { return Math.round(v * 10) / 10; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }

  /* o: { x, y (the centre), len, w, rot (degrees), who: 'mum'|'dad', bands: [f…] (0 top … 1 bottom), copies: 1|2,
          spread (how far the two copies open out from the point where they join: 0 side by side, .5 the cross of a
          photograph; default .5), cen (0…1, where the copies join), op (opacity), cls (extra class),
          tail: f (one rod) or [f1, f2] (each copy): from f to the end the rod is the OTHER parent's colour (crossing over,
          an IB extension) } */
  function chromo(o) {
    var len = o.len || 60, w = o.w || 10, copies = o.copies || 1, cen = o.cen == null ? .42 : o.cen;
    var who = o.who === 'dad' ? 'dad' : 'mum', other = who === 'dad' ? 'mum' : 'dad', bands = o.bands || [];
    var tails = o.tail == null ? [] : [].concat(o.tail);
    var r = w / 2, bh = Math.max(3, len * .085);
    /* one arm of a copy: a capsule from the joining point, `l` long, pointing `ang` degrees from straight up (or down),
       with its share of the bands and of an exchanged end */
    function arm(dir, ang, l, f0, f1, tail) {
      /* dir -1: the arm above the joining point (f from cen down to 0), +1: below (f from cen up to 1) */
      var out = '<g transform="rotate(' + n1(ang) + ')">';
      var y0 = 0, y1 = dir * l, top = Math.min(y0, y1), h = Math.abs(y1 - y0);
      out += '<rect class="ch ch--' + who + '" x="' + n1(-r) + '" y="' + n1(top - (dir < 0 ? 0 : r * .6)) + '" width="' + n1(w) + '" height="' + n1(h + r * .6) + '" rx="' + n1(r) + '"/>';
      function yOf(f) { return dir * Math.abs(f - cen) * len; }
      if (tail != null && ((dir > 0 && tail > cen) || (dir < 0 && tail < cen))) {
        var ty = yOf(tail), ey = y1;
        var lo = Math.min(ty, ey), hi = Math.max(ty, ey);
        out += '<rect class="ch ch--' + other + '" x="' + n1(-r) + '" y="' + n1(lo) + '" width="' + n1(w) + '" height="' + n1(hi - lo) + '" rx="' + n1(Math.min(r, (hi - lo) / 2)) + '"/>';
        if (dir > 0) out += '<rect class="ch ch--' + other + '" x="' + n1(-r) + '" y="' + n1(lo) + '" width="' + n1(w) + '" height="' + n1(Math.min(r, hi - lo)) + '"/>';
        else out += '<rect class="ch ch--' + other + '" x="' + n1(-r) + '" y="' + n1(hi - Math.min(r, hi - lo)) + '" width="' + n1(w) + '" height="' + n1(Math.min(r, hi - lo)) + '"/>';
      }
      bands.forEach(function (f) {
        if ((dir < 0 && f >= cen) || (dir > 0 && f < cen)) return;
        out += '<rect class="ch__band" x="' + n1(-r) + '" y="' + n1(yOf(f) - bh / 2) + '" width="' + n1(w) + '" height="' + n1(bh) + '"/>';
      });
      return out + '</g>';
    }
    /* a single line: one straight rod */
    function rod(tail) {
      var out = '<rect class="ch ch--' + who + '" x="' + n1(-r) + '" y="' + n1(-len / 2) + '" width="' + n1(w) + '" height="' + n1(len) + '" rx="' + n1(r) + '"/>';
      if (tail != null) {
        var ty = -len / 2 + tail * len;
        out += '<path class="ch ch--' + other + '" d="M' + n1(-r) + ' ' + n1(ty) + ' L' + n1(r) + ' ' + n1(ty) + ' L' + n1(r) + ' ' + n1(len / 2 - r) +
          ' A' + n1(r) + ' ' + n1(r) + ' 0 0 1 ' + n1(-r) + ' ' + n1(len / 2 - r) + ' Z"/>';
      }
      bands.forEach(function (f) { out += '<rect class="ch__band" x="' + n1(-r) + '" y="' + n1(-len / 2 + f * len - bh / 2) + '" width="' + n1(w) + '" height="' + n1(bh) + '"/>'; });
      return out;
    }
    var body;
    if (copies === 2) {
      /* the cross of a photograph: two copies joined at one point, each bent there, its arms leaning away from the other
         copy's (spread 1: arms 24° from upright, the textbook X; 0: side by side) */
      var sp = o.spread == null ? 1 : o.spread, th = 24 * sp, off = r * .55 + sp * r * .15;
      var cy = (cen - .5) * len, up = cen * len, dn = (1 - cen) * len;
      body = '<g transform="translate(' + n1(-off) + ' ' + n1(cy) + ')">' + arm(-1, -th, up, 0, cen, tails[0]) + arm(1, th, dn, cen, 1, tails[0]) + '</g>' +
             '<g transform="translate(' + n1(off) + ' ' + n1(cy) + ')">' + arm(-1, th, up, 0, cen, tails.length > 1 ? tails[1] : null) + arm(1, -th, dn, cen, 1, tails.length > 1 ? tails[1] : null) + '</g>' +
             '<circle class="ch__cen ch--' + who + '" cx="0" cy="' + n1(cy) + '" r="' + n1(w * .58) + '"/>';
    } else body = rod(tails[0]);
    return '<g class="chr' + (o.cls ? ' ' + o.cls : '') + '" transform="translate(' + n1(o.x) + ' ' + n1(o.y) + ') rotate(' + n1(o.rot || 0) + ')"' +
      (o.op != null && o.op < 1 ? ' opacity="' + n1(o.op * 100) / 100 + '"' : '') + '>' + body + '</g>';
  }
  /* one chromatid pulled to a pole in anaphase: a V, its centromere leading at (x, y), its two arms trailing behind it
     (rot 0: the arms point down, the centromere towards a pole above). o: { x, y, len, w, who, cen, bands, tail, rot, op } */
  function vee(o) {
    var len = o.len || 60, w = o.w || 10, cen = o.cen == null ? .42 : o.cen, r = w / 2, th = o.open == null ? 26 : o.open;
    var who = o.who === 'dad' ? 'dad' : 'mum', other = who === 'dad' ? 'mum' : 'dad', bh = Math.max(3, len * .085);
    function arm(ang, l, withMarks) {
      var out = '<g transform="rotate(' + n1(ang) + ')"><rect class="ch ch--' + who + '" x="' + n1(-r) + '" y="' + n1(-r * .6) + '" width="' + n1(w) + '" height="' + n1(l + r * .6) + '" rx="' + n1(r) + '"/>';
      if (withMarks) {
        if (o.tail != null && o.tail > cen) { var ty = (o.tail - cen) * len; out += '<rect class="ch ch--' + other + '" x="' + n1(-r) + '" y="' + n1(ty) + '" width="' + n1(w) + '" height="' + n1(l - ty) + '" rx="' + n1(r) + '"/><rect class="ch ch--' + other + '" x="' + n1(-r) + '" y="' + n1(ty) + '" width="' + n1(w) + '" height="' + n1(Math.min(r, l - ty)) + '"/>'; }
        (o.bands || []).forEach(function (f) { if (f > cen) out += '<rect class="ch__band" x="' + n1(-r) + '" y="' + n1((f - cen) * len - bh / 2) + '" width="' + n1(w) + '" height="' + n1(bh) + '"/>'; });
      }
      return out + '</g>';
    }
    var body = arm(th, cen * len, false) + arm(-th, (1 - cen) * len, true) + '<circle class="ch__cen ch--' + who + '" cx="0" cy="0" r="' + n1(w * .58) + '"/>';
    return '<g class="chr' + (o.cls ? ' ' + o.cls : '') + '" transform="translate(' + n1(o.x) + ' ' + n1(o.y) + ') rotate(' + n1(o.rot || 0) + ')"' +
      (o.op != null && o.op < 1 ? ' opacity="' + n1(o.op * 100) / 100 + '"' : '') + '>' + body + '</g>';
  }

  /* where a band of a chromosome is, in the drawing's own units (for a name's line to end on it) */
  function bandAt(o, f) {
    var len = o.len || 60, a = (o.rot || 0) * Math.PI / 180, dy = -len / 2 + f * len;
    return [o.x - Math.sin(a) * dy, o.y + Math.cos(a) * dy];
  }

  /* the four chromosomes as threads: A from the mother, B from the father (above); B from the mother, A from the father
     (below). (cx, cy) the nucleus's centre; sx, sy the scale (1 fits a nucleus of 56 × 48 units); two 0…1 draws each one
     as two sister copies after replication; w the width of a line */
  /* the long pair A is the two longer lines (one from each parent), the short pair B the two shorter */
  var TH = [['mum', [[-40, -20], [-26, -32], [-10, -22], [4, -30]]], ['dad', [[14, -28], [28, -18], [40, -28]]],
            ['mum', [[-42, 14], [-28, 4], [-14, 16]]], ['dad', [[-4, 8], [10, 22], [26, 12], [42, 22]]]];
  function threadPath(pts, who, w) {
    var d = 'M' + n1(pts[0][0]) + ' ' + n1(pts[0][1]);
    for (var i = 1; i < pts.length; i++) { var p = pts[i - 1], q = pts[i]; d += ' Q' + n1(p[0]) + ' ' + n1(p[1]) + ' ' + n1((p[0] + q[0]) / 2) + ' ' + n1((p[1] + q[1]) / 2); }
    var e = pts[pts.length - 1];
    return '<path class="thr thr--' + who + '" d="' + d + ' T' + n1(e[0]) + ' ' + n1(e[1]) + '" stroke-width="' + n1(w) + '"/>';
  }
  function threads(cx, cy, sx, sy, two, w) {
    var out = '', dy = 2.6 * (two || 0); w = w || 2.8; sy = sy == null ? sx : sy;
    TH.forEach(function (q) {
      var P = q[1].map(function (p) { return [cx + p[0] * sx, cy + p[1] * sy]; });
      if (dy > .05) out += threadPath(P.map(function (p) { return [p[0], p[1] - dy]; }), q[0], w * .93) + threadPath(P.map(function (p) { return [p[0], p[1] + dy]; }), q[0], w * .93);
      else out += threadPath(P, q[0], w);
    });
    return out;
  }
  /* where the first thread starts (a name's line ends there) */
  function threadStart(cx, cy, sx, sy) { return [cx + TH[0][1][0][0] * sx, cy + TH[0][1][0][1] * (sy == null ? sx : sy)]; }

  function cell(cx, cy, rx, ry, cls) { return '<ellipse class="cellb' + (cls ? ' ' + cls : '') + '" cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + n1(rx) + '" ry="' + n1(ry) + '"/>'; }
  function nucleus(cx, cy, rx, ry, op) { return '<ellipse class="nucb" cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + n1(rx) + '" ry="' + n1(ry) + '"' + (op != null && op < 1 ? ' opacity="' + n1(op * 100) / 100 + '"' : '') + '/>'; }

  /* a length of DNA from (x0, y) to (x1, y): two strands, the bases as rungs coloured by kind (four kinds, keyed);
     `hi` [a, b] lights the part from a to b (0…1), a gene */
  var BASES = 'ATGCCATGTACGGATCCTAGCTAGGCATTCAGCAT';
  function helix(x0, x1, y, amp, turns, phase, hi) {
    var out = '', n = 60, pts1 = [], pts2 = [];
    for (var i = 0; i <= n; i++) {
      var k = i / n, x = x0 + (x1 - x0) * k, a = phase + k * turns * Math.PI * 2;
      pts1.push([x, y + Math.sin(a) * amp]); pts2.push([x, y - Math.sin(a) * amp]);
    }
    if (hi) out += '<rect class="dna__gene" x="' + n1(x0 + (x1 - x0) * hi[0]) + '" y="' + n1(y - amp - 7) + '" width="' + n1((x1 - x0) * (hi[1] - hi[0])) + '" height="' + n1(2 * amp + 14) + '" rx="6"/>';
    var rungs = Math.round(turns * 10);
    for (var j = 0; j < rungs; j++) {
      var kk = (j + .5) / rungs, xx = x0 + (x1 - x0) * kk, aa = phase + kk * turns * Math.PI * 2, yy = Math.sin(aa) * amp;
      var b = BASES.charAt(j % BASES.length);
      out += '<line class="dna__b dna__b--' + b + '" x1="' + n1(xx) + '" y1="' + n1(y + yy) + '" x2="' + n1(xx) + '" y2="' + n1(y - yy) + '"/>';
    }
    function path(p) { return 'M' + p.map(function (q) { return n1(q[0]) + ' ' + n1(q[1]); }).join(' L'); }
    return out + '<path class="dna__s dna__s--1" d="' + path(pts1) + '"/><path class="dna__s dna__s--2" d="' + path(pts2) + '"/>';
  }

  /* an allele or genotype in SVG, its raised letters as real superscripts */
  function allele(x, y, str, o) {
    o = o || {};
    var t = global.Genes ? global.Genes.parse(str) : [{ b: str, s: '' }];
    var s = '<text class="al' + (o.cls ? ' ' + o.cls : '') + '" x="' + n1(x) + '" y="' + n1(y) + '"' + (o.anchor ? ' text-anchor="' + o.anchor + '"' : ' text-anchor="middle"') +
      (o.size ? ' font-size="' + o.size + '"' : '') + '>';
    t.forEach(function (q) {
      s += '<tspan>' + esc(q.b) + '</tspan>';
      if (q.s) s += '<tspan class="al__up" baseline-shift="super" font-size="70%">' + esc(q.s) + '</tspan>';
    });
    return s + '</text>';
  }

  /* a pedigree symbol: sex 'm' (square) or 'f' (circle), `has` shaded, `n` its number under it, `lit` ringed */
  function person(x, y, sex, has, n, r, lit) {
    r = r || 14;
    var shape = sex === 'm' ? '<rect class="pd__p' + (has ? ' is-has' : '') + '" x="' + n1(x - r) + '" y="' + n1(y - r) + '" width="' + n1(2 * r) + '" height="' + n1(2 * r) + '" rx="2"/>'
                            : '<circle class="pd__p' + (has ? ' is-has' : '') + '" cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + n1(r) + '"/>';
    return (lit ? '<circle class="pd__lit" cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + n1(r + 7) + '"/>' : '') + shape +
      (n != null ? '<text class="pd__n" x="' + n1(x) + '" y="' + n1(y + r + 15) + '" text-anchor="middle">' + n + '</text>' : '');
  }


  /* ============================================================ a chromosome's life, and its DNA ============================================================
     Drawn the same in every animation of the lab (Daniel, 5 Nov 2026: "try to standardize what you're showing … do not
     confuse students with different animations that have different colors or different drawings"). Made for "From a cell
     to a gene" (js/w-zoom.js), 4–5 Nov 2026.
     poly, smooth, resample, normals, shift   lines through points (a path, a smooth curve, equal steps, the normal, a
                        line moved sideways)
     territory(T, ph)   a working chromosome: ONE long thin thread folded to and fro in its own part of the nucleus (its
                        territory), so no two chromosomes ever cross. T: { who: 'mum'|'dad'|'faint', c: [x, y], R, n (folds),
                        a (their angle, degrees) }; ph (time) moves the thread a little
     crossRod(T, c)     copy c (0 left, 1 right) of the same chromosome coiled into the cross of the book: T.x its angle,
                        T.len its length, T.w its width; the copies join at CROSS.cen and their arms lean CROSS.arm (24°, as
                        InhDraw.chromo)
     coiled(T, ph, k, wd, o)   the chromosome at one moment of its life: k -1 one thread (not yet copied); 0 two identical
                        threads side by side; 0…1 each copy coiling, again and again, its line moving from the thread to the
                        cross; 1 the cross. o (optional): { copy: 0…1, how far along the thread the copy has been made;
                        rods: function (c) → a rod, when the copies go elsewhere (separating, then uncoiling in a new
                        nucleus); one: true, a single copy (a chromosome of its own after the copies separate) }
     envelope(cx, cy, rx, ry, np)   a nucleus: its two membranes and np pores
     duplex(o)          a length of DNA, a double helix in depth: two strands (the back runs paler), the bases between them
                        (A–T, C–G, each half its own colour), a major and a minor groove; o: { x0, x1, y (the axis), A, P (one
                        turn), ph (turning), lit (0…1: how far the bases have grown), seq, fork: { x, D, S, gap } (copying:
                        left of x the strands have separated into two molecules D apart, each one old strand and one new) }
     beads(list)        DNA wound round histones (nucleosomes): list [{ c: [x, y], a (radians) }], linked by DNA; returns
                        { svg, wrapAt(i, u), linker(i) } (i -1: the DNA that comes in from the left edge) */
  function poly(P) { var s = 'M' + n1(P[0][0]) + ' ' + n1(P[0][1]); for (var i = 1; i < P.length; i++) s += ' L' + n1(P[i][0]) + ' ' + n1(P[i][1]); return s; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function mix(p, q, k) { return [lerp(p[0], q[0], k), lerp(p[1], q[1], k)]; }
  function dist(p, q) { var dx = q[0] - p[0], dy = q[1] - p[1]; return Math.sqrt(dx * dx + dy * dy); }
  function rot(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }
  function opa(o) { return o < .999 ? ' opacity="' + n1(Math.max(0, o) * 100) / 100 + '"' : ''; }
  function smooth(P) {
    var out = [P[0]], m0 = P[0];
    for (var i = 1; i < P.length - 1; i++) {
      var m1 = mix(P[i], P[i + 1], .5);
      for (var s = 1; s <= 6; s++) { var u = s / 6, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; out.push([a * m0[0] + b * P[i][0] + c * m1[0], a * m0[1] + b * P[i][1] + c * m1[1]]); }
      m0 = m1;
    }
    out.push(P[P.length - 1]); return out;
  }
  function resample(P, N) {
    var d = [0], i; for (i = 1; i < P.length; i++) d.push(d[i - 1] + dist(P[i - 1], P[i]));
    var Lt = d[d.length - 1], out = [], j = 1;
    for (var k = 0; k < N; k++) { var s = Lt * k / (N - 1); while (j < d.length - 1 && d[j] < s) j++; out.push(mix(P[j - 1], P[j], (s - d[j - 1]) / ((d[j] - d[j - 1]) || 1))); }
    return out;
  }
  function normals(P) {
    return P.map(function (p, i) { var a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1; return [[dx / l, dy / l], [-dy / l, dx / l]]; });
  }
  function shift(P, dd) { var N = normals(P); return P.map(function (p, i) { var k = typeof dd === 'function' ? dd(i) : dd; return [p[0] + N[i][1][0] * k, p[1] + N[i][1][1] * k]; }); }
  function folds(T, ph) {
    var R = T.R, n = T.n, sp = 1.56 * R / (n - 1), P = [];
    for (var i = 0; i < n; i++) {
      /* each fold its own length, and a little askew, as a real thread lies */
      var h = Math.sin(i * 12.9898 + T.c[0] * 78.233) * 43758.5453, rnd = h - Math.floor(h);
      var u = -.78 * R + i * sp, w = Math.sqrt(Math.max(0, R * R - u * u)) * (.62 + .26 * rnd), dir = i % 2 ? -1 : 1, sk = (rnd - .5) * sp * .5;
      for (var k = 0; k < 7; k++) P.push([dir * lerp(-w, w, k / 6), u + sk * lerp(-1, 1, k / 6) * dir + Math.sin(ph + i * 1.7 + k * 1.1 + T.c[0] * .01) * sp * .2 + Math.sin(ph * 1.6 + i * 2.9 + k * 2.3 + T.c[1] * .02) * sp * .09]);
    }
    return P;
  }
  function placeT(T, P) { var a = (T.a || 0) * Math.PI / 180; return P.map(function (p) { var q = rot(p, a); return [T.c[0] + q[0], T.c[1] + q[1]]; }); }
  /* T.m: a fine wiggle along the thread, m units each side, about every 11 units of its length: a long thread of DNA
     lies crinkled, never as straight runs (Daniel, 5 Nov 2026: "show actually that they're very long strands of DNA …
     otherwise it feels that when the chromosome coils, suddenly you get more DNA for free") */
  function territory(T, ph) {
    var P = placeT(T, smooth(folds(T, ph)));
    if (!T.m) return P;
    var d = 0; for (var i = 1; i < P.length; i++) d += dist(P[i - 1], P[i]);
    var Q = resample(P, Math.round(d / 2.2)), Nq = normals(Q), seed = T.c[0] * .37 + T.c[1] * .11;
    return Q.map(function (q, i) { var s = i * 2.2, w = T.m * (Math.sin(s * .57 + seed) + .45 * Math.sin(s * 1.31 + seed * 2.3 + ph * .6)); return [q[0] + Nq[i][1][0] * w, q[1] + Nq[i][1][1] * w]; });
  }
  /* the raw point in the middle of the middle fold (a zoom into the thread goes there: it runs across) */
  function territoryMid(T, ph) {
    var raw = placeT(T, folds(T, ph))[Math.floor(T.n / 2) * 7 + 3], P = territory(T, ph), best = 0;
    P.forEach(function (p, i) { if (dist(p, raw) < dist(P[best], raw)) best = i; });
    var a = P[Math.max(0, best - 2)], b = P[Math.min(P.length - 1, best + 2)];
    return { p: P[best], ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  }
  var CROSS = { cen: .42, arm: 24 * Math.PI / 180 };
  /* arm (optional): how far each arm leans; 0 gives the two copies side by side, parallel, the shape they coil into
     before their arms open into the cross */
  function crossRod(T, c, arm) {
    var sg = c ? 1 : -1, r = T.w / 2, up = CROSS.cen * T.len - r, dn = (1 - CROSS.cen) * T.len - r, a = (T.x || 0) * Math.PI / 180, th = arm == null ? CROSS.arm : arm;
    var p0 = [sg * r * .7, (CROSS.cen - .5) * T.len];
    function P(q) { var z = rot(q, a); return [T.c[0] + z[0], T.c[1] + z[1]]; }
    return { p0: P(p0), top: P([p0[0] + sg * up * Math.sin(th), p0[1] - up * Math.cos(th)]), bot: P([p0[0] + sg * dn * Math.sin(th), p0[1] + dn * Math.cos(th)]),
             up: up, dn: dn, cen: P([0, (CROSS.cen - .5) * T.len]) };
  }
  /* a straight single rod of the same chromosome (a copy on its own), centred at (x, y), at angle a (radians, 0 upright) */
  function straightRod(T, x, y, a) {
    var r = T.w / 2, L = T.len, up = CROSS.cen * L - r, dn = (1 - CROSS.cen) * L - r;
    function P(q) { var z = rot(q, a || 0); return [x + z[0], y + z[1]]; }
    var p0 = [0, (CROSS.cen - .5) * L];
    return { p0: P(p0), top: P([0, p0[1] - up]), bot: P([0, p0[1] + dn]), up: up, dn: dn, cen: P(p0) };
  }
  function mixRod(a, b, k) { return { p0: mix(a.p0, b.p0, k), top: mix(a.top, b.top, k), bot: mix(a.bot, b.bot, k), up: lerp(a.up, b.up, k), dn: lerp(a.dn, b.dn, k), cen: mix(a.cen, b.cen, k) }; }
  function rodAt(rd, s) { var u = s * (rd.up + rd.dn); return u < rd.up ? mix(rd.top, rd.p0, u / rd.up) : mix(rd.p0, rd.bot, (u - rd.up) / rd.dn); }
  /* o.band: f or [f…] (a gene: a yellow length of the thread, a yellow band across the cross's arms); o.join: the two copies
     meet at the centromere, a dot, as soon as the copy has passed it ("joined at one point"); o.tail: f, or [f0, f1] one per
     copy: from f to the end the copy is the OTHER parent's colour (crossing over, IB), never a blend of the two; o.cen:
     false, no centromere dot (a copy on its own at IGCSE); o.bandOp: the bands' opacity (a band that appears). Without them,
     the drawing is as before */
  var GENE = .04;
  function part(P, s0, s1) { var n = P.length - 1, i0 = Math.max(0, Math.round(s0 * n)), i1 = Math.min(n, Math.round(s1 * n)); return i1 > i0 ? P.slice(i0, i1 + 1) : null; }
  function armPts(rd, s0, s1) { var out = [rodAt(rd, s0)], c = rd.up / (rd.up + rd.dn); if (s0 < c && s1 > c) out.push(rd.p0); out.push(rodAt(rd, s1)); return out; }
  /* points along a thread: 300, or for a long crinkled one (T.m) one every 1.8 units, at most 900 */
  function nPts(T, P) { if (!T.m) return 300; var d = 0; for (var i = 1; i < P.length; i++) d += dist(P[i - 1], P[i]); return Math.max(300, Math.min(900, Math.round(d / 1.8))); }
  function sstep(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }
  function coiled(T, ph, k, wd, o) {
    o = o || {};
    var faint = T.who === 'faint', cls = faint ? 'thr thr--faint' : 'thr thr--' + T.who;
    var bop = o.bandOp == null ? 1 : o.bandOp, bands = o.band == null || bop <= .01 ? [] : [].concat(o.band), tails = o.tail == null ? [] : [].concat(o.tail), other = T.who === 'dad' ? 'mum' : 'dad';
    function genes(P, w, op) { var g = ''; bands.forEach(function (f) { var Q = part(P, f - GENE, f + GENE); if (Q) g += '<path class="thr thr--gene" d="' + poly(Q) + '" stroke-width="' + n1(w) + '"' + opa(op) + '/>'; }); return g; }
    if (k < 0 && o.copy == null) {
      if (!bands.length && !tails.length) return '<path class="' + cls + '" d="' + poly(territory(T, ph)) + '" stroke-width="' + wd + '"/>';
      var P10 = o.base || territory(T, ph), P1 = resample(P10, nPts(T, P10)), q1 = tails[0] != null ? part(P1, tails[0], 1) : null;
      return '<path class="' + cls + '" d="' + poly(P1) + '" stroke-width="' + wd + '"/>' + (q1 ? '<path class="thr thr--' + other + '" d="' + poly(q1) + '" stroke-width="' + wd + '"/>' : '') + genes(P1, wd * 2.2, bop);
    }
    var P0 = o.base || territory(T, ph), N = nPts(T, P0), base = resample(P0, N), out = '', kk = Math.max(0, k), turns = Math.round(T.len * .42), r = T.w * .46 * Math.pow(kk, .8);
    var body = Math.min(1, Math.max(0, (kk - .72) / .28)), arm = faint ? 'zm__arm zm__arm--faint' : 'zm__arm zm__arm--' + T.who;
    var copy = o.copy == null ? 1 : o.copy, copies = o.one ? [0] : [0, 1], iC = Math.round(CROSS.cen * (N - 1));
    /* coiling in place, in three movements, so a pupil can follow each copy into its own side of the cross (Daniel,
       5 Nov 2026: "one strand becomes one side of the cross and the other becomes the other side … could be done more
       clearly"): the two copies shorten into two thin parallel strands with a gap between them, linked at one point
       (k1); each coils into a short, thick rod, clearly two (k2); then their arms swing apart from the joining point
       and the two become the cross (k3) */
    /* o.cross: the cross it coils into stands at another place (a chromosome moving as it coils); its three movements are
       the same */
    var X = o.cross || (o.rods ? null : T), two = !!X && !o.one, k1 = two ? sstep(kk / .35) : 1, k2 = two ? sstep((kk - .3) / .35) : 1, k3 = two ? sstep((kk - .68) / .32) : 1;
    if (two) { r = T.w * .46 * lerp(.22, 1, k2) * Math.pow(k1, .8); body = sstep((kk - .5) / .2); }
    function parRod(c) { var q = crossRod(X, c, 0), g = (c ? 1 : -1) * T.w * .75, dd = rot([g - (c ? 1 : -1) * T.w * .35, 0], (X.x || 0) * Math.PI / 180);
      function m(p) { return [p[0] + dd[0], p[1] + dd[1]]; }
      return { p0: m(q.p0), top: m(q.top), bot: m(q.bot), up: q.up, dn: q.dn, cen: q.cen }; }
    var nowRods = [];
    copies.forEach(function (c) {
      var rdF = X ? crossRod(X, c) : o.rods(c), rd = two ? mixRod(parRod(c), rdF, k3) : rdF, tl = tails.length > 1 ? tails[c] : tails[0];
      nowRods[c] = rd;
      var aw = n1(T.w * .9), ao = opa(body * (faint ? 1 : .8));
      if (body > 0) {
        if (tl == null) out += '<path class="' + arm + '" d="M' + n1(rd.top[0]) + ' ' + n1(rd.top[1]) + ' L' + n1(rd.p0[0]) + ' ' + n1(rd.p0[1]) + ' L' + n1(rd.bot[0]) + ' ' + n1(rd.bot[1]) +
          '" stroke-width="' + aw + '"' + ao + '/>';
        else out += '<path class="' + arm + '" d="' + poly(armPts(rd, 0, tl)) + '" stroke-width="' + aw + '"' + ao + '/><path class="zm__arm zm__arm--' + other + '" d="' + poly(armPts(rd, tl, 1)) + '" stroke-width="' + aw + '"' + ao + '/>';
      }
      /* where the copy has been made, the two threads lie side by side; ahead of it, one thread */
      var ends = c ? Math.max(2, Math.round(copy * (N - 1))) : N;
      var S = o.one ? base : shift(base, function (i) { var f = Math.min(1, Math.max(0, (copy * (N - 1) - i) / 14)), j = o.join ? Math.min(1, Math.abs(i - iC) / 14) : 1; return (c ? 1.7 : -1.7) * f * j * j * (3 - 2 * j); });
      var A = S.slice(0, ends).map(function (p, i) { return mix(p, rodAt(rd, i / (N - 1)), two ? k1 : kk); }), Nn = normals(A);
      var Q = A.map(function (p, i) { var s = i / (N - 1), a = 2 * Math.PI * turns * s, q = Nn[i]; return [p[0] + q[1][0] * r * Math.sin(a) + q[0][0] * r * .5 * Math.cos(a), p[1] + q[1][1] * r * Math.sin(a) + q[0][1] * r * .5 * Math.cos(a)]; });
      var sw = n1(lerp(wd, wd * 1.3, kk)), so = opa(1 - .4 * body);
      var iT = tl == null ? Q.length : Math.round(tl * (N - 1)), own = tl == null ? Q : Q.slice(0, Math.min(Q.length, iT + 1));
      if (own.length > 1) out += '<path class="' + cls + '" d="' + poly(own) + '" stroke-width="' + sw + '"' + so + '/>';
      if (iT < Q.length - 1) out += '<path class="thr thr--' + other + '" d="' + poly(Q.slice(iT)) + '" stroke-width="' + sw + '"' + so + '/>';
      /* the gene: the same solid yellow on every copy, drawn over the copy, never under its coil (the audit, 5 Nov 2026) */
      if (body > 0) bands.forEach(function (f) { out += '<path class="zm__arm zm__arm--gene" d="' + poly(armPts(rd, f - GENE, f + GENE)) + '" stroke-width="' + aw + '" stroke-linecap="butt"' + opa(body * bop) + '/>'; });
      bands.forEach(function (f) { var i0 = Math.round((f - GENE) * (N - 1)), i1 = Math.round((f + GENE) * (N - 1)); if (i1 < Q.length) out += '<path class="thr thr--gene" d="' + poly(Q.slice(i0, i1 + 1)) + '" stroke-width="' + n1(lerp(wd * 2.2, wd * 1.3, kk)) + '"' + opa(bop) + '/>'; });
      if (o.split && body > 0 && o.cen !== false) out += '<circle class="ch__cen ch--' + (faint ? 'mum zm__cen--faint' : T.who) + '" cx="' + n1(rd.p0[0]) + '" cy="' + n1(rd.p0[1]) + '" r="' + n1(T.w * .42) + '"' + opa(body) + '/>';
    });
    /* while the two coiled copies stand apart, a short link between them at their joining point: still one chromosome */
    if (two && nowRods[1] && body > 0 && k3 < 1) out += '<path class="' + arm + '" d="M' + n1(nowRods[0].p0[0]) + ' ' + n1(nowRods[0].p0[1]) + ' L' + n1(nowRods[1].p0[0]) + ' ' + n1(nowRods[1].p0[1]) +
      '" stroke-width="' + n1(T.w * .45) + '"' + opa(body * (1 - k3) * (faint ? 1 : .9)) + '/>';
    /* joined at one point: the dot of the centromere on the thread, once the copy has passed it */
    if (o.join && !o.one && body < 1 && copy * (N - 1) > iC + 7) {
      var pc = mix(base[iC], rodAt(crossRod(T, 0), CROSS.cen), kk);
      if (o.rods) pc = mix(base[iC], o.rods(0).cen, kk);
      out += '<circle class="ch__cen ch--' + (faint ? 'mum zm__cen--faint' : T.who) + '" cx="' + n1(pc[0]) + '" cy="' + n1(pc[1]) + '" r="' + n1(Math.max(2.6, wd * 1.9)) + '"' + opa(Math.min(1, (copy * (N - 1) - iC - 7) / 10) * (1 - body)) + '/>';
    }
    if (!o.split && body > 0 && o.cen !== false) { var cn = (o.rods ? o.rods(0) : crossRod(T, 0)).cen; out += '<circle class="ch__cen ch--' + (faint ? 'mum zm__cen--faint' : T.who) + '" cx="' + n1(cn[0]) + '" cy="' + n1(cn[1]) + '" r="' + n1(T.w * .42) + '"' + opa(body) + '/>'; }
    return out;
  }
  function envelope(cx, cy, rx, ry, np, o) {
    var out = '<ellipse class="nucb" cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + n1(rx) + '" ry="' + n1(ry) + '"' + opa(o == null ? 1 : o) + '/>' +
      '<ellipse class="zm__env" cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + n1(rx - rx * .018 - 1.2) + '" ry="' + n1(ry - ry * .018 - 1.2) + '"' + opa(o == null ? 1 : o) + '/>';
    for (var i = 0; i < np; i++) {
      var a = (i + .3) * 2 * Math.PI / np, px = cx + rx * Math.cos(a), py = cy + ry * Math.sin(a), deg = Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)) * 180 / Math.PI;
      out += '<rect class="pore" x="' + n1(-rx * .03 - 1) + '" y="' + n1(-rx * .012 - 1.4) + '" width="' + n1(rx * .06 + 2) + '" height="' + n1(rx * .024 + 2.8) + '" rx="1" transform="translate(' + n1(px) + ' ' + n1(py) + ') rotate(' + n1(deg) + ')"' + opa(o == null ? 1 : o) + '/>';
    }
    return out;
  }
  /* ---------- a cell dividing (the divisions, js/w-divide.js and js/w-divide-ib.js, 5 Nov 2026) ----------
     veeRod(T, p, trail, th, side)   one copy pulled by its centromere: the centromere at p leads, its two arms trail behind
                        it along `trail` (a unit vector), opened th radians each side; side +1 puts the arm that holds the
                        top of the chromosome (f < .42) on the trail's left, -1 on its right. A rod, as crossRod gives
     opening(cx, cy, rx, ry, np, k, op)   the nucleus's envelope breaking into small pieces (k 0 whole … 1 small pieces,
                        drifted out a little), or, run backwards, the pieces joining into a new envelope
     fibres(p, ends, op, rays)   thin fibres from a pole p to points (IB: spindle microtubules); rays: short ones round it
     pinch(c, a, b, rx, ry, horiz)   a cell dividing in two: two overlapping ellipses (centres a and b on one line) pinched
                        where they meet, then two cells; { svg, w (the waist's half-width), m (where it is) } */
  function veeRod(T, p, trail, th, side) {
    var r = T.w / 2, up = CROSS.cen * T.len - r, dn = (1 - CROSS.cen) * T.len - r, sd = side || 1;
    var a1 = rot(trail, -sd * th), a2 = rot(trail, sd * th);
    return { p0: p, top: [p[0] + a1[0] * up, p[1] + a1[1] * up], bot: [p[0] + a2[0] * dn, p[1] + a2[1] * dn], up: up, dn: dn, cen: p };
  }
  function opening(cx, cy, rx, ry, np, k, op) {
    op = op == null ? 1 : op;
    if (op <= .02) return '';
    if (k <= .001) return envelope(cx, cy, rx, ry, np, op);
    /* the pieces are the lengths between the pores (so the outline does not jump when it starts to break), and as they
       drift out a little each closes into a small round vesicle (IB B2.2.6) */
    var n = np, d = 1 + .08 * k, gap = Math.min(.45, (rx * .06 + 2) / (2 * Math.PI * rx / n)), h = Math.PI / n * (1 - gap) * (1 - .8 * k);
    var arcs = 1 - Math.min(1, Math.max(0, (k - .55) / .35)), ves = Math.min(1, Math.max(0, (k - .45) / .4));
    var out = '<ellipse class="nucghost" cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + n1(rx) + '" ry="' + n1(ry) + '"' + opa(op * (1 - k)) + '/><g' + opa(op) + '>', a1 = '', v1 = '';
    for (var i = 0; i < n; i++) {
      var a = (i + .8) * 2 * Math.PI / n + .12 * k * Math.sin(i * 2.3), P = [], Q = [];
      for (var j = 0; j <= 6; j++) { var u = a - h + 2 * h * j / 6; P.push([cx + Math.cos(u) * rx * d, cy + Math.sin(u) * ry * d]); Q.push([cx + Math.cos(u) * (rx * d - rx * .018 - 1.2), cy + Math.sin(u) * (ry * d - ry * .018 - 1.2)]); }
      a1 += '<path class="nucpc" d="' + poly(P) + '"/><path class="nucpc nucpc--in" d="' + poly(Q) + '"/>';
      v1 += '<circle class="vesicle" cx="' + n1(cx + Math.cos(a) * rx * d) + '" cy="' + n1(cy + Math.sin(a) * ry * d) + '" r="' + n1(2.4 + .9 * k) + '"/>';
    }
    if (arcs > .02) out += '<g' + opa(arcs) + '>' + a1 + '</g>';
    if (ves > .02) out += '<g' + opa(ves) + '>' + v1 + '</g>';
    return out + '</g>';
  }
  /* the vesicles of a broken nucleus (`from`, np of them) gathering round the places of the new nuclei (`tos`, nt each): each
     lands where opening(to, nt, k = 1) draws one, so the new nuclei then close from them. horiz: the new nuclei left and
     right (else above and below) */
  function gather(from, np, tos, nt, k, op, horiz) {
    if (op <= .02) return '';
    var e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, out = '<g' + opa(op) + '>', d = 1.08, src = [];
    for (var i = 0; i < np; i++) { var a = (i + .8) * 2 * Math.PI / np + .12 * Math.sin(i * 2.3); src.push({ p: [from.cx + Math.cos(a) * from.rx * d, from.cy + Math.sin(a) * from.ry * d], s: horiz ? Math.cos(a) : Math.sin(a) }); }
    tos.forEach(function (t, j) {
      var mine = src.filter(function (q) { return j === 0 ? q.s < 0 : q.s >= 0; });
      for (var m = 0; m < nt; m++) {
        var b = (m + .8) * 2 * Math.PI / nt + .12 * Math.sin(m * 2.3), tp = [t.cx + Math.cos(b) * t.rx * d, t.cy + Math.sin(b) * t.ry * d];
        var sp = mine.length ? mine[Math.floor(m * mine.length / nt)].p : tp, p = mix(sp, tp, e);
        out += '<circle class="vesicle" cx="' + n1(p[0]) + '" cy="' + n1(p[1]) + '" r="3.3"/>';
      }
    });
    return out + '</g>';
  }
  function fibres(p, ends, op, rays) {
    if (op <= .02 || (!ends.length && !rays)) return '';
    var out = '<g class="mt"' + opa(op) + '>';
    ends.forEach(function (q) { out += '<path d="M' + n1(p[0]) + ' ' + n1(p[1]) + ' L' + n1(q[0]) + ' ' + n1(q[1]) + '"/>'; });
    if (rays) for (var k = 0; k < 7; k++) { var a = k * Math.PI * 2 / 7 + .3; out += '<path d="M' + n1(p[0]) + ' ' + n1(p[1]) + ' L' + n1(p[0] + Math.cos(a) * 14) + ' ' + n1(p[1] + Math.sin(a) * 14) + '"/>'; }
    return out + '</g>';
  }
  function pinch(c, a, b, rx, ry, horiz) {
    var h = Math.abs(b - a) / 2, m = (a + b) / 2, R = horiz ? rx : ry, Wd = horiz ? ry : rx;
    if (h < .3) return { svg: horiz ? cell(m, c, rx, ry) : cell(c, m, rx, ry), w: Wd, m: m };
    if (h >= R - .3) return { svg: horiz ? cell(a, c, rx, ry) + cell(b, c, rx, ry) : cell(c, a, rx, ry) + cell(c, b, rx, ry), w: 0, m: m };
    var w = Wd * Math.sqrt(1 - h * h / (R * R)), A = ' A' + n1(rx) + ' ' + n1(ry) + ' 0 1 ', d, e;
    if (!horiz) { d = 'M' + n1(c - w) + ' ' + n1(m) + A + '1 ' + n1(c + w) + ' ' + n1(m) + A + '1 ' + n1(c - w) + ' ' + n1(m) + ' Z'; e = [c, a, rx, ry, c, b, rx, ry]; }
    else { d = 'M' + n1(m) + ' ' + n1(c - w) + A + '0 ' + n1(m) + ' ' + n1(c + w) + A + '0 ' + n1(m) + ' ' + n1(c - w) + ' Z'; e = [a, c, rx, ry, b, c, rx, ry]; }
    return { svg: '<path class="cellb" data-e="' + e.map(n1).join(',') + '" d="' + d + '"/>', w: w, m: m };
  }
  /* ---------- the divisions' cell: the same chromosomes in the same places at every level (IGCSE and IB) ----------
     FOUR    the four chromosomes' territories in a nucleus of radius 1: a long pair A and a short pair B, one of each from
             the mother and the father; c the centre, R the radius, n the folds, a their angle; x the angle of the cross each
             coils into. A's thread is 1.71 times B's, as its cross
     TWO(a, b)   a gamete's two (one of each pair: A from parent a, B from parent b), the same lengths
     terr(lay, nu, s)   a layout's territories in a nucleus nu { cx, cy, rx, ry }, with each one's cross (s.LA, s.LB, s.w) and gene
     tmix(T, U, k), at(T, c, x)   a territory between two; the same chromosome with its cross centred at c, at angle x
     veePair(T, Te, p, q, k, horiz)   the two copies of the cross Te pulled apart, joining point first, to p and q: each a V
             whose arms close only as the copies separate (k), so an arm never swings through the other copy */
  var FOUR = [{ id: 'Am', who: 'mum', A: true, c: [-.38, -.34], R: .38, n: 7, a: 12, x: 15 },
              { id: 'Ad', who: 'dad', A: true, c: [.38, .36], R: .38, n: 7, a: -28, x: -20 },
              { id: 'Bm', who: 'mum', A: false, c: [-.36, .44], R: .285, n: 5, a: 64, x: 35 },
              { id: 'Bd', who: 'dad', A: false, c: [.40, -.40], R: .285, n: 5, a: -70, x: -30 }];
  function TWO(whoA, whoB) { return [{ id: 'A', who: whoA, A: true, c: [-.04, -.40], R: .46, n: 7, a: 8, x: 0 }, { id: 'B', who: whoB, A: false, c: [.05, .48], R: .345, n: 5, a: -10, x: 0 }]; }
  function terr(lay, nu, s) {
    var m = Math.min(nu.rx, nu.ry);
    return lay.map(function (q) { return { id: q.id, who: q.who, A: q.A, c: [nu.cx + q.c[0] * nu.rx, nu.cy + q.c[1] * nu.ry], R: q.R * m, n: q.n, a: q.a, x: q.x,
                                          len: q.A ? s.LA : s.LB, w: q.A ? s.w : s.w * .9, band: q.A ? .78 : .85 }; });
  }
  function tmix(T, U, k) { return Object.assign({}, T, { c: mix(T.c, U.c, k), R: lerp(T.R, U.R, k) }); }
  function at(T, c, x) { return Object.assign({}, T, { c: c, x: x }); }
  function veePair(T, Te, p, q, k, horiz, thEnd) {
    var a = crossRod(Te, 0).p0, b = crossRod(Te, 1).p0, e = Math.min(1, Math.max(0, (k - .03) / .42)), t1 = thEnd == null ? 18 : thEnd;
    var th = (114 - (114 - t1) * (e < .5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2)) * Math.PI / 180;
    var t0 = horiz ? [1, 0] : [0, 1], t1 = horiz ? [-1, 0] : [0, -1];
    return [veeRod(T, mix(a, p, k), t0, th, 1), veeRod(T, mix(b, q, k), t1, th, -1)];
  }
  /* nuclei(t, NU, tight, full, tm, horiz): the nucleus at a division, the same at every level: whole; its membrane breaking
     into pieces that close into vesicles; the vesicles staying, faint, until the new nuclei form; then gathering round each
     set of chromosomes and closing into a nuclear membrane close round them (tight), which grows (to full) as the
     chromosomes uncoil (the audit, 5 Nov 2026). tm: { brk, dim, gat, close, grow } ([from, to] each). Returns { svg, cur }:
     cur, the new nuclei at this moment (their territories follow them) */
  function nuclei(t, NU, tight, full, tm, horiz) {
    function sg(a) { return t <= a[0] ? 0 : t >= a[1] ? 1 : (t - a[0]) / (a[1] - a[0]); }
    var e = sg(tm.grow), g = e < .5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2, out = '';
    var cur = tight.map(function (q, j) { return { cx: lerp(q.cx, full[j].cx, g), cy: lerp(q.cy, full[j].cy, g), rx: lerp(q.rx, full[j].rx, g), ry: lerp(q.ry, full[j].ry, g) }; });
    if (t < tm.gat[0]) out += opening(NU.cx, NU.cy, NU.rx, NU.ry, 18, sg(tm.brk), 1 - .65 * sg(tm.dim));
    else if (t < tm.gat[1]) out += gather(NU, 18, tight, 14, sg(tm.gat), lerp(.35, 1, sg(tm.gat)), horiz);
    else cur.forEach(function (d) { out += opening(d.cx, d.cy, d.rx, d.ry, 14, 1 - sg(tm.close), 1); });
    return { svg: out, cur: cur };
  }
  /* uncoil(T, ph, u, wd, rod, o): a copy on its own (a rod or a V) becoming a thread in the territory T as u goes 0 → 1: first
     it thins where it lies (the coil loosens, the body fades), then its thin line unfolds into the territory; the gene
     stays a band on the line throughout (the audit, 5 Nov 2026: no fuzzy balls) */
  function uncoil(T, ph, u, wd, rod, o) {
    var N = 300, rp = [], k, base;
    for (var i = 0; i < N; i++) rp.push(rodAt(rod, i / (N - 1)));
    if (u < .5) { k = lerp(1, .22, u / .5); base = rp; }
    else { var m = (u - .5) / .5; m = m * m * (3 - 2 * m); k = lerp(.22, 0, m); var tp = resample(territory(T, ph), N); base = rp.map(function (p, j) { return mix(p, tp[j], m); }); }
    return coiled(T, ph, k, wd, Object.assign({ one: true, rods: function () { return rod; }, base: base }, o || {}));
  }
  var SEQ = 'ATGGCCTACGTTAGCATCGGATCCAGTTACGCTAGGCATTCAGCATGACTGGTACCGATTAGC', PAIR = { A: 'T', T: 'A', C: 'G', G: 'C' };
  function half(x, y1, y2, b, cls) { return '<line class="dna__b dna__b--' + b + ' ' + cls + '" x1="' + n1(x) + '" y1="' + n1(y1) + '" x2="' + n1(x) + '" y2="' + n1(y2) + '"/>'; }
  function duplex(o) {
    var x0 = o.x0, x1 = o.x1, A = o.A, P = o.P, ph = o.ph || 0, G = o.groove == null ? 2.4 : o.groove, lit = o.lit == null ? 1 : o.lit, seq = o.seq || SEQ;
    var F = o.fork, y0 = o.y, scl = o.cls || 'zm__s7', bcl = o.bcls || 'zm__b7';
    function d(x) { if (!F || x >= F.x) return 0; var k = Math.min(1, (F.x - x) / F.S); return F.D * k * k * (3 - 2 * k); }
    function made(x) { return F && x < F.x - F.gap; }
    function phi(x) { return ph + x * 2 * Math.PI / P; }
    /* the four lines: a (top old), b (bottom old), na (the new partner of a), nb (of b); each [x, y, depth] */
    var lines = { a: [], b: [], na: [], nb: [] };
    for (var x = x0; x <= x1; x += 2) {
      var f = phi(x), dd = d(x);
      lines.a.push([x, y0 - dd + A * Math.sin(f), Math.cos(f)]);
      lines.b.push([x, y0 + dd + A * Math.sin(f + G), Math.cos(f + G)]);
      if (made(x)) { lines.na.push([x, y0 - dd + A * Math.sin(f + G), Math.cos(f + G)]); lines.nb.push([x, y0 + dd + A * Math.sin(f), Math.cos(f)]); }
    }
    function runs(L, front) {
      var out = '', cur = [];
      L.forEach(function (p) { if ((p[2] > 0) === front) cur.push([p[0], p[1]]); else { if (cur.length > 1) out += poly(cur) + ' '; cur = cur.length ? [[p[0], p[1]]] : []; } });
      if (cur.length > 1) out += poly(cur);
      return out;
    }
    var back = '', front = '';
    [['a', 'zm__old'], ['b', 'zm__old'], ['na', 'zm__new'], ['nb', 'zm__new']].forEach(function (q) {
      var L = lines[q[0]]; if (L.length < 2) return;
      var oc = F ? ' ' + q[1] : '', bk = runs(L, false), fr = runs(L, true);
      if (bk) back += '<path class="dna__s ' + scl + ' zm__back' + oc + '" d="' + bk + '"/>';
      if (fr) front += '<path class="dna__s ' + scl + oc + '" d="' + fr + '"/>';
    });
    var mid = '';
    if (lit > 0) for (var j = 0; ; j++) {
      var xj = x0 + 4 + j * P / 10; if (xj > x1) break;
      var b = seq.charAt(j % seq.length), c = PAIR[b], f2 = phi(xj), dj = d(xj);
      var ya = y0 - dj + A * Math.sin(f2), yb = y0 + dj + A * Math.sin(f2 + G);
      if (!F || xj >= F.x) { var m = (ya + yb) / 2; mid += half(xj, ya, lerp(ya, m, lit), b, bcl) + half(xj, yb, lerp(yb, m, lit), c, bcl); continue; }
      var yna = y0 - dj + A * Math.sin(f2 + G), ynb = y0 + dj + A * Math.sin(f2), m1 = (ya + yna) / 2, m2 = (yb + ynb) / 2;
      mid += half(xj, ya, m1, b, bcl) + half(xj, yb, m2, c, bcl);
      if (made(xj)) mid += half(xj, yna, m1, c, bcl) + half(xj, ynb, m2, b, bcl);
    }
    return back + mid + front;
  }
  /* DNA as a ribbon two strands wide, the twist of its double helix marked (one tick every half turn) */
  /* bases (optional): each mark across the ribbon is a base pair, half in each base's colour (A–T, C–G), so the bases
     are there before a zoom into the DNA shows the double helix (Daniel, 5 Nov 2026: "show the base pairs already as
     you zoom in") */
  function ribbon(P, w, tick, cls, bases) {
    var out = '<path class="zm__dna' + (cls || '') + '" d="' + poly(P) + '" stroke-width="' + w + '"/>', acc = 0, N = normals(P);
    for (var i = 1; i < P.length; i++) {
      acc += dist(P[i - 1], P[i]);
      if (acc >= tick) {
        acc = 0; var t0 = N[i][0], q = N[i][1], h = w * .46;
        var x1 = P[i][0] - q[0] * h - t0[0] * 2.4, y1 = P[i][1] - q[1] * h - t0[1] * 2.4, x2 = P[i][0] + q[0] * h + t0[0] * 2.4, y2 = P[i][1] + q[1] * h + t0[1] * 2.4;
        if (bases) {
          var b = SEQ.charAt(bases.n++ % SEQ.length), xm = (x1 + x2) / 2, ym = (y1 + y2) / 2;
          out += '<line class="dna__b dna__b--' + b + ' zm__tk" x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(xm) + '" y2="' + n1(ym) + '"/>' +
                 '<line class="dna__b dna__b--' + PAIR[b] + ' zm__tk" x1="' + n1(xm) + '" y1="' + n1(ym) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '"/>';
        } else out += '<line class="zm__tick" x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '"/>';
      }
    }
    return out;
  }
  function bez(p0, p1, p2, p3, n) { var out = []; for (var i = 0; i <= n; i++) { var u = i / n, a = (1 - u) * (1 - u) * (1 - u), b = 3 * u * (1 - u) * (1 - u), c = 3 * u * u * (1 - u), d = u * u * u; out.push([a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]); } return out; }
  var NUC = { RW: 27, Q: .4, PITCH: 10, TURNS: 1.65, DW: 10, TICK: 8.5 };
  function beads(list, o) {
    o = o || {};
    var W = o.w || 340;
    function wrapAt(i, u) {
      var nc = list[i], th = Math.PI + u * NUC.TURNS * 2 * Math.PI, p = rot([NUC.RW * Math.cos(th), NUC.Q * NUC.RW * Math.sin(th) + NUC.PITCH * NUC.TURNS * (u - .5)], nc.a);
      return { p: [nc.c[0] + p[0], nc.c[1] + p[1]], front: Math.sin(th) > 0 };
    }
    function tang(i, u) { var a = wrapAt(i, u - .01).p, b = wrapAt(i, u).p, l = dist(a, b) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; }
    function linker(i) {
      var p0, d0, p3, d3;
      if (i < 0) { p3 = wrapAt(0, 0).p; d3 = tang(0, .01); p0 = o.inAt || [-14, p3[1] - 10]; d0 = [1, 0]; }
      else {
        p0 = wrapAt(i, 1).p; d0 = tang(i, 1);
        if (i + 1 < list.length) { p3 = wrapAt(i + 1, 0).p; d3 = tang(i + 1, .01); }
        else { p3 = o.outAt || [W + 14, p0[1] + 6]; d3 = [1, 0]; }
      }
      var k = Math.min(70, dist(p0, p3) * .45);
      return bez(p0, [p0[0] + d0[0] * k, p0[1] + d0[1] * k], [p3[0] - d3[0] * k, p3[1] - d3[1] * k], p3, 24);
    }
    /* each piece of DNA numbers its own base pairs from its own start, so a mark never changes colour when another piece
       is longer or shorter (Daniel, 5 Nov 2026: the bases "changing color constantly … it makes it look like the DNA
       … sliding") */
    function bs(seed) { return o.bases ? { n: seed } : null; }
    var svg = '';
    for (var i = -1; i < list.length; i++) svg += ribbon(linker(i), NUC.DW, NUC.TICK, '', bs(101 + i * 37));
    list.forEach(function (nc, i) {
      var rs = [], cur = null;
      for (var k = 0; k <= 80; k++) {
        var w = wrapAt(i, k / 80);
        if (!cur || cur.front !== w.front) { cur = { front: w.front, P: cur ? [cur.P[cur.P.length - 1], w.p] : [w.p] }; rs.push(cur); } else cur.P.push(w.p);
      }
      rs.forEach(function (r, j) { if (!r.front && r.P.length > 1) svg += ribbon(r.P, NUC.DW, NUC.TICK, ' zm__dna--back', bs(509 + i * 53 + j * 17)); });
      svg += '<g transform="translate(' + n1(nc.c[0]) + ' ' + n1(nc.c[1]) + ') rotate(' + n1(nc.a * 180 / Math.PI) + ')"><ellipse class="zm__hist" cx="0" cy="0" rx="24" ry="22"/>' +
        '<circle class="zm__histl" cx="-8.5" cy="-7.5" r="8.2"/><circle class="zm__histl" cx="8.5" cy="-7.5" r="8.2"/><circle class="zm__histl" cx="-8.5" cy="7.5" r="8.2"/><circle class="zm__histl" cx="8.5" cy="7.5" r="8.2"/></g>';
      rs.forEach(function (r, j) { if (r.front && r.P.length > 1) svg += ribbon(r.P, NUC.DW, NUC.TICK, '', bs(509 + i * 53 + j * 17)); });
    });
    return { svg: svg, wrapAt: wrapAt, linker: linker };
  }

  global.InhDraw = { chromo: chromo, vee: vee, bandAt: bandAt, cell: cell, nucleus: nucleus, helix: helix, allele: allele, person: person, threads: threads, threadStart: threadStart, n1: n1, esc: esc,
    poly: poly, smooth: smooth, resample: resample, normals: normals, shift: shift, territory: territory, territoryMid: territoryMid, CROSS: CROSS,
    crossRod: crossRod, straightRod: straightRod, mixRod: mixRod, rodAt: rodAt, veeRod: veeRod, FOUR: FOUR, TWO: TWO, terr: terr, tmix: tmix, at: at, veePair: veePair, coiled: coiled, uncoil: uncoil, nuclei: nuclei, envelope: envelope, opening: opening, gather: gather, fibres: fibres, pinch: pinch, mix: mix, rot: rot, duplex: duplex, ribbon: ribbon, beads: beads, NUC: NUC, SEQ: SEQ, PAIR: PAIR };
})(window);
