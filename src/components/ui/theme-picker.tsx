"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/index";
import { ThemePreference } from "@/lib/theme/preference";
import {
  getResolvedTheme,
  getServerThemePreference,
  setThemePreference,
  subscribeTheme,
} from "@/lib/theme/store";

export function ThemePicker() {
  const t = useTranslation();

  const theme = useSyncExternalStore(
    subscribeTheme,
    getResolvedTheme,
    getServerThemePreference,
  );
  const dark = theme === ThemePreference.DARK;

  return (
    <Button
      variant="ghost"
      aria-label={t(
        dark ? "라이트 모드로 전환" : "다크 모드로 전환",
      )}
      onClick={() =>
        setThemePreference(
          dark
            ? ThemePreference.LIGHT
            : ThemePreference.DARK,
        )
      }
      className="size-11 shrink-0 !rounded-none !border-0 !border-b-2 !border-control-line !bg-surface-raised !p-0 !text-foreground hover:!transform-none hover:outline-2 hover:outline-control-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:ml-auto"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </>
        ) : (
          <path d="M20.5 13.5A8.5 8.5 0 0 1 10.5 3.5a8.5 8.5 0 1 0 10 10Z" />
        )}
      </svg>
    </Button>
  );
}
