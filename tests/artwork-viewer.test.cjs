// Controller tests only: this simulated viewer does not validate actual rendering.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const code = readFileSync(require('node:path').join(__dirname, '../dev/artwork/viewer.js'), 'utf8');

function setup({ library = true, reducedMotion = false } = {}) {
  const elements = new Map();
  const listeners = {};
  const timers = new Map();
  let nextTimer = 0;
  const document = {
    fullscreenEnabled: true,
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, {
        textContent: '', disabled: false, hidden: false, events: {},
        addEventListener(type, handler) { this.events[type] = handler; },
        async requestFullscreen() { document.fullscreenElement = this; listeners.fullscreenchange(); },
      });
      return elements.get(id);
    },
    addEventListener(type, handler) { listeners[type] = handler; },
    async exitFullscreen() { document.fullscreenElement = null; listeners.fullscreenchange(); },
  };
  const viewers = [];
  function OpenSeadragon(options) {
    let items = 0;
    const item = { getContentSize: () => ({ x: 13920, y: 10200 }), imageToViewportZoom: (n) => n * 20 };
    const viewer = {
      options, handlers: {}, calls: [], destroyed: false,
      world: { getItemCount: () => items, getItemAt: () => items ? item : undefined },
      viewport: {
        getZoom: () => 2, getHomeZoom: () => 1, getBounds: () => ({ width: 1, height: 0.5 }),
        zoomBy: (n) => viewer.calls.push(['zoomBy', n]),
        zoomTo: (n) => viewer.calls.push(['zoomTo', n]),
        applyConstraints: () => viewer.calls.push(['constraints']),
        goHome: () => viewer.calls.push(['home']),
        panBy: (point) => viewer.calls.push(['panBy', point.x, point.y]),
      },
      addHandler(name, handler) { this.handlers[name] = handler; },
      emit(name) { if (name === 'open') items = 1; this.handlers[name]?.({}); },
      open(url) { this.source = url; },
      destroy() { this.destroyed = true; },
    };
    viewers.push(viewer);
    return viewer;
  }
  OpenSeadragon.Point = function (x, y) { this.x = x; this.y = y; };
  const context = { document, performance: { now: () => 100 },
    matchMedia: () => ({ matches: reducedMotion }),
    setTimeout(fn) { timers.set(++nextTimer, fn); return nextTimer; },
    clearTimeout(id) { timers.delete(id); },
  };
  if (library) context.OpenSeadragon = OpenSeadragon;
  vm.runInNewContext(code, context);
  return { elements, viewers, timers, document, get: (id) => elements.get(id) };
}

test('enables controls after metadata, counts tiles, waits for actual draw before ready', () => {
  const { get, viewers, timers } = setup();
  const viewer = viewers[0];
  assert.equal(get('fit').disabled, true);
  assert.match(viewer.source, /duomo\.dzi$/);
  viewer.emit('open');
  assert.equal(get('fit').disabled, false);
  assert.equal(get('resolution').textContent, '13,920 × 10,200 px');
  assert.match(get('viewer-status').textContent, /Loading/);
  viewer.emit('tile-loaded'); viewer.emit('tile-loaded');
  assert.equal(get('tile-count').textContent, '2');
  viewer.emit('tile-drawn');
  assert.match(get('viewer-status').textContent, /Ready/);
  assert.equal(timers.size, 0);
  assert.equal(get('zoom-readout').textContent, '2.0× from fit');
});

test('metadata failure can retry; previous viewer callbacks cannot corrupt the new session', () => {
  const { get, viewers } = setup();
  const old = viewers[0];
  old.emit('open-failed');
  assert.equal(get('retry').hidden, false);
  assert.equal(get('fit').disabled, true);
  get('retry').events.click();
  assert.equal(old.destroyed, true);
  old.emit('tile-loaded'); old.emit('open-failed');
  assert.equal(get('tile-count').textContent, '0');
  assert.match(get('viewer-status').textContent, /Loading/);
  viewers[1].emit('open'); viewers[1].emit('tile-drawn');
  assert.equal(get('retry').hidden, true);
});

test('a failed detail tile remains visible as a warning after another tile draws', () => {
  const { get, viewers } = setup();
  viewers[0].emit('open'); viewers[0].emit('tile-load-failed'); viewers[0].emit('tile-drawn');
  assert.match(get('viewer-status').textContent, /Some image detail/);
  assert.equal(get('retry').hidden, false);
  assert.equal(get('fit').disabled, false);
});

test('slow source exposes retry and can recover; absent library produces a clear error', () => {
  const { get, viewers, timers } = setup();
  [...timers.values()][0]();
  assert.match(get('viewer-status').textContent, /longer than expected/);
  assert.equal(get('retry').hidden, false);
  viewers[0].emit('open'); viewers[0].emit('tile-drawn');
  assert.equal(get('retry').hidden, true);
  const missing = setup({ library: false });
  assert.match(missing.get('viewer-status').textContent, /viewer could not load/);
  assert.equal(missing.get('fit').disabled, true);
});

test('zoom, fit, 1:1, and keyboard commands use constrained image coordinates', () => {
  const { get, viewers } = setup({ reducedMotion: true });
  const viewer = viewers[0];
  viewer.emit('open');
  assert.equal(viewer.options.animationTime, 0);
  get('zoom-in').events.click(); get('zoom-out').events.click();
  get('fit').events.click(); get('actual-size').events.click();
  assert.deepEqual(viewer.calls.slice(0, 7), [
    ['zoomBy', 1.5], ['constraints'], ['zoomBy', 1 / 1.5], ['constraints'], ['home'], ['zoomTo', 20], ['constraints'],
  ]);
  let prevented = false;
  get('viewer').events.keydown({ key: 'ArrowRight', preventDefault() { prevented = true; }, stopPropagation() {} });
  assert.equal(prevented, true);
  assert.deepEqual(viewer.calls.at(-2), ['panBy', 0.15, 0]);
  const before = viewer.calls.length;
  get('viewer').events.keydown({ key: '+', ctrlKey: true });
  get('viewer').events.keydown({ key: 'Tab' });
  assert.equal(viewer.calls.length, before);
});

test('fullscreen keeps toolbar inside the fullscreen element and handles rejection', async () => {
  const { get, viewers, document } = setup();
  viewers[0].emit('open');
  await get('fullscreen').events.click();
  assert.equal(document.fullscreenElement, get('viewer-stage'));
  assert.equal(get('fullscreen').textContent, 'Exit fullscreen');
  await get('fullscreen').events.click();
  assert.equal(document.fullscreenElement, null);
  get('viewer-stage').requestFullscreen = async () => { throw Error('denied'); };
  await get('fullscreen').events.click();
  assert.match(get('viewer-status').textContent, /Fullscreen is unavailable/);
});
