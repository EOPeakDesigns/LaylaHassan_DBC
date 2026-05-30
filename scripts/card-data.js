/**
 * Card Data Module
 * Loads owner config from data/card.json and applies production meta tags.
 *
 * @module card-data
 */

let cardConfig = null;

const DEFAULT_CARD_DATA = {
  lang: 'en',
  fullName: 'Layla Hassan',
  title: 'Product Designer',
  email: 'la.hassan@gmail.com',
  phone: '+201234567890',
  phoneDisplay: '+20 123 456 7890',
  whatsapp: '201234567890',
  website: 'https://laylahassan.design',
  websiteDisplay: 'laylahassan.design',
  location: 'Cairo, Egypt',
  organization: 'Layla Hassan Design',
  slogan: 'Design. Create. Inspire.',
  shareUrl: '',
  profileImage: 'assets/owner.webp',
  qrImage: 'assets/MYQR.png',
  showcaseVideo: { enabled: false }
};

/**
 * Loads card.json when served over HTTP.
 */
export async function loadCardConfig() {
  try {
    const response = await fetch('/data/card.json', { cache: 'no-cache' });
    if (response.ok) {
      cardConfig = await response.json();
    }
  } catch (_err) {
    cardConfig = null;
  }
}

/**
 * Returns merged card data with HTML fallbacks.
 * @returns {Object}
 */
export function getCardData() {
  if (cardConfig) return { ...DEFAULT_CARD_DATA, ...cardConfig };
  return { ...DEFAULT_CARD_DATA };
}

/**
 * Builds an absolute URL for a site asset or external resource.
 * @param {string} pageOrigin
 * @param {string} assetPath
 * @returns {string}
 */
function toAbsoluteAssetUrl(pageOrigin, assetPath) {
  if (!assetPath) return '';
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  const normalized = assetPath.replace(/^\//, '');
  return `${pageOrigin}/${normalized}`;
}

/**
 * Updates canonical and Open Graph URLs for sharing.
 */
export function applyProductionMeta() {
  const data = getCardData();
  let pageUrl = data.shareUrl && data.shareUrl.trim();

  if (!pageUrl) {
    const path = window.location.pathname.replace(/index\.html$/i, '');
    const normalized = path.endsWith('/') ? path : `${path}/`;
    pageUrl = window.location.origin + (normalized === '/' ? '/' : normalized);
  }

  if (!pageUrl.endsWith('/')) {
    pageUrl += '/';
  }

  const origin = new URL(pageUrl).origin;
  const profileImage = toAbsoluteAssetUrl(origin, data.profileImage || 'assets/owner.webp');
  const pageTitle = `${data.fullName} - ${data.title}`;
  const pageDescription = `Connect with ${data.fullName}, ${data.title} in ${data.location}.`;

  const canonical = document.getElementById('canonical-link');
  if (canonical) canonical.href = pageUrl;

  const ogUrl = document.getElementById('og-url');
  if (ogUrl) ogUrl.setAttribute('content', pageUrl);

  document.title = pageTitle;

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute(
      'content',
      `Digital business card for ${data.fullName} - ${data.title} based in ${data.location}.`
    );
  }

  const ogTitle = document.getElementById('og-title');
  if (ogTitle) ogTitle.setAttribute('content', pageTitle);

  const ogDescription = document.getElementById('og-description');
  if (ogDescription) ogDescription.setAttribute('content', pageDescription);

  const ogImage = document.getElementById('og-image');
  if (ogImage) ogImage.setAttribute('content', profileImage);

  const twitterTitle = document.getElementById('twitter-title');
  if (twitterTitle) twitterTitle.setAttribute('content', pageTitle);

  const twitterDescription = document.getElementById('twitter-description');
  if (twitterDescription) twitterDescription.setAttribute('content', pageDescription);

  const twitterImage = document.getElementById('twitter-image');
  if (twitterImage) twitterImage.setAttribute('content', profileImage);
}

/**
 * Announces feedback to screen readers.
 * @param {string} message
 */
export function announceStatus(message) {
  const liveRegion = document.getElementById('copy-status');
  if (!liveRegion) return;

  liveRegion.textContent = message || window.getLabel?.('copied') || 'Copied to clipboard';
  window.setTimeout(() => {
    liveRegion.textContent = '';
  }, 2000);
}
