import { announceStatus } from './card-data.js';

/**
 * Clipboard Copy Functionality
 * Digital Business Card - Layla Hassan
 * 
 * Brand: EOPeak
 * Developer: Eng. Eslam Osama Saad
 * 
 * This module handles copy-to-clipboard functionality for contact information.
 * Features:
 * - Copies text to clipboard
 * - Visual feedback with icon change (copy → check)
 * - Temporary disabled state (1 second)
 * - Automatic state reset
 * 
 * @module clipboard
 */

/**
 * Configuration for copy functionality
 * @const {Object}
 */
const COPY_CONFIG = {
  resetDelay: 1000,          // Time in ms before resetting to normal state
  copyIcon: 'fa-copy',       // Font Awesome copy icon class
  checkIcon: 'fa-check',     // Font Awesome check icon class
  copiedClass: 'copied'      // CSS class for success state
};

/**
 * Copies text to clipboard using modern Clipboard API
 * Falls back to legacy method if needed
 * 
 * @param {string} text - The text to copy to clipboard
 * @returns {Promise<boolean>} - Promise resolving to success status
 */
async function copyToClipboard(text) {
  try {
    // Modern Clipboard API (preferred)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-HTTPS
      return fallbackCopyTextToClipboard(text);
    }
  } catch (err) {
    return false;
  }
}

/**
 * Fallback copy method for older browsers
 * Creates temporary textarea, selects and copies content
 * 
 * @param {string} text - The text to copy
 * @returns {boolean} - Success status
 */
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Make textarea invisible and non-interactive
  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  textArea.style.left = '-9999px';
  textArea.setAttribute('readonly', '');
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    document.body.removeChild(textArea);
    return false;
  }
}

/**
 * Handles copy button click event
 * Manages button state transitions and visual feedback
 * 
 * @param {Event} event - Click event object
 */
async function handleCopyClick(event) {
  const button = event.currentTarget;
  const textToCopy = button.getAttribute('data-copy-text');
  
  if (!textToCopy || button.disabled) {
    return;
  }
  
  // Disable button to prevent multiple clicks
  button.disabled = true;
  
  // Attempt to copy text
  const success = await copyToClipboard(textToCopy);
  
  if (success) {
    const icon = button.querySelector('i');
    icon.classList.remove(COPY_CONFIG.copyIcon);
    icon.classList.add(COPY_CONFIG.checkIcon);
    button.classList.add(COPY_CONFIG.copiedClass);
    announceStatus(window.getLabel?.('copied') || 'Copied to clipboard');

    setTimeout(() => {
      // Restore copy icon
      icon.classList.remove(COPY_CONFIG.checkIcon);
      icon.classList.add(COPY_CONFIG.copyIcon);
      
      // Remove success state
      button.classList.remove(COPY_CONFIG.copiedClass);
      
      // Re-enable button
      button.disabled = false;
    }, COPY_CONFIG.resetDelay);
  } else {
    // If copy failed, re-enable button immediately
    button.disabled = false;
  }
}

/**
 * Initializes copy functionality for all copy buttons
 * Attaches event listeners and sets up state management
 * 
 * @export
 */
export function initializeCopyButtons() {
  // Find all copy buttons
  const copyButtons = document.querySelectorAll('.copy-btn');
  
  // Attach click handlers
  copyButtons.forEach(button => {
    button.addEventListener('click', handleCopyClick);
  });
}

