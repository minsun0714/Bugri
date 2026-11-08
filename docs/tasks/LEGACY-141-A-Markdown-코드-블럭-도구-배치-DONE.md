### A · Markdown 코드 블럭 도구 배치 — DONE

- 코드 블럭 버튼과 언어 선택기를 본문 입력창과 같은 편집 컨테이너 안에 배치한다.
- 검증: 의도한 E2E 실패를 확인한 뒤 관련 E2E 1개와 Node 22.23.3 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 80개·build·Playwright 15개). 독립 리뷰는 남아 있다.
