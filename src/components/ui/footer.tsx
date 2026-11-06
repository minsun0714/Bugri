import type { ReactNode } from "react";

type FooterLink = { label: string; href: string };

export function Footer({
  links = [],
  note,
}: {
  links?: FooterLink[];
  note?: ReactNode;
}) {
  return (
    <footer
      className="mt-14 border-t border-line bg-surface"
      aria-label="사이트 정보"
    >
      <div className="mx-auto max-w-[1220px] px-6 pb-6 pt-8 md:px-12 md:pt-10">
        <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-7">
          <a
            href="#top"
            aria-label="Bugri 맨 위로"
            className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary"
          >
            <span
              className="grid size-7 -rotate-6 place-items-center rounded-lg bg-primary font-serif text-xl text-lime"
              aria-hidden="true"
            >
              b.
            </span>
            bugri
            <span
              className="-ml-1 self-start text-lg text-coral"
              aria-hidden="true"
            >
              .
            </span>
          </a>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
            {links.length > 0 && (
              <nav
                aria-label="푸터 바로가기"
                className="flex flex-wrap gap-x-6 gap-y-3"
              >
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="py-1 text-xs font-medium text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}
            <a
              href="#top"
              aria-label="페이지 맨 위로"
              className="grid size-10 place-items-center rounded-full border border-line text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19V5m-6 6 6-6 6 6" />
              </svg>
            </a>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-5 text-[11px] text-muted">
          <small className="text-[11px]">© 2026 Bugri. All rights reserved.</small>
          {note && (
            <span className="inline-flex items-center gap-2">
              <span
                className="size-1.5 rounded-full bg-primary/50"
                aria-hidden="true"
              />
              {note}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
