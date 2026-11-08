import { LocalizedText } from "@/components/ui/localized-text";
import { Suspense } from "react";
import { DemoSessionProvider } from "@/components/navigation/demo-session";
import { ThemeSync } from "@/components/ui/theme-sync";
import { themeBootstrapScript } from "@/lib/theme/bootstrap";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_KR } from "next/font/google";
import "@/app/globals.css";

const ibmPlexSansKr = IBM_Plex_Sans_KR({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  preload: false,
  variable: "--font-ibm-plex-sans-kr",
});

export const metadata: Metadata = {
  title: "Bugri | 퀴즈 관리 플랫폼",
  description:
    "업무 중 배운 개발 지식을 퀴즈로 복습하는 Bugri",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={ibmPlexSansKr.variable}
      suppressHydrationWarning
    >
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
