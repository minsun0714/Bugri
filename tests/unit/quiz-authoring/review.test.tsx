import { AuthoringQueryProvider } from "@/features/quiz-authoring/query-provider";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { ReviewEditor } from "@/features/quiz-authoring/review-editor";
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

async function setup(index = 0) {
  const api = createApiClient(
    createMockTransport({ userId: "learner" }),
  );
  const { batchId } = await api.request("generate", {
    sourceContent: "원본\n```ts\n  const a = 1;\n```",
  });
  const quizzes = await api.request("saveBatch", {
    batchId,
    mode: "ALL",
  });
  const quiz = quizzes[index];
  const tags = await api.request("discoverHashtags", {});
  const onChanged = jest.fn();
  const onBack = jest.fn();
  render(
    <AuthoringQueryProvider>
      <ReviewEditor
        api={api}
        initialQuiz={quiz}
        tags={tags}
        onBack={onBack}
        onChanged={onChanged}
        onDeleted={jest.fn()}
        onDirty={jest.fn()}
      />
    </AuthoringQueryProvider>,
  );
  return { api, quiz, onBack, onChanged };
}

test("organizes review navigation, editing sections and action hierarchy", async () => {
  const { onBack } = await setup();

  fireEvent.click(
    screen.getByRole("button", {
      name: "내 퀴즈로 돌아가기",
    }),
  );
  expect(onBack).toHaveBeenCalledTimes(1);
  expect(
    screen.getByRole("group", { name: "위험 영역" }),
  ).toBeVisible();

  openEditor();

  for (const name of [
    "기본 정보",
    "문제 구성",
    "해설",
    "분류",
  ])
    expect(
      screen.getByRole("heading", { name }),
    ).toBeVisible();

  const actions = screen.getByRole("group", {
    name: "편집 작업",
  });

  expect(actions).toHaveTextContent("변경 사항 없음");
  expect(
    screen.getByRole("button", {
      name: "최신 내용 다시 불러오기",
    }),
  ).not.toHaveTextContent("최신 내용 다시 불러오기");
  expect(
    screen.queryByRole("group", { name: "위험 영역" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", {
      name: "#JavaScript 추가",
    }),
  ).toHaveTextContent("#JavaScript");
});

function openEditor() {
  fireEvent.click(
    screen.getByRole("button", { name: "직접 수정" }),
  );
}

test("preview-first approval reviews in one action and approved edits preserve the active revision", async () => {
  const { api, quiz } = await setup();
  const editActions = screen.getByRole("group", {
    name: "퀴즈 수정 방식",
  });

  expect(
    within(editActions).getByRole("button", {
      name: "직접 수정",
    }),
  ).toBeVisible();
  expect(
    within(editActions).getByRole("button", {
      name: "추가 프롬프트로 재생성",
    }),
  ).toBeVisible();
  expect(
    screen.queryByLabelText("제목"),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", {
      name: "검토 완료 저장",
    }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", {
      name: "승인",
    }),
  ).toBeDisabled();
  openEditor();
  fireEvent.change(screen.getByLabelText("제목"), {
    target: { value: "새 제목" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "수정 저장" }),
  );
  await screen.findByText(
    "내용을 저장했습니다. 저장된 내용을 다시 확인하세요.",
  );
  expect(
    screen.queryByLabelText("제목"),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("combobox", {
      name: "승인 공개 범위",
    }),
  );
  fireEvent.click(
    screen.getByRole("option", {
      name: "공개",
    }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "승인",
    }),
  );
  await screen.findByText("공개했습니다.");
  openEditor();
  fireEvent.change(screen.getByLabelText("제목"), {
    target: { value: "수정본 제목" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "수정 저장" }),
  );
  await screen.findByText(
    "내용을 저장했습니다. 저장된 내용을 다시 확인하세요.",
  );
  expect(
    screen.getByText("현재 공개본과 비교"),
  ).toBeVisible();
  expect(
    screen.getByText("새 제목", { exact: true }),
  ).not.toBeVisible();
  fireEvent.click(screen.getByText("현재 공개본과 비교"));
  expect(
    screen.getByText("새 제목", { exact: true }),
  ).toBeVisible();
  const result = await api.request("reviewQuiz", {
    quizId: quiz.quizId,
  });
  expect(result.active?.title).toBe("새 제목");
  expect(result.pending?.title).toBe("수정본 제목");
  expect(result.pending?.reviewed).toBe(false);
});

test("duplicate choices are rejected at the field and preserve edits", async () => {
  await setup();
  openEditor();
  fireEvent.change(screen.getByLabelText("선택지 2"), {
    target: { value: "number" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "수정 저장" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "선택지는 비어 있거나 중복될 수 없습니다",
  );
  expect(screen.getByLabelText("선택지 2")).toHaveValue(
    "number",
  );
});

test.each([1, 2, 3])(
  "supports answer editing for fixture %i",
  async (index) => {
    const { api, quiz, onChanged } = await setup(index);
    openEditor();
    if (index === 1)
      fireEvent.click(
        screen.getByLabelText("정답 선택지 3"),
      );
    if (index === 2)
      fireEvent.click(screen.getByLabelText("X"));
    if (index === 3)
      fireEvent.change(screen.getByLabelText("단답 정답"), {
        target: { value: "let" },
      });
    fireEvent.click(
      screen.getByRole("button", { name: "수정 저장" }),
    );
    await waitFor(() =>
      expect(onChanged).toHaveBeenCalled(),
    );
    const result = await api.request("reviewQuiz", {
      quizId: quiz.quizId,
    });
    expect(result.pending?.answer).toEqual(
      index === 1
        ? {
            type: "MULTIPLE_CHOICE",
            choiceIds: ["a", "b", "c"],
          }
        : index === 2
          ? { type: "TRUE_FALSE", value: false }
          : { type: "SHORT_ANSWER", text: "let" },
    );
  },
);

test("stale update preserves edits and reports conflict", async () => {
  const { api, quiz } = await setup();
  await api.request("updatePending", {
    quizId: quiz.quizId,
    expectedVersion: quiz.version,
    action: "MARK_REVIEWED",
  });
  openEditor();
  fireEvent.change(screen.getByLabelText("제목"), {
    target: { value: "유지할 편집" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "수정 저장" }),
  );
  await screen.findByText(/다른 탭에서 변경되었습니다/);
  expect(screen.getByLabelText("제목")).toHaveValue(
    "유지할 편집",
  );
});

test("regeneration failure preserves prompt and saved content; retry creates an unreviewed revision", async () => {
  const { api } = await setup();
  expect(
    screen.queryByLabelText("추가 프롬프트"),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", {
      name: "추가 프롬프트로 재생성",
    }),
  );
  expect(
    screen.getByRole("dialog", {
      name: "추가 프롬프트로 재생성",
    }),
  ).toBeVisible();
  fireEvent.change(screen.getByLabelText("추가 프롬프트"), {
    target: { value: "예시 추가" },
  });
  const request = jest
    .spyOn(api, "request")
    .mockRejectedValueOnce(new Error("생성 시간 초과"));
  fireEvent.click(
    screen.getByRole("button", { name: "수정본 재생성" }),
  );
  await screen.findByText("생성 시간 초과");
  expect(
    screen.getByLabelText("추가 프롬프트"),
  ).toHaveValue("예시 추가");
  expect(
    screen.getByRole("heading", { name: "타입 선언" }),
  ).toBeVisible();
  request.mockRestore();
  fireEvent.click(
    screen.getByRole("button", { name: "수정본 재생성" }),
  );
  await screen.findByText(
    "수정본을 생성했습니다. 내용을 검토하세요.",
  );
  expect(
    screen.queryByRole("dialog", {
      name: "추가 프롬프트로 재생성",
    }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", {
      name: "승인",
    }),
  ).toBeDisabled();
});

test("storage failure keeps unsaved content and does not report success", async () => {
  await setup();
  openEditor();
  fireEvent.change(screen.getByLabelText("제목"), {
    target: { value: "용량 오류에도 남길 제목" },
  });
  const storage = jest
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("quota");
    });
  fireEvent.click(
    screen.getByRole("button", { name: "수정 저장" }),
  );
  await screen.findByText(/STORAGE_UNAVAILABLE/);
  expect(screen.getByLabelText("제목")).toHaveValue(
    "용량 오류에도 남길 제목",
  );
  expect(
    screen.queryByText(
      "내용을 저장했습니다. 저장된 내용을 다시 확인하세요.",
    ),
  ).not.toBeInTheDocument();
  storage.mockRestore();
});
