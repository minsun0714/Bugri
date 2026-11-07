import { Suspense } from "react";
import { ShopApp } from "@/components/shop/shop-app";

type Props = { searchParams: Promise<{ user?: string }> };

async function Content({ searchParams }: Props) {
  const { user } = await searchParams;
  const initialUser =
    user === "author" || user === "friend"
      ? user
      : "learner";
  return <ShopApp initialUser={initialUser} />;
}

export default function Page(props: Props) {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-muted">
          불러오는 중…
        </p>
      }
    >
      <Content {...props} />
    </Suspense>
  );
}
