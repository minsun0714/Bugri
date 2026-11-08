"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  const t = useTranslation();

  if (!items.length) return null;

  return (
    <nav
      aria-label={t("현재 위치")}
      className="mb-6 text-sm text-muted"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
        {items.map(({ label, href }, index) => (
          <li
            key={`${index}-${t(label)}`}
            className="flex min-w-0 max-w-full items-start gap-2"
          >
            {index > 0 && (
              <span aria-hidden="true" className="shrink-0">
                /
              </span>
            )}
            {href && index < items.length - 1 ? (
              <Link
                href={href}
                className="min-w-0 break-words rounded py-1 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                {t(label)}
              </Link>
            ) : (
              <span
                aria-current={
                  index === items.length - 1
                    ? "page"
                    : undefined
                }
                className="min-w-0 break-words py-1 text-foreground"
              >
                {t(label)}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
