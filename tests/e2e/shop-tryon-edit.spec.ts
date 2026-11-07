import { productPoint } from "./helpers/desk";
import { expect, test } from "@playwright/test";

for (const width of [1100, 390]) {
  test(`try-on uses the desk width and saves only explicitly applied placement at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/my");
    const ownCanvas = page.locator(
      '[data-renderer="canvas"] canvas',
    );
    await expect(ownCanvas).toBeVisible();
    const ownWidth = (await ownCanvas.boundingBox())!.width;
    await page.goto("/shop");
    const card = page.getByRole("article").filter({
      has: page.getByRole("heading", {
        name: "새싹 키보드",
        exact: true,
      }),
    });
    await card
      .getByRole("button", { name: "장착해 보기" })
      .click();
    const dialog = page.getByRole("dialog");
    const canvas = dialog.locator(
      '[data-renderer="canvas"] canvas',
    );
    await expect(canvas).toBeVisible();
    expect(
      Math.abs(
        (await canvas.boundingBox())!.width - ownWidth,
      ),
    ).toBeLessThanOrEqual(2);
    const point = await productPoint(canvas);
    await page.mouse.click(point.x, point.y);
    const position = dialog.getByLabel("선택 상품 배치");
    const initial = await position.textContent();
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x + 50, point.y + 20, {
      steps: 6,
    });
    await page.mouse.up();
    await expect(position).not.toHaveText(initial!);
    await dialog.getByLabel("아이템 회전").fill("90");
    const placed = await position.textContent();
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
      dialog.getByText("장착과 배치를 저장했어요.", {
        exact: true,
      }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await page.goto("/my");
    await page
      .getByRole("button", { name: "새싹 키보드 선택" })
      .click();
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toHaveText(placed!);
    await page.reload();
    await page
      .getByRole("button", { name: "새싹 키보드 선택" })
      .click();
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toHaveText(placed!);
    await page.goto("/shop");
    await card
      .getByRole("button", { name: "장착해 보기" })
      .click();
    await dialog
      .getByRole("button", { name: "새싹 키보드 선택" })
      .click();
    await dialog.getByLabel("아이템 회전").fill("180");
    await page.keyboard.press("Escape");
    await page.goto("/my");
    await page
      .getByRole("button", { name: "새싹 키보드 선택" })
      .click();
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toHaveText(placed!);
  });
}
