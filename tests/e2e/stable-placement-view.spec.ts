import {
  expect,
  test,
  type Locator,
} from "@playwright/test";
import {
  productPoint,
  selectSceneProduct,
} from "./helpers/desk";

async function deskBounds(canvas: Locator) {
  return canvas.evaluate((element) => {
    const c = element as HTMLCanvasElement;
    const { data } = c
      .getContext("2d")!
      .getImageData(0, 0, c.width, c.height);
    let left = c.width,
      right = -1,
      top = c.height,
      bottom = -1;
    for (let i = 0; i < data.length; i += 4) {
      // Stationary desk legs are not covered by objects placed on the top.
      if (
        data[i] !== 182 ||
        data[i + 1] !== 154 ||
        data[i + 2] !== 131 ||
        data[i + 3] !== 255
      )
        continue;
      const x = (i / 4) % c.width;
      const y = Math.floor(i / 4 / c.width);
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
    if (right < 0) throw new Error("Desk legs missing");
    return [left, top, right, bottom];
  });
}

for (const width of [1100, 390]) {
  test(`height changes and drops preserve the user's framing at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/shop");
    await page
      .getByRole("article")
      .filter({
        has: page.getByRole("heading", {
          name: "집중 모니터",
          exact: true,
        }),
      })
      .getByRole("button", { name: "장착해 보기" })
      .click();
    const dialog = page.getByRole("dialog");
    const canvas = dialog.locator("canvas");
    const surface = await selectSceneProduct(
      dialog,
      "집중 모니터",
    );
    const initial = await deskBounds(canvas);
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.wheel(0, -150);
    await expect
      .poll(
        async () =>
          (await deskBounds(canvas))[2] -
          (await deskBounds(canvas))[0],
      )
      .toBeGreaterThan((initial[2] - initial[0]) * 1.15);
    const framed = await deskBounds(canvas);
    const unchanged = async () => {
      await expect
        .poll(async () =>
          Math.max(
            ...(await deskBounds(canvas)).map(
              (value, index) =>
                Math.abs(value - framed[index]),
            ),
          ),
        )
        .toBeLessThanOrEqual(1);
    };
    for (let i = 0; i < 10; i++)
      await surface.press("Shift+ArrowUp");
    await expect(
      dialog.getByLabel("선택 상품 배치"),
    ).toContainText("Y 2.55");
    await unchanged();
    for (let i = 0; i < 30; i++)
      await surface.press("ArrowRight");
    for (let i = 0; i < 26; i++)
      await surface.press("Shift+ArrowDown");
    await surface.press("Enter");
    await expect(
      dialog.getByLabel("선택 상품 배치"),
    ).toContainText("Y 0.00");
    await unchanged();
    const monitor = await productPoint(
      canvas,
      [217, 209, 232],
    );
    const table = await productPoint(
      canvas,
      [240, 214, 181],
    );
    await page.mouse.move(monitor.x, monitor.y);
    await page.mouse.down();
    await page.mouse.move(table.x, table.y, { steps: 10 });
    await expect(
      dialog.getByLabel("선택 상품 배치"),
    ).toContainText("Y 1.55");
    await unchanged();
    await page.mouse.up();
    await unchanged();
    const placed = await productPoint(
      canvas,
      [217, 209, 232],
    );
    await page.mouse.move(placed.x, placed.y);
    await page.mouse.down();
    await page.mouse.move(placed.x + 60, placed.y - 90, {
      steps: 10,
    });
    await unchanged();
    await page.mouse.up();
    await unchanged();
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.wheel(0, 150);
    await expect
      .poll(
        async () =>
          (await deskBounds(canvas))[2] -
          (await deskBounds(canvas))[0],
      )
      .toBeLessThan((framed[2] - framed[0]) * 0.9);
    await dialog
      .getByRole("button", { name: "초기화", exact: true })
      .click();
    await expect
      .poll(() => deskBounds(canvas))
      .toEqual(initial);
  });
}
