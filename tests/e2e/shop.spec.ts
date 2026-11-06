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
  await page
    .getByRole("button", { name: "보관함", exact: true })
    .click();
  await page
    .getByRole("button", { name: "장착하기" })
    .click();
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
  await page
    .getByRole("button", { name: "보관함", exact: true })
    .click();
  await expect(
    page.getByText("아직 보관한 상품이 없어요"),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "학습자의 데스크 ↗" })
    .click();
  await expect(
    page.getByRole("img", {
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
    page.getByRole("img", {
      name: "타입 개발자의 데스크 · 기본 데스크",
      exact: true,
    }),
  ).toBeVisible();
});

test("dragged equipment persists after reload and is shown at the same position publicly", async ({
  page,
}) => {
  await page.goto("/shop");
  const keyboard = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "새싹 키보드",
      exact: true,
    }),
  });
  await keyboard
    .getByRole("button", { name: "구매하기" })
    .click();
  await page
    .getByRole("button", { name: "보관함", exact: true })
    .click();
  await page
    .getByRole("button", { name: "장착하기" })
    .click();
  const item = page.getByRole("button", {
    name: "새싹 키보드 이동",
  });
  await expect(item).toHaveAttribute(
    "transform",
    "translate(0 0)",
  );
  await expect(item).toBeEnabled();
  await item.scrollIntoViewIfNeeded();
  const box = await item.boundingBox();
  if (!box)
    throw new Error("Keyboard has no visible bounds");
  await page.mouse.move(
    box.x + box.width / 2,
    box.y + box.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 40,
    box.y + box.height / 2 - 20,
    { steps: 5 },
  );
  await page.mouse.up();
  await expect(
    page.getByText("배치를 저장했어요."),
  ).toBeVisible();
  await expect(item).not.toHaveAttribute(
    "transform",
    "translate(0 0)",
  );
  const position = await item.getAttribute("transform");
  await page.reload();
  await expect(item).toHaveAttribute(
    "transform",
    position!,
  );
  await page
    .getByLabel("더미 사용자")
    .selectOption("friend");
  await expect(
    page.getByRole("group", {
      name: "내 데스크 · 기본 데스크",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "학습자의 데스크 ↗" })
    .click();
  const publicDesk = page.getByRole("img", {
    name: "학습자의 데스크 · 새싹 키보드",
    exact: true,
  });
  await expect(
    publicDesk.locator('[data-product-id="keyboard-1"]'),
  ).toHaveAttribute("transform", position!);
  await expect(
    page.getByRole("button", { name: "새싹 키보드 이동" }),
  ).toHaveCount(0);
});

test("touch drag saves on a narrow screen and touch cancellation restores the last position", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/shop`);
    const keyboard = page.getByRole("article").filter({
      has: page.getByRole("heading", {
        name: "새싹 키보드",
        exact: true,
      }),
    });
    await keyboard
      .getByRole("button", { name: "구매하기" })
      .tap();
    await page
      .getByRole("button", { name: "보관함", exact: true })
      .tap();
    await page
      .getByRole("button", { name: "장착하기" })
      .tap();
    const item = page.getByRole("button", {
      name: "새싹 키보드 이동",
    });
    await item.scrollIntoViewIfNeeded();
    await expect(item).toBeEnabled();
    await item.scrollIntoViewIfNeeded();
    const box = await item.boundingBox();
    if (!box)
      throw new Error("Keyboard has no visible bounds");
    const cdp = await context.newCDPSession(page);
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x + 25, y: y - 15 }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchCancel",
      touchPoints: [],
    });
    await expect(item).toHaveAttribute(
      "transform",
      "translate(0 0)",
    );
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x + 25, y: y - 15 }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(
      page.getByText("배치를 저장했어요."),
    ).toBeVisible();
    await expect(item).not.toHaveAttribute(
      "transform",
      "translate(0 0)",
    );
    const position = await item.getAttribute("transform");
    await page.reload();
    await expect(item).toHaveAttribute(
      "transform",
      position!,
    );
  } finally {
    await context.close();
  }
});
