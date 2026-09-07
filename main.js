/* =========================================================
   DARVIX ALGO — MAIN JS
   Vanilla JS only. No frameworks. No auto-scroll on load.
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     0. ENSURE PAGE STARTS AT TOP — NO AUTO SCROLL
  --------------------------------------------------------- */
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  /* ---------------------------------------------------------
     1. BROKEN IMAGE → PLACEHOLDER FALLBACK
     Applies to masterclass previews + testimonials so the
     page never looks "broken" before real images are added.
  --------------------------------------------------------- */
  function attachImageFallback(img) {
    img.addEventListener('error', () => {
      const parent = img.closest('.preview-item, .testi-card');
      if (parent) parent.classList.add('media-error');
      img.style.display = 'none';
    }, { once: true });
  }
  document.querySelectorAll('.js-media-slot').forEach(attachImageFallback);


  /* ---------------------------------------------------------
     2. COUNTDOWN LOGIC
     Session 1: September 19th, 8:00 PM
     Session 2: September 20th, 8:00 PM
     After both have passed → show ended message.
     Edit YEAR below if needed.
  --------------------------------------------------------- */
  const COUNTDOWN_YEAR = new Date().getFullYear();

  function buildTarget(day) {
    return new Date(COUNTDOWN_YEAR, 8, day, 20, 0, 0, 0); // month 8 = September
  }

  const session1 = buildTarget(19);
  const session2 = buildTarget(20);

  function getActiveTarget() {
    const now = new Date();
    if (now < session1) return session1;
    if (now < session2) return session2;
    return null; // both sessions passed
  }

  function updateAllCountdowns() {
    const target = getActiveTarget();
    const roots = document.querySelectorAll('[data-countdown-root]');

    roots.forEach(root => {
      const grid = root.querySelector('[data-countdown-grid]');
      const endedMsg = root.querySelector('[data-cd-ended]');

      if (!target) {
        grid.style.display = 'none';
        endedMsg.hidden = false;
        return;
      }

      grid.style.display = '';
      endedMsg.hidden = true;

      const now = new Date();
      let diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * (1000 * 60 * 60 * 24);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * (1000 * 60 * 60);
      const minutes = Math.floor(diff / (1000 * 60));
      diff -= minutes * (1000 * 60);
      const seconds = Math.floor(diff / 1000);

      const pad = n => String(n).padStart(2, '0');

      root.querySelector('[data-cd="days"]').textContent = pad(days);
      root.querySelector('[data-cd="hours"]').textContent = pad(hours);
      root.querySelector('[data-cd="minutes"]').textContent = pad(minutes);
      root.querySelector('[data-cd="seconds"]').textContent = pad(seconds);
    });
  }

  updateAllCountdowns();
  setInterval(updateAllCountdowns, 1000);


  /* ---------------------------------------------------------
     3. TESTIMONIAL MARQUEE — BUILD 25 IMAGE SLOTS
     Two rows, opposite direction, seamless infinite loop.
     Real files go in /images/testimonials/
     testimonial-01.jpg ... testimonial-25.jpg
  --------------------------------------------------------- */
  const TOTAL_TESTIMONIALS = 25;
  const testimonialFiles = Array.from({ length: TOTAL_TESTIMONIALS }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `images/testimonials/testimonial-${num}.jpg`;
  });

  function buildTestimonialCard(src, index) {
    const card = document.createElement('div');
    card.className = 'testi-card';
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Community testimonial ${index + 1}`;
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      card.classList.add('media-error');
      img.style.display = 'none';
    }, { once: true });
    card.appendChild(img);
    return card;
  }

  const marqueeTracks = document.querySelectorAll('[data-marquee-track]');
  marqueeTracks.forEach(track => {
    // Build the set twice (duplicated) inside the SAME track
    // for a seamless infinite scroll loop.
    for (let loop = 0; loop < 2; loop++) {
      testimonialFiles.forEach((src, i) => {
        track.appendChild(buildTestimonialCard(src, i));
      });
    }
  });


  /* ---------------------------------------------------------
     4. MASTERCLASS PREVIEW LIGHTBOX
  --------------------------------------------------------- */
  const triggers = Array.from(document.querySelectorAll('[data-lightbox-trigger]'));
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImg = document.querySelector('[data-lightbox-img]');
  const closeBtn = document.querySelector('[data-lightbox-close]');
  const prevBtn = document.querySelector('[data-lightbox-prev]');
  const nextBtn = document.querySelector('[data-lightbox-next]');

  let currentIndex = 0;
  let lastFocusedEl = null;

  function openLightbox(index) {
    const trigger = triggers[index];
    const img = trigger.querySelector('img');
    if (!img || img.style.display === 'none') return; // skip broken images

    currentIndex = index;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.hidden = false;
    lastFocusedEl = document.activeElement;
    closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function showNext(direction) {
    let next = currentIndex;
    for (let i = 0; i < triggers.length; i++) {
      next = (next + direction + triggers.length) % triggers.length;
      const img = triggers[next].querySelector('img');
      if (img && img.style.display !== 'none') break;
    }
    openLightbox(next);
  }

  triggers.forEach((trigger, i) => {
    trigger.addEventListener('click', () => openLightbox(i));
  });

  closeBtn.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', () => showNext(1));
  prevBtn.addEventListener('click', () => showNext(-1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext(1);
    if (e.key === 'ArrowLeft') showNext(-1);
  });


  /* ---------------------------------------------------------
     5. FAQ ACCORDION (ACCESSIBLE)
  --------------------------------------------------------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others (single-open accordion)
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
          openItem.querySelector('.faq-a').style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 20 + 'px';
      }
    });
  });


  /* ---------------------------------------------------------
     6. SCROLL REVEAL ANIMATIONS
  --------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(
    '.info-card, .timeline-item, .faq-item, .preview-item, .section-title, .section-sub'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(el => observer.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

});
