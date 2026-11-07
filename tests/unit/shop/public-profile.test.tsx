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

test("public profile links to public quizzes without exposing personal management", () => {
  render(<PublicDesk publicId="public-author" />);
  expect(
    screen.getByRole("heading", { name: "프로필" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "공개 퀴즈 보기" }),
  ).toHaveAttribute(
    "href",
    "/developers/public-author/quizzes?user=author",
  );
  for (const name of [
    "내 잔액",
    "내 데스크 편집",
    "보유 상품",
    "학습 기록",
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

test("only signed-in owner sees desk edit entry", () => {
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
    screen.getByRole("link", { name: "데스크 편집" }),
  ).toHaveAttribute("href", "/my/desk?user=author");
});
