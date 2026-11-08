### A · 미처리 생성 후보 닫기 경고 — DONE

- 생성 모달에 임시저장·공개하지 않은 후보가 하나라도 있으면 닫기 버튼과 Escape에서 소실 경고를 표시한다. 취소하면 모달을 유지하고, 모든 후보를 임시저장·공개·삭제했으면 경고 없이 닫는다.
- 공통 Modal의 cancel 기본 닫기를 막아 호출부가 닫기를 거부할 수 있게 했다. 의도한 경고 미호출 실패를 확인했고, Node 22.23.3 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 20 suites/86 tests·production build·Playwright 16 tests. 독립 리뷰는 남아 있다.

