"use client";

import { Suspense } from "react";
import { SolveScreen } from "@/components/solving/solve-screen";
import { Skeleton } from "@/components/ui";
import { useDemoSession } from "@/components/navigation/demo-session";

export function HomeSections() {
  const { signedIn } = useDemoSession();

  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton />}>
        <SolveScreen showStreak={signedIn} />
      </Suspense>
    </div>
  );
}
