"use client";

import { Button, Skeleton } from "@/components/ui";
import { ProductLayout } from "@/components/navigation/product-layout";
import { DeveloperScreen } from "@/components/developer/developer-screen";
import { FeatureSectionShell } from "@/components/navigation/feature-section-shell";
import { ThreeView } from "@/components/shop/three-view";
import { DeskTool } from "@/api/constants";
import { ShopProvider } from "@/components/shop/provider";
import { usePublicDesk } from "@/components/shop/use-shop";
import { errorMessage } from "@/components/shop/errors";

function Profile({ publicId }: { publicId: string }) {
  const profile = usePublicDesk(publicId);
  if (profile.isPending) return <Skeleton />;
  if (profile.error)
    return (
      <div role="alert">
        <p>{errorMessage(profile.error)}</p>
        <Button onClick={() => void profile.refetch()}>
          다시 시도
        </Button>
      </div>
    );
  const { user, equipment, transforms, order } =
    profile.data;
  return (
    <ThreeView
      showViewPresets={false}
      readOnly
      disabled={false}
      selected={null}
      tool={DeskTool.CAMERA}
      equipment={equipment}
      transforms={transforms}
      layerOrder={order}
      label={`${user.displayName}의 데스크`}
    />
  );
}

export function PublicDesk({
  publicId,
}: {
  publicId: string;
}) {
  return (
    <ProductLayout>
      <div className="space-y-8">
        <DeveloperScreen
          profile
          afterHeader={
            <section
              aria-label="공개 데스크"
              className="rounded-3xl border border-line bg-surface p-4"
            >
              <ShopProvider>
                <Profile publicId={publicId} />
              </ShopProvider>
            </section>
          }
        />
        <FeatureSectionShell
          id="learning-activity"
          title="학습 활동"
        />
      </div>
    </ProductLayout>
  );
}
