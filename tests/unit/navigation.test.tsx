import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  getBreadcrumbs,
  getNavigationItems,
} from "@/components/navigation/routes";

test("breadcrumbs identify the current page without exposing dynamic IDs", () => {
  render(
    <Breadcrumb
      items={getBreadcrumbs(
        "/my/learning/private-attempt-id",
        "friend",
      )}
    />,
  );
  expect(
    screen.getByRole("link", { name: "풀이 내역" }),
  ).toHaveAttribute("href", "/my/learning?user=friend");
  expect(screen.getByText("풀이 결과")).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(
    screen.queryByText("private-attempt-id"),
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
    member.find(({ label }) => label === "퀴즈 만들기")
      ?.href,
  ).toBe("/quizzes/authoring?user=friend");
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
    <HeaderNavigation
      pathname="/quizzes/authoring"
      userId={null}
    />,
  );
  expect(
    screen.queryByRole("link", { name: "내 퀴즈" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "퀴즈 만들기" }),
  ).toHaveAttribute("aria-current", "page");
  rerender(
    <HeaderNavigation
      pathname="/quizzes/authoring/results"
      userId="author"
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "내 메뉴" }),
  );
  expect(
    screen.getByRole("link", { name: "내 퀴즈" }),
  ).toHaveAttribute(
    "href",
    "/quizzes/authoring/manage?user=author",
  );
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

test.each(["/", "/solve", "/quizzes/authoring"])(
  "%s keeps a single header demo selector for members",
  async (pathname) => {
    const { HeaderNavigation } =
      await import("@/components/navigation/product-header");
    const onSignIn = jest.fn();
    render(
      <HeaderNavigation
        pathname={pathname}
        userId="learner"
        onSignIn={onSignIn}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "데모 사용자 선택",
      }),
    );
    expect(onSignIn).toHaveBeenCalledTimes(1);
    fireEvent.click(
      screen.getByRole("button", { name: "내 메뉴" }),
    );
    expect(
      screen.queryByRole("button", {
        name: "데모 사용자 전환",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("button", {
        name: "데모 사용자 선택",
      }),
    ).toHaveLength(1);
  },
);
