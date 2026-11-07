import { test, expect } from "@playwright/test";

test("Canvas prototype rotates and moves without WebGL", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl"))
        throw new Error("WebGL forbidden");
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/shop/zdog");
  const canvas = page.getByLabel("입체 데스크 시제품");
  await expect(canvas).toHaveAttribute(
    "data-ready",
    "true",
  );
  const front = await canvas.screenshot();
  await page
    .getByRole("button", { name: "뒷면", exact: true })
    .click();
  expect((await canvas.screenshot()).equals(front)).toBe(
    false,
  );
  await page
    .getByRole("button", { name: "45도", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "키보드 이동",
      exact: true,
    })
    .click();
  await page.getByLabel("상품 회전").fill("90");
  await expect(
    page.getByLabel("선택 상품 배치"),
  ).toContainText("90°");
  const before = await page
    .getByLabel("선택 상품 배치")
    .textContent();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("canvas missing");
  await page.mouse.move(
    box.x + box.width / 2,
    box.y + box.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 35,
    box.y + box.height / 2 + 15,
    { steps: 6 },
  );
  await page.mouse.up();
  await expect(
    page.getByLabel("선택 상품 배치"),
  ).not.toHaveText(before!);
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await page
    .getByRole("button", { name: "처음으로" })
    .click();
  await expect(page.getByLabel("상품 회전")).toHaveValue(
    "0",
  );
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toHaveCount(0);
});

test("mobile touch moves and cancellation restores the draft", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("/shop/zdog");
  const canvas = page.getByLabel("입체 데스크 시제품");
  await expect(canvas).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page
    .getByRole("button", {
      name: "모니터 이동",
      exact: true,
    })
    .tap();
  const before = await page
    .getByLabel("선택 상품 배치")
    .textContent();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("canvas missing");
  const cdp = await context.newCDPSession(page);
  const point = {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: point.x + 30, y: point.y + 10 }],
  });
  await expect(
    page.getByLabel("선택 상품 배치"),
  ).not.toHaveText(before!);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchCancel",
    touchPoints: [],
  });
  await expect(
    page.getByLabel("선택 상품 배치"),
  ).toHaveText(before!);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});
