import { ProductLayout } from "@/components/navigation/product-layout";
import { Suspense } from "react";
import { SolveScreen } from "@/components/solving/solve-screen";
import { Skeleton } from "@/components/ui";

export default function Home() {
  return (
    <ProductLayout>
      <Suspense fallback={<Skeleton />}>
        <SolveScreen />
      </Suspense>
      <a
        href="/shop"
        className="mt-8 inline-flex rounded-xl bg-primary px-5 py-3 text-sm text-white"
      >
        BugCoin 상점 둘러보기 →
      </a>
    </ProductLayout>
  );
}
