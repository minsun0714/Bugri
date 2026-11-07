import { AuthoringQueryProvider } from "@/features/quiz-authoring/query-provider";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Generation } from "@/features/quiz-authoring/generation";
import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { QuizScope } from "@/api/constants";

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

async function setup() {
  const api = createApiClient(
    createMockTransport({ userId: "learner" }),
  );
  const initialBatch = await api.request("generate", {
    sourceContent: "학습\n```ts\n  const n = 1;\n```",
  });
  const onSaved = jest.fn();
  render(
    <AuthoringQueryProvider>
      <Generation
        api={api}
        initialBatch={initialBatch}
        onBatch={jest.fn()}
        onSaved={onSaved}
      />
    </AuthoringQueryProvider>,
  );
  return { api, onSaved };
}

test("detail saves each candidate individually without automatic approval", async () => {
  const { api, onSaved } = await setup();
  expect(
    await api.request("quizzes", { scope: QuizScope.OWN }),
  ).toHaveLength(0);
  expect(
    screen.getByRole("link", { name: "대화로 돌아가기" }),
  ).toHaveAttribute(
    "href",
    "/quizzes/authoring?user=learner",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "임시저장" }),
  );
  await waitFor(() =>
    expect(onSaved).toHaveBeenCalledTimes(1),
  );
  expect(
    screen.queryByRole("button", {
      name: "남은 후보 모두 저장",
    }),
  ).not.toBeInTheDocument();
  for (let index = 2; index <= 4; index += 1) {
    fireEvent.click(
      screen.getByRole("tab", { name: `퀴즈 ${index}` }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "임시저장" }),
    );
    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledTimes(index),
    );
  }
  const quizzes = await api.request("quizzes", {
    scope: QuizScope.OWN,
  });
  expect(quizzes).toHaveLength(4);
  expect(
    quizzes.every(({ status }) => status === "PENDING"),
  ).toBe(true);
});

test("detail refinement preserves input on failure and retry updates only the candidate", async () => {
  const { api } = await setup();
  fireEvent.click(
    screen.getByRole("button", { name: "LLM으로 수정" }),
  );
  const prompt =
    screen.getByLabelText("퀴즈 1에 추가 요청");
  fireEvent.change(prompt, {
    target: { value: "코드 예시를 추가해줘" },
  });
  const request = jest
    .spyOn(api, "request")
    .mockRejectedValueOnce(new Error("생성 실패"));
  fireEvent.click(
    screen.getByRole("button", { name: "요청 보내기" }),
  );
  await screen.findByText("생성 실패");
  expect(prompt).toHaveValue("코드 예시를 추가해줘");
  expect(
    screen.getByRole("heading", { name: "타입 선언" }),
  ).toBeVisible();
  request.mockRestore();
  fireEvent.click(
    screen.getByRole("button", { name: "요청 보내기" }),
  );
  await screen.findByRole("list", {
    name: "추가 요청 기록",
  });
  expect(prompt).toHaveValue("");
  expect(
    await api.request("quizzes", { scope: QuizScope.OWN }),
  ).toHaveLength(0);
});

test("starts with quizzes only and publishes the current candidate on explicit request", async () => {
  const { api } = await setup();
  expect(
    screen.queryByLabelText("퀴즈 1에 추가 요청"),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "바로 공개" }),
  );
  await screen.findByText("공개했습니다.");
  const list = await api.request("quizzes", {
    scope: QuizScope.OWN,
  });
  expect(list).toHaveLength(1);
  expect(list[0].status).toBe("PUBLIC");
});

test("keeps the quiz visible and preserves drafts when toggling editing areas", async () => {
  await setup();
  expect(
    screen.queryByRole("tablist", { name: "수정 방식" }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "LLM으로 수정" }),
  );
  fireEvent.change(
    screen.getByLabelText("퀴즈 1에 추가 요청"),
    { target: { value: "예시 추가" } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "LLM으로 수정" }),
  );
  expect(
    screen.queryByLabelText("퀴즈 1에 추가 요청"),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "직접 수정" }),
  );
  expect(
    screen.getByRole("button", { name: "LLM으로 수정" }),
  ).toBeEnabled();
  expect(
    screen.getByRole("list", { name: "선택지" }),
  ).toBeVisible();
  fireEvent.change(
    screen.getByRole("textbox", { name: "제목" }),
    { target: { value: "임시 제목" } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "직접 수정" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "직접 수정" }),
  );
  expect(
    screen.getByRole("textbox", { name: "제목" }),
  ).toHaveValue("임시 제목");
  fireEvent.click(
    screen.getByRole("button", { name: "수정 취소" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "LLM으로 수정" }),
  );
  expect(
    screen.getByLabelText("퀴즈 1에 추가 요청"),
  ).toHaveValue("예시 추가");
});

test("keeps separate unconfirmed edits across quiz tabs and only clears the applied draft", async () => {
  await setup();
  fireEvent.click(
    screen.getByRole("button", { name: "직접 수정" }),
  );
  fireEvent.change(
    screen.getByRole("textbox", { name: "제목" }),
    { target: { value: "첫 번째 임시 제목" } },
  );
  fireEvent.click(
    screen.getByRole("tab", { name: "퀴즈 2" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "직접 수정" }),
  );
  fireEvent.change(
    screen.getByRole("textbox", { name: "제목" }),
    { target: { value: "두 번째 임시 제목" } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "수정 반영" }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole("button", { name: "수정 반영" }),
    ).not.toBeInTheDocument(),
  );
  expect(
    screen.queryByRole("button", {
      name: "남은 후보 모두 저장",
    }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("tab", { name: "퀴즈 1" }),
  );
  expect(
    screen.getByRole("textbox", { name: "제목" }),
  ).toHaveValue("첫 번째 임시 제목");
});
