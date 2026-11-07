import { selectSceneProduct } from "./helpers/desk";
import { orbitTo } from "./helpers/desk";
import {
  expect,
  test,
  type Locator,
} from "@playwright/test";

async function visibleKeyboard(canvas: Locator) {
  return canvas.evaluate((element) => {
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
        data[i] === 168 &&
        data[i + 1] === 195 &&
        data[i + 2] === 168
      )
        pixels++;
    return pixels;
  });
}

test("height adjustment persists and the tabletop occludes a lowered keyboard", async ({
  page,
}) => {
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
  await selectSceneProduct(page, "새싹 키보드");
  const canvas = page
    .getByRole("main")
    .locator('[data-renderer="canvas"] canvas');
  for (let i = 0; i < 16; i++)
    await page
      .getByRole("img", {
        name: "3D 데스크 캔버스",
        exact: true,
      })
      .press("Shift+ArrowDown");
  await page
    .getByRole("img", {
      name: "3D 데스크 캔버스",
      exact: true,
    })
    .press("Enter");
  await expect(
    page.getByLabel("선택 상품 배치"),
  ).toContainText("Y 0.00");
  await expect
    .poll(() => visibleKeyboard(canvas))
    .toBeGreaterThan(50);
  await orbitTo(page, "위에서");
  await expect.poll(() => visibleKeyboard(canvas)).toBe(0);
  // Hidden selected objects retain bounds so their layer menu can bring them forward.
  await expect(
    page.getByLabel("선택 테두리"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "선택 상품 회전",
      exact: true,
    }),
  ).toBeVisible();
  for (let i = 0; i < 16; i++)
    await page
      .getByRole("img", {
        name: "3D 데스크 캔버스",
        exact: true,
      })
      .press("Shift+ArrowUp");
  await expect(
    page.getByLabel("선택 상품 배치"),
  ).toContainText("Y 1.60");
  await expect
    .poll(() => visibleKeyboard(canvas))
    .toBeGreaterThan(50);
  await orbitTo(page, "45도 시점");
  await expect(
    page.getByRole("button", {
      name: "선택 상품 높이",
      exact: true,
    }),
  ).toHaveCount(0);
  for (let i = 0; i < 9; i++)
    await page
      .getByRole("img", {
        name: "3D 데스크 캔버스",
        exact: true,
      })
      .press("Shift+ArrowDown");
  await page
    .getByRole("img", {
      name: "3D 데스크 캔버스",
      exact: true,
    })
    .press("Enter");
  await expect(
    page.getByText("3D 배치를 저장했어요."),
  ).toHaveCount(1);
  const placement = page.getByLabel("선택 상품 배치");
  await expect
    .poll(async () =>
      Number(
        (await placement.innerText()).match(
          /Y ([\d.]+)/,
        )![1],
      ),
    )
    .toBeLessThan(1.55);
  const saved = await placement.innerText();
  const height = Number(saved.match(/Y ([\d.]+)/)![1]);
  expect(height).toBeGreaterThan(0);
  expect(saved).toContain("X -0.45");
  expect(saved).toContain("Z 0.65");
  await page.reload();
  await selectSceneProduct(page, "새싹 키보드");
  await expect(placement).toHaveText(saved);
  await page.goto("/users/bugri-learner");
  await expect(
    page.getByLabel("3D 배치 정보"),
  ).toContainText(`높이 ${height.toFixed(2)}`);
  await expect(
    page.getByRole("button", {
      name: "높이 조절",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(page.getByLabel("아이템 높이")).toHaveCount(
    0,
  );
});
