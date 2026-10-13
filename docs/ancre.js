(function () {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  var timer = null, touched = false;
  ["touchstart", "wheel", "keydown", "mousedown"].forEach(function (ev) {
    addEventListener(ev, function () { touched = true; }, { passive: true });
  });
  // Bas de l'en-tête fixe, pour coller la carte juste dessous
  function haut() {
    var el = document.elementFromPoint(innerWidth / 2, 4);
    while (el && el !== document.body) {
      var p = getComputedStyle(el).position;
      if (p === "fixed" || p === "sticky") {
        var b = el.getBoundingClientRect().bottom;
        return b > 0 && b < 120 ? b : 60;
      }
      el = el.parentElement;
    }
    return 60;
  }
  function cible() {
    var e = document.querySelector("[data-view=accueil] .etapes");
    if (!e || !e.offsetParent) return null;
    return Math.max(0, e.getBoundingClientRect().top + scrollY - haut() - 4);
  }
  window.tmAncre = function (name) {
    clearInterval(timer);
    if (name && name !== "accueil") { scrollTo(0, 0); return; }
    touched = false;
    var n = 0, stable = 0, last = -1;
    timer = setInterval(function () {
      n++;
      if (touched || n > 40) { clearInterval(timer); return; }
      var y = cible();
      if (y == null) return;
      if (Math.abs(scrollY - y) > 2) scrollTo(0, y);
      if (Math.abs(y - last) < 2) stable++; else stable = 0;
      last = y;
      if (stable >= 6) clearInterval(timer);
    }, 250);
  };
  window.tmAncre("accueil");
})();
