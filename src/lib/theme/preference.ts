export const ThemePreference = {
  SYSTEM: "system",
  LIGHT: "light",
  DARK: "dark",
} as const;

export type ThemePreference =
  (typeof ThemePreference)[keyof typeof ThemePreference];

export const THEME_STORAGE_KEY = "bugri.theme";
export const DARK_MEDIA_QUERY =
  "(prefers-color-scheme: dark)";

export function parseThemePreference(
  value: unknown,
): ThemePreference {
  return value === ThemePreference.LIGHT ||
    value === ThemePreference.DARK
    ? value
    : ThemePreference.SYSTEM;
}
