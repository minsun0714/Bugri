import { expect, test } from "@playwright/test";
import { productPoint } from "./helpers/desk";

for (const width of [1100, 390]) {
  test(`space follows horizontal drag at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/my", "/users/bugri-learner"]) {
      await page.goto(path);
      await page
        .getByRole("button", { name: "정면", exact: true })
        .click();
      const canvas = page.locator(
        '[data-renderer="canvas"] canvas',
      );
      const start = await productPoint(
        canvas,
        [197, 237, 102],
      );
      const box = (await canvas.boundingBox())!;
      const drag = async (dx: number) => {
        await page.mouse.move(box.x + 100, box.y + 10);
        await page.mouse.down();
        await page.mouse.move(
          box.x + 100 + dx,
          box.y + 10,
          { steps: 8 },
        );
        await page.mouse.up();
      };
      await drag(-40);
      expect(
        (await productPoint(canvas, [197, 237, 102])).x,
      ).toBeLessThan(start.x - 5);
      await expect(
        page.getByLabel("카메라 방위각"),
      ).toHaveText("20°");
      await drag(40);
      await expect(
        page.getByLabel("카메라 방위각"),
      ).toHaveText("0°");
      await drag(40);
      expect(
        (await productPoint(canvas, [197, 237, 102])).x,
      ).toBeGreaterThan(start.x + 5);
      await expect(
        page.getByLabel("카메라 높낮이 각도"),
      ).toHaveText("30°");
    }
    await page.goto("/shop");
    await page
      .getByRole("article")
      .filter({
        has: page.getByRole("heading", {
          name: "라벤더 키보드",
          exact: true,
        }),
      })
      .getByRole("button", { name: "장착해 보기" })
      .click();
    const dialog = page.getByRole("dialog");
    const canvas = dialog.locator("canvas");
    await expect(canvas).toBeVisible();
    const placement = await dialog
      .getByLabel("3D 배치 정보")
      .textContent();
    const box = (await canvas.boundingBox())!;
    for (const [dx, angle] of [
      [-40, "65°"],
      [40, "45°"],
    ] as const) {
      await page.mouse.move(box.x + 100, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(box.x + 100 + dx, box.y + 10, {
        steps: 8,
      });
      await page.mouse.up();
      await expect(
        dialog.getByLabel("카메라 방위각"),
      ).toHaveText(angle);
      await expect(
        dialog.getByLabel("카메라 높낮이 각도"),
      ).toHaveText("30°");
      await expect(
        dialog.getByLabel("3D 배치 정보"),
      ).toHaveText(placement!);
    }
  });
}
