import {
  DARK_MEDIA_QUERY,
  THEME_STORAGE_KEY,
} from "@/lib/theme/preference";

// Static application code only. Runs before body content; no user input is interpolated.
// Keep the storage fallback and preference validation aligned with storage.ts.
export const themeBootstrapScript = `(() => {
  var preference = 'system';
  try {
    var saved = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch {}
  var dark = typeof matchMedia === 'function' && matchMedia(${JSON.stringify(DARK_MEDIA_QUERY)}).matches;
  var theme = preference === 'system' ? (dark ? 'dark' : 'light') : preference;
  var root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = theme;
  root.style.colorScheme = theme === "light" ? "only light" : "dark";
})();`;
