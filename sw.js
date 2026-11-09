/* ============================================================
   sw.template.js — the offline worker every engine lab shares.

   tools/build.mjs fills in the four placeholders below — the lab's name, this build's
   version, the list of stamped files, and a hash per picture — and writes the result to that
   lab's repo root as sw.js. Its scope is therefore exactly /<lab>/ on Pages:
   the most a worker gets by default, this lab and nothing above it. Never edit sw.js.

   ---------------------------------------------------------------------------
   THE ONE DECISION THAT MATTERS: the HTML document is fetched NETWORK-FIRST.

   A service worker on GitHub Pages is the one change that cannot be undone by pushing a fix,
   because we cannot set response headers. The way that goes wrong is always the same: the
   worker serves a cached index.html forever, and every later deploy is invisible. The usual
   defence is a version banner and a kill switch, and the usual result is that a class sits on
   a stale page for a lesson while someone works out why.

   So this worker never prefers the cache for the document while the network is reachable. It
   asks the network first, with a short timeout, and only falls back to what it holds when
   that fails. Online, a student sees exactly what they see today. Offline, they get the lab.

   Everything else IS cache-first, and safely so, because every other URL is immutable by
   construction: index.html carries a ?v= stamp on every script and stylesheet, and the stamp
   changes whenever the file does, so a cached ?v=1 file can never stand in for ?v=2. Pictures
   are keyed by a hash of their own bytes for the same reason.

   The cost is one small document fetch per online load (15–20 KB; the Classification Lab's is
   about 230 KB, with its silhouettes inlined, and less over gzip). That is the price of making the
   unrecoverable failure impossible, and it is worth paying.
   ---------------------------------------------------------------------------

   Cache names are prefixed with the lab, because every lab — and the hubs, and the other
   sites — share the origin nlcsbiology.com and therefore share one CacheStorage.
   ============================================================ */
const LAB        = 'inheritance-lab';
const VERSION    = '1794204578';
const SHELL      = LAB + '-shell-v' + VERSION;
const MEDIA      = LAB + '-media';
const PRECACHE   = ["./css/app.css?v=1794204578","./css/inheritance.css?v=1794204578","./js/config.js?v=1794204578","./js/data/glossary.js?v=1794204578","./js/data/glossary-tr.js?v=1794204578","./js/data/syllabus.js?v=1794204578","./js/data/stations.js?v=1794204578","./js/data/photos.js?v=1794204578","./js/terms.js?v=1794204578","./js/say.js?v=1794204578","./js/marking.js?v=1794204578","./js/sync.js?v=1794204578","./js/signin.js?v=1794204578","./js/homework.js?v=1794204578","./js/engine.js?v=1794204578","./js/syllabus.js?v=1794204578","./js/widgets.js?v=1794204578","./js/learn.js?v=1794204578","./js/w-common.js?v=1794204578","./js/engine-ext.js?v=1794204578","./js/plate.js?v=1794204578","./js/genes.js?v=1794204578","./js/inh-draw.js?v=1794204578","./js/inh-scenes.js?v=1794204578","./js/w-kit.js?v=1794204578","./js/w-zoom.js?v=1794204578","./js/w-protein.js?v=1794204578","./js/w-divide-ib.js?v=1794204578","./js/w-divide.js?v=1794204578","./js/inh-films.js?v=1794204578","./js/inh-uses.js?v=1794204578","./js/w-cross.js?v=1794204578","./js/views/gallery.js?v=1794204578","./js/views/figure.js?v=1794204578","./js/views/pedigree.js?v=1794204578","./js/app.js?v=1794204578","./js/glossary-lang.js?v=1794204578"];      /* every stamped .js and .css, taken from the HTML the build just stamped */
const MEDIA_REV  = {"photos/blood-ab-700.jpg":"3bb34405","photos/blood-ab-700.webp":"51f91284","photos/embryo-8-640.jpg":"ba87ace6","photos/embryo-8-640.webp":"55668242","photos/ishihara-900.jpg":"606c82ee","photos/ishihara-900.webp":"dce5197a","photos/mitosis-cell-900.jpg":"4048a6da","photos/mitosis-cell-900.webp":"6eb3da66","say/allele-us.mp3":"79a913db","say/asexual-us.mp3":"2cfab9c7","say/centromere-en.mp3":"db01bfbf","say/chromosome-us.mp3":"126cbe50","say/cytoplasm-us.mp3":"b0648d34","say/dehydrogenation-en.mp3":"da5a3556","say/dominant-us.mp3":"6f70ba82","say/fertilisation-us.mp3":"194f4bf1","say/gamete-us.mp3":"63bdb289","say/gene-en.mp3":"c67abb88","say/genome-us.mp3":"f077cb06","say/genotype-us.mp3":"b92e36d0","say/haploid-en.mp3":"685dac2b","say/homozygous-us.mp3":"090ce183","say/inheritance-us.mp3":"5a119219","say/lysosome-uk.mp3":"6cb1df99","say/meiosis-us.mp3":"8d9cc0af","say/mitosis-en.mp3":"e155475e","say/nucleolus-uk.mp3":"ecbd3966","say/nucleotide-us.mp3":"7d0f1f90","say/nucleus-us.mp3":"d5fd312a","say/phenotype-us.mp3":"3ba22368","say/phospholipid-en.mp3":"bdc5e900","say/recessive-uk.mp3":"de9ef162","say/ribosome-en.mp3":"41fc0538","say/zygote-us.mp3":"0b7b5be6"};     /* 'photos/x.jpg' -> a short hash of its bytes */
const DOC_TIMEOUT = 3000;

/* ---------- install: take a complete, self-consistent copy ---------- */
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const c = await caches.open(SHELL);
    /* cache:'reload' is not optional. A Request built from a plain string uses the default
       cache mode, so './' would come from the browser's own HTTP cache — which Pages lets it
       hold for ten minutes — while the never-before-seen ?v= urls come from the network. That
       pairs an old document with new files, which is the exact failure this worker exists to
       avoid. */
    const doc = await fetch('./', { cache: 'reload' });
    if (!doc.ok) throw new Error('index responded ' + doc.status);
    await c.put('./', doc.clone());
    await c.addAll(PRECACHE);
    /* And then check what is ACTUALLY in the cache, not what the server said. If the document
       we hold does not name this worker's own version, throw: a failed install simply never
       activates, and the lab goes on behaving exactly as it does without a worker. */
    const held = await (await c.match('./')).text();
    const m = held.match(/stations\.js\?v=(\d+)/);
    if (!m || m[1] !== VERSION) {
      await caches.delete(SHELL);
      throw new Error('cached index is v' + (m && m[1]) + ' but this worker is v' + VERSION);
    }
  })());
});

/* ---------- activate: drop this lab's old shells, and only this lab's ---------- */
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const k of await caches.keys())
      if (k.indexOf(LAB + '-shell-v') === 0 && k !== SHELL) await caches.delete(k);
    /* forget pictures that are no longer in the build */
    const media = await caches.open(MEDIA);
    const want = new Set(Object.keys(MEDIA_REV).map(p => p + '?r=' + MEDIA_REV[p]));
    for (const req of await media.keys()) {
      const u = new URL(req.url);
      const rel = u.pathname.split('/assets/')[1];
      if (rel && !want.has(rel + u.search)) await media.delete(req);
    }
    /* clients.matchAll is scoped to the ORIGIN, not to this worker: every lab lives on
       nlcsbiology.com, so an unfiltered broadcast would pop a "newer version" banner in
       ANOTHER lab's tab, whose Reload button would then do nothing for ever. */
    const cs = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const c of cs)
      if (c.url.indexOf(self.registration.scope) === 0)
        c.postMessage({ type: 'VERSION', lab: LAB, version: VERSION });
  })());
});

self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });

/* ---------- fetch ---------- */
function inScope(url) { return url.href.indexOf(self.registration.scope) === 0; }

async function fromNetworkFirst(request) {
  /* the document. Online it is always the live one; offline it is the last one we held. */
  const cache = await caches.open(SHELL);
  try {
    const net = await Promise.race([
      fetch(request, { cache: 'no-store' }),
      new Promise((_, no) => setTimeout(() => no(new Error('slow')), DOC_TIMEOUT))
    ]);
    if (net && net.ok) { cache.put('./', net.clone()); return net; }
    throw new Error('document responded ' + (net && net.status));
  } catch (e) {
    const held = await cache.match('./');
    if (held) return held;
    throw e;
  }
}

async function cacheFirst(request, cacheName) {
  /* Anything unexpected in here — CacheStorage refused in a private window, quota, a bug —
     must end in an ordinary network fetch. A respondWith that rejects does not fall back to
     the network: it fails the request outright, which would be a blank lab. */
  try {
    const cache = await caches.open(cacheName);
    const hit = await cache.match(request);
    if (hit) return hit;
    const net = await fetch(request);
    if (net && net.ok && net.type === 'basic') cache.put(request, net.clone());
    return net;
  } catch (e) {
    return fetch(request);
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  /* A Range request is how Safari on iOS plays and scrubs a video. Answering one from a whole
     cached body breaks playback silently on exactly that browser, so never touch them. */
  if (req.headers.has('range')) return;
  const url = new URL(req.url);
  /* cross-origin — the Google sign-in client, the font stylesheet — is never this worker's
     business. Letting it through untouched is what keeps sign-in working. */
  if (url.origin !== location.origin || !inScope(url)) return;

  if (req.mode === 'navigate') { event.respondWith(fromNetworkFirst(req)); return; }

  const rel = url.pathname.slice(new URL(self.registration.scope).pathname.length);

  /* stamped code: the url changes whenever the file does, so the cache can never be stale */
  if (url.search.indexOf('v=') >= 0 && /\.(js|css)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(req, SHELL)); return;
  }
  /* pictures, video posters, silhouettes: keyed by a hash of their own bytes */
  if (rel.indexOf('assets/') === 0) {
    const key = rel.slice('assets/'.length);
    const rev = MEDIA_REV[key];
    if (rev) {
      const keyed = new Request(url.origin + url.pathname + '?r=' + rev, { mode: 'same-origin' });
      event.respondWith((async () => {
        try {
          const cache = await caches.open(MEDIA);
          const hit = await cache.match(keyed);
          if (hit) return hit;
          const net = await fetch(req);
          /* the put has to be held open by the event: mobile Chrome and iOS Safari stop the
             worker the moment respondWith settles, so a detached put is dropped on exactly
             the devices this is for, while working every time on a Mac. */
          if (net && net.ok && net.type === 'basic') event.waitUntil(cache.put(keyed, net.clone()));
          return net;
        } catch (e) { return fetch(req); }
      })());
      return;
    }
  }
  /* version.txt above all: it is how the page learns a deploy has happened */
  /* everything else goes straight to the network */
});
