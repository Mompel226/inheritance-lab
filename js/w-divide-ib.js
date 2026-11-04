/* ============================================================
   w-divide-ib.js — the IB level of the two divisions (Daniel, 4 Nov 2026: "IB students … might want to cover this with
   IB content … all of the key terms, all of the other structures of the cell that participate, all of the different
   phases, shown very professionally"). Behind the IGCSE · IB switch of the mitosis and meiosis animations
   (js/w-divide.js): an IGCSE pupil who is curious sees the detail of IB. Each step names its IB Biology guide statement
   at the end of a sentence; a term the guide does not name is marked "beyond IB".
   Rebuilt the same day after an independent review (Opus) of the phases, their order and their timing.

   The cell drawn: an animal cell with 4 chromosomes (2 pairs: a long pair A and a short pair B; one of each pair from
   the mother, orange, and one from the father, blue), its nucleus and nucleolus, and centrosomes, each two centrioles at
   right angles (an L; IB A2.2.8 names centrioles). Mitosis also draws six mitochondria. The spindle: microtubules from
   each centrosome to the centromeres, and (mitosis) polar microtubules that overlap at the equator.

   mitosis, IB
     1 G1: each chromosome ONE chromatid, a single thin line; one centrosome; the cell grows (D2.1.13–D2.1.14, HL)
     2 S: the DNA is replicated: two sister chromatids; the centrosome doubles (D2.1.5)
     3 G2: the cell grows more (D2.1.14, HL)
     4 prophase: condensation (an inset: DNA wound round histones); the nucleolus goes; the centrosomes move to the poles,
       round the nucleus, never through it; spindle microtubules grow outside the nucleus (D2.1.6–D2.1.7)
     5 end of prophase: the nuclear membrane breaks into vesicles (B2.2.6, HL); microtubules attach to the centromeres
     6 metaphase: the chromosomes on the equator (a dashed line), each centromere held from both poles (D2.1.7)
     7 anaphase: the sister chromatids separate; each is a V, its centromere first, the microtubules ending on it; the
       cell lengthens (D2.1.6–D2.1.7)
     8 telophase: the chromatids inside the places the new nuclei form; membranes form from vesicles; the chromosomes
       uncoil; nucleoli; the spindle goes
     9 cytokinesis: a ring of actin and myosin pinches the cell: two identical cells, three mitochondria each (D2.1.2)
   meiosis, IB
     1 G1: single lines; one centrosome      2 S and G2: sister chromatids; the centrosome doubles (D2.1.5)
     3 prophase I: condensation; the homologues pair as bivalents, inside the whole nucleus (synapsis: beyond IB)
     4 prophase I: crossing over between non-sister chromatids at a chiasma (beyond IB), the exchange drawn as it
       happens; then the nuclear membrane breaks into vesicles and the spindle forms (D2.1.11)
     5 metaphase I: bivalents on the equator; random orientation (D2.1.11)
     6 anaphase I: the homologues separate, the first round of segregation (D2.1.9)
     7 telophase I and cytokinesis: two haploid cells, one centrosome each; no replication follows
     8 prophase II: the centrosome doubles; a new spindle at right angles to the first
     9 metaphase II: in each cell the chromosomes on the equator, each centromere held from both poles
    10 anaphase II: the sister chromatids separate, each a V, its centromere first (D2.1.9)
    11 telophase II and cytokinesis: four haploid cells, all different (D2.1.11); the chromatids left drawn condensed,
       so the pupil can see which cells had crossing over
   THE BIOLOGY, every frame: the two chromatids of one chromosome identical, except where crossing over exchanged the
   same length (non-sister chromatids, prophase I only); a gene band at its own place, whatever size the chromosome is
   drawn (identity, never length); homologues from different parents; the right number of chromosomes, counted by
   centromeres, in every frame (the pills say it); nothing drawn crosses the outline it is in, and no centrosome enters a
   nucleus (tools/bounds.mjs). Every name points at a part drawn at that moment (labels read the drawing's own positions).
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, K = global.WKit, D = global.InhDraw; if (!L || !K || !D) return;
  var n1 = K.n1, seg = K.seg, ease = K.ease, lerp = K.lerp;
  var LA = 52, LB = 32, CW = 7.5, CEN = .42, KT = 4.4;
  /* meiosis draws its chromosomes larger, so a chiasma can be seen at the size the page shows it */
  var LA2 = 68, LB2 = 42, CW2 = 9.5, KT2 = 5.5;
  /* a chromosome of pair A or B: its gene band at its own place on that chromosome */
  function ch(o) { return D.chromo(Object.assign({ w: CW, bands: o.A ? [.78] : [.85] }, o)); }
  function vee(o) { return D.vee(Object.assign({ w: CW, bands: o.A ? [.78] : [.85] }, o)); }
  function op(v) { return v >= 1 ? '' : ' opacity="' + n1(Math.max(0, v) * 100) / 100 + '"'; }
  function rotP(x, y, lx, ly, rot) { var a = rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [x + lx * c - ly * s, y + lx * s + ly * c]; }
  /* where the copies of a cross (InhDraw.chromo, copies 2) stand apart, and where its centromere and each copy's bend are */
  function offOf(sp, w) { return (w || CW) / 2 * (.55 + .15 * sp); }
  function cenOf(x, y, len, rot) { return rotP(x, y, 0, (CEN - .5) * len, rot); }
  function copyAt(x, y, len, rot, k, sp, w) { return rotP(x, y, k * offOf(sp, w), (CEN - .5) * len, rot); }
  function along(P, s) {
    s = Math.max(0, Math.min(1, s));
    var ls = [], T = 0, i;
    for (i = 1; i < P.length; i++) { var d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); ls.push(d); T += d; }
    var want = s * T;
    for (i = 0; i < ls.length; i++) {
      if (want <= ls[i] || i === ls.length - 1) { var f = ls[i] ? Math.min(1, want / ls[i]) : 1; return [lerp(P[i][0], P[i + 1][0], f), lerp(P[i][1], P[i + 1][1], f)]; }
      want -= ls[i];
    }
    return P[P.length - 1];
  }
  /* a thread, for the chiasma's crossing strokes */
  function path(pts, who, w) {
    var d = 'M' + n1(pts[0][0]) + ' ' + n1(pts[0][1]);
    for (var i = 1; i < pts.length; i++) d += ' L' + n1(pts[i][0]) + ' ' + n1(pts[i][1]);
    return '<path class="thr thr--' + who + '" d="' + d + '" stroke-width="' + (w || 2.6) + '"/>';
  }
  /* the four chromosomes as threads in a nucleus that is not dividing, none crossing another (InhDraw.threads) */
  function threads(cx, cy, s, o, two) { return o != null && o <= .02 ? '' : '<g' + op(o == null ? 1 : o) + '>' + D.threads(cx, cy, s, s, two, 2.8) + '</g>'; }
  function threadStart(cx, cy, s) { return D.threadStart(cx, cy, s); }
  /* a centrosome: two centrioles at right angles (an L), in a pale disc */
  function centrosome(p, o) {
    return '<g transform="translate(' + n1(p[0]) + ' ' + n1(p[1]) + ')"' + op(o == null ? 1 : o) + '>' +
      '<circle class="cent__pcm" r="9"/><rect class="cent" x="-5.6" y="-4.6" width="9" height="3.6" rx="1"/><rect class="cent" x="2.4" y="-1.6" width="3.6" height="8.4" rx="1"/></g>';
  }
  /* microtubules from a pole to points; `rays`: the short ones round the centrosome */
  function mt(p, pts, o, rays) {
    if (o <= .02) return '';
    var out = '<g class="mt"' + op(o) + '>';
    pts.forEach(function (q) { out += '<path d="M' + n1(p[0]) + ' ' + n1(p[1]) + ' L' + n1(q[0]) + ' ' + n1(q[1]) + '"/>'; });
    if (rays) for (var k = 0; k < 7; k++) { var a = k * Math.PI * 2 / 7 + .3; out += '<path d="M' + n1(p[0]) + ' ' + n1(p[1]) + ' L' + n1(p[0] + Math.cos(a) * 14) + ' ' + n1(p[1] + Math.sin(a) * 14) + '"/>'; }
    return out + '</g>';
  }
  function nucleolus(x, y, o) { return o <= .02 ? '' : '<circle class="nucleolus" cx="' + n1(x) + '" cy="' + n1(y) + '" r="7"' + op(o) + '/>'; }
  /* the nuclear membrane: whole (k 0), or broken into small vesicles (k > 0; B2.2.6, HL), its inside fading */
  function membrane(cx, cy, rx, ry, k, o) {
    o = o == null ? 1 : o; if (o <= .02) return '';
    if (k <= 0) return '<ellipse class="nucb" cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + n1(rx) + '" ry="' + n1(ry) + '"' + op(o) + '/>';
    var out = '<ellipse class="nucghost" cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + n1(rx) + '" ry="' + n1(ry) + '"' + op(o * (1 - k)) + '/><g' + op(o) + '>', d = 1 + k * .12;
    for (var i = 0; i < 24; i++) { var a = i * Math.PI / 12; out += '<circle class="vesicle" cx="' + n1(cx + Math.cos(a) * rx * d) + '" cy="' + n1(cy + Math.sin(a) * ry * d) + '" r="' + n1(2.3 + 1.2 * (1 - k)) + '"/>'; }
    return out + '</g>';
  }
  function vesicleAt(cx, cy, rx, ry, k, a) { var d = 1 + k * .12; return [cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d]; }
  function mito(m, o) { return '<ellipse class="mito" cx="' + n1(m[0]) + '" cy="' + n1(m[1]) + '" rx="9" ry="4.6" transform="rotate(' + m[2] + ' ' + n1(m[0]) + ' ' + n1(m[1]) + ')"' + op(o == null ? 1 : o) + '/>'; }
  /* a cell dividing in two: the outline of two overlapping ellipses (centres a and b on one line), pinched where they
     meet (`w` the half-width of the waist, `m` where it is), then two cells. `horiz`: side by side */
  function pinch(c, a, b, rx, ry, horiz) {
    var h = Math.abs(b - a) / 2, m = (a + b) / 2, R = horiz ? rx : ry, Wd = horiz ? ry : rx;
    if (h < .3) return { svg: horiz ? D.cell(m, c, rx, ry) : D.cell(c, m, rx, ry), w: Wd, m: m };
    if (h >= R - .3) return { svg: horiz ? D.cell(a, c, rx, ry) + D.cell(b, c, rx, ry) : D.cell(c, a, rx, ry) + D.cell(c, b, rx, ry), w: 0, m: m };
    var w = Wd * Math.sqrt(1 - h * h / (R * R)), A = ' A' + n1(rx) + ' ' + n1(ry) + ' 0 1 ', d, e;
    if (!horiz) { d = 'M' + n1(c - w) + ' ' + n1(m) + A + '1 ' + n1(c + w) + ' ' + n1(m) + A + '1 ' + n1(c - w) + ' ' + n1(m) + ' Z'; e = [c, a, rx, ry, c, b, rx, ry]; }
    else { d = 'M' + n1(m) + ' ' + n1(c - w) + A + '0 ' + n1(m) + ' ' + n1(c + w) + A + '0 ' + n1(m) + ' ' + n1(c - w) + ' Z'; e = [a, c, rx, ry, b, c, rx, ry]; }
    return { svg: '<path class="cellb" data-e="' + e.map(n1).join(',') + '" d="' + d + '"/>', w: w, m: m };
  }
  function ring(P, c, horiz) {
    if (P.w <= 3) return '';
    var a = horiz ? [P.m, c - P.w] : [c - P.w, P.m], b = horiz ? [P.m, c + P.w] : [c + P.w, P.m];
    return '<g class="cring"><circle cx="' + n1(a[0]) + '" cy="' + n1(a[1]) + '" r="3.6"/><circle cx="' + n1(b[0]) + '" cy="' + n1(b[1]) + '" r="3.6"/></g>';
  }
  function eqline(x0, y0, x1, y1, o) { return o <= .02 ? '' : '<path class="eqline" d="M' + n1(x0) + ' ' + n1(y0) + ' L' + n1(x1) + ' ' + n1(y1) + '"' + op(o) + '/>'; }

  function widget(spec, title, aria, STEPS, M, W, H, render, labelsAt, pills, notes) {
    var S = K.shell(spec, 'dv', title, aria, [['ph', 'Phase:'], ['n', 'Chromosomes:']]);
    var svg = S.svg, NSV = K.NS;
    var bg = document.createElementNS(NSV, 'rect'); bg.setAttribute('class', 'zm__bg'); svg.appendChild(bg);
    var model = document.createElementNS(NSV, 'g'); svg.appendChild(model);
    var gLab = document.createElementNS(NSV, 'g'); svg.appendChild(gLab);
    var cr = document.createElementNS(NSV, 'rect'), lay = null, narrow = false, key = K.pinKey(S);
    var R = [0];
    /* each step lasts at least one second for every 2 words of its caption (120 words a minute) */
    STEPS.forEach(function (s, i) { var w = (s.h + ' ' + s.p).replace(/\*\*/g, '').split(/\s+/).length; R.push(R[i] + Math.max(M[i + 1] - M[i], w / 2)); });
    var clock = K.readerClock(R, M);
    function draw(tt) {
      var t = clock(tt), g = {};
      model.innerHTML = render(t, g);
      var items = labelsAt(t, g).map(function (q) { var p = lay.to(q.x, q.y); return { id: q.id, text: q.text, x: p[0], y: p[1], side: q.side }; });
      gLab.innerHTML = K.names(lay, items, narrow, key, null, 6);
      var pl = pills(t); S.pill('ph', pl[0], 'ok'); S.pill('n', pl[1], 'ok');
    }
    var sp = L.stepper({ steps: K.readerSteps(STEPS, R), end: R[R.length - 1], render: draw });
    return K.mount(S, sp, 'dv', notes, function (Dw, nar) {
      narrow = nar; var m = K.margins(nar, 19, 19, 100, 100);
      lay = K.frameOf(svg, bg, model, cr, { x0: 0, x1: W, y0: 0, y1: H }, false, Dw, m[0], m[1], m[2], m[3], 14.5);
    });
  }
  function stepOf(M, t) { var k = 0; for (var i = 0; i < M.length - 1; i++) if (t >= M[i] - 1e-6) k = i; return k; }

  /* ============================================================ mitosis, IB ============================================================ */
  var MS = [
    { t: 0,  h: 'Interphase: G1', p: 'The cell grows. It makes proteins and more organelles, such as **mitochondria**. Each chromosome is **one chromatid**: a single long, thin line. There is one **centrosome**. (D2.1.13–D2.1.14, HL)' },
    { t: 7,  h: 'Interphase: S', p: 'The DNA is **replicated**: each chromosome is now **two sister chromatids**, still long and thin. The centrosome doubles. (D2.1.5)' },
    { t: 14, h: 'Interphase: G2', p: 'The cell grows more and makes the proteins it needs to divide. (D2.1.14, HL)' },
    { t: 20, h: 'Prophase', p: 'The chromosomes **condense**: the DNA winds round **histone** proteins and coils many times (supercoiling). Each shows as two sister chromatids joined at the **centromere**. The **nucleolus** disappears. The centrosomes move round the nucleus to opposite poles, and **spindle microtubules** grow from them. (D2.1.6–D2.1.7)' },
    { t: 30, h: 'Prophase ends', p: 'The **nuclear membrane** breaks into small vesicles (B2.2.6, HL). **Microtubules** from both poles attach to each centromere (at its kinetochores: beyond IB).' },
    { t: 37, h: 'Metaphase', p: 'The chromosomes are arranged on the **equator** of the spindle. Each centromere is held by microtubules from both poles. (D2.1.7)' },
    { t: 44, h: 'Anaphase', p: 'The centromeres divide. The microtubules shorten, and **motor proteins** at each centromere pull its chromatid along them: the **sister chromatids** move to **opposite poles**, centromere first. Each chromatid is now a chromosome. The cell becomes longer. (D2.1.6–D2.1.7)' },
    { t: 53, h: 'Telophase', p: 'At each pole a **nuclear membrane** forms again round the chromosomes, from vesicles. The chromosomes **uncoil** and become long, thin lines again, and a nucleolus forms. The spindle disappears. (D2.1.7)' },
    { t: 60, h: 'Cytokinesis', p: 'A ring of **actin and myosin** pinches the cell membrane and divides the cytoplasm: two **genetically identical** daughter cells, each with 4 chromosomes and a share of the mitochondria. (D2.1.2)' }
  ];
  var MM = [0, 7, 14, 20, 30, 37, 44, 53, 60, 70];
  var W1 = 300, H1 = 460, C1 = [150, 230], PT = 70, PB = 390;
  /* the chromosomes, in order: A from the mother, A from the father, B from the mother, B from the father */
  var CH1 = [{ A: true, who: 'mum' }, { A: true, who: 'dad' }, { A: false, who: 'mum' }, { A: false, who: 'dad' }];
  var START = [[112, 214, 20], [154, 250, -12], [184, 206, 34], [196, 246, -26]];      /* prophase, in the nucleus */
  var EQX = [56, 118, 190, 238];                                                   /* metaphase, on the equator */
  var AX = [100, 132, 168, 200];                                                   /* anaphase, at the poles */
  /* six mitochondria, three in each half: each half is one daughter cell's share */
  var MITO = [[62, 128, 30], [228, 104, -30], [96, 82, -15], [236, 336, -20], [82, 356, 10], [200, 384, 20]];
  var CA_PATH = [[138, 140], [150, PT]], CB_PATH = [[162, 140], [246, 186], [246, 280], [150, PB]];
  function lenOf(c) { return c.A ? LA : LB; }
  function mitIB(t, g) {
    var out = '';
    var grow = 4 * seg(t, .5, 6.5) + 4 * seg(t, 14.4, 19), el = ease(seg(t, 44.4, 50)), cy = ease(seg(t, 60.4, 66));
    var rx = lerp(124 + grow - 4 * el, 132, cy), ry = lerp(196 + 1.25 * grow + 6 * el, 104, cy);
    var P = pinch(C1[0], lerp(C1[1], 124, cy), lerp(C1[1], 336, cy), rx, ry, false);
    out += P.svg + (t >= 60.4 ? ring(P, C1[0], false) : '');
    g.cell = P; g.cellRx = rx; g.cellTop = lerp(C1[1], 124, cy);
    MITO.forEach(function (m) { out += mito(m); });
    /* the nucleus: whole, then vesicles (end of prophase), which scatter and fade by metaphase */
    var brk = seg(t, 30.4, 34);
    if (t < 38.5) out += membrane(C1[0], C1[1], 74, 68, brk, 1 - seg(t, 36, 38.5));
    g.ves = vesicleAt(C1[0], C1[1], 74, 68, brk, Math.PI);
    out += nucleolus(C1[0] + 20, C1[1] + 46, 1 - seg(t, 21, 24));
    /* telophase: two nuclei form from vesicles round the chromatids, which then uncoil */
    var nf = seg(t, 53.8, 57.4), unc = seg(t, 57.6, 60);
    if (t >= 53.8) out += membrane(C1[0], 140, 62, 42, 1 - nf, seg(t, 53.8, 55)) + membrane(C1[0], 320, 62, 42, 1 - nf, seg(t, 53.8, 55));
    /* the threads: single (G1), drawing apart into sister copies (S), condensing (prophase) */
    var thrO = 1 - seg(t, 20.4, 21.6);
    out += threads(C1[0], C1[1], 1.25, thrO, ease(seg(t, 7.4, 10)));
    out += threads(C1[0], 140, .95, unc, 0) + threads(C1[0], 320, .95, unc, 0) + nucleolus(C1[0] + 16, 170, unc) + nucleolus(C1[0] + 16, 350, unc);
    /* the centrosomes: one; two (S); round the nucleus to the poles (prophase); apart a little more as the cell lengthens */
    var two = ease(seg(t, 8, 12)), go = ease(seg(t, 21, 27));
    var cA = go > 0 ? along(CA_PATH, go) : [lerp(150, 138, two), 140], cB = go > 0 ? along(CB_PATH, go) : [lerp(150, 162, two), 140];
    if (t >= 44.4) { cA = [C1[0], PT - 6 * el]; cB = [C1[0], PB + 6 * el]; }
    g.cA = cA; g.cB = cB;
    /* chromosomes (prophase to metaphase): crosses that condense in the nucleus, then move to the equator */
    var cond = ease(seg(t, 20.4, 26)), mid = ease(seg(t, 37.4, 42)), part = ease(seg(t, 44.4, 50)), flip = ease(seg(t, 45, 47.5));
    var tel = ease(seg(t, 53.4, 57)), top = [], bot = [], body = '';
    g.x = []; g.v = [];
    if (t >= 20.4 && t < 44.4) {
      CH1.forEach(function (c, i) {
        var s0 = START[i], len = lenOf(c) * lerp(.55, 1, cond);
        var x = lerp(s0[0], EQX[i], mid), y = lerp(s0[1], C1[1], mid), rot = lerp(s0[2], 90, mid);
        body += ch({ x: x, y: y, len: len, A: c.A, who: c.who, copies: 2, rot: rot });
        var ce = cenOf(x, y, len, rot);
        top.push([ce[0], ce[1] - KT]); bot.push([ce[0], ce[1] + KT]);
        g.x.push({ x: x, y: y, len: len, rot: rot, cen: ce });
      });
      body = '<g' + op(Math.min(1, seg(t, 20.4, 21.6) * 1.5)) + '>' + body + '</g>';
    }
    /* anaphase and telophase: each chromatid a V, centromere first; at telophase inside its new nucleus, then uncoiled */
    if (t >= 44.4) {
      CH1.forEach(function (c, i) {
        var len = lenOf(c), x0 = EQX[i] + (.5 - CEN) * len, x = lerp(x0, AX[i], part);
        var up = lerp(C1[1] - offOf(1), PT + 30, part), dn = lerp(C1[1] + offOf(1), PB - 30, part);
        var xx = lerp(x, C1[0] + (AX[i] - C1[0]) * .7, tel), sc = lerp(1, .6, tel);
        up = lerp(up, 128, tel); dn = lerp(dn, 332, tel);
        var opn = lerp(lerp(114, 26, flip), 14, tel), fade = 1 - seg(t, 56.5, 58.8);
        if (fade > .02) {
          body += vee({ x: xx, y: up, len: len * sc, A: c.A, who: c.who, rot: 0, open: -opn, op: fade });
          body += vee({ x: xx, y: dn, len: len * sc, A: c.A, who: c.who, rot: 180, open: opn, op: fade });
        }
        top.push([xx, up]); bot.push([xx, dn]); g.v.push([xx, up, dn]);
      });
    }
    /* the spindle: asters from prophase; microtubules grow outside the nucleus, attach when it breaks, end on the moving
       centromeres, and go in telophase. Polar microtubules overlap at the equator from metaphase */
    var gone = 1 - seg(t, 53.4, 56), aster = seg(t, 21, 22.5) * gone, spn = seg(t, 27, 28.5) * gone, att = seg(t, 30.4, 35);
    if (aster > .02) {
      var tA = [], tB = [];
      if (spn > .02) {
        top.forEach(function (p) { tA.push(t < 44.4 ? [p[0], lerp(PT + 34, p[1], att)] : p); });
        bot.forEach(function (p) { tB.push(t < 44.4 ? [p[0], lerp(PB - 34, p[1], att)] : p); });
        var pol = seg(t, 30.4, 36);
        if (pol > 0) { tA.push([lerp(150, 148, pol), lerp(PT + 40, 262, pol)], [lerp(150, 164, pol), lerp(PT + 40, 262, pol)]); tB.push([lerp(150, 152, pol), lerp(PB - 40, 198, pol)], [lerp(150, 168, pol), lerp(PB - 40, 198, pol)]); }
      }
      out += mt(cA, tA, aster, true) + mt(cB, tB, aster, true);
      g.mtA = tA;
    }
    out += eqline(30, C1[1], 270, C1[1], seg(t, 37.4, 39) * (1 - seg(t, 44.4, 46)));
    out += body + centrosome(cA) + centrosome(cB);
    /* prophase: an inset, enlarged — DNA wound round histones */
    var ins = seg(t, 21, 23) * (1 - seg(t, 28.5, 30));
    if (ins > .02) {
      var b = '<g' + op(ins) + '><rect class="inset" x="2" y="2" width="80" height="48" rx="8"/>';
      for (var k = 0; k < 4; k++) b += '<circle class="hist" cx="' + (15 + k * 18) + '" cy="26" r="6"/>';
      b += '<path class="histdna" d="M5 26 C9 14 21 14 21 26 C21 38 33 38 33 26 C33 14 45 14 45 26 C45 38 57 38 57 26 C57 14 69 14 69 26 L79 26"/></g>';
      out += b;
    }
    return out;
  }
  function mitIBLabels(t, g) {
    var k = stepOf(MM, t), it = [], s0 = threadStart(C1[0], C1[1], 1.25);
    if (k === 0) it.push({ id: 'l', text: 'a chromosome: one chromatid, a single line', x: s0[0], y: s0[1], side: 'L' }, { id: 'cs', text: 'centrosome: two centrioles', x: g.cA[0] + 9, y: g.cA[1], side: 'R' },
                        { id: 'mi', text: 'a mitochondrion', x: 62 - 7.8, y: 128 - 4.5, side: 'L' }, { id: 'nl', text: 'nucleolus', x: C1[0] + 27, y: C1[1] + 46, side: 'R' });
    if (k === 1) it.push({ id: 'l', text: 'each chromosome: two sister chromatids', x: s0[0], y: s0[1], side: 'L' }, { id: 'cs', text: 'two centrosomes', x: g.cB[0] + 9, y: g.cB[1], side: 'R' },
                        { id: 'nm', text: 'nuclear membrane', x: C1[0] + 74, y: C1[1], side: 'R' });
    if (k === 2) it.push({ id: 'l', text: 'sister chromatids, long and thin', x: s0[0], y: s0[1], side: 'L' }, { id: 'cs', text: 'two centrosomes, beside the nucleus', x: g.cB[0] + 9, y: g.cB[1], side: 'R' });
    if (k === 3 && g.x.length) {
      it.push({ id: 'x', text: 'two sister chromatids, joined at the centromere', x: g.x[0].cen[0] - 4.4, y: g.x[0].cen[1], side: 'L' }, { id: 'cs', text: 'a centrosome, moving to a pole', x: g.cB[0] + 9, y: g.cB[1], side: 'R' });
      if (t >= 21.8 && t < 29) it.push({ id: 'h', text: 'enlarged: DNA wound round histones', x: 2, y: 26, side: 'L' });
    }
    if (k === 4) { it.push({ id: 'v', text: 'the nuclear membrane, in vesicles', x: g.ves[0] - 3, y: g.ves[1], side: 'L' }); if (g.mtA && g.mtA[3]) it.push({ id: 'm', text: 'microtubules attach to the centromeres', x: lerp(g.cA[0], g.mtA[3][0], .4), y: lerp(g.cA[1], g.mtA[3][1], .4), side: 'R' }); }
    if (k === 5) { it.push({ id: 'eq', text: 'the equator', x: 30, y: C1[1], side: 'L' }); if (g.mtA && g.mtA[3]) it.push({ id: 'm', text: 'microtubules from both poles', x: lerp(g.cA[0], g.mtA[3][0], .5), y: lerp(g.cA[1], g.mtA[3][1], .5), side: 'R' }); }
    if (k === 6 && g.v.length) it.push({ id: 'v', text: 'a chromatid, centromere first', x: g.v[0][0] - 4.4, y: g.v[0][1], side: 'L' }, { id: 'p', text: 'a pole: a centrosome', x: g.cA[0] + 9, y: g.cA[1], side: 'R' });
    if (k === 7 && t >= 54.6) { it.push({ id: 'nm', text: 'a new nuclear membrane', x: C1[0] - 62, y: 140, side: 'L' }); if (t >= 58.4) it.push({ id: 'nl', text: 'nucleolus', x: C1[0] + 23, y: 350, side: 'R' }); }
    if (k === 8) {
      if (g.cell.w > 6) it.push({ id: 'r', text: 'ring of actin and myosin', x: C1[0] - g.cell.w - 3.6, y: g.cell.m, side: 'L' });
      it.push({ id: 'cm', text: 'cell membrane', x: C1[0] + g.cellRx, y: g.cellTop, side: 'R' }, { id: 'mi', text: 'mitochondria, shared', x: 236 + 8.5, y: 336 - 3, side: 'R' });
    }
    return it;
  }
  function mitIBPills(t) {
    var ph = ['interphase: G1', 'interphase: S', 'interphase: G2', 'prophase', 'prophase', 'metaphase', 'anaphase', 'telophase', 'cytokinesis'];
    var n = ['4 (2n), one chromatid each', '4, two chromatids each', '4, two chromatids each', '4, two chromatids each', '4, two chromatids each', '4, two chromatids each',
             '8: 4 moving to each pole', '4 in each new nucleus', '4 in each cell (2n)'];
    var k = stepOf(MM, t); return [ph[k], n[k]];
  }
  function mitosisIB(spec) {
    return widget(spec, 'Mitosis in detail (IB)', 'An animal cell with four chromosomes goes through G1, S, G2, prophase, metaphase, anaphase, telophase and cytokinesis.',
      MS, MM, W1, H1, mitIB, mitIBLabels, mitIBPills, [
        ['Key: orange, a chromosome from the mother; blue, from the father; the yellow band, a gene; grey lines, spindle microtubules; the small L, the two centrioles of a centrosome; green ovals, mitochondria; violet beads, histones; red dots, the ring of actin and myosin. Four chromosomes are drawn; a human cell has 46.'],
        ['IB Biology guide: D2.1.2 cytokinesis, D2.1.5 replication, D2.1.6 condensation and movement, D2.1.7 the phases, D2.1.13–D2.1.14 the cell cycle and growth in interphase (HL), A2.2.8 centrioles, B2.2.6 the nuclear membrane in vesicles (HL). Beyond IB: kinetochores, the nucleolus, the word centrosome. In a plant cell there are no centrioles, and vesicles build a new membrane and cell wall across the middle instead of a ring.', 'widget__note--ext']
      ]);
  }

  /* ============================================================ meiosis, IB ============================================================ */
  var ES = [
    { t: 0,  h: 'Interphase: G1', p: 'A diploid cell in a testis or an ovary: 4 chromosomes, 2 **homologous pairs**. Each chromosome is **one chromatid**, a single thin line. There is one **centrosome**.' },
    { t: 7,  h: 'Interphase: S and G2', p: 'The DNA is **replicated**: each chromosome is now **two sister chromatids**. The centrosome doubles. (D2.1.5)' },
    { t: 14, h: 'Prophase I: the pairs', p: 'Inside the nucleus the chromosomes **condense**. The two chromosomes of each **homologous pair** lie side by side, gene beside gene: a **bivalent** (the pairing is synapsis: beyond IB).' },
    { t: 23, h: 'Prophase I: crossing over', p: '**Crossing over**: one chromatid of each homologue, two **non-sister chromatids**, break where they touch and exchange the same length (the place is a chiasma: beyond IB). Then the **nuclear membrane** breaks into vesicles, and the centrosomes at the poles make the **spindle**. (D2.1.11)' },
    { t: 33, h: 'Metaphase I', p: 'The **bivalents** are arranged on the **equator**. Which homologue faces which pole is chance, for each pair separately: **random orientation**. With 2 pairs there are 4 kinds of cell; with 23 pairs, 2²³ (about 8 million). (D2.1.11)' },
    { t: 40, h: 'Anaphase I', p: 'The **homologous chromosomes separate**: one of each pair moves to each pole, the **first round of segregation**. The sister chromatids stay joined. (D2.1.9)' },
    { t: 47, h: 'Telophase I and cytokinesis', p: 'Two cells, each **haploid**: one chromosome of each pair, still two chromatids. Each cell has one centrosome. There is **no replication** before the second division.' },
    { t: 55, h: 'Prophase II', p: 'In each cell the centrosome doubles, and the two move to opposite sides: a new **spindle** forms at **right angles** to the first.' },
    { t: 61, h: 'Metaphase II', p: 'In each cell the chromosomes are arranged on the **equator**. Each centromere is held by microtubules from both poles.' },
    { t: 67, h: 'Anaphase II', p: 'The centromeres divide, and the **sister chromatids separate** to opposite poles, centromere first: the **second round of segregation**. (D2.1.9)' },
    { t: 74, h: 'Telophase II and cytokinesis', p: '**Four haploid cells**, each with one chromosome of each pair, now one chromatid. **Crossing over** and **random orientation** make them **all genetically different**. (D2.1.11)' }
  ];
  var EM = [0, 7, 14, 23, 33, 40, 47, 55, 61, 67, 74, 84];
  var W2 = 320, H2 = 480, C2 = [160, 240], QT = 72, QB = 408, TY = 126, BY = 354, TX = .64;
  /* pair A (long): the mother's homologue faces the top pole; pair B (short): the father's does (random orientation) */
  var PR = [{ A: true, up: 'mum', dn: 'dad', x0: 120, y0: 230, r0: 80, x: 104 }, { A: false, up: 'dad', dn: 'mum', x0: 210, y0: 252, r0: 100, x: 218 }];
  var EA_PATH = [[148, 132], [160, QT]], EB_PATH = [[172, 132], [240, 132], [282, 200], [282, 290], [160, QB]];
  /* where each chromosome stands in metaphase II (A above B, on the vertical equator of its cell), and its final rod */
  function m2y(i, yC) { return yC + (i ? 34 : -30); }
  function plen(p) { return p.A ? LA2 : LB2; }
  function meiIB(t, g) {
    var out = '';
    var c1 = ease(seg(t, 47.4, 53)), c2 = ease(seg(t, 74.4, 80));
    var ty = lerp(C2[1], TY, c1), by = lerp(C2[1], BY, c1);
    g.cells = [];
    if (t < 74.4) {
      var P1 = pinch(C2[0], ty, by, 144, lerp(214, 108, c1), false);
      out += P1.svg + (t >= 47.4 && t < 53.4 ? ring(P1, C2[0], false) : ''); g.P1 = P1;
    } else {
      [TY, BY].forEach(function (yC) {
        var P2 = pinch(yC, lerp(C2[0], 90, c2), lerp(C2[0], 230, c2), lerp(144, 66, c2), lerp(108, 100, c2), true);
        out += P2.svg + ring(P2, yC, true); g.cells.push(P2);
      });
    }
    /* the nucleus: whole through the pairing and the crossing over, then vesicles that scatter and fade */
    var brk = seg(t, 27.4, 31);
    if (t < 34.5) out += membrane(C2[0], C2[1], 100, 88, brk, 1 - seg(t, 32.5, 34.5));
    g.ves = vesicleAt(C2[0], C2[1], 100, 88, brk, 0);
    out += nucleolus(C2[0] + 24, C2[1] + 60, 1 - seg(t, 14.4, 17));
    out += threads(C2[0], C2[1], 1.5, 1 - seg(t, 14.4, 15.6), ease(seg(t, 7.4, 10)));
    /* telophase I: two faint nuclear membranes (interkinesis); in prophase II they go again */
    var f1 = seg(t, 50, 53) * (1 - seg(t, 55.4, 57));
    if (f1 > .02) out += membrane(C2[0], TY, 108, 56, 0, f1 * .6) + membrane(C2[0], BY, 108, 56, 0, f1 * .6);
    /* telophase II: four nuclei, from vesicles */
    var nf = seg(t, 75, 78.6);
    if (t >= 75) [[90, TY], [230, TY], [90, BY], [230, BY]].forEach(function (q) { out += membrane(q[0], q[1], 40, 36, 1 - nf, seg(t, 75, 76)); });
    /* the centrosomes */
    var dup = ease(seg(t, 8, 12)), go = ease(seg(t, 23.4, 29.4)), cs;
    if (t < 47.4) cs = go > 0 ? [along(EA_PATH, go), along(EB_PATH, go)] : [[lerp(160, 148, dup), 132], [lerp(160, 172, dup), 132]];
    else if (t < 55.4) cs = [[C2[0], lerp(QT, 54, c1)], [C2[0], lerp(QB, 426, c1)]];
    else {
      var d2 = ease(seg(t, 55.4, 56.4)), mv = ease(seg(t, 57, 60.6));
      cs = [];
      [[54, TY, -1], [426, BY, 1]].forEach(function (q) {
        var yE = q[0], yC = q[1], s = q[2];
        cs.push(along([[C2[0] - 10 * d2, yE], [66, yE - 6 * s], [44, yC]], mv), along([[C2[0] + 10 * d2, yE], [254, yE - 6 * s], [276, yC]], mv));
      });
    }
    /* telophase II: each centrosome to its cell's corner, beside the new nucleus, never in it */
    if (t >= 74.4 && cs.length === 4) {
      var tq = ease(seg(t, 74.4, 78));
      cs = cs.map(function (c, q) { var to = [q % 2 ? 260 : 60, q < 2 ? TY - 52 : BY + 52]; return [lerp(c[0], to[0], tq), lerp(c[1], to[1], tq)]; });
    }
    g.cs = cs;
    var cond = ease(seg(t, 14.4, 18)), pair = ease(seg(t, 17, 21)), xo = ease(seg(t, 24, 27)), line = ease(seg(t, 33.4, 38)), a1 = ease(seg(t, 40.4, 45));
    var rot2 = ease(seg(t, 55.4, 59)), m2 = ease(seg(t, 61.4, 65)), a2 = ease(seg(t, 67.4, 72)), flip2 = ease(seg(t, 68, 70.5)), tel = ease(seg(t, 74.4, 78)), rod = seg(t, 77, 79);
    var kTop = [], kBot = [], kL = [[], []], kR = [[], []], body = '';
    g.pr = [];
    /* prophase I to metaphase II: the chromosomes as crosses */
    if (t >= 14.4 && t < 67.4) {
      PR.forEach(function (p, i) {
        var len = plen(p) * lerp(.55, 1, cond), gap = lerp(32, 15, pair), sp = lerp(lerp(1, .2, pair), 1, a1);
        var bx = lerp(p.x0, p.x, line), byy = lerp(p.y0, C2[1], line);
        var yu = lerp(byy - gap, TY, a1), yd = lerp(byy + gap, BY, a1);
        var rot = lerp(p.r0, 90, pair);
        var xu = bx, xd = bx;
        if (t >= 55.4) { rot = lerp(90, 0, rot2); xu = xd = lerp(p.x, C2[0], m2); yu = lerp(TY, m2y(i, TY), m2); yd = lerp(BY, m2y(i, BY), m2); }
        var tu = i === 0 && t >= 24 ? [null, TX] : null, td = i === 0 && t >= 24 ? [TX, null] : null;
        body += ch({ x: xu, y: yu, len: len, A: p.A, who: p.up, copies: 2, spread: sp, rot: rot, tail: tu, w: CW2 });
        body += ch({ x: xd, y: yd, len: len, A: p.A, who: p.dn, copies: 2, spread: sp, rot: rot, tail: td, w: CW2 });
        /* the exchange, as it happens: the old colours fade from the exchanged lengths */
        if (i === 0 && t >= 24 && xo < 1) body += '<g' + op(1 - xo) + '>' + ch({ x: xu, y: yu, len: len, A: p.A, who: p.up, copies: 2, spread: sp, rot: rot, w: CW2 }) + ch({ x: xd, y: yd, len: len, A: p.A, who: p.dn, copies: 2, spread: sp, rot: rot, w: CW2 }) + '</g>';
        /* the chiasma: where the two non-sister chromatids cross, from crossing over until anaphase I */
        var chi = i === 0 ? xo * (1 - seg(t, 40.4, 41.4)) : 0;
        var xc = bx - (TX - .5) * len, lat = offOf(sp, CW2) + (TX - CEN) * len * Math.sin(24 * sp * Math.PI / 180), yT = yu + lat, yB = yd - lat;
        if (chi > .02) body += '<g' + op(chi) + '>' + path([[xc + 6, yT], [xc - 6, yB]], p.up, 5.5) + path([[xc + 6, yB], [xc - 6, yT]], p.dn, 5.5) +
          '<circle class="chiasma" cx="' + n1(xc) + '" cy="' + n1((yu + yd) / 2) + '" r="14"/></g>';
        var cu = cenOf(xu, yu, len, rot), cd = cenOf(xd, yd, len, rot);
        if (t < 55.4) { kTop.push([cu[0], cu[1] - offOf(sp, CW2) - CW2 / 2]); kBot.push([cd[0], cd[1] + offOf(sp, CW2) + CW2 / 2]); }
        else { kL[0].push([cu[0] - KT2, cu[1]]); kR[0].push([cu[0] + KT2, cu[1]]); kL[1].push([cd[0] - KT2, cd[1]]); kR[1].push([cd[0] + KT2, cd[1]]); }
        g.pr.push({ x: bx, y: byy, yu: yu, yd: yd, xu: xu, len: len, rot: rot, xc: xc, chi: chi, cu: cu });
      });
    }
    /* anaphase II and telophase II: each chromatid a V, centromere first, to its own pole; then a single rod in its nucleus */
    g.v = [];
    if (t >= 67.4) {
      PR.forEach(function (p, i) {
        [[TY, p.up, 0], [BY, p.dn, 1]].forEach(function (c) {
          var yC = c[0], len = plen(p), y0 = m2y(i, yC), j = c[2];
          var vL = copyAt(C2[0], y0, len, 0, -1, 1, CW2), vR = copyAt(C2[0], y0, len, 0, 1, 1, CW2);
          /* the top homologue's second chromatid and the bottom homologue's first crossed over (pair A) */
          var tl = i === 0 && j === 1 ? TX : null, tr = i === 0 && j === 0 ? TX : null;
          var xL = lerp(vL[0], 68, a2), xR = lerp(vR[0], 252, a2), yv = vL[1];
          var fx = [90, 230], yF = yC, dx = i ? 12 : -12, sc = lerp(1, .6, tel);
          xL = lerp(xL, fx[0] + dx, tel); xR = lerp(xR, fx[1] + dx, tel); yv = lerp(yv, yF - (.5 - CEN) * len * .6, tel);
          var opn = lerp(lerp(114, 26, flip2), 10, tel), rL = lerp(-90, 0, tel), rR = lerp(90, 0, tel);
          if (rod < 1) {
            body += vee({ x: xL, y: yv, len: len * sc, A: p.A, who: c[1], rot: rL, open: -opn, tail: tl, op: 1 - rod, w: CW2 });
            body += vee({ x: xR, y: yv, len: len * sc, A: p.A, who: c[1], rot: rR, open: opn, tail: tr, op: 1 - rod, w: CW2 });
          }
          if (rod > 0) {
            body += ch({ x: fx[0] + dx, y: yF, len: len * .6, A: p.A, who: c[1], tail: tl, op: rod, w: CW2 });
            body += ch({ x: fx[1] + dx, y: yF, len: len * .6, A: p.A, who: c[1], tail: tr, op: rod, w: CW2 });
          }
          kL[j].push([xL, yv]); kR[j].push([xR, yv]);
          g.v.push({ i: i, j: j, xL: xL, xR: xR, y: yv });
        });
      });
    }
    /* the spindles: meiosis I, vertical; meiosis II, two at right angles to it */
    var s1 = seg(t, 21.5, 23) * (1 - seg(t, 45.4, 47.4)), grow1 = seg(t, 29.4, 31), at1 = seg(t, 31, 34);
    if (s1 > .02) {
      var tA = [], tB = [];
      if (grow1 > 0) {
        kTop.forEach(function (k) { tA.push([k[0], lerp(lerp(QT + 12, QT + 30, grow1), k[1], at1)]); });
        kBot.forEach(function (k) { tB.push([k[0], lerp(lerp(QB - 12, QB - 30, grow1), k[1], at1)]); });
      }
      var pol = seg(t, 31, 35);
      if (pol > 0) { tA.push([lerp(160, 154, pol), lerp(QT + 40, 268, pol)], [lerp(160, 168, pol), lerp(QT + 40, 268, pol)]); tB.push([lerp(160, 152, pol), lerp(QB - 40, 212, pol)], [lerp(160, 166, pol), lerp(QB - 40, 212, pol)]); }
      out += mt(cs[0], tA, s1, true) + mt(cs[1], tB, s1, true);
      g.mt1 = tA;
    }
    out += eqline(26, C2[1], 294, C2[1], seg(t, 33.4, 35) * (1 - seg(t, 40.4, 42)));
    var s2 = seg(t, 56, 57.5) * (1 - seg(t, 72.4, 74.4)), at2 = seg(t, 61.4, 62.8);
    if (s2 > .02 && cs.length === 4) {
      [0, 1].forEach(function (j) {
        var gl = t >= 61.4 ? kL[j].map(function (k) { return [lerp(cs[j * 2][0], k[0], at2), lerp(cs[j * 2][1], k[1], at2)]; }) : [];
        var gr = t >= 61.4 ? kR[j].map(function (k) { return [lerp(cs[j * 2 + 1][0], k[0], at2), lerp(cs[j * 2 + 1][1], k[1], at2)]; }) : [];
        out += mt(cs[j * 2], gl, s2, true) + mt(cs[j * 2 + 1], gr, s2, true);
        var yC = j ? BY : TY;
        out += eqline(C2[0], yC - 82, C2[0], yC + 82, seg(t, 61.4, 63) * (1 - seg(t, 67.4, 69)));
      });
    }
    /* the crosses come out of the threads as they condense */
    out += t < 16 ? '<g' + op(Math.min(1, seg(t, 14.4, 15.6) * 1.5)) + '>' + body + '</g>' : body;
    cs.forEach(function (c) { out += centrosome(c); });
    return out;
  }
  function meiIBLabels(t, g) {
    var k = stepOf(EM, t), it = [], s0 = threadStart(C2[0], C2[1], 1.5), A = g.pr[0], B = g.pr[1];
    if (k === 0) it.push({ id: 'l', text: 'a chromosome: one chromatid, a single line', x: s0[0], y: s0[1], side: 'L' }, { id: 'cs', text: 'centrosome', x: g.cs[0][0] + 9, y: g.cs[0][1], side: 'R' },
                        { id: 'nl', text: 'nucleolus', x: C2[0] + 31, y: C2[1] + 60, side: 'R' });
    if (k === 1) it.push({ id: 'l', text: 'each chromosome: two sister chromatids', x: s0[0], y: s0[1], side: 'L' }, { id: 'cs', text: 'two centrosomes', x: g.cs[1][0] + 9, y: g.cs[1][1], side: 'R' });
    if (k === 2 && A) it.push({ id: 'bv', text: 'a bivalent: a homologous pair', x: A.x - A.len / 2 - 2, y: A.y, side: 'L' }, { id: 'nm', text: 'the nucleus, still whole', x: C2[0] + 100, y: C2[1], side: 'R' });
    if (k === 3 && A) {
      if (A.chi > .3) it.push({ id: 'ch', text: 'a chiasma: crossing over', x: A.xc - 14, y: A.y, side: 'L' });
      if (t >= 27.8) it.push({ id: 'v', text: 'the nuclear membrane, in vesicles', x: g.ves[0] + 3, y: g.ves[1], side: 'R' });
      else it.push({ id: 'cs', text: 'a centrosome, moving to a pole', x: g.cs[1][0] + 9, y: g.cs[1][1], side: 'R' });
    }
    if (k === 4 && B) it.push({ id: 'eq', text: 'bivalents on the equator', x: 26, y: C2[1], side: 'L' }, { id: 'ro', text: 'each pair turned either way, by chance', x: B.x + B.len / 2 + 3, y: C2[1], side: 'R' });
    if (k === 5 && B) {
      it.push({ id: 'hs', text: 'homologues separate; chromatids stay joined', x: B.x + B.len / 2 + 3, y: B.yu, side: 'R' });
      if (g.mt1 && g.mt1[0]) it.push({ id: 'mt', text: 'microtubules pull on the centromeres', x: lerp(g.cs[0][0], g.mt1[0][0], .55), y: lerp(g.cs[0][1], g.mt1[0][1], .55), side: 'L' });
    }
    if (k === 6 && B) it.push({ id: 'h1', text: 'haploid: 2 chromosomes', x: B.x + B.len / 2 + 3, y: TY, side: 'R' }, { id: 'h2', text: 'haploid: 2 chromosomes', x: B.x + B.len / 2 + 3, y: BY, side: 'R' },
                             { id: 'cs', text: 'one centrosome in each cell', x: g.cs[0][0] - 9, y: g.cs[0][1], side: 'L' });
    if (k === 7 && t >= 57.5) it.push({ id: 'sp', text: 'a new spindle, at right angles', x: g.cs[0][0] - 9, y: g.cs[0][1], side: 'L' });
    if (k === 8 && A) it.push({ id: 'eq', text: 'the equator of the second division', x: C2[0], y: TY - 82, side: 'R' }, { id: 'x', text: 'a chromosome: two chromatids', x: A.cu[0] - 7, y: A.cu[1], side: 'L' });
    if (k === 9 && g.v[0]) it.push({ id: 'sc', text: 'sister chromatids separate, centromere first', x: g.v[0].xL - 5.5, y: g.v[0].y, side: 'L' });
    if (k === 10) {
      it.push({ id: 'g1', text: 'four haploid cells, all different', x: 230 + 66, y: BY, side: 'R' });
      if (t >= 78) it.push({ id: 'rc', text: 'a chromatid that crossed over', x: 218 + 5, y: TY + 13, side: 'R' });
    }
    return it;
  }
  function meiIBPills(t) {
    var ph = ['interphase: G1', 'interphase: S, G2', 'prophase I', 'prophase I', 'metaphase I', 'anaphase I', 'telophase I', 'prophase II', 'metaphase II', 'anaphase II', 'telophase II'];
    var n = ['4 (2n), one chromatid each', '4, two chromatids each', '4, as 2 bivalents', '4, as 2 bivalents', '4, as 2 bivalents', '2 moving to each pole',
             '2 in each cell (n), two chromatids each', '2 in each cell (n)', '2 in each cell (n)', '4 in each cell: 2 moving to each pole', '2 in each of 4 cells (n), one chromatid each'];
    var k = stepOf(EM, t); return [ph[k], n[k]];
  }
  function meiosisIB(spec) {
    return widget(spec, 'Meiosis in detail (IB)', 'An animal cell with two homologous pairs goes through both divisions of meiosis, with crossing over and random orientation, to four haploid cells.',
      ES, EM, W2, H2, meiIB, meiIBLabels, meiIBPills, [
        ['Key: orange, a chromosome from the mother; blue, from the father (a chromatid of two colours has crossed over: drawn in the long pair only); the yellow band, a gene; grey lines, spindle microtubules; the small L, the centrioles of a centrosome; the dashed ring, a chiasma; the dashed line, the equator; red dots, the ring of actin and myosin.'],
        ['IB Biology guide: D2.1.5 replication, D2.1.6 condensation and movement, D2.1.9 meiosis as a reduction division (two rounds of segregation), D2.1.11 random orientation and crossing over, D2.1.2 cytokinesis. Beyond IB: synapsis, chiasma. In an ovary the cytoplasm divides unequally: one large egg cell and small polar bodies (D2.1.3). At fertilisation two haploid gametes make a diploid zygote again (D2.1.9). If a pair fails to separate (non-disjunction), a gamete has one chromosome too many or too few: Down syndrome comes from an extra chromosome 21 (D2.1.10).', 'widget__note--ext']
      ]);
  }

  /* pinch: the IGCSE level's cells divide with the same outline */
  global.InhDivideIB = { mitosis: mitosisIB, meiosis: meiosisIB, pinch: pinch };
})(window);
