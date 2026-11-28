/*
  Vital Movement Center – motion "breath". Vanilla JS, no libraries.
  - Reveals: only elements below the first viewport get a start state (opacity + transform).
  - Golden band: text moves along the curve, coupled to scrolling (no loop, no scroll-jacking).
  - Hero collage: slight depth shift while scrolling (transform via the translate property).
  - prefers-reduced-motion: reduce -> nothing moves, nothing is hidden. A change of the
    setting at runtime is picked up.
*/
(function () {
  "use strict";

  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const hasIO = "IntersectionObserver" in window;

  /* ---------- Reveals ---------- */
  let revealIO = null;

  function show(el, instantly) {
    if (!el.classList.contains("reveal-pending")) return;
    if (instantly) {
      // Skip the fade so a focused element is never invisible.
      el.style.transition = "none";
      el.classList.remove("reveal-pending");
      void el.offsetWidth;
      el.style.transition = "";
    } else {
      el.classList.remove("reveal-pending");
    }
    if (revealIO) revealIO.unobserve(el);
  }

  function showAll() {
    document.querySelectorAll(".reveal-pending").forEach((el) => show(el, true));
  }

  function setupReveals() {
    if (!hasIO) return;
    document.querySelectorAll("[data-reveal-group]").forEach((group) => {
      group.querySelectorAll(":scope > [data-reveal]").forEach((el, i) => el.style.setProperty("--i", i));
    });
    const vh = window.innerHeight;
    const pending = [];
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      const r = el.getBoundingClientRect();
      // Only below the fold. Visible or passed content, and hidden layout parts
      // (display: none reports top 0), stay as they are.
      if (r.top >= vh) pending.push(el);
    });
    if (!pending.length) return;
    pending.forEach((el) => el.classList.add("reveal-pending"));
    root.classList.add("motion-ready");
    revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) show(e.target, false);
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    pending.forEach((el) => revealIO.observe(el));

    // Keyboard: focus inside a hidden block reveals it at once.
    document.addEventListener("focusin", (e) => {
      const el = e.target.closest && e.target.closest(".reveal-pending");
      if (el) show(el, true);
    });
    window.addEventListener("beforeprint", showAll);
  }

  /* ---------- Scroll-coupled band + collage depth ---------- */
  const band = document.querySelector(".band");
  const paths = Array.from(document.querySelectorAll(".band textPath"));
  const layers = Array.from(document.querySelectorAll("[data-depth]"));
  const SPEED = 0.5; // px of text travel per px scrolled
  let bandVisible = true;
  let bandIO = null;
  let ticking = false;
  let running = false;

  function phraseLength(tp) {
    if (!tp._phrase) {
      const len = tp.parentNode.getComputedTextLength(); // 0 while the svg is display: none
      tp._phrase = len ? len / (Number(tp.dataset.reps) || 1) : 0;
    }
    return tp._phrase;
  }

  function frame() {
    ticking = false;
    if (!running) return;
    const y = window.scrollY;
    if (bandVisible) {
      paths.forEach((tp) => {
        const p = phraseLength(tp);
        if (!p) return;
        tp.setAttribute("startOffset", (-((y * SPEED) % p)).toFixed(1));
      });
    }
    if (y < window.innerHeight * 1.2) {
      layers.forEach((el) => {
        el.style.translate = "0 " + (-y * Number(el.dataset.depth)).toFixed(1) + "px";
      });
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  }

  function onResize() {
    paths.forEach((tp) => (tp._phrase = 0));
    onScroll();
  }

  function startScrollMotion() {
    if (running) return;
    running = true;
    if (band && hasIO) {
      bandIO = new IntersectionObserver((entries) => {
        bandVisible = entries[entries.length - 1].isIntersecting;
        if (bandVisible) onScroll();
      });
      bandIO.observe(band);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    frame();
  }

  function stopScrollMotion() {
    running = false;
    if (bandIO) bandIO.disconnect();
    bandIO = null;
    bandVisible = true;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    paths.forEach((tp) => tp.setAttribute("startOffset", "0"));
    layers.forEach((el) => (el.style.translate = ""));
    showAll();
  }

  if (!reduce.matches) {
    setupReveals();
    startScrollMotion();
  }
  reduce.addEventListener("change", (e) => (e.matches ? stopScrollMotion() : startScrollMotion()));
})();
