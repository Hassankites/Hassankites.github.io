/* 搜索：输入时激活 Material 搜索，点击空白处关闭 */
(function () {
  "use strict";

  function setSearchState(active) {
    var box = document.getElementById("__search");
    var search = document.querySelector(".md-header .md-search");
    // 不启用 Material 的全屏搜索状态；结果面板由下方 data 属性控制。
    // 这样手机端也始终保留右上角的紧凑胶囊搜索框。
    if (box && box.checked) box.checked = false;
    if (search) {
      search.setAttribute("data-search-active", active ? "true" : "false");
    }
  }

  function init() {
    var input = document.querySelector(".md-search__input");
    var search = document.querySelector(".md-header .md-search");

    function syncQueryState() {
      if (!search || !input) return;
      var hasQuery = input.value.trim().length > 0;
      search.setAttribute("data-has-query", hasQuery ? "true" : "false");
      if (!hasQuery) setSearchState(false);
    }

    function syncResultState() {
      if (!search) return;
      var hasResults = !!search.querySelector(".md-search-result__item");
      search.setAttribute("data-has-results", hasResults ? "true" : "false");
    }

    if (input) {
      input.addEventListener("focus", function () {
        syncQueryState();
        if (input.value.trim()) setSearchState(true);
      });
      input.addEventListener("input", function () {
        syncQueryState();
        if (input.value.trim()) setSearchState(true);
      });
      input.addEventListener("blur", function () {
        // 延迟关闭，避免点击结果时先被关闭
        setTimeout(function () {
          setSearchState(false);
        }, 200);
      });
      syncQueryState();
      syncResultState();
    }

    if (search && window.MutationObserver) {
      var resultOutput = search.querySelector(".md-search__output");
      if (resultOutput) {
        new MutationObserver(syncResultState).observe(resultOutput, {
          childList: true,
          subtree: true
        });
      }
    }

    // 点击搜索框外部关闭
    document.addEventListener("click", function (e) {
      if (!search) return;
      if (!search.contains(e.target)) {
        setSearchState(false);
      }
    });

    // Esc 键关闭
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        setSearchState(false);
        if (input) input.blur();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
