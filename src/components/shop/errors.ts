import { ApiClientError } from "@/api/client";

export function errorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    const messages: Record<string, string> = {
      INSUFFICIENT_BALANCE:
        "BugCoin이 부족해요. 다른 상품을 골라보세요.",
      ALREADY_OWNED: "이미 보관함에 있는 상품이에요.",
      STORAGE_UNAVAILABLE:
        "저장 공간에 접근할 수 없어요. 브라우저 설정을 확인하고 다시 시도해 주세요.",
      STORAGE_CORRUPT:
        "저장된 데이터를 읽을 수 없어요. 기존 데이터는 보존했어요.",
    };
    return messages[error.detail.code] ?? error.message;
  }
  return "불러오지 못했어요. 잠시 후 다시 시도해 주세요.";
}
