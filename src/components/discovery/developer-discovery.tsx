"use client";
import { type UiMessage } from "@/lib/i18n/messages";

import { useTranslation } from "@/lib/i18n/use-translation";

import { createQueryClient } from "@/api/query-client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { SubscriptionCollection } from "@/components/discovery/subscription-collection";
import { DiscoveryMascot } from "@/components/discovery/discovery-mascot";
import {
  discoveryStyles,
  avatarTones,
} from "@/components/discovery/styles";
import { ApiClientError } from "@/api/client";
import { DiscoveryKind } from "@/api/constants";
import type {
  DiscoveryQuery,
  Subscription,
} from "@/api/contracts";
import {
  Avatar,
  Button,
  Skeleton,
  SearchField,
  Toast,
} from "@/components/ui";
import { useDemoSession } from "@/components/navigation/demo-session";
import {
  useDeveloperDiscovery,
  useSubscriptions,
} from "@/components/discovery/developer-queries";
import { SubscriptionControl } from "@/components/discovery/subscription-control";
import {
  pageTitle,
  searchButtonStyle,
} from "@/components/ui/styles";

const linkStyle =
  "inline-flex min-h-11 items-center rounded-xl text-primary font-semibold hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function Failure({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  const t = useTranslation();

  const code =
    error instanceof ApiClientError
      ? error.detail.code
      : undefined;
  const corrupt = code === "STORAGE_CORRUPT";
  return (
    <div
      role="alert"
      className="space-y-3 rounded-xl border border-line bg-surface p-5"
    >
      <p>
        {corrupt
          ? t(
              "이 사용자의 저장 데이터를 읽을 수 없습니다. 데이터는 변경하지 않았습니다.",
            )
          : code === "STORAGE_UNAVAILABLE"
            ? t(
                "브라우저 저장소를 사용할 수 없습니다. 저장소 접근을 허용한 뒤 다시 시도해 주세요.",
              )
            : t("검색 결과를 불러오지 못했습니다.")}
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={retry}>
          {t("다시 불러오기")}
        </Button>
      </div>
    </div>
  );
}

export function DeveloperDiscovery() {
  const [client] = useState(() => createQueryClient());
  const params = useSearchParams();
  const userId = params.get("user") ?? "learner";
  const [loginTarget, setLoginTarget] = useState<
    string | null
  >(null);
  return (
    <QueryClientProvider client={client}>
      <DeveloperContent
        key={userId}
        userId={userId}
        loginTarget={loginTarget}
        setLoginTarget={setLoginTarget}
      />
    </QueryClientProvider>
  );
}

function DeveloperContent({
  userId,
  loginTarget,
  setLoginTarget,
}: {
  userId: string;
  loginTarget: string | null;
  setLoginTarget: (target: string | null) => void;
}) {
  const t = useTranslation();

  const params = useSearchParams();
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const query = params.get("query") ?? "";
  const rawPage = Number(params.get("page") ?? 1);
  const page =
    Number.isSafeInteger(rawPage) && rawPage > 0
      ? rawPage
      : 1;
  const request: DiscoveryQuery = {
    kind: DiscoveryKind.USER,
    query,
    page,
    pageSize: 20,
  };
  const [draft, setDraft] = useState({
    source: query,
    value: query,
  });
  // Synchronize browser back/forward without remounting the search field.
  if (draft.source !== query)
    setDraft({ source: query, value: query });
  const [inputError, setInputError] = useState<
    string | null
  >(null);
  const [toast, setToast] = useState<UiMessage | null>(
    null,
  );
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const subscriptionSummary = useRef<HTMLElement>(null);
  const focusResults = useRef(false);
  const { signedIn, signIn } = useDemoSession();
  const { directory, validUser, validQuery, discovery } =
    useDeveloperDiscovery(userId, request);
  const subscriptions = useSubscriptions(
    userId,
    signedIn && validUser,
  );
  const { data } = discovery;
  const viewerQuery = params.get("user")
    ? `?user=${encodeURIComponent(userId)}`
    : "";
  useEffect(() => {
    if (!signedIn || !data || !loginTarget) return;
    const frame = requestAnimationFrame(() => {
      const target = Array.from(
        document.querySelectorAll<HTMLButtonElement>(
          "button[data-subscription-target]",
        ),
      ).find(
        (button) =>
          button.dataset.subscriptionTarget ===
            loginTarget && !button.disabled,
      );
      if (target) {
        target.focus();
        setLoginTarget(null);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [
    signedIn,
    data,
    loginTarget,
    setLoginTarget,
    navigating,
  ]);

  function requestLogin(trigger: HTMLElement) {
    setLoginTarget(
      trigger.dataset.subscriptionTarget ?? null,
    );
    signIn({ onCancel: () => setLoginTarget(null) });
  }
  const users = directory.data?.users ?? [];
  const hashtags = directory.data?.hashtags ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.total ?? 0) / 20),
  );
  const outOfRange = !!data && page > totalPages;

  function search(
    nextQuery: string,
    nextPage: number,
    nextUser = params.get("user"),
  ) {
    const next = new URLSearchParams({
      page: String(nextPage),
    });
    if (nextUser) next.set("user", nextUser);
    if (nextQuery) next.set("query", nextQuery);
    startTransition(() =>
      router.push(`/discover/developers?${next}`, {
        scroll: false,
      }),
    );
  }

  function subscriptionLabel(sub: Subscription) {
    const person =
      "authorUserId" in sub
        ? users.find(
            ({ userId: id }) => id === sub.authorUserId,
          )
        : undefined;
    const tag =
      "hashtagId" in sub
        ? hashtags.find(({ id }) => id === sub.hashtagId)
        : undefined;
    return {
      name:
        sub.type === "PERSON"
          ? (person?.displayName ?? t("개발자"))
          : sub.type === "HASHTAG"
            ? `#${tag?.name ?? t("태그")}`
            : `${person?.displayName ?? t("개발자")} · #${tag?.name ?? t("태그")}`,
      person,
      tag,
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <DiscoveryMascot />
          <h1 className={pageTitle}>{t("개발자 탐색")}</h1>
        </div>
      </div>
      <form
        className="flex items-start gap-2 rounded-surface border border-line bg-surface p-3 sm:gap-3 sm:p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (Array.from(draft.value.trim()).length > 100) {
            setInputError(
              "검색어는 100자 이하여야 합니다.",
            );
            return;
          }
          setInputError(null);
          search(draft.value.trim(), 1);
        }}
      >
        <SearchField
          label={t("개발자 검색")}
          placeholder={t("이름 또는 아이디로 검색")}
          value={draft.value}
          onChange={(event) => {
            setDraft({
              source: query,
              value: event.target.value,
            });
            setInputError(null);
          }}
          error={
            inputError ??
            (!validQuery
              ? "검색어는 100자 이하여야 합니다."
              : undefined)
          }
        />
        <Button
          type="submit"
          className={searchButtonStyle}
          aria-disabled={navigating}
        >
          {t("검색")}
        </Button>
      </form>
      {directory.isPending && <Skeleton />}
      {directory.error && (
        <Failure
          error={directory.error}
          retry={() => void directory.refetch()}
        />
      )}
      {directory.data && !validUser && (
        <div role="alert" className="space-y-3">
          <p>{t("알 수 없는 데모 사용자입니다.")}</p>
          <Button
            onClick={() => search(query, 1, "learner")}
          >
            {t("학습자로 탐색하기")}
          </Button>
        </div>
      )}
      {signedIn && validUser && (
        <details className="group rounded-surface border border-line bg-surface px-5 py-2">
          <summary
            ref={subscriptionSummary}
            className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-xl py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="size-4 text-primary"
            >
              <path
                d="M7 4h10v16l-5-3-5 3V4Z"
                strokeLinejoin="round"
              />
            </svg>
            {t("내 구독")}
            {subscriptions.data && (
              <span className="rounded-full bg-primary/8 px-2 py-0.5 text-xs text-primary">
                {subscriptions.data.length}
                {t("개")}
              </span>
            )}
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="ml-auto size-4 text-muted transition-transform group-open:rotate-180"
            >
              <path
                d="m5 8 5 5 5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </summary>
          {subscriptions.isPending && <Skeleton />}
          {subscriptions.error && (
            <Failure
              error={subscriptions.error}
              retry={() => void subscriptions.refetch()}
            />
          )}
          {subscriptions.data?.length === 0 && (
            <p className="py-4 text-sm text-muted">
              {t("아직 구독한 개발자나 태그가 없습니다.")}
            </p>
          )}
          {subscriptions.data && (
            <SubscriptionCollection
              userId={userId}
              onSuccess={setToast}
              onPreviewRemoved={() =>
                subscriptionSummary.current?.focus()
              }
              entries={subscriptions.data.map(
                (subscription) => {
                  const { name, person, tag } =
                    subscriptionLabel(subscription);
                  const href = person
                    ? subscription.type === "PERSON_HASHTAG"
                      ? `/developers/${encodeURIComponent(person.publicId)}/quizzes?user=${encodeURIComponent(userId)}&tag=${encodeURIComponent(tag?.id ?? "")}`
                      : `/users/${encodeURIComponent(person.publicId)}?user=${encodeURIComponent(userId)}`
                    : `/discover/tags?user=${encodeURIComponent(userId)}&query=${encodeURIComponent(tag?.name ?? "")}`;
                  return {
                    subscription,
                    name,
                    href,
                    searchText: `${name} ${person?.publicId ?? ""} ${tag?.name ?? ""}`,
                  };
                },
              )}
            />
          )}
        </details>
      )}
      {validUser && validQuery && (
        <>
          {discovery.isPending && <Skeleton />}
          {discovery.error && (
            <Failure
              error={discovery.error}
              retry={() => void discovery.refetch()}
            />
          )}
          {data && !discovery.isError && (
            <section
              aria-label={t("개발자 검색 결과")}
              aria-busy={discovery.isFetching || navigating}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <h2
                  ref={(element) => {
                    resultHeading.current = element;
                    if (
                      element &&
                      focusResults.current &&
                      !discovery.isFetching &&
                      !navigating
                    ) {
                      focusResults.current = false;
                      element.focus();
                    }
                  }}
                  tabIndex={-1}
                  className="rounded-xl text-sm font-medium text-muted focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {t("검색 결과 {0}개", {
                    0: data.total.toLocaleString(),
                  })}
                  {" · "}
                  {outOfRange
                    ? t("총 {0}페이지", { 0: totalPages })
                    : t("{0}페이지", { 0: data.page })}
                </h2>
                {signedIn && (
                  <Link
                    className={`${linkStyle} ml-auto gap-1 text-xs`}
                    href={`/?user=${encodeURIComponent(userId)}`}
                  >
                    {t("홈에서 학습하기")}{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
              <p role="status" className="sr-only">
                {discovery.isFetching
                  ? t("검색 중")
                  : t("검색 결과 {0}개", { 0: data.total })}
              </p>
              {outOfRange ? (
                <div className="space-y-3">
                  <p>{t("요청한 페이지가 없습니다.")}</p>
                  <Button
                    onClick={() => {
                      focusResults.current = true;
                      search(query, 1);
                    }}
                  >
                    {t("첫 페이지로")}
                  </Button>
                </div>
              ) : data.items.length ? (
                <ul className="grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.items.map((item) => {
                    if (item.type !== DiscoveryKind.USER)
                      return null;
                    const {
                      user: {
                        userId: id,
                        displayName,
                        publicId,
                      },
                      subscribed,
                      summary,
                    } = item;
                    return (
                      <li
                        key={id}
                        className={discoveryStyles.card}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            aria-hidden="true"
                            className={
                              avatarTones[
                                Array.from(publicId).reduce(
                                  (sum, letter) =>
                                    sum +
                                    letter.charCodeAt(0),
                                  0,
                                ) % avatarTones.length
                              ]
                            }
                          >
                            <Avatar
                              name={displayName}
                              size="lg"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              className={
                                discoveryStyles.personLink
                              }
                              href={`/users/${encodeURIComponent(publicId)}${viewerQuery}`}
                            >
                              {displayName}
                            </Link>
                            <p className="break-all text-[13px] text-muted">
                              @{publicId}
                            </p>
                          </div>
                        </div>
                        <div className="min-h-7">
                          {summary &&
                            !!summary.hashtags.length && (
                              <ul
                                aria-label={t(
                                  "{0} 공개 퀴즈 태그",
                                  { 0: displayName },
                                )}
                                className="flex flex-wrap gap-1.5"
                              >
                                {summary.hashtags.map(
                                  ({ id: tagId, name }) => (
                                    <li
                                      key={tagId}
                                      className="rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
                                    >
                                      #{name}
                                    </li>
                                  ),
                                )}
                              </ul>
                            )}
                          {!summary && (
                            <p className="text-sm text-muted">
                              {t(
                                "공개 퀴즈 정보를 불러올 수 없습니다.",
                              )}
                            </p>
                          )}
                        </div>
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                          {summary && (
                            <Link
                              className={`${discoveryStyles.quizLink} text-sm font-semibold text-primary underline underline-offset-4`}
                              href={`/developers/${encodeURIComponent(publicId)}/quizzes${viewerQuery}`}
                              aria-label={t(
                                "{0} 공개 퀴즈 {1}개",
                                {
                                  0: displayName,
                                  1: summary.publicQuizCount,
                                },
                              )}
                            >
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 20 20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="size-4 shrink-0"
                              >
                                <rect
                                  x="4"
                                  y="2.5"
                                  width="12"
                                  height="15"
                                  rx="3"
                                />
                                <path
                                  d="M7 7h6M7 10h6M7 13h3"
                                  strokeLinecap="round"
                                />
                              </svg>
                              {summary.publicQuizCount === 0
                                ? t("현재 공개 퀴즈 없음")
                                : t("공개 퀴즈 {0}개", {
                                    0: summary.publicQuizCount,
                                  })}
                            </Link>
                          )}
                          <SubscriptionControl
                            userId={userId}
                            name={displayName}
                            target={{
                              type: "PERSON",
                              authorUserId: id,
                            }}
                            subscribed={
                              signedIn && subscribed
                            }
                            disabled={
                              navigating ||
                              discovery.isFetching
                            }
                            signedIn={signedIn}
                            onLogin={requestLogin}
                            onSuccess={setToast}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-surface border border-line bg-canvas px-5 py-10 text-center text-sm text-muted break-keep">
                  {t(
                    "검색 결과가 없습니다. 검색어를 바꿔 보세요.",
                  )}
                </div>
              )}
              {!outOfRange && totalPages > 1 && (
                <nav
                  aria-label={t("검색 결과 페이지")}
                  className="flex flex-wrap items-center justify-end gap-3"
                >
                  <Button
                    className="!min-h-11"
                    variant="secondary"
                    disabled={page <= 1 || navigating}
                    onClick={() => {
                      focusResults.current = true;
                      search(query, page - 1);
                    }}
                  >
                    {t("이전 페이지")}
                  </Button>
                  <span>
                    {page} / {totalPages}
                  </span>
                  <Button
                    className="!min-h-11"
                    variant="secondary"
                    disabled={
                      page >= totalPages || navigating
                    }
                    onClick={() => {
                      focusResults.current = true;
                      search(query, page + 1);
                    }}
                  >
                    {t("다음 페이지")}
                  </Button>
                </nav>
              )}
            </section>
          )}
        </>
      )}
      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
