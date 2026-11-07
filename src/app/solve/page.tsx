import { Suspense } from "react";
import { SolveScreen } from "@/components/solving/solve-screen";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Skeleton } from "@/components/ui";

export default function SolvePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        sections={[
          ["top", "퀴즈 풀이"],
          ["site-info", "사이트 정보"],
        ]}
      />
      <main
        id="top"
        className="mx-auto w-full max-w-[1220px] flex-1 px-5 py-12 md:px-12"
      >
        <Suspense fallback={<Skeleton />}>
          <SolveScreen direct />
        </Suspense>
      </main>
      <div id="site-info">
        <Footer note="퀴즈 풀이 · 프로토타입" />
      </div>
    </div>
  );
}
