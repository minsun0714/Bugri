import { Suspense } from "react";
import { ProductLayout } from "@/components/navigation/product-layout";
import { HistoryScreen } from "@/components/learning-history/history-screen";
import { Skeleton } from "@/components/ui";

export default function Page() {
  return (
    <ProductLayout>
      <Suspense fallback={<Skeleton />}>
        <HistoryScreen />
      </Suspense>
    </ProductLayout>
  );
}
