"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  translate,
  type UiMessage,
} from "@/lib/i18n/messages";
import {
  getLocale,
  getServerLocale,
  subscribeLocale,
} from "@/lib/i18n/store";

export function useLocale() {
  return useSyncExternalStore(
    subscribeLocale,
    getLocale,
    getServerLocale,
  );
}

export function useTranslation() {
  const locale = useLocale();
  return useCallback(
    (
      message: UiMessage,
      values?: Record<string, string | number>,
    ) => translate(locale, message, values),
    [locale],
  );
}
