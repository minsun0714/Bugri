"use client";

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
  Card,
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

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () =>
    window.removeEventListener("popstate", callback);
}

function setLocationParam(key: string, value?: string) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
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
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => null,
  );
  const params = new URLSearchParams(search ?? "");
  const userId = params.get("user") ?? "learner";
  const quizId = params.get("quiz") ?? "";
  const batchId = params.get("batch") ?? "";
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
    setLocationParam("batch", batchId);
  }
  function closeReview() {
    setDirty(false);
    setLocationParam("quiz");
  }
  function openReview(id: string) {
    if (busy || (dirty && !window.confirm(leaveMessage)))
      return;
    setDirty(false);
    setLocationParam("quiz", id);
    setNotice("");
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
        <div>
          <Button onClick={() => void retry()}>
            다시 불러오기
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
          {mode === "create" ? "새로 만들기" : "목록으로"}
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
          title="생성 결과를 선택하세요"
          description="대화에서 퀴즈를 생성하면 이곳에서 확인할 수 있습니다."
          action={
            <a
              href={createHref}
              className="text-primary underline"
            >
              대화로 돌아가기
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">내 퀴즈</h1>
        <a
          href={createHref}
          className="text-sm font-semibold text-primary"
        >
          퀴즈 만들기 ↗
        </a>
      </div>
      {notice && (
        <p role="status" className="text-primary">
          {notice}
        </p>
      )}
      {review.data && quizId && (
        <>
          <div>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                if (dirty && !window.confirm(leaveMessage))
                  return;
                closeReview();
              }}
            >
              목록으로
            </Button>
          </div>
          <ReviewEditor
            key={`${userId}:${quizId}`}
            api={api}
            userId={userId}
            initialQuiz={review.data}
            tags={tags.data ?? []}
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
        <section
          id="my-quizzes"
          className={styles.stack}
          aria-label="내 퀴즈 목록"
        >
          <div>
            <Button
              variant="ghost"
              disabled={list.isFetching}
              onClick={() => void list.refetch()}
            >
              목록 새로고침
            </Button>
          </div>
          {!list.data?.length && (
            <EmptyState
              title="저장한 퀴즈가 없습니다"
              description="퀴즈를 만들고 마음에 드는 결과를 저장하세요."
              action={
                <a
                  href={createHref}
                  className="text-primary underline"
                >
                  퀴즈 만들기
                </a>
              }
            />
          )}
          {list.data?.map(
            ({
              quizId: id,
              title,
              status,
              updatedAt,
              hasPendingRevision,
            }) => (
              <Card key={id} className="grid gap-3">
                <h2>{title}</h2>
                <p>
                  {status}
                  {hasPendingRevision
                    ? " · 검토할 수정본 있음"
                    : ""}
                </p>
                <time
                  dateTime={updatedAt}
                  className="text-sm text-muted"
                >
                  최종 저장:{" "}
                  {new Date(updatedAt).toLocaleString(
                    "ko-KR",
                  )}
                </time>
                <div>
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => openReview(id)}
                  >
                    {title} 검토·관리
                  </Button>
                </div>
              </Card>
            ),
          )}
        </section>
      )}
    </div>
  );
}
