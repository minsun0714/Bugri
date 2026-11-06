import type {
  ApiTransport,
  ErrorBody,
  Operation,
  Request,
  Response,
} from "./contracts";
export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly detail: ErrorBody["error"],
  ) {
    super(detail.message);
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
      const result = await transport.request(operation, request);
      if ("error" in result.body)
        throw new ApiClientError(result.status, result.body.error);
      return result.body.data;
    },
  };
}
export type ApiClient = ReturnType<typeof createApiClient>;
