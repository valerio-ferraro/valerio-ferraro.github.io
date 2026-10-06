const gallery = document.querySelector(".gallery");
if (gallery) {
  document.querySelectorAll("[data-layout]").forEach((button) => {
    button.addEventListener("click", () => {
      gallery.classList.toggle(
        "sequence",
        button.dataset.layout === "sequence",
      );
      document
        .querySelectorAll("[data-layout]")
        .forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
    });
  });
  const dialog = document.querySelector(".lightbox");
  const triggers = [...document.querySelectorAll("[data-photo]")];
  let current = 0;
  let opener = null;
  const show = (index) => {
    current = (index + triggers.length) % triggers.length;
    const source = triggers[current].querySelector("img");
    const target = dialog.querySelector("[data-lightbox-image]");
    target.src = source.src;
    target.alt = source.alt;
    dialog.querySelector("[data-photo-caption]").textContent = triggers[current]
      .closest("figure")
      .querySelector("figcaption").textContent;
  };
  triggers.forEach((button, index) =>
    button.addEventListener("click", () => {
      opener = button;
      show(index);
      dialog.showModal();
      document.body.classList.add("modal-open");
      dialog.querySelector("[data-close]").focus();
    }),
  );
  dialog
    .querySelector("[data-close]")
    .addEventListener("click", () => dialog.close());
  dialog
    .querySelector("[data-prev]")
    .addEventListener("click", () => show(current - 1));
  dialog
    .querySelector("[data-next]")
    .addEventListener("click", () => show(current + 1));
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(current + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(current - 1);
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    opener?.focus();
  });
}
const portrait = document.querySelector("[data-portrait]");
if (portrait) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = matchMedia("(pointer: fine)");
  const image = portrait.querySelector("img");
  let row = 2, col = 2, targetRow = 2, targetCol = 2;
  let frame = 0, lastStep = 0, ready = false, visible = true;
  let offsetX = 0, offsetY = 0, targetX = 0, targetY = 0, lastTime = 0;
  // Generated cells have slightly uneven margins; these bounds retain the hair
  // and torso without exposing neighbouring frames.
  const columns = [0, 248, 494, 741, 988, 1237];
  const rows = [0, 260, 512, 764, 1014, 1272];
  let lastPointer = null;
  const draw = () => {
    const width = columns[col + 1] - columns[col];
    const height = rows[row + 1] - rows[row];
    portrait.style.setProperty("--portrait-width", (1237 / width * 100) + "%");
    portrait.style.setProperty("--portrait-height", (1272 / height * 100) + "%");
    portrait.style.setProperty("--portrait-x", (-columns[col] / width * 100) + "%");
    portrait.style.setProperty("--portrait-y", (-rows[row] / height * 100) + "%");
    portrait.dataset.pose = row + "," + col;
  };
  const enabled = () => ready && visible && !motion.matches && pointer.matches && !document.hidden;
  const tick = (time) => {
    frame = 0;
    if (!enabled()) return;
    // Time-based damping keeps fine movement consistent on 60/120 Hz screens.
    const elapsed = lastTime ? Math.min(time - lastTime, 50) : 16;
    lastTime = time;
    const blend = 1 - Math.exp(-elapsed / 55);
    offsetX += (targetX - offsetX) * blend;
    offsetY += (targetY - offsetY) * blend;
    const settling = Math.abs(targetX - offsetX) + Math.abs(targetY - offsetY) > .015;
    if (!settling) { offsetX = targetX; offsetY = targetY; }
    portrait.style.setProperty("--gaze-x", offsetX + "px");
    portrait.style.setProperty("--gaze-y", offsetY + "px");
    if (time - lastStep >= 30) {
      row += Math.sign(targetRow - row);
      col += Math.sign(targetCol - col);
      draw();
      lastStep = time;
    }
    if (row !== targetRow || col !== targetCol || settling) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  };
  const schedule = () => { if (!frame && enabled()) frame = requestAnimationFrame(tick); };
  const reset = () => {
    cancelAnimationFrame(frame); frame = 0;
    row = col = targetRow = targetCol = 2; lastStep = 0; draw();
    offsetX = offsetY = targetX = targetY = lastTime = 0;
    portrait.style.setProperty("--gaze-x", "0px");
    portrait.style.setProperty("--gaze-y", "0px");
  };
  const neutral = () => { targetRow = targetCol = 2; targetX = targetY = 0; schedule(); };
  // Hysteresis prevents pose flicker around a direction boundary.
  const quantize = (value, previous) => {
    const bounded = Math.max(0, Math.min(4, value));
    return Math.abs(bounded - previous) > .56 ? Math.round(bounded) : previous;
  };
  const track = (clientX, clientY) => {
    if (!enabled()) return;
    const bounds = portrait.getBoundingClientRect();
    const dx = clientX - bounds.left - bounds.width / 2;
    const dy = clientY - bounds.top - bounds.height * .47;
    const distance = Math.hypot(dx, dy);
    if (distance < 12) { neutral(); return; }
    // Independent axes keep vertical gaze responsive even far to one side.
    // atan approximates target viewing angle rather than eight fixed sectors.
    const direction = (delta) => Math.max(-2, Math.min(2,
      2 * Math.atan(delta / (bounds.width * .55)) / Math.atan(.9)));
    targetCol = quantize(2 + direction(dx), targetCol);
    targetRow = quantize(2 + direction(dy), targetRow);
    // Tiny whole-cutout parallax, NOT synthetic eye motion or facial warping.
    // It preserves fine cursor response within a discrete pose.
    targetX = 1.6 * Math.tanh(dx / bounds.width);
    targetY = 1.1 * Math.tanh(dy / bounds.height);
    schedule();
  };
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    lastPointer = [event.clientX, event.clientY];
    track(...lastPointer);
  }, {passive:true});
  window.addEventListener("scroll", () => {
    if (lastPointer) track(...lastPointer);
  }, {passive:true});
  document.documentElement.addEventListener("pointerleave", () => {
    lastPointer = null;
    neutral();
  });
  window.addEventListener("blur", () => { lastPointer = null; reset(); });
  window.addEventListener("resize", reset);
  document.addEventListener("visibilitychange", reset);
  motion.addEventListener("change", reset);
  pointer.addEventListener("change", reset);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) reset();
      else if (lastPointer) track(...lastPointer);
    }).observe(portrait);
  }
  image.decode().then(() => {
    ready = true; draw();
    if (lastPointer) track(...lastPointer);
  }).catch(() => {
    // Use the approved likeness, not the older portrait, if the atlas fails.
    portrait.classList.add("portrait-fallback");
    image.src = "./images/portrait-master-v11.png";
  });
}
