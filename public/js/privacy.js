/* Opt-out toggle on /privacy/. Uses Umami's own flag (localStorage "umami.disabled"). */
(function () {
  var box = document.getElementById('optout');
  var status = document.getElementById('optout-status');
  if (!box) return;
  var get = function () { try { return !!localStorage.getItem('umami.disabled'); } catch (e) { return false; } };
  var show = function () {
    var off = get();
    box.checked = off;
    if (navigator.globalPrivacyControl === true) status.textContent = 'Global Privacy Control detected: measurement is already off.';
    else status.textContent = off ? 'Measurement is off for this browser.' : 'Measurement is on (cookieless, aggregate).';
  };
  box.addEventListener('change', function () {
    try {
      if (box.checked) localStorage.setItem('umami.disabled', '1');
      else localStorage.removeItem('umami.disabled');
    } catch (e) { status.textContent = 'Your browser blocks local storage; please use Do Not Track instead.'; return; }
    show();
  });
  show();
})();
