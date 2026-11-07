"use client";

import { ErrorPage } from "@/components/errors/error-page";

export default function RouteError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <ErrorPage onRetry={retry} />;
}
