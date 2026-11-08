export const noteMaxLength = 10_000;

export const NoteDraftIssue = {
  BLANK: "BLANK",
  TOO_LONG: "TOO_LONG",
} as const;

export type NoteDraftIssue =
  (typeof NoteDraftIssue)[keyof typeof NoteDraftIssue];

/** Unicode code points, the same unit the API validates. */
export function noteLength(value: string) {
  return Array.from(value).length;
}

/** UX-side pre-check. The API validates again. */
export function checkNoteDraft(
  value: string,
): NoteDraftIssue | null {
  if (!value.trim()) return NoteDraftIssue.BLANK;

  return noteLength(value) > noteMaxLength
    ? NoteDraftIssue.TOO_LONG
    : null;
}

/** List rows show prose only: code blocks and leading Markdown markers are dropped, lines are joined with "·". A note that is only code falls back to its code. */
export function previewText(excerpt: string) {
  const prose: string[] = [];
  const code: string[] = [];

  let inCode = false;

  for (const line of excerpt.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inCode = !inCode;

      continue;
    }

    const text = (
      inCode
        ? line
        : line.replace(/^\s*(#{1,6}\s+|[-*+]\s+|>\s*)/, "")
    )
      .replace(/\s+/g, " ")
      .trim();

    if (text) (inCode ? code : prose).push(text);
  }

  return prose.length ? prose.join(" · ") : code.join(" ");
}
