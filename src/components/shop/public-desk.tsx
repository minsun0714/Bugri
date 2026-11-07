"use client";

import { ApiClientError } from "@/api/client";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { RecoveryHomeLink } from "@/components/errors/home-link";
import { Button, Skeleton } from "@/components/ui";
import { ProductLayout } from "@/components/navigation/product-layout";
import { DeveloperScreen } from "@/components/developer/developer-screen";
import { StreakSummary } from "@/components/streak/streak-summary";
import { ThreeView } from "@/components/shop/three-view";
import { DeskTool } from "@/api/constants";
import { ShopProvider } from "@/components/shop/provider";
import { usePublicDesk } from "@/components/shop/use-shop";
import { errorMessage } from "@/components/shop/errors";

function Profile({ publicId }: { publicId: string }) {
  const profile = usePublicDesk(publicId);
  if (profile.isPending) return <Skeleton />;
  if (profile.error && !profile.data)
    return (
      <div role="alert">
        <p>{errorMessage(profile.error)}</p>
        {profile.error instanceof ApiClientError &&
        profile.error.status === 404 ? (
          <RecoveryHomeLink />
        ) : (
          <Button
            loading={profile.isFetching}
            onClick={() => void profile.refetch()}
          >
            다시 시도
          </Button>
        )}
      </div>
    );
  if (!profile.data) return <Skeleton />;

  const { user, equipment, transforms, order } =
    profile.data;
  return (
    <>
      {profile.error && (
        <div role="alert" className="mb-4 space-y-3">
          <p>{errorMessage(profile.error)}</p>
          <div className="flex justify-end">
            <Button
              loading={profile.isFetching}
              onClick={() => void profile.refetch()}
            >
              다시 시도
            </Button>
          </div>
        </div>
      )}
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
    </>
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
                <QueryBoundary
                  key={publicId}
                  title="공개 데스크를 불러오지 못했습니다"
                >
                  <Profile publicId={publicId} />
                </QueryBoundary>
              </ShopProvider>
            </section>
          }
        />
        <ShopProvider>
          <StreakSummary
            userId="learner"
            publicId={publicId}
          />
        </ShopProvider>
      </div>
    </ProductLayout>
  );
}
