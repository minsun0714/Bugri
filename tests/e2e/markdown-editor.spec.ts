import { test, expect } from "@playwright/test";
test("Markdown preview preserves code and safely ignores raw HTML", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.locator(".ui-code .hljs-keyword").first(),
  ).toHaveText("const");
  await expect(
    page.locator(".ui-code .hljs-string").first(),
  ).toHaveText('"read"');
  const input = page.getByRole("textbox", {
    name: "학습 내용",
  });
  await input.fill(
    "# 오늘 배운 내용\n\n**중요**\n\n- 배열\n\n```typescript\nconst x = 1;\n  console.log(x);\n```\n\n<script>window.alert(1)</script>",
  );
  await page
    .getByRole("tab", { name: "미리보기", exact: true })
    .click();
  const preview = page.getByRole("tabpanel").filter({
    has: page.getByRole("heading", {
      name: "오늘 배운 내용",
    }),
  });
  await expect(preview.locator("strong")).toHaveText(
    "중요",
  );
  await expect(preview.locator("li")).toHaveText("배열");
  await expect(preview.locator("pre code")).toContainText(
    "  console.log(x);",
  );
  await expect(preview.locator("script")).toHaveCount(0);
  await page
    .getByRole("tab", { name: "작성", exact: true })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await input.fill("설명");
  await input.evaluate((element: HTMLTextAreaElement) =>
    element.setSelectionRange(2, 2),
  );
  await page
    .getByRole("button", {
      name: "+ 코드 블럭",
      exact: true,
    })
    .click();
  const language = page.getByRole("combobox", {
    name: "삽입할 코드 언어",
  });
  await language.click();
  await page
    .getByRole("option", { name: "java", exact: true })
    .click();
  await expect(language).toContainText("java");
  await language.click();
  await page.keyboard.press("Escape");
  await expect(language).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(language).toBeFocused();
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    390,
  );
  await page
    .getByRole("button", { name: "삽입", exact: true })
    .click();
  await expect(input).toHaveValue(
    "설명\n\n```java\n\n```\n",
  );
  await expect(input).toBeFocused();
});
