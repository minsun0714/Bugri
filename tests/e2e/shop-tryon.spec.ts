import { expect, test } from "@playwright/test";

for (const width of [1100, 390]) {
  test(`shop offers isolated try-on before purchase at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/shop");
    const card = page.getByRole("article").filter({
      has: page.getByRole("heading", {
        name: "라벤더 키보드",
      }),
    });
    await expect(card).toBeVisible();
    await expect(
      page.getByRole("img", { name: "3D 데스크 캔버스" }),
    ).toHaveCount(0);
    const button = card.getByRole("button", {
      name: "장착해 보기",
    });
    await button.click();
    const dialog = page.getByRole("dialog", {
      name: "라벤더 키보드 장착해 보기",
    });
    await expect(
      dialog.getByRole("group", {
        name: "장착 미리보기 · 라벤더 키보드",
        exact: true,
      }),
    ).toBeVisible();
    for (const name of ["45도 시점", "정면", "위에서"])
      await expect(
        dialog.getByRole("button", { name, exact: true }),
      ).toHaveCount(0);
    const canvas = dialog.locator(
      '[data-renderer="canvas"] canvas',
    );
    await expect(canvas).toBeVisible();
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + 25, box.y + 25);
    await page.mouse.down();
    await page.mouse.move(box.x + 85, box.y + 25, {
      steps: 6,
    });
    await page.mouse.up();
    await expect(
      dialog.getByLabel("카메라 방위각"),
    ).not.toHaveText("45°");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(button).toBeFocused();
    await expect(page.getByLabel("내 잔액")).toContainText(
      "100",
    );
    await expect(
      page.getByRole("button", {
        name: "보관함",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: "상점",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      card.getByRole("button", {
        name: "구매하기",
        exact: true,
      }),
    ).toBeEnabled();
    await page.goto("/my");
    await expect(
      page.getByText("아직 보관한 상품이 없어요"),
    ).toBeVisible();
    await expect(
      page.getByRole("group", {
        name: "내 데스크 · 기본 데스크",
        exact: true,
      }),
    ).toBeVisible();
  });
}

test("trial purchase and equip are explicit and replacing a preview does not save it", async ({
  page,
}) => {
  await page.goto("/shop");
  const card = (name: string) =>
    page.getByRole("article").filter({
      has: page.getByRole("heading", {
        name,
        exact: true,
      }),
    });
  await card("새싹 키보드")
    .getByRole("button", { name: "장착해 보기" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("button", { name: "구매하기", exact: true })
    .click();
  await expect(
    dialog
      .getByRole("status")
      .filter({ hasText: "구매 완료" }),
  ).toContainText("구매 완료");
  await expect(page.getByLabel("내 잔액")).toContainText(
    "70",
  );
  await dialog
    .getByRole("button", {
      name: "내 데스크에 장착",
      exact: true,
    })
    .click();
  await expect(
    dialog.getByRole("button", {
      name: "장착 중",
      exact: true,
    }),
  ).toBeDisabled();
  await dialog
    .getByRole("button", { name: "닫기", exact: true })
    .click();
  await card("라벤더 키보드")
    .getByRole("button", { name: "장착해 보기" })
    .click();
  await expect(
    dialog.getByRole("group", {
      name: "장착 미리보기 · 라벤더 키보드",
      exact: true,
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await card("원목 책상")
    .getByRole("button", { name: "장착해 보기" })
    .click();
  await expect(
    dialog.getByRole("group", {
      name: /장착 미리보기.*새싹 키보드.*원목 책상/,
    }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "구매하기", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText(
    "BugCoin이 부족해요",
  );
  await dialog
    .getByRole("button", { name: "닫기", exact: true })
    .click();
  await page
    .getByRole("link", {
      name: "내 데스크 꾸미기",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("group", {
      name: "내 데스크 · 새싹 키보드",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("group", {
      name: "내 데스크 · 새싹 키보드",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByLabel("내 잔액")).toContainText(
    "70",
  );
});
