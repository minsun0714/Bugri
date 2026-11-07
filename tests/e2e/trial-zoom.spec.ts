import { expect, test } from "@playwright/test";
import {
  productPoint,
  selectTrialProduct,
} from "./helpers/desk";

for (const width of [1100, 390]) {
  test(`wheel zoom is bounded and reset restores trial framing at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/shop");
    const card = page
      .getByRole("article")
      .filter({
        has: page.getByRole("heading", {
          name: "새싹 키보드",
          exact: true,
        }),
      });
    await card
      .getByRole("button", { name: "장착해 보기" })
      .click();
    const dialog = page.getByRole("dialog");
    await selectTrialProduct(dialog, "새싹 키보드");
    const canvas = dialog.locator("canvas");
    const frame = dialog.getByLabel("선택 테두리");
    const frameWidth = async () =>
      (await frame.boundingBox())!.width;
    await expect(frame).toBeVisible();
    const originalWidth = await frameWidth();
    const position = dialog.getByLabel("선택 상품 배치");
    const originalPosition = await position.textContent();
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(
      box.x + box.width / 2,
      box.y + box.height / 2,
    );
    const scroll = await page.evaluate(
      () => window.scrollY,
    );
    await page.mouse.wheel(0, -250);
    await expect
      .poll(frameWidth)
      .toBeGreaterThan(originalWidth * 1.2);
    await expect(position).toHaveText(originalPosition!);
    expect(await page.evaluate(() => window.scrollY)).toBe(
      scroll,
    );
    const point = await productPoint(canvas);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x + 15, point.y + 5, {
      steps: 8,
    });
    await page.mouse.up();
    await expect(position).not.toHaveText(
      originalPosition!,
    );
    await page.mouse.move(
      box.x + box.width / 2,
      box.y + box.height / 2,
    );
    await page.mouse.wheel(0, -10000);
    await expect
      .poll(frameWidth)
      .toBeGreaterThan(originalWidth * 1.8);
    const maximum = await frameWidth();
    await page.mouse.wheel(0, -10000);
    await expect.poll(frameWidth).toBe(maximum);
    await page.mouse.wheel(0, 10000);
    await expect
      .poll(frameWidth)
      .toBeLessThan(originalWidth * 0.8);
    const minimum = await frameWidth();
    await page.mouse.wheel(0, 10000);
    await expect.poll(frameWidth).toBe(minimum);
    await dialog
      .getByRole("button", { name: "초기화", exact: true })
      .click();
    await selectTrialProduct(dialog, "새싹 키보드");
    await expect.poll(frameWidth).toBe(originalWidth);
    await expect(position).toHaveText(originalPosition!);
    await dialog
      .getByRole("button", { name: "닫기", exact: true })
      .click();
    await card
      .getByRole("button", { name: "장착해 보기" })
      .click();
    await selectTrialProduct(dialog, "새싹 키보드");
    await expect.poll(frameWidth).toBe(originalWidth);
    await expect(page.getByLabel("내 잔액")).toContainText(
      "100",
    );
  });
}
