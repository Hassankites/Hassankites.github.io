/* 日/夜主题切换滑块脚本（复用 Material 内置 palette 机制，避免闪动） */
(function () {
  "use strict";

  function getCurrentScheme() {
    var body = document.body;
    var scheme = body && body.getAttribute("data-md-color-scheme");
    return scheme === "slate" ? "slate" : "default";
  }

  function applyScheme(scheme) {
    // 先同步根节点与正文，再触发 Material 机制，避免顶部栏先变而正文滞后。
    var isSlate = scheme === "slate";
    var root = document.documentElement;
    root.classList.add("theme-switching");
    root.setAttribute("data-prepaint-scheme", scheme);
    root.style.backgroundColor = isSlate ? "#1e2129" : "#f7f7fa";
    document.body.setAttribute("data-md-color-scheme", scheme);
    document.body.setAttribute("data-md-color-primary", "indigo");
    document.body.setAttribute("data-md-color-accent", "pink");
    var targetId = isSlate ? "__palette_1" : "__palette_0";
    var radio = document.getElementById(targetId);
    if (radio) {
      radio.checked = true;
    }
    try {
      localStorage.setItem("mkdocs-theme", scheme);
      // 同步 Material 自身的配色存储，避免移动端刷新后两个状态互相覆盖。
      if (typeof window.__md_set === "function") {
        window.__md_set("__palette", {
          color: {
            scheme: scheme,
            primary: "indigo",
            accent: "pink"
          }
        });
      }
    } catch (e) {}
    // 某些移动浏览器会在当前任务末尾重新应用 Material 的旧状态，
    // 下一帧再次校准正文属性，保证开关与页面配色始终一致。
    window.requestAnimationFrame(function () {
      document.body.setAttribute("data-md-color-scheme", scheme);
      document.body.setAttribute("data-md-color-primary", "indigo");
      document.body.setAttribute("data-md-color-accent", "pink");
    });
    window.setTimeout(function () { root.classList.remove("theme-switching"); }, 450);
  }

  function buildThemeSlider() {
    var saved = null;
    try { saved = localStorage.getItem("mkdocs-theme"); } catch (e) {}
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildThemeSlider);
  } else {
    buildThemeSlider();
  }
})();
