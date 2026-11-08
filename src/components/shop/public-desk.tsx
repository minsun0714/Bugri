"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

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
  const t = useTranslation();

  const profile = usePublicDesk(publicId);
  if (profile.isPending) return <Skeleton />;
  if (profile.error && !profile.data)
    return (
      <div role="alert">
        <p>{t(errorMessage(profile.error))}</p>
        {profile.error instanceof ApiClientError &&
        profile.error.status === 404 ? (
          <RecoveryHomeLink />
        ) : (
          <Button
            loading={profile.isFetching}
            onClick={() => void profile.refetch()}
          >
            {t("다시 시도")}
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
          <p>{t(errorMessage(profile.error))}</p>
          <div className="flex justify-end">
            <Button
              loading={profile.isFetching}
              onClick={() => void profile.refetch()}
            >
              {t("다시 시도")}
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
        label={t("{0}의 데스크", { 0: user.displayName })}
      />
    </>
  );
}

export function PublicDesk({
  publicId,
}: {
  publicId: string;
}) {
  const t = useTranslation();

  return (
    <ProductLayout>
      <div className="space-y-8">
        <DeveloperScreen
          profile
          activity={
            <ShopProvider>
              <StreakSummary
                userId="learner"
                publicId={publicId}
              />
            </ShopProvider>
          }
          afterHeader={
            <section
              aria-label={t("공개 데스크")}
              className="rounded-3xl border border-line bg-surface p-4"
            >
              <ShopProvider>
                <QueryBoundary
                  key={publicId}
                  title={t(
                    "공개 데스크를 불러오지 못했습니다",
                  )}
                >
                  <Profile publicId={publicId} />
                </QueryBoundary>
              </ShopProvider>
            </section>
          }
        />
      </div>
    </ProductLayout>
  );
}
