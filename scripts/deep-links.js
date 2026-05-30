/**
 * Mobile app deep links with graceful web fallbacks.
 *
 * @module deep-links
 */

import { getCardData } from './card-data.js';

const FALLBACK_DELAY_MS = 1100;

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
 * Opens a native app URL on mobile; falls back to web if the app is unavailable.
 * @param {string} appUrl
 * @param {string} webUrl
 */
export function openWithAppFallback(appUrl, webUrl) {
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
      window.location.href = webUrl;
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
 * @param {string} email
 * @returns {{ appUrl: string, webUrl: string }}
 */
export function getGmailLinks(email) {
  const encoded = encodeURIComponent(email);
  const webUrl = `https://mail.google.com/mail/?view=cm&to=${encoded}`;

  if (isAndroid()) {
    const fallback = encodeURIComponent(webUrl);
    return {
      appUrl: `intent://send/#Intent;action=android.intent.action.SENDTO;scheme=mailto;to=${encoded};package=com.google.android.gm;S.browser_fallback_url=${fallback};end`,
      webUrl
    };
  }

  return {
    appUrl: `googlegmail://co?to=${encoded}`,
    webUrl
  };
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
  if (!element || !webUrl) return;

  element.href = webUrl;
  element.setAttribute('rel', 'noopener noreferrer');

  if (!isMobileDevice()) {
    element.setAttribute('target', '_blank');
    return;
  }

  element.removeAttribute('target');

  element.addEventListener('click', (event) => {
    event.preventDefault();
    openWithAppFallback(appUrl, webUrl);
  });
}

/**
 * Wires Gmail + social links from card.json with app-first mobile behavior.
 */
export function initializeDeepLinks() {
  const data = getCardData();

  const emailLink = document.getElementById('emailLink');
  if (emailLink && data.email) {
    const gmail = getGmailLinks(data.email);
    bindDeepLink(emailLink, gmail.appUrl, gmail.webUrl);
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
    const webUrl = social[key];
    if (!webUrl) return;

    const link = document.querySelector(`[data-social="${platform}"]`);
    if (!link) return;

    const appUrl = getSocialAppUrl(platform, webUrl);
    bindDeepLink(link, appUrl || webUrl, webUrl);
  });
}
