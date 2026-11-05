/* ============================================================
   w-zoom.js — "From a cell to a gene" (station `genes`, 17.1.1–17.1.2, 17.1.12, 17.2.3, 4.1.4). Eleven steps, each held
   until "Next step"; each picture is a part of the one before, enlarged (or, twice, the one before seen from further away):
     1 a body cell: membrane, cytoplasm, mitochondria, ribosomes, the nucleus;
     2 the nucleus of a working cell: each chromosome a long, very thin thread folded in its own part of the nucleus;
       23 pairs; chromosome 9 from the mother and from the father;
     3 one thread enlarged: DNA wound round small balls of protein (histones), almost twice round each;
     4 a gene: seen from further away, one lit stretch of the string of beads (about 1,400 base pairs, 7 beads);
     5 the DNA of the gene, between two beads: a double helix, its bases (already marked on the beads' DNA), the bonds;
     6 replication begins: an enzyme at the fork separates the strands, an enzyme on each old strand makes a new one;
     7 replication ends: two identical molecules of DNA, each one old strand and one new;
     8 back in the nucleus: each chromosome two identical threads, side by side;
     9 the copies coil into crosses;
    10 part of one copy: the same thread of DNA and proteins folded in loops;
    11 the pair the gene is on: chromosome 9 from each parent, the allele Iᴬ on both copies of the mother's, Iᵒ on both
       copies of the father's, near the end of the long arm (9q34).
   Daniel, 4 Nov 2026: "very professional … the DNA not condensed, then condensing into chromosomes, then … replication,
   and then zooming in into the chromosome, seeing the histones and everything". 5 Nov, on the first version: zooms
   "extremely fast", no histones on the way in, "suddenly you show new structures … The bases do not appear", names
   "crossing the whole screen". So every zoom takes 5 model seconds (about 3 s; the way back to the nucleus 7) and turns
   as it goes, so the new picture lies along the part it came from; the bases grow in after the strands are seen; names
   wait until the motion stops and point at a part from their own side, or from above (sides 'T'). The final audit of
   5 Nov (examiner, biologist, animation designer; notes folder audit-1) split two crowded steps, put the enzymes where
   they work, gave the mark schemes' words (a gene "is a length of DNA that codes for a protein"; the nuclear membrane;
   replication), printed the alleles on their bands and kept chromosome 9 one size from step to step. The order is the
   cell's: copied while a thin thread (S phase), only then coiled (prophase).

   THE BIOLOGY: chromatin in territories, one thread per chromosome, never crossing another; nucleosomes, DNA (2 nm)
   wound 1.65 times round each core of histones (about 11 nm), linker DNA between; B-DNA, ten base pairs a turn, two
   grooves; a gene thousands of base pairs long; semi-conservative replication (helicase at the fork, DNA polymerase on
   each old strand; both new strands drawn made in one piece: one is really made in short pieces, IB HL; the two new
   molecules drawn apart for clarity); the copies coil and stay joined at the centromere (InhDraw.crossRod, arms 24°),
   the nuclear membrane still whole; a chromatid's DNA in loops; chromosome 9 about 3 µm long, the ABO gene near the end
   of its long arm.
   SOURCES: syllabus 0610 2026–28 4.1.4, 17.1.1, 17.1.2, 17.1.12, 17.2.3, 17.4.15; 0610 mark schemes ("length of DNA ;
   that codes for a protein"; "nuclear membrane"; "replicate"); IB Biology (2025) D2.1.5–D2.1.6, A1.2 (HL, nucleosomes).
   The drawing functions are InhDraw's (js/inh-draw.js), the same in every animation of the lab.
   Every frame is a pure function of the time t (memory headless-raf-animations).
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, K = global.WKit, D = global.InhDraw; if (!L || !K || !D || !D.coiled) return;
  var n1 = K.n1, seg = K.seg, ease = K.ease, lerp = K.lerp;
  var W = 340, H = 380, CX = 170, CY = 190, PI = Math.PI, TZ = 5;
  var STEPS = [
    { h: 'A body cell', p: 'A cell from your body, about 25 micrometres across. Its **nucleus** holds the **chromosomes**: 46 in a human body cell.' },
    { h: 'Inside the nucleus', p: 'In a working cell each chromosome is a long, very thin thread of **DNA**, folded many times in its own part of the nucleus. Chromosomes are in pairs: 23 pairs in a human body cell. One of each pair came from the mother, and one from the father. Two pairs are coloured here.' },
    { h: 'Wound round proteins', p: 'Enlarged: the thread is DNA wound round small balls of protein, almost twice round each, like thread round beads. This is the first step in packing about 2 metres of DNA into one nucleus.' },
    { h: 'A gene', p: 'Seen from a little further away: a **gene** is a length of DNA that codes for a protein. This gene, lit in yellow, is about 1,400 base pairs long, wound round 7 balls of protein; most genes are longer, thousands of base pairs. One chromosome carries many genes.' },
    { h: 'The DNA of the gene', p: 'Enlarged: part of the gene, between two balls of protein. The DNA is two strands twisted into a **double helix**, with **bases** between them. Bonds between the pairs of bases hold the two strands together, and the bases always pair in the same way: A with T, and C with G.' },
    { h: 'Replication begins', p: 'Before a cell divides, its DNA is copied exactly: this exact copying is called **replication**. An enzyme separates the two strands, and an enzyme makes a new strand along each old one: each new base pairs with the base opposite it, A with T and C with G.' },
    { h: 'Two identical molecules', p: 'The whole chromosome is copied in this way. The result is two identical molecules of DNA, each with one old strand and one new strand: the chromosome is now two identical copies.' },
    { h: 'Back in the nucleus', p: 'Back in the nucleus: each chromosome is now two identical threads, side by side, held together most firmly at one point. The yellow length on chromosome 9 is one gene, the **ABO gene**, at the same place on both threads. The cell is ready to divide.' },
    { h: 'Coiling into a cross', p: 'Each copy coils, again and again, until it is short and thick. The copies stay joined at one point, so the chromosome is now a cross. You see a cross only while a cell divides.' },
    { h: 'Inside one copy', p: 'Enlarged: the end of the long arm of one copy. Its DNA and proteins are folded into thousands of loops. The ABO gene, lit yellow, is a short length of one loop: about 20,000 base pairs. The yellow band on a drawing of a chromosome marks its place, but is drawn much larger than the gene.' },
    { h: 'A pair, and two alleles', p: 'Back to the whole pair: chromosome 9 from the mother and from the father. The yellow band marks the place of the **ABO gene**, the same on both. In Iᴬ, the capital **I** stands for the ABO gene, and the small raised letter (ᴬ, ᴮ or ᵒ) shows the **allele**. This person has Iᴬ on one and Iᵒ on the other; both copies carry the same allele.' },
    { h: 'Two alleles: different bases', p: 'Enlarged: the same part of the ABO gene on the two chromosomes. **Iᴬ** and **Iᵒ** have the same bases, except one: a G is missing in Iᵒ. The bases are read in threes, so after the gap every three is different, and the protein of Iᵒ does not work. **Iᴮ** differs from Iᴬ in 7 bases: its protein works a little differently, which gives blood group B.' },
    { h: 'Genotype and phenotype', p: 'Back to the pair. The alleles a person has are their **genotype**: this person’s genotype is IᴬIᵒ. The feature that can be observed is their **phenotype**: this person’s phenotype is blood group A, because Iᴬ is dominant to Iᵒ.' }
  ];
  var M = [0, 7, 18, 30, 39, 49, 59, 69, 81, 92, 103, 114, 125, 133];
  var SEE = ['a body cell', 'its nucleus', 'DNA round proteins', 'a gene', 'part of the gene: its DNA', 'the DNA being copied', 'two identical molecules', 'the copied chromosomes', 'the chromosomes coiling', 'part of one copy', 'one pair', 'the bases of two alleles', 'one pair'];
  var NM8 = 'about 8 nm (0.000008 mm)', UM10 = 'about 10 µm (0.01 mm)';
  var SIZE = ['about 25 µm (0.025 mm)', UM10, 'about 70 nm (0.00007 mm)', 'about 230 nm (0.00023 mm)', NM8, NM8, NM8, UM10, UM10, 'about 0.6 µm (0.0006 mm)', 'about 4 µm (0.004 mm)', NM8, 'about 4 µm (0.004 mm)'];
  function op(o) { return o < .999 ? ' opacity="' + n1(Math.max(0, o) * 100) / 100 + '"' : ''; }
  function rot(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }
  function mix(p, q, k) { return [lerp(p[0], q[0], k), lerp(p[1], q[1], k)]; }
  function dist(p, q) { var dx = q[0] - p[0], dy = q[1] - p[1]; return Math.sqrt(dx * dx + dy * dy); }
  function loc(k, t) { return t - M[k]; }
  /* each picture's surroundings, painted far past its edge so no zoom ever shows a picture's border: outside the cell
     (step 1), the cytoplasm round the nucleus (steps 2, 8, 9), the inside of the nucleus (the rest), so a zoom never
     changes the colour round what it follows (the protein-animation session's way, 5 Nov 2026) */
  function far(cls) { return '<rect class="' + cls + '" x="-3000" y="-3000" width="' + (W + 6000) + '" height="' + (H + 6000) + '"/>'; }
  var PANE = far('zm__far'), CYTO = far('zm__cyto'), NUCL = far('zm__nucl');

  /* ---------- the chromosomes of a working nucleus (steps 1, 2, 8 and 9): their territories ----------
     In the nucleus of step 2 (centre 170, 190; radii 150, 168): c the territory's centre, R its radius, n its folds, a the
     angle of the folds, m its fine wiggle; x, len, w the angle, length and width of the cross it coils into. The first two
     are the pair followed, chromosome 9 from the mother and from the father (100 units: about 3 µm in this 10 µm picture,
     the size it has again in step 11); the next two another pair; the rest grey. Each thread is long, its territory wide
     and the territories touch, so the nucleus is full of thread and coiling packs a long thread into a short cross, never
     a short thread into more (Daniel, 5 Nov 2026: "don't be afraid of increasing the size … otherwise it feels that when
     the chromosome coils, suddenly you get more DNA for free"): chromosome 9's thread is about 1,600 units, more than
     the 1,150 of thread one copy of its cross would make. */
  var TER = [
    { who: 'mum', c: [110, 120], R: 64, n: 15, a: 0, m: 1.6, x: 0, len: 100, w: 15, band: .9 },
    { who: 'dad', c: [236, 258], R: 64, n: 15, a: 35, m: 1.6, x: 28, len: 100, w: 15, band: .9 },
    { who: 'mum', c: [98, 262], R: 54, n: 12, a: -50, m: 1.6, x: -40, len: 56, w: 11 },
    { who: 'dad', c: [240, 126], R: 54, n: 12, a: 70, m: 1.6, x: 64, len: 56, w: 11 },
    { who: 'faint', c: [175, 58], R: 38, n: 8, a: 15, m: 1.4, x: 80, len: 44, w: 9 },
    { who: 'faint', c: [172, 188], R: 50, n: 10, a: -20, m: 1.4, x: -15, len: 56, w: 10 },
    { who: 'faint', c: [168, 322], R: 38, n: 8, a: 50, m: 1.4, x: 30, len: 46, w: 9 },
    { who: 'faint', c: [290, 190], R: 28, n: 6, a: 90, m: 1.4, x: 5, len: 32, w: 8 },
    { who: 'faint', c: [52, 186], R: 30, n: 6, a: 10, m: 1.4, x: -70, len: 34, w: 8 }
  ];
  /* more of the 46, in grey, in the room left: they may touch their neighbours, as real territories do */
  (function () {
    var R = K.rng(5);
    for (var tries = 0; tries < 1400 && TER.length < 24; tries++) {
      var r = 18 + R() * 14, c = [30 + R() * 280, 30 + R() * 320], ok = true;
      for (var k = 0; k < 12 && ok; k++) { var a = k * PI / 6, x = c[0] + r * Math.cos(a), y = c[1] + r * Math.sin(a); if (Math.pow((x - CX) / 140, 2) + Math.pow((y - CY) / 158, 2) > 1) ok = false; }
      TER.forEach(function (T) { if (dist(T.c, c) < (T.R + r) * .74) ok = false; });
      if (ok) TER.push({ who: 'faint', c: c, R: r, n: Math.max(4, Math.round(r / 4.4)), a: Math.round(R() * 180), m: 1.4, x: Math.round(R() * 180 - 90), len: Math.round(r * 1.2), w: 7 });
    }
  })();
  function nucleusFrame(t, kk, wd, bop) {
    var out = D.envelope(CX, CY, 150, 168, 18);
    TER.slice().reverse().forEach(function (T) { out += D.coiled(T, t * .5, kk, wd, T.band && bop > .01 ? { band: T.band, bandOp: bop } : null); });
    return out;
  }
  function along(P, f) {
    var L = [0]; for (var i = 1; i < P.length; i++) L.push(L[i - 1] + dist(P[i - 1], P[i]));
    var s = f * L[L.length - 1], j = 1; while (j < P.length - 1 && L[j] < s) j++;
    var u = (s - L[j - 1]) / Math.max(1e-6, L[j] - L[j - 1]); return [lerp(P[j - 1][0], P[j][0], u), lerp(P[j - 1][1], P[j][1], u)];
  }
  function threadAt(T, t) { return D.territory(T, t * .5); }

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
    var out = PANE + '<path class="cellb" data-e="170,190,136,124" d="' + D.poly(CELL) + ' Z"/>';
    RIBS.forEach(function (p) { out += '<circle class="zm__rib" cx="' + n1(p[0]) + '" cy="' + n1(p[1]) + '" r="2.2"/>'; });
    MITO.forEach(function (m) {
      out += '<g transform="translate(' + m[0] + ' ' + m[1] + ') rotate(' + m[2] + ')"><ellipse class="mito" cx="0" cy="0" rx="10" ry="5"/>' +
        '<path class="zm__cr" d="M-6 -3.6 L-6 1.6 M-2 3.6 L-2 -1.6 M2 -3.6 L2 1.6 M6 3.6 L6 -1.6"/></g>';
    });
    out += D.envelope(NU1[0], NU1[1], NU1[2], NU1[3], 10);
    out += '<g transform="translate(' + NU1[0] + ' ' + NU1[1] + ') scale(' + n1(1000 / Z1) / 1000 + ') translate(' + (-CX) + ' ' + (-CY) + ')">';
    TER.slice().reverse().forEach(function (T) { out += D.coiled(T, t * .5, -1, 2.4); });
    return out + '</g>';
  }
  function labels1() {
    var m = MITO[1], rb = RIBS.filter(function (p) { return p[0] > 250 && p[1] > 140 && p[1] < 200; })[0] || RIBS[0];
    return [{ id: 'mem', text: 'cell membrane', x: CELL[45][0], y: CELL[45][1], side: 'L' }, { id: 'cyt', text: 'cytoplasm', x: 80, y: 228, side: 'L' },
            { id: 'mit', text: 'a mitochondrion', x: m[0] - 6, y: m[1] + 2, side: 'L' }, { id: 'rib', text: 'ribosomes', x: rb[0], y: rb[1], side: 'R' },
            { id: 'nuc', text: 'nucleus', x: NU1[0] + NU1[2], y: NU1[1] - 10, side: 'R' }];
  }

  /* ---------- step 2: the nucleus of a working cell ---------- */
  function frame2(t) { return CYTO + nucleusFrame(t, -1, 1.3, 0); }
  function labels2(t) {
    var a = threadAt(TER[0], t)[0], b = threadAt(TER[1], t), g = threadAt(TER[8], t);
    return [{ id: 'm9', text: 'chromosome 9 from the mother: a long, very thin thread of DNA', x: a[0], y: a[1], side: 'L' },
            { id: 'oth', text: 'other chromosomes', x: g[g.length - 1][0], y: g[g.length - 1][1], side: 'L' },
            { id: 'f9', text: 'chromosome 9 from the father', x: b[b.length - 1][0], y: b[b.length - 1][1], side: 'R' },
            { id: 'mem', text: 'the nuclear membrane', x: CX + 150, y: CY - 30, side: 'R' }];
  }

  /* ---------- step 3: the thread enlarged, DNA wound round histones ---------- */
  /* five beads along the thread's line, a little up and down, the DNA between them short (about 20 base pairs) */
  var BEADS = [[22, 176, .30], [96, 206, -.26], [170, 176, .26], [244, 206, -.28], [318, 176, .24]];
  function chain(t) {
    /* still: a bead that swayed changed the length of the DNA beside it, and its base-pair marks seemed to slide */
    return D.beads(BEADS.map(function (b) { return { c: [b[0], b[1]], a: b[2] }; }), { inAt: [-14, 160], outAt: [W + 14, 204], w: W, bases: true });
  }
  function frame3(t) { return NUCL + chain(t).svg; }
  function linkerMid(t, i) { var P = chain(t).linker(i == null ? 1 : i), j = Math.floor(P.length / 2), a = P[j - 1], b = P[j + 1]; return { p: P[j], ang: Math.atan2(b[1] - a[1], b[0] - a[0]) }; }
  function labels3(t) {
    var c = chain(t), h = rot([-11, -13], BEADS[0][2]), w = c.wrapAt(1, 1.5 / 3.3).p, m = linkerMid(t, 2).p;
    return [{ id: 'his', text: 'proteins (IB: histones)', x: BEADS[0][0] + h[0], y: BEADS[0][1] + h[1], side: 'L' },
            { id: 'wnd', text: 'the DNA, wound almost twice round each', x: w[0], y: w[1], side: 'L' },
            { id: 'lnk', text: 'DNA between them', x: m[0], y: m[1], side: 'T' }];
  }

  /* ---------- step 4: a gene, a lit stretch of the string of beads (Daniel, 5 Nov 2026: "show a gene first while it's
     rounded up inside the histones. You highlight in yellow that section, and then you zoom in and you see the DNA") ----
     The view three times further away: step 3's five beads are beads 4–8 of a row of thirteen (in step 3's own units,
     drawn at a third), and the thread folds back below as a second row; the gene is beads 3–9, about 1,400 base pairs
     (about 200 a bead). */
  var G4 = [170, 120];
  function row(t, dy, j0) {
    var L = [], S3 = [.30, -.26, .26, -.28, .24];
    for (var i = 0; i < 13; i++) {
      var a = !j0 && i >= 4 && i <= 8 ? S3[i - 4] : (i % 2 ? -.27 : .27);
      L.push({ c: [CX + (i - 6) * 74, CY + dy + (i % 2 ? 16 : -14)], a: a });
    }
    return D.beads(L, { inAt: [CX - 6.5 * 74 - 40, CY + dy - 20], outAt: [CX + 6.5 * 74 + 40, CY + dy + 10], w: W, bases: true });
  }
  function toG4(p) { return [G4[0] + (p[0] - CX) / 3, G4[1] + (p[1] - CY) / 3]; }
  function hiK(t) { return seg(loc(3, t), TZ + .3, TZ + 1.5); }
  function frameGene(t) {
    var k = hiK(t), out = NUCL + '<g transform="translate(' + G4[0] + ' ' + G4[1] + ') scale(' + n1(1000 / 3) / 1000 + ') translate(' + (-CX) + ' ' + (-CY) + ')">';
    if (k > 0) out += '<g' + op(k) + '><rect class="dna__gene" x="' + (CX - 3 * 74 - 46) + '" y="' + (CY - 54) + '" width="' + (6 * 74 + 92) + '" height="112" rx="34"/></g>';
    return out + row(t, 0, 0).svg + row(t, 420, 20).svg + '</g>';
  }
  function geneLinker(t) {
    var P = row(t, 0, 0).linker(6), i = Math.floor(P.length / 2), a = P[i - 1], b = P[i + 1];
    return { p: toG4(P[i]), ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  }
  function labelsGene(t) {
    if (hiK(t) < .99) return [];
    var bead = toG4([CX + 5 * 74, CY + 420 + 16]), out = toG4([CX - 5 * 74, CY + 16]);
    return [{ id: 'gene', text: 'a gene: one length of the DNA', x: G4[0], y: G4[1] - 18, side: 'T' },
            { id: 'out', text: 'DNA outside this gene', x: out[0], y: out[1], side: 'L' },
            { id: 'his', text: 'DNA wound round proteins (IB: histones)', x: bead[0], y: bead[1], side: 'R' }];
  }

  /* ---------- steps 5–7: the DNA of the gene; replication ---------- */
  var HX = { y: CY, A: 40, P: 150 };
  /* the helix stands still in steps 5 to 7: turning, its crossings drifted along and the DNA seemed to slide */
  function hph() { return .3; }
  /* the enzymes where they work: helicase at the fork's tip, DNA polymerase on each old strand, `gap` behind the fork,
     at the growing end of its new strand (the final audit, G1-6) */
  var FORK = { D: 80, S: 95, gap: 40 };
  function forkX(t) {
    if (t < M[5]) return -999;
    if (t < M[6]) return lerp(-70, 175, ease(seg(loc(5, t), .6, 7.6)));
    return lerp(175, W + 120, ease(seg(loc(6, t), .4, 8.4)));
  }
  function dOf(x, Xf) { if (x >= Xf) return 0; var k = Math.min(1, (Xf - x) / FORK.S); return FORK.D * k * k * (3 - 2 * k); }
  /* the gene's yellow: all over the picture while it shows part of the gene, fading as replication begins */
  function geneK(t) { return t < M[4] ? 0 : t < M[5] ? 1 : t < M[6] ? 1 - seg(loc(5, t), 0, 1) : 0; }
  function helixFrame(t) {
    var Xf = forkX(t), gk = geneK(t), out = NUCL, yb = HX.y - HX.A - 14;
    if (gk > 0) out += '<g' + op(gk) + '><rect class="dna__gene" x="-3000" y="' + yb + '" width="' + (W + 6000) + '" height="' + (2 * HX.A + 28) + '"/></g>';
    /* the bases are drawn from the first moment of the zoom: they were already there, as the marks on the DNA of the beads */
    out += D.duplex({ x0: -14, x1: W + 14, y: HX.y, A: HX.A, P: HX.P, ph: hph(t), lit: 1, fork: Xf > -900 ? { x: Xf, D: FORK.D, S: FORK.S, gap: FORK.gap } : null });
    if (Xf > -40 && Xf < W + 60) {
      var xp = Xf - FORK.gap - 2, dp = dOf(xp, Xf);
      out += '<ellipse class="zm__enz" cx="' + n1(Xf + 8) + '" cy="' + HX.y + '" rx="16" ry="30"/>';
      out += '<ellipse class="zm__enz" cx="' + n1(xp) + '" cy="' + n1(HX.y - dp) + '" rx="15" ry="14"/><ellipse class="zm__enz" cx="' + n1(xp) + '" cy="' + n1(HX.y + dp) + '" rx="15" ry="14"/>';
    }
    return out;
  }
  function strandY(t, x, which) {
    var f = hph(t) + x * 2 * PI / HX.P, Xf = forkX(t), d = Xf > -900 ? dOf(x, Xf) : 0;
    return which === 'a' ? HX.y - d + HX.A * Math.sin(f) : which === 'na' ? HX.y - d + HX.A * Math.sin(f + 2.4) : which === 'nb' ? HX.y + d + HX.A * Math.sin(f) : HX.y + d + HX.A * Math.sin(f + 2.4);
  }
  function rungX(fromX) { for (var j = 0; j < 60; j++) { var x = 4 + j * HX.P / 10 - 14; if (x >= fromX) return x; } return fromX; }
  function basesItem(t) { var xb = rungX(312); return { id: 'bas', text: 'bases: A with T, C with G', x: xb, y: (strandY(t, xb, 'a') * 3 + strandY(t, xb, 'b')) / 4, side: 'R' }; }
  function labelsDNA(t) {
    var xm = rungX(166);
    return [{ id: 'dna', text: 'DNA: two strands twisted into a double helix', x: 20, y: strandY(t, 20, 'a'), side: 'L' }, basesItem(t),
            { id: 'bond', text: 'bonds between the bases hold the strands together', x: xm, y: (strandY(t, xm, 'a') + strandY(t, xm, 'b')) / 2, side: 'T' },
            { id: 'gene', text: 'part of the gene (yellow)', x: 250, y: HX.y + HX.A + 14, side: 'B' }];
  }
  function labels6(t) {
    if (loc(5, t) < 7.8) return [];
    var Xf = forkX(t), xp = Xf - FORK.gap - 2;
    return [{ id: 'hel', text: 'an enzyme separates the strands (IB: helicase)', x: Xf + 8, y: HX.y - 30, side: 'T' },
            { id: 'new', text: 'a new strand, made along each old one', x: 14, y: strandY(t, 14, 'na'), side: 'L' },
            { id: 'pol', text: 'an enzyme makes each new strand (IB: DNA polymerase)', x: xp - 15, y: HX.y + dOf(xp, Xf), side: 'L' },
            basesItem(t)];
  }
  function labels7(t) {
    if (loc(6, t) < 8.6) return [];
    return [{ id: 'one', text: 'one molecule of DNA', x: 14, y: strandY(t, 14, 'a'), side: 'L' },
            { id: 'two', text: 'an identical molecule', x: 14, y: strandY(t, 14, 'b'), side: 'L' },
            { id: 'each', text: 'each: one old strand (grey) and one new strand (violet)', x: 326, y: strandY(t, 326, 'nb'), side: 'R' }];
  }

  /* ---------- steps 8–9: back in the nucleus; the copies coil ---------- */
  var TZ8 = 7;
  function coilK(t) { return t < M[8] ? 0 : ease(seg(loc(8, t), .4, 9.4)); }
  function frameN(t) { return CYTO + nucleusFrame(t, coilK(t), 1.3, seg(loc(7, t), TZ8, TZ8 + 1.2)); }
  function labels8(t) {
    if (loc(7, t) < TZ8 + .2) return [];
    var a = threadAt(TER[0], t)[0], b = threadAt(TER[1], t), g = along(threadAt(TER[0], t), TER[0].band);
    return [{ id: 'm9', text: 'chromosome 9 from the mother: two identical threads, side by side', x: a[0], y: a[1] - 1.7, side: 'L' },
            { id: 'abo', text: 'the ABO gene (yellow): the same place on both threads', x: g[0], y: g[1], side: 'L' },
            { id: 'f9', text: 'chromosome 9 from the father: two identical threads too', x: b[b.length - 1][0], y: b[b.length - 1][1], side: 'R' }];
  }
  function labels9(t) {
    if (coilK(t) < .99) return [];
    var rd = D.crossRod(TER[0], 0), f = D.crossRod(TER[1], 1), cen = rd.cen, abo = D.rodAt(rd, .9);
    return [{ id: 'x', text: 'chromosome 9 from the mother: a cross of two identical copies', x: rd.top[0], y: rd.top[1], side: 'L' },
            { id: 'cen', text: 'the copies, joined at one point', x: cen[0], y: cen[1] - TER[0].w * .42, side: 'T' },
            { id: 'abo', text: 'the ABO gene, at the same place on both copies', x: abo[0] - TER[0].w * .45, y: abo[1], side: 'L' },
            { id: 'f9', text: 'chromosome 9 from the father, a cross too', x: f.bot[0], y: f.bot[1], side: 'R' }];
  }

  /* ---------- step 10: the end of the long arm of one copy, its DNA and proteins in loops, one loop the ABO gene ----------
     (Daniel, 5 Nov 2026: "when you zoom in inside one copy, you could actually highlight the gene, the blood group gene,
     and then when you go back … that's why you identify in simple diagrams the location of a gene in that section with
     that band"). The view is the copy's long arm at .93 of its length, its rounded end in the picture; the arm runs
     along AX10 (towards its end), as in step 9; the ABO gene (.9) is a short length of one loop, 40 units back from the
     middle. */
  var ARM = D.CROSS.arm, AX10 = [-Math.sin(ARM), Math.cos(ARM)], NX10 = [Math.cos(ARM), Math.sin(ARM)], F10 = .93, TIP = 196, GENE10 = -4;
  var LOOPS = (function () {
    var R = K.rng(29), out = [];
    for (var i = -30; i * 9 <= TIP - 22; i++) for (var sd = -1; sd <= 1; sd += 2) {
      /* near the end the loops fan round it, so the arm ends rounded */
      var sv = i * 9 + sd * 2.2 + (R() - .5) * 3, f = Math.max(0, Math.min(1, (sv - (TIP - 90)) / 90)), fan = f * f * (3 - 2 * f);
      out.push({ i: i, sd: sd, s: sv, len: (82 + R() * 30) * (1 - .4 * fan), wid: 7 + R() * 5, tilt: (R() - .5) * .45 + sd * fan * 1.25, back: R() < .4, gene: i === GENE10 && sd === 1 });
    }
    return out;
  })();
  function loopGeo(q) {
    var d = rot([NX10[0] * q.sd, NX10[1] * q.sd], q.tilt), b = [CX + AX10[0] * q.s, CY + AX10[1] * q.s];
    return { b: b, d: d, tip: [b[0] + d[0] * q.len, b[1] + d[1] * q.len] };
  }
  function frame10() {
    var back = '', front = '', beads = '', gene = '';
    LOOPS.forEach(function (q) {
      var g = loopGeo(q), b = g.b, d = g.d, Lq = q.len, w = q.wid, a = AX10;
      function P(u, v) { return [b[0] + d[0] * u + a[0] * v, b[1] + d[1] * u + a[1] * v]; }
      function s(p) { return n1(p[0]) + ' ' + n1(p[1]); }
      var c1 = [P(0, -2.5), P(Lq * .3, -w), P(Lq * .96, -w * .9), P(Lq, 0)], c2 = [P(Lq, 0), P(Lq * .96, w * .9), P(Lq * .3, w), P(0, 2.5)];
      var d0 = 'M' + s(c1[0]) + ' C' + s(c1[1]) + ' ' + s(c1[2]) + ' ' + s(c1[3]) + ' C' + s(c2[1]) + ' ' + s(c2[2]) + ' ' + s(c2[3]);
      var path = '<path class="zm__loop' + (q.back && !q.gene ? ' zm__loop--b' : '') + '" d="' + d0 + '"/>';
      if (q.back && !q.gene) { back += path; return; }
      front += path;
      /* the ABO gene: a short length of one loop (about 20,000 base pairs of a loop of about 80,000), round its far end
         (Daniel, 5 Nov 2026: "is what you have selected inside one copy … large enough to represent the gene?") */
      if (q.gene) {
        var G = []; for (var j = 0; j <= 8; j++) G.push(bez(c1, .74 + .26 * j / 8)); for (j = 1; j <= 8; j++) G.push(bez(c2, .26 * j / 8));
        gene = '<path class="zm__gene10" d="' + D.poly(G) + '"/>';
      }
      /* the beads of step 3 along each loop: the same DNA, wound round the same proteins */
      [c1, c2].forEach(function (c) { for (var k = 1; k < 9; k++) { var p = bez(c, k / 9); beads += '<circle class="zm__bead" cx="' + n1(p[0]) + '" cy="' + n1(p[1]) + '" r="2.3"/>'; } });
    });
    return NUCL + back + '<path class="zm__axis" d="M' + n1(CX - AX10[0] * 260) + ' ' + n1(CY - AX10[1] * 260) + ' L' + n1(CX + AX10[0] * (TIP - 40)) + ' ' + n1(CY + AX10[1] * (TIP - 40)) + '"/>' + front + gene + beads;
  }
  function bez(c, u) { var A = (1 - u) * (1 - u) * (1 - u), B = 3 * u * (1 - u) * (1 - u), C = 3 * u * u * (1 - u), E = u * u * u; return [A * c[0][0] + B * c[1][0] + C * c[2][0] + E * c[3][0], A * c[0][1] + B * c[1][1] + C * c[2][1] + E * c[3][1]]; }
  function loopAt(i, sd) { return LOOPS.filter(function (q) { return q.i === i && q.sd === sd; })[0]; }
  function labels10() {
    var l = loopGeo(loopAt(4, -1)).tip, g = loopGeo(loopAt(GENE10, 1)).tip, c = loopGeo(loopAt(-17, 1)).tip;
    return [{ id: 'cop', text: 'one copy (IB: a chromatid)', x: c[0], y: c[1], side: 'T' },
            { id: 'loop', text: 'its DNA and proteins, folded into loops', x: l[0], y: l[1], side: 'L' },
            { id: 'abo', text: 'the ABO gene: a short length of one loop', x: g[0], y: g[1], side: 'R' },
            { id: 'end', text: 'the end of the long arm', x: CX + AX10[0] * (TIP - 6), y: CY + AX10[1] * (TIP - 6), side: 'B' }];
  }

  /* ---------- step 11: the pair, and two alleles ---------- */
  /* chromosome 9, about 3 µm long (as in steps 8 and 9): the ABO gene near the end of its long arm (9q34), its allele
     printed on the band of both copies (17.4.15) */
  var C9 = { len: 230, w: 26, spread: .7, y: 190, band: .9 }, TH9 = 24 * C9.spread * PI / 180;
  function band(x, c, f) {
    var r = C9.w / 2, off = r * .55 + C9.spread * r * .15, l = ((f == null ? C9.band : f) - D.CROSS.cen) * C9.len, sg = c ? 1 : -1;
    return [x + sg * (off + l * Math.sin(TH9)), C9.y + (D.CROSS.cen - .5) * C9.len + l * Math.cos(TH9)];
  }
  function upArm(x, c, f) {
    var r = C9.w / 2, off = r * .55 + C9.spread * r * .15, l = D.CROSS.cen * C9.len * f, sg = c ? 1 : -1;
    return [x + sg * (off + l * Math.sin(TH9)), C9.y + (D.CROSS.cen - .5) * C9.len - l * Math.cos(TH9)];
  }
  function dadX(t) { return lerp(352, 244, ease(seg(loc(10, t), TZ + .4, TZ + 2.6))); }
  function frame11(t) {
    var k = seg(loc(10, t), TZ + .4, TZ + 2.6), out = NUCL;
    function one(x, who, al, o) {
      var s = D.chromo({ x: x, y: C9.y, len: C9.len, w: C9.w, who: who, copies: 2, spread: C9.spread, cen: D.CROSS.cen, bands: [C9.band], op: o });
      [0, 1].forEach(function (c) { var b = band(x, c); s += '<g' + op(o == null ? 1 : o) + '>' + D.allele(b[0], b[1] + 5, al, { cls: 'al--band' }) + '</g>'; });
      return s;
    }
    out += one(96, 'mum', 'Iᴬ');
    if (k > 0) out += one(dadX(t), 'dad', 'Iᵒ', k);
    return out;
  }
  function labels11(t) {
    if (seg(loc(10, t), TZ + .4, TZ + 2.6) < .99) return [];
    var a = upArm(96, 0, .92), bm = band(96, 0), f = upArm(dadX(t), 1, .92), bf = band(dadX(t), 1);
    return [{ id: 'm', text: 'chromosome 9 from the mother: two identical copies', x: a[0], y: a[1], side: 'L' },
            { id: 'a', text: 'the allele Iᴬ (blood group A), on both copies', x: bm[0] - 11, y: bm[1], side: 'L' },
            { id: 'f', text: 'chromosome 9 from the father', x: f[0], y: f[1], side: 'R' },
            { id: 'o', text: 'the allele Iᵒ (blood group O), on both copies', x: bf[0] + 11, y: bf[1], side: 'R' }];
  }

  /* ---------- step 12: two alleles, their bases (Daniel, 5 Nov 2026: "show a close-up look of the gene, and then show where
     some bases are different … and so you can start talking about genotype and phenotype") ----------
     The ABO gene's coding bases 250–264 (codons 84–88), from NCBI NM_020469.3 (the A allele, A1.01): Iᴬ as it is; the
     common Iᵒ (O01) the same with the G at 261 missing (c.261delG). Read in threes, every three after the gap differs
     and the protein stops early, so it does not work. The bands of the two chromosomes grow into the two rows; in Iᵒ the
     G drops out; then the groups of three, red where they differ */
  var SEQA = 'GTCCTCGTGGTGACC', NB = SEQA.length, GAP = 11, DX = 21, X0 = CX - (NB - 1) * DX / 2, Y1 = 140, Y2 = 238, BH9 = C9.len * .085;
  function slotX(i) { return X0 + i * DX; }
  function rowOf(y, from, k) {
    var cx = lerp(from[0], CX, k), cy = lerp(from[1], y, k), w = lerp(C9.w, slotX(NB - 1) - slotX(0) + 28, k), hh = lerp(BH9, 36, k);
    return '<rect class="dna__gene zm__row" x="' + n1(cx - w / 2) + '" y="' + n1(cy - hh / 2) + '" width="' + n1(w) + '" height="' + n1(hh) + '" rx="' + n1(lerp(2, 6, k)) + '"/>';
  }
  function tile(b, x, y, o, dy) {
    return '<g' + op(o) + '><rect class="pt__nb dna__fill--' + b + '" x="' + n1(x - 9) + '" y="' + n1(y - 12 + (dy || 0)) + '" width="18" height="24" rx="3"/>' +
      '<text class="pt__lt pt__lt--' + b + '" x="' + n1(x) + '" y="' + n1(y + (dy || 0) + .7) + '" font-size="14">' + b + '</text></g>';
  }
  function bracket(a, b, y, cls, open) {
    var x0 = slotX(a) - 9, x1 = slotX(b) + 9;
    return '<path class="zm__cod' + (cls ? ' ' + cls : '') + '" d="M' + n1(x0) + ' ' + n1(y + 5) + ' L' + n1(x0) + ' ' + n1(y) + ' L' + n1(x1) + ' ' + n1(y) + (open ? '' : ' L' + n1(x1) + ' ' + n1(y + 5)) + '"/>';
  }
  /* the groups of three: Iᴬ in step; Iᵒ the same until the gap, then shifted by one (the last one runs on) */
  var CODA = [[0, 2], [3, 5], [6, 8], [9, 11], [12, 14]];
  var CODO = [[0, 2], [3, 5], [6, 8], [9, 12], [13, 14]];
  function rows(u, tilesOp) {
    var out = '', ko = 1 - seg(u, 4.2, 5.4), kd = ease(seg(u, 4.2, 5.4));
    for (var i = 0; i < NB; i++) {
      var oa = tilesOp * seg(u, 2.2 + i * .045, 2.8 + i * .045);
      out += tile(SEQA[i], slotX(i), Y1, oa);
      out += i === GAP ? (ko > .02 ? tile(SEQA[i], slotX(i), Y2, oa * ko, 18 * kd) : '') : tile(SEQA[i], slotX(i), Y2, oa);
    }
    var kg = seg(u, 5, 5.6) * tilesOp;
    if (kg > .02) out += '<rect class="zm__gap" x="' + n1(slotX(GAP) - 9) + '" y="' + n1(Y2 - 12) + '" width="18" height="24" rx="3"' + op(kg) + '/>';
    var kb = seg(u, 5.8, 6.8) * tilesOp;
    if (kb > .02) {
      var br = '';
      CODA.forEach(function (c) { br += bracket(c[0], c[1], Y1 - 21); });
      CODO.forEach(function (c, j) { br += bracket(c[0], c[1], Y2 - 21, j >= 3 ? 'zm__cod--x' : '', j === CODO.length - 1); });
      out += '<g' + op(kb) + '>' + br + '</g>';
    }
    return out;
  }
  var BANDM = function () { return band(96, 0); }, BANDF = function () { return band(244, 1); };
  function frame12(t) {
    var u = loc(11, t), k = ease(seg(u, .4, 2.6)), out = NUCL;
    var o11 = 1 - seg(u, .8, 2.4);
    if (o11 > .02) out += '<g' + op(o11) + '>' + frame11(M[11] - .001) + '</g>';
    out += rowOf(Y1, BANDM(), k) + rowOf(Y2, BANDF(), k);
    return out + rows(u, 1);
  }
  function labels12(t) {
    var u = loc(11, t);
    if (u < 6.8) return [];
    return [{ id: 'a', text: 'Iᴬ, from the mother', x: slotX(0) - 14, y: Y1, side: 'L' },
            { id: 'o', text: 'Iᵒ, from the father', x: slotX(0) - 14, y: Y2, side: 'L' },
            { id: 'g', text: 'a G missing in Iᵒ', x: slotX(GAP), y: Y2 + 12, side: 'B' },
            { id: 't', text: 'read in threes: after the gap, every three differs', x: slotX(NB - 1) + 9, y: Y2 - 21, side: 'R' }];
  }
  /* ---------- step 13: genotype and phenotype: the rows go back into the bands of the pair ---------- */
  function cap(y, a, b, o) {
    return '<g' + op(o) + '><rect class="zm__cap" x="' + n1(CX - 128) + '" y="' + n1(y - 14) + '" width="256" height="28" rx="14"/>' +
      '<text class="zm__captxt" x="' + CX + '" y="' + n1(y + .5) + '"><tspan class="zm__capb">' + a + '</tspan> ' + b + '</text></g>';
  }
  function frame13(t) {
    /* the bases fade first, then the rows shrink back into the bands as the pair comes back */
    var u = loc(12, t), k = 1 - ease(seg(u, .8, 2.8)), out = NUCL;
    out += '<g' + op(seg(u, .9, 2.4)) + '>' + frame11(M[11] - .001) + '</g>';
    if (k > .02) out += rowOf(Y1, BANDM(), k) + rowOf(Y2, BANDF(), k);
    var ot = 1 - seg(u, 0, .9);
    if (ot > .02) out += rows(9, ot);
    var kc = seg(u, 3, 3.8);
    if (kc > .02) out += cap(330, 'genotype:', 'IᴬIᵒ', kc) + cap(362, 'phenotype:', 'blood group A', seg(u, 3.5, 4.3));
    return out;
  }
  function labels13(t) { return loc(12, t) < 2.8 ? [] : labels11(t); }

  var FR = [frame1, frame2, frame3, frameGene, helixFrame, helixFrame, helixFrame, frameN, frameN, frame10, frame11, frame12, frame13];
  var LB = [labels1, labels2, labels3, labelsGene, labelsDNA, labels6, labels7, labels8, labels9, labels10, labels11, labels12, labels13];
  /* how each step comes out of the one before. `in`: from the point F of the old picture, z times enlarged, turning so the
     part at F (at angle ang there) lies along the new picture; `out`: the old picture shrinking into the point F of the new
     one, where it lies at angle ang; tz its length (model seconds). null: the same picture goes on */
  var ZM = [null,
    { z: Z1, F: function () { return { p: [NU1[0], NU1[1]], ang: 0 }; } },
    { z: 40, F: function () { var m = D.territoryMid(TER[0], M[2] * .5); return { p: m.p, ang: m.ang }; } },
    { z: 3, out: true, F: function () { return { p: G4, ang: 0 }; } },
    { z: 28, F: function () { return geneLinker(M[4]); } },
    null, null,
    { z: 47, out: true, tz: TZ8, F: function () { var m = D.territoryMid(TER[0], M[7] * .5); return { p: m.p, ang: m.ang }; } },
    null,
    { z: 15.5, F: function () { return { p: D.rodAt(D.crossRod(TER[0], 0), F10), ang: 0 }; } },
    { z: 9.9, out: true, F: function () { return { p: band(96, 0, F10), ang: -(ARM - TH9) }; } },
    /* steps 12 and 13 carry their own way in: the bands grow into the rows of bases, and back */
    null, null];
  function grp(svg, P, a, s, Q, o) {
    return '<g' + op(o) + ' transform="translate(' + n1(P[0]) + ' ' + n1(P[1]) + ') rotate(' + n1(a * 180 / PI) + ') scale(' + Math.round(s * 10000) / 10000 + ') translate(' + n1(-Q[0]) + ' ' + n1(-Q[1]) + ')">' + svg + '</g>';
  }
  function scene(t) {
    var k = 0; for (var i = 0; i < STEPS.length; i++) if (t >= M[i] - 1e-6) k = i;
    var Z = ZM[k], e = Z ? ease(seg(t, M[k], M[k] + (Z.tz || TZ))) : 1, cur = FR[k](t);
    if (e >= 1) return { k: k, e: 1, svg: cur };
    var f = Z.F(), F = f.p, a = f.ang || 0, prev = FR[k - 1](M[k] - .001), P, svg;
    /* going out, the wider picture comes in early round the shrinking old one, so the part is seen to be in it */
    if (Z.out) { P = mix([CX, CY], F, e); svg = grp(cur, P, -a * (1 - e), Math.pow(Z.z, 1 - e), F, seg(e, .25, .65)) + grp(prev, P, a * e, Math.pow(Z.z, -e), [CX, CY], 1 - seg(e, .5, .88)); }
    /* going in, the old picture stays until its part has filled the view (so the beads slide out past the edges before
       the helix shows), and the new one comes in late */
    else { P = mix(F, [CX, CY], e); svg = grp(prev, P, -a * e, Math.pow(Z.z, e), F, 1 - seg(e, .62, .95)) + grp(cur, P, a * (1 - e), Math.pow(Z.z, e - 1), [CX, CY], seg(e, .55, .9)); }
    return { k: k, e: e, svg: svg };
  }

  /* the frame: WKit.frameOf's margins for the names beside the drawing, and a band above and below it for the names that
     stand over or under their part, each with one upright line (sides 'T' and 'B' of CircLearn.labels; the protein
     animation's frame, 5 Nov 2026) */
  function frameOf(svg, bg, model, clipRect, Dw, narrow) {
    var m = K.margins(narrow, 18, 18, 96, 96), ft = K.fitType(Dw, W, m[0], m[1], m[2], m[3], 14.5), f = ft.f;
    var bandH = narrow ? f * .72 * 2 + 8 : 3 * f * 1.18 + f * .6, pad = 10 + bandH;
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

  function zoom(spec) {
    var S = K.shell(spec, 'zm', 'From a cell to a gene', 'A body cell; its nucleus; one chromosome enlarged, its DNA wound round proteins; the DNA itself and its bases; a gene; the DNA replicated; the copied chromosomes coiling into crosses; one copy enlarged; the pair the gene is on, with its two alleles; the bases of the two alleles, one base missing in one; genotype and phenotype.',
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
      var items = sc.e > .95 ? LB[sc.k](t).map(function (q) { var p = lay.to(q.x, q.y); return { id: q.id, text: q.text, x: p[0], y: p[1], side: q.side, alts: [] }; }) : [];
      gLab.innerHTML = names(lay, items, narrow, key);
      S.pill('see', SEE[sc.k], 'ok'); S.pill('size', SIZE[sc.k], 'ok');
    }
    var sp = L.stepper({ steps: K.readerSteps(STEPS.map(function (s, i) { return { t: M[i], h: s.h, p: s.p }; }), R), end: R[R.length - 1], render: draw, flow: K.readerFlow(R, M) });
    /* under it only the key, drawn (Daniel, 5 Nov 2026: "I hate when you actually, below steps, provide so much text";
       "Why don't you show them instead of writing about them?") */
    return K.mount(S, sp, 'zm', [
      /* each name only in the steps whose picture shows its part (the steps from 0) */
      { key: [['mum', 'from the mother', [0, 1, 7, 8, 9, 10, 12]], ['dad', 'from the father', [0, 1, 7, 8, 10, 12]], ['other', 'other chromosomes', [0, 1, 7, 8]], ['mito', 'mitochondria', [0]],
              ['dna', 'DNA', [2, 3, 4, 5, 6]], ['hist', 'proteins (IB: histones)', [2, 3, 9]], ['dnagene', 'a gene', [3, 4, 9, 11]], ['gene', 'a gene', [7, 8, 10, 12]],
              ['bases', 'the four bases', [2, 4, 5, 6, 11], 'ATCG'], ['strand', 'a new strand', [5, 6]], ['enz', 'enzymes', [5]]] }
    ], function (Dw, nar) {
      narrow = nar;
      lay = frameOf(svg, bg, model, cr, Dw, nar);
    });
  }
  L.add('zoom', zoom);
})(window);
