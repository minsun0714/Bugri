import { expect, test, type Page } from "@playwright/test";

async function equipped(page: Page) {
  await page.goto("/shop");
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "새싹 키보드",
      exact: true,
    }),
  });
  await card
    .getByRole("button", { name: "구매하기" })
    .click();
  await page
    .getByRole("button", { name: "보관함", exact: true })
    .click();
  await page
    .getByRole("button", { name: "장착하기" })
    .click();
  await page
    .getByRole("link", {
      name: "내 데스크 꾸미기",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "새싹 키보드 선택" })
    .click();
  const canvas = page.locator(
    '#desk [data-renderer="canvas"] canvas',
  );
  await expect(canvas).toBeVisible();
  await canvas.scrollIntoViewIfNeeded();
  return canvas;
}

async function topProjection(page: Page) {
  await page
    .getByRole("button", { name: "위에서", exact: true })
    .click();
  const canvas = page.locator(
    '#desk [data-renderer="canvas"] canvas',
  );
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("3D canvas is not visible");
  // Editing acts on the explicitly selected item, anywhere on the canvas.
  return () => ({
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  });
}

test("Canvas camera orbit, surface drag, item rotation and public restoration", async ({
  page,
}) => {
  const canvas = await equipped(page);
  await page
    .getByRole("button", { name: "시점 회전", exact: true })
    .click();
  await page
    .getByRole("button", { name: "45도 시점", exact: true })
    .click();
  await expect(
    page.getByRole("main").getByLabel("카메라 방위각"),
  ).toHaveText("45°");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Missing canvas");
  await page.mouse.move(box.x + box.width / 2, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 60,
    box.y + 45,
    { steps: 5 },
  );
  await page.mouse.up();
  await expect(
    page.getByRole("main").getByLabel("카메라 방위각"),
  ).not.toHaveText("45°");
  await expect(
    page.getByLabel("선택 상품 배치"),
  ).toContainText("회전 0°");

  await page
    .getByRole("button", { name: "상품 이동", exact: true })
    .click();
  let project = await topProjection(page);
  const start = project();
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 30, start.y - 15, {
    steps: 5,
  });
  await page.mouse.up();
  await expect(
    page.getByText("3D 배치를 저장했어요."),
  ).toBeVisible();
  await expect(
    page.getByLabel("선택 상품 배치"),
  ).not.toContainText("X -0.45");
  const location = await page
    .getByLabel("선택 상품 배치")
    .innerText();
  expect(location).toContain("Y 1.55");

  await page
    .getByRole("button", { name: "상품 회전", exact: true })
    .click();
  project = await topProjection(page);
  const ring = project();
  const end = { x: ring.x + 60, y: ring.y };
  await page.mouse.move(ring.x, ring.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 10 });
  await page.mouse.up();
  await expect(
    page.getByRole("slider", { name: "아이템 회전" }),
  ).not.toHaveValue("0");
  await expect(
    page.getByText("3D 배치를 저장했어요."),
  ).toBeVisible();
  const rotation = await page
    .getByRole("slider", { name: "아이템 회전" })
    .inputValue();
  await page.reload();
  await page
    .getByRole("button", { name: "새싹 키보드 선택" })
    .click();
  await expect(
    page.getByRole("slider", { name: "아이템 회전" }),
  ).toHaveValue(rotation);
  await page.goto("/users/bugri-learner");
  const profile = page.getByRole("main");
  await expect(
    profile.locator('[data-renderer="canvas"] canvas'),
  ).toBeVisible();
  await expect(
    profile.getByLabel("3D 배치 정보"),
  ).toContainText(`회전 ${rotation}°`);
  await expect(
    profile.getByRole("button", {
      name: "상품 회전",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("touch moves on the tabletop, cancel restores, rotation slider saves on mobile", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  try {
    await equipped(page);
    const project = await topProjection(page);
    const point = project();
    const cdp = await context.newCDPSession(page);
    for (const end of [
      "touchCancel",
      "touchEnd",
    ] as const) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [point],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: point.x + 20, y: point.y - 10 }],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: end,
        touchPoints: [],
      });
      if (end === "touchCancel")
        await expect(
          page.getByLabel("선택 상품 배치"),
        ).toContainText("X -0.45");
    }
    await expect(
      page.getByText("3D 배치를 저장했어요."),
    ).toBeVisible();
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).not.toContainText("X -0.45");
    await page
      .getByRole("slider", { name: "아이템 회전" })
      .fill("45");
    await page
      .getByRole("button", {
        name: "배치 저장",
        exact: true,
      })
      .tap();
    await expect(
      page.getByText("3D 배치를 저장했어요."),
    ).toBeVisible();
    await page.reload();
    await page
      .getByRole("button", { name: "새싹 키보드 선택" })
      .tap();
    await expect(
      page.getByRole("slider", { name: "아이템 회전" }),
    ).toHaveValue("45");
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toContainText("Y 1.55");
  } finally {
    await context.close();
  }
});
