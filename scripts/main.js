/**
 * Main Application Entry Point
 * Digital Business Card - Layla Hassan
 *
 * @module main
 */

import { createBackgroundElements } from './decorations.js';
import { enableParallax } from './parallax.js';
import { initializeCopyButtons } from './clipboard.js';
import { initializeModal } from './modal.js';
import { loadCardConfig, applyProductionMeta, getCardData } from './card-data.js';
import { initializeVCardShare } from './vcard-share.js';
import { initializeTheme } from './theme.js';
import { loadLabels, initializeI18n, getLabel } from './i18n.js';
import { initializeVideo } from './video.js';

/**
 * Applies install banner labels from i18n + card.json overrides.
 */
export function applyInstallLabels() {
  if (typeof window.PWAInstall?.applyLabels !== 'function') return;

  const cardLabels = getCardData().labels || {};

  window.PWAInstall.applyLabels({
    installTitle: getLabel('installTitle') || cardLabels.installTitle,
    installText: getLabel('installText') || cardLabels.installText,
    installApp: getLabel('installApp') || cardLabels.installApp || getLabel('pwaInstallBtn'),
    installDismiss: getLabel('installDismiss') || cardLabels.installDismiss,
    installGuideIOS: getLabel('installGuideIOS') || cardLabels.installGuideIOS,
    installGuideAndroid: getLabel('installGuideAndroid') || cardLabels.installGuideAndroid,
    closeAria: getLabel('installClose') || cardLabels.installClose || getLabel('pwaDismiss'),
    dialogAria: getLabel('installDialogAria') || cardLabels.installDialogAria
  });
}

/**
 * Initializes the application after config and labels are loaded.
 */
function initializeApp() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    createBackgroundElements();
    enableParallax();
  }

  window.__dbcApplyInstallLabels = applyInstallLabels;

  initializeTheme();
  initializeI18n();
  applyProductionMeta();
  applyInstallLabels();
  initializeCopyButtons();
  initializeModal();
  initializeVideo();
  initializeVCardShare();
}

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadCardConfig(), loadLabels()]);
  initializeApp();
});
