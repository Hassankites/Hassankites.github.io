(function () {
  "use strict";

  var previousScheme = null;
  var restoring = false;

  function restoreTheme() {
    if (restoring) return;
    restoring = true;
    document.documentElement.classList.remove("cv-printing");
    if (previousScheme && window.applySiteScheme) {
      window.applySiteScheme(previousScheme);
    }
    previousScheme = null;
    window.setTimeout(function () { restoring = false; }, 0);
  }

  window.printResume = function () {
    previousScheme = document.body.getAttribute("data-md-color-scheme") || "default";
    document.documentElement.classList.add("cv-printing");
    document.documentElement.setAttribute("data-prepaint-scheme", "default");
    document.body.setAttribute("data-md-color-scheme", "default");
    window.setTimeout(function () { window.print(); }, 120);
  };

  window.addEventListener("afterprint", restoreTheme);
  window.addEventListener("focus", function () {
    if (document.documentElement.classList.contains("cv-printing")) {
      window.setTimeout(restoreTheme, 250);
    }
  });
})();
