"use client";

import { useId, useSyncExternalStore } from "react";
import { Choice } from "@/components/ui/index";
import { ThemePreference } from "@/lib/theme/preference";
import {
  getServerThemePreference,
  getThemePreference,
  setThemePreference,
  subscribeTheme,
} from "@/lib/theme/store";

const options = [
  {
    value: ThemePreference.SYSTEM,
    label: "시스템 설정 따르기",
  },
  { value: ThemePreference.LIGHT, label: "라이트" },
  { value: ThemePreference.DARK, label: "다크" },
];

export function ThemeSettings() {
  const name = useId();
  const preference = useSyncExternalStore(
    subscribeTheme,
    getThemePreference,
    getServerThemePreference,
  );

  return (
    <fieldset className="grid max-w-md gap-3">
      <legend className="mb-4 text-lg font-semibold">
        테마
      </legend>
      {options.map(({ value, label }) => (
        <Choice
          key={value}
          name={name}
          label={label}
          value={value}
          checked={preference === value}
          onChange={() => setThemePreference(value)}
        />
      ))}
    </fieldset>
  );
}
