"use client";
import {
  useLocale,
  useTranslation,
} from "@/lib/i18n/use-translation";

import { useState } from "react";
import type { LedgerEntry } from "@/api/contracts";
import { useWallet } from "@/components/coins/queries";
import { ShopProvider } from "@/components/shop/provider";
import { errorMessage } from "@/components/shop/errors";
import {
  Button,
  Coin,
  Pagination,
  Tabs,
} from "@/components/ui";

const PAGE_SIZE = 5;

const reasons: Record<LedgerEntry["reason"], string> = {
  SEED: "데모 지급",
  DAILY_COMPLETION: "일일 학습 보상",
  PURCHASE: "상품 구매",
};

const HistoryFilter = {
  ALL: "전체",
  CREDIT: "지급 (+)",
  DEBIT: "사용 (-)",
} as const;

type HistoryFilter =
  (typeof HistoryFilter)[keyof typeof HistoryFilter];

export function CoinHistoryContent({
  userId,
}: {
  userId: string;
}) {
  const t = useTranslation();
  const locale = useLocale();

  const [selection, setSelection] = useState<{
    userId: string;
    page: number;
    filter: HistoryFilter;
  }>({
    userId,
    filter: HistoryFilter.ALL,
    page: 1,
  });
  const { data, error, isPending, isFetching, refetch } =
    useWallet(userId);
  const filter =
    selection.userId === userId
      ? selection.filter
      : HistoryFilter.ALL;
  const entries = data
    ? [...data.ledger]
        .filter(
          ({ amount }) =>
            filter === HistoryFilter.ALL ||
            (filter === HistoryFilter.CREDIT
              ? amount > 0
              : amount < 0),
        )
        .reverse()
        .sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        )
    : [];

  const totalPages = Math.max(
    1,
    Math.ceil(entries.length / PAGE_SIZE),
  );
  const page = Math.min(
    selection.userId === userId ? selection.page : 1,
    totalPages,
  );
  if (
    selection.userId !== userId ||
    selection.page !== page
  ) {
    setSelection({ userId, page, filter });
  }
  const visibleEntries = entries.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <section
      aria-labelledby="bugcoin-history-heading"
      className="rounded-3xl border border-line bg-surface px-5 py-6 sm:px-8 sm:py-8"
    >
      <h2
        id="bugcoin-history-heading"
        className="text-lg font-semibold tracking-tight"
      >
        {t("BugCoin 내역")}
      </h2>
      {isPending && (
        <p role="status" className="mt-5 text-muted">
          {t("잔액과 내역을 불러오는 중…")}
        </p>
      )}
      {error && (
        <div className="mt-5 space-y-3">
          <p role="alert">{t(errorMessage(error))}</p>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              loading={isFetching}
              onClick={() => void refetch()}
            >
              {t("다시 시도")}
            </Button>
          </div>
        </div>
      )}
      {data && !error && (
        <>
          <div className="mb-7 mt-5">
            <span className="block text-sm text-muted">
              {t("내 잔액")}
            </span>
            <span
              aria-label={t("내 잔액")}
              className="mt-2 block [&_.ui-coin]:text-4xl [&_.ui-coin]:tracking-tight [&_.ui-coin]:tabular-nums [&_.ui-coin]:gap-2.5 [&_.ui-coin_>_span]:-rotate-6 [&_.ui-coin_small]:ml-1 [&_.ui-coin_small]:text-sm"
            >
              <Coin amount={data.balance} />
            </span>
          </div>
          <Tabs
            label={t("BugCoin 내역 필터")}
            className="[&_[role=tablist]]:gap-1 [&_[role=tablist]]:border-0 [&_[role=tablist]]:overflow-visible [&_[role=tablist]_button]:min-h-10 [&_[role=tablist]_button]:rounded-xl [&_[role=tablist]_button]:border-0 [&_[role=tablist]_button]:px-4 [&_[role=tablist]_button]:py-2 [&_[role=tablist]_button]:text-sm [&_[role=tablist]_button[aria-selected=true]]:bg-primary/10 [&_[role=tablist]_button[aria-selected=true]]:text-primary"
            panelClassName="pt-3! text-foreground!"
            items={Object.values(HistoryFilter)}
            value={filter}
            onChange={(value) =>
              setSelection({
                userId,
                page: 1,
                filter: value as HistoryFilter,
              })
            }
          >
            {entries.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">
                {filter === HistoryFilter.CREDIT
                  ? t("지급 내역이 없어요.")
                  : filter === HistoryFilter.DEBIT
                    ? t("사용 내역이 없어요.")
                    : t("아직 지급·사용 내역이 없어요.")}
              </p>
            ) : (
              <ul
                aria-label={t("지급·사용 내역")}
                className="divide-y divide-line/60"
              >
                {visibleEntries.map(
                  ({ id, amount, reason, createdAt }) => (
                    <li
                      key={id}
                      className="flex items-center justify-between gap-4 py-3.5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t(reasons[reason])}
                        </p>
                        <time
                          dateTime={createdAt}
                          aria-label={new Intl.DateTimeFormat(
                            locale,
                            {
                              dateStyle: "long",
                              timeStyle: "long",
                            },
                          ).format(new Date(createdAt))}
                          className="mt-1 block text-xs text-muted"
                        >
                          {new Intl.DateTimeFormat(locale, {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }).format(new Date(createdAt))}
                        </time>
                      </div>
                      <span
                        className={`whitespace-nowrap text-base font-semibold tabular-nums ${amount > 0 ? "text-primary" : "text-foreground"}`}
                      >
                        <span className="sr-only">
                          {amount < 0
                            ? t("사용 ")
                            : t("지급 ")}
                        </span>
                        {amount > 0 ? "+" : ""}
                        {amount.toLocaleString(locale)}{" "}
                        <span className="sr-only">
                          BugCoin
                        </span>
                      </span>
                    </li>
                  ),
                )}
              </ul>
            )}
            {totalPages > 1 && (
              <div className="mt-2 flex justify-center border-t border-line pt-4 [&_nav]:gap-3 [&_button]:min-h-10 [&_button]:min-w-10 [&_button]:rounded-lg [&_button]:border [&_button]:border-line [&_button]:text-foreground">
                <Pagination
                  compact
                  page={page}
                  total={totalPages}
                  onChange={(nextPage) =>
                    setSelection({
                      userId,
                      page: nextPage,
                      filter,
                    })
                  }
                />
              </div>
            )}
          </Tabs>
        </>
      )}
    </section>
  );
}

export function CoinHistory({
  userId,
}: {
  userId: string;
}) {
  return (
    <ShopProvider>
      <CoinHistoryContent userId={userId} />
    </ShopProvider>
  );
}
