import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ApiClient } from "@/api/client";
import type {
  Operation,
  Request,
  Response,
} from "@/api/contracts";

export const authoringKey = (userId: string) =>
  ["quiz-authoring", userId] as const;

type ReadOperation =
  | "authoringConversation"
  | "quizzes"
  | "generationBatch"
  | "reviewQuiz"
  | "discoverHashtags";

type Command = {
  [K in Operation]: { operation: K; input: Request<K> };
}[Operation];

export function useAuthoringQuery<K extends ReadOperation>(
  api: ApiClient | undefined,
  userId: string,
  operation: K,
  input: Request<K>,
  enabled = true,
) {
  return useQuery({
    queryKey: [...authoringKey(userId), operation, input],
    queryFn: () => api!.request(operation, input),
    enabled: !!api && enabled,
  });
}

/** All author mutations invalidate owner lists, batches and review details together. */
export function useAuthoringActions(
  api: ApiClient,
  userId: string,
): ApiClient {
  const cache = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ operation, input }: Command) =>
      api.request(operation, input),
    onSuccess: () =>
      cache.invalidateQueries({
        queryKey: authoringKey(userId),
      }),
  });

  return {
    async request<K extends Operation>(
      operation: K,
      input: Request<K>,
    ): Promise<Response<K>> {
      if (
        [
          "authoringConversation",
          "reviewQuiz",
          "generationBatch",
          "quizzes",
          "discoverHashtags",
        ].includes(operation)
      ) {
        return cache.fetchQuery({
          queryKey: [
            ...authoringKey(userId),
            operation,
            input,
          ],
          queryFn: () => api.request(operation, input),
          staleTime: 0,
        });
      }
      return (await mutateAsync({
        operation,
        input,
      } as Command)) as Response<K>;
    },
  };
}
