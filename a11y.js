/* ═══════════════════════════════════════════════════════════════════════
   Accessibility widget — poodleclub.co.il
   Injects its own markup, so a page only needs:
     <link rel="stylesheet" href="a11y.css">
     <script src="a11y.js" defer></script>

   Preferences persist in localStorage under 'pc-a11y'. That is functional
   storage, not tracking — it is disclosed in privacy.html.

   Pages with their own animation loops can listen for the 'pc:motion' event
   or read window.pcMotionOff.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var MARKUP =
    '<button id="a11y-btn" type="button" aria-expanded="false" aria-controls="a11y-panel" aria-label="פתיחת תפריט נגישות">' +
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' +
        '<circle cx="12" cy="4" r="2"/>' +
        '<path d="M20.5 7.5c-2.6.8-5.3 1.2-8.5 1.2s-5.9-.4-8.5-1.2a1 1 0 10-.6 1.9c2 .6 4.1 1 6.3 1.2l-.7 4.1-2 5.9a1.05 1.05 0 002 .7l2.2-6h1.6l2.2 6a1.05 1.05 0 002-.7l-2-5.9-.7-4.1c2.2-.2 4.3-.6 6.3-1.2a1 1 0 10-.6-1.9z"/>' +
      '</svg>' +
    '</button>' +
    '<div id="a11y-panel" role="dialog" aria-labelledby="a11y-title">' +
      '<h2 id="a11y-title">הגדרות נגישות</h2>' +
      '<p class="a11y-hint">ההגדרות נשמרות בדפדפן שלכם ויישארו גם בביקור הבא.</p>' +
      '<button class="a11y-opt" type="button" id="a11y-text" aria-pressed="false">הגדלת טקסט <span class="a11y-state" id="a11y-text-state">רגיל</span></button>' +
      '<button class="a11y-opt" type="button" id="a11y-contrast" aria-pressed="false">ניגודיות גבוהה</button>' +
      '<button class="a11y-opt" type="button" id="a11y-motion" aria-pressed="false">עצירת אנימציות</button>' +
      '<button class="a11y-opt" type="button" id="a11y-links" aria-pressed="false">הדגשת קישורים</button>' +
      '<button class="a11y-opt" type="button" id="a11y-font" aria-pressed="false">פונט קריא</button>' +
      '<button class="a11y-opt" type="button" id="a11y-reset">איפוס כל ההגדרות</button>' +
      '<a class="a11y-link" href="accessibility.html">להצהרת הנגישות המלאה</a>' +
    '</div>';

  var host = document.createElement('div');
  host.id = 'a11y-root';
  host.innerHTML = MARKUP;
  document.body.appendChild(host);

  var root  = document.documentElement;
  var KEY   = 'pc-a11y';
  var btn   = document.getElementById('a11y-btn');
  var panel = document.getElementById('a11y-panel');
  var state = { fs: 0, contrast: false, motion: false, links: false, font: false };

  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}

  // honour the operating-system setting before anyone touches the widget
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) state.motion = true;

  var frozen = [];
  function freezeGifs(on) {
    // CSS cannot pause a GIF — paint the current frame to a canvas and swap it in
    if (on) {
      Array.prototype.forEach.call(document.querySelectorAll('img[src$=".gif"]'), function (img) {
        if (img.dataset.frozen) return;
        try {
          var cv = document.createElement('canvas');
          cv.width  = img.naturalWidth  || img.offsetWidth;
          cv.height = img.naturalHeight || img.offsetHeight;
          if (!cv.width || !cv.height) return;
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          cv.className = img.className;
          if (img.getAttribute('aria-hidden') === 'true') {
            cv.setAttribute('aria-hidden', 'true');
          } else {
            cv.setAttribute('role', 'img');
            cv.setAttribute('aria-label', img.alt || '');
          }
          img.style.display = 'none';
          img.dataset.frozen = '1';
          img.parentNode.insertBefore(cv, img);
          frozen.push({ img: img, cv: cv });
        } catch (e) {}
      });
    } else {
      frozen.forEach(function (f) { f.cv.remove(); f.img.style.display = ''; delete f.img.dataset.frozen; });
      frozen = [];
    }
  }

  function apply() {
    root.classList.toggle('a11y-fs1', state.fs === 1);
    root.classList.toggle('a11y-fs2', state.fs === 2);
    root.classList.toggle('a11y-fs3', state.fs === 3);
    root.classList.toggle('a11y-contrast', state.contrast);
    root.classList.toggle('no-motion',     state.motion);
    root.classList.toggle('a11y-links',    state.links);
    root.classList.toggle('a11y-font',     state.font);

    document.getElementById('a11y-text').setAttribute('aria-pressed', state.fs > 0);
    document.getElementById('a11y-text-state').textContent = ['רגיל', '110%', '120%', '130%'][state.fs];
    document.getElementById('a11y-contrast').setAttribute('aria-pressed', state.contrast);
    document.getElementById('a11y-motion').setAttribute('aria-pressed',   state.motion);
    document.getElementById('a11y-links').setAttribute('aria-pressed',    state.links);
    document.getElementById('a11y-font').setAttribute('aria-pressed',     state.font);

    freezeGifs(state.motion);

    // JS-driven loops don't watch CSS classes — tell them directly
    window.pcMotionOff = state.motion;
    document.dispatchEvent(new CustomEvent('pc:motion', { detail: { off: state.motion } }));

    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function open(o) {
    panel.dataset.open = o ? '1' : '0';
    btn.setAttribute('aria-expanded', o ? 'true' : 'false');
    btn.setAttribute('aria-label', (o ? 'סגירת' : 'פתיחת') + ' תפריט נגישות');
    if (o) panel.querySelector('.a11y-opt').focus();
  }

  btn.addEventListener('click', function () { open(panel.dataset.open !== '1'); });
  document.getElementById('a11y-text').addEventListener('click', function () { state.fs = (state.fs + 1) % 4; apply(); });
  ['contrast', 'motion', 'links', 'font'].forEach(function (k) {
    document.getElementById('a11y-' + k).addEventListener('click', function () { state[k] = !state[k]; apply(); });
  });
  document.getElementById('a11y-reset').addEventListener('click', function () {
    state = { fs: 0, contrast: false, motion: mq.matches, links: false, font: false };
    apply(); btn.focus();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.dataset.open === '1') { open(false); btn.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (panel.dataset.open === '1' && !panel.contains(e.target) && !btn.contains(e.target)) open(false);
  });
  mq.addEventListener('change', function (e) { state.motion = e.matches; apply(); });

  apply();
})();
