/**
 * Theme Toggle — light / dark / auto (system)
 *
 * @module theme
 */

const THEME_KEY = 'dbc-layla-theme';
const THEME_ORDER = ['light', 'dark', 'system'];

const THEME_META = {
  light: '#ff7eb5',
  dark: '#2d2438'
};

const THEME_ICONS = {
  light: 'fa-solid fa-sun',
  dark: 'fa-solid fa-moon',
  system: 'fa-solid fa-circle-half-stroke'
};

const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

let themePreference = localStorage.getItem(THEME_KEY) || 'system';

/**
 * Resolves stored preference to an applied theme name.
 * @returns {'light'|'dark'}
 */
export function getActiveTheme() {
  if (themePreference === 'system') {
    return systemThemeQuery.matches ? 'dark' : 'light';
  }
  return themePreference;
}

/**
 * Returns current stored preference.
 * @returns {string}
 */
export function getThemePreference() {
  return themePreference;
}

/**
 * Updates theme-color meta tag.
 */
function syncThemeColor() {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.content = THEME_META[getActiveTheme()];
  }
}

/**
 * Updates the single theme icon class.
 */
function updateThemeIcon() {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;

  icon.className = THEME_ICONS[themePreference] || THEME_ICONS.system;
}

/**
 * Applies resolved theme to the document.
 */
export function applyTheme() {
  const active = getActiveTheme();
  document.documentElement.dataset.theme = active;
  syncThemeColor();
  updateThemeIcon();
  updateThemeButton();
}

/**
 * Updates theme toggle accessible label.
 */
function updateThemeButton() {
  const button = document.getElementById('themeToggle');
  if (!button) return;

  const labelKey = themePreference === 'system'
    ? 'themeAuto'
    : themePreference === 'dark'
      ? 'themeDark'
      : 'themeLight';

  const label = window.getLabel?.(labelKey) || themePreference;
  const themeWord = window.getLabel?.('theme') || 'Theme';
  button.setAttribute('aria-label', `${themeWord}: ${label}`);
  button.setAttribute('title', `${themeWord}: ${label}`);
}

/**
 * Cycles theme preference with a brief icon animation.
 */
function cycleTheme() {
  const button = document.getElementById('themeToggle');
  const currentIndex = THEME_ORDER.indexOf(themePreference);
  themePreference = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
  localStorage.setItem(THEME_KEY, themePreference);

  if (button) {
    button.classList.add('is-switching');
    window.setTimeout(() => {
      applyTheme();
      button.classList.remove('is-switching');
    }, 200);
  } else {
    applyTheme();
  }
}

/**
 * Initializes theme toggle and system preference listener.
 */
export function initializeTheme() {
  applyTheme();

  const button = document.getElementById('themeToggle');
  if (button) {
    button.addEventListener('click', cycleTheme);
  }

  systemThemeQuery.addEventListener('change', () => {
    if (themePreference === 'system') {
      applyTheme();
    }
  });
}
