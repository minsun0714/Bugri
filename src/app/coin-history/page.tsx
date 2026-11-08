import { LocalizedText } from "@/components/ui/localized-text";
import { ProductLayout } from "@/components/navigation/product-layout";
import { Suspense } from "react";
import Link from "next/link";
import { withDemoUser } from "@/components/navigation/routes";

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
      <h1 className="text-3xl font-semibold">
        <LocalizedText message="코인 내역" />
      </h1>
      <div className="mt-6">
        <CoinHistory userId={initialUser} />
        <section
          aria-labelledby="desk-shortcut"
          className="mt-8"
        >
          <Link
            id="desk-shortcut"
            href={withDemoUser("/my/desk", initialUser)}
            className="flex items-center justify-between gap-4 border-t border-line py-5 text-sm font-semibold text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
          >
            <LocalizedText message="데스크 꾸미기 바로가기" />
            <span aria-hidden="true">→</span>
          </Link>
        </section>
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
              <LocalizedText message="불러오는 중…" />
            </p>
          }
        >
          <Content {...props} />
        </Suspense>
      </div>
    </ProductLayout>
  );
}
