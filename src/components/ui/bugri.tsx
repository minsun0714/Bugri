const expressions = {
  neutral: {
    label: "버그리",
    eyes: "h-3 w-2 rounded-full bg-foreground",
    mouth:
      "h-2 w-4 rounded-b-full border-b-2 border-foreground",
  },
  happy: {
    label: "기쁜 버그리",
    eyes: "h-3 w-4 rounded-t-full border-t-3 border-foreground",
    mouth: "h-4 w-6 rounded-b-full bg-foreground",
  },
  encouraging: {
    label: "응원하는 버그리",
    eyes: "h-3 w-2 rounded-full bg-foreground",
    mouth:
      "h-3 w-5 rounded-b-full border-b-3 border-foreground",
  },
  complete: {
    label: "축하하는 버그리",
    eyes: "h-3 w-4 rounded-t-full border-t-3 border-foreground",
    mouth: "h-4 w-6 rounded-b-full bg-foreground",
  },
} as const;

export function Bugri({
  small = false,
  mood = "neutral",
}: {
  small?: boolean;
  mood?: keyof typeof expressions;
}) {
  const { label, eyes, mouth } = expressions[mood];

  return (
    <div
      role="img"
      aria-label={label}
      className={`bugri-pet relative grid shrink-0 place-items-center pt-6 ${small ? "h-24 w-24" : "h-36 w-36"}`}
    >
      <div
        aria-hidden="true"
        className="relative h-full w-full -rotate-6 rounded-[45%_45%_38%_38%] border-3 border-primary bg-lime shadow-[inset_-8px_-6px_0_#00000012]"
      >
        <span className="absolute -top-5 left-1/4 h-5 w-1 -rotate-25 rounded-full bg-primary before:absolute before:-left-1 before:-top-1 before:size-3 before:rounded-full before:bg-primary" />
        <span className="absolute -top-5 right-1/4 h-5 w-1 rotate-25 rounded-full bg-primary before:absolute before:-left-1 before:-top-1 before:size-3 before:rounded-full before:bg-primary" />
        <span
          className={`absolute top-1/3 left-1/4 ${eyes}`}
        />
        <span
          className={`absolute top-1/3 right-1/4 ${eyes}`}
        />
        <span
          className={`absolute top-[58%] left-1/2 -translate-x-1/2 ${mouth}`}
        />
        <span className="absolute top-[56%] left-[12%] h-2 w-4 rounded-full bg-coral/70" />
        <span className="absolute top-[56%] right-[12%] h-2 w-4 rounded-full bg-coral/70" />
      </div>
      {mood === "complete" && (
        <span
          aria-hidden="true"
          className="absolute -right-2 top-0 text-3xl text-primary"
        >
          ✦
        </span>
      )}
    </div>
  );
}
