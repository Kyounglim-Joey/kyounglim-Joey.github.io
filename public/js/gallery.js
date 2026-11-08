/* Carousel controls for [data-gallery]: page by visible width, keep buttons/status in sync. */
(function () {
  document.querySelectorAll('[data-gallery]').forEach(function (root) {
    var vp = root.querySelector('.g-viewport');
    var items = root.querySelectorAll('.g-track > li');
    var prev = root.querySelector('[data-dir="-1"]');
    var next = root.querySelector('[data-dir="1"]');
    var status = root.querySelector('.g-status');
    if (!vp || !items.length) return;

    function perView() {
      var w = items[0].getBoundingClientRect().width;
      return Math.max(1, Math.round(vp.clientWidth / w));
    }
    function first() {
      var w = items[0].getBoundingClientRect().width;
      var gap = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft - w : 0;
      return Math.round(vp.scrollLeft / (w + gap));
    }
    function update() {
      var n = perView(), f = first();
      var last = Math.min(items.length, f + n);
      if (status) status.textContent = (f + 1) + (last > f + 1 ? '–' + last : '') + ' of ' + items.length;
      if (prev) prev.disabled = vp.scrollLeft <= 2;
      if (next) next.disabled = vp.scrollLeft + vp.clientWidth >= vp.scrollWidth - 2;
    }
    function go(dir) {
      var target = Math.max(0, Math.min(items.length - 1, first() + dir * perView()));
      vp.scrollTo({ left: items[target].offsetLeft - items[0].offsetLeft });
    }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    vp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    var t;
    vp.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(update, 80); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
