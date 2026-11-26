(function () {
  var d = document,
    r = d.documentElement;
  var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  r.classList.add("js");

  var y = d.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  /* Scroll-Progress + Header-Solid */
  var top = d.getElementById("top"),
    bar = d.getElementById("bar");
  function onScroll() {
    if (top) top.classList.toggle("solid", window.scrollY > 40);
    if (bar) {
      var h = r.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (h > 0 ? window.scrollY / h : 0) + ")";
    }
  }
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  /* Mobile Menu */
  var menu = d.getElementById("menu"),
    nav = d.getElementById("nav");
  function setMenu(o) {
    if (!menu || !nav) return;
    menu.setAttribute("aria-expanded", o);
    menu.setAttribute("aria-label", o ? "Close menu" : "Open menu");
    nav.setAttribute("aria-hidden", String(!o && matchMedia("(max-width: 759px)").matches));
    nav.classList.toggle("open", o);
    document.body.style.overflow = o ? "hidden" : "";
  }
  if (menu && nav) {
    setMenu(false);
    menu.addEventListener("click", function () {
      var opening = menu.getAttribute("aria-expanded") !== "true";
      setMenu(opening);
      if (opening) {
        var firstLink = nav.querySelector("a");
        if (firstLink) firstLink.focus();
      }
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    d.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menu.focus();
      }
    });
    /* Overlay schließen bei Resize ≥760px */
    matchMedia("(min-width:760px)").addEventListener("change", function (e) {
      setMenu(false);
      nav.removeAttribute("aria-hidden");
    });
  }

  /* Aktive Sektion */
  var links = {};
  if (nav) {
    nav.querySelectorAll("a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href && href.charAt(0) === "#") links[href.slice(1)] = a;
    });
  }
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          var a = links[e.target.id];
          if (!a) return;
          if (e.isIntersecting) {
            Object.keys(links).forEach(function (k) {
              links[k].removeAttribute("aria-current");
            });
            a.setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ["services", "for-you", "visit", "contact"].forEach(function (id) {
      var s = d.getElementById(id);
      if (s) so.observe(s);
    });
  }

  /* Hero-Parallax — nur Desktop, kein Reduce */
  var hero = d.getElementById("hero");
  if (
    !calm &&
    matchMedia("(pointer:fine)").matches &&
    matchMedia("(min-width:760px)").matches &&
    hero
  ) {
    hero.addEventListener("pointermove", function (e) {
      var b = hero.getBoundingClientRect();
      r.style.setProperty(
        "--px",
        ((e.clientX - b.left) / b.width - 0.5).toFixed(3),
      );
      r.style.setProperty(
        "--py",
        ((e.clientY - b.top) / b.height - 0.5).toFixed(3),
      );
    });
  }

  /* Reveal on scroll */
  if ("IntersectionObserver" in window && !calm) {
    var ro = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            ro.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    d.querySelectorAll(".reveal").forEach(function (el) {
      ro.observe(el);
    });
  } else {
    d.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* Scroll-linked timeline progress */
  var steps = d.querySelector(".visit .timeline");
  if (steps && !calm) {
    var items = Array.prototype.slice.call(steps.querySelectorAll("li"));
    var ticking = false;
    steps.classList.add("timeline-active");

    function updateTimeline() {
      var box = steps.getBoundingClientRect();
      var first = items[0].getBoundingClientRect();
      var last = items[items.length - 1].getBoundingClientRect();
      var markerSize = parseFloat(getComputedStyle(items[0], "::before").width) || 35.2;
      var horizontal = matchMedia("(min-width: 1000px)").matches;
      var vh = window.innerHeight || r.clientHeight;
      var range = box.height + vh * 0.38;
      var progress = Math.max(0, Math.min(1, (vh * 0.78 - box.top) / range));
      var startX = first.left + markerSize / 2 - box.left;
      var startY = first.top + markerSize / 2 - box.top;

      if (horizontal) {
        steps.style.setProperty("--timeline-start-x", startX + "px");
        steps.style.setProperty("--timeline-start-y", startY + "px");
        steps.style.setProperty("--timeline-length", Math.max(0, last.left + markerSize / 2 - first.left - markerSize / 2) + "px");
      } else {
        steps.style.setProperty("--timeline-start-x", startX + "px");
        steps.style.setProperty("--timeline-start-y", startY + "px");
        steps.style.setProperty("--timeline-length", Math.max(0, last.top + markerSize / 2 - first.top - markerSize / 2) + "px");
      }
      steps.style.setProperty("--timeline-progress", progress.toFixed(3));

      items.forEach(function (item, i) {
        var start = (i / items.length) * 0.9;
        var visible = Math.max(0, Math.min(1, (progress - start) / 0.18));
        item.style.opacity = visible.toFixed(2);
        item.style.transform = "translateY(" + ((1 - visible) * 12).toFixed(1) + "px)";
        item.style.setProperty("--step-glow", (visible * 0.38).toFixed(2));
      });
    }

    function requestTimelineUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        updateTimeline();
        ticking = false;
      });
    }

    updateTimeline();
    addEventListener("scroll", requestTimelineUpdate, { passive: true });
    addEventListener("resize", requestTimelineUpdate, { passive: true });
  }

  /* Copy-Buttons */
  var st = d.getElementById("status");
  d.querySelectorAll(".copy").forEach(function (b) {
    var original = b.innerHTML;
    b.addEventListener("click", function () {
      var t = d.getElementById(b.dataset.target);
      if (!t || !navigator.clipboard) return;
      var txt = t.textContent.trim();
      navigator.clipboard
        .writeText(txt)
        .then(function () {
          if (st) st.textContent = "Copied: " + txt;
          b.innerHTML = "Copied";
          setTimeout(function () {
            b.innerHTML = original;
            if (st) st.textContent = "";
          }, 1800);
        })
        .catch(function () {});
    });
  });
})();