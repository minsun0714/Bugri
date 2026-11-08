import { ApiClientError } from "@/api/client";
import type { ErrorCode } from "@/api/contracts";

export class InputValidationError extends Error {}

const messages: Record<ErrorCode, string> = {
  VALIDATION_ERROR: "입력 내용을 확인해 주세요.",
  NOT_FOUND: "요청한 정보를 찾을 수 없습니다.",
  FORBIDDEN: "이 사용자로는 접근할 수 없습니다.",
  VERSION_CONFLICT:
    "내용이 변경되었습니다. 최신 내용을 확인해 주세요.",
  QUIZ_UNAVAILABLE: "이 퀴즈는 더 이상 이용할 수 없습니다.",
  ALREADY_ANSWERED:
    "이미 제출한 풀이입니다. 저장된 결과를 확인해 주세요.",
  TIMEZONE_REQUIRED:
    "학습 시간대를 확인할 수 없습니다. 브라우저 시간대 설정을 확인해 주세요.",
  STORAGE_UNAVAILABLE:
    "저장 공간에 접근할 수 없어요. 브라우저 설정을 확인하고 다시 시도해 주세요.",
  STORAGE_CORRUPT:
    "저장된 데이터를 읽을 수 없어요. 기존 데이터는 보존했어요.",
  GENERATION_FAILED:
    "퀴즈를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  INVALID_RESPONSE:
    "응답을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  NETWORK_ERROR:
    "연결하지 못했습니다. 네트워크 연결을 확인해 주세요.",
  REQUEST_TIMEOUT:
    "응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
  SERVER_ERROR:
    "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  HTTP_ERROR:
    "요청을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

export function getErrorMessage(error: unknown) {
  if (error instanceof InputValidationError)
    return error.message;

  if (!(error instanceof ApiClientError))
    return messages.HTTP_ERROR;

  const {
    status,
    detail: { code },
  } = error;

  // Local storage failures use 503 too, but need a specific recovery action.
  if (
    code === "STORAGE_CORRUPT" ||
    code === "STORAGE_UNAVAILABLE" ||
    code === "NETWORK_ERROR" ||
    code === "REQUEST_TIMEOUT"
  )
    return messages[code];

  if (status >= 500) return messages.SERVER_ERROR;

  if (status === 404) return messages.NOT_FOUND;

  if (status === 403) return messages.FORBIDDEN;

  return Object.hasOwn(messages, code)
    ? messages[code]
    : messages.HTTP_ERROR;
}

export function shouldThrowQueryError(
  error: unknown,
  query: { state: { data: unknown } },
) {
  if (query.state.data !== undefined) return false;

  if (!(error instanceof ApiClientError)) return true;

  const {
    status,
    detail: { code },
  } = error;

  return (
    status >= 500 &&
    code !== "STORAGE_CORRUPT" &&
    code !== "STORAGE_UNAVAILABLE"
  );
}

/** Never log error messages, query keys, request variables, answers or source content. */
export function reportRequestError(error: unknown) {
  if (!(error instanceof ApiClientError)) {
    console.error("Bugri request failed", {
      code: "UNEXPECTED_ERROR",
    });

    return;
  }

  const {
    status,
    detail: { code, requestId },
  } = error;

  console.error("Bugri request failed", {
    status,
    code: Object.hasOwn(messages, code)
      ? code
      : "HTTP_ERROR",
    requestId: /^[a-zA-Z0-9._-]{1,128}$/.test(requestId)
      ? requestId
      : undefined,
  });
}
