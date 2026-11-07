"use client";

import { ThemeSync } from "@/components/ui/theme-sync";
import { themeBootstrapScript } from "@/lib/theme/bootstrap";
import { ErrorPage } from "@/components/errors/error-page";
import "@/app/globals.css";

export default function GlobalError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeBootstrapScript,
          }}
        />
      </head>
      <body>
        <ThemeSync />
        <ErrorPage onRetry={retry} />
      </body>
    </html>
  );
}
