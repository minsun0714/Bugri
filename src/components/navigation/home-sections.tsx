"use client";

import { Suspense } from "react";
import { SolveScreen } from "@/components/solving/solve-screen";
import { Skeleton } from "@/components/ui";
import { useDemoSession } from "@/components/navigation/demo-session";
import { FeatureSectionShell } from "@/components/navigation/feature-section-shell";

export function HomeSections() {
  const { signedIn } = useDemoSession();

  return (
    <div className="space-y-6">
      <FeatureSectionShell
        id={
          signedIn ? "learning-streak" : "guest-quiz-trial"
        }
        title={signedIn ? "연속 학습" : "랜덤 퀴즈 체험"}
      />
      <Suspense fallback={<Skeleton />}>
        <SolveScreen />
      </Suspense>
    </div>
  );
}
