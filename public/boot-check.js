(function () {
  window.__SB_BOOT__ = true;

  function tick() {
    var el = document.getElementById("sb-connect-status");
    if (!el) return;
    el.hidden = true;
  }

  tick();
  document.addEventListener("DOMContentLoaded", tick);
})();
