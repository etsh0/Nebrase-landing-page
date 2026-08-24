/* ── FAQ accordion ── */
function toggleFaq(btn) {
  const body = btn.nextElementSibling;
  const icon = btn.querySelector(".faq-icon");
  const isOpen = body.classList.contains("open");

  // close all
  document
    .querySelectorAll(".faq-body")
    .forEach((b) => b.classList.remove("open"));
  document
    .querySelectorAll(".faq-icon")
    .forEach((i) => i.classList.remove("open"));

  if (!isOpen) {
    body.classList.add("open");
    icon.classList.add("open");
  }
}

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

// Swiper
// ============================================================
// PARTNERS MARQUEE — Swiper init
// ============================================================
// Why these specific settings, so future edits don't break the
// "seamless conveyor belt" requirement:
//
// - slidesPerView: 'auto'  → slides keep their natural width
//   instead of Swiper dividing the track into equal columns.
// - loop: true              → Swiper clones slides at both ends
//   so there's real DOM content before/after the visible set;
//   this is what removes the "jump" at the reset point.
// - loopAdditionalSlides    → extra clone padding so wide
//   viewports (ultrawide monitors) never run out of clones.
// - freeMode + autoplay delay:1 + long `speed` is the standard
//   trick for turning Swiper's slide-to-slide autoplay into a
//   constant-velocity marquee: with delay ~0 the "next slide"
//   call fires almost immediately, and because speed is large
//   relative to slide width, the CSS transform transition never
//   finishes before the next tick queues, so the track visually
//   never stops moving.
// - transition-timing-function: linear (set in CSS above) is
//   required, otherwise Swiper's default ease-out timing causes
//   the classic micro pause/re-accelerate stutter on every tick.
// - allowTouchMove: false   → user requirement says touch must
//   never interrupt the animation; if you want swipe-to-browse
//   on mobile instead, set this true and rely on
//   disableOnInteraction: false to keep autoplay resuming.

// ------------------------------------------------------------
// Auto-duplicate slides BEFORE Swiper initializes.
//
// Why this is needed: Swiper's loop mode (with slidesPerView:
// "auto") requires the *real* slide content to be at least
// ~2x the viewport width, or it can't build a stable loop and
// logs "not enough slides for loop mode". A fixed number of
// manual copies (e.g. 3 sets) might be plenty on mobile but
// not enough on a 1920px+ desktop monitor. So instead of
// guessing a fixed count, we clone the slide set at runtime
// until the total track width comfortably exceeds the current
// viewport — this makes it correct at any screen size without
// editing the HTML by hand.
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
