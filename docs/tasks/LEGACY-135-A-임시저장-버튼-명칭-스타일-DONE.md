### A 임시저장 버튼 명칭·스타일 — DONE

- 개별 저장을 임시저장으로 바꾸고 바로 공개와 동일한 버튼 스타일을 적용한다. PENDING 저장 동작은 유지한다.
- Node 22.23.3 `PLAYWRIGHT_PORT=3197 npm run verify` 전체 통과: lint·TypeScript·Jest 80개·build·Playwright 15개. 임시저장·공개·기존 편집 흐름 회귀 확인. 독립 리뷰는 남아 있다.
