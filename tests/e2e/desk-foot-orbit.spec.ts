import { expect, test } from "@playwright/test";
import {
  productPoint,
  selectSceneProduct,
} from "./helpers/desk";

for (const width of [1100, 390]) {
  test(`trial foot placement follows the table while dragging and orbiting at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
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
    const grab = await productPoint(
      canvas,
      [197, 237, 102],
    );
    const points = await canvas.evaluate((element) => {
      const c = element as HTMLCanvasElement;
      const { data } = c
        .getContext("2d")!
        .getImageData(0, 0, c.width, c.height);
      const mascot: { x: number; y: number }[] = [];
      const table: { x: number; y: number }[] = [];
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 255) continue;
        const point = {
          x: (i / 4) % c.width,
          y: Math.floor(i / 4 / c.width),
        };
        if (
          data[i] === 197 &&
          data[i + 1] === 237 &&
          data[i + 2] === 102
        )
          mascot.push(point);
        if (
          data[i] === 240 &&
          data[i + 1] === 214 &&
          data[i + 2] === 181
        )
          table.push(point);
      }
      const bottom = mascot[mascot.length - 1].y;
      const feet = mascot.filter(
        ({ y }) => y >= bottom - 1,
      );
      const foot = {
        x:
          feet.reduce((sum, { x }) => sum + x, 0) /
          feet.length,
        y: bottom,
      };
      const target = table[Math.floor(table.length * 0.12)];
      const box = c.getBoundingClientRect();
      const client = ({
        x,
        y,
      }: {
        x: number;
        y: number;
      }) => ({
        x: box.x + (x / c.width) * box.width,
        y: box.y + (y / c.height) * box.height,
      });
      return { foot: client(foot), target: client(target) };
    });
    await page.mouse.move(grab.x, grab.y);
    await page.mouse.down();
    await page.mouse.move(
      grab.x + points.target.x - points.foot.x,
      grab.y + points.target.y - points.foot.y,
      { steps: 12 },
    );
    // The live preview must already sit on the surface, before release.
    await expect(
      dialog.getByLabel("선택 상품 배치"),
    ).toContainText("Y 1.55");
    await page.mouse.up();
    const saved = await dialog
      .getByLabel("선택 상품 배치")
      .textContent();
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + 10, box.y + 60);
    await page.mouse.down();
    await page.mouse.move(box.x + 130, box.y + 160, {
      steps: 12,
    });
    await page.mouse.up();
    await selectSceneProduct(dialog, "버그리");
    await expect(
      dialog.getByLabel("선택 상품 배치"),
    ).toHaveText(saved!);
    await productPoint(canvas, [197, 237, 102]);
    await dialog
      .getByRole("button", { name: "초기화", exact: true })
      .click();
    await selectSceneProduct(dialog, "버그리");
    await expect(
      dialog.getByLabel("선택 상품 배치"),
    ).toHaveText("X -2.30 · Y 0.00 · Z 1.80 · 회전 0°");
  });

  test(`vertical background dragging reaches below and above the desk at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
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
    const before = await canvas.evaluate((element) =>
      (element as HTMLCanvasElement).toDataURL(),
    );
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + 10, box.y + 290);
    await page.mouse.down();
    await page.mouse.move(box.x + 10, box.y + 10, {
      steps: 12,
    });
    await page.mouse.up();
    // This colour belongs only to the underside of the tabletop.
    await productPoint(canvas, [173, 146, 125]);
    await expect(
      dialog.getByLabel("카메라 높낮이 각도"),
    ).toHaveText("-54°");
    await expect(
      dialog.getByLabel("카메라 방위각"),
    ).toHaveText("45°");
    for (let i = 0; i < 2; i++) {
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(box.x + 10, box.y + 290, {
        steps: 12,
      });
      await page.mouse.up();
    }
    await productPoint(canvas, [240, 214, 181]);
    await expect(
      dialog.getByLabel("카메라 높낮이 각도"),
    ).toHaveText("85°");
    expect(
      await canvas.evaluate((element) =>
        (element as HTMLCanvasElement).toDataURL(),
      ),
    ).not.toBe(before);
    await expect(
      dialog.getByLabel("카메라 방위각"),
    ).toHaveText("45°");
    await dialog
      .getByRole("button", { name: "초기화", exact: true })
      .click();
    await expect
      .poll(() =>
        canvas.evaluate((element) =>
          (element as HTMLCanvasElement).toDataURL(),
        ),
      )
      .toBe(before);
  });
}
