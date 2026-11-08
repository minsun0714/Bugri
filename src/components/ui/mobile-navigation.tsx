"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { LanguagePicker } from "@/components/ui/language-picker";

import Link from "next/link";
import { useId } from "react";
import { useMobileNavigation } from "@/components/ui/hooks/use-mobile-navigation";

export function MobileNavigation({
  sections,
  activePath,
  product = false,
}: {
  sections: string[][];
  activePath?: string;
  product?: boolean;
}) {
  const t = useTranslation();

  const {
    open,
    setOpen,
    active: hashActive,
    root,
    trigger,
    selectSection,
  } = useMobileNavigation(product);

  const active = activePath ?? hashActive;
  const navigationId = useId();

  return (
    <div
      ref={root}
      className={product ? "lg:hidden" : "sm:hidden"}
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node,
          )
        )
          setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label={open ? t("메뉴 닫기") : t("메뉴 열기")}
        aria-expanded={open}
        aria-controls={navigationId}
        onClick={() => setOpen(!open)}
        className={`grid size-11 place-items-center rounded-2xl border transition-colors ${open ? "border-primary/20 bg-primary/10 text-primary" : "border-line bg-surface text-foreground hover:bg-canvas"}`}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <path d="m6 6 12 12M18 6 6 18" />
          ) : (
            <>
              <path d="M4 7h16M4 12h16M4 17h10" />
            </>
          )}
        </svg>
      </button>
      {open && (
        <nav
          id={navigationId}
          aria-label={
            product
              ? t("모바일 주 메뉴")
              : t("모바일 컴포넌트 섹션")
          }
          className="absolute inset-x-3 top-[calc(100%+8px)] max-h-[calc(100dvh-100px)] overflow-y-auto rounded-3xl border border-line bg-surface p-3 shadow-[0_16px_45px_-12px_#34204b40]"
        >
          <div className="flex items-center justify-between px-3 pb-3 pt-2">
            <span className="text-[10px] font-bold tracking-[.18em] text-muted">
              EXPLORE BUGRI
            </span>
            <span className="rounded-full bg-success-soft px-2 py-1 text-[9px] font-semibold text-success-ink">
              {product ? t("메뉴") : "UI COLLECTION"}
            </span>
          </div>
          <div className="grid gap-1">
            {sections.map(([id, label], i) => (
              <Link
                key={id}
                href={id.startsWith("/") ? id : `#${id}`}
                aria-current={
                  active === id
                    ? product
                      ? "page"
                      : "location"
                    : undefined
                }
                onClick={() => selectSection(id)}
                className={`group flex min-h-14 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${active === id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-canvas"}`}
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-xl font-mono text-[10px] ${active === id ? "bg-primary-solid text-on-primary" : "bg-canvas text-primary/70"}`}
                >
                  0{i + 1}
                </span>
                <span>{t(label)}</span>
                <span
                  className="ml-auto text-base text-primary/60"
                  aria-hidden="true"
                >
                  {active === id ? "•" : "↗"}
                </span>
              </Link>
            ))}
          </div>
          <div className="mx-3 mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-xs text-muted">
              Language / 언어
            </span>
            <LanguagePicker />
          </div>
          <div className="mx-3 mt-3 border-t border-line pb-1 pt-3 text-[11px] text-muted">
            {t("작은 배움이 쌓이는 곳")}{" "}
            <span className="float-right font-bold text-primary">
              bugri.
            </span>
          </div>
        </nav>
      )}
    </div>
  );
}
