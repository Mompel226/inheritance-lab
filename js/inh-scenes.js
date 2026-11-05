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
   · mitosis   a film (js/inh-films.js): one cell of 4 chromosomes (2 pairs) gives two cells of 4, the same (17.2.1, 17.2.4).
   · meiosis   a film: one cell of 4 (2 pairs) gives four cells of 2: one chromosome of each pair (17.3.2).
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

  /* 1 · the nucleus, part of one chromosome, part of its DNA: three levels, one above another (5 Nov 2026, the final
     audit: drawn as the animation draws them). In the working cell each chromosome is a long thin thread in its own part of
     the nucleus (InhDraw.territory): two pairs coloured, others grey. The box is on the middle of one of the mother's
     threads; the panel below shows only part of that thread, so it runs off both edges; the DNA below is all one gene,
     which runs off both edges too (a gene is thousands of base pairs long), its bases paired A with T and C with G. */
  function gene() {
    var nu = { cx: 176, cy: 80, rx: 50, ry: 40 };
    var out = D.cell(150, 78, 128, 64) + D.nucleus(nu.cx, nu.cy, nu.rx, nu.ry);
    function line(P, who, w) { return '<path class="thr thr--' + who + '" d="' + D.poly(P) + '" stroke-width="' + w + '"/>'; }
    /* grey: some of the other chromosomes, in the room the four leave (never touching a territory) */
    [[0, 0, .14, 20], [-.8, 0, .14, 70], [.8, 0, .15, -60], [0, -.76, .15, 10], [0, .76, .14, -15]].forEach(function (g) {
      out += line(D.territory({ who: 'faint', c: [nu.cx + g[0] * nu.rx, nu.cy + g[1] * nu.ry], R: g[2] * Math.min(nu.rx, nu.ry), n: 3, a: g[3] }, 0), 'faint', 1.2);
    });
    var T = D.terr(D.FOUR, nu, { LA: 40, LB: 30, w: 4 });
    T.forEach(function (t) { out += line(D.territory(t, 0), t.who, 1.7); });
    var mid = D.territoryMid(T[0], 0).p, bx = [n1(mid[0] - 7), n1(mid[1] - 5)];
    out += '<rect class="zm__box" x="' + bx[0] + '" y="' + bx[1] + '" width="14" height="10" rx="2"/>';
    out += '<path class="zm__line" d="M' + bx[0] + ' ' + n1(mid[1] + 5) + ' L14 186 M' + n1(mid[0] + 7) + ' ' + n1(mid[1] + 5) + ' L286 186"/>';
    out += '<rect class="zm__pane" x="14" y="186" width="272" height="72" rx="10"/>';
    /* part of one chromosome: cut square at the panel's edges */
    out += thread([[14, 214], [54, 232], [96, 204], [138, 236], [180, 206], [222, 236], [262, 208], [286, 222]], 'mum', 9).replace('/>', ' style="stroke-linecap:butt"/>');
    out += '<rect class="zm__box" x="132" y="200" width="44" height="40" rx="3"/>';
    out += '<path class="zm__line" d="M132 240 L10 300 M176 240 L290 300"/>';
    out += '<rect class="zm__pane" x="10" y="300" width="280" height="96" rx="10"/>';
    out += '<rect class="dna__gene" x="10" y="319" width="280" height="58"/>';
    var DX = { x0: 12, x1: 288, y: 348, A: 22, P: 80, ph: .6, groove: 2.4, cls: 'gn__s', bcls: 'gn__b' };
    out += D.duplex(DX);
    var yA = function (x) { return DX.y + DX.A * Math.sin(DX.ph + x * 2 * Math.PI / DX.P); };
    return { w: 300, h: 404, svg: out,
      /* the gene from below, on the band's lower edge (it fills the panel's width, so no line from a side can reach it
         without crossing the DNA) */
      pts: { nucleus: [226, 80, 'R'], chromosome: [17, 215, 'L'], dna: [16, n1(yA(16)), 'L'], gene: [150, 375, 'B'] },
      alts: { nucleus: [[226, 80], [220, 96]] },
      spots: { nucleus: [176, 80, 52, 42], chromosome: [150, 221, 136, 24], dna: [150, 348, 138, 32], gene: [150, 348, 140, 34] } };
  }

  /* 1 · 12 · pair 9: the two chromosomes of a pair, the ABO gene at the same place on both, near the end of the long arm
     (9q34: band at .9), each allele printed on its band (Iᴬ, Iᵒ; 17.4.15) */
  function pair9(alleles) {
    var A = alleles || ['A', 'O'];
    var m = { x: 112, y: 150, len: 236, w: 30, who: 'mum', bands: [.9] }, f = { x: 188, y: 150, len: 236, w: 30, who: 'dad', bands: [.9] };
    var bm = D.bandAt(m, .9), bf = D.bandAt(f, .9);
    var out = D.chromo(m) + D.chromo(f) + D.allele(m.x, bm[1] + 5, 'I^' + A[0], { cls: 'al--band' }) + D.allele(f.x, bf[1] + 5, 'I^' + A[1].toLowerCase(), { cls: 'al--band' });
    return { w: 300, h: 300, svg: out,
      pts: { mum9: [m.x - 15, 70, 'L'], dad9: [f.x + 15, 70, 'R'], alleleA: [bm[0] - 15, bm[1], 'L'], alleleO: [bf[0] + 15, bf[1], 'R'] },
      alts: {}, tags: A,
      spots: { mum9: [m.x, m.y, 20, 120], dad9: [f.x, f.y, 20, 120], alleleA: [bm[0], bm[1], 20, 14], alleleO: [bf[0], bf[1], 20, 14] } };
  }

  /* 2 · the 23 pairs of a body cell about to divide, in a karyogram's order and groups (13–15 | 16–18, 19–20 | 21–22 |
     the sex pair), the two crosses of each pair a clear gap apart (5 Nov 2026, the final audit: overlapping, a pair read as
     one object). Pair 1 is named from above, pair 9 from below through the gap between groups, the sex pair from below. */
  var LEN = [248, 242, 198, 190, 181, 171, 159, 145, 138, 134, 135, 133, 114, 107, 102, 90, 83, 80, 59, 64, 47, 51];
  var KX = 600 / 520;
  var KROWS = [[[0, 52], [1, 156], [2, 260], [3, 364], [4, 468]],
               [[5, 37], [6, 111], [7, 186], [8, 260], [9, 334], [10, 409], [11, 483]],
               [[12, 40], [13, 120], [14, 200], [15, 320], [16, 400], [17, 480]],
               [[18, 40], [19, 120], [20, 320], [21, 400], ['sex', 480]]];
  /* a point ON the lower-left arm of a cross (InhDraw.chromo, copies 2), 2 units in from its end; up: the upper-left arm */
  function lowTip(o, up) {
    var r = o.w / 2, sp = o.spread, th = 24 * sp * Math.PI / 180, off = r * .55 + sp * r * .15, cen = o.cen == null ? .42 : o.cen, k = (up ? cen : 1 - cen) * o.len - 2;
    return [o.x - off - k * Math.sin(th), o.y + (cen - .5) * o.len + (up ? -k : k) * Math.cos(th)];
  }
  /* how far a cross reaches to each side of its centre line, and the offset of each cross from the pair's centre that
     leaves a clear gap between the two (about half a cross wide), so the pairs still stand further apart than their two */
  function reach(l, W, SP) { var r = W / 2; return r * .55 + SP * r * .15 + .58 * l * Math.sin(24 * SP * Math.PI / 180) + r; }
  function karyo(sex) {
    var out = '', pts = {}, spots = {}, mids = {}, S = .30, W = 6.5, SP = .7, y0 = [52, 136, 214, 284];
    KROWS.forEach(function (row, ri) {
      row.forEach(function (q) {
        var c = q[0], cx = q[1] * KX, base = y0[ri] + 40;
        if (c === 'sex') {
          var lx = 156 * S, ly = (sex === 'm' ? 57 : 156) * S, dS = reach(lx, W, SP) + 5;
          var X = { x: cx - dS, y: base - lx / 2, len: lx, w: W, who: 'mum', copies: 2, spread: SP };
          out += D.chromo(X);
          out += D.chromo({ x: cx + dS, y: base - ly / 2, len: ly, w: W, who: 'dad', copies: 2, spread: SP, cls: sex === 'm' ? 'chr--y' : '' });
          var tx = lowTip(X);
          pts.sex = [tx[0], tx[1], 'B']; mids.sex = cx;
          spots.sex = [cx, base - lx / 2, dS + 16, lx / 2 + 4];
          return;
        }
        /* chromosome 9: its joining point about .4 from the top, the ABO gene near the end of its long arm (9q34) */
        var l = LEN[c] * S, d = reach(l, W, SP) + 5, nine = c === 8;
        var mum = { x: cx - d, y: base - l / 2, len: l, w: W, who: 'mum', copies: 2, spread: SP, bands: nine ? [.9] : [], cen: nine ? .4 : null };
        out += D.chromo(mum);
        out += D.chromo({ x: cx + d, y: base - l / 2, len: l, w: W, who: 'dad', copies: 2, spread: SP, bands: nine ? [.9] : [], cen: nine ? .4 : null });
        /* a pair's light: both chromosomes, from the top of the longer to the line they stand on */
        if (c === 0) { var t1 = lowTip(mum, true); pts.pair1 = [t1[0], t1[1], 'T']; spots.pair1 = [cx, base - l / 2, d + 20, l / 2 + 4]; }
        if (nine) { var t9 = lowTip(mum); pts.pair9 = [t9[0], t9[1], 'B']; mids.pair9 = cx; spots.pair9 = [cx, base - l / 2, d + 18, l / 2 + 4]; }
      });
    });
    return { w: 600, h: 330, svg: out, pts: pts, alts: {}, spots: spots, mids: mids };
  }

  /* 3 · a cell making a protein: the gene in the nucleus; its copy, mRNA, a separate strand, leaving through a pore in
     the nuclear membrane; a ribosome in the cytoplasm, its large part above the mRNA, the chain of amino acids leaving it
     upwards, as in the animation (5 Nov 2026, the final audit: the mRNA had started on the gene and left through an unnamed
     gap). Names all round, none across a part: the pore from the left, the mRNA and the protein from above, the ribosome
     from the right, the gene and the free amino acids from below. */
  function protein() {
    var out = D.cell(180, 160, 170, 146);
    out += '<ellipse class="nucb" cx="118" cy="150" rx="78" ry="66"/>';
    out += '<rect class="pore" x="104" y="80" width="16" height="9" rx="3"/>';
    out += D.helix(58, 178, 168, 13, 2, .3, [.38, .72]);
    out += '<path class="mrna" d="M120 138 C118 118 112 102 112 86 C112 66 146 58 186 64 C220 70 238 104 252 110 L316 110"/>';
    out += '<g class="rib"><ellipse cx="274" cy="96" rx="24" ry="12"/><ellipse cx="276" cy="123" rx="20" ry="11"/></g>';
    out += '<path class="pchain" d="M272 84 L264 74 L274 64 L282 55 L272 46"/>';
    [['aa1', 264, 74], ['aa2', 274, 64], ['aa3', 282, 55], ['aa4', 272, 46]].forEach(function (q) { out += '<circle class="aa ' + q[0] + '" cx="' + q[1] + '" cy="' + q[2] + '" r="7"/>'; });
    [['aa2', 224, 230], ['aa3', 240, 252], ['aa1', 206, 262], ['aa4', 258, 230]].forEach(function (q) { out += '<circle class="aa ' + q[0] + '" cx="' + q[1] + '" cy="' + q[2] + '" r="7"/>'; });
    return { w: 360, h: 320, svg: out,
      pts: { nucleus: [40, 150, 'L'], gene: [124, 186, 'B'], mrna: [160, 61, 'T'], pore: [105, 84, 'L'], ribosome: [297, 96, 'R'], protein: [272, 40, 'T'], aminoacids: [206, 267, 'B'] },
      alts: {},
      spots: { nucleus: [118, 150, 80, 68], gene: [124, 168, 24, 18], mrna: [206, 90, 112, 40], pore: [112, 84.5, 12, 9],
               ribosome: [275, 109, 27, 26], protein: [273, 60, 16, 24], aminoacids: [232, 246, 34, 26] } };
  }

  /* 4 · the same genes in every cell; a cell expresses only some (5 Nov 2026, the final audit: drawn as a cell): the same
     cell and nucleus three times, with the same five genes on one chromosome (drawn on one to save space), every gene
     yellow. An expressed gene sends its copy, mRNA, out through a pore to where its protein works: amylase in vesicles,
     secreted from the cell; the glucose carrier in the cell membrane; the receptor in the membrane at a synapse; the
     enzyme of respiration in a mitochondrion, in every cell. The haemoglobin gene is in all three and expressed in none. */
  var GENES = ['amylase', 'carrier', 'receptor', 'haemo', 'resp'];
  function express(on) {
    on = (on || []).concat(['resp']);
    var out = '', pts = {}, spots = {}, CX = 190, CY = 210, RX = 165, RY = 195, NX = 120, NY = 210, NRX = 78, NRY = 172;
    function edge(y, cx, cy, rx, ry) { var k = (y - cy) / ry; return cx + rx * Math.sqrt(Math.max(0, 1 - k * k)); }
    out += D.cell(CX, CY, RX, RY) + '<ellipse class="nucb" cx="' + NX + '" cy="' + NY + '" rx="' + NRX + '" ry="' + NRY + '"/>';
    out += '<rect class="exg__dna" x="82" y="58" width="28" height="304" rx="14"/>';
    GENES.forEach(function (g, i) {
      var y = 72 + i * 60, gy = y + 16, lit = on.indexOf(g) >= 0;
      out += '<rect class="exg__gene is-on" x="82" y="' + y + '" width="28" height="32" rx="4"/>';
      pts[g] = [82, gy, 'L'];
      spots[g] = [96, gy, 20, 19];
      if (!lit) return;
      /* its mRNA: from the gene, out through a pore in the nuclear membrane, to where its protein works */
      var nx = edge(gy, NX, NY, NRX, NRY), cx = edge(gy, CX, CY, RX, RY);
      out += '<rect class="pore" x="' + n1(nx - 5) + '" y="' + (gy - 7) + '" width="10" height="14" rx="3"/>';
      var tx = g === 'resp' ? 236 : g === 'amylase' ? cx - 52 : cx - 24;
      out += '<path class="mrna exg__mrna" d="M114 ' + gy + ' C' + n1(nx - 20) + ' ' + (gy - 8) + ' ' + n1(nx + 20) + ' ' + (gy + 8) + ' ' + n1(tx) + ' ' + gy + '"/>';
      if (g === 'amylase') {
        [[cx - 36, gy - 4], [cx - 14, gy - 12]].forEach(function (v) { out += '<circle class="exg__ves" cx="' + n1(v[0]) + '" cy="' + n1(v[1]) + '" r="10"/>' +
          '<circle class="exg__prot" cx="' + n1(v[0] - 3) + '" cy="' + n1(v[1] - 2) + '" r="3"/><circle class="exg__prot" cx="' + n1(v[0] + 4) + '" cy="' + n1(v[1] + 3) + '" r="3"/>'; });
        [[cx + 14, gy - 20], [cx + 22, gy - 6], [cx + 12, gy + 6]].forEach(function (v) { out += '<circle class="exg__prot" cx="' + n1(v[0]) + '" cy="' + n1(v[1]) + '" r="3.4"/>'; });
      } else if (g === 'carrier') {
        out += '<rect class="exg__memp" x="' + n1(cx - 8) + '" y="' + (gy - 13) + '" width="16" height="26" rx="5"/><path class="exg__chan" d="M' + n1(cx) + ' ' + (gy - 9) + ' L' + n1(cx) + ' ' + (gy + 9) + '"/>';
      } else if (g === 'receptor') {
        out += '<path class="exg__rec" d="M' + n1(cx - 8) + ' ' + gy + ' L' + n1(cx + 6) + ' ' + gy + ' M' + n1(cx + 6) + ' ' + gy + ' L' + n1(cx + 14) + ' ' + (gy - 9) + ' M' + n1(cx + 6) + ' ' + gy + ' L' + n1(cx + 14) + ' ' + (gy + 9) + '"/>';
      } else {
        out += '<ellipse class="mito" cx="268" cy="' + gy + '" rx="28" ry="14"/><path class="exg__cris" d="M252 ' + (gy - 8) + ' Q256 ' + gy + ' 252 ' + (gy + 8) + ' M266 ' + (gy - 10) + ' Q270 ' + gy + ' 266 ' + (gy + 10) + ' M280 ' + (gy - 8) + ' Q284 ' + gy + ' 280 ' + (gy + 8) + '"/>' +
          '<circle class="exg__prot" cx="259" cy="' + (gy - 3) + '" r="3"/><circle class="exg__prot" cx="274" cy="' + (gy + 4) + '" r="3"/>';
      }
    });
    return { w: 380, h: 420, svg: out, pts: pts, alts: {}, spots: spots };
  }

  /* 5 · mitosis and 7 · meiosis: the station's picture is a film of the division (js/inh-films.js, the divisions session):
     the IGCSE step animation's own frames, without words. Each name stands only while its part is at rest */
  function mitosis() { return global.InhFilms ? global.InhFilms.scene('mitosis') : null; }
  function meiosis() { return global.InhFilms ? global.InhFilms.scene('meiosis') : null; }

  /* 8 · three genotypes of one gene: the two chromosomes of a pair, an allele at the same place on each; each name above
     its pair, its line down to a bracket over both chromosomes (a genotype belongs to the pair) */
  function bracket(x0, x1, y, down) { var e = down ? -6 : 6; return '<path class="brk" d="M' + n1(x0) + ' ' + n1(y + e) + ' L' + n1(x0) + ' ' + n1(y) + ' L' + n1(x1) + ' ' + n1(y) + ' L' + n1(x1) + ' ' + n1(y + e) + '"/>'; }
  function genotypes() {
    var out = '', pts = {};
    [['RR', 'R', 'R'], ['Rr', 'R', 'r'], ['rr', 'r', 'r']].forEach(function (g, i) {
      var x = 62 + i * 118;
      var a = { x: x - 16, y: 130, len: 150, w: 22, who: 'mum', bands: [.5] }, b = { x: x + 16, y: 130, len: 150, w: 22, who: 'dad', bands: [.5] };
      out += D.chromo(a) + D.chromo(b) + bracket(x - 27, x + 27, 44);
      out += D.allele(a.x, 136, g[1], { cls: 'al--on' }) + D.allele(b.x, 136, g[2], { cls: 'al--on' });
      pts[g[0]] = [x, 44.5, 'T'];
    });
    return { w: 360, y0: 34, h: 182, svg: out, pts: pts, alts: {},
      spots: { RR: [62, 125, 32, 82], Rr: [180, 125, 32, 82], rr: [298, 125, 32, 82] } };
  }

  /* 9 · the layout of a genetic diagram, its lines named, for a pupil to read from top to bottom: each offspring joined to
     one gamete of each parent (two lines into each), and the ratio as its last line (5 Nov 2026, the final audit) */
  function diagram(o) {
    o = o || { pp: ['round', 'round'], pg: ['Rr', 'Rr'], g: [['R', 'r'], ['R', 'r']], og: ['RR', 'Rr', 'Rr', 'rr'], op: ['round', 'round', 'round', 'wrinkled'], ratio: '3 round : 1 wrinkled' };
    var out = '', y = [36, 84, 132, 214, 262, 304];
    out += '<text class="gd__w" x="96" y="' + y[0] + '" text-anchor="middle">' + o.pp[0] + '</text><text class="gd__x" x="180" y="' + y[0] + '" text-anchor="middle">×</text><text class="gd__w" x="264" y="' + y[0] + '" text-anchor="middle">' + o.pp[1] + '</text>';
    out += D.allele(96, y[1], o.pg[0], { cls: 'gd__al' }) + '<text class="gd__x" x="180" y="' + y[1] + '" text-anchor="middle">×</text>' + D.allele(264, y[1], o.pg[1], { cls: 'gd__al' });
    var GX = [72, 120, 240, 288];
    [[GX[0], o.g[0][0]], [GX[1], o.g[0][1]], [GX[2], o.g[1][0]], [GX[3], o.g[1][1]]].forEach(function (q) {
      out += '<circle class="gd__gam" cx="' + q[0] + '" cy="' + (y[2] - 6) + '" r="17"/>' + D.allele(q[0], y[2], q[1], { cls: 'gd__al' });
    });
    /* offspring k: the first parent's gamete k >> 1 and the second parent's gamete k & 1 */
    var d = '';
    [0, 1, 2, 3].forEach(function (k) {
      var ox = 72 + k * 72, a = GX[k >> 1], b = GX[2 + (k & 1)];
      d += 'M' + a + ' 145 L' + (ox - 5) + ' 196 M' + b + ' 145 L' + (ox + 5) + ' 196 ';
    });
    out += '<path class="gd__fert" d="' + d.trim() + '"/>';
    o.og.forEach(function (g, i) { out += D.allele(72 + i * 72, y[3], g, { cls: 'gd__al' }); });
    o.op.forEach(function (p, i) { out += '<text class="gd__w gd__w--s" x="' + (72 + i * 72) + '" y="' + y[4] + '" text-anchor="middle">' + p + '</text>'; });
    out += '<text class="gd__w gd__ratio" x="180" y="' + y[5] + '" text-anchor="middle">' + o.ratio + '</text>';
    var rw = o.ratio.length * 4.3;
    return { w: 360, h: 318, svg: out,
      pts: { pp: [40, y[0] - 6, 'L'], pg: [60, y[1] - 6, 'L'], gam: [55, y[2] - 6, 'L'], og: [44, y[3] - 6, 'L'], op: [36, y[4] - 6, 'L'], ratio: [n1(180 - rw - 4), y[5] - 6, 'L'] }, alts: {},
      /* a whole line of the diagram, from its first word to its last */
      spots: { pp: [180, y[0] - 7, 128, 14], pg: [180, y[1] - 7, 118, 14], gam: [180, y[2] - 6, 132, 19], og: [180, y[3] - 7, 136, 14], op: [180, y[4] - 6, 146, 12], ratio: [180, y[5] - 6, rw + 12, 12] } };
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

  /* 12 · the four blood groups, each the pair of chromosome 9 with its two alleles printed on the ABO gene's band, near
     the end of the long arm (band .9); each name above its pair, its line down to a bracket over both */
  function abo() {
    var out = '', pts = {}, spots = {};
    [['A', 'IᴬIᴬ'], ['B', 'IᴮIᵒ'], ['AB', 'IᴬIᴮ'], ['O', 'IᵒIᵒ']].forEach(function (g, i) {
      var x = 50 + i * 92, al = global.Genes.parse(g[1]);
      var a = { x: x - 13, y: 120, len: 150, w: 20, who: 'mum', bands: [.9] }, b = { x: x + 13, y: 120, len: 150, w: 20, who: 'dad', bands: [.9] };
      out += D.chromo(a) + D.chromo(b) + bracket(x - 23, x + 23, 34);
      var ya = D.bandAt(a, .9)[1];
      out += D.allele(a.x, ya + 4.5, al[0].b + '^' + al[0].s, { cls: 'al--band al--tag' }) + D.allele(b.x, ya + 4.5, al[1].b + '^' + al[1].s, { cls: 'al--band al--tag' });
      pts['g' + g[0]] = [x, 34.5, 'T'];
      spots['g' + g[0]] = [x, 112, 30, 86];
    });
    return { w: 380, y0: 24, h: 182, svg: out, pts: pts, alts: {}, spots: spots };
  }

  /* 13 · the sex chromosomes: the colour-vision gene on the X, none on the Y. The woman and the man named below their
     pairs, each line up to a bracket under both chromosomes; the woman's gene from the left, the man's from the right
     (above the Y's top, so no line crosses a chromosome); the Y from the right, at its middle */
  function xy() {
    var out = '';
    var X1 = { x: 64, y: 150, len: 190, w: 28, who: 'mum', bands: [.12] }, X2 = { x: 104, y: 150, len: 190, w: 28, who: 'dad', bands: [.12] };
    var X3 = { x: 236, y: 150, len: 190, w: 28, who: 'mum', bands: [.12] }, Y = { x: 276, y: 192, len: 106, w: 28, who: 'dad', cls: 'chr--y' };
    out += D.chromo(X1) + D.chromo(X2) + D.chromo(X3) + D.chromo(Y) + bracket(X1.x - 14, X2.x + 14, 254, true) + bracket(X3.x - 14, Y.x + 14, 254, true);
    var g1 = D.bandAt(X1, .12), g3 = D.bandAt(X3, .12);
    return { w: 340, h: 262, svg: out,
      pts: { female: [(X1.x + X2.x) / 2, 253.5, 'B'], male: [(X3.x + Y.x) / 2, 253.5, 'B'], xgene: [g1[0] - 14, g1[1], 'L'], ygene: [Y.x + 14, Y.y, 'R'], xgene2: [g3[0] + 14, g3[1], 'R'] },
      alts: {},
      spots: { female: [84, 150, 38, 98], male: [256, 150, 38, 98], xgene: [g1[0], g1[1], 18, 12], xgene2: [g3[0], g3[1], 18, 12], ygene: [Y.x, Y.y, 17, 55] } };
  }

  /* 14 · three ways to write alleles: in each column two alleles, then genotypes (5 Nov 2026, the final audit: Iᵒ had stood
     in the codominant column and the Y in the alleles' row); each column named above it, its line down to its top edge */
  function write() {
    var out = '';
    out += '<rect class="wr__col" x="6" y="10" width="112" height="200" rx="12"/><rect class="wr__col" x="124" y="10" width="112" height="200" rx="12"/><rect class="wr__col" x="242" y="10" width="112" height="200" rx="12"/>';
    out += D.allele(62, 82, 'R', { size: 34 }) + D.allele(62, 134, 'r', { size: 34 }) + D.allele(62, 186, 'Rr', { size: 30 });
    out += D.allele(180, 82, 'Iᴬ', { size: 34 }) + D.allele(180, 134, 'Iᴮ', { size: 34 }) + D.allele(180, 186, 'IᴬIᴮ', { size: 28 });
    out += D.allele(298, 82, 'Xᴮ', { size: 34 }) + D.allele(298, 134, 'Xᵇ', { size: 34 }) + D.allele(270, 186, 'XᴮXᵇ', { size: 22 }) + D.allele(326, 186, 'XᵇY', { size: 22 });
    return { w: 360, h: 220, svg: out, pts: { dom: [62, 11.5, 'T'], codom: [180, 11.5, 'T'], sex: [298, 11.5, 'T'] }, alts: {},
      spots: { dom: [62, 110, 56, 100], codom: [180, 110, 56, 100], sex: [298, 110, 56, 100] } };
  }

  /* 6 · what mitosis is for: five small stories that play in turn (growth, repair, replacement, asexual reproduction, stem
     cells), each with the lab's one cell and a small copy of the one division (js/inh-uses.js, the divisions session) */
  function uses() { return global.InhFilms ? global.InhFilms.scene('uses') : null; }

  /* 1 · a line or a cross: a film (js/inh-films.js, the divisions session; agreed with the labels session, 5 Nov 2026) of
     the station's "A line or a cross?" animation, drawn the one way every division is: the mother's and the father's
     chromosome as long thin lines, copied, coiled into crosses, pulled apart, lines again in two new cells. It rests on the
     lines, on the crosses and on the two new cells, and names only what rests (line, cross, lines, lines2) */
  function linecross() { return global.InhFilms ? global.InhFilms.scene('linecross') : null; }

  var MAKE = {
    gene: gene, linecross: linecross, pair9: function () { return pair9(); }, karyoM: function () { return karyo('m'); }, karyoF: function () { return karyo('f'); },
    protein: protein,
    exPancreas: function () { return express(['amylase']); }, exNerve: function () { return express(['receptor']); }, exGut: function () { return express(['carrier']); },
    mitosis: mitosis, meiosis: meiosis, genotypes: genotypes, diagram: function () { return diagram(); },
    diagram11: function () { return diagram({ pp: ['round', 'wrinkled'], pg: ['Rr', 'rr'], g: [['R', 'r'], ['r', 'r']], og: ['Rr', 'Rr', 'rr', 'rr'], op: ['round', 'round', 'wrinkled', 'wrinkled'], ratio: '1 round : 1 wrinkled' }); },
    testRR: function () { return diagram({ pp: ['round', 'wrinkled'], pg: ['RR', 'rr'], g: [['R', 'R'], ['r', 'r']], og: ['Rr', 'Rr', 'Rr', 'Rr'], op: ['round', 'round', 'round', 'round'], ratio: 'all round' }); },
    testRr: function () { return diagram({ pp: ['round', 'wrinkled'], pg: ['Rr', 'rr'], g: [['R', 'r'], ['r', 'r']], og: ['Rr', 'Rr', 'rr', 'rr'], op: ['round', 'round', 'wrinkled', 'wrinkled'], ratio: '1 round : 1 wrinkled' }); },
    uses: uses, pedigree: function () { return pedigree(); }, abo: abo, xy: xy, write: write
  };
  var MEMO = {};
  global.LabScenes = {
    get: function (name) { if (!(name in MEMO)) MEMO[name] = MAKE[name] ? MAKE[name]() : null; return MEMO[name]; },
    FAM: FAM, pedigree: pedigree, thread: thread
  };
})(window);
