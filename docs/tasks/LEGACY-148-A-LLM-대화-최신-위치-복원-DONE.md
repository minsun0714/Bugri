### A · LLM 대화 최신 위치 복원 — DONE

- LLM 대화에 진입하거나 새 응답이 추가되면 대화 본문을 맨 아래 최신 메시지 위치로 이동한다.
- 검증: 재진입 스크롤 위치 컴포넌트 테스트의 의도한 실패를 확인한 뒤 작성 컴포넌트 8개 통과. Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 81개·build·Playwright 15개). 독립 리뷰는 남아 있다.

