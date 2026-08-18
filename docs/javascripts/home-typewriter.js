(function () {
  "use strict";

  function init() {
    var target = document.getElementById("home-typewriter");
    if (!target || target.dataset.running === "true") return;
    target.dataset.running = "true";

    var phrases;
    try { phrases = JSON.parse(target.dataset.phrases || "[]"); } catch (_) { phrases = []; }
    if (!phrases.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      target.textContent = phrases[0];
      return;
    }

    var phraseIndex = 0;
    var characterIndex = 0;
    var deleting = false;

    function tick() {
      var phrase = phrases[phraseIndex];
      characterIndex += deleting ? -1 : 1;
      target.textContent = phrase.slice(0, characterIndex);

      var delay = deleting ? 38 : 72;
      if (!deleting && characterIndex === phrase.length) {
        deleting = true;
        delay = 1500;
      } else if (deleting && characterIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 420;
      }
      window.setTimeout(tick, delay);
    }

    tick();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
