/* 日/夜主题切换：单一状态源，不再与 Material 隐藏 palette 互相覆盖。 */
(function () {
  "use strict";

  var STORAGE_KEY = "mkdocs-theme";

  function getCurrentScheme() {
    var body = document.body;
    var scheme = body && body.getAttribute("data-md-color-scheme");
    return scheme === "slate" ? "slate" : "default";
  }

  function applyScheme(scheme) {
    scheme = scheme === "slate" ? "slate" : "default";
    var isSlate = scheme === "slate";
    var root = document.documentElement;
    var body = document.body;
    if (!body) return;

    root.classList.add("theme-switching");
    root.setAttribute("data-prepaint-scheme", scheme);
    root.setAttribute("data-site-theme", scheme);
    root.style.colorScheme = isSlate ? "dark" : "only light";
    root.style.backgroundColor = isSlate ? "#1e2129" : "#f7f7fa";
    body.setAttribute("data-md-color-scheme", scheme);
    body.setAttribute("data-site-theme", scheme);
    body.setAttribute("data-md-color-primary", "indigo");
    body.setAttribute("data-md-color-accent", "pink");
    body.style.colorScheme = isSlate ? "dark" : "only light";
    body.style.backgroundColor = isSlate ? "#1e2129" : "#f7f7fa";
    var themeMeta = document.getElementById("site-theme-color");
    if (themeMeta) themeMeta.setAttribute("content", isSlate ? "#1e2129" : "#f7f7fa");

    try {
      localStorage.setItem(STORAGE_KEY, scheme);
    } catch (e) {}

    window.setTimeout(function () { root.classList.remove("theme-switching"); }, 450);
  }

  function buildThemeSlider() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved === "slate" || saved === "default") applyScheme(saved);
    var current = getCurrentScheme();
    var isDark = current === "slate";

    var toggle = document.createElement("button");
    toggle.className = "switch theme-switch" + (isDark ? " is-on" : "");
    toggle.setAttribute("title", "切换日间/夜间模式 · Toggle theme");
    toggle.setAttribute("aria-label", "切换日间/夜间模式 · Toggle theme");
    toggle.innerHTML =
      '<span class="switch-knob"></span>' +
      '<span class="switch-label">☀</span>' +
      '<span class="switch-label">☾</span>';

    toggle.addEventListener("click", function () {
      var next = getCurrentScheme() === "slate" ? "default" : "slate";
      applyScheme(next);
      toggle.classList.toggle("is-on", next === "slate");
    });

    var wrap = document.createElement("div");
    wrap.className = "switch-wrap";
    wrap.appendChild(toggle);

    var header = document.querySelector(".md-header");
    if (!header) return;
    var inner = header.querySelector(".md-header__inner");
    if (!inner) return;

    var spacer = inner.querySelector(".md-header__spacer");
    if (spacer && spacer.parentNode === inner) {
      inner.insertBefore(wrap, spacer);
    } else {
      inner.appendChild(wrap);
    }
  }

  window.applySiteScheme = applyScheme;

  function revealSite() {
    window.requestAnimationFrame(function () {
      document.documentElement.classList.add("site-theme-ready");
    });
  }

  /* 脚本位于页面底部，先同步一次已保存主题，再创建控件。 */
  try {
    var initial = localStorage.getItem(STORAGE_KEY);
    applyScheme(initial === "slate" ? "slate" : "default");
  } catch (e) {
    applyScheme("default");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildThemeSlider);
    document.addEventListener("DOMContentLoaded", revealSite);
  } else {
    buildThemeSlider();
    revealSite();
  }
})();
