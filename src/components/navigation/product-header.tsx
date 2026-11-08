"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { LanguagePicker } from "@/components/ui/language-picker";

import { useDemoSession } from "@/components/navigation/demo-session";
import {
  getNavigationItems,
  isNavigationActive,
  withDemoUser,
} from "@/components/navigation/routes";
import { ThemePicker } from "@/components/ui/theme-picker";
import Link from "next/link";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";
import {
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

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
  const t = useTranslation();

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

  const itemStyle =
    "rounded-none px-3 py-3 text-left text-sm font-medium text-foreground hover:bg-canvas focus-visible:outline-2 focus-visible:outline-primary";

  return (
    <header className="relative z-20 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-center justify-between gap-x-2 gap-y-2 px-5 py-3 sm:py-4 md:px-12">
        <Link
          href={withDemoUser("/", userId)}
          aria-label={t("Bugri 홈")}
          className="flex items-center gap-2 rounded text-2xl sm:text-[29px] font-extrabold tracking-[-1.5px] text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 -rotate-8 place-items-center rounded-xl bg-primary-solid font-serif text-2xl text-lime"
          >
            b.
          </span>
          <span className="hidden min-[480px]:inline">
            bugri
          </span>
          <span
            aria-hidden="true"
            className="hidden self-start text-coral min-[480px]:inline"
          >
            .
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <nav
            aria-label={t("주 메뉴")}
            className="flex items-center"
          >
            {items.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  href === active ? "page" : undefined
                }
                className={`flex min-h-11 items-center whitespace-nowrap rounded-full px-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-5 ${href === active ? "bg-primary/10 text-primary" : "text-muted hover:bg-canvas hover:text-foreground"}`}
              >
                {t(label)}
              </Link>
            ))}
          </nav>
          <LanguagePicker className="w-[84px] sm:w-27 [&_[role=combobox]]:px-2! sm:[&_[role=combobox]]:px-3!" />
          <ThemePicker />
          <div ref={profileRoot} className="relative">
            <button
              ref={profileTrigger}
              type="button"
              aria-label={t("내 메뉴")}
              aria-expanded={profileOpen}
              aria-controls={profileId}
              onClick={() =>
                setProfileOpen((open) => !open)
              }
              className="flex min-h-11 shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full border border-line bg-surface px-1 text-xs font-semibold text-foreground hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:gap-2 sm:px-2"
            >
              <span
                aria-hidden="true"
                className="grid size-7 place-items-center rounded-full bg-primary-solid text-xs font-bold text-on-primary"
              >
                B
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 shrink-0"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {profileOpen && (
              <nav
                id={profileId}
                aria-label={t("내 메뉴")}
                className="absolute right-0 top-[calc(100%+8px)] z-30 grid min-w-44 divide-y divide-line overflow-hidden rounded-control border border-control-line bg-surface-raised"
              >
                {userId && (
                  <>
                    <Link
                      href={withDemoUser(
                        "/my/learning",
                        userId,
                      )}
                      onClick={() => setProfileOpen(false)}
                      className={itemStyle}
                    >
                      {t("풀이 내역")}
                    </Link>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onSignIn?.();
                  }}
                  className={itemStyle}
                >
                  {t("데모 사용자 선택")}
                </button>
                {userId && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onSignOut?.();
                    }}
                    className={itemStyle}
                  >
                    {t("데모 나가기")}
                  </button>
                )}
              </nav>
            )}
          </div>
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
    <HeaderNavigation
      pathname={pathname}
      userId={userId}
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
