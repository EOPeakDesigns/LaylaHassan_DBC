import { applyTheme } from './theme.js';

/**
 * Internationalization — EN / AR with RTL support
 *
 * @module i18n
 */

const LANG_KEY = 'dbc-layla-lang';

let labelsConfig = null;
let currentLang = localStorage.getItem(LANG_KEY) || 'en';

/**
 * Loads labels from data/labels.json.
 */
export async function loadLabels() {
  try {
    const response = await fetch('/data/labels.json', { cache: 'no-cache' });
    if (response.ok) {
      labelsConfig = await response.json();
    }
  } catch (_err) {
    labelsConfig = null;
  }
}

/**
 * Returns the active language label bundle.
 * @returns {Object}
 */
function getLabelsBundle() {
  return labelsConfig?.[currentLang] || labelsConfig?.en || {};
}

/**
 * Returns a label string for the active language.
 * @param {string} key
 * @returns {string|Array|undefined}
 */
export function getLabel(key) {
  return getLabelsBundle()[key] || '';
}

/**
 * Returns active language code.
 * @returns {string}
 */
export function getLanguage() {
  return currentLang;
}

/**
 * Renders the colored name grouped by word for natural spacing and Arabic shaping.
 */
function renderName() {
  const container = document.getElementById('personName');
  if (!container) return;

  const bundle = getLabelsBundle();
  const parts = bundle.nameParts;
  if (!Array.isArray(parts) || parts.length === 0) return;

  container.innerHTML = '';
  container.classList.toggle('name--arabic', currentLang === 'ar');
  container.classList.toggle('name--english', currentLang === 'en');
  container.setAttribute('aria-label', bundle.fullName || 'Layla Hassan');

  parts.forEach((part, index) => {
    if (index > 0) {
      const gap = document.createElement('span');
      gap.className = 'name-gap';
      gap.setAttribute('aria-hidden', 'true');
      container.appendChild(gap);
    }

    const word = document.createElement('span');
    word.className = 'name-word';

    if (part.text && currentLang === 'ar') {
      word.classList.add(`name-word--${part.style || 'gradient-a'}`);
      word.textContent = part.text;
    } else if (Array.isArray(part.letters)) {
      part.letters.forEach(({ c, color }) => {
        const letter = document.createElement('span');
        letter.className = `letter ${color}`;
        letter.textContent = c;
        word.appendChild(letter);
      });
    }

    container.appendChild(word);
  });

  const avatar = document.getElementById('avatar');
  if (avatar && bundle.fullName) {
    const title = getLabel('title') || '';
    avatar.alt = `${bundle.fullName} - ${title}`;
  }
}

/**
 * Returns showcase video label bundle for the active language.
 * @returns {Object|null}
 */
export function getShowcaseLabels() {
  const showcase = getLabelsBundle().showcase;
  return showcase && typeof showcase === 'object' ? showcase : null;
}

/**
 * Applies translated copy to the DOM.
 */
export function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

  renderName();

  const titleEl = document.querySelector('[data-i18n="title"]');
  if (titleEl) titleEl.textContent = getLabel('title');

  const locationEl = document.querySelector('[data-i18n="location"]');
  if (locationEl) locationEl.textContent = getLabel('location');

  const sloganWords = document.querySelectorAll('[data-i18n-slogan]');
  const slogan = getLabel('slogan');
  if (Array.isArray(slogan)) {
    sloganWords.forEach((el, index) => {
      if (slogan[index]) el.textContent = slogan[index];
    });
  }

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (key === 'title' || key === 'location') return;
    const value = getLabel(key);
    if (typeof value === 'string' && value) el.textContent = value;
  });

  const ariaMap = {
    saveContactBtn: 'saveContact',
    shareCardBtn: 'shareCard',
    themeToggle: null,
    languageToggle: 'languageSwitch',
    callPhoneBtn: 'callPhone',
    whatsappLink: 'whatsapp',
    emailLink: 'email',
    websiteLink: 'website',
    mapsLink: 'maps',
    copyPhoneBtn: 'copyPhone',
    copyEmailBtn: 'copyEmail',
    qrModalTitle: 'qrModalTitle',
    qrDownloadBtn: 'qrDownload',
    qrCodeBtn: 'qrCode',
    behanceLink: 'behance',
    installBannerClose: 'installClose'
  };

  Object.entries(ariaMap).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el || !key) return;
    const label = getLabel(key);
    el.setAttribute('aria-label', label);
    if (el.tagName === 'BUTTON' || el.tagName === 'A') {
      el.setAttribute('title', label);
    }
  });

  const qrDownloadSpan = document.querySelector('#qrDownloadBtn span');
  if (qrDownloadSpan) qrDownloadSpan.textContent = getLabel('qrDownload');

  updateLanguageButton();
  applyTheme();
  window.getLabel = getLabel;

  if (typeof window.__dbcApplyInstallLabels === 'function') {
    window.__dbcApplyInstallLabels();
  }

  import('./video.js').then(({ refreshVideoUI }) => refreshVideoUI()).catch(() => {});
}

/**
 * Updates language toggle badge text.
 */
function updateLanguageButton() {
  const button = document.getElementById('languageToggle');
  const textEl = document.getElementById('languageToggleText');
  if (!textEl) return;

  textEl.textContent = getLabel('languageLabel');

  if (button) {
    button.setAttribute('aria-label', getLabel('languageSwitch'));
    button.setAttribute('title', getLabel('languageSwitch'));
  }
}

/**
 * Toggles language with flip animation.
 */
function toggleLanguage() {
  const button = document.getElementById('languageToggle');
  const textEl = document.getElementById('languageToggleText');

  if (textEl) textEl.classList.add('is-flipping');

  window.setTimeout(() => {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    localStorage.setItem(LANG_KEY, currentLang);
    applyTranslations();

    if (textEl) {
      textEl.classList.remove('is-flipping');
    }

    if (button) {
      button.classList.add('is-pulse');
      window.setTimeout(() => button.classList.remove('is-pulse'), 400);
    }
  }, 180);
}

/**
 * Initializes language toggle.
 */
export function initializeI18n() {
  window.getLabel = getLabel;
  applyTranslations();

  const button = document.getElementById('languageToggle');
  if (button) {
    button.addEventListener('click', toggleLanguage);
  }
}
