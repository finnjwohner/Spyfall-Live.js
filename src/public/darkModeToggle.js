const toggleBtn = document.querySelector("#dark-mode-btn");
const root = document.querySelector(":root");

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (event) => {
    const darkMode = event.matches ? true : false;
    if (darkMode) {
      setDarkMode();
    } else {
      setLightMode();
    }
  });

const checkSystemPrefs = () => {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    setDarkMode();
  } else {
    setLightMode();
  }
};

const hasPreference = () => {
  pref = localStorage.getItem("darkMode");

  if (pref == null) {
    return false;
  }

  return true;
};

const isDarkMode = () => {
  return eval(localStorage.getItem("darkMode"));
};

const setDarkMode = () => {
  localStorage.setItem("darkMode", "true");
  toggleBtn.innerHTML = "Light Mode";
  document
    .querySelector('meta[name="theme-color"]')
    .setAttribute("content", "#191919");
  root.style.setProperty("--textColor", "#d8d8d8");
  root.style.setProperty("--hoverColor", "#292929");
  root.style.setProperty("--backgroundColor", "#191919");
  root.style.setProperty("--borderColor", "#252525");
  root.style.setProperty("--isDarkTheme", "true");
  root.style.setProperty("--headerColor", "#191919");
  root.style.setProperty("--deleteColor", "#bd2020");
};

const setLightMode = () => {
  localStorage.setItem("darkMode", "false");
  toggleBtn.innerHTML = "Dark Mode";
  document
    .querySelector('meta[name="theme-color"]')
    .setAttribute("content", "#fff");
  root.style.setProperty("--textColor", "#000");
  root.style.setProperty("--hoverColor", "#eee");
  root.style.setProperty("--backgroundColor", "#fff");
  root.style.setProperty("--borderColor", "#dcdcdc");
  root.style.setProperty("--isDarkTheme", null);
  root.style.setProperty("--headerColor", "black");
  root.style.setProperty("--deleteColor", "#f74040");
};

toggleBtn.addEventListener("mousedown", () => {
  if (isDarkMode()) {
    setLightMode();
  } else {
    setDarkMode();
  }
});

if (hasPreference()) {
  if (isDarkMode()) {
    setDarkMode();
  } else {
    setLightMode();
  }
} else {
  checkSystemPrefs();
}
