/**
 * Clears sticky hover/focus styles on interactive buttons after click or modal close.
 *
 * @param {HTMLElement|null} button
 */
export function releaseButtonInteraction(button) {
  if (!button) return;

  button.blur();
  button.classList.add('is-hover-cleared');

  const removeClearedState = () => {
    button.classList.remove('is-hover-cleared');
  };

  button.addEventListener('pointerenter', removeClearedState, { once: true });
  window.setTimeout(removeClearedState, 450);
}
