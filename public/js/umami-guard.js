/*
 * Privacy guard for the Umami tracker. Loaded BEFORE the tracker script because the
 * tracker looks up `data-before-send="umamiBeforeSend"` on window when it starts.
 *
 * Every payload the tracker is about to send (page views and custom events) passes
 * through umamiBeforeSend(). It:
 *   1. cancels the send if the visitor opted out on /privacy/ or sends Global Privacy Control;
 *   2. removes query strings and fragments from the page URL;
 *   3. reduces the referrer to its origin (e.g. https://www.google.com/), so search terms,
 *      tokens, or other parameters in the previous page's URL are never transmitted;
 *   4. keeps only allow-listed event properties and caps their length.
 * Do Not Track is honoured by the tracker itself (data-do-not-track="true").
 */
(function () {
  var ALLOWED_PROPS = {
    page: 1, project: 1, location: 1, device: 1, ref_cat: 1, target: 1, domain: 1,
    engaged_s: 1, engaged_bucket: 1, scroll_pct: 1, section: 1, file: 1
  };

  function optedOut() {
    try {
      if (localStorage.getItem('umami.disabled')) return true;
    } catch (e) { /* storage blocked: fall through */ }
    return navigator.globalPrivacyControl === true;
  }

  function stripUrl(u) {
    if (typeof u !== 'string' || !u) return u;
    try {
      var url = new URL(u, location.origin);
      // Same-origin URLs are reported as a path; others as origin + path.
      return url.origin === location.origin ? url.pathname : url.origin + url.pathname;
    } catch (e) {
      return u.split(/[?#]/)[0];
    }
  }

  function originOnly(r) {
    if (typeof r !== 'string' || !r) return r;
    try { return new URL(r).origin + '/'; } catch (e) { return ''; }
  }

  function cleanData(data) {
    if (!data || typeof data !== 'object') return data;
    var out = {};
    Object.keys(data).forEach(function (k) {
      if (!ALLOWED_PROPS[k]) return;
      var v = data[k];
      if (typeof v === 'string') out[k] = v.split(/[?#]/)[0].slice(0, 120);
      else if (typeof v === 'number' && isFinite(v)) out[k] = v;
      else if (typeof v === 'boolean') out[k] = v;
    });
    return out;
  }

  window.__pfOptedOut = optedOut;

  window.umamiBeforeSend = function (type, payload) {
    if (optedOut() || !payload) return false;
    var p = Object.assign({}, payload);
    if (p.url) p.url = stripUrl(p.url);
    if ('referrer' in p) p.referrer = originOnly(p.referrer);
    if (p.data) p.data = cleanData(p.data);
    if (typeof window.__pfDebug === 'function') window.__pfDebug('send', type, p);
    return p;
  };
})();
