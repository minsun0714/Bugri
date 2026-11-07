import { expect, test } from "@playwright/test";
import {
  productPoint,
  selectTrialProduct,
} from "./helpers/desk";

for (const width of [1100, 390]) {
  test(`front drag lowers items without changing depth at ${width}px`, async ({
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
    const canvas = dialog.locator("canvas");
    await expect(canvas).toBeVisible();
    await canvas.scrollIntoViewIfNeeded();
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + 10, box.y + 120);
    await page.mouse.down();
    await page.mouse.move(box.x + 100, box.y + 20, {
      steps: 10,
    });
    await page.mouse.up();
    await expect(
      dialog.getByLabel("카메라 높낮이 각도"),
    ).toContainText("0");
    await selectTrialProduct(dialog, "새싹 키보드");
    const placement = dialog.getByLabel("선택 상품 배치");
    const initial = (await placement.textContent())!;
    const point = await productPoint(canvas);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x, point.y + 30, {
      steps: 10,
    });
    const lowered = (await placement.textContent())!;
    expect(
      Number(lowered.match(/Y ([\d.]+)/)![1]),
    ).toBeLessThan(1.55);
    expect(lowered.match(/X ([\d.-]+)/)![1]).toBe(
      initial.match(/X ([\d.-]+)/)![1],
    );
    expect(lowered.match(/Z ([\d.-]+)/)![1]).toBe(
      initial.match(/Z ([\d.-]+)/)![1],
    );
    await page.mouse.up();
    await expect(placement).toHaveText(lowered);
    const next = await productPoint(canvas);
    await page.mouse.move(next.x, next.y);
    await page.mouse.down();
    await page.mouse.move(next.x, next.y + 160, {
      steps: 10,
    });
    await page.mouse.up();
    await expect(placement).toContainText("Y 0.00");
    expect(
      (await placement.textContent())!.match(
        /Z ([\d.-]+)/,
      )![1],
    ).toBe(initial.match(/Z ([\d.-]+)/)![1]);
    const floor = (await placement.textContent())!;
    await page.mouse.move(box.x + 10, box.y + 50);
    await page.mouse.down();
    await page.mouse.move(box.x + 60, box.y + 150, {
      steps: 10,
    });
    await page.mouse.up();
    await selectTrialProduct(dialog, "새싹 키보드");
    await expect(placement).toHaveText(floor);
  });
}
