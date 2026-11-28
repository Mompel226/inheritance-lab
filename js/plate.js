/* ============================================================
   plate.js — the left column: each station's OWN picture.

   Daniel, 7 Oct 2026: "be original … if there is no one image that joins them all, then don't. Just
   basically choose different ones for the different tabs." So there is no shared plate here. A station
   names its view in the master (`view: { kind: 'microscope', … }`), and js/views/*.js draws it:

     Views.add(kind, function (spec, ctx) { … return { el, focus(part), say, credit, stop() } })

   ctx.pick(part)   a part pressed on the picture: app.js lands on the sentence whose `group` names it
   view.focus(part) a sentence opened in the text: the picture shows that part (null: the whole view)
   view.say         the line under the picture (what you are looking at)
   view.note        what the picture leaves out, draws to scale or adds to that line: under the i too on a laptop, under the line
                    itself on a phone or a tablet
   view.credit      who made the picture, under the i beside the line (view.credits: several photographs' credits, the same)
   view.stop()      the station is left: pause anything that moves

   Each station's view is built once and kept, so a reader who comes back finds it as they left it.
   The rest is the interface app.js has always called (the Circulation Lab's plate.js): showStation,
   focus, unfocus, home, showSim, stageSim, showBench, draw.
   ============================================================ */
(function (global) {
  'use strict';
  var KINDS = {};
  global.Views = { add: function (kind, fn) { KINDS[kind] = fn; }, has: function (kind) { return !!KINDS[kind]; } };

  var col, host, sim, said, opts = {}, built = {}, current = null, currentId = null;

  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function init(o) {
    opts = o || {};
    col = document.querySelector('.viewcol'); host = el('viewHost'); sim = el('simHost'); said = el('said');
    wireCaption();
  }

  /* The caption is one line: what the picture shows. What it leaves out, draws to scale or adds to that line (`note`), and
     who made it (`credit`; a picture of several photographs: `credits`, [[name, credit], …], never words on the photographs:
     Daniel, 4 Nov 2026, "it covers the image"), wait one press away under the i beside it, over the foot of the picture
     (Daniel, 27 Nov 2026, the Membrane Lab: "the animation is the priority … too much text that impedes the visualization";
     28 Nov 2026, every lab). On a phone or a tablet the note stands under the line, where the picture leaves room for it,
     and the i opens only credits. It stays open while the picture redraws this line; a press anywhere else, or Esc, closes it. */
  function caption(v) {
    if (!said) return;
    var was = said.querySelector('.said__i'), open = !!(was && was.getAttribute('aria-expanded') === 'true');
    var list = v && v.credits && v.credits.length ? v.credits : null, note = v && v.note ? v.note : '';
    var cred = list ? '<span class="said__h">Credits for these photographs</span><span class="said__list">' +
        list.map(function (c) { return '<span class="said__li"><b>' + esc(c[0]) + '</b>: ' + esc(c[1]) + '</span>'; }).join('') + '</span>' :
      v && v.credit ? '<span class="said__credit">' + v.credit + '</span>' : '';
    var more = (note ? '<span class="said__note">' + note + '</span>' : '') + cred;
    said.innerHTML = '<span class="said__name">' + (v && v.say ? v.say : '') + '</span>' +
      (note ? '<span class="said__nt">' + note + '</span>' : '') + (more ?
      '<button class="said__i' + (cred ? '' : ' said__i--note') + '" type="button" aria-expanded="' + open + '" aria-controls="saidMore" aria-label="' + (list ? (note ? 'About this picture, and credits for its photographs' : 'Credits for these photographs') : 'About this picture') + '">i</button>' +
      '<span class="said__more" id="saidMore" role="note"' + (open ? '' : ' hidden') + '>' + more + '</span>' : '');
  }
  function shutMore(back) {
    var b = said && said.querySelector('.said__i[aria-expanded="true"]'); if (!b) return;
    b.setAttribute('aria-expanded', 'false');
    var m = said.querySelector('.said__more'); if (m) m.hidden = true;
    if (back) b.focus();
  }
  function wireCaption() {
    if (!said) return;
    said.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('.said__i') : null, m = said.querySelector('.said__more');
      if (!b || !m) return;
      var on = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', on ? 'true' : 'false'); m.hidden = !on;
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') shutMore(true); });
    document.addEventListener('pointerdown', function (e) { if (!said.contains(e.target)) shutMore(false); });
  }

  function showStation(st) {
    if (!host) return;
    if (col) col.classList.remove('is-sim');
    if (sim) sim.hidden = true;
    if (current && current.stop) current.stop();
    Array.prototype.slice.call(host.children).forEach(function (c) { c.hidden = true; });
    var spec = st && st.view;
    currentId = st ? st.id : null;
    if (!spec || !KINDS[spec.kind]) { current = null; caption(null); return; }
    if (!built[st.id]) {
      var v = KINDS[spec.kind](spec, { station: st.id, pick: function (part, o) { if (opts.onPick) opts.onPick(part, o); }, caption: function () { if (current === v) caption(v); } });
      v.el.classList.add('view');
      v.el.setAttribute('data-view', spec.kind);
      host.appendChild(v.el);
      built[st.id] = v;
    }
    current = built[st.id];
    current.el.hidden = false;
    if (current.start) current.start();
    if (current.focus) current.focus(null);
    caption(current);
    if (col) { col.setAttribute('data-kind', spec.kind); col.setAttribute('data-station', st.id); }   /* the station sets the column's width: css/inheritance.css */
  }

  function focus(part) { if (current && current.focus) current.focus(part); }
  /* every part an open card names (null: the card closed), for a picture that marks them all (views/pedigree.js); focus
     still gets the first, as every picture does */
  function group(ids) { if (current && current.group) current.group(ids); }
  function unfocus() { focus(null); }
  function home() { focus(null); }

  /* the Practise tab's simulation, or a staged widget, standing in the column */
  function stageSim(on) {
    if (!col || !sim) return;
    col.classList.toggle('is-sim', !!on);
    sim.hidden = !on;
    if (host) host.hidden = !!on;
    if (global.PlateFold) global.PlateFold.lend(!!on);
  }
  function showSim(on) { stageSim(on); }
  function showBench() {}

  /* the names of the parts, for the "← back to" chip after a part pressed on the picture */
  function draw() {
    var G = {};
    var labels = current && current.labels ? current.labels : {};
    Object.keys(labels).forEach(function (k) { G[k] = { label: labels[k] }; });
    return { G: G };
  }

  global.Plate = { init: init, showStation: showStation, focus: focus, group: group, unfocus: unfocus, home: home,
                   showSim: showSim, stageSim: stageSim, showBench: showBench, draw: draw,
                   current: function () { return current; }, esc: esc };
})(window);
