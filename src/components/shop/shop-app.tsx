"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ApiClientError } from "@/api/client";
import type { Category } from "@/api/contracts";
import {
  Badge,
  Button,
  Card,
  Coin,
  EmptyState,
  Skeleton,
  Tag,
} from "@/components/ui";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import {
  DeskScene,
  ProductArtwork,
} from "@/components/shop/artwork";
import { ShopProvider } from "@/components/shop/provider";
import { useShop } from "@/components/shop/use-shop";

const categories: Record<Category, string> = {
  KEYBOARD: "키보드",
  MONITOR: "모니터",
  DESK: "책상",
  ACCESSORY: "소품",
  BACKGROUND: "배경",
};

export function errorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    const messages: Record<string, string> = {
      INSUFFICIENT_BALANCE:
        "BugCoin이 부족해요. 다른 상품을 골라보세요.",
      ALREADY_OWNED: "이미 보관함에 있는 상품이에요.",
      STORAGE_UNAVAILABLE:
        "저장 공간에 접근할 수 없어요. 브라우저 설정을 확인하고 다시 시도해 주세요.",
      STORAGE_CORRUPT:
        "저장된 데이터를 읽을 수 없어요. 기존 데이터는 보존했어요.",
    };
    return messages[error.detail.code] ?? error.message;
  }
  return "불러오지 못했어요. 잠시 후 다시 시도해 주세요.";
}

function ShopContent({ userId }: { userId: string }) {
  const {
    products,
    wallet,
    inventory,
    users,
    purchase,
    equip,
  } = useShop(userId);
  const [tab, setTab] = useState("상점");
  const [category, setCategory] = useState<Category | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [actionError, setActionError] =
    useState<unknown>(null);
  const busy = useRef(false);
  const keys = useRef(new Map<string, string>());
  const loading =
    products.isPending ||
    wallet.isPending ||
    inventory.isPending;
  const error =
    products.error || wallet.error || inventory.error;
  const owned = new Set(
    inventory.data?.products.map(
      ({ productId }) => productId,
    ),
  );
  const visible =
    (tab === "상점"
      ? products.data
      : inventory.data?.products
    )?.filter(
      (product) =>
        !category || product.category === category,
    ) ?? [];
  const pending = purchase.isPending || equip.isPending;

  async function buy(productId: string) {
    if (busy.current) return;
    busy.current = true;
    setActionError(null);
    setMessage("");
    const requestKey =
      keys.current.get(productId) ?? crypto.randomUUID();
    keys.current.set(productId, requestKey);
    try {
      await purchase.mutateAsync({ productId, requestKey });
      setMessage("구매 완료 · 보관함에 담았어요.");
    } catch (error) {
      setActionError(error);
    } finally {
      busy.current = false;
    }
  }

  async function changeEquipment(
    category: Category,
    productId: string | null,
  ) {
    if (busy.current) return;
    busy.current = true;
    setActionError(null);
    setMessage("");
    try {
      await equip.mutateAsync({ category, productId });
      setMessage(
        productId
          ? "데스크에 장착했어요."
          : "장착을 해제했어요. 상품은 보관함에 남아 있어요.",
      );
    } catch (error) {
      setActionError(error);
    } finally {
      busy.current = false;
    }
  }

  return (
    <>
      <section
        className="mb-10 grid items-center gap-5 lg:grid-cols-[.85fr_1.15fr]"
        aria-labelledby="shop-title"
      >
        <div>
          <p className="mb-4 text-xs font-bold tracking-[.22em] text-primary">
            BUGRI OBJECTS / COLLECTION 01
          </p>
          <h1
            id="shop-title"
            className="text-4xl leading-tight tracking-tight sm:text-5xl"
          >
            배움이 쌓이는
            <br />
            <span className="text-primary">
              나만의 작은 공간.
            </span>
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
            좋아하는 키보드, 작은 초록 하나.
            <br />
            BugCoin으로 오늘의 데스크를 꾸며보세요.
          </p>
          <div
            className="mt-6 inline-flex rounded-2xl border border-line bg-surface px-5 py-3"
            aria-label="내 잔액"
          >
            {wallet.data ? (
              <Coin amount={wallet.data.balance} />
            ) : (
              <span>잔액 불러오는 중</span>
            )}
          </div>
        </div>
        <div
          id="desk"
          className="relative rounded-[2rem] border border-line bg-surface p-3"
        >
          <div className="flex items-center justify-between px-4 pt-3">
            <h2 className="text-sm">내 데스크</h2>
            <Badge>
              {
                Object.keys(inventory.data?.equipment ?? {})
                  .length
              }
              개 장착
            </Badge>
          </div>
          <div className="aspect-[600/380]">
            <DeskScene
              equipment={inventory.data?.equipment ?? {}}
            />
          </div>
          <p className="pb-3 text-center text-xs text-muted">
            보관함에서 장착하면 이 공간에 놓여요.
          </p>
        </div>
      </section>
      <section id="collection" aria-label="상품 컬렉션">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div className="flex gap-2">
            {["상점", "보관함"].map((value) => (
              <Button
                key={value}
                variant={
                  tab === value ? "primary" : "ghost"
                }
                aria-pressed={tab === value}
                onClick={() => {
                  setTab(value);
                  setCategory(null);
                }}
              >
                {value}
              </Button>
            ))}
          </div>
          <span className="text-xs text-muted">
            {visible.length}개의 오브젝트
          </span>
        </div>
        <div
          className="my-5 flex flex-wrap gap-2"
          aria-label="상품 카테고리"
        >
          <Tag
            selected={!category}
            onClick={() => setCategory(null)}
          >
            전체
          </Tag>
          {Object.entries(categories).map(
            ([value, label]) => (
              <Tag
                key={value}
                selected={category === value}
                onClick={() =>
                  setCategory(value as Category)
                }
              >
                {label}
              </Tag>
            ),
          )}
        </div>
        <div
          role="status"
          className="mb-3 text-sm text-primary"
        >
          {message}
        </div>
        {actionError ? (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-coral bg-coral/10 p-4 text-sm"
          >
            {errorMessage(actionError)}
          </p>
        ) : null}
        {loading ? (
          <Skeleton />
        ) : error ? (
          <div role="alert">
            <p>{errorMessage(error)}</p>
            <Button
              onClick={() => {
                void products.refetch();
                void wallet.refetch();
                void inventory.refetch();
              }}
            >
              다시 시도
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title="아직 보관한 상품이 없어요"
            description="상점에서 마음에 드는 상품을 골라보세요."
            action={
              <Button
                onClick={() => {
                  setTab("상점");
                  setCategory(null);
                }}
              >
                상점 보기
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => {
              const {
                productId,
                name,
                description,
                price,
                category,
              } = product;
              const equipped =
                inventory.data?.equipment[category] ===
                productId;
              return (
                <Card
                  key={productId}
                  className="group overflow-hidden !p-0"
                >
                  <div className="relative flex h-52 items-center justify-center bg-canvas p-9 transition-colors group-hover:bg-primary/5">
                    <span className="absolute left-5 top-4 text-[10px] font-bold tracking-[.14em] text-muted">
                      {categories[category]}
                    </span>
                    <ProductArtwork
                      productId={productId}
                      name={name}
                    />
                    {equipped && (
                      <span className="absolute right-4 top-3">
                        <Badge tone="success">
                          장착 중
                        </Badge>
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg">{name}</h3>
                    <p className="mt-2 min-h-10 text-xs leading-5 text-muted">
                      {description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <Coin amount={price} />
                      {tab === "상점" ? (
                        <Button
                          size="sm"
                          variant={
                            owned.has(productId)
                              ? "secondary"
                              : "primary"
                          }
                          disabled={
                            pending || owned.has(productId)
                          }
                          onClick={() =>
                            void buy(productId)
                          }
                        >
                          {owned.has(productId)
                            ? "보유 중"
                            : "구매하기"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant={
                            equipped
                              ? "secondary"
                              : "primary"
                          }
                          disabled={pending}
                          onClick={() =>
                            void changeEquipment(
                              category,
                              equipped ? null : productId,
                            )
                          }
                        >
                          {equipped
                            ? "장착 해제"
                            : "장착하기"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
      <section
        id="neighbors"
        className="mt-12 rounded-3xl border border-line bg-surface p-6"
      >
        <h2 className="text-lg">이웃의 데스크</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {users.data
            ?.filter((user) => user.userId !== userId)
            .map((user) => (
              <Link
                key={user.publicId}
                href={`/users/${user.publicId}`}
                className="rounded-xl bg-canvas px-5 py-3 text-sm text-primary hover:bg-primary/10"
              >
                {user.displayName}의 데스크 ↗
              </Link>
            ))}
          {users.error && (
            <Button
              variant="ghost"
              onClick={() => void users.refetch()}
            >
              이웃 다시 불러오기
            </Button>
          )}
        </div>
      </section>
    </>
  );
}

export function ShopApp() {
  const [userId, setUserId] = useState("learner");
  return (
    <ShopProvider>
      <Header
        preview={false}
        sections={[
          ["top", "상점"],
          ["desk", "내 데스크"],
          ["collection", "컬렉션"],
          ["neighbors", "이웃"],
        ]}
      />
      <main
        id="top"
        className="mx-auto max-w-[1220px] px-5 py-7 md:px-12"
      >
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <Link href="/">← Bugri 홈</Link>
          <label className="flex items-center gap-2">
            더미 사용자
            <select
              aria-label="더미 사용자"
              value={userId}
              onChange={(event) =>
                setUserId(event.target.value)
              }
              className="rounded-xl border border-line bg-surface px-3 py-2 text-foreground"
            >
              <option value="learner">학습자</option>
              <option value="author">타입 개발자</option>
              <option value="friend">웹 개발자</option>
            </select>
          </label>
        </div>
        <ShopContent key={userId} userId={userId} />
        <p className="mt-8 text-xs leading-6 text-muted">
          프로토타입의 더미 BugCoin을 사용합니다. 구매·장착
          기록은 이 브라우저에 저장되며 브라우저 데이터를
          지우면 초기화됩니다.
        </p>
      </main>
      <Footer note="Bugri objects · 작은 공간, 쌓이는 배움" />
    </ShopProvider>
  );
}
