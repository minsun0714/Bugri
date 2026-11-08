"use client";

import { GuestLanding } from "@/components/landing/guest-landing";
import { Suspense } from "react";
import { SolveScreen } from "@/components/solving/solve-screen";
import { Skeleton } from "@/components/ui";
import { useDemoSession } from "@/components/navigation/demo-session";

export function HomeSections() {
  const { signedIn } = useDemoSession();

  return (
    <div className="space-y-6">
      {!signedIn && <GuestLanding />}
      <div
        id={!signedIn ? "guest-quiz" : undefined}
        tabIndex={signedIn ? undefined : -1}
        className="scroll-mt-8 rounded-2xl"
      >
        <Suspense fallback={<Skeleton />}>
          <SolveScreen showStreak={signedIn} />
        </Suspense>
      </div>
    </div>
  );
}
