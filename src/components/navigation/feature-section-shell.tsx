export function FeatureSectionShell({
  id,
  title,
  compact = false,
}: {
  id: string;
  title: string;
  compact?: boolean;
}) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className={
        compact
          ? "border-t border-line py-5"
          : "rounded-surface border border-line bg-surface p-6 sm:p-8"
      }
    >
      <h2
        id={`${id}-heading`}
        className={
          compact
            ? "text-sm font-semibold text-muted"
            : "text-xl font-semibold"
        }
      >
        {title}
      </h2>
      {!compact && (
        <div
          aria-hidden="true"
          className="mt-5 min-h-24 rounded-2xl border border-line/70 bg-canvas/60"
        />
      )}
    </section>
  );
}
