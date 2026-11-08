"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import type { ReactNode } from "react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { RouteBreadcrumb } from "@/components/navigation/route-breadcrumb";

export function ProductLayout({
  children,
  footerNote = "Bugri · 학습 프로토타입",
}: {
  children: ReactNode;
  footerNote?: string;
}) {
  const t = useTranslation();

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[1220px] flex-1 px-5 py-10 md:px-12">
        <RouteBreadcrumb />
        {children}
      </main>
      <div id="site-info">
        <Footer note={t(footerNote)} />
      </div>
    </div>
  );
}
