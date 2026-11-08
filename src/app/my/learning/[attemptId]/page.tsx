import { Suspense } from "react";
import { ProductLayout } from "@/components/navigation/product-layout";
import { HistoryScreen } from "@/components/learning-history/history-screen";
import { Skeleton } from "@/components/ui";

async function Content({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  return <HistoryScreen attemptId={attemptId} />;
}

export default function Page(props: {
  params: Promise<{ attemptId: string }>;
}) {
  return (
    <ProductLayout>
      <Suspense fallback={<Skeleton />}>
        <Content {...props} />
      </Suspense>
    </ProductLayout>
  );
}
