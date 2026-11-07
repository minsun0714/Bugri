import { expect, test } from "@playwright/test";
import {
  productPoint,
  selectTrialProduct,
} from "./helpers/desk";

const products: {
  name: string;
  color: [number, number, number];
}[] = [
  { name: "집중 모니터", color: [217, 209, 232] },
  { name: "새싹 키보드", color: [168, 195, 168] },
  { name: "화분", color: [217, 180, 154] },
];

for (const width of [1100, 390]) {
  for (const { name, color } of products) {
    test(`${name} snaps its base in preview and survives orbit at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/shop");
      const card = (title: string) =>
        page.getByRole("article").filter({
          has: page.getByRole("heading", {
            name: title,
            exact: true,
          }),
        });
      await card(name)
        .getByRole("button", { name: "장착해 보기" })
        .click();
      const dialog = page.getByRole("dialog");
      const canvas = dialog.locator("canvas");
      const lowerOutside = async () => {
        const surface = await selectTrialProduct(
          dialog,
          name,
        );
        for (let i = 0; i < 30; i++)
          await surface.press("ArrowRight");
        for (let i = 0; i < 16; i++)
          await surface.press("Shift+ArrowDown");
        await surface.press("Enter");
        await expect(
          dialog.getByLabel("선택 상품 배치"),
        ).toContainText("Y 0.00");
      };
      const dragToTable = async () => {
        const item = await productPoint(canvas, color);
        const table = await productPoint(
          canvas,
          [240, 214, 181],
        );
        await page.mouse.move(item.x, item.y);
        await page.mouse.down();
        await page.mouse.move(table.x, table.y, {
          steps: 12,
        });
        await expect(
          dialog.getByLabel("선택 상품 배치"),
        ).toContainText("Y 1.55");
      };
      await lowerOutside();
      const floor = await dialog
        .getByLabel("선택 상품 배치")
        .textContent();
      await dragToTable();
      await canvas.dispatchEvent("pointercancel", {
        pointerId: 1,
      });
      await page.mouse.up();
      await expect(
        dialog.getByLabel("선택 상품 배치"),
      ).toHaveText(floor!);
      await dragToTable();
      await page.mouse.up();
      const placed = await dialog
        .getByLabel("선택 상품 배치")
        .textContent();
      const box = (await canvas.boundingBox())!;
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(box.x + 130, box.y + 110, {
        steps: 12,
      });
      await page.mouse.up();
      await selectTrialProduct(dialog, name);
      await expect(
        dialog.getByLabel("선택 상품 배치"),
      ).toHaveText(placed!);
      await expect(
        dialog.getByLabel("선택 테두리"),
      ).toBeVisible();
      if (name === "집중 모니터") {
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
          .getByRole("button", {
            name: "닫기",
            exact: true,
          })
          .click();
        await card("라벤더 키보드")
          .getByRole("button", { name: "장착해 보기" })
          .click();
        await lowerOutside();
        await dragToTable();
        await page.mouse.up();
        await dialog
          .getByRole("button", {
            name: "닫기",
            exact: true,
          })
          .click();
        await page.goto("/my");
        await page
          .getByRole("button", {
            name: `${name} 선택`,
            exact: true,
          })
          .click();
        await expect(
          page.getByLabel("선택 상품 배치"),
        ).toHaveText(placed!);
        await page.reload();
        await page
          .getByRole("button", {
            name: `${name} 선택`,
            exact: true,
          })
          .click();
        await expect(
          page.getByLabel("선택 상품 배치"),
        ).toHaveText(placed!);
      } else {
        await dialog
          .getByRole("button", {
            name: "초기화",
            exact: true,
          })
          .click();
        await selectTrialProduct(dialog, name);
        await expect(
          dialog.getByLabel("선택 상품 배치"),
        ).not.toHaveText(placed!);
        await dialog
          .getByRole("button", {
            name: "닫기",
            exact: true,
          })
          .click();
        await page.goto("/my");
        await expect(
          page.getByLabel("3D 배치 정보"),
        ).not.toContainText(name);
      }
    });
  }
}
