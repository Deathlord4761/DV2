// lazy-embed.js – makes the page scroll smoothly.
// Load this AFTER vega-embed and BEFORE the chart files (see index.html).
//
// What it does, without changing any chart file:
//  1. Lazy drawing: each chart is only drawn when it comes close to the screen, instead of all
//     12 charts being drawn at once when the page opens.
//  2. Canvas for the maps: the maps have thousands of shapes. Drawn as SVG, every shape is a
//     separate element the browser must repaint while scrolling. Canvas draws them as one image,
//     which scrolls much more smoothly. Tooltips and dropdowns still work.
(function () {
  if (typeof window.vegaEmbed !== "function") return;   // vega-embed not loaded: do nothing
  const realEmbed = window.vegaEmbed;

  // Charts drawn on canvas (the heavy maps). Everything else stays SVG.
  const CANVAS_CHARTS = ["#chart-map-1a", "#chart-map-rent", "#chart-dot-map", "#chart-pie-map-aus"];

  window.vegaEmbed = function (target, spec, options) {
    const opts = Object.assign({}, options);
    if (CANVAS_CHARTS.includes(target)) opts.renderer = "canvas";

    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el || !("IntersectionObserver" in window)) return realEmbed(target, spec, opts);

    return new Promise(function (resolve, reject) {
      const observer = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          observer.disconnect();
          realEmbed(el, spec, opts).then(resolve, reject);
        }
      }, { rootMargin: "600px 0px" });   // start drawing ~600px before the chart scrolls into view
      observer.observe(el);
    });
  };
})();
