"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui";

export function ActionMenu({
  items,
  disabled = false,
}: {
  items: {
    label: string;
    disabled?: boolean;
    onSelect: () => void;
  }[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node))
        setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      root.current
        ?.querySelector<HTMLButtonElement>("button")
        ?.focus();
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className="relative"
      onBlur={({ currentTarget, relatedTarget }) => {
        if (!currentTarget.contains(relatedTarget as Node))
          setOpen(false);
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(!open)}
      >
        더 보기 <span aria-hidden="true">⋯</span>
      </Button>
      {open && (
        <div
          id={id}
          role="group"
          aria-label="추가 작업"
          className="absolute bottom-full right-0 z-20 mb-2 grid w-52 gap-1 rounded-2xl border border-line bg-surface p-2 shadow-lg"
        >
          {items.map(
            ({
              label,
              disabled: itemDisabled,
              onSelect,
            }) => (
              <button
                key={label}
                type="button"
                disabled={disabled || itemDisabled}
                className="rounded-xl px-3 py-3 text-left text-sm text-foreground hover:bg-primary/10 focus-visible:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-45"
                onClick={() => {
                  setOpen(false);
                  root.current
                    ?.querySelector<HTMLButtonElement>(
                      "button",
                    )
                    ?.focus();
                  onSelect();
                }}
              >
                {label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
