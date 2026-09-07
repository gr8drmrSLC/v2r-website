(function () {
  var trigger = document.getElementById('v2adv-entry-trigger');
  var toggleBtn = document.getElementById('v2adv-entry-btn');
  var panel = document.getElementById('v2adv-entry-panel');
  var navLinks = document.querySelectorAll('[data-v2adv-entry-trigger]');

  if (!trigger || !toggleBtn || !panel) return;

  function openPanel() {
    panel.classList.add('open');
    trigger.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closePanel() {
    panel.classList.remove('open');
    trigger.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  function togglePanel() {
    if (panel.classList.contains('open')) {
      closePanel();
    } else {
      openPanel();
    }
  }

  toggleBtn.addEventListener('click', togglePanel);

  document.addEventListener('click', function (event) {
    if (!panel.classList.contains('open')) return;
    if (panel.contains(event.target) || trigger.contains(event.target)) return;
    // A click that just opened the panel via a data-v2adv-entry-trigger
    // link elsewhere on the page (nav, a section CTA) still bubbles up
    // to this same handler in the same event -- without this check it
    // reads as "click outside" and closes the panel it just opened.
    if (event.target.closest && event.target.closest('[data-v2adv-entry-trigger]')) return;
    closePanel();
  });

  Array.prototype.forEach.call(navLinks, function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      openPanel();
    });
  });
})();
