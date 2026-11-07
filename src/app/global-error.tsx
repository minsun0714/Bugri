"use client";

import { ErrorPage } from "@/components/errors/error-page";
import "@/app/globals.css";

export default function GlobalError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="ko">
      <body>
        <ErrorPage onRetry={retry} />
      </body>
    </html>
  );
}
