/* Show the manuscript's recorded visits; page tracking is handled by count.js. */
(function () {
  'use strict';

  var target = document.getElementById('paper-visit-count');
  if (!target) return;

  var path = '/sodium-struggle/sodium-struggle.html';
  var endpoint = 'https://canadiankaty.goatcounter.com/counter/' +
    encodeURIComponent(path) + '.json';

  function unavailable() {
    target.textContent = 'unavailable';
    target.setAttribute('aria-label', 'The paper visit count is currently unavailable');
  }

  function readCount(retried) {
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 8000);
    return fetch(endpoint, { credentials: 'omit', signal: controller.signal })
      .then(function (response) {
        if (response.status === 404 && !retried) {
          // A newly tracked page may not have been processed yet.
          clearTimeout(timeout);
          return new Promise(function (resolve) {
            setTimeout(function () { resolve(readCount(true)); }, 12000);
          });
        }
        if (!response.ok) throw new Error('Public visit count unavailable');
        return response.json().then(function (data) {
          var count = String(data.count == null ? '' : data.count).trim();
          if (!/^\d[\d,\s]*$/.test(count)) throw new Error('Invalid visit count');
          target.textContent = count;
          target.setAttribute('aria-label', count + ' recorded paper visits');
        });
      })
      .catch(unavailable)
      .finally(function () { clearTimeout(timeout); });
  }

  readCount(false);
}());
