import { Suspense } from "react";
import { DemoSessionProvider } from "@/components/navigation/demo-session";
import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Bugri | 퀴즈 관리 플랫폼",
  description:
    "퀴즈를 만들고 공유하며, 구독으로 함께 성장하는 Bugri",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>
        <Suspense
          fallback={<p role="status">불러오는 중…</p>}
        >
          <DemoSessionProvider>
            {children}
          </DemoSessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
