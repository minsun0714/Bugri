import { rotateTo, productPoint } from "./helpers/desk";
import { expect, test } from "@playwright/test";

test("lavender keyboard can leave the table, rotate, save and remain visible", async ({
  page,
}) => {
  await page.goto("/shop");
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "라벤더 키보드",
      exact: true,
    }),
  });
  await card
    .getByRole("button", { name: "장착해 보기" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "구매하기", exact: true })
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
      name: "라벤더 키보드 선택",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "위에서", exact: true })
    .click();
  const canvas = page
    .getByRole("main")
    .locator('[data-renderer="canvas"] canvas');
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas missing");
  const { x, y } = await productPoint(
    canvas,
    [201, 184, 227],
  );
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 300, y, { steps: 12 });
  await page.mouse.up();
  await expect(
    page.getByText("3D 배치를 저장했어요."),
  ).toBeVisible();
  const placement = page.getByLabel("선택 상품 배치");
  await expect
    .poll(async () => {
      const value = await placement.innerText();
      return Number(value.match(/X (-?[\d.]+)/)![1]);
    })
    .toBeGreaterThan(2);
  await expect(placement).toContainText("Y 1.55");
  await rotateTo(page, "라벤더 키보드", 90);
  await page
    .getByRole("button", { name: "배치 저장", exact: true })
    .click();
  await expect(
    page.getByText("3D 배치를 저장했어요."),
  ).toBeVisible();
  await expect(placement).toContainText("회전 90°");
  const saved = await placement.innerText();
  await page.reload();
  await page
    .getByRole("button", {
      name: "라벤더 키보드 선택",
      exact: true,
    })
    .click();
  await expect(placement).toHaveText(saved);
  await expect
    .poll(() =>
      canvas.evaluate((element) => {
        const c = element as HTMLCanvasElement;
        const context = c.getContext("2d");
        if (!context) throw new Error("No Canvas context");
        const { data } = context.getImageData(
          0,
          0,
          c.width,
          c.height,
        );
        let pixels = 0;
        for (let i = 0; i < data.length; i += 4)
          if (
            data[i] === 201 &&
            data[i + 1] === 184 &&
            data[i + 2] === 227
          )
            pixels++;
        return pixels;
      }),
    )
    .toBeGreaterThan(50);
  await page.goto("/users/bugri-learner");
  await expect(
    page.getByLabel("3D 배치 정보"),
  ).toContainText(`X ${saved.match(/X (-?[\d.]+)/)![1]}`);
  await expect(
    page.getByLabel("3D 배치 정보"),
  ).toContainText("회전 90°");
});
