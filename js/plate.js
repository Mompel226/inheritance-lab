/* ============================================================
   plate.js — the left column: each station's OWN picture.

   Daniel, 7 Oct 2026: "be original … if there is no one image that joins them all, then don't. Just
   basically choose different ones for the different tabs." So there is no shared plate here. A station
   names its view in the master (`view: { kind: 'microscope', … }`), and js/views/*.js draws it:

     Views.add(kind, function (spec, ctx) { … return { el, focus(part), say, credit, stop() } })

   ctx.pick(part)   a part pressed on the picture: app.js lands on the sentence whose `group` names it
   view.focus(part) a sentence opened in the text: the picture shows that part (null: the whole view)
   view.say         the line under the picture (what you are looking at)
   view.credit      who made the picture, under it
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
  }

  /* A picture made of several photographs gives `credits` ([[name, credit], …]): a folded list under the picture, never
     words on the photographs (Daniel, 4 Nov 2026: "not on the images, because it covers the image"). It stays open while
     the reader presses the photographs, which redraws this line. */
  function caption(v) {
    if (!said) return;
    var was = said.querySelector('.said__fold'), open = !!(was && was.open);
    var list = v && v.credits && v.credits.length ? v.credits : null;
    said.innerHTML = '<span class="said__name">' + (v && v.say ? v.say : '') + '</span>' +
      (list ? '<details class="said__fold"' + (open ? ' open' : '') + '><summary>Credits for these photographs</summary><ul class="said__list">' +
        list.map(function (c) { return '<li><b>' + esc(c[0]) + '</b>: ' + esc(c[1]) + '</li>'; }).join('') + '</ul></details>' :
        v && v.credit ? '<span class="said__credit">' + v.credit + '</span>' : '');
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
    if (col) col.setAttribute('data-kind', spec.kind);
  }

  function focus(part) { if (current && current.focus) current.focus(part); }
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

  global.Plate = { init: init, showStation: showStation, focus: focus, unfocus: unfocus, home: home,
                   showSim: showSim, stageSim: stageSim, showBench: showBench, draw: draw,
                   current: function () { return current; }, esc: esc };
})(window);
