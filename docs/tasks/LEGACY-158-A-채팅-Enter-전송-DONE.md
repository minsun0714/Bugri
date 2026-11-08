### A · 채팅 Enter 전송 — DONE

- 최초 학습 대화와 퀴즈 LLM 수정 textarea에서 Enter는 전송하고 Shift+Enter는 줄바꿈으로 동작한다. 한글 등 IME 조합 중 Enter는 전송하지 않으며 기존 전송 버튼도 유지한다.
- 두 채팅의 키보드 단위 테스트와 실제 브라우저의 Enter·Shift+Enter 흐름을 추가했다. Node 22.23.3 `PLAYWRIGHT_PORT=3293 npm run verify` 전체 통과: lint·TypeScript·Jest 21 suites/93 tests·production build·Playwright 17 tests. 독립 리뷰는 남아 있다.
