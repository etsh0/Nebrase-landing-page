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
