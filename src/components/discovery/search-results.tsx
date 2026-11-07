"use client";

import Link from "next/link";
import { useState } from "react";
import { DiscoveryKind } from "@/api/constants";
import type {
  DiscoveryQuery,
  SubscriptionTarget,
} from "@/api/contracts";
import {
  Button,
  Skeleton,
  TextField,
  Tabs,
} from "@/components/ui";
import { useDiscovery } from "@/components/discovery/queries";

interface DiscoverySearchProps {
  userId: string;
  navigating?: boolean;
  request: DiscoveryQuery;
  onSearch: (request: DiscoveryQuery) => void;
  onLearn: (hashtagId: string | null) => void;
}

export function DiscoverySearch(
  props: DiscoverySearchProps,
) {
  const { request, onSearch, navigating = false } = props;

  return (
    <Tabs
      items={["개발자", "태그"]}
      value={
        request.kind === DiscoveryKind.USER
          ? "개발자"
          : "태그"
      }
      label="검색 대상"
      disabled={navigating}
      panelClassName="pt-6"
      onChange={(value) =>
        onSearch({
          ...request,
          kind:
            value === "개발자"
              ? DiscoveryKind.USER
              : DiscoveryKind.HASHTAG,
          page: 1,
        })
      }
    >
      <DiscoveryResults
        key={JSON.stringify(request)}
        {...props}
      />
    </Tabs>
  );
}

function DiscoveryResults({
  userId,
  request,
  onSearch,
  onLearn,
  navigating = false,
}: DiscoverySearchProps) {
  const [input, setInput] = useState(request.query);
  const { discovery, subscribe } = useDiscovery(
    userId,
    request,
  );
  const { data } = discovery;
  const busy = subscribe.isPending || navigating;
  const totalPages = Math.max(
    1,
    Math.ceil((data?.total ?? 0) / request.pageSize),
  );

  function action(
    name: string,
    target: SubscriptionTarget,
    tag: string | null,
    subscribed: boolean,
  ) {
    return (
      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          aria-label={`${name} ${subscribed ? "구독 해제" : "구독하기"}`}
          onClick={() =>
            subscribe.mutate({ target, subscribed })
          }
        >
          {subscribed ? "구독 해제" : "구독하기"}
        </Button>
        {subscribed && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            aria-label={`${name} 학습하기`}
            onClick={() => onLearn(tag)}
          >
            학습하기
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form
        className="flex flex-wrap items-end justify-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch({
            ...request,
            query: input.trim(),
            page: 1,
          });
        }}
      >
        <div className="min-w-0 flex-1">
          <TextField
            type="search"
            label="개발자 또는 태그 검색"
            placeholder={
              request.kind === DiscoveryKind.USER
                ? "개발자 이름 또는 ID"
                : "태그 이름"
            }
            value={input}
            maxLength={100}
            disabled={busy}
            onChange={(event) =>
              setInput(event.target.value)
            }
          />
        </div>
        <Button type="submit" disabled={busy}>
          검색
        </Button>
      </form>
      {discovery.isPending && <Skeleton />}
      {discovery.error && (
        <div role="alert">
          <p>검색 결과를 불러오지 못했습니다.</p>
          <div className="flex justify-end">
            <Button
              onClick={() => void discovery.refetch()}
            >
              다시 불러오기
            </Button>
          </div>
        </div>
      )}
      {subscribe.error && (
        <p role="alert">
          구독을 저장하지 못했습니다. 입력을 유지했으니 다시
          시도해 주세요.
        </p>
      )}
      {data && !discovery.isError && (
        <section
          aria-label={
            request.kind === DiscoveryKind.USER
              ? "개발자 검색 결과"
              : "태그 검색 결과"
          }
          className="space-y-4"
        >
          <p role="status" className="text-sm text-muted">
            검색 결과 {data.total.toLocaleString()}개 ·{" "}
            {data.page}페이지
          </p>
          {data.items.length ? (
            <ul className="grid gap-4 md:grid-cols-2">
              {data.items.map((item) => {
                if (item.type === DiscoveryKind.USER) {
                  const {
                    user: {
                      userId: id,
                      displayName,
                      publicId,
                    },
                    subscribed,
                  } = item;

                  return (
                    <li
                      key={id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5"
                    >
                      <div className="min-w-0 break-all">
                        <Link
                          href={`/developers/${encodeURIComponent(publicId)}/quizzes?user=${encodeURIComponent(userId)}`}
                          className="font-bold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
                        >
                          {displayName}
                        </Link>
                        <div className="text-sm text-muted">
                          @{publicId}
                        </div>
                      </div>
                      {action(
                        displayName,
                        {
                          type: "PERSON",
                          authorUserId: id,
                        },
                        null,
                        subscribed,
                      )}
                    </li>
                  );
                }
                const {
                  hashtag: { id, name },
                  subscribed,
                } = item;

                return (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5"
                  >
                    <strong className="min-w-0 break-all">
                      {name}
                    </strong>
                    {action(
                      name,
                      { type: "HASHTAG", hashtagId: id },
                      id,
                      subscribed,
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>
              검색 결과가 없습니다. 검색어나 검색 대상을
              바꿔 보세요.
            </p>
          )}
          {totalPages > 1 && (
            <nav
              aria-label="검색 결과 페이지"
              className="flex flex-wrap items-center justify-end gap-4"
            >
              <Button
                variant="secondary"
                disabled={request.page <= 1 || busy}
                onClick={() =>
                  onSearch({
                    ...request,
                    page: request.page - 1,
                  })
                }
              >
                이전 페이지
              </Button>
              <span>
                {data.page} /{" "}
                {Math.max(totalPages, data.page)}
              </span>
              <Button
                variant="secondary"
                disabled={
                  request.page >= totalPages || busy
                }
                onClick={() =>
                  onSearch({
                    ...request,
                    page: request.page + 1,
                  })
                }
              >
                다음 페이지
              </Button>
            </nav>
          )}
        </section>
      )}
    </div>
  );
}
