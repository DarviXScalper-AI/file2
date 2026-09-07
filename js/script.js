/* =====================================================
   DARVIX ALGO — LANDING PAGE SCRIPT
   Vanilla JS. No frameworks. No auto-scroll on load.
===================================================== */

(function () {
  'use strict';

  /* -----------------------------------------------------
     0. FORCE PAGE TO START AT THE TOP ON LOAD
     Prevents the browser from restoring a scroll position
     or jumping to any anchor/section automatically.
  ----------------------------------------------------- */
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
  window.addEventListener('load', function () {
    window.scrollTo(0, 0);
  });
  window.scrollTo(0, 0);

  /* -----------------------------------------------------
     1. COUNTDOWN
     Session 1: September 19, 2026, 8:00 PM (local time)
     Session 2: September 20, 2026, 8:00 PM (local time)
     After both have passed, show an ended message.
  ----------------------------------------------------- */
  var SESSION_1 = new Date(2026, 8, 19, 20, 0, 0); // Month is 0-indexed: 8 = September
  var SESSION_2 = new Date(2026, 8, 20, 20, 0, 0);

  function getTargetDate() {
    var now = new Date();
    if (now < SESSION_1) return { date: SESSION_1, label: "Counting down to Night 1 \u2014 September 19th, 8:00 PM." };
    if (now < SESSION_2) return { date: SESSION_2, label: "Counting down to Night 2 \u2014 September 20th, 8:00 PM." };
    return null;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function renderCountdown(prefix, days, hours, mins, secs) {
    var d = document.getElementById(prefix + '-days');
    var h = document.getElementById(prefix + '-hours');
    var m = document.getElementById(prefix + '-mins');
    var s = document.getElementById(prefix + '-secs');
    if (d) d.textContent = pad(days);
    if (h) h.textContent = pad(hours);
    if (m) m.textContent = pad(mins);
    if (s) s.textContent = pad(secs);
  }

  function tickCountdown() {
    var target = getTargetDate();
    var label1 = document.getElementById('countdown-label');

    if (!target) {
      renderCountdown('cd', 0, 0, 0, 0);
      renderCountdown('cd2', 0, 0, 0, 0);
      if (label1) label1.textContent = 'This Masterclass session has ended.';
      return;
    }

    var diff = target.date.getTime() - Date.now();
    if (diff < 0) diff = 0;

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var mins = Math.floor((diff / (1000 * 60)) % 60);
    var secs = Math.floor((diff / 1000) % 60);

    renderCountdown('cd', days, hours, mins, secs);
    renderCountdown('cd2', days, hours, mins, secs);
    if (label1) label1.textContent = target.label;
  }

  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* -----------------------------------------------------
     2. FAQ ACCORDION
  ----------------------------------------------------- */
  var accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(function (item) {
    var trigger = item.querySelector('.accordion-trigger');
    var panel = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', function () {
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Close all other items (single-open accordion)
      accordionItems.forEach(function (other) {
        if (other === item) return;
        var otherTrigger = other.querySelector('.accordion-trigger');
        var otherPanel = other.querySelector('.accordion-panel');
        if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        if (otherPanel) otherPanel.style.maxHeight = null;
      });

      if (isOpen) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = null;
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* -----------------------------------------------------
     3. MASTERCLASS PREVIEW LIGHTBOX
  ----------------------------------------------------- */
  var previewThumbs = Array.prototype.slice.call(document.querySelectorAll('.preview-thumb'));
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var currentIndex = 0;

  function openLightbox(index) {
    if (!previewThumbs.length) return;
    currentIndex = (index + previewThumbs.length) % previewThumbs.length;
    var img = previewThumbs[currentIndex].querySelector('img');
    if (img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  previewThumbs.forEach(function (thumb, index) {
    thumb.addEventListener('click', function () { openLightbox(index); });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', function () { openLightbox(currentIndex - 1); });
  if (lightboxNext) lightboxNext.addEventListener('click', function () { openLightbox(currentIndex + 1); });

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
    if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
  });

  /* -----------------------------------------------------
     4. TESTIMONIAL CAROUSEL (TWO ROWS, OPPOSITE DIRECTIONS)
     Builds two marquee rows from the 25 testimonial image
     slots. Row 1 scrolls LEFT -> RIGHT, Row 2 scrolls
     RIGHT -> LEFT. Each row's image set is duplicated once
     in the DOM to create a seamless infinite loop.

     Upload real files to /images/testimonials/ named
     testimonial-01.jpg through testimonial-25.jpg.
     Missing images automatically show a placeholder tile.
  ----------------------------------------------------- */
  var TOTAL_TESTIMONIALS = 25;
  var allTestimonialNumbers = [];
  for (var t = 1; t <= TOTAL_TESTIMONIALS; t++) allTestimonialNumbers.push(t);

  var midpoint = Math.ceil(TOTAL_TESTIMONIALS / 2); // 13
  var row1Numbers = allTestimonialNumbers.slice(0, midpoint);      // 1-13
  var row2Numbers = allTestimonialNumbers.slice(midpoint);         // 14-25

  function buildTestimonialCard(num) {
    var fileName = 'testimonial-' + String(num).padStart(2, '0') + '.jpg';
    var wrapper = document.createElement('div');
    wrapper.className = 'testimonial-card';

    var img = document.createElement('img');
    img.src = 'images/testimonials/' + fileName;
    img.alt = 'DarviX Algo community testimonial ' + num;
    img.loading = 'lazy';
    img.onerror = function () { img.classList.add('img-missing'); };

    var placeholder = document.createElement('span');
    placeholder.className = 'ph';
    placeholder.textContent = fileName;

    wrapper.appendChild(img);
    wrapper.appendChild(placeholder);
    return wrapper;
  }

  function fillTrack(trackId, numbers) {
    var track = document.getElementById(trackId);
    if (!track) return;
    // Duplicate the set once so the CSS translateX(-50%) loop is seamless.
    var doubled = numbers.concat(numbers);
    doubled.forEach(function (num) {
      track.appendChild(buildTestimonialCard(num));
    });
  }

  fillTrack('track-1', row1Numbers);
  fillTrack('track-2', row2Numbers);

})();
