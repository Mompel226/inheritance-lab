/* ============================================================
   w-protein.js — "How a protein is made" (station `protein`, 17.1.5–17.1.8). Thirteen steps, each held until
   "Next step"; each picture is a part of the one before, enlarged, or the one before seen from further away:
     1 a body cell: membrane, cytoplasm, mitochondria, ribosomes, the nucleus;
     2 the nucleus: each chromosome a long thin thread; the gene, one short length of one thread;
     3 the gene enlarged: a long length of DNA, about 3,000 base pairs; outside it, DNA wound round histones;
     4 the start of the gene: the double helix; an enzyme (RNA polymerase) arrives and separates the strands;
     5 inside the enzyme: free bases arrive one at a time and pair with one strand (U with A); the mRNA grows, leaves
       the enzyme, and the DNA joins again behind it;
     6 the whole gene again: the enzyme moves along it, the mRNA grows to a copy of the whole gene, then both leave it;
     7 the nucleus: the mRNA moves to a pore (the gene stays);
     8 a pore enlarged: the two membranes, the pore's proteins; the mRNA passes through, one end first;
     9 the start of the mRNA in the cytoplasm: a ribosome forms from its two parts (RNA and protein), the first tRNA;
    10 a tRNA brings an amino acid: its three bases pair with three bases of the mRNA;
    11 the ribosome joins the amino acids (peptide bonds); the mRNA passes through it, three bases at a time;
    12 again and again: the chain grows (20 amino acids drawn; a real protein has hundreds);
    13 at the stop codon the chain is released, the ribosome separates, and the chain folds into its shape.
   Daniel, 4–5 Nov 2026: "it's just an image. I really want an animation, a good one, a professional one, a very detailed
   one … from gene to protein … you could show tRNA, you could show mRNA a bit more detail … [the ribosome is] a coil of RNA
   … two subunits … slowly zoom in into the nucleus … the gene is basically 1, 2, 3, 4, 5, 6 base pairs. That's not
   realistic." His lessons on js/w-zoom.js the same day hold here too: every zoom slow (TZ, about 3 s), each picture
   coming out of the part it enlarges, at its place and angle; new parts arrive, never appear; names wait until the motion
   stops (or point at parts that stay put) and point at a part on their own side.

   THE BIOLOGY, checked step by step (syllabus 0610 2026–28 17.1.5–17.1.8 asks for none of the detail: "knowledge of the
   details of transcription or translation is not required"; every detail beyond it carries its IB 2025 name):
   · the gene     thousands of base pairs (here 3,000: 520 units at 0.51 units a nanometre, 0.34 nm a base pair); outside
                  it, nucleosomes (11 nm) about every 200 base pairs; along it, fewer (an open, loosened gene), and none at
                  its start, where RNA polymerase binds (IB HL D1.2.13: the promoter)
   · copying      RNA polymerase (about 15 nm) opens about 12 base pairs of DNA (the transcription bubble), reads ONE
                  strand (the template), joins free RNA nucleotides that pair with it: C–G, G–C, T–A and A–U (IB D1.2.1,
                  D1.2.2); about 8 bases of the new RNA stay paired with the DNA, the rest leaves the enzyme, the 5' end
                  first; behind the enzyme the DNA closes again. The mRNA's bases are the gene's (coding strand) with U for
                  T; its first bases are GCCACC before the start codon AUG (a real "Kozak" start), and TATAAA lies about 30
                  base pairs before the gene (a TATA box)
   · export       mRNA leaves through a nuclear pore (about 120 nm across, a channel of about 40 nm) in the double
                  membrane, whose two membranes join round each pore (IB HL B2.2.6), the 5' end first
   · translation  the small subunit binds the mRNA's 5' end and moves to the start codon AUG, the initiator tRNA (Met)
                  pairs with it, then the large subunit joins (IB HL D1.2.17); two tRNAs on the ribosome at a time
                  (IB D1.2.6); anticodon pairs with codon (D1.2.7); one codon, three bases, one amino acid, the same codon
                  always the same amino acid (D1.2.8: AUG Met, GCU Ala, UCA Ser, GGU Gly); the new amino acid is joined by
                  a peptide bond and the ribosome moves three bases along the mRNA (D1.2.10); the empty tRNA leaves; the
                  chain leaves through the tunnel of the large subunit; at UAA (a stop codon) no tRNA fits, the chain is
                  released and the subunits separate; the chain folds into its shape (17.1.6; IB B1.2.7 HL)
   · drawn larger than real, and said so in the notes: the mRNA in step 7; the bases of mRNA and tRNA and the amino acids
     in steps 9–13; the DNA in the bubble is drawn untwisted. Everything is far slower than in a cell (RNA polymerase adds
     about 20–60 bases a second, a ribosome about 5 amino acids).
   SOURCES: syllabus 0610 2026–28 4.1.4, 17.1.5–17.1.8; IB Biology guide (2025) D1.2.1–D1.2.10, D1.2.13, D1.2.15, D1.2.17,
   B2.2.6, A1.2.7, B1.2.2. The cell, the nucleus, the chromosomes and the helix are drawn as js/w-zoom.js draws them
   (InhDraw), the same in every animation of the lab (Daniel, 5 Nov 2026: "do not confuse students with different
   animations that have different colors or different drawings").
   Every frame is a pure function of the time t (memory headless-raf-animations).
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, K = global.WKit, D = global.InhDraw; if (!L || !K || !D || !D.coiled || !D.envelope) return;
  var n1 = K.n1, seg = K.seg, ease = K.ease, lerp = K.lerp, clamp01 = K.clamp01;
  var W = 340, H = 380, CX = 170, CY = 190, PI = Math.PI, TZ = 3.2;
  var STEPS = [
    { h: 'A cell makes a protein', p: 'A cell from your body, about 25 micrometres across. It makes the **proteins** it needs, such as enzymes. The instructions for each protein are in a **gene**, in the **nucleus**.' },
    { h: 'The gene, in the nucleus', p: 'Enlarged: the nucleus. Each **chromosome** is a long, very thin thread of **DNA**. The gene for this protein is one short length of one thread (yellow): here, on chromosome 9 from the mother.' },
    { h: 'A gene: thousands of base pairs', p: 'Enlarged again: the gene. A **gene** is a length of DNA that codes for a protein, usually thousands of base pairs long. This one has about 3,000. All along the DNA, in the gene too, it is wound round small balls of protein. The next pictures show only the start of the gene.' },
    { h: 'An enzyme at the start of the gene', p: 'Enlarged again: the start of the gene, about 60 of its 3,000 base pairs. An enzyme (IB: RNA polymerase) attaches here. It separates the two strands of the DNA for a short length.' },
    { h: 'mRNA, a copy of the gene', p: 'Free bases arrive, one at a time. Each pairs with a base on one strand of the DNA: C with G, and A with T, as in DNA. But mRNA has the base U instead of T, so U pairs with A. The enzyme joins the bases into a strand of **messenger RNA (mRNA)**, a **copy of the gene**. Behind the enzyme, the two strands of DNA join again.' },
    { h: 'A copy of the whole gene', p: 'The enzyme moves along the whole gene. The mRNA grows until it is a copy of the whole gene, thousands of bases long. Then the mRNA and the enzyme separate from the DNA. The **gene stays in the nucleus**.' },
    { h: 'To the cytoplasm', p: 'The **mRNA moves from the nucleus to the cytoplasm**. First it moves to a pore in the nuclear membrane (the membrane round the nucleus). (Here the mRNA is drawn far larger than real.)' },
    { h: 'Through a pore', p: 'Enlarged: a pore in the nuclear membrane, which is two membranes (IB: the nuclear envelope). Its pores are beyond 0610. The mRNA passes through a pore, one end first, into the **cytoplasm**.' },
    { h: 'A ribosome forms on the mRNA', p: 'Enlarged again: the start of the mRNA, in the cytoplasm. A **ribosome** forms on it from two parts, a small part and a large part (IB: subunits). Each part is made of RNA and protein. The mRNA lies between them. The first amino acid arrives, carried by a small RNA molecule (IB: tRNA), at the first three bases of the code, AUG (IB: start codon).' },
    { h: 'A small RNA brings an amino acid', p: 'Small RNA molecules (IB: tRNA) bring **amino acids** to the ribosome. Each one carries one amino acid. Its three bases (IB: anticodon) pair with three bases of the mRNA (IB: codon). So each group of **three bases** in the mRNA codes for one amino acid.' },
    { h: 'Joining the amino acids', p: 'The **ribosome assembles amino acids** into a chain: first it joins the new amino acid to the chain (IB: a peptide bond). Then the **mRNA passes through the ribosome** by three bases. The empty small RNA leaves, and the next one arrives with its amino acid. In this way the **sequence of bases** in the mRNA decides the **sequence of amino acids**.' },
    { h: 'The chain grows', p: 'Three bases at a time, one amino acid at a time, the chain grows. A ribosome adds about 5 amino acids each second. A real protein is a chain of hundreds of amino acids; the one drawn here has only 20.' },
    { h: 'The chain folds into its shape', p: 'At the end of the code (IB: a stop codon), no small RNA fits. The chain is released, and the two parts of the ribosome separate. The chain folds into the **shape** of the protein. A different **sequence of amino acids** would give a different shape.' }
  ];
  /* how long each step's motion runs, in seconds (the reader's time: the clock is given a pace of 1) */
  var DUR = [5, TZ + 4, TZ + 6, TZ + 9.6, TZ + 15.8, TZ + 12.8, TZ + 6.8, TZ + 8.8, TZ + 10, 6.5, 8.4, 18, 11];
  var M = [0]; DUR.forEach(function (d, i) { M.push(M[i] + d); });
  var SEE = ['a body cell', 'its nucleus', 'one gene', 'the start of the gene', 'the gene being copied', 'the whole gene', 'the nucleus', 'a pore',
             'the start of the mRNA', 'a ribosome on the mRNA', 'a ribosome on the mRNA', 'the chain growing', 'the protein'];
  var WHERE = ['the whole cell', 'in the nucleus', 'in the nucleus', 'in the nucleus', 'in the nucleus', 'in the nucleus', 'from the nucleus to the cytoplasm',
               'from the nucleus to the cytoplasm', 'in the cytoplasm', 'in the cytoplasm', 'in the cytoplasm', 'in the cytoplasm', 'in the cytoplasm'];
  var SIZE = ['about 25 µm (0.025 mm)', 'about 10 µm (0.01 mm)', 'about 0.7 µm (0.0007 mm)', 'about 20 nm (0.00002 mm)', 'about 8 nm (0.000008 mm)',
              'about 0.7 µm (0.0007 mm)', 'about 10 µm (0.01 mm)', 'about 300 nm (0.0003 mm)', 'about 40 nm (0.00004 mm)', 'about 40 nm (0.00004 mm)',
              'about 40 nm (0.00004 mm)', 'about 65 nm (0.000065 mm)', 'about 45 nm (0.000045 mm)'];

  /* ---------- small helpers ---------- */
  var pl = D.poly;
  function op(o) { return o < .999 ? ' opacity="' + n1(Math.max(0, o) * 100) / 100 + '"' : ''; }
  function rot(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }
  function mix(p, q, k) { return [lerp(p[0], q[0], k), lerp(p[1], q[1], k)]; }
  function add(p, q) { return [p[0] + q[0], p[1] + q[1]]; }
  function dist(p, q) { var dx = q[0] - p[0], dy = q[1] - p[1]; return Math.sqrt(dx * dx + dy * dy); }
  function sstep(k) { k = clamp01(k); return k * k * (3 - 2 * k); }
  function loc(k, t) { return t - M[k]; }
  function r4(v) { return Math.round(v * 10000) / 10000; }
  function dg(a) { return n1(a * 180 / PI); }
  var PANE = '<rect class="zm__pane" x="0" y="0" width="' + W + '" height="' + H + '" rx="14"/>';
  /* each picture paints its surroundings far beyond its edges, in the colour of the place it shows (outside the cell,
     cytoplasm, the inside of the nucleus), the same colour that place has in the picture before: no zoom shows the edge
     of a picture */
  function ground(cls) { return '<rect class="' + cls + '" x="-6000" y="-6000" width="12340" height="12380"/>'; }
  /* a line through points, measured along its length: at(s) gives the point, its angle and its normal (the tangent
     turned a quarter to the right) */
  function track(P) {
    var d = [0]; for (var i = 1; i < P.length; i++) d.push(d[i - 1] + dist(P[i - 1], P[i]));
    function at(s) {
      s = Math.max(0, Math.min(d[d.length - 1], s));
      var lo = 0, hi = d.length - 1;
      while (hi - lo > 1) { var m = (lo + hi) >> 1; if (d[m] <= s) lo = m; else hi = m; }
      var k = (s - d[lo]) / ((d[hi] - d[lo]) || 1), a = P[lo], b = P[hi], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      return { p: mix(a, b, k), ang: ang, n: [-Math.sin(ang), Math.cos(ang)] };
    }
    function part(s0, s1, st) { var out = []; st = st || 2; for (var s = s0; s < s1; s += st) out.push(at(s).p); out.push(at(s1).p); return out; }
    function near(q) { var b = 0; P.forEach(function (p, i) { if (dist(p, q) < dist(P[b], q)) b = i; }); return d[b]; }
    return { P: P, d: d, len: d[d.length - 1], at: at, part: part, near: near };
  }
  /* a closed lumpy outline round (0, 0): rx, ry its half-sizes, lumps [[k, phase, size]…] */
  function blob(rx, ry, lumps, n) {
    var P = [];
    for (var i = 0; i < (n || 64); i++) {
      var a = i / (n || 64) * 2 * PI, f = 1;
      lumps.forEach(function (q) { f += q[2] * Math.sin(q[0] * a + q[1]); });
      P.push([rx * f * Math.cos(a), ry * f * Math.sin(a)]);
    }
    return P;
  }
  function closed(P) { return pl(P.concat([P[0]])) + ' Z'; }
  function place(P, c, a, s) { return P.map(function (p) { var q = rot([p[0] * (s || 1), p[1] * (s || 1)], a || 0); return [c[0] + q[0], c[1] + q[1]]; }); }
  /* a base's letter, on its block */
  function letter(x, y, b, size, o) {
    return '<text class="pt__lt pt__lt--' + b + '" x="' + n1(x) + '" y="' + n1(y) + '" font-size="' + size + '"' + op(o) + '>' + b + '</text>';
  }
  /* a base as a line from p to q (its colour by kind; U is mRNA's) */
  function baseLine(p, q, b, w) {
    return '<line class="dna__b dna__b--' + b + '" x1="' + n1(p[0]) + '" y1="' + n1(p[1]) + '" x2="' + n1(q[0]) + '" y2="' + n1(q[1]) + '" style="stroke-width:' + n1(w) + 'px"/>';
  }

  /* ======================= A, B: the cell and its nucleus (as js/w-zoom.js draws them) =======================
     The territories of the 46 chromosomes are w-zoom's (the same seeds and colours: two pairs coloured, orange from the
     mother, blue from the father, the rest grey). The gene followed is on the thread w-zoom follows, chromosome 9 from the
     mother (TER[0]), a yellow band along it. */
  /* long threads that fill the nucleus, as in "From a cell to a gene" (Daniel, 5 Nov 2026: "you have made changes in the
     first that you have not made in other animations"): the same territories, folds and fine wiggle (m) */
  var TER = [
    { who: 'mum', c: [110, 120], R: 64, n: 15, a: 0, m: 1.6, x: 0, len: 80, w: 13 },
    { who: 'dad', c: [236, 258], R: 64, n: 15, a: 35, m: 1.6, x: 28, len: 80, w: 13 },
    { who: 'mum', c: [98, 262], R: 54, n: 12, a: -50, m: 1.6, x: -40, len: 56, w: 11 },
    { who: 'dad', c: [240, 126], R: 54, n: 12, a: 70, m: 1.6, x: 64, len: 56, w: 11 },
    { who: 'faint', c: [175, 58], R: 38, n: 8, a: 15, m: 1.4, x: 80, len: 44, w: 9 },
    { who: 'faint', c: [172, 188], R: 50, n: 10, a: -20, m: 1.4, x: -15, len: 56, w: 10 },
    { who: 'faint', c: [168, 322], R: 38, n: 8, a: 50, m: 1.4, x: 30, len: 46, w: 9 },
    { who: 'faint', c: [290, 190], R: 28, n: 6, a: 90, m: 1.4, x: 5, len: 32, w: 8 },
    { who: 'faint', c: [52, 186], R: 30, n: 6, a: 10, m: 1.4, x: -70, len: 34, w: 8 }
  ];
  (function () {
    var R = K.rng(5);
    for (var tries = 0; tries < 1400 && TER.length < 24; tries++) {
      var r = 18 + R() * 14, c = [30 + R() * 280, 30 + R() * 320], ok = true;
      for (var k = 0; k < 12 && ok; k++) { var a = k * PI / 6, x = c[0] + r * Math.cos(a), y = c[1] + r * Math.sin(a); if (Math.pow((x - CX) / 140, 2) + Math.pow((y - CY) / 158, 2) > 1) ok = false; }
      TER.forEach(function (T) { if (dist(T.c, c) < (T.R + r) * .74) ok = false; });
      if (ok) TER.push({ who: 'faint', c: c, R: r, n: Math.max(4, Math.round(r / 4.4)), a: Math.round(R() * 180), m: 1.4, x: Math.round(R() * 180 - 90), len: Math.round(r * 1.2), w: 7 });
    }
  })();
  var TERB = TER;
  var BANDH = 5.5;                 /* half the gene's length along its thread in the nucleus (about 0.16 µm each way) */
  var PHB = 2;                     /* the threads lie still here, so the gene picture is exactly its thread, enlarged */
  /* the gene lies along the TOP fold of chromosome 9 from the mother (its name rises straight up from it, crossing no
     other fold; the gene picture then has the next fold below it only) */
  var GENEB = (function () {
    var T = TERB[0], P = D.territory(T, PHB), tr = track(P), q = [T.c[0], T.c[1] - .78 * T.R], bi = 0;
    P.forEach(function (p, i) { if (dist(p, q) < dist(P[bi], q)) bi = i; });
    var a = P[Math.max(0, bi - 2)], b = P[Math.min(P.length - 1, bi + 2)];
    return { tr: tr, s: tr.d[bi], p: P[bi], ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  })();
  function geneB() { return GENEB; }
  function threadsB(ph, wd, lit, bw) {
    var out = '';
    for (var i = TERB.length - 1; i >= 1; i--) out += D.coiled(TERB[i], PHB, -1, wd);
    if (lit > 0) { var g = GENEB; out += '<path class="pt__gband" d="' + pl(g.tr.part(g.s - BANDH, g.s + BANDH, 1)) + '" stroke-width="' + bw + '"' + op(lit) + '/>'; }
    return out + D.coiled(TERB[0], PHB, -1, wd);
  }
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
  /* the cell's outline in the nucleus picture (far beyond its edges): the cytoplasm round the nucleus */
  var CELLB = CELL.map(function (p) { return [CX + (p[0] - NU1[0]) * Z1, CY + (p[1] - NU1[1]) * Z1]; });
  function frameA(t) {
    var out = ground('zm__far') + '<path class="cellb" data-e="170,190,136,124" d="' + pl(CELL) + ' Z"/>';
    RIBS.forEach(function (p) { out += '<circle class="zm__rib" cx="' + n1(p[0]) + '" cy="' + n1(p[1]) + '" r="1.7"/>'; });
    MITO.forEach(function (m) {
      out += '<g transform="translate(' + m[0] + ' ' + m[1] + ') rotate(' + m[2] + ')"><ellipse class="mito" cx="0" cy="0" rx="10" ry="5"/>' +
        '<path class="zm__cr" d="M-6 -3.6 L-6 1.6 M-2 3.6 L-2 -1.6 M2 -3.6 L2 1.6 M6 3.6 L6 -1.6"/></g>';
    });
    out += D.envelope(NU1[0], NU1[1], NU1[2], NU1[3], 10);
    return out + '<g transform="translate(' + NU1[0] + ' ' + NU1[1] + ') scale(' + n1(1000 / Z1) / 1000 + ') translate(' + (-CX) + ' ' + (-CY) + ')">' + threadsB(t * .5, 2.4, 0, 0) + '</g>';
  }
  function labelsA() {
    var rr = RIBS.filter(function (p) { return p[0] > 250 && !MITO.some(function (m) { return dist(m, p) < 18 || (m[0] > p[0] - 8 && Math.abs(m[1] - p[1]) < 13); }); });
    var rb = rr.filter(function (p) { return p[1] > 140 && p[1] < 200; })[0] || rr[0];
    return [{ id: 'mem', text: 'cell membrane', x: CELL[45][0], y: CELL[45][1], side: 'L' },
            { id: 'cyt', text: 'cytoplasm', x: 54, y: 200, side: 'L', alts: [[50, 160], [58, 236], [66, 120], [80, 290]] },
            { id: 'rib', text: 'ribosomes: they make proteins', x: rb[0], y: rb[1], side: 'R', alts: rr.filter(function (p) { return p !== rb; }) },
            { id: 'nuc', text: 'nucleus', x: NU1[0] + NU1[2], y: NU1[1] - 10, side: 'R' },
            { id: 'mit', text: 'mitochondria', x: MITO[1][0] - 8.5, y: MITO[1][1] + 3, side: 'L', alts: [[MITO[0][0] - 8.7, MITO[0][1] - 5]] }];
  }

  /* the pore the mRNA leaves by, and how the nucleus turns to lie along it (the nucleus inside, below) */
  var PORE = (function () {
    var a = (11 + .3) * 2 * PI / 18, p = [CX + 150 * Math.cos(a), CY + 168 * Math.sin(a)], tg = [-150 * Math.sin(a), 168 * Math.cos(a)];
    var l = Math.sqrt(tg[0] * tg[0] + tg[1] * tg[1]); tg = [tg[0] / l, tg[1] / l];
    var inw = [CX - p[0], CY - p[1]]; if (-tg[1] * inw[0] + tg[0] * inw[1] < 0) tg = [-tg[0], -tg[1]];
    return { p: p, ang: Math.atan2(tg[1], tg[0]) };
  })();
  var XB = 8;                      /* the mRNA in the nucleus is drawn this many times larger than real */
  function frameB(t, z) {
    var lit = t < M[5] ? sstep(seg(loc(1, t), TZ + .4, TZ + 1.8)) : 1;
    var out = ground('zm__far') + '<path class="pt__cellB" d="' + closed(CELLB) + '"/>' + D.envelope(CX, CY, 150, 168, 18) + threadsB(PHB, 1.3, lit, 6);
    if (t >= M[6] - 1e-6) out += mrnaB(t, z && z.old && z.k === 7 ? z.e : 0);
    return out;
  }

  /* ======================= C: the gene, 0.7 µm across (1 nm = 0.51 units) =======================
     The DNA as a line 2 nm wide, wound round histones (beads, 11 nm) outside the gene; the gene (yellow) 3,000 base pairs
     = 520 units of DNA, folded to and fro along the line its band lay on in the nucleus (the picture's middle line); the
     same chromosome's next folds above and below. */
  /* units a nanometre: the nucleus picture .034, this one .51, the DNA pictures 42.5 (so every zoom is the real ratio) */
  var KB = .034, KC = .51, KD = 42.5, ZBC = KC / KB, KDC = KC / KD, GLEN = Math.round(3000 * .34 * KC);
  /* the nucleus picture enlarged 15 times round the gene's band, turned so the band lies along this picture's middle */
  function bToC(p) { var g = GENEB, q = rot([p[0] - g.p[0], p[1] - g.p[1]], -g.ang); return [CX + q[0] * ZBC, CY + q[1] * ZBC]; }
  /* the gene: 3,000 base pairs folded to and fro between the two ends of its band, as the lab draws a chromosome's
     thread (each fold its own height, a little askew); amp is found so that the gene is GLEN (520) units long */
  function geneFolds(A0, A1, amp) {
    var R = K.rng(7), n = 7, span = A1[0] - A0[0], P = [A0.slice()], y = A0[1];
    for (var i = 0; i < n; i++) {
      var x = A0[0] + span * (i + .5) / n + (R() - .5) * 6, sk = (R() - .5) * 7, up = i % 2 === 0;
      var to = i === n - 1 ? A1[1] : CY + (up ? -1 : 1) * amp * (.6 + .6 * R());
      P.push([x - sk, y], [x + (R() - .5) * 4, (y + to) / 2], [x + sk, to]);
      y = to;
    }
    P.push(A1.slice());
    return P;
  }
  var CTR = (function () {
    var g = GENEB, L0 = g.s - BANDH, L1 = g.s + BANDH, FL = 25;
    var left = g.tr.part(Math.max(0, L0 - FL), L0, .5).map(bToC), right = g.tr.part(L1, Math.min(g.tr.len, L1 + FL), .5).map(bToC);
    var A0 = left[left.length - 1], A1 = right[0], lo = 5, hi = 140, best = null;
    for (var it = 0; it < 30; it++) {
      var amp = (lo + hi) / 2, P = D.smooth(left.slice(0, -1).concat(geneFolds(A0, A1, amp)).concat(right.slice(1))), tq = track(P), gl = tq.near(A1) - tq.near(A0);
      if (gl < GLEN) lo = amp; else hi = amp;
      best = P;
    }
    var tr = track(D.resample(best, Math.round(track(best).len / 1.5)));
    tr.s0 = tr.near(A0); tr.s1 = tr.near(A1); tr.glen = tr.s1 - tr.s0;
    return tr;
  })();
  /* the rest of the same chromosome's thread, enlarged the same way: its folds next to the gene's, DNA wound round
     histones (only the parts inside the picture) */
  var NBR = (function () {
    var g = GENEB, L0 = g.s - BANDH - 25, L1 = g.s + BANDH + 25, runs = [], beads = [];
    [[0, L0], [L1, g.tr.len]].forEach(function (r) {
      if (r[1] - r[0] < 1) return;
      var P = D.resample(g.tr.part(r[0], r[1], .5).map(bToC), Math.round((r[1] - r[0]) * ZBC / 1.5)), cur = [];
      function inside(p) { return p[0] > -40 && p[0] < W + 40 && p[1] > -40 && p[1] < H + 40; }
      P.forEach(function (p, i) {
        if (inside(p)) { cur.push(p); if (i % 10 === 5) beads.push(p); }
        else if (cur.length) { if (cur.length > 1) runs.push(cur); cur = []; }
      });
      if (cur.length > 1) runs.push(cur);
    });
    return { runs: runs, beads: beads };
  })();
  var BEADS = (function () {
    var out = [], s;
    for (s = 4; s < CTR.s0 - 18; s += 15) out.push(s);
    for (s = CTR.s0 + 70; s < CTR.s1 - 40; s += 68) out.push(s);
    for (s = CTR.s1 + 18; s < CTR.len - 4; s += 15) out.push(s);
    return out.filter(function (s) { var p = CTR.at(s).p; return p[0] > -30 && p[0] < W + 30 && p[1] > -30 && p[1] < H + 30; });
  })();
  /* the coiled mRNA: one shape, drawn at its real size in the pore picture (E units), 0.6 times that in the gene picture,
     1/33 of it (and XB times larger) in the nucleus. v 0 its 3' end, in the middle; 1 its 5' end, outside */
  function spiralPt(v) { var th = v * 2 * PI * 2.6 + .3, r = 8 + 34 * v + 2.4 * Math.sin(v * 37); return [r * Math.cos(th), r * Math.sin(th) * .8]; }
  var QC = [120, 100];             /* where the mRNA coils, above the gene */
  var E2C = KC / 1.133;           /* the pore picture's units in this one */
  function enzC(t) { var e0 = (BP * NB + 20) * KDC; return CTR.s0 + e0 + (CTR.glen - e0) * seg(loc(5, t), TZ + .4, TZ + 9.4); }
  function relC(t) { return ease(seg(loc(5, t), TZ + 9.8, TZ + 12.2)); }
  function geneLitC(t) { return t < M[5] ? seg(loc(2, t), TZ + .4, TZ + 4.4) : 1; }
  function mrnaCpts(t) {
    var sE = enzC(t), rel = relC(t), pts = [];
    for (var b = CTR.s0; b <= sE + .01; b += 2.5) {
      var g = CTR.at(b), age = sE - b, off = 3 + 7 * (1 - Math.exp(-age / 60)) + 2.4 * Math.sin(b * .23 + 1) * (1 - Math.exp(-age / 30));
      var p = [g.p[0] - g.n[0] * off, g.p[1] - g.n[1] * off];
      if (rel > 0) { var sp = spiralPt(1 - (b - CTR.s0) / CTR.glen); p = mix(p, [QC[0] + sp[0] * E2C, QC[1] + sp[1] * E2C], rel); }
      pts.push(p);
    }
    return pts;
  }
  /* where names end in the gene picture: the top of the gene's last fold (named from the right), a bead of the DNA
     before the gene, clear of everything above it (named from above) */
  var GTOP = (function () { var b = null; for (var s = CTR.s0; s <= CTR.s1; s += 1) { var p = CTR.at(s).p; if (p[0] > 160 && p[0] < 240 && (!b || p[1] < b[1])) b = p; } return b; })();
  /* a bead on the chromosome's next fold, the lowest DNA in the picture: its name stands below it */
  var BEADN = (function () { var b = null; NBR.beads.forEach(function (p) { if (p[1] > CY + 60 && p[1] < H - 8 && p[0] > 20 && p[0] < W - 20 && (!b || Math.abs(p[0] - 250) < Math.abs(b[0] - 250))) b = p; }); return b || NBR.beads[0]; })();
  function frameC(t) {
    var gl = geneLitC(t), out = ground('zm__nucl');
    if (gl > 0) { var g0 = CTR.at(CTR.s0).p; out += '<path class="pt__start pt__startC" d="M' + n1(g0[0]) + ' ' + n1(g0[1] - 3) + ' L' + n1(g0[0]) + ' ' + n1(g0[1] - 26) + '"' + op(gl) + '/>'; }
    if (gl > 0) out += '<path class="pt__gene" d="' + pl(CTR.part(CTR.s0, CTR.s0 + CTR.glen * gl, 2)) + '"/>';
    out += '<path class="dna__s pt__cdna" d="' + pl(CTR.P) + '"/>';
    NBR.runs.forEach(function (P) { out += '<path class="dna__s pt__cdna" d="' + pl(P) + '"/>'; });
    NBR.beads.forEach(function (p) { out += '<circle class="zm__bead" cx="' + n1(p[0]) + '" cy="' + n1(p[1]) + '" r="2.8"/>'; });
    var copying = t >= M[5] - 1e-6, sE = copying ? enzC(t) : -1e9, moving = copying && loc(5, t) < TZ + 9.6;
    BEADS.forEach(function (s) {
      var g = CTR.at(s), d = Math.abs(s - sE), push = moving && d < 14 ? 6 * (1 - d / 14) : 0;
      out += '<circle class="zm__bead" cx="' + n1(g.p[0] + g.n[0] * push) + '" cy="' + n1(g.p[1] + g.n[1] * push) + '" r="2.8"/>';
    });
    if (copying) {
      var pts = mrnaCpts(t);
      if (pts.length > 1) out += '<path class="dna__s pt__mr pt__mrv" d="' + pl(pts) + '"/>';
      var lv = ease(seg(loc(5, t), TZ + 9.6, TZ + 11.6)), g = CTR.at(sE), ep = [g.p[0] + 26 * lv, g.p[1] - 58 * lv];
      /* the enzyme at its real size here (about 12 nm), the shape of the close-up */
      out += '<path class="pt__pol pt__polC" d="' + closed(place(ENZ, ep, g.ang, KDC)) + '"/>';
    }
    return out;
  }
  function labelsC(t) {
    var out = [], hi = GTOP, st = CTR.at(CTR.s0).p, bd = BEADN;
    if (t < M[5]) {
      if (geneLitC(t) < .98) return [];
      out.push({ id: 'st', text: 'the start of the gene', x: st[0], y: st[1] - 26, side: 'L' });
      out.push({ id: 'his', text: 'DNA wound on proteins (IB: histones)', x: bd[0], y: bd[1] + 3, side: 'B' });
      out.push({ id: 'gene', text: 'the gene (yellow): about 3,000 base pairs', x: hi[0], y: hi[1] - 4, side: 'T' });
      return out;
    }
    if (relC(t) < .98) return [];
    var m = mrnaCpts(t), lft = m.reduce(function (a, p) { return p[0] < a[0] ? p : a; }, m[0]);
    out.push({ id: 'mr', text: 'mRNA: a copy of the whole gene', x: lft[0], y: lft[1], side: 'L' });
    out.push({ id: 'gene', text: 'the gene: it stays in the nucleus', x: hi[0], y: hi[1] - 4, side: 'T' });
    return out;
  }

  /* the mRNA in the nucleus (step 7): the coil of the gene picture, then larger than real (XB), moving to the pore; its
     5' end first along the pore's way in. z: during the zoom into the pore, back to its real size */
  var E2B = 1 / 33.3;
  function mrnaB(t, zoomE) {
    var g = geneB(M[6] * .5), q0 = add(g.p, rot([(QC[0] - CX) / ZBC, (QC[1] - CY) / ZBC], g.ang));
    var X = zoomE > 0 ? lerp(XB, 1, zoomE) : lerp(1, XB, ease(seg(loc(6, t), TZ * .5, TZ + 1.4)));
    var k = ease(seg(loc(6, t), TZ + .5, TZ + 5)), lead = ease(seg(loc(6, t), TZ + 4.4, TZ + 6.2));
    var a = lerp(g.ang, PORE.ang, k), home = add(PORE.p, rot([ESPC[0] - CX, ESPC[1] - CY], PORE.ang).map(function (v) { return v * E2B * X; }));
    var c = mix(q0, home, k), pts = [];
    for (var v = 0; v <= 1.0001; v += .02) { var sp = spiralPt(v); pts.push(add(c, rot([sp[0] * E2B * X, sp[1] * E2B * X], a))); }
    var out = '<path class="dna__s pt__mr pt__mrv" d="' + pl(pts) + '"/>';
    if (lead > 0) {
      /* the 5' end, from the coil to the middle of the pore, along the way the pore picture draws it */
      var s1 = ETR.sF0, s0 = ETR.sSp, sEnd = lerp(s0, s1, lead), P = ETR.part(s0, sEnd, 3).map(function (p) { return add(PORE.p, rot([(p[0] - CX) * E2B * X, (p[1] - CY) * E2B * X], PORE.ang)); });
      out += '<path class="dna__s pt__mr pt__mrv" d="' + pl(P) + '"/>';
    }
    return out;
  }
  function labelsB(t) {
    if (t < M[5]) {
      if (loc(1, t) < TZ + 1.8) return [];
      var a = D.territory(TERB[0], PHB)[0], g = GENEB;
      return [{ id: 'chr', text: 'chromosome 9 from the mother: a long, very thin thread of DNA', x: a[0], y: a[1], side: 'L' },
              { id: 'gene', text: 'the gene for this protein (yellow)', x: g.p[0], y: g.p[1] - 2, side: 'T' },
              { id: 'mem', text: 'the nuclear membrane (the membrane round the nucleus)', x: CX + 150, y: CY - 30, side: 'R' }];
    }
    if (loc(6, t) < TZ + 6.2) return [];
    var gg = GENEB;
    return [{ id: 'gene', text: 'the gene: it stays in the nucleus', x: gg.p[0], y: gg.p[1] - 2, side: 'T' },
            { id: 'mr', text: 'mRNA, at a pore (drawn larger than real)', x: PORE.p[0] + 6, y: PORE.p[1] + 8, side: 'L' },
            { id: 'mem', text: 'the nuclear membrane (the membrane round the nucleus)', x: CX + 150, y: CY - 30, side: 'R' }];
  }

  /* ======================= D: the DNA at the start of the gene (8 nm across when close: 42.5 units a nm) =======================
     The helix as w-zoom draws it (A 40, one turn 150 units = 10 base pairs, two grooves); base pair j at x = 15 j, the gene
     starting at j = 0. The coding strand above, the template strand below. */
  var DY = 190, DA = 40, DP = 150, DG = 2.4, BP = 15, NB = 18, DT = .8;
  var MRNA = 'GCCACC' + 'AUGGCUUCAGGUGCUGGUUCAGCUUCAGGUGGUGCUUCAAUGGCUGGUUCAGCUGGUUCA' + 'UAA' + 'GCAUCCGGAUUACGCUAGCAUCCGGAUUCG';
  var UP = ('GCGTAGCTG' + 'TATAAAAG' + 'GCGCTGAGTCCAGCATGCCTCAG').slice(-40), FILL = 'ATGCCATGTACGGATCCTAGCTAGGCATTCAGCATGAC';
  function coding(j) { if (j < 0) return j >= -40 ? UP.charAt(j + 40) : FILL.charAt((-j * 7) % FILL.length); return j < MRNA.length ? MRNA.charAt(j).replace('U', 'T') : FILL.charAt(j % FILL.length); }
  function template(j) { return D.PAIR[coding(j)]; }
  function litD(t) { return t < M[4] ? seg(loc(3, t), TZ + .2, TZ + 2.2) : 1; }
  function landD(t) { return t < M[4] ? ease(seg(loc(3, t), TZ + 2.4, TZ + 6.0)) : 1; }
  function openD(t) { return t < M[4] ? sstep(seg(loc(3, t), TZ + 6.4, TZ + 8.8)) : 1; }
  function x0D(t) { return t < M[4] ? 0 : NB * seg(loc(4, t), TZ + .6, TZ + .6 + NB * DT); }
  function tOfX(x) { return M[4] + TZ + .6 + x * DT; }
  function enzX(t) { return BP * x0D(t) + 20; }
  function enzY(t) { return lerp(DY - 900, DY - 30, landD(t)); }
  function phD(t) { return .3 + t * .22; }
  function camD(t) {
    var c4 = [60, DY];
    if (t < M[4]) return { s: .4, c: c4 };
    var e = ease(seg(loc(4, t), 0, TZ));
    return { s: .4 * Math.pow(2.5, e), c: mix(c4, [enzX(t) - 50, DY - 10], e) };
  }
  /* how far the strands are held apart at x: the bubble from 10 base pairs behind the enzyme's newest base to 2 ahead */
  function bub(x, x0, ob) { var xu = BP * (x0 - 10), xd = BP * (x0 + 2); return ob * sstep((x - xu + 44) / 44) * sstep((xd + 44 - x) / 44); }
  function yA(x, ph, b) { return lerp(DY + DA * Math.sin(ph + x * 2 * PI / DP), DY - 76, b); }
  function yB(x, ph, b) { return lerp(DY + DA * Math.sin(ph + DG + x * 2 * PI / DP), DY + 50, b); }
  var ENZ = blob(250, 205, [[3, .4, .06], [5, 1.3, .04], [2, 2.2, .05], [7, .7, .02]], 72);
  /* the new RNA: base j's backbone point and the direction of its base. Paired (the last 8 made) above the template
     strand; older ones leave the enzyme along its way out, the first made (the 5' end) leading */
  function rnaAt(j, x0) {
    var ex = (x0 - 8 - j) * BP;
    if (ex <= 0) return { b: [j * BP, DY - 10], d: [0, 1] };
    var h0 = (x0 - 8) * BP, R0 = 24, q = ex / R0;
    if (q < PI / 2) return { b: [h0 - R0 * Math.sin(q), DY - 10 - R0 * (1 - Math.cos(q))], d: rot([0, 1], q) };
    return { b: [h0 - R0, DY - 10 - R0 - (ex - R0 * PI / 2)], d: [-1, 0] };
  }
  /* the free bases (IB: RNA nucleotides): each arrives from outside to a place near the enzyme, waits, and moves to its
     place when its turn comes */
  var POOL = [[40, 128], [104, 150], [160, 112], [-6, 168]];
  function spawnT(j) { return j < 3 ? M[4] + .4 + .7 * j : tOfX(j - 3.2); }
  function nucleotide(j, t, x0) {
    var t0 = spawnT(j); if (t < t0) return null;
    var ex = enzX(t), ey = DY - 30, ps = [ex + POOL[j % 4][0] + 3 * Math.sin(t * 1.7 + j), ey + POOL[j % 4][1] + 3 * Math.cos(t * 1.3 + 2 * j)];
    var ang = .7 * Math.sin(t * .9 + j * 2) + .4, k = ease(seg(t, t0, t0 + 1.6));
    var p = mix([ex + 330, ey + 330], ps, k);
    if (j < NB && x0 > j) {
      var g = ease(Math.min(1, (x0 - j) / .85)), slot = [j * BP, DY - 10];
      var go = [ex + POOL[j % 4][0], ey + POOL[j % 4][1]];
      if (g >= 1) return null;                                  /* joined: drawn as part of the mRNA */
      var mid = [lerp(go[0], slot[0], .5) + 30, lerp(go[1], slot[1], .5) + 40];
      p = [lerp(lerp(go[0], mid[0], g), lerp(mid[0], slot[0], g), g), lerp(lerp(go[1], mid[1], g), lerp(mid[1], slot[1], g), g)];
      ang = lerp(ang, 0, g);
    }
    return { b: p, d: rot([0, 1], ang), base: MRNA.charAt(j) };
  }
  function frameD(t) {
    var cam = camD(t), s = cam.s, c = cam.c, ph = phD(t), lit = litD(t), ob = openD(t), x0 = x0D(t), lo = seg(s, .62, .92);
    var xl = c[0] - (CX + 40) / s, xr = c[0] + (CX + 40) / s, st = s < .7 ? 3 : 2;
    var out = ground('zm__nucl') + '<g transform="translate(' + CX + ' ' + CY + ') scale(' + r4(s) + ') translate(' + n1(-c[0]) + ' ' + n1(-c[1]) + ')">';
    out += '<rect class="pt__gzone" x="-7.5" y="' + (DY - DA - 14) + '" width="' + n1(Math.max(0, xr + 7.5)) + '" height="' + (2 * DA + 28) + '" rx="8"/>';
    out += '<path class="pt__start" d="M-7.5 ' + (DY - 140) + ' L-7.5 ' + (DY + DA + 40) + '"/>';
    var land = landD(t);
    if (land > 0) out += '<path class="pt__pol" d="' + closed(place(ENZ, [enzX(t), enzY(t)], .05 * Math.sin(t * .6))) + '"/>';
    /* the two strands, in runs behind (paler) or in front of the bases; where the bubble holds them apart, in front */
    function runs(fy, sh) {
      var R = [], cur = null;
      for (var x = xl; x <= xr; x += st) {
        var b = bub(x, x0, ob), p = [x, fy(x, ph, b)], f = b > .5 || Math.cos(ph + sh + x * 2 * PI / DP) > 0;
        if (!cur || cur.f !== f) { cur = { f: f, P: cur ? [cur.P[cur.P.length - 1], p] : [p] }; R.push(cur); } else cur.P.push(p);
      }
      return R;
    }
    var rr = runs(yA, 0).concat(runs(yB, DG)), mid = '', lets = '';
    /* the mRNA made so far: the part that has left the DNA (the 5' end first) lies behind it, leaving through the
       enzyme; the last 8 bases made stay paired with the template strand, in front */
    var made = [], gone = [], held = [];
    for (var i = 0; i < NB && x0 >= i + .85; i++) { made.push(i); (x0 - 8 - i > 0 ? gone : held).push(i); }
    function rnaPart(list, letters) {
      var o = '';
      list.forEach(function (i) {
        var r = rnaAt(i, x0), e = add(r.b, [r.d[0] * 30, r.d[1] * 30]);
        /* on its way out, behind the DNA, only the strand shows; its bases show again once it is above the DNA */
        if (!letters && r.b[1] > DY - 88) return;
        o += baseLine(r.b, e, MRNA.charAt(i), 12);
        if (letters && lo > 0) lets += letter((r.b[0] + e[0]) / 2, (r.b[1] + e[1]) / 2, MRNA.charAt(i), 12, lo);
      });
      return o;
    }
    if (gone.length) out += '<path class="dna__s zm__s7 pt__rna" d="' + pl(gone.concat(held.slice(0, 1)).map(function (i) { return rnaAt(i, x0).b; })) + '"/>' + rnaPart(gone, false);
    rr.forEach(function (r) { if (!r.f && r.P.length > 1) out += '<path class="dna__s zm__s7 zm__back" d="' + pl(r.P) + '"/>'; });
    for (var j = Math.ceil(xl / BP); j <= Math.floor(xr / BP); j++) {
      var x = j * BP, b = bub(x, x0, ob), ya = yA(x, ph, b), yb = yB(x, ph, b), m = (ya + yb) / 2, w = lerp(5.6, 12, b);
      var ae = lerp(lerp(ya, m, lit), ya + 30, b), be = lerp(lerp(yb, m, lit), yb - 30, b), ca = coding(j), cb = template(j);
      if (lit > 0) mid += baseLine([x, ya], [x, ae], ca, w) + baseLine([x, yb], [x, be], cb, w);
      if (lo > 0 && Math.abs(ae - ya) > 20) lets += letter(x, (ya + ae) / 2, ca, 12, lo);
      if (lo > 0 && Math.abs(be - yb) > 20) lets += letter(x, (yb + be) / 2, cb, 12, lo);
    }
    out += mid + rnaPart(held, true);
    if (held.length > 1) out += '<path class="dna__s zm__s7 pt__rna" d="' + pl(held.map(function (i) { return rnaAt(i, x0).b; })) + '"/>';
    if (made.length) out += '<circle class="pt__nt" cx="' + n1(rnaAt(made[made.length - 1], x0).b[0]) + '" cy="' + (DY - 10) + '" r="5.5"/>';
    rr.forEach(function (r) { if (r.f && r.P.length > 1) out += '<path class="dna__s zm__s7" d="' + pl(r.P) + '"/>'; });
    /* the free bases */
    for (var n = 0; n < NB + 3; n++) {
      var q = nucleotide(n, t, x0); if (!q) continue;
      var e2 = add(q.b, [q.d[0] * 30, q.d[1] * 30]);
      out += baseLine(q.b, e2, q.base, 12) + '<circle class="pt__nt" cx="' + n1(q.b[0]) + '" cy="' + n1(q.b[1]) + '" r="5.5"/>';
      if (lo > 0) lets += letter((q.b[0] + e2[0]) / 2, (q.b[1] + e2[1]) / 2, q.base, 12, lo);
    }
    return out + lets + '</g>';
  }
  function toD(t, x, y) { var cm = camD(t); return [CX + cm.s * (x - cm.c[0]), CY + cm.s * (y - cm.c[1])]; }
  function labelsD(t) {
    var out = [];
    if (t < M[4]) {
      if (openD(t) < .97) return [];
      /* the helix named from above where its front strand is highest, right of the enzyme */
      /* the helix named at the picture's right edge, where its front strand is (its line runs over nothing else) */
      var ph = phD(t), x4 = 60 + (W - 6 - CX) / .4;
      var p1 = toD(t, enzX(t) + 214, enzY(t) - 104), p2 = toD(t, -7.5, DY - 140), p3 = toD(t, -75, DY + 54), p4 = toD(t, x4, yA(x4, ph, 0));
      out.push({ id: 'pol', text: 'an enzyme (IB: RNA polymerase)', x: p1[0], y: p1[1], side: 'R' });
      out.push({ id: 'st', text: 'the start of the gene', x: p2[0], y: p2[1], side: 'L' });
      out.push({ id: 'sep', text: 'the two strands, held apart', x: p3[0], y: p3[1], side: 'B' });
      out.push({ id: 'dna', text: 'DNA: a double helix', x: p4[0], y: p4[1], side: 'R' });
      return out;
    }
    if (loc(4, t) < TZ + .2) return [];
    var ex = enzX(t), a = toD(t, ex - 132, DY + 50), c = toD(t, ex - 12, DY - 76), d = toD(t, ex - 215, yB(ex - 215, phD(t), 0));
    out.push({ id: 'tpl', text: 'one strand is copied (IB: template strand)', x: a[0], y: a[1] + 5, side: 'B' });
    out.push({ id: 'oth', text: 'the other strand', x: c[0], y: c[1] - 5, side: 'T' });
    if (loc(4, t) > TZ + .6 + NB * DT) {
      /* the mRNA named where its first end leaves the enzyme, above the DNA (a line to its paired bases would cross the
         DNA behind the enzyme) */
      var f5 = rnaAt(0, NB).b, b = toD(t, f5[0], f5[1] - 5), ph5 = phD(t);
      out.push({ id: 'mr', text: 'the new mRNA', x: b[0], y: b[1], side: 'T' });
      out.push({ id: 'cls', text: 'behind the enzyme, the DNA joins again', x: d[0], y: d[1], side: 'L',
                 alts: [toD(t, ex - 200, yA(ex - 200, ph5, 0)), toD(t, ex - 230, yB(ex - 230, ph5, 0)), toD(t, ex - 190, yB(ex - 190, ph5, 0))] });
      var q = nucleotide(NB + 1, t, x0D(t)), f = toD(t, q.b[0] + 6, q.b[1]);
      out.push({ id: 'free', text: 'free bases (IB: RNA nucleotides)', x: f[0], y: f[1], side: 'R' });
    }
    return out;
  }

  /* ======================= E: a pore, 300 nm across (1 nm = 1.13 units) =======================
     The two membranes (each a double layer of lipid), joined round the pore; the pore's proteins (rings, threads into
     the cytoplasm, a basket into the nucleus); the mRNA, coiled in the nucleus, its 5' end first through the pore. */
  var EO = CY - 22, EI = CY + 22, ER = 52, ESPC = [118, 312];
  var ETR = (function () {
    var P = [];
    for (var v = 0; v <= 1.0001; v += .01) P.push(add(ESPC, spiralPt(v)));
    var lead = [[104, 272], [126, 262], [152, 270], [CX, 266], [CX, 244], [CX, 222], [CX, 200], [CX, 180], [CX, 160], [CX, 144], [CX - 6, 124],
                [CX - 26, 108], [CX - 62, 98], [72, 95], [30, 99], [-10, 104], [-60, 108]];
    var Q = D.smooth(P.concat(lead)), tr = track(D.resample(Q, Math.round(track(Q).len / 1.5)));
    tr.sSp = tr.near(add(ESPC, spiralPt(1)));
    tr.sF0 = tr.near([CX, CY]);
    tr.sF1 = tr.sF0 + 236;
    return tr;
  })();
  function frontE(t) { return t < M[7] ? ETR.sF0 : ETR.sF0 + 236 * ease(seg(loc(7, t), TZ + .5, TZ + 8.3)); }
  function wall(x0, xa, sw) {
    return 'M' + x0 + ' ' + EO + ' L' + xa + ' ' + EO + ' A22 22 0 0 ' + sw + ' ' + xa + ' ' + EI + ' L' + x0 + ' ' + EI;
  }
  /* the ribosome's two parts (F units): drawn here at 1/7.5, waiting in the cytoplasm */
  var SSH = blob(96, 34, [[3, .2, .05], [2, 2.6, .07], [5, 1.1, .03]], 60), LSH = blob(104, 74, [[3, 1.9, .06], [4, .3, .04], [2, 1.2, .05], [6, 2.4, .02]], 64);
  var EF = { z: 7.5 };
  function fToE(p) { return add(EF.ref, rot([(p[0] - FREF[0]) / EF.z, (p[1] - FREF[1]) / EF.z], EF.ang)); }
  var EDECO = [[262, 66, .3], [304, 128, -.4], [226, 140, 1.1]];
  function frameE(t) {
    var out = '<rect class="zm__cyto" x="-6000" y="-6000" width="12340" height="' + (6000 + CY) + '"/><rect class="zm__nucl" x="-6000" y="' + CY + '" width="12340" height="6400"/>';
    var xa = CX - ER - 22, xb = CX + ER + 22;
    out += '<path class="pt__lum" d="' + wall(-3000, xa, 1) + ' Z"/><path class="pt__lum" d="' + wall(W + 3000, xb, 0) + ' Z"/>';
    out += '<path class="pt__mem" d="' + wall(-3000, xa, 1) + '"/><path class="pt__mem" d="' + wall(W + 3000, xb, 0) + '"/>';
    out += '<path class="pt__mem2" d="' + wall(-3000, xa, 1) + '"/><path class="pt__mem2" d="' + wall(W + 3000, xb, 0) + '"/>';
    /* the pore's proteins: a ring on each face and one in the middle, threads into the cytoplasm, a basket below */
    [-1, 1].forEach(function (sd) {
      var xi = CX + sd * 24, xo = CX + sd * (ER + 8), x1 = Math.min(xi, xo), w = Math.abs(xo - xi);
      out += '<path class="pt__npcf" d="M' + (CX + sd * 34) + ' ' + (EO - 14) + ' C' + (CX + sd * 40) + ' ' + (EO - 40) + ' ' + (CX + sd * 30) + ' ' + (EO - 52) + ' ' + (CX + sd * 44) + ' ' + (EO - 74) +
        ' M' + (CX + sd * 50) + ' ' + (EO - 12) + ' C' + (CX + sd * 60) + ' ' + (EO - 36) + ' ' + (CX + sd * 52) + ' ' + (EO - 50) + ' ' + (CX + sd * 70) + ' ' + (EO - 66) + '"/>';
      out += '<path class="pt__npcf" d="M' + (CX + sd * 36) + ' ' + (EI + 16) + ' C' + (CX + sd * 38) + ' ' + (EI + 36) + ' ' + (CX + sd * 26) + ' ' + (EI + 46) + ' ' + (CX + sd * 20) + ' 268"/>';
      out += '<rect class="pt__npc" x="' + x1 + '" y="' + (EO - 16) + '" width="' + w + '" height="20" rx="8"/>';
      out += '<rect class="pt__npc" x="' + x1 + '" y="' + (CY - 12) + '" width="' + w + '" height="24" rx="8"/>';
      out += '<rect class="pt__npc" x="' + x1 + '" y="' + (EI - 4) + '" width="' + w + '" height="20" rx="8"/>';
    });
    out += '<path class="pt__npcf" d="M' + (CX - 21) + ' 268 L' + (CX + 21) + ' 268"/>';
    /* ribosomes waiting in the cytoplasm (the two that will form on this mRNA, and others) */
    out += subunitsE(t);
    /* the mRNA: from its coil in the nucleus, through the pore, the 5' end first */
    var sf = frontE(t), s0 = Math.max(0, sf - ETR.sF0), P = ETR.part(s0, sf, 1.5);
    out += '<path class="dna__s pt__mr pt__mrE" d="' + pl(P) + '"/>';
    var ticks = '';
    for (var s = s0 + 2; s < sf; s += 3.5) { var g = ETR.at(s); ticks += 'M' + n1(g.p[0]) + ' ' + n1(g.p[1]) + ' l' + n1(g.n[0] * 3) + ' ' + n1(g.n[1] * 3); }
    return out + '<path class="pt__tick" d="' + ticks + '"/>';
  }
  function subunitsE(t) {
    var out = '', sc = 1 / EF.z;
    function one(shape, c, a, cls) { return '<path class="' + cls + '" d="' + closed(place(shape, c, a, sc)) + '"/>'; }
    EDECO.forEach(function (d, i) {
      var c = [d[0] + 2 * Math.sin(t * .4 + i), d[1] + 2 * Math.cos(t * .3 + i)];
      out += one(LSH, add(c, rot([0, -12], d[2])), d[2], 'pt__ls') + one(SSH, add(c, rot([0, 5], d[2])), d[2], 'pt__ss');
    });
    out += one(SSH, fToE(SS0), EF.ang, 'pt__ss') + one(LSH, fToE(LS0), EF.ang, 'pt__ls');
    return out;
  }
  function labelsE(t) {
    if (t < M[8] && loc(7, t) < TZ + 8.4) return [];
    var top = ETR.at(ETR.sF1 - 60).p;
    return [{ id: 'nuc', text: 'nucleus', x: 24, y: 330, side: 'L' }, { id: 'cyt', text: 'cytoplasm', x: 320, y: 30, side: 'R' },
            { id: 'mem', text: 'the nuclear membrane (IB: nuclear envelope)', x: 300, y: EI + 2, side: 'B' },
            { id: 'pore', text: 'a pore (IB: nuclear pore)', x: CX + ER + 6, y: CY, side: 'R', alts: [[CX + ER + 6, EO - 6]] },
            { id: 'mr', text: 'mRNA, leaving the nucleus', x: top[0], y: top[1] - 3, side: 'T' },
            { id: 'rib', text: 'parts of ribosomes', x: EDECO[1][0] + 10, y: EDECO[1][1], side: 'R' }];
  }

  /* ======================= F: a ribosome, 40 nm across (1 nm = 8.5 units) =======================
     The mRNA along y = 262, its base m at x = 11.5 m (the bases drawn about four times larger than real), the 5' end at
     the left; the code starts at base 6 (AUG). The ribosome moves along it; the picture follows the ribosome, so the mRNA
     passes through it. tRNAs bring the amino acids; the chain leaves through the tunnel of the large part. */
  var FB = 13, FYB = 262, FYP = FYB - 18, MC = 6, NAA = 20, SPC = 15;
  var FREF = [-8, FYB];            /* the mRNA's 5' end, where the pore picture's mRNA ends */
  var AAK = { AUG: 'aa4', GCU: 'aa1', UCA: 'aa2', GGU: 'aa3' };
  function codon(n) { return MRNA.substr(MC + 3 * n, 3); }
  function codonX(n) { return FB * (MC + 3 * n + 1); }
  var RX0 = codonX(0) + 1.5 * FB, RXL = FB + 1.5 * FB;
  var SS0 = [RXL + 40, 560], LS0 = [RX0 - 56, -280];
  var CF0 = [120, 205];
  /* the cycles: CYC[n] holds when tRNA n arrives (a0–a1), its amino acid is joined (b0–b1), and the ribosome moves on
     (c0–c1); tRNA 0 (methionine, at the start codon AUG) only arrives */
  var CYC = (function () {
    var C = [{ a0: M[8] + TZ + 4.8, a1: M[8] + TZ + 6.8 }];
    /* step 10: the second one arrives slowly; step 11: ONE cycle, in order: the bond, the move by three bases, the empty
       one leaves, the next arrives (the audit of 5 Nov: "the text's order cannot be seen" when cycles overlap); step 12
       repeats it, faster */
    C[1] = { a0: M[9] + .6, a1: M[9] + 4.6, b0: M[10] + .4, b1: M[10] + 1.6, c0: M[10] + 2, c1: M[10] + 3.6 };
    C[2] = { a0: M[10] + 5.2, a1: M[10] + 7.6, b0: M[11] + .3, b1: M[11] + .75, c0: M[11] + .8, c1: M[11] + 1.25 };
    for (var n = 3; n < NAA; n++) { var b = M[11] + 1 + (n - 3) * .95; C[n] = { a0: b, a1: b + .5, b0: b + .55, b1: b + .72, c0: b + .74, c1: b + .95 }; }
    return C;
  })();
  var TREL = M[12] + 2.2;          /* the chain is released after the stop codon has stood empty in its place */
  function trans(n, t) { return n >= 1 && n < NAA ? ease(seg(t, CYC[n].c0, CYC[n].c1)) : 0; }
  function ribX(t) {
    var x = t < M[8] ? RXL : lerp(RXL, RX0, ease(seg(loc(8, t), TZ + 2.9, TZ + 4.6)));
    for (var n = 1; n < NAA; n++) x += 3 * FB * trans(n, t);
    return x;
  }
  function apart(t) { return t < M[12] ? 0 : ease(seg(loc(12, t), 2.6, 5.6)); }
  function ssPos(t) {
    if (t < M[8] + TZ + 2.8) return mix(SS0, [RXL - 6, 296], ease(seg(loc(8, t), TZ + .3, TZ + 2.8)));
    var k = apart(t); return [ribX(t) - 6 + 90 * k, 296 + 60 * k];
  }
  function lsPos(t) {
    if (t < M[8] + TZ + 9.4) return mix(LS0, [RX0 - 4, 168], ease(seg(loc(8, t), TZ + 7, TZ + 9.4)));
    var k = apart(t); return [ribX(t) - 4 + 120 * k, 168 - 100 * k];
  }
  /* a part of the ribosome: one smooth shape, a lighter centre for its depth (Daniel, 5 Nov 2026: the coiled RNA and the
     protein dots drawn inside it looked "very clunky … not very clear what those lines are … and the dots"); the step
     says what it is made of */
  function subunit(shape, c, cls) {
    var P = place(shape, c), cx = 0, cy = 0; P.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= P.length; cy /= P.length;
    var Q = P.map(function (p) { return [cx + (p[0] - cx) * .62, cy + (p[1] - cy) * .5 - 4]; });
    return '<path class="' + cls + '" d="' + closed(P) + '"/><path class="pt__sheen" d="' + closed(Q) + '"/>';
  }
  /* a tRNA (anticodon at the bottom, its three bases, the amino acid's place at the top), drawn with its anticodon's
     middle at (0, 0) */
  var TRNA = 'M-19 -18 L-19 -29 Q-19 -36 -9 -38 L-9 -51 Q-15 -52 -15 -60 Q-15 -69 -6 -70 L-5 -92 Q0 -98 5 -92 L6 -70 Q15 -69 15 -60 Q15 -52 9 -51 L9 -38 Q19 -36 19 -29 L19 -18 Z';
  var TIP = [0, -106], DEG = PI / 180;
  function trnaPose(n, t) {
    var C = CYC[n]; if (!C || t < C.a0) return null;
    var xb = codonX(n), o = [xb, FYP];
    var tilt = (n === 0 ? 4 : lerp(-4, 4, trans(n, t))) * DEG + 13 * DEG * trans(n + 1, t);
    var last = n === NAA - 1, e0 = last ? M[12] + 2.6 : CYC[n + 1].c1, e1 = e0 + (last ? 2.4 : n >= 3 ? .8 : 1.4);
    if (t > e1 && !last) return null;
    var k = ease(seg(t, C.a0, C.a1)), st = [xb + 330, -60], cp = [xb + 150, 120];
    var p = [lerp(lerp(st[0], cp[0], k), lerp(cp[0], o[0], k), k), lerp(lerp(st[1], cp[1], k), lerp(cp[1], o[1], k), k)];
    var a = lerp(40 * DEG, tilt, k), x = ease(seg(t, e0, e1));
    if (x > 0) { p = mix(p, last ? [xb - 40, 380] : [xb - 330, -60], x); a = lerp(a, last ? -20 * DEG : 60 * DEG, x); }
    return { o: p, a: a, n: n };
  }
  function tipOf(q) { return add(q.o, rot(TIP, q.a)); }
  function trnaSvg(q, lo, box) {
    var ac = codon(q.n), out = '<g transform="translate(' + n1(q.o[0]) + ' ' + n1(q.o[1]) + ') rotate(' + dg(q.a) + ')"><path class="pt__trna" d="' + TRNA + '"/>';
    for (var i = 0; i < 3; i++) {
      var b = { A: 'U', U: 'A', C: 'G', G: 'C' }[ac.charAt(i)], x = (i - 1) * FB;
      out += '<rect class="pt__nb dna__fill--' + b + '" x="' + n1(x - 5.5) + '" y="-18" width="11" height="18" rx="2"/>';
      if (lo > 0) out += letter(x, -9, b, 11, lo);
    }
    if (box > 0) out += '<rect class="pt__box" x="-21" y="-20" width="42" height="22" rx="4"' + op(box) + '/>';
    return out + '</g>';
  }
  /* the chain's way: from the amino acid at the tRNA's tip, into the large part, along its tunnel and out of it, then
     coiled as it begins to fold */
  function chainPath(anchor, rx) {
    var P = [anchor, [rx - 2, 128], [rx - 10, 112], [rx - 18, 98], [rx - 26, 86]];
    for (var u = 6; u < 420; u += 6) P.push([rx - 26 - .32 * u + 8 * Math.sin(u / 6), 86 - .62 * u + 3 * Math.cos(u / 5)]);
    return track(P);
  }
  /* where every amino acid of the chain is at time t (before it is released) */
  function chainAt(t) {
    var nb = 0; for (var n = 1; n < NAA; n++) if (t >= CYC[n].b0) nb = n;
    var rx = ribX(t), out = [];
    if (!nb) { var q0 = trnaPose(0, t); return q0 ? [tipOf(q0)] : []; }
    var kb = ease(seg(t, CYC[nb].b0, CYC[nb].b1)), qa = trnaPose(nb, t), qp = trnaPose(nb - 1, t);
    var after = chainPath(tipOf(qa), rx), before = qp ? chainPath(tipOf(qp), rx) : after;
    for (var i = 0; i <= nb; i++) {
      var pa = after.at((nb - i) * SPC).p, pb = i === nb ? tipOf(qa) : before.at((nb - 1 - i) * SPC).p;
      out.push(mix(pb, pa, kb));
    }
    return out;
  }
  /* the folded protein: 20 amino acids packed close (two short coils and a turn), no two overlapping */
  var FOLD = (function () {
    var P = [];
    for (var i = 0; i < NAA; i++) {
      if (i < 3) P.push([-40 + i * 12, -50 + i * 6]);
      else if (i < 9) P.push([-20 + (i % 2 ? 7 : -7), -34 + (i - 3) * 13]);
      else if (i < 11) P.push([-6 + (i - 9) * 16, 48]);
      else if (i < 17) P.push([24 + (i % 2 ? -7 : 7), 36 - (i - 11) * 13]);
      else P.push([30 - (i - 17) * 15, -50 - (i - 17) * 3]);
    }
    for (var it = 0; it < 60; it++) for (var a = 0; a < NAA; a++) for (var b = a + 1; b < NAA; b++) {
      var d = dist(P[a], P[b]), want = b === a + 1 ? 15 : 16;
      if (d < want || (b === a + 1 && d > 16)) { var k = (want - d) / 2 / (d || 1); P[a] = [P[a][0] - (P[b][0] - P[a][0]) * k, P[a][1] - (P[b][1] - P[a][1]) * k]; P[b] = [P[b][0] + (P[b][0] - P[a][0]) * k, P[b][1] + (P[b][1] - P[a][1]) * k]; }
    }
    return P;
  })();
  var FROZEN = null;
  function released() { if (!FROZEN) FROZEN = chainAt(TREL); return FROZEN; }
  function protCentre() { var F = released(), c = [0, 0]; F.forEach(function (p) { c[0] += p[0] / F.length; c[1] += p[1] / F.length; }); return [c[0] - 10, c[1] + 10]; }
  function foldK(i, t) { return ease(seg(t, M[12] + 2.4 + .08 * i, M[12] + 5.6 + .08 * i)); }
  function chainNow(t) {
    if (t < TREL) return chainAt(t);
    var F = released(), pc = protCentre();
    return F.map(function (p, i) { return mix(p, add(pc, FOLD[i]), foldK(i, t)); });
  }
  function camF(t) {
    var rx = ribX(t), c = [lerp(CF0[0], rx, ease(seg(loc(8, t), TZ + 2.9, TZ + 4.9))), CF0[1]], s = 1;
    if (t >= M[11]) { var k = ease(seg(loc(11, t), 0, 3)); s = lerp(1, .62, k); c = [rx - 30 * k, lerp(CF0[1], 160, k)]; }
    if (t >= M[12]) { var k2 = ease(seg(loc(12, t), 2.4, 7)), pc = protCentre(); s = lerp(.62, .7, k2); c = mix([rx - 30, 160], [(pc[0] + rx + 60) / 2, (pc[1] + 250) / 2], k2); }
    return { s: s, c: c };
  }
  function frameF(t) {
    var cam = camF(t), s = cam.s, c = cam.c, lo = seg(s, .55, .8), rx = ribX(t);
    var xl = c[0] - (CX + 30) / s, xr = c[0] + (CX + 30) / s;
    var out = ground('zm__cyto') + '<g transform="translate(' + CX + ' ' + CY + ') scale(' + r4(s) + ') translate(' + n1(-c[0]) + ' ' + n1(-c[1]) + ')">';
    var ss = ssPos(t), ls = lsPos(t);
    out += subunit(SSH, ss, 'pt__ss');
    out += subunit(LSH, ls, 'pt__ls');
    if (t >= M[8] + TZ + 9.4 && apart(t) < 1) out += '<path class="pt__tun" d="M' + n1(rx - 2) + ' 136 L' + n1(rx - 10) + ' 112 L' + n1(rx - 18) + ' 98 L' + n1(ls[1] < 168 ? rx - 26 : rx - 26) + ' 90"' + op(1 - apart(t)) + '/>';
    /* the mRNA: the groups of three bases (shaded in turn) once tRNA is shown, its bases and their letters, its backbone */
    var ck = t < M[9] ? 0 : seg(loc(9, t), 2.6, 3.6), mr = '';
    var m0 = Math.max(0, Math.floor(xl / FB)), m1 = Math.min(MRNA.length - 1, Math.ceil(xr / FB));
    if (ck > 0) for (var n = 0; n <= NAA; n++) { var cx = codonX(n); if (cx < xl - 40 || cx > xr + 40) continue; mr += '<rect class="pt__cod pt__cod--' + (n % 2) + '" x="' + n1(cx - 19.5) + '" y="' + (FYP - 3) + '" width="39" height="26" rx="5"' + op(ck) + '/>'; }
    mr += '<path class="pt__mrF" d="M' + FREF[0] + ' ' + FYB + ' L' + n1(Math.max(FB * MRNA.length, xr + 20)) + ' ' + FYB + '"/>';
    for (var m = m0; m <= m1; m++) {
      var b = MRNA.charAt(m), x = FB * m;
      mr += '<rect class="pt__nb dna__fill--' + b + '" x="' + n1(x - 5.5) + '" y="' + FYP + '" width="11" height="18" rx="2"/>';
      if (lo > 0) mr += letter(x, FYP + 9.2, b, 11, lo);
    }
    out += mr;
    /* the tRNAs, the amino acids they carry, the chain */
    var qs = [];
    for (var i = 0; i < NAA; i++) { var q = trnaPose(i, t); if (q) qs.push(q); }
    var bk = t >= M[9] && t < M[10] ? seg(loc(9, t), 4.8, 5.6) : 0;
    if (bk > 0) out += '<rect class="pt__box" x="' + n1(codonX(1) - 20.5) + '" y="' + (FYP - 2) + '" width="41" height="23" rx="4"' + op(bk) + '/>';
    if (t >= M[12]) out += '<rect class="pt__box" x="' + n1(codonX(NAA) - 20.5) + '" y="' + (FYP - 2) + '" width="41" height="23" rx="4"' + op(seg(loc(12, t), .2, 1)) + '/>';
    qs.forEach(function (q) { out += trnaSvg(q, lo, q.n === 1 ? bk : 0); });
    var ch = chainNow(t), nb = 0; for (var j = 1; j < NAA; j++) if (t >= CYC[j].b0) nb = j;
    if (ch.length > 1) {
      var links = '';
      for (var a = 0; a + 1 < ch.length; a++) links += 'M' + n1(ch[a][0]) + ' ' + n1(ch[a][1]) + ' L' + n1(ch[a + 1][0]) + ' ' + n1(ch[a + 1][1]) + ' ';
      out += '<path class="pt__pep" d="' + links + '"/>';
    }
    if (nb && t < CYC[nb].b1 + .5 && ch.length > nb) {
      var fl = Math.sin(PI * seg(t, CYC[nb].b0, CYC[nb].b1 + .5)), bm = mix(ch[nb - 1], ch[nb], .5);
      out += '<circle class="pt__bond" cx="' + n1(bm[0]) + '" cy="' + n1(bm[1]) + '" r="11"' + op(fl) + '/>';
    }
    if (t >= M[12] + 6) {
      var pf = chainNow(t), hk = seg(loc(12, t), 6, 8);
      out += '<path class="pt__prot" d="' + hull(pf) + '"' + op(hk) + '/>';
    }
    ch.forEach(function (p, i) { out += '<circle class="aa ' + AAK[codon(i)] + '" cx="' + n1(p[0]) + '" cy="' + n1(p[1]) + '" r="6.5"/>'; });
    /* amino acids still on their tRNA, not yet joined */
    qs.forEach(function (q) { if (q.n > nb && q.n < NAA) { var tp = tipOf(q); out += '<circle class="aa ' + AAK[codon(q.n)] + '" cx="' + n1(tp[0]) + '" cy="' + n1(tp[1]) + '" r="6.5"/>'; } });
    return out + '</g>';
  }
  /* a rounded outline round points: the protein's surface */
  function hull(P) {
    var c = [0, 0]; P.forEach(function (p) { c[0] += p[0] / P.length; c[1] += p[1] / P.length; });
    var Q = [];
    for (var i = 0; i < 40; i++) {
      var a = i / 40 * 2 * PI, u = [Math.cos(a), Math.sin(a)], r = 0;
      P.forEach(function (p) { r = Math.max(r, (p[0] - c[0]) * u[0] + (p[1] - c[1]) * u[1]); });
      Q.push([c[0] + u[0] * (r + 12), c[1] + u[1] * (r + 12)]);
    }
    return closed(D.smooth(Q.concat([Q[0], Q[1]])));
  }
  function toF(t, p) { var cm = camF(t); return [CX + cm.s * (p[0] - cm.c[0]), CY + cm.s * (p[1] - cm.c[1])]; }
  function labelsF(t) {
    var out = [], rx = ribX(t), k = 0; for (var i = 0; i < M.length - 1; i++) if (t >= M[i] - 1e-6) k = i;
    function it(id, text, p, side, alts) { var q = toF(t, p); out.push({ id: id, text: text, x: q[0], y: q[1], side: side, alts: (alts || []).map(function (a) { return toF(t, a); }) }); }
    var cm = camF(t), left = cm.c[0] - (CX - 18) / cm.s;
    if (k === 8) {
      if (loc(8, t) < TZ + 9.6) return [];
      var ls = lsPos(t), ss = ssPos(t), q00 = trnaPose(0, t);
      it('ls', 'the large part of a ribosome (IB: large subunit)', [ls[0] + 104, ls[1] - 6], 'R');
      it('ss', 'the small part (IB: small subunit)', [ss[0] + 92, ss[1] + 2], 'R');
      it('met', 'the first amino acid, on a small RNA (IB: tRNA)', add(tipOf(q00), [0, -6.5]), 'T');
      it('mr', 'mRNA', [FREF[0] + 3, FYB], 'L');
      return out;
    }
    if (k === 9) {
      if (loc(9, t) < 5.6) return [];
      var q1 = trnaPose(1, t), q0 = trnaPose(0, t);
      it('aa', 'an amino acid, carried by the small RNA', add(tipOf(q1), [0, -6.5]), 'T');
      it('trna', 'a small RNA (IB: tRNA)', add(q1.o, rot([16, -58], q1.a)), 'R', [add(q1.o, rot([15, -50], q1.a)), add(q1.o, rot([15, -66], q1.a)), add(q1.o, rot([9, -42], q1.a))]);
      it('anti', 'its three bases (IB: anticodon)', add(q1.o, rot([21, -9], q1.a)), 'R', [add(q1.o, rot([21, -4], q1.a)), add(q1.o, rot([21, -15], q1.a))]);
      it('cod', 'three bases of the mRNA (IB: codon)', [codonX(1), FYP + 21], 'B');
      it('met', 'the first amino acid', add(tipOf(q0), [-6.5, 0]), 'L');
      return out;
    }
    if (k === 10) {
      if (loc(10, t) < 7.8) return [];
      var ch = chainAt(t), q2 = trnaPose(2, t);
      it('pep', 'the bond between two amino acids (IB: peptide bond)', mix(ch[0], ch[1], .5), 'T');
      it('next', 'the next amino acid, carried by a small RNA', add(tipOf(q2), [6.5, 0]), 'R', [add(tipOf(q2), [5.5, -3]), add(tipOf(q2), [5.5, 3])]);
      it('mr', 'the mRNA, passing through the ribosome', [cm.c[0] + (CX - 34) / cm.s, FYB + 3], 'B');
      return out;
    }
    if (k === 11) {
      if (loc(11, t) < 17.6) return [];
      var c2 = chainAt(t), lf = c2.reduce(function (a, p) { return p[0] < a[0] ? p : a; }, c2[0]);
      it('ch', 'the chain grows: one amino acid for each three bases', add(lf, [-6.5, 0]), 'L');
      return out;
    }
    if (k === 12) {
      if (loc(12, t) < 8.2) return [];
      var pf = chainNow(t), lt = pf.reduce(function (a, p) { return p[0] < a[0] ? p : a; }, pf[0]), l2 = lsPos(t), s2 = ssPos(t);
      it('prot', 'the protein: a chain of amino acids, folded into its shape', add(lt, [-12, 0]), 'L');
      it('ls', 'the large part of the ribosome, apart', [l2[0] + 104, l2[1] - 6], 'R');
      it('ss', 'the small part, apart', [s2[0] + 92, s2[1] + 2], 'R');
      it('stop', 'the end of the code (IB: stop codon)', [codonX(NAA), FYP + 21], 'B');
      return out;
    }
    return out;
  }
  /* the mapping between the pore picture and the ribosome picture: the 5' end of the mRNA in both */
  (function () {
    var g = ETR.at(ETR.sF1), g2 = ETR.at(ETR.sF1 - 15);
    EF.ref = g.p; EF.ang = Math.atan2(g.p[1] - g2.p[1], g.p[0] - g2.p[0]) + PI;
  })();

  var FR = [frameA, frameB, frameC, frameD, frameD, frameC, frameB, frameE, frameF, frameF, frameF, frameF, frameF];
  var LB = [labelsA, labelsB, labelsC, labelsD, labelsD, labelsC, labelsB, labelsE, labelsF, labelsF, labelsF, labelsF, labelsF];
  /* how each step comes out of the one before. `in`: from the point F of the old picture, z times enlarged, turning so the
     part at F (at angle ang there) lies along the new picture; `out`: the old picture shrinking into the point F of the new
     one, where it lies at angle ang. null: the same picture goes on. Every z is the real ratio of the two widths. */
  var ZM = [null,
    { z: Z1, F: function () { return { p: [NU1[0], NU1[1]], ang: 0 }; } },
    { z: ZBC, F: function () { var g = geneB(M[2] * .5); return { p: g.p, ang: g.ang }; } },
    { z: .4 * KD / KC, F: function () { var g = CTR.at(CTR.s0 + 60 * KDC); return { p: g.p, ang: g.ang }; } },
    null,
    { z: KD / KC, out: true, F: function () { var g = CTR.at(CTR.s0 + (enzX(M[5]) - 50) * KDC); return { p: [g.p[0] - 10 * KDC * g.n[0], g.p[1] - 10 * KDC * g.n[1]], ang: g.ang }; } },
    { z: ZBC, out: true, F: function () { var g = geneB(M[6] * .5); return { p: g.p, ang: g.ang }; } },
    { z: 33.3, F: function () { return { p: PORE.p, ang: PORE.ang }; } },
    { z: 7.5, F: function () { return { p: fToE(CF0), ang: EF.ang }; } },
    null, null, null, null];
  function grp(svg, P, a, s, Q, o) {
    if (o <= .01) return '';
    return '<g' + op(o) + ' transform="translate(' + n1(P[0]) + ' ' + n1(P[1]) + ') rotate(' + dg(a) + ') scale(' + r4(s) + ') translate(' + n1(-Q[0]) + ' ' + n1(-Q[1]) + ')">' + svg + '</g>';
  }
  function stepOf(t) { var k = 0; for (var i = 0; i < M.length - 1; i++) if (t >= M[i] - 1e-6) k = i; return k; }
  function scene(t) {
    var k = stepOf(t), Z = ZM[k], e = Z ? ease(seg(t, M[k], M[k] + TZ)) : 1, cur = FR[k](t, { k: k, e: e });
    if (e >= 1) return { k: k, e: 1, svg: cur };
    var f = Z.F(), F = f.p, a = f.ang || 0, prev = FR[k - 1](M[k] - .001, { k: k, e: e, old: true }), oOld = 1 - seg(e, .5, .88), oNew = seg(e, .4, .8), P, svg;
    if (Z.out) { P = mix([CX, CY], F, e); svg = grp(cur, P, -a * (1 - e), Math.pow(Z.z, 1 - e), F, oNew) + grp(prev, P, a * e, Math.pow(Z.z, -e), [CX, CY], oOld); }
    else { P = mix(F, [CX, CY], e); svg = grp(prev, P, -a * e, Math.pow(Z.z, e), F, oOld) + grp(cur, P, a * (1 - e), Math.pow(Z.z, e - 1), [CX, CY], oNew); }
    return { k: k, e: e, svg: svg };
  }

  /* the frame: WKit.frameOf's margins for the names beside the drawing, and a band above and below it for the names
     that stand over or under their part, each with one upright line (sides 'T' and 'B' of CircLearn.labels, 5 Nov
     2026: a line from a side would have run over the DNA, the enzyme or another fold) */
  function frameOf(svg, bg, model, clipRect, Dw, narrow) {
    var m = K.margins(narrow, 16, 16, 88, 88), ft = K.fitType(Dw, W, m[0], m[1], m[2], m[3], 14.5), f = ft.f;
    var band = narrow ? f * .72 * 2 + 8 : 3 * f * 1.18 + f * .6, pad = 10 + band;
    var vb = { x: -ft.mL, y: -pad, w: W + ft.mL + ft.mR, h: H + 2 * pad, bw: W, bh: H };
    svg.setAttribute('viewBox', n1(vb.x) + ' ' + n1(vb.y) + ' ' + n1(vb.w) + ' ' + n1(vb.h));
    bg.setAttribute('x', n1(vb.x)); bg.setAttribute('y', n1(vb.y)); bg.setAttribute('width', n1(vb.w)); bg.setAttribute('height', n1(vb.h)); bg.setAttribute('rx', 18);
    clipRect.setAttribute('x', 0); clipRect.setAttribute('y', 0); clipRect.setAttribute('width', W); clipRect.setAttribute('height', H);
    model.setAttribute('transform', 'translate(0 0)');
    return { f: f, mL: ft.mL, mR: ft.mR, vb: vb, bandT: -5, bandB: H + 5, to: function (x, y) { return [x, y]; } };
  }
  /* the names: beside the drawing on ruled level lines, or above and below it; on a phone, numbered pins and their key */
  function names(lay, items, narrow, key) {
    var vb = lay.vb, o = { font: lay.f, top: vb.y + 6, bottom: vb.y + vb.h - 6, left: -8, right: vb.bw + 8, bandT: lay.bandT, bandB: lay.bandB, bandL: 4, bandR: W - 4, gap: 6 };
    function only(f) { return items.filter(f); }
    if (!narrow) {
      key.hidden = true;
      return L.labels(Object.assign({}, o, { items: only(function (q) { return q.side !== 'R'; }), width: lay.mL - 26 })) +
             L.labels(Object.assign({}, o, { items: only(function (q) { return q.side === 'R'; }), width: lay.mR - 26 }));
    }
    var P = L.pinLabels(Object.assign({}, o, { items: items, left: -4, right: vb.bw + 4, gap: 4 }));
    key.hidden = !P.order.length;
    key.innerHTML = P.order.map(function (q) { return '<li><b>' + q.n + '</b> ' + L.esc(q.text) + '</li>'; }).join('');
    return P.svg;
  }

  function protein(spec) {
    var S = K.shell(spec, 'pt', 'How a protein is made', 'A body cell; its nucleus; one gene, thousands of base pairs long; an enzyme copying the start of the gene into mRNA, base by base; the mRNA leaving the nucleus through a pore; a ribosome forming on it; tRNAs bringing amino acids, three bases for each; the chain of amino acids growing and folding into a protein.',
      [['see', 'You see:'], ['where', 'Where:'], ['size', 'Across the picture:']]);
    var svg = S.svg, NSV = K.NS, uid = 'pt' + Math.random().toString(36).slice(2, 7);
    var defs = document.createElementNS(NSV, 'defs'), cp = document.createElementNS(NSV, 'clipPath'), cr = document.createElementNS(NSV, 'rect');
    cp.setAttribute('id', uid); cr.setAttribute('rx', 14); cp.appendChild(cr); defs.appendChild(cp); svg.appendChild(defs);
    var bg = document.createElementNS(NSV, 'rect'); bg.setAttribute('class', 'zm__bg'); svg.appendChild(bg);
    var model = document.createElementNS(NSV, 'g'); svg.appendChild(model);
    var gLab = document.createElementNS(NSV, 'g'); svg.appendChild(gLab);
    var lay = null, narrow = false, key = K.pinKey(S);
    var R = [0];
    STEPS.forEach(function (s, i) { var w = (s.h + ' ' + s.p).replace(/\*\*/g, '').split(/\s+/).length; R.push(R[i] + Math.max(M[i + 1] - M[i], w / 2)); });
    var clock = K.readerClock(R, M, 1);
    function draw(tt) {
      var t = clock(tt), sc = scene(t);
      model.innerHTML = '<g clip-path="url(#' + uid + ')">' + PANE + sc.svg + '</g><rect class="zm__pane pt__edge" x="0" y="0" width="' + W + '" height="' + H + '" rx="14"/>';
      var items = sc.e > .95 ? LB[sc.k](t).map(function (q) { var p = lay.to(q.x, q.y); return { id: q.id, text: q.text, x: p[0], y: p[1], side: q.side, alts: q.alts || [] }; }) : [];
      gLab.innerHTML = names(lay, items, narrow, key);
      S.pill('see', SEE[sc.k], 'ok'); S.pill('where', WHERE[sc.k], 'ok'); S.pill('size', SIZE[sc.k], 'ok');
    }
    var sp = L.stepper({ steps: K.readerSteps(STEPS.map(function (s, i) { return { t: M[i], h: s.h, p: s.p }; }), R), end: R[R.length - 1], render: draw, flow: K.readerFlow(R, M, 1) });
    S.box.__end = R[R.length - 1];
    /* under it only the key, drawn (Daniel, 5 Nov 2026: "I hate when you actually, below steps, provide so much text";
       "Why don't you show them instead of writing about them?") */
    return K.mount(S, sp, 'pt', [
      /* each name only in the steps whose picture shows its part (the steps from 0) */
      { key: [['mum', 'from the mother', [0, 1, 6]], ['dad', 'from the father', [0, 1, 6]], ['other', 'other chromosomes', [0, 1, 6]], ['mito', 'mitochondria', [0]],
              ['dna', 'DNA', [2, 3, 4, 5]], ['gene', 'the gene', [1, 6]], ['dnagene', 'the gene', [2, 3, 4, 5]], ['hist', 'proteins DNA is wound round', [2, 5]],
              ['bases', 'the four bases of DNA', [3], 'ATCG'], ['bases', 'the bases (U: in RNA only)', [4], 'ATCGU'], ['bases', 'the bases of RNA', [8, 9, 10, 11, 12], 'ACGU'],
              ['enz', 'the enzyme', [3, 4, 5]], ['mrna', 'mRNA', [4, 5, 6, 7, 8, 9, 10, 11, 12]], ['rib', 'a ribosome', [7, 8, 9, 10, 11, 12]],
              ['trna', 'small RNAs (IB: tRNA)', [8, 9, 10, 11, 12]], ['aa', 'amino acids', [8, 9, 10, 11, 12]]] }
    ], function (Dw, nar) {
      narrow = nar; lay = frameOf(svg, bg, model, cr, Dw, nar);
    });
  }
  L.add('protein', protein);
})(window);
