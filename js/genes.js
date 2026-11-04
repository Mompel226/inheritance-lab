/* ============================================================
   genes.js — writing alleles, and the crosses this lab works out.

   Daniel, 4 Nov 2026: "many students make the mistake of not adding superscripts or confusing what they need to put as a
   superscript and what they need to put as the uppercase letter … guide them to not make that mistake." The 0610 examiner
   reports name the same mistakes: AA and AO with no raised letters for blood group A (Nov 2019); capital and small letters
   for a codominant gene (Nov 2011); colour-blindness alleles on the Y, or no X and Y at all (June 2022); XᵇYᵇ for a
   colour-blind boy (Nov 2018); blood-group symbols such as IᴴIʰ for a dominant and a recessive allele (March 2023).

   Three ways to write an allele, one for each kind of gene:
     dom    a dominant and a recessive allele: ONE letter, the capital for the dominant, the small for the recessive (R, r)
     codom  codominant alleles: the gene's capital letter ON the line, each allele a RAISED letter on it (Cᴿ, Cᵂ);
            the ABO gene (abo) is I, with Iᴬ, Iᴮ and Iᵒ, as the syllabus writes them (17.4.15)
     sex    a gene on the X chromosome: the allele RAISED on the X (Xᴮ, Xᵇ); the Y chromosome has no copy, so Y alone
     xy     the sex chromosomes alone (the sex of a child): X and Y, nothing raised

   So an allele here is a token { b, s }: b the letter on the line, s the raised letter (or none). The pupil builds them on
   a keypad (or the keyboard: ^ raises the next letter), never as plain text, because the shared marking lowercases every
   typed answer (labs-shared/engine/marking.js norm), which would make RR, Rr and rr one answer.

   THE CODE — must stay identical to ../inheritance-lab-source/genes.mjs (tools/build.mjs proves it on every build):
     a capital is its small letter + "+", a small letter is itself; a raised letter follows "^"; the alleles of one
     genotype are put in one order (sorted) and joined by "."; so Rr and rR are one answer, Rr and RR are two.
   The result is all small letters, so norm() leaves it as it is, and the question is marked as an ordinary gap.
   ============================================================ */
(function (global) {
  'use strict';

  /* the raised letters a pasted answer may carry (Unicode's modifier letters) */
  var SUP = { 'ᴬ':'A','ᴮ':'B','ᴰ':'D','ᴱ':'E','ᴳ':'G','ᴴ':'H','ᴵ':'I','ᴶ':'J','ᴷ':'K','ᴸ':'L','ᴹ':'M','ᴺ':'N','ᴼ':'O','ᴾ':'P','ᴿ':'R','ᵀ':'T','ᵁ':'U','ᵂ':'W',
              'ᵃ':'a','ᵇ':'b','ᶜ':'c','ᵈ':'d','ᵉ':'e','ᶠ':'f','ᵍ':'g','ʰ':'h','ⁱ':'i','ʲ':'j','ᵏ':'k','ˡ':'l','ᵐ':'m','ⁿ':'n','ᵒ':'o','ᵖ':'p','ʳ':'r','ˢ':'s','ᵗ':'t','ᵘ':'u','ᵛ':'v','ʷ':'w','ˣ':'x','ʸ':'y','ᶻ':'z' };
  var TO_SUP = {}; Object.keys(SUP).forEach(function (k) { TO_SUP[SUP[k]] = k; });

  /* "Iᴬ Iᵒ", "I^AI^o", "XᴮY", "Rr" → [{b,s}] */
  function parse(str) {
    var out = [], up = false, s = String(str || '');
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (c === '^') { up = true; continue; }
      if (SUP[c]) { if (out.length) out[out.length - 1].s = SUP[c]; else out.push({ b: SUP[c], s: '' }); up = false; continue; }
      if (!/[A-Za-z]/.test(c)) { up = false; continue; }
      if (up && out.length) out[out.length - 1].s = c;
      else out.push({ b: c, s: '' });
      up = false;
    }
    return out;
  }
  function encOne(c) { return c === c.toUpperCase() && c !== c.toLowerCase() ? c.toLowerCase() + '+' : c; }
  function encode(tokens) {
    return (tokens || []).map(function (t) { return encOne(t.b) + (t.s ? '^' + encOne(t.s) : ''); }).sort().join('.');
  }
  /* an allele or a genotype as the page shows it: the raised letter as a real superscript */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function html(tokens) { return (tokens || []).map(function (t) { return esc(t.b) + (t.s ? '<sup>' + esc(t.s) + '</sup>' : ''); }).join(''); }
  function text(tokens) { return (tokens || []).map(function (t) { return t.b + (t.s ? (TO_SUP[t.s] || '^' + t.s) : ''); }).join(''); }
  /* how a screen reader says it: "I raised A, I raised o" */
  function spoken(tokens) {
    if (!tokens || !tokens.length) return 'empty';
    return tokens.map(function (t) { return (t.b === t.b.toUpperCase() ? 'capital ' : 'small ') + t.b + (t.s ? ' with raised ' + (t.s === t.s.toUpperCase() ? 'capital ' : 'small ') + t.s : ''); }).join(', ');
  }

  /* ---------- the rule a written answer breaks, if any (its words never name the answer) ----------
     kind: dom | codom | abo | sex;  role: 'genotype' (two alleles; a man's sex-linked genotype is X and Y) or 'gamete' */
  function advice(kind, role, tokens) {
    var t = tokens || [];
    if (!t.length) return '';
    var n = t.length;
    /* the way of writing first (an answer typed with no raised letters has too many letters as well: the writing is the
       mistake to name), then the number of alleles */
    var rule = writing(kind, t);
    if (rule) return rule;
    if (role === 'gamete' && n !== 1) return 'A gamete carries <b>one</b> allele of the gene: write one allele in each gamete box.';
    if (role === 'genotype' && n !== 2) return 'A genotype has <b>two</b> alleles of the gene, one from each parent' + (kind === 'sex' ? ' (for this gene: two X chromosomes, or an X and a Y)' : '') + '.';
    return '';
  }
  function writing(kind, t) {
    var n = t.length;
    var raised = t.filter(function (x) { return x.s; }).length;
    var xy = t.filter(function (x) { return /^[XYxy]$/.test(x.b); }).length;
    if (kind === 'dom') {
      if (raised) return 'This gene has a <b>dominant</b> and a <b>recessive</b> allele: write each allele as <b>one letter</b>, with <b>no raised letter</b>. Raised letters are for codominant genes and for genes on the X chromosome.';
      if (xy) return 'This gene is not on a sex chromosome: write the alleles alone, with no X or Y.';
      var L = t.map(function (x) { return x.b.toLowerCase(); });
      if (L.some(function (c) { return c !== L[0]; })) return 'Use <b>one letter</b> for the gene: the <b>capital</b> for the dominant allele and <b>the same letter, small</b>, for the recessive allele.';
      return '';
    }
    if (kind === 'codom' || kind === 'abo') {
      if (!raised) return 'The alleles of this gene are <b>codominant</b>: each allele is written as a <b>raised letter</b> on the gene’s capital letter. Letters with nothing raised, or a capital and a small letter, would mean a dominant and a recessive allele.';
      if (raised < n) return 'Every allele of a codominant gene is a <b>raised letter</b> on the gene’s capital letter: one of your letters stands on the line with nothing raised on it.';
      if (n > 1 && t.every(function (x) { return x.s === t[0].s; }) && t.some(function (x) { return x.b !== t[0].b; }))
        return 'The two letters are swapped: the letter <b>on the line</b> is the gene’s capital letter, the same in both alleles, and the <b>raised</b> letter names each allele.';
      if (t.some(function (x) { return x.b !== x.b.toUpperCase(); })) return 'The letter <b>on the line</b> names the gene, and it is a <b>capital</b>. The raised letter names the allele.';
      if (t.some(function (x) { return x.b !== t[0].b; })) return 'Both alleles of one gene stand on <b>the same capital letter</b>: only the raised letters differ.';
      if (kind === 'abo' && t[0].b !== 'I') return 'The ABO gene is written <b>I</b>, with the allele raised on it. The raised letter is the blood group’s A or B, or a small o.';
      return '';
    }
    if (kind === 'xy') {
      if (raised) return 'Here you write only the sex chromosomes, <b>X</b> and <b>Y</b>, with no raised letters: there is no allele to show.';
      if (xy < n) return 'Write the sex chromosomes as <b>X</b> and <b>Y</b>.';
      if (t.some(function (x) { return x.b !== x.b.toUpperCase(); })) return 'The chromosomes are capitals: <b>X</b> and <b>Y</b>.';
      return '';
    }
    if (kind === 'sex') {
      if (t.some(function (x) { return /^[XYxy]$/.test(x.s); })) return 'The letters are swapped: <b>X</b> and <b>Y</b>, the chromosomes, stand on the line, and the allele is the <b>raised</b> letter on the X.';
      if (xy < n) return 'This gene is on the <b>X chromosome</b>: write each allele as a <b>raised letter on an X</b>, and the Y alone. A letter with no X or Y says nothing about where the gene is.';
      if (t.some(function (x) { return /^[Yy]$/.test(x.b) && x.s; })) return 'The <b>Y chromosome has no copy</b> of this gene: write <b>Y alone</b>, with no raised letter.';
      if (t.some(function (x) { return /^[Xx]$/.test(x.b) && !x.s; })) return 'Every X chromosome carries <b>one allele</b> of this gene: write it as a <b>raised letter on the X</b>.';
      if (t.some(function (x) { return x.b !== x.b.toUpperCase(); })) return 'The chromosomes are capitals, <b>X</b> and <b>Y</b>. Only the raised letter, the allele, is a capital or a small letter.';
      return '';
    }
    return '';
  }

  /* ---------- crosses: gametes, offspring, phenotypes ----------
     A gene is { kind, alleles: { 'R': 'round', … } (dom/codom: by allele), pheno(genotype tokens) → words } */
  function gametes(tokens) { return tokens.map(function (t) { return [t]; }); }
  function key(t) { return t.b + (t.s ? '^' + t.s : ''); }
  /* the four boxes of a Punnett square: rows = side gametes, cols = top gametes */
  function punnett(top, side) {
    return side.map(function (g2) { return top.map(function (g1) { return order([g1[0], g2[0]]); }); });
  }
  /* a genotype in its usual order: the dominant (capital) allele first; an X before a Y; Iᴬ before Iᴮ before Iᵒ */
  function order(t) {
    return t.slice().sort(function (a, b) {
      if (a.b === 'Y' && b.b !== 'Y') return 1; if (b.b === 'Y' && a.b !== 'Y') return -1;
      if (a.s || b.s) { var A = rankSup(a.s), B = rankSup(b.s); return A - B; }
      var ua = a.b === a.b.toUpperCase(), ub = b.b === b.b.toUpperCase();
      return ua === ub ? 0 : ua ? -1 : 1;
    });
  }
  function rankSup(s) { if (!s) return 9; var u = s === s.toUpperCase(); return (u ? 0 : 4) + (s.toUpperCase() === 'A' ? 0 : s.toUpperCase() === 'B' ? 1 : 2); }

  global.Genes = { parse: parse, encode: encode, html: html, text: text, spoken: spoken, advice: advice,
                   gametes: gametes, punnett: punnett, order: order, key: key, TO_SUP: TO_SUP };

  /* ============================================================
     A board: boxes a pupil fills with alleles, and the keypad that fills the box in use. The genotype card below and the
     crosses to practise (js/w-cross.js) both use it, so a pupil writes alleles the same way everywhere.
       var B = Genes.board({ keys: 'RrX', onEnter: fn });  B.pad (the keypad, to place), B.slot(key, role) (a box),
       B.tokens(key), B.mark(key, true|false|null), B.lock(on), B.keys()
     ============================================================ */
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function board(opts) {
    opts = opts || {};
    var slots = {}, order = [], active = null, raise = false, locked = false;
    function label(b) { return (b.__role === 'gamete' ? 'Gamete' : 'Genotype') + ' box ' + b.dataset.gap + ': ' + spoken(b.__t); }
    function paint(b) {
      var caret = b === active ? '<i class="gt__caret' + (raise ? ' gt__caret--up' : '') + '" aria-hidden="true"></i>' : '';
      b.innerHTML = b.__t.length ? html(b.__t) + caret : (caret || '<span class="gt__ph">' + (b.__role === 'gamete' ? 'allele' : 'genotype') + '</span>');
      b.setAttribute('aria-label', label(b));
    }
    function focusSlot(b, fromFocus) {
      if (locked || b.__locked) return;
      var was = active; active = b;
      order.forEach(function (k) { slots[k].classList.toggle('is-active', slots[k] === b); });
      if (was && was !== b) { raise = false; paint(was); }
      paint(b); paintPad();
      if (!fromFocus) b.focus({ preventScroll: true });
    }
    function slot(key, role) {
      var b = h('span', 'gt'); b.tabIndex = 0;
      b.setAttribute('role', 'textbox'); b.dataset.gap = key; b.__role = role || 'genotype';
      b.__t = [];
      slots[key] = b; order.push(key);
      paint(b);
      b.addEventListener('click', function () { focusSlot(b); });
      b.addEventListener('focus', function () { focusSlot(b, true); });
      b.addEventListener('blur', function () { setTimeout(function () { if (active === b && document.activeElement && !pad.contains(document.activeElement)) { active = null; b.classList.remove('is-active'); raise = false; paintPad(); paint(b); } }, 0); });
      b.addEventListener('keydown', function (e) { onKey(e, b); });
      return b;
    }
    var pad = h('div', 'gtpad'); pad.setAttribute('role', 'group'); pad.setAttribute('aria-label', 'Letters for the boxes');
    var up = h('button', 'gtpad__k gtpad__k--up', '<span aria-hidden="true">x<sup>↑</sup></span> raised letter'); up.type = 'button';
    up.setAttribute('aria-pressed', 'false');
    up.addEventListener('mousedown', function (e) { e.preventDefault(); });
    function first() { for (var i = 0; i < order.length; i++) if (!slots[order[i]].__locked) return slots[order[i]]; return null; }
    up.addEventListener('click', function () { if (!active) focusSlot(first()); if (!active) return; raise = !raise; paintPad(); paint(active); active.focus({ preventScroll: true }); });
    String(opts.keys || 'Rr').split('').forEach(function (ch) {
      var k = h('button', 'gtpad__k', esc(ch)); k.type = 'button';
      k.setAttribute('aria-label', (ch === ch.toUpperCase() ? 'capital ' : 'small ') + ch);
      k.addEventListener('mousedown', function (e) { e.preventDefault(); });
      k.addEventListener('click', function () { if (!active) focusSlot(first()); if (!active) return; type(active, ch); active.focus({ preventScroll: true }); });
      pad.appendChild(k);
    });
    pad.appendChild(up);
    var del = h('button', 'gtpad__k gtpad__k--del', '⌫ <span class="gtpad__w">delete</span>'); del.type = 'button';
    del.setAttribute('aria-label', 'Delete the last letter');
    del.addEventListener('mousedown', function (e) { e.preventDefault(); });
    del.addEventListener('click', function () { if (!active) return; back(active); active.focus({ preventScroll: true }); });
    pad.appendChild(del);
    function paintPad() { up.setAttribute('aria-pressed', raise ? 'true' : 'false'); pad.classList.toggle('is-up', raise); }
    function type(b, ch) {
      if (!b || locked || b.__locked) return;
      /* raised: the letter goes up on the last letter of the box (a second raised letter replaces the first) */
      if (raise && b.__t.length) b.__t[b.__t.length - 1].s = ch;
      else b.__t.push({ b: ch, s: '' });
      raise = false; paintPad(); paint(b); mark(b.dataset.gap, null);
      if (opts.onChange) opts.onChange(b.dataset.gap);
    }
    function back(b) {
      if (!b.__t.length || locked || b.__locked) return;
      var last = b.__t[b.__t.length - 1];
      if (last.s) last.s = ''; else b.__t.pop();
      raise = false; paintPad(); paint(b); mark(b.dataset.gap, null);
      if (opts.onChange) opts.onChange(b.dataset.gap);
    }
    function onKey(e, b) {
      if (e.key === '^') { raise = !raise; paintPad(); paint(b); e.preventDefault(); return; }
      if (e.key === 'Backspace' || e.key === 'Delete') { back(b); e.preventDefault(); return; }
      if (/^[A-Za-z]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) { type(b, e.key); e.preventDefault(); return; }
      if (e.key === 'Enter' && opts.onEnter) { opts.onEnter(); e.preventDefault(); }
    }
    function mark(key, ok) { var b = slots[key]; if (!b) return; b.classList.toggle('ok', ok === true); b.classList.toggle('no', ok === false); }
    return {
      pad: pad, slot: slot,
      tokens: function (key) { return slots[key] ? slots[key].__t.slice() : []; },
      set: function (key, t) { var b = slots[key]; if (!b) return; b.__t = (t || []).map(function (x) { return { b: x.b, s: x.s }; }); paint(b); },
      fix: function (key, on) { var b = slots[key]; if (!b) return; b.__locked = !!on; b.classList.toggle('is-fixed', !!on); b.tabIndex = on ? -1 : 0; },
      mark: mark, keys: function () { return order.slice(); }, role: function (key) { return slots[key] && slots[key].__role; },
      lock: function (on) { locked = !!on; if (on && active) { var a = active; active = null; a.classList.remove('is-active'); paint(a); } }
    };
  }
  global.Genes.board = board;

  /* ============================================================
     The genotype card: a question of type 'blank' whose `genes` says how its gaps are written
     (genes: { kind, roles: { gap: 'gamete'|'genotype' }, keys: 'RrX…', grid: [[cell…]…], punnett: true }).
     Each gap is a box the pupil fills from the keypad. `grid` lays the gaps out as a genetic diagram or a Punnett
     square: a cell is '' (empty), '{n}' (gap n), '#text' (a heading) or any other text (given, written as an allele).
     ============================================================ */
  var E = global.Engine; if (!E || !E.util) return;
  var U = E.util;

  function card(a, idx, id) {
    var g = a.genes || {}, kind = g.kind || 'dom', roles = g.roles || {};
    var c = U.shell(a, idx);
    var kn = c.querySelector('.act__kind'); if (kn) { kn.textContent = 'Write the alleles'; kn.dataset.k = 'genes'; }
    var B = board({ keys: g.keys, onEnter: function () { var chk = c.querySelector('.act__foot .btn'); if (chk && chk.style.display !== 'none') chk.click(); } });

    if (g.grid) {
      var tbl = document.createElement('table'); tbl.className = 'gtgrid' + (g.punnett ? ' gtgrid--punnett' : '');
      g.grid.forEach(function (row, ri) {
        var tr = document.createElement('tr');
        row.forEach(function (cell, ci) {
          var isHead = typeof cell === 'string' && cell.charAt(0) === '#';
          var td = document.createElement(isHead || (g.punnett && (ri === 0 || ci === 0)) ? 'th' : 'td');
          var m = typeof cell === 'string' ? cell.match(/^\{(\d+)\}$/) : null;
          if (m) td.appendChild(B.slot(m[1], roles[m[1]]));
          else if (isHead) td.innerHTML = cell.slice(1);
          else if (cell) td.innerHTML = '<span class="gt gt--given">' + html(parse(cell)) + '</span>';
          tr.appendChild(td);
        });
        tbl.appendChild(tr);
      });
      var gw = h('div', 'gtwrap'); gw.appendChild(tbl); c.appendChild(gw);
    } else {
      var wrap = h('div', 'cloze cloze--gt');
      String(a.text || '').split(/(\{\d+\})/).forEach(function (p) {
        var m = p.match(/^\{(\d+)\}$/);
        if (!m) { wrap.appendChild(document.createTextNode(p)); return; }
        wrap.appendChild(B.slot(m[1], roles[m[1]]));
      });
      c.appendChild(wrap);
    }
    (a.anyOrder || []).forEach(function (grp) {
      c.appendChild(h('p', 'act__hint', 'Boxes ' + grp.join(' and ') + ' may be filled in either order.'));
    });
    c.appendChild(B.pad);
    c.appendChild(h('p', 'act__hint', 'Press a box, then the letters. For a <b>raised</b> letter, press <b>x<sup>↑</sup> raised letter</b> first (on a keyboard, type ^ first). ⌫ deletes the last letter.'));

    var advBox = null;
    U.foot(c, function () {
      var vals = {}, empty = 0, keys = B.keys();
      keys.forEach(function (k) { var t = B.tokens(k); vals[k] = encode(t); if (!t.length) empty++; });
      if (empty === keys.length) return null;
      return global.Marking.check(a, id, vals).then(function (res) {
        keys.forEach(function (k) { B.mark(k, !!res.gaps[k]); });
        if (res.correct) B.lock(true);
        return res;
      });
    }, function () {
      B.keys().forEach(function (k) { B.mark(k, null); });
      if (advBox) { advBox.remove(); advBox = null; }
    }, 'Not right yet: the boxes marked in red are wrong. Your letters are kept as you left them.');
    /* after a wrong check: the writing rule each wrong box breaks, in words that never name the answer */
    c.addEventListener('result', function (e) {
      if (!e.detail || e.detail.correct) return;
      var seen = {}, said = [];
      B.keys().forEach(function (k) {
        if (e.detail.gaps && e.detail.gaps[k]) return;
        var m = advice(kind, roles[k] || 'genotype', B.tokens(k));
        if (m && !seen[m]) { seen[m] = 1; said.push(m); }
      });
      if (!said.length) return;
      var fb = c.querySelector('.feedback'); if (!fb) return;
      advBox = h('div', 'gtadvice', '<p class="gtadvice__h">How to write it</p>' + said.map(function (m) { return '<p>' + m + '</p>'; }).join(''));
      fb.appendChild(advBox);
    });
    return c;
  }

  var render = E.render;
  E.render = function (a, idx, id) {
    if (a && a.type === 'blank' && a.genes) return card(a, idx, id);
    return render(a, idx, id);
  };
})(window);
