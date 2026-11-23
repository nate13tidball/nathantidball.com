/* Keep the source host in sync with index.html's CSP. See docs/artwork-viewing.md. */
(() => {
  "use strict";
  const tileSource = "https://openseadragon.github.io/example-images/duomo/duomo.dzi";
  const byId = (id) => document.getElementById(id);
  const status = byId("viewer-status");
  const retry = byId("retry");
  const stage = byId("viewer-stage");
  const controls = ["zoom-in", "zoom-out", "fit", "actual-size", "fullscreen"];
  let viewer;
  let timer;
  let generation = 0;

  function message(text, canRetry = false) {
    status.textContent = text;
    retry.hidden = !canRetry;
  }

  function start() {
    const current = ++generation;
    clearTimeout(timer);
    if (viewer) viewer.destroy();
    viewer = null;
    controls.forEach((id) => { byId(id).disabled = true; });
    byId("tile-count").textContent = "0";
    byId("first-draw").textContent = "—";
    byId("zoom-readout").textContent = "—";
    message("Loading the image…");
    if (typeof OpenSeadragon !== "function") {
      message("The viewer could not load. Reload this page to try again.");
      return;
    }

    const began = performance.now();
    let loaded = 0;
    let drawn = false;
    let failed = false;
    try {
      viewer = OpenSeadragon({
        id: "viewer",
        showNavigationControl: false,
        showNavigator: true,
        navigatorPosition: "BOTTOM_RIGHT",
        navigatorWidth: 130,
        navigatorHeight: 90,
        tabIndex: -1,
        drawer: "canvas",
        imageLoaderLimit: 6,
        maxImageCacheCount: 160,
        timeout: 15000,
        animationTime: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.5,
        blendTime: 0.1,
        maxZoomPixelRatio: 2,
        visibilityRatio: 1,
        constrainDuringPan: true,
        crossOriginPolicy: "Anonymous",
        gestureSettingsMouse: { clickToZoom: false, dblClickToZoom: true },
      });
    } catch {
      message("This browser could not start the image viewer. Try reloading or another browser.", true);
      return;
    }
    const active = (handler) => (event) => { if (generation === current) handler(event); };
    timer = setTimeout(active(() => {
      message("The image is taking longer than expected. Check your connection or retry.", true);
    }), 20000);
    viewer.addHandler("open", active(() => {
      const size = viewer.world.getItemAt(0).getContentSize();
      byId("resolution").textContent = `${size.x.toLocaleString()} × ${size.y.toLocaleString()} px`;
      controls.forEach((id) => { byId(id).disabled = false; });
      byId("fullscreen").disabled = !document.fullscreenEnabled;
      updateZoom();
    }));
    viewer.addHandler("open-failed", active(() => {
      clearTimeout(timer);
      message("The sample image could not be opened. Check your connection and retry.", true);
    }));
    viewer.addHandler("tile-load-failed", active(() => {
      failed = true;
      clearTimeout(timer);
      message("Some image detail could not load. You can keep exploring or retry the image.", true);
    }));
    viewer.addHandler("tile-loaded", active(() => {
      byId("tile-count").textContent = (++loaded).toLocaleString();
    }));
    viewer.addHandler("tile-drawn", active(() => {
      if (drawn) return;
      drawn = true;
      clearTimeout(timer);
      byId("first-draw").textContent = `${((performance.now() - began) / 1000).toFixed(2)} s`;
      if (!failed) message("Ready to explore. Zoom in to reveal more detail.");
    }));
    viewer.addHandler("animation", active(updateZoom));
    viewer.addHandler("resize", active(updateZoom));
    viewer.open(tileSource);
  }

  function updateZoom() {
    if (!viewer?.world.getItemCount()) return;
    const ratio = viewer.viewport.getZoom(true) / viewer.viewport.getHomeZoom();
    byId("zoom-readout").textContent = `${ratio.toFixed(1)}× from fit`;
  }
  function zoom(factor) {
    if (!viewer?.world.getItemCount()) return;
    viewer.viewport.zoomBy(factor);
    viewer.viewport.applyConstraints();
  }
  byId("zoom-in").addEventListener("click", () => zoom(1.5));
  byId("zoom-out").addEventListener("click", () => zoom(1 / 1.5));
  byId("fit").addEventListener("click", () => viewer?.viewport.goHome());
  byId("actual-size").addEventListener("click", () => {
    const item = viewer?.world.getItemAt(0);
    if (!item) return;
    viewer.viewport.zoomTo(item.imageToViewportZoom(1));
    viewer.viewport.applyConstraints();
  });
  byId("fullscreen").addEventListener("click", async () => {
    try {
      if (document.fullscreenElement === stage) await document.exitFullscreen();
      else await stage.requestFullscreen();
    } catch {
      message("Fullscreen is unavailable. You can keep exploring in this window.");
    }
  });
  document.addEventListener("fullscreenchange", () => {
    byId("fullscreen").textContent = document.fullscreenElement === stage ? "Exit fullscreen" : "Fullscreen";
  });
  byId("viewer").addEventListener("keydown", (event) => {
    if (!viewer?.world.getItemCount() || event.ctrlKey || event.metaKey || event.altKey) return;
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (!["+", "=", "-", "Home", ...Object.keys(directions)].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === "Home") viewer.viewport.goHome();
    else if (event.key === "+" || event.key === "=") zoom(1.5);
    else if (event.key === "-") zoom(1 / 1.5);
    else {
      const [x, y] = directions[event.key];
      const bounds = viewer.viewport.getBounds(true);
      viewer.viewport.panBy(new OpenSeadragon.Point(x * bounds.width * 0.15, y * bounds.height * 0.15));
      viewer.viewport.applyConstraints();
    }
  }, true);
  retry.addEventListener("click", start);
  start();
})();
