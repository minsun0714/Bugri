"use client";

import { useEffect } from "react";

/** Blocks tab close with the browser prompt and in-app link clicks with the caller's own dialog. */
export function useLeaveGuard(
  active: boolean,
  onBlocked: (href: string) => void,
) {
  useEffect(() => {
    if (!active) return;

    function beforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    function click(event: MouseEvent) {
      const anchor = (event.target as Element).closest?.(
        "a[href]",
      );

      const href = anchor?.getAttribute("href");

      if (
        !anchor ||
        !href ||
        href.startsWith("#") ||
        anchor.getAttribute("target") === "_blank"
      )
        return;

      event.preventDefault();
      event.stopPropagation();
      onBlocked(href);
    }

    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click, true);

    return () => {
      window.removeEventListener(
        "beforeunload",
        beforeUnload,
      );
      document.removeEventListener("click", click, true);
    };
  }, [active, onBlocked]);
}
