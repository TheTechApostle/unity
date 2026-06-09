/* ============================================================
   UNITY TECH HUB v2 — main.js
   ============================================================ */

/* ── Navbar scroll ── */
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  // Active link highlight
  const pos = window.scrollY + 100;
  document.querySelectorAll('section[id]').forEach(sec => {
    const link = document.querySelector(`.uth-link[href="#${sec.id}"]`);
    if (!link) return;
    const inSection = pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight;
    link.classList.toggle('active', inSection);
  });
});


/* ── Scroll animations ── */
const animEls = document.querySelectorAll('[data-anim]');
const animObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = parseInt(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('anim-in'), delay);
      animObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
animEls.forEach(el => animObs.observe(el));

/* Why cards stagger */
const whyCards = document.querySelectorAll('.why-card');
const whyObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = parseInt(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('visible'), delay);
      whyObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
whyCards.forEach(c => whyObs.observe(c));


/* ── Counter animation ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1400;
  const step = 16;
  const total = duration / step;
  let current = 0;
  const increment = target / total;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) { el.textContent = target; clearInterval(timer); }
    else el.textContent = Math.floor(current);
  }, step);
}

const statNums = document.querySelectorAll('.stat-num');
const statObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      statObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
statNums.forEach(n => statObs.observe(n));


/* ── Gallery lightbox ── */
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');
const lbCap    = document.getElementById('lbCaption');
const lbClose  = document.getElementById('lbClose');
const lbPrev   = document.getElementById('lbPrev');
const lbNext   = document.getElementById('lbNext');

const galItems = Array.from(document.querySelectorAll('.gal-item'));
let currentIdx = 0;

function openLightbox(idx) {
  currentIdx = idx;
  const item = galItems[idx];
  lbImg.src = item.querySelector('img').src;
  lbCap.textContent = item.dataset.caption || '';
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}
function showPrev() { openLightbox((currentIdx - 1 + galItems.length) % galItems.length); }
function showNext() { openLightbox((currentIdx + 1) % galItems.length); }

galItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', showPrev);
lbNext.addEventListener('click', showNext);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'ArrowRight') showNext();
});


/* ── Service card hover glow (subtle) ── */
document.querySelectorAll('.srv-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  });
});
