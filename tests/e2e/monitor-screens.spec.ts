import { expect, test } from "@playwright/test";
import {
  rotateTo,
  selectSceneProduct,
} from "./helpers/desk";

test("distinct monitor screen artwork stays on the front face", async ({
  page,
}) => {
  await page.goto("/shop");
  await page
    .getByRole("button", { name: "모니터", exact: true })
    .click();
  for (const [name, color] of [
    ["집중 모니터", [130, 170, 137]],
    ["미드나잇 모니터", [139, 213, 190]],
  ] as const) {
    const card = page.getByRole("article").filter({
      has: page.getByRole("heading", {
        name,
        exact: true,
      }),
    });
    await card
      .getByRole("button", { name: "장착해 보기" })
      .click();
    const dialog = page.getByRole("dialog");
    const canvas = dialog.locator("canvas");
    async function screenPixels() {
      return canvas.evaluate((element, rgb) => {
        const surface = element as HTMLCanvasElement;
        const { width, height } = surface;
        const context = surface.getContext("2d")!;
        const { data } = context.getImageData(
          0,
          0,
          width,
          height,
        );
        let count = 0;
        for (let i = 0; i < data.length; i += 4)
          if (
            data[i] === rgb[0] &&
            data[i + 1] === rgb[1] &&
            data[i + 2] === rgb[2] &&
            data[i + 3] === 255
          )
            count++;
        return count;
      }, color);
    }
    await expect.poll(screenPixels).toBeGreaterThan(10);
    await selectSceneProduct(dialog, name);
    await rotateTo(dialog, name, 180);
    await expect.poll(screenPixels).toBe(0);
    await rotateTo(dialog, name, 0);
    await expect.poll(screenPixels).toBeGreaterThan(10);
    await dialog
      .getByRole("button", { name: "닫기", exact: true })
      .click();
  }
});
