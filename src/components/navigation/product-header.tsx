"use client";

import Link from "next/link";
import { Suspense } from "react";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";
import { useDemoSession } from "@/components/navigation/demo-session";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import {
  getNavigationItems,
  isNavigationActive,
  withDemoUser,
} from "@/components/navigation/routes";

export function HeaderNavigation({
  pathname,
  userId,
  onSignIn,
  onSignOut,
}: {
  pathname: string;
  userId: string | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}) {
  const items = getNavigationItems(userId);
  const active = items.find(({ activePaths }) =>
    isNavigationActive(pathname, activePaths),
  )?.href;

  return (
    <header className="relative z-20 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-12">
        <Link
          href={withDemoUser("/", userId)}
          aria-label="Bugri 홈"
          className="flex items-center gap-2 rounded text-[29px] font-extrabold tracking-[-1.5px] text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 -rotate-8 place-items-center rounded-xl bg-primary font-serif text-2xl text-lime"
          >
            b.
          </span>
          bugri
          <span
            aria-hidden="true"
            className="self-start text-coral"
          >
            .
          </span>
        </Link>
        <nav
          aria-label="주 메뉴"
          className="hidden items-center gap-1 sm:flex"
        >
          {items.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              aria-current={
                href === active ? "page" : undefined
              }
              className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${href === active ? "bg-primary/10 text-primary" : "text-muted hover:bg-canvas hover:text-foreground"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {userId ? (
            <>
              <span className="rounded-full bg-lime/40 px-2 py-1 text-[10px] font-semibold text-foreground">
                데모
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="min-h-11 rounded-full border border-line px-3 text-xs font-semibold text-foreground hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs font-semibold text-foreground hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span
                aria-hidden="true"
                className="text-base font-bold text-primary"
              >
                G
              </span>
              Google 로그인{" "}
              <span className="text-[10px] text-muted">
                (데모)
              </span>
            </button>
          )}
          <MobileNavigation
            key={`${pathname}-${userId}`}
            sections={items.map(({ href, label }) => [
              href,
              label,
            ])}
            activePath={active ?? ""}
            product
          />
        </div>
      </div>
    </header>
  );
}

function ConnectedHeader() {
  const pathname = usePathname();
  const params = useSearchParams();

  const { signedIn, signIn, signOut } = useDemoSession();

  // Demo header state is independent of existing feature query parameters.
  return (
    <HeaderNavigation
      pathname={pathname}
      userId={
        signedIn ? (params.get("user") ?? "learner") : null
      }
      onSignIn={signIn}
      onSignOut={signOut}
    />
  );
}

export function ProductHeader() {
  return (
    <Suspense
      fallback={
        <div
          className="h-20 border-b border-line bg-surface"
          aria-hidden="true"
        />
      }
    >
      <ConnectedHeader />
    </Suspense>
  );
}
