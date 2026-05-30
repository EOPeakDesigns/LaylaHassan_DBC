/**
 * PWA Install Banner — native Chrome install + iOS / in-app fallbacks.
 * @version 1
 */
(function () {
  'use strict';

  var LATE_PROMPT_MS = 15000;
  var LATE_PROMPT_INTERVAL = 500;
  var IOS_SHOW_DELAY = 1200;

  var PWAInstall = {
    deferredPrompt: null,
    dismissedThisView: false,
    banner: null,
    titleEl: null,
    textEl: null,
    guideEl: null,
    installBtn: null,
    notNowBtn: null,
    closeBtn: null,
    labels: {},
    latePromptTimer: null,
    latePromptPoll: null,
    engagementBound: false,

    init: function () {
      this.banner = document.getElementById('install-banner');
      this.titleEl = document.getElementById('install-banner-title');
      this.textEl = document.getElementById('install-banner-text');
      this.guideEl = document.getElementById('install-banner-guide');
      this.installBtn = document.getElementById('install-banner-install');
      this.notNowBtn = document.getElementById('install-banner-not-now');
      this.closeBtn = document.getElementById('install-banner-close');

      if (!this.banner) return;

      this.hide();

      if (this.isStandalone()) return;

      if (this.installBtn) {
        this.installBtn.addEventListener('click', this.handleInstallClick.bind(this));
      }
      if (this.notNowBtn) {
        this.notNowBtn.addEventListener('click', this.handleDismiss.bind(this));
      }
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', this.handleDismiss.bind(this));
      }

      window.addEventListener('appinstalled', this.handleAppInstalled.bind(this));
      window.addEventListener('dbc-pwa-prompt-ready', this.onPromptReady.bind(this));
      window.addEventListener('dbc-pwa-sw-ready', this.onSwReady.bind(this));
      window.addEventListener('dbc-pwa-sw-controlling', this.onSwControlling.bind(this));

      if (window.__dbcDeferredPrompt) {
        this.capturePrompt(window.__dbcDeferredPrompt);
      } else if (this.isIOS()) {
        setTimeout(function () {
          if (!PWAInstall.dismissedThisView && !PWAInstall.isStandalone()) {
            PWAInstall.show();
          }
        }, IOS_SHOW_DELAY);
      } else {
        this.bindEngagementRecheck();
        this.waitForLatePrompt();
      }
    },

    applyLabels: function (labels) {
      if (!labels || typeof labels !== 'object') return;
      this.labels = Object.assign({}, this.labels, labels);

      if (this.titleEl && labels.installTitle) {
        this.titleEl.textContent = labels.installTitle;
      }
      if (this.textEl && labels.installText) {
        this.textEl.textContent = labels.installText;
      }
      if (this.installBtn && labels.installApp) {
        this.installBtn.textContent = labels.installApp;
      }
      if (this.notNowBtn && labels.installDismiss) {
        this.notNowBtn.textContent = labels.installDismiss;
      }
      if (this.closeBtn && labels.closeAria) {
        this.closeBtn.setAttribute('aria-label', labels.closeAria);
      }
      if (this.banner && labels.dialogAria) {
        this.banner.setAttribute('aria-label', labels.dialogAria);
      }

      this.updateInstallButtonState();
    },

    onPromptReady: function () {
      this.capturePrompt(window.__dbcDeferredPrompt);
    },

    onSwReady: function () {
      if (window.__dbcDeferredPrompt) {
        this.capturePrompt(window.__dbcDeferredPrompt);
      }
    },

    onSwControlling: function () {
      if (window.__dbcDeferredPrompt) {
        this.capturePrompt(window.__dbcDeferredPrompt);
      }
    },

    capturePrompt: function (event) {
      var prompt = (event && typeof event.prompt === 'function') ? event : window.__dbcDeferredPrompt;
      if (!prompt) return;

      this.deferredPrompt = prompt;
      window.__dbcDeferredPrompt = prompt;
      this.clearLatePromptWait();
      this.updateInstallButtonState();

      if (!this.dismissedThisView && !this.isStandalone()) {
        this.show();
      }
    },

    waitForLatePrompt: function () {
      var elapsed = 0;
      var self = this;

      this.latePromptPoll = window.setInterval(function () {
        elapsed += LATE_PROMPT_INTERVAL;

        if (window.__dbcDeferredPrompt) {
          self.capturePrompt(window.__dbcDeferredPrompt);
          return;
        }

        if (elapsed >= LATE_PROMPT_MS) {
          self.clearLatePromptWait();
        }
      }, LATE_PROMPT_INTERVAL);
    },

    clearLatePromptWait: function () {
      if (this.latePromptPoll) {
        window.clearInterval(this.latePromptPoll);
        this.latePromptPoll = null;
      }
    },

    bindEngagementRecheck: function () {
      if (this.engagementBound) return;
      this.engagementBound = true;

      var self = this;
      var fired = { pointerdown: false, touchstart: false, scroll: false };

      function recheck(source) {
        if (fired[source]) return;
        fired[source] = true;
        if (window.__dbcDeferredPrompt) {
          self.capturePrompt(window.__dbcDeferredPrompt);
        }
      }

      document.addEventListener('pointerdown', function () { recheck('pointerdown'); }, { once: true, passive: true });
      document.addEventListener('touchstart', function () { recheck('touchstart'); }, { once: true, passive: true });
      window.addEventListener('scroll', function () { recheck('scroll'); }, { once: true, passive: true });
    },

    getDeferredPrompt: function () {
      return this.deferredPrompt || window.__dbcDeferredPrompt;
    },

    updateInstallButtonState: function () {
      if (!this.installBtn) return;
      var hasPrompt = Boolean(this.getDeferredPrompt());
      this.installBtn.disabled = false;
      this.installBtn.setAttribute('aria-disabled', hasPrompt ? 'false' : 'false');
    },

    isStandalone: function () {
      return window.matchMedia('(display-mode: standalone)').matches
        || window.matchMedia('(display-mode: fullscreen)').matches
        || window.matchMedia('(display-mode: minimal-ui)').matches
        || window.navigator.standalone === true;
    },

    isIOS: function () {
      var ua = navigator.userAgent || '';
      return /iPhone|iPad|iPod/i.test(ua)
        && !window.MSStream;
    },

    isAndroid: function () {
      return /Android/i.test(navigator.userAgent || '');
    },

    isInAppBrowser: function () {
      var ua = navigator.userAgent || '';
      return /FBAN|FBAV|Instagram|WhatsApp|Line\//i.test(ua)
        || (/Android/i.test(ua) && /\bwv\b/i.test(ua));
    },

    show: function () {
      if (!this.banner || this.dismissedThisView || this.isStandalone()) return;
      this.banner.hidden = false;
      this.banner.setAttribute('aria-hidden', 'false');
    },

    hide: function () {
      if (!this.banner) return;
      this.banner.hidden = true;
      this.banner.setAttribute('aria-hidden', 'true');
      this.hideGuide();
    },

    showGuide: function (message) {
      if (!this.guideEl || !message) return;
      this.guideEl.textContent = message;
      this.guideEl.hidden = false;
    },

    hideGuide: function () {
      if (!this.guideEl) return;
      this.guideEl.hidden = true;
      this.guideEl.textContent = '';
    },

    handleDismiss: function (event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.dismissedThisView = true;
      this.hide();
    },

    handleAppInstalled: function () {
      this.deferredPrompt = null;
      window.__dbcDeferredPrompt = null;
      this.dismissedThisView = true;
      this.hide();
    },

    handleInstallClick: function (event) {
      event.preventDefault();
      this.promptInstall();
    },

    promptInstall: function () {
      if (this.isIOS()) {
        this.promptInstallIOS();
        return;
      }

      if (this.isInAppBrowser()) {
        this.openInChrome();
        return;
      }

      var prompt = this.getDeferredPrompt();

      if (!prompt || typeof prompt.prompt !== 'function') {
        this.handleInstallWithoutPrompt();
        return;
      }

      try {
        prompt.prompt();
      } catch (_error) {
        this.handleInstallWithoutPrompt();
        return;
      }

      var self = this;

      prompt.userChoice
        .then(function (choice) {
          if (!choice || choice.outcome !== 'accepted') {
            self.dismissedThisView = true;
          }
        })
        .finally(function () {
          self.deferredPrompt = null;
          window.__dbcDeferredPrompt = null;
          self.hide();
        });
    },

    promptInstallIOS: function () {
      var shareData = {
        title: this.labels.installTitle || document.title,
        text: this.labels.installText || '',
        url: window.location.href
      };

      if (navigator.share && typeof navigator.share === 'function') {
        navigator.share(shareData).catch(function () {
          PWAInstall.showGuide(PWAInstall.labels.installGuideIOS);
        });
        return;
      }

      this.showGuide(this.labels.installGuideIOS);
    },

    handleInstallWithoutPrompt: function () {
      if (this.isAndroid()) {
        this.showGuide(this.labels.installGuideAndroid);
        return;
      }
      this.showGuide(this.labels.installGuideAndroid || this.labels.installGuideIOS);
    },

    openInChrome: function () {
      var url = window.location.href;
      var intentUrl = 'intent://' + url.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;end';

      window.location.href = intentUrl;

      window.setTimeout(function () {
        PWAInstall.showGuide(PWAInstall.labels.installGuideAndroid);
      }, 800);
    }
  };

  window.PWAInstall = PWAInstall;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      PWAInstall.init();
    });
  } else {
    PWAInstall.init();
  }
})();
