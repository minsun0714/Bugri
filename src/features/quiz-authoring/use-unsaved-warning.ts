"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { useEffect } from "react";

export const leaveMessage =
  "저장하지 않은 변경이 있습니다. 변경을 버리고 이동할까요?";

export function useUnsavedWarning(dirty: boolean) {
  const t = useTranslation();
  useEffect(() => {
    if (!dirty) return;

    function beforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    function click(event: MouseEvent) {
      const anchor = (event.target as Element).closest?.(
        "a",
      );
      if (
        !anchor ||
        anchor.getAttribute("href")?.startsWith("#")
      )
        return;
      if (!window.confirm(t(leaveMessage))) {
        event.preventDefault();
        event.stopPropagation();
      }
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
  }, [dirty, t]);
}
