/** Normalization for text entered in the tag editor; API validation remains independent. */
export function normalizeTagInput(value: string) {
  return value.trim().replace(/^#+/, "").trim();
}
