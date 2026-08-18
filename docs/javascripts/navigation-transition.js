(function () {
  "use strict";
  var navigating = false;

  function isSlate() {
    return document.body && document.body.getAttribute("data-md-color-scheme") === "slate";
  }

  function navigate(url) {
    if (navigating) return;
    navigating = true;
    var shield = document.createElement("div");
    shield.className = "page-transition-shield";
    shield.style.backgroundColor = isSlate() ? "#1e2129" : "#f7f7fa";
    document.body.appendChild(shield);
    shield.getBoundingClientRect();
    shield.classList.add("is-visible");
    window.setTimeout(function () { window.location.href = url; }, 130);
  }

  window.navigateWithTransition = navigate;

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target.closest && event.target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
    var raw = link.getAttribute("href");
    if (!raw || raw.charAt(0) === "#" || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
    var target = new URL(link.href, window.location.href);
    if (target.origin !== window.location.origin) return;
    if (target.pathname === window.location.pathname && target.search === window.location.search && target.hash) return;
    event.preventDefault();
    navigate(target.href);
  }, true);
})();
