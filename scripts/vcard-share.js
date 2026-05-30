/**
 * vCard Download & Web Share Module
 *
 * @module vcard-share
 */

import { getCardData, announceStatus } from './card-data.js';
import { getLabel } from './i18n.js';
import { releaseButtonInteraction } from './interaction.js';

/**
 * Builds a vCard 3.0 string from card data.
 * @param {Object} data
 * @returns {string}
 */
function buildVCard(data) {
  const nameParts = (data.fullName || '').trim().split(/\s+/);
  const familyName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0] || '';
  const givenNames = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.fullName}`,
    `N:${familyName};${givenNames};;;`,
    `TITLE:${data.title}`,
    `TEL;TYPE=CELL:${data.phone}`,
    `EMAIL;TYPE=INTERNET:${data.email}`,
    `URL:${data.website}`,
    `ADR;TYPE=WORK:;;${data.location};;;;`,
    `ORG:${data.organization || data.fullName}`
  ];

  return `${lines.join('\r\n')}\r\nEND:VCARD\r\n`;
}

/**
 * Triggers a mobile-compatible vCard download.
 * @param {Event} [event]
 */
export function downloadVCard(event) {
  const data = getCardData();
  const vcard = buildVCard(data);
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.fullName.replace(/\s+/g, '-')}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  announceStatus(getLabel('contactDownloaded') || 'Contact file downloaded');
  releaseButtonInteraction(event?.currentTarget || document.getElementById('saveContactBtn'));
}

/**
 * Shares the card via Web Share API with clipboard fallback.
 */
export async function shareCard() {
  const data = getCardData();
  const shareUrl = data.shareUrl || window.location.href;
  const shareData = {
    title: `${data.fullName} - ${data.title}`,
    text: data.slogan || 'Digital business card',
    url: shareUrl
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      announceStatus(getLabel('linkCopied') || 'Link copied to clipboard');
      return;
    } catch (_err) {
      /* fall through */
    }
  }

  window.prompt('Share this link:', shareUrl);
}

/**
 * Wires save and share utility buttons.
 */
export function initializeVCardShare() {
  const saveBtn = document.getElementById('saveContactBtn');
  const shareBtn = document.getElementById('shareCardBtn');

  if (saveBtn) {
    saveBtn.addEventListener('click', downloadVCard);
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', shareCard);
  }
}
