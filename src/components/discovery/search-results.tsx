"use client";

import Link from "next/link";
import { tagDiscoveryStyles } from "@/components/discovery/styles";
import { SubscriptionMenu } from "@/components/discovery/subscription-menu";
import { useEffect, useRef, useState } from "react";
import { DiscoveryKind } from "@/api/constants";
import type {
  DiscoveryQuery,
  SubscriptionTarget,
} from "@/api/contracts";
import {
  Button,
  Skeleton,
  TextField,
  Toast,
} from "@/components/ui";
import { useDiscovery } from "@/components/discovery/queries";

interface DiscoverySearchProps {
  authorize?: () => boolean;
  showSubscriptions?: boolean;
  userId: string;
  navigating?: boolean;
  request: DiscoveryQuery;
  onSearch: (request: DiscoveryQuery) => void;
  onLearn: (hashtagId: string | null) => void;
}

export function DiscoverySearch({
  userId,
  request,
  onSearch,
  onLearn,
  navigating = false,
  authorize,
  showSubscriptions = false,
}: DiscoverySearchProps) {
  const isTags = request.kind === DiscoveryKind.HASHTAG;
  const [input, setInput] = useState(request.query);
  const [previousQuery, setPreviousQuery] = useState(
    request.query,
  );
  if (previousQuery !== request.query) {
    setPreviousQuery(request.query);
    setInput(request.query);
  }
  const root = useRef<HTMLDivElement>(null);
  const results = useRef<HTMLParagraphElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const searchFocus = useRef(false);
  const invalidInput = Array.from(input).length > 100;
  const invalidQuery =
    Array.from(request.query).length > 100;
  const [toast, setToast] = useState<string | null>(null);
  const requestKey = JSON.stringify(request);
  const [feedbackRequest, setFeedbackRequest] =
    useState(requestKey);
  if (feedbackRequest !== requestKey) {
    setFeedbackRequest(requestKey);
    setToast(null);
  }
  const { discovery, subscribe } = useDiscovery(
    userId,
    request,
  );
  const { data } = discovery;
  const { reset } = subscribe;
  useEffect(() => reset(), [requestKey, reset]);
  const busy = subscribe.isPending || navigating;
  const totalPages = Math.max(
    1,
    Math.ceil((data?.total ?? 0) / request.pageSize),
  );

  useEffect(() => {
    if (busy || discovery.isPending) return;
    if (pendingFocus.current) {
      const button = Array.from(
        root.current?.querySelectorAll<HTMLButtonElement>(
          "button[aria-label]",
        ) ?? [],
      ).find(
        (node) =>
          node.getAttribute("aria-label") ===
          pendingFocus.current,
      );
      (button ?? results.current)?.focus();
      pendingFocus.current = null;
    } else if (searchFocus.current) {
      results.current?.focus();
      searchFocus.current = false;
    }
  }, [busy, discovery.isPending, data, toast]);

  function search(next: DiscoveryQuery) {
    searchFocus.current = true;
    onSearch(next);
  }

  function action(
    name: string,
    target: SubscriptionTarget,
    tag: string | null,
    subscribed: boolean,
    publicQuizCount?: number,
  ) {
    function toggleSubscription() {
      if (authorize && !authorize()) return;
      const message =
        target.type === "HASHTAG"
          ? subscribed
            ? `${name} 태그 구독을 취소했습니다.`
            : `${name} 태그를 구독했습니다.`
          : subscribed
            ? `${name}님 구독을 취소했습니다.`
            : `${name}님을 구독했습니다.`;

      void subscribe
        .mutateAsync({ target, subscribed })
        .then(() => {
          pendingFocus.current = subscribed
            ? `${name} 구독하기`
            : publicQuizCount === 0
              ? `${name} 구독 메뉴`
              : `${name} 학습하기`;
          setToast(message);
        })
        .catch(() => undefined);
    }

    return (
      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        {subscribed ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              className={
                isTags
                  ? tagDiscoveryStyles.learn
                  : "!min-h-11"
              }
              disabled={busy || publicQuizCount === 0}
              aria-label={`${name} 학습하기`}
              onClick={() => {
                if (!authorize || authorize()) onLearn(tag);
              }}
            >
              학습하기
              {isTags && <span aria-hidden="true">→</span>}
            </Button>
            <SubscriptionMenu
              name={name}
              busy={busy}
              onUnsubscribe={toggleSubscription}
            />
          </>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            className={
              isTags
                ? tagDiscoveryStyles.subscribe
                : "!min-h-11"
            }
            disabled={busy}
            aria-label={`${name} 구독하기`}
            onClick={toggleSubscription}
          >
            {isTags && (
              <span
                aria-hidden="true"
                className="text-base leading-none"
              >
                +
              </span>
            )}
            구독하기
          </Button>
        )}
      </div>
    );
  }

  return (
    <div ref={root} className="space-y-5">
      <div
        className={
          isTags
            ? tagDiscoveryStyles.searchPanel
            : undefined
        }
      >
        <form
          className={
            isTags
              ? tagDiscoveryStyles.searchForm
              : "flex flex-wrap items-end justify-end gap-3"
          }
          onSubmit={(event) => {
            event.preventDefault();
            if (invalidInput) return;
            search({
              ...request,
              query: input.trim(),
              page: 1,
            });
          }}
        >
          <div
            className={
              isTags
                ? tagDiscoveryStyles.searchField
                : "min-w-0 flex-1"
            }
          >
            <TextField
              hideLabel={isTags}
              type="search"
              label={
                request.kind === DiscoveryKind.USER
                  ? "개발자 검색"
                  : "태그 검색"
              }
              placeholder={
                request.kind === DiscoveryKind.USER
                  ? "개발자 이름 또는 ID"
                  : "태그 이름 검색"
              }
              value={input}
              error={
                invalidInput
                  ? "검색어는 100자 이하여야 합니다."
                  : undefined
              }
              readOnly={busy}
              onChange={(event) =>
                setInput(event.target.value)
              }
            />
          </div>
          <Button
            type="submit"
            className={
              isTags
                ? tagDiscoveryStyles.searchButton
                : undefined
            }
            disabled={busy || invalidInput}
          >
            검색
          </Button>
        </form>
        {request.kind === DiscoveryKind.HASHTAG &&
          showSubscriptions && (
            <div
              role="group"
              aria-label="태그 목록 필터"
              className={tagDiscoveryStyles.filters}
            >
              <Button
                variant={
                  request.subscribedOnly
                    ? "ghost"
                    : "secondary"
                }
                className={tagDiscoveryStyles.filterButton}
                aria-pressed={!request.subscribedOnly}
                disabled={busy}
                onClick={() =>
                  search({
                    ...request,
                    subscribedOnly: false,
                    page: 1,
                  })
                }
              >
                전체 태그
              </Button>
              <Button
                variant={
                  request.subscribedOnly
                    ? "secondary"
                    : "ghost"
                }
                className={tagDiscoveryStyles.filterButton}
                aria-pressed={!!request.subscribedOnly}
                disabled={busy}
                onClick={() =>
                  search({
                    ...request,
                    subscribedOnly: true,
                    page: 1,
                  })
                }
              >
                내 구독
              </Button>
            </div>
          )}
      </div>
      {discovery.isPending && !invalidQuery && <Skeleton />}
      {discovery.error && !invalidQuery && (
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
      {toast && (
        <Toast
          placement="inline"
          message={toast}
          onClose={() => setToast(null)}
        />
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
          <p
            ref={results}
            tabIndex={-1}
            role="status"
            className="text-sm text-muted"
          >
            검색 결과 {data.total.toLocaleString()}개 ·{" "}
            {data.page}페이지
          </p>
          {data.items.length ? (
            <ul
              className={
                isTags
                  ? tagDiscoveryStyles.grid
                  : "grid gap-3 md:grid-cols-2"
              }
            >
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
                  publicQuizCount,
                } = item;

                return (
                  <li
                    key={id}
                    className={tagDiscoveryStyles.card}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <strong
                        className={tagDiscoveryStyles.label}
                      >
                        #{name}
                      </strong>
                      {subscribed && (
                        <span
                          className={
                            tagDiscoveryStyles.subscribed
                          }
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="size-3"
                          >
                            <path d="m3 8 3 3 7-7" />
                          </svg>
                          구독 중
                        </span>
                      )}
                    </div>
                    <div
                      className={tagDiscoveryStyles.footer}
                    >
                      <span
                        className={tagDiscoveryStyles.count}
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="size-4 shrink-0"
                        >
                          <rect
                            x="5"
                            y="3"
                            width="11"
                            height="14"
                            rx="2"
                          />
                          <path d="M5 6H3v10a2 2 0 0 0 2 2M8 7h5M8 10h5M8 13h3" />
                        </svg>
                        {publicQuizCount === 0
                          ? "공개 퀴즈 없음"
                          : `공개 퀴즈 ${publicQuizCount}개`}
                      </span>
                      {action(
                        name,
                        { type: "HASHTAG", hashtagId: id },
                        id,
                        subscribed,
                        publicQuizCount,
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div
              className={
                isTags
                  ? tagDiscoveryStyles.empty
                  : "space-y-3"
              }
            >
              <p>
                {data.total > 0
                  ? "요청한 페이지에 결과가 없습니다."
                  : request.subscribedOnly && !request.query
                    ? "구독한 태그가 없습니다."
                    : "검색 결과가 없습니다. 검색어를 바꿔 보세요."}
              </p>
              {request.page > 1 ? (
                <Button
                  variant="secondary"
                  onClick={() =>
                    search({ ...request, page: 1 })
                  }
                >
                  첫 페이지로 이동
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() =>
                    search({
                      ...request,
                      query: "",
                      subscribedOnly: false,
                      page: 1,
                    })
                  }
                >
                  {request.kind === DiscoveryKind.HASHTAG
                    ? "전체 태그 보기"
                    : "전체 개발자 보기"}
                </Button>
              )}
            </div>
          )}
          {totalPages > 1 && request.page <= totalPages && (
            <nav
              aria-label="검색 결과 페이지"
              className="flex flex-wrap items-center justify-end gap-4"
            >
              <Button
                variant="secondary"
                disabled={request.page <= 1 || busy}
                onClick={() =>
                  search({
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
                  search({
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
