AOS.init({
  once: true,
});

/* ── Theme (light/dark) toggle ── */
(function () {
  const root = document.documentElement;
  const STORAGE_KEY = "theme";
  const LOGOS = {
    dark: "./images/logo-dark-mode.png",
    light: "./images/logo-light-mode.png",
  };

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    document.querySelectorAll(".theme-logo").forEach((img) => {
      img.src = LOGOS[theme] || LOGOS.dark;
    });
  }

  // Respect system preference on first visit
  let current = null;
  try {
    current = localStorage.getItem(STORAGE_KEY);
  } catch (e) {}
  if (!current && window.matchMedia("(prefers-color-scheme: light)").matches) {
    apply("light");
  } else if (current === "light") {
    apply("light");
  }

  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next =
        root.getAttribute("data-theme") === "light" ? "dark" : "light";
      apply(next);
    });
  });
})();

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

/* ── Registration form validation ── */
(function () {
  const form = document.getElementById("regForm");
  if (!form) return;

  const formAlert = document.createElement("div");
  formAlert.className = "form-alert";
  formAlert.setAttribute("role", "alert");
  formAlert.textContent = "يرجى تصحيح الأخطاء في النموذج قبل الإرسال";
  form.insertBefore(formAlert, form.firstChild);

  function nameValidator(label) {
    return function (value) {
      const trimmed = value.trim();
      if (!trimmed) return `${label} مطلوب`;
      if (trimmed.length < 2) return `${label} يجب أن يكون حرفين على الأقل`;
      if (trimmed.length > 40) return `${label} طويل جداً`;
      if (!/^[\u0600-\u06FFa-zA-Z\s'-]+$/.test(trimmed)) {
        return `${label} يجب أن يحتوي على حروف فقط`;
      }
      return "";
    };
  }

  const validators = {
    firstName: nameValidator("الاسم الأول"),
    lastName: nameValidator("الاسم الأخير"),
    email(value) {
      const trimmed = value.trim();
      if (!trimmed) return "البريد الإلكتروني مطلوب";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
        return "البريد الإلكتروني غير صالح";
      }
      if (trimmed.length > 254) return "البريد الإلكتروني طويل جداً";
      return "";
    },
    phone(value) {
      const digits = value.replace(/\D/g, "");
      if (!digits) return "رقم الموبايل مطلوب";
      if (!/^01[0125]\d{8}$/.test(digits)) {
        return "رقم موبايل مصري غير صالح (مثال: 01012345678)";
      }
      return "";
    },
  };

  function getActivePanel() {
    return form.querySelector(".pay-panel.active");
  }

  function setFieldError(input, message) {
    const wrapper = input.closest(".form-field");
    if (!wrapper) return;
    const hasError = Boolean(message);
    wrapper.classList.toggle("is-invalid", hasError);
    if (hasError) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
    const errorEl = wrapper.querySelector(".form-error");
    if (errorEl) errorEl.textContent = message;
  }

  function validateField(input) {
    const rule = input.closest(".form-field")?.dataset.validate;
    if (!rule || !validators[rule]) return true;
    const message = validators[rule](input.value);
    setFieldError(input, message);
    return !message;
  }

  function validateForm() {
    let isValid = true;
    let firstInvalid = null;

    getActivePanel()
      .querySelectorAll(".form-field[data-validate] input")
      .forEach((input) => {
        if (!validateField(input)) {
          isValid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

    formAlert.classList.toggle("is-visible", !isValid);

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return isValid;
  }

  function getActiveMethod() {
    const panel = getActivePanel();
    return panel ? panel.id.replace("panel-", "") : "";
  }

  function collectActiveData() {
    const data = {};
    getActivePanel()
      .querySelectorAll(".form-field[data-validate] input")
      .forEach((input) => {
        data[input.name] = input.value.trim();
      });
    return data;
  }

  function openInstapayWhatsApp(data) {
    const message =
      `أهلاً، أنا ${data.firstName} ${data.lastName}\n` +
      "سجلت في البرنامج وتم تحويل 2800 جنيه عبر InstaPay\n" +
      `البريد: ${data.email}\n` +
      `الموبايل: ${data.phone}`;
    window.open(
      "https://wa.me/201027285688?text=" + encodeURIComponent(message),
      "_blank",
      "noopener",
    );
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const method = getActiveMethod();
    const data = collectActiveData();

    form.style.display = "none";
    const success = document.getElementById("successScreen");
    success.style.display = "block";
    success.scrollIntoView({ behavior: "smooth", block: "center" });

    if (method === "instapay") openInstapayWhatsApp(data);
  });

  form.querySelectorAll(".form-field input").forEach((input) => {
    input.addEventListener("blur", () => {
      if (!input.closest(".pay-panel")?.classList.contains("active")) return;
      validateField(input);
    });

    input.addEventListener("input", () => {
      const wrapper = input.closest(".form-field");
      if (wrapper?.classList.contains("is-invalid")) {
        validateField(input);
        if (!wrapper.classList.contains("is-invalid")) {
          formAlert.classList.remove("is-visible");
        }
      }
    });
  });

  form.querySelectorAll('input[type="tel"]').forEach((phoneInput) => {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    });
  });

  form.querySelectorAll(".pay-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      formAlert.classList.remove("is-visible");
    });
  });
})();

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

// video hero
const heroVideo = document.getElementById("heroVideo");
const heroPlayBtn = document.getElementById("heroVideoPlay");
const heroWrap = document.getElementById("heroVideoWrap");

heroPlayBtn.addEventListener("click", () => {
  heroVideo.setAttribute("controls", ""); // يظهر شريط تحكم الفيديو الطبيعي
  heroVideo.play();
  heroWrap.classList.add("is-playing");
});

heroVideo.addEventListener("pause", () => {
  heroWrap.classList.remove("is-playing");
});

heroVideo.addEventListener("ended", () => {
  heroWrap.classList.remove("is-playing");
  heroVideo.removeAttribute("controls"); // يرجع البوستر وزرار البلاي تاني
  heroVideo.currentTime = 0;
});
