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

function openMonths() {
  fireEvent.click(
    screen.getByRole("button", {
      name: /월별 학습량 보기$/,
    }),
  );
}

test("defaults to this month with a date heading and no tabs", () => {
  render(<ActivityPeriods data={data} />);
  expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  expect(
    screen.getByRole("table", {
      name: "2026년 1월 학습 달력",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", { name: "다음 기간" }),
  ).toBeDisabled();
});

test("monthly calendar distinguishes completed, empty and future dates and returns to this month", () => {
  render(<ActivityPeriods data={data} />);
  expect(
    screen.getByRole("table", {
      name: "2026년 1월 학습 달력",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("cell", {
      name: "2026-01-01 학습 완료, 1개",
    }),
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
    screen.getByRole("cell", {
      name: "2025-12-31 학습 완료, 3개",
    }),
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
  openMonths();
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
    screen.getByRole("table", {
      name: "2025년 12월 학습 달력",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", {
      name: /월별 학습량 보기$/,
    }),
  ).toHaveFocus();
});

test("leap February has 29 dated cells and a changed current learning date updates a current view", () => {
  const { rerender } = render(
    <ActivityPeriods
      data={{ ...data, learningDate: "2024-02-29" }}
    />,
  );
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

test("empty history stays in the current month and year", () => {
  render(
    <ActivityPeriods
      data={{
        ...data,
        learningDate: "2026-06-15",
        completedDates: [],
        dailyCounts: [],
      }}
    />,
  );
  expect(
    screen.getByRole("button", { name: "이전 기간" }),
  ).toBeDisabled();
  openMonths();
  expect(
    screen.getByRole("button", { name: "이전 기간" }),
  ).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "2026년 5월, 0개" }),
  ).toBeDisabled();
  expect(
    screen.getByRole("button", {
      name: "2026년 6월, 0개, 월별 보기",
    }),
  ).toBeEnabled();
});

test("navigation stops at the earliest recorded month and year, including retained completion days", () => {
  render(
    <ActivityPeriods
      data={{
        ...data,
        learningDate: "2026-01-02",
        completedDates: ["2025-11-15", "2026-01-01"],
        dailyCounts: [
          { learningDate: "2025-12-01", count: 1 },
        ],
      }}
    />,
  );
  const previous = screen.getByRole("button", {
    name: "이전 기간",
  });
  fireEvent.click(previous);
  expect(previous).toBeEnabled();
  fireEvent.click(previous);
  expect(
    screen.getByRole("table", {
      name: "2025년 11월 학습 달력",
    }),
  ).toBeVisible();
  expect(previous).toBeDisabled();
  fireEvent.click(previous);
  expect(
    screen.getByRole("table", {
      name: "2025년 11월 학습 달력",
    }),
  ).toBeVisible();
  openMonths();
  fireEvent.click(
    screen.getByRole("button", { name: "이전 기간" }),
  );
  expect(
    screen.getByRole("button", { name: "이전 기간" }),
  ).toBeDisabled();
  expect(
    screen.getByRole("button", {
      name: "2025년 10월, 0개",
    }),
  ).toBeDisabled();
  fireEvent.click(
    screen.getByRole("button", {
      name: "2025년 11월, 0개, 월별 보기",
    }),
  );
  expect(
    screen.getByRole("button", { name: "이전 기간" }),
  ).toBeDisabled();
});

test("positive daily counts extend the boundary, while zero and future counts do not", () => {
  render(
    <ActivityPeriods
      data={{
        ...data,
        completedDates: [],
        dailyCounts: [
          { learningDate: "2024-01-01", count: 0 },
          { learningDate: "2025-12-31", count: 1 },
          { learningDate: "2027-01-01", count: 1 },
        ],
      }}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "이전 기간" }),
  );
  expect(
    screen.getByRole("table", {
      name: "2025년 12월 학습 달력",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", { name: "이전 기간" }),
  ).toBeDisabled();
});

test("date heading opens months then bounded years and returns focus after selection", () => {
  render(<ActivityPeriods data={data} />);
  expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", {
      name: "2026년 1월, 월별 학습량 보기",
    }),
  );
  fireEvent.click(
    screen.getByRole("combobox", {
      name: "2026년, 연도 선택",
    }),
  );
  expect(
    screen.getByRole("option", { name: "2024년" }),
  ).toBeVisible();
  expect(
    screen.queryByRole("option", { name: "2023년" }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("option", { name: "2024년" }),
  );
  expect(
    screen.getByRole("combobox", {
      name: "2024년, 연도 선택",
    }),
  ).toHaveFocus();
  fireEvent.click(
    screen.getByRole("button", {
      name: "2024년 2월, 2개, 월별 보기",
    }),
  );
  expect(
    screen.getByRole("table", {
      name: "2024년 2월 학습 달력",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", {
      name: "2024년 2월, 월별 학습량 보기",
    }),
  ).toHaveFocus();
});

test("a single-year selector overlays a compact menu without replacing monthly activity", () => {
  render(
    <ActivityPeriods
      data={{
        ...data,
        completedDates: [],
        dailyCounts: [],
      }}
    />,
  );
  openMonths();
  screen.getByRole("combobox").focus();
  fireEvent.click(
    screen.getByRole("combobox", {
      name: "2026년, 연도 선택",
    }),
  );
  expect(screen.getByRole("listbox")).toBeVisible();
  expect(screen.getAllByRole("option")).toHaveLength(1);
  expect(screen.getByText("총 0개")).toBeVisible();
  expect(
    screen.getByRole("button", {
      name: "2026년 1월, 0개, 월별 보기",
    }),
  ).toBeVisible();
  fireEvent.keyDown(screen.getByRole("combobox"), {
    key: "Escape",
  });
  expect(
    screen.queryByRole("listbox"),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("combobox")).toHaveFocus();
});
