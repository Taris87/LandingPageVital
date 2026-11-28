/*
  Vital Movement Center – page behavior.
  - Mobile menu (below 900 px): disclosure button with aria-expanded.
  - Sticky header: background once scrolled, slides away while scrolling down, comes back
    on the way up. Never hidden while the menu is open or the keyboard focus is inside.
  - Theme button: light/dark choice, saved in localStorage (head.js applies it on load).
  - Back to top: round button once the services section has been passed.
  - "Learn more" pop-up: native <dialog>, content from service-info.js.
*/
(function () {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Mobile menu ---------- */
  const head = document.querySelector(".head");
  const header = document.querySelector(".top");
  const menuBtn = header && header.querySelector(".menu-btn");
  const nav = header && header.querySelector("nav");

  if (header && menuBtn && nav) {
    const desktop = matchMedia("(min-width: 900px)");

    const setMenu = (open, returnFocus) => {
      header.classList.toggle("is-open", open);
      if (open && head) head.classList.remove("is-hidden");
      menuBtn.setAttribute("aria-expanded", String(open));
      if (!open && returnFocus) menuBtn.focus();
    };
    const isOpen = () => menuBtn.getAttribute("aria-expanded") === "true";

    menuBtn.addEventListener("click", () => setMenu(!isOpen(), false));

    // Following a link closes the menu.
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a") && isOpen()) setMenu(false, false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) setMenu(false, true);
    });

    // A click outside the header, or focus leaving it, closes the menu.
    document.addEventListener("click", (e) => {
      if (isOpen() && !header.contains(e.target)) setMenu(false, false);
    });
    header.addEventListener("focusout", (e) => {
      if (isOpen() && e.relatedTarget && !header.contains(e.relatedTarget)) setMenu(false, false);
    });

    desktop.addEventListener("change", (e) => {
      if (e.matches) setMenu(false, false);
    });
  }

  /* ---------- Sticky header ---------- */
  const focusVisibleIn = (el) => {
    try {
      return !!el.querySelector(":focus-visible");
    } catch (e) {
      return el.contains(document.activeElement);
    }
  };

  if (head && header) {
    let lastY = window.scrollY;
    let down = 0;
    let up = 0;
    let ticking = false;

    const keepShown = () => reduceMotion.matches || header.classList.contains("is-open") || focusVisibleIn(header);

    const update = () => {
      ticking = false;
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      lastY = y;
      if (dy > 0) { down += dy; up = 0; } else if (dy < 0) { up -= dy; down = 0; }
      head.classList.toggle("is-scrolled", y > 40);
      if (keepShown() || y <= head.offsetHeight) head.classList.remove("is-hidden");
      else if (down > 8) head.classList.add("is-hidden");
      else if (up > 1) head.classList.remove("is-hidden");
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();

    // Keyboard focus moving into a hidden header brings it back.
    header.addEventListener("focusin", () => {
      if (focusVisibleIn(header)) head.classList.remove("is-hidden");
    });
    reduceMotion.addEventListener("change", update);
  }

  /* ---------- Theme button ---------- */
  const themeBtn = document.querySelector(".theme-btn");
  const theme = window.VMC_THEME;
  if (themeBtn && theme) {
    const sysDark = matchMedia("(prefers-color-scheme: dark)");
    const current = () => root.getAttribute("data-theme") || (sysDark.matches ? "dark" : "light");
    const label = () => themeBtn.setAttribute("aria-label", current() === "dark" ? "Switch to light mode" : "Switch to dark mode");
    let fadeTimer = 0;

    themeBtn.addEventListener("click", () => {
      const next = current() === "dark" ? "light" : "dark";
      if (!reduceMotion.matches) {
        root.classList.add("theme-fade");
        clearTimeout(fadeTimer);
        fadeTimer = setTimeout(() => root.classList.remove("theme-fade"), 450);
      }
      theme.apply(next);
      try {
        localStorage.setItem(theme.key, next);
      } catch (e) {
        /* storage blocked: the choice lasts for this page view only */
      }
      label();
    });
    // Without a saved choice the device setting applies, also when it changes.
    sysDark.addEventListener("change", label);
    label();
  }

  /* ---------- Back to top ---------- */
  const services = document.getElementById("services");
  if (services) {
    const svgNS = "http://www.w3.org/2000/svg";
    const toTop = document.createElement("button");
    toTop.type = "button";
    toTop.className = "to-top";
    toTop.setAttribute("aria-label", "Back to top");
    const arrow = document.createElementNS(svgNS, "svg");
    arrow.setAttribute("viewBox", "0 0 24 24");
    arrow.setAttribute("aria-hidden", "true");
    arrow.setAttribute("focusable", "false");
    const shaft = document.createElementNS(svgNS, "path");
    shaft.setAttribute("d", "M12 19V5M6 11l6-6 6 6");
    arrow.append(shaft);
    toTop.append(arrow);
    document.body.append(toTop);

    // Shown once the whole services section is above the viewport. Measured on scroll
    // (an observer would miss a jump from "below" straight to "above" the viewport).
    let toTopTick = false;
    const toTopUpdate = () => {
      toTopTick = false;
      toTop.classList.toggle("is-shown", services.getBoundingClientRect().bottom <= 0);
    };
    window.addEventListener("scroll", () => {
      if (!toTopTick) {
        toTopTick = true;
        requestAnimationFrame(toTopUpdate);
      }
    }, { passive: true });
    window.addEventListener("resize", toTopUpdate, { passive: true });
    toTopUpdate();

    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "instant" : "smooth" });
      if (head) head.classList.remove("is-hidden");
      const brand = document.querySelector(".brand");
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  /* ---------- "Learn more" pop-up ---------- */
  const data = window.SERVICE_INFO || {};
  const note = window.SERVICE_INFO_NOTE || "";

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };

  const dialog = el("dialog", "info-dialog");
  dialog.setAttribute("aria-labelledby", "info-dialog-title");
  const panel = el("div", "info-panel");
  const close = el("button", "info-close");
  close.type = "button";
  close.setAttribute("aria-label", "Close");
  const svgNS = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(svgNS, "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  const cross = document.createElementNS(svgNS, "path");
  cross.setAttribute("d", "M6 6l12 12M18 6L6 18");
  cross.setAttribute("stroke", "currentColor");
  cross.setAttribute("stroke-width", "1.6");
  cross.setAttribute("fill", "none");
  cross.setAttribute("stroke-linecap", "round");
  icon.append(cross);
  close.append(icon);
  const body = el("div", "info-body");
  panel.append(close, body);
  dialog.append(panel);
  document.body.append(dialog);

  let opener = null;

  function render(info) {
    body.replaceChildren();
    body.append(el("p", "info-kicker", "Service"));
    const h = el("h2", "info-title", info.title);
    h.id = "info-dialog-title";
    body.append(h);
    if (info.summary) body.append(el("p", "info-summary", info.summary));
    if (info.points && info.points.length) {
      const ul = el("ul", "info-points");
      info.points.forEach((p) => ul.append(el("li", "", p)));
      body.append(ul);
    }
    if (info.sections && info.sections.length) {
      if (info.sectionsTitle) body.append(el("h3", "info-sections-title", info.sectionsTitle));
      const list = el("div", "info-sections");
      info.sections.forEach((s, i) => {
        const block = el("div", "info-section");
        block.style.setProperty("--i", i);
        block.append(el("h4", "", s.heading), el("p", "", s.text));
        list.append(block);
      });
      body.append(list);
    }
    if (info.source) body.append(el("p", "info-source", info.source));
    if (note) body.append(el("p", "info-note", note));
  }

  function open(key, trigger) {
    const info = data[key];
    if (!info || typeof dialog.showModal !== "function") return;
    opener = trigger;
    render(info);
    panel.scrollTop = 0;
    dialog.showModal();
    close.focus();
  }

  function shut() {
    if (!dialog.open) return;
    const done = () => {
      dialog.classList.remove("is-closing");
      dialog.close();
    };
    if (reduceMotion.matches) return done();
    dialog.classList.add("is-closing");
    setTimeout(done, 220);
  }

  dialog.addEventListener("close", () => {
    if (opener) opener.focus();
    opener = null;
  });
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    shut();
  });
  close.addEventListener("click", shut);
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) shut();
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-info]");
    if (btn) open(btn.dataset.info, btn);
  });
})();
