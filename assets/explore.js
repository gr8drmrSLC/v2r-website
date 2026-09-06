(function () {
  var range = document.getElementById('clarityRange');
  var clarityResult = document.getElementById('clarityResult');
  var checks = document.getElementById('capabilityChecks');
  var capabilityResult = document.getElementById('capabilityResult');
  var progressNote = document.getElementById('progressNote');
  var synthesisText = document.getElementById('synthesisText');

  var clarityText = [
    { max: 20, text: 'Discovery starts by finding the objective itself.' },
    { max: 40, text: 'A direction exists, but its shape is still forming.' },
    { max: 60, text: 'A real objective exists, though the path to it is still open.' },
    { max: 80, text: 'The objective is clear; the open question is how to execute it well.' },
    { max: 100, text: 'The plan is largely scoped. V2ADV can move directly toward execution.' }
  ];

  var capabilityLabels = {
    marketing: 'reaching the right audience',
    research: 'research and real market information',
    automation: 'automation',
    analytics: 'analytics and measurement',
    operational: 'operational improvement'
  };

  // Not a strict rule -- a general starting order (know who you're
  // reaching and what's actually true before automating or optimizing a
  // process) used only to give the synthesis a sequence, not just a list.
  var capabilityPriority = ['marketing', 'research', 'analytics', 'operational', 'automation'];

  function currentClarityMatch() {
    var value = range ? Number(range.value) : 50;
    var match = clarityText[clarityText.length - 1];
    for (var i = 0; i < clarityText.length; i++) {
      if (value <= clarityText[i].max) { match = clarityText[i]; break; }
    }
    return match;
  }

  function updateClarity() {
    if (!range || !clarityResult) return;
    clarityResult.textContent = currentClarityMatch().text;
    updateSynthesis();
  }

  function selectedCapabilityKeys() {
    if (!checks) return [];
    return Array.prototype.slice.call(checks.querySelectorAll('input:checked')).map(function (el) {
      return el.value;
    });
  }

  function updateCapabilities() {
    if (!checks || !capabilityResult) return;
    var selected = selectedCapabilityKeys().map(function (key) { return capabilityLabels[key]; });
    if (!selected.length) {
      capabilityResult.textContent = 'Select what applies to see which capabilities likely matter.';
    } else {
      var joined = selected.length === 1
        ? selected[0]
        : selected.slice(0, -1).join(', ') + ', and ' + selected[selected.length - 1];
      capabilityResult.textContent = 'This points toward ' + joined + ' as a likely part of the engagement. Discovery confirms the actual scope.';
    }
    updateSynthesis();
  }

  function updateSynthesis() {
    if (!synthesisText) return;

    var parts = [currentClarityMatch().text];

    var selectedKeys = selectedCapabilityKeys();
    var ordered = capabilityPriority.filter(function (key) { return selectedKeys.indexOf(key) !== -1; });
    if (ordered.length === 1) {
      parts.push(capabilityLabels[ordered[0]].charAt(0).toUpperCase() + capabilityLabels[ordered[0]].slice(1) + ' is usually the first capability engaged.');
    } else if (ordered.length > 1) {
      var labels = ordered.map(function (key) { return capabilityLabels[key]; });
      var joined = labels.slice(0, -1).join(', ') + ', then ' + labels[labels.length - 1];
      parts.push('Engagements with this mix usually take up ' + joined + ' in roughly that order, though Discovery sets the real sequence.');
    }

    var note = progressNote ? progressNote.value.trim() : '';
    if (note) {
      parts.push('In your own words, six months from now looks like: “' + note + '” — that’s the target the plan above would organize around, not a separate goal to reconcile later.');
    }

    synthesisText.textContent = parts.join(' ');
  }

  if (range) {
    range.addEventListener('input', updateClarity);
  }
  if (checks) {
    checks.addEventListener('change', updateCapabilities);
  }
  if (progressNote) {
    try {
      var saved = localStorage.getItem('v2adv_progress_note');
      if (saved) progressNote.value = saved;
    } catch (e) {}
    progressNote.addEventListener('input', function () {
      try { localStorage.setItem('v2adv_progress_note', progressNote.value); } catch (e) {}
      updateSynthesis();
    });
  }

  updateClarity();
  updateCapabilities();
  updateSynthesis();
})();
