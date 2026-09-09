/* Send callback requests through the existing public Fixlify booking receiver. */
(function () {
  'use strict';
  var endpoint = 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/booking-widget-submit';
  var slug = 'nicks-appliance-repair-b8c8ce';

  document.querySelectorAll('form.lz-quick-form').forEach(function (form) {
    var button = form.querySelector('button[type="submit"]');
    var status = form.querySelector('[data-callback-status]');
    if (!button || !status) return;
    var pending = false;
    var completed = false;
    var previousPayload = '';
    var requestKey = '';
    button.disabled = false;

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (pending || completed || !form.reportValidity()) return;
      var fields = new FormData(form);
      function value(name) { return String(fields.get(name) || '').trim(); }
      if (!value('name') || !value('address')) {
        status.textContent = 'Please enter your name and service address.';
        return;
      }
      if (!/^\+?[\d\s\-().]{7,20}$/.test(value('phone')) || value('phone').replace(/\D/g, '').length < 7) {
        status.textContent = 'Please enter a valid phone number.';
        return;
      }
      var payload = {
        slug: slug,
        first_name: value('name'),
        phone: value('phone'),
        address: value('address'),
        city: value('city'),
        notes: 'Callback requested. ' + value('issue'),
        honeypot: value('website'),
        submitted_from: 'embed',
        landing_url: location.origin + location.pathname
      };
      var serialized = JSON.stringify(payload);
      // Keep the same key after an uncertain response so a retry cannot duplicate the lead.
      if (serialized !== previousPayload) {
        requestKey = crypto.randomUUID();
        previousPayload = serialized;
      }
      payload.idempotency_key = requestKey;
      pending = true;
      button.disabled = true;
      button.textContent = 'Sending…';
      status.textContent = 'Sending your request…';
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, 25000);
      try {
        var response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        var result = await response.json();
        if (!response.ok || result.success !== true || !result.submission_id) {
          throw new Error(response.status === 429 ? 'rate_limit' : 'not_confirmed');
        }
        completed = true;
        status.textContent = 'Your callback request has been received. We will contact you shortly.';
        button.textContent = 'Request received';
        form.querySelectorAll('input, textarea').forEach(function (field) { field.disabled = true; });
      } catch (error) {
        status.textContent = error.message === 'rate_limit'
          ? 'Too many requests. Please try again later or use the phone number on this page.'
          : 'We could not confirm your request. Your details are still here. Please retry or use the phone number on this page.';
        button.textContent = 'Retry callback request';
      } finally {
        clearTimeout(timeout);
        pending = false;
        button.disabled = completed;
      }
    });
  });
}());
