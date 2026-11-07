"use client";

import { useAuthoringActions } from "@/features/quiz-authoring/hooks/use-authoring-api";
import { Dropdown } from "@/components/ui/dropdown";
import { Tooltip } from "@/components/ui/tooltip";
import { useEffect, useRef, useState } from "react";
import type { ApiClient } from "@/api/client";
import {
  QuizStatus,
  type Hashtag,
  type ReviewQuiz,
  type Visibility,
} from "@/api/contracts";
import { Button, Card, TextField } from "@/components/ui";
import { ContentFields } from "@/features/quiz-authoring/content-fields";
import { ContentPreview } from "@/features/quiz-authoring/content-preview";
import { RequestError } from "@/features/quiz-authoring/feedback";
import {
  editableContent,
  validateEditor,
} from "@/features/quiz-authoring/validation";
import { leaveMessage } from "@/features/quiz-authoring/use-unsaved-warning";
import { styles } from "@/features/quiz-authoring/styles";

export function ReviewEditor({
  api: client,
  userId = "learner",
  initialQuiz,
  tags,
  onChanged,
  onDeleted,
  onDirty,
  onBusy = () => {},
}: {
  api: ApiClient;
  userId?: string;
  initialQuiz: ReviewQuiz;
  tags: Hashtag[];
  onChanged: () => void;
  onDeleted: () => void;
  onDirty: (dirty: boolean) => void;
  onBusy?: (busy: boolean) => void;
}) {
  const api = useAuthoringActions(client, userId);
  const initialRevision = (initialQuiz.pending ??
    initialQuiz.active)!;
  const [quiz, setQuiz] = useState(initialQuiz);
  const [content, setContent] = useState(
    editableContent(initialRevision),
  );
  const [source, setSource] = useState(
    initialRevision.sourceContent,
  );
  const [prompt, setPrompt] = useState("");
  const [sentPrompt, setSentPrompt] = useState("");
  const [editing, setEditing] = useState(false);
  const [visibility, setVisibility] = useState<
    Visibility | ""
  >(
    initialQuiz.status === QuizStatus.PENDING
      ? ""
      : initialQuiz.status,
  );
  const [nextVisibility, setNextVisibility] =
    useState<Visibility>(
      initialQuiz.status === QuizStatus.PUBLIC
        ? QuizStatus.PRIVATE
        : QuizStatus.PUBLIC,
    );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [errors, setErrors] = useState<
    Record<string, string>
  >({});
  const [message, setMessage] = useState("");
  const locked = useRef(false);
  const saved = (quiz.pending ?? quiz.active)!;
  const edited =
    source !== saved.sourceContent ||
    JSON.stringify(content) !==
      JSON.stringify(editableContent(saved));
  const dirty = edited || prompt !== sentPrompt;
  const statusLabel = quiz.pending
    ? "검토 중"
    : quiz.status === QuizStatus.PUBLIC
      ? "전체 공개"
      : "나만 보기";

  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);

  function accept(result: ReviewQuiz) {
    const revision = (result.pending ?? result.active)!;
    setQuiz(result);
    setContent(editableContent(revision));
    setSource(revision.sourceContent);
    setErrors({});
    if (result.status !== QuizStatus.PENDING)
      setVisibility(result.status);
    setNextVisibility(
      result.status === QuizStatus.PUBLIC
        ? QuizStatus.PRIVATE
        : QuizStatus.PUBLIC,
    );
    onChanged();
  }

  async function run(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    onBusy(true);
    setError(null);
    setMessage("");
    try {
      await action();
    } catch (error) {
      setError(error);
    } finally {
      locked.current = false;
      setBusy(false);
      onBusy(false);
    }
  }

  const version = {
    quizId: quiz.quizId,
    expectedVersion: quiz.version,
  };

  function save() {
    const issues = validateEditor(content, source, tags);
    setErrors(issues);
    if (Object.keys(issues).length) {
      setError(new Error(Object.values(issues).join(" ")));
      return;
    }
    void run(async () => {
      accept(
        await api.request("updatePending", {
          ...version,
          action: "EDIT",
          sourceContent: source,
          content,
        }),
      );
      setEditing(false);
      setMessage(
        "내용을 저장했습니다. 저장된 내용을 다시 확인하세요.",
      );
    });
  }

  function cancelEditing() {
    setContent(editableContent(saved));
    setSource(saved.sourceContent);
    setErrors({});
    setEditing(false);
  }

  function approvePending() {
    if (!visibility || !quiz.pending) return;

    void run(async () => {
      let approvalQuiz = quiz;

      if (!quiz.pending?.reviewed) {
        approvalQuiz = await api.request("updatePending", {
          quizId: quiz.quizId,
          expectedVersion: quiz.version,
          action: "MARK_REVIEWED",
        });
        accept(approvalQuiz);
      }

      accept(
        await api.request("approve", {
          quizId: approvalQuiz.quizId,
          expectedVersion: approvalQuiz.version,
          visibility,
        }),
      );
      setMessage(
        visibility === QuizStatus.PUBLIC
          ? "공개했습니다."
          : "나만 보기로 승인했습니다.",
      );
    });
  }

  return (
    <section
      id="review"
      aria-label="퀴즈 검토"
      className={styles.stack}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">퀴즈 검토</h2>
        <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          {statusLabel}
        </span>
      </div>
      <RequestError error={error} />
      {message && (
        <p role="status" className="text-primary">
          {message}
        </p>
      )}
      {!editing && quiz.active && quiz.pending && (
        <details className="rounded-2xl border border-line bg-surface p-5">
          <summary className="cursor-pointer font-semibold text-primary">
            현재 공개본과 비교
          </summary>
          <div className="mt-5 grid gap-5 border-t border-line pt-5">
            <h3 className="text-lg">{quiz.active.title}</h3>
            <ContentPreview content={quiz.active} />
          </div>
        </details>
      )}
      {editing ? (
        <div className={styles.stack}>
          <fieldset disabled={busy} className="min-w-0">
            <ContentFields
              content={content}
              source={source}
              tags={tags}
              errors={errors}
              onChange={setContent}
              onSource={setSource}
            />
          </fieldset>
          <div className={styles.actions}>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                if (dirty && !window.confirm(leaveMessage))
                  return;
                void run(async () => {
                  accept(
                    await api.request("reviewQuiz", {
                      quizId: quiz.quizId,
                    }),
                  );
                  setPrompt("");
                  setSentPrompt("");
                  setMessage("최신 내용을 불러왔습니다.");
                });
              }}
            >
              최신 내용 다시 불러오기
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={cancelEditing}
            >
              취소
            </Button>
            <Button
              disabled={busy || !edited}
              onClick={save}
            >
              수정 저장
            </Button>
          </div>
        </div>
      ) : (
        <Card className={styles.stack}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl">{saved.title}</h3>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setEditing(true)}
            >
              직접 수정
            </Button>
          </div>
          <details>
            <summary className="cursor-pointer text-primary">
              원본 학습 내용
            </summary>
            <pre className={styles.prose}>
              {saved.sourceContent}
            </pre>
          </details>
          <ContentPreview content={saved} />
          {quiz.pending && (
            <div className="grid items-end gap-3 border-t border-line pt-5 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Dropdown
                label="승인 공개 범위"
                value={visibility}
                disabled={busy}
                options={[
                  {
                    value: "",
                    label: "공개 범위 선택",
                  },
                  {
                    value: QuizStatus.PRIVATE,
                    label: "나만 풀기",
                  },
                  {
                    value: QuizStatus.PUBLIC,
                    label: "공개",
                  },
                ]}
                onValueChange={(value) =>
                  setVisibility(value as Visibility | "")
                }
              />
              <Button
                className="sm:min-w-28"
                disabled={busy || dirty || !visibility}
                onClick={approvePending}
              >
                승인
              </Button>
            </div>
          )}
        </Card>
      )}
      {!editing && (
        <Card className={styles.stack}>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl">
              추가 프롬프트로 재생성
            </h3>
            <Tooltip label="재생성 도움말">
              저장된 내용으로 수정본을 만듭니다. 검토 후
              승인해야 반영됩니다.
            </Tooltip>
          </div>
          <TextField
            label="추가 프롬프트"
            value={prompt}
            disabled={busy}
            onChange={(event) =>
              setPrompt(event.target.value)
            }
          />
          <div className={styles.actions}>
            <Button
              disabled={busy || edited || !prompt.trim()}
              onClick={() =>
                void run(async () => {
                  accept(
                    await api.request("regenerate", {
                      ...version,
                      prompt,
                    }),
                  );
                  setSentPrompt(prompt);
                  setMessage(
                    "수정본을 생성했습니다. 내용을 검토하세요.",
                  );
                })
              }
            >
              수정본 재생성
            </Button>
          </div>
        </Card>
      )}
      {!editing && quiz.active && !quiz.pending && (
        <Card className={styles.stack}>
          <h3 className="text-xl">현재 버전 공개 범위</h3>
          <Dropdown
            label="변경할 공개 범위"
            value={nextVisibility}
            disabled={busy || dirty}
            options={[
              {
                value: QuizStatus.PRIVATE,
                label: "나만 풀기",
              },
              { value: QuizStatus.PUBLIC, label: "공개" },
            ]}
            onValueChange={(value) =>
              setNextVisibility(value as Visibility)
            }
          />
          <div className={styles.actions}>
            <Button
              variant="secondary"
              disabled={
                busy ||
                dirty ||
                nextVisibility === quiz.status
              }
              onClick={() =>
                void run(async () => {
                  accept(
                    await api.request("visibility", {
                      ...version,
                      visibility: nextVisibility,
                    }),
                  );
                  setMessage("공개 범위를 변경했습니다.");
                })
              }
            >
              공개 범위 변경
            </Button>
          </div>
        </Card>
      )}
      <div className={styles.actions}>
        <Button
          variant="danger"
          disabled={busy}
          onClick={() => {
            if (
              !window.confirm(
                `“${saved.title}” 퀴즈를 삭제할까요?${dirty ? " 저장하지 않은 변경도 사라집니다." : ""} 완료한 풀이 기록과 보상은 유지됩니다.`,
              )
            )
              return;
            void run(async () => {
              await api.request("deleteQuiz", {
                quizId: quiz.quizId,
              });
              onDirty(false);
              onDeleted();
            });
          }}
        >
          퀴즈 삭제
        </Button>
      </div>
    </section>
  );
}
