import { ProductLayout } from "@/components/navigation/product-layout";
import { Suspense } from "react";
import { DiscoveryScreen } from "@/components/discovery/discovery-screen";
import { Skeleton } from "@/components/ui";

export default function DiscoverPage() {
  return (
    <ProductLayout>
      <Suspense fallback={<Skeleton />}>
        <DiscoveryScreen />
      </Suspense>
    </ProductLayout>
  );
}
