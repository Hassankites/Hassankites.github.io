/* Homepage latest article preview generated from article front matter. */
(function () {
  "use strict";
  function init() {
    var host = document.getElementById("home-latest-article");
    if (!host) return;
    var locale = (document.documentElement.lang || "zh") === "en" ? "en" : "zh";
    var dataUrl = locale === "en" ? "../article-catalog.json" : "article-catalog.json";
    fetch(dataUrl, { cache: "no-store" }).then(function (response) { return response.json(); }).then(function (catalog) {
      var article = catalog[locale];
      if (!article) return;
      var cover = article.cover || "../assets/images/avatar.jpg";
      if (locale === "zh") cover = cover.replace(/^\.\.\//, "");
      var tags = (article.tags || []).map(function (tag) { return '<span class="home-latest__tag">' + tag + '</span>'; }).join("");
      var read = locale === "en" ? "Read article" : "阅读全文";
      host.innerHTML = '<a class="home-latest__card" href="blogger/' + article.url + '">' +
        '<div class="home-latest__cover"><img src="' + cover + '" alt="' + article.title + '"></div>' +
        '<div class="home-latest__body"><time>' + article.date.replace(/-/g, ".") + '</time><h3>' + article.title + '</h3><p>' +
        (article.subtitle || "") + '</p><div class="home-latest__tags">' + tags + '</div><span class="home-latest__read">' + read + ' →</span></div></a>';
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
