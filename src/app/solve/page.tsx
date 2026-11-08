import { ProductLayout } from "@/components/navigation/product-layout";
import { Suspense } from "react";
import { SolveScreen } from "@/components/solving/solve-screen";
import { Skeleton } from "@/components/ui";

export default function SolvePage() {
  return (
    <ProductLayout>
      <Suspense fallback={<Skeleton />}>
        <SolveScreen direct />
      </Suspense>
    </ProductLayout>
  );
}
