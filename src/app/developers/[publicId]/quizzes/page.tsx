import { Suspense } from "react";
import { DeveloperScreen } from "@/components/developer/developer-screen";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Skeleton } from "@/components/ui";

export default function DeveloperQuizzesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        sections={[
          ["top", "개발자 퀴즈"],
          ["site-info", "사이트 정보"],
        ]}
      />
      <main
        id="top"
        className="mx-auto w-full max-w-[1220px] flex-1 px-5 py-12 md:px-12"
      >
        <Suspense fallback={<Skeleton />}>
          <DeveloperScreen />
        </Suspense>
      </main>
      <div id="site-info">
        <Footer note="Bugri · 학습 프로토타입" />
      </div>
    </div>
  );
}
