import { Bugri } from "@/components/ui/bugri";

export function DiscoveryMascot() {
  return (
    <div
      role="img"
      aria-label="돋보기로 개발자를 찾는 버그리"
      className="relative h-18 w-20 shrink-0"
    >
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 h-26 w-28 origin-top-left scale-[0.7]"
      >
        <div className="absolute left-0 top-1 origin-bottom rotate-8">
          <Bugri small mood="neutral" />
        </div>
        <svg
          aria-hidden="true"
          viewBox="0 0 112 104"
          className="absolute inset-0 h-26 w-28 overflow-visible"
        >
          <path
            d="M86 70q8 9 16 7"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className="stroke-primary"
          />
          <path
            d="m93 64 15 17"
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            className="stroke-primary"
          />
          <circle
            cx="78"
            cy="47"
            r="22"
            strokeWidth="3.5"
            className="fill-lime stroke-primary"
          />
          <ellipse
            cx="79"
            cy="47"
            rx="5.5"
            ry="9"
            className="fill-foreground"
          />
          <circle
            cx="81"
            cy="43"
            r="2"
            className="fill-surface"
          />
          <path
            d="M63 41a16 16 0 0 1 14-10"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className="stroke-surface"
          />
          <ellipse
            cx="100"
            cy="75"
            rx="6"
            ry="5"
            transform="rotate(-35 100 75)"
            strokeWidth="2.5"
            className="fill-lime stroke-primary"
          />
          <path
            d="M104 13v8m-4-4h8"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="stroke-primary/60"
          />
        </svg>
      </div>
    </div>
  );
}
