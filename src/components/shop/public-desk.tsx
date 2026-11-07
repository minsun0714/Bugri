"use client";

import Link from "next/link";
import { Button, Skeleton } from "@/components/ui";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { ThreeView } from "@/components/shop/three-view";
import { DeskTool } from "@/api/constants";
import { ShopProvider } from "@/components/shop/provider";
import { usePublicDesk } from "@/components/shop/use-shop";
import { errorMessage } from "@/components/shop/errors";

function Profile({ publicId }: { publicId: string }) {
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
      <p className="mb-3 text-xs font-bold tracking-[.2em] text-primary">
        A LITTLE SPACE BY
      </p>
      <h1 className="text-3xl">
        {user.displayName}의 데스크
      </h1>
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
    <ShopProvider>
      <Header
        preview={false}
        sections={[["top", "데스크"]]}
      />
      <main
        id="top"
        className="mx-auto min-h-[70vh] max-w-4xl px-5 py-10"
      >
        <Profile publicId={publicId} />
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-xl bg-primary px-5 py-3 text-sm text-white"
        >
          상점으로 돌아가기
        </Link>
      </main>
      <Footer note="Bugri · 이웃의 공간" />
    </ShopProvider>
  );
}
