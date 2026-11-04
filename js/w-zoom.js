/* ============================================================
   w-zoom.js — "From a cell to a gene" (station `genes`, 17.1.1–17.1.3). Five steps, each held until "Next step":
     1 a body cell and its nucleus;
     2 enlarged: the nucleus holds chromosomes, long thin threads (drawn: 4 of the 46, in the two colours of the key);
     3 enlarged again: one chromosome is a long molecule of DNA, two strands with bases between them;
     4 a gene is one length of that DNA (lit), and the chromosome carries many genes;
     5 the pair the gene is on: chromosome 9 from the mother and from the father, drawn as single lines (one copy of the DNA
       each, as in a working cell; thicker than real), the ABO gene at the same place on both, the allele for group A on one
       and the allele for group O on the other.
   THE BIOLOGY: chromosomes are single thin lines in a working cell, so they are drawn so in every step (a cross only while
   a cell divides: the next widget, "A line or a cross?"); the ABO gene is on chromosome 9 (9q34), near the end of its long arm.
   SOURCES: syllabus 0610 2026–28 17.1.1–17.1.3; the T17 summary's Fig. 1 and Fig. 2.
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, K = global.WKit, D = global.InhDraw, Sc = global.LabScenes; if (!L || !K || !D || !Sc) return;
  var n1 = K.n1, seg = K.seg, ease = K.ease, lerp = K.lerp;
  var W = 300, H = 380;
  var STEPS = [
    { t: 0,  h: 'A body cell', p: 'A cell from your body. The **nucleus** controls the cell.' },
    { t: 7,  h: 'Chromosomes in the nucleus', p: 'The nucleus contains **chromosomes**: long, thin threads. A human body cell has 46; four are drawn here.' },
    { t: 14, h: 'A chromosome is DNA', p: 'One chromosome is a very long molecule of **DNA**: two strands, twisted round each other, with **bases** between them.' },
    { t: 22, h: 'A gene', p: 'A **gene** is one length of the DNA, which codes for a protein. One chromosome carries many genes.' },
    { t: 30, h: 'A pair, and two alleles', p: 'Chromosomes are in pairs, one from each parent. The **ABO gene** is at the same place on both chromosomes of pair 9: here, the **allele** for blood group A on one and the allele for O on the other.' }
  ];
  var M = [0, 7, 14, 22, 30, 40];
  var thr = Sc.thread;
  function frame(k, t) {
    var out = '';
    if (k === 0) {
      out += D.cell(150, 190, 136, 120) + D.nucleus(166, 186, 56, 48);
      out += D.threads(166, 190, 1, 1, 0, 2.6);
    } else if (k === 1) {
      out += '<ellipse class="nucb" cx="150" cy="190" rx="138" ry="150"/>';
      out += D.threads(150, 196, 2.6, 2.6, 0, 6);
      out += '<rect class="zm__box" x="98" y="114" width="54" height="40" rx="5" opacity="' + n1(seg(t, 11, 13) * 100) / 100 + '"/>';
    } else if (k === 2 || k === 3) {
      out += '<rect class="zm__pane" x="6" y="40" width="288" height="300" rx="14"/>';
      out += thr([[20, 90], [80, 64], [150, 98], [220, 70], [280, 92]], 'mum', 12);
      out += '<path class="zm__line" d="M112 104 L30 176 M188 104 L270 176"/>';
      out += D.helix(26, 274, 250, 34, 2.6, .5, k === 3 ? [.38, .64] : null);
      if (k === 3) out += '<path class="gn__br" d="M' + n1(26 + 248 * .72) + ' 300 L' + n1(26 + 248 * .72) + ' 308 L' + n1(26 + 248 * .96) + ' 308 L' + n1(26 + 248 * .96) + ' 300"/>';
    } else {
      var m = { x: 110, y: 190, len: 280, w: 34, who: 'mum', bands: [.8] }, f = { x: 190, y: 190, len: 280, w: 34, who: 'dad', bands: [.8] };
      out += D.chromo(m) + D.chromo(f);
    }
    return out;
  }
  function labelsAt(k) {
    if (k === 0) return [{ id: 'nuc', text: 'nucleus', x: 222, y: 186, side: 'R' }, { id: 'cell', text: 'a body cell', x: 16, y: 190, side: 'L' }];
    if (k === 1) { var a = D.threadStart(150, 196, 2.6); return [{ id: 'chr', text: 'chromosomes: long, thin threads', x: a[0], y: a[1], side: 'L', alts: [[150 - 42 * 2.6, 196 + 14 * 2.6]] }, { id: 'nuc', text: 'inside the nucleus', x: 288, y: 190, side: 'R' }]; }
    if (k === 2) return [{ id: 'chr', text: 'one chromosome', x: 20, y: 90, side: 'L' }, { id: 'dna', text: 'DNA: two strands', x: 26, y: 250, side: 'L' }, { id: 'b', text: 'bases', x: 270, y: 250, side: 'R' }];
    if (k === 3) return [{ id: 'gene', text: 'a gene: one length of the DNA', x: 26 + 248 * .5, y: 212, side: 'R' }, { id: 'g2', text: 'another gene', x: 26 + 248 * .84, y: 308, side: 'R' }, { id: 'dna', text: 'DNA', x: 26, y: 250, side: 'L' }];
    var bm = D.bandAt({ x: 110, y: 190, len: 280 }, .8), bf = D.bandAt({ x: 190, y: 190, len: 280 }, .8);
    return [{ id: 'm', text: 'chromosome 9 from the mother', x: 93, y: 80, side: 'L' }, { id: 'f', text: 'chromosome 9 from the father', x: 207, y: 80, side: 'R' },
            { id: 'a', text: 'the allele for group A', x: bm[0] - 17, y: bm[1], side: 'L' }, { id: 'o', text: 'the allele for group O', x: bf[0] + 17, y: bf[1], side: 'R' }];
  }

  function zoom(spec) {
    var S = K.shell(spec, 'zm', 'From a cell to a gene', 'A cell, its nucleus, one chromosome, its DNA and one gene, each enlarged from the one before.', [['see', 'You see:']]);
    var svg = S.svg, NSV = K.NS;
    var bg = document.createElementNS(NSV, 'rect'); bg.setAttribute('class', 'zm__bg'); svg.appendChild(bg);
    var model = document.createElementNS(NSV, 'g'); svg.appendChild(model);
    var gLab = document.createElementNS(NSV, 'g'); svg.appendChild(gLab);
    var cr = document.createElementNS(NSV, 'rect'), lay = null, narrow = false, key = K.pinKey(S);
    var R = [0];
    STEPS.forEach(function (s, i) { var w = (s.h + ' ' + s.p).replace(/\*\*/g, '').split(/\s+/).length; R.push(R[i] + Math.max(M[i + 1] - M[i], w / 2)); });
    var clock = K.readerClock(R, M);
    function draw(tt) {
      var t = clock(tt), k = 0;
      for (var i = 0; i < 5; i++) if (t >= M[i] - 1e-6) k = i;
      /* each new level grows out of the part enlarged in the one before */
      var g = ease(seg(t, M[k], M[k] + 1.4));
      var cx = [166, 158, 150, 150, 150][k], cy = [186, 132, 90, 250, 190][k];
      model.innerHTML = '<g opacity="' + n1(g * 100) / 100 + '" transform="translate(' + n1(cx * (1 - lerp(.6, 1, g))) + ' ' + n1(cy * (1 - lerp(.6, 1, g))) + ') scale(' + n1(lerp(.6, 1, g) * 1000) / 1000 + ')">' + frame(k, t) + '</g>';
      var items = g > .6 ? labelsAt(k).map(function (q) { var p = lay.to(q.x, q.y); return { id: q.id, text: q.text, x: p[0], y: p[1], side: q.side, alts: (q.alts || []).map(function (a) { return lay.to(a[0], a[1]); }) }; }) : [];
      gLab.innerHTML = K.names(lay, items, narrow, key, null, 6);
      S.pill('see', ['a cell', 'its nucleus', 'one chromosome', 'one gene', 'one pair'][k], 'ok');
    }
    var sp = L.stepper({ steps: K.readerSteps(STEPS, R), end: R[R.length - 1], render: draw, flow: K.readerFlow(R, M) });
    return K.mount(S, sp, 'zm', [
      ['Steps 1–4 draw the chromosomes as the long, thin lines they are in a working cell. Step 5 draws one pair as single lines too, each one copy of its DNA, only thicker than real, so the gene can be seen on both.'],
      ['Key: orange, a chromosome from the mother; blue, from the father; yellow, a gene.']
    ], function (Dw, nar) {
      narrow = nar; var m = K.margins(nar, 18, 18, 96, 96);
      lay = K.frameOf(svg, bg, model, cr, { x0: 0, x1: W, y0: 0, y1: H }, false, Dw, m[0], m[1], m[2], m[3], 14.5);
    });
  }
  L.add('zoom', zoom);
})(window);
