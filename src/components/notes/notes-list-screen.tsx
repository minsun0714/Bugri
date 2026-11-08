"use client";

import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { getErrorMessage } from "@/api/errors";
import {
  Button,
  EmptyState,
  Pagination,
  Skeleton,
} from "@/components/ui";
import { NoteTags } from "@/components/notes/note-tags";
import { NotesGate } from "@/components/notes/notes-gate";
import {
  notesPageSize,
  useNotes,
} from "@/components/notes/queries";
import { previewText } from "@/components/notes/rules";
import { historyStyles } from "@/components/learning-history/styles";
import { pageTitle } from "@/components/ui/styles";
import {
  useLocale,
  useTranslation,
} from "@/lib/i18n/use-translation";

function notesHref(userId: string, page: number) {
  return `/notes?${new URLSearchParams({
    user: userId,
    ...(page > 1 ? { page: String(page) } : {}),
  })}`;
}

function NotesList({ userId }: { userId: string }) {
  const t = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const requested = Number(
    useSearchParams().get("page") ?? 1,
  );
  const page =
    Number.isSafeInteger(requested) && requested > 0
      ? requested
      : 1;

  const { data, error, isPending, isFetching, refetch } =
    useNotes(userId, page);

  if (isPending) return <Skeleton />;

  if (error)
    return (
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
    );

  const { items, total } = data;

  if (!items.length)
    return (
      <EmptyState
        description=""
        title={t(
          total > 0
            ? "이 페이지에는 메모가 없어요"
            : "아직 메모가 없어요",
        )}
        action={
          total > 0 ? (
            <Button
              variant="secondary"
              onClick={() =>
                router.push(notesHref(userId, 1), {
                  scroll: false,
                })
              }
            >
              {t("첫 페이지로")}
            </Button>
          ) : (
            <Link
              href={`/?${new URLSearchParams({ user: userId })}`}
              className="inline-flex min-h-11 items-center rounded text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              {t("홈에서 첫 메모 쓰기")}
            </Link>
          )
        }
      />
    );

  return (
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
          }) => (
            <li key={noteId}>
              <Link
                href={`/notes/${encodeURIComponent(noteId)}?${new URLSearchParams({ user: userId })}`}
                className={`${historyStyles.row} sm:grid-cols-[minmax(0,1fr)_auto]`}
              >
                <span className="col-span-2 line-clamp-2 min-w-0 text-sm font-medium leading-6 [overflow-wrap:anywhere] sm:col-span-1">
                  {previewText(excerpt) || t("내용 없음")}
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
                  <span>
                    {confirmedCount > 0
                      ? t("퀴즈 {0}개", {
                          0: confirmedCount,
                        })
                      : t("퀴즈 없음")}
                  </span>
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
            onChange={(next) =>
              router.push(notesHref(userId, next), {
                scroll: false,
              })
            }
          />
        </div>
      )}
    </>
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
