"use client";

import { useEffect, useId, useRef, useState } from "react";

export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: string;
}) {
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [open, setOpen] = useState(false);

  function show() {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;

    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node))
        setOpen(false);
    }

    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <span
      ref={root}
      className="relative inline-flex shrink-0 align-middle"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") show();
      }}
      onPointerLeave={() => {
        timer.current = setTimeout(() => {
          if (
            !root.current?.contains(document.activeElement)
          )
            setOpen(false);
        }, 150);
      }}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onClick={show}
        className="grid size-8 place-items-center rounded-full text-muted hover:bg-primary/10 hover:text-primary focus-visible:text-primary"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v6M12 7v1" />
        </svg>
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="fixed inset-x-5 bottom-6 z-50 rounded-xl border border-line bg-surface p-3 text-left text-xs font-normal leading-6 text-foreground shadow-lg sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-full sm:w-64"
        >
          {children}
        </span>
      )}
    </span>
  );
}
