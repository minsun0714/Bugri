import { expect, test } from "@playwright/test";
import {
  productPoint,
  selectTrialProduct,
} from "./helpers/desk";

for (const width of [1100, 390]) {
  for (const pitch of [0, 30]) {
    for (const { name, product, color } of [
      {
        name: "새싹 키보드",
        product: "새싹 키보드",
        color: [168, 195, 168],
      },
      {
        name: "집중 모니터",
        product: "집중 모니터",
        color: [41, 36, 61],
      },
      {
        name: "화분",
        product: "화분",
        color: [217, 180, 154],
      },
      {
        name: "버그리",
        product: "라벤더 키보드",
        color: [197, 237, 102],
      },
    ]) {
      test(`front drag lowers ${name} without changing depth at ${width}px and ${pitch} degrees`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto("/shop");
        await page
          .getByRole("article")
          .filter({
            has: page.getByRole("heading", {
              name: product,
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
        if (pitch === 0) {
          await page.mouse.move(box.x + 10, box.y + 120);
          await page.mouse.down();
          await page.mouse.move(box.x + 100, box.y + 20, {
            steps: 10,
          });
          await page.mouse.up();
          await expect(
            dialog.getByLabel("카메라 높낮이 각도"),
          ).toHaveText("0°");
        }
        await selectTrialProduct(dialog, name);
        if (name === "버그리") {
          const surface = await selectTrialProduct(
            dialog,
            name,
          );
          for (let i = 0; i < 15; i++)
            await surface.press("Shift+ArrowUp");
          await surface.press("Enter");
        }
        const placement =
          dialog.getByLabel("선택 상품 배치");
        const initial = (await placement.textContent())!;
        const point = await productPoint(
          canvas,
          color as [number, number, number],
        );
        await page.mouse.move(point.x, point.y);
        await page.mouse.down();
        await page.mouse.move(point.x, point.y + 30, {
          steps: 10,
        });
        const lowered = (await placement.textContent())!;
        expect(
          Number(lowered.match(/Y ([\d.]+)/)![1]),
        ).toBeLessThan(
          Number(initial.match(/Y ([\d.]+)/)![1]),
        );
        expect(lowered.match(/X ([\d.-]+)/)![1]).toBe(
          initial.match(/X ([\d.-]+)/)![1],
        );
        expect(lowered.match(/Z ([\d.-]+)/)![1]).toBe(
          initial.match(/Z ([\d.-]+)/)![1],
        );
        await page.mouse.move(point.x, point.y + 190, {
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
        await selectTrialProduct(dialog, name);
        await expect(placement).toHaveText(floor);
      });
    }
  }
}
