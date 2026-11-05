/* ============================================================
   w-zoom.js — "From a cell to a gene" (station `genes`, 17.1.1–17.1.2, 17.2.3, 4.1.4). Eight steps, each held until
   "Next step", each picture enlarged from a part of the one before (or, twice, the one before seen from further away):
     1 a body cell: membrane, cytoplasm, mitochondria, ribosomes, the nucleus;
     2 the nucleus of a working cell: each chromosome a long, very thin thread, folded in its own part of the nucleus;
     3 one length of its DNA being copied: an enzyme separates the strands, a new strand is made along each, the bases
       pair A–T and C–G; two identical molecules of DNA;
     4 the nucleus again: each chromosome now two copies side by side; they coil until short and thick: a cross;
     5 part of one copy: its DNA folded into loops;
     6 the DNA wound round small balls of protein (histones), almost twice round each;
     7 the DNA itself, a double helix, and one gene;
     8 the pair the gene is on: chromosome 9 from the mother and from the father, each two identical copies, the allele
       for group A on the mother's and the allele for group O on the father's.
   Daniel, 4 Nov 2026: "very professional showing the DNA not condensed, then condensing into chromosomes, then seeing how
   replication happens, and then zooming in into the chromosome, seeing the histones and everything … the more realistic
   it is … the better". The order is the cell's: a chromosome is copied while it is still a thin thread (S phase), and
   only then coils (prophase).

   THE BIOLOGY, checked step by step:
   · working cell   chromatin in territories: one thread per chromosome, never crossing another (InhDraw.threads' rule)
   · copying        semi-conservative: each new molecule has one old strand and one new; the bases pair A–T, C–G; helicase
                    at the fork, DNA polymerase on each new strand (both new strands drawn made in one piece: one is really
                    made in short pieces, IB HL); the two new molecules are drawn apart for clarity (in a cell, they stay
                    together)
   · coiling        the copies coil, again and again, and stay joined at the centromere: the cross of the textbook (24°
                    arms, InhDraw.chromo); the nuclear membrane is still whole (it breaks only at the end of prophase)
   · loops          a chromatid's DNA in loops round its axis (thousands per chromatid)
   · nucleosomes    DNA (2 nm) wound 1.65 times round each core of histones (about 11 nm), linker DNA between
   · double helix   two strands, the bases between them, a major and a minor groove (the strands are not opposite)
   · sizes          each step's "Across the picture" is the real width it shows; the zooms between steps are not to scale
   SOURCES: syllabus 0610 2026–28 4.1.4, 17.1.1, 17.1.2, 17.2.3; IB Biology (2025) D2.1.5–D2.1.6, A1.2 (HL, nucleosomes).
   Every frame is a pure function of the time t (memory headless-raf-animations).
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, K = global.WKit, D = global.InhDraw; if (!L || !K || !D) return;
  var n1 = K.n1, seg = K.seg, ease = K.ease, lerp = K.lerp, clamp01 = K.clamp01;
  var W = 340, H = 380, CX = 170, CY = 190, PI = Math.PI, TZ = 1.8;
  var STEPS = [
    { h: 'A body cell', p: 'A cell from your body, about 25 micrometres across. Its **nucleus** holds the **chromosomes**: 46 in a human body cell.' },
    { h: 'Inside the nucleus', p: 'In a working cell each chromosome is a long, very thin thread of **DNA**, folded many times in its own part of the nucleus. Four of the 46 are coloured here.' },
    { h: 'Copying the DNA', p: 'Before a cell divides, each chromosome is copied exactly. An enzyme separates the two strands of its DNA, and a new strand is made along each one: the **bases** pair A with T, and C with G. The result is two identical molecules of DNA.' },
    { h: 'Coiling into a cross', p: 'Then each of the two copies coils, again and again, until it is short and thick. The copies stay joined at one point, so the chromosome is now a cross. You see a cross only while a cell divides.' },
    { h: 'Inside one copy', p: 'Enlarged: part of one copy. Its DNA is folded into thousands of loops, packed tightly side by side.' },
    { h: 'Wound round proteins', p: 'Enlarged again: the DNA is wound round small balls of protein, almost twice round each, like thread round beads. This is how about 2 metres of DNA is held in one nucleus.' },
    { h: 'The DNA, and a gene', p: 'Enlarged again: the DNA itself, two strands twisted into a **double helix**, with bases between them. A **gene** is one length of this DNA, which codes for a protein. One chromosome carries many genes.' },
    { h: 'A pair, and two alleles', p: 'Chromosomes are in pairs, one from each parent: here, chromosome 9 from the mother and chromosome 9 from the father. The **ABO gene** is at the same place on both. This person has the **allele** for blood group A on one and the allele for group O on the other. The two copies of a chromosome are identical, so both carry the same allele.' }
  ];
  var M = [0, 6, 14, 27, 39, 47, 56, 65, 75];
  var SEE = ['a body cell', 'its nucleus', 'DNA being copied', 'chromosomes coiling', 'part of one copy', 'DNA round proteins', 'the DNA and a gene', 'one pair'];
  var SIZE = ['about 25 µm (0.025 mm)', 'about 10 µm (0.01 mm)', 'about 14 nm (0.000014 mm)', 'about 10 µm (0.01 mm)', 'about 0.5 µm (0.0005 mm)',
              'about 70 nm (0.00007 mm)', 'about 8 nm (0.000008 mm)', 'about 7 µm (0.007 mm)'];

  /* ---------- small helpers ---------- */
  function pl(P) { var s = 'M' + n1(P[0][0]) + ' ' + n1(P[0][1]); for (var i = 1; i < P.length; i++) s += ' L' + n1(P[i][0]) + ' ' + n1(P[i][1]); return s; }
  function rot(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }
  function mix(p, q, k) { return [lerp(p[0], q[0], k), lerp(p[1], q[1], k)]; }
  function dist(p, q) { var dx = q[0] - p[0], dy = q[1] - p[1]; return Math.sqrt(dx * dx + dy * dy); }
  function op(o) { return o < .999 ? ' opacity="' + n1(Math.max(0, o) * 100) / 100 + '"' : ''; }
  var PANE = '<rect class="zm__pane" x="0" y="0" width="' + W + '" height="' + H + '" rx="14"/>';
  var SEQ = 'ATGGCCTACGTTAGCATCGGATCCAGTTACGCTAGGCATTCAGCATGACTGGTACCGATTAGC';
  var PAIR = { A: 'T', T: 'A', C: 'G', G: 'C' };
  function half(x, y1, y2, b, cls) { return '<line class="dna__b dna__b--' + b + ' ' + cls + '" x1="' + n1(x) + '" y1="' + n1(y1) + '" x2="' + n1(x) + '" y2="' + n1(y2) + '"/>'; }
  /* a quadratic B-spline through a list of points (smooth turns), sampled densely */
  function smooth(P) {
    var out = [P[0]], m0 = P[0];
    for (var i = 1; i < P.length - 1; i++) {
      var m1 = mix(P[i], P[i + 1], .5);
      for (var s = 1; s <= 6; s++) { var u = s / 6, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; out.push([a * m0[0] + b * P[i][0] + c * m1[0], a * m0[1] + b * P[i][1] + c * m1[1]]); }
      m0 = m1;
    }
    out.push(P[P.length - 1]); return out;
  }
  /* N points at equal steps along a line */
  function resample(P, N) {
    var d = [0], i; for (i = 1; i < P.length; i++) d.push(d[i - 1] + dist(P[i - 1], P[i]));
    var Lt = d[d.length - 1], out = [], j = 1;
    for (var k = 0; k < N; k++) { var s = Lt * k / (N - 1); while (j < d.length - 1 && d[j] < s) j++; out.push(mix(P[j - 1], P[j], (s - d[j - 1]) / ((d[j] - d[j - 1]) || 1))); }
    return out;
  }
  function normals(P) {
    return P.map(function (p, i) { var a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1; return [[dx / l, dy / l], [-dy / l, dx / l]]; });
  }
  function shift(P, dd) { var N = normals(P); return P.map(function (p, i) { return [p[0] + N[i][1][0] * dd, p[1] + N[i][1][1] * dd]; }); }

  /* ---------- the chromosomes of a working nucleus (steps 1, 2 and 4) ----------
     Each is one long thread folded to and fro in its own part of the nucleus (its territory), so no two ever cross. In the
     nucleus of step 2 (centre 170, 190; radii 150, 168): c the territory's centre, R its radius, n its folds, a the angle
     of the folds; x, len, w the angle, length and width of the cross it coils into. The first is the one followed. */
  var TER = [
    { who: 'mum', c: [110, 120], R: 50, n: 9, a: 0, x: 0, len: 80, w: 13 },
    { who: 'dad', c: [236, 258], R: 50, n: 9, a: 35, x: 28, len: 80, w: 13 },
    { who: 'mum', c: [98, 262], R: 38, n: 7, a: -50, x: -40, len: 56, w: 11 },
    { who: 'dad', c: [240, 126], R: 38, n: 7, a: 70, x: 64, len: 56, w: 11 },
    { who: 'faint', c: [175, 64], R: 28, n: 4, a: 15, x: 80, len: 44, w: 9 },
    { who: 'faint', c: [172, 188], R: 38, n: 5, a: -20, x: -15, len: 56, w: 10 },
    { who: 'faint', c: [168, 318], R: 30, n: 4, a: 50, x: 30, len: 46, w: 9 },
    { who: 'faint', c: [286, 190], R: 20, n: 3, a: 90, x: 5, len: 32, w: 8 },
    { who: 'faint', c: [56, 186], R: 22, n: 3, a: 10, x: -70, len: 34, w: 8 }
  ];
  /* more of the 46, in grey, in the room left (never overlapping a territory) */
  (function () {
    var R = K.rng(5);
    for (var tries = 0; tries < 900 && TER.length < 21; tries++) {
      var r = 14 + R() * 14, c = [30 + R() * 280, 30 + R() * 320], ok = true;
      for (var k = 0; k < 12 && ok; k++) { var a = k * PI / 6, x = c[0] + r * Math.cos(a), y = c[1] + r * Math.sin(a); if (Math.pow((x - CX) / 136, 2) + Math.pow((y - CY) / 154, 2) > 1) ok = false; }
      TER.forEach(function (T) { if (dist(T.c, c) < T.R + r + 5) ok = false; });
      if (ok) TER.push({ who: 'faint', c: c, R: r, n: r > 22 ? 4 : 3, a: Math.round(R() * 180), x: Math.round(R() * 180 - 90), len: Math.round(r * 1.5), w: 7 });
    }
  })();
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
  function place(T, P) { var a = T.a * PI / 180; return P.map(function (p) { var q = rot(p, a); return [T.c[0] + q[0], T.c[1] + q[1]]; }); }
  function thread(T, ph) { return place(T, smooth(folds(T, ph))); }
  /* where step 2 is enlarged into step 3: the middle of the followed thread's middle fold, which runs across */
  function focusThread(ph) {
    var T = TER[0], raw = place(T, folds(T, ph))[Math.floor(T.n / 2) * 7 + 3], P = thread(T, ph), best = P[0];
    P.forEach(function (p) { if (dist(p, raw) < dist(best, raw)) best = p; });
    return best;
  }
  var CEN = .42, ARM = 22 * PI / 180;
  /* one copy of a coiled chromosome (c 0: the left copy, 1: the right): its centromere end and its two ends */
  function rodOf(T, c) {
    var sg = c ? 1 : -1, r = T.w / 2, up = CEN * T.len - r, dn = (1 - CEN) * T.len - r, a = T.x * PI / 180;
    var p0 = [sg * T.w * .48, (CEN - .5) * T.len];
    function P(q) { var z = rot(q, a); return [T.c[0] + z[0], T.c[1] + z[1]]; }
    return { p0: P(p0), top: P([p0[0] + sg * up * Math.sin(ARM), p0[1] - up * Math.cos(ARM)]), bot: P([p0[0] + sg * dn * Math.sin(ARM), p0[1] + dn * Math.cos(ARM)]),
             up: up, dn: dn, cen: P([0, (CEN - .5) * T.len]) };
  }
  function rodAt(rd, s) { var u = s * (rd.up + rd.dn); return u < rd.up ? mix(rd.top, rd.p0, u / rd.up) : mix(rd.p0, rd.bot, (u - rd.up) / rd.dn); }
  /* a chromosome in the nucleus: kk -1, one thread (not yet copied); 0, two copies side by side; 0…1, coiling; 1, a cross */
  function chromosome(T, ph, kk, wd) {
    var cls = T.who === 'faint' ? 'thr thr--faint' : 'thr thr--' + T.who;
    if (kk < 0) return '<path class="' + cls + '" d="' + pl(thread(T, ph)) + '" stroke-width="' + wd + '"/>';
    var N = 300, base = resample(thread(T, ph), N), out = '', turns = Math.round(T.len * .42), r = T.w * .46 * Math.pow(kk, .8);
    var body = seg(kk, .72, 1), arm = T.who === 'faint' ? 'zm__arm zm__arm--faint' : 'zm__arm zm__arm--' + T.who;
    for (var c = 0; c < 2; c++) {
      var rd = rodOf(T, c);
      if (body > 0) out += '<path class="' + arm + '" d="M' + n1(rd.top[0]) + ' ' + n1(rd.top[1]) + ' L' + n1(rd.p0[0]) + ' ' + n1(rd.p0[1]) + ' L' + n1(rd.bot[0]) + ' ' + n1(rd.bot[1]) +
        '" stroke-width="' + n1(T.w * .9) + '"' + op(body * (T.who === 'faint' ? 1 : .8)) + '/>';
      var S = shift(base, c ? 1.7 : -1.7), A = S.map(function (p, i) { return mix(p, rodAt(rd, i / (N - 1)), kk); }), Nn = normals(A);
      var Q = A.map(function (p, i) { var s = i / (N - 1), a = 2 * PI * turns * s, q = Nn[i]; return [p[0] + q[1][0] * r * Math.sin(a) + q[0][0] * r * .5 * Math.cos(a), p[1] + q[1][1] * r * Math.sin(a) + q[0][1] * r * .5 * Math.cos(a)]; });
      out += '<path class="' + cls + '" d="' + pl(Q) + '" stroke-width="' + n1(lerp(wd, wd * 1.3, kk)) + '"' + op(1 - .4 * body) + '/>';
    }
    if (body > 0) out += '<circle class="ch__cen ch--' + (T.who === 'faint' ? 'mum zm__cen--faint' : T.who) + '" cx="' + n1(rodOf(T, 0).cen[0]) + '" cy="' + n1(rodOf(T, 0).cen[1]) + '" r="' + n1(T.w * .42) + '"' + op(body) + '/>';
    return out;
  }
  /* the nucleus's two membranes, with pores */
  function envelope(cx, cy, rx, ry, np) {
    var out = '<ellipse class="nucb" cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + n1(rx) + '" ry="' + n1(ry) + '"/>' +
      '<ellipse class="zm__env" cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + n1(rx - rx * .018 - 1.2) + '" ry="' + n1(ry - ry * .018 - 1.2) + '"/>';
    for (var i = 0; i < np; i++) {
      var a = (i + .3) * 2 * PI / np, px = cx + rx * Math.cos(a), py = cy + ry * Math.sin(a), deg = Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)) * 180 / PI;
      out += '<rect class="pore" x="' + n1(-rx * .03 - 1) + '" y="' + n1(-rx * .012 - 1.4) + '" width="' + n1(rx * .06 + 2) + '" height="' + n1(rx * .024 + 2.8) + '" rx="1" transform="translate(' + n1(px) + ' ' + n1(py) + ') rotate(' + n1(deg) + ')"/>';
    }
    return out;
  }
  function nucleusFrame(t, kk, wd) {
    var ph = t * .5, out = envelope(CX, CY, 150, 168, 18);
    TER.slice().reverse().forEach(function (T) { out += chromosome(T, ph, kk, wd); });
    return out;
  }

  /* ---------- step 1: a body cell ---------- */
  var CELL = (function () {
    var P = []; for (var i = 0; i < 90; i++) { var a = i / 90 * 2 * PI, r = 152 * (1 + .05 * Math.sin(3 * a + .4) + .03 * Math.sin(5 * a + 1.3)); P.push([CX + r * Math.cos(a), CY + r * Math.sin(a) * .92]); }
    return P;
  })();
  var NU1 = [186, 178, 58, 65], Z1 = 150 / 58;
  var MITO = [[72, 136, 30], [82, 262, -20], [134, 292, 60], [236, 280, 15], [290, 222, -70], [256, 120, 40], [126, 92, -10]];
  var RIBS = (function () {
    var R = K.rng(17), out = [];
    while (out.length < 70) {
      var a = R() * 2 * PI, f = .2 + .75 * Math.sqrt(R()), x = CX + Math.cos(a) * 134 * f, y = CY + Math.sin(a) * 120 * f;
      var dn = Math.pow((x - NU1[0]) / (NU1[2] + 8), 2) + Math.pow((y - NU1[1]) / (NU1[3] + 8), 2);
      if (dn > 1 && !MITO.some(function (m) { return dist(m, [x, y]) < 14; })) out.push([x, y]);
    }
    return out;
  })();
  function frame1(t) {
    var out = PANE + '<path class="cellb" data-e="170,190,136,124" d="' + pl(CELL) + ' Z"/>';
    RIBS.forEach(function (p) { out += '<circle class="zm__rib" cx="' + n1(p[0]) + '" cy="' + n1(p[1]) + '" r="1.7"/>'; });
    MITO.forEach(function (m) {
      out += '<g transform="translate(' + m[0] + ' ' + m[1] + ') rotate(' + m[2] + ')"><ellipse class="mito" cx="0" cy="0" rx="10" ry="5"/>' +
        '<path class="zm__cr" d="M-6 -3.6 L-6 1.6 M-2 3.6 L-2 -1.6 M2 -3.6 L2 1.6 M6 3.6 L6 -1.6"/></g>';
    });
    out += envelope(NU1[0], NU1[1], NU1[2], NU1[3], 10);
    out += '<g transform="translate(' + NU1[0] + ' ' + NU1[1] + ') scale(' + n1(1000 / Z1) / 1000 + ') translate(' + (-CX) + ' ' + (-CY) + ')">';
    TER.slice().reverse().forEach(function (T) { out += chromosome(T, t * .5, -1, 2.4); });
    return out + '</g>';
  }
  function labels1() {
    var m = MITO[1], rb = RIBS.filter(function (p) { return p[0] > 250 && p[1] > 140 && p[1] < 200; })[0] || RIBS[0];
    return [{ id: 'mem', text: 'cell membrane', x: CELL[45][0], y: CELL[45][1], side: 'L' }, { id: 'cyt', text: 'cytoplasm', x: 54, y: 200, side: 'L' },
            { id: 'mit', text: 'a mitochondrion', x: m[0] - 6, y: m[1] + 2, side: 'L' }, { id: 'rib', text: 'ribosomes', x: rb[0], y: rb[1], side: 'R' },
            { id: 'nuc', text: 'nucleus', x: NU1[0] + NU1[2], y: NU1[1] - 10, side: 'R' }];
  }

  /* ---------- step 2: the nucleus of a working cell ---------- */
  function frame2(t) { return PANE + nucleusFrame(t, -1, 1.3); }
  function labels2(t) {
    var a = thread(TER[0], t * .5)[0], g = thread(TER[6], t * .5);
    return [{ id: 'chr', text: 'one chromosome: a long, very thin thread of DNA', x: a[0], y: a[1], side: 'L' },
            { id: 'oth', text: 'other chromosomes', x: g[g.length - 1][0], y: g[g.length - 1][1], side: 'R' },
            { id: 'mem', text: 'the membrane of the nucleus', x: CX + 150, y: CY - 30, side: 'R' }];
  }

  /* ---------- step 3: copying the DNA ---------- */
  var Y3 = 190, A3 = 22, P3 = 84, D3 = 70, S3 = 62, G3 = 16;
  function fork(t) { return lerp(-40, W + 50, ease(seg(t - M[2], 1.6, 11.4))); }
  function frame3(t) {
    var Xf = fork(t), out = PANE, o1 = [], o2 = [], w1 = [], w2 = [];
    function dOf(x) { if (x >= Xf) return 0; var k = clamp01((Xf - x) / S3); return D3 * k * k * (3 - 2 * k); }
    function sOf(x) { return Math.sin(.4 + x * 2 * PI / P3) * A3; }
    for (var x = -12; x <= W + 12; x += 2.5) {
      var s = sOf(x), d = dOf(x);
      o1.push([x, Y3 - d + s]); o2.push([x, Y3 + d - s]);
      if (x < Xf - G3) { w1.push([x, Y3 - d - s]); w2.push([x, Y3 + d + s]); }
    }
    for (var j = 0; j * P3 / 10 < W + 6; j++) {
      var xj = j * P3 / 10 + 2.9, b = SEQ.charAt(j % SEQ.length), c = PAIR[b], sj = sOf(xj), dj = dOf(xj);
      if (xj >= Xf) out += half(xj, Y3 + sj, Y3, b, 'zm__b') + half(xj, Y3, Y3 - sj, c, 'zm__b');
      else {
        out += half(xj, Y3 - dj + sj, Y3 - dj, b, 'zm__b') + half(xj, Y3 + dj - sj, Y3 + dj, c, 'zm__b');
        if (xj < Xf - G3) out += half(xj, Y3 - dj, Y3 - dj - sj, c, 'zm__b') + half(xj, Y3 + dj, Y3 + dj + sj, b, 'zm__b');
      }
    }
    out += '<path class="dna__s zm__old" d="' + pl(o1) + '"/><path class="dna__s zm__old" d="' + pl(o2) + '"/>';
    if (w1.length > 1) out += '<path class="dna__s zm__new" d="' + pl(w1) + '"/><path class="dna__s zm__new" d="' + pl(w2) + '"/>';
    if (Xf > -20 && Xf < W + 30) {
      var dp = dOf(Xf - G3 - 2);
      out += '<ellipse class="zm__enz" cx="' + n1(Xf + 8) + '" cy="' + Y3 + '" rx="16" ry="27"/>';
      out += '<ellipse class="zm__enz" cx="' + n1(Xf - G3 - 2) + '" cy="' + n1(Y3 - dp) + '" rx="13" ry="12"/><ellipse class="zm__enz" cx="' + n1(Xf - G3 - 2) + '" cy="' + n1(Y3 + dp) + '" rx="13" ry="12"/>';
    }
    return out;
  }
  function labels3(t) {
    var Xf = fork(t), out = [];
    function dOf(x) { if (x >= Xf) return 0; var k = clamp01((Xf - x) / S3); return D3 * k * k * (3 - 2 * k); }
    function sOf(x) { return Math.sin(.4 + x * 2 * PI / P3) * A3; }
    function side(x) { return x > CX ? 'R' : 'L'; }
    if (Xf > W + 10) {
      out.push({ id: 'two', text: 'two identical molecules of DNA', x: 24, y: Y3 - D3 + sOf(24), side: 'L' });
      out.push({ id: 'each', text: 'each: one old strand (grey) and one new strand (violet)', x: 316, y: Y3 + D3 + sOf(316), side: 'R' });
      return out;
    }
    if (Xf + 8 > 6 && Xf + 8 < W - 6) out.push({ id: 'hel', text: 'an enzyme separates the strands (IB: helicase)', x: Xf + 8, y: Y3 - 20, side: side(Xf + 8) });
    var xp = Xf - G3 - 2;
    if (xp > 8 && xp < W - 8) out.push({ id: 'pol', text: 'an enzyme makes each new strand (IB: DNA polymerase)', x: xp, y: Y3 + dOf(xp) + 9, side: side(xp) });
    var xn = Xf - 70;
    if (xn > 8) out.push({ id: 'new', text: 'a new strand, made along each old one', x: xn, y: Y3 - dOf(xn) - sOf(xn), side: 'L' });
    for (var j = 0; j < 80; j++) { var xj = j * P3 / 10 + 2.9; if (xj > Xf + 36 && Math.abs(sOf(xj)) > 13) { if (xj < W - 8) out.push({ id: 'bas', text: 'bases: A with T, C with G', x: xj, y: Y3 + sOf(xj) / 2, side: 'R' }); break; } }
    return out;
  }

  /* ---------- step 4: the copies coil ---------- */
  function coilK(t) { return ease(seg(t - M[3], 2.2, 10.4)); }
  function frame4(t) { return PANE + nucleusFrame(t, coilK(t), 1.3); }
  function labels4(t) {
    var k = coilK(t), rd = rodOf(TER[0], 0);
    if (k < .05) return [{ id: 'cop', text: 'each chromosome: two copies, side by side', x: thread(TER[0], t * .5)[0][0], y: thread(TER[0], t * .5)[0][1], side: 'L' }];
    if (k < .96) return [{ id: 'coil', text: 'each copy coils, again and again', x: lerp(thread(TER[0], t * .5)[0][0], rd.top[0], k), y: lerp(thread(TER[0], t * .5)[0][1], rd.top[1], k), side: 'L' }];
    var r0 = rodOf(TER[0], 1), g = rodOf(TER[6], 1);
    return [{ id: 'x', text: 'one chromosome: a cross of two identical copies', x: rd.top[0], y: rd.top[1], side: 'L' },
            { id: 'cen', text: 'the copies, joined at one point', x: r0.p0[0] + 2, y: r0.p0[1], side: 'R' },
            { id: 'oth', text: 'other chromosomes, coiled too', x: g.bot[0], y: g.bot[1], side: 'R' }];
  }
  function armFocus() { var rd = rodOf(TER[0], 0); return mix(rd.p0, rd.top, .5); }

  /* ---------- step 5: part of one copy, its DNA in loops ---------- */
  var AX5 = [-Math.sin(ARM), -Math.cos(ARM)], NX5 = [Math.cos(ARM), -Math.sin(ARM)];
  /* the loops: each a long, narrow petal from the copy's axis, about 80 to 110 units long, one every 9 units on each side
     (a chromatid has thousands); the paler ones lie behind */
  var LOOPS = (function () {
    var R = K.rng(29), out = [];
    for (var i = -26; i <= 26; i++) for (var sd = -1; sd <= 1; sd += 2)
      out.push({ i: i, sd: sd, s: i * 9 + sd * 2.2 + (R() - .5) * 3, len: 82 + R() * 30, wid: 7 + R() * 5, tilt: (R() - .5) * .45, back: R() < .4, ph: R() * 6 });
    return out;
  })();
  function loopTip(q, t) {
    var ang = q.tilt + .05 * Math.sin(t * .8 + q.ph), d = rot([NX5[0] * q.sd, NX5[1] * q.sd], ang), b = [CX + AX5[0] * q.s, CY + AX5[1] * q.s];
    return { b: b, d: d, tip: [b[0] + d[0] * q.len, b[1] + d[1] * q.len] };
  }
  function frame5(t) {
    var out = PANE, back = '', front = '';
    LOOPS.forEach(function (q) {
      var g = loopTip(q, t), b = g.b, d = g.d, Lq = q.len, w = q.wid, a = AX5;
      function P(u, v) { return n1(b[0] + d[0] * u + a[0] * v) + ' ' + n1(b[1] + d[1] * u + a[1] * v); }
      var path = '<path class="zm__loop' + (q.back ? ' zm__loop--b' : '') + '" d="M' + P(0, -2.5) + ' C' + P(Lq * .3, -w) + ' ' + P(Lq * .96, -w * .9) + ' ' + P(Lq, 0) +
        ' C' + P(Lq * .96, w * .9) + ' ' + P(Lq * .3, w) + ' ' + P(0, 2.5) + '"/>';
      if (q.back) back += path; else front += path;
    });
    return out + back + '<path class="zm__axis" d="M' + n1(CX - AX5[0] * 260) + ' ' + n1(CY - AX5[1] * 260) + ' L' + n1(CX + AX5[0] * 260) + ' ' + n1(CY + AX5[1] * 260) + '"/>' + front;
  }
  function loopAt(i, sd) { return LOOPS.filter(function (q) { return q.i === i && q.sd === sd; })[0]; }
  function labels5(t) {
    var a = loopTip(loopAt(-9, 1), t).tip, b = loopTip(loopAt(6, -1), t).tip;
    return [{ id: 'cop', text: 'one copy (IB: a chromatid)', x: a[0], y: a[1], side: 'R' }, { id: 'loop', text: 'its DNA, folded into loops', x: b[0], y: b[1], side: 'L' }];
  }

  /* ---------- step 6: the DNA wound round histones ---------- */
  var NUC = [[78, 64, 18], [236, 112, -22], [92, 200, 12], [252, 214, -12], [118, 330, 24]];
  var RW = 27, QW = .4, PITCH = 10, TURNS = 1.65, DW = 10;
  function nucOf(i, t) { var n = NUC[i]; return { c: [n[0] + 1.6 * Math.sin(t * .7 + i), n[1] + 1.6 * Math.cos(t * .6 + i * 2)], a: n[2] * PI / 180 }; }
  function wrapAt(nc, u) {
    var th = PI + u * TURNS * 2 * PI, p = rot([RW * Math.cos(th), QW * RW * Math.sin(th) + PITCH * TURNS * (u - .5)], nc.a);
    return { p: [nc.c[0] + p[0], nc.c[1] + p[1]], front: Math.sin(th) > 0 };
  }
  function bez(p0, p1, p2, p3, n) { var out = []; for (var i = 0; i <= n; i++) { var u = i / n, a = (1 - u) * (1 - u) * (1 - u), b = 3 * u * (1 - u) * (1 - u), c = 3 * u * u * (1 - u), d = u * u * u; out.push([a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]); } return out; }
  function tangentOut(nc, u) { var a = wrapAt(nc, u - .01).p, b = wrapAt(nc, u).p, l = dist(a, b) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; }
  function linker(t, i) {
    var p0, d0, p3, d3;
    if (i < 0) { p3 = wrapAt(nucOf(0, t), 0).p; d3 = tangentOut(nucOf(0, t), .01); p0 = [-14, p3[1] - 24]; d0 = [1, .3]; }
    else {
      var a = nucOf(i, t); p0 = wrapAt(a, 1).p; d0 = tangentOut(a, 1);
      if (i + 1 < NUC.length) { var b = nucOf(i + 1, t); p3 = wrapAt(b, 0).p; d3 = tangentOut(b, .01); }
      else { p3 = [W + 14, p0[1] + 30]; d3 = [1, .2]; }
    }
    var k = Math.min(70, dist(p0, p3) * .45);
    return bez(p0, [p0[0] + d0[0] * k, p0[1] + d0[1] * k], [p3[0] - d3[0] * k, p3[1] - d3[1] * k], p3, 24);
  }
  /* the DNA as a ribbon with the twist of its double helix marked (one turn every 3.4 nm, 17 units here) */
  function ribbon(P, cls) {
    var out = '<path class="zm__dna' + (cls || '') + '" d="' + pl(P) + '" stroke-width="' + DW + '"/>', acc = 0, N = normals(P);
    for (var i = 1; i < P.length; i++) {
      acc += dist(P[i - 1], P[i]);
      if (acc >= 8.5) {
        acc = 0; var t0 = N[i][0], q = N[i][1], h = DW * .46;
        out += '<line class="zm__tick" x1="' + n1(P[i][0] - q[0] * h - t0[0] * 2.4) + '" y1="' + n1(P[i][1] - q[1] * h - t0[1] * 2.4) + '" x2="' + n1(P[i][0] + q[0] * h + t0[0] * 2.4) + '" y2="' + n1(P[i][1] + q[1] * h + t0[1] * 2.4) + '"/>';
      }
    }
    return out;
  }
  function frame6(t) {
    var out = PANE;
    for (var i = -1; i < NUC.length; i++) out += ribbon(linker(t, i));
    NUC.forEach(function (n, i) {
      var nc = nucOf(i, t), runs = [], cur = null;
      for (var k = 0; k <= 80; k++) {
        var w = wrapAt(nc, k / 80);
        if (!cur || cur.front !== w.front) { if (cur) cur.P.push(w.p); cur = { front: w.front, P: cur ? [cur.P[cur.P.length - 1], w.p] : [w.p] }; runs.push(cur); }
        else cur.P.push(w.p);
      }
      runs.forEach(function (r) { if (!r.front && r.P.length > 1) out += ribbon(r.P, ' zm__dna--back'); });
      var deg = n1(nc.a * 180 / PI);
      out += '<g transform="translate(' + n1(nc.c[0]) + ' ' + n1(nc.c[1]) + ') rotate(' + deg + ')"><ellipse class="zm__hist" cx="0" cy="0" rx="24" ry="22"/>' +
        '<circle class="zm__histl" cx="-8.5" cy="-7.5" r="8.2"/><circle class="zm__histl" cx="8.5" cy="-7.5" r="8.2"/><circle class="zm__histl" cx="-8.5" cy="7.5" r="8.2"/><circle class="zm__histl" cx="8.5" cy="7.5" r="8.2"/></g>';
      runs.forEach(function (r) { if (r.front && r.P.length > 1) out += ribbon(r.P); });
    });
    return out;
  }
  function linkerMid(t) { var P = linker(t, 2); return P[Math.floor(P.length / 2)]; }
  function labels6(t) {
    var h = nucOf(1, t), hp = rot([-11, -13], h.a), w = wrapAt(nucOf(2, t), 1.5 / 3.3).p, m = linkerMid(t);
    return [{ id: 'his', text: 'proteins (IB: histones)', x: h.c[0] + hp[0], y: h.c[1] + hp[1], side: 'R' },
            { id: 'wnd', text: 'the DNA, wound almost twice round each', x: w[0], y: w[1], side: 'L' },
            { id: 'lnk', text: 'DNA between them', x: m[0], y: m[1], side: 'R' }];
  }

  /* ---------- step 7: the double helix, and a gene ---------- */
  var Y7 = 190, A7 = 40, P7 = 150, GROOVE = 2.4, GENE = [100, 250];
  function frame7(t) {
    var tl = t - M[6], ph = .5 + tl * .5, out = PANE, s1 = [], s2 = [];
    function y1(x) { return Y7 + A7 * Math.sin(ph + x * 2 * PI / P7); }
    function y2(x) { return Y7 + A7 * Math.sin(ph + GROOVE + x * 2 * PI / P7); }
    function z1(x) { return Math.cos(ph + x * 2 * PI / P7); }
    function z2(x) { return Math.cos(ph + GROOVE + x * 2 * PI / P7); }
    var gk = seg(tl, 2.2, 3.4);
    if (gk > 0) out += '<g' + op(gk) + '><rect class="dna__gene" x="' + GENE[0] + '" y="' + (Y7 - A7 - 12) + '" width="' + (GENE[1] - GENE[0]) + '" height="' + (2 * A7 + 24) + '" rx="8"/></g>' +
      '<path class="gn__br"' + op(gk) + ' d="M282 ' + (Y7 + A7 + 16) + ' L282 ' + (Y7 + A7 + 24) + ' L336 ' + (Y7 + A7 + 24) + ' L336 ' + (Y7 + A7 + 16) + '"/>';
    /* each strand in runs, behind (drawn first, paler) or in front of the bases */
    function runs(fy, fz) {
      var R = [], cur = null;
      for (var x = -14; x <= W + 14; x += 2) { var p = [x, fy(x)], f = fz(x) > 0; if (!cur || cur.f !== f) { cur = { f: f, P: cur ? [cur.P[cur.P.length - 1], p] : [p] }; R.push(cur); } else cur.P.push(p); }
      return R;
    }
    var r1 = runs(y1, z1), r2 = runs(y2, z2);
    r1.concat(r2).forEach(function (r) { if (!r.f) out += '<path class="dna__s zm__s7 zm__back" d="' + pl(r.P) + '"/>'; });
    for (var j = 0; j * P7 / 10 < W + 6; j++) {
      var xj = j * P7 / 10 + 4, b = SEQ.charAt((j + 7) % SEQ.length), a1 = y1(xj), a2 = y2(xj), m = (a1 + a2) / 2;
      out += half(xj, a1, m, b, 'zm__b7') + half(xj, m, a2, PAIR[b], 'zm__b7');
    }
    r1.concat(r2).forEach(function (r) { if (r.f) out += '<path class="dna__s zm__s7" d="' + pl(r.P) + '"/>'; });
    return out;
  }
  function labels7(t) {
    var tl = t - M[6], ph = .5 + tl * .5, out = [];
    function y1(x) { return Y7 + A7 * Math.sin(ph + x * 2 * PI / P7); }
    function y2(x) { return Y7 + A7 * Math.sin(ph + GROOVE + x * 2 * PI / P7); }
    var xs = 30, xb = 4 + 15 * 20;
    out.push({ id: 'dna', text: 'DNA: two strands twisted into a double helix', x: xs, y: y1(xs), side: 'L' });
    out.push({ id: 'bas', text: 'bases: A with T, C with G', x: xb, y: (y1(xb) * 3 + y2(xb)) / 4, side: 'R' });
    if (tl > 3) {
      out.push({ id: 'gene', text: 'a gene: one length of the DNA', x: (GENE[0] + GENE[1]) / 2, y: Y7 - A7 - 12, side: 'R' });
      out.push({ id: 'g2', text: 'another gene', x: 309, y: Y7 + A7 + 24, side: 'R' });
    }
    return out;
  }

  /* ---------- step 8: the pair, and two alleles ---------- */
  var C9 = { len: 230, w: 26, spread: .7, y: 190 };
  function band(x, c) {
    var r = C9.w / 2, th = 24 * C9.spread * PI / 180, off = r * .55 + C9.spread * r * .15, l = (.8 - CEN) * C9.len, sg = c ? 1 : -1;
    return [x + sg * (off + l * Math.sin(th)), C9.y + (CEN - .5) * C9.len + l * Math.cos(th)];
  }
  function top9(x, c) {
    var r = C9.w / 2, th = 24 * C9.spread * PI / 180, off = r * .55 + C9.spread * r * .15, l = CEN * C9.len * .92, sg = c ? 1 : -1;
    return [x + sg * (off + l * Math.sin(th)), C9.y + (CEN - .5) * C9.len - l * Math.cos(th)];
  }
  function dadX(t) { return lerp(352, 244, ease(seg(t - M[7], 1.9, 3.8))); }
  function frame8(t) {
    var k = seg(t - M[7], 1.9, 3.8), out = PANE;
    out += D.chromo({ x: 96, y: C9.y, len: C9.len, w: C9.w, who: 'mum', copies: 2, spread: C9.spread, cen: CEN, bands: [.8] });
    if (k > 0) out += D.chromo({ x: dadX(t), y: C9.y, len: C9.len, w: C9.w, who: 'dad', copies: 2, spread: C9.spread, cen: CEN, bands: [.8], op: k });
    return out;
  }
  function labels8(t) {
    var out = [], a = top9(96, 0), bm = band(96, 0);
    out.push({ id: 'm', text: 'chromosome 9 from the mother: two identical copies', x: a[0], y: a[1], side: 'L' });
    out.push({ id: 'a', text: 'the allele for group A, on both copies', x: bm[0] - 8, y: bm[1], side: 'L' });
    if (seg(t - M[7], 1.9, 3.8) > .95) {
      var f = top9(dadX(t), 1), bf = band(dadX(t), 1);
      out.push({ id: 'f', text: 'chromosome 9 from the father', x: f[0], y: f[1], side: 'R' });
      out.push({ id: 'o', text: 'the allele for group O, on both copies', x: bf[0] + 8, y: bf[1], side: 'R' });
    }
    return out;
  }

  var FR = [frame1, frame2, frame3, frame4, frame5, frame6, frame7, frame8];
  var LB = [labels1, labels2, labels3, labels4, labels5, labels6, labels7, labels8];
  /* how each step comes out of the one before: `in` from the point F of the old picture, enlarged z times; `out`, the old
     picture shrinking into the point F of the new one */
  var ZM = [null,
    { z: Z1, F: function () { return [NU1[0], NU1[1]]; } },
    { z: 40, F: function () { return focusThread(M[2] * .5); } },
    { z: 40, out: true, F: function () { return focusThread(M[3] * .5); } },
    { z: 18, F: armFocus },
    { z: 7.4, F: function () { return loopTip(loopAt(1, 1), M[5]).tip; } },
    { z: 7, F: function () { return linkerMid(M[6]); } },
    { z: 10, out: true, F: function () { return band(96, 0); } }];
  function grp(svg, P, s, Q, o) {
    return '<g' + op(o) + ' transform="translate(' + n1(P[0]) + ' ' + n1(P[1]) + ') scale(' + Math.round(s * 10000) / 10000 + ') translate(' + n1(-Q[0]) + ' ' + n1(-Q[1]) + ')">' + svg + '</g>';
  }
  function scene(t) {
    var k = 0; for (var i = 0; i < 8; i++) if (t >= M[i] - 1e-6) k = i;
    var e = k ? ease(seg(t, M[k], M[k] + TZ)) : 1, cur = FR[k](t);
    if (e >= 1) return { k: k, e: 1, svg: cur };
    var Z = ZM[k], F = Z.F(), prev = FR[k - 1](M[k] - .001), oOld = 1 - seg(e, .35, .85), oNew = seg(e, .2, .7), P, svg;
    if (Z.out) { P = mix([CX, CY], F, e); svg = grp(prev, P, Math.pow(Z.z, -e), [CX, CY], oOld) + grp(cur, P, Math.pow(Z.z, 1 - e), F, oNew); }
    else { P = mix(F, [CX, CY], e); svg = grp(prev, P, Math.pow(Z.z, e), F, oOld) + grp(cur, P, Math.pow(Z.z, e - 1), [CX, CY], oNew); }
    return { k: k, e: e, svg: svg };
  }

  function zoom(spec) {
    var S = K.shell(spec, 'zm', 'From a cell to a gene', 'A body cell; its nucleus; one length of DNA being copied; the chromosomes coiling into crosses; one copy enlarged, its DNA in loops, wound round proteins; the DNA itself and one gene; the pair the gene is on.',
      [['see', 'You see:'], ['size', 'Across the picture:']]);
    var svg = S.svg, NSV = K.NS, uid = 'zm' + Math.random().toString(36).slice(2, 7);
    var defs = document.createElementNS(NSV, 'defs'), cp = document.createElementNS(NSV, 'clipPath'), cr = document.createElementNS(NSV, 'rect');
    cp.setAttribute('id', uid); cr.setAttribute('rx', 14); cp.appendChild(cr); defs.appendChild(cp); svg.appendChild(defs);
    var bg = document.createElementNS(NSV, 'rect'); bg.setAttribute('class', 'zm__bg'); svg.appendChild(bg);
    var model = document.createElementNS(NSV, 'g'); svg.appendChild(model);
    var gLab = document.createElementNS(NSV, 'g'); svg.appendChild(gLab);
    var lay = null, narrow = false, key = K.pinKey(S);
    var R = [0];
    STEPS.forEach(function (s, i) { var w = (s.h + ' ' + s.p).replace(/\*\*/g, '').split(/\s+/).length; R.push(R[i] + Math.max(M[i + 1] - M[i], w / 2)); });
    var clock = K.readerClock(R, M);
    function draw(tt) {
      var t = clock(tt), sc = scene(t);
      model.innerHTML = '<g clip-path="url(#' + uid + ')">' + sc.svg + '</g>';
      var items = sc.e > .92 ? LB[sc.k](t).map(function (q) { var p = lay.to(q.x, q.y); return { id: q.id, text: q.text, x: p[0], y: p[1], side: q.side, alts: [] }; }) : [];
      gLab.innerHTML = K.names(lay, items, narrow, key, null, 6);
      S.pill('see', SEE[sc.k], 'ok'); S.pill('size', SIZE[sc.k], 'ok');
    }
    var sp = L.stepper({ steps: K.readerSteps(STEPS.map(function (s, i) { return { t: M[i], h: s.h, p: s.p }; }), R), end: R[R.length - 1], render: draw, flow: K.readerFlow(R, M) });
    return K.mount(S, sp, 'zm', [
      ['Steps 2 to 4 follow one chromosome: a long, very thin thread in a working cell; copied before the cell divides; then coiled, short and thick, into a cross of two identical copies. Steps 5 to 7 enlarge one copy, down to its DNA.'],
      ['Key: orange, a chromosome from the mother; blue, from the father; grey, other chromosomes. In the DNA: grey, its strands (violet, a new strand); the bases A blue, T red, C yellow, G green; a yellow band, a gene; pink, the proteins it is wound round; green, the enzymes that copy it.'],
      ['The width across each picture is real; the colours are not. Beyond 0610: how DNA is copied (step 3) and the proteins it is wound round (step 6). To show them clearly, the two new molecules of DNA are drawn apart (in a cell they stay close together), and the gene is drawn short (a real gene is thousands of bases long).']
    ], function (Dw, nar) {
      narrow = nar; var m = K.margins(nar, 18, 18, 96, 96);
      lay = K.frameOf(svg, bg, model, cr, { x0: 0, x1: W, y0: 0, y1: H }, false, Dw, m[0], m[1], m[2], m[3], 14.5);
    });
  }
  L.add('zoom', zoom);
})(window);
