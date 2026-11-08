### A 코드 언어 공통 드롭다운 — DONE

- MarkdownEditor의 네이티브 언어 select를 기존 공통 Dropdown으로 교체한다. 모바일 선택·Escape·포커스·코드 삽입을 검증한다.
- Node 22.23.3 `PLAYWRIGHT_PORT=3197 npm run verify` 전체 통과: lint·TypeScript·Jest 80개·build·Playwright 15개. 390px 모바일에서 언어 선택·Escape 닫기·포커스 복귀·선택 언어 코드 삽입을 확인했다. 독립 리뷰는 남아 있다.
