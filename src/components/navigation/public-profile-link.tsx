"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import { ShopProvider } from "@/components/shop/provider";
import { withDemoUser } from "@/components/navigation/routes";

const itemClass =
  "rounded-xl px-3 py-3 text-left text-sm font-medium text-foreground hover:bg-canvas focus-visible:outline-2 focus-visible:outline-primary";

type Props = { userId: string; onNavigate: () => void };

function useOwnPublicProfile(userId: string) {
  return useQuery({
    queryKey: ["navigation", "public-profile", userId],
    queryFn: async () => {
      const api = await createBrowserApi({
        mode: "mock",
        userId,
      });
      const users = await api.request("discoverUsers", {});
      return (
        users.find((user) => user.userId === userId) ?? null
      );
    },
  });
}

function ProfileLink({ userId, onNavigate }: Props) {
  const profile = useOwnPublicProfile(userId);

  if (profile.isPending)
    return (
      <span
        role="status"
        className="px-3 py-3 text-sm text-muted"
      >
        공개 프로필 불러오는 중…
      </span>
    );
  if (profile.isError)
    return (
      <button
        type="button"
        className={itemClass}
        onClick={() => void profile.refetch()}
      >
        공개 프로필 다시 불러오기
      </button>
    );
  if (!profile.data)
    return (
      <span
        role="status"
        className="px-3 py-3 text-sm text-muted"
      >
        공개 프로필을 찾을 수 없어요.
      </span>
    );

  return (
    <Link
      href={withDemoUser(
        `/users/${encodeURIComponent(profile.data.publicId)}`,
        userId,
      )}
      onClick={onNavigate}
      className={itemClass}
    >
      공개 프로필 보기
    </Link>
  );
}

export function PublicProfileLink(props: Props) {
  return (
    <ShopProvider>
      <ProfileLink {...props} />
    </ShopProvider>
  );
}
