import { StrictMode, useState } from "react";
import {
  act,
  render,
  screen,
} from "@testing-library/react";
import { Modal } from "@/components/ui";

test("a queued close from effect cleanup does not dismiss a reopened modal", async () => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    if (!this.open) return;
    this.removeAttribute("open");
    setTimeout(
      () => this.dispatchEvent(new Event("close")),
      0,
    );
  };
  function Example() {
    const [open, setOpen] = useState(true);
    return (
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="작업"
      >
        <p>퀴즈</p>
      </Modal>
    );
  }
  render(
    <StrictMode>
      <Example />
    </StrictMode>,
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  expect(
    screen.getByRole("dialog", { name: "작업" }),
  ).toBeVisible();
});
