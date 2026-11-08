"use client";
import { localizeProduct } from "@/lib/shop/catalog";
import {
  useLocale,
  useTranslation,
} from "@/lib/i18n/use-translation";

import { Dropdown } from "@/components/ui/dropdown";
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
  Select,
  Tag,
  TextField,
} from "@/components/ui";
import { ShowcaseHeader } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { ProductPreview } from "@/components/shop/product-preview";
import { ShopProvider } from "@/components/shop/provider";
import { useShop } from "@/components/shop/use-shop";
import { pageTitle } from "@/components/ui/styles";

const categories: Record<Category, string> = {
  KEYBOARD: "키보드",
  MONITOR: "모니터",
  DESK: "책상",
  ACCESSORY: "소품",
  BACKGROUND: "배경",
};

const ProductSort = {
  DEFAULT: "DEFAULT",
  PRICE_ASC: "PRICE_ASC",
  PRICE_DESC: "PRICE_DESC",
  NAME: "NAME",
} as const;

type ProductSort =
  (typeof ProductSort)[keyof typeof ProductSort];

const sortOptions = [
  { value: ProductSort.DEFAULT, label: "기본순" },
  { value: ProductSort.PRICE_ASC, label: "가격 낮은순" },
  { value: ProductSort.PRICE_DESC, label: "가격 높은순" },
  { value: ProductSort.NAME, label: "이름순" },
] as const;

const userOptions = [
  { value: "learner", label: "학습자" },
  { value: "author", label: "타입 개발자" },
  { value: "friend", label: "웹 개발자" },
] as const;

function ShopContent({
  userId,
  editing,
}: {
  userId: string;
  editing: boolean;
}) {
  const t = useTranslation();
  const locale = useLocale();

  const {
    products,
    wallet,
    inventory,
    users,
    purchase,
    equip,
    move,
    moveBugri,
    moveDesk,
    reorder,
  } = useShop(userId);
  const currentUser = users.data?.find(
    (user) => user.userId === userId,
  );
  const [category, setCategory] = useState<Category | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProductSort>(
    ProductSort.DEFAULT,
  );
  const trialTrigger = useRef<HTMLButtonElement | null>(
    null,
  );
  const collectionHeading =
    useRef<HTMLHeadingElement | null>(null);
  const [trialProduct, setTrial] = useState<Product | null>(
    null,
  );
  const trial = trialProduct
    ? localizeProduct(trialProduct, locale)
    : null;
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
  const query = search.trim().toLocaleLowerCase(locale);
  const filtered =
    (editing ? inventory.data?.products : products.data)
      ?.map((product) => localizeProduct(product, locale))
      .filter(
        (product) =>
          (!category || product.category === category) &&
          (!query ||
            `${product.name} ${product.description}`
              .toLocaleLowerCase(locale)
              .includes(query)),
      ) ?? [];
  const visible =
    sort === ProductSort.DEFAULT
      ? filtered
      : [...filtered].sort((left, right) => {
          if (sort === ProductSort.PRICE_ASC)
            return left.price - right.price;
          if (sort === ProductSort.PRICE_DESC)
            return right.price - left.price;

          return left.name.localeCompare(
            right.name,
            locale,
          );
        });
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
      <div className="mb-7 flex min-w-0 items-center justify-between gap-4">
        <h1 className={`min-w-0 ${pageTitle}`}>
          {editing ? t("내 데스크") : t("상점")}
        </h1>
        <div aria-label={t("내 잔액")} className="shrink-0">
          {wallet.data ? (
            <Coin amount={wallet.data.balance} />
          ) : (
            <span className="text-xs text-muted">
              {t("잔액 불러오는 중")}
            </span>
          )}
        </div>
      </div>
      {editing && currentUser && (
        <Link
          href={`/users/${encodeURIComponent(currentUser.publicId)}?${new URLSearchParams({ user: userId })}`}
          className="mb-5 mr-5 inline-block rounded text-sm text-primary underline focus-visible:outline-2 focus-visible:outline-primary"
        >
          {t("내 공개 프로필 보기")}
        </Link>
      )}
      {editing && users.error && (
        <Button
          variant="ghost"
          onClick={() => void users.refetch()}
        >
          {t("공개 프로필 링크 다시 불러오기")}
        </Button>
      )}
      {editing && (
        <Link
          href={`/shop?user=${userId}`}
          className="mb-5 inline-block text-sm text-primary underline"
        >
          {t("상점에서 상품 구경하기")}
        </Link>
      )}
      {editing && (
        <section
          id="desk"
          aria-label={t("내 데스크 편집")}
          className="mb-10 rounded-[2rem] border border-line bg-surface p-3"
        >
          <div className="flex items-center justify-between px-4 pt-3">
            <h2 className="text-sm">{t("내 데스크")}</h2>
            <Badge>
              {
                Object.keys(inventory.data?.equipment ?? {})
                  .length
              }
              {t("개 장착")}
            </Badge>
          </div>
          <DeskEditor
            key={JSON.stringify(
              inventory.data?.equipment ?? {},
            )}
            equipment={inventory.data?.equipment ?? {}}
            transforms={inventory.data?.transforms ?? {}}
            save={move.mutateAsync}
            saveBugri={moveBugri.mutateAsync}
            saveDesk={moveDesk.mutateAsync}
            order={inventory.data?.order ?? []}
            saveOrder={reorder.mutateAsync}
            disabled={pending || loading || Boolean(error)}
          />
        </section>
      )}
      <section
        id="collection"
        aria-label={t("상품 컬렉션")}
      >
        <div className="flex flex-col gap-4 border-b border-line pb-4 lg:flex-row lg:items-end lg:justify-between">
          <h2
            ref={collectionHeading}
            tabIndex={-1}
            className="text-lg"
          >
            {editing ? t("보유 상품") : t("상품 목록")}
          </h2>
          {editing ? (
            <span className="text-xs text-muted">
              {visible.length}
              {t("개의 오브젝트")}
            </span>
          ) : (
            <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_180px] lg:w-[460px]">
              <TextField
                type="search"
                label={t("상품 검색")}
                placeholder={t("상품명 또는 설명 검색")}
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
              <Dropdown
                label={t("상품 정렬")}
                options={sortOptions.map((option) => ({
                  ...option,
                  label: t(option.label),
                }))}
                value={sort}
                onValueChange={(value) =>
                  setSort(value as ProductSort)
                }
              />
            </div>
          )}
        </div>
        <div
          className="my-5 flex flex-wrap gap-2"
          aria-label={t("상품 카테고리")}
        >
          <Tag
            selected={!category}
            onClick={() => setCategory(null)}
          >
            {t("전체")}
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
                {t(label)}
              </Tag>
            ),
          )}
        </div>
        <div
          role="status"
          className="mb-3 text-sm text-primary"
        >
          {t(message)}
        </div>
        {actionError ? (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-coral bg-coral/10 p-4 text-sm"
          >
            {t(errorMessage(actionError))}
          </p>
        ) : null}
        {loading ? (
          <Skeleton />
        ) : error ? (
          <div role="alert">
            <p>{t(errorMessage(error))}</p>
            <Button
              onClick={() => {
                void products.refetch();
                void wallet.refetch();
                void inventory.refetch();
              }}
            >
              {t("다시 시도")}
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title={
              editing
                ? t("아직 보관한 상품이 없어요")
                : query || category
                  ? t("검색 결과가 없어요")
                  : t("아직 상품이 없어요")
            }
            description={
              editing
                ? t(
                    "상점에서 마음에 드는 상품을 골라보세요.",
                  )
                : query || category
                  ? t(
                      "다른 검색어나 카테고리를 선택해 보세요.",
                    )
                  : t("상품이 등록되면 이곳에 표시됩니다.")
            }
            action={
              editing ? (
                <Link
                  href={`/shop?user=${userId}`}
                  className="text-primary underline"
                >
                  {t("상점 보기")}
                </Link>
              ) : (
                <Button
                  onClick={() => {
                    setCategory(null);
                    setSearch("");
                    setSort(ProductSort.DEFAULT);
                  }}
                >
                  {t("필터 초기화")}
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
                    <span className="absolute left-5 top-4 text-xs font-bold tracking-[.14em] text-muted">
                      {t(categories[category])}
                    </span>
                    <ProductPreview
                      productId={productId}
                      name={name}
                    />
                    {equipped && (
                      <span className="absolute right-4 top-3">
                        <Badge tone="success">
                          {t("장착 중")}
                        </Badge>
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg">{name}</h3>
                    <p className="mt-2 min-h-10 text-xs leading-5 text-muted">
                      {description}
                    </p>
                    <div
                      className={
                        editing
                          ? "mt-4 flex flex-wrap items-center justify-between gap-3"
                          : "mt-4 flex flex-col items-stretch gap-3"
                      }
                    >
                      <Coin amount={price} />
                      {!editing ? (
                        <div className="grid grid-cols-2 gap-2">
                          {!owned.has(productId) && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full"
                              onClick={(event) => {
                                trialTrigger.current =
                                  event.currentTarget;
                                setTrial(product);
                                setActionError(null);
                                setMessage("");
                              }}
                            >
                              {t("장착해 보기")}
                            </Button>
                          )}
                          <Button
                            className="col-start-2 w-full"
                            size="sm"
                            variant={
                              owned.has(productId)
                                ? "secondary"
                                : "primary"
                            }
                            disabled={
                              pending ||
                              owned.has(productId)
                            }
                            onClick={() =>
                              void buy(productId)
                            }
                          >
                            {owned.has(productId)
                              ? t("보유 중")
                              : t("구매하기")}
                          </Button>
                        </div>
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
                            ? t("장착 해제")
                            : t("장착하기")}
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
            requestAnimationFrame(() => {
              if (trialTrigger.current?.isConnected)
                trialTrigger.current.focus();
              else collectionHeading.current?.focus();
            });
          }}
          title={t("{0} 장착해 보기", { 0: trial.name })}
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
            order={inventory.data?.order ?? []}
            saveOrder={reorder.mutateAsync}
          />
          {message && (
            <p role="status" className="mt-3">
              {t(message)}
            </p>
          )}
          {actionError ? (
            <p role="alert" className="mt-3">
              {t(errorMessage(actionError))}
            </p>
          ) : null}
        </Modal>
      )}
    </>
  );
}

export function ShopApp({
  editing = false,
  embedded = false,
  initialUser = "learner",
}: {
  editing?: boolean;
  embedded?: boolean;
  initialUser?: string;
}) {
  const t = useTranslation();

  const [selectedUserId, setUserId] = useState(initialUser);
  const usesLayoutUser = embedded && !editing;
  const userId = usesLayoutUser
    ? initialUser
    : selectedUserId;
  const ContentContainer = embedded ? "div" : "main";
  return (
    <ShopProvider>
      {!embedded && (
        <ShowcaseHeader
          preview={false}
          sections={[
            ["top", editing ? t("내 공간") : t("상점")],
            ...(editing
              ? ([["desk", t("내 데스크")]] as [
                  string,
                  string,
                ][])
              : []),
            ["collection", t("컬렉션")],
          ]}
        />
      )}
      <ContentContainer
        id={embedded ? undefined : "top"}
        className={
          embedded
            ? undefined
            : "mx-auto max-w-[1220px] px-5 py-7 md:px-12"
        }
      >
        {!usesLayoutUser && (
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
            <Link href="/">{t("← Bugri 홈")}</Link>
            <Select
              layout="inline"
              label={t("더미 사용자")}
              options={userOptions}
              value={userId}
              onChange={(event) => {
                setUserId(event.target.value);
                window.history.replaceState(
                  null,
                  "",
                  `${editing ? "/my/desk" : "/shop"}?user=${event.target.value}`,
                );
              }}
            />
          </div>
        )}
        <ShopContent
          key={userId}
          userId={userId}
          editing={editing}
        />
      </ContentContainer>
      {!embedded && (
        <Footer
          note={t("Bugri objects · 작은 공간, 쌓이는 배움")}
        />
      )}
    </ShopProvider>
  );
}
