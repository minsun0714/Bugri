import { expect, test } from "@playwright/test";
import {
  productPoint,
  selectTrialProduct,
} from "./helpers/desk";

for (const width of [1100, 390]) {
  test(`room walls stay behind the desk and perspective placement works at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/shop?user=learner");
    const card = (name: string) =>
      page.getByRole("article").filter({
        has: page.getByRole("heading", {
          name,
          exact: true,
        }),
      });
    await card("달빛 작업실")
      .getByRole("button", { name: "장착해 보기" })
      .click();
    const dialog = page.getByRole("dialog");
    const canvas = dialog.locator("canvas");
    await expect(canvas).toBeVisible();
    const separation = () =>
      canvas.evaluate((element) => {
        const c = element as HTMLCanvasElement;
        const { data } = c
          .getContext("2d")!
          .getImageData(0, 0, c.width, c.height);
        let tabletop = c.height;
        let corner = -1;
        const rgb = (
          x: number,
          y: number,
          color: number[],
        ) =>
          color.every(
            (v, k) =>
              Math.abs(
                data[(y * c.width + x) * 4 + k] - v,
              ) <= 1,
          );
        for (let y = 0; y < c.height; y++) {
          for (let x = 0; x < c.width; x++) {
            if (rgb(x, y, [211, 195, 189]))
              tabletop = Math.min(tabletop, y);
          }
          if (
            rgb(
              Math.floor(c.width / 2),
              y,
              [65, 68, 101],
            ) ||
            rgb(Math.floor(c.width / 2), y, [53, 57, 84])
          )
            corner = y;
        }
        return { tabletop, corner };
      });
    await expect
      .poll(async () => {
        const { tabletop, corner } = await separation();
        return corner > 0 && tabletop > corner + 4;
      })
      .toBe(true);
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
      dialog.getByText("장착과 배치를 저장했어요."),
    ).toBeVisible();
    await dialog
      .getByRole("button", { name: "닫기", exact: true })
      .click();
    await card("새싹 키보드")
      .getByRole("button", { name: "장착해 보기" })
      .click();
    const controls = await selectTrialProduct(
      dialog,
      "새싹 키보드",
    );
    for (let i = 0; i < 30; i++)
      await controls.press("ArrowRight");
    for (let i = 0; i < 16; i++)
      await controls.press("Shift+ArrowDown");
    await controls.press("Enter");
    const item = await productPoint(
      canvas,
      [159, 181, 179],
    );
    const table = await productPoint(
      canvas,
      [211, 195, 189],
    );
    await page.mouse.move(item.x, item.y);
    await page.mouse.down();
    await page.mouse.move(table.x, table.y, { steps: 12 });
    await page.mouse.up();
    await expect(
      dialog.getByLabel("선택 상품 배치"),
    ).toContainText("Y 1.55");
  });
}
