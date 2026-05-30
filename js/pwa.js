/**
 * PWA bootstrap — prompt capture, SW registration, one-time reload.
 * Must load synchronously in <head> before any async code.
 */
(function () {
  'use strict';

  window.__dbcDeferredPrompt = null;
  window.__dbcPwaSwControlling = false;

  var hadControllerAtStart = Boolean(navigator.serviceWorker && navigator.serviceWorker.controller);
  var RELOAD_DELAY_MS = 2200;
  var BOOT_KEY = 'dbc-sw-boot-v2';

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    window.__dbcDeferredPrompt = event;
    window.dispatchEvent(new Event('dbc-pwa-prompt-ready'));
  });

  function shouldBootstrapReload() {
    if (window.__dbcDeferredPrompt || hadControllerAtStart) return false;
    try {
      return sessionStorage.getItem(BOOT_KEY) !== '1';
    } catch (_err) {
      return false;
    }
  }

  function scheduleBootstrapReload() {
    if (!shouldBootstrapReload()) return;

    setTimeout(function () {
      if (window.__dbcDeferredPrompt || !shouldBootstrapReload()) return;
      try {
        sessionStorage.setItem(BOOT_KEY, '1');
      } catch (_err) { /* noop */ }
      window.location.reload();
    }, RELOAD_DELAY_MS);
  }

  function markControlling() {
    if (window.__dbcPwaSwControlling) return;
    window.__dbcPwaSwControlling = true;
    window.dispatchEvent(new Event('dbc-pwa-sw-controlling'));
  }

  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (navigator.serviceWorker.controller) {
      markControlling();
    }
  });

  if (navigator.serviceWorker.controller) {
    markControlling();
  }

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(function (registration) {
        window.dispatchEvent(new Event('dbc-pwa-sw-ready'));

        if (registration.active && navigator.serviceWorker.controller) {
          markControlling();
        }

        registration.addEventListener('updatefound', function () {
          var newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', function () {
            if (newWorker.state === 'activated' && !hadControllerAtStart) {
              scheduleBootstrapReload();
            }
          });
        });

        if (registration.waiting && !hadControllerAtStart) {
          registration.waiting.postMessage('SKIP_WAITING');
        }

        if (registration.active && !hadControllerAtStart && !navigator.serviceWorker.controller) {
          scheduleBootstrapReload();
        }

        return navigator.serviceWorker.ready;
      })
      .then(function () {
        window.dispatchEvent(new Event('dbc-pwa-sw-ready'));
        if (navigator.serviceWorker.controller) {
          markControlling();
        }
      })
      .catch(function () {
        /* SW requires HTTPS or localhost */
      });
  });
})();
