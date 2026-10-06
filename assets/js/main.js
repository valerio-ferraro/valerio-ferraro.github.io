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
  // Generated cells have slightly uneven margins; these bounds retain the hair
  // and torso without exposing neighbouring frames.
  const columns = [0, 261, 512, 759, 1008, 1254];
  const rows = [0, 272, 520, 770, 1014, 1254];
  let lastPointer = null;
  const draw = () => {
    const width = columns[col + 1] - columns[col];
    const height = rows[row + 1] - rows[row];
    portrait.style.setProperty("--portrait-width", (1254 / width * 100) + "%");
    portrait.style.setProperty("--portrait-height", (1254 / height * 100) + "%");
    portrait.style.setProperty("--portrait-x", (-columns[col] / width * 100) + "%");
    portrait.style.setProperty("--portrait-y", (-rows[row] / height * 100) + "%");
    portrait.dataset.pose = row + "," + col;
  };
  const enabled = () => ready && visible && !motion.matches && pointer.matches && !document.hidden;
  const tick = (time) => {
    frame = 0;
    if (!enabled()) return;
    if (time - lastStep >= 42) {
      row += Math.sign(targetRow - row);
      col += Math.sign(targetCol - col);
      draw();
      lastStep = time;
    }
    if (row !== targetRow || col !== targetCol) frame = requestAnimationFrame(tick);
  };
  const schedule = () => { if (!frame && enabled()) frame = requestAnimationFrame(tick); };
  const reset = () => {
    cancelAnimationFrame(frame); frame = 0;
    row = col = targetRow = targetCol = 2; lastStep = 0; draw();
  };
  const neutral = () => { targetRow = targetCol = 2; schedule(); };
  // Hysteresis prevents pose flicker around a direction boundary.
  const quantize = (value, previous) => {
    const bounded = Math.max(0, Math.min(4, value));
    return Math.abs(bounded - previous) > .56 ? Math.round(bounded) : previous;
  };
  const track = (clientX, clientY) => {
    if (!enabled()) return;
    const bounds = portrait.getBoundingClientRect();
    const dx = clientX - bounds.left - bounds.width / 2;
    const dy = clientY - bounds.top - bounds.height * .43;
    const distance = Math.hypot(dx, dy);
    if (distance < 18) { neutral(); return; }
    // Direction is measured around the eyes, not against the entire viewport.
    // A square-normalized vector keeps cardinal poses reachable at all angles.
    const span = Math.max(Math.abs(dx), Math.abs(dy), 1);
    const strength = Math.min(1, (distance - 18) / (bounds.width * .42));
    targetCol = quantize(2 + 2 * dx / span * strength, targetCol);
    targetRow = quantize(2 + 2 * dy / span * strength, targetRow);
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
  window.addEventListener("blur", reset);
  window.addEventListener("resize", reset);
  document.addEventListener("visibilitychange", reset);
  motion.addEventListener("change", reset);
  pointer.addEventListener("change", reset);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) reset();
    }).observe(portrait);
  }
  image.decode().then(() => {ready = true; draw();}).catch(() => {
    // Keep the original photograph usable if the atlas fails to load.
    portrait.classList.add("portrait-fallback");
    image.src = "./images/valerio-ferraro.jpg";
  });
}
