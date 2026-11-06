import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Generation } from "@/features/quiz-authoring/generation";
import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => (
    <div>{children}</div>
  ),
}));
jest.mock("rehype-highlight", () => ({
  __esModule: true,
  default: () => {},
}));

beforeEach(() => localStorage.clear());

function setup() {
  const api = createApiClient(
    createMockTransport({ userId: "learner" }),
  );
  const onBatch = jest.fn();
  const onSaved = jest.fn();
  render(
    <Generation
      api={api}
      onBatch={onBatch}
      onSaved={onSaved}
    />,
  );
  return { api, onBatch, onSaved };
}

test("rejects blank and over-limit Unicode input without truncating it", () => {
  setup();
  fireEvent.change(
    screen.getByRole("textbox", { name: /학습 내용/ }),
    { target: { value: "  " } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "퀴즈 생성" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "학습 내용을 입력",
  );
  const source = "😀".repeat(10001);
  fireEvent.change(
    screen.getByRole("textbox", { name: /학습 내용/ }),
    { target: { value: source } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "퀴즈 생성" }),
  );
  expect(
    screen.getByRole("textbox", { name: /학습 내용/ }),
  ).toHaveValue(source);
  expect(
    screen.getByText("10,001 / 10,000자"),
  ).toBeVisible();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "10,000",
  );
});

test("generates candidates and saves one then all without duplicates", async () => {
  const { api, onSaved } = setup();
  fireEvent.change(
    screen.getByRole("textbox", { name: /학습 내용/ }),
    {
      target: {
        value: "타입스크립트\n```ts\n  const a = 1;\n```",
      },
    },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "퀴즈 생성" }),
  );
  const buttons = await screen.findAllByRole("button", {
    name: "개별 저장",
  });
  fireEvent.click(buttons[0]);
  await waitFor(() =>
    expect(onSaved).toHaveBeenCalledTimes(1),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "남은 후보 모두 저장",
    }),
  );
  await waitFor(() =>
    expect(onSaved).toHaveBeenCalledTimes(2),
  );
  const quizzes = await api.request("quizzes", {
    scope: "OWN",
  });
  expect(quizzes).toHaveLength(4);
  expect(
    quizzes.every(({ status }) => status === "PENDING"),
  ).toBe(true);
});

test("failed generation preserves source and allows retry", async () => {
  const api = {
    request: jest
      .fn()
      .mockRejectedValue(new Error("저장소 접근 실패")),
  };
  render(
    <Generation
      api={api}
      onBatch={jest.fn()}
      onSaved={jest.fn()}
    />,
  );
  fireEvent.change(
    screen.getByRole("textbox", { name: /학습 내용/ }),
    { target: { value: "유지할 내용" } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "퀴즈 생성" }),
  );
  expect(
    await screen.findByRole("alert"),
  ).toHaveTextContent("저장소 접근 실패");
  expect(
    screen.getByRole("textbox", { name: /학습 내용/ }),
  ).toHaveValue("유지할 내용");
  expect(
    screen.getByRole("button", { name: "퀴즈 생성" }),
  ).toBeEnabled();
});
