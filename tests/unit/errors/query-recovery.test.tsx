import { useState } from "react";
import {
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ApiClientError } from "@/api/client";
import { createQueryClient } from "@/api/query-client";
import {
  getErrorMessage,
  shouldThrowQueryError,
} from "@/api/errors";
import { QueryBoundary } from "@/components/errors/query-boundary";

const failure = new ApiClientError(503, {
  code: "SERVER_ERROR",
  message: "private answer source",
  requestId: "req-1",
});

beforeEach(() =>
  jest.spyOn(console, "error").mockImplementation(() => {}),
);
afterEach(() => jest.restoreAllMocks());

test("initial query failure stays local and retry resets Query and the boundary", async () => {
  const request = jest
    .fn()
    .mockRejectedValueOnce(failure)
    .mockResolvedValue("복구된 영역");
  function Content() {
    const query = useQuery<string>({
      queryKey: ["preview"],
      queryFn: request,
      throwOnError: shouldThrowQueryError,
    });
    return <p>{query.data ?? "불러오는 중"}</p>;
  }
  render(
    <QueryClientProvider client={createQueryClient()}>
      <h1>미리보기</h1>
      <QueryBoundary title="미리보기 영역을 불러오지 못했습니다">
        <Content />
      </QueryBoundary>
    </QueryClientProvider>,
  );
  expect(
    await screen.findByRole("alert"),
  ).toHaveTextContent(
    "미리보기 영역을 불러오지 못했습니다",
  );
  expect(
    screen.getByRole("heading", { name: "미리보기" }),
  ).toBeVisible();
  expect(
    screen.queryByText(/private/),
  ).not.toBeInTheDocument();
  expect(request).toHaveBeenCalledTimes(1);
  fireEvent.click(
    screen.getByRole("button", { name: "다시 시도" }),
  );
  expect(
    await screen.findByText("복구된 영역"),
  ).toBeVisible();
  expect(request).toHaveBeenCalledTimes(2);
});

test("expected 404 and background refresh errors do not replace content with a boundary", () => {
  const missing = new ApiClientError(404, {
    code: "NOT_FOUND",
    message: "private",
    requestId: "req-2",
  });
  expect(
    shouldThrowQueryError(missing, {
      state: { data: undefined },
    }),
  ).toBe(false);
  expect(
    shouldThrowQueryError(failure, {
      state: { data: { preview: true } },
    }),
  ).toBe(false);
  expect(getErrorMessage(missing)).toBe(
    "요청한 정보를 찾을 수 없습니다.",
  );
});

test("failed mutations retain input and never automatically resend", async () => {
  const request = jest.fn().mockRejectedValue(failure);
  function Form() {
    const [answer, setAnswer] = useState("");
    const mutation = useMutation({ mutationFn: request });
    return (
      <>
        <input
          aria-label="답안"
          value={answer}
          onChange={(event) =>
            setAnswer(event.target.value)
          }
        />
        <button onClick={() => mutation.mutate(answer)}>
          제출
        </button>
        {mutation.error && (
          <p role="alert">
            {getErrorMessage(mutation.error)}
          </p>
        )}
      </>
    );
  }
  render(
    <QueryClientProvider client={createQueryClient()}>
      <Form />
    </QueryClientProvider>,
  );
  fireEvent.change(screen.getByLabelText("답안"), {
    target: { value: "작성한 답안" },
  });
  fireEvent.click(screen.getByText("제출"));
  await screen.findByRole("alert");
  expect(screen.getByLabelText("답안")).toHaveValue(
    "작성한 답안",
  );
  expect(request).toHaveBeenCalledTimes(1);
  await waitFor(() =>
    expect(console.error).toHaveBeenCalledWith(
      "Bugri request failed",
      {
        status: 503,
        code: "SERVER_ERROR",
        requestId: "req-1",
      },
    ),
  );
});
