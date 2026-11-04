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

  global.InhDraw = { chromo: chromo, vee: vee, bandAt: bandAt, cell: cell, nucleus: nucleus, helix: helix, allele: allele, person: person, threads: threads, threadStart: threadStart, n1: n1, esc: esc };
})(window);
