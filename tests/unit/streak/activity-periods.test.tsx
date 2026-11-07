import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { ActivityPeriods } from "@/components/streak/activity-periods";
import type { LearningDay } from "@/api/contracts";

const data: LearningDay = {
  learningDate: "2026-01-02",
  timeZone: "Asia/Seoul",
  completed: false,
  streak: 2,
  completedDates: ["2025-12-31", "2026-01-01"],
  dailyCounts: [
    { learningDate: "2024-02-29", count: 2 },
    { learningDate: "2025-12-30", count: 2 },
    { learningDate: "2025-12-31", count: 3 },
    { learningDate: "2026-01-01", count: 1 },
  ],
};

function tab(name: string) {
  fireEvent.click(screen.getByRole("tab", { name }));
}

test("defaults to seven days and navigates across a year boundary without offering future periods", () => {
  render(<ActivityPeriods data={data} />);
  expect(
    screen.getByRole("tab", { name: "7일" }),
  ).toHaveAttribute("aria-selected", "true");
  expect(screen.getAllByRole("listitem")).toHaveLength(7);
  expect(
    screen.getByRole("button", { name: "다음 기간" }),
  ).toBeDisabled();
  fireEvent.click(
    screen.getByRole("button", { name: "이전 기간" }),
  );
  expect(
    screen.getByLabelText("2025-12-26 미완료, 0개"),
  ).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "현재 기간" }),
  );
  expect(
    screen.getByLabelText("2026-01-02 오늘 미완료, 0개"),
  ).toBeVisible();
});

test("monthly calendar distinguishes completed, empty and future dates and returns to this month", () => {
  render(<ActivityPeriods data={data} />);
  tab("월");
  expect(
    screen.getByRole("table", {
      name: "2026년 1월 학습 달력",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("cell", { name: "2026-01-01, 1개" }),
  ).toBeVisible();
  expect(
    screen.getByRole("cell", {
      name: "2026-01-02 오늘, 0개",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("cell", { name: "2026-01-03, 예정" }),
  ).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "이전 기간" }),
  );
  expect(
    screen.getByRole("cell", { name: "2025-12-31, 3개" }),
  ).toBeVisible();
  expect(screen.getByText("총 5개")).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "현재 기간" }),
  );
  expect(
    screen.getByRole("table", {
      name: "2026년 1월 학습 달력",
    }),
  ).toBeVisible();
});

test("year aggregates daily counts, blocks future months and opens a selected month", () => {
  render(<ActivityPeriods data={data} />);
  tab("년");
  expect(
    screen.getByRole("button", {
      name: "2026년 1월, 1개, 월별 보기",
    }),
  ).toBeEnabled();
  expect(
    screen.getByRole("button", {
      name: "2026년 2월, 예정",
    }),
  ).toBeDisabled();
  fireEvent.click(
    screen.getByRole("button", { name: "이전 기간" }),
  );
  expect(screen.getByText("총 5개")).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", {
      name: "2025년 12월, 5개, 월별 보기",
    }),
  );
  expect(
    screen.getByRole("tab", { name: "월" }),
  ).toHaveAttribute("aria-selected", "true");
  expect(
    screen.getByRole("table", {
      name: "2025년 12월 학습 달력",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("tab", { name: "월" }),
  ).toHaveFocus();
});

test("leap February has 29 dated cells and a changed current learning date updates a current view", () => {
  const { rerender } = render(
    <ActivityPeriods
      data={{ ...data, learningDate: "2024-02-29" }}
    />,
  );
  tab("월");
  const calendar = screen.getByRole("table");
  expect(
    within(calendar).getByRole("cell", {
      name: "2024-02-29 오늘, 2개",
    }),
  ).toBeVisible();
  expect(
    within(calendar).queryByRole("cell", {
      name: /2024-02-30/,
    }),
  ).not.toBeInTheDocument();
  rerender(
    <ActivityPeriods
      data={{ ...data, learningDate: "2024-03-01" }}
    />,
  );
  expect(
    screen.getByRole("table", {
      name: "2024년 3월 학습 달력",
    }),
  ).toBeVisible();
});
