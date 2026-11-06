"use client";

import { useEffect, useState } from "react";
import { createBrowserApi } from "@/api/browser";
import type { ApiClient } from "@/api/client";
import {
  QuizScope,
  type GenerationBatch,
  type QuizSummary,
  type User,
} from "@/api/contracts";
import {
  Button,
  Card,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { Generation } from "@/features/quiz-authoring/generation";
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
    batch?: GenerationBatch;
  }>();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [dirty, setDirty] = useState(false);
  const [reload, setReload] = useState(0);

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
        const [users, items] = await Promise.all([
          api.request("discoverUsers", {}),
          api.request("quizzes", { scope: QuizScope.OWN }),
        ]);
        const batchId = params.get("batch");
        const batch = batchId
          ? await api.request("generationBatch", {
              batchId,
            })
          : undefined;

        if (!cancelled) {
          setSession({ api, userId, users, batch });
          setQuizzes(items);
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

  function rememberBatch({ batchId }: GenerationBatch) {
    const url = new URL(window.location.href);
    url.searchParams.set("batch", batchId);
    window.history.replaceState(null, "", url);
  }

  return (
    <div className={styles.stack}>
      <h1 className="text-3xl">퀴즈 작성실</h1>
      <p className="text-sm text-muted">
        더미 사용자로 동작하는 프로토타입입니다. 변경 사항은
        이 브라우저에 저장되며 데이터 삭제·기기 변경 시
        유실될 수 있습니다.
      </p>
      <RequestError error={error} />
      {!session ? (
        <>
          <Skeleton />
          {error && (
            <Button
              onClick={() =>
                setReload((value) => value + 1)
              }
            >
              다시 불러오기
            </Button>
          )}
        </>
      ) : (
        <>
          <label className={styles.field}>
            더미 사용자
            <select
              value={session.userId}
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
                setReload((value) => value + 1);
              }}
            >
              {session.users.map(
                ({ userId, displayName }) => (
                  <option key={userId} value={userId}>
                    {displayName}
                  </option>
                ),
              )}
            </select>
          </label>
          <Generation
            api={session.api}
            initialBatch={session.batch}
            onBatch={rememberBatch}
            onSaved={() => void refresh()}
            onDirty={setDirty}
          />
          <section
            id="my-quizzes"
            className={styles.stack}
            aria-label="내 퀴즈 목록"
          >
            <div className={styles.actions}>
              <h2 className="text-2xl">내 퀴즈 목록</h2>
              <Button
                variant="ghost"
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
                <Card key={quizId} className="grid gap-2">
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
                </Card>
              ),
            )}
          </section>
        </>
      )}
    </div>
  );
}
