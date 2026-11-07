import { expect, test } from "@playwright/test";
import {
  productPoint,
  selectTrialProduct,
} from "./helpers/desk";

for (const width of [1100, 390]) {
  test(`Bugri sits on the tabletop through camera orbit and reload at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/my");
    const canvas = page.locator(
      '[data-renderer="canvas"] canvas',
    );
    await expect(canvas).toBeVisible();
    const bugri = await productPoint(
      canvas,
      [197, 237, 102],
    );
    const table = await productPoint(
      canvas,
      [240, 214, 181],
    );
    await page.mouse.move(bugri.x, bugri.y);
    await page.mouse.down();
    await page.mouse.move(table.x, table.y, { steps: 8 });
    await page.mouse.up();
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toContainText("Y 1.55");
    await expect(
      page.getByText("3D 배치를 저장했어요."),
    ).toBeVisible();
    const saved = await page
      .getByLabel("선택 상품 배치")
      .textContent();
    const publicPosition = await page
      .getByLabel("3D 배치 정보")
      .getByText(/^버그리:/)
      .textContent();
    const box = (await canvas.boundingBox())!;
    for (const dx of [90, 180, -90]) {
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(box.x + 10 + dx, box.y + 10, {
        steps: 8,
      });
      await page.mouse.up();
      await productPoint(canvas, [197, 237, 102]);
      await expect(
        page
          .getByLabel("3D 배치 정보")
          .getByText(/^버그리:/),
      ).toHaveText(publicPosition!);
    }
    await page.reload();
    await page
      .getByRole("button", {
        name: "버그리 선택",
        exact: true,
      })
      .click();
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toHaveText(saved!);
    await page.goto("/users/bugri-learner");
    await expect(
      page.getByLabel("3D 배치 정보").getByText(/^버그리:/),
    ).toHaveText(publicPosition!);
    await productPoint(canvas, [197, 237, 102]);
  });

  test(`trial tabletop drop respects a moved desk, zoom, reset and cancellation at ${width}px`, async ({
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
    const surface = await selectTrialProduct(
      dialog,
      "기본 데스크",
    );
    for (let i = 0; i < 5; i++)
      await surface.press("ArrowRight");
    await surface.press("Alt+ArrowRight");
    await surface.press("Enter");
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(
      box.x + box.width / 2,
      box.y + box.height / 2,
    );
    await page.mouse.wheel(0, -180);
    const bugri = await productPoint(
      canvas,
      [197, 237, 102],
    );
    const table = await productPoint(
      canvas,
      [240, 214, 181],
    );
    // Cancelled drags must not raise or save the mascot.
    await page.mouse.move(bugri.x, bugri.y);
    await page.mouse.down();
    await page.mouse.move(table.x, table.y, { steps: 8 });
    await canvas.dispatchEvent("pointercancel", {
      pointerId: 1,
    });
    await page.mouse.up();
    await expect(
      dialog.getByLabel("선택 상품 배치"),
    ).toHaveText("X -2.30 · Y 0.00 · Z 1.80 · 회전 0°");
    await page.mouse.move(bugri.x, bugri.y);
    await page.mouse.down();
    await page.mouse.move(table.x, table.y, { steps: 8 });
    await page.mouse.up();
    await expect(
      dialog.getByLabel("선택 상품 배치"),
    ).toContainText("Y 1.55");
    await dialog
      .getByRole("button", { name: "초기화", exact: true })
      .click();
    await selectTrialProduct(dialog, "버그리");
    await expect(
      dialog.getByLabel("선택 상품 배치"),
    ).toContainText("Y 0.00");
    await dialog
      .getByRole("button", { name: "닫기", exact: true })
      .click();
    await page.goto("/my");
    await page
      .getByRole("button", {
        name: "버그리 선택",
        exact: true,
      })
      .click();
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toHaveText("X -2.30 · Y 0.00 · Z 1.80 · 회전 0°");
  });
}
