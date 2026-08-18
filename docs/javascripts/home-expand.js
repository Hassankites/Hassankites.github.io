(function () {
  "use strict";

  var seenKey = "hassankite-home-cover-seen";

  function hasSeenCover() {
    try { return sessionStorage.getItem(seenKey) === "1"; } catch (_) { return false; }
  }

  function markCoverSeen() {
    try { sessionStorage.setItem(seenKey, "1"); } catch (_) {}
  }

  function init() {
    var banner = document.getElementById("home-cover");
    var profile = document.querySelector(".home-profile-card");
    var layout = document.querySelector(".home-layout");
    if (!banner || !profile || !layout) {
      markCoverSeen();
      return;
    }
    if (banner.dataset.expandReady === "true") return;

    banner.dataset.expandReady = "true";
    var forceCover = new URLSearchParams(window.location.search).get("cover") === "1";
    if (!forceCover && hasSeenCover()) {
      banner.setAttribute("aria-expanded", "true");
      document.body.classList.add("home-cover-skipped");
      return;
    }

    markCoverSeen();
    document.body.classList.add("home-cover-booting", "home-cover-active");
    window.scrollTo(0, 0);
    banner.getBoundingClientRect();
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        document.body.classList.remove("home-cover-booting");
      });
    });

    function expand() {
      if (document.body.classList.contains("home-cover-booting")) return;
      if (!document.body.classList.contains("home-cover-active")) return;
      var first = profile.getBoundingClientRect();
      var bannerFirst = banner.getBoundingClientRect();
      banner.setAttribute("aria-expanded", "true");
      if (forceCover && window.history && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname + window.location.hash);
      }
      document.body.classList.add("home-cover-measuring");
      document.body.classList.remove("home-cover-active");
      document.body.classList.add("home-cover-revealing");

      var last = profile.getBoundingClientRect();
      var bannerLast = banner.getBoundingClientRect();
      document.body.classList.remove("home-cover-measuring");
      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduceMotion && profile.animate) {
        var dx = first.left - last.left;
        var dy = first.top - last.top;
        var sx = first.width / Math.max(last.width, 1);
        var sy = first.height / Math.max(last.height, 1);
        profile.animate([
          { transform: "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")", transformOrigin: "top left" },
          { transform: "none", transformOrigin: "top left" }
        ], { duration: 860, easing: "cubic-bezier(.22,.75,.18,1)", fill: "both" });

        var bannerDx = bannerFirst.left - bannerLast.left;
        var bannerDy = bannerFirst.top - bannerLast.top;
        var bannerSx = bannerFirst.width / Math.max(bannerLast.width, 1);
        var bannerSy = bannerFirst.height / Math.max(bannerLast.height, 1);
        banner.animate([
          { transform: "translate(" + bannerDx + "px," + bannerDy + "px) scale(" + bannerSx + "," + bannerSy + ")", transformOrigin: "top left", borderRadius: "0" },
          { transform: "none", transformOrigin: "top left", borderRadius: "0.8rem" }
        ], { duration: 960, easing: "cubic-bezier(.22,.75,.18,1)", fill: "both" });
      }

      window.setTimeout(function () {
        document.body.classList.remove("home-cover-revealing");
        layout.removeAttribute("aria-hidden");
      }, reduceMotion ? 0 : 1000);
    }

    banner.addEventListener("click", expand);
    banner.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        expand();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
