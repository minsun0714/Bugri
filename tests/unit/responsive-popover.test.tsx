import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { ResponsivePopover } from "@/components/ui/responsive-popover";

beforeEach(() => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: true,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
  HTMLDialogElement.prototype.show = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

test("desktop panel focuses its close control and Escape returns to trigger", () => {
  render(
    <ResponsivePopover label="설정" title="환경 설정">
      <button>저장</button>
    </ResponsivePopover>,
  );
  const trigger = screen.getByRole("button", {
    name: "설정",
  });
  fireEvent.click(trigger);
  expect(
    screen.getByRole("button", { name: "환경 설정 닫기" }),
  ).toHaveFocus();
  fireEvent.keyDown(screen.getByRole("dialog"), {
    key: "Escape",
  });
  expect(
    screen.queryByRole("dialog"),
  ).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test("mobile panel locks background scrolling and restores it on close", () => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
  render(
    <ResponsivePopover label="설정" title="환경 설정">
      <button>저장</button>
    </ResponsivePopover>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "설정" }),
  );
  expect(document.body.style.overflow).toBe("hidden");
  fireEvent.click(
    screen.getByRole("button", { name: "환경 설정 닫기" }),
  );
  expect(document.body.style.overflow).toBe("");
});
