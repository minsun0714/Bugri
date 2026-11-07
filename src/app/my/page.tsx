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
      <Link
        href={withDemoUser("/my/desk", initialUser)}
        className="inline-block rounded text-primary underline focus-visible:outline-2 focus-visible:outline-primary"
      >
        데스크 편집·보유 상품
      </Link>
      <div className="mt-10 grid gap-5">
        <FeatureSectionShell
          id="profile"
          title="프로필 편집"
        />
        <FeatureSectionShell
          id="learning-history"
          title="풀이 기록"
        />
        <CoinHistory userId={initialUser} />
        <FeatureSectionShell
          id="learning-timezone"
          title="학습 시간대 설정"
        />
      </div>
    </>
  );
}

export default function Page(props: Props) {
  return (
    <ProductLayout>
      <h1 className="mb-6 text-3xl font-semibold">
        마이페이지
      </h1>
      <Suspense
        fallback={
          <p role="status" className="p-8 text-muted">
            불러오는 중…
          </p>
        }
      >
        <Content {...props} />
      </Suspense>
    </ProductLayout>
  );
}
