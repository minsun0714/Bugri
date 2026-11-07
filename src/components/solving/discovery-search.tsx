"use client";

import { useState } from "react";
import {
  Button,
  Skeleton,
  TextField,
} from "@/components/ui";
import type { SubscriptionTarget } from "@/api/contracts";
import { useDiscovery } from "@/components/solving/discovery-queries";

export function DiscoverySearch({
  userId,
  onLearn,
}: {
  userId: string;
  onLearn: (hashtagId: string | null) => void;
}) {
  const [search, setSearch] = useState("");
  const { discovery, subscribe } = useDiscovery(userId);
  const term = search
    .trim()
    .normalize("NFC")
    .toLocaleLowerCase();
  const matches = (...values: string[]) =>
    values.some((value) =>
      value
        .normalize("NFC")
        .toLocaleLowerCase()
        .includes(term),
    );
  const users =
    discovery.data?.users.filter(
      ({ displayName, publicId, userId }) =>
        matches(displayName, publicId, userId),
    ) ?? [];
  const tags =
    discovery.data?.tags.filter(({ id, name }) =>
      matches(id, name),
    ) ?? [];

  function action(
    name: string,
    target: SubscriptionTarget,
    tag: string | null,
    subscribed: boolean,
  ) {
    const label = subscribed
      ? "학습하기"
      : "구독하고 학습하기";

    return (
      <Button
        size="sm"
        variant="secondary"
        loading={subscribe.isPending}
        aria-label={`${name} ${label}`}
        onClick={() => {
          if (subscribed) onLearn(tag);
          else
            subscribe.mutate(target, {
              onSuccess: () => onLearn(tag),
            });
        }}
      >
        {label}
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <TextField
        type="search"
        autoFocus
        label="개발자 또는 태그 검색"
        placeholder="이름 또는 태그 입력"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <Button
        variant="ghost"
        disabled={subscribe.isPending}
        onClick={() => onLearn(null)}
      >
        전체 태그로 학습하기
      </Button>
      {discovery.isPending && <Skeleton />}
      {discovery.error && (
        <div role="alert">
          <p>검색 대상을 불러오지 못했습니다.</p>
          <Button onClick={() => void discovery.refetch()}>
            다시 불러오기
          </Button>
        </div>
      )}
      {subscribe.error && (
        <p role="alert">
          구독을 저장하지 못했습니다. 입력을 유지했으니 다시
          시도해 주세요.
        </p>
      )}
      {discovery.data && (
        <div className="max-h-[50vh] space-y-5 overflow-y-auto overscroll-contain pr-2">
          <section aria-label="개발자 검색 결과">
            <h3 className="mb-2">개발자</h3>
            {users.length ? (
              <ul className="space-y-3">
                {users.map(
                  ({
                    userId: id,
                    displayName,
                    publicId,
                  }) => (
                    <li
                      key={id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3"
                    >
                      <div className="min-w-0 break-all">
                        <strong>{displayName}</strong>
                        <div className="text-xs text-muted">
                          @{publicId}
                        </div>
                      </div>
                      {action(
                        displayName,
                        {
                          type: "PERSON",
                          authorUserId: id,
                        },
                        null,
                        discovery.data!.subscriptions.some(
                          (sub) =>
                            sub.type === "PERSON" &&
                            sub.authorUserId === id,
                        ),
                      )}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p>일치하는 개발자가 없습니다.</p>
            )}
          </section>
          <section aria-label="태그 검색 결과">
            <h3 className="mb-2">태그</h3>
            {tags.length ? (
              <ul className="space-y-3">
                {tags.map(({ id, name }) => (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3"
                  >
                    <strong>{name}</strong>
                    {action(
                      name,
                      { type: "HASHTAG", hashtagId: id },
                      id,
                      discovery.data!.subscriptions.some(
                        (sub) =>
                          sub.type === "HASHTAG" &&
                          sub.hashtagId === id,
                      ),
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>일치하는 태그가 없습니다.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
