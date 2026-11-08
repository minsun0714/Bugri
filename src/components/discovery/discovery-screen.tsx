"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { createQueryClient } from "@/api/query-client";

import { useState, useTransition } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { DiscoveryKind } from "@/api/constants";
import type { DiscoveryQuery } from "@/api/contracts";
import { DiscoverySearch } from "@/components/discovery/search-results";
import { useDemoSession } from "@/components/navigation/demo-session";
import { FeatureSectionShell } from "@/components/navigation/feature-section-shell";
import { Button, Modal } from "@/components/ui";
import { TagExplorer } from "@/components/discovery/tag-explorer";
import { tagDiscoveryStyles } from "@/components/discovery/styles";
import { pageTitle } from "@/components/ui/styles";

export function DiscoveryScreen({
  kind,
}: {
  kind: DiscoveryQuery["kind"];
}) {
  const t = useTranslation();

  const params = useSearchParams();
  const { signedIn, signIn } = useDemoSession();
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const isTags = kind === DiscoveryKind.HASHTAG;
  const authorize = () => {
    if (signedIn) return true;
    setLoginOpen(true);
    return false;
  };
  const [navigating, startTransition] = useTransition();
  const userId = params.get("user") ?? "learner";
  const page = Number(params.get("page") ?? 1);
  const request: DiscoveryQuery = {
    kind,
    query: params.get("query") ?? "",
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    pageSize: 20,
    ...(isTags && params.get("subscribed") === "true"
      ? { subscribedOnly: true }
      : {}),
  };
  const [client] = useState(() => createQueryClient());
  const learn = (tag: string | null) => {
    const next = new URLSearchParams({ user: userId });
    if (tag) next.set("tag", tag);
    startTransition(() => router.push(`/?${next}`));
  };

  return (
    <QueryClientProvider client={client}>
      <div className={isTags ? "space-y-5" : "space-y-6"}>
        {isTags ? (
          <div className={tagDiscoveryStyles.heading}>
            <TagExplorer />
            <h1 className={pageTitle}>{t("태그 탐색")}</h1>
          </div>
        ) : (
          <h1 className={pageTitle}>{t("개발자 탐색")}</h1>
        )}
        {signedIn && !isTags && (
          <FeatureSectionShell
            id="subscriptions"
            title={t("내 구독")}
          />
        )}
        {isTags && request.subscribedOnly && !signedIn ? (
          <div className="space-y-3">
            <p>
              {t(
                "내 구독을 보려면 데모 로그인이 필요합니다.",
              )}
            </p>
            <Button onClick={() => setLoginOpen(true)}>
              {t("데모 로그인")}
            </Button>
          </div>
        ) : (
          <DiscoverySearch
            key={userId}
            userId={userId}
            authorize={isTags ? authorize : undefined}
            showSubscriptions={isTags && signedIn}
            navigating={navigating}
            request={request}
            onLearn={learn}
            onSearch={(next) => {
              const query = new URLSearchParams({
                ...(!isTags || signedIn
                  ? { user: userId }
                  : {}),
                page: String(next.page),
              });
              if (next.query)
                query.set("query", next.query);
              if (next.subscribedOnly)
                query.set("subscribed", "true");
              startTransition(() =>
                router.push(
                  `/discover/${kind === DiscoveryKind.USER ? "developers" : "tags"}?${query}`,
                  {
                    scroll: false,
                  },
                ),
              );
            }}
          />
        )}
        <Modal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          title={t("데모 로그인이 필요합니다")}
        >
          <div className="space-y-5 p-6">
            <p>
              {t(
                "태그 구독과 학습은 데모 로그인 후 이용할 수 있습니다. 로그인 후 원하는 동작을 다시 선택해 주세요.",
              )}
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setLoginOpen(false)}
              >
                {t("취소")}
              </Button>
              <Button
                onClick={() => {
                  signIn();
                  setLoginOpen(false);
                }}
              >
                {t("데모 로그인")}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </QueryClientProvider>
  );
}
