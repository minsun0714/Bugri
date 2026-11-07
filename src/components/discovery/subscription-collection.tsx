"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Subscription } from "@/api/contracts";
import { Button, Modal, TextField } from "@/components/ui";
import { SubscriptionControl } from "@/components/discovery/subscription-control";

export interface SubscriptionEntry {
  subscription: Subscription;
  name: string;
  searchText: string;
  href: string;
}

const filters = [
  { value: "ALL", label: "전체" },
  { value: "PERSON", label: "개발자" },
  { value: "HASHTAG", label: "태그" },
  { value: "PERSON_HASHTAG", label: "개발자별 태그" },
] as const;

type Filter = (typeof filters)[number]["value"];

export function SubscriptionCollection({
  entries,
  userId,
  onSuccess,
  onPreviewRemoved,
}: {
  entries: SubscriptionEntry[];
  userId: string;
  onSuccess: (message: string) => void;
  onPreviewRemoved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const results = useRef<HTMLHeadingElement>(null);
  const scrollArea = useRef<HTMLDivElement>(null);
  const term = query
    .trim()
    .normalize("NFC")
    .toLowerCase()
    .replace(/^[@#]/, "");
  const filtered = entries.filter(
    ({ subscription, searchText }) =>
      (filter === "ALL" || subscription.type === filter) &&
      searchText
        .normalize("NFC")
        .toLowerCase()
        .includes(term),
  );
  const pages = Math.max(
    1,
    Math.ceil(filtered.length / 20),
  );
  const currentPage = Math.min(page, pages);
  if (page !== currentPage) setPage(currentPage);

  function reset() {
    setQuery("");
    setFilter("ALL");
    setPage(1);
    if (scrollArea.current)
      scrollArea.current.scrollTop = 0;
  }

  function rows(
    items: SubscriptionEntry[],
    modal: boolean,
  ) {
    return items.map(({ subscription, name, href }) => (
      <li
        key={subscription.subscriptionId}
        className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-3"
      >
        <Link
          href={href}
          className="inline-flex min-h-11 min-w-0 flex-1 items-center rounded-xl break-words text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary"
        >
          {name}
        </Link>
        <SubscriptionControl
          userId={userId}
          name={name}
          target={subscription}
          subscribed
          signedIn
          onLogin={() => {}}
          onSuccess={(text) => {
            if (modal) setMessage(text);
            onSuccess(text);
          }}
          onRemoved={
            modal
              ? () => results.current?.focus()
              : onPreviewRemoved
          }
        />
      </li>
    ));
  }

  return (
    <>
      <ul className="divide-y divide-line">
        {rows(entries.slice(0, 3), false)}
      </ul>
      {entries.length > 0 && (
        <div className="flex justify-end border-t border-line pt-2">
          <Button
            ref={trigger}
            variant="ghost"
            onClick={() => {
              reset();
              setMessage("");
              setOpen(true);
            }}
          >
            전체 보기
          </Button>
        </div>
      )}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          requestAnimationFrame(() =>
            trigger.current
              ? trigger.current.focus()
              : onPreviewRemoved(),
          );
        }}
        title="내 구독"
        layout="conversation"
        initialFocusSelector='input[type="search"]'
      >
        <div className="shrink-0 space-y-3 pb-3">
          <TextField
            type="search"
            label="내 구독 검색"
            hideLabel
            placeholder="이름, 아이디 또는 태그로 검색"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
              if (scrollArea.current)
                scrollArea.current.scrollTop = 0;
            }}
          />
          <div
            role="group"
            aria-label="구독 유형"
            className="flex flex-wrap gap-2"
          >
            {filters.map(({ value, label }) => (
              <Button
                key={value}
                variant="ghost"
                aria-pressed={filter === value}
                className={`!min-h-11 !rounded-full !px-3 !text-sm !shadow-none ${filter === value ? "!bg-primary/10 !text-primary" : "!bg-canvas !text-muted"}`}
                onClick={() => {
                  setFilter(value);
                  setPage(1);
                  if (scrollArea.current)
                    scrollArea.current.scrollTop = 0;
                }}
              >
                {label}
              </Button>
            ))}
          </div>
          <h3
            ref={results}
            tabIndex={-1}
            className="rounded-lg text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary"
          >
            구독 {filtered.length.toLocaleString("ko-KR")}개
          </h3>
        </div>
        <div
          ref={scrollArea}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1"
        >
          {filtered.length ? (
            <ul
              aria-label="전체 구독 목록"
              className="divide-y divide-line"
            >
              {rows(
                filtered.slice(
                  (currentPage - 1) * 20,
                  currentPage * 20,
                ),
                true,
              )}
            </ul>
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-sm text-muted">
              <p>
                {entries.length
                  ? "검색 조건에 맞는 구독이 없습니다."
                  : "아직 구독한 개발자나 태그가 없습니다."}
              </p>
              {(query || filter !== "ALL") && (
                <Button variant="secondary" onClick={reset}>
                  조건 초기화
                </Button>
              )}
            </div>
          )}
        </div>
        <div
          role="status"
          className="shrink-0 pt-2 text-sm text-primary"
        >
          {message}
        </div>
        <nav
          aria-label="구독 페이지"
          className="flex shrink-0 items-center justify-between gap-2 border-t border-line pt-3"
        >
          <Button
            variant="ghost"
            disabled={currentPage === 1}
            onClick={() => {
              setPage(currentPage - 1);
              if (scrollArea.current)
                scrollArea.current.scrollTop = 0;
              results.current?.focus();
            }}
          >
            이전
          </Button>
          <span className="text-sm text-muted">
            {currentPage} / {pages}
          </span>
          <Button
            variant="ghost"
            disabled={currentPage === pages}
            onClick={() => {
              setPage(currentPage + 1);
              if (scrollArea.current)
                scrollArea.current.scrollTop = 0;
              results.current?.focus();
            }}
          >
            다음
          </Button>
        </nav>
      </Modal>
    </>
  );
}
