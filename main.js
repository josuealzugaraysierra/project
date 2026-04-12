/* ─── NAVBAR SCROLL ─────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 120);
});

/* ─── BURGER MENU ───────────────────────────────────────── */
const burger = document.getElementById('burger');
const navLinks = document.getElementById('nav-links');
const navBackdrop = document.getElementById('nav-backdrop');

function closeNav() {
  burger.classList.remove('open');
  navLinks.classList.remove('open');
  navBackdrop.classList.remove('open');
}

burger.addEventListener('click', () => {
  const isOpen = navLinks.classList.contains('open');
  if (isOpen) {
    closeNav();
  } else {
    burger.classList.add('open');
    navLinks.classList.add('open');
    navBackdrop.classList.add('open');
  }
});
navBackdrop.addEventListener('click', closeNav);
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', closeNav);
});


/* ─── SCROLL REVEAL ─────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ─── COUNTER ANIMATION — proportional count-up ─────────── */
function runProportionalCounters(container) {
  const els      = [...container.querySelectorAll('.stat-num[data-target]')];
  const targets  = els.map(el => Number(el.dataset.target));

  // Each number's duration is proportional to its value.
  // The largest value gets MAX_DURATION; smaller values finish earlier.
  const MAX_DURATION = 2000; // ms
  const maxTarget    = Math.max(...targets);
  const durations    = targets.map(t => (t / maxTarget) * MAX_DURATION);
  const done         = els.map(() => false);

  els.forEach(el => { el.textContent = '0'; });

  let startTime = null;

  function frame(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;

    els.forEach((el, i) => {
      if (done[i]) return;
      const progress = Math.min(elapsed / durations[i], 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // cubic ease-out

      if (progress >= 1) {
        done[i] = true;
        el.textContent = targets[i];
        el.classList.add('stat-pop');
        el.addEventListener('animationend', () => el.classList.remove('stat-pop'), { once: true });
      } else {
        el.textContent = Math.floor(eased * targets[i]);
      }
    });

    if (done.some(d => !d)) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

const statsContainer = document.querySelector('.hero-stats');
const statsObserver  = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      statsObserver.disconnect();
      runProportionalCounters(entry.target);
    }
  });
}, { threshold: 0.4 });

if (statsContainer) statsObserver.observe(statsContainer);

/* ─── CONTACT FORM ───────────────────────────────────────── */
const form = document.getElementById('contacto-form');
const formSuccess = document.getElementById('form-success');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('.btn-primary');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Enviando...';

  // Simulate async submit
  setTimeout(() => {
    form.reset();
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Recibir información por WhatsApp';
    formSuccess.classList.add('show');
    setTimeout(() => formSuccess.classList.remove('show'), 4000);
  }, 1200);
});

/* ─── SMOOTH SCROLL OFFSET (for fixed nav) ──────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─── VISOR 360 ─────────────────────────────────────────── */
function load360() {
  const c = document.getElementById('viewer360');
  c.innerHTML = '<iframe src="REEMPLAZAR_CON_URL_360" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>';
}

/* ─── PARALLAX ON HERO FEATURES BAR ─────────────────────── */
// Subtle tilt on gallery cards
document.querySelectorAll('.gallery-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-8px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
