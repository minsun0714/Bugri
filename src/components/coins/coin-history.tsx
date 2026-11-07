"use client";

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
    Math.ceil(entries.length / 10),
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
    (page - 1) * 10,
    page * 10,
  );

  return (
    <section
      aria-labelledby="bugcoin-history-heading"
      className="rounded-3xl border border-line bg-surface p-6 sm:p-8"
    >
      <h2
        id="bugcoin-history-heading"
        className="text-xl font-semibold"
      >
        BugCoin 내역
      </h2>
      {isPending && (
        <p role="status" className="mt-5 text-muted">
          잔액과 내역을 불러오는 중…
        </p>
      )}
      {error && (
        <div className="mt-5 space-y-3">
          <p role="alert">{errorMessage(error)}</p>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              loading={isFetching}
              onClick={() => void refetch()}
            >
              다시 시도
            </Button>
          </div>
        </div>
      )}
      {data && !error && (
        <>
          <div className="my-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas p-4">
            <span className="font-semibold">내 잔액</span>
            <span aria-label="내 잔액">
              <Coin amount={data.balance} />
            </span>
          </div>
          <Tabs
            label="BugCoin 내역 필터"
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
              <p className="text-muted">
                {filter === HistoryFilter.CREDIT
                  ? "지급 내역이 없어요."
                  : filter === HistoryFilter.DEBIT
                    ? "사용 내역이 없어요."
                    : "아직 지급·사용 내역이 없어요."}
              </p>
            ) : (
              <ul
                aria-label="지급·사용 내역"
                className="divide-y divide-line"
              >
                {visibleEntries.map(
                  ({ id, amount, reason, createdAt }) => (
                    <li
                      key={id}
                      className="flex flex-wrap items-center justify-between gap-3 py-4"
                    >
                      <div>
                        <p className="font-medium">
                          {reasons[reason]}
                        </p>
                        <time
                          dateTime={createdAt}
                          className="mt-1 block text-sm text-muted"
                        >
                          {new Intl.DateTimeFormat(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZoneName: "short",
                            },
                          ).format(new Date(createdAt))}
                        </time>
                      </div>
                      <span className="whitespace-nowrap font-semibold tabular-nums">
                        <span className="sr-only">
                          {amount < 0 ? "사용 " : "지급 "}
                        </span>
                        {amount > 0 ? "+" : ""}
                        {amount.toLocaleString(
                          "ko-KR",
                        )}{" "}
                        <span className="text-xs font-normal text-muted">
                          BugCoin
                        </span>
                      </span>
                    </li>
                  ),
                )}
              </ul>
            )}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-end">
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
