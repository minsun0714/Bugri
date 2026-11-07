import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { DeveloperSubscriptionPanel } from "@/components/developer/subscription-panel";

const mockRequest = jest.fn(
  async (
    _operation: string,
    request: {
      page: number;
      pageSize: number;
      query: string;
    },
  ) => {
    const all = Array.from({ length: 6 }, (_, index) => ({
      id: `tag-${index}`,
      name: `Tag ${index}`,
      quizCount: 1,
      subscribed: false,
    })).filter(({ name }) => name.includes(request.query));
    return {
      items: all.slice(
        (request.page - 1) * request.pageSize,
        request.page * request.pageSize,
      ),
      total: all.length,
      page: request.page,
      pageSize: request.pageSize,
    };
  },
);
jest.mock("@/api/browser", () => ({
  createBrowserApi: async () => ({ request: mockRequest }),
}));
jest.mock("@/components/navigation/demo-session", () => ({
  useDemoSession: () => ({
    signedIn: true,
    signIn: jest.fn(),
  }),
}));

test("subscription pagination and search stay within the open panel", async () => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: true,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
  HTMLDialogElement.prototype.show = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DeveloperSubscriptionPanel
        userId="friend"
        publicId="bugri-author"
        authorUserId="author"
        subscribed={false}
      />
    </QueryClientProvider>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "구독 설정" }),
  );
  await screen.findByRole("switch", { name: "Tag 0 구독" });
  fireEvent.click(
    screen.getByRole("button", { name: "다음" }),
  );
  expect(
    await screen.findByRole("switch", {
      name: "Tag 5 구독",
    }),
  ).toBeVisible();
  expect(
    screen.queryByRole("switch", { name: "Tag 0 구독" }),
  ).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "Tag 1" },
  });
  expect(
    await screen.findByRole("switch", {
      name: "Tag 1 구독",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", { name: "이전" }),
  ).toBeDisabled();
  expect(
    screen.getByRole("dialog", { name: "구독 설정" }),
  ).toBeVisible();
  expect(mockRequest).toHaveBeenLastCalledWith(
    "developerTags",
    expect.objectContaining({
      page: 1,
      query: "Tag 1",
      publicId: "bugri-author",
    }),
  );
});
