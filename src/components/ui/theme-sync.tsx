"use client";

import { useLayoutEffect } from "react";
import { subscribeTheme } from "@/lib/theme/store";

// Error pages have no header, but must still follow system and cross-tab changes.
export function ThemeSync() {
  useLayoutEffect(() => subscribeTheme(() => {}), []);

  return null;
}
