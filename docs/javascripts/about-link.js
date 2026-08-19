/* 导航「关于」：动态插入按钮，点击后滚动到首页 #about 区块 */
(function () {
  "use strict";

  function scrollToAbout() {
    var target = document.getElementById("about");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    }
    return false;
  }

  function insertAboutButton(navList, mobile) {
    // 在第 1 个 nav item（主页）之后插入「关于」
    var homeItem = navList.children[0];
    if (!homeItem) return null;

    var aboutItem = document.createElement("li");
    aboutItem.className = mobile ? "md-nav__item" : "md-header__nav-item";

    var link = document.createElement("a");
    link.className = mobile ? "md-nav__link" : "md-header__nav-link";
    var isEn = (document.documentElement.getAttribute("lang") || "zh") === "en";
    link.textContent = isEn ? "About" : "关于";
    var homeLink = homeItem.querySelector(mobile ? ".md-nav__link" : ".md-header__nav-link");
    if (!homeLink) return null;
    var homeHref = homeLink.getAttribute("href") || ".";
    link.href = homeHref + "#about";
    aboutItem.appendChild(link);

    navList.insertBefore(aboutItem, homeItem.nextSibling);
    return link;
  }

  function closeDrawer() {
    var drawer = document.getElementById("__drawer");
    if (drawer) drawer.checked = false;
  }

  function wireAboutLink(aboutLink, navList, mobile) {
    if (!aboutLink) return;
    aboutLink.addEventListener("click", function (e) {
      e.preventDefault();
      closeDrawer();
      if (isOnHome()) {
        scrollToAbout();
      } else {
        var homeItem = navList.children[0].querySelector(mobile ? ".md-nav__link" : ".md-header__nav-link");
        var homeHref = homeItem ? homeItem.getAttribute("href") : ".";
        var destination = homeHref + "#about";
        if (window.navigateWithTransition) window.navigateWithTransition(destination);
        else window.location.href = destination;
      }
    });
  }

  function isOnHome() {
    // 判断当前是否在首页（存在 about 区块）
    return document.getElementById("about") !== null;
  }

  function init() {
    var headerList = document.querySelector(".md-header__nav-list");
    if (headerList) wireAboutLink(insertAboutButton(headerList, false), headerList, false);

    var drawerList = document.querySelector(".md-nav--primary > .md-nav__list");
    if (drawerList) wireAboutLink(insertAboutButton(drawerList, true), drawerList, true);

    // 页面加载时若 URL 带 #about，滚动到对应区块
    if (window.location.hash === "#about") {
      setTimeout(function () {
        if (!scrollToAbout()) {
          var tries = 0;
          var timer = setInterval(function () {
            tries++;
            if (scrollToAbout() || tries > 30) clearInterval(timer);
          }, 200);
        }
      }, 300);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
