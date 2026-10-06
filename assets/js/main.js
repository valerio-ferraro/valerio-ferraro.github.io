document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

const questions = [
  "How do narratives form, spread, and change what people believe?",
  "How does information shape financial decisions and the risk of a bank run?",
  "How do culture and historical experience shape political and economic behaviour?",
];
document.querySelectorAll("[data-interest]").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-interest]")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
    document.querySelector("[data-interest-copy]").textContent =
      questions[Number(button.dataset.interest)];
    document.querySelector(".interest-display").dataset.active =
      button.dataset.interest;
  });
});

const search = document.querySelector("#research-search");
if (search) {
  const normalize = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase();
  const groups = [...document.querySelectorAll("[data-category]")];
  const applyFilters = () => {
    const category = ["academic", "policy"].includes(location.hash.slice(1))
      ? location.hash.slice(1)
      : "all";
    const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    groups.forEach((group) => {
      let visible = 0;
      group.querySelectorAll("[data-entry]").forEach((entry) => {
        const matches =
          (category === "all" || group.dataset.category === category) &&
          words.every((word) => normalize(entry.textContent).includes(word));
        entry.hidden = !matches;
        if (matches) {
          count++;
          visible++;
        }
      });
      group.hidden = !visible;
    });
    document.querySelectorAll("[data-filter]").forEach((link) => {
      if (link.dataset.filter === category)
        link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    document.querySelector("[data-search-status]").textContent =
      count +
      (count === 1 ? " work" : " works") +
      (words.length ? " found" : "");
    document.querySelector(".empty-search").hidden = count > 0;
  };
  search.addEventListener("input", applyFilters);
  document.querySelectorAll("[data-filter]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      history.pushState(null, "", link.getAttribute("href"));
      applyFilters();
    });
  });
  window.addEventListener("hashchange", applyFilters);
  window.addEventListener("popstate", applyFilters);
  applyFilters();
}

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
      .querySelector("figcaption span:nth-child(2)").textContent;
    dialog.querySelector("[data-photo-counter]").textContent =
      String(current + 1).padStart(2, "0") +
      " / " +
      String(triggers.length).padStart(2, "0");
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
