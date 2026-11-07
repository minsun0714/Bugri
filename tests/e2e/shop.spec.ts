import { expect, test } from "@playwright/test";

test("purchase, equip, restore, switch users and view a public desk", async ({
  page,
}) => {
  await page.goto("/shop");
  await expect(
    page.getByRole("heading", { name: "새싹 키보드" }),
  ).toBeVisible();
  const keyboard = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "새싹 키보드",
    }),
  });
  await keyboard
    .getByRole("button", { name: "구매하기" })
    .click();
  await expect(page.getByLabel("내 잔액")).toContainText(
    "70",
  );
  await expect(
    keyboard.getByRole("button", { name: "보유 중" }),
  ).toBeDisabled();
  await expect(
    keyboard.getByRole("button", { name: "장착해 보기" }),
  ).toHaveCount(0);
  await page
    .getByRole("link", {
      name: "내 데스크 꾸미기",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "장착하기", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "장착 해제",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", {
      name: "내 데스크 · 새싹 키보드",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("group", {
      name: "내 데스크 · 새싹 키보드",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByLabel("더미 사용자")
    .selectOption("friend");
  await expect(page.getByLabel("내 잔액")).toContainText(
    "100",
  );

  await expect(
    page.getByText("아직 보관한 상품이 없어요"),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "학습자의 데스크 ↗" })
    .click();
  await expect(
    page.getByRole("group", {
      name: "학습자의 데스크 · 새싹 키보드",
      exact: true,
    }),
  ).toBeVisible();
  const profile = page.getByRole("main");

  await expect(profile.getByLabel("내 잔액")).toHaveCount(
    0,
  );
  await expect(page.getByLabel("내 잔액")).toBeHidden();
  await expect(
    profile.getByRole("button", { name: "장착 해제" }),
  ).toHaveCount(0);
});

test("mobile categories, insufficient balance and empty public desk", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shop");
  await page
    .getByRole("button", { name: "책상", exact: true })
    .click();
  const desk = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "원목 책상",
      exact: true,
    }),
  });
  await desk
    .getByRole("button", { name: "구매하기" })
    .click();
  await expect(
    page
      .getByRole("region", { name: "상품 컬렉션" })
      .getByRole("alert"),
  ).toContainText("BugCoin이 부족해요");
  await expect(page.getByLabel("내 잔액")).toContainText(
    "100",
  );
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/users/bugri-author");
  await expect(
    page.getByRole("group", {
      name: "타입 개발자의 데스크 · 기본 데스크",
      exact: true,
    }),
  ).toBeVisible();
});
