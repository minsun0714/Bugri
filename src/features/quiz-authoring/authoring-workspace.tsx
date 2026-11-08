"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { Creation } from "@/features/quiz-authoring/creation";
import { useState, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import {
  QuizScope,
  type GenerationBatch,
} from "@/api/contracts";
import {
  Button,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { Generation } from "@/features/quiz-authoring/generation";
import { ReviewEditor } from "@/features/quiz-authoring/review-editor";
import { RequestError } from "@/features/quiz-authoring/feedback";
import { AuthoringQueryProvider } from "@/features/quiz-authoring/query-provider";
import { useAuthoringQuery } from "@/features/quiz-authoring/hooks/use-authoring-api";
import { styles } from "@/features/quiz-authoring/styles";
import {
  leaveMessage,
  useUnsavedWarning,
} from "@/features/quiz-authoring/use-unsaved-warning";
import {
  QuizList,
  QuizListFilter,
  QuizListSort,
  type QuizListView,
} from "@/features/quiz-authoring/quiz-list";

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () =>
    window.removeEventListener("popstate", callback);
}

function setLocationParams(
  updates: Record<string, string | undefined>,
) {
  const url = new URL(window.location.href);

  Object.entries(updates).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  });

  window.history.replaceState(null, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function readFilter(value: string | null) {
  return (
    Object.values(QuizListFilter).find(
      (filter) => filter === value,
    ) ?? QuizListFilter.ALL
  );
}

function readSort(value: string | null) {
  return (
    Object.values(QuizListSort).find(
      (sort) => sort === value,
    ) ?? QuizListSort.NEWEST
  );
}

export function AuthoringWorkspace({
  mode = "create",
}: {
  mode?: "create" | "manage" | "results";
}) {
  return (
    <AuthoringQueryProvider>
      <Workspace mode={mode} />
    </AuthoringQueryProvider>
  );
}

function Workspace({
  mode,
}: {
  mode: "create" | "manage" | "results";
}) {
  const t = useTranslation();

  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => null,
  );
  const params = new URLSearchParams(search ?? "");
  const userId = params.get("user") ?? "learner";
  const quizId = params.get("quiz") ?? "";
  const batchId = params.get("batch") ?? "";
  const parsedPage = Number(params.get("page") ?? "1");
  const listView: QuizListView = {
    query: params.get("q") ?? "",
    filter: readFilter(params.get("status")),
    sort: readSort(params.get("sort")),
    page:
      Number.isInteger(parsedPage) && parsedPage > 0
        ? parsedPage
        : 1,
  };
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const apiQuery = useQuery({
    queryKey: ["authoring-client", userId],
    queryFn: () =>
      createBrowserApi({ mode: "mock", userId }),
    enabled: search !== null,
    staleTime: Infinity,
  });
  const { data: api } = apiQuery;
  const batch = useAuthoringQuery(
    api,
    userId,
    "generationBatch",
    { batchId },
    mode !== "manage" && !!batchId,
  );
  const list = useAuthoringQuery(
    api,
    userId,
    "quizzes",
    { scope: QuizScope.OWN },
    mode === "manage",
  );
  const review = useAuthoringQuery(
    api,
    userId,
    "reviewQuiz",
    { quizId },
    mode === "manage" && !!quizId,
  );
  const tags = useAuthoringQuery(
    api,
    userId,
    "discoverHashtags",
    {},
    mode === "manage" && !!quizId,
  );
  const error =
    apiQuery.error ??
    (mode !== "manage"
      ? batch.error
      : (list.error ?? review.error ?? tags.error));
  const createHref = `/quizzes/authoring?user=${encodeURIComponent(userId)}`;

  useUnsavedWarning(dirty);

  function showResults({ batchId }: GenerationBatch) {
    setDirty(false);
    setLocationParams({ batch: batchId });
  }
  function closeReview() {
    setDirty(false);
    setLocationParams({ quiz: undefined });
  }
  function openReview(id: string) {
    if (busy || (dirty && !window.confirm(t(leaveMessage))))
      return;
    setDirty(false);
    setLocationParams({ quiz: id });
    setNotice("");
  }

  function changeListView(change: Partial<QuizListView>) {
    setLocationParams({
      ...(change.query !== undefined
        ? { q: change.query || undefined }
        : {}),
      ...(change.filter !== undefined
        ? {
            status:
              change.filter === QuizListFilter.ALL
                ? undefined
                : change.filter,
          }
        : {}),
      ...(change.sort !== undefined
        ? {
            sort:
              change.sort === QuizListSort.NEWEST
                ? undefined
                : change.sort,
          }
        : {}),
      ...(change.page !== undefined
        ? {
            page:
              change.page === 1
                ? undefined
                : String(change.page),
          }
        : {}),
    });
  }

  async function retry() {
    await Promise.all([
      apiQuery.refetch(),
      ...(mode !== "manage"
        ? batchId
          ? [batch.refetch()]
          : []
        : [
            list.refetch(),
            ...(quizId
              ? [review.refetch(), tags.refetch()]
              : []),
          ]),
    ]);
  }

  if (error)
    return (
      <div className={styles.stack}>
        <RequestError error={error} />
        <div className={styles.actions}>
          <Button onClick={() => void retry()}>
            {t("다시 불러오기")}
          </Button>
        </div>
        <a
          href={
            mode === "create"
              ? createHref
              : `/quizzes/authoring/manage?user=${encodeURIComponent(userId)}`
          }
          className="text-primary underline"
        >
          {mode === "create"
            ? t("새로 만들기")
            : t("목록으로")}
        </a>
      </div>
    );
  if (
    !api ||
    (mode !== "manage" && batchId && !batch.data) ||
    (mode === "manage" && !list.data) ||
    (mode === "manage" &&
      quizId &&
      (!review.data || !tags.data))
  )
    return <Skeleton />;

  if (mode === "create")
    return (
      <Creation
        key={userId}
        api={api}
        userId={userId}
        initialBatch={batch.data}
        onGenerated={showResults}
        onDirty={setDirty}
      />
    );

  if (mode === "results") {
    if (!batch.data)
      return (
        <EmptyState
          title={t("생성 결과를 선택하세요")}
          description={t(
            "대화에서 퀴즈를 생성하면 이곳에서 확인할 수 있습니다.",
          )}
          action={
            <a
              href={createHref}
              className="text-primary underline"
            >
              {t("대화로 돌아가기")}
            </a>
          }
        />
      );
    return (
      <Generation
        key={`${userId}:${batchId}`}
        api={api}
        userId={userId}
        initialBatch={batch.data}
        onBatch={() => {}}
        onSaved={() => {}}
        onDirty={setDirty}
        onBusy={setBusy}
      />
    );
  }

  return (
    <div className={styles.stack}>
      {notice && (
        <p role="status" className="text-primary">
          {t(notice)}
        </p>
      )}
      {review.data && quizId && (
        <>
          <ReviewEditor
            key={`${userId}:${quizId}`}
            api={api}
            userId={userId}
            initialQuiz={review.data}
            tags={tags.data ?? []}
            onBack={() => {
              if (dirty && !window.confirm(t(leaveMessage)))
                return;
              closeReview();
            }}
            onChanged={() => void list.refetch()}
            onDeleted={() => {
              closeReview();
              setNotice("퀴즈를 삭제했습니다.");
              void list.refetch();
            }}
            onDirty={setDirty}
            onBusy={setBusy}
          />
        </>
      )}
      {!quizId && (
        <QuizList
          quizzes={list.data ?? []}
          view={listView}
          createHref={createHref}
          isFetching={list.isFetching}
          busy={busy}
          onViewChange={changeListView}
          onOpen={openReview}
          onRefresh={() => void list.refetch()}
        />
      )}
    </div>
  );
}
