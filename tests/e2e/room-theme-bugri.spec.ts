import { expect, test } from "@playwright/test";
import {
  productPoint,
  selectSceneProduct,
} from "./helpers/desk";

for (const width of [1100, 390]) {
  test(`Bugri moves independently, persists and stays temporary in trials at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/my/desk");
    const canvas = page.locator(
      '[data-renderer="canvas"] canvas',
    );
    await expect(canvas).toBeVisible();
    const point = await productPoint(
      canvas,
      [197, 237, 102],
    );
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x + 30, point.y + 10, {
      steps: 8,
    });
    await page.mouse.up();
    await expect(
      page.getByText("3D 배치를 저장했어요."),
    ).toHaveCount(1);
    const saved = await page
      .getByLabel("선택 상품 배치")
      .textContent();
    expect(saved).not.toBe(
      "X -2.30 · Y 0.00 · Z 1.80 · 회전 0°",
    );
    await page.reload();
    await selectSceneProduct(page, "버그리");
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toHaveText(saved!);
    const publicPosition = await page
      .getByLabel("3D 배치 정보")
      .getByText(/^버그리:/)
      .textContent();
    await page.goto("/users/bugri-learner");
    await expect(
      page.getByLabel("3D 배치 정보").getByText(/^버그리:/),
    ).toHaveText(publicPosition!);
    await expect(
      page.getByRole("button", { name: "버그리 선택" }),
    ).toHaveCount(0);
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
    const surface = await selectSceneProduct(
      dialog,
      "버그리",
    );
    await expect(
      dialog.getByLabel("선택 상품 배치"),
    ).toHaveText(saved!);
    await surface.press("ArrowRight");
    await surface.press("Enter");
    await expect(
      dialog.getByLabel("선택 상품 배치"),
    ).not.toHaveText(saved!);
    await dialog
      .getByRole("button", { name: "초기화", exact: true })
      .click();
    await selectSceneProduct(dialog, "버그리");
    await expect(
      dialog.getByLabel("선택 상품 배치"),
    ).toHaveText(saved!);
    await surface.press("ArrowRight");
    await surface.press("Enter");
    await dialog
      .getByRole("button", { name: "닫기", exact: true })
      .click();
    await page.goto("/my/desk");
    await selectSceneProduct(page, "버그리");
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toHaveText(saved!);
    await expect(page.getByLabel("내 잔액")).toContainText(
      "100",
    );
  });

  test(`room themes fill the space, survive orbit and persist after equipping at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/my/desk");
    const surface = page.getByRole("img", {
      name: "3D 데스크 캔버스",
      exact: true,
    });
    const backdrop = () =>
      surface.evaluate(
        (element) =>
          getComputedStyle(element).backgroundImage,
      );
    await expect(surface).toBeVisible();
    const original = await backdrop();
    let previous = original;
    await page.goto("/shop");
    for (const name of ["정원", "달빛 작업실"]) {
      await page
        .getByRole("article")
        .filter({
          has: page.getByRole("heading", {
            name,
            exact: true,
          }),
        })
        .getByRole("button", { name: "장착해 보기" })
        .click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.locator("canvas")).toBeVisible();
      const themed = await backdrop();
      expect(themed).not.toBe(original);
      expect(themed).not.toBe(previous);
      previous = themed;
      const box = (await dialog
        .locator("canvas")
        .boundingBox())!;
      await page.mouse.move(box.x + 15, box.y + 15);
      await page.mouse.down();
      await page.mouse.move(box.x + 70, box.y + 15, {
        steps: 8,
      });
      await page.mouse.up();
      await expect(
        dialog.getByLabel("카메라 방위각"),
      ).not.toHaveText("45°");
      expect(await backdrop()).toBe(themed);
      const controls = await selectSceneProduct(
        dialog,
        "버그리",
      );
      await controls.press("ArrowRight");
      await controls.press("Enter");
      await expect(
        dialog.getByLabel("선택 상품 배치"),
      ).toContainText("X -2.20");
      if (name === "달빛 작업실") {
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
      }
      await dialog
        .getByRole("button", { name: "닫기", exact: true })
        .click();
    }
    await page.goto("/my/desk");
    await expect(surface).toBeVisible();
    await expect.poll(backdrop).toBe(previous);
    await page.reload();
    await expect(surface).toBeVisible();
    await expect.poll(backdrop).toBe(previous);
    await selectSceneProduct(page, "버그리");
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toContainText("X -2.30");
    await page.goto("/users/bugri-learner");
    await expect(surface).toBeVisible();
    await expect.poll(backdrop).toBe(previous);
  });
}
