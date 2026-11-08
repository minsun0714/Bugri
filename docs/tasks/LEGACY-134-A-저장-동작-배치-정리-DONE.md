### A 저장 동작 배치 정리 — DONE

- 바로 공개와 개별 저장을 같은 줄로 합치고 일괄 저장·저장 개수는 퀴즈 선택 탭 위로 옮긴다.
- 편집 중 JSX 구문 오류를 수정한 뒤 Node 22.23.3 `PLAYWRIGHT_PORT=3197 npm run verify` 전체 통과: lint·TypeScript·Jest 80개·build·Playwright 15개. 개별/일괄 저장·공개·탭 이동 회귀 확인. 독립 리뷰는 남아 있다.

