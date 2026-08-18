/* 语言切换滑块脚本 */
(function () {
  "use strict";

  function getAlternateUrls() {
    var links = {};
    var nodes = document.querySelectorAll('link[rel="alternate"][hreflang]');
    for (var i = 0; i < nodes.length; i++) {
      var lang = nodes[i].getAttribute("hreflang");
      if (lang && lang !== "x-default") {
        links[lang] = nodes[i].href;
      }
    }
    return links;
  }

  function currentLang() {
    return (document.documentElement.getAttribute("lang") || "zh").toLowerCase();
  }

  function buildSlider() {
    var alternates = getAlternateUrls();
    var langs = ["zh", "en"];
    var present = langs.filter(function (l) { return alternates[l]; });
    if (present.length < 2) return;

    var current = currentLang();
    var isEn = current === "en";

    var toggle = document.createElement("button");
    toggle.className = "switch" + (isEn ? " is-on" : "");
    toggle.setAttribute("title", "切换语言 / Switch language");
    toggle.setAttribute("aria-label", "切换语言 / Switch language");
    toggle.innerHTML =
      '<span class="switch-knob"></span>' +
      '<span class="switch-label">中</span>' +
      '<span class="switch-label">EN</span>';

    toggle.addEventListener("click", function () {
      var target = current === "zh" ? "en" : "zh";
      if (alternates[target]) {
        if (window.navigateWithTransition) window.navigateWithTransition(alternates[target]);
        else window.location.href = alternates[target];
      }
    });

    // 放进统一的开关容器
    var wrap = document.createElement("div");
    wrap.className = "switch-wrap";
    wrap.appendChild(toggle);

    var header = document.querySelector(".md-header");
    if (!header) return;
    var inner = header.querySelector(".md-header__inner");
    if (!inner) return;

    // 插在 spacer 之前（导航链接之后），避免右侧过于拥挤
    var spacer = inner.querySelector(".md-header__spacer");
    if (spacer && spacer.parentNode === inner) {
      inner.insertBefore(wrap, spacer);
    } else {
      inner.appendChild(wrap);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildSlider);
  } else {
    buildSlider();
  }
})();
