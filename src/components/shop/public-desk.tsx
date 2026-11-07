"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDemoSession } from "@/components/navigation/demo-session";
import { withDemoUser } from "@/components/navigation/routes";
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
  const { signedIn } = useDemoSession();
  const searchParams = useSearchParams();
  const viewer = searchParams.get("user");
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
    <>
      <h2 className="text-xl font-semibold">데스크</h2>
      {signedIn &&
        user.userId === (viewer ?? "learner") && (
          <Link
            href={withDemoUser(
              "/my/desk",
              viewer ?? "learner",
            )}
            className="mt-4 inline-block rounded text-primary underline focus-visible:outline-2 focus-visible:outline-primary"
          >
            데스크 편집
          </Link>
        )}
      <div className="my-7 rounded-3xl border border-line bg-surface p-3">
        <ThreeView
          readOnly
          disabled={false}
          selected={null}
          tool={DeskTool.CAMERA}
          equipment={equipment}
          transforms={transforms}
          layerOrder={order}
          label={`${user.displayName}의 데스크`}
        />
      </div>
      <p className="text-sm text-muted">
        {Object.keys(equipment).length
          ? "좋아하는 물건으로 채운 작은 작업 공간."
          : "아직 장착한 아이템이 없어 기본 데스크를 보여드려요."}
      </p>
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
        <DeveloperScreen profile />
        <FeatureSectionShell
          id="learning-activity"
          title="학습 활동"
        />
        <section
          aria-label="공개 데스크"
          className="rounded-3xl border border-line bg-surface p-5 sm:p-8"
        >
          <ShopProvider>
            <Profile publicId={publicId} />
          </ShopProvider>
        </section>
      </div>
    </ProductLayout>
  );
}
