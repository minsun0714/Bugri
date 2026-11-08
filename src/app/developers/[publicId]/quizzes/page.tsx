import { ProductLayout } from "@/components/navigation/product-layout";
import { Suspense } from "react";
import { DeveloperScreen } from "@/components/developer/developer-screen";
import { Skeleton } from "@/components/ui";

export default function DeveloperQuizzesPage() {
  return (
    <ProductLayout>
      <Suspense fallback={<Skeleton />}>
        <DeveloperScreen />
      </Suspense>
    </ProductLayout>
  );
}
