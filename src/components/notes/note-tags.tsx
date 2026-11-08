"use client";

import { useHashtags } from "@/components/notes/queries";

/** Read-only tag chips. Falls back to the id until the directory has loaded. */
export function NoteTags({
  userId,
  hashtagIds,
}: {
  userId: string;
  hashtagIds: string[];
}) {
  const { data } = useHashtags(userId);

  if (!hashtagIds.length) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {hashtagIds.map((id) => (
        <li
          key={id}
          className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted"
        >
          #{data?.find((tag) => tag.id === id)?.name ?? id}
        </li>
      ))}
    </ul>
  );
}
