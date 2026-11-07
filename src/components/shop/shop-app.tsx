"use client";

import { DeskEditor } from "@/components/shop/desk-editor";

import { useRef, useState } from "react";
import Link from "next/link";
import { errorMessage } from "@/components/shop/errors";
import { ProductTrial } from "@/components/shop/product-trial";
import type { Category, Product } from "@/api/contracts";
import {
  Badge,
  Button,
  Card,
  Coin,
  EmptyState,
  Skeleton,
  Modal,
  Tag,
} from "@/components/ui";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { ProductPreview } from "@/components/shop/product-preview";
import { ShopProvider } from "@/components/shop/provider";
import { useShop } from "@/components/shop/use-shop";

const categories: Record<Category, string> = {
  KEYBOARD: "키보드",
  MONITOR: "모니터",
  DESK: "책상",
  ACCESSORY: "소품",
  BACKGROUND: "배경",
};

function ShopContent({
  userId,
  editing,
}: {
  userId: string;
  editing: boolean;
}) {
  const {
    products,
    wallet,
    inventory,
    users,
    purchase,
    equip,
    move,
  } = useShop(userId);
  const [tab, setTab] = useState(
    editing ? "보관함" : "상점",
  );
  const [category, setCategory] = useState<Category | null>(
    null,
  );
  const trialTrigger = useRef<HTMLButtonElement | null>(
    null,
  );
  const [trial, setTrial] = useState<Product | null>(null);
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
  const pending =
    purchase.isPending || equip.isPending || move.isPending;

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
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div
          aria-label="내 잔액"
          className="inline-flex items-center gap-3 rounded-2xl border border-sunny/60 bg-sunny/20 px-5 py-3"
        >
          <span className="text-xs font-bold text-muted">
            내 BugCoin
          </span>
          {wallet.data ? (
            <Coin amount={wallet.data.balance} />
          ) : (
            <span className="text-xs text-muted">
              잔액 불러오는 중
            </span>
          )}
        </div>
        {!editing && (
          <Link
            href={`/my?user=${userId}`}
            className="text-sm font-bold text-primary underline underline-offset-4"
          >
            내 데스크 꾸미기
          </Link>
        )}
      </div>
      {editing && (
        <section
          id="desk"
          aria-label="내 데스크 편집"
          className="mb-10 rounded-[2rem] border border-line bg-surface p-3"
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
          <DeskEditor
            key={JSON.stringify(
              inventory.data?.equipment ?? {},
            )}
            equipment={inventory.data?.equipment ?? {}}
            transforms={inventory.data?.transforms ?? {}}
            save={move.mutateAsync}
            disabled={pending || loading || Boolean(error)}
          />
          <p className="pb-3 text-center text-xs text-muted">
            보관함에서 상품을 장착하고 원하는 위치로
            옮겨보세요.
          </p>
        </section>
      )}
      <section id="collection" aria-label="상품 컬렉션">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div className="flex gap-2">
            {(editing
              ? ["보관함"]
              : ["상점", "보관함"]
            ).map((value) => (
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
              editing ? (
                <Link
                  href={`/shop?user=${userId}`}
                  className="text-primary underline"
                >
                  상점 보기
                </Link>
              ) : (
                <Button
                  onClick={() => {
                    setTab("상점");
                    setCategory(null);
                  }}
                >
                  상점 보기
                </Button>
              )
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
                    <ProductPreview
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
                    {!editing && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-4 w-full"
                        onClick={(event) => {
                          trialTrigger.current =
                            event.currentTarget;
                          setTrial(product);
                          setActionError(null);
                          setMessage("");
                        }}
                      >
                        장착해 보기
                      </Button>
                    )}
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
      {trial && (
        <Modal
          open
          size="room"
          onClose={() => {
            setTrial(null);
            requestAnimationFrame(() =>
              trialTrigger.current?.focus(),
            );
          }}
          title={`${trial.name} 장착해 보기`}
        >
          <ProductTrial
            product={trial}
            equipment={inventory.data?.equipment ?? {}}
            transforms={inventory.data?.transforms ?? {}}
            owned={owned.has(trial.productId)}
            pending={pending}
            buy={() => buy(trial.productId)}
            equip={equip.mutateAsync}
            move={move.mutateAsync}
          />
          {message && (
            <p role="status" className="mt-3">
              {message}
            </p>
          )}
          {actionError ? (
            <p role="alert" className="mt-3">
              {errorMessage(actionError)}
            </p>
          ) : null}
        </Modal>
      )}
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

export function ShopApp({
  editing = false,
  initialUser = "learner",
}: {
  editing?: boolean;
  initialUser?: string;
}) {
  const [userId, setUserId] = useState(initialUser);
  return (
    <ShopProvider>
      <Header
        preview={false}
        sections={[
          ["top", editing ? "내 공간" : "상점"],
          ...(editing
            ? ([["desk", "내 데스크"]] as [
                string,
                string,
              ][])
            : []),
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
              onChange={(event) => {
                setUserId(event.target.value);
                window.history.replaceState(
                  null,
                  "",
                  `${editing ? "/my" : "/shop"}?user=${event.target.value}`,
                );
              }}
              className="rounded-xl border border-line bg-surface px-3 py-2 text-foreground"
            >
              <option value="learner">학습자</option>
              <option value="author">타입 개발자</option>
              <option value="friend">웹 개발자</option>
            </select>
          </label>
        </div>
        <h1 className="mb-5 text-2xl">
          {editing ? "내 데스크" : "상점"}
        </h1>
        {editing && (
          <Link
            href={`/shop?user=${userId}`}
            className="mb-5 inline-block text-sm text-primary underline"
          >
            상점에서 상품 구경하기
          </Link>
        )}
        <ShopContent
          key={userId}
          userId={userId}
          editing={editing}
        />
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
