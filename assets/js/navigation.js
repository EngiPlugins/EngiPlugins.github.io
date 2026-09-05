const toggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-navigation");
const header = document.querySelector(".header-inner");
if (toggle && navigation && header) {
  toggle.hidden = false;
  header.classList.add("nav-ready");
  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("is-open", open);
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) close();
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      toggle.getAttribute("aria-expanded") === "true"
    ) {
      close();
      toggle.focus();
    }
  });
  matchMedia("(min-width: 901px)").addEventListener("change", close);
}
