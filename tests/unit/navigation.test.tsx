import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  getBreadcrumbs,
  getNavigationItems,
} from "@/components/navigation/routes";

test("breadcrumbs identify the current page without exposing dynamic IDs", () => {
  render(
    <Breadcrumb
      items={getBreadcrumbs(
        "/developers/private-id/quizzes",
        "friend",
      )}
    />,
  );
  expect(
    screen.getByRole("link", { name: "탐색" }),
  ).toHaveAttribute("href", "/discover?user=friend");
  expect(screen.getByText("개발자 프로필")).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(
    screen.queryByText("private-id"),
  ).not.toBeInTheDocument();
});

test("home and unknown routes have no guessed breadcrumb", () => {
  expect(getBreadcrumbs("/", "learner")).toEqual([]);
  expect(
    getBreadcrumbs("/unregistered/private-id", "learner"),
  ).toEqual([]);
});

test("navigation preserves the demo identity and excludes personal destinations for visitors", () => {
  const member = getNavigationItems("friend");
  expect(
    member.find(({ label }) => label === "내 퀴즈")?.href,
  ).toBe("/quizzes/authoring/manage?user=friend");
  expect(
    getNavigationItems(null).some(
      ({ label }) => label === "내 퀴즈",
    ),
  ).toBe(false);
  expect(
    member.some(({ href }) => href.includes("attempt=")),
  ).toBe(false);
});

test("current breadcrumb is plain text while ancestors are links", () => {
  render(
    <Breadcrumb
      items={[
        { label: "홈", href: "/" },
        { label: "매우 긴 퀴즈 제목", href: "/ignored" },
      ]}
    />,
  );
  expect(
    screen.getByRole("link", { name: "홈" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("link", {
      name: "매우 긴 퀴즈 제목",
    }),
  ).not.toBeInTheDocument();
});

test("member and visitor headers expose only applicable links", async () => {
  const { HeaderNavigation } =
    await import("@/components/navigation/product-header");
  const { rerender } = render(
    <HeaderNavigation pathname="/discover" userId={null} />,
  );
  expect(
    screen.queryByRole("link", { name: "내 퀴즈" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "탐색" }),
  ).toHaveAttribute("aria-current", "page");
  rerender(
    <HeaderNavigation
      pathname="/quizzes/authoring/results"
      userId="author"
    />,
  );
  expect(
    screen.getByRole("link", { name: "내 퀴즈" }),
  ).toHaveAttribute("aria-current", "page");
  expect(
    screen.getByRole("link", { name: "Bugri 홈" }),
  ).toHaveAttribute("href", "/?user=author");
});

test("home is represented by the logo, not a duplicate menu item", () => {
  expect(
    getNavigationItems("learner").some(
      ({ label }) => label === "홈",
    ),
  ).toBe(false);
  expect(
    getNavigationItems(null).some(
      ({ label }) => label === "홈",
    ),
  ).toBe(false);
});
