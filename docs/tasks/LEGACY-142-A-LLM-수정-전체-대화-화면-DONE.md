### A · LLM 수정 전체 대화 화면 — DONE

- LLM 수정을 선택하면 작업 모달 본문을 대화 화면으로 전환하고 퀴즈로 돌아갈 때 요청 초안을 보존한다.
- 검증: 전환 동작 테스트의 의도한 실패를 확인한 뒤 관련 컴포넌트 7개와 작성 E2E 10개 통과. Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 80개·build·Playwright 15개). 독립 리뷰는 남아 있다.
