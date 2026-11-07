import { expect, test } from "@playwright/test";
import { selectSceneProduct } from "./helpers/desk";

const additions = [
  { category: "배경", name: "노을 작업실" },
  { category: "책상", name: "민트 책상" },
  { category: "키보드", name: "오션 키보드" },
  { category: "모니터", name: "스카이 모니터" },
  { category: "소품", name: "블루 화분" },
];

for (const width of [1100, 390]) {
  test(`new category variants preview, equip and survive reload at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/shop?user=learner");
    for (const { category, name } of additions) {
      await page
        .getByRole("button", {
          name: category,
          exact: true,
        })
        .click();
      await expect(page.getByRole("article")).toHaveCount(
        3,
      );
      const card = page.getByRole("article").filter({
        has: page.getByRole("heading", {
          name,
          exact: true,
        }),
      });
      await card.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          card
            .getByRole("img", { name, exact: true })
            .evaluate((element) => element.tagName),
        )
        .toBe("IMG");
      await card
        .getByRole("button", { name: "장착해 보기" })
        .click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.locator("canvas")).toBeVisible();
      if (category !== "배경") {
        const controls = await selectSceneProduct(
          dialog,
          name,
        );
        await controls.press("ArrowRight");
        await controls.press("Alt+ArrowRight");
        await expect(
          dialog.getByLabel("선택 상품 배치"),
        ).toContainText("회전 15°");
      }
      await dialog
        .getByRole("button", {
          name: "구매하기",
          exact: true,
        })
        .click();
      await dialog
        .getByRole("button", {
          name:
            category === "책상"
              ? "기존 상품과 교체"
              : "내 데스크에 장착",
          exact: true,
        })
        .click();
      await expect(
        dialog.getByText("장착과 배치를 저장했어요."),
      ).toBeVisible();
      await dialog
        .getByRole("button", { name: "닫기", exact: true })
        .click();
      await expect(
        card.getByRole("button", {
          name: "보유 중",
          exact: true,
        }),
      ).toBeDisabled();
    }
    await expect(page.getByLabel("내 잔액")).toContainText(
      "0",
    );
    await page.reload();
    await page
      .getByRole("button", { name: "전체", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "보유 중",
        exact: true,
      }),
    ).toHaveCount(5);
    await page.goto("/my/desk?user=learner");
    await expect(
      page.locator('[data-renderer="canvas"] canvas'),
    ).toBeVisible();
    for (const { category, name } of additions) {
      if (category === "배경") continue;
      await selectSceneProduct(page, name);
      await expect(
        page.getByLabel("선택 상품 배치"),
      ).toContainText("회전 15°");
    }
    await page.goto("/users/bugri-learner?user=friend");
    const scene = page.getByRole("group", {
      name: /^학습자의 데스크 ·/,
    });
    await expect(scene).toBeVisible();
    for (const { name } of additions)
      await expect(scene).toHaveAttribute(
        "aria-label",
        new RegExp(name),
      );
    await expect(
      page.getByRole("button", { name: /선택$/ }),
    ).toHaveCount(0);
  });
}
