"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/api/query-client";
import {
  AttemptContext,
  AttemptHistoryFilter,
} from "@/api/constants";
import { useDemoSession } from "@/components/navigation/demo-session";
import {
  useLocale,
  useTranslation,
} from "@/lib/i18n/use-translation";
import {
  Badge,
  Button,
  EmptyState,
  Pagination,
  SearchField,
  Skeleton,
  Tabs,
} from "@/components/ui";
import { ErrorNotice } from "@/components/solving/error-notice";
import { QuizPanel } from "@/components/solving/quiz-panel";
import { useSolvingQueries } from "@/components/solving/queries";
import { useAttemptHistory } from "@/components/learning-history/queries";
import { Bugri } from "@/components/ui/bugri";
import { historyStyles } from "@/components/learning-history/styles";
import {
  pageTitle,
  searchButtonStyle,
  viewAllAction,
} from "@/components/ui/styles";
import { historyQueryMaxLength } from "@/services/history-search";

const koreanLabels = {
  [AttemptHistoryFilter.ALL]: "전체",
  [AttemptHistoryFilter.CORRECT]: "정답",
  [AttemptHistoryFilter.INCORRECT]: "오답",
};

function historyHref(
  userId: string,
  filter: AttemptHistoryFilter,
  page: number,
  query: string,
) {
  return `/my/learning?${new URLSearchParams({
    user: userId,
    filter,
    ...(query ? { query } : {}),
    page: String(page),
  })}`;
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps the searched words in <mark>; plain text when there is no query. */
function Highlight({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const words = query.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return <>{text}</>;

  const pattern = new RegExp(
    `(${words.map(escapeRegExp).join("|")})`,
    "gi",
  );

  return (
    <>
      {text.split(pattern).map((part, index) =>
        index % 2 ? (
          <mark
            key={index}
            className="rounded-sm bg-lime/60 px-0.5 text-foreground"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

function HistorySearch({
  query,
  onSearch,
}: {
  query: string;
  onSearch: (query: string) => void;
}) {
  const t = useTranslation();
  const [draft, setDraft] = useState(query);
  const invalid =
    [...draft.trim()].length > historyQueryMaxLength;

  return (
    <form
      role="search"
      aria-label={t("풀이 내역 검색")}
      className="flex items-start gap-2 sm:gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!invalid) onSearch(draft.trim());
      }}
    >
      <SearchField
        label={t("풀이 내역 검색")}
        placeholder={t("제목이나 문제 내용 검색")}
        value={draft}
        error={
          invalid
            ? t("검색어는 100자 이하여야 합니다.")
            : undefined
        }
        onChange={(event) => setDraft(event.target.value)}
      />
      <Button
        type="submit"
        className={searchButtonStyle}
        disabled={invalid}
      >
        {t("검색")}
      </Button>
      {query && (
        <Button
          type="button"
          variant="secondary"
          className={searchButtonStyle}
          onClick={() => {
            setDraft("");
            onSearch("");
          }}
        >
          {t("검색 초기화")}
        </Button>
      )}
    </form>
  );
}

const linkStyle =
  "inline-flex min-h-11 items-center rounded text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-primary";

function HistorySession({
  userId,
  attemptId,
}: {
  userId: string;
  attemptId?: string;
}) {
  const t = useTranslation();
  const locale = useLocale();
  const params = useSearchParams();
  const router = useRouter();
  const requestedFilter = params.get("filter");
  const filter =
    Object.values(AttemptHistoryFilter).find(
      (value) => value === requestedFilter,
    ) ?? AttemptHistoryFilter.ALL;
  const query = [...(params.get("query") ?? "").trim()]
    .slice(0, historyQueryMaxLength)
    .join("");
  const requestedPage = Number(params.get("page") ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const detailParams = new URLSearchParams({
    user: userId,
    filter,
    ...(query ? { query } : {}),
    page: String(page),
  });
  const backHref = historyHref(userId, filter, page, query);

  if (attemptId)
    return (
      <HistoryResult
        key={`${userId}:${attemptId}`}
        userId={userId}
        attemptId={attemptId}
        backHref={backHref}
      />
    );

  return (
    <HistoryList
      userId={userId}
      filter={filter}
      page={page}
      query={query}
      detailQuery={detailParams.toString()}
      onChange={(
        nextFilter,
        nextPage,
        nextQuery = query,
      ) => {
        router.push(
          historyHref(
            userId,
            nextFilter,
            nextPage,
            nextQuery,
          ),
          { scroll: false },
        );
      }}
      locale={locale}
      t={t}
    />
  );
}

function HistoryList({
  userId,
  filter,
  page,
  query,
  detailQuery,
  onChange,
  locale,
  t,
}: {
  userId: string;
  filter: AttemptHistoryFilter;
  page: number;
  query: string;
  detailQuery: string;
  onChange: (
    filter: AttemptHistoryFilter,
    page: number,
    query?: string,
  ) => void;
  locale: string;
  t: ReturnType<typeof useTranslation>;
}) {
  const labels =
    locale === "en"
      ? {
          ALL: "All",
          CORRECT: "Correct",
          INCORRECT: "Incorrect",
        }
      : koreanLabels;
  const { data, error, isPending, isFetching, refetch } =
    useAttemptHistory(userId, filter, page, query);
  return (
    <div className="min-w-0 space-y-5">
      <HistorySearch
        key={query}
        query={query}
        onSearch={(next) => onChange(filter, 1, next)}
      />
      <Tabs
        className={historyStyles.filters}
        label={t("풀이 내역 필터")}
        items={Object.values(labels)}
        value={labels[filter]}
        onChange={(label) =>
          onChange(
            Object.values(AttemptHistoryFilter).find(
              (value) => labels[value] === label,
            )!,
            1,
          )
        }
        panelClassName="pt-5! text-foreground!"
      >
        {isPending && <Skeleton />}
        {error && (
          <div className="space-y-3">
            <ErrorNotice error={error} />
            <div className="flex justify-end">
              <Button
                variant="secondary"
                loading={isFetching}
                onClick={() => void refetch()}
              >
                {t("다시 시도")}
              </Button>
            </div>
          </div>
        )}
        {data && !error && (
          <>
            {data.items.length ? (
              <ul
                aria-label={t("풀이 내역")}
                className="divide-y divide-line/70"
              >
                {data.items.map(
                  ({
                    attemptId,
                    title,
                    correct,
                    completedAt,
                    excerpt,
                  }) => (
                    <li key={attemptId}>
                      <Link
                        href={`/my/learning/${encodeURIComponent(attemptId)}?${detailQuery}`}
                        className={historyStyles.row}
                      >
                        <span className="col-span-2 min-w-0 text-sm font-semibold [overflow-wrap:anywhere] sm:col-span-1">
                          <Highlight
                            text={
                              title ??
                              t("이용할 수 없는 퀴즈")
                            }
                            query={title ? query : ""}
                          />
                          {excerpt && (
                            <span className="mt-1 block text-xs font-normal leading-5 text-muted">
                              <Highlight
                                text={excerpt}
                                query={query}
                              />
                            </span>
                          )}
                        </span>
                        <Badge
                          tone={
                            correct === true
                              ? "success"
                              : correct === false
                                ? "danger"
                                : "neutral"
                          }
                        >
                          {t(
                            correct === true
                              ? labels.CORRECT
                              : correct === false
                                ? labels.INCORRECT
                                : "기록 없음",
                          )}
                        </Badge>
                        <time
                          dateTime={completedAt}
                          className="text-right text-xs tabular-nums text-muted"
                        >
                          {new Intl.DateTimeFormat(locale, {
                            dateStyle: "medium",
                            timeStyle: "medium",
                          }).format(new Date(completedAt))}
                        </time>
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <EmptyState
                description=""
                title={
                  query && data.total === 0
                    ? t("“{0}”와 일치하는 풀이가 없어요", {
                        0: query,
                      })
                    : t(
                        data.total > 0
                          ? "이 페이지에는 풀이 내역이 없어요"
                          : filter ===
                              AttemptHistoryFilter.ALL
                            ? "아직 풀이 내역이 없어요"
                            : filter ===
                                AttemptHistoryFilter.CORRECT
                              ? "정답 기록이 없어요"
                              : "오답 기록이 없어요",
                      )
                }
                action={
                  query && data.total === 0 ? (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        onChange(filter, 1, "")
                      }
                    >
                      {t("검색 초기화")}
                    </Button>
                  ) : data.total > 0 ? (
                    <Button
                      variant="secondary"
                      onClick={() => onChange(filter, 1)}
                    >
                      {t("첫 페이지로")}
                    </Button>
                  ) : filter ===
                    AttemptHistoryFilter.ALL ? (
                    <Link
                      href={`/?user=${encodeURIComponent(userId)}`}
                      className={linkStyle}
                    >
                      {t("홈에서 퀴즈 풀기")}
                    </Link>
                  ) : (
                    <button
                      className={viewAllAction}
                      onClick={() =>
                        onChange(
                          AttemptHistoryFilter.ALL,
                          1,
                        )
                      }
                    >
                      {t("전체 보기")}
                    </button>
                  )
                }
              />
            )}
            {data.total > 20 && data.items.length > 0 && (
              <div className="mt-4 flex justify-center border-t border-line pt-4">
                <Pagination
                  compact
                  page={page}
                  total={Math.ceil(data.total / 20)}
                  onChange={(nextPage) =>
                    onChange(filter, nextPage, query)
                  }
                />
              </div>
            )}
          </>
        )}
      </Tabs>
    </div>
  );
}

function HistoryResult({
  userId,
  attemptId,
  backHref,
}: {
  userId: string;
  attemptId: string;
  backHref: string;
}) {
  const t = useTranslation();
  const router = useRouter();
  const { attempt, start } = useSolvingQueries(
    userId,
    attemptId,
  );
  const { data } = attempt;
  return (
    <div className="space-y-4">
      <Link href={backHref} className={linkStyle}>
        {t("풀이 내역으로 돌아가기")}
      </Link>
      {attempt.isPending && <Skeleton />}
      {attempt.error && (
        <>
          <ErrorNotice error={attempt.error} />
          <div className="flex justify-end">
            <Button
              loading={attempt.isFetching}
              onClick={() => void attempt.refetch()}
            >
              {t("다시 시도")}
            </Button>
          </div>
        </>
      )}
      {start.error && <ErrorNotice error={start.error} />}
      {data &&
        !attempt.error &&
        (data.completedAt ? (
          <QuizPanel
            quiz={data.quiz}
            result={data.result}
            completedAt={data.completedAt}
            correct={data.correct}
            learningDate={data.learningDate}
            focusKey={data.attemptId}
            autoFocus={false}
            pending={false}
            onSubmit={() => {}}
          >
            {data.quiz ? (
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  loading={start.isPending}
                  onClick={() =>
                    start.mutate(
                      {
                        quizId: data.quizId,
                        context: AttemptContext.DIRECT,
                      },
                      {
                        onSuccess: ({
                          attemptId: nextId,
                        }) =>
                          router.push(
                            `/solve?${new URLSearchParams({ user: userId, attempt: nextId })}`,
                          ),
                      },
                    )
                  }
                >
                  {t("다시 풀기")}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted">
                {t(
                  "현재 이용할 수 없어 다시 풀 수 없어요.",
                )}
              </p>
            )}
          </QuizPanel>
        ) : (
          <EmptyState
            description=""
            title={t("제출 완료한 풀이만 확인할 수 있어요")}
          />
        ))}
    </div>
  );
}

export function HistoryScreen({
  attemptId,
}: {
  attemptId?: string;
}) {
  const t = useTranslation();
  const params = useSearchParams();
  const userId = params.get("user");
  const { signIn } = useDemoSession();
  const [client] = useState(createQueryClient);
  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex items-center gap-3">
        {!attemptId && (
          <div
            aria-hidden="true"
            className="relative size-10 shrink-0"
          >
            <div className="absolute left-0 top-0 origin-top-left scale-[0.416667]">
              <Bugri small mood="neutral" />
            </div>
          </div>
        )}
        <h1 className={pageTitle}>
          {t(attemptId ? "풀이 결과" : "풀이 내역")}
        </h1>
      </div>
      {userId ? (
        <QueryClientProvider client={client}>
          <HistorySession
            key={userId}
            userId={userId}
            attemptId={attemptId}
          />
        </QueryClientProvider>
      ) : (
        <EmptyState
          description=""
          title={t("데모 사용자를 선택해 주세요")}
          action={
            <Button onClick={() => signIn()}>
              {t("데모 사용자 선택")}
            </Button>
          }
        />
      )}
    </div>
  );
}
