"use client";

import Link from "next/link";
import { PublicProfileLink } from "@/components/navigation/public-profile-link";
import { Suspense } from "react";
import { useEffect, useId, useRef, useState } from "react";
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
  const [profileOpen, setProfileOpen] = useState(false);
  const profileId = useId();
  const profileRoot = useRef<HTMLDivElement>(null);
  const profileTrigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!profileOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (
        !profileRoot.current?.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        profileTrigger.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener(
        "pointerdown",
        onPointerDown,
      );
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

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
            <div ref={profileRoot} className="relative">
              <button
                ref={profileTrigger}
                type="button"
                aria-expanded={profileOpen}
                aria-controls={profileId}
                onClick={() =>
                  setProfileOpen((open) => !open)
                }
                className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs font-semibold text-foreground hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span
                  aria-hidden="true"
                  className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-white"
                >
                  B
                </span>
                <span>내 프로필</span>
                <span aria-hidden="true">⌄</span>
              </button>
              {profileOpen && (
                <nav
                  id={profileId}
                  aria-label="내 프로필 메뉴"
                  className="absolute right-0 top-[calc(100%+8px)] z-30 grid min-w-44 gap-1 rounded-2xl border border-line bg-white p-2 shadow-[0_16px_45px_-12px_#34204b40]"
                >
                  <PublicProfileLink
                    userId={userId}
                    onNavigate={() => setProfileOpen(false)}
                  />
                  <Link
                    href={withDemoUser(
                      "/quizzes/authoring/manage",
                      userId,
                    )}
                    onClick={() => setProfileOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-canvas focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    내 퀴즈
                  </Link>
                  <Link
                    href={withDemoUser("/my", userId)}
                    onClick={() => setProfileOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-canvas focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    마이페이지
                  </Link>
                  {pathname === "/shop" && (
                    <button
                      type="button"
                      onClick={() => {
                        profileTrigger.current?.focus();
                        setProfileOpen(false);
                        onSignIn?.();
                      }}
                      className="rounded-xl px-3 py-3 text-left text-sm font-medium text-foreground hover:bg-canvas focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      데모 사용자 전환
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onSignOut?.();
                    }}
                    className="rounded-xl px-3 py-3 text-left text-sm font-medium text-foreground hover:bg-canvas focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    데모 나가기
                  </button>
                </nav>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs font-semibold text-foreground hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              데모 사용자 선택
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

  const userId = params.get("user");
  const { signIn, signOut } = useDemoSession();
  return (
    <>
      <HeaderNavigation
        pathname={pathname}
        userId={userId}
        onSignIn={signIn}
        onSignOut={signOut}
      />
      {userId && pathname !== "/shop" && (
        <div className="border-b border-line bg-canvas px-5 py-1 text-center text-xs text-muted">
          <button
            className="min-h-8 rounded px-2 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
            onClick={signIn}
          >
            데모:{" "}
            {userId === "author"
              ? "작성자"
              : userId === "friend"
                ? "친구"
                : "학습자"}{" "}
            · 사용자 전환
          </button>
        </div>
      )}
    </>
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
