"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import { QuizStatus } from "@/api/constants";
import type { Request } from "@/api/contracts";

export const notesKey = (userId: string) =>
  ["notes", userId] as const;

const listKey = (userId: string, page: number) =>
  [...notesKey(userId), "list", page] as const;

export const noteKey = (userId: string, noteId: string) =>
  [...notesKey(userId), "detail", noteId] as const;

export const apiFor = (userId: string) =>
  createBrowserApi({ mode: "mock", userId });

export const notesPageSize = 20;

export function useNotes(userId: string, page: number) {
  return useQuery({
    queryKey: listKey(userId, page),
    queryFn: async () =>
      (await apiFor(userId)).request("notes", {
        page,
        pageSize: notesPageSize,
      }),
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useNote(userId: string, noteId: string) {
  return useQuery({
    queryKey: noteKey(userId, noteId),
    queryFn: async () =>
      (await apiFor(userId)).request("note", { noteId }),
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

/** After a change, the list and the detail are refetched together. */
function useRefreshNotes(userId: string) {
  const cache = useQueryClient();

  return () =>
    cache.invalidateQueries({ queryKey: notesKey(userId) });
}

export function useCreateNote(userId: string) {
  const refresh = useRefreshNotes(userId);

  return useMutation({
    mutationFn: async (content: string) =>
      (await apiFor(userId)).request("createNote", {
        content,
      }),
    onSuccess: refresh,
  });
}

export function useUpdateNote(
  userId: string,
  noteId: string,
) {
  const cache = useQueryClient();
  const refresh = useRefreshNotes(userId);

  return useMutation({
    mutationFn: async ({
      content,
      expectedVersion,
    }: {
      content: string;
      expectedVersion: number;
    }) =>
      (await apiFor(userId)).request("updateNote", {
        noteId,
        content,
        expectedVersion,
      }),
    onSuccess: (note) => {
      cache.setQueryData(noteKey(userId, noteId), note);

      return refresh();
    },
  });
}

export function useDeleteNote(
  userId: string,
  noteId: string,
) {
  const cache = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      (await apiFor(userId)).request("deleteNote", {
        noteId,
      }),
    onSuccess: () => {
      // Drop the deleted note so it is never refetched into a 404 flash.
      cache.removeQueries({
        queryKey: noteKey(userId, noteId),
      });

      return cache.invalidateQueries({
        queryKey: notesKey(userId),
      });
    },
  });
}

export function useHashtags(userId: string) {
  return useQuery({
    queryKey: ["hashtags", userId],
    queryFn: async () =>
      (await apiFor(userId)).request("hashtags", {}),
    staleTime: Infinity,
  });
}

export const noteQuizzesKey = (
  userId: string,
  noteId: string,
  status: QuizStatus,
) =>
  [...notesKey(userId), "quizzes", noteId, status] as const;

/** Owner-only quizzes of one memo, by status. */
export function useNoteQuizzes(
  userId: string,
  noteId: string,
  status: QuizStatus,
) {
  return useQuery({
    queryKey: noteQuizzesKey(userId, noteId, status),
    queryFn: async () =>
      (await apiFor(userId)).request("noteQuizzes", {
        noteId,
        status,
      }),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

/** Creates new PENDING quizzes, then returns every PENDING quiz of the memo. Older ones stay. */
export function useGenerateQuizzes(
  userId: string,
  noteId: string,
) {
  const refresh = useRefreshNotes(userId);

  return useMutation({
    mutationFn: async () => {
      const api = await apiFor(userId);

      const created = await api.request("generate", {
        noteId,
      });

      const pending = await api.request("noteQuizzes", {
        noteId,
        status: QuizStatus.PENDING,
      });

      return { created, pending };
    },
    onSuccess: refresh,
  });
}

export function useRefreshAfterQuizChange(userId: string) {
  return useRefreshNotes(userId);
}

export function useDeleteQuiz(userId: string) {
  const refresh = useRefreshNotes(userId);

  return useMutation({
    mutationFn: async (quizId: string) =>
      (await apiFor(userId)).request("deleteQuiz", {
        quizId,
      }),
    onSuccess: refresh,
  });
}

export function useUpdateQuiz(userId: string) {
  const refresh = useRefreshNotes(userId);

  return useMutation({
    mutationFn: async (input: Request<"updateQuiz">) =>
      (await apiFor(userId)).request("updateQuiz", input),
    onSuccess: refresh,
  });
}
