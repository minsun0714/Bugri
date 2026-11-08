import { ProductLayout } from "@/components/navigation/product-layout";
import { SolveScreen } from "@/components/solving/solve-screen";
import { Skeleton } from "@/components/ui";
import { Suspense } from "react";

export default function SolvePage() {
  return (
    <ProductLayout>
      <Suspense fallback={<Skeleton />}>
        <SolveScreen />
      </Suspense>
    </ProductLayout>
  );
}
