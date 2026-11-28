/*
  Vital Movement Center – runs in <head> before the first paint (not deferred, a few lines).
  - Applies a saved light/dark choice, so the page never flashes in the wrong mode.
    Without a saved choice the device setting applies (pure CSS, see style.css).
  - Marks <html> with "js" and, unless reduced motion is set, "hero-intro" for the hero entrance.
    The entrance is a CSS animation; the class is removed again when it ends (or after a
    fallback delay), so nothing can stay hidden.
*/
(function () {
  "use strict";
  var root = document.documentElement;
  var COLORS = { light: "#f7f1e4", dark: "#0f0b06" };

  function applyTheme(theme) {
    if (theme !== "light" && theme !== "dark") return;
    root.setAttribute("data-theme", theme);
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) metas[i].setAttribute("content", COLORS[theme]);
    var scheme = document.querySelector('meta[name="color-scheme"]');
    if (scheme) scheme.setAttribute("content", theme);
  }
  window.VMC_THEME = { apply: applyTheme, key: "vmc-theme" };

  var saved = null;
  try { saved = localStorage.getItem("vmc-theme"); } catch (e) { /* storage blocked */ }
  applyTheme(saved);

  root.classList.add("js");

  if (window.matchMedia && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("hero-intro");
    var end = function () { root.classList.remove("hero-intro"); };
    document.addEventListener("animationend", function (e) {
      if (e.animationName === "intro-pop") end();
    });
    document.addEventListener("DOMContentLoaded", function () { setTimeout(end, 2200); });
  }
})();
