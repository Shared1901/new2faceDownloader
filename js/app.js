(function () {
  'use strict';
  var RSVP_KEY = 'downloader_rsvp_name';
  var RSVP_TIME_KEY = 'downloader_rsvp_time';
  var MIN_DELAY_MS = 1500;
  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }
  function setSession(name) {
    try {
      sessionStorage.setItem(RSVP_KEY, name);
      sessionStorage.setItem(RSVP_TIME_KEY, String(Date.now()));
    } catch (e) {}
  }
  function getSessionName() {
    try { return sessionStorage.getItem(RSVP_KEY) || ''; } catch (e) { return ''; }
  }
  function getSessionTime() {
    try {
      var t = sessionStorage.getItem(RSVP_TIME_KEY);
      return t ? parseInt(t, 10) : 0;
    } catch (e) { return 0; }
  }
  function initFirstPage() {
    var form = document.getElementById('rsvp-form');
    var input = form && form.querySelector('input[name="name"]');
    var errorEl = document.getElementById('name-error');
    if (!form || !input) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = (input.value || '').trim();
      if (errorEl) errorEl.textContent = '';
      input.classList.remove('card__input--invalid');
      if (value.length < 2) {
        if (errorEl) errorEl.textContent = 'Please enter your full name (at least 2 characters).';
        input.classList.add('card__input--invalid');
        input.focus();
        return;
      }
      setSession(value);
      window.location.href = 'download.html?name=' + encodeURIComponent(value);
    });
  }
  function initDownloadPage() {
    var name = getQueryParam('name') || getSessionName();
    var fromSession = getSessionTime() > 0;
    var guestEl = document.querySelector('.guest-name');
    var manualLink = document.getElementById('download-manual');
    var downloadBtn = document.getElementById('download-btn');
    var redirectNotice = document.getElementById('redirect-notice');
    if (guestEl && name) guestEl.textContent = name;
    if (!name) {
      if (redirectNotice) redirectNotice.style.display = 'block';
      var content = document.getElementById('download-content');
      if (content) content.style.display = 'none';
      if (manualLink) manualLink.href = 'index.html';
      return;
    }
    var downloadUrl = 'invitation.pdf';
    var fileName = 'Your_Invitation.pdf';
    function triggerDownload() {
      var a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    var elapsed = Date.now() - getSessionTime();
    var delayRemaining = Math.max(0, MIN_DELAY_MS - elapsed);
    if (delayRemaining > 0 && fromSession) {
      if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Preparing download…';
      }
      setTimeout(function () {
        triggerDownload();
        if (downloadBtn) {
          downloadBtn.disabled = false;
          downloadBtn.textContent = 'Download invitation';
        }
      }, delayRemaining);
    } else {
      triggerDownload();
    }
    if (manualLink) {
      manualLink.href = downloadUrl;
      manualLink.download = fileName;
      manualLink.rel = 'noopener noreferrer';
    }
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function (e) {
        e.preventDefault();
        triggerDownload();
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  function run() {
    if (document.getElementById('download-card')) initDownloadPage();
    else initFirstPage();
  }
})();
