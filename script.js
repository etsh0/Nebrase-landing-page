AOS.init();

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

/* ── Card expiry formatter ── */
function formatExpiry(input) {
  let val = input.value.replace(/\D/g, "").substring(0, 4);
  if (val.length >= 3) {
    input.value = val.slice(0, 2) + " / " + val.slice(2);
  } else {
    input.value = val;
  }
}

/* ── Phone formatter (digits only) ── */
function formatPhone(input) {
  input.value = input.value.replace(/\D/g, "").substring(0, 11);
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

  const paymentFields = {
    card: ["cardName", "cardNumber", "cardExpiry", "cardCvv"],
    instapay: ["instapayRef"],
    vodafone: ["vodafoneRef"],
  };

  const validators = {
    fullName(value) {
      const trimmed = value.trim();
      if (!trimmed) return "الاسم الكامل مطلوب";
      if (trimmed.length < 3) return "الاسم يجب أن يكون 3 أحرف على الأقل";
      if (trimmed.length > 80) return "الاسم طويل جداً";
      if (!/^[\u0600-\u06FFa-zA-Z\s\-']+$/.test(trimmed)) {
        return "الاسم يجب أن يحتوي على حروف فقط";
      }
      const parts = trimmed.split(/\s+/).filter(Boolean);
      if (parts.length < 2) return "يرجى إدخال الاسم الأول واسم العائلة";
      if (parts.some((part) => part.length < 2)) {
        return "كل جزء من الاسم يجب أن يكون حرفين على الأقل";
      }
      return "";
    },

    email(value) {
      const trimmed = value.trim();
      if (!trimmed) return "البريد الإلكتروني مطلوب";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(trimmed)) return "البريد الإلكتروني غير صالح";
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

    cardName(value) {
      const trimmed = value.trim();
      if (!trimmed) return "اسم حامل البطاقة مطلوب";
      if (trimmed.length < 3) return "الاسم قصير جداً";
      if (!/^[\u0600-\u06FFa-zA-Z\s\-'.]+$/.test(trimmed)) {
        return "الاسم يجب أن يحتوي على حروف فقط";
      }
      return "";
    },

    cardNumber(value) {
      const digits = value.replace(/\D/g, "");
      if (!digits) return "رقم البطاقة مطلوب";
      if (!/^\d{16}$/.test(digits)) return "رقم البطاقة يجب أن يكون 16 رقم";
      if (!luhnCheck(digits)) return "رقم البطاقة غير صالح";
      return "";
    },

    cardExpiry(value) {
      const cleaned = value.replace(/\s/g, "");
      if (!cleaned) return "تاريخ الانتهاء مطلوب";
      const match = cleaned.match(/^(\d{2})\/?(\d{2})$/);
      if (!match) return "الصيغة الصحيحة: MM / YY";
      const month = parseInt(match[1], 10);
      const year = 2000 + parseInt(match[2], 10);
      if (month < 1 || month > 12) return "الشهر غير صالح (01–12)";
      const now = new Date();
      const expiryEnd = new Date(year, month, 0, 23, 59, 59);
      if (expiryEnd < now) return "البطاقة منتهية الصلاحية";
      return "";
    },

    cardCvv(value) {
      if (!value) return "CVV مطلوب";
      if (!/^\d{3}$/.test(value)) return "CVV يجب أن يكون 3 أرقام";
      return "";
    },

    instapayRef(value) {
      return validateTransferRef(value);
    },

    vodafoneRef(value) {
      return validateTransferRef(value);
    },
  };

  function validateTransferRef(value) {
    const trimmed = value.trim();
    if (!trimmed) return "رقم مرجع التحويل مطلوب";
    if (trimmed.length < 4) return "رقم المرجع قصير جداً (4 أحرف على الأقل)";
    if (trimmed.length > 30) return "رقم المرجع طويل جداً";
    if (!/^[a-zA-Z0-9\-_]+$/.test(trimmed)) {
      return "رقم المرجع يجب أن يحتوي على أحرف وأرقام فقط";
    }
    return "";
  }

  function luhnCheck(num) {
    let sum = 0;
    let alternate = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let n = parseInt(num[i], 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  function getActivePaymentMethod() {
    const activePanel = document.querySelector(".pay-panel.active");
    return activePanel ? activePanel.id.replace("panel-", "") : "card";
  }

  function getFieldWrapper(input) {
    return input.closest(".form-field");
  }

  function setFieldError(input, message) {
    const wrapper = getFieldWrapper(input);
    if (!wrapper) return;
    const errorEl = wrapper.querySelector(".form-error");
    if (message) {
      wrapper.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
      if (errorEl) errorEl.textContent = message;
    } else {
      wrapper.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      if (errorEl) errorEl.textContent = "";
    }
  }

  function validateField(input) {
    const rule = input.closest(".form-field")?.dataset.validate;
    if (!rule || !validators[rule]) return true;
    const message = validators[rule](input.value);
    setFieldError(input, message);
    return !message;
  }

  function clearHiddenPaymentErrors() {
    const method = getActivePaymentMethod();
    Object.entries(paymentFields).forEach(([payMethod, fields]) => {
      if (payMethod === method) return;
      fields.forEach((fieldName) => {
        const input = form.querySelector(`[name="${fieldName}"]`);
        if (input) setFieldError(input, "");
      });
    });
  }

  function validateForm() {
    clearHiddenPaymentErrors();

    let isValid = true;
    let firstInvalid = null;

    const alwaysValidate = ["fullName", "email", "phone"];
    alwaysValidate.forEach((name) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (input && !validateField(input)) {
        isValid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    const method = getActivePaymentMethod();
    (paymentFields[method] || []).forEach((name) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (input && !validateField(input)) {
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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    form.style.display = "none";
    const success = document.getElementById("successScreen");
    success.style.display = "block";
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  form.querySelectorAll(".form-field input").forEach((input) => {
    input.addEventListener("blur", () => {
      const rule = input.closest(".form-field")?.dataset.validate;
      const method = getActivePaymentMethod();
      const isPersonal = ["fullName", "email", "phone"].includes(input.name);
      const isActivePayment = (paymentFields[method] || []).includes(
        input.name,
      );
      if (isPersonal || isActivePayment) validateField(input);
    });

    input.addEventListener("input", () => {
      const wrapper = getFieldWrapper(input);
      if (wrapper?.classList.contains("is-invalid")) {
        validateField(input);
      }
      if (formAlert.classList.contains("is-visible")) {
        formAlert.classList.remove("is-visible");
      }
    });
  });

  const cardNum = document.getElementById("cardNum");
  if (cardNum) {
    cardNum.addEventListener("input", () => formatCard(cardNum));
  }

  const cardExpiry = document.getElementById("cardExpiry");
  if (cardExpiry) {
    cardExpiry.addEventListener("input", () => formatExpiry(cardExpiry));
  }

  const phone = document.getElementById("phone");
  if (phone) {
    phone.addEventListener("input", () => formatPhone(phone));
  }

  const cardCvv = document.getElementById("cardCvv");
  if (cardCvv) {
    cardCvv.addEventListener("input", () => {
      cardCvv.value = cardCvv.value.replace(/\D/g, "").substring(0, 3);
    });
  }

  document.querySelectorAll(".pay-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTimeout(clearHiddenPaymentErrors, 0);
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
