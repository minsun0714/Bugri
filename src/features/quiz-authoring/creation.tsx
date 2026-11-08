"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { InputValidationError } from "@/api/errors";

import { useRef, useState } from "react";
import type { ApiClient } from "@/api/client";
import type { GenerationBatch } from "@/api/contracts";
import { Button, Modal } from "@/components/ui";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Tooltip } from "@/components/ui/tooltip";
import { Generation } from "@/features/quiz-authoring/generation";
import { RequestError } from "@/features/quiz-authoring/feedback";
import { useAuthoringActions } from "@/features/quiz-authoring/hooks/use-authoring-api";

const closeWarning =
  "모달을 닫으면 임시저장하거나 공개하지 않은 퀴즈는 사라집니다. 계속할까요?";

export function Creation({
  api: client,
  userId,
  initialBatch,
  onGenerated,
  onDirty,
}: {
  api: ApiClient;
  userId: string;
  initialBatch?: GenerationBatch;
  onGenerated: (batch: GenerationBatch) => void;
  onDirty: (dirty: boolean) => void;
}) {
  const t = useTranslation();

  const api = useAuthoringActions(client, userId);
  const [source, setSource] = useState(
    initialBatch?.sourceContent ?? "",
  );
  const [batch, setBatch] = useState(initialBatch);
  const [open, setOpen] = useState(!!initialBatch);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [editing, setEditing] = useState(false);
  const locked = useRef(false);

  function closeModal() {
    const hasUnhandledCandidates = batch?.candidates.some(
      ({ savedQuizId }) => !savedQuizId,
    );

    if (
      hasUnhandledCandidates &&
      !window.confirm(t(closeWarning))
    )
      return;

    setOpen(false);
  }

  async function generate() {
    if (locked.current) return;
    if (!source.trim() || [...source].length > 10000) {
      setError(
        new InputValidationError(
          "학습 내용을 1~10,000자로 입력하세요.",
        ),
      );
      return;
    }
    locked.current = true;
    setBusy(true);
    setError(null);
    setOpen(true);
    try {
      const result = await api.request("generate", {
        sourceContent: source,
      });
      setBatch(result);
      setEditing(false);
      onDirty(false);
      onGenerated(result);
    } catch (error) {
      setError(error);
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return (
    <section
      className="grid gap-5"
      aria-label={t("퀴즈 만들기")}
    >
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight">
          {t("퀴즈 만들기")}
        </h1>
        <Tooltip label={t("퀴즈 만들기 도움말")}>
          {t(
            "현재는 실제 AI 대신 Mock 퀴즈를 제공합니다. 생성한 퀴즈는 대화로 바꾸거나 직접 수정할 수 있습니다. 비밀키·개인정보는 입력하지 마세요.",
          )}
        </Tooltip>
      </div>
      <fieldset disabled={busy} className="min-w-0">
        <MarkdownEditor
          layout="split"
          label={t("학습 내용과 요청")}
          value={source}
          preserveOverflow
          onChange={(value) => {
            setSource(value);
            onDirty(
              editing ||
                value !== (batch?.sourceContent ?? ""),
            );
          }}
        />
      </fieldset>
      <div className="flex flex-wrap justify-end gap-3">
        <Button
          onClick={() => void generate()}
          loading={busy}
        >
          {t("퀴즈 만들기")}
        </Button>
      </div>
      {!open && <RequestError error={error} />}
      <Modal
        open={open}
        onClose={closeModal}
        title={t("버그리와 퀴즈 다듬기")}
        layout="conversation"
      >
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          role="region"
          aria-label={t("퀴즈 작업 본문")}
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-muted">Mock</span>
            <Tooltip label={t("작업 공간 도움말")}>
              {t(
                "추가 요청은 선택한 퀴즈에 반영됩니다. 실제 LLM 연결과 실시간 스트리밍은 아직 적용되지 않았습니다.",
              )}
            </Tooltip>
          </div>
          {busy && (
            <p role="status" className="py-10 text-primary">
              {t("퀴즈를 만들고 있어요…")}
            </p>
          )}
          <RequestError error={error} />
          {!!error && (
            <div className="flex justify-end">
              <Button
                disabled={busy}
                onClick={() => void generate()}
              >
                {t("다시 생성")}
              </Button>
            </div>
          )}
          {!busy && !error && batch && (
            <Generation
              key={batch.batchId}
              api={client}
              userId={userId}
              initialBatch={batch}
              embedded
              onBatch={setBatch}
              onSaved={() => {}}
              onDirty={(dirty) => {
                setEditing(dirty);
                onDirty(
                  dirty || source !== batch.sourceContent,
                );
              }}
            />
          )}
        </div>
      </Modal>
    </section>
  );
}
