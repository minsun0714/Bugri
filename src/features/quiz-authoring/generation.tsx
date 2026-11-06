"use client";

import { useRef, useState } from "react";
import type { ApiClient } from "@/api/client";
import type { GenerationBatch } from "@/api/contracts";
import { Button, Card } from "@/components/ui";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { ContentPreview } from "@/features/quiz-authoring/content-preview";
import { RequestError } from "@/features/quiz-authoring/feedback";
import { styles } from "@/features/quiz-authoring/styles";

export function Generation({
  api,
  initialBatch,
  onBatch,
  onSaved,
  onDirty = () => {},
}: {
  api: ApiClient;
  initialBatch?: GenerationBatch;
  onBatch: (batch: GenerationBatch) => void;
  onSaved: () => void;
  onDirty?: (dirty: boolean) => void;
}) {
  const [source, setSource] = useState(
    initialBatch?.sourceContent ?? "",
  );
  const [batch, setBatch] = useState(initialBatch);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);

  async function run(action: () => Promise<void>) {
    if (locked.current) return;

    locked.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (error) {
      setError(error);
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  function generate() {
    if (!source.trim()) {
      setError(new Error("학습 내용을 입력하세요."));
      return;
    }
    if ([...source].length > 10000) {
      setError(
        new Error("학습 내용은 최대 10,000자입니다."),
      );
      return;
    }

    void run(async () => {
      const result = await api.request("generate", {
        sourceContent: source,
      });
      setBatch(result);
      onBatch(result);
      onDirty(false);
    });
  }

  function save(candidateId?: string) {
    if (!batch) return;

    void run(async () => {
      const saved = await api.request(
        "saveBatch",
        candidateId
          ? {
              batchId: batch.batchId,
              mode: "SINGLE",
              candidateId,
            }
          : { batchId: batch.batchId, mode: "ALL" },
      );
      // Save response is authoritative even if a subsequent refresh fails.
      const targets = batch.candidates.filter(
        (candidate) =>
          !candidateId ||
          candidate.candidateId === candidateId,
      );
      const updated = {
        ...batch,
        candidates: batch.candidates.map((candidate) => {
          const index = targets.findIndex(
            ({ candidateId: id }) =>
              id === candidate.candidateId,
          );
          return index < 0
            ? candidate
            : {
                ...candidate,
                savedQuizId: saved[index].quizId,
              };
        }),
      };
      setBatch(updated);
      onBatch(updated);
      onSaved();
    });
  }

  return (
    <section
      id="generate"
      className={styles.stack}
      aria-label="퀴즈 생성"
    >
      <h2 className="text-2xl">
        배운 내용으로 퀴즈 만들기
      </h2>
      <p className="text-sm text-muted">
        현재는 실제 AI 대신 고정된 Mock 후보 4개를
        제공합니다. 내용에 맞춘 생성이 아니며 정답과 해설을
        직접 확인해야 합니다. 비밀키·개인정보는 입력하지
        마세요.
      </p>
      <fieldset disabled={busy} className="min-w-0">
        <MarkdownEditor
          value={source}
          preserveOverflow
          onChange={(value) => {
            setSource(value);
            onDirty(value !== (batch?.sourceContent ?? ""));
          }}
        />
      </fieldset>
      <RequestError error={error} />
      <div>
        <Button loading={busy} onClick={generate}>
          퀴즈 생성
        </Button>
      </div>
      {batch && (
        <section
          className={styles.stack}
          aria-label="생성 후보"
        >
          <div className={styles.actions}>
            <h2 className="text-xl">
              생성 후보 {batch.candidates.length}개
            </h2>
            <Button
              variant="secondary"
              disabled={
                busy ||
                batch.candidates.every(
                  ({ savedQuizId }) => savedQuizId,
                )
              }
              onClick={() => save()}
            >
              남은 후보 모두 저장
            </Button>
          </div>
          <p className="text-sm text-muted">
            후보는 보존되지만 저장한 퀴즈만 내 목록에
            나타납니다.
          </p>
          {batch.candidates.map(
            (
              { candidateId, content, savedQuizId },
              index,
            ) => (
              <Card
                key={candidateId}
                className="grid gap-4"
              >
                <h3 className="text-lg">
                  {index + 1}. {content.title}
                </h3>
                <ContentPreview content={content} />
                <div>
                  <Button
                    disabled={busy || !!savedQuizId}
                    onClick={() => save(candidateId)}
                  >
                    {savedQuizId
                      ? "저장 완료"
                      : "개별 저장"}
                  </Button>
                </div>
              </Card>
            ),
          )}
        </section>
      )}
    </section>
  );
}
