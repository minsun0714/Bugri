import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Conversation } from "@/features/quiz-authoring/conversation";
import { AuthoringQueryProvider } from "@/features/quiz-authoring/query-provider";
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

beforeEach(() => {
  localStorage.clear();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

async function setup() {
  const api = createApiClient(
    createMockTransport({ userId: "learner" }),
  );
  const initialConversation = await api.request(
    "authoringConversation",
    {},
  );
  const onGenerated = jest.fn();
  render(
    <AuthoringQueryProvider>
      <Conversation
        api={api}
        userId="learner"
        initialConversation={initialConversation}
        onGenerated={onGenerated}
        onDirty={jest.fn()}
      />
    </AuthoringQueryProvider>,
  );
  return { api, onGenerated };
}

test("rejects empty and excessive input without truncation", async () => {
  await setup();
  fireEvent.click(
    screen.getByRole("button", { name: "보내기" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "입력하세요",
  );
  const text = "😀".repeat(10001);
  fireEvent.change(
    screen.getByRole("textbox", {
      name: /질문이나 학습 내용/,
    }),
    { target: { value: text } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "보내기" }),
  );
  expect(screen.getByRole("textbox")).toHaveValue(text);
  expect(
    screen.getByText("10,001 / 10,000자"),
  ).toBeVisible();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "10,000",
  );
});

test("messages stay in chat; only successful explicit generation navigates with the saved draft", async () => {
  const { api, onGenerated } = await setup();
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "클로저가 뭐야?" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "보내기" }),
  );
  await screen.findByText("클로저가 뭐야?");
  expect(onGenerated).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "작성 중인 질문" },
  });
  fireEvent.click(
    screen.getByRole("button", {
      name: "이 대화로 퀴즈 만들기",
    }),
  );
  await waitFor(() =>
    expect(onGenerated).toHaveBeenCalledTimes(1),
  );
  expect(
    (await api.request("authoringConversation", {})).draft,
  ).toBe("작성 중인 질문");
  expect(
    screen.queryByRole("region", { name: "생성 후보" }),
  ).not.toBeInTheDocument();
});

test("reply and generation failures keep input and conversation and do not navigate", async () => {
  const { api, onGenerated } = await setup();
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "HTTP 설명해줘" },
  });
  const request = jest
    .spyOn(api, "request")
    .mockRejectedValueOnce(new Error("답변 오류"));
  fireEvent.click(
    screen.getByRole("button", { name: "보내기" }),
  );
  await screen.findByText("답변 오류");
  expect(screen.getByRole("textbox")).toHaveValue(
    "HTTP 설명해줘",
  );
  request.mockRestore();
  fireEvent.click(
    screen.getByRole("button", { name: "보내기" }),
  );
  await screen.findByText("HTTP 설명해줘");
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "미전송" },
  });
  jest
    .spyOn(api, "request")
    .mockRejectedValueOnce(new Error("생성 오류"));
  fireEvent.click(
    screen.getByRole("button", {
      name: "이 대화로 퀴즈 만들기",
    }),
  );
  await screen.findByText("생성 오류");
  expect(screen.getByRole("textbox")).toHaveValue("미전송");
  expect(screen.getByText("HTTP 설명해줘")).toBeVisible();
  expect(onGenerated).not.toHaveBeenCalled();
});

test("closing and reopening the conversation preserves the unsent draft", async () => {
  await setup();
  expect(
    screen.getByRole("dialog", {
      name: "버그리와 퀴즈 만들기",
    }),
  ).toBeVisible();
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "아직 보내지 않은 질문" },
  });
  fireEvent.click(
    screen.getByRole("button", {
      name: "닫기",
    }),
  );
  expect(
    screen.queryByRole("dialog"),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", {
      name: "버그리와 대화하기",
    }),
  );
  expect(screen.getByRole("textbox")).toHaveValue(
    "아직 보내지 않은 질문",
  );
});
