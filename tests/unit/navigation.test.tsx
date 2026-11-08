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
    member.find(({ label }) => label === "내 노트")?.href,
  ).toBe("/notes?user=friend");

  expect(
    member.some(({ label }) => label === "퀴즈 만들기"),
  ).toBe(false);
  expect(
    getNavigationItems(null).some(
      ({ label }) => label === "내 퀴즈",
    ),
  ).toBe(false);
  expect(
    member.some(({ label }) => label === "내 퀴즈"),
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
    <HeaderNavigation pathname="/notes" userId={null} />,
  );
  expect(
    screen.getByRole("link", { name: "내 노트" }),
  ).toHaveAttribute("aria-current", "page");
  expect(
    screen.queryByRole("link", { name: "퀴즈 만들기" }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "내 메뉴" }),
  );
  expect(
    screen.queryByRole("link", { name: "풀이 내역" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", {
      name: "데모 사용자 선택",
    }),
  ).toBeInTheDocument();
  rerender(
    <HeaderNavigation pathname="/notes" userId="author" />,
  );
  expect(
    screen.getByRole("link", { name: "내 노트" }),
  ).toHaveAttribute("href", "/notes?user=author");
  expect(
    screen.queryByRole("link", { name: "내 퀴즈" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "풀이 내역" }),
  ).toHaveAttribute("href", "/my/learning?user=author");
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
  "%s keeps a single demo selector inside the profile menu",
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
    expect(
      screen.queryByRole("button", {
        name: "데모 사용자 선택",
      }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "내 메뉴" }),
    );
    expect(
      screen.getAllByRole("button", {
        name: "데모 사용자 선택",
      }),
    ).toHaveLength(1);
    fireEvent.click(
      screen.getByRole("button", {
        name: "데모 사용자 선택",
      }),
    );
    expect(onSignIn).toHaveBeenCalledTimes(1);
  },
);

test("header has one row: logo, notes, language, theme and profile menu on every width", async () => {
  const { HeaderNavigation } =
    await import("@/components/navigation/product-header");
  render(
    <HeaderNavigation pathname="/" userId="learner" />,
  );
  expect(
    screen.queryByRole("button", { name: "메뉴 열기" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Bugri 홈" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "내 노트" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", {
      name: "다크 모드로 전환",
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "내 메뉴" }),
  ).toBeInTheDocument();
});

test("notes routes have breadcrumbs without exposing note IDs", () => {
  expect(getBreadcrumbs("/notes", "learner")).toEqual([
    { label: "홈", href: "/?user=learner" },
    { label: "내 노트" },
  ]);
  expect(
    getBreadcrumbs("/notes/note-secret", "learner"),
  ).toEqual([
    { label: "홈", href: "/?user=learner" },
    { label: "내 노트", href: "/notes?user=learner" },
    { label: "메모" },
  ]);
});
