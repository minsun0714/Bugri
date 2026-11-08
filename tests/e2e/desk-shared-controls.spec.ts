import {
  expect,
  test,
  type Locator,
} from "@playwright/test";
import { selectSceneProduct } from "./helpers/desk";

async function bugriBounds(canvas: Locator) {
  return canvas.evaluate((element) => {
    const c = element as HTMLCanvasElement;
    const { data } = c
      .getContext("2d")!
      .getImageData(0, 0, c.width, c.height);
    let minX = c.width,
      maxX = 0,
      minY = c.height,
      maxY = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (
        data[i] !== 197 ||
        data[i + 1] !== 237 ||
        data[i + 2] !== 102 ||
        data[i + 3] !== 255
      )
        continue;
      const x = (i / 4) % c.width,
        y = Math.floor(i / 4 / c.width);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  });
}

for (const width of [1280, 390]) {
  test(`own desk shares direct controls and independent placement at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/my/desk");
    const canvas = page.locator(
      '[data-renderer="canvas"] canvas',
    );
    await expect(canvas).toBeVisible();
    for (const name of [
      "버그리 선택",
      "바닥에 놓기",
      "책상 위에 놓기",
      "배치 저장",
    ])
      await expect(
        page.getByRole("button", { name, exact: true }),
      ).toHaveCount(0);
    await expect(
      page.getByLabel("아이템 높이"),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "보유 상품" }),
    ).toBeVisible();
    await canvas.scrollIntoViewIfNeeded();
    const before = await bugriBounds(canvas);
    expect(before.width).toBeGreaterThan(10);
    const surface = await selectSceneProduct(
      page,
      "기본 데스크",
    );
    for (let i = 0; i < 10; i++)
      await surface.press("ArrowRight");
    await surface.press("Alt+ArrowRight");
    await surface.press("Enter");
    await expect(
      page.getByText("3D 배치를 저장했어요."),
    ).toHaveCount(1);
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toContainText("X 1.00");
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toContainText("회전 15°");
    const after = await bugriBounds(canvas);
    expect(
      Math.abs(after.x - before.x),
    ).toBeLessThanOrEqual(2);
    expect(
      Math.abs(after.y - before.y),
    ).toBeLessThanOrEqual(2);
    await canvas.hover();
    await page.mouse.wheel(0, -350);
    await expect
      .poll(async () => (await bugriBounds(canvas)).width)
      .toBeGreaterThan(after.width);
    await selectSceneProduct(page, "버그리");
    const saved = await page
      .getByLabel("3D 배치 정보")
      .textContent();
    await page.reload();
    await selectSceneProduct(page, "기본 데스크");
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toContainText("X 1.00");
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toContainText("회전 15°");
    await page.goto("/users/bugri-learner");
    await expect(
      page.getByLabel("3D 배치 정보"),
    ).toHaveText(saved!);
  });
}
