import { expect, test } from "@playwright/test";

for (const width of [1100, 390]) {
  test(`shop title and balance share one row at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/shop");
    const title = page.getByRole("heading", {
      name: "상점",
      level: 1,
    });
    const balance = page.getByLabel("내 잔액");
    const titleBox = (await title.boundingBox())!;
    const balanceBox = (await balance.boundingBox())!;

    expect(balanceBox.x).toBeGreaterThan(titleBox.x);
    expect(
      Math.abs(
        titleBox.y +
          titleBox.height / 2 -
          (balanceBox.y + balanceBox.height / 2),
      ),
    ).toBeLessThan(4);
    await expect(page.getByText("내 BugCoin")).toHaveCount(
      0,
    );
  });
}

test("keeps the desk editor available without a shop entry link", async ({
  page,
}) => {
  await page.goto("/shop");

  await expect(
    page.getByRole("link", { name: "내 데스크 꾸미기" }),
  ).toHaveCount(0);

  await page.goto("/my/desk");

  await expect(
    page.getByRole("region", { name: "내 데스크 편집" }),
  ).toBeVisible();
});

test("mobile search and price sorting narrow the catalog without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shop");

  await page.getByLabel("상품 검색").fill("모니터");
  await expect(page.getByRole("article")).toHaveCount(2);
  const sorting = page.getByRole("combobox", {
    name: "상품 정렬",
  });
  await sorting.click();
  await page
    .getByRole("option", { name: "가격 높은순" })
    .click();
  await expect(sorting).toBeFocused();
  await sorting.press("Home");
  await sorting.press("ArrowDown");
  await sorting.press("Enter");
  await expect(
    page
      .getByRole("article")
      .getByRole("heading", { level: 3 }),
  ).toHaveText(["집중 모니터", "미드나잇 모니터"]);
  await sorting.press("Enter");
  await sorting.press("ArrowDown");
  await sorting.press("Enter");
  await expect(sorting).toHaveText("가격 높은순");
  await sorting.press("Enter");
  await sorting.press("Escape");
  await expect(
    page.getByRole("listbox", { name: "상품 정렬" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("article").getByRole("heading", {
      level: 3,
    }),
  ).toHaveText(["미드나잇 모니터", "집중 모니터"]);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        window.innerWidth,
    ),
  ).toBe(true);
});

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
  await page.goto("/my/desk");
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

for (const width of [1280, 390]) {
  test(`shop uses header account switching at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/shop?user=learner");
    await expect(
      page.getByRole("link", { name: "← Bugri 홈" }),
    ).toHaveCount(0);
    await expect(
      page.getByLabel("더미 사용자"),
    ).toHaveCount(0);
    const card = page.getByRole("article").filter({
      has: page.getByRole("heading", {
        name: "새싹 키보드",
        exact: true,
      }),
    });
    await card
      .getByRole("button", {
        name: "구매하기",
        exact: true,
      })
      .click();
    await expect(page.getByLabel("내 잔액")).toContainText(
      "70",
    );
    await expect(
      page.getByRole("button", { name: /^데모:/ }),
    ).toHaveCount(0);
    const profile = page.getByRole("button", {
      name: "내 프로필",
    });
    await profile.click();
    await page
      .getByRole("button", {
        name: "데모 사용자 전환",
        exact: true,
      })
      .click();
    await page
      .getByRole("dialog", { name: "데모 사용자 선택" })
      .press("Escape");
    await expect(profile).toBeFocused();
    await profile.press("Enter");
    await page
      .getByRole("button", {
        name: "데모 사용자 전환",
        exact: true,
      })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "데모 사용자 선택",
    });
    await dialog
      .getByRole("combobox", { name: "더미 사용자" })
      .click();
    await dialog
      .getByRole("option", { name: "친구", exact: true })
      .click();
    await dialog
      .getByRole("button", { name: "선택한 사용자로 시작" })
      .click();
    await expect(page).toHaveURL(/user=friend/);
    await expect(page.getByLabel("내 잔액")).toContainText(
      "100",
    );
    await expect(
      card.getByRole("button", {
        name: "구매하기",
        exact: true,
      }),
    ).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("내 잔액")).toContainText(
      "100",
    );
    await page.goBack();
    await expect(page).toHaveURL(/user=learner/);
    await expect(page.getByLabel("내 잔액")).toContainText(
      "70",
    );
    await expect(
      card.getByRole("button", {
        name: "보유 중",
        exact: true,
      }),
    ).toBeDisabled();
    await page
      .getByRole("link", { name: "Bugri 홈", exact: true })
      .click();
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === "/" &&
        url.searchParams.get("user") === "learner",
    );
  });
}
