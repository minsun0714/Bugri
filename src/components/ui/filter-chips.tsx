"use client";

export function FilterChips({
  options,
  value,
  onChange,
  disabled = false,
}: {
  options: { id: string; label: string; count?: number }[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {options.map(({ id, label, count }) => (
        <li key={id}>
          <button
            type="button"
            aria-pressed={value.includes(id)}
            disabled={disabled}
            onClick={() =>
              onChange(
                value.includes(id)
                  ? value.filter((item) => item !== id)
                  : [...value, id],
              )
            }
            className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm text-muted aria-pressed:border-primary/30 aria-pressed:bg-primary/10 aria-pressed:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
          >
            <span
              aria-hidden="true"
              className="inline-block w-3 text-center"
            >
              {value.includes(id) ? "✓" : "#"}
            </span>
            <span className="break-all">{label}</span>
            {count !== undefined && (
              <span className="text-xs text-muted">
                ({count})
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
