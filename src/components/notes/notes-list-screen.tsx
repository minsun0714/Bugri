"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  type RefObject,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { ApiClientError } from "@/api/client";
import { NoteMatch } from "@/api/constants";
import { getErrorMessage } from "@/api/errors";
import {
  Button,
  EmptyState,
  Pagination,
  Skeleton,
} from "@/components/ui";
import { FilterChips } from "@/components/ui/filter-chips";
import { Highlight } from "@/components/ui/highlight";
import { SearchForm } from "@/components/ui/search-form";
import { NoteTags } from "@/components/notes/note-tags";
import { NotesGate } from "@/components/notes/notes-gate";
import {
  notesPageSize,
  useHashtags,
  useNotes,
  useNoteTags,
} from "@/components/notes/queries";
import { previewText } from "@/components/notes/rules";
import {
  hasCondition,
  noteHref,
  notesHref,
  parseNotesParams,
  untaggedChipId,
  type NotesCondition,
} from "@/components/notes/search-params";
import { historyStyles } from "@/components/learning-history/styles";
import { pageTitle } from "@/components/ui/styles";
import {
  useLocale,
  useTranslation,
} from "@/lib/i18n/use-translation";

const linkStyle =
  "inline-flex min-h-11 items-center rounded text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-primary";

function TagFilter({
  userId,
  condition,
  onChange,
}: {
  userId: string;
  condition: NotesCondition;
  onChange: (next: Partial<NotesCondition>) => void;
}) {
  const t = useTranslation();
  const { data } = useNoteTags(userId);
  const { data: directory } = useHashtags(userId);
  const { query, tagIds, untagged } = condition;
  const searching = query !== "";

  if (!data) return null;

  const options = [
    ...data.tags.map(({ hashtagId, count }) => ({
      id: hashtagId,
      count,
    })),
    // A tag chosen in the address stays visible so it can be switched off.
    ...tagIds
      .filter(
        (id) => !data.tags.some((tag) => tag.hashtagId === id),
      )
      .map((id) => ({ id, count: 0 })),
    ...(data.untaggedCount > 0 || untagged
      ? [{ id: untaggedChipId, count: data.untaggedCount }]
      : []),
  ];

  if (!options.length) return null;

  return (
    <section aria-label={t("태그 필터")}>
      <FilterChips
        options={options.map(({ id, count }) => ({
          id,
          // Counts cover all memos, so they are hidden while a search narrows the list.
          count: searching ? undefined : count,
          label:
            id === untaggedChipId
              ? t("태그 없음")
              : (directory?.find((tag) => tag.id === id)
                  ?.name ?? id),
        }))}
        value={[
          ...tagIds,
          ...(untagged ? [untaggedChipId] : []),
        ]}
        onChange={(next) =>
          onChange({
            tagIds: next.filter((id) => id !== untaggedChipId),
            untagged: next.includes(untaggedChipId),
          })
        }
      />
    </section>
  );
}

function NotesList({ userId }: { userId: string }) {
  const t = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const parsed = parseNotesParams(params);
  const { query, tagIds, untagged, page, queryTooLong } =
    parsed;
  const condition = { query, tagIds, untagged, page };
  const filtering = hasCondition(condition);
  const countRef = useRef<HTMLParagraphElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const focusResult = useRef(false);

  const { data, error, isPending, isFetching, refetch } =
    useNotes(userId, condition, !queryTooLong);

  // After the user changes the condition, announce the new result by moving focus to its count.
  useEffect(() => {
    if (focusResult.current && data) {
      focusResult.current = false;

      // With no condition left there is no count line, so focus returns to the search box.
      (
        countRef.current ??
        controlsRef.current?.querySelector("input")
      )?.focus();
    }
  }, [data]);

  function change(
    next: Partial<NotesCondition>,
    { announce = false } = {},
  ) {
    // Only a search or a reset moves focus to the count; toggling chips keeps focus on the chip
    // and the count is read out through its live region.
    focusResult.current = announce;

    // A changed condition starts from the first page; a page move keeps the rest.

    router.push(
      notesHref(userId, {
        ...condition,
        page: 1,
        ...next,
      }),
      { scroll: false },
    );
  }

  const reset = () =>
    change(
      {
        query: "",
        tagIds: [],
        untagged: false,
      },
      { announce: true },
    );

  const controls = (
    <div ref={controlsRef} className="space-y-4">
      <SearchForm
        key={query}
        label={t("내 노트 검색")}
        placeholder={t("메모와 퀴즈 내용 검색")}
        query={query}
        onSearch={(next) =>
          change({ query: next }, { announce: true })
        }
      />
      <TagFilter
        userId={userId}
        condition={condition}
        onChange={(next) => change(next)}
      />
    </div>
  );

  if (queryTooLong || (error && isInvalidCondition(error)))
    return (
      <div className="space-y-5">
        {controls}
        {/* The search field states the length limit itself; only the way out is added. */}
        {queryTooLong ? (
          <Button variant="secondary" onClick={reset}>
            {t("조건 초기화")}
          </Button>
        ) : (
          <div
            role="alert"
            className="space-y-3 rounded-xl border border-coral p-4"
          >
            <p>{t("주소의 검색 조건이 올바르지 않아요")}</p>
            <Button variant="secondary" onClick={reset}>
              {t("조건 초기화")}
            </Button>
          </div>
        )}
      </div>
    );

  if (error)
    return (
      <div className="space-y-5">
        {controls}
        <div className="space-y-3">
          <p
            role="alert"
            className="rounded-xl border border-coral p-4"
          >
            {t(getErrorMessage(error))}
          </p>
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
      </div>
    );

  if (isPending)
    return (
      <div className="space-y-5">
        {controls}
        <Skeleton />
      </div>
    );

  const { items, total } = data;

  return (
    <div className="space-y-5">
      {controls}
      {filtering && (
        <ResultCount total={total} countRef={countRef} />
      )}
      {!items.length ? (
        <EmptyList
          userId={userId}
          total={total}
          filtering={filtering}
          query={query}
          tagged={tagIds.length > 0 || untagged}
          onReset={reset}
          onFirstPage={() => change({ page: 1 })}
        />
      ) : (
        <>
          <ul
            aria-label={t("내 노트")}
            className="divide-y divide-line/70"
          >
            {items.map(
              ({
                noteId,
                excerpt,
                createdAt,
                confirmedCount,
                pendingCount,
                hashtagIds,
                matchedIn,
                matchedQuizTitle,
                matchedExcerpt,
              }) => (
                <li key={noteId}>
                  <Link
                    href={noteHref(userId, noteId, condition)}
                    className={`${historyStyles.row} items-start! sm:grid-cols-[minmax(0,1fr)_auto]`}
                  >
                    <span className="col-span-2 min-w-0 sm:col-span-1">
                      <span className="line-clamp-2 text-sm font-medium leading-6 [overflow-wrap:anywhere]">
                        <Highlight
                          text={
                            previewText(excerpt) ||
                            t("내용 없음")
                          }
                          query={query}
                        />
                      </span>
                      {matchedIn === NoteMatch.QUIZ && (
                        <span className="mt-1 block text-xs leading-5 text-muted [overflow-wrap:anywhere]">
                          <span className="font-semibold">
                            {t("퀴즈")}
                            {" · "}
                          </span>
                          <Highlight
                            text={matchedQuizTitle ?? ""}
                            query={query}
                          />
                          {matchedExcerpt && (
                            <span className="block">
                              <Highlight
                                text={matchedExcerpt}
                                query={query}
                              />
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                    <time
                      dateTime={createdAt}
                      className="col-span-2 text-xs tabular-nums text-muted sm:col-span-1 sm:text-right"
                    >
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(createdAt))}
                    </time>
                    <span className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted sm:col-span-full">
                      {(confirmedCount > 0 ||
                        pendingCount === 0) && (
                        <span>
                          {confirmedCount > 0
                            ? t("퀴즈 {0}개", {
                                0: confirmedCount,
                              })
                            : t("퀴즈 없음")}
                        </span>
                      )}
                      {pendingCount > 0 && (
                        <span className="font-semibold text-primary">
                          {t("확인 안 한 퀴즈 {0}개", {
                            0: pendingCount,
                          })}
                        </span>
                      )}
                      <NoteTags
                        userId={userId}
                        hashtagIds={hashtagIds}
                      />
                    </span>
                  </Link>
                </li>
              ),
            )}
          </ul>
          {total > notesPageSize && (
            <div className="mt-4 flex justify-center border-t border-line pt-4">
              <Pagination
                compact
                page={page}
                total={Math.ceil(total / notesPageSize)}
                onChange={(next) => change({ page: next })}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function isInvalidCondition(error: unknown) {
  return (
    error instanceof ApiClientError &&
    error.detail.code === "VALIDATION_ERROR"
  );
}

function ResultCount({
  total,
  countRef,
}: {
  total: number;
  countRef: RefObject<HTMLParagraphElement | null>;
}) {
  const t = useTranslation();

  return (
    <p
      ref={countRef}
      tabIndex={-1}
      role="status"
      className="text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary"
    >
      {t("검색 결과 {0}개", { 0: total })}
    </p>
  );
}

function EmptyList({
  userId,
  total,
  filtering,
  query,
  tagged,
  onReset,
  onFirstPage,
}: {
  userId: string;
  total: number;
  filtering: boolean;
  query: string;
  tagged: boolean;
  onReset: () => void;
  onFirstPage: () => void;
}) {
  const t = useTranslation();

  if (total > 0)
    return (
      <EmptyState
        description=""
        title={t("이 페이지에는 메모가 없어요")}
        action={
          <Button variant="secondary" onClick={onFirstPage}>
            {t("첫 페이지로")}
          </Button>
        }
      />
    );

  if (filtering)
    return (
      <EmptyState
        description=""
        title={
          query
            ? t(
                tagged
                  ? "선택한 태그 안에 “{0}”와 일치하는 메모가 없어요"
                  : "“{0}”와 일치하는 메모가 없어요",
                { 0: query },
              )
            : t("조건에 맞는 메모가 없어요")
        }
        action={
          <Button variant="secondary" onClick={onReset}>
            {t("조건 초기화")}
          </Button>
        }
      />
    );

  return (
    <EmptyState
      description=""
      title={t("아직 메모가 없어요")}
      action={
        <Link
          href={`/?${new URLSearchParams({ user: userId })}`}
          className={linkStyle}
        >
          {t("홈에서 첫 메모 쓰기")}
        </Link>
      }
    />
  );
}

export function NotesListScreen() {
  const t = useTranslation();

  return (
    <div className="w-full min-w-0 space-y-6">
      <h1 className={pageTitle}>{t("내 노트")}</h1>
      <NotesGate>
        {(userId) => <NotesList userId={userId} />}
      </NotesGate>
    </div>
  );
}
