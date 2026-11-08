"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { useSyncExternalStore } from "react";
import { Dropdown } from "@/components/ui/dropdown";
import {
  parseThemePreference,
  ThemePreference,
} from "@/lib/theme/preference";
import {
  getServerThemePreference,
  getThemePreference,
  setThemePreference,
  subscribeTheme,
} from "@/lib/theme/store";

const options = [
  { value: ThemePreference.SYSTEM, label: "시스템" },
  { value: ThemePreference.LIGHT, label: "라이트" },
  { value: ThemePreference.DARK, label: "다크" },
];

export function ThemePicker() {
  const t = useTranslation();

  const preference = useSyncExternalStore(
    subscribeTheme,
    getThemePreference,
    getServerThemePreference,
  );

  return (
    <div className="relative w-27 shrink-0 lg:ml-auto [&_[role=listbox]]:left-auto [&_[role=listbox]]:right-0 [&_[role=listbox]]:min-w-36">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="pointer-events-none absolute left-3 top-3.5 z-10 size-4 text-muted"
      >
        <circle cx="12" cy="12" r="8" />
        <path
          d="M12 4a8 8 0 0 1 0 16Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
      <Dropdown
        label={t("화면 테마")}
        hideLabel
        options={options.map((option) => ({
          ...option,
          label: t(option.label),
        }))}
        value={preference}
        onValueChange={(value) =>
          setThemePreference(parseThemePreference(value))
        }
        triggerClassName="!gap-1 !rounded-full !pl-8 !pr-2 !py-2 !text-xs"
      />
    </div>
  );
}
