/* Responsive custom cursor: direct pointer tracking without delayed easing. */
(function () {
  "use strict";

  if (!window.matchMedia("(pointer: fine)").matches) return;

  var cursor = document.createElement("span");
  cursor.className = "site-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);

  var x = -100;
  var y = -100;
  var frame = 0;

  function paint() {
    frame = 0;
    cursor.style.transform = "translate3d(" + x + "px," + y + "px,0) translate(-50%,-50%)";
  }

  function track(event) {
    x = event.clientX;
    y = event.clientY;
    cursor.classList.add("site-cursor--visible");
    if (!frame) frame = requestAnimationFrame(paint);
  }

  window.addEventListener("pointermove", track, { passive: true });
  if ("onpointerrawupdate" in window) {
    window.addEventListener("pointerrawupdate", track, { passive: true });
  }
  window.addEventListener("blur", function () { cursor.classList.remove("site-cursor--visible"); });
  document.addEventListener("mouseleave", function () { cursor.classList.remove("site-cursor--visible"); });
  document.addEventListener("mouseover", function (event) {
    cursor.classList.toggle("site-cursor--interactive", !!event.target.closest("a, button, input, label, [role='button']"));
  });
})();
