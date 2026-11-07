import {
  expect,
  test,
  type Locator,
} from "@playwright/test";
import {
  productPoint,
  rotateTo,
  selectTrialProduct,
} from "./helpers/desk";

// Compare the silhouette bounds, not a median painted pixel whose position can
// change when antialiasing adds/removes a pixel after inverse rotations.
async function itemBounds(
  canvas: Locator,
  color: [number, number, number],
) {
  return canvas.evaluate((element, rgb) => {
    const surface = element as HTMLCanvasElement;
    const { width, height } = surface;
    const { data } = surface
      .getContext("2d")!
      .getImageData(0, 0, width, height);
    let left = width,
      top = height,
      right = -1,
      bottom = -1;
    for (let i = 0; i < data.length; i += 4) {
      if (
        !rgb.every(
          (value, channel) => data[i + channel] === value,
        ) ||
        data[i + 3] !== 255
      )
        continue;
      const x = (i / 4) % width;
      const y = Math.floor(i / 4 / width);
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
    if (right < 0)
      throw new Error("Item has no visible pixels");
    return [left, top, right, bottom];
  }, color);
}

for (const width of [1100, 390]) {
  test(`moving the trial desk leaves items and Bugri in place at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/shop");
    const card = (name: string) =>
      page.getByRole("article").filter({
        has: page.getByRole("heading", {
          name,
          exact: true,
        }),
      });
    await card("새싹 키보드")
      .getByRole("button", { name: "장착해 보기" })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("button", {
        name: "구매하기",
        exact: true,
      })
      .click();
    await dialog
      .getByRole("button", {
        name: "내 데스크에 장착",
        exact: true,
      })
      .click();
    await expect(
      dialog.getByText("장착과 배치를 저장했어요."),
    ).toBeVisible();
    await dialog
      .getByRole("button", { name: "닫기", exact: true })
      .click();
    await card("라벤더 키보드")
      .getByRole("button", { name: "장착해 보기" })
      .click();
    const canvas = dialog.locator("canvas");
    await expect(canvas).toBeVisible();
    const colors: [number, number, number][] = [
      [168, 195, 168],
      [201, 184, 227],
      [197, 237, 102],
    ];
    const before = [];
    for (const color of colors)
      before.push(await itemBounds(canvas, color));
    const table = await productPoint(
      canvas,
      [240, 214, 181],
    );
    await page.mouse.move(table.x, table.y);
    await page.mouse.down();
    await page.mouse.move(table.x + 25, table.y + 5, {
      steps: 8,
    });
    await expect(
      dialog.getByLabel("선택 상품", { exact: true }),
    ).toHaveText("기본 데스크");
    for (const [index, color] of colors.entries()) {
      const after = await itemBounds(canvas, color);
      for (const [edge, value] of after.entries())
        expect(
          Math.abs(value - before[index][edge]),
        ).toBeLessThanOrEqual(1);
    }
    await page.mouse.up();
    await selectTrialProduct(dialog, "기본 데스크");
    await rotateTo(dialog, "기본 데스크", 90);
    for (const [index, color] of colors.entries()) {
      const after = await itemBounds(canvas, color);
      for (const [edge, value] of after.entries())
        expect(
          Math.abs(value - before[index][edge]),
        ).toBeLessThanOrEqual(1);
    }
    await dialog
      .getByRole("button", { name: "초기화", exact: true })
      .click();
    await selectTrialProduct(dialog, "기본 데스크");
    await expect(
      dialog.getByLabel("선택 상품 배치"),
    ).toHaveText("X 0.00 · Y 0.00 · Z 0.00 · 회전 0°");
    await dialog
      .getByRole("button", { name: "닫기", exact: true })
      .click();
    await page.goto("/my");
    await page
      .getByRole("button", { name: "새싹 키보드 선택" })
      .click();
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toHaveText("X -0.45 · Y 1.55 · Z 0.65 · 회전 0°");
  });
}
