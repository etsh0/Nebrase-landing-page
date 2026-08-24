/* ── Payment method switcher ── */
function switchPay(method, clickedBtn) {
  document
    .querySelectorAll(".pay-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".pay-panel")
    .forEach((p) => p.classList.remove("active"));
  clickedBtn.classList.add("active");
  document.getElementById("panel-" + method).classList.add("active");
}

/* ── Credit card number formatter ── */
function formatCard(input) {
  let val = input.value.replace(/\D/g, "").substring(0, 16);
  input.value = val.match(/.{1,4}/g)?.join(" ") || val;
}

/* ── Form submit ── */
function submitForm(e) {
  e.preventDefault();
  document.getElementById("regForm").style.display = "none";
  const s = document.getElementById("successScreen");
  s.style.display = "block";
  s.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ── Smooth scroll for all anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

/* ── Navbar scrolled state ── */
window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  nav.classList.toggle("scrolled", window.scrollY > 40);
});

/* ── Mobile nav sidebar ── */
(function () {
  const burger = document.getElementById("navBurger");
  const sidebar = document.getElementById("navSidebar");
  const overlay = document.getElementById("navSidebarOverlay");
  const closeBtn = document.getElementById("navSidebarClose");

  if (!burger || !sidebar || !overlay) return;

  function setOpen(isOpen) {
    burger.classList.toggle("is-open", isOpen);
    sidebar.classList.toggle("is-open", isOpen);
    overlay.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("nav-sidebar-open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    sidebar.setAttribute("aria-hidden", String(!isOpen));
    overlay.setAttribute("aria-hidden", String(!isOpen));
  }

  function closeSidebar() {
    setOpen(false);
  }

  burger.addEventListener("click", () => {
    const isOpen = sidebar.classList.contains("is-open");
    setOpen(!isOpen);
  });

  closeBtn?.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  sidebar.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("is-open")) {
      closeSidebar();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768 && sidebar.classList.contains("is-open")) {
      closeSidebar();
    }
  });
})();

// ==================== STATS COUNTER ====================
// Animate statistics numbers from 0 to their target value
const counters = document.querySelectorAll("[data-target]");

counters.forEach((counter) => {
  const target = Number(counter.dataset.target);
  const duration = 2000;
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);

    const current = Math.floor(progress * target);

    counter.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      counter.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(updateCounter);
});

// Swiper
const wrapperEl = document.querySelector(".partners-swiper .swiper-wrapper");
const originalSlides = Array.from(wrapperEl.children);
const oneSetWidth = originalSlides.reduce(
  (sum, el) => sum + el.getBoundingClientRect().width,
  0,
);

// Target: at least 4x the viewport width worth of real slides,
// so loop clones + freeMode autoplay always have enough track
// to work with, even on ultrawide monitors.
const targetWidth = window.innerWidth * 4;
let currentWidth = oneSetWidth;

while (currentWidth < targetWidth && oneSetWidth > 0) {
  originalSlides.forEach((slide) => {
    wrapperEl.appendChild(slide.cloneNode(true));
  });
  currentWidth += oneSetWidth;
}

const partnersSwiper = new Swiper(".partners-swiper", {
  slidesPerView: "auto",
  spaceBetween: 0,
  loop: true,
  loopAdditionalSlides: 12,
  freeMode: {
    enabled: true,
    momentum: false,
  },
  speed: 6000,
  autoplay: {
    delay: 1,
    disableOnInteraction: false,
    pauseOnMouseEnter: true, // pauses on hover, resumes on leave,
    // no position reset either way
  },
  allowTouchMove: false, // touch never breaks the animation
  breakpoints: {
    0: { spaceBetween: 0 },
    768: { spaceBetween: 0 },
    1200: { spaceBetween: 0 },
  },
});

/* ── 4 STAGES scroll reveal ── */
(function () {
  const animEls = document.querySelectorAll(".ps-animate");
  if (!animEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("ps-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  animEls.forEach((el) => observer.observe(el));
})();

/* ── Stages sticky stacking scroll effect ── */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  var isNarrow = window.matchMedia("(max-width: 479.98px)").matches;
  if (reduceMotion) return; // CSS fallback already handles the static layout

  var cards = Array.prototype.slice.call(
    document.querySelectorAll(".stage-card"),
  );
  if (!cards.length) return;

  var ticking = false;

  /*
    A card counts as "stacked" (i.e. has something sitting on top of it)
    once the NEXT card's sticky wrapper has scrolled up far enough to
    start overlapping it. We detect that purely by comparing bounding
    rects — read-only, no layout writes inside the loop — then batch all
    class toggles together to avoid layout thrashing.
  */
  function update() {
    ticking = false;
    if (isNarrow) return; // simplified mobile experience: no depth choreography

    for (var i = 0; i < cards.length - 1; i++) {
      var current = cards[i];
      var next = cards[i + 1];
      var currentRect = current.getBoundingClientRect();
      var nextRect = next.getBoundingClientRect();

      var isBeingCovered = nextRect.top <= currentRect.top + 8;
      current.classList.toggle("is-stacked", isBeingCovered);
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener(
    "resize",
    function () {
      isNarrow = window.matchMedia("(max-width: 479.98px)").matches;
      onScroll();
    },
    { passive: true },
  );

  update();
})();
