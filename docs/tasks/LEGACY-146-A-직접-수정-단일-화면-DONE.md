### A · 직접 수정 단일 화면 — DONE

- 직접 수정 중에는 기존 퀴즈 미리보기를 숨기고 편집 폼만 표시한다.
- 검증: 미리보기 미노출 컴포넌트 테스트의 의도한 실패를 확인한 뒤 작성 컴포넌트 7개와 관련 E2E 1개 통과. Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 80개·build·Playwright 15개). 독립 리뷰는 남아 있다.

