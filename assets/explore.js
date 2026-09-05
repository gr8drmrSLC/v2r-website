(function () {
  var range = document.getElementById('clarityRange');
  var clarityResult = document.getElementById('clarityResult');
  var checks = document.getElementById('capabilityChecks');
  var capabilityResult = document.getElementById('capabilityResult');
  var progressNote = document.getElementById('progressNote');

  var clarityText = [
    { max: 20, text: 'Discovery starts by finding the objective itself.' },
    { max: 40, text: 'A direction exists, but its shape is still forming.' },
    { max: 60, text: 'A real objective exists, though the path to it is still open.' },
    { max: 80, text: 'The objective is clear; the open question is how to execute it well.' },
    { max: 100, text: 'The plan is largely scoped. V2ADV can move directly toward execution.' }
  ];

  var capabilityLabels = {
    marketing: 'reaching the right audience',
    software: 'a software or systems build',
    automation: 'automation',
    analytics: 'analytics and measurement',
    operational: 'operational improvement',
    robotics: 'robotics or automation-hardware sourcing'
  };

  function updateClarity() {
    if (!range || !clarityResult) return;
    var value = Number(range.value);
    var match = clarityText[clarityText.length - 1];
    for (var i = 0; i < clarityText.length; i++) {
      if (value <= clarityText[i].max) { match = clarityText[i]; break; }
    }
    clarityResult.textContent = match.text;
  }

  function updateCapabilities() {
    if (!checks || !capabilityResult) return;
    var selected = Array.prototype.slice.call(checks.querySelectorAll('input:checked')).map(function (el) {
      return capabilityLabels[el.value];
    });
    if (!selected.length) {
      capabilityResult.textContent = 'Select what applies to see which capabilities likely matter.';
      return;
    }
    var joined = selected.length === 1
      ? selected[0]
      : selected.slice(0, -1).join(', ') + ', and ' + selected[selected.length - 1];
    capabilityResult.textContent = 'This points toward ' + joined + ' as a likely part of the engagement. Discovery confirms the actual scope.';
  }

  if (range) {
    range.addEventListener('input', updateClarity);
    updateClarity();
  }
  if (checks) {
    checks.addEventListener('change', updateCapabilities);
    updateCapabilities();
  }
  if (progressNote) {
    try {
      var saved = localStorage.getItem('v2adv_progress_note');
      if (saved) progressNote.value = saved;
    } catch (e) {}
    progressNote.addEventListener('input', function () {
      try { localStorage.setItem('v2adv_progress_note', progressNote.value); } catch (e) {}
    });
  }
})();
