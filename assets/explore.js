(function () {
  var range = document.getElementById('clarityRange');
  var clarityResult = document.getElementById('clarityResult');
  var checks = document.getElementById('capabilityChecks');
  var capabilityResult = document.getElementById('capabilityResult');
  var progressNote = document.getElementById('progressNote');
  var progressNoteDone = document.getElementById('progressNoteDone');
  var synthesisText = document.getElementById('synthesisText');

  var clarityText = [
    { max: 10, text: 'There is no objective yet. Discovery starts by finding it.' },
    { max: 20, text: 'An idea exists, but it has not taken shape as an objective yet.' },
    { max: 30, text: 'A direction is forming, though it is still more instinct than plan.' },
    { max: 40, text: 'A real direction exists, but its shape is still loose.' },
    { max: 50, text: 'A real objective exists, though the path to it is still open.' },
    { max: 60, text: 'The objective is taking firmer shape; some real decisions remain.' },
    { max: 70, text: 'The objective is clear; what is open now is how to execute it well.' },
    { max: 80, text: 'The objective and rough approach are both clear; the details need settling.' },
    { max: 90, text: 'The plan is largely scoped; a few open questions remain before execution.' },
    { max: 100, text: 'The plan is scoped and ready. V2ADV can move directly toward execution.' }
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
    var selectedKeys = selectedCapabilityKeys();
    var hasOther = selectedKeys.indexOf('other') !== -1;
    var selected = selectedKeys
      .filter(function (key) { return key !== 'other'; })
      .map(function (key) { return capabilityLabels[key]; });

    if (!selected.length && !hasOther) {
      capabilityResult.textContent = 'Select what applies to see which capabilities likely matter.';
    } else if (!selected.length && hasOther) {
      capabilityResult.textContent = 'Whatever the real driver is, that’s what the note below is for. Discovery narrows the actual capabilities from there.';
    } else {
      var joined = selected.length === 1
        ? selected[0]
        : selected.slice(0, -1).join(', ') + ', and ' + selected[selected.length - 1];
      var tail = hasOther ? ', alongside whatever else gets captured in the note below,' : '';
      capabilityResult.textContent = 'This points toward ' + joined + tail + ' as a likely part of the engagement. Discovery confirms the actual scope.';
    }
    updateSynthesis();
  }

  // Framing varies by how clear the objective already is, so the
  // capability sentence reads as responding to the slider above it,
  // not just restating a fixed template next to it.
  var capabilityFraming = {
    low: {
      one: 'Before anything else, {A} is usually where an engagement at this stage starts.',
      many: 'Before anything else, engagements at this stage usually start with {LIST}, in roughly that order.'
    },
    mid: {
      one: '{A} is usually engaged early, alongside shaping the plan itself.',
      many: '{LIST} are usually engaged early, in roughly that order, alongside shaping the plan itself.'
    },
    high: {
      one: 'With the plan already scoped, {A} is usually where execution actually starts.',
      many: 'With the plan already scoped, execution usually starts with {LIST}.'
    }
  };

  function capabilityTier() {
    var value = range ? Number(range.value) : 50;
    if (value <= 35) return 'low';
    if (value <= 65) return 'mid';
    return 'high';
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // No live AI call reads this note -- it never understands what was
  // typed. What it can honestly measure is the note's *form*: does it
  // name a number, a deadline, and say enough to be more than a
  // one-word placeholder. That correlates with real specificity
  // without ever claiming to grasp meaning, and it can't be gamed into
  // rewarding nonsense, since gibberish fails these checks too.
  var timeReferenceWords = [
    'week', 'weeks', 'month', 'months', 'quarter', 'quarters', 'year', 'years',
    'q1', 'q2', 'q3', 'q4', 'by', 'within',
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  function noteLooksSpecific(text) {
    var lower = text.toLowerCase();
    var hasNumber = /\d/.test(text);
    var hasTimeReference = timeReferenceWords.some(function (word) {
      return new RegExp('\\b' + word + '\\b').test(lower);
    });
    var wordCount = text.split(/\s+/).filter(Boolean).length;
    var signals = (hasNumber ? 1 : 0) + (hasTimeReference ? 1 : 0) + (wordCount >= 6 ? 1 : 0);
    return signals >= 2;
  }

  function updateSynthesis() {
    if (!synthesisText) return;

    var parts = [currentClarityMatch().text];

    var selectedKeys = selectedCapabilityKeys();
    var ordered = capabilityPriority.filter(function (key) { return selectedKeys.indexOf(key) !== -1; });
    var framing = capabilityFraming[capabilityTier()];
    if (ordered.length === 1) {
      var label = capabilityLabels[ordered[0]];
      parts.push(capitalize(framing.one.replace('{A}', label)));
    } else if (ordered.length > 1) {
      var labels = ordered.map(function (key) { return capabilityLabels[key]; });
      var joined = labels.slice(0, -1).join(', ') + ', then ' + labels[labels.length - 1];
      parts.push(framing.many.replace('{LIST}', joined) + ' Discovery sets the real sequence.');
    }

    var note = progressNote ? progressNote.value.trim() : '';
    if (note) {
      var noteSentence = ordered.length
        ? 'The capabilities above earn their place only by reaching the outcome described above. That’s the standard Discovery holds the plan to.'
        : 'Whatever the right capabilities turn out to be, they’ll be measured against the outcome described above.';
      if (noteLooksSpecific(note)) {
        noteSentence += ' A number and a deadline like that is exactly what Discovery can build a real plan against.';
      }
      parts.push(noteSentence);
    }

    synthesisText.textContent = parts.join(' ');
  }

  if (range) {
    range.addEventListener('input', updateClarity);
  }
  if (checks) {
    checks.addEventListener('change', updateCapabilities);
  }
  var synthesisBox = document.querySelector('.explore-synthesis');

  if (progressNote) {
    try {
      var saved = localStorage.getItem('v2adv_progress_note');
      if (saved) progressNote.value = saved;
    } catch (e) {}
    progressNote.addEventListener('input', function () {
      try { localStorage.setItem('v2adv_progress_note', progressNote.value); } catch (e) {}
      updateSynthesis();
      if (progressNoteDone && progressNoteDone.classList.contains('is-saved')) {
        progressNoteDone.textContent = 'Done';
        progressNoteDone.classList.remove('is-saved');
      }
    });
  }
  if (progressNoteDone) {
    progressNoteDone.addEventListener('click', function () {
      progressNote.blur();
      updateSynthesis();
      progressNoteDone.textContent = 'Saved';
      progressNoteDone.classList.add('is-saved');
      if (synthesisBox) {
        synthesisBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        synthesisBox.classList.remove('explore-synthesis-pulse');
        // Force reflow so the animation restarts if it's already mid-pulse.
        void synthesisBox.offsetWidth;
        synthesisBox.classList.add('explore-synthesis-pulse');
      }
    });
  }

  updateClarity();
  updateCapabilities();
  updateSynthesis();
})();
