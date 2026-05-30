/**
 * Mobile app deep links with graceful web fallbacks.
 *
 * @module deep-links
 */

import { getCardData } from './card-data.js';

const FALLBACK_DELAY_MS = 900;

/**
 * @returns {boolean}
 */
function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
}

/**
 * @returns {boolean}
 */
function isAndroid() {
  return /Android/i.test(navigator.userAgent || '');
}

/**
 * @returns {boolean}
 */
function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent || '');
}

/**
 * Opens a native app URL on mobile; falls back to web if the app is unavailable.
 * @param {string} appUrl
 * @param {string} webUrl
 * @param {string} [secondaryFallback]
 */
export function openWithAppFallback(appUrl, webUrl, secondaryFallback) {
  if (!isMobileDevice()) {
    window.open(webUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  if (!appUrl) {
    window.location.href = webUrl;
    return;
  }

  if (isAndroid() && appUrl.startsWith('intent://')) {
    window.location.href = appUrl;
    return;
  }

  let didLeave = false;

  const timeoutId = window.setTimeout(() => {
    if (!didLeave) {
      window.location.href = secondaryFallback || webUrl;
    }
  }, FALLBACK_DELAY_MS);

  const markLeft = () => {
    didLeave = true;
    window.clearTimeout(timeoutId);
  };

  window.addEventListener('blur', markLeft, { once: true });
  window.addEventListener('pagehide', markLeft, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) markLeft();
  }, { once: true });

  window.location.href = appUrl;
}

/**
 * Opens Gmail compose — app-first on mobile, web on desktop.
 * @param {string} email
 */
export function openGmailCompose(email) {
  if (!email) return;

  const encoded = encodeURIComponent(email);
  const webUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encoded}`;
  const mailtoUrl = `mailto:${email}`;

  if (!isMobileDevice()) {
    window.open(webUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  if (isAndroid()) {
    const fallback = encodeURIComponent(webUrl);
    const intentUrl = `intent://send?to=${encoded}#Intent;scheme=mailto;action=android.intent.action.SENDTO;package=com.google.android.gm;S.browser_fallback_url=${fallback};end`;
    window.location.href = intentUrl;
    return;
  }

  if (isIOS()) {
    openWithAppFallback(
      `googlegmail:///co?to=${encoded}`,
      webUrl,
      mailtoUrl
    );
    return;
  }

  window.location.href = webUrl;
}

/**
 * @param {HTMLElement} container
 * @param {HTMLElement|null} linkEl
 * @param {() => void} action
 * @param {string} webUrl
 */
function bindTapAction(container, linkEl, action, webUrl) {
  if (!container || !webUrl) return;

  if (linkEl) {
    linkEl.href = webUrl;
    linkEl.setAttribute('rel', 'noopener noreferrer');
  }

  if (!isMobileDevice()) {
    if (linkEl) linkEl.setAttribute('target', '_blank');
    return;
  }

  if (linkEl) linkEl.removeAttribute('target');

  let lastTrigger = 0;

  const handleActivate = (event) => {
    if (event.target.closest('.copy-btn, .action-btn, button')) return;
    if (event.type === 'click' && Date.now() - lastTrigger < 450) return;

    event.preventDefault();
    event.stopPropagation();
    lastTrigger = Date.now();
    action();
  };

  container.addEventListener('click', handleActivate, { passive: false });
  container.addEventListener('touchend', handleActivate, { passive: false });

  if (linkEl) {
    linkEl.addEventListener('click', handleActivate, { passive: false });
    linkEl.addEventListener('touchend', handleActivate, { passive: false });
  }
}

/**
 * @param {string} platform
 * @param {string} webUrl
 * @returns {string|null}
 */
function getSocialAppUrl(platform, webUrl) {
  if (!webUrl) return null;

  try {
    const url = new URL(webUrl);
    const path = url.pathname.replace(/\/+$/, '');

    switch (platform) {
      case 'instagram': {
        const match = path.match(/^\/([^/?#]+)/);
        const username = match?.[1]?.replace(/^@/, '');
        return username ? `instagram://user?username=${username}` : null;
      }
      case 'tiktok': {
        const match = path.match(/@([^/?#]+)/) || path.match(/^\/([^/?#]+)/);
        const username = match?.[1]?.replace(/^@/, '');
        return username ? `tiktok://user?username=${username}` : null;
      }
      case 'facebook':
        return `fb://facewebmodal/f?href=${encodeURIComponent(webUrl)}`;
      case 'x': {
        const match = path.match(/^\/([^/?#]+)/);
        const handle = match?.[1];
        return handle ? `twitter://user?screen_name=${handle}` : null;
      }
      case 'linkedin': {
        const match = path.match(/\/in\/([^/?#]+)/);
        const slug = match?.[1];
        if (!slug) return null;
        if (isAndroid()) {
          const fallback = encodeURIComponent(webUrl);
          return `intent://${url.host}${path}#Intent;scheme=https;package=com.linkedin.android;S.browser_fallback_url=${fallback};end`;
        }
        return `linkedin://in/${slug}`;
      }
      case 'behance': {
        if (isAndroid()) {
          const fallback = encodeURIComponent(webUrl);
          return `intent://${url.host}${path}#Intent;scheme=https;package=com.behance.behance;S.browser_fallback_url=${fallback};end`;
        }
        return null;
      }
      default:
        return null;
    }
  } catch (_error) {
    return null;
  }
}

/**
 * @param {HTMLElement} element
 * @param {string} appUrl
 * @param {string} webUrl
 */
function bindDeepLink(element, appUrl, webUrl) {
  bindTapAction(element, element, () => {
    openWithAppFallback(appUrl, webUrl);
  }, webUrl);
}

/**
 * Wires Gmail + social links from card.json with app-first mobile behavior.
 */
export function initializeDeepLinks() {
  const data = getCardData();
  const webUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(data.email || '')}`;

  const emailRow = document.getElementById('emailContactRow');
  const emailLink = document.getElementById('emailLink');

  if (emailRow && data.email) {
    bindTapAction(
      emailRow,
      emailLink,
      () => openGmailCompose(data.email),
      webUrl
    );
  }

  const social = data.social || {};
  const platformMap = {
    instagram: 'instagram',
    tiktok: 'tiktok',
    facebook: 'facebook',
    x: 'x',
    linkedin: 'linkedin',
    behance: 'behance'
  };

  Object.entries(platformMap).forEach(([key, platform]) => {
    const socialWebUrl = social[key];
    if (!socialWebUrl) return;

    const link = document.querySelector(`[data-social="${platform}"]`);
    if (!link) return;

    const appUrl = getSocialAppUrl(platform, socialWebUrl);
    bindDeepLink(link, appUrl || socialWebUrl, socialWebUrl);
  });
}
