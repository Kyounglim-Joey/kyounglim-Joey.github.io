/*
 * TEST-ONLY stand-in for the Umami tracker (never deployed).
 * Mimics the parts the site depends on: data-* attributes, Do Not Track, the
 * localStorage opt-out flag, data-before-send, an automatic page view, and
 * umami.track(name, data). Instead of sending, it appends the final payload
 * to localStorage "stub.log" so tests can inspect it across navigations.
 */
(function () {
  var s = document.currentScript;
  var website = s.getAttribute('data-website-id');
  var domains = (s.getAttribute('data-domains') || '').split(',').map(function (d) { return d.trim(); }).filter(Boolean);
  var dnt = s.getAttribute('data-do-not-track') === 'true';
  var excludeSearch = s.getAttribute('data-exclude-search') === 'true';
  var hook = s.getAttribute('data-before-send');

  function disabled() {
    try { if (localStorage.getItem('umami.disabled')) return true; } catch (e) {}
    if (dnt && (navigator.doNotTrack === '1' || window.doNotTrack === '1')) return true;
    if (domains.length && domains.indexOf(location.hostname) === -1) return true;
    return false;
  }
  function currentUrl() { return excludeSearch ? location.pathname : location.pathname + location.search + location.hash; }
  function send(type, payload) {
    if (disabled()) return;
    if (hook && typeof window[hook] === 'function') {
      payload = window[hook](type, payload);
      if (!payload) return;
    }
    var log = [];
    try { log = JSON.parse(localStorage.getItem('stub.log') || '[]'); } catch (e) {}
    log.push({ type: type, payload: payload });
    localStorage.setItem('stub.log', JSON.stringify(log));
  }
  function base() {
    return { website: website, hostname: location.hostname, screen: screen.width + 'x' + screen.height, language: navigator.language, title: document.title, url: currentUrl(), referrer: document.referrer };
  }
  window.umami = {
    track: function (name, data) {
      var p = base();
      if (typeof name === 'string') { p.name = name; if (data) p.data = data; }
      send('event', p);
    },
  };
  send('event', base()); // automatic page view
})();
