import {
  MutationCache,
  QueryCache,
  QueryClient,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { reportRequestError } from "@/api/errors";

export function createQueryClient(
  config: QueryClientConfig = {},
) {
  return new QueryClient({
    ...config,
    queryCache: new QueryCache({
      onError: reportRequestError,
    }),
    mutationCache: new MutationCache({
      onError: reportRequestError,
    }),
    defaultOptions: {
      ...config.defaultOptions,
      queries: {
        retry: false,
        ...config.defaultOptions?.queries,
      },
      mutations: {
        retry: false,
        throwOnError: false,
        ...config.defaultOptions?.mutations,
      },
    },
  });
}
