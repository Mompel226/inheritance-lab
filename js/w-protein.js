/* ============================================================
   w-protein.js — "How a protein is made" (station `protein`, 17.1.5–17.1.8). Six steps, each held until "Next step":
     1 the gene stays in the nucleus (the DNA never leaves it);
     2 mRNA is made in the nucleus as a copy of the gene, base by base;
     3 the mRNA moves to the cytoplasm, out through a pore in the membrane of the nucleus (the way out is drawn);
     4 in the cytoplasm the mRNA passes through a ribosome;
     5 the ribosome joins amino acids, one after another, in the order the bases of the mRNA set;
     6 the chain of amino acids takes its shape: the protein.
   THE BIOLOGY, frame by frame: the gene never moves; the mRNA is made beside the gene and leaves through a pore; the
   ribosome stays in the cytoplasm and the mRNA passes through it; each group of three bases gives one amino acid, the
   same group always the same kind (drawn, not named: codons are IB D1.2.7). The bases are colour blocks, keyed, never
   letters: mRNA has U where DNA has T, and the syllabus asks for neither.
   SOURCES: syllabus 0610 2026–28 17.1.5, 17.1.6, 17.1.8; MS 0610/42/O/N/16 Q2(b); the T17 summary's Fig. 3.
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, K = global.WKit, D = global.InhDraw; if (!L || !K || !D) return;
  var n1 = K.n1, seg = K.seg, ease = K.ease, lerp = K.lerp;
  var W = 360, H = 320;
  /* the gene's 18 bases: six groups of three, four kinds of group, each giving one kind of amino acid */
  var GROUPS = [0, 1, 2, 0, 3, 1];
  var GB = [['A', 'T', 'G'], ['C', 'C', 'A'], ['G', 'A', 'T'], ['T', 'G', 'C']];
  var AAK = ['aa1', 'aa2', 'aa3', 'aa4'];
  var STEPS = [
    { t: 0,  h: 'The gene stays in the nucleus', p: 'The **gene** for the protein is a length of DNA in the **nucleus**. It stays there.' },
    { t: 7,  h: 'mRNA: a copy of the gene', p: '**mRNA** is made in the nucleus as a **copy of the gene**, base by base.' },
    { t: 15, h: 'To the cytoplasm', p: 'The mRNA **moves from the nucleus to the cytoplasm**.' },
    { t: 22, h: 'Through a ribosome', p: 'In the cytoplasm the mRNA **passes through a ribosome**.' },
    { t: 28, h: 'Amino acids, in the order of the bases', p: 'The **ribosome assembles amino acids** into a chain. The **sequence of bases** in the mRNA determines the **sequence of amino acids**.' },
    { t: 42, h: 'The protein', p: 'The chain takes the **shape** of the protein. A different sequence of amino acids would give a different shape.' }
  ];
  var M = [0, 7, 15, 22, 28, 42, 50];
  var NX = 116, NY = 150, NRX = 92, NRY = 78, PORE = [206, 136];
  var BW = 6.5, GX = 56, GY = 168;                         /* the gene: 18 bases, 7 units each, on the DNA */
  function bases(x0, y0, n, cls, dx) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var g = GROUPS[Math.floor(i / 3)], b = GB[g][i % 3];
      out += '<rect class="mr__b dna__fill--' + b + ' ' + (cls || '') + '" x="' + n1(x0 + i * (dx || BW)) + '" y="' + n1(y0) + '" width="' + n1((dx || BW) - 1) + '" height="9" rx="1.5"/>';
    }
    return out;
  }
  /* the mRNA's way: from beside the gene, out through the pore, along the cytoplasm. Each base follows the one before
     along it, so the strand passes through the pore as a strand */
  /* from the end of the copy, up inside the nucleus to the pore, straight through its middle, then along the cytoplasm */
  var PATH = [[GX + 18 * BW, GY + 30], [184, 172], [PORE[0] - 10, PORE[1]], [PORE[0] + 12, PORE[1]], [238, 114], [334, 112]];
  var SEGL = [], TOT = 0;
  for (var q = 1; q < PATH.length; q++) { var l = Math.hypot(PATH[q][0] - PATH[q - 1][0], PATH[q][1] - PATH[q - 1][1]); SEGL.push(l); TOT += l; }
  function at(dist) {
    if (dist <= 0) return [PATH[0][0] + dist, PATH[0][1]];              /* still beside the gene, in a straight line */
    for (var i = 0; i < SEGL.length; i++) {
      if (dist <= SEGL[i] || i === SEGL.length - 1) { var u = Math.min(1, dist / SEGL[i]); return [lerp(PATH[i][0], PATH[i + 1][0], u), lerp(PATH[i][1], PATH[i + 1][1], u)]; }
      dist -= SEGL[i];
    }
  }
  function strand(head, n) {          /* n bases, the first at path distance `head`, the rest behind it */
    var out = '';
    for (var i = 0; i < n; i++) {
      var p = at(head - (17 - i) * BW), g = GROUPS[Math.floor(i / 3)], bb = GB[g][i % 3];
      out += '<rect class="mr__b dna__fill--' + bb + '" x="' + n1(p[0] - BW / 2) + '" y="' + n1(p[1] - 4.5) + '" width="' + (BW - 1) + '" height="9" rx="1.5"/>';
    }
    return out;
  }
  var FREE = [[248, 252], [282, 234], [316, 232], [226, 216], [290, 262], [256, 276]];
  function render(t) {
    var out = D.cell(180, 160, 172, 150) + '<ellipse class="nucb" cx="' + NX + '" cy="' + NY + '" rx="' + NRX + '" ry="' + NRY + '"/>';
    out += '<rect class="pore" x="' + (PORE[0] - 7) + '" y="' + (PORE[1] - 11) + '" width="14" height="22" rx="4"/>';
    out += D.helix(GX - 10, GX + 18 * BW + 10, GY + 4, 11, 1.6, .3, [10 / (18 * BW + 20), (10 + 18 * BW) / (18 * BW + 20)]);
    out += bases(GX, GY + 16, 18, 'mr__gene');
    /* step 2: the copy is made beside the gene, base by base, left to right; step 3: it leaves; then it lies in the cytoplasm */
    var made = t < 7.6 ? 0 : Math.min(18, Math.floor(18 * seg(t, 7.6, 13.6)) + 1);
    var head = lerp(0, TOT, ease(seg(t, 15.4, 21.4)));
    if (made) {
      if (t < 15.4) out += strand(0, made);
      else out += strand(head, 18);
    }
    /* the ribosome: in the cytoplasm the whole time; from step 4 it moves along the mRNA, from one end to the other */
    var tail = at(TOT - 17 * BW), front = at(TOT);
    var ride = seg(t, 28.4, 40);
    var rx = t < 22 ? 300 : lerp(t < 28.4 ? lerp(300, tail[0] + 6, ease(seg(t, 22.4, 26))) : tail[0] + 6, front[0] - 4, t < 28.4 ? 0 : ride);
    var ry = t < 22 ? 76 : lerp(76, 112, ease(seg(t, 22.4, 26)));
    out += '<g class="rib"><ellipse cx="' + n1(rx) + '" cy="' + n1(ry - 12) + '" rx="20" ry="12"/><ellipse cx="' + n1(rx + 1) + '" cy="' + n1(ry + 12) + '" rx="24" ry="12"/></g>';
    /* one amino acid joined for each group of three bases the ribosome has passed; the chain hangs from the ribosome */
    var joined = t < 28.4 ? 0 : Math.min(6, Math.floor(6 * ride + 1e-6));
    var fold = ease(seg(t, 42.4, 48));
    for (var j = 0; j < joined; j++) {
      var sx = rx - 2, sy = ry + 34 + (joined - 1 - j) * 15;
      var ang = j * 1.3, fx = 268 + Math.cos(ang) * (9 + j * 3), fy = 214 + Math.sin(ang) * (9 + j * 3);
      out += '<circle class="aa ' + AAK[GROUPS[j]] + '" cx="' + n1(lerp(sx, fx, fold)) + '" cy="' + n1(lerp(sy, fy, fold)) + '" r="7.5"/>';
    }
    FREE.forEach(function (f, i) {
      if (i < joined) return;
      var u = t < 28.4 ? 0 : Math.max(0, Math.min(1, (ride * 6 - (i - .7)) / .7));
      out += '<circle class="aa ' + AAK[GROUPS[i]] + '" cx="' + n1(lerp(f[0], rx - 2, u)) + '" cy="' + n1(lerp(f[1], ry + 32, u)) + '" r="7.5"/>';
    });
    return out;
  }
  function ribAt(t) {
    var tail = at(TOT - 17 * BW), front = at(TOT), ride = seg(t, 28.4, 40);
    return [t < 22 ? 300 : t < 28.4 ? lerp(300, tail[0] + 6, ease(seg(t, 22.4, 26))) : lerp(tail[0] + 6, front[0] - 4, ride), t < 22 ? 76 : lerp(76, 112, ease(seg(t, 22.4, 26)))];
  }
  function labelsAt(t) {
    var it = [{ id: 'nuc', text: 'nucleus', x: NX - NRX + 6, y: 110, side: 'L' }, { id: 'gene', text: 'the gene: it stays here', x: GX, y: GY + 4, side: 'L' }];
    var rb = ribAt(t);
    if (t >= 8 && t < 15.4) it.push({ id: 'mrna', text: 'mRNA: a copy of the gene, made beside it', x: GX, y: GY + 30, side: 'L' });
    if (t >= 15.4 && t < 22) { var hd = at(lerp(0, TOT, ease(seg(t, 15.4, 21.4)))); it.push({ id: 'mrna', text: 'mRNA, leaving the nucleus', x: hd[0] + 4, y: hd[1], side: 'R' }); it.push({ id: 'pore', text: 'a pore (beyond 0610): the way out', x: PORE[0] + 5, y: PORE[1] + 8, side: 'R' }); }
    it.push({ id: 'rib', text: 'a ribosome, in the cytoplasm', x: rb[0] + 24, y: rb[1] + 12, side: 'R' });
    if (t >= 22) { var fr = at(TOT); it.push({ id: 'mrna2', text: 'the mRNA', x: fr[0] + 3, y: fr[1] - 2, side: 'R' }); }
    if (t >= 28.4 && t < 42.4) it.push({ id: 'aa', text: 'a chain of amino acids', x: rb[0] + 6, y: rb[1] + 46, side: 'R' });
    if (t >= 42.4) it.push({ id: 'prot', text: 'the protein', x: 290, y: 214, side: 'R' });
    return it;
  }

  function protein(spec) {
    var S = K.shell(spec, 'pt', 'How a protein is made', 'A cell: the gene in the nucleus; mRNA copied from it moves to a ribosome in the cytoplasm, which joins amino acids into a protein.', [['where', 'Where:']]);
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
      S.pill('where', t < 15 ? 'in the nucleus' : t < 22 ? 'leaving the nucleus' : 'in the cytoplasm', 'ok');
    }
    var sp = L.stepper({ steps: K.readerSteps(STEPS, R), end: R[R.length - 1], render: draw, flow: K.readerFlow(R, M) });
    return K.mount(S, sp, 'pt', [
      ['Key: the bases are coloured blocks, four kinds; the amino acids are circles, each colour one kind. The ribosome and the bases are drawn far larger than real.'],
      ['Extension (beyond 0610; IB D1.2.6–D1.2.7, B2.2.6): the mRNA leaves through a pore in the membrane of the nucleus. Each group of three bases, a codon, gives one amino acid, the same group always the same kind; tRNA molecules carry the amino acids to the ribosome. mRNA has the base U where DNA has T.', 'widget__note--ext']
    ], function (Dw, nar) {
      narrow = nar; var m = K.margins(nar, 16, 22, 90, 120);
      lay = K.frameOf(svg, bg, model, cr, { x0: 0, x1: W, y0: 0, y1: H }, false, Dw, m[0], m[1], m[2], m[3], 14.5);
    });
  }
  L.add('protein', protein);
})(window);
