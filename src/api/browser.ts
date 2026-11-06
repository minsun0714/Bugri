import {
  createApiClient,
  type ApiClient,
} from "@/api/client";

/** Composition entry point for UI. Mock modules are loaded only when explicitly selected. */
export async function createBrowserApi(
  config:
    | {
        mode: "mock";
        userId: string;
        fallbackTimeZone?: string;
        dailyReward?: number;
      }
    | { mode: "http"; baseUrl?: string },
): Promise<ApiClient> {
  if (config.mode === "mock") {
    const { createMockTransport } =
      await import("@/mocks/adapter");

    return createApiClient(createMockTransport(config));
  }

  const { createHttpTransport } =
    await import("@/api/http");

  return createApiClient(createHttpTransport(config));
}
