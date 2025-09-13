// Year in footer
(function () {
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

// Video play: inject YouTube iframe on click/Enter/Space
(function () {
  var frame = document.getElementById("videoFrame");
  var btn = document.getElementById("playBtn");
  if (!frame || !btn) return;

  var url =
    frame.getAttribute("data-video") ||
    "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0";

  function inject() {
    if (!frame) return;
    // prevent double-inject
    if (frame.dataset.played === "1") return;
    frame.dataset.played = "1";

    // Build iframe
    var iframe = document.createElement("iframe");
    iframe.setAttribute("width", "100%");
    iframe.setAttribute("height", "100%");
    iframe.setAttribute("src", url);
    iframe.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    );
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("title", "Introduction video");

    // Clear overlay and insert video
    frame.innerHTML = "";
    frame.appendChild(iframe);
  }

  // Mouse/touch
  btn.addEventListener("click", inject);

  // Keyboard (Enter/Space)
  btn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inject();
    }
  });
})();
