import {
  renderHook,
  waitFor,
  act,
} from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useDeveloper } from "@/components/developer/queries";

const request = jest.fn();
jest.mock("@/api/browser", () => ({
  createBrowserApi: async () => ({ request }),
}));

function mount() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderHook(
    () =>
      useDeveloper(
        "friend",
        { publicId: "author", page: 1, pageSize: 20 },
        {
          publicId: "author",
          page: 1,
          pageSize: 50,
          query: "",
        },
        true,
      ),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>
          {children}
        </QueryClientProvider>
      ),
    },
  );
}

beforeEach(() => request.mockReset());

test.each([0, 50, 101])(
  "loads all %i tags without truncation, duplicates or changing API limits",
  async (total) => {
    const items = Array.from(
      { length: total },
      (_, index) => ({
        id: `tag-${index}`,
        name: `Tag ${index}`,
        quizCount: 1,
        subscribed: index % 2 === 0,
      }),
    );
    request.mockImplementation(async (operation, query) =>
      operation === "developerTags"
        ? {
            items: items.slice(
              (query.page - 1) * query.pageSize,
              query.page * query.pageSize,
            ),
            page: query.page,
            pageSize: query.pageSize,
            total,
          }
        : { items: [] },
    );
    const { result } = mount();
    await waitFor(() =>
      expect(result.current.tags.isSuccess).toBe(true),
    );
    expect(result.current.tags.data?.items).toEqual(items);
    const calls = request.mock.calls.filter(
      ([operation]) => operation === "developerTags",
    );
    expect(calls).toHaveLength(
      Math.max(1, Math.ceil(total / 50)),
    );
    expect(
      calls.every(
        ([, query]) =>
          query.pageSize === 50 && query.query === "",
      ),
    ).toBe(true);
  },
);

test("a later-page failure is not shown as a complete list and retry reloads all tags", async () => {
  let fail = true;
  request.mockImplementation(async (operation, query) => {
    if (operation !== "developerTags") return { items: [] };
    if (query.page === 2 && fail)
      throw new Error("page unavailable");
    return {
      items: Array.from(
        { length: query.page === 1 ? 50 : 1 },
        (_, index) => ({
          id: `tag-${(query.page - 1) * 50 + index}`,
        }),
      ),
      page: query.page,
      pageSize: 50,
      total: 51,
    };
  });
  const { result } = mount();
  await waitFor(() =>
    expect(result.current.tags.isError).toBe(true),
  );
  expect(result.current.tags.data).toBeUndefined();
  fail = false;
  await act(async () => {
    await result.current.tags.refetch();
  });
  await waitFor(() =>
    expect(result.current.tags.data?.items).toHaveLength(
      51,
    ),
  );
});
