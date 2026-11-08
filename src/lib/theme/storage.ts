import {
  parseThemePreference,
  THEME_STORAGE_KEY,
  ThemePreference,
} from "@/lib/theme/preference";

// Device appearance is shared by visitors and demo identities, not learning data.
export function readThemePreference(): ThemePreference {
  try {
    return parseThemePreference(
      window.localStorage.getItem(THEME_STORAGE_KEY),
    );
  } catch {
    return ThemePreference.SYSTEM;
  }
}

export function saveThemePreference(
  preference: ThemePreference,
) {
  try {
    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      preference,
    );
  } catch {
    // Storage can be unavailable; the current document still changes theme.
  }
}
