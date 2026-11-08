import { test, expect, type Page } from "@playwright/test";
import { initialState } from "@/mocks/storage";

async function seedHistory(page: Page, hidden = false) {
  const state = initialState("learner");
  // Quizzes are author-only, so the learner's records point at the learner's own copy.
  const quiz = {
    ...structuredClone(
      initialState("author").quizzes.find(
        ({ quizId }) => quizId === "seed-quiz-1",
      )!,
    ),
    quizId: "owned-quiz-1",
    ownerUserId: "learner",
    noteId: state.notes[0].noteId,
  };
  state.quizzes.push(quiz);
  const revision = structuredClone(quiz.revision);
  revision.title = "HistoryTypeScript".repeat(12);
  state.attempts = Array.from(
    { length: 43 },
    (_, index) => ({
      attemptId: `history-${String(index).padStart(2, "0")}`,
      quizId: quiz.quizId,
      revision,
      ownerUserId: "learner",
      submittedAnswer: {
        type: "SINGLE_CHOICE" as const,
        choiceId: index % 2 ? "b" : "a",
      },
      correct: index % 2 === 0,
      completedAt: "2026-11-08T12:00:00Z",
      learningDate: "2026-11-08",
      timeZone: "Asia/Seoul",
    }),
  );
  state.days = [
    {
      learningDate: "2026-11-08",
      timeZone: "Asia/Seoul",
      completedAt: "2026-11-08T12:00:00Z",
    },
  ];
  state.timeZone = "Asia/Seoul";
  if (hidden) quiz.deletedAt = "2026-11-08T14:00:00Z";
  await page.addInitScript(
    ({ state }) => {
      if (!localStorage.getItem("history-test-seeded")) {
        localStorage.setItem(
          "bugri:mock:v1:learner",
          JSON.stringify(state),
        );
        localStorage.setItem("history-test-seeded", "yes");
      }
    },
    { state },
  );
}

async function snapshot(page: Page) {
  return page.evaluate(() =>
    localStorage.getItem("bugri:mock:v1:learner"),
  );
}

for (const locale of ["ko", "en"]) {
  for (const mobile of [false, true]) {
    test(`${locale} ${mobile ? "mobile" : "desktop"}: filter, result, back, retry, keyboard`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(
        mobile
          ? { width: 390, height: 844 }
          : { width: 1280, height: 900 },
      );
      await seedHistory(page);
      await page.addInitScript(
        (locale) =>
          localStorage.setItem("bugri.locale", locale),
        locale,
      );
      await page.goto(
        "/my/learning?user=learner&filter=INCORRECT&page=2",
      );
      const en = locale === "en";
      await expect(
        page.getByRole("heading", {
          name: en ? "Quiz history" : "풀이 내역",
          exact: true,
        }),
      ).toBeVisible();
      const list = page.getByRole("list", {
        name: en ? "Quiz history" : "풀이 내역",
        exact: true,
      });
      await expect(list.getByRole("link")).toHaveCount(1);
      const historyBounds = await list.boundingBox();
      const headerBounds = await page
        .locator("header > div")
        .first()
        .evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            left:
              bounds.left + parseFloat(style.paddingLeft),
            right:
              bounds.right - parseFloat(style.paddingRight),
          };
        });
      expect(historyBounds!.x).toBeCloseTo(
        headerBounds.left,
        0,
      );
      expect(
        historyBounds!.x + historyBounds!.width,
      ).toBeCloseTo(headerBounds.right, 0);
      const before = await snapshot(page);
      await page.screenshot({
        path: testInfo.outputPath("history.png"),
        fullPage: true,
      });
      await list.getByRole("link").click();
      await expect(
        page.getByRole("heading", {
          name: en ? /Incorrect/ : /오답입니다/,
        }),
      ).toBeVisible();
      await expect(
        page.getByText("숫자 타입은 number입니다.", {
          exact: true,
        }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath("result.png"),
        fullPage: true,
      });
      await page
        .getByRole("link", {
          name: en
            ? "Back to quiz history"
            : "풀이 내역으로 돌아가기",
        })
        .click();
      await expect(page).toHaveURL(
        /filter=INCORRECT&page=2/,
      );
      await expect(list.getByRole("link")).toHaveCount(1);
      expect(await snapshot(page)).toBe(before);
      const all = page.getByRole("tab", {
        name: en ? "All" : "전체",
        exact: true,
      });
      await all.focus();
      await all.press("Enter");
      await expect(page).toHaveURL(/filter=ALL&page=1/);
      await expect(list.getByRole("link")).toHaveCount(20);
      await all.press("ArrowRight");
      await expect(page).toHaveURL(/filter=CORRECT&page=1/);
      await expect(
        page.getByRole("tab", {
          name: en ? "Correct" : "정답",
          exact: true,
        }),
      ).toBeFocused();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            window.innerWidth,
        ),
      ).toBe(true);
      await list.getByRole("link").first().click();
      await page
        .getByRole("button", {
          name: en ? "Replay" : "다시 풀기",
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(/\/solve\?.*attempt=/);
      await expect(
        page.getByRole("button", {
          name: en ? "Submit answer" : "답 제출",
          exact: true,
        }),
      ).toBeVisible();
      const after = JSON.parse((await snapshot(page))!);
      expect(
        after.attempts.filter(
          (entry: { completedAt: string | null }) =>
            entry.completedAt,
        ),
      ).toHaveLength(43);
      expect(after.attempts).toHaveLength(44);
    });
  }
}

test("guest selection, empty/filter empty, unavailable, unsubmitted and cross-user records", async ({
  page,
}, testInfo) => {
  await page.goto("/my/learning");
  await expect(
    page.getByRole("heading", {
      name: "데모 사용자를 선택해 주세요",
    }),
  ).toBeVisible();
  await page
    .getByRole("main")
    .getByRole("button", {
      name: "데모 사용자 선택",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "선택한 사용자로 시작" })
    .click();
  await expect(
    page.getByText("아직 풀이 내역이 없어요", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "홈에서 퀴즈 풀기" }),
  ).toBeVisible();
  await page
    .getByRole("tab", { name: "오답", exact: true })
    .click();
  await expect(
    page.getByText("오답 기록이 없어요", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "전체 보기", exact: true })
    .click();
  await page.screenshot({
    path: testInfo.outputPath("empty.png"),
    fullPage: true,
  });
  await seedHistory(page, true);
  await page.goto("/my/learning?user=learner");
  await page
    .getByRole("list", { name: "풀이 내역", exact: true })
    .getByRole("link")
    .first()
    .click();
  await expect(
    page.getByText(
      "현재 이용할 수 없어 다시 풀 수 없어요.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "다시 풀기",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByText("숫자 타입은 number입니다."),
  ).toHaveCount(0);
  await page.screenshot({
    path: testInfo.outputPath("unavailable.png"),
    fullPage: true,
  });
  await page.goto("/my/learning/history-00?user=friend");
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toBeVisible();
  await expect(
    page.getByText("숫자 타입은 number입니다."),
  ).toHaveCount(0);
});

test("profile entry on notes, out of range, unfinished result and storage retry", async ({
  page,
}) => {
  await seedHistory(page);
  await page.goto("/notes?user=learner");
  await page
    .getByRole("button", { name: "내 메뉴", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "내 메뉴" })
    .getByRole("link", { name: "풀이 내역", exact: true })
    .click();
  await expect(page).toHaveURL(
    /\/my\/learning\?user=learner/,
  );
  await page.goto("/my/learning?user=learner&page=999");
  await expect(
    page.getByText("이 페이지에는 풀이 내역이 없어요"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "첫 페이지로" })
    .click();
  await expect(page).toHaveURL(/page=1/);
  await page.evaluate(() => {
    const key = "bugri:mock:v1:learner";
    const state = JSON.parse(localStorage.getItem(key)!);
    state.attempts[0].completedAt = null;
    state.attempts[0].submittedAnswer = null;
    state.attempts[0].correct = null;
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.goto("/my/learning/history-00?user=learner");
  await expect(
    page.getByText("제출 완료한 풀이만 확인할 수 있어요"),
  ).toBeVisible();
  await expect(
    page.getByText("숫자 타입은 number입니다."),
  ).toHaveCount(0);
  const saved = await snapshot(page);
  await page.evaluate(() =>
    localStorage.setItem("bugri:mock:v1:learner", "broken"),
  );
  await page.goto("/my/learning?user=learner");
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toBeVisible();
  await page.evaluate(
    (saved) =>
      localStorage.setItem("bugri:mock:v1:learner", saved!),
    saved,
  );
  await page
    .getByRole("button", { name: "다시 시도", exact: true })
    .click();
  await expect(
    page
      .getByRole("list", { name: "풀이 내역", exact: true })
      .getByRole("link"),
  ).toHaveCount(20);
});

async function seedSearchHistory(page: Page) {
  const author = initialState("author");
  const friend = initialState("friend");
  const state = initialState("learner");

  // Quizzes are author-only, so the learner's records point at learner-owned copies.
  const records = [
    ...author.quizzes,
    ...friend.quizzes,
  ].map((quiz) => ({
    ...quiz,
    ownerUserId: "learner",
    noteId: state.notes[0].noteId,
  }));

  state.quizzes.push(...structuredClone(records));

  state.attempts = records.map((quiz, index) => ({
    attemptId: `search-${index}`,
    quizId: quiz.quizId,
    revision: structuredClone(quiz.revision),
    ownerUserId: quiz.ownerUserId,
    submittedAnswer: null,
    correct: index % 2 === 0,
    completedAt: `2026-11-0${index + 1}T12:00:00Z`,
    learningDate: `2026-11-0${index + 1}`,
    timeZone: "Asia/Seoul",
  }));

  state.timeZone = "Asia/Seoul";

  await page.addInitScript(
    ({ state, author, friend }) => {
      if (!localStorage.getItem("search-test-seeded")) {
        localStorage.setItem(
          "bugri:mock:v1:learner",
          JSON.stringify(state),
        );
        localStorage.setItem(
          "bugri:mock:v1:author",
          JSON.stringify(author),
        );
        localStorage.setItem(
          "bugri:mock:v1:friend",
          JSON.stringify(friend),
        );
        localStorage.setItem("search-test-seeded", "yes");
      }
    },
    { state, author, friend },
  );
}

const searchLabels = {
  ko: {
    search: "풀이 내역 검색",
    submit: "검색",
    clear: "검색 초기화",
    back: "풀이 내역으로 돌아가기",
    list: "풀이 내역",
    none: "“zzzz”와 일치하는 풀이가 없어요",
  },
  en: {
    search: "Search quiz history",
    submit: "Search",
    clear: "Clear search",
    back: "Back to quiz history",
    list: "Quiz history",
    none: "No attempts match “zzzz”",
  },
} as const;

for (const locale of ["ko", "en"] as const) {
  test(`${locale}: body search keeps filter/URL, highlights, survives detail round-trip and clears`, async ({
    page,
  }) => {
    const label = searchLabels[locale];

    await seedSearchHistory(page);

    await page.addInitScript(
      (value) =>
        localStorage.setItem("bugri.locale", value),
      locale,
    );

    await page.goto("/my/learning?user=learner");

    const list = page.getByRole("list", {
      name: label.list,
      exact: true,
    });

    await expect(list.getByRole("link")).toHaveCount(4);

    const box = page.getByRole("searchbox", {
      name: label.search,
    });

    await box.fill("  재할당  ");
    await page
      .getByRole("button", {
        name: label.submit,
        exact: true,
      })
      .click();

    await expect(page).toHaveURL(
      /query=%EC%9E%AC%ED%95%A0%EB%8B%B9/,
    );
    await expect(page).toHaveURL(/page=1/);
    await expect(list.getByRole("link")).toHaveCount(1);
    await expect(list.locator("mark")).toHaveText("재할당");
    await expect(list).toContainText("불변 선언");
    await expect(list).not.toContainText("const는 바인딩");

    await list.getByRole("link").click();
    await expect(
      page.getByRole("link", { name: label.back }),
    ).toHaveAttribute(
      "href",
      /query=%EC%9E%AC%ED%95%A0%EB%8B%B9/,
    );

    await page
      .getByRole("link", { name: label.back })
      .click();
    await expect(box).toHaveValue("재할당");
    await expect(list.getByRole("link")).toHaveCount(1);

    await box.fill("zzzz");
    await page
      .getByRole("button", {
        name: label.submit,
        exact: true,
      })
      .click();
    await expect(page.getByText(label.none)).toBeVisible();

    await page
      .getByRole("button", { name: label.clear })
      .last()
      .click();
    await expect(page).not.toHaveURL(/query=/);
    await expect(list.getByRole("link")).toHaveCount(4);
  });
}
