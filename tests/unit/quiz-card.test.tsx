import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { QuizCard } from "@/components/ui/quiz-card";

test("quiz link and settings/reactions remain independent without an arrow or action text", () => {
  const open = jest.fn();
  const manage = jest.fn();
  const react = jest.fn();
  render(
    <QuizCard
      title="문제"
      action={{ href: "/solve?quiz=q", onClick: open }}
      settings={{ label: "문제 관리하기", onClick: manage }}
      footer={<button onClick={react}>좋아요</button>}
    />,
  );
  const link = screen.getByRole("link", { name: "문제" });
  const settings = screen.getByRole("button", {
    name: "문제 관리하기",
  });
  expect(link).toHaveAttribute("href", "/solve?quiz=q");
  expect(link).not.toContainElement(settings);
  expect(screen.queryByText("→")).not.toBeInTheDocument();
  expect(
    screen.queryByText("관리하기"),
  ).not.toBeInTheDocument();
  fireEvent.click(settings);
  fireEvent.click(
    screen.getByRole("button", { name: "좋아요" }),
  );
  expect(manage).toHaveBeenCalledTimes(1);
  expect(react).toHaveBeenCalledTimes(1);
  expect(open).not.toHaveBeenCalled();
});
