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

test("browser generation → save → direct solve/replay survives reload", async ({
  page,
}) => {
  await load(page);

  const outcome = await page.evaluate(async () => {
    localStorage.clear();

    const owner = window.mockApi("author");

    const note = await owner.request("createNote", {
      content: "코드\n```ts\nconst x = 1;\n```",
    });

    const [created] = await owner.request("generate", {
      noteId: note.noteId,
    });

    const draft = await owner.request("confirmQuiz", {
      quizId: created.quizId,
      expectedVersion: created.version,
    });

    const first = await owner.request("startAttempt", {
      quizId: draft.quizId,
      context: "DIRECT",
    });

    await owner.request("answer", {
      attemptId: first.attemptId,
      answer: {
        type: "SINGLE_CHOICE",
        choiceId: "a",
      },
    });

    const replay = await owner.request("startAttempt", {
      quizId: draft.quizId,
      context: "DIRECT",
    });

    await owner.request("answer", {
      attemptId: replay.attemptId,
      answer: {
        type: "SINGLE_CHOICE",
        choiceId: "a",
      },
    });

    return {
      first,
      firstId: first.attemptId,
      replayId: replay.attemptId,
      day: await owner.request("learningDay", {}),
    };
  });

  expect(outcome.replayId).not.toBe(outcome.firstId);
  expect(outcome.day.completedDates).toHaveLength(1);

  expect(JSON.stringify(outcome.first)).not.toMatch(
    /"answer"|"explanation"|"sourceContent"/,
  );

  await page.reload();

  await page.addScriptTag({
    content: bundle,
  });

  const restored = await page.evaluate(async () => ({
    day: await window
      .mockApi("author")
      .request("learningDay", {}),
    other: await window
      .mockApi("friend")
      .request("learningDay", {}),
  }));

  expect(restored.day.completedDates).toHaveLength(1);
  expect(restored.other.completedDates).toHaveLength(0);
});

test("another tab observes quiz deletion and edits of the deleted quiz without overwriting state", async ({
  page,
  context,
}) => {
  await load(page);

  const attemptId = await page.evaluate(
    async () =>
      (
        await window
          .mockApi("author")
          .request("startAttempt", {
            quizId: "seed-quiz-1",
            context: "DIRECT",
          })
      ).attemptId,
  );

  const second = await context.newPage();

  await load(second);

  await second.evaluate(async () =>
    window.mockApi("author").request("deleteQuiz", {
      quizId: "seed-quiz-1",
    }),
  );

  const codes = await page.evaluate(
    async ({ attemptId }) => {
      const errors: string[] = [];

      try {
        await window.mockApi("author").request("answer", {
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
          .request("confirmQuiz", {
            quizId: "seed-quiz-1",
            expectedVersion: 1,
          });
      } catch (error) {
        errors.push(
          (error as { detail: { code: string } }).detail
            .code,
        );
      }

      return errors;
    },
    { attemptId },
  );

  expect(codes).toEqual(["QUIZ_UNAVAILABLE", "NOT_FOUND"]);
});
