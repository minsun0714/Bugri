import { useRef, useState } from "react";
import type { ApiClient } from "@/api/client";
import type {
  GenerationBatch,
  QuizContent,
} from "@/api/contracts";
import { useAuthoringActions } from "@/features/quiz-authoring/hooks/use-authoring-api";

export interface GenerationProps {
  api: ApiClient;
  userId?: string;
  initialBatch: GenerationBatch;
  embedded?: boolean;
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
  const [edits, setEdits] = useState<
    Record<number, QuizContent>
  >({});
  const editing = edits[selectedIndex] ?? null;
  const [notice, setNotice] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const candidate = batch?.candidates[selectedIndex];
  const prompt = prompts[selectedIndex] ?? "";

  function changePrompt(value: string) {
    const next = { ...prompts, [selectedIndex]: value };
    setPrompts(next);
    onDirty(
      Object.keys(edits).length > 0 ||
        Object.values(next).some((value) => !!value),
    );
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
    setNotice("");
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

  function edit(content: QuizContent) {
    setEdits((current) => ({
      ...current,
      [selectedIndex]: content,
    }));
    onDirty(true);
  }

  function cancelEdit() {
    const next = { ...edits };
    delete next[selectedIndex];
    setEdits(next);
    onDirty(
      Object.keys(next).length > 0 ||
        Object.values(prompts).some((value) => !!value),
    );
  }

  function applyEdit() {
    if (!editing || !candidate) return;
    void run(async () => {
      accept(
        await api.request("editCandidate", {
          batchId: batch.batchId,
          candidateId: candidate.candidateId,
          content: editing,
        }),
      );
      cancelEdit();
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
      onDirty(
        Object.keys(edits).length > 0 ||
          Object.values(next).some((value) => !!value),
      );
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

  function publish() {
    if (
      !candidate ||
      candidate.savedQuizId ||
      editing ||
      prompt.trim()
    )
      return;
    void run(async () => {
      accept(
        await api.request("publishCandidate", {
          batchId: batch.batchId,
          candidateId: candidate.candidateId,
          reviewed: true,
        }),
      );
      setNotice("공개했습니다.");
      onSaved();
    });
  }

  function shiftDrafts<T>(
    current: Record<number, T>,
    removedIndex: number,
  ) {
    return Object.fromEntries(
      Object.entries(current)
        .filter(([key]) => Number(key) !== removedIndex)
        .map(([key, value]) => [
          Number(key) > removedIndex
            ? Number(key) - 1
            : Number(key),
          value,
        ]),
    ) as Record<number, T>;
  }

  function removeCandidate() {
    if (!candidate) return;

    void run(async () => {
      const removedIndex = selectedIndex;
      const result = await api.request("deleteCandidate", {
        batchId: batch.batchId,
        candidateId: candidate.candidateId,
      });
      const nextEdits = shiftDrafts(edits, removedIndex);
      const nextPrompts = shiftDrafts(
        prompts,
        removedIndex,
      );

      accept(result);
      setSelectedIndex(
        Math.max(
          0,
          Math.min(
            removedIndex,
            result.candidates.length - 1,
          ),
        ),
      );
      setEdits(nextEdits);
      setPrompts(nextPrompts);
      setNotice("퀴즈를 삭제했습니다.");
      onDirty(
        Object.keys(nextEdits).length > 0 ||
          Object.values(nextPrompts).some(
            (value) => !!value.trim(),
          ),
      );
      onSaved();
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
    publish,
    removeCandidate,
    notice,
    editing,
    edit,
    cancelEdit,
    applyEdit,
    candidate,
    selectedIndex,
    setSelectedIndex,
    prompt,
    hasDrafts:
      Object.keys(edits).length > 0 ||
      Object.values(prompts).some(
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
