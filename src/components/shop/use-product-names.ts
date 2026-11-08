"use client";

import { useMemo } from "react";
import { useLocale } from "@/lib/i18n/use-translation";
import { productNames } from "@/lib/shop/catalog";

export function useProductNames() {
  const locale = useLocale();
  return useMemo(() => productNames(locale), [locale]);
}
