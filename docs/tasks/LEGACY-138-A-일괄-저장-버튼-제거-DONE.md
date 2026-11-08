### A 일괄 저장 버튼 제거 — DONE

- 남은 후보 모두 저장 버튼을 제거하고 현재 퀴즈별 임시저장·바로 공개만 제공한다. 기존 일괄 저장 API는 유지한다.
- Node 22.23.3 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 80개·build·Playwright 15개. 퀴즈별 임시저장·공개와 일괄 저장 버튼 미노출을 검증했다. 독립 리뷰는 남아 있다.

