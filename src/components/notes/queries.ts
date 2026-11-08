"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";

export const notesKey = (userId: string) =>
  ["notes", userId] as const;

const listKey = (userId: string, page: number) =>
  [...notesKey(userId), "list", page] as const;

export const noteKey = (userId: string, noteId: string) =>
  [...notesKey(userId), "detail", noteId] as const;

const apiFor = (userId: string) =>
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
