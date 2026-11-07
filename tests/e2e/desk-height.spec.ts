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

test("height drag persists and the tabletop occludes a lowered keyboard", async ({
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
    .getByRole("button", { name: "구매하기" })
    .click();
  await card
    .getByRole("button", { name: "장착해 보기" })
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
  await page
    .getByRole("link", {
      name: "내 데스크 꾸미기",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "새싹 키보드 선택",
      exact: true,
    })
    .click();
  const canvas = page
    .getByRole("main")
    .locator('[data-renderer="canvas"] canvas');
  await page
    .getByRole("button", {
      name: "바닥에 놓기",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "배치 저장", exact: true })
    .click();
  await expect(
    page.getByLabel("선택 상품 배치"),
  ).toContainText("Y 0.00");
  await expect
    .poll(() => visibleKeyboard(canvas))
    .toBeGreaterThan(50);
  await page
    .getByRole("button", { name: "위에서", exact: true })
    .click();
  await expect.poll(() => visibleKeyboard(canvas)).toBe(0);
  await page
    .getByRole("button", {
      name: "책상 위에 놓기",
      exact: true,
    })
    .click();
  await expect(page.getByLabel("아이템 높이")).toHaveValue(
    "1.55",
  );
  await expect
    .poll(() => visibleKeyboard(canvas))
    .toBeGreaterThan(50);
  await page
    .getByRole("button", { name: "45도 시점", exact: true })
    .click();
  await page
    .getByRole("button", { name: "높이 조절", exact: true })
    .click();
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas missing");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 50, { steps: 10 });
  await page.mouse.up();
  await expect(
    page.getByText("3D 배치를 저장했어요."),
  ).toBeVisible();
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
  await page
    .getByRole("button", {
      name: "새싹 키보드 선택",
      exact: true,
    })
    .click();
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
