export const quizCardStyles = {
  card: "relative isolate min-w-0 rounded-sm border border-line bg-surface p-4 sm:p-5",
  compactCard:
    "relative isolate min-w-0 rounded-sm border border-line bg-surface p-3 sm:p-4",
  compactTitle:
    "grid min-h-11 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-2 text-left text-base font-bold leading-6 text-foreground",
  access:
    "block w-full cursor-pointer outline-none after:absolute after:inset-0 after:z-0 after:rounded-sm hover:after:bg-primary/5 focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-primary disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed",
  title:
    "grid min-h-11 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 text-left text-lg font-bold text-foreground",
  notebook:
    "flex size-10 items-center justify-center rounded-2xl bg-success-soft text-primary",
  settings:
    "absolute right-3 top-3 z-10 [&.ui-button.sm]:size-11 [&.ui-button.sm]:min-h-11 [&.ui-button.sm]:p-0 [&.ui-button.ghost]:text-muted [&.ui-button.ghost:hover]:bg-primary/10 [&.ui-button.ghost:hover]:text-primary [&.ui-button:hover:not(:disabled)]:transform-none [&.ui-button:active:not(:disabled)]:transform-none",
  go: "size-5 shrink-0 text-primary",
  footer:
    "pointer-events-none relative z-10 [&_a]:pointer-events-auto [&_button]:pointer-events-auto",
} as const;
