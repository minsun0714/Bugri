import { useEffect, useRef, useState } from "react";

export function useMobileNavigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sync = () =>
      setActive(window.location.hash.slice(1));

    sync();
    window.addEventListener("hashchange", sync);

    return () =>
      window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node))
        setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 640px)");
    const resize = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    desktop.addEventListener("change", resize);

    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      desktop.removeEventListener("change", resize);
    };
  }, [open]);

  function selectSection(id: string) {
    setActive(id);
    setOpen(false);
    requestAnimationFrame(() => {
      const section = document.getElementById(id);

      if (section) {
        section.tabIndex = -1;
        section.focus({
          preventScroll: true,
        });
      }
    });
  }

  return {
    open,
    setOpen,
    active,
    root,
    trigger,
    selectSection,
  };
}
