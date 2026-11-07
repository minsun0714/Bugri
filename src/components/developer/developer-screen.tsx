"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ApiClientError } from "@/api/client";
import {
  Button,
  EmptyState,
  Skeleton,
  TextField,
} from "@/components/ui";
import { useDeveloper } from "@/components/developer/queries";

interface Filters {
  page: number;
  tagPage: number;
  tagQuery: string;
  hashtagId: string | null;
}

function PageControls({
  label,
  page,
  total,
  pageSize,
  busy,
  hideSinglePage = false,
  onPage,
}: {
  label: string;
  page: number;
  total: number;
  pageSize: number;
  busy: boolean;
  hideSinglePage?: boolean;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));

  if (hideSinglePage && pages <= 1) return null;

  return (
    <nav
      aria-label={`${label} 페이지`}
      className="mt-3 flex flex-wrap items-center justify-end gap-2"
    >
      <Button
        size="sm"
        variant="ghost"
        aria-label={`${label} 이전 페이지`}
        disabled={page <= 1 || busy}
        onClick={() => onPage(page - 1)}
      >
        이전
      </Button>
      <span className="text-sm text-muted">
        {page} / {Math.max(pages, page)}
      </span>
      <Button
        size="sm"
        variant="ghost"
        aria-label={`${label} 다음 페이지`}
        disabled={page >= pages || busy}
        onClick={() => onPage(page + 1)}
      >
        다음
      </Button>
    </nav>
  );
}

function TagSearch({
  value,
  busy,
  onSearch,
}: {
  value: string;
  busy: boolean;
  onSearch: (query: string) => void;
}) {
  const [query, setQuery] = useState(value);

  return (
    <form
      className="mb-2 flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(query.trim());
      }}
    >
      <div className="min-w-0 flex-1">
        <TextField
          type="search"
          label="이 개발자의 태그 검색"
          value={query}
          maxLength={100}
          disabled={busy}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <Button type="submit" size="sm" disabled={busy}>
        검색
      </Button>
    </form>
  );
}

function Catalog({
  userId,
  publicId,
  filters,
  navigating,
  onChange,
}: {
  userId: string;
  publicId: string;
  filters: Filters;
  navigating: boolean;
  onChange: (filters: Filters) => void;
}) {
  const { page, tagPage, tagQuery, hashtagId } = filters;
  const { quizzes, tags, subscribe } = useDeveloper(
    userId,
    { publicId, page, pageSize: 20, hashtagId },
    {
      publicId,
      page: tagPage,
      pageSize: 10,
      query: tagQuery,
    },
  );
  const { data } = quizzes;
  const busy = navigating || subscribe.isPending;

  if (quizzes.isPending) return <Skeleton />;
  if (quizzes.error)
    return (
      <div role="alert" className="space-y-4">
        <h1>
          {quizzes.error instanceof ApiClientError &&
          quizzes.error.status === 404
            ? "개발자를 찾을 수 없습니다"
            : "공개 퀴즈를 불러오지 못했습니다"}
        </h1>
        <div className="flex justify-end">
          <Button onClick={() => void quizzes.refetch()}>
            다시 불러오기
          </Button>
        </div>
      </div>
    );
  if (!data) return null;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">
            {data.user.displayName}의 퀴즈
          </h1>
          <p className="mt-2 text-muted">
            @{data.user.publicId}
          </p>
        </div>
        <Button
          className="ml-auto"
          variant="secondary"
          disabled={busy || data.subscribed}
          onClick={() =>
            subscribe.mutate({
              type: "PERSON",
              authorUserId: data.user.userId,
            })
          }
        >
          {data.subscribed
            ? "개발자 구독 중"
            : "개발자 구독하기"}
        </Button>
      </header>
      {subscribe.error && (
        <p role="alert">
          구독을 저장하지 못했습니다. 다시 시도해 주세요.
        </p>
      )}
      <div className="space-y-8">
        <section
          aria-label="개발자의 태그"
          className="min-w-0 rounded-2xl border border-line bg-surface p-3 sm:p-4"
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg">태그</h2>
            <Button
              size="sm"
              variant="ghost"
              aria-pressed={!hashtagId}
              disabled={busy}
              onClick={() =>
                onChange({
                  ...filters,
                  hashtagId: null,
                  page: 1,
                })
              }
            >
              전체 퀴즈
            </Button>
          </div>
          <TagSearch
            key={tagQuery}
            value={tagQuery}
            busy={busy}
            onSearch={(query) =>
              onChange({
                ...filters,
                tagQuery: query,
                tagPage: 1,
              })
            }
          />
          {hashtagId && (
            <p className="mb-2 text-sm text-muted">
              선택한 태그: {hashtagId}
            </p>
          )}
          {tags.isPending && <Skeleton />}
          {tags.error && (
            <div role="alert">
              <p>태그를 불러오지 못했습니다.</p>
              <div className="flex justify-end">
                <Button onClick={() => void tags.refetch()}>
                  태그 다시 불러오기
                </Button>
              </div>
            </div>
          )}
          {tags.data && (
            <>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {tags.data.items.map(
                  ({ id, name, quizCount, subscribed }) => (
                    <li
                      key={id}
                      className="flex flex-wrap items-center justify-between gap-1 rounded-xl border border-line bg-canvas/40 p-2"
                    >
                      <button
                        type="button"
                        disabled={busy}
                        aria-pressed={hashtagId === id}
                        className="min-w-0 break-all text-left font-medium text-primary underline-offset-4 hover:underline aria-pressed:underline"
                        onClick={() =>
                          onChange({
                            ...filters,
                            hashtagId: id,
                            page: 1,
                          })
                        }
                      >
                        {name}{" "}
                        <span className="text-muted">
                          ({quizCount})
                        </span>
                      </button>
                      <Button
                        className="ml-auto"
                        size="sm"
                        variant="ghost"
                        disabled={busy || subscribed}
                        aria-label={`${data.user.displayName}의 ${name} ${subscribed ? "구독 중" : "구독하기"}`}
                        onClick={() =>
                          subscribe.mutate({
                            type: "PERSON_HASHTAG",
                            authorUserId: data.user.userId,
                            hashtagId: id,
                          })
                        }
                      >
                        {subscribed
                          ? "구독 중"
                          : "태그 구독"}
                      </Button>
                    </li>
                  ),
                )}
              </ul>
              {!tags.data.items.length && (
                <p className="mt-4 text-sm text-muted">
                  표시할 태그가 없습니다.
                </p>
              )}
              <PageControls
                label="태그"
                page={tagPage}
                total={tags.data.total}
                pageSize={10}
                busy={busy}
                hideSinglePage
                onPage={(next) =>
                  onChange({ ...filters, tagPage: next })
                }
              />
            </>
          )}
        </section>
        <section
          aria-label="개발자의 공개 퀴즈"
          className="min-w-0"
        >
          <h2 className="mb-4 text-lg">
            공개 퀴즈{" "}
            <span className="text-muted">
              {data.total}개
            </span>
          </h2>
          {data.items.length ? (
            <ul className="space-y-4">
              {data.items.map(
                ({ quizId, title, hashtagIds }) => (
                  <li
                    key={quizId}
                    className="rounded-2xl border border-line bg-surface p-5"
                  >
                    <Link
                      className="text-lg font-bold text-primary underline-offset-4 hover:underline"
                      href={`/solve?user=${encodeURIComponent(userId)}&quiz=${encodeURIComponent(quizId)}`}
                    >
                      {title}
                    </Link>
                    <p className="mt-3 break-words text-sm text-muted">
                      {hashtagIds
                        .map((id) => `#${id}`)
                        .join(" ")}
                    </p>
                  </li>
                ),
              )}
            </ul>
          ) : (
            <EmptyState
              title="공개된 퀴즈가 없습니다"
              description={
                hashtagId
                  ? "다른 태그를 선택해 보세요."
                  : "이 개발자가 공개한 퀴즈가 아직 없습니다."
              }
            />
          )}
          <PageControls
            label="퀴즈"
            page={page}
            total={data.total}
            pageSize={20}
            busy={busy}
            onPage={(next) =>
              onChange({ ...filters, page: next })
            }
          />
        </section>
      </div>
    </div>
  );
}

export function DeveloperScreen() {
  const { publicId } = useParams<{ publicId: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [client] = useState(() => new QueryClient());
  const userId = params.get("user") ?? "learner";
  const positive = (value: string | null) => {
    const number = Number(value ?? 1);
    return Number.isSafeInteger(number) && number > 0
      ? number
      : 1;
  };
  const filters: Filters = {
    page: positive(params.get("page")),
    tagPage: positive(params.get("tagPage")),
    tagQuery: params.get("tagQuery") ?? "",
    hashtagId: params.get("tag"),
  };

  return (
    <QueryClientProvider client={client}>
      <div className="space-y-6">
        <Link
          className="text-primary underline"
          href={`/discover?user=${encodeURIComponent(userId)}`}
        >
          개발자·태그 탐색
        </Link>
        <Catalog
          key={`${userId}:${publicId}`}
          userId={userId}
          publicId={publicId}
          filters={filters}
          navigating={navigating}
          onChange={(next) => {
            const query = new URLSearchParams({
              user: userId,
              page: String(next.page),
              tagPage: String(next.tagPage),
            });
            if (next.hashtagId)
              query.set("tag", next.hashtagId);
            if (next.tagQuery)
              query.set("tagQuery", next.tagQuery);
            startTransition(() =>
              router.push(
                `/developers/${encodeURIComponent(publicId)}/quizzes?${query}`,
                { scroll: false },
              ),
            );
          }}
        />
      </div>
    </QueryClientProvider>
  );
}
