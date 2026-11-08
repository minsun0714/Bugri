import { ProductLayout } from "@/components/navigation/product-layout";
import { Suspense } from "react";
import { DeveloperDiscovery } from "@/components/discovery/developer-discovery";
import { Skeleton } from "@/components/ui";

export default function DiscoverPage() {
  return (
    <ProductLayout>
      <Suspense fallback={<Skeleton />}>
        <DeveloperDiscovery />
      </Suspense>
    </ProductLayout>
  );
}
