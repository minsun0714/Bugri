import { Bugri } from "@/components/ui/bugri";

export function ErrorIllustration({
  notFound,
}: {
  notFound: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto h-48 w-64 max-w-full"
    >
      <div className="absolute inset-x-1 bottom-1 h-36 rounded-[50%] border border-primary/10 bg-canvas" />
      <span className="absolute left-1 top-5 text-2xl text-sunny">
        ✦
      </span>
      <span className="absolute right-1 top-16 text-lg text-primary/40">
        ✧
      </span>
      <div className="absolute left-2 top-5 -rotate-6">
        <Bugri mood={notFound ? "confused" : "concerned"} />
      </div>
      {notFound ? (
        <>
          <span className="absolute right-3 top-1 rotate-6 rounded-2xl rounded-bl-sm border border-primary/20 bg-surface px-3 py-1 text-lg font-bold tracking-wider text-primary">
            404
          </span>
          <svg
            viewBox="0 0 136 112"
            className="absolute right-0 bottom-0 w-32 -rotate-6"
            fill="none"
          >
            <path
              d="M9 17 47 9 86 20 126 11v83l-40 9-39-11-38 9Z"
              className="fill-surface stroke-primary"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M47 9v83m39-72v83"
              className="stroke-line"
              strokeWidth="2"
            />
            <path
              d="M24 74c0-23 38-8 40-28s34 10 42-10"
              className="stroke-primary"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="3 7"
            />
            <circle
              cx="24"
              cy="74"
              r="5"
              className="fill-lime stroke-primary"
              strokeWidth="2"
            />
            <circle
              cx="108"
              cy="30"
              r="8"
              className="fill-sunny stroke-primary"
              strokeWidth="2"
            />
            <path
              d="m104 26 8 8m0-8-8 8"
              className="stroke-primary"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </>
      ) : (
        <>
          <svg
            viewBox="0 0 144 116"
            className="absolute right-0 bottom-0 w-36 rotate-3"
            fill="none"
          >
            <rect
              x="24"
              y="19"
              width="105"
              height="72"
              rx="10"
              className="fill-surface stroke-primary"
              strokeWidth="3"
            />
            <rect
              x="32"
              y="27"
              width="89"
              height="54"
              rx="5"
              className="fill-canvas"
            />
            <path
              d="m62 45-7 6 7 6m29-12 7 6-7 6"
              className="stroke-primary"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="77"
              cy="65"
              r="4"
              className="fill-coral"
            />
            <path
              d="M15 91h122l-6 13H21Z"
              className="fill-surface stroke-primary"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M63 92h26"
              className="stroke-primary"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <svg
            viewBox="0 0 56 72"
            className="absolute right-6 top-0 w-11 rotate-12"
            fill="none"
          >
            <path
              d="M35 6a17 17 0 0 0-21 22L5 52a8 8 0 0 0 14 7l12-25A17 17 0 0 0 46 12L35 23l-9-4 1-9Z"
              className="fill-sunny stroke-primary"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="55"
              r="2.5"
              className="fill-primary"
            />
          </svg>
        </>
      )}
    </div>
  );
}
