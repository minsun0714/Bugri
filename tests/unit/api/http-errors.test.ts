import { createApiClient } from "@/api/client";
import { createHttpTransport } from "@/api/http";

test.each([404, 500, 502, 503])(
  "non-JSON HTTP %s preserves its status without exposing a proxy body",
  async (status) => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: false,
      status,
      json: async () => {
        throw new SyntaxError("private proxy page");
      },
    });

    const api = createApiClient(
      createHttpTransport({ fetch: fetcher }),
    );

    await expect(
      api.request("learningDay", {}),
    ).rejects.toMatchObject({
      status,
      detail: {
        code: status === 404 ? "NOT_FOUND" : "SERVER_ERROR",
      },
    });
  },
);

test("network rejection stays distinct from an HTTP response", async () => {
  const api = createApiClient(
    createHttpTransport({
      fetch: jest
        .fn()
        .mockRejectedValue(
          new TypeError("private hostname"),
        ),
    }),
  );

  await expect(
    api.request("learningDay", {}),
  ).rejects.toMatchObject({
    detail: {
      code: "NETWORK_ERROR",
      message: "API 연결에 실패했습니다.",
    },
  });
});

test("the request timeout also covers a stalled response body and aborts the request", async () => {
  jest.useFakeTimers();

  let signal: AbortSignal | undefined;

  const fetcher = jest.fn(async (_url, options) => {
    signal = options.signal;

    return {
      ok: true,
      status: 200,
      json: () =>
        new Promise((_resolve, reject) =>
          signal?.addEventListener("abort", () =>
            reject(new Error("aborted")),
          ),
        ),
    };
  });

  const api = createApiClient(
    createHttpTransport({
      fetch: fetcher as unknown as typeof fetch,
      timeoutMs: 100,
    }),
  );

  const result = expect(
    api.request("learningDay", {}),
  ).rejects.toMatchObject({
    status: 504,
    detail: { code: "REQUEST_TIMEOUT" },
  });

  await jest.advanceTimersByTimeAsync(100);
  await result;
  expect(signal?.aborted).toBe(true);
  expect(jest.getTimerCount()).toBe(0);
  jest.useRealTimers();
});

test("successful requests clear their timeout", async () => {
  jest.useFakeTimers();

  const fetcher = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      data: { balance: 10, ledger: [] },
    }),
  });

  const api = createApiClient(
    createHttpTransport({ fetch: fetcher }),
  );

  await expect(
    api.request("learningDay", {}),
  ).resolves.toMatchObject({ balance: 10 });

  expect(jest.getTimerCount()).toBe(0);
  jest.useRealTimers();
});
