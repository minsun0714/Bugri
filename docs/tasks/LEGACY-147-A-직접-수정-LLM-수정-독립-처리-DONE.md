### A · 직접 수정·LLM 수정 독립 처리 — DONE

- 미반영 직접 수정 초안이 있어도 LLM 요청을 허용하고 두 초안을 독립적으로 유지한다. 마지막으로 성공한 반영 결과를 현재 후보로 사용한다.
- 검증: 직접 수정 초안 중 LLM 입력·요청과 마지막 직접 수정 반영 테스트의 의도한 실패를 확인한 뒤 작성 컴포넌트 7개와 관련 E2E 1개 통과. Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 80개·build·Playwright 15개). 독립 리뷰는 남아 있다.
