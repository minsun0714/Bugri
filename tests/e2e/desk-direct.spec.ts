import { selectSceneProduct } from "./helpers/desk";
import { expect, test } from "@playwright/test";
import { productPoint, rotationOf } from "./helpers/desk";

for (const width of [1100, 390]) {
  test(`click product to move and rotate using contextual controls at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/shop");
    const card = page.getByRole("article").filter({
      has: page.getByRole("heading", {
        name: "새싹 키보드",
        exact: true,
      }),
    });
    await card
      .getByRole("button", { name: "장착해 보기" })
      .click();
    const dialog = page.getByRole("dialog");
    for (const name of [
      "상품 이동",
      "상품 회전",
      "시점 회전",
    ])
      await expect(
        dialog.getByRole("button", { name, exact: true }),
      ).toHaveCount(0);
    await expect(
      dialog.getByLabel("선택 테두리"),
    ).toHaveCount(0);
    const canvas = dialog.locator(
      '[data-renderer="canvas"] canvas',
    );
    await expect(canvas).toBeVisible();
    const point = await productPoint(canvas);
    await page.mouse.click(point.x, point.y);
    await expect(
      dialog.getByLabel("선택 테두리"),
    ).toBeVisible();
    const position = dialog.getByLabel("선택 상품 배치");
    await expect(
      dialog.getByRole("slider", { name: "아이템 회전" }),
    ).toHaveCount(0);
    const initial = await position.textContent();
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x + 45, point.y + 15, {
      steps: 8,
    });
    await page.mouse.up();
    await expect(position).not.toHaveText(initial!);
    const handle = dialog.getByRole("button", {
      name: "선택 상품 회전",
      exact: true,
    });
    await expect(
      dialog.getByRole("button", {
        name: "선택 상품 높이",
        exact: true,
      }),
    ).toHaveCount(0);
    const box = (await handle.boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(28);
    expect(box.height).toBeLessThanOrEqual(28);
    await page.mouse.move(
      box.x + box.width / 2,
      box.y + box.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + 60,
      box.y + box.height / 2,
      { steps: 8 },
    );
    await expect.poll(() => rotationOf(dialog)).toBe(324);
    await page.mouse.up();
    await expect.poll(() => rotationOf(dialog)).toBe(324);
    const movedHandle = (await handle.boundingBox())!;
    const handleX = movedHandle.x + movedHandle.width / 2;
    const handleY = movedHandle.y + movedHandle.height / 2;
    await page.mouse.move(handleX, handleY);
    await page.mouse.down();
    await page.mouse.move(handleX - 30, handleY, {
      steps: 8,
    });
    await expect.poll(() => rotationOf(dialog)).toBe(342);
    await page.mouse.up();
    await expect.poll(() => rotationOf(dialog)).toBe(342);
    const rotation = await rotationOf(dialog);
    await handle.focus();
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => rotationOf(dialog))
      .toBe((rotation + 15) % 360);
    await handle.click();
    await expect
      .poll(() => rotationOf(dialog))
      .toBe((rotation + 15) % 360);
    const placed = await position.textContent();
    const previewRoom = (await canvas.boundingBox())!;
    await page.mouse.click(
      previewRoom.x + 20,
      previewRoom.y + 20,
    );
    await expect(
      dialog.getByLabel("선택 테두리"),
    ).toHaveCount(0);
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
    await page.keyboard.press("Escape");
    await page.goto("/my/desk");
    await selectSceneProduct(page, "새싹 키보드");
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toHaveText(placed!);
    const ownCanvas = page.locator(
      '[data-renderer="canvas"] canvas',
    );
    await ownCanvas.scrollIntoViewIfNeeded();
    const room = (await ownCanvas.boundingBox())!;
    await page.mouse.move(room.x + 25, room.y + 25);
    await page.mouse.down();
    await page.mouse.move(room.x + 85, room.y + 25, {
      steps: 8,
    });
    await page.mouse.up();
    await expect(
      page.getByLabel("카메라 방위각"),
    ).not.toHaveText("45°");
    await expect(
      page.getByLabel("선택 테두리"),
    ).toHaveCount(0);
    await selectSceneProduct(page, "새싹 키보드");
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toHaveText(placed!);
    await page.goto("/users/bugri-learner");
    await expect(
      page.getByRole("button", {
        name: "선택 상품 회전",
        exact: true,
      }),
    ).toHaveCount(0);
  });
}
