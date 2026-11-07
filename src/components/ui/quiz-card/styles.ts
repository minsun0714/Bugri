export const quizCardStyles = {
  card: "min-w-0 rounded-3xl border border-line bg-surface p-4 shadow-[0_3px_0_var(--color-line)] sm:p-5",
  title:
    "group grid w-full min-h-11 text-left disabled:cursor-not-allowed disabled:opacity-50 grid-cols-[2.5rem_minmax(0,1fr)_2rem] items-center gap-3 rounded-2xl text-lg font-bold text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
  notebook:
    "flex size-10 items-center justify-center rounded-2xl bg-lime/60 text-primary group-hover:bg-lime/80",
  arrow:
    "flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/15",
} as const;
