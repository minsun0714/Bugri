"use client";

import Link from "next/link";
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
  userId: string;
  navigating?: boolean;
  request: DiscoveryQuery;
  onSearch: (request: DiscoveryQuery) => void;
  onLearn: (hashtagId: string | null) => void;
}

function SubscriptionMenu({
  name,
  busy,
  onUnsubscribe,
}: {
  name: string;
  busy: boolean;
  onUnsubscribe: () => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOutside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeWithKeyboard(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setOpen(false);
      root.current
        ?.querySelector<HTMLButtonElement>("button")
        ?.focus();
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithKeyboard);

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeOutside,
      );
      document.removeEventListener(
        "keydown",
        closeWithKeyboard,
      );
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <Button
        className="!size-7 !min-h-0 !rounded-full !border-0 !p-0 !shadow-none"
        size="sm"
        variant="ghost"
        disabled={busy}
        aria-label={`${name} 구독 메뉴`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-4"
        >
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
        </svg>
      </Button>
      {open && (
        <div
          role="menu"
          aria-label={`${name} 구독 관리`}
          className="absolute right-0 top-[calc(100%+0.25rem)] z-20 min-w-28 rounded-xl border border-line bg-surface p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            disabled={busy}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold whitespace-nowrap hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-45"
            onClick={() => {
              onUnsubscribe();
              setOpen(false);
            }}
          >
            구독 해제
          </button>
        </div>
      )}
    </div>
  );
}

export function DiscoverySearch(
  props: DiscoverySearchProps,
) {
  const { request } = props;
  return (
    <DiscoveryResults
      key={JSON.stringify(request)}
      {...props}
    />
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
  const [toast, setToast] = useState<string | null>(null);
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
    function toggleSubscription() {
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
        .then(() => setToast(message))
        .catch(() => undefined);
    }

    return (
      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        {subscribed ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              aria-label={`${name} 학습하기`}
              onClick={() => onLearn(tag)}
            >
              학습하기
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
            disabled={busy}
            aria-label={`${name} 구독하기`}
            onClick={toggleSubscription}
          >
            구독하기
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
            label={
              request.kind === DiscoveryKind.USER
                ? "개발자 검색"
                : "태그 검색"
            }
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
              검색 결과가 없습니다. 검색어를 바꿔 보세요.
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
      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
