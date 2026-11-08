"use client";

import { createQueryClient } from "@/api/query-client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

export function ShopProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [client] = useState(() =>
    createQueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0 },
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
