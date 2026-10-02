const STORAGE_KEY = "password-toolkit-theme";

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getPreferredTheme() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }

  return "dark";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const button = document.querySelector("#themeToggle");

  if (!button) {
    return;
  }

  const isDark = theme === "dark";

  button.textContent = isDark ? "☀️" : "🌙";

  button.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme",
  );

  button.setAttribute(
    "title",
    isDark ? "Switch to light theme" : "Switch to dark theme",
  );
}

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures.
  }
}

export function initializeTheme() {
  const storedTheme = getStoredTheme();

  const initialTheme =
    storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : getPreferredTheme();

  applyTheme(initialTheme);

  const button = document.querySelector("#themeToggle");

  button?.addEventListener("click", () => {
    const currentTheme =
      document.documentElement.dataset.theme || "dark";

    const nextTheme =
      currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });
}
