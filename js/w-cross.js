/* ============================================================
   w-cross.js — crosses: a worked genetic diagram that waits for "Next step", and crosses to practise without end.

   worked   (stations pairs, crosses, testcross, abo, sexlinked) one cross, line by line, in the layout the 0610 schemes
            mark: parental phenotypes, parental genotypes, gametes (each one allele, in a circle), the Punnett square,
            offspring genotypes, offspring phenotypes, the ratio. Each step waits for Next step, with Play all beside it.
            It is drawn in HTML, so its words are never smaller than the page's (new-lab.md §7).
   trainer  (stations crosses, testcross, abo, sexlinked, practise) a new cross each time, written by the pupil on the
            same keypad as the questions (js/genes.js board): 1 the parents' genotypes and their gametes; 2 the Punnett
            square; 3 the chance or the ratio. Each line is checked before the next opens, and a wrong box says which
            writing rule it breaks, never the answer (Daniel, 4 Nov 2026: "practice as much as possible, particularly
            Punnett squares … guide them to not make that mistake"). Nothing here is recorded: it is practice.

   THE BIOLOGY, checked for every cross the trainer can make: the gametes are the parent's two alleles, one each; each box
   is one gamete from each parent; for a sex-linked gene the Y carries no allele, and a male's X comes from his mother; Iᴬ
   and Iᴮ are codominant and both dominant to Iᵒ; a ratio is an expected ratio (a probability), so the trainer asks for a chance or a ratio,
   never a count. KEPT PRIVATE (the master's header): no mice, tigers, fur or cystic fibrosis; no ABO cross IᴬIᴮ × IᵒIᵒ or
   IᴬIᵒ × IᴮIᵒ; no colour-blindness cross of a carrier woman and a man with normal colour vision.
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, G = global.Genes, K = global.WKit;
  if (!L || !G || !K) return;
  var h = L.h, esc = L.esc;
  function P(s) { return G.parse(s); }
  function hs(s) { return G.html(P(s)); }
  /* a gamete's letters, inside its circle: one inline span, so the allele stays the small RAISED letter, as in the
     genotypes (the circle is a grid; a bare <sup> became a row of its own under the X or I: the audit, 6 Nov 2026) */
  function gm(t) { return '<span class="wx__al">' + G.html(t) + '</span>'; }
  function pick(a, r) { return a[Math.floor((r || Math.random)() * a.length)]; }

  /* ---------- the genes: how each genotype reads as a phenotype ---------- */
  function domGene(c) {      /* c: { D: [letter, phenotype], r: [letter, phenotype] } */
    return { kind: 'dom', keys: c.D[0] + c.r[0] + 'X',
      pheno: function (t) { return t.some(function (x) { return x.b === c.D[0]; }) ? c.D[1] : c.r[1]; } };
  }
  function codomGene(c) {    /* c: { g, a1: [sup, phen], a2: [sup, phen], het } */
    return { kind: 'codom', keys: c.g + c.g.toLowerCase() + c.a1[0] + c.a1[0].toLowerCase() + c.a2[0] + c.a2[0].toLowerCase(),
      pheno: function (t) { var s = t.map(function (x) { return x.s; }).sort().join(''); return s === c.a1[0] + c.a1[0] ? c.a1[1] : s === c.a2[0] + c.a2[0] ? c.a2[1] : c.het; } };
  }
  var ABO = { kind: 'abo', keys: 'IiABOo',
    pheno: function (t) { var s = t.map(function (x) { return x.s.toUpperCase(); }); var A = s.indexOf('A') >= 0, B = s.indexOf('B') >= 0; return 'blood group ' + (A && B ? 'AB' : A ? 'A' : B ? 'B' : 'O'); } };
  function sexGene(c) {      /* c: { D: sup, r: sup, normal, has } (normal: "normal colour vision"; has: "colour-blind") */
    return { kind: 'sex', keys: 'XY' + c.D + c.r,
      pheno: function (t) {
        var male = t.some(function (x) { return x.b === 'Y'; });
        var xs = t.filter(function (x) { return x.b === 'X'; }).map(function (x) { return x.s; });
        var dom = xs.indexOf(c.D) >= 0;
        if (male) return dom ? 'a boy with ' + c.normal : 'a ' + c.has + ' boy';
        return dom ? (xs.indexOf(c.r) >= 0 ? 'a carrier girl (' + c.normal + ')' : 'a girl with ' + c.normal) : 'a ' + c.has + ' girl';
      } };
  }
  var XY = { kind: 'xy', keys: 'XYxy', pheno: function (t) { return t.some(function (x) { return x.b === 'Y'; }) ? 'a boy' : 'a girl'; } };

  /* ---------- the worked crosses ---------- */
  var PEA = { D: ['R', 'round seeds'], r: ['r', 'wrinkled seeds'] };
  var CB = { D: 'B', r: 'b', normal: 'normal colour vision', has: 'colour-blind' };
  var WORKED = {
    sex:      { title: 'The sex of a child', gene: XY, pp: ['a woman', 'a man'], pg: ['XX', 'XY'], who: ['the woman', 'the man'],
                end: 'So the ratio is <b>1 girl : 1 boy</b>: for each child, a 50 % chance of a boy. An expected ratio (a probability), not an exact count: a family may have three girls.' },
    peas31:   { title: 'Two heterozygous pea plants', gene: domGene(PEA), pp: ['round seeds', 'round seeds'], pg: ['Rr', 'Rr'],
                end: 'So the ratio is <b>3 round : 1 wrinkled</b>. Each seed has a 75 % chance of being round: count 40 seeds from the pods and about 30 are round, often not exactly 30.' },
    peas11:   { title: 'Heterozygous × homozygous recessive', gene: domGene(PEA), pp: ['round seeds', 'wrinkled seeds'], pg: ['Rr', 'rr'],
                end: 'So the ratio is <b>1 round : 1 wrinkled</b>. Each seed has a 50 % chance of being wrinkled.' },
    testRR:   { title: 'A test cross: if the round plant is RR', gene: domGene(PEA), pp: ['round seeds (genotype not known)', 'wrinkled seeds (homozygous recessive)'], pg: ['RR', 'rr'],
                end: 'Every offspring is Rr: <b>all round</b>. Every gamete of the RR parent carries R. So if many offspring are all round, the round parent is <b>RR, homozygous dominant</b>.' },
    testRr:   { title: 'A test cross: if the round plant is Rr', gene: domGene(PEA), pp: ['round seeds (genotype not known)', 'wrinkled seeds (homozygous recessive)'], pg: ['Rr', 'rr'],
                end: 'So the ratio is <b>1 round : 1 wrinkled</b>. If any offspring is wrinkled, the round parent is <b>Rr, heterozygous</b>: a single wrinkled offspring shows it.' },
    aAB:      { title: 'Blood group A × blood group AB', gene: ABO, pp: ['blood group A', 'blood group AB'], pg: ['IᴬIᴬ', 'IᴬIᴮ'],
                end: 'So the ratio is <b>1 blood group A : 1 blood group AB</b>. The AB children show codominance: both alleles contribute to the phenotype.' },
    cbCarrier: { title: 'A carrier woman × a colour-blind man', gene: sexGene(CB), pp: ['normal colour vision (a carrier)', 'colour-blind'], pg: ['XᴮXᵇ', 'XᵇY'], who: ['the woman', 'the man'],
                end: 'So the ratio is <b>1 carrier girl : 1 colour-blind girl : 1 boy with normal colour vision : 1 colour-blind boy</b>. Write the sex with each phenotype.' }
  };

  /* the cross worked out: gametes, the four boxes, their phenotypes */
  function solve(c) {
    var A = P(c.pg[0]), B = P(c.pg[1]);
    var top = G.gametes(B), side = G.gametes(A);        /* the father's (second parent's) gametes along the top */
    var boxes = G.punnett(top, side);
    return { A: A, B: B, top: top, side: side, boxes: boxes, ph: boxes.map(function (row) { return row.map(function (g) { return c.gene.pheno(g); }); }) };
  }

  function worked(spec) {
    var c = WORKED[spec.cross]; if (!c) return h('div');
    var X = solve(c);
    /* whose gametes go where in the square, in words (Daniel, 6 Nov 2026: "at the top, you have the gametes from the man,
       and at the left side … from the woman … it's not [straightforward] if it's the first time you see the Punnett square") */
    var who = c.who || ['the parent on the left', 'the parent on the right'], side = c.who ? [', the parent on the left', ', the parent on the right'] : ['', ''];
    var STEPS = [
      { t: 0,  h: 'The parents’ phenotypes', p: 'The first line: each parent’s **phenotype**, its observable features.' },
      c.gene.kind === 'xy' ? { t: 6, h: 'The parents’ sex chromosomes', p: 'Under each phenotype, its **genotype**: its **sex chromosomes**, XX for a woman and XY for a man.' }
        : c.gene.kind === 'sex' ? { t: 6, h: 'The parents’ genotypes', p: 'Under each phenotype, its **genotype**: the allele on each X chromosome. The Y carries none.' }
        : { t: 6, h: 'The parents’ genotypes', p: 'Under each phenotype, its **genotype**: two alleles, one on each chromosome of the pair.' },
      c.gene.kind === 'xy' ? { t: 12, h: 'The gametes', p: 'Each **gamete** carries **one** sex chromosome: every egg cell an X; a sperm cell an X or a Y. Each gamete in its own circle.' }
        : c.gene.kind === 'sex' ? { t: 12, h: 'The gametes', p: 'Each **gamete** carries **one** sex chromosome: an X with its allele, or the Y with none. Each gamete in its own circle.' }
        : { t: 12, h: 'The gametes', p: 'Each **gamete** carries **one** allele: the two alleles of a parent go into different gametes. Each gamete in its own circle.' },
      { t: 19, h: 'The Punnett square', p: 'A **Punnett square** is a grid that shows every way the gametes can fuse at fertilisation. Along the top: the gametes of ' + who[1] + side[1] + '. Down the side: the gametes of ' + who[0] + side[0] + '.' },
      { t: 29.8, h: 'The offspring’s genotypes', p: 'Each box: the gamete above it and the gamete beside it. Every box is equally likely.' },
      { t: 39.3, h: 'The offspring’s phenotypes', p: 'Under each genotype, its **phenotype**.' },
      { t: 48.8, h: 'The ratio', p: 'Each box has a **25 %** chance. Add the chances of the boxes with the same phenotype. Then write the ratio, with the phenotypes named: an **expected ratio** (a probability), not an exact count.' }
    ];
    /* each box a 25 % chance, then the chances of each phenotype added, in the order the phenotypes first appear in the
       boxes (Daniel, 7 Nov 2026: "a girl 25%, a boy 25%, a girl 25%, a boy 25%, and then clearly you just add up"; it
       replaced a count of 1, 2 in the boxes); the girls before the boys, as the ratio under them names them (7 Nov 2026:
       the sex-linked sums read girl, boy, girl, boy over a ratio of girl, girl, boy, boy) */
    var SUM = (function () { var by = {}, out = []; [0, 1].forEach(function (r) { [0, 1].forEach(function (k) { var p = X.ph[r][k]; if (!(p in by)) { by[p] = out.length; out.push({ p: p, n: 0 }); } out[by[p]].n++; }); });
      function boy(q) { return / boy\b/.test(q.p) ? 1 : 0; }
      return out.filter(function (q) { return !boy(q); }).concat(out.filter(boy)); })();
    var AT_SUM = 3.6, AT_END = AT_SUM + 1.2 * SUM.length + .3;
    var M = [0, 6, 12, 19, 29.8, 39.3, 48.8, 48.8 + AT_END + 1.4];
    var box = h('div', 'widget wx');
    box.appendChild(L.head(c.title, 'A genetic diagram, line by line', 'Press play'));
    var read = h('div', 'wx__read');
    var fig = h('figure', 'wx__fig');
    var d = h('div', 'wx__d');
    function row(lab, html, cls) { return '<div class="wx__row' + (cls ? ' ' + cls : '') + '"><span class="wx__lab"><span class="wx__lt">' + lab + '</span></span><span class="wx__cells">' + html + '</span></div>'; }
    d.innerHTML =
      row('parental phenotypes', '<span class="wx__c" data-s="0">' + c.pp[0] + '</span><span class="wx__x" data-s="0">×</span><span class="wx__c" data-s="0">' + c.pp[1] + '</span>') +
      row('parental genotypes', '<span class="wx__c wx__g" data-s="1">' + hs(c.pg[0]) + '</span><span class="wx__x" data-s="1">×</span><span class="wx__c wx__g" data-s="1">' + hs(c.pg[1]) + '</span>') +
      row('gametes', '<span class="wx__c"><i class="wx__gam" data-s="2" data-in="L">' + gm(X.side[0]) + '</i><i class="wx__gam" data-s="2" data-in="R">' + gm(X.side[1]) + '</i></span><span class="wx__x"></span><span class="wx__c"><i class="wx__gam" data-s="2" data-in="L">' + gm(X.top[0]) + '</i><i class="wx__gam" data-s="2" data-in="R">' + gm(X.top[1]) + '</i></span>') +
      '<div class="wx__ps" data-s="3"><table class="wx__sq">' +
        '<tr><th></th><th colspan="2" class="wx__from" data-s="3" data-at="2"><span class="wx__ft">gametes of ' + who[1] + ' ↓</span></th></tr>' +
        '<tr><th class="wx__from wx__from--side" data-s="3" data-at="6.6"><span class="wx__ft">gametes of ' + who[0] + ' ↓</span></th>' +
        '<th data-s="3" data-fly="T" data-at="' + .3 + '" data-col="0"><i class="wx__gam">' + gm(X.top[0]) + '</i></th><th data-s="3" data-fly="T" data-at="' + .5 + '" data-col="1"><i class="wx__gam">' + gm(X.top[1]) + '</i></th></tr>' +
        [0, 1].map(function (r) {
          return '<tr><th data-s="3" data-fly="S" data-at="' + (4.6 + .2 * r) + '" data-row="' + r + '"><i class="wx__gam">' + gm(X.side[r]) + '</i></th>' + [0, 1].map(function (k) {
            var n = r * 2 + k;
            return '<td><span class="wx__bg" data-s="4" data-k="' + n + '">' + G.html(X.boxes[r][k]) + '</span><span class="wx__bp" data-s="5" data-k="' + n + '">' + esc(X.ph[r][k]) +
              '</span><span class="wx__pc" data-s="6" data-at="' + (.4 + .8 * n) + '">25&nbsp;%</span></td>';
          }).join('') + '</tr>';
        }).join('') + '</table></div>' +
      '<div class="wx__sums">' + SUM.map(function (q, j) {
        return '<p class="wx__sum" data-s="6" data-at="' + (AT_SUM + 1.2 * j).toFixed(1) + '">' + esc(q.p) + ': ' +
          (q.n > 1 ? Array(q.n + 1).join('25&nbsp;% + ').slice(0, -3) + ' = <b>' + 25 * q.n + '&nbsp;%</b>' : '<b>25&nbsp;%</b>') + '</p>';
      }).join('') + '</div>' +
      '<p class="wx__end" data-s="6" data-at="' + AT_END.toFixed(1) + '">' + c.end + '</p>';
    fig.appendChild(d);
    var R = [0];
    STEPS.forEach(function (s, i) { var w = (s.h + ' ' + s.p).replace(/\*\*/g, '').split(/\s+/).length; R.push(R[i] + Math.max(M[i + 1] - M[i], w / 2)); });
    var clock = K.readerClock(R, M);
    var parts = Array.prototype.slice.call(d.querySelectorAll('[data-s]'));
    var heads = Array.prototype.slice.call(d.querySelectorAll('th[data-col], th[data-row]'));
    /* each gamete of the square is a copy of one in the gametes line: the man's (the parent on the right) fly to the top,
       then the woman's (on the left) to the side, so a pupil sees where each one comes from */
    var gl = d.querySelectorAll('.wx__row')[2].querySelectorAll('.wx__c'), src = function (th) {
      var c = th.hasAttribute('data-col') ? gl[1] : gl[0], j = +(th.getAttribute('data-col') || th.getAttribute('data-row'));
      return c.querySelectorAll('.wx__gam')[j];
    };
    /* each new line blinks together with its name, then stays lit while its step lasts: "parental phenotypes" with a
       woman and a man, "parental genotypes" with XX and XY, "gametes" with the gametes, each label of the square with its
       gametes (Daniel, 6 Nov 2026: "make the woman and man blink … and the phenotype word blink too … otherwise it's not
       very clear"). From the offspring's genotypes on nothing blinks or is lit: what appears is what the step names (Daniel,
       7 Nov 2026: "once you start showing the offspring genotype, you don't have to highlight … The offspring phenotype
       and the ratio should not blink"). MARK: each group, its step s and when (t0 s into the step) it blinks */
    function all(q, el) { return Array.prototype.slice.call((el || d).querySelectorAll(q)); }
    var rows = all('.wx__row'), fr = all('.wx__ft');
    function gams(q) { return all(q).map(function (th) { return th.querySelector('.wx__gam'); }); }
    var MARK = [0, 1, 2].map(function (r) { return { s: r, t0: r === 2 ? 1.6 : 1.5, els: all('.wx__lt', rows[r]).concat(all('.wx__c', rows[r])) }; }).concat([
      { s: 3, t0: 2.6, els: [fr[0]].concat(gams('th[data-col]')) }, { s: 3, t0: 7.1, els: [fr[1]].concat(gams('th[data-row]')) }]);
    MARK.forEach(function (g) { g.els.forEach(function (el) { el.classList.add('wx__mk'); }); });
    /* two and a half blinks of 1.1 s (0.7 s on the screen: the diagram runs 1.6 times faster than written), then a
       steady light: never a jump */
    function blink(te) { return te < 0 ? 0 : te < 2.75 ? .5 - .5 * Math.cos(2 * Math.PI * te / 1.1) : te < 3.2 ? 1 - .55 * (te - 2.75) / .45 : .45; }
    /* where a part comes from (the audit, 6 Nov 2026: "nothing shows the alleles going into the gametes, or each box
       taking the gamete above it and the gamete beside it"): a gamete drops out of its parent's genotype, above the middle
       of its pair; the square's gametes come in from the top and from the side; each box (and then each phenotype) fills
       on its own, one after another, while the two gametes that make it are lit */
    var FROM = { L: [22, -30], R: [-22, -30], T: [0, -18], S: [-18, 0] };
    function ease(q) { return q < .5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2; }
    function draw(tt) {
      var t = clock(tt);
      var k = 0; for (var i = 0; i < M.length - 1; i++) if (t >= M[i] - 1e-6) k = i;
      var lit = -1;
      parts.forEach(function (el) {
        var s = +el.getAttribute('data-s'), on = s < k || (s === k && t >= M[s]), bx = el.hasAttribute('data-k') ? +el.getAttribute('data-k') : -1;
        var at = el.hasAttribute('data-at') ? +el.getAttribute('data-at') : -1;
        var op = s < k ? 1 : s === k ? (bx >= 0 ? (t - M[s] - bx * 1.5) / 1.2 : at >= 0 ? (t - M[s] - at) / .6 : (t - M[s]) / 1.4) : 0;
        op = op < 0 ? 0 : op > 1 ? 1 : op;
        if (el.hasAttribute('data-fly')) {
          /* a copy leaving its gamete: whole from the start, moving 2.2 s (1.4 s on the screen) from that gamete to its place */
          var q = s < k ? 1 : s === k ? (t - M[s] - at) / 2.2 : 0; q = q < 0 ? 0 : q > 1 ? 1 : q;
          el.style.opacity = (s < k || (s === k && t >= M[s] + at)) ? '1' : '0';
          el.style.transform = '';
          /* on a gentle curve, the side ones bowing out to the left, so a copy never passes over another gamete */
          if (q < 1 && el.style.opacity === '1') { var a = src(el).getBoundingClientRect(), b = el.querySelector('.wx__gam').getBoundingClientRect(), mm = 1 - ease(q), bow = Math.sin(Math.PI * ease(q)) * (el.getAttribute('data-fly') === 'S' ? -46 : 0);
            el.style.transform = 'translate(' + Math.round((a.left - b.left) * mm + bow) + 'px,' + Math.round((a.top - b.top) * mm) + 'px)'; }
          el.classList.toggle('is-now', s === k && t < M[s + 1]);
          return;
        }
        el.style.opacity = on ? String(Math.round(op * 100) / 100) : '0';
        var f = FROM[el.getAttribute('data-in')], m = 1 - ease(op);
        el.style.transform = f && m > .001 ? 'translate(' + Math.round(f[0] * m) + 'px,' + Math.round(f[1] * m) + 'px)' : '';
        el.classList.toggle('is-now', s === k && t < M[s + 1]);
        if (s === 4 && k === 4 && op > 0 && op < 1) lit = bx;
      });
      MARK.forEach(function (g) {
        var b = g.s === k && t < M[g.s + 1] ? Math.round(blink(t - M[g.s] - g.t0) * 100) / 100 : 0;
        g.els.forEach(function (el) { el.style.setProperty('--wxb', String(b)); });
      });
      heads.forEach(function (th) {
        var on = lit >= 0 && (th.getAttribute('data-col') === String(lit % 2) || th.getAttribute('data-row') === String(Math.floor(lit / 2)));
        var g = th.querySelector('.wx__gam');
        g.style.color = on ? 'var(--accent)' : ''; g.style.borderColor = on ? 'var(--accent)' : '';
      });
    }
    var sp = L.stepper({ steps: K.readerSteps(STEPS, R), end: R[R.length - 1], render: draw, flow: K.readerFlow(R, M) });
    var S = { box: box, read: read, fig: fig, title: c.title, spec: spec };
    return K.mount(S, sp, 'wx', [], function () {});
  }
  L.add('worked', worked);

  /* ============================================================ the trainer ============================================================ */
  var DOM = [
    { org: 'pea plants', one: 'plant', D: ['R', 'round seeds'], r: ['r', 'wrinkled seeds'] },
    { org: 'pea plants', one: 'plant', D: ['G', 'green pods'], r: ['g', 'yellow pods'] },
    { org: 'tomato plants', one: 'plant', D: ['P', 'a purple stem'], r: ['p', 'a green stem'] },
    { org: 'fruit flies', one: 'fly', D: ['N', 'normal wings'], r: ['n', 'short, crumpled wings'] },
    { org: 'humans', one: 'person', D: ['W', 'wet earwax'], r: ['w', 'dry earwax'] },
    { org: 'sunflowers', one: 'plant', D: ['T', 'a tall stem'], r: ['t', 'a short stem'] }
  ];
  var CODOM = [
    { org: 'snapdragons', one: 'plant', trait: 'petal colour', of: 'petals', g: 'C', a1: ['R', 'red'], a2: ['W', 'white'], het: 'pink' },
    { org: 'Andalusian chickens', one: 'chicken', trait: 'feather colour', of: 'feathers', g: 'F', a1: ['B', 'black'], a2: ['W', 'white'], het: 'blue-grey' }
  ];
  var SEX = [
    { name: 'red-green colour blindness', D: 'B', r: 'b', normal: 'normal colour vision', has: 'colour-blind', allow: function (m, f) { return !(m === 'XᴮXᵇ' && f === 'XᴮY'); } },
    { name: 'haemophilia', D: 'H', r: 'h', normal: 'normal blood clotting', has: 'haemophiliac', hasN: 'haemophilia', allow: function (m, f) { return m !== 'XʰXʰ' && !(m === 'XᴴXʰ' && f === 'XᴴY'); } }
  ];
  function domPhrase(c, g) {
    var t = P(g), dom = t.some(function (x) { return x.b === c.D[0]; });
    var het = t[0].b !== t[1].b;
    return (dom ? (het ? 'a heterozygous ' + c.one + ' with ' : 'a homozygous ' + c.one + ' with ') + c.D[1] : 'a ' + c.one + ' with ' + c.r[1]);
  }

  /* make one cross for a mode: { stem (HTML), gene, pg: [mother/first, father/second], q: { ask, choices, right } } */
  function makeCross(mode) {
    if (mode === 'mixed') mode = pick(['dom', 'dom', 'test', 'codom', 'abo', 'sex']);
    var c, gene, a, b, stem, q;
    if (mode === 'dom' || mode === 'test') {
      /* a test cross is a breeder's method: never a person */
      c = pick(mode === 'test' ? DOM.filter(function (x) { return x.one !== 'person'; }) : DOM); gene = domGene(c);
      var D = c.D[0], r = c.r[0], GT = [D + D, D + r, r + r];
      if (mode === 'test') {
        a = pick([D + D, D + r]); b = r + r;
        var some = a !== D + D;
        stem = 'In ' + c.org + ', the allele for ' + c.D[1] + ', <b>' + D + '</b>, is dominant to the allele for ' + c.r[1] + ', <b>' + r + '</b>. ' +
               'A ' + c.one + ' with ' + c.D[1] + ' is test crossed with a ' + c.one + ' with ' + c.r[1] + '. ' +
               (some ? 'Some of the offspring have ' + c.r[1] + '.' : 'All of the many offspring have ' + c.D[1] + '.') +
               ' Write the most likely genotypes of the parents, and their gametes.';
      } else {
        /* the informative crosses most often: two heterozygotes, and heterozygote × homozygous recessive */
        var pr = pick([[1, 1], [1, 1], [1, 2], [2, 1], [0, 2], [0, 1], [1, 0]]);
        a = GT[pr[0]]; b = GT[pr[1]];
        stem = 'In ' + c.org + ', the allele for ' + c.D[1] + ', <b>' + D + '</b>, is dominant to the allele for ' + c.r[1] + ', <b>' + r + '</b>. ' +
               cap(domPhrase(c, a)) + (c.one === 'person' ? ' has children with ' : ' is crossed with ') + domPhrase(c, b) + '.';
      }
      q = chanceQ(gene, a, b, 'have ' + c.r[1], function (t) { return gene.pheno(t) === c.r[1]; }, c.one === 'person' ? 'a child will' : null);
    } else if (mode === 'codom') {
      c = pick(CODOM); gene = codomGene(c);
      var g1 = c.g + '^' + c.a1[0] + c.g + '^' + c.a1[0], g2 = c.g + '^' + c.a2[0] + c.g + '^' + c.a2[0], gh = c.g + '^' + c.a1[0] + c.g + '^' + c.a2[0];
      var opts = [[gh, gh], [gh, g1], [gh, g2], [g1, g2]], o = pick(opts);
      a = G.text(P(o[0])); b = G.text(P(o[1]));
      function ph(g) { return gene.pheno(P(g)); }
      stem = 'In ' + c.org + ', ' + c.trait + ' shows <b>codominance</b>: <b>' + hs(c.g + '^' + c.a1[0]) + '</b> is the allele for ' + c.a1[1] + ' ' + c.of + ' and <b>' + hs(c.g + '^' + c.a2[0]) + '</b> the allele for ' + c.a2[1] + ' ' + c.of + '; a heterozygote has ' + c.het + ' ' + c.of + '. ' +
             'A ' + c.one + ' with ' + ph(a) + ' ' + c.of + ' is crossed with a ' + c.one + ' with ' + ph(b) + ' ' + c.of + '.';
      q = ratioQ(gene, a, b, [c.a1[1], c.het, c.a2[1]]);
    } else if (mode === 'abo') {
      var ALL = ['IᴬIᴬ', 'IᴬIᵒ', 'IᴮIᴮ', 'IᴮIᵒ', 'IᴬIᴮ', 'IᵒIᵒ'], bad = { 'IᴬIᴮ|IᵒIᵒ': 1, 'IᵒIᵒ|IᴬIᴮ': 1, 'IᴬIᵒ|IᴮIᵒ': 1, 'IᴮIᵒ|IᴬIᵒ': 1 };
      do { a = pick(ALL); b = pick(ALL); } while (bad[a + '|' + b] || a === b && a === 'IᵒIᵒ');
      gene = ABO;
      stem = 'The ABO blood groups: the alleles are <b>Iᴬ</b>, <b>Iᴮ</b> and <b>Iᵒ</b>; Iᴬ and Iᴮ are codominant, and both are dominant to Iᵒ. ' +
             'A woman with ' + ABO.pheno(P(a)) + ' and the genotype <b>' + hs(a) + '</b> has children with a man with ' + ABO.pheno(P(b)) + ' and the genotype <b>' + hs(b) + '</b>.';
      q = ratioQ(gene, a, b, ['A', 'B', 'AB', 'O'].map(function (x) { return 'blood group ' + x; }));
    } else {
      c = pick(SEX); gene = sexGene(c);
      var F = ['X^' + c.D + 'X^' + c.D, 'X^' + c.D + 'X^' + c.r, 'X^' + c.r + 'X^' + c.r], Mm = ['X^' + c.D + 'Y', 'X^' + c.r + 'Y'];
      do { a = G.text(P(pick(F))); b = G.text(P(pick(Mm))); } while (!c.allow(a, b));
      function sexPh(g) { var p = gene.pheno(P(g)); return p.replace(/^a (girl|boy) with /, '').replace(/^a carrier girl \((.*)\)$/, '$1, a carrier').replace(/^a (.*) (girl|boy)$/, '$1'); }
      stem = (c.name === 'haemophilia' ? '<b>Haemophilia</b> is sex-linked: the gene is on the X chromosome. ' : '<b>Red-green colour blindness</b> is sex-linked: the gene is on the X chromosome. ') +
             '<b>' + hs('X^' + c.D) + '</b> is the allele for ' + c.normal + ', and <b>' + hs('X^' + c.r) + '</b> the allele for ' + (c.hasN || 'colour blindness') + '. ' +
             'A woman (' + sexPh(a) + ', <b>' + hs(a) + '</b>) and a man (' + sexPh(b) + ', <b>' + hs(b) + '</b>) have children.';
      /* the son or the child: two different chances, both asked */
      q = pick([0, 1]) ? chanceQ(gene, a, b, 'be a ' + c.has + ' boy', function (t) { return gene.pheno(t) === 'a ' + c.has + ' boy'; }, 'a child of theirs will')
                       : sonQ(gene, a, b, c);
    }
    return { mode: mode, stem: stem, gene: gene, pg: [a, b], q: q, given: mode === 'abo' || mode === 'sex' };
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function allBoxes(gene, a, b) { var X = solve({ gene: gene, pg: [a, b] }); return [].concat(X.boxes[0], X.boxes[1]); }
  function chanceQ(gene, a, b, what, test, who) {
    var n = allBoxes(gene, a, b).filter(test).length;
    return { ask: 'What is the chance that ' + (who || 'an offspring will') + ' ' + what + '?', choices: ['0 %', '25 %', '50 %', '75 %', '100 %'], right: ['0 %', '25 %', '50 %', '75 %', '100 %'][n] };
  }
  function sonQ(gene, a, b, c) {
    var sons = allBoxes(gene, a, b).filter(function (t) { return t.some(function (x) { return x.b === 'Y'; }); });
    var n = sons.filter(function (t) { return gene.pheno(t) === 'a ' + c.has + ' boy'; }).length;
    return { ask: 'They have a son. What is the chance that he is ' + c.has + '?', choices: ['0 %', '25 %', '50 %', '75 %', '100 %'], right: ['0 %', '50 %', '100 %'][n] };
  }
  function ratioQ(gene, a, b, pool) {
    var counts = {}, order = [];
    allBoxes(gene, a, b).forEach(function (t) { var p = gene.pheno(t); if (!(p in counts)) { counts[p] = 0; order.push(p); } counts[p]++; });
    /* a ratio in its lowest terms (2 : 2 is 1 : 1), each number with its phenotype */
    function gcd(x, y) { return y ? gcd(y, x % y) : x; }
    function say(o) {
      var ks = Object.keys(o); if (ks.length === 1) return 'all ' + ks[0];
      var g = ks.reduce(function (m, k) { return gcd(m, o[k]); }, 0);
      return ks.map(function (k) { return (o[k] / g) + ' ' + k; }).join(' : ');
    }
    var right = say(counts);
    /* three wrong ratios made from the same phenotypes */
    var ph = order, alt = [];
    if (ph.length === 1) alt = [];
    pool = pool || [];
    var cands = [];
    function addC(o) { var s = say(o); if (s !== right && cands.indexOf(s) < 0) cands.push(s); }
    if (ph.length >= 2) { var o1 = {}; o1[ph[0]] = 3; o1[ph[1]] = 1; addC(o1); var o2 = {}; o2[ph[1]] = 3; o2[ph[0]] = 1; addC(o2); }
    if (ph.length === 2) { var o3 = {}; o3[ph[0]] = 1; o3[ph[1]] = 1; addC(o3); }
    if (ph.length === 1) { var o4 = {}; o4[ph[0]] = 3; var other = pool.filter(function (x) { return x !== ph[0]; })[0] || 'other'; o4[other] = 1; addC(o4); var o5 = {}; o5[ph[0]] = 1; o5[other] = 1; addC(o5); }
    var o6 = {}; ph.forEach(function (p) { o6[p] = 1; }); addC(o6);
    pool.forEach(function (x) { if (cands.length < 3 && ph.indexOf(x) < 0) { var o7 = {}; o7[ph[0]] = 1; o7[x] = 1; addC(o7); } });
    var choices = [right].concat(cands.slice(0, 3));
    return { ask: 'What is the phenotypic ratio of the offspring?', choices: shuffle(choices), right: right };
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function trainer(spec) {
    var mode = spec.mode || 'dom';
    var box = h('div', 'widget tr');
    box.appendChild(L.head(spec.title || 'Crosses to practise', mode === 'mixed' ? 'A new cross each time, of any kind: decide how to write its alleles' : 'A new cross each time: write every line', 'New cross'));
    var tally = h('p', 'tr__tally'); box.appendChild(tally);
    var body = h('div', 'tr__body'); box.appendChild(body);
    var done = 0, clean = 0;
    function paintTally() { tally.innerHTML = done ? 'Crosses finished: <b>' + done + '</b> · right at the first check: <b>' + clean + '</b>' : 'Nothing here is recorded: practise as often as you like.'; }
    function fresh() {
      var X = makeCross(mode), sol = solve(X), slipped = false;
      body.innerHTML = '';
      body.appendChild(h('p', 'tr__stem', X.stem));
      var B = G.board({ keys: X.gene.keys });
      /* line 1: the parents' genotypes (unless the stem gives them) and their gametes */
      var l1 = h('div', 'tr__line');
      l1.appendChild(h('p', 'tr__h', X.given ? '1 · The gametes of each parent' : '1 · The parents’ genotypes, and their gametes'));
      var t1 = document.createElement('table'); t1.className = 'gtgrid tr__t1';
      var who = X.gene.kind === 'sex' || X.gene.kind === 'abo' ? ['the woman', 'the man'] : ['parent 1', 'parent 2'];
      [0, 1].forEach(function (i) {
        var tr = document.createElement('tr');
        var th = document.createElement('th'); th.textContent = who[i]; tr.appendChild(th);
        var td = document.createElement('td');
        if (X.given) td.innerHTML = '<span class="gt gt--given">' + hs(X.pg[i]) + '</span>'; else td.appendChild(B.slot('p' + i, 'genotype'));
        tr.appendChild(td);
        var tg = document.createElement('td'); tg.className = 'tr__gams';
        tg.appendChild(h('span', 'tr__gl', 'gametes')); tg.appendChild(B.slot('g' + i + 'a', 'gamete')); tg.appendChild(B.slot('g' + i + 'b', 'gamete'));
        tr.appendChild(tg); t1.appendChild(tr);
      });
      l1.appendChild(t1); body.appendChild(l1);
      body.appendChild(B.pad);
      var fb = h('div', 'tr__fb'); fb.setAttribute('aria-live', 'polite');
      var chk = h('button', 'btn', 'Check line 1'); chk.type = 'button';
      body.appendChild(chk); body.appendChild(fb);
      var stage = 1, l2 = null, l3 = null;
      function same(a, b) { return G.encode(a) === G.encode(b); }
      function adviseAll(list) {
        var seen = {}, said = [];
        list.forEach(function (x) { var m = G.advice(X.gene.kind, x[1], x[0]); if (m && !seen[m]) { seen[m] = 1; said.push(m); } });
        return said.length ? '<div class="gtadvice"><p class="gtadvice__h">How to write it</p>' + said.map(function (m) { return '<p>' + m + '</p>'; }).join('') + '</div>' : '';
      }
      function check1() {
        var ok = true, wrong = [];
        [0, 1].forEach(function (i) {
          var want = P(X.pg[i]);
          if (!X.given) { var t = B.tokens('p' + i), good = same(t, want); B.mark('p' + i, good); if (!good) { ok = false; wrong.push([t, 'genotype']); } }
          /* the two gametes of a parent, in either order: right only as a pair */
          var ga = B.tokens('g' + i + 'a'), gb = B.tokens('g' + i + 'b');
          var pair = (same(ga, [want[0]]) && same(gb, [want[1]])) || (same(ga, [want[1]]) && same(gb, [want[0]]));
          B.mark('g' + i + 'a', pair); B.mark('g' + i + 'b', pair);
          if (!pair) { ok = false; wrong.push([ga, 'gamete']); wrong.push([gb, 'gamete']); }
        });
        if (!ok) { slipped = true; fb.innerHTML = '<p class="tr__no">✗ Not yet: the boxes marked in red are wrong' + (X.given ? '' : ', or the two gametes of a parent do not match its genotype') + '.</p>' + adviseAll(wrong); return; }
        fb.innerHTML = '<p class="tr__ok">✓ Line 1 is right.</p>';
        ['p0', 'p1', 'g0a', 'g0b', 'g1a', 'g1b'].forEach(function (k) { B.fix(k, true); });
        stage = 2; open2();
      }
      function open2() {
        l2 = h('div', 'tr__line');
        l2.appendChild(h('p', 'tr__h', '2 · The Punnett square: ' + who[1] + '’s gametes along the top, ' + who[0] + '’s down the side'));
        var t = document.createElement('table'); t.className = 'gtgrid gtgrid--punnett';
        var head = document.createElement('tr'); head.appendChild(document.createElement('th'));
        sol.top.forEach(function (g) { var th = document.createElement('th'); th.innerHTML = '<span class="gt gt--given">' + G.html(g) + '</span>'; head.appendChild(th); });
        t.appendChild(head);
        sol.side.forEach(function (g, r) {
          var tr = document.createElement('tr'); var th = document.createElement('th'); th.innerHTML = '<span class="gt gt--given">' + G.html(g) + '</span>'; tr.appendChild(th);
          [0, 1].forEach(function (k) { var td = document.createElement('td'); td.appendChild(B.slot('b' + r + k, 'genotype')); tr.appendChild(td); });
          t.appendChild(tr);
        });
        l2.appendChild(t);
        body.insertBefore(l2, B.pad);
        chk.textContent = 'Check the Punnett square';
        B.lock(false);
      }
      function check2() {
        var ok = true, wrong = [];
        [0, 1].forEach(function (r) { [0, 1].forEach(function (k) {
          var t = B.tokens('b' + r + k), good = same(t, sol.boxes[r][k]); B.mark('b' + r + k, good);
          if (!good) { ok = false; wrong.push([t, 'genotype']); }
        }); });
        if (!ok) { slipped = true; fb.innerHTML = '<p class="tr__no">✗ Not yet: each box is the gamete above it and the gamete beside it.</p>' + adviseAll(wrong); return; }
        fb.innerHTML = '<p class="tr__ok">✓ The Punnett square is right.</p>';
        ['b00', 'b01', 'b10', 'b11'].forEach(function (k) { B.fix(k, true); });
        stage = 3; open3();
      }
      var choice = null;
      function open3() {
        l3 = h('div', 'tr__line');
        l3.appendChild(h('p', 'tr__h', '3 · ' + X.q.ask));
        var row = h('div', 'tr__choices'); row.setAttribute('role', 'group');
        X.q.choices.forEach(function (ch) {
          var b = h('button', 'tr__ch', esc(ch)); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
          b.addEventListener('click', function () { choice = ch; Array.prototype.forEach.call(row.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); x.classList.remove('no'); }); });
          row.appendChild(b);
        });
        l3.appendChild(row);
        body.insertBefore(l3, B.pad);
        B.pad.hidden = true;
        chk.textContent = 'Check the answer';
      }
      function check3() {
        if (!choice) { fb.innerHTML = '<p class="tr__no">Choose one answer first.</p>'; return; }
        var btn = Array.prototype.filter.call(l3.querySelectorAll('.tr__ch'), function (x) { return x.getAttribute('aria-pressed') === 'true'; })[0];
        if (choice !== X.q.right) { slipped = true; if (btn) btn.classList.add('no'); fb.innerHTML = '<p class="tr__no">✗ Not yet: count the boxes in your Punnett square' + (/son/.test(X.q.ask) ? ' that are boys only: the question asks about a son.' : '. Every box is equally likely.') + '</p>'; return; }
        if (btn) btn.classList.add('ok');
        done++; if (!slipped) clean++; paintTally();
        fb.innerHTML = '<p class="tr__ok">✓ Right. ' + (slipped ? '' : 'Every line right at the first check. ') + 'Press <b>New cross</b> for another.</p>';
        chk.hidden = true; nxt.hidden = false; nxt.focus();
      }
      chk.addEventListener('click', function () { if (stage === 1) check1(); else if (stage === 2) check2(); else check3(); });
      var nxt = h('button', 'btn', 'New cross →'); nxt.type = 'button'; nxt.hidden = true;
      nxt.addEventListener('click', fresh);
      body.appendChild(nxt);
    }
    var again = h('button', 'btn btn--quiet tr__new', '↻ A different cross'); again.type = 'button';
    again.addEventListener('click', fresh);
    box.appendChild(again);
    paintTally(); fresh();
    return box;
  }
  L.add('trainer', trainer);

  /* for the build's check and the lab's own tools: every cross a mode can make, worked out */
  global.InhCross = { WORKED: WORKED, solve: solve, makeCross: makeCross, domGene: domGene, codomGene: codomGene, ABO: ABO, sexGene: sexGene };
})(window);
