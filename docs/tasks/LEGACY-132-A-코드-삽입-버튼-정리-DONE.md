### A 코드 삽입 버튼 정리 — DONE

- 공통 MarkdownEditor의 코드 삽입 버튼을 오른쪽 테두리 버튼 “+ 코드 블럭”으로 표시하고 제목·강조·목록 안내를 제거한다.
- Node 22.23.3 `PLAYWRIGHT_PORT=3197 npm run verify` 전체 통과: lint·TypeScript·Jest 80개·build·Playwright 15개. 코드 블록 삽입과 작성/미리보기 회귀 확인. 독립 리뷰는 남아 있다.
