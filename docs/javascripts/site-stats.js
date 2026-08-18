/* 站点统计与最近更新：从 stats.json 读取自动计算的数据 */
(function () {
  "use strict";

  function fmt(n) {
    return n.toLocaleString();
  }

  function calcDays(startDate) {
    // 用本地时区解析日期（避免 UTC 时差导致天数偏差）
    var parts = startDate.split("-");
    var start = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    ).getTime();
    var now = Date.now();
    return Math.max(0, Math.floor((now - start) / 86400000));
  }

  function fetchData() {
    var statsEl = document.getElementById("site-stats");
    var recentEl = document.getElementById("recent-updates");

    fetch("stats.json", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (statsEl) {
          var wordsEl = statsEl.querySelector('[data-stat="words"]');
          var daysEl = statsEl.querySelector('[data-stat="days"]');
          var articlesEl = statsEl.querySelector('[data-stat="articles"]');
          if (wordsEl) wordsEl.textContent = fmt(data.words || 0);
          if (articlesEl) articlesEl.textContent = fmt(data.articles || 0);
          if (daysEl) daysEl.textContent = fmt(calcDays(data.start_date || "2026-08-16"));
        }
        if (recentEl && data.recent && data.recent.length) {
          recentEl.innerHTML = "";
          var isEn = (document.documentElement.getAttribute("lang") || "zh") === "en";
          var logLink = isEn ? "../log/index.html" : "log/index.html";
          data.recent.forEach(function (item) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.href = logLink;
            a.textContent = item.date + " · " + item.text;
            li.appendChild(a);
            recentEl.appendChild(li);
          });
        }
      })
      .catch(function () {
        // 读取失败时保持占位
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fetchData);
  } else {
    fetchData();
  }
})();
