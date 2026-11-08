"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import type { ReactNode } from "react";
import {
  QuizStatus,
  type QuizSummary,
} from "@/api/contracts";
import { Badge, Button, EmptyState } from "@/components/ui";
import { styles } from "@/components/ui/styles";
import { QuizCard } from "@/components/ui/quiz-card";
import { Dropdown } from "@/components/ui/dropdown";

export const QuizListFilter = {
  ALL: "ALL",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
} as const;

export type QuizListFilter =
  (typeof QuizListFilter)[keyof typeof QuizListFilter];

export const QuizListSort = {
  NEWEST: "NEWEST",
  OLDEST: "OLDEST",
  TITLE: "TITLE",
} as const;

export type QuizListSort =
  (typeof QuizListSort)[keyof typeof QuizListSort];

export interface QuizListView {
  query: string;
  filter: QuizListFilter;
  sort: QuizListSort;
  page: number;
}

const PAGE_SIZE = 10;

const sortOptions = [
  { value: QuizListSort.NEWEST, label: "최근 수정순" },
  { value: QuizListSort.OLDEST, label: "오래된 수정순" },
  { value: QuizListSort.TITLE, label: "제목순" },
];

function needsReview({
  status,
  hasPendingRevision,
}: QuizSummary) {
  return (
    status === QuizStatus.PENDING || hasPendingRevision
  );
}

function matchesFilter(
  quiz: QuizSummary,
  filter: QuizListFilter,
) {
  if (filter === QuizListFilter.NEEDS_REVIEW)
    return needsReview(quiz);
  if (filter === QuizListFilter.PUBLIC)
    return quiz.status === QuizStatus.PUBLIC;
  if (filter === QuizListFilter.PRIVATE)
    return quiz.status === QuizStatus.PRIVATE;

  return true;
}

function compareQuizzes(
  first: QuizSummary,
  second: QuizSummary,
  sort: QuizListSort,
) {
  if (sort === QuizListSort.TITLE)
    return first.title.localeCompare(second.title, "ko-KR");

  const difference =
    new Date(first.updatedAt).getTime() -
    new Date(second.updatedAt).getTime();

  return sort === QuizListSort.OLDEST
    ? difference
    : -difference;
}

function relativeTime(
  value: string,
  t: ReturnType<typeof useTranslation>,
) {
  const date = new Date(value);
  const elapsed = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(elapsed / 60_000);
  const hours = Math.floor(elapsed / 3_600_000);
  const days = Math.floor(elapsed / 86_400_000);

  if (minutes < 1) return t("방금 수정");
  if (minutes < 60)
    return t("{0}분 전 수정", { 0: minutes });
  if (hours < 24) return t("{0}시간 전 수정", { 0: hours });
  if (days < 7) return t("{0}일 전 수정", { 0: days });

  return t("{0} 수정", {
    0: date.toISOString().slice(0, 10),
  });
}

function exactTime(value: string) {
  return new Date(value).toLocaleString("ko-KR");
}

function StatusBadges({ quiz }: { quiz: QuizSummary }) {
  const t = useTranslation();

  const review = needsReview(quiz);

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {quiz.status === QuizStatus.PUBLIC && (
        <Badge tone="success">{t("공개 중")}</Badge>
      )}
      {quiz.status === QuizStatus.PRIVATE && (
        <Badge>{t("나만 보기")}</Badge>
      )}
      {review && (
        <Badge tone="warning">
          {quiz.status === QuizStatus.PENDING
            ? t("검토 필요")
            : t("수정본 검토 필요")}
        </Badge>
      )}
    </span>
  );
}

export function QuizList({
  quizzes,
  view,
  createHref,
  isFetching,
  busy,
  onViewChange,
  onOpen,
  onRefresh,
  renderReaction,
  quizHref,
}: {
  quizzes: QuizSummary[];
  view: QuizListView;
  createHref: string;
  isFetching: boolean;
  busy: boolean;
  onViewChange: (change: Partial<QuizListView>) => void;
  onOpen: (quizId: string) => void;
  onRefresh: () => void;
  renderReaction?: (quizId: string) => ReactNode;
  quizHref?: (quizId: string) => string;
}) {
  const t = useTranslation();

  const { query, filter, sort, page } = view;
  const normalizedQuery = query
    .trim()
    .toLocaleLowerCase("ko-KR");
  const reviewCount = quizzes.filter(needsReview).length;
  const publicCount = quizzes.filter(
    ({ status }) => status === QuizStatus.PUBLIC,
  ).length;
  const privateCount = quizzes.filter(
    ({ status }) => status === QuizStatus.PRIVATE,
  ).length;
  const filtered = quizzes
    .filter((quiz) => matchesFilter(quiz, filter))
    .filter(({ title, hashtagIds }) => {
      if (!normalizedQuery) return true;

      return [title, ...hashtagIds]
        .join(" ")
        .toLocaleLowerCase("ko-KR")
        .includes(normalizedQuery);
    })
    .sort((first, second) =>
      compareQuizzes(first, second, sort),
    );
  const pageCount = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE),
  );
  const currentPage = Math.min(
    Math.max(page, 1),
    pageCount,
  );
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const tabs = [
    {
      value: QuizListFilter.ALL,
      label: t("전체"),
      count: quizzes.length,
    },
    {
      value: QuizListFilter.NEEDS_REVIEW,
      label: t("검토 필요"),
      count: reviewCount,
    },
    {
      value: QuizListFilter.PUBLIC,
      label: t("공개"),
      count: publicCount,
    },
    {
      value: QuizListFilter.PRIVATE,
      label: t("나만 보기"),
      count: privateCount,
    },
  ];

  return (
    <section
      id="my-quizzes"
      className="grid gap-5"
      aria-label={t("내 퀴즈 목록")}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">
          {t("내 퀴즈")}{" "}
          <span className="text-primary">
            {quizzes.length}
          </span>
        </h1>
        <a
          href={createHref}
          className={`${styles["ui-button"]} primary min-h-11 motion-reduce:transform-none!`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-4 shrink-0"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          {t("새 퀴즈 만들기")}
        </a>
      </div>

      {quizzes.length > 0 && (
        <>
          <div
            role="tablist"
            aria-label={t("퀴즈 상태")}
            className="flex gap-5 overflow-x-auto whitespace-nowrap border-b border-line"
          >
            {tabs.map(({ value, label, count }) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                onClick={() =>
                  onViewChange({ filter: value, page: 1 })
                }
                className="shrink-0 border-b-2 border-transparent px-0 py-3 text-xs font-semibold text-muted aria-selected:border-primary aria-selected:text-primary"
              >
                {label} {count}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_minmax(220px,auto)] md:items-end">
            <label className="grid gap-2 text-xs font-semibold">
              <span className="sr-only">
                {t("퀴즈 검색")}
              </span>
              <span className="relative block">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4 4" />
                </svg>
                <input
                  type="search"
                  aria-label={t("퀴즈 검색")}
                  value={query}
                  onChange={(event) =>
                    onViewChange({
                      query: event.target.value,
                      page: 1,
                    })
                  }
                  placeholder={t("제목이나 태그 검색")}
                  className="min-h-11 w-full rounded-2xl border border-line bg-surface py-3 pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted"
                />
              </span>
            </label>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
              <Dropdown
                label={t("정렬")}
                options={sortOptions.map((option) => ({
                  ...option,
                  label: t(option.label),
                }))}
                value={sort}
                onValueChange={(value) =>
                  onViewChange({
                    sort: value as QuizListSort,
                    page: 1,
                  })
                }
              />
              <Button
                variant="ghost"
                size="sm"
                aria-label={t("목록 새로고침")}
                loading={isFetching}
                onClick={onRefresh}
                className="mb-1"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="size-4"
                >
                  <path d="M20 11a8 8 0 1 0-2.3 5.7" />
                  <path d="M20 5v6h-6" />
                </svg>
              </Button>
            </div>
          </div>
        </>
      )}

      {!quizzes.length && (
        <EmptyState
          title={t("저장한 퀴즈가 없습니다")}
          description={t(
            "퀴즈를 만들고 마음에 드는 결과를 저장하세요.",
          )}
        />
      )}

      {!!quizzes.length && !visible.length && (
        <EmptyState
          title={t("조건에 맞는 퀴즈가 없습니다")}
          description={t(
            "검색어나 상태 필터를 바꿔보세요.",
          )}
          action={
            <Button
              variant="secondary"
              onClick={() =>
                onViewChange({
                  query: "",
                  filter: QuizListFilter.ALL,
                  page: 1,
                })
              }
            >
              {t("검색과 필터 초기화")}
            </Button>
          }
        />
      )}

      {!!visible.length && (
        <div className="grid gap-3">
          {visible.map((quiz) => {
            const review = needsReview(quiz);

            return (
              <QuizCard
                density="compact"
                key={quiz.quizId}
                title={quiz.title}
                label={quiz.title}
                action={
                  quiz.status !== QuizStatus.PENDING &&
                  quizHref
                    ? {
                        href: quizHref(quiz.quizId),
                        disabled: busy,
                      }
                    : {
                        onClick: () => onOpen(quiz.quizId),
                        disabled: busy,
                        label: t("{0} 퀴즈 열기", {
                          0: quiz.title,
                        }),
                      }
                }
                settings={{
                  onClick: () => onOpen(quiz.quizId),
                  disabled: busy,
                  label: `${quiz.title} ${review ? t("검토하기") : t("관리하기")}`,
                }}
                footer={
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="min-w-0 flex-1 break-words text-xs leading-5 text-muted [overflow-wrap:anywhere]">
                      {quiz.hashtagIds
                        .map((hashtagId) => `#${hashtagId}`)
                        .join(" ")}
                    </span>
                    {quiz.status === QuizStatus.PUBLIC &&
                      renderReaction && (
                        <div className="shrink-0">
                          {renderReaction(quiz.quizId)}
                        </div>
                      )}
                  </div>
                }
                metadata={
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <StatusBadges quiz={quiz} />
                    <time
                      className="whitespace-nowrap text-xs"
                      dateTime={quiz.updatedAt}
                      aria-label={t("마지막 수정 {0}", {
                        0: exactTime(quiz.updatedAt),
                      })}
                    >
                      {relativeTime(quiz.updatedAt, t)}
                    </time>
                  </span>
                }
              />
            );
          })}
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <nav
          aria-label={t("퀴즈 목록 페이지")}
          className="flex flex-wrap items-center justify-center gap-1.5"
        >
          {Array.from({ length: pageCount }, (_, index) => {
            const number = index + 1;

            return (
              <button
                type="button"
                key={number}
                aria-label={t("{0}페이지", { 0: number })}
                aria-current={
                  number === currentPage
                    ? "page"
                    : undefined
                }
                onClick={() =>
                  onViewChange({ page: number })
                }
                className="grid size-9 place-items-center rounded-lg text-xs font-semibold text-muted aria-[current=page]:bg-primary-solid aria-[current=page]:text-on-primary"
              >
                {number}
              </button>
            );
          })}
        </nav>
      )}
    </section>
  );
}
