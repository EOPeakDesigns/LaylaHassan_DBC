/**
 * QR Code Modal Module
 * Digital Business Card - Layla Hassan
 *
 * Handles open/close, download, keyboard accessibility, and focus trap.
 *
 * @module modal
 */

import { releaseButtonInteraction } from './interaction.js';

let modal = null;
let modalOverlay = null;
let modalClose = null;
let qrCodeBtn = null;
let qrDownloadBtn = null;
let qrImage = null;
let previouslyFocused = null;

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Returns visible focusable elements inside the modal.
 * @returns {HTMLElement[]}
 */
function getFocusableElements() {
  if (!modal) return [];

  return Array.from(modal.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter((el) => !el.disabled && el.offsetParent !== null);
}

/**
 * Traps Tab focus within the modal while open.
 * @param {KeyboardEvent} event
 */
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

/**
 * Clears sticky hover/focus on the QR trigger after open, close, or ESC.
 */
function releaseQrTriggerInteraction() {
  releaseButtonInteraction(qrCodeBtn);
}

/**
 * Opens the QR code modal.
 */
function openModal() {
  if (!modal) return;

  previouslyFocused = document.activeElement;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');

  releaseQrTriggerInteraction();

  if (modalClose) {
    modalClose.focus();
  }

  document.body.style.overflow = 'hidden';
}

/**
 * Closes the QR code modal and restores focus.
 */
function closeModal() {
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  if (modalClose && document.activeElement === modalClose) {
    modalClose.blur();
  }

  releaseQrTriggerInteraction();

  const restoreTarget = previouslyFocused && previouslyFocused !== qrCodeBtn
    ? previouslyFocused
    : null;

  if (restoreTarget && typeof restoreTarget.focus === 'function') {
    restoreTarget.focus();
  }

  previouslyFocused = null;
}

/**
 * Downloads the QR code image.
 */
function downloadQRCode() {
  if (!qrImage) return;

  const link = document.createElement('a');
  link.href = qrImage.src;
  link.download = 'Layla-Hassan-QR-Code.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Handles keyboard events for the modal.
 * @param {KeyboardEvent} event
 */
function handleKeydown(event) {
  if (event.key === 'Escape' && modal?.classList.contains('active')) {
    closeModal();
    return;
  }

  handleFocusTrap(event);
}

/**
 * Initializes the QR code modal functionality.
 */
export function initializeModal() {
  modal = document.getElementById('qrModal');
  modalOverlay = document.getElementById('qrModalOverlay');
  modalClose = document.getElementById('qrModalClose');
  qrCodeBtn = document.getElementById('qrCodeBtn');
  qrDownloadBtn = document.getElementById('qrDownloadBtn');
  qrImage = document.getElementById('qrImage');

  if (!modal || !qrCodeBtn) {
    return;
  }

  qrCodeBtn.addEventListener('click', openModal);

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }

  if (qrDownloadBtn) {
    qrDownloadBtn.addEventListener('click', downloadQRCode);
  }

  document.addEventListener('keydown', handleKeydown);
}
