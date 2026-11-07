"use client";

import { createQueryClient } from "@/api/query-client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

export function AuthoringQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [client] = useState(() =>
    createQueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
          refetchOnWindowFocus: false,
        },
        mutations: { retry: false },
      },
    }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}
