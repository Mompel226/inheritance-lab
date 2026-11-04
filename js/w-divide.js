/* ============================================================
   w-divide.js — the two nuclear divisions, step by step (stations `mitosis` and `meiosis`). Each step waits for
   "Next step", with Play all beside it; the count of chromosomes in each nucleus is shown at every frame.

   One cell of 4 chromosomes is drawn: 2 pairs (a long pair and a short pair), one chromosome of each pair from the
   mother (orange) and one from the father (blue), keyed. A human cell has 23 pairs; the pills say what happens to 46.

   mitosis (17.2.1, 17.2.3, 17.2.4)
     1 a body cell: 4 chromosomes, long thin threads in the nucleus
     2 before mitosis, each chromosome is copied exactly: still 4 chromosomes, each now two copies
     3 the chromosomes become short and thick, each as two copies joined; the membrane of the nucleus goes
     4 they are arranged across the middle of the cell
     5 the copies separate: one copy of every chromosome to each end, 4 at each end
     6 two nuclei, two daughter cells: each 4 chromosomes, the same as the parent cell: genetically identical
   meiosis (17.3.1, 17.3.2)
     1 a cell in a testis or an ovary: 4 chromosomes, 2 pairs: diploid
     2 copied, short and thick: 4 chromosomes, each two copies
     3 the chromosomes of each pair side by side; which one faces which end is chance (the pairs here face opposite ways)
     4 first division: the chromosomes of each pair separate: 2 cells, each with ONE of each pair: 2, haploid
     5 second division: the copies separate: 4 cells, each with 2 single chromosomes
     6 four gametes, each a haploid nucleus with one chromosome of each pair; here two kinds, and with 23 pairs, millions
     7 fertilisation: a gamete fuses with a gamete of another person (its chromosomes grey, keyed): a zygote of 4, 2 pairs
   THE BIOLOGY, every frame: the two copies of one chromosome are the same colour, length and gene band (a band by the
   chromosome it is on, never by the size it is drawn); interphase threads never cross (InhDraw.threads); the two
   chromosomes of a pair come from different parents; the number is right at every frame (4 → 4 + 4; 4 → 2 + 2 → four
   cells of 2 → a zygote of 4). Stage names, chromatids, spindle fibres and crossing over are IB (D2.1.6–D2.1.11):
   named in the extension notes only.
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, K = global.WKit, D = global.InhDraw, Sc = global.LabScenes; if (!L || !K || !D || !Sc) return;
  var n1 = K.n1, seg = K.seg, ease = K.ease, lerp = K.lerp;
  var LA = 58, LB = 34, CW = 8;                 /* the long and the short chromosome, and their width */
  var thr = Sc.thread;
  /* a chromosome of the long pair (A) or the short pair (B): its gene band at its own place, whatever size it is drawn */
  function ch(o) { return D.chromo(Object.assign({ w: CW, bands: o.A ? [.78] : [.85] }, o)); }
  /* the four chromosomes as threads, none crossing another (InhDraw.threads); dbl: each now two copies, side by side */
  function threads(cx, cy, s, op) { return '<g opacity="' + n1((op == null ? 1 : op) * 100) / 100 + '">' + D.threads(cx, cy, s, s, 0, 3) + '</g>'; }
  function dbl(cx, cy, s, op) { return '<g opacity="' + n1(op * 100) / 100 + '">' + D.threads(cx, cy, s, s, 1, 3) + '</g>'; }
  function pinch(c, a, b, rx, ry, horiz) { return global.InhDivideIB.pinch(c, a, b, rx, ry, horiz).svg; }
  function shell(spec, cls, title, aria, pl) { return K.shell(spec, cls, title, aria, pl || [['n', 'In each nucleus:'], ['hu', 'In a human:']]); }
  function widget(spec, cls, title, aria, STEPS, M, W, H, render, labelsAt, pills, notes, extra, pillNames) {
    var S = shell(spec, cls, title, aria, pillNames);
    var svg = S.svg, NSV = K.NS;
    var bg = document.createElementNS(NSV, 'rect'); bg.setAttribute('class', 'zm__bg'); svg.appendChild(bg);
    var model = document.createElementNS(NSV, 'g'); svg.appendChild(model);
    var gLab = document.createElementNS(NSV, 'g'); svg.appendChild(gLab);
    var cr = document.createElementNS(NSV, 'rect'), lay = null, narrow = false, key = K.pinKey(S);
    var R = [0];
    STEPS.forEach(function (s, i) { var w = (s.h + ' ' + s.p).replace(/\*\*/g, '').split(/\s+/).length; R.push(R[i] + Math.max(M[i + 1] - M[i], w / 2)); });
    var clock = K.readerClock(R, M);
    function draw(tt) {
      var t = clock(tt);
      model.innerHTML = render(t);
      var items = labelsAt(t).map(function (q) { var p = lay.to(q.x, q.y); return { id: q.id, text: q.text, x: p[0], y: p[1], side: q.side }; });
      gLab.innerHTML = K.names(lay, items, narrow, key, null, 6);
      var pl = pills(t); S.pill('n', pl[0], 'ok'); S.pill('hu', pl[1], 'ok');
    }
    var sp = L.stepper({ steps: K.readerSteps(STEPS, R), end: R[R.length - 1], render: draw });
    if (extra) extra(S, function () { sp.paint(sp.time()); });
    return K.mount(S, sp, cls, notes, function (Dw, nar) {
      narrow = nar; var m = K.margins(nar, 21, 21, 100, 100);
      lay = K.frameOf(svg, bg, model, cr, { x0: 0, x1: W, y0: 0, y1: H }, false, Dw, m[0], m[1], m[2], m[3], 14.5);
    });
  }

  /* ============================================================ mitosis ============================================================ */
  var MI = { STEPS: [
      { t: 0,  h: 'A working cell: lines', p: 'A body cell with **4 chromosomes**: 2 pairs, one of each pair from each parent. While the cell is working, each chromosome is **a single long, thin line**: one molecule of DNA.' },
      { t: 7,  h: 'Copied exactly', p: 'Before mitosis, **each chromosome is copied exactly**. There are still 4 chromosomes, but each is now **two identical copies**, joined at one point.' },
      { t: 14, h: 'Short and thick: the cross', p: 'The chromosomes become **short and thick**. Each is now the **cross** you see in photographs: **one chromosome**, its two copies joined. The membrane of the nucleus disappears.' },
      { t: 21, h: 'Across the middle', p: 'The chromosomes are arranged **across the middle** of the cell.' },
      { t: 28, h: 'The copies separate', p: 'The **two copies of each chromosome separate**: one copy goes to each end, and each copy is now a chromosome of its own: **a single rod**, not a cross. Each end receives a copy of **every** chromosome: 4.' },
      { t: 36, h: 'Two daughter cells', p: 'Two new nuclei form, and the cytoplasm divides. Each **daughter cell has the same 4 chromosomes** as the parent cell: they are **genetically identical**. Its chromosomes become long, thin lines again.' }
    ], M: [0, 7, 14, 21, 28, 36, 46] };
  var MW = 300, MH = 420, MC = [150, 210];
  /* the four chromosomes at the middle of the cell: x, the parent, the length */
  var EQ = [[52, 'mum', LA], [122, 'dad', LA], [182, 'mum', LB], [232, 'dad', LB]];
  function mitRender(t) {
    var out = '';
    var split = ease(seg(t, 36.4, 41));
    /* the cell: one, then pinched into two */
    out += pinch(MC[0], lerp(MC[1], 112, split), lerp(MC[1], 308, split), 128, lerp(176, 92, split), false);
    /* the two new nuclei, drawn before the chromosomes so they show inside them */
    if (t > 36.4) out += D.nucleus(MC[0], 112, 62, 44, split) + D.nucleus(MC[0], 308, 62, 44, split);
    var nuc = 1 - seg(t, 14.4, 17);
    if (t < 21) out += D.nucleus(MC[0], MC[1], 64, 56, nuc);
    if (t < 8) out += threads(MC[0], MC[1], 1.15, 1);
    else if (t < 14.4) out += dbl(MC[0], MC[1], 1.15, 1);
    else {
      /* short and thick: each chromosome two copies joined; then to the middle; then the copies part */
      var cond = ease(seg(t, 14.4, 18)), mid = ease(seg(t, 21.4, 26)), part = ease(seg(t, 28.4, 34));
      var START = [[96, 178, 'mum', LA, 20], [140, 236, 'dad', LA, -12], [184, 176, 'mum', LB, 34], [210, 232, 'dad', LB, -26]];
      EQ.forEach(function (q, i) {
        var s = START[i], x = lerp(s[0], q[0], mid), y = lerp(s[1], MC[1], mid), rot = lerp(s[4], 90, mid);
        if (t < 28.4) out += ch({ x: x, y: y, len: q[2] * lerp(.6, 1, cond), A: q[2] === LA, who: q[1], copies: 2, rot: rot, op: Math.max(.25, cond) });
        else {
          /* one copy up, one copy down: the same colour, length and band */
          /* to each end, drawing in towards the middle so every copy stays inside the cell as it narrows */
          var xs = lerp(x, [90, 124, 172, 204][i], part), rr = lerp(90, 0, part);
          var up = lerp(y - CW * .52, 136, part), dn = lerp(y + CW * .52, 284, part);
          /* step 6: into the new nucleus, smaller, then gone into the threads */
          var inn = ease(seg(t, 36.4, 40)), xx = lerp(xs, MC[0] + (xs - MC[0]) * .45, inn), sc = lerp(1, .55, inn), op = 1 - seg(t, 40, 43);
          up = lerp(up, 112, inn); dn = lerp(dn, 308, inn);
          if (op > .02) {
            out += ch({ x: xx, y: up, len: q[2] * sc, A: q[2] === LA, who: q[1], rot: rr, op: op });
            out += ch({ x: xx, y: dn, len: q[2] * sc, A: q[2] === LA, who: q[1], rot: rr, op: op });
          }
        }
      });
      if (t > 36.4) out += threads(MC[0], 112, .95, seg(t, 40, 43)) + threads(MC[0], 308, .95, seg(t, 40, 43));
    }
    return out;
  }
  function mitLabels(t) {
    var s0 = D.threadStart(MC[0], MC[1], 1.15);
    if (t < 14.4) return [{ id: 'nuc', text: 'nucleus', x: MC[0] + 64, y: MC[1], side: 'R' }, { id: 'ch', text: t < 8 ? 'each chromosome: a single line' : 'each chromosome: two copies', x: s0[0], y: s0[1], side: 'L' }];
    if (t < 28.4) return [{ id: 'ch', text: 'one chromosome: two copies joined, a cross', x: t < 21.4 ? 112 : EQ[0][0] - EQ[0][2] / 2, y: t < 21.4 ? 196 : MC[1], side: 'L' }, { id: 'cell', text: 'the cell', x: MC[0] + 128, y: MC[1] + 40, side: 'R' }];
    if (t < 36.4) { var pt = ease(seg(t, 28.4, 34)), ex = lerp(EQ[3][0], MC[0] + (EQ[3][0] - MC[0]) * .6, pt) + LB / 2;
      return [{ id: 'up', text: 'one copy of each: single rods', x: lerp(ex, 204 + 5, pt), y: lerp(MC[1], 136, pt), side: 'R' }, { id: 'dn', text: 'the other copy of each', x: lerp(ex, 204 + 5, pt), y: lerp(MC[1], 284, pt), side: 'R' }]; }
    return [{ id: 'd1', text: 'a daughter cell: 4', x: MC[0] + 124, y: 112, side: 'R' }, { id: 'd2', text: 'a daughter cell: 4', x: MC[0] + 124, y: 308, side: 'R' }];
  }
  function mitPills(t) {
    if (t < 7) return ['4 chromosomes', '46'];
    if (t < 28.4) return ['4 chromosomes, each two copies', '46, each two copies'];
    if (t < 36) return ['4 at each end', '46 at each end'];
    return ['4 in each daughter cell', '46 in each daughter cell'];
  }
  function mitosis(spec) {
    return widget(spec, 'dv', 'Mitosis, step by step', 'A cell with four chromosomes copies them, the copies separate, and two daughter cells each receive the same four.',
      MI.STEPS, MI.M, MW, MH, mitRender, mitLabels, mitPills, [
        ['Key: orange, a chromosome from the mother; blue, from the father; the yellow band, a gene: the same on both copies of a chromosome. Four chromosomes are drawn; a human body cell has 46.'],
        ['Extension: press IB for the phases of mitosis, the spindle and the centrosomes.', 'widget__note--ext']
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
  var ME = { STEPS: [
      { t: 0,  h: 'A cell that makes gametes', p: 'A cell in a **testis** or an **ovary**, with **4 chromosomes**: 2 pairs, one of each pair from each parent. Its nucleus is **diploid**.' },
      { t: 7,  h: 'Copied, then short and thick', p: 'Each chromosome is **copied**, and becomes short and thick: still 4 chromosomes, each two copies joined.' },
      { t: 14, h: 'The pairs side by side', p: 'The two chromosomes of **each pair** lie side by side. Which one faces which end of the cell is **chance**.' },
      { t: 21, h: 'First division: the pairs separate', p: 'The chromosomes of each pair **separate**, and the cell divides. Each new cell has **one chromosome of each pair**: 2. The number is **halved**.' },
      { t: 29, h: 'Second division: the copies separate', p: 'Each cell divides again: the **two copies** of each chromosome separate. There are **4 cells**, each with 2 chromosomes.' },
      { t: 37, h: 'Four haploid gametes', p: 'Four **haploid** gametes, each with one chromosome of each pair. Here they are of two kinds; with 23 pairs a person makes millions of kinds, so their gametes are **genetically different**.' },
      { t: 46, h: 'Fertilisation', p: 'At **fertilisation** a gamete fuses with a gamete of another person (grey). The **zygote** has 4 chromosomes again, 2 pairs: **diploid**.' }
    ], M: [0, 7, 14, 21, 29, 37, 46, 56] };
  var EW = 300, EH = 440, EC = [150, 200];
  /* the first division: which member of each pair goes up. Pair A: the mother's up; pair B: the father's up (chance) */
  var PAIRS = [{ x: 104, len: LA, A: true, up: 'mum', dn: 'dad' }, { x: 200, len: LB, A: false, up: 'dad', dn: 'mum' }];

  function meiRender(t) {
    var out = '';
    var d1 = ease(seg(t, 21.4, 27)), d2 = ease(seg(t, 29.4, 35)), fe = ease(seg(t, 46.4, 52));
    if (t < 46) {
      /* the cells: one → two (top, bottom) → four, each pinched in two */
      if (t < 29.4) out += pinch(EC[0], lerp(EC[1], 110, d1), lerp(EC[1], 300, d1), 130, lerp(170, 84, d1), false);
      else [110, 300].forEach(function (yC) { out += pinch(yC, lerp(EC[0], 84, d2), lerp(EC[0], 216, d2), lerp(130, 62, d2), lerp(84, 72, d2), true); });
      /* four gametes: each a haploid nucleus round its 2 chromosomes */
      if (t >= 37.4) [[84, 110], [216, 110], [84, 300], [216, 300]].forEach(function (q) { out += D.nucleus(q[0] + 1, q[1], 40, 44, seg(t, 37.4, 39)); });
    }
    if (t < 14) out += D.nucleus(EC[0], EC[1], 64, 56, 1 - seg(t, 10.4, 13));
    if (t < 8) out += threads(EC[0], EC[1], 1.15, 1);
    else if (t < 10.4) out += dbl(EC[0], EC[1], 1.15, 1);
    else if (t < 29.4) {
      var cond = ease(seg(t, 10.4, 13.6)), side = ease(seg(t, 14.4, 19));
      PAIRS.forEach(function (p, i) {
        var y0u = lerp(EC[1] - 34 + i * 10, EC[1] - 28, side), y0d = lerp(EC[1] + 38 - i * 10, EC[1] + 28, side);
        var x = lerp(EC[0] - 46 + i * 92, p.x, side), rot = lerp(i ? 30 : -20, 90, side);
        var yu = lerp(y0u, 110, d1), yd = lerp(y0d, 300, d1);
        out += ch({ x: x, y: yu, len: p.len * lerp(.6, 1, cond), A: p.A, who: p.up, copies: 2, rot: rot, op: Math.max(.3, cond) });
        out += ch({ x: x, y: yd, len: p.len * lerp(.6, 1, cond), A: p.A, who: p.dn, copies: 2, rot: rot, op: Math.max(.3, cond) });
      });
    } else if (t < 46.4) {
      /* the second division: in each cell, the two copies of each chromosome go left and right */
      PAIRS.forEach(function (p, i) {
        [[110, p.up], [300, p.dn]].forEach(function (c) {
          var yL = c[0] - CW * .52, yR = c[0] + CW * .52;
          var cxL = lerp(p.x, 84 + (i ? 14 : -12), d2), cxR = lerp(p.x, 216 + (i ? 14 : -12), d2);
          /* in the gametes, a little smaller, so each stands inside its nucleus */
          var sc = lerp(1, .8, seg(t, 37.4, 40));
          out += ch({ x: cxL, y: lerp(yL, c[0] + (i ? 10 : -10), d2), len: p.len * sc, A: p.A, who: c[1], rot: lerp(90, 0, d2) });
          out += ch({ x: cxR, y: lerp(yR, c[0] + (i ? 10 : -10), d2), len: p.len * sc, A: p.A, who: c[1], rot: lerp(90, 0, d2) });
        });
      });
    }
    if (t >= 46) {
      /* fertilisation: one gamete (the top left one) and a gamete of another person meet; a zygote of 4 */
      var gx = lerp(84, 130, fe), ox = lerp(250, 170, fe);
      out += D.cell(lerp(84, 150, fe), 200, lerp(62, 96, fe), lerp(72, 96, fe), 'cellb--zyg');
      if (fe < 1) out += D.cell(lerp(250, 150, fe), 200, lerp(56, 96, fe), lerp(64, 96, fe), 'cellb--other');
      /* the two gametes' nuclei fuse into the zygote's */
      var nm = 1 - seg(t, 50, 51.4), nz = seg(t, 50, 51.4);
      if (nm > .02) out += D.nucleus(gx + 1, 195, 40, 44, nm) + D.nucleus(ox + 1, 195, 36, 42, nm);
      if (nz > .02) out += D.nucleus(150, 196, 62, 50, nz);
      out += ch({ x: gx - 12, y: 190, len: LA * .8, A: true, who: PAIRS[0].up }) + ch({ x: gx + 14, y: 200, len: LB * .8, A: false, who: PAIRS[1].up });
      out += ch({ x: ox - 12, y: 190, len: LA * .8, A: true, who: 'mum', cls: 'chr--other' }) + ch({ x: ox + 14, y: 200, len: LB * .8, A: false, who: 'mum', cls: 'chr--other' });
    }
    return out;
  }
  function meiLabels(t) {
    var s0 = D.threadStart(EC[0], EC[1], 1.15);
    if (t < 10.4) return [{ id: 'nuc', text: 'a diploid nucleus', x: EC[0] + 64, y: EC[1], side: 'R' }, { id: 'l', text: t < 8 ? 'each chromosome: a single line' : 'each chromosome: two copies', x: s0[0], y: s0[1], side: 'L' }];
    if (t < 21.4) return t < 14.4 ? [{ id: 'ch', text: 'each chromosome: two copies, a cross', x: EC[0] - 40, y: EC[1] - 14, side: 'L' }]
                                  : [{ id: 'pa', text: 'a pair, side by side', x: PAIRS[0].x - LA / 2, y: EC[1], side: 'L' }, { id: 'pb', text: 'the other pair', x: PAIRS[1].x + LB / 2, y: EC[1], side: 'R' }];
    if (t < 29.4) return [{ id: 'c1', text: 'one of each pair: 2', x: EC[0] + 126, y: 110, side: 'R' }, { id: 'c2', text: 'one of each pair: 2', x: EC[0] + 126, y: 300, side: 'R' }];
    if (t < 46) return [{ id: 'g1', text: 'a gamete: 2', x: 278, y: 110, side: 'R' }, { id: 'g2', text: 'a gamete: 2', x: 278, y: 300, side: 'R' }, { id: 'g3', text: 'a gamete: 2', x: 22, y: 300, side: 'L' }];
    if (t > 51) return [{ id: 'z', text: 'the zygote: 4, 2 pairs', x: 246, y: 200, side: 'R' }];
    var fe = ease(seg(t, 46.4, 52));
    return [{ id: 'g', text: 'a gamete of this person', x: lerp(22, 54, fe), y: 200, side: 'L' }, { id: 'o', text: 'a gamete of another person', x: lerp(306, 246, fe), y: 200, side: 'R' }];
  }
  function meiPills(t) {
    if (t < 7) return ['4 chromosomes, 2 pairs (diploid)', '46: 23 pairs'];
    if (t < 21.4) return ['4 chromosomes, each two copies', '46, each two copies'];
    if (t < 29.4) return ['2 in each of 2 cells (haploid)', '23 in each cell'];
    if (t < 46) return ['2 in each of 4 cells', '23 in each gamete'];
    return ['the zygote: 4, 2 pairs (diploid)', '23 + 23 = 46'];
  }
  function meiosis(spec) {
    return widget(spec, 'dv', 'Meiosis, step by step', 'A cell with two pairs of chromosomes divides twice to give four gametes with one chromosome of each pair; two gametes then fuse.',
      ME.STEPS, ME.M, EW, EH, meiRender, meiLabels, meiPills, [
        ['Key: orange, a chromosome from the mother; blue, from the father; grey, from the other parent’s gamete; the yellow band, a gene. Four chromosomes are drawn; a human cell has 46.'],
        ['Extension: press IB for the phases of meiosis, with crossing over and random orientation.', 'widget__note--ext']
      ]);
  }
  L.add('meiosis', function (spec) { return levels(spec, meiosis, global.InhDivideIB.meiosis, 'Meiosis'); });

  /* ============================================================ a line or a cross? ============================================================
     Daniel, 4 Nov 2026: pupils "don't understand that when the cell is working, it's just a line, but when it's dividing,
     then it becomes a cross, and then the two chromatids are separated … that should be very, very clearly stated and
     shown". One chromosome, five steps, the number of copies of its DNA shown at every frame:
       1 a working cell: the chromosome is ONE long thin line (one molecule of DNA);
       2 before the cell divides it is copied: two identical lines, joined at one point;
       3 about to divide, it becomes short and thick: the cross (X) of photographs, still ONE chromosome, two copies;
       4 the copies separate: two single rods (not crosses, still short and thick), each a chromosome of its own;
       5 in the two new cells, each is a long thin line again among the cell's other chromosomes, and the cells work;
         before the next division it is copied again.
     The copies are called chromatids (IB D2.1.6; the 0610 syllabus says "copies"). */
  var LC = { STEPS: [
      { t: 0,  h: 'A working cell: a line', p: 'While a cell is working, each chromosome is **a single long, thin line**: one molecule of DNA. Here, one chromosome is lit.' },
      { t: 7,  h: 'Copied: two lines', p: 'Before the cell divides, the chromosome is **copied exactly**: two identical lines, **joined at one point**.' },
      { t: 14, h: 'About to divide: the cross', p: 'Just before it divides, the chromosome becomes **short and thick**. Its two copies now show as a **cross**: this is still **one chromosome**, made of two identical copies. Photographs of dividing cells show these crosses.' },
      { t: 22, h: 'The copies separate', p: 'The **two copies separate**. Each is now a chromosome of its own: **a single rod**, not a cross, still short and thick.' },
      { t: 30, h: 'Two working cells', p: 'In each new cell the chromosome becomes **long and thin** again, and the cell works. Before the next division it is copied again. A cross is seen only while a cell divides.' }
    ], M: [0, 7, 14, 22, 30, 40] };
  var LW = 300, LH = 300, LCX = 150, LCY = 150;
  var LINE = [[86, 146], [112, 124], [140, 162], [168, 128], [196, 160], [216, 142]];
  function lcRender(t) {
    var out = '', cond = ease(seg(t, 14.4, 19)), part = ease(seg(t, 22.4, 28)), two = ease(seg(t, 30.4, 35)), thin = seg(t, 33, 37);
    if (t < 30.4) out += D.cell(LCX, LCY, 140, 132);
    else { out += D.cell(lerp(LCX, 80, two), LCY, lerp(140, 70, two), lerp(132, 100, two)) + D.cell(lerp(LCX, 220, two), LCY, lerp(140, 70, two), lerp(132, 100, two)); }
    if (t < 17) out += D.nucleus(LCX, LCY, 100, 70, 1 - seg(t, 14.4, 17));
    if (t > 31) { out += D.nucleus(80, LCY, 48, 42, seg(t, 31, 33)) + D.nucleus(220, LCY, 48, 42, seg(t, 31, 33)); }
    /* the other chromosomes of the nucleus, faint, so this one reads as one of many */
    if (t < 15) out += '<g opacity="' + n1((1 - seg(t, 13, 15)) * 100) / 100 + '">' + thr([[96, 178], [128, 196], [166, 182], [204, 190]], 'faint', 2.4) + thr([[100, 108], [134, 98], [176, 104], [208, 118]], 'faint', 2.4) + '</g>';
    if (t < 7.4) out += thr(LINE, 'mum', 3.2);
    else if (t < 14.6) {
      var c = ease(seg(t, 7.4, 11));
      out += thr(LINE.map(function (p) { return [p[0], p[1] - 3.2 * c]; }), 'mum', 3) + thr(LINE.map(function (p) { return [p[0], p[1] + 3.2 * c]; }), 'mum', 3);
      if (c > .5) out += '<circle class="ch__cen ch--mum" cx="140" cy="160" r="4.4"/>';
    } else if (t < 22.4) {
      out += '<g opacity="' + n1((1 - seg(t, 14.4, 16)) * 100) / 100 + '">' + thr(LINE.map(function (p) { return [p[0], p[1] - 3.2]; }), 'mum', 3) + thr(LINE.map(function (p) { return [p[0], p[1] + 3.2]; }), 'mum', 3) + '</g>';
      out += ch({ x: LCX, y: LCY, len: lerp(30, 96, cond), w: lerp(5, 14, cond), who: 'mum', copies: 2, op: cond, bands: [.78] });
    } else {
      /* the two copies part: each one straight, a single line, going to its own end */
      var dx = lerp(18, 70, part) + (t > 30.4 ? 0 : 0);
      var fade = 1 - thin;
      [-1, 1].forEach(function (sd) {
        var x = LCX + sd * lerp(14, dx, Math.max(part, 0));
        if (t >= 30.4) x = lerp(LCX + sd * 70, LCX + sd * 70, 1);
        if (fade > .02) out += ch({ x: x, y: LCY, len: lerp(96, 80, part), w: 14, who: 'mum', rot: sd * lerp(24, 0, part), op: fade, bands: [.78] });
        if (thin > .02) out += '<g opacity="' + n1(thin * 100) / 100 + '">' + thr([[x - 36, LCY - 6], [x - 18, LCY + 12], [x, LCY - 10], [x + 18, LCY + 10], [x + 34, LCY - 4]], 'mum', 3) +
          /* the cell's other chromosomes, faint, as in the first step */
          '<g opacity=".35">' + thr([[x - 34, LCY - 24], [x - 10, LCY - 32], [x + 14, LCY - 24], [x + 30, LCY - 30]], 'faint', 2.4) + thr([[x - 30, LCY + 26], [x - 6, LCY + 32], [x + 18, LCY + 26], [x + 32, LCY + 20]], 'faint', 2.4) + '</g></g>';
      });
    }
    return out;
  }
  function lcLabels(t) {
    if (t < 7.4) return [{ id: 'l', text: 'one chromosome: a single line', x: 86, y: 146, side: 'L' }, { id: 'n', text: 'the nucleus of a working cell', x: 250, y: 150, side: 'R' }];
    if (t < 14.6) return [{ id: 'l', text: 'two identical copies, joined at one point', x: 86, y: 146 - 3.2, side: 'L' }];
    if (t < 22.4) return [{ id: 'x', text: 'one chromosome: two copies, a cross', x: LCX - 18, y: LCY - 30, side: 'L' }, { id: 'b', text: 'the same gene on both copies', x: LCX + 22, y: LCY + 26, side: 'R' }];
    if (t < 30.4) { var dx = lerp(18, 70, ease(seg(t, 22.4, 28))); return [{ id: 'a', text: 'a single rod, not a cross', x: LCX - dx - 8, y: LCY, side: 'L' }, { id: 'b2', text: 'a single rod', x: LCX + dx + 8, y: LCY, side: 'R' }]; }
    return [{ id: 'c1', text: 'a working cell: a line', x: 30, y: LCY, side: 'L' }, { id: 'c2', text: 'a working cell: a line', x: 270, y: LCY, side: 'R' }];
  }
  function lcPills(t) {
    if (t < 7.4) return ['1 copy of its DNA', 'the cell is working'];
    if (t < 14.6) return ['2 copies, joined', 'getting ready to divide'];
    if (t < 22.4) return ['2 copies: a cross', 'about to divide'];
    if (t < 30.4) return ['1 copy in each rod', 'dividing'];
    return ['1 copy in each cell', 'the new cells are working'];
  }
  function linecross(spec) {
    return widget(spec, 'dv', 'A line or a cross?', 'One chromosome: a single line in a working cell; copied, it becomes a cross just before the cell divides; its copies separate into two single lines.',
      LC.STEPS, LC.M, LW, LH, lcRender, lcLabels, lcPills, [
        ['Key: orange, the chromosome followed; grey, other chromosomes of the nucleus; the yellow band, a gene: the same place on both copies. Drawn far larger and thicker than real.'],
        ['Beyond 0610: the two copies of a chromosome are called chromatids (IB D2.1.6). The syllabus calls them the copies of a chromosome.', 'widget__note--ext']
      ], null, [['n', 'This chromosome:'], ['hu', 'The cell:']]);
  }
  L.add('linecross', linecross);
})(window);
