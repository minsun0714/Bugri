import { Locale, resolveLocale } from "@/lib/i18n/messages";

export const LOCALE_STORAGE_KEY = "bugri.locale";
const CHANGE_EVENT = "bugri:locale-change";
let current: Locale = Locale.KO;
let initialized = false;

function readLocale() {
  let saved: string | null = null;
  try {
    saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    // A blocked store must not prevent changing the current document.
  }
  return resolveLocale(
    saved,
    navigator.languages ?? [navigator.language],
  );
}

function applyLocale(locale: Locale) {
  current = locale;
  document.documentElement.lang = locale;
  document.title =
    locale === Locale.EN
      ? "Bugri | Quiz platform"
      : "Bugri | 퀴즈 관리 플랫폼";
}

export function setLocale(locale: Locale) {
  initialized = true;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Keep the in-memory preference for this visit.
  }
  applyLocale(locale);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getLocale() {
  return current;
}
export function getServerLocale(): Locale {
  return Locale.KO;
}

export function subscribeLocale(onChange: () => void) {
  if (!initialized) {
    initialized = true;
    applyLocale(readLocale());
  }
  applyLocale(current);
  function onStorage(event: StorageEvent) {
    if (
      event.key === LOCALE_STORAGE_KEY ||
      event.key === null
    ) {
      applyLocale(readLocale());
      onChange();
    }
  }
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  onChange();
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
