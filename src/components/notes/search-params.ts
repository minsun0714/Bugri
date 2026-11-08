import { historyQueryMaxLength } from "@/services/history-search";

/** Wire value of the "no tags" chip. It is not a registered tag id. */
export const untaggedChipId = "@untagged";

export interface NotesCondition {
  query: string;
  tagIds: string[];
  untagged: boolean;
  /** Only memos that still have unconfirmed quizzes. */
  hasPending: boolean;
  page: number;
}

export interface ParsedNotesParams extends NotesCondition {
  /** The address holds a search longer than the limit. Nothing is requested for it. */
  queryTooLong: boolean;
}

/** Reads the list condition from the address. Never throws on hand-edited values. */
export function parseNotesParams(
  params: URLSearchParams,
): ParsedNotesParams {
  const raw = (params.get("query") ?? "").trim();
  const requestedPage = Number(params.get("page") ?? 1);

  return {
    query: raw,
    queryTooLong: [...raw].length > historyQueryMaxLength,
    tagIds: [
      ...new Set(params.getAll("tag").filter(Boolean)),
    ],
    untagged: params.get("untagged") === "1",
    hasPending: params.get("pending") === "1",
    page:
      Number.isSafeInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1,
  };
}

export const hasCondition = ({
  query,
  tagIds,
  untagged,
  hasPending,
}: Pick<
  NotesCondition,
  "query" | "tagIds" | "untagged" | "hasPending"
>) => query !== "" || tagIds.length > 0 || untagged || hasPending;

/** The address of the list for a condition; defaults are left out. */
export function notesHref(
  userId: string,
  { query, tagIds, untagged, hasPending, page }: NotesCondition,
) {
  const params = new URLSearchParams({ user: userId });

  if (query) params.set("query", query);

  for (const tag of tagIds) params.append("tag", tag);

  if (untagged) params.set("untagged", "1");

  if (hasPending) params.set("pending", "1");

  if (page > 1) params.set("page", String(page));

  return `/notes?${params}`;
}

/** Keeps the list condition on a link to a note, so "back" lands on the same results. */
export function noteHref(
  userId: string,
  noteId: string,
  condition: NotesCondition,
) {
  const [, search] = notesHref(userId, condition).split("?");

  return `/notes/${encodeURIComponent(noteId)}?${search}`;
}
