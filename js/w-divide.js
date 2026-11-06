/* ============================================================
   w-divide.js — the two nuclear divisions, step by step (stations `mitosis` and `meiosis`), and "A line or a cross?" (station
   `genes`). Each step waits for "Next step", with Play all beside it; the count of chromosomes is shown at every frame.
   The stations' pictures play the same frames as films (js/inh-films.js).

   ONE DRAWING EVERYWHERE (Daniel, 5 Nov 2026: "try to standardize what you're showing … do not confuse students with
   different animations that have different colors or different drawings"). Every chromosome is drawn by InhDraw.coiled,
   the look of "From a cell to a gene" (js/w-zoom.js): in a working cell a long, thin thread folded in its own part of the
   nucleus; copied along its whole length into two threads joined at one point; coiling, again and again, into the cross;
   pulled apart by its joining point into two single rods (a V while it moves); uncoiling into a thread in a new nucleus.
   Nothing jumps from one picture to the next: each shape grows out of the one before (his lessons on the zoom, 4–5 Nov).
   The nucleus has two membranes and pores (InhDraw.envelope); it breaks into pieces and new ones form from pieces
   (InhDraw.opening). Fibres (IB: the spindle) pull the chromosomes. A name stands only on a part at rest, on its own side
   of the picture.

   The cell drawn has 4 chromosomes: a long pair A and a short pair B, one of each pair from the mother (orange) and one
   from the father (blue), keyed; its gene the yellow length (A at .78, B at .85 of its length: by identity, never by the
   size it is drawn); the threads' lengths in the same proportion as the crosses' (A : B = 1.7). A human cell has 23 pairs;
   the pills say what happens to 46.

   mitosis (17.2.1, 17.2.3, 17.2.4)
     1 a working body cell: 4 chromosomes, long thin threads      2 each copied exactly along its length: two copies, joined
     3 the copies coil into crosses; the membrane of the nucleus breaks into pieces
     4 the chromosomes arranged across the middle; fibres from the two ends hold each one
     5 the fibres pull the two copies of each chromosome to opposite ends: single rods; 4 at each end
     6 two new nuclei form from pieces; the rods uncoil into threads      7 the cytoplasm divides: two identical cells of 4
   meiosis (17.3.1, 17.3.2, 16.2.3)
     1 a cell in a testis or an ovary, 2 pairs (diploid)   2 copied
     3 coiled into crosses; inside the whole nucleus the two of each pair lie side by side (as at the IB level)
     4 the membrane breaks; the pairs across the middle, held by fibres (which faces which end: chance)
     5 first division: the pairs separate, the cell divides: 2 cells of 2, one of each pair (haploid)
     6 second division: the copies separate: 4 cells of 2   7 four haploid cells, their chromosomes threads again; two
       kinds (in a testis all four become sperm cells; in an ovary one becomes an egg cell)
     8 fertilisation: one becomes a sperm cell and enters a much larger egg cell of another person (its chromosomes solid
       grey); the nuclei fuse: a zygote of 4, each pair one from each parent (diploid)
   The fibres grow only once the chromosomes stand in their places, so no fibre crosses another chromosome; each read-out
   (pill) changes when its event happens. An independent review (biologist and animation designer, 5 Nov 2026) is applied.
   a line or a cross? (Daniel, 5 Nov 2026: "how have we reached from the line to the cross? … show both … one comes from
   mom, one comes from dad"): ONE pair, the mother's and the father's of the same chromosome, through mitosis:
     1 two long thin lines   2 each copied along its length   3 each coils into a cross   4 across the middle
     5 the copies separate: single rods   6 two new cells, the rods uncoiled into lines, each cell with the pair
   THE BIOLOGY, every frame: the two copies of a chromosome are the same colour, length and gene; threads never cross (each
   in its own territory); the chromosomes of a pair come from different parents; the number is right at every frame
   (4 → 4 + 4; 4 → 2 + 2 → four cells of 2 → a zygote of 4). Stage names, chromatids, centromere and spindle are IB
   (D2.1.6–D2.1.11): named once, in brackets, as the IB word.
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, K = global.WKit, D = global.InhDraw; if (!L || !K || !D || !D.coiled) return;
  var n1 = K.n1, seg = K.seg, ease = K.ease, lerp = K.lerp, mix = D.mix, RAD = Math.PI / 180;

  /* ============================================================ the cell, the same in every division ============================================================ */
  /* the chromosomes' sizes: the long one's cross, the short one's, their width, a thread's width */
  var SZ = { LA: 66, LB: 39, w: 10, wd: 1.6 };
  /* the chromosomes' territories, crosses and genes: InhDraw.FOUR, TWO, terr (the same at the IB level) */
  var FOUR = D.FOUR, TWO = D.TWO, tmix = D.tmix, at = D.at, veePair = D.veePair;
  function terr(lay, nu, s) { return D.terr(lay, nu, s || SZ); }
  function nuc(cx, cy, rx, ry) { return { cx: cx, cy: cy, rx: rx, ry: ry }; }
  function chrom(T, ph, k, o, s) { return D.coiled(T, ph, k, (s || SZ).wd, Object.assign({ band: T.band, join: true }, o || {})); }
  /* points of a chromosome, for names */
  function thr(T, ph) { return D.resample(D.territory(T, ph), 300); }
  function leftOf(P) { return P.reduce(function (a, p) { return p[0] < a[0] ? p : a; }); }
  function rightOf(P) { return P.reduce(function (a, p) { return p[0] > a[0] ? p : a; }); }
  function ends(rods) { var P = []; rods.forEach(function (r) { P.push(r.top, r.bot); }); return P; }
  /* a point on a cross's plain colour, away from its gene band (a name ends there): the short arm, a sixth of the way */
  function plain(Tm, side) { var a = D.rodAt(D.crossRod(Tm, 0), .16), b = D.rodAt(D.crossRod(Tm, 1), .16); return side === 'R' ? (a[0] > b[0] ? a : b) : (a[0] < b[0] ? a : b); }
  /* the nucleus at a division and the new nuclei (InhDraw.nuclei, the same at the IB level) */
  function membranes(t, NU, tight, full, tm, horiz) { return D.nuclei(t, NU, tight, full, tm, horiz); }
  /* a copy on its own uncoiling into its thread (InhDraw.uncoil): no centromere dot at the IGCSE level */
  function unc(T, ph, u, V, s) { return D.uncoil(T, ph, u, (s || SZ).wd, V, { band: T.band, cen: false }); }
  /* ============================================================ a step widget ============================================================ */
  function widget(spec, cls, title, aria, STEPS, M, W, H, render, labelsAt, pills, notes, pillNames) {
    var S = K.shell(spec, cls, title, aria, pillNames || [['n', 'Chromosomes:'], ['hu', 'In a human:']]);
    var svg = S.svg, NSV = K.NS, uid = 'dv' + Math.random().toString(36).slice(2, 7);
    /* the drawing is clipped to its own window: a cell coming in from the side never shows in the names' margins */
    var defs = document.createElementNS(NSV, 'defs'), cp = document.createElementNS(NSV, 'clipPath'), cr = document.createElementNS(NSV, 'rect');
    cp.setAttribute('id', uid); cr.setAttribute('rx', 14); cp.appendChild(cr); defs.appendChild(cp); svg.appendChild(defs);
    var bg = document.createElementNS(NSV, 'rect'); bg.setAttribute('class', 'zm__bg'); svg.appendChild(bg);
    var model = document.createElementNS(NSV, 'g'); svg.appendChild(model);
    var gLab = document.createElementNS(NSV, 'g'); svg.appendChild(gLab);
    var lay = null, narrow = false, key = K.pinKey(S);
    var R = [0];
    STEPS.forEach(function (s, i) { var w = (s.h + ' ' + s.p).replace(/\*\*/g, '').split(/\s+/).length; R.push(R[i] + Math.max(M[i + 1] - M[i], w / 2)); });
    /* the motion runs 1.25 times faster than written (the kit's 1.6 made the membrane and fibres too quick to follow) */
    var P = 1.25, clock = K.readerClock(R, M, P);
    function draw(tt) {
      /* the threads lie still: they wriggled under their names (the audit, 6 Nov 2026; standard 13) */
      var t = clock(tt), ph = 3;
      model.innerHTML = '<g clip-path="url(#' + uid + ')">' + render(t, ph) + '</g>';
      var items = labelsAt(t, ph).map(function (q) { var p = lay.to(q.x, q.y); return { id: q.id, text: q.text, x: p[0], y: p[1], side: q.side }; });
      gLab.innerHTML = K.names(wrapIn(lay), items, narrow, key, null, 6);
      var pl = pills(t); S.pill('n', pl[0], 'ok'); S.pill('hu', pl[1], 'ok');
    }
    var sp = L.stepper({ steps: K.readerSteps(STEPS.map(function (s, i) { return { t: M[i], h: s.h, p: s.p }; }), R), end: R[R.length - 1], render: draw, flow: K.readerFlow(R, M, P) });
    return K.mount(S, sp, cls, notes, function (Dw, nar) {
      narrow = nar; var m = K.margins(nar, 15, 15, 90, 90);
      lay = K.frameOf(svg, bg, model, cr, { x0: 0, x1: W, y0: 0, y1: H }, false, Dw, m[0], m[1], m[2], m[3], 14.5);
    });
  }
  /* names only once the step's motion has ended: never on a part moving across the picture */
  function rest(t, a) { return t >= a; }
  /* names wrap a little inside their column: the kit counts a letter as .55 of the font, and words of wide letters
     ("one chromosome:", "centrosomes") ran a few pixels past the picture's edge at 1280–1440 (the audit, G2-13) */
  function wrapIn(lay) { return Object.assign({}, lay, { mL: lay.mL - 12, mR: lay.mR - 12 }); }


  /* ============================================================ mitosis ============================================================ */
  var MI = { W: 320, H: 480, NU: nuc(160, 236, 108, 112), PT: [160, 62], PB: [160, 418],
             /* the line across the middle in the order the territories lie, left to right (Am, Bm, Ad, Bd), so no two paths cross */
             EQ: [[74, 240], [198, 240], [136, 240], [258, 240]], AX: [110, 172, 140, 204], AY: [96, 384], D1: nuc(160, 140, 86, 74), D2: nuc(160, 340, 86, 74),
             /* each new nucleus first forms close round its set of chromosomes, then grows as they uncoil */
             TN: [nuc(157, 113, 70, 34), nuc(157, 367, 70, 34)] };
  var MI_STEPS = [
    { h: 'A working cell: lines', p: 'A body cell with **4 chromosomes**: 2 pairs, one of each pair from each parent. While the cell is working, each chromosome is **a single long, thin line** of DNA, folded in its own part of the nucleus. The yellow length is a **gene**.' },
    { h: 'Copied exactly', p: 'Before mitosis, **each chromosome is copied exactly**: a new copy is made along the whole line. This is the **exact replication** of the chromosomes. There are still 4 chromosomes, but each is now **two identical copies** (IB: chromatids), side by side, held together most firmly at **one point** (IB: the centromere).' },
    { h: 'Coiled: the cross', p: 'Each copy **coils**, again and again, until it is **short and thick**. Each chromosome is now the **X shape** you see in photographs: its two identical copies, joined. Then the **nuclear membrane** (the membrane round the nucleus) **breaks into pieces**.' },
    { h: 'Across the middle', p: 'The chromosomes are arranged **in a line across the middle** of the cell. **Fibres** (IB: spindle microtubules; together, the spindle) from the two ends of the cell hold each chromosome at its joining point.' },
    { h: 'The copies separate', p: 'The fibres pull the **two copies of each chromosome** to **opposite ends**, joining point first. Each copy is now a chromosome of its own: **a single rod**, not a cross. Each end receives one copy of **every** chromosome: 4.' },
    { h: 'Two new nuclei', p: 'The pieces move to the chromosomes at each end and join into a new **nuclear membrane**: two new nuclei. **Mitosis is nuclear division**: one nucleus becomes two. The chromosomes **uncoil** and become **long, thin lines** again.' },
    { h: 'Two daughter cells', p: 'The cytoplasm divides: **two daughter cells**. Each has the **same 4 chromosomes** as the parent cell, with the same genes: they are **genetically identical**. The **chromosome number is maintained**: 4 in each daughter cell, as in the parent cell.' }
  ];
  var MI_M = [0, 6, 13, 22, 30, 37, 45, 52];
  /* g collects where things are, for the names */
  function mitRender(t, ph, g) {
    g = g || {};
    var out = '', el = ease(seg(t, 30.4, 36)), cyk = ease(seg(t, 45.4, 51));
    var rx = lerp(134 - 6 * el, 128, cyk), ry = lerp(196 + 8 * el, 108, cyk);
    out += D.pinch(160, lerp(240, 128, cyk), lerp(240, 352, cyk), rx, ry, false).svg;
    var NU = MI.NU, mb = membranes(t, NU, MI.TN, [MI.D1, MI.D2], { brk: [19, 21.6], dim: [22.2, 23.4], gat: [37.4, 39.2], close: [39.2, 41], grow: [39.6, 44.4] }, false);
    out += mb.svg;
    var T0 = terr(FOUR, NU), T1 = terr(FOUR, mb.cur[0]), T2 = terr(FOUR, mb.cur[1]);
    var cp = ease(seg(t, 6.4, 12.4)), co = ease(seg(t, 13.4, 20.6)), mid = ease(seg(t, 22.6, 26.4));
    var part = ease(seg(t, 30.4, 36)), un = seg(t, 39.6, 44.4);
    var body = '', top = [], bot = [];
    g.T0 = T0; g.x = []; g.v = [];
    T0.forEach(function (T, i) {
      if (t < 6.4) body += chrom(T, ph, -1);
      else if (t < 13.4) body += chrom(T, ph, 0, { copy: cp });
      else if (t < 30.4) {
        var Tm = at(T, mix(T.c, MI.EQ[i], mid), lerp(T.x, 90, mid));
        body += chrom(T, ph, co, { cross: Tm });
        top.push(D.crossRod(Tm, 0).p0); bot.push(D.crossRod(Tm, 1).p0); g.x.push(Tm);
      } else {
        var V = veePair(T, at(T, MI.EQ[i], 90), [MI.AX[i], MI.AY[0]], [MI.AX[i], MI.AY[1]], part, false, 8, .07 * i);
        if (t < 39.6) body += chrom(T, ph, 1, { rods: function (c) { return V[c]; }, split: true, cen: t < 30.4 });
        else body += unc(T1[i], ph, un, V[0]) + unc(T2[i], ph, un, V[1]);
        top.push(V[0].p0); bot.push(V[1].p0); g.v.push(V);
      }
    });
    /* the fibres grow from the two ends once the chromosomes are in their line (so no fibre crosses another chromosome on
       its way), pull, and go */
    var fo = seg(t, 26.6, 27.2) * (1 - seg(t, 37.2, 38.4)), gr = ease(seg(t, 26.6, 28.6));
    if (fo > .02) {
      out += D.fibres(MI.PT, top.map(function (p) { return mix(MI.PT, p, gr); }), fo) + D.fibres(MI.PB, bot.map(function (p) { return mix(MI.PB, p, gr); }), fo);
      g.fib = top[3] ? mix(MI.PT, top[3], .45 * gr) : null;
    }
    g.T1 = T1; g.T2 = T2;
    return out + body;
  }
  function mitLabels(t, ph) {
    var g = {}; mitRender(t, ph, g);
    var T0 = g.T0, NU = MI.NU;
    if (t < 6) {
      var b = thr(T0[1], ph)[Math.round(.78 * 299)];
      return [{ id: 'ch', text: 'one chromosome: a long, thin line', x: leftOf(thr(T0[0], ph))[0], y: leftOf(thr(T0[0], ph))[1], side: 'L' },
              { id: 'nu', text: 'the nucleus', x: NU.cx + NU.rx * Math.cos(-.5), y: NU.cy + NU.ry * Math.sin(-.5), side: 'R' },
              { id: 'ge', text: 'a gene', x: b[0], y: b[1], side: 'R' }];
    }
    if (t < 13) {
      if (!rest(t, 12.4)) return [];
      var c3 = thr(T0[3], ph)[Math.round(D.CROSS.cen * 299)], l0 = leftOf(thr(T0[0], ph));
      return [{ id: 'cp', text: 'two identical copies, side by side', x: l0[0], y: l0[1], side: 'L' }];
    }
    if (t < 22) {
      if (!rest(t, 21.6)) return [];
      var xl = plain(T0[0], 'L'), pa = (.8 + 4) * 2 * Math.PI / 18;
      return [{ id: 'x', text: 'one chromosome: a cross of two identical copies', x: xl[0], y: xl[1], side: 'L' },
              { id: 'pc', text: 'the nuclear membrane, in pieces', x: NU.cx + NU.rx * 1.08 * Math.cos(pa - 2 * Math.PI / 18 * 4), y: NU.cy + NU.ry * 1.08 * Math.sin(pa - 2 * Math.PI / 18 * 4), side: 'R' }];
    }
    if (t < 30) {
      if (!rest(t, 28.6)) return [];
      var e0 = plain(g.x[0], 'L');
      var it = [{ id: 'eq', text: 'the chromosomes, in a line across the middle', x: e0[0], y: e0[1], side: 'L' }];
      if (g.fib) it.push({ id: 'fb', text: 'a fibre (IB: a spindle microtubule)', x: g.fib[0], y: g.fib[1], side: 'R' });
      return it;
    }
    if (t < 37) {
      if (!rest(t, 36)) return [];
      var u = g.v[3][0], d = g.v[3][1];
      return [{ id: 'up', text: 'one copy of each chromosome: a single rod', x: u.top[0], y: u.top[1], side: 'R' }, { id: 'dn', text: 'the other copy of each', x: d.top[0], y: d.top[1], side: 'R' }];
    }
    if (t < 45) {
      if (!rest(t, 44.4)) return [];
      return [{ id: 'n1', text: 'a new nucleus: 4\u00a0long, thin lines', x: MI.D1.cx + MI.D1.rx, y: MI.D1.cy, side: 'R' }, { id: 'n2', text: 'a new nucleus: the same\u00a04', x: MI.D2.cx + MI.D2.rx, y: MI.D2.cy, side: 'R' }];
    }
    if (!rest(t, 51)) return [];
    return [{ id: 'd1', text: 'a daughter cell: the same 4\u00a0chromosomes', x: 288, y: 128, side: 'R' }, { id: 'd2', text: 'a daughter cell: the same 4\u00a0chromosomes', x: 288, y: 352, side: 'R' }];
  }
  /* each read-out changes when its event happens (half-way through its motion), not when the step begins */
  function byTime(T, A, B, t) { var k = 0; for (var i = 1; i < T.length; i++) if (t >= T[i]) k = i; return [A[k], B[k]]; }
  function mitPills(t) {
    return byTime([0, 9.4, 33.2, 38.9, 48.2], ['4', '4, each two copies', '4 at each end', '4 in each new nucleus', '4 in each daughter cell'],
                  ['46', '46, each two copies', '46 at each end', '46 in each new nucleus', '46 in each daughter cell'], t);
  }
  /* under an animation only its key, drawn, each name only in the steps (from 0) whose picture shows its part; the
     read-outs above already say 4 of 46 (Daniel, 5 Nov 2026: "I hate when you actually, below steps, provide so much
     text"; "Why don't you show them instead of writing about them?"; "make sure that the keys appear when the things are
     in the images") */
  var KEY = [['mum', 'from the mother'], ['dad', 'from the father'], ['gene', 'a gene']];
  function mitosis(spec) {
    return widget(spec, 'dv', 'Mitosis, step by step', 'A body cell with four chromosomes copies them, they coil into crosses, fibres pull the copies apart, and two daughter cells each receive the same four.',
      MI_STEPS, MI_M, MI.W, MI.H, mitRender, mitLabels, mitPills, [
        { key: KEY.concat([['fibre', 'fibres', [3, 4]], ['vesicle', 'pieces of the nuclear membrane', [2, 3, 4]]]) }
      ]);
  }
  /* the IGCSE · IB switch (Daniel, 4 Nov 2026), as the Immunity Lab's first meeting: one level shown at a time; the IB one
     is built the first time it is asked for (js/w-divide-ib.js) */
  function levels(spec, igcse, ib, what) {
    var box = document.createElement('div'); box.className = 'lvw';
    var bar = document.createElement('div'); bar.className = 'lvw__bar'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Which level of detail');
    var bI = document.createElement('button'), bB = document.createElement('button');
    bI.type = bB.type = 'button'; bI.className = bB.className = 'lvw__b';
    bI.innerHTML = 'IGCSE: what you need'; bB.innerHTML = '<span class="sup sup--ext">IB</span> ' + what + ' in detail';
    bI.setAttribute('aria-pressed', 'true'); bB.setAttribute('aria-pressed', 'false');
    bar.appendChild(bI); bar.appendChild(bB); box.appendChild(bar);
    var a = igcse(spec), b = null, cur = a;
    box.appendChild(a);
    function show(which) {
      if (which === 'ib' && !b) { b = ib(spec); box.appendChild(b); }
      cur = which === 'ib' ? b : a;
      a.hidden = cur !== a; if (b) b.hidden = cur !== b;
      bI.setAttribute('aria-pressed', cur === a ? 'true' : 'false'); bB.setAttribute('aria-pressed', cur === b ? 'true' : 'false');
      if (cur.__onMove) cur.__onMove();
    }
    bI.addEventListener('click', function () { show('igcse'); });
    bB.addEventListener('click', function () { show('ib'); });
    box.__level = show;
    box.__seek = function (t) { return cur.__seek(t); };
    box.__onMove = function () { if (cur.__onMove) cur.__onMove(); };
    box.__onReset = function () { if (a.__onReset) a.__onReset(); if (b && b.__onReset) b.__onReset(); };
    return box;
  }
  L.add('mitosis', function (spec) { return levels(spec, mitosis, global.InhDivideIB.mitosis, 'Mitosis'); });

  /* ============================================================ meiosis ============================================================ */
  var ME = { W: 320, H: 500, NU: nuc(160, 246, 108, 112), PT: [160, 72], PB: [160, 428], YC: [134, 366], XC: [92, 228],
             /* inside the whole nucleus, each pair side by side (prophase I: Am above Ad, pair A; Bd above Bm, pair B), then the
                pairs across the middle (metaphase I); which faces which end is chance */
             BIV: [[112, 214], [112, 258], [212, 258], [212, 214]], PAIR: [[100, 226], [100, 274], [216, 268], [216, 232]], UP: [true, false, false, true],
             /* Ad and Bm cross the nucleus to their partners: one passes above the other */
             BOW: [0, -20, 34, 0] };
  var ME_STEPS = [
    { h: 'A cell that makes gametes', p: 'A cell in a **testis** or an **ovary**, with **4 chromosomes**: 2 pairs, one of each pair from each parent. Its nucleus is **diploid**: it has two sets of chromosomes, one set from each parent. Each chromosome is a long, thin line.' },
    { h: 'Copied', p: 'Each chromosome is **copied exactly**, along its whole length (exact replication): two identical copies (IB: sister chromatids), side by side, held together most firmly at **one point** (IB: the centromere).' },
    { h: 'Short and thick, in pairs', p: 'The copies **coil** until each chromosome is a short, thick **cross**. Inside the nucleus, the two chromosomes of **each pair** (IB: homologous chromosomes) lie **side by side**, gene beside gene (IB: a bivalent).' },
    { h: 'The pairs across the middle', p: 'The **nuclear membrane** (the membrane round the nucleus) breaks into pieces. The pairs are arranged **across the middle** of the cell. **Fibres** (IB: spindle microtubules) from one end hold one chromosome of each pair; fibres from the other end hold the other chromosome. Which chromosome of a pair faces which end is **chance** (IB: random orientation).' },
    { h: 'First division: the pairs separate', p: 'The fibres pull the two chromosomes of each pair to **opposite ends**, and the cell divides. Each new cell has **one chromosome of each pair**: 2. The number is **halved**, from diploid to haploid: meiosis is a **reduction division**.' },
    { h: 'Second division: the copies separate', p: 'Each cell divides again. This time the **two copies** of each chromosome separate, as in mitosis. There are **4 cells**, each with 2 chromosomes.' },
    { h: 'Four haploid cells', p: 'A nucleus forms in each cell, and the chromosomes become long, thin lines again. Four **haploid** cells: each nucleus has a single set of chromosomes, **one chromosome of each pair**. In a testis all four become **sperm cells**; in an ovary only one becomes an **egg cell**. Here they are of two kinds; with 23 pairs a person makes millions of kinds: the gametes are **genetically different**.' },
    { h: 'Fertilisation', p: 'One of these cells, now a **sperm cell**, fuses with an **egg cell** from another person. The egg cell’s chromosomes are drawn grey. Inside the egg cell, the nucleus of the sperm cell becomes larger. The two nuclei fuse: this is **fertilisation**. In the **zygote**, the chromosomes from the sperm cell came from its father (blue) and those from the egg cell from its mother (orange): each pair has one from each parent. The zygote has 4 chromosomes again, 2 pairs: **diploid**.' }
  ];
  var ME_M = [0, 6, 13, 23, 31, 40, 49, 57, 74];
  /* the gametes' nuclei: copy 0 to the left cell, copy 1 to the right */
  function gnuc(j, yC) { return nuc(ME.XC[j], yC, 50, 72); }
  /* fertilisation: the egg cell (much larger than a sperm cell's head; not to scale), its nucleus, the sperm's swollen
     nucleus inside it, and the zygote's nucleus where the two fuse */
  var EGG = [196, 330, 104], EN = nuc(232, 342, 38, 46), PN = nuc(156, 304, 38, 46), ZN = nuc(196, 330, 76, 74);
  function meiRender(t, ph, g) {
    g = g || {};
    var out = '', body = '', NU = ME.NU;
    var a1 = ease(seg(t, 31.4, 36.4)), c1 = ease(seg(t, 36.4, 39.6)), c2 = ease(seg(t, 46.8, 48.8)), fe = t >= 57;
    var T0 = terr(FOUR, NU), cp = ease(seg(t, 6.4, 12.4)), co = ease(seg(t, 13.4, 18.2)), pr = ease(seg(t, 18.6, 22.6)), mv = ease(seg(t, 25, 28));
    var r2 = ease(seg(t, 40.4, 43.2)), a2 = ease(seg(t, 45, 48.6));   /* the second division's copies: 3.6 s apart, not 2.6 (the audit, 6 Nov 2026) */
    var nf = seg(t, 49.4, 52), nA = seg(t, 49.4, 50.2), un = seg(t, 51.2, 56.4);
    g.T0 = T0; g.x = []; g.G = [];
    /* the cells: one → two (top, bottom) → four */
    if (!fe) {
      if (t < 40.4) out += D.pinch(160, lerp(250, 134, c1), lerp(250, 366, c1), lerp(134 - 6 * a1, 128, c1), lerp(196 + 8 * a1, 112, c1), false).svg;
      else ME.YC.forEach(function (yC) { out += D.pinch(yC, lerp(160, 92, c2), lerp(160, 228, c2), lerp(128, 66, c2), lerp(112, 100, c2), true).svg; });
    }
    /* the nucleus: whole while the pairs form, then in pieces */
    var brk = seg(t, 23.4, 25.4), nO = 1 - seg(t, 25.6, 26.6);
    if (nO > .02 && !fe) out += D.opening(NU.cx, NU.cy, NU.rx, NU.ry, 18, brk, nO);
    var top = [], bot = [], side = [[], [], [], []];
    if (t < 6.4) T0.forEach(function (T) { body += chrom(T, ph, -1); });
    else if (t < 13.4) T0.forEach(function (T) { body += chrom(T, ph, 0, { copy: cp }); });
    else if (t < 45) {
      T0.forEach(function (T, i) {
        /* the crosses: in their territories; each pair side by side inside the nucleus; the pairs across the middle; to their
           ends; then, in each new cell, upright on its middle line */
        var up = ME.UP[i], yC = up ? ME.YC[0] : ME.YC[1], c = mix(T.c, ME.BIV[i], pr), x = lerp(T.x, 90, pr);
        c = [c[0], c[1] + ME.BOW[i] * Math.sin(Math.PI * pr)];
        c = mix(c, ME.PAIR[i], mv);
        c = [c[0], lerp(c[1], yC, a1)];
        if (t >= 40.4) { c = mix(c, [160, yC + (T.A ? -26 : 30)], r2); x = lerp(90, 0, r2); }
        var Tm = at(T, c, x);
        body += chrom(T, ph, co, { cross: Tm });
        if (t < 40.4) (up ? top : bot).push(D.crossRod(Tm, 0).cen);
        else { var j = up ? 0 : 1; side[j * 2].push(D.crossRod(Tm, 0).p0); side[j * 2 + 1].push(D.crossRod(Tm, 1).p0); }
        g.x.push(Tm);
      });
    } else if (!fe) {
      T0.forEach(function (T, i) {
        var up = ME.UP[i], yC = up ? ME.YC[0] : ME.YC[1], j = up ? 0 : 1, y = yC + (T.A ? -26 : 30);
        var V = veePair(T, at(T, [160, y], 0), [96, y], [224, y], a2, true, 8, .07 * i);
        var Tg = [terr(TWO(T.who, T.who), gnuc(0, yC))[T.A ? 0 : 1], terr(TWO(T.who, T.who), gnuc(1, yC))[T.A ? 0 : 1]];
        if (t < 51.2) body += chrom(T, ph, 1, { rods: function (q) { return V[q]; }, split: true, cen: t < 45 });
        else body += unc(Tg[0], ph, un, V[0]) + unc(Tg[1], ph, un, V[1]);
        side[j * 2].push(V[0].p0); side[j * 2 + 1].push(V[1].p0);
        g.G.push({ i: i, V: V, Tg: Tg });
      });
    }
    /* the gametes' nuclei, from pieces */
    if (nA > .02 && !fe) ME.YC.forEach(function (yC) { [0, 1].forEach(function (j) { var d = gnuc(j, yC); out += D.opening(d.cx, d.cy, d.rx, d.ry, 12, 1 - nf, nA); }); });
    /* fibres, once the chromosomes are in their places: meiosis I from the top and bottom ends to each chromosome's joining
       point; meiosis II from the sides of each cell to each copy's */
    var f1 = seg(t, 28.2, 28.8) * (1 - seg(t, 36.6, 37.6)), g1 = ease(seg(t, 28.2, 30.4));
    if (f1 > .02) out += D.fibres(ME.PT, top.map(function (p) { return mix(ME.PT, p, g1); }), f1) + D.fibres(ME.PB, bot.map(function (p) { return mix(ME.PB, p, g1); }), f1);
    g.fib = top[1] ? mix(ME.PT, top[1], .45 * g1) : null;
    var f2 = seg(t, 43.2, 43.8) * (1 - seg(t, 46.8, 48)), g2 = ease(seg(t, 43.2, 44.8));
    if (f2 > .02) ME.YC.forEach(function (yC, j) {
      var pl = [44, yC], pr2 = [276, yC];
      out += D.fibres(pl, side[j * 2].map(function (p) { return mix(pl, p, g2); }), f2) + D.fibres(pr2, side[j * 2 + 1].map(function (p) { return mix(pr2, p, g2); }), f2);
    });
    if (fe) out += fert(t, ph, g); else out += body;
    return out;
  }
  /* fertilisation: three gametes fade; the top-left one becomes a sperm cell and the egg cell comes in (both rest, named);
     the sperm swims to the egg, its nucleus enters, swells and fuses with the egg's. In the zygote the chromosomes take its
     own parents' colours: from the sperm, its father (blue); from the egg, its mother (orange) (the audit, 5 Nov 2026).
     The two cells rest 3.6 s while they are named, long enough to read them in Play all (tools/flow-names.mjs).
     One thing at a time (the audit, 6 Nov 2026: the sperm nucleus swelled 2.5 times in half a second and its chromosomes
     turned grey, then blue, while they moved): the sperm's chromosomes stay drawn in its head (small, never gone); its
     nucleus enlarges over 2.4 s; the two nuclei fuse, every chromosome keeping its colour; then, with nothing moving, the
     colours change together, slowly (rc), to the zygote's own parents' */
  var FT = { fd: [57.4, 58.6], sp: [57.8, 60.6], eg: [58.2, 60.6], rest: [60.6, 64.2], sw: [64.2, 65.8], inn: [65.8, 67], swell: [66.8, 69.2], fu: [69.2, 71.4], rc: [71.8, 73.6] };
  function fert(t, ph, g) {
    function k(n) { return ease(seg(t, FT[n][0], FT[n][1])); }
    var out = '', fd = 1 - seg(t, FT.fd[0], FT.fd[1]), sp = k('sp'), eg = k('eg'), sw = k('sw'), inn = k('inn'), swell = k('swell'), fu = k('fu'), rc = k('rc');
    /* the other three gametes go */
    if (fd > .02) {
      var rest3 = '';
      [[1, 0], [0, 1], [1, 1]].forEach(function (q) {
        var yC = ME.YC[q[1]], d = gnuc(q[0], yC), who = q[1] ? ['dad', 'mum'] : ['mum', 'dad'];
        rest3 += D.cell(d.cx, yC, 66, 100) + D.envelope(d.cx, yC, d.rx, d.ry, 12);
        terr(TWO(who[0], who[1]), d).forEach(function (T) { rest3 += chrom(T, ph, -1); });
      });
      out += '<g opacity="' + n1(fd * 100) / 100 + '">' + rest3 + '</g>';
    }
    /* the egg cell comes in from the right: much larger than the sperm cell's head */
    var ex = lerp(430, EGG[0], eg);
    out += D.cell(ex, EGG[1], EGG[2], EGG[2]);
    /* the sperm cell: the gamete shrinks into a small head with a tail, rests, swims to the egg, and enters it */
    var hx = lerp(lerp(92, 70, sp), 116, sw), hy = lerp(lerp(134, 200, sp), 250, sw);
    hx = lerp(hx, PN.cx, inn); hy = lerp(hy, PN.cy, inn);
    var hrx = lerp(66, 9, sp), hry = lerp(100, 13, sp), head = 1 - seg(t, 66.6, 67.4), tail = sp * (1 - seg(t, 65.8, 66.8));
    if (tail > .02) {
      var Pt = [], L = 64 * sp;
      for (var i = 0; i <= 14; i++) { var f = i / 14, d = hry + L * f; Pt.push([hx - d * .62 + 4 * Math.sin(f * 9 + t * 3) * .7, hy - d * .78 + 4 * Math.sin(f * 9 + t * 3) * .55]); }
      out += '<path class="tail" d="' + D.poly(Pt) + '" opacity="' + n1(tail * 100) / 100 + '"/>';
    }
    if (head > .02) out += '<g opacity="' + n1(head * 100) / 100 + '">' + D.cell(hx, hy, hrx, hry) + '</g>';
    g.head = [hx - hrx, hy]; g.egg = [ex + EGG[2], EGG[1]];
    /* the two nuclei: the sperm's, small in its head, then swollen in the egg; the egg's; both moving into one */
    var sn = nuc(lerp(hx, ZN.cx, fu), lerp(hy, ZN.cy, fu), lerp(lerp(lerp(50, 6, sp), PN.rx, swell), ZN.rx, fu), lerp(lerp(lerp(72, 9, sp), PN.ry, swell), ZN.ry, fu));
    var en = nuc(lerp(ex + EN.cx - EGG[0], ZN.cx, fu), lerp(EN.cy, ZN.cy, fu), lerp(EN.rx, ZN.rx, fu), lerp(EN.ry, ZN.ry, fu));
    out += D.envelope(en.cx, en.cy, en.rx, en.ry, 12) + (fu < .98 ? D.envelope(sn.cx, sn.cy, sn.rx, sn.ry, 12) : '');
    /* the chromosomes: the sperm's (orange A, blue B: which of the man's parents each came from), small in its head and
       larger as its nucleus enlarges; the egg's grey; in the zygote, once still, the sperm's blue and the egg's orange */
    var Z = terr(FOUR, ZN), gs = terr(TWO('mum', 'dad'), sn), ge = terr(TWO('other', 'other'), en);
    var so = 1;
    var to = [[gs[0], Z[0], so, 'dad'], [gs[1], Z[3], so, 'dad'], [ge[0], Z[1], 1, 'mum'], [ge[1], Z[2], 1, 'mum']];
    g.Z = [];
    to.forEach(function (q) {
      var T = tmix(q[0], q[1], fu); T.who = q[0].who;
      var U = Object.assign({}, T, { who: q[3] });
      if (q[2] * (1 - rc) > .02) out += '<g opacity="' + n1(q[2] * (1 - rc) * 100) / 100 + '">' + chrom(T, ph, -1) + '</g>';
      if (rc > .02) out += rc < .999 ? '<g opacity="' + n1(rc * 100) / 100 + '">' + chrom(U, ph, -1) + '</g>' : chrom(U, ph, -1);
      g.Z.push(T);
    });
    return out;
  }
  function meiLabels(t, ph) {
    var g = {}; meiRender(t, ph, g);
    var T0 = g.T0, NU = ME.NU;
    if (t < 6) { var l0 = leftOf(thr(T0[0], ph));
      return [{ id: 'ch', text: 'one chromosome: a long, thin line', x: l0[0], y: l0[1], side: 'L' }, { id: 'nu', text: 'a diploid nucleus: 2 pairs', x: NU.cx + NU.rx * Math.cos(-.5), y: NU.cy + NU.ry * Math.sin(-.5), side: 'R' }]; }
    if (t < 13) { if (!rest(t, 12.4)) return []; var l1 = leftOf(thr(T0[0], ph)); return [{ id: 'cp', text: 'each chromosome: two identical copies', x: l1[0], y: l1[1], side: 'L' }]; }
    if (t < 23) { if (!rest(t, 22.6)) return [];
      var pa = plain(g.x[0], 'L'), pb = plain(g.x[3], 'R');
      return [{ id: 'pa', text: 'a pair, side by side', x: pa[0], y: pa[1], side: 'L' }, { id: 'pb', text: 'the other pair', x: pb[0], y: pb[1], side: 'R' }]; }
    if (t < 31) { if (!rest(t, 30.4)) return [];
      var qa = plain(g.x[0], 'L'), it = [{ id: 'pa', text: 'a pair across the middle', x: qa[0], y: qa[1], side: 'L' }];
      if (g.fib) it.push({ id: 'fb', text: 'a fibre (IB: a spindle microtubule)', x: g.fib[0], y: g.fib[1], side: 'R' });
      return it; }
    if (t < 40) { if (!rest(t, 39.6)) return [];
      return [{ id: 'c1', text: 'a new cell: 2\u00a0chromosomes, one of each pair', x: 288, y: 134, side: 'R' }, { id: 'c2', text: 'a new cell: 2\u00a0chromosomes, one of each pair', x: 288, y: 366, side: 'R' }]; }
    if (t < 49) { if (!rest(t, 48.8)) return [];
      return [{ id: 'q1', text: 'a cell: 2\u00a0chromosomes, single rods', x: 294, y: 134, side: 'R' }, { id: 'q2', text: 'a cell: 2\u00a0chromosomes', x: 294, y: 366, side: 'R' }]; }
    if (t < 57) { if (!rest(t, 56.4)) return [];
      return [{ id: 'g0', text: 'a haploid cell', x: 26, y: 134, side: 'L' }, { id: 'g1', text: 'a cell: one of each pair', x: 294, y: 134, side: 'R' }, { id: 'g2', text: 'a cell of the other kind', x: 294, y: 366, side: 'R' }]; }
    /* the sperm cell and the egg cell, named while they rest; the zygote at the end */
    if (t >= FT.rest[0] && t < FT.rest[1]) return [{ id: 's', text: 'a sperm cell', x: g.head[0], y: g.head[1], side: 'L' }, { id: 'e', text: 'an egg cell, from another person', x: g.egg[0], y: g.egg[1], side: 'R' }];
    if (!rest(t, FT.rc[1])) return [];
    /* both parents' names on the left, each on its nearest chromosome (the zygote's name, three lines, fills the right) */
    var mum = g.Z[2].c[0] < g.Z[3].c[0] ? g.Z[2] : g.Z[3];   /* g.Z: the sperm cell's two, then the egg cell's two */
    var dad = g.Z[0], a = leftOf(thr(dad, ph).filter(function (p) { return p[1] < dad.c[1]; })), b = leftOf(thr(mum, ph).filter(function (p) { return p[1] > mum.c[1]; }));   /* the upper half of one, the lower half of the other: the two names stand apart */
    return [{ id: 'z', text: 'the zygote: 4\u00a0chromosomes, 2\u00a0pairs', x: EGG[0] + EGG[2], y: EGG[1], side: 'R' }, { id: 'o', text: 'from its father', x: a[0], y: a[1], side: 'L' },
            { id: 'f', text: 'from its mother', x: b[0], y: b[1], side: 'L' }];
  }
  function meiPills(t) {
    return byTime([0, 9.4, 20.6, 33.9, 38, 46.3, 53, 67.8],
      ['4, 2 pairs (diploid)', '4, each two copies', '4, as 2 pairs side by side', '2 moving to each end', '2 in each of 2 cells (haploid)', '2 in each of 4 cells', '2 in each gamete (haploid)', 'the zygote: 4, 2 pairs (diploid)'],
      ['46: 23 pairs', '46, each two copies', '23 pairs side by side', '23 moving to each end', '23 in each cell', '23 in each cell', '23 in each gamete', '23 + 23 = 46'], t);
  }
  function meiosis(spec) {
    return widget(spec, 'dv', 'Meiosis, step by step', 'A cell with two pairs of chromosomes divides twice to give four haploid cells with one chromosome of each pair; then a sperm cell and an egg cell fuse.',
      ME_STEPS, ME_M, ME.W, ME.H, meiRender, meiLabels, meiPills, [
        { key: KEY.concat([['fibre', 'fibres', [3]], ['other', 'the egg cell’s chromosomes', [7]]]) }
      ]);
  }
  L.add('meiosis', function (spec) { return levels(spec, meiosis, global.InhDivideIB.meiosis, 'Meiosis'); });

  /* ============================================================ a line or a cross? ============================================================ */
  var LZ = { LA: 96, LB: 0, w: 15, wd: 2 };
  var PAIR = [{ id: 'Am', who: 'mum', A: true, c: [0, -.44], R: .46, n: 13, a: 6, x: 70, m: 1.2 }, { id: 'Ad', who: 'dad', A: true, c: [0, .44], R: .46, n: 13, a: -8, x: 110, m: 1.2 }];
  var LC = { W: 300, H: 460, NU: nuc(150, 226, 112, 124), PT: [150, 40], PB: [150, 412], EQ: [[96, 226], [204, 226]], AX: [126, 174], AY: [86, 362],
             /* the new nuclei: well inside their cells (the audit: the lower one had poked out), first close round the rods */
             D1: nuc(150, 134, 80, 64), D2: nuc(150, 338, 80, 64), TN: [nuc(150, 110, 56, 34), nuc(150, 338, 56, 34)] };
  var LC_STEPS = [
    { h: 'A working cell: lines', p: 'While a cell is working, each chromosome is **a single long, thin line**: one molecule of DNA, folded in its own part of the nucleus. Here is **one pair**: the same chromosome from the **mother** (orange) and from the **father** (blue). The yellow length is a **gene**, at the same place on both.' },
    { h: 'Copied: two lines', p: 'Before the cell divides, each chromosome is **copied exactly**: the copy is made **along the whole line**. This exact copying is called **replication**. Now each chromosome is **two identical lines**, side by side, held together most firmly at **one point**.' },
    { h: 'Coiled: a cross', p: 'Each copy **coils**, again and again, until it is **short and thick**. The two copies, still joined, now form a **cross**: this is still **one chromosome**. Then the **nuclear membrane** (the membrane round the nucleus) breaks into pieces.' },
    { h: 'Across the middle', p: 'The two chromosomes are arranged **across the middle** of the cell. **Fibres** (IB: spindle microtubules; together, the spindle) from its two ends hold each one at its joining point.' },
    { h: 'The copies separate', p: 'The fibres pull the **two copies** of each chromosome to **opposite ends**. Each copy is now a chromosome of its own: **a single rod**, not a cross. Each end receives one copy of the mother’s chromosome and one of the father’s.' },
    { h: 'Two new cells: lines again', p: 'A new nucleus forms at each end, and the rods **uncoil** into **long, thin lines** again. The cell divides: **two new cells**, each with the **same pair** as the first cell. This division is called **mitosis**: the two new cells are **genetically identical**. A cross is seen **only while a cell divides**.' }
  ];
  var LC_M = [0, 6, 14, 23, 31, 38, 50];
  function lcRender(t, ph, g) {
    g = g || {};
    var out = '', body = '', NU = LC.NU, el = ease(seg(t, 31.4, 37)), cyk = ease(seg(t, 44.4, 49.6));
    out += D.pinch(150, lerp(226, 124, cyk), lerp(226, 348, cyk), lerp(132 - 4 * el, 128, cyk), lerp(200 + 8 * el, 104, cyk), false).svg;
    var mb = membranes(t, NU, LC.TN, [LC.D1, LC.D2], { brk: [20.6, 22.6], dim: [23.2, 24.2], gat: [38.4, 40], close: [40, 41.6], grow: [40.4, 45.6] }, false);
    out += mb.svg;
    var T0 = terr(PAIR, NU, LZ), T1 = terr(PAIR, mb.cur[0], LZ), T2 = terr(PAIR, mb.cur[1], LZ);
    var cp = ease(seg(t, 6.4, 13)), co = ease(seg(t, 14.4, 22.6)), mid = ease(seg(t, 23.6, 27.4));
    var part = ease(seg(t, 31.4, 37)), un = seg(t, 40.4, 45.6);
    var top = [], bot = [];
    g.T0 = T0; g.x = []; g.v = []; g.T1 = T1; g.T2 = T2;
    T0.forEach(function (T, i) {
      if (t < 6.4) body += chrom(T, ph, -1, null, LZ);
      else if (t < 14.4) body += chrom(T, ph, 0, { copy: cp }, LZ);
      else if (t < 31.4) {
        var Tm = at(T, mix(T.c, LC.EQ[i], mid), lerp(T.x, 90, mid));
        body += chrom(T, ph, co, { cross: Tm }, LZ);
        top.push(D.crossRod(Tm, 0).p0); bot.push(D.crossRod(Tm, 1).p0); g.x.push(Tm);
      } else {
        var V = veePair(T, at(T, LC.EQ[i], 90), [LC.AX[i], LC.AY[0]], [LC.AX[i], LC.AY[1]], part, false, 8, .1 * i);
        if (t < 40.4) body += chrom(T, ph, 1, { rods: function (c) { return V[c]; }, split: true, cen: t < 31.4 }, LZ);
        else body += unc(T1[i], ph, un, V[0], LZ) + unc(T2[i], ph, un, V[1], LZ);
        top.push(V[0].p0); bot.push(V[1].p0); g.v.push(V);
      }
    });
    var fo = seg(t, 27.6, 28.2) * (1 - seg(t, 38.2, 39.4)), gr = ease(seg(t, 27.6, 29.6));
    if (fo > .02) out += D.fibres(LC.PT, top.map(function (p) { return mix(LC.PT, p, gr); }), fo) + D.fibres(LC.PB, bot.map(function (p) { return mix(LC.PB, p, gr); }), fo);
    return out + body;
  }
  function sideOf(p) { return p[0] < 150 ? 'L' : 'R'; }
  function lcLabels(t, ph) {
    var g = {}; lcRender(t, ph, g);
    var T0 = g.T0;
    if (t < 6) {
      var a = leftOf(thr(T0[0], ph)), b = rightOf(thr(T0[1], ph)), g0 = thr(T0[0], ph)[Math.round(.78 * 299)], g1 = thr(T0[1], ph)[Math.round(.78 * 299)];
      /* the gene's name on the side away from the other names there: the mother's band if it lies right of the middle,
         else the father's band (it is the same gene, at the same place) */
      var gn = g0[0] > 150 ? g0 : g1;
      return [{ id: 'm', text: 'the mother’s chromosome: a long, thin line', x: a[0], y: a[1], side: 'L' }, { id: 'f', text: 'the same chromosome, from the father', x: b[0], y: b[1], side: 'R' },
              { id: 'g', text: 'a gene', x: gn[0], y: gn[1], side: sideOf(gn) }];
    }
    if (t < 14) { if (!rest(t, 13)) return [];
      var l = leftOf(thr(T0[0], ph));
      return [{ id: 'cp', text: 'two identical lines, side by side', x: l[0], y: l[1], side: 'L' }]; }
    if (t < 23) { if (!rest(t, 22.6)) return [];
      var xl = plain(T0[0], 'L'), bd = D.rodAt(D.crossRod(T0[1], 1), .78);
      return [{ id: 'x', text: 'one chromosome: two copies, a cross', x: xl[0], y: xl[1], side: 'L' }, { id: 'b', text: 'the gene, on both copies', x: bd[0], y: bd[1], side: sideOf(bd) }]; }
    if (t < 31) { if (!rest(t, 30.4)) return [];
      var e0 = plain(g.x[0], 'L'), e1 = plain(g.x[1], 'R');
      return [{ id: 'mm', text: 'the mother’s chromosome', x: e0[0], y: e0[1], side: 'L' }, { id: 'ff', text: 'the father’s chromosome', x: e1[0], y: e1[1], side: 'R' }]; }
    if (t < 38) { if (!rest(t, 37)) return [];
      var u = g.v[0][0], d = g.v[1][1];
      return [{ id: 'r1', text: 'a single rod, not a cross', x: u.top[0], y: u.top[1], side: 'L' }, { id: 'r2', text: 'a single rod', x: d.top[0], y: d.top[1], side: 'R' }]; }
    if (!rest(t, 49.6)) return [];
    var o1 = rightOf(thr(g.T1[0], ph)), o2 = rightOf(thr(g.T2[1], ph));
    return [{ id: 'c1', text: 'a new cell: the mother’s chromosome, a line again', x: o1[0], y: o1[1], side: 'R' }, { id: 'c2', text: 'the father’s chromosome, a line again', x: o2[0], y: o2[1], side: 'R' }];
  }
  function lcPills(t) {
    var a = byTime([0, 9.7, 17.4, 34.2, 43], ['a single line: 1 copy of its DNA', 'two identical lines, joined', 'a cross: two copies', 'a single rod: 1 copy', 'a single line again'], [], t)[0];
    var b = byTime([0, 6.4, 14.4, 23, 47], ['working', 'preparing to divide', 'dividing: the copies coil', 'dividing', 'two new working cells'], [], t)[0];
    return [a, b];
  }
  function linecross(spec) {
    return widget(spec, 'dv', 'A line or a cross?', 'One pair of chromosomes, the mother’s and the father’s: long thin lines in a working cell; each copied, then coiled into a cross; the copies separate as single rods; two new cells, each with the pair as lines.',
      LC_STEPS, LC_M, LC.W, LC.H, lcRender, lcLabels, lcPills, [
        { key: [['mum', 'from the mother'], ['dad', 'the same chromosome from the father'], ['gene', 'a gene'], ['fibre', 'fibres', [3, 4]],
                ['vesicle', 'pieces of the nuclear membrane', [2, 3, 4]]] }, ['One pair of the 46 is drawn.']
      ], [['n', 'Each chromosome:'], ['hu', 'The cell:']]);
  }
  L.add('linecross', linecross);

  /* the films of the mitosis and meiosis stations' pictures draw these same frames (js/inh-films.js) */
  global.InhDivide = { SZ: SZ, MI: MI, ME: ME, LC: LC, LZ: LZ, PAIR: PAIR, mitRender: mitRender, meiRender: meiRender, lcRender: lcRender, terr: terr, chrom: chrom, thr: thr, leftOf: leftOf, rightOf: rightOf, ends: ends, nuc: nuc };
})(window);
