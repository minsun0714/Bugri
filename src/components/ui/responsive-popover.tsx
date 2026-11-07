"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui";

/** An anchored desktop dialog and modal bottom sheet on small screens. */
export function ResponsivePopover({
  title,
  label,
  children,
}: {
  title: string;
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDialogElement>(null);
  const id = useId();
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const dialog = panel.current!;
    const opener = trigger.current;
    let restoreFocus = true;
    const previousOverflow = document.body.style.overflow;
    const media = window.matchMedia("(min-width: 640px)");
    function position() {
      if (!media.matches || !trigger.current) return;
      const rect = trigger.current.getBoundingClientRect();
      const height = dialog.getBoundingClientRect().height;
      dialog.style.left = `${Math.max(8, Math.min(rect.right - 384, window.innerWidth - 392))}px`;
      dialog.style.top = `${Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - height - 8))}px`;
    }
    function show() {
      dialog.close();
      dialog.style.removeProperty("left");
      dialog.style.removeProperty("top");
      document.body.style.overflow = media.matches
        ? previousOverflow
        : "hidden";
      if (media.matches) dialog.show();
      else dialog.showModal();
      position();
      dialog
        .querySelector<HTMLButtonElement>(
          "[data-panel-close]",
        )
        ?.focus();
    }
    function outside(event: PointerEvent) {
      if (
        media.matches &&
        !dialog.contains(event.target as Node) &&
        !trigger.current?.contains(event.target as Node)
      ) {
        restoreFocus = false;
        setOpen(false);
      }
    }
    function focusOutside(event: FocusEvent) {
      if (
        media.matches &&
        !dialog.contains(event.target as Node) &&
        event.target !== opener &&
        !document.querySelector("dialog:modal")
      ) {
        restoreFocus = false;
        setOpen(false);
      }
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    }
    show();
    media.addEventListener("change", show);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", focusOutside);
    dialog.addEventListener("keydown", escape);
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      media.removeEventListener("change", show);
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", focusOutside);
      dialog.removeEventListener("keydown", escape);
      if (restoreFocus) opener?.focus();
    };
  }, [open]);

  return (
    <>
      <Button
        ref={trigger}
        variant="secondary"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {label}
      </Button>
      <dialog
        ref={panel}
        id={id}
        aria-labelledby={titleId}
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect =
              event.currentTarget.getBoundingClientRect();
            if (
              event.clientY < rect.top ||
              event.clientX < rect.left ||
              event.clientX > rect.right
            )
              setOpen(false);
          }
        }}
        className="fixed inset-x-0 top-auto bottom-0 z-50 m-0 max-h-[85dvh] [&[open]]:flex [&[open]]:flex-col w-full max-w-none overflow-hidden rounded-t-3xl border border-line bg-surface p-4 text-foreground shadow-xl backdrop:bg-foreground/30 sm:inset-auto sm:w-96 sm:rounded-2xl sm:p-5"
      >
        <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
          <h2 id={titleId} className="text-base">
            {title}
          </h2>
          <Button
            data-panel-close
            variant="ghost"
            aria-label={`${title} 닫기`}
            onClick={() => setOpen(false)}
            className="!min-h-11 !min-w-11 !p-2"
          >
            ×
          </Button>
        </div>
        {open && children}
      </dialog>
    </>
  );
}
