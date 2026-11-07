import { useRef, useState } from "react";
import type { ApiClient } from "@/api/client";
import type { GenerationBatch } from "@/api/contracts";
import { useAuthoringActions } from "@/features/quiz-authoring/hooks/use-authoring-api";

export interface GenerationProps {
  api: ApiClient;
  userId?: string;
  initialBatch: GenerationBatch;
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

  function changePrompt(value: string) {
    const next = { ...prompts, [selectedIndex]: value };
    setPrompts(next);
    onDirty(Object.values(next).some((value) => !!value));
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
      onDirty(Object.values(next).some((value) => !!value));
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
    batch,
    candidate,
    selectedIndex,
    setSelectedIndex,
    prompt,
    hasDrafts: Object.values(prompts).some(
      (value) => !!value.trim(),
    ),
    changePrompt,
    error,
    busy,
    refine,
    reload,
    save,
  };
}
