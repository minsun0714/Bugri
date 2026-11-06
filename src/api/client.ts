import type {
  ApiTransport,
  ErrorBody,
  Operation,
  Request,
  Response,
} from "@/api/contracts";

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly detail: ErrorBody["error"],
  ) {
    const { message } = detail;

    super(message);
    this.name = "ApiClientError";
  }
}

/** UI depends on this boundary and contracts, never on mock seeds/storage. */
export function createApiClient(transport: ApiTransport) {
  return {
    async request<K extends Operation>(
      operation: K,
      request: Request<K>,
    ): Promise<Response<K>> {
      const { status, body } = await transport.request(
        operation,
        request,
      );

      if ("error" in body) {
        const { error } = body;

        throw new ApiClientError(status, error);
      }

      const { data } = body;

      return data;
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
