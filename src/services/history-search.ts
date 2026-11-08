import { AttemptHistoryMatch } from "@/api/constants";
import type { Question } from "@/api/contracts";

export const historyQueryMaxLength = 100;

const excerptLength = 80;

/** Lower-cased, whitespace-separated search words; empty when the query is blank. */
export function historyQueryWords(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

/** Question prompt plus choice texts: the searchable body. Answers and explanations are excluded. */
export function questionBody(question: Question): string {
  return [
    question.prompt,
    ...("choices" in question
      ? question.choices.map(({ text }) => text)
      : []),
  ].join("\n");
}

export function excerptAround(body: string, words: string[]) {
  const flat = body.replace(/\s+/g, " ");
  const lower = flat.toLowerCase();

  const at = Math.min(
    ...words
      .map((word) => lower.indexOf(word))
      .filter((index) => index >= 0),
  );

  const start = Math.max(
    0,
    at - Math.floor(excerptLength / 3),
  );

  const end = Math.min(flat.length, start + excerptLength);

  return `${start > 0 ? "…" : ""}${flat.slice(start, end)}${end < flat.length ? "…" : ""}`;
}

/** Every word must appear in the title or body. TITLE wins when the title contains any word. */
export function matchHistoryRecord(
  title: string,
  question: Question,
  words: string[],
): {
  matchedIn: AttemptHistoryMatch;
  excerpt: string | null;
} | null {
  const body = questionBody(question);
  const haystack = `${title}\n${body}`.toLowerCase();

  if (!words.every((word) => haystack.includes(word)))
    return null;

  if (
    words.some((word) => title.toLowerCase().includes(word))
  )
    return {
      matchedIn: AttemptHistoryMatch.TITLE,
      excerpt: null,
    };

  return {
    matchedIn: AttemptHistoryMatch.BODY,
    excerpt: excerptAround(body, words),
  };
}
