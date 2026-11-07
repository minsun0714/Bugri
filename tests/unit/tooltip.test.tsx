import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { Tooltip } from "@/components/ui/tooltip";

test("help is hidden initially, opens on focus and closes with Escape", () => {
  render(
    <Tooltip label="저장 도움말">
      저장한 퀴즈만 목록에 표시됩니다.
    </Tooltip>,
  );
  const button = screen.getByRole("button", {
    name: "저장 도움말",
  });
  expect(
    screen.queryByRole("tooltip"),
  ).not.toBeInTheDocument();
  fireEvent.focus(button);
  expect(screen.getByRole("tooltip")).toHaveTextContent(
    "저장한 퀴즈만",
  );
  expect(button).toHaveAttribute(
    "aria-describedby",
    screen.getByRole("tooltip").id,
  );
  fireEvent.keyDown(document, { key: "Escape" });
  expect(
    screen.queryByRole("tooltip"),
  ).not.toBeInTheDocument();
});

test("tap opens help and tapping outside dismisses it", () => {
  render(<Tooltip label="저장 도움말">저장 안내</Tooltip>);
  fireEvent.click(
    screen.getByRole("button", { name: "저장 도움말" }),
  );
  expect(screen.getByRole("tooltip")).toBeVisible();
  fireEvent.pointerDown(document.body);
  expect(
    screen.queryByRole("tooltip"),
  ).not.toBeInTheDocument();
});
