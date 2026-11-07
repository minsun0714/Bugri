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
  expect(
    screen.queryByRole("link", { name: "검토·승인" }),
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
    if (index < 4)
      expect(
        screen.queryByRole("link", {
          name: "검토·승인",
        }),
      ).not.toBeInTheDocument();
  }
  expect(
    screen.getByRole("link", { name: "검토·승인" }),
  ).toBeVisible();
  const quizzes = await api.request("quizzes", {
    scope: QuizScope.OWN,
  });
  expect(quizzes).toHaveLength(4);
  expect(
    quizzes.every(({ status }) => status === "PENDING"),
  ).toBe(true);
});

test("deletes the current candidate and its saved quiz", async () => {
  const { api } = await setup();
  const confirm = jest
    .spyOn(window, "confirm")
    .mockReturnValue(true);

  fireEvent.click(
    screen.getByRole("button", { name: "임시저장" }),
  );
  await screen.findByText("임시저장됨");
  fireEvent.click(
    screen.getByRole("button", { name: "퀴즈 삭제" }),
  );

  await waitFor(() =>
    expect(
      screen.getAllByRole("tab", { name: /^퀴즈/ }),
    ).toHaveLength(3),
  );
  expect(
    await api.request("quizzes", { scope: QuizScope.OWN }),
  ).toHaveLength(0);
  expect(screen.getByRole("status")).toHaveTextContent(
    "퀴즈를 삭제했습니다.",
  );
  confirm.mockRestore();
});

test("detail refinement preserves input on failure and retry updates only the candidate", async () => {
  const { api } = await setup();
  fireEvent.click(
    screen.getByRole("button", { name: "LLM으로 수정" }),
  );
  const prompt =
    screen.getByLabelText("퀴즈 1에 추가 요청");
  const send = screen.getByRole("button", {
    name: "요청 보내기",
  });

  expect(send).not.toHaveTextContent("요청 보내기");
  expect(send.querySelector("svg")).toBeInTheDocument();

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

test("sends an LLM refinement with Enter and preserves Shift Enter", async () => {
  await setup();
  fireEvent.click(
    screen.getByRole("button", { name: "LLM으로 수정" }),
  );
  const prompt =
    screen.getByLabelText("퀴즈 1에 추가 요청");

  fireEvent.change(prompt, {
    target: { value: "첫 요청" },
  });
  fireEvent.keyDown(prompt, {
    key: "Enter",
    code: "Enter",
    shiftKey: true,
  });
  expect(
    screen.queryByRole("list", { name: "추가 요청 기록" }),
  ).not.toBeInTheDocument();

  fireEvent.change(prompt, {
    target: { value: "첫 요청\n두 번째 줄" },
  });
  fireEvent.keyDown(prompt, {
    key: "Enter",
    code: "Enter",
  });
  await screen.findByRole("list", {
    name: "추가 요청 기록",
  });
  expect(prompt).toHaveValue("");
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
  expect(
    await screen.findByRole("tab", {
      name: "퀴즈 1 · 공개됨",
    }),
  ).toBeVisible();
  expect(
    screen.getByText("공개됨", { exact: true }),
  ).toBeVisible();
  const list = await api.request("quizzes", {
    scope: QuizScope.OWN,
  });
  expect(list).toHaveLength(1);
  expect(list[0].status).toBe("PUBLIC");
});

test("keeps direct and LLM edits independent and applies the last confirmed change", async () => {
  await setup();
  expect(
    screen.queryByRole("tablist", { name: "수정 방식" }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "직접 수정" }),
  );
  expect(
    screen.getByRole("button", { name: "LLM으로 수정" }),
  ).toBeEnabled();
  expect(
    screen.queryByRole("list", { name: "선택지" }),
  ).not.toBeInTheDocument();
  fireEvent.change(
    screen.getByRole("textbox", { name: "제목" }),
    { target: { value: "임시 제목" } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "LLM으로 수정" }),
  );
  expect(
    screen.queryByText(
      "직접 수정한 내용이 아직 반영되지 않았습니다.",
    ),
  ).not.toBeInTheDocument();
  const prompt =
    screen.getByLabelText("퀴즈 1에 추가 요청");
  expect(prompt).toBeEnabled();
  fireEvent.change(prompt, {
    target: { value: "LLM으로도 수정" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "요청 보내기" }),
  );
  await screen.findByRole("list", {
    name: "추가 요청 기록",
  });
  fireEvent.click(
    screen.getByRole("button", { name: "퀴즈로 돌아가기" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "직접 수정" }),
  );
  expect(
    screen.getByRole("textbox", { name: "제목" }),
  ).toHaveValue("임시 제목");
  fireEvent.click(
    screen.getByRole("button", { name: "수정 반영" }),
  );
  expect(
    await screen.findByRole("heading", {
      name: "임시 제목",
    }),
  ).toBeVisible();
});

test("returns to the latest message when reopening LLM chat", async () => {
  const previous = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "scrollHeight",
  );
  Object.defineProperty(
    HTMLElement.prototype,
    "scrollHeight",
    {
      configurable: true,
      get: () => 800,
    },
  );

  try {
    await setup();
    fireEvent.click(
      screen.getByRole("button", { name: "LLM으로 수정" }),
    );
    const firstLog = screen.getByRole("log", {
      name: "대화 내용",
    });
    await waitFor(() =>
      expect(firstLog.scrollTop).toBe(800),
    );
    firstLog.scrollTop = 0;
    fireEvent.click(
      screen.getByRole("button", {
        name: "퀴즈로 돌아가기",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "LLM으로 수정" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("log", { name: "대화 내용" })
          .scrollTop,
      ).toBe(800),
    );
  } finally {
    if (previous)
      Object.defineProperty(
        HTMLElement.prototype,
        "scrollHeight",
        previous,
      );
    else
      delete (
        HTMLElement.prototype as { scrollHeight?: number }
      ).scrollHeight;
  }
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
