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

/* ─── COUNTER ANIMATION — scramble + sequential resolve ─── */
function runScrambleCounters(container) {
  const els      = [...container.querySelectorAll('.stat-num[data-target]')];
  const targets  = els.map(el => Number(el.dataset.target));
  const orders   = els.map(el => Number(el.dataset.order || 0));

  // Timing constants (total ≈ 1.9 s)
  const SCRAMBLE_BASE    = 800;  // ms until first element resolves
  const RESOLVE_GAP      = 400;  // ms between each resolution
  const SETTLE_WINDOW    = 250;  // ms before resolve where values converge
  const SCRAMBLE_TICK    = 55;   // ms between random-number refreshes

  const resolveTimes = orders.map(o => SCRAMBLE_BASE + o * RESOLVE_GAP);
  const resolved     = els.map(() => false);

  els.forEach(el => { el.textContent = '0'; });

  let startTime  = null;
  let lastTick   = 0;

  function frame(ts) {
    if (!startTime) startTime = ts;
    const elapsed   = ts - startTime;
    const doTick    = (elapsed - lastTick) >= SCRAMBLE_TICK;
    if (doTick) lastTick = elapsed;

    els.forEach((el, i) => {
      if (resolved[i]) return;

      if (elapsed >= resolveTimes[i]) {
        resolved[i] = true;
        el.textContent = targets[i];
        el.classList.add('stat-pop');
        el.addEventListener('animationend', () => el.classList.remove('stat-pop'), { once: true });
        return;
      }

      if (!doTick) return;

      const remaining = resolveTimes[i] - elapsed;
      if (remaining <= SETTLE_WINDOW) {
        // Converging phase: noise shrinks, centre approaches target
        const t         = 1 - remaining / SETTLE_WINDOW;          // 0 → 1
        const noise     = targets[i] * (1 - t) * 0.35;
        const centre    = targets[i] * (0.55 + t * 0.45);
        const raw       = centre + (Math.random() - 0.5) * 2 * noise;
        el.textContent  = Math.round(Math.max(0, Math.min(raw, targets[i])));
      } else {
        // Pure scramble: random in ±40 % around target
        el.textContent  = Math.floor(targets[i] * 0.6 + Math.random() * targets[i] * 0.8);
      }
    });

    if (resolved.some(r => !r)) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

const statsContainer = document.querySelector('.hero-stats');
const statsObserver  = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      statsObserver.disconnect();
      runScrambleCounters(entry.target);
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
