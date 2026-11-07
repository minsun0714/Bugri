import { Bugri } from "@/components/ui/bugri";

export function ResultBugri({
  correct,
}: {
  correct?: boolean | null;
}) {
  const celebrating = correct === true;
  const label = celebrating
    ? "축하하는 버그리"
    : correct === false
      ? "응원하는 버그리"
      : "버그리";

  return (
    <div
      role="img"
      aria-label={label}
      className="relative h-22 w-18 shrink-0 sm:h-26 sm:w-22"
    >
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 h-26 w-22 origin-top-left scale-[0.82] sm:scale-100"
      >
        <div className="absolute bottom-1 left-6 h-4 w-4 -rotate-12 rounded-b-lg rounded-t-md bg-foreground" />
        <div className="absolute bottom-1 right-6 h-4 w-4 rotate-12 rounded-b-lg rounded-t-md bg-foreground" />
        <div className="absolute left-6 top-13 h-10 w-10 rounded-t-2xl rounded-b-xl border-2 border-primary bg-primary">
          <span className="absolute left-1/2 top-4 h-3 w-4 -translate-x-1/2 rounded-b-md border-2 border-lime/80" />
        </div>
        {celebrating ? (
          <>
            <div className="absolute left-5 top-14 h-10 w-3 origin-top rotate-[155deg] rounded-full bg-primary">
              <span className="absolute -bottom-1 -left-0.5 size-4 rounded-full border-2 border-primary bg-lime" />
            </div>
            <div className="absolute right-5 top-14 h-10 w-3 origin-top -rotate-[155deg] rounded-full bg-primary">
              <span className="absolute -bottom-1 -left-0.5 size-4 rounded-full border-2 border-primary bg-lime" />
            </div>
          </>
        ) : (
          <>
            <div className="absolute left-5 top-17 h-3 w-7 rotate-25 rounded-full border border-primary bg-primary" />
            <div className="absolute right-5 top-17 h-3 w-7 -rotate-25 rounded-full border border-primary bg-primary" />
            <div className="absolute left-[37px] top-15 h-5 w-2 -rotate-6 rounded-t-full rounded-b-md border border-primary bg-lime" />
            <div className="absolute right-[37px] top-15 h-5 w-2 rotate-6 rounded-t-full rounded-b-md border border-primary bg-lime" />
          </>
        )}
        <div className="absolute left-4 top-0 origin-top-left scale-[0.5833]">
          <Bugri
            small
            mood={
              celebrating
                ? "happy"
                : correct === false
                  ? "encouraging"
                  : "neutral"
            }
          />
        </div>
      </div>
    </div>
  );
}
