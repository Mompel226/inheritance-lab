/* ============================================================
   w-divide-ib.js — the IB level of the two divisions (Daniel, 4 Nov 2026: "IB students … might want to cover this with
   IB content … all of the key terms, all of the other structures of the cell that participate, all of the different
   phases, shown very professionally"). Behind the IGCSE · IB switch of the mitosis and meiosis animations
   (js/w-divide.js): an IGCSE pupil who is curious sees the detail of IB. Each step names its IB Biology guide statement
   at the end of a sentence; a term the guide does not name is marked "beyond IB". The phases, their order and their
   timing were checked by an independent review (Opus, 4 Nov 2026); every fact it kept is kept here.

   ONE DRAWING AT BOTH LEVELS (Daniel, 5 Nov 2026: "standardize what you're showing … do not confuse students with
   different animations"). Rebuilt on 5 Nov 2026 on the IGCSE level's own cell: the same nucleus, the same four
   chromosomes in the same territories (InhDraw.FOUR), copied along their threads, coiled into the same crosses
   (InhDraw.coiled, the look of "From a cell to a gene"), lined up at the same places, pulled apart as the same V's, uncoiled
   into the same new nuclei. The IB level adds what IB names: the phases, the centrosomes (two centrioles at right angles,
   an L; IB A2.2.8), the spindle microtubules with asters and the polar ones that overlap at the equator, the nucleolus,
   mitochondria (mitosis), DNA wound round histones (an inset), the nuclear membrane breaking into vesicles (B2.2.6, HL),
   the ring of actin and myosin, and in meiosis the bivalents, crossing over and random orientation.

   mitosis, IB
     1 G1: each chromosome ONE chromatid, a single thin line; one centrosome; the cell grows (D2.1.13–D2.1.14, HL)
     2 S: the DNA is replicated along each thread: two sister chromatids; the centrosome doubles (D2.1.5)
     3 G2: the cell grows more (D2.1.14, HL)
     4 prophase: condensation, the chromatids coiling into crosses (an inset: DNA wound round histones); the nucleolus goes;
       the centrosomes move to the poles, round the nucleus, never through it; spindle microtubules grow outside the nucleus
     5 end of prophase: the nuclear membrane breaks into vesicles; microtubules attach to the centromeres
     6 metaphase: the chromosomes on the equator (a dashed line), each centromere held from both poles (D2.1.7)
     7 anaphase: the sister chromatids separate; each a V, its centromere first, the microtubules ending on it; the cell
       lengthens (D2.1.6–D2.1.7)
     8 telophase: membranes form from vesicles round each group; the chromosomes uncoil; nucleoli; the spindle goes
     9 cytokinesis: a ring of actin and myosin pinches the cell: two identical cells, each with a share of the mitochondria
   meiosis, IB
     1 G1: single lines; one centrosome      2 S and G2: sister chromatids, copied along each thread; the centrosome doubles
     3 prophase I: condensation; the homologues pair as bivalents, inside the whole nucleus (synapsis: beyond IB)
     4 prophase I: crossing over between non-sister chromatids at a chiasma (beyond IB), the exchange drawn as it
       happens; then the nuclear membrane breaks into vesicles and the spindle forms (D2.1.11)
     5 metaphase I: bivalents on the equator; random orientation (D2.1.11)
     6 anaphase I: the homologues separate, the first round of segregation (D2.1.9)
     7 telophase I and cytokinesis: two haploid cells, one centrosome each; no replication follows
     8 prophase II: the centrosome doubles; a new spindle at right angles to the first
     9 metaphase II: in each cell the chromosomes on the equator, each centromere held from both poles
    10 anaphase II: the sister chromatids separate, each a V, its centromere first (D2.1.9)
    11 telophase II and cytokinesis: four haploid cells, all different (D2.1.11); the chromatids uncoil into threads, a
       crossed-over one two colours along its length, so the pupil can see which cells had crossing over
   THE BIOLOGY, every frame: the two chromatids of one chromosome identical, except where crossing over exchanged the
   same length (non-sister chromatids, prophase I only); a gene band at its own place, whatever size the chromosome is
   drawn (identity, never length); homologues from different parents; the right number of chromosomes, counted by
   centromeres, in every frame (the pills say it); nothing drawn crosses the outline it is in, and no centrosome enters a
   nucleus (tools/bounds.mjs). A name stands only on a part at rest, on its own side of the picture.
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, K = global.WKit, D = global.InhDraw; if (!L || !K || !D || !D.coiled) return;
  var n1 = K.n1, seg = K.seg, ease = K.ease, lerp = K.lerp, mix = D.mix;
  /* the same chromosomes as the IGCSE level (js/w-divide.js) */
  var SZ = { LA: 66, LB: 39, w: 10, wd: 1.6 };
  function nuc(cx, cy, rx, ry) { return { cx: cx, cy: cy, rx: rx, ry: ry }; }
  /* names wrap a little inside their column: the kit counts a letter as .55 of the font, and words of wide letters
     ("one chromosome:", "centrosomes") ran a few pixels past the picture's edge at 1280–1440 (the audit, G2-13) */
  function wrapIn(lay) { return Object.assign({}, lay, { mL: lay.mL - 12, mR: lay.mR - 12 }); }
  function terr(lay, nu) { return D.terr(lay, nu, SZ); }
  function chrom(T, ph, k, o) { return D.coiled(T, ph, k, SZ.wd, Object.assign({ band: T.band, join: true }, o || {})); }
  function op(v) { return v >= 1 ? '' : ' opacity="' + n1(Math.max(0, v) * 100) / 100 + '"'; }
  function thr(T, ph) { return D.resample(D.territory(T, ph), 300); }
  function leftOf(P) { return P.reduce(function (a, p) { return p[0] < a[0] ? p : a; }); }
  function rightOf(P) { return P.reduce(function (a, p) { return p[0] > a[0] ? p : a; }); }
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
  /* a centrosome: two centrioles at right angles (an L), in a pale disc */
  function centrosome(p, o) {
    return '<g transform="translate(' + n1(p[0]) + ' ' + n1(p[1]) + ')"' + op(o == null ? 1 : o) + '>' +
      '<circle class="cent__pcm" r="9"/><rect class="cent" x="-5.6" y="-4.6" width="9" height="3.6" rx="1"/><rect class="cent" x="2.4" y="-1.6" width="3.6" height="8.4" rx="1"/></g>';
  }
  /* the nucleolus fades in a group: a CSS opacity on .nucleolus beats an attribute on the same element */
  function nucleolus(x, y, o) { return o <= .02 ? '' : '<g' + op(o) + '><circle class="nucleolus" cx="' + n1(x) + '" cy="' + n1(y) + '" r="7"/></g>'; }
  /* a mitochondrion; s (0…1): one that is still growing (G1: the cell makes more) */
  function mito(m, o, s) { s = s == null ? 1 : s; return s <= .02 ? '' : '<ellipse class="mito" cx="' + n1(m[0]) + '" cy="' + n1(m[1]) + '" rx="' + n1(9 * s) + '" ry="' + n1(4.6 * s) + '" transform="rotate(' + m[2] + ' ' + n1(m[0]) + ' ' + n1(m[1]) + ')"' + op(o == null ? 1 : o) + '/>'; }
  function ring(P, c, horiz) {
    if (P.w <= 3) return '';
    var a = horiz ? [P.m, c - P.w] : [c - P.w, P.m], b = horiz ? [P.m, c + P.w] : [c + P.w, P.m];
    return '<g class="cring"><circle cx="' + n1(a[0]) + '" cy="' + n1(a[1]) + '" r="3.6"/><circle cx="' + n1(b[0]) + '" cy="' + n1(b[1]) + '" r="3.6"/></g>';
  }
  function eqline(x0, y0, x1, y1, o) { return o <= .02 ? '' : '<path class="eqline" d="M' + n1(x0) + ' ' + n1(y0) + ' L' + n1(x1) + ' ' + n1(y1) + '"' + op(o) + '/>'; }
  /* a piece of the broken nuclear membrane (InhDraw.opening's pieces), for a name */
  function pieceAt(nu, i) { var a = (i + .5) * 2 * Math.PI / 22, d = 1.08; return [nu.cx + Math.cos(a) * nu.rx * d, nu.cy + Math.sin(a) * nu.ry * d]; }

  function widget(spec, title, aria, STEPS, M, W, H, render, labelsAt, pills, notes) {
    var S = K.shell(spec, 'dv', title, aria, [['ph', 'Phase:'], ['n', 'Chromosomes:']]);
    var svg = S.svg, NSV = K.NS, uid = 'dvb' + Math.random().toString(36).slice(2, 7);
    var defs = document.createElementNS(NSV, 'defs'), cp = document.createElementNS(NSV, 'clipPath'), cr = document.createElementNS(NSV, 'rect');
    cp.setAttribute('id', uid); cr.setAttribute('rx', 14); cp.appendChild(cr); defs.appendChild(cp); svg.appendChild(defs);
    var bg = document.createElementNS(NSV, 'rect'); bg.setAttribute('class', 'zm__bg'); svg.appendChild(bg);
    var model = document.createElementNS(NSV, 'g'); svg.appendChild(model);
    var gLab = document.createElementNS(NSV, 'g'); svg.appendChild(gLab);
    var lay = null, narrow = false, key = K.pinKey(S);
    var R = [0];
    /* each step lasts at least one second for every 2 words of its caption (120 words a minute) */
    STEPS.forEach(function (s, i) { var w = (s.h + ' ' + s.p).replace(/\*\*/g, '').split(/\s+/).length; R.push(R[i] + Math.max(M[i + 1] - M[i], w / 2)); });
    /* the motion runs 1.25 times faster than written, as at the IGCSE level */
    var P = 1.25, clock = K.readerClock(R, M, P);
    function draw(tt) {
      var t = clock(tt), ph = t * .5, g = {};
      model.innerHTML = '<g clip-path="url(#' + uid + ')">' + render(t, ph, g) + '</g>';
      var items = labelsAt(t, ph, g).map(function (q) { var p = lay.to(q.x, q.y); return { id: q.id, text: q.text, x: p[0], y: p[1], side: q.side }; });
      gLab.innerHTML = K.names(wrapIn(lay), items, narrow, key, null, 6);
      var pl = pills(t); S.pill('ph', pl[0], 'ok'); S.pill('n', pl[1], 'ok');
    }
    var sp = L.stepper({ steps: K.readerSteps(STEPS, R), end: R[R.length - 1], render: draw, flow: K.readerFlow(R, M, P) });
    /* under the drawing the key, drawn, and the guide's statements in one line (Daniel, 4 Nov 2026: "this text is extremely
       long. It distracts from … the step-by-step"; 5 Nov: "Why don't you show them instead of writing about them?") */
    var box = K.mount(S, sp, 'dv', notes, function (Dw, nar) {
      narrow = nar; var m = K.margins(nar, 15, 15, 90, 90);
      lay = K.frameOf(svg, bg, model, cr, { x0: 0, x1: W, y0: 0, y1: H }, false, Dw, m[0], m[1], m[2], m[3], 14.5);
    });
    return box;
  }
  function stepOf(M, t) { var k = 0; for (var i = 0; i < M.length - 1; i++) if (t >= M[i] - 1e-6) k = i; return k; }

  /* ============================================================ mitosis, IB ============================================================ */
  var MS = [
    { t: 0,  h: 'Interphase: G1', p: 'The cell grows. It makes proteins and more organelles, such as **mitochondria**. Each chromosome is **one chromatid**: a single long, thin line. There is one **centrosome**. (D2.1.13–D2.1.14, HL)' },
    { t: 7,  h: 'Interphase: S', p: 'The DNA is **replicated**: each chromosome is now **two sister chromatids**, still long and thin. The centrosome doubles. (D2.1.5)' },
    { t: 14, h: 'Interphase: G2', p: 'The cell grows more and makes the proteins it needs to divide. (D2.1.14, HL)' },
    { t: 20, h: 'Prophase', p: 'The chromosomes **condense**: the DNA, already wound round **histone** proteins, coils again and again (supercoiling). Each is now two sister chromatids, joined at the **centromere**. The **nucleolus** disappears. The centrosomes move round the nucleus to opposite poles, and **spindle microtubules** grow from them. (D2.1.6–D2.1.7)' },
    { t: 30, h: 'Prophase ends', p: 'The **nuclear membrane** breaks into small vesicles (B2.2.6, HL). **Microtubules** from both poles attach to each centromere (at its kinetochores: beyond IB).' },
    { t: 37, h: 'Metaphase', p: 'The chromosomes are arranged on the **equator** of the spindle. Each centromere is held by microtubules from both poles. (D2.1.7)' },
    { t: 44, h: 'Anaphase', p: 'The centromeres divide. The microtubules shorten, and **motor proteins** at each centromere pull its chromatid along them: the **sister chromatids** move to **opposite poles**, centromere first. Each chromatid is now a chromosome. The cell becomes longer. (D2.1.6–D2.1.7)' },
    { t: 53, h: 'Telophase', p: 'At each pole a **nuclear membrane** forms again round the chromosomes, from vesicles. The chromosomes **uncoil** and become long, thin lines again, and a nucleolus forms. The spindle disappears. (D2.1.7)' },
    { t: 60, h: 'Cytokinesis', p: 'A ring of **actin and myosin** pinches the cell membrane and divides the cytoplasm: two **genetically identical** daughter cells, each with 4 chromosomes and a share of the mitochondria. (D2.1.2)' }
  ];
  var MM = [0, 7, 14, 20, 30, 37, 44, 53, 60, 70];
  /* the IGCSE level's geometry (js/w-divide.js MI): the same cell, nucleus, line across the middle, poles and new nuclei */
  var W1 = 320, H1 = 480, NU1 = nuc(160, 236, 108, 112), PT = [160, 62], PB = [160, 418];
  var EQ = [[74, 240], [198, 240], [136, 240], [258, 240]], AX = [110, 172, 140, 204], AY = [96, 384];
  var D1 = nuc(160, 140, 86, 74), D2 = nuc(160, 340, 86, 74), TN = [nuc(157, 113, 70, 34), nuc(157, 367, 70, 34)];
  /* the centrosomes: above the nucleus; one to the top pole, the other round the right side of the nucleus to the bottom */
  var CA_PATH = [[148, 110], [154, 86], [160, 62]], CB_PATH = [[172, 110], [234, 122], [262, 150], [277, 200], [277, 236], [277, 272], [262, 322], [234, 350], [160, 418]];
  /* four mitochondria on the left (the centrosome passes on the right), shared two and two: as the cell lengthens in
     anaphase they move clear of where the new nuclei will form */
  var MITO_P = [[96, 104, 35], [130, 76, -10], [96, 380, -30], [132, 408, 10]], MITO_Q = [[61, 140, 80], [106, 74, -30], [61, 340, -80], [106, 406, 30]];
  function mitIB(t, ph, g) {
    var out = '', body = '';
    /* the cell grows about a tenth in G1 and G2 (the audit, 5 Nov 2026: what the text says is drawn) */
    var grow = seg(t, .5, 6.5) + seg(t, 14.4, 19), el = ease(seg(t, 44.4, 50)), cy = ease(seg(t, 63.6, 69));
    var rx = lerp(122 + 6 * grow - 6 * el, 128, cy), ry = lerp(178 + 9 * grow + 8 * el, 108, cy);
    var P = D.pinch(160, lerp(240, 128, cy), lerp(240, 352, cy), rx, ry, false);
    out += P.svg + (t >= 60.4 ? '<g' + op(seg(t, 60.4, 61.2)) + '>' + ring(P, 160, false) + '</g>' : '');
    g.cell = P; g.rx = rx; g.top = lerp(240, 128, cy);
    var mv = ease(seg(t, 44.4, 50));
    g.mito = MITO_P.map(function (m, i) { var q = MITO_Q[i], p = mix(m, q, mv); return [p[0], p[1], lerp(m[2], q[2], mv)]; });
    /* two mitochondria at first; in G1 the cell makes two more; each daughter cell receives two */
    var made = ease(seg(t, 1.5, 5.5));
    g.mito.forEach(function (m, i) { out += mito(m, 1, i === 1 || i === 3 ? made : 1); });
    /* the nucleus: whole, then vesicles (end of prophase), which stay, faint, until telophase; then they gather round each
       set of chromatids and close into a nuclear membrane close round them, which grows as they uncoil (InhDraw.nuclei,
       as at the IGCSE level); nucleoli */
    var mb = D.nuclei(t, NU1, TN, [D1, D2], { brk: [30.4, 34], dim: [35.5, 38], gat: [53, 54.8], close: [54.8, 56.6], grow: [55.2, 60] }, false);
    out += mb.svg + nucleolus(166, 240, 1 - seg(t, 21, 24));
    mb.cur.forEach(function (d) { out += nucleolus(d.cx + 4, d.cy + 2, seg(t, 57.6, 60)); });
    /* the chromosomes: threads (G1), copied along their length (S), coiled into crosses in their territories (prophase),
       to the equator (metaphase), pulled apart (anaphase), uncoiled in the new nuclei (telophase) */
    var T0 = terr(D.FOUR, NU1), T1 = terr(D.FOUR, mb.cur[0]), T2 = terr(D.FOUR, mb.cur[1]);
    var cp = ease(seg(t, 7.4, 13.4)), co = ease(seg(t, 20.4, 26.4)), mid = ease(seg(t, 37.4, 42)), part = ease(seg(t, 44.4, 50)), un = seg(t, 55.2, 60);
    var top = [], bot = [];
    g.T0 = T0; g.x = []; g.v = [];
    T0.forEach(function (T, i) {
      if (t < 7.4) body += chrom(T, ph, -1);
      else if (t < 20.4) body += chrom(T, ph, 0, { copy: cp });
      else if (t < 44.4) {
        var Tm = D.at(T, mix(T.c, EQ[i], mid), lerp(T.x, 90, mid));
        body += chrom(T, ph, co, { cross: Tm });
        top.push(D.crossRod(Tm, 0).p0); bot.push(D.crossRod(Tm, 1).p0); g.x.push(Tm);
      } else {
        var V = D.veePair(T, D.at(T, EQ[i], 90), [AX[i], AY[0]], [AX[i], AY[1]], part, false);
        if (t < 55.2) body += chrom(T, ph, 1, { rods: function (c) { return V[c]; }, split: true });
        else body += D.uncoil(T1[i], ph, un, SZ.wd, V[0], { band: T.band }) + D.uncoil(T2[i], ph, un, SZ.wd, V[1], { band: T.band });
        top.push(V[0].p0); bot.push(V[1].p0); g.v.push(V);
      }
    });
    /* the centrosomes: one; two (S); round the nucleus to the poles (prophase); a little further apart as the cell lengthens */
    var two = ease(seg(t, 8, 12)), go = ease(seg(t, 21, 27));
    var cA = go > 0 ? along(CA_PATH, go) : [lerp(160, 148, two), 110], cB = go > 0 ? along(CB_PATH, go) : [lerp(160, 172, two), 110];
    if (t >= 44.4) { cA = [160, lerp(62, 54, el)]; cB = [160, lerp(418, 426, el)]; }
    g.cA = cA; g.cB = cB;
    /* the spindle: asters from prophase; microtubules grow outside the nucleus, attach when it breaks, end on the moving
       centromeres, and go in telophase. Polar microtubules overlap at the equator from metaphase */
    var gone = 1 - seg(t, 52.4, 54.4), aster = seg(t, 21, 22.5) * gone, spn = seg(t, 27, 28.5) * gone, att = seg(t, 30.4, 35);
    if (aster > .02) {
      var tA = [], tB = [];
      if (spn > .02) {
        top.forEach(function (p) { tA.push(t < 44.4 ? [p[0], lerp(cA[1] + 30, p[1], att)] : p); });
        bot.forEach(function (p) { tB.push(t < 44.4 ? [p[0], lerp(cB[1] - 30, p[1], att)] : p); });
        var pol = seg(t, 30.4, 36);
        if (pol > 0) { tA.push([lerp(160, 152, pol), lerp(cA[1] + 40, 262, pol)], [lerp(160, 168, pol), lerp(cA[1] + 40, 262, pol)]); tB.push([lerp(160, 148, pol), lerp(cB[1] - 40, 218, pol)], [lerp(160, 164, pol), lerp(cB[1] - 40, 218, pol)]); }
      }
      out += D.fibres(cA, tA, aster, true) + D.fibres(cB, tB, aster, true);
      g.mtA = tA;
    }
    out += eqline(30, 240, 290, 240, seg(t, 37.4, 39) * (1 - seg(t, 44.4, 46)));
    out += body + centrosome(cA) + centrosome(cB);
    /* prophase: an inset, enlarged — DNA wound round histones */
    var ins = seg(t, 21, 23) * (1 - seg(t, 30.2, 31));
    if (ins > .02) {
      var b = '<g' + op(ins) + '><rect class="inset" x="2" y="2" width="80" height="48" rx="8"/>';
      for (var k = 0; k < 4; k++) b += '<circle class="zm__hist" cx="' + (15 + k * 18) + '" cy="26" r="6"/>';
      b += '<path class="zm__dna" stroke-width="2.4" d="M5 26 C9 14 21 14 21 26 C21 38 33 38 33 26 C33 14 45 14 45 26 C45 38 57 38 57 26 C57 14 69 14 69 26 L79 26"/>';
      /* where the inset is from: a ring on one arm of the mother's long chromosome, two lines to the inset */
      var hp = D.rodAt(D.crossRod(g.x[0] || D.at(terr(D.FOUR, NU1)[0], terr(D.FOUR, NU1)[0].c, 15), 0), .2);
      b += '<circle class="zm__box" cx="' + n1(hp[0]) + '" cy="' + n1(hp[1]) + '" r="7"/><path class="zm__line" d="M82 26 L' + n1(hp[0] - 6) + ' ' + n1(hp[1] - 4) + ' M60 50 L' + n1(hp[0] - 4) + ' ' + n1(hp[1] + 6) + '"/></g>';
      out += b;
    }
    return out;
  }
  function mitIBLabels(t, ph, g) {
    var k = stepOf(MM, t), it = [], T0 = g.T0, l0 = leftOf(thr(T0[0], ph));
    if (k === 0) it.push({ id: 'l', text: 'a chromosome: one chromatid, a single line', x: l0[0], y: l0[1], side: 'L' }, { id: 'cs', text: 'a centrosome (beyond IB): two centrioles', x: g.cB[0] + 9, y: g.cB[1], side: 'R' },
                        { id: 'mi', text: 'a mitochondrion', x: g.mito[0][0] - 7.5, y: g.mito[0][1] - 4.5, side: 'L' }, { id: 'nl', text: 'the nucleolus (beyond IB)', x: 173, y: 240, side: 'R' });
    if (k === 1 && t >= 13.4) it.push({ id: 'l', text: 'each chromosome: two sister chromatids', x: l0[0], y: l0[1], side: 'L' }, { id: 'cs', text: 'two centrosomes', x: g.cB[0] + 9, y: g.cB[1], side: 'R' },
                        { id: 'nm', text: 'nuclear membrane', x: NU1.cx + NU1.rx * Math.cos(.35), y: NU1.cy + NU1.ry * Math.sin(.35), side: 'R' });
    if (k === 2 && t >= 19) it.push({ id: 'l', text: 'sister chromatids, long and thin', x: l0[0], y: l0[1], side: 'L' }, { id: 'cs', text: 'two centrosomes, beside the nucleus', x: g.cB[0] + 9, y: g.cB[1], side: 'R' });
    if (k === 3 && t >= 27) {
      var xl = leftOf([D.crossRod(T0[0], 0).top, D.crossRod(T0[0], 0).bot, D.crossRod(T0[0], 1).top, D.crossRod(T0[0], 1).bot]);
      it.push({ id: 'x', text: 'two sister chromatids, joined at the centromere', x: xl[0], y: xl[1], side: 'L' }, { id: 'cs', text: 'a centrosome, at a pole', x: g.cB[0] + 9, y: g.cB[1], side: 'R' },
              { id: 'h', text: 'enlarged: DNA wound round histones', x: 2, y: 26, side: 'L' });
    }
    if (k === 4 && t >= 35) { var pc = pieceAt(NU1, 11); it.push({ id: 'v', text: 'the nuclear membrane, in vesicles', x: pc[0], y: pc[1], side: 'L' }); if (g.mtA && g.mtA[3]) it.push({ id: 'm', text: 'microtubules attach to the centromeres', x: lerp(g.cA[0], g.mtA[3][0], .45), y: lerp(g.cA[1], g.mtA[3][1], .45), side: 'R' }); }
    if (k === 5 && t >= 42) { it.push({ id: 'eq', text: 'the equator', x: 30, y: 240, side: 'L' }); if (g.mtA && g.mtA[3]) it.push({ id: 'm', text: 'microtubules from both poles', x: lerp(g.cA[0], g.mtA[3][0], .5), y: lerp(g.cA[1], g.mtA[3][1], .5), side: 'R' }); }
    if (k === 6 && t >= 50 && g.v.length) { var v = g.v[0][0], ve = leftOf([v.top, v.bot]); it.push({ id: 'v', text: 'a chromatid, centromere first', x: ve[0], y: ve[1], side: 'L' }, { id: 'p', text: 'a pole: a centrosome', x: g.cA[0] + 9, y: g.cA[1], side: 'R' }); }
    if (k === 7 && t >= 59.6) it.push({ id: 'nm', text: 'a new nuclear membrane', x: D1.cx - D1.rx, y: D1.cy, side: 'L' }, { id: 'nl', text: 'the nucleolus (beyond IB)', x: D2.cx + 11, y: D2.cy + 2, side: 'R' });
    if (k === 8) {
      /* the ring is named only while it holds still, before it pinches the cell */
      if (t >= 61.2 && t < 63.6) it.push({ id: 'r', text: 'a ring of actin and myosin', x: 160 - g.cell.w - 3.6, y: g.cell.m, side: 'L' });
      if (t >= 69) it.push({ id: 'cm', text: 'cell membrane', x: 160 + g.rx, y: g.top, side: 'R' }, { id: 'mi', text: 'a mitochondrion: each cell gets some', x: g.mito[0][0] - 7.5, y: g.mito[0][1], side: 'L' });
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
        { key: [['mum', 'from the mother'], ['dad', 'from the father'], ['gene', 'a gene'], ['cent', 'centrioles'], ['mito', 'mitochondria'],
                ['fibre', 'spindle microtubules', [3, 4, 5, 6]], ['dna', 'DNA', [3]], ['hist', 'histones', [3]], ['vesicle', 'nuclear membrane vesicles', [4, 5, 6]], ['cring', 'the actin–myosin ring', [8]]] },
        ['IB guide: D2.1.2, D2.1.5–D2.1.7, D2.1.13–D2.1.14 (HL), A2.2.8, B2.2.6 (HL).', 'widget__note--ib']
      ]);
  }

  /* ============================================================ meiosis, IB ============================================================ */
  var ES = [
    { t: 0,  h: 'Interphase: G1', p: 'A diploid cell in a testis or an ovary: 4 chromosomes, 2 **homologous pairs**. Each chromosome is **one chromatid**, a single thin line. There is one **centrosome**.' },
    { t: 7,  h: 'Interphase: S and G2', p: 'The DNA is **replicated**: each chromosome is now **two sister chromatids**. The centrosome doubles. (D2.1.5)' },
    { t: 14, h: 'Prophase I: the pairs', p: 'Inside the nucleus the chromosomes **condense**. The two chromosomes of each **homologous pair** lie side by side, gene beside gene: a **bivalent** (the pairing is synapsis: beyond IB).' },
    { t: 23, h: 'Prophase I: crossing over', p: '**Crossing over**: one chromatid of each homologue, two **non-sister chromatids**, break where they touch and exchange the same length (the place is a chiasma: beyond IB). Each of these two chromatids now has a length from the other homologue. (D2.1.11)' },
    { t: 30, h: 'Prophase I ends', p: 'The centrosomes move to the poles. The **nuclear membrane** breaks into vesicles, and the centrosomes make the **spindle**: microtubules attach to the centromeres. (D2.1.6; B2.2.6, HL)' },
    { t: 33, h: 'Metaphase I', p: 'The **bivalents** are arranged on the **equator**. Which homologue faces which pole is chance, for each pair separately: **random orientation**. With 2 pairs there are 4 combinations; with 23 pairs, 2²³ (about 8 million). (D2.1.11)' },
    { t: 40, h: 'Anaphase I', p: 'The **homologous chromosomes separate**: one of each pair moves to each pole, the **first round of segregation**. The sister chromatids stay joined. (D2.1.9)' },
    { t: 47, h: 'Telophase I and cytokinesis', p: 'Two cells, each **haploid**: one chromosome of each pair, still two chromatids. Each cell has one centrosome. A nuclear membrane forms round each set. There is **no replication** before the second division.' },
    { t: 55, h: 'Prophase II', p: 'In each cell the centrosome doubles, and the two move to opposite sides: a new **spindle** forms at **right angles** to the first. The nuclear membrane breaks into vesicles again.' },
    { t: 61, h: 'Metaphase II', p: 'In each cell the chromosomes are arranged on the **equator**. Each centromere is held by microtubules from both poles.' },
    { t: 67, h: 'Anaphase II', p: 'The centromeres divide, and the **sister chromatids separate** to opposite poles, centromere first: the **second round of segregation**. (D2.1.9)' },
    { t: 74, h: 'Telophase II and cytokinesis', p: '**Four haploid cells**, each with one chromosome of each pair, now one chromatid. **Crossing over** and **random orientation** make them **all genetically different**. (D2.1.11)' }
  ];
  var EM = [0, 7, 14, 23, 30, 37, 44, 51, 59, 65, 71, 78, 88];
  /* the IGCSE level's geometry (js/w-divide.js ME) */
  var W2 = 320, H2 = 500, NU2 = nuc(160, 246, 108, 112), QT = [160, 72], QB = [160, 428], YC = [134, 366], XC = [92, 228], TX = .64;
  /* prophase I: each pair side by side inside the nucleus; metaphase I: on the equator. Am above Ad (pair A), Bd above Bm (pair
     B): which faces which pole is chance (random orientation); Ad and Bm bow round each other on the way */
  var BIV = [[112, 214], [112, 258], [212, 258], [212, 214]], MET = [[100, 218], [100, 262], [216, 262], [216, 218]], UP = [true, false, false, true], BOW = [0, -20, 34, 0];
  var EA_PATH = [[148, 118], [154, 96], [160, 72]], EB_PATH = [[172, 118], [242, 130], [266, 160], [278, 210], [278, 246], [278, 282], [266, 332], [242, 362], [160, 428]];
  function gnuc(j, yC) { return nuc(XC[j], yC, 50, 72); }
  function meiIB(t, ph, g) {
    var out = '', body = '';
    var c1 = ease(seg(t, 51.4, 57)), c2 = ease(seg(t, 78.4, 84));
    g.cells = [];
    if (t < 78.4) {
      var P1 = D.pinch(160, lerp(250, 134, c1), lerp(250, 366, c1), lerp(134, 128, c1), lerp(196, 112, c1), false);
      out += P1.svg + (t >= 51.4 && t < 57.4 ? ring(P1, 160, false) : ''); g.P1 = P1;
    } else {
      YC.forEach(function (yC) {
        var P2 = D.pinch(yC, lerp(160, 92, c2), lerp(160, 228, c2), lerp(128, 66, c2), lerp(112, 100, c2), true);
        out += P2.svg + ring(P2, yC, true); g.cells.push(P2);
      });
    }
    /* the nucleus: whole through the pairing and the crossing over, then vesicles that scatter and fade */
    var brk = seg(t, 31.6, 34), nO = 1 - seg(t, 35.2, 37.4);
    if (nO > .02) out += D.opening(NU2.cx, NU2.cy, NU2.rx, NU2.ry, 18, brk, nO);
    out += nucleolus(166, 250, 1 - seg(t, 14.4, 17));
    /* telophase I: two faint nuclear membranes (interkinesis); in prophase II they go again */
    /* telophase I: a nuclear membrane forms round each set, from vesicles; in prophase II it breaks into vesicles again */
    YC.forEach(function (yC) {
      if (t >= 53.4 && t < 59.4) out += D.opening(160, yC, 100, 50, 14, 1 - seg(t, 53.4, 56.4), seg(t, 53.4, 54));
      else if (t >= 59.4) out += D.opening(160, yC, 100, 50, 14, seg(t, 59.4, 61.4), 1 - seg(t, 61.8, 62.8));
    });
    /* telophase II: four nuclei, from vesicles */
    var nf = seg(t, 83, 86), nA = seg(t, 83, 83.8);
    if (nA > .02) YC.forEach(function (yC) { [0, 1].forEach(function (j) { var d = gnuc(j, yC); out += D.opening(d.cx, d.cy, d.rx, d.ry, 12, 1 - nf, nA); }); });
    var no = seg(t, 86, 87.6);
    if (no > .02) YC.forEach(function (yC) { [0, 1].forEach(function (j) { var d = gnuc(j, yC); out += nucleolus(d.cx + 14, d.cy + 4, no); }); });
    /* the centrosomes */
    var dup = ease(seg(t, 8, 12)), go = ease(seg(t, 30.4, 33.6)), cs;
    if (t < 51.4) cs = go > 0 ? [along(EA_PATH, go), along(EB_PATH, go)] : [[lerp(160, 148, dup), 118], [lerp(160, 172, dup), 118]];
    else if (t < 59.4) cs = [[160, lerp(72, 60, c1)], [160, lerp(428, 440, c1)]];
    else {
      /* prophase II: each doubles, and the two go to the sides of their cell, round the chromosomes */
      var d2 = ease(seg(t, 59.4, 60.4)), mv = ease(seg(t, 61, 64.6));
      cs = [];
      [[60, YC[0], -1], [440, YC[1], 1]].forEach(function (q) {
        var yE = q[0], yC = q[1], s = q[2];
        cs.push(along([[160 - 10 * d2, yE], [86, yE - 16 * s], [50, yC]], mv), along([[160 + 10 * d2, yE], [234, yE - 16 * s], [270, yC]], mv));
      });
    }
    /* telophase II: each centrosome to its cell's corner, beside the new nucleus, never in it */
    if (t >= 78.4 && cs.length === 4) {
      var tq = c2;
      /* inside each new cell, beyond the end of its nucleus (the audit: the corners crossed the membrane) */
      cs = cs.map(function (c, q) { var to = [XC[q % 2], q < 2 ? YC[0] - 86 : YC[1] + 86]; return [lerp(c[0], to[0], tq), lerp(c[1], to[1], tq)]; });
    }
    g.cs = cs;
    /* the chromosomes */
    var T0 = terr(D.FOUR, NU2), cp = ease(seg(t, 7.4, 13)), co = ease(seg(t, 14.4, 19)), pr = ease(seg(t, 19, 22.6)), xo = ease(seg(t, 23.6, 27.6));
    var line = ease(seg(t, 37.4, 42)), a1 = ease(seg(t, 44.4, 49)), r2 = ease(seg(t, 59.4, 63)), m2 = ease(seg(t, 65.4, 69)), a2 = ease(seg(t, 71.4, 76)), un = seg(t, 84, 87.6);
    var kTop = [], kBot = [], kL = [[], []], kR = [[], []];
    g.T0 = T0; g.x = []; g.v = [];
    /* crossing over (pair A): the top homologue's lower chromatid and the bottom homologue's upper one, from TX to the end */
    function tails(i) { return i === 0 && t >= 23.6 ? [null, TX] : i === 1 && t >= 23.6 ? [TX, null] : null; }
    T0.forEach(function (T, i) {
      if (t < 7.4) { body += chrom(T, ph, -1); return; }
      if (t < 14.4) { body += chrom(T, ph, 0, { copy: cp }); return; }
      var up = UP[i], yC = up ? YC[0] : YC[1], j = up ? 0 : 1;
      if (t < 71.4) {
        var c = mix(T.c, BIV[i], pr); c = [c[0], c[1] + BOW[i] * Math.sin(Math.PI * pr)];
        var x = lerp(T.x, 90, pr);
        c = mix(c, MET[i], line);
        c = [c[0], lerp(c[1], yC, a1)];
        if (t >= 59.4) { x = lerp(90, 0, r2); c = mix(c, [160, yC + (T.A ? -26 : 30)], m2); }
        var Tm = D.at(T, c, x), tl = tails(i);
        body += chrom(T, ph, co, { cross: Tm, tail: tl });
        /* the exchange, as it happens: the old colours fade from the exchanged lengths */
        if (tl && xo < 1) body += '<g' + op(1 - xo) + '>' + chrom(T, ph, co, { cross: Tm }) + '</g>';
        var cu = D.crossRod(Tm, 0).cen;
        if (t < 59.4) (up ? kTop : kBot).push(cu);
        else { kL[j].push(D.crossRod(Tm, 0).p0); kR[j].push(D.crossRod(Tm, 1).p0); }
        g.x.push(Tm);
      } else {
        var y = yC + (T.A ? -26 : 30), tl2 = tails(i) || [null, null];
        var V = D.veePair(T, D.at(T, [160, y], 0), [96, y], [224, y], a2, true);
        var Tg = [terr(D.TWO(T.who, T.who), gnuc(0, yC))[T.A ? 0 : 1], terr(D.TWO(T.who, T.who), gnuc(1, yC))[T.A ? 0 : 1]];
        if (t < 84) body += chrom(T, ph, 1, { rods: function (q) { return V[q]; }, split: true, tail: tl2 });
        else body += D.uncoil(Tg[0], ph, un, SZ.wd, V[0], { band: T.band, tail: tl2[0] }) + D.uncoil(Tg[1], ph, un, SZ.wd, V[1], { band: T.band, tail: tl2[1] });
        kL[j].push(V[0].p0); kR[j].push(V[1].p0);
        g.v.push({ i: i, j: j, V: V });
      }
    });
    /* the chiasma: where the two non-sister chromatids cross, from crossing over until anaphase I */
    var chi = t >= 23.6 && t < 45.4 ? xo * (1 - seg(t, 44.4, 45.4)) : 0;
    if (chi > .02 && g.x.length > 1) {
      var pu = D.rodAt(D.crossRod(g.x[0], 1), TX), pd = D.rodAt(D.crossRod(g.x[1], 0), TX), m = mix(pu, pd, .5);
      body += '<circle class="chiasma" cx="' + n1(m[0]) + '" cy="' + n1(m[1]) + '" r="14"' + op(chi) + '/>';
      g.chi = m;
    }
    /* the spindles: meiosis I, vertical; meiosis II, two at right angles to it */
    var s1 = seg(t, 30.4, 31.6) * (1 - seg(t, 51.4, 53.4)), grow1 = seg(t, 33.8, 35.2), at1 = seg(t, 35.2, 36.8);
    if (s1 > .02) {
      var tA = [], tB = [];
      if (grow1 > 0) {
        kTop.forEach(function (k) { tA.push([k[0], lerp(lerp(cs[0][1] + 12, cs[0][1] + 30, grow1), k[1], at1)]); });
        kBot.forEach(function (k) { tB.push([k[0], lerp(lerp(cs[1][1] - 12, cs[1][1] - 30, grow1), k[1], at1)]); });
        if (t >= 44.4) { tA = kTop.slice(); tB = kBot.slice(); }
      }
      var pol = seg(t, 35.2, 37.6) * (1 - seg(t, 44.4, 46));
      if (pol > 0) { tA.push([lerp(160, 154, pol), lerp(cs[0][1] + 40, 270, pol)], [lerp(160, 168, pol), lerp(cs[0][1] + 40, 270, pol)]); tB.push([lerp(160, 152, pol), lerp(cs[1][1] - 40, 230, pol)], [lerp(160, 166, pol), lerp(cs[1][1] - 40, 230, pol)]); }
      out += D.fibres(cs[0], tA, s1, true) + D.fibres(cs[1], tB, s1, true);
      g.mt1 = tA;
    }
    out += eqline(26, 240, 294, 240, seg(t, 37.4, 39) * (1 - seg(t, 44.4, 46)));
    var s2 = seg(t, 60, 61.5) * (1 - seg(t, 76.4, 78.4)), at2 = ease(seg(t, 65.4, 66.8)), sg2 = ease(seg(t, 61.5, 64.6));
    if (s2 > .02 && cs.length === 4) {
      [0, 1].forEach(function (j) {
        /* prophase II: the new spindle grows part of the way; metaphase II: it reaches each centromere */
        var gl = kL[j].map(function (k) { return mix(cs[j * 2], k, lerp(.4 * sg2, 1, at2)); }), gr = kR[j].map(function (k) { return mix(cs[j * 2 + 1], k, lerp(.4 * sg2, 1, at2)); });
        if (j === 0) g.mt2 = gl;
        out += D.fibres(cs[j * 2], gl, s2, true) + D.fibres(cs[j * 2 + 1], gr, s2, true);
        var yC = YC[j];
        out += eqline(160, yC - 92, 160, yC + 92, seg(t, 65.4, 67) * (1 - seg(t, 71.4, 73)));
      });
    }
    out += body;
    cs.forEach(function (c) { out += centrosome(c); });
    return out;
  }
  function meiIBLabels(t, ph, g) {
    var k = stepOf(EM, t), it = [], T0 = g.T0, l0 = leftOf(thr(T0[0], ph)), A = g.x[0], B = g.x[3];
    function endsOf(Tm) { return [D.crossRod(Tm, 0).top, D.crossRod(Tm, 0).bot, D.crossRod(Tm, 1).top, D.crossRod(Tm, 1).bot]; }
    if (k === 0) it.push({ id: 'l', text: 'a chromosome: one chromatid, a single line', x: l0[0], y: l0[1], side: 'L' }, { id: 'cs', text: 'a centrosome (beyond IB): two centrioles', x: g.cs[1][0] + 9, y: g.cs[1][1], side: 'R' },
                        { id: 'nl', text: 'the nucleolus (beyond IB)', x: 173, y: 250, side: 'R' });
    if (k === 1 && t >= 13) it.push({ id: 'l', text: 'each chromosome: two sister chromatids', x: l0[0], y: l0[1], side: 'L' }, { id: 'cs', text: 'two centrosomes', x: g.cs[1][0] + 9, y: g.cs[1][1], side: 'R' });
    if (k === 2 && t >= 22.6 && A) { var a = leftOf(endsOf(A).concat(endsOf(g.x[1]))); it.push({ id: 'bv', text: 'a bivalent: a homologous pair', x: a[0], y: a[1], side: 'L' }, { id: 'nm', text: 'the nucleus, still whole', x: NU2.cx + NU2.rx * Math.cos(.4), y: NU2.cy + NU2.ry * Math.sin(.4), side: 'R' }); }
    if (k === 3 && t >= 27.6 && g.chi) it.push({ id: 'ch', text: 'crossing over (the place: a chiasma, beyond IB)', x: g.chi[0] - 14, y: g.chi[1], side: 'L' }, { id: 'nm', text: 'the nucleus, still whole', x: NU2.cx + NU2.rx * Math.cos(.4), y: NU2.cy + NU2.ry * Math.sin(.4), side: 'R' });
    if (k === 4 && t >= 36.8) { var pc = pieceAt(NU2, 0); it.push({ id: 'v', text: 'the nuclear membrane, in vesicles', x: pc[0], y: pc[1], side: 'R' }); if (g.mt1 && g.mt1[0]) it.push({ id: 'mt', text: 'microtubules from the poles', x: lerp(g.cs[0][0], g.mt1[0][0], .5), y: lerp(g.cs[0][1], g.mt1[0][1], .5), side: 'L' }); }
    if (k === 5 && t >= 42 && B) { var b = rightOf(endsOf(B).concat(endsOf(g.x[2]))); it.push({ id: 'eq', text: 'the equator', x: 26, y: 240, side: 'L' }, { id: 'ro', text: 'random orientation: which homologue faces which pole is chance', x: b[0], y: b[1], side: 'R' }); }
    if (k === 6 && t >= 49 && B) {
      var bu = rightOf(endsOf(B)); it.push({ id: 'hs', text: 'homologues separate; chromatids stay joined', x: bu[0], y: bu[1], side: 'R' });
      if (g.mt1 && g.mt1[0]) it.push({ id: 'mt', text: 'microtubules pull on the centromeres', x: lerp(g.cs[0][0], g.mt1[0][0], .55), y: lerp(g.cs[0][1], g.mt1[0][1], .55), side: 'L' });
    }
    if (k === 7 && t >= 57) it.push({ id: 'h1', text: 'haploid: 2\u00a0chromosomes', x: 288, y: YC[0], side: 'R' }, { id: 'h2', text: 'haploid: 2\u00a0chromosomes', x: 288, y: YC[1], side: 'R' },
                                     { id: 'cs', text: 'one centrosome in each cell', x: g.cs[0][0] - 9, y: g.cs[0][1], side: 'L' });
    if (k === 8 && t >= 64.6 && g.mt2 && g.mt2[0]) it.push({ id: 'sp', text: 'a new spindle, at right angles', x: lerp(g.cs[0][0], g.mt2[0][0], .5), y: lerp(g.cs[0][1], g.mt2[0][1], .5), side: 'L' });
    if (k === 9 && t >= 69 && A) { var ca = D.crossRod(A, 0).cen; it.push({ id: 'eq', text: 'the equator of the second division', x: 162, y: YC[0] - 92, side: 'R' }, { id: 'x', text: 'a chromosome: two chromatids', x: ca[0] - 7, y: ca[1], side: 'L' }); }
    if (k === 10 && t >= 76 && g.v[0]) { var v = g.v[0].V[0]; it.push({ id: 'sc', text: 'sister chromatids separate, centromere first', x: v.p0[0] - 5, y: v.p0[1], side: 'L' }); }
    if (k === 11 && t >= 87.6) {
      it.push({ id: 'g1', text: 'a haploid cell: all four differ', x: 294, y: YC[1], side: 'R' });
      var Tc = terr(D.TWO('mum', 'dad'), gnuc(1, YC[0]))[0], P = thr(Tc, ph), q = P[Math.round(.9 * 299)];
      it.push({ id: 'rc', text: 'a chromosome with a crossed-over length', x: q[0], y: q[1], side: 'R' });
    }
    return it;
  }
  function meiIBPills(t) {
    var ph = ['interphase: G1', 'interphase: S, G2', 'prophase I', 'prophase I', 'prophase I', 'metaphase I', 'anaphase I', 'telophase I', 'prophase II', 'metaphase II', 'anaphase II', 'telophase II'];
    var n = ['4 (2n), one chromatid each', '4, two chromatids each', '4, as 2 bivalents', '4, as 2 bivalents', '4, as 2 bivalents', '4, as 2 bivalents', '2 moving to each pole',
             '2 in each cell (n), two chromatids each', '2 in each cell (n)', '2 in each cell (n)', '4 in each cell: 2 moving to each pole', '2 in each of 4 cells (n), one chromatid each'];
    var k = stepOf(EM, t); return [ph[k], n[k]];
  }
  function meiosisIB(spec) {
    return widget(spec, 'Meiosis in detail (IB)', 'An animal cell with two homologous pairs goes through both divisions of meiosis, with crossing over and random orientation, to four haploid cells.',
      ES, EM, W2, H2, meiIB, meiIBLabels, meiIBPills, [
        { key: [['mum', 'from the mother'], ['dad', 'from the father'], ['mix', 'crossed over', [3, 4, 5, 6, 7, 8, 9, 10, 11]], ['gene', 'a gene'], ['cent', 'centrioles'],
                ['chiasma', 'a chiasma', [3, 4, 5]], ['fibre', 'spindle microtubules', [4, 5, 6, 8, 9, 10]], ['vesicle', 'nuclear membrane vesicles', [4]],
                ['cring', 'the actin–myosin ring', [11]]] },
        ['IB guide: D2.1.2, D2.1.5, D2.1.6, D2.1.9, D2.1.11.', 'widget__note--ib']
      ]);
  }

  /* pinch: kept for anything that still asks for it here (the outline is InhDraw.pinch) */
  global.InhDivideIB = { mitosis: mitosisIB, meiosis: meiosisIB, pinch: D.pinch };
})(window);
