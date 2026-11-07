import { Suspense } from "react";
import { ProductLayout } from "@/components/navigation/product-layout";
import { Skeleton } from "@/components/ui";
import { TagCatalogScreen } from "@/components/tag-catalog/tag-catalog-screen";

export default function TagQuizzesPage() {
  return (
    <ProductLayout>
      <Suspense fallback={<Skeleton />}>
        <TagCatalogScreen />
      </Suspense>
    </ProductLayout>
  );
}
