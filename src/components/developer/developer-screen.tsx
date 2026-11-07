"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
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
import { useDemoSession } from "@/components/navigation/demo-session";
import { EditIcon } from "@/components/profile/edit-icon";
import { profileStyles } from "@/components/profile/styles";
import { ProfileAbout } from "@/components/profile/profile-about";
import { ApiClientError } from "@/api/client";
import {
  Button,
  EmptyState,
  Skeleton,
  TextField,
  Toast,
} from "@/components/ui";
import { QuizCard } from "@/components/ui/quiz-card";
import { useDeveloper } from "@/components/developer/queries";

interface Filters {
  page: number;
  tagPage: number;
  tagQuery: string;
  hashtagId: string | null;
}

function TagSubscriptionMenu({
  name,
  busy,
  onToggle,
}: {
  name: string;
  busy: boolean;
  onToggle: () => void;
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
              onToggle();
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

function PageControls({
  label,
  page,
  total,
  pageSize,
  busy,
  onPage,
}: {
  label: string;
  page: number;
  total: number;
  pageSize: number;
  busy: boolean;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));

  if (pages <= 1) return null;

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
      <Button type="submit" disabled={busy}>
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
  onNotice,
  profile = false,
  afterHeader,
}: {
  userId: string;
  publicId: string;
  profile?: boolean;
  afterHeader?: ReactNode;
  filters: Filters;
  navigating: boolean;
  onChange: (filters: Filters) => void;
  onNotice: (message: string, duration?: number) => void;
}) {
  const { signedIn, signIn } = useDemoSession();
  const { page, tagPage, tagQuery, hashtagId } = filters;
  const { quizzes, tags, subscribe } = useDeveloper(
    userId,
    {
      publicId,
      page: profile ? 1 : page,
      pageSize: profile ? 4 : 20,
      hashtagId: profile ? null : hashtagId,
    },
    {
      publicId,
      page: tagPage,
      pageSize: 10,
      query: tagQuery,
    },
  );
  const { data } = quizzes;
  const subscriptionBusy = subscribe.isPending;
  const busy = navigating || subscriptionBusy;

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

  const identity = profile ? (
    <h1 className="break-all text-base font-medium text-muted">
      @{data.user.publicId}
    </h1>
  ) : (
    <div>
      <h1 className="text-3xl">
        {data.user.displayName}의 퀴즈
      </h1>
      <p className="mt-2 text-muted">
        @{data.user.publicId}
      </p>
    </div>
  );
  const subscription = (profile || !data.subscribed) && (
    <Button
      className="ml-auto"
      variant="secondary"
      disabled={busy}
      onClick={() => {
        if (profile && !signedIn) {
          signIn();
          return;
        }
        void subscribe
          .mutateAsync({
            target: {
              type: "PERSON",
              authorUserId: data.user.userId,
            },
            subscribed: profile ? data.subscribed : false,
          })
          .then(() =>
            onNotice(
              profile && data.subscribed
                ? `${data.user.displayName}님 구독을 취소했습니다.`
                : `${data.user.displayName}님을 구독했습니다.`,
            ),
          )
          .catch(() => undefined);
      }}
    >
      {profile && !signedIn
        ? "데모 사용자 선택 후 구독하기"
        : profile && data.subscribed
          ? "개발자 구독 해제"
          : "개발자 구독하기"}
    </Button>
  );

  return (
    <div className={profile ? "space-y-4" : "space-y-8"}>
      {profile ? (
        <ProfileAbout
          key={`${userId}:${publicId}:${signedIn}`}
          userId={userId}
          publicId={publicId}
          owner={signedIn && data.user.userId === userId}
          identity={identity}
          visitorAction={subscription}
          onNotice={onNotice}
        />
      ) : (
        <header className="flex flex-wrap items-center justify-between gap-4">
          {identity}
          {subscription}
        </header>
      )}
      {afterHeader && (
        <div className="space-y-2">
          {profile &&
            signedIn &&
            data.user.userId === userId && (
              <div className="flex justify-end">
                <Link
                  href={`/my/desk?user=${encodeURIComponent(userId)}`}
                  className={profileStyles.action}
                >
                  <EditIcon />
                  데스크 편집
                </Link>
              </div>
            )}
          {afterHeader}
        </div>
      )}
      {subscribe.error && (
        <p role="alert">
          구독을 저장하지 못했습니다. 다시 시도해 주세요.
        </p>
      )}
      <div className="space-y-8">
        {!profile && (
          <section
            aria-label="개발자의 태그"
            className="min-w-0 rounded-2xl border border-line bg-surface p-3 sm:p-4"
          >
            <h2 className="mb-2 text-lg">태그</h2>
            <TagSearch
              key={tagQuery}
              value={tagQuery}
              busy={subscriptionBusy}
              onSearch={(query) =>
                onChange({
                  ...filters,
                  tagQuery: query,
                  tagPage: 1,
                })
              }
            />
            {tags.isPending && <Skeleton />}
            {tags.error && (
              <div role="alert">
                <p>태그를 불러오지 못했습니다.</p>
                <div className="flex justify-end">
                  <Button
                    onClick={() => void tags.refetch()}
                  >
                    태그 다시 불러오기
                  </Button>
                </div>
              </div>
            )}
            {tags.data && (
              <>
                <ul className="flex flex-wrap gap-2">
                  {tags.data.items.map(
                    ({
                      id,
                      name,
                      quizCount,
                      subscribed,
                    }) => (
                      <li
                        key={id}
                        className={`flex w-fit max-w-full items-center gap-1 rounded-full border py-0.5 pl-3 pr-1 ${(profile ? hashtagId === id : subscribed) ? "border-primary/25 bg-primary/10" : "border-line bg-canvas/40"} ${hashtagId === id ? "ring-2 ring-primary/50 ring-offset-1 ring-offset-surface" : ""}`}
                      >
                        <button
                          type="button"
                          disabled={busy}
                          aria-pressed={hashtagId === id}
                          className="min-w-0 break-all text-left font-medium text-primary"
                          onClick={() => {
                            if (!subscribed && !profile) {
                              void subscribe
                                .mutateAsync({
                                  target: {
                                    type: "PERSON_HASHTAG",
                                    authorUserId:
                                      data.user.userId,
                                    hashtagId: id,
                                  },
                                  subscribed: false,
                                })
                                .then(() =>
                                  onNotice(
                                    `${name} 태그를 구독했습니다.`,
                                  ),
                                )
                                .catch(() => undefined);
                            }

                            onChange({
                              ...filters,
                              hashtagId: id,
                              page: 1,
                            });
                          }}
                        >
                          {name}{" "}
                          <span className="text-muted">
                            ({quizCount})
                          </span>
                        </button>
                        {subscribed && !profile && (
                          <TagSubscriptionMenu
                            name={name}
                            busy={busy}
                            onToggle={() => {
                              void subscribe
                                .mutateAsync({
                                  target: {
                                    type: "PERSON_HASHTAG",
                                    authorUserId:
                                      data.user.userId,
                                    hashtagId: id,
                                  },
                                  subscribed: true,
                                })
                                .then(() =>
                                  onNotice(
                                    `${name} 태그 구독을 취소했습니다.`,
                                  ),
                                )
                                .catch(() => undefined);
                            }}
                          />
                        )}
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
                  onPage={(next) =>
                    onChange({ ...filters, tagPage: next })
                  }
                />
              </>
            )}
          </section>
        )}
        <section
          aria-label="개발자의 공개 퀴즈"
          className="min-w-0"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg">
              {profile ? "최신 공개 퀴즈" : "공개 퀴즈"}{" "}
              <span className="text-muted">
                {profile ? data.items.length : data.total}개
              </span>
            </h2>
            {profile && (
              <Link
                href={`/developers/${encodeURIComponent(publicId)}/quizzes?user=${encodeURIComponent(userId)}`}
                className="rounded text-sm font-semibold text-primary underline focus-visible:outline-2 focus-visible:outline-primary"
              >
                전체 보기 →
              </Link>
            )}
            {!profile && hashtagId && (
              <Button
                size="sm"
                variant="ghost"
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
            )}
          </div>
          {data.items.length ? (
            <ul
              className={
                profile
                  ? "grid gap-4 sm:grid-cols-2"
                  : "space-y-4"
              }
            >
              {data.items.map(
                ({ quizId, title, hashtagIds }) => (
                  <li key={quizId}>
                    <QuizCard
                      title={title}
                      action={{
                        href: `/solve?user=${encodeURIComponent(userId)}&quiz=${encodeURIComponent(quizId)}`,
                      }}
                      metadata={hashtagIds
                        .map((id) => `#${id}`)
                        .join(" ")}
                    />
                  </li>
                ),
              )}
            </ul>
          ) : (
            <EmptyState
              title="공개된 퀴즈가 없습니다"
              description={
                !profile && hashtagId
                  ? "다른 태그를 선택해 보세요."
                  : "이 개발자가 공개한 퀴즈가 아직 없습니다."
              }
            />
          )}
          {!profile && (
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
          )}
        </section>
      </div>
    </div>
  );
}

export function DeveloperScreen({
  profile = false,
  afterHeader,
}: {
  profile?: boolean;
  afterHeader?: ReactNode;
}) {
  const { publicId } = useParams<{ publicId: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  useEffect(
    () => () => {
      if (toastTimer.current)
        clearTimeout(toastTimer.current);
    },
    [],
  );

  function showNotice(message: string, duration?: number) {
    if (toastTimer.current)
      clearTimeout(toastTimer.current);
    setToast(message);
    if (duration)
      toastTimer.current = setTimeout(
        () => setToast(null),
        duration,
      );
  }

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
        {!profile && (
          <Link
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-primary focus-visible:text-primary"
            href={`/discover/developers?user=${encodeURIComponent(userId)}`}
          >
            <span aria-hidden="true">←</span>
            탐색으로 돌아가기
          </Link>
        )}
        <Catalog
          key={`${userId}:${publicId}`}
          profile={profile}
          afterHeader={afterHeader}
          userId={userId}
          publicId={publicId}
          filters={filters}
          navigating={navigating}
          onNotice={showNotice}
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
                `${profile ? `/users/${encodeURIComponent(publicId)}` : `/developers/${encodeURIComponent(publicId)}/quizzes`}?${query}`,
                { scroll: false },
              ),
            );
          }}
        />
        {toast && (
          <Toast
            message={toast}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </QueryClientProvider>
  );
}
