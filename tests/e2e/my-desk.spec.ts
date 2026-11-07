import { selectSceneProduct } from "./helpers/desk";
import { rotateTo, rotationOf } from "./helpers/desk";
import { test, expect } from "@playwright/test";

test("shop, own desk and public desk work when WebGL is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl"))
        throw new Error("WebGL must not be requested");
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  const errors: string[] = [];
  page.on("pageerror", (error) =>
    errors.push(error.message),
  );
  await page.goto("/shop");
  await page
    .getByRole("article")
    .filter({
      has: page.getByRole("heading", {
        name: "새싹 키보드",
        exact: true,
      }),
    })
    .getByRole("button", { name: "장착해 보기" })
    .click();
  await expect(
    page.locator('[data-renderer="canvas"] canvas'),
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toHaveCount(0);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "닫기", exact: true })
    .click();
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
  await page.goto("/my/desk");
  await expect(page).toHaveURL(/\/my\/desk(?:\?|$)/);
  await selectSceneProduct(page, "새싹 키보드");
  await rotateTo(page, "새싹 키보드", 90);
  await page
    .getByRole("img", {
      name: "3D 데스크 캔버스",
      exact: true,
    })
    .press("Enter");
  await expect(
    page.getByText("3D 배치를 저장했어요."),
  ).toHaveCount(1);
  await page.reload();
  await selectSceneProduct(page, "새싹 키보드");
  await expect.poll(() => rotationOf(page)).toBe(90);
  await page.goto("/users/bugri-learner");
  await expect(
    page.locator('[data-renderer="canvas"] canvas'),
  ).toBeVisible();
  await expect(
    page.getByLabel("3D 배치 정보"),
  ).toContainText("회전 90°");
  await expect(
    page.getByRole("button", {
      name: "상품 이동",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.goto("/shop/zdog");
  await expect(page).toHaveURL(/\/my\/desk$/);
  expect(errors).toEqual([]);
});
