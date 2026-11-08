import {
  expect,
  test,
  type Locator,
} from "@playwright/test";
import {
  productPoint,
  selectSceneProduct,
} from "./helpers/desk";

async function pixels(
  canvas: Locator,
  color: [number, number, number],
) {
  return canvas.evaluate((element, rgb) => {
    const c = element as HTMLCanvasElement;
    const context = c.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    const { data } = context.getImageData(
      0,
      0,
      c.width,
      c.height,
    );
    let count = 0;
    for (let i = 0; i < data.length; i += 4)
      if (
        rgb.every(
          (value, index) => data[i + index] === value,
        )
      )
        count++;
    return count;
  }, color);
}

for (const width of [1100, 390]) {
  test(`new desk and keyboard are added without replacing the current space at ${width}px`, async ({
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
    await page
      .getByRole("dialog")
      .getByRole("button", {
        name: "구매하기",
        exact: true,
      })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("button", {
        name: "내 데스크에 장착",
        exact: true,
      })
      .click();
    await expect(
      dialog.getByText("장착과 배치를 저장했어요."),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    for (const [name, color] of [
      ["크림 스튜디오 책상", [238, 232, 245]],
      ["라벤더 키보드", [201, 184, 227]],
    ] as const) {
      await card(name)
        .getByRole("button", { name: "장착해 보기" })
        .click();
      const canvas = dialog.locator(
        '[data-renderer="canvas"] canvas',
      );
      await expect(canvas).toBeVisible();
      await expect
        .poll(() => pixels(canvas, [240, 214, 181]))
        .toBeGreaterThan(50);
      await expect
        .poll(() => pixels(canvas, [168, 195, 168]))
        .toBeGreaterThan(10);
      await expect
        .poll(() => pixels(canvas, [...color]))
        .toBeGreaterThan(50);
      const original = dialog
        .getByLabel("3D 배치 정보")
        .getByText(/새싹 키보드:/);
      const before = await original.textContent();
      const point = await productPoint(canvas, [...color]);
      await page.mouse.move(point.x, point.y);
      await page.mouse.down();
      await page.mouse.move(point.x + 35, point.y + 10, {
        steps: 8,
      });
      await page.mouse.up();
      await expect(
        dialog.getByLabel("선택 테두리"),
      ).toBeVisible();
      await expect(original).toHaveText(before!);
      await expect
        .poll(() => pixels(canvas, [240, 214, 181]))
        .toBeGreaterThan(50);
      await expect
        .poll(() => pixels(canvas, [168, 195, 168]))
        .toBeGreaterThan(10);
      const addedPosition = await dialog
        .getByLabel("선택 상품 배치")
        .textContent();
      const existingPoint = await productPoint(
        canvas,
        [168, 195, 168],
      );
      await page.mouse.move(
        existingPoint.x,
        existingPoint.y,
      );
      await page.mouse.down();
      await page.mouse.move(
        existingPoint.x - 35,
        existingPoint.y + 15,
        { steps: 8 },
      );
      await page.mouse.up();
      await expect(original).not.toHaveText(before!);
      await selectSceneProduct(dialog, name);
      await expect(
        dialog.getByLabel("선택 상품 배치"),
      ).toHaveText(addedPosition!);
      await dialog
        .getByRole("button", { name: "닫기", exact: true })
        .click();
      await card(name)
        .getByRole("button", { name: "장착해 보기" })
        .click();
      await expect(original).toHaveText(before!);
      await expect(
        dialog.getByRole("button", { name: /선택$/ }),
      ).toHaveCount(0);
      const surface = await selectSceneProduct(
        dialog,
        name,
      );
      const resetPosition = await dialog
        .getByLabel("선택 상품 배치")
        .textContent();
      await surface.press("ArrowRight");
      await surface.press("Enter");
      await selectSceneProduct(dialog, "새싹 키보드");
      await surface.press("Alt+ArrowRight");
      await surface.press("Enter");
      await expect(original).not.toHaveText(before!);
      await dialog
        .getByRole("button", {
          name: "초기화",
          exact: true,
        })
        .click();
      await expect(original).toHaveText(before!);
      await selectSceneProduct(dialog, name);
      await expect(
        dialog.getByLabel("선택 상품 배치"),
      ).toHaveText(resetPosition!);
      await dialog
        .getByRole("button", { name: "닫기", exact: true })
        .click();
    }
    await page.goto("/my/desk");
    await expect(
      page.getByRole("group", {
        name: "내 데스크 · 새싹 키보드",
        exact: true,
      }),
    ).toBeVisible();
    await selectSceneProduct(page, "새싹 키보드");
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toContainText("X -0.45 · Y 1.55 · Z 0.65 · 회전 0°");
    await expect(page.getByLabel("내 잔액")).toContainText(
      "70",
    );
  });
}
