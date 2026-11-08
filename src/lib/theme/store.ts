import {
  DARK_MEDIA_QUERY,
  parseThemePreference,
  THEME_STORAGE_KEY,
  ThemePreference,
} from "@/lib/theme/preference";
import {
  readThemePreference,
  saveThemePreference,
} from "@/lib/theme/storage";

const CHANGE_EVENT = "bugri:theme-change";

export function getThemePreference(): ThemePreference {
  return parseThemePreference(
    document.documentElement.dataset.themePreference,
  );
}

export function getResolvedTheme(): ThemePreference {
  return document.documentElement.dataset.theme ===
    ThemePreference.DARK
    ? ThemePreference.DARK
    : ThemePreference.LIGHT;
}

export function getServerThemePreference(): ThemePreference {
  return ThemePreference.SYSTEM;
}

function applyTheme(preference: ThemePreference) {
  const dark =
    typeof window.matchMedia === "function" &&
    window.matchMedia(DARK_MEDIA_QUERY).matches;
  const theme =
    preference === ThemePreference.SYSTEM
      ? dark
        ? ThemePreference.DARK
        : ThemePreference.LIGHT
      : preference;
  const { documentElement: root } = document;

  root.dataset.themePreference = preference;
  root.dataset.theme = theme;
  root.style.colorScheme =
    theme === "light" ? "only light" : "dark";
}

export function setThemePreference(
  preference: ThemePreference,
) {
  saveThemePreference(preference);
  applyTheme(preference);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeTheme(onChange: () => void) {
  if (!document.documentElement.dataset.themePreference) {
    applyTheme(readThemePreference());
  }

  const media =
    typeof window.matchMedia === "function"
      ? window.matchMedia(DARK_MEDIA_QUERY)
      : undefined;

  function onSystemChange() {
    applyTheme(getThemePreference());
    onChange();
  }

  function onStorage(event: StorageEvent) {
    if (
      event.key !== THEME_STORAGE_KEY &&
      event.key !== null
    )
      return;
    if (
      event.storageArea &&
      event.storageArea !== window.localStorage
    )
      return;
    applyTheme(parseThemePreference(event.newValue));
    onChange();
  }

  media?.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  // Catch a system change between the bootstrap script and hydration.
  onSystemChange();

  return () => {
    media?.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}
