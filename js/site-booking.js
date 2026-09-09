(function () {
  'use strict';
  if (window.siteBookingReady) return;
  window.siteBookingReady = true;
  var widget = 'https://hub.fixlify.app/book/nicks-appliance-repair-b8c8ce';
  var onBooking = /^\/book(?:\.html)?\/?$/.test(location.pathname);
  var keys = ['gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid', 'ttclid', 'li_fat_id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var source = new URLSearchParams(location.search);
  var target = new URL('/book', location.origin);
  keys.forEach(function (key) { var value = source.get(key); if (value) target.searchParams.set(key, value); });

  if (!document.querySelector('link[href="/css/site-booking.css"]')) {
    var style = document.createElement('link');
    style.rel = 'stylesheet'; style.href = '/css/site-booking.css'; document.head.appendChild(style);
  }
  function isBookingLink(link) {
    var raw = link.getAttribute('href') || '';
    if (/^(?:tel:|mailto:|javascript:)/i.test(raw)) return false;
    var url;
    try { url = new URL(raw, location.href); } catch (_) { return false; }
    if (url.origin === 'https://hub.fixlify.app' && url.pathname === '/book/nicks-appliance-repair-b8c8ce') return !onBooking;
    return url.origin === location.origin && (
      /\/(?:book|booking|book-online|book-appointment|schedule-service)(?:\.html)?\/?$/.test(url.pathname) ||
      /^#(?:book|booking|schedule|book-service)$/.test(url.hash)
    );
  }
  function normalizeLinks(scope) {
    var links = scope.querySelectorAll ? scope.querySelectorAll('a[href]') : [];
    links.forEach(function (link) {
      if (!isBookingLink(link)) return;
      var href = target.pathname + target.search;
      if (link.getAttribute('href') !== href) link.setAttribute('href', href);
      if (link.target === '_blank') link.removeAttribute('target');
    });
    if (scope.querySelectorAll) scope.querySelectorAll('button[onclick]').forEach(function (button) {
      var action = button.getAttribute('onclick');
      if (!/\/schedule-service|\/book-appointment|handleCTA\(['"]book-service['"]\)/.test(action)) return;
      button.removeAttribute('onclick'); button.type = 'button';
      button.addEventListener('click', function () { location.href = target.pathname + target.search; });
    });
  }
  function updatePhone() {
    var bar = document.getElementById('site-booking-mobile');
    if (!bar) return;
    var phone = document.querySelector('header a[href^="tel:"], .site-header a[href^="tel:"], #header-placeholder a[href^="tel:"]') ||
      Array.from(document.querySelectorAll('a[href^="tel:"]')).find(function (a) { return !bar.contains(a) && a.getAttribute('href').replace(/\D/g, '').length >= 10; });
    if (!phone) return;
    var call = bar.querySelector('a[href^="tel:"]');
    if (!call) { call = document.createElement('a'); call.textContent = 'Call'; bar.prepend(call); }
    call.href = phone.getAttribute('href'); call.setAttribute('aria-label', 'Call to arrange appliance repair');
  }
  function replaceInlineWidgets() {
    if (onBooking) return;
    document.querySelectorAll('iframe[src^="' + widget + '"]').forEach(function (frame) {
      var card = document.createElement('div'); card.className = 'site-booking-card';
      var text = document.createElement('p'); text.textContent = 'Diagnostic visit: $89, waived when we carry out the repair.';
      var link = document.createElement('a'); link.className = 'site-booking-button'; link.href = target.pathname + target.search; link.textContent = 'Book repair online';
      card.append(text, link); frame.replaceWith(card);
    });
  }
  function start() {
    replaceInlineWidgets();
    normalizeLinks(document);
    if (onBooking) {
      document.documentElement.classList.add('site-booking-page');
      document.querySelectorAll('iframe[src^="' + widget + '"]').forEach(function (frame) {
        var url = new URL(frame.src);
        keys.forEach(function (key) { var value = source.get(key); if (value) url.searchParams.set(key, value); });
        if (url.href !== frame.src) frame.src = url.href;
      });
    } else {
      var bar = document.createElement('nav');
      bar.id = 'site-booking-mobile'; bar.className = 'site-booking-mobile'; bar.setAttribute('aria-label', 'Quick repair booking');
      var book = document.createElement('a'); book.href = target.pathname + target.search; book.textContent = 'Book repair';
      bar.appendChild(book); document.body.appendChild(bar);
      document.documentElement.classList.add('site-booking-ready'); updatePhone();
    }
    var scheduled = false;
    new MutationObserver(function (mutations) {
      if (!mutations.some(function (m) { return m.addedNodes.length && !document.getElementById('site-booking-mobile')?.contains(m.target); })) return;
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () { scheduled = false; replaceInlineWidgets(); normalizeLinks(document); updatePhone(); });
    }).observe(document.body, {childList: true, subtree: true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
