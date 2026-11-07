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

for (const width of [1100, 390]) {
  test(`zoom still works over controls after manipulating an item at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/shop");
    await page
      .getByRole("article")
      .filter({
        has: page.getByRole("heading", {
          name: "새싹 키보드",
          exact: true,
        }),
      })
      .getByRole("button", { name: "장착해 보기" })
      .click();
    const dialog = page.getByRole("dialog");
    await selectTrialProduct(dialog, "새싹 키보드");
    const rotation = dialog.getByRole("button", {
      name: "선택 상품 회전",
      exact: true,
    });
    const handle = (await rotation.boundingBox())!;
    await page.mouse.move(handle.x + 14, handle.y + 14);
    await page.mouse.down();
    await page.mouse.move(handle.x + 54, handle.y + 14, {
      steps: 8,
    });
    await page.mouse.up();
    const position = dialog.getByLabel("선택 상품 배치");
    await expect(position).toContainText("회전 336°");
    const saved = await position.textContent();
    const frameWidth = async () =>
      (await dialog
        .getByLabel("선택 테두리")
        .boundingBox())!.width;
    const original = await frameWidth();
    const scroll = await dialog.evaluate(
      (element) => element.scrollTop,
    );
    await rotation.hover();
    await page.mouse.wheel(0, -250);
    await expect
      .poll(frameWidth)
      .toBeGreaterThan(original * 1.2);
    await expect(position).toHaveText(saved!);
    expect(
      await dialog.evaluate((element) => element.scrollTop),
    ).toBe(scroll);
    await dialog
      .getByRole("button", {
        name: "선택 아이템 메뉴",
        exact: true,
      })
      .click();
    await dialog.getByRole("menuitem").first().hover();
    const enlarged = await frameWidth();
    await page.mouse.wheel(0, 250);
    await expect
      .poll(frameWidth)
      .toBeLessThan(enlarged * 0.85);
    // Chromium emits wheel events with ctrlKey for trackpad pinch gestures.
    await dialog
      .getByRole("menuitem")
      .first()
      .dispatchEvent("wheel", {
        deltaY: -250,
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
    await expect
      .poll(frameWidth)
      .toBeGreaterThan(original * 1.2);
    await expect(position).toHaveText(saved!);
    expect(
      await dialog.evaluate((element) => element.scrollTop),
    ).toBe(scroll);
    await page.keyboard.press("Escape");
    const outsideCancelled = await dialog
      .getByRole("button", { name: "초기화", exact: true })
      .evaluate((element) => {
        const event = new WheelEvent("wheel", {
          deltaY: 100,
          bubbles: true,
          cancelable: true,
        });
        element.dispatchEvent(event);
        return event.defaultPrevented;
      });
    expect(outsideCancelled).toBe(false);
    await dialog
      .getByRole("button", { name: "초기화", exact: true })
      .click();
    await selectTrialProduct(dialog, "새싹 키보드");
    await expect(position).toContainText("회전 0°");
  });
}
