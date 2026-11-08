/* Runs synchronously in <head> to set the colour theme before first paint (no flash). */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var stored = null;
  try { stored = localStorage.getItem('theme'); } catch (e) { /* storage blocked */ }
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', stored === 'dark' || stored === 'light' ? stored : (prefersDark ? 'dark' : 'light'));
})();
