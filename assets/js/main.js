const root = document.documentElement;
if (root.classList.contains("no-js")) {
  root.classList.remove("no-js");
}
root.classList.add("js");

const menuButton = document.querySelector("[data-menu-toggle]");
const siteNav = document.querySelector("[data-nav]");
const navList = document.querySelector("#primary-menu");

const closeMenu = () => {
  if (!menuButton || !siteNav) {
    return;
  }
  siteNav.dataset.open = "false";
  menuButton.setAttribute("aria-expanded", "false");
};

const openMenu = () => {
  if (!menuButton || !siteNav) {
    return;
  }
  siteNav.dataset.open = "true";
  menuButton.setAttribute("aria-expanded", "true");
};

if (menuButton && siteNav && navList) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
      const firstLink = navList.querySelector("a");
      if (firstLink) {
        firstLink.focus();
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      menuButton.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node)) {
      return;
    }
    if (!siteNav.contains(event.target) && !menuButton.contains(event.target)) {
      closeMenu();
    }
  });

  navList.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });
}

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});
