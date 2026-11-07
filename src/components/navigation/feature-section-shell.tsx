export function FeatureSectionShell({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="rounded-3xl border border-line bg-surface p-6 sm:p-8"
    >
      <h2
        id={`${id}-heading`}
        className="text-xl font-semibold"
      >
        {title}
      </h2>
      <div
        aria-hidden="true"
        className="mt-5 min-h-24 rounded-2xl border border-line/70 bg-canvas/60"
      />
    </section>
  );
}
