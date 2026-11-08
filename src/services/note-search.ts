import { NoteMatch } from "@/api/constants";
import type { Question } from "@/api/contracts";
import {
  excerptAround,
  questionBody,
} from "@/services/history-search";

interface SearchableQuiz {
  title: string;
  question: Question;
}

export interface NoteMatchResult {
  matchedIn: NoteMatch;
  matchedQuizTitle: string | null;
  matchedExcerpt: string | null;
}

/**
 * Every word must appear somewhere in the memo body or its quizzes' title/question text.
 * BODY when the body alone contains every word; otherwise QUIZ, reporting the first quiz
 * that contains a word the body lacks. Answers and explanations are never passed in.
 */
export function matchNote(
  content: string,
  quizzes: SearchableQuiz[],
  words: string[],
): NoteMatchResult | null {
  const body = content.toLowerCase();

  if (words.every((word) => body.includes(word)))
    return {
      matchedIn: NoteMatch.BODY,
      matchedQuizTitle: null,
      matchedExcerpt: null,
    };

  const searchable = quizzes.map(({ title, question }) => ({
    title,
    questionBody: questionBody(question),
  }));

  const haystack = [
    body,
    ...searchable.map(
      ({ title, questionBody: text }) =>
        `${title}\n${text}`.toLowerCase(),
    ),
  ].join("\n");

  if (!words.every((word) => haystack.includes(word)))
    return null;

  const missing = words.filter((word) => !body.includes(word));

  for (const { title, questionBody: text } of searchable) {
    const lowerTitle = title.toLowerCase();
    const lowerText = text.toLowerCase();

    if (
      !missing.some(
        (word) =>
          lowerTitle.includes(word) ||
          lowerText.includes(word),
      )
    )
      continue;

    const inTitle = missing.some((word) =>
      lowerTitle.includes(word),
    );

    return {
      matchedIn: NoteMatch.QUIZ,
      matchedQuizTitle: title,
      matchedExcerpt: inTitle
        ? null
        : excerptAround(
            text,
            missing.filter((word) => lowerText.includes(word)),
          ),
    };
  }

  return null;
}
