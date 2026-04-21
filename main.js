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
  const MAX_DURATION = 4000; // ms
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

/* ─── 360 PANORAMA (PANNELLUM) ──────────────────────────── */
let _viewer = null;

document.addEventListener('DOMContentLoaded', () => {
  const panoBg = document.getElementById('pano-bg');

  // Pick panorama resolution based on the device's WebGL max texture size.
  // Original: 12000×6000 — too large for mobile GPUs (cap 4096–8192 px).
  // Mobile version: 4096×2048 — fits within the 4096 limit on most phones.
  function getPanoSrc() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const maxTex = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0;
      return maxTex >= 12000 ? 'assets/360.webp' : 'assets/360-mobile.webp';
    } catch (e) {
      return 'assets/360-mobile.webp';
    }
  }

  _viewer = pannellum.viewer('pano-inner', {
    type:                       'equirectangular',
    panorama:                   getPanoSrc(),
    hfov:                       110,
    pitch:                      -20,
    yaw:                        0,
    autoLoad:                   true,
    autoRotate:                 -2,
    autoRotateInactivityDelay:  0,
    draggable:                  false,
    mouseZoom:                  false,
    disableKeyboardCtrl:        true,
    showControls:               false,
    compass:                    false,
  });

  _viewer.on('load',  () => panoBg.classList.add('loaded'));
  _viewer.on('error', () => panoBg.classList.add('loaded')); // show dark bg on WebGL failure
});

/* — Overlay API ─────────────────────────────────────────── */
const _panoOverlay = document.getElementById('pano-overlay');
function setOverlayOpacity(value) {
  const v = Math.min(0.7, Math.max(0, value));
  _panoOverlay.style.background = `rgba(0,0,0,${v})`;
}

/* — Motion control hooks ────────────────────────────────── */
function _smoothSet(getter, setter, target, duration) {
  if (!_viewer) return;
  if (!duration) { setter(target); return; }
  const start = getter();
  let diff = target - start;
  // Normalise yaw diff to shortest arc (-180..180)
  if (setter === _viewer.setYaw.bind(_viewer)) {
    while (diff >  180) diff -= 360;
    while (diff < -180) diff += 360;
  }
  const t0 = performance.now();
  function tick(ts) {
    const p = Math.min((ts - t0) / duration, 1);
    setter(start + diff * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function setYaw(yaw, duration = 1000) {
  _smoothSet(() => _viewer.getYaw(), _viewer.setYaw.bind(_viewer), yaw, duration);
}
function setPitch(pitch, duration = 1000) {
  _smoothSet(() => _viewer.getPitch(), _viewer.setPitch.bind(_viewer), pitch, duration);
}
function pauseAutoRotate()          { if (_viewer) _viewer.setAutoRotate(0); }
function resumeAutoRotate(speed=-2) { if (_viewer) _viewer.setAutoRotate(speed); }

/* — Scene points & view-change observer ─────────────────── */
const SCENE_POINTS = [
  { yaw:  30, pitch: -10, id: 'point-1' },
  { yaw: -60, pitch: -15, id: 'point-2' },
];

const _vcCallbacks = [];
function onViewChange(callback) { _vcCallbacks.push(callback); }

setInterval(() => {
  if (!_viewer) return;
  const state = { yaw: _viewer.getYaw(), pitch: _viewer.getPitch() };
  _vcCallbacks.forEach(cb => cb(state));
}, 200);

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

/* ─── INLINE 360 VIEWER (section #proyecto) ─────────────── */
// Called by the play button: onclick="load360()"
// Replaces the preview image + button with an embedded Pannellum viewer
// inside the inline .viewer-360 container.
function load360() {
  const wrap = document.getElementById('viewer360');
  if (!wrap) return;

  // Remove the static preview elements
  const preview = wrap.querySelector('.viewer-preview');
  const playBtn = wrap.querySelector('.viewer-play');
  if (preview) preview.remove();
  if (playBtn) playBtn.remove();

  // Create a dedicated target div for the inline Pannellum instance
  const target = document.createElement('div');
  target.id = 'viewer360-pnlm';
  target.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  wrap.appendChild(target);

  // Pick resolution based on GPU capability (same logic as background pano)
  function getSrc() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const maxTex = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0;
      return maxTex >= 12000 ? 'assets/360.webp' : 'assets/360-mobile.webp';
    } catch (e) {
      return 'assets/360-mobile.webp';
    }
  }

  if (typeof pannellum !== 'undefined') {
    pannellum.viewer('viewer360-pnlm', {
      type:           'equirectangular',
      panorama:       getSrc(),
      hfov:           100,
      pitch:          -10,
      yaw:            0,
      autoLoad:       true,
      autoRotate:     -1.5,
      autoRotateInactivityDelay: 3000,
      showControls:   true,
      compass:        false,
      keyboardZoom:   false,
    });
  } else {
    // Fallback: show panorama as a scrollable background image
    wrap.style.backgroundImage = `url('${getSrc()}')`;
    wrap.style.backgroundSize  = 'cover';
    wrap.style.backgroundPosition = 'center';
  }
}
