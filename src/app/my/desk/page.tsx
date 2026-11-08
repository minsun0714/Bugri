import { LocalizedText } from "@/components/ui/localized-text";
import { ProductLayout } from "@/components/navigation/product-layout";
import { Suspense } from "react";
import { ShopApp } from "@/components/shop/shop-app";

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
            <LocalizedText message="불러오는 중…" />
          </p>
        }
      >
        <Content {...props} />
      </Suspense>
    </ProductLayout>
  );
}
