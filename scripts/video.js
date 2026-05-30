/**
 * Owner Showcase Video Modal
 *
 * @module video
 */

import { getCardData } from './card-data.js';
import { getShowcaseLabels } from './i18n.js';
import { releaseButtonInteraction } from './interaction.js';

let modal = null;
let modalOverlay = null;
let modalClose = null;
let openVideoBtn = null;
let avatarShell = null;
let avatarImage = null;
let embedFrame = null;
let filePlayer = null;
let videoEyebrow = null;
let videoTitle = null;
let videoCaption = null;
let videoUnavailable = null;
let previouslyFocused = null;

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * @returns {boolean}
 */
export function isShowcaseVideoAvailable() {
  const video = getCardData().showcaseVideo || {};
  if (video.enabled === false) return false;
  const type = video.type || 'embed';
  if (type === 'file') return Boolean(video.fileSrc?.trim());
  return Boolean(video.embedUrl?.trim());
}

/**
 * @returns {HTMLElement[]}
 */
function getFocusableElements() {
  if (!modal) return [];
  return Array.from(modal.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter((el) => !el.disabled && el.offsetParent !== null);
}

function handleFocusTrap(event) {
  if (!modal?.classList.contains('active') || event.key !== 'Tab') return;

  const focusable = getFocusableElements();
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function resetMedia() {
  if (embedFrame) {
    embedFrame.src = '';
    embedFrame.hidden = true;
  }

  if (filePlayer) {
    filePlayer.pause();
    filePlayer.removeAttribute('src');
    filePlayer.load();
    filePlayer.hidden = true;
  }
}

function applyShowcaseCopy() {
  const labels = getShowcaseLabels();
  if (!labels) return;

  if (videoEyebrow) videoEyebrow.textContent = labels.eyebrow || '';
  if (videoTitle) videoTitle.textContent = labels.title || '';
  if (videoCaption) videoCaption.textContent = labels.caption || '';

  if (openVideoBtn && labels.triggerAria) {
    openVideoBtn.setAttribute('aria-label', labels.triggerAria);
    openVideoBtn.setAttribute('title', labels.triggerAria);
  }

  if (modalClose && labels.closeAria) {
    modalClose.setAttribute('aria-label', labels.closeAria);
  }

  if (videoUnavailable && labels.unavailable) {
    videoUnavailable.textContent = labels.unavailable;
  }

  const frameTitle = labels.title || labels.modalAria || 'Showcase video';
  if (embedFrame) embedFrame.title = frameTitle;
  if (filePlayer) filePlayer.setAttribute('aria-label', frameTitle);
}

function loadMedia() {
  const video = getCardData().showcaseVideo || {};
  const type = video.type === 'file' ? 'file' : 'embed';

  if (type === 'file' && filePlayer && video.fileSrc?.trim()) {
    if (embedFrame) embedFrame.hidden = true;
    filePlayer.hidden = false;
    if (video.poster?.trim()) {
      filePlayer.poster = video.poster;
    } else if (avatarImage?.src) {
      filePlayer.poster = avatarImage.src;
    }
    filePlayer.src = video.fileSrc;
    filePlayer.load();
    filePlayer.play().catch(() => {
      filePlayer.controls = true;
    });
    return;
  }

  if (embedFrame && video.embedUrl?.trim()) {
    if (filePlayer) filePlayer.hidden = true;
    embedFrame.hidden = false;
    embedFrame.src = video.embedUrl;
  }
}

function syncVideoTriggerVisibility() {
  const available = isShowcaseVideoAvailable();

  if (avatarShell) {
    avatarShell.dataset.hasVideo = available ? 'true' : 'false';
  }

  if (openVideoBtn) {
    openVideoBtn.hidden = !available;
    openVideoBtn.disabled = !available;
  }
}

function openVideoModal() {
  if (!modal || !isShowcaseVideoAvailable()) return;

  previouslyFocused = document.activeElement;
  applyShowcaseCopy();
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  releaseButtonInteraction(openVideoBtn);

  if (videoUnavailable) {
    videoUnavailable.hidden = true;
  }

  loadMedia();

  if (modalClose) {
    modalClose.focus();
  }
}

function closeVideoModal() {
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  resetMedia();

  if (modalClose && document.activeElement === modalClose) {
    modalClose.blur();
  }

  releaseButtonInteraction(openVideoBtn);

  const restoreTarget = previouslyFocused && previouslyFocused !== openVideoBtn
    ? previouslyFocused
    : null;

  if (restoreTarget && typeof restoreTarget.focus === 'function') {
    restoreTarget.focus();
  }

  previouslyFocused = null;
}

function handleKeydown(event) {
  if (event.key === 'Escape' && modal?.classList.contains('active')) {
    closeVideoModal();
    return;
  }

  handleFocusTrap(event);
}

/**
 * Initializes showcase video UI and modal behavior.
 */
export function initializeVideo() {
  modal = document.getElementById('videoModal');
  modalOverlay = document.getElementById('videoModalOverlay');
  modalClose = document.getElementById('videoModalClose');
  openVideoBtn = document.getElementById('openVideoBtn');
  avatarShell = document.getElementById('avatarShell');
  avatarImage = document.getElementById('avatar');
  embedFrame = document.getElementById('videoEmbedFrame');
  filePlayer = document.getElementById('videoFilePlayer');
  videoEyebrow = document.getElementById('videoEyebrow');
  videoTitle = document.getElementById('videoModalTitle');
  videoCaption = document.getElementById('videoCaption');
  videoUnavailable = document.getElementById('videoUnavailable');

  syncVideoTriggerVisibility();
  applyShowcaseCopy();

  if (!isShowcaseVideoAvailable()) {
    return;
  }

  openVideoBtn?.addEventListener('click', openVideoModal);

  avatarImage?.addEventListener('click', () => {
    if (isShowcaseVideoAvailable()) {
      openVideoModal();
    }
  });

  avatarImage?.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && isShowcaseVideoAvailable()) {
      event.preventDefault();
      openVideoModal();
    }
  });

  if (avatarImage && isShowcaseVideoAvailable()) {
    avatarImage.classList.add('avatar--interactive');
    avatarImage.setAttribute('tabindex', '0');
    avatarImage.setAttribute('role', 'button');
  }

  modalClose?.addEventListener('click', closeVideoModal);
  modalOverlay?.addEventListener('click', closeVideoModal);
  document.addEventListener('keydown', handleKeydown);
}

/**
 * Re-syncs trigger visibility and copy after config or language changes.
 */
export function refreshVideoUI() {
  syncVideoTriggerVisibility();
  applyShowcaseCopy();
}
