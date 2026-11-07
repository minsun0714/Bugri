import {
  QuizStatus,
  LearningMode,
  LearningState,
} from "@/api/constants";
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import type { ApiClient } from "@/api/client";

// Test-only bundle: exercises production TS modules in a real browser without adding UI/routes or dependencies.
function browserBundle() {
  const root = process.cwd();
  const modules = new Map<string, string>();

  function collect(file: string): string {
    const key = path
      .relative(root, file)
      .replaceAll(path.sep, "/");

    if (modules.has(key)) return key;

    const source = fs.readFileSync(file, "utf8");

    modules.set(key, "");

    let { outputText: js } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    });

    js = js.replace(
      /require\("((?:@\/|\.)[^"]+)"\)/g,
      (_, specifier: string) => {
        const resolved = specifier.startsWith("@/")
          ? path.resolve(
              root,
              "src",
              `${specifier.slice(2)}.ts`,
            )
          : path.resolve(
              path.dirname(file),
              `${specifier}.ts`,
            );

        return `require(${JSON.stringify(collect(resolved))})`;
      },
    );

    modules.set(key, js);

    return key;
  }

  const client = collect(
    path.join(root, "src/api/client.ts"),
  );

  const adapter = collect(
    path.join(root, "src/mocks/adapter.ts"),
  );

  return `(function(){ const modules = {${[...modules].map(([key, code]) => `${JSON.stringify(key)}: function(module, exports, require){${code}\n}`).join(",")}}; const cache = {}; function require(key) { if(cache[key]) return cache[key].exports; const m = {exports:{}}; cache[key]=m; modules[key](m,m.exports,require); return m.exports; } window.mockApi = (userId) => require(${JSON.stringify(client)}).createApiClient(require(${JSON.stringify(adapter)}).createMockTransport({userId})); })();`;
}

declare global {
  interface Window {
    mockApi: (userId: string) => ApiClient;
  }
}

const bundle = browserBundle();

async function load(page: Page) {
  await page.goto("/");

  await page.addScriptTag({
    content: bundle,
  });
}

test("browser generation → review → subscription → solve/replay → purchase/equip survives reload", async ({
  page,
}) => {
  await load(page);

  const outcome = await page.evaluate(
    async ({ QuizStatus, LearningMode }) => {
      localStorage.clear();

      const owner = window.mockApi("author"),
        learner = window.mockApi("learner");

      const batch = await owner.request("generate", {
        sourceContent: "코드\n```ts\nconst x = 1;\n```",
      });

      const [draft] = await owner.request("saveBatch", {
        batchId: batch.batchId,
        mode: "SINGLE",
        candidateId: batch.candidates[0].candidateId,
      });

      const reviewed = await owner.request(
        "updatePending",
        {
          quizId: draft.quizId,
          expectedVersion: draft.version,
          action: "MARK_REVIEWED",
        },
      );

      await owner.request("approve", {
        quizId: draft.quizId,
        expectedVersion: reviewed.version,
        visibility: QuizStatus.PUBLIC,
      });

      await learner.request("subscribe", {
        type: "PERSON",
        authorUserId: "author",
      });

      const selected = await learner.request(
        "learningQuiz",
        {
          hashtagId: "typescript",
        },
      );

      const first = await learner.request("startAttempt", {
        quizId: selected.quiz!.quizId,
        context: "LEARNING",
      });

      await learner.request("answer", {
        attemptId: first.attemptId,
        answer: {
          type: "SINGLE_CHOICE",
          choiceId: "a",
        },
      });

      const exhausted = await learner.request(
        "learningNext",
        {},
      );

      const replaySelection = await learner.request(
        "learningQuiz",
        {
          hashtagId: "typescript",
          mode: LearningMode.REPLAY,
        },
      );

      const replay = await learner.request("startAttempt", {
        quizId: replaySelection.quiz!.quizId,
        context: "LEARNING",
      });

      await learner.request("answer", {
        attemptId: replay.attemptId,
        answer: {
          type: "SINGLE_CHOICE",
          choiceId: "a",
        },
      });

      await learner.request("purchase", {
        productId: "keyboard-1",
        requestKey: "browser-buy",
      });

      await learner.request("purchase", {
        productId: "keyboard-1",
        requestKey: "browser-buy",
      });

      await learner.request("equip", {
        category: "KEYBOARD",
        productId: "keyboard-1",
      });

      return {
        exhausted: exhausted.state,
        exhaustedQuiz: exhausted.quiz,
        tag: exhausted.hashtagId,
        selected,
        firstId: first.attemptId,
        replayId: replay.attemptId,
        day: await learner.request("learningDay", {}),
      };
    },
    { QuizStatus, LearningMode },
  );

  expect(outcome.exhausted).toBe(LearningState.EXHAUSTED);
  expect(outcome.exhaustedQuiz).toBeNull();
  expect(outcome.tag).toBe("typescript");
  expect(outcome.replayId).not.toBe(outcome.firstId);
  expect(outcome.day.completedDates).toHaveLength(1);

  expect(JSON.stringify(outcome.selected)).not.toMatch(
    /"answer"|"explanation"|"sourceContent"/,
  );

  await page.reload();

  await page.addScriptTag({
    content: bundle,
  });

  const restored = await page.evaluate(async () => ({
    wallet: await window
      .mockApi("learner")
      .request("wallet", {}),
    inventory: await window
      .mockApi("learner")
      .request("inventory", {}),
    other: await window
      .mockApi("author")
      .request("inventory", {}),
  }));

  expect(restored.wallet.balance).toBe(70);

  expect(restored.inventory.equipment.KEYBOARD).toBe(
    "keyboard-1",
  );

  expect(restored.other.products).toHaveLength(0);
});

test("another tab observes visibility revocation and stale edits without overwriting state", async ({
  page,
  context,
}) => {
  await load(page);

  const attemptId = await page.evaluate(
    async () =>
      (
        await window
          .mockApi("learner")
          .request("startAttempt", {
            quizId: "seed-quiz-1",
            context: "DIRECT",
          })
      ).attemptId,
  );

  const second = await context.newPage();

  await load(second);

  await second.evaluate(
    async ({ QuizStatus }) =>
      window.mockApi("author").request("visibility", {
        quizId: "seed-quiz-1",
        expectedVersion: 1,
        visibility: QuizStatus.PRIVATE,
      }),
    { QuizStatus },
  );

  const codes = await page.evaluate(
    async ({ attemptId, QuizStatus }) => {
      const errors: string[] = [];

      try {
        await window.mockApi("learner").request("answer", {
          attemptId,
          answer: {
            type: "SINGLE_CHOICE",
            choiceId: "a",
          },
        });
      } catch (error) {
        errors.push(
          (error as { detail: { code: string } }).detail
            .code,
        );
      }

      try {
        await window
          .mockApi("author")
          .request("visibility", {
            quizId: "seed-quiz-1",
            expectedVersion: 1,
            visibility: QuizStatus.PUBLIC,
          });
      } catch (error) {
        errors.push(
          (error as { detail: { code: string } }).detail
            .code,
        );
      }

      return errors;
    },
    { attemptId, QuizStatus },
  );

  expect(codes).toEqual([
    "QUIZ_UNAVAILABLE",
    "VERSION_CONFLICT",
  ]);
});
