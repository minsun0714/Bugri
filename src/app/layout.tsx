import { LocalizedText } from "@/components/ui/localized-text";
import { Suspense } from "react";
import { DemoSessionProvider } from "@/components/navigation/demo-session";
import { ThemeSync } from "@/components/ui/theme-sync";
import { themeBootstrapScript } from "@/lib/theme/bootstrap";
import type { Metadata, Viewport } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Bugri | 퀴즈 관리 플랫폼",
  description:
    "퀴즈를 만들고 공유하며, 구독으로 함께 성장하는 Bugri",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
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
        <Suspense
          fallback={
            <p role="status">
              <LocalizedText message="불러오는 중…" />
            </p>
          }
        >
          <DemoSessionProvider>
            {children}
          </DemoSessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
