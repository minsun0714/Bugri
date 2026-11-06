type CodeBlockInput = {
  value: string;
  start: number;
  end: number;
  language: string;
};

/** Selection offsets follow textarea's UTF-16 API; length limits count code points. */
export function insertMarkdownCodeBlock({
  value,
  start,
  end,
  language,
}: CodeBlockInput) {
  const selected = value.slice(start, end);
  const longest = Math.max(
    2,
    ...(selected.match(/`+/g) ?? []).map(
      (run) => run.length,
    ),
  );
  const fence = "`".repeat(longest + 1);
  const prefix = `${start && value[start - 1] !== "\n" ? "\n\n" : ""}${fence}${language}\n`;
  const inserted = `${prefix}${selected}\n${fence}\n`;
  const next =
    value.slice(0, start) + inserted + value.slice(end);

  return {
    value: next,
    selectionStart: start + prefix.length,
    selectionEnd: start + prefix.length + selected.length,
  };
}
