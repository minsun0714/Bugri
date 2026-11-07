import { styles } from "@/components/ui/styles";
import { ProductLayout } from "@/components/navigation/product-layout";
import { Suspense } from "react";
import Link from "next/link";
import { withDemoUser } from "@/components/navigation/routes";
import { FeatureSectionShell } from "@/components/navigation/feature-section-shell";

import { CoinHistory } from "@/components/coins/coin-history";

type Props = { searchParams: Promise<{ user?: string }> };

async function Content({ searchParams }: Props) {
  const { user } = await searchParams;
  const initialUser =
    user === "author" || user === "friend"
      ? user
      : "learner";
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h1 className="text-3xl font-semibold">
          마이페이지
        </h1>
        <Link
          href={withDemoUser("/my/desk", initialUser)}
          className={`${styles["ui-button"]} secondary md ml-auto no-underline`}
        >
          데스크 편집·보유 상품
        </Link>
      </div>
      <div className="mt-6">
        <CoinHistory userId={initialUser} />
        <div className="mt-8">
          <FeatureSectionShell
            compact
            id="profile"
            title="프로필 편집"
          />
          <FeatureSectionShell
            compact
            id="learning-history"
            title="풀이 기록"
          />
          <FeatureSectionShell
            compact
            id="learning-timezone"
            title="학습 시간대 설정"
          />
        </div>
      </div>
    </>
  );
}

export default function Page(props: Props) {
  return (
    <ProductLayout>
      <div>
        <Suspense
          fallback={
            <p role="status" className="p-8 text-muted">
              불러오는 중…
            </p>
          }
        >
          <Content {...props} />
        </Suspense>
      </div>
    </ProductLayout>
  );
}
