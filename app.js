/*
  Vital Movement Center – page behavior.
  - Mobile menu (below 900 px): disclosure button with aria-expanded.
  - "Learn more" pop-up: native <dialog>, content from service-info.js.
*/
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ---------- Mobile menu ---------- */
  const header = document.querySelector(".top");
  const menuBtn = header && header.querySelector(".menu-btn");
  const nav = header && header.querySelector("nav");

  if (header && menuBtn && nav) {
    const desktop = matchMedia("(min-width: 900px)");

    const setMenu = (open, returnFocus) => {
      header.classList.toggle("is-open", open);
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

  /* ---------- "Learn more" pop-up ---------- */
  const data = window.SERVICE_INFO || {};
  const note = window.SERVICE_INFO_NOTE || "";
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

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
