/* ============================================================
   inh-scenes.js — the stations' drawn pictures (js/views/figure.js draws a mode that names one as `draw`). Each scene is
   { w, h, svg, pts: { part: [x, y, side] }, alts, mids, x0?, y0? }: a point is ON its part, where the line of its name
   ends. Side 'L' or 'R': the name in a margin, its line level. Side 'T' or 'B' (5 Nov 2026, Daniel: labels "expanding
   across the whole image … put it at the top if you need it"): the name above or below the picture, its line upright,
   for a part that a level line could reach only across other parts; `mids` centres it over a pair while its line ends
   on one chromosome of the two. A line never crosses another part: each point below was chosen so that the straight
   path from it to its margin or band is clear (checked by the labels audit, every picture, every size).
   Only abstract things are drawn (chromosomes, genes, alleles, a nucleus, a family tree, a genetic diagram), each colour
   keyed under the picture by the station's view (`key`). Real cells, seeds and blood are photographs, never drawn.

   THE BIOLOGY, checked frame by frame (4 Nov 2026):
   · gene      a nucleus holds chromosomes as long threads (they are short and thick only while a cell divides); one
               chromosome is a long molecule of DNA; a gene is one length of it (17.1.1–2).
   · pair9     the ABO gene is on chromosome 9, near the end of its long arm (9q34); the two chromosomes of a pair, one
               from each parent, carry it at the same place, here with the allele for group A and the allele for O.
   · karyo     23 pairs in a human body cell, drawn as single threads in the order of a karyogram, each pair's two
               chromosomes the same length (their lengths in proportion to the real ones); a man XY, a woman XX.
   · protein   the gene stays in the nucleus; mRNA leaves through a pore; the ribosome is in the cytoplasm (17.1.8).
   · mitosis   one cell of 4 chromosomes (2 pairs) gives two cells of 4, the same chromosomes (17.2.1, 17.2.4).
   · meiosis   one cell of 4 (2 pairs) gives four cells of 2: one chromosome of each pair (17.3.2).
   · xy        the colour-vision gene is on the X chromosome only (Xq28); the Y is much shorter and has no copy.
   ============================================================ */
(function (global) {
  'use strict';
  var D = global.InhDraw; if (!D) return;
  var n1 = D.n1;

  /* a thread-like chromosome inside a nucleus: a smooth wavy path */
  function thread(pts, who, wdt) {
    var d = 'M' + n1(pts[0][0]) + ' ' + n1(pts[0][1]);
    for (var i = 1; i < pts.length; i++) {
      var p = pts[i - 1], q = pts[i], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      d += ' Q' + n1(p[0]) + ' ' + n1(p[1]) + ' ' + n1(mx) + ' ' + n1(my);
    }
    var last = pts[pts.length - 1]; d += ' T' + n1(last[0]) + ' ' + n1(last[1]);
    return '<path class="thr thr--' + who + '" d="' + d + '" stroke-width="' + (wdt || 3.2) + '"/>';
  }

  /* 1 · the nucleus, one chromosome, its DNA and a gene: three levels, one above another */
  function gene() {
    var out = '';
    out += D.cell(150, 78, 128, 64) + D.nucleus(176, 80, 50, 40);
    /* the four chromosomes as threads that never cross (InhDraw.threads) */
    out += D.threads(176, 82, .9, .85, 0, 3.2);
    /* the part enlarged: a box on one of them, and its lines down to the chromosome below */
    out += '<rect class="zm__box" x="146" y="80" width="28" height="20" rx="3"/>';
    out += '<path class="zm__line" d="M146 100 L26 186 M174 100 L274 186"/>';
    out += '<rect class="zm__pane" x="14" y="186" width="272" height="72" rx="10"/>';
    out += thread([[28, 222], [68, 204], [108, 236], [150, 206], [192, 238], [232, 208], [272, 222]], 'mum', 9);
    out += '<rect class="zm__box" x="132" y="200" width="44" height="40" rx="3"/>';
    out += '<path class="zm__line" d="M132 240 L18 300 M176 240 L282 300"/>';
    out += '<rect class="zm__pane" x="10" y="300" width="280" height="96" rx="10"/>';
    out += D.helix(22, 278, 348, 22, 3.2, .6, [.36, .66]);
    return { w: 300, h: 404, svg: out,
      /* the gene from below, at the lowest point of a strand inside it: from the right its line ran over the rest of
         the DNA */
      pts: { nucleus: [222, 64, 'R'], chromosome: [28, 222, 'L'], dna: [24, 352, 'L'], gene: [154.4, 368.5, 'B'] },
      alts: { nucleus: [[226, 80], [220, 96]] },
      spots: { nucleus: [176, 80, 52, 42], chromosome: [150, 221, 128, 24], dna: [150, 348, 132, 32], gene: [152, 348, 42, 32] } };
  }

  /* 1 · 12 · pair 9: the two chromosomes of a pair, the ABO gene at the same place on both */
  function pair9(alleles) {
    var A = alleles || ['A', 'O'];
    var m = { x: 112, y: 150, len: 236, w: 30, who: 'mum', bands: [.8] }, f = { x: 188, y: 150, len: 236, w: 30, who: 'dad', bands: [.8] };
    var out = D.chromo(m) + D.chromo(f);
    var bm = D.bandAt(m, .8), bf = D.bandAt(f, .8);
    return { w: 300, h: 300, svg: out,
      pts: { mum9: [m.x - 15, 70, 'L'], dad9: [f.x + 15, 70, 'R'], alleleA: [bm[0] - 15, bm[1], 'L'], alleleO: [bf[0] + 15, bf[1], 'R'] },
      alts: {}, tags: A,
      spots: { mum9: [m.x, m.y, 20, 120], dad9: [f.x, f.y, 20, 120], alleleA: [bm[0], bm[1], 20, 14], alleleO: [bf[0], bf[1], 20, 14] } };
  }

  /* 2 · the 23 pairs of a body cell, in a karyogram's order */
  var LEN = [248, 242, 198, 190, 181, 171, 159, 145, 138, 134, 135, 133, 114, 107, 102, 90, 83, 80, 59, 64, 47, 51];
  /* the rows of a karyogram in its groups, with a gap between groups (13–15 | 16–18, 19–20 | 21–22 | the sex pair): the
     gap under pair 9 is where the line of its name rises from the band below, clear of every other pair */
  var KROWS = [[[0, 52], [1, 156], [2, 260], [3, 364], [4, 468]],
               [[5, 37], [6, 111], [7, 186], [8, 260], [9, 334], [10, 409], [11, 483]],
               [[12, 40], [13, 120], [14, 200], [15, 320], [16, 400], [17, 480]],
               [[18, 40], [19, 120], [20, 320], [21, 400], ['sex', 480]]];
  /* the tip of the lower-left arm of a cross (InhDraw.chromo, copies 2): a point ON it, 2 units in from its end; up: the
     upper-left arm's */
  function lowTip(o, up) {
    var r = o.w / 2, sp = o.spread, th = 24 * sp * Math.PI / 180, off = r * .55 + sp * r * .15, cen = .42, k = (up ? cen : 1 - cen) * o.len - 2;
    return [o.x - off - k * Math.sin(th), o.y + (cen - .5) * o.len + (up ? -k : k) * Math.cos(th)];
  }
  function karyo(sex) {
    var out = '', pts = {}, spots = {}, mids = {}, alts = {}, S = .30, W = 6.5, SP = .7, y0 = [52, 136, 214, 284];
    KROWS.forEach(function (row, ri) {
      row.forEach(function (q) {
        var c = q[0], cx = q[1], base = y0[ri] + 40;
        if (c === 'sex') {
          var lx = 156 * S, ly = (sex === 'm' ? 57 : 156) * S;
          var X = { x: cx - 10, y: base - lx / 2, len: lx, w: W, who: 'mum', copies: 2, spread: SP };
          out += D.chromo(X);
          out += D.chromo({ x: cx + 10, y: base - ly / 2, len: ly, w: W, who: 'dad', copies: 2, spread: SP, cls: sex === 'm' ? 'chr--y' : '' });
          /* named from below, its line up to the X: from the right it bent past the end of the drawing */
          var tx = lowTip(X);
          pts.sex = [tx[0], tx[1], 'B']; mids.sex = cx;
          spots.sex = [cx, base - lx / 2, 24, lx / 2 + 4];
          return;
        }
        var l = LEN[c] * S, mum = { x: cx - 10, y: base - l / 2, len: l, w: W, who: 'mum', copies: 2, spread: SP, bands: c === 8 ? [.8] : [] };
        out += D.chromo(mum);
        out += D.chromo({ x: cx + 10, y: base - l / 2, len: l, w: W, who: 'dad', copies: 2, spread: SP, bands: c === 8 ? [.8] : [] });
        /* a pair's light: both chromosomes, from the top of the longer to the line they stand on */
        /* pair 1 from the left (nothing stands to its left); its lower arm too, for a phone whose name is tall */
        if (c === 0) { pts.pair1 = [cx - 14, base - l / 2 - 4, 'L']; alts.pair1 = [lowTip(mum), lowTip(mum, true)]; spots.pair1 = [cx, base - l / 2, 25, l / 2 + 4]; }
        /* pair 9 from below, its line up through the gaps between groups to the arm that carries the ABO gene: from the
           right it ran across pairs 10, 11 and 12 */
        if (c === 8) { var t9 = lowTip(mum); pts.pair9 = [t9[0], t9[1], 'B']; mids.pair9 = cx; spots.pair9 = [cx, base - l / 2, 25, l / 2 + 4]; }
      });
    });
    return { w: 520, h: 330, svg: out, pts: pts, alts: alts, spots: spots, mids: mids };
  }

  /* 3 · a cell making a protein: the gene in the nucleus, mRNA leaving through a pore, a ribosome in the cytoplasm */
  function protein() {
    var out = D.cell(180, 160, 170, 146);
    out += '<ellipse class="nucb" cx="118" cy="150" rx="78" ry="66"/>';
    /* two pores in the nucleus's membrane: gaps, drawn in the cytoplasm's colour */
    out += '<rect class="pore" x="190" y="124" width="9" height="16" rx="3"/><rect class="pore" x="104" y="80" width="16" height="9" rx="3"/>';
    out += D.helix(58, 178, 168, 13, 2, .3, [.38, .72]);
    /* mRNA: from the gene, out through the pore, to the ribosome */
    out += '<path class="mrna" d="M118 146 C150 140 170 132 194 132 C220 132 236 124 262 116 L322 104"/>';
    out += '<g class="rib"><ellipse cx="282" cy="104" rx="20" ry="13"/><ellipse cx="284" cy="124" rx="24" ry="13"/></g>';
    var aa = [['aa1', 268, 160], ['aa2', 282, 172], ['aa3', 294, 186], ['aa1', 300, 202], ['aa4', 296, 218]];
    aa.forEach(function (q) { out += '<circle class="aa ' + q[0] + '" cx="' + q[1] + '" cy="' + q[2] + '" r="7"/>'; });
    out += '<path class="pchain" d="M284 138 L268 160 L282 172 L294 186 L300 202 L296 218"/>';
    [['aa2', 224, 230], ['aa3', 240, 252], ['aa1', 206, 262], ['aa4', 258, 230]].forEach(function (q) { out += '<circle class="aa ' + q[0] + '" cx="' + q[1] + '" cy="' + q[2] + '" r="7"/>'; });
    return { w: 360, h: 320, svg: out,
      /* names all round, so none is left out and no line crosses a part (5 Nov 2026: from the sides the lines of the
         pore and the mRNA ran along the mRNA and over the ribosome, and three names found no row): the pore and the
         ribosome from above (the pore at the top of the nucleus, where no mRNA passes, so its line points at the gap
         alone), the gene and the free amino acids from below, the mRNA at its end beyond the ribosome */
      pts: { nucleus: [40, 150, 'L'], gene: [124, 186, 'B'], mrna: [318, 104.8, 'R'], pore: [112, 82, 'T'], ribosome: [282, 93, 'T'], protein: [300, 206, 'R'], aminoacids: [206, 267, 'B'] },
      alts: { protein: [[296, 218]] },
      spots: { nucleus: [118, 150, 80, 68], gene: [124, 168, 24, 18], mrna: [220, 125, 104, 14, -11.6], pore: [112, 84.5, 12, 9],
               ribosome: [283, 114, 26, 22], protein: [286, 182, 22, 44], aminoacids: [232, 246, 34, 26] } };
  }

  /* 4 · the same genes in every cell; a cell expresses only some: one length of DNA with four genes, lit where expressed */
  var GENES = [['amylase', 'the gene for amylase (an enzyme)'], ['carrier', 'the gene for a carrier protein in the membrane'], ['receptor', 'the gene for a receptor for a neurotransmitter'], ['haemo', 'the gene for haemoglobin']];
  function express(on) {
    var out = '', pts = {}, spots = {};
    out += '<rect class="exg__dna" x="40" y="40" width="40" height="300" rx="20"/>';
    GENES.forEach(function (g, i) {
      var y = 70 + i * 74, lit = (on || []).indexOf(g[0]) >= 0;
      out += '<rect class="exg__gene' + (lit ? ' is-on' : '') + '" x="40" y="' + y + '" width="40" height="34" rx="4"/>';
      /* its protein below the gene's line, never on it (5 Nov 2026: the line to the name ran through the protein) */
      if (lit) out += '<path class="exg__out" d="M86 ' + (y + 27) + ' L110 ' + (y + 40) + '"/><circle class="exg__prot" cx="122" cy="' + (y + 46) + '" r="9"/>';
      pts[g[0]] = [80, y + 17, 'R'];
      spots[g[0]] = [60, y + 17, 22, 19];
    });
    return { w: 160, h: 380, svg: out, pts: pts, alts: {}, spots: spots };
  }

  /* 5 · mitosis: one cell of 4 chromosomes, then two cells of 4 */
  /* the cells are working, so each chromosome is a long, thin line (Daniel, 4 Nov 2026: "when the cell is working, it's just
     a line"); a cross only while a cell divides, which the animation shows */
  function mitosis() {
    var out = D.cell(90, 150, 72, 64) + D.nucleus(90, 150, 42, 38) + D.threads(90, 155, .72, .85, 0, 2.6);
    out += '<path class="arr" d="M172 150 L222 150"/><path class="arrh" d="M222 143 L234 150 L222 157 Z"/>';
    [[320, 78], [320, 222]].forEach(function (p) {
      out += D.cell(p[0], p[1], 62, 54) + D.nucleus(p[0], p[1], 36, 32) + D.threads(p[0], p[1] + 4, .62, .72, 0, 2.4);
    });
    var s0 = D.threadStart(90, 155, .72, .85);
    return { w: 400, h: 300, svg: out,
      pts: { parent: [20, 150, 'L'], daughter: [382, 78, 'R'], daughter2: [382, 222, 'R'], chromosome: [s0[0], s0[1], 'L'] }, alts: {},
      spots: { parent: [90, 150, 72, 64], daughter: [320, 78, 62, 54], daughter2: [320, 222, 62, 54], chromosome: [77, 133, 18, 8] } };
  }

  /* 7 · meiosis: one cell of 4 (2 pairs), four cells of 2 (one of each pair) */
  function meiosis() {
    var out = D.cell(74, 160, 62, 58) + D.nucleus(74, 160, 38, 34) + D.threads(74, 164, .66, .76, 0, 2.4);
    out += '<path class="arr" d="M144 160 L190 160"/><path class="arrh" d="M190 153 L202 160 L190 167 Z"/>';
    var kids = [['mum', 'dad'], ['mum', 'dad'], ['dad', 'mum'], ['dad', 'mum']];
    kids.forEach(function (k, i) {
      var cx = 262 + (i % 2) * 92, cy = 92 + Math.floor(i / 2) * 136;
      out += D.cell(cx, cy, 40, 38) + D.nucleus(cx, cy, 24, 22);
      /* one of each pair, as long thin lines: the long one (pair A) and the short one (pair B) */
      out += thread([[cx - 15, cy - 6], [cx - 6, cy - 12], [cx + 4, cy - 5], [cx + 13, cy - 10]], k[0], 2.4) + thread([[cx - 9, cy + 9], [cx, cy + 4], [cx + 10, cy + 10]], k[1], 2.4);
    });
    return { w: 400, h: 320, svg: out, pts: { parent: [12, 160, 'L'], gamete: [394, 92, 'R'], gamete2: [394, 228, 'R'] }, alts: {},
      spots: { parent: [74, 160, 62, 58], gamete: [354, 92, 40, 38], gamete2: [354, 228, 40, 38] } };
  }

  /* 8 · three genotypes of one gene: the two chromosomes of a pair, an allele at the same place on each */
  function genotypes() {
    var out = '', pts = {};
    [['RR', 'R', 'R'], ['Rr', 'R', 'r'], ['rr', 'r', 'r']].forEach(function (g, i) {
      var x = 62 + i * 118;
      var a = { x: x - 16, y: 130, len: 150, w: 22, who: 'mum', bands: [.5] }, b = { x: x + 16, y: 130, len: 150, w: 22, who: 'dad', bands: [.5] };
      out += D.chromo(a) + D.chromo(b);
      out += D.allele(a.x, 136, g[1], { cls: 'al--on' }) + D.allele(b.x, 136, g[2], { cls: 'al--on' });
    });
    /* each name above its pair, its line down to the tip of the pair's first chromosome: from the sides the lines of
       Rr and rr ran across the other pairs and bent into each other (5 Nov 2026) */
    return { w: 360, y0: 44, h: 172, svg: out, pts: { RR: [46, 58, 'T'], Rr: [164, 58, 'T'], rr: [282, 58, 'T'] }, mids: { RR: 62, Rr: 180, rr: 298 }, alts: {},
      spots: { RR: [62, 130, 32, 76], Rr: [180, 130, 32, 76], rr: [298, 130, 32, 76] } };
  }

  /* 9 · the layout of a genetic diagram, its lines named, for a pupil to read from top to bottom */
  function diagram(o) {
    o = o || { pp: ['round', 'round'], pg: ['Rr', 'Rr'], g: [['R', 'r'], ['R', 'r']], og: ['RR', 'Rr', 'Rr', 'rr'], op: ['round', 'round', 'round', 'wrinkled'] };
    var out = '', y = [36, 84, 132, 214, 262];
    out += '<text class="gd__w" x="96" y="' + y[0] + '" text-anchor="middle">' + o.pp[0] + '</text><text class="gd__x" x="180" y="' + y[0] + '" text-anchor="middle">×</text><text class="gd__w" x="264" y="' + y[0] + '" text-anchor="middle">' + o.pp[1] + '</text>';
    out += D.allele(96, y[1], o.pg[0], { cls: 'gd__al' }) + '<text class="gd__x" x="180" y="' + y[1] + '" text-anchor="middle">×</text>' + D.allele(264, y[1], o.pg[1], { cls: 'gd__al' });
    [[72, o.g[0][0]], [120, o.g[0][1]], [240, o.g[1][0]], [288, o.g[1][1]]].forEach(function (q) {
      out += '<circle class="gd__gam" cx="' + q[0] + '" cy="' + (y[2] - 6) + '" r="17"/>' + D.allele(q[0], y[2], q[1], { cls: 'gd__al' });
    });
    out += '<path class="gd__fert" d="M72 156 L124 196 M120 156 L172 196 M240 156 L188 196 M288 156 L236 196"/>';
    o.og.forEach(function (g, i) { out += D.allele(72 + i * 72, y[3], g, { cls: 'gd__al' }); });
    o.op.forEach(function (p, i) { out += '<text class="gd__w gd__w--s" x="' + (72 + i * 72) + '" y="' + y[4] + '" text-anchor="middle">' + p + '</text>'; });
    return { w: 360, h: 290, svg: out,
      pts: { pp: [40, y[0] - 6, 'L'], pg: [60, y[1] - 6, 'L'], gam: [55, y[2] - 6, 'L'], og: [44, y[3] - 6, 'L'], op: [36, y[4] - 6, 'L'] }, alts: {},
      /* a whole line of the diagram, from its first word to its last */
      spots: { pp: [180, y[0] - 7, 128, 14], pg: [180, y[1] - 7, 118, 14], gam: [180, y[2] - 6, 132, 19], og: [180, y[3] - 7, 136, 14], op: [180, y[4] - 6, 146, 12] } };
  }

  /* 11 · a family over three generations: dry earwax (shaded), the recessive allele w; wet earwax, the dominant W.
     No couple in which both have wet earwax has a child with dry earwax: that is the frame of a private mock question
     (Daniel, 4 Nov 2026: "Redraw it"). Persons 2, 6 and 8 are ww; 3, 4, 5 and 7 must be Ww; person 1 may be WW or Ww. */
  var FAM = [
    { n: 1, x: 110, y: 40, sex: 'm', has: false }, { n: 2, x: 190, y: 40, sex: 'f', has: true },
    { n: 3, x: 60, y: 130, sex: 'm', has: false }, { n: 5, x: 130, y: 130, sex: 'm', has: false }, { n: 4, x: 200, y: 130, sex: 'f', has: false },
    { n: 6, x: 280, y: 130, sex: 'm', has: true },
    { n: 7, x: 215, y: 220, sex: 'f', has: false }, { n: 8, x: 265, y: 220, sex: 'm', has: true }
  ];
  function pedigree(lit) {
    var out = '', P = {}; FAM.forEach(function (p) { P[p.n] = p; });
    function mate(a, b) { out += '<path class="pd__l" d="M' + (P[a].x + 14) + ' ' + P[a].y + ' L' + (P[b].x - 14) + ' ' + P[b].y + '"/>'; }
    function kids(a, b, list) {
      /* the children's line well below the parents' numbers, so no number stands on it */
      var mx = (P[a].x + P[b].x) / 2, my = P[a].y, top = my + 42;
      var xs = list.map(function (k) { return P[k].x; });
      out += '<path class="pd__l" d="M' + mx + ' ' + my + ' L' + mx + ' ' + top + ' M' + Math.min.apply(null, xs.concat(mx)) + ' ' + top + ' L' + Math.max.apply(null, xs.concat(mx)) + ' ' + top + '"/>';
      list.forEach(function (k) { out += '<path class="pd__l" d="M' + P[k].x + ' ' + top + ' L' + P[k].x + ' ' + (P[k].y - 14) + '"/>'; });
    }
    mate(1, 2); kids(1, 2, [3, 5, 4]);
    mate(4, 6); kids(4, 6, [7, 8]);
    FAM.forEach(function (p) { out += D.person(p.x, p.y, p.sex, p.has, p.n, 14, lit === p.n); });
    var pts = {}; FAM.forEach(function (p) { pts['p' + p.n] = [p.x + (p.x > 180 ? 14 : -14), p.y, p.x > 180 ? 'R' : 'L']; });
    return { w: 340, h: 260, svg: out, pts: pts, alts: {} };
  }

  /* 12 · the four blood groups, each the pair of chromosome 9 with its two alleles */
  function abo() {
    var out = '', pts = {}, spots = {}, mids = {};
    [['A', 'IᴬIᴬ'], ['B', 'IᴮIᵒ'], ['AB', 'IᴬIᴮ'], ['O', 'IᵒIᵒ']].forEach(function (g, i) {
      var x = 50 + i * 92, al = global.Genes.parse(g[1]);
      var a = { x: x - 13, y: 120, len: 150, w: 20, who: 'mum', bands: [.8] }, b = { x: x + 13, y: 120, len: 150, w: 20, who: 'dad', bands: [.8] };
      out += D.chromo(a) + D.chromo(b);
      var ya = D.bandAt(a, .8)[1];
      out += D.allele(a.x, ya - 18, al[0].b + '^' + al[0].s, { cls: 'al--tag' }) + D.allele(b.x, ya - 18, al[1].b + '^' + al[1].s, { cls: 'al--tag' });
      /* each group's name above its pair, its line down to the tip of the first chromosome: from the sides four names
         at one height had lines lying on each other (5 Nov 2026) */
      pts['g' + g[0]] = [a.x, 48, 'T']; mids['g' + g[0]] = x;
      spots['g' + g[0]] = [x, 116, 30, 82];
    });
    return { w: 380, y0: 34, h: 172, svg: out, pts: pts, mids: mids, alts: {}, spots: spots };
  }

  /* 13 · the sex chromosomes: the colour-vision gene on the X, none on the Y */
  function xy() {
    var out = '';
    var X1 = { x: 64, y: 150, len: 190, w: 28, who: 'mum', bands: [.12] }, X2 = { x: 104, y: 150, len: 190, w: 28, who: 'dad', bands: [.12] };
    var X3 = { x: 236, y: 150, len: 190, w: 28, who: 'mum', bands: [.12] }, Y = { x: 276, y: 192, len: 106, w: 28, who: 'dad', cls: 'chr--y' };
    out += D.chromo(X1) + D.chromo(X2) + D.chromo(X3) + D.chromo(Y);
    var g1 = D.bandAt(X1, .12), g3 = D.bandAt(X3, .12);
    return { w: 340, h: 260, svg: out,
      /* the woman and the man named below their pairs; the woman's gene from the left, the man's from the right (above
         the Y's top, so no line crosses a chromosome: from the left it ran across both of the woman's X, 5 Nov 2026);
         the Y from the right, at its middle */
      pts: { female: [X1.x, 242, 'B'], male: [X3.x, 242, 'B'], xgene: [g1[0] - 14, g1[1], 'L'], ygene: [Y.x + 14, Y.y, 'R'], xgene2: [g3[0] + 14, g3[1], 'R'] },
      mids: { female: (X1.x + X2.x) / 2, male: (X3.x + Y.x) / 2 }, alts: {},
      spots: { female: [84, 150, 38, 98], male: [256, 150, 38, 98], xgene: [g1[0], g1[1], 18, 12], xgene2: [g3[0], g3[1], 18, 12], ygene: [Y.x, Y.y, 17, 55] } };
  }

  /* 14 · three ways to write alleles */
  function write() {
    var out = '';
    out += '<rect class="wr__col" x="6" y="10" width="112" height="200" rx="12"/><rect class="wr__col" x="124" y="10" width="112" height="200" rx="12"/><rect class="wr__col" x="242" y="10" width="112" height="200" rx="12"/>';
    out += D.allele(62, 82, 'R', { size: 34 }) + D.allele(62, 134, 'r', { size: 34 }) + D.allele(62, 186, 'Rr', { size: 30 });
    out += D.allele(180, 82, 'Iᴬ', { size: 34 }) + D.allele(180, 134, 'Iᵒ', { size: 34 }) + D.allele(180, 186, 'IᴬIᴮ', { size: 28 });
    out += D.allele(298, 82, 'Xᴮ', { size: 34 }) + D.allele(298, 134, 'Y', { size: 34 }) + D.allele(298, 186, 'XᵇY', { size: 28 });
    /* each column named above it, its line down to the column's top edge: from the right, the middle column's line ran
       across the third (5 Nov 2026) */
    return { w: 360, h: 220, svg: out, pts: { dom: [62, 11.5, 'T'], codom: [180, 11.5, 'T'], sex: [298, 11.5, 'T'] }, alts: {},
      spots: { dom: [62, 110, 56, 100], codom: [180, 110, 56, 100], sex: [298, 110, 56, 100] } };
  }

  /* 6 · what mitosis is for: a cell dividing, four arrows to its four uses (named on the picture), and a stem cell whose
     daughters are one stem cell and one specialised cell. Abstract: real photographs of the four uses go beside it. */
  function uses() {
    var out = '';
    out += D.cell(180, 96, 34, 30, 'cellb--div') + D.cell(228, 96, 34, 30, 'cellb--div');
    out += D.nucleus(180, 96, 13, 12) + D.nucleus(228, 96, 13, 12);
    [[150, 70, 70, 30], [258, 70, 338, 30], [150, 122, 70, 162], [258, 122, 338, 162]].forEach(function (q) {
      out += '<path class="arr" d="M' + q[0] + ' ' + q[1] + ' L' + q[2] + ' ' + q[3] + '"/>';
    });
    [[52, 22], [356, 22], [52, 172], [356, 172]].forEach(function (q) { out += '<circle class="use__dot" cx="' + q[0] + '" cy="' + q[1] + '" r="12"/>'; });
    /* the stem cell's line */
    out += D.cell(120, 262, 30, 28, 'cellb--stem') + D.nucleus(120, 262, 11, 10);
    out += '<path class="arr" d="M152 252 L214 232 M152 272 L214 292"/>';
    out += D.cell(244, 226, 26, 24, 'cellb--stem') + D.nucleus(244, 226, 9, 9);
    out += '<ellipse class="cellb cellb--spec" cx="246" cy="300" rx="34" ry="16"/>' + D.nucleus(232, 300, 7, 6);
    return { w: 410, h: 330, svg: out,
      pts: { growth: [40, 22, 'L'], repair: [368, 22, 'R'], replace: [40, 172, 'L'], asexual: [368, 172, 'R'], stem: [90, 262, 'L'] }, alts: {},
      /* a use: its dot and the arrow to it; the stem cells: the cell that divides and its two daughters */
      spots: { growth: [92, 40, 50, 28, 26], repair: [316, 40, 50, 28, -26], replace: [92, 155, 50, 28, -26], asexual: [316, 155, 50, 28, 26],
               stem: [185, 260, 96, 58] } };
  }

  /* 1 · a line or a cross: one chromosome in a working cell (a line), the same chromosome copied and about to divide (a
     cross), and its two copies separated (two lines). Top to bottom, so each name's line reaches its part alone. */
  function linecross() {
    var out = '';
    out += D.nucleus(110, 62, 92, 46) + thread([[44, 60], [70, 44], [100, 74], [130, 48], [160, 72], [180, 56]], 'mum', 3.2) +
           '<g opacity=".35">' + thread([[50, 84], [90, 94], [140, 86], [176, 76]], 'faint', 2.4) + thread([[60, 34], [100, 28], [150, 36], [176, 46]], 'faint', 2.4) + '</g>';
    out += '<path class="arr" d="M110 114 L110 142"/><path class="arrh" d="M103 140 L110 152 L117 140 Z"/>';
    out += D.chromo({ x: 110, y: 214, len: 96, w: 15, who: 'mum', copies: 2, bands: [.78] });
    out += '<path class="arr" d="M110 270 L110 296"/><path class="arrh" d="M103 294 L110 306 L117 294 Z"/>';
    out += D.chromo({ x: 78, y: 360, len: 84, w: 15, who: 'mum', bands: [.78] }) + D.chromo({ x: 142, y: 360, len: 84, w: 15, who: 'mum', bands: [.78] });
    return { w: 220, h: 410, svg: out,
      pts: { line: [44, 60, 'L'], cross: [134, 188, 'R'], lines: [62, 340, 'L'], lines2: [150, 340, 'R'] }, alts: {},
      spots: { line: [112, 59, 72, 20], cross: [110, 214, 32, 52], lines: [78, 360, 14, 46], lines2: [142, 360, 14, 46] } };
  }

  var MAKE = {
    gene: gene, linecross: linecross, pair9: function () { return pair9(); }, karyoM: function () { return karyo('m'); }, karyoF: function () { return karyo('f'); },
    protein: protein,
    exPancreas: function () { return express(['amylase']); }, exNerve: function () { return express(['receptor']); }, exGut: function () { return express(['carrier']); },
    mitosis: mitosis, meiosis: meiosis, genotypes: genotypes, diagram: function () { return diagram(); },
    diagram11: function () { return diagram({ pp: ['round', 'wrinkled'], pg: ['Rr', 'rr'], g: [['R', 'r'], ['r', 'r']], og: ['Rr', 'Rr', 'rr', 'rr'], op: ['round', 'round', 'wrinkled', 'wrinkled'] }); },
    testRR: function () { return diagram({ pp: ['round', 'wrinkled'], pg: ['RR', 'rr'], g: [['R', 'R'], ['r', 'r']], og: ['Rr', 'Rr', 'Rr', 'Rr'], op: ['round', 'round', 'round', 'round'] }); },
    testRr: function () { return diagram({ pp: ['round', 'wrinkled'], pg: ['Rr', 'rr'], g: [['R', 'r'], ['r', 'r']], og: ['Rr', 'Rr', 'rr', 'rr'], op: ['round', 'round', 'wrinkled', 'wrinkled'] }); },
    uses: uses, pedigree: function () { return pedigree(); }, abo: abo, xy: xy, write: write
  };
  var MEMO = {};
  global.LabScenes = {
    get: function (name) { if (!(name in MEMO)) MEMO[name] = MAKE[name] ? MAKE[name]() : null; return MEMO[name]; },
    FAM: FAM, pedigree: pedigree, thread: thread
  };
})(window);
