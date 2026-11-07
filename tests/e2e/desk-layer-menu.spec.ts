import { expect, test } from "@playwright/test";
import {
  productPoint,
  selectTrialProduct,
} from "./helpers/desk";

for (const width of [1100, 390]) {
  test(`selected item menu orders layers and isolates trial edits at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/my/desk");
    await page
      .getByRole("button", {
        name: "버그리 선택",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: "선택 아이템 메뉴",
        exact: true,
      })
      .click();
    await page
      .getByRole("menuitem", {
        name: "맨 앞으로 보내기",
        exact: true,
      })
      .click();
    await expect(page.getByLabel("겹침 순서")).toHaveText(
      "기본 데스크 · 버그리",
    );
    const canvas = page.locator(
      '[data-renderer="canvas"] canvas',
    );
    const bugri = await productPoint(
      canvas,
      [197, 237, 102],
    );
    const desk = await productPoint(
      canvas,
      [240, 214, 181],
    );
    await page.mouse.move(bugri.x, bugri.y);
    await page.mouse.down();
    await page.mouse.move(desk.x, desk.y, { steps: 8 });
    await page.mouse.up();
    await expect(
      page.getByText("3D 배치를 저장했어요."),
    ).toBeVisible();
    await expect(
      page.getByLabel("선택 테두리"),
    ).toBeVisible();
    await productPoint(canvas, [197, 237, 102]);
    await page.reload();
    await expect(page.getByLabel("겹침 순서")).toHaveText(
      "기본 데스크 · 버그리",
    );
    await page.goto("/shop");
    const card = page
      .getByRole("article")
      .filter({
        has: page.getByRole("heading", {
          name: "라벤더 키보드",
          exact: true,
        }),
      });
    await card
      .getByRole("button", { name: "장착해 보기" })
      .click();
    const dialog = page.getByRole("dialog");
    await selectTrialProduct(dialog, "버그리");
    const initial = await dialog
      .getByLabel("겹침 순서")
      .textContent();
    for (const [action, expected] of [
      [
        "맨 앞으로 보내기",
        "기본 데스크 · 라벤더 키보드 · 버그리",
      ],
      [
        "뒤로 보내기",
        "기본 데스크 · 버그리 · 라벤더 키보드",
      ],
      [
        "맨 뒤로 보내기",
        "버그리 · 기본 데스크 · 라벤더 키보드",
      ],
      [
        "앞으로 가져오기",
        "기본 데스크 · 버그리 · 라벤더 키보드",
      ],
    ]) {
      await dialog
        .getByRole("button", {
          name: "선택 아이템 메뉴",
          exact: true,
        })
        .click();
      await dialog
        .getByRole("menuitem", {
          name: action,
          exact: true,
        })
        .click();
      await expect(
        dialog.getByLabel("겹침 순서"),
      ).toHaveText(expected);
    }
    await dialog
      .getByRole("button", { name: "초기화", exact: true })
      .click();
    await expect(dialog.getByLabel("겹침 순서")).toHaveText(
      initial!,
    );
    await selectTrialProduct(dialog, "버그리");
    const menu = dialog.getByRole("button", {
      name: "선택 아이템 메뉴",
      exact: true,
    });
    await menu.focus();
    await page.keyboard.press("Enter");
    await expect(
      dialog.getByRole("menuitem").first(),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
    await expect(dialog).toBeVisible();
    await dialog
      .getByRole("button", { name: "닫기", exact: true })
      .click();
    await page.goto("/users/bugri-learner");
    await expect(page.getByLabel("겹침 순서")).toHaveText(
      "기본 데스크 · 버그리",
    );
    await expect(
      page.getByRole("button", {
        name: "선택 아이템 메뉴",
      }),
    ).toHaveCount(0);
  });
}
