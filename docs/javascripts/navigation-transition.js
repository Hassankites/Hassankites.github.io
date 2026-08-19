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
    shield.classList.add("is-visible");
    /* 先让遮罩完整绘制一帧，再开始跨文档导航。 */
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { window.location.href = url; });
    });
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

  /* 从浏览器的前进/后退缓存恢复时，清掉旧页面留下的遮罩。 */
  window.addEventListener("pageshow", function () {
    navigating = false;
    document.querySelectorAll(".page-transition-shield").forEach(function (shield) {
      shield.remove();
    });
  });
})();
