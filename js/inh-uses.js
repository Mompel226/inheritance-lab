/* ============================================================
   inh-uses.js — "What mitosis is for" (station `uses`, 17.2.2, 17.2.5): the station's picture as five small stories that
   play in turn, in five strips. Daniel, 5 Nov 2026: "very lame diagrams that are very hard to follow, like the what mitosis
   is for"; the old picture was a hub of dots and arrows.
   Every cell is the lab's one cell, small: its nucleus (two membranes, pores) holds the same four chromosomes as thin
   lines, two pairs, the mother's orange and the father's blue (InhDraw.FOUR, with fewer folds), and when it divides they
   do what the mitosis animation shows, with the same drawing (InhDraw.coiled, veePair, uncoil): they coil into crosses,
   the membrane breaks into pieces, the crosses stand across the middle, their copies are pulled apart, the cell pinches in
   two and the lines come back in two new nuclei (the audit, 5 Nov 2026: one drawing everywhere).
     growth        a row of cells: every cell divides and every new cell grows to full size, so the row grows: 1, 2, 4,
                   8 cells (growth is a permanent increase in size; the cells of an early embryo do not grow between
                   divisions, so the embryo is the station's photograph, not this story)
     repair        a cut in a layer of cells: the cells at its two edges divide, and their new cells fill the gap
     replacement   a lining of cells on a layer of smaller cells: an old cell leaves the surface; the cell below its place
                   divides, and its new cell moves up into the place (repair closes a cut from its sides; this does not)
     asexual       a parent plant grows a runner along the ground; a cell at its tip divides (enlarged in a circle) and a
                   new plant grows there, the same as the parent (its cells made by mitosis): genetically identical
     stem cells    a stem cell divides: one daughter stays a stem cell (unspecialised; it divides again); the other becomes
                   specialised, first a red blood cell (its nucleus goes), then, after the next division, a white blood
                   cell. When the story starts again they leave into the blood
   Names: each story's on a part that never moves (the first cell of the row, the end cells of the layers, the parent
   plant, the stem cell), on the left; "a red blood cell: specialised" below the picture, only while it rests (film.pts,
   the figure view's hook; its card holds the film there). The white blood cell, a second kind of specialised cell, is in
   the key: two names below would not stand apart on a short screen, and a second column of names on the right would
   leave the five strips far smaller (the new plant's "genetically identical" is in the station's words).
   An opened story's card plays its story again and again.
   Reduced motion: every story at its end.
   THE BIOLOGY: each division keeps the chromosome number (the same four, two pairs, in each daughter); daughter cells are
   smaller than their parent until they grow; a red blood cell has no nucleus; a white blood cell's nucleus has lobes.
   ============================================================ */
(function (global) {
  'use strict';
  var D = global.InhDraw, F = global.InhFilms; if (!D || !F) return;
  var n1 = D.n1, mix = D.mix;
  function seg(t, a, b) { return t <= a ? 0 : t >= b ? 1 : (t - a) / (b - a); }
  function ease(k) { return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function op(v) { return v >= .999 ? '' : ' opacity="' + n1(Math.max(0, v) * 100) / 100 + '"'; }
  function grp(svg, o) { return o <= .02 ? '' : '<g' + op(o) + '>' + svg + '</g>'; }
  function nuc(cx, cy, r) { return { cx: cx, cy: cy, rx: r, ry: r }; }
  /* five strips, one above another, each name on the left at the start of its strip */
  var W = 370, H = 456;
  /* the stories, in turn: [part, start, end] (seconds) */
  var STORY = [['growth', 0, 13.4], ['repair', 13.4, 20.4], ['replace', 20.4, 27.9], ['asexual', 27.9, 35.9], ['stem', 35.9, 50.4]];
  var DUR = 50.4, RESET = .7;

  /* ---------- the lab's cell, small ----------
     the four chromosomes of InhDraw.FOUR in the same territories (fewer folds: the nucleus is a few pixels across), their
     crosses and genes in proportion to the nucleus */
  var FOURm = D.FOUR.map(function (q) { return Object.assign({}, q, { n: q.A ? 3 : 2, m: 0 }); });
  function sizes(rn) { return { LA: rn * .95, LB: rn * .56, w: Math.max(1.3, rn * .17), wd: Math.max(.55, rn * .07) }; }
  function terr(N, z) { return D.terr(FOURm, N, z); }
  /* a cell at rest: its outline, its nucleus and the nucleus's four thin lines; drawn once, then kept */
  /* the nuclear membrane breaks into NP pieces; at this size it is drawn without pores, which would read as a membrane
     already in pieces */
  var MEMO = {}, NP = 6;
  function cell(x, y, rx, ry, cls, o) {
    var key = [n1(x), n1(y), n1(rx), n1(ry), cls || ''].join(','), s = MEMO[key];
    if (s == null) {
      var rn = Math.min(rx, ry) * .5, z = sizes(rn);
      s = D.cell(x, y, rx, ry, cls) + D.envelope(x, y, rn, rn, 0);
      terr(nuc(x, y, rn), z).forEach(function (T) { s += D.coiled(T, 0, -1, z.wd, { band: T.band }); });
      MEMO[key] = s;
    }
    return grp(s, o == null ? 1 : o);
  }

  /* ---------- one cell dividing, small: the mitosis animation's own steps ----------
     o: { c: [x, y] the parent's centre, a, b: the daughters' centres on the line of division (x if horiz, else y),
          r0, ry0: the parent's radii, r1, ry1: each daughter's, horiz, k: 0…1, cls: the cells' class }.
     k 0–.2 the thin lines coil into crosses; .15–.42 the nuclear membrane breaks into pieces, which go; .22–.4 the crosses
     stand across the middle; .42–.62 their copies are pulled apart, one copy of each to each side; .55–1 the cell pinches
     in two; .64–.8 a nucleus forms round each set from pieces; .72–.95 the rods uncoil into thin lines */
  function divide(o) {
    var k = o.k, hz = !!o.horiz, ry0 = o.ry0 || o.r0, ry1 = o.ry1 || o.r1;
    var m = ease(seg(k, .55, 1)), pc = hz ? o.c[0] : o.c[1], cc = hz ? o.c[1] : o.c[0];
    var ca = lerp(pc, o.a, m), cb = lerp(pc, o.b, m), rx = lerp(o.r0, o.r1, m), ry = lerp(ry0, ry1, m);
    var out = D.pinch(cc, ca, cb, rx, ry, hz).svg;
    if (o.cls) out = out.replace(/class="cellb"/g, 'class="cellb ' + o.cls + '"');
    var rn = Math.min(o.r0, ry0) * .5, rn1 = Math.min(o.r1, ry1) * .5, z = sizes(rn), N0 = nuc(o.c[0], o.c[1], rn);
    /* the membrane in pieces, then gone (at this size, no vesicles: they would fill the nucleus) */
    var br = seg(k, .15, .3);
    out += br > 0 ? D.opening(N0.cx, N0.cy, rn, rn, NP, .45 * br, 1 - seg(k, .3, .42)) : D.envelope(N0.cx, N0.cy, rn, rn, 0);
    /* the daughters' places: the one nearer a or b's lower value takes copy 0 */
    var lo = Math.min(o.a, o.b), hi = Math.max(o.a, o.b), pl = lerp(pc, lo, m), ph = lerp(pc, hi, m);
    var NA = hz ? nuc(pl, cc, rn1) : nuc(cc, pl, rn1), NB = hz ? nuc(ph, cc, rn1) : nuc(cc, ph, rn1), nf = seg(k, .64, .8), na = seg(k, .64, .7);
    if (na > .02) [NA, NB].forEach(function (d) { out += nf < 1 ? D.opening(d.cx, d.cy, d.rx, d.ry, NP, .45 * (1 - nf), na) : D.envelope(d.cx, d.cy, d.rx, d.ry, 0); });
    var T0 = terr(N0, z), TA = terr(NA, z), TB = terr(NB, z), kk = ease(seg(k, 0, .2)), mid = ease(seg(k, .22, .4)), part = ease(seg(k, .42, .62)), un = seg(k, .72, .95);
    /* the line across the middle, in the order the territories lie, so no two paths cross (Am, Bm, Ad, Bd) */
    var SLOT = [0, 2, 1, 3], sp = Math.min(o.r0, ry0) * .42, xAng = hz ? 0 : 90, back = rn1 * .35;
    T0.forEach(function (T, i) {
      var off = (SLOT[i] - 1.5) * sp, Lc = hz ? [o.c[0], o.c[1] + off] : [o.c[0] + off, o.c[1]];
      if (k < .42) {
        var Tm = D.at(T, mix(T.c, Lc, mid), lerp(T.x, xAng, mid));
        /* the copy grows along each line first (no jump from one line to two), and no joining-point dot: at this size
           its ring would hide the cross; the short link between the two copies says they are one chromosome */
        out += D.coiled(T, 0, kk, z.wd, { band: T.band, cross: Tm, copy: seg(k, 0, .1), cen: false });
        return;
      }
      var Te = D.at(T, Lc, xAng), lane = (hz ? Lc[1] : Lc[0]) * .7 + cc * .3;
      var pA = hz ? [NA.cx - back, lane] : [lane, NA.cy - back], pB = hz ? [NB.cx + back, lane] : [lane, NB.cy + back];
      var V = D.veePair(T, Te, pA, pB, part, hz, 8);
      if (k < .72) out += D.coiled(T, 0, 1, z.wd, { band: T.band, rods: function (q) { return V[q]; }, split: true, cen: false });
      else out += D.uncoil(TA[i], 0, un, z.wd, V[0], { band: T.band, cen: false }) + D.uncoil(TB[i], 0, un, z.wd, V[1], { band: T.band, cen: false });
    });
    return out;
  }

  /* ---------- growth: a row of cells; each new cell grows to full size, so the row grows ----------
     the first cell stays where it is (its name stands on it); cell i divides into places 2i and 2i + 1 */
  var GR = { y: 50, x0: 74, dx: 28, r: 13, r1: 10 };
  function gx(i) { return GR.x0 + GR.dx * i; }
  function row(n, r, o) { var s = ''; for (var i = 0; i < n; i++) s += cell(gx(i), GR.y, r, r); return grp(s, o == null ? 1 : o); }
  var ROUNDS = [[.8, 3.8, 4.6], [5, 8, 8.8], [9.2, 12.2, 13]];
  function growth(u) {
    if (u < RESET) return row(8, GR.r, 1 - u / RESET) + row(1, GR.r, u / RESET);
    for (var q = 0; q < 3; q++) {
      var d = ROUNDS[q], n = Math.pow(2, q);
      if (u < d[0]) return row(n, GR.r);
      if (u < d[1]) { var out = ''; for (var i = 0; i < n; i++) out += divide({ c: [gx(i), GR.y], a: gx(2 * i), b: gx(2 * i + 1), r0: GR.r, r1: GR.r1, horiz: true, k: seg(u, d[0], d[1]) }); return out; }
      if (u < d[2] || q === 2) return row(2 * n, lerp(GR.r1, GR.r, ease(seg(u, d[1], d[2]))));
    }
    return row(8, GR.r);
  }

  /* ---------- repair of damaged tissues: a cut in a layer of cells closes ---------- */
  var RP = { y: 140, x: function (p) { return 185 + 32 * p; }, rx: 15, ry: 18 };
  function repair(u) {
    var out = '<path class="tissue" d="M66 ' + (RP.y + 21) + ' L304 ' + (RP.y + 21) + '"/>', fixed = [-3, -2, 1, 2, 3];
    var k = seg(u, 1.6, 4.9);
    if (u < RESET) {
      [-1, 0].forEach(function (p) { out += cell(RP.x(p), RP.y, RP.rx, RP.ry, null, 1 - u / RESET); });
      fixed.forEach(function (p) { out += cell(RP.x(p), RP.y, RP.rx, RP.ry); });
      return out;
    }
    [-3, 2, 3].forEach(function (p) { out += cell(RP.x(p), RP.y, RP.rx, RP.ry); });
    if (k <= 0) return out + cell(RP.x(-2), RP.y, RP.rx, RP.ry) + cell(RP.x(1), RP.y, RP.rx, RP.ry);
    if (k >= 1) { [-2, -1, 0, 1].forEach(function (p) { out += cell(RP.x(p), RP.y, RP.rx, RP.ry); }); return out; }
    /* the cells at the two edges of the cut divide; each new cell moves into the gap */
    out += divide({ c: [RP.x(-2), RP.y], a: RP.x(-2), b: RP.x(-1), r0: RP.rx, ry0: RP.ry, r1: RP.rx, ry1: RP.ry, horiz: true, k: k });
    out += divide({ c: [RP.x(1), RP.y], a: RP.x(1), b: RP.x(0), r0: RP.rx, ry0: RP.ry, r1: RP.rx, ry1: RP.ry, horiz: true, k: k });
    return out;
  }

  /* ---------- replacement of cells: an old cell leaves the lining; a cell of the layer below divides, and its new cell
     moves up into the place (not a cut closing from its sides, as in repair) ---------- */
  var RL = { y: 220, yb: 247, x: function (i) { return 105 + 32 * i; }, rx: 15, ry: 13, bx: 13, by: 10 };
  function replace(u) {
    var out = '<path class="tissue" d="M82 ' + (RL.yb + 13) + ' L288 ' + (RL.yb + 13) + '"/>';
    [0, 1, 2, 4, 5].forEach(function (i) { out += cell(RL.x(i), RL.yb, RL.bx, RL.by); });
    [0, 1, 2, 4, 5].forEach(function (i) { out += cell(RL.x(i), RL.y, RL.rx, RL.ry); });
    if (u < RESET) return out + cell(RL.x(3), RL.yb, RL.bx, RL.by) + cell(RL.x(3), RL.y, RL.rx, RL.ry, null, 1 - u / RESET) + cell(RL.x(3), RL.y, RL.rx, RL.ry, 'cellb--old', u / RESET);
    /* the old cell leaves the surface and dies */
    var go = ease(seg(u, .8, 2.6)), k = seg(u, 2.8, 5.8), gw = ease(seg(u, 5.8, 6.8));
    if (go < 1) out += cell(RL.x(3), RL.y - 34 * go, RL.rx, RL.ry, 'cellb--old', 1 - go);
    if (k <= 0) return out + cell(RL.x(3), RL.yb, RL.bx, RL.by);
    if (k < 1) return out + divide({ c: [RL.x(3), RL.yb], a: RL.yb, b: RL.y, r0: RL.bx, ry0: RL.by, r1: RL.bx, ry1: 11.5, horiz: false, k: k });
    /* the new cell grows to the size of the cells beside it */
    return out + cell(RL.x(3), RL.yb, RL.bx, lerp(11.5, RL.by, gw)) + cell(RL.x(3), RL.y, lerp(RL.bx, RL.rx, gw), lerp(11.5, RL.ry, gw));
  }

  /* ---------- asexual reproduction: a runner, and a new plant at its tip ---------- */
  var SOIL = 354, PX = 128, NX = 250, PS = 1.25;
  function plant(x, s) {
    if (s <= .02) return '';
    var y = SOIL, out = '';
    out += '<path class="root" d="M' + n1(x) + ' ' + y + ' L' + n1(x - 7 * s) + ' ' + n1(y + 14 * s) + ' M' + n1(x) + ' ' + y + ' L' + n1(x) + ' ' + n1(y + 17 * s) + ' M' + n1(x) + ' ' + y + ' L' + n1(x + 7 * s) + ' ' + n1(y + 13 * s) + '"/>';
    [[-14, -24, -40], [0, -34, 0], [14, -24, 40]].forEach(function (q) {
      out += '<path class="stalk" d="M' + n1(x) + ' ' + y + ' L' + n1(x + q[0] * .55 * s) + ' ' + n1(y + q[1] * .55 * s) + '"/>';
      out += '<ellipse class="leafs" cx="' + n1(x + q[0] * s) + '" cy="' + n1(y + q[1] * s) + '" rx="' + n1(11 * s) + '" ry="' + n1(6.5 * s) + '" transform="rotate(' + (q[0] === 0 ? -90 : q[2]) + ' ' + n1(x + q[0] * s) + ' ' + n1(y + q[1] * s) + ')"/>';
    });
    return out;
  }
  /* the enlarged cell at the runner's tip: big enough for the lab's own cell to be read */
  var ZC = [NX + 50, SOIL - 58], ZR = 25;
  function asexual(u) {
    var out = '<path class="soil" d="M76 ' + SOIL + ' L304 ' + SOIL + '"/>' + plant(PX, PS);
    if (u < RESET) return out + grp(runner(1) + plant(NX, PS), 1 - u / RESET);
    var g = ease(seg(u, .9, 3.6)), s = ease(seg(u, 3.4, 6.4)), wither = seg(u, 6.6, 7.6), mk = seg(u, 3.2, 6.2), zo = seg(u, 2.8, 3.2) * (1 - seg(u, 6.6, 7.2));
    /* enlarged: one cell at the runner's tip dividing by mitosis, as the new plant grows */
    if (zo > .02) {
      out += grp('<path class="zm__line" d="M' + n1(NX + 4) + ' ' + (SOIL - 8) + ' L' + n1(ZC[0] - 19) + ' ' + n1(ZC[1] + 16) + '"/><circle class="zm__box" cx="' + ZC[0] + '" cy="' + ZC[1] + '" r="' + ZR + '"/>' +
        divide({ c: ZC, a: ZC[0] - 8, b: ZC[0] + 8, r0: 15, r1: 8.5, ry0: 15, ry1: 12, horiz: true, k: mk }), zo);
    }
    return out + grp(runner(g), 1 - .6 * wither) + plant(NX, PS * s);
  }
  /* the runner: a stem along the ground from the parent towards the new plant, grown to the fraction g */
  function runner(g) {
    if (g <= .02) return '';
    var P = []; for (var i = 0; i <= 16; i++) { var f = i / 16 * g, x = lerp(PX + 4, NX, f); P.push([x, SOIL - 3 - 10 * Math.sin(Math.PI * f)]); }
    return '<path class="runner" d="' + D.poly(P) + '"/>';
  }

  /* ---------- stem cells: one daughter stays a stem cell; the other becomes specialised ----------
     the first (the red blood cell) goes further, so the second never passes over it */
  var SY = 428, SX = 110, SR = 20, RB = [290, SY], WB = [210, SY];
  function rbc(x, y, r, o) { return grp('<ellipse class="cellb cellb--rbc" cx="' + n1(x) + '" cy="' + n1(y) + '" rx="' + n1(r) + '" ry="' + n1(r) + '"/><ellipse class="rbc__in" cx="' + n1(x) + '" cy="' + n1(y) + '" rx="' + n1(r * .45) + '" ry="' + n1(r * .45) + '"/>', o); }
  function wbc(x, y, r, lobe, o) {
    var s = D.cell(x, y, r, r, 'cellb--wbc');
    if (lobe < .05) s += D.nucleus(x, y, r * .45, r * .45);
    else [[-.32, -.12], [0, .18], [.32, -.1]].forEach(function (q) { s += D.nucleus(x + q[0] * r * lobe, y + q[1] * r * lobe, r * lerp(.45, .24, lobe), r * lerp(.45, .24, lobe)); });
    return grp(s, o);
  }
  /* a daughter becoming specialised as it moves from x0 to its place p: kind 'rbc' (smaller, its nucleus goes, red) or
     'wbc' (its nucleus in lobes) */
  function becoming(kind, x0, p, k) {
    var e = ease(seg(k, 0, .6)), x = lerp(x0, p[0], e), y = lerp(SY, p[1], e), sp = ease(seg(k, .3, 1));
    var st = cell(x, y, 16, 16, 'cellb--stem', 1 - sp);
    if (kind === 'rbc') return st + rbc(x, y, lerp(16, 14, sp), sp);
    return st + wbc(x, y, lerp(16, 17, sp), sp, sp);
  }
  function stem(u) {
    var out = '';
    /* when the story starts again, the blood cells leave into the blood */
    if (u < RESET) { var l = ease(u / RESET); return cell(SX, SY, SR, SR, 'cellb--stem') + rbc(RB[0] + 50 * l, RB[1], 14, 1 - l) + wbc(WB[0] + 50 * l, WB[1], 17, 1, 1 - l); }
    var d1 = seg(u, .8, 3.8), s1 = seg(u, 3.8, 6.6), d2 = seg(u, 7, 10), s2 = seg(u, 10, 12.8);
    /* the stem cell: divides, grows back, divides again */
    if (d1 > 0 && d1 < 1) out += divide({ c: [SX, SY], a: SX, b: SX + 36, r0: SR, r1: 16, horiz: true, k: d1, cls: 'cellb--stem' });
    else if (d2 > 0 && d2 < 1) out += divide({ c: [SX, SY], a: SX, b: SX + 36, r0: SR, r1: 16, horiz: true, k: d2, cls: 'cellb--stem' });
    else { var r = d1 >= 1 && d2 <= 0 ? lerp(16, SR, ease(seg(u, 3.8, 5.2))) : d2 >= 1 ? lerp(16, SR, ease(seg(u, 10, 11.4))) : SR; out += cell(SX, SY, r, r, 'cellb--stem'); }
    /* the first daughter becomes a red blood cell, the second a white blood cell */
    if (d1 >= 1) out += s1 < 1 ? becoming('rbc', SX + 36, RB, s1) : rbc(RB[0], RB[1], 14, 1);
    if (d2 >= 1) out += s2 < 1 ? becoming('wbc', SX + 36, WB, s2) : wbc(WB[0], WB[1], 17, 1, 1);
    return out;
  }

  var DRAW = { growth: growth, repair: repair, replace: replace, asexual: asexual, stem: stem };
  /* each story's name on a part that never moves: inside the outline of the first cell, the end cells, a leaf of the
     parent plant, the stem cell (each still on it at its smallest) */
  var PTS = { growth: [GR.x0 - 8, GR.y, 'L'], repair: [n1(RP.x(-3) - RP.rx), RP.y, 'L'], replace: [n1(RL.x(0) - RL.rx), RL.y, 'L'],
              asexual: [n1(PX - 14 * PS - 6), n1(SOIL - 24 * PS + 5), 'L'], stem: [SX - 14, SY, 'L'] };
  /* named only while it rests, below the picture, by one upright line from its lowest edge */
  var EXTRA = { rbc: [RB[0], RB[1] + 12, 'B'] };
  function frame(s) {
    var pts = Object.assign({}, PTS), out = '';
    STORY.forEach(function (q) {
      var len = q[2] - q[1], mine = s >= q[1] && s < q[2], u = mine ? s - q[1] : len;
      out += DRAW[q[0]](u);
      if (q[0] === 'stem' && (!mine || u >= 6.6)) pts.rbc = EXTRA.rbc;
    });
    return { svg: out, pts: pts };
  }
  var loops = {};
  STORY.forEach(function (q) { loops[q[0]] = [q[1], q[2]]; });
  F.add('uses', {
    W: W, H: H, dur: DUR, still: DUR - .01, self: true, loops: loops, frame: function (s) { return frame(s); },
    /* the red blood cell's card holds the film where it rests */
    hold: { rbc: DUR - .2 },
    allPts: Object.assign({}, PTS, EXTRA),
    /* other points on a part, where its name may stand when names crowd on a narrow screen (they never move either) */
    alts: { repair: [[n1(RP.x(-3) - RP.rx * .7), RP.y + 10]], replace: [[n1(RL.x(0) - RL.bx), RL.yb]], growth: [[GR.x0 - 5, GR.y + 6]] },
    /* the light falls on a whole story, or on the cell named */
    spots: { growth: [172, GR.y, 116, 22], repair: [185, RP.y, 118, 28], replace: [185, 230, 100, 36], asexual: [190, SOIL - 16, 120, 44], stem: [200, SY, 112, 28],
             rbc: [RB[0], RB[1], 19, 19] }
  });
})(window);
