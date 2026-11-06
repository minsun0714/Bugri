import { insertMarkdownCodeBlock } from "@/lib/markdown";

test("wraps selection with a fence longer than embedded backticks and preserves surrounding text", () => {
  const result = insertMarkdownCodeBlock({
    value: "앞```code뒤",
    start: 1,
    end: 8,
    language: "typescript",
  });

  expect(result.value).toBe(
    "앞\n\n````typescript\n```code\n````\n뒤",
  );
  expect(
    result.value.slice(
      result.selectionStart,
      result.selectionEnd,
    ),
  ).toBe("```code");
});

test("uses UTF-16 selection offsets without corrupting emoji", () => {
  const result = insertMarkdownCodeBlock({
    value: "😀\n끝",
    start: 3,
    end: 3,
    language: "java",
  });

  expect(result.value).toBe("😀\n```java\n\n```\n끝");
  expect(result.selectionStart).toBe(result.selectionEnd);
});
