"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { useSyncExternalStore } from "react";
import { styles } from "@/components/ui/styles";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);

  return () =>
    window.removeEventListener("popstate", onChange);
}

export function RecoveryHomeLink({
  secondary = false,
}: {
  secondary?: boolean;
}) {
  const t = useTranslation();

  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
  const user = new URLSearchParams(search).get("user");
  const href = user
    ? `/?${new URLSearchParams({ user })}`
    : "/";

  // Full navigation recovers a broken root layout/router without session context.
  return (
    <a
      href={href}
      className={`${styles["ui-button"]} ${secondary ? "secondary" : "primary"}`}
    >
      {t("홈으로 이동")}
    </a>
  );
}
