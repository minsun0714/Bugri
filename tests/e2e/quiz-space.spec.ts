import { expect, test } from "@playwright/test";

for (const locale of ["ko", "en"]) {
  test(`authoring space, keyboard tabs and generation in ${locale}`, async ({
    page,
  }) => {
    await page.addInitScript(
      (language) =>
        localStorage.setItem("bugri.locale", language),
      locale,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/quizzes/authoring?user=author");
    const write = page.getByRole("tab", {
      name: locale === "ko" ? "작성" : "Write",
      exact: true,
    });
    const preview = page.getByRole("tab", {
      name: locale === "ko" ? "미리보기" : "Preview",
      exact: true,
    });
    const input = page.getByRole("textbox");
    const generate = page.getByRole("button", {
      name: locale === "ko" ? "퀴즈 만들기" : "Create quiz",
      exact: true,
    });
    await expect(write).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(input).toHaveValue("");
    await expect(input).toHaveAttribute(
      "placeholder",
      /HTTP/,
    );
    await page.screenshot({
      path: `/tmp/bugri-quiz-space/${locale}-mobile-write.png`,
      fullPage: true,
    });
    await write.press("ArrowRight");
    await expect(preview).toBeFocused();
    const panel = page.getByRole("tabpanel");
    expect(
      (await panel.boundingBox())!.height,
    ).toBeLessThan(130);
    await page.screenshot({
      path: `/tmp/bugri-quiz-space/${locale}-mobile-empty.png`,
      fullPage: true,
    });
    await preview.press("Home");
    const source = `HTTP 응답 😀\n\n\`\`\`typescript\n  const response = "${"response".repeat(40)}";\n\`\`\``;
    await input.fill(source);
    await write.press("End");
    await expect(preview).toBeFocused();
    await expect(panel.locator("pre code")).toHaveText(
      `  const response = "${"response".repeat(40)}";\n`,
    );
    await expect(panel.locator(".hljs-keyword")).toHaveText(
      "const",
    );
    expect(
      await panel
        .locator("pre")
        .evaluate(
          (element) =>
            element.scrollWidth > element.clientWidth,
        ),
    ).toBe(true);
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      390,
    );
    await expect(
      page.getByText(
        new RegExp(`${[...source].length} / 10,000`),
      ),
    ).toBeVisible();
    const panelBox = (await panel.boundingBox())!;
    const buttonBox = (await generate.boundingBox())!;
    expect(
      buttonBox.y - panelBox.y - panelBox.height,
    ).toBeLessThan(100);
    await page.screenshot({
      path: `/tmp/bugri-quiz-space/${locale}-mobile-code.png`,
      fullPage: true,
    });
    await preview.press("ArrowLeft");
    await expect(input).toHaveValue(source);
    await page.setViewportSize({
      width: 1280,
      height: 900,
    });
    await expect(write).toHaveCount(0);
    const writingPanel = page.getByRole("region", {
      name: locale === "ko" ? "작성" : "Write",
      exact: true,
    });
    const previewPanel = page.getByRole("region", {
      name: locale === "ko" ? "미리보기" : "Preview",
      exact: true,
    });
    const writingBox = (await writingPanel.boundingBox())!;
    const previewBox = (await previewPanel.boundingBox())!;
    expect(
      Math.abs(writingBox.height - previewBox.height),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(writingBox.y - previewBox.y),
    ).toBeLessThanOrEqual(1);

    await expect(input).toHaveValue(source);
    await expect(page.locator("pre code")).toBeVisible();
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      1280,
    );
    await page.screenshot({
      path: `/tmp/bugri-quiz-space/${locale}-desktop-code.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 320, height: 800 });
    await expect(input).toHaveValue(source);
    await preview.click();
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      320,
    );
    await generate.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("button", {
        name:
          locale === "ko" ? "직접 수정" : "Edit directly",
        exact: true,
      }),
    ).toBeVisible();
    await page.screenshot({
      path: `/tmp/bugri-quiz-space/${locale}-mobile-generated.png`,
      fullPage: true,
    });
  });
}

for (const locale of ["ko", "en"]) {
  test(`management long titles and tags at mobile and desktop in ${locale}`, async ({
    page,
  }) => {
    await page.goto(
      "/quizzes/authoring/manage?user=author&quiz=seed-quiz-1",
    );
    await page
      .getByRole("button", {
        name: "직접 수정",
        exact: true,
      })
      .click();
    const title =
      "HTTP request and response status codes with very long resource identifiers and cache validation rules for developers";
    await page
      .getByRole("textbox", { name: "제목", exact: true })
      .fill(title);
    const tags = page.locator(".tag-input-shell");
    while (await tags.getByRole("button").count()) {
      await tags.getByRole("button").first().click();
    }
    for (const tag of ["javascript", "web", "typescript"]) {
      await page
        .getByRole("textbox", {
          name: "해시태그",
          exact: true,
        })
        .fill(tag);
      await page
        .getByRole("textbox", {
          name: "해시태그",
          exact: true,
        })
        .press("Enter");
    }
    await page
      .getByRole("button", {
        name: "수정 저장",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "내용을 저장했습니다",
    );
    await page.evaluate(
      (language) =>
        localStorage.setItem("bugri.locale", language),
      locale,
    );
    await page.goto(
      "/quizzes/authoring/manage?user=author",
    );
    const card = page.getByRole("article", {
      name: title,
      exact: true,
    });
    await expect(card).toBeVisible();
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator("body")).toHaveJSProperty(
        "scrollWidth",
        width,
      );
      await expect(card.locator(".line-clamp-2")).toHaveCSS(
        "-webkit-line-clamp",
        "2",
      );
      const titleBox = (await card
        .locator(".line-clamp-2")
        .boundingBox())!;
      expect(titleBox.height).toBeLessThanOrEqual(48);
      const gear = card.getByRole("button", {
        name: new RegExp(
          locale === "ko" ? "검토하기$" : "Review$",
        ),
      });
      await expect(gear).toBeVisible();
      const gearBox = (await gear.boundingBox())!;
      expect(
        titleBox.x + titleBox.width,
      ).toBeLessThanOrEqual(gearBox.x);
      expect(gearBox.width).toBeGreaterThanOrEqual(44);
      expect(gearBox.height).toBeGreaterThanOrEqual(44);
      await expect(card).toContainText(
        "#javascript #web #typescript",
      );
      await page.screenshot({
        path: `/tmp/bugri-quiz-space/${locale}-${width}-manage.png`,
        fullPage: true,
      });
    }
    // Synthetic layout stress only: the API intentionally accepts registered tags only.
    await page.setViewportSize({ width: 320, height: 900 });
    const tagText = card.getByText(
      "#javascript #web #typescript",
      { exact: true },
    );
    await tagText.evaluate((element) => {
      element.textContent = `#${"longtag".repeat(12)} #HTTP-request-response #typescript`;
    });
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      320,
    );
    await page.screenshot({
      path: `/tmp/bugri-quiz-space/${locale}-320-synthetic-long-tags.png`,
      fullPage: true,
    });

    await card
      .getByRole("button", {
        name: new RegExp(
          locale === "ko" ? "검토하기$" : "Review$",
        ),
      })
      .press("Enter");
    await expect(page).toHaveURL(/quiz=seed-quiz-1/);
    await expect(
      page.getByRole("heading", {
        name: title,
        exact: true,
      }),
    ).toBeVisible();
    await page.screenshot({
      path: `/tmp/bugri-quiz-space/${locale}-manage-open.png`,
      fullPage: true,
    });
  });
}

for (const action of [
  "임시저장",
  "바로 공개",
  "퀴즈 삭제",
]) {
  test(`completed ${action} flow redirects without a leave warning`, async ({
    page,
  }) => {
    await page.goto("/quizzes/authoring?user=learner");
    await page
      .getByRole("textbox")
      .fill("HTTP 요청과 응답");
    await page
      .getByRole("button", {
        name: "퀴즈 만들기",
        exact: true,
      })
      .click();
    const dialogs: string[] = [];
    page.on("dialog", async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.accept();
    });
    const modal = page.getByRole("dialog");
    await expect(modal.getByRole("tab")).toHaveCount(4);
    const batchUrl = page.url();
    for (let index = 1; index <= 4; index += 1) {
      if (index > 1 && action !== "퀴즈 삭제") {
        await modal
          .getByRole("tab", {
            name: `퀴즈 ${index}`,
            exact: true,
          })
          .click();
      }
      await modal
        .getByRole("button", { name: action, exact: true })
        .click();
      if (index < 4) {
        await expect(page).toHaveURL(batchUrl);
        if (action === "퀴즈 삭제")
          await expect(modal.getByRole("tab")).toHaveCount(
            4 - index,
          );
        else
          await expect(
            modal.getByRole("tab", {
              name: new RegExp(`^퀴즈 ${index} ·`),
            }),
          ).toBeVisible();
      }
    }
    await expect(page).toHaveURL(
      /\/quizzes\/authoring\/manage\?user=learner$/,
    );
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("article")).toHaveCount(
      action === "퀴즈 삭제" ? 0 : 4,
    );
    expect(
      dialogs.filter((message) =>
        /저장하지 않은|모달을 닫으면/.test(message),
      ),
    ).toEqual([]);
    await page.screenshot({
      path: `/tmp/bugri-quiz-followup/completed-${action}.png`,
      fullPage: true,
    });
    await page.goto(batchUrl);
    await expect(page).toHaveURL(
      /\/quizzes\/authoring\/manage\?user=learner$/,
    );
  });
}

test("desktop empty and long preview panels match writing height", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/quizzes/authoring?user=author");
  const writing = page.getByRole("region", {
    name: "작성",
    exact: true,
  });
  const preview = page.getByRole("region", {
    name: "미리보기",
    exact: true,
  });
  for (const content of [
    "",
    "HTTP 응답\n\n" +
      "응답 상태와 본문을 확인합니다.\n\n".repeat(15),
  ]) {
    await page.getByRole("textbox").fill(content);
    await expect(writing).toBeVisible();
    const left = (await writing.boundingBox())!;
    const right = (await preview.boundingBox())!;
    expect(
      Math.abs(left.height - right.height),
    ).toBeLessThanOrEqual(1);
    const shell = (await writing
      .getByRole("group")
      .boundingBox())!;
    const markdown = (await preview
      .locator(".markdown-preview")
      .boundingBox())!;
    expect(
      Math.abs(shell.height - markdown.height),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      path: `/tmp/bugri-quiz-followup/desktop-${content ? "long" : "empty"}.png`,
      fullPage: true,
    });
  }
});
