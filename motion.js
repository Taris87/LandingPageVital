/*
  Vital Movement Center – motion "breath". Vanilla JS, no libraries.
  - Reveals: only elements below the first viewport get a start state (opacity + transform).
  - Golden band: text glides slowly and steadily along the curve. It pauses while the mouse
    is over it, while it is off screen and while the tab is hidden.
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

    // The observer leaves out a strip at the bottom edge. Wherever scrolling comes to rest
    // (anchor jump, restored scroll position, or the user stopping), anything that is
    // actually on screen is shown.
    let settleTimer = 0;
    const settle = () => {
      const vh = window.innerHeight;
      document.querySelectorAll(".reveal-pending").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.top < vh && r.bottom > 0) show(el, false);
      });
    };
    window.addEventListener("scroll", () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 150);
    }, { passive: true });
    window.addEventListener("load", settle);
    window.addEventListener("hashchange", settle);

    // Keyboard: focus inside a hidden block reveals it at once.
    document.addEventListener("focusin", (e) => {
      const el = e.target.closest && e.target.closest(".reveal-pending");
      if (el) show(el, true);
    });
    window.addEventListener("beforeprint", showAll);
  }

  /* ---------- Golden band: slow, steady loop along the curve ---------- */
  const band = document.querySelector(".band");
  const paths = Array.from(document.querySelectorAll(".band textPath"));
  const narrowBand = matchMedia("(max-width: 639px)");
  // Screen pixels per second; a little slower on the narrow band.
  const bandSpeed = () => (narrowBand.matches ? 26 : 34);
  let bandVisible = true;
  let bandHover = false;
  let bandIO = null;
  let bandRaf = 0;
  let bandLast = 0;
  let bandOn = false;

  function phraseLength(tp) {
    if (!tp._phrase) {
      const text = tp.parentNode;
      const len = text.getComputedTextLength(); // 0 while the svg is display: none
      tp._phrase = len ? len / (Number(tp.dataset.reps) || 1) : 0;
      const svg = text.ownerSVGElement;
      const w = svg.getBoundingClientRect().width;
      tp._scale = w ? svg.viewBox.baseVal.width / w : 1; // user units per screen pixel
    }
    return tp._phrase;
  }

  const bandCanRun = () => bandOn && bandVisible && !bandHover && !document.hidden;

  function bandTick(t) {
    bandRaf = 0;
    if (!bandCanRun()) return;
    const dt = bandLast ? Math.min(t - bandLast, 64) / 1000 : 0; // no jump after a pause
    bandLast = t;
    const v = bandSpeed();
    paths.forEach((tp) => {
      const p = phraseLength(tp);
      if (!p) return;
      // One phrase further the text looks exactly the same, so wrapping is seamless.
      tp._pos = ((tp._pos || 0) + v * tp._scale * dt) % p;
      tp.setAttribute("startOffset", (-tp._pos).toFixed(2));
    });
    bandRaf = requestAnimationFrame(bandTick);
  }

  function bandUpdate() {
    if (bandCanRun()) {
      if (!bandRaf) {
        bandLast = 0;
        bandRaf = requestAnimationFrame(bandTick);
      }
    } else if (bandRaf) {
      cancelAnimationFrame(bandRaf);
      bandRaf = 0;
    }
  }

  function remeasure() {
    paths.forEach((tp) => {
      const old = tp._phrase;
      tp._phrase = 0;
      const p = phraseLength(tp);
      // Keep the position within the new phrase length.
      if (old && p) tp._pos = ((tp._pos || 0) / old) * p;
    });
  }

  if (band) {
    band.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") { bandHover = true; bandUpdate(); }
    });
    band.addEventListener("pointerleave", () => { bandHover = false; bandUpdate(); });
  }
  document.addEventListener("visibilitychange", bandUpdate);

  function startBand() {
    if (bandOn) return;
    bandOn = true;
    if (band && hasIO && !bandIO) {
      bandIO = new IntersectionObserver((entries) => {
        bandVisible = entries[entries.length - 1].isIntersecting;
        bandUpdate();
      });
      bandIO.observe(band);
    }
    bandUpdate();
  }

  function stopBand() {
    bandOn = false;
    bandUpdate();
    if (bandIO) bandIO.disconnect();
    bandIO = null;
    bandVisible = true;
    paths.forEach((tp) => {
      tp._pos = 0;
      tp.setAttribute("startOffset", "0");
    });
  }

  /* ---------- Hero collage depth (scroll-coupled, translate property) ---------- */
  const layers = Array.from(document.querySelectorAll("[data-depth]"));
  let ticking = false;
  let running = false;

  function frame() {
    ticking = false;
    if (!running) return;
    const y = window.scrollY;
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
    remeasure();
    onScroll();
  }

  function startMotion() {
    if (running) return;
    running = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    frame();
    startBand();
  }

  function stopMotion() {
    running = false;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    layers.forEach((el) => (el.style.translate = ""));
    stopBand();
    showAll();
  }

  // The phrase length depends on the band font; measure again once the fonts are in.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(remeasure);
    document.fonts.addEventListener("loadingdone", remeasure);
  }

  if (!reduce.matches) {
    setupReveals();
    startMotion();
  }
  reduce.addEventListener("change", (e) => (e.matches ? stopMotion() : startMotion()));
})();
