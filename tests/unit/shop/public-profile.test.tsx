import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import {
  DemoSessionProvider,
  useDemoSession,
} from "@/components/navigation/demo-session";
import { PublicDesk } from "@/components/shop/public-desk";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("user=author"),
}));

jest.mock(
  "@/components/developer/developer-screen",
  () => ({
    DeveloperScreen: ({
      afterHeader,
    }: {
      afterHeader: React.ReactNode;
    }) => (
      <div>
        {afterHeader}
        <section aria-label="개발자의 공개 퀴즈">
          <h1>개발자</h1>
        </section>
      </div>
    ),
  }),
);

jest.mock("@/components/shop/three-view", () => ({
  ThreeView: () => <div />,
}));

jest.mock("@/components/navigation/product-layout", () => ({
  ProductLayout: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <main>{children}</main>,
}));
jest.mock("@/components/shop/use-shop", () => ({
  usePublicDesk: () => ({
    isPending: false,
    data: {
      user: {
        userId: "author",
        publicId: "public-author",
        displayName: "개발자",
      },
      equipment: {},
      transforms: {},
      order: [],
    },
  }),
}));

test("public profile places the desk before quizzes without exposing personal management", () => {
  render(<PublicDesk publicId="public-author" />);
  expect(
    screen.getByRole("heading", { name: "학습 활동" }),
  ).toBeInTheDocument();
  const quizzes = screen.getByRole("region", {
    name: "개발자의 공개 퀴즈",
  });
  const desk = screen.getByRole("region", {
    name: "공개 데스크",
  });
  expect(
    desk.compareDocumentPosition(quizzes) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  for (const name of [
    "내 잔액",
    "내 데스크 편집",
    "보유 상품",
    "풀이 기록",
    "BugCoin 내역",
    "학습 시간대 설정",
  ]) {
    expect(
      screen.queryByText(name),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(name),
    ).not.toBeInTheDocument();
  }
});

function Login() {
  const { signIn } = useDemoSession();
  return <button onClick={signIn}>로그인</button>;
}

test("public desk has no edit entry even for signed-in owner", () => {
  render(
    <DemoSessionProvider>
      <Login />
      <PublicDesk publicId="public-author" />
    </DemoSessionProvider>,
  );
  expect(
    screen.queryByRole("link", { name: "데스크 편집" }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "로그인" }),
  );
  expect(
    screen.queryByRole("link", { name: "데스크 편집" }),
  ).not.toBeInTheDocument();
});
