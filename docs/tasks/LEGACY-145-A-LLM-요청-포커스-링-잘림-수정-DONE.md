### A · LLM 요청 포커스 링 잘림 수정 — DONE

- 공통 7px 포커스 외곽선이 실제 overflow 부모의 좌우·하단 경계 안에 들어오도록 입력 영역 여백을 보정한다.
- 검증: 실제 overflow 부모 경계 E2E의 의도한 실패를 확인한 뒤 관련 E2E 1개 통과. Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 80개·build·Playwright 15개). 독립 리뷰는 남아 있다.

