"use client";

import { Bugri } from "@/components/ui/bugri";
import { styles } from "@/components/ui/styles";
import { useTranslation } from "@/lib/i18n/use-translation";

export function GuestLanding() {
  const t = useTranslation();

  return (
    <section
      aria-labelledby="landing-title"
      className="relative isolate mb-12 py-10 lg:py-16"
    >
      <div className="relative grid items-center gap-10 lg:min-h-96 lg:grid-cols-2 lg:gap-4">
        <div className="relative z-10 motion-safe:animate-landing-enter">
          <p className="mb-6 flex items-center gap-2 font-mono text-xs font-bold tracking-[0.18em] text-primary">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-primary"
            />
            HELLO, DEVELOPER.
          </p>
          <h1
            id="landing-title"
            className="text-[clamp(2.25rem,5.2vw,4rem)] leading-[1.16] font-extrabold tracking-[-0.055em]"
          >
            {t("읽는 개발에서,")}
            <br />
            <span className="text-primary">
              {t("풀어보는 개발로.")}
            </span>
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#guest-quiz"
              onClick={() =>
                document
                  .getElementById("guest-quiz")
                  ?.focus({ preventScroll: true })
              }
              className={`${styles["ui-button"]} primary md`}
            >
              {t("바로 퀴즈 풀기")}{" "}
              <span aria-hidden="true">↓</span>
            </a>
            <span className="text-xs text-muted">
              {t("로그인 없이 가볍게 한 문제")}
            </span>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none relative mx-auto h-72 w-full max-w-100 select-none sm:h-80 lg:h-96"
        >
          <div className="absolute left-[10%] top-[8%] aspect-square w-[85%] rounded-full border border-primary/15 bg-accent-soft/40" />
          <div className="absolute left-[18%] top-[16%] aspect-square w-[68%] rounded-full border border-dashed border-primary/25 motion-safe:animate-landing-orbit" />
          <span className="absolute right-4 top-3 text-4xl text-primary motion-safe:animate-landing-float">
            ✳
          </span>
          <span className="absolute bottom-10 left-0 font-mono text-3xl text-primary/60 motion-safe:animate-landing-float">
            {"{ }"}
          </span>
          <div className="absolute left-0 top-10 w-[86%] -rotate-6 rounded-2xl border border-code-muted/30 bg-code-surface p-5 text-code-ink shadow-xl motion-safe:animate-landing-enter sm:top-14">
            <div className="mb-6 flex items-center gap-1.5 border-b border-code-muted/20 pb-3">
              <span className="size-2 rounded-full bg-coral" />
              <span className="size-2 rounded-full bg-sunny" />
              <span className="size-2 rounded-full bg-lime" />
              <span className="ml-3 font-mono text-[10px] text-code-muted">
                today.ts
              </span>
            </div>
            <div className="space-y-2 font-mono text-xs sm:text-sm">
              <p>
                <span className="text-code-keyword">
                  const
                </span>{" "}
                developer = {"{"}
              </p>
              <p className="pl-4">
                curiosity:{" "}
                <span className="text-code-string">
                  &quot;always&quot;
                </span>
                ,
              </p>
              <p className="pl-4">
                learning:{" "}
                <span className="text-code-keyword">
                  true
                </span>
              </p>
              <p>{"};"}</p>
              <p className="pt-2 text-code-comment">
                {"// keep growing, one quiz at a time."}
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 right-6 rotate-8 motion-safe:animate-landing-float sm:bottom-8">
            <div className="absolute -inset-5 rounded-full bg-lime/25 blur-2xl" />
            <div className="relative scale-110 sm:scale-125">
              <Bugri mood="happy" />
            </div>
          </div>
          <div className="absolute bottom-0 left-[12%] -rotate-3 rounded-xl border border-line bg-surface px-4 py-3 font-mono text-xs font-bold text-primary shadow-sm motion-safe:animate-landing-enter">
            learn → solve → grow
          </div>
        </div>
      </div>
      <div className="relative mt-10 flex items-center gap-4 border-t border-line pt-5 text-[10px] font-semibold tracking-[0.12em] text-muted sm:text-xs">
        <span>01 / {t("호기심을 꺼내고")}</span>
        <span
          aria-hidden="true"
          className="h-px flex-1 bg-line"
        />
        <span>02 / {t("한 문제로 확인하기")}</span>
        <span aria-hidden="true">↓</span>
      </div>
    </section>
  );
}
