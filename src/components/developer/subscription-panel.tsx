"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import type { SubscriptionTarget } from "@/api/contracts";
import { useSubscribe } from "@/components/discovery/queries";
import { Button, TextField } from "@/components/ui";
import { ResponsivePopover } from "@/components/ui/responsive-popover";
import { useDemoSession } from "@/components/navigation/demo-session";

export function DeveloperSubscriptionPanel({
  userId,
  publicId,
  authorUserId,
  subscribed,
}: {
  userId: string;
  publicId: string;
  authorUserId: string;
  subscribed: boolean;
}) {
  const t = useTranslation();

  return (
    <ResponsivePopover
      title={t("구독 설정")}
      label={t("구독 설정")}
    >
      <SubscriptionContents
        userId={userId}
        publicId={publicId}
        authorUserId={authorUserId}
        subscribed={subscribed}
      />
    </ResponsivePopover>
  );
}

function SubscriptionContents({
  userId,
  publicId,
  authorUserId,
  subscribed,
}: {
  userId: string;
  publicId: string;
  authorUserId: string;
  subscribed: boolean;
}) {
  const t = useTranslation();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { signedIn, signIn } = useDemoSession();
  const mutation = useSubscribe(userId);
  const request = { publicId, query, page, pageSize: 5 };
  const tags = useQuery({
    queryKey: ["developerTags", userId, request],
    queryFn: async () =>
      (
        await createBrowserApi({ mode: "mock", userId })
      ).request("developerTags", request),
    retry: false,
  });
  function control(
    name: string,
    target: SubscriptionTarget,
    current: boolean,
  ) {
    return (
      <button
        type="button"
        role="switch"
        aria-label={t("{0} 구독", { 0: name })}
        aria-checked={signedIn && current}
        aria-disabled={mutation.isPending}
        className="min-h-11 shrink-0 rounded-xl px-3 text-sm font-semibold text-muted aria-checked:bg-primary/10 aria-checked:text-primary focus-visible:outline-2 focus-visible:outline-primary"
        onClick={(event) => {
          if (mutation.isPending) return;
          if (!signedIn) {
            const trigger = event.currentTarget;
            signIn({ onCancel: () => trigger.focus() });
            return;
          }
          void mutation
            .mutateAsync({ target, subscribed: current })
            .catch(() => undefined);
        }}
      >
        {signedIn && current ? t("✓ 구독 중") : t("+ 구독")}
      </button>
    );
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line pb-3">
        <span className="text-sm font-semibold">
          {t("이 개발자의 모든 퀴즈")}
        </span>
        {control(
          t("개발자 전체"),
          { type: "PERSON", authorUserId },
          subscribed,
        )}
      </div>
      <div className="shrink-0">
        <TextField
          label={t("태그별 구독")}
          placeholder={t("구독할 태그 검색")}
          type="search"
          value={query}
          maxLength={100}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
      </div>
      <div
        className="min-h-0 flex-[0_1_16rem] overflow-y-auto overscroll-contain"
        aria-busy={tags.isFetching}
      >
        {tags.isPending ? (
          <p
            role="status"
            className="p-3 text-sm text-muted"
          >
            {t("불러오는 중…")}
          </p>
        ) : tags.error ? (
          <div role="alert">
            <p>{t("태그를 불러오지 못했습니다.")}</p>
            <Button onClick={() => void tags.refetch()}>
              {t("다시 불러오기")}
            </Button>
          </div>
        ) : (
          <ul>
            {tags.data.items.map(
              ({ id, name, subscribed: tagSubscribed }) => (
                <li
                  key={id}
                  className="flex min-h-12 items-center justify-between gap-2 border-b border-line/60"
                >
                  <span className="min-w-0 break-all text-sm">
                    {name}
                  </span>
                  {control(
                    name,
                    {
                      type: "PERSON_HASHTAG",
                      authorUserId,
                      hashtagId: id,
                    },
                    tagSubscribed,
                  )}
                </li>
              ),
            )}
            {!tags.data.items.length && (
              <li className="py-6 text-sm text-muted">
                {t("검색된 태그가 없습니다.")}
              </li>
            )}
          </ul>
        )}
      </div>
      {mutation.error && (
        <p role="alert" className="text-sm">
          {t(
            "구독을 저장하지 못했습니다. 다시 눌러 주세요.",
          )}
        </p>
      )}
      <nav
        aria-label={t("구독 태그 페이지")}
        className="flex shrink-0 items-center justify-end gap-2 border-t border-line pt-2"
      >
        <Button
          variant="ghost"
          disabled={page <= 1 || tags.isFetching}
          onClick={() => setPage(page - 1)}
        >
          {t("이전")}
        </Button>
        <span className="text-sm text-muted">
          {page} /{" "}
          {Math.max(
            1,
            Math.ceil((tags.data?.total ?? 0) / 5),
          )}
        </span>
        <Button
          variant="ghost"
          disabled={
            !tags.data ||
            page * 5 >= tags.data.total ||
            tags.isFetching
          }
          onClick={() => setPage(page + 1)}
        >
          {t("다음")}
        </Button>
      </nav>
    </div>
  );
}
