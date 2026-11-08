"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

export function LocalizedText({
  message,
}: {
  message: string;
}) {
  const t = useTranslation();
  return t(message);
}
