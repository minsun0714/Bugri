import { render, screen } from "@testing-library/react";
import { HomeSections } from "@/components/navigation/home-sections";

let signedIn = false;

jest.mock("@/components/landing/reward-desk", () => ({
  RewardDesk: () => <div>3D desk illustration</div>,
}));

jest.mock("@/components/navigation/demo-session", () => ({
  useDemoSession: () => ({ signedIn }),
}));

jest.mock("@/components/solving/solve-screen", () => ({
  SolveScreen: () => <button>답 제출</button>,
}));

test("visitors see the introduction above the existing quiz", () => {
  signedIn = false;
  render(<HomeSections />);
  expect(
    screen.queryByRole("link", { name: /바로 퀴즈 풀기/ }),
  ).not.toBeInTheDocument();
  expect(
    document.getElementById("guest-quiz"),
  ).toContainElement(
    screen.getByRole("button", { name: "답 제출" }),
  );
});

test("members keep direct access to learning without the landing", () => {
  signedIn = true;
  render(<HomeSections />);
  expect(
    screen.queryByRole("link", { name: /바로 퀴즈 풀기/ }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "답 제출" }),
  ).toBeInTheDocument();
});
