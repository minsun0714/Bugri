import { test, expect } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`public introduction editing and links at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/users/bugri-author");
    await expect(
      page.getByRole("button", {
        name: "프로필 편집",
        exact: true,
      }),
    ).toHaveCount(0);
    await page.goto("/users/bugri-author?user=author");
    await page
      .getByRole("button", {
        name: "프로필 편집",
        exact: true,
      })
      .click();
    const form = page.getByRole("form", {
      name: "프로필 편집",
    });
    await expect(form.getByRole("combobox")).toHaveCount(0);
    await expect(
      form.getByRole("button", { name: "+ 코드 블럭" }),
    ).toHaveCount(0);
    const addLink = form.getByRole("button", {
      name: "링크 추가",
    });
    const addBox = (await addLink.boundingBox())!;
    const linksBox = (await form
      .getByRole("region", { name: "프로필 링크" })
      .boundingBox())!;
    expect(
      Math.abs(addBox.width - linksBox.width),
    ).toBeLessThan(2);
    const plusBox = (await addLink
      .locator("svg")
      .boundingBox())!;
    expect(
      Math.abs(
        plusBox.x +
          plusBox.width / 2 -
          addBox.x -
          addBox.width / 2,
      ),
    ).toBeLessThan(2);
    await expect(
      form.getByRole("textbox", {
        name: "자기소개 (선택)",
      }),
    ).toBeFocused();
    await form
      .getByRole("textbox", { name: "자기소개 (선택)" })
      .fill("## 만드는 사람\nTypeScript를 좋아합니다.");
    await form
      .getByRole("tab", { name: "미리보기", exact: true })
      .click();
    const preview = form.locator(".markdown-preview");
    await expect(preview).toHaveCSS(
      "border-top-width",
      "1px",
    );
    await expect(preview).toHaveCSS("padding", "16px");
    await expect(
      preview.getByRole("heading", { name: "만드는 사람" }),
    ).toBeVisible();
    await form
      .getByRole("tab", { name: "작성", exact: true })
      .click();
    await form
      .getByRole("button", { name: "링크 추가" })
      .click();
    await expect(
      form.getByRole("combobox", { name: "링크 종류 1" }),
    ).toBeFocused();
    await form
      .getByLabel("URL 1", { exact: true })
      .fill("javascript:alert(1)");
    await form
      .getByRole("button", { name: "저장", exact: true })
      .click();
    await expect(
      form.getByText(
        "http:// 또는 https://로 시작하는 URL을 입력하세요.",
      ),
    ).toBeVisible();
    await form
      .getByLabel("URL 1", { exact: true })
      .fill("https://minsun0714@github.com");
    await form
      .getByRole("button", { name: "저장", exact: true })
      .click();
    await expect(
      form.getByText(
        "GitHub 프로필 주소는 https://github.com/사용자이름 형식으로 입력하세요.",
      ),
    ).toBeVisible();
    await form
      .getByLabel("URL 1", { exact: true })
      .fill("https://github.com/example");
    await form
      .getByRole("button", { name: "링크 추가" })
      .click();
    await form
      .getByRole("combobox", { name: "링크 종류 2" })
      .click();
    await page
      .getByRole("option", { name: "기타", exact: true })
      .click();
    await form.getByLabel("표시 이름 2").fill("발표 자료");
    await form
      .getByLabel("URL 2", { exact: true })
      .fill("https://example.com/talk");
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            innerWidth,
        ),
      )
      .toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`edit-${width}.png`),
      fullPage: true,
    });
    await form
      .getByRole("button", { name: "저장", exact: true })
      .click();
    await expect(
      page.getByText("프로필을 저장했습니다."),
    ).toBeVisible();
    const savedToast = page
      .getByRole("status")
      .filter({ hasText: "프로필을 저장했습니다." });
    await expect(savedToast).toHaveCSS("position", "fixed");
    await expect(
      page
        .getByRole("region", { name: "공개 프로필 정보" })
        .getByText("프로필을 저장했습니다."),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "만드는 사람" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "GitHub (새 탭)" }),
    ).toHaveAttribute("href", "https://github.com/example");
    await page.screenshot({
      path: testInfo.outputPath(`saved-${width}.png`),
      fullPage: true,
    });
    await expect(savedToast).toBeHidden({ timeout: 6000 });
    await page.reload();
    await expect(
      page.getByRole("link", {
        name: /발표 자료.*example\.com.*새 탭/,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "프로필 편집",
        exact: true,
      }),
    ).toBeVisible();
    await page.goto("/users/bugri-author?user=friend");
    await expect(
      page.getByRole("button", {
        name: "프로필 편집",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", {
        name: /발표 자료.*example\.com.*새 탭/,
      }),
    ).toBeVisible();
    await page.goto("/users/bugri-author?user=author");
    await page
      .getByRole("button", {
        name: "프로필 편집",
        exact: true,
      })
      .click();
    await form
      .getByLabel("URL 1", { exact: true })
      .fill("https://github.com/updated");
    await form
      .getByRole("button", { name: "링크 2 삭제" })
      .click();
    await form
      .getByRole("button", { name: "저장", exact: true })
      .click();
    await expect(
      page.getByRole("link", { name: "GitHub (새 탭)" }),
    ).toHaveAttribute("href", "https://github.com/updated");
    await expect(
      page.getByRole("link", {
        name: /발표 자료.*example\.com.*새 탭/,
      }),
    ).toHaveCount(0);
    await page
      .getByRole("button", {
        name: "프로필 편집",
        exact: true,
      })
      .click();
    await form
      .getByRole("textbox", { name: "자기소개 (선택)" })
      .fill("취소할 내용");
    await form
      .getByRole("button", { name: "취소", exact: true })
      .click();
    await expect(
      form.getByRole("button", { name: "계속 편집" }),
    ).toBeFocused();
    await form
      .getByRole("button", { name: "계속 편집" })
      .click();
    await expect(
      form.getByRole("textbox", {
        name: "자기소개 (선택)",
      }),
    ).toBeFocused();
    await form
      .getByRole("button", { name: "취소", exact: true })
      .click();
    await form
      .getByRole("button", {
        name: "변경 취소",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", { name: "만드는 사람" }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "프로필 편집",
        exact: true,
      })
      .click();
    await form
      .getByRole("textbox", { name: "자기소개 (선택)" })
      .fill("");
    await form
      .getByRole("button", { name: "링크 1 삭제" })
      .click();
    await form
      .getByRole("button", { name: "저장", exact: true })
      .click();
    await page.reload();
    await expect(
      page.getByRole("region", { name: "자기소개와 링크" }),
    ).toHaveCount(0);
  });
}
