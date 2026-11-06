import { Suspense } from "react";
import { SolveScreen } from "@/components/solving/solve-screen";
import { Skeleton } from "@/components/ui";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        sections={[
          ["top", "홈"],
          ["site-info", "사이트 정보"],
        ]}
      />
      <main
        id="top"
        className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:px-12"
      >
        <Suspense fallback={<Skeleton />}>
          <SolveScreen />
        </Suspense>
      </main>
      <div id="site-info">
        <Footer note="Bugri · 학습 프로토타입" />
      </div>
    </div>
  );
}
