import { rotateTo, productPoint } from "./helpers/desk";
import {
  expect,
  test,
  type Locator,
} from "@playwright/test";

async function keyboardPixels(canvas: Locator) {
  return canvas.evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D unavailable");
    const { data } = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    );
    let count = 0;
    // Sage body belongs only to the equipped keyboard, never the desk.
    for (let i = 0; i < data.length; i += 4) {
      if (
        data[i] === 168 &&
        data[i + 1] === 195 &&
        data[i + 2] === 168 &&
        data[i + 3] === 255
      )
        count++;
    }
    return count;
  });
}

for (const width of [1100, 390]) {
  test(`keyboard remains painted while dragging across the tabletop at ${width}px`, async ({
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
    await page
      .getByRole("dialog")
      .getByRole("button", {
        name: "구매하기",
        exact: true,
      })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", {
        name: "내 데스크에 장착",
        exact: true,
      })
      .click();
    await expect(
      page
        .getByRole("dialog")
        .getByText("장착과 배치를 저장했어요.", {
          exact: true,
        }),
    ).toBeVisible();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "닫기", exact: true })
      .click();
    await page.goto("/my");
    await page
      .getByRole("button", {
        name: "새싹 키보드 선택",
        exact: true,
      })
      .click();
    const canvas = page
      .getByRole("main")
      .locator('[data-renderer="canvas"] canvas');
    await canvas.scrollIntoViewIfNeeded();
    await expect
      .poll(() => keyboardPixels(canvas))
      .toBeGreaterThan(50);
    const visibleBody = await keyboardPixels(canvas);
    const box = await canvas.boundingBox();
    if (!box) throw new Error("Canvas not visible");
    const center = await productPoint(canvas);
    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    // Start horizontally to choose surface placement, then keep that plane
    // while visiting corners (a vertical start now deliberately changes height).
    await page.mouse.move(center.x + 6, center.y, {
      steps: 3,
    });
    // Visit the same tabletop corners explicitly: free placement no longer clamps drags.
    const zoom = Math.min(
      box.width / 850,
      box.height / 570,
    );
    for (const [x, z] of [
      [-1.325, -0.94],
      [1.325, -0.94],
      [1.325, 0.94],
      [-1.325, 0.94],
    ]) {
      const dx =
        (x + 0.45 - (z - 0.65)) * Math.SQRT1_2 * zoom * 100;
      const dy =
        (x + 0.45 + (z - 0.65)) * Math.SQRT1_2 * zoom * 50;
      await page.mouse.move(center.x + dx, center.y + dy, {
        steps: 8,
      });
      await expect
        .poll(() => keyboardPixels(canvas))
        .toBeGreaterThan(visibleBody * 0.8);
      await expect(
        page.getByLabel("선택 상품 배치"),
      ).toContainText("Y 1.55");
    }
    await page.mouse.up();
    await expect(
      page.getByText("3D 배치를 저장했어요."),
    ).toBeVisible();
    await page.reload();
    await expect
      .poll(() => keyboardPixels(canvas))
      .toBeGreaterThan(50);
    for (const name of ["정면", "위에서", "45도 시점"]) {
      await page
        .getByRole("button", { name, exact: true })
        .click();
      await expect
        .poll(() => keyboardPixels(canvas))
        .toBeGreaterThan(50);
    }
    await page
      .getByRole("button", {
        name: "새싹 키보드 선택",
        exact: true,
      })
      .click();
    await rotateTo(page, "새싹 키보드", 90);
    await page
      .getByRole("button", {
        name: "배치 저장",
        exact: true,
      })
      .click();
    await expect(
      page.getByText("3D 배치를 저장했어요."),
    ).toBeVisible();
    await canvas.scrollIntoViewIfNeeded();
    const orbitBox = await canvas.boundingBox();
    if (!orbitBox) throw new Error("Canvas not visible");
    for (let quarter = 0; quarter < 4; quarter++) {
      const x = orbitBox.x + 25;
      const y = orbitBox.y + 25;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 180, y, { steps: 8 });
      await page.mouse.up();
      await expect
        .poll(() => keyboardPixels(canvas))
        .toBeGreaterThan(50);
    }
    await page.goto("/users/bugri-learner");
    await expect
      .poll(() => keyboardPixels(canvas))
      .toBeGreaterThan(50);
  });
}
