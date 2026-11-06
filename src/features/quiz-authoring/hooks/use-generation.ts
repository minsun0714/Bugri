import { useRef, useState } from "react";
import type { ApiClient } from "@/api/client";
import type { GenerationBatch } from "@/api/contracts";
import { useAuthoringActions } from "@/features/quiz-authoring/hooks/use-authoring-api";

export interface GenerationProps {
  api: ApiClient;
  userId?: string;
  initialBatch?: GenerationBatch;
  onBatch: (batch: GenerationBatch) => void;
  onSaved: () => void;
  onDirty?: (dirty: boolean) => void;
  onBusy?: (busy: boolean) => void;
}

export function useGeneration({
  api: client,
  userId = "learner",
  initialBatch,
  onBatch,
  onSaved,
  onDirty = () => {},
  onBusy = () => {},
}: GenerationProps) {
  const api = useAuthoringActions(client, userId);
  const [source, setSource] = useState(
    initialBatch?.sourceContent ?? "",
  );
  const [batch, setBatch] = useState(initialBatch);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prompts, setPrompts] = useState<
    Record<number, string>
  >({});
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const candidate = batch?.candidates[selectedIndex];
  const prompt = prompts[selectedIndex] ?? "";

  function updateDirty(
    nextSource: string,
    nextPrompts: Record<number, string>,
    nextBatch = batch,
  ) {
    onDirty(
      nextSource !== (nextBatch?.sourceContent ?? "") ||
        Object.values(nextPrompts).some((value) => !!value),
    );
  }

  function changeSource(value: string) {
    setSource(value);
    updateDirty(value, prompts);
  }
  function changePrompt(value: string) {
    const next = { ...prompts, [selectedIndex]: value };
    setPrompts(next);
    updateDirty(source, next);
  }

  function accept(result: GenerationBatch) {
    setBatch(result);
    onBatch(result);
  }

  async function run(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    onBusy(true);
    setError(null);
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
      accept(result);
      setSelectedIndex(0);
      setPrompts({});
      onDirty(false);
    });
  }

  function refine() {
    if (
      !batch ||
      !candidate ||
      candidate.savedQuizId ||
      !prompt.trim()
    )
      return;
    void run(async () => {
      const result = await api.request("refineCandidate", {
        batchId: batch.batchId,
        candidateId: candidate.candidateId,
        prompt,
      });
      accept(result);
      const next = { ...prompts, [selectedIndex]: "" };
      setPrompts(next);
      updateDirty(source, next, result);
    });
  }

  function reload() {
    if (!batch) return;
    void run(async () => {
      accept(
        await api.request("generationBatch", {
          batchId: batch.batchId,
        }),
      );
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
      const targets = batch.candidates.filter(
        (item) =>
          !candidateId || item.candidateId === candidateId,
      );
      const updated = {
        ...batch,
        candidates: batch.candidates.map((item) => {
          const index = targets.findIndex(
            ({ candidateId: id }) =>
              id === item.candidateId,
          );
          return index < 0
            ? item
            : { ...item, savedQuizId: saved[index].quizId };
        }),
      };
      accept(updated);
      onSaved();
    });
  }

  return {
    source,
    batch,
    candidate,
    selectedIndex,
    setSelectedIndex,
    prompt,
    changeSource,
    changePrompt,
    error,
    busy,
    generate,
    refine,
    reload,
    save,
  };
}
