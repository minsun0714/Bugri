### A · LLM 대화 스크롤 영역 분리 — DONE

- 모달과 채팅 헤더·입력창은 고정하고 대화 메시지 본문만 스크롤한다.
- 검증: 스크롤 소유권 E2E의 의도한 실패를 확인한 뒤 작성 컴포넌트 7개와 작성 E2E 10개 통과. Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 80개·build·Playwright 15개). 독립 리뷰는 남아 있다.
