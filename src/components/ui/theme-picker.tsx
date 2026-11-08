"use client";

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
  const theme = useSyncExternalStore(
    subscribeTheme,
    getResolvedTheme,
    getServerThemePreference,
  );
  const dark = theme === ThemePreference.DARK;

  return (
    <Button
      variant="ghost"
      aria-label={
        dark ? "라이트 모드로 전환" : "다크 모드로 전환"
      }
      onClick={() =>
        setThemePreference(
          dark
            ? ThemePreference.LIGHT
            : ThemePreference.DARK,
        )
      }
      className="size-11 shrink-0 !rounded-full !border !border-line !bg-surface !p-0 !text-foreground hover:!bg-canvas hover:!transform-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:ml-auto"
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
