import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { StreakSummary } from "@/components/streak/streak-summary";
import { createBrowserApi } from "@/api/browser";
import { ApiClientError } from "@/api/client";

jest.mock("@/api/browser");
const request = jest.fn();
const day = {
  timeZone: "Asia/Seoul",
  learningDate: "2026-01-02",
  completed: false,
  streak: 2,
  completedDates: ["2025-12-31", "2026-01-01"],
  dailyCounts: [
    { learningDate: "2025-12-31", count: 3 },
    { learningDate: "2026-01-01", count: 1 },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(createBrowserApi)
    .mockResolvedValue({ request });
  request.mockResolvedValue(day);
});

function setup(userId = "learner") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = (id: string) => (
    <QueryClientProvider client={client}>
      <StreakSummary userId={id} />
    </QueryClientProvider>
  );
  return { ...render(view(userId)), view, client };
}

test("keeps yesterday's streak and displays seven dated completion states across a year boundary", async () => {
  setup();
  expect(await screen.findByText("2일 연속")).toBeVisible();
  expect(
    screen.getByText("오늘 한 문제로 이어가요"),
  ).toBeVisible();
  expect(screen.getAllByRole("listitem")).toHaveLength(7);
  expect(
    screen.getByLabelText("2025-12-31 학습 완료, 3개"),
  ).toBeVisible();
  expect(
    screen.getByLabelText("2026-01-02 오늘 미완료, 0개"),
  ).toBeVisible();
  fireEvent.focus(
    screen.getByRole("button", {
      name: "학습일 기준 안내",
    }),
  );
  expect(screen.getByRole("tooltip")).toHaveTextContent(
    "Asia/Seoul 기준",
  );
});

test("does not show the previous user's data while the next user loads", async () => {
  const { rerender, view } = setup();
  await screen.findByText("2일 연속");
  request.mockImplementation(() => new Promise(() => {}));
  rerender(view("friend"));
  expect(
    screen.queryByText("2일 연속"),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent(
    "연속 학습 불러오는 중",
  );
});

test("shows a retryable error without inventing a zero streak", async () => {
  request.mockRejectedValueOnce(new Error("offline"));
  setup();
  expect(
    await screen.findByRole("alert"),
  ).toHaveTextContent("연속 학습을 불러오지 못했어요.");
  expect(
    screen.queryByText("0일 연속"),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "다시 시도" }),
  );
  expect(await screen.findByText("2일 연속")).toBeVisible();
});

test("distinguishes missing timezone from an empty learning history", async () => {
  request.mockRejectedValueOnce(
    new ApiClientError(409, {
      code: "TIMEZONE_REQUIRED",
      requestId: "streak-test",
      message: "학습 시간대를 설정하세요.",
    }),
  );
  setup();
  expect(
    await screen.findByRole("alert"),
  ).toHaveTextContent("학습 시간대를 확인할 수 없어요.");
  expect(
    screen.queryByText("0일 연속"),
  ).not.toBeInTheDocument();
});

test("returning learners keep their history and are invited to restart, not create a first record", async () => {
  request.mockResolvedValue({
    ...day,
    streak: 0,
    completedDates: ["2025-12-29"],
  });
  setup();
  expect(
    await screen.findByText("오늘부터 다시"),
  ).toBeVisible();
  expect(
    screen.queryByText("한 문제 풀고 첫 기록"),
  ).not.toBeInTheDocument();
  expect(
    screen.getByLabelText("2025-12-29 학습 완료, 0개"),
  ).toBeVisible();
});

test("shows daily unique counts including zero alongside the learning dates", async () => {
  setup();
  expect(await screen.findByText("3개")).toBeVisible();
  expect(screen.getByText("1개")).toBeVisible();
  expect(screen.getAllByText("0개")).toHaveLength(5);
});
