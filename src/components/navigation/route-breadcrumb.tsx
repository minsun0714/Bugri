"use client";

import { Suspense } from "react";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";
import { useDemoSession } from "@/components/navigation/demo-session";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getBreadcrumbs } from "@/components/navigation/routes";

function CurrentBreadcrumb() {
  const pathname = usePathname();
  const params = useSearchParams();
  const { signedIn } = useDemoSession();

  return (
    <Breadcrumb
      items={getBreadcrumbs(
        pathname,
        signedIn ? (params.get("user") ?? "learner") : null,
      )}
    />
  );
}

export function RouteBreadcrumb() {
  return (
    <Suspense fallback={null}>
      <CurrentBreadcrumb />
    </Suspense>
  );
}
