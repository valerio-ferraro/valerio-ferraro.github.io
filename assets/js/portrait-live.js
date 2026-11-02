import "../css/portrait-live.css";

// Every frame includes its own generated head pose AND gaze. No pupil overlays,
// facial warping, frame blending, idle expression changes, or runtime AI.
const controllers = new WeakMap();
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function sourceURL(value, base) {
  if (typeof value !== "string" || !value) throw new Error("Missing portrait asset URL");
  const url = new URL(value, base);
  if (url.origin !== location.origin) throw new Error("Portrait assets must be served locally");
  return url.href;
}

function atlasSpec(value, columns, rows, base) {
  if (!value || !Number.isInteger(value.cellWidth) || !Number.isInteger(value.cellHeight) || value.cellWidth < 1 || value.cellHeight < 1) {
    throw new Error("Invalid portrait atlas dimensions");
  }
  return {
    src: sourceURL(value.src, base),
    cellWidth: value.cellWidth,
    cellHeight: value.cellHeight,
    width: value.width || columns * value.cellWidth,
    height: value.height || rows * value.cellHeight,
  };
}

async function decodeAtlas(url, signal) {
  const response = await fetch(url, {signal, cache: "force-cache"});
  if (!response.ok) throw new Error(`Portrait image failed: ${response.status}`);
  const blob = await response.blob();
  if (signal.aborted) throw new DOMException("Portrait cancelled", "AbortError");
  if ("createImageBitmap" in window) return createImageBitmap(blob);
  const objectURL = URL.createObjectURL(blob);
  try {
    const image = new Image(); image.src = objectURL;
    await image.decode(); return image;
  } finally { URL.revokeObjectURL(objectURL); }
}

/**
 * Manifest: {version, columns, rows, neutralColumn, neutralRow,
 *   atlas:{src,cellWidth,cellHeight,width?,height?}, mobileAtlas?:same,
 *   fallback?:string, eyePosition?:{x:0..1,y:0..1}}
 * Col 0 looks screen-left; row 0 looks up. URLs resolve from the manifest.
 * Return an object with destroy() and a ready promise. The still image remains
 * visible until the selected atlas has decoded and a neutral frame is drawn.
 */
export async function initPortrait(portrait) {
  if (!portrait) return null;
  if (controllers.has(portrait)) return controllers.get(portrait);
  const image = portrait.querySelector("img");
  if (!image) return null;
  const manifestURL = new URL(portrait.dataset.portraitManifest || "/images/portrait-live/manifest.json", location.href);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(any-pointer: fine)");
  const phone = matchMedia("(max-width: 580px)");
  const abort = new AbortController();
  const listeners = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    listeners.push(() => target.removeEventListener(type, handler, options));
  };
  const originalState = {className: portrait.className, state: portrait.dataset.state, pose: portrait.dataset.pose, src: image.getAttribute("src")};
  portrait.classList.add("portrait-live");
  portrait.dataset.state = "loading";
  let destroyed = false, visible = true, bitmap = null, canvas = null, context = null;
  let manifest = null, chosen = null, loading = null, frame = 0, previousTime = 0;
  let pointer = null, activeTouch = null, observer = null;
  let x = 0, y = 0, vx = 0, vy = 0, targetX = 0, targetY = 0;
  let drawnColumn = -1, drawnRow = -1;
  let settleReady;
  const ready = new Promise(resolve => { settleReady = resolve; });

  function stop() { cancelAnimationFrame(frame); frame = 0; previousTime = 0; }
  function enabled() { return !destroyed && !!bitmap && visible && !reduced.matches && !document.hidden; }
  function schedule() { if (enabled() && !frame) frame = requestAnimationFrame(tick); }
  function draw(column, row) {
    if (!bitmap || !context || (column === drawnColumn && row === drawnRow)) return;
    context.clearRect(0, 0, chosen.cellWidth, chosen.cellHeight);
    context.drawImage(bitmap, column * chosen.cellWidth, row * chosen.cellHeight,
      chosen.cellWidth, chosen.cellHeight, 0, 0, chosen.cellWidth, chosen.cellHeight);
    drawnColumn = column; drawnRow = row;
    portrait.dataset.pose = `${row},${column}`;
  }
  function neutral(immediate = false) {
    if (!manifest) return;
    targetX = manifest.neutralColumn; targetY = manifest.neutralRow;
    if (immediate) {
      stop(); x = targetX; y = targetY; vx = vy = 0;
      draw(targetX, targetY);
    } else schedule();
  }
  function quantize(value, previous, maximum) {
    if (previous < 0) return clamp(Math.round(value), 0, maximum);
    return clamp(Math.abs(value - previous) > .54 ? Math.round(value) : previous, 0, maximum);
  }
  function tick(time) {
    frame = 0;
    if (!enabled()) return;
    const dt = previousTime ? Math.min((time - previousTime) / 1000, .05) : 1 / 60;
    previousTime = time;
    // Exact critically damped spring for each axis; display refresh independent.
    const omega = 19, decay = Math.exp(-omega * dt);
    const dx = x - targetX, dy = y - targetY;
    const tx = (vx + omega * dx) * dt, ty = (vy + omega * dy) * dt;
    x = targetX + (dx + tx) * decay; y = targetY + (dy + ty) * decay;
    vx = (vx - omega * tx) * decay; vy = (vy - omega * ty) * decay;
    const settled = Math.abs(x - targetX) + Math.abs(y - targetY) + Math.abs(vx) + Math.abs(vy) < .015;
    if (settled) { x = targetX; y = targetY; vx = vy = 0; }
    draw(quantize(x, drawnColumn, manifest.columns - 1), quantize(y, drawnRow, manifest.rows - 1));
    if (!settled) schedule(); else previousTime = 0;
  }
  function track(clientX, clientY) {
    if (!enabled() || !manifest) return;
    const rect = portrait.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const eye = manifest.eyePosition || {x: .5, y: .43};
    const dx = clientX - rect.left - rect.width * eye.x;
    const dy = clientY - rect.top - rect.height * eye.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 10) { neutral(); return; }
    // A finger is confined to the portrait: its edges should still reach the
    // full pose grid, without capturing a gesture or blocking page scrolling.
    const horizontal = activeTouch !== null ? clamp(dx / (rect.width * .48), -1, 1)
      : clamp(Math.atan(dx / (rect.width * .8)) / 1.08, -1, 1);
    const vertical = activeTouch !== null ? clamp(dy / (rect.height * .48), -1, 1)
      : clamp(Math.atan(dy / (rect.height * .8)) / 1.08, -1, 1);
    targetX = manifest.neutralColumn + horizontal * (horizontal < 0 ? manifest.neutralColumn : manifest.columns - 1 - manifest.neutralColumn);
    targetY = manifest.neutralRow + vertical * (vertical < 0 ? manifest.neutralRow : manifest.rows - 1 - manifest.neutralRow);
    schedule();
  }
  function reset() { pointer = null; activeTouch = null; neutral(true); }

  async function activate() {
    if (destroyed || !manifest || bitmap || reduced.matches || document.hidden || !visible) return;
    if (loading) return loading;
    loading = (async () => {
      try {
        // Choose once: an atlas never upgrades behind the visitor's back on resize.
        chosen = atlasSpec((phone.matches || !fine.matches) && manifest.mobileAtlas ? manifest.mobileAtlas : manifest.atlas,
          manifest.columns, manifest.rows, manifestURL);
        const decoded = await decodeAtlas(chosen.src, abort.signal);
        if (destroyed) { decoded.close?.(); return; }
        const width = decoded.width || decoded.naturalWidth, height = decoded.height || decoded.naturalHeight;
        if (width !== chosen.width || height !== chosen.height || width < manifest.columns * chosen.cellWidth || height < manifest.rows * chosen.cellHeight) {
          decoded.close?.(); throw new Error("Portrait atlas does not match its manifest");
        }
        const surface = document.createElement("canvas");
        surface.width = chosen.cellWidth; surface.height = chosen.cellHeight;
        surface.className = "portrait-live-surface"; surface.setAttribute("aria-hidden", "true");
        const drawing = surface.getContext("2d", {alpha: true});
        if (!drawing) { decoded.close?.(); throw new Error("Portrait canvas unavailable"); }
        bitmap = decoded; canvas = surface; context = drawing;
        context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high";
        neutral(true);
        portrait.append(canvas); portrait.classList.add("portrait-live-ready");
        portrait.dataset.state = reduced.matches ? "reduced-motion" : "ready";
        settleReady(true);
        if (pointer) track(...pointer);
      } catch (error) {
        if (destroyed || abort.signal.aborted) return;
        portrait.dataset.state = "fallback";
        settleReady(false);
        console.warn("Portrait animation unavailable; keeping the original photograph.", error);
      }
    })();
    return loading;
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true; stop(); abort.abort(); observer?.disconnect();
    listeners.forEach(remove => remove()); bitmap?.close?.(); canvas?.remove();
    if (originalState.src !== null) image.setAttribute("src", originalState.src);
    portrait.className = originalState.className;
    if (originalState.state === undefined) delete portrait.dataset.state; else portrait.dataset.state = originalState.state;
    if (originalState.pose === undefined) delete portrait.dataset.pose; else portrait.dataset.pose = originalState.pose;
    controllers.delete(portrait); settleReady(false);
  }
  const controller = {destroy, ready}; controllers.set(portrait, controller);
  try {
    const response = await fetch(manifestURL, {signal: abort.signal, cache: "no-cache"});
    if (!response.ok) throw new Error(`Portrait manifest failed: ${response.status}`);
    manifest = await response.json();
    if (!Number.isInteger(manifest.columns) || !Number.isInteger(manifest.rows) || manifest.columns < 1 || manifest.rows < 1 ||
      !Number.isInteger(manifest.neutralColumn) || !Number.isInteger(manifest.neutralRow) ||
      manifest.neutralColumn < 0 || manifest.neutralColumn >= manifest.columns || manifest.neutralRow < 0 || manifest.neutralRow >= manifest.rows) {
      throw new Error("Invalid portrait manifest");
    }
    x = targetX = manifest.neutralColumn; y = targetY = manifest.neutralRow;
    if (manifest.fallback) image.src = sourceURL(manifest.fallback, manifestURL);
    portrait.dataset.pose = `${manifest.neutralRow},${manifest.neutralColumn}`;

    on(window, "pointermove", event => {
      if (event.pointerType === "touch" || !fine.matches) return;
      pointer = [event.clientX, event.clientY]; track(...pointer);
    }, {passive: true});
    on(document.documentElement, "pointerleave", () => { pointer = null; neutral(); });
    on(portrait, "pointerdown", event => {
      if (event.pointerType !== "touch" || reduced.matches) return;
      activeTouch = event.pointerId; pointer = [event.clientX, event.clientY]; track(...pointer);
    }, {passive: true});
    on(portrait, "pointermove", event => {
      if (event.pointerType !== "touch" || event.pointerId !== activeTouch) return;
      pointer = [event.clientX, event.clientY]; track(...pointer);
    }, {passive: true});
    const releaseTouch = event => {
      if (event.pointerId !== activeTouch) return;
      activeTouch = null; pointer = null; neutral();
    };
    on(window, "pointerup", releaseTouch, {passive: true});
    on(window, "pointercancel", releaseTouch, {passive: true});
    on(window, "scroll", () => { if (pointer && activeTouch === null) track(...pointer); }, {passive: true});
    on(window, "blur", reset);
    on(window, "resize", () => { if (pointer) track(...pointer); else neutral(true); }, {passive: true});
    on(document, "visibilitychange", () => {
      if (document.hidden) reset(); else { activate(); if (pointer) track(...pointer); }
    });
    on(reduced, "change", () => {
      reset(); portrait.dataset.state = reduced.matches ? "reduced-motion" : bitmap ? "ready" : "loading";
      if (!reduced.matches) activate();
    });
    on(fine, "change", reset);
    on(window, "pagehide", reset);
    on(window, "pageshow", () => { reset(); activate(); });
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) reset(); else { activate(); if (pointer) track(...pointer); }
      }, {threshold: 0});
      observer.observe(portrait);
      const bounds = portrait.getBoundingClientRect();
      visible = bounds.bottom > 0 && bounds.top < innerHeight;
    }
    if (reduced.matches) { portrait.dataset.state = "reduced-motion"; settleReady(true); }
    else activate();
    return controller;
  } catch (error) {
    if (!destroyed) {
      portrait.dataset.state = "fallback"; settleReady(false);
      console.warn("Portrait setup unavailable; keeping the original photograph.", error);
    }
    return controller;
  }
}
