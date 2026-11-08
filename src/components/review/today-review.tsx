"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { ApiClientError } from "@/api/client";
import type {
  AttemptView,
  TodayReview as TodayReviewData,
} from "@/api/contracts";
import { ErrorNotice } from "@/components/solving/error-notice";
import { QuizPanel } from "@/components/solving/quiz-panel";
import { useReviewSession } from "@/components/review/use-review-session";
import { reviewStyles } from "@/components/review/styles";
import { Button, Skeleton } from "@/components/ui";
import { dateDistance } from "@/services/review-schedule";
import { useTranslation } from "@/lib/i18n/use-translation";

function NextReviewNote({
  nextReview,
}: {
  nextReview: NonNullable<AttemptView["nextReview"]>;
}) {
  const t = useTranslation();

  const { date, days } = nextReview;

  return (
    <p className={reviewStyles.nextReview}>
      {days === 1
        ? t("다음 복습: 내일 ({0})", { 0: date })
        : t("다음 복습: {0}일 뒤 ({1})", {
            0: days,
            1: date,
          })}
    </p>
  );
}

function Idle({
  review,
  onStart,
  starting,
}: {
  review: TodayReviewData;
  onStart: (quizId: string) => void;
  starting: boolean;
}) {
  const t = useTranslation();

  const { dueCount, next } = review;

  return (
    <section
      aria-labelledby="today-review-heading"
      className={reviewStyles.section}
    >
      <div className={reviewStyles.header}>
        <h2
          id="today-review-heading"
          className={reviewStyles.heading}
        >
          {t("오늘 복습 {0}개", { 0: dueCount })}
        </h2>
        <Button
          loading={starting}
          onClick={() => onStart(next!.quizId)}
        >
          {t("복습 시작")}
        </Button>
      </div>
    </section>
  );
}

function Rest({
  review,
  focusHeading,
}: {
  review: TodayReviewData;
  focusHeading: boolean;
}) {
  const t = useTranslation();

  const heading = useRef<HTMLHeadingElement>(null);

  const {
    learningDate,
    reviewedToday,
    tomorrowCount,
    upcoming,
  } = review;

  const done = reviewedToday > 0;

  // After finishing, keyboard and screen reader users land on the result instead of the page body.
  useEffect(() => {
    if (focusHeading) heading.current?.focus();
  }, [focusHeading]);

  return (
    <section
      aria-labelledby="today-review-heading"
      className={reviewStyles.section}
    >
      <h2
        ref={heading}
        tabIndex={-1}
        id="today-review-heading"
        className={`${done ? reviewStyles.headingDone : reviewStyles.heading} outline-none`}
      >
        {done && <span aria-hidden="true">✓</span>}
        {done
          ? t("오늘 복습 끝")
          : t("오늘 복습할 퀴즈가 없어요")}
      </h2>
      {tomorrowCount > 0 ? (
        <p className={reviewStyles.detail}>
          {t("내일 복습할 퀴즈 {0}개", {
            0: tomorrowCount,
          })}
        </p>
      ) : upcoming ? (
        <p className={reviewStyles.detail}>
          {t("다음 복습: {0}일 뒤 ({1}) · {2}개", {
            0: dateDistance(learningDate, upcoming.date),
            1: upcoming.date,
            2: upcoming.count,
          })}
        </p>
      ) : null}
    </section>
  );
}

function Empty() {
  const t = useTranslation();

  return (
    <section
      aria-labelledby="today-review-heading"
      className={reviewStyles.section}
    >
      <h2
        id="today-review-heading"
        className={reviewStyles.heading}
      >
        {t("오늘 복습")}
      </h2>
      <p className={reviewStyles.detail}>
        {t("메모를 퀴즈로 만들면 여기서 복습해요")}
      </p>
    </section>
  );
}

export function TodayReview({
  userId,
  today,
}: {
  userId: string;
  today: UseQueryResult<TodayReviewData>;
}) {
  const t = useTranslation();

  const session = useReviewSession(userId);

  const { attempt, attemptId, start, submit } = session;

  const { data, isPending, error, refetch, isFetching } =
    today;

  const active = attemptId ? attempt.data : undefined;

  const section = useRef<HTMLElement>(null);
  const [finished, setFinished] = useState(false);

  // Starting, moving on and restoring bring the review to the top of the screen, so the question
  // and the next action are visible without scrolling past the quick note.
  const shownId = active?.attemptId;

  useEffect(() => {
    if (!shownId) return;

    section.current?.scrollIntoView?.({
      block: "start",
      behavior: "instant",
    });
  }, [shownId]);

  const remaining = data?.dueCount ?? 0;

  if (attemptId) {
    return (
      <section
        ref={section}
        aria-labelledby="today-review-heading"
        className="scroll-mt-4 space-y-3"
      >
        <h2
          id="today-review-heading"
          className={
            data && remaining === 0
              ? reviewStyles.headingDone
              : reviewStyles.heading
          }
        >
          {data && remaining === 0 && (
            <span aria-hidden="true">✓</span>
          )}
          {data
            ? remaining === 0
              ? t("오늘 복습 끝")
              : t("오늘 복습 {0}개", { 0: remaining })
            : t("오늘 복습")}
        </h2>
        {attempt.isPending && <Skeleton />}
        {attempt.error && (
          <div className="space-y-3">
            <ErrorNotice error={attempt.error} />
            <div className={reviewStyles.actions}>
              <Button
                variant="secondary"
                onClick={session.close}
              >
                {t("닫기")}
              </Button>
              <Button
                onClick={() => void attempt.refetch()}
              >
                {t("다시 불러오기")}
              </Button>
            </div>
          </div>
        )}
        {submit.error && (
          <ErrorNotice error={submit.error} />
        )}
        {start.error && <ErrorNotice error={start.error} />}
        {active && (
          <QuizPanel
            quiz={active.quiz}
            result={active.result}
            completedAt={active.completedAt}
            correct={active.correct}
            learningDate={active.learningDate}
            focusKey={active.attemptId}
            pending={submit.isPending}
            onSubmit={(answer) => submit.mutate(answer)}
            resultNote={
              active.nextReview && (
                <NextReviewNote
                  nextReview={active.nextReview}
                />
              )
            }
          >
            {active.completedAt && (
              <div className={reviewStyles.actions}>
                {active.noteId && (
                  <Link
                    href={`/notes/${encodeURIComponent(active.noteId)}?${new URLSearchParams({ user: userId })}`}
                    className={reviewStyles.memoLink}
                  >
                    {t("원래 메모 보기")}
                  </Link>
                )}
                {data?.next ? (
                  <Button
                    loading={isFetching || start.isPending}
                    onClick={() =>
                      session.begin(data.next!.quizId)
                    }
                  >
                    {t("다음 문제")}
                  </Button>
                ) : (
                  <Button
                    loading={isFetching}
                    onClick={() => {
                      setFinished(true);
                      session.close();
                    }}
                  >
                    {t("복습 마치기")}
                  </Button>
                )}
              </div>
            )}
          </QuizPanel>
        )}
      </section>
    );
  }

  if (isPending)
    return (
      <section
        aria-labelledby="today-review-heading"
        className={reviewStyles.section}
      >
        <h2 id="today-review-heading" className="sr-only">
          {t("오늘 복습")}
        </h2>
        <p role="status" className="text-muted">
          {t("오늘 복습 불러오는 중…")}
        </p>
      </section>
    );

  if (error || !data) {
    const timezoneRequired =
      error instanceof ApiClientError &&
      error.detail.code === "TIMEZONE_REQUIRED";

    return (
      <section
        aria-labelledby="today-review-heading"
        className={reviewStyles.section}
      >
        <h2 id="today-review-heading" className="sr-only">
          {t("오늘 복습")}
        </h2>
        <p role="alert">
          {timezoneRequired
            ? t("학습 시간대를 확인할 수 없어요.")
            : t("오늘 복습을 불러오지 못했어요.")}
        </p>
        <div className="mt-3 flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            loading={isFetching}
            onClick={() => void refetch()}
          >
            {t("다시 시도")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      {start.error && <ErrorNotice error={start.error} />}
      {data.totalCount === 0 ? (
        <Empty />
      ) : data.dueCount === 0 ? (
        <Rest review={data} focusHeading={finished} />
      ) : (
        <Idle
          review={data}
          starting={start.isPending}
          onStart={session.begin}
        />
      )}
    </>
  );
}
