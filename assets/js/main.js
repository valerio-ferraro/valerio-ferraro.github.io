import {prepareNavigation} from "./navigation.js";

prepareNavigation();

const gallery = document.querySelector(".gallery");
if (gallery) {
  document.querySelector("[data-gallery-controls]")?.removeAttribute("hidden");
  let layoutTransition = null;
  let desiredLayout = gallery.classList.contains("sequence") ? "sequence" : "index";
  document.querySelectorAll("[data-layout]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.layout === desiredLayout) return;
      desiredLayout = button.dataset.layout;
      const update = () => {
        gallery.classList.toggle("sequence", desiredLayout === "sequence");
        document.querySelectorAll("[data-layout]").forEach((item) =>
          item.setAttribute("aria-pressed", String(item.dataset.layout === desiredLayout)),
        );
      };
      if (layoutTransition) {
        layoutTransition.skipTransition();
        update();
        return;
      }
      if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
        update();
        return;
      }
      const items = [...gallery.querySelectorAll(".gallery-item")];
      items.forEach((item, index) => { item.style.viewTransitionName = `gallery-photo-${index}`; });
      layoutTransition = document.startViewTransition(update);
      layoutTransition.ready.catch(() => {});
      const finish = () => {
        items.forEach((item) => { item.style.removeProperty("view-transition-name"); });
        layoutTransition = null;
      };
      layoutTransition.finished.then(finish, finish);
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
    const figure = triggers[current].closest("figure");
    const caption = (figure.querySelector("[data-photo-title]") || figure.querySelector("figcaption")).textContent.trim();
    dialog.querySelector("[data-photo-caption]").textContent = caption;
    const counter = dialog.querySelector("[data-photo-count]");
    if (counter) counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(triggers.length).padStart(2, "0")}`;
  };
  triggers.forEach((button, index) =>
    button.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
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
  const viewerImage = dialog.querySelector("[data-lightbox-image]");
  let swipe = null;
  viewerImage.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" && !event.isPrimary) { swipe = null; return; }
    if (event.pointerType === "touch" && event.isPrimary) {
      swipe = {id: event.pointerId, x: event.clientX, y: event.clientY};
    }
  }, {passive: true});
  viewerImage.addEventListener("pointerup", (event) => {
    if (!swipe || event.pointerId !== swipe.id) return;
    const dx = event.clientX - swipe.x, dy = event.clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  }, {passive: true});
  viewerImage.addEventListener("pointercancel", () => { swipe = null; }, {passive: true});
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
    swipe = null;
    document.body.classList.remove("modal-open");
    opener?.focus();
  });
}
const portrait = document.querySelector("[data-portrait]");
if (portrait) {
  import("./portrait-live.js")
    .then(({initPortrait}) => initPortrait(portrait))
    .catch(error => console.warn("Keeping the original portrait photograph.", error));
}
