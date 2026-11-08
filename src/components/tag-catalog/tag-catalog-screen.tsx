"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { QuizReactionControl } from "@/components/solving/quiz-reaction";
import { QuizCard } from "@/components/ui/quiz-card";
import { createQueryClient } from "@/api/query-client";

import Link from "next/link";
import { tagCatalogStyles } from "@/components/tag-catalog/styles";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ApiClientError } from "@/api/client";
import { useDemoSession } from "@/components/navigation/demo-session";
import { useTagQuizzes } from "@/components/tag-catalog/queries";
import { useSubscribe } from "@/components/discovery/queries";
import { TagExplorer } from "@/components/discovery/tag-explorer";
import { tagDiscoveryStyles } from "@/components/discovery/styles";
import { SubscriptionMenu } from "@/components/discovery/subscription-menu";
import { Button, Skeleton, Toast } from "@/components/ui";

function Catalog({
  userId,
  hashtagId,
}: {
  userId: string;
  hashtagId: string;
}) {
  const t = useTranslation();

  const params = useSearchParams();
  const router = useRouter();
  const { signedIn, signIn } = useDemoSession();
  const [navigating, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const focusAction = useRef(false);
  const pageNumber = Number(params.get("page") ?? 1);
  const page =
    Number.isSafeInteger(pageNumber) && pageNumber > 0
      ? pageNumber
      : 1;
  const catalog = useTagQuizzes(userId, {
    hashtagId,
    page,
    pageSize: 20,
  });
  const subscribe = useSubscribe(userId);
  const { data } = catalog;
  const subscribed = signedIn && !!data?.subscribed;
  const busy = navigating || subscribe.isPending;
  const backQuery = new URLSearchParams();
  if (signedIn) backQuery.set("user", userId);
  if (params.get("query"))
    backQuery.set("query", params.get("query")!);
  if (params.get("discoveryPage"))
    backQuery.set("page", params.get("discoveryPage")!);
  if (params.get("subscribed") === "true")
    backQuery.set("subscribed", "true");
  const backHref = `/discover/tags${backQuery.size ? `?${backQuery}` : ""}`;
  const memberQuery = signedIn
    ? `user=${encodeURIComponent(userId)}&`
    : "";
  const backLink = (
    <Link
      href={backHref}
      className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary"
    >
      {t("← 태그 탐색으로 돌아가기")}
    </Link>
  );

  useEffect(() => {
    if (focusAction.current && !subscribe.isPending) {
      controlsRef.current
        ?.querySelector<HTMLButtonElement>(
          "button:not(:disabled)",
        )
        ?.focus();
      focusAction.current = false;
    }
  }, [subscribe.isPending, subscribed, notice]);

  function goToPage(next: number) {
    const query = new URLSearchParams(params);
    query.set("page", String(next));
    startTransition(() =>
      router.push(
        `/tags/${encodeURIComponent(hashtagId)}/quizzes?${query}`,
      ),
    );
  }

  async function toggleSubscription() {
    if (!signedIn) {
      signIn();
      return;
    }
    try {
      await subscribe.mutateAsync({
        target: { type: "HASHTAG", hashtagId },
        subscribed,
      });
      focusAction.current = true;
      setNotice(
        subscribed
          ? "태그 구독을 취소했습니다."
          : "태그를 구독했습니다.",
      );
      requestAnimationFrame(() =>
        actionRef.current?.focus(),
      );
    } catch {
      /* Mutation error is displayed beside the controls. */
    }
  }

  if (catalog.isPending)
    return (
      <div className="space-y-5">
        {backLink}
        <div
          role="status"
          aria-label={t("공개 퀴즈 불러오는 중")}
        >
          <Skeleton />
        </div>
      </div>
    );
  if (catalog.error || !data) {
    const notFound =
      catalog.error instanceof ApiClientError &&
      catalog.error.status === 404;
    return (
      <div className="space-y-5">
        {backLink}
        <section className={tagDiscoveryStyles.empty}>
          <h1 className="text-xl text-foreground">
            {notFound
              ? t("태그를 찾을 수 없습니다")
              : t("공개 퀴즈를 불러오지 못했습니다")}
          </h1>
          {!notFound && (
            <Button onClick={() => void catalog.refetch()}>
              {t("다시 불러오기")}
            </Button>
          )}
        </section>
      </div>
    );
  }
  const pages = Math.max(
    1,
    Math.ceil(data.total / data.pageSize),
  );

  return (
    <div className="space-y-6">
      {backLink}
      <section
        aria-labelledby="tag-title"
        className={tagDiscoveryStyles.card}
      >
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex min-w-0 max-w-full items-center gap-3">
            <TagExplorer />
            <div className="min-w-0 space-y-2">
              <h1
                id="tag-title"
                className="w-fit max-w-full break-all rounded-2xl bg-success-soft px-3 py-2 text-2xl sm:text-3xl"
              >
                #{data.hashtag.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-sm text-muted">
                  {t("공개 퀴즈")}
                  {data.total}
                  {t("개")}
                </p>
                {subscribed && (
                  <span
                    className={
                      tagDiscoveryStyles.subscribed
                    }
                  >
                    {t("✓ 구독 중")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div
            ref={controlsRef}
            className="flex shrink-0 items-center justify-self-end gap-2"
          >
            {subscribed ? (
              <>
                <Button
                  ref={actionRef}
                  className={`${tagDiscoveryStyles.learn} !h-11`}
                  disabled={busy || data.total === 0}
                  onClick={() =>
                    router.push(
                      `/?user=${encodeURIComponent(userId)}&tag=${encodeURIComponent(hashtagId)}`,
                    )
                  }
                >
                  {t("학습하기 →")}
                </Button>
                <SubscriptionMenu
                  outlined
                  name={data.hashtag.name}
                  busy={busy}
                  onUnsubscribe={() =>
                    void toggleSubscription()
                  }
                />
              </>
            ) : (
              <Button
                ref={actionRef}
                variant="secondary"
                className={tagDiscoveryStyles.subscribe}
                loading={subscribe.isPending}
                disabled={navigating}
                onClick={() => void toggleSubscription()}
              >
                {t("+ 구독하기")}
              </Button>
            )}
          </div>
        </div>
        {subscribe.error && (
          <p role="alert" className="text-sm text-danger">
            {t(
              "구독을 저장하지 못했습니다. 다시 시도해 주세요.",
            )}
          </p>
        )}
      </section>
      <section
        aria-label={t("태그의 공개 퀴즈")}
        className="space-y-4"
        aria-busy={navigating}
      >
        <h2 className="text-lg">{t("공개 퀴즈")}</h2>
        {data.items.length ? (
          <ul className="space-y-4">
            {data.items.map(({ quizId, title, author }) => (
              <li key={quizId}>
                <QuizCard
                  title={title}
                  action={{
                    href: `/solve?${memberQuery}quiz=${encodeURIComponent(quizId)}`,
                    onClick: (event) => {
                      if (!signedIn) {
                        event.preventDefault();
                        signIn();
                      }
                    },
                  }}
                  footer={
                    <>
                      <Link
                        href={`/users/${encodeURIComponent(author.publicId)}${signedIn ? `?user=${encodeURIComponent(userId)}` : ""}`}
                        className={tagCatalogStyles.author}
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          className="size-4 shrink-0 text-primary/70"
                        >
                          <circle cx="10" cy="6" r="3" />
                          <path d="M4 17v-1a6 6 0 0 1 12 0v1" />
                        </svg>
                        <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                          {author.displayName} · @
                          {author.publicId}
                        </span>
                      </Link>
                      <div className="mt-3">
                        <QuizReactionControl
                          key={`${signedIn}:${userId}:${quizId}`}
                          userId={signedIn ? userId : null}
                          quizId={quizId}
                        />
                      </div>
                    </>
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className={tagDiscoveryStyles.empty}>
            <p>
              {page > pages
                ? t("이 페이지에는 퀴즈가 없습니다.")
                : t("공개된 퀴즈가 없습니다.")}
            </p>
            {page > 1 ? (
              <Button
                variant="secondary"
                onClick={() => goToPage(1)}
              >
                {t("첫 페이지로")}
              </Button>
            ) : (
              backLink
            )}
          </div>
        )}
        {pages > 1 && (
          <nav
            aria-label={t("퀴즈 페이지")}
            className="flex flex-wrap items-center justify-end gap-3"
          >
            <Button
              variant="ghost"
              disabled={busy || page <= 1}
              onClick={() =>
                goToPage(Math.min(page - 1, pages))
              }
            >
              {t("이전")}
            </Button>
            <span className="text-sm text-muted">
              {page} / {pages}
            </span>
            <Button
              variant="ghost"
              disabled={busy || page >= pages}
              onClick={() => goToPage(page + 1)}
            >
              {t("다음")}
            </Button>
          </nav>
        )}
      </section>
      {notice && (
        <Toast
          message={notice}
          onClose={() => setNotice(null)}
        />
      )}
    </div>
  );
}

export function TagCatalogScreen() {
  const { hashtagId } = useParams<{ hashtagId: string }>();
  const params = useSearchParams();
  const userId = params.get("user") ?? "learner";
  const [client] = useState(() => createQueryClient());
  return (
    <QueryClientProvider client={client}>
      <Catalog
        key={`${params.get("user") ?? "guest"}:${hashtagId}`}
        userId={userId}
        hashtagId={hashtagId}
      />
    </QueryClientProvider>
  );
}
