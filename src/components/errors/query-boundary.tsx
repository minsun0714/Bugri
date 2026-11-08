"use client";
import { LocalizedText } from "@/components/ui/localized-text";

import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { catchError, type ErrorInfo } from "next/error";
import type { ReactNode } from "react";
import { getErrorMessage } from "@/api/errors";
import { Button } from "@/components/ui";

const Boundary = catchError(function QueryFallback(
  {
    title,
    resetQuery,
  }: { title: string; resetQuery: () => void },
  { error, retry }: ErrorInfo,
) {
  return (
    <div role="alert" className="space-y-4">
      <h2 className="text-lg leading-snug font-bold break-keep text-foreground">
        {title}
      </h2>
      <p className="text-sm leading-6 text-muted">
        <LocalizedText message={getErrorMessage(error)} />
      </p>
      <div className="flex flex-wrap justify-end gap-3">
        <Button
          onClick={() => {
            resetQuery();
            retry();
          }}
        >
          <LocalizedText message="다시 시도" />
        </Button>
      </div>
    </div>
  );
});

export function QueryBoundary({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <Boundary title={title} resetQuery={reset}>
          {children}
        </Boundary>
      )}
    </QueryErrorResetBoundary>
  );
}
