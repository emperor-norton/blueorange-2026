/* blueorange.com — shared motion and reading aid.
   Smooth scroll (Lenis, loaded before this file), rise-in blocks, scroll-scrubbed figures,
   outcome count-up, fixed logo tiles, and the sentence highlight. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  /* ---------- Rise-in blocks and count-up ---------- */
  var rises = $$('.m-rise');
  var nums = $$('.stat .n');
  var outcomes = document.querySelector('.outcomes');
  var counted = false;

  function delayFor(el) {
    var group = el.closest('.outcomes, .cards');
    if (!group) return 0;
    var sibs = Array.prototype.filter.call(group.children, function (c) { return c.classList.contains('m-rise'); });
    var i = sibs.indexOf(el);
    return group.classList.contains('cards') ? (i % 2) * 60 + Math.floor(i / 2) * 30 : i * 60;
  }

  function countUp() {
    if (counted) return;
    counted = true;
    var start = null, dur = 800;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      nums.forEach(function (n) { n.textContent = (n.dataset.pre || '') + Math.round(+n.dataset.to * e) + (n.dataset.suf || '%'); });
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (!reduce && 'IntersectionObserver' in window) {
    var vh = window.innerHeight;
    rises.forEach(function (el) {
      if (el.getBoundingClientRect().top > vh * 0.92) el.classList.add('pending');
    });
    var outcomesBelow = outcomes && nums.length && outcomes.getBoundingClientRect().top > vh * 0.92;
    if (outcomesBelow) nums.forEach(function (n) { n.textContent = (n.dataset.pre || '') + '0' + (n.dataset.suf || '%'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el === outcomes) { countUp(); io.unobserve(el); return; }
        el.style.transitionDelay = delayFor(el) + 'ms';
        el.classList.remove('pending');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    rises.forEach(function (el) { if (el.classList.contains('pending')) io.observe(el); });
    if (outcomesBelow) io.observe(outcomes);
  }

  /* ---------- Scroll-scrubbed figures ---------- */
  var settles = [];
  if (!reduce) {
    var vh0 = window.innerHeight;
    settles = $$('.m-settle').filter(function (el) { return el.getBoundingClientRect().top > vh0 * 0.85; });
  }
  function scrub() {
    var vh = window.innerHeight;
    settles.forEach(function (el) {
      var p = clamp((vh - el.getBoundingClientRect().top) / (vh * 0.7));
      var e = 1 - Math.pow(1 - p, 2);
      el.style.transform = 'translateY(' + (56 * (1 - e)).toFixed(1) + 'px) scale(' + (0.9 + 0.1 * e).toFixed(4) + ')';
      el.style.opacity = (0.3 + 0.7 * e).toFixed(3);
    });
  }

  /* ---------- Logo tiles ---------- */
  var tiles = document.querySelector('.tiles');
  var more = document.getElementById('more');
  function tilesCheck() {
    if (!tiles) return;
    // Step aside only while the blue project cards pass under the tiles, then come back.
    var grid = document.querySelector('.cards');
    var g = grid && grid.getBoundingClientRect();
    var tb = tiles.getBoundingClientRect().height + 16;
    var hide = g ? (g.top < tb && g.bottom > 0) : false;
    tiles.classList.toggle('away', hide);
    tiles.classList.toggle('small', window.scrollY > 80);
  }

  var ticking = false;
  function onScroll() {
    tilesCheck();
    if (!ticking && settles.length) { ticking = true; requestAnimationFrame(function () { ticking = false; scrub(); }); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  tilesCheck();
  if (settles.length) scrub();

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', onScroll);
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }

  var toTop = document.getElementById('toTop');
  if (toTop) toTop.addEventListener('click', function (e) {
    e.preventDefault();
    if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---------- Hero straddle: gray band ends at the hero's midpoint ---------- */
  var story = document.querySelector('.case .story'), shot = story && story.querySelector('.shot');
  if (shot) {
    var frameH = 0; // live hero: height of the scaled frame, without its controls
    var split = function () {
      var s = story.getBoundingClientRect(), r = shot.getBoundingClientRect();
      story.style.setProperty('--split', Math.round(r.top - s.top + (frameH || r.height) * 0.5) + 'px');
    };
    split();
    window.addEventListener('resize', split);
    // Live hero (iframe): it reports its own height after scaling; size to it and re-split at the frame's midpoint.
    var live = shot.querySelector('iframe.hero-live');
    if (live) window.addEventListener('message', function (e) {
      if (e.source !== live.contentWindow || !e.data || !e.data.sasHero) return;
      live.style.aspectRatio = 'auto';
      live.style.height = Math.ceil(e.data.sasHero) + 'px';
      frameH = e.data.frame;
      // round the embed's top corners too, for browsers that don't clip the scaled window inside it
      live.style.borderRadius = (12 * e.data.frame / 760) + 'px ' + (12 * e.data.frame / 760) + 'px 0 0';
      split();
    });
    $$('.case .story .shot img').forEach(function (i) { if (!i.complete) i.addEventListener('load', split); });
  }

  /* ---------- Reading aid ---------- */
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover) {
    var seg = (window.Intl && Intl.Segmenter) ? new Intl.Segmenter('en', { granularity: 'sentence' }) : null;
    var sentences = function (text) {
      if (seg) return Array.from(seg.segment(text), function (s) { return s.segment; });
      return text.match(/[^.!?]+[.!?]+[\s ]*|[^.!?]+$/g) || [text];
    };
    $$('.prose p, .prose li').forEach(function (b) {
      if (b.children.length) return; // leave blocks with markup (bold leads, links) intact
      var text = b.textContent;
      b.textContent = '';
      sentences(text).forEach(function (part) {
        var trimmed = part.replace(/\s+$/, '');
        var span = document.createElement('span');
        span.className = 's';
        span.textContent = trimmed;
        b.appendChild(span);
        if (trimmed.length < part.length) b.appendChild(document.createTextNode(' '));
      });
      (b.closest('ul') || b).classList.add('readable');
    });
    var current = null;
    var clear = function () {
      if (!current) return;
      current.classList.remove('on');
      var h = current.closest('.readable');
      if (h) h.classList.remove('reading');
      current = null;
    };
    document.addEventListener('pointerover', function (e) {
      var s = e.target.closest && e.target.closest('.readable .s');
      if (s === current) return;
      clear();
      if (!s) return;
      current = s;
      s.classList.add('on');
      s.closest('.readable').classList.add('reading');
    });
  }
})();
