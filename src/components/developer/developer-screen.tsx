"use client";

import { createQueryClient } from "@/api/query-client";

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
import { QueryClientProvider } from "@tanstack/react-query";
import { useDemoSession } from "@/components/navigation/demo-session";
import { EditIcon } from "@/components/profile/edit-icon";
import { profileStyles } from "@/components/profile/styles";
import { ProfileSections } from "@/components/profile/profile-sections";
import { ProfileAbout } from "@/components/profile/profile-about";
import { ApiClientError } from "@/api/client";
import {
  Avatar,
  Button,
  EmptyState,
  Skeleton,
  TextField,
  Toast,
} from "@/components/ui";
import { developerStyles } from "@/components/developer/styles";
import { DeveloperSubscriptionPanel } from "@/components/developer/subscription-panel";
import { FilterChips } from "@/components/ui/filter-chips";

import { withDemoUser } from "@/components/navigation/routes";
import { QuizCard } from "@/components/ui/quiz-card";
import { useDeveloper } from "@/components/developer/queries";

interface Filters {
  page: number;
  tagPage: number;
  tagQuery: string;
  hashtagIds: string[];
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
      className={developerStyles.search}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(query.trim());
      }}
    >
      <div className={developerStyles.searchField}>
        <TextField
          type="search"
          label="이 개발자의 태그 검색"
          hideLabel
          placeholder="태그 검색"
          value={query}
          maxLength={100}
          disabled={busy}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <Button
        type="submit"
        size="sm"
        variant="secondary"
        className={developerStyles.searchButton}
        disabled={busy}
      >
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
  activity,
}: {
  userId: string;
  publicId: string;
  profile?: boolean;
  afterHeader?: ReactNode;
  activity?: ReactNode;
  filters: Filters;
  navigating: boolean;
  onChange: (filters: Filters) => void;
  onNotice: (message: string, duration?: number) => void;
}) {
  const { signedIn, signIn } = useDemoSession();
  const { page, tagPage, tagQuery, hashtagIds } = filters;
  const { quizzes, tags, subscribe } = useDeveloper(
    userId,
    {
      publicId,
      page: profile ? 1 : page,
      pageSize: profile ? 4 : 20,
      hashtagIds: profile ? [] : hashtagIds,
    },
    {
      publicId,
      page: tagPage,
      pageSize: 10,
      query: tagQuery,
    },
  );
  const { data } = quizzes;
  const tagRegion = useRef<HTMLElement>(null);
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
    <div className="min-w-0 flex-1">
      <h1 className="break-words text-lg sm:text-2xl">
        {data.user.displayName}의 퀴즈
      </h1>
      <Link
        className="mt-1 inline-flex min-h-8 max-w-full items-center break-all text-sm text-muted hover:text-primary hover:underline"
        href={withDemoUser(
          `/users/${encodeURIComponent(publicId)}`,
          signedIn ? userId : null,
        )}
      >
        @{data.user.publicId}
      </Link>
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

  const quizSection = (
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
        {!profile && hashtagIds.length > 0 && (
          <div className="flex max-w-full flex-wrap items-center gap-2">
            {hashtagIds.map((id) => (
              <button
                key={id}
                type="button"
                aria-label={`${id} 필터 해제`}
                className="min-h-11 break-all rounded-xl bg-primary/10 px-3 text-xs font-semibold text-primary"
                onClick={() =>
                  onChange({
                    ...filters,
                    hashtagIds: hashtagIds.filter(
                      (selected) => selected !== id,
                    ),
                    page: 1,
                  })
                }
              >
                #{id} ×
              </button>
            ))}
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() =>
                onChange({
                  ...filters,
                  hashtagIds: [],
                  page: 1,
                })
              }
            >
              전체 퀴즈
            </Button>
          </div>
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
            !profile && hashtagIds.length > 0
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
  );
  if (profile)
    return (
      <div className="space-y-6">
        <ProfileAbout
          key={`${userId}:${publicId}:${signedIn}`}
          userId={userId}
          publicId={publicId}
          owner={signedIn && data.user.userId === userId}
          identity={identity}
          visitorAction={subscription}
          onNotice={onNotice}
        />
        {subscribe.error && (
          <p role="alert">
            구독을 저장하지 못했습니다. 다시 시도해 주세요.
          </p>
        )}
        <ProfileSections
          key={`${userId}:${publicId}:${signedIn}`}
          userId={userId}
          publicId={publicId}
          owner={signedIn && data.user.userId === userId}
          onNotice={onNotice}
          sections={{
            DESK: (
              <div className="space-y-2">
                {signedIn &&
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
            ),
            QUIZZES: quizSection,
            ACTIVITY: activity,
          }}
        />
      </div>
    );

  return (
    <div className={profile ? "space-y-4" : "space-y-5"}>
      <header className={developerStyles.header}>
        <span
          aria-hidden="true"
          className={developerStyles.avatar}
        >
          <Avatar name={data.user.displayName} />
        </span>
        {identity}
        <DeveloperSubscriptionPanel
          userId={userId}
          publicId={publicId}
          authorUserId={data.user.userId}
          subscribed={data.subscribed}
        />
      </header>
      {subscribe.error && (
        <p role="alert">
          구독을 저장하지 못했습니다. 다시 시도해 주세요.
        </p>
      )}
      <div className={profile ? "space-y-8" : "space-y-5"}>
        {!profile && (
          <section
            ref={tagRegion}
            aria-label="개발자의 태그"
            className={developerStyles.filters}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">
                태그
              </h2>
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
            </div>
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
                <FilterChips
                  options={tags.data.items.map(
                    ({ id, name, quizCount }) => ({
                      id,
                      label: name,
                      count: quizCount,
                    }),
                  )}
                  value={hashtagIds}
                  disabled={navigating}
                  onChange={(selected) =>
                    onChange({
                      ...filters,
                      hashtagIds: selected,
                      page: 1,
                    })
                  }
                />
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
        {quizSection}
      </div>
    </div>
  );
}

export function DeveloperScreen({
  profile = false,
  afterHeader,
  activity,
}: {
  profile?: boolean;
  afterHeader?: ReactNode;
  activity?: ReactNode;
}) {
  const { publicId } = useParams<{ publicId: string }>();
  const params = useSearchParams();
  const { signedIn } = useDemoSession();
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

  const [client] = useState(() => createQueryClient());
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
    hashtagIds: [
      ...new Set(params.getAll("tag").filter(Boolean)),
    ].sort(),
  };

  return (
    <QueryClientProvider client={client}>
      <div className="space-y-6">
        {!profile && (
          <Link
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-primary focus-visible:text-primary"
            href={withDemoUser(
              "/discover/developers",
              signedIn ? userId : null,
            )}
          >
            <span aria-hidden="true">←</span>
            탐색으로 돌아가기
          </Link>
        )}
        <Catalog
          key={`${userId}:${publicId}`}
          profile={profile}
          afterHeader={afterHeader}
          activity={activity}
          userId={userId}
          publicId={publicId}
          filters={filters}
          navigating={navigating}
          onNotice={showNotice}
          onChange={(next) => {
            const query = new URLSearchParams({
              ...(signedIn ? { user: userId } : {}),
              page: String(next.page),
              tagPage: String(next.tagPage),
            });
            for (const id of [
              ...new Set(next.hashtagIds),
            ].sort())
              query.append("tag", id);
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
