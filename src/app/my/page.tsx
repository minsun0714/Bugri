import { ProductLayout } from "@/components/navigation/product-layout";
import { Suspense } from "react";
import { ShopApp } from "@/components/shop/shop-app";
import { FeatureSectionShell } from "@/components/navigation/feature-section-shell";

type Props = { searchParams: Promise<{ user?: string }> };

async function Content({ searchParams }: Props) {
  const { user } = await searchParams;
  const initialUser =
    user === "author" || user === "friend"
      ? user
      : "learner";
  return (
    <ShopApp editing embedded initialUser={initialUser} />
  );
}

export default function Page(props: Props) {
  return (
    <ProductLayout>
      <Suspense
        fallback={
          <p role="status" className="p-8 text-muted">
            불러오는 중…
          </p>
        }
      >
        <Content {...props} />
      </Suspense>
      <div className="mt-10 grid gap-5">
        <FeatureSectionShell
          id="profile"
          title="내 프로필"
        />
        <FeatureSectionShell
          id="learning-history"
          title="학습 기록"
        />
        <FeatureSectionShell
          id="bugcoin-history"
          title="BugCoin 내역"
        />
        <FeatureSectionShell
          id="learning-timezone"
          title="학습 시간대 설정"
        />
      </div>
    </ProductLayout>
  );
}
