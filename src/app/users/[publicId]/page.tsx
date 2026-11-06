import { Suspense } from "react";
import { PublicDesk } from "@/components/shop/public-desk";
import { Skeleton } from "@/components/ui";

async function UserContent({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  return <PublicDesk publicId={publicId} />;
}

export default function UserPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  return (
    <Suspense fallback={<Skeleton />}>
      <UserContent params={params} />
    </Suspense>
  );
}
