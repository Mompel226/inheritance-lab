/* ============================================================
   terms.js — the colour language of the Learn tab, for Topic 17, Inheritance.

   · Three inks, the T17 revision summary's own (Daniel's summaries: "Green bold = structures (chromosomes, genes,
     nucleus, ribosomes…), orange bold = processes (mitosis, meiosis, fertilisation…), rose bold = substances (DNA, mRNA,
     proteins, amino acids…)"), so a word looks the same in the summary and in the lab.
   · A word with a definition but no colour of its own carries the quiet dotted rule; the words of inheritance (allele,
     genotype, dominant …) are bold in the plain ink, as key words.
   Same API as the other labs' terms.js, so app.js is the same code (the Immunity Lab's, 4 Nov 2026).

   What a mark promises — Daniel's rule, the same in every lab:
     a magnifying glass   a picture opens where you are
     a faint dotted rule  the definition opens where you are
     an arrow             you are taken to another station
     an arrow down        the word's key-word card, at the bottom of this station
   The arrow is only for a journey with something at the other end (GOES_THERE); one arrow per
   destination per station; one in a sentence at most; never in a caption or a widget's steps; never
   a word inside a negative. A station that is not built yet is never a destination.
   ============================================================ */
(function (global) {
  'use strict';

  var CATS = {
    struct: { n: '', label: 'Structures', chip: false },
    proc:   { n: '', label: 'Processes', chip: false },
    subst:  { n: '', label: 'Substances', chip: false },
    plain:  { n: '', label: 'Words used across the labs', chip: false }
  };

  var CHIP_WORDS = {};

  var PLAIN_WORDS = {
    struct: ['chromosome', 'chromosomes', 'nucleus', 'nuclei', 'gene', 'genes', 'ribosome', 'ribosomes', 'cytoplasm',
             'X chromosome', 'X chromosomes', 'Y chromosome', 'Y chromosomes', 'sex chromosomes', 'sex chromosome',
             'gamete', 'gametes', 'egg cell', 'egg cells', 'sperm cell', 'sperm cells', 'zygote', 'embryo',
             'testes', 'testis', 'ovaries', 'anthers', 'ovules', 'daughter cell', 'daughter cells', 'stem cell', 'stem cells',
             'bone marrow', 'pores', 'pore', 'chromatid', 'chromatids'],
    proc:   ['mitosis', 'meiosis', 'fertilisation', 'fertilised', 'exact replication', 'replication', 'nuclear division',
             'reduction division', 'inheritance', 'asexual reproduction', 'sexual reproduction', 'test cross', 'expressed',
             'not expressed', 'gene expression', 'transmission'],
    subst:  ['DNA', 'mRNA', 'messenger RNA', 'protein', 'proteins', 'amino acid', 'amino acids', 'bases', 'sequence of bases',
             'enzyme', 'enzymes', 'amylase', 'receptors for neurotransmitters', 'membrane carriers', 'carrier proteins', 'genetic material'],
    plain:  ['allele', 'alleles', 'genotype', 'genotypes', 'phenotype', 'phenotypes', 'homozygous', 'heterozygous',
             'dominant allele', 'recessive allele', 'dominant', 'recessive', 'pure-breeding', 'codominance', 'codominant',
             'blood group', 'blood groups', 'ABO blood groups', 'sex-linked characteristic', 'sex-linked', 'sex linkage',
             'red-green colour blindness', 'colour-blind', 'carrier', 'carriers', 'pedigree diagram', 'genetic diagram',
             'Punnett square', 'monohybrid cross', 'phenotypic ratio', 'ratio', 'likelihood', 'probability', 'haploid', 'diploid',
             'genetically identical', 'genetically different', 'chromosome number', 'halved', 'maintained', 'one set', 'two sets',
             '23 pairs', 'raised letter', 'raised letters', 'capital', 'specialised', 'unspecialised',
             'growth', 'repair of damaged tissues', 'replacement of cells', 'genome']
  };

  /* --------- what happens when you click a term ---------
     peek : a small picture appears where you clicked — for a thing you need to SEE
     jump : go to the station where the word is properly explained
     Each station's own left picture shows its parts, so no word here opens a picture. */
  var PEEK = {};
  var CONTEXT = {};

  /* statistics words that open a worked explanation when clicked (the Plants Lab has them): none in this lab */
  var STAT = {};

  /* Where a word is taught. A station that is not built yet is no destination: the list is checked
     against the stations this build carries (global.STATIONS). */
  var BUILT = {};
  (global.STATIONS || []).forEach(function (s) { BUILT[s.id] = true; });
  var JUMP = {};
  function jump(list, st) { if (BUILT[st]) list.forEach(function (w) { JUMP[w] = st; }); }
  jump(['mitosis'], 'mitosis');
  jump(['meiosis'], 'meiosis');
  jump(['test cross'], 'testcross');
  jump(['Punnett square', 'genetic diagram'], 'crosses');
  jump(['codominance', 'codominant', 'blood groups', 'ABO blood groups'], 'abo');
  jump(['sex-linked', 'sex-linked characteristic', 'red-green colour blindness'], 'sexlinked');
  jump(['pedigree diagram'], 'pedigree');
  jump(['stem cells', 'stem cell'], 'uses');
  jump(['mRNA', 'messenger RNA'], 'protein');

  /* --------- build one matcher, longest phrase first --------- */
  var ENTRIES = [];
  Object.keys(CHIP_WORDS).forEach(function (cat) { CHIP_WORDS[cat].forEach(function (w) { ENTRIES.push([w, cat, true]); }); });
  Object.keys(PLAIN_WORDS).forEach(function (cat) { PLAIN_WORDS[cat].forEach(function (w) { ENTRIES.push([w, cat, false]); }); });
  ENTRIES.sort(function (a, b) { return b[0].length - a[0].length; });

  var DEFINED = {};
  (global.GLOSSARY || []).forEach(function (e) { DEFINED[e.term.toLowerCase()] = e.term; });
  /* a plural or an inflection opens the singular's definition */
  function defined(low) {
    if (DEFINED[low]) return DEFINED[low];
    var F = global.GLOSSARY_FORMS || {}; if (F[low]) return F[low];   /* the plural, the singular, the verb, an alias: worked out at build time */
    var tries = [low.replace(/ies$/, 'y'), low.replace(/ata$/, 'a'), low.replace(/s$/, ''), low.replace(/es$/, ''), low.replace(/ed$/, ''), low.replace(/ing$/, 'e'), low.replace(/ing$/, '')];
    for (var i = 0; i < tries.length; i++) if (tries[i] !== low && DEFINED[tries[i]]) return DEFINED[tries[i]];
    return null;
  }

  var KNOWN = {};
  var KNOWN_KEY = 'labs.knownWords.v1';
  try { (JSON.parse(localStorage.getItem(KNOWN_KEY) || '[]') || []).forEach(function (w) { KNOWN[w] = 1; }); } catch (e) {}
  function saveKnown() { try { localStorage.setItem(KNOWN_KEY, JSON.stringify(Object.keys(KNOWN))); } catch (e) {} }
  function setKnown(term, yes) { var low = String(term).toLowerCase(); if (yes) KNOWN[low] = 1; else delete KNOWN[low]; saveKnown(); }
  function isKnown(term) { return !!KNOWN[String(term).toLowerCase()]; }
  function forgetAll() { KNOWN = {}; saveKnown(); }
  function knownCount() { return Object.keys(KNOWN).length; }

  var INFO = {};
  ENTRIES.forEach(function (e) { if (!INFO[e[0].toLowerCase()]) INFO[e[0].toLowerCase()] = e; });

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var RE = new RegExp('(?<![A-Za-z0-9-])(' + ENTRIES.map(function (e) { return escRe(e[0]); }).join('|') + ')(?![A-Za-z0-9-])', 'gi');

  /* the words with something at the other end worth the journey: a table, a widget, a
     picture, the part itself. Everything else with a definition opens it in place. */
  var GOES_THERE = {};
  ['mitosis', 'meiosis', 'test cross', 'Punnett square', 'codominance', 'sex-linked', 'pedigree diagram', 'mRNA', 'stem cells']
    .forEach(function (w) { GOES_THERE[w] = true; });

  var here = null, seen = null, quiet = false, wentTo = null, teaching = false, arrowed = false, kwGiven = null;
  /* this station's key-word cards (the flip cards at the bottom of its Learn tab), by the word in lower case. Each key word
     has ONE card in the lab, in the station that first teaches it (Daniel, 25 Oct 2026: "please do not repeat keywords"),
     and in that station the word's first mention leads down to its card ("should then link to the flashcard at the
     bottom of it"), never away to another station */
  var KW = {};
  var NEVER_DOTTED = {};
  /* The pictures this station is about to put on the page. A magnifier that opens one of
     them shows the reader what is already in front of them — worst where the caption of a
     picture uses the very word, so the word beside the dark dust opens the dark dust. Where
     that would happen the word takes its definition instead, which is the next thing it has
     to give. */
  var SHOWN = {};
  function setShown(m) { SHOWN = m || {}; }
  function setStation(id) {
    here = id; seen = Object.create(null); quiet = false; wentTo = Object.create(null); kwGiven = Object.create(null); KW = {};
    (global.STATIONS || []).forEach(function (s) { if (s.id === id) (s.keywords || []).forEach(function (w) { KW[String(w.term).toLowerCase()] = w.term; }); });
  }
  /* a widget built afresh (its reset) marks its words as it did the first time: forget what it introduced */
  function unsee(words, jumps) {
    if (seen) (words || []).forEach(function (w) { var low = String(w).toLowerCase(), d = defined(low); delete seen[low]; if (d) delete seen[d.toLowerCase()]; });
    if (wentTo) (jumps || []).forEach(function (j) { delete wentTo[j]; });
  }
  /* a card that opens on its own (app.js makeCard) is read on its own: its key words are bold in it, even when an earlier
     card used them (Daniel, 4 Nov 2026: "HIV … should be bolden. Nothing was bolden here"). A word's ↓ to its key-word card
     and an arrow to a station still come once a station. */
  function freshCard() { if (seen) seen = Object.create(null); }
  function setQuiet(v) { quiet = !!v; }
  function teach(v) { teaching = !!v; }

  var U0 = '', U1 = '';
  function underlineMarks(escaped) { return escaped.replace(/_([^_\n]{1,240})_/g, U0 + '$1' + U1); }
  function underlineTags(html) {
    return html.replace(new RegExp(U0 + '([\\s\\S]*?)' + U1, 'g'), function (m, inner) {
      return '<u class="syl-u">' + inner.replace(/<i class="tc__n">[^<]*<\/i>/g, '').replace(/<\/?[bi][^>]*>/g, '') + '</u>';
    });
  }

  /* a word inside a negative is a word about something that is NOT there */
  var NEGATED = /(?:^|[\s(—-])(?:no|not|non|never|without|neither|nor|lack|lacks|lacking|nothing)\s+(?:[a-z]+\s+){0,2}$/i;


  /* ---- a word can be a glossary word and still be the wrong word ----
     The glossary matches on spelling. "Control" as a verb is not the control in an experiment;
     "mean" as a verb ("that means") is not the average; "range" of a value is the statistic only
     where numbers are about; "plaque" on teeth is not the plaque in an artery; "pump" as a verb
     stays plain after "to". Each rule says: this spelling, in this context, is not the glossary's
     sense — leave it alone. Add to it rather than removing a word from the glossary. */
  var NOT_HERE = {
    /* "host" as the verb is not the organism a pathogen lives in */
    'host':     [{ before: /\b(to|they|can|will)\s+$/i }]
  };
  function wrongSense(low, before, after, whole) {
    var rules = NOT_HERE[low];
    if (!rules) return false;
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.before && r.before.test(before)) return true;
      if (r.after && r.after.test(after)) return true;
      if (r.unlessWhole && !r.unlessWhole.test(whole) && here !== r.orStation) return true;   /* the glossary's sense needs this context, and it is not here */
    }
    return false;
  }

  function mark(text) {
    arrowed = false;                              /* one arrow in a sentence at most */
    return underlineTags(underlineMarks(esc(text)).replace(RE, function (m, _g, at, whole) {
      var low = m.toLowerCase(), e = INFO[low];
      if (!e) return m;
      if (STAT[low]) return '<b class="t t--plain is-stat" data-stat="' + STAT[low] + '" data-term="' + esc(m) + '" tabindex="0" role="button">' + m + '</b>';
      /* a word inside a syllabus phrase (_..._) is underlined, never clickable: it does not use up the
         word's one mark, so the next time the word comes it is offered */
      var raw = String(whole).slice(0, at);
      if (raw.lastIndexOf(U0) > raw.lastIndexOf(U1)) return m;
      var before = raw.replace(/<[^>]*>/g, '');
      if (NEGATED.test(before)) return m;
      if (wrongSense(low, before, String(whole).slice(at + m.length).replace(/<[^>]*>/g, ''), String(whole).replace(/<[^>]*>/g, ''))) return m;
      var cat = e[1], act = '', cls = '';
      var def = defined(low), idea = def ? def.toLowerCase() : low;     /* "clots" and "blood clot" are one idea */
      var first = !quiet && !(seen && (seen[low] || seen[idea]));
      if (seen) { seen[low] = true; seen[idea] = true; }
      if (!first) return m;
      if (NEVER_DOTTED[low]) def = null;
      var ctx = (CONTEXT[here] || {})[low];
      var canJump = teaching && !arrowed;
      var pk0 = ctx || PEEK[low];
      var card = KW[low] || KW[idea];
      if (pk0 && !SHOWN[pk0[0]]) {
        var pk = pk0;
        act = ' data-peek="' + pk[0] + '" data-note="' + esc(pk[1]) + '"' + (pk[2] ? ' data-credit="' + esc(pk[2]) + '"' : '') + ' tabindex="0" role="button"';
        cls = ' is-peek';
      } else if (teaching && card && def && !KNOWN[def.toLowerCase()] && !(kwGiven && kwGiven[card.toLowerCase()])) {
        if (kwGiven) kwGiven[card.toLowerCase()] = true;
        /* its key-word card is at the bottom of this station: down to it, not away */
        act = ' data-kw="' + esc(card.toLowerCase()) + '" tabindex="0" role="button"';
        cls = ' is-kw';
      } else if (JUMP[low] === here) {
        return '<b class="t t--' + cat + '">' + m + '</b>';
      } else if (canJump && JUMP[low] && GOES_THERE[low] && !(wentTo && wentTo[JUMP[low]])) {
        if (wentTo) wentTo[JUMP[low]] = true;
        arrowed = true;
        act = ' data-jump="' + JUMP[low] + '" tabindex="0" role="button"';
        cls = ' is-jump';
      } else if (def && !KNOWN[def.toLowerCase()]) {
        act = ' data-gloss="' + esc(def) + '" tabindex="0" role="button"';
        cls = ' is-gloss';
      }
      return '<b class="t t--' + cat + cls + '"' + act + (act ? ' data-term="' + esc(m) + '"' : '') + '>' + m + '</b>';
    }));
  }

  function legend() {
    var out = '<p class="legend__intro">Each colour is one part of the topic.</p><div class="legend">';
    ['struct', 'proc', 'subst'].forEach(function (c) {
      out += '<span class="legend__i"><b class="t t--' + c + '">' + CATS[c].label + '</b></span>';
    });
    out += '</div>';
    return out;
  }

  global.Terms = { setKnown: setKnown, isKnown: isKnown, forgetAll: forgetAll, knownCount: knownCount, mark: mark, legend: legend, unsee: unsee,
                   CATS: CATS, setStation: setStation, freshCard: freshCard, setQuiet: setQuiet, setShown: setShown, teach: teach, PEEK: PEEK, JUMP: JUMP };
})(window);

/* A number never parts from its unit at a line break — 20 °C, 5 min, 48 mm, 60 %, 4 marks, pH 2 — wherever the page
   writes one: the theory, a question, the bench, a pop-up, the syllabus. The join is made in the text itself as the
   page changes, so nothing that renders text has to remember to do it. */
(function () {
  var UNIT = /(\d)[ \t]+(%|°C|°|mm³\/min|mm\/min|mm³|mm|cm³|cm|dm³|m\b|km\b|µm\b|μm\b|nm\b|min\b|minutes?\b|seconds?\b|s\b|hours?\b|h\b|days?\b|weeks?\b|years?\b|kg\b|mg\b|g\b|ml\b|l\b|kPa\b|kJ\b|J\b|runs?\b|trials?\b|marks?\b|leaves\b|grams?\b|degrees?\b|metres?\b|litres?\b|per cent\b|chews?\b|drops?\b)/g;
  var LEAD = /\b(pH|[Dd]ay|[Tt]ube|Paper|Topic|Question|Stage|Step|Figure|Fig\.)[ \t]+(\d)/g;
  function fix(t) {
    var p = t.parentNode; if (!p || p.nodeType !== 1) return;
    var tag = p.tagName; if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'OPTION') return;
    var v = t.nodeValue; if (!/\d/.test(v)) return;
    var n = v.replace(UNIT, '$1\u00A0$2').replace(LEAD, '$1\u00A0$2');
    if (n !== v) t.nodeValue = n;
  }
  function join(node) {
    if (!node) return;
    if (node.nodeType === 3) { fix(node); return; }
    if (node.nodeType !== 1 && node.nodeType !== 11) return;
    var w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT), t, list = [];
    while ((t = w.nextNode())) list.push(t);
    list.forEach(fix);
  }
  function watch() {
    join(document.body);
    new MutationObserver(function (recs) {
      recs.forEach(function (r) { if (r.type === 'characterData') fix(r.target); else for (var i = 0; i < r.addedNodes.length; i++) join(r.addedNodes[i]); });
    }).observe(document.body, { subtree: true, childList: true, characterData: true });
  }
  if (document.body) watch(); else document.addEventListener('DOMContentLoaded', watch);
})();

/* Say, the hard words' spelling guides and their 🔊 UK and US buttons, lives in labs-shared/say/say.js since 8 Nov 2026
   (one copy for every engine lab; the build copies it in as js/say.js). */
