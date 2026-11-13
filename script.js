// Add your deployed Google Apps Script Web App URL here.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz1RNx_uWXwvyVHcHCmbF8S39JbH9aZNRz1lPz0iUHu92gWma79pTIqdeWGWABFvmrI/exec";

const slides = [...document.querySelectorAll(".portfolio-slide")];
const dots = [...document.querySelectorAll(".dot")];
const current = document.getElementById("slide-current");
let activeSlide = 0;
let carouselTimer;

let videoPlaying = false;
const videoBox = document.querySelector(".video-embed");
const videoPosterHTML = videoBox ? videoBox.innerHTML : "";
function resetVideo() {
  if (!videoBox || !videoPlaying) return;
  videoBox.innerHTML = videoPosterHTML;
  videoPlaying = false;
  bindPoster();
}
function loadVideo() {
  clearInterval(carouselTimer);
  videoPlaying = true;
  // Browsers only allow autoplay when muted; viewers can unmute from the player controls.
  videoBox.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + videoBox.dataset.videoId + '?autoplay=1&mute=1&playsinline=1&rel=0" title="Video editing sample" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
}
function bindPoster() {
  const poster = videoBox && videoBox.querySelector(".video-poster");
  if (poster) poster.addEventListener("click", loadVideo);
}
bindPoster();

function showSlide(index) {
  resetVideo();
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === activeSlide));
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === activeSlide);
    dot.setAttribute("aria-pressed", String(i === activeSlide));
  });
  current.textContent = String(activeSlide + 1).padStart(2, "0");
  if (videoBox && slides[activeSlide].contains(videoBox)) loadVideo(); // Autoplay (muted) on slide 5.
}
function startCarousel() {
  clearInterval(carouselTimer);
  if (videoPlaying) return;
  carouselTimer = setInterval(() => showSlide(activeSlide + 1), 6000);
}
document.querySelector(".next").addEventListener("click", () => { showSlide(activeSlide + 1); startCarousel(); });
document.querySelector(".prev").addEventListener("click", () => { showSlide(activeSlide - 1); startCarousel(); });
dots.forEach((dot, i) => dot.addEventListener("click", () => { showSlide(i); startCarousel(); }));
document.querySelector(".hero-visual").addEventListener("mouseenter", () => clearInterval(carouselTimer));
document.querySelector(".hero-visual").addEventListener("mouseleave", startCarousel);
showSlide(0); startCarousel();

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".nav-link").forEach(link => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Apps Script accepts the form payload, saves it to Google Sheets, and emails the site owner.
const contactForm = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  if (APPS_SCRIPT_URL.startsWith("PASTE_")) {
    statusEl.textContent = "Contact form setup needed: add your deployed Apps Script URL in script.js.";
    statusEl.className = "form-status error";
    return;
  }
  const submit = contactForm.querySelector('button[type="submit"]');
  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());
  if (payload.website) return; // Honeypot spam check.
  delete payload.website;
  submit.disabled = true;
  submit.innerHTML = "Sending…";
  statusEl.textContent = "Sending your message…";
  statusEl.className = "form-status";
  try {
    // no-cors is used because Apps Script Web Apps do not provide browser CORS headers.
    // The browser cannot read the response in this mode; the confirmation means the request was dispatched.
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    contactForm.reset();
    statusEl.textContent = "Your message has been submitted. Thank you — I’ll get back to you soon!";
    statusEl.className = "form-status success";
  } catch (error) {
    statusEl.textContent = "Something went wrong. Please email me directly at charles.perez1984@gmail.com.";
    statusEl.className = "form-status error";
  } finally {
    submit.disabled = false;
    submit.innerHTML = 'Send Message <span>↗</span>';
  }
});
