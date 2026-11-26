(() => {
  "use strict";
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      nav.classList.toggle("is-open", !isOpen);
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
      nav.classList.remove("is-open");
    }));
  }
  const config = window.VMC_CONFIG || {};
  const items = document.querySelector("#contact-items");
  const empty = document.querySelector("#contact-empty");
  const entries = [
    ["phone", "Phone", value => `tel:${value.replace(/[^\d+]/g, "")}`],
    ["email", "Email", value => `mailto:${value}`],
    ["address", "Location", null],
    ["facebook", "Facebook", value => value]
  ];
  let visibleCount = 0;
  entries.forEach(([key, label, makeHref]) => {
    const value = typeof config[key] === "string" ? config[key].trim() : "";
    if (!value) return;
    visibleCount++;
    const row = document.createElement("div"); row.className = "contact-item";
    const copy = document.createElement("div");
    const title = document.createElement("span"); title.className = "label"; title.textContent = label; copy.append(title);
    if (makeHref) {
      const link = document.createElement("a"); link.href = makeHref(value); link.textContent = value;
      if (key === "facebook") { link.target = "_blank"; link.rel = "noopener noreferrer"; }
      copy.append(link);
    } else { const address = document.createElement("span"); address.textContent = value; copy.append(address); }
    row.append(copy); items.append(row);
  });
  if (visibleCount > 0) empty.hidden = true;
  document.querySelector("#year").textContent = String(new Date().getFullYear());
  const revealElements = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) revealElements.forEach(el => el.classList.add("is-visible"));
  else {
    const observer = new IntersectionObserver((entries, currentObserver) => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); currentObserver.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealElements.forEach(el => observer.observe(el));
  }
})();