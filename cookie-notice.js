/* ═══════════════════════════════════════════════════════════════════════
   Cookie notice — poodleclub.co.il

   This is a NOTICE, not a consent gate. The Meta pixel loads immediately;
   this bar tells the visitor that it does and links to the policy. That is
   what the Israeli checklist requires ("צריך ליידע את הגולש/ת על כך").
   If the requirement ever changes to opt-in, gate the pixel on `accepted`
   below rather than reworking this file.

   Self-contained on purpose: injects its own markup and its own <style>,
   so a page only needs  <script src="cookie-notice.js" defer></script>.

   Dismissal persists in localStorage under 'pc-cookie-notice'.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var KEY = 'pc-cookie-notice';
  try { if (localStorage.getItem(KEY) === 'seen') return; } catch (e) {}

  var CSS =
    /* The bottom edge is crowded: accessibility button (visual left),
       WhatsApp FAB (visual right) and, under 768px, the sticky CTA bar.
       --ckh drives every offset so one value moves them all together. */
    ':root { --ckh: 0px; }' +
    '#ck-notice {' +
      'position: fixed; inset-inline: 0; bottom: 0; z-index: 950;' +
      'display: flex; align-items: center; justify-content: center;' +
      'gap: 16px; flex-wrap: wrap;' +
      'padding: 14px 20px calc(14px + env(safe-area-inset-bottom));' +
      'background: rgba(40,13,51,.97);' +
      '-webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);' +
      'border-top: 1px solid rgba(255,255,255,.16);' +
      'font-family: var(--font, sans-serif); text-align: right; direction: rtl;' +
    '}' +
    '#ck-notice p {' +
      'margin: 0; font-size: .86rem; line-height: 1.6;' +
      'color: rgba(255,255,255,.86); max-width: 760px;' +
    '}' +
    '#ck-notice a { color: var(--mint, #8FE8C4); text-decoration: underline; text-underline-offset: 3px; font-weight: 700; }' +
    '#ck-notice a:hover { color: var(--mint-lt, #C5F5E2); }' +
    '#ck-ok {' +
      'flex-shrink: 0; cursor: pointer;' +
      'padding: 11px 30px; border: none; border-radius: var(--r-pill, 100px);' +
      'background: var(--coral-btn, #CC484C); color: #fff;' +
      'font-family: inherit; font-size: .92rem; font-weight: 700;' +
      'transition: background .18s ease;' +
    '}' +
    '#ck-ok:hover { background: #B23C40; }' +
    /* lift everything that lives in the bottom corners */
    'body.has-ck #a11y-btn { bottom: calc(20px + var(--ckh)); }' +
    'body.has-ck #a11y-panel { bottom: calc(86px + var(--ckh)); }' +
    'body.has-ck .wa-fab { bottom: calc(20px + var(--ckh)); }' +
    '@media (max-width: 768px) {' +
      'body.has-ck .mob-bar { bottom: var(--ckh); }' +
      'body.has-ck.has-mob-bar #a11y-btn { bottom: calc(86px + var(--ckh)); }' +
      'body.has-ck.has-mob-bar #a11y-panel { bottom: calc(150px + var(--ckh)); }' +
      'body.has-ck:not(.has-mob-bar) #a11y-btn { bottom: calc(14px + var(--ckh)); }' +
      'body.has-ck .wa-fab { bottom: calc(14px + var(--ckh)); }' +
      '#ck-notice { gap: 12px; padding: 14px 16px calc(14px + env(safe-area-inset-bottom)); }' +
      '#ck-notice p { font-size: .82rem; }' +
      '#ck-ok { width: 100%; }' +
    '}';

  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.id = 'ck-notice';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'הודעה על שימוש בעוגיות');
  bar.innerHTML =
    '<p>אנחנו משתמשים בעוגיות ובפיקסל של מטא כדי למדוד את הפרסום שלנו ולשפר אותו. ' +
    'פרטים מלאים ואיך אפשר לסרב — ב<a href="privacy.html">מדיניות הפרטיות</a>.</p>' +
    '<button type="button" id="ck-ok">הבנתי</button>';
  document.body.appendChild(bar);

  function setOffset() {
    document.documentElement.style.setProperty('--ckh', bar.offsetHeight + 'px');
  }
  document.body.classList.add('has-ck');
  setOffset();
  window.addEventListener('resize', setOffset, { passive: true });

  document.getElementById('ck-ok').addEventListener('click', function () {
    try { localStorage.setItem(KEY, 'seen'); } catch (e) {}
    bar.remove();
    style.remove();
    document.body.classList.remove('has-ck');
    document.documentElement.style.setProperty('--ckh', '0px');
    window.removeEventListener('resize', setOffset);
  });
})();
