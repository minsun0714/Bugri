"use client";

import { Tooltip } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { createBrowserApi } from "@/api/browser";
import type { ApiClient } from "@/api/client";
import {
  QuizScope,
  type GenerationBatch,
  type Hashtag,
  type QuizSummary,
  type ReviewQuiz,
  type User,
} from "@/api/contracts";
import {
  Button,
  Card,
  EmptyState,
  Skeleton,
  Select,
} from "@/components/ui";
import { Generation } from "@/features/quiz-authoring/generation";
import { ReviewEditor } from "@/features/quiz-authoring/review-editor";
import { RequestError } from "@/features/quiz-authoring/feedback";
import { styles } from "@/features/quiz-authoring/styles";
import {
  leaveMessage,
  useUnsavedWarning,
} from "@/features/quiz-authoring/use-unsaved-warning";

export function AuthoringWorkspace() {
  const [session, setSession] = useState<{
    api: ApiClient;
    userId: string;
    users: User[];
    tags: Hashtag[];
    batch?: GenerationBatch;
  }>();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [review, setReview] = useState<ReviewQuiz>();
  const [error, setError] = useState<unknown>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [notice, setNotice] = useState("");

  useUnsavedWarning(dirty);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const params = new URLSearchParams(
          window.location.search,
        );
        const userId = params.get("user") ?? "learner";
        const api = await createBrowserApi({
          mode: "mock",
          userId,
        });
        const [users, items, tags] = await Promise.all([
          api.request("discoverUsers", {}),
          api.request("quizzes", { scope: QuizScope.OWN }),
          api.request("discoverHashtags", {}),
        ]);
        const batchId = params.get("batch");
        const quizId = params.get("quiz");
        const batch = batchId
          ? await api.request("generationBatch", {
              batchId,
            })
          : undefined;
        const selected = quizId
          ? await api.request("reviewQuiz", { quizId })
          : undefined;

        if (!cancelled) {
          setSession({ api, userId, users, tags, batch });
          setQuizzes(items);
          setReview(selected);
          setError(null);
        }
      } catch (error) {
        if (!cancelled) setError(error);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  async function refresh() {
    if (!session) return;

    try {
      setQuizzes(
        await session.api.request("quizzes", {
          scope: QuizScope.OWN,
        }),
      );
      setError(null);
    } catch (error) {
      setError(error);
    }
  }

  function rememberBatch(batch: GenerationBatch) {
    const url = new URL(window.location.href);
    url.searchParams.set("batch", batch.batchId);
    window.history.replaceState(null, "", url);
    setSession((current) =>
      current ? { ...current, batch } : current,
    );
  }

  function closeReview() {
    const url = new URL(window.location.href);
    url.searchParams.delete("quiz");
    window.history.replaceState(null, "", url);
    setReview(undefined);
    setDirty(false);
  }

  async function openReview(quizId: string) {
    if (review?.quizId === quizId) return;
    if (
      !session ||
      busy ||
      (dirty && !window.confirm(leaveMessage))
    )
      return;
    setBusy(true);
    try {
      const result = await session.api.request(
        "reviewQuiz",
        { quizId },
      );
      const url = new URL(window.location.href);
      url.searchParams.set("quiz", quizId);
      window.history.replaceState(null, "", url);
      setDirty(false);
      setReview(result);
      setNotice("");
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.stack}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            퀴즈
          </h1>
          <Tooltip label="저장 및 사용자 안내">
            더미 사용자로 체험합니다. 변경 사항은 이
            브라우저에만 저장되며 브라우저 데이터 삭제 시
            사라집니다.
          </Tooltip>
        </div>
        {session && (
          <div className="w-full sm:w-52">
            <Select
              label="더미 사용자"
              value={session.userId}
              disabled={busy}
              options={session.users.map(
                ({ userId, displayName }) => ({
                  value: userId,
                  label: displayName,
                }),
              )}
              onChange={(event) => {
                if (dirty && !window.confirm(leaveMessage))
                  return;
                window.history.replaceState(
                  null,
                  "",
                  `/quizzes/authoring?user=${encodeURIComponent(event.target.value)}`,
                );
                setDirty(false);
                setSession(undefined);
                setReview(undefined);
                setNotice("");
                setReload((value) => value + 1);
              }}
            />
          </div>
        )}
      </div>
      <RequestError error={error} />
      {notice && (
        <p role="status" className="text-primary">
          {notice}
        </p>
      )}
      {!session ? (
        <>
          {!error && <Skeleton />}
          {error && (
            <div className={styles.actions}>
              <Button
                onClick={() =>
                  setReload((value) => value + 1)
                }
              >
                다시 불러오기
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  window.history.replaceState(
                    null,
                    "",
                    "/quizzes/authoring",
                  );
                  setReload((value) => value + 1);
                }}
              >
                기본 사용자 목록으로 돌아가기
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          {review ? (
            <>
              <div>
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    if (
                      dirty &&
                      !window.confirm(leaveMessage)
                    )
                      return;
                    closeReview();
                  }}
                >
                  생성 화면으로 돌아가기
                </Button>
              </div>
              <ReviewEditor
                key={review.quizId}
                api={session.api}
                initialQuiz={review}
                tags={session.tags}
                onChanged={() => void refresh()}
                onDeleted={() => {
                  closeReview();
                  setNotice("퀴즈를 삭제했습니다.");
                  void refresh();
                }}
                onDirty={setDirty}
                onBusy={setBusy}
              />
            </>
          ) : (
            <Generation
              api={session.api}
              initialBatch={session.batch}
              onBatch={rememberBatch}
              onSaved={() => void refresh()}
              onDirty={setDirty}
              onBusy={setBusy}
            />
          )}
          <section
            id="my-quizzes"
            className={styles.stack}
            aria-label="내 퀴즈 목록"
          >
            <div className={styles.actions}>
              <h2 className="text-2xl">내 퀴즈 목록</h2>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => void refresh()}
              >
                목록 새로고침
              </Button>
            </div>
            {!quizzes.length && (
              <EmptyState
                title="저장한 퀴즈가 없습니다"
                description="학습 내용을 입력하고 생성 후보를 저장해보세요."
                action={
                  <a
                    href="#generate"
                    className="text-primary underline"
                  >
                    퀴즈 만들기
                  </a>
                }
              />
            )}
            {quizzes.map(
              ({
                quizId,
                title,
                status,
                updatedAt,
                hasPendingRevision,
              }) => (
                <Card key={quizId} className="grid gap-3">
                  <h3>{title}</h3>
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
                      disabled={
                        busy || review?.quizId === quizId
                      }
                      onClick={() =>
                        void openReview(quizId)
                      }
                    >
                      {title} 검토·관리
                    </Button>
                  </div>
                </Card>
              ),
            )}
          </section>
        </>
      )}
    </div>
  );
}
