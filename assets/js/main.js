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
  import("./portrait-live.js")
    .then(({initPortrait}) => initPortrait(portrait))
    .catch(error => console.warn("Keeping the original portrait photograph.", error));
}
