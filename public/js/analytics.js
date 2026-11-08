/*
 * Portfolio analytics layer on top of Umami (cookieless, no personal identifiers).
 *
 * Custom events (names are stable — the dashboard and docs depend on them):
 *   cv_download            CV PDF link clicked                         {location}
 *   github_profile_click   link to the GitHub profile clicked          {location}
 *   linkedin_click         LinkedIn link clicked                       {location}
 *   email_click            mailto: link clicked                        {location}
 *   contact_click          link to the CV & Contact page clicked       {location}
 *   project_view           project detail page opened (once per load)  {project}
 *   project_github_click   a project repository link clicked           {project, location}
 *   research_interest_view Research Interests block ≥50% visible ≥1 s  {section}
 *   outbound_click         any other external link clicked             {domain}
 *   page_engagement        sent once when the page is hidden/left      {engaged_s, engaged_bucket, scroll_pct}
 * Every event also carries {page, device, ref_cat}. Umami records the event time server-side.
 *
 * Engagement time counts only seconds when the tab is visible, the window has focus, and the
 * visitor interacted (scroll, key, pointer, touch) within the last 45 s. It is an estimate.
 */
(function () {
  'use strict';

  var IDLE_LIMIT_MS = 45000;
  var THROTTLE_MS = 2000;
  var MAX_ENGAGED_S = 1800;

  var debug = false;
  try { debug = localStorage.getItem('pf.debug') === '1'; } catch (e) {}
  if (debug) window.__pfDebug = function () { console.info.apply(console, ['[analytics]'].concat([].slice.call(arguments))); };

  function optedOut() { return typeof window.__pfOptedOut === 'function' && window.__pfOptedOut(); }

  /* ---------------- context (coarse, non-identifying) ---------------- */
  function device() {
    var w = Math.min(window.innerWidth || 0, (screen && screen.width) || Infinity);
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  }

  function refCategory() {
    var r = document.referrer;
    if (!r) return 'direct';
    var h;
    try { h = new URL(r).hostname.toLowerCase(); } catch (e) { return 'other'; }
    if (h === location.hostname) return 'internal';
    if (/(^|\.)github\.com$|(^|\.)github\.io$/.test(h)) return 'github';
    if (/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/.test(h)) return 'linkedin';
    if (/(^|\.)(google|bing|duckduckgo|naver|daum|yahoo|baidu|ecosia)\./.test(h)) return 'search';
    if (/\.edu$|\.ac\.[a-z]{2}$|\.edu\.[a-z]{2}$/.test(h)) return 'academic';
    if (/(^|\.)(mail\.google|outlook\.live|outlook\.office|mail\.naver)\./.test(h)) return 'email';
    if (/(^|\.)(t\.co|twitter\.com|x\.com|facebook\.com|instagram\.com|reddit\.com|threads\.net)$/.test(h)) return 'social';
    return 'other';
  }

  // Category of this page's referrer only. Nothing is written to the visitor's device for analytics,
  // so later pages in the same visit report 'internal'; Umami's own session filters give the landing source.
  var refCat = refCategory();

  var page = location.pathname;
  var project = (document.body && document.body.getAttribute('data-project')) || '';

  function base(extra) {
    var d = { page: page, device: device(), ref_cat: refCat };
    if (project) d.project = project;
    for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k) && extra[k] !== '' && extra[k] != null) d[k] = extra[k];
    return d;
  }

  /* ---------------- sending with a small queue ---------------- */
  var queue = [];
  var waited = 0;
  function flush() {
    if (window.umami && typeof window.umami.track === 'function') {
      while (queue.length) { var q = queue.shift(); window.umami.track(q[0], q[1]); }
      return true;
    }
    return false;
  }
  function poll() {
    if (flush() || waited > 15000) return;
    waited += 250; setTimeout(poll, 250);
  }
  function track(name, extra) {
    if (optedOut()) return;
    var data = base(extra || {});
    if (debug) window.__pfDebug('track', name, data);
    queue.push([name, data]);
    if (!flush() && waited === 0) poll();
  }
  window.pfTrack = track; // for future custom events: pfTrack('my_event', {location: 'x'})

  var lastSent = {};
  function trackThrottled(name, key, extra) {
    var now = Date.now(), id = name + '|' + key;
    if (lastSent[id] && now - lastSent[id] < THROTTLE_MS) return;
    lastSent[id] = now;
    track(name, extra);
  }

  /* ---------------- link clicks ---------------- */
  var PROFILE = /^https:\/\/github\.com\/kyounglim-joey\/?$/i;

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var loc = a.getAttribute('data-loc') || '';
    var explicit = a.getAttribute('data-track');
    var url;
    try { url = new URL(href, location.href); } catch (err) { return; }

    if (explicit) {
      var extra = { location: loc };
      if (a.getAttribute('data-project')) extra.project = a.getAttribute('data-project');
      trackThrottled(explicit, href, extra);
      return;
    }
    if (url.protocol === 'mailto:') { trackThrottled('email_click', 'mailto', { location: loc }); return; }
    if (url.origin === location.origin) {
      if (/\.pdf$/i.test(url.pathname)) trackThrottled('cv_download', url.pathname, { location: loc, file: url.pathname });
      else if (/^\/cv\/?$/.test(url.pathname)) trackThrottled('contact_click', 'cv-page', { location: loc });
      return;
    }
    if (url.hostname === 'github.com') {
      if (PROFILE.test(url.origin + url.pathname)) trackThrottled('github_profile_click', 'profile', { location: loc });
      else trackThrottled('project_github_click', url.pathname, { location: loc, project: a.getAttribute('data-project') || '' });
      return;
    }
    if (/(^|\.)linkedin\.com$/.test(url.hostname)) { trackThrottled('linkedin_click', 'li', { location: loc }); return; }
    trackThrottled('outbound_click', url.hostname, { domain: url.hostname });
  }, { capture: true });

  /* ---------------- project_view (once per page load) ---------------- */
  if (project) track('project_view', {});

  /* ---------------- research_interest_view (once per page load) ---------------- */
  var ri = document.querySelector('[data-track-view="research_interests"]');
  if (ri && 'IntersectionObserver' in window) {
    var timer = null, done = false;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (done) return;
        if (en.isIntersecting && en.intersectionRatio >= 0.5) {
          timer = timer || setTimeout(function () {
            if (document.visibilityState !== 'visible') { timer = null; return; }
            done = true; obs.disconnect();
            track('research_interest_view', { section: 'research_interests' });
          }, 1000);
        } else if (timer) { clearTimeout(timer); timer = null; }
      });
    }, { threshold: [0, 0.5, 1] });
    obs.observe(ri);
  }

  /* ---------------- engagement time & scroll depth ---------------- */
  var activeMs = 0;
  var lastActivity = Date.now();
  var lastTick = Date.now();
  var maxScroll = 0;
  var sent = false;

  function markActive() { lastActivity = Date.now(); }
  ['scroll', 'keydown', 'pointerdown', 'pointermove', 'touchstart', 'wheel'].forEach(function (t) {
    window.addEventListener(t, markActive, { passive: true });
  });
  window.addEventListener('focus', markActive);

  function measureScroll() {
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    var pct = scrollable <= 0 ? 100 : Math.round(((window.scrollY || doc.scrollTop) / scrollable) * 100);
    if (pct > maxScroll) maxScroll = Math.min(100, pct);
  }
  window.addEventListener('scroll', measureScroll, { passive: true });
  measureScroll();

  setInterval(function () {
    var now = Date.now();
    var dt = Math.min(now - lastTick, 2000); // guard against timer throttling in background tabs
    lastTick = now;
    var visible = document.visibilityState === 'visible';
    var focused = typeof document.hasFocus === 'function' ? document.hasFocus() : true;
    if (visible && focused && now - lastActivity < IDLE_LIMIT_MS) activeMs += dt;
  }, 1000);

  function bucket(s) {
    if (s < 10) return '0-10s';
    if (s < 30) return '10-30s';
    if (s < 60) return '30-60s';
    if (s < 180) return '1-3m';
    if (s < 600) return '3-10m';
    return '10m+';
  }
  function scrollBucket(p) {
    if (p >= 90) return 100;
    if (p >= 75) return 75;
    if (p >= 50) return 50;
    if (p >= 25) return 25;
    return 0;
  }

  function sendEngagement() {
    if (sent) return;
    sent = true;
    var s = Math.min(Math.round(activeMs / 1000), MAX_ENGAGED_S);
    track('page_engagement', { engaged_s: s, engaged_bucket: bucket(s), scroll_pct: scrollBucket(maxScroll) });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') sendEngagement();
  });
  window.addEventListener('pagehide', sendEngagement);

  // Allow tests to read the current estimate without sending anything.
  window.__pfEngagement = function () { return { activeMs: activeMs, maxScroll: maxScroll, sent: sent }; };
})();
