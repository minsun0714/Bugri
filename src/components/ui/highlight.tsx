const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps the searched words in <mark>; plain text when there is no query. */
export function Highlight({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const words = query.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return <>{text}</>;

  const pattern = new RegExp(
    `(${words.map(escapeRegExp).join("|")})`,
    "gi",
  );

  return (
    <>
      {text.split(pattern).map((part, index) =>
        index % 2 ? (
          <mark
            key={index}
            className="rounded-sm bg-lime/60 px-0.5 text-foreground"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
