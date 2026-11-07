"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui";

export function SubscriptionMenu({
  name,
  busy,
  onUnsubscribe,
  outlined = false,
}: {
  name: string;
  busy: boolean;
  onUnsubscribe: () => void;
  outlined?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const item = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    item.current?.focus();
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node))
        setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () =>
      document.removeEventListener("pointerdown", outside);
  }, [open]);

  return (
    <div
      ref={root}
      className="relative"
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node,
          )
        )
          setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          trigger.current?.focus();
        }
        if (
          ["ArrowDown", "ArrowUp", "Home", "End"].includes(
            event.key,
          )
        ) {
          event.preventDefault();
          setOpen(true);
          item.current?.focus();
        }
      }}
    >
      <Button
        ref={trigger}
        size="sm"
        variant="ghost"
        className={
          outlined
            ? "!size-11 !min-h-11 !rounded-2xl !border !border-primary/15 !bg-surface !p-0 !shadow-none"
            : "!size-11 !min-h-11 !rounded-xl !border-0 !p-0 !shadow-none"
        }
        disabled={busy}
        aria-label={`${name} 구독 메뉴`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-4"
        >
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
        </svg>
      </Button>
      {open && (
        <div
          id={id}
          role="menu"
          aria-label={`${name} 구독 관리`}
          className="absolute right-0 top-full z-20 mt-1 min-w-36 rounded-xl border border-line bg-surface p-1 shadow-lg"
        >
          <button
            ref={item}
            type="button"
            role="menuitem"
            disabled={busy}
            className="min-h-11 w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-canvas disabled:opacity-45"
            onClick={() => {
              trigger.current?.focus();
              setOpen(false);
              onUnsubscribe();
            }}
          >
            구독 해제
          </button>
        </div>
      )}
    </div>
  );
}
