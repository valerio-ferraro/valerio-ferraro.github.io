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
  let targetX = 0,
    targetY = 0,
    x = 0,
    y = 0,
    frame = 0;
  const render = () => {
    x += (targetX - x) * 0.12;
    y += (targetY - y) * 0.12;
    portrait.style.setProperty("--rx", x.toFixed(3) + "deg");
    portrait.style.setProperty("--ry", y.toFixed(3) + "deg");
    if (Math.abs(x - targetX) + Math.abs(y - targetY) > 0.015)
      frame = requestAnimationFrame(render);
    else frame = 0;
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };
  const reset = () => {
    targetX = 0;
    targetY = 0;
    schedule();
  };
  window.addEventListener(
    "pointermove",
    (event) => {
      if (motion.matches || !pointer.matches || event.pointerType === "touch")
        return;
      const bounds = portrait.getBoundingClientRect();
      targetY = Math.max(
        -10,
        Math.min(
          10,
          ((event.clientX - bounds.left - bounds.width / 2) / innerWidth) * 22,
        ),
      );
      targetX = Math.max(
        -7,
        Math.min(
          7,
          (-(event.clientY - bounds.top - bounds.height / 2) / innerHeight) *
            16,
        ),
      );
      schedule();
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", reset);
  window.addEventListener("blur", reset);
  motion.addEventListener("change", reset);
}
